/* Parsec · trucks · catalog-window.js
   The 52-truck catalog window: every body by year, pick one for the RO.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   trkCatOpen trkCatClose trkCatDraw TC (3 functions, 1 constant)
   uses       kit/ shell/
   at load    on document click · on document input · on window keydown
*/
/* ============================== The 52-truck catalog (Parsec 10) ==============================
   A truck for its time: every body ChatGPT drew, by year. From Truck & photos it picks the body; from Your data it shows. */
var TC = null;   /* { pick: fn|null, q, fam, view, sel, back } */
function trkCatOpen(pick, back){ TC = { pick: pick || null, q: "", fam: "All", view: "s", sel: null, back: back || document.activeElement }; trkCatDraw(true); }
function trkCatClose(){ var w = document.getElementById("trk-cat"); if(w) w.remove(); var b = TC && TC.back; TC = null; if(!TD && !TI) document.documentElement.classList.remove("ti-open"); try{ if(b && b.isConnected) b.focus({ preventScroll: true }); }catch(e){} }
function trkCatDraw(first){
  var q = TC.q.trim().toLowerCase(), yr = /^\d{4}$/.test(q) ? +q : 0;
  var L = VT_P.filter(function(p){ if(TC.fam !== "All" && p.family.split(" ")[0] !== TC.fam) return false; if(!q) return true; if(yr) return yr >= p.from && yr <= (p.to >= 2026 ? 9999 : p.to);
    var t = (p.label + " " + p.family + " " + p.cab + " " + p.body + " " + vtModelOf(p)).toLowerCase(); return q.split(/\s+/).every(function(w){ return t.indexOf(w) > -1 || t.replace(/\s+/g, "").indexOf(w) > -1; }); });
  var fams = ["All", "VNL", "VNR", "VNX", "VHD", "VAH", "VNM", "VT", "VN"];
  var src = function(p, k){ var e = trkEntry("vt-" + p.id) || VT_SEED.filter(function(x){ return x.vt === p.id; })[0]; return trkSrc(e, k === "t" ? "top" : "src"); };
  var sel = TC.sel ? VT_BY[TC.sel] : null;
  var h = '<div class="td tc" role="dialog" aria-modal="true" aria-labelledby="tc-h" tabindex="-1">'
    + '<div class="ti-h"><div class="ti-ht"><div class="ti-eb0">Volvo Trucks North America · 1997 to today</div><h2 id="tc-h">A truck for its time.</h2><div class="ti-sub">' + VT_P.length + ' bodies, each from the side and from above.' + (TC.pick ? ' Pick the one that matches the truck.' : '') + '</div></div>'
    + '<button type="button" class="ti-x" data-tc="close" aria-label="Close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
    + '<div class="tc-tools"><input data-tc-q value="' + esc(TC.q) + '" placeholder="A year, model or cab — try 2016 or 860" aria-label="Find a body" autocomplete="off">'
    + '<div class="tc-seg" role="group" aria-label="Family">' + fams.map(function(f){ return '<button type="button" data-tc="fam" data-v="' + f + '" aria-pressed="' + (TC.fam === f) + '">' + f + '</button>'; }).join('') + '</div>'
    + '<div class="tc-seg" role="group" aria-label="View"><button type="button" data-tc="view" data-v="s" aria-pressed="' + (TC.view === "s") + '">Side</button><button type="button" data-tc="view" data-v="t" aria-pressed="' + (TC.view === "t") + '">Top</button></div><span class="tc-n">' + L.length + ' of ' + VT_P.length + '</span></div>'
    + (sel ? '<div class="tc-d"><span class="tc-ds"><img src="' + esc(src(sel, "s")) + '" alt=""></span><span class="tc-dt"><img src="' + esc(src(sel, "t")) + '" alt=""></span><div class="tc-dx"><span class="tc-k">' + esc(sel.family + " · " + vtYears(sel)) + '</span><b>' + esc(sel.label) + '</b><p>' + esc(sel.body) + '</p><div class="tc-chips">' + (sel.review ? '<span class="td-pill warn">Check against truck</span>' : '<span class="td-pill good">Matches by year</span>') + vtTrims(sel).map(function(t){ return '<span class="td-pill">' + esc(t) + '</span>'; }).join('') + '</div>' + (TC.pick ? '<button type="button" class="px-btn sm pri" data-tc="use" data-id="' + esc(sel.id) + '">Use this body</button>' : '') + '</div></div>' : '')
    + '<div class="tc-g">' + (L.length ? L.map(function(p){ return '<button type="button" class="tc-c' + (TC.sel === p.id ? ' on' : '') + '" data-tc="sel" data-id="' + esc(p.id) + '"><span class="tc-im' + (TC.view === "t" ? ' t' : '') + '"><img src="' + esc(src(p, TC.view)) + '" alt="" loading="lazy"></span><b>' + esc(p.label) + '</b><small>' + esc(vtYears(p)) + '</small>' + (p.review ? '<em>Check against truck</em>' : '') + '</button>'; }).join('') : '<p class="ti-empty">Nothing for that — try a year between 1997 and today.</p>') + '</div></div>';
  var w = document.getElementById("trk-cat"), hadQ = w && document.activeElement && document.activeElement.hasAttribute && document.activeElement.hasAttribute("data-tc-q"), sc = w && w.querySelector(".tc-g") ? w.querySelector(".tc-g").scrollTop : 0;
  if(!w){ w = document.createElement("div"); w.id = "trk-cat"; w.className = "ti-wrap tc-wrap"; document.body.appendChild(w); }
  w.innerHTML = h; document.documentElement.classList.add("ti-open");
  var g = w.querySelector(".tc-g"); if(g) g.scrollTop = sc;
  if(first || hadQ){ var i = w.querySelector("[data-tc-q]"); if(i){ i.focus({ preventScroll: true }); try{ i.setSelectionRange(i.value.length, i.value.length); }catch(e){} } }
}
(function(){
  document.addEventListener("click", function(ev){
    if(!TC) return; var w = document.getElementById("trk-cat"); if(!w || !w.contains(ev.target)) return;
    ev.stopPropagation(); if(ev.target === w){ trkCatClose(); return; }
    var t = ev.target.closest("[data-tc]"); if(!t) return; var k = t.getAttribute("data-tc");
    if(k === "close") trkCatClose();
    else if(k === "fam"){ TC.fam = t.getAttribute("data-v"); trkCatDraw(); }
    else if(k === "view"){ TC.view = t.getAttribute("data-v"); trkCatDraw(); }
    else if(k === "sel"){ var id = t.getAttribute("data-id"); if(TC.pick && TC.sel === id){ var e = trkEntry("vt-" + id) || VT_SEED.filter(function(x){ return x.vt === id; })[0], fn = TC.pick; trkCatClose(); fn(e); return; } TC.sel = id; trkCatDraw(); var d = w.querySelector(".tc-d"); if(d && typeof pmAnimate === "function") pmAnimate(d, [{ opacity: .5, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], 180); }
    else if(k === "use"){ var id2 = t.getAttribute("data-id"), e2 = trkEntry("vt-" + id2) || VT_SEED.filter(function(x){ return x.vt === id2; })[0], fn2 = TC.pick; trkCatClose(); if(fn2) fn2(e2); }
  }, true);
  document.addEventListener("input", function(ev){ if(!TC) return; var t = ev.target; if(!t || !t.hasAttribute || !t.hasAttribute("data-tc-q")) return; TC.q = t.value; trkCatDraw(); }, true);
  window.addEventListener("keydown", function(ev){ if(!TC) return; var w = document.getElementById("trk-cat"); if(!w) return;
    if(ev.key === "Escape"){ ev.preventDefault(); ev.stopPropagation(); trkCatClose(); return; }
    ev.stopPropagation(); }, true);
})();
