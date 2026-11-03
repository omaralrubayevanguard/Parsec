/* Parsec · ro-page · cause-correction.js
   The Time tab's Cause and Correction (17.3): the two lines beside the notes, the notes underlined amber or green, click a sentence to move it, ask after a hand edit, ✦ suggests, copy the story.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ropCcMark ropCcMenu ropCcPanel ropCcSuggest ropCcType (5 functions)
   uses       kit/ ro/ shell/ state/
*/
/* ---------- the Time tab's Cause and Correction (Parsec 17.3) ----------
   Beside the notes: the two lines the notes fill (ro/cause-correction.js). In the notes, each sentence is underlined amber (Cause)
   or green (Correction); a click on a sentence puts it in Cause, Correction or Neither. Pointing at a line lights its sentences.
   Typing in the note box fills the lines as you type. A line typed by hand stays; when the notes move on, it asks. ✦ suggests both
   lines from the notes and similar past jobs; Copy the story copies Complaint · Cause · Correction for ASIST. */
/* a note's text as sentences, each underlined by the line it went to; tag after a run of the same line */
function ropCcMark(job, text) {
  var sp = null; try { sp = ccSplit(job); } catch (e) { return [document.createTextNode(String(text || ''))]; }
  var to = {}; sp.all.forEach(function (s) { to[s.k] = s; });
  var parts = ccSplitText(text), out = [];
  parts.forEach(function (s, i) {
    var k = ccKey(s), x = to[k], w = x ? x.to : 'n';
    var span = el('span', { class: 'rop-ccs is-' + w + (x && x.by === 'you' ? ' is-you' : ''), 'data-cck': k, role: 'button', tabindex: '0', text: s,
      title: (w === 'c' ? 'In the Cause' : w === 'x' ? 'In the Correction' : 'In neither line') + ' — click to move it' });
    span.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); ropCcMenu(job, k, w, span); });
    span.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); ropCcMenu(job, k, w, span); } });
    out.push(span);
    var nx = parts[i + 1], nw = nx ? ((to[ccKey(nx)] || {}).to || 'n') : null;
    if (w !== 'n' && nw !== w) out.push(el('span', { class: 'rop-cct is-' + w, 'aria-hidden': 'true', text: w === 'c' ? 'C' : 'X' }));
    if (i < parts.length - 1) out.push(document.createTextNode(' '));
  });
  return out.length ? out : [document.createTextNode(String(text || ''))];
}
function ropCcMenu(job, k, w, anchor) {
  var pop = el('div', { class: 'px-pop rop-pop rop-ccpop', role: 'menu' }, [el('div', { class: 'rop-poph', html: '<b>This sentence goes in</b>' })]);
  [['c', 'Cause'], ['x', 'Correction'], ['n', 'Neither']].forEach(function (o, i) {
    pop.appendChild(pxMenuItem('<i class="rop-ccdot is-' + o[0] + '"></i>', o[1], { on: w === o[0], tick: w === o[0], kbd: String(i + 1), run: function () {
      if (w === o[0]) return;
      pushUndo('move a sentence'); ccTag(job, k, o[0]); save(true); render(); try { tecRender(); } catch (e) {}
      ropUndo('Moved to ' + (o[0] === 'n' ? 'neither line' : o[1]) + '.');
    } }));
  });
  var tg = (job.ccTag || {})[k];
  if (tg) { pop.appendChild(pxSep()); pop.appendChild(pxMenuItem(ri('undo', 14), 'Back to where the notes put it', { run: function () { pushUndo('move a sentence'); ccTag(job, k, ''); save(true); render(); } })); }
  pxPop(anchor, pop);
}
/* the two lines */
function ropCcPanel(job) {
  var S0 = ccSync(job) || { split: { c: '', x: '', n: 0 }, ask: {} }, live = ROPCC.live && ROPCC.live.id === job.id ? ccSplit(job, ROPCC.live.t) : null;
  var sug = ROPCC.sug && ROPCC.sug.id === job.id ? ROPCC.sug : null, hasNotes = S0.split.n > 0 || !!live;
  var box = el('div', { class: 'rop-cc', 'data-cc-op': job.id });
  var head = el('div', { class: 'rop-cch' }, [el('span', { class: 'rl', text: 'Cause & correction' }), el('span', { class: 'grow' }),
    el('button', { class: 'rop-ib rop-ccsp', type: 'button', title: 'Suggest both lines from the notes and similar past jobs', 'aria-label': 'Suggest Cause and Correction', html: I3H('spark', 15, 15), onClick: function (e) { e.preventDefault(); e.stopPropagation(); ropCcSuggest(job); } }),
    el('button', { class: 'px-btn px-btn--sm rop-cccp', type: 'button', title: 'Copy Complaint · Cause · Correction, ready to paste into ASIST', html: pxI('copy', 13) + 'Copy the story',
      onClick: function (e) { e.stopPropagation(); var t = ccStory(job); copyText(t).then(function () { toast('Story copied — Complaint · Cause · Correction'); }); } })]);
  box.appendChild(head);
  [['c', 'Cause', 'No cause yet — write what you found'], ['x', 'Correction', 'No correction yet — write what you replaced or fixed']].forEach(function (L) {
    var k = L[0], hand = job.ccHand && job.ccHand[k] != null, cur = ccLine(job, k);
    var shown = sug ? sug[k] : (live && !hand ? live[k] : cur);
    var row = el('div', { class: 'rop-ccr is-' + k + (hand ? ' is-hand' : '') + (sug ? ' is-sug' : '') + (live && !hand ? ' is-live' : '') });
    row.appendChild(el('span', { class: 'rop-ccl', text: L[1] }));
    var tx = el('span', { class: 'rop-cct-t', spellcheck: 'true', 'aria-label': L[1], text: shown });
    if (!sug) { tx.setAttribute('contenteditable', 'plaintext-only'); if (tx.contentEditable !== 'plaintext-only') tx.setAttribute('contenteditable', 'true'); }
    if (!shown) tx.setAttribute('data-ph', hasNotes ? L[2] : 'Fills from your notes as you write');
    if (!shown && hasNotes) row.classList.add('is-miss');
    tx.addEventListener('click', function (e) { e.stopPropagation(); });
    tx.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); tx.blur(); } else if (e.key === 'Escape') { e.preventDefault(); tx.textContent = cur; tx.blur(); } });
    tx.addEventListener('blur', function () {
      if (sug) return; var v = String(tx.textContent || '').replace(/\s+/g, ' ').trim(); if (v === cur.trim()) return;
      pushUndo('change the ' + L[1].toLowerCase()); ccSetHand(job, k, v); save(true); render(); try { tecRender(); } catch (e) {}
      ropUndo(v ? L[1] + ' changed — it stays as you wrote it.' : L[1] + ' cleared — it fills from the notes again.');
    });
    row.appendChild(tx);
    if (hand && !sug) row.appendChild(el('span', { class: 'rop-ccyo', text: 'yours', title: 'Changed by hand — clear it to fill from the notes again' }));
    if (S0.ask[k] && !sug) {
      row.appendChild(el('div', { class: 'rop-ccask' }, [el('span', { text: 'Notes changed — refill ' + L[1] + '?' }),
        el('button', { class: 'px-btn px-btn--sm px-btn--primary', type: 'button', text: 'Refill', onClick: function (e) { e.stopPropagation(); pushUndo('refill'); ccRefill(job, k); save(true); render(); } }),
        el('button', { class: 'px-btn px-btn--sm', type: 'button', text: 'Keep mine', onClick: function (e) { e.stopPropagation(); ccKeepMine(job, k); save(true); render(); } })]));
    }
    row.addEventListener('mouseenter', function () { var c = box.closest('.px-list'); if (c) c.classList.add('cc-hot-' + k); });
    row.addEventListener('mouseleave', function () { var c = box.closest('.px-list'); if (c) c.classList.remove('cc-hot-' + k); });
    box.appendChild(row);
  });
  if (sug) box.appendChild(el('div', { class: 'rop-ccsug' }, [el('span', { text: sug.from }),
    el('button', { class: 'px-btn px-btn--sm px-btn--primary', type: 'button', text: 'Accept', onClick: function (e) { e.stopPropagation();
      pushUndo('accept the suggestion'); ['c', 'x'].forEach(function (k) { if (sug[k]) ccSetHand(job, k, sug[k]); }); ROPCC.sug = null; save(true); render(); ropUndo('Cause and Correction filled from ✦.'); } }),
    el('button', { class: 'px-btn px-btn--sm', type: 'button', text: 'Dismiss', onClick: function (e) { e.stopPropagation(); ROPCC.sug = null; render(); } })]));
  return box;
}
/* ✦: both lines from the notes, or from similar past jobs when the notes don't say */
function ropCcSuggest(job) {
  var g = null; try { g = tcBuild(job); } catch (e) {}
  var j = function (a) { return (a || []).map(function (s) { s = String(s).trim(); return /[.!?]$/.test(s) ? s : s + '.'; }).join(' '); };
  var c = g ? j(g.cause) : '', x = g ? j(g.fix) : '';
  if (!c && !x) { toast('Nothing to suggest yet — write a note first'); return; }
  var from = g.causeFrom === 'similar' || g.fixFrom === 'similar' ? 'Suggested from your notes and similar past jobs' : 'Suggested from your notes';
  ROPCC.sug = { id: job.id, c: c, x: x, from: from }; render();
}
/* as you type in the note box: the lines follow half a second after you stop */
function ropCcType(job, t) {
  clearTimeout(ROPCC.t);
  ROPCC.t = setTimeout(function () {
    ROPCC.live = String(t || '').trim() ? { id: job.id, t: t } : null;
    var old = R && R.querySelector('.rop-cc[data-cc-op="' + job.id + '"]'); if (!old) return;
    old.replaceWith(ropCcPanel(job));
  }, 500);
}
