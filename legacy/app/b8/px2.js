/* ---------- the nav rail: one column, every icon in the same 36 × 36 box on one line ----------
   Logo (opens and closes it), search, the clock, Inbox and the pages in three groups, and you at the
   bottom — your menu holds the theme, the size, settings and signing out. */
var PX_GROUPS = [["", ["console", "triage", "rolist", "ros"]], ["Shop", ["foreman", "warranty", "manager", "parts"]], ["You", ["timelog", "fixes", "career"]]];
var PX_NARROW = 1100;
function pxNarrow(){ var z = ({ large: 1.15, floor: 1.35 })[sizeMode()] || 1; return window.innerWidth / z < PX_NARROW; }
function pxSyncNarrow(){ var de = document.documentElement, n = pxNarrow(); if(de.classList.contains("px-narrow") !== n) de.classList.toggle("px-narrow", n); de.classList.toggle("px-peek", n && !!UI.pxPeek); }
function pxSideToggle(){
  if(pxNarrow()){ UI.pxPeek = !UI.pxPeek; UI.pxPop = null; render(); return; }
  ivSideMini(); UI.pxPop = null; render();
}
function pxClockState(){
  var rp = runningPunch(), sh = openShift();
  if(rp){ var ro = getRO(rp.roId); return ro && (ro.shop || ro.id === SHOP_RO_ID) ? "shop" : "job"; }
  return sh ? "air" : "out";
}
function pxAway(){ var l = openShift() ? null : lastShiftOut(); return l && /^(Lunch|Appointment|Emergency)$/.test(l.outReason || "") ? l : null; }
function pxJobLine(rp){
  var ro = getRO(rp.roId), op = getOp(rp.roId, rp.opId), n = ro && op ? ro.operations.indexOf(op) + 1 : 0;
  if(!ro || ro.shop || ro.id === SHOP_RO_ID) return 'Shop time' + (op && op.complaint ? ' · ' + esc(op.complaint) : '');
  return esc(roLabel(ro) + (n ? ' · Op ' + n : ''));
}
function pxClockRow(){
  var st = pxClockState(), rp = runningPunch(), aw = pxAway(), l1, l2;
  l1 = st === "out" ? (aw ? esc(aw.outReason) : 'Off the clock') : 'On the clock · <span class="mono" data-shift-hm>' + fmtHM(todayShiftMs()) + '</span>';
  if(st === "job" || st === "shop") l2 = pxJobLine(rp) + ' · <span class="mono" data-live-hm="' + rp.start + '">' + fmtHM(Date.now() - new Date(rp.start)) + '</span>';
  else if(st === "air") l2 = 'Not on a job';
  else l2 = aw ? (aw.backBy ? 'Back by ' + fmtTime(aw.backBy) : 'Out at ' + fmtTime(aw.out)) : 'Clock in for the day';
  var tip = st === "out" ? 'Clock — off' : 'Clock — on';
  return '<button class="pxr-row pxr-clk ' + st + (aw ? ' away' : '') + (UI.pxPop === "clk" ? ' on' : '') + '" data-action="px-pop" data-p="clk" data-px-anchor="clk" title="' + tip + '" aria-haspopup="dialog" aria-expanded="' + (UI.pxPop === "clk") + '">'
    + '<span class="pxr-ic"><i class="pxr-dot"></i></span><span class="pxr-tl"><b>' + l1 + '</b><small>' + l2 + '</small></span><span class="pxr-end">' + pxI("chevR", 13) + '</span></button>';
}
function pxMeName(){ var me = viewAsStaff(); return me ? me.name : (String(STATE.techName || "").trim() || "Admin"); }
function pxMeRole(){ var me = viewAsStaff(); return me ? me.role : "Every page"; }
function pxAv(cls){ var me = viewAsStaff(); if(me) return staffAvHtml(me, cls, "px");
  var ini = profileInitials(STATE.techName); return '<span class="' + cls + ' avx ini">' + (ini ? esc(ini) : pxI("user", 15)) + '</span>'; }
function pxMeRow(){
  var on = UI.pxPop === "me" || UI.view === "profile", warn = pxBkWarn();
  return '<button class="pxr-row pxr-me' + (on ? ' on' : '') + '" data-action="px-pop" data-p="me" data-px-anchor="me" title="' + esc(pxMeName() + ' — profile, theme, settings' + (staffList().length ? ', log out' : '')) + '" aria-haspopup="menu" aria-expanded="' + (UI.pxPop === "me") + '">'
    + '<span class="pxr-ic">' + pxAv("pxr-av") + (warn ? '<i class="pxr-warn" title="' + esc(warn) + '"></i>' : '') + '</span>'
    + '<span class="pxr-tl"><b>' + esc(pxMeName()) + '</b><small>' + esc(pxMeRole()) + '</small></span><span class="pxr-end">' + pxI("chevUD", 14) + '</span></button>';
}
function pxRailHtml(badgeCount){
  var cur = navCurrent(), allowed = {}, wcNeed = 0, nOpen = 0, prof = UI.view === "profile";
  navPages().forEach(function(p){ allowed[p[0]] = p; });
  if(allowed.ros && allowed.rolist){ delete allowed.ros; if(cur && cur[0] === "ros") cur = allowed.rolist; }
  try{ wcNeed = wcNeedCount(); }catch(e){}
  try{ nOpen = STATE.ros.filter(function(r){ return r.id !== SHOP_RO_ID && !r.shop && !roIsDone(r); }).length; }catch(e){}
  var badge = { warranty: wcNeed, rolist: nOpen, ros: nOpen, triage: UI.view !== "triage" ? (UI.tgBadgeN || 0) : 0, foreman: UI.view !== "foreman" ? (UI.fmBadgeN || 0) : 0 };
  var seen = {}, groups = PX_GROUPS.map(function(g){ return [g[0], g[1].filter(function(k){ seen[k] = 1; return allowed[k]; })]; });
  var extra = Object.keys(allowed).filter(function(k){ return !seen[k]; });
  if(extra.length) groups.push(["More", extra]);
  var row = function(k){
    var p = allowed[k], on = !prof && cur && p[0] === cur[0], b = badge[k] || 0;
    var bc = k === "rolist" || k === "ros" ? ' n' : k === "triage" ? ' tg-lt' + (UI.tgBump ? ' bump' : '') : k === "foreman" ? (UI.fmBadgeLate ? ' late' : '') : '';
    var bt = k === "triage" ? b + ' late on the yard' : k === "foreman" ? (UI.fmBadgeTip || '') : k === "warranty" ? b + ' to file or fix' : b + ' open';
    return '<button class="pxr-row" data-action="nav" data-view="' + k + '" title="' + esc(p[1]) + '"' + (on ? ' aria-current="page"' : '') + '>'
      + '<span class="pxr-ic">' + (ivIco(IV_NAV_IC[k], 18) || NAV_ICONS[k] || '') + (b ? '<em class="pxr-b' + bc + '" title="' + esc(bt) + '">' + b + '</em>' : '') + '</span>'
      + '<span class="pxr-tl">' + esc(p[1]) + '</span>' + (b ? '<span class="pxr-n' + bc + '" title="' + esc(bt) + '">' + b + '</span>' : '') + '</button>';
  };
  var inbox = '<div class="notif pxr-nw' + (UI.notifOpen ? ' open' : '') + '" data-key="notif">'
    + '<button class="pxr-row' + (UI.notifOpen ? ' on' : '') + '" data-action="toggle-notif" data-px-anchor="inbox" title="Inbox — warnings and reminders" aria-haspopup="true" aria-expanded="' + (UI.notifOpen ? 'true' : 'false') + '">'
    + '<span class="pxr-ic">' + pxI("inbox", 18) + (badgeCount ? '<em class="pxr-b">' + badgeCount + '</em>' : '') + '</span><span class="pxr-tl">Inbox</span>' + (badgeCount ? '<span class="pxr-n">' + badgeCount + '</span>' : '') + '</button>'
    + (UI.notifOpen ? notifPopHtml() : '') + '</div>';
  var nav = groups.filter(function(g){ return g[1].length; }).map(function(g, gi){
    return '<div class="pxr-gh"><span>' + esc(g[0]) + '</span></div>' + (gi === 0 ? inbox : '') + g[1].map(row).join('');
  }).join('');
  var mini = document.documentElement.classList.contains("iv-mini") || (pxNarrow() && !UI.pxPeek);
  return '<header class="pz-hdr iv-side px-rail" data-key="pz-hdr">'
    + '<div class="pxr-top"><button class="pxr-row pxr-brand" data-action="px-side" title="' + (mini ? 'Open the sidebar  [' : 'Parsec') + '" aria-label="' + (mini ? 'Open the sidebar' : 'Parsec') + '">'
    +   '<span class="pxr-ic"><span class="lg">' + PX_LOGO + '</span><span class="ex">' + pxI("sidebar", 18) + '</span></span><span class="pxr-tl"><b>Parsec</b></span></button>'
    +   '<button class="pxr-col" data-action="px-side" title="Close the sidebar  [" aria-label="Close the sidebar">' + pxI("sidebar", 16) + '</button></div>'
    + '<button class="pxr-row pxr-find" data-action="open-palette" title="Search — RO, VIN, unit, customer or part  Ctrl K"><span class="pxr-ic">' + pxI("search", 18) + '</span><span class="pxr-tl">Search</span><span class="pxr-kbd">Ctrl K</span></button>'
    + pxClockRow()
    + '<nav class="pxr-nav" aria-label="Pages">' + nav + '</nav>'
    + pxMeRow()
    + '</header>';
}
/* ---------- the two popovers off the rail ---------- */
function pxPopHtml(){
  if(!UI.pxPop || !ivDesk()) return '';
  if(UI.pxPop === "clk") return pxClockPop();
  if(UI.pxPop === "me") return pxMePop();
  return '';
}
function pxClockPop(){
  var st = pxClockState(), rp = runningPunch(), sh = openShift(), aw = pxAway(), h = '';
  var head = st === "out" ? (aw ? esc(aw.outReason) + (aw.backBy ? ' · back by ' + fmtTime(aw.backBy) : ' · out at ' + fmtTime(aw.out)) : 'Off the clock') : 'On the clock since ' + fmtTime(sh ? sh.in : rp && rp.start);
  h += '<div class="pxp-h"><span class="pxr-dot ' + st + '"></span><b>' + head + '</b><span class="sp"></span>' + (st === "out" ? '' : '<b class="mono" data-shift-hm>' + fmtHM(todayShiftMs()) + '</b>') + '</div>';
  if(rp){
    var ro = getRO(rp.roId), op = getOp(rp.roId, rp.opId), shop = !ro || ro.shop || ro.id === SHOP_RO_ID, me = punchByName();
    h += '<div class="pxp-job"><div class="r1"><span class="no mono">' + (shop ? 'Shop' : esc(String(ro.roNumber || ''))) + '</span><b>' + esc(op ? (op.complaint || 'Operation') : 'On the clock') + '</b></div>'
      + '<div class="r2"><small>' + (shop ? 'Shop time' : esc(ro.customerName || '')) + ' · <span class="mono" data-live-hm="' + rp.start + '">' + fmtHM(Date.now() - new Date(rp.start)) + '</span>' + (op && +op.quoted > 0 ? ' of ' + esc(String(op.quoted)) + ' h' : '')
      + (rp.by && me && !techSame(rp.by, me) ? ' · started by ' + esc(rp.by) : '') + '</small>'
      + '<button class="px-btn sm" data-action="open-start-punch" title="Switch to another operation">' + pxI("swap", 13) + 'Switch</button>'
      + '<button class="px-btn sm" data-action="open-stop-punch">' + pxI("stop", 13) + 'Stop</button></div></div>';
  }
  h += '<div class="pxp-acts">';
  if(st === "out") h += '<button class="px-btn sm pri" data-action="shift-in">' + pxI("play", 13) + (aw && aw.outReason === "Lunch" ? 'Back from lunch' : 'Clock in') + '</button>';
  else h += '<button class="px-btn sm" data-action="clock-off" data-reason="Lunch" data-min="30" title="Clock off for a 30-minute lunch' + (rp ? ' — the job stops for lunch' : '') + '">Lunch · 30 min</button>'
    + '<button class="px-btn sm" data-action="shift-out" title="Lunch, home, end of day, an appointment…">Clock out…</button>';
  h += '<span class="sp"></span><button class="px-btn sm ghost" data-action="nav" data-view="timelog">' + pxI("timelog", 13) + 'Time Log</button></div>';
  return '<div class="px-pop pxr-pop clk" role="dialog" aria-label="Clock">' + h + '</div>';
}
function pxMePop(){
  var me = viewAsStaff(), sin = pxLS("tec_signin_at"), staffN = staffList().length, st = pxClockState(), bk = pxBkInfo(), warn = pxBkWarn();
  var h = '<button class="pxp-who" data-action="px-profile" data-s="you">' + pxAv("pxr-av lg") + '<span class="n"><b>' + esc(pxMeName()) + '</b><small>' + esc(pxMeRole()) + (me && sin ? ' · signed in ' + esc(pxAgo(sin)) : '') + '</small></span>' + pxI("chevR", 14) + '</button>'
    + '<div class="px-sep"></div>'
    + '<div class="pxp-set"><span>Theme</span>' + pxSeg([["ivl", "Ivory", "sun"], ["ivd", "Graphite", "moon"]], THEME, "set-theme", "data-theme") + '</div>'
    + '<div class="pxp-set"><span>Size</span>' + pxSeg([["normal", "Normal"], ["large", "Large"], ["floor", "Shop floor"]], sizeMode(), "set-size", "data-size") + '</div>'
    + '<div class="px-sep"></div>'
    + '<button class="px-mi" data-action="px-profile" data-s="look">' + pxI("gear", 15) + 'Settings<span class="meta">all of them</span></button>'
    + '<button class="px-mi" data-action="px-profile" data-s="data">' + pxI("save", 15) + 'Your data<span class="meta' + (warn ? ' wt' : '') + '">' + (warn ? '<i></i>' + esc(pxBkShort()) : esc(pxBkShort())) + '</span></button>'
    + '<button class="px-mi" data-action="open-shortcuts">' + pxI("keyTag", 15) + 'Keyboard shortcuts<span class="meta">' + pxKbd("?") + '</span></button>';
  if(staffN) h += '<div class="px-sep"></div>'
    + '<button class="px-mi" data-action="px-switch">' + pxI("swap", 15) + 'Switch user</button>'
    + '<button class="px-mi" data-action="px-logout">' + pxI("exit", 15) + 'Log out<span class="meta">' + (st !== "out" ? 'the clock keeps running' : '') + '</span></button>';
  return '<div class="px-pop pxr-pop me" role="menu" aria-label="You">' + h + '</div>';
}
/* place the open popover beside its row; the Inbox list too */
function pxAfter(){
  pxSyncNarrow();
  var z = typeof ZF === "function" ? ZF() : 1, vh = window.innerHeight / z;
  var place = function(pop, anchor){
    if(!pop || !anchor) return;
    var r = zr(anchor.getBoundingClientRect()), rail = document.querySelector(".px-rail"), rr = rail ? zr(rail.getBoundingClientRect()) : r;
    var h = pop.offsetHeight, y = r.top - 6;
    if(y + h > vh - 10) y = Math.max(10, r.bottom - h + 6);
    if(y + h > vh - 10) y = Math.max(10, vh - 10 - h);
    pop.style.setProperty("left", Math.round(rr.right + 8) + "px", "important");
    pop.style.setProperty("top", Math.round(y) + "px", "important");
    pop.style.setProperty("bottom", "auto", "important");
  };
  place(document.querySelector(".pxr-pop"), document.querySelector('[data-px-anchor="' + UI.pxPop + '"]'));
  place(document.querySelector(".px-rail .notif-pop"), document.querySelector('[data-px-anchor="inbox"]'));
}
window.addEventListener("resize", function(){ if(document.documentElement.classList.contains("px-narrow") !== pxNarrow()){ UI.pxPeek = false; try{ render(); }catch(e){} } });
