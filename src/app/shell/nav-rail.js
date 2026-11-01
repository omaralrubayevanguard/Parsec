/* Parsec · shell · nav-rail.js
   The nav rail: one column, every icon in the same box; PX_GROUPS orders the pages; the narrow (folded) state, the clock row, and who is signed in.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pxNarrow pxSyncNarrow pxSideToggle pxClockState pxAway pxJobLine pxClockRow pxMeName pxMeRole pxAv pxMeRow pxRailHtml … (12 functions, 2 constants)
   state      ros techName
   uses       access/ clock/ data/ kit/ pages/ pages/inbox/ pages/warranty/ phone/ ro/ state/
*/
/* ---------- the nav rail: one column, every icon in the same 36 × 36 box on one line ----------
   Logo (opens and closes it), search, the clock, Inbox and the pages in three groups, and you at the
   bottom — your menu holds the theme, the size, settings and signing out. */
var PX_GROUPS = [["", ["career", "timelog", "rolist", "ros", "tech", "triage", "foreman", "parts", "warranty", "manager", "fixes", "assets", "inventory", "fleets", "library", "admin"]]];
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
  var seen = { inbox: 1 }, groups = PX_GROUPS.map(function(g){ return [g[0], g[1].filter(function(k){ seen[k] = 1; return allowed[k]; })]; });
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
  var ibN = 0; try{ ibN = IB.badge(); }catch(e){}
  var inbox = '<button class="pxr-row" data-action="nav" data-view="inbox" title="Inbox — what’s sent to you"' + (!prof && UI.view === "inbox" ? ' aria-current="page"' : '') + '>'
    + '<span class="pxr-ic">' + pxI("inbox", 18) + (ibN ? '<em class="pxr-b">' + ibN + '</em>' : '') + '</span><span class="pxr-tl">Inbox</span>' + (ibN ? '<span class="pxr-n">' + ibN + '</span>' : '') + '</button>';
  var nav = groups.filter(function(g){ return g[1].length; }).map(function(g, gi){
    return g[1].map(row).join('');   /* Parsec 12.2: no Inbox row, no lines or headings */
  }).join('');
  var mini = document.documentElement.classList.contains("iv-mini") || (pxNarrow() && !UI.pxPeek);
  return '<header class="pz-hdr iv-side px-rail" data-key="pz-hdr">'
    + '<div class="pxr-top"><button class="pxr-row pxr-brand" data-action="px-side" title="' + (mini ? 'Open the sidebar  [' : 'Parsec') + '" aria-label="' + (mini ? 'Open the sidebar' : 'Parsec') + '">'
    +   '<span class="pxr-ic"><span class="lg">' + PX_LOGO + '</span><span class="ex">' + pxI("sidebar", 18) + '</span></span><span class="pxr-tl"><b>Parsec</b></span></button>'
    +   '<button class="pxr-col" data-action="px-side" title="Close the sidebar  [" aria-label="Close the sidebar">' + pxI("sidebar", 16) + '</button></div>'
    + '<button class="pxr-row pxr-find" data-action="open-palette" title="Search — RO, VIN, unit, customer or part  Ctrl K"><span class="pxr-ic">' + pxI("search", 18) + '</span><span class="pxr-tl">Search</span><span class="pxr-kbd">Ctrl K</span></button>'
    + pxClockRow()
    + '<nav class="pxr-nav" aria-label="Pages">' + nav + '</nav>'
    + pxThemeStrip(mini) + pxMeRow()
    + '</header>';
}
