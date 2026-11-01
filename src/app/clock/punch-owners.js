/* Parsec · clock · punch-owners.js
   Each person keeps their own clocks (12.7): punchOwner / shiftOwner, the running punches of one person, the one-time migration of old punches.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pcNorm sameOwner pcMe punchOwner pcInfer shiftOwner pcMigrate runningPunches runningPunchOfPerson openShiftOf shiftsOfPerson myRunOf … (17 functions, 3 constants)
   state      punches shifts techName
   uses       access/ kit/ ro/ ro-page/ state/
*/
/* ============================== Parsec 12.7 — each person keeps their own clocks ==============================
   Every punch and every day clock belongs to the person who started it (p.by, s.by). Your job clock and your day clock
   are yours: switching who's signed in never stops anyone else's, and starting a job stops only your own running job.
   Me is punchByName(): the person signed in, or this computer's name for the Admin ('' when it has none; a day clock
   the Admin started says "Admin", which is the same person). Older day clocks that never said whose belong to the one
   person whose punches started inside them, else to this computer's name. */
function pcNorm(n){ var s = String(n == null ? "" : n).replace(/\s+/g, " ").trim().toLowerCase(); return s === "admin" ? "" : s; }
function sameOwner(a, b){ var x = pcNorm(a), y = pcNorm(b); if(x === y) return true; if(!x || !y) return false; try{ return techSame(a, b); }catch(e){ return false; } }
function pcMe(){ try{ return String(punchByName() || ""); }catch(e){ return ""; } }
function punchOwner(p){ return (p && p.by) || (STATE && STATE.techName) || ""; }
var PC_IC = {}, PC_ICT = 0, PC_MIG = null;
/* the one person whose punches (the ones that say whose) started inside this day clock, or '' */
function pcInfer(s){
  var now = Date.now(); if(now - PC_ICT > 5000){ PC_IC = {}; PC_ICT = now; }
  var k = s.id + "|" + s.in + "|" + (s.out || "") + "|" + STATE.punches.length; if(k in PC_IC) return PC_IC[k];
  var a = new Date(s.in).getTime() - 60000, b = s.out ? new Date(s.out).getTime() : now, who = null, many = false;
  STATE.punches.forEach(function(p){ if(!p.by || many) return; var x = new Date(p.start).getTime(); if(x < a || x > b) return; if(who === null) who = p.by; else if(!sameOwner(who, p.by)) many = true; });
  return (PC_IC[k] = many ? "" : (who || ""));
}
function shiftOwner(s){ if(!s) return ""; if(s.by) return s.by; return pcInfer(s) || (STATE && STATE.techName) || ""; }
/* once per set of day clocks: an old one that never said whose gets its one owner written on it */
function pcMigrate(){
  var L = STATE && STATE.shifts; if(!Array.isArray(L) || PC_MIG === L) return; PC_MIG = L;
  L.forEach(function(s){ if(s && !s.by){ var o = pcInfer(s); if(o) s.by = o; } });
}
function runningPunches(){ return STATE.punches.filter(function(p){ return !p.stop; }); }
function runningPunchOfPerson(n){ return STATE.punches.filter(function(p){ return !p.stop && sameOwner(punchOwner(p), n); })[0] || null; }
function openShiftOf(n){ pcMigrate(); return shiftList().filter(function(s){ return !s.out && sameOwner(shiftOwner(s), n); })[0] || null; }
function shiftsOfPerson(d, n){ return shiftsForDate(d).filter(function(s){ return sameOwner(shiftOwner(s), n); }); }
/* your running punch on this operation (the RO page's job, or an operation id) */
function myRunOf(job){ var id = job && typeof job === "object" ? job.id : job, me = pcMe(); return STATE.punches.filter(function(p){ return p.opId === id && !p.stop && sameOwner(punchOwner(p), me); })[0] || null; }
function pcClk(t){ try{ return ockClk(new Date(t).getTime()); }catch(e){ return fmtTime(t); } }
function pcName(n){ return pcNorm(n) ? String(n) : "Admin"; }
/* the sign-in screen: every clock that's running, whose it is */
function pcSignInClocks(){
  var R = runningPunches(), L = [], seen = [];
  R.forEach(function(p){
    var w = punchOwner(p), shop = false; try{ shop = isShopPunch(p); }catch(e){}
    seen.push(w);
    L.push('<div class="pxs-clk"><i class="pxr-dot ' + (shop ? "shop" : "job") + '"></i><b>' + esc(pcName(w)) + '</b>' + esc(roTag(getRO(p.roId))) + ' · since ' + esc(pcClk(p.start)) + '</div>');
  });
  pcMigrate();
  shiftList().forEach(function(s){
    if(s.out) return; var w = shiftOwner(s);
    if(seen.some(function(x){ return sameOwner(x, w); })) return; seen.push(w);
    L.push('<div class="pxs-clk"><i class="pxr-dot air"></i><b>' + esc(pcName(w)) + '</b>on the day clock · since ' + esc(pcClk(s.in)) + '</div>');
  });
  if(!L.length) return "";
  return '<div class="pxs-clks" data-key="pxs-clks"><small>' + (L.length === 1 ? "A clock is running" : L.length + " clocks are running") + ' — signing in or out never stops one</small>' + L.join("") + "</div>";
}

function runningPunch(){ return runningPunchOfPerson(pcMe()); }   /* Parsec 12.7: your own running punch */
function allDates(){ var s={}; STATE.punches.forEach(function(p){ s[localDay(p.start)]=1; }); (STATE.shifts||[]).forEach(function(x){ s[localDay(x.in)]=1; }); return Object.keys(s).sort(); }
