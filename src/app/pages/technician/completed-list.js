/* Parsec · pages/technician · completed-list.js
   Completed ROs kept per person (14.7 C): STATE.tcDone remembers the ROs a technician finished work on, even after transfer or delete.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v147DoneList v147Truck v147Rec v147Scan V147C (4 functions, 1 constant)
   state      punches ros tcDone
   uses       access/ data/ kit/ pages/triage/ pages/warranty/ ro/ state/
*/
/* ============================== Parsec 14.7 (C) — Completed ROs kept per person · the lunch reminder ==============================
   · STATE.tcDone: one line per operation someone completed — the RO, its customer, truck and unit, the operation, their hours,
     when. Written on every save (and just before an RO is deleted), filled in once from the punches already there. The
     Technician page's Completed section reads it, so an RO stays there after it's transferred or deleted.
   · Lunch · 1 hour (and the 30-minute lunch): no clock-in by itself — when the time's up, a card on every page:
     "Lunch is over" · Clock in now · 5 more minutes. */
var V147C = { scanAt: 0, snz: {}, el: null, t: 0 };
function v147DoneList(){ if(!Array.isArray(STATE.tcDone)) STATE.tcDone = []; return STATE.tcDone; }
function v147Truck(ro){ var t = ""; try{ t = truckLine(ro); }catch(e){} if(!t || t === "this truck") t = [ro.year, ro.make, ro.model].filter(Boolean).join(" "); return t || ""; }
/* the operations of one RO that are complete: who completed each (the punch that stopped as Complete, else the last punch, else the RO's tech) */
function v147Rec(ro, P, full){
  if(!ro || ro.shop || ro.id === SHOP_RO_ID) return 0;
  var L = v147DoneList(), n = 0, cut = Date.now() - 120 * 864e5, no = "";
  try{ no = tgNum(ro); }catch(e){ no = "RO " + (ro.roNumber || ""); }
  (ro.operations || []).forEach(function(op, i){
    if(!op || op.declined) return; var done = false; try{ done = opDoneNow(op); }catch(e){} if(!done) return;
    var ps = (P ? (P[op.id] || []) : (STATE.punches || []).filter(function(p){ return p.opId === op.id; })).slice().sort(function(a, b){ return new Date(a.start) - new Date(b.start); });
    var cp = ps.filter(function(p){ return p.stop && /^Complete/.test(p.stopReason || ""); }).pop(), lp = ps.filter(function(p){ return p.stop; }).pop();
    var who = (cp && punchWho(cp)) || (lp && punchWho(lp)) || ro.assignedTech || ""; if(!who) return;
    var at = (cp && cp.stop) || (op.jobStatus && /^Complete/.test(op.jobStatus.status || "") && op.jobStatus.setAt) || (lp && lp.stop) || ro.dateClosed || nowIso();
    var k = ro.id + "|" + op.id + "|" + who, e = null; for(var j = 0; j < L.length; j++){ if(L[j].k === k){ e = L[j]; break; } }
    if(!e && +new Date(at) < cut) return;                       /* the first fill-in goes back 120 days */
    var ms = 0; ps.forEach(function(p){ if(techSame(punchWho(p), who)) ms += Math.max(0, (p.stop ? +new Date(p.stop) : Date.now()) - new Date(p.start)); });
    var snap = { k: k, tech: who, roId: ro.id, opId: op.id, opn: i + 1, hrs: Math.round(ms / 36e3) / 100, q: +op.quoted || 0, at: at };   /* Parsec 16: the rest is read from the RO */
    V160B.cmp[op.id] = op.complaint || "Operation"; if(full) v160DoneFat(snap, ro, op);   /* the RO is about to go: keep the snapshot */
    if(!e){ L.push(snap); n++; }
    else { for(var f in snap) e[f] = snap[f]; if(!full) V160_FAT.forEach(function(f){ delete e[f]; }); }   /* keep it current while the RO is here */
  });
  if(full) L.forEach(function(e){ if(e && e.roId === ro.id && e.cust == null && e.no == null) v160DoneFat(e, ro, (ro.operations || []).filter(function(o){ return o && o.id === e.opId; })[0]); });
  return n;
}
function v147Scan(force){
  var now = Date.now(); if(!force && now - V147C.scanAt < 1500) return 0; V147C.scanAt = now;
  if(typeof STATE === "undefined" || !STATE || !Array.isArray(STATE.ros)) return 0;
  var P = {}; (STATE.punches || []).forEach(function(p){ (P[p.opId] || (P[p.opId] = [])).push(p); });
  var n = 0; STATE.ros.forEach(function(ro){ try{ n += v147Rec(ro, P); }catch(e){} });
  try{ v160DoneKeep(); }catch(e){}
  return n;
}
