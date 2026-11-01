/* Parsec · shell · lists-fold.js
   Every page's left list folds to a strip (Parsec 12.7): LF remembers it per page, lfDecorate adds the « button after a render.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   lfSave lfPhone lfPage lfOwnText lfIc lfE lfDecorate lfToggleList psmR psmReg psmCfg psmE … (15 functions, 2 constants)
   uses       access/ state/
   at load    builds LF (a closure) · on document click · on document keydown
*/
/* ============================== Parsec 12.7 — the pages' lists fold ==============================
   Every page's left list (Needs action on Triage, Foreman, Parts and Warranty, the Technician page's repair orders,
   Fixes, the Time Log's days, the Manager's lists…) folds into a thin strip with its title and count, so the page's
   main pane gets the whole width — the « button in the list's head, a click on the strip, or ] folds and opens it.
   And each group in a list (Late, Arrived, Working…) opens and closes on its own with a click on its head.
   Both are remembered per page on this computer. On a phone the list is its own screen, so only the groups fold.
   It is laid on after every redraw (patchApp), in the same step, so nothing flickers: the button, the strip and the
   chevrons are put back as the last child of their parents, and the classes are set again. */
var LF = (function(){ try{ var o = JSON.parse(localStorage.getItem("parsec.lf") || "{}"); return { l: o.l || {}, g: o.g || {} }; }catch(e){ return { l: {}, g: {} }; } })();
function lfSave(){ try{ localStorage.setItem("parsec.lf", JSON.stringify(LF)); }catch(e){} }
function lfPhone(){ try{ return document.documentElement.getAttribute("data-device") === "phone" || window.matchMedia("(max-width: 760px)").matches; }catch(e){ return false; } }
function lfPage(){ try{ return String(UI.view || ""); }catch(e){ return ""; } }
function lfOwnText(el){ var t = ""; for(var n = el.firstChild; n; n = n.nextSibling) if(n.nodeType === 3) t += n.nodeValue; return t.replace(/\s+/g, " ").trim(); }
function lfIc(k){
  var P = { fold: '<path d="M15 6l-6 6 6 6"/><path d="M19 5v14"/>', open: '<path d="M9 6l6 6-6 6"/><path d="M5 5v14"/>', chev: '<path d="M9 6l6 6-6 6"/>' };
  return '<svg class="lf-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[k] + "</svg>";
}
function lfE(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function lfDecorate(root){
  root = root || document.getElementById("app"); if(!root) return;
  var pg = lfPage(), phone = lfPhone();
  Array.prototype.forEach.call(root.querySelectorAll(".tg-list"), function(list){
    var head = list.querySelector(":scope > .tg-lh");
    if(!head) return;
    var title = lfOwnText(head) || "List", nEl = head.querySelector(":scope > .n"), n = nEl ? nEl.textContent.trim() : "";
    var fold = !phone && !!LF.l[pg];
    /* the head's button (last child) */
    var b = head.lastElementChild;
    if(!b || !b.classList.contains("lf-b")){
      b = document.createElement("button"); b.type = "button"; b.className = "lf-b"; b.setAttribute("data-lf", "list");
      b.title = "Fold the list — the page gets the whole width ( ] )"; b.setAttribute("aria-label", "Fold the list"); b.innerHTML = lfIc("fold");
      head.appendChild(b);
    }
    b.setAttribute("aria-expanded", fold ? "false" : "true");
    /* the strip it folds into (last child of the list) */
    var r = list.lastElementChild;
    if(!r || !r.classList.contains("lf-rail")){
      r = document.createElement("button"); r.type = "button"; r.className = "lf-rail"; r.setAttribute("data-lf", "open");
      list.appendChild(r);
    }
    var late = list.querySelectorAll(".tg-it .tg-dot, .tg-it.late, .tg-it .late").length;
    var rh = lfIc("open") + '<span class="lf-rt">' + lfE(title) + "</span>" + (n ? '<span class="lf-rn">' + lfE(n) + "</span>" : "") + (late ? '<span class="lf-rl" title="' + late + ' late">' + late + "</span>" : "");
    if(r._lf !== rh){ r._lf = rh; r.innerHTML = rh; }
    r.title = "Open " + title + (n ? " · " + n : "") + " ( ] )"; r.setAttribute("aria-label", "Open " + title);
    list.classList.toggle("lf-fold", fold);
    /* the groups */
    Array.prototype.forEach.call(list.querySelectorAll(".tg-grp"), function(g){
      var lb = lfOwnText(g); if(!lb) return;
      var key = pg + "|" + lb, shut = !!LF.g[key];
      var c = g.lastElementChild;
      if(!c || !c.classList.contains("lf-chev")){ c = document.createElement("span"); c.className = "lf-chev"; c.innerHTML = lfIc("chev"); g.appendChild(c); }
      g.classList.add("lf-g"); g.classList.toggle("lf-shut", shut);
      g.setAttribute("role", "button"); g.setAttribute("tabindex", "0"); g.setAttribute("aria-expanded", shut ? "false" : "true"); g.setAttribute("data-lf-g", key);
      g.title = (shut ? "Open " : "Fold ") + lb;
      var hid = 0;
      for(var x = g.nextElementSibling; x; x = x.nextElementSibling){
        if(x.classList.contains("tg-grp") || x.classList.contains("tg-sec") || x.classList.contains("lf-rail")) break;
        var keep = !shut || (!phone && x.classList.contains("on"));   /* the row you have open stays in sight (not on a phone, where the list is its own screen) */
        x.classList.toggle("lf-gone", !keep);
        if(!keep && (x.classList.contains("tg-it") || x.classList.contains("tg-row"))) hid++;
      }
      g.classList.toggle("lf-none", shut && !hid);
    });
  });
}
function lfToggleList(force){
  if(lfPhone()) return false;
  var pg = lfPage(), on = force != null ? force : !LF.l[pg];
  if(on) LF.l[pg] = 1; else delete LF.l[pg];
  lfSave(); lfDecorate();
  return true;
}
document.addEventListener("click", function(e){
  var t = e.target && e.target.closest ? e.target : null; if(!t) return;
  var a = t.closest('[data-lf="list"],[data-lf="open"]');
  if(a){ e.preventDefault(); e.stopPropagation(); lfToggleList(a.getAttribute("data-lf") === "list"); return; }
  var g = t.closest(".tg-grp.lf-g");
  if(!g) return;
  if(t.closest("button, a, input, select") && !t.closest(".lf-chev")) return;   /* a button in the group's head (Plan together…) is its own */
  e.preventDefault(); e.stopPropagation();
  var k = g.getAttribute("data-lf-g"); if(!k) return;
  if(LF.g[k]) delete LF.g[k]; else LF.g[k] = 1;
  lfSave(); lfDecorate();
}, true);
document.addEventListener("keydown", function(e){
  if(e.ctrlKey || e.metaKey || e.altKey) return;
  var a = document.activeElement, typing = a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable);
  if(e.key === "]" && !typing){
    try{ if(UI.modal || (typeof pxOut === "function" && pxOut())) return; }catch(er){}
    if(!document.querySelector("#app .tg-list")) return;
    if(lfToggleList()){ e.preventDefault(); e.stopPropagation(); }
    return;
  }
  if((e.key === "Enter" || e.key === " ") && a && a.classList && a.classList.contains("lf-g") && !typing){
    e.preventDefault(); e.stopPropagation();
    var k = a.getAttribute("data-lf-g"); if(!k) return;
    if(LF.g[k]) delete LF.g[k]; else LF.g[k] = 1;
    lfSave(); lfDecorate();
  }
}, true);

/* Parsec 13.1 — page search: every page's search is an icon that opens a search window over the page.
   Typing filters that page's list behind (or, on pages whose search finds one RO, lists the matches to jump to);
   Ctrl K stays the search for everything.
   A page renders psmBtn(key, title) and registers once with psmReg(key, () => cfg):
     cfg = { title, page ("Technician"), placeholder, get: () => q, set: q => apply + re-render the page,
             count: q => ({ n, of }) — optional, items: q => [{ id, title, sub, icon? }] — optional (top matches),
             pick: item => open it — optional, filters: false — the query finds rather than filters (no chip kept),
             empty: "what to type" — optional }
   psmOpen(keyOrCfg) opens the window, psmClose(keep) closes it (keep = the filter stays; otherwise it's cleared). */
function psmR(){ return psmR.r || (psmR.r = {}); }
function psmReg(key, f){ psmR()[key] = f; }
function psmCfg(key){
  var f = psmR()[key]; if(!f) return null;
  var c = null; try{ c = typeof f === "function" ? f() : f; }catch(e){ console.error(e); }
  if(c) c.key = key; return c;
}
function psmE(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
var PSM_IC = { search: '<circle cx="11" cy="11" r="6.25"/><path d="M15.75 15.75L20 20"/>', x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>', ret: '<path d="M9 10l-4 4 4 4"/><path d="M5 14h10a4 4 0 0 0 4-4V5"/>' };
function psmI(k, s){ return '<svg class="psm-ic" viewBox="0 0 24 24" width="' + (s || 16) + '" height="' + (s || 16) + '" aria-hidden="true">' + (PSM_IC[k] || "") + '</svg>'; }
function psmQ(c){ try{ return String((c && c.get && c.get()) || ""); }catch(e){ return ""; } }
/* the icon — with the query on a chip while a filter is on */
function psmBtn(key, title){
  var c = psmCfg(key), q = c && c.filters !== false ? psmQ(c).trim() : "", t = title || (c && c.title) || "Search";
  var short = q.length > 18 ? q.slice(0, 17) + "…" : q;
  return '<span class="psm-w' + (q ? " on" : "") + '"><button type="button" class="btn ib tg-srch-b psm-b' + (q ? " on" : "") + '" data-psm="' + psmE(key) + '" title="' + psmE(t) + '  ( / )" aria-label="' + psmE(t) + '" aria-haspopup="dialog">' + psmI("search", 16) + "</button>"
    + (q ? '<span class="psm-chip"><button type="button" class="psm-cq" data-psm="' + psmE(key) + '" title="Change the search">“' + psmE(short) + '”</button><button type="button" class="psm-cx" data-psm-x="' + psmE(key) + '" title="Clear the search" aria-label="Clear the search">' + psmI("x", 12) + "</button></span>" : "")
    + "</span>";
}
