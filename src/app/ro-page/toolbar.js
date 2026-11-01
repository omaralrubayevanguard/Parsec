/* Parsec · ro-page · toolbar.js
   The RO toolbar: tabs, the job stepper and job dots, files on the RO (allFiles / addFilesToRO), late parts.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   currentJob gotoJob lateParts allFiles addFilesToRO roPunches shortWhen clockOf jobDotColor renderRoToolbar sgStrip histMatch … (13 functions, 5 constants)
   state      punches
   uses       automations/ kit/ ro/ shell/ state/
*/
/* ============================ RO toolbar: tabs, job stepper, job dots ============================ */

var roTab = null;              /* 'checklist' | 'parts' | 'punches' | 'files' | null */

function currentJob() {
  return S.jobs.filter(function (j) { return j.id === S.ui.card; })[0] || S.jobs[0] || null;
}
function gotoJob(id, focusPart) {
  S.ui.card = id; save(); render();
  requestAnimationFrame(function () {
    var i = -1; S.jobs.forEach(function (j, k) { if (j.id === id) i = k; });
    var card = cardEl(i);
    if (!card) return;
    jcScrollTo(card);
    if (focusPart) {
      var ins = card.querySelectorAll('.jpt-d');
      if (ins.length) ins[ins.length - 1].focus();
    }
  });
}
function lateParts() {
  var n = 0;
  S.jobs.forEach(function (j) { (j.parts || []).forEach(function (p) {
    var a = partAging(p); if (a && (a.state === 'late' || a.state === 'noeta')) n++;
  }); });
  return n;
}
function allFiles() {
  var out = [];
  S.log.forEach(function (e) { (e.files || []).forEach(function (f) { out.push({ f: f, e: e }); }); });
  return out;
}
/* The + on the Files tab. Attachments hang off a task bulletin, so pictures and clips
   go on "Take pictures" and anything else on "Upload Report" — the two file tasks the
   panel already groups by. The entry is created the first time it is needed. */
function addFilesToRO(list) {
  var arr = Array.prototype.slice.call(list || []);
  if (!arr.length) return;
  function isShot(x) { return /^(image|video)\//.test(x.type || ''); }
  var shots = arr.filter(isShot), docs = arr.filter(function (x) { return !isShot(x); });
  pushUndo('attach files');
  if (shots.length) addFiles(pgEntryFor('pics', true).oid, shots);
  if (docs.length) libRouteDocs(docs, null, function (L) { addFiles(pgEntryFor('report', true).oid, L); save(true); });   /* Parsec 17.1: a PDF is offered to the Library first */
  roTab = 'files';
  save(true);
}
function roPunches() {
  var ids = {}; S.jobs.forEach(function (j) { ids[j.id] = j; });
  return STATE.punches.filter(function (p) { return ids[p.opId]; })
    .sort(function (a, b) { return new Date(b.start) - new Date(a.start); });
}
function shortWhen(t) {
  var d = new Date(t); if (isNaN(d)) return '';
  var p = function (n) { return String(n).padStart(2, '0'); };
  return p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}
function clockOf(t) { var d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
var SEV_TOKEN = { '#0E8A5F': 'var(--st-ok)', '#D97706': 'var(--st-wait)', '#D0271D': 'var(--st-bad)' };
function jobDotColor(j) { var c = jobCalc(j); return c.b > 0 ? (SEV_TOKEN[c.sev] || c.sev) : 'var(--st-hold)'; }

function renderRoToolbar() {
  var wrap = el('div', { class: 'rtWrap' });
  var strip = el('div', { class: 'rtStrip' });
  var ticked = S.log.filter(function (e) { return e.done; }).length;
  var t = totals(), late = lateParts(), pcount = roPunches().length, fcount = allFiles().length;

  var TAB_ICON = { parts: IC.part, punches: IC.clock, files: IC.clip,
    history: '' + I3H('history', 15, 15) + '' };
  var roFileInput = el('input', { type: 'file', multiple: 'multiple', style: 'display:none',
    onChange: function (e) { addFilesToRO(e.target.files); e.target.value = ''; } });
  function tabBtn(key, label, badge, badgeCls, plus) {
    var grp = el('div', { class: 'rtTab' + (roTab === key ? ' on' : '') + (plus ? ' split' : '') });
    grp.appendChild(el('button', { class: 'rtTabMain', type: 'button', 'aria-expanded': roTab === key ? 'true' : 'false',
      title: label, 'aria-label': label + (badge === null ? '' : ' (' + badge + ')'),
      onClick: function (e) { e.stopPropagation(); roTab = roTab === key ? null : key; render(); } }, [
      el('span', { class: 'jcIco', html: TAB_ICON[key] || '' }),
      badge === null ? null : el('span', { class: 'rtBadge' + (badgeCls ? ' ' + badgeCls : ''), text: badge })
    ]));
    if (plus) grp.appendChild(el('button', { class: 'rtPlus', type: 'button', title: plus.title,
      onClick: function (e) { e.stopPropagation(); plus.run(); } }, [svg(ICON.plus, 11, 1.9)]));
    return grp;
  }

  var tabs = el('div', { class: 'rtTabs' }, [
    tabBtn('parts', 'Parts', late ? late + ' late' : (t.lines ? t.recv + '/' + t.lines : '0'), late ? 'bad' : '', {
      title: 'Add a part to the current operation',
      run: function () {
        var j = currentJob(); if (!j) return;
        pushUndo('add part'); j.parts.push(blankPart()); save(true); gotoJob(j.id, true);
      } }),
    tabBtn('punches', 'Punches', String(pcount), 'round', {
      title: 'Add a punch by hand for the current operation',
      run: function () {
        var j = currentJob(); if (!j) return;
        UI.modal = { type: 'manual-punch', roId: RO.id, opId: j.id }; tecRender();
      } }),
    tabBtn('files', 'Files', fcount ? String(fcount) : null, 'round', {
      title: 'Attach a file to this RO',
      run: function () { roFileInput.click(); } }),
    tabBtn('history', 'History', (RO.history || []).length ? String((RO.history || []).length) : null, 'round', null)
  ]);
  tabs.appendChild(roFileInput);

  /* ---- OPERATIONS stepper ---- */
  var cur = currentJob();
  var idx = cur ? S.jobs.indexOf(cur) : -1;
  var stDot = el('span', { class: 'stDot' });
  var stName = el('span', { class: 'stName' });
  var stHrs = el('span', { class: 'stHrs mono' });
  var stEff = el('span', { class: 'stEff mono' });
  var stPos = el('span', { class: 'stPos mono' });
  function step(d) {
    if (!S.jobs.length) return;
    var n = (idx + d + S.jobs.length) % S.jobs.length;
    gotoJob(S.jobs[n].id);
  }
  var stepper = el('div', { class: 'opStep' + (cur ? '' : ' empty') }, [
    el('button', { class: 'stArrow', type: 'button', title: 'Previous operation', 'aria-label': 'Previous operation',
      onClick: function (e) { e.stopPropagation(); step(-1); } }, [svg('M7.6 2.6 4.2 6l3.4 3.4', 12, 1.8)]),
    el('button', { class: 'stMid', type: 'button', title: 'All operations on this RO', 'aria-haspopup': 'dialog',
      onClick: function (e) {
        e.stopPropagation();
        if (!S.jobs.length) return;
        if (cur) UI.roPane[RO.id] = cur.id;
        UI.modal = { type: 'op-picker', roId: RO.id, q: '' }; tecRender();
      } }, [stDot, stName, stHrs, stEff, el('span', { class: 'stCaret', html: '<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.6 4.4 6 7.8l3.4-3.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' })]),
    stPos,
    el('button', { class: 'stArrow', type: 'button', title: 'Next operation', 'aria-label': 'Next operation',
      onClick: function (e) { e.stopPropagation(); step(1); } }, [svg('M4.4 2.6 7.8 6l-3.4 3.4', 12, 1.8)])
  ]);

  /* ---- one dot per job ---- */
  var dots = el('div', { class: 'opDots', role: 'group', 'aria-label': 'Operations on this RO' });
  var dotEls = S.jobs.map(function (j, i) {
    var d = el('button', { class: 'opDot', type: 'button',
      title: (j.complaint || 'Operation ' + (i + 1)),
      onClick: function (e) { e.stopPropagation(); gotoJob(j.id); } });
    dots.appendChild(d);
    return d;
  });

  function update() {
    if (cur) {
      var c = jobCalc(cur), live = !!runStartOf(cur);
      stDot.style.background = jobDotColor(cur);
      stDot.classList.toggle('live', live);
      stName.textContent = cur.complaint || 'Operation ' + (idx + 1);
      stHrs.textContent = c.b.toFixed(2) + 'h';
      stEff.textContent = c.eff === null ? '—' : Math.round(c.eff) + '%';
      stEff.style.color = c.eff === null ? 'var(--muted-3)' : sevInk(c.sev);
      stPos.textContent = (idx + 1) + '/' + S.jobs.length;
    } else {
      stName.textContent = 'No operations yet'; stHrs.textContent = ''; stEff.textContent = ''; stPos.textContent = '0/0';
    }
    S.jobs.forEach(function (j, i) {
      var d = dotEls[i], live = !!runStartOf(j), c = jobCalc(j);
      d.style.setProperty('--dc', live ? '#0E8A5F' : jobDotColor(j));
      d.classList.toggle('cur', j === cur);
      d.classList.toggle('live', live);
      d.setAttribute('aria-label', (j.complaint || 'Operation ' + (i + 1)) + ' — ' + fx(c.b) + ' h burnt' +
        (c.eff === null ? '' : ', ' + Math.round(c.eff) + '%') + (live ? ', clock running' : '') + (j === cur ? ', current' : ''));
      d.title = d.getAttribute('aria-label');
    });
  }
  update();
  refs.rtUpdate = update;

  /* The rail toggle leads, then the RO block: number with the customer under it, and
     the status chip beside them. */
  /* Lead group: list toggle and options flank the RO number, the customer sits under
     it, the status chip spans the row below, and the RO information panel drops in
     beneath that when the number is clicked. */
  (function () {
    var rb = pendingRoBlock; pendingRoBlock = null;
    if (!rb) return;
    rb.classList.add('rtRo');
    var lead = el('div', { class: 'rtLead' });
    var rail = pendingRailBtn; pendingRailBtn = null;
    lead.appendChild(rb);
    /* the list toggle sits with the options button, not in front of the RO number */
    var addOp = pendingAddOpBtn; pendingAddOpBtn = null;
    if (addOp) { addOp.classList.add('railBtnTb', 'rtAddOp'); lead.appendChild(addOp); }
    if (rail) { rail.classList.add('railBtnTb'); lead.appendChild(rail); }
    var op = pendingOpts; pendingOpts = null;
    if (op) { op.classList.add('rtOpts', 'rtOptsLead'); lead.appendChild(op); }
    strip.appendChild(lead);
    var info = pendingInfo; pendingInfo = null;
    if (info) { info.classList.add('rtInfo'); strip.appendChild(info); }
    strip.appendChild(el('span', { class: 'rtSep' }));
  })();
  /* the RO's numbers, moved out of the page header */
  /* the RO's numbers, with the options menu right after the efficiency bar */
  (function () {
    var tot = pendingTotals; pendingTotals = null;
    if (!tot) return;
    var mid = el('div', { class: 'rtMid' });
    tot.classList.add('rtTotals'); mid.appendChild(tot);
    strip.appendChild(mid);
    strip.appendChild(el('span', { class: 'rtSep' }));
  })();
  /* the job dots that sat beside the stepper are gone */
  /* Round 57: the stepper and the section tabs ride on top of the job cards, so job
     navigation sits next to the jobs and the RO column keeps the RO-level numbers. */
  var railB = pendingRailBtn, addB = pendingAddOpBtn; pendingRailBtn = null; pendingAddOpBtn = null;   /* from the old pane header */
  if (railB) railB.classList.add('obRail');
  if (addB) addB.classList.add('obAdd');
  refs.opBar = el('div', { class: 'opBar' }, [el('span', { class: 'grow' }), tabs, (RO.shop || RO.id === SHOP_RO_ID) ? addB : null, railB]);   /* extract lives in the RO menu */   /* no operation stepper */   /* list toggle at the far right, extract ops beside it */
  /* The burnt-by-job bar is gone; nothing holds refs.day any more. */
  refs.day = null; refs.dayUpdate = null;
  wrap.appendChild(strip);
  var roSg = sgStrip(''); if (roSg) strip.appendChild(roSg);
  /* the tab panel is appended separately, into the wide column */
  return wrap;
}


/* ---- automation suggestions: on the card they would change ---- */
function sgStrip(opId) {
  var list = autoSuggestionsFor(RO, opId);
  if (!list.length) return null;
  var w = el('div', { class: 'sgStrip', role: 'group', 'aria-label': 'Suggestions' });
  list.forEach(function (sg) {
    w.appendChild(el('div', { class: 'sg', title: sg.rule + ' · suggested ' + shortWhen(sg.at) }, [
      el('span', { class: 'sgIc', text: '✦' }),
      el('span', { class: 'sgTx', text: sg.text }),
      el('button', { class: 'sgOk', type: 'button', text: 'Accept',
        onClick: function (e) { e.stopPropagation(); autoAccept(RO.id, sg.id); render(); tecRender(); } }),
      el('button', { class: 'sgNo', type: 'button', title: 'Dismiss', 'aria-label': 'Dismiss suggestion', text: '✕',
        onClick: function (e) { e.stopPropagation(); autoDismiss(RO.id, sg.id); render(); tecRender(); } })
    ]));
  });
  return w;
}

/* ---- History tab ---- */
var histFilter = 'all', histShow = 200;
var HIST_FILTERS = [['all', 'All'], ['status', 'Status'], ['punch', 'Punches'], ['part', 'Parts'], ['job', 'Operations'], ['detail', 'Details'], ['auto', 'Automations']];
function histMatch(h) {
  if (histFilter === 'all') return true;
  if (histFilter === 'auto') return h.k === 'auto' || /^Automation/.test(h.by || '');
  if (histFilter === 'detail') return h.k === 'ro' || h.k === 'note' || h.k === 'task' || h.k === 'file';
  return h.k === histFilter;
}
function renderHistory(head, body) {
  var all = RO.history || [];
  head.appendChild(el('span', { class: 'rtPanelTitle', text: 'Change history' }));
  head.appendChild(el('span', { class: 'rtDim', style: 'margin-left:8px', text: all.length + (all.length === 1 ? ' change' : ' changes') }));
  var chips = el('div', { class: 'hChips' });
  HIST_FILTERS.forEach(function (f) {
    chips.appendChild(el('button', { class: 'hChip' + (histFilter === f[0] ? ' on' : ''), type: 'button', text: f[1],
      onClick: function (e) { e.stopPropagation(); histFilter = f[0]; histShow = 200; render(); } }));
  });
  body.appendChild(chips);
  var list = all.filter(histMatch).slice().reverse();
  if (!list.length) { body.appendChild(el('div', { class: 'rtEmpty', text: all.length ? 'Nothing of that kind yet.' : 'No changes recorded yet. Everything you change on this RO from now on shows up here.' })); return; }
  var wrap = el('div', { class: 'hList' });
  list.slice(0, histShow).forEach(function (h) {
    var job = h.op ? S.jobs.filter(function (j) { return j.id === h.op; })[0] : null;
    var main = el('span', { class: 'hMain' }, [el('b', { text: h.t })]);
    if (h.o && h.n) { main.appendChild(document.createTextNode(' ')); main.appendChild(el('span', { class: 'hOld', text: h.o })); main.appendChild(document.createTextNode(' → ' + h.n)); }
    else if (h.n || h.o) main.appendChild(document.createTextNode(' ' + (h.n || h.o)));
    main.appendChild(el('small', { text: (h.by || 'You') + (job && h.t.indexOf(job.complaint || '\u0000') < 0 ? ' · ' + (job.complaint || 'Operation') : '') }));
    wrap.appendChild(el('div', { class: 'hRow k-' + h.k + (/^Automation/.test(h.by || '') ? ' by-auto' : '') }, [
      el('span', { class: 'hWhen mono', text: shortWhen(h.at) }), el('span', { class: 'hDot' }), main
    ]));
  });
  body.appendChild(wrap);
  if (list.length > histShow) body.appendChild(el('button', { class: 'btn hMore', type: 'button', text: 'Show ' + Math.min(200, list.length - histShow) + ' more',
    onClick: function (e) { e.stopPropagation(); histShow += 200; render(); } }));
}
