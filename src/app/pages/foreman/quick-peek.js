/* Parsec · pages/foreman · quick-peek.js
   The RO quick peek on the Foreman floor: hover or Tab to a bay for the truck, complaint and who has it.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pkOn pkHtml pkShow pkHide PK PK_PIN (4 functions, 2 constants)
   uses       access/ kit/ pages/ pages/triage/ ro/ shell/ state/ trucks/
   at load    on document mouseover · on document focusin · on document click · on document keydown · on window scroll
*/
/* ============================== RO quick peek (the Foreman floor) ==============================
   Hover or Tab to a bay: the truck, the complaint, who has it and what's next — without leaving the floor.
   Pin it to keep it open; Esc closes it. */
var PK = { id: null, pin: false, t: null, h: null };
var PK_PIN = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6l-1 6 4 4H6l4-4zM12 13v8"/></svg>';
function pkOn(){ return UI.view === "foreman" && document.documentElement.getAttribute("data-device") !== "phone" && !MI.drag; }
function pkHtml(ro){
  var I = roInfo(ro), x = null; try{ x = fmItemOf(ro.id); }catch(e){}
  var run = null; try{ run = fmRoRun(ro); }catch(e){}
  var next = x ? x.why : run ? tgFirst(punchWho(run) || ro.assignedTech || "The tech") + " is on it — " + tgDur(Date.now() - new Date(run.start).getTime()) + " so far" : (ro.route && ro.route.note) || "Nothing waiting on the foreman.";
  var N = (typeof trkNotesOf === "function" ? trkNotesOf(ro) : []).length;
  return '<div class="pk-h"><span class="mono">' + esc(roLabel(ro)) + '</span><span class="pk-sp"></span><button type="button" class="pk-pin' + (PK.pin ? ' on' : '') + '" data-pk="pin" aria-pressed="' + PK.pin + '" title="' + (PK.pin ? 'Unpin' : 'Pin it open') + '">' + PK_PIN + (PK.pin ? 'Pinned' : 'Pin') + '</button></div>'
    + '<div class="pk-pic">' + trkThumb(ro) + '</div><b class="pk-cu">' + esc(ro.customerName || "Customer") + '</b><div class="pk-v">' + esc(trkLabel(ro)) + (ro.unitNumber ? ' · Unit ' + esc(ro.unitNumber) : '') + '</div>'
    + '<div class="pk-g"><div><span>Technician</span><b>' + esc(ro.assignedTech || "No tech yet") + '</b></div><div><span>Stage</span><b>' + esc(tgStTxt(ro)) + '</b></div></div>'
    + (I.complaint ? '<div class="pk-c">' + esc(I.complaint) + '</div>' : '') + '<div class="pk-n"><span>Next</span>' + esc(next) + '</div>'
    + (I.q ? '<div class="pk-q"><span class="bar"><i style="width:' + Math.min(100, I.b / I.q * 100).toFixed(0) + '%"' + (I.b > I.q ? ' class="o"' : '') + '></i></span>' + I.b.toFixed(1) + ' of ' + I.q.toFixed(1) + ' h</div>' : '')
    + (N ? '<button type="button" class="pk-notes" data-pk="notes">' + N + ' note' + (N === 1 ? '' : 's') + ' on the truck</button>' : '')
    + '<button type="button" class="pk-open" data-pk="open">Open repair order <span aria-hidden="true">→</span></button>';
}
function pkShow(bay, id, now){
  if(!pkOn()) return; var ro = getRO(id); if(!ro) return;
  clearTimeout(PK.h); clearTimeout(PK.t);
  var go = function(){ if(!pkOn() || !bay.isConnected) return;
    var w = document.getElementById("v10-peek"), fresh = !w || PK.id !== id;
    if(!w){ w = document.createElement("div"); w.id = "v10-peek"; w.className = "pk"; w.setAttribute("role", "dialog"); w.setAttribute("aria-label", "Quick peek"); document.body.appendChild(w); }
    PK.id = id; w.innerHTML = pkHtml(ro);
    var r = bay.getBoundingClientRect(), pw = 300, ph = w.offsetHeight || 380, vw = window.innerWidth, vh = window.innerHeight;
    var left = r.right + 10 + pw <= vw - 8 ? r.right + 10 : Math.max(8, r.left - 10 - pw), top = Math.max(8, Math.min(vh - ph - 8, r.top - 6));
    w.style.left = left + "px"; w.style.top = top + "px";
    if(fresh) pmAnimate(w, [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], 140);
    try{ if(typeof trkHydrate === "function") trkHydrate(); }catch(e){} };
  if(now) go(); else PK.t = setTimeout(go, 380);
}
function pkHide(force){ clearTimeout(PK.t); if(PK.pin && !force) return; var w = document.getElementById("v10-peek"); if(w) w.remove(); PK.id = null; PK.pin = false; }
document.addEventListener("mouseover", function(e){
  if(!pkOn()) return; var t = e.target;
  if(t.closest && t.closest("#v10-peek")){ clearTimeout(PK.h); return; }
  var bay = t.closest && t.closest("#app .fm-bay[data-ro]");
  if(bay){ var id = bay.getAttribute("data-ro"); clearTimeout(PK.h); if(PK.pin && PK.id !== id) return; if(PK.id !== id) pkShow(bay, id); return; }
  clearTimeout(PK.t); if(!PK.pin && PK.id) PK.h = setTimeout(function(){ pkHide(); }, 160);
});
document.addEventListener("focusin", function(e){ var bay = e.target && e.target.matches && e.target.matches(".fm-bay[data-ro]") ? e.target : null; if(!bay || !pkOn()) return;
  try{ if(!bay.matches(":focus-visible")) return; }catch(x){} if(!PK.pin) pkShow(bay, bay.getAttribute("data-ro"), true); });
document.addEventListener("click", function(e){ var w = document.getElementById("v10-peek"); if(!w) return; var b = e.target.closest && e.target.closest("[data-pk]");
  if(b && w.contains(b)){ e.preventDefault(); e.stopPropagation(); var k = b.getAttribute("data-pk"), ro = getRO(PK.id);
    if(k === "pin"){ PK.pin = !PK.pin; if(ro) w.innerHTML = pkHtml(ro); }
    else if(k === "open" && ro){ pkHide(true); UI.view = "ros"; UI.selectedRo = ro.id; UI.roFilter = ""; UI.modal = null; render(); window.scrollTo(0, 0); }
    else if(k === "notes" && ro){ pkHide(true); trkInspOpen(ro); }
    return; }
  if(!w.contains(e.target) && !(e.target.closest && e.target.closest(".fm-bay[data-ro]"))) pkHide(true); }, true);
document.addEventListener("keydown", function(e){ if(e.key === "Escape" && document.getElementById("v10-peek")){ pkHide(true); } });
window.addEventListener("scroll", function(){ if(!PK.pin) pkHide(); }, true);
