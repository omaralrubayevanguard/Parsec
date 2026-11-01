/* ============================== Parsec 10 ==============================
   From ChatGPT's file, with the shop's own data: the micro-interactions (RO switching, moving a truck with
   a drag or Move truck, the repair-progress segment and its Undo, quick search), and the next eight: a quick
   peek on the Foreman floor, how long each blocker has waited, the bay that fits, the technician's day before
   assigning, saved views on the RO list, the shift handover, notes on the truck and the readiness count.
   Motion stays small (140–240 ms) and stops when the computer asks for less. */

/* ---------- motion ---------- */
var MI = { rects: {}, sel: null, det: null, stages: {}, palOpen: false, palFocus: null, drag: null, rel: null, noClick: 0 };
function pmMotion(){ return !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
function pmAnimate(node, frames, ms){ if(node && node.animate && pmMotion()) try{ node.animate(frames, { duration: ms || 180, easing: "cubic-bezier(.2,.75,.25,1)" }); }catch(e){} }
var MI_ICON = ":scope > .fm-ti, :scope > .tg-tv";
/* before a draw: where each truck sits now (its bay or spot, and where its picture is on the screen) */
function pmBeforeRender(){
  MI.rects = {};
  document.querySelectorAll("#app .fm-bay[data-ro], #app .tg-s[data-ro]").forEach(function(n){
    var id = n.getAttribute("data-ro"), v = n.querySelector(MI_ICON); if(!v || !id) return;
    MI.rects[id] = { rect: MI.rel && MI.rel.id === id ? MI.rel.rect : v.getBoundingClientRect(), spot: n.getAttribute("data-pm-spot") || "", html: v.innerHTML, cls: v.className };
  });
  if(!UI.palette) MI.palFocus = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;
}
/* after a draw: the header eases in when the RO changes; a truck that changed bays flies there; Search gets its labels */
function pmAfterRender(){
  var key = UI.view + "|" + (UI.view === "foreman" ? UI.fmSel : UI.view === "triage" ? UI.tgSel : UI.selectedRo);
  if(MI.sel !== null && MI.sel !== key && MI.sel.split("|")[0] === UI.view) pmAnimate(document.querySelector("#app .tg-top, #app .tg-dkh"), [{ opacity: .45, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], 180);
  MI.sel = key;
  document.querySelectorAll("#app .fm-bay[data-ro], #app .tg-s[data-ro]").forEach(function(n){
    var id = n.getAttribute("data-ro"), ro = getRO(id); if(!ro) return;
    var spot = tgSpotOf(ro), v = n.querySelector(MI_ICON), prev = MI.rects[id]; n.setAttribute("data-pm-spot", spot);
    if(!prev || !v || !prev.spot || prev.spot === spot || !pmMotion()) return;
    var now = v.getBoundingClientRect(), old = prev.rect;
    if(!now.width || !old.width || now.bottom < 0 || old.bottom < 0) return;
    var g = document.createElement("div"); g.className = "pm-flight"; g.setAttribute("aria-hidden", "true"); g.innerHTML = prev.html;
    g.style.cssText = "left:" + old.left + "px;top:" + old.top + "px;width:" + old.width + "px;height:" + old.height + "px";
    document.body.appendChild(g); v.style.visibility = "hidden";
    var dx = now.left - old.left + (now.width - old.width) / 2, dy = now.top - old.top + (now.height - old.height) / 2;
    var a = g.animate([{ transform: "translate(0,0) scale(1)", opacity: .92 }, { transform: "translate(" + dx / 2 + "px," + (dy / 2 - 12) + "px) scale(1.12)", offset: .5 }, { transform: "translate(" + dx + "px," + dy + "px) scale(1)", opacity: 1 }], { duration: 240, easing: "cubic-bezier(.2,.75,.25,1)" });
    var done = function(){ g.remove(); v.style.visibility = ""; }; a.onfinish = done; a.oncancel = done;
    pmAnimate(n, [{ boxShadow: "inset 0 0 0 2px var(--tg-acc, #86643a)" }, { boxShadow: "inset 0 0 0 0 transparent" }], 480);
  });
  /* Search: a combobox and its list, read out as such; it eases in; closing it puts focus back */
  var open = !!UI.palette;
  if(open){
    var inp = document.getElementById("pal-q"), list = document.querySelector(".pal-list"), rows = document.querySelectorAll(".pal-row");
    if(list) list.id = "pm-search-results";
    rows.forEach(function(r, i){ r.id = "pm-search-" + i; r.tabIndex = -1; });
    if(inp){ inp.setAttribute("role", "combobox"); inp.setAttribute("aria-expanded", "true"); inp.setAttribute("aria-autocomplete", "list"); inp.setAttribute("aria-controls", "pm-search-results");
      if(rows[UI.palette.sel]){ inp.setAttribute("aria-activedescendant", rows[UI.palette.sel].id); try{ rows[UI.palette.sel].scrollIntoView({ block: "nearest" }); }catch(e){} } else inp.removeAttribute("aria-activedescendant"); }
    if(!MI.palOpen){ pmAnimate(document.querySelector(".pal"), [{ opacity: 0, transform: "translateY(-6px) scale(.985)" }, { opacity: 1, transform: "none" }], 140); pmAnimate(document.querySelector(".pal-wrap"), [{ opacity: 0 }, { opacity: 1 }], 140); }
  } else if(MI.palOpen && MI.palFocus && MI.palFocus.isConnected){ try{ MI.palFocus.focus({ preventScroll: true }); }catch(e){} }
  MI.palOpen = open;
  MI.rel = null; if(!MI.drag) pmDragClear();
  if(UI.view !== "foreman") pkHide(true);
}
/* the RO page: its header eases in when you switch ROs; a stage's segment fills when it's checked off */
function pmDetailRendered(root, ro){
  if(!root || !ro) return;
  if(MI.det !== null && MI.det !== ro.id) pmAnimate(root.querySelector(".px-trk, .px-titleblock"), [{ opacity: .45, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], 180);
  MI.det = ro.id;
  root.querySelectorAll("[data-pm-stage]").forEach(function(n){
    var id = ro.id + "|" + n.getAttribute("data-pm-stage"), done = n.classList.contains("is-done");
    if(MI.stages[id] !== undefined && MI.stages[id] !== done) pmAnimate(n.querySelector("i"), done ? [{ transform: "scaleX(.12)", opacity: .4 }, { transform: "scaleX(1)", opacity: 1 }] : [{ transform: "scaleX(1)", opacity: 1 }, { transform: "scaleX(.12)", opacity: .4 }, { transform: "scaleX(1)", opacity: 1 }], 220);
    MI.stages[id] = done;
  });
}
/* checking a stage off says so, with Undo while it's still the last thing done */
function pmStageNotice(ro, k){
  var entry = UNDO[UNDO.length - 1];
  setTimeout(function(){ if(UNDO[UNDO.length - 1] !== entry) return; var M = roStages(ro), x = M && M.list.filter(function(s){ return s.k === k; })[0];
    pushToast((x ? x.name : (typeof RS_NAME !== "undefined" && RS_NAME[k]) || "Stage") + (x && x.state === "d" ? " checked off." : " reopened."), true); }, 0);
}
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
  return '<span class="v10-cap" title="' + esc(tgFirst(k)) + ': ' + r1(work) + ' h booked + ' + r1(job) + ' h this job, ' + r1(left) + ' h left today"><span class="bar"><i style="width:' + Math.min(100, work / tot * 100).toFixed(0) + '%"></i><i class="' + (over ? 'o' : 'n') + '" style="width:' + Math.min(100, job / tot * 100).toFixed(0) + '%"></i></span><span class="t">' + r1(work + job) + ' / ' + r1(left) + ' h' + (over ? ' · ' + r1(work + job - left) + ' over' : '') + '</span></span>'; }catch(e){ return ''; } }

/* ---------- the readiness count on Release: how many checks, how many left ---------- */
function v10Ready(done, n){ var left = n - done; return '<span class="v10-rb"><span class="bar"><i style="width:' + (n ? done / n * 100 : 0).toFixed(0) + '%"></i></span><span class="v10-rl' + (left ? '' : ' ok') + '">' + (left ? left + ' to go' : 'All done') + '</span></span>'; }

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
