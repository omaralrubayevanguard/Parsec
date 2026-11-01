/* Parsec · ro-page · ivory.js
   The Ivory / Graphite look on the RO page: ivOn, the operation side panel, clockCalm.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ivOn ivInit buildOpSideIv clockCalm (4 functions)
   uses       data/ kit/ ro/ shell/ state/
*/
/* ============ Ivory / Graphite — the RO page from the redesign ============ */
function ivOn() { try { return /^iv[ld]$/.test(resolvedTheme()); } catch (e) { return false; } }
function ivInit(n) { return String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase() || '—'; }
/* operations as rows: status ring, number, title, type, hours, a mini bar, the owner */
function buildOpSideIv() {
  var side = el('div', { class: 'opSide ivOps' });
  var add = el('button', { class: 'ivAdd', type: 'button', title: 'Add operation (O)', html: ivIco('plus') + '<span>Add operation</span>',
    onClick: function (e) { e.stopPropagation(); pushUndo('add operation'); var nj = blankJob(); S.jobs.push(nj); S.ui.card = nj.id; UI.jcFocusNew = nj.id; save(true); render(); } });
  side.appendChild(el('div', { class: 'ivOpsHd' }, [el('h3', { text: 'Operations' }), el('span', { class: 'ivCount', text: String(S.jobs.length) }), el('span', { class: 'grow' }), add]));
  var cur = S.ui.card, who = RO.assignedTech || '';
  S.jobs.forEach(function (j, i) {
    var st = opStatus(j), nm = typeof st === 'string' ? st : st.status, look = jobLook(nm), c = jobCalc(j), live = !!runningPunchOf(j);
    var rp = (j.parts || []).filter(function (p) { return p && (p.description || p.partNumber); }), out = rp.filter(function (p) { return !/Received|Installed/.test(p.status || ''); }).length;
    var t = 'OP'; try { t = opJobType(j); } catch (e) {}
    var pct = c.q > 0 ? Math.min(100, c.b / c.q * 100) : 0, over = c.q > 0 && c.b > c.q;
    side.appendChild(el('button', { class: 'osRow ivRow' + (j.id === cur ? ' on' : '') + (live ? ' live' : ''), type: 'button',
      title: jobStatusLabel(nm) + (typeof st !== 'string' && st.sub ? ' · ' + st.sub : ''),
      onClick: function (e) { e.stopPropagation(); S.ui.card = j.id; render(); } }, [
      (function () { var si = stIcon(look, 'ivSi' + (live ? ' live' : ''), nm); return si; })(),
      el('span', { class: 'ivN', text: String(i + 1) }),
      el('span', { class: 'ivT', text: j.complaint || 'Operation' }),
      out ? el('span', { class: 'ivM', text: out + ' part' + (out === 1 ? '' : 's') + ' not in' }) : null,
      el('span', { class: 'ivTy t-' + t, text: t }),
      el('span', { class: 'ivH', html: fx(c.b) + ' <em>/ ' + fx(c.q) + ' h</em>' }),
      el('span', { class: 'ivMini' }, [el('i', { class: over ? 'over' : '', style: 'width:' + (over ? 100 : pct).toFixed(1) + '%' })]),
      el('span', { class: 'ivAv', title: who, text: ivInit(who) })].filter(Boolean)));
  });
  return side;
}
/* the calm clock: a big timer, the quote as a tick on one bar, four numbers, one round play / stop */
function clockCalm(job) {
  var run = runningPunchOf(job), lock = run ? null : opPartLock(job), q = num(job.quoted);
  var wrap = el('div', { class: 'jtm ivClock' + (run ? ' run' : '') + (lock ? ' locked' : '') + (q > 0 ? '' : ' noq') });
  var big = el('div', { class: 'ivTimer' }), n = punchesOf(job).length;
  var cap = el('div', { class: 'ivCap', text: (run ? 'On this operation' : lock ? 'Locked until the part is in' : 'Not running') + ' · ' + n + ' entr' + (n === 1 ? 'y' : 'ies') });
  var go = el('button', { class: 'jtmBtn ivGo' + (!run && job.declined ? ' is-dec' : ''), type: 'button',
    title: run ? 'Stop the clock' : job.declined ? ropDecTip(job) : lock ? 'Locked — the clock opens when the part is in' : 'Start the clock on this operation',
    'aria-label': run ? 'Stop the clock' : job.declined ? ropDecTip(job) : lock ? 'Clock locked until the part is in' : 'Start the clock', 'aria-disabled': lock || (!run && job.declined) ? 'true' : null,
    html: run ? '<svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="2" width="8" height="8" rx="1.6" fill="currentColor"/></svg>'
      : lock ? LOCK_SVG : '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.2-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6z"/></svg>',
    onClick: function (e) { e.stopPropagation(); toggleJobClock(job); } });
  wrap.appendChild(el('div', { class: 'ivTop' }, [el('div', { class: 'ivTL' }, [big, cap]), go]));
  var fill = el('i', { class: 'ivFill' }), ovr = el('i', { class: 'ivOver' }), qm = el('i', { class: 'ivQ', title: 'Quote' });
  var bar = el('div', { class: 'ivBar', role: 'progressbar', 'aria-label': 'Time against the quote' }, [fill, ovr, qm]);
  wrap.appendChild(bar);
  var qV = el('b'), bV = el('b'), lV = el('b'), eV = el('b'), lK = el('span', { text: 'Left' });
  var qS = el('div', { class: 'ivStat ivQS', role: 'button', tabindex: '0', title: 'Quoted hours — click to change' }, [el('span', { text: 'Quoted' }), qV]);
  function editQ(e) {
    e.stopPropagation(); if (qS.querySelector('input')) return;
    var inp = el('input', { class: 'jtmQin', type: 'text', inputmode: 'decimal', value: q > 0 ? q.toFixed(2) : '' });
    qV.textContent = ''; qV.appendChild(inp); inp.focus(); inp.select();
    var done = false;
    function commit(keep) { if (done) return; done = true; var v = num(inp.value); if (keep && v !== q) { pushUndo('quoted hours'); job.quoted = v ? String(v) : ''; save(true); } render(); }
    inp.addEventListener('keydown', function (ev) { ev.stopPropagation(); if (ev.key === 'Enter') { ev.preventDefault(); commit(true); } else if (ev.key === 'Escape') { ev.preventDefault(); commit(false); } });
    inp.addEventListener('blur', function () { commit(true); });
    inp.addEventListener('click', function (ev) { ev.stopPropagation(); });
  }
  qS.addEventListener('click', editQ);
  qS.addEventListener('keydown', function (e) { if (e.key === 'Enter') editQ(e); });
  wrap.appendChild(el('div', { class: 'ivStats' }, [qS,
    el('div', { class: 'ivStat' }, [el('span', { text: 'Burnt' }), bV]),
    el('div', { class: 'ivStat' }, [lK, lV]),
    el('div', { class: 'ivStat' }, [el('span', { text: 'Efficiency' }), eV])]));
  if (lock) wrap.appendChild(el('div', { class: 'jtmLock', text: lockLine(lock) }));
  function paint() {
    var h = jtmHours(job), over = q > 0 && h > q, mx = Math.max(h, q) || 1;
    wrap.classList.toggle('over', over);
    big.textContent = jtmHMS(h);
    fill.style.width = (q > 0 ? Math.min(h, q) / mx * 100 : 0) + '%';
    ovr.style.left = (q / mx * 100) + '%'; ovr.style.width = over ? ((h - q) / mx * 100) + '%' : '0';
    qm.style.left = 'calc(' + (q > 0 ? q / mx * 100 : 100) + '% - 1px)'; qm.hidden = !(q > 0);
    qV.innerHTML = q > 0 ? q.toFixed(2) + '<small>h</small>' : '—';
    bV.innerHTML = h.toFixed(2) + '<small>h</small>';
    lK.textContent = over ? 'Over' : 'Left';
    lV.innerHTML = q > 0 ? (over ? '+' + (h - q).toFixed(2) : (q - h).toFixed(2)) + '<small>h</small>' : '—';
    lV.className = over ? 'bad' : '';
    var ef = q > 0 && h >= 0.05 ? Math.round(q / h * 100) : null;
    eV.innerHTML = ef == null ? '—' : ef + '<small>%</small>';
    eV.className = ef == null ? '' : ef >= 100 ? 'good' : ef >= 85 ? 'warn' : 'bad';
    bar.setAttribute('aria-valuenow', String(q > 0 ? Math.round(h / q * 100) : 0));
  }
  paint(); if (run) TIMERS.push(paint);
  return wrap;
}
