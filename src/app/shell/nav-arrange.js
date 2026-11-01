/* Parsec · shell · nav-arrange.js
   Arranging the side bar: press and hold a page, then drag; a switch hides a page (the name menu keeps it); the shop’s order (the manager) and each person’s own.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pxaDefault pxaShop pxaMine pxaMineSet pxaMerge pxaOwn pxaOrder pxaHidden pxaIsHidden pxaCanShop pxaAllowed pxaRow … (27 functions, 2 constants)
   state      mgSet
   uses       access/ data/ kit/ ro/ state/
   at load    on document pointerdown · on document click · on document contextmenu · on document touchmove · on document keydown
*/
/* ============================== arranging the side bar (Parsec 17.1) ==============================
   Press and hold any page on the side bar, then drag it. While arranging, each page has a switch: off hides it from
   the side bar, and the name menu keeps it one click away. Done (or Esc) ends it; every drop is saved at once.
   Whose order: the manager sets the shop’s (anyone who can change settings, and the Admin) — STATE.mgSet.nav.order;
   anyone can change their own, on their staff record — sf.nav = { order, hide } (the Admin’s own: STATE.mgSet.navMe).
   Your own order wins over the shop’s; “Back to the shop’s order” drops it. A page missing from a saved order (a page
   added later) goes where the default order puts it, so nothing is ever lost. The pages each person has don’t change. */
var PXA = { on: false, order: null, drag: null, hold: 0, swallow: 0, mini: false, peek: false };
var PXA_HOLD_MS = 450;

function pxaDefault(){ return PX_GROUPS[0][1].slice(); }
function pxaShop(){ var m = STATE.mgSet; return m && m.nav && Array.isArray(m.nav.order) && m.nav.order.length ? m.nav.order : null; }
function pxaMine(){
  var sf = viewAsStaff(); if(sf) return sf.nav && typeof sf.nav === "object" ? sf.nav : null;
  var m = STATE.mgSet; return m && m.navMe && typeof m.navMe === "object" ? m.navMe : null;
}
function pxaMineSet(fn){
  var sf = viewAsStaff(), o;
  if(sf) o = sf.nav = sf.nav && typeof sf.nav === "object" ? sf.nav : {};
  else { var m = STATE.mgSet = STATE.mgSet && typeof STATE.mgSet === "object" ? STATE.mgSet : {}; o = m.navMe = m.navMe && typeof m.navMe === "object" ? m.navMe : {}; }
  fn(o); scheduleSave(true);
}
/* a saved order with the default's pages: the saved ones in their order, any missing one placed after its default neighbour */
function pxaMerge(saved){
  var def = pxaDefault(); if(!saved || !saved.length) return def;
  var out = saved.filter(function(k, i){ return def.indexOf(k) > -1 && saved.indexOf(k) === i; });
  def.forEach(function(k, i){
    if(out.indexOf(k) > -1) return;
    var j = i - 1; while(j >= 0 && out.indexOf(def[j]) < 0) j--;
    out.splice(j < 0 ? 0 : out.indexOf(def[j]) + 1, 0, k);
  });
  return out;
}
function pxaOwn(){ var me = pxaMine(); return !!(me && Array.isArray(me.order) && me.order.length); }
function pxaOrder(){ if(PXA.on && PXA.order) return PXA.order; var me = pxaMine(); return pxaMerge(pxaOwn() ? me.order : pxaShop()); }
function pxaHidden(){ var me = pxaMine(); return me && Array.isArray(me.hide) ? me.hide : []; }
function pxaIsHidden(k){ return pxaHidden().indexOf(k) > -1; }
function pxaCanShop(){ try{ return can("a.settings"); }catch(e){ return false; } }
/* the pages this person has, keyed (the RO List stands for Repair Orders when both are there) */
function pxaAllowed(){ var a = {}; navPages().forEach(function(p){ a[p[0]] = p; }); if(a.ros && a.rolist) delete a.ros; return a; }

/* ---------- on the rail ---------- */
/* a row while arranging: no link, a grip, a switch */
function pxaRow(k, p, ico){
  var off = pxaIsHidden(k);
  return '<div class="pxr-row pxa-row' + (off ? ' off' : '') + '" data-view="' + k + '" tabindex="0" role="listitem" aria-label="' + esc(p[1] + (off ? ' — hidden' : '')) + '">'
    + '<span class="pxr-ic">' + ico + '</span><span class="pxr-tl">' + esc(p[1]) + '</span>'
    + '<button class="pxa-sw" data-action="px-arr-hide" data-view="' + k + '" role="switch" aria-checked="' + !off + '" title="' + (off ? 'Show ' : 'Hide ') + esc(p[1]) + ' on the side bar"><i></i></button>'
    + '<span class="pxa-grip" aria-hidden="true"></span></div>';
}
function pxaBar(){
  return '<div class="pxa-bar" data-key="pxa-bar"><small>Drag a page to move it · a switch hides it</small>'
    + '<button class="px-btn sm pri" data-action="px-arr-done">Done</button>'
    + (pxaCanShop() ? '<button class="px-btn sm" data-action="px-arr-shop" title="Everyone without their own order sees this one">Make this the shop’s order</button>' : '')
    + (pxaOwn() ? '<button class="px-btn sm ghost" data-action="px-arr-reset" title="Drop your own order and use the shop’s">Back to the shop’s order</button>' : '')
    + '</div>';
}
/* the name menu: hidden pages, one click away, and a way in that needs no holding */
function pxaMenuHtml(){
  var a = pxaAllowed(), H = pxaOrder().filter(function(k){ return a[k] && pxaIsHidden(k); });
  return '<div class="px-sep"></div>'
    + (H.length ? '<div class="pxa-mh">Hidden from the side bar</div>' + H.map(function(k){ return '<button class="px-mi" data-action="nav" data-view="' + k + '">' + (ivIco(IV_NAV_IC[k], 15) || '') + esc(a[k][1]) + '</button>'; }).join('') : '')
    + '<button class="px-mi" data-action="px-arr-start">' + pxI("sidebar", 15) + 'Arrange the side bar<span class="meta">or hold a page</span></button>';
}

/* ---------- arranging ---------- */
function pxaStart(){
  if(PXA.on) return;
  PXA.order = pxaOrder().slice(); PXA.on = true; UI.pxPop = null;
  var de = document.documentElement; PXA.mini = de.classList.contains("iv-mini"); if(PXA.mini) de.classList.remove("iv-mini");
  PXA.peek = false; if(pxNarrow() && !UI.pxPeek){ UI.pxPeek = true; PXA.peek = true; }
  render();
}
function pxaDone(){
  if(!PXA.on) return;
  pxaUngrab(); PXA.on = false; PXA.order = null;
  if(PXA.mini) document.documentElement.classList.add("iv-mini");
  if(PXA.peek) UI.pxPeek = false;
  PXA.mini = PXA.peek = false; render();
}
function pxaSave(){ var L = PXA.order.slice(); pxaMineSet(function(o){ o.order = L; }); }
function pxaNav(){ return document.querySelector(".px-rail .pxr-nav"); }
function pxaEl(k){ return document.querySelector('.px-rail .pxr-nav > [data-view="' + k + '"]'); }
/* the rows on screen, in their order, fill the slots the visible pages had in the full order (pages this person lacks keep theirs) */
function pxaFromDom(){
  var nav = pxaNav(); if(!nav || !PXA.order) return;
  var vis = Array.prototype.map.call(nav.querySelectorAll(":scope > [data-view]"), function(r){ return r.dataset.view; }), j = 0;
  PXA.order = PXA.order.map(function(k){ return vis.indexOf(k) > -1 ? vis[j++] : k; });
}
/* move a row to sit before `before` (null = last), the others sliding to their new places */
function pxaPlace(el, before){
  var nav = el.parentNode, rows = Array.prototype.filter.call(nav.children, function(r){ return r !== el && r.dataset && r.dataset.view; });
  var y0 = rows.map(function(r){ return r.getBoundingClientRect().top; });
  nav.insertBefore(el, before);
  rows.forEach(function(r, i){ var dy = y0[i] - r.getBoundingClientRect().top; if(!dy) return;
    r.style.transition = "none"; r.style.transform = "translateY(" + dy + "px)"; void r.offsetHeight; r.style.transition = "transform .16s ease"; r.style.transform = ""; });
}
function pxaGrab(k, e){
  pxaUngrab();
  PXA.drag = { k: k, id: e.pointerId };
  var el = pxaEl(k); if(el) el.classList.add("drag");
  var nav = pxaNav(); if(nav) nav.classList.add("dragging");
  document.addEventListener("pointermove", pxaMove, true);
  document.addEventListener("pointerup", pxaDrop, true);
  document.addEventListener("pointercancel", pxaDrop, true);
}
function pxaUngrab(){
  document.removeEventListener("pointermove", pxaMove, true);
  document.removeEventListener("pointerup", pxaDrop, true);
  document.removeEventListener("pointercancel", pxaDrop, true);
  var d = PXA.drag; PXA.drag = null;
  if(d){ var el = pxaEl(d.k); if(el) el.classList.remove("drag"); }
  var nav = pxaNav(); if(nav) nav.classList.remove("dragging");
}
function pxaMove(e){
  var d = PXA.drag; if(!d || (d.id != null && e.pointerId !== d.id)) return;
  e.preventDefault();
  var el = pxaEl(d.k); if(!el) return; el.classList.add("drag");
  var rows = Array.prototype.filter.call(el.parentNode.children, function(r){ return r !== el && r.dataset && r.dataset.view; }), before = null;
  for(var i = 0; i < rows.length; i++){ var r = rows[i].getBoundingClientRect(); if(e.clientY < r.top + r.height / 2){ before = rows[i]; break; } }
  if(before ? el.nextElementSibling !== before : el.parentNode.lastElementChild !== el) pxaPlace(el, before);
}
function pxaDrop(e){
  var d = PXA.drag; if(!d || (d.id != null && e.pointerId !== d.id)) return;
  PXA.swallow = Date.now();
  pxaUngrab(); pxaFromDom(); pxaSave(); render();
}
/* keys while arranging: ↑ ↓ move the page in focus, Esc or Enter is Done */
function pxaKey(e){
  if(!PXA.on) return;
  var row = document.activeElement && document.activeElement.closest ? document.activeElement.closest(".pxa-row") : null;
  if(e.key === "Escape" || (e.key === "Enter" && row)){ e.preventDefault(); e.stopPropagation(); pxaDone(); return; }
  if(!row || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
  e.preventDefault(); e.stopPropagation();
  var sib = e.key === "ArrowUp" ? row.previousElementSibling : row.nextElementSibling; if(!sib || !sib.dataset.view) return;
  var k = row.dataset.view;
  pxaPlace(row, e.key === "ArrowUp" ? sib : sib.nextElementSibling);
  pxaFromDom(); pxaSave(); render();
  var el = pxaEl(k); if(el) el.focus();
}

/* ---------- the actions (px-arr-…) ---------- */
function pxaAct(a, t){
  if(a === "px-arr-start"){ pxaStart(); return true; }
  if(a === "px-arr-done"){ pxaDone(); return true; }
  if(a === "px-arr-hide"){
    var k = t.dataset.view, al = pxaAllowed(), shown = pxaOrder().filter(function(x){ return al[x] && !pxaIsHidden(x); }).length, off = pxaIsHidden(k);
    if(!off && shown <= 1){ pushToast("Keep one page on the side bar."); return true; }
    pxaMineSet(function(o){ var h = Array.isArray(o.hide) ? o.hide : (o.hide = []), i = h.indexOf(k); if(i > -1) h.splice(i, 1); else h.push(k); });
    render(); return true;
  }
  if(a === "px-arr-shop"){
    if(!pxaCanShop()) return true;
    var L = pxaOrder().slice(), m = STATE.mgSet = STATE.mgSet && typeof STATE.mgSet === "object" ? STATE.mgSet : {};
    m.nav = { order: L, by: pxMeName(), at: nowIso() };
    pxaMineSet(function(o){ delete o.order; });
    try{ audit("perm", "Side bar: the shop’s order set by " + pxMeName()); }catch(e){}
    pushToast("That’s the shop’s order now — for everyone who hasn’t arranged their own.", true); render(); return true;
  }
  if(a === "px-arr-reset"){
    pxaMineSet(function(o){ delete o.order; });
    if(PXA.on) PXA.order = pxaMerge(pxaShop());
    pushToast("Your side bar follows the shop’s order again.", true); render(); return true;
  }
  return false;
}

/* ---------- press and hold ---------- */
document.addEventListener("pointerdown", function(e){
  if(e.pointerType === "mouse" && e.button !== 0) return;
  var row = e.target && e.target.closest ? e.target.closest(".px-rail .pxr-nav > [data-view]") : null; if(!row) return;
  if(e.target.closest(".pxa-sw")) return;
  var k = row.dataset.view;
  if(PXA.on){ e.preventDefault(); pxaGrab(k, e); return; }
  var x0 = e.clientX, y0 = e.clientY, id = e.pointerId;
  var stop = function(){ clearTimeout(PXA.hold); PXA.hold = 0; document.removeEventListener("pointermove", mv, true); document.removeEventListener("pointerup", stop, true); document.removeEventListener("pointercancel", stop, true); };
  var mv = function(ev){ if(ev.pointerId === id && Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) > 8) stop(); };
  stop();
  document.addEventListener("pointermove", mv, true); document.addEventListener("pointerup", stop, true); document.addEventListener("pointercancel", stop, true);
  PXA.hold = setTimeout(function(){ stop(); PXA.swallow = Date.now(); pxaStart(); pxaGrab(k, { pointerId: id }); }, PXA_HOLD_MS);
}, true);
/* the click that ends a hold or a drag doesn't open the page */
document.addEventListener("click", function(e){
  if(Date.now() - PXA.swallow > 600) return;
  if(e.target && e.target.closest && e.target.closest(".px-rail .pxr-nav")){ e.preventDefault(); e.stopPropagation(); PXA.swallow = 0; }
}, true);
document.addEventListener("contextmenu", function(e){ if(e.target && e.target.closest && e.target.closest(".px-rail .pxr-nav [data-view]") && (PXA.on || PXA.hold)) e.preventDefault(); }, true);
/* while dragging by touch, the page doesn't scroll */
document.addEventListener("touchmove", function(e){ if(PXA.drag) e.preventDefault(); }, { capture: true, passive: false });
document.addEventListener("keydown", pxaKey, true);
