/* ===== Parsec 16.3 (A) — the RO everywhere, on the pages (the RO page itself is 16.3 B) =====
   The user's picks: every RO number opens its RO · plain, a small ↗ when you point at it · the RO's picture on every page
   that shows an RO · a ⋯ on the RO cards with all the shop functions · point at the customer to see the contact.
   · How: the page's new markup is decorated before it's put on screen (patchApp → rl163Deco on the parsed copy, so the
     morph sees the same markup every time and nothing flickers); a MutationObserver decorates what a page draws on its own.
   · An RO number is any .tg-no / .rq-no / Time Log .no (and a few named spots) that starts with digits matching an RO —
     found from the row's data-ro / data-id / data-no first, then the full number, then a short number only one RO has.
     Never inside a button, a link, a form field or a pop-over's header; never on the RO page (its own shadow root).
   · roLnk(roOrId, text) gives the same link for code that writes one directly. Fork B's peek card listens for
     hover on .ro-lnk[data-rolnk]; Fork C's v163ShopOk(ro, act) can turn a shop function off for the RO's department. */
var RL163 = { ix: null, ixAt: 0, menu: null, mo: null, busy: 0 };
var RL163_CAND = ".tg-no, .rq-no, span.no, .mq-nd p > b, .tx > small";
var RL163_SKIP = "button, a, label, select, option, textarea, input, [contenteditable], .ro-lnk, [data-norl], .tg-ph, .rl-menu, .pal, .tk-b";
var RL163_ATTRS = ["data-ro", "data-id", "data-no", "data-roid", "data-ro-id"];
function rl163Ix(){
  var L = (typeof STATE !== "undefined" && STATE && STATE.ros) || [], now = Date.now(), ix = RL163.ix;
  if(ix && ix.L === L && ix.n === L.length && now - RL163.ixAt < 1500) return ix;
  ix = { L: L, n: L.length, id: {}, full: {}, short: {} };
  L.forEach(function(r){
    if(!r || !r.id || r.shop || r.id === SHOP_RO_ID) return;
    ix.id[r.id] = r;
    var no = String(r.roNumber || "").trim(); if(!no) return;
    var d = no.replace(/\D/g, ""); if(d) ix.full[d] = ix.full[d] && ix.full[d] !== r ? "x" : r;
    var sh = roShortNo(no); (ix.short[sh] = ix.short[sh] || []).push(r);
  });
  RL163.ix = ix; RL163.ixAt = now; return ix;
}
/* the link, for code that writes one */
function roLnk(x, text){
  var ix = rl163Ix(), ro = x && typeof x === "object" ? x : ix.id[x];
  var t = text == null ? (ro ? tgNum(ro) : String(x == null ? "" : x)) : String(text);
  if(!ro || !ix.id[ro.id]) return esc(t);
  return '<span class="ro-lnk" data-rolnk="' + esc(ro.id) + '" role="link" tabindex="0">' + esc(t) + '</span>';
}
function rl163Fits(ro, d){
  var no = String(ro.roNumber || ""), all = no.replace(/\D/g, "");
  return all === d || roShortNo(no) === d || (d.length >= 4 && all.slice(-d.length) === d);
}
/* which RO a number in el is, or null */
function rl163Res(el, d){
  var ix = rl163Ix(), a = el, hops = 0, i, v, r;
  while(a && a.nodeType === 1 && hops < 8){
    for(i = 0; i < RL163_ATTRS.length; i++){ v = a.getAttribute(RL163_ATTRS[i]); if(v && (r = ix.id[v]) && rl163Fits(r, d)) return r; }
    a = a.parentElement; hops++;
  }
  if(d.length > 4 && ix.full[d] && ix.full[d] !== "x") return ix.full[d];
  var c = ix.short[d]; if(c && c.length === 1) return c[0];
  return null;
}
function rl163Link(el){
  if(el.getAttribute("data-rl")) return;
  if(el.closest(RL163_SKIP) || el.querySelector(".ro-lnk")){ el.setAttribute("data-rl", "0"); return; }
  var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, m = null;
  while((n = w.nextNode())){ if(!/\S/.test(n.nodeValue)) continue; m = /^(\s*)((?:RO[\s#-]*)?(\d{3,}))/i.exec(n.nodeValue); break; }
  if(!m){ el.setAttribute("data-rl", "0"); return; }
  var ro = rl163Res(el, m[3]);
  if(!ro){ el.setAttribute("data-rl", "0"); return; }
  var s = document.createElement("span"); s.className = "ro-lnk"; s.setAttribute("data-rolnk", ro.id); s.setAttribute("role", "link"); s.setAttribute("tabindex", "0");
  s.textContent = m[2];
  var rest = n.nodeValue.slice(m[1].length + m[2].length), p = n.parentNode;
  if(m[1]) p.insertBefore(document.createTextNode(m[1]), n);
  p.insertBefore(s, n);
  if(rest) n.nodeValue = rest; else p.removeChild(n);
  el.setAttribute("data-rl", "1");
}
/* the RO's picture where a row shows an RO and no picture: the row's icon becomes a small badge on it */
function rl163Pic(row){
  if(row.getAttribute("data-rlp")) return; row.setAttribute("data-rlp", "1");
  if(row.closest(".tg-pop, .pal, .rl-menu")) return;
  if(row.querySelector(".trk-th, .tg-hpic, .fm-ti, .tch-pic, .tg-tv, .pal-trk")) return;
  var gi = null; for(var i = 0; i < row.children.length; i++){ if(row.children[i].classList.contains("tg-gi")){ gi = row.children[i]; break; } }
  if(!gi || gi.classList.contains("trk")) return;
  var l = row.querySelector(".ro-lnk[data-rolnk]"), ro = l && rl163Ix().id[l.getAttribute("data-rolnk")]; if(!ro) return;
  var th = ""; try{ th = trkThumb(ro); }catch(e){ return; } if(!th) return;
  var had = gi.innerHTML.trim(), b = null;
  if(had){ b = document.createElement("i"); b.className = "rl-gib" + (gi.classList.contains("now") ? " now" : ""); b.innerHTML = had; }
  gi.classList.add("trk", "rl-gi"); gi.innerHTML = th; if(b) gi.appendChild(b);
}
/* the Manager's Needs-you cards: the RO's picture in the corner */
function rl163MqPic(card){
  if(card.getAttribute("data-rlp")) return; card.setAttribute("data-rlp", "1");
  var l = card.querySelector(".ro-lnk[data-rolnk]"), ro = l && rl163Ix().id[l.getAttribute("data-rolnk")]; if(!ro) return;
  var th = ""; try{ th = trkThumb(ro); }catch(e){ return; } if(!th) return;
  var s = document.createElement("span"); s.className = "rl-mqp"; s.innerHTML = th; card.insertBefore(s, card.firstChild); card.classList.add("rl-mq");
}
/* point at the customer: the contact */
function rl163ContactLine(ro){ return [String(ro.contactName || "").trim(), String(ro.contactPhone || "").trim()].filter(Boolean).join(" · "); }
function rl163Cust(row){
  if(row.getAttribute("data-rlc")) return; row.setAttribute("data-rlc", "1");
  var l = row.querySelector(".ro-lnk[data-rolnk]"), ro = l && rl163Ix().id[l.getAttribute("data-rolnk")]; if(!ro) return;
  var cl = rl163ContactLine(ro), cu = String(ro.customerName || "").trim(); if(!cl || !cu) return;
  var w = document.createTreeWalker(row, NodeFilter.SHOW_TEXT), n;
  while((n = w.nextNode())){
    var t = n.nodeValue, k = t.indexOf(cu); if(k < 0 || n.parentNode.closest(".ro-lnk, button, .rl-more")) continue;
    var p = n.parentNode, el;
    if(!t.slice(0, k).trim() && !t.slice(k + cu.length).trim() && p.childNodes.length === 1) el = p;
    else { el = document.createElement("span"); el.className = "rl-cu"; el.textContent = cu;
      var before = t.slice(0, k), after = t.slice(k + cu.length);
      if(before) p.insertBefore(document.createTextNode(before), n); p.insertBefore(el, n); if(after) n.nodeValue = after; else p.removeChild(n); }
    el.setAttribute("data-tip", cl); el.classList.add("rl-hascu");
    return;
  }
}
/* the ⋯ on the RO cards (Technician, Foreman, Parts) */
var RL163_DOTS = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><circle cx="3.5" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="12.5" cy="8" r="1.4"/></svg>';
function rl163More(row){
  if(row.getAttribute("data-rlm")) return; row.setAttribute("data-rlm", "1");
  var ix = rl163Ix(), ro = ix.id[row.getAttribute("data-ro")] || ix.id[row.getAttribute("data-id")]; if(!ro || ro.dateClosed) return;
  var b = document.createElement("button"); b.type = "button"; b.className = "rl-more"; b.setAttribute("data-rlmore", ro.id);
  b.setAttribute("aria-label", "Shop functions for " + tgNum(ro)); b.setAttribute("aria-haspopup", "menu"); b.setAttribute("data-tip", "Shop functions");
  b.innerHTML = RL163_DOTS; row.appendChild(b); row.classList.add("rl-hm");
}
function rl163Deco(root){
  if(!root || !root.querySelectorAll) return;
  var i, L;
  L = root.querySelectorAll(RL163_CAND); for(i = 0; i < L.length; i++){ try{ rl163Link(L[i]); }catch(e){} }
  if(root.matches && root.matches(RL163_CAND)) try{ rl163Link(root); }catch(e){}
  L = root.querySelectorAll(".tg-it:not([data-rlp])"); for(i = 0; i < L.length; i++){ try{ rl163Pic(L[i]); }catch(e){} }
  L = root.querySelectorAll(".mq-nd:not([data-rlp])"); for(i = 0; i < L.length; i++){ try{ rl163MqPic(L[i]); }catch(e){} }
  L = root.querySelectorAll('[data-pg="tech"] .tch-it[data-a="tsel"]:not(.done):not([data-rlm]), .tg.fm .tg-list .tg-it:not([data-rlm]), [data-pg="parts"] .tg-list .tg-it:not([data-rlm])');
  for(i = 0; i < L.length; i++){ try{ if(!L[i].closest(".tg-pop")) rl163More(L[i]); }catch(e){} }
  L = root.querySelectorAll(".rq-row:not([data-rlc]), .tch-it:not([data-rlc]), .tg.fm .tg-list .tg-it:not([data-rlc]), [data-pg=\"parts\"] .tg-list .tg-it:not([data-rlc])");
  for(i = 0; i < L.length; i++){ try{ rl163Cust(L[i]); }catch(e){} }
}
/* what a page draws on its own, after render */
function rl163Watch(){
  if(RL163.mo || typeof MutationObserver !== "function") return;
  RL163.mo = new MutationObserver(function(recs){
    if(RL163.busy) return; RL163.busy = 1;
    try{
      var seen = [], hyd = false;
      recs.forEach(function(r){
        if(r.target && r.target.closest && r.target.closest(".rl-menu")) return;
        for(var i = 0; i < r.addedNodes.length; i++){
          var n = r.addedNodes[i], el = n.nodeType === 1 ? n : n.parentElement; if(!el || seen.indexOf(el) > -1) continue;
          if(n.nodeType === 3){ var c = el.closest(RL163_CAND); if(c && c.getAttribute("data-rl") === "0") c.removeAttribute("data-rl"); el = c || el; }
          seen.push(el);
        }
      });
      seen.forEach(function(el){ if(!el.isConnected) return; rl163Deco(el); if(el.querySelector && el.querySelector("img[data-trk-f]:not([src])")) hyd = true; });
      if(hyd) try{ trkHydrate(); }catch(e){}
    }catch(e){ console.error(e); }
    RL163.busy = 0;
  });
  RL163.mo.observe(document.body, { childList: true, subtree: true });
}
/* open the RO; the RO page's Back goes back to the page it came from */
var RL163_BACK = { triage: 1, foreman: 1, parts: 1, manager: 1, tech: 1 };
function rl163Open(id){
  var ro = getRO(id); if(!ro) return;
  rl163MenuClose(); try{ if(typeof PTIP !== "undefined" && PTIP.hide) PTIP.hide(); }catch(e){}
  UI._roFromNext = RL163_BACK[UI.view] ? UI.view : null; UI.rlOrder = null; UI.palette = null;
  if(UI.tgPop) UI.tgPop = null;
  PG.openRo(id);
}
function rl163Hit(e, sel){
  var P = e.composedPath ? e.composedPath() : [e.target];
  for(var i = 0; i < P.length; i++){ var n = P[i]; if(n === document || n === window) break; if(n.nodeType === 1 && n.matches && n.matches(sel)) return n; }
  return null;
}
/* ---- the ⋯ menu: the shop functions, through the same pop-overs the truck card and Foreman use ---- */
function rl163Me(){ try{ var sf = viewAsStaff(); return sf && sf.name || ""; }catch(e){ return ""; } }
function rl163CanStart(){ try{ return navAllowed("tech") || navAllowed("console"); }catch(e){ return true; } }
function rl163Items(ro){
  var ok = function(a){ try{ return typeof v163ShopOk === "function" ? v163ShopOk(ro, a) !== false : true; }catch(e){ return true; } }, L = [];
  var ops = raOps(ro).filter(function(o){ return !o.declined && !opDoneNow(o); }), me = rl163Me();
  var op = ops.filter(function(o){ return me && o.assignedTech === me; })[0] || ops[0], rp = null; try{ rp = runningPunch(); }catch(e){}
  if(op && rl163CanStart() && !(rp && rp.opId === op.id) && ok("start")) L.push({ k: "start", op: op.id, ic: "play", l: "Start op " + raN(ro, op), s: String(op.complaint || "").slice(0, 38) });
  if(ok("transfer")) L.push({ k: "transfer", ic: "swap", l: "Transfer…", s: "" });
  var tr = false; try{ tr = trxBtnsOk(ro); }catch(e){}
  if(tr && ok("roadtest")) L.push({ k: "roadtest", ic: "road", l: "Road test", s: "" });
  if(tr && ok("checks")) L.push({ k: "checks", ic: "check", l: "Truck checks", s: "" });
  var rdy = false; try{ rdy = tyCat(ro) === "rdy" && (typeof can !== "function" || can("ro.release")); }catch(e){}
  if(rdy && ok("release")) L.push({ k: "release", ic: "release", l: "Release…", s: "" });
  return L;
}
function rl163Ic(k){ try{ return tgI(k, 14); }catch(e){ return ""; } }
function rl163MenuClose(){ var M = RL163.menu; if(!M) return; RL163.menu = null; try{ M.el.remove(); }catch(e){} try{ if(M.btn && M.btn.isConnected){ M.btn.setAttribute("aria-expanded", "false"); M.btn.classList.remove("on"); } }catch(e){} }
function rl163Menu(btn){
  var same = RL163.menu && RL163.menu.ro === btn.getAttribute("data-rlmore"); rl163MenuClose(); if(same) return;
  var ro = getRO(btn.getAttribute("data-rlmore")); if(!ro) return;
  var L = rl163Items(ro), m = document.createElement("div");
  m.className = "rl-menu"; m.setAttribute("role", "menu"); m.setAttribute("aria-label", "Shop functions for " + tgNum(ro));
  m.innerHTML = '<div class="rl-mh"><b>' + esc(roLabel(ro)) + '</b><span>' + esc(ro.customerName || "") + '</span></div>'
    + (L.length ? L.map(function(it){ return '<button type="button" role="menuitem" class="rl-mi" data-rlact="' + it.k + '" data-ro="' + esc(ro.id) + '"' + (it.op ? ' data-op="' + esc(it.op) + '"' : '') + '>' + rl163Ic(it.ic) + '<span>' + esc(it.l) + '</span>' + (it.s ? '<small>' + esc(it.s) + '</small>' : '') + '</button>'; }).join('')
      : '<div class="rl-mnone">Nothing to do from here right now.</div>');
  document.body.appendChild(m);
  var r = btn.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
  var left = Math.max(8, Math.min(vw - w - 8, r.right - w)), top = r.bottom + 4; if(top + h > vh - 8) top = Math.max(8, r.top - h - 4);
  m.style.left = left + "px"; m.style.top = top + "px";
  RL163.menu = { el: m, btn: btn, ro: ro.id }; btn.setAttribute("aria-expanded", "true"); btn.classList.add("on");
  var f = m.querySelector(".rl-mi"); if(f) try{ f.focus({ preventScroll: true }); }catch(e){}
}
function rl163Act(b){
  var k = b.getAttribute("data-rlact"), id = b.getAttribute("data-ro"), ro = getRO(id); rl163MenuClose(); if(!ro) return;
  if(k === "start"){
    var op = getOp(id, b.getAttribute("data-op")); if(!op) return;
    try{ if(typeof openShift === "function" && !openShift() && typeof shiftClockIn === "function") shiftClockIn(true); }catch(e){}
    var jt = ""; try{ jt = opJobType(op); }catch(e){}
    doStartPunch(id, op.id, jt === "DIAG" ? "Diagnosing" : jt === "PM" ? "Inspecting" : "Repairing");
    var rp = null; try{ rp = runningPunch(); }catch(e){}
    if(rp && rp.opId === op.id) pushToast("Started op " + raN(ro, op) + " on " + roLabel(ro) + ".", true);
    return;
  }
  var T = { transfer: "xfer", roadtest: "road", checks: "checks", release: "release" }[k];
  if(T) tgOpenPop(T, id);
}
window.addEventListener("click", function(e){
  var t = rl163Hit(e, ".ro-lnk[data-rolnk]");
  if(t){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); rl163Open(t.getAttribute("data-rolnk")); return; }
  var b = rl163Hit(e, ".rl-more[data-rlmore]");
  if(b){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); rl163Menu(b); return; }
  var mi = rl163Hit(e, ".rl-menu .rl-mi[data-rlact]");
  if(mi){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); rl163Act(mi); return; }
  if(RL163.menu && !rl163Hit(e, ".rl-menu")) rl163MenuClose();
}, true);
window.addEventListener("keydown", function(e){
  if(RL163.menu){
    if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); var bb = RL163.menu.btn; rl163MenuClose(); try{ if(bb && bb.isConnected) bb.focus(); }catch(x){} return; }
    if(e.key === "ArrowDown" || e.key === "ArrowUp"){ var I = [].slice.call(RL163.menu.el.querySelectorAll(".rl-mi")), dn = e.key === "ArrowDown"; if(I.length){ e.preventDefault(); e.stopPropagation(); var k0 = I.indexOf(document.activeElement); I[k0 < 0 ? (dn ? 0 : I.length - 1) : (k0 + (dn ? 1 : -1) + I.length) % I.length].focus(); } return; }
  }
  if(e.key !== "Enter" && e.key !== " ") return;
  var t = rl163Hit(e, ".ro-lnk[data-rolnk]");
  if(t){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); rl163Open(t.getAttribute("data-rolnk")); }
}, true);
window.addEventListener("scroll", function(){ if(RL163.menu) rl163MenuClose(); }, true);
window.addEventListener("resize", function(){ if(RL163.menu) rl163MenuClose(); });
try{ if(document.body) rl163Watch(); else document.addEventListener("DOMContentLoaded", rl163Watch); }catch(e){}
