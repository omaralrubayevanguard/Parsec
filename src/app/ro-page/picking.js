/* Parsec · ro-page · picking.js
   Picking several operations or parts at once on the RO page: the selection, the bulk actions, the pick toolbar.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ropSelReset ropSelOps ropSelParts ropPool ropJobOf ropAny ropToggle ropAll ropCk ropPickClick ropDecorOps ropMoneyOk … (25 functions, 1 constant)
   state      punches
   uses       access/ automations/ data/ kit/ library/ pages/ pages/warranty/ ro/ shell/ state/ trucks/
*/
/* ---------- picking ---------- */
function ropSelReset() { ROPS.o = {}; ROPS.p = {}; ROPS.pOp = null; ROPS.last = null; }
function ropSelOps() { return S.jobs.filter(function (j) { return j && ROPS.o[j.id]; }); }
function ropSelParts() { if (ROPS.pOp === '*') return ropPool('*').filter(function (p) { return ROPS.p[p.id]; }); var j = ROPS.pOp && S.jobs.filter(function (x) { return x.id === ROPS.pOp; })[0]; return j ? (j.parts || []).filter(function (p) { return p && ROPS.p[p.id]; }) : []; }
/* Parsec 14.7: the parts a pick can range over — one operation's, or '*' for Parts on this RO (every live operation's) */
function ropPool(opId) { if (opId === '*') { var L = []; ropLive().forEach(function (j) { (j.parts || []).forEach(function (p) { if (p && (p.description || p.partNumber)) L.push(p); }); }); return L; }
  var j = S.jobs.filter(function (x) { return x.id === opId; })[0]; return j ? (j.parts || []).filter(function (p) { return p && (p.description || p.partNumber); }) : []; }
function ropJobOf(p) { return S.jobs.filter(function (j) { return (j.parts || []).indexOf(p) > -1; })[0] || null; }
function ropAny() { return Object.keys(ROPS.o).length > 0 || Object.keys(ROPS.p).length > 0; }
function ropToggle(k, id, ev, opId) {
  var ids, M;
  if (k === 'o') { ROPS.p = {}; ROPS.pOp = null; M = ROPS.o; ids = S.jobs.filter(function (j) { return j && j.id; }).map(function (j) { return j.id; }); }
  else { if (ROPS.pOp !== opId) { ROPS.p = {}; ROPS.pOp = opId; } ROPS.o = {}; M = ROPS.p; ids = ropPool(opId).map(function (p) { return p.id; }); }
  if (ev && ev.shiftKey && ROPS.last && ROPS.last.k === k && ids.indexOf(ROPS.last.id) > -1 && ids.indexOf(id) > -1) { var a = ids.indexOf(ROPS.last.id), b = ids.indexOf(id); ids.slice(Math.min(a, b), Math.max(a, b) + 1).forEach(function (i) { M[i] = 1; }); }
  else if (M[id]) delete M[id]; else M[id] = 1;
  if (k === 'p' && !Object.keys(ROPS.p).length) ROPS.pOp = null;
  ROPS.last = { k: k, id: id }; pxClosePop(); render();
}
function ropAll(k, opId) {
  if (k === 'o') { var L = S.jobs.filter(function (j) { return j && j.id; }), all = L.length && L.every(function (j) { return ROPS.o[j.id]; }); ropSelReset(); if (!all) L.forEach(function (j) { ROPS.o[j.id] = 1; }); }
  else { var P = ropPool(opId), all2 = ROPS.pOp === opId && P.length && P.every(function (p) { return ROPS.p[p.id]; }); ropSelReset(); if (!all2 && P.length) { ROPS.pOp = opId; P.forEach(function (p) { ROPS.p[p.id] = 1; }); } }
  pxClosePop(); render();
}
/* the box: a span inside the row (the row is a button), so a click on it picks instead of opening */
function ropCk(on, mid, label, fn) {
  var b = el('span', { class: 'rop-cb' + (on ? ' is-on' : mid ? ' is-mid' : ''), role: 'checkbox', tabindex: '0', 'aria-checked': on ? 'true' : mid ? 'mixed' : 'false', 'aria-label': label, html: on ? pxI('check', 11) : mid ? '<i></i>' : '' });
  b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); fn(e); });
  b.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); fn(e); } });
  return b;
}
function ropPickClick(e, k, id, opId) { if (!(e.ctrlKey || e.metaKey || e.shiftKey)) return false; e.preventDefault(); ropToggle(k, id, e, opId); return true; }
function ropDecorOps(box) {
  var sec = box.querySelector('.px-sec'), L = S.jobs.filter(function (j) { return j && j.id; }), n = L.filter(function (j) { return ROPS.o[j.id]; }).length;
  if (sec && L.length) { sec.classList.add('rop-sech0'); sec.insertBefore(ropCk(n > 0 && n === L.length, n > 0, 'Pick every operation', function () { ropAll('o'); }), sec.firstChild); }
  Array.prototype.forEach.call(box.querySelectorAll('.px-row[data-op]'), function (row) {
    var id = row.getAttribute('data-op'), j = S.jobs.filter(function (x) { return x.id === id; })[0]; if (!j) return;
    if (ROPS.o[id]) row.classList.add('is-sel');
    row.insertBefore(ropCk(!!ROPS.o[id], false, 'Pick operation ' + ropN(j), function (e) { ropToggle('o', id, e); }), row.firstChild);
  });
}
/* 17.5: the parts table on the operation card reads like ASIST's: Part (its number under it) · Qty · Unit · Core · Ext · Salesman · Status.
   Ext is qty × (unit + core), the way ASIST adds it; the money columns show only to someone allowed to see costs. */
function ropMoneyOk() { return typeof permCost !== 'function' || permCost(); }
/* 17.5: the salesman: a menu of the Parts department's people; a name read from ASIST that isn't one of them stays on the list */
function ropSalesman(job, p) {
  var cur = String(p.salesman || '').trim(), L = (typeof partsPeople === 'function' ? partsPeople() : []).slice();
  if (cur && L.indexOf(cur) < 0) L.unshift(cur);
  var s = el('select', { class: 'rop-sm', 'aria-label': 'Salesman for ' + ptName(p), title: cur ? 'Sold by ' + cur : 'Who in Parts sold this part' },
    [el('option', { value: '', text: '—' })].concat(L.map(function (n) { var o = el('option', { value: n, text: n }); if (n === cur) o.selected = true; return o; })));
  s.addEventListener('change', function () {
    var v = s.value; if (v === cur) return;
    pushUndo('salesman'); if (v) p.salesman = v; else delete p.salesman; save(true);
    try { audit('part', ptName(p) + (v ? ' sold by ' + v : ' — salesman cleared') + ' on ' + roLabel(RO), RO); } catch (er) {}
    render();
  });
  return el('span', { class: 'rop-c-sm' }, [s]);
}
function ropPartsHead(job, parts, pane) {
  if (!parts.length) return;
  var n = ROPS.pOp === job.id ? parts.filter(function (p) { return ROPS.p[p.id]; }).length : 0, $ok = ropMoneyOk();
  pane.appendChild(el('div', { class: 'px-li rop-pth is-full' + ($ok ? ' is-money' : '') }, [ropCk(n > 0 && n === parts.length, n > 0, 'Pick every part on Op ' + ropN(job), function () { ropAll('p', job.id); }),
    el('span', { text: 'Part' }), el('span', { class: 'r', text: 'Qty' })]
    .concat($ok ? [el('span', { class: 'r rop-c-un', text: 'Unit' }), el('span', { class: 'r rop-c-co', text: 'Core' }), el('span', { class: 'r', text: 'Ext' })] : [])
    .concat([el('span', { class: 'rop-c-sm', text: 'Salesman' }), el('span', { text: 'Status' })])));
}
function ropPartRow(job, p, b, eta, parts) {
  var on = ROPS.pOp === job.id && !!ROPS.p[p.id], $ok = ropMoneyOk(), q = parseFloat(p.qty); if (!isFinite(q)) q = 1;
  var un = priceOf(p.price), co = priceOf(p.core), ext = q * (un + co), m = function (v) { return pxMoney(v); };
  var cells = [el('span', { class: 'px-li__t rop-c-pt', title: ptName(p) + (p.partNumber ? ' · ' + p.partNumber : ''), html: '<b>' + esc(ptName(p)) + '</b>' + (p.partNumber || (eta && !partInHand(p)) ? '<small><span class="px-id">' + esc(p.partNumber || '') + '</span>' + (eta && !partInHand(p) ? (p.partNumber ? ' · ' : '') + 'ETA ' + esc(eta) : '') + '</small>' : '') }), el('span', { class: 'r px-num', text: p.qty === '' || p.qty == null ? '1' : String(p.qty) })];
  if ($ok) cells.push(el('span', { class: 'r px-num px-muted rop-c-un', text: un ? m(un) : '' }), el('span', { class: 'r px-num px-muted rop-c-co', text: co ? m(co) : '' }), el('span', { class: 'r px-num', text: un || co ? m(ext) : '' }));
  cells.push(ropSalesman(job, p));
  cells.push(b);
  var row = el('div', { class: 'px-li px-li--part rop-prow is-full' + ($ok ? ' is-money' : '') + (on ? ' is-sel' : ''), 'data-part': p.id }, [ropCk(on, false, 'Pick ' + ptName(p), function (e) { ropToggle('p', p.id, e, job.id); })].concat(cells));
  row.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.px-pstat, .rop-sm')) return; ropPickClick(e, 'p', p.id, job.id); });
  return row;
}
function ropAsk(who, ops, parts) {
  var to = who === 'parts' ? ropPerson('Parts') : ropPerson('Foreman'), toF = to ? ropFirst(to) : who === 'parts' ? 'Parts' : 'the foreman';
  if (!to) { toast('There’s no one in that role on the team yet.'); return; }
  var what = parts.length ? parts.map(function (z) { return ptName(z) + (z.partNumber ? ' · ' + z.partNumber : '') + ' · qty ' + (z.qty || 1); }).join('\n') : ops.map(function (op) { return 'Op ' + ropN(op) + ' — ' + (op.complaint || ''); }).join('\n');
  var ta = el('textarea', { class: 'px-input px-input--full', rows: '3', placeholder: parts.length ? 'Need more, wrong part, is it here yet… One note, about all of them.' : 'What do you need? One note, about all of them.' });
  pxModal({ title: 'Ask ' + toF, sub: 'About ' + (parts.length ? parts.length + ' part' + (parts.length === 1 ? '' : 's') : ops.map(function (op) { return 'Op ' + ropN(op); }).join(', ')) + ' — ' + (RO.roNumber || ''), size: 'sm', submit: 'Send to ' + toF,
    body: [el('div', { class: 'rop-what', text: what }), ta], run: function () {
      var first = ops[0] || S.jobs.filter(function (j) { return j.id === ROPS.pOp; })[0] || null;
      ropNote(to, 'men', first, ropFirst(ropMe()) + ' asked about ' + (parts.length ? parts.length + ' part' + (parts.length === 1 ? '' : 's') : ops.map(function (op) { return 'Op ' + ropN(op); }).join(', ')) + ' — ' + ropNo(), what, ta.value.trim());
      ropSelReset(); render(); toast('Sent to ' + toF + ' — one note, under Messages on this RO.'); } });
}
function ropPaperHead(what) {
  var tl = ''; try { tl = trkLabel(RO); } catch (e) {} if (tl === 'this truck') tl = RO.model || '';
  var qr = ''; try { var q = qrcode(0, 'L'); q.addData(keyTagCode(RO)); q.make(); qr = q.createSvgTag(3, 2); } catch (e) {}
  var when = ''; try { when = PG.whenL(Date.now()); } catch (e) { when = new Date().toLocaleString(); }
  return '<div class="tp-h"><div><small>' + esc(what) + '</small><h1>' + esc(RO.roNumber || '') + ' · ' + esc(RO.customerName || '') + '</h1><p>' + esc(tl) + (RO.unitNumber ? ' · Unit ' + esc(RO.unitNumber) : '') + (RO.vin ? ' · VIN ' + esc(RO.vin) : '') + '</p><p>' + esc(ropMe()) + ' · printed ' + esc(when) + (RO.location ? ' · ' + esc(RO.location) : '') + '</p></div>' + (qr ? '<div class="tp-qr">' + qr + '<small>Scan to switch</small></div>' : '') + '</div>';
}
/* print one sheet: built in the page for a moment so the Technician page's paper styles go with it */
function ropPrint(title, inner) {
  var host = document.createElement('div'); host.setAttribute('data-pg', 'tech'); host.className = 'tg rop-printhost'; host.style.cssText = 'position:fixed;left:-10000px;top:0;width:800px;height:auto;visibility:hidden';
  var p = document.createElement('div'); p.className = 'tch-paper'; p.innerHTML = inner; host.appendChild(p); document.body.appendChild(host);
  try { PG.printPaper(p, title); } catch (e) { console.error(e); } host.remove();
}
function ropJacket(L) {
  return ropPaperHead('Job jacket') + L.map(function (op) { var P = (op.parts || []).filter(function (p) { return p && (p.description || p.partNumber); }), F = op.faults || [];
    return '<section class="tp-op"><h2>Op ' + ropN(op) + ' · ' + esc(opJobType(op)) + ' · ' + esc(op.complaint || '') + '<span>' + ropH1(+op.quoted || 0) + ' h quoted</span></h2>' + (F.length ? '<p class="tp-c">Codes: ' + esc(F.map(fcLabel).join(', ')) + '</p>' : '')
      + (P.length ? '<table><tr><th></th><th>Part</th><th>Number</th><th>Qty</th><th>Status</th></tr>' + P.map(function (p) { return '<tr><td>☐</td><td>' + esc(p.description || '') + '</td><td>' + esc(p.partNumber || '') + '</td><td>' + esc(p.qty || 1) + '</td><td>' + esc(p.status || 'Not Ordered') + '</td></tr>'; }).join('') + '</table>' : '') + '<div class="tp-l"><b>Cause</b><i></i><i></i><b>Correction</b><i></i><i></i></div></section>'; }).join('');
}
function ropPickList(op, P) {
  return ropPaperHead('Pick list · Op ' + ropN(op) + ' — ' + (op.complaint || '')) + '<table class="tp-pl"><tr><th></th><th>Part number</th><th>Description</th><th>Qty</th><th>Status</th></tr>' + P.map(function (p) { return '<tr><td>☐</td><td>' + esc(p.partNumber || '—') + '</td><td>' + esc(p.description || '') + '</td><td>' + esc(p.qty || 1) + '</td><td>' + esc(p.status || 'Not Ordered') + '</td></tr>'; }).join('') + '</table>';
}
function ropStopRun(job, why) { var rp = ropRun(job); if (!rp) return false; rp.stop = nowIso(); rp.stopReason = why; try { creditBurnt(rp); } catch (e) {} return true; }
function ropSelAct(v, anchor) {
  var L = ropSelOps(), live = L.filter(function (j) { return !opDoneNow(j) && !j.declined; }), P = ropSelParts(), opsTxt = L.map(function (op) { return 'Op ' + ropN(op); }).join(', ');
  if (v === 'start') { if (live.length === 1 && !ropRun(live[0])) { var j0 = live[0]; ropSelReset(); toggleJobClock(j0); tecRender(); } return; }
  if (v === 'hold') {
    var pt = ropPerson('Parts'), wr = ropWriter() || ropPerson('Triage'), fm = ropPerson('Foreman');
    var pop = el('div', { class: 'px-pop rop-pop', role: 'menu' }, [el('div', { class: 'rop-poph', html: '<b>Put ' + esc(opsTxt) + ' on hold</b><small>they go to Waiting</small>' })].concat([['Waiting – Parts', (pt ? ropFirst(pt) : 'Parts') + ' gets one note for all of them', pt], ['Waiting – Sublet', (wr ? ropFirst(wr) : 'The writer') + ' gets them to send out', wr], ['Waiting – Approval', (wr ? ropFirst(wr) : 'The writer') + ' gets them to send the estimate', wr], ['Waiting – Tech Support', 'Waiting on a Volvo case', ''], ['Waiting – Foreman', (fm ? ropFirst(fm) : 'The foreman') + ' gets them', fm]].map(function (z) {
      return el('button', { class: 'px-menu__item rop-mi', type: 'button', role: 'menuitem', html: '<span><b>' + esc(z[0]) + '</b><small>' + esc(z[1]) + '</small></span>', onClick: function (e) {
        e.stopPropagation(); pxClosePop(); if (!live.length) return;
        pushUndo('hold'); try { commitNoteDrafts(); } catch (er) {}
        live.forEach(function (j) { if (!ropStopRun(j, z[0])) j.jobStatus = { status: z[0], sub: null, setAt: nowIso(), hand: true }; });
        if (z[2]) ropNote(z[2], z[0] === 'Waiting – Foreman' ? 'ask' : 'fyi', live[0], ropNo() + ' — ' + live.length + ' operation' + (live.length === 1 ? '' : 's') + ' waiting on you', live.map(function (j) { return 'Op ' + ropN(j) + ' — ' + (j.complaint || ''); }).join('\n'));
        save(true); ropSelReset(); render(); tecRender(); ropUndo(live.length + ' on hold — ' + z[0].toLowerCase() + '.' + (z[2] ? ' ' + ropFirst(z[2]) + ' has one note about them.' : '')); } }); })));
    pxPop(anchor, pop); return;
  }
  if (v === 'askp' || v === 'pask') return ropAsk('parts', L, P);
  if (v === 'prcv' || v === 'pinall') return ropPartsSet(P, v === 'prcv' ? 'Received' : 'Installed');
  if (v === 'askf') return ropAsk('foreman', L, []);
  if (v === 'note') {
    var ta = el('textarea', { class: 'px-input px-input--full', rows: '3', placeholder: 'What you found, what you did… each one gets it, with the time' });
    pxModal({ title: 'A note on ' + opsTxt, sub: 'Each one gets it, with the time', size: 'sm', submit: 'Save on ' + live.length, body: [ta], run: function () {
      var txt = autoPunct(String(ta.value || '').trim()); if (!txt || !live.length) return false;
      pushUndo('note on ' + live.length);
      live.forEach(function (j) { var rp = ropRun(j); if (rp) { var line = txt; rp.notes = String(rp.notes || '').trim() ? String(rp.notes).replace(/\s+$/, '') + '\n' + line : line; } else j.offNotes = (Array.isArray(j.offNotes) ? j.offNotes : []).concat([{ id: 'on' + Date.now().toString(36) + ropN(j), at: nowIso(), text: txt, by: punchByName() || ropMe() }]); });
      save(true); ropSelReset(); render(); ropUndo('Note saved on ' + live.length + ' operation' + (live.length === 1 ? '' : 's') + '.'); } });
    return;
  }
  if (v === 'code') {
    var inp = el('input', { class: 'px-input px-input--full', placeholder: 'P1050 FTB 17 · 3226/2 · MID 128 PID 110 FMI 0' });
    pxModal({ title: 'Add a code to ' + opsTxt, size: 'sm', submit: 'Add to ' + live.length, body: [inp], run: function () {
      var f = parseFault(inp.value); if (!f) { toast('Type it as P1050 FTB 17, SPN/FMI like 3226/2, or MID 128 PID 110 FMI 0.'); return false; }
      var add = live.filter(function (j) { return !(j.faults || []).some(function (x) { return fcSame(x, f); }); }); if (!add.length) { toast(fcLabel(f) + ' is already on all of them.'); return; }
      pushUndo('fault code'); add.forEach(function (j) { j.faults = (j.faults || []).concat([libCodeStore(f)]); });
      save(true); ropSelReset(); render(); ropUndo(fcLabel(f) + ' added to ' + add.length + ' operation' + (add.length === 1 ? '' : 's') + '.'); } });
    return;
  }
  if (v === 'done') {
    var ok = [], no = [];
    live.forEach(function (j) { var g = []; try { g = v141GapsAsk(j); } catch (e) {} if (g.length) no.push('Op ' + ropN(j) + ': ' + g.map(function (z) { return z.t; }).join(', ')); else ok.push(j); });
    if (ok.length) { pushUndo('mark done'); try { commitNoteDrafts(); } catch (er) {} ok.forEach(function (j) { if (!ropStopRun(j, 'Complete')) j.jobStatus = { status: 'Complete', sub: null, setAt: nowIso(), hand: true }; }); save(true); }
    ropSelReset(); render(); tecRender();
    var msg = (ok.length ? ok.length + ' done' : 'None done') + (no.length ? ' · not yet — ' + no.join(' · ') : '') + '.';
    if (ok.length) ropUndo(msg); else toast(msg);
    return;
  }
  if (v === 'print') { ropPrint((RO.roNumber || 'RO') + ' job jacket', ropJacket(L)); return; }
  if (v === 'del') {   /* Parsec 12.2: delete the picked operations — with their parts and time; Undo brings them back */
    if (!L.length) return;
    var nPt = 0, nPu = 0, run = false; L.forEach(function (j) { nPt += (j.parts || []).length; STATE.punches.forEach(function (p) { if (p.opId === j.id) { nPu++; if (!p.stop) run = true; } }); });
    var ln = L.length + ' operation' + (L.length === 1 ? '' : 's');
    pxModal({ title: 'Delete ' + opsTxt + '?', sub: ln + ' on ' + ropNo(), size: 'sm', danger: true, submit: 'Delete ' + ln,
      body: [el('p', { class: 'rop-delp', text: L.map(function (op) { return 'Op ' + ropN(op) + ' — ' + (op.complaint || 'Operation'); }).join('\n') }),
        el('p', { class: 'rop-delp2', text: (nPt || nPu ? (L.length === 1 ? 'Its ' : 'Their ') + nPt + ' part line' + (nPt === 1 ? '' : 's') + (nPu ? ' and ' + nPu + ' time punch' + (nPu === 1 ? '' : 'es') + ' in the Time Log' : '') + (nPt + nPu === 1 ? ' goes' : ' go') + ' too' : 'Nothing else goes with ' + (L.length === 1 ? 'it' : 'them')) + (run ? ' — the clock running on one stops' : '') + '. Undo brings them back.' })],
      run: function () {
        var ids = L.map(function (j) { return j.id; });
        pushUndo('delete ' + ln); try { commitNoteDrafts(); } catch (er) {}
        try { audit('op-del', 'Deleted ' + opsTxt + ' on ' + roLabel(RO), RO); } catch (er) {}
        STATE.punches = STATE.punches.filter(function (p) { return ids.indexOf(p.opId) < 0; });
        S.jobs = S.jobs.filter(function (x) { return ids.indexOf(x.id) < 0; });
        if (ids.indexOf(S.ui.card) > -1) S.ui.card = S.jobs[0] ? S.jobs[0].id : null;
        try { var oa = openList(RO); ids.forEach(function (id) { var k = oa.indexOf(id); if (k > -1) oa.splice(k, 1); }); } catch (er) {}
        try { if (soloJob && ids.indexOf(soloJob) > -1) soloJob = null; } catch (er) {}
        save(true); ropSelReset(); render(); tecRender(); ropUndo(ln + ' deleted.');
      } });
    return;
  }
  if (v === 'story') { var live0 = ropLive(), B = []; try { B = raStory(RO).split('\n\n'); } catch (e) {} var txt2 = L.map(function (op) { return B[live0.indexOf(op)]; }).filter(Boolean).join('\n\n');
    pxCopy((RO.roNumber || '') + ' · ' + (RO.customerName || '') + '\n\n' + txt2, 'Copied the story for ' + L.length + ' operation' + (L.length === 1 ? '' : 's') + ' — paste it in ASIST or anywhere.'); return; }
  var op = ROPS.pOp === '*' ? (P[0] ? ropJobOf(P[0]) : null) : S.jobs.filter(function (x) { return x.id === ROPS.pOp; })[0]; if (!op) return;
  var setSt = function (from, to, verb, why) { var D = P.filter(function (p) { return from.indexOf(p.status || 'Not Ordered') > -1; }); if (!D.length) return;
    pushUndo('parts ' + verb); D.forEach(function (p) { p.status = to; p.statusChangedAt = nowIso(); if (to === 'Picked up') p.pickedBy = punchByName() || ropMe(); }); save(true);
    if (to === 'Picked up' || to === 'Returned') ropNote(ropPerson('Parts'), 'fyi', op, ropFirst(ropMe()) + ' ' + (to === 'Returned' ? 'is returning' : 'picked up') + ' ' + D.length + ' part' + (D.length === 1 ? '' : 's') + ' for ' + ropNo(), D.map(function (p) { return ptName(p) + (p.partNumber ? ' · ' + p.partNumber : ''); }).join('\n'));
    ropSelReset(); render(); ropUndo(D.length + ' part' + (D.length === 1 ? '' : 's') + ' ' + verb + (P.length > D.length ? ' · ' + (P.length - D.length) + ' skipped (' + why + ')' : '') + '.'); };
  if (v === 'ppick') return setSt(['Staged'], 'Picked up', 'picked up', 'not staged');
  if (v === 'pinst') return setSt(['Picked up', 'Received', 'Staged'], 'Installed', 'installed', 'not in hand');
  if (v === 'pret') return setSt(['Not Ordered', 'Ordered', 'Backordered', 'Received', 'Staged', 'Picked up'], 'Returned', 'going back to Parts', 'installed or already returned');
  if (v === 'ppns') { pxCopy(P.map(function (p) { return (p.partNumber || '—') + '\t' + (p.description || '') + '\t' + (p.qty || 1); }).join('\n'), 'Copied ' + P.length + ' part number' + (P.length === 1 ? '' : 's') + '.'); return; }
  if (v === 'plist') { ropPrint((RO.roNumber || 'RO') + ' pick list', ropPickList(op, P)); return; }
  if (v === 'pmove') {
    var T = S.jobs.filter(function (j) { return j && j.id && j.id !== op.id && !j.declined; });
    var pop2 = el('div', { class: 'px-pop rop-pop', role: 'menu' }, [el('div', { class: 'rop-poph', html: '<b>Move ' + P.length + ' part' + (P.length === 1 ? '' : 's') + ' to</b>' })].concat(T.length ? T.map(function (to) {
      return el('button', { class: 'px-menu__item rop-mi', type: 'button', role: 'menuitem', html: '<span class="px-id">Op ' + ropN(to) + '</span><span><b>' + esc(to.complaint || 'Operation') + '</b></span>', onClick: function (e) {
        e.stopPropagation(); pxClosePop(); pushUndo('move parts'); var ids = P.map(function (p) { return p.id; });
        to.parts = (to.parts || []).concat((op.parts || []).filter(function (p) { return ids.indexOf(p.id) > -1; })); op.parts = (op.parts || []).filter(function (p) { return ids.indexOf(p.id) < 0; });
        save(true); ropSelReset(); UI.ivTab = UI.ivTab || {}; UI.ivTab[to.id] = 'parts'; S.ui.card = to.id; render(); ropUndo(P.length + ' part' + (P.length === 1 ? '' : 's') + ' moved to Op ' + ropN(to) + '.'); } }); }) : [ropNone('No other operation on this RO.')]));
    pxPop(anchor, pop2); return;
  }
}
/* Parsec 14.7: Receive / Install the picked parts — what setPartStatus does for one, for all of them, with one Undo */
var ROP_INH = ['Received', 'Staged', 'Picked up', 'Installed', 'Returned'];
function ropPartsCan(P, to) { return P.filter(function (p) { var s = p.status || 'Not Ordered'; return to === 'Received' ? ROP_INH.indexOf(s) < 0 : s !== 'Installed' && s !== 'Returned'; }); }
function ropPartsSet(P, to) {
  var D = ropPartsCan(P, to); if (!D.length) return;
  var nr = 0, J = [], now = nowIso();
  pushUndo(to === 'Received' ? 'receive parts' : 'install parts');
  D.forEach(function (p) { if (to === 'Installed' && ROP_INH.indexOf(p.status || 'Not Ordered') < 0) nr++; p.status = to; p.statusChangedAt = now; var j = ropJobOf(p); if (j && J.indexOf(j) < 0) J.push(j); });
  try { audit('part', D.length + ' part' + (D.length === 1 ? '' : 's') + ' ' + (to === 'Received' ? 'received' : 'installed') + ' on ' + roLabel(RO) + ' — ' + D.map(function (p) { return ptName(p) + (p.partNumber ? ' · ' + p.partNumber : ''); }).join(', '), RO); } catch (e) {}
  save(true); ropSelReset(); render();
  J.forEach(function (j) { try { checkPartsArrived(j); } catch (e) {} });
  var sk = P.length - D.length, msg = D.length + ' part' + (D.length === 1 ? '' : 's') + ' ' + (to === 'Received' ? 'received' : 'installed') + (nr ? ' (' + nr + ' received on the way)' : '') + (sk ? ' · ' + sk + ' skipped (' + (to === 'Received' ? 'in hand already' : 'installed already') + ')' : '') + '.';
  ropUndo(msg);
}
function ropSelBar() {
  if (!ropAny()) return null;
  var L = ropSelOps(), P = ropSelParts(), fmF = ropPerson('Foreman') ? ropFirst(ropPerson('Foreman')) : 'the foreman', info, acts = [];
  var b = function (v, ic0, t, dis, tip, pri) { var x = el('button', { class: 'px-btn px-btn--sm' + (pri ? ' px-btn--primary' : ''), type: 'button', 'data-v': v, title: tip || '', html: ri(ic0, 14) + esc(t) + (v === 'hold' || v === 'pmove' ? pxI('chevD', 11) : '') }); if (dis) x.disabled = true; x.addEventListener('click', function (e) { e.stopPropagation(); ropSelAct(v, x); }); return x; };
  if (L.length) {
    var live = L.filter(function (j) { return !opDoneNow(j) && !j.declined; }), left = 0; live.forEach(function (j) { try { left += Math.max(0, num(j.quoted) - jtmHours(j)); } catch (e) {} });
    var one = live.length === 1 && L.length === 1 && !ropRun(live[0]);
    info = '<b>' + L.length + ' operation' + (L.length === 1 ? '' : 's') + '</b><small>' + (live.length ? ropH1(left) + ' h left' : 'nothing left to do') + '</small>';
    acts = [b('start', 'play', 'Start', !one, one ? '' : 'Start works on one operation that isn’t running'), b('hold', 'clock', 'Hold', !live.length, live.length ? '' : 'Nothing to hold — every one is done or declined'), b('askp', 'parts', 'Ask Parts'), b('askf', 'chat', 'Ask ' + fmF), b('note', 'pencil', 'Note on all', !live.length), b('code', 'plus', 'Add a code', !live.length), b('done', 'check', 'Mark done', !live.length, live.length ? '' : 'Nothing to mark — every one is done or declined', true), b('print', 'print', 'Print job jacket'), b('story', 'copy', 'Copy the story'), b('del', 'trash', 'Delete')];
    acts[acts.length - 1].classList.add('rop-del');
  } else {
    var all = ROPS.pOp === '*', op = all ? null : S.jobs.filter(function (x) { return x.id === ROPS.pOp; })[0], st = P.filter(function (p) { return p.status === 'Staged'; }).length, ret = P.filter(function (p) { return ['Installed', 'Returned'].indexOf(p.status) < 0; }).length;
    var nr = ropPartsCan(P, 'Received').length, ni = ropPartsCan(P, 'Installed').length;   /* Parsec 14.7 */
    info = '<b>' + P.length + ' part' + (P.length === 1 ? '' : 's') + (all ? ' · this RO' : ' · Op ' + (op ? ropN(op) : '')) + '</b><small>' + (nr ? nr + ' not in yet' : ni ? 'all in hand' : 'all installed') + '</small>';
    acts = [b('prcv', 'check', 'Receive ' + nr, !nr, nr ? 'Mark ' + nr + ' part' + (nr === 1 ? '' : 's') + ' received' : 'Every picked part is in hand or installed already', true), b('pinall', 'wrench', 'Install ' + ni, !ni, ni ? 'Mark ' + ni + ' part' + (ni === 1 ? '' : 's') + ' installed' + (nr ? ' — the ' + nr + ' not in yet are received too' : '') : 'Every picked part is installed or returned already'),
      b('ppick', 'check', 'Picked up' + (st && st < P.length ? ' · ' + st : ''), !st, st ? '' : 'Only staged parts can be picked up'), b('pask', 'parts', 'Ask Parts'), b('pret', 'undo', 'Return', !ret)].concat(all ? [] : [b('pmove', 'swap', 'Move to…')]).concat([b('ppns', 'copy', 'Copy part numbers')]).concat(all ? [] : [b('plist', 'print', 'Print pick list')]);
  }
  var clr = el('button', { class: 'rop-clr', type: 'button', text: 'Clear', onClick: function (e) { e.stopPropagation(); ropSelReset(); pxClosePop(); render(); } });
  return el('div', { class: 'rop-sb', role: 'toolbar', 'aria-label': L.length ? 'Selected operations' : 'Selected parts' }, [el('span', { class: 'rop-sbi', html: info })].concat(acts).concat([el('span', { class: 'rop-sp' }), clr]));
}
