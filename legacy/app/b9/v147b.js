/* ===== Parsec 14.7 (B) — the truck picture's ⋯ menu stays on screen =====
   It used to sit inside the truck card (position: absolute, right: 14px, 300 px wide), so in the RO page's right rail (324 px,
   scrolling) its left side was cut off — and in a narrower pane even more. Now it is lifted out of the card to the page's top
   level and placed next to its button like the other menus: right edges lined up, inside the window with 8 px to spare,
   above the button when there's no room below, scrolling when it's taller than the window. It closes when the page scrolls. */
function v147Fit(pop, anchor, o){
  o = o || {}; var r = anchor.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
  var s = pop.style; s.position = "fixed"; s.right = "auto"; s.bottom = "auto"; s.margin = "0"; s.maxHeight = ""; s.overflowY = ""; s.zIndex = "70";
  if(pop.offsetWidth > vw - 16) s.width = (vw - 16) + "px";
  var w = pop.offsetWidth, h = pop.offsetHeight;
  if(h > vh - 16){ s.maxHeight = (vh - 16) + "px"; s.overflowY = "auto"; h = vh - 16; }
  var left = o.alignRight ? r.right - w : r.left;
  if(o.alignRight && left < 8) left = r.left; else if(!o.alignRight && left + w > vw - 8) left = r.right - w;
  left = Math.max(8, Math.min(left, vw - w - 8));
  var top = r.bottom + 6; if(top + h > vh - 8) top = r.top - h - 6 >= 8 ? r.top - h - 6 : Math.max(8, vh - 8 - h);
  s.left = left + "px"; s.top = top + "px";
  /* a transformed or contained parent makes "fixed" mean that parent, not the window — measure and correct */
  var q = pop.getBoundingClientRect(); if(Math.abs(q.left - left) > 0.5 || Math.abs(q.top - top) > 0.5){ s.left = (2 * left - q.left) + "px"; s.top = (2 * top - q.top) + "px"; }
}
(function(o){
  trkMenu = function(band, anchor, ro, P){
    var root = band.getRootNode ? band.getRootNode() : document, top = root && root.host ? root : document.body;
    var old = top.querySelector ? top.querySelector(".px-trk__menu.is-lifted") : null;
    if(old){ var was = old.__anchor; old.remove(); band.classList.remove("has-menu"); if(was === anchor) return; }
    o.apply(this, arguments);
    var m = band.querySelector(".px-trk__menu"); if(!m) return;
    m.classList.add("is-lifted"); m.__anchor = anchor; top.appendChild(m);
    if(root && root.host && root.host.getAttribute && root.host.getAttribute("data-device") === "phone") m.style.width = Math.max(220, window.innerWidth - 24) + "px";
    v147Fit(m, anchor, { alignRight: true });
    var first = m.querySelector("button"); if(first) try{ first.focus({ preventScroll: true }); }catch(e){}
    var off = function(e){ if(e && e.target && m.contains && m.contains(e.target)) return; if(m.isConnected){ m.remove(); band.classList.remove("has-menu"); } window.removeEventListener("scroll", off, true); window.removeEventListener("resize", off); if(root && root.removeEventListener) root.removeEventListener("scroll", off, true); };
    setTimeout(function(){ window.addEventListener("scroll", off, true); window.addEventListener("resize", off); if(root && root.host) root.addEventListener("scroll", off, true); }, 0);
  };
})(trkMenu);
