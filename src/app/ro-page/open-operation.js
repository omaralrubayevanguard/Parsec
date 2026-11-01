/* Parsec · ro-page · open-operation.js
   The open operation card: the clock bar, part tiles with status and ETA, the job log; setPartStatus and the Receive all / Install all actions.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ptEtaText ptName lockLine opClockMs hmText jtmHours jtmHMS clockBar setPartStatus partStatusPop ptTrack partTile … (18 functions, 8 constants)
   uses       access/ automations/ data/ kit/ pages/inventory/ ro/ shell/ state/
*/
/* ============ the open operation card — clock bar, part tiles, job log ============ */
function ptEtaText(p) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.eta || '')) return '';
  var d = new Date(p.eta + 'T12:00');
  return d.toLocaleDateString([], { weekday: 'short' }) + ' ' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function ptName(p) { return p.description || p.partNumber || 'Part'; }
function lockLine(p) {
  var eta = ptEtaText(p);
  return 'Waiting on ' + ptName(p) + (eta ? ' · ETA ' + eta : ' · ' + String(p.status || 'Not Ordered').toLowerCase());
}
var LOCK_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
function opClockMs(job) {
  return punchesOf(job).reduce(function (a, p) { return a + ((p.stop ? new Date(p.stop) : new Date()) - new Date(p.start)); }, 0);
}
function hmText(ms) { var m = Math.max(0, Math.floor(ms / 60000)); return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); }

function jtmHours(job) {
  var ms = opClockMs(job);
  if (typeof job.burntAdj === 'number') return Math.max(0, job.burntAdj + ms / 3600000);
  return runningPunchOf(job) ? Math.max(num(job.burnt), ms / 3600000) : Math.max(num(job.burnt), ms / 3600000);
}
function jtmHMS(h) { var s = Math.max(0, Math.round(h * 3600)); return Math.floor(s / 3600) + ':' + String(Math.floor(s % 3600 / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function clockBar(job) {
  if (ivOn()) return clockCalm(job);
  var run = runningPunchOf(job), lock = run ? null : opPartLock(job), q = num(job.quoted);
  var wrap = el('div', { class: 'jtm' + (run ? ' run' : '') + (lock ? ' locked' : '') + (q > 0 ? '' : ' noq') });
  var row = el('div', { class: 'jtmRow' });
  var qB = el('b', { class: 'mono', text: q > 0 ? q.toFixed(2) + ' h' : 'No quote' });
  var qWrap = el('span', { class: 'jtmQ', title: 'Quoted hours \u2014 click to change', role: 'button', tabindex: '0' }, [qB, el('span', { text: q > 0 ? 'quoted' : '' })]);
  function editQ(e) {
    e.stopPropagation(); if (qWrap.querySelector('input')) return;
    var inp = el('input', { class: 'jtmQin mono', type: 'text', inputmode: 'decimal', value: q > 0 ? q.toFixed(2) : '' });
    qWrap.textContent = ''; qWrap.appendChild(inp); inp.focus(); inp.select();
    var done = false;
    function commit(keep) { if (done) return; done = true; var v = num(inp.value); if (keep && v !== q) { pushUndo('quoted hours'); job.quoted = v ? String(v) : ''; save(true); } render(); }
    inp.addEventListener('keydown', function (ev) { ev.stopPropagation(); if (ev.key === 'Enter') { ev.preventDefault(); commit(true); } else if (ev.key === 'Escape') { ev.preventDefault(); commit(false); } });
    inp.addEventListener('blur', function () { commit(true); });
    inp.addEventListener('click', function (ev) { ev.stopPropagation(); });
  }
  qWrap.addEventListener('click', editQ);
  qWrap.addEventListener('keydown', function (e) { if (e.key === 'Enter') editQ(e); });
  row.appendChild(qWrap);
  var track = el('div', { class: 'jtmTrack', role: 'progressbar', 'aria-label': 'Time against the quote' });
  var fill = el('i', { class: 'jtmFill' }), qm = el('i', { class: 'jtmQm', title: 'Quote' });
  var knob = el('span', { class: 'jtmKnob mono', title: 'Time clocked on this operation' });
  track.appendChild(fill); track.appendChild(qm); track.appendChild(knob);
  row.appendChild(track);
  var remB = el('b', { class: 'mono' }), remL = el('span');
  row.appendChild(el('span', { class: 'jtmR' }, [remB, remL]));
  var eff = el('span', { class: 'jtmEff', title: 'Efficiency — quoted ÷ clocked' });
  row.appendChild(eff);
  row.appendChild(el('button', { class: 'jtmBtn' + (!run && job.declined ? ' is-dec' : ''), type: 'button',
    title: run ? 'Stop the clock' : job.declined ? ropDecTip(job) : lock ? 'Locked — the clock opens when the part is in' : 'Start the clock on this operation',
    'aria-label': run ? 'Stop the clock' : job.declined ? ropDecTip(job) : lock ? 'Clock locked until the part is in' : 'Start the clock', 'aria-disabled': lock || (!run && job.declined) ? 'true' : null,
    html: run ? '<svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="2" width="8" height="8" rx="1.6" fill="currentColor"/></svg>'
      : lock ? LOCK_SVG : '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.2-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6z"/></svg>',
    onClick: function (e) { e.stopPropagation(); toggleJobClock(job); } }));
  wrap.appendChild(row);
  if (lock) wrap.appendChild(el('div', { class: 'jtmLock', text: lockLine(lock) }));
  function paint() {
    var h = jtmHours(job), pct = q > 0 ? h / q * 100 : 0, over = q > 0 && h > q, near = !over && pct >= 90;
    wrap.classList.toggle('over', over); wrap.classList.toggle('near', near);
    var p = q > 0 ? Math.min(100, pct) : 50;
    fill.style.width = (q > 0 ? p : 0) + '%';
    knob.style.left = p + '%';
    knob.style.setProperty('--lx', p >= 92 ? '-96%' : p <= 6 ? '-4%' : '-50%');
    knob.textContent = jtmHMS(h);
    qm.style.left = over ? (q / h * 100) + '%' : '';
    if (q <= 0) { remB.textContent = '—'; remL.textContent = ''; }
    else if (over) { var om = Math.round((h - q) * 60); remB.textContent = '+' + Math.floor(om / 60) + ':' + String(om % 60).padStart(2, '0'); remL.textContent = 'over'; }
    else { remB.textContent = (q - h).toFixed(2) + ' h'; remL.textContent = 'left'; }
    eff.textContent = q > 0 && h >= 0.05 ? Math.round(q / h * 100) + '%' : '—';
    track.setAttribute('aria-valuenow', String(Math.round(pct)));
  }
  paint(); if (run) TIMERS.push(paint);
  return wrap;
}

/* F1: parts as tiles; hover a tile for its details, click it (or Edit) to change it */
var PT_EDIT = {}, PT_COMPACT = false;
/* part status as a popover (replaces the native select) */
var PT_HINT = { 'Not Ordered': 'still to order', 'Ordered': 'on the way', 'Backordered': 'supplier is short', 'Received': 'in hand', 'Installed': 'on the truck' };
function setPartStatus(job, p, st) {
  if (p.status === st) return;
  if ((st === 'Ordered' || st === 'Backordered') && !permOk('p.order')) return;   /* Parsec 13 */
  pushUndo('part status');
  p.status = st; p.statusChangedAt = nowIso();
  save(true); render();
  if (partInHand(p)) checkPartsArrived(job);
}
function partStatusPop(job, p, cls, label) {
  var defs = PART_STATUS.map(function (d) { return { key: d.key, label: d.key, dot: d.fg, bg: d.bg, fg: d.fg, hint: PT_HINT[d.key] || '' }; });
  var idx = Math.max(0, PART_STATUS.map(function (d) { return d.key; }).indexOf(p.status));
  var key = 'ptst-' + p.id;
  var wrap = el('div', { class: 'chipwrap ptPopW' });
  var btn = el('button', { class: cls, type: 'button', 'aria-haspopup': 'menu', title: 'Part status — click to change',
    onClick: function (e) {
      e.stopPropagation();
      var was = menu.classList.contains('open');
      closeMenus();
      if (!was) { menu.classList.add('open'); placeMenuSettled(menu, btn); openMenu = key; }
    } }, [el('span', { text: label }), svg(ICON.down, 9, 1.8)]);
  var menu = dropdown(defs, idx, function (i) { setPartStatus(job, p, PART_STATUS[i].key); }, key);
  wrap.appendChild(btn); wrap.appendChild(menu);
  return wrap;
}
/* M1: a four-step tracker on every part — Ordered, Shipped, Received, Installed — the stuck step shows red */
var PT_STEPS = ['Ordered', 'Shipped', 'Received', 'Installed'];
function ptTrack(p) {
  var ag = partAging(p), done = 0, cur = -1, tone = '';
  if (p.status === 'Installed') done = 4;
  else if (p.status === 'Received') { done = 3; cur = 3; }
  else if (p.status === 'Backordered') { done = 1; cur = 1; tone = 'bad'; }
  else if (p.status === 'Ordered') {
    done = 1; cur = 1; tone = 'info';
    if (ag && ag.state === 'late') { done = 2; cur = 2; tone = 'bad'; }
    else if (ag && ag.state === 'due' && ag.days === 0) { done = 2; cur = 2; tone = 'warn'; }
  } else { cur = 0; tone = 'idle'; }
  var box = el('div', { class: 'ptTrack', role: 'img', 'aria-label': 'Part progress: ' + (done >= 4 ? 'installed' : PT_STEPS[Math.min(cur < 0 ? 3 : cur, 3)] + ' is next') });
  box.appendChild(el('span', { class: 'ptTl' }, [el('span', { class: 'ptTf', style: 'width:' + (Math.max(0, Math.min(done, 4) - 1) / 3 * 100) + '%' })]));
  PT_STEPS.forEach(function (s, i) {
    var st = i < done ? 'done' : i === cur ? 'cur ' + tone : 'next';
    box.appendChild(el('span', { class: 'ptSt ' + st }, [el('i'), el('em', { text: s })]));
  });
  return box;
}
function partTile(job, p) {
  if (!p.status) p.status = 'Not Ordered';
  if (PT_EDIT[p.id]) {
    return el('div', { class: 'ptEdit' }, [partRow(job, p),
      el('button', { class: 'ptDone', type: 'button', text: 'Done', onClick: function (e) { e.stopPropagation(); delete PT_EDIT[p.id]; render(); } })]);
  }
  var inHand = partInHand(p), ag = partAging(p), eta = ptEtaText(p);
  var kind = inHand ? 'in' : (p.status === 'Backordered' || (ag && ag.state === 'late')) ? 'late' : (p.status === 'Ordered' ? 'out' : 'todo');
  var line = p.status === 'Installed' ? 'Installed' : p.status === 'Received' ? 'Received' + (p.statusChangedAt ? ' ' + new Date(p.statusChangedAt).toLocaleDateString([], { weekday: 'short' }) : '')
    : p.status === 'Not Ordered' ? 'Not ordered yet' : p.status + (eta ? ' · ETA ' + eta : ' · no ETA');
  if (ag && ag.state === 'late') line += ' · ' + ag.days + 'd late';
  /* the details that show on hover */
  var hist = (RO.history || []).filter(function (h) { return h.op === job.id && h.k === 'part' && h.t.indexOf(ptName(p)) > -1; });
  var etaWas = hist.filter(function (h) { return /^Part ETA/.test(h.t) && h.o; }).map(function (h) { return h.o; });
  var addedH = (RO.history || []).filter(function (h) { return h.op === job.id && /^Part added/.test(h.t) && h.n === p.description; })[0];
  var rows = [
    ['Status', p.status + (p.statusChangedAt ? ' since ' + fmtDateLong(p.statusChangedAt) : '')],
    ['ETA', eta ? eta + (ag && ag.state !== 'ok' && ag.days != null && !inHand ? ' (' + (ag.state === 'late' ? ag.days + 'd late' : ag.state === 'due' ? (ag.days === 0 ? 'today' : 'in ' + ag.days + 'd') : '') + ')' : '') : '—'],
    etaWas.length ? ['ETA was', etaWas.join(' → ')] : null,
    addedH ? ['Added', fmtDateLong(new Date(addedH.at).toISOString())] : null
  ].filter(Boolean);
  var tile = el('div', { class: 'ptTile k-' + kind, tabindex: '0', title: 'Click to edit this part',
    onClick: function (e) { if (e.target.closest && e.target.closest('button, .menu')) return; e.stopPropagation(); PT_EDIT[p.id] = true; render(); },
    onKeydown: function (e) { if (e.key === 'Enter' && e.target === e.currentTarget) { e.preventDefault(); PT_EDIT[p.id] = true; render(); } } });
  var tick = el('button', { class: 'ptTick' + (inHand ? ' on' : ''), type: 'button',
    title: p.status === 'Installed' ? 'Installed' : p.status === 'Received' ? 'Received — click to mark installed' : 'Mark received',
    'aria-label': p.status === 'Received' ? 'Mark installed' : 'Mark received',
    html: inHand ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : '',
    onClick: function (e) {
      e.stopPropagation();
      if (p.status === 'Installed') { toast('Already installed — edit the part to change it'); return; }
      pushUndo('part status');
      p.status = p.status === 'Received' ? 'Installed' : 'Received'; p.statusChangedAt = nowIso();
      save(true); render();
      toast(ptName(p) + ' ' + p.status.toLowerCase(), { label: 'UNDO', run: function () { restoreSnapshot(); } });
      checkPartsArrived(job);
    } });
  tile.appendChild(el('div', { class: 'ptTop' }, [el('b', { text: ptName(p) }), tick]));
  tile.appendChild(el('span', { class: 'ptPn mono', text: (p.partNumber || 'no PN') + ' · qty ' + (p.qty || 1) + (num(p.price) ? ' · ' + usd(partCost(p)) : '') }));
  tile.appendChild(ptTrack(p));
  tile.appendChild(partStatusPop(job, p, 'ptLine', line));
  /* Shop floor: the next step is one big button, no menu to open first */
  var nextSt = { 'Not Ordered': 'Ordered', 'Ordered': 'Received', 'Backordered': 'Received', 'Received': 'Installed' }[p.status];
  if (sizeMode() === 'floor' && nextSt) tile.appendChild(el('button', { class: 'ptNext', type: 'button', text: 'Mark ' + nextSt.toLowerCase(),
    onClick: function (e) { e.stopPropagation(); setPartStatus(job, p, nextSt); } }));
  var more = el('div', { class: 'ptMore' });
  rows.forEach(function (r) { more.appendChild(el('span', { class: 'ptK', text: r[0] })); more.appendChild(el('span', { text: r[1] })); });
  more.appendChild(el('div', { class: 'ptActs' }, [
    el('button', { type: 'button', text: 'Edit', onClick: function (e) { e.stopPropagation(); PT_EDIT[p.id] = true; render(); } }),
    el('button', { type: 'button', class: 'danger', text: 'Remove', onClick: function (e) {
      e.stopPropagation(); pushUndo('delete part'); job.parts = job.parts.filter(function (x) { return x.id !== p.id; }); save(true); render();
      toast('Part removed', { label: 'UNDO', run: function () { restoreSnapshot(); } }); } })
  ]));
  tile.appendChild(more);
  return tile;
}

/* F4 + F6: the job log — a second record of the steps, newest first, on a vertical line */
var LOG_KIND = {
  start: { s: '▶', l: 'start', c: '#d08a00' }, stop: { s: '■', l: 'stop', c: '#d08a00' }, live: { s: '●', l: 'live', c: '#12a06a' },
  'in': { s: '✓', l: 'in', c: '#12a06a' }, order: { s: '+', l: 'order', c: '#4a7be8' }, eta: { s: '!', l: 'eta', c: '#e0553f' },
  part: { s: '+', l: 'part', c: '#4a7be8' }, gone: { s: '−', l: 'part', c: '#e0553f' }, status: { s: '◆', l: 'status', c: '#8b5cf6' },
  job: { s: '•', l: 'op', c: 'var(--muted)' }, note: { s: '✎', l: 'note', c: 'var(--ink-dim)' }
};
function logWhen(ms) {
  var d = new Date(ms), t = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  var days = (Date.now() - ms) / 86400000;
  return (days < 6 ? d.toLocaleDateString([], { weekday: 'short' }).toLowerCase() : String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')) + ' ' + t;
}
function opLogEntries(job) {
  var out = [];
  punchesOf(job).forEach(function (p) {
    var a = +new Date(p.start), b = p.stop ? +new Date(p.stop) : null;
    var note = noteEntries(p.notes).map(function (n) { return n.text; }).join(' ').replace(/\s+/g, ' ').trim();
    out.push({ at: a, k: b ? 'start' : 'live', t: (p.startReason || 'Working').toLowerCase() + (b ? '' : ' · running') + (p.by ? ' · ' + p.by : ''), q: note });
    if (b) out.push({ at: b, k: 'stop', t: (p.stopReason || 'stopped').toLowerCase() + ' · ' + hmText(b - a) });
  });
  var hist = (RO.history || []).filter(function (h) { return h.op === job.id && h.k !== 'punch'; }).map(function (h) { return Object.assign({}, h, { at: cdMs(h.at) }); });   /* Parsec 16: ISO or ms */
  var partHist = false;
  hist.forEach(function (h) {
    var t = h.t || '';
    if (h.k === 'part') {
      partHist = true;
      var nm = t.split(' · ').slice(1).join(' · ');
      if (/^Part ETA/.test(t)) out.push({ at: h.at, k: 'eta', t: nm.toLowerCase() + ' ' + (h.o || '—') + ' → ' + (h.n || '—') });
      else if (/^Part added/.test(t)) out.push({ at: h.at, k: 'part', t: 'added ' + String(h.n || 'a part').toLowerCase() });
      else if (/^Part removed/.test(t)) out.push({ at: h.at, k: 'gone', t: 'removed ' + String(h.o || 'a part').toLowerCase() });
      else if (/^Part · /.test(t)) {
        var n = h.n || '';
        out.push({ at: h.at, k: /Received|Installed/.test(n) ? 'in' : /Ordered|Backordered/.test(n) ? 'order' : 'part', t: nm.toLowerCase() + ' → ' + n.toLowerCase() });
      }
    } else if (h.k === 'status') {
      out.push({ at: h.at, k: 'status', t: String(h.o || '—').toLowerCase() + ' → ' + String(h.n || '—').toLowerCase() });
    } else if (h.k === 'job') {
      if (/^Operation added/.test(t)) out.push({ at: h.at, k: 'job', t: 'operation added' });
      else if (/^Quoted/.test(t)) out.push({ at: h.at, k: 'job', t: 'quoted ' + (h.o || '0') + ' → ' + (h.n || '0') + ' h' });
      else if (/declined|reinstated/i.test(t)) out.push({ at: h.at, k: 'job', t: t.toLowerCase() });
      else if (/^Operation type/.test(t)) out.push({ at: h.at, k: 'job', t: 'type ' + (h.o || '') + ' → ' + (h.n || '') });
    }
  });
  /* no part history yet (older data): read where each part stands */
  if (!partHist) (job.parts || []).forEach(function (p) {
    if (!p.statusChangedAt || !(p.description || p.partNumber)) return;
    var at = +new Date(p.statusChangedAt), s = p.status || 'Not Ordered';
    out.push({ at: at, k: partInHand(p) ? 'in' : (s === 'Not Ordered' ? 'part' : 'order'), t: ptName(p).toLowerCase() + ' · ' + s.toLowerCase() + (p.eta && !partInHand(p) ? ', eta ' + p.eta : '') });
  });
  (Array.isArray(job.offNotes) ? job.offNotes : []).forEach(function (n) { if (n && n.at) out.push({ at: +new Date(n.at), k: 'note', t: 'note', q: String(n.text || '') }); });
  return out.filter(function (e) { return e.at && !isNaN(e.at); }).sort(function (a, b) { return b.at - a.at; });
}
function opLogBox(job) {
  var list = opLogEntries(job), shut = !!job.logCollapsed;
  var box = el('div', { class: 'jbx jbx-log' + (shut ? ' shut' : '') });
  box.appendChild(el('div', { class: 'jsec-h' }, [
    el('button', { class: 'jsec-t', type: 'button', 'aria-expanded': shut ? 'false' : 'true',
      onClick: function (e) { e.stopPropagation(); job.logCollapsed = !job.logCollapsed; save(); render(); } }, [
      (function () { var s = svg(ICON.down, 10, 1.8); s.className = 'jsec-caret' + (shut ? ' shut' : ''); return s; })(),
      el('span', { class: 'rl', text: 'Operation log' })
    ]),
    el('span', { class: 'jsum' }, [el('b', { text: String(list.length) }), document.createTextNode(list.length === 1 ? ' step' : ' steps')])
  ]));
  if (shut) return box;
  var con = el('div', { class: 'jlog', role: 'list', 'aria-label': 'Operation log, newest first' });
  if (!list.length) con.appendChild(el('div', { class: 'jlogEmpty', text: 'Nothing logged on this operation yet.' }));
  list.forEach(function (e) {
    var k = LOG_KIND[e.k] || LOG_KIND.job;
    var row = el('div', { class: 'jlogRow', role: 'listitem', style: '--lc:' + k.c });
    row.appendChild(el('span', { class: 'jlogWhen mono', text: logWhen(e.at) }));
    row.appendChild(el('span', { class: 'jlogDot', 'aria-hidden': 'true' }));
    var tx = el('span', { class: 'jlogTx' }, [el('span', { class: 'jlogK mono', text: k.s + ' ' + k.l }), document.createTextNode(' ' + e.t)]);
    if (e.q) tx.appendChild(el('span', { class: 'jlogQ', text: '“' + (e.q.length > 220 ? e.q.slice(0, 219) + '…' : e.q) + '”' }));
    row.appendChild(tx);
    con.appendChild(row);
  });
  box.appendChild(con);
  return box;
}

function partRow(job, p) {
  if (!p.status) p.status = 'Not Ordered';
  var inHand = partInHand(p);
  var descF = field('f jpt-d', p.description, 'Part description', function (v) { p.description = v; save(); });
  var pnF = field('f jpt-p mono', p.partNumber, 'PN', function (v) { p.partNumber = v; save(); });
  /* once a field is left, the part is listed on the Parts page if the inventory lacks it */
  [descF, pnF].forEach(function (f) { f.addEventListener('change', function () { if (invAddFromPart(p, RO && RO.roNumber)) { save(true); toast((p.partNumber || p.description) + ' added to the Parts page'); } }); });
  /* reads as plain text ("2026-09-21" or "—"); turns into a date picker while you edit it */
  var etaF = el('input', { class: 'f jpt-e mono', type: 'text', title: 'ETA', placeholder: '\u2014',
    onFocus: function (e) { e.target.type = 'date'; },
    onBlur: function (e) { e.target.type = 'text'; },
    onInput: function (e) { if (e.target.type === 'date') { p.eta = e.target.value; p.dismM4 = false; save(); } } });
  etaF.value = /^\d{4}-\d{2}-\d{2}$/.test(p.eta || '') ? p.eta : '';
  var qtyF = field('f jpt-q mono', String(p.qty == null ? '' : p.qty), '1', function (v) { p.qty = v; save(); });
  var priceF = field('f jpt-pr mono', num(p.price) ? fx(p.price) : '', '$ each', function (v) { p.price = num(v) ? num(v) : ''; save(); });
  priceF.title = 'Price of one part, in dollars';
  priceF.setAttribute('inputmode', 'decimal');
  priceF.addEventListener('change', function () { if (num(priceF.value)) priceF.value = fx(priceF.value); save(true); render(); });

  var statusSel = partStatusPop(job, p, 'jpt-s jptPop ' + (inHand ? 'ok' : 'pend'), p.status);

  var tickB = el('button', { class: 'jpt-tick' + (inHand ? ' on' : ''), type: 'button',
    title: p.status === 'Installed' ? 'Installed \u2014 use the status menu to change it' : (p.status === 'Received' ? 'Received \u2014 click to mark installed' : 'Mark received'),
    'aria-pressed': inHand ? 'true' : 'false',
    onClick: function (e) {
      e.stopPropagation();
      if (p.status === 'Installed') { toast('Already installed \u2014 use the status menu to change it'); return; }
      pushUndo('part status');
      p.status = p.status === 'Received' ? 'Installed' : 'Received'; p.statusChangedAt = nowIso();
      save(true); render();
      toast('Part ' + p.status.toLowerCase(), { label: 'UNDO', run: function () { restoreSnapshot(); } });
      checkPartsArrived(job);
    } });
  if (inHand) tickB.appendChild(svg(ICON.check, 11, 2.2));

  function advanceOnEnter(input, next) {
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      input.blur();
      if (next) { next.focus(); next.select(); }
    });
  }
  advanceOnEnter(descF, pnF);
  advanceOnEnter(pnF, etaF);
  advanceOnEnter(etaF, qtyF);
  advanceOnEnter(qtyF, priceF);
  advanceOnEnter(priceF, null);

  var ag = partAging(p);
  var aging = ag && ag.state !== 'ok' ? el('span', { class: 'jpt-age ' + ag.state,
    text: ag.state === 'late' ? ag.days + 'd late' : ag.state === 'due' ? (ag.days === 0 ? 'due today' : 'in ' + ag.days + 'd') : 'no ETA · ' + ag.days + 'd' }) : null;

  return el('div', { class: 'jpt' + (ag && (ag.state === 'late' || ag.state === 'noeta') ? ' late' : '') }, [
    tickB,
    descF,
    statusSel,
    aging,
    pnF,
    etaF,
    qtyF,
    priceF,
    (function () {
      var b = el('button', { class: 'jp-x x', type: 'button', title: 'Remove part',
        onClick: function () { pushUndo('delete part'); job.parts = job.parts.filter(function (x) { return x.id !== p.id; }); save(true); render();
          toast('Part removed', { label: 'UNDO', run: function () { restoreSnapshot(); } }); } });
      b.appendChild(svg(ICON.x, 10, 1.6)); return b;
    })()
  ]);
}

/* DTC shapes, matched at the caret. SPN always travels with its FMI —
   "SPN 387 FMI 7" — and is re-spaced to that form on the pill.
   The other shape is a P/B/C/U letter followed by up to six digits. */
/* fault codes and references in Work performed: styled the moment they are typed or pasted */
var DTC_PATTERNS = [
  { re: /(SPN\s*(\d{1,6})\s*(?:\/\s*)?FMI\s*(\d{1,2}))$/i, color: 'blue', kind: 'spn',
    fmt: function (m) { return 'SPN ' + m[2] + ' FMI ' + m[3]; } },
  { re: /(Bulletin\s*#?\s*(\d{4,10}))$/i, color: 'teal', kind: 'bulletin',
    fmt: function (m) { return 'Bulletin ' + m[2]; } },
  { re: /(CBR\s*-?\s*(\d{3,8}))$/i, color: 'purple', kind: 'cbr',
    fmt: function (m) { return 'CBR-' + m[2]; } },
  { re: /([PBCU]\d{4,6})$/i, color: 'amber', kind: 'dtc',
    fmt: function (m) { return m[1].toUpperCase(); } }
];
/* the same codes, found anywhere (paste, blur): matched text is kept as typed, only upper-cased where it's a code */
var DTC_FIND = [
  { re: /\bSPN\s*\d{1,6}\s*(?:\/\s*)?FMI\s*\d{1,2}\b/gi, color: 'blue', kind: 'spn', up: true },
  { re: /\bBulletin\s*#?\s*\d{4,10}\b/gi, color: 'teal', kind: 'bulletin', up: false },
  { re: /\bCBR\s*-?\s*\d{3,8}\b/gi, color: 'purple', kind: 'cbr', up: true },
  { re: /\b[PBCU]\d{4,6}\b/gi, color: 'amber', kind: 'dtc', up: true }
];
function codePill(text, colorKey, kind) {
  var c = PILL_COLORS.filter(function (x) { return x.key === colorKey; })[0] || PILL_COLORS[0];
  var pill = document.createElement('span');
  pill.className = 'dtcPill code code-' + kind;
  pill.dataset.color = c.key; pill.style.background = c.bg; pill.style.color = c.fg;
  pill.textContent = text;
  return pill;
}
/* wrap every code in the field that isn't a pill yet; the caret stays where it was */
function scanCodes(work) {
  var sel = SEL(), caret = null;
  if (sel.rangeCount && work.contains(sel.getRangeAt(0).startContainer)) {
    var r0 = sel.getRangeAt(0).cloneRange(); r0.selectNodeContents(work); r0.setEnd(sel.getRangeAt(0).startContainer, sel.getRangeAt(0).startOffset);
    caret = r0.toString().length;
  }
  var walker = document.createTreeWalker(work, NodeFilter.SHOW_TEXT, null), nodes = [], n;
  while ((n = walker.nextNode())) { if (!(n.parentNode && n.parentNode.closest && n.parentNode.closest('.dtcPill'))) nodes.push(n); }
  var changed = false;
  nodes.forEach(function (node) {
    var text = node.textContent, hits = [];
    DTC_FIND.forEach(function (p) {
      p.re.lastIndex = 0; var m;
      while ((m = p.re.exec(text))) {
        var st = m.index, en = st + m[0].length;
        if (hits.some(function (h) { return st < h.en && en > h.st; })) continue;
        hits.push({ st: st, en: en, p: p });
      }
    });
    if (!hits.length) return;
    hits.sort(function (a, b) { return a.st - b.st; });
    var frag = document.createDocumentFragment(), at = 0;
    hits.forEach(function (h) {
      if (h.st > at) frag.appendChild(document.createTextNode(text.slice(at, h.st)));
      var t = text.slice(h.st, h.en);
      frag.appendChild(codePill(h.p.up ? t.toUpperCase() : t, h.p.color, h.p.kind));
      at = h.en;
    });
    if (at < text.length) frag.appendChild(document.createTextNode(text.slice(at)));
    node.parentNode.replaceChild(frag, node);
    changed = true;
  });
  if (changed && caret !== null) {
    var w2 = document.createTreeWalker(work, NodeFilter.SHOW_TEXT, null), left = caret, t2;
    while ((t2 = w2.nextNode())) {
      if (left <= t2.textContent.length) {
        var inPill = t2.parentNode.closest && t2.parentNode.closest('.dtcPill');
        var r = document.createRange();
        if (inPill && left === t2.textContent.length) { r.setStartAfter(inPill); } else r.setStart(t2, left);
        r.collapse(true); sel.removeAllRanges(); sel.addRange(r); break;
      }
      left -= t2.textContent.length;
    }
  }
  return changed;
}
