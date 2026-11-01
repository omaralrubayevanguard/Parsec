/* Parsec · shell · live-time.js
   The second-by-second tick: tickLive patches only the figures that move (clocks, elapsed), never a full render while you are typing (safeToRedraw).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   tickLive safeToRedraw beat LAST_RENDER LONG_CHECK_AT (3 functions, 2 constants)
   uses       clock/ kit/ ro/ state/
   at load    a timer
*/
/* ---------- live time ----------
   Every second we patch only the figures that move, in place. A full re-render
   would fight you: it drops focus mid-word, closes native selects and kills text
   selection. The slower heartbeat below picks up everything else. */
function tickLive(){
  var now = Date.now();
  document.querySelectorAll("[data-live-elapsed]").forEach(function(el){
    el.textContent = fmtHMS(now - new Date(el.getAttribute("data-live-elapsed")));
  });
  document.querySelectorAll("[data-live-hm]").forEach(function(el){ el.textContent = fmtHM(now - new Date(el.getAttribute("data-live-hm"))); });
  document.querySelectorAll("[data-live-since]").forEach(function(el){
    el.textContent = fmtElapsedShort(now - new Date(el.getAttribute("data-live-since")));
  });

  var rp = runningPunch();
  document.querySelectorAll("[data-shift-since]").forEach(function(el){ el.textContent = fmtHMS(now - new Date(el.getAttribute("data-shift-since"))); });
  document.querySelectorAll("[data-shift-hm]").forEach(function(el){ el.textContent = fmtHM(todayShiftMs()); });
  var nd = new Date(), ns = String(nd.getHours()).padStart(2,"0") + ":" + String(nd.getMinutes()).padStart(2,"0");
  document.querySelectorAll("[data-clock-now]").forEach(function(el){ if(el.textContent !== ns) el.textContent = ns; });
  document.querySelectorAll("[data-live-punch]").forEach(function(el){ el.textContent = fmtHMS(now - new Date(el.getAttribute("data-live-punch"))); });

  // the operation on screen, if it is the one burning time
  if(rp && UI.view === "ros"){
    var ro = getRO(rp.roId);
    if(ro && UI.roPane[ro.id] === rp.opId) recalcLive(ro.id, rp.opId);
  }
}

/* Everything else — day totals, career figures, part aging, warnings — is fine a
   few seconds stale, so it rides a slower beat that never interrupts you. */
/* A full redraw every second keeps every figure on every page honest. It is
   skipped whenever it would interrupt you — typing, a modal, or selected text —
   and the per-second patching above covers the running clock in the meantime. */
function safeToRedraw(){
  /* A dialog normally freezes the redraw so it cannot be yanked out from under you
     mid-sentence. The Warnings list is the one worth reconsidering: it holds no
     fields, and the whole point is that a notice disappears the moment its problem
     is fixed — which can only happen if the page is allowed to rebuild underneath it. */
  if(UI.modal){
    if(UI.modal.type !== "warnings") return false;
    /* Refresh it while you read, but never while your finger is on it: rebuilding
       the list moves the button out from under a click. Dismissing redraws on its
       own anyway, so nothing is lost by holding off. */
    var inList = document.activeElement;
    if(inList && inList.closest && inList.closest(".modal")) return false;
  }
  var a = document.activeElement;
  while(a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;   /* Parsec 14.8: a field inside the RO page */
  if(a && /^(input|textarea|select)$/i.test(a.tagName)) return false;
  if(a && a.isContentEditable) return false;
  if(window.getSelection && String(window.getSelection()).length) return false;
  return true;
}

/* The clock and live timers tick every second (tickLive, plus the console's own timers).
   The whole page is rebuilt only every 5 s while a punch runs and once a minute otherwise;
   anything you do still redraws at once. */
var LAST_RENDER = 0;
var LONG_CHECK_AT = 0;
function beat(){
  if(Date.now() - LONG_CHECK_AT > 60000){ LONG_CHECK_AT = Date.now(); checkLongClock(); }
  var period = runningPunches().length ? 5000 : 60000;
  if(Date.now() - LAST_RENDER >= period && safeToRedraw()) render();
  else tickLive();
}

setInterval(beat, 1000);
