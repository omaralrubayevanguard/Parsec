/* Parsec · pages/foreman · floor-extras.js
   On the floor (Parsec 10): drag a truck to a free bay or Move truck, the bay that fits, how long a blocker has waited, the tech's day before you assign, the readiness count.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pmDragClear pmMarkBays pmEndDrag pmMoveMenu v10Fit v10Age v10TechCap v10Ready (8 functions)
   uses       kit/ pages/ pages/triage/ ro/ shell/ state/
   at load    on document pointerdown · on document pointermove · on document pointerup · on document pointercancel · 3× on document keydown · on window blur · 2× on document click · on document dragstart · on docu
*/
/* ---------- moving a truck: drag it to a free bay, or Move truck ---------- */
function pmDragClear(){ document.documentElement.classList.remove("pm-dragging"); document.querySelectorAll(".pm-ok,.pm-no").forEach(function(n){ n.classList.remove("pm-ok", "pm-no"); }); }
function pmMarkBays(){ document.documentElement.classList.add("pm-dragging"); document.querySelectorAll("#app .fm-bay").forEach(function(n){ n.classList.add(n.classList.contains("free") ? "pm-ok" : "pm-no"); }); }
document.addEventListener("pointerdown", function(e){
  if(e.button !== 0 || e.pointerType === "touch" || UI.view !== "foreman") return;
  var n = e.target.closest && e.target.closest(".fm-bay[data-fm-drag]"); if(!n || e.target.closest("button, a, input")) return;
  e.preventDefault(); try{ n.focus({ preventScroll: true }); }catch(x){}
  MI.drag = { id: n.getAttribute("data-ro"), x: e.clientX, y: e.clientY, node: n, pointer: e.pointerId, ghost: null };
  try{ n.setPointerCapture(e.pointerId); }catch(x){}
  pkHide(true);
}, true);
document.addEventListener("pointermove", function(e){
  var d = MI.drag; if(!d || e.pointerId !== d.pointer) return;
  if(!d.ghost && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 7) return;
  e.preventDefault();
  if(!d.ghost){
    var v = d.node.querySelector(MI_ICON), r = v ? v.getBoundingClientRect() : { left: e.clientX - 18, top: e.clientY - 14, width: 36, height: 28 };
    d.ghost = document.createElement("div"); d.ghost.className = "pm-flight" + (v ? "" : " chip"); d.ghost.setAttribute("aria-hidden", "true");
    d.ghost.innerHTML = v ? v.innerHTML : esc(tgNum(getRO(d.id) || {}));
    d.ghost.style.cssText = "left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;height:" + r.height + "px";
    document.body.appendChild(d.ghost); d.node.classList.add("src"); pmMarkBays();
  }
  d.ghost.style.transform = "translate(" + (e.clientX - d.x) + "px," + (e.clientY - d.y) + "px)";
  var hit = document.elementFromPoint(e.clientX, e.clientY), bay = hit && hit.closest && hit.closest(".fm-bay.free[data-fm-drop]");
  document.querySelectorAll(".fm-bay.over").forEach(function(n){ if(n !== bay) n.classList.remove("over"); }); if(bay) bay.classList.add("over");
}, { capture: true, passive: false });
function pmEndDrag(e, cancel){
  var d = MI.drag; if(!d || e.pointerId !== d.pointer) return; MI.drag = null;
  try{ d.node.releasePointerCapture(d.pointer); }catch(x){}
  d.node.classList.remove("src"); pmDragClear(); document.querySelectorAll(".fm-bay.over").forEach(function(n){ n.classList.remove("over"); });
  if(!d.ghost) return;
  MI.noClick = Date.now() + 400; var rect = d.ghost.getBoundingClientRect();
  var hit = cancel ? null : document.elementFromPoint(e.clientX, e.clientY), bay = hit && hit.closest && hit.closest(".fm-bay.free[data-fm-drop]");
  if(bay){ d.ghost.remove(); MI.rel = { id: d.id, rect: rect }; fmMoveTo(d.id, bay.getAttribute("data-fm-drop")); return; }
  /* nowhere to land: it flies home */
  var v = d.node.isConnected ? d.node.querySelector(MI_ICON) : null, home = v ? v.getBoundingClientRect() : null, g = d.ghost;
  if(home && pmMotion()){ var a = g.animate([{ transform: g.style.transform || "none" }, { transform: "translate(" + (home.left - parseFloat(g.style.left)) + "px," + (home.top - parseFloat(g.style.top)) + "px)" }], { duration: 180, easing: "cubic-bezier(.2,.75,.25,1)" }); a.onfinish = a.oncancel = function(){ g.remove(); }; }
  else g.remove();
}
document.addEventListener("pointerup", function(e){ pmEndDrag(e, false); }, true);
document.addEventListener("pointercancel", function(e){ pmEndDrag(e, true); }, true);
document.addEventListener("keydown", function(e){ if(e.key === "Escape" && MI.drag){ pmEndDrag({ pointerId: MI.drag.pointer }, true); e.preventDefault(); e.stopImmediatePropagation(); } }, true);
window.addEventListener("blur", function(){ if(MI.drag) pmEndDrag({ pointerId: MI.drag.pointer }, true); });
document.addEventListener("click", function(e){ if(Date.now() < MI.noClick){ e.preventDefault(); e.stopImmediatePropagation(); } }, true);
document.addEventListener("dragstart", function(e){ if(MI.drag){ e.preventDefault(); e.stopImmediatePropagation(); return; } var n = e.target.closest && e.target.closest("[data-fm-drag]"); if(n && UI.view === "foreman") pmMarkBays(); }, true);
document.addEventListener("dragend", pmDragClear);
document.addEventListener("drop", function(){ setTimeout(pmDragClear, 0); });
/* a bay (or yard spot) opens with Enter or Space, like a button */
document.addEventListener("keydown", function(e){ var t = e.target; if(!t || !t.matches || !t.matches(".fm-bay[data-ro], .tg-s[data-ro]")) return;
  if(e.key === "Enter" || e.key === " "){ e.preventDefault(); e.stopImmediatePropagation(); t.click(); } }, true);
/* Search keeps Tab in its box */
document.addEventListener("keydown", function(e){ if(!UI || !UI.palette || e.key !== "Tab") return; e.preventDefault(); var q = document.getElementById("pal-q"); if(q) q.focus(); }, true);
/* Move truck: the open bays, the ones that fit the job first, with Undo after */
function pmMoveMenu(id, back){
  var ro = getRO(id || UI.fmSel); if(!ro) return;
  var bays = fmFreeBays(ro), need = fmBayOn() ? fmBayNeed(ro) : null, from = tgSpotOf(ro), d = document.createElement("dialog");
  d.className = "pmv"; d.setAttribute("aria-labelledby", "pmv-h");
  d.innerHTML = '<div class="pmv-h"><div><div class="pmv-eb"><span class="mono">' + esc(roLabel(ro)) + '</span> · ' + esc(from ? "now in " + tgSpotLbl(from) : "not in a bay") + '</div><h2 id="pmv-h">Move truck</h2><p>' + (need ? 'This job needs ' + esc(FM_NEEDTXT[need[0]]) + ' — bays that have it come first.' : 'Pick an open bay. Undo puts it back.') + '</p></div><button type="button" class="pmv-x" aria-label="Close">×</button></div>'
    + '<div class="pmv-g">' + (bays.length ? bays.map(function(b){ var bt = fmBayTxt(b), ok = !need || fmBayFits(b, ro);
      return '<button type="button" class="pmv-b' + (need ? (ok ? ' ok' : ' no') : '') + '" data-pmv="' + esc(b) + '"><b>' + esc(tgSpotLbl(b)) + '</b><small>' + esc(bt || tgZone(b) || "Bay") + '</small>' + (need ? '<em>' + (ok ? '✓ Fits' : 'No ' + esc(FM_NEEDNO[need[0]])) + '</em>' : '') + '</button>'; }).join('') : '<p class="pmv-none">No bay is open right now — free one first.</p>') + '</div>';
  var focus = back || document.activeElement;
  d.addEventListener("keydown", function(e){ e.stopPropagation(); });
  d.addEventListener("click", function(e){ if(e.target === d){ d.close(); return; } var b = e.target.closest("button"); if(!b) return;
    var s = b.getAttribute("data-pmv"); if(s){ if(yardMap().map[s]){ pushToast("That bay just filled — pick another."); return; } d.close(); fmMoveTo(ro.id, s); } else d.close(); });
  d.addEventListener("close", function(){ d.remove(); try{ if(focus && focus.isConnected) focus.focus({ preventScroll: true }); }catch(x){} });
  document.body.appendChild(d); try{ d.showModal(); }catch(x){ d.setAttribute("open", ""); }
  var f = d.querySelector(".pmv-b.ok, .pmv-b"); if(f) try{ f.focus(); }catch(x){}
}
document.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest("[data-pm-move]"); if(!b) return; e.preventDefault(); e.stopImmediatePropagation(); pmMoveMenu(b.getAttribute("data-pm-move"), b); }, true);

/* ---------- the bay that fits: said in the Foreman header ---------- */
function v10Fit(ro){ try{ if(!ro || ro.isTech || !fmBayOn()) return ''; var n = fmBayNeed(ro); if(!n) return ''; var s = tgSpotOf(ro);
  if(fmIsBay(s)) return fmBayFits(s, ro) ? '<span class="v10-fit ok" title="This job needs ' + esc(FM_NEEDTXT[n[0]]) + '">✓ ' + esc(tgSpotLbl(s)) + ' fits</span>' : '<span class="v10-fit no" title="This job needs ' + esc(FM_NEEDTXT[n[0]]) + '">' + esc(tgSpotLbl(s)) + ' has no ' + esc(FM_NEEDNO[n[0]]) + '</span>';
  var F = fmFreeBays(ro).filter(function(b){ return fmBayFits(b, ro); });
  return '<span class="v10-fit" title="This job needs ' + esc(FM_NEEDTXT[n[0]]) + '">Needs ' + esc(FM_NEEDTXT[n[0]]) + (F.length ? ' · ' + esc(F.slice(0, 3).map(tgSpotLbl).join(", ")) + ' open' : ' · none open') + '</span>'; }catch(e){ return ''; } }

/* ---------- how long a blocker has waited: neutral, amber near its follow-up time, red past it ---------- */
function v10Age(ro){ try{ if(!ro || ro.isTech) return ''; var h = tgHold(ro); if(!h.goal || !h.held) return ''; var r = h.held / h.goal; if(r < .5) return '';
  return '<span class="v10-age' + (r >= 1 ? ' b' : r >= .75 ? ' w' : '') + '" title="With ' + esc(h.who) + ' · ' + tgShortDur(h.held) + ' · follow up after ' + tgShortDur(h.goal) + (r >= 1 ? ' — overdue' : r >= .75 ? ' — due soon' : '') + '">' + tgShortDur(h.held) + '</span>'; }catch(e){ return ''; } }

/* ---------- the technician's day, before you assign: hours booked, this job, and what's left ---------- */
function v10TechCap(k, ro){ try{ var left = fmHoursLeft(k), work = fmWorkOf(k), job = fmLeft(ro), tot = Math.max(left, work + job, .1), over = work + job > left;
  var r1 = function(v){ return Math.round(v * 10) / 10; };
  return '<span class="v10-cap" title="' + esc(tgFirst(k)) + ': ' + r1(work) + ' h booked + ' + r1(job) + ' h this job, ' + r1(left) + ' h left today"><span class="bar"><i style="width:' + Math.min(100, work / tot * 100).toFixed(0) + '%"></i><i class="' + (over ? 'o' : 'n') + '" style="width:' + Math.min(100, job / tot * 100).toFixed(0) + '%"></i></span><span class="t">+' + r1(job) + ' h this job' + (over ? ' · ' + r1(work + job - left) + ' h over' : ' · ' + r1(Math.max(0, left - work - job)) + ' h left') + '</span></span>'; }catch(e){ return ''; } }

/* ---------- the readiness count on Release: how many checks, how many left ---------- */
function v10Ready(done, n){ var left = n - done; return '<span class="v10-rb"><span class="bar"><i style="width:' + (n ? done / n * 100 : 0).toFixed(0) + '%"></i></span><span class="v10-rl' + (left ? '' : ' ok') + '">' + (left ? left + ' to go' : 'All done') + '</span></span>'; }
