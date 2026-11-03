/* Parsec · access · guards.js
   The guards on the shared functions (Parsec 13): setRoStatus, doStartPunch, deletePunch… are wrapped so a role that may not do it is refused with a toast before any page sees the click; permRootSync puts one class per missing action on <html> so the button is not even drawn.
   Flow: runs at load, wrapping the functions in place — keep this file after the functions it wraps in the manifest.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   permClickAct permSetField permRootSync setRoStatus PERM_CLICK (4 functions, 1 constant)
   state      punches
   uses       automations/ clock/ data/ import/ import/new-ro/ pages/ pages/rolist/ pages/triage/ ro/ ro-page/ shell/ state/
   at load    wraps setRoStatus · wraps doStartPunch · wraps editPunchCommit · wraps addManualPunch · wraps deletePunch · wraps updatePunchReasons · wraps shiftAddManual · wraps rcMove · wraps rcStopAt · wraps rcSh
*/
/* ---------- the guards on the shared functions (every page goes through these) ----------
   The app script is one function: these reassign its own functions, so every caller — and the test hook — gets the guarded one. */
(function(o){ setRoStatus = function(roId, status){ if(!AUTO_BY){ var ro = getRO(roId), a = ro && permRoStatusAct(ro, status); if(a && !permOk(a)) return false; } return o.apply(this, arguments); }; })(setRoStatus);
(function(o){ doStartPunch = function(roId){ if(!permOk("t.own")) return; if(!permReopenOk(getRO(roId))) return; return o.apply(this, arguments); }; })(doStartPunch);
(function(o){ editPunchCommit = function(p){ if(p && !can(permPunchAct(p))) return { ok: false, msg: permDenyMsg(permPunchAct(p)) }; return o.apply(this, arguments); }; })(editPunchCommit);
(function(o){ addManualPunch = function(f){ var a = permOwnName(f && f.by) ? "t.editown" : "t.editall"; if(!can(a)) return { ok: false, msg: permDenyMsg(a) }; return o.apply(this, arguments); }; })(addManualPunch);
(function(o){ deletePunch = function(id){ var p = (STATE.punches || []).filter(function(x){ return x.id === id; })[0]; if(p && !permPunchOk(p)) return false; return o.apply(this, arguments); }; })(deletePunch);
(function(o){ updatePunchReasons = function(id){ var p = (STATE.punches || []).filter(function(x){ return x.id === id; })[0]; if(p && !permPunchOk(p)) return false; return o.apply(this, arguments); }; })(updatePunchReasons);
(function(o){ shiftAddManual = function(day, tIn, tOut, who){ var a = permOwnName(who) ? "t.editown" : "t.editall"; if(!can(a)) return { ok: false, msg: permDenyMsg(a) }; return o.apply(this, arguments); }; })(shiftAddManual);
(function(o){ rcMove = function(p){ if(p && !can(permPunchAct(p))) return { ok: false, msg: permDenyMsg(permPunchAct(p)) }; return o.apply(this, arguments); }; })(rcMove);
(function(o){ rcStopAt = function(p){ if(p && !can(permPunchAct(p))) return { ok: false, msg: permDenyMsg(permPunchAct(p)) }; return o.apply(this, arguments); }; })(rcStopAt);
(function(o){ rcShiftIn = function(sh){ if(sh && !can(permShiftAct(sh))) return { ok: false, msg: permDenyMsg(permShiftAct(sh)) }; return o.apply(this, arguments); }; })(rcShiftIn);
(function(o){ ockFixSave = function(){ if(!permOk("t.editown")) return; return o.apply(this, arguments); }; })(ockFixSave);
(function(o){ ockReopen = function(c){ if(c && !permReopenOk(getRO(c.ro))) return; return o.apply(this, arguments); }; })(ockReopen);
(function(o){ tyOpSet = function(ro, op, nm){ if(!/^Complete/.test(nm || "") && !permReopenOk(ro)) return; return o.apply(this, arguments); }; })(tyOpSet);
(function(o){ tgRelease = function(){ if(!permOk("ro.release")) return; return o.apply(this, arguments); }; })(tgRelease);
(function(o){ money = function(){ return permCost() ? o.apply(this, arguments) : "\u2014"; }; })(money);
try{ if(typeof IMPX !== "undefined" && IMPX && IMPX.open){ (function(io){ IMPX.open = function(x){ if(!(x && (x.ro || x.target)) && !permOk("ro.new")) return; return io.apply(this, arguments); }; })(IMPX.open); } }catch(e){}
/* ---------- the clicks: a guarded button says why and does nothing (before any page sees the click) ---------- */
var PERM_CLICK = [
  ["ro.del", '[data-pg="rolist"] [data-a="pop"][data-p="bdel"], [data-pg="rolist"] [data-a="bdelgo"], [data-action="rl-opt"][data-k="delete"]'],
  ["ro.status", '[data-pg="rolist"] [data-a="pop"][data-p="bst"], [data-pg="rolist"] [data-a="bset"]'],
  ["ro.release", '[data-action="triage-release"], [data-action="tg-rl-go"]'],
  ["t.move", '[data-action="tx-open"], [data-action="tx-go"]'],
  ["t.approve", '[data-pg="timelog"] [data-a="tapprove"], [data-pg="timelog"] [data-a="treopen"]'],
  ["p.order", '[data-pg="parts"] [data-a="ogo"], [data-pg="parts"] [data-a="cgo"], [data-pg="parts"] [data-a="sosend"], [data-pg="parts"] [data-a="setst"][data-v="Ordered"], [data-pg="parts"] [data-a="setst"][data-v="Backordered"], [data-pg="inventory"] [data-a="ordered"]'],
  ["p.stock", '[data-pg="inventory"] [data-a="adjgo"], [data-pg="inventory"] [data-a="rcvgo"], [data-pg="inventory"] [data-a="newgo"], [data-pg="inventory"] [data-a="editgo"], [data-pg="inventory"] [data-a="delgo"], [data-pg="inventory"] [data-a="usemin"], [data-pg="inventory"] [data-a="kpick"], [data-pg="inventory"] [data-a="kdel"], [data-pg="inventory"] [data-a="csave"], [data-pg="inventory"] [data-a="pop"][data-p="adj"], [data-pg="inventory"] [data-a="pop"][data-p="rcv"], [data-pg="inventory"] [data-a="pop"][data-p="new"], [data-pg="inventory"] [data-a="pop"][data-p="edit"], [data-pg="inventory"] [data-a="pop"][data-p="del"], [data-pg="parts"] [data-a="pullahead"]'],
  ["w.claim", '[data-action="wa-st"], [data-action="wa-go"], [data-action="wa-do"], [data-action="wa-stgo"], [data-action="wa-stmatch"], [data-action="wa-covpick"], [data-action="wa-gw"], [data-action="wa-snz-pick"], [data-action="wa-causal"], [data-action="wa-fix"], [data-action="wa-ptag"], [data-action="wa-ptags"], [data-action="wa-pshelf"], [data-action="wa-wake"]'],
  ["a.settings", '[data-action="open-automations"], [data-action^="am-"], [data-action="fm-cfg"], [data-action="fm-bt"]'],
  ["a.data", '[data-action="export-json"], [data-action="export-csv"], [data-action="open-restore"], [data-action="px-restore-file"], [data-action="restore-backup"], [data-action="clear-sample"], [data-action="load-sample"], [data-action="demo-team"], [data-action="fs-pick"], [data-action="phone-sync"], [data-action="sample-25"], [data-action="pdx-export"], [data-action="pdx-rt"], [data-action="pdx-tombs"]']
];
function permClickAct(el){
  if(!el || !el.closest) return null;
  for(var i = 0; i < PERM_CLICK.length; i++){ var m = null; try{ m = el.closest(PERM_CLICK[i][1]); }catch(e){} if(m) return PERM_CLICK[i][0]; }
  return null;
}
window.addEventListener("click", function(e){
  if(typeof can !== "function" || !viewAsStaff()) return;                 /* the Admin: everything */
  var el = e.composedPath ? e.composedPath()[0] : e.target; if(el && el.nodeType !== 1) el = el.parentElement;
  var a = permClickAct(el); if(!a || can(a)) return;
  e.preventDefault(); e.stopImmediatePropagation(); permDeny(a);
}, true);
/* the shop's settings typed in: the shop day's hours on the Foreman page, the labor rate */
function permSetField(t){ return !!(t && t.dataset && (/^c-/.test(t.dataset.fmIn || "") || t.dataset.bind === "labor-rate")); }
["change", "input"].forEach(function(ev){ window.addEventListener(ev, function(e){
  if(typeof can !== "function" || !viewAsStaff() || can("a.settings")) return;
  var t = e.target; if(!permSetField(t)) return;
  e.stopImmediatePropagation(); if(ev === "change"){ permDeny("a.settings"); try{ render(); }catch(er){} }
}, true); });
/* ---------- what you can't do isn't on the screen: one class per missing action on <html> ---------- */
function permRootSync(){
  var R = document.documentElement; if(!R || typeof can !== "function") return;
  permActKeys().forEach(function(k){ var c = "pm-no-" + k.replace(/\./g, "-"), off = !can(k); if(R.classList.contains(c) !== off) R.classList.toggle(c, off); });
}
(function(r0){ render = function(){ var x = r0.apply(this, arguments); try{ permRootSync(); }catch(e){} return x; }; })(render);

function setRoStatus(roId, status, sub, force){
  var ro = getRO(roId); if(!ro) return;
  var opt = roStatusOption(status); if(!opt) return;
  if(/^Complete/.test(status) && !force){
    var gaps = roCompleteGaps(ro, status);
    if(gaps.length){ pushToast("RO " + tgNum(ro) + " can\u2019t be completed yet \u2014 " + gaps.join(" \u00b7 ") + "."); return false; }
  }
  pushUndo("RO status");
  var prevSt = roStatus(ro);
  ro.status = { status: status, sub: (opt.subs.indexOf(sub) >= 0 || /waiting on parts$/.test(sub || "") ? sub : null), setAt: nowIso() };
  if(!AUTO_BY) roStatusPicked(ro, prevSt.status, status);   /* Parsec 12.9: it holds; a completed RO set back to open asks about its operations */
  if(typeof audit === "function") audit("status", roLabel(ro) + ": " + prevSt.status + (prevSt.sub ? " \u00b7 " + prevSt.sub : "") + " \u2192 " + status + (ro.status.sub ? " \u00b7 " + ro.status.sub : ""), ro);
  markStatusFlip(ro);
  scheduleSave(true);
  return true;
}
