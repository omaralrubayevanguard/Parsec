/* Parsec · ro · reopen-question.js
   The question when a completed RO is set back to open: reopen its operations too, or just the RO.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   roReopenAsk roReopenClose roReopenKey roReopenShow roReopenAll permCost permOwnName permPunchAct permPunchOk permShiftAct permRoDone permReopenOk … (13 functions, 1 constant)
   uses       access/ clock/ data/ import/ pages/ pages/warranty/ ro-page/ shell/ state/
*/
/* ---------- the question: reopen its operations too, or just the RO ---------- */
var RO_REO = { q: [], t: null, el: null };
function roReopenAsk(ro){ if(RO_REO.q.indexOf(ro.id) < 0) RO_REO.q.push(ro.id); clearTimeout(RO_REO.t); RO_REO.t = setTimeout(roReopenShow, 40); }
function roReopenClose(){ if(RO_REO.el){ RO_REO.el.remove(); RO_REO.el = null; } RO_REO.q = []; document.removeEventListener("keydown", roReopenKey, true); }
function roReopenKey(e){
  if(!RO_REO.el) return;
  if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); roReopenClose(); return; }
  if(e.key === "Enter"){ var b = document.activeElement; if(b && RO_REO.el.contains(b) && b.tagName === "BUTTON") return; e.preventDefault(); e.stopPropagation(); roReopenAll(); return; }
  if(!/^(Tab|Shift)$/.test(e.key)) e.stopPropagation();                                  /* the page's own keys wait */
}
function roReopenShow(){
  var L = RO_REO.q.map(getRO).filter(function(ro){ return ro && roOpenName(roStatus(ro).status) && roDoneOps(ro).length; });
  if(!L.length){ roReopenClose(); return; }
  if(RO_REO.el) RO_REO.el.remove();
  var ops = []; L.forEach(function(ro){ roDoneOps(ro).forEach(function(op){ ops.push([ro, op]); }); });
  var one = L.length === 1, n = ops.length, E = function(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var head = one ? roLabel(L[0]) + " is open again" : L.length + " ROs are open again";
  var sub = (one ? "It" : "They") + " still " + (n === 1 ? "has 1 operation" : "have " + n + " operations") + " marked Complete. Reopen " + (n === 1 ? "it" : "them") + " too, so the clock can start?";
  var list = ops.slice(0, 6).map(function(x){ var i = (x[0].operations || []).indexOf(x[1]) + 1; return "<li><b>" + (one ? "" : E(roLabel(x[0])) + " · ") + "Op " + i + "</b><span>" + E(x[1].complaint || "Operation") + "</span></li>"; }).join("") + (n > 6 ? "<li><span>and " + (n - 6) + " more</span></li>" : "");
  var w = document.createElement("div"); w.className = "roreo"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", head);
  w.innerHTML = '<div class="roreo-c"><div class="roreo-h"><span class="roreo-i" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8.5 7.5L4.5 11.5l4 4"/><path d="M4.5 11.5h10a5 5 0 0 1 0 10h-3"/></svg></span><div><b>' + E(head) + '</b><p>' + E(sub) + '</p></div></div><ul class="roreo-l">' + list + '</ul>'
    + '<div class="roreo-a"><button type="button" class="roreo-b" data-roreo="ro">Just the RO</button><button type="button" class="roreo-b pri" data-roreo="all">Reopen ' + (n === 1 ? "the operation" : n === 2 ? "both operations" : "all " + n + " operations") + '</button></div></div>';
  w.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-roreo]");
    if(!b){ if(e.target === w) roReopenClose(); return; }
    if(b.getAttribute("data-roreo") === "all") roReopenAll(); else roReopenClose();
  });
  document.body.appendChild(w); RO_REO.el = w;
  document.addEventListener("keydown", roReopenKey, true);
  var pri = w.querySelector(".roreo-b.pri"); if(pri) try{ pri.focus({ preventScroll: true }); }catch(e){}
}
function roReopenAll(){
  var L = RO_REO.q.map(getRO).filter(Boolean), n = 0;
  roReopenClose();
  if(!L.length) return;
  pushUndo("reopen operations");
  L.forEach(function(ro){
    roDoneOps(ro).forEach(function(op){ opReopenMark(op, ro.id, "Hold tech"); op.jobStatus = { status: "Hold Tech", sub: null, setAt: nowIso(), hand: true }; n++; });
    if(ro.status && ro.status.hand) ro.status.base = roOpsKey(ro);                    /* the status you picked still holds */
  });
  OPREO_T = null;
  scheduleSave(true);
  try{ render(); }catch(e){} try{ if(typeof JC !== "undefined" && JC && JC.rerender) JC.rerender(); }catch(e){}
  pushToast((L.length === 1 ? roLabel(L[0]) + ": " : "") + n + " operation" + (n === 1 ? "" : "s") + " reopened — back to Hold tech. Start the clock when you’re on it.", true);
}

/* Parsec 13 (C) — the actions hold: each guarded thing checks can(act) where it happens, says why when it can't
   ("You can’t delete ROs — Tom or the Admin can change that on the Admin page.") and changes nothing.
   The Admin (no one signed in) and automations are never stopped. Built on b9/v130.js. */
function permCost(){ return typeof can !== "function" || can("p.cost"); }
/* fixing a punch: your own needs "Fix their own punches", someone else's "Fix anyone’s punches" */
function permOwnName(n){ try{ return !n || sameOwner(n, pcMe()); }catch(e){ return true; } }
function permPunchAct(p){ var own = true; try{ own = !p || permOwnName(punchOwner(p)); }catch(e){} return own ? "t.editown" : "t.editall"; }
function permPunchOk(p){ return permOk(permPunchAct(p)); }
function permShiftAct(sh){ var own = true; try{ own = !sh || permOwnName(shiftOwner(sh)); }catch(e){} return own ? "t.editown" : "t.editall"; }
/* an RO that's completed, released or closed opens again only for "Reopen a completed RO" */
function permRoDone(ro){ if(!ro || ro.shop || ro.id === SHOP_RO_ID) return false; var s = roStatus(ro).status || ""; return /^Complete/.test(s) || s === "Declined" || !!ro.dateClosed; }
function permReopenOk(ro){ if(typeof ro === "string") ro = getRO(ro); return !permRoDone(ro) || permOk("ro.reopen"); }
/* an RO status picked by hand: Released needs "Release a truck", a completed RO set back to open "Reopen a completed RO", anything else "Change an RO’s status" */
function permRoStatusAct(ro, status){
  var cur = roStatus(ro).status; if(cur === status) return null;
  if(status === "Complete – Released") return "ro.release";
  if(permRoDone(ro) && !/^Complete/.test(status) && status !== "Declined") return "ro.reopen";
  return "ro.status";
}
