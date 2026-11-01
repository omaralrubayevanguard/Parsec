/* Parsec · pages/foreman · shift-handover.js
   The shift handover sheet from the Foreman header: pick the ROs, add a note, build it.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   hoRos hoNext hoOpen hoClose hoBuild hoDraw viewInventory HO (7 functions, 1 constant)
   state      handover ros
   uses       access/ data/ kit/ pages/ pages/parts/ pages/triage/ ro/ shell/ state/ trucks/
   at load    on document click · on document change · on document input · on window keydown
*/
/* ============================== Shift handover ==============================
   Pick the ROs, add a note, build it: each RO with where it stands, who has it and its next step. Edit it,
   copy it, print it — and keep it for the next shift (Your data, with the shop's other data). */
var HO = null;   /* { sel: {id:1}, note, text, back } */
function hoRos(){ return STATE.ros.filter(function(ro){ return ro && !ro.shop && ro.id !== SHOP_RO_ID && !(typeof roIsDone === "function" && roIsDone(ro)) && (typeof onYard !== "function" || onYard(ro)); }); }
function hoNext(ro){ var x = null; try{ x = fmItemOf(ro.id); }catch(e){} if(x && x.why) return x.why; var run = null; try{ run = fmRoRun(ro); }catch(e){}
  if(run) return tgFirst(punchWho(run) || ro.assignedTech || "The tech") + " is on it"; var I = roInfo(ro); return I.complaint ? "Keep going on: " + I.complaint : "—"; }
function hoOpen(back){ var L = hoRos(), sel = {};
  L.forEach(function(ro){ var st = roStatus(ro).status; if(/^Waiting/.test(st) || fmIsBay(tgSpotOf(ro)) || st === "Working") sel[ro.id] = 1; });
  HO = { sel: sel, note: "", text: "", back: back || document.activeElement }; hoDraw(true); }
function hoClose(){ var w = document.getElementById("v10-ho"); if(w) w.remove(); var b = HO && HO.back; HO = null; if(!TD && !TI && !TC) document.documentElement.classList.remove("ti-open"); try{ if(b && b.isConnected) b.focus({ preventScroll: true }); }catch(e){} }
function hoBuild(){ var L = hoRos().filter(function(ro){ return HO.sel[ro.id]; }), now = new Date();
  return "Shift handover · " + now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) + " " + now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + (pxMeName() ? " · " + pxMeName() : "") + "\n" + L.length + " repair order" + (L.length === 1 ? "" : "s") + "\n\n"
    + L.map(function(ro){ var s = tgSpotOf(ro); return roLabel(ro) + " · " + (ro.customerName || "") + " (" + trkLabel(ro) + ")\n  " + tgStTxt(ro) + (s ? " · " + tgSpotLbl(s) : "") + (ro.assignedTech ? " · " + ro.assignedTech : " · no tech") + "\n  Next: " + hoNext(ro); }).join("\n\n")
    + (HO.note.trim() ? "\n\nNote: " + HO.note.trim() : ""); }
function hoDraw(first){
  var L = hoRos(), n = L.filter(function(ro){ return HO.sel[ro.id]; }).length, last = STATE.handover;
  var h = '<div class="td ho" role="dialog" aria-modal="true" aria-labelledby="ho-h" tabindex="-1"><div class="ti-h"><div class="ti-ht"><div class="ti-eb0">Foreman · ' + esc(new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })) + '</div><h2 id="ho-h">Shift handover</h2><div class="ti-sub">Keep the next action attached to each repair order.' + (last && last.at ? ' Last one: ' + esc(last.by || "someone") + ' · ' + esc(trkWhen(last.at)) + ' — <button type="button" class="td-lnk" data-ho="last">open it</button>' : '') + '</div></div>'
    + '<button type="button" class="ti-x" data-ho="close" aria-label="Close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
    + '<div class="ho-b"><div class="ho-l"><div class="ho-lh"><b>Include</b><span class="td-pill">' + n + ' of ' + L.length + '</span><span class="pk-sp"></span><button type="button" class="td-lnk" data-ho="all">' + (n === L.length ? 'None' : 'All') + '</button></div>'
    + (L.length ? L.map(function(ro){ var s = tgSpotOf(ro); return '<label class="ho-r"><input type="checkbox" data-ho-ro="' + esc(ro.id) + '"' + (HO.sel[ro.id] ? ' checked' : '') + '><span><b><span class="mono">' + esc(tgNum(ro)) + '</span> ' + esc(ro.customerName || "") + '</b><small>' + esc(tgStTxt(ro)) + (s ? ' · ' + esc(tgSpotLbl(s)) : '') + (ro.assignedTech ? ' · ' + esc(tgFirst(ro.assignedTech)) : '') + '</small><small class="nx">' + esc(hoNext(ro)) + '</small></span></label>'; }).join('') : '<p class="ti-empty">Nothing open on the yard.</p>') + '</div>'
    + '<div class="ho-s"><label class="ti-l">Note for the next shift<textarea data-ho-f="note" rows="3" placeholder="Anything the next foreman should know?">' + esc(HO.note) + '</textarea></label>'
    + '<button type="button" class="px-btn sm pri ho-go" data-ho="build"' + (n ? '' : ' disabled') + '>Build the handover →</button>'
    + (HO.text ? '<label class="ti-l">The handover — edit it as you like<textarea class="ho-t" data-ho-f="text" rows="12">' + esc(HO.text) + '</textarea></label><div class="ho-a"><button type="button" class="px-btn sm" data-ho="copy">Copy</button><button type="button" class="px-btn sm" data-ho="print">Print</button><button type="button" class="px-btn sm pri" data-ho="keep">Keep for the next shift</button></div>' : '<p class="td-fine">A draft you can edit, copy or print. Nothing is sent.</p>') + '</div></div></div>';
  var w = document.getElementById("v10-ho"), act = w && document.activeElement && w.contains(document.activeElement) ? document.activeElement.getAttribute("data-ho-f") : null;
  if(!w){ w = document.createElement("div"); w.id = "v10-ho"; w.className = "ti-wrap"; document.body.appendChild(w); }
  w.innerHTML = h; document.documentElement.classList.add("ti-open");
  if(act){ var f = w.querySelector('[data-ho-f="' + act + '"]'); if(f) f.focus(); }
  else if(first){ var d = w.querySelector(".td"); if(d) try{ d.focus({ preventScroll: true }); }catch(e){} }
}
(function(){
  document.addEventListener("click", function(e){
    var b0 = e.target.closest && e.target.closest("[data-v10=hand]"); if(b0){ e.preventDefault(); e.stopPropagation(); hoOpen(b0); return; }
    if(!HO) return; var w = document.getElementById("v10-ho"); if(!w || !w.contains(e.target)) return;
    if(e.target === w){ hoClose(); return; }
    var b = e.target.closest("[data-ho]"); if(!b) return; var k = b.getAttribute("data-ho");
    if(k === "close") hoClose();
    else if(k === "all"){ var L = hoRos(), all = L.every(function(ro){ return HO.sel[ro.id]; }); HO.sel = {}; if(!all) L.forEach(function(ro){ HO.sel[ro.id] = 1; }); hoDraw(); }
    else if(k === "build"){ HO.text = hoBuild(); hoDraw(); var t = w.querySelector(".ho-t"); if(t) pmAnimate(t, [{ opacity: .4, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], 180); }
    else if(k === "copy"){ var tx = HO.text; try{ navigator.clipboard.writeText(tx).then(function(){ pushToast("Handover copied."); }, function(){ pushToast("Couldn’t copy — select the text and copy it."); }); }catch(x){ pushToast("Couldn’t copy — select the text and copy it."); } }
    else if(k === "print"){ var pw = window.open("", "_blank"); if(!pw){ pushToast("The browser blocked the print window."); return; } pw.document.write("<!doctype html><title>Shift handover</title><pre style=\"font:14px/1.5 system-ui,sans-serif;white-space:pre-wrap;margin:32px\">" + esc(HO.text) + "</pre>"); pw.document.close(); pw.focus(); pw.print(); }
    else if(k === "keep"){ pushUndo("shift handover"); STATE.handover = { at: nowIso(), by: pxMeName() || "", text: HO.text }; scheduleSave(true); hoClose(); pushToast("Handover kept — the next shift opens it from Foreman.", true); }
    else if(k === "last"){ var l = STATE.handover; if(l){ HO.text = l.text || ""; hoDraw(); } }
  });
  document.addEventListener("change", function(e){ if(!HO) return; var c = e.target; if(!c || !c.getAttribute || !c.hasAttribute("data-ho-ro")) return; var id = c.getAttribute("data-ho-ro"); if(c.checked) HO.sel[id] = 1; else delete HO.sel[id]; hoDraw(); });
  document.addEventListener("input", function(e){ if(!HO) return; var t = e.target, f = t && t.getAttribute && t.getAttribute("data-ho-f"); if(!f) return; HO[f] = t.value; });
  window.addEventListener("keydown", function(e){ if(!HO || TD || TC) return; if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); hoClose(); return; } e.stopPropagation(); }, true);
})();

function viewInventory(){ return PT.view(); }
