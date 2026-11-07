/* Parsec · ro-page · rail-fold.js
   Folding the RO page's right column (17.3): a fold button at its top, a strip of icons when folded (a click opens it at that part), the \ key, remembered per page, folds by itself under 1 100 px.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   rfKey rfNarrow rfShut rfToggle rfStrip rfFoldBtn rfGoTo rfApply RF RF_NARROW RF_PARTS RF_W (8 functions, 4 constants)
   uses       access/ kit/ state/
   at load    on window resize · on document keydown
*/
/* ============================== folding the right column (Parsec 17.3) ==============================
   A fold button at the top of the column folds it to a strip of icons (status, contact, Shop, operations, vehicle, customer,
   people, schedule); a click on the strip brings the column back, scrolled to the part that was clicked. \ folds and opens it.
   Start Op and Release stay in the column. Each page remembers its own fold, on this computer (localStorage parsec.rf).
   Under 1 100 px wide the column folds by itself and opens again when the window is wider; opened by hand while narrow, it
   stays open until the window changes. */
var RF = { p: {}, tmp: {} };
try { RF.p = JSON.parse(localStorage.getItem('parsec.rf') || '{}') || {}; } catch (e) { RF.p = {}; }
var RF_NARROW = 1100;
function rfKey() { try { return String(UI.view || 'ros'); } catch (e) { return 'ros'; } }
function rfNarrow() { return window.innerWidth < RF_NARROW; }
function rfShut() { var k = rfKey(); return rfNarrow() ? !RF.tmp[k] : !!RF.p[k]; }
function rfToggle(to) {
  var k = rfKey(), now = rfShut(), want = to == null ? !now : !!to; if (want === now) return;
  if (rfNarrow()) RF.tmp[k] = !want;
  else { if (want) RF.p[k] = 1; else delete RF.p[k]; try { localStorage.setItem('parsec.rf', JSON.stringify(RF.p)); } catch (e) {} }
  rfApply(true);
}
/* the strip: what each icon opens to */
var RF_PARTS = [['clock', 'Status and stage', '.rp-top, .rp-hd'], ['phone', 'Contact', '.rop-ct'], ['play', 'Shop — Start Op, Release', '.rop-foot'], ['grid', 'Operations', '.rp-ops'],
  ['truck', 'Vehicle', '.rod-gh[data-rod-g=vehicle]'], ['customer', 'Customer', '.rod-gh[data-rod-g=customer]'], ['user', 'People', '.rod-gh[data-rod-g=people]'], ['calendar', 'Schedule', '.rod-gh[data-rod-g=schedule]']];
function rfStrip() {
  var s = el('div', { class: 'rop-fstrip', role: 'toolbar', 'aria-label': 'The RO’s details, folded' });
  s.appendChild(el('button', { class: 'rop-fsb rop-fsopen', type: 'button', title: 'Open the details (\\)', 'aria-label': 'Open the details', html: ri('chevL', 15), onClick: function (e) { e.stopPropagation(); rfToggle(false); } }));
  RF_PARTS.forEach(function (P) {
    s.appendChild(el('button', { class: 'rop-fsb', type: 'button', title: P[1], 'aria-label': P[1], html: pxI(P[0], 16), onClick: function (e) { e.stopPropagation(); rfToggle(false); rfGoTo(P[2]); } }));
  });
  return s;
}
function rfFoldBtn() {
  return el('button', { class: 'rop-rfold', type: 'button', title: 'Fold the details (\\)', 'aria-label': 'Fold the details', html: ri('chevR', 15), onClick: function (e) { e.stopPropagation(); rfToggle(true); } });
}
/* after opening: the part that was clicked, in view (it lives in the shadow root or in the slotted panel) */
function rfGoTo(sel) {
  requestAnimationFrame(function () { try {
    var t = (R && R.querySelector(sel)) || (HOST && HOST.querySelector(sel)); if (!t) return;
    var rail = R && R.querySelector('.rop-rail'); if (!rail) return;
    var top = t.getBoundingClientRect().top - rail.getBoundingClientRect().top + rail.scrollTop - 8;
    rail.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  } catch (e) {} });
}
function rfApply(anim) {
  if (!R) return; var ro = R.querySelector('.px-ro'), rail = R.querySelector('.rop-rail'); if (!ro || !rail) return;
  var shut = rfShut();
  if (anim) { ro.classList.add('rf-anim'); setTimeout(function () { ro.classList.remove('rf-anim'); }, 320); }
  ro.classList.toggle('rf-shut', shut);
  rail.setAttribute('aria-expanded', shut ? 'false' : 'true');
}
var RF_W = rfNarrow();
window.addEventListener('resize', function () { var n = rfNarrow(); if (n === RF_W) return; RF_W = n; RF.tmp = {}; rfApply(true); });
document.addEventListener('keydown', function (e) {
  if (e.key !== '\\' || e.ctrlKey || e.metaKey || e.altKey) return;
  var a = document.activeElement, typing = a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable);
  try { var sa = R && R.activeElement; if (sa && (/^(INPUT|TEXTAREA|SELECT)$/.test(sa.tagName) || sa.isContentEditable)) typing = true; } catch (er) {}
  if (typing || !R || !R.querySelector('.rop-rail') || !HOST || !HOST.isConnected) return;
  try { if (UI.modal || (typeof pxOut === 'function' && pxOut())) return; } catch (er) {}
  e.preventDefault(); e.stopPropagation(); rfToggle();
});
