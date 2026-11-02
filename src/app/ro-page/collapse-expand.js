/* Parsec · ro-page · collapse-expand.js
   Collapse all / Expand all on the sections below the operations (Parsec 15), one switch.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ropFallMain ropFallRailL ropFallOpen ropFallSet ropFallList ropFallSync ropFallBtn ropFallAdd pxProp pxField2 pxGroup pxFitRail … (20 functions)
   state      punches ros
   uses       access/ clock/ data/ kit/ pages/ ro/ shell/ state/
   at load    on window keydown
*/
/* ---------- Parsec 15 — one switch: Collapse all while any is open, Expand all once they're all folded ----------
   One above the sections below Operations (Messages, Customer), one at the top of the right pane's groups (Who has it, Schedule,
   People, Vehicle, Money…). The heading or the chevron still folds one; pointing does nothing. Remembered as before (rop_fold, UI.ivFold). */
function ropFallMain(col) { return col ? Array.prototype.slice.call(col.querySelectorAll(':scope > .rop-fold')) : []; }   /* 17.1: Operations too — the switch sits above them */
function ropFallRailL(rail) { return rail ? Array.prototype.slice.call(rail.querySelectorAll('.rop-top > section.rop-rblk.rop-fold:not(.rop-stg), .px-props > section.px-pg')) : []; }
function ropFallOpen(s) { return s.classList.contains('px-pg') ? s.classList.contains('is-open') : !s.classList.contains('is-shut'); }
function ropFallSet(s, open) {
  if (ropFallOpen(s) === open) return;
  if (s.classList.contains('px-pg')) {
    s.classList.toggle('is-open', open); var h = s.querySelector(':scope > .px-pg__h'); if (h) h.setAttribute('aria-expanded', open ? 'true' : 'false');
    var k = s.getAttribute('data-pg'); UI.ivFold = UI.ivFold || {}; if (k) { UI.ivFold[k] = !open; if (open) { UI.ivOpenAt = UI.ivOpenAt || {}; UI.ivOpenAt[k] = Date.now(); } }
    return;
  }
  var key = s.getAttribute('data-fold'), S0 = ropFoldShut(); if (open) delete S0[key]; else S0[key] = 1;
  s.classList.toggle('is-shut', !open);
  var b = s.querySelector('.rop-fh > .rop-fb'); if (b) { var lb = String(b.getAttribute('aria-label') || '').replace(/^(Open|Fold) /, ''); b.setAttribute('aria-expanded', open ? 'true' : 'false'); b.setAttribute('aria-label', (open ? 'Fold ' : 'Open ') + lb); b.title = open ? 'Fold' : 'Open'; }
}
function ropFallList(b) { var root = ROPF.root; if (!root) return []; return b.getAttribute('data-fall') === 'rail' ? ropFallRailL(root.querySelector('.rop-rail')) : ropFallMain(root.querySelector('.rop-col')); }
function ropFallSync() {
  var root = ROPF.root; if (!root || !root.isConnected) return;
  Array.prototype.forEach.call(root.querySelectorAll('.rop-fall'), function (b) {
    var L = ropFallList(b), any = L.some(ropFallOpen);
    b.innerHTML = pxI(any ? 'chevUp' : 'chevDn', 13) + '<span>' + (any ? 'Collapse all' : 'Expand all') + '</span>';
    b.setAttribute('aria-expanded', any ? 'true' : 'false'); b.title = any ? 'Fold every section here' : 'Open every section here';
    var w = b.parentNode; if (w) w.hidden = L.length < 2;
  });
}
function ropFallBtn(kind) {
  var b = el('button', { class: 'rop-fall', type: 'button', 'data-fall': kind });
  b.addEventListener('click', function (e) {
    e.preventDefault(); e.stopPropagation();
    var L = ropFallList(b), open = !L.some(ropFallOpen);
    L.forEach(function (s) { ropFallSet(s, open); });
    ropFoldSave(); try { persistUI(); } catch (e2) {} if (open) try { setTimeout(pxFitRail, 260); } catch (e3) {}
    ropFallSync();
  });
  return el('div', { class: 'rop-fallw rop-fallw-' + kind }, [b]);
}
function ropFallAdd(root) {
  var col = root.querySelector('.rop-col'), rail = root.querySelector('.rop-rail');
  var first = col && col.firstElementChild; if (first) col.insertBefore(ropFallBtn('main'), first);   /* 17.1: above the Operations section */
  if (rail) { var top = rail.querySelector('.rop-top'), r1 = top && top.querySelector(':scope > section.rop-rblk:not(.rop-stg)'), props = rail.querySelector('.px-props');
    if (r1) top.insertBefore(ropFallBtn('rail'), r1); else if (props) props.parentNode.insertBefore(ropFallBtn('rail'), props); }
  ropFallSync();
}

/* the PropertyList: groups fold; the rail never scrolls — opening one that would overflow folds the oldest */
function pxProp(label, value, opts) {
  opts = opts || {}; if (opts.edit && typeof tcxOn === 'function' && tcxOn() && typeof canPage === 'function' && !canPage('ros')) opts = Object.assign({}, opts, { edit: null });   /* Parsec 14.3 */
  var b = el('b', { class: (opts.empty ? 'px-empty ' : '') + (opts.num ? 'px-num' : '') });
  if (opts.id) b.innerHTML = '<span class="px-id">' + esc(value) + '</span>'; else if (typeof value === 'string') b.textContent = value; else if (value) b.appendChild(value);
  var row = el('div', { class: 'px-prop' + (opts.edit ? ' is-edit' : '') }, [el('span', { text: label }), b]);
  if (opts.copy) row.appendChild(el('button', { class: 'px-copy', type: 'button', title: 'Copy', html: pxI('copy', 13) + pxI('check', 13), onClick: function (e) {
    e.stopPropagation(); var c = e.currentTarget; pxCopy(opts.copy, label + ' copied'); c.classList.add('is-done'); setTimeout(function () { c.classList.remove('is-done'); }, 1400); } }));
  if (opts.edit) row.addEventListener('click', function (e) {
    if (row.querySelector('input') || (e.target.closest && e.target.closest('.px-copy'))) return;
    var cur = opts.edit.get(), inp = el('input', { class: 'px-input', style: 'width:100%;height:26px;font-size:13px', value: cur || '', type: opts.edit.type || 'text' });
    b.innerHTML = ''; b.appendChild(inp); inp.focus(); if (inp.select) try { inp.select(); } catch (er) {}
    var done = false;
    function commit(keep) { if (done) return; done = true; var v = inp.value.trim(); if (keep && v !== String(cur || '')) { pushUndo(label.toLowerCase()); opts.edit.set(v); save(true); } render(); tecRender(); }
    inp.addEventListener('keydown', function (ev) { ev.stopPropagation(); if (ev.key === 'Enter') { ev.preventDefault(); commit(true); } else if (ev.key === 'Escape') { ev.preventDefault(); commit(false); } });
    inp.addEventListener('blur', function () { commit(true); });
  });
  return row;
}
function pxField2(k) { return roFldEdit(RO, k) || { get: function () { return RO[k] || ''; }, set: function (v) { RO[k] = v; } }; }   /* Parsec 14.1: one table (ROFLD) */
function pxGroup(key, title, sum, rows, act) {
  UI.ivFold = UI.ivFold || {}; UI.ivOpenAt = UI.ivOpenAt || {};
  var open = !rpFold(key);   /* 17.1: what you fold stays folded — the same on the RO list's panel (ro/ro-panel.js) */
  var sec = el('section', { class: 'px-pg' + (open ? ' is-open' : ''), 'data-pg': key });
  var h = el('div', { class: 'px-pg__h', role: 'button', tabindex: '0', 'aria-expanded': open ? 'true' : 'false', html: pxI('chevD', 12).replace('class="px-ico"', 'class="px-ico px-pg__chev"') + '<span class="px-pg__t">' + esc(title) + '</span><span class="px-pg__sum">' + esc(sum || '') + '</span>' });
  if (act) h.appendChild(act);
  function toggle(e) {
    if (e && e.target.closest && e.target.closest('.px-pg__act')) return;
    var o = !sec.classList.contains('is-open');
    sec.classList.toggle('is-open', o); h.setAttribute('aria-expanded', o ? 'true' : 'false');
    UI.ivFold[key] = !o; rpFoldSet(key, !o); if (o) UI.ivOpenAt[key] = Date.now();
    persistUI();
    if (o) setTimeout(pxFitRail, 260);
  }
  h.addEventListener('click', toggle); h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); } });
  sec.appendChild(h);
  sec.appendChild(el('div', { class: 'px-pg__b' }, [el('div', { class: 'px-pg__in' }, rows)]));
  return sec;
}
function pxFitRail() {
  var rail = R && R.querySelector('.px-ro__rail'); if (!rail) return;
  if (rail.classList.contains('rop-rail')) return;   /* Parsec 12: the rail scrolls */
  var guard = 6;
  while (rail.scrollHeight > rail.clientHeight + 1 && guard--) {
    var open = Array.prototype.filter.call(rail.querySelectorAll('.px-pg.is-open'), function (s) { return true; });
    if (open.length < 2) break;
    open.sort(function (a, b) { return (UI.ivOpenAt[a.dataset.pg] || 0) - (UI.ivOpenAt[b.dataset.pg] || 0); });
    var s = open[0]; s.classList.remove('is-open'); UI.ivFold[s.dataset.pg] = true;
  }
  persistUI();
}
function ivBuild(page, cardCol) {
  pxClosePop();
  page.classList.add('roB', 'ivB', 'pxB');
  var stash = el('div', { class: 'pxStash', 'aria-hidden': 'true' });
  var slotEl = page.querySelector(':scope > slot');
  Array.prototype.slice.call(page.children).forEach(function (c) { if (c !== slotEl) stash.appendChild(c); });
  stash.appendChild(cardCol);
  ropBuild(page, stash, slotEl);   /* Parsec 12 (b9/rop1.js) */
}
/* single keys on the RO page: S status, T transfer, O add operation, P print, K / J previous / next; 1–5 and E in the part menu */
window.addEventListener('keydown', function (e) {
  if (!ivOn() || e.ctrlKey || e.metaKey || e.altKey || !R) return;
  var pg = R.querySelector('.page.pxB'); if (!pg || !pg.isConnected) return;
  var a = document.activeElement, sa = R.activeElement;
  if ((a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) || (sa && /^(INPUT|TEXTAREA|SELECT)$/.test(sa.tagName)) || (sa && sa.isContentEditable)) return;
  if (PXM || R.getElementById('modalWrap') || (UI.modal && document.querySelector('.modal'))) return;
  if (PXP && PXP.part) {
    var k0 = e.key.toLowerCase();
    if (/^[1-5]$/.test(k0)) { e.preventDefault(); e.stopPropagation(); var s0 = PX_PS[+k0 - 1][0], pp = PXP.part; pxClosePop(); setPartStatus(pp.job, pp.p, s0); return; }
    if (k0 === 'e') { e.preventDefault(); e.stopPropagation(); var p1 = PXP.part; pxClosePop(); pxEditPart(p1.job, p1.p); return; }
  }
  if (e.key === 'Escape' && PXP) { pxClosePop(); return; }
  var k = e.key.toLowerCase(), b = null;
  if (k === 's') b = R.querySelector('.px-status--button');
  else if (k === 't') { e.preventDefault(); e.stopPropagation(); pxTransfer(); return; }
  else if (k === 'o') { e.preventDefault(); e.stopPropagation(); pxAddOp(); return; }
  else if (k === 'p') { e.preventDefault(); e.stopPropagation(); doPdf(); return; }
  if (b) { e.preventDefault(); e.stopPropagation(); b.click(); }
}, true);

function buildOpSide() {
  if (ivOn()) return buildOpSideIv();
  var side = el('div', { class: 'opSide' });
  side.appendChild(el('div', { class: 'osLbl', text: 'Operations' }));
  var cur = S.ui.card;
  S.jobs.forEach(function (j, i) {
    var st = opStatus(j), nm = typeof st === 'string' ? st : st.status, look = jobLook(nm), c = jobCalc(j);
    var rp = (j.parts || []).filter(function (p) { return p && (p.description || p.partNumber); }), out = rp.filter(function (p) { return !/Received|Installed/.test(p.status || ''); }).length;
    side.appendChild(el('button', { class: 'osRow' + (j.id === cur ? ' on' : '') + (runningPunchOf(j) ? ' live' : ''), type: 'button', title: jobStatusLabel(nm) + (typeof st !== 'string' && st.sub ? ' \u00b7 ' + st.sub : ''),
      onClick: function (e) { e.stopPropagation(); S.ui.card = j.id; render(); } }, [
      el('span', { class: 'osT' }, [el('b', { text: (i + 1) + ' \u00b7 ' + (j.complaint || 'Operation') }), el('i', { class: 'osDot', style: 'background:' + look.dot })]),
      el('span', { class: 'osS mono', text: fx(c.b) + ' / ' + fx(c.q) + ' h' + (out ? ' \u00b7 ' + out + ' part' + (out === 1 ? '' : 's') + ' out' : '') })]));
  });
  /* adding and extracting operations sit in the RO menu (≡) */
  /* who has the RO, and a way to hand it on — the full route lives on the Manager page and the Triage card */
  try {
    var h = rtHolder(RO), since = rtHeldSince(RO), held = since ? ageSince(since) : null, r = RO.route;
    side.appendChild(el('div', { class: 'osLbl', style: 'margin-top:40px', text: 'With' }));
    side.appendChild(el('div', { class: 'osWith' }, [el('b', { text: rtHolderName(h, RO) }), el('span', { text: ' \u00b7 ' + RT_LBL[h.to] + (held != null ? ' \u00b7 ' + rtDur(held) : '') })]));
    if (r && r.state === 'pending') side.appendChild(el('div', { class: 'osPend', text: 'Sent to ' + (r.to === 'tech' ? (r.who || 'a technician') : RT_LBL[r.to]) + ' \u2014 waiting to accept' }));
    side.appendChild(el('button', { class: 'osLink', type: 'button', text: 'Transfer\u2026', onClick: function (e) {
      e.stopPropagation(); UI.modal = { type: 'route', roId: RO.id, to: 'tech', who: RO.assignedTech || null, note: '', reason: '', acc: rtCfg().needAccept }; tecRender(); } }));
  } catch (er) {}
  return side;
}
/* move an operation — with its parts, notes, files and time punches — onto another RO */
function moveOpDialog(job) {
  var list = STATE.ros.filter(function (r) { return r.id !== RO.id && r.id !== SHOP_RO_ID && !r.shop && !roIsDone(r); });
  var q = el('input', { class: 'mvFind', type: 'text', placeholder: 'Find an RO \u2014 number, customer or unit', 'aria-label': 'Find an RO' });
  var box = el('div', { class: 'mvList', role: 'listbox' });
  function paint() {
    var f = q.value.trim().toLowerCase(); box.innerHTML = '';
    var hits = list.filter(function (r) { return !f || [r.roNumber, r.customerName, r.unitNumber, r.assignedTech].join(' ').toLowerCase().indexOf(f) > -1; }).slice(0, 50);
    if (!hits.length) box.appendChild(el('div', { class: 'xpEmpty', text: list.length ? 'No open RO matches that.' : 'There is no other open RO to move it to.' }));
    hits.forEach(function (r) {
      var n = (r.operations || []).length;
      box.appendChild(el('button', { class: 'mvRow', type: 'button', role: 'option', onClick: function (e) { e.stopPropagation(); closeModal(); moveOpTo(job, r); } }, [
        el('b', { class: 'mono', text: roLabel(r) }),
        el('span', { text: (r.customerName || 'No customer') + (r.unitNumber ? ' \u00b7 Unit ' + r.unitNumber : '') }),
        el('small', { text: n + (n === 1 ? ' operation' : ' operations') + (r.assignedTech ? ' \u00b7 ' + String(r.assignedTech).split(' ')[0] : '') })]));
    });
  }
  q.addEventListener('input', paint);
  modal({ title: 'Move \u201c' + (job.complaint || 'this operation') + '\u201d to another RO', body: [
    el('div', { class: 'mvWrap' }, [el('p', { class: 'mvNote', text: 'Its parts, notes, files and time punches go with it.' + (runningPunchOf(job) ? ' Its clock keeps running on the new RO.' : '') }), q, box])
  ], actions: [{ label: 'Cancel' }] });
  paint(); setTimeout(function () { q.focus(); }, 30);
}
function moveOpTo(job, target) {
  if (!target || !RO) return;
  snapshot('move operation');
  var from = RO;
  from.operations = (from.operations || []).filter(function (x) { return x.id !== job.id; });
  if (!Array.isArray(target.operations)) target.operations = [];
  target.operations.push(job);
  STATE.punches.forEach(function (p) { if (p.opId === job.id) p.roId = target.id; });
  if (Array.isArray(from.attachments)) {
    var mv = from.attachments.filter(function (a) { return a && a.opId === job.id; });
    if (mv.length) { from.attachments = from.attachments.filter(function (a) { return mv.indexOf(a) < 0; }); target.attachments = (target.attachments || []).concat(mv); }
  }
  if (S.ui.card === job.id) S.ui.card = S.jobs[0] ? S.jobs[0].id : null;
  var oa = openList(from), ok = oa.indexOf(job.id); if (ok > -1) oa.splice(ok, 1);
  if (soloJob === job.id) soloJob = null;
  try { audit('move', 'Operation \u201c' + (job.complaint || 'operation') + '\u201d moved from ' + roLabel(from) + ' to ' + roLabel(target), from); } catch (e) {}
  save(true); render(); tecRender();
  toast('Moved to ' + roLabel(target), { label: 'UNDO', run: function () { restoreSnapshot(); } });
}
/* an option picked on the RO List runs here, on the RO it was picked for */
function jcRunOpt(k) {
  if (!RO || !S) return;
  if (k === 'export') doExport();
  else if (k === 'print') doPdf();
  else if (k === 'addop') { pushUndo('add operation'); var nj = blankJob(); S.jobs.push(nj); S.ui.card = nj.id; UI.jcFocusNew = nj.id; save(true); render(); }
  else if (k === 'stdop') { UI.modal = { type: 'add-std-op', roId: RO.id }; tecRender(); }
  else if (k === 'extract') { UI.modal = { type: 'extract-ops', roId: RO.id, rows: [], text: '', status: '' }; tecRender(); setTimeout(function () { var ta = document.getElementById('ops-x-text'); if (ta) ta.focus(); }, 30); }
  else if (k === 'delete') confirmDeleteRO();
}
/* Called after every TEC redraw. The console only rebuilds when its RO changed, or when
   something outside it (the Time Log, a shortcut, undo) changed the data it shows. */
function attach(pane, ro) {
  if (UI.jcPendingOpt && ro && ro.id === UI.selectedRo) { var pk = UI.jcPendingOpt; UI.jcPendingOpt = null; setTimeout(function () { jcRunOpt(pk); }, 90); }
  ensureHost();
  if (HOST.parentNode !== pane) { pane.innerHTML = ''; pane.appendChild(HOST); }
  if (RO !== ro) {
    if (ATT.open) closeAttachments();
    RO = ro; S = makeFacade(ro); attach.rf = UI.roFrom || ''; soloJob = null; pickOpen = -1; hideSelToolbar();
    render();
    syncSoon();

    return;
  }
  if ((keyFor(ro) !== lastKey || UI.jcOpenDetails || (UI.roFrom || '') !== (attach.rf || '')) && !busy()){ attach.rf = UI.roFrom || ''; render(); }
  redockBand();
  if (UI.jcScrollTo) { var sid = UI.jcScrollTo; UI.jcScrollTo = null; if (!isOpenCard({ id: sid })) { openCard(RO.id, sid); render(); } scrollToJob(sid); }
}
function scrollToJob(id) {
  requestAnimationFrame(function () {
    var i = -1; S.jobs.forEach(function (j, k) { if (j.id === id) i = k; });
    var card = cardEl(i);
    if (!card) return;
    jcScrollTo(card);
  });
}

/* True while you are typing, selecting or answering a dialog inside the console. */
function busy() {
  if (!R || !HOST || !HOST.isConnected) return false;
  var a = R.activeElement;
  if (a && (/^(input|textarea|select)$/i.test(a.tagName) || a.isContentEditable)) return true;
  if (R.getElementById('modalWrap')) return true;
  var s = SEL();
  if (s && !s.isCollapsed && s.anchorNode && R.contains(s.anchorNode)) return true;
  return false;
}

return { attach: attach, busy: busy, syncFiles: syncFiles, scanFolder: scanFolder,
  addFilesTo: function (ro, task, list, cb, opId, extra, tick) {   /* the Warranty packet's Upload; the Technician page's Files tab gives the operation; the Library adds { doc } and ticks the entry */
    var arr = Array.prototype.slice.call(list || []); if (!ro || !arr.length) { if (cb) cb(0); return; }
    var entry = bulletinFor(ro, task), d = new Date(), ts = pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    if (!Array.isArray(entry.files)) entry.files = [];
    Promise.all(arr.map(function (file) { return shrinkImage(file).then(function (out) { var id = uid(); return idbPut(id, out.blob).then(function () { entry.files.push(Object.assign({ id: id, name: out.name, size: out.blob.size, type: out.blob.type || file.type, ts: nowIso(), op: opId || undefined }, extra || {})); }); }); }))
      .then(function () { if (tick && !entry.done) { entry.done = true; entry.tickedAt = nowIso(); } scheduleSave(true); syncFiles(); if (RO === ro && HOST && HOST.isConnected) render(); if (cb) cb(arr.length); }, function () { if (cb) cb(0); });
  },
  blobOf: function (f, roId) { return getBlob(f, roId); },
  rerender: function () { if (RO && R && HOST && HOST.isConnected) render(); },
  tab: function (k) { if (!RO) return; roTab = (k && roTab !== k) ? k : null; render(); },
  details: function () { if (RO) setDetails(!detailsOpen); },
  clock: function () {
    if (!RO || !S || !HOST || !HOST.isConnected) return false;
    var job = S.jobs.filter(function (j) { return j.id === S.ui.card; })[0] || S.jobs.filter(function (j) { return myRunOf(j); })[0] || S.jobs[0];
    if (!job) return false;
    toggleJobClock(job); return true;
  },
  openDetails: function () { if (RO) setDetails(true); },
  quickPart: function () { if (!RO || !S || !HOST || !HOST.isConnected) return false; return quickPartKey(); } };
