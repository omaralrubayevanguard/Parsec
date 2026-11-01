/* Parsec · pages/triage · page.js
   The Triage page: header, Needs action on the left, the log form (shared with the Inbox composer), approvals with a record, the Inbox / Desk / Yard views.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   tgView tgHead tgList tgLF tgPanelSum tgWhenOpts tgFollow tgApPanel tgBtnLabel tgLogForm tgRecLine tgApForm … (17 functions)
   uses       access/ data/ kit/ pages/ pages/foreman/ pages/rolist/ ro/ shell/ state/ trucks/
*/
/* ============================== the page ============================== */
function tgView(){
  if(!UI.tgView) UI.tgView = "inbox";
  if(!UI.tgOpen) UI.tgOpen = {};
  if(UI.tgView === "ros"){ if(typeof rlEmbOk === "function" && rlEmbOk()) return '<div class="tg" data-key="tg">' + tgHead() + rlEmbed('triage') + '</div>'; UI.tgView = "inbox"; }   /* Parsec 14.3 */
  var ro = tgSel();
  var body = ro ? (UI.tgView === "desk" ? tgVDesk(ro) : UI.tgView === "yard" ? tgVYard(ro) : tgVInbox(ro))
    : (UI.tgView === "yard" ? tgVYard(null) : '<div class="tg-blank">' + esHtml("check", "Nothing on the yard", "Repair orders that are open show up here — check in a truck with New RO.") + '</div>');
  return '<div class="tg" data-key="tg">' + tgHead() + '<div class="tg-body v-' + UI.tgView + '">' + tgList() + '<div class="tg-main" data-key="tg-main-' + UI.tgView + '">' + body + '</div>' + tgPopHtml() + '</div></div>';
}
function tgHead(){
  var Y = tgYard(), n = function(f){ var k = UI.tgFilter; UI.tgFilter = f; var c = Y.filter(tgMatch).length; UI.tgFilter = k; return c; };
  var f = function(k, txt, w){ var on = UI.tgFilter === k; return '<button class="tg-hf' + (w ? ' w' : '') + (on ? ' on' : '') + '" data-action="tg-filt" data-k="' + k + '" title="' + (on ? 'Clear the filter' : 'Show only these in Needs action') + '"><b>' + n(k) + '</b>' + txt + (on ? tgI("x", 12) : '') + '</button>'; };
  var views = [["inbox", "inbox", "Inbox"], ["desk", "grid", "Desk"], ["yard", "pin", "Yard"]].concat(typeof rlEmbOk === "function" && rlEmbOk() ? [["ros", "list", "ROs"]] : []);
  var search = psmBtn("triage", "Search — RO, unit, customer, VIN or spot");   /* Parsec 13.1 — the icon opens the search window */
  return '<header class="tg-head" data-key="tg-head"><h1 class="tg-h1">Triage</h1><span class="tg-facts"><button class="tg-hf" data-action="tg-filt" data-k="" title="Show everything"><b>' + Y.length + '</b>on the yard</button><i>·</i>'
    + f("apr", "awaiting approval") + '<i>·</i>' + f("rdy", "ready to release") + '<i>·</i>' + f("late", "late", true) + '</span>'
    + '<div class="tg-views" role="tablist">' + views.map(function(v, i){ return '<button role="tab" aria-selected="' + (UI.tgView === v[0]) + '" class="' + (UI.tgView === v[0] ? 'on' : '') + '" data-action="tg-view" data-v="' + v[0] + '" title="' + (v[0] === "ros" ? "Every open RO — the RO list, your columns" : v[2] + ' view (' + (i + 1) + ')') + '">' + tgI(v[1], 14) + (v[0] === "ros" ? rlEmbTab() : v[2]) + '</button>'; }).join('') + '</div>'
    + '<span class="tg-hsep"></span>' + search + '<button class="btn btn-primary tg-newro" data-action="ty-newro" title="New repair order — paste or scan a case, estimate or RO">' + tgI("plus", 15) + '<span>New RO</span></button>'
    + (UI.tgSrch ? '<div class="tg-srpop" data-tg-keep>' + tgSearchHtml() + '</div>' : '') + '</header>';
}

/* ---------- left: Needs action ---------- */
function tgList(){
  var G = tgGrouped(), L = tgFlat(), sel = UI.tgSel, kb = !!UI.tgKB, cl = tgClearedList(), sn = tgYard().filter(tgSnoozed).sort(function(a, b){ return new Date(a.tgSnz.until) - new Date(b.tgSnz.until); });
  var fl = UI.tgFilter, newL = UI.tgNewLate || [];
  var item = function(x){ var ro = x.ro, on = ro.id === sel;
    return '<div class="tg-it' + (on ? ' on' : '') + (on && kb ? ' kb' : '') + '" data-action="tg-sel" data-ro="' + ro.id + '" draggable="true" data-tg-drag="' + ro.id + '">' + (x.late && !x.back ? '<i class="tg-dot"></i>' : '')
      + trkGi(ro, tgI(x.ic, 15)) + '<span class="tg-t"><b class="tg-no">' + esc(tgNum(ro)) + '</b><b class="tg-cu">' + esc(ro.customerName || "") + '</b>'
      + (newL.indexOf(ro.id) > -1 ? '<span class="tg-new" title="Turned late while you were away">New</span>' : '') + (x.back ? '<span class="tg-back">' + tgI("clock", 11) + 'Back</span>' : '') + tgSpotChip(ro) + '</span>'
      + '<span class="tg-w' + (x.late && !x.back ? ' late' : '') + '">' + v10Age(ro) + esc(x.why) + '</span>'
      + '<button class="btn btn-sm ib tg-snz" data-action="tg-pop" data-p="snooze" data-ro="' + ro.id + '" title="Snooze  (S)">' + tgI("clock", 15) + '</button>'
      + trxPill(x) + '<button class="btn btn-sm' + (x.btn === "Release" ? ' btn-primary' : '') + ' tg-go" data-action="tg-do" data-ro="' + ro.id + '">' + esc(x.btn) + (on && kb ? '<span class="tg-kbd">↵</span>' : '') + '</button></div>'; };
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
      + '<button class="tg-chip' + (S.tpl ? '' : ' on') + '" data-action="tg-lf" data-sc="' + sc + '" data-f="tpl" data-v="">None</button><button class="tg-link" data-action="px-sg-go" data-id="shop.tpl">Edit in Settings…</button></div>'
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
  var L = [roLabelFull(ro) + " · " + (ro.customerName || "") + (ro.unitNumber ? " · unit " + ro.unitNumber : "")];
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
  return '<div class="tg-ib"><div class="tg-top"><div class="r1"><b class="tg-no">' + esc(roLabelFull(ro)) + '</b><span class="tg-stg" title="The RO’s stage">' + esc(roStageTxt(ro) || tgCatLbl(ro)) + '</span>·<span class="tg-age' + (tgLate(ro) ? ' late' : '') + '">' + (tyCat(ro) === "arr" ? (tgEta(ro).eta ? '~' + tgWhen(tgEta(ro).eta) : 'arriving') : esc(ageText(tgAgeMs(ro)))) + '</span>' + (warrIs(ro) ? '<button class="tg-w" data-action="open-warr" data-ro="' + ro.id + '">' + tgI("shield", 12) + 'Warranty ' + warrReady(ro).pct + '%</button>' : '') + '<span class="sp"></span>' + trxBtns(ro) + '<button class="btn btn-sm" data-action="tg-pop" data-p="xfer" data-ro="' + ro.id + '">' + tgI("swap", 14) + 'Transfer…</button><button class="btn btn-sm" data-action="goto-ro" data-ro="' + ro.id + '">Open RO</button></div>'
    + '<h2>' + esc(ro.customerName || "—") + '</h2><div class="r2">' + tgSpotChip(ro) + tgTicks(ro) + '<span class="st">' + tgSi(ro) + '<span>' + esc(tgStTxt(ro)) + '</span></span>' + tgHeld(ro)
    + '</div>'
    + '<div class="tg-ppl">' + pc + '<button class="tg-add" data-action="tg-np-open" data-ro="' + ro.id + '">' + tgI("plus", 13) + (L.length ? 'Add' : 'Add who to call — driver, fleet manager…') + '</button>' + (hint ? '<div class="tg-hint">' + tgI("flag", 13) + esc(hint) + '</div>' : '') + addf + '</div></div>'
    + '<div class="tg-thread" data-scroll="tg-thread">' + '<span class="tg-day">This RO · calls, texts, approvals and transfers</span>' + (thread || '<div class="tg-m sys"><span class="gi">' + tgI("phone", 15) + '</span><div class="bd"><div class="hd">No contact logged yet</div></div></div>')
    + (snz ? '<div class="tg-m sys"><span class="gi">' + tgI("clock", 15) + '</span><div class="bd"><div class="hd">Snoozed until <b>' + tgWhen(+new Date(ro.tgSnz.until)) + '</b>' + (ro.tgSnz.why ? ' · ' + esc(ro.tgSnz.why) : '') + '<time>' + fmtTime(ro.tgSnz.at) + '</time></div></div></div>' : '')
    + '<div class="tg-m sys"><span class="gi">' + tgI("user", 15) + '</span><div class="bd"><div class="hd">' + (rtNoTech(ro) ? '<b>No tech yet</b>' : 'With <b>' + esc(hd.who) + '</b>') + ' · ' + esc(RT_LBL[hd.to]) + '<time>' + tgDur(hd.held) + '</time></div></div></div>'
    + etaRow + tgApprCard(ro) + trxCards(ro) + '</div>'
    + '<div class="tg-comp" data-key="tg-comp">' + tgLogForm(tgLF("c"), "c", ro) + '</div></div>';
}

/* ---------- Desk view ---------- */
function tgVDesk(ro){
  var M = null; try{ M = roStages(ro); }catch(e){}
  var x = tgItemOf(ro.id), nx = null; try{ nx = raNext(ro); }catch(e){}
  var t = x ? x.why : nx ? nx.txt : "Nothing waiting on anyone — keep going.";
  var cl = tyCloseChecks(ro), st = roStatus(ro), hold = /^Waiting/.test(st.status), done = cl.filter(function(c){ return c.ok; }).length + (hold ? 0 : 1), C = 2 * Math.PI * 22;
  var hd = tgHold(ro), r = ro.route, due = tgDue(ro);
  /* Next: only when the next step is yours, or something is late. Ready to close: once the last operation is done or a road test is logged. */
  var nextOn = !!x || tgLate(ro) || !!(nx && nx.tone === "bad"), closeOn = cl[0].ok || !!ro.roadTest || tyCat(ro) === "rdy";
  var opts = RO_STATUS_OPTIONS.map(function(o){ return [o.status].concat(o.subs.map(function(sb){ return o.status + '|' + sb; })); }).reduce(function(a, b){ return a.concat(b); }, []), cur = st.status + (st.sub ? '|' + st.sub : '');
  var feed = (ro.contacts || []).slice(-3).reverse().map(function(c){ return '<div class="tg-fe"><span class="gi">' + tgI(TG_KIND_IC[c.kind] || "phone", 13) + '</span><span><b>' + esc(c.kind) + '</b>' + (c.to ? ' → ' + esc(c.to) : '') + ' · <span class="tg-oc ' + (/Approved|Update/.test(c.out) ? 'ok' : /Declined/.test(c.out) ? 'no' : 'mid') + '">' + esc(c.out || "") + '</span></span><time>' + fmtTime(c.at) + '</time>' + (c.note ? '<p>' + esc(c.note) + '</p>' : '') + '</div>'; }).join('');
  return '<div class="tg-dk"><div class="tg-dkh">' + trkHead(ro) + '<div class="l"><div class="eb"><b class="tg-no">' + esc(roLabelFull(ro)) + '</b>·<span>' + esc([ro.model, ro.unitNumber ? "Unit " + ro.unitNumber : ""].filter(Boolean).join(" · ")) + '</span>·<span class="tg-age' + (tgLate(ro) ? ' late' : '') + '">' + esc(ageText(tgAgeMs(ro))) + '</span></div><h2>' + esc(ro.customerName || "—") + '</h2><div class="trx-b">' + trxBtns(ro) + '</div></div>'
    + '<div class="r">' + tgSpotChip(ro) + '<label class="tg-stsel">' + tgSi(ro) + '<select data-tyst="ro" data-ro="' + ro.id + '" aria-label="RO status">' + opts.map(function(v){ var p = v.split('|'); return '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(p[1] ? pgStLabel('ro', p[0]) + ' · ' + p[1] : pgStLabel('ro', p[0])) + '</option>'; }).join('') + '</select>' + tgI("chevD", 13) + '</label></div></div>'
    + (M ? '<div class="tg-strip"><div class="tg-lbl" style="display:flex;gap:8px">Stage<span style="color:var(--tg-ink2)">' + M.done + ' of ' + M.total + '</span>' + (M.likely && !M.all ? '<span style="margin-left:auto">ready ' + esc(tgWhen(+new Date(M.likely))) + '</span>' : '') + '</div><div class="tg-steps">'
      + M.list.map(function(s){ return '<button class="tg-step ' + (s.state === "d" ? 'done' : s.state === "c" ? (tyCat(ro) === "apr" ? 'wait' : 'now') : '') + '" data-action="ty-stg" data-ro="' + ro.id + '" data-k="' + s.k + '" title="' + (s.state === "d" ? 'Uncheck ' : 'Check off ') + esc(s.name) + '"><i></i><b>' + esc(s.name) + '</b><small>' + esc(s.sub || (s.state === "d" ? 'done' : '—')) + '</small></button>'; }).join('') + '</div></div>' : '')
    + (!nextOn ? '' : '<div class="tg-next"><span class="k">Next</span><p>' + esc(t.charAt(0).toUpperCase() + t.slice(1)) + '</p><button class="btn btn-sm" data-action="tg-pop" data-p="log" data-ro="' + ro.id + '">' + tgI("phone", 14) + 'Log a call</button>' + (x ? '<button class="btn btn-sm tg-acc" data-action="tg-do" data-ro="' + ro.id + '">' + esc(x.btn) + '</button>' : '') + '</div>')
    + '<div class="tg-two"><div class="tg-card"><div class="h">' + tgI("phone", 14) + 'Customer<small>' + (ro.contacts || []).length + ' contact' + ((ro.contacts || []).length === 1 ? '' : 's') + '</small></div>' + (feed ? '<div class="tg-feed">' + feed + '</div>' : '<p class="tg-none">No calls or messages yet.</p>')
    + '<div class="tg-r" style="margin-top:10px">' + TG_KINDS.map(function(k){ return '<button class="tg-chip" data-action="tg-pop" data-p="log" data-ro="' + ro.id + '" data-k="' + k + '">' + tgI(TG_KIND_IC[k], 13) + k + '</button>'; }).join('') + '</div></div>'
    + '<div class="tg-card">' + (tgApprCard(ro) || '<div class="h">' + tgI("check", 14) + 'Approvals</div><p class="tg-none">No operations yet.</p>') + '</div></div>'
    + '<div class="tg-two' + (closeOn ? '' : ' one') + '">' + (!closeOn ? '' : '<div class="tg-card"><div class="h">Ready to close<small>' + done + ' of ' + (cl.length + 1) + '</small>' + (tyCat(ro) === "rdy" ? '<button class="btn btn-sm btn-primary" data-action="tg-pop" data-p="release" data-ro="' + ro.id + '" style="margin-left:10px">' + tgI("release", 13) + 'Release…</button>' : '') + '</div><div class="tg-rtc"><svg class="tg-ring' + (done === cl.length + 1 ? ' ok' : '') + '" width="56" height="56" viewBox="0 0 56 56"><circle class="t" cx="28" cy="28" r="22"/><circle class="p" cx="28" cy="28" r="22" stroke-dasharray="' + (C * done / (cl.length + 1)).toFixed(1) + ' ' + C.toFixed(1) + '"/></svg><div class="tg-close">'
    + cl.map(function(c){ return '<div class="tg-cl' + (c.ok ? ' ok' : '') + '"><i></i><span>' + esc(c.t) + '</span><small>' + esc(c.d) + '</small>' + (c.k === "road" ? '<button class="tg-link" data-action="tg-pop" data-p="road" data-ro="' + ro.id + '">' + (c.ok ? 'Change' : 'Road test…') + '</button>' : '') + '</div>'; }).join('') + '<div class="tg-cl' + (hold ? '' : ' ok') + '"><i></i><span>Holding</span><small>' + esc(hold ? (st.sub || st.status.replace(/^Waiting – /, 'Waiting on ')) : 'nothing blocking') + '</small></div></div></div></div>')
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
        return '<div class="tg-s rsv' + (on ? ' tg-on' : '') + (d != null && d <= 0 ? ' late' : d != null && d <= 15 * 60000 ? ' soon' : '') + (m ? '' : ' dim') + '" data-action="tg-sel" data-ro="' + ro.id + '" draggable="true" data-tg-drag="' + ro.id + '" title="' + esc((ro.customerName || "") + " · held for this arrival" + (e ? " · ETA " + tgWhen(e) : "")) + '">' + lbl + trkYardTop(ro) + '<b>' + tgSq("arr") + esc(tgNum(ro).slice(-4)) + '</b><small>' + (d == null ? 'no ETA' : d > 0 ? (d < 3600000 ? 'in ' + Math.round(d / 60000) + 'm' : '~' + tgWhen(e)) : 'late ' + Math.round(-d / 60000) + 'm') + '</small></div>'; }
      return '<div class="tg-s occ' + (on ? ' tg-on' : '') + (pick && pick !== ro.id ? ' dim' : '') + (m ? '' : ' dim') + '" role="button" tabindex="0" data-action="tg-sel" data-ro="' + ro.id + '" draggable="true" data-tg-drag="' + ro.id + '" title="' + esc((ro.customerName || "") + " · " + tgStTxt(ro)) + '">' + lbl + trkYardTop(ro) + '<b>' + tgSq(c) + esc(tgNum(ro).slice(-4)) + (roInfo(ro).run ? '<i class="tg-live"></i>' : '') + '</b><small>' + esc(ro.customerName || "") + '</small><span class="fl">' + (warrIs(ro) ? tgI("shield", 11) : '') + (tgLate(ro) ? '<i class="lt"></i>' : '') + '</span></div>'; }
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
