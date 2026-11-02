/* Parsec · shell · widths.js
   Widths you set by dragging: the side bar's edge, the panes (lists, the RO list's side panel, the Library's document panel); the folded side bar opens on hover over its expand button.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pxwWho pxwGet pxwSet pxwPhone pxwZ pxwRailApply pxwFolded pxwKey pxwRoots pxwT pxwFit pxwSize … (13 functions, 3 constants)
   uses       access/ kit/ state/
   at load    on document mouseover · on document click · on document pointerdown · on document dblclick
*/
/* ============================== widths you set by dragging (Parsec 17.1) ==============================
   · The side bar: drag its right edge (180–380 px; a double-click puts it back). --px-rail-w on <html>.
   · While it's folded to icons, resting the pointer on its expand button opens it over the page; it folds again when the
     pointer leaves (a click keeps it open, as before).
   · The panes: a page's list (.tg-list), the Settings list (.px-list), the RO list's side panel (.rq-peek) and the Library's
     document panel (.lib-view) get a drag edge; a double-click puts the pane back.
   Widths are this browser's convenience (localStorage, per person), never shop data. On a phone nothing here applies. */
var PXW = { t: 0, drag: null };
var PXW_RAIL = [180, 380, 236];
function pxwWho(){ try{ var sf = viewAsStaff(); return sf ? sf.id : "admin"; }catch(e){ return "admin"; } }
function pxwGet(k){ try{ var v = +localStorage.getItem("pxw:" + pxwWho() + ":" + k); return v > 0 ? v : 0; }catch(e){ return 0; } }
function pxwSet(k, v){ try{ if(v) localStorage.setItem("pxw:" + pxwWho() + ":" + k, String(Math.round(v))); else localStorage.removeItem("pxw:" + pxwWho() + ":" + k); }catch(e){} }
function pxwPhone(){ return document.documentElement.getAttribute("data-device") === "phone"; }
function pxwZ(){ try{ return typeof ZF === "function" ? ZF() || 1 : 1; }catch(e){ return 1; } }

/* ---------- the side bar ---------- */
function pxwRailApply(){ var w = pxwGet("rail"), de = document.documentElement; if(w) de.style.setProperty("--px-rail-w", w + "px"); else de.style.removeProperty("--px-rail-w"); }
function pxwFolded(){ var de = document.documentElement; return de.classList.contains("iv-mini") || (de.classList.contains("px-narrow") && !de.classList.contains("px-peek")); }
/* open over the page while the pointer rests on the expand button; fold when it leaves the side bar (and its menus) */
document.addEventListener("mouseover", function(e){
  if(pxwPhone() || PXW.drag) return;
  var de = document.documentElement, t = e.target, on = de.classList.contains("px-hover");
  var brand = t && t.closest && t.closest(".px-rail .pxr-brand"), inside = t && t.closest && t.closest(".px-rail, .pxr-pop");
  clearTimeout(PXW.t);
  if(!on){ if(brand && pxwFolded()) PXW.t = setTimeout(function(){ if(pxwFolded()) de.classList.add("px-hover"); }, 120); return; }
  if(!inside) PXW.t = setTimeout(function(){ if(!UI.pxPop && !(typeof PXA !== "undefined" && PXA.on)) de.classList.remove("px-hover"); }, 260);
}, true);
/* a click on the expand or fold button decides for itself: the hover state steps aside */
document.addEventListener("click", function(e){ if(e.target && e.target.closest && e.target.closest(".pxr-brand, .pxr-col")){ clearTimeout(PXW.t); document.documentElement.classList.remove("px-hover"); } }, true);

/* ---------- the panes ---------- */
/* [selector, key, the edge you drag ('r' = right, 'l' = left), smallest, largest share of the window] */
var PXW_PANES = [[".tg-body > .tg-list", "list", "r", 220, .5], [".px-body > .px-list", "plist", "r", 220, .45], [".rq-peek:not(.rp-ro)", "peek", "l", 300, .6], [".lib-view", "libv", "l", 380, .8], [".px-ro__rail", "rorail", "l", 300, .5]];
/* the page's own key — the RO page's right column (in its shadow root) by the page it sits on, so each page remembers */
function pxwKey(el, k){ if(el.getRootNode && el.getRootNode() !== document) return k + ":" + UI.view; var pg = el.closest("[data-pg]"); return k + ":" + (pg ? pg.getAttribute("data-pg") : UI.view); }
function pxwRoots(){ var L = [document]; document.querySelectorAll(".jc-host").forEach(function(h){ if(h.shadowRoot) L.push(h.shadowRoot); }); return L; }
function pxwT(e){ return e.composedPath ? e.composedPath()[0] : e.target; }
function pxwFit(w, P){ var max = Math.round(window.innerWidth / pxwZ() * P[4]); return Math.max(P[3], Math.min(max, w)); }
function pxwSize(el, w){ el.style.setProperty("flex-basis", w + "px"); el.style.setProperty("width", w + "px"); el.style.setProperty("max-width", "none"); }
/* after each draw: the saved widths back on, and the drag edges */
function pxwAfter(){
  pxwRailApply();
  if(pxwPhone()) return;
  var rail = document.querySelector(".px-rail");
  if(rail && !rail.querySelector(":scope > .pxr-rs")){ var r = document.createElement("div"); r.className = "pxr-rs"; r.setAttribute("aria-hidden", "true"); rail.appendChild(r); }
  PXW_PANES.forEach(function(P){
    pxwRoots().forEach(function(root){ root.querySelectorAll(P[0]).forEach(function(el){
      var k = pxwKey(el, P[1]), w = pxwGet(k);
      if(w) pxwSize(el, pxwFit(w, P));
      if(!el.querySelector(":scope > .pxw-rs")){ var h = document.createElement("div"); h.className = "pxw-rs " + P[2]; h.setAttribute("aria-hidden", "true"); h.setAttribute("data-pxw", P[1]); el.appendChild(h); }
    }); });
  });
}
/* dragging an edge */
document.addEventListener("pointerdown", function(e){
  if(e.button !== 0 || pxwPhone()) return;
  var t = pxwT(e), rail = t.closest && t.closest(".pxr-rs"), pane = !rail && t.closest && t.closest(".pxw-rs");
  if(!rail && !pane) return;
  e.preventDefault(); e.stopPropagation();
  var de = document.documentElement, z = pxwZ(), x0 = e.clientX, d;
  if(rail){ d = { rail: true, w0: rail.parentNode.getBoundingClientRect().width / z }; }
  else {
    var P = PXW_PANES.filter(function(p){ return p[1] === pane.getAttribute("data-pxw"); })[0], el = pane.parentNode;
    d = { P: P, el: el, k: pxwKey(el, P[1]), w0: el.getBoundingClientRect().width / z };
  }
  d.x0 = x0; d.z = z; PXW.drag = d; de.classList.add("pxw-dragging");
  var mv = function(ev){
    var dx = (ev.clientX - d.x0) / d.z, w;
    if(d.rail){ w = Math.max(PXW_RAIL[0], Math.min(PXW_RAIL[1], d.w0 + dx)); d.w = w; de.style.setProperty("--px-rail-w", Math.round(w) + "px"); }
    else { w = pxwFit(d.w0 + (d.P[2] === "r" ? dx : -dx), d.P); d.w = w; pxwSize(d.el, Math.round(w)); }
  };
  var up = function(){
    document.removeEventListener("pointermove", mv, true); document.removeEventListener("pointerup", up, true); document.removeEventListener("pointercancel", up, true);
    de.classList.remove("pxw-dragging"); PXW.drag = null;
    if(d.w){ if(d.rail) pxwSet("rail", d.w); else pxwSet(d.k, d.w); }
    try{ window.dispatchEvent(new Event("resize")); }catch(x){}
  };
  document.addEventListener("pointermove", mv, true); document.addEventListener("pointerup", up, true); document.addEventListener("pointercancel", up, true);
}, true);
/* a double-click on an edge puts the width back */
document.addEventListener("dblclick", function(e){
  var t = pxwT(e), rail = t.closest && t.closest(".pxr-rs"), pane = !rail && t.closest && t.closest(".pxw-rs");
  if(rail){ pxwSet("rail", 0); pxwRailApply(); return; }
  if(pane){ var P = PXW_PANES.filter(function(p){ return p[1] === pane.getAttribute("data-pxw"); })[0], el = pane.parentNode; pxwSet(pxwKey(el, P[1]), 0); ["flex-basis", "width", "max-width"].forEach(function(p){ el.style.removeProperty(p); }); }
}, true);
pxwRailApply();
