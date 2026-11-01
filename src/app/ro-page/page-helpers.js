/* Parsec · ro-page · page-helpers.js
   Helpers the RO page's renderers share: operation state chips, parts arrived checks, dropping files on a job, visit words, similar jobs.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   agoShort opStateInfo tileStateChip checkPartsArrived dropFilesOnJob visitWords similarComplaint pastVisits renderPastVisits vinInfo tsIc tsNum … (25 functions, 13 constants)
   state      ros
   uses       access/ data/ kit/ ro/ shell/ state/
*/
          /* job id -> { node, scene } so the truck glides between renders */

/* ============================ RO page helpers ============================ */
function agoShort(ms) {
  if (ms == null || !isFinite(ms) || ms < 0) return '';
  var m = Math.floor(ms / 60000); if (m < 60) return m + 'm';
  var h = Math.floor(m / 60); if (h < 24) return h + 'h' + (m % 60 ? ' ' + (m % 60) + 'm' : '');
  var d = Math.floor(h / 24); return d + 'd' + (h % 24 ? ' ' + (h % 24) + 'h' : '');
}
/* where an operation stands, and since when */
function opStateInfo(job) {
  var run = runStartOf(job);
  if (run) return { name: 'Working', label: 'Working', kind: 'work', ms: Date.now() - run, extra: '' };
  var st = opStatus(job), name = typeof st === 'string' ? st : st.status;
  var lastStop = 0;
  punchesOf(job).forEach(function (p) { if (p.stop) { var t = new Date(p.stop).getTime(); if (t > lastStop) lastStop = t; } });
  var setAt = job.jobStatus && job.jobStatus.setAt ? new Date(job.jobStatus.setAt).getTime() : 0;
  var since = Math.max(lastStop, setAt || 0);
  var extra = '';
  if (name === 'Waiting – Parts') {
    var late = (job.parts || []).filter(function (p) { var a = partAging(p); return a && a.state === 'late'; }).length;
    if (late) extra = late + ' late';
  }
  return { name: name, label: jobStatusLabel(name), kind: /^Waiting/.test(name) ? 'wait' : /^Complete|Declined/.test(name) ? 'done' : 'hold',
    ms: since ? Date.now() - since : null, extra: extra };
}
/* 8: the closed tile's bottom line */
function tileStateChip(job) {
  var chip = el('span', { class: 'cmState' });
  function paint() {
    var s = opStateInfo(job), look = s.kind === 'work' ? JC_STATUS_LOOK['Working'] : jobLook(s.name);
    chip.className = 'cmState k-' + s.kind;
    chip.style.setProperty('--sc', look.dot || look.fg || 'var(--st-hold)');
    var tail = s.extra || agoShort(s.ms);
    chip.textContent = '';
    chip.appendChild(look.t ? stIcon(look, 'cmDot') : el('i', { class: 'cmDot' }));
    chip.appendChild(document.createTextNode(s.label + (tail ? ' · ' + tail : '')));
    chip.title = s.label + (s.ms != null ? (s.kind === 'work' ? ' for ' : ' since ') + agoShort(s.ms) + (s.kind === 'work' ? '' : ' ago') : '');
  }
  paint();
  if (runStartOf(job)) TIMERS.push(paint);
  return chip;
}
/* 10: the last part in hand on an operation that was stopped for parts */
function checkPartsArrived(job) {
  var real = (job.parts || []).filter(function (p) { return (p.description || '').trim() || (p.partNumber || '').trim(); });
  if (!real.length || !real.every(partInHand)) return;
  var st = opStatus(job), name = typeof st === 'string' ? st : st.status;
  if (name !== 'Waiting – Parts') return;
  toast('All parts are in for ' + (job.complaint || 'this operation'), { label: 'READY TO WORK', run: function () {
    pushUndo('operation status');
    job.jobStatus = { status: 'Hold Tech', setAt: nowIso() };
    save(true); render(); tecRender();
  } });
}
/* 9: pictures dropped on an operation card */
function dropFilesOnJob(job, files) {
  var arr = Array.prototype.slice.call(files || []).filter(function (f) { return /^(image|video)\//.test(f.type || '') || /\.(png|jpe?g|webp|heic|gif|mp4|mov)$/i.test(f.name || ''); });
  var other = Array.prototype.slice.call(files || []).filter(function (f) { return arr.indexOf(f) < 0; });
  if (!arr.length && !other.length) return;
  pushUndo('attach files');
  if (arr.length) addFiles(pgEntryFor('pics', true).oid, arr, job.id);
  if (other.length) libRouteDocs(other, job, function (L) { addFiles(pgEntryFor('report', true).oid, L, job.id); save(true); });   /* Parsec 17.1: a PDF is offered to the Library first */
  save(true);
}
/* 6: other visits by the same truck */
var VISIT_STOP = { replace: 1, check: 1, inspect: 1, repair: 1, with: 1, from: 1, that: 1, this: 1, have: 1, when: 1, engine: 1, truck: 1, unit: 1, customer: 1, states: 1, complaint: 1, light: 1, lamp: 1, codes: 1, code: 1, active: 1, after: 1, while: 1, over: 1, under: 1, front: 1, rear: 1, left: 1, right: 1 };
function visitWords(t) {
  var out = {};
  String(t || '').toLowerCase().replace(/spn\s*(\d+)/g, function (m, n) { out['spn' + n] = 1; return ' '; })
    .split(/[^a-z0-9]+/).forEach(function (w) { if (w.length >= 4 && !VISIT_STOP[w] && !/^\d+$/.test(w)) out[w] = 1; });
  return out;
}
function similarComplaint(a, b) { var A = visitWords(a), B = visitWords(b); return Object.keys(A).some(function (k) { return B[k]; }); }
function pastVisits(ro) {
  var vin = String(ro.vin || '').replace(/\s/g, '').toUpperCase();
  var unit = String(ro.unitNumber || '').trim().toUpperCase(), cust = String(ro.customerName || '').trim().toLowerCase();
  return STATE.ros.filter(function (r) {
    if (r.id === ro.id || r.shop || r.id === SHOP_RO_ID) return false;
    var v = String(r.vin || '').replace(/\s/g, '').toUpperCase();
    if (vin.length >= 11 && v.length >= 11) return v === vin;
    return unit && String(r.unitNumber || '').trim().toUpperCase() === unit && String(r.customerName || '').trim().toLowerCase() === cust;
  }).sort(function (a, b) { return new Date(b.dateOpened || 0) - new Date(a.dateOpened || 0); });
}
function renderPastVisits() {
  var list = pastVisits(RO); if (!list.length) return null;
  var now = RO.dateOpened ? new Date(RO.dateOpened).getTime() : Date.now();
  var vin = String(RO.vin || '').replace(/\s/g, '');
  var box = el('div', { class: 'roSideCard pvCard' });
  box.appendChild(el('div', { class: 'rscHead' }, [
    el('span', { class: 'rscT', text: 'Past visits' + (vin.length >= 11 ? ' · VIN …' + vin.slice(-4) : RO.unitNumber ? ' · unit ' + RO.unitNumber : '') }),
    el('span', { class: 'grow' }), el('span', { class: 'rscN mono', text: String(list.length) })]));
  list.slice(0, 6).forEach(function (r) {
    var at = r.dateOpened ? new Date(r.dateOpened).getTime() : null, age = at ? now - at : null;
    var ago = age == null ? '' : age < 86400000 * 45 ? Math.max(0, Math.round(age / 86400000)) + ' days ago' : Math.round(age / (86400000 * 30.4)) + ' months ago';
    var ops = (r.operations || []).filter(function (o) { return !o.declined; });
    var recent = age != null && age >= 0 && age < 365 * 86400000;
    var row = el('div', { class: 'pvRow' });
    row.appendChild(el('div', { class: 'pvTop' }, [
      el('button', { class: 'pvRo mono', type: 'button', text: r.roNumber || '?', title: 'Open RO ' + (r.roNumber || ''),
        onClick: function (e) { e.stopPropagation(); UI.selectedRo = r.id; tecRender(); } }),
      el('span', { class: 'pvAgo', text: ago })]));
    ops.slice(0, 4).forEach(function (o) {
      var come = recent && S.jobs.some(function (j) { return similarComplaint(j.complaint, o.complaint); });
      row.appendChild(el('div', { class: 'pvOp' }, [
        el('span', { class: 'pvOpT', text: (o.complaint || 'Operation') + ((+o.burnt || 0) > 0 ? ' · ' + fx(o.burnt) + 'h' : '') }),
        come ? el('span', { class: 'pvCome', text: 'Comeback?', title: 'Same truck within a year, with a similar complaint' }) : null,
        el('button', { class: 'pvCopy', type: 'button', text: 'Copy', title: 'Add this operation to the RO on screen',
          onClick: function (e) {
            e.stopPropagation();
            pushUndo('copy operation');
            var nj = blankJob(); nj.complaint = o.complaint || ''; nj.quoted = +o.quoted || 0; if (o.jobType) nj.jobType = o.jobType;
            S.jobs.push(nj); S.ui.card = nj.id; save(true); render();
            toast('Copied “' + (o.complaint || 'operation') + '” from ' + (r.roNumber || 'a past RO'), { label: 'UNDO', run: function () { restoreSnapshot(); } });
          } })
      ]));
    });
    box.appendChild(row);
  });
  return box;
}
/* RO top strip (1B) — who, what truck, where. Three blocks across the top of the RO
   page: the RO and customer, the truck and its VIN, then mileage / engine hours / bay /
   promised. "All details" opens every RO field in a drawer under the strip. */
var VIN_MAKERS = { '4V4': 'Volvo', '4V5': 'Volvo', '4VG': 'Volvo', '4VM': 'Volvo', '4V1': 'Volvo', '4V2': 'Volvo', '4VZ': 'Volvo',
  '1M1': 'Mack', '1M2': 'Mack', '1XK': 'Kenworth', '2XK': 'Kenworth', '1XP': 'Peterbilt', '2XP': 'Peterbilt', '1FU': 'Freightliner',
  '1FV': 'Freightliner', '3AK': 'Freightliner', '3AL': 'Freightliner', '1HT': 'International', '1HS': 'International', '3HS': 'International',
  '3HA': 'International', '5KJ': 'Western Star', '5KK': 'Western Star', '1NK': 'Kenworth', '1NP': 'Peterbilt', '1GB': 'Chevrolet', '1FD': 'Ford', '3FR': 'Ford' };
var VIN_YEAR = 'ABCDEFGHJKLMNPRSTVWXY';
function vinInfo(v) {
  v = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (v.length < 10) return { vin: v, year: null, make: null };
  var c = v.charAt(9), y = null, i = VIN_YEAR.indexOf(c), now = new Date().getFullYear();
  if (i > -1) { y = 2010 + i; if (y > now + 1) y -= 30; }
  else if (/[1-9]/.test(c)) { y = 2030 + (+c); if (y > now + 1) y -= 30; }
  return { vin: v, year: y, make: VIN_MAKERS[v.slice(0, 3)] || null };
}
function tsIc(path, sz) { return '<svg width="' + (sz || 15) + '" height="' + (sz || 15) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>'; }
var TS_IC = {
  copy: '<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
  caret: '<path d="M6 9l6 6 6-6"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 9.5h16M8.5 3.5v3M15.5 3.5v3"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-5.5 7-5.5s6 1.5 7 5.5"/>'
};
function tsNum(v) {
  var s = String(v == null ? '' : v).replace(/[, ]/g, '');
  if (!s) return null;
  var n = Number(s);
  return isFinite(n) ? n.toLocaleString('en-US') : String(v);
}
var PAST_OPEN = false;
/* the header folds. Folded it is one light card: RO, status, customer, engine + unit,
   percent, stages, ready time, Details and Options. Details unfolds the full dark band. */
function hdFold(cls, kids) { return el('div', { class: cls }, [el('div', { class: 'hxIn' }, kids)]); }
function renderTruckStrip() {
  var vi = vinInfo(RO.vin);
  var st = roStatus(RO), look = JC_STATUS_LOOK[st.status] || JC_STATUS_LOOK['Hold Tech'];
  var opened = RO.dateOpened ? new Date(RO.dateOpened) : null;
  var days = null;
  if (opened) { var d0 = new Date(opened); d0.setHours(0, 0, 0, 0); var d1 = new Date(); d1.setHours(0, 0, 0, 0); days = Math.max(0, Math.round((d1 - d0) / 86400000)); }
  var shut = UI.hdShut !== false;
  var wrap = el('section', { class: 'hdWrap' + (shut ? ' shut' : ''), 'aria-label': 'Repair order summary' });
  var rb = pendingRoBlock; pendingRoBlock = null;
  var optsBtn = pendingOpts; pendingOpts = null;
  var sRow = rb ? rb.querySelector('.headStatusRow') : null;
  var statusCtl = sRow ? sRow.querySelector('.chipwrap') : null;
  var warrCtl = sRow ? sRow.querySelector('.warrBadge') : null;
  var spotCtl = sRow ? sRow.querySelector('.spotChip') : null;
  pendingTotals = null;
  var openDetails = function (focusSel) {
    setDetails(!detailsOpen || !!focusSel);
    if (focusSel && detailsOpen) requestAnimationFrame(function () {
      var f = wrap.querySelector('.tsDrawer'); if (f) f.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  };
  var title = [vi.year, vi.make].filter(Boolean).join(' ') || 'Truck';
  var engUnit = function () { return [RO.engineType || '', RO.unitNumber ? 'Unit ' + RO.unitNumber : ''].filter(Boolean).join(' \u00b7 '); };
  var fc = null; try { fc = roForecast(RO); } catch (e) {}

  var band = el('div', { class: 'hdBand' });
  var top = el('div', { class: 'hbTop' });
  var idc = el('div', { class: 'hbId' });

  /* row 1: always RO + status. Folded adds customer and engine + unit; open adds tech and days */
  var r1 = el('div', { class: 'hbRow' });
  r1.appendChild(el('span', { class: 'hbRo mono', text: RO.roNumber || 'No RO #' }));
  var ctl = el('span', { class: 'tsCtl' });
  if (statusCtl) { statusCtl.classList.add('tsStatusCtl'); ctl.appendChild(statusCtl); }
  else ctl.appendChild(el('span', { class: 'tsStatus', title: look.hint || '', style: '--sd:' + look.dot + ';--sb:' + look.bg + ';--si:' + look.ink, html: '<i class="stIc t-' + look.t + '" style="color:var(--st-' + look.t + ')"></i>' + esc(st.status.replace(' \u2013 ', ' \u00b7 ') + (st.sub ? ' \u00b7 ' + st.sub : '')) }));
  r1.appendChild(ctl);
  if (warrCtl) { warrCtl.classList.add('tsWarr'); r1.appendChild(warrCtl); }
  var custIn = el('span', { class: 'hci hbCustIn' + (RO.customerName ? '' : ' empty'), text: RO.customerName || 'No customer yet' });
  r1.appendChild(custIn);
  var euIn = el('span', { class: 'hci hbEu' });
  var fillEu = function () {
    euIn.innerHTML = '';
    if (RO.engineType) euIn.appendChild(el('b', { text: RO.engineType }));
    else euIn.appendChild(el('button', { class: 'hbLink', type: 'button', text: '+ Engine', title: 'Add the engine type in All details',
      onClick: function (e) { e.stopPropagation(); closeMenus(); openDetails(true); } }));
    if (RO.unitNumber) euIn.appendChild(el('span', { text: (RO.engineType ? '\u00a0\u00b7 ' : '') + 'Unit ' + RO.unitNumber }));
  };
  fillEu(); r1.appendChild(euIn);
  r1.appendChild(el('button', { class: 'hxi hbLink', type: 'button', title: 'Assign or change the technician in All details',
    text: RO.assignedTech || 'No tech assigned', onClick: function (e) { e.stopPropagation(); closeMenus(); openDetails(true); } }));
  if (days != null) r1.appendChild(el('span', { class: 'hxi hbDim', text: '\u00b7 ' + days + (days === 1 ? ' day' : ' days') + ' open' }));
  idc.appendChild(r1);

  /* open only: the big customer line, then the truck line */
  var custEl = el('div', { class: 'hbCust' + (RO.customerName ? '' : ' empty'), text: RO.customerName || 'No customer yet' });
  idc.appendChild(hdFold('hx', [custEl]));
  var r3 = el('div', { class: 'hbRow' });
  var truckEl = el('span', { class: 'hbTruck', text: [title, engUnit()].filter(Boolean).join(' \u00b7 ') });
  r3.appendChild(truckEl);
  var pvList = pastVisits(RO);
  if (pvList.length) r3.appendChild(el('button', { class: 'hbChip' + (PAST_OPEN ? ' on' : ''), type: 'button', 'aria-expanded': PAST_OPEN ? 'true' : 'false',
    title: 'Earlier ROs on this truck', text: pvList.length + (pvList.length === 1 ? ' past visit' : ' past visits'),
    onClick: function (e) { e.stopPropagation(); PAST_OPEN = !PAST_OPEN; render(); } }));
  idc.appendChild(hdFold('hx', [r3]));
  top.appendChild(idc);

  /* actions: Copy VIN and All fields only when open; Details and Options always */
  var act = el('div', { class: 'hbAct' });
  act.appendChild(vi.vin ? el('button', { class: 'hxi hbBtn', type: 'button', title: 'Copy the VIN', html: tsIc(TS_IC.copy) + '<span>Copy VIN</span>',
      onClick: function (e) {
        e.stopPropagation(); var b2 = e.currentTarget;
        var done = function () { var sp = b2.querySelector('span'); sp.textContent = 'Copied'; setTimeout(function () { sp.textContent = 'Copy VIN'; }, 1400); };
        try { navigator.clipboard.writeText(vi.vin).then(done, done); } catch (er) { done(); }
      } })
    : el('button', { class: 'hxi hbBtn', type: 'button', html: '<span>Add VIN</span>', onClick: function (e) { e.stopPropagation(); openDetails(true); } }));
  act.appendChild(el('button', { class: 'hxi hbBtn raBtn' + (detailsOpen ? ' on' : ''), type: 'button', 'aria-expanded': detailsOpen ? 'true' : 'false',
    title: 'Every RO field: tech, engine, key tag, case #, dates, location', html: '<span>All fields</span>',
    onClick: function (e) { e.stopPropagation(); closeMenus(); openDetails(); } }));
  var detBtn = el('button', { class: 'hbBtn hbDet', type: 'button', 'aria-expanded': shut ? 'false' : 'true',
    title: shut ? 'Show the full RO header' : 'Fold the RO header', html: '<span>Details</span>' + tsIc(TS_IC.caret, 14) });
  act.appendChild(detBtn);
  if (optsBtn) {
    optsBtn.classList.add('tsOpts'); act.appendChild(optsBtn);
    /* Options opens on hover where there is a mouse; a tap still opens it */
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      var hvT = null;
      var menuOf = function () { return optsBtn.querySelector('.menu'); };
      optsBtn.addEventListener('mouseenter', function () {
        clearTimeout(hvT); var m = menuOf(), b3 = optsBtn.querySelector('button');
        if (m && b3 && !m.classList.contains('open')) b3.click();
      });
      optsBtn.addEventListener('mouseleave', function () {
        clearTimeout(hvT);
        hvT = setTimeout(function () { var m = menuOf(); if (m && m.classList.contains('open') && !optsBtn.matches(':hover')) closeMenus(); }, 260);
      });
    }
  }
  top.appendChild(act);
  band.appendChild(top);

  /* row 2: percent on the left, the stages, the ready time on the right (folded);
     open, the forecast's own header carries the percent and the time */
  var fcRow = el('div', { class: 'hbFcRow' });
  if (fc) {
    var rsM = roStages(RO, fc);   /* stages done, not a time percent */
    if (rsM) fcRow.appendChild(el('span', { class: 'hci hbPct mono rsPct', html: rsM.done + '<small>/' + rsM.total + '</small>', title: rsM.done + ' of ' + rsM.total + ' stages done' }));
  }
  fcRow.appendChild(el('div', { class: 'hdFc' }));
  if (fc) fcRow.appendChild(el('span', { class: 'hci hbEta' }, [el('small', { text: fc.ready ? 'Work done' : 'Ready for pickup' }), el('b', { text: fc.ready ? 'Ready' : fcWhen(fc.likely) })]));
  band.appendChild(fcRow);
  wrap.appendChild(band);

  /* the light rail (open only) */
  function cell(label, node, cls) {
    var c = el('div', { class: 'hdCell' + (cls ? ' ' + cls : '') }, [el('span', { class: 'hdK', text: label })]);
    c.appendChild(node); return c;
  }
  function valBtn(html, ttl, fn, cls) { return el('button', { class: 'hdVal' + (cls ? ' ' + cls : ''), type: 'button', title: ttl, html: html, onClick: function (e) { e.stopPropagation(); fn(); } }); }
  function hdNums() {
    var t = totals(), rem = t.q - t.b;
    var effColor = t.eff === null ? 'var(--muted)' : ({ '#0E8A5F': 'var(--good)', '#D97706': 'var(--warn)', '#D0271D': 'var(--danger)' }[sevQB(t.qs, t.b)] || 'var(--good)');
    var box = el('div', { class: 'hdNums' });
    box.appendChild(cell('Quoted', el('b', { class: 'hdNum mono', text: fx(t.q) })));
    var bn = el('div', { class: 'hdBurn' }, [el('b', { class: 'hdNum mono', text: fx(t.b) })]);
    bn.appendChild(el('span', { class: 'hdEffBar', title: 'RO efficiency: quoted \u00f7 burnt', html: '<i style="width:' + (t.eff === null ? 0 : Math.max(0, Math.min(100, t.eff))) + '%;background:' + effColor + '"></i>' }));
    bn.appendChild(el('small', { class: 'hdDim', text: t.eff === null ? 'efficiency \u2014' : 'efficiency ' + Math.round(t.eff) + '%' }));
    box.appendChild(cell('Burnt', bn));
    box.appendChild(cell(rem < 0 ? 'Over' : 'Remaining', el('b', { class: 'hdNum mono', style: 'color:' + (rem < 0 ? 'var(--danger)' : 'var(--good)'), text: fx(rem < 0 ? -rem : rem) })));
    var rm = roMoney(RO);
    box.appendChild(cell('Estimate', el('b', { class: 'hdNum mono', title: 'Labor ' + money(rm.labor) + ' \u00b7 parts ' + money(rm.parts) + (rm.other ? ' \u00b7 other ' + money(rm.other) : ''), text: money(rm.total) })));
    return box;
  }
  function makeRail() {
    var holder = el('div', { class: 'hdRailWrap' });
    var rail = el('div', { class: 'hdRail' });
    var v = vi.vin;
    var vinRow = el('div', { class: 'hdVinRow', hidden: 'hidden' });
    var chunk = function (txt, lbl) { return '<div><span class="mono">' + esc(txt || '\u2014') + '</span><small>' + lbl + '</small></div>'; };
    vinRow.innerHTML = chunk(v.slice(0, 3), 'Maker') + chunk(v.slice(3, 9), 'Model \u00b7 check digit') + chunk(v.slice(9), 'Year \u00b7 plant \u00b7 serial');
    var vinBtn = valBtn(esc(v || 'Add VIN'), v ? 'Show maker, model and serial' : 'Add the VIN in All details', function () {
      if (!v) { openDetails(true); return; }
      var o = vinRow.hidden; vinRow.hidden = !o; vinBtn.setAttribute('aria-expanded', o ? 'true' : 'false');
    }, 'mono hdVin'); vinBtn.setAttribute('aria-expanded', 'false');
    rail.appendChild(cell('VIN', vinBtn, 'hdVinCell'));
    var mi = tsNum(RO.mileage), eh = tsNum(RO.engineHours);
    rail.appendChild(cell('Mileage', valBtn(mi ? esc(mi) + '<em> mi</em>' : '\u2014', 'Edit in All details', function () { closeMenus(); openDetails(true); })));
    rail.appendChild(cell('Engine', valBtn(RO.engineType ? esc(RO.engineType) : '<span class="hdUnset">Add</span>', 'Edit in All details', function () { closeMenus(); openDetails(true); })));
    rail.appendChild(cell('Engine hrs', valBtn(eh ? esc(eh) + '<em> h</em>' : '\u2014', 'Edit in All details', function () { closeMenus(); openDetails(true); })));
    rail.appendChild(cell('Bay', valBtn(tsIc(TS_IC.pin, 14) + '<span>' + esc(RO.location || 'Not set') + '</span>', 'Bay or lot', function () { closeMenus(); if (spotCtl) spotCtl.click(); else openDetails(true); })));
    var pr = RO.promisedAt ? new Date(RO.promisedAt) : null;
    var prIn = el('input', { type: 'datetime-local', class: 'tsPrIn', 'aria-label': 'Promised date and time', value: pr ? wallStr(pr) : '',
      onChange: function (e) { var val2 = e.target.value; pushUndo('promised time'); RO.promisedAt = val2 ? new Date(val2).toISOString() : null; save(true); render(); } });
    var prLab = el('label', { class: 'hdVal hdPr' + (pr ? '' : ' unset'), title: pr ? 'Promised to the customer \u2014 click to change' : 'Set the time promised to the customer' }, [
      el('span', { html: pr ? esc(fcWhen(pr)) : 'Set time' }), prIn]);
    prLab.addEventListener('click', function (e) { e.stopPropagation(); try { if (prIn.showPicker) { e.preventDefault(); prIn.showPicker(); } } catch (er) {} });
    rail.appendChild(cell('Promised', prLab));
    var nums = hdNums(); rail.appendChild(nums);
    refs.hdRefresh = function () { if (!nums.isConnected) return; var f = hdNums(); nums.replaceWith(f); nums = f; };
    holder.appendChild(rail); holder.appendChild(vinRow);
    return holder;
  }
  var railBox = hdFold('hx hdRailFold', [makeRail()]);
  wrap.appendChild(railBox);

  if (PAST_OPEN && pvList.length) { var pvNode = renderPastVisits(); if (pvNode) { pvNode.classList.add('hdPast'); wrap.appendChild(hdFold('hx', [pvNode])); } }

  var info = pendingInfo; pendingInfo = null;
  if (info) {
    info.classList.add('rtInfo', 'tsDrawer'); wrap.appendChild(info);
    var tmr = null;
    info.addEventListener('input', function () {
      clearTimeout(tmr);
      tmr = setTimeout(function () {
        if (!wrap.isConnected) return;
        var old = railBox.querySelector('.hdRailWrap'); if (old) old.replaceWith(makeRail());
        var nm = RO.customerName || 'No customer yet';
        custEl.textContent = nm; custEl.classList.toggle('empty', !RO.customerName);
        custIn.textContent = nm; custIn.classList.toggle('empty', !RO.customerName);
        var vi2 = vinInfo(RO.vin);
        truckEl.textContent = [[vi2.year, vi2.make].filter(Boolean).join(' ') || 'Truck', engUnit()].filter(Boolean).join(' \u00b7 ');
        fillEu();
      }, 250);
    });
  }

  /* fold / unfold without a re-render, so the change can animate */
  detBtn.addEventListener('click', function (e) {
    e.stopPropagation(); closeMenus();
    var nowShut = !wrap.classList.contains('shut');
    UI.hdShut = nowShut; persistUI();
    if (nowShut && detailsOpen) setDetails(false);
    wrap.classList.toggle('shut', nowShut);
    detBtn.setAttribute('aria-expanded', nowShut ? 'false' : 'true');
    detBtn.title = nowShut ? 'Show the full RO header' : 'Fold the RO header';
    setTimeout(function () { var c = wrap.querySelector('.pgCard'); if (c) pgFit(c); }, 380);
    pgPlace(wrap.querySelector('.pgLine')); setTimeout(function () { pgPlace(wrap.querySelector('.pgLine')); }, 420);
  });
  return wrap;
}
/* RO progress — one flight line for the whole RO, then one lane per job on the same
   minutes scale. Everything comes from roForecast (the RO engine). The stage being clocked
   right now is marked live and the card redraws itself every minute. */
var PG_IC = {
  checkin: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 13l2 2 4-4"/>',
  diag: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>',
  approval: '<circle cx="12" cy="12" r="8"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  parts: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5"/>',
  repair: '<path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/>',
  roadtest: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M4.5 10.5h5M14.5 10.5h5M12 14v6"/>',
  closeout: '<path d="M7 3h7l4 4v14H7z"/><path d="M10 12h5M10 16h5"/>',
  hold: '<rect x="7" y="6" width="3" height="12" rx="1"/><rect x="14" y="6" width="3" height="12" rx="1"/>',
  flag: '<path d="M6 21V4M6 4h11l-2 4 2 4H6"/>',
  caret: '<path d="M6 9l6 6 6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'
};
var STG_OPEN = null, STG_RO = null;
function pgIc(k, sz) {
  if (k === 'wrepair') k = 'repair'; else if (k === 'wparts') k = 'parts';
  return '<svg width="' + (sz || 14) + '" height="' + (sz || 14) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (PG_IC[k] || PG_IC.clock) + '</svg>';
}
/* the RO's stages as equal steps (A), and the time each took (C). The model is roStages(). */
var RS_CHK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function buildProgress() {
  var f = null; try { f = roForecast(RO); } catch (e) {}
  var M = roStages(RO, f);
  if (!M) return null;
  var card = el('section', { class: 'roSideCard pgCard rsCard' + (M.run ? ' isLive' : ''), 'aria-label': 'RO stages' });
  var opened = RO.dateOpened ? new Date(RO.dateOpened) : null;
  card.appendChild(el('div', { class: 'pgHead rsHead', html:
    '<div class="pgMid"><b>' + M.done + ' of ' + M.total + '</b><span class="pgTx">stages done' + (opened ? ' · in for ' + esc(rsDur(Date.now() - opened)) : '') + '</span>'
    + (M.run ? '<span class="pgLiveChip"><i></i>Live</span>' : '') + '</div>'
    + '<div class="pgTo"><small>' + (M.all ? 'All stages done' : 'Ready for pickup') + '</small><b>' + esc(f ? (f.ready ? 'Ready' : fcWhen(f.likely)) : '—') + '</b></div>' }));
  /* A · the stepper */
  var n = 0;
  var stepH = '<div class="rsStep" role="list">' + M.list.map(function (x) {
    if (x.state !== 'x') n++;
    var ic = x.state === 'd' ? RS_CHK : x.state === 'x' ? '–' : String(n);
    return '<div class="rsS ' + x.state + (x.hand ? ' hand' : '') + '" role="listitem"><button type="button" class="rsDot" data-stg="' + x.k + '" aria-label="' + esc(x.name + ' — ' + (x.state === 'd' ? 'done' : x.state === 'x' ? 'not needed' : x.sub) + '. Show its checklist') + '">' + ic + '</button>'
      + '<b>' + esc(x.name) + '</b><small>' + esc(x.sub || '') + '</small></div>';
  }).join('') + '</div>';
  var wrap = el('div', { class: 'rsWrap', html: stepH });
  card.appendChild(wrap);
  if (STG_RO !== RO.id) { STG_OPEN = null; STG_RO = RO.id; }
  function showPop(pin) {
    Array.prototype.forEach.call(wrap.querySelectorAll('.stTip'), function (x) { x.remove(); });
    if (!STG_OPEN) return;
    var dot = wrap.querySelector('.rsDot[data-stg="' + STG_OPEN + '"]'), x = M.list.filter(function (y) { return y.k === STG_OPEN; })[0];
    if (!dot || !x) { STG_OPEN = null; return; }
    var nOn = x.checks.filter(function (c) { return c.on; }).length;
    var h = '<div class="stHd"><b>' + esc(x.name) + '</b><span>' + (x.state === 'x' ? 'not needed' : nOn + '/' + x.checks.length) + '</span></div>'
      + '<div class="rsRule">' + esc(RS_RULE[x.k]) + '</div>';
    if (!x.checks.length) h += '<div class="rsRule">Nothing to check on this RO.</div>';
    x.checks.forEach(function (c) {
      var can = !!c.key && !(c.on && !c.hand);
      h += '<button type="button" class="stRow' + (c.on ? ' on' : '') + '"' + (can ? ' data-key="' + c.key + '"' : ' disabled') + ' role="checkbox" aria-checked="' + (c.on ? 'true' : 'false') + '">'
        + '<span class="stCk">' + (c.on ? RS_CHK : '') + '</span><span class="stTx">' + esc(c.label) + '</span>' + (c.on && !c.hand ? '<span class="stTag">AUTO</span>' : c.hand ? '<span class="stTag">BY HAND</span>' : '') + '</button>';
    });
    if (x.state === 'd' && x.doneAt) h += '<div class="rsRule">Done ' + esc(rsShort(x.doneAt)) + (x.dur ? ' · took ' + esc(rsDur(x.dur)) : '') + '</div>';
    h += '<button type="button" class="stMark' + (x.state === 'd' ? ' un' : '') + '" data-stk="' + x.k + '">' + (x.state === 'd' ? 'Uncheck this stage' : RS_CHK + ' Check this stage off') + '</button>' + (x.hand ? '<div class="rsRule">Set by hand — press again to change it.</div>' : '');
    var pop = el('div', { class: 'pgTip stTip show', role: 'group', 'aria-label': x.name + ' checklist', html: h });
    dot.after(pop);
    if (pin) pinPop(pop, dot);
  }
  wrap.addEventListener('click', function (e) {
    var mk = e.target.closest && e.target.closest('.stMark');
    if (mk) { e.stopPropagation(); stageToggle(RO, mk.getAttribute('data-stk')); save(true); render(); return; }
    var row = e.target.closest && e.target.closest('.stRow');
    if (row) {
      e.stopPropagation();
      var key = row.getAttribute('data-key'); if (!key || row.disabled) return;
      pushUndo('stage step');
      RO.stageTicks = RO.stageTicks || {};
      if (RO.stageTicks[key]) delete RO.stageTicks[key]; else RO.stageTicks[key] = 1;
      save(true); render(); return;
    }
    if (e.target.closest && e.target.closest('.stTip')) { e.stopPropagation(); return; }
    var dot = e.target.closest && e.target.closest('.rsDot');
    if (dot) { e.stopPropagation(); var g = dot.getAttribute('data-stg'); closeMenus(); STG_OPEN = STG_OPEN === g ? null : g; showPop(true); }
  });
  wrap.addEventListener('keydown', function (e) { if (e.key === 'Escape' && STG_OPEN) { STG_OPEN = null; showPop(false); } });
  showPop(false);
  /* C · the time each stage took, against the usual */
  var shut = !!UI.pgLanesShut;
  var rows = M.list.map(function (x) {
    var u = x.usual ? x.usual * 60000 : 0, d = x.dur || 0, over = u && d > u * 1.05 && (x.state === 'd' || x.state === 'w' || x.state === 'c' || x.state === 'n');
    var w = x.state === 'x' || x.state === 't' ? 0 : u ? Math.min(100, d / u * 100) : (d ? 100 : 0);
    var right = x.state === 'x' ? '' : x.state === 't' ? (u ? '~' + rsDur(u) : '—') : (d ? rsDur(d) : '—') + (u ? ' / ' + rsDur(u) : '');
    return '<div class="rsT ' + x.state + (over ? ' over' : '') + '"><span class="rsTb"></span><span class="rsTn"><b>' + esc(x.name) + '</b><span>' + esc(x.state === 'd' ? (x.doneAt ? rsShort(x.doneAt) : 'done') : x.sub || '') + '</span></span>'
      + '<span class="rsTbar"><i style="width:' + w.toFixed(1) + '%"></i></span><span class="rsTr mono">' + esc(right) + '</span></div>';
  }).join('');
  var tl = el('div', { class: 'rsTl', html: rows, hidden: shut ? 'hidden' : null });
  var tgl = el('button', { class: 'pgByJob' + (shut ? ' shut' : ''), type: 'button', 'aria-expanded': shut ? 'false' : 'true',
    html: '<span>' + pgIc('caret', 12) + 'Stage times</span><i></i><small>' + (shut ? M.done + ' of ' + M.total + ' done' : 'time in each stage against the usual · red = over') + '</small>',
    onClick: function (e) {
      e.stopPropagation(); UI.pgLanesShut = !UI.pgLanesShut; persistUI();
      var sh = UI.pgLanesShut; tl.hidden = sh; tgl.classList.toggle('shut', sh); tgl.setAttribute('aria-expanded', sh ? 'false' : 'true');
      tgl.querySelector('small').textContent = sh ? M.done + ' of ' + M.total + ' done' : 'time in each stage against the usual · red = over';
    } });
  card.appendChild(tgl);
  card.appendChild(tl);
  return card;
}
var RS_RULE = { checkin: 'Done when the unit is connected or DTCs are read, a dash photo is in and the location is set — or work has started.',
  diag: 'Done when every DIAG operation has its cause written.', approval: 'Done when every customer-pay operation is approved or declined. Work started counts as approved.',
  parts: 'Done when every part is received.', repair: 'Done when every operation is Complete.', roadtest: 'Done when the road test is logged as Pass.',
  closeout: 'Done when every operation has cause and correction, pictures are attached and the RO is released.' };
/* Put the card on the page and redraw it once a minute (live minutes, waits and "Today"/"Tomorrow"). */
/* lay the stage labels out from their real widths. Each tries below the line, then above,
   then one row further out each side, so a crowded route stacks instead of cutting words.
   Labels near an end shift inward so nothing runs past the card. The line grows to fit. */
function pgPlace(ln) {
  if (!ln || !ln.isConnected) return;
  var W = ln.clientWidth; if (!W) return;
  /* with the real width known, keep the stage dots a dot and a bit apart (their labels follow) */
  (function () {
    var dots = Array.prototype.slice.call(ln.querySelectorAll('.pgStop')), lbs = Array.prototype.slice.call(ln.querySelectorAll('.pgLbl.stp'));
    var n = dots.length; if (n < 2) return;
    var p = dots.map(function (d) { return parseFloat(d.style.left) || 0; });
    var gap = Math.min(40 / W * 100, 96 / n), hi = 100 - gap * .7, i;
    for (i = 1; i < n; i++) if (p[i] < p[i - 1] + gap) p[i] = p[i - 1] + gap;
    if (p[n - 1] > hi) { p[n - 1] = hi; for (i = n - 2; i >= 0; i--) if (p[i] > p[i + 1] - gap) p[i] = p[i + 1] - gap; }
    if (p[0] < 0) { var sh = -p[0]; for (i = 0; i < n; i++) p[i] += sh; }
    dots.forEach(function (d, k) { d.style.left = p[k].toFixed(2) + '%'; if (lbs[k]) lbs[k].setAttribute('data-p', p[k].toFixed(3)); });
  })();
  var shut = !!(ln.closest && ln.closest('.hdWrap.shut'));
  var GAP = 10, BASE = 18, STEP = 31, PAD = 6, slots = {}, maxT = 0;
  var fits = function (k, l, r) { return (slots[k] || []).every(function (q) { return r + GAP <= q[0] || l >= q[1] + GAP; }); };
  var put = function (k, l, r) { (slots[k] = slots[k] || []).push([l, r]); };
  var lr = ln.getBoundingClientRect();
  Array.prototype.forEach.call(ln.querySelectorAll('.pgLbl:not(.stp)'), function (x) {
    var top = x.classList.contains('top');
    if (shut && (top || x.classList.contains('now'))) return;      /* folded, these are hidden */
    var b = x.getBoundingClientRect(); if (!b.width) return;
    put((top ? 'top' : 'bot') + 0, b.left - lr.left, b.right - lr.left);
  });
  Array.prototype.slice.call(ln.querySelectorAll('.pgLbl.stp')).sort(function (a, b) { return (+a.getAttribute('data-p')) - (+b.getAttribute('data-p')); }).forEach(function (x) {
    x.style.transform = 'none'; x.style.textAlign = 'center';
    var w = x.offsetWidth, c = (+x.getAttribute('data-p')) / 100 * W, l = c - w / 2;
    if (l < -PAD) l = -PAD;
    if (l + w > W + PAD) l = W + PAD - w;
    var pick = null;
    for (var tt = 0; tt < 8 && !pick; tt++) ['bot', 'top'].some(function (sd) { if (fits(sd + tt, l, l + w)) { pick = [sd, tt]; return true; } return false; });
    if (!pick) pick = ['bot', 8];
    put(pick[0] + pick[1], l, l + w); maxT = Math.max(maxT, pick[1]);
    x.classList.remove('top', 'bot', 'l', 'r'); x.classList.add(pick[0]);
    x.style.left = l.toFixed(1) + 'px';
    var off = 'calc(50% + ' + (BASE + pick[1] * STEP) + 'px)';
    if (pick[0] === 'bot') { x.style.top = off; x.style.bottom = 'auto'; } else { x.style.bottom = off; x.style.top = 'auto'; }
  });
  var need = 2 * (BASE + (maxT + 1) * STEP) + 4;
  if (!shut) need = Math.max(need, 104);
  ln.style.height = need + 'px';
}
/* Segments too short for their words drop the note, then the name, then the icon. */
function pgFit(card) {
  if (!card || !card.isConnected) return;
  Array.prototype.forEach.call(card.querySelectorAll('.pgSegTx'), function (t) {
    t.classList.remove('f1', 'f2', 'f3');
    ['f1', 'f2', 'f3'].some(function (c) {
      if (t.scrollWidth <= t.clientWidth + 1) return true;
      t.classList.add(c); return false;
    });
  });
}
var PG_RO = null;

function svgI(d, s) { return '<svg width="' + (s || 14) + '" height="' + (s || 14) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }
var DB_IC = {
  diag: svgI('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.6-4.6"/>', 13),
  rep: svgI('<path d="M14.5 5.5a4 4 0 0 0-5 5L4 16v4h4l5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/>', 13),
  wait: svgI('<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>', 13)
};
var FAB_IC = {
  play: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z" fill="currentColor"/></svg>',
  stop: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>',
  note: svgI('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>', 20),
  part: svgI('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>', 20),
  done: svgI('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 20),
  up: svgI('<path d="M6 15l6-6 6 6"/>', 16),
  road: svgI('<path d="M4 20L9 4M20 20L15 4M12 6v2M12 11v2M12 16v2"/>', 16),
  send: svgI('<path d="M4 12l16-8-6 16-3-7z"/>', 15),
  arrow: svgI('<path d="M5 12h14M13 6l6 6-6 6"/>', 12)
};
/* money. Labor is the quoted hours at the shop rate; parts are each price times quantity. */
/* the labor rate lives in Settings (laborRate) */
function usd(n) { if (!permCost()) return '\u2014'; n = num(n); return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function partCost(p) { return partLine$(p); }   /* the same sum as the RO totals */
function opCost(job) { return opMoney(job); }
function stName(st) { return typeof st === 'string' ? st : (st && st.status) || ''; }
function cardOf(job) { return R.querySelector('.cardCol > .card[data-job="' + job.id + '"]') || R.querySelector('.card.open'); }
function fabAddNote(job) {
  S.ui.card = job.id; job.punchesCollapsed = false; job.punchRailShut = false; save(); render();
  requestAnimationFrame(function () {
    var card = cardOf(job); if (!card) return;
    var rp = runningPunchOf(job), t = null;
    if (rp) {
      var sel = '.jev[data-pid="' + rp.id + '"]', row = card.querySelector(sel);
      if (row) {
        t = row.querySelector('textarea, [contenteditable]');
        if (!t) { var b = [].slice.call(row.querySelectorAll('button')).filter(function (x) { return /add note/i.test(x.textContent); })[0]; if (b) { b.click(); var c2 = cardOf(job); t = c2 && c2.querySelector(sel + ' textarea, ' + sel + ' [contenteditable]'); } }
      }
    }
    if (!t) t = card.querySelector('.jofn-in');
    if (t) { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); t.focus(); }
  });
}
