/* Parsec · pages/triage · actions.js
   Doing things on Triage: tgDo for every action, nudge, accept, snooze, settle, release; tgAct handles clicks; typing, ticking, keys and dragging; the selected RO's stage progress.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   tgAfterAct tgDo tgOpenPop tgNudge tgAccept tgSnooze tgSettle tgCopy tgApplyLog tgSaveAppr tgRelFix tgRelease … (24 functions)
   state      punches tgTemplates
   uses       access/ automations/ data/ import/ import/new-ro/ kit/ pages/ pages/warranty/ ro/ shell/ state/
   at load    on document input · on document change · on document focusout · 2× on document pointerdown · on document keydown · on document dragstart · on document dragover · on document dragleave · on document dr
*/
/* ============================== doing things ============================== */
function tgAfterAct(id, before){ var L = tgFlat(), i = before.indexOf(id); if(L.indexOf(UI.tgSel) < 0) UI.tgSel = L.length ? L[Math.min(Math.max(i, 0), L.length - 1)] : UI.tgSel; }
function tgDo(id){ var x = tgItemOf(id); if(!x) return; UI.tgSel = id;
  if(x.act === "log") tgOpenPop("log", id); else if(x.act === "release") tgOpenPop("release", id); else if(x.act === "assign") tgOpenPop("assign", id); else if(x.act === "checkin") tgOpenPop("checkin", id);
  else if(x.act === "road" || x.act === "checks") tgOpenPop(x.act, id); else if(x.act === "nudge") tgNudge(getRO(id)); else if(x.act === "accept") tgAccept(getRO(id)); else if(x.act === "clash"){ UI.tgView = "yard"; UI.tgClash = x.spot; UI.yardPick = null; render(); } }
function tgOpenPop(type, id){ var ro = tgRoById(id); if(!ro) return; if(type === "snooze" && !tgItemOf(id)) return;
  UI.tgSel = id; UI.tgPop = { type: type, ro: id, i: 0 }; UI.tgPopTop = null; UI.tgSrch = false;
  if(type === "log") UI.tgLFP = { kind: "Call", out: null, when: null, note: "" };
  if(type === "release") UI.tgRL = {}; if(type === "xfer") UI.tgXS = {}; if(type === "road") UI.trxR = null; if(type === "checks") UI.trxQ = null; UI.trxLV = UI.view;
  render(); }
function tgNudge(ro){ if(!ro) return; var before = tgFlat(), hd = tgHold(ro); pushUndo("nudge");
  ro.tgSnz = { until: new Date(Date.now() + 3600000).toISOString(), why: "Nudged " + hd.who, at: nowIso(), by: tgMe() };
  rtLog(ro, { kind: "nudge", at: nowIso(), by: tgMe(), to: hd.to, who: hd.who });
  try{ audit("route", roLabel(ro) + " — nudged " + hd.who, ro); }catch(e){}
  tgAfterAct(ro.id, before); scheduleSave(true); pushToast("Nudged " + hd.who + " — back at " + tgWhen(Date.now() + 3600000) + " if still held.", true); }
function tgAccept(ro){ if(!ro) return; var before = tgFlat(), ret = ro.route && ro.route.state === "returned"; pushUndo("accept RO"); rtAccept(ro); delete ro.tgSnz;
  tgAfterAct(ro.id, before); pushToast(roLabel(ro) + (ret ? " — back with you." : " accepted — it’s with you now."), true); }
function tgSnooze(ro, until, why){ var before = tgFlat(); pushUndo("snooze"); ro.tgSnz = { until: new Date(until).toISOString(), why: why || "", at: nowIso(), by: tgMe() };
  tgAfterAct(ro.id, before); scheduleSave(true); UI.tgPop = null; pushToast((ro.customerName || roLabel(ro)) + " snoozed until " + tgWhen(until) + ".", true); }
function tgSettle(ro){
  if(roStatus(ro).status !== "Waiting – Customer" || tgOpenOps(ro).length) return "";
  var any = raLive(ro).some(function(op){ return op.appr && op.appr.s !== "no"; });
  if(any){ setRoStatus(ro.id, "Hold Tech", null); return " · back on the board for " + (ro.assignedTech || "the tech"); }
  if(raOps(ro).every(function(op){ return op.declined || (op.appr && op.appr.s === "no"); })){ setRoStatus(ro.id, "Declined", null); return " · now ready to release"; }
  return "";
}
function tgCopy(t){ var fb = function(){ var ta = document.createElement("textarea"); ta.value = t; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); }catch(e){} ta.remove(); };
  try{ if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).catch(fb); else fb(); }catch(e){ fb(); } }
function tgApplyLog(sc){
  var S = tgLF(sc), ro = tgRoById(sc === "p" ? (UI.tgPop || {}).ro : UI.tgSel); if(!ro || !S.out) return;
  var before = tgFlat(), inList = !!tgItemOf(ro.id), L = tgPeople(ro), p = L[S.to] || null, txt = (S.kind === "Text" || S.kind === "Email") && S.tpl;
  var note = String(S.note || "").trim(), msg = "";
  if(txt){ msg = S.edit && S.msg != null ? S.msg : tgFill(tgTplBody(S.tpl), ro, p); note = msg; tgCopy(msg); }
  pushUndo("log a contact"); delete ro.tgSnz;
  if(!Array.isArray(ro.contacts)) ro.contacts = [];
  var c = { id: uid("ct"), at: nowIso(), by: tgMe(), kind: S.kind, out: S.out, note: note };
  if(p) c.to = p.n;
  var eta = tyCat(ro) === "arr" ? tgEtaText(note, Date.now()) : null; if(eta != null) c.eta = new Date(eta).toISOString();
  var toast = "";
  if((S.out === "Approved" || S.out === "Declined") && tgOpenOps(ro).length){
    var ok = S.out === "Approved", open = tgOpenOps(ro), a = 0, d = 0, ia = [], id = [];
    open.forEach(function(op, j){ var t = !S.ops || S.ops[j], rec = { by: tgMe(), at: nowIso(), who: p ? p.n : "", role: p ? p.r || "" : "", how: S.kind };
      if(ok && t){ op.appr = Object.assign({ s: "ok", po: String(S.po || "").trim() }, rec); op.declined = false; a += opMoney(op).total; ia.push(raN(ro, op)); }
      else if((ok && S.rest) || (!ok && t)){ op.appr = Object.assign({ s: "no" }, rec); op.declined = true; d += opMoney(op).total; id.push(raN(ro, op)); } });
    c.note = [note, [ia.length ? "Approved op " + ia.join(", ") + " · " + tgMoney(a) + (S.po ? " · PO " + S.po : "") : "", id.length ? "Declined op " + id.join(", ") + " · " + tgMoney(d) : ""].filter(Boolean).join(" — ")].filter(Boolean).join("\n");
    c.out = ia.length ? "Approved" : "Declined";
    ro.contacts.push(c);
    try{ audit("approval", roLabel(ro) + ": " + (ia.length ? "approved op " + ia.join(", ") : "") + (id.length ? (ia.length ? ", " : "") + "declined op " + id.join(", ") : "") + (p ? " — " + p.n : "") + " (" + S.kind + ")", ro); }catch(e){}
    var settled = tgSettle(ro);
    if(inList && !tgItemOf(ro.id)) tgClear(ro, ia.length ? "check" : "x", ia.length ? "Approved " + tgMoney(a) : "Declined");
    toast = (ia.length ? "Approved " + tgMoney(a) : "Declined " + tgMoney(d)) + (ia.length && id.length ? " · declined " + tgMoney(d) : "") + (p ? " · " + p.n : "") + settled;
  } else {
    ro.contacts.push(c);
    try{ audit("contact", roLabel(ro) + " · " + S.kind + " — " + S.out, ro); }catch(e){}
    var until = null;
    if(inList && tyCat(ro) !== "arr" && S.out !== "Approved" && S.out !== "Declined"){ until = S.out === "Will call back" ? (S.when || tgWhenOpts()[1][1]) : Date.now() + TG_FOLLOW[S.out] * 3600000;
      ro.tgSnz = { until: new Date(until).toISOString(), why: S.out === "Will call back" ? "Said they’d call back" : S.out, at: nowIso(), by: tgMe() }; }
    toast = eta != null ? "ETA updated to ~" + tgWhen(eta) + " from your note" : txt ? "Copied — paste it into your " + (S.kind === "Email" ? "email" : "phone") + ". Logged as a " + S.kind.toLowerCase() + (p ? " to " + tgFirst(p.n) : "") + (until ? ", back " + tgWhen(until) : "") + "." : until ? (ro.customerName || roLabel(ro)) + " snoozed until " + tgWhen(until) + "." : S.kind + " logged on " + roLabel(ro) + ".";
  }
  if(sc === "p"){ UI.tgPop = null; UI.tgLFP = null; } else UI.tgLFC = null;
  tgAfterAct(ro.id, before); scheduleSave(true); pushToast(toast, true);
}
function tgSaveAppr(){
  var A = UI.tgAP, ro = tgRoById(A && A.ro); if(!ro) return; var op = raOps(ro).filter(function(o){ return o.id === A.op; })[0]; if(!op) return;
  var L = tgPeople(ro), p = A.who ? { n: A.who, r: "" } : L[A.to] || null, before = tgFlat(), was = !!tgItemOf(ro.id);
  if(!p || !p.n){ pushToast("Pick or type who " + (A.dec === "no" ? "declined" : "approved") + " it."); return; }
  pushUndo("approval");
  var amt = A.dec === "part" ? +String(A.amt || "").replace(/[^\d.]/g, "") || 0 : 0;
  op.appr = { s: A.rec ? (op.appr ? op.appr.s : (op.declined ? "no" : "ok")) : A.dec, by: tgMe(), at: nowIso(), who: p.n, role: p.r || "", how: A.how || "Call", po: A.dec === "no" ? "" : String(A.po || "").trim(), amt: amt, reason: A.dec === "no" ? String(A.reason || "").trim() : "" };
  op.declined = op.appr.s === "no";
  try{ audit("approval", roLabel(ro) + " Op " + raN(ro, op) + ": " + { ok: "approved", part: "partly approved", no: "declined" }[op.appr.s] + " by " + p.n + " (" + op.appr.how + ")", ro); }catch(e){}
  var settled = A.rec ? "" : tgSettle(ro);
  if(was && !tgItemOf(ro.id)) tgClear(ro, op.appr.s === "no" ? "x" : "check", (op.appr.s === "no" ? "Declined" : "Approved") + " op " + raN(ro, op));
  UI.tgAP = null; tgAfterAct(ro.id, before); scheduleSave(true);
  pushToast((A.rec ? "Record saved" : { ok: "Approved", part: "Partly approved", no: "Declined" }[op.appr.s]) + " · op " + raN(ro, op) + " · " + p.n + " · " + op.appr.how + settled, true);
}
function tgRelFix(k){
  var ro = tgRoById((UI.tgPop || {}).ro); if(!ro) return; var A = UI.tgRL || {};
  if(k === "notes"){ var t = String(A.note || "").trim(); if(!t){ pushToast("Write what was done first."); return; }
    var c = tyCloseChecks(ro).filter(function(x){ return x.k === "notes"; })[0], ps = STATE.punches.filter(function(p){ return p.roId === ro.id && p.stop && !noteEntries(p.notes).length && (!c || !c.op || p.opId === c.op.id); });
    if(!ps.length){ A.fix = null; render(); return; } pushUndo("punch note"); ps[0].notes = (ps[0].notes ? ps[0].notes + "\n" : "") + t; }
  if(k === "road"){ pushUndo("road test"); ro.roadTest = { miles: String(A.mi || "").trim(), start: "", result: A.road || "Pass", checked: "", at: nowIso() };
    if(ro.roadTest.result === "Fail"){ A.fix = null; scheduleSave(true); render(); pushToast("Road test failed — back to the tech; release stays locked."); return; } }
  if(k === "ops"){ raLive(ro).filter(function(op){ return !opDoneNow(op); }).forEach(function(op){ tyOpSet(ro, op, "Complete"); }); }
  if(k === "parts"){ pushUndo("parts installed"); raLive(ro).forEach(function(op){ opRealParts(op).forEach(function(p){ if(p.status !== "Installed"){ p.status = "Installed"; p.statusChangedAt = nowIso(); } }); }); }
  A.fix = null; A.note = ""; scheduleSave(true); render();
  pushToast({ notes: "Note added.", road: "Road test logged — pass.", ops: "Operations marked complete.", parts: "Parts marked installed." }[k], true);
}
function tgRelease(any){
  var ro = tgRoById((UI.tgPop || {}).ro); if(!ro) return; var A = UI.tgRL || {}, L = tgPeople(ro), bad = tgRelChecks(ro).filter(function(c){ return !c.ok; }), rs = releaseState(ro);
  v141WalkSync(ro); var handBad = v141Hand(ro).filter(function(x){ return !rs[x[0]]; });
  if((bad.length || handBad.length) && !any) return; if(any && (!A.reason || (v141Hours(ro).bad && !String(A.why || "").trim()))) return;   /* Parsec 14.1: 0 h clocked needs a note */
  var who = A.to === "o" ? String(A.other || "").trim() : (L[A.to] || {}).n || "", before = tgFlat();
  if(A.text && L.length){ var q = L[A.to] || L[0]; tgCopy(tgFill(tgTplBody("rdy"), ro, q)); }
  pushUndo("release");
  RELEASE_CHECK.forEach(function(x){ if(x[0] === "road" ? !!ro.roadTest : true) rs[x[0]] = rs[x[0]] || !any || x[0] === "keys"; });
  ro.releaseRec = { at: nowIso(), by: tgMe(), to: who, key: ro.keyTag || "", spot: tgSpotOf(ro) || ro.location || "", override: any ? { open: bad.map(function(c){ return c.t; }).concat(handBad.map(function(x){ return x[1]; })), reason: A.reason, note: String(A.why || "").trim() } : null };
  var okSt = setRoStatus(ro.id, "Complete – Released", null, true);
  if(okSt === false) return;
  if(typeof syncDateClosedRo === "function") syncDateClosedRo(ro);
  try{ audit("release", "Released " + roLabel(ro) + (ro.customerName ? " (" + ro.customerName + ")" : "") + (who ? " to " + who : "") + (any ? " — released anyway (" + A.reason + "): " + ro.releaseRec.override.open.join(", ") + " open" : " — all checks passed"), ro); }catch(e){}
  delete ro.tgSnz; tgClear(ro, any ? "flag" : "release", any ? "Released anyway" : "Released" + (who ? " to " + who : ""));
  UI.tgPop = null; UI.tgRL = null; tgAfterAct(ro.id, before); scheduleSave(true);
  pushToast(any ? "Released " + tgNum(ro) + " anyway — still open: " + ro.releaseRec.override.open.join(", ") + " · “" + A.reason + "”" : "Released" + (who ? " to " + who : "") + (ro.keyTag ? " · key tag " + ro.keyTag : "") + " · " + (tgSpotLbl(ro.releaseRec.spot) || "spot") + " is free" + (A.text ? " · ready text copied" : ""), true);
}
function tgMoveTo(id, spot){ var ro = tgRoById(id); if(!ro) return; var before = tgClashes().length; UI.yardPick = null;
  if(spotOf(ro.location) === spot) return; pushUndo("move truck"); var from = tgSpotOf(ro); ro.location = spot; scheduleSave(true); UI.tgSel = id; UI.tgClash = null;
  pushToast(roLabel(ro) + " → " + tgSpotLbl(spot) + (from ? " (from " + tgSpotLbl(from) + ")" : "") + (tgClashes().length < before ? " · clash fixed" : ""), true); }

/* ---------- the click side ---------- */
function tgAct(a, t, e){
  var id = t.dataset.ro, P = UI.tgPop;
  switch(a){
    case "tg-sel": { if(e && e.target.closest && e.target.closest("button:not([data-action='tg-sel'])") && e.target.closest("button") !== t) return true;
      UI.tgSel = id; UI.tgKB = false; UI.tgPop = null; UI.tgAP = null; if(UI.tgNewLate) UI.tgNewLate = UI.tgNewLate.filter(function(x){ return x !== id; }); render(); return true; }
    case "tg-do": UI.tgKB = false; tgDo(id); return true;
    case "tg-pop": { if(t.dataset.p === "log"){ tgOpenPop("log", id); if(t.dataset.k){ UI.tgLFP.kind = t.dataset.k; render(); } return true; } tgOpenPop(t.dataset.p, id); return true; }
    case "tg-pop-x": UI.tgPop = null; render(); return true;
    case "tg-view": UI.tgView = t.dataset.v; UI.tgPop = null; UI.yardPick = null; persistUI(); render(); return true;
    case "tg-filt": { var k = t.dataset.k || null; UI.tgFilter = !k || UI.tgFilter === k ? null : k; UI.tgPop = null; var L = tgFlat(); if(L.length && L.indexOf(UI.tgSel) < 0) UI.tgSel = L[0]; render(); return true; }
    case "tg-open": { var kk = t.dataset.k; UI.tgOpen[kk] = t.dataset.force && !UI.tgOpen[kk] ? true : !UI.tgOpen[kk]; render();
      if(kk === "clr" && UI.tgOpen.clr){ var s = document.querySelector(".tg-scroll"), c = document.querySelector('.tg-sec[data-k="clr"]'); if(s && c) s.scrollTop = c.offsetTop - 60; } return true; }
    case "tg-wake": { var r = getRO(id); if(r && r.tgSnz){ pushUndo("wake"); r.tgSnz.until = nowIso(); UI.tgSel = id; scheduleSave(true); render(); } return true; }
    case "tg-help": UI.modal = { type: "shortcuts" }; render(); return true;
    case "tg-srch": UI.tgPop = null; psmOpen("triage"); return true;
    case "tg-sr-pick": UI.tgSel = id; UI.tgSrch = false; UI.tgQ = ""; render(); return true;
    case "tg-sr-yard": tgShowOnYard(id); return true;
    case "tg-lf": { var sc = t.dataset.sc, S = tgLF(sc), f = t.dataset.f, v = t.dataset.v;
      if(f === "to") S.to = +v; else if(f === "kind"){ S.kind = v; } else if(f === "out"){ S.out = v; S.ops = null; S.rest = false; if(v === "Will call back" && !S.when) S.when = tgWhenOpts()[1][1]; }
      else if(f === "when") S.when = +v; else if(f === "tpl"){ S.tpl = v || null; S.edit = false; S.msg = null; if(S.tpl && !S.out) S.out = "Update given"; }
      else if(f === "edit"){ var ro2 = tgRoById(sc === "p" ? P.ro : UI.tgSel); S.msg = tgFill(tgTplBody(S.tpl), ro2, tgPeople(ro2)[S.to]); S.edit = true; render(); setTimeout(function(){ var ta = document.querySelector('.tg-lf[data-sc="' + sc + '"] [data-tg-in="msg"]'); if(ta){ ta.focus(); ta.selectionStart = ta.selectionEnd = ta.value.length; } }, 0); return true; }
      render(); return true; }
    case "tg-lf-go": tgApplyLog(t.dataset.sc); return true;
    case "tg-snz-pick": { var r2 = tgRoById(P && P.ro); if(r2) tgSnooze(r2, tgWhenOpts()[+t.dataset.i][1], ""); return true; }
    case "tg-as-pick": { var r3 = tgRoById(P && P.ro), n = rtTechs()[+t.dataset.i]; if(!r3 || !n) return true; var b3 = tgFlat(); pushUndo("assign");
      rtSend(r3, "tech", n, "", null, { reason: "Tech + bay" }); delete r3.tgSnz; tgClear(r3, "userPlus", "Assigned to " + n); UI.tgPop = null; tgAfterAct(r3.id, b3); scheduleSave(true); pushToast(roLabel(r3) + " assigned to " + n + (r3.route && r3.route.state === "pending" ? " — waiting for them to accept." : "."), true); return true; }
    case "tg-ci-pick": { var r4 = tgRoById(P && P.ro), sp = tgFreeSpots()[+t.dataset.i]; if(!r4 || !sp) return true; var b4 = tgFlat(); UI.tgPop = null; yardMove(r4.id, sp); delete r4.tgSnz; tgClear(r4, "inArrow", "Checked in to " + tgSpotLbl(sp)); tgAfterAct(r4.id, b4); render(); return true; }
    case "tg-rl": { var A = UI.tgRL || (UI.tgRL = {}), ff = t.dataset.f, vv = t.dataset.v, r5 = tgRoById(P && P.ro);
      if(ff === "fix"){ A.fix = vv; render(); setTimeout(function(){ var i = document.querySelector('.tg-pop [data-tg-in="rl-note"]'); if(i) i.focus(); }, 0); }
      else if(ff === "road"){ A.road = vv; render(); } else if(ff === "to"){ A.to = vv === "o" ? "o" : +vv; render(); } else if(ff === "any"){ A.any = true; render(); } else if(ff === "back"){ A.any = false; A.reason = ""; render(); }
      else if(ff === "reason"){ A.reason = vv; render(); } else if(ff === "tick" && r5){ var rs = releaseState(r5); pushUndo("release checklist"); rs[vv] = !rs[vv]; scheduleSave(true); render(); }
      return true; }
    case "tg-rl-save": tgRelFix(t.dataset.k); return true;
    case "tg-rl-go": tgRelease(t.dataset.v === "any"); return true;
    case "tg-xf": trxXfSet(t.dataset.f, t.dataset.v); render(); return true;
    case "tg-xf-go": trxXferGo(); return true;
    case "tg-rt": trxRtSet(t.dataset.f, t.dataset.v); render(); return true;
    case "tg-rt-go": trxRtGo(t.dataset.v); return true;
    case "tg-qc": trxQcSet(t.dataset.f, t.dataset.v); render(); if(t.dataset.f === "edit" || t.dataset.f === "add") trxFocusAdd(); return true;
    case "tg-qc-go": { var r9 = tgRoById(id || (P && P.ro)); if(r9) tgOpenPop("release", r9.id); return true; }
    case "tg-apr": { var r6 = tgRoById(id), op = r6 && raOps(r6).filter(function(o){ return o.id === t.dataset.op; })[0]; if(!op) return true;
      UI.tgSel = r6.id; var L6 = tgPeople(r6), aa = op.appr; UI.tgAP = { ro: r6.id, op: op.id, dec: t.dataset.d, rec: false, to: tgDefTo(r6), how: "Call", po: "", amt: "", reason: "", who: "" };
      if(aa && aa.who){ var ki = -1; L6.forEach(function(q, i){ if(q.n === aa.who) ki = i; }); if(ki > -1) UI.tgAP.to = ki; else UI.tgAP.who = aa.who; UI.tgAP.how = aa.how || "Call"; UI.tgAP.po = aa.po || ""; UI.tgAP.reason = aa.reason || ""; UI.tgAP.amt = aa.amt || ""; }
      render(); return true; }
    case "tg-aprrec": { var r7 = tgRoById(id), op7 = r7 && raOps(r7).filter(function(o){ return o.id === t.dataset.op; })[0]; if(!op7) return true;
      UI.tgAP = { ro: r7.id, op: op7.id, dec: op7.declined || (op7.appr && op7.appr.s === "no") ? "no" : "ok", rec: true, to: tgDefTo(r7), how: "Call", po: "", amt: "", reason: "", who: "" }; render(); return true; }
    case "tg-ap": { var AP = UI.tgAP; if(!AP) return true; if(t.dataset.f === "to"){ AP.to = +t.dataset.v; AP.who = ""; } else AP.how = t.dataset.v; render(); return true; }
    case "tg-ap-x": UI.tgAP = null; render(); return true;
    case "tg-ap-save": tgSaveAppr(); return true;
    case "tg-copy": tgCopy(t.dataset.v || ""); pushToast("Copied " + t.dataset.v); return true;
    case "tg-copyrec": { var r8 = tgRoById(id); if(r8){ tgCopy(tgRecordText(r8)); pushToast("Approval record copied — paste it into the Decisiv case notes."); } return true; }
    case "tg-callp": tgOpenPop("log", id); UI.tgLFP.to = +t.dataset.i; UI.tgLFP.kind = t.dataset.k; render(); return true;
    case "tg-np-open": UI.tgAddP = UI.tgAddP === id ? null : id; UI.tgNP = { r: "Fleet manager", pref: "Call" }; UI.tgPop = null; if(UI.tgView !== "inbox"){ UI.tgView = "inbox"; } render(); setTimeout(function(){ var i = document.querySelector('[data-tg-in="np-n"]'); if(i) i.focus(); }, 0); return true;
    case "tg-np-x": UI.tgAddP = null; render(); return true;
    case "tg-np-save": { var r9 = tgRoById(id), N = UI.tgNP || {}; if(!r9 || !String(N.n || "").trim()){ pushToast("Type a name first."); return true; }
      pushUndo("add a contact person"); tgAddPerson(r9, { id: uid("pp"), n: String(N.n).trim(), r: N.r || "Fleet manager", ph: String(N.ph || "").trim(), em: String(N.em || "").trim(), pref: N.pref || "Call", ok: !!N.ok });
      UI.tgAddP = null; scheduleSave(true); pushToast(String(N.n).trim() + " added to " + (r9.customerName || "this customer") + "."); return true; }
    case "tg-tpled": UI.modal = { type: "tg-tpl", sel: (tgLF(P && P.type === "log" ? "p" : "c").tpl) || tgTpls()[0].id }; render(); return true;
    case "tg-tm-sel": if(UI.modal) UI.modal.sel = t.dataset.id; render(); return true;
    case "tg-tm-new": { var nid = uid("tp"); tgTpls().push({ id: nid, n: "New template", b: "Hi {first}, " }); if(UI.modal) UI.modal.sel = nid; scheduleSave(true); render(); return true; }
    case "tg-tm-del": { var L9 = tgTpls(); if(L9.length < 2) return true; STATE.tgTemplates = L9.filter(function(x){ return x.id !== t.dataset.id; }); if(UI.modal) UI.modal.sel = STATE.tgTemplates[0].id; scheduleSave(true); render(); return true; }
    case "tg-tm-tok": { var ta = document.querySelector('[data-tg-in="tm-body"]'); if(!ta) return true; var v = "{" + t.dataset.k + "}", s0 = UI.tgTmCaret != null ? UI.tgTmCaret : ta.value.length;
      ta.value = ta.value.slice(0, s0) + v + ta.value.slice(s0); UI.tgTmCaret = s0 + v.length; ta.dispatchEvent(new Event("input", { bubbles: true })); return true; }
    case "tg-clash": UI.tgClash = t.dataset.spot; UI.tgView = "yard"; UI.yardPick = null; render(); return true;
    case "tg-clash-x": UI.tgClash = null; render(); return true;
    case "tg-keep": { var cl = tgClashes().filter(function(c){ return c.spot === UI.tgClash; })[0]; if(!cl) return true; var other = cl.ros.filter(function(r){ return r.id !== id; })[0];
      UI.tgClash = null; UI.tgSel = other.id; UI.yardPick = other.id; render(); pushToast(tgNum(getRO(id)) + " stays in " + tgSpotLbl(cl.spot) + " — pick a spot for " + tgNum(other) + "."); return true; }
  }
  return false;
}
function tgShowOnYard(id){ var ro = tgRoById(id); if(!ro) return; UI.tgSel = id; UI.tgSrch = false; UI.tgQ = ""; UI.tgView = "yard"; UI.yardPick = null; UI.tgFlash = tgSpotOf(ro); render(); }
function tgTplBodyModal(m){
  var L = tgTpls(), t = L.filter(function(x){ return x.id === m.sel; })[0] || L[0], ro = tgSel(), p = ro ? tgPeople(ro)[tgDefTo(ro)] : null, sh = tgShop();
  return '<div class="tg tg-tm"><div class="tg-tmg"><div class="tg-tml">' + L.map(function(x){ return '<button class="tg-mi' + (x.id === t.id ? ' on' : '') + '" data-action="tg-tm-sel" data-id="' + x.id + '">' + esc(x.n) + '</button>'; }).join('') + '<button class="tg-mi" data-action="tg-tm-new">' + tgI("plus", 14) + 'New template</button>'
    + '<div class="tg-shop"><span class="tg-lbl top">Your shop</span><input data-no-draft data-tg-in="shop-name" placeholder="Shop name" value="' + esc(sh.name || "") + '"><input data-no-draft data-tg-in="shop-phone" placeholder="Shop phone" value="' + esc(sh.phone || "") + '"><small>Fills {shop} and {phone}.</small></div></div>'
    + '<div class="tg-tmr"><div class="tg-r"><input class="tg-wide" data-no-draft data-tg-in="tm-name" data-id="' + t.id + '" value="' + esc(t.n) + '">' + (L.length > 1 ? '<button class="btn btn-sm ib" data-action="tg-tm-del" data-id="' + t.id + '" title="Delete this template">' + tgI("trash", 14) + '</button>' : '') + '</div>'
    + '<textarea class="tg-tmb" data-no-draft data-tg-in="tm-body" data-id="' + t.id + '" rows="5">' + esc(t.b) + '</textarea><div class="tg-r">' + TG_TOK.map(function(k){ return '<button class="tg-chip tok" data-action="tg-tm-tok" data-k="' + k + '">{' + k + '}</button>'; }).join('') + '</div>'
    + '<span class="tg-lbl top">Preview' + (ro ? ' · ' + esc(roLabel(ro)) + (p ? ' · ' + esc(p.n) : '') : '') + '</span><div class="tg-msg"><div class="pv" data-tg-pv>' + (ro ? tgFillHtml(t.b, ro, p) : esc(t.b)) + '</div></div></div></div></div>';
}

/* ---------- typing, ticking, keys, dragging ---------- */
document.addEventListener("input", function(e){
  var t = e.target; if(!t || !t.dataset || !t.dataset.tgIn) return; var k = t.dataset.tgIn, v = t.value, sc = t.dataset.sc;
  if(k === "q"){ UI.tgQ = v; UI.tgSri = 0; var pop = document.querySelector(".tg-srpop"); if(pop) pop.innerHTML = tgSearchHtml(); return; }
  if(k === "note" || k === "msg" || k === "po"){ var S = tgLF(sc); S[k] = v;
    if(k === "msg"){ var cnt = t.closest(".tg-msg") && t.closest(".tg-msg").querySelector("[data-tg-count]"); if(cnt) cnt.textContent = v.length + " characters"; }
    if(k === "note"){ var ro = tgRoById(sc === "p" ? (UI.tgPop || {}).ro : UI.tgSel); if(ro && tyCat(ro) === "arr"){ var e2 = tgEtaText(v, Date.now()), fu = t.closest(".tg-lf").querySelector("[data-tg-fu]"); if(fu && e2 != null) fu.textContent = "ETA becomes ~" + tgWhen(e2); } } return; }
  if(/^ap/.test(k) && UI.tgAP){ var m = { apwho: "who", apamt: "amt", appo: "po", apreason: "reason" }[k]; UI.tgAP[m] = v; return; }
  if(/^rl-/.test(k)){ var A = UI.tgRL || (UI.tgRL = {}); A[{ "rl-note": "note", "rl-mi": "mi", "rl-other": "other", "rl-why": "why" }[k]] = v; return; }
  if(k === "xf-note"){ (UI.tgXS || (UI.tgXS = {})).note = v; return; }
  if(/^trx-/.test(k)){ trxInput(k, v); trxSync(); return; }
  if(/^np-/.test(k)){ (UI.tgNP || (UI.tgNP = {}))[k.slice(3)] = v; return; }
  if(k === "tm-body" || k === "tm-name"){ var tp = tgTpls().filter(function(x){ return x.id === t.dataset.id; })[0]; if(!tp) return; if(k === "tm-body") tp.b = v; else tp.n = v;
    var b = document.querySelector('.tg-tml [data-id="' + tp.id + '"]'); if(b && k === "tm-name") b.textContent = v;
    var ro2 = tgSel(), pv = document.querySelector("[data-tg-pv]"); if(pv && ro2) pv.innerHTML = tgFillHtml(tp.b, ro2, tgPeople(ro2)[tgDefTo(ro2)]); scheduleSave(); return; }
  if(k === "shop-name" || k === "shop-phone"){ tgShop()[k === "shop-name" ? "name" : "phone"] = v; var ro3 = tgSel(), pv2 = document.querySelector("[data-tg-pv]"), tp2 = tgTpls().filter(function(x){ return UI.modal && x.id === UI.modal.sel; })[0] || tgTpls()[0]; if(pv2 && ro3) pv2.innerHTML = tgFillHtml(tp2.b, ro3, tgPeople(ro3)[tgDefTo(ro3)]); scheduleSave(); return; }
}, true);
document.addEventListener("change", function(e){
  var t = e.target; if(!t || !t.dataset) return;
  if(t.dataset.tgIn && /^np-/.test(t.dataset.tgIn)){ (UI.tgNP || (UI.tgNP = {}))[t.dataset.tgIn.slice(3)] = t.value; return; }
  var k = t.dataset.tgCk; if(!k) return;
  if(k === "op" || k === "rest"){ var sc = t.closest(".tg-lf") ? t.closest(".tg-lf").dataset.sc : "c", S = tgLF(sc); if(k === "op"){ if(!S.ops) S.ops = []; S.ops[+t.dataset.j] = t.checked; } else S.rest = t.checked; render(); return; }
  if(k === "np-ok"){ (UI.tgNP || (UI.tgNP = {})).ok = t.checked; return; }
  if(k === "rl-text"){ (UI.tgRL || (UI.tgRL = {})).text = t.checked; return; }
}, true);
document.addEventListener("focusout", function(e){ if(e.target && e.target.dataset && e.target.dataset.tgIn === "tm-body") UI.tgTmCaret = e.target.selectionStart; }, true);
document.addEventListener("pointerdown", function(e){
  if(UI.view !== "triage") return; var path = e.composedPath ? e.composedPath() : [e.target];
  var within = function(sel){ return path.some(function(n){ return n && n.nodeType === 1 && n.matches && n.matches(sel); }); };
  if(within(".modal, .overlay, .toast-wrap")) return;
  var ch = false;
  if(UI.tgPop && !within(".tg-pop, [data-action='tg-pop'], [data-action='tg-do'], [data-action='tg-callp']")){ UI.tgPop = null; ch = true; }
  if(UI.tgSrch && !within(".tg-srch, .tg-srpop, [data-action='tg-srch']")){ UI.tgSrch = false; UI.tgQ = ""; ch = true; }
  if(ch) render();
}, true);
function tgMove(d){ var L = tgFlat(); if(!L.length) return; UI.tgKB = true; var i = L.indexOf(UI.tgSel); UI.tgSel = i < 0 ? L[d > 0 ? 0 : L.length - 1] : L[Math.max(0, Math.min(L.length - 1, i + d))]; UI.tgAP = null; render(); }
document.addEventListener("keydown", function(e){
  if(UI.view !== "triage" || UI.palette || UI.tgView === "ros") return;
  var k = e.key, t = (e.composedPath && e.composedPath()[0]) || e.target, inF = t && (/^(input|textarea|select)$/i.test(t.tagName || "") || t.isContentEditable);
  var stop = function(){ e.preventDefault(); e.stopPropagation(); };
  if(UI.modal){ return; }
  if(e.ctrlKey || e.metaKey || e.altKey) return;
  /* search */
  if(UI.tgSrch){
    var rows = document.querySelectorAll(".tg-srpop .tg-sr[data-ro]");
    if(k === "Escape"){ UI.tgSrch = false; UI.tgQ = ""; render(); return stop(); }
    if(k === "ArrowDown" || k === "ArrowUp"){ if(rows.length){ UI.tgSri = ((UI.tgSri || 0) + (k === "ArrowDown" ? 1 : -1) + rows.length) % rows.length; rows.forEach(function(r, i){ r.classList.toggle("k", i === UI.tgSri); }); } return stop(); }
    if(k === "Enter"){ var el = rows[UI.tgSri || 0] || rows[0]; if(el){ if(e.shiftKey) tgShowOnYard(el.dataset.ro); else { UI.tgSel = el.dataset.ro; UI.tgSrch = false; UI.tgQ = ""; render(); } } return stop(); }
    if(inF) return;
  }
  /* the approval form inline in the card */
  if(UI.tgAP){
    if(k === "Escape"){ UI.tgAP = null; render(); return stop(); }
    if(k === "Enter"){ tgSaveAppr(); return stop(); }
    if(!inF){ var n0 = +k; if(n0 >= 1 && n0 <= 5){ UI.tgAP.how = TG_HOW[n0 - 1]; render(); return stop(); } }
    if(inF) return;
  }
  /* popovers */
  var P = UI.tgPop;
  if(P){
    if(k === "Escape"){ if(P.type === "release" && UI.tgRL && UI.tgRL.fix){ UI.tgRL.fix = null; render(); return stop(); } UI.tgPop = null; render(); return stop(); }
    if(P.type === "log"){
      if(k === "Enter" && !e.shiftKey){ tgApplyLog("p"); return stop(); }
      if(inF) return;
      var n1 = +k; if(n1 >= 1 && n1 <= 6){ var S = tgLF("p"); S.out = TG_OUTS[n1 - 1]; S.ops = null; S.rest = false; if(S.out === "Will call back" && !S.when) S.when = tgWhenOpts()[1][1]; render(); return stop(); }
      if(k === "n" || k === "N"){ var na = document.querySelector('.tg-pop [data-tg-in="note"], .tg-pop [data-tg-in="msg"]'); if(na){ na.focus(); return stop(); } }
      return;
    }
    if(P.type === "release"){
      if(k === "Enter"){ var A = UI.tgRL || {}; if(A.fix){ tgRelFix(A.fix); return stop(); } var ro = tgRoById(P.ro), bad = tgRelChecks(ro).filter(function(c){ return !c.ok; }).length + RELEASE_CHECK.filter(function(x){ return x[0] !== "road" && !releaseState(ro)[x[0]]; }).length;
        if(!bad) tgRelease(false); else if(A.any && A.reason) tgRelease(true); return stop(); }
      if(inF) return; return stop();
    }
    if(P.type === "xfer"){
      if(k === "Tab") return;
      if(k === "Enter"){ if(inF && t.type === "datetime-local") return; trxXferKey("Enter"); return stop(); }
      if(inF) return;
      trxXferKey(k); return stop();
    }
    if(P.type === "road" || P.type === "checks"){
      if(k === "Tab") return;
      if(P.type === "checks" && k === "Enter" && t.dataset && t.dataset.tgIn === "trx-qadd"){ trxQcSet("add"); render(); trxFocusAdd(); return stop(); }
      if(inF) return; return stop();
    }
    /* menus: snooze, assign, check-in */
    var N = P.type === "snooze" ? 5 : P.type === "assign" ? rtTechs().length : tgFreeSpots().length, act = { snooze: "tg-snz-pick", assign: "tg-as-pick", checkin: "tg-ci-pick" }[P.type];
    if(k === "ArrowDown" || k === "j"){ P.i = ((P.i || 0) + 1) % Math.max(N, 1); render(); return stop(); }
    if(k === "ArrowUp" || k === "k"){ P.i = ((P.i || 0) - 1 + N) % Math.max(N, 1); render(); return stop(); }
    var pick = function(i){ var b = document.querySelector('.tg-pop [data-action="' + act + '"][data-i="' + i + '"]'); if(b) tgAct(act, b); };
    if(k === "Enter"){ pick(P.i || 0); return stop(); }
    var n3 = +k; if(n3 >= 1 && n3 <= N){ pick(n3 - 1); return stop(); }
    return stop();
  }
  if(inF){ if(k === "Enter" && !e.shiftKey && t.dataset && t.dataset.tgIn === "note" && t.dataset.sc === "c"){ tgApplyLog("c"); return stop(); } if(k === "Escape" && t.blur) t.blur(); return; }
  if(k === "Escape"){ if(UI.tgClash){ UI.tgClash = null; render(); return stop(); } if(UI.yardPick) return; if(UI.tgFilter){ UI.tgFilter = null; render(); return stop(); } return; }
  if(k === "j" || k === "ArrowDown"){ tgMove(1); return stop(); }
  if(k === "k" || k === "ArrowUp"){ tgMove(-1); return stop(); }
  if(k === "Enter"){ UI.tgKB = true; tgDo(UI.tgSel); return stop(); }
  if(k === "s"){ UI.tgKB = true; tgOpenPop("snooze", UI.tgSel); return stop(); }
  if(k === "c"){ UI.tgKB = true; tgOpenPop("log", UI.tgSel); return stop(); }
  if(k === "t"){ UI.tgKB = true; tgOpenPop("xfer", UI.tgSel); return stop(); }
  if((k === "m" || k === "M") && UI.tgView === "yard" && UI.tgSel){ UI.yardPick = UI.tgSel; UI.tgClash = null; render(); return stop(); }
  if(k === "/"){ psmOpen("triage"); return stop(); }
  if(k === "1" || k === "2" || k === "3"){ UI.tgView = ["inbox", "desk", "yard"][+k - 1]; UI.yardPick = null; persistUI(); render(); return stop(); }
}, true);
document.addEventListener("dragstart", function(e){
  var d = e.target && e.target.closest ? e.target.closest("[data-tg-drag]") : null; if(!d) return;
  if(UI.tgView !== "yard" && d.classList.contains("tg-it")){ e.preventDefault(); return; }
  UI.tgDrag = d.dataset.tgDrag; try{ e.dataTransfer.setData("text/plain", "tg:" + UI.tgDrag); e.dataTransfer.effectAllowed = "move"; }catch(x){}
  var yd = document.querySelector(".tg-yd"); if(yd) yd.classList.add("dragging"); d.classList.add("src");
});
document.addEventListener("dragover", function(e){ var z = e.target && e.target.closest ? e.target.closest("[data-tg-drop]") : null; if(!z || !UI.tgDrag) return;
  e.preventDefault(); try{ e.dataTransfer.dropEffect = "move"; }catch(x){} document.querySelectorAll(".tg-s.over").forEach(function(x){ if(x !== z) x.classList.remove("over"); }); z.classList.add("over"); });
document.addEventListener("dragleave", function(e){ var z = e.target && e.target.closest ? e.target.closest("[data-tg-drop]") : null; if(z && !z.contains(e.relatedTarget)) z.classList.remove("over"); });
document.addEventListener("drop", function(e){ var z = e.target && e.target.closest ? e.target.closest("[data-tg-drop]") : null; if(!z || !UI.tgDrag) return; e.preventDefault(); var id = UI.tgDrag; UI.tgDrag = null; tgMoveTo(id, z.dataset.tgDrop); render(); });
document.addEventListener("dragend", function(){ UI.tgDrag = null; var yd = document.querySelector(".tg-yd"); if(yd) yd.classList.remove("dragging"); document.querySelectorAll(".tg-s.over,.tg-s.src,.tg-it.src").forEach(function(x){ x.classList.remove("over", "src"); }); });

/* after every render on this page: place the popover by its item, keep the keyboard row in view */
function tgAfter(){
  if(UI.view !== "triage") return;
  var body = document.querySelector(".tg-body"), pop = document.querySelector(".tg-pop");
  if(pop && body && UI.tgPop){
    var it = document.querySelector('.tg-it[data-ro="' + UI.tgPop.ro + '"]'), br = body.getBoundingClientRect(), top = 12;
    if(it){ var ir = it.getBoundingClientRect(); top = ir.top - br.top - 6; }
    top = Math.round(Math.max(12, Math.min(top, body.offsetHeight - pop.offsetHeight - 12)));
    pop.style.top = top + "px"; UI.tgPopTop = top;
  }
  var sc = document.querySelector(".tg-scroll"), on = sc && sc.querySelector(".tg-it.on");
  if(on && UI.tgKB){ if(on.offsetTop < sc.scrollTop + 30) sc.scrollTop = on.offsetTop - 40; else if(on.offsetTop + on.offsetHeight > sc.scrollTop + sc.clientHeight - 20) sc.scrollTop = on.offsetTop + on.offsetHeight - sc.clientHeight + 40; }
  var apf = document.querySelector(".tg-apf"), th = document.querySelector(".tg-thread, .tg-dk");
  if(apf && th && UI.tgAP && UI.tgAPScroll !== UI.tgAP.op){ UI.tgAPScroll = UI.tgAP.op; var a = apf.getBoundingClientRect(), b = th.getBoundingClientRect(); if(a.bottom > b.bottom) th.scrollTop += Math.max(0, Math.min(a.bottom - b.bottom + 16, a.top - b.top - 12)); }
  if(!UI.tgAP) UI.tgAPScroll = null;
  if(UI.tgFlash){ var f = document.querySelector('.tg-s[data-tg-drop="' + UI.tgFlash + '"], .tg-s[data-ro="' + ((tgYard().filter(function(r){ return tgSpotOf(r) === UI.tgFlash; })[0]) || {}).id + '"]'); if(f){ f.classList.add("flash"); if(f.scrollIntoView) f.scrollIntoView({ block: "nearest" }); } UI.tgFlash = null; }
  if(UI.tgSrch){ var q = document.getElementById("tg-q"); if(q && document.activeElement !== q){ q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
}

/* the late badge on the nav, and what turned late while you were away */
function tgTrack(){
  var late = tgLateIds(), on = UI.view === "triage";
  if(!on){
    if(UI.tgLeft == null){ UI.tgLeft = UI.tgLastLate || late; UI.tgAwayName = (navPages().filter(function(p){ return p[0] === UI.view; })[0] || [])[1] || "another page"; }
    var prev = UI.tgBadgeIds || late, nw = late.filter(function(id){ return prev.indexOf(id) < 0; });
    UI.tgBump = nw.length > 0;
    if(nw.length){ var names = nw.map(function(id){ var r = getRO(id); return r ? r.customerName || roLabel(r) : ""; }).filter(Boolean).join(", "); setTimeout(function(){ pushToast(names + " turned late — see Triage."); }, 0); }
    UI.tgBadgeIds = late; UI.tgBadgeN = late.length;
  } else {
    if(UI.tgLeft){ UI.tgNewLate = late.filter(function(id){ return UI.tgLeft.indexOf(id) < 0; }); UI.tgLeft = null; }
    UI.tgLastLate = late; UI.tgBadgeN = 0; UI.tgBadgeIds = null; UI.tgBump = false;
  }
}
/* the triage card's extraction box hands off to the New Repair Order form's importer */
function tyExtract(text, files){   /* Parsec 12: the Triage box hands what it has to the import */
  UI.trMenu = false; IMPX.open({ text: text || "", files: files || null, form: UI.trForm || {} });
}

/* ============================== Triage — the selected RO's stage progress, next step and
   Ready to close (moved here from the RO page). Later each bar will show only when its trigger fires. */
function raNextBarHtml(ro){
  var n = raNext(ro);
  return '<div class="ra-next '+n.tone+'"><i></i><span class="ra-nt"><span class="ra-nl">Next step</span><b>'+esc(n.txt)+'</b></span>'+(n.ready ? '<span class="ra-rd mono">'+esc(n.ready)+'</span>' : '')+'<span class="ra-nb">'+n.btn+'</span></div>';
}
function tyCloseChecks(ro){
  var live = raLive(ro), open = live.filter(function(op){ return !opDoneNow(op); }), parts = [], noNote = [];
  live.forEach(function(op){
    opRealParts(op).forEach(function(p){ if(p.status !== "Installed") parts.push({ op: op, p: p }); });
    STATE.punches.forEach(function(p){ if(p.roId === ro.id && p.opId === op.id && p.stop && !noteEntries(p.notes).length) noNote.push({ op: op, p: p }); });
  });
  var rt = ro.roadTest;
  return [
    { k: "ops", t: "All operations complete", ok: live.length > 0 && !open.length, d: open.length ? (live.length - open.length) + ' of ' + live.length + ' · Op ' + raN(ro, open[0]) + ' open' : live.length + ' of ' + live.length, op: open[0] },
    { k: "parts", t: "Parts installed", ok: !parts.length, d: parts.length ? parts.length + ' not installed' : 'all installed', op: parts[0] && parts[0].op },
    { k: "notes", t: "Notes written", ok: !noNote.length, d: noNote.length ? noNote.length + ' punch' + (noNote.length === 1 ? '' : 'es') + ' with no note' : 'every punch has a note', op: noNote[0] && noNote[0].op },
    { k: "files", t: "Files on the RO", ok: roFilesN(ro) > 0, d: roFilesN(ro) ? roFilesN(ro) + " file" + (roFilesN(ro) === 1 ? "" : "s") : "none yet — photos, the paperwork" },
    { k: "road", t: "Road test passed", ok: !!rt && rt.result !== "Fail", d: rt ? rt.result + (rt.miles ? ' · ' + rt.miles + ' mi' : '') : 'not logged yet' }
  ].filter(function(c){ return c.k !== "road" || rtNeeded(ro); });   /* Parsec 14 */
}
/* the page's own pop-overs close when you press anywhere outside them */
document.addEventListener("pointerdown", function(e){
  var path = e.composedPath ? e.composedPath() : [e.target];
  var within = function(sel){ return path.some(function(n){ return n && n.nodeType === 1 && n.matches && n.matches(sel); }); };
  if(within(".modal-backdrop, .modal, [role=dialog]:not(.segpop)")) return;
  var ch = false;
  if(UI.trMenu && !within(".ty-menu, [data-action=tr-where]")){ UI.trMenu = false; ch = true; }
  if(UI.rlMenu && !within(".rl-menu, [data-action=rl-menu]")){ UI.rlMenu = null; ch = true; }
  if((UI.segPick || UI.segAir || UI.segEmpty || UI.segShift) && !within(".segpop, [data-action^=seg-], [data-action^=air-], [data-action^=shift-]")){
    UI.segPick = null; UI.segAir = null; UI.segEmpty = null; UI.segShift = null; UI.segMsg = ""; ch = true; }
  if(ch) render();
}, true);
function tyOpSet(ro, op, nm){                                          /* by hand — no automatic gate */
  pushUndo("operation status");
  if(nm !== "Working") STATE.punches.forEach(function(rp){ if(rp.opId === op.id && !rp.stop){ rp.stop = nowIso(); rp.stopReason = nm; } });   /* Parsec 12.7: everyone on it */
  if(!/^Complete/.test(nm)) opReopenMark(op, ro.id, nm);   /* Parsec 12.8 */
  op.jobStatus = { status: nm, setAt: nowIso(), hand: true };
  scheduleSave(true);
}
function tySelAct(a, t){
  var ro = getRO(t.dataset.ro || UI.tyRoad);
  if(a === "ty-stg" && ro){ stageToggle(ro, t.dataset.k); render(); return true; }
  if(a === "ty-opdone" && ro){ var op0 = (ro.operations || []).filter(function(o){ return o.id === t.dataset.op; })[0]; if(!op0) return true;
    var s0 = opStatus(op0), n0 = typeof s0 === "string" ? s0 : s0.status; tyOpSet(ro, op0, /^Complete/.test(n0) ? "Hold Tech" : "Complete"); render(); return true; }
  if(a === "ty-newro"){ UI.trMenu = false; render(); IMPX.open({}); return true; }
  if(a === "ty-road"){ UI.tyRoad = UI.tyRoad === (ro && ro.id) ? null : ro && ro.id; UI.tyRoadRes = null; render(); return true; }
  if(a === "ty-road-res"){ var mi = document.getElementById("ty-rt-mi"), ck = document.getElementById("ty-rt-chk"); UI.tyRoadMi = mi ? mi.value : ""; UI.tyRoadChk = ck ? ck.value : ""; UI.tyRoadRes = t.dataset.v; render();
    var mi2 = document.getElementById("ty-rt-mi"), ck2 = document.getElementById("ty-rt-chk"); if(mi2) mi2.value = UI.tyRoadMi; if(ck2) ck2.value = UI.tyRoadChk; return true; }
  if(a === "ty-road-save" && ro){
    var m = document.getElementById("ty-rt-mi"), c = document.getElementById("ty-rt-chk");
    pushUndo("road test");
    ro.roadTest = { miles: m ? m.value.trim() : "", start: (ro.roadTest && ro.roadTest.start) || "", result: UI.tyRoadRes || (ro.roadTest && ro.roadTest.result) || "Pass", checked: c ? c.value.trim() : "", at: nowIso() };
    UI.tyRoad = null; UI.tyRoadRes = null; scheduleSave(true); render(); pushToast("Road test logged — " + ro.roadTest.result.toLowerCase() + ".", true); return true;
  }
  if(a === "ty-road-del" && ro){ pushUndo("road test"); delete ro.roadTest; UI.tyRoad = null; scheduleSave(true); render(); return true; }
  return false;
}
