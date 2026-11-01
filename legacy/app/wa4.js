
/* ============================== doing things ============================== */
var WA_LOGO = /*__WALOGO__*/"";
var WA_PCSS = /*__WAPCSS__*/"";
function waSnzObj(until, why){ return { until: new Date(until).toISOString(), why: why || "", at: nowIso(), by: tgMe() }; }
function waTmr8(days){ var d = new Date(); d.setDate(d.getDate() + (days || 1)); d.setHours(8, 0, 0, 0); return d.getTime(); }
function waAway(ro, to, why){ ro.waAway = { to: to, at: ro.route ? ro.route.at : null, why: why || "" }; }
function waWs(v){ var d = waD(v); if(!d) return v; var p = function(n){ return String(n).padStart(2, "0"); }; return p(d.getMonth() + 1) + "-" + p(d.getDate()) + "-" + d.getFullYear(); }
function waRet(P){ UI.waPop = P && P.ret ? P.ret : null; UI.waPopTop = null; }
function waClone(P){ return P ? JSON.parse(JSON.stringify(P)) : null; }
/* the op the keys act on: the one picked on the page, the item's, the first filed, the first */
function waOpFor(ro){ var ops = wcOps(ro); if(!ops.length) return null; var u = ops.filter(function(o){ return o.id === UI.waOp; })[0]; if(u) return u;
  var x = waItemOf(ro.id); if(x && x.op) return x.op; return ops.filter(function(o){ return waSt(ro, o) !== "repair"; })[0] || ops[0]; }
/* after an action: if the RO left Needs action, the next one takes its place */
function waAfterAct(id, before){ waNcClear(); var L = waFlat(), i = before.indexOf(id); if(i > -1 && L.indexOf(UI.waSel) < 0) UI.waSel = L.length ? L[Math.min(i, L.length - 1)] : UI.waSel; }
function waDone(ro, ic, what, msg, before, snz){ if(ro){ delete ro.waSnz; if(snz) ro.waSnz = snz; waClear(ro, ic, what); } UI.waPop = null; waAfterAct(ro ? ro.id : null, before); scheduleSave(true); pushToast(msg, true); }
function waDo(id){ var x = waItemOf(id); if(!x) return; UI.waSel = id;
  if(x.act === "accept") return waAccept(x.ro);
  if(x.act === "nudge") return waNudge(x.ro, x.op);
  var ex = { op: x.op ? x.op.id : null, pt: x.part || null }; if(x.act === "follow"){ var v = waVol(x.ro); ex.kind = v && x.why === v.txt ? "vol" : "claim"; }
  waOpenPop(x.act, id, ex); }
function waOpenPop(type, id, extra){
  var ro = id ? getRO(id) : null; if(!ro && ["cfg", "rets", "terms"].indexOf(type) < 0) return;
  if(type === "snooze" && !waItemOf(id)) return;
  if(id) UI.waSel = id;
  UI.waPop = { type: type, ro: id || null }; if(extra) for(var k in extra) if(extra[k] != null) UI.waPop[k] = extra[k];
  UI.waPopTop = null; UI.waSrch = false;
  var F = { field: '[data-wa-in="p:v"]', tag: '[data-wa-in="p:tag"]', paid: '#wa-pd' }[type] || null;
  if(type === "srt" && ro){ var op = waOpOf(ro, extra && extra.op) || wcOps(ro)[0]; if(op && !waNum((op.claim || {}).srtHrs)) F = '[data-wa-in="p:so"]'; }
  UI.waFocus = F; render(); }
function waPopToggle(type, id, extra){ var P = UI.waPop; if(P && P.type === type && P.ro === (id || null) && (!extra || !extra.op || P.op === extra.op)){ UI.waPop = null; render(); return; } waOpenPop(type, id, extra); }
function waAccept(ro){ if(!ro) return; pushUndo("accept"); rtAccept(ro); delete ro.waSnz; delete ro.waAway; waNcClear(); UI.waSel = ro.id; scheduleSave(true);
  pushToast(roLabel(ro) + " accepted — it’s with you now.", true); }
function waNudge(ro, op){ if(!ro) return; op = op && op.claim && op.claim.ask ? op : wcOps(ro).filter(function(o){ return o.claim && o.claim.ask; })[0]; var a = op && op.claim.ask; if(!a) return;
  var before = waFlat(); pushUndo("nudge"); a.at = nowIso(); a.n = (a.n || 0) + 1;
  rtLog(ro, { kind: "nudge", at: nowIso(), by: tgMe(), to: "tech", who: a.who }); try{ audit("route", roLabel(ro) + " — warranty nudged " + a.who, ro); }catch(e){}
  waAfterAct(ro.id, before); scheduleSave(true); pushToast("Nudged " + a.who + " — it turns late again in " + waCfg().ask + " h if nothing’s written.", true); }
function waSnooze(ro, until, why){ if(!ro) return; var before = waFlat(); pushUndo("snooze"); ro.waSnz = waSnzObj(until, why); UI.waPop = null; waAfterAct(ro.id, before); scheduleSave(true);
  pushToast((ro.customerName || roLabel(ro)) + " snoozed until " + tgWhen(+new Date(until)) + ".", true); }

function waGo(){
  waNcClear(); var P = UI.waPop; if(!P) return; var ro = P.ro ? getRO(P.ro) : null, op = ro ? (P.op ? waOpOf(ro, P.op) : null) || wcOps(ro)[0] || null : null, before = waFlat(), C = waCfg(), n = ro && op ? raN(ro, op) : null;
  var on = function(){ return roLabel(ro) + (ro && wcOps(ro).length > 1 ? " op " + n : ""); }, today = waMdy(new Date());
  switch(P.type){
    case "xfer": { if(!ro || !P.to || !P.why) return; var who = P.to === "tech" ? (ro.assignedTech || null) : null; pushUndo("send to " + RT_LBL[P.to]);
      rtSend(ro, P.to, who, P.note || "", null, { reason: P.why }); waAway(ro, P.to, P.why);
      return waDone(ro, "swap", "To " + RT_LBL[P.to] + " · " + P.why, tgNum(ro) + " to " + (P.to === "tech" ? (who || "the tech") : RT_LBL[P.to]) + " · " + P.why + " — it comes back here when they send it on.", before); }
    case "file": { if(!op || waGaps(ro, op).length) return; var cn = String(P.cn || "").trim(); pushUndo("file claim");
      waSet(ro, op, "submitted", cn ? { claimNo: cn } : null);
      return waDone(ro, "send", "Filed" + (cn ? " · " + cn : ""), "Claim filed for " + on() + (cn ? " · " + cn : " — add the claim # when Volvo gives it") + ".", before); }
    case "field": { if(!ro) return; var v = String(P.v == null ? "" : P.v).trim(), k = P.k, c = op ? wcClaim(op) : null;
      var L = { code: "fault code", vin: "VIN", mi: "mileage", eh: "engine hours", ws: "warranty start date", prev: "earlier claim #", pa: "pre-approval #", ts: "tech support case #" }[k] || "value";
      if(k === "vin") v = v.replace(/\s+/g, "").toUpperCase();
      if(k === "vin" && v && v.length !== 17){ pushToast("A VIN has 17 characters — that one has " + v.length + "."); return; }
      if(k === "ws" && v && !waD(v)){ pushToast("Write the date as MM-DD-YYYY."); return; }
      pushUndo("add " + L);
      if(k === "code"){ if(c) c.failCode = v; } else if(k === "vin") ro.vin = v; else if(k === "mi") ro.mileage = v; else if(k === "eh") ro.engineHours = v; else if(k === "ws") ro.warrantyStart = v ? waWs(v) : "";
      else if(k === "prev"){ if(c) c.prev = v; } else if(k === "pa"){ if(c) c.pa = v; } else if(k === "ts") ro.techSupportCase = v;
      waRet(P); scheduleSave(true); pushToast(waCap(L) + (v ? " saved on " + roLabel(ro) + "." : " cleared."), true); return; }
    case "tag": { if(!op) return; var cp = waCausal(op) || opRealParts(op)[0], tg = String(P.tag || "").trim(); if(!cp || !tg) return;
      var dup = waShelf().filter(function(x){ return x.p !== cp && String(x.fp.tag).toLowerCase() === tg.toLowerCase(); })[0]; if(dup){ pushToast("Tag " + tg + " is already on " + roLabel(dup.ro) + " — pick another number."); return; }
      pushUndo("tag failed part"); var fp = cp.fp || (cp.fp = {}); fp.tag = tg; fp.shelf = P.shelf || C.shelves[0]; if(!fp.keep) fp.keep = todayStr(waPlus(new Date(), C.keep)); if(!fp.at) fp.at = nowIso();
      if(!waCausalSet(op)) wcClaim(op).causal = cp.id;
      waRet(P); scheduleSave(true); pushToast("Tag " + tg + " · shelf " + fp.shelf + " — print it from the Parts view.", true); return; }
    case "causal": { if(!op || !P.j) return; pushUndo("causal part"); wcClaim(op).causal = P.j; var pj = waPartOf(op, P.j); waRet(P); scheduleSave(true); pushToast("Causal part: " + ((pj && pj.description) || "set") + ".", true); return; }
    case "ask": { if(!op || !P.who || !(P.w || []).length) return; var W = { cause: "the cause", correction: "the correction", photo: "a photo of the causal part", labor: "the labor clocked" }, txt = P.w.map(function(w){ return W[w]; }).join(" and ");
      pushUndo("ask the tech"); rtSend(ro, "tech", P.who, "Warranty needs " + txt + " · op " + n + (String(P.note || "").trim() ? " — " + String(P.note).trim() : ""), null, { reason: "Warranty info" });
      wcClaim(op).ask = { who: P.who, at: nowIso(), what: P.w.slice(), n: 0, note: String(P.note || "").trim() };
      return waDone(ro, "chat", "Asked " + tgFirst(P.who) + " · " + P.w.join(", "), "Asked " + P.who + " for " + txt + " — it’s on " + tgFirst(P.who) + "’s Console.", before); }
    case "follow": { if(!ro || P.o == null) return; var kind = P.kind2, vv = waVol(ro), o = +P.o, tf = ro.assignedTech || "the tech";
      if(kind === "ts"){
        if(o === 0){ var ans = String(P.ans || "").trim(); if(!ans){ pushToast("Write what Volvo said first."); UI.waFocus = '[data-wa-in="p:ans"]'; render(); return; }
          pushUndo("tech support answer"); delete ro.waVol; if(roStatus(ro).status === "Waiting – Tech Support") fmSetSt(ro, "Hold Tech", null);
          rtSend(ro, "tech", ro.assignedTech || null, "Tech support: " + ans, null, { reason: "Tech support answer" });
          return waDone(ro, "phone", "Tech support answered", "Sent to " + tf + ": “" + ans + "”", before); }
        pushUndo("follow up"); rtLog(ro, { kind: "note", at: nowIso(), by: tgMe(), to: "warranty", note: o === 1 ? "Called Volvo tech support — case still open" : "Escalated the tech support case to the field rep" });
        return waDone(ro, "phone", o === 1 ? "Called tech support" : "Escalated to the field rep", (o === 1 ? "Call logged" : "Escalated") + " — back in Needs action tomorrow morning.", before, waSnzObj(waTmr8(1), o === 1 ? "Called — case still open" : "Escalated to the field rep")); }
      if(kind === "pre"){
        if(o === 0){ var pa = String(P.pa || "").trim(), w0 = (vv && vv.v && vv.v.what) || ""; pushUndo("pre-approval"); delete ro.waVol;
          if(op){ var c0 = wcClaim(op); if(pa) c0.pa = pa; if(/SRT/i.test(w0)){ c0.srtWhy = "Pre-approved by Volvo" + (pa ? " · " + pa : ""); c0.laborHrs = Math.max(waClaimH(op), +op.burnt || 0).toFixed(1); } }
          rtSend(ro, "tech", ro.assignedTech || null, "Volvo approved it" + (pa ? " · " + pa : "") + " — go ahead", null, { reason: "Approved — go ahead" });
          return waDone(ro, "check", "Pre-approved" + (pa ? " · " + pa : ""), "Pre-approval logged" + (pa ? " · " + pa : "") + " — " + tf + " gets the go-ahead.", before); }
        if(o === 1){ pushUndo("pre-approval denied"); delete ro.waVol; rtSend(ro, "writer", null, "Volvo denied the pre-approval" + (op ? " on op " + n : "") + " — a customer estimate", null, { reason: "Approval needed" }); waAway(ro, "writer", "Customer estimate");
          return waDone(ro, "swap", "Pre-approval denied · to Approval", tgNum(ro) + " to Approval — a new estimate for the customer.", before); }
        pushUndo("follow up"); rtLog(ro, { kind: "note", at: nowIso(), by: tgMe(), to: "warranty", note: "Called Volvo — pre-approval still waiting" });
        return waDone(ro, "phone", "Called · still waiting", "Call logged — back in 2 hours.", before, waSnzObj(Date.now() + 2 * 3600000, "Pre-approval — still waiting")); }
      if(o === 2){ UI.waPop = null; UI.waView = "claims"; UI.waOp = op ? op.id : null; UI.waOpScroll = UI.waOp; persistUI(); render(); return; }
      pushUndo("follow up"); rtLog(ro, { kind: "note", at: nowIso(), by: tgMe(), to: "warranty", note: (o === 0 ? "Called Volvo" : "Emailed the claims desk") + " about " + ((op && op.claim && op.claim.claimNo) || "the claim") });
      return waDone(ro, "phone", o === 0 ? "Called Volvo" : "Emailed the claims desk", "Logged — back in 3 days if Volvo hasn’t answered.", before, waSnzObj(waTmr8(3), o === 0 ? "Called — still reviewing" : "Emailed the claims desk")); }
    case "part": { if(!op || P.o == null) return; var pp = waPartOf(op, P.pt); if(!pp || !pp.fp) return; var f = pp.fp, o2 = +P.o;
      if(f.ret){ if(o2 === 0){ var trk = String(P.trk || "").trim(); pushUndo("ship failed part"); f.done = "Shipped " + today + (trk ? " · " + trk : "") + (f.ret.ra ? " · RA " + f.ret.ra : ""); f.doneAt = nowIso();
          return waDone(ro, "parts", "Shipped tag " + f.tag, "Tag " + f.tag + " shipped" + (trk ? " · " + trk : "") + " — the RA closes.", before); }
        pushUndo("find failed part"); rtSend(ro, "parts", null, "Find failed part tag " + f.tag + " (" + (pp.description || "part") + ") — Volvo wants it back" + (f.ret.ra ? " · RA " + f.ret.ra : "") + " by " + waMdy(f.ret.by), null, { reason: "Find a failed part" }); waAway(ro, "parts", "Find tag " + f.tag);
        return waDone(ro, "swap", "To Parts · find tag " + f.tag, tgNum(ro) + " to Parts — find tag " + f.tag + ".", before); }
      pushUndo("failed part");
      if(o2 === 1){ f.keep = todayStr(waPlus(new Date(), 14)); return waDone(ro, "parts", "Keeping tag " + f.tag + " 14 more days", "Tag " + f.tag + " kept until " + waByTxt(14) + ".", before); }
      f.done = (o2 === 0 ? "Scrapped " : "Given back to the customer ") + today; f.doneAt = nowIso();
      if(o2 === 2) rtLog(ro, { kind: "note", at: nowIso(), by: tgMe(), to: "warranty", note: "Failed part tag " + f.tag + " (" + (pp.description || "part") + ") given back to the customer" });
      return waDone(ro, "parts", (o2 === 0 ? "Scrapped tag " : "Gave back tag ") + f.tag, "Tag " + f.tag + (o2 === 0 ? " scrapped." : " given back to the customer — logged on the RO."), before); }
    case "decide": { if(!op || !P.d) return; var s = waSt(ro, op), den = s === "denied", cl = wcClaim(op), amt = waAmt(op), cno = cl.claimNo || "the claim";
      if(P.d === "fix"){ UI.waPop = null; UI.waView = "claims"; UI.waOp = op.id; UI.waOpScroll = op.id; persistUI(); render(); return; }
      if(P.d === "appeal"){ var ap = String(P.ap || "").trim(); if(!ap){ pushToast("Write why Volvo should pay it first."); UI.waFocus = '[data-wa-in="p:ap"]'; render(); return; }
        pushUndo("appeal"); waSet(ro, op, "appealed", { appeal: ap }); delete cl.dec;
        return waDone(ro, "send", "Appealed " + cno, "Appeal sent for " + cno + " — it waits under Waiting on Volvo.", before); }
      if(P.d === "gw"){ pushUndo("goodwill request"); rtSend(ro, "manager", null, "Goodwill request · " + cno + " · " + waUsd(amt) + " · Volvo " + (den ? "denied" : "returned") + " it" + (cl.returnReason ? ": " + cl.returnReason : ""), null, { reason: "Goodwill request" }); waAway(ro, "manager", "Goodwill request");
        return waDone(ro, "swap", "Goodwill · to the manager", tgNum(ro) + " to " + (rtPerson("manager") || "the manager") + " · goodwill request. It comes back here.", before); }
      if(P.d === "bill"){ pushUndo("bill the customer"); rtSend(ro, "writer", null, "Bill the customer " + waUsd(amt) + " — Volvo " + (den ? "denied" : "returned") + " " + cno + (cl.returnReason ? ": " + cl.returnReason : ""), null, { reason: "Bill the customer" });
        waSet(ro, op, "billed", { dec: "Billed to the customer " + today }); waAway(ro, "writer", "Bill the customer");
        return waDone(ro, "swap", "To Approval · customer pays", tgNum(ro) + " to Approval — a customer estimate for " + waUsd(amt) + ".", before); }
      if(P.d === "wo"){ var why = String(P.wo || "").trim();
        if(amt > C.wo && !cl.woAsk){ pushUndo("write-off sign-off"); cl.woAsk = { at: nowIso(), why: why }; rtSend(ro, "manager", null, "Write-off sign-off · " + cno + " · " + waUsd(amt) + (why ? " — " + why : ""), null, { reason: "Write-off sign-off" }); waAway(ro, "manager", "Write-off sign-off");
          return waDone(ro, "swap", "Write-off · to the manager", "Over " + waUsd0(C.wo) + " — " + (rtPerson("manager") || "the manager") + " signs off first. It comes back here.", before); }
        pushUndo("write off"); waSet(ro, op, "written", { dec: "Written off" + (why ? " — " + why : "") });
        return waDone(ro, "x", "Written off " + waUsd(amt), waUsd(amt) + " written off on " + cno + ".", before); }
      return; }
    case "short": { if(!op || !P.d) return; var c2 = wcClaim(op), sh = c2.short; if(!sh) return; var cn2 = c2.claimNo || "the claim";
      if(P.d === "accept"){ pushUndo("accept short pay"); sh.dec = "Accepted " + today;
        return waDone(ro, "check", "Short pay accepted · " + waUsd(sh.amt), waUsd(sh.amt) + " written off on " + cn2 + " — the claim is closed.", before); }
      if(P.d === "appeal"){ var ap2 = String(P.ap || "").trim(); if(!ap2){ pushToast("Write a note for the appeal first."); UI.waFocus = '[data-wa-in="p:ap"]'; render(); return; }
        pushUndo("appeal short pay"); sh.dec = "Appealed " + today; waSet(ro, op, "appealed", { appeal: ap2 });
        return waDone(ro, "send", "Appealed the short pay", "Appeal sent for the " + waUsd(sh.amt) + " — it waits under Waiting on Volvo.", before); }
      pushUndo("bill short pay"); sh.dec = "Billed to the customer " + today; rtSend(ro, "writer", null, "Bill the customer " + waUsd(sh.amt) + " — Volvo paid " + cn2 + " short" + (sh.why ? " (" + sh.why + ")" : ""), null, { reason: "Bill the customer" }); waAway(ro, "writer", "Bill the short pay");
      return waDone(ro, "swap", "Short pay · to Approval", tgNum(ro) + " to Approval — add " + waUsd(sh.amt) + " to the customer’s invoice.", before); }
    case "paid": { if(!op) return; var a3 = waAmt(op), pd = P.pd != null && String(P.pd).trim() !== "" ? waNum(P.pd) : a3, cut = Math.round((a3 - pd) * 100) / 100, src = String(P.src || "").trim();
      if(cut > 0.004 && !P.why){ P.need = true; render(); return; }
      pushUndo("mark paid"); var ex = { paid: pd.toFixed(2) }; if(src) ex.src = src; if(cut > 0.004) ex.short = { amt: cut, why: P.why, src: src, at: nowIso() };
      waSet(ro, op, "paid", ex); if(!(cut > 0.004)) delete op.claim.short;
      return waDone(ro, "dollar", "Paid " + waUsd(pd) + (cut > 0.004 ? " · short " + waUsd(cut) : ""), (op.claim.claimNo || on()) + " paid " + waUsd(pd) + (cut > 0.004 ? " — " + waUsd(cut) + " short, it waits under Paid short." : "."), before); }
    case "srt": { if(!op) return; var c3 = wcClaim(op), sh3 = waNum(c3.srtHrs);
      if(!sh3 || P.edit){ var so = String(P.so != null ? P.so : c3.srtOp || "").trim(), hh = waNum(P.sh != null ? P.sh : c3.srtHrs); pushUndo("SRT");
        c3.srtOp = so; c3.srtHrs = hh ? hh.toFixed(1) : ""; if(!hh) delete c3.srtWhy; var ov = waOverSrt(op);
        if(P.ret) waRet(P); else { UI.waPop = hh && ov > 0.05 ? { type: "srt", ro: ro.id, op: op.id } : null; UI.waPopTop = null; } scheduleSave(true);
        pushToast(hh ? "SRT " + (so ? so + " · " : "") + hh.toFixed(1) + " h" + (ov > 0.05 ? " — the claim is " + ov.toFixed(1) + " h over." : " — the labor is within it.") : "SRT cleared.", true); return; }
      if(P.o == null) return; var o5 = +P.o, ov5 = waOverSrt(op);
      if(o5 === 0){ pushUndo("claim the SRT"); c3.laborHrs = sh3.toFixed(1); delete c3.srtWhy; waRet(P); scheduleSave(true); pushToast("The claim says " + sh3.toFixed(1) + " h" + (ov5 > 0.05 ? " — " + ov5.toFixed(1) + " h stays with the shop." : "."), true); return; }
      if(o5 === 1){ if(!P.why) return; pushUndo("labor reason"); c3.laborHrs = Math.max(waClaimH(op), +op.burnt || 0).toFixed(1); c3.srtWhy = P.why + (String(P.sn || "").trim() ? " — " + String(P.sn).trim() : ""); waRet(P); scheduleSave(true); pushToast("Claiming " + c3.laborHrs + " h — the reason goes on the claim.", true); return; }
      pushUndo("ask Volvo"); ro.waVol = { kind: "pre", at: nowIso(), no: "", what: Math.max(0, ov5).toFixed(1) + " h over the SRT on op " + n };
      rtLog(ro, { kind: "note", at: nowIso(), by: tgMe(), to: "warranty", note: "Asked Volvo to pre-approve " + Math.max(0, ov5).toFixed(1) + " h over the SRT" });
      waRet(P); scheduleSave(true); pushToast("Pre-approval asked — it waits under Waiting on Volvo.", true); return; }
  }
}

/* ---------- copy, upload, print, export ---------- */
function waClip(text, cb){
  var fb = function(){ var ok = false; try{ var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0"; document.body.appendChild(ta); ta.select(); ok = document.execCommand("copy"); ta.remove(); }catch(e){} if(cb) cb(ok); };
  try{ if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(String(text)).then(function(){ if(cb) cb(true); }, fb); else fb(); }catch(e){ fb(); }
}
function waCopyRow(P, k){ var ro = getRO(P.ro), op = ro && waOpOf(ro, P.op); if(!op) return; var R = waCopyRows(ro, op), x = R[k]; if(!x || !x[1]) return;
  waClip(x[1], function(ok){ if(!ok){ pushToast("Couldn’t reach the clipboard — select the text and copy it."); return; } if(UI.waPop !== P) return; P.copied = k; var j = k + 1; while(j < R.length && !R[j][1]) j++; P.k = j < R.length ? j : k; render(); }); }
function waUpload(ro, task){
  if(typeof JC === "undefined" || !JC.addFilesTo){ pushToast("Open the RO to attach files."); return; }
  var inp = document.createElement("input"); inp.type = "file"; inp.multiple = true; inp.accept = task === "dtc" ? "image/*,.pdf,.txt,.csv,.htm,.html" : "image/*"; inp.style.display = "none";
  inp.addEventListener("change", function(){ var L = inp.files; if(!L || !L.length){ inp.remove(); return; }
    JC.addFilesTo(ro, task, L, function(n){ inp.remove(); waNcClear(); if(n) pushToast(n + (n === 1 ? " file" : " files") + " attached to " + roLabel(ro) + " · " + ({ dashpic: "Dash pic", pics: "Take pictures", dtc: "Upload DTCs" }[task] || task) + "."); else pushToast("Couldn’t store the file in this browser."); }); });
  document.body.appendChild(inp); inp.click(); }
function waEvFiles(ro){ var L = []; [["dashpic", "Dash"], ["pics", "Failed part"], ["partstag", "Part tag"], ["dtc", "Tech Tool"]].forEach(function(k){ (ro.bulletins || []).forEach(function(e){ if(e.task !== k[0]) return; (e.files || []).forEach(function(f){ L.push({ f: f, lbl: k[1], task: k[0] }); }); }); }); return L; }
var WA_IMG = {}, WA_IMGF = {};
function waIsImg(f){ return /^image\//i.test(f.type || "") || /\.(jpe?g|png|gif|webp|bmp)$/i.test(f.name || ""); }
function waImgTag(ro, f){ WA_IMGF[f.id] = { f: f, ro: ro.id }; return '<img data-wa-img="' + esc(f.id) + '" alt=""' + (WA_IMG[f.id] ? ' src="' + WA_IMG[f.id] + '"' : '') + '>'; }
function waImgUrl(id){ if(WA_IMG[id]) return Promise.resolve(WA_IMG[id]); var F = WA_IMGF[id]; if(!F || typeof JC === "undefined" || !JC.blobOf) return Promise.resolve(null);
  if(!F.p) F.p = JC.blobOf(F.f, F.ro).then(function(b){ F.p = null; return b ? (WA_IMG[id] = URL.createObjectURL(b)) : null; }, function(){ F.p = null; return null; }); return F.p; }
function waLoadImgs(root){ if(!root) return; root.querySelectorAll("img[data-wa-img]").forEach(function(im){ var id = im.getAttribute("data-wa-img"); if(WA_IMG[id]){ if(im.getAttribute("src") !== WA_IMG[id]) im.src = WA_IMG[id]; return; }
  waImgUrl(id).then(function(u){ if(u) document.querySelectorAll('img[data-wa-img="' + id + '"]').forEach(function(x){ x.src = u; }); }); }); }
function waPrintOps(ro, opId){ var ops = wcOps(ro); if(opId){ var o = ops.filter(function(x){ return x.id === opId; }); if(o.length) return o; } var f = ops.filter(function(x){ return waSt(ro, x) !== "repair"; }); return f.length ? f : ops; }
function waSheet(ro, ops){
  var C = waCfg(), b = waBack(ro), t = truckYM(ro), ev = waEvFiles(ro), dd = function(k, v, m){ return '<div><dt>' + k + '</dt><dd' + (m ? ' class="m"' : '') + '>' + (v ? esc(v) : '—') + '</dd></div>'; };
  var h = '<header><div><span class="lg">' + WA_LOGO + '</span><b>Warranty claim packet</b><small>' + esc(C.dealer || "") + '</small></div><div class="r"><b>' + esc(roLabel(ro)) + '</b><small>' + esc(ops.map(function(o){ return (o.claim || {}).claimNo; }).filter(Boolean).join(" · ") || "Claim # when filed") + '</small><small>Printed ' + esc(waMdy(new Date())) + '</small></div></header>';
  h += '<dl class="wa-shu">' + dd("Customer", ro.customerName) + dd("Unit", [ro.unitNumber, t.line].filter(Boolean).join(" · ")) + dd("Engine", ro.engineType) + dd("VIN", ro.vin, 1) + dd("Mileage", milesTxt(ro.mileage), 1) + dd("Engine hours", ro.engineHours, 1) + dd("Warranty start", ro.warrantyStart, 1) + dd("Case #", ro.caseNumber || ro.techSupportCase, 1) + '</dl>';
  if(b) h += '<p class="wa-shb">Comeback of ' + esc(roLabel(b.prev)) + (b.days != null ? ' (' + b.days + ' days)' : '') + (b.claim ? ' · earlier claim ' + esc(b.claim) : '') + '</p>';
  ops.forEach(function(op){ var c = op.claim || {}, cp = waCausal(op), ps = opRealParts(op), techs = {}; opPunches(op.id).forEach(function(p){ var w = punchWho(p); if(w) techs[w] = 1; }); var tn = Object.keys(techs);
    h += '<section><h4><span>Op ' + raN(ro, op) + '</span>' + esc(op.complaint || "Operation") + '<em>' + (opJobType(op) === "RECALL" ? "Recall" : "Warranty") + (c.claimNo ? ' · ' + esc(c.claimNo) : '') + '</em></h4>'
      + '<dl class="wa-sh3"><dt>Complaint</dt><dd>' + esc(op.complaint || "—") + '</dd><dt>Cause</dt><dd>' + esc(opStory(op, "cause") || "—") + '</dd><dt>Correction</dt><dd>' + esc(opStory(op, "fix") || "—") + '</dd></dl>'
      + (ps.length ? '<table><thead><tr><th>Part</th><th>Part #</th><th>Qty</th><th>Failed-part tag</th></tr></thead><tbody>' + ps.map(function(p){ return '<tr><td>' + esc(p.description || "—") + (cp === p ? ' <b>· causal</b>' : '') + '</td><td class="m">' + esc(p.partNumber || "") + '</td><td class="m">' + esc(p.qty || 1) + '</td><td class="m">' + (p.fp && p.fp.tag ? esc(p.fp.tag) + ' · ' + esc(p.fp.shelf || "") : '—') + '</td></tr>'; }).join('') + '</tbody></table>' : '')
      + '<p class="wa-shl">Labor ' + waClaimH(op).toFixed(1) + ' h' + (c.srtOp ? ' · SRT ' + esc(c.srtOp) + (waNum(c.srtHrs) ? ' (' + waNum(c.srtHrs).toFixed(1) + ' h)' : '') : '') + (c.srtWhy ? ' · ' + esc(c.srtWhy) : '') + (tn.length ? ' · ' + esc(tn.join(", ")) : ro.assignedTech ? ' · ' + esc(ro.assignedTech) : '') + ' · fault code ' + esc(waFail(op) || "—") + ' · amount ' + waUsd(waAmt(op)) + (c.pa ? ' · pre-approval ' + esc(c.pa) : '') + '</p></section>'; });
  h += '<section><h4><span>Photos</span>Evidence<em>' + ev.length + ' file' + (ev.length === 1 ? '' : 's') + ' on the RO</em></h4>' + (ev.length ? '<div class="wa-phs">' + ev.slice(0, 12).map(function(x){ return '<figure class="wa-ph"><span class="img' + (waIsImg(x.f) ? ' pic' : '') + '">' + (waIsImg(x.f) ? waImgTag(ro, x.f) : tgI(x.task === "dtc" ? "note" : "file", 22)) + '</span><figcaption><b>' + esc(x.lbl) + '</b> · ' + esc(x.f.name || "") + '</figcaption></figure>'; }).join('') + '</div>' : '<p class="wa-shl">No pictures on the RO yet.</p>') + '</section>';
  return h + '<footer>Printed from Parsec · keep with the failed part until the claim is paid</footer>';
}
function waPrintHtml(){
  var W = UI.waPrint, ro = W && getRO(W.ro); if(!ro){ UI.waPrint = null; return ''; } var ops = waPrintOps(ro, W.op);
  return '<div class="wa-pv" data-wa-keep data-key="wa-pv"><div class="wa-pvb"><b>Print packet</b><span>' + esc(roLabel(ro)) + ' · ' + esc(ro.customerName || "") + ' · ' + ops.length + ' warranty op' + (ops.length === 1 ? '' : 's') + '</span><span class="sp"></span><button class="btn btn-sm" data-action="wa-pvx">Close<span class="tg-kbd">Esc</span></button><button class="btn btn-sm btn-primary" data-action="wa-pvprint">' + tgI("print", 13) + 'Print</button></div>'
    + '<div class="wa-pvs"><article class="wa-sheet">' + waSheet(ro, ops) + '</article></div></div>';
}
var WA_TCSS = '.wa-tags{display:grid;grid-template-columns:1fr 1fr;gap:10px;}.wa-tag{break-inside:avoid;border:1.5px dashed #1d1c1a;border-radius:6px;padding:10px 12px;font:400 11px/15px var(--tg-sans);color:#1d1c1a;}'
  + '.wa-tag .h{display:flex;justify-content:space-between;gap:8px;font-size:9.5px;letter-spacing:.06em;color:#67625a;font-weight:600;}.wa-tag .no{display:block;font:700 26px/32px var(--tg-mono);margin:4px 0 2px;}'
  + '.wa-tag .pt{display:flex;flex-direction:column;margin-bottom:6px;}.wa-tag .pt b{font-size:13px;}.wa-tag .pt span{font-family:var(--tg-mono);color:#57534b;}.wa-tag dl{display:grid;grid-template-columns:62px 1fr;gap:1px 8px;margin:0;}.wa-tag dt{color:#67625a;}.wa-tag dd{margin:0;font-weight:500;}';
var WA_LAST_PRINT = null;
function waPrintDoc(title, body){
  var old = document.getElementById("wa-pfr"); if(old) old.remove();
  var fr = document.createElement("iframe"); fr.id = "wa-pfr"; fr.setAttribute("aria-hidden", "true"); fr.tabIndex = -1; fr.style.cssText = "position:fixed;left:-12000px;top:0;width:820px;height:1100px;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(fr); WA_LAST_PRINT = { title: title, at: Date.now() };
  var w = fr.contentWindow, d = w.document; d.open(); d.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(title) + '</title><style>' + WA_PCSS + WA_TCSS + '</style></head><body>' + body + '</body></html>'); d.close();
  var done = false, go = function(){ if(done) return; done = true; WA_LAST_PRINT.printed = Date.now(); try{ w.focus(); w.print(); }catch(e){ pushToast("Couldn’t open the print dialog."); } try{ window.focus(); }catch(e){} if(UI.waPrint){ UI.waPrint = null; render(); } }, t0 = setTimeout(go, 4000);
  var P = Array.prototype.map.call(d.querySelectorAll("img[data-wa-img]"), function(im){ return waImgUrl(im.getAttribute("data-wa-img")).then(function(u){ if(!u){ im.parentNode.removeChild(im); return; } if(im.getAttribute("src") === u && im.complete) return; return new Promise(function(r){ im.onload = im.onerror = function(){ r(); }; im.src = u; }); }); });
  Promise.all(P).then(function(){ clearTimeout(t0); setTimeout(go, 60); }, function(){ clearTimeout(t0); go(); });
}
function waPrintNow(){ var W = UI.waPrint, ro = W && getRO(W.ro); if(!ro) return; waPrintDoc(roLabel(ro) + " — warranty packet", '<article class="wa-sheet">' + waSheet(ro, waPrintOps(ro, W.op)) + '</article>'); }
function waPrintTags(L){ var C = waCfg();
  waPrintDoc("Failed-part tags", '<div class="wa-tags">' + L.map(function(x){ var c = x.op.claim || {}, f = x.fp; return '<div class="wa-tag"><div class="h"><span>FAILED PART</span><span>' + esc(C.dealer || "") + '</span></div><b class="no">' + esc(f.tag) + '</b><div class="pt"><b>' + esc(x.p.description || "—") + '</b><span>' + esc(x.p.partNumber || "") + '</span></div>'
    + '<dl><dt>RO</dt><dd>' + esc(roLabel(x.ro)) + (wcOps(x.ro).length > 1 ? ' · op ' + raN(x.ro, x.op) : '') + '</dd><dt>Claim #</dt><dd>' + esc(c.claimNo || "not filed yet") + '</dd><dt>Customer</dt><dd>' + esc(x.ro.customerName || "") + '</dd><dt>VIN</dt><dd>' + esc(x.ro.vin || "") + '</dd><dt>Shelf</dt><dd>' + esc(f.shelf || "—") + '</dd><dt>' + (f.ret ? 'Ship by' : 'Keep until') + '</dt><dd>' + esc(waMdy(f.ret ? f.ret.by : f.keep)) + (f.ret && f.ret.ra ? ' · RA ' + esc(f.ret.ra) : '') + '</dd></dl></div>'; }).join('') + '</div>'); }
function waShelfV(){ var F = UI.waPf || "all", SH = UI.waPs || null; return waShelf().filter(function(x){ return (F === "all" || x.st === F || (F === "done" && (x.st === "done" || x.st === "shipped"))) && (!SH || x.fp.shelf === SH); }); }
function waCsv(){
  var q = function(v){ v = String(v == null ? "" : v); return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  var rows = [["RO", "Customer", "Op", "Complaint", "Type", "Claim #", "Status", "Filed", "Approved", "Paid on", "Claimed", "Paid", "Short", "Short reason", "Days since filed"]];
  waAllOps().forEach(function(x){ var o = x.op, c = o.claim || {}, s = waSt(x.ro, o), f = waFiledAt(o), ap = waAt(o, "approved"), pa = waAt(o, "paid");
    rows.push([roLabel(x.ro), x.ro.customerName || "", raN(x.ro, o), o.complaint || "", opJobType(o) === "RECALL" ? "Recall" : "Warranty", c.claimNo || "", (WC_ST[s] || WC_ST.repair).l, f ? waMdy(f) : "", ap ? waMdy(ap) : "", s === "paid" && pa ? waMdy(pa) : "",
      s === "repair" ? "" : waAmt(o).toFixed(2), waPaid(o) ? waPaid(o).toFixed(2) : "", c.short ? waNum(c.short.amt).toFixed(2) : "", c.short ? c.short.why || "" : "", f ? Math.floor(waAgo(f)) : ""]); });
  var blob = new Blob(["﻿" + rows.map(function(r){ return r.map(q).join(","); }).join("\r\n")], { type: "text/csv;charset=utf-8" }), a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "Warranty claims " + todayStr() + ".csv"; a.style.display = "none"; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  pushToast((rows.length - 1) + " claim" + (rows.length === 2 ? "" : "s") + " exported."); }

/* ---------- the payment statement ---------- */
function waStmtMatch(){
  var T = UI.waStmt; if(!T) return; var ta = document.getElementById("wa-stp"); if(ta) T.paste = ta.value;
  var rows = waStmtRows(), all = {}, hit = {}, miss = [], mny = /-?\$?\s?\d{1,3}(?:,\d{3})+\.\d{2}|-?\$?\s?\d+\.\d{2}/g;
  waAllOps().forEach(function(x){ var cn = String((x.op.claim || {}).claimNo || "").trim().toUpperCase(); if(cn) all[cn] = 1; });
  String(T.paste || "").split(/\r?\n/).forEach(function(ln){ var s = ln.trim(); if(!s) return; var am = s.match(mny), last = am ? waNum(am[am.length - 1]) : null, S = s.toUpperCase();
    var cm = /\b(CM-?\d{3,})\b/i.exec(s); if(cm && !String(T.no || "").trim()) T.no = cm[1].toUpperCase();
    var found = rows.filter(function(x){ var cn = String(x.op.claim.claimNo || "").trim().toUpperCase(); return cn && S.indexOf(cn) > -1; });
    if(found.length){ found.forEach(function(x){ hit[x.key] = 1; T.on[x.key] = true; T.amt[x.key] = (last != null ? last : waAmt(x.op)).toFixed(2); }); return; }
    if(/\btotal\b/i.test(s) && last != null){ if(!String(T.total || "").trim()) T.total = last.toFixed(2); return; }
    (S.match(/\bW\d{6,8}\b/g) || []).forEach(function(w){ if(!all[w] && miss.indexOf(w) < 0) miss.push(w); }); });
  T.hit = Object.keys(hit).length; T.miss = miss; render(); }
function waStmtGo(){
  var T = UI.waStmt; if(!T) return; var L = waStmtRows().filter(function(x){ return T.on[x.key]; }); if(!L.length) return; pushUndo("payment statement"); var ns = 0, sum = 0, no = String(T.no || "").trim();
  L.forEach(function(x){ var a = waAmt(x.op), raw = T.amt[x.key], pd = raw != null && String(raw).trim() !== "" ? waNum(raw) : a, cut = Math.round((a - pd) * 100) / 100, ex = { paid: pd.toFixed(2) }; if(no) ex.src = no;
    if(cut > 0.004){ ex.short = { amt: cut, why: "", src: no, at: nowIso() }; ns++; }
    waSet(x.ro, x.op, "paid", ex); if(!(cut > 0.004)) delete x.op.claim.short; sum += pd; waClear(x.ro, "dollar", "Paid " + waUsd(pd) + (no ? " · " + no : "")); });
  UI.waStmt = null; waNcClear(); scheduleSave(true);
  pushToast(L.length + " claim" + (L.length === 1 ? "" : "s") + " marked paid · " + waUsd(sum) + (ns ? " — " + ns + " short, under Paid short." : "."), true); }

/* ---------- the click side ---------- */
function waAct(a, t, e){
  waNcClear(); var id = t.dataset.ro || null, P = UI.waPop, ro = id ? getRO(id) : null, opId = t.dataset.op || null, op = ro && opId ? waOpOf(ro, opId) : null;
  var popRo = function(){ var r = P && P.ro ? getRO(P.ro) : null, o = r ? (P.op ? waOpOf(r, P.op) : null) || wcOps(r)[0] || null : null; return { ro: r, op: o }; };
  switch(a){
    case "wa-sel": { if(!id) return true; UI.waSel = id; UI.waKB = false; UI.waPop = null; UI.waOp = opId; UI.waOpScroll = opId; if(t.dataset.v){ UI.waView = t.dataset.v; persistUI(); } render(); return true; }
    case "wa-do": UI.waKB = false; waDo(id); return true;
    case "wa-pop": { var p = t.dataset.p, ex = { op: opId }; if(p === "follow" && t.closest(".wa-line.vol")) ex.kind = "vol"; waPopToggle(p, id, ex); return true; }
    case "wa-pop-x": UI.waPop = null; render(); return true;
    case "wa-view": UI.waView = t.dataset.v; UI.waPop = null; persistUI(); render(); return true;
    case "wa-filt": { var k = t.dataset.k || null; UI.waFilter = !k || UI.waFilter === k ? null : k; UI.waPop = null; var L = waFlat(); if(L.length && L.indexOf(UI.waSel) < 0){ UI.waSel = L[0]; UI.waOp = null; } render(); return true; }
    case "wa-open": { var kk = t.dataset.k; UI.waOpen = UI.waOpen || {}; UI.waOpen[kk] = t.dataset.force && !UI.waOpen[kk] ? true : !UI.waOpen[kk]; render();
      if(kk === "clr" && UI.waOpen.clr){ var s = document.querySelector(".wa .tg-scroll"), c = document.querySelector('.wa .tg-sec[data-k="clr"]'); if(s && c) s.scrollTop = c.offsetTop - 60; } return true; }
    case "wa-wake": { if(ro && (ro.waSnz || ro.waAway)){ pushUndo("wake"); delete ro.waSnz; delete ro.waAway; UI.waSel = id; scheduleSave(true); render(); } return true; }
    case "wa-help": UI.modal = { type: "shortcuts" }; render(); return true;
    case "wa-srch": UI.waSrch = !UI.waSrch; UI.waQ = ""; UI.waSri = 0; UI.waPop = null; render(); return true;
    case "wa-sr-pick": UI.waSel = id; UI.waOp = null; UI.waSrch = false; UI.waQ = ""; if(UI.waView === "money" || UI.waView === "parts") UI.waView = "claims"; render(); return true;
    case "wa-set": { if(!P) return true; var f = t.dataset.f, v = t.dataset.v; if(t.dataset.n) v = +v;
      P[f] = v; if(t.dataset.reset) P[t.dataset.reset] = null; if(f === "why" && P.type === "paid") P.need = false;
      var F = null; if(f === "d" && v === "appeal") F = "p:ap"; else if(f === "d" && v === "wo") F = "p:wo"; else if(P.type === "follow" && f === "o" && v === 0) F = P.kind2 === "ts" ? "p:ans" : P.kind2 === "pre" ? "p:pa" : null; else if(P.type === "part" && f === "o" && v === 0) F = "p:trk"; else if(f === "edit") F = "p:so";
      if(F) UI.waFocus = '[data-wa-in="' + F + '"]'; render(); return true; }
    case "wa-go": waGo(); return true;
    case "wa-snz-pick": { var r0 = P && getRO(P.ro); if(r0) waSnooze(r0, waSnzOpts()[+t.dataset.i][1], ""); return true; }
    case "wa-st": { if(!op) return true; var to = t.dataset.to, before = waFlat(), cn = (op.claim && op.claim.claimNo) || roLabel(ro);
      if(to === "submitted"){ if(waGaps(ro, op).length) return true; pushUndo("resubmit"); waSet(ro, op, "submitted"); waDone(ro, "send", "Resubmitted " + cn, cn + " resubmitted — it’s back with Volvo.", before); return true; }
      if(to === "approved"){ pushUndo("approved"); waSet(ro, op, "approved"); waDone(ro, "check", "Approved · " + cn, cn + " approved — it comes back here if it isn’t paid in " + waCfg().paid + " days.", before); return true; }
      if(to === "returned" || to === "denied"){ pushUndo(to); waSet(ro, op, to); UI.waOp = op.id; UI.waFocus = '.wa-op[data-op="' + op.id + '"] [data-wa-f="returnReason"]'; waAfterAct(ro.id, before); UI.waSel = ro.id; scheduleSave(true);
        pushToast(cn + (to === "returned" ? " returned — write why it came back. Resubmit by " + waByTxt(waResLeft(op)) + "." : " denied — write why, then decide."), true); return true; }
      if(to === "reopen"){ pushUndo("reopen claim"); waSet(ro, op, "reopen"); var cc = wcClaim(op); delete cc.dec; delete cc.woAsk; if(cc.short) delete cc.short.dec; waNcClear(); scheduleSave(true); pushToast(cn + " reopened — it’s " + (WC_ST[waSt(ro, op)] || WC_ST.repair).l.toLowerCase() + " again.", true); return true; }
      return true; }
    case "wa-causal": { if(!op) return true; var pid = t.dataset.p, cur = waCausal(op); if(waCausalSet(op) && cur && cur.id === pid) return true; pushUndo("causal part"); wcClaim(op).causal = pid; scheduleSave(true); render(); return true; }
    case "wa-fix": { if(!ro || !op) return true; var fx = String(t.dataset.fix || ""), k2 = fx.split(":")[0], v2 = fx.split(":")[1] || "", ret = P && P.type === "file" ? waClone(P) : null;
      if(k2 === "upload"){ waUpload(ro, v2); return true; }
      if(k2 === "ask"){ waOpenPop("ask", ro.id, { op: op.id }); return true; }
      if(k2 === "field"){ waOpenPop("field", ro.id, { op: op.id, k: v2, ret: ret }); return true; }
      waOpenPop(k2, ro.id, { op: op.id, ret: ret }); return true; }
    case "wa-nudge": waNudge(ro, op); return true;
    case "wa-copy": { if(!ro) return true; var o1 = op || waOpFor(ro); if(!o1) return true; var R = waCopyRows(ro, o1), k0 = 0; while(k0 < R.length && !R[k0][1]) k0++;
      waOpenPop("copy", ro.id, { op: o1.id, ret: P && P.type === "file" ? waClone(P) : null, k: k0 < R.length ? k0 : 0 }); return true; }
    case "wa-cpy": if(P && P.type === "copy") waCopyRow(P, +t.dataset.k); return true;
    case "wa-cpall": { if(!P || P.type !== "copy") return true; var X = popRo(); if(!X.op) return true; var txt = waCopyRows(X.ro, X.op).filter(function(x){ return x[1]; }).map(function(x){ return x[0] + ": " + x[1]; }).join("\n");
      waClip(txt, function(ok){ if(!ok){ pushToast("Couldn’t reach the clipboard."); return; } if(UI.waPop === P){ P.copied = "all"; render(); } }); return true; }
    case "wa-copy1": { var cv = t.dataset.v || ""; waClip(cv, function(ok){ pushToast(ok ? "Copied " + cv + "." : "Couldn’t reach the clipboard."); }); return true; }
    case "wa-back": if(P && P.ret){ UI.waPop = P.ret; UI.waPopTop = null; render(); } return true;
    case "wa-print": if(ro && wcOps(ro).length){ UI.waPrint = { ro: ro.id, op: opId }; render(); } return true;
    case "wa-pvx": UI.waPrint = null; render(); return true;
    case "wa-pvprint": waPrintNow(); return true;
    case "wa-open-ro": if(id) openRoAt(id, opId); return true;
    case "wa-askw": { if(!P || P.type !== "ask") return true; var w = P.w || (P.w = []), i = w.indexOf(t.dataset.k); if(i < 0) w.push(t.dataset.k); else w.splice(i, 1); render(); return true; }
    case "wa-covpick": { var Y = popRo(); if(!Y.op) return true; var kc = t.dataset.k; if(waCovKey(Y.ro, Y.op) === kc) return true; pushUndo("coverage"); wcClaim(Y.op).cov = kc; scheduleSave(true); render(); return true; }
    case "wa-gw": { var Z = popRo(); if(!Z.op) return true; var bf = waFlat(), cvg = waCov(Z.ro, Z.op), nn = raN(Z.ro, Z.op);
      if(t.dataset.to === "manager"){ pushUndo("goodwill request"); rtSend(Z.ro, "manager", null, "Goodwill request · op " + nn + " · " + (Z.op.complaint || "") + " · outside " + String(cvg.c[1]).toLowerCase() + " (" + cvg.txt + ")", null, { reason: "Goodwill request" }); waAway(Z.ro, "manager", "Goodwill request");
        waDone(Z.ro, "swap", "Goodwill · to the manager", tgNum(Z.ro) + " to " + (rtPerson("manager") || "the manager") + " · goodwill request. It comes back here.", bf); return true; }
      pushUndo("customer pays"); rtSend(Z.ro, "writer", null, "Outside Volvo coverage — a customer estimate for op " + nn + " · " + (Z.op.complaint || ""), null, { reason: "Customer pays instead" }); waAway(Z.ro, "writer", "Customer pays");
      waDone(Z.ro, "swap", "To Approval · customer pays", tgNum(Z.ro) + " to Approval — a new estimate for the customer.", bf); return true; }
    case "wa-terms": UI.waPop = { type: "terms", ro: P ? P.ro : null, ret: waClone(P) }; UI.waPopTop = null; render(); return true;
    case "wa-per": UI.waPer = t.dataset.k; persistUI(); render(); return true;
    case "wa-mtbl": UI.waMtbl = !UI.waMtbl; render(); return true;
    case "wa-csv": waCsv(); return true;
    case "wa-pfilt": UI.waPf = t.dataset.k; render(); return true;
    case "wa-pshelf": UI.waPs = UI.waPs === t.dataset.s ? null : t.dataset.s; render(); return true;
    case "wa-ppop": waOpenPop("part", id, { op: opId, pt: t.dataset.pt }); return true;
    case "wa-ptag": { var x1 = waShelf().filter(function(x){ return x.ro.id === id && x.p.id === t.dataset.pt; })[0]; if(x1) waPrintTags([x1]); return true; }
    case "wa-ptags": { var V = waShelfV(), open = V.filter(function(x){ return x.st === "hold" || x.st === "ret"; }); if(!V.length){ pushToast("No tags to print here."); return true; } waPrintTags(open.length ? open : V); return true; }
    case "wa-stmt": UI.waStmt = { on: {}, amt: {}, no: "", total: "", paste: "", miss: null, hit: null }; UI.waPop = null; UI.waSrch = false; render(); setTimeout(function(){ var p = document.getElementById("wa-stp"); if(p) p.focus(); }, 0); return true;
    case "wa-stx": UI.waStmt = null; render(); return true;
    case "wa-stck": { var T = UI.waStmt; if(!T) return true; var key = t.dataset.k; T.on[key] = !T.on[key];
      if(T.on[key] && (T.amt[key] == null || T.amt[key] === "")){ var xr = waStmtRows().filter(function(x){ return x.key === key; })[0]; if(xr) T.amt[key] = waAmt(xr.op).toFixed(2); } render(); return true; }
    case "wa-stmatch": waStmtMatch(); return true;
    case "wa-stgo": waStmtGo(); return true;
  }
  return false;
}

/* ---------- typing, keys ---------- */
document.addEventListener("input", function(e){
  var t = e.target; if(!t || !t.dataset) return; var P = UI.waPop;
  if(t.dataset.waIn){ var k = t.dataset.waIn, v = t.value;
    if(k === "q"){ UI.waQ = v; UI.waSri = 0; var pop = document.querySelector(".wa .tg-srpop"); if(pop) pop.innerHTML = waSearchHtml(); return; }
    if(k.indexOf("p:") === 0){ if(!P) return; var f = k.slice(2); P[f] = v;
      if(f === "pd"){ var r = getRO(P.ro), o = r && (waOpOf(r, P.op) || wcOps(r)[0]); if(o){ var cut = Math.round((waAmt(o) - waNum(v)) * 100) / 100, b = document.getElementById("wa-shb"), am = document.getElementById("wa-sha"); if(b) b.hidden = !(cut > 0.004 && String(v).trim() !== ""); if(am) am.textContent = waUsd(Math.max(0, cut)); } }
      if(f === "tag"){ var g = document.querySelector('.wa .tg-pop [data-action="wa-go"]'); if(g) g.disabled = !String(v).trim(); }
      return; }
    var T = UI.waStmt; if(!T) return;
    if(k.indexOf("st:") === 0){ T[k.slice(3)] = v; return; }
    if(k.indexOf("sa:") === 0){ T.amt[k.slice(3)] = v; return; }
    return; }
  if(t.dataset.waF){ var r1 = getRO(t.dataset.ro), o1 = r1 && waOpOf(r1, t.dataset.op); if(!o1) return; wcClaim(o1)[t.dataset.waF] = t.value; scheduleSave(); return; }
  if(t.dataset.waCfg){ var C = waCfg(), key = t.dataset.waCfg;
    if(key === "shelves"){ var L = t.value.split(",").map(function(s){ return s.trim(); }).filter(Boolean); if(L.length) C.shelves = L; } else if(key === "dealer") C.dealer = t.value; else { var n = waNum(t.value); if(n > 0) C[key] = n; }
    scheduleSave(); return; }
  if(t.dataset.waTm != null){ var row = waCfg().cov[+t.dataset.waTm]; if(!row) return; var fi = +t.dataset.f; row[fi] = fi === 1 ? t.value : waNum(t.value); scheduleSave(); return; }
}, true);
document.addEventListener("change", function(e){
  var t = e.target; if(!t || !t.dataset || UI.view !== "warranty") return;
  if(t.dataset.waCh || t.dataset.waF || t.dataset.waCfg || t.dataset.waTm != null) setTimeout(function(){ if(UI.view === "warranty"){ waNcClear(); render(); } }, 0);   /* a change can fire while a render is removing the field */
}, true);
document.addEventListener("pointerdown", function(e){
  if(UI.view !== "warranty") return; var path = e.composedPath ? e.composedPath() : [e.target];
  var within = function(sel){ return path.some(function(n){ return n && n.nodeType === 1 && n.matches && n.matches(sel); }); };
  if(within(".modal, .overlay, .toast-wrap")) return; var ch = false;
  if(UI.waPop && !UI.waStmt && !UI.waPrint && !within(".wa .tg-pop, [data-action='wa-pop'], [data-action='wa-do'], [data-action='wa-fix'], [data-action='wa-copy'], [data-action='wa-ppop'], [data-action='wa-print']")){ UI.waPop = null; ch = true; }
  if(UI.waSrch && !within(".wa .tg-srch, .wa .tg-srpop, [data-action='wa-srch']")){ UI.waSrch = false; UI.waQ = ""; ch = true; }
  if(ch) render();
}, true);
var WA_TAB = false;   /* the focus got where it is with Tab (not a click) */
document.addEventListener("pointerdown", function(){ WA_TAB = false; }, true);
function waMove(d){ var L = waFlat(); if(!L.length) return; UI.waKB = true; var i = L.indexOf(UI.waSel); UI.waSel = L[i < 0 ? (d > 0 ? 0 : L.length - 1) : Math.max(0, Math.min(L.length - 1, i + d))]; UI.waOp = null; UI.waPop = null; render(); }
document.addEventListener("keydown", function(e){
  if(UI.view !== "warranty" || UI.palette) return;
  var k = e.key, t = (e.composedPath && e.composedPath()[0]) || e.target, inF = t && (/^(input|textarea|select)$/i.test(t.tagName || "") || t.isContentEditable);
  var stop = function(){ e.preventDefault(); e.stopPropagation(); };
  if(UI.modal) return; if(e.ctrlKey || e.metaKey || e.altKey) return;
  if(k === "Tab"){ WA_TAB = true; return; }
  if(t && t.tagName === "BUTTON" && (k === "Enter" || k === " ") && WA_TAB) return;   /* a button reached with Tab works as itself */
  if(UI.waPrint){ if(k === "Escape"){ UI.waPrint = null; render(); return stop(); } return; }
  if(UI.waStmt){ if(k === "Escape"){ if(inF && t.blur){ t.blur(); return stop(); } UI.waStmt = null; render(); return stop(); } return; }
  if(UI.waSrch){ var rows = document.querySelectorAll(".wa .tg-srpop .tg-sr[data-ro]");
    if(k === "Escape"){ UI.waSrch = false; UI.waQ = ""; render(); return stop(); }
    if(k === "ArrowDown" || k === "ArrowUp"){ if(rows.length){ UI.waSri = ((UI.waSri || 0) + (k === "ArrowDown" ? 1 : -1) + rows.length) % rows.length; rows.forEach(function(r, i){ r.classList.toggle("k", i === UI.waSri); }); } return stop(); }
    if(k === "Enter"){ var el = rows[UI.waSri || 0] || rows[0]; if(el){ UI.waSel = el.dataset.ro; UI.waOp = null; UI.waSrch = false; UI.waQ = ""; if(UI.waView === "money" || UI.waView === "parts") UI.waView = "claims"; render(); } return stop(); }
    if(inF) return; }
  var P = UI.waPop;
  if(P){
    if(k === "Escape"){ UI.waPop = P.ret || null; UI.waPopTop = null; render(); return stop(); }
    if(P.type === "copy" && !inF){ var r0 = getRO(P.ro), o0 = r0 && waOpOf(r0, P.op), R = o0 ? waCopyRows(r0, o0) : [];
      if(k === "ArrowDown" || k === "ArrowUp" || k === "j" || k === "k"){ var d = k === "ArrowDown" || k === "j" ? 1 : -1, j = P.k || 0; do { j += d; } while(j >= 0 && j < R.length && !R[j][1]); if(j >= 0 && j < R.length){ P.k = j; render(); } return stop(); }
      if(k === "Enter"){ waCopyRow(P, P.k || 0); return stop(); }
      var nk = +k; if(nk >= 1 && nk <= 9){ if(R[nk - 1] && R[nk - 1][1]){ P.k = nk - 1; waCopyRow(P, nk - 1); } return stop(); } }
    if(P.type === "file" && !inF && (k === "c" || k === "p")){ var b1 = document.querySelector('.wa .tg-pop [data-action="' + (k === "c" ? "wa-copy" : "wa-print") + '"]'); if(b1) b1.click(); return stop(); }
    if(k === "Enter" && !(t && t.tagName === "TEXTAREA")){ var b = document.querySelector(".wa .tg-pop .btn-primary:not([disabled])"); if(b){ if(b.dataset.action === "wa-go") waGo(); else b.click(); } return stop(); }
    if(inF) return;
    var n = +k; if(n >= 1 && n <= 9){ var bt = document.querySelector('.wa .tg-pop [data-wa-key="' + n + '"]'); if(bt){ bt.click(); return stop(); } }
    return; }
  if(inF){ if(k === "Escape" && t.blur) t.blur(); return; }
  if(k === "Escape"){ if(UI.waFilter){ UI.waFilter = null; render(); return stop(); } return; }
  if(k === "j" || k === "ArrowDown"){ waMove(1); return stop(); }
  if(k === "k" || k === "ArrowUp"){ waMove(-1); return stop(); }
  if(k === "Enter"){ if(waItemOf(UI.waSel)){ UI.waKB = true; waDo(UI.waSel); return stop(); } return; }
  if(k === "s"){ UI.waKB = true; if(waItemOf(UI.waSel)) waOpenPop("snooze", UI.waSel); return stop(); }
  if(k === "t"){ if(UI.waSel && getRO(UI.waSel)){ UI.waKB = true; waOpenPop("xfer", UI.waSel); } return stop(); }
  if(k === "c"){ var r = waSel(), o = r && waOpFor(r); if(o && waSt(r, o) !== "repair"){ var R2 = waCopyRows(r, o), k0 = 0; while(k0 < R2.length && !R2[k0][1]) k0++; waOpenPop("copy", r.id, { op: o.id, k: k0 < R2.length ? k0 : 0 }); } return stop(); }
  if(k === "p"){ var r2 = waSel(); if(r2 && wcOps(r2).length){ UI.waPrint = { ro: r2.id, op: null }; render(); } return stop(); }
  if(k === "/"){ UI.waSrch = true; UI.waQ = ""; UI.waSri = 0; UI.waPop = null; render(); return stop(); }
  if(k === "1" || k === "2" || k === "3" || k === "4"){ UI.waView = ["claims", "board", "money", "parts"][+k - 1]; UI.waPop = null; persistUI(); render(); return stop(); }
}, true);
/* the chart's tooltip */
document.addEventListener("pointermove", function(e){
  if(UI.view !== "warranty" || UI.waView !== "money") return; var mv = document.querySelector(".wa .wa-mv"), tip = mv && mv.querySelector(".wa-tip"); if(!tip) return;
  var el = e.target && e.target.closest ? e.target.closest(".wa-mv [data-tip]") : null;
  mv.querySelectorAll(".wa-svg .hv").forEach(function(x){ x.classList.remove("hv"); });
  if(!el){ if(!tip.hidden) tip.hidden = true; return; }
  var tx = el.getAttribute("data-tip"); if(el.closest(".wa-svg")) mv.querySelectorAll(".wa-svg path[data-tip]").forEach(function(x){ if(x.getAttribute("data-tip") === tx) x.classList.add("hv"); });
  var r = mv.getBoundingClientRect(); tip.textContent = tx; tip.hidden = false;
  var x = e.clientX - r.left + mv.scrollLeft + 14, y = e.clientY - r.top + mv.scrollTop + 14; if(x + tip.offsetWidth > mv.clientWidth + mv.scrollLeft - 8) x = Math.max(8, e.clientX - r.left + mv.scrollLeft - tip.offsetWidth - 14);
  tip.style.left = x + "px"; tip.style.top = y + "px";
}, { passive: true });

/* after every render on this page: place the popover, keep the keyboard row and the op in view, focus */
var WA_LAST = null;
function waAfter(){
  if(UI.view !== "warranty") return;
  var body = document.querySelector(".wa .tg-body"), pop = document.querySelector(".wa .tg-body > .tg-pop"), P = UI.waPop;
  if(pop && body && P){ var br = body.getBoundingClientRect(), top = 12;
    if(["cfg", "rets", "terms"].indexOf(P.type) < 0){ var it = document.querySelector('.wa .tg-it[data-ro="' + P.ro + '"]'); if(it){ var ir = it.getBoundingClientRect(); top = ir.top - br.top - 6; } }
    top = Math.round(Math.max(12, Math.min(top, body.offsetHeight - pop.offsetHeight - 12))); if(pop.style.top !== top + "px") pop.style.top = top + "px"; UI.waPopTop = top; }
  var sc = document.querySelector(".wa .tg-scroll"), on = sc && sc.querySelector(".tg-it.on");
  if(on && UI.waKB){ var sr = sc.getBoundingClientRect(), orr = on.getBoundingClientRect(); if(orr.top < sr.top + 30) sc.scrollTop -= sr.top + 40 - orr.top; else if(orr.bottom > sr.bottom - 20) sc.scrollTop += orr.bottom - sr.bottom + 40; }
  var cl = document.querySelector(".wa .wa-cl");
  if(cl && WA_LAST !== UI.waSel) cl.scrollTop = 0; WA_LAST = UI.waSel;
  if(UI.waOpScroll){ var oc = document.querySelector('.wa .wa-op[data-op="' + UI.waOpScroll + '"]'); if(oc && cl) cl.scrollTop += oc.getBoundingClientRect().top - cl.getBoundingClientRect().top - 12; UI.waOpScroll = null; }
  if(UI.waSrch){ var q = document.getElementById("wa-q"); if(q && document.activeElement !== q){ q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
  if(UI.waFocus){ var fe = document.querySelector(".wa " + UI.waFocus); UI.waFocus = null; if(fe){ fe.focus(); try{ if(fe.tagName === "INPUT") fe.select(); }catch(x){} } }
  if(UI.waPrint) waLoadImgs(document.querySelector(".wa .wa-pv"));
}
