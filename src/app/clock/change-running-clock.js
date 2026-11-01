/* Parsec · clock · change-running-clock.js
   Change a clock while it runs (12.7 e): move the running punch to another job, stop it at a typed time, the shift's limits.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   rcWho rcIs rcShOwn rcFirst rcOpLabel rcDefReason rcTargets rcMove rcStopAt rcShiftLimits rcShiftIn rcAtHM … (15 functions)
   state      punches ros
   uses       access/ data/ kit/ pages/ pages/warranty/ ro/ shell/ state/
   at load    on document keydown
*/
/* ============================== Parsec 12.7 · change a clock while it runs (b9/v127e.js) ==============================
   Its start (the Time tabs already had it), stop it at an earlier time and say why, its reason, move it to another
   operation (keeps the start), and the day clock's start. The RO page's and the Technician page's Time tabs, the
   Time Log and the clock pop-over off the sidebar all call these; each change is one undo and is marked edited. */
/* whose — Parsec 12.7's per-person clocks say whose a punch or a day clock is (punchOwner, shiftOwner, sameOwner); without them, punchWho */
function rcWho(p){ var n = ""; try{ if(typeof punchOwner === "function") n = punchOwner(p); }catch(e){} return n || punchWho(p) || ""; }
function rcIs(a, b){ try{ if(typeof sameOwner === "function") return sameOwner(a, b); }catch(e){} return techSame(a, b); }
function rcShOwn(sh, x, isShift){
  try{ if(typeof sameOwner === "function" && typeof shiftOwner === "function" && typeof punchOwner === "function") return sameOwner(shiftOwner(sh), isShift ? shiftOwner(x) : punchOwner(x)); }catch(e){}
  var a = sh && sh.by, b = isShift ? x && x.by : x && punchWho(x);
  return !a || !b || techSame(a, b);
}
function rcFirst(n){ return String(n || "").trim().split(/\s+/)[0] || ""; }
function rcOpLabel(roId, opId){
  var ro = getRO(roId), op = ro ? getOp(roId, opId) : null;
  if(!ro || ro.shop || ro.id === SHOP_RO_ID) return "shop time" + (op && op.complaint ? " · " + op.complaint : "");
  var n = op ? ro.operations.indexOf(op) + 1 : 0;
  return roLabel(ro) + (n ? " · Op " + n : "");
}
function rcDefReason(op){ var jt = ""; try{ jt = opJobType(op); }catch(e){} return jt === "DIAG" ? "Diagnosing" : jt === "PM" ? "Inspecting" : "Repairing"; }
/* where a running clock can go: this RO's other operations, the person's other open ROs, shop time */
function rcTargets(p){
  if(!p) return [];
  var who = rcWho(p), me = who && rcIs(who, punchByName()), ro = getRO(p.roId), G = [];
  var live = function(r){ return (r.operations || []).filter(function(o){ return o && !o.declined && !opDoneNow(o); }); };
  var item = function(r, o){ return { roId: r.id, opId: o.id, n: (r.operations || []).indexOf(o) + 1, cm: o.complaint || "Operation", no: r.id === SHOP_RO_ID || r.shop ? "Shop" : roLabel(r), cust: r.customerName || "" }; };
  if(ro && ro.id !== SHOP_RO_ID && !ro.shop){ var a = live(ro).filter(function(o){ return o.id !== p.opId; }).map(function(o){ return item(ro, o); }); if(a.length) G.push({ k: "ro", t: "This RO", L: a }); }
  var last = {};
  STATE.punches.forEach(function(x){ if(who && rcIs(rcWho(x), who)){ var t = +new Date(x.start); if(!(last[x.roId] >= t)) last[x.roId] = t; } });
  var mine = (STATE.ros || []).filter(function(r){ if(!r || r.id === p.roId || r.id === SHOP_RO_ID || r.shop || r.dateClosed) return false; var done = false; try{ done = roIsDone(r); }catch(e){} if(done) return false;
    return !!who && (rcIs(r.assignedTech, who) || last[r.id] != null); });
  mine.sort(function(x, y){ return (last[y.id] || 0) - (last[x.id] || 0); });
  var oth = []; mine.slice(0, 8).forEach(function(r){ live(r).forEach(function(o){ oth.push(item(r, o)); }); });
  if(oth.length) G.push({ k: "other", t: me || !who ? "Your other ROs" : rcFirst(who) + "’s other ROs", L: oth.slice(0, 18) });
  var sr = null; try{ sr = shopRo(); }catch(e){}
  if(sr){ var sh = (sr.operations || []).filter(function(o){ return o && o.id !== p.opId && !o.declined; }).map(function(o){ return item(sr, o); }); if(sh.length) G.push({ k: "shop", t: "Shop time", L: sh }); }
  return G;
}
/* move the running clock to another operation — the start stays; nothing was credited yet, so nothing moves in burnt */
function rcMove(p, roId, opId, o){
  o = o || {};
  if(!p || p.stop) return { ok: false, msg: "Only a running clock moves — this one has stopped." };
  if(p.roId === roId && p.opId === opId) return { ok: false, msg: "It’s already on that operation." };
  var ro = getRO(roId), op = ro ? getOp(roId, opId) : null;
  if(!op || op.declined) return { ok: false, msg: "That operation can’t be punched." };
  var shop = roId === SHOP_RO_ID || !!ro.shop;
  var sr = shop ? op.complaint : (isShopPunch(p) || START_REASONS.indexOf(p.startReason) < 0 ? rcDefReason(op) : p.startReason);
  var lk = shop ? null : opPartLock(op, sr);
  if(lk) return { ok: false, msg: "Can’t move it there — " + (lk.description || lk.partNumber || "a part") + " isn’t in hand for " + sr.toLowerCase() + "." };
  if(o.check) return { ok: true, label: rcOpLabel(roId, opId) };
  if(!o.noUndo) pushUndo("move the running clock");
  var from = { roId: p.roId, opId: p.opId };
  if(!p.edited){ p.edited = true; p.originalStart = p.start; p.originalStop = p.stop; }
  if(!p.movedFrom) p.movedFrom = from;
  if(p.movedFrom.roId === roId && p.movedFrom.opId === opId) delete p.movedFrom;   /* back where it began */
  p.movedAt = nowIso(); p.editedAt = nowIso();
  if(o.by){ p.editBy = o.by; p.editWhy = o.why || p.editWhy || ""; }
  p.roId = roId; p.opId = opId; p.startReason = sr;
  try{ markStatusFlip(getRO(from.roId)); markStatusFlip(ro); }catch(e){}
  scheduleSave(true);
  return { ok: true, from: from, label: rcOpLabel(roId, opId) };
}
/* stop a running clock at a time already past — it asks why first, and Complete still needs the parts in */
function rcStopAt(p, ms, reason, o){
  o = o || {};
  if(!p || p.stop) return { ok: false, msg: "That clock has already stopped." };
  var st = +new Date(p.start);
  if(!(ms > st)) return { ok: false, msg: "The stop has to come after the start, " + fmtTime(p.start) + "." };
  if(ms > Date.now() + 30000) return { ok: false, msg: "A stop time can’t be in the future." };
  if(!reason) return { ok: false, msg: "Pick why it stopped." };
  var r = reason, gaps = null, op = null; try{ op = getOp(p.roId, p.opId); }catch(e){}
  if(/^Complete/.test(r) && op && typeof opCompleteGaps === "function"){ var g = v141GapsAsk(op); if(g.length){ gaps = g; r = "Hold Tech"; } }
  var res = editPunchCommit(p, { start: p.start, stop: new Date(Math.min(ms, Date.now())).toISOString(), startReason: p.startReason, stopReason: r, opId: p.opId, notes: p.notes });
  if(!res || !res.ok) return res || { ok: false, msg: "Couldn’t stop it then." };
  if(o.by){ p.editBy = o.by; p.editWhy = o.why || ""; }
  return { ok: true, reason: r, gaps: gaps, gapText: gaps ? gaps.map(function(x){ return x.t; }).join(" · ") : "" };
}
/* the day clock: when it can start — after the clock out before it, by the first punch on it, never in the future */
function rcShiftLimits(sh){
  var day = localDay(sh.in), d0 = new Date(day + "T00:00:00").getTime(), a = +new Date(sh.in);
  var outs = shiftList().filter(function(x){ return x !== sh && x.out && localDay(x.in) === day && +new Date(x.out) <= a + 60000 && rcShOwn(sh, x, true); }).map(function(x){ return +new Date(x.out); });
  var lo = outs.length ? Math.max.apply(null, outs) : d0;
  var ps = STATE.punches.filter(function(p){ var s = +new Date(p.start); return s >= lo - 60000 && localDay(p.start) === day && rcShOwn(sh, p); }).sort(function(x, y){ return new Date(x.start) - new Date(y.start); });
  return { lo: lo, back: outs.length > 0, hi: ps.length ? +new Date(ps[0].start) : Date.now(), first: ps[0] || null };
}
function rcShiftIn(sh, ms, o){
  o = o || {};
  if(!sh || sh.out) return { ok: false, msg: "That day clock isn’t running." };
  if(ms == null || isNaN(ms)) return { ok: false, msg: "Type a time like 07:00." };
  if(ms > Date.now() + 30000) return { ok: false, msg: "A clock-in can’t be in the future." };
  var L = rcShiftLimits(sh);
  if(L.first && ms > L.hi) return { ok: false, msg: "That’s after the first punch — " + rcOpLabel(L.first.roId, L.first.opId) + " started " + fmtTime(L.first.start) + ". Clock in at " + fmtTime(L.first.start) + " or earlier, or move that punch first." };
  if(ms < L.lo) return { ok: false, msg: L.back ? "That’s before the clock out before it, " + fmtTime(new Date(L.lo).toISOString()) + "." : "Pick a time on the same day." };
  if(Math.floor(ms / 60000) === Math.floor(+new Date(sh.in) / 60000)) return { ok: true, same: true };
  if(!o.noUndo) pushUndo("change the clock in");
  if(!sh.edited){ sh.edited = true; sh.originalIn = sh.in; }
  sh.in = new Date(ms).toISOString(); sh.editedAt = nowIso();
  if(o.by){ sh.editBy = o.by; sh.editWhy = o.why || ""; }
  if(sh.originalIn && Math.floor(+new Date(sh.originalIn) / 60000) === Math.floor(ms / 60000)){ delete sh.edited; delete sh.originalIn; delete sh.editedAt; delete sh.editBy; delete sh.editWhy; }
  scheduleSave(true);
  return { ok: true, was: sh.originalIn || null };
}
function rcAtHM(baseIso, hhmm){ var m = /^(\d{1,2}):(\d{2})/.exec(String(hhmm || "").trim()); if(!m) return null; var d = new Date(baseIso); if(isNaN(d)) return null; d.setHours(+m[1], +m[2], 0, 0); return d.getTime(); }
/* the clock pop-over off the sidebar: “On the clock since 07:02” gets a pencil */
function rcPxPen(sh){ return sh ? '<button class="pxp-pen' + (UI.pxShin ? ' on' : '') + '" data-action="px-shin" title="Change when you clocked in" aria-label="Change when you clocked in">' + pxI("pencil", 12) + '</button>' : ''; }
function rcPxShin(sh){
  if(!sh || !UI.pxShin) return '';
  var L = rcShiftLimits(sh);
  return '<div class="pxp-shin"><span class="t">Clocked in at</span><input class="mono" type="time" data-px-shin value="' + fmtTime(sh.in) + '" aria-label="Clocked in at">'
    + '<button class="px-btn sm pri" data-action="px-shin-go">' + pxI("check", 13) + 'Save</button><button class="px-btn sm ghost" data-action="px-shin-x">Cancel</button>'
    + '<small>' + (L.first ? 'By ' + fmtTime(L.first.start) + ', when your first punch started' : 'Not later than now') + (sh.originalIn ? ' · was ' + fmtTime(sh.originalIn) : '') + '</small></div>';
}
function rcPxAct(a){
  if(a === "px-shin"){ UI.pxShin = !UI.pxShin; render(); if(UI.pxShin) setTimeout(function(){ var i = document.querySelector("[data-px-shin]"); if(i){ i.focus(); try{ i.select(); }catch(e){} } }, 30); return true; }
  if(a === "px-shin-x"){ UI.pxShin = false; render(); return true; }
  if(a === "px-shin-go"){
    var sh = openShift(), i = document.querySelector("[data-px-shin]"), v = i ? i.value : "";
    if(!sh){ UI.pxShin = false; render(); return true; }
    var ms = rcAtHM(sh.in, v), r = rcShiftIn(sh, ms);
    if(!r.ok){ pushToast(r.msg); return true; }
    UI.pxShin = false; render();
    if(!r.same) pushToast("Clocked in at " + fmtTime(sh.in) + (r.was ? " — was " + fmtTime(r.was) : "") + ". " + fmtHM(todayShiftMs()) + " on the clock today.", true);
    return true;
  }
  return false;
}
document.addEventListener("keydown", function(e){
  var t = e.target; if(!t || !t.matches || !t.matches("[data-px-shin]")) return;
  if(e.key === "Enter"){ e.preventDefault(); e.stopPropagation(); rcPxAct("px-shin-go"); }
  else if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); rcPxAct("px-shin-x"); }
}, true);
