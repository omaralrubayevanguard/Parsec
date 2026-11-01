/* Parsec · pages/triage · model.js
   Triage's model: icons and groups, small helpers (tgNum, roShortNo — an RO goes by its last 4 digits), who has an RO and for how long, ETA from the contact log, late, people and text templates, clashes, Needs action.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   tgI tgSi tgSq tgMoney tgDur tgShortDur tgWhen roShortNo roLabelFull tgNum tgYard tgSpotLbl … (55 functions, 14 constants)
   state      customers ros tgCleared tgShop tgTemplates
   uses       access/ data/ kit/ pages/ ro/ state/
*/
/* ============================== TRIAGE — the action inbox ==============================
   Needs action on the left, always. The header switch shows the selected RO three ways:
   Inbox (the customer conversation), Desk (one RO at a time) and Yard (where every truck is).
   Snooze from the outcome, keyboard triage, Cleared today, All caught up; who to call,
   text templates, approvals with a record; release with checks, transfers with a reason;
   drag a truck onto a spot, arrival countdown from the call log, spot clashes; facts that
   filter, a late badge on the nav, and search that answers "where's my truck?". */
var TG_IC = {"chat": "<path d=\"M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25H11.5L7 20v-3.5h-.25A2.25 2.25 0 0 1 4.5 14.25z\"/>", "check": "<path d=\"M5 12.5l4.5 4.5L19 7.5\"/>", "chevD": "<path d=\"M6.5 9.5L12 15l5.5-5.5\"/>", "chevR": "<path d=\"M9.5 6.5L15 12l-5.5 5.5\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>", "copy": "<rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2.5\"/><path d=\"M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"/>", "doc": "<path d=\"M6.5 3.75h7l4.75 4.75v10.25a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 18.75V5.25a1.5 1.5 0 0 1 1.5-1.5z\"/><path d=\"M13.5 3.75V8.5h4.75\"/>", "flag": "<path d=\"M6 20.5V4.5M6 5h10.5l-2 3.75 2 3.75H6\"/>", "grid": "<rect x=\"4\" y=\"4\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/><rect x=\"13.5\" y=\"4\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/><rect x=\"4\" y=\"13.5\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/><rect x=\"13.5\" y=\"13.5\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/>", "inArrow": "<path d=\"M19.5 12h-11M12.5 7.5L8 12l4.5 4.5M4.5 5v14\"/>", "inbox": "<path d=\"M3.75 13.5l2.6-7.1A1.5 1.5 0 0 1 7.76 5.4h8.48a1.5 1.5 0 0 1 1.41 1l2.6 7.1v4.75a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5z\"/><path d=\"M3.75 13.5h4.5l1.25 2h5l1.25-2h4.5\"/>", "key": "<circle cx=\"8\" cy=\"15.5\" r=\"4\"/><path d=\"M10.9 12.6l8.6-8.6M16.5 7l2.5 2.5M14 9.5l2 2\"/>", "mail": "<rect x=\"3.75\" y=\"5.75\" width=\"16.5\" height=\"12.5\" rx=\"2.25\"/><path d=\"M4.5 7.25l7.5 5.75 7.5-5.75\"/>", "phone": "<path d=\"M6.2 4.5h2.6l1.4 3.6-1.9 1.3a10.5 10.5 0 0 0 5.3 5.3l1.3-1.9 3.6 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A14 14 0 0 1 4.6 6.2a1.6 1.6 0 0 1 1.6-1.7z\"/>", "pin": "<path d=\"M12 20.5s-6-5.6-6-10.25a6 6 0 0 1 12 0C18 14.9 12 20.5 12 20.5z\"/><circle cx=\"12\" cy=\"10.25\" r=\"2.25\"/>", "plus": "<path d=\"M12 5v14M5 12h14\"/>", "release": "<path d=\"M4.5 12h11M11.5 7.5L16 12l-4.5 4.5M19.5 5v14\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M16 16l4.5 4.5\"/>", "shield": "<path d=\"M12 3.5l7 2.75v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9v-5.5z\"/><path d=\"M8.9 12.1l2.2 2.2 4.1-4.4\"/>", "swap": "<path d=\"M7 7.5h12.5L16 4M17 16.5H4.5L8 20\"/>", "trash": "<path d=\"M4.5 6.5h15M9.5 6.5V4.75h5V6.5M6.5 6.5l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3l.9-12.2M10 10.5v5.5M14 10.5v5.5\"/>", "user": "<circle cx=\"12\" cy=\"8\" r=\"3.75\"/><path d=\"M4.75 20c.6-3.6 3.6-5.75 7.25-5.75s6.65 2.15 7.25 5.75\"/>", "userPlus": "<circle cx=\"10\" cy=\"8\" r=\"3.5\"/><path d=\"M3.75 19.5c.6-3.4 3.2-5.25 6.25-5.25s5.65 1.85 6.25 5.25M18.5 7.5v5M16 10h5\"/>", "x": "<path d=\"M6 6l12 12M18 6L6 18\"/>"};
TG_IC.list = '<path d="M9 6.5h10.5M9 12h10.5M9 17.5h10.5"/><circle cx="5" cy="6.5" r="1.1"/><circle cx="5" cy="12" r="1.1"/><circle cx="5" cy="17.5" r="1.1"/>';   /* Parsec 14.3 */
var TG_CAT = { arr: ["Arriving", "var(--tg-ink4)"], chk: ["Checked in", "var(--tg-st-support)"], apr: ["Awaiting approval", "var(--tg-st-customer)"],
  wrk: ["In repair", "var(--tg-st-working)"], rdy: ["Ready to release", "var(--tg-ink)"], rel: ["Released", "var(--tg-ink3)"] };
var TG_GROUPS = [["sent", "Sent to you"], ["cust", "Waiting on customers"], ["road", "Road test"], ["checks", "Truck checks"], ["go", "Ready to go"], ["held", "Held too long"], ["in", "Coming in"]];
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
var TG_KEYS = [["J  K   or  \u2191 \u2193", "Move through Needs action"], ["\u21b5", "Do the item\u2019s action \u2014 Accept, Call back, Release, Assign\u2026"], ["S", "Snooze the item"],
  ["C", "Log a call, text or email"], ["T", "Transfer to another desk, with a reason"], ["M", "Move the truck (Yard view)"], ["1  2  3", "Inbox \u00b7 Desk \u00b7 Yard"],
  ["/", "Search \u2014 RO, unit, customer, VIN or spot"], ["1 \u2013 6", "In a popover: pick the outcome, the desk or the reason"], ["Esc", "Close the popover, or clear the filter"], ["Ctrl+Z", "Undo"], ["?", "This list"]];

/* ---------- small helpers ---------- */
function tgI(n, s){ var p = TG_IC[n]; return p ? '<svg class="tg-ic" viewBox="0 0 24 24" width="' + (s || 16) + '" height="' + (s || 16) + '" aria-hidden="true">' + p + '</svg>' : ''; }
function tgSi(ro){ return pgStIcon("ro", roStFor(ro)); }   /* Parsec 14 */
function tgSq(c){ return '<i class="tg-sq" style="background:' + (TG_CAT[c] || TG_CAT.wrk)[1] + '"></i>'; }
function tgMoney(n){ n = Math.round(+n || 0); return (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US"); }
function tgDur(ms){ if(ms == null) return "—"; var m = Math.round(ms / 60000); if(m < 60) return m + " min"; var h = ms / 3600000; if(h < 48) return (h < 10 ? (Math.round(h * 10) / 10) : Math.round(h)) + " h"; return Math.round(h / 24) + " d"; }
function tgShortDur(ms){ var m = Math.round(ms / 60000); return m < 60 ? m + "m" : tgDur(ms).replace(" ", ""); }
function tgWhen(ms){ var d = new Date(ms), n = new Date(); var t = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  if(d.toDateString() === n.toDateString()) return t; return d.toLocaleDateString(undefined, { weekday: "short" }) + " " + t; }
function roShortNo(n){ n = String(n == null ? "" : n).trim(); var d = n.replace(/\D/g, ""); return d.length > 4 ? d.slice(-4) : (n.replace(/^R[AO][\s-]*/i, "") || n || "?"); }   /* Parsec 11.3: an RO goes by its last 4 digits */
function roLabelFull(ro){ var n = String((ro && ro.roNumber) || "?"); return /^RO\b/i.test(n) ? n : "RO " + n; }   /* the full number: the open RO, prints and copies */
function tgNum(ro){ return roShortNo((ro && ro.roNumber) || "?"); }
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
function tgStTxt(ro){ var s = roStatus(ro); return roStShown(ro) + (s.sub ? " · " + s.sub.charAt(0) + s.sub.slice(1).toLowerCase() : ""); }   /* Parsec 14 */
function tgMe(){ var n = punchByName(); return n || "Admin"; }
function tgFirst(n){ return String(n || "").trim().split(/\s+/)[0] || ""; }
function tgIni(n){ return String(n || "?").trim().split(/\s+/).map(function(x){ return x[0] || ""; }).join("").slice(0, 2).toUpperCase(); }
function tgFlat(){ var G = tgGrouped(); return TG_GROUPS.reduce(function(a, g){ return a.concat(G[g[0]].map(function(x){ return x.ro.id; })); }, []); }
function tgRoById(id){ var r = getRO(id); return r && r.id !== SHOP_RO_ID && !r.shop ? r : null; }

/* ---------- who has it, and for how long ---------- */
function tgHold(ro){ var hd = rtHolder(ro), since = rtHeldSince(ro), held = since ? ageSince(since) || 0 : 0;
  return { to: hd.to, who: rtHolderName(hd, ro), held: held, goal: rtGoalMs(hd.to) }; }
function tgHeld(ro){ var h = tgHold(ro), over = h.held > h.goal;
  return '<span class="tg-held' + (over ? ' over' : h.held > h.goal * .75 ? ' soon' : '') + '" title="With ' + esc(h.who) + ' · goal ' + tgDur(h.goal) + '"><span class="tg-role">' + RT_AB[h.to] + '</span><span class="m"><i style="width:' + Math.min(100, h.held / h.goal * 100).toFixed(0) + '%"></i></span>' + tgShortDur(h.held) + ' / ' + tgShortDur(h.goal) + '</span>'; }
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
  var due = ""; raLive(ro).forEach(function(op){ opRealParts(op).forEach(function(pt){ if(!due && pt.eta && !pxPartIn(pt)) due = pt.eta; }); });
  var M = null; try{ M = roStages(ro); }catch(e){}
  var sh = tgShop();
  return { first: p ? tgFirst(p.n) : "there", me: tgFirst(tgMe()), shop: sh.name || "", unit: ro.unitNumber || "", ro: roLabel(ro), ops: list,
    total: tgMoney(sum || roMoney(ro).total), spot: tgSpotOf(ro) ? tgZone(tgSpotOf(ro)) + " " + tgSpotLbl(tgSpotOf(ro)) : (ro.location || ""),
    due: due || "later this week", ready: M && M.likely ? tgWhen(+new Date(M.likely)) : "", phone: sh.phone || "" };
}
function tgFill(t, ro, p){ var m = tgTokMap(ro, p); return String(t || "").replace(/\{(\w+)\}/g, function(x, k){ return m[k] ? m[k] : "[" + (k === "shop" ? "shop name" : k === "phone" ? "shop phone" : k) + "]"; }); }
function tgFillHtml(t, ro, p){ var m = tgTokMap(ro, p);
  return String(t || "").split(/(\{\w+\})/).map(function(s){ var k = (s.match(/^\{(\w+)\}$/) || [])[1]; if(!k) return esc(s);
    return m[k] ? '<mark>' + esc(m[k]) + '</mark>' : '<mark class="miss" title="Set it in Settings › The shop">[' + (k === "shop" ? "shop name" : k === "phone" ? "shop phone" : k) + ']</mark>'; }).join(""); }

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
    else if((it = trxNeed(ro, c, lt, a))){}
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
