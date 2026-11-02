/* Parsec · ro-page · steady-redraw.js
   The RO page redraws without flicker (17.1): an opening plays only for what is new, a picture already showing stays, a scrolled box keeps its scroll.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   jcSig jcSteadyBefore jcSteadyAfter jcSteadyMoved (4 functions)
*/
/* ============================== the RO page redraws without flicker (Parsec 17.1) ==============================
   The RO page draws itself fresh on every change (renderNow). Drawn fresh, a card that was already open would play its
   opening again, a picture would blink while it loads again, and a list would jump back to its top. So, around each draw:
   · what was already on screen keeps its look — an opening animation plays only for what is new (another operation's
     card, a pin just added), and finishes at once for what was there before;
   · a picture that was showing keeps showing (the same picture is reused, not loaded again);
   · a box that was scrolled keeps its scroll.
   "The same thing" is found by where it sits: its class and the operation, card or key it belongs to. */
function jcSig(n, top) {
  var p = [], d = 0;
  while (n && n.nodeType === 1 && n !== top && d < 8) {
    var id = n.getAttribute('data-job') || n.getAttribute('data-op') || n.getAttribute('data-key') || n.getAttribute('data-pid') || n.id || '';
    var c = (typeof n.className === 'string' ? n.className : (n.getAttribute('class') || '')).trim().split(/\s+/)[0] || '';
    p.push(n.tagName + '.' + c + (id ? '#' + id : ''));
    if (id) break;
    n = n.parentElement; d++;
  }
  return p.join('<');
}
/* before the draw: take the old page out whole (so it can be looked at), and note what was scrolled */
function jcSteadyBefore(page) {
  var old = document.createDocumentFragment(), scr = [];
  Array.prototype.forEach.call(page.querySelectorAll('*'), function (n) { if (n.scrollTop > 0 || n.scrollLeft > 0) scr.push([jcSig(n, page), n.scrollTop, n.scrollLeft]); });
  while (page.firstChild) old.appendChild(page.firstChild);
  return { old: old, scr: scr };
}
/* after the draw */
function jcSteadyAfter(page, K) {
  if (!K || !K.old) return;
  var old = K.old;
  /* pictures: the one already decoded stays on screen */
  var pics = {};
  Array.prototype.forEach.call(old.querySelectorAll('img[src^="data:"], img[src^="blob:"]'), function (im) { if (im.complete && im.naturalWidth) (pics[im.getAttribute('src')] = pics[im.getAttribute('src')] || []).push(im); });
  Array.prototype.forEach.call(page.querySelectorAll('img[src^="data:"], img[src^="blob:"]'), function (im) {
    var L = pics[im.getAttribute('src')], o = L && L.shift(); if (!o) return;
    var i;
    for (i = o.attributes.length - 1; i >= 0; i--) if (!im.hasAttribute(o.attributes[i].name)) o.removeAttribute(o.attributes[i].name);
    for (i = 0; i < im.attributes.length; i++) if (o.getAttribute(im.attributes[i].name) !== im.attributes[i].value) o.setAttribute(im.attributes[i].name, im.attributes[i].value);
    im.replaceWith(o);
  });
  /* openings: only what is new plays one */
  var A = []; try { A = R.getAnimations ? R.getAnimations() : []; } catch (e) {}
  A.forEach(function (a) {
    try {
      if (typeof CSSAnimation !== 'undefined' && !(a instanceof CSSAnimation)) return;
      var t = a.effect && a.effect.target; if (!t || !page.contains(t) || a.effect.getTiming().iterations === Infinity) return;
      var c = (typeof t.className === 'string' ? t.className : '').trim().split(/\s+/)[0]; if (!c) return;
      var sig = jcSig(t, page), was = Array.prototype.some.call(old.querySelectorAll('.' + CSS.escape(c)), function (o) { return jcSig(o, null) === sig; });
      if (was) a.finish();
    } catch (e) {}
  });
  /* scroll: where it was */
  if (K.scr.length) {
    var by = {}; K.scr.forEach(function (s) { by[s[0]] = s; });
    Array.prototype.forEach.call(page.querySelectorAll('*'), function (n) { var s = by[jcSig(n, page)]; if (s) { if (n.scrollTop !== s[1]) n.scrollTop = s[1]; if (n.scrollLeft !== s[2]) n.scrollLeft = s[2]; } });
  }
  K.old = null;
}
/* the page moved to another place on screen (the Technician page's tabs): what it shows was already open, so nothing replays */
function jcSteadyMoved() {
  try { (R && R.getAnimations ? R.getAnimations() : []).forEach(function (a) {
    if (typeof CSSAnimation !== 'undefined' && !(a instanceof CSSAnimation)) return;
    if (a.effect && a.effect.getTiming().iterations !== Infinity) a.finish();
  }); } catch (e) {}
}
