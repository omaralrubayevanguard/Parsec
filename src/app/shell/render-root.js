/* Parsec · shell · render-root.js
   render(): the one place the page is drawn. It picks the view, builds its HTML, morphs it into #app, then runs each area's after-render hooks. histSync keeps the browser history in step.
   Flow: every change ends in render(); pages never touch the DOM outside their own after() hooks.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   histSync render HIST_LAST HIST_POP (2 functions, 2 constants)
   uses       access/ access/admin-page/ automations/ clock/ data/ import/ import/new-ro/ kit/ pages/ pages/assets/ pages/career/ pages/fixes/ pages/foreman/ pages/inbox/ pages/inventory/ pages/library/ pages/manager/ pages/report/ pages/rolist/ pages/technician/ pages/timelog/ pages/triage/ pages/warranty/ phone/ ro/ ro-page/ settings/ state/ trucks/
   at load    on window popstate
*/
/* ============================== RENDER ROOT ============================== */
/* the browser's Back / Forward buttons move between pages (RO List → an RO → back) */
var HIST_LAST = null, HIST_POP = false;
function histSync(){
  try{
    var st = { pv: UI.view, ro: UI.view === "ros" ? (UI.selectedRo || null) : null };
    var key = st.pv + "|" + (st.ro || "");
    if(HIST_LAST === null){ history.replaceState(st, ""); HIST_LAST = key; return; }
    if(key === HIST_LAST) return;
    HIST_LAST = key;
    if(HIST_POP){ HIST_POP = false; return; }
    history.pushState(st, "");
  }catch(e){}
}
window.addEventListener("popstate", function(e){
  var st = e.state; if(!st || !st.pv) return;
  HIST_POP = true; UI.view = st.pv; if(st.ro) UI.selectedRo = st.ro; UI.modal = null;
  render(); window.scrollTo(0, 0);
});
function render(){
  if(MI.drag && MI.drag.ghost) return;   /* a truck in hand: the floor holds still */
  if(UI.modal && UI.modal.type === "add-ro"){ UI.modal = null; setTimeout(function(){ IMPX.open({}); }, 0); }   /* Parsec 12: New RO is the import */
  try{ pmBeforeRender(); }catch(e){ console.error(e); }
  try{ mxBefore(); }catch(e){ console.error(e); }   /* 17.1: what's open, so what closes can fade out (shell/motion-open.js) */
  LAST_RENDER = Date.now(); try{ v146Soon(); }catch(e){} try{ v147Soon(); }catch(e){} try{ v149eStamp(); }catch(e){}
  histSync();
  try{ IB.flush(); }catch(e){}
  if(fsGateOn()){ fsRenderGate(); return; }
  if(pxOut()){ pxRenderOut(); return; }
  document.documentElement.classList.remove("px-out");
  var rpTop = runningPunch();
  /* Forget dismissals for notices that have stopped firing, so the same problem
     recurring is announced again. localStorage only — the folder picks it up on
     the next real save, and a redraw should not stamp savedAt on its own. */
  try{ rtAutoAll(); }catch(e){ console.error(e); }
  try{ tgTrack(); }catch(e){ console.error(e); }   /* the late badge on Triage */
  try{ fmTrack(); }catch(e){ console.error(e); }   /* the Foreman badge */
  var allNow = computeWarningsAll(), remAll = computeRemindersAll();
  if(pruneDismissals(allNow.concat(remAll.escalated, remAll.soft))) persistLocal();
  var warnings = undismissed(allNow);
  var reminders = { soft: undismissed(remAll.soft), escalated: undismissed(remAll.escalated) };
  var badgeCount = warnings.length + reminders.escalated.length;
  var html = '';
  var pageKey = UI.view + "|" + (UI.selectedRo || "");
  if(LAST_PAGE_KEY !== null && LAST_PAGE_KEY !== pageKey) commitNoteDrafts();
  LAST_PAGE_KEY = pageKey;
  var roCtx = roCtxHtml();
  /* The view is built first: it is what settles which RO is selected, and the header's
     note button needs to know. */
  var viewHtml = "";
  if(!navAllowed(UI.view)) UI.view = (function(){ var sf = viewAsStaff(); return sf ? PG.homeOf(sf.role) : (navAllowed("rolist") ? "rolist" : navPages()[0][0]); })();
  if(dpIs(UI.view)) UI.dHome = UI.view;   /* 17.1: Time Log and Career sit on this department page (shell/dept-tabs.js) */
  if(UI.view==="tech") viewHtml = CX.viewTech();
  
  else if(UI.view==="foreman") viewHtml = viewForeman();
  else if(UI.view==="manager") viewHtml = viewManager();
  else if(UI.view==="triage") viewHtml = viewTriage();
  else if(UI.view==="rolist") viewHtml = viewRoList();
  else if(UI.view==="ros") viewHtml = viewROs();
  else if(UI.view==="warranty") viewHtml = viewWarranty();
  else if(UI.view==="fixes") viewHtml = viewFixes();
  else if(UI.view==="career") viewHtml = viewCareer();
  else if(UI.view==="timelog") viewHtml = viewTimeLog();
  else if(UI.view==="parts") viewHtml = viewInventory();
  else if(UI.view==="inventory") viewHtml = viewStock();   /* Parsec 12.5 */
  else if(UI.view==="admin") viewHtml = viewAdmin();   /* Parsec 13 */
  else if(UI.view==="assets") viewHtml = viewAssets();   /* Parsec 14 */
  else if(UI.view==="library") viewHtml = viewLibrary();   /* Parsec 17.1 */
  else if(UI.view==="fleets") viewHtml = viewFleets();   /* Parsec 17.1 */
  else if(UI.view==="report") viewHtml = viewDayReport();
  
  else if(UI.view==="profile") viewHtml = pxProfileView();
  viewHtml = dpTitle(viewHtml);   /* 17.1: “Technician · Time Log · Career” */
  if(RT_PAGE[UI.view] && UI.view !== "triage" && UI.view !== "foreman" && UI.view !== "warranty"){ var rtIn = rtInboxHtml(RT_PAGE[UI.view]); if(rtIn){ var hi = viewHtml.indexOf('</header>'); viewHtml = hi > -1 && hi < 4000 ? viewHtml.slice(0, hi + 9) + rtIn + viewHtml.slice(hi + 9) : rtIn + viewHtml; } }

  html += dayRibbonHtml();
  html += pzHeaderHtml(badgeCount) + pxPopHtml() + alertBannerHtml();
  html += '<div class="main v-'+UI.view+((UI.view==="ros"||UI.view==="console"||UI.view==="tech"||UI.view==="warranty"||UI.view==="fixes")?" wide":"")+'" data-key="main-'+UI.view+'">';
  html += viewHtml;
  html += '</div>';
  html += modalHtml();
  html += trxLayerHtml();
  html += paletteHtml();
  if(UI.toast) html += '<div class="toast-wrap" role="status"><div class="toast">'+esc(UI.toast)+(UI.toastUndo && UI.toastUndoRef === UNDO[UNDO.length - 1] ? '<button class="toast-undo" data-action="undo" aria-label="Undo">'+IC.undo+'<span>Undo</span></button>' : '')+'</div></div>';

  // A redraw replaces the whole tree, so put the scroll positions back afterwards —
  // otherwise the once-a-second refresh would yank the RO list to the top.
  var scrollMap = [];
  document.querySelectorAll("[data-scroll]").forEach(function(el){
    if(el.scrollTop) scrollMap.push([el.getAttribute("data-scroll"), el.scrollTop]);
  });
  var pageY = window.scrollY;

  patchApp(html);
  pxAfter();
  try{ var pgm = PG.mods[UI.view]; if(pgm && pgm.after) pgm.after(); }catch(e){ console.error(e); }
  try{ if(UI.view !== "ros") UI.roFrom = null; if(typeof rlEmbAfter === "function") rlEmbAfter(); }catch(e){}   /* Parsec 14.3 */
  try{ trkHydrate(); }catch(e){ console.error(e); }
  try{ pmAfter(); }catch(e){ console.error(e); }
  try{ pxwAfter(); }catch(e){ console.error(e); }   /* 17.1: the widths you set, and the drag edges (shell/widths.js) */
  document.documentElement.classList.toggle('yd-roam', false);   /* the Foreman yard is the Triage yard now */
  document.querySelectorAll('#app button[title]:not([aria-label])').forEach(function(b){ if(!/[A-Za-z0-9]/.test(b.textContent||'')) b.setAttribute('aria-label', b.getAttribute('title')); });

  scrollMap.forEach(function(pair){
    var el = document.querySelector('[data-scroll="'+pair[0]+'"]');
    if(el) el.scrollTop = pair[1];
  });
  if(pageY) window.scrollTo(0, pageY);
  if(UI.view === "triage"){ try{ tgAfter(); }catch(e){ console.error(e); } }
  if(UI.view === "foreman"){ try{ fmAfter(); }catch(e){ console.error(e); } }
  if(UI.view === "warranty"){ try{ waAfter(); }catch(e){ console.error(e); } }
  persistUI();
  updateSyncIndicator();
  var filterInput = document.querySelector('[data-bind="ro-filter"]');
  if(filterInput) filterInput.focus_guard = true;
  var tbEl = document.querySelector('.topbar');
  if(tbEl || document.querySelector('.pz-hdr')) document.documentElement.style.setProperty('--tb-h', hdrStuckH() + 'px');
  syncHeaderShrink();
  fitRoPage();
  attachConsole();
  fitMainPad();
  if(UI.palette){ var pqEl = document.getElementById("pal-q"); if(pqEl && document.activeElement !== pqEl) pqEl.focus(); }
  if(UI.modal && UI.modal.type === "inv-extract") invXPaint();
  if(UI.modal && UI.modal.type === "extract-ops") opsXPaint();
  applyBigTouch();
  if(DRAFT_MODAL && (!UI.modal || UI.modal.type !== DRAFT_MODAL)) draftsModalClosed(DRAFT_MODAL);
  DRAFT_MODAL = UI.modal ? UI.modal.type : null;
  draftsRestore();
  if(UI.modal && UI.modal !== render._lastModal){
    render._lastModal = UI.modal;
    if(UI.modal.type === "add-ro") restoreNewRoDraft();
    var firstIn = document.querySelector('.modal .modal-body [data-newro]') || document.querySelector('.modal .modal-body input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), .modal .modal-body textarea');
    if(firstIn && !document.activeElement.closest('.modal')) firstIn.focus();
  } else if(UI.modal && UI.modal.type === "add-ro") restoreNewRoDraft();
  else if(!UI.modal) render._lastModal = null;
  /* last: mounting the console reflows the pane and moves the note button with it,
     so the pop-over is placed against where the button actually ended up. */
  pinProfilePop();
  if(UI.profileOpen) requestAnimationFrame(pinProfilePop);
  try{ pmAfterRender(); }catch(e){ console.error(e); }
  try{ mxAfter(); }catch(e){ console.error(e); }
}
