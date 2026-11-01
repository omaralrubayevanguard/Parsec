/* Parsec · shell · design-system.js
   The Ivory / Graphite shell: the sidebar (ivSideHtml), its mini form, the case rules, the page header (pzHeaderHtml), the IVI stroke icon set.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ivIco ivTheme ivDesk ivCase ivCaseFix ivSideHtml ivSideMini pzHeaderHtml hdrStuckH PZ_CLK PZ_GROUPS IVI … (9 functions, 6 constants)
   state      techName
   uses       access/ clock/ data/ kit/ pages/ pages/rolist/ pages/warranty/ phone/ ro/ state/
   at load    on document keydown
*/
/* ============================== VIEWS ============================== */
/* ============================== SHELL — Dynamic Island + header ==============================
   The page switcher is a Dynamic Island: a black capsule at the top centre that shows the
   page you are on and whatever is live (the job on the clock, or your shift). Point at it
   and it springs open into every page, New RO, and the live job with Stop / Switch. */
/* ============================== RIBBON HEADER ==============================
   One dark-grey band across the top: the brand and the live bits on the first line, the
   pages as grouped tabs on the second. The page you are on is the light tab that runs
   down into the page itself. The first line scrolls away; the tabs stay. */
var PZ_CLK = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>';
var PZ_GROUPS = [["Shop floor", ["console", "ros", "triage", "rolist", "foreman"]], ["Office", ["warranty", "manager", "parts"]], ["Me", ["timelog", "fixes", "career"]]];
/* ============================== Ivory / Graphite — the Parsec design system ==============================
   The Parsec stroke icons, the sidebar (collapses to icons with the sidebar button or [), its clock-in card with
   the running job, sentence-case status names, ⌘/Ctrl ↵ in dialogs. Everything here runs only in Ivory / Graphite. */
var IVI = {"tech": "<circle cx=\"9\" cy=\"7.5\" r=\"3.2\"/><path d=\"M3.5 19.5c.6-3.4 2.8-5.3 5.5-5.3 1.2 0 2.3.3 3.2 1\"/><path d=\"M17.9 12.2a2.7 2.7 0 0 0-3.4 3.4l-2.7 2.7a1.2 1.2 0 0 0 1.7 1.7l2.7-2.7a2.7 2.7 0 0 0 3.4-3.4l-1.4 1.4-1.4-.2-.2-1.4z\"/>", "eye": "<path d=\"M2.75 12S6 5.75 12 5.75 21.25 12 21.25 12 18 18.25 12 18.25 2.75 12 2.75 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "save": "<path d=\"M5.5 4h10.2L20 8.3v10.2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4z\"/><path d=\"M8 4v4.5h7V4M8 20v-6h8v6\"/>", "unit": "<path d=\"M2.75 16.5V7.25A1.5 1.5 0 0 1 4.25 5.75h9.25v10.75M13.5 9.25h3.6a1.5 1.5 0 0 1 1.2.6l2.2 2.9a1.5 1.5 0 0 1 .3.9v2.85h-2\"/><circle cx=\"7\" cy=\"17.25\" r=\"2\"/><circle cx=\"16.5\" cy=\"17.25\" r=\"2\"/><path d=\"M9 17.25h5.5\"/>", "addJob": "<path d=\"M6.5 3.75h7l4.75 4.75v10.25a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 18.75V5.25a1.5 1.5 0 0 1 1.5-1.5z\"/><path d=\"M13.5 3.75V8.5h4.75\"/><path d=\"M12 11v6M9 14h6\"/>", "gear": "<path d=\"M4 8h8.5M17 8h3M4 16h3M11.5 16H20\"/><circle cx=\"14.75\" cy=\"8\" r=\"2.25\"/><circle cx=\"9.25\" cy=\"16\" r=\"2.25\"/>", "history": "<path d=\"M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.75h3.75\"/><path d=\"M12 8.5V12l2.5 1.5\"/>", "addPart": "<path d=\"M12 3.5l7.5 4v9l-7.5 4-7.5-4v-9z\"/><path d=\"M4.5 7.5l7.5 4 7.5-4M12 11.5v9\"/><path d=\"M19 15v6M16 18h6\"/>", "newRo": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 8v8M8 12h8\"/>", "x": "<path d=\"M6 6l12 12M18 6L6 18\"/>", "keyTag": "<circle cx=\"8\" cy=\"15.5\" r=\"4\"/><path d=\"M10.9 12.6l8.6-8.6M16.5 7l2.5 2.5M14 9.5l2 2\"/>", "moon": "<path d=\"M19.5 14.5A8 8 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z\"/>", "bell": "<path d=\"M6 16.75V11a6 6 0 0 1 12 0v5.75l1.5 1.5h-15z\"/><path d=\"M10 20.5a2.25 2.25 0 0 0 4 0\"/>", "note": "<path d=\"M6 3.75h12A1.25 1.25 0 0 1 19.25 5v9.5l-4.75 5.75H6A1.25 1.25 0 0 1 4.75 19V5A1.25 1.25 0 0 1 6 3.75z\"/><path d=\"M14.5 20.25v-4.5a1.25 1.25 0 0 1 1.25-1.25h3.5M8 8.5h8M8 12h5\"/>", "exit": "<path d=\"M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M10 8l-4 4 4 4M6 12h9\"/>", "user": "<circle cx=\"12\" cy=\"8\" r=\"3.75\"/><path d=\"M4.75 20c.6-3.6 3.6-5.75 7.25-5.75s6.65 2.15 7.25 5.75\"/>", "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2.75v2M12 19.25v2M2.75 12h2M19.25 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4\"/>", "inbox": "<path d=\"M3.75 13.5l2.6-7.1A1.5 1.5 0 0 1 7.76 5.4h8.48a1.5 1.5 0 0 1 1.41 1l2.6 7.1v4.75a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5z\"/><path d=\"M3.75 13.5h4.5l1.25 2h5l1.25-2h4.5\"/>", "console": "<rect x=\"3.75\" y=\"3.75\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"13.25\" y=\"3.75\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"3.75\" y=\"13.25\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"13.25\" y=\"13.25\" width=\"7\" height=\"7\" rx=\"2\"/>", "triage": "<rect x=\"3.5\" y=\"7.5\" width=\"17\" height=\"12.25\" rx=\"2.75\"/><path d=\"M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M12 10.75v5.5M9.25 13.5h5.5\"/>", "ros": "<path d=\"M6.5 3.75h7l4.75 4.75v10.25a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 18.75V5.25a1.5 1.5 0 0 1 1.5-1.5z\"/><path d=\"M13.5 3.75V8.5h4.75\"/><path d=\"M8.5 12.5h7M8.5 16h4.5\"/>", "foreman": "<rect x=\"5\" y=\"4.75\" width=\"14\" height=\"15.5\" rx=\"2.5\"/><path d=\"M9.5 4.75V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v.75M8.75 10.5h6.5M8.75 14h6.5M8.75 17.25h3.5\"/>", "warranty": "<path d=\"M12 3.5l7 2.75v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9v-5.5z\"/><path d=\"M8.9 12.1l2.2 2.2 4.1-4.4\"/>", "manager": "<circle cx=\"9.25\" cy=\"8.25\" r=\"3.25\"/><path d=\"M3.5 19.5c0-3.2 2.6-5.25 5.75-5.25s5.75 2.05 5.75 5.25\"/><path d=\"M15.5 5.3a3.2 3.2 0 0 1 0 5.9M17.2 14.6c2 .6 3.3 2.2 3.3 4.4\"/>", "parts": "<path d=\"M12 3.5l7.5 4v9l-7.5 4-7.5-4v-9z\"/><path d=\"M4.5 7.5l7.5 4 7.5-4M12 11.5v9\"/>", "timelog": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.25V12l3.25 1.9\"/>", "fixes": "<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/>", "career": "<path d=\"M5 19.5v-5M10 19.5v-11M15 19.5v-7.5M20 19.5V5\"/>", "settings": "<path d=\"M4 8h8.5M17 8h3M4 16h3M11.5 16H20\"/><circle cx=\"14.75\" cy=\"8\" r=\"2.25\"/><circle cx=\"9.25\" cy=\"16\" r=\"2.25\"/>", "sidebar": "<rect x=\"3.75\" y=\"4.75\" width=\"16.5\" height=\"14.5\" rx=\"2.75\"/><path d=\"M9.5 4.75v14.5\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M16 16l4.5 4.5\"/>", "stop": "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2.75\"/>", "chevU": "<path d=\"M6.5 14.5L12 9l5.5 5.5\"/>", "chevD": "<path d=\"M6.5 9.5L12 15l5.5-5.5\"/>", "chevR": "<path d=\"M9.5 6.5L15 12l-5.5 5.5\"/>", "chevL": "<path d=\"M14.5 6.5L9 12l5.5 5.5\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>", "clip": "<path d=\"M19.4 11.2l-7.1 7.2a4.4 4.4 0 0 1-6.2-6.2l7.6-7.6a2.9 2.9 0 0 1 4.1 4.1l-7.3 7.3a1.4 1.4 0 0 1-2-2l6.6-6.6\"/>", "link": "<path d=\"M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1\"/><path d=\"M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1\"/>", "more": "<path d=\"M5.5 12h.01M12 12h.01M18.5 12h.01\" stroke-width=\"2.4\"/>", "plus": "<path d=\"M12 5v14M5 12h14\"/>", "pencil": "<path d=\"M4.75 19.25l1-4L15.6 5.4a1.9 1.9 0 0 1 2.7 0l.3.3a1.9 1.9 0 0 1 0 2.7L8.75 18.25z\"/><path d=\"M14 7l3 3\"/>", "copy": "<rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2.5\"/><path d=\"M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"/>", "swap": "<path d=\"M7 7.5h12.5L16 4M17 16.5H4.5L8 20\"/>", "trash": "<path d=\"M4.5 6.5h15M9.5 6.5V4.75h5V6.5M6.5 6.5l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3l.9-12.2M10 10.5v5.5M14 10.5v5.5\"/>", "check": "<path d=\"M5 12.5l4.5 4.5L19 7.5\"/>", "play": "<path d=\"M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.2-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6z\"/>", "print": "<path d=\"M7 9V4.5h10V9\"/><rect x=\"3.75\" y=\"9\" width=\"16.5\" height=\"7.5\" rx=\"2\"/><path d=\"M7 14.5h10v5H7z\"/>", "chat": "<path d=\"M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25H11.5L7 20v-3.5h-.25A2.25 2.25 0 0 1 4.5 14.25z\"/>"};
function ivIco(k, sz){ var b = IVI[k]; if(!b) return ''; sz = sz || 16; return '<svg class="px-ico" width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+b+'</svg>'; }
function ivTheme(){ try{ return /^iv[ld]$/.test(resolvedTheme()); }catch(e){ return false; } }
function ivDesk(){ return ivTheme() && document.documentElement.getAttribute("data-device") !== "phone"; }
var IV_NAV_IC = { tech:"tech", console:"console", ros:"ros", rolist:"ros", triage:"triage", foreman:"foreman", warranty:"warranty", manager:"manager", parts:"parts", timelog:"timelog", fixes:"fixes", career:"career", inbox:"inbox" };
IV_NAV_IC.admin = "admin"; IVI.admin = '<path d="M12 3.5l7 2.75v5.25c0 4.5-3 7.75-7 9-4-1.25-7-4.5-7-9V6.25z"/><path d="M9 12l2.25 2.25L15.5 10"/>';   /* Parsec 13: the Admin page */
IV_NAV_IC.assets = "assets"; IVI.assets = "<path d=\"M3.5 6.5h10v9h-10zM13.5 9.5h3.8l3.2 3.4v2.6h-7\"/><circle cx=\"7\" cy=\"17\" r=\"1.8\"/><circle cx=\"16.5\" cy=\"17\" r=\"1.8\"/>";   /* Parsec 14: the Assets page */
IV_NAV_IC.library = "library"; IVI.library = '<path d="M4.5 5.5A1.5 1.5 0 0 1 6 4h4.5v15.5H6a1.5 1.5 0 0 0-1.5 1.5z"/><path d="M10.5 4H18a1.5 1.5 0 0 1 1.5 1.5V19.5H10.5"/><path d="M13 8h4M13 11h4M4.5 21h15"/>';   /* Parsec 17.1: the Library */
IV_NAV_IC.fleets = "fleets"; IVI.fleets = '<path d="M2.5 8.5h8v6h-8zM10.5 10.5h2.6l2 2.2v1.8h-4.6"/><circle cx="5" cy="15.5" r="1.3"/><circle cx="12.5" cy="15.5" r="1.3"/><path d="M13 5.5h6v4.5h-6zM19 7h1.6l1.4 1.5v1.5H19"/>';   /* Parsec 17.1: Fleets */
IV_NAV_IC.inventory = "inventory"; IVI.inventory = '<path d="M3.5 20.5h17M4.5 20.5V3.5M19.5 20.5V3.5M4.5 12h15"/><rect x="7" y="6.5" width="4.5" height="5.5" rx=".7"/><rect x="13" y="8.5" width="4" height="3.5" rx=".7"/><rect x="7.5" y="15" width="5.5" height="5.5" rx=".7"/><path d="M15 17.5h2.5v3H15z"/>';   /* Parsec 12.5: the Inventory page */
/* "WAITING – PARTS" → "Waiting – Parts", "COMPLETE – ROAD TEST" → "Complete – Road test"; the op-type codes stay */
var IV_CAPS_KEEP = /^(DIAG|OP|PM|WARR|COMEBACK|SUBLET|RECALL|REPAIR|VIN|RO|ETA|PO|AM|PM|OK|QR|ID|EOD|CSV|PDF)$/;
function ivCase(t){
  if(!t || !/[A-Z]/.test(t) || /[a-z]/.test(t) || IV_CAPS_KEEP.test(t.trim())) return t;
  return t.toLowerCase().replace(/^([^a-z]*)([a-z])/, function(m, a, b){ return a + b.toUpperCase(); })
    .replace(/([–-]\s+)(\S)/g, function(m, a, b){ return a + b.toUpperCase(); }).replace(/\bro\b/g, "RO").replace(/\bvin\b/g, "VIN");
}
function ivCaseFix(root){
  if(!root || !ivTheme()) return;
  root.querySelectorAll(".chipMain, .chipSub, .chipTxt, .jobStTxt, .menuItem > span:nth-child(2), .pill, .st-opt, .ty-st, .rl-st, .mr-dot, .tyc-st").forEach(function(n){
    if(n.children.length) return;
    var t = n.textContent, u = ivCase(t); if(u !== t) n.textContent = u;
  });
  root.querySelectorAll(".subChip, .pill").forEach(function(n){
    var tn = null; n.childNodes.forEach(function(c){ if(c.nodeType === 3 && c.textContent.trim()) tn = c; }); if(!tn) return;
    var t = tn.textContent, u = t.replace(/(^|[–·]\s*)([^–·]+)/g, function(m, a, w){ var s = w.toLowerCase(); return a + s.replace(/^(\s*)(\S)/, function(x, p, c){ return p + c.toUpperCase(); }); });
    if(u !== t) tn.textContent = u;
  });
}
function ivSideHtml(badgeCount){ return pxRailHtml(badgeCount); }
function ivSideMini(on){
  var de = document.documentElement;
  if(on === undefined) on = !de.classList.contains("iv-mini");
  de.classList.toggle("iv-mini", !!on);
  try{ localStorage.setItem("tec_iv_mini", on ? "1" : ""); }catch(e){}
}
try{ if(localStorage.getItem("tec_iv_mini")) document.documentElement.classList.add("iv-mini"); }catch(e){}
document.addEventListener("keydown", function(e){
  if(!ivTheme()) return;
  var a = document.activeElement, typing = a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable);
  var host = document.querySelector(".jc-host"), sa = host && host.shadowRoot && host.shadowRoot.activeElement;
  if(sa && (/^(INPUT|TEXTAREA|SELECT)$/.test(sa.tagName) || sa.isContentEditable)) typing = true;
  if((e.ctrlKey || e.metaKey) && e.key === "Enter"){
    var m = document.querySelector(".modal .modal-foot .btn-primary:not([disabled])");
    if(m){ e.preventDefault(); m.click(); return; }
  }
  if(typing || e.ctrlKey || e.metaKey || e.altKey) return;
  if(e.key === "[" && ivDesk()){ e.preventDefault(); pxSideToggle(); return; }
  if((e.key === "j" || e.key === "k") && UI.view === "ros" && UI.selectedRo && !UI.modal && !document.querySelector(".modal")){
    var l = rlList(), i = -1; l.forEach(function(r, n){ if(r.id === UI.selectedRo) i = n; });
    var t = i < 0 ? null : l[e.key === "j" ? i + 1 : i - 1];
    if(t){ e.preventDefault(); UI.selectedRo = t.id; render(); window.scrollTo(0, 0); }
  }
});
var IV_CF = 0;
new MutationObserver(function(){
  if(IV_CF || !ivTheme()) return;
  IV_CF = requestAnimationFrame(function(){ IV_CF = 0; ivCaseFix(document.body); });
}).observe(document.documentElement, { childList: true, subtree: true });

function pzHeaderHtml(badgeCount){
  if(document.documentElement.getAttribute("data-device") === "phone") return pmShellHtml();
  if(ivDesk()) return ivSideHtml(badgeCount);
  var cur = navCurrent(), allowed = {}, rp = runningPunch(), sh = openShift(), me = viewAsStaff(), wcNeed = 0;
  navPages().forEach(function(p){ allowed[p[0]] = p; });
  if(allowed.ros && allowed.rolist){ delete allowed.ros; if(cur && cur[0] === "ros") cur = allowed.rolist; }   /* the RO page lives inside the RO List */
  try{ wcNeed = wcNeedCount(); }catch(e){}
  var badge = { warranty: wcNeed, triage: UI.view !== "triage" ? (UI.tgBadgeN || 0) : 0, foreman: UI.view !== "foreman" ? (UI.fmBadgeN || 0) : 0 };
  var seen = {}, groups = PZ_GROUPS.map(function(g){ return [g[0], g[1].filter(function(k){ seen[k] = 1; return allowed[k]; })]; });
  var extra = Object.keys(allowed).filter(function(k){ return !seen[k]; });
  if(extra.length) groups.push(["More", extra]);
  groups = groups.filter(function(g){ return g[1].length; });
  var tabs = groups.map(function(g, gi){
    return (gi ? '<span class="pz-sep" aria-hidden="true"></span>' : '') + '<div class="pz-grp"><div class="pz-tabs">'
      + g[1].map(function(k){
          var p = allowed[k], on = p[0] === cur[0], b = badge[k] || 0;
          return '<button class="pz-tab'+(on ? ' on' : '')+'" data-action="nav" data-view="'+k+'"'+(on ? ' aria-current="page"' : '')+'>'
            + '<span class="pz-ti">'+(NAV_ICONS[k] || '')+'</span><span>'+esc(p[1])+'</span>'
            + (b ? '<span class="pz-bdg'+(k === "triage" ? ' tg-lt' : k === "foreman" ? ' fm-nb'+(UI.fmBadgeLate ? ' late' : '') : '')+'" title="'+(k === "foreman" ? esc(UI.fmBadgeTip || '') : b+(k === "triage" ? ' late on the yard' : ' to file or fix'))+'">'+b+'</span>' : '') + '</button>';
        }).join('') + '</div></div>';
  }).join('');
  var live = '';
  if(rp){
    var lro = getRO(rp.roId), lop = getOp(rp.roId, rp.opId);
    live = '<button class="pz-live" data-action="open-stop-punch" title="'+esc((lop ? lop.complaint + ' · ' : '') + 'click to stop the punch')+'"><i class="pz-pulse"></i><b class="mono">'+esc(lro ? (lro.shop ? 'Shop time' : roLabel(lro)) : 'RO')+'</b><span class="mono" data-live-hm="'+rp.start+'">'+fmtHM(Date.now() - new Date(rp.start))+'</span></button>';
  }
  var clock = sh
    ? '<button class="pz-clock in" data-action="shift-out" title="On the clock since '+esc(fmtTime(sh.in))+' \u00b7 click to clock out" aria-label="Clock out">'+PZ_CLK+'</button>'
    : '<button class="pz-clock out" data-action="shift-in" title="Clock in for the day" aria-label="Clock in">'+PZ_CLK+'</button>';
  return '<header class="pz-hdr" data-key="pz-hdr">'
    + '<div class="pz-top">'
    +   '<span class="pz-brand"><span class="pz-logo" aria-hidden="true"><svg viewBox="-110 -110 220 220"><circle r="14" fill="#22c55e"/><circle cx="44" r="9.5"/><circle cx="-44" r="9.5"/><circle cx="22" cy="38" r="9.5"/><circle cx="-22" cy="38" r="9.5"/><circle cx="22" cy="-38" r="9.5"/><circle cx="-22" cy="-38" r="9.5"/><circle cy="-84" r="7" class="o"/><circle cy="84" r="7" class="o"/><circle cx="73" cy="42" r="7" class="o"/><circle cx="-73" cy="42" r="7" class="o"/><circle cx="73" cy="-42" r="7" class="o"/><circle cx="-73" cy="-42" r="7" class="o"/></svg></span><b>Parsec</b></span>'
    +   '<span class="pz-sp"></span>'
    +   '<button class="pz-find" data-action="open-palette" title="Find an RO — number, VIN, unit, customer or part (Ctrl+K)">'+sfIcon(SF.search, 20)+'</button>'
    +   clock
    +   '<div class="hdr-bell pz-w">' + notifBtnHtml(badgeCount) + '</div>'
    +   '<div class="hdr-gear pz-w">' + settingsHtml() + '</div>'
    +   '<div class="hdr-me pz-me" data-key="hdr-me" title="'+esc((me ? me.name : (STATE.techName || 'Admin')) + ' \u00b7 ' + (me ? me.role : 'Every page'))+'">' + profileBtnHtml() + '</div>'
    + '</div>'
    + '<nav class="pz-row" aria-label="Pages">' + tabs + '</nav>'
    + '<div class="pz-lip" aria-hidden="true"></div>'
    + '</header>';
}
/* how much of the header stays on screen once the first line has scrolled away */
function hdrStuckH(){
  var pz = document.querySelector('.pz-hdr');
  if(pz && getComputedStyle(pz).position === 'fixed' && pz.getBoundingClientRect().width < window.innerWidth / 2) return 0;   /* the side menu — nothing across the top */
  if(pz){ var top = pz.querySelector('.pz-top'); return Math.round(pz.getBoundingClientRect().height - (top ? top.getBoundingClientRect().height : 0)); }
  var tb = document.querySelector('.topbar'); return tb ? Math.round(tb.getBoundingClientRect().height) : 0;
}
document.documentElement.classList.add('pz-rib');
