/* Parsec · pages/warranty · page.js
   The Warranty page: header, Needs action on the left, the selected RO, Claims, Board, Money, the failed-parts shelf.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   waView waChip waJt waRoSt waHead waSearchHtml waList waTop waVClaims waAskBtn waFixBtn waPacket … (20 functions)
   uses       access/ data/ kit/ library/ pages/ pages/triage/ ro/ shell/ state/ trucks/
*/
/* ============================== the page ============================== */
function waView(){
  waIcons(); waNcClear();
  if(UI.wcRo){ UI.waSel = UI.wcRo; UI.wcRo = null; UI.waView = "claims"; UI.waOp = null; }   /* the RO page's "Claim ·" link */
  if(!UI.waView) UI.waView = "claims"; if(!UI.waOpen) UI.waOpen = {};
  var sel = waSel(), v = UI.waView;
  var body = v === "board" ? waVBoard(sel) : v === "money" ? waVMoney() : v === "parts" ? waVParts() : waVClaims(sel);
  return '<div class="tg wa" data-key="wa">' + waHead() + '<div class="tg-body v-' + v + '">' + waList() + '<div class="tg-main" data-key="wa-main-' + v + '">' + body + '</div>' + waPopHtml() + '</div>' + (UI.waStmt ? waStmtHtml() : '') + (UI.waPrint ? waPrintHtml() : '') + '</div>';
}
function waChip(s){ var t = WC_ST[s] || WC_ST.repair; return pgSt('claim', t.l, { cls: 'sm wa-claimst' }); }   /* Parsec 14: one status look */
function waJt(op){ var r = opJobType(op) === "RECALL"; return '<span class="wa-jt' + (r ? ' recall' : '') + '">' + (r ? 'RECALL' : 'WARRANTY') + '</span>'; }
function waRoSt(ro){ var b = null; wcOps(ro).forEach(function(op){ var s = waSt(ro, op); if(b === null || (WC_RANK[s] || 0) < (WC_RANK[b] || 0)) b = s; }); return b || "repair"; }
function waHead(){
  var all = waNeedsAll().filter(function(x){ return !waSnoozed(x.ro); }), cnt = function(k){ var o = UI.waFilter; UI.waFilter = k; var n = all.filter(waMatch).length; UI.waFilter = o; return n; };
  var open = waRos().filter(function(ro){ return wcOps(ro).some(function(op){ return WA_CLOSED.indexOf(waSt(ro, op)) < 0; }); }).length, wsum = waWaiting().reduce(function(a, x){ return a + waAmt(x.op); }, 0);
  var f = function(k, txt, w){ var c = cnt(k), o = UI.waFilter === k; return '<button class="tg-hf' + (w && c ? ' w' : '') + (o ? ' on' : '') + '" data-action="wa-filt" data-k="' + k + '" title="' + (o ? 'Clear the filter' : 'Show only these in Needs action') + '"><b>' + c + '</b>' + txt + (o ? tgI("x", 12) : '') + '</button>'; };
  var views = [["claims", "warranty", "Claims"], ["board", "board", "Board"], ["money", "dollar", "Money"], ["parts", "parts", "Parts"]];
  var search = psmBtn("warranty", "Search — RO, claim #, VIN, customer or code");   /* Parsec 13.1 — the icon opens the search window */
  return '<header class="tg-head" data-key="wa-head"><h1 class="tg-h1">Warranty</h1><span class="tg-facts"><button class="tg-hf wa-o1" data-action="wa-filt" data-k="" title="Show everything"><b>' + open + '</b>open claims</button><i class="wa-o1">·</i>'
    + f("ready", "ready to file") + '<i>·</i>' + f("back", "returned", true) + '<i>·</i>' + f("due", "due this week", true) + '<i class="wa-o2">·</i><span class="tg-hf wa-o2" style="cursor:default" title="Filed, approved or appealed — not paid yet"><b>' + waUsd0(wsum) + '</b>waiting on Volvo</span><i>·</i>' + f("late", "late", true) + '</span>'
    + '<div class="tg-views" role="tablist">' + views.map(function(x, i){ return '<button role="tab" class="' + (UI.waView === x[0] ? 'on' : '') + '" data-action="wa-view" data-v="' + x[0] + '" title="' + x[2] + ' (' + (i + 1) + ')">' + tgI(x[1], 14) + x[2] + '</button>'; }).join('') + '</div>'
    + '<span class="tg-hsep"></span>' + search
    + '<button class="btn ib tg-srch-b" data-action="wa-stmt" title="Payment statement — mark several claims paid at once" aria-label="Payment statement">' + tgI("receipt", 16) + '</button>'
    + '<button class="btn ib tg-srch-b" data-action="wa-pop" data-p="rets" title="Why claims came back" aria-label="Why claims came back">' + tgI("chart", 16) + '</button>'
    + '<button class="btn ib tg-srch-b" data-action="wa-pop" data-p="cfg" title="Warranty settings — deadlines, chase-after times, coverage terms" aria-label="Warranty settings">' + tgI("gear", 16) + '</button>'
    + (UI.waSrch ? '<div class="tg-srpop" data-wa-keep>' + waSearchHtml() + '</div>' : '') + '</header>';
}
function waSearchHtml(){
  var q = String(UI.waQ || "").trim().toLowerCase(), hay = function(ro){ return [ro.roNumber, ro.customerName, ro.vin, ro.unitNumber, ro.caseNumber].concat(wcOps(ro).map(function(op){ var c = op.claim || {}; return [op.complaint, c.claimNo, waFail(op)].join(" "); })).join(" ").toLowerCase(); };
  var L = q ? waRos().filter(function(ro){ var h = hay(ro); return q.split(/\s+/).every(function(w){ return h.indexOf(w) > -1; }); }).slice(0, 7) : waFlat().slice(0, 5).map(getRO).filter(Boolean);
  var row = function(ro, i){ var c = wcOps(ro).map(function(op){ return (op.claim || {}).claimNo; }).filter(Boolean).join(" · ");
    return '<div class="tg-sr' + (i === (UI.waSri || 0) ? ' k' : '') + '" data-action="wa-sr-pick" data-ro="' + ro.id + '"><b class="tg-no">' + esc(tgNum(ro)) + '</b><b class="cu">' + esc(ro.customerName || "") + '</b><small>' + esc(c || "no claim # yet") + '</small><span class="wh"><span class="w1">' + esc((wcOps(ro)[0] || {}).complaint || "") + '</span><span class="w2">' + waChip(waRoSt(ro)) + '</span></span></div>'; };
  return '<div class="h">' + (q ? L.length + ' claim' + (L.length === 1 ? '' : 's') : 'In Needs action') + '</div>' + (L.length ? L.map(row).join('') : '<div class="nores">Nothing matches “' + esc(UI.waQ) + '”.</div>')
    + '<div class="tg-pft"><span><span class="tg-kbd">↑</span><span class="tg-kbd">↓</span> move</span><span><span class="tg-kbd">↵</span> open</span><span><span class="tg-kbd">Esc</span> close</span></div>';
}

/* ---------- left: Needs action ---------- */
function waList(){
  var G = waGrouped(), L = waFlat(), sel = UI.waSel, kb = !!UI.waKB, cl = waClearedList();
  var sn = waRos().filter(function(r){ return r.waSnz && new Date(r.waSnz.until) > new Date(); }).sort(function(a, b){ return new Date(a.waSnz.until) - new Date(b.waSnz.until); });
  var away = waRos().filter(function(r){ var w = r.waAway; return w && r.route && r.route.to === w.to && r.route.at === w.at; });
  var item = function(x){ var ro = x.ro, on = ro.id === sel, multi = wcOps(ro).length > 1 && x.op, n = multi ? raN(ro, x.op) : null, b = waBack(ro);
    return '<div class="tg-it' + (on ? ' on' : '') + (on && kb ? ' kb' : '') + '" data-action="wa-sel" data-ro="' + ro.id + '">' + (x.late ? '<i class="tg-dot"></i>' : '')
      + '<span class="tg-gi">' + tgI(x.ic, 15) + '</span><span class="tg-t"><b class="tg-no">' + esc(tgNum(ro)) + '</b><b class="tg-cu">' + esc(ro.customerName || "") + '</b>'
      + (b && x.g !== "sent" ? '<span class="tg-back">' + tgI("history", 11) + 'Comeback</span>' : '') + (multi ? '<span class="tg-spot">op ' + n + '</span>' : '')
      + (x.due != null && (x.due <= 7 || x.g === "back" || x.g === "part") ? waDue(x.due) : '') + '</span>'
      + '<span class="tg-w' + (x.late ? ' late' : '') + '">' + esc(x.why) + '</span>'
      + '<button class="btn btn-sm ib tg-snz" data-action="wa-pop" data-p="snooze" data-ro="' + ro.id + '" title="Snooze  (S)">' + tgI("clock", 15) + '</button>'
      + '<button class="btn btn-sm' + (["file", "decide", "ask"].indexOf(x.act) > -1 ? ' btn-primary' : '') + ' tg-go" data-action="wa-do" data-ro="' + ro.id + '">' + esc(x.btn) + (on && kb ? '<span class="tg-kbd">↵</span>' : '') + '</button></div>'; };
  var body;
  if(!L.length) body = UI.waFilter ? '<div class="tg-empty"><span class="tg-ring0">' + tgI("check", 22) + '</span><h3>Nothing here</h3><p>No claim in Needs action matches.</p><button class="btn btn-sm" data-action="wa-filt" data-k="">Clear filter</button></div>'
    : '<div class="tg-empty"><span class="tg-ring0 ok">' + tgI("check", 22) + '</span><h3>All caught up</h3><p>' + (waRos().length ? 'Nothing to file, fix or chase.' : 'ROs with a warranty or recall operation land here.') + '</p></div>';
  else body = WA_GROUPS.filter(function(g){ return G[g[0]].length; }).map(function(g){ return '<div class="tg-grp">' + g[1] + '<span>' + G[g[0]].length + '</span></div>' + G[g[0]].map(item).join(''); }).join('');
  var ws = sn.concat(away.filter(function(r){ return sn.indexOf(r) < 0; }));
  if(ws.length) body += '<div class="tg-sec' + (UI.waOpen.snz ? ' open' : '') + '" data-action="wa-open" data-k="snz">' + tgI("chevR", 12) + '<span>Snoozed or with others</span><span class="n">' + ws.length + '</span></div>'
    + (UI.waOpen.snz ? '<div class="tg-rows">' + ws.map(function(r){ var a = r.waAway && !(r.waSnz && new Date(r.waSnz.until) > new Date()); return '<div class="tg-row" data-action="wa-sel" data-ro="' + r.id + '"><time>' + (a ? esc(RT_AB[r.waAway.to] || "") : tgWhen(+new Date(r.waSnz.until))) + '</time><b class="tg-no">' + esc(tgNum(r)) + '</b><b class="tg-cu">' + esc(r.customerName || "") + '</b><small>' + esc(a ? "With " + (RT_LBL[r.waAway.to] || r.waAway.to) + (r.waAway.why ? " · " + r.waAway.why : "") : (r.waSnz.why || "Snoozed")) + '</small><button class="btn btn-sm tg-gh" data-action="wa-wake" data-ro="' + r.id + '">' + (a ? 'Back' : 'Wake') + '</button></div>'; }).join('') + '</div>' : '');
  body += '<div class="tg-sec' + (UI.waOpen.clr ? ' open' : '') + '" data-action="wa-open" data-k="clr">' + tgI("chevR", 12) + '<span>Cleared today</span><span class="n">' + cl.length + '</span></div>'
    + (UI.waOpen.clr ? '<div class="tg-rows">' + (cl.length ? cl.slice().reverse().map(function(c){ return '<div class="tg-row done" data-action="wa-sel" data-ro="' + c.roId + '" title="' + esc(c.what) + '"><time>' + fmtTime(c.at) + '</time><b class="tg-no">' + esc(c.num) + '</b><b class="tg-cu">' + esc(c.cust) + '</b><small>' + tgI(c.ic || "check", 12) + esc(c.what) + '</small></div>'; }).join('') : '<div class="tg-none">Nothing yet today.</div>') + '</div>' : '');
  var x = waItemOf(sel), r0 = sel ? getRO(sel) : null;
  var out = L.length && r0 && L.indexOf(sel) < 0 ? '<div class="tg-out">Showing <b>' + esc(roLabel(r0) + ' · ' + (r0.customerName || "")) + '</b> — ' + (waSnoozed(r0) ? 'snoozed or with another desk.' : 'nothing waiting on it.') + '</div>' : '';
  var keys = '<div class="tg-keys"><span><span class="tg-kbd">J</span><span class="tg-kbd">K</span>move</span>' + (x ? '<span><span class="tg-kbd">↵</span><b>' + esc(x.btn) + '</b></span>' : '') + '<span><span class="tg-kbd">S</span>snooze</span><span><span class="tg-kbd">T</span>send to</span><span><span class="tg-kbd">C</span>copy</span><span class="sp"></span><button class="tg-link q" data-action="wa-help" title="All the keys">?</button></div>';
  return '<section class="tg-list" data-key="wa-list"><div class="tg-lh">Needs action<span class="n">' + L.length + '</span>' + (UI.waFilter ? '<button class="tg-fchip' + (UI.waFilter !== "ready" ? ' w' : '') + '" data-action="wa-filt" data-k="">' + ({ ready: "Ready to file", back: "Returned or denied", due: "Due this week", late: "Late" }[UI.waFilter] || "") + tgI("x", 11) + '</button>' : '')
    + '<button class="tg-done" data-action="wa-open" data-k="clr" data-force="1">' + tgI("check", 13) + cl.length + ' cleared today</button></div><div class="tg-scroll" data-scroll="wa-list">' + out + body + '</div>' + keys + '</section>';
}

/* ---------- the selected RO, at the top of Claims and Board ---------- */
function waTop(ro, big){
  var ops = wcOps(ro), s = waRoSt(ro), x = waItemOf(ro.id), st = ops.length ? Math.min.apply(null, ops.map(function(op){ var w = WC_ST[waSt(ro, op)] || WC_ST.repair; return w.i; })) : 0;
  var ret = ops.some(function(op){ return waSt(ro, op) === "returned"; }), den = ops.length && ops.every(function(op){ return waSt(ro, op) === "denied" || waSt(ro, op) === "written"; }), paidAll = ops.length && ops.every(function(op){ return waSt(ro, op) === "paid"; });
  var claimed = 0, paid = 0; ops.forEach(function(op){ var t = waSt(ro, op); if(t !== "repair" && t !== "ready") claimed += waAmt(op); paid += waPaid(op); });
  var stops = ["Repair", "Ready to file", "Submitted", "Approved", "Paid"];
  var trk = '<div class="wa-trk"><span class="ln"><i style="width:' + (st / 4 * 100) + '%"></i></span>' + stops.map(function(t, i){ var c = i < st ? 'done' : i === st ? 'cur' : '', l = t, g = i < st ? tgI("check", 10) : '';
      if(i === st && ret){ c = 'back'; l = 'Returned'; g = tgI("undo", 10); } else if(i === 4 && den){ c = 'den'; l = 'Denied'; g = tgI("x", 10); } else if(i === 4 && paidAll){ c = 'paid'; g = tgI("check", 10); }
      return '<span class="wa-stp ' + c + '"><span class="d">' + g + '</span>' + l + '</span>'; }).join('') + '</div>';
  var t = truckYM(ro), next = x ? x.why : !ops.length ? 'No warranty or recall operation on this RO yet.' : s === "repair" ? waCap(waTf(ro)) + ' is still on it — it comes here as Ready to file when the op is done.' : s === "submitted" ? 'Filed — waiting on Volvo.' : s === "appealed" ? 'Appeal sent — waiting on Volvo.' : s === "approved" ? 'Approved — waiting for the credit.' : s === "paid" ? 'Paid.' : s === "denied" ? 'Denied — decided.' : s === "written" ? 'Written off.' : s === "billed" ? 'Moved to customer pay.' : '';
  var fact = function(k, v, cls){ return '<div><small>' + k + '</small><span class="' + (cls || '') + '">' + (v ? esc(v) : '<i>—</i>') + '</span></div>'; };
  return '<div class="tg-top"><div class="r1"><b class="tg-no">' + esc(roLabelFull(ro)) + '</b>' + waChip(s) + '<span>·</span><span class="wa-eu">' + esc([ro.engineType, ro.unitNumber ? "Unit " + ro.unitNumber : "", t.line].filter(Boolean).join(" · ")) + '</span><span class="sp"></span>'
    + trxBtns(ro) + '<button class="btn btn-sm" data-action="wa-pop" data-p="xfer" data-ro="' + ro.id + '">' + tgI("swap", 14) + 'Send to…</button><button class="btn btn-sm" data-action="wa-open-ro" data-ro="' + ro.id + '">Open RO</button></div>'
    + '<h2>' + esc(ro.customerName || "No customer") + '</h2>'
    + (ops.length ? '<div class="wa-sum">' + trk + '<div class="wa-money"><small>' + (paid ? 'Paid' : 'Claimed') + '</small><b>' + (paid ? waUsd(paid) : claimed ? waUsd(claimed) : '—') + '</b></div></div>' : '')
    + (big ? '<div class="wa-facts">' + fact('VIN', ro.vin) + fact('Mileage', milesTxt(ro.mileage)) + fact('Engine hours', ro.engineHours) + fact('Warranty starts', cdDayShow(ro.warrantyStart)) + fact('Case #', ro.caseNumber || ro.techSupportCase) + fact('Technician', ro.assignedTech, 's') + '</div>' : '') + '</div>'
    + '<div class="tg-next" style="margin:14px 28px 0"><span class="k">Next</span><p>' + esc(next) + '</p>' + (x ? '<button class="btn btn-sm' + (["file", "decide", "ask"].indexOf(x.act) > -1 ? ' btn-primary' : '') + '" data-action="wa-do" data-ro="' + ro.id + '">' + esc(x.btn) + '<span class="tg-kbd">↵</span></button>' : '') + '</div>';
}

/* ---------- Claims ---------- */
function waVClaims(ro){
  if(!ro) return '<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">' + tgI("warranty", 22) + '</span><h3>No warranty work yet</h3><p>ROs with a warranty or recall operation land here. Only those operations come over — customer-pay work on the same RO stays on the RO.</p></div></div>';
  var ops = wcOps(ro), cust = raLive(ro).filter(function(op){ return !wcIsOp(ro, op); }), b = waBack(ro);
  var h = '<div class="wa-cl" data-scroll="wa-cl">' + waTop(ro, true) + '<div class="wa-pad">';
  if(b) h += '<div class="wa-line back">' + tgI("history", 14) + '<span><b>Comeback</b> — same unit back' + (b.days != null ? ' ' + b.days + ' days' : '') + ' after <b>' + esc(roLabel(b.prev)) + '</b>.' + (b.fix ? ' ' + esc(tgFirst(b.tech) || "The tech") + ': “' + esc(b.fix) + '”' : '') + (b.claim ? ' · claim <b>' + esc(b.claim) + '</b>' + (b.paid ? ' paid ' + waUsd(b.paid) : '') : '') + '</span>'
    + (b.claim ? '<button class="btn btn-sm" data-action="wa-copy1" data-v="' + esc(b.claim) + '">' + tgI("copy", 13) + esc(b.claim) + '</button>' : '') + '<button class="btn btn-sm tg-gh" data-action="wa-open-ro" data-ro="' + b.prev.id + '">Open ' + esc(roLabel(b.prev)) + '</button></div>';
  if(ro.route && ro.route.to === "warranty" && ro.route.note && !ops.length) h += '<div class="wa-line vol">' + tgI("inbox", 14) + '<span><b>' + esc(ro.route.by || "") + '</b>: ' + esc(ro.route.note) + '</span></div>';
  if(cust.length) h += '<div class="wa-note">' + tgI("info", 15) + '<span><b>' + cust.length + ' customer-pay operation' + (cust.length === 1 ? ' stays' : 's stay') + ' on the RO</b> and ' + (cust.length === 1 ? 'isn’t' : 'aren’t') + ' part of the claim: ' + esc(cust.map(function(o){ return o.complaint || "Operation"; }).join(" · ")) + '</span></div>';
  if(!ops.length) h += '<div class="wa-note">' + tgI("info", 15) + '<span>Mark an operation <b>WARR</b> or <b>RECALL</b> on the RO and it becomes a claim here.</span></div>';
  ops.forEach(function(op){ h += waOpCard(ro, op); });
  return h + '</div></div>';
}
function waAskBtn(ro, op){ return opDoneNow(op) && !(op.claim && op.claim.ask) ? ' <button class="wa-ask" data-action="wa-pop" data-p="ask" data-ro="' + ro.id + '" data-op="' + op.id + '">Ask ' + esc(waTf(ro)) + '</button>' : ''; }
function waFixBtn(ro, op, x){ if(!x.fix) return ''; var k = x.fix.split(":")[0], l = { srt: "Fix labor", cov: "Coverage…", ask: "Ask " + waTf(ro), causal: "Pick", field: "Add", upload: "Upload", tag: "Tag it" }[k];
  if(x.fix === "field:prev"){ var b = waBack(ro); l = "Add " + (b && b.claim ? b.claim : ""); }
  return '<button class="btn btn-sm" data-action="wa-fix" data-fix="' + x.fix + '" data-ro="' + ro.id + '" data-op="' + op.id + '">' + esc(l) + '</button>'; }
function waPacket(ro, op, live){
  var C = waChecks(ro, op), req = C.filter(function(x){ return x.req; }), done = req.filter(function(x){ return x.ok; }).length, full = done === req.length;
  var gaps = C.filter(function(x){ return x.req && !x.ok; }), opt = C.filter(function(x){ return !x.req && !x.ok; }), ok = C.filter(function(x){ return x.ok; });
  return '<div class="wa-pk' + (full ? ' full' : '') + '"><div class="wa-pk-h"><b>Packet</b><span>' + done + ' of ' + req.length + '</span><span class="m"><i style="width:' + (req.length ? done / req.length * 100 : 100).toFixed(0) + '%"></i></span>' + (full ? '<span class="okt">' + tgI("check", 12) + 'Everything Volvo asks for</span>' : '') + '</div>'
    + gaps.map(function(x){ return '<div class="wa-pk-r"><span class="i no">!</span><span class="t">' + esc(x.t) + '<small>' + esc(x.g) + '</small></span>' + (live ? waFixBtn(ro, op, x) : '') + '</div>'; }).join('')
    + opt.map(function(x){ return '<div class="wa-pk-r opt"><span class="i">' + tgI("plus", 11) + '</span><span class="t">' + esc(x.t) + '<small>optional</small></span>' + (live ? waFixBtn(ro, op, x) : '') + '</div>'; }).join('')
    + (ok.length ? '<div class="wa-pk-ok">' + tgI("check", 12) + '<span>' + ok.map(function(x){ return esc(x.t); }).join(' · ') + '</span></div>' : '') + '</div>';
}
function waChecksBlock(ro, op, live){
  var s = waSt(ro, op); if(["submitted", "approved", "paid", "appealed", "written", "billed"].indexOf(s) > -1) return '';
  var c = op.claim || {}, cv = waCov(ro, op), ov = waOverSrt(op), hu = waHeads(ro, op), cls = cv.st === "out" ? "bad" : cv.st === "in" ? "ok" : "warn";
  var cov = '<div class="wa-c2 ' + cls + '"><span class="k">Coverage</span><span class="v"><b>' + (cv.st === "out" ? "Outside " : cv.st === "near" ? "Near the end of " : cv.st === "unknown" ? "" : "Inside ") + esc(cv.c[1]) + '</b> · ' + esc(cv.txt) + '</span>' + (cv.pct ? '<span class="bar"><i style="width:' + Math.min(100, cv.pct * 100).toFixed(0) + '%"></i></span>' : '')
    + (live ? (cv.st === "unknown" && !waD(ro.warrantyStart) && cv.c[0] !== "prev" ? '<button class="btn btn-sm" data-action="wa-fix" data-fix="field:ws" data-ro="' + ro.id + '" data-op="' + op.id + '">Add start</button>' : '<button class="btn btn-sm" data-action="wa-fix" data-fix="cov" data-ro="' + ro.id + '" data-op="' + op.id + '">' + (cv.st === "out" ? 'Coverage…' : 'Change') + '</button>') : '') + '</div>';
  var sh = waNum(c.srtHrs), srt = sh ? '<div class="wa-c2 ' + (ov > 0.05 && !c.srtWhy ? 'bad' : 'ok') + '"><span class="k">SRT</span><span class="v">' + esc(c.srtOp || "") + ' · ' + sh.toFixed(1) + ' h · claiming <b>' + waClaimH(op).toFixed(1) + ' h</b>'
      + (ov > 0.05 ? (c.srtWhy ? ' · ' + ov.toFixed(1) + ' h over — <i>' + esc(c.srtWhy) + '</i>' : ' · <b>' + ov.toFixed(1) + ' h over</b>, no reason') : waClaimH(op) > (+op.burnt || 0) + 0.05 ? ' · clocked ' + (+op.burnt || 0).toFixed(1) + ' h' : ' · within') + '</span>'
      + (live && (ov > 0.05 || c.srtWhy) ? '<button class="btn btn-sm" data-action="wa-fix" data-fix="srt" data-ro="' + ro.id + '" data-op="' + op.id + '">' + (c.srtWhy ? 'Change' : 'Fix labor') + '</button>' : live ? '<button class="btn btn-sm tg-gh" data-action="wa-fix" data-fix="srt" data-ro="' + ro.id + '" data-op="' + op.id + '">Edit</button>' : '') + '</div>'
    : (live && opDoneNow(op) ? '<div class="wa-c2 warn"><span class="k">SRT</span><span class="v">No SRT op on this job yet — add it to check the labor</span><button class="btn btn-sm" data-action="wa-fix" data-fix="srt" data-ro="' + ro.id + '" data-op="' + op.id + '">Add SRT</button></div>' : '');
  var h = ''; if(hu){ var cat = WA_RCAT.filter(function(k){ return k[0] === hu.cats[0]; })[0], C = waChecks(ro, op), it = C.filter(function(x){ return x.t === cat[3]; })[0], has = it ? it.ok : true;
    h = '<div class="wa-c2 hu ' + (it && !has ? 'bad' : 'ok') + '"><span class="k">' + tgI("history", 12) + 'Heads-up</span><span class="v">' + esc(roLabel(hu.ro)) + ' (' + esc(String(hu.op.complaint || "").toLowerCase()) + ', ' + waWhen(hu.at) + ') came back: <b>' + esc(cat[2].charAt(0).toLowerCase() + cat[2].slice(1)) + '</b>. ' + (!it ? 'Worth checking before you file.' : has ? 'This one has it covered.' : 'This one has the same gap.') + '</span><button class="btn btn-sm tg-gh" data-action="wa-pop" data-p="rets" data-ro="' + ro.id + '">See returns</button></div>'; }
  return '<div class="wa-c2s">' + cov + srt + h + '</div>';
}
function waOpCard(ro, op){
  var s = waSt(ro, op), c = op.claim || {}, n = raN(ro, op), ps = opRealParts(op), cp = waCausal(op), g = waGaps(ro, op), live = WA_CLOSED.indexOf(s) < 0 || (s === "paid" && c.short && !c.short.dec);
  var cause = opStory(op, "cause"), fix = opStory(op, "fix"), dn = waDoneAt(ro, op);
  var inp = function(k, lbl, ph, w, v){ return '<label class="wa-f' + (w ? ' w' : '') + '"><span>' + lbl + '</span><input data-wa-f="' + k + '" data-ro="' + ro.id + '" data-op="' + op.id + '" value="' + esc(v != null ? v : (k === "amount" || k === "paid" ? cdMoneyShow(c[k]) : (c[k] || ""))) + '" placeholder="' + esc(ph || "") + '" autocomplete="off"></label>'; };
  var btn = function(to, lbl, kind, dis, tip){ return '<button class="btn btn-sm' + (kind ? ' ' + kind : '') + '" data-action="wa-st" data-ro="' + ro.id + '" data-op="' + op.id + '" data-to="' + to + '"' + (dis ? ' disabled' : '') + (tip ? ' title="' + esc(tip) + '"' : '') + '>' + lbl + '</button>'; };
  var pop = function(p, lbl, prim, ic){ return '<button class="btn btn-sm' + (prim ? ' btn-primary' : '') + '" data-action="wa-pop" data-p="' + p + '" data-ro="' + ro.id + '" data-op="' + op.id + '">' + (ic ? tgI(ic, 13) : '') + lbl + '</button>'; };
  var acts = '';
  if(s === "repair") acts = btn("submitted", "Submit claim", "btn-primary", true, "Finish the operation first");
  else if(s === "ready") acts = pop("file", "File claim…", true, "send");
  else if(s === "submitted") acts = btn("approved", "Approved", "btn-primary") + btn("returned", "Returned") + btn("denied", "Denied", "wa-bad");
  else if(s === "returned") acts = pop("decide", "Decide…", true) + btn("submitted", "Resubmit", "", g.length > 0, g.length ? "Missing: " + g.map(function(x){ return x.t; }).join(", ") : "");
  else if(s === "denied" && !c.dec) acts = pop("decide", "Decide…", true);
  else if(s === "appealed") acts = btn("approved", "Approved", "btn-primary") + btn("denied", "Denied", "wa-bad");
  else if(s === "approved") acts = pop("paid", "Mark paid…", true, "dollar") + btn("returned", "Returned");
  else if(s === "paid" && c.short && !c.short.dec) acts = pop("short", "Paid short — decide…", true);
  else acts = btn("reopen", "Reopen");
  var h = '<section class="wa-op' + (s === "returned" || (s === "denied" && !c.dec) ? ' hl' : UI.waOp === op.id ? ' sel' : '') + '" data-op="' + op.id + '" data-key="waop-' + op.id + '">';
  h += '<header class="wa-oph"><span class="n">' + n + '</span>' + waJt(op) + '<h3>' + esc(op.complaint || "Operation") + '</h3>'
    + (s === "ready" && dn ? '<span class="wa-by">File by ' + waByTxt(waFileLeft(ro, op)) + '</span>' + waDue(waFileLeft(ro, op)) : s === "returned" ? '<span class="wa-by">Resubmit by ' + waByTxt(waResLeft(op)) + '</span>' + waDue(waResLeft(op)) : '')
    + '<span class="os">' + pillHtml(opStatus(op)) + '</span>' + waChip(s) + '</header>';
  h += '<div class="wa-opb"><div>';
  h += '<dl class="wa-story"><dt>Complaint</dt><dd>' + esc(op.complaint || "") + '</dd><dt>Cause</dt><dd class="' + (cause ? '' : 'miss') + '">' + (cause ? esc(cause) : 'Not written yet' + waAskBtn(ro, op)) + '</dd><dt>Correction</dt><dd class="' + (fix ? '' : 'miss') + '">' + (fix ? esc(fix) : 'Not written yet' + waAskBtn(ro, op)) + '</dd></dl>';
  if(c.ask && waStoryGaps(op).length) h += '<div class="wa-line ask">' + tgI("chat", 14) + '<span>Waiting on <b>' + esc(tgFirst(c.ask.who)) + '</b> · asked ' + waWhen(c.ask.at) + ' for the ' + esc((c.ask.what || []).join(" and ")) + ' · it’s on ' + esc(tgFirst(c.ask.who)) + '’s Console</span><button class="btn btn-sm" data-action="wa-nudge" data-ro="' + ro.id + '" data-op="' + op.id + '">Nudge</button></div>';
  if(ps.length){ h += '<span class="wa-k">Parts' + (ps.length > 1 ? ' · pick the causal part' : '') + '</span><div class="wa-pts">';
    ps.forEach(function(p){ var on = waCausalSet(op) && cp && cp.id === p.id;
      h += '<div class="wa-pt' + (on ? ' on' : '') + '" data-action="wa-causal" data-ro="' + ro.id + '" data-op="' + op.id + '" data-p="' + p.id + '" role="radio" aria-checked="' + on + '"><span class="r"></span><span class="d">' + esc(p.description || "—") + (on ? '<em>CAUSAL</em>' : '') + '</span><span class="pn">' + esc(p.partNumber || "") + '</span><span class="q">×' + esc(p.qty || "1") + (priceOf(p.price) ? ' · ' + waUsd(partLine$(p)) : '') + '</span></div>';
      if(p.fp && p.fp.tag) h += '<div class="wa-fp">' + tgI("parts", 12) + 'Failed part · tag <b>' + esc(p.fp.tag) + '</b> · shelf ' + esc(p.fp.shelf || "—") + ' · ' + (p.fp.done ? esc(p.fp.done) : p.fp.ret ? 'Volvo wants it back — ship by ' + waByTxt(waLeft(p.fp.ret.by)) + (p.fp.ret.ra ? ' · RA ' + esc(p.fp.ret.ra) : '') : 'keep until ' + waByTxt(waLeft(p.fp.keep))) + '</div>'; });
    h += '</div>'; }
  var v = waVol(ro); if(v && wcOps(ro)[0] === op) h += '<div class="wa-line vol">' + tgI("phone", 14) + '<span>' + (v.kind === "ts" ? 'Tech support case <b>' + esc(v.v.no || ro.techSupportCase || "") + '</b> · open ' + tgDur(ageSince(v.v.at)) : 'Pre-approval asked <b>' + tgDur(ageSince(v.v.at)) + ' ago</b>') + (v.v.what ? ' · ' + esc(v.v.what) : '') + '</span><button class="btn btn-sm" data-action="wa-pop" data-p="follow" data-ro="' + ro.id + '" data-op="' + op.id + '">Follow up</button></div>';
  h += waChecksBlock(ro, op, live);
  var techs = {}; opPunches(op.id).forEach(function(p){ var w = punchWho(p); if(w) techs[w] = 1; }); var om = opMoney(op);
  h += '<div class="wa-lab"><span>Quoted <b>' + (+op.quoted || 0).toFixed(1) + 'h</b></span><span>Clocked <b>' + (+op.burnt || 0).toFixed(1) + 'h</b></span><span title="Labor ' + esc(waUsd(om.labor)) + ' · parts ' + esc(waUsd(om.parts)) + '">Cost <b>' + (om.total ? waUsd(om.total) : '—') + '</b></span>' + (Object.keys(techs).length ? '<span>' + esc(Object.keys(techs).join(", ")) + '</span>' : '') + '</div>';
  h += '</div><div><span class="wa-k">Claim</span><div class="wa-grid">' + inp("claimNo", "Claim #", "Given when you file") + inp("failCode", "Fault code", waFail(op) || "SPN / FMI") + inp("laborHrs", "Labor hrs", waClaimH(op) ? waClaimH(op).toFixed(1) : "0.0") + inp("amount", "Amount $", opMoney(op).total ? opMoney(op).total.toFixed(2) : "0.00")
    + (s === "paid" ? inp("paid", "Paid $", "", true) : '')
    + (s === "returned" || s === "denied" ? '<label class="wa-f w' + (s === "returned" ? ' bad' : '') + '"><span>' + (s === "returned" ? 'Why it came back' : 'Why it was denied') + '</span><input data-wa-f="returnReason" data-ro="' + ro.id + '" data-op="' + op.id + '" value="' + esc(c.returnReason || "") + '" placeholder="What Volvo said" autocomplete="off"></label>' : '')
    + (c.short ? '<div class="wa-short w"><b>Short ' + waUsd(c.short.amt) + '</b><span>' + esc(c.short.why || "") + (c.short.src ? ' · statement ' + esc(c.short.src) : '') + (c.short.dec ? ' · ' + esc(c.short.dec) : '') + '</span></div>' : '')
    + (s === "appealed" && c.appeal ? '<div class="wa-short ap w"><b>Appeal</b><span>' + esc(c.appeal) + '</span></div>' : '')
    + (c.dec && s === "denied" ? '<div class="wa-short w"><b>Decided</b><span>' + esc(c.dec) + '</span></div>' : '') + '</div>';
  h += libWaDocs(ro, op);   /* Parsec 17.1: the documents used on this operation, and the claim folder */
  h += waPacket(ro, op, live);
  h += '<div class="wa-acts">' + acts + (s !== "repair" ? '<button class="btn btn-sm" data-action="wa-copy" data-ro="' + ro.id + '" data-op="' + op.id + '" title="Copy for the claim  (C)">' + tgI("copy", 13) + 'Copy</button><button class="btn btn-sm" data-action="wa-print" data-ro="' + ro.id + '" data-op="' + op.id + '" title="Print the packet  (P)">' + tgI("print", 13) + 'Print</button>' : '')
    + '<span class="sp"></span><button class="btn btn-sm tg-gh" data-action="wa-open-ro" data-ro="' + ro.id + '" data-op="' + op.id + '" title="Open this operation on the RO">' + tgI("note", 13) + 'RO</button></div>';
  h += '</div></div>';
  if((c.history || []).length) h += '<div class="wa-hist">' + c.history.slice().reverse().slice(0, 8).map(function(e){ return '<span><b>' + esc(WC_ST[e.to] ? WC_ST[e.to].l : e.to) + '</b> ' + esc(fmtDate(e.at)) + ' ' + esc(fmtTime(e.at)) + (e.by ? ' · ' + esc(e.by) : '') + '</span>'; }).join('') + '</div>';
  return h + '</section>';
}

/* ---------- Board ---------- */
function waVBoard(sel){
  var cols = [["repair", "In repair"], ["ready", "Ready to file"], ["submitted", "Submitted"], ["approved", "Approved"], ["paid", "Closed · 30 days"]], C = { repair: [], ready: [], submitted: [], approved: [], paid: [] };
  waAllOps().forEach(function(x){ var s = waSt(x.ro, x.op), k = s === "returned" ? "ready" : s === "appealed" ? "submitted" : WA_CLOSED.indexOf(s) > -1 ? "paid" : s;
    if(k === "paid"){ var ca = waAt(x.op, s); if(!ca || waAgo(ca) > 30) return; } if(C[k]) C[k].push(x); });
  C.ready.sort(function(a, b){ return (waSt(a.ro, a.op) === "returned" ? 0 : 1) - (waSt(b.ro, b.op) === "returned" ? 0 : 1); });
  var lateOf = function(x){ var s = waSt(x.ro, x.op), C2 = waCfg(); return (s === "ready" && waFileLeft(x.ro, x.op) != null && waFileLeft(x.ro, x.op) <= 3) || (s === "returned" && waResLeft(x.op) != null && waResLeft(x.op) <= 3) || ((s === "submitted" || s === "appealed") && waAgo(waAt(x.op, s)) >= C2.claim) || (s === "approved" && waAgo(waAt(x.op, "approved")) >= C2.paid); };
  var sub = function(x){ var s = waSt(x.ro, x.op), o = x.op; return s === "repair" ? (+o.burnt || 0).toFixed(1) + ' of ' + (+o.quoted || 0).toFixed(1) + ' h' : s === "ready" ? 'done ' + waWhen(waDoneAt(x.ro, o)) : s === "returned" ? 'back ' + waWhen(waAt(o, "returned")) : s === "paid" ? 'paid ' + waWhen(waAt(o, "paid")) : s === "denied" ? 'denied ' + waWhen(waAt(o, "denied")) : s === "written" ? 'written off ' + waWhen(waAt(o, "written")) : s === "billed" ? 'to customer ' + waWhen(waAt(o, "billed")) : (s === "approved" ? 'approved ' : s === "appealed" ? 'appealed ' : 'filed ') + waAgoTxt(waAt(o, s)) + ' ago'; };
  var amt = function(x){ var s = waSt(x.ro, x.op); return s === "paid" ? waPaid(x.op) : waAmt(x.op); };
  var card = function(x){ var L = lateOf(x), s = waSt(x.ro, x.op); return '<div class="wa-cd' + (sel && x.ro.id === sel.id ? ' sel' : '') + '" data-action="wa-sel" data-ro="' + x.ro.id + '" data-op="' + x.op.id + '" role="button">' + (L ? '<i class="tg-dot"></i>' : '') + '<div class="r1"><b class="tg-no">' + esc(tgNum(x.ro)) + '</b>' + (wcOps(x.ro).length > 1 ? '<span>op ' + raN(x.ro, x.op) + '</span>' : '') + (opJobType(x.op) === "RECALL" ? waJt(x.op) : '') + '<span class="sp"></span>' + (["returned", "denied", "appealed", "written", "billed"].indexOf(s) > -1 ? waChip(s) : '') + (x.op.claim && x.op.claim.short ? '<span class="wa-c back">short</span>' : '') + '</div><span class="cu">' + esc(x.ro.customerName || "") + '</span><span class="op">' + esc(x.op.complaint || "") + '</span><div class="r3"><span class="' + (L ? 'late' : '') + '">' + sub(x) + '</span><span class="sp"></span><span class="wa-amt">' + (s === "repair" && !amt(x) ? '' : waUsd0(amt(x))) + '</span></div></div>'; };
  return '<div class="wa-bv">' + (sel ? waTop(sel, false) : '') + '<div class="wa-bd">' + cols.map(function(c){ var L = C[c[0]], m = L.reduce(function(a, x){ return a + (["denied", "written", "billed"].indexOf(waSt(x.ro, x.op)) > -1 ? 0 : amt(x)); }, 0);
    return '<div class="wa-col ' + c[0] + '"><div class="wa-ch">' + c[1] + '<span class="n">' + L.length + '</span><span class="m">' + (m ? waUsd0(m) : '') + '</span></div><div class="wa-cs">' + (L.map(card).join('') || '<span class="empty">Nothing here</span>') + '</div></div>'; }).join('') + '</div></div>';
}

/* ---------- Money ---------- */
function waKfmt(n){ return n >= 1000 ? (Math.round(n / 100) / 10).toString().replace(/\.0$/, "") + "K" : String(Math.round(n)); }
function waMoneyChart(){
  var D = waMonths(6), W = 520, H = 210, L = 46, B = 26, T = 14, top = Math.max(1000, Math.max.apply(null, D.map(function(d){ return Math.max(d.cl, d.pd); })));
  var step = top <= 4000 ? 1000 : top <= 8000 ? 2000 : top <= 16000 ? 4000 : top <= 40000 ? 10000 : 20000, mx = Math.ceil(top / step) * step, y = function(v){ return H - B - (v / mx) * (H - B - T); }, bw = 18, slot = (W - L - 8) / D.length;
  var bar = function(x, v, cls, tip){ if(!v) return ''; var tp = y(v), h = H - B - tp, r = Math.min(4, h); return '<path class="' + cls + '" d="M' + x + ',' + (H - B) + 'V' + (tp + r) + 'Q' + x + ',' + tp + ' ' + (x + r) + ',' + tp + 'H' + (x + bw - r) + 'Q' + (x + bw) + ',' + tp + ' ' + (x + bw) + ',' + (tp + r) + 'V' + (H - B) + 'Z" data-tip="' + esc(tip) + '"/>'; };
  var g = ''; for(var v = 0; v <= mx; v += step) g += '<line x1="' + L + '" x2="' + W + '" y1="' + y(v) + '" y2="' + y(v) + '" class="gl"/><text x="' + (L - 8) + '" y="' + (y(v) + 4) + '" class="ax" text-anchor="end">$' + waKfmt(v) + '</text>';
  D.forEach(function(d, k){ var cx = L + slot * k + slot / 2, tip = (d.cur ? d.lbl + ' so far' : d.lbl) + ' · claimed ' + waUsd0(d.cl) + ' · paid ' + waUsd0(d.pd);
    g += '<rect class="hit" x="' + (cx - slot / 2 + 2) + '" y="' + T + '" width="' + (slot - 4) + '" height="' + (H - B - T) + '" data-tip="' + esc(tip) + '"/>' + bar(cx - bw - 1, d.cl, 'c1', tip) + bar(cx + 1, d.pd, 'c2', tip) + '<text x="' + cx + '" y="' + (H - 8) + '" class="ax" text-anchor="middle">' + d.lbl + '</text>'; });
  var cur = D[D.length - 1];
  var tbl = '<table class="wa-mt"><thead><tr><th>Month</th><th>Claimed</th><th>Paid</th><th>Paid ÷ claimed</th></tr></thead><tbody>' + D.map(function(d){ return '<tr><td>' + d.lbl + (d.cur ? ' (so far)' : '') + '</td><td>' + waUsd(d.cl) + '</td><td>' + waUsd(d.pd) + '</td><td>' + (d.cl ? Math.round(d.pd / d.cl * 100) + '%' : '—') + '</td></tr>'; }).join('') + '</tbody></table>';
  return '<div class="wa-card"><div class="wa-ch2"><b>Claimed and paid</b><small>by month · last six months</small><span class="sp"></span><span class="wa-lg"><i class="c1"></i>Claimed<i class="c2"></i>Paid</span><button class="tg-link" data-action="wa-mtbl">' + (UI.waMtbl ? 'Chart' : 'Table') + '</button></div>'
    + (UI.waMtbl ? tbl : '<svg class="wa-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Claimed and paid by month">' + g + '</svg><p class="wa-agn">' + cur.lbl + ' so far: <b>' + waUsd0(cur.cl) + '</b> claimed · <b>' + waUsd0(cur.pd) + '</b> paid — credits land weeks after filing.</p>') + '</div>';
}
function waAging(){
  var L = waWaiting(), Bk = [["0–30 days", 0, 30], ["31–60 days", 31, 60], ["61–90 days", 61, 90], ["Over 90 days", 91, 99999]].map(function(b){ var it = L.filter(function(x){ return x.age >= b[1] && x.age <= b[2]; }); return [b[0], it.reduce(function(a, x){ return a + waAmt(x.op); }, 0), it]; }), mx = Math.max(1, Math.max.apply(null, Bk.map(function(b){ return b[1]; })));
  return '<div class="wa-card"><div class="wa-ch2"><b>Waiting on Volvo by age</b><small>since first filed</small></div><div class="wa-ag">' + Bk.map(function(b, k){ return '<div class="wa-agr" data-tip="' + esc(b[0] + ' · ' + waUsd(b[1]) + (b[2].length ? ' · ' + b[2].map(function(x){ return x.op.claim.claimNo || tgNum(x.ro); }).join(', ') : '')) + '"><span class="k">' + b[0] + '</span><span class="tr">' + (b[1] ? '<i style="width:' + (b[1] / mx * 100).toFixed(1) + '%"' + (k >= 2 ? ' class="old"' : '') + '></i>' : '') + '</span><span class="v"><b>' + waUsd0(b[1]) + '</b> · ' + b[2].length + ' claim' + (b[2].length === 1 ? '' : 's') + '</span></div>'; }).join('') + '</div>'
    + (L.length ? '<p class="wa-agn">' + tgI("flag", 12) + 'Over 60 days is worth a call — the oldest is ' + esc(L[0].op.claim.claimNo || tgNum(L[0].ro)) + ', ' + L[0].age + ' days.</p>' : '<p class="wa-agn">Nothing waiting on Volvo.</p>') + '</div>';
}
function waVMoney(){
  var k = UI.waPer || "month", P = waStats(k), Wt = waWaiting(), wsum = Wt.reduce(function(a, x){ return a + waAmt(x.op); }, 0), rp = P.rec == null ? null : Math.round(P.rec * 100), rc = rp == null ? "" : rp >= 90 ? "good" : rp >= 75 ? "warn" : "bad";
  var pc = [["month", "This month"], ["last", "Last month"], ["90", "Last 90 days"], ["year", "This year"]];
  var tile = function(l, v, s){ return '<div class="wa-tile"><small>' + l + '</small><b>' + v + '</b><span>' + s + '</span></div>'; };
  return '<div class="wa-mv" data-scroll="wa-mv"><div class="wa-mf"><div class="tg-seg3 wa-per">' + pc.map(function(p){ return '<button class="' + (k === p[0] ? 'on' : '') + '" data-action="wa-per" data-k="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</div><span class="sp"></span><button class="btn btn-sm" data-action="wa-csv">' + tgI("copy", 13) + 'Export CSV</button></div>'
    + '<div class="wa-tiles">' + tile('Claimed', waUsd0(P.cl), P.cn + ' claim' + (P.cn === 1 ? '' : 's') + ' filed ' + P.lbl) + tile('Paid', waUsd0(P.pd), P.pn + ' claim' + (P.pn === 1 ? '' : 's') + ' paid ' + P.lbl) + tile('Waiting on Volvo', waUsd0(wsum), Wt.length + ' claim' + (Wt.length === 1 ? '' : 's') + (Wt.length ? ' · oldest ' + Wt[0].age + ' days' : ''))
    + '<div class="wa-tile"><small>Recovered</small><b>' + (rp == null ? '—' : rp + '%') + '</b><span>' + (rp == null ? 'no claims closed ' + P.lbl : 'of ' + waUsd0(P.cc) + ' closed ' + P.lbl + (P.den ? ' · ' + P.den + ' denied' : '')) + '</span>' + (rp != null ? '<span class="wa-meter ' + rc + '"><i style="width:' + Math.min(100, rp) + '%"></i></span><span class="wa-mst ' + rc + '">' + (rc === "good" ? tgI("check", 11) + 'On target — 90% or better' : rc === "warn" ? tgI("flag", 11) + 'Below 90%' : tgI("flag", 11) + 'Well below 90% — see the denials') + '</span>' : '') + '</div>'
    + tile('Absorbed', waUsd0(P.ab), 'short pays and write-offs ' + P.lbl) + '</div>'
    + '<div class="wa-charts">' + waMoneyChart() + waAging() + '</div>'
    + '<div class="wa-card"><div class="wa-ch2"><b>Oldest waiting</b><small>' + Wt.length + ' claim' + (Wt.length === 1 ? '' : 's') + ' · ' + waUsd(wsum) + '</small></div>' + (Wt.length ? '<div class="wa-ot"><div class="h"><span>RO · customer</span><span>Claim #</span><span>Status</span><span>First filed</span><span class="r">Age</span><span class="r">Amount</span></div>'
    + Wt.slice(0, 8).map(function(x){ return '<button class="row" data-action="wa-sel" data-ro="' + x.ro.id + '" data-op="' + x.op.id + '" data-v="claims"><span><b class="tg-no">' + esc(tgNum(x.ro)) + '</b> ' + esc(x.ro.customerName || "") + '</span><span class="m">' + esc(x.op.claim.claimNo || "") + '</span><span>' + waChip(waSt(x.ro, x.op)) + '</span><span>' + waMdy(waFiledAt(x.op)) + '</span><span class="r m' + (x.age > 60 ? ' old' : '') + '">' + x.age + ' d</span><span class="r m">' + waUsd(waAmt(x.op)) + '</span></button>'; }).join('') + '</div>' : '<p class="wa-none2">Nothing waiting on Volvo.</p>') + '</div>'
    + '<div class="wa-tip" hidden></div></div>';
}

/* ---------- Parts: the failed-parts shelf ---------- */
function waVParts(){
  var L = waShelf(), F = UI.waPf || "all", SH = UI.waPs || null, C = waCfg();
  var cnt = function(k){ return L.filter(function(x){ return k === "all" || x.st === k || (k === "done" && x.st === "shipped"); }).length; };
  var V = L.filter(function(x){ return (F === "all" || x.st === F || (F === "done" && (x.st === "done" || x.st === "shipped"))) && (!SH || x.fp.shelf === SH); });
  var ST = { hold: ["Holding", ""], ret: ["Return requested", "warn"], shipped: ["Shipped", "ok"], done: ["Done", ""] };
  var fs = [["all", "All"], ["hold", "Holding"], ["ret", "Return requested"], ["done", "Shipped or done"]];
  var bins = C.shelves.map(function(b){ var it = L.filter(function(x){ return x.fp.shelf === b && (x.st === "hold" || x.st === "ret"); });
    return '<button class="wa-bin' + (SH === b ? ' on' : '') + '" data-action="wa-pshelf" data-s="' + esc(b) + '"><b>' + esc(b) + '</b><span>' + (it.map(function(x){ return '<i class="' + (x.st === "ret" ? 'ret' : x.due != null && x.due <= 7 ? 'due' : '') + '" title="' + esc(x.fp.tag + ' · ' + (x.p.description || "")) + '">' + esc(String(x.fp.tag).replace(/^FP-/, '')) + '</i>'; }).join('') || '<em>empty</em>') + '</span></button>'; }).join('');
  return '<div class="wa-pv2"><div class="wa-mf"><div class="tg-seg3 wa-per">' + fs.map(function(f){ return '<button class="' + (F === f[0] ? 'on' : '') + '" data-action="wa-pfilt" data-k="' + f[0] + '">' + f[1] + ' <span>' + cnt(f[0]) + '</span></button>'; }).join('') + '</div>' + (SH ? '<button class="tg-fchip" data-action="wa-pshelf" data-s="' + esc(SH) + '">Shelf ' + esc(SH) + tgI("x", 11) + '</button>' : '') + '<span class="sp"></span><button class="btn btn-sm" data-action="wa-ptags">' + tgI("print", 13) + 'Print tags</button></div>'
    + '<div class="wa-bins" style="grid-template-columns:repeat(' + Math.min(8, C.shelves.length) + ',minmax(0,1fr))">' + bins + '</div>'
    + '<div class="wa-card"><div class="wa-pt2 h"><span>Tag</span><span>Part</span><span>RO · claim</span><span>Shelf</span><span>Status · due</span><span></span></div>'
    + (V.map(function(x){ var c = x.op.claim || {}, s = waSt(x.ro, x.op); return '<div class="wa-pt2' + (x.st === "shipped" || x.st === "done" ? ' dn' : '') + '"><span class="m tag">' + esc(x.fp.tag) + '</span><span><b>' + esc(x.p.description || "—") + '</b><small>' + esc(x.p.partNumber || "") + (waCausal(x.op) === x.p ? ' · causal' : '') + '</small></span>'
      + '<span><span class="l1"><button class="tg-link" data-action="wa-sel" data-ro="' + x.ro.id + '" data-op="' + x.op.id + '" data-v="claims"><b class="tg-no">' + esc(tgNum(x.ro)) + '</b></button> · <span class="m">' + esc(c.claimNo || "not filed") + '</span></span><small>' + esc(x.ro.customerName || "") + ' · ' + esc((WC_ST[s] || WC_ST.repair).l) + '</small></span><span class="m">' + esc(x.fp.shelf || "—") + '</span>'
      + '<span><span class="l1"><span class="wa-ps ' + ST[x.st][1] + '">' + ST[x.st][0] + '</span>' + (x.due != null && x.due <= 7 ? waDue(x.due) : '') + '</span><small>' + (x.fp.done ? esc(x.fp.done) : x.due != null ? (x.fp.ret ? 'ship by ' : 'keep until ') + waByTxt(x.due) + (x.fp.ret && x.fp.ret.ra ? ' · RA ' + esc(x.fp.ret.ra) : '') : '') + '</small></span>'
      + '<span class="act">' + (x.st === "ret" ? '<button class="btn btn-sm" data-action="wa-ppop" data-ro="' + x.ro.id + '" data-op="' + x.op.id + '" data-pt="' + x.p.id + '">Ship…</button>' : x.st === "hold" ? '<button class="btn btn-sm" data-action="wa-ppop" data-ro="' + x.ro.id + '" data-op="' + x.op.id + '" data-pt="' + x.p.id + '">Done holding…</button>' : '') + '<button class="btn btn-sm ib" data-action="wa-ptag" data-ro="' + x.ro.id + '" data-pt="' + x.p.id + '" title="Print this tag">' + tgI("print", 13) + '</button></span></div>'; }).join('')
      || '<p class="wa-none2">' + (L.length ? 'Nothing here.' : 'No failed parts tagged yet — tag one from a claim’s packet (Tag it).') + '</p>') + '</div></div>';
}
