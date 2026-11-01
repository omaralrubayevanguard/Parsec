/* Parsec · ro-page · render-header.js
   The RO header band: compact or open, Details, delete RO.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   confirmDeleteRO applyCompact setDetails renderHeader bandCompact detailsOpen (4 functions, 2 constants)
   state      punches ros
   uses       access/ data/ kit/ pages/ pages/warranty/ ro/ shell/ state/
   at load    on window resize · on document keydown
*/
/* ============================ render: header ============================ */

function confirmDeleteRO() {
  var ro = RO; if (!ro) return; if (!permOk('ro.del')) return;   /* Parsec 13 */
  var nJobs = S.jobs.length, nParts = 0, nPunch = STATE.punches.filter(function (p) { return p.roId === ro.id; }).length;
  S.jobs.forEach(function (j) { nParts += (j.parts || []).length; });
  var running = STATE.punches.some(function (p) { return p.roId === ro.id && !p.stop; });
  var list = el('ul', { class: 'modalList' }, [
    bullet('var(--danger-ink)', nJobs + (nJobs === 1 ? ' operation' : ' operations') + ' and ' + nParts + (nParts === 1 ? ' part line' : ' part lines')),
    bullet('var(--danger-ink)', nPunch + (nPunch === 1 ? ' time punch' : ' time punches') + ' in the Time Log' + (running ? ' (including the one running now)' : '')),
    bullet('var(--danger-ink)', (S.log.length || 0) + ' task bulletin' + (S.log.length === 1 ? '' : 's'))
  ]);
  modal({
    title: 'Delete ' + (S.ro.ra || 'this RO') + '?',
    body: ['The whole repair order goes, along with:', list, 'You can bring it back right after with Undo (Ctrl+Z).'],
    actions: [
      { label: 'Cancel' },
      { label: 'Delete RO', kind: 'danger', run: function () {
          pushUndo('delete RO ' + (ro.roNumber || ''));
          if (UNDO.length) UNDO[UNDO.length - 1].reselect = ro.id;
          audit('ro-del', 'Deleted ' + roLabel(ro) + (ro.customerName ? ' (' + ro.customerName + ')' : ''), ro);
          STATE.punches = STATE.punches.filter(function (p) { return p.roId !== ro.id; });
          STATE.ros = STATE.ros.filter(function (x) { return x.id !== ro.id; });
          if (UI.selectedRo === ro.id) UI.selectedRo = null;
          delete UI.roOp[ro.id];
          scheduleSave(true);
          pushToast('Deleted ' + (ro.roNumber || 'RO') + ' \u2014 Ctrl+Z brings it back.');
          tecRender();
        } }
    ]
  });
}


/* ---- pinned band collapses to one slim line once you scroll into the jobs ---- */
var bandCompact = true;
/* The band is always the slim line now; Details opens it in place. */
function applyCompact(band) { if (band) { band.style.marginBottom = ''; band.classList.add('compact'); } }

window.addEventListener('resize', function () { if (bandCompact) applyCompact(R && R.querySelector('.headBand')); });

var detailsOpen = false;
function setDetails(open) {
  detailsOpen = !!open;
  if (!R) return;
  var pop = jcQuery('.detailsPop');
  if (pop) pop.classList.toggle('open', detailsOpen);
  jcQueryAll('.headBand').forEach(function (band) { band.classList.toggle('expanded', detailsOpen); });
  var hm = jcQuery('.headMain'); if (hm) hm.setAttribute('aria-expanded', detailsOpen ? 'true' : 'false');
  jcQueryAll('.raBtn').forEach(function (b) {
    b.setAttribute('aria-expanded', detailsOpen ? 'true' : 'false');
    b.classList.toggle('on', detailsOpen);
  });
}
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && detailsOpen) setDetails(false); });

function renderHeader() {
  var r = S.ro;
  var daysNode = el('span', { class: 'mono', style: 'font-size:15px;color:#FFBE3D;padding:1px 4px' });
  refs.days = daysNode;

  function col(label, node, iconKey) {
    var lbl = iconKey
      ? el('span', { class: 'lbl lblIcon' }, [el('span', { class: 'lblIco', html: HEAD_ICONS[iconKey] }), document.createTextNode(label)])
      : el('span', { class: 'lbl', text: label });
    return el('div', { class: 'fieldCol' }, [lbl, node]);
  }

  function vinField() {
    var wrap = el('div', { style: 'position:relative;min-width:0' });
    var display = el('div', { class: 'mono', 'aria-hidden': 'true',
      style: 'position:absolute;inset:0;display:flex;align-items:center;padding:0 4px;' +
             'font-size:13px;letter-spacing:.03em;white-space:pre;overflow:hidden;pointer-events:none;color:#F4F4F8' });
    function paintDisplay(v) {
      display.innerHTML = '';
      if (!v) return;
      var head = v.length > 8 ? v.slice(0, -8) : '', last8 = v.slice(-8);
      if (head) display.appendChild(document.createTextNode(head));
      display.appendChild(el('span', { style: 'color:var(--hl-vin);font-weight:700', text: last8 }));
    }
    paintDisplay(r.vin);
    var input = field('f fd mono', r.vin, 'VIN', function (v) {
      r.vin = v; save(); paintDisplay(v);
    }, 'font-size:13px;letter-spacing:.03em;position:relative;z-index:2;background:transparent;color:transparent;caret-color:#F4F4F8;text-align:left');
    input.addEventListener('focus', function () { display.style.visibility = 'hidden'; input.style.color = '#F4F4F8'; });
    input.addEventListener('blur', function () { display.style.visibility = ''; input.style.color = 'transparent'; });
    wrap.appendChild(display); wrap.appendChild(input);
    return wrap;
  }

  var custName = el('span', { class: 'custName', text: r.customer || 'No customer yet', title: r.customer || '' });
  if (!r.customer) custName.classList.add('empty');

  var keyTag = field('f fd mono', r.keyTag, 'Tag #', function (v) { r.keyTag = v; save(); }, 'font-size:15px;font-weight:600;color:#FFBE3D');

  /* ---- Details popover: everything about the unit and the paperwork ---- */
  /* RO totals shown with the details (the slim line keeps Remaining and efficiency) */
  var bandNums = el('div', { class: 'bandNums' });
  function paintBandNums() {
    var t = totals();
    var rem = t.q - t.b;
    bandNums.innerHTML = '<span title="Quoted"><span class="bnL rl">QUOTED</span><b>' + fx(t.q) + '</b></span>' +
      '<span title="' + (rem < 0 ? 'Over the quote' : 'Remaining') + '"><span class="bnL rl">' + (rem < 0 ? 'OVER' : 'REMAINING') + '</span><b style="color:' + (rem < 0 ? 'var(--danger)' : 'var(--good)') + '">' + fx(Math.abs(rem)) + '</b></span>' +
      '<span title="Burnt"><span class="bnL rl">BURNT</span><b>' + fx(t.b) + '</b></span>' +
      '<span title="Received"><span class="bnL rl">RECEIVED</span><b style="color:' + (t.recv === t.lines ? 'var(--ink)' : 'var(--danger)') + '">' + t.recv + ' / ' + t.lines + '</b></span>';
  }
  paintBandNums(); TIMERS.push(paintBandNums);
  var pop = el('div', { class: 'detailsPop' + (detailsOpen ? ' open' : ''), role: 'dialog', 'aria-label': 'RO details',
    onClick: function (e) { e.stopPropagation(); closeMenus(); } }, [
    bandNums,
    (S.jobs.length && !RO.shop) ? el('div', { class: 'detOps' }, [el('span', { class: 'bnL rl', text: 'OPERATIONS \u00b7 JOB TYPE' })].concat(S.jobs.map(function (j, i) {
      return el('div', { class: 'detOpR' }, [el('span', { class: 'detOpN', text: (i + 1) + ' \u00b7 ' + (j.complaint || 'Operation ' + (i + 1)) }),
        chipGroup(JOB_TYPES, jtIdx(j), function (k) { j.jobType = JOB_TYPES[k].key; save(); render(); }, 'djob' + i, i + 1)]);
    }))) : null,
    el('div', { class: 'detailsGrid' }, [
      col('RO #', field('f fd mono', r.ra, 'RO #', function (v) { r.ra = v; save(); syncSoon(); var rt = R.querySelector('.raText'); if (rt) rt.textContent = v || 'No RO #'; }, 'font-size:15px;font-weight:700;color:var(--hl-ra)'), 'caseNo'),
      col('CUSTOMER', field('f fd', r.customer, 'Customer', function (v) {
        r.customer = v; save();
        custName.textContent = v || 'No customer yet';
        custName.classList.toggle('empty', !v);
      }, 'font-size:15px;font-weight:500;color:var(--hl-customer)'), 'customer'),
      col('VIN', el('div', { class: 'vinCell' }, [vinField()]), 'vin'),
      col('MILES', field('f fd mono', r.miles, 'Miles', function (v) { r.miles = v; save(); }, 'font-size:15px;color:var(--hl-miles)'), 'miles'),
      col('UNIT', field('f fd mono', r.unit, 'Unit', function (v) { r.unit = v; save(); }, 'font-size:15px;color:var(--hl-unit)'), 'unit'),
      col('LOCATION', field('f fd', r.location, 'Bay / lot / lane', function (v) { r.location = v; save(); }, 'font-size:15px;color:var(--hl-location)'), 'location'),
      col('ASSIGNED TECH', (function () {
        var inp = field('f fd', r.tech, 'Who is on it', function (v) { r.tech = v; save(); syncSoon(); }, 'font-size:15px;font-weight:600');
        var names = [];
        try { names = staffList().map(function (x) { return x.name; }).filter(Boolean); } catch (e) {}
        if (!names.length) return inp;
        var dl = el('datalist', { id: 'techNames' });
        names.forEach(function (nm) { dl.appendChild(el('option', { value: nm })); });
        inp.setAttribute('list', 'techNames');
        return el('div', { style: 'min-width:0' }, [inp, dl]);
      })(), 'tech'),
      col('TAG', el('div', { style: 'display:flex;gap:8px;align-items:center;min-width:0' }, [keyTag,
        el('button', { type: 'button', class: 'qrBtn', title: 'Key tag with QR code', 'aria-label': 'Key tag with QR code', html: I3H('keyTag', 16, 16),
          onClick: function (e) { e.stopPropagation(); UI.modal = { type: 'keytag', roId: RO.id }; tecRender(); } })]), 'keyTag'),
      col('CASE #', field('f fd mono', r.caseNo, '—', function (v) { r.caseNo = v; save(); }, 'font-size:15px;color:var(--hl-case)'), 'caseNo'),
      col('OPENED', field('f fd mono', r.opened, 'MM-DD-YYYY', function (v) { r.opened = v; save(); updateDays(); }, 'font-size:15px'), 'opened'),
      col('DAYS OPEN', daysNode, 'days'),
      col('DATE CLOSED', field('f fd mono', r.closed, 'Auto when done', function (v) { r.closed = v; save(); updateDays(); }, 'font-size:15px;color:var(--good)'), 'closed'),
      col('DATE BUILT', field('f fd mono', r.built, 'MM-DD-YYYY', function (v) { r.built = v; save(); }, 'font-size:15px'), 'opened'),
      col('WARRANTY STARTS', field('f fd mono', r.warrStart, 'MM-DD-YYYY', function (v) { r.warrStart = v; save(); }, 'font-size:15px'), 'opened'),
      col('ENGINE', (function () {
        var inp = field('f fd', r.engType, 'e.g. D13', function (v) { r.engType = v; save(); }, 'font-size:15px;font-weight:600');
        var dl = el('datalist', { id: 'engTypes' });
        ENGINE_TYPES.forEach(function (nm) { dl.appendChild(el('option', { value: nm })); });
        inp.setAttribute('list', 'engTypes');
        return el('div', { style: 'min-width:0' }, [inp, dl]);
      })(), 'engHours'),
      col('MODEL', (function () {
        var inp = field('f fd', r.model, 'e.g. VNL 760', function (v) { r.model = v; save(); }, 'font-size:15px;font-weight:600');
        var dl = el('datalist', { id: 'truckModels' });
        TRUCK_MODELS.forEach(function (nm) { dl.appendChild(el('option', { value: nm })); });
        inp.setAttribute('list', 'truckModels');
        return el('div', { style: 'min-width:0' }, [inp, dl]);
      })(), 'engHours'),
      col('ENG HRS', field('f fd mono', r.engHours, '\u2014', function (v) { r.engHours = v; save(); }, 'font-size:15px'), 'engHours')
    ])
  ]);


  var raBlock = el('div', { class: 'raStack' }, [
    /* The RO number is the handle for Details: the way back to the RO fields. */
    (function () {
      var ra = el('button', { class: 'raText mono raBtn' + (detailsOpen ? ' on' : ''), type: 'button',
        title: 'RO details \u2014 click to open',
        'aria-expanded': detailsOpen ? 'true' : 'false',
        text: r.ra || 'No RO #',
        onClick: function (e) { e.stopPropagation(); closeMenus(); setDetails(!detailsOpen); } });
      ra.appendChild(el('span', { class: 'raBtnCaret', 'aria-hidden': 'true',
        html: '<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.6 4.4 6 7.8 9.4 4.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>' }));
      return ra;
    })(),
    custName,
    el('div', { class: 'headStatusRow' }, [chipGroup(STATUSES, r.status, function (i) { r.status = i; save(); render(); }, 'status'),
      spotChip(),
      (RO.warranty || S.jobs.some(function (j) { return opJobType(j) === 'WARR'; })) ? (function () { var w = warrReady(RO); return el('button', { type: 'button', class: 'warrBadge ' + w.tier, title: 'Warranty claim readiness ' + w.pct + '% \u2014 click for what is missing', text: 'WARRANTY \u00b7 ' + w.pct + '%',
          onClick: function (e) { e.stopPropagation(); UI.modal = { type: 'warr', roId: RO.id }; tecRender(); } }); })() : null])
  ]);

  refs.totals = renderTotals();

  var bandClock = el('span', { class: 'bandClock compactOnly idle', title: 'Clock running on this RO' },
    [el('span', { class: 'bcDot' }), el('span', { class: 'bcName' }), el('span', { class: 'bcTime mono' })]);
  function paintBandClock() {
    var p = STATE.punches.filter(function (x) { return !x.stop && x.roId === RO.id; })[0];
    bandClock.classList.toggle('idle', !p);
    if (!p) return;
    var j = S.jobs.filter(function (x) { return x.id === p.opId; })[0];
    bandClock.children[1].textContent = j ? (j.complaint || 'Operation') : 'Operation';
    var ms = Date.now() - new Date(p.start).getTime(), sec = Math.floor(ms / 1000);
    bandClock.children[2].textContent = Math.floor(sec / 3600) + ':' + pad(Math.floor(sec / 60) % 60) + ':' + pad(sec % 60);
  }
  paintBandClock();
  TIMERS.push(paintBandClock);
  var railBtn = el('button', { class: 'railBtn', type: 'button',
    title: (railIsMini() ? 'Keep the RO list open' : 'Shrink the RO list to a strip') + ' ( [ )',
    'aria-label': railIsMini() ? 'Keep the RO list open' : 'Shrink the RO list',
    html: '' + I3H('shrink', 19, 19) + '',
    onClick: function (e) { e.stopPropagation(); closeMenus(); toggleRoRail(); } });
  /* The rail toggle and the RO block (number + status chip) ride the operations
     toolbar now; the header keeps the numbers, the customer and the options menu. */
  pendingRailBtn = railBtn;
  /* Add operation: sits just left of the rail button in the RO pane header */
  pendingAddOpBtn = el('button', { class: 'addOpBtn', type: 'button', title: 'Extract operations \u2014 paste text, or read screenshots / a PDF', 'aria-label': 'Extract operations from text or screenshots',
    html: I3H('addJob', 19, 19),
    onClick: function (e) { e.stopPropagation(); closeMenus(); UI.modal = { type: 'extract-ops', roId: RO.id, rows: [], text: '', status: '' }; tecRender();
      setTimeout(function () { var ta = document.getElementById('ops-x-text'); if (ta) ta.focus(); }, 30); } });
  pendingRoBlock = raBlock;
  /* the customer now sits under the RO number inside the RO block */
  var main = el('div', { class: 'headMain' }, [
    bandClock,
    el('span', { class: 'bandCaret', 'aria-hidden': 'true', html: '<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2.6 4.4 6 7.8 9.4 4.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' })
  ]);
  main.classList.add('clickable');
  main.setAttribute('tabindex', '0');
  main.setAttribute('aria-expanded', detailsOpen ? 'true' : 'false');
  main.setAttribute('title', 'Click for RO details');
  /* clicks on fields, buttons and menus do their own thing; anywhere else on the line opens / closes Details */
  function bandHit(e) {
    var p = e.composedPath ? e.composedPath() : [];
    for (var i = 0; i < p.length && p[i] !== main; i++) {
      var n = p[i];
      if (n.nodeType !== 1) continue;
      if (/^(INPUT|BUTTON|SELECT|TEXTAREA|A|LABEL)$/.test(n.tagName) || n.isContentEditable) return false;
      if (n.classList && (n.classList.contains('menu') || n.classList.contains('chipwrap'))) return false;
    }
    return true;
  }
  main.addEventListener('click', function (e) { if (!bandHit(e)) return; closeMenus(); setDetails(!detailsOpen); });
  main.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && (e.composedPath ? e.composedPath()[0] : e.target) === main) { e.preventDefault(); setDetails(!detailsOpen); }
  });

  function roMenu(key) { return iconMenuButton([
    { icon: MENU_ICONS.save, label: 'Save a copy', run: doExport },
    { icon: MENU_ICONS.print, label: 'Print', run: doPdf },
    '-',
    { icon: MENU_ICONS.addJob, label: 'Add operation', run: function () {
        pushUndo('add operation');
        var nj = blankJob(); S.jobs.push(nj); S.ui.card = nj.id; UI.jcFocusNew = nj.id; save(true); render();
      } },
    { icon: MENU_ICONS.addJob, label: 'Extract operations\u2026', run: function () { UI.modal = { type: 'extract-ops', roId: RO.id, rows: [], text: '', status: '' }; tecRender();
        setTimeout(function () { var ta = document.getElementById('ops-x-text'); if (ta) ta.focus(); }, 30); } },
    { icon: MENU_ICONS.addJob, label: 'Add standard operation\u2026', run: function () { UI.modal = { type: 'add-std-op', roId: RO.id }; tecRender(); } },
    { icon: MENU_ICONS.eye, label: RO.warranty ? 'Not a warranty RO' : 'Mark as warranty RO', run: function () {
        pushUndo('warranty flag'); RO.warranty = !RO.warranty; save(true); render();
      } },
  ].concat(can('ro.del') ? ['-', { icon: MENU_ICONS.trash, label: 'Delete RO', danger: true, run: confirmDeleteRO }] : []), key, '', 'Options', 'card'); }
  var opts = roMenu('footerMenu');
  opts.classList.add('optsWrap');
  pendingOpts = opts;


  if (UI.jcOpenDetails) { UI.jcOpenDetails = false; detailsOpen = true; }
  /* Nothing of the band is left in the page header: the RO number, status, customer,
     options and the stat row all ride the operations toolbar. Details and the bulletins
     stay in the pane. `main` is built but not mounted — its click-to-open-Details
     handlers are no longer reachable, and the toolbar opens Details instead. */
  pendingTotals = refs.totals;
  pendingInfo = pop;                       /* the RO fields live in the right-hand pane now */
  /* roMeta is an empty shell kept only so setDetails and the .headBand class hooks
     still have something to toggle */
  var meta = el('div', { class: 'dark headBand compact roMeta' + (detailsOpen ? ' expanded' : '') }, []);
  return { controls: null, meta: meta };
}
