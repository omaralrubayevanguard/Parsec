/* Parsec · ro-page · clock-card-actions.js
   What you do on the clock card: hold to stop with a reason, lap / split, fix the start, notes, reopen; ockAuto for lunch and the end of the day (reminders only since Parsec 15).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ockTgt ockOf ockHint ockHoldEnd ockRunP ockStopNow ockLap ockFixSave ockNoteSave ockBarModel ockBarHit ockNaddOpen … (16 functions, 3 constants)
   state      punches
   uses       clock/ data/ pages/ pages/warranty/ ro/ shell/ state/
   at load    on document pointerdown · on document pointerup · on document pointercancel · 2× on document pointermove · on document contextmenu · on document input · on document click · on document keydown
*/
/* ---------- what you do on the card ---------- */
var OCK_H = null, OCK_SKIP = false;   /* OCK_SKIP: the click that ends a press on Stop does nothing (the hold did it) */
function ockTgt(e){ var p = e.composedPath ? e.composedPath() : [e.target], t = p[0] || e.target; return t && t.nodeType === 1 ? t : (t && t.parentElement) || null; }
function ockOf(t){ var c = t && t.closest ? t.closest(".ock[data-op]") : null; return c ? { el: c, ro: c.getAttribute("data-ro"), op: c.getAttribute("data-op"), cb: OCK_CB[c.getAttribute("data-ockp")] || {}, key: c.getAttribute("data-ro") + "|" + c.getAttribute("data-op") } : null; }
function ockHint(c, t, ms){ var st = ockState(c.key); st.hint = ms ? { t: t, until: Date.now() + ms } : null; var hn = c.el.querySelector(".ock-hint"); if(hn) hn.textContent = t; }
function ockHoldEnd(cancel){
  var H = OCK_H; if(!H) return; OCK_H = null; clearTimeout(H.timer);
  var st = ockState(H.c.key); st.holding = false;
  var rg = H.go.closest(".ock-rg"); if(rg) rg.classList.remove("holding");
  if(cancel) ockHint(H.c, "Hold it — 0.7 s", 1400);
}
function ockRunP(c){ var op = null; try{ op = getOp(c.ro, c.op); }catch(e){} return op ? ockModel(op, c.el.getAttribute("data-hr")).mine : null; }
function ockStopNow(c){
  var p = ockRunP(c); if(!p || !c.cb.stop) return;
  var st = ockState(c.key); st.rsn = { pid: p.id, at: Date.now() }; st.hint = null;
  c.cb.stop(c.ro, c.op, p);
  if(!p.stop) st.rsn = null;
}
function ockLap(c){
  var p = ockRunP(c); if(!p){ ockToast("Start the clock to mark a split."); return; }
  var S = ockSplits(p), now = Date.now(), d = (now - (S.length ? S[S.length - 1] : +new Date(p.start))) / 1000, n = S.length + 1;
  ockCommit("split", function(){ p.splits = (Array.isArray(p.splits) ? p.splits : []).concat([ockIso(now)]); ockAddNote(p, "Split " + n + " · " + ockHms(d)); });
  ockToast("Split " + n + " · " + ockHms(d) + " — saved as a note on this punch.");
}
function ockFixSave(c){
  var st = ockState(c.key), d = st.fix ? st.fix.d || 0 : 0; st.fix = null;
  var p = ockRunP(c); if(!p || !d){ ockRedraw(); return; }
  d = Math.min(d, ockFixMax(p)); var ns = +new Date(p.start) - d * 60000, was = ockClk(new Date(p.start));
  ockCommit("fix the start", function(){
    var w = ockFixWho(p);
    (STATE.punches || []).forEach(function(x){ if(x.id !== p.id && ockFixSame(x, w) && x.stop && +new Date(x.stop) > ns && +new Date(x.start) < ns){ if(!x.edited){ x.edited = true; x.originalStart = x.start; x.originalStop = x.stop; x.editedAt = ockIso(Date.now()); } x.stop = ockIso(ns); } });
    if(!p.edited){ p.edited = true; p.originalStart = p.start; p.originalStop = p.stop; p.editedAt = ockIso(Date.now()); }
    p.start = ockIso(ns);
    var sh = null; try{ sh = openShiftOf(w); }catch(e){ try{ sh = openShift(); }catch(e2){} } if(sh && +new Date(sh.in) > ns) sh.in = ockIso(ns);
    ockAddNote(p, "Start moved back " + d + " min (it was " + was + ")");
  });
  ockToast("Start moved to " + ockClk(ns) + " — saved with a note on this punch.", true);
}
function ockNoteSave(c){
  var i = c.el.querySelector("[data-ock-in]"), v = i ? String(i.value || "").trim() : ""; if(!v){ ockToast("Type a few words first."); return; }
  var p = ockRunP(c), st = ockState(c.key); if(!p) return;
  st.noteOpen = false; st.nudgeAt = 0;
  ockCommit("note", function(){ ockAddNote(p, v); });
  ockToast("Note saved to this punch · " + ockClk(Date.now()) + ".");
}
/* Parsec 17.1: a note added on the time bar, at the moment picked there */
function ockBarModel(card){
  var op = null; try{ op = getOp(card.getAttribute("data-ro"), card.getAttribute("data-op")); }catch(e){} if(!op) return null;
  var key = card.getAttribute("data-ro") + "|" + card.getAttribute("data-op"), st = ockState(key), now = Date.now(), C = card.__ockBm;
  if(C && now - C.t < 1000) return C;
  var m = ockModel(op, card.getAttribute("data-hr"), st.fix ? st.fix.d : 0);
  return (card.__ockBm = { t: now, m: m, sc: ockScale(m, ockSim(op)) });
}
function ockBarHit(card, cx){
  var bar = card.querySelector(".ock-bar"), B = ockBarModel(card); if(!bar || !B) return null;
  var r = bar.getBoundingClientRect(); if(!r.width) return null;
  return ockBarAt(B.m, B.sc, (cx - r.left) / r.width);
}
function ockNaddOpen(c, cx){
  var x = ockBarHit(c.el, cx), st = ockState(c.key);
  if(!x){ ockToast("Notes go on the time worked — click a coloured piece of the bar."); return; }
  st.nadd = { pid: x.p.id, at: x.at, pct: x.pct, v: st.nadd && st.nadd.pid === x.p.id ? st.nadd.v || "" : "" };
  ockRedraw();
  var f = ockFindCard(c.key), i = f && f.querySelector("[data-ock-na]"); if(i) try{ i.focus({ preventScroll: true }); }catch(er){}
}
function ockNaddSave(c){
  var st = ockState(c.key), x = st.nadd; if(!x) return;
  var i = c.el.querySelector("[data-ock-na]"), v = i ? String(i.value || "").trim() : ""; if(!v){ ockToast("Type a few words first."); return; }
  var p = (STATE.punches || []).filter(function(q){ return q.id === x.pid; })[0]; st.nadd = null;
  if(!p){ ockRedraw(); return; }
  ockCommit("note", function(){ ockAddNote(p, v, x.at); });
  ockToast("Note saved at " + ockClk(x.at) + ".");
}
function ockRedraw(){ try{ if(typeof PG !== "undefined" && PG.keepScroll) PG.keepScroll(render); else render(); }catch(e){} try{ if(typeof JC !== "undefined" && JC && JC.rerender) JC.rerender(); }catch(e){} }
document.addEventListener("pointerdown", function(e){
  if(e.button) return;
  var t = ockTgt(e), go = t && t.closest && t.closest('[data-ock="go"]'); OCK_SKIP = false; if(!go || go.disabled) return;
  var c = ockOf(go); if(!c || !go.classList.contains("on")) return;          /* only Stop is held; Start is a tap */
  e.preventDefault(); OCK_SKIP = true;
  try{ go.setPointerCapture(e.pointerId); }catch(er){}
  ockHoldEnd(false);
  var st = ockState(c.key); st.holding = true; st.hint = null;
  var rg = go.closest(".ock-rg"); if(rg){ rg.classList.remove("holding"); void rg.offsetWidth; rg.classList.add("holding"); }
  var hn = c.el.querySelector(".ock-hint"); if(hn) hn.textContent = "Keep holding…";
  OCK_H = { c: c, go: go, id: e.pointerId, at: Date.now(), timer: setTimeout(function(){ var H = OCK_H; if(!H) return; ockHoldEnd(false); ockStopNow(H.c); }, OCK_HOLD) };
}, true);
/* a busy page can hand over the let-go before the timer: a press held long enough still counts */
document.addEventListener("pointerup", function(e){ var H = OCK_H; if(!H || H.id !== e.pointerId) return; if(Date.now() - H.at >= OCK_HOLD - 20){ ockHoldEnd(false); ockStopNow(H.c); } else ockHoldEnd(true); }, true);
document.addEventListener("pointercancel", function(e){ if(OCK_H && OCK_H.id === e.pointerId) ockHoldEnd(true); }, true);
document.addEventListener("pointermove", function(e){
  if(!OCK_H || OCK_H.id !== e.pointerId) return;
  var r = OCK_H.go.getBoundingClientRect(); if(!r.width) return;
  if(e.clientX < r.left - 14 || e.clientX > r.right + 14 || e.clientY < r.top - 14 || e.clientY > r.bottom + 14) ockHoldEnd(true);
}, true);
var OCK_GST = null;
document.addEventListener("pointermove", function(e){
  if(e.pointerType === "touch") return;
  var t = ockTgt(e), bar = t && t.closest && t.closest('.ock-bar[data-ock="bar"]'), g = null;
  if(bar && !t.closest(".ock-pin, .ock-nadd")){
    var card = bar.closest(".ock[data-op]"), x = card && ockBarHit(card, e.clientX); g = bar.querySelector(".ock-gst");
    if(g && x){ g.style.left = x.pct.toFixed(2) + "%"; var lb = "+ Note at " + ockClk(x.at); if(g.getAttribute("data-t") !== lb) g.setAttribute("data-t", lb); g.classList.add("on"); } else if(g){ g.classList.remove("on"); g = null; }
  }
  if(OCK_GST && OCK_GST !== g) OCK_GST.classList.remove("on");
  OCK_GST = g;
}, true);
document.addEventListener("contextmenu", function(e){ var t = ockTgt(e); if(t && t.closest && t.closest('.ock [data-ock="go"]')) e.preventDefault(); }, true);
document.addEventListener("input", function(e){
  var t = ockTgt(e); if(t && t.matches && t.matches("[data-ock-na]")){ var c9 = ockOf(t), s9 = c9 && ockState(c9.key); if(s9 && s9.nadd) s9.nadd.v = t.value; return; }   /* the bar's note keeps its words through a redraw */
  if(!t || !t.matches || !t.matches("[data-ock-fr]")) return;
  var c = ockOf(t); if(!c) return; e.stopPropagation();
  var st = ockState(c.key); if(!st.fix) st.fix = { d: 0 }; st.fix.d = +t.value || 0;
  ockTick(c.el);
  var fx = c.el.querySelector(".ock-fix"), x = ockPrep(c.ro, c.op, ockCardOpts(c.el));
  if(fx && x){ var tmp = document.createElement("div"); tmp.innerHTML = ockFixHtml(x.m, st); var v = fx.querySelector(".ock-fv"), w = fx.querySelector("small"), nv = tmp.querySelector(".ock-fv"), nw = tmp.querySelector("small"); if(v && nv) v.innerHTML = nv.innerHTML; if(w && nw) w.innerHTML = nw.innerHTML; }
}, true);
document.addEventListener("click", function(e){
  var t = ockTgt(e); if(!t || !t.closest) return;
  var fxw = t.closest(".ock-fx");
  if(fxw && !t.closest("button,input")){ e.preventDefault(); e.stopPropagation(); ockFocusClose(); return; }
  var c = ockOf(t); if(!c) return;
  var a = t.closest("[data-ock],[data-ock-r]"); if(!a || !c.el.contains(a)) return;
  if(a.getAttribute("data-ock") === "bar" && t.closest(".ock-nadd")){ e.stopPropagation(); return; }   /* inside the note pop-over */
  if(t.closest("input")) { e.stopPropagation(); return; }
  e.preventDefault(); e.stopPropagation();
  if(c.cb.pre) try{ c.cb.pre(); }catch(er){}                                   /* the page's own pop-ups close, as a click elsewhere would */
  var k = a.getAttribute("data-ock"), r = a.getAttribute("data-ock-r"), st = ockState(c.key);
  if(r != null){ var pid = st.rsn && st.rsn.pid; st.rsn = null; if(pid && c.cb.reason) c.cb.reason(c.ro, c.op, pid, r); return; }
  if(k === "go"){
    if(a.disabled) return;
    if(e.detail !== 0 && OCK_SKIP){ OCK_SKIP = false; return; }
    if(a.classList.contains("on")){ if(e.detail === 0) ockStopNow(c); return; }     /* a key press stops at once; a pointer has to hold */
    if(c.cb.start) c.cb.start(c.ro, c.op);
    return;
  }
  if(k === "reo"){ ockReopen(c); return; }
  if(k === "rx"){ st.rsn = null; var rs = c.el.querySelector(".ock-rsn"); if(rs) rs.innerHTML = ""; ockRedraw(); return; }
  if(k === "big"){
    OCK_VIEW = OCK_VIEW === "left" ? "el" : "left"; try{ localStorage.setItem("parsec.ockView", OCK_VIEW); }catch(er){}
    ockTickAll();
    if(!ockCalm()){ a.classList.remove("fl"); void a.offsetWidth; a.classList.add("fl"); setTimeout(function(){ a.classList.remove("fl"); }, 450); }
    return;
  }
  if(k === "q" && c.cb.editQ){ c.cb.editQ(a, c.ro, c.op); return; }
  if(k === "focus"){ ockFocusOpen(c.el); return; }
  if(k === "fxx"){ ockFocusClose(); return; }
  if(k === "lap"){ a.classList.remove("ping"); void a.offsetWidth; a.classList.add("ping"); ockLap(c); return; }
  if(k === "pen"){ var p0 = ockRunP(c); if(!p0) return; st.fix = st.fix ? null : { d: 0 }; ockRedraw(); if(st.fix){ var f0 = null; ockEach(function(x){ if(!f0 && !x.classList.contains("ock-fxp") && x.getAttribute("data-ro") + "|" + x.getAttribute("data-op") === c.key) f0 = x; }); var rr = f0 && f0.querySelector("[data-ock-fr]"); if(rr) try{ rr.focus({ preventScroll: true }); }catch(er){} } return; }
  if(k === "fs"){ ockFixSave(c); return; }
  if(k === "fu"){ st.fix = null; ockRedraw(); return; }
  if(k === "nopen"){ st.noteOpen = true; ockRedraw(); var f1 = ockFindCard(c.key), ii = f1 && f1.querySelector("[data-ock-in]"); if(ii) try{ ii.focus({ preventScroll: true }); }catch(er){} return; }
  if(k === "ns"){ ockNoteSave(c); return; }
  if(k === "nx"){ st.noteOpen = false; ockRedraw(); return; }
  if(k === "bar"){ ockNaddOpen(c, e.clientX); return; }
  if(k === "pin"){ return; }                                                     /* pointing reads it; a click keeps it open (focus) */
  if(k === "nas"){ ockNaddSave(c); return; }
  if(k === "nax"){ st.nadd = null; ockRedraw(); return; }
  if(k === "nxx"){ st.nextGone = true; ockRedraw(); return; }
  if(k === "nxs"){ st.nextGone = true; var nr = a.getAttribute("data-nro"), no = a.getAttribute("data-nop"); if(c.cb.start) c.cb.start(nr, no); return; }
}, true);
document.addEventListener("keydown", function(e){
  if(e.key === "Escape" && OCK_FX){ e.preventDefault(); e.stopPropagation(); ockFocusClose(); return; }
  var t = ockTgt(e); if(!t || !t.closest) return;
  if(t.matches && t.matches("[data-ock-in]")){
    var c0 = ockOf(t); if(!c0) return; e.stopPropagation();
    if(e.key === "Enter"){ e.preventDefault(); ockNoteSave(c0); } else if(e.key === "Escape"){ e.preventDefault(); ockState(c0.key).noteOpen = false; ockRedraw(); }
    return;
  }
  if(t.matches && t.matches("[data-ock-na]")){
    var c2 = ockOf(t); if(!c2) return; e.stopPropagation();
    if(e.key === "Enter"){ e.preventDefault(); ockNaddSave(c2); } else if(e.key === "Escape"){ e.preventDefault(); ockState(c2.key).nadd = null; ockRedraw(); }
    return;
  }
  if(t.matches && t.matches("[data-ock-fr]")){ var c1 = ockOf(t); if(!c1) return; e.stopPropagation(); if(e.key === "Enter"){ e.preventDefault(); ockFixSave(c1); } else if(e.key === "Escape"){ e.preventDefault(); ockState(c1.key).fix = null; ockRedraw(); } return; }
  if(e.key !== "Enter" && e.key !== " ") return;
  if(/^(input|textarea|select)$/i.test(t.tagName)) return;
  var c = ockOf(t); if(!c) return;
  e.stopPropagation();                                                          /* the page's own Space / Enter keys stay out of the card */
  var go = t.closest('[data-ock="go"]');
  if(go){ e.preventDefault(); if(go.disabled || e.repeat) return; if(go.classList.contains("on")) ockStopNow(c); else if(c.cb.start) c.cb.start(c.ro, c.op); return; }
  var q = t.closest('[data-ock="q"]'); if(q && c.cb.editQ){ e.preventDefault(); c.cb.editQ(q, c.ro, c.op); }
}, true);
/* Parsec 12.8: Reopen — back to Hold tech, the clock stays off (the page can hand its own) */
function ockReopen(c){
  if(c.cb.reopen){ c.cb.reopen(c.ro, c.op); return; }
  var op = null; try{ op = getOp(c.ro, c.op); }catch(e){} if(!op) return;
  var lbl = null;
  ockCommit("reopen operation", function(){ lbl = opReopenMark(op, c.ro, "Hold tech"); op.jobStatus = { status: "Hold Tech", sub: null, setAt: nowIso(), hand: true }; });
  ockToast((lbl || "Op") + " reopened — back to Hold tech. Start the clock when you’re on it.", true);
}
/* a reason picked after the clock stopped — Complete waits on the parts (Parsec 12.5: notes and files are the final check, at release) */
function ockSetReason(pid, r){
  var p = (STATE.punches || []).filter(function(x){ return x.id === pid; })[0]; if(!p || !p.stop) return null;
  var op = null; try{ op = getOp(p.roId, p.opId); }catch(e){}
  if(/^Complete/.test(r) && op && typeof opCompleteGaps === "function"){ var g = v141GapsAsk(op); if(g.length){ p.stopReason = "Hold Tech"; return g; } }
  p.stopReason = r; return true;
}
