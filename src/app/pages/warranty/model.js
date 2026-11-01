/* Parsec · pages/warranty · model.js
   The Warranty page's model: settings (filing days…), dates, a claim's status / amounts / due days, Waiting on Volvo, failed parts, Needs action, money, the sample set.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   waIcons waCfg waD waMid waLeft waAgo waPlus waMdy waByTxt waWhen waAgoTxt waDue … (72 functions, 15 constants)
   state      ros waCfg waCleared
   uses       access/ data/ kit/ pages/ pages/fixes/ pages/foreman/ pages/triage/ ro/ state/
*/
/* ============================== WARRANTY — claims on the Triage / Foreman layout ==============================
   Needs action on the left (sent to you, returned, denied, ready to file, needs the tech, waiting on
   Volvo, failed parts, not paid yet, paid short). Four views: Claims (the selected RO, op by op, with
   its packet, SRT and coverage checks), Board (every claim by stage), Money (claimed, paid, waiting,
   recovered, aging) and Parts (the failed-parts shelf). File, copy for the claim, print the packet,
   decide on returns and denials, mark paid (short pays too), a payment statement, settings. Prefix wa-. */
var WA_IC = {"board": "<rect x=\"3.75\" y=\"4.5\" width=\"4.5\" height=\"15\" rx=\"1.25\"/><rect x=\"9.75\" y=\"4.5\" width=\"4.5\" height=\"10\" rx=\"1.25\"/><rect x=\"15.75\" y=\"4.5\" width=\"4.5\" height=\"12.5\" rx=\"1.25\"/>", "chart": "<path d=\"M4.5 19.5h15M7.5 16.5v-5M12 16.5v-9M16.5 16.5v-3\"/>", "chat": "<path d=\"M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25H11.5L7 20v-3.5h-.25A2.25 2.25 0 0 1 4.5 14.25z\"/>", "check": "<path d=\"M5 12.5l4.5 4.5L19 7.5\"/>", "chevR": "<path d=\"M9.5 6.5L15 12l-5.5 5.5\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>", "console": "<rect x=\"3.75\" y=\"3.75\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"13.25\" y=\"3.75\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"3.75\" y=\"13.25\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"13.25\" y=\"13.25\" width=\"7\" height=\"7\" rx=\"2\"/>", "copy": "<rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2.5\"/><path d=\"M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"/>", "dollar": "<path d=\"M12 3.75v16.5M16 7.5c-.6-1.5-2.1-2.25-4-2.25-2.35 0-4 1.2-4 3s1.6 2.5 4 3 4 1.25 4 3.1-1.8 3.15-4 3.15c-2 0-3.6-.85-4.25-2.5\"/>", "file": "<path d=\"M7 3.75h6.5L18 8.25V19a1.25 1.25 0 0 1-1.25 1.25h-9.5A1.25 1.25 0 0 1 6 19V5a1.25 1.25 0 0 1 1-1.25z\"/><path d=\"M13.25 3.75V8.5H18M9 12.5h6M9 16h6\"/>", "flag": "<path d=\"M6 20.5V4.5M6 5h10.5l-2 3.75 2 3.75H6\"/>", "gear": "<path d=\"M4 8h8.5M17 8h3M4 16h3M11.5 16H20\"/><circle cx=\"14.75\" cy=\"8\" r=\"2.25\"/><circle cx=\"9.25\" cy=\"16\" r=\"2.25\"/>", "history": "<path d=\"M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.75h3.75\"/><path d=\"M12 8.5V12l2.5 1.5\"/>", "inbox": "<path d=\"M3.75 13.5l2.6-7.1A1.5 1.5 0 0 1 7.76 5.4h8.48a1.5 1.5 0 0 1 1.41 1l2.6 7.1v4.75a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5z\"/><path d=\"M3.75 13.5h4.5l1.25 2h5l1.25-2h4.5\"/>", "info": "<circle cx=\"12\" cy=\"12\" r=\"8.25\"/><path d=\"M12 11v5M12 8v.01\"/>", "note": "<path d=\"M6 3.75h12A1.25 1.25 0 0 1 19.25 5v9.5l-4.75 5.75H6A1.25 1.25 0 0 1 4.75 19V5A1.25 1.25 0 0 1 6 3.75z\"/><path d=\"M14.5 20.25v-4.5a1.25 1.25 0 0 1 1.25-1.25h3.5M8 8.5h8M8 12h5\"/>", "parts": "<path d=\"M12 3.5l7.5 4v9l-7.5 4-7.5-4v-9z\"/><path d=\"M4.5 7.5l7.5 4 7.5-4M12 11.5v9\"/>", "phone": "<path d=\"M6.2 4.5h2.6l1.4 3.6-1.9 1.3a10.5 10.5 0 0 0 5.3 5.3l1.3-1.9 3.6 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A14 14 0 0 1 4.6 6.2a1.6 1.6 0 0 1 1.6-1.7z\"/>", "plus": "<path d=\"M12 5v14M5 12h14\"/>", "print": "<path d=\"M7 9V4.5h10V9\"/><rect x=\"3.75\" y=\"9\" width=\"16.5\" height=\"7.5\" rx=\"2\"/><path d=\"M7 14.5h10v5H7z\"/>", "receipt": "<path d=\"M6.25 3.75h11.5v16.5l-1.9-1.25-1.95 1.25-1.95-1.25-1.95 1.25-1.95-1.25-1.8 1.25z\"/><path d=\"M9.25 8.25h5.5M9.25 11.5h5.5M9.25 14.75h3.5\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M16 16l4.5 4.5\"/>", "send": "<path d=\"M4 12 20 4.5 15.5 20l-3.25-6.75z\"/><path d=\"M12.25 13.25 20 4.5\"/>", "swap": "<path d=\"M7 7.5h12.5L16 4M17 16.5H4.5L8 20\"/>", "undo": "<path d=\"M9 7.5 4.5 12 9 16.5\"/><path d=\"M4.5 12h10a5 5 0 0 1 0 10h-2\"/>", "warranty": "<path d=\"M12 3.5l7 2.75v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9v-5.5z\"/><path d=\"M8.9 12.1l2.2 2.2 4.1-4.4\"/>", "x": "<path d=\"M6 6l12 12M18 6L6 18\"/>"};
function waIcons(){ if(waIcons.done || typeof TG_IC === "undefined" || !TG_IC) return; for(var k in WA_IC) if(!TG_IC[k]) TG_IC[k] = WA_IC[k]; waIcons.done = true; }
var WA_GROUPS = [["sent", "Sent to you"], ["back", "Returned"], ["den", "Denied"], ["ready", "Ready to file"], ["tech", "Needs the tech"], ["volvo", "Waiting on Volvo"], ["part", "Failed parts"], ["paid", "Not paid yet"], ["short", "Paid short"]];
var WA_BADGE = ["sent", "back", "den", "ready", "tech"];
var WA_CLOSED = ["paid", "denied", "written", "billed"];
var WA_WAIT = ["submitted", "approved", "appealed", "returned"];
var WA_COV0 = [["base", "Base vehicle", 24, 250000], ["engine", "Engine", 60, 500000], ["emis", "Aftertreatment", 60, 300000], ["prev", "Previous repair", 12, 0], ["recall", "Recall / campaign", 0, 0]];
var WA_DAY = 86400000;
var WA_DN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var WA_MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var WA_KEYS = [["J  K   or  ↑ ↓", "Move through Needs action"], ["↵", "Do the item’s action — Accept, File, Decide, Ask, Follow up…"], ["S", "Snooze the item"],
  ["T", "Send to another desk, with a reason"], ["C", "Copy for the claim — field by field"], ["P", "Print the claim packet"], ["1  2  3  4", "Claims · Board · Money · Parts"], ["/", "Search — RO, claim #, VIN, customer, code"],
  ["1 – 5", "In a popover: pick the option"], ["Esc", "Close the popover, or clear the filter"], ["Ctrl+Z", "Undo"], ["?", "This list"]];
/* the new claim outcomes, on the shared status table the RO page reads too */
WC_ST.appealed = { l: "Appealed", i: 2, c: "subm" }; WC_ST.written = { l: "Written off", i: 4, c: "den" }; WC_ST.billed = { l: "Customer pays", i: 4, c: "repair" };
WC_MANUAL.push("appealed", "written", "billed"); WC_RANK.appealed = 3; WC_RANK.written = 6; WC_RANK.billed = 6;

/* ---------- settings ---------- */
function waCfg(){
  var c = STATE.waCfg; if(!c || typeof c !== "object") c = STATE.waCfg = {};
  var d = { file: 30, resub: 10, ask: 4, ts: 24, pre: 4, claim: 14, paid: 10, keep: 30, pa: 1500, wo: 500 };
  for(var k in d) if(!(+c[k] > 0)) c[k] = d[k];
  if(!Array.isArray(c.cov) || !c.cov.length) c.cov = JSON.parse(JSON.stringify(WA_COV0));
  if(!Array.isArray(c.shelves) || !c.shelves.length) c.shelves = ["W1", "W2", "W3", "W4", "W5", "W6"];
  if(typeof c.dealer !== "string") c.dealer = "Vanguard Truck Center · Greensboro";
  return c;
}

/* ---------- dates ---------- */
function waD(x){ if(x == null || x === "") return null; if(x instanceof Date) return x; if(typeof x === "number") return new Date(x);
  var s = String(x).trim(), m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(s); if(m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/.exec(s); if(m) return new Date(+m[3], +m[1] - 1, +m[2]);
  var d = new Date(s); return isNaN(d.getTime()) ? null : d; }
function waMid(d){ var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function waLeft(x){ var d = waD(x); if(!d) return null; return Math.round((waMid(d) - waMid(new Date())) / WA_DAY); }
function waAgo(x){ var d = waD(x); return d ? (Date.now() - d.getTime()) / WA_DAY : null; }
function waPlus(x, n){ var d = new Date(waD(x) || new Date()); d.setDate(d.getDate() + n); return d; }
function waMdy(x){ var d = waD(x); return d ? (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() : ""; }
function waByTxt(n){ if(n == null) return "—"; if(n < 0) return n === -1 ? "yesterday" : Math.abs(n) + " d ago"; if(n === 0) return "today"; if(n === 1) return "tomorrow";
  var d = new Date(); d.setDate(d.getDate() + n); return (n < 7 ? WA_DN[d.getDay()] + " " : "") + (d.getMonth() + 1) + "/" + d.getDate(); }
function waWhen(x){ var d = waD(x); if(!d) return "—"; var a = (Date.now() - d.getTime()) / 3600000; if(a < 1) return "just now"; if(a < 12 && localDay(d.toISOString()) === todayStr()) return Math.round(a) + " h ago";
  var days = Math.round((waMid(new Date()) - waMid(d)) / WA_DAY); if(days === 0) return "today"; if(days === 1) return "yesterday"; if(days < 7) return WA_DN[d.getDay()]; return (d.getMonth() + 1) + "/" + d.getDate(); }
function waAgoTxt(x){ var a = waAgo(x); if(a == null) return "—"; return a < 1 ? Math.max(1, Math.round(a * 24)) + " h" : Math.floor(a) + " d"; }
function waDue(n){ return n == null ? "" : '<span class="wa-due' + (n <= 3 ? ' late' : n <= 7 ? ' soon' : '') + '">' + (n < 0 ? 'overdue' : n === 0 ? 'due today' : n + ' d left') + '</span>'; }
function waNum(s){ var n = parseFloat(String(s == null ? "" : s).replace(/[$,\s]/g, "")); return isFinite(n) ? n : 0; }
function waUsd(n){ return money(n); }
function waUsd0(n){ n = Math.round(+n || 0); return (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US"); }
function waCap(s){ s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }
function waTf(ro){ return tgFirst(ro && ro.assignedTech) || "the tech"; }

/* ---------- a claim ---------- */
function waSt(ro, op){ return wcStatus(ro, op); }
function waAmt(op){ var c = op.claim || {}; return waNum(c.amount) || opMoney(op).total; }
function waPaid(op){ return waNum((op.claim || {}).paid); }
function waFiledAt(op){ var c = op.claim || {}, t = null; (c.history || []).forEach(function(h){ if(h.to === "submitted" && (!t || h.at < t)) t = h.at; }); return t || c.submittedAt || null; }
function waAt(op, st){ var c = op.claim || {}, t = null; (c.history || []).forEach(function(h){ if(h.to === st && (!t || h.at > t)) t = h.at; }); return t || c[st + "At"] || null; }
function waDoneAt(ro, op){ return opDoneNow(op) ? (fixDateOf(ro, op) || ro.dateClosed || null) : null; }
function waFail(op){ var c = op.claim || {}; return String(c.failCode || "").trim() || wcFail(op); }
function waCausal(op){ return wcCausal(op); }
function waCausalSet(op){ var ps = opRealParts(op), c = op.claim || {}; return ps.length <= 1 || ps.some(function(p){ return p.id === c.causal; }); }
function waClaimH(op){ var c = op.claim || {}, b = +op.burnt || 0; if(String(c.laborHrs || "").trim()) return waNum(c.laborHrs); var s = waNum(c.srtHrs); return s ? Math.max(s, b) : b; }
function waOverSrt(op){ var s = waNum((op.claim || {}).srtHrs); return s ? Math.round((waClaimH(op) - s) * 10) / 10 : 0; }
function waSrtOk(op){ var c = op.claim || {}; return !waNum(c.srtHrs) || waOverSrt(op) <= 0.05 || !!c.srtWhy; }
function waStoryGaps(op){ return [!opStory(op, "cause") && "cause", !opStory(op, "fix") && "correction", !((+op.burnt || 0) > 0) && "labor"].filter(Boolean); }
function waFileLeft(ro, op){ var d = waDoneAt(ro, op); return d ? waLeft(waPlus(d, waCfg().file)) : null; }
function waResLeft(op){ var d = waAt(op, "returned"); return d ? waLeft(waPlus(d, waCfg().resub)) : null; }
function waBul(ro, task){ return (ro.bulletins || []).some(function(e){ return e.task === task && (e.done || (e.files || []).length); }); }

/* a comeback: the same unit back on the same complaint (flagged by the Foreman, or found here) */
var WA_BK = {};
function waBack(ro){
  if(WA_BK.hasOwnProperty(ro.id)) return WA_BK[ro.id];
  var out = null;
  try{
    var prev = ro.fmCb && ro.fmCb.of ? getRO(ro.fmCb.of) : null, days = null;
    if(prev){ var t0 = new Date(prev.dateClosed || (prev.status && prev.status.setAt) || 0).getTime(), t1 = new Date(ro.dateOpened || 0).getTime(); days = t0 && t1 ? Math.max(0, Math.round((t1 - t0) / WA_DAY)) : null; }
    else if(ro.dateOpened){
      var key = fmUnitKey(ro), A = fmWords(ro), na = Object.keys(A).length, opened = new Date(ro.dateOpened).getTime(), best = null;
      if(key && na) STATE.ros.forEach(function(r){ if(r === ro || r.id === SHOP_RO_ID || r.shop || fmUnitKey(r) !== key || onYard(r)) return;
        var at = new Date(r.dateClosed || (r.status && r.status.setAt) || 0).getTime(); if(!at || opened - at < 0 || opened - at > 90 * WA_DAY) return;
        var B = fmWords(r), nb = Object.keys(B).length, both = 0; Object.keys(A).forEach(function(w){ if(B[w]) both++; });
        var sim = nb ? both / (na + nb - both) : 0; if(sim >= 0.25 && (!best || at > best.at)) best = { r: r, at: at }; });
      if(best){ prev = best.r; days = Math.max(0, Math.round((opened - best.at) / WA_DAY)); }
    }
    if(prev){ var wop = wcOps(prev).filter(function(op){ return op.claim && op.claim.claimNo; })[0] || null, fx = raLive(prev).filter(function(op){ return opStory(op, "fix"); })[0];
      out = { prev: prev, days: days, claim: wop ? wop.claim.claimNo : "", paid: wop ? waPaid(wop) : 0, tech: prev.assignedTech || "", fix: fx ? opStory(fx, "fix") : "" }; }
  }catch(e){ out = null; }
  WA_BK[ro.id] = out; return out;
}

/* coverage: months and miles from the warranty start date, against the terms in Settings */
function waCovKey(ro, op){ var c = op.claim || {}; if(c.cov) return c.cov; return opJobType(op) === "RECALL" ? "recall" : "base"; }
function waCov(ro, op, key){
  var C = waCfg().cov, k = key || waCovKey(ro, op), c = C.filter(function(x){ return x[0] === k; })[0] || C[0];
  if(c[0] === "recall") return { c: c, st: "in", txt: "no time or mile limit", pct: 0 };
  if(c[0] === "prev"){ var b = waBack(ro); if(!b || b.days == null) return { c: c, st: "unknown", txt: "no earlier repair found on this unit", pct: 0 };
    var p0 = c[2] ? (b.days / 30.4) / c[2] : 0; return { c: c, st: p0 >= 1 ? "out" : p0 >= 0.9 ? "near" : "in", txt: b.days + " days since " + roLabel(b.prev) + (c[2] ? " · limit " + c[2] + " mo" : ""), pct: p0 }; }
  var ws = waD(ro.warrantyStart); if(!ws) return { c: c, st: "unknown", txt: "add the warranty start date to check", pct: 0 };
  var now = new Date(), mo = Math.max(0, (now.getFullYear() - ws.getFullYear()) * 12 + (now.getMonth() - ws.getMonth()) - (now.getDate() < ws.getDate() ? 1 : 0)), mi = waNum(ro.mileage);
  var pm = +c[2] ? mo / c[2] : 0, pi = +c[3] ? mi / c[3] : 0, p = Math.max(pm, pi);
  return { c: c, st: p >= 1 ? "out" : p >= 0.9 ? "near" : "in", mo: mo, mi: mi, pct: p,
    txt: mo + (+c[2] ? " of " + c[2] : "") + " months" + (+c[3] ? " · " + Math.round(mi).toLocaleString("en-US") + " of " + (+c[3]).toLocaleString("en-US") + " mi" : "") };
}
function waYm(mo){ var y = Math.floor(mo / 12), m = mo % 12; return ((y ? y + " yr " : "") + (m || !y ? m + " mo" : "")).trim(); }

/* the packet: the claim checks and the RO's evidence in one list. Each item: t, ok, req, g (group), fix, sh (short name) */
function waChecks(ro, op){
  var c = op.claim || {}, ps = opRealParts(op), cp = waCausal(op), L = [], b = waBack(ro);
  var a = function(t, ok, req, g, fix, sh){ L.push({ t: t, ok: !!ok, req: !!req, g: g, fix: fix || "", sh: sh || t.toLowerCase() }); };
  a("Complaint", String(op.complaint || "").trim(), 1, "Story", "", "complaint");
  a("Cause", opStory(op, "cause"), 1, "Story", "ask:cause", "cause");
  a("Correction", opStory(op, "fix"), 1, "Story", "ask:correction", "correction");
  if(ps.length) a("Causal part picked", waCausalSet(op), 1, "Parts & labor", "causal", "causal part");
  a("Labor clocked", (+op.burnt || 0) > 0, 1, "Parts & labor", "ask:labor", "labor");
  a("Fault code", waFail(op), 0, "Parts & labor", "field:code", "fault code");
  a("VIN (17)", String(ro.vin || "").replace(/\s/g, "").length === 17, 1, "Unit", "field:vin", "VIN");
  a("Mileage", String(ro.mileage || "").trim(), 1, "Unit", "field:mi", "mileage");
  a("Engine hours", String(ro.engineHours || "").trim(), 0, "Unit", "field:eh", "engine hours");
  a("Warranty start date", waD(ro.warrantyStart), 1, "Unit", "field:ws", "warranty start");
  a("Dash picture", waBul(ro, "dashpic"), 1, "Evidence", "upload:dashpic", "dash picture");
  if(ps.length) a("Photo of the failed part", waBul(ro, "pics") || waBul(ro, "partstag"), 1, "Evidence", "upload:pics", "part photo");
  if(waFail(op)) a("DTC readout", waBul(ro, "dtc"), 1, "Evidence", "upload:dtc", "DTC readout");
  if(ps.length) a("Failed part tagged", cp && cp.fp && cp.fp.tag, 1, "Evidence", "tag", "part tag");
  if(b && b.claim) a("Earlier claim # noted", String(c.prev || "").trim(), 1, "Comeback", "field:prev", "earlier claim #");
  if(waAmt(op) > waCfg().pa) a("Pre-approval #", String(c.pa || "").trim(), 1, "Approvals", "field:pa", "pre-approval #");
  a("Tech support case #", String(ro.techSupportCase || "").trim(), 0, "Approvals", "field:ts", "tech support #");
  if(waNum(c.srtHrs)) a("Labor within the SRT", waSrtOk(op), 1, "Checks", "srt", "over SRT");
  var cv = waCov(ro, op); if(cv.st !== "unknown") a("Inside coverage", cv.st !== "out", 1, "Checks", "cov", "outside coverage");
  return L;
}
function waGaps(ro, op){ return waChecks(ro, op).filter(function(x){ return x.req && !x.ok; }); }

/* why claims came back — returns and denials, tallied by reason */
var WA_RCAT = [["photo", /photo|picture|\bpics?\b/i, "Causal part photo missing", "Photo of the failed part"], ["srt", /\bsrt\b|labor|hours over/i, "Labor over the SRT", "Labor within the SRT"],
  ["dtc", /\bdtc|tech tool|readout|fault code/i, "No DTC readout", "DTC readout"], ["causal", /causal|wrong part/i, "Wrong causal part", "Causal part picked"],
  ["coverage", /coverage|outside|expired|in service/i, "Outside coverage", "Inside coverage"], ["story", /story|\bcause\b|correction|complaint/i, "Story incomplete", "Cause"]];
var WA_KW = ["water pump", "nox", "dpf", "egr", "alternator", "turbo", "injector", "wheel seal", "def ", "radiator", "air dryer", "starter", "compressor", "clutch"];
var WA_RT = null;
function waRets(days){
  if(WA_RT && WA_RT.d === days) return WA_RT.L;
  var out = [];
  wcRos().forEach(function(ro){ wcOps(ro).forEach(function(op){ var c = op.claim; if(!c) return;
    (c.history || []).forEach(function(h){ if((h.to === "returned" || h.to === "denied") && (waAgo(h.at) || 0) <= days){ var why = h.why || c.returnReason || "";
      out.push({ ro: ro, op: op, at: h.at, to: h.to, why: why, cats: WA_RCAT.filter(function(k){ return k[1].test(why); }).map(function(k){ return k[0]; }) }); } }); }); });
  out.sort(function(a, b){ return new Date(b.at) - new Date(a.at); }); WA_RT = { d: days, L: out }; return out;
}
function waFiledIn(days){ var n = 0; wcRos().forEach(function(ro){ wcOps(ro).forEach(function(op){ var f = waFiledAt(op); if(f && waAgo(f) <= days) n++; }); }); return n; }
function waHeads(ro, op){
  var cp = waCausal(op), low = String(op.complaint || "").toLowerCase() + " ", kw = WA_KW.filter(function(w){ return low.indexOf(w) > -1; })[0];
  return waRets(90).filter(function(x){ if(x.ro === ro || !x.cats.length) return false; var xp = waCausal(x.op);
    return (cp && xp && cp.partNumber && xp.partNumber === cp.partNumber) || (kw && (String(x.op.complaint || "").toLowerCase() + " ").indexOf(kw) > -1); })[0] || null;
}

/* ---------- Waiting on Volvo: a tech support case, a pre-approval ---------- */
function waVol(ro){
  var C = waCfg(), v = ro.waVol, op = wcOps(ro)[0] || null;
  if(v){ var h = (ageSince(v.at) || 0) / 3600000, lim = v.kind === "ts" ? C.ts : C.pre;
    return { kind: v.kind, h: h, lim: lim, op: op, v: v, txt: v.kind === "ts" ? "Tech support case " + (v.no || ro.techSupportCase || "") + " · open " + tgDur(ageSince(v.at)) + " · no answer" : "Pre-approval · asked " + tgDur(ageSince(v.at)) + " ago · no answer" + (v.what ? " · " + v.what : "") }; }
  if(roStatus(ro).status === "Waiting – Tech Support" && op){ var at = ro.status && ro.status.setAt, h2 = (ageSince(at) || 0) / 3600000;
    return { kind: "ts", h: h2, lim: C.ts, op: op, v: { kind: "ts", at: at, no: ro.techSupportCase || "", what: roStatus(ro).sub || "" }, txt: "Tech support case" + (ro.techSupportCase ? " " + ro.techSupportCase : "") + " · open " + tgDur(ageSince(at)) + " · no answer" }; }
  return null;
}

/* ---------- failed parts ---------- */
function waFpSt(fp){ return fp.done ? (/^shipped/i.test(fp.done) ? "shipped" : "done") : fp.ret ? "ret" : "hold"; }
function waFpDue(fp){ return fp.done ? null : waLeft(fp.ret ? fp.ret.by : fp.keep); }
function waPartsDue(ro){ var best = null; wcOps(ro).forEach(function(op){ (op.parts || []).forEach(function(p){ if(!p.fp || !p.fp.tag || p.fp.done) return; var n = waFpDue(p.fp); if(n != null && n <= 7 && (!best || n < best.n)) best = { op: op, p: p, n: n }; }); }); return best; }
function waShelf(){ var L = [];
  STATE.ros.forEach(function(ro){ (ro.operations || []).forEach(function(op, i){ (op.parts || []).forEach(function(p){ if(!p.fp || !p.fp.tag) return; L.push({ ro: ro, op: op, i: i, p: p, fp: p.fp, st: waFpSt(p.fp), due: waFpDue(p.fp) }); }); }); });
  return L.sort(function(a, b){ return (a.due == null ? 9999 : a.due) - (b.due == null ? 9999 : b.due) || String(a.fp.tag).localeCompare(String(b.fp.tag)); }); }
function waNextTag(){ var mx = 0; waShelf().forEach(function(x){ var m = /(\d+)\s*$/.exec(x.fp.tag); if(m) mx = Math.max(mx, +m[1]); }); return "FP-" + String(mx ? mx + 1 : 1001).padStart(4, "0"); }

/* ---------- Needs action ---------- */
function waSent(ro){ return !!(ro.route && ro.route.to === "warranty" && ro.route.state === "pending"); }
function waRos(){ return STATE.ros.filter(function(ro){ return ro.id !== SHOP_RO_ID && !ro.shop && (wcOps(ro).length > 0 || (ro.route && ro.route.to === "warranty")); }); }
function waSnoozed(ro){ if(ro.waSnz && new Date(ro.waSnz.until) > new Date()) return true; var w = ro.waAway; return !!(w && ro.route && ro.route.to === w.to && ro.route.at === w.at); }
function waNeedsCalc(){
  var out = [], C = waCfg();
  waRos().forEach(function(ro){
    var add = function(x){ x.ro = ro; out.push(x); }, ops = wcOps(ro);
    if(waSent(ro)){ var r = ro.route, held = ageSince(r.at) || 0; add({ g: "sent", ic: "inbox", why: (r.note || r.reason || "Sent to Warranty") + " · from " + (r.by || "—") + ", " + tgDur(held) + " ago", btn: "Accept", act: "accept", late: held > rtGoalMs("warranty") }); return; }
    var bk = ops.filter(function(op){ return waSt(ro, op) === "returned"; })[0];
    if(bk){ var n = waResLeft(bk); add({ op: bk, g: "back", ic: "undo", due: n, why: "Resubmit by " + waByTxt(n) + " · " + (bk.claim.returnReason || "no reason written yet"), btn: "Decide", act: "decide", late: n != null && n <= 3 }); return; }
    var dn = ops.filter(function(op){ return waSt(ro, op) === "denied" && !op.claim.dec; })[0];
    if(dn){ add({ op: dn, g: "den", ic: "x", why: "Denied " + waWhen(waAt(dn, "denied")) + " · " + waUsd(waAmt(dn)) + (dn.claim.returnReason ? " · " + dn.claim.returnReason : ""), btn: "Decide", act: "decide", late: (waAgo(waAt(dn, "denied")) || 0) > 5 }); return; }
    var rd = ops.filter(function(op){ return waSt(ro, op) === "ready"; }).sort(function(a, b){ return new Date(waDoneAt(ro, a) || 0) - new Date(waDoneAt(ro, b) || 0); });
    if(rd.length){ var o = rd[0], sg = waStoryGaps(o), n2 = waFileLeft(ro, o), ask = o.claim && o.claim.ask;
      if(sg.length && ask){ var hh = (ageSince(ask.at) || 0) / 3600000; add({ op: o, g: "tech", ic: "chat", due: n2, why: (ask.n ? "Nudged " : "Asked ") + tgFirst(ask.who) + " " + (hh < 1 ? "just now" : Math.round(hh) + " h ago") + " for the " + (ask.what || []).join(" and ") + " · not written yet", btn: "Nudge", act: "nudge", late: hh >= C.ask }); return; }
      if(sg.length){ add({ op: o, g: "tech", ic: "chat", due: n2, why: waCap(sg.join(" and ")) + " not written · " + waCap(waTf(ro)) + " finished it " + waWhen(waDoneAt(ro, o)), btn: ro.assignedTech ? "Ask " + tgFirst(ro.assignedTech) : "Ask the tech", act: "ask", late: n2 != null && n2 <= 3 }); return; }
      var g = waGaps(ro, o); add({ op: o, g: "ready", ic: "file", due: n2, why: "File by " + waByTxt(n2) + " · finished " + waWhen(waDoneAt(ro, o)) + " · " + waUsd(waAmt(o)) + (g.length ? " · missing " + g.map(function(x){ return x.sh; }).join(", ") : " · packet complete"), btn: "File", act: "file", late: n2 != null && n2 <= 3 }); return; }
    var v = waVol(ro); if(v && v.h >= v.lim * 0.75){ add({ op: v.op, g: "volvo", ic: "phone", why: v.txt, btn: "Follow up", act: "follow", late: v.h >= v.lim }); return; }
    var sb = ops.filter(function(op){ var s = waSt(ro, op); return (s === "submitted" || s === "appealed") && (waAgo(waAt(op, s)) || 0) >= C.claim; })[0];
    if(sb){ var s2 = waSt(ro, sb); add({ op: sb, g: "volvo", ic: "phone", why: "Claim " + (sb.claim.claimNo || "—") + (s2 === "appealed" ? " appealed " : " filed ") + waAgoTxt(waAt(sb, s2)) + " ago · no answer", btn: "Follow up", act: "follow", late: true }); return; }
    var fp = waPartsDue(ro); if(fp){ var f = fp.p.fp; add({ op: fp.op, part: fp.p.id, g: "part", ic: "parts", due: fp.n, why: f.ret ? "Volvo wants the " + String(fp.p.description || "part").toLowerCase() + " back · ship by " + waByTxt(fp.n) + (f.ret.ra ? " · RA " + f.ret.ra : "") : (fp.p.description || "Part") + " · holding ends " + waByTxt(fp.n) + " · tag " + f.tag, btn: f.ret ? "Ship…" : "Done holding…", act: "part", late: fp.n <= 2 }); return; }
    var ap = ops.filter(function(op){ return waSt(ro, op) === "approved" && (waAgo(waAt(op, "approved")) || 0) >= C.paid; })[0];
    if(ap){ var a2 = waAgo(waAt(ap, "approved")); add({ op: ap, g: "paid", ic: "dollar", why: "Approved " + Math.floor(a2) + " d ago · " + waUsd(waAmt(ap)) + " not paid", btn: "Paid…", act: "paid", late: a2 >= C.paid + 5 }); return; }
    var sh = ops.filter(function(op){ return waSt(ro, op) === "paid" && op.claim.short && !op.claim.short.dec; })[0];
    if(sh){ add({ op: sh, g: "short", ic: "dollar", why: "Paid " + waUsd(waPaid(sh)) + " of " + waUsd(waAmt(sh)) + " · short " + waUsd(sh.claim.short.amt) + (sh.claim.short.why ? " — " + sh.claim.short.why : ""), btn: "Decide", act: "short", late: false }); }
  });
  return out;
}
var WA_NC = null;
function waNeedsAll(){ if(WA_NC && WA_NC.s === STATE && Date.now() - WA_NC.t < 1500) return WA_NC.L; var L = waNeedsCalc(); WA_NC = { t: Date.now(), L: L, s: STATE }; return L; }
function waNcClear(){ WA_NC = null; WA_BK = {}; WA_RT = null; }
function waMatch(x){ var f = UI.waFilter; if(!f) return true; if(f === "ready") return x.g === "ready"; if(f === "back") return x.g === "back" || x.g === "den"; if(f === "due") return x.due != null && x.due <= 7; if(f === "late") return !!x.late; return true; }
function waNeeds(){ return waNeedsAll().filter(function(x){ return !waSnoozed(x.ro) && waMatch(x); }); }
function waGrouped(){ var G = {}; WA_GROUPS.forEach(function(g){ G[g[0]] = []; }); waNeeds().forEach(function(x){ G[x.g].push(x); });
  WA_GROUPS.forEach(function(g){ G[g[0]].sort(function(a, b){ return (a.due != null && b.due != null ? a.due - b.due : 0) || (b.late ? 1 : 0) - (a.late ? 1 : 0); }); }); return G; }
function waFlat(){ var G = waGrouped(); return WA_GROUPS.reduce(function(a, g){ return a.concat(G[g[0]].map(function(x){ return x.ro.id; })); }, []); }
function waItemOf(id){ return waNeeds().filter(function(x){ return x.ro.id === id; })[0] || null; }
function waSel(){ var r = UI.waSel ? getRO(UI.waSel) : null; if(r) return r; var f = waFlat(); UI.waSel = f[0] || (waRos()[0] || {}).id || null; return UI.waSel ? getRO(UI.waSel) : null; }
function waBadgeN(){ var allowed = true; try{ allowed = navAllowed("warranty"); }catch(e){} if(!allowed) return 0;
  return waNeedsAll().filter(function(x){ return WA_BADGE.indexOf(x.g) > -1 && !waSnoozed(x.ro); }).length; }

/* cleared today */
function waClearedList(){ if(!Array.isArray(STATE.waCleared)) STATE.waCleared = []; var t = todayStr(); return STATE.waCleared.filter(function(c){ return localDay(c.at) === t; }); }
function waClear(ro, ic, what){ if(!Array.isArray(STATE.waCleared)) STATE.waCleared = []; STATE.waCleared.push({ at: nowIso(), ic: ic, what: what, roId: ro.id, num: tgNum(ro), cust: ro.customerName || "" });
  if(STATE.waCleared.length > 300) STATE.waCleared = STATE.waCleared.slice(-300); }

/* ---------- change a claim's stage (no undo, no toast — the caller does those) ---------- */
function waSet(ro, op, to, extra){
  var c = wcClaim(op), from = wcStatus(ro, op), now = nowIso();
  c.status = to === "reopen" ? "" : to;
  if(to === "submitted"){ if(!c.submittedAt) c.submittedAt = now; if(!String(c.amount || "").trim()) c.amount = +waAmt(op).toFixed(2); if(!String(c.laborHrs || "").trim()) c.laborHrs = waClaimH(op).toFixed(1);
    if(!String(c.failCode || "").trim()) c.failCode = waFail(op); var cp = waCausal(op); if(cp && !c.causal) c.causal = cp.id; delete c.ask; }
  if(["approved", "returned", "denied", "paid", "appealed", "written", "billed"].indexOf(to) > -1) c[to + "At"] = now;
  if(extra) for(var k in extra) c[k] = extra[k];
  var h = { at: now, to: to === "reopen" ? wcStatus(ro, op) : to, from: from, by: tgMe() }; if(extra && extra.returnReason) h.why = extra.returnReason; c.history.push(h);
  try{ audit("warranty", roLabel(ro) + " op " + raN(ro, op) + (c.claimNo ? " · " + c.claimNo : "") + ": " + (WC_ST[from] || WC_ST.repair).l + " → " + (WC_ST[h.to] || WC_ST.repair).l, ro); }catch(e){}
  return from;
}

/* ---------- copy for the claim: the claim screen's fields, each copies on its own ---------- */
function waCopyRows(ro, op){
  var cp = waCausal(op), oth = opRealParts(op).filter(function(p){ return p !== cp; }), c = op.claim || {}, b = waBack(ro), dn = waDoneAt(ro, op), dg = function(s){ return String(s || "").replace(/[^\d.]/g, ""); };
  return [["VIN", ro.vin], ["Mileage", dg(ro.mileage)], ["Engine hours", dg(ro.engineHours)], ["Repair date", dn ? waMdy(dn) : ""], ["Fault code", waFail(op)], ["Causal part #", cp ? cp.partNumber : ""],
    ["Complaint", op.complaint, 1], ["Cause", opStory(op, "cause"), 1], ["Correction", opStory(op, "fix"), 1], ["Labor hours", waClaimH(op) ? waClaimH(op).toFixed(1) : ""], ["SRT op #", c.srtOp],
    ["Other parts", oth.map(function(p){ return (p.partNumber || p.description || "") + " ×" + (p.qty || 1); }).join(", ")], ["Pre-approval #", c.pa], ["Tech support #", ro.techSupportCase || (ro.waVol && ro.waVol.no)],
    ["Earlier claim #", c.prev || (b && b.claim) || ""]].map(function(r){ return [r[0], String(r[1] == null ? "" : r[1]).trim(), r[2]]; });
}

/* ---------- money ---------- */
function waAllOps(){ var L = []; wcRos().forEach(function(ro){ wcOps(ro).forEach(function(op){ L.push({ ro: ro, op: op, i: (ro.operations || []).indexOf(op) }); }); }); return L; }
function waPeriod(k){ var n = new Date(), a, b = null, lbl;
  if(k === "last"){ a = new Date(n.getFullYear(), n.getMonth() - 1, 1); b = new Date(n.getFullYear(), n.getMonth(), 1); lbl = "in " + ["January","February","March","April","May","June","July","August","September","October","November","December"][a.getMonth()]; }
  else if(k === "90"){ a = new Date(Date.now() - 90 * WA_DAY); lbl = "in the last 90 days"; }
  else if(k === "year"){ a = new Date(n.getFullYear(), 0, 1); lbl = "this year"; }
  else { a = new Date(n.getFullYear(), n.getMonth(), 1); lbl = "this month"; }
  return { a: a, b: b, lbl: lbl }; }
function waIn(x, P){ var d = waD(x); return !!d && d >= P.a && (!P.b || d < P.b); }
function waStats(k){
  var P = waPeriod(k), s = { lbl: P.lbl, cl: 0, cn: 0, pd: 0, pn: 0, ab: 0, cc: 0, cp: 0, den: 0 };
  waAllOps().forEach(function(x){ var o = x.op, st = waSt(x.ro, o), c = o.claim || {};
    if(waIn(waFiledAt(o), P)){ s.cl += waAmt(o); s.cn++; }
    var pa = waAt(o, "paid"); if(st === "paid" && waIn(pa, P)){ s.pd += waPaid(o); s.pn++; if(c.short) s.ab += waNum(c.short.amt); }
    var wo = waAt(o, "written"); if(st === "written" && waIn(wo, P)) s.ab += waAmt(o);
    var ca = st === "paid" ? pa : st === "denied" ? waAt(o, "denied") : st === "written" ? wo : null;
    if(ca && waIn(ca, P)){ s.cc += waAmt(o); s.cp += st === "paid" ? waPaid(o) : 0; if(st === "denied") s.den++; } });
  s.rec = s.cc ? s.cp / s.cc : null; return s;
}
function waMonths(n){ var out = [], now = new Date();
  for(var i = n - 1; i >= 0; i--){ var a = new Date(now.getFullYear(), now.getMonth() - i, 1), b = new Date(now.getFullYear(), now.getMonth() - i + 1, 1), P = { a: a, b: b }, cl = 0, pd = 0;
    waAllOps().forEach(function(x){ if(waIn(waFiledAt(x.op), P)) cl += waAmt(x.op); if(waSt(x.ro, x.op) === "paid" && waIn(waAt(x.op, "paid"), P)) pd += waPaid(x.op); });
    out.push({ lbl: WA_MN[a.getMonth()], cur: i === 0, cl: cl, pd: pd }); }
  return out; }
function waWaiting(){ return waAllOps().filter(function(x){ return WA_WAIT.indexOf(waSt(x.ro, x.op)) > -1; }).map(function(x){ x.age = Math.floor(waAgo(waFiledAt(x.op)) || 0); return x; }).sort(function(a, b){ return b.age - a.age; }); }

/* ---------- the sample set: dates, evidence, tags and a short pay on the sample claims ---------- */
function waSample(ros){
  var now = Date.now(), iso = function(d){ return new Date(now - d * WA_DAY).toISOString(); }, day = function(d){ return todayStr(new Date(now + d * WA_DAY)); }, p2 = function(n){ return String(n).padStart(2, "0"); }, tag = 1001, sh = 0;
  ros.forEach(function(ro, ri){ var ops = wcOps(ro); if(!ops.length) return;
    if(!waD(ro.warrantyStart) || ri % 3 === 0){ var w = new Date(now - (9 + (ri * 7) % 14) * 30.4 * WA_DAY); ro.warrantyStart = w.getFullYear() + "-" + p2(w.getMonth() + 1) + "-" + p2(w.getDate()); }
    ro.mileage = String(70000 + (ri * 37000) % 150000);   /* inside the example coverage, so the sample claims can be filed */
    if(!Array.isArray(ro.bulletins)) ro.bulletins = [];
    var bul = function(task){ var e = ro.bulletins.filter(function(x){ return x.task === task; })[0]; if(!e){ e = { oid: uid("bl"), task: task, done: false, fields: {}, place: "", files: [], at: new Date(now).toISOString(), tickedAt: null }; ro.bulletins.push(e); } e.done = true; e.tickedAt = new Date(now).toISOString(); };
    ops.forEach(function(op){ var c = op.claim, s = wcStatus(ro, op), cp = waCausal(op);
      if(s !== "repair"){ bul("dashpic"); if(s !== "ready") { bul("pics"); bul("dtc"); } }
      if(!c || !c.status) return;
      var steps = { paid: [["submitted", 34], ["approved", 20], ["paid", 9]], approved: [["submitted", 30], ["approved", 16]], submitted: [["submitted", 17]], returned: [["submitted", 9], ["returned", 2]] }[c.status];
      if(steps){ c.history = steps.map(function(st, i){ return { at: iso(st[1]), to: st[0], from: i ? steps[i - 1][0] : "ready", by: "Carla Reyes" }; }); steps.forEach(function(st){ c[st[0] + "At"] = iso(st[1]); });
        if(c.status === "returned"){ c.history[1].why = c.returnReason; c.srtOp = "2611-03-02"; c.srtHrs = Math.max(0.5, Math.round(((+op.burnt || 1) - 0.3) * 10) / 10).toFixed(1); }
        if(c.status === "paid" && !sh){ sh = 1; var amt = waNum(c.amount), cut = Math.round(amt * 0.11 * 100) / 100; c.paid = +(amt - cut).toFixed(2); c.short = { amt: cut, why: "Labor cut to the SRT", src: "CM-88011", at: c.paidAt }; } }
      if(cp && ["paid", "approved", "submitted", "returned"].indexOf(c.status) > -1){ cp.fp = { tag: "FP-" + (tag++), shelf: ["W1", "W2", "W3", "W4"][tag % 4], keep: day(c.status === "paid" ? 4 : 18 + tag % 9) };
        if(c.status === "paid") cp.fp.ret = { ra: "88213", by: day(5) }; }
    });
  });
}
