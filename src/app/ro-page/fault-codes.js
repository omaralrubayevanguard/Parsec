/* Parsec · ro-page · fault-codes.js
   Fault codes on each operation (SPN / FMI): parsing, meanings, the chips and notes; and the operation tile state (mock-ups A + C).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   cardEl parseFault fcSame fcLabel fcShort faultMeaning addFault openFaultNotes faultMini faultBar opTileState opTile … (15 functions, 4 constants)
   state      punches
   uses       access/ automations/ clock/ data/ kit/ pages/fixes/ pages/inventory/ pages/warranty/ ro/ shell/ state/
*/
/* ===================== operation tiles (mockups A + C) =====================
   Every operation sits in one row as a tile. The picked one stays in its place, white with a
   dark edge and a "Selected" tag; the open card shows under the row. States: to do, live,
   held (part or approval), selected, done. */
function cardEl(i) { var j = S.jobs[i]; return j ? R.querySelector('.cardCol > .card[data-job="' + j.id + '"]') : null; }

/* ============ fault-code chips (SPN / FMI) on each operation — N3 + N6 ============ */
var FC_ADD = null;      /* id of the operation whose "add a code" panel is open */
var FC_SPN = { 84: 'Vehicle speed', 91: 'Accelerator pedal position', 94: 'Fuel delivery pressure', 97: 'Water in fuel', 100: 'Engine oil pressure',
  102: 'Boost pressure', 105: 'Intake manifold temperature', 110: 'Engine coolant temperature', 111: 'Engine coolant level', 157: 'Fuel rail pressure',
  168: 'Battery voltage', 190: 'Engine speed', 411: 'EGR differential pressure', 412: 'EGR temperature', 3031: 'DEF tank temperature',
  3216: 'Aftertreatment NOx, intake', 3226: 'Aftertreatment NOx, outlet', 3251: 'DPF differential pressure', 3719: 'DPF soot load',
  4364: 'SCR catalyst conversion efficiency', 5246: 'SCR operator inducement' };
var FC_FMI = ['above normal (most severe)', 'below normal (most severe)', 'erratic or intermittent', 'voltage high or shorted high', 'voltage low or shorted low',
  'current low or open circuit', 'current high or grounded', 'mechanical fault', 'abnormal frequency', 'abnormal update rate', 'abnormal rate of change',
  'root cause not known', 'bad device', 'out of calibration', 'special instructions', 'above normal (least severe)', 'above normal (moderate)',
  'below normal (least severe)', 'below normal (moderate)', 'network data in error'];
function parseFault(str) {
  var d = /^\s*([PCUB])\s*-?\s*(\d{4,6})\s*$/i.exec(String(str || ''));
  if (d) return { code: d[1].toUpperCase() + d[2] };
  var m = /^\s*(?:SPN\s*)?(\d{1,6})\s*(?:\/|-|:|,|\s|FMI)\s*(?:FMI\s*)?(\d{1,2})\s*$/i.exec(String(str || ''));
  if (!m) return null;
  var spn = +m[1], fmi = +m[2];
  return fmi > 31 ? null : { spn: spn, fmi: fmi };
}
var FC_SYS = { P: 'Powertrain', C: 'Chassis', B: 'Body', U: 'Network' };
function fcSame(a, b) { return a.code ? a.code === b.code : (!b.code && a.spn === b.spn && a.fmi === b.fmi); }
function fcLabel(f) { return f.code || 'SPN ' + f.spn + ' \u00b7 FMI ' + f.fmi; }
function fcShort(f) { return f.code || f.spn + '/' + f.fmi; }
function faultMeaning(f) {
  if (f.code) return FC_SYS[f.code.charAt(0)] + ' fault code';
  var fm = f.fmi === 31 ? 'condition exists' : FC_FMI[f.fmi];
  return (FC_SPN[f.spn] || 'SPN ' + f.spn) + (fm ? ' — ' + fm : '');
}
function addFault(job, f) {
  job.faults = job.faults || [];
  if (job.faults.some(function (x) { return fcSame(x, f); })) { toast(fcLabel(f) + ' is already on this operation'); return false; }
  pushUndo('fault code');
  job.faults.push(f.code ? { id: 'fc_' + uid(), code: f.code } : { id: 'fc_' + uid(), spn: f.spn, fmi: f.fmi });
  save(true); render();
  return true;
}
/* tap a chip: open the operation and start a note on that code */
function openFaultNotes(job, f) {
  S.ui.card = job.id; openCard(RO.id, job.id); persistUI(); save(); render();
  setTimeout(function () {
    fabAddNote(job);
    setTimeout(function () {
      var a = R.activeElement, tag = (f.code || 'SPN ' + f.spn + ' FMI ' + f.fmi) + ' — ';
      if (!a) return;
      if (/^(TEXTAREA|INPUT)$/.test(a.tagName) && !a.value.trim()) {
        a.value = tag; a.dispatchEvent(new Event('input', { bubbles: true })); try { a.setSelectionRange(tag.length, tag.length); } catch (e) {}
      } else if (a.isContentEditable && !a.textContent.trim()) {
        a.textContent = tag; var r = document.createRange(); r.selectNodeContents(a); r.collapse(false);
        var sl = R.getSelection ? R.getSelection() : window.getSelection(); if (sl) { sl.removeAllRanges(); sl.addRange(r); }
        a.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 320);
  }, 60);
}
/* N3: small chips on the collapsed operation tile */
function faultMini(job) {
  var fl = job.faults || [];
  var box = el('div', { class: 'fltMini' });
  fl.slice(0, 3).forEach(function (f) {
    box.appendChild(el('button', { class: 'fltM', type: 'button', title: fcLabel(f) + ' — ' + faultMeaning(f) + ' (open notes)',
      text: fcShort(f), onClick: function (e) { e.stopPropagation(); openFaultNotes(job, f); } }));
  });
  if (fl.length > 3) box.appendChild(el('span', { class: 'fltMore', text: '+' + (fl.length - 3) }));
  return box;
}
/* N6: chips on the open card, and a "+ code" that takes 111/1 and shows what it means */
function faultBar(job) {
  var fl = job.faults || [];
  var bar = el('div', { class: 'fltBar' });
  bar.addEventListener('click', function (e) { e.stopPropagation(); });
  var row = el('div', { class: 'fltRow' });
  fl.forEach(function (f) {
    row.appendChild(el('span', { class: 'fltChip' }, [
      el('button', { class: 'fltGo', type: 'button', title: faultMeaning(f) + ' — open notes', onClick: function (e) { e.stopPropagation(); openFaultNotes(job, f); } },
        [el('i', { class: 'fltDot' }), document.createTextNode(fcLabel(f))]),
      el('button', { class: 'fltX', type: 'button', 'aria-label': 'Remove code ' + fcShort(f), title: 'Remove this code', html: svgI('<path d="M6 6l12 12M18 6L6 18"/>', 10),
        onClick: function (e) { e.stopPropagation(); pushUndo('fault code'); job.faults = job.faults.filter(function (x) { return x.id !== f.id; }); save(true); render();
          toast('Code removed', { label: 'UNDO', run: function () { restoreSnapshot(); } }); } })
    ]));
  });
  row.appendChild(el('button', { class: 'fltAdd' + (FC_ADD === job.id ? ' on' : ''), type: 'button', text: '+ code', title: 'Add a fault code',
    onClick: function (e) { e.stopPropagation(); FC_ADD = FC_ADD === job.id ? null : job.id; render();
      if (FC_ADD) requestAnimationFrame(function () { var i = R.querySelector('.fltIn'); if (i) i.focus(); }); } }));
  /* this job's warranty claim, and how often the shop has fixed it before */
  try {
    if (navAllowed('warranty') && wcIsOp(RO, job)) {
      var wcs = wcStatus(RO, job);
      row.appendChild(el('button', { class: 'fltLink wcl wcl-' + WC_ST[wcs].c, type: 'button', text: 'Claim \u00b7 ' + WC_ST[wcs].l, title: 'Open this claim on the Warranty page',
        onClick: function (e) { e.stopPropagation(); UI.view = 'warranty'; UI.wcRo = RO.id; UI.wcFilter = 'all'; persistUI(); tecRender(); window.scrollTo(0, 0); } }));
    }
    if (job.fxQ || job.fxP) {
      var fq = job.fxQ, fp = job.fxP, same = fq && fp && fq.ro === fp.ro;
      var ftx = same ? 'Time & parts from ' + fq.ro : [fq ? 'Time from ' + fq.ro : '', fp ? 'Parts from ' + fp.ro : ''].filter(Boolean).join(' \u00b7 ');
      row.appendChild(el('button', { class: 'fltLink fxa', type: 'button', text: ftx, title: 'Filled in from an earlier fix of the same operation \u2014 open that RO',
        onClick: function (e) { e.stopPropagation(); var g = fq || fp; openRoAt(g.roId, g.opId); } }));
    }
    var fxn = navAllowed('fixes') ? fixCountFor(job) : 0;
    if (fxn) row.appendChild(el('button', { class: 'fltLink fxl', type: 'button', text: 'Fixed ' + fxn + '\u00d7 before', title: 'See the causes and fixes from earlier operations like this',
      onClick: function (e) { e.stopPropagation(); UI.view = 'fixes'; UI.fixKey = fixKeyOf(job.complaint); UI.fixQuery = ''; UI.fixAdd = false; persistUI(); tecRender(); window.scrollTo(0, 0); } }));
  } catch (err) {}
  bar.appendChild(row);
  if (FC_ADD === job.id) {
    var inp = el('input', { class: 'fltIn mono', type: 'text', placeholder: '111/1 or P0420', 'aria-label': 'Fault code: SPN/FMI, or a P, C, B or U code', autocomplete: 'off', spellcheck: 'false' });
    var prev = el('div', { class: 'fltPrev' });
    var addB = el('button', { class: 'fltPlus', type: 'button', text: 'Add ↵' });
    function paint() {
      var f = parseFault(inp.value);
      prev.innerHTML = '';
      if (!inp.value.trim()) { prev.appendChild(el('span', { class: 'fltHint', text: 'Type 111/1 (SPN/FMI) or P0420 (P, C, B, U)' })); addB.disabled = true; return; }
      if (!f) { prev.appendChild(el('span', { class: 'fltHint bad', text: 'Like 111/1 (FMI 0–31) or P0420' })); addB.disabled = true; return; }
      prev.appendChild(el('span', { class: 'fltChip pv' }, [el('span', { class: 'fltGo' }, [el('i', { class: 'fltDot' }), document.createTextNode(fcLabel(f))])]));
      prev.appendChild(el('span', { class: 'fltMean', text: faultMeaning(f) }));
      addB.disabled = false;
    }
    function commit() { var f = parseFault(inp.value); if (!f) return; FC_ADD = null; if (!addFault(job, f)) { FC_ADD = job.id; render(); } }
    inp.addEventListener('input', paint);
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      else if (e.key === 'Escape') { e.preventDefault(); FC_ADD = null; render(); }
    });
    addB.addEventListener('click', function (e) { e.stopPropagation(); commit(); });
    /* recent: codes used on the other operations of this RO */
    var have = {}; fl.forEach(function (f) { have[fcShort(f)] = 1; });
    var recent = [], seen = {};
    S.jobs.forEach(function (j) { (j.faults || []).forEach(function (f) { var k = fcShort(f); if (!have[k] && !seen[k]) { seen[k] = 1; recent.push(f); } }); });
    var panel = el('div', { class: 'fltPanel' }, [
      el('div', { class: 'fltLine' }, [inp, prev, addB]),
      recent.length ? el('div', { class: 'fltRecent' }, [el('span', { class: 'fltRL', text: 'Recent' })].concat(recent.slice(0, 6).map(function (f) {
        return el('button', { class: 'fltM', type: 'button', text: fcShort(f), title: faultMeaning(f), onClick: function (e) { e.stopPropagation(); FC_ADD = null; if (!addFault(job, f)) { FC_ADD = job.id; render(); } } });
      }))) : null
    ]);
    bar.appendChild(panel);
    paint();
  }
  return bar;
}
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

function jobCard(job, idx) {
  var c = jobCalc(job);
  var open = isOpenCard(job) || soloJob === job.id;
  var card = el('div', { class: 'card' + (open ? ' open' : ''), 'data-job': job.id });

  var lostVal = c.lost > 0 ? fx(c.lost) : fx(-c.lost);
  var remLbl = el('span', { class: 'mlbl' + (c.lost > 0 ? ' overLbl' : ''), text: c.lost > 0 ? 'Over' : 'Remaining' });
  var remSpan = el('span', { class: 'mval', style: 'color:' + sevInk(c.sev) + ';margin-left:-6px', text: lostVal,
    title: c.lost > 0 ? 'Over the quote by this much' : 'Remaining' });
  var remHm = el('span', { class: 'hm clk', style: 'margin-left:-3px', text: hms(Math.abs(c.lost)) });
  var barBox = el('span', { class: 'barbox', style: 'display:inline-flex;align-items:center;gap:8px;flex-shrink:0' });
  var bar = effBar(c, !!runStartOf(job));
  var burntInput = null, quotedInput = null, quotedHm = null, burntHm = null;

  function refresh() {
    var n = jobCalc(job);
    pct.textContent = n.eff === null ? '—' : Math.round(n.eff) + '%';
    pct.style.color = n.b > 0 ? sevInk(n.sev) : 'var(--muted-3)';
    bar.updateBar(n, !!runStartOf(job));
    if (runStartOf(job) && burntInput) burntInput.value = fx(n.b);
    if (burntHm) burntHm.textContent = hms(n.b);
    if (quotedHm) quotedHm.textContent = hms(num(job.quoted));
    if (typeof paintCost === 'function') paintCost();
    remSpan.textContent = n.lost > 0 ? fx(n.lost) : fx(-n.lost);
    remSpan.style.color = sevInk(n.sev);
    remSpan.title = n.lost > 0 ? 'Over the quote by this much' : 'Remaining';
    remLbl.textContent = n.lost > 0 ? 'Over' : 'Remaining'; remLbl.classList.toggle('overLbl', n.lost > 0);
    remHm.textContent = hms(Math.abs(n.lost));
    miniBar.updateBar(n, !!runStartOf(job));
    miniPct.textContent = n.eff === null ? '\u2014' : Math.round(n.eff) + '%';
    miniPct.style.color = n.b > 0 ? sevInk(n.sev) : 'var(--muted-3)';
    miniTitle.textContent = job.complaint || 'Operation ' + (idx + 1);
    miniRem.textContent = n.lost > 0 ? fx(n.lost) : fx(-n.lost);
    miniRem.style.color = sevInk(n.sev);
    miniRemL.textContent = n.lost > 0 ? 'OVER' : 'LEFT';
    fillMiniNote();
    updateTotals();
  }

  /* header — sized to its own text as you type (works even where CSS field-sizing doesn't);
     a following spacer (added where it's placed in cardHead) takes up whatever room is left over */
  var complaint = field('f complaintField', job.complaint, 'Complaint / operation', function (v) { job.complaint = v; save(); updateTotals(); },
                        'font-size:15px;font-weight:400;color:var(--ink-strong)');
  autoWidthInput(complaint, 140, 520);
  complaint.addEventListener('click', function (e) { e.stopPropagation(); });

  var pct = el('span', { class: 'pct', style: 'color:' + (c.b > 0 ? sevInk(c.sev) : 'var(--muted-3)'),
                         text: c.eff === null ? '—' : Math.round(c.eff) + '%' });

  quotedInput = field('f mono', num(job.quoted) ? fx(job.quoted) : '', '0', function (v) { job.quoted = num(v); job.dismM2 = false; save(); refresh(); }, 'margin-left:-6px');
  quotedInput.addEventListener('blur', function () {
    if (quotedInput.value.trim()) { job.quoted = r3(quotedInput.value); quotedInput.value = fx(job.quoted); save(); refresh(); }
  });
  quotedInput.addEventListener('click', function (e) { e.stopPropagation(); });
  quotedHm = el('span', { class: 'hm clk', style: 'margin-left:-3px', text: hms(num(job.quoted)) });

  burntInput = field('f mono', runStartOf(job) ? fx(liveBurnt(job)) : (num(job.burnt) ? fx(job.burnt) : ''), '0', function (v) { setTypedBurnt(job, num(v)); save(); refresh(); }, 'margin-left:-6px');
  if (runStartOf(job)) { burntInput.readOnly = true; burntInput.title = 'Clock is running — stop it to edit'; }
  burntInput.addEventListener('blur', function () {
    if (!runStartOf(job) && burntInput.value.trim()) { setTypedBurnt(job, r3(burntInput.value)); burntInput.value = fx(job.burnt); save(); refresh(); }
  });
  burntInput.addEventListener('click', function (e) { e.stopPropagation(); });
  burntHm = el('span', { class: 'hm clk', style: 'margin-left:-3px', text: hms(runStartOf(job) ? liveBurnt(job) : num(job.burnt)) });

  /* Closed cards are a rectangle, not a one-line strip: the head row carries the job's
     identity and its controls, and this second row carries how it is running \u2014 the
     quote bar, what is left, and the last thing written on a punch. Its bar is a second
     instance, because the Metrics bar stays in the body for when the card is open. */
  var miniBar = effBar(c, !!runStartOf(job));
  miniBar.classList.add('cmBar');
  var miniRem = el('span', { class: 'cmRemV mono', style: 'color:' + sevInk(c.sev), text: lostVal });
  var miniRemL = el('span', { class: 'cmRemL', text: c.lost > 0 ? 'OVER' : 'LEFT' });
  var miniNote = el('span', { class: 'cmNote' });
  var miniPct = el('span', { class: 'cmPct mono', style: 'color:' + (c.b > 0 ? sevInk(c.sev) : 'var(--muted-3)'),
    text: c.eff === null ? '\u2014' : Math.round(c.eff) + '%' });
  /* The tile is 170 wide, so the complaint rides as wrapped text rather than as the
     input: the field itself is still there on the open card, where it is edited. */
  var miniTitle = el('div', { class: 'cmTitle', text: job.complaint || 'Operation ' + (idx + 1),
    title: job.complaint || 'Operation ' + (idx + 1) });
  function lastPunchNote() {
    var best = null;
    punchesOf(job).forEach(function (pn) {
      if (!String(pn.notes || '').trim()) return;
      if (!best || new Date(pn.start) >= new Date(best.start)) best = pn;
    });
    var offs = (Array.isArray(job.offNotes) ? job.offNotes : []).slice().sort(function (a, b) { return new Date(a.at) - new Date(b.at); });
    var lastOff = offs[offs.length - 1];
    if (lastOff && (!best || new Date(lastOff.at) >= new Date(best.stop || Date.now()))) return String(lastOff.text || '').replace(/\s+/g, ' ').trim();
    if (!best) return '';
    var ents = noteEntries(best.notes), last = ents[ents.length - 1];
    return last ? last.text.replace(/\s+/g, ' ').trim() : '';
  }
  function fillMiniNote() {
    var t = lastPunchNote();
    miniNote.textContent = t || 'No notes yet \u2014 open to add';
    miniNote.classList.toggle('empty', !t);
    miniNote.title = t || 'Notes written on a time punch show here';
  }
  fillMiniNote();
  var cardMini = el('div', { class: 'cardMini' }, [
    miniTitle,
    el('div', { class: 'cmRun' }, [miniPct, miniBar]),
    el('span', { class: 'cmRem', title: c.lost > 0 ? 'Over the quote by this much' : 'Time left on the quote' }, [miniRemL, miniRem]),
    miniNote,
    open ? null : tileStateChip(job)
  ]);

  var miniStats = el('span', { class: 'miniStats' }, [
    el('span', { class: 'miniStat' }, [el('span', { class: 'mlbl', text: 'Quoted' }), quotedInput, quotedHm]),
    el('span', { class: 'miniStat' }, [el('span', { class: 'mlbl', text: 'Burnt' }), burntInput, burntHm]),
    el('span', { class: 'miniStat' }, [remLbl, remSpan, remHm])
  ]);

  card.dataset.job = job.id;

  function hasFiles(e) { var t = e.dataTransfer && e.dataTransfer.types; return !!t && Array.prototype.indexOf.call(t, 'Files') > -1; }
  card.addEventListener('dragover', function (e) {
    if (!DRAG.id && hasFiles(e)) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; card.classList.add('fileOver'); return; }
    if (!DRAG.id || DRAG.id === job.id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    card.classList.add('dropTarget');
  });
  card.addEventListener('dragleave', function (e) {
    if (!card.contains(e.relatedTarget)) { card.classList.remove('dropTarget'); card.classList.remove('fileOver'); }
  });
  card.addEventListener('drop', function (e) {
    card.classList.remove('dropTarget'); card.classList.remove('fileOver');
    if (!DRAG.id && hasFiles(e)) { e.preventDefault(); e.stopPropagation(); dropFilesOnJob(job, e.dataTransfer.files); return; }
    if (!DRAG.id || DRAG.id === job.id) return;
    e.preventDefault();
    var movedId = DRAG.id;
    DRAG.id = null;
    var from = S.jobs.findIndex(function (j) { return j.id === movedId; });
    var to = S.jobs.findIndex(function (j) { return j.id === job.id; });
    if (from < 0 || to < 0) return;

    var first = cardOffsets();                       /* FLIP: where every card sits now */
    var moved = S.jobs.splice(from, 1)[0];
    S.jobs.splice(to, 0, moved);
    save(true); render();
    glideCards(first);                               /* ...and slide them to where they landed */
  });

  var cardMenu = iconMenuButton([
    { icon: MENU_ICONS.addPart, label: 'Add part', run: function () {
        pushUndo('add part');
        job.parts.push(blankPart());
        save(true); render();
      } },
    '-',
    { icon: MENU_ICONS.print, label: 'Print Op', run: function () { printOp(job); } },
    { icon: MENU_ICONS.eye, label: (soloJob === job.id ? 'Show All Operations' : 'View This Op Only'), run: function () {
        soloJob = (soloJob === job.id) ? null : job.id; render();
      } },
    { icon: MENU_ICONS.addJob, label: 'Move to another RO\u2026', run: function () { moveOpDialog(job); } },
    '-',
    { icon: MENU_ICONS.trash, label: 'Delete operation', danger: true, run: function () {
        modal({
          title: 'Delete this operation?',
          body: [(job.complaint || 'This operation') + ' and its ' + job.parts.length +
                 (job.parts.length === 1 ? ' part line' : ' part lines') +
                 (punchesOf(job).length ? ', plus ' + punchesOf(job).length + ' time punch' + (punchesOf(job).length === 1 ? '' : 'es') + ' in the Time Log,' : '') +
                 ' will be removed.' + (runningPunchOf(job) ? ' Its clock is running now \u2014 it will be stopped and removed with it.' : '')],
          actions: [
            { label: 'Cancel' },
            { label: 'Delete operation', kind: 'danger', run: function () {
                var wasLive = !!runningPunchOf(job);
                snapshot('delete operation');
                STATE.punches = STATE.punches.filter(function (p) { return p.opId !== job.id; });
                S.jobs = S.jobs.filter(function (x) { return x.id !== job.id; });
                if (S.ui.card === job.id) S.ui.card = S.jobs[0] ? S.jobs[0].id : null;
                var oa = openList(RO), ok = oa.indexOf(job.id); if (ok > -1) oa.splice(ok, 1);
                if (soloJob === job.id) soloJob = null;
                save(true); render();
                toast('Operation deleted' + (wasLive ? ' \u2014 its clock was stopped' : ''), { label: 'UNDO', run: function () { restoreSnapshot(); } });
              } }
          ]
        });
      } }
  ], 'jobMenu' + idx, 'flex-shrink:0', null, 'card');
  cardMenu.addEventListener('click', function (e) { e.stopPropagation(); });

  /* The whole header is both the toggle and the drag handle: a click opens or closes
     the card, a press held for a beat arms the drag. Without the hold, dragstart is
     cancelled, so sloppy click-drags never reorder anything by accident. */
  var holdTimer = null, holdArmed = false, headDragged = false;
  function cancelHold() { clearTimeout(holdTimer); holdTimer = null; head.classList.remove('holdReady'); cardMini.classList.remove('holdReady'); }
  var holdSuppress = false;
  function toggleCard() {
    if (headDragged) { headDragged = false; return; }   /* the drag already did the work */
    if (holdSuppress) { holdSuppress = false; return; }  /* held to pick up, let go without moving */
    var a = openList(RO), k = a.indexOf(job.id);
    if (k > -1) a.splice(k, 1); else S.ui.card = job.id;      /* opening a card also makes it the current job */
    persistUI(); save(); render();
  }
  /* the tile's body is as clickable as its head, so the whole 170x200 opens the card */
  cardMini.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('button, input, select, textarea, .chipwrap, .menu')) return;
    toggleCard();
  });
  /* reordering without the long-press — a grip on every card, and a closed tile drags
     from anywhere (a click still opens it; a drag only starts once the mouse moves). */
  function startCardDrag(e) {
    e.stopPropagation();
    headDragged = true;
    DRAG.id = job.id;
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', job.id); } catch (err) {}
    try { e.dataTransfer.setDragImage(card, 24, 20); } catch (err) {}
    setTimeout(function () { card.classList.add('dragging'); }, 0);
  }
  function endCardDrag() {
    card.classList.remove('dragging'); DRAG.id = null; headDragged = false;
    Array.prototype.forEach.call(R.querySelectorAll('.card.dropTarget'), function (n) { n.classList.remove('dropTarget'); });
  }
  var grip = el('span', { class: 'grip dragGrip', draggable: 'true', title: 'Drag to reorder', 'aria-label': 'Drag to reorder this operation',
    html: '<svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true"><g fill="currentColor"><circle cx="3" cy="3" r="1.4"/><circle cx="7" cy="3" r="1.4"/><circle cx="3" cy="8" r="1.4"/><circle cx="7" cy="8" r="1.4"/><circle cx="3" cy="13" r="1.4"/><circle cx="7" cy="13" r="1.4"/></g></svg>',
    onClick: function (e) { e.stopPropagation(); } });
  grip.addEventListener('dragstart', startCardDrag);
  grip.addEventListener('dragend', endCardDrag);
  var head = el('div', { class: 'cardHead', onClick: toggleCard }, [
    complaint,
    (open && !RO.shop) ? faultBar(job) : null,
    el('span', { class: 'grow' }),
    /* The bar and options live in the card's Metrics section. Status sits here on the
       head, between the timer and the menu, so it reads even on a closed card. */
    (open && !RO.shop) ? null : timerBtn(job),
    open ? jobStatusChip(job, idx) : null,
    cardMenu
  ]);
  /* press and hold for half a second anywhere on the header (on a closed tile, anywhere
     on the tile) and the card lifts; then drag it to a new place. A quick click still opens
     or closes it, and moving before the half second is up does nothing. */
  var HOLD_MS = 500, holdAt = null;
  function holdDrag(node) {
    node.setAttribute('draggable', 'true');
    node.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      if (e.target.closest && e.target.closest('button, input, select, textarea, .chipwrap, .menu, .dragGrip')) return;
      holdArmed = false; headDragged = false; holdAt = { x: e.clientX, y: e.clientY };
      clearTimeout(holdTimer);
      holdTimer = setTimeout(function () { holdArmed = true; card.classList.add('holdLift'); node.classList.add('holdReady'); }, HOLD_MS);
    });
    node.addEventListener('mousemove', function (e) {
      if (!holdTimer || holdArmed || !holdAt) return;
      if (Math.abs(e.clientX - holdAt.x) + Math.abs(e.clientY - holdAt.y) > 6) cancelHold();
    });
    node.addEventListener('mouseup', function () { if (holdArmed && !headDragged) holdSuppress = true; cancelHold(); holdArmed = false; card.classList.remove('holdLift'); });
    node.addEventListener('mouseleave', function () { if (!holdArmed) cancelHold(); });
    node.addEventListener('dragstart', function (e) {
      if (!holdArmed) { e.preventDefault(); return; }     /* not held long enough: no drag */
      startCardDrag(e);
    });
    node.addEventListener('dragend', function () { endCardDrag(); holdArmed = false; cancelHold(); card.classList.remove('holdLift'); });
  }
  holdDrag(head);
  if (!open) holdDrag(cardMini);
  card.appendChild(head);
  card.appendChild(cardMini);          /* CSS shows this only while the card is closed */
  var jobSg = RO.shop ? null : sgStrip(job.id); if (jobSg) { card.appendChild(jobSg); card.classList.add('hasSg'); }

  /* body */
  var work = el('div', { class: 'work', contenteditable: 'true', 'data-placeholder': 'What you did.' });
  work.innerHTML = job.work || '';

  function autoCapAtCaret() {
    var sel = SEL();
    if (!sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    if (!range.collapsed) return;
    var node = range.startContainer, offset = range.startOffset;
    if (node.nodeType !== 3 || offset === 0) return;
    var text = node.textContent, ch = text[offset - 1];
    if (!/[a-z]/.test(ch)) return;
    var before = text.slice(0, offset - 1);
    var prevSib = node.previousSibling;
    var atNodeStart = before.length === 0;
    var afterBreak = atNodeStart && (!prevSib || prevSib.nodeName === 'BR');
    var afterBoundary = /[.!?]["')\]]?\s*$/.test(before);
    if (afterBreak || afterBoundary) {
      node.textContent = text.slice(0, offset - 1) + ch.toUpperCase() + text.slice(offset);
      var r = document.createRange(); r.setStart(node, offset); r.setEnd(node, offset);
      sel.removeAllRanges(); sel.addRange(r);
    }
  }

  function wrapLastToken() {
    var sel = SEL();
    if (!sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    if (!range.collapsed) return;
    var node = range.startContainer, offset = range.startOffset;
    if (node.nodeType !== 3) return;

    var head = node.textContent.slice(0, offset);
    var trimmed = head.replace(/[\s,;.)\]]+$/, '');
    var hit = null;
    for (var i = 0; i < DTC_PATTERNS.length && !hit; i++) {
      var m = DTC_PATTERNS[i].re.exec(trimmed);
      if (!m) continue;
      var start = trimmed.length - m[1].length;
      if (start > 0 && /[A-Za-z0-9]/.test(trimmed.charAt(start - 1))) continue;   /* mid-word, skip */
      hit = { start: start, end: trimmed.length, text: DTC_PATTERNS[i].fmt(m), color: DTC_PATTERNS[i].color, kind: DTC_PATTERNS[i].kind };
    }
    if (!hit) return;

    var full = node.textContent;
    var before = full.slice(0, hit.start), rest = full.slice(hit.end);
    var pill = codePill(hit.text, hit.color, hit.kind);
    var parent = node.parentNode;
    var beforeNode = document.createTextNode(before), restNode = document.createTextNode(rest);
    parent.replaceChild(restNode, node);
    parent.insertBefore(pill, restNode);
    parent.insertBefore(beforeNode, pill);
    var caret = Math.max(0, offset - hit.end);
    var r = document.createRange();
    r.setStart(restNode, caret); r.setEnd(restNode, caret);
    sel.removeAllRanges(); sel.addRange(r);
  }

  work.addEventListener('input', function (e) {
    fixBrokenPills(work);
    autoCapAtCaret();
    if (e.inputType === 'insertText' && e.data && /[\s,;)\]]/.test(e.data)) wrapLastToken();
    job.work = work.innerHTML; save();
  });
  work.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    wrapLastToken();
    var sel = SEL();
    if (!sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    range.deleteContents();
    var frag = document.createDocumentFragment();
    var br = document.createElement('br');
    frag.appendChild(br);
    range.insertNode(frag);
    var r = document.createRange();
    r.setStartAfter(br); r.setEndAfter(br);
    sel.removeAllRanges(); sel.addRange(r);
    job.work = work.innerHTML; save();
  });
  work.addEventListener('blur', function () { wrapLastToken(); scanCodes(work); job.work = work.innerHTML; save(); hideSelToolbar(); });
  work.addEventListener('paste', function () { setTimeout(function () { if (scanCodes(work)) { job.work = work.innerHTML; save(); } }, 0); });
  /* pills (new or saved) open their menu; a colour change saves */
  work.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest('.dtcPill') : null;
    if (t && work.contains(t)) { ev.stopPropagation(); openPillMenu(t); }
  });
  work.addEventListener('dtcColorChange', function () { job.work = work.innerHTML; save(); });
  work.addEventListener('beforeinput', function (e) {
    if (e.inputType !== 'insertText' || e.isComposing) return;
    var at = pillAtCaret(work); if (!at) return;
    if (at.off > 0 && at.off < at.len) return;              /* in the middle: you are editing the code itself */
    e.preventDefault();
    var data = e.data || '', sel = SEL(), node, pos;
    var sib = at.off >= at.len ? at.pill.nextSibling : at.pill.previousSibling;
    if (sib && sib.nodeType === 3) {
      if (at.off >= at.len) { sib.insertData(0, data); node = sib; pos = data.length; }
      else { sib.appendData(data); node = sib; pos = sib.length; }
    } else {
      node = document.createTextNode(data);
      at.pill.parentNode.insertBefore(node, at.off >= at.len ? at.pill.nextSibling : at.pill);
      pos = data.length;
    }
    var r = document.createRange(); r.setStart(node, pos); r.collapse(true); sel.removeAllRanges(); sel.addRange(r);
    job.work = work.innerHTML; save();
  });
  work.addEventListener('mouseup', function () {
    setTimeout(function () {
      var sel = SEL();
      if (!sel.rangeCount || sel.isCollapsed) { hideSelToolbar(); return; }
      var range = sel.getRangeAt(0);
      if (!work.contains(range.commonAncestorContainer)) { hideSelToolbar(); return; }
      selToolbarCtx = { job: job, work: work };
      showSelToolbarFor(range);
    }, 0);
  });

  function punchRow(p) {
    var startMs = new Date(p.start).getTime(), stopMs = p.stop ? new Date(p.stop).getTime() : null;
    var row = el('div', { class: 'jev' + (stopMs ? '' : ' run'), 'data-pid': p.id });
    var startF = el('input', { class: 'f jp-t mono', type: 'text', value: fmtTime(p.start), title: 'Start time' });
    startF.addEventListener('blur', function () {
      var ts = applyClockToTimestamp(startMs, startF.value);
      if (ts !== null && Math.floor(ts / 60000) !== Math.floor(startMs / 60000) && (!stopMs || ts < stopMs) && punchClash(p.id, ts, stopMs)) {
        toast('That overlaps another punch \u2014 you can only be on one operation at a time'); startF.value = fmtTime(p.start); return;
      }
      if (ts !== null && Math.floor(ts / 60000) !== Math.floor(startMs / 60000) && (!stopMs || ts < stopMs)) {
        pushUndo('edit punch');
        if (!p.edited) { p.edited = true; p.originalStart = p.start; p.originalStop = p.stop; }
        p.start = new Date(ts).toISOString(); p.editedAt = nowIso();
        save(true); render();
      } else startF.value = fmtTime(p.start);
    });
    row.appendChild(startF);
    row.appendChild(el('span', { class: 'jp-n', title: (p.startReason || '\u2014') + (stopMs ? ' \u2192 ' + (p.stopReason || 'no stop reason') : ' \u2192 running') }, [
      el('span', { class: 'jp-rs', text: p.startReason || '\u2014' }),
      el('span', { class: 'jp-arr', text: '\u2192' }),
      el('span', { class: 'jp-re' + (stopMs ? '' : ' run'), text: stopMs ? (p.stopReason || '\u2014') : 'running' })
    ]));
    /* notes: saved entries (an old stamp, if it has one, on the left), then the field and its Save button */
    var notesBox = el('div', { class: 'jp-notes' });
    noteEntries(p.notes).forEach(function (en, i) {
      notesBox.appendChild(el('div', { class: 'jpn' + (en.ran ? '' : ' legacy') }, [
        el('span', { class: 'jpn-st mono', title: en.ran ? 'Saved ' + en.ran + ' into this punch' : '',
          text: en.ran ? en.ran : '\u2014' }),
        (function () {
          /* click a saved note to fix it: Enter keeps it, Esc puts it back, emptying it deletes it */
          var tx = el('span', { class: 'jpn-tx', text: en.text, title: 'Click to edit this note', spellcheck: 'true' });
          tx.setAttribute('contenteditable', 'plaintext-only');
          if (tx.contentEditable !== 'plaintext-only') tx.setAttribute('contenteditable', 'true');
          var orig = en.text, done = false;
          tx.addEventListener('click', function (e) { e.stopPropagation(); });
          tx.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.stopPropagation(); tx.blur(); }
            else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done = true; tx.textContent = orig; tx.blur(); }
          });
          tx.addEventListener('blur', function () {
            if (done) { done = false; return; }
            var nv = autoPunct(String(tx.textContent || '').replace(/\s*\n\s*/g, ' ').trim());
            if (nv === orig) return;
            var lines = String(p.notes || '').split(/\n/).filter(function (l) { return l.trim(); });
            if (!lines[i]) return;
            var m = /^\[[^\]]*\]\s?/.exec(lines[i]), stamp = m ? m[0].replace(/\s?$/, ' ') : '';
            pushUndo(nv ? 'edit punch note' : 'delete punch note');
            if (nv) lines[i] = stamp + nv; else lines.splice(i, 1);
            p.notes = lines.join('\n');
            save(true); render();
            toast(nv ? 'Note updated' : 'Note deleted', { label: 'UNDO', run: function () { restoreSnapshot(); } });
          });
          return tx;
        })(),
        el('button', { class: 'jpn-x', type: 'button', title: 'Delete this note', 'aria-label': 'Delete this note', text: '\u2715',
          onClick: function (e) {
            e.stopPropagation();
            var lines = String(p.notes || '').split(/\n/).filter(function (l) { return l.trim(); });
            pushUndo('delete punch note'); lines.splice(i, 1); p.notes = lines.join('\n');
            save(true); render();
            toast('Note deleted', { label: 'UNDO', run: function () { restoreSnapshot(); } });
          } })
      ]));
    });
    var noteF = el('textarea', { class: 'f jp-note', rows: '1', placeholder: stopMs ? 'Add a note to this punch' : 'What are you doing right now?', title: 'Note on this punch \u2014 Enter or Save adds it; it also saves itself when you change page or the clock changes',
      onKeydown: function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveNote(); } } });
    if (NOTE_DRAFTS[p.id]) noteF.value = NOTE_DRAFTS[p.id];
    noteF.addEventListener('input', function () { noteDraftSet(p.id, noteF.value); });
    noteF.addEventListener('blur', function () { if (noteF.value.trim()) { noteF.value = autoPunct(noteF.value); noteDraftSet(p.id, noteF.value); } });
    function saveNote() {
      var txt = autoPunct(String(noteF.value || '').replace(/\s*\n\s*/g, ' ').trim());
      if (!txt) { noteF.focus(); return; }
      pushUndo('punch note');
      noteDraftSet(p.id, '');
      var line = txt;
      p.notes = String(p.notes || '').trim() ? String(p.notes).replace(/\s+$/, '') + '\n' + line : line;
      noteF.value = '';
      save(true); render();
    }
    var noteSave = el('button', { class: 'jpn-save', type: 'button', title: 'Save this note', text: 'Save',
      onClick: function (e) { e.stopPropagation(); saveNote(); } });
    notesBox.appendChild(el('div', { class: 'jpn-add' }, [noteF, noteSave]));
    row.appendChild(notesBox);
    var stopF = el('input', { class: 'f jp-t mono', type: 'text', value: stopMs ? fmtTime(p.stop) : '', placeholder: 'now', title: 'Stop time' });
    stopF.addEventListener('blur', function () {
      if (!stopF.value.trim()) return;
      var ts = applyClockToTimestamp(stopMs || startMs, stopF.value);
      if (ts !== null && ts <= startMs && ts + 86400000 > startMs) ts += 86400000;       /* past midnight */
      if (ts !== null && ts > startMs && punchClash(p.id, startMs, ts)) {
        toast('That overlaps another punch \u2014 you can only be on one operation at a time'); stopF.value = stopMs ? fmtTime(p.stop) : ''; return;
      }
      if (ts !== null && ts > Date.now()) { toast('A stop time can\u2019t be in the future'); stopF.value = stopMs ? fmtTime(p.stop) : ''; return; }
      if (ts !== null && ts > startMs && (!stopMs || Math.floor(ts / 60000) !== Math.floor(stopMs / 60000))) {
        pushUndo('edit punch');
        var wasRunning = !p.stop;
        if (!p.edited) { p.edited = true; p.originalStart = p.start; p.originalStop = p.stop; }
        p.stop = new Date(ts).toISOString(); p.editedAt = nowIso();
        if (wasRunning) creditBurnt(p);
        save(true); render();
      } else stopF.value = stopMs ? fmtTime(p.stop) : '';
    });
    row.appendChild(stopF);
    var hmc = el('span', { class: 'jp-hm jp-dur mono', title: 'Duration (hours:minutes)' });
    function paintHrs() { var dh = ((stopMs || Date.now()) - startMs) / 3600000; hmc.textContent = hms(dh); }
    paintHrs();
    if (!stopMs) TIMERS.push(paintHrs);
    row.appendChild(hmc);
    /* reasons change from their own chips, so this is a plain delete button */
    var menu = el('button', { class: 'jp-del', type: 'button', title: 'Delete this punch', 'aria-label': 'Delete this punch', html: MENU_ICONS.trash,
      onClick: function (e) {
        e.stopPropagation(); closeMenus();
        if (deletePunch(p.id) === false) return; save(true); render(); tecRender();
        toast('Punch deleted', { label: 'UNDO', run: function () { restoreSnapshot(); } });
      } });
    row.appendChild(menu);
    /* Strip + rail layout: the start / stop times sit in the margin of a colored rail,
       the reasons read as chips, and notes hang under them. The fields above keep all
       their editing behavior; they are just re-parented into the new frame. */
    var kind = punchKind(p.startReason);
    row.classList.add('jk-' + (stopMs ? kind : 'run'));
    if (stopMs && p.startReason) row.style.setProperty('--k', reasonVar(p.startReason));
    var addMore = null;
    if (stopMs) {
      addMore = el('button', { class: 'jpn-more', type: 'button', text: '+ Add note', title: 'Add a note to this punch',
        onClick: function (e) { e.stopPropagation(); row.classList.add('adding'); noteF.focus(); } });
      noteF.addEventListener('blur', function () { setTimeout(function () { if (!String(noteF.value || '').trim() && document.activeElement !== noteF) row.classList.remove('adding'); }, 150); });
      notesBox.appendChild(addMore);
    }
    var line1 = el('div', { class: 'jev-l1' }, [
      el('span', { class: 'jev-rs' }, [
        reasonChip(p, 'start', p.startReason || '\u2014', kind),
        el('span', { class: 'jev-to', text: 'to' }),
        stopMs ? reasonChip(p, 'stop', p.stopReason || 'No stop reason', punchKind(p.stopReason, false))
               : punchChip('running', 'run')
      ]), menu
    ]);
    row.textContent = '';
    var whoHtml = punchAvHtml(p, 'j');
    row.appendChild(el('div', { class: 'jev-gut' }, [startF, el('span', { class: 'jev-who', html: whoHtml }), stopF]));
    row.appendChild(el('div', { class: 'jev-body' }, [line1, notesBox, el('div', { class: 'jev-durL' }, [hmc])]));
    return row;
  }

  /* ---- strip + rail helpers ---- */
  function punchKind(r, running) {
    if (running) return 'run';
    if (!r) return 'hold';
    if (/^Waiting \u2013 Tech/i.test(r)) return 'tech';
    if (/^Waiting/i.test(r)) return 'waiting';
    if (/^Complete/i.test(r)) return 'complete';
    if (/^Declined/i.test(r)) return 'declined';
    if (typeof STOP_REASONS_BREAK !== 'undefined' && STOP_REASONS_BREAK.indexOf(r) > -1) return 'break';
    if (/^Switched|^Pulled/i.test(r)) return 'hold';
    if (/^Diagnos/i.test(r)) return 'diag';
    if (/^Test|^Bench/i.test(r)) return 'test';
    return 'working';
  }
  function punchChip(text, kind) { return el('span', { class: 'jpc jk-' + kind, text: text, title: text }); }
  /* a reason chip opens its own pop-over of reasons. The change goes through the same
     updatePunchReasons the Time Log uses, so every page (Time Log, Career, day bars) reads it. */
  function reasonChip(p, which, text, kind) {
    var key = 'rsn' + which + p.id;
    var wrap = el('span', { class: 'chipwrap jpc-wrap' });
    var btn = el('button', { class: 'jpc jpc-btn jk-' + kind, type: 'button', 'aria-haspopup': 'menu',
      title: 'Change the ' + which + ' reason \u2014 ' + text });
    var rcr = which === 'start' ? p.startReason : p.stopReason;
    if (rcr) { var rcv = reasonVar(rcr); btn.style.setProperty('--k', 'color-mix(in srgb, ' + rcv + ' 74%, var(--ink))'); btn.style.setProperty('--kb', 'color-mix(in srgb, ' + rcv + ' 17%, var(--surface))'); }
    btn.appendChild(el('span', { class: 'jpc-tx', text: text }));
    btn.appendChild(svg(ICON.down, 8, 2));
    var menu = el('div', { class: 'menu jpc-menu', style: 'left:0;right:auto;width:244px', role: 'menu' });
    var cur = which === 'start' ? (p.startReason || '') : (p.stopReason || '');
    function head(t) { menu.appendChild(el('div', { class: 'jpc-mh', text: t })); }
    function item(r) {
      var on = r === cur;
      menu.appendChild(el('button', { class: 'menuItem jpc-mi' + (on ? ' on' : ''), type: 'button', role: 'menuitemradio', 'aria-checked': on ? 'true' : 'false',
        onClick: function (e) {
          e.stopPropagation(); closeMenus();
          if (on) return;
          var ns = which === 'start' ? r : p.startReason, ne = which === 'stop' ? r : p.stopReason;
          if (updatePunchReasons(p.id, ns, ne)) {
            save(true); render(); tecRender();
            toast((which === 'start' ? 'Start' : 'Stop') + ' reason: ' + r, { label: 'UNDO', run: function () { restoreSnapshot(); } });
          }
        } }, [
        el('span', { class: 'jpc-dot jk-' + punchKind(r), style: '--k:' + reasonVar(r) }),
        el('span', { class: 'jpc-ml', text: r }),
        on ? el('span', { class: 'jpc-ck', html: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6.3 5 8.6l4.6-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' }) : null
      ]));
    }
    if (which === 'start') { head('Start reason'); START_REASONS.forEach(item); }
    else {
      head('Stop reason');
      STOP_REASONS_BREAK.concat(STOP_REASONS_EXPLICIT).forEach(item);
      head('Switches');
      ['Switched job', 'Pulled to another truck'].concat(['Declined']).forEach(item);
    }
    if (cur && (which === 'start' ? START_REASONS : STOP_REASONS_EXPLICIT.concat(['Switched job', 'Pulled to another truck'], STOP_REASONS_BREAK, ['Declined'])).indexOf(cur) < 0) {
      head('Current'); item(cur);
    }
    menu.dataset.menu = key;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var was = menu.classList.contains('open');
      closeMenus();
      if (!was) { menu.classList.add('open'); placeMenuSettled(menu, btn); openMenu = key; }
    });
    wrap.appendChild(btn); wrap.appendChild(menu);
    return wrap;
  }
  function punchMs(p) { var a = new Date(p.start).getTime(); return [a, p.stop ? new Date(p.stop).getTime() : Date.now()]; }
  function dayKeyOf(ms) { var d = new Date(ms); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  function dayLabelOf(ms) {
    if (dayKeyOf(ms) === dayKeyOf(Date.now())) return 'Today';
    return new Date(ms).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  
  function gapText(min) { min = Math.round(min); return min < 60 ? min + ' min' : Math.floor(min / 60) + ' h' + (min % 60 ? ' ' + (min % 60) + ' min' : ''); }
  /* The day strip: one thin row per day the job was worked, all on the same clock range,
     each punch a block colored by its start reason. Clicking a block brings its punch
     on the rail into view. */
  /* the day bar — 15-minute cells coloured by diag / repair / waiting (H1),
     a small icon over each stretch and the start/stop times under the joints (H5) */
  /* the day bar is only the worked time — every punch a segment side by side, sized by how
     long it ran, a thin line between them (a heavier one where the day changes). Point at a
     segment for its day, times and notes; click it to find the punch in the day details. */
  function punchStrip(list) {
    if (!list.length) return null;
    var wrap = el('div', { class: 'dbs' });
    function short(ms) { var d = new Date(ms); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }
    function build() {
      wrap.innerHTML = '';
      var segs = list.map(function (p) { var ms = punchMs(p); return { p: p, a: ms[0], b: ms[1], d: Math.max(60000, ms[1] - ms[0]) }; });
      var total = segs.reduce(function (s, x) { return s + x.d; }, 0) || 1;
      var row = el('div', { class: 'dbs-row' }), days = el('div', { class: 'dbs-days' }), prevDay = null;
      segs.forEach(function (s, i) {
        var p = s.p, day = dayKeyOf(s.a), newDay = day !== prevDay;
        if (i && newDay) row.appendChild(el('i', { class: 'dbs-dsep', 'aria-hidden': 'true' }));
        else if (i) row.appendChild(el('i', { class: 'dbs-sep', 'aria-hidden': 'true' }));
        var notes = noteEntries(p.notes).map(function (n) { return n.text; });
        var dur = hms((s.b - s.a) / 3600000);
        var tip = el('span', { class: 'dbs-tip' }, [
          el('b', { text: dayLabelOf(s.a) + ' · ' + short(s.a) + '–' + (p.stop ? short(s.b) : 'now') }),
          el('span', { class: 'dbs-tr', text: (p.startReason || 'Working') + ' · ' + dur }),
          notes.length ? el('span', { class: 'dbs-tn', text: notes.join(' · ') }) : el('span', { class: 'dbs-tn none', text: 'No note on this punch' })
        ]);
        var seg = el('button', { class: 'dbs-s' + (p.stop ? '' : ' live'), type: 'button', style: 'flex:' + (s.d / total).toFixed(4) + ' 1 0;--k:' + reasonVar(p.startReason || 'Repairing'),
          'aria-label': dayLabelOf(s.a) + ' ' + short(s.a) + ' to ' + (p.stop ? short(s.b) : 'now') + (notes.length ? '. ' + notes.join('. ') : '') }, [
          s.d / total > 0.07 ? el('span', { class: 'dbs-l mono', text: dur }) : null, tip ]);
        seg.addEventListener('click', function (e) {
          e.stopPropagation();
          var it = R.querySelector('.jev[data-pid="' + p.id + '"]'); if (!it) return;
          it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          it.classList.remove('flash'); void it.offsetWidth; it.classList.add('flash');
        });
        row.appendChild(seg);
        if (newDay) days.appendChild(el('span', { class: 'dbs-d', style: 'flex:' + segs.filter(function (x) { return dayKeyOf(x.a) === day; }).reduce(function (t, x) { return t + x.d; }, 0) / total + ' 1 0', text: dayLabelOf(s.a) }));
        prevDay = day;
      });
      wrap.appendChild(row); wrap.appendChild(days);
    }
    build();
    if (list.some(function (p) { return !p.stop; })) { var lastMin = Math.floor(Date.now() / 60000); TIMERS.push(function () { var m = Math.floor(Date.now() / 60000); if (m !== lastMin && wrap.isConnected) { lastMin = m; build(); } }); }
    return wrap;
  }
  /* The rail: each punch on its own colored stretch, a quiet line for the time off the
     job between two punches on the same day, and a day heading when the job ran over
     more than one day. */
  /* off-clock notes — written with no punch running, stamped with the time they were saved */
  function offNotesOf() { return Array.isArray(job.offNotes) ? job.offNotes : []; }
  function offNoteRow(n) {
    var tx = el('span', { class: 'jpn-tx', text: n.text, title: 'Click to edit this note', spellcheck: 'true' });
    tx.setAttribute('contenteditable', 'plaintext-only');
    if (tx.contentEditable !== 'plaintext-only') tx.setAttribute('contenteditable', 'true');
    var orig = n.text, done = false;
    tx.addEventListener('click', function (e) { e.stopPropagation(); });
    tx.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.stopPropagation(); tx.blur(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done = true; tx.textContent = orig; tx.blur(); }
    });
    function drop() { job.offNotes = offNotesOf().filter(function (x) { return x.id !== n.id; }); }
    tx.addEventListener('blur', function () {
      if (done) { done = false; return; }
      var nv = String(tx.textContent || '').replace(/\s*\n\s*/g, ' ').trim();
      if (nv === orig) return;
      pushUndo(nv ? 'edit note' : 'delete note');
      if (nv) n.text = nv; else drop();
      save(true); render();
      toast(nv ? 'Note updated' : 'Note deleted', { label: 'UNDO', run: function () { restoreSnapshot(); } });
    });
    var x = el('button', { class: 'jpn-x', type: 'button', title: 'Delete this note', 'aria-label': 'Delete this note', text: '\u2715',
      onClick: function (e) {
        e.stopPropagation(); pushUndo('delete note'); drop(); save(true); render();
        toast('Note deleted', { label: 'UNDO', run: function () { restoreSnapshot(); } });
      } });
    var d = new Date(n.at);
    return el('div', { class: 'jofn', 'data-nid': n.id }, [
      el('span', { class: 'jofn-t mono', text: fmtTime(n.at), title: d.toLocaleString() }),
      el('div', { class: 'jofn-b' }, [
        el('span', { class: 'jofn-tag', text: 'Off clock' }),
        el('div', { class: 'jpn' }, [tx, x])
      ])
    ]);
  }
  function offNoteAdd() {
    var f = el('textarea', { class: 'f jp-note jofn-in', rows: '1', placeholder: 'Add a note \u2014 no clock needed',
      title: 'Saves a note on this operation without clocking on. It goes into the timeline at the time you save it.',
      onKeydown: function (e) { e.stopPropagation(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(); } },
      onClick: function (e) { e.stopPropagation(); } });
    if (OFF_DRAFTS[job.id]) f.value = OFF_DRAFTS[job.id];
    f.addEventListener('input', function () { if (f.value.trim()) OFF_DRAFTS[job.id] = f.value; else delete OFF_DRAFTS[job.id]; });
    f.addEventListener('blur', function () { if (f.value.trim()) { f.value = autoPunct(f.value); OFF_DRAFTS[job.id] = f.value; } });
    function go() {
      var txt = autoPunct(String(f.value || '').replace(/\s*\n\s*/g, ' ').trim());
      if (!txt) { f.focus(); return; }
      pushUndo('off-clock note');
      delete OFF_DRAFTS[job.id];
      job.offNotes = offNotesOf().concat([{ id: 'on' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: new Date().toISOString(), text: txt }]);
      save(true); render();
      toast('Note saved', { label: 'UNDO', run: function () { restoreSnapshot(); } });
    }
    return el('div', { class: 'jofn-add' }, [f, el('button', { class: 'jpn-save', type: 'button', text: 'Save', title: 'Save this note \u2014 no clock needed',
      onClick: function (e) { e.stopPropagation(); go(); } })]);
  }
  function punchRail(list) {
    var rail = el('div', { class: 'jtl' }), multi = false, prev = null;
    var notes = offNotesOf().slice().sort(function (a, b) { return new Date(a.at) - new Date(b.at); }), ni = 0;
    function flushNotes(upTo) {
      while (ni < notes.length && (upTo == null || new Date(notes[ni].at).getTime() < upTo)) rail.appendChild(offNoteRow(notes[ni++]));
    }
    list.forEach(function (p) { if (prev && dayKeyOf(punchMs(p)[0]) !== dayKeyOf(punchMs(prev)[0])) multi = true; prev = p; });
    prev = null;
    list.forEach(function (p) {
      var ms = punchMs(p), k = dayKeyOf(ms[0]);
      var newDay = !prev || dayKeyOf(punchMs(prev)[0]) !== k;
      if (multi && newDay) rail.appendChild(el('div', { class: 'jtl-day', text: dayLabelOf(ms[0]) }));
      if (prev && !newDay && prev.stop) {
        var off = (ms[0] - new Date(prev.stop).getTime()) / 60000;
        if (off >= 1) rail.appendChild(el('div', { class: 'jtl-gap', text: gapText(off) + ' off this operation' }));
      }
      flushNotes(ms[0]);
      rail.appendChild(punchRow(p));
      prev = p;
    });
    flushNotes(null);
    return rail;
  }

  var punches = punchesOf(job);
  /* the day bar and the day details each fold on their own */
  function jtlSub(k) {
    if (k === 'rail' && punches.length) return null;                 /* one fold for the day bar and the day details */
    if (k === 'strip' && !!job.punchRailShut !== !!job.punchStripShut) job.punchRailShut = !!job.punchStripShut;
    var shut = k === 'strip' ? !!job.punchStripShut : !!job.punchRailShut;
    var nDays = {}; punches.forEach(function (x) { nDays[dayKeyOf(punchMs(x)[0])] = 1; });
    var nd = Object.keys(nDays).length;
    var nOff = offNotesOf().length;
    var extra = k === 'strip' ? (nd + (nd === 1 ? ' day' : ' days'))
      : ((punches.length ? punches.length + (punches.length === 1 ? ' punch' : ' punches') : '') + (punches.length && nOff ? ' \u00b7 ' : '') + (nOff ? nOff + (nOff === 1 ? ' note' : ' notes') : ''));
    var c = svg(ICON.down, 9, 1.9); c.setAttribute('class', 'jtl-sub-c');
    return el('button', { class: 'jtl-sub' + (shut ? ' shut' : ''), type: 'button', 'aria-expanded': shut ? 'false' : 'true',
      title: (shut ? 'Show the ' : 'Hide the ') + (k === 'strip' ? 'day bar' : 'day details'),
      onClick: function (e) {
        e.stopPropagation();
        if (k === 'strip') { job.punchStripShut = !job.punchStripShut; job.punchRailShut = job.punchStripShut; } else job.punchRailShut = !job.punchRailShut;
        save(); render();
      } }, [c, el('span', { class: 'jtl-sub-t', text: k === 'strip' ? 'Day bar & details' : 'Day details' }), el('span', { class: 'jtl-sub-n', text: extra })]);
  }
  function addBtn(label, run, icon) {
    return el('button', { class: 'jadd jaddIc', type: 'button', title: label, 'aria-label': label,
      onClick: function (e) { e.stopPropagation(); run(); } }, [el('span', { class: 'jcIco', html: icon })]);
  }
  function txtBtn(text, label, run, icon) {
    return el('button', { class: 'jadd jaddTx', type: 'button', title: label,
      onClick: function (e) { e.stopPropagation(); run(); } }, [el('span', { class: 'jcIco', html: icon }), el('span', { text: text })]);
  }
  var punchHeader = el('div', { class: 'jsec-h' }, [
    el('button', { class: 'jsec-t', type: 'button', 'aria-expanded': job.punchesCollapsed ? 'false' : 'true',
      onClick: function (e) { e.stopPropagation(); job.punchesCollapsed = !job.punchesCollapsed; save(); render(); } }, [
      (function () { var s = svg(ICON.down, 10, 1.8); s.className = 'jsec-caret' + (job.punchesCollapsed ? ' shut' : ''); return s; })(),
      el('span', { class: 'rl', text: 'Time punches' })
    ]),
    (function () {
      if (!punches.length) return null;
      var b = el('b'), sum = el('span', { class: 'jsum' }, [b, document.createTextNode(' over ' + punches.length + (punches.length === 1 ? ' punch' : ' punches'))]);
      function paintSum() { b.textContent = hms(punches.reduce(function (a, p) { var ms = punchMs(p); return a + (ms[1] - ms[0]); }, 0) / 3600000); }
      paintSum(); if (punches.some(function (p) { return !p.stop; })) TIMERS.push(paintSum);
      return sum;
    })(),
    el('span', { class: 'grow' }),
    addBtn('Join the punch notes into one paragraph, in order, exactly as typed',
      function () { var t = composePunchStory(job); if (!t) { toast('No notes on this operation yet'); return; }
        job.punchStory = t; job.punchStoryRev = (job.punchStoryRev || 0) + 1; save(true); render(); },
      ICON_STORY),
    addBtn('Add time', function () { UI.modal = { type: 'manual-punch', roId: RO.id, opId: job.id }; tecRender(); }, IC.clockPlus)
  ]);
  var storyBox = null;
  if (job.punchStory) {
    storyBox = el('div', { class: 'jstory' }, [
      el('div', { class: 'jstory-h' }, [
        el('span', { class: 'rl', text: 'From the punch notes' }),
        el('span', { class: 'jstory-rev mono', text: 'v' + (job.punchStoryRev || 1) }),
        el('span', { class: 'grow' }),
        el('button', { class: 'jstory-x', type: 'button', title: 'Copy this paragraph', 'aria-label': 'Copy',
          onClick: function (e) { e.stopPropagation();
            copyText(job.punchStory).then(function () { toast('Paragraph copied'); }); } }, [svg('M4.5 4.5h5v5h-5zM3 7.5H1.5v-6h6V3', 13, 1.5)]),
        el('button', { class: 'jstory-x', type: 'button', title: 'Clear it', 'aria-label': 'Clear',
          onClick: function (e) { e.stopPropagation(); job.punchStory = ''; job.punchStoryRev = 0; save(true); render(); } }, [svg(ICON.x, 12, 1.7)])
      ]),
      el('p', { class: 'jstory-p', text: job.punchStory })
    ]);
  }
  var punchBlock = el('div', { class: 'jsec' }, [
    punchHeader,
    job.punchesCollapsed ? null : ((punches.length || offNotesOf().length)
      ? el('div', { class: 'jtlWrap' }, [
          punches.length ? jtlSub('strip') : null, (punches.length && !job.punchStripShut) ? punchStrip(punches) : null,
          jtlSub('rail'), job.punchRailShut ? null : punchRail(punches)])
      : el('div', { class: 'jhint', text: 'No time on this operation yet.' })),
    job.punchesCollapsed ? null : offNoteAdd(),
    job.punchesCollapsed ? null : storyBox
  ]);

  /* ---- Metrics: the quote against the clock, and the controls that move it ---- */
  /* what the operation costs: labour at the shop rate, parts, anything else */
  var costTiles = {};
  function costTile(key, label, child) {
    var v = el('span', { class: 'mval mono', text: '' });
    costTiles[key] = v;
    return el('div', { class: 'jmtT' }, [el('span', { class: 'mlbl', text: label }), child || v]);
  }
  var otherIn = field('f mono', num(job.otherCost) ? fx(job.otherCost) : '', '$0.00', function (v) { job.otherCost = num(v) ? num(v) : ''; save(); paintCost(); }, 'margin-left:-6px');
  otherIn.title = 'Sublet, shop supplies or anything else charged on this operation';
  otherIn.setAttribute('inputmode', 'decimal');
  otherIn.addEventListener('click', function (e) { e.stopPropagation(); });
  otherIn.addEventListener('blur', function () { if (otherIn.value.trim()) otherIn.value = fx(otherIn.value); });
  var costNote = el('span', { class: 'hm', text: '' });
  var costBox = el('div', { class: 'jmt jcost' }, [
    costTile('labor', 'Labor', null), costTile('parts', 'Parts', null), costTile('other', 'Other', otherIn), costTile('total', 'Operation total', null)
  ]);
  costBox.children[0].appendChild(costNote);
  var estNote = el('span', { class: 'hm', text: '' }); costBox.children[3].appendChild(estNote);
  function paintCost() {
    var k = opCost(job);
    costTiles.labor.textContent = usd(k.labor); costTiles.parts.textContent = usd(k.parts); costTiles.total.textContent = usd(k.total);
    costNote.textContent = fx(num(job.quoted)) + ' h \u00d7 ' + usd(laborRate()) + '/h';
    estNote.textContent = +job.estCost > 0 ? 'Estimate on the case ' + usd(job.estCost) : '';
  }
  paintCost();
  /* the clock as a dark bar, then the quote in three tiles */
  var metricsBox = el('div', { class: 'jbx jbx-metrics jbx-clock' }, [
    clockBar(job),
    costBox
  ]);

  var workBlock = el('div', { class: 'jbx jbx-work' }, [
    el('div', { class: 'jbx-h' }, [el('span', { class: 'jbx-t rl', text: 'Work performed' })]),
    el('div', { class: 'workWrap' }, [work, el('button', { class: 'workGen', type: 'button',
      title: 'Write a complaint \u00b7 cause \u00b7 correction paragraph for warranty claims and triage, from this operation and similar past operations',
      'aria-label': 'Generate warranty and triage summary',
      html: '' + I3H('spark', 15, 15) + '',
      onMousedown: function (e) { e.preventDefault(); },
      onClick: function (e) { e.stopPropagation(); job.work = work.innerHTML; openTechSummary(job, work); } }),
      el('button', { class: 'workCopy', type: 'button',
      title: 'Copy the work performed as one paragraph, without the date and time stamps', 'aria-label': 'Copy work performed',
      html: '' + I3H('copy', 15, 15) + '',
      onMousedown: function (e) { e.preventDefault(); },
      onClick: function (e) {
        e.stopPropagation();
        var txt = workPlainText(work);
        if (!txt) { toast('Nothing to copy yet'); return; }
        var btn = e.currentTarget;
        copyText(txt).then(function () { toast('Work performed copied \u2014 ' + txt.length + ' characters'); btn.classList.add('done'); setTimeout(function () { btn.classList.remove('done'); }, 1400); });
      } })])
  ]);

  var nHand = job.parts.filter(partInHand).length;
  var ptSg = null; try { ptSg = partSuggestFor(job); } catch (e) {}
  var parts = el('div', { class: 'jsec partsSec' + (job.partsCollapsed ? ' shut' : '') }, [
    el('div', { class: 'jsec-h' }, [
      el('button', { class: 'jsec-t', type: 'button', 'aria-expanded': job.partsCollapsed ? 'false' : 'true',
        onClick: function (e) { e.stopPropagation(); job.partsCollapsed = !job.partsCollapsed; save(); render(); } }, [
        (function () { var s = svg(ICON.down, 10, 1.8); s.className = 'jsec-caret' + (job.partsCollapsed ? ' shut' : ''); return s; })(),
        el('span', { class: 'rl', text: 'Parts' })
      ]),
      job.parts.length ? el('span', { class: 'jsum' }, [el('b', { text: nHand + '/' + job.parts.length }), document.createTextNode(' in hand')]) : null,
      el('span', { class: 'grow' }),
      (job.partsCollapsed && ptSg) ? txtBtn('Suggested', 'Parts used the last time this operation was done', function () { job.partsCollapsed = false; save(); render(); }, '<svg class="bi-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>') : null,
      /* quick actions for every part on this operation */
      (function () {
        var real = job.parts.filter(function (p) { return (p.description || p.partNumber || '').toString().trim(); });
        var notIn = real.filter(function (p) { return !partInHand(p); });
        if (!notIn.length) return null;
        return txtBtn('All received', 'Mark all ' + notIn.length + ' part' + (notIn.length === 1 ? '' : 's') + ' not in hand yet as received', function () {
          pushUndo('parts received');
          var at = nowIso();
          notIn.forEach(function (p) { p.status = 'Received'; p.statusChangedAt = at; });
          save(true); render(); checkPartsArrived(job);
          toast(notIn.length + ' part' + (notIn.length === 1 ? '' : 's') + ' received', { label: 'UNDO', run: function () { restoreSnapshot(); } });
        }, '<svg class="bi-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12.5l4 4L15 8.5"/><path d="M11 16.5l1 0.5L21 8"/></svg>');
      })(),
      (function () {
        var real = job.parts.filter(function (p) { return (p.description || p.partNumber || '').toString().trim(); });
        var notInst = real.filter(function (p) { return p.status !== 'Installed'; });
        if (!notInst.length) return null;
        return txtBtn('All installed', 'Mark all ' + notInst.length + ' part' + (notInst.length === 1 ? '' : 's') + ' as installed', function () {
          pushUndo('parts installed'); var at = nowIso();
          notInst.forEach(function (p) { p.status = 'Installed'; p.statusChangedAt = at; });
          save(true); render();
          toast(notInst.length + ' part' + (notInst.length === 1 ? '' : 's') + ' installed', { label: 'UNDO', run: function () { restoreSnapshot(); } });
        }, '<svg class="bi-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 5.5a4 4 0 0 0-5 5L4 16v4h4l5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/></svg>');
      })(),
      job.parts.length ? txtBtn(PT_COMPACT ? 'Expand all' : 'Collapse all', PT_COMPACT ? 'Show every detail on every part' : 'Show just the name and status of each part', function () { PT_COMPACT = !PT_COMPACT; render(); },
        PT_COMPACT ? '<svg class="bi-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg>' : '<svg class="bi-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 20l5-5 5 5M7 4l5 5 5-5"/></svg>') : null,
      job.parts.length ? txtBtn('Delete all', 'Remove every part from this operation (you can undo)', function () {
        var n = job.parts.length;
        pushUndo('delete all parts');
        job.parts = [];
        save(true); render();
        toast(n + ' part' + (n === 1 ? '' : 's') + ' removed', { label: 'UNDO', run: function () { restoreSnapshot(); } });
      }, '<svg class="bi-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/></svg>') : null,
      txtBtn('Inventory', 'Search the Parts page and add parts to this operation', function () { openInvPicker(job); }, '<svg class="bi-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9"/></svg>'),
      addBtn('Extract parts from pasted text, a screenshot or a PDF', function () { openExtractParts(job); }, '<svg class="bi-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7V5.5A1.5 1.5 0 0 1 5.5 4H7M17 4h1.5A1.5 1.5 0 0 1 20 5.5V7M20 17v1.5a1.5 1.5 0 0 1-1.5 1.5H17M7 20H5.5A1.5 1.5 0 0 1 4 18.5V17"/><path d="M8 9.5h8M8 12.5h8M8 15.5h5" /><rect x="7" y="8" width="10" height="9" rx="1.2" fill="currentColor" opacity=".1" stroke="none"/></svg>')
    ]),
    job.partsCollapsed ? null : el('div', { class: 'ptWrap' }, [
      ptSg ? partSuggestBox(job, ptSg) : null,
      job.parts.length ? null : el('div', { class: 'jEmpty' }, [el('b', { text: 'No parts on this operation.' }), document.createTextNode(' Scan a quote, or type one line below.')]),
      el('div', { class: 'ptGrid' + (PT_COMPACT ? ' compact' : '') }, job.parts.map(function (p) { return partTile(job, p); })),
      quickRow()
    ])
  ]);
  function quickRow() {
    var inp = el('input', { type: 'text', 'aria-label': 'Quick add a part',
      placeholder: 'Quick add \u2014 e.g. 4988201 x2 brake chamber $45.99   (Enter)',
      title: 'Type part number, quantity (x2), description and price ($45.99) in any order, then press Enter' });
    inp.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.shiftKey) return;
      e.preventDefault();
      var q = parseQuickPart(inp.value);
      if (!q.desc && !q.pn) return;
      pushUndo('add part');
      var np = blankPart(); np.description = q.desc; np.partNumber = q.pn; np.qty = q.qty; if (q.price) np.price = q.price;
      job.parts.push(np); var newInv = invAddFromPart(np, RO && RO.roNumber); save(true); render();
      toast('Added ' + (q.desc || q.pn) + (q.qty !== '1' ? ' \u00d7' + q.qty : '') + (q.price ? ' \u00b7 ' + usd(+q.price) : '') + (newInv ? ' \u00b7 new on the Parts page' : ''));
      requestAnimationFrame(function () {
        var i = S.jobs.indexOf(job), c = cardEl(i);
        var qi = c && c.querySelector('.jquick input'); if (qi) qi.focus();
      });
    });
    return el('div', { class: 'jquick' }, [el('span', { class: 'jcIco', html: IC.plus }), inp]);
  }

  /* Bento: each concern in its own box, so the card reads as sections instead of one
     long column. Metrics and Work span the width; parts and punches sit side by side
     while there is room and stack when the pane narrows. */
  parts.classList.add('jbx', 'jbx-parts');
  punchBlock.classList.add('jbx', 'jbx-punch');
  /* Work performed is off the card. The element and its handlers are still built, so
     job.work, the DTC scanning and the warranty summary keep working on the stored
     text — it just is not edited from here any more. */
  card.appendChild(el('div', { class: 'cardBody' }, [
    el('div', { class: 'jbento' }, [metricsBox, punchBlock, parts, RO.shop ? null : opLogBox(job)])
  ]));
  if (runStartOf(job)) TIMERS.push(refresh);
  return card;
}
