/* Parsec · ro-page · clock-card-actions.js
   What you do on the clock card: hold to stop with a reason, lap / split, fix the start, notes, reopen; ockAuto for lunch and the end of the day (reminders only since Parsec 15).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ockTgt ockOf ockHint ockHoldEnd ockRunP ockStopNow ockLap ockFixSave ockNoteSave ockBarModel ockBarHit ockNaddOpen … (23 functions, 8 constants)
   state      punches
   uses       access/ automations/ clock/ data/ pages/ pages/inbox/ pages/warranty/ ro/ shell/ state/
   at load    2× on document pointerdown · 2× on document pointerup · on document pointercancel · 3× on document pointermove · on document contextmenu · on document input · on document click · on document keydown ·
*/
/* ---------- what you do on the card ---------- */
var OCK_H = null, OCK_SKIP = false;   /* OCK_SKIP: the click that ends a press on Stop does nothing (the hold did it) */
function ockTgt(e){ var p = e.composedPath ? e.composedPath() : [e.target], t = p[0] || e.target; return t && t.nodeType === 1 ? t : (t && t.parentElement) || null; }
function ockOf(t){ var c = t && t.closest ? t.closest(".ock[data-op]") : null; return c ? { el: c, ro: c.getAttribute("data-ro"), op: c.getAttribute("data-op"), cb: OCK_CB[c.getAttribute("data-ockp")] || {}, key: c.getAttribute("data-ro") + "|" + c.getAttribute("data-op") } : null; }
function ockHint(c, t, ms){ var st = ockState(c.key); st.hint = ms ? { t: t, until: Date.now() + ms } : null; var hn = c.el.querySelector(".ock-hint"); if(hn) hn.textContent = t; }
function ockHoldEnd(cancel){
  var H = OCK_H; if(!H) return; OCK_H = null; clearTimeout(H.timer);
  var st = ockState(H.c.key); st.holding = false;
  var rg = H.go.closest(".ock-rg"), hc = rg && rg.querySelector(".ock-ring .h"), off = null;
  if(cancel && hc){ try{ off = getComputedStyle(hc).strokeDashoffset; }catch(e){} }
  if(rg) rg.classList.remove("holding");
  if(cancel){
    ockHint(H.c, "Keep holding… 0.7 s stops it", 1800);   /* 17.2: let go early — the ring snaps back, a small shake, and the hint */
    if(!ockCalm() && rg){
      try{ if(hc && off) hc.animate([{ strokeDashoffset: off, opacity: 1 }, { strokeDashoffset: String(OCK_RC), opacity: 0 }], { duration: 200, easing: "cubic-bezier(.23,1,.32,1)" }); }catch(e){}
      try{ rg.animate([{ transform: "none" }, { transform: "translateX(-3px)" }, { transform: "translateX(3px)" }, { transform: "translateX(-2px)" }, { transform: "none" }], { duration: 300, easing: "ease-out" }); }catch(e){}
    }
  }
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
  if(!x) return;                                                                 /* 17.2: nothing to add where there's no punch */
  st.nadd = { pid: x.p.id, at: x.at, pct: x.pct, v: st.nadd && st.nadd.pid === x.p.id ? st.nadd.v || "" : "" }; OCK_NA = c.key;
  ockRedraw();
  var f = ockFindCard(c.key), i = f && f.querySelector("[data-ock-na]"); if(i) try{ i.focus({ preventScroll: true }); }catch(er){}
}
function ockNaddSave(c){
  var st = ockState(c.key), x = st.nadd; if(!x) return;
  var i = c.el.querySelector("[data-ock-na]"), v = i ? String(i.value || "").trim() : ""; if(!v){ ockToast("Type a few words first."); return; }
  var p = (STATE.punches || []).filter(function(q){ return q.id === x.pid; })[0]; st.nadd = null; OCK_NA = null;
  if(!p){ ockRedraw(); return; }
  var tx = v; try{ tx = autoPunct(v); }catch(e){}
  st.pinNew = { pid: p.id, text: tx, at: Date.now() };                                 /* its flag drops in and settles */
  ockCommit("note", function(){ ockAddNote(p, v, x.at); });
  ockNoteMentions(c, v);
  ockToast("Note saved at " + ockClkS(x.at) + ".");
}
/* @someone in a note on the bar tells them */
function ockStaffNames(){ var L = []; try{ L = staffList().map(function(x){ return x.name; }).filter(Boolean); }catch(e){} return L; }
function ockNoteMentions(c, text){
  var N = ockStaffNames(), re = /(^|\s)@([A-Z][\w'’-]*(?: [A-Z][\w'’-]*)?)/g, m, out = [];
  while((m = re.exec(text))){ var w = m[2].toLowerCase(), hit = N.filter(function(n){ return n.toLowerCase() === w; })[0] || N.filter(function(n){ return n.toLowerCase().split(" ")[0] === w.split(" ")[0]; })[0]; if(hit && out.indexOf(hit) < 0 && !ockSame(hit, ockMe())) out.push(hit); }
  var ro = null; try{ ro = getRO(c.ro); }catch(e){}
  out.forEach(function(n){ try{ IB.send({ to: n, k: "men", src: "ros", ro: c.ro, op: c.op, t: ockFirst(ockMe()) + " mentioned you in a note" + (ro ? " on " + (ro.roNumber || "") : ""), b: "", q: text }); }catch(e){} });
}
function ockNsug(inp){
  var box = inp.closest(".ock-nadd"), sg = box && box.querySelector(".ock-nsug"); if(!sg) return;
  var v = inp.value.slice(0, inp.selectionStart == null ? inp.value.length : inp.selectionStart), m = /(^|\s)@([\w'’-]*)$/.exec(v);
  if(!m){ sg.hidden = true; sg.innerHTML = ""; return; }
  var q = m[2].toLowerCase(), L = ockStaffNames().filter(function(n){ return !ockSame(n, ockMe()) && (!q || n.toLowerCase().indexOf(q) === 0 || n.toLowerCase().indexOf(" " + q) > 0); }).slice(0, 5);
  if(!L.length){ sg.hidden = true; sg.innerHTML = ""; return; }
  sg.innerHTML = L.map(function(n, i){ return '<button type="button" class="ock-nsg' + (i ? "" : " on") + '" data-ock="nmen" data-n="' + ockE(n) + '">' + ockE(n) + "</button>"; }).join(""); sg.hidden = false;
}
function ockNmen(inp, name){
  var end = inp.selectionStart == null ? inp.value.length : inp.selectionStart, v = inp.value.slice(0, end), m = /(^|\s)@([\w'’-]*)$/.exec(v); if(!m) return;
  var at = end - m[2].length - 1; inp.value = inp.value.slice(0, at) + "@" + name + " " + inp.value.slice(end);
  var c = ockOf(inp), s9 = c && ockState(c.key); if(s9 && s9.nadd) s9.nadd.v = inp.value;
  ockNsug(inp); try{ inp.focus(); }catch(e){}
}
/* a note's flag: open it, change it, move it */
function ockPinOf(c, key){ var B = ockBarModel(c.el); if(!B) return null; var L = ockPins(B.m, B.sc, ockState(c.key)); for(var i = 0; i < L.length; i++) if(L[i].key === key) return L[i]; return null; }
function ockPunch(pid){ return (STATE.punches || []).filter(function(q){ return q.id === pid; })[0] || null; }
var OCK_NA = null, OCK_DRAG = null, OCK_PSKIP = false, OCK_PO = null, OCK_BO = null;
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
  if(bar && !t.closest(".ock-pin, .ock-nadd, .ock-band, .ock-bandpop, .ock-npt")){
    var card = bar.closest(".ock[data-op]"), x = card && ockBarHit(card, e.clientX); g = bar.querySelector(".ock-gst");
    if(g && x){ g.style.left = x.pct.toFixed(2) + "%"; var lb = ockClkS(x.at); if(g.getAttribute("data-t") !== lb) g.setAttribute("data-t", lb); g.classList.add("on"); } else if(g){ g.classList.remove("on"); g = null; }
  }
  if(OCK_GST && OCK_GST !== g) OCK_GST.classList.remove("on");
  OCK_GST = g;
}, true);
document.addEventListener("contextmenu", function(e){ var t = ockTgt(e); if(t && t.closest && t.closest('.ock [data-ock="go"]')) e.preventDefault(); }, true);
document.addEventListener("input", function(e){
  var t = ockTgt(e); if(t && t.matches && t.matches("[data-ock-na]")){ var c9 = ockOf(t), s9 = c9 && ockState(c9.key); if(s9 && s9.nadd) s9.nadd.v = t.value; ockNsug(t); return; }   /* the bar's note keeps its words through a redraw */
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
  if(OCK_NA && !t.closest(".ock-nadd") && !t.closest('.ock-bar[data-ock="bar"]')){   /* 17.2: clicking away keeps the words as a draft */
    var sd = ockState(OCK_NA); OCK_NA = null;
    if(sd.nadd && !sd.nadd.draft){ if(String(sd.nadd.v || "").trim()) sd.nadd.draft = true; else sd.nadd = null; setTimeout(ockRedraw, 0); }
  }
  if(OCK_PO && !t.closest(".ock-pin.open")){ var sp = ockState(OCK_PO), was = OCK_PO; OCK_PO = null; if(sp.pinOpen){ sp.pinOpen = null; sp.pinEdit = null; if(!t.closest(".ock-pin")) setTimeout(ockRedraw, 0); } void was; }   /* a click elsewhere closes an open note */
  if(OCK_BO && !t.closest(".ock-bandpop, .ock-band")){ var sb = ockState(OCK_BO); OCK_BO = null; if(sb.bandOpen){ sb.bandOpen = false; setTimeout(ockRedraw, 0); } }
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
  if(k === "pin"){ if(OCK_PSKIP){ OCK_PSKIP = false; return; } var pk = a.getAttribute("data-pk"); if(t.closest(".ock-pn") && st.pinOpen === pk) return; st.pinOpen = st.pinOpen === pk ? null : pk; st.pinEdit = null; OCK_PO = st.pinOpen ? c.key : null; var px = ockPinOf(c, pk); if(px) ockSeenMark(ockSeenKey(px.pid, px.text)); ockRedraw(); return; }
  if(k === "ped"){ st.pinEdit = st.pinOpen; OCK_PO = c.key; ockRedraw(); var f2 = ockFindCard(c.key), pe = f2 && f2.querySelector("[data-ock-pe]"); if(pe) try{ pe.focus({ preventScroll: true }); }catch(er){} return; }
  if(k === "pex"){ st.pinEdit = null; ockRedraw(); return; }
  if(k === "pes"){ ockPinSave(c); return; }
  if(k === "pdl"){ var pd = ockPinOf(c, st.pinOpen), pp = pd && ockPunch(pd.pid); if(!pp) return; st.pinOpen = null; st.pinEdit = null; ockCommit("delete note", function(){ ockNoteEdit(pp, pd.text, ""); }); ockToast("Note taken off.", true); return; }
  if(k === "prp"){ var pr = ockPinOf(c, st.pinOpen), B2 = ockBarModel(c.el); if(!pr || !B2) return; var M2 = ockBarMap(B2.m).filter(function(x){ return x.p.id === pr.pid; })[0]; if(!M2) return;
    st.pinOpen = null; st.nadd = { pid: pr.pid, at: M2.b, pct: Math.min(100, (M2.h0 + M2.d) / B2.sc * 100), v: pr.by && !ockSame(pr.by, ockMe()) ? "@" + pr.by + " " : "" }; OCK_NA = c.key; ockRedraw();
    var f3 = ockFindCard(c.key), ni = f3 && f3.querySelector("[data-ock-na]"); if(ni) try{ ni.focus({ preventScroll: true }); ni.setSelectionRange(ni.value.length, ni.value.length); }catch(er){} return; }
  if(k === "nre"){ if(st.nadd){ st.nadd.draft = false; OCK_NA = c.key; ockRedraw(); var f4 = ockFindCard(c.key), n4 = f4 && f4.querySelector("[data-ock-na]"); if(n4) try{ n4.focus({ preventScroll: true }); }catch(er){} } return; }
  if(k === "nmen"){ var box = a.closest(".ock-nadd"), ni2 = box && box.querySelector("[data-ock-na]"); if(ni2) ockNmen(ni2, a.getAttribute("data-n")); return; }
  if(k === "band"){ st.bandOpen = !st.bandOpen; OCK_BO = st.bandOpen ? c.key : null; ockRedraw(); return; }
  if(k === "bandpop"){ return; }
  if(k === "bpx"){ st.bandOpen = false; ockRedraw(); return; }
  if(k === "sjw"){ OCK_BO = c.key; var opx = null; try{ opx = getOp(c.ro, c.op); }catch(er){} if(opx){ OCK_SIMW[opx.id] = a.getAttribute("data-w") ? ockMe() : ""; } ockRedraw(); return; }
  if(k === "sjro"){ var sr = a.getAttribute("data-sro"), so = a.getAttribute("data-sop"); if(!sr) return; st.bandOpen = false; try{ if(typeof openRoAt === "function") openRoAt(sr, so); else { UI.view = "ros"; UI.selectedRo = sr; render(); } }catch(er){} return; }
  if(k === "nas"){ ockNaddSave(c); return; }
  if(k === "nax"){ st.nadd = null; OCK_NA = null; ockRedraw(); return; }
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
  if(t.matches && (t.matches("[data-ock-pe]") || t.matches("[data-ock-ptm]"))){
    var c3 = ockOf(t); if(!c3) return; e.stopPropagation();
    if(e.key === "Enter"){ e.preventDefault(); ockPinSave(c3); } else if(e.key === "Escape"){ e.preventDefault(); ockState(c3.key).pinEdit = null; ockRedraw(); }
    return;
  }
  if(t.matches && t.matches("[data-ock-na]")){
    var c2 = ockOf(t); if(!c2) return; e.stopPropagation();
    var sg = t.closest(".ock-nadd") && t.closest(".ock-nadd").querySelector(".ock-nsug");
    if(sg && !sg.hidden && (e.key === "ArrowDown" || e.key === "ArrowUp")){ e.preventDefault(); var B = sg.querySelectorAll(".ock-nsg"), k = Array.prototype.findIndex.call(B, function(b){ return b.classList.contains("on"); }); if(B[k]) B[k].classList.remove("on"); k = (k + (e.key === "ArrowDown" ? 1 : B.length - 1)) % B.length; B[k].classList.add("on"); return; }
    if(sg && !sg.hidden && (e.key === "Enter" || e.key === "Tab")){ var on = sg.querySelector(".ock-nsg.on"); if(on){ e.preventDefault(); ockNmen(t, on.getAttribute("data-n")); return; } }
    if(e.key === "Enter"){ e.preventDefault(); ockNaddSave(c2); } else if(e.key === "Escape"){ e.preventDefault(); ockState(c2.key).nadd = null; OCK_NA = null; ockRedraw(); }
    return;
  }
  if(t.matches && t.matches("[data-ock-fr]")){ var c1 = ockOf(t); if(!c1) return; e.stopPropagation(); if(e.key === "Enter"){ e.preventDefault(); ockFixSave(c1); } else if(e.key === "Escape"){ e.preventDefault(); ockState(c1.key).fix = null; ockRedraw(); } return; }
  if(e.key !== "Enter" && e.key !== " ") return;
  if(/^(input|textarea|select)$/i.test(t.tagName)) return;
  if(t.closest(".rop-ocktabs, .rop-ockf")) return;                               /* 17.2: the tabs and facts inside the card keep their own keys */
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

/* 17.2: Save on a flag being edited — its words and its time */
function ockPinSave(c){
  var st = ockState(c.key), x = ockPinOf(c, st.pinEdit), p = x && ockPunch(x.pid); if(!p) return;
  var f = ockFindCard(c.key), ti = f && f.querySelector("[data-ock-pe]"), tm = f && f.querySelector("[data-ock-ptm]");
  var v = ti ? String(ti.value || "").trim() : x.text, at = x.t;
  if(tm && /^\d{1,2}:\d{2}(:\d{2})?$/.test(tm.value)){ var P = tm.value.split(":"), d = new Date(x.t); d.setHours(+P[0], +P[1], +(P[2] || 0), 0); at = +d; }
  if(!v){ ockToast("Type a few words first — or Delete takes it off."); return; }
  st.pinEdit = null;
  ockCommit("edit note", function(){ ockNoteEdit(p, x.text, v, at); });
  ockToast("Note changed.", true);
}
/* drag a flag along its punch to move the note's time */
document.addEventListener("pointerdown", function(e){
  if(e.button) return;
  var t = ockTgt(e), pin = t && t.closest && t.closest(".ock-pin"); if(!pin || t.closest(".ock-pn")) return;
  var c = ockOf(pin); if(!c || c.el.getAttribute("data-can") !== "1") return;
  var x = ockPinOf(c, pin.getAttribute("data-pk")), B = ockBarModel(c.el), bar = c.el.querySelector(".ock-bar"); if(!x || !B || !bar) return;
  var M = ockBarMap(B.m).filter(function(y){ return y.p.id === x.pid; })[0]; if(!M) return;
  OCK_DRAG = { c: c, pin: pin, x: x, M: M, B: B, r: bar.getBoundingClientRect(), x0: e.clientX, id: e.pointerId, moved: false, at: x.t };
}, true);
document.addEventListener("pointermove", function(e){
  var D = OCK_DRAG; if(!D || D.id !== e.pointerId) return;
  if(!D.moved && Math.abs(e.clientX - D.x0) < 4) return;
  D.moved = true; e.preventDefault();
  var lo = D.M.h0 / D.B.sc * 100, hi = Math.min(100, (D.M.h0 + D.M.d) / D.B.sc * 100), pc = Math.max(lo, Math.min(hi, (e.clientX - D.r.left) / D.r.width * 100));
  D.at = Math.round(D.M.a + (pc / 100 * D.B.sc - D.M.h0) / D.M.k * 3600000);
  D.pin.style.left = pc.toFixed(2) + "%"; D.pin.classList.add("drag");
  var b = D.pin.querySelector(".ock-pn b"); if(b) b.textContent = (D.x.by ? ockFirst(D.x.by) + " · " : "") + ockClkS(D.at);
}, true);
document.addEventListener("pointerup", function(e){
  var D = OCK_DRAG; if(!D || D.id !== e.pointerId) return; OCK_DRAG = null;
  if(!D.moved) return;
  OCK_PSKIP = true; setTimeout(function(){ OCK_PSKIP = false; }, 400);
  var p = ockPunch(D.x.pid); if(!p) return;
  ockCommit("move note", function(){ ockNoteTime(p, D.x.text, D.at); });
  ockToast("Note moved to " + ockClkS(D.at) + ".", true);
}, true);
/* pointing at someone else's note reads it */
document.addEventListener("pointerover", function(e){
  var t = ockTgt(e), pin = t && t.closest && t.closest(".ock-pin.un"); if(!pin) return;
  var c = ockOf(pin), x = c && ockPinOf(c, pin.getAttribute("data-pk")); if(!x) return;
  setTimeout(function(){ if(pin.matches(":hover")){ ockSeenMark(ockSeenKey(x.pid, x.text)); pin.classList.remove("un"); } }, 600);
}, true);
