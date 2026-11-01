/* Parsec · shell · page-search.js
   The page search window (Ctrl K and each page's search icon): PSM finds ROs, people and parts, draws the results, and jumps to one (psmPick).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   psmRedraw psmOpen psmApply psmPaint psmMark psmPick psmClose psmRoSub psmRoItem PSM (9 functions, 1 constant)
   uses       kit/ pages/ pages/foreman/ pages/triage/ pages/warranty/ ro/ state/
   at load    on document click · on window keydown · on window keyup · on window keypress
*/
/* ---------- the window ---------- */
var PSM = { c: null, el: null, i: -1, items: [], t: null, back: null };
function psmRedraw(){ try{ if(typeof PG !== "undefined" && PG.keepScroll) PG.keepScroll(render); else render(); }catch(e){ try{ render(); }catch(er){} } }
function psmOpen(x){
  var c = typeof x === "string" ? psmCfg(x) : x; if(!c) return;
  if(PSM.el) psmClose(true, true);
  PSM.c = c; PSM.i = -1; PSM.back = document.activeElement;
  var w = document.createElement("div"); w.className = "psm"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", c.title || "Search");
  w.innerHTML = '<div class="psm-c"><label class="psm-in">' + psmI("search", 18) + '<input type="text" autocomplete="off" spellcheck="false" data-no-draft data-psm-in aria-label="' + psmE(c.title || "Search") + '" placeholder="' + psmE(c.placeholder || c.title || "Search") + '"><span class="psm-k">Esc</span></label><div class="psm-h" aria-live="polite"></div><div class="psm-res" role="listbox"></div></div>';
  document.body.appendChild(w); PSM.el = w;
  var inp = w.querySelector("input"); inp.value = psmQ(c);
  w.addEventListener("mousedown", function(e){ if(e.target === w){ e.preventDefault(); } });
  w.addEventListener("click", function(e){
    if(e.target === w){ psmClose(true); return; }
    var r = e.target.closest && e.target.closest("[data-psm-i]"); if(r){ psmPick(+r.getAttribute("data-psm-i")); }
  });
  w.addEventListener("mousemove", function(e){ var r = e.target.closest && e.target.closest("[data-psm-i]"); if(r){ var i = +r.getAttribute("data-psm-i"); if(i !== PSM.i){ PSM.i = i; psmMark(); } } });
  inp.addEventListener("input", function(){ clearTimeout(PSM.t); var v = inp.value; PSM.t = setTimeout(function(){ psmApply(v); }, 120); });
  psmPaint();
  try{ inp.focus({ preventScroll: true }); inp.setSelectionRange(inp.value.length, inp.value.length); }catch(e){ inp.focus(); }
}
function psmApply(v){ var c = PSM.c; if(!c) return; try{ if(c.set) c.set(v); }catch(e){ console.error(e); } PSM.i = -1; psmPaint(); }
function psmPaint(){
  var c = PSM.c, w = PSM.el; if(!c || !w) return;
  var inp = w.querySelector("input"), q = inp ? inp.value : psmQ(c), qt = q.trim(), h = "", n = null;
  var L = []; try{ L = c.items ? (c.items(qt) || []).slice(0, 8) : []; }catch(e){ console.error(e); L = []; }
  PSM.items = L;
  try{ n = c.count ? c.count(qt) : null; }catch(e){ n = null; }
  var pg = c.page ? c.page : "page";
  if(c.filters === false){
    h = qt ? (L.length ? L.length + (L.length >= 8 ? "+" : "") + " match" + (L.length === 1 ? "" : "es") + " · ↑ ↓ to pick · Enter opens" : "Nothing matches “" + psmE(qt) + "”") : (c.empty || (L.length ? "Recent · type to find one · Enter opens" : "Type to find one"));
  } else {
    var nt = n ? n.n + " of " + n.of : "";
    h = qt ? "Filters the " + psmE(pg) + " list" + (nt ? " — <b>" + nt + "</b>" : "") + " · Enter keeps it · Esc clears" : (c.empty || "Type to filter the " + psmE(pg) + " list") + (n ? " — " + n.of + " in it" : "") + " · Esc closes";
  }
  w.querySelector(".psm-h").innerHTML = h;
  w.querySelector(".psm-res").innerHTML = L.map(function(it, i){
    return '<button type="button" class="psm-r" role="option" data-psm-i="' + i + '" aria-selected="false">' + (it.icon ? '<span class="psm-ri">' + it.icon + "</span>" : "") + '<span class="psm-rt"><b>' + psmE(it.title) + "</b>" + (it.sub || it.st ? "<small>" + (it.st && typeof pgSt === "function" ? pgSt(it.stk || "ro", it.st, { cls: "sm", size: 12 }) + (it.sub ? '<span class="psm-sd"> · </span>' : "") : "") + psmE(it.sub || "") + "</small>" : "") + '</span><span class="psm-rk">' + psmI("ret", 13) + "</span></button>";
  }).join("");
  w.classList.toggle("has-res", L.length > 0);
  psmMark();
}
function psmMark(){ var w = PSM.el; if(!w) return; [].forEach.call(w.querySelectorAll("[data-psm-i]"), function(r){ var on = +r.getAttribute("data-psm-i") === PSM.i; r.classList.toggle("k", on); r.setAttribute("aria-selected", on ? "true" : "false"); if(on && r.scrollIntoView) r.scrollIntoView({ block: "nearest" }); }); }
function psmPick(i){
  var c = PSM.c, it = PSM.items[i]; if(!c || !it) return;
  var inp = PSM.el && PSM.el.querySelector("input");
  if(inp && c.set && psmQ(c) !== inp.value){ clearTimeout(PSM.t); try{ c.set(inp.value); }catch(e){} }
  psmClose(c.filters !== false, true);
  try{ if(c.pick) c.pick(it); }catch(e){ console.error(e); }
  psmRedraw();
}
function psmClose(keep, quiet){
  var c = PSM.c, w = PSM.el, inp = w && w.querySelector("input");
  clearTimeout(PSM.t);
  if(c){
    if(keep && c.filters !== false && inp && psmQ(c) !== inp.value){ try{ c.set(inp.value); }catch(e){} }
    if(!keep || c.filters === false){ try{ if(c.set && psmQ(c)) c.set(""); }catch(e){} }
  }
  if(w) w.remove();
  PSM.c = null; PSM.el = null; PSM.items = []; PSM.i = -1;
  if(!quiet) psmRedraw();
  if(c && !quiet){ setTimeout(function(){ var b = document.querySelector('[data-psm="' + c.key + '"].psm-b'); if(b) try{ b.focus({ preventScroll: true }); }catch(e){} }, 0); }
}
/* the icon, the chip and its ×; the keys while the window is open */
document.addEventListener("click", function(e){
  var t = e.target; if(!t || !t.closest) return;
  var x = t.closest("[data-psm-x]");
  if(x){ e.preventDefault(); e.stopPropagation(); var c = psmCfg(x.getAttribute("data-psm-x")); if(c && c.set){ try{ c.set(""); }catch(er){} } psmRedraw(); return; }
  var b = t.closest("[data-psm]");
  if(b && !(PSM.el && PSM.el.contains(b))){ e.preventDefault(); e.stopPropagation(); psmOpen(b.getAttribute("data-psm")); }
}, true);
window.addEventListener("keydown", function(e){
  if(!PSM.el) return;
  var k = e.key, n = PSM.items.length;
  if((e.ctrlKey || e.metaKey) && (k === "k" || k === "K")){ psmClose(true); return; }   /* Ctrl K — the search for everything — takes over */
  e.stopPropagation();                                           /* the page's own keys wait while the window is open */
  if(k === "Escape"){ e.preventDefault(); psmClose(false); return; }
  if(k === "ArrowDown"){ e.preventDefault(); if(n){ PSM.i = PSM.i < n - 1 ? PSM.i + 1 : 0; psmMark(); } return; }
  if(k === "ArrowUp"){ e.preventDefault(); if(n){ PSM.i = PSM.i > 0 ? PSM.i - 1 : n - 1; psmMark(); } return; }
  if(k === "Enter"){
    e.preventDefault();
    var c = PSM.c;
    if(PSM.i >= 0 && PSM.i < n){ psmPick(PSM.i); return; }
    if(c && c.filters === false){ if(n) psmPick(0); else psmClose(false); return; }
    psmClose(true); return;
  }
  if(k === "Tab"){ var f = [].slice.call(PSM.el.querySelectorAll("input, [data-psm-i]")); var i = f.indexOf(document.activeElement); if(f.length){ e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); } return; }
}, true);
window.addEventListener("keyup", function(e){ if(PSM.el) e.stopPropagation(); }, true);
window.addEventListener("keypress", function(e){ if(PSM.el) e.stopPropagation(); }, true);

/* ---------- Triage, Foreman, Warranty: their search finds one RO to jump to ---------- */
function psmRoSub(ro){ var sp = null; try{ sp = tgSpotOf(ro); }catch(e){} var sl = ""; try{ sl = sp ? tgSpotLbl(sp) : ""; }catch(e){}
  return [ro.unitNumber ? "Unit " + ro.unitNumber : "", sl || ro.location || ""].filter(Boolean).join(" · "); }
/* Parsec 14: the status as on every page (pgSt) before the unit and spot */
function psmRoItem(ro){ var st = ""; try{ st = roStatus(ro).status; }catch(e){} return { id: ro.id, title: tgNum(ro) + (ro.customerName ? " · " + ro.customerName : ""), sub: psmRoSub(ro), st: st }; }
psmReg("triage", function(){ return { title: "Search — RO, unit, customer, VIN or spot", page: "Triage", placeholder: "RO, unit, customer, VIN or spot", filters: false,
  get: function(){ return UI.tgQ || ""; }, set: function(q){ UI.tgQ = q; },
  items: function(q){ if(!q) return tgFlat().slice(0, 5).map(tgRoById).filter(Boolean).map(psmRoItem); return tgFind(q).L.slice(0, 8).map(psmRoItem); },
  pick: function(it){ UI.tgSel = it.id; UI.tgQ = ""; UI.tgSrch = false; UI.tgPop = null; } }; });
psmReg("foreman", function(){ return { title: "Search — RO, unit, customer, VIN or spot", page: "Foreman", placeholder: "RO, unit, customer, VIN or spot", filters: false,
  get: function(){ return UI.fmQ || ""; }, set: function(q){ UI.fmQ = q; },
  items: function(q){ if(!q) return fmFlat().slice(0, 5).map(fmGet).filter(function(x){ return x && !x.isTech; }).map(psmRoItem); return tgFind(q).L.slice(0, 8).map(psmRoItem); },
  pick: function(it){ UI.fmSel = it.id; UI.fmQ = ""; UI.fmSrch = false; UI.fmPop = null; } }; });
psmReg("warranty", function(){ return { title: "Search — RO, claim #, VIN, customer or code", page: "Warranty", placeholder: "RO, claim #, VIN, customer or code", filters: false,
  get: function(){ return UI.waQ || ""; }, set: function(q){ UI.waQ = q; },
  items: function(q){
    q = String(q || "").trim().toLowerCase();
    var hay = function(ro){ return [ro.roNumber, ro.customerName, ro.vin, ro.unitNumber, ro.caseNumber].concat(wcOps(ro).map(function(op){ var c = op.claim || {}; return [op.complaint, c.claimNo, waFail(op)].join(" "); })).join(" ").toLowerCase(); };
    var L = q ? waRos().filter(function(ro){ var h = hay(ro); return q.split(/\s+/).every(function(w){ return h.indexOf(w) > -1; }); }).slice(0, 8) : waFlat().slice(0, 5).map(getRO).filter(Boolean);
    return L.map(function(ro){ var cn = wcOps(ro).map(function(op){ return (op.claim || {}).claimNo; }).filter(Boolean).join(" · ");
      return { id: ro.id, title: tgNum(ro) + (ro.customerName ? " · " + ro.customerName : ""), sub: [cn || "no claim # yet", (wcOps(ro)[0] || {}).complaint || ""].filter(Boolean).join(" · ") }; });
  },
  pick: function(it){ UI.waSel = it.id; UI.waOp = null; UI.waSrch = false; UI.waQ = ""; UI.waPop = null; if(UI.waView === "money" || UI.waView === "parts") UI.waView = "claims"; } }; });
