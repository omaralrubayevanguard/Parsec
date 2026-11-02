/* Parsec · shell · motion-open.js
   Everything that opens, closes or switches moves: what closes fades out where it was, a fold eases the section to its new height, a tab or page eases in.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   mxOn mxEase mxGhost mxRect mxBefore mxAfter mxWatch mxBox mxSettle mxNew MX MX_OVL … (10 functions, 5 constants)
   at load    on document DOMContentLoaded · on document click
*/
/* ============================== everything that opens, closes or switches moves smoothly (Parsec 17.1) ==============================
   · Opening: menus, drop-downs, pop-overs, modals and side panels glide in (the CSS in styles/app/57-motion.css).
   · Closing: whatever goes away fades out where it was, instead of vanishing — a menu, a pop-over, a modal, a side panel
     (a copy of it, without its ids, that nothing can click; gone in 160 ms).
   · Expand and collapse: the section around what you folded eases to its new height; what appears slides in.
   · Tabs and pages: the new view eases in.
   All of it is short (140–260 ms) and none of it plays when the computer asks for less motion. */
var MX = { pre: [], fold: null, tab: null };
var MX_OVL = ".modal-backdrop, .overlay, .roreo, .ix-wrap, .ti-wrap, .pal-wrap, .trx-layer, .lib-view, .tg-pop, .pxr-pop, .rl-menu, .notif-pop, .pm-sheet, .pm-scrim, .v163b-ask, .px-trk__menu";
var MX_FOLD = "[aria-expanded], .rod-gh, .rp-gh, .tg-grp, .px-pg__h, .rop-fh, .rop-fb, .rop-fall, .rp-all, .lib-code, .tg-it[data-a='grp'], [data-a='grp'], [data-rp-fold], [data-rod-g]";
var MX_TAB = "[role=tab], .tg-views button, .lib-tab, .dp-t, .rq-seg button, .fl-tabs button, .px-tab, .px-tabs button, [data-a='tab'], [data-a='view'], [data-a='tvw'], [data-a='ftab'], [data-action='nav']";
function mxOn(){ return typeof pmMotion === "function" ? pmMotion() : !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
function mxEase(){ return "cubic-bezier(.2,.8,.2,1)"; }

/* ---------- closing: a still copy fades out where it was ---------- */
function mxGhost(node, rect){
  if(!mxOn() || !node || node.nodeType !== 1 || node.__mxG || node.classList.contains("mx-out") || !document.body) return;
  node.__mxG = true;
  var g = node.cloneNode(true);
  g.classList.add("mx-out"); g.removeAttribute("id"); g.removeAttribute("data-key");
  g.querySelectorAll("[id]").forEach(function(x){ x.removeAttribute("id"); });
  g.querySelectorAll("iframe, embed, object, video, audio, canvas").forEach(function(x){ var r = document.createElement("div"); r.style.cssText = "width:" + (x.offsetWidth || x.clientWidth || 0) + "px;height:" + (x.offsetHeight || 0) + "px"; x.replaceWith(r); });   /* a copy never loads anything again */
  g.querySelectorAll("img[src^='blob:']").forEach(function(x){ x.removeAttribute("src"); });
  g.setAttribute("aria-hidden", "true"); g.style.pointerEvents = "none";
  var fixed = false; try{ fixed = rect && rect.fixed; }catch(e){}
  if(rect && !fixed){ g.style.position = "fixed"; g.style.left = rect.left + "px"; g.style.top = rect.top + "px"; g.style.width = rect.width + "px"; g.style.height = rect.height + "px"; g.style.margin = "0"; g.style.right = "auto"; g.style.bottom = "auto"; g.style.zIndex = "9600"; }
  document.body.appendChild(g);
  var side = node.classList.contains("lib-view") || node.classList.contains("rq-peek");
  var a = null; try{ a = g.animate(side ? [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(18px)" }] : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-3px) scale(.985)" }], { duration: 160, easing: "ease-in", fill: "forwards" }); }catch(e){}
  var done = function(){ if(g.parentNode) g.parentNode.removeChild(g); };
  if(a && a.finished) a.finished.then(done, done); else setTimeout(done, 170);
  setTimeout(done, 400);
}
function mxRect(el){ try{ var r = el.getBoundingClientRect(), cs = getComputedStyle(el); return { left: r.left, top: r.top, width: r.width, height: r.height, fixed: cs.position === "fixed" }; }catch(e){ return null; } }
/* before each draw: what's open now, and where */
function mxBefore(){
  MX.pre = [];
  if(!mxOn()) return;
  document.querySelectorAll(MX_OVL).forEach(function(el){ if(!el.classList.contains("mx-out") && el.isConnected) MX.pre.push({ el: el, r: mxRect(el) }); });
}
/* after each draw: what closed fades out; a fold or a tab eases */
function mxAfter(){
  if(!mxOn()){ MX.pre = []; return; }
  MX.pre.forEach(function(x){ if(!x.el.isConnected) mxGhost(x.el, x.r); });
  MX.pre = [];
  mxSettle();
}
/* overlays added straight to the page (the questions, the Library's dialog and panel) and taken away without a draw */
function mxWatch(){ try{ new MutationObserver(function(L){
  if(!mxOn()) return;
  L.forEach(function(m){
    m.removedNodes.forEach(function(n){ if(n.nodeType === 1 && !n.__mxG && !n.classList.contains("mx-out") && n.matches && n.matches(MX_OVL) && n.__mxR) mxGhost(n, n.__mxR); });
    m.addedNodes.forEach(function(n){ if(n.nodeType === 1 && !n.classList.contains("mx-out") && n.matches && n.matches(MX_OVL)) requestAnimationFrame(function(){ if(n.isConnected) n.__mxR = mxRect(n); }); });
  });
}).observe(document.body, { childList: true }); }catch(e){} }
if(document.body) mxWatch(); else document.addEventListener("DOMContentLoaded", mxWatch);

/* ---------- expand / collapse and tabs: noted on the click, played once the page has redrawn ---------- */
function mxBox(t){
  return t.closest(".rod-g, .rp-ops, .rq-peek, .mq-card, .lib-list, .tg-scroll, .px-pg, .rop-blk, .rop-fold, .rop-rail, section, .tg-list, .tg-main, .px-props") || t.parentNode;
}
document.addEventListener("click", function(e){
  if(!mxOn()) return;
  var path = e.composedPath ? e.composedPath() : [e.target], t = path[0]; if(!t || !t.closest) return;
  var tab = t.closest(MX_TAB);
  if(tab){ var list = tab.closest("[role=tablist], .tg-views, .lib-tabs, .dp-tabs, .rq-seg, .fl-tabs, .px-tabs, .pxr-nav") || tab.parentNode; MX.tab = { list: list, cls: (typeof list.className === "string" ? list.className : "").trim().split(/\s+/)[0] || "", root: tab.getRootNode ? tab.getRootNode() : document, nav: tab.getAttribute("data-action") === "nav", at: Date.now() }; requestAnimationFrame(function(){ requestAnimationFrame(mxSettle); }); return; }
  var f = t.closest(MX_FOLD);
  if(f && !t.closest("input, select, textarea")){ var box = mxBox(f); if(box && box.getBoundingClientRect){ MX.fold = { box: box, h: box.getBoundingClientRect().height, had: new Set(box.querySelectorAll(MX_NEW)), at: Date.now() }; requestAnimationFrame(function(){ requestAnimationFrame(mxSettle); }); } }
}, true);
function mxSettle(){
  var F = MX.fold, T = MX.tab;
  if(F && Date.now() - F.at < 900){
    MX.fold = null;
    var box = F.box;
    if(box && box.isConnected && box.animate){
      var h = box.getBoundingClientRect().height, cs = getComputedStyle(box);
      var scrolls = /(auto|scroll)/.test(cs.overflowY) && box.scrollHeight > box.clientHeight + 1;
      if(Math.abs(h - F.h) > 2 && !scrolls && cs.display !== "contents"){
        try{ box.animate([{ height: F.h + "px", overflow: "hidden" }, { height: h + "px", overflow: "hidden" }], { duration: Math.min(260, 140 + Math.abs(h - F.h) / 6), easing: mxEase() }); }catch(e){}
      }
      /* what just appeared slides in */
      if(h > F.h + 2) mxNew(box, F.had);
    }
  }
  if(T && Date.now() - T.at < 900){
    MX.tab = null;
    var root = T.root && T.root.querySelector ? T.root : document, body = null, list = T.list;
    if(list && !list.isConnected && T.cls && root.querySelector) list = root.querySelector("." + CSS.escape(T.cls));   /* a page drawn fresh (the RO page): its new tab row */
    if(T.nav) body = document.querySelector("#app .main");
    else if(list && list.isConnected){
      var pg = list.closest("[data-pg]");
      var nx = list.nextElementSibling; if(nx && nx.matches(".rop-tacts, .rop-tabacts, [class*='tools']")) nx = null;   /* a row of buttons beside the tabs isn't what they show */
      body = (pg && pg.querySelector(":scope .tg-body, :scope .lib-list, :scope #lib-list")) || nx || (list.parentNode && list.parentNode.nextElementSibling);
    }   /* never the whole page: only what the tab shows moves */
    if(body && body.animate) try{ body.animate([{ opacity: .85, transform: "translateY(3px)" }, { opacity: 1, transform: "none" }], { duration: 200, easing: mxEase() }); }catch(e){}
  }
}
/* the rows a fold opened: a short slide in, one after another */
var MX_NEW = ".rod-rows, .rp-opl, .rp-op, .px-pg__b, .lib-ftbs, .tg-it, .rq-row, .lib-row, .mq-tr, .mq-hr, .rod-r";
function mxNew(box, had){
  var L = box.querySelectorAll(MX_NEW), n = 0;
  Array.prototype.forEach.call(L, function(el){
    if(had && had.has(el)) return;
    if(el.parentNode && el.parentNode.closest && el.parentNode.closest(".rod-rows, .rp-opl") && (!had || !had.has(el.parentNode.closest(".rod-rows, .rp-opl")))) return;   /* its block slides in as one */
    if(n > 14 || !el.animate) return;
    try{ el.animate([{ opacity: 0, transform: "translateY(-4px)" }, { opacity: 1, transform: "none" }], { duration: 200, delay: Math.min(n, 8) * 14, easing: mxEase(), fill: "backwards" }); }catch(e){}
    n++;
  });
}
