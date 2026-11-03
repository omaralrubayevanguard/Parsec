/* Parsec · ro-page · release-bypass.js
   Release without checks: the truck card's way past the truck checks, with a reason and an Activity line.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ropBypassRel ropBypassOk ropBypassOpen ropBypassBtn ropBypassAsk ropBypassGo ropBypassLine ROP_BYW (7 functions, 1 constant)
   uses       access/ data/ kit/ pages/triage/ ro/ shell/ state/
*/
/* ---------- Release without checks: the truck card's way past the truck checks — complete and release, with a reason ---------- */
var ROP_BYW = ['Customer is waiting', 'Checked on paper', 'Not needed for this job'];
function ropBypassRel(ro) { var s = ''; try { s = roStatus(ro).status || ''; } catch (e) {} return s === 'Complete – Released' || !!ro.dateClosed; }
function ropBypassOk() {
  try { if (!RO || RO.shop || ropBypassRel(RO) || !(trxBtnsOk(RO) || (!rtNeeded(RO) && !RO.dateClosed && tyCat(RO) !== 'arr'))) return false;   /* 17.3: with no road test, it's the way to release */ return typeof can !== 'function' || can('ro.release'); } catch (e) { return false; }
}
/* what Release without checks skips: the release checks that aren't done, and the hand-ticked ones (keys, clean) */
function ropBypassOpen(ro) {
  var L = [];
  try { tgRelChecks(ro).forEach(function (c) { if (!c.ok) L.push([c.t, c.d || '']); }); } catch (e) {}
  try { var rs = releaseState(ro); v141Hand(ro).forEach(function (x) { if (!rs[x[0]]) L.push([x[1], '']); }); } catch (e) {}
  return L;
}
function ropBypassBtn() {
  var noRt = typeof rtNeeded === 'function' && !rtNeeded(RO);   /* 17.3: no road test — no truck checks to skip, just Release */
  return el('button', { class: 'px-btn px-btn--sm rop-byb' + (noRt ? ' px-btn--primary' : ''), type: 'button', title: noRt ? 'Release the truck — no road test or truck checks on this RO; asks why if anything is still open' : 'Complete and release the truck without the truck checks — asks why', html: pxI('release', 14) + (noRt ? 'Release' : 'Release without checks'), onClick: function (e) { e.stopPropagation(); ropBypassAsk(); } });
}
function ropBypassAsk() {
  var ro = RO; if (!ro || !ropBypassOk()) return;
  var open = ropBypassOpen(ro), pick = { why: '', other: '' };
  var skip = el('div', { class: 'rop-bys' }, [el('div', { class: 'rop-bysh', text: open.length ? 'This skips' : 'Nothing is open — it releases straight away' })].concat(open.map(function (x) {
    return el('div', { class: 'rop-bysi', html: '<i></i><span><b>' + esc(x[0]) + '</b>' + (x[1] ? '<small>' + esc(x[1]) + '</small>' : '') + '</span>' }); })));
  var txt = el('input', { class: 'px-input rop-byo', placeholder: 'Say why', 'aria-label': 'Why — in your own words', hidden: true });
  var chips = el('div', { class: 'rop-byc', role: 'radiogroup', 'aria-label': 'Why' });
  var setOn = function (b) { Array.prototype.forEach.call(chips.children, function (c) { c.classList.toggle('is-on', c === b); c.setAttribute('aria-checked', c === b ? 'true' : 'false'); }); };
  ROP_BYW.concat(['Other…']).forEach(function (w) {
    var b = el('button', { class: 'rop-bych', type: 'button', role: 'radio', 'aria-checked': 'false', text: w, onClick: function (e) { e.stopPropagation(); setOn(b); chips.classList.remove('is-ask');
      if (w === 'Other…') { pick.why = ''; txt.hidden = false; setTimeout(function () { try { txt.focus(); } catch (er) {} }, 10); } else { pick.why = w; txt.hidden = true; } } });
    chips.appendChild(b);
  });
  txt.addEventListener('input', function () { pick.other = txt.value; });
  txt.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); var b = PXM && PXM.submit; if (b) b.click(); } });
  var noRt = typeof rtNeeded === 'function' && !rtNeeded(ro);
  if (noRt && !open.length) { chips.hidden = true; }
  pxModal({ title: noRt ? (open.length ? 'Release anyway?' : 'Release the truck?') : 'Release without checks', sub: (typeof ropNo === 'function' ? ropNo() + ' · ' : '') + (noRt ? 'no road test or truck checks on this RO — ' : '') + 'completes the RO and releases the truck', size: 'sm', submit: noRt ? (open.length ? 'Release anyway' : 'Release') : 'Release without checks', hintWord: 'to release',
    body: noRt && !open.length ? [skip] : [skip, el('div', { class: 'rop-bywl', text: 'Why?' }), chips, txt],
    run: function () {
      var why = pick.why || String(pick.other || '').trim();
      if (noRt && !open.length) return ropBypassGo(ro, 'No road test on this RO — nothing open', open);
      if (!why) { chips.classList.add('is-ask'); (txt.hidden ? chips : txt).focus && (txt.hidden ? chips.querySelector('button') : txt).focus(); return false; }
      return ropBypassGo(ro, why, open);
    } });
}
function ropBypassGo(ro, why, open) {
  if (typeof can === 'function' && !can('ro.release')) { try { permOk('ro.release'); } catch (e) {} return false; }
  var P0 = UI.tgPop, R0 = UI.tgRL;
  UI.tgPop = { ro: ro.id }; UI.tgRL = { reason: 'Released without checks — ' + why, why: why, to: -1 };
  try { tgRelease(true); } catch (e) { console.error(e); }
  if (!ropBypassRel(ro)) { UI.tgPop = P0; UI.tgRL = R0; toast('It didn’t release — check the RO’s status.'); return false; }
  /* after tgRelease's Undo point, so one Undo takes all of it back */
  ro.trxBypass = { by: (typeof tgMe === 'function' ? tgMe() : ''), at: nowIso(), why: why, open: (open || []).map(function (x) { return x[0]; }) };
  try { scheduleSave(true); } catch (e) {}
  render(); tecRender();
  return true;
}
/* afterwards, on the truck card (and Truck checks): who let it go, and why */
function ropBypassLine(ro) {
  var b = ro && ro.trxBypass; if (!b) return null;
  return el('div', { class: 'rop-byp', title: (b.open && b.open.length ? 'Skipped: ' + b.open.join(', ') : 'Nothing was open') + ' · ' + (b.at ? fmtTime(b.at) : ''), html: pxI('release', 13) + '<span><b>Released without checks</b> · ' + esc(String(b.by || '').split(' ')[0]) + ' · ' + esc(b.why || '') + '</span>' });
}
