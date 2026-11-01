/* Parsec · ro-page · op-tiles.js
   The operation tiles on the RO page: one row of tiles with their states (to do, live, held, selected, done), the progress strip, and P to quick-add a part.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   cardEl opTileState opTile mountProgress quickPartKey (5 functions)
   uses       data/ kit/ ro/ shell/ state/
*/
/* ===================== operation tiles (mockups A + C) =====================
   Every operation sits in one row as a tile. The picked one stays in its place, white with a
   dark edge and a "Selected" tag; the open card shows under the row. States: to do, live,
   held (part or approval), selected, done. */
function cardEl(i) { var j = S.jobs[i]; return j ? R.querySelector('.cardCol > .card[data-job="' + j.id + '"]') : null; }
function opTileState(job) {
  if (runStartOf(job)) return 'live';
  var nm = stName(opStatus(job));
  if (job.declined || /^Complete|^Declined/.test(nm)) return 'done';
  if (/^Waiting/.test(nm)) return 'held';
  return 'todo';
}
function opTile(job, idx) {
  var sel = isOpenCard(job), st = opTileState(job), c = jobCalc(job);
  var jt = JOB_TYPES[jtIdx(job)] || JOB_TYPES[1];
  var tile = el('div', { class: 'opTile s-' + st + (sel ? ' sel' : ''), 'data-job': job.id, tabindex: '0', role: 'button', draggable: 'true',
    'aria-pressed': sel ? 'true' : 'false', 'aria-label': 'OP ' + (idx + 1) + ' ' + (job.complaint || '') + (sel ? ', open' : ', click to open') });
  /* top: type chip · state */
  var stTx = el('span', { class: 'otSt' });
  function paintSt() {
    var os = opStatus(job), nm = stName(os), rs = runStartOf(job), look = jobLook(nm);
    if (os && os.sub && /^Backordered/.test(os.sub)) look = JC_BAD_LOOK;
    stTx.innerHTML = '';
    if (rs) { stTx.className = 'otSt live'; stTx.appendChild(stIcon(JC_STATUS_LOOK['Working'], 'otDot')); stTx.appendChild(document.createTextNode('Working')); return; }
    stTx.className = 'otSt' + (st === 'done' ? ' done' : '');
    if (st === 'done') { stTx.innerHTML = svgI('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 11); stTx.appendChild(document.createTextNode(jobStatusLabel(nm))); return; }
    stTx.appendChild(stIcon(look, 'otDot'));
    stTx.appendChild(document.createTextNode(nm.replace(/^Waiting – /, 'Waiting · ')));
    stTx.style.color = look.t === 'bad' ? 'var(--st-bad-ink)' : (look.t === 'wait' ? 'var(--st-wait-ink)' : (look.t === 'tech' ? 'var(--st-tech-ink)' : (look.t === 'teal' ? 'var(--st-teal-ink)' : '')));
  }
  paintSt(); if (runStartOf(job)) TIMERS.push(paintSt);
  tile.appendChild(el('div', { class: 'otTop' }, [el('b', { class: 'otNo mono', text: 'OP ' + (idx + 1) }), el('span', { class: 'grow' }), stTx]));
  tile.appendChild(el('b', { class: 'otTitle', text: job.complaint || 'Operation ' + (idx + 1), title: job.complaint || '' }));
  if (job.faults && job.faults.length) tile.appendChild(faultMini(job));
  /* bar: burnt against quoted, red past the quote */
  var bar = el('div', { class: 'otBar' }), fill = el('i', { class: 'otFill' }), over = el('i', { class: 'otOver' });
  bar.appendChild(fill); bar.appendChild(over);
  var foot = el('div', { class: 'otFoot' }), hrs = el('span', { class: 'otHrs mono' }), right = el('span', { class: 'otR mono' });
  function paintBar() {
    var n = jobCalc(job), q = n.q || 0, b = n.b || 0;
    var tot = Math.max(q, b) || 1;
    fill.style.width = (Math.min(b, q || b) / tot * 100) + '%';
    over.style.width = (q && b > q ? (b - q) / tot * 100 : 0) + '%';
    hrs.textContent = fx(b) + ' of ' + fx(q) + ' h';
    if (st === 'done') { right.textContent = n.eff == null ? '' : Math.round(n.eff) + '%'; right.className = 'otR mono good'; }
    else if (q && b > q) { right.textContent = fx(b - q) + ' over'; right.className = 'otR mono bad'; }
    else if (q) { right.textContent = fx(q - b) + ' left'; right.className = 'otR mono'; }
    else right.textContent = '';
  }
  paintBar(); if (runStartOf(job)) TIMERS.push(paintBar);
  tile.appendChild(bar);
  /* middle line: hours · left/over (hidden for held, which shows its part instead) */
  /* foot */
  if (st === 'held') {
    var lk = opPartLock(job) || (job.parts || []).filter(function (p) { return (p.description || p.partNumber) && !partInHand(p); })[0];
    var ag = lk ? partAging(lk) : null, late = ag && ag.state === 'late';
    foot.appendChild(el('span', { class: 'otHeld' + (late ? ' late' : ''), html: svgI('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/>', 12) + esc(lk ? ptName(lk) + (ptEtaText(lk) ? ' · ETA ' + ptEtaText(lk).split(' ')[0] : ' · ' + String(lk.status || 'not ordered').toLowerCase()) + (late ? ' · ' + ag.days + 'd late' : '') : stName(opStatus(job)).replace(/^Waiting – /, 'Waiting on ')) }));
  } else if (st === 'done') {
    var lastStop = 0; punchesOf(job).forEach(function (p) { if (p.stop) lastStop = Math.max(lastStop, +new Date(p.stop)); });
    foot.appendChild(el('span', { class: 'otNote', text: lastStop ? 'Done ' + String(new Date(lastStop).getMonth() + 1).padStart(2, '0') + '-' + String(new Date(lastStop).getDate()).padStart(2, '0') : 'Done' }));
  }
  foot.appendChild(el('span', { class: 'grow' }));
  if (st !== 'done') {
    var on = !!runStartOf(job), plk = on ? null : opPartLock(job);
    foot.appendChild(el('button', { class: 'otClock' + (on ? ' on' : '') + (plk ? ' locked' : '') + (!on && job.declined ? ' is-dec' : ''), type: 'button', 'aria-disabled': plk || (!on && job.declined) ? 'true' : null,
      title: on ? 'Stop the clock' : job.declined ? ropDecTip(job) : plk ? 'Clock locked — ' + lockLine(plk) : 'Start the clock',
      'aria-label': on ? 'Stop the clock on OP ' + (idx + 1) : 'Start the clock on OP ' + (idx + 1),
      html: on ? '<svg width="9" height="9" viewBox="0 0 12 12" aria-hidden="true"><rect x="1.5" y="1.5" width="9" height="9" rx="1.5" fill="currentColor"/></svg>' : plk ? LOCK_SVG : '<svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" fill="currentColor"/></svg>',
      onClick: function (e) { e.stopPropagation(); toggleJobClock(job); } }));
  }
  tile.appendChild(foot);
  function openIt() {
    if (sel) { var oa = openList(RO), ok = oa.indexOf(job.id); if (ok > -1) oa.splice(ok, 1); persistUI(); save(); render(); return; }   /* click an open tile to close it */
    S.ui.card = job.id; openCard(RO.id, job.id); persistUI(); save(); render();
    requestAnimationFrame(function () { var cd = R.querySelector('.cardCol > .card[data-job="' + job.id + '"]'); if (cd) jcScrollTo(cd); });
  }
  tile.addEventListener('click', function (e) { if (e.target.closest('button')) return; openIt(); });
  tile.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target === tile) { e.preventDefault(); openIt(); } });
  /* drag a tile onto another to reorder; drop files on it to attach them */
  tile.addEventListener('dragstart', function (e) { DRAG.id = job.id; tile.classList.add('dragging'); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', job.id); } catch (x) {} });
  tile.addEventListener('dragend', function () { DRAG.id = null; tile.classList.remove('dragging'); });
  tile.addEventListener('dragover', function (e) {
    var files = e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') > -1;
    if ((DRAG.id && DRAG.id !== job.id) || (!DRAG.id && files)) { e.preventDefault(); tile.classList.add('dropTarget'); }
  });
  tile.addEventListener('dragleave', function (e) { if (!tile.contains(e.relatedTarget)) tile.classList.remove('dropTarget'); });
  tile.addEventListener('drop', function (e) {
    tile.classList.remove('dropTarget');
    if (!DRAG.id && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) { e.preventDefault(); dropFilesOnJob(job, e.dataTransfer.files); return; }
    if (!DRAG.id || DRAG.id === job.id) return;
    e.preventDefault();
    var from = S.jobs.findIndex(function (j) { return j.id === DRAG.id; }), to = S.jobs.findIndex(function (j) { return j.id === job.id; });
    DRAG.id = null;
    if (from < 0 || to < 0) return;
    pushUndo('reorder operations');
    S.jobs.splice(to, 0, S.jobs.splice(from, 1)[0]); save(true); render();
  });
  return tile;
}
function mountProgress(page) {
  var node = buildProgress();
  if (!node) return;
  page.appendChild(node);
  requestAnimationFrame(function () { pgFit(node); });
  if (!PG_RO && typeof ResizeObserver !== 'undefined') PG_RO = new ResizeObserver(function (ents) { ents.forEach(function (en) { pgFit(en.target); }); });
  if (PG_RO) PG_RO.observe(node);
  var lastMin = Math.floor(Date.now() / 60000);
  TIMERS.push(function () {
    var mm = Math.floor(Date.now() / 60000);
    if (mm === lastMin || !node.isConnected) return;
    lastMin = mm;
    var nn = buildProgress();
    if (nn) { if (PG_RO) PG_RO.unobserve(node); node.replaceWith(nn); node = nn; pgFit(node); if (PG_RO) PG_RO.observe(node); }
  });
}
/* 11: P from the keyboard — quick-add a part on the current operation */
function quickPartKey() {
  var j = currentJob(); if (!j) return false;
  j.partsCollapsed = false; S.ui.card = j.id; save(); render();
  requestAnimationFrame(function () {
    var c = R.querySelector('.cardCol > .card[data-job="' + j.id + '"]');
    var qi = c && c.querySelector('.jquick input');
    if (qi) { jcScrollTo(c); qi.focus(); }
  });
  return true;
}
