/* Parsec · shell · motion.js
   The micro-interactions (Parsec 10): MI holds what is animating; pmBeforeRender / pmAfterRender glide cards between renders; pmStageNotice flashes a stage.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pmMotion pmAnimate pmBeforeRender pmAfterRender pmDetailRendered pmStageNotice MI MI_ICON (6 functions, 2 constants)
   uses       pages/foreman/ pages/triage/ ro/ state/
*/
/* ============================== Parsec 10 ==============================
   From ChatGPT's file, with the shop's own data: the micro-interactions (RO switching, moving a truck with
   a drag or Move truck, the repair-progress segment and its Undo, quick search), and the next eight: a quick
   peek on the Foreman floor, how long each blocker has waited, the bay that fits, the technician's day before
   assigning, saved views on the RO list, the shift handover, notes on the truck and the readiness count.
   Motion stays small (140–240 ms) and stops when the computer asks for less. */

/* ---------- motion ---------- */
var MI = { rects: {}, sel: null, det: null, stages: {}, palOpen: false, palFocus: null, drag: null, rel: null, noClick: 0 };
function pmMotion(){ return !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
function pmAnimate(node, frames, ms){ if(node && node.animate && pmMotion()) try{ node.animate(frames, { duration: ms || 180, easing: "cubic-bezier(.2,.75,.25,1)" }); }catch(e){} }
var MI_ICON = ":scope > .fm-ti, :scope > .tg-tv";
/* before a draw: where each truck sits now (its bay or spot, and where its picture is on the screen) */
function pmBeforeRender(){
  MI.rects = {};
  document.querySelectorAll("#app .fm-bay[data-ro], #app .tg-s[data-ro]").forEach(function(n){
    var id = n.getAttribute("data-ro"), v = n.querySelector(MI_ICON); if(!v || !id) return;
    MI.rects[id] = { rect: MI.rel && MI.rel.id === id ? MI.rel.rect : v.getBoundingClientRect(), spot: n.getAttribute("data-pm-spot") || "", html: v.innerHTML, cls: v.className };
  });
  if(!UI.palette) MI.palFocus = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;
}
/* after a draw: the header eases in when the RO changes; a truck that changed bays flies there; Search gets its labels */
function pmAfterRender(){
  var key = UI.view + "|" + (UI.view === "foreman" ? UI.fmSel : UI.view === "triage" ? UI.tgSel : UI.selectedRo);
  if(MI.sel !== null && MI.sel !== key && MI.sel.split("|")[0] === UI.view) pmAnimate(document.querySelector("#app .tg-top, #app .tg-dkh"), [{ opacity: .85, transform: "translateY(3px)" }, { opacity: 1, transform: "none" }], 180);
  MI.sel = key;
  document.querySelectorAll("#app .fm-bay[data-ro], #app .tg-s[data-ro]").forEach(function(n){
    var id = n.getAttribute("data-ro"), ro = getRO(id); if(!ro) return;
    var spot = tgSpotOf(ro), v = n.querySelector(MI_ICON), prev = MI.rects[id]; n.setAttribute("data-pm-spot", spot);
    if(!prev || !v || !prev.spot || prev.spot === spot || !pmMotion()) return;
    var now = v.getBoundingClientRect(), old = prev.rect;
    if(!now.width || !old.width || now.bottom < 0 || old.bottom < 0) return;
    var g = document.createElement("div"); g.className = "pm-flight"; g.setAttribute("aria-hidden", "true"); g.innerHTML = prev.html;
    g.style.cssText = "left:" + old.left + "px;top:" + old.top + "px;width:" + old.width + "px;height:" + old.height + "px";
    document.body.appendChild(g); v.style.visibility = "hidden";
    var dx = now.left - old.left + (now.width - old.width) / 2, dy = now.top - old.top + (now.height - old.height) / 2;
    var a = g.animate([{ transform: "translate(0,0) scale(1)", opacity: .92 }, { transform: "translate(" + dx / 2 + "px," + (dy / 2 - 12) + "px) scale(1.12)", offset: .5 }, { transform: "translate(" + dx + "px," + dy + "px) scale(1)", opacity: 1 }], { duration: 240, easing: "cubic-bezier(.2,.75,.25,1)" });
    var done = function(){ g.remove(); v.style.visibility = ""; }; a.onfinish = done; a.oncancel = done;
    pmAnimate(n, [{ boxShadow: "inset 0 0 0 2px var(--tg-acc, #86643a)" }, { boxShadow: "inset 0 0 0 0 transparent" }], 480);
  });
  /* Search: a combobox and its list, read out as such; it eases in; closing it puts focus back */
  var open = !!UI.palette;
  if(open){
    var inp = document.getElementById("pal-q"), list = document.querySelector(".pal-list"), rows = document.querySelectorAll(".pal-row");
    if(list) list.id = "pm-search-results";
    rows.forEach(function(r, i){ r.id = "pm-search-" + i; r.tabIndex = -1; });
    if(inp){ inp.setAttribute("role", "combobox"); inp.setAttribute("aria-expanded", "true"); inp.setAttribute("aria-autocomplete", "list"); inp.setAttribute("aria-controls", "pm-search-results");
      if(rows[UI.palette.sel]){ inp.setAttribute("aria-activedescendant", rows[UI.palette.sel].id); try{ rows[UI.palette.sel].scrollIntoView({ block: "nearest" }); }catch(e){} } else inp.removeAttribute("aria-activedescendant"); }
    if(!MI.palOpen){ pmAnimate(document.querySelector(".pal"), [{ opacity: 0, transform: "translateY(-6px) scale(.985)" }, { opacity: 1, transform: "none" }], 140); pmAnimate(document.querySelector(".pal-wrap"), [{ opacity: 0 }, { opacity: 1 }], 140); }
  } else if(MI.palOpen && MI.palFocus && MI.palFocus.isConnected){ try{ MI.palFocus.focus({ preventScroll: true }); }catch(e){} }
  MI.palOpen = open;
  MI.rel = null; if(!MI.drag) pmDragClear();
  if(UI.view !== "foreman") pkHide(true);
}
/* the RO page: its header eases in when you switch ROs; a stage's segment fills when it's checked off */
function pmDetailRendered(root, ro){
  if(!root || !ro) return;
  if(MI.det !== null && MI.det !== ro.id) pmAnimate(root.querySelector(".px-trk, .px-titleblock"), [{ opacity: .85, transform: "translateY(3px)" }, { opacity: 1, transform: "none" }], 180);
  MI.det = ro.id;
  root.querySelectorAll("[data-pm-stage]").forEach(function(n){
    var id = ro.id + "|" + n.getAttribute("data-pm-stage"), done = n.classList.contains("is-done");
    if(MI.stages[id] !== undefined && MI.stages[id] !== done) pmAnimate(n.querySelector("i"), done ? [{ transform: "scaleX(.12)", opacity: .4 }, { transform: "scaleX(1)", opacity: 1 }] : [{ transform: "scaleX(1)", opacity: 1 }, { transform: "scaleX(.12)", opacity: .4 }, { transform: "scaleX(1)", opacity: 1 }], 220);
    MI.stages[id] = done;
  });
}
/* checking a stage off says so, with Undo while it's still the last thing done */
function pmStageNotice(ro, k){
  var entry = UNDO[UNDO.length - 1];
  setTimeout(function(){ if(UNDO[UNDO.length - 1] !== entry) return; var M = roStages(ro), x = M && M.list.filter(function(s){ return s.k === k; })[0];
    pushToast((x ? x.name : (typeof RS_NAME !== "undefined" && RS_NAME[k]) || "Stage") + (x && x.state === "d" ? " checked off." : " reopened."), true); }, 0);
}
