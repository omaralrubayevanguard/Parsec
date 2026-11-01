/* ============================== v178: TRIAGE — the action inbox ==============================
   Needs action on the left, always. The header switch shows the selected RO three ways:
   Inbox (the customer conversation), Desk (one RO at a time) and Yard (where every truck is).
   Snooze from the outcome, keyboard triage, Cleared today, All caught up; who to call,
   text templates, approvals with a record; release with checks, transfers with a reason;
   drag a truck onto a spot, arrival countdown from the call log, spot clashes; facts that
   filter, a late badge on the nav, and search that answers "where's my truck?". */
var TG_IC = /*__TGIC__*/{};
var TG_SI = /*__TGSI__*/{};
var TG_STK = { "Hold Tech": "hold", "Working": "working", "Waiting – Parts": "parts", "Waiting – Foreman": "foreman", "Waiting – Tech Support": "support",
  "Waiting – Customer": "customer", "Complete – Road test": "roadtest", "Complete – Released": "released", "Declined": "declined" };
var TG_CAT = { arr: ["Arriving", "var(--tg-ink4)"], chk: ["Checked in", "var(--tg-st-support)"], apr: ["Awaiting approval", "var(--tg-st-customer)"],
  wrk: ["In repair", "var(--tg-st-working)"], rdy: ["Ready to release", "var(--tg-ink)"], rel: ["Released", "var(--tg-ink3)"] };
var TG_GROUPS = [["sent", "Sent to you"], ["cust", "Waiting on customers"], ["go", "Ready to go"], ["held", "Held too long"], ["in", "Coming in"]];
var TG_OUTS = ["Approved", "Declined", "Left voicemail", "No answer", "Update given", "Will call back"];
var TG_FOLLOW = { "Left voicemail": 2, "No answer": 1, "Update given": 4 };
var TG_KINDS = ["Call", "Text", "Email", "In person"];
var TG_KIND_IC = { "Call": "phone", "Text": "chat", "Email": "mail", "In person": "user", "Decisiv": "doc" };
var TG_HOW = ["Call", "Text", "Email", "In person", "Decisiv"];
var TG_DESKS = ["writer", "tech", "parts", "foreman", "warranty", "manager"];
var TG_WHY = { writer: ["Approval needed", "Estimate ready", "Customer question"], tech: ["Repair", "Parts arrived", "Approved — go ahead"],
  parts: ["Parts needed", "Wrong part", "Core return"], foreman: ["Tech + bay", "Second opinion", "Comeback"],
  warranty: ["Warranty claim", "Tech support case", "Policy question"], manager: ["Sign-off", "Customer complaint", "Pricing call"] };
var TG_RSN = ["Customer is at the counter", "Paperwork to follow", "Warranty claim pending", "Manager OK’d it"];
var TG_TPL0 = [
  { id: "est", n: "Estimate", b: "Hi {first}, it’s {me} at {shop}. Estimate for unit {unit} ({ro}): {ops}. Total {total}. Reply YES to approve, or call me at {phone}." },
  { id: "rem", n: "Approval reminder", b: "Hi {first}, checking in on the {total} estimate for unit {unit}. The truck is parked in {spot} until we hear back. Reply YES or call me at {phone}." },
  { id: "par", n: "Parts delayed", b: "Hi {first}, parts for unit {unit} are now due {due}. We’ll start the moment they land and keep you posted. {ro}." },
  { id: "rdy", n: "Ready for pickup", b: "Hi {first}, unit {unit} is ready. It’s parked in {spot} and the keys are at the service desk. {ro}." }];
var TG_TOK = ["first", "me", "shop", "unit", "ro", "ops", "total", "spot", "due", "ready", "phone"];
var TG_AFTER = null;
var TG_KEYS = [["J  K   or  \u2191 \u2193", "Move through Needs action"], ["\u21b5", "Do the item\u2019s action \u2014 Accept, Call back, Release, Assign\u2026"], ["S", "Snooze the item"],
  ["C", "Log a call, text or email"], ["T", "Transfer to another desk, with a reason"], ["M", "Move the truck (Yard view)"], ["1  2  3", "Inbox \u00b7 Desk \u00b7 Yard"],
  ["/", "Search \u2014 RO, unit, customer, VIN or spot"], ["1 \u2013 6", "In a popover: pick the outcome, the desk or the reason"], ["Esc", "Close the popover, or clear the filter"], ["Ctrl+Z", "Undo"], ["?", "This list"]];

/* ---------- small helpers ---------- */
function tgI(n, s){ var p = TG_IC[n]; return p ? '<svg class="tg-ic" viewBox="0 0 24 24" width="' + (s || 16) + '" height="' + (s || 16) + '" aria-hidden="true">' + p + '</svg>' : ''; }
function tgSi(ro){ return TG_SI[TG_STK[roStatus(ro).status] || "hold"] || ''; }
function tgSq(c){ return '<i class="tg-sq" style="background:' + (TG_CAT[c] || TG_CAT.wrk)[1] + '"></i>'; }
function tgMoney(n){ n = Math.round(+n || 0); return (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US"); }
function tgDur(ms){ if(ms == null) return "—"; var m = Math.round(ms / 60000); if(m < 60) return m + " min"; var h = ms / 3600000; if(h < 48) return (h < 10 ? (Math.round(h * 10) / 10) : Math.round(h)) + " h"; return Math.round(h / 24) + " d"; }
function tgShortDur(ms){ var m = Math.round(ms / 60000); return m < 60 ? m + "m" : tgDur(ms).replace(" ", ""); }
function tgWhen(ms){ var d = new Date(ms), n = new Date(); var t = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  if(d.toDateString() === n.toDateString()) return t; return d.toLocaleDateString(undefined, { weekday: "short" }) + " " + t; }
function tgNum(ro){ return String(ro.roNumber || "?").replace(/^RO[\s-]*/i, ""); }
function tgYard(){ return STATE.ros.filter(function(ro){ return ro.id !== SHOP_RO_ID && !ro.shop && onYard(ro); }); }
function tgSpotLbl(id){ if(!id) return "—"; var m;
  if(id === "UpTime") return "UP"; if((m = /^Bay (\d+)$/.exec(id))) return "B" + m[1]; if((m = /^Awning (\d+)$/.exec(id))) return "AW" + m[1];
  if((m = /^Lot ([A-Z])(\d+)$/.exec(id))) return m[1] + m[2]; if((m = /^Ready (\d+)$/.exec(id))) return "W" + m[1]; if((m = /^Triage (\d+)$/.exec(id))) return "T" + m[1]; return id; }
function tgZone(id){ if(!id) return "No spot"; var m;
  if(id === "UpTime") return "UpTime bay"; if((m = /^Bay (\d+)$/.exec(id))) return "Bay " + m[1]; if(/^Awning/.test(id)) return "Awning";
  if((m = /^Lot ([A-Z])/.exec(id))) return m[1] + " line"; if(/^Ready/.test(id)) return "Arrival line"; if((m = /^Triage (\d+)$/.exec(id))) return "Triage lane " + m[1]; return id; }
function tgSpotOf(ro){ return spotOf(ro.location); }
function tgSpotChip(ro){ var s = tgSpotOf(ro); return '<span class="tg-spot">' + tgI("pin", 11) + esc(s ? tgSpotLbl(s) : (ro.location || "—")) + '</span>'; }
function tgAgeMs(ro){ var c = tyCat(ro); return tyAgeMs(ro, c); }
function tgCatLbl(ro){ return TG_CAT[tyCat(ro)][0]; }
function tgStTxt(ro){ var s = roStatus(ro); return s.status + (s.sub ? " · " + s.sub : ""); }
function tgMe(){ var n = punchByName(); return n || "Admin"; }
function tgFirst(n){ return String(n || "").trim().split(/\s+/)[0] || ""; }
function tgIni(n){ return String(n || "?").trim().split(/\s+/).map(function(x){ return x[0] || ""; }).join("").slice(0, 2).toUpperCase(); }
function tgFlat(){ var G = tgGrouped(); return TG_GROUPS.reduce(function(a, g){ return a.concat(G[g[0]].map(function(x){ return x.ro.id; })); }, []); }
function tgRoById(id){ var r = getRO(id); return r && r.id !== SHOP_RO_ID && !r.shop ? r : null; }

/* ---------- who has it, and for how long ---------- */
function tgHold(ro){ var hd = rtHolder(ro), since = rtHeldSince(ro), held = since ? ageSince(since) || 0 : 0;
  return { to: hd.to, who: rtHolderName(hd, ro), held: held, goal: rtGoalMs(hd.to) }; }
function tgHeld(ro){ var h = tgHold(ro), over = h.held > h.goal;
  return '<span class="tg-held' + (over ? ' over' : '') + '" title="With ' + esc(h.who) + ' · goal ' + tgDur(h.goal) + '"><span class="tg-role">' + RT_AB[h.to] + '</span><span class="m"><i style="width:' + Math.min(100, h.held / h.goal * 100).toFixed(0) + '%"></i></span>' + tgShortDur(h.held) + ' / ' + tgShortDur(h.goal) + '</span>'; }
function tgDue(ro){ var r = ro.route; if(!r || !r.back || r.state === "pending") return null; var b = new Date(r.back).getTime(); return Date.now() > b ? b : null; }
function tgTicks(ro){ var M = null; try{ M = roStages(ro); }catch(e){} if(!M) return '';
  return '<span class="tg-ticks" title="' + M.done + ' of ' + M.total + ' stages">' + M.list.map(function(x){ return '<i class="' + (x.state === "d" ? "done" : x.state === "c" ? (tyCat(ro) === "apr" ? "wait" : "now") : "") + '"></i>'; }).join('') + '</span>'; }

/* ---------- arrival ETA, read from the contact log ---------- */
function tgEtaText(txt, at){
  if(!txt) return null; var s = String(txt).toLowerCase(), m, base = at || Date.now(), W = { a: 1, an: 1, one: 1, two: 2, three: 3 };
  if(/half an hour/.test(s)) return base + 30 * 60000;
  if((m = s.match(/(\d+)\s*(?:min|mins|minutes)\b/))) return base + (+m[1]) * 60000;
  if((m = s.match(/\b(an?|one|two|three|\d+(?:\.\d+)?)\s*(and a half\s*)?(?:hour|hours|hr|hrs)\b/))){ var h = W[m[1]] != null ? W[m[1]] : +m[1]; if(m[2]) h += .5; return base + h * 3600000; }
  if((m = s.match(/(?:at|by|around|about)\s*(\d{1,2}):(\d{2})\s*(am|pm)?/))){ var hh = +m[1]; if(m[3] === "pm" && hh < 12) hh += 12; if(!m[3] && hh < 6) hh += 12;
    var d = new Date(base); d.setHours(hh, +m[2], 0, 0); return d.getTime(); }
  return null;
}
function tgEta(ro){ var L = ro.contacts || [];
  for(var i = L.length - 1; i >= 0; i--){ var c = L[i]; if(c.eta) return { eta: new Date(c.eta).getTime(), src: c }; var e = tgEtaText(c.note, new Date(c.at).getTime()); if(e != null) return { eta: e, src: c }; }
  return { eta: ro.eta ? new Date(ro.eta).getTime() : null, src: null }; }

/* ---------- late ---------- */
function tgLate(ro){ var c = tyCat(ro); if(tyLate(ro, c)) return true; if(c === "arr"){ var e = tgEta(ro).eta; if(e && e < Date.now()) return true; } return !!tgDue(ro); }
function tgLateIds(){ return tgYard().filter(tgLate).map(function(r){ return r.id; }); }

/* ---------- people (kept on the customer) and templates ---------- */
function tgCustKey(ro){ return String(ro.customerName || "").trim().toLowerCase(); }
function tgPeople(ro){ var k = tgCustKey(ro); if(!k) return []; if(!STATE.customers || typeof STATE.customers !== "object") STATE.customers = {};
  var c = STATE.customers[k]; return c && Array.isArray(c.people) ? c.people : []; }
function tgAddPerson(ro, p){ var k = tgCustKey(ro); if(!k) return; if(!STATE.customers || typeof STATE.customers !== "object") STATE.customers = {};
  if(!STATE.customers[k]) STATE.customers[k] = { name: ro.customerName, people: [] }; STATE.customers[k].people.push(p); }
function tgDefTo(ro){ var L = tgPeople(ro), i = -1; L.forEach(function(p, n){ if(i < 0 && p.ok) i = n; }); return i < 0 ? 0 : i; }
function tgMissHint(ro){ var L = tgPeople(ro); if(L.length < 2) return ''; var ap = L[tgDefTo(ro)], m = {};
  (ro.contacts || []).forEach(function(c){ if(c.to && c.to !== ap.n && /No answer|Left voicemail/.test(c.out)) m[c.to] = (m[c.to] || 0) + 1; });
  var k = Object.keys(m).filter(function(n){ return m[n] >= 2; })[0];
  return k ? m[k] + ' calls to ' + tgFirst(k) + ' went unanswered — ' + tgFirst(ap.n) + ' approves estimates' : ''; }
function tgTpls(){ if(!Array.isArray(STATE.tgTemplates) || !STATE.tgTemplates.length) STATE.tgTemplates = JSON.parse(JSON.stringify(TG_TPL0)); return STATE.tgTemplates; }
function tgShop(){ if(!STATE.tgShop || typeof STATE.tgShop !== "object") STATE.tgShop = { name: "", phone: "" }; return STATE.tgShop; }
function tgOpenOps(ro){ return raLive(ro).filter(function(op){ return !op.appr && ["WARR", "RECALL"].indexOf(opJobType(op)) < 0; }); }
function tgSugTpl(ro){ var c = tyCat(ro); if(c === "rdy") return "rdy"; if(roStatus(ro).status === "Waiting – Parts") return "par";
  if(tgOpenOps(ro).length) return (ro.contacts || []).some(function(x){ return /estimate|\$/i.test(x.note || ""); }) ? "rem" : "est"; return "rdy"; }
function tgTplBody(id){ var t = tgTpls().filter(function(x){ return x.id === id; })[0]; return t ? t.b : ""; }
function tgTokMap(ro, p){
  var open = tgOpenOps(ro), sum = 0; open.forEach(function(op){ sum += opMoney(op).total; });
  var list = (open.length ? open : raLive(ro)).map(function(op){ return String(op.complaint || "operation").split(/ – | - /)[0].toLowerCase() + " " + tgMoney(opMoney(op).total); }).join(", ");
  var due = ""; raLive(ro).forEach(function(op){ opRealParts(op).forEach(function(pt){ if(!due && pt.eta && pt.status !== "Received" && pt.status !== "Installed") due = pt.eta; }); });
  var M = null; try{ M = roStages(ro); }catch(e){}
  var sh = tgShop();
  return { first: p ? tgFirst(p.n) : "there", me: tgFirst(tgMe()), shop: sh.name || "", unit: ro.unitNumber || "", ro: roLabel(ro), ops: list,
    total: tgMoney(sum || roMoney(ro).total), spot: tgSpotOf(ro) ? tgZone(tgSpotOf(ro)) + " " + tgSpotLbl(tgSpotOf(ro)) : (ro.location || ""),
    due: due || "later this week", ready: M && M.likely ? tgWhen(+new Date(M.likely)) : "", phone: sh.phone || "" };
}
function tgFill(t, ro, p){ var m = tgTokMap(ro, p); return String(t || "").replace(/\{(\w+)\}/g, function(x, k){ return m[k] ? m[k] : "[" + (k === "shop" ? "shop name" : k === "phone" ? "shop phone" : k) + "]"; }); }
function tgFillHtml(t, ro, p){ var m = tgTokMap(ro, p);
  return String(t || "").split(/(\{\w+\})/).map(function(s){ var k = (s.match(/^\{(\w+)\}$/) || [])[1]; if(!k) return esc(s);
    return m[k] ? '<mark>' + esc(m[k]) + '</mark>' : '<mark class="miss" title="Set it in Edit templates">[' + (k === "shop" ? "shop name" : k === "phone" ? "shop phone" : k) + ']</mark>'; }).join(""); }

/* ---------- spot clashes ---------- */
function tgClashes(){ var ym = yardMap(), by = {}, out = [];
  tgYard().forEach(function(ro){ var sp = spotOf(ro.location); if(!sp || !ym.valid[sp]) return; (by[sp] = by[sp] || []).push(ro); });
  Object.keys(by).forEach(function(sp){ if(by[sp].length > 1) out.push({ spot: sp, ros: by[sp] }); });
  return out; }

/* ---------- cleared today ---------- */
function tgClearedList(){ if(!Array.isArray(STATE.tgCleared)) STATE.tgCleared = []; var t = todayStr();
  return STATE.tgCleared.filter(function(c){ return localDay(c.at) === t; }); }
function tgClear(ro, ic, what){ if(!Array.isArray(STATE.tgCleared)) STATE.tgCleared = [];
  STATE.tgCleared.push({ at: nowIso(), ic: ic, what: what, roId: ro.id, num: tgNum(ro), cust: ro.customerName || "" });
  if(STATE.tgCleared.length > 300) STATE.tgCleared = STATE.tgCleared.slice(-300); }

/* ---------- what needs action ---------- */
function tgSnoozed(ro){ return !!(ro.tgSnz && new Date(ro.tgSnz.until).getTime() > Date.now()); }
function tgBack(ro){ return !!(ro.tgSnz && new Date(ro.tgSnz.until).getTime() <= Date.now()); }
function tgNeedsAll(){
  var L = [], now = Date.now();
  tgYard().forEach(function(ro){
    var c = tyCat(ro), lt = tyLate(ro, c), a = ageText(tyAgeMs(ro, c)), r = ro.route, st = roStatus(ro), hd = tgHold(ro), last = (ro.contacts || []).slice(-1)[0];
    var it = null;
    if(r && r.to === "writer" && (r.state === "pending" || r.state === "returned"))
      it = { g: "sent", pr: 0, ic: "swap", why: r.state === "pending" ? "From " + (r.by || "someone") + " " + rtAge(r.at) + (r.reason ? " · " + r.reason : "") + (r.note ? " · " + r.note : "") : "Returned by " + (r.by || "someone") + (r.note ? " — " + r.note : ""), btn: r.state === "pending" ? "Accept" : "Got it", act: "accept" };
    else if(c === "apr") it = { g: "cust", pr: lt ? 0 : 3, ic: "phone", why: (st.sub || "Estimate sent") + " " + a + " ago" + (last ? " · " + String(last.out || "").toLowerCase() : ""), btn: lt ? "Call back" : "Follow up", act: "log" };
    else if(c === "rdy") it = { g: "go", pr: lt ? 1 : 2, ic: "release", why: (st.status === "Declined" ? "Declined" : "Road test done") + " · " + tgSpotLbl(tgSpotOf(ro)) + (lt ? " · waiting " + a : ""), btn: "Release", act: "release" };
    else if(c === "chk" && !ro.assignedTech) it = { g: "go", pr: lt ? 1 : 4, ic: "userPlus", why: "Checked in " + a + " ago · no tech yet", btn: "Assign", act: "assign" };
    else if(c === "arr"){ var e = tgEta(ro).eta, d = e ? e - now : null;
      if(d != null && d > 90 * 60000) return;
      it = { g: "in", pr: d != null && d <= 15 * 60000 ? -1 : 5, ic: "inArrow", why: d == null ? "Waiting arrival · " + tgSpotLbl(tgSpotOf(ro)) + " · no ETA yet" : d > 15 * 60000 ? "Arriving ~" + tgWhen(e) + " · in " + tgDur(d) + " · " + tgSpotLbl(tgSpotOf(ro)) : d > 0 ? "Arriving now · ~" + tgWhen(e) + " · " + tgSpotLbl(tgSpotOf(ro)) : "Due " + tgWhen(e) + " · " + tgDur(-d) + " late · call the driver", btn: "Check in", act: "checkin" }; }
    else if(c === "wrk" && tgOpenOps(ro).length && raLive(ro).some(function(op){ return op.appr && op.appr.s !== "no"; })){
      var oo = tgOpenOps(ro), sm = 0; oo.forEach(function(op){ sm += opMoney(op).total; });
      it = { g: "cust", pr: 2, ic: "phone", why: "Op " + oo.map(function(op){ return raN(ro, op); }).join(", ") + " · " + tgMoney(sm) + " waiting on approval" + (last ? " · " + String(last.out || "").toLowerCase() : ""), btn: "Follow up", act: "log" }; }
    if(!it){ var due = tgDue(ro);
      var desk = hd.to !== "writer" && (hd.to !== "tech" || (r && r.state === "pending"));   /* a tech working the truck is not "held" */
      if((desk && hd.held >= 2 * hd.goal) || due) it = { g: "held", pr: 4, ic: "swap", why: due ? "Due back from " + tgFirst(hd.who) + " at " + tgWhen(due) + " · " + tgDur(now - due) + " late" : "With " + RT_LBL[hd.to].toLowerCase() + " " + tgDur(hd.held) + " · " + (hd.held / hd.goal).toFixed(1) + "× the " + tgDur(hd.goal) + " goal", btn: "Nudge", act: "nudge" }; }
    if(!it) return;
    it.ro = ro; it.late = tgLate(ro);
    if(ro.tgSnz && tgBack(ro)){ it.back = true; it.why = (ro.tgSnz.why ? ro.tgSnz.why + " · " : "") + "snoozed " + fmtTime(ro.tgSnz.at); }
    L.push(it);
  });
  tgClashes().forEach(function(cl){
    var pick = cl.ros.slice().reverse().filter(function(r){ return tyCat(r) !== "arr"; })[0] || cl.ros[cl.ros.length - 1], other = cl.ros.filter(function(r){ return r !== pick; })[0];
    L = L.filter(function(x){ return x.ro !== pick; });
    L.push({ ro: pick, g: "go", pr: -1, ic: "pin", why: "Shares " + tgSpotLbl(cl.spot) + " with " + tgNum(other) + " — which one is there?", btn: "Fix spot", act: "clash", spot: cl.spot, late: tgLate(pick) });
  });
  return L;
}
function tgMatch(ro){ var f = UI.tgFilter; if(!f) return true;
  if(f === "apr") return tyCat(ro) !== "arr" && tgOpenOps(ro).length > 0 && (tyCat(ro) === "apr" || raLive(ro).some(function(op){ return op.appr && op.appr.s !== "no"; }));
  if(f === "rdy") return tyCat(ro) === "rdy"; if(f === "late") return tgLate(ro); return true; }
function tgNeeds(){ return tgNeedsAll().filter(function(x){ return !tgSnoozed(x.ro) && tgMatch(x.ro); }); }
function tgGrouped(){ var G = {}; TG_GROUPS.forEach(function(g){ G[g[0]] = []; }); tgNeeds().forEach(function(x){ G[x.g].push(x); });
  TG_GROUPS.forEach(function(g){ G[g[0]].sort(function(a, b){ return (b.back ? 1 : 0) - (a.back ? 1 : 0) || a.pr - b.pr; }); }); return G; }
function tgItemOf(id){ return tgNeeds().filter(function(x){ return x.ro.id === id; })[0] || null; }
function tgSel(){ var ro = tgRoById(UI.tgSel); if(ro && onYard(ro)) return ro; var f = tgFlat(); UI.tgSel = f[0] || (tgYard()[0] || {}).id || null; return tgRoById(UI.tgSel); }

/* ============================== the page ============================== */
function tgView(){
  if(!UI.tgView) UI.tgView = "inbox";
  if(!UI.tgOpen) UI.tgOpen = {};
  var ro = tgSel();
  var body = ro ? (UI.tgView === "desk" ? tgVDesk(ro) : UI.tgView === "yard" ? tgVYard(ro) : tgVInbox(ro))
    : (UI.tgView === "yard" ? tgVYard(null) : '<div class="tg-blank">' + esHtml("check", "Nothing on the yard", "Repair orders that are open show up here — check in a truck with New RO.") + '</div>');
  return '<div class="tg" data-key="tg">' + tgHead() + '<div class="tg-body v-' + UI.tgView + '">' + tgList() + '<div class="tg-main" data-key="tg-main-' + UI.tgView + '">' + body + '</div>' + tgPopHtml() + '</div></div>';
}
function tgHead(){
  var Y = tgYard(), n = function(f){ var k = UI.tgFilter; UI.tgFilter = f; var c = Y.filter(tgMatch).length; UI.tgFilter = k; return c; };
  var f = function(k, txt, w){ var on = UI.tgFilter === k; return '<button class="tg-hf' + (w ? ' w' : '') + (on ? ' on' : '') + '" data-action="tg-filt" data-k="' + k + '" title="' + (on ? 'Clear the filter' : 'Show only these in Needs action') + '"><b>' + n(k) + '</b>' + txt + (on ? tgI("x", 12) : '') + '</button>'; };
  var views = [["inbox", "inbox", "Inbox"], ["desk", "grid", "Desk"], ["yard", "pin", "Yard"]];
  var search = UI.tgSrch ? '<span class="tg-srch open"><span class="tg-srch-i">' + tgI("search", 15) + '</span><input id="tg-q" data-no-draft data-tg-in="q" autocomplete="off" placeholder="RO, unit, customer, VIN or spot" value="' + esc(UI.tgQ || "") + '"><span class="tg-kbd">Esc</span></span>'
    : '<button class="btn ib tg-srch-b" data-action="tg-srch" title="Search — RO, unit, customer, VIN or spot  ( / )" aria-label="Search">' + tgI("search", 16) + '</button>';
  return '<header class="tg-head" data-key="tg-head"><h1 class="tg-h1">Triage</h1><span class="tg-facts"><button class="tg-hf" data-action="tg-filt" data-k="" title="Show everything"><b>' + Y.length + '</b>on the yard</button><i>·</i>'
    + f("apr", "awaiting approval") + '<i>·</i>' + f("rdy", "ready to release") + '<i>·</i>' + f("late", "late", true) + '</span>'
    + '<div class="tg-views" role="tablist">' + views.map(function(v, i){ return '<button role="tab" class="' + (UI.tgView === v[0] ? 'on' : '') + '" data-action="tg-view" data-v="' + v[0] + '" title="' + v[2] + ' view (' + (i + 1) + ')">' + tgI(v[1], 14) + v[2] + '</button>'; }).join('') + '</div>'
    + '<span class="tg-hsep"></span>' + search + '<button class="btn btn-primary tg-newro" data-action="ty-newro" title="New repair order — paste or scan a case, estimate or RO">' + tgI("plus", 15) + '<span>New RO</span></button>'
    + (UI.tgSrch ? '<div class="tg-srpop" data-tg-keep>' + tgSearchHtml() + '</div>' : '') + '</header>';
}

/* ---------- left: Needs action ---------- */
function tgList(){
  var G = tgGrouped(), L = tgFlat(), sel = UI.tgSel, kb = !!UI.tgKB, cl = tgClearedList(), sn = tgYard().filter(tgSnoozed).sort(function(a, b){ return new Date(a.tgSnz.until) - new Date(b.tgSnz.until); });
  var fl = UI.tgFilter, newL = UI.tgNewLate || [];
  var item = function(x){ var ro = x.ro, on = ro.id === sel;
    return '<div class="tg-it' + (on ? ' on' : '') + (on && kb ? ' kb' : '') + '" data-action="tg-sel" data-ro="' + ro.id + '" draggable="true" data-tg-drag="' + ro.id + '">' + (x.late && !x.back ? '<i class="tg-dot"></i>' : '')
      + '<span class="tg-gi">' + tgI(x.ic, 15) + '</span><span class="tg-t"><b class="tg-no">' + esc(tgNum(ro)) + '</b><b class="tg-cu">' + esc(ro.customerName || "") + '</b>'
      + (newL.indexOf(ro.id) > -1 ? '<span class="tg-new" title="Turned late while you were away">New</span>' : '') + (x.back ? '<span class="tg-back">' + tgI("clock", 11) + 'Back</span>' : '') + tgSpotChip(ro) + '</span>'
      + '<span class="tg-w' + (x.late && !x.back ? ' late' : '') + '">' + esc(x.why) + '</span>'
      + '<button class="btn btn-sm ib tg-snz" data-action="tg-pop" data-p="snooze" data-ro="' + ro.id + '" title="Snooze  (S)">' + tgI("clock", 15) + '</button>'
      + '<button class="btn btn-sm' + (x.btn === "Release" ? ' btn-primary' : '') + ' tg-go" data-action="tg-do" data-ro="' + ro.id + '">' + esc(x.btn) + (on && kb ? '<span class="tg-kbd">↵</span>' : '') + '</button></div>'; };
  var body;
  if(!L.length){
    if(fl) body = '<div class="tg-empty"><span class="tg-ring0">' + tgI("check", 22) + '</span><h3>Nothing ' + esc(fl === "apr" ? "awaiting approval" : fl === "rdy" ? "ready to release" : "late") + '</h3><p>No RO in Needs action matches right now.</p><button class="btn btn-sm" data-action="tg-filt" data-k="">Clear filter</button></div>';
    else { var up = sn.map(function(r){ return { t: new Date(r.tgSnz.until).getTime(), ro: r, h: '<time>' + tgWhen(+new Date(r.tgSnz.until)) + '</time><b class="tg-no">' + esc(tgNum(r)) + '</b><b class="tg-cu">' + esc(r.customerName || "") + '</b><small>' + tgI("clock", 12) + esc(r.tgSnz.why || "Snoozed") + '</small>' }; })
        .concat(tgYard().filter(function(r){ return tyCat(r) === "arr" && tgEta(r).eta; }).map(function(r){ var e = tgEta(r).eta; return { t: e, ro: r, h: '<time>~' + tgWhen(e) + '</time><b class="tg-no">' + esc(tgNum(r)) + '</b><b class="tg-cu">' + esc(r.customerName || "") + '</b><small>' + tgI("inArrow", 12) + 'Arriving · ' + esc(tgSpotLbl(tgSpotOf(r))) + '</small>' }; }))
        .sort(function(a, b){ return a.t - b.t; }).slice(0, 6);
      body = '<div class="tg-empty"><span class="tg-ring0 ok">' + tgI("check", 22) + '</span><h3>All caught up</h3><p>Nothing needs you right now.</p>'
        + (up.length ? '<div class="tg-up"><div class="h">Coming up</div>' + up.map(function(u){ return '<div class="tg-row" data-action="tg-sel" data-ro="' + u.ro.id + '">' + u.h + '</div>'; }).join('') + '</div>' : '') + '</div>'; }
  } else body = TG_GROUPS.filter(function(g){ return G[g[0]].length; }).map(function(g){ return '<div class="tg-grp">' + g[1] + '<span>' + G[g[0]].length + '</span></div>' + G[g[0]].map(item).join(''); }).join('');
  if(L.length && sn.length) body += '<div class="tg-sec' + (UI.tgOpen.snz ? ' open' : '') + '" data-action="tg-open" data-k="snz">' + tgI("chevR", 12) + '<span>Snoozed</span><span class="n">' + sn.length + '</span><span class="m">next back ' + tgWhen(+new Date(sn[0].tgSnz.until)) + '</span></div>'
    + (UI.tgOpen.snz ? '<div class="tg-rows">' + sn.map(function(r){ return '<div class="tg-row" data-action="tg-sel" data-ro="' + r.id + '"><time>' + tgWhen(+new Date(r.tgSnz.until)) + '</time><b class="tg-no">' + esc(tgNum(r)) + '</b><b class="tg-cu">' + esc(r.customerName || "") + '</b><small>' + esc(r.tgSnz.why || "Snoozed by hand") + '</small><button class="btn btn-sm tg-gh" data-action="tg-wake" data-ro="' + r.id + '">Wake</button></div>'; }).join('') + '</div>' : '');
  body += '<div class="tg-sec' + (UI.tgOpen.clr ? ' open' : '') + '" data-action="tg-open" data-k="clr">' + tgI("chevR", 12) + '<span>Cleared today</span><span class="n">' + cl.length + '</span></div>'
    + (UI.tgOpen.clr ? '<div class="tg-rows">' + (cl.length ? cl.slice().reverse().map(function(c){ var r = tgRoById(c.roId); return '<div class="tg-row done"' + (r && onYard(r) ? ' data-action="tg-sel" data-ro="' + r.id + '"' : '') + ' title="' + esc(c.what) + '"><time>' + fmtTime(c.at) + '</time><b class="tg-no">' + esc(c.num) + '</b><b class="tg-cu">' + esc(c.cust) + '</b><small>' + tgI(c.ic || "check", 12) + esc(c.what) + '</small></div>'; }).join('') : '<p class="tg-none">Nothing cleared yet today.</p>') + '</div>' : '');
  var x = tgItemOf(sel), r0 = tgRoById(sel);
  var out = L.length && r0 && L.indexOf(sel) < 0 ? '<div class="tg-out">' + (tgSnoozed(r0) ? '<b>' + esc(roLabel(r0)) + '</b> is snoozed until ' + tgWhen(+new Date(r0.tgSnz.until)) + '.' : 'Showing <b>' + esc(roLabel(r0)) + ' · ' + esc(r0.customerName || "") + '</b> — nothing waiting on it.') + '</div>' : '';
  var away = newL.length && !fl ? '<div class="tg-away"><span class="tg-late">' + newL.length + ' new</span><span>' + esc(newL.map(function(id){ var r = tgRoById(id); return r ? r.customerName || tgNum(r) : ""; }).filter(Boolean).join(", ")) + ' turned late while you were on ' + esc(UI.tgAwayName || "another page") + '</span><button class="tg-link" data-action="tg-filt" data-k="late">Show late</button></div>' : '';
  var keys = '<div class="tg-keys"><span><span class="tg-kbd">J</span><span class="tg-kbd">K</span>move</span>' + (x ? '<span><span class="tg-kbd">↵</span><b>' + esc(x.btn) + '</b></span>' : '') + '<span><span class="tg-kbd">S</span>snooze</span><span><span class="tg-kbd">C</span>log</span><span><span class="tg-kbd">T</span>transfer</span><span class="sp"></span><button class="tg-link q" data-action="tg-help" title="All keys"><span class="tg-kbd">?</span>keys</button></div>';
  return '<section class="tg-list" data-key="tg-list"><div class="tg-lh">Needs action<span class="n">' + L.length + '</span>' + (fl ? '<button class="tg-fchip' + (fl === "late" ? ' w' : '') + '" data-action="tg-filt" data-k="">' + ({ apr: "Approval", rdy: "Ready", late: "Late" }[fl]) + tgI("x", 11) + '</button>' : '')
    + '<button class="tg-done" data-action="tg-open" data-k="clr" data-force="1">' + tgI("check", 13) + cl.length + ' cleared today</button></div>' + away
    + '<div class="tg-scroll" data-scroll="tg-list">' + body + '</div>' + out + keys + '</section>';
}

/* ---------- the log form (popover and the Inbox composer share it) ---------- */
function tgLF(sc){ var k = sc === "p" ? "tgLFP" : "tgLFC"; if(sc === "c" && UI.tgLFCro !== UI.tgSel){ UI.tgLFC = null; UI.tgLFCro = UI.tgSel; } if(!UI[k]) UI[k] = { kind: "Call", out: null, when: null, note: "" }; return UI[k]; }
function tgPanelSum(S, ro){ var open = tgOpenOps(ro), n = 0, sum = 0; open.forEach(function(op, j){ if(!S.ops || S.ops[j]){ n++; sum += opMoney(op).total; } }); return { n: n, sum: sum, open: open }; }
function tgWhenOpts(){ var now = new Date(), r = function(ms){ return Math.round(ms / 300000) * 300000; }, at = function(h, m, add){ var d = new Date(); d.setDate(d.getDate() + (add || 0)); d.setHours(h, m, 0, 0); return d.getTime(); };
  var lunch = now.getHours() * 60 + now.getMinutes() < 750 ? at(13, 0) : r(Date.now() + 3 * 3600000), eod = Math.max(at(16, 30), r(Date.now() + 1800000));
  return [["In 1 hour", r(Date.now() + 3600000)], ["In 2 hours", r(Date.now() + 7200000)], ["After lunch", lunch], ["End of day", eod], ["Tomorrow morning", at(8, 0, 1)]]; }
function tgFollow(S, ro){
  if(!S.out) return ["", "Pick an outcome"];
  if(tyCat(ro) === "arr" && S.note){ var e = tgEtaText(S.note, Date.now()); if(e != null) return ["snz", "ETA becomes ~" + tgWhen(e)]; }
  if(S.out === "Approved" || S.out === "Declined"){ var s = tgPanelSum(S, ro); if(!s.open.length) return ["", "Logs it on the RO"];
    var left = s.open.length - s.n - (S.out === "Approved" && S.rest ? s.open.length - s.n : 0);
    if(S.out === "Approved") return s.n || S.rest ? ["ok", left ? left + " op" + (left > 1 ? "s" : "") + " stay open" : "All decided — clears the item"] : ["", "Tick what they approved"];
    return ["no", left ? left + " op" + (left > 1 ? "s" : "") + " stay open" : "All declined"]; }
  if(!tgItemOf(ro.id)) return ["", "Logs it on the RO"];
  if(S.out === "Will call back") return ["snz", "Back in the list at " + tgWhen(S.when || tgWhenOpts()[1][1])];
  var h = TG_FOLLOW[S.out]; return ["snz", "Back in the list at " + tgWhen(Date.now() + h * 3600000) + " · " + h + " h"];
}
function tgApPanel(S, ro, p){
  if(S.out !== "Approved" && S.out !== "Declined") return ""; var open = tgOpenOps(ro), ok = S.out === "Approved";
  if(!open.length) return '<div class="tg-ap"><div class="h">No open operations<small>nothing to ' + (ok ? 'approve' : 'decline') + '</small></div></div>';
  if(!S.ops || S.ops.length !== open.length) S.ops = open.map(function(){ return true; });
  var s = tgPanelSum(S, ro), tot = 0; open.forEach(function(op){ tot += opMoney(op).total; });
  return '<div class="tg-ap"><div class="h">' + tgI(ok ? "check" : "x", 13) + (ok ? 'Approve' : 'Decline') + '<small>' + tgMoney(s.sum) + ' of ' + tgMoney(tot) + ' open</small></div>'
    + open.map(function(op, j){ return '<label class="tg-op' + (S.ops[j] ? '' : ' off') + '"><input type="checkbox" data-tg-ck="op" data-j="' + j + '"' + (S.ops[j] ? ' checked' : '') + '><b class="tg-no">Op ' + raN(ro, op) + '</b><span class="t">' + esc(op.complaint || "Operation") + '</span><span class="mny">' + tgMoney(opMoney(op).total) + '</span></label>'; }).join('')
    + (ok && s.n < open.length ? '<label class="tg-rest"><input type="checkbox" data-tg-ck="rest"' + (S.rest ? ' checked' : '') + '>Decline the rest</label>' : '')
    + (ok ? '<div class="tg-f"><span>PO #</span><input data-no-draft data-tg-in="po" data-sc="' + S.sc + '" value="' + esc(S.po || "") + '" placeholder="optional"></div>' : '')
    + '<div class="tg-rec">' + tgI("check", 12) + '<span>Saved on each op as ' + (ok ? 'approved' : 'declined') + ' by <b>' + esc(p ? p.n : (S.toName || "the customer")) + '</b> · ' + esc(S.kind) + ' · ' + fmtTime(nowIso()) + '</span></div></div>';
}
function tgBtnLabel(S, ro){ var txt = (S.kind === "Text" || S.kind === "Email") && S.tpl;
  if(S.out === "Approved" || S.out === "Declined"){ var s = tgPanelSum(S, ro); if(s.open.length && s.n) return (S.out === "Approved" ? "Log & approve " : "Log & decline ") + tgMoney(s.sum); }
  return txt ? "Copy & log" : "Log it"; }
function tgLogForm(S, sc, ro){
  S.sc = sc; var L = tgPeople(ro); if(S.to == null || (L.length && !L[S.to])) S.to = tgDefTo(ro); var p = L[S.to] || null;
  var txt = S.kind === "Text" || S.kind === "Email"; if(txt && S.tpl === undefined) S.tpl = tgSugTpl(ro); if(txt && S.tpl && !S.out) S.out = "Update given";
  var f = tgFollow(S, ro), ic = f[0] === "snz" ? tgI("clock", 13) : f[0] === "ok" ? tgI("check", 13) : f[0] === "no" ? tgI("x", 13) : "";
  var lbl = function(t){ return '<span class="tg-lbl">' + t + '</span>'; };
  var chips = L.map(function(q, i){ return '<button class="tg-pchip' + (S.to === i ? ' on' : '') + '" data-action="tg-lf" data-sc="' + sc + '" data-f="to" data-v="' + i + '"><span class="tg-av">' + esc(tgIni(q.n)) + '</span><b>' + esc(q.n) + '</b><small>' + esc(q.r || "") + (q.ok ? ' · approves' : '') + '</small></button>'; }).join('')
    + '<button class="tg-chip add' + (L.length && sc === "c" ? ' ico' : '') + '" data-action="tg-np-open" data-ro="' + ro.id + '" title="Add who to call">' + tgI("plus", 12) + (L.length ? (sc === "c" ? '' : 'Add') : 'Add who to call') + '</button>';
  var addr = p ? (S.kind === "Email" ? p.em || "" : p.ph || "") : "";
  var det = p ? '<div class="tg-det">' + tgI(S.kind === "Email" ? "mail" : "phone", 13) + '<b class="tg-no">' + esc(addr || (S.kind === "Email" ? "No email on file" : "No number on file")) + '</b><span>prefers ' + esc(String(p.pref || "Call").toLowerCase()) + (p.best ? ' · ' + esc(p.best) : '') + '</span>' + (addr ? '<button class="tg-link" data-action="tg-copy" data-v="' + esc(addr) + '">Copy</button>' : '') + '</div>' : '';
  var hint = tgMissHint(ro), hintH = hint && S.kind === "Call" && S.to === tgDefTo(ro) ? '<div class="tg-hint">' + tgI("flag", 13) + esc(hint) + '</div>' : '';
  var kinds = TG_KINDS.map(function(k){ return '<button class="tg-chip' + (S.kind === k ? ' on' : '') + '" data-action="tg-lf" data-sc="' + sc + '" data-f="kind" data-v="' + k + '">' + tgI(TG_KIND_IC[k], 13) + k + '</button>'; }).join('');
  var tpl = '';
  if(txt){ var sug = tgSugTpl(ro), msg = S.tpl ? (S.edit && S.msg != null ? S.msg : tgFill(tgTplBody(S.tpl), ro, p)) : "";
    tpl = '<div class="tg-r tg-tpls">' + lbl("Template") + tgTpls().map(function(t){ return '<button class="tg-chip' + (S.tpl === t.id ? ' on' : '') + '" data-action="tg-lf" data-sc="' + sc + '" data-f="tpl" data-v="' + t.id + '"' + (t.id === sug ? ' title="Suggested for this RO"' : '') + '>' + esc(t.n) + (t.id === sug ? '<i class="sug"></i>' : '') + '</button>'; }).join('')
      + '<button class="tg-chip' + (S.tpl ? '' : ' on') + '" data-action="tg-lf" data-sc="' + sc + '" data-f="tpl" data-v="">None</button><button class="tg-link" data-action="tg-tpled">Edit…</button></div>'
      + (S.tpl ? '<div class="tg-msg">' + (S.edit ? '<textarea data-no-draft data-tg-in="msg" data-sc="' + sc + '" rows="4">' + esc(msg) + '</textarea>' : '<div class="pv" data-action="tg-lf" data-sc="' + sc + '" data-f="edit" title="Click to edit">' + tgFillHtml(tgTplBody(S.tpl), ro, p) + '</div>')
        + '<div class="ft"><span data-tg-count>' + msg.length + ' characters</span><span>' + (S.edit ? 'Edited for this message' : 'Filled from the RO · click to edit') + '</span></div></div>' : ''); }
  var outs = TG_OUTS.map(function(k, i){ return '<button class="tg-chip' + (S.out === k ? ' on' : '') + '" data-action="tg-lf" data-sc="' + sc + '" data-f="out" data-v="' + k + '">' + (sc === "p" ? '<span class="tg-kbd">' + (i + 1) + '</span>' : '') + k + '</button>'; }).join('');
  var when = S.out === "Will call back" && tgItemOf(ro.id) ? '<div class="tg-r tg-when">' + lbl(sc === "p" ? "When did they say?" : "When") + tgWhenOpts().map(function(o){ var w = S.when || tgWhenOpts()[1][1]; return '<button class="tg-chip' + (w === o[1] ? ' on' : '') + '" data-action="tg-lf" data-sc="' + sc + '" data-f="when" data-v="' + o[1] + '" title="' + o[0] + '">' + tgWhen(o[1]) + '</button>'; }).join('') + '</div>' : '';
  var noteOn = !(txt && S.tpl);
  var ta = noteOn ? '<textarea data-no-draft data-tg-in="note" data-sc="' + sc + '" rows="1" placeholder="Note — e.g. asked for a yes or no on the brakes">' + esc(S.note || "") + '</textarea>' : '<span class="sp"></span>';
  var go = '<button class="btn btn-sm btn-primary" data-action="tg-lf-go" data-sc="' + sc + '"' + (S.out ? '' : ' disabled') + '>' + (txt && S.tpl && !/approve|decline/.test(tgBtnLabel(S, ro)) ? tgI("copy", 13) : '') + esc(tgBtnLabel(S, ro)) + '<span class="tg-kbd">↵</span></button>';
  var fu = '<span class="tg-fu ' + f[0] + '">' + ic + '<span data-tg-fu>' + esc(f[1]) + '</span></span>';
  if(sc === "p") return '<div class="tg-lf" data-sc="p"><div class="tg-r">' + lbl("To") + chips + '</div>' + det + hintH + '<div class="tg-r">' + lbl("Log") + kinds + '</div>' + tpl + '<div class="tg-r">' + lbl("Outcome") + outs + '</div>' + tgApPanel(S, ro, p) + when + (noteOn ? ta : '') + '<div class="tg-r tg-ff">' + fu + go + '</div><div class="tg-hk"><span><span class="tg-kbd">1</span>–<span class="tg-kbd">6</span> outcome</span><span><span class="tg-kbd">N</span> note</span><span><span class="tg-kbd">Esc</span> close</span></div></div>';
  return '<div class="tg-lf" data-sc="c"><div class="tg-r">' + lbl("To") + chips + '<span class="tg-kinds"><span class="tg-lbl">Log</span>' + kinds + '</span></div>' + tpl + '<div class="tg-r">' + lbl("Outcome") + outs + '</div>' + tgApPanel(S, ro, p) + when + '<div class="tg-r tg-nf">' + ta + fu + go + '</div></div>';
}

/* ---------- approvals, with a record of who / how / when ---------- */
function tgRecLine(ro, op){
  var a = op.appr, w = ["WARR", "RECALL"].indexOf(opJobType(op)) > -1;
  if(w) return '<div class="tg-rl">' + tgI("shield", 12) + 'Warranty — no customer approval needed</div>';
  if(op.declined && !a) return '<div class="tg-rl warn">' + tgI("flag", 12) + 'Declined — no record of who declined it <button data-action="tg-aprrec" data-ro="' + ro.id + '" data-op="' + op.id + '">Add</button></div>';
  if(!a){ var c = (ro.contacts || []).slice().reverse().filter(function(x){ return /estimate|\$/i.test(x.note || ""); })[0];
    return '<div class="tg-rl">Open' + (c ? ' · estimate ' + ({ Call: "called", Text: "texted", Email: "emailed", "In person": "given in person" }[c.kind] || "sent") + ' ' + fmtTime(c.at) : '') + '</div>'; }
  if(!a.who) return '<div class="tg-rl warn">' + tgI("flag", 12) + 'No record of who ' + (a.s === "no" ? 'declined' : 'approved') + ' this — <button data-action="tg-aprrec" data-ro="' + ro.id + '" data-op="' + op.id + '">Add</button></div>';
  return '<div class="tg-rl ' + (a.s === "no" ? 'no' : 'ok') + '">' + tgI(a.s === "no" ? "x" : "check", 12) + '<b>' + esc(a.who) + '</b>' + (a.role ? ' · ' + esc(a.role) : '') + ' · ' + esc(a.how || "—") + ' · ' + fmtDate(a.at) + ' ' + fmtTime(a.at)
    + (a.po ? ' · PO <b class="tg-no">' + esc(a.po) + '</b>' : '') + (a.amt ? ' · ' + tgMoney(a.amt) + ' of ' + tgMoney(opMoney(op).total) : '') + (a.reason ? ' · “' + esc(a.reason) + '”' : '') + '<span class="by">logged by ' + esc(tgFirst(a.by || "")) + '</span></div>';
}
function tgApForm(ro, op){
  var A = UI.tgAP, L = tgPeople(ro), d = A.dec, verb = A.rec ? "Record approval" : d === "ok" ? "Approve" : d === "part" ? "Partly approve" : "Decline";
  return '<div class="tg-apf" data-tg-keep><div class="tg-ph"><b>' + verb + '</b><span class="tg-no">Op ' + raN(ro, op) + '</span><span class="cu">' + esc(op.complaint || "") + '</span><span class="mny">' + tgMoney(opMoney(op).total) + '</span><button class="btn btn-sm ib" data-action="tg-ap-x" aria-label="Close">' + tgI("x", 14) + '</button></div>'
    + '<span class="tg-lbl top">Who ' + (d === "no" ? 'declined' : 'approved') + '</span><div class="tg-r">' + (L.length ? L.map(function(q, i){ return '<button class="tg-pchip' + (A.to === i ? ' on' : '') + '" data-action="tg-ap" data-f="to" data-v="' + i + '"><span class="tg-av">' + esc(tgIni(q.n)) + '</span><b>' + esc(q.n) + '</b><small>' + esc(q.r || "") + (q.ok ? ' · approves' : '') + '</small></button>'; }).join('') : '')
    + '<input class="tg-who" data-no-draft data-tg-in="apwho" value="' + esc(A.who || "") + '" placeholder="' + (L.length ? 'or someone else' : 'Name') + '"></div>'
    + '<span class="tg-lbl top">How</span><div class="tg-r">' + TG_HOW.map(function(h, i){ return '<button class="tg-chip' + (A.how === h ? ' on' : '') + '" data-action="tg-ap" data-f="how" data-v="' + h + '"><span class="tg-kbd">' + (i + 1) + '</span>' + h + '</button>'; }).join('') + '</div>'
    + (d === "part" ? '<div class="tg-f"><span>Approved amount</span><input data-no-draft data-tg-in="apamt" value="' + esc(A.amt || "") + '" placeholder="$ of ' + tgMoney(opMoney(op).total) + '"></div>' : '')
    + (d !== "no" ? '<div class="tg-f"><span>PO #</span><input data-no-draft data-tg-in="appo" value="' + esc(A.po || "") + '" placeholder="optional"></div>' : '<div class="tg-f"><span>Reason</span><input data-no-draft data-tg-in="apreason" value="' + esc(A.reason || "") + '" placeholder="optional — e.g. too expensive"></div>')
    + '<div class="tg-rec">' + tgI("check", 12) + '<span>Saved with your name, <b>' + esc(tgMe()) + '</b>, and the time · ' + fmtTime(nowIso()) + '</span></div>'
    + '<div class="tg-acts"><button class="btn btn-sm" data-action="tg-ap-x">Cancel<span class="tg-kbd">Esc</span></button><button class="btn btn-sm btn-primary" data-action="tg-ap-save">' + (A.rec ? 'Save record' : { ok: 'Save approval', part: 'Save partial approval', no: 'Save decline' }[d]) + '<span class="tg-kbd">↵</span></button></div></div>';
}
function tgApprCard(ro){
  var ops = raOps(ro), ok = 0, op0 = 0, no = 0;
  ops.forEach(function(op){ var m = opMoney(op).total, w = ["WARR", "RECALL"].indexOf(opJobType(op)) > -1; if(op.declined) no += m; else if(op.appr || w) ok += m; else op0 += m; });
  if(!ops.length) return '';
  return '<div class="tg-appr"><div class="h">' + tgI("check", 14) + 'Approvals<span>Approved ' + tgMoney(ok) + ' · open ' + tgMoney(op0) + (no ? ' · declined ' + tgMoney(no) : '') + '</span><button class="btn btn-sm" data-action="tg-copyrec" data-ro="' + ro.id + '" title="For the Decisiv case notes">' + tgI("copy", 13) + 'Copy record</button></div>'
    + ops.map(function(op){ var a = op.appr, w = ["WARR", "RECALL"].indexOf(opJobType(op)) > -1, s = a ? a.s : (op.declined ? "no" : null), open = UI.tgAP && UI.tgAP.ro === ro.id && UI.tgAP.op === op.id;
      return '<div class="tg-opr" data-op="' + op.id + '"><b class="tg-no">Op ' + raN(ro, op) + '</b><span class="t">' + esc(op.complaint || "Operation") + '</span><span class="mny">' + tgMoney(opMoney(op).total) + '</span>'
        + (w ? '<span class="tg-oc ok">Warranty</span>' : '<span class="tg-seg3">' + [["ok", "Approve"], ["part", "Partly"], ["no", "Decline"]].map(function(b){ return '<button class="' + (s === b[0] ? 'on ' + b[0] : '') + '" data-action="tg-apr" data-ro="' + ro.id + '" data-op="' + op.id + '" data-d="' + b[0] + '">' + b[1] + '</button>'; }).join('') + '</span>')
        + (open ? tgApForm(ro, op) : tgRecLine(ro, op)) + '</div>'; }).join('') + '</div>';
}
function tgRecordText(ro){
  var L = [roLabel(ro) + " · " + (ro.customerName || "") + (ro.unitNumber ? " · unit " + ro.unitNumber : "")];
  raOps(ro).forEach(function(op){ var a = op.appr, w = ["WARR", "RECALL"].indexOf(opJobType(op)) > -1;
    L.push("Op " + raN(ro, op) + " " + (op.complaint || "") + " " + tgMoney(opMoney(op).total) + " — " + (w ? "warranty" : !a ? (op.declined ? "declined — no record" : "open") : a.who ? (a.s === "no" ? "declined" : a.s === "part" ? "partly approved" : "approved") + " by " + a.who + (a.role ? " (" + a.role + ")" : "") + " via " + (a.how || "?") + ", " + fmtDate(a.at) + " " + fmtTime(a.at) + (a.po ? ", PO " + a.po : "") + (a.amt ? ", " + tgMoney(a.amt) : "") + (a.reason ? ', "' + a.reason + '"' : "") + "; logged by " + (a.by || "") : (a.s === "no" ? "declined" : "approved") + " — no record")); });
  return L.join("\n");
}

/* ---------- Inbox view ---------- */
function tgVInbox(ro){
  var L = tgPeople(ro), dt = tgDefTo(ro), hint = tgMissHint(ro), snz = ro.tgSnz && tgSnoozed(ro);
  var thread = (ro.contacts || []).map(function(c){ return { at: c.at, h: '<div class="tg-m"><span class="gi">' + tgI(TG_KIND_IC[c.kind] || "phone", 15) + '</span><div class="bd"><div class="hd"><b>' + esc(c.kind || "Contact") + '</b>' + (c.to ? '<span class="to">' + esc(c.to) + '</span>' : '') + '<span class="tg-oc ' + (/Approved|Update/.test(c.out) ? 'ok' : /Declined/.test(c.out) ? 'no' : 'mid') + '">' + esc(c.out || "") + '</span><span class="by">' + esc(c.by || "") + '</span><time>' + fmtDate(c.at) + ' ' + fmtTime(c.at) + '</time></div>' + (c.note ? '<p>' + esc(c.note) + '</p>' : '') + '</div></div>' }; })
    .concat((ro.handoffs || []).filter(function(h){ return h.kind === "send" || h.kind === "auto" || h.kind === "nudge" || h.kind === "return"; }).map(function(h){ var late = ro.route && h === (ro.handoffs || []).filter(function(x){ return x.kind === "send"; }).slice(-1)[0] && tgDue(ro);
      return { at: h.at, h: '<div class="tg-m sys"><span class="gi">' + tgI("swap", 15) + '</span><div class="bd"><div class="hd">' + (h.kind === "nudge" ? 'Nudged <b>' + esc(h.who || RT_LBL[h.to] || "") + '</b>' : h.kind === "return" ? 'Returned to <b>' + esc(RT_LBL[h.to] || "") + '</b>' : 'To <b>' + esc(h.to === "tech" ? (h.who || "a technician") : RT_LBL[h.to] || h.to) + '</b>' + (h.reason ? ' — <span class="why">' + esc(h.reason) + '</span>' : '')) + '<time>' + fmtDate(h.at) + ' ' + fmtTime(h.at) + '</time></div>'
        + (h.note ? '<p class="xn">' + esc(h.note) + '</p>' : '') + '<div class="xb' + (late ? ' late' : '') + '">From ' + esc(h.by || "") + (h.back ? ' · back by ' + tgWhen(+new Date(h.back)) + (late ? ' · ' + tgDur(Date.now() - late) + ' late' : '') : '') + '</div></div></div>' }; }))
    .sort(function(a, b){ return new Date(a.at) - new Date(b.at); }).map(function(x){ return x.h; }).join('');
  var hd = tgHold(ro);
  var etaRow = tyCat(ro) === "arr" ? (function(){ var E = tgEta(ro); if(!E.eta) return '<div class="tg-m sys"><span class="gi">' + tgI("inArrow", 15) + '</span><div class="bd"><div class="hd">No ETA yet — log the driver’s call (“40 minutes out”) and it counts down</div></div></div>';
    var d = E.eta - Date.now(), q = E.src ? (String(E.src.note || "").match(/[^.—]*(?:min|hour|hr|\d:\d\d)[^.—]*/i) || [E.src.note])[0] : "";
    return '<div class="tg-m sys eta"><span class="gi">' + tgI("inArrow", 15) + '</span><div class="bd"><div class="hd">ETA <b>~' + tgWhen(E.eta) + '</b>' + (E.src ? ' · from ' + esc(tgFirst(E.src.by || "")) + '’s ' + esc(String(E.src.kind || "call").toLowerCase()) + ' at ' + fmtTime(E.src.at) + ': <i>“' + esc(String(q || "").trim()) + '”</i>' : '') + '<time>' + (d > 0 ? 'in ' + tgDur(d) : tgDur(-d) + ' late') + '</time></div></div></div>'; })() : '';
  var pc = L.map(function(p, i){ var k = p.pref === "Text" ? ["chat", "Text"] : p.pref === "Email" ? ["mail", "Email"] : ["phone", "Call"];
    return '<div class="tg-pc' + (i === dt && hint ? ' sug' : '') + '"><span class="tg-av md">' + esc(tgIni(p.n)) + '</span><div class="nm"><b>' + esc(p.n) + '<span class="rl">' + esc(p.r || "") + '</span>' + (p.ok ? '<span class="tg-tag">Approves</span>' : '') + '</b><small><b class="tg-no">' + esc(p.ph || p.em || "—") + '</b> · prefers ' + esc(String(p.pref || "Call").toLowerCase()) + (p.best ? ' · ' + esc(p.best) : '') + '</small></div>'
      + (p.ph ? '<button class="btn btn-sm ib" data-action="tg-copy" data-v="' + esc(p.ph) + '" title="Copy number">' + tgI("copy", 14) + '</button>' : '') + '<button class="btn btn-sm" data-action="tg-callp" data-ro="' + ro.id + '" data-i="' + i + '" data-k="' + k[1] + '">' + tgI(k[0], 14) + k[1] + '</button></div>'; }).join('');
  var addf = UI.tgAddP === ro.id ? '<div class="tg-addf" data-tg-keep><input data-no-draft data-tg-in="np-n" placeholder="Name" value="' + esc((UI.tgNP || {}).n || "") + '"><select data-tg-in="np-r"><option>Fleet manager</option><option>Driver</option><option>Owner</option><option>Office manager</option><option>Dispatcher</option></select><input data-no-draft data-tg-in="np-ph" placeholder="Phone" value="' + esc((UI.tgNP || {}).ph || "") + '"><input data-no-draft data-tg-in="np-em" placeholder="Email (optional)" value="' + esc((UI.tgNP || {}).em || "") + '"><select data-tg-in="np-pref"><option>Call</option><option>Text</option><option>Email</option></select><label class="tg-ok"><input type="checkbox" data-tg-ck="np-ok"' + ((UI.tgNP || {}).ok ? ' checked' : '') + '>Approves</label><button class="btn btn-sm btn-primary" data-action="tg-np-save" data-ro="' + ro.id + '">Add</button><button class="btn btn-sm tg-gh" data-action="tg-np-x">Cancel</button></div>' : '';
  return '<div class="tg-ib"><div class="tg-top"><div class="r1"><b class="tg-no">' + esc(roLabel(ro)) + '</b>' + tgSq(tyCat(ro)) + '<span>' + tgCatLbl(ro) + '</span>·<span class="tg-age' + (tgLate(ro) ? ' late' : '') + '">' + (tyCat(ro) === "arr" ? (tgEta(ro).eta ? '~' + tgWhen(tgEta(ro).eta) : 'arriving') : esc(ageText(tgAgeMs(ro)))) + '</span>' + (warrIs(ro) ? '<button class="tg-w" data-action="open-warr" data-ro="' + ro.id + '">' + tgI("shield", 12) + 'Warranty ' + warrReady(ro).pct + '%</button>' : '') + '<span class="sp"></span><button class="btn btn-sm" data-action="tg-pop" data-p="xfer" data-ro="' + ro.id + '">' + tgI("swap", 14) + 'Transfer…</button><button class="btn btn-sm" data-action="goto-ro" data-ro="' + ro.id + '">Open RO</button></div>'
    + '<h2>' + esc(ro.customerName || "—") + '</h2><div class="r2">' + tgSpotChip(ro) + tgTicks(ro) + '<span class="st">' + tgSi(ro) + '<span>' + esc(tgStTxt(ro)) + '</span></span>' + tgHeld(ro)
    + '</div>'
    + '<div class="tg-ppl">' + pc + '<button class="tg-add" data-action="tg-np-open" data-ro="' + ro.id + '">' + tgI("plus", 13) + (L.length ? 'Add' : 'Add who to call — driver, fleet manager…') + '</button>' + (hint ? '<div class="tg-hint">' + tgI("flag", 13) + esc(hint) + '</div>' : '') + addf + '</div></div>'
    + '<div class="tg-thread" data-scroll="tg-thread">' + '<span class="tg-day">This RO · calls, texts, approvals and transfers</span>' + (thread || '<div class="tg-m sys"><span class="gi">' + tgI("phone", 15) + '</span><div class="bd"><div class="hd">No contact logged yet</div></div></div>')
    + (snz ? '<div class="tg-m sys"><span class="gi">' + tgI("clock", 15) + '</span><div class="bd"><div class="hd">Snoozed until <b>' + tgWhen(+new Date(ro.tgSnz.until)) + '</b>' + (ro.tgSnz.why ? ' · ' + esc(ro.tgSnz.why) : '') + '<time>' + fmtTime(ro.tgSnz.at) + '</time></div></div></div>' : '')
    + '<div class="tg-m sys"><span class="gi">' + tgI("user", 15) + '</span><div class="bd"><div class="hd">With <b>' + esc(hd.who) + '</b> · ' + esc(RT_LBL[hd.to]) + '<time>' + tgDur(hd.held) + '</time></div></div></div>'
    + etaRow + tgApprCard(ro) + '</div>'
    + '<div class="tg-comp" data-key="tg-comp">' + tgLogForm(tgLF("c"), "c", ro) + '</div></div>';
}

/* ---------- Desk view ---------- */
function tgVDesk(ro){
  var M = null; try{ M = roStages(ro); }catch(e){}
  var x = tgItemOf(ro.id), nx = null; try{ nx = raNext(ro); }catch(e){}
  var t = x ? x.why : nx ? nx.txt : "Nothing waiting on anyone — keep going.";
  var cl = tyCloseChecks(ro), st = roStatus(ro), hold = /^Waiting/.test(st.status), done = cl.filter(function(c){ return c.ok; }).length + (hold ? 0 : 1), C = 2 * Math.PI * 22;
  var hd = tgHold(ro), r = ro.route, due = tgDue(ro);
  var opts = RO_STATUS_OPTIONS.map(function(o){ return [o.status].concat(o.subs.map(function(sb){ return o.status + '|' + sb; })); }).reduce(function(a, b){ return a.concat(b); }, []), cur = st.status + (st.sub ? '|' + st.sub : '');
  var feed = (ro.contacts || []).slice(-3).reverse().map(function(c){ return '<div class="tg-fe"><span class="gi">' + tgI(TG_KIND_IC[c.kind] || "phone", 13) + '</span><span><b>' + esc(c.kind) + '</b>' + (c.to ? ' → ' + esc(c.to) : '') + ' · <span class="tg-oc ' + (/Approved|Update/.test(c.out) ? 'ok' : /Declined/.test(c.out) ? 'no' : 'mid') + '">' + esc(c.out || "") + '</span></span><time>' + fmtTime(c.at) + '</time>' + (c.note ? '<p>' + esc(c.note) + '</p>' : '') + '</div>'; }).join('');
  return '<div class="tg-dk"><div class="tg-dkh"><div class="l"><div class="eb"><b class="tg-no">' + esc(roLabel(ro)) + '</b>·<span>' + esc([ro.model, ro.unitNumber ? "Unit " + ro.unitNumber : ""].filter(Boolean).join(" · ")) + '</span>·<span class="tg-age' + (tgLate(ro) ? ' late' : '') + '">' + esc(ageText(tgAgeMs(ro))) + '</span></div><h2>' + esc(ro.customerName || "—") + '</h2></div>'
    + '<div class="r">' + tgSpotChip(ro) + '<label class="tg-stsel">' + tgSi(ro) + '<select data-tyst="ro" data-ro="' + ro.id + '" aria-label="RO status">' + opts.map(function(v){ var p = v.split('|'); return '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(p[1] ? p[0] + ' · ' + p[1] : p[0]) + '</option>'; }).join('') + '</select>' + tgI("chevD", 13) + '</label></div></div>'
    + (M ? '<div class="tg-strip"><div class="tg-lbl" style="display:flex;gap:8px">Stage<span style="color:var(--tg-ink2)">' + M.done + ' of ' + M.total + '</span>' + (M.likely && !M.all ? '<span style="margin-left:auto">ready ' + esc(tgWhen(+new Date(M.likely))) + '</span>' : '') + '</div><div class="tg-steps">'
      + M.list.map(function(s){ return '<button class="tg-step ' + (s.state === "d" ? 'done' : s.state === "c" ? (tyCat(ro) === "apr" ? 'wait' : 'now') : '') + '" data-action="ty-stg" data-ro="' + ro.id + '" data-k="' + s.k + '" title="' + (s.state === "d" ? 'Uncheck ' : 'Check off ') + esc(s.name) + '"><i></i><b>' + esc(s.name) + '</b><small>' + esc(s.sub || (s.state === "d" ? 'done' : '—')) + '</small></button>'; }).join('') + '</div></div>' : '')
    + '<div class="tg-next"><span class="k">Next</span><p>' + esc(t.charAt(0).toUpperCase() + t.slice(1)) + '</p><button class="btn btn-sm" data-action="tg-pop" data-p="log" data-ro="' + ro.id + '">' + tgI("phone", 14) + 'Log a call</button>' + (x ? '<button class="btn btn-sm tg-acc" data-action="tg-do" data-ro="' + ro.id + '">' + esc(x.btn) + '</button>' : '') + '</div>'
    + '<div class="tg-two"><div class="tg-card"><div class="h">' + tgI("phone", 14) + 'Customer<small>' + (ro.contacts || []).length + ' contact' + ((ro.contacts || []).length === 1 ? '' : 's') + '</small></div>' + (feed ? '<div class="tg-feed">' + feed + '</div>' : '<p class="tg-none">No calls or messages yet.</p>')
    + '<div class="tg-r" style="margin-top:10px">' + TG_KINDS.map(function(k){ return '<button class="tg-chip" data-action="tg-pop" data-p="log" data-ro="' + ro.id + '" data-k="' + k + '">' + tgI(TG_KIND_IC[k], 13) + k + '</button>'; }).join('') + '</div></div>'
    + '<div class="tg-card">' + (tgApprCard(ro) || '<div class="h">' + tgI("check", 14) + 'Approvals</div><p class="tg-none">No operations yet.</p>') + '</div></div>'
    + '<div class="tg-two"><div class="tg-card"><div class="h">Ready to close<small>' + done + ' of ' + (cl.length + 1) + '</small>' + (tyCat(ro) === "rdy" ? '<button class="btn btn-sm btn-primary" data-action="tg-pop" data-p="release" data-ro="' + ro.id + '" style="margin-left:10px">' + tgI("release", 13) + 'Release…</button>' : '') + '</div><div class="tg-rtc"><svg class="tg-ring' + (done === cl.length + 1 ? ' ok' : '') + '" width="56" height="56" viewBox="0 0 56 56"><circle class="t" cx="28" cy="28" r="22"/><circle class="p" cx="28" cy="28" r="22" stroke-dasharray="' + (C * done / (cl.length + 1)).toFixed(1) + ' ' + C.toFixed(1) + '"/></svg><div class="tg-close">'
    + cl.map(function(c){ return '<div class="tg-cl' + (c.ok ? ' ok' : '') + '"><i></i><span>' + esc(c.t) + '</span><small>' + esc(c.d) + '</small></div>'; }).join('') + '<div class="tg-cl' + (hold ? '' : ' ok') + '"><i></i><span>Holding</span><small>' + esc(hold ? (st.sub || st.status.replace(/^Waiting – /, 'Waiting on ')) : 'nothing blocking') + '</small></div></div></div></div>'
    + '<div class="tg-card"><div class="h">' + tgI("swap", 14) + 'Who has it</div><div class="tg-who2"><span class="tg-role lg">' + RT_AB[hd.to] + '</span><div style="flex:1;min-width:0"><b>' + esc(hd.who) + '</b><small>' + esc(RT_LBL[hd.to]) + (r && r.state === "pending" ? ' · waiting for them to accept' : '') + '</small></div><button class="btn btn-sm btn-primary" data-action="tg-pop" data-p="xfer" data-ro="' + ro.id + '">Transfer…</button></div><div style="margin-top:12px">' + tgHeld(ro) + '</div>'
    + '<div class="tg-kv">' + (r && r.reason ? '<span>Why</span><b>' + esc(r.reason) + '</b>' : '') + (r && r.note ? '<span>Note</span><b class="n">' + esc(r.note) + '</b>' : '') + (r && r.back ? '<span>Back by</span><b class="' + (due ? 'late' : '') + '">' + tgWhen(+new Date(r.back)) + (due ? ' · ' + tgDur(Date.now() - due) + ' late' : '') + '</b>' : '')
    + (r && r.by ? '<span>From</span><b class="n">' + esc(r.by) + ' · ' + fmtDate(r.at) + ' ' + fmtTime(r.at) + '</b>' : '') + '<span>Tech</span><b>' + esc(ro.assignedTech || "Unassigned") + '</b><span>Key tag</span><b class="tg-no">' + esc(ro.keyTag || "—") + '</b>' + (M && M.likely && !M.all ? '<span>Ready about</span><b>' + esc(tgWhen(+new Date(M.likely))) + '</b>' : '') + '</div></div></div></div>';
}

/* ---------- Yard view ---------- */
function tgVYard(sel){
  var ym = yardMap(), sp = yardSpots(), y = yardCfg(), cls = tgClashes(), byS = {}, pick = UI.yardPick;
  tgYard().forEach(function(ro){ var s = spotOf(ro.location); if(s && ym.valid[s]) (byS[s] = byS[s] || []).push(ro); });
  var fl = UI.tgFilter;
  var tile = function(s){
    var L = byS[s.id] || [], lbl = '<span class="l">' + esc(tgSpotLbl(s.id)) + '</span>';
    if(L.length > 1){ var on = L.some(function(r){ return sel && r.id === sel.id; }); return '<button class="tg-s occ clash' + (on ? ' tg-on' : '') + '" data-action="tg-clash" data-spot="' + esc(s.id) + '" title="' + esc(L.map(function(r){ return tgNum(r) + " " + (r.customerName || ""); }).join(" · ")) + '">' + lbl + '<b>' + L.map(function(r){ return esc(tgNum(r).slice(-4)); }).join('<em>·</em>') + '</b><small>' + L.length + ' trucks</small><span class="fl"><i class="cl">!</i></span></button>'; }
    var ro = L[0];
    if(ro){ var c = tyCat(ro), on = sel && ro.id === sel.id, m = !fl || tgMatch(ro);
      if(c === "arr"){ var e = tgEta(ro).eta, d = e ? e - Date.now() : null;
        return '<div class="tg-s rsv' + (on ? ' tg-on' : '') + (d != null && d <= 0 ? ' late' : d != null && d <= 15 * 60000 ? ' soon' : '') + (m ? '' : ' dim') + '" data-action="tg-sel" data-ro="' + ro.id + '" draggable="true" data-tg-drag="' + ro.id + '" title="' + esc((ro.customerName || "") + " · held for this arrival" + (e ? " · ETA " + tgWhen(e) : "")) + '">' + lbl + '<b>' + tgSq("arr") + esc(tgNum(ro).slice(-4)) + '</b><small>' + (d == null ? 'no ETA' : d > 0 ? (d < 3600000 ? 'in ' + Math.round(d / 60000) + 'm' : '~' + tgWhen(e)) : 'late ' + Math.round(-d / 60000) + 'm') + '</small></div>'; }
      return '<div class="tg-s occ' + (on ? ' tg-on' : '') + (pick && pick !== ro.id ? ' dim' : '') + (m ? '' : ' dim') + '" role="button" tabindex="0" data-action="tg-sel" data-ro="' + ro.id + '" draggable="true" data-tg-drag="' + ro.id + '" title="' + esc((ro.customerName || "") + " · " + tgStTxt(ro)) + '">' + lbl + '<b>' + tgSq(c) + esc(tgNum(ro).slice(-4)) + (roInfo(ro).run ? '<i class="tg-live"></i>' : '') + '</b><small>' + esc(ro.customerName || "") + '</small><span class="fl">' + (warrIs(ro) ? tgI("shield", 11) : '') + (tgLate(ro) ? '<i class="lt"></i>' : '') + '</span></div>'; }
    return pick ? '<button class="tg-s free" data-action="yard-drop" data-spot="' + esc(s.id) + '" data-tg-drop="' + esc(s.id) + '">' + lbl + '</button>' : '<div class="tg-s" data-tg-drop="' + esc(s.id) + '">' + lbl + '</div>';
  };
  var grid = function(list, cols){ return '<div class="tg-g" style="grid-template-columns:repeat(' + Math.max(cols, 1) + ',minmax(0,1fr))">' + list.map(tile).join('') + '</div>'; };
  var by = function(z){ return sp.filter(function(s){ return s.zone === z; }); };
  var floor = by("uptime").concat(by("awning")).concat(by("bay")), rd = by("ready"), tg = by("triage"), lot = by("lot");
  var fc = Math.min(10, Math.max(5, Math.ceil(floor.length / 2)));
  var cl = UI.tgClash && cls.filter(function(c){ return c.spot === UI.tgClash; })[0];
  var bar;
  if(cl) bar = '<div class="tg-ybar cl"><span class="k">' + tgI("flag", 13) + 'Spot clash</span><span class="txt">Two ROs claim <b>' + esc(tgZone(cl.spot)) + ' ' + esc(tgSpotLbl(cl.spot)) + '</b> — ' + cl.ros.map(function(r){ return '<b>' + esc(tgNum(r)) + '</b> ' + esc(r.customerName || ""); }).join(' and ') + '. Which one is really there?</span><span class="btns">' + cl.ros.map(function(r){ return '<button class="btn btn-sm" data-action="tg-keep" data-ro="' + r.id + '" title="The other one gets a new spot">' + esc(tgNum(r)) + ' is here</button>'; }).join('') + '<button class="btn btn-sm tg-gh" data-action="tg-clash-x">Later</button></span></div>';
  else if(pick && getRO(pick)){ var pr = getRO(pick); bar = '<div class="tg-ybar mv"><span class="k">Move</span><span><b>' + esc(roLabel(pr)) + ' · ' + esc(pr.customerName || "") + '</b> from ' + esc(tgZone(tgSpotOf(pr))) + ' <b class="tg-no">' + esc(tgSpotLbl(tgSpotOf(pr))) + '</b> — pick a free spot, or drag it</span><span class="sp"></span><button class="btn btn-sm" data-action="yard-cancel">Cancel<span class="tg-kbd">Esc</span></button></div>'; }
  else if(sel) bar = '<div class="tg-ybar">' + tgSq(tyCat(sel)) + '<b class="tg-no">' + esc(roLabel(sel)) + '</b><h3>' + esc(sel.customerName || "") + '</h3><span class="at">' + tgI("pin", 14) + esc(tgZone(tgSpotOf(sel))) + '<b class="tg-no">' + esc(tgSpotLbl(tgSpotOf(sel)) || sel.location || "—") + '</b></span>'
    + (tyCat(sel) === "arr" ? '<span class="stt">' + tgI("inArrow", 14) + (tgEta(sel).eta ? (tgEta(sel).eta > Date.now() ? 'arriving ~' : 'due ') + tgWhen(tgEta(sel).eta) : 'no ETA yet') + '</span>' : '<span class="stt">' + tgSi(sel) + esc(tgStTxt(sel)) + '</span>')
    + '<span class="sp"></span>' + (cls.length ? '<button class="btn btn-sm tg-warnb" data-action="tg-clash" data-spot="' + esc(cls[0].spot) + '">' + tgI("flag", 13) + cls.length + ' spot clash' + (cls.length > 1 ? 'es' : '') + '</button>' : '') + '<span class="kt">Key tag <b class="tg-no">' + esc(sel.keyTag || "—") + '</b></span><button class="btn btn-sm" data-action="yard-pick" data-ro="' + sel.id + '">' + tgI("pin", 13) + 'Move…<span class="tg-kbd">M</span></button></div>';
  else bar = '';
  var els = ym.elsewhere;
  var warr = tgYard().filter(warrIs), rel = tyReleasedToday();
  return '<div class="tg-yd' + (fl ? ' filtering' : '') + '" data-scroll="tg-yard">' + bar
    + '<div class="tg-row2"><section class="tg-z" style="flex:1.55"><div class="tg-zh">Shop floor<small>UpTime · awning · bays 1–' + y.bays + '</small><span>' + floor.filter(function(s){ return ym.map[s.id]; }).length + '/' + floor.length + '</span></div>' + grid(floor, fc) + '</section>'
    + '<section class="tg-z" style="flex:1"><div class="tg-zh">Check-in<small>arrival line · triage lanes</small></div>' + (rd.length ? grid(rd, Math.min(6, rd.length)) : '<span class="tg-none">No arrival spots.</span>') + '<div style="height:6px"></div>' + (tg.length ? grid(tg, Math.min(6, tg.length)) : '') + '</section></div>'
    + (lot.length ? '<section class="tg-z"><div class="tg-zh">Parking lot<span>' + lot.filter(function(s){ return ym.map[s.id]; }).length + '/' + lot.length + '</span></div>' + y.rows.map(function(rw){ var rs = lot.filter(function(s){ return s.row === rw.id; }); if(!rs.length) return ''; var ln = LOT_LINES[rw.id] || {};
        return '<div class="tg-lrow"><div class="tg-lrh" title="' + esc(ln.note || "") + '"><b>' + esc(rw.id) + '</b><small>' + esc(ln.name || "") + '</small></div>' + grid(rs, rs.length) + '</div>'; }).join('') + '</section>' : '')
    + '<div class="tg-row2"><section class="tg-z" style="flex:1"><div class="tg-zh">Warranty<small>on the yard</small></div>' + (warr.length ? warr.map(function(r){ var w = warrReady(r); return '<div class="tg-wl" data-action="tg-sel" data-ro="' + r.id + '"><b class="tg-no">' + esc(tgNum(r)) + '</b><b>' + esc(r.customerName || "") + '</b>' + tgSpotChip(r) + '<small>' + w.pct + '% · ' + w.miss.length + ' missing</small><span class="tg-wb"><i style="width:' + w.pct + '%"></i></span></div>'; }).join('') : '<span class="tg-none">No warranty work on the yard.</span>') + '</section>'
    + '<section class="tg-z" style="flex:.8"><div class="tg-zh">Released today<small>' + rel.length + '</small></div>' + (rel.length ? rel.map(function(r){ var rr = r.releaseRec; return '<div class="tg-wl"><b class="tg-no">' + esc(tgNum(r)) + '</b><b>' + esc(r.customerName || "") + '</b><small>' + fmtTime(r.status && r.status.setAt) + (rr && rr.to ? ' · to ' + esc(tgFirst(rr.to)) : '') + (rr && rr.override ? ' · released anyway' : '') + '</small></div>'; }).join('') : '<span class="tg-none">Nothing released yet today.</span>') + '</section></div>'
    + (els.length ? '<section class="tg-z"><div class="tg-zh">Elsewhere<small>off the yard or out for service</small></div><div class="tg-els">' + els.map(function(r){ return '<span class="tg-elsi" data-action="tg-sel" data-ro="' + r.id + '"><b class="tg-no">' + esc(tgNum(r)) + '</b>' + esc(r.customerName || "") + ' · ' + esc(r.location || "") + '</span>'; }).join('') + '</div></section>' : '')
    + '<div class="tg-leg">' + ["arr", "chk", "apr", "wrk", "rdy"].map(function(k){ return '<span>' + tgSq(k) + TG_CAT[k][0] + '</span>'; }).join('') + '<span><i class="tg-dash"></i>Held for an arrival</span><span><i class="cl"></i>Spot clash</span><span><i class="tg-live"></i>On the clock</span><span class="hint">Drag a truck onto a free spot · <span class="tg-kbd">M</span> move</span></div></div>';
}

/* ---------- popovers from the list ---------- */
function tgPopHtml(){
  var P = UI.tgPop; if(!P) return ''; var ro = tgRoById(P.ro); if(!ro){ UI.tgPop = null; return ''; }
  var head = function(k){ return '<div class="tg-ph"><b>' + k + '</b><span class="tg-no">' + esc(roLabel(ro)) + '</span><span class="cu">' + esc(ro.customerName || "") + '</span><button class="btn btn-sm ib" data-action="tg-pop-x" aria-label="Close">' + tgI("x", 14) + '</button></div>'; };
  var mi = function(i, inner, act){ return '<button class="tg-mi' + ((P.i || 0) === i ? ' hv' : '') + '" data-action="' + act + '" data-i="' + i + '"><span class="tg-kbd">' + (i + 1) + '</span>' + inner + '</button>'; };
  var ft = function(t){ return '<div class="tg-pft">' + t + '</div>'; };
  var style = UI.tgPopTop != null ? ' style="top:' + UI.tgPopTop + 'px"' : '';
  var h = '';
  if(P.type === "log") h = '<div class="tg-pop" data-tg-keep' + style + '>' + head("Log a contact") + tgLogForm(tgLF("p"), "p", ro) + '</div>';
  else if(P.type === "snooze") h = '<div class="tg-pop menu" data-tg-keep' + style + '>' + head("Snooze until") + tgWhenOpts().map(function(o, i){ return mi(i, o[0] + '<span class="meta">' + tgWhen(o[1]) + '</span>', "tg-snz-pick"); }).join('') + ft("Comes back at the top of its group.") + '</div>';
  else if(P.type === "assign"){ var T = rtTechs(); h = '<div class="tg-pop menu" data-tg-keep' + style + '>' + head("Assign") + (T.length ? T.map(function(n, i){ var c = STATE.ros.filter(function(x){ return !roIsDone(x) && techSame(x.assignedTech, n); }).length; return mi(i, '<span class="tg-av">' + esc(tgIni(n)) + '</span>' + esc(n) + '<span class="meta">' + c + ' open</span>', "tg-as-pick"); }).join('') : '<p class="tg-none" style="padding:8px 10px">No technicians yet — add them under Manager → Staff.</p>') + ft("Sends it to the tech" + (rtCfg().needAccept ? " — they accept it on their Console." : ".")) + '</div>'; }
  else if(P.type === "checkin"){ var F = tgFreeSpots(); h = '<div class="tg-pop menu" data-tg-keep' + style + '>' + head("Check in to") + (F.length ? F.map(function(s, i){ return mi(i, esc(tgZone(s)) + '<span class="meta tg-no">' + esc(tgSpotLbl(s)) + '</span>', "tg-ci-pick"); }).join('') : '<p class="tg-none" style="padding:8px 10px">No free triage lane or bay.</p>') + ft("Then it shows under Ready to go → Assign.") + '</div>'; }
  else if(P.type === "release") h = tgRelPop(ro, head, style);
  else if(P.type === "xfer") h = tgXferPop(ro, head, style);
  return h;
}
function tgFreeSpots(){ var ym = yardMap(); return yardSpots().filter(function(s){ return (s.zone === "triage" || s.zone === "bay") && !ym.map[s.id]; }).sort(function(a, b){ return (a.zone === "triage" ? 0 : 1) - (b.zone === "triage" ? 0 : 1) || a.n - b.n; }).slice(0, 5).map(function(s){ return s.id; }); }
function tgRelChecks(ro){
  var cl = tyCloseChecks(ro), st = roStatus(ro), hold = /^Waiting/.test(st.status), gaps = [];
  try{ gaps = roCompleteGaps(ro).filter(function(g){ return !/operation|road test/.test(g); }); }catch(e){}
  var L = cl.map(function(c){ return { k: c.k, ok: c.ok, t: c.t, d: c.d, fix: c.ok ? null : c.k === "ops" ? "Mark complete" : c.k === "parts" ? "Mark installed" : c.k === "notes" ? "Add note" : "Log road test", op: c.op }; });
  L.push({ k: "hold", ok: !hold, t: "Nothing holding", d: hold ? (st.sub || st.status.replace(/^Waiting – /, "waiting on ")) : "clear", fix: null });
  if(gaps.length) L.push({ k: "gaps", ok: false, t: "Paperwork", d: gaps.join(" · "), fix: "Open RO" });
  return L;
}
function tgRelPop(ro, head, style){
  var A = UI.tgRL || (UI.tgRL = {}), C = tgRelChecks(ro), bad = C.filter(function(c){ return !c.ok; }), L = tgPeople(ro), rs = releaseState(ro);
  if(A.to == null){ var di = -1; L.forEach(function(p, i){ if(di < 0 && p.r === "Driver") di = i; }); A.to = di > -1 ? di : L.length ? tgDefTo(ro) : "o"; }
  var hand = RELEASE_CHECK.filter(function(x){ return x[0] !== "road"; });
  var handBad = hand.filter(function(x){ return !rs[x[0]]; });
  var n = C.length + hand.length, done = n - bad.length - handBad.length, CC = 2 * Math.PI * 9;
  var fixF = function(c){
    if(c.k === "notes") return '<div class="tg-fix"><input data-no-draft data-tg-in="rl-note" placeholder="What was done on that punch" value="' + esc(A.note || "") + '"><button class="btn btn-sm btn-primary" data-action="tg-rl-save" data-k="notes">Save note</button></div>';
    if(c.k === "road") return '<div class="tg-fix"><span class="lb">Result</span><span class="tg-seg3"><button class="' + ((A.road || "Pass") === "Pass" ? 'on ok' : '') + '" data-action="tg-rl" data-f="road" data-v="Pass">Pass</button><button class="' + (A.road === "Fail" ? 'on no' : '') + '" data-action="tg-rl" data-f="road" data-v="Fail">Fail</button></span><input data-no-draft data-tg-in="rl-mi" placeholder="Miles" style="max-width:80px" value="' + esc(A.mi || "") + '"><button class="btn btn-sm btn-primary" data-action="tg-rl-save" data-k="road">Save</button></div>';
    return '<div class="tg-fix"><span class="lb">' + (c.k === "ops" ? 'Marks every open operation complete.' : 'Marks every part on the RO installed.') + '</span><button class="btn btn-sm btn-primary" data-action="tg-rl-save" data-k="' + c.k + '">' + c.fix + '</button></div>'; };
  var cks = '<div class="tg-cks">' + C.map(function(c){ return '<div class="tg-ck ' + (c.ok ? 'ok' : 'no') + '"><i></i><span>' + esc(c.t) + '</span><small>' + esc(c.d) + '</small>' + (!c.ok && c.fix && A.fix !== c.k ? (c.k === "gaps" ? '<button class="tg-link" data-action="goto-ro" data-ro="' + ro.id + '">Open RO</button>' : '<button class="tg-link" data-action="tg-rl" data-f="fix" data-v="' + c.k + '">' + c.fix + '</button>') : '') + '</div>' + (A.fix === c.k && !c.ok ? fixF(c) : ''); }).join('') + '</div>';
  var handH = '<span class="tg-lbl top">Handover</span><div class="tg-r">' + hand.map(function(x){ var on = !!rs[x[0]]; return '<button class="tg-chip tick' + (on ? ' on' : '') + '" data-action="tg-rl" data-f="tick" data-v="' + x[0] + '" title="' + esc(x[1]) + '">' + (on ? tgI("check", 12) : '') + esc({ keys: "Keys back", clean: "Truck clean", invoice: "Invoice closed", notify: "Customer told" }[x[0]] || x[1]) + '</button>'; }).join('') + '</div>';
  var pname = A.to === "o" ? (A.other || "") : (L[A.to] || {}).n || "";
  var ppl = '<span class="tg-lbl top">Picked up by</span><div class="tg-r">' + L.map(function(q, i){ return '<button class="tg-pchip' + (A.to === i ? ' on' : '') + '" data-action="tg-rl" data-f="to" data-v="' + i + '"><span class="tg-av">' + esc(tgIni(q.n)) + '</span><b>' + esc(q.n) + '</b><small>' + esc(q.r || "") + '</small></button>'; }).join('') + '<button class="tg-chip' + (A.to === "o" ? ' on' : '') + '" data-action="tg-rl" data-f="to" data-v="o">' + (L.length ? 'Someone else' : 'Name') + '</button></div>' + (A.to === "o" ? '<input class="tg-wide" data-no-draft data-tg-in="rl-other" placeholder="Who picked it up" value="' + esc(A.other || "") + '">' : '');
  var line = '<div class="tg-rline"><span>' + tgI("key", 13) + 'Key tag <b class="tg-no">' + esc(ro.keyTag || "—") + '</b>' + (pname ? ' to ' + esc(tgFirst(pname)) : '') + '</span><span>' + tgI("pin", 13) + esc(tgSpotLbl(tgSpotOf(ro))) + ' frees up</span><span>' + tgI("check", 13) + 'Moves to Released today</span></div>';
  var tx = L.length ? '<label class="tg-opt"><input type="checkbox" data-tg-ck="rl-text"' + (A.text ? ' checked' : '') + '>Copy the “Ready for pickup” text too</label>' : '';
  var nb = bad.length + handBad.length;
  var any = nb && A.any ? '<div class="tg-any"><span class="tg-lbl">Release with ' + nb + ' check' + (nb > 1 ? 's' : '') + ' open — why?</span><div class="tg-r">' + TG_RSN.map(function(x){ return '<button class="tg-chip' + (A.reason === x ? ' on' : '') + '" data-action="tg-rl" data-f="reason" data-v="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div><input class="tg-wide" data-no-draft data-tg-in="rl-why" placeholder="Note (optional)" value="' + esc(A.why || "") + '"></div>' : '';
  var acts = !nb ? '<div class="tg-acts"><span class="hint">All checks pass</span><button class="btn btn-sm" data-action="tg-pop-x">Cancel<span class="tg-kbd">Esc</span></button><button class="btn btn-sm btn-primary" data-action="tg-rl-go" data-v="ok">' + tgI("release", 13) + 'Release<span class="tg-kbd">↵</span></button></div>'
    : A.any ? '<div class="tg-acts"><button class="btn btn-sm tg-gh" data-action="tg-rl" data-f="back">Back</button><button class="btn btn-sm" data-action="tg-rl-go" data-v="any"' + (A.reason ? '' : ' disabled') + '>Release anyway<span class="tg-kbd">↵</span></button></div>'
    : '<div class="tg-acts"><span class="hint">Fix ' + nb + ' to unlock</span><button class="btn btn-sm" data-action="tg-rl" data-f="any">Release anyway…</button><button class="btn btn-sm btn-primary" disabled>' + tgI("release", 13) + 'Release</button></div>';
  return '<div class="tg-pop rl" data-tg-keep' + style + '>' + head("Release") + '<div class="tg-rsum' + (nb ? ' bad' : '') + '"><svg class="tg-ring' + (nb ? '' : ' ok') + '" width="22" height="22" viewBox="0 0 22 22"><circle class="t" cx="11" cy="11" r="9" style="stroke-width:3"/><circle class="p" cx="11" cy="11" r="9" style="stroke-width:3" stroke-dasharray="' + (CC * done / n).toFixed(1) + ' ' + CC.toFixed(1) + '"/></svg><b>Ready to close</b><small>' + done + ' of ' + n + (nb ? ' · ' + nb + ' open' : '') + '</small></div>' + cks + handH + ppl + line + tx + any + acts + '</div>';
}
function tgXferPop(ro, head, style){
  var A = UI.tgXS || (UI.tgXS = {}), hd = rtHolder(ro), cur = hd.to;
  var sub = function(k){ return k === cur ? 'has it now' : k === "tech" ? (ro.assignedTech || 'pick who') : (rtPerson(k) || RT_DEPT[k]); };
  var desks = '<span class="tg-lbl top">To</span><div class="tg-desks">' + TG_DESKS.map(function(k, i){ var dis = k === cur && k !== "tech"; return '<button class="tg-dsk' + (A.to === k ? ' on' : '') + (dis ? ' cur' : '') + '" data-action="tg-xf" data-f="to" data-v="' + k + '"' + (dis ? ' disabled' : '') + '><span class="tg-role">' + RT_AB[k] + '</span><b>' + RT_LBL[k] + '</b><small>' + esc(sub(k)) + '</small>' + (A.to ? '' : '<span class="tg-kbd">' + (i + 1) + '</span>') + '</button>'; }).join('') + '</div>';
  if(!A.to) return '<div class="tg-pop xf" data-tg-keep' + style + '>' + head("Transfer") + desks + '<div class="tg-goal">' + tgI("clock", 12) + 'With ' + esc(rtHolderName(hd, ro)) + ' for ' + tgDur(tgHold(ro).held) + ' — pick a desk (1–6)</div></div>';
  var g = rtGoalMs(A.to); if(A.back === undefined) A.back = Date.now() + g;
  var techs = A.to === "tech" ? '<span class="tg-lbl top">Who</span><div class="tg-r">' + rtTechs().map(function(n){ return '<button class="tg-chip' + (A.who && techSame(A.who, n) ? ' on' : '') + '" data-action="tg-xf" data-f="who" data-v="' + esc(n) + '">' + esc(n) + '</button>'; }).join('') + '</div>' : '';
  var why = '<span class="tg-lbl top">Why</span><div class="tg-r">' + TG_WHY[A.to].map(function(x, i){ return '<button class="tg-chip' + (A.why === x ? ' on' : '') + '" data-action="tg-xf" data-f="why" data-v="' + esc(x) + '"><span class="tg-kbd">' + (i + 1) + '</span>' + esc(x) + '</button>'; }).join('') + '</div><input class="tg-wide" data-no-draft data-tg-in="xf-note" placeholder="Note (optional)" value="' + esc(A.note || "") + '">';
  var bo = [["Goal · " + tgDur(g), Date.now() + g], ["In 1 h", Date.now() + 3600000], ["End of day", tgWhenOpts()[3][1]], ["Tomorrow", tgWhenOpts()[4][1]], ["No time", null]];
  var back = '<span class="tg-lbl top">Back by</span><div class="tg-r tg-when">' + bo.map(function(o, i){ var on = o[1] === null ? A.back === null : A.back != null && Math.abs(A.back - o[1]) < 120000; return '<button class="tg-chip' + (on ? ' on' : '') + '" data-action="tg-xf" data-f="back" data-v="' + (o[1] === null ? 'none' : Math.round(o[1])) + '">' + (o[1] === null ? o[0] : tgWhen(o[1]) + ' <small>' + o[0] + '</small>') + '</button>'; }).join('') + '</div>';
  var goal = '<div class="tg-goal">' + tgI("clock", 12) + 'Goal ' + tgDur(g) + ' · Held too long after ' + tgDur(2 * g) + (A.back != null ? ' or at ' + tgWhen(A.back) : '') + '</div>';
  var nm = A.to === "tech" ? (A.who ? tgFirst(A.who) : "") : RT_LBL[A.to];
  var ok = A.why && (A.to !== "tech" || A.who);
  return '<div class="tg-pop xf" data-tg-keep' + style + '>' + head("Transfer") + desks + techs + why + back + goal + '<div class="tg-acts"><span class="hint">1–3 why · ⌫ desk' + (rtCfg().needAccept ? ' · they accept it' : '') + '</span><button class="btn btn-sm btn-primary" data-action="tg-xf-go"' + (ok ? '' : ' disabled') + '>' + tgI("swap", 13) + 'Transfer' + (nm ? ' to ' + esc(nm) : '') + '<span class="tg-kbd">↵</span></button></div></div>';
}

/* ---------- search: where is it? ---------- */
function tgVin(ro){ return String(ro.vin || "").toUpperCase(); }
function tgFind(q){
  q = String(q || "").trim().toLowerCase().replace(/^(where('?s| is)?|unit|ro|truck|vin)\s+/, "").trim(); if(!q) return { q: q, L: [], R: [] };
  var sc = function(ro){ var sp = tgSpotOf(ro), sl = sp ? tgSpotLbl(sp).toLowerCase() : "", n = String(ro.roNumber || "").toLowerCase(), u = String(ro.unitNumber || "").toLowerCase(), v = tgVin(ro).toLowerCase(), c = String(ro.customerName || "").toLowerCase();
    if(sl && sl === q) return 100; if(sp && sp.toLowerCase() === q) return 100; if(u === q) return 90; if(n.replace(/\D/g, "").indexOf(q.replace(/\D/g, "")) === 0 && /\d/.test(q)) return 80; if(n.indexOf(q) > -1) return 78;
    if(q.length >= 4 && v.indexOf(q) > -1) return 75; if(c.split(/\s+/).some(function(w){ return w.indexOf(q) === 0; })) return 60; if(c.indexOf(q) > -1) return 40; if(u.indexOf(q) > -1) return 30; return 0; };
  var L = tgYard().map(function(r){ return [r, sc(r)]; }).filter(function(x){ return x[1]; }).sort(function(a, b){ return b[1] - a[1]; }).slice(0, 6).map(function(x){ return x[0]; });
  var R = tyReleasedToday().filter(function(r){ return String(r.roNumber || "").toLowerCase().indexOf(q) > -1 || String(r.customerName || "").toLowerCase().indexOf(q) > -1 || String(r.unitNumber || "").toLowerCase() === q; });
  return { q: q, L: L, R: R };
}
function tgSrRow(ro, i, q){ var arr = tyCat(ro) === "arr", vm = q.length >= 4 && tgVin(ro).toLowerCase().indexOf(q) > -1, um = String(ro.unitNumber || "").toLowerCase() === q, sp = tgSpotOf(ro);
  var wh = arr ? '<span class="wh arr"><span class="w1">' + tgI("inArrow", 13) + (tgEta(ro).eta ? 'Arriving ~' + tgWhen(tgEta(ro).eta) : 'Waiting arrival') + '</span><span class="w2">held ' + esc(tgSpotLbl(sp)) + '</span></span>'
    : '<span class="wh"><span class="w1">' + tgI("pin", 13) + esc(sp ? tgZone(sp) : (ro.location || "No spot")) + (sp ? ' <b class="tg-no">' + esc(tgSpotLbl(sp)) + '</b>' : '') + '</span><span class="w2">Key tag <b class="tg-no">' + esc(ro.keyTag || "—") + '</b></span></span>';
  return '<div class="tg-sr' + (i === (UI.tgSri || 0) ? ' k' : '') + '" data-action="tg-sr-pick" data-ro="' + ro.id + '">' + tgSq(tyCat(ro)) + '<b class="tg-no">' + esc(tgNum(ro)) + '</b><b class="cu">' + esc(ro.customerName || "") + '</b><small>' + (um ? '<mark>Unit ' + esc(ro.unitNumber) + '</mark>' : 'Unit ' + esc(ro.unitNumber || "—")) + ' · ' + (vm ? 'VIN …<mark>' + esc(tgVin(ro).slice(-6)) + '</mark>' : esc(tgCatLbl(ro))) + '</small>' + wh + '<button class="btn btn-sm ib tg-sry" data-action="tg-sr-yard" data-ro="' + ro.id + '" title="Show on the yard  ⇧↵">' + tgI("pin", 14) + '</button></div>'; }
function tgSearchHtml(){
  var raw = UI.tgQ || "", F = tgFind(raw), q = F.q;
  var ft = '<div class="tg-pft"><span><span class="tg-kbd">↑</span><span class="tg-kbd">↓</span> move</span><span><span class="tg-kbd">↵</span> open</span><span><span class="tg-kbd">⇧</span><span class="tg-kbd">↵</span> show on the yard</span><span><span class="tg-kbd">Esc</span> close</span></div>';
  if(!q){ var rc = tgFlat().slice(0, 4).map(tgRoById).filter(Boolean), nx = tgYard().filter(function(r){ return tyCat(r) === "arr"; }).slice(0, 2), i = 0;
    return '<div class="h">Recent</div>' + rc.map(function(r){ return tgSrRow(r, i++, ""); }).join('') + (nx.length ? '<div class="h">Arriving next</div>' + nx.map(function(r){ return tgSrRow(r, i++, ""); }).join('') : '') + ft; }
  if(!F.L.length && !F.R.length) return '<div class="nores">No RO, unit, customer, VIN or spot matches “' + esc(raw) + '”.</div>' + ft;
  return (F.L.length ? '<div class="h">' + F.L.length + ' on the yard</div>' : '') + F.L.map(function(r, i){ return tgSrRow(r, i, q); }).join('')
    + (F.R.length ? '<div class="h">Released today</div>' + F.R.map(function(r){ var rr = r.releaseRec; return '<div class="tg-sr rel"><b class="tg-no">' + esc(tgNum(r)) + '</b><b class="cu">' + esc(r.customerName || "") + '</b><span class="wh"><span class="w1">Released ' + fmtTime(r.status && r.status.setAt) + '</span>' + (rr && rr.to ? '<span class="w2">to ' + esc(rr.to) + '</span>' : '') + '</span></div>'; }).join('') : '') + ft;
}

/* ============================== doing things ============================== */
function tgAfterAct(id, before){ var L = tgFlat(), i = before.indexOf(id); if(L.indexOf(UI.tgSel) < 0) UI.tgSel = L.length ? L[Math.min(Math.max(i, 0), L.length - 1)] : UI.tgSel; }
function tgDo(id){ var x = tgItemOf(id); if(!x) return; UI.tgSel = id;
  if(x.act === "log") tgOpenPop("log", id); else if(x.act === "release") tgOpenPop("release", id); else if(x.act === "assign") tgOpenPop("assign", id); else if(x.act === "checkin") tgOpenPop("checkin", id);
  else if(x.act === "nudge") tgNudge(getRO(id)); else if(x.act === "accept") tgAccept(getRO(id)); else if(x.act === "clash"){ UI.tgView = "yard"; UI.tgClash = x.spot; UI.yardPick = null; render(); } }
function tgOpenPop(type, id){ var ro = tgRoById(id); if(!ro) return; if(type === "snooze" && !tgItemOf(id)) return;
  UI.tgSel = id; UI.tgPop = { type: type, ro: id, i: 0 }; UI.tgPopTop = null; UI.tgSrch = false;
  if(type === "log") UI.tgLFP = { kind: "Call", out: null, when: null, note: "" };
  if(type === "release") UI.tgRL = {}; if(type === "xfer") UI.tgXS = {};
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
  var handBad = RELEASE_CHECK.filter(function(x){ return x[0] !== "road" && !rs[x[0]]; });
  if((bad.length || handBad.length) && !any) return; if(any && !A.reason) return;
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
  pushToast(any ? "Released anyway — " + ro.releaseRec.override.open.join(", ").toLowerCase() + " still open · “" + A.reason + "”" : "Released" + (who ? " to " + who : "") + (ro.keyTag ? " · key tag " + ro.keyTag : "") + " · " + (tgSpotLbl(ro.releaseRec.spot) || "spot") + " is free" + (A.text ? " · ready text copied" : ""), true);
}
function tgXferGo(){
  var ro = tgRoById((UI.tgPop || {}).ro), A = UI.tgXS || {}; if(!ro || !A.to || !A.why || (A.to === "tech" && !A.who)) return;
  var before = tgFlat(), was = !!tgItemOf(ro.id);
  pushUndo("transfer");
  rtSend(ro, A.to, A.to === "tech" ? A.who : null, A.note || "", null, { reason: A.why });
  if(A.back != null && ro.route){ ro.route.back = new Date(A.back).toISOString(); var hs = ro.handoffs || [], last = hs[hs.length - 1]; if(last) last.back = ro.route.back; }
  delete ro.tgSnz; if(was && !tgItemOf(ro.id)) tgClear(ro, "swap", "To " + RT_LBL[A.to]);
  UI.tgPop = null; UI.tgXS = null; tgAfterAct(ro.id, before); scheduleSave(true);
  pushToast(roLabel(ro) + " to " + (A.to === "tech" ? A.who : RT_LBL[A.to]) + " · " + A.why + (A.back != null ? " · back by " + tgWhen(A.back) : "") + (ro.route && ro.route.state === "pending" ? " — waiting for them to accept." : "."), true);
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
    case "tg-srch": UI.tgSrch = !UI.tgSrch; UI.tgQ = ""; UI.tgSri = 0; UI.tgPop = null; render(); if(UI.tgSrch) setTimeout(function(){ var q = document.getElementById("tg-q"); if(q) q.focus(); }, 0); return true;
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
    case "tg-xf": { var X = UI.tgXS || (UI.tgXS = {}), f2 = t.dataset.f, v2 = t.dataset.v;
      if(f2 === "to"){ X.to = v2; X.why = null; X.back = undefined; X.who = v2 === "tech" ? (tgRoById(P.ro) || {}).assignedTech || null : null; }
      else if(f2 === "why") X.why = v2; else if(f2 === "who") X.who = v2; else if(f2 === "back") X.back = v2 === "none" ? null : +v2;
      render(); return true; }
    case "tg-xf-go": tgXferGo(); return true;
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
  if(UI.view !== "triage" || UI.palette) return;
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
      var X = UI.tgXS || {};
      if(k === "Enter"){ tgXferGo(); return stop(); }
      if(inF) return;
      var n2 = +k; if(!X.to && n2 >= 1 && n2 <= 6){ var dk = TG_DESKS[n2 - 1], ro2 = tgRoById(P.ro); if(!(dk === rtHolder(ro2).to && dk !== "tech")){ UI.tgXS = { to: dk, who: dk === "tech" ? ro2.assignedTech || null : null }; render(); } return stop(); }
      if(X.to && n2 >= 1 && n2 <= TG_WHY[X.to].length){ X.why = TG_WHY[X.to][n2 - 1]; render(); return stop(); }
      if(X.to && k === "Backspace"){ UI.tgXS = {}; render(); return stop(); }
      return stop();
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
  if(k === "/"){ UI.tgSrch = true; UI.tgQ = ""; UI.tgSri = 0; render(); setTimeout(function(){ var q = document.getElementById("tg-q"); if(q) q.focus(); }, 0); return stop(); }
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
