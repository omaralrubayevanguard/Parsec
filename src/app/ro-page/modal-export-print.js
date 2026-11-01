/* Parsec · ro-page · modal-export-print.js
   The RO page's modal, and export / import / print of one RO (sheetFromRO, importSheet).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   escClose closeModal modal bullet gatherBlobs sheetFromRO doExport roFromSheet readPayload importSheet buildJobPrintBlock buildPrintSheet … (15 functions, 2 constants)
   state      punches ros
   uses       data/ kit/ ro/ state/
*/
/* ============================ modal ============================ */

function escClose(e) { if (e.key === 'Escape') closeModal(); else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { var pb = R && R.querySelector('#modalWrap .modalFoot .mbtn.primary'); if (pb) { e.preventDefault(); pb.click(); } } }
function closeModal() {
  var w = R && R.getElementById('modalWrap');
  if (w && w.parentNode) w.parentNode.removeChild(w);
  document.removeEventListener('keydown', escClose);
}
function modal(opts) {
  closeModal();
  var box = el('div', { class: 'modalBox' }, [el('div', { class: 'modalHead', text: opts.title })]);
  var body = el('div', { class: 'modalBody' });
  (opts.body || []).forEach(function (n) {
    body.appendChild(typeof n === 'string' ? el('p', { text: n }) : n);
  });
  box.appendChild(body);
  var foot = el('div', { class: 'modalFoot' });
  (opts.actions || []).forEach(function (a) {
    foot.appendChild(el('button', { class: 'mbtn' + (a.kind ? ' ' + a.kind : ''), type: 'button', text: a.label,
      onClick: function (e) { e.stopPropagation(); closeModal(); if (a.run) a.run(); } }));
  });
  box.appendChild(foot);
  var wrap = el('div', { class: 'modalWrap', id: 'modalWrap',
    onClick: function (e) { if (e.target === wrap) closeModal(); } }, [box]);
  if (ivOn()) { foot.insertBefore(el('span', { class: 'ivHint', html: '<kbd>Esc</kbd> to close' }), foot.firstChild); setTimeout(function () { var f = box.querySelector('input, textarea, select'); if (f) try { f.focus(); } catch (e) {} }, 30); }
  R.appendChild(wrap);
  document.addEventListener('keydown', escClose);
}
function bullet(colour, text) {
  return el('li', {}, [
    el('span', { style: 'display:inline-block;width:7px;height:7px;border-radius:calc(2px * var(--rs, 1));margin-top:5px;flex-shrink:0;background:' + colour }),
    el('span', { text: text })
  ]);
}

/* ============================ export / import / print ============================ */

function gatherBlobs() {
  var ids = [];
  S.log.forEach(function (e) { e.files.forEach(function (f) { ids.push(f.id); }); });
  return Promise.all(ids.map(function (id) {
    return idbGet(id).then(function (b) { return b ? blobToDataUrl(b).then(function (d) { return [id, d]; }) : null; });
  })).then(function (pairs) {
    var out = {};
    pairs.forEach(function (p) { if (p) out[p[0]] = p[1]; });
    return out;
  });
}

/* The standalone console's sheet format, built from this RO — it opens in the standalone console too. */
var SHEET_STATUS = { "Hold Tech":0, "Working":1, "Waiting – Parts":2, "Waiting – Sublet":3, "Waiting – Foreman":3, "Waiting – Tech Support":3, "Waiting – Approval":3, "Waiting – New Job":3,
                     "Waiting – Customer":3, "Complete":4, "Complete – Road test":4, "Complete – Released":4, "Declined":4 };
var SHEET_STATUS_BACK = ["Hold Tech", "Working", "Waiting – Parts", "Waiting – Customer", "Complete – Released"];
function sheetFromRO() {
  return {
    id: RO.id,
    ro: { ra: S.ro.ra, status: SHEET_STATUS[roStatus(RO).status] || 0, warranty: !!RO.warranty, customer: S.ro.customer,
          vin: S.ro.vin, miles: S.ro.miles, unit: S.ro.unit, keyTag: S.ro.keyTag, caseNo: S.ro.caseNo,
          location: S.ro.location, opened: S.ro.opened, closed: S.ro.closed },
    log: JSON.parse(JSON.stringify(S.log)),
    jobs: S.jobs.map(function (j) {
      return { id: j.id, type: jtIdx(j), approved: false, complaint: j.complaint || '', quoted: fx(j.quoted),
        burnt: fx(liveBurnt(j)), runStart: null, work: j.work || '',
        parts: (j.parts || []).map(function (p) {
          return { id: p.id, desc: p.description || '', pn: p.partNumber || '', eta: p.eta || '', qty: String(p.qty == null ? '' : p.qty),
                   received: partInHand(p), status: p.status === 'Installed' ? 'Received' : (p.status || 'Not Ordered') };
        }),
        punches: punchesOf(j).filter(function (p) { return p.stop; }).map(function (p) {
          var a = new Date(p.start).getTime(), b = new Date(p.stop).getTime();
          return { id: p.id, start: a, stop: b, note: p.notes || '', duration: (b - a) / 3600000 };
        }) };
    }),
    ui: { card: S.ui.card }
  };
}

function doExport() {
  return gatherBlobs().then(function (blobs) {
    var json = JSON.stringify({ format: 'ro-job-console/v1', saved: new Date().toISOString(), state: sheetFromRO(), blobs: blobs }, null, 1);
    var name = 'RO-' + (S.ro.ra || S.ro.unit || 'sheet').replace(/[^\w-]+/g, '') + '-' + new Date().toISOString().slice(0, 10) + '.json';
    saveFile(name, new Blob([json], { type: 'application/json' }));
  }).catch(function () { toast('Save failed'); });
}

/* A standalone sheet (the .html it saves, or its .json) becomes a new RO in the app. */
function roFromSheet(st) {
  normalizeSheet(st);
  var r = st.ro || {};
  var ro = {
    id: 'ro_' + uid(), roNumber: r.ra || '', customerName: r.customer || '', caseNumber: r.caseNo || '',
    dateOpened: mdyToIso(r.opened || '') || nowIso(), dateClosed: mdyToIso(r.closed || '') || null,
    vin: r.vin || '', mileage: r.miles || '', engineHours: '', unitNumber: r.unit || '', keyTag: r.keyTag || '',
    location: r.location || '', buildDate: '', warrantyStart: '', techSupportCase: '', warranty: !!r.warranty,
    checklist: {}, checklistPopupPending: false, _lastKnownStatus: 'Hold Tech',
    status: { status: SHEET_STATUS_BACK[r.status] || 'Hold Tech', sub: null, setAt: nowIso() },
    attachments: [], bulletins: st.log || [], operations: []
  };
  var punches = [];
  (st.jobs || []).forEach(function (j) {
    var t = JOB_TYPES[j.type] || JOB_TYPES[1];
    var op = { id: 'op_' + uid(), jobType: t.key, complaint: j.complaint || '', quoted: r3(j.quoted), burnt: r3(j.burnt),
               work: j.work || '', declined: false, isStandard: false, log: [], punchesCollapsed: !!j.punchesCollapsed,
               parts: (j.parts || []).map(function (p) {
                 return { id: 'pt_' + uid(), description: p.desc || '', partNumber: p.pn || '', eta: p.eta || '', qty: p.qty || '1',
                          status: p.status || (p.received ? 'Received' : 'Not Ordered'), statusChangedAt: nowIso() };
               }) };
    if (j.runStart) op.burnt = r3(op.burnt + (Date.now() - j.runStart) / 3600000);
    (j.punches || []).forEach(function (p) {
      if (!p.start || !p.stop) return;
      punches.push({ id: 'pn_' + uid(), roId: ro.id, opId: op.id, start: new Date(p.start).toISOString(), stop: new Date(p.stop).toISOString(),
                     startReason: defaultStartReason(op), stopReason: null, notes: p.note || '', burntCredited: true });
    });
    ro.operations.push(op);
  });
  return { ro: ro, punches: punches };
}

function readPayload(text) {
  var t = text.replace(/^﻿/, '').trim();
  if (t.charAt(0) === '{') { try { return JSON.parse(t); } catch (e) { return null; } }
  try {
    var d = new DOMParser().parseFromString(text, 'text/html');
    var node = d.getElementById('ro-seed');
    return node ? JSON.parse(node.textContent) : null;
  } catch (e) { return null; }
}

function importSheet(file) {
  var rd = new FileReader();
  rd.onload = function () {
    var payload = readPayload(String(rd.result));
    if (!payload || !payload.state || !payload.state.ro) { toast('That file could not be read'); return; }
    var blobs = payload.blobs || {};
    Promise.all(Object.keys(blobs).map(function (id) { return idbPut(id, dataUrlToBlob(blobs[id])); }))
      .catch(function () {})
      .then(function () {
        var made = roFromSheet(payload.state);
        var dup = STATE.ros.some(function (x) { return made.ro.roNumber && x.roNumber === made.ro.roNumber; });
        pushUndo('open a sheet');
        STATE.ros.push(made.ro);
        var clashes = 0;
        made.punches.forEach(function (np) {
          if (punchClash(np.id, new Date(np.start).getTime(), np.stop ? new Date(np.stop).getTime() : null)) { clashes++; return; }
          STATE.punches.push(np);
        });
        UI.selectedRo = made.ro.id; UI.view = 'ros';
        if (clashes) setTimeout(function () { pushToast(clashes + ' punch' + (clashes === 1 ? '' : 'es') + ' in that sheet overlapped your own time and ' + (clashes === 1 ? 'was' : 'were') + ' left out.'); }, 2800);
        scheduleSave(true);
        tecRender();
        pushToast('Opened ' + file.name + ' as RO ' + (made.ro.roNumber || '(no number)') + (dup ? ' — an RO with that number already exists' : ''));
      });
  };
  rd.readAsText(file);
}

function buildJobPrintBlock(j, i) {
  var parts = j.parts || [];
  var body = [el('h2', { text: j.complaint || ('Operation ' + (i + 1)) })];
  body.push(j.work
    ? el('div', { class: 'pWork', html: j.work })
    : el('div', { class: 'pEmpty', text: 'No work performed logged.' }));
  if (parts.length) {
    body.push(el('table', {}, [
      el('thead', {}, [el('tr', {}, [
        el('th', { text: 'Part' }), el('th', { text: 'PN' }), el('th', { text: 'ETA' }), el('th', { text: 'Qty' }), el('th', { text: 'Status' })
      ])]),
      el('tbody', {}, parts.map(function (p) {
        return el('tr', {}, [
          el('td', { text: p.description || '—' }),
          el('td', { text: p.partNumber || '—' }),
          el('td', { text: p.eta || '—' }),
          el('td', { text: String(p.qty || '—') }),
          el('td', { text: p.status || 'Not Ordered' })
        ]);
      }))
    ]));
  }
  return el('div', { class: 'pJob' }, body);
}

function buildPrintSheet(jobsOverride) {
  var ps = document.getElementById('jc-print');
  if (!ps) { ps = el('div', { id: 'jc-print' }); document.body.appendChild(ps); }
  ps.innerHTML = '';
  var r = S.ro, st = roStatus(RO).status;
  ps.appendChild(el('div', { class: 'pHead' }, [
    el('h1', { text: 'RO ' + (r.ra || '—') + (r.warranty ? '   ·   WARRANTY' : '') }),
    el('div', { class: 'pRow' }, [
      el('span', {}, [el('b', { text: 'Customer: ' }), r.customer || '—']),
      el('span', {}, [el('b', { text: 'VIN: ' }), r.vin || '—']),
      el('span', {}, [el('b', { text: 'Miles: ' }), r.miles || '—']),
      el('span', {}, [el('b', { text: 'Unit: ' }), r.unit || '—'])
    ]),
    el('div', { class: 'pRow' }, [
      el('span', {}, [el('b', { text: 'Status: ' }), st]),
      el('span', {}, [el('b', { text: 'Key tag: ' }), r.keyTag || '—']),
      el('span', {}, [el('b', { text: 'Case #: ' }), r.caseNo || '—']),
      el('span', {}, [el('b', { text: 'Location: ' }), r.location || '—']),
      el('span', {}, [el('b', { text: 'Opened: ' }), r.opened || '—']),
      el('span', {}, [el('b', { text: 'Closed: ' }), r.closed || '—'])
    ])
  ]));
  (jobsOverride || S.jobs).forEach(function (j, i) { ps.appendChild(buildJobPrintBlock(j, i)); });
}

function printNow() {
  document.body.classList.add('jc-printing');
  var done = function () { document.body.classList.remove('jc-printing'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(function () { window.print(); setTimeout(done, 1500); }, 60);
}
function doPdf() { buildPrintSheet(); printNow(); }
/* "Print Op" from the job-card menu — same print sheet, scoped to just this job */
function printOp(job) { buildPrintSheet([job]); printNow(); }
