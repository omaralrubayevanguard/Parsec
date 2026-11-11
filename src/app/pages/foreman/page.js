/* Parsec · pages/foreman · page.js
   The Foreman page: the header, Needs action on the left, the selected RO on top of the floor, Techs, Yard, Tomorrow (the plan and the handoff note), search.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   fmView fmHead fmIsBatch fmPlanList fmPOrd fmList fmQbar fmOpsStrip fmTop fmTechTop fmOpById fmTodayNums … (33 functions, 1 constant)
   state      fmNote fmTmr punches ros
   uses       access/ data/ kit/ pages/ pages/parts/ pages/rolist/ pages/triage/ ro/ shell/ state/ trucks/
*/
/* ============================== the page ============================== */
function fmView(){
  fmIcons();
  if(!UI.fmView) UI.fmView = "floor";
  if(!UI.fmOpen) UI.fmOpen = {};
  if(!Array.isArray(UI.fmBs)) UI.fmBs = [];
  var sel = fmSel(), v = UI.fmView;
  if(v === "ros"){ if(typeof rlEmbOk === "function" && rlEmbOk()) return '<div class="tg fm" data-key="fm">' + fmHead() + rlEmbed('foreman') + '</div>'; UI.fmView = v = "floor"; }   /* Parsec 14.3 */
  var body = v === "techs" ? fmVTechs(sel) : v === "yard" ? fmVYard(sel) : v === "tmr" ? fmVTmr() : fmVFloor(sel);
  return '<div class="tg fm" data-key="fm">' + fmHead() + '<div class="tg-body v-' + v + '">' + fmList() + '<div class="tg-main" data-key="fm-main-' + v + '">' + body + '</div>' + fmPopHtml() + '</div></div>';
}
function fmHead(){
  var Y = tgYard(), all = fmNeedsAll(), n = function(f){ return all.filter(function(x){ var k = UI.fmFilter; UI.fmFilter = f; var m = fmMatch(x); UI.fmFilter = k; return m; }).length; };
  var ym = yardMap(), fl = fmFloor(), used = fl.filter(function(s){ return ym.map[s.id]; }).length, on = fmTechs().filter(function(t){ var p = fmRunP(t); return p && !fmStuckP(p); }).length;
  var f = function(k, txt, w){ var c = n(k), o = UI.fmFilter === k; return '<button class="tg-hf' + (w ? ' w' : '') + (o ? ' on' : '') + '" data-action="fm-filt" data-k="' + k + '" title="' + (o ? 'Clear the filter' : 'Show only these in Needs action') + '"><b>' + c + '</b>' + txt + (o ? tgI("x", 12) : '') + '</button>'; };
  var rk = n("risk");
  var views = [["floor", "grid", "Floor"], ["techs", "user", "Techs"], ["yard", "pin", "Yard"], ["tmr", "clock", "Tomorrow"]].concat(typeof rlEmbOk === "function" && rlEmbOk() ? [["ros", "list", "ROs"]] : []);
  var search = psmBtn("foreman", "Search — RO, unit, customer, VIN or spot");   /* Parsec 13.1 — the icon opens the search window */
  /* two rows: the title, the facts and the tools; under them the views and the shop's clock. The facts that filter are buttons; the two that only tell are plain. */
  return '<header class="tg-head" data-key="fm-head"><h1 class="tg-h1">Foreman</h1><span class="tg-facts">'
    + '<span class="tg-hf fm-fact"><b>' + used + '</b>of ' + fl.length + ' bays in use</span><span class="tg-hf fm-fact fm-o2"><b>' + on + '</b>of ' + fmTechs().length + ' on the clock</span>'
    + f("you", "waiting on you") + f("tech", n("tech") === 1 ? "needs a tech" : "need a tech") + (rk ? f("risk", "at risk", true) : '') + f("late", "late", true) + '</span>'
    + '<div class="fm-tools">' + search + '<button class="btn ib tg-srch-b" data-v10="hand" title="Shift handover — what the next shift needs" aria-label="Shift handover">' + tgI("doc", 16) + '</button><button class="btn ib tg-srch-b" data-action="fm-pop" data-p="cfg" title="Foreman settings — shop day, bay types, QC, the badge" aria-label="Foreman settings">' + tgI("gear", 16) + '</button>'
    + '<button class="btn tg-newro" data-action="ty-newro" title="New repair order">' + tgI("plus", 15) + '<span>New RO</span></button></div>'
    + '<div class="tg-views" role="tablist">' + views.map(function(x, i){ return '<button role="tab" aria-selected="' + (UI.fmView === x[0]) + '" class="' + (UI.fmView === x[0] ? 'on' : '') + '" data-action="fm-view" data-v="' + x[0] + '" title="' + (x[0] === "ros" ? "Every open RO — the RO list, your columns" : x[2] + ' (' + (i + 1) + ')') + '">' + tgI(x[1], 14) + (x[0] === "ros" ? rlEmbTab() : x[2] + (x[0] === "yard" ? '<b class="fm-n" title="On the yard">' + Y.length + '</b>' : '')) + '</button>'; }).join('') + '</div>'
    + '<span class="fm-clock">Shop time <b data-clock-now>' + fmHM(fmNowH()) + '</b></span>'
    + (UI.fmSrch ? '<div class="tg-srpop" data-fm-keep>' + fmSearchHtml() + '</div>' : '') + '</header>';
}

/* ---------- left: Needs action ---------- */
function fmIsBatch(x){ return (x.g === "tech" && x.act === "assign") || x.g === "in"; }
function fmPlanList(){ return fmNeedsAll().filter(function(x){ return !fmSnoozed(x.ro) && fmIsBatch(x); }).map(function(x){ return x.ro; }).sort(function(a, b){ return fmPOrd(a) - fmPOrd(b); }); }
function fmPOrd(r){ var c = tyCat(r); return c === "arr" ? 2 + ((tgEta(r).eta || 0) % 1e7) / 1e7 : c === "chk" ? 1 : 0; }
function fmList(){
  var G = fmGrouped(), L = fmFlat(), sel = UI.fmSel, kb = !!UI.fmKB, cl = fmClearedList(), bs = UI.fmBs || [];
  var sn = tgYard().filter(function(r){ return fmSnoozed(r); }).sort(function(a, b){ return new Date(a.fmSnz.until) - new Date(b.fmSnz.until); });
  var item = function(x){ var ro = x.ro, on = ro.id === sel, b = fmIsBatch(x), bon = bs.indexOf(ro.id) > -1;
    return '<div class="tg-it' + (on ? ' on' : '') + (on && kb ? ' kb' : '') + (b ? ' fm-bt' : '') + (bon ? ' bon' : '') + '" data-action="fm-sel" data-ro="' + ro.id + '"' + (ro.isTech ? '' : ' draggable="true" data-fm-drag="' + ro.id + '"') + '>' + (x.late && !x.back ? '<i class="tg-dot"></i>' : '')
      + (b ? '<button class="fm-bx' + (bon ? ' on' : '') + '" data-action="fm-bsel" data-ro="' + ro.id + '" title="Tick to plan together  (X)" aria-label="Tick">' + (bon ? tgI("check", 12) : '') + '</button>' : '')
      + (ro.isTech ? '<span class="tg-gi"><span class="tg-av">' + esc(tgIni(ro.name)) + '</span></span>' : trkGi(ro, tgI(x.ic, 15))) + '<span class="tg-t">' + (ro.isTech ? '' : '<b class="tg-no">' + esc(tgNum(ro)) + '</b>') + '<b class="tg-cu">' + esc(ro.customerName || "") + '</b>'
      + (x.back ? '<span class="tg-back">' + tgI("clock", 11) + 'Back</span>' : '') + (ro.isTech ? '' : tgSpotChip(ro)) + '</span>'
      + '<span class="tg-w' + (x.late && !x.back ? ' late' : '') + '">' + v10Age(ro) + esc(x.why) + '</span>'
      + '<button class="btn btn-sm ib tg-snz" data-action="fm-pop" data-p="snooze" data-ro="' + ro.id + '" title="Snooze  (S)">' + tgI("clock", 15) + '<span class="fm-sl">Snooze</span></button>'
      + '<button class="btn btn-sm' + (x.act === "decide" || x.act === "bring" || x.act === "qc" ? ' btn-primary' : '') + ' tg-go" data-action="fm-do" data-ro="' + ro.id + '">' + esc(x.btn) + (on && kb ? '<span class="tg-kbd">↵</span>' : '') + '</button></div>'; };
  var body;
  if(!L.length){
    body = UI.fmFilter ? '<div class="tg-empty"><span class="tg-ring0">' + tgI("check", 22) + '</span><h3>Nothing here</h3><p>No item in Needs action matches.</p><button class="btn btn-sm" data-action="fm-filt" data-k="">Clear filter</button></div>'
      : '<div class="tg-empty"><span class="tg-ring0 ok">' + tgI("check", 22) + '</span><h3>All caught up</h3><p>Nothing needs the foreman right now.</p></div>';
  } else {
    var np = fmPlanList().length;
    body = FM_GROUPS.filter(function(g){ return G[g[0]].length; }).map(function(g){ return '<div class="tg-grp">' + g[1] + '<span>' + G[g[0]].length + '</span>' + (g[0] === "tech" && np > 1 ? '<button class="fm-plan" data-action="fm-plan" data-g="all" title="Suggest a tech and a bay for each, then assign them at once">' + tgI("userPlus", 12) + 'Plan ' + np + ' together</button>' : '') + '</div>' + G[g[0]].map(item).join(''); }).join('');
  }
  if(sn.length) body += '<div class="tg-sec' + (UI.fmOpen.snz ? ' open' : '') + '" data-action="fm-open" data-k="snz">' + tgI("chevR", 12) + '<span>Snoozed</span><span class="n">' + sn.length + '</span><span class="m">next back ' + tgWhen(+new Date(sn[0].fmSnz.until)) + '</span></div>'
    + (UI.fmOpen.snz ? '<div class="tg-rows">' + sn.map(function(r){ return '<div class="tg-row" data-action="fm-sel" data-ro="' + r.id + '"><time>' + tgWhen(+new Date(r.fmSnz.until)) + '</time><b class="tg-no">' + esc(tgNum(r)) + '</b><b class="tg-cu">' + esc(r.customerName || "") + '</b><small>' + esc(r.fmSnz.why || "Snoozed by hand") + '</small><button class="btn btn-sm tg-gh" data-action="fm-wake" data-ro="' + r.id + '">Wake</button></div>'; }).join('') + '</div>' : '');
  body += '<div class="tg-sec' + (UI.fmOpen.clr ? ' open' : '') + '" data-action="fm-open" data-k="clr">' + tgI("chevR", 12) + '<span>Cleared today</span><span class="n">' + cl.length + '</span></div>'
    + (UI.fmOpen.clr ? '<div class="tg-rows">' + (cl.length ? cl.slice().reverse().map(function(c){ var r = fmGet(c.roId); return '<div class="tg-row done"' + (r && (r.isTech || onYard(r)) ? ' data-action="fm-sel" data-ro="' + c.roId + '"' : '') + ' title="' + esc(c.what) + '"><time>' + fmtTime(c.at) + '</time><b class="tg-no">' + esc(c.num) + '</b><b class="tg-cu">' + esc(c.cust) + '</b><small>' + tgI(c.ic || "check", 12) + esc(c.what) + '</small></div>'; }).join('') : '<p class="tg-none">Nothing cleared yet today.</p>') + '</div>' : '');
  var x = fmItemOf(sel), r0 = fmGet(sel);
  var out = L.length && r0 && L.indexOf(sel) < 0 ? '<div class="tg-out">' + (!r0.isTech && fmSnoozed(r0) ? '<b>' + esc(roLabel(r0)) + '</b> is snoozed until ' + tgWhen(+new Date(r0.fmSnz.until)) + '.' : 'Showing <b>' + esc(r0.isTech ? r0.name : roLabel(r0) + ' · ' + (r0.customerName || "")) + '</b> — nothing waiting on it.') + '</div>' : '';
  var keys = bs.length ? '<div class="tg-keys fm-bsb"><b>' + bs.length + ' ticked</b><span class="sp"></span><button class="btn btn-sm tg-gh" data-action="fm-bclr">Clear</button><button class="btn btn-sm btn-primary" data-action="fm-plan" data-g="sel">' + tgI("userPlus", 13) + 'Plan together<span class="tg-kbd">P</span></button></div>'
    : '<div class="tg-keys"><span><span class="tg-kbd">J</span><span class="tg-kbd">K</span>move</span>' + (x ? '<span><span class="tg-kbd">↵</span><b>' + esc(x.btn) + '</b></span>' : '') + '<span><span class="tg-kbd">A</span>assign</span><span><span class="tg-kbd">S</span>snooze</span><span><span class="tg-kbd">T</span>transfer</span><span class="sp"></span><button class="tg-link q" data-action="fm-help" title="All keys"><span class="tg-kbd">?</span>keys</button></div>';
  return '<section class="tg-list' + (bs.length ? ' fm-bmode' : '') + '" data-key="fm-list"><div class="tg-lh">Needs action<span class="n">' + L.length + '</span>' + (UI.fmFilter ? '<button class="tg-fchip' + (UI.fmFilter === "late" || UI.fmFilter === "risk" ? ' w' : '') + '" data-action="fm-filt" data-k="">' + ({ you: "Waiting on you", tech: "Need a tech", late: "Late", risk: "At risk" }[UI.fmFilter]) + tgI("x", 11) + '</button>' : '')
    + '<button class="tg-done" data-action="fm-open" data-k="clr" data-force="1">' + tgI("check", 13) + cl.length + ' cleared today</button></div>'
    + '<div class="tg-scroll" data-scroll="fm-list">' + body + '</div>' + out + keys + '</section>';
}

/* ---------- the selected RO, on top of the Floor ---------- */
function fmQbar(ro){ var I = roInfo(ro); if(!I.q) return ''; var o = I.b > I.q; return '<span class="fm-qb' + (o ? ' over' : '') + '" title="' + fmHh(I.b) + ' on ' + fmHh(I.q) + ' quoted"><span class="m"><i style="width:' + Math.min(100, I.b / I.q * 100).toFixed(0) + '%"></i></span>' + I.b.toFixed(1) + ' / ' + qtRoHtml(ro, I.q, 1) + ' h</span>'; }
function fmOpsStrip(ro){ var L = raOps(ro), fo = fmFound(ro); if(L.length < 2 && !fo.length) return '';
  return '<div class="fm-opl"><span class="k">Ops</span>' + L.map(function(op, i){ var s = fmOpSt(ro, op), found = fo.indexOf(op) > -1;
    return '<button class="fm-opp ' + (found ? 'found' : s[0]) + '" data-action="ra-goop" data-ro="' + ro.id + '" data-op="' + op.id + '" title="' + esc((op.complaint || "Operation") + ' — ' + s[1]) + '"><b>' + (s[0] === "done" ? tgI("check", 10) : i + 1) + '</b><span class="t">' + esc(op.complaint || "Operation") + '</span><i>' + (found ? 'found · to decide' : esc(s[1])) + (op.quoted ? ' · ' + fmHh(+op.quoted) : '') + '</i>' + pstOpMini(ro, op) + '</button>'; }).join('') + '</div>'; }
function fmTop(ro){
  if(!ro) return '<div class="tg-blank">' + esHtml("check", "Nothing on the yard", "Open repair orders show up here.") + '</div>';
  if(ro.isTech) return fmTechTop(ro);
  var c = tyCat(ro), x = fmItemOf(ro.id), run = fmRoRun(ro), st = roStatus(ro).status, r = ro.route;
  var next = x ? x.why : run ? tgFirst(punchWho(run) || ro.assignedTech || "The tech") + " is on it — " + tgDur(Date.now() - new Date(run.start).getTime()) + " so far, " + fmHh(fmLeft(ro)) + " quoted left." : "Nothing waiting on the foreman.";
  var ctx = (st === "Waiting – Foreman" || (r && r.to === "foreman")) && r && r.note ? r.note : "";
  var hold = fmInBay(ro) && st !== "Waiting – Parts" && st !== "Complete – Road test" ? '<button class="btn btn-sm" data-action="fm-pop" data-p="hold" data-ro="' + ro.id + '">' + tgI("parts", 14) + 'Hold for parts…</button>' : '';
  return '<div class="tg-top">' + trkHead(ro) + '<div class="r1"><b class="tg-no">' + esc(roLabelFull(ro)) + '</b><span class="tg-stg" title="The RO’s stage">' + esc(roStageTxt(ro) || TG_CAT[c][0]) + '</span>·<span class="fm-cplt">' + esc(roInfo(ro).complaint || "") + '</span><span class="sp"></span>' + hold
    + '<button class="btn btn-sm" data-action="fm-pop" data-p="xfer" data-ro="' + ro.id + '">' + tgI("swap", 14) + 'Transfer…</button>' + (c !== "arr" ? '<button class="btn btn-sm" data-pm-move="' + ro.id + '" title="Move the truck to an open bay — or drag it on the floor">Move truck</button>' : '') + '<button class="btn btn-sm" data-action="goto-ro" data-ro="' + ro.id + '">Open RO</button></div>'
    + '<h2>' + esc(ro.customerName || "") + '</h2>' + (trxBtnsOk(ro) ? '<div class="trx-b">' + trxBtns(ro) + '</div>' : '') + '<div class="r2">' + tgSpotChip(ro) + '<span class="st">' + tgSi(ro) + '<span>' + esc(tgStTxt(ro)) + '</span></span><span class="fm-who">' + (ro.assignedTech ? '<span class="tg-av">' + esc(tgIni(ro.assignedTech)) + '</span>' + esc(ro.assignedTech) : '<span class="tg-av">—</span>No tech') + '</span>' + v10Fit(ro) + tgHeld(ro) + fmQbar(ro) + '</div>' + fmOpsStrip(ro) + pstTrack(ro, { pg: 'fm', list: true, act: function(S){ return fmPstAct(ro, S); } }) + '</div>'
    + '<div class="tg-next"><span class="k">Next</span><p>' + esc(ctx || next) + '</p>' + (x ? '<button class="btn btn-sm' + (x.act === "decide" || x.act === "bring" || x.act === "qc" ? ' btn-primary' : '') + '" data-action="fm-do" data-ro="' + ro.id + '">' + esc(x.btn) + '<span class="tg-kbd">↵</span></button>' : '') + '<button class="btn btn-sm" data-action="fm-pop" data-p="assign" data-ro="' + ro.id + '">' + tgI("userPlus", 14) + 'Assign…</button></div>';
}
function fmTechTop(T){
  var n = T.name, f = fmFreeTechs().filter(function(x){ return x.n === n; })[0], sh = fmShift(n), wait = fmMine(n).filter(function(r){ return /^Waiting/.test(roStatus(r).status); });
  return '<div class="tg-top"><div class="r1"><span class="tg-av">' + esc(tgIni(n)) + '</span><span>Technician · ' + fmHM(sh[0]) + '–' + fmHM(sh[1]) + '</span><span class="sp"></span><button class="btn btn-sm" data-action="fm-view" data-v="techs">' + tgI("user", 14) + fmHis(n).replace(/^./, function(c){ return c.toUpperCase(); }) + ' lane</button></div>'
    + '<h2>' + esc(n) + '</h2><div class="r2">' + (f ? '<span class="tg-late">' + (f.none ? 'No job clocked yet today' : 'Free ' + tgDur(Date.now() - f.since)) + '</span>' : '') + (f && f.lastRo ? '<span>Last job <b class="tg-no">' + esc(roLabel(f.lastRo)) + '</b> · done ' + fmHM(fmH(f.since)) + '</span>' : '') + '<span>' + fmHh(fmWorkOf(n)) + ' of work · ' + fmHh(fmHoursLeft(n)) + ' left today</span></div></div>'
    + '<div class="tg-next"><span class="k">Next</span><p>' + (f ? 'Nothing ' + fmHe(n) + ' can work on' + (wait.length ? ' — ' + wait.map(function(x){ return tgNum(x) + ' waits on ' + roStatus(x).status.replace(/^Waiting – /, '').toLowerCase(); }).join(', ') : '') + '.' : esc(tgFirst(n)) + ' has work.') + '</p>' + (f ? '<button class="btn btn-sm btn-primary" data-action="fm-do" data-ro="' + T.id + '">Give work<span class="tg-kbd">↵</span></button>' : '') + '</div>';
}
function fmOpById(id){ var hit = null; STATE.ros.some(function(ro){ return (ro.operations || []).some(function(op){ if(op.id === id){ hit = op; return true; } return false; }); }); return hit; }
function fmTodayNums(){ if(FM_TC && Date.now() - FM_TC.t < 2000) return FM_TC.v; var v = fmTodayCalc(); FM_TC = { t: Date.now(), v: v }; return v; }
function fmTodayCalc(){
  var today = todayStr(), now = Date.now(), d0 = fmDayMs(0), clk = 0, flag = 0, seen = {}, per = {};
  STATE.punches.forEach(function(p){ if(isShopPunch(p) || fmStuckP(p)) return; var s = new Date(p.start).getTime(), e = p.stop ? new Date(p.stop).getTime() : now; if(e < d0) return;
    var ms = Math.max(0, e - Math.max(s, d0)), who = punchWho(p) || ""; clk += ms; var k = who.toLowerCase(); per[k] = per[k] || { c: 0, f: 0, j: 0 }; per[k].c += ms / 3600000;
    if(p.stop && p.stopReason === "Complete" && localDay(p.stop) === today && !seen[p.opId]){ seen[p.opId] = 1; var op = fmOpById(p.opId); if(op){ flag += +op.quoted || 0; per[k].f += +op.quoted || 0; per[k].j++; } } });
  return { clk: clk / 3600000, flag: flag, per: per };
}
function fmTodayOf(n){ var P = fmTodayNums().per, hit = null; Object.keys(P).forEach(function(k){ if(techSame(k, n)) hit = P[k]; }); return hit || { c: 0, f: 0, j: 0 }; }
function fmToday(){
  var T = fmTechs(), hl = 0, lined = 0; T.forEach(function(n){ hl += fmHoursLeft(n); lined += fmWorkOf(n); });
  var N = fmTodayNums(), F = fmFreeBays(), fl = fmFloor(), on = T.filter(function(n){ var p = fmRunP(n); return p && !fmStuckP(p); }).length, eff = N.clk ? Math.round(N.flag / N.clk * 100) : 0;
  var hrsIn = Math.max(0.5, fmNowH() - fmCfg().start) * Math.max(1, T.length);
  var cell = function(l, v, sub, pct, extra){ return '<div class="fm-st"' + (extra || '') + '><span class="l">' + l + '</span><b>' + v + '</b><span class="m"><i style="width:' + Math.max(0, Math.min(100, pct)).toFixed(0) + '%"></i></span><small>' + sub + '</small></div>'; };
  return '<div class="fm-today">' + cell('Lined up for today', fmHh(lined), 'of ' + fmHh(hl) + ' left · ' + fmHh(Math.max(0, hl - lined)) + ' open', hl ? lined / hl * 100 : 0)
    + cell('Clocked today', fmHh(N.clk), on + ' of ' + T.length + ' on now', N.clk / hrsIn * 100) + cell('Flagged today', fmHh(N.flag), N.clk ? eff + '% of clocked' : 'nothing finished yet', eff)
    + cell('Bays', (fl.length - F.length) + ' / ' + fl.length, F.length ? F.length + ' free now — click to fill' : 'none free', fl.length ? (fl.length - F.length) / fl.length * 100 : 0, F.length ? ' data-action="fm-fill" data-bay="' + esc(F[0]) + '" role="button"' : '') + '</div>';
}
function fmBayTile(s, sel, ym){
  var ro = ym.map[s.id], b = s.id, lb = tgSpotLbl(b), bt = fmBayTxt(b), now = Date.now();
  if(!ro) return '<div class="fm-bay free fill" data-action="fm-fill" data-bay="' + esc(b) + '" data-fm-drop="' + esc(b) + '" role="button" title="Fill ' + esc(lb) + '"><div class="r1"><span class="l">' + esc(lb) + '</span>' + (bt ? '<span class="bt">' + esc(bt) + '</span>' : '') + '<span class="st">free now</span></div><span class="open">' + tgI("plus", 13) + 'Fill this bay</span></div>';
  var p = fmRoRun(ro), st = roStatus(ro).status, c = '', stt = '', I = roInfo(ro);
  if(p && fmStuckP(p)){ c = 'idle stuck'; stt = tgI("clock", 12) + 'Since ' + (localDay(p.start) === todayStr() ? fmHM(fmH(new Date(p.start).getTime())) : fmDayName(localDay(p.start))); }
  else if(p){ c = 'on'; stt = '<span class="tg-live" style="background:var(--tg-st-working)"></span>' + tgDur(now - new Date(p.start).getTime()); }
  else if(st === "Complete – Road test"){ c = 'done'; stt = !rtNeeded(ro) ? tgI("check", 12) + 'Ready to release' : ro.roadTest ? (ro.fmQc && ro.fmQc.s === "pass" ? tgI("check", 12) + 'Ready to go' : tgI("check", 12) + 'QC next') : tgI("road", 12) + 'Road test next'; }
  else if(fmWorkable(ro) && ro.assignedTech && !fmOpsDone(ro) && (roIdleMs(ro) || 0) >= 15 * 60000){ c = 'idle'; stt = 'Nobody on · ' + tgDur(roIdleMs(ro)); }
  else if(fmWorkable(ro) && ro.assignedTech){ c = 'wait'; stt = 'Up next'; }
  else { c = 'wait'; stt = tgSi(ro) + esc(st.replace(/^Waiting – /, '').replace(/^Complete – /, '').toLowerCase()); }
  var f = fmFreeAt(ro), k = fmRisk(ro);
  var right = k ? '<span class="hrs risk">' + tgI("flag", 11) + (k.ph < 0 ? 'late' : fmHM(k.ph)) + ' · ' + (k.ready != null ? '~' + fmHM(k.ready) : esc(k.txt || '')) + '</span>' : '<span class="hrs">' + (f.t != null ? (f.k === "done" ? esc(f.txt) : 'free ~' + fmHM(f.t)) : esc(f.txt)) + '</span>';
  var tv = trkBayTop(ro);
  return '<div class="fm-bay ' + c + (k ? ' risk' : '') + (sel && sel.id === ro.id ? ' sel' : '') + (UI.fmFlash === b ? ' flash' : '') + (tv ? ' has-top' : '') + '" data-action="fm-sel" data-ro="' + ro.id + '" draggable="true" data-fm-drag="' + ro.id + '" role="button" tabindex="0" aria-pressed="' + !!(sel && sel.id === ro.id) + '" title="' + esc((ro.customerName || "") + ' · ' + tgStTxt(ro) + (I.q ? ' · ' + I.b.toFixed(1) + ' of ' + I.q.toFixed(1) + ' h' : '') + (ro.promisedAt ? ' · promised ' + tgWhen(new Date(ro.promisedAt).getTime()) : '')) + '">'
    + tv + '<div class="r1"><span class="l">' + esc(lb) + '</span>' + (bt ? '<span class="bt">' + esc(bt) + '</span>' : '') + '<span class="st">' + stt + '</span></div><div class="t"><b class="tg-no">' + esc(tgNum(ro)) + '</b><b class="cu">' + esc(ro.customerName || "") + '</b></div>'
    + '<div class="r3">' + (ro.assignedTech ? '<span class="tg-av">' + esc(tgIni(ro.assignedTech)) + '</span><span class="nm">' + esc(tgFirst(ro.assignedTech)) + '</span>' : '<span class="nm">No tech</span>') + right + '</div>'
    + (I.q ? '<span class="ln' + (I.b > I.q ? ' over' : '') + '"><i style="width:' + Math.min(100, I.b / I.q * 100).toFixed(0) + '%"></i></span>' : '') + '</div>';
}
function fmDayV(sel, ym){
  var fl = fmFloor(), T0 = fmNowH(), T1 = Math.max(fmCfg().end, Math.max.apply(null, fmTechs().map(function(n){ return fmShift(n)[1]; }).concat([fmCfg().end]))) + 0.25;
  if(T1 - T0 < 1.5) T0 = T1 - 1.5;
  var X = function(h){ return Math.max(0, Math.min(1, (h - T0) / (T1 - T0))) * 100; }, P = function(v){ return v.toFixed(2) + '%'; }, L = fmCfg().lunch;
  var ticks = []; for(var h = Math.ceil(T0 + 0.3); h < T1; h++) ticks.push(h);
  var arr = tgYard().filter(function(r){ return tyCat(r) === "arr" && tgEta(r).eta && localDay(new Date(tgEta(r).eta).toISOString()) === todayStr(); });
  var axis = '<div class="fm-dax"><span class="lab"></span><div class="trk"><span class="now">now ' + fmHM(fmNowH()) + '</span>' + ticks.map(function(h){ return '<span class="tk" style="left:' + P(X(h)) + '">' + fmHM(h) + '</span>'; }).join('') + '</div></div>'
    + (arr.length ? '<div class="fm-dax arr-row"><span class="lab">In</span><div class="trk">' + arr.map(function(r){ var e = fmH(tgEta(r).eta); return '<button class="arr" data-action="fm-sel" data-ro="' + r.id + '" style="left:' + P(X(e)) + '" title="' + esc(r.customerName || "") + ' — arriving ~' + fmHM(e) + '">' + tgI("inArrow", 11) + esc(tgNum(r)) + ' ~' + fmHM(e) + '</button>'; }).join('') + '</div></div>' : '');
  var lun = '<i class="lun" style="left:' + P(X(L[0])) + ';width:' + P(X(L[1]) - X(L[0])) + '"></i>';
  var rows = fl.map(function(s){ var b = s.id, ro = ym.map[b], pl = tgYard().filter(function(x){ return x.fmPlan && x.fmPlan.bay === b && x !== ro; }), h = '', from = T0, edge = 0;
    if(ro){ var f = fmFreeAt(ro), k = fmRisk(ro), st = f.start && f.start > T0 ? f.start : T0, end = f.t == null ? T1 : Math.min(T1, f.t);
      var cls = f.k === "on" ? "on" : f.k === "stuck" ? "stuck" : f.k === "next" ? "next" : f.k === "done" ? "done" : "wait";
      if(st > T0 + 0.01) h += '<span class="pre" style="left:0;width:' + P(X(st)) + '" title="' + esc(tgFirst(ro.assignedTech || "")) + ' is on another truck until ~' + fmHM(st) + '"></span>';
      h += '<button class="bar ' + cls + (k ? ' risk' : '') + (sel && sel.id === ro.id ? ' sel' : '') + '" data-action="fm-sel" data-ro="' + ro.id + '" style="left:' + P(X(st)) + ';width:' + P(Math.max(3, X(end) - X(st))) + '" title="' + esc((ro.customerName || "") + ' · ' + (f.t != null ? 'free ~' + fmHM(f.t) : f.txt)) + '"><b>' + esc(tgNum(ro)) + '</b>' + esc(tgFirst(ro.assignedTech || "")) + (f.t == null ? ' · ' + esc(f.txt) : '') + '</button>';
      if(ro.promisedAt && localDay(ro.promisedAt) === todayStr()){ var ph = fmH(new Date(ro.promisedAt).getTime()); h += '<i class="pm' + (k ? ' bad' : '') + '" style="left:' + P(X(ph)) + '" title="Promised ' + fmHM(ph) + '"></i>'; }
      from = f.t == null ? T1 : f.t; edge = X(st) + Math.max(3, X(end) - X(st)); }
    pl.forEach(function(x){ var at = x.fmPlan.at != null ? x.fmPlan.at : from, e = fmAddWork(at, fmLeft(x)); h += '<button class="bar plan' + (sel && sel.id === x.id ? ' sel' : '') + '" data-action="fm-sel" data-ro="' + x.id + '" style="left:' + P(X(at)) + ';width:' + P(Math.max(3, X(e) - X(at))) + '" title="Planned"><b>' + esc(tgNum(x)) + '</b>' + esc(tgFirst(x.assignedTech || "")) + ' · planned</button>'; from = Math.max(from, e); edge = Math.max(edge, X(at) + Math.max(3, X(e) - X(at))); });
    if(from < T1 - 0.2) h += '<button class="gap" data-action="fm-fill" data-bay="' + esc(b) + '"' + (from > T0 + 0.01 ? ' data-at="' + from.toFixed(3) + '"' : '') + ' style="left:' + P(Math.max(X(from), edge)) + ';width:' + P(100 - Math.max(X(from), edge)) + '">' + (from > T0 + 0.01 ? 'free ~' + fmHM(from) : tgI("plus", 11) + 'free now — fill ' + esc(tgSpotLbl(b))) + '</button>';   /* a free stretch under 12 minutes is too thin to press, so it isn't offered */
    return '<div class="fm-drow"><span class="lab" title="' + esc(fmBayTxt(b) || tgZone(b)) + '">' + esc(tgSpotLbl(b)) + '</span><div class="trk">' + lun + h + '</div></div>'; }).join('');
  return '<div class="fm-day">' + axis + rows + '<div class="tg-leg"><span><i class="lg on"></i>On the clock</span><span><i class="lg next"></i>Up next</span><span><i class="lg wait"></i>Waiting — no time yet</span><span><i class="lg plan"></i>Planned</span><span><i class="pmk"></i>Promised</span><span><i class="lg lun"></i>Lunch</span><span class="hint">Click a free stretch to fill it</span></div></div>';
}
function fmVFloor(sel){
  var ym = yardMap(), fl = fmFloor(), F = fmFreeBays(), used = fl.length - F.length;
  var nf = fl.map(function(s){ var x = ym.map[s.id]; if(!x) return null; var f = fmFreeAt(x); return f.t != null && f.k !== "done" ? { b: s.id, t: f.t, x: x } : null; }).filter(Boolean).sort(function(a, c){ return a.t - c.t; }).slice(0, 3);
  var wt = fmNeeds().filter(function(x){ return !x.ro.isTech && !fmInBay(x.ro) && (x.g === "in" || (x.g === "tech" && x.act === "assign")); }).map(function(x){ return x.ro; });
  var hdr = '<div class="fm-bh">Bays<small>' + used + ' of ' + fl.length + ' in use</small><span class="fm-nf">' + (F.length ? '<b>' + F.length + ' free now</b>' : '') + (nf.length ? 'Next free' + nf.map(function(o){ return '<button class="fm-nfc" data-action="fm-sel" data-ro="' + o.x.id + '" title="' + esc(o.x.customerName || "") + '">' + esc(tgSpotLbl(o.b)) + ' ~' + fmHM(o.t) + '</button>'; }).join('') : '') + '</span>'
    + '<button class="tg-link fm-btl" data-action="fm-pop" data-p="bays" title="Set what each bay has — pit, lift, crane, exhaust hose, alignment rack">' + (fmBayOn() ? 'Bay types' : 'Set bay types') + '</button>'
    + '<span class="tg-seg3 fm-mode"><button class="' + (UI.fmDay ? '' : 'on') + '" data-action="fm-daymode" data-v="0">Grid</button><button class="' + (UI.fmDay ? 'on' : '') + '" data-action="fm-daymode" data-v="1">Day</button></span></div>';
  return '<div class="fm-fl">' + fmTop(sel) + fmToday() + '<div class="fm-bays" data-scroll="fm-bays">' + hdr + (UI.fmDay ? fmDayV(sel, ym) : '<div class="fm-grid">' + fl.map(function(s){ return fmBayTile(s, sel, ym); }).join('') + '</div>')
    + '<div class="fm-wt"><span class="k">Waiting for a bay</span>' + (wt.length ? wt.map(function(x){ return '<span class="fm-chip' + (sel && x.id === sel.id ? ' sel' : '') + '" data-action="fm-sel" data-ro="' + x.id + '" draggable="true" data-fm-drag="' + x.id + '" role="button">' + tgSq(tyCat(x)) + '<b class="tg-no">' + esc(tgNum(x)) + '</b>' + esc(String(x.customerName || "").split(" ")[0]) + '<small>' + (x.fmPlan ? '→ ' + esc(tgSpotLbl(x.fmPlan.bay)) + (x.fmPlan.at != null ? ' ~' + fmHM(x.fmPlan.at) : '') : (x.assignedTech ? esc(tgFirst(x.assignedTech)) : 'no tech') + ' · ' + esc(tgSpotLbl(tgSpotOf(x)))) + '</small></span>'; }).join('') : '<span class="tg-none">Nothing waiting.</span>') + '<span class="hint">Drag onto an open bay, or click one</span></div></div></div>';
}

/* ---------- Techs: an order, skills, real hours, today ---------- */
function fmTechSub(ro){ var p = fmRoRun(ro), st = roStatus(ro).status, idle = !p && fmWorkable(ro) && fmInBay(ro) && !fmOpsDone(ro) && ro.assignedTech && (roIdleMs(ro) || 0) >= 15 * 60000;
  if(p && fmStuckP(p)) return [tgI("clock", 11) + 'clock since ' + fmDayName(localDay(p.start)), 'bad']; if(ro.roadTest && ro.roadTest.result === "Fail" && ro.fmRtOk !== (ro.roadTest.at || "1")) return ['road test failed', 'bad'];
  if(p) return [tgI("clock", 11) + 'on the clock · ' + tgDur(Date.now() - new Date(p.start).getTime()), ''];
  if(tyCat(ro) === "arr") return ['arriving' + (tgEta(ro).eta ? ' ~' + tgWhen(tgEta(ro).eta) : ''), ''];
  if(tyCat(ro) === "chk" && !ro.assignedTech) return ['checked in ' + tgDur(ageSince(ro.dateOpened)) + ' ago', (ageSince(ro.dateOpened) || 0) > 2 * 3600000 ? 'warn' : ''];
  if(st === "Complete – Road test") return [!rtNeeded(ro) ? 'ready to release' : ro.roadTest ? (ro.fmQc && ro.fmQc.s === "pass" ? 'QC passed · with Approval' : tgI("check", 11) + 'QC next') : 'road test next', ''];
  if(/^Waiting/.test(st)) return [esc(st.replace(/^Waiting – /, 'waiting · ').toLowerCase()), ''];
  if(ro.fmQc && ro.fmQc.s === "back") return ['back from QC · ' + esc(String(ro.fmQc.why || "").toLowerCase()), 'warn'];
  if(idle) return ['nobody on · ' + tgDur(roIdleMs(ro)), 'warn'];
  var I = roInfo(ro); if(I.q && I.b > I.q * 1.25) return ['over the quote · ' + I.b.toFixed(1) + ' / ' + I.q.toFixed(1) + ' h', 'warn'];
  return [fmHh(fmLeft(ro)) + ' · ' + (fmInBay(ro) ? 'in ' : 'on ') + esc(tgSpotLbl(tgSpotOf(ro))), '']; }
function fmCard(ro, sel, n, ord){ var c = fmRoRun(ro) ? 'now' : /^Waiting/.test(roStatus(ro).status) ? 'wait' : 'next', need = fmSkillsOn() ? fmNeed(ro) : null, fit = fmFits(n, ro), sb = fmTechSub(ro);
  return '<div class="fm-card ' + c + (sel && sel.id === ro.id ? ' sel' : '') + '" data-action="fm-sel" data-ro="' + ro.id + '" draggable="true" data-fm-drag="' + ro.id + '" data-ord="' + ord + '" data-k="' + esc(n || "") + '" role="button"><div class="r1">'
    + (ord ? '<span class="fm-ord" title="#' + ord + ' in ' + esc(tgFirst(n)) + '’s order">' + ord + '</span>' : tgSi(ro)) + '<b class="tg-no">' + esc(tgNum(ro)) + '</b>' + (need ? '<span class="fm-skt' + (fit ? '' : ' no') + '" title="Needs ' + esc(need) + (fit ? '' : ' — ' + esc(tgFirst(n)) + ' isn’t marked for it') + '">' + FM_SKA[need] + '</span>' : '') + tgSpotChip(ro) + '</div>'
    + '<div class="cu">' + esc(ro.customerName || "") + '</div><div class="r3' + (sb[1] ? ' ' + sb[1] : '') + '">' + sb[0] + '</div></div>'; }
function fmDayBar(n, wk){ var T0 = fmNowH(), sh = fmShift(n), T1 = Math.max(sh[1], fmCfg().end) + 0.01, L = fmCfg().lunch, o = fmOffPart(n, todayStr()), e = sh[1];
  if(T1 - T0 < 1) T0 = T1 - 1;
  var X = function(h){ return Math.max(0, Math.min(100, (h - T0) / (T1 - T0) * 100)); }, g = '';
  if(e < T1 - 0.02) g += '<i class="gone" style="left:' + X(e) + '%;width:' + (100 - X(e)) + '%" title="Shift ends ' + fmHM(e) + '"></i>';
  if(o) g += '<i class="off" style="left:' + X(o.from) + '%;width:' + (X(Math.min(o.to, e)) - X(o.from)) + '%" title="' + esc(o.why || "Out") + '"></i>';
  g += '<i class="lun" style="left:' + X(L[0]) + '%;width:' + (X(L[1]) - X(L[0])) + '%" title="Lunch"></i>';
  var blocks = [L].concat(o ? [[o.from, o.to]] : []), tt = T0, need = wk, guard = 0;
  while(need > 0.01 && tt < e && guard++ < 20){ var bk = blocks.filter(function(b){ return tt >= b[0] && tt < b[1]; })[0]; if(bk){ tt = bk[1]; continue; }
    var nb = Math.min.apply(null, [e].concat(blocks.filter(function(b){ return b[0] > tt; }).map(function(b){ return b[0]; }))), take = Math.min(need, nb - tt);
    g += '<i class="wk" style="left:' + X(tt) + '%;width:' + (X(tt + take) - X(tt)) + '%"></i>'; tt += take; need -= take; }
  var lab = function(h, txt, cls){ var x = X(h); return '<span class="' + (cls || '') + '" style="left:' + x + '%;transform:translateX(' + (x > 88 ? '-100%' : x < 6 ? '0' : '-50%') + ')">' + txt + '</span>'; };
  return '<div class="fm-dbar' + (need > 0.01 ? ' spill' : '') + '"><div class="trk">' + g + (need > 0.01 ? '<i class="sp"></i>' : '') + '</div><div class="ax">' + lab(T0, fmHM(T0)) + (L[0] > T0 ? lab((L[0] + L[1]) / 2, 'lunch') : '') + (o && o.from > T0 ? lab(o.from, 'out ' + fmHM(o.from), 'w') : '') + lab(e, 'off ' + fmHM(e)) + '</div></div>'; }
function fmVTechs(sel){
  var tmr = fmTmrDay();
  var lane = function(n){ var run = fmRunOf(n), rp = fmRunP(n), nx = fmUpNext(n), wt = fmMine(n).filter(function(r){ return /^Waiting/.test(roStatus(r).status) || roStatus(r).status === "Complete – Road test"; }), hl = fmHoursLeft(n), wk = fmWorkOf(n), w8 = fmWaitOf(n), f = fmFreeTechs().filter(function(x){ return x.n === n; })[0], T = fmTodayOf(n), o = fmOffPart(n, todayStr()), offT = fmOffAll(n, tmr), offD = fmOffAll(n, todayStr());
    var over = fmR1(wk) - fmR1(hl), S = fmSkillsOf(n), cap = '<span>' + fmHh(wk) + ' lined up · ' + fmHh(hl) + ' left</span>' + (over > 0.05 ? '<b class="bad" title="' + (offT ? 'Doesn’t fit today and ' + fmHe(n) + '’s off tomorrow' : 'Doesn’t fit today — rolls to tomorrow') + '">' + (offT ? fmHh(over) + ' over' : '+' + fmHh(over) + ' tomorrow') + '</b>' : '<b class="ok">room ' + fmHh(Math.max(0, fmR1(hl) - fmR1(wk))) + '</b>');
    var shopP = rp && isShopPunch(rp);
    return '<div class="fm-lane fm-lane2' + (sel && sel.isTech && sel.name === n ? ' sel' : '') + '" data-fm-lane="' + esc(n) + '"><div class="fm-lh">'
      + '<span class="nm"><span class="tg-av">' + esc(tgIni(n)) + '</span>' + esc(n) + (run && !fmStuckP(rp) ? '<i class="on"></i>' : '') + '<button class="fm-ske" data-action="fm-pop" data-p="skills" data-ro="T:' + esc(n) + '" title="Skills and hours">' + tgI("pencil", 12) + '</button></span>'
      + '<span class="now">' + (offD ? '<span class="warnt">Off today</span>' : rp ? (fmStuckP(rp) ? '<span class="bad">Clock since ' + fmDayName(localDay(rp.start)) + ' · ' + esc(run ? tgSpotLbl(tgSpotOf(run)) : '') + '</span>' : shopP ? 'Shop time · ' + tgDur(Date.now() - new Date(rp.start).getTime()) : 'On ' + esc(run ? tgSpotLbl(tgSpotOf(run)) || tgNum(run) : '') + ' · ' + tgDur(Date.now() - new Date(rp.start).getTime())) : f ? '<span class="warnt">' + (f.none ? 'No job yet today' : 'Free ' + tgDur(Date.now() - f.since)) + '</span>' : 'No clock running')
      + (o ? ' · <span class="warnt">' + esc(o.why || ('out from ' + fmHM(o.from))) + '</span>' : '') + (offT ? ' · off tomorrow' : '') + '</span>'
      + (S.length ? '<span class="fm-sks">' + S.map(function(x){ return '<span class="fm-sk">' + esc(x) + '</span>'; }).join('') + '</span>' : '<span class="fm-sks"><button class="fm-sk none" data-action="fm-pop" data-p="skills" data-ro="T:' + esc(n) + '">Set skills</button></span>')
      + fmDayBar(n, wk) + '<small class="fm-capt"' + (w8 ? ' title="Not counted: ' + fmHh(w8) + ' waiting on parts, the customer or support"' : '') + '>' + cap + '</small>'
      + '<div class="fm-tdy"><span class="lb">Today</span><span><small>Clocked</small><b>' + T.c.toFixed(1) + '</b></span><span><small>Flagged</small><b>' + T.f.toFixed(1) + '</b></span><span><small>Flag %</small><b class="' + (T.c > 0.5 && T.f / T.c < 0.8 ? 'warnt' : '') + '">' + (T.c > 0.05 ? Math.round(T.f / T.c * 100) + '%' : '—') + '</b></span><span><small>Done</small><b>' + T.j + '</b></span></div></div>'
      + '<div class="fm-cards">' + (run ? fmCard(run, sel, n, 0) : '') + nx.map(function(r, i){ return fmCard(r, sel, n, i + 1); }).join('') + wt.map(function(r){ return fmCard(r, sel, n, 0); }).join('') + (!run && !nx.length && !wt.length ? '<span class="fm-none">Nothing assigned</span>' : '') + '</div></div>'; };
  var none = tgYard().filter(function(r){ return !r.assignedTech && (tyCat(r) === "chk" || tyCat(r) === "arr"); });
  var T = fmTechs();
  return '<div class="fm-tv" data-scroll="fm-techs"><div class="fm-lane fm-lane2 none" data-fm-lane=""><div class="fm-lh"><span class="nm">No tech yet</span><span class="now">Checked in and arriving — drag onto a tech</span></div><div class="fm-cards">' + (none.map(function(r){ return fmCard(r, sel, "", 0); }).join('') || '<span class="fm-none">Everyone has a tech</span>') + '</div></div>'
    + (T.length ? T.map(lane).join('') : '<p class="tg-none" style="padding:12px">No technicians yet — add them under Manager → Staff.</p>')
    + '<div class="tg-leg"><span><span class="fm-ord">1</span>Order — drag a card onto another to put it ahead</span>' + (fmSkillsOn() ? '<span><span class="fm-skt">BRK</span>Skill the job needs</span><span><span class="fm-skt no">BRK</span>Tech isn’t on it</span>' : '<span>Set skills with the pencil to match techs to jobs</span>') + '<span class="hint">Techs see the same order on their Console</span></div></div>';
}

/* ---------- Yard: the Triage yard, selecting here ---------- */
function fmVYard(sel){
  var f = UI.tgFilter, c = UI.tgClash, h; UI.tgFilter = null; UI.tgClash = UI.fmClash || null;
  try{ h = tgVYard(sel && !sel.isTech ? sel : null); } finally { UI.tgFilter = f; UI.tgClash = c; }
  return h.replace(/data-action="tg-sel"/g, 'data-action="fm-sel"').replace(/data-action="tg-clash"/g, 'data-action="fm-clash"').replace(/data-action="tg-clash-x"/g, 'data-action="fm-clash-x"').replace(/data-action="tg-keep"/g, 'data-action="fm-keep"');
}

/* ---------- Tomorrow: the plan and the handoff note ---------- */
function fmTmr(){ var d = fmTmrDay(), T = STATE.fmTmr;
  if(!T || typeof T !== "object" || T.d !== d){ var keep = T && Array.isArray(T.book) ? T.book.filter(function(b){ return !b.d || b.d >= d; }) : []; T = STATE.fmTmr = { d: d, P: null, un: [], book: keep }; }
  if(!Array.isArray(T.book)) T.book = []; if(!Array.isArray(T.un)) T.un = []; return T; }
function fmTmTechs(){ var d = fmTmrDay(); return fmTechs().filter(function(n){ return !fmOffAll(n, d); }); }
function fmTmItems(){
  var d = fmTmrDay(), L = [], seen = {};
  fmTmr().book.filter(function(b){ return !b.d || b.d === d; }).forEach(function(b){ var need = null, t = String(b.cmp || ""); for(var i = 0; i < FM_SKW.length; i++) if(FM_SKW[i][1].test(t)){ need = FM_SKW[i][0]; break; }
    L.push({ id: b.id, no: b.ro || "", cust: b.cust || "Booking", cmp: b.cmp || "", kind: "appt", at: +b.at || null, q: +b.q || 2, need: b.need || need, book: true }); });
  tgYard().forEach(function(ro){ if(seen[ro.id]) return; var st = roStatus(ro).status;
    if(st === "Waiting – Parts" && fmPartsEta(ro) === d){ seen[ro.id] = 1; L.push({ id: ro.id, ro: ro, no: tgNum(ro), cust: ro.customerName || "", cmp: (ro.fmHold && ro.fmHold.op) || roInfo(ro).complaint, kind: "parts", at: ro.fmHold && ro.fmHold.h != null ? ro.fmHold.h : 10, q: fmLeft(ro), need: fmNeed(ro), tech0: (ro.fmHold && ro.fmHold.back) || ro.assignedTech || "" }); }
    else if(tyCat(ro) === "arr" && tgEta(ro).eta && localDay(new Date(tgEta(ro).eta).toISOString()) === d){ seen[ro.id] = 1; L.push({ id: ro.id, ro: ro, no: tgNum(ro), cust: ro.customerName || "", cmp: roInfo(ro).complaint, kind: "appt", at: fmH(tgEta(ro).eta), q: fmLeft(ro), need: fmNeed(ro), tech0: ro.assignedTech || "" }); }
    else if(st === "Waiting – Customer" && ro.assignedTech){ seen[ro.id] = 1; L.push({ id: ro.id, ro: ro, no: tgNum(ro), cust: ro.customerName || "", cmp: roInfo(ro).complaint, kind: "maybe", q: fmLeft(ro), need: fmNeed(ro), tech0: ro.assignedTech }); } });
  fmTechs().forEach(function(n){ var hl = fmHoursLeft(n), run = fmRunOf(n), rp = fmRunP(n), used = 0, Q = (run && !fmStuckP(rp) ? [run] : []).concat(fmUpNext(n));
    Q.forEach(function(ro){ if(seen[ro.id]) return; var h = fmLeft(ro); if(used + h <= hl + 0.05){ used += h; return; } var rest = used >= hl ? h : used + h - hl; used += h; seen[ro.id] = 1;
      L.push({ id: ro.id, ro: ro, no: tgNum(ro), cust: ro.customerName || "", cmp: roInfo(ro).complaint, kind: "carry", q: fmR1(rest), part: rest < h - 0.05, need: fmNeed(ro), tech0: n }); }); });
  return L;
}
var FM_KORD = { parts: 0, carry: 1, appt: 2, maybe: 3 };
function fmTmFits(n, need){ var S = fmSkillsOf(n); return !need || !S.length || S.indexOf(need) > -1; }
function fmTmAuto(L, P0){ var TT = fmTmTechs(), P = {}, room = {}, d = fmTmrDay(), un = []; TT.forEach(function(k){ P[k] = (P0 && P0[k]) || []; room[k] = fmDayCap(k, d); });
  var M = {}; L.forEach(function(x){ M[x.id] = x; }); TT.forEach(function(k){ P[k] = P[k].filter(function(id){ return M[id]; }); P[k].forEach(function(id){ room[k] -= M[id].q; }); });
  var placed = {}; TT.forEach(function(k){ P[k].forEach(function(id){ placed[id] = 1; }); });
  L.slice().sort(function(a, b){ return FM_KORD[a.kind] - FM_KORD[b.kind] || (a.at || 0) - (b.at || 0); }).forEach(function(x){ if(placed[x.id]) return; if(x.kind === "maybe"){ un.push(x.id); return; }
    var t = null; TT.forEach(function(k){ if(!t && x.tech0 && techSame(k, x.tech0) && x.kind !== "appt") t = k; });
    if(!t){ var C = TT.filter(function(k){ return fmTmFits(k, x.need); }).sort(function(a, b){ return room[b] - room[a]; }); t = C.filter(function(k){ return room[k] >= x.q - 0.05; })[0] || null; }
    if(t){ P[t].push(x.id); room[t] -= x.q; } else un.push(x.id); });
  return { P: P, un: un }; }
function fmTmPlan(){ var T = fmTmr(), L = fmTmItems(), ids = {}; L.forEach(function(x){ ids[x.id] = 1; });
  if(!T.P){ var A = fmTmAuto(L, null); T.P = A.P; T.un = A.un; }
  var seen = {}, keep = function(id){ if(!ids[id] || seen[id]) return false; seen[id] = 1; return true; };
  fmTmTechs().forEach(function(k){ if(!Array.isArray(T.P[k])) T.P[k] = []; });
  Object.keys(T.P).forEach(function(k){ T.P[k] = T.P[k].filter(keep); }); T.un = T.un.filter(keep);
  Object.keys(T.P).forEach(function(k){ if(!fmTmTechs().some(function(t){ return t === k; })){ T.un = T.un.concat(T.P[k]); delete T.P[k]; } });
  L.forEach(function(x){ if(!seen[x.id]){ seen[x.id] = 1; T.un.push(x.id); } });
  return { L: L, P: T.P, un: T.un }; }
function fmTmWhy(x){ return x.kind === "appt" ? (x.at != null ? 'booked ' + fmHM(x.at) + ' · ' : 'booked · ') + fmHh(x.q) : x.kind === "parts" ? 'part due ~' + fmHM(x.at) + ' · ' + fmHh(x.q) : x.kind === "carry" ? (x.part ? 'finish from today · ' + fmHh(x.q) + ' left' : 'rolls over from today · ' + fmHh(x.q)) : 'if approval comes · ' + fmHh(x.q); }
function fmTmNote(){ var R = fmTmPlan(), M = {}, out = [], d = fmTmrDay(); R.L.forEach(function(x){ M[x.id] = x; });
  fmTechs().forEach(function(n){ if(fmOffAll(n, d)) out.push(tgFirst(n) + " is off " + fmDayName(d) + "."); else { var o = fmOffPart(n, d); if(o) out.push(tgFirst(n) + " is out from " + fmHM(o.from) + "."); } });
  R.un.map(function(id){ return M[id]; }).filter(function(x){ return x && x.kind !== "maybe"; }).forEach(function(x){ var who = fmTmTechs().filter(function(k){ return fmTmFits(k, x.need); });
    out.push((x.no ? x.no + " " : "") + x.cust + " (" + String(x.cmp || "").toLowerCase() + ") has no tech yet" + (x.need && !who.length ? " — nobody in " + fmDayName(d) + " does " + x.need : "") + "."); });
  fmTmTechs().forEach(function(k){ var f = R.P[k] && R.P[k][0] && M[R.P[k][0]]; if(!f) return; out.push(tgFirst(k) + ": start on " + (f.no ? f.no + " " : "") + f.cust + (f.kind === "parts" ? " when the part lands ~" + fmHM(f.at) : f.kind === "appt" && f.at != null ? " — booked " + fmHM(f.at) : f.kind === "carry" ? " — finish it first" : "") + "."); });
  tgYard().filter(function(r){ return roStatus(r).status === "Waiting – Parts" && fmInBay(r); }).forEach(function(r){ out.push(tgSpotLbl(tgSpotOf(r)) + " stays blocked by " + tgNum(r) + " until its part shows."); });
  return out.map(function(s){ return "• " + s; }).join("\n"); }
function fmVTmr(){
  var R = fmTmPlan(), M = {}, d = fmTmrDay(), T = fmTmr(), TT = fmTmTechs(); R.L.forEach(function(x){ M[x.id] = x; });
  var card = function(x, i, k){ var fit = !k || fmTmFits(k, x.need), sel = UI.fmTsel === x.id;
    return '<div class="fm-tmk ' + x.kind + (sel ? ' sel' : '') + '" draggable="true" data-fm-tdrag="' + esc(x.id) + '" data-action="fm-tsel" data-id="' + esc(x.id) + '" role="button"><div class="r1">' + (k ? '<span class="fm-ord">' + (i + 1) + '</span>' : '') + (x.no ? '<b class="tg-no">' + esc(x.no) + '</b>' : '') + (x.need && fmSkillsOn() ? '<span class="fm-skt' + (fit ? '' : ' no') + '">' + FM_SKA[x.need] + '</span>' : '') + '<span class="kd">' + ({ appt: "Booked", parts: "Parts", carry: "Carry-over", maybe: "Maybe" })[x.kind] + '</span></div>'
      + '<div class="cu">' + esc(x.cust) + '</div><div class="r3">' + esc(fmTmWhy(x)) + '</div>'
      + (sel ? '<div class="fm-tmv">' + TT.map(function(t){ return '<button class="tg-chip' + (k === t ? ' on' : '') + '" data-action="fm-tmv" data-id="' + esc(x.id) + '" data-k="' + esc(t) + '">' + esc(tgFirst(t)) + '</button>'; }).join('') + '<button class="tg-chip' + (!k ? ' on' : '') + '" data-action="fm-tmv" data-id="' + esc(x.id) + '" data-k="">Not yet</button>' + (x.book ? '<button class="tg-chip" data-action="fm-tmdel" data-id="' + esc(x.id) + '">' + tgI("trash", 12) + 'Remove</button>' : x.ro ? '<button class="tg-chip" data-action="fm-sel" data-ro="' + x.ro.id + '">Show it</button>' : '') + '</div>' : '') + '</div>'; };
  var col = function(k){ var h = (R.P[k] || []).reduce(function(a, id){ return a + (M[id] ? M[id].q : 0); }, 0), c = fmDayCap(k, d), o = h - c, sh = fmShift(k);
    return '<div class="fm-tmc" data-fm-tcol="' + esc(k) + '"><div class="h"><span class="nm"><span class="tg-av">' + esc(tgIni(k)) + '</span>' + esc(k) + '</span><small>' + fmHM(sh[0]) + '–' + fmHM(sh[1]) + (fmOffPart(k, d) ? ' · out ' + fmHM(fmOffPart(k, d).from) : '') + '</small><div class="fm-tcap"><i style="width:' + Math.min(100, c ? h / c * 100 : 0).toFixed(0) + '%"' + (o > 0.05 ? ' class="over"' : '') + '></i></div><small class="' + (o > 0.05 ? 'bad' : h < c * 0.5 ? 'room' : '') + '">' + fmHh(h) + ' of ' + fmHh(c) + (o > 0.05 ? ' · ' + fmHh(o) + ' over' : ' · ' + fmHh(Math.max(0, c - h)) + ' free') + '</small></div><div class="fm-tml">' + ((R.P[k] || []).map(function(id, i){ return M[id] ? card(M[id], i, k) : ''; }).join('') || '<span class="fm-none">Nothing yet — drag work here</span>') + '</div></div>'; };
  var off = fmTechs().filter(function(n){ return fmOffAll(n, d); }), tot = TT.reduce(function(a, k){ return a + fmDayCap(k, d); }, 0), pl = TT.reduce(function(a, k){ return a + (R.P[k] || []).reduce(function(b, id){ return b + (M[id] ? M[id].q : 0); }, 0); }, 0);
  var note = UI.fmNote != null ? UI.fmNote : (STATE.fmNote && STATE.fmNote.d === d ? STATE.fmNote.text : fmTmNote()), sent = STATE.fmNote && STATE.fmNote.d === d;
  var cols = Math.max(2, TT.length + 1);
  return '<div class="fm-tmr" data-scroll="fm-tmr"><div class="fm-tmh"><b>Tomorrow · ' + esc(fmDayName(d)) + '</b><span>' + TT.length + ' tech' + (TT.length === 1 ? '' : 's') + ' in · ' + fmHh(tot) + ' · ' + fmHh(pl) + ' planned</span>' + off.map(function(k){ return '<span class="fm-off"><span class="tg-av">' + esc(tgIni(k)) + '</span>' + esc(tgFirst(k)) + ' off</span>'; }).join('') + '<span class="sp"></span><button class="btn btn-sm" data-action="fm-pop" data-p="book">' + tgI("plus", 13) + 'Booking</button><button class="btn btn-sm" data-action="fm-tmauto">' + tgI("userPlus", 13) + 'Plan the rest</button></div>'
    + '<div class="fm-tmcols"><div class="fm-tmc un" data-fm-tcol=""><div class="h"><span class="nm">Not planned</span><small>' + R.un.length + ' · drag onto a tech</small></div><div class="fm-tml">' + (R.un.map(function(id, i){ return M[id] ? card(M[id], i, null) : ''; }).join('') || '<span class="fm-none">Everything has a tech</span>') + '</div></div>' + TT.map(col).join('') + '</div>'
    + '<div class="fm-hand"><div class="h"><b>Handoff note</b><small>On every Console at the start of ' + esc(fmDayName(d)) + '</small><span class="sp"></span>' + (UI.fmNote != null ? '<button class="btn btn-sm tg-gh" data-action="fm-tmreset">Back to suggested</button>' : '') + '<button class="btn btn-sm btn-primary" data-action="fm-tmsend">' + tgI("clock", 13) + (sent ? 'Sent — send again' : 'Send for ' + esc(fmDayName(d))) + '</button></div><textarea id="fm-note" data-no-draft data-fm-in="note" rows="6">' + esc(note) + '</textarea>' + (sent ? '<small class="fm-sent">Sent ' + fmtTime(STATE.fmNote.at) + ' by ' + esc(STATE.fmNote.by || "you") + ' · each tech’s first job is #1 in ' + (TT.length > 1 ? 'their' : 'the') + ' order</small>' : '') + '</div>'
    + '<div class="tg-leg"><span><span class="fm-ord">1</span>#1 is first on the Console</span><span><span class="kd2 appt">Booked</span>Coming in</span><span><span class="kd2 carry">Carry-over</span>Won’t finish today</span><span><span class="kd2 parts">Parts</span>Part due</span><span class="hint">Drag cards, or click one to move it</span></div></div>';
}

/* ---------- search ---------- */
function fmSearchHtml(){
  var raw = UI.fmQ || "", F = tgFind(raw), q = F.q, ft = '<div class="tg-pft"><span><span class="tg-kbd">↑</span><span class="tg-kbd">↓</span> move</span><span><span class="tg-kbd">↵</span> open</span><span><span class="tg-kbd">Esc</span> close</span></div>';
  var row = function(r, i){ return tgSrRow(r, i, q).replace('data-action="tg-sr-pick"', 'data-action="fm-sr-pick"').replace('class="tg-sr' + (i === (UI.tgSri || 0) ? ' k' : ''), 'class="tg-sr' + (i === (UI.fmSri || 0) ? ' k' : '')).replace(/<button class="btn btn-sm ib tg-sry"[\s\S]*?<\/button>/, ''); };
  if(!q){ var rc = fmFlat().slice(0, 5).map(fmGet).filter(function(x){ return x && !x.isTech; }); return '<div class="h">In Needs action</div>' + rc.map(row).join('') + ft; }
  if(!F.L.length) return '<div class="nores">No RO, unit, customer, VIN or spot matches “' + esc(raw) + '”.</div>' + ft;
  return '<div class="h">' + F.L.length + ' on the yard</div>' + F.L.map(row).join('') + ft;
}
