/* ---------- Parsec 14.8 (A): Declined on the operation's status menu · the complaint changes in place ---------- */
/* Declined, the way the app declines an operation (op.declined): the totals, the roll-up, the lists and the money leave it out.
   Its clock (anyone's) stops first, as Hold Tech. One Undo; an Activity line. */
function ropDecline(j) {
  if (!j || j.declined) return;
  if (typeof permRoDone === 'function' && permRoDone(RO) && typeof permReopenOk === 'function' && !permReopenOk(RO)) return;
  pushUndo('decline operation');
  var n = 0, mine = typeof myRunOf === 'function' ? myRunOf(j) : null;
  if (mine) { stopClock(); mine.stopReason = 'Hold Tech'; n++; }
  STATE.punches.forEach(function (p) { if (p.opId === j.id && !p.stop) { p.stop = nowIso(); p.stopReason = 'Hold Tech'; try { creditBurnt(p); } catch (e) {} n++; } });
  j.declined = true; j.declinedBy = ropMe(); j.declinedAt = nowIso();
  try { audit('op-decline', roLabel(RO) + ': declined Op ' + ropN(j) + ' — ' + (j.complaint || 'Operation'), RO); } catch (e) {}
  save(true); render(); try { tecRender(); } catch (e) {}
  ropUndo('Op ' + ropN(j) + ' declined' + (n ? ' — its clock was stopped (Hold tech)' : '') + '.');
}
/* any other status picked on a declined operation brings it back */
function ropUndecline(j) {
  if (!j || !j.declined) return false;
  j.declined = false; delete j.declinedBy; delete j.declinedAt;
  try { audit('op-undecline', roLabel(RO) + ': Op ' + ropN(j) + ' is back — ' + (j.complaint || 'Operation'), RO); } catch (e) {}
  return true;
}
/* the number keys pick in the operation's status menu (1–9), like the RO's status picker */
function ropMenuKeys(pop) {
  var h = function (e) {
    if (!pop.isConnected) { document.removeEventListener('keydown', h, true); return; }
    if (e.ctrlKey || e.metaKey || e.altKey || !/^[1-9]$/.test(e.key)) return;
    var it = pop.querySelectorAll('.px-menu__item')[+e.key - 1]; if (!it) return;
    e.preventDefault(); e.stopPropagation(); document.removeEventListener('keydown', h, true); it.click();
  };
  document.addEventListener('keydown', h, true);
}
/* the meta line of a declined operation: who declined it (the pill already says Declined) */
function ropDecMeta(j) {
  if (!j.declined) return '';
  if (j.appr && j.appr.s === 'no') return 'Customer declined';
  return j.declinedBy ? 'by ' + ropFirst(j.declinedBy) : '';
}
/* a declined operation doesn't start: every Start on the RO page reads this, and toggleJobClock refuses with it */
function ropDecTip(j) { return 'Op ' + ropN(j) + ' is declined — pick another status to work on it'; }
