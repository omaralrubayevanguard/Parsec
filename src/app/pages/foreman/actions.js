/* Parsec · pages/foreman · actions.js
   Doing things on the Foreman page: set status, assign, route, done, snooze, nudge, accept; fmAct handles clicks; typing, keys and dragging.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   fmSetSt fmTechName fmOrder fmRoute fmPend fmAfterAct fmDone fmDo fmOpenPop fmSnooze fmNudge fmAccept … (23 functions)
   state      fmNote fmTmr punches
   uses       access/ data/ kit/ pages/ pages/triage/ ro/ shell/ state/
   at load    on document input · on document change · on document pointerdown · on document keydown · on document dragstart · on document dragover · on document drop · on document dragend
*/
/* ============================== doing things ============================== */
function fmSetSt(ro, status, sub){ var opt = roStatusOption(status); if(!opt) return; var prev = roStatus(ro);
  ro.status = { status: status, sub: opt.subs.indexOf(sub) >= 0 ? sub : null, setAt: nowIso() };
  try{ audit("status", roLabel(ro) + ": " + prev.status + (prev.sub ? " · " + prev.sub : "") + " → " + status + (ro.status.sub ? " · " + ro.status.sub : ""), ro); }catch(e){}
  try{ markStatusFlip(ro); }catch(e){} }
function fmTechName(n){ return fmTechs().filter(function(k){ return techSame(k, n); })[0] || n; }
function fmOrder(ro, top){ var t = ro.assignedTech; if(!t) return; var L = fmUpNext(t).filter(function(x){ return x !== ro; }); if(fmWorkable(ro) || fmHoldReady(ro)){ if(top) L.unshift(ro); else L.push(ro); } L.forEach(function(x, i){ x.fmQ = i + 1; }); }
function fmRoute(ro, n, why, note){ var same = ro.route && ro.route.to === "tech" && techSame(ro.route.who || ro.assignedTech, n) && techSame(ro.assignedTech, n);
  if(!same) rtSend(ro, "tech", fmTechName(n), note || "", null, { reason: why || "Tech + bay" }); else if(note) rtLog(ro, { kind: "note", at: nowIso(), by: tgMe(), to: "tech", who: n, note: note }); }
function fmPend(ro){ return ro.route && ro.route.state === "pending" ? " — waiting for " + (ro.assignedTech ? fmHim(ro.assignedTech) : "them") + " to accept." : "."; }
function fmAfterAct(id, before){ fmNcClear(); var L = fmFlat(); if(L.indexOf(UI.fmSel) < 0){ var i = before.indexOf(id); UI.fmSel = L.length ? L[Math.min(Math.max(i, 0), L.length - 1)] : UI.fmSel; } }
function fmDone(ro, ic, what, msg, before){ if(ro) delete ro.fmSnz; if(ro) fmClear(ro, ic, what); UI.fmPop = null; fmAfterAct(ro ? ro.id : null, before); scheduleSave(true); pushToast(msg, true); }
function fmDo(id){ var x = fmItemOf(id); if(!x) return; UI.fmSel = id;
  if(x.act === "accept") return fmAccept(x.ro); if(x.act === "nudge") return fmNudge(x.ro);
  if(x.act === "clash"){ UI.fmView = "yard"; UI.fmClash = x.spot; UI.yardPick = null; render(); return; }
  if(x.act === "stopclk" || x.act === "fixclk") return fmOpenPop(x.act, id, { pid: x.p.id });
  fmOpenPop(x.act, id); }
function fmOpenPop(type, id, extra){ var x = fmGet(id); if(!x && ["fill", "plan", "cfg", "bays", "book"].indexOf(type) < 0) return;
  if(x && x.isTech && (type === "assign" || type === "decide")) type = "give"; if(x && x.isTech && type === "xfer") return;
  if(type === "snooze" && x && !fmItemOf(id)) return;
  if(id) UI.fmSel = id; UI.fmPop = { type: type, ro: id || null, i: 0 }; if(extra) for(var k in extra) UI.fmPop[k] = extra[k];
  UI.fmPopTop = null; UI.fmSrch = false; render(); }
function fmSnooze(x, until, why){ var before = fmFlat(); pushUndo("snooze");
  if(x.isTech){ UI.fmTSnz = UI.fmTSnz || {}; UI.fmTSnz[x.name] = { until: new Date(until).toISOString() }; } else x.fmSnz = { until: new Date(until).toISOString(), why: why || "", at: nowIso(), by: tgMe() };
  UI.fmPop = null; fmAfterAct(x.id, before); scheduleSave(true); pushToast((x.isTech ? x.name : x.customerName || roLabel(x)) + " snoozed until " + tgWhen(until) + ".", true); }
function fmNudge(ro){ if(!ro || ro.isTech) return; var before = fmFlat(), hd = tgHold(ro), who = hd.to === "tech" ? (ro.assignedTech || hd.who) : hd.who; pushUndo("nudge");
  ro.fmSnz = { until: new Date(Date.now() + 3600000).toISOString(), why: "Nudged " + who, at: nowIso(), by: tgMe() };
  rtLog(ro, { kind: "nudge", at: nowIso(), by: tgMe(), to: hd.to, who: who }); try{ audit("route", roLabel(ro) + " — nudged " + who, ro); }catch(e){}
  fmAfterAct(ro.id, before); scheduleSave(true); pushToast("Nudged " + who + " — back at " + tgWhen(Date.now() + 3600000) + " if nothing moves.", true); }
function fmAccept(ro){ if(!ro) return; var ret = ro.route && ro.route.state === "returned"; pushUndo("accept RO"); rtAccept(ro); delete ro.fmSnz; scheduleSave(true);
  pushToast(roLabel(ro) + (ret ? " — back with you." : " accepted — it’s with you now. Decide when you’re ready."), true); }
function fmMoveTo(id, spot){ var ro = tgRoById(id); if(!ro || spotOf(ro.location) === spot) return; pushUndo("move truck"); var from = tgSpotOf(ro);
  ro.location = spot; if(fmIsBay(spot) && roStatus(ro).status === "Waiting – Parts" && fmHoldReady(ro)){ fmSetSt(ro, "Hold Tech", null); delete ro.fmHold; }
  if(ro.fmPlan) delete ro.fmPlan; UI.fmSel = id; UI.fmFlash = spot; scheduleSave(true);
  var n = fmBayOn() ? fmBayNeed(ro) : null, bad = fmIsBay(spot) && n && !fmBayFits(spot, ro);
  pushToast(roLabel(ro) + " → " + tgSpotLbl(spot) + (from ? " (from " + tgSpotLbl(from) + ")" : "") + (bad ? " — " + tgSpotLbl(spot) + " has no " + FM_NEEDNO[n[0]] + "; this job needs " + FM_NEEDTXT[n[0]] : ro.assignedTech ? " · " + tgFirst(ro.assignedTech) : " · pick a tech: A"), true); }
function fmReassign(id, n){ var ro = tgRoById(id); if(!ro || ro.isTech) return; if(!n){ if(!ro.assignedTech) return; } else if(techSame(ro.assignedTech, n) && ro.fmQ != null) return;
  pushUndo("assign"); if(!n){ ro.assignedTech = ""; ro.fmQ = null; scheduleSave(true); pushToast(roLabel(ro) + " has no tech now.", true); return; }
  fmRoute(ro, n, "Tech + bay"); fmOrder(ro, false); UI.fmSel = id; scheduleSave(true);
  pushToast(tgNum(ro) + " → " + n + (ro.fmQ ? " · #" + ro.fmQ + " in " + fmHis(n) + " order" : "") + (fmFits(n, ro) ? "" : " — " + fmHe(n) + " isn’t marked for " + fmNeed(ro)) + fmPend(ro), true); }
function fmReorder(id, n, beforeId){ var ro = tgRoById(id); if(!ro || fmRoRun(ro) || !(fmWorkable(ro) || fmHoldReady(ro))) return; pushUndo("order"); var was = ro.assignedTech;
  if(!techSame(was, n)) fmRoute(ro, n, "Tech + bay");
  var L = fmUpNext(n).filter(function(x){ return x !== ro; }), i = -1; L.forEach(function(x, j){ if(x.id === beforeId) i = j; }); L.splice(i < 0 ? L.length : i, 0, ro); L.forEach(function(x, j){ x.fmQ = j + 1; }); UI.fmSel = id; scheduleSave(true);
  pushToast(techSame(was, n) ? tgFirst(n) + "’s order: " + tgNum(ro) + " is #" + ro.fmQ + " now — " + fmHe(n) + " sees it on the Console." : tgNum(ro) + " → " + n + " · #" + ro.fmQ + (fmFits(n, ro) ? "" : " — " + fmHe(n) + " isn’t marked for " + fmNeed(ro)) + fmPend(ro), true); }
function fmPunchMsg(p){ return tgFirst(punchWho(p) || "The tech"); }
function fmGo(){
  fmNcClear(); var P = UI.fmPop; if(!P) return; var x = P.ro ? fmGet(P.ro) : null, ro = x && !x.isTech ? x : null, before = fmFlat(), tf = ro && ro.assignedTech ? tgFirst(ro.assignedTech) : "the tech", lbl = tgSpotLbl;
  switch(P.type){
    case "assign": { if(!ro || !P.t) return; pushUndo("assign"); var arr = tyCat(ro) === "arr"; fmRoute(ro, P.t, "Tech + bay");
      if(arr) ro.fmPlan = P.bay ? { bay: P.bay, at: tgEta(ro).eta ? fmH(tgEta(ro).eta) : null } : null; else if(P.bay && P.bay !== tgSpotOf(ro)){ ro.location = P.bay; UI.fmFlash = P.bay; }
      fmOrder(ro, false);
      return fmDone(ro, "userPlus", (arr ? "Planned · " : "Assigned to ") + tgFirst(P.t) + (P.bay ? " · " + lbl(P.bay) : ""), tgNum(ro) + " → " + P.t + (P.bay ? " · " + lbl(P.bay) : "") + (arr ? " when it lands" : "") + (ro.fmQ ? " · #" + ro.fmQ : "") + fmPend(ro), before); }
    case "bring": { if(!ro || !P.bay || !P.t) return; pushUndo("bring in"); var from = tgSpotOf(ro), hold = !!ro.fmHold; ro.location = P.bay; UI.fmFlash = P.bay; if(ro.fmPlan) delete ro.fmPlan;
      if(roStatus(ro).status === "Waiting – Parts") fmSetSt(ro, "Hold Tech", null); fmRoute(ro, P.t, hold ? "Parts arrived" : "Tech + bay"); delete ro.fmHold; fmOrder(ro, hold);
      return fmDone(ro, "bay", "Brought in to " + lbl(P.bay), tgNum(ro) + " → " + lbl(P.bay) + (from ? " (from " + lbl(from) + ")" : "") + " · " + tgFirst(P.t) + (hold ? " · #1" : " next") + fmPend(ro), before); }
    case "road": { if(!ro) return; pushUndo("road test");
      if((P.m || "send") === "send"){ var who = P.t === "me" ? tgMe() : P.t, W = ["now", "at " + fmHM(fmNowH() + 1), "after lunch"][P.w || 0]; ro.fmRt = { who: who, when: W, at: nowIso(), by: tgMe() }; rtLog(ro, { kind: "note", at: nowIso(), by: tgMe(), to: "tech", who: who, note: "Road test — " + W });
        return fmDone(ro, "road", "Road test · " + tgFirst(who), "Road test for " + tgNum(ro) + " — " + (P.t === "me" ? "you" : who) + ", " + W + ".", before); }
      ro.roadTest = { miles: String(P.mi || "").trim(), start: "", result: P.res || "Pass", checked: String(P.note || "").trim(), at: nowIso(), by: tgMe() };
      return fmDone(ro, "road", "Road test logged · " + (P.res || "Pass").toLowerCase(), "Road test logged — " + (P.res || "Pass").toLowerCase() + ((P.res || "Pass") === "Pass" ? (fmQcApplies(ro) ? ". QC is next." : ".") : " · it comes back to you to decide."), before); }
    case "decide": { if(!ro) return; var fo = fmFound(ro), op = fo.filter(function(o){ return o.id === P.op; })[0] || fo[fo.length - 1] || null, O = fmDecOpts(ro, op, P), o = O[P.o]; if(!o) return; var nn = op ? raN(ro, op) : null;
      if(o.a === "look") return fmSnooze(ro, Date.now() + 3600000, "Looking at it");
      if(o.a === "parts") return fmOpenPop("hold", ro.id, {});
      if(o.a === "go" && op && opRealParts(op).length && !opRealParts(op).every(fcPartIn) && !ro.fmCb) return fmOpenPop("hold", ro.id, { pend: { op: op.id, h: +P.h } });
      pushUndo("decide"); if(op && P.h != null && +P.h >= 0) op.quoted = +P.h; var cbm = !!ro.fmCb;
      if(o.a === "back"){ fmSetSt(ro, "Hold Tech", null); fmRoute(ro, ro.assignedTech || "", "Approved — go ahead"); return fmDone(ro, "check", "Go ahead — back to " + tf, tgNum(ro) + " back to " + (ro.assignedTech || "the tech") + " · go ahead" + fmPend(ro), before); }
      if(o.a === "case"){ if(op) op.fmDec = { s: "case", at: nowIso(), by: tgMe() }; rtSend(ro, "warranty", null, op ? "Op " + nn + ": " + (op.complaint || "") : "", null, { reason: cbm ? "Warranty claim" : "Tech support case" }); fmSetSt(ro, "Waiting – Tech Support", "Case opened");
        return fmDone(ro, "swap", (op ? "Op " + nn + " · " : "") + "to Warranty", tgNum(ro) + " to Warranty" + (op ? " with op " + nn + " attached" : "") + fmPend(ro), before); }
      if(o.a === "quote"){ if(op) op.fmDec = { s: "quote", at: nowIso(), by: tgMe() }; rtSend(ro, "writer", null, op ? "Op " + nn + " to quote: " + (op.complaint || "") + " · " + fmHh(+op.quoted || 0) : "", null, { reason: "Approval needed" }); fmSetSt(ro, "Waiting – Customer", "Approval pending");
        return fmDone(ro, "swap", (op ? "Op " + nn + " quoted · " : "") + "to Approval", (op ? "Op " + nn + " “" + (op.complaint || "") + "” is on the estimate · " : "") + tgNum(ro) + " to Approval" + fmPend(ro), before); }
      if(o.a === "rec"){ op.fmRec = true; op.declined = true; op.appr = { s: "no", by: tgMe(), at: nowIso(), who: tgMe(), role: "Foreman", how: "In person", po: "", amt: 0, reason: "Recommended — next visit" }; op.fmDec = { s: "rec", at: nowIso(), by: tgMe() };
        fmSetSt(ro, "Hold Tech", null); fmRoute(ro, ro.assignedTech || "", "Repair", "Op " + nn + " recommended for the next visit — finish the rest");
        return fmDone(ro, "note", "Op " + nn + " recommended", "Op " + nn + " saved as recommended on " + tgNum(ro) + " — " + tf + " finishes the rest.", before); }
      if(o.a === "go"){ op.appr = { s: "ok", by: tgMe(), at: nowIso(), who: tgMe(), role: "Foreman", how: "In person", po: "", amt: 0, reason: cbm ? "Comeback — no charge" : "" }; op.fmDec = { s: "go", cb: cbm, at: nowIso(), by: tgMe() };
        fmSetSt(ro, "Hold Tech", null); fmRoute(ro, ro.assignedTech || "", "Approved — go ahead", "Go ahead on op " + nn + (cbm ? " — comeback, no charge" : ""));
        return fmDone(ro, "check", "Op " + nn + " approved · back to " + tf, "Op " + nn + " “" + (op.complaint || "") + "” approved" + (cbm ? " as comeback work, no charge" : "") + " — back to " + (ro.assignedTech || "the tech") + fmPend(ro), before); }
      return; }
    case "review": { if(!ro || P.o == null) return;
      if(P.o === 1) return fmSnooze(ro, Date.now() + 2 * 3600000, "Over the quote — check again");
      if(P.o === 2) return fmNudge(ro);
      pushUndo("quote over"); rtSend(ro, "writer", null, fmHh(roInfo(ro).b) + " on " + fmHh(roInfo(ro).q) + " quoted", null, { reason: "Quote over" });
      return fmDone(ro, "swap", "To Approval · quote over", tgNum(ro) + " to Approval · quote over — they call " + String(ro.customerName || "the customer").split(" ")[0] + fmPend(ro), before); }
    case "xfer": { if(!ro || !P.to || !P.why) return; var wh = P.to === "tech" ? (P.who || ro.assignedTech) : null; if(P.to === "tech" && !wh) return; pushUndo("transfer");
      rtSend(ro, P.to, wh ? fmTechName(wh) : null, P.note || "", null, { reason: P.why }); if(roStatus(ro).status === "Waiting – Foreman" && P.to === "tech") fmSetSt(ro, "Hold Tech", null);
      return fmDone(ro, "swap", "To " + RT_LBL[P.to], tgNum(ro) + " to " + (P.to === "tech" ? wh : RT_LBL[P.to]) + " · " + P.why + (ro.route && ro.route.state === "pending" ? " — waiting for them to accept." : "."), before); }
    case "stopclk": { var p = STATE.punches.filter(function(q){ return q.id === P.pid; })[0]; if(!p || p.stop) return; var s0 = new Date(p.start).getTime(), sh = fmShift(punchWho(p)), eS = new Date(s0); eS.setHours(Math.floor(sh[1]), Math.round((sh[1] % 1) * 60), 0, 0);
      var end = (P.o || 0) === 0 ? Math.max(eS.getTime(), s0 + 15 * 60000) : Date.now(); pushUndo("stop clock"); p.stop = new Date(end).toISOString(); p.stopReason = "End of day"; p.fmFixed = { at: nowIso(), by: tgMe() }; try{ creditBurnt(p); }catch(e){}
      try{ audit("punch", roLabel(ro) + " — " + (punchWho(p) || "a") + "’s clock stopped by the foreman at " + tgWhen(end), ro); }catch(e){}
      return fmDone(ro, "clock", "Clock stopped " + tgWhen(end), fmPunchMsg(p) + "’s clock on " + tgNum(ro) + " stopped at " + tgWhen(end) + " · " + tgDur(end - s0) + ".", before); }
    case "fixclk": { var pq = STATE.punches.filter(function(q){ return q.id === P.pid; })[0]; if(!pq) return; pushUndo("fix clock");
      if((P.o || 0) === 1){ pq.fmLunchOk = true; return fmDone(ro, "clock", "Worked through lunch", "Kept — " + fmPunchMsg(pq) + " worked through lunch. Noted on " + tgNum(ro) + ".", before); }
      var L = fmCfg().lunch, d0 = new Date(pq.start); d0.setHours(0, 0, 0, 0); var l0 = new Date(d0.getTime() + L[0] * 3600000), l1 = new Date(d0.getTime() + L[1] * 3600000);
      var np = { id: uid("pn"), roId: pq.roId, opId: pq.opId, start: l1.toISOString(), stop: pq.stop, startReason: pq.startReason, stopReason: pq.stopReason, notes: "", by: pq.by, fmLunchOk: true };
      pq.stop = l0.toISOString(); pq.stopReason = "Lunch"; pq.fmLunchOk = true; STATE.punches.push(np); try{ creditBurnt(pq); }catch(e){}
      return fmDone(ro, "clock", "Lunch taken out", "Lunch taken out of " + fmPunchMsg(pq) + "’s clock on " + tgNum(ro) + " · " + fmHM(L[0]) + "–" + fmHM(L[1]) + ".", before); }
    case "repeat": { if(!ro) return; var R = fmRep(ro); if(!R) return; var o2 = P.o || 0;
      if(o2 === 3) return fmSnooze(ro, Date.now() + 3600000, "Looking at the last visit");
      pushUndo("back again"); ro.fmRep = { ok: true, s: o2 === 2 ? "no" : "cb", of: R.prev.id, at: nowIso(), by: tgMe() };
      if(o2 === 2) return fmDone(ro, "check", "Not related", "Not related — " + tgNum(ro) + " goes on as a normal repair.", before);
      ro.fmCb = { of: R.prev.id, num: tgNum(R.prev), at: nowIso() };
      if(o2 === 0 && R.tech){ fmRoute(ro, R.tech, "Comeback", "Comeback on " + roLabel(R.prev)); fmOrder(ro, false); return fmDone(ro, "history", "Comeback — back to " + tgFirst(R.tech), tgNum(ro) + " flagged comeback · back to " + R.tech + fmPend(ro), before); }
      fmClear(ro, "history", "Flagged comeback"); scheduleSave(true); UI.fmPop = { type: "assign", ro: ro.id, i: 0 }; pushToast(tgNum(ro) + " flagged comeback — pick the tech."); return; }
    case "rtfail": { if(!ro) return; var o3 = P.o || 0, rtk = (ro.roadTest && ro.roadTest.at) || "1";
      if(o3 === 1){ pushUndo("road test"); ro.fmRt = { who: tgMe(), when: "now", at: nowIso(), by: tgMe() }; scheduleSave(true); return fmSnooze(ro, Date.now() + 3600000, "You’re driving it"); }
      pushUndo("road test failed"); ro.fmRtOk = rtk;
      if(o3 === 0){ fmSetSt(ro, "Hold Tech", null); fmRoute(ro, ro.assignedTech || "", "Repair", "Road test failed" + (ro.roadTest && ro.roadTest.checked ? " — " + ro.roadTest.checked : "")); fmOrder(ro, true); return fmDone(ro, "road", "Redo — back to " + tf, tgNum(ro) + " back to " + (ro.assignedTech || "the tech") + " for a redo · #1" + fmPend(ro), before); }
      if(o3 === 2){ fmSetSt(ro, "Hold Tech", null); fmClear(ro, "road", "Road test failed — new tech"); scheduleSave(true); UI.fmPop = { type: "assign", ro: ro.id, i: 0 }; pushToast("Pick who redoes " + tgNum(ro) + "."); return; }
      rtSend(ro, "writer", null, "More work found on the road test" + (ro.roadTest && ro.roadTest.checked ? " — " + ro.roadTest.checked : ""), null, { reason: "Approval needed" }); fmSetSt(ro, "Waiting – Customer", "Approval pending");
      return fmDone(ro, "swap", "To Approval · more work found", tgNum(ro) + " to Approval · more work found after the road test" + fmPend(ro), before); }
    case "give": { if(!x || !x.isTech) return; var n = x.name, C = fmCands(n), pk = C.filter(function(c){ return c.r.id === P.pick; })[0]; if(!pk) return; var c = pk.r, was = c.assignedTech; pushUndo("give work");
      if(!pk.inb && P.bay){ c.location = P.bay; UI.fmFlash = P.bay; } if(c.fmPlan) delete c.fmPlan; if(roStatus(c).status === "Waiting – Parts"){ fmSetSt(c, "Hold Tech", null); delete c.fmHold; }
      fmRoute(c, n, "Tech + bay"); delete c.fmSnz; fmOrder(c, true); fmClear(c, "userPlus", "Given to " + tgFirst(n) + (pk.inb ? "" : P.bay ? " · " + lbl(P.bay) : "")); UI.fmPop = null; UI.fmSel = c.id; scheduleSave(true);
      pushToast(tgNum(c) + " → " + n + (pk.inb ? " in " + lbl(tgSpotOf(c)) : P.bay ? " · " + lbl(P.bay) : "") + (was && !techSame(was, n) ? " (was " + tgFirst(was) + ")" : "") + " · #1" + fmPend(c), true); return; }
    case "fill": { var Cf = fmFillCands(P.bay, P.at), pf = Cf.filter(function(c){ return c.r.id === P.pick; })[0]; if(!pf || !P.t) return; var cr = pf.r, wasT = cr.assignedTech; pushUndo("fill a bay"); fmRoute(cr, P.t, "Tech + bay");
      if(P.at != null){ cr.fmPlan = { bay: P.bay, at: P.at }; fmOrder(cr, false); fmClear(cr, "bay", "Planned into " + lbl(P.bay) + " ~" + fmHM(P.at)); UI.fmPop = null; UI.fmSel = cr.id; scheduleSave(true); pushToast(tgNum(cr) + " planned into " + lbl(P.bay) + " at ~" + fmHM(P.at) + " · " + P.t + ".", true); return; }
      cr.location = P.bay; if(cr.fmPlan) delete cr.fmPlan; if(roStatus(cr).status === "Waiting – Parts"){ fmSetSt(cr, "Hold Tech", null); delete cr.fmHold; } UI.fmFlash = P.bay; fmOrder(cr, true);
      return fmDone(cr, "bay", "Brought in to " + lbl(P.bay), tgNum(cr) + " → " + lbl(P.bay) + " · " + P.t + (wasT && !techSame(wasT, P.t) ? " (was " + tgFirst(wasT) + ")" : "") + fmPend(cr), before); }
    case "risk": { if(!ro) return; var k = fmRisk(ro) || { ready: fmFreeAt(ro).t, ph: fmH(new Date(ro.promisedAt).getTime()) }, ft = fmFreeTechs().map(function(y){ return y.n; }), o4 = P.o || 0, late = k.ready != null;
      if(late && o4 === 2) return fmSnooze(ro, Math.max(fmDayMs(k.ph), Date.now() + 1800000), "It’ll make it");
      if(!late && o4 === 2) return fmSnooze(ro, Date.now() + 2 * 3600000, "Keeping the promise");
      if(late && o4 === 1 && !ft.length){ UI.fmPop = { type: "assign", ro: ro.id, i: 0 }; render(); return; }
      pushUndo("promise"); ro.fmRiskOk = ro.promisedAt;
      if(late && o4 === 1){ ro.fmHelper = ft[0]; return fmDone(ro, "userPlus", tgFirst(ft[0]) + " helping", ft[0] + " helps on " + lbl(tgSpotOf(ro)) + " — ready ~" + fmHM(fmFreeAt(ro).t || fmNowH()) + ".", before); }
      if(!late && o4 === 1){ rtSend(ro, "parts", null, "Promised " + tgWhen(new Date(ro.promisedAt).getTime()), null, { reason: "Promised today" }); return fmDone(ro, "swap", "Chasing the part", tgNum(ro) + " to Parts · chase the part — promised today" + fmPend(ro), before); }
      rtSend(ro, "writer", null, late ? "Won’t make " + tgWhen(new Date(ro.promisedAt).getTime()) + " — new time ~" + fmHM(Math.ceil(k.ready * 4) / 4) : "Can’t finish today — " + fmFreeAt(ro).txt, null, { reason: "Customer question" });
      return fmDone(ro, "swap", "To Approval · new time", "Approval will tell " + String(ro.customerName || "the customer").split(" ")[0] + (late ? " the new time: ~" + fmHM(Math.ceil(k.ready * 4) / 4) : ": " + fmFreeAt(ro).txt) + ".", before); }
    case "plan": { var Lp = P.list.map(tgRoById).filter(function(r){ return r && P.plan[r.id] && P.plan[r.id].on && P.plan[r.id].t; }); if(!Lp.length) return; pushUndo("plan together"); var out = [];
      Lp.forEach(function(r){ var q = P.plan[r.id], arr = tyCat(r) === "arr"; fmRoute(r, q.t, "Tech + bay");
        if(arr) r.fmPlan = q.bay ? { bay: q.bay, at: tgEta(r).eta ? fmH(tgEta(r).eta) : null } : null;
        else if(q.bay && !fmInBay(r)){ r.location = q.bay; if(roStatus(r).status === "Waiting – Parts" && fmHoldReady(r)){ fmSetSt(r, "Hold Tech", null); delete r.fmHold; } }
        fmOrder(r, false); delete r.fmSnz; fmClear(r, "userPlus", "Planned · " + tgFirst(q.t) + (q.bay ? " · " + lbl(q.bay) : "")); out.push(tgNum(r) + " → " + tgFirst(q.t) + (q.bay ? " · " + lbl(q.bay) : arr ? " when it lands" : "")); });
      UI.fmBs = []; UI.fmPop = null; fmAfterAct(Lp[0].id, before); scheduleSave(true); pushToast(Lp.length + " assigned — " + out.join(", ") + ". Each tech has them on the Console.", true); return; }
    case "hold": { if(!ro) return; var pd = P.pend, waiting = roStatus(ro).status === "Waiting – Parts" && !pd, tk = ro.assignedTech || "", E = fmEtaOpts(ro), eo = E[P.e || 0] || E[0], fromB = fmInBay(ro) ? tgSpotOf(ro) : null, lot = fmFreeLot()[0];
      var nx = waiting || !tk ? null : fmCands(tk).filter(function(c){ return c.r.id !== ro.id && c.fit !== false; })[0]; pushUndo("hold for parts"); var msg = [];
      if(pd){ var op5 = fmOpById(pd.op); if(op5){ if(pd.h != null && +pd.h >= 0) op5.quoted = +pd.h; op5.appr = { s: "ok", by: tgMe(), at: nowIso(), who: tgMe(), role: "Foreman", how: "In person", po: "", amt: 0, reason: "" }; op5.fmDec = { s: "go", at: nowIso(), by: tgMe() }; } }
      var run5 = fmRoRun(ro); if(run5){ run5.stop = nowIso(); run5.stopReason = "Waiting – Parts"; try{ creditBurnt(run5); }catch(e){} }
      raLive(ro).forEach(function(op){ opRealParts(op).forEach(function(pt){ if(!fcPartIn(pt) && eo[1] && !pt.eta) pt.eta = eo[1]; }); });
      var subP = raLive(ro).some(function(op){ return opRealParts(op).some(function(pt){ return pt.status === "Backordered"; }); }) ? "Backordered" : raLive(ro).some(function(op){ return opRealParts(op).some(function(pt){ return !pt.status || pt.status === "Not Ordered"; }); }) ? "Not Ordered" : "Ordered";
      fmSetSt(ro, "Waiting – Parts", subP);
      ro.fmHold = { at: nowIso(), d: eo[1] || null, h: eo[2], back: P.bk && tk ? tk : null, op: pd && fmOpById(pd.op) ? fmOpById(pd.op).complaint : roInfo(ro).complaint, by: tgMe() };
      if(fromB && P.mv && lot){ ro.location = lot; UI.fmFlash = fromB; msg.push("→ " + lbl(lot) + ", " + lbl(fromB) + " is free"); } else if(fromB) ro.fmBayOk = true;
      if(nx && P.nx){ var cn = nx.r; if(!nx.inb && fromB && P.mv && fmBayFits(fromB, cn)) cn.location = fromB; if(roStatus(cn).status === "Waiting – Parts"){ fmSetSt(cn, "Hold Tech", null); delete cn.fmHold; } fmRoute(cn, tk, "Tech + bay"); fmOrder(cn, true); fmClear(cn, "userPlus", "Given to " + tgFirst(tk)); msg.push(tgFirst(tk) + " takes " + tgNum(cn) + (fmInBay(cn) ? " in " + lbl(tgSpotOf(cn)) : "")); }
      if(ro.route && ro.route.to === "foreman"){ rtSend(ro, "parts", null, ro.fmHold.op || "", null, { reason: "Parts needed" }); }
      fmClear(ro, "parts", "Hold for parts · " + (eo[1] ? fmDayRel(eo[1]) : "no date yet")); delete ro.fmSnz; UI.fmSel = ro.id; fmAfterAct(ro.id, before); scheduleSave(true);
      if(P.ret){ UI.fmPop = { type: "plan", ro: null, list: P.ret.list, plan: fmAutoPlan(P.ret.list.map(tgRoById).filter(Boolean)), ex: null }; } else UI.fmPop = null;
      pushToast(tgNum(ro) + " on hold for parts · " + (eo[1] ? fmDayRel(eo[1]) : "no date yet") + (msg.length ? " · " + msg.join(" · ") : "") + ".", true); return; }
    case "qc": { if(!ro) return; var o6 = P.o || 0;
      if(o6 === 2) return fmSnooze(ro, Date.now() + 1800000, "QC — looking");
      pushUndo("QC");
      if(o6 === 0){ var open = fmQcAuto(ro).filter(function(c){ return !c.ok; }).map(function(c){ return c.t; }).concat(FM_QCM.filter(function(m, i){ return (P.m || []).indexOf(i) < 0; }));
        ro.fmQc = { s: "pass", at: nowIso(), by: tgMe(), open: open }; try{ audit("route", roLabel(ro) + " — QC passed" + (open.length ? " with " + open.length + " open: " + open.join("; ") : ""), ro); }catch(e){}
        return fmDone(ro, "check", "QC passed", tgNum(ro) + " passed QC" + (open.length ? " with " + open.length + " open item" + (open.length > 1 ? "s" : "") + " noted" : "") + " — it’s on Triage under Ready to go.", before); }
      var w = FM_QWHY[P.w || 0]; ro.fmQc = { s: "back", why: w, at: nowIso(), by: tgMe() }; fmSetSt(ro, "Hold Tech", null); fmRoute(ro, ro.assignedTech || "", "Repair", "QC: " + w); fmOrder(ro, true);
      return fmDone(ro, "swap", "QC — back to " + tf + " · " + w, tgNum(ro) + " back to " + (ro.assignedTech || "the tech") + " · " + w + " — top of " + (ro.assignedTech ? fmHis(ro.assignedTech) : "their") + " order.", before); }
    case "book": { var cu = String(P.cust || "").trim(); if(!cu) return; pushUndo("booking"); var T = fmTmr(); T.book.push({ id: uid("bk"), d: fmTmrDay(), cust: cu, ro: String(P.roN || "").trim(), cmp: String(P.cmp || "").trim(), at: P.at, q: P.q });
      UI.fmPop = null; UI.fmNote = null; scheduleSave(true); pushToast("Booking added for " + fmDayName(fmTmrDay()) + " — " + cu + ", " + fmHM(P.at) + ".", true); return; }
  }
}
function fmTmMove(id, k, before){ var R = fmTmPlan(), T = fmTmr(); pushUndo("plan tomorrow"); Object.keys(T.P).forEach(function(t){ T.P[t] = T.P[t].filter(function(n){ return n !== id; }); }); T.un = T.un.filter(function(n){ return n !== id; });
  var L = k ? (T.P[k] || (T.P[k] = [])) : T.un, i = before ? L.indexOf(before) : -1; L.splice(i < 0 ? L.length : i, 0, id); UI.fmTsel = null; UI.fmNote = null; scheduleSave(true); render(); }

/* ---------- the click side ---------- */
function fmAct(a, t, e){
  fmNcClear(); var id = t.dataset.ro, P = UI.fmPop;
  switch(a){
    case "fm-sel": { if(e && e.target.closest && e.target.closest("button:not([data-action='fm-sel'])") && e.target.closest("button") !== t) return true;
      UI.fmSel = id; UI.fmKB = false; UI.fmPop = null; render(); return true; }
    case "fm-do": UI.fmKB = false; fmDo(id); return true;
    case "fm-pop": fmOpenPop(t.dataset.p, id || null); return true;
    case "fm-pop-x": UI.fmPop = null; render(); return true;
    case "fm-view": UI.fmView = t.dataset.v; UI.fmPop = null; UI.yardPick = null; persistUI(); render(); return true;
    case "fm-filt": { var k = t.dataset.k || null; UI.fmFilter = !k || UI.fmFilter === k ? null : k; UI.fmPop = null; var L = fmFlat(); if(L.length && L.indexOf(UI.fmSel) < 0) UI.fmSel = L[0]; render(); return true; }
    case "fm-open": { var kk = t.dataset.k; UI.fmOpen = UI.fmOpen || {}; UI.fmOpen[kk] = t.dataset.force && !UI.fmOpen[kk] ? true : !UI.fmOpen[kk]; render();
      if(kk === "clr" && UI.fmOpen.clr){ var s = document.querySelector(".fm .tg-scroll"), c = document.querySelector('.fm .tg-sec[data-k="clr"]'); if(s && c) s.scrollTop = c.offsetTop - 60; } return true; }
    case "fm-wake": { var r = getRO(id); if(r && r.fmSnz){ pushUndo("wake"); r.fmSnz.until = nowIso(); UI.fmSel = id; scheduleSave(true); render(); } return true; }
    case "fm-help": UI.modal = { type: "shortcuts" }; render(); return true;
    case "fm-srch": UI.fmPop = null; psmOpen("foreman"); return true;
    case "fm-sr-pick": UI.fmSel = id; UI.fmSrch = false; UI.fmQ = ""; render(); return true;
    case "fm-daymode": UI.fmDay = t.dataset.v === "1"; UI.fmPop = null; persistUI(); render(); return true;
    case "fm-fill": UI.fmPop = { type: "fill", bay: t.dataset.bay, at: t.dataset.at != null ? +t.dataset.at : null, ro: null }; UI.fmPopTop = null; UI.fmSrch = false; UI.fmFillAnchor = t.dataset.at != null ? 'gap:' + t.dataset.bay : 'bay:' + t.dataset.bay; render(); return true;
    case "fm-set": { if(!P) return true; var f = t.dataset.f, v = t.dataset.v; if(t.dataset.n) v = +v; if(t.dataset.b) v = v === "1" || v === 1;
      if(/^pb:/.test(f)){ var rid = f.slice(3); Object.keys(P.plan).forEach(function(q){ if(q !== rid && v && P.plan[q].bay === v) P.plan[q].bay = ""; }); if(P.plan[rid]) P.plan[rid].bay = v; render(); return true; }
      if(P.type === "assign" && f === "need"){ var ro0 = tgRoById(P.ro); if(ro0){ ro0.fmNeed = v || null; if(!v) ro0.fmNeed = null; scheduleSave(true); P.t = null; P.bay = null; } render(); return true; }
      P[f] = v; if(t.dataset.reset) P[t.dataset.reset] = null; render(); return true; }
    case "fm-go": fmGo(); return true;
    case "fm-snz-pick": { var x = fmGet(P && P.ro); if(x) fmSnooze(x, tgWhenOpts()[+t.dataset.i][1], ""); return true; }
    case "fm-bsel": { var bs = UI.fmBs || (UI.fmBs = []), j = bs.indexOf(id); if(j < 0) bs.push(id); else bs.splice(j, 1); render(); return true; }
    case "fm-bclr": UI.fmBs = []; render(); return true;
    case "fm-plan": { var Lp = (t.dataset.g === "sel" ? (UI.fmBs || []).map(tgRoById).filter(Boolean) : fmPlanList()); if(!Lp.length) return true; Lp.sort(function(a, b){ return fmPOrd(a) - fmPOrd(b); });
      UI.fmPop = { type: "plan", ro: null, list: Lp.map(function(r){ return r.id; }), plan: fmAutoPlan(Lp), ex: null }; UI.fmPopTop = null; UI.fmSrch = false; render(); return true; }
    case "fm-pon": { if(P && P.plan && P.plan[id]){ P.plan[id].on = !P.plan[id].on; render(); } return true; }
    case "fm-pex": { if(P){ P.ex = P.ex === id ? null : id; render(); } return true; }
    case "fm-pt": { if(P && P.plan && P.plan[id]){ P.plan[id].t = t.dataset.k; render(); } return true; }
    case "fm-pfree": { if(P && P.type === "plan"){ var lst = P.list; fmOpenPop("hold", id, { ret: { list: lst } }); } return true; }
    case "fm-skt": { var T = fmGet(P && P.ro), sf = T && T.isTech ? fmSf(T.name) : null; if(!sf) return true; pushUndo("skills"); if(!Array.isArray(sf.fmSkills)) sf.fmSkills = []; var sk = t.dataset.s, i2 = sf.fmSkills.indexOf(sk); if(i2 < 0) sf.fmSkills.push(sk); else sf.fmSkills.splice(i2, 1); scheduleSave(true); render(); return true; }
    case "fm-off": { var T2 = fmGet(P && P.ro), sf2 = T2 && T2.isTech ? fmSf(T2.name) : null; if(!sf2) return true; pushUndo("time off"); if(!Array.isArray(sf2.fmOff)) sf2.fmOff = []; var d = t.dataset.k === "tmr" ? fmTmrDay() : todayStr();
      var had = sf2.fmOff.some(function(o){ return o.d === d && o.from == null; }); sf2.fmOff = sf2.fmOff.filter(function(o){ return !(o.d === d && o.from == null) && o.d >= todayStr(); }); if(!had) sf2.fmOff.push({ d: d, from: null, to: null, why: "Off" });
      if(STATE.fmTmr && d === fmTmrDay()) STATE.fmTmr.P = null; UI.fmNote = null; scheduleSave(true); render(); return true; }
    case "fm-cfg": { var c2 = fmCfg(), ff = t.dataset.f, vv = t.dataset.v; pushUndo("Foreman settings"); if(ff === "qc") c2.qc = vv; else if(ff === "badge"){ var i3 = c2.badge.indexOf(vv); if(i3 < 0) c2.badge.push(vv); else c2.badge.splice(i3, 1); } scheduleSave(true); render(); return true; }
    case "fm-bt": { var c3 = fmCfg(), b = t.dataset.b, fb = t.dataset.f, L3 = c3.bays[b] || (c3.bays[b] = []), i4 = L3.indexOf(fb); pushUndo("bay types"); if(i4 < 0) L3.push(fb); else L3.splice(i4, 1); if(!L3.length) delete c3.bays[b]; scheduleSave(true); render(); return true; }
    case "fm-clash": UI.fmClash = t.dataset.spot; UI.fmView = "yard"; UI.yardPick = null; render(); return true;
    case "fm-clash-x": UI.fmClash = null; render(); return true;
    case "fm-keep": { var cl = tgClashes().filter(function(c){ return c.spot === UI.fmClash; })[0]; if(!cl) return true; var other = cl.ros.filter(function(r){ return r.id !== id; })[0];
      UI.fmClash = null; UI.fmSel = other.id; UI.yardPick = other.id; render(); pushToast(tgNum(getRO(id)) + " stays in " + tgSpotLbl(cl.spot) + " — pick a spot for " + tgNum(other) + "."); return true; }
    case "fm-tsel": { if(e && e.target.closest && e.target.closest("[data-action='fm-tmv'],[data-action='fm-tmdel'],[data-action='fm-sel']")) return true; UI.fmTsel = UI.fmTsel === t.dataset.id ? null : t.dataset.id; render(); return true; }
    case "fm-tmv": fmTmMove(t.dataset.id, t.dataset.k, null); return true;
    case "fm-tmdel": { var T3 = fmTmr(); pushUndo("booking"); T3.book = T3.book.filter(function(b){ return b.id !== t.dataset.id; }); UI.fmTsel = null; UI.fmNote = null; scheduleSave(true); render(); return true; }
    case "fm-tmauto": { var R = fmTmPlan(), T4 = fmTmr(), n0 = T4.un.length; pushUndo("plan tomorrow"); var A = fmTmAuto(R.L, T4.P); T4.P = A.P; T4.un = A.un; UI.fmNote = null; scheduleSave(true); var placed = n0 - T4.un.length;
      pushToast(placed > 0 ? "Planned " + placed + " more for " + fmDayName(fmTmrDay()) + "." : "Nothing else fits — " + T4.un.length + " still need a tech with the skill or the hours.", true); return true; }
    case "fm-tmreset": UI.fmNote = null; render(); return true;
    case "fm-tmsend": { var ta = document.getElementById("fm-note"), txt = ta ? ta.value : (UI.fmNote != null ? UI.fmNote : fmTmNote()), R2 = fmTmPlan(); pushUndo("handoff note");
      STATE.fmNote = { d: fmTmrDay(), text: String(txt || "").trim(), at: nowIso(), by: tgMe() };
      Object.keys(R2.P).forEach(function(k){ var n2 = 0; (R2.P[k] || []).forEach(function(id2){ var r2 = tgRoById(id2); if(r2){ n2++; if(!techSame(r2.assignedTech, k)) fmRoute(r2, k, "Tech + bay"); r2.fmQ = n2; } }); });
      UI.fmNote = null; scheduleSave(true); pushToast("Handoff note set for " + fmDayName(fmTmrDay()) + " — it’s on every Console, and each tech’s first job is #1.", true); return true; }
  }
  return false;
}

/* ---------- typing, keys, dragging ---------- */
document.addEventListener("input", function(e){
  var t = e.target; if(!t || !t.dataset || !t.dataset.fmIn) return; var k = t.dataset.fmIn, v = t.value, P = UI.fmPop;
  if(k === "q"){ UI.fmQ = v; UI.fmSri = 0; var pop = document.querySelector(".fm .tg-srpop"); if(pop) pop.innerHTML = fmSearchHtml(); return; }
  if(k === "note"){ UI.fmNote = v; return; }
  if(!P) return;
  if(k === "op-h"){ P.h = v; return; } if(k === "xf-note"){ P.note = v; return; } if(k === "rt-mi"){ P.mi = v; return; } if(k === "rt-note"){ P.note = v; return; }
  if(k === "bk-cust"){ P.cust = v; var b = document.querySelector('.tg-pop.fm-book [data-action="fm-go"]'); if(b) b.disabled = !v.trim(); return; } if(k === "bk-ro"){ P.roN = v; return; } if(k === "bk-cmp"){ P.cmp = v; return; }
}, true);
document.addEventListener("change", function(e){
  var t = e.target; if(!t || !t.dataset) return; var P = UI.fmPop;
  if(t.dataset.fmCk && P){ var k = t.dataset.fmCk; if(k === "qm"){ var i = +t.dataset.i, m = P.m || (P.m = []), j = m.indexOf(i); if(t.checked && j < 0) m.push(i); if(!t.checked && j > -1) m.splice(j, 1); } else P[k] = t.checked; render(); return; }
  var k2 = t.dataset.fmIn; if(!k2) return;
  if((k2 === "sh-s" || k2 === "sh-e" || k2 === "out") && P){ var T = fmGet(P.ro), sf = T && T.isTech ? fmSf(T.name) : null; if(!sf) return; pushUndo("shift");
    if(k2 === "out"){ if(!Array.isArray(sf.fmOff)) sf.fmOff = []; sf.fmOff = sf.fmOff.filter(function(o){ return !(o.d === todayStr() && o.from != null); }); if(t.value !== "") sf.fmOff.push({ d: todayStr(), from: +t.value, to: 24, why: "out from " + fmHM(+t.value) }); }
    else { var sh = fmShift(T.name); sf.fmShift = { s: k2 === "sh-s" ? +t.value : sh[0], e: k2 === "sh-e" ? +t.value : sh[1] }; }
    scheduleSave(true); render(); return; }
  if(/^c-/.test(k2)){ var c = fmCfg(); pushUndo("shop day"); if(k2 === "c-s") c.start = +t.value; else if(k2 === "c-e") c.end = +t.value; else if(k2 === "c-l0") c.lunch = [+t.value, Math.max(+t.value + 0.25, c.lunch[1])]; else if(k2 === "c-l1") c.lunch = [Math.min(c.lunch[0], +t.value - 0.25), +t.value]; scheduleSave(true); render(); return; }
}, true);
document.addEventListener("pointerdown", function(e){
  if(UI.view !== "foreman") return; var path = e.composedPath ? e.composedPath() : [e.target];
  var within = function(sel){ return path.some(function(n){ return n && n.nodeType === 1 && n.matches && n.matches(sel); }); };
  if(within(".modal, .overlay, .toast-wrap")) return; var ch = false;
  if(UI.fmPop && !within(".fm .tg-pop, [data-action='fm-pop'], [data-action='fm-do'], [data-action='fm-fill'], [data-action='fm-plan'], [data-action='fm-pfree']")){ UI.fmPop = null; ch = true; }
  if(UI.fmSrch && !within(".fm .tg-srch, .fm .tg-srpop, [data-action='fm-srch']")){ UI.fmSrch = false; UI.fmQ = ""; ch = true; }
  if(ch) render();
}, true);
function fmMove(d){ var L = fmFlat(); if(!L.length) return; UI.fmKB = true; var i = L.indexOf(UI.fmSel); UI.fmSel = i < 0 ? L[d > 0 ? 0 : L.length - 1] : L[Math.max(0, Math.min(L.length - 1, i + d))]; render(); }
document.addEventListener("keydown", function(e){
  if(UI.view !== "foreman" || UI.palette || UI.fmView === "ros") return;
  var k = e.key, t = (e.composedPath && e.composedPath()[0]) || e.target, inF = t && (/^(input|textarea|select)$/i.test(t.tagName || "") || t.isContentEditable);
  var stop = function(){ e.preventDefault(); e.stopPropagation(); };
  if(UI.modal) return; if(e.ctrlKey || e.metaKey || e.altKey) return;
  if(UI.fmSrch){ var rows = document.querySelectorAll(".fm .tg-srpop .tg-sr[data-ro]");
    if(k === "Escape"){ UI.fmSrch = false; UI.fmQ = ""; render(); return stop(); }
    if(k === "ArrowDown" || k === "ArrowUp"){ if(rows.length){ UI.fmSri = ((UI.fmSri || 0) + (k === "ArrowDown" ? 1 : -1) + rows.length) % rows.length; rows.forEach(function(r, i){ r.classList.toggle("k", i === UI.fmSri); }); } return stop(); }
    if(k === "Enter"){ var el = rows[UI.fmSri || 0] || rows[0]; if(el){ UI.fmSel = el.dataset.ro; UI.fmSrch = false; UI.fmQ = ""; render(); } return stop(); }
    if(inF) return; }
  var P = UI.fmPop;
  if(P){
    if(k === "Escape"){ UI.fmPop = null; render(); return stop(); }
    if(k === "Enter" && !(t && t.tagName === "TEXTAREA")){ var b = document.querySelector(".fm .tg-pop .btn-primary:not([disabled])"); if(b){ if(b.dataset.action === "fm-go") fmGo(); else b.click(); } return stop(); }
    if(inF) return;
    if(P.type === "snooze"){ var n0 = +k; if(n0 >= 1 && n0 <= 5){ fmSnooze(fmGet(P.ro), tgWhenOpts()[n0 - 1][1], ""); return stop(); } return; }
    var n = +k; if(n >= 1 && n <= 9){ var bt = document.querySelector('.fm .tg-pop [data-fm-key="' + n + '"]'); if(bt){ bt.click(); return stop(); } }
    return; }
  if(inF){ if(k === "Escape" && t.blur) t.blur(); return; }
  if(k === "Escape"){ if(UI.fmClash){ UI.fmClash = null; render(); return stop(); } if(UI.yardPick) return; if(UI.fmBs && UI.fmBs.length){ UI.fmBs = []; render(); return stop(); } if(UI.fmFilter){ UI.fmFilter = null; render(); return stop(); } return; }
  if(k === "j" || k === "ArrowDown"){ fmMove(1); return stop(); }
  if(k === "k" || k === "ArrowUp"){ fmMove(-1); return stop(); }
  if(k === "Enter"){ UI.fmKB = true; fmDo(UI.fmSel); return stop(); }
  if(k === "s"){ UI.fmKB = true; if(fmItemOf(UI.fmSel)) fmOpenPop("snooze", UI.fmSel); return stop(); }
  if(k === "a"){ UI.fmKB = true; fmOpenPop("assign", UI.fmSel); return stop(); }
  if(k === "t"){ UI.fmKB = true; fmOpenPop("xfer", UI.fmSel); return stop(); }
  if(k === "x"){ var it = fmItemOf(UI.fmSel); if(it && fmIsBatch(it)){ var bs = UI.fmBs || (UI.fmBs = []), j = bs.indexOf(UI.fmSel); if(j < 0) bs.push(UI.fmSel); else bs.splice(j, 1); render(); } return stop(); }
  if(k === "p"){ var Lp = (UI.fmBs && UI.fmBs.length ? UI.fmBs.map(tgRoById).filter(Boolean) : fmPlanList()); if(Lp.length){ Lp.sort(function(a, b){ return fmPOrd(a) - fmPOrd(b); }); UI.fmPop = { type: "plan", ro: null, list: Lp.map(function(r){ return r.id; }), plan: fmAutoPlan(Lp), ex: null }; UI.fmPopTop = null; render(); } return stop(); }
  if((k === "m" || k === "M") && UI.fmView === "yard" && UI.fmSel && !/^T:/.test(UI.fmSel)){ UI.yardPick = UI.fmSel; UI.fmClash = null; render(); return stop(); }
  if(k === "/"){ psmOpen("foreman"); return stop(); }
  if(k === "1" || k === "2" || k === "3" || k === "4"){ UI.fmView = ["floor", "techs", "yard", "tmr"][+k - 1]; UI.yardPick = null; UI.fmPop = null; persistUI(); render(); return stop(); }
}, true);
document.addEventListener("dragstart", function(e){
  if(UI.view !== "foreman") return; var tg = e.target && e.target.closest ? e.target : null; if(!tg) return;
  var td = tg.closest("[data-fm-tdrag]"); if(td){ UI.fmTDrag = td.dataset.fmTdrag; try{ e.dataTransfer.setData("text/plain", "fmt:" + UI.fmTDrag); e.dataTransfer.effectAllowed = "move"; }catch(x){} td.classList.add("src"); return; }
  var d = tg.closest("[data-fm-drag]"); if(!d) return; UI.fmDrag = d.dataset.fmDrag; try{ e.dataTransfer.setData("text/plain", "fm:" + UI.fmDrag); e.dataTransfer.effectAllowed = "move"; }catch(x){}
  d.classList.add("src"); var m = document.querySelector(".fm .tg-main"); if(m) m.classList.add("fm-dragging");
});
function fmDropZone(e){ var t = e.target && e.target.closest ? e.target : null; if(!t) return null;
  if(UI.fmTDrag){ var col = t.closest("[data-fm-tcol]"); return col ? { kind: "tcol", el: col, card: t.closest(".fm-tmk") } : null; }
  if(!UI.fmDrag) return null;
  var card = t.closest(".fm-card[data-ord]"); if(card && card.dataset.ord !== "0" && card.dataset.fmDrag !== UI.fmDrag) return { kind: "ord", el: card };
  var lane = t.closest("[data-fm-lane]"); if(lane) return { kind: "lane", el: lane };
  var bay = t.closest(".fm-bay.free[data-fm-drop]"); if(bay) return { kind: "bay", el: bay };
  return null; }
document.addEventListener("dragover", function(e){ if(UI.view !== "foreman") return; var z = fmDropZone(e); if(!z) return; e.preventDefault(); try{ e.dataTransfer.dropEffect = "move"; }catch(x){}
  document.querySelectorAll(".fm .over, .fm .ins").forEach(function(x){ if(x !== z.el && x !== z.card) x.classList.remove("over", "ins"); });
  if(z.kind === "ord") z.el.classList.add("ins"); else z.el.classList.add("over"); if(z.card && z.card.dataset.fmTdrag !== UI.fmTDrag) z.card.classList.add("ins"); });
document.addEventListener("drop", function(e){ if(UI.view !== "foreman") return; var z = fmDropZone(e); if(!z) return; e.preventDefault();
  if(z.kind === "tcol"){ var id = UI.fmTDrag; UI.fmTDrag = null; fmTmMove(id, z.el.dataset.fmTcol, z.card && z.card.dataset.fmTdrag !== id ? z.card.dataset.fmTdrag : null); return; }
  var rid = UI.fmDrag; UI.fmDrag = null;
  if(z.kind === "ord") fmReorder(rid, z.el.dataset.k, z.el.dataset.fmDrag); else if(z.kind === "lane") fmReassign(rid, z.el.dataset.fmLane); else if(z.kind === "bay") fmMoveTo(rid, z.el.dataset.fmDrop);
  render(); });
document.addEventListener("dragend", function(){ if(UI.view !== "foreman") return; UI.fmDrag = null; UI.fmTDrag = null; document.querySelectorAll(".fm .over, .fm .ins, .fm .src").forEach(function(x){ x.classList.remove("over", "ins", "src"); }); var m = document.querySelector(".fm .tg-main"); if(m) m.classList.remove("fm-dragging"); });

/* after every render on this page: place the popover, keep the keyboard row in view */
function fmAfter(){
  if(UI.view !== "foreman") return;
  var body = document.querySelector(".fm .tg-body"), pop = document.querySelector(".fm .tg-pop"), P = UI.fmPop;
  if(pop && body && P){ var br = body.getBoundingClientRect(), top = 12, left = null;
    if(P.type === "fill"){ var a = UI.fmFillAnchor || "", el = a.indexOf("gap:") === 0 ? document.querySelector('.fm .fm-drow .gap[data-bay="' + a.slice(4) + '"]') : document.querySelector('.fm .fm-bay[data-bay="' + a.slice(4) + '"]') || document.querySelector('.fm .fm-st[data-action="fm-fill"]');
      if(el){ var r = el.getBoundingClientRect(); left = r.left - br.left; top = r.bottom - br.top + 6; if(left + pop.offsetWidth > body.offsetWidth - 12) left = body.offsetWidth - pop.offsetWidth - 12; if(top + pop.offsetHeight > body.offsetHeight - 12) top = r.top - br.top - pop.offsetHeight - 6; } }
    else if(P.type === "skills"){ var pe = document.querySelector('.fm [data-fm-lane="' + (P.ro || "").slice(2).replace(/"/g, '\\"') + '"] .fm-ske'); if(pe){ var r2 = pe.getBoundingClientRect(); left = r2.right - br.left + 8; top = r2.top - br.top - 8; } }
    else if(["plan", "cfg", "bays", "book"].indexOf(P.type) < 0){ var it = document.querySelector('.fm .tg-it[data-ro="' + P.ro + '"]'); if(it){ var ir = it.getBoundingClientRect(); top = ir.top - br.top - 6; } }
    top = Math.round(Math.max(12, Math.min(top, body.offsetHeight - pop.offsetHeight - 12))); pop.style.top = top + "px"; if(left != null) pop.style.left = Math.round(Math.max(12, left)) + "px"; UI.fmPopTop = top; }
  var sc = document.querySelector(".fm .tg-scroll"), on = sc && sc.querySelector(".tg-it.on");
  if(on && UI.fmKB){ if(on.offsetTop < sc.scrollTop + 30) sc.scrollTop = on.offsetTop - 40; else if(on.offsetTop + on.offsetHeight > sc.scrollTop + sc.clientHeight - 20) sc.scrollTop = on.offsetTop + on.offsetHeight - sc.clientHeight + 40; }
  if(UI.fmFlash){ var f = document.querySelector('.fm .fm-bay[data-bay="' + UI.fmFlash + '"], .fm .fm-bay.flash'); if(f && f.scrollIntoView) f.scrollIntoView({ block: "nearest" }); UI.fmFlash = null; }
  if(UI.fmSrch){ var q = document.getElementById("fm-q"); if(q && document.activeElement !== q){ q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
}
/* the Foreman badge on the nav, on every other page */
function fmTrack(){
  fmIcons(); fmNcClear(); if(FM_TITLE0 == null) FM_TITLE0 = document.title || "Parsec";
  var allowed = true; try{ allowed = navAllowed("foreman"); }catch(e){}
  if(!allowed){ UI.fmBadgeN = 0; return; }
  var on = fmCfg().badge, L = []; try{ L = fmNeedsAll().filter(function(x){ return on.indexOf(x.g) > -1 && !fmSnoozed(x.ro); }); }catch(e){ console.error(e); }
  var G = {}; L.forEach(function(x){ G[x.g] = (G[x.g] || 0) + 1; });
  UI.fmBadgeN = UI.view === "foreman" ? 0 : L.length; UI.fmBadgeLate = L.some(function(x){ return x.late; });
  UI.fmBadgeTip = L.length ? FM_GROUPS.filter(function(g){ return G[g[0]]; }).map(function(g){ return G[g[0]] + " " + g[1].toLowerCase(); }).join(" · ") + (UI.fmBadgeLate ? " — something is late" : "") : "";
  try{ var want = (L.length && UI.view !== "foreman" ? "(" + L.length + ") " : "") + FM_TITLE0; if(document.title !== want) document.title = want; }catch(e){}
}
