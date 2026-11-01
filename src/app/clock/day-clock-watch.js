/* Parsec · clock · day-clock-watch.js
   The day clock watches for you, on every page (14.6 G): “Still on the clock?” after the shift end, a job running before the clock-in, the clock-out check — corner cards drawn by v146Tick.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v146E v146P2 v146Min v146HM v146Dur v146Iso v146Me v146Tech v146First v146ShiftEnd v146Run v146Mine … (31 functions, 1 constant)
   state      punches shiftEnd
   uses       access/ automations/ data/ pages/ pages/timelog/ ro/ shell/ state/
   at load    a timer · on document click
*/
/* ============================== Parsec 14.6 (G) — the day clock watches for you, on every page ==============================
   · "Still on the clock?" 20 minutes after your shift ends, whatever page you're on (the Time Log keeps its own reminder)
   · A clock-out check — only when something's still open: a running job, no lunch after 6 h, punches without a work note
   · A job running before your clock-in (or with no clock-in at all) asks to clock in at its start.
     Starting a job already clocks you in (ensureOnClock) — this asks only when that didn't happen (another device, an edit) */
var V146 = { snz: 0, noIn: {}, el: null, ck: null, bypass: false, t: 0 };
function v146E(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function v146P2(n){ return String(n).padStart(2, "0"); }
function v146Min(ms){ var d = new Date(ms); return d.getHours() * 60 + d.getMinutes(); }
function v146HM(ms){ var d = new Date(ms); return v146P2(d.getHours()) + ":" + v146P2(d.getMinutes()); }
function v146Dur(m){ m = Math.max(0, Math.round(m || 0)); return Math.floor(m / 60) + ":" + v146P2(m % 60); }
function v146Iso(min){ var d = new Date(); d.setHours(0, 0, 0, 0); d.setMinutes(Math.round(min)); return d.toISOString(); }
function v146Me(){ try{ return String(pcMe() || ""); }catch(e){ return ""; } }
function v146Tech(){ try{ var m = PG.me(); return m && m.tech ? m.tech : null; }catch(e){ return null; } }
function v146First(n){ try{ return PG.first(n); }catch(e){ return String(n || "").split(" ")[0]; } }
function v146ShiftEnd(t){ var sf = null; try{ sf = staffForTech(t); }catch(e){} var x = /^(\d{1,2}):(\d{2})$/.exec(String((sf && sf.shiftEnd) || STATE.shiftEnd || "15:30").trim()); return x ? (+x[1]) * 60 + (+x[2]) : 930; }
function v146Run(me){ try{ if(typeof runningPunchOfPerson === "function") return runningPunchOfPerson(me); }catch(e){} try{ return runningPunch() || null; }catch(e){ return null; } }
function v146Mine(me, day){ return (STATE.punches || []).filter(function(p){ try{ return localDay(p.start) === day && sameOwner(punchOwner(p), me); }catch(e){ return false; } }); }
function v146OpLbl(p){ var ro = null; try{ ro = getRO(p.roId); }catch(e){}
  try{ if(isShopPunch(p)){ var so = getOp(p.roId, p.opId); return "Shop time" + (so && so.complaint ? " · " + so.complaint : ""); } }catch(e){}
  var n = ro ? (ro.operations || []).findIndex(function(o){ return o.id === p.opId; }) + 1 : 0, tag = ""; try{ tag = roTag(ro); }catch(e){ tag = ro ? "RO " + (ro.roNumber || "") : "an RO"; }
  return (n ? "Op " + n + " · " : "") + tag; }
function v146Calc(t){ try{ if(typeof TL === "undefined") return null; TL.flush(); return TL.calc(t, todayStr()); }catch(e){ return null; } }

/* ---------- 1 · "Still on the clock?" ---------- */
function v146NudState(){
  var t = v146Tech(); if(!t) return null;
  var me = v146Me() || t, sh = null; try{ sh = openShiftOf(me); }catch(e){}
  if(!sh || localDay(sh.in) !== todayStr()) return null;
  var se = v146ShiftEnd(t), now = Date.now(); if(v146Min(now) - se < 20) return null;
  if(now < V146.snz) return null;
  try{ if(typeof TL !== "undefined" && TL.U().otAsk) return null; }catch(e){}
  var rp = v146Run(me), last = null;
  v146Mine(me, todayStr()).forEach(function(p){ if(p.stop){ var s = +new Date(p.stop); if(last == null || s > last) last = s; } });
  return { t: t, me: me, sh: sh, se: se, rp: rp, last: last, at: !rp && last != null && now - last >= 5 * 60000 && last > +new Date(sh.in) };
}
function v146NudHtml(N){
  var d = new Date(); d.setHours(0, 0, 0, 0); d.setMinutes(N.se);
  var sub = "Your shift ended at " + v146HM(+d) + (N.rp ? " · on " + v146OpLbl(N.rp) + " since " + v146HM(+new Date(N.rp.start)) : N.last != null ? " · last activity " + v146HM(N.last) : "");
  return '<div class="v146-card v146-nud" role="status" aria-live="polite"><b>Still on the clock, ' + v146E(v146First(N.t)) + '?</b><small>' + v146E(sub) + '</small><div class="r">'
    + (N.at ? '<button type="button" class="v146-b pri" data-v146="at">Clock out at ' + v146HM(N.last) + '</button>' : '')
    + '<button type="button" class="v146-b' + (N.at ? '' : ' pri') + '" data-v146="now">' + (N.rp ? 'Stop and clock out' : 'Clock out now') + '</button>'
    + '<button type="button" class="v146-b" data-v146="snz">I’m still here — 1 h</button></div></div>';
}
function v146OutAt(ms){
  var me = v146Me(), sh = null; try{ sh = openShiftOf(me); }catch(e){} if(!sh || v146Run(me)) return;
  pushUndo("clock out"); try{ commitNoteDrafts(); }catch(e){}
  sh.out = new Date(ms).toISOString(); sh.outReason = "End of day"; delete sh.backBy;
  sh.fixed = { by: me, at: nowIso(), why: "Forgot to clock out" };
  UI.modal = null; scheduleSave(true);
  pushToast("Clocked out at " + v146HM(ms) + " — the minutes after don’t count. Marked “Forgot to clock out”.", true);
  render(); try{ pxEndOfDay("End of day"); }catch(e){}
}

/* ---------- 3 · a job running before the clock-in ---------- */
function v146InState(){
  var me = v146Me(); if(!me) return null;
  var rp = v146Run(me); if(!rp || V146.noIn[rp.id] || localDay(rp.start) !== todayStr()) return null;
  var st = +new Date(rp.start), sh = null; try{ sh = openShiftOf(me); }catch(e){}
  if(!sh) return { me: me, rp: rp, ms: st, sh: null };
  if(localDay(sh.in) !== todayStr() || +new Date(sh.in) - st < 60000) return null;
  var ms = st; try{ var L = rcShiftLimits(sh); if(L.first) ms = Math.min(ms, +new Date(L.first.start)); }catch(e){}
  return { me: me, rp: rp, ms: ms, sh: sh };
}
function v146InHtml(I){
  var sub = I.sh ? "Your job started at " + v146HM(+new Date(I.rp.start)) + ", before your clock-in at " + v146HM(+new Date(I.sh.in)) + "." : v146OpLbl(I.rp) + " is running since " + v146HM(+new Date(I.rp.start)) + ".";
  return '<div class="v146-card v146-in" role="alertdialog" aria-label="Not clocked in"><b>You’re not clocked in — clock in at ' + v146HM(I.ms) + '?</b><small>' + v146E(sub) + '</small><div class="r">'
    + '<button type="button" class="v146-b pri" data-v146="cin">Clock in at ' + v146HM(I.ms) + '</button><button type="button" class="v146-b" data-v146="cinx">Not now</button></div></div>';
}
function v146ClockInAt(){
  var I = v146InState(); if(!I) return;
  if(!I.sh){
    pushUndo("clock in");
    shiftList().push({ id: uid("sh"), in: new Date(I.ms).toISOString(), out: null, by: I.me, fixed: { by: I.me, at: nowIso(), why: "Forgot to clock in" } });
    scheduleSave(true); pushToast("Clocked in at " + v146HM(I.ms) + " — when the job started. Marked “Forgot to clock in”.", true); render(); return;
  }
  var r = rcShiftIn(I.sh, I.ms, { by: I.me, why: "Forgot to clock in" });
  if(!r.ok){ pushToast(r.msg); return; }
  pushToast("Clocked in at " + v146HM(I.ms) + (r.was ? " — was " + v146HM(+new Date(r.was)) : "") + ". Marked “Forgot to clock in”.", true); render();
}

/* ---------- the corner: draws the cards ---------- */
function v146Host(){
  if(V146.el && document.body.contains(V146.el)) return V146.el;
  var w = document.createElement("div"); w.id = "v146"; w.className = "v146";
  w.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-v146]"); if(!b) return;
    var k = b.getAttribute("data-v146"), N = v146NudState();
    if(k === "at" && N && N.at) v146OutAt(N.last);
    else if(k === "now") shiftClockOut("End of day");
    else if(k === "snz"){ V146.snz = Date.now() + 3600e3; pushToast("OK — it asks again at " + v146HM(V146.snz) + "."); }
    else if(k === "cin") v146ClockInAt();
    else if(k === "cinx"){ var I = v146InState(); if(I) V146.noIn[I.rp.id] = 1; }
    v146Tick();
  });
  document.body.appendChild(w); V146.el = w; return w;
}
function v146Tick(){
  var h = "";
  try{
    var signedOut = false; try{ signedOut = typeof pxOut === "function" && pxOut(); }catch(e){}
    if(!signedOut){
      var I = v146InState(); if(I) h += v146InHtml(I);
      var N = UI.view === "timelog" ? null : v146NudState(); if(N) h += v146NudHtml(N);
      try{ h += v150Html(N); }catch(e150){}   /* Parsec 15: Lunch time · Clock out for the day? */
    }
  }catch(e){ h = ""; }
  if(!h && !V146.el) return;
  var w = v146Host(); if(w.getAttribute("data-h") === h) return;
  w.setAttribute("data-h", h); w.innerHTML = h; w.hidden = !h;
}
function v146Soon(){ clearTimeout(V146.t); V146.t = setTimeout(v146Tick, 0); }
setInterval(function(){ try{ v146Tick(); }catch(e){} }, 30000);

/* ---------- 2 · the clock-out check ---------- */
function v146Open(me){
  var t = v146Tech() || me, c = v146Calc(t), rp = v146Run(me), items = [];
  if(rp) items.push({ k: "run", rp: rp, l: v146OpLbl(rp) + " is still running — stop it as " + (isShopPunchSafe(rp) ? "done" : "Hold Tech") });
  if(c && c.noLunch) items.push({ k: "lunch", at: c.noLunch.at, l: c.noLunch.at != null ? "No lunch — take Lunch " + v146HM(+new Date(v146Iso(c.noLunch.at))) + "–" + v146HM(+new Date(v146Iso(c.noLunch.at + 30))) : "No lunch clocked — no free 30 minutes to put it in; fix it on the Time Log" });
  if(c && c.miss) items.push({ k: "notes", n: c.miss, l: c.miss + " punch" + (c.miss > 1 ? "es" : "") + " without a work note" });
  return { t: t, c: c, rp: rp, items: items };
}
function isShopPunchSafe(p){ try{ return !!isShopPunch(p); }catch(e){ return false; } }
function v146CkClose(){ if(V146.ck){ V146.ck.remove(); V146.ck = null; } document.removeEventListener("keydown", v146CkKey, true); }
function v146CkKey(e){
  if(!V146.ck) return;
  if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); v146CkClose(); return; }
  if(e.key === "Enter"){ var b = document.activeElement; if(b && V146.ck.contains(b) && (b.tagName === "BUTTON" || b.tagName === "INPUT")) return; e.preventDefault(); e.stopPropagation(); var p = V146.ck.querySelector(".roreo-b.pri"); if(p) p.click(); return; }
  if(!/^(Tab|Shift)$/.test(e.key)) e.stopPropagation();
}
function v146Check(args){
  var me = v146Me(), O = v146Open(me); if(!O.items.length) return false;
  v146CkClose();
  var c = O.c, d = new Date(), DNL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var fixable = O.items.filter(function(x){ return x.k === "run" || (x.k === "lunch" && x.at != null); }).length;
  var li = O.items.map(function(x){
    if(x.k === "notes") return '<li class="v146-nt"><span>' + v146E(x.l) + '</span><button type="button" class="v146-lk" data-ck-a="notes">Add them…</button></li>';
    if(x.k === "lunch" && x.at == null) return '<li class="v146-nt"><span>' + v146E(x.l) + '</span></li>';
    return '<li><label><input type="checkbox" data-ck="' + x.k + '" checked><span>' + v146E(x.l) + '</span></label></li>'; }).join("");
  var nums = c ? '<div class="v146-nums"><span><b>' + v146Dur(c.clocked) + '</b><small>clocked</small></span><span><b>' + v146Dur(c.job) + '</b><small>on jobs</small></span><span><b>' + v146Dur(c.airM) + '</b><small>air</small></span></div>' : '';
  var w = document.createElement("div"); w.className = "roreo pgask v146ck"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", "Clock out");
  w.innerHTML = '<div class="roreo-c"><div class="roreo-h"><span class="roreo-i" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><div><b>Clock out · ' + v146E(me || O.t) + ' · ' + DNL[d.getDay()] + '</b><p>Something’s still open — fix it on the way out, or clock out anyway.</p></div></div>'
    + nums + '<ul class="v146-ck">' + li + '</ul><div class="roreo-a"><button type="button" class="roreo-b" data-ck-a="x">Cancel</button>'
    + '<button type="button" class="roreo-b' + (fixable ? '' : ' pri') + '" data-ck-a="any">Clock out anyway</button>' + (fixable ? '<button type="button" class="roreo-b pri" data-ck-a="fix">Fix and clock out</button>' : '') + '</div></div>';
  w.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-ck-a]");
    if(!b){ if(e.target === w) v146CkClose(); return; }
    var k = b.getAttribute("data-ck-a");
    var pick = {}; [].forEach.call(w.querySelectorAll("input[data-ck]"), function(i){ pick[i.getAttribute("data-ck")] = i.checked; });
    v146CkClose();
    if(k === "x") return;
    if(k === "notes"){ v146Notes(); return; }
    v146Finish(args, k === "fix" ? pick : {}, O);
  });
  document.body.appendChild(w); V146.ck = w;
  document.addEventListener("keydown", v146CkKey, true);
  var pri = w.querySelector(".roreo-b.pri"); if(pri) try{ pri.focus({ preventScroll: true }); }catch(e){}
  return true;
}
function v146Finish(args, pick, O){
  var me = v146Me(), rp = O.rp, lunch = O.items.filter(function(x){ return x.k === "lunch" && x.at != null; })[0], bits = [];
  V146.bypass = true; try{ shiftClockOut0.apply(null, args); } finally { V146.bypass = false; }
  if(pick.run && rp && rp.stop){ rp.stopReason = isShopPunchSafe(rp) ? "Done" : "Hold Tech"; bits.push(v146OpLbl(rp) + " stopped as " + rp.stopReason); }
  if(pick.lunch && lunch){
    var at = lunch.at, day = todayStr(), sh = shiftsOfPerson(day, me).filter(function(s){ var a = v146Min(+new Date(s.in)), b = s.out ? v146Min(+new Date(s.out)) : 1440; return a <= at && at + 30 <= b; })[0];
    if(sh){ shiftList().push({ id: uid("sh"), in: v146Iso(at + 30), out: sh.out, outReason: sh.outReason || null, by: sh.by || me }); sh.out = v146Iso(at); sh.outReason = "Lunch";
      bits.push("lunch " + v146HM(+new Date(v146Iso(at))) + "–" + v146HM(+new Date(v146Iso(at + 30)))); }
  }
  if(bits.length){ scheduleSave(true); var last = shiftsOfPerson(todayStr(), me).filter(function(s){ return s.out; }).pop();
    pushToast("Clocked out" + (last ? " at " + v146HM(+new Date(last.out)) : "") + " · " + bits.join(" · "), true); render(); }
}
function v146Notes(){
  try{ UI.view = "timelog"; UI.tlMe = 1; render(); var U = TL.U(); U.view = "day"; U.per = "cur"; U.pop = { type: "notes" }; render(); }catch(e){}
}
/* the Time Log's "Clock out at the shift end" picks its own time — no check there */
document.addEventListener("click", function(e){ var t = e.target.closest && e.target.closest('[data-pg="timelog"] [data-a="clkat"]'); if(t){ V146.bypass = true; setTimeout(function(){ V146.bypass = false; }, 0); } }, true);
function shiftClockOut(reason, mins, notes, stand){
  var r = reason || "End of day", has = false; try{ has = !!openShift(); }catch(e){}
  if(has && !V146.bypass && (r === "End of day" || r === "Home") && v146Check([reason, mins, notes, stand])) return;
  return shiftClockOut0(reason, mins, notes, stand);
}
