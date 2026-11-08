/* Parsec · ro-page · release-bypass.js
   The RO page's Release button (it opens Release, which asks why while checks are open) and the line an older RO released without checks still shows.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ropBypassRel ropBypassOk ropBypassBtn ropBypassLine (4 functions)
   uses       access/ kit/ pages/triage/ ro/
*/
/* ---------- Release on the RO page (17.5: one Release button; Release asks why while the checks are open). ro.trxBypass is an older RO's
   “released without checks” record — ropBypassLine still shows it ---------- */
function ropBypassRel(ro) { var s = ''; try { s = roStatus(ro).status || ''; } catch (e) {} return s === 'Complete – Released' || !!ro.dateClosed; }
function ropBypassOk() {
  try { if (!RO || RO.shop || ropBypassRel(RO) || !(trxBtnsOk(RO) || (!rtNeeded(RO) && !qcNeeded(RO) && !RO.dateClosed && tyCat(RO) !== 'arr'))) return false;   /* 17.3: with no road test, it's the way to release */ return typeof can !== 'function' || can('ro.release'); } catch (e) { return false; }
}
function ropBypassBtn() {   /* 17.5: one Release button — it opens Release, which asks why when the checks are still open */
  var ready = false; try { ready = (!rtNeeded(RO) || trxPassed(RO)) && (!qcNeeded(RO) || trxQcDone(RO)); } catch (e) {}
  return el('button', { class: 'px-btn px-btn--sm rop-byb' + (ready ? ' px-btn--primary' : ''), type: 'button', title: ready ? 'Release the truck — completes the RO' : 'Release the truck — asks why while checks are still open', html: pxI('release', 14) + 'Release', onClick: function (e) { e.stopPropagation(); trxOpen('release', RO.id); } });
}
function ropBypassLine(ro) {
  var b = ro && ro.trxBypass; if (!b) return null;
  return el('div', { class: 'rop-byp', title: (b.open && b.open.length ? 'Skipped: ' + b.open.join(', ') : 'Nothing was open') + ' · ' + (b.at ? fmtTime(b.at) : ''), html: pxI('release', 13) + '<span><b>Released without checks</b> · ' + esc(String(b.by || '').split(' ')[0]) + ' · ' + esc(b.why || '') + '</span>' });
}
