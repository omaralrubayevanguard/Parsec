/* Parsec · clock · quick-time-adjust.js
   Quick time adjust for a selected punch: snap, nudge, trim to neighbours, undo.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   segBounds segApply segTrimHoles segTrimNeighbours segSnap segNudge undoDropLast segFocusSel SEG_SNAP SEG_MIN SEG_DRAG SEG_SWALLOW (8 functions, 4 constants)
   state      holes punches
   uses       data/ kit/ shell/ state/
   at load    on document pointerdown · on document pointermove · on document pointerup · on document click · on document keydown · on document mouseover
*/
/* ---------- quick time adjust for a selected punch ---------- */
var SEG_SNAP = 5, SEG_MIN = 60000;
function segBounds(p){
  var st = new Date(p.start).getTime(), lo = -Infinity, hi = Infinity;
  STATE.punches.forEach(function(x){
    if(x.id === p.id) return;
    var xs = new Date(x.start).getTime(), xe = x.stop ? new Date(x.stop).getTime() : Date.now();
    if(xs < st) lo = Math.max(lo, xe); else hi = Math.min(hi, xs);
  });
  if(!p.stop) hi = Math.min(hi, Date.now());
  return { lo: lo, hi: hi };
}
/* Apply new start/stop (ms) to a punch, held between its neighbours. No undo push here. */
function segApply(p, ns, ne, noTrim){
  var bd = segBounds(p);
  ns = Math.max(bd.lo, ns);
  if(p.stop){ ne = Math.min(bd.hi, ne); if(ne - ns < SEG_MIN){ return false; } }
  else { if(ns > Date.now() - SEG_MIN) return false; }
  if(!p.edited){ p.edited = true; p.originalStart = p.start; p.originalStop = p.stop; }
  p.editedAt = nowIso();
  p.start = new Date(ns).toISOString();
  if(p.stop) p.stop = new Date(ne).toISOString();
  if(!noTrim) segTrimHoles(ns, p.stop ? ne : Date.now());
  scheduleSave(true);
  return true;
}
/* A punch that now covers part of an empty block takes that time out of the block. */
function segTrimHoles(from, to){
  if(!STATE.holes || !STATE.holes.length) return;
  var out = [];
  STATE.holes.forEach(function(hh){
    var a = new Date(hh.start).getTime(), b = new Date(hh.stop).getTime();
    if(b <= from || a >= to){ out.push(hh); return; }
    if(a < from) out.push(Object.assign({}, hh, { id: uid("hl"), stop: new Date(from).toISOString() }));
    if(b > to) out.push(Object.assign({}, hh, { id: uid("hl"), start: new Date(to).toISOString() }));
  });
  STATE.holes = out;
}
/* moving a start earlier (or a stop later) into the punch next to it used to be refused with
   "overlaps a neighbouring punch". Now that neighbour gives the time up: its stop (or start) moves to
   the new edge, as long as it keeps a minute and no third punch is in the way. */
function segTrimNeighbours(tp, s1, e1){
  var st = new Date(tp.start).getTime(), en = tp.stop ? new Date(tp.stop).getTime() : null, now = Date.now();
  var lows = [], highs = [];
  STATE.punches.forEach(function(x){
    if(x.id === tp.id) return;
    var xs = new Date(x.start).getTime(), xe = x.stop ? new Date(x.stop).getTime() : now;
    if(xs < st) lows.push({ p: x, s: xs, e: xe }); else highs.push({ p: x, s: xs, e: xe });
  });
  lows.sort(function(a, b){ return b.e - a.e; }); highs.sort(function(a, b){ return a.s - b.s; });
  var mark = function(x){ if(!x.edited){ x.edited = true; x.originalStart = x.start; x.originalStop = x.stop; } x.editedAt = nowIso(); };
  var did = [];
  var pv = lows[0];
  if(s1 < st && pv && s1 < pv.e && pv.p.stop && s1 - pv.s >= SEG_MIN && s1 >= (lows[1] ? lows[1].e : -Infinity)){
    mark(pv.p); pv.p.stop = new Date(s1).toISOString(); did.push(pv.p);
  }
  var nx = highs[0];
  if(en !== null && e1 !== null && e1 > en && nx && e1 > nx.s && e1 <= (highs[1] ? highs[1].s : Infinity) && (nx.p.stop ? nx.e - e1 >= SEG_MIN : e1 <= now - SEG_MIN)){
    mark(nx.p); nx.p.start = new Date(e1).toISOString(); did.push(nx.p);
  }
  return did;
}
function segSnap(ms){ var u = SEG_SNAP*60000; return Math.round(ms/u)*u; }
function segNudge(p, edge, mins){
  var d = mins*60000, s0 = new Date(p.start).getTime(), e0 = p.stop ? new Date(p.stop).getTime() : null, ok;
  pushUndo("adjust punch");
  if(edge === "s") ok = segApply(p, s0 + d, e0);
  else if(edge === "e") ok = p.stop ? segApply(p, s0, e0 + d) : false;
  else {
    if(!p.stop) ok = false;
    else {
      var bd = segBounds(p), len = e0 - s0, ns = Math.max(bd.lo, Math.min(bd.hi - len, s0 + d));
      ok = segApply(p, ns, ns + len);
    }
  }
  UI.segMsg = ok ? ((edge==="s"?"Start ":edge==="e"?"Stop ":"Moved ")+(mins>0?"+":"−")+Math.abs(mins)+" min · now "+fmtTime(p.start)+" – "+(p.stop?fmtTime(p.stop):"running")) : "Can't go further — it would overlap the next punch or go under a minute.";
  if(!ok) undoDropLast();
}
function undoDropLast(){ try{ if(typeof UNDO !== "undefined" && UNDO.length) UNDO.pop(); }catch(e){} }
function segFocusSel(){
  setTimeout(function(){ var b = document.querySelector(".blk-punch.sel"); if(b) b.focus({ preventScroll: true }); }, 0);
}

/* drag the chevron handles: the move is measured against the bar's scale when the drag began */
var SEG_DRAG = null;
document.addEventListener("pointerdown", function(e){
  var hd = e.target.closest && e.target.closest(".seg-hd");
  if(!hd) return;
  var blk = hd.closest(".blk-punch"), seg = hd.closest(".seg");
  var p = blk && STATE.punches.filter(function(x){ return x.id === blk.dataset.punch; })[0];
  if(!p || !seg) return;
  e.preventDefault(); e.stopPropagation();
  pushUndo("adjust punch");
  SEG_DRAG = { p: p, edge: hd.dataset.edge, x0: e.clientX, w: seg.getBoundingClientRect().width, tt: +seg.dataset.tt,
               s0: new Date(p.start).getTime(), e0: p.stop ? new Date(p.stop).getTime() : null, moved: false, last: null,
               nb: STATE.punches.filter(function(x){ return x.id !== p.id; }).map(function(x){ return { x: x, s: x.start, e: x.stop, ed: x.edited, os: x.originalStart, oe: x.originalStop, ea: x.editedAt }; }) };
  document.documentElement.classList.add("seg-dragging");
}, true);
document.addEventListener("pointermove", function(e){
  if(!SEG_DRAG) return;
  var D = SEG_DRAG, dt = (e.clientX - D.x0) / D.w * D.tt;
  var ns = D.s0, ne = D.e0;
  if(D.edge === "s") ns = segSnap(D.s0 + dt); else ne = segSnap(D.e0 + dt);
  var key = ns + ":" + ne;
  if(key === D.last) return;
  D.last = key;
  var p = D.p;
  /* restart from the times at grab, so the clamp never drifts */
  p.start = new Date(D.s0).toISOString(); if(D.e0 !== null) p.stop = new Date(D.e0).toISOString();
  D.nb.forEach(function(n){ if(n.x.start !== n.s || n.x.stop !== n.e){ n.x.start = n.s; n.x.stop = n.e; n.x.edited = n.ed; n.x.originalStart = n.os; n.x.originalStop = n.oe; n.x.editedAt = n.ea; } });
  if((D.edge === "s" ? ns : ne) !== null) segTrimNeighbours(p, D.edge === "s" ? ns : D.s0, D.edge === "s" ? D.e0 : ne);
  if(D.edge === "s"){ var bd = segBounds(p); ns = Math.max(bd.lo, Math.min(ns, (ne !== null ? ne : Date.now()) - SEG_MIN)); }
  else { var bd2 = segBounds(p); ne = Math.min(bd2.hi, Math.max(ne, ns + SEG_MIN)); }
  if(segApply(p, ns, ne, true)){ D.moved = true; UI.segMsg = "Dragging · "+fmtTime(p.start)+" – "+(p.stop?fmtTime(p.stop):"running"); }
  if(!D.raf){ D.raf = requestAnimationFrame(function(){ D.raf = 0; render(); }); }
});
document.addEventListener("pointerup", function(){
  if(!SEG_DRAG) return;
  var D = SEG_DRAG; SEG_DRAG = null;
  document.documentElement.classList.remove("seg-dragging");
  if(!D.moved){ undoDropLast(); D.nb.forEach(function(n){ n.x.start = n.s; n.x.stop = n.e; n.x.edited = n.ed; n.x.originalStart = n.os; n.x.originalStop = n.oe; n.x.editedAt = n.ea; }); }
  else segTrimHoles(new Date(D.p.start).getTime(), D.p.stop ? new Date(D.p.stop).getTime() : Date.now());
  UI.segMsg = D.moved ? ((D.edge==="s"?"Start":"Stop")+" set to "+fmtTime(D.edge==="s"?D.p.start:D.p.stop)+".") : UI.segMsg;
  SEG_SWALLOW = Date.now();
  render(); segFocusSel();
});
var SEG_SWALLOW = 0;
document.addEventListener("click", function(e){
  if(Date.now() - SEG_SWALLOW < 400 && e.target.closest && e.target.closest(".seg")){ e.stopPropagation(); e.preventDefault(); }
}, true);

/* keyboard: arrows on the selected block or inside its panel */
document.addEventListener("keydown", function(e){
  if(!UI.segPick || UI.modal) return;
  var t = (e.composedPath && e.composedPath()[0]) || e.target;
  if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); UI.segPick = null; UI.segMsg = ""; render(); return; }
  if(!t.closest || !(t.closest(".blk-punch.sel") || t.closest(".segedit"))) return;
  if(/^(input|textarea|select)$/i.test(t.tagName || "")) return;
  if(e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  var p = STATE.punches.filter(function(x){ return x.id === UI.segPick; })[0]; if(!p) return;
  e.preventDefault(); e.stopPropagation();
  var dir = e.key === "ArrowRight" ? 1 : -1;
  if(e.altKey) segNudge(p, e.shiftKey ? "s" : "e", dir*5);
  else segNudge(p, "m", dir*(e.shiftKey ? 15 : 5));
  var inPanel = !!t.closest(".segedit");
  render(); if(!inPanel) segFocusSel();
}, true);

/* hovering an air block unrolls its note flag */
document.addEventListener("mouseover", function(e){
  var t = e.target && e.target.closest ? e.target.closest('.seg-block[data-action="seg-air"], .air-flag') : null;
  document.querySelectorAll(".air-flag.open").forEach(function(f){ if(!t || f.dataset.at !== t.dataset.at) f.classList.remove("open"); });
  if(!t) return;
  var w = t.closest(".segwrap"); if(!w) return;
  var f = w.querySelector('.air-flag[data-at="'+t.dataset.at+'"]'); if(f) f.classList.add("open");
});
