/* ===== Parsec 14.9 (A) — one tooltip for the whole app (the pages and the RO page's shadow root) =====
   The user's picks: Ink (dark on light, light on dark) with an arrow · after 400 ms, then at once between neighbours ·
   cut-off text shows in full · Tab focus shows them too · touch: press and hold, and an ⓘ on the few that matter ·
   Tooltips: All · Fewer · Off on the person menu.
   · It takes over the browser's grey title box: while a control is hovered (or focused) its title is stashed in data-ptt so
     the browser draws nothing, and put back on leave. While stashed, getAttribute / hasAttribute / setAttribute /
     removeAttribute('title') and el.title read and write the stash, so code (and tests) that use title see no difference.
   · data-tip="Title|detail|detail" is preferred over title; "~note" and "label::value" lines are the old rich rows (Manager KPIs,
     the Time Log). data-tip-k="Ctrl P" gives keys; data-tip-keep shows it in Fewer too.
   · Words: tipNorm(raw, ctx) (Parsec 14.9 B) when it's there — ctx { icon, disabled, label }; key chips only on icon buttons.
   · The old tips (#pg-tip, the Warranty chart's .wa-tip) stand down; the CSS-only ones (.dr-tip, .dbs-tip) take the Ink look. */
var PTIP_MODES = [["all", "All"], ["fewer", "Fewer"], ["off", "Off"]];
function ptipWho(){ try{ var sf = typeof viewAsStaff === "function" ? viewAsStaff() : null; return sf && sf.id ? String(sf.id) : "admin"; }catch(e){ return "admin"; } }
function ptipMode(){ var v = null; try{ v = localStorage.getItem("ptip_mode:" + ptipWho()); }catch(e){} return v === "fewer" || v === "off" ? v : "all"; }
function ptipSetMode(v){
  v = v === "fewer" || v === "off" ? v : "all";
  try{ localStorage.setItem("ptip_mode:" + ptipWho(), v); }catch(e){}
  PTIP.sync(); PTIP.hide();
  return v;
}
function ptipMenuRow(){ return '<div class="pxp-set ptip-set"><span>Tooltips</span>' + pxSeg(PTIP_MODES, ptipMode(), "ptip-mode", "data-ptm") + '</div>'; }
var PTIP = (function(){
  var EP = Element.prototype, GA = EP.getAttribute, SA = EP.setAttribute, HA = EP.hasAttribute, RA = EP.removeAttribute;
  var TD = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "title");
  var S = { t: null, kind: "tip", via: "mouse", shown: false, timer: 0, lastHide: 0, x: -1, y: -1, pe: null, raf: 0, sup: null, supXY: null,
            pin: false, lp: 0, lpT: 0, lpXY: null, dirty: false, aria: null, el: null };
  /* ---- the title stash, and the reads and writes that go through it ---- */
  EP.getAttribute = function(n){ if(n === "title" && HA.call(this, "data-ptt")) return GA.call(this, "data-ptt"); return GA.apply(this, arguments); };
  EP.hasAttribute = function(n){ if(n === "title" && HA.call(this, "data-ptt")) return true; return HA.apply(this, arguments); };
  EP.setAttribute = function(n, v){ if(n === "title" && HA.call(this, "data-ptt")){ SA.call(this, "data-ptt", String(v)); if(S.t === this) S.dirty = true; return; } return SA.apply(this, arguments); };
  EP.removeAttribute = function(n){ if(n === "title" && HA.call(this, "data-ptt")){ RA.call(this, "data-ptt"); if(S.t === this) S.dirty = true; return; } return RA.apply(this, arguments); };
  if(TD && TD.get && TD.set) Object.defineProperty(HTMLElement.prototype, "title", { configurable: true, enumerable: TD.enumerable,
    get: function(){ return HA.call(this, "data-ptt") ? GA.call(this, "data-ptt") : TD.get.call(this); },
    set: function(v){ if(HA.call(this, "data-ptt")){ SA.call(this, "data-ptt", String(v)); if(S.t === this) S.dirty = true; return; } TD.set.call(this, v); } });
  function stash(el){ if(!el || el.nodeType !== 1) return; if(HA.call(el, "title")){ var v = GA.call(el, "title"); RA.call(el, "title"); if(v) SA.call(el, "data-ptt", v); } }
  function unstash(el){ if(!el || el.nodeType !== 1 || !HA.call(el, "data-ptt")) return; var v = GA.call(el, "data-ptt"); RA.call(el, "data-ptt"); if(!HA.call(el, "title")) SA.call(el, "title", v); }
  /* ---- finding what's under the pointer, through shadow roots ---- */
  function up(e){ return e.parentElement || (e.getRootNode && e.getRootNode().host) || null; }
  function deepAt(x, y){ var el = document.elementFromPoint(x, y), n = 0; while(el && el.shadowRoot && n++ < 6){ var i = el.shadowRoot.elementFromPoint(x, y); if(!i || i === el) break; el = i; } return el; }
  function mine(e){ return e && e.closest && (e.closest("#ptip")); }
  function rawOf(e){ return GA.call(e, "data-tip") || GA.call(e, "data-ptt") || GA.call(e, "title") || ""; }
  function findT(el, depth){
    for(var e = el, i = 0; e && i < (depth || 14); e = up(e), i++){
      if(e.nodeType !== 1) continue;
      if(e === document.body || e === document.documentElement) return null;
      if(e.id === "ptip" || HA.call(e, "data-notip")) return null;
      if(rawOf(e).trim()) return e;
    }
    return null;
  }
  /* cut-off text: an ellipsis (or a clamped block) that really is cut */
  function findCut(el){
    for(var e = el, i = 0; e && i < 4; e = up(e), i++){
      if(e.nodeType !== 1 || e === document.body) return null;
      if(/^(INPUT|TEXTAREA|SELECT|svg|path)$/i.test(e.tagName)) return null;
      var w = e.clientWidth, h = e.clientHeight; if(!w) continue;
      var sw = e.scrollWidth > w + 1, sh = e.scrollHeight > h + 2; if(!sw && !sh) continue;
      var cs = getComputedStyle(e);
      if((sw && cs.textOverflow === "ellipsis") || (sh && cs.webkitLineClamp && cs.webkitLineClamp !== "none")){
        var t = (e.innerText || e.textContent || "").replace(/\s+/g, " ").trim(); if(t && t.length <= 400) return e;
      }
    }
    return null;
  }
  /* ---- words ---- */
  function esc(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function labelOf(e){ var t = ""; try{ t = e instanceof HTMLElement ? e.innerText : ""; }catch(x){} return String(t || "").replace(/\s+/g, " ").trim(); }
  function split(raw){ var p = String(raw).split("|"); return { t: p[0].trim(), d: p.slice(1).map(function(x){ return x.trim(); }).filter(Boolean), k: [] }; }
  function build(t, kind){
    var mode = ptipMode(); if(mode === "off") return null;
    if(kind === "cut") return { t: (t.innerText || t.textContent || "").replace(/\s+/g, " ").trim(), d: [], k: [], cut: 1 };
    var raw = rawOf(t); if(!raw.trim()) return null;
    var label = labelOf(t), ctx = { icon: !label, disabled: !!(t.disabled || GA.call(t, "aria-disabled") === "true"), label: label };
    var rich = /::|\|~/.test(raw) || HA.call(t, "data-tip-raw"), o = null;
    if(!rich && typeof tipNorm === "function"){ try{ o = tipNorm(raw, ctx); }catch(e){ o = split(raw); } if(!o) return null; }
    else o = split(raw);
    o = { t: String(o.t || "").trim(), d: (o.d || []).filter(function(x){ return x != null && String(x).trim(); }), k: (o.k || []).slice() };
    if(!o.t) return null;
    var kk = GA.call(t, "data-tip-k"); if(kk) o.k = kk.split(/\s+/).filter(Boolean);
    if(!ctx.icon) o.k = [];   /* key chips on icon buttons only */
    if(typeof tipNorm !== "function" && !rich && !o.d.length && label && o.t.toLowerCase() === label.toLowerCase()) return null;   /* don't repeat the label */
    if(mode === "fewer" && !(ctx.disabled || HA.call(t, "data-tip-keep") || (ctx.icon && o.k.length))) return null;
    return o;
  }
  function line(x){
    x = String(x);
    if(x.charAt(0) === "~") return '<small class="nt">' + esc(x.slice(1)) + "</small>";
    if(x.indexOf("::") > 0){ var q = x.split("::"), cl = /before/.test(q[0]) ? "pv" : /Unapplied/.test(q[0]) ? "un" : /Target|Goal|clock/.test(q[0]) ? "gl" : "";
      return '<span class="ptip-rw"><i class="' + cl + '"></i>' + esc(q[0]) + "<b>" + esc(q[1]) + "</b></span>"; }
    return "<small>" + esc(x) + "</small>";
  }
  function html(o){
    return '<div class="ptip-t"><b>' + esc(o.t) + "</b>" + (o.k.length ? '<span class="ptip-k">' + o.k.map(function(k){ return "<kbd>" + esc(k) + "</kbd>"; }).join("") + "</span>" : "") + "</div>"
      + o.d.map(line).join("") + '<i class="ptip-ar"></i>';
  }
  /* ---- drawing and placing ---- */
  function tipEl(){ if(S.el && S.el.isConnected) return S.el; var d = document.createElement("div"); d.id = "ptip"; d.setAttribute("role", "tooltip"); d.className = "ptip"; document.body.appendChild(d); return (S.el = d); }
  function zf(){ return typeof ZF === "function" ? ZF() : 1; }
  function place(){
    var t = S.t, d = S.el; if(!t || !d) return;
    var z = zf(), r0 = t.getBoundingClientRect(), r = { l: r0.left / z, r: r0.right / z, t: r0.top / z, b: r0.bottom / z, w: r0.width / z, h: r0.height / z };
    var vw = window.innerWidth / z, vh = window.innerHeight / z, w = d.offsetWidth, h = d.offsetHeight, g = 8;
    var cx = r.l + r.w / 2;
    if(S.via === "mouse" && r.w > 240 && S.x >= 0) cx = Math.max(r.l + 12, Math.min(r.r - 12, S.x / z));   /* a long block: the arrow sits where the pointer is */
    var top, upw = false;
    if(r.b + g + h <= vh - 8) top = r.b + g;
    else if(r.t - g - h >= 8){ top = r.t - g - h; upw = true; }
    else if(vh - r.b > r.t){ top = Math.max(8, vh - 8 - h); } else { top = 8; upw = true; }
    /* never under the pointer: a tall control puts it beside the pointer's line instead */
    if(S.via === "mouse" && S.y >= 0){ var py = S.y / z, px = S.x / z;
      if(py >= top - 2 && py <= top + h + 2 && px >= cx - w / 2 - 2 && px <= cx + w / 2 + 2){ if(py + 18 + h <= vh - 8){ top = py + 18; upw = false; } else { top = Math.max(8, py - 18 - h); upw = true; } } }
    var left = Math.max(8, Math.min(cx - w / 2, vw - w - 8));
    d.classList.toggle("up", upw);
    d.style.left = Math.round(left) + "px"; d.style.top = Math.round(top) + "px";
    d.style.setProperty("--ax", Math.round(Math.max(12, Math.min(w - 12, cx - left))) + "px");
  }
  function show(){
    S.timer = 0; var t = S.t; if(!t || !t.isConnected){ return; }
    var o = build(t, S.kind); if(!o){ return; }
    var d = tipEl(); d.innerHTML = html(o); d.classList.toggle("cut", !!o.cut); d.classList.remove("on"); d.style.left = "0px"; d.style.top = "0px";
    place(); void d.offsetWidth; d.classList.add("on"); S.shown = true; S.dirty = false; S.rc = t.getBoundingClientRect();
    if(!HA.call(t, "aria-describedby")){ SA.call(t, "aria-describedby", "ptip"); S.aria = t; }
  }
  function hideEl(){ if(S.el){ S.el.classList.remove("on"); } }
  function leave(){
    if(S.timer){ clearTimeout(S.timer); S.timer = 0; }
    if(S.t){ unstash(S.t); if(S.aria === S.t){ RA.call(S.t, "aria-describedby"); S.aria = null; } }
    if(S.shown){ S.lastHide = Date.now(); hideEl(); }
    S.t = null; S.shown = false; S.pin = false;
  }
  function enter(t, kind, via){
    S.t = t; S.kind = kind; S.via = via; stash(t);
    if(ptipMode() === "off") return;
    var d = via === "touch" || via === "info" ? 0 : (Date.now() - S.lastHide < 300 ? 0 : 400);
    if(d) S.timer = setTimeout(show, d); else show();
  }
  function resolve(){
    S.raf = 0; if(S.pin) return;
    var el = S.pe && S.pe.isConnected ? S.pe : (S.x >= 0 ? deepAt(S.x, S.y) : null);
    if(!el || mine(el)){ if(S.t) leave(); return; }
    var t = findT(el), kind = "tip"; if(!t){ t = findCut(el); kind = "cut"; }
    if(S.supXY){ if(Math.abs(S.x - S.supXY.x) + Math.abs(S.y - S.supXY.y) < 8){ if(S.t && S.t !== t) leave(); return; } S.supXY = null; }
    if(t && t === S.t){ if(HA.call(t, "title")) stash(t); if(S.dirty){ if(rawOf(t).trim() || kind === "cut"){ if(S.shown) show(); } else leave(); } return; }
    if(S.t) leave();
    if(!t) return;
    if(t === S.sup) return; S.sup = null;
    enter(t, kind, "mouse");
  }
  function ask(){ if(!S.raf) S.raf = requestAnimationFrame(resolve); }
  document.addEventListener("pointermove", function(e){
    if(e.pointerType === "touch") return;
    S.x = e.clientX; S.y = e.clientY; S.pe = e.composedPath ? e.composedPath()[0] : e.target; ask();
  }, { capture: true, passive: true });
  window.addEventListener("mouseout", function(e){ if(!e.relatedTarget && !S.pin){ S.pe = null; S.x = -1; leave(); } });
  /* a click hides it, and it stays hidden until the pointer moves on */
  document.addEventListener("pointerdown", function(e){
    var p = e.composedPath ? e.composedPath()[0] : e.target;
    if(e.pointerType === "touch"){ touchDown(e, p); return; }
    if(S.t || S.timer){ S.sup = S.t; S.supXY = { x: e.clientX, y: e.clientY }; leave(); }
  }, true);
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && (S.t || S.shown)){ S.sup = S.t; leave(); } }, true);
  /* a scroll that moves the control hides it (a redraw that only puts the scroll back doesn't) */
  document.addEventListener("scroll", function(){ if(!S.t) return; if(!S.shown){ leave(); return; } var r = S.t.getBoundingClientRect(), a = S.rc;
    if(!a || Math.abs(r.left - a.left) + Math.abs(r.top - a.top) > 2) leave(); }, true);
  document.addEventListener("wheel", function(){ if(S.shown && S.via === "mouse") leave(); }, { capture: true, passive: true });
  window.addEventListener("blur", function(){ leave(); });
  document.addEventListener("visibilitychange", function(){ if(document.hidden) leave(); });
  /* the control under a shown tip was redrawn: find it again where the pointer is */
  setInterval(function(){ if(S.t && !S.t.isConnected){ var v = S.via; leave(); if(v === "mouse" && S.x >= 0){ S.pe = null; ask(); } } }, 400);
  /* ---- the keyboard: Tab to a control, its tip shows ---- */
  document.addEventListener("focusin", function(e){
    var el = e.composedPath ? e.composedPath()[0] : e.target; if(!el || el.nodeType !== 1 || mine(el)) return;
    var fv = false; try{ fv = el.matches(":focus-visible"); }catch(x){} if(!fv) return;
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !HA.call(el, "data-tip")) return;
    var t = findT(el, 3), kind = "tip"; if(!t){ t = findCut(el); kind = "cut"; } if(!t) return;
    if(t === S.t) return; leave(); enter(t, kind, "focus");
  }, true);
  document.addEventListener("focusout", function(){ if(S.via === "focus") leave(); }, true);
  /* ---- touch: press and hold; the ⓘ ---- */
  function touchDown(e, p){
    S.lpClick = false;   /* a new touch: the hold before it is done with */
    if(p && p.closest && p.closest(".ptip-i")) return;
    if(S.pin || S.shown) leave();
    clearTimeout(S.lpT); S.lpXY = { x: e.clientX, y: e.clientY, p: p };
    S.lpT = setTimeout(function(){
      var el = S.lpXY && S.lpXY.p && S.lpXY.p.isConnected ? S.lpXY.p : deepAt(S.lpXY.x, S.lpXY.y); if(!el) return;
      var t = findT(el), kind = "tip"; if(!t){ t = findCut(el); kind = "cut"; } if(!t) return;
      S.lp = Date.now(); S.lpClick = true; leave(); S.x = S.lpXY.x; S.y = S.lpXY.y; enter(t, kind, "touch"); S.pin = true;
    }, 500);
  }
  document.addEventListener("pointermove", function(e){ if(e.pointerType === "touch" && S.lpXY && Math.abs(e.clientX - S.lpXY.x) + Math.abs(e.clientY - S.lpXY.y) > 10){ clearTimeout(S.lpT); S.lpXY = null; } }, { capture: true, passive: true });
  document.addEventListener("pointerup", function(e){ if(e.pointerType === "touch"){ clearTimeout(S.lpT); S.lpXY = null; } }, true);
  document.addEventListener("pointercancel", function(){ clearTimeout(S.lpT); S.lpXY = null; }, true);
  document.addEventListener("contextmenu", function(e){ if(Date.now() - S.lp < 900){ e.preventDefault(); e.stopPropagation(); } }, true);
  window.addEventListener("click", function(e){
    if(S.lpClick){ S.lpClick = false; if(Date.now() - S.lp < 1500){ e.preventDefault(); e.stopPropagation(); return; } }   /* the press-and-hold isn't a tap */
    var p = e.composedPath ? e.composedPath()[0] : e.target;
    var i = p && p.closest ? p.closest(".ptip-i") : null;
    if(i){ e.preventDefault(); e.stopPropagation(); infoTap(i); return; }
    var m = p && p.closest ? p.closest("[data-ptm]") : null;
    if(m){ e.preventDefault(); e.stopPropagation(); var v = ptipSetMode(GA.call(m, "data-ptm"));
      var seg = m.parentElement; if(seg) seg.querySelectorAll("[data-ptm]").forEach(function(b){ var on = GA.call(b, "data-ptm") === v; b.classList.toggle("on", on); SA.call(b, "aria-pressed", on ? "true" : "false"); });
      if(typeof pushToast === "function") pushToast("Tooltips: " + ({ all: "All", fewer: "Fewer — keys on icon buttons, why a button is off, cut-off text", off: "Off" })[v] + "."); }
  }, true);
  /* the ⓘ: a few places where the words matter, on a touch screen */
  var INFO = {
    "Quoted": "Quoted|The hours this operation pays", "Burnt": "Burnt|Hours clocked on this operation", "Over": "Over|Burnt past the quote",
    "Left": "Left|Quoted hours not used yet", "Remaining": "Remaining|Quoted hours not used yet",
    "Efficiency": "Efficiency|Quoted hours ÷ hours on the job · 100% is right on the quote", "Clocked": "Clocked|Time on the day clock, lunch off",
    "On jobs": "On jobs|Time punched on repair orders", "Air": "Air|On the clock, not on a job — it shows where the time went, it doesn't count against you",
    "Shop": "Shop|Shop time — cleaning, training, maintenance", "Lunch": "Lunch|Off the clock for lunch", "Hours sold": "Hours sold|Quoted hours on finished operations"
  };
  var IPL = [   /* [where, selector, how the ⓘ goes in] */
    ["doc", ".tk-stats .tk-stat > small", "in"],          /* the Time Log's day numbers */
    ["doc", ".cq-stats > span > small", "in"],            /* the Technician page's day numbers */
    ["jc", ".ock-k > small", "in"],                       /* the RO page clock card: Quoted · Burnt · Over / Left · Efficiency */
    ["jc", ".rop-byb", "after"],                          /* the truck card's Release without checks */
    ["jc", ".px-trk .pgst", "after"]                      /* the RO status on the truck card */
  ];
  function coarse(){ try{ return matchMedia("(pointer: coarse)").matches; }catch(e){ return false; } }
  function infoTip(owner){ var lb = (owner.childNodes.length ? Array.prototype.map.call(owner.childNodes, function(n){ return n.nodeType === 3 ? n.textContent : (n.classList && n.classList.contains("ptip-i") ? "" : n.textContent); }).join("") : owner.textContent).replace(/\s+/g, " ").trim();
    return INFO[lb] || rawOf(owner) || lb; }
  function decorate(){
    if(!coarse() || ptipMode() === "off"){ return; }
    var roots = [document]; document.querySelectorAll(".jc-host").forEach(function(h){ if(h.shadowRoot) roots.push(h.shadowRoot); });
    IPL.forEach(function(p){ roots.forEach(function(R, ri){ if((p[0] === "jc") !== (ri > 0)) return;
      R.querySelectorAll(p[1]).forEach(function(o){
        if(p[2] === "in" ? o.querySelector(".ptip-i") : (o.nextElementSibling && o.nextElementSibling.classList.contains("ptip-i"))) return;
        var b = document.createElement("span"); b.className = "ptip-i"; SA.call(b, "role", "button"); SA.call(b, "tabindex", "0"); SA.call(b, "aria-label", "What this means"); SA.call(b, "data-tip-keep", ""); b.textContent = "i";
        b._own = o; if(p[2] === "in") o.appendChild(b); else o.insertAdjacentElement("afterend", b);
      }); }); });
  }
  function infoTap(i){
    if(S.t === i && S.shown){ leave(); return; }
    leave(); var o = i._own || i.previousElementSibling || i.parentElement; SA.call(i, "data-tip", infoTip(o)); enter(i, "tip", "info"); S.pin = true;
  }
  var dq = 0; function soon(){ if(dq) return; dq = setTimeout(function(){ dq = 0; try{ decorate(); }catch(e){} }, 250); }
  function watch(){
    if(!coarse()) return;
    var mo = new MutationObserver(function(){ soon(); watchHosts(); });
    mo.observe(document.body, { childList: true, subtree: true }); watchHosts(); soon();
  }
  var seenHosts = typeof WeakSet === "function" ? new WeakSet() : null;
  function watchHosts(){ document.querySelectorAll(".jc-host").forEach(function(h){ if(!h.shadowRoot || !seenHosts || seenHosts.has(h)) return; seenHosts.add(h); new MutationObserver(soon).observe(h.shadowRoot, { childList: true, subtree: true }); }); }
  function sync(){ document.documentElement.setAttribute("data-ptip", ptipMode()); if(ptipMode() === "off") leave(); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ sync(); watch(); }); else setTimeout(function(){ sync(); watch(); }, 0);
  return { hide: leave, sync: sync, mode: ptipMode, decorate: decorate, state: function(){ return { target: S.t ? (S.t.id || S.t.className || S.t.tagName) : null, shown: S.shown, via: S.via, kind: S.kind }; } };
})();
