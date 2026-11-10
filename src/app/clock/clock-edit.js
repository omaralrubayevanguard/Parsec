/* Parsec · clock · clock-edit.js
   Change a day clock’s clock in or clock out on any day (17.5): its limits, the punches a new time leaves outside (trim or block), the change marked edited, deleting a clock segment.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ceOwn ceDayMs ceLimits ceOutside ceLbl ceCheck ceSet ceDelete (8 functions)
   state      punches
   uses       access/ data/ kit/ pages/ ro/ state/
*/
/* ============================== Parsec 17.5 · change a day clock's clock in or clock out, any day ==============================
   The Time Log's clock rows call these: the limits an edge can move in, the punches a new time would leave outside
   the clock (trimmed in the same step, or blocking it), the change itself (one undo, marked edited with the time
   before, who and why), and deleting a clock segment. Times are milliseconds here. */
function ceOwn(sh, x){ return sameOwner(shiftOwner(x), shiftOwner(sh)); }
function ceDayMs(day, end){ return new Date(day + (end ? "T23:59:00" : "T00:00:00")).getTime(); }
/* where an edge can go: never past the other edge, the segments either side, the day, or now */
function ceLimits(sh, edge){
  var day = localDay(sh.in), a = +new Date(sh.in), b = sh.out ? +new Date(sh.out) : null, now = Date.now();
  var mine = shiftList().filter(function(x){ return x !== sh && localDay(x.in) === day && ceOwn(sh, x); });
  if(edge === "in"){
    var outs = mine.filter(function(x){ return x.out && +new Date(x.out) <= a + 60000; }).map(function(x){ return +new Date(x.out); });
    return { lo: outs.length ? Math.max.apply(null, outs) : ceDayMs(day), hi: Math.min(b != null ? b - 60000 : now, now) };
  }
  var ins = mine.filter(function(x){ return +new Date(x.in) >= (b != null ? b : a) - 60000; }).map(function(x){ return +new Date(x.in); });
  return { lo: a + 60000, hi: Math.min(ins.length ? Math.min.apply(null, ins) : ceDayMs(day, true), now) };
}
/* the punches inside the segment that a new time would leave outside it: trim = can be cut to the new time, gone = can't */
function ceOutside(sh, edge, ms){
  var a = +new Date(sh.in), b = sh.out ? +new Date(sh.out) : Date.now(), R = { trim: [], gone: [] };
  STATE.punches.forEach(function(p){
    if(!p || !p.start || !sameOwner(punchOwner(p), shiftOwner(sh))) return;
    var s = +new Date(p.start), e = p.stop ? +new Date(p.stop) : Date.now();
    if(s < a - 60000 || s > b + 60000) return;
    if(edge === "in" && s < ms){ if(e > ms + 60000) R.trim.push({ p: p, f: "start" }); else R.gone.push(p); }
    if(edge === "out" && e > ms){ if(!p.stop) R.gone.push(p); else if(s < ms - 60000) R.trim.push({ p: p, f: "stop" }); else R.gone.push(p); }
  });
  return R;
}
function ceLbl(p){ try{ return p.roId === SHOP_RO_ID ? "Shop time" : roLabel(getRO(p.roId)); }catch(e){ return "A punch"; } }
function ceCheck(sh, edge, ms){
  if(!sh) return { ok: false, msg: "That day clock is gone." };
  if(edge === "out" && !sh.out) return { ok: false, msg: "That day clock is still running — clock out first." };
  if(ms == null || isNaN(ms)) return { ok: false, msg: "Type a time like 07:00." };
  var L = ceLimits(sh, edge), t = function(v){ return fmtTime(new Date(v).toISOString()); };
  if(ms > Date.now() + 30000) return { ok: false, msg: (edge === "in" ? "A clock in" : "A clock out") + " can’t be in the future." };
  if(ms < L.lo) return { ok: false, msg: edge === "in" ? "That’s before " + (L.lo === ceDayMs(localDay(sh.in)) ? "the day starts." : "the clock out before it, " + t(L.lo) + ".") : "Clock out has to come after the clock in, " + t(+new Date(sh.in)) + "." };
  if(ms > L.hi) return { ok: false, msg: edge === "in" ? "Clock in has to come before the clock out, " + t(+new Date(sh.out || Date.now())) + "." : "That’s after the next clock in, " + t(L.hi) + "." };
  var O = ceOutside(sh, edge, ms);
  if(O.gone.length) return { ok: false, out: O, msg: ceLbl(O.gone[0]) + " " + t(+new Date(O.gone[0].start)) + "–" + (O.gone[0].stop ? t(+new Date(O.gone[0].stop)) : "now") + " would be off the clock — " + (O.gone[0].stop ? "move or delete it first." : "stop it first.") };
  return { ok: true, out: O };
}
/* the change: o = { by, why, trim, noUndo } */
function ceSet(sh, edge, ms, o){
  o = o || {}; ms = Math.floor(ms / 60000) * 60000;
  var C = ceCheck(sh, edge, ms); if(!C.ok) return C;
  if(Math.floor(+new Date(sh[edge]) / 60000) === ms / 60000) return { ok: true, same: true };
  if(C.out.trim.length && !o.trim) return { ok: false, out: C.out, msg: ceLbl(C.out.trim[0].p) + " runs past the new time — trim it, or pick another time." };
  if(!o.noUndo) pushUndo(edge === "in" ? "change the clock in" : "change the clock out");
  var iso = new Date(ms).toISOString(), key = edge === "in" ? "originalIn" : "originalOut", was = sh[key] || sh[edge];
  C.out.trim.forEach(function(x){ var p = x.p; if(!p.edited){ p.edited = true; p.originalStart = p.start; p.originalStop = p.stop; } p[x.f] = iso; if(o.by){ p.editBy = o.by; p.editWhy = o.why || ""; } });
  if(!sh[key]) sh[key] = sh[edge];
  sh[edge] = iso; sh.edited = true; sh.editedAt = nowIso(); if(o.by){ sh.editBy = o.by; sh.editWhy = o.why || ""; }
  if(Math.floor(+new Date(sh[key]) / 60000) === ms / 60000) delete sh[key];
  if(!sh.originalIn && !sh.originalOut){ delete sh.edited; delete sh.editedAt; delete sh.editBy; delete sh.editWhy; }
  try{ audit("clock", (o.by && !sameOwner(o.by, shiftOwner(sh)) ? shiftOwner(sh) + "’s " : "") + (edge === "in" ? "Clock in " : "Clock out ") + fmtDate(sh.in) + " " + fmtTime(was) + " → " + fmtTime(iso) + (o.why ? " · " + o.why : "") + (C.out.trim.length ? " · " + C.out.trim.length + " punch" + (C.out.trim.length > 1 ? "es" : "") + " trimmed" : "")); }catch(e){}
  scheduleSave(true);
  return { ok: true, was: was, trimmed: C.out.trim.length };
}
/* delete a clock segment; its punches stay and show as off the clock */
function ceDelete(sh, o){
  o = o || {}; var L = shiftList(), i = L.indexOf(sh); if(i < 0) return { ok: false, msg: "That day clock is gone already." };
  if(!sh.out) return { ok: false, msg: "That day clock is still running — clock out first." };
  if(!o.noUndo) pushUndo("delete a clock segment");
  L.splice(i, 1);
  try{ audit("clock", "Deleted the clock segment " + fmtDate(sh.in) + " " + fmtTime(sh.in) + "–" + fmtTime(sh.out) + (o.by && !sameOwner(o.by, shiftOwner(sh)) ? " · " + shiftOwner(sh) : "")); }catch(e){}
  scheduleSave(true);
  return { ok: true };
}
