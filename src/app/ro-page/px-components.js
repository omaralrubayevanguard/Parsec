/* Parsec · ro-page · px-components.js
   The RO page's components from the Parsec design system: pop-overs (one at a time, fixed to the viewport), the modal with scrim, StatusMenu, PartStatus dropdown, the Transfer / Add operation / Delete dialogs.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pxSi pxPsi pxCase pxI pxNum pxMoney pxDay pxHM pxWhen pxStMeta pxCopy pxClosePop … (31 functions, 3 constants)
   state      punches ros
   uses       access/ data/ kit/ pages/ ro/ shell/ state/
   at load    on document pointerdown
*/
/* ============ the RO page, built from the Parsec design system (ROPage pattern) ============
   In Ivory / Graphite the console's RO page is rebuilt with the system's own components: PageHeader with
   HeaderTotals, the title block, StageTrack, OperationList with the TimeCard and tabs, PartStatus, ActivityFeed,
   the NextStep card and the PropertyList rail, StatusMenu, Menu and Modal. The classic console still builds
   underneath (kept out of sight) so its editors stay one click away. */
var PX_PS = [['Not Ordered', 'hold', 'hold'], ['Ordered', 'wait', 'parts'], ['Backordered', 'wait', 'problem'], ['Received', 'working', 'working'], ['Installed', 'released', 'released']];
/* Parsec 14: the shared status icons (b9/st14.js) — the same shapes and colors as every other page */
function pxSi(name, extra) { var S = pgStOf('ro', name || 'Hold Tech'); return '<svg class="px-si pgst-i' + (extra ? ' ' + extra : '') + '" data-t="' + S.tone + '" viewBox="0 0 14 14" aria-hidden="true">' + (PGST_IC[S.ic] || PGST_IC.ring) + '</svg>'; }
function pxPsi(st) { var S = pgStOf('part', st || 'Not Ordered'); return '<svg class="px-si pgst-i" data-t="' + S.tone + '" viewBox="0 0 14 14" aria-hidden="true">' + (PGST_IC[S.ic] || PGST_IC.ring) + '</svg>'; }
function pxCase(t) { return String(t || '').split(' – ').map(function (s) { s = s.toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); }).join(' – '); }
function pxI(k, sz) { return ivIco(k, sz || 16); }
function pxNum(v, d) { return num(v).toFixed(d == null ? 2 : d); }
function pxMoney(n) { return usd(n); }
function pxDay(d) { return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); }
function pxHM(d) { return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }
function pxWhen(t) { var d = new Date(t); if (isNaN(d)) return ''; var now = new Date(), same = d.toDateString() === now.toDateString();
  return (same ? 'Today' : (now - d < 6 * 864e5 ? d.toLocaleDateString([], { weekday: 'short' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric' }))) + ' ' + pxHM(d); }
function pxStMeta(name) { var o = roStatusOption(name); return { subs: o ? o.subs : [], hint: (JC_STATUS_LOOK[name] || {}).hint || '' }; }
function pxCopy(txt, ok) { try { copyText(txt); } catch (e) {} toast(ok || 'Copied'); }

/* ---------- popovers: one at a time, fixed to the viewport, fade up 6px ---------- */
var PXP = null;
function pxClosePop() { if (PXP) { var p = PXP; PXP = null; if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el); if (p.anchor) p.anchor.classList.remove('is-open'); if (p.onClose) p.onClose(); } }
function pxPop(anchor, pop, opts) {
  opts = opts || {};
  var same = PXP && PXP.anchor === anchor; pxClosePop(); if (same && !opts.force) return null;
  pop.style.position = 'fixed'; pop.style.zIndex = '70'; pop.style.visibility = 'hidden';
  R.appendChild(pop);
  var r = anchor.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
  var sc = pop.classList.contains('px-smenu') ? (pop.firstChild || pop) : pop;   /* Parsec 14.7: taller than the window, it scrolls (the status picker: its list, so the second level still shows) */
  if (h > vh - 16) { sc.style.maxHeight = (vh - 16) + 'px'; sc.style.overflowY = 'auto'; h = pop.offsetHeight; }
  var left = opts.alignRight ? r.right - w : r.left, top = r.bottom + 6;
  if (opts.alignRight && left < 8) left = r.left; else if (!opts.alignRight && left + w > vw - 8) left = r.right - w;
  if (top + h > vh - 8) top = r.top - h - 6 >= 8 ? r.top - h - 6 : Math.max(8, vh - 8 - h);
  left = Math.max(8, Math.min(left, vw - w - 8));
  pop.style.left = left + 'px'; pop.style.top = top + 'px'; pop.style.visibility = '';
  var q0 = pop.getBoundingClientRect(); if (Math.abs(q0.left - left) > 0.5 || Math.abs(q0.top - top) > 0.5) { pop.style.left = (2 * left - q0.left) + 'px'; pop.style.top = (2 * top - q0.top) + 'px'; }
  anchor.classList.add('is-open');
  PXP = { el: pop, anchor: anchor, onKey: opts.onKey, onClose: opts.onClose };
  return pop;
}
document.addEventListener('pointerdown', function (e) {
  if (!PXP) return;
  var path = e.composedPath ? e.composedPath() : [];
  if (path.indexOf(PXP.el) > -1 || path.indexOf(PXP.anchor) > -1) return;
  if (PXP.sub && path.indexOf(PXP.sub) > -1) return;
  pxClosePop();
}, true);
function pxMenuItem(icon, label, opts) {
  opts = opts || {};
  return el('button', { class: 'px-menu__item' + (opts.danger ? ' px-menu__item--danger' : '') + (opts.on ? ' is-on' : ''), type: 'button', role: 'menuitem',
    html: (icon ? (icon.charAt(0) === '<' ? icon : pxI(icon)) : '') + '<span>' + esc(label) + '</span>' + (opts.kbd ? '<span class="px-kbd">' + esc(opts.kbd) + '</span>' : '') + (opts.tick ? '<span class="px-menu__tick">' + pxI('check', 14) + '</span>' : '') + (opts.more ? pxI('chevR', 12).replace('px-ico', 'px-ico px-smenu__more') : ''),
    onClick: function (e) { e.stopPropagation(); if (opts.keep) { opts.run && opts.run(e); return; } pxClosePop(); opts.run && opts.run(e); } });
}
function pxSep() { return el('div', { class: 'px-menu__sep' }); }

/* ---------- Modal: scrim with blur, rises 8px, Esc / Ctrl+Enter, focus managed ---------- */
var PXM = null;
/* a dialog dims the whole app: lift the console's pane (and the panel it sits in) over the sidebar while it is open */
function pxLift(on) {
  var pane = HOST && HOST.closest ? HOST.closest('.jc-pane') : null, n = pane;
  while (n && n !== document.body) { if (n.classList && (n.classList.contains('jc-pane') || n.classList.contains('main') || n.classList.contains('ro-page'))) { n.style.zIndex = on ? '120' : ''; if (on && getComputedStyle(n).position === 'static') n.style.position = 'relative'; else if (!on) n.style.position = ''; } n = n.parentElement; }
}
function pxCloseModal() {
  if (!PXM) return; var m = PXM; PXM = null;
  pxLift(false);
  m.scrim.classList.add('is-closing');
  setTimeout(function () { if (m.scrim.parentNode) m.scrim.parentNode.removeChild(m.scrim); }, 120);
  document.removeEventListener('keydown', m.key, true);
  if (m.back && m.back.focus) try { m.back.focus(); } catch (e) {}
}
function pxModal(o) {
  pxCloseModal(); pxClosePop(); pxLift(true);
  var back = (R && R.activeElement) || document.activeElement;
  var dlg = el('div', { class: 'px-modal' + (o.size ? ' px-modal--' + o.size : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title });
  var x = el('button', { class: 'px-btn px-btn--ghost px-btn--icon px-btn--sm', type: 'button', title: 'Close (Esc)', html: pxI('x'), onClick: function () { pxCloseModal(); } });
  dlg.appendChild(el('div', { class: 'px-modal__h' }, [el('div', {}, [el('h2', { text: o.title }), o.sub ? el('p', { text: o.sub }) : null]), x]));
  var body = el('div', { class: 'px-modal__b' }, o.body || []);
  dlg.appendChild(body);
  var f = el('div', { class: 'px-modal__f' });
  if (o.hint !== false) f.appendChild(el('span', { class: 'px-modal__hint', html: o.hint || (o.submit ? '<span class="px-kbd">Ctrl</span><span class="px-kbd">↵</span>' + esc(o.hintWord || 'to confirm') : '<span class="px-kbd">esc</span>to close') }));
  var submitBtn = null;
  if (o.submit) {
    f.appendChild(el('button', { class: 'px-btn px-btn--ghost', type: 'button', text: 'Cancel', onClick: function () { pxCloseModal(); } }));
    submitBtn = el('button', { class: 'px-btn ' + (o.danger ? 'px-btn--danger px-btn--solid' : 'px-btn--primary'), type: 'button', text: o.submit,
      onClick: function () { if (o.run && o.run() === false) return; pxCloseModal(); } });
    f.appendChild(submitBtn);
  } else f.appendChild(el('button', { class: 'px-btn', type: 'button', text: 'Close', 'data-autofocus': '1', onClick: function () { pxCloseModal(); } }));
  if (o.size === 'sm' && !o.submitHint) { var hh = f.querySelector('.px-modal__hint'); if (hh) hh.remove(); }
  dlg.appendChild(f);
  var scrim = el('div', { class: 'px-scrim', onMousedown: function (e) { if (e.target === scrim) pxCloseModal(); } }, [dlg]);
  R.appendChild(scrim);
  function key(e) {
    if (PXP) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); pxCloseModal(); }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && submitBtn) { e.preventDefault(); e.stopPropagation(); submitBtn.click(); }
  }
  document.addEventListener('keydown', key, true);
  PXM = { scrim: scrim, key: key, back: back, dlg: dlg, submit: submitBtn };
  setTimeout(function () { var t = dlg.querySelector('[data-autofocus]') || dlg.querySelector('input, textarea, select'); if (t) try { t.focus(); if (t.select && t.tagName === 'INPUT') t.select(); } catch (e) {} }, 40);
  return PXM;
}
function pxField(label, ctl) { return el('div', { class: 'px-field' }, [el('label', { text: label }), ctl]); }
function pxSeg(opts, cur, onPick, fill) {
  var s = el('div', { class: 'px-seg' + (fill ? ' px-seg--fill' : '') });
  opts.forEach(function (o) { var b = el('button', { class: o[0] === cur ? 'is-on' : '', type: 'button', text: o[1], onClick: function () { Array.prototype.forEach.call(s.children, function (c) { c.classList.remove('is-on'); }); b.classList.add('is-on'); onPick(o[0]); } }); s.appendChild(b); });
  return s;
}
function pxToggle(on, onChange, label) {
  var t = el('button', { class: 'px-toggle' + (on ? ' is-on' : ''), type: 'button', 'aria-label': label || 'Toggle', 'aria-pressed': on ? 'true' : 'false',
    onClick: function (e) { e.stopPropagation(); var v = !t.classList.contains('is-on'); t.classList.toggle('is-on', v); t.setAttribute('aria-pressed', v ? 'true' : 'false'); onChange(v); } });
  return t;
}

/* ---------- StatusMenu ---------- */
function pxStatusMenu(anchor) {
  var cur = roStatus(RO), pop = el('div', { class: 'px-pop px-smain', role: 'menu' });
  var wrap = el('div', { class: 'px-smenu' }, [pop]);
  var inp = el('input', { class: 'px-msearch', placeholder: 'Set status…', 'aria-label': 'Set status' });
  pop.appendChild(el('div', { class: 'px-menu__search' }, [el('span', { html: pxI('search') }), inp, el('span', { class: 'px-kbd', text: 'S' })]));
  var items = [], sub = null;
  function pick(name, s) {
    pxClosePop();
    if (name === 'Complete – Released' && typeof rtNeeded === 'function' && !rtNeeded(RO) && typeof ropBypassAsk === 'function' && ropBypassOk()) { ropBypassAsk(); return; }   /* 17.3: no road test — the release question, not the checks */
    if (setRoStatus(RO.id, name, s || null) === false) { setTimeout(tecRender, 0); return; }
    save(true); render(); tecRender();
    toast('Status set to ' + roStShown(RO) + (s ? ' · ' + s.charAt(0) + s.slice(1).toLowerCase() : ''), { label: 'UNDO', run: function () { restoreSnapshot(); } });
  }
  function showSub(it) {
    if (sub) { sub.remove(); sub = null; }
    var meta = pxStMeta(it.name); if (!meta.subs.length) return;
    sub = el('div', { class: 'px-pop px-sub' }, [el('div', { class: 'px-menu__group', text: meta.hint })].concat(meta.subs.map(function (s) {
      var on = cur && cur.status === it.name && cur.sub === s;
      return el('button', { class: 'px-menu__item' + (on ? ' is-on' : ''), type: 'button', text: s.charAt(0) + s.slice(1).toLowerCase(), onClick: function (e) { e.stopPropagation(); pushUndo('status'); pick(it.name, s); } });
    })));
    wrap.appendChild(sub); pxSubFit(sub, wrap, it.btn);   /* Parsec 14.7 */
  }
  STATUSES.forEach(function (st, i) {
    if (i === 1 || i === 6 || i === 8) pop.appendChild(pxSep());
    var meta = pxStMeta(st.name), on = cur && cur.status === st.name;
    var b = el('button', { class: 'px-menu__item' + (on ? ' is-on' : ''), type: 'button', role: 'menuitemradio', 'aria-checked': on ? 'true' : 'false',
      html: pxSi(st.name) + '<span>' + esc(st.name === 'Complete – Road test' && typeof rtNeeded === 'function' && !rtNeeded(RO) ? 'Complete' : pxCase(st.name)) + '</span><span class="px-kbd">' + (i + 1) + '</span>' + (meta.subs.length ? pxI('chevR', 12).replace('class="px-ico"', 'class="px-ico px-smenu__more"') : '<span style="width:16px"></span>'),
      onClick: function (e) { e.stopPropagation(); pushUndo('status'); pick(st.name, null); },
      onMouseenter: function () { items.forEach(function (x) { x.btn.classList.remove('is-hover'); }); b.classList.add('is-hover'); showSub(it); } });
    var it = { name: st.name, btn: b, i: i }; items.push(it); pop.appendChild(b);
  });
  inp.addEventListener('input', function () {
    var q = inp.value.trim().toLowerCase();
    items.forEach(function (it) { it.btn.hidden = !!q && pxCase(it.name).toLowerCase().indexOf(q) < 0 && !pxStMeta(it.name).subs.some(function (s) { return s.toLowerCase().indexOf(q) > -1; }); });
  });
  inp.addEventListener('keydown', function (e) {
    e.stopPropagation();
    if (/^[1-9]$/.test(e.key) && !inp.value) { e.preventDefault(); var it = items[+e.key - 1]; if (it) { pushUndo('status'); pick(it.name, null); } }
    else if (e.key === 'Enter') { var v = items.filter(function (x) { return !x.btn.hidden; })[0]; if (v) { pushUndo('status'); pick(v.name, null); } }
    else if (e.key === 'ArrowRight') { var h = items.filter(function (x) { return x.btn.classList.contains('is-hover'); })[0] || items.filter(function (x) { return !x.btn.hidden; })[0]; if (h) showSub(h); }
    else if (e.key === 'Escape') pxClosePop();
  });
  if (pxPop(anchor, wrap)) { PXP.sub = null; setTimeout(function () { inp.focus(); }, 20); }
}

/* ---------- PartStatus dropdown ---------- */
function pxPartMenu(anchor, job, p) {
  var pop = el('div', { class: 'px-pop px-pmenu', role: 'menu' });
  pop.appendChild(el('div', { class: 'px-menu__group', text: 'Part status' }));
  PX_PS.forEach(function (s, i) {
    var on = (p.status || 'Not Ordered') === s[0];
    pop.appendChild(pxMenuItem(pxPsi(s[0]), s[0].charAt(0) + s[0].slice(1).toLowerCase(), { on: on, tick: on, kbd: on ? null : String(i + 1), run: function () { setPartStatus(job, p, s[0]); toast('Part status set to ' + s[0].charAt(0) + s[0].slice(1).toLowerCase(), { label: 'UNDO', run: function () { restoreSnapshot(); } }); } }));
  });
  pop.appendChild(pxSep());
  pop.appendChild(pxMenuItem('pencil', 'Edit part…', { kbd: 'E', run: function () { pxEditPart(job, p); } }));
  pop.appendChild(pxMenuItem('copy', 'Copy part number', { run: function () { pxCopy(p.partNumber || ptName(p), 'Part number copied'); } }));
  var others = S.jobs.filter(function (j) { return j !== job; });
  if (others.length) pop.appendChild(pxMenuItem('swap', 'Move to operation…', { keep: true, run: function () {
    var sub = el('div', { class: 'px-pop px-sub' }, [el('div', { class: 'px-menu__group', text: 'Move to' })].concat(others.map(function (j) {
      var n = S.jobs.indexOf(j) + 1;
      return el('button', { class: 'px-menu__item', type: 'button', html: '<span class="px-mrow__n">' + n + '</span><span>' + esc(j.complaint || 'Operation') + '</span>', onClick: function (e) {
        e.stopPropagation(); pxClosePop(); pushUndo('move part');
        job.parts = job.parts.filter(function (x) { return x !== p; }); j.parts = (j.parts || []).concat([p]);
        save(true); render(); toast(ptName(p) + ' moved to operation ' + n, { label: 'UNDO', run: function () { restoreSnapshot(); } });
      } });
    })));
    var old = pop.querySelector('.px-sub'); if (old) old.remove();
    pop.appendChild(sub); pxSubFit(sub, pop, null);   /* Parsec 14.7 */
  } }));
  pop.appendChild(pxSep());
  pop.appendChild(pxMenuItem('trash', 'Remove part', { danger: true, run: function () {
    pushUndo('remove part'); job.parts = job.parts.filter(function (x) { return x !== p; }); save(true); render();
    toast(ptName(p) + ' removed', { label: 'UNDO', run: function () { restoreSnapshot(); } });
  } }));
  pxPop(anchor, pop, { alignRight: true, force: false });
  if (PXP) PXP.part = { job: job, p: p };
}
function pxEditPart(job, p) {
  var d = el('input', { class: 'px-input px-input--full', value: p.description || '', 'data-autofocus': '1' });
  var pn = el('input', { class: 'px-input', style: 'width:100%', value: p.partNumber || '' });
  var q = el('input', { class: 'px-input', style: 'width:72px', value: p.qty || '1', inputmode: 'decimal' });
  var pr = el('input', { class: 'px-input', style: 'width:110px', value: p.price || '', inputmode: 'decimal', placeholder: '0.00' });
  var eta = el('input', { class: 'px-input', style: 'width:150px', type: 'date', value: /^\d{4}-\d{2}-\d{2}$/.test(p.eta || '') ? p.eta : '' });
  pxModal({ title: 'Edit part', sub: (job.complaint || 'Operation') + ' · ' + (p.status || 'Not Ordered'), submit: 'Save part', hintWord: 'to save',
    body: [pxField('Description', d), pxField('Part number', pn),
      el('div', { style: 'display:flex;gap:16px;flex-wrap:wrap' }, [pxField('Qty', q), pxField('Price', el('div', { class: 'px-affix' }, [el('span', { text: '$' }), pr])), pxField('ETA', eta)])],
    run: function () {
      pushUndo('edit part');
      p.description = d.value.trim(); p.partNumber = pn.value.trim(); p.qty = q.value.trim() || '1'; p.price = cdMoney(pr.value.trim()); p.eta = eta.value || '';
      save(true); render(); toast('Part saved', { label: 'UNDO', run: function () { restoreSnapshot(); } });
    } });
}

/* ---------- dialogs: Transfer, Add operation, Delete RO, totals ---------- */
function pxTransfer() {
  var ro = RO, hold = rtHolderName(rtHolder(ro), ro), m = { to: 'tech', who: null, reason: '', note: '', acc: rtCfg().needAccept };
  var techs = rtTechs(), picks = el('div', { class: 'px-picks' }), techF = pxField('Technician', picks);
  var reason = el('button', { class: 'px-select', type: 'button', html: '<span>Pick a reason</span>' + pxI('chevD', 14).replace('class="px-ico"', 'class="px-ico px-chev"') });
  reason.addEventListener('click', function (e) {
    e.stopPropagation();
    var pop = el('div', { class: 'px-pop', style: 'width:' + reason.offsetWidth + 'px' }, RT_REASONS.map(function (r) {
      return pxMenuItem(null, r, { on: m.reason === r, tick: m.reason === r, run: function () { m.reason = r; reason.firstChild.textContent = r; } });
    }));
    pop.style.zIndex = '90'; pxPop(reason, pop); if (PXP) PXP.el.style.zIndex = '90';
  });
  var note = el('textarea', { class: 'px-input px-input--full', rows: '2', placeholder: 'Anything they need to know' });
  var accL = el('span', {});
  var acc = pxToggle(m.acc, function (v) { m.acc = v; }, 'Ask them to accept first');
  
  
  function paint() {
    picks.innerHTML = '';
    techs.forEach(function (n) {
      var has = techSame(ro.assignedTech, n) && rtHolder(ro).to === 'tech';
      var c = STATE.ros.filter(function (x) { return !roIsDone(x) && techSame(x.assignedTech, n); }).length;
      var b = el('button', { class: 'px-pick' + (m.who && techSame(m.who, n) ? ' is-on' : '') + (has ? ' is-dis' : ''), type: 'button',
        html: '<span class="px-av px-av--md">' + esc(ivInit(n)) + '</span><span class="px-pick__t"><b>' + esc(n) + '</b><small>' + (has ? 'Has this RO · ' : '') + c + ' RO' + (c === 1 ? '' : 's') + '</small></span><i class="px-radio"></i>',
        onClick: function () { if (has) return; m.who = n; paint(); } });
      picks.appendChild(b);
    });
    techF.style.display = m.to === 'tech' ? '' : 'none';
    accL.textContent = 'Ask ' + (m.to === 'tech' ? (m.who ? m.who.split(' ')[0] : 'them') : RT_LBL[m.to]) + ' to accept before it moves';
    if (PXM && PXM.submit) { var ok = m.to !== 'tech' || !!m.who; PXM.submit.disabled = !ok; PXM.submit.classList.toggle('is-disabled', !ok); if (!ok) PXM.submit.setAttribute('data-tip', 'Pick a technician first'); else PXM.submit.removeAttribute('data-tip'); }
  }
  var seg = pxSeg(['tech', 'writer', 'parts', 'foreman', 'manager', 'warranty'].map(function (k) { return [k, RT_LBL[k]]; }), 'tech', function (k) { m.to = k; m.who = null; paint(); }, true);
  pxModal({ title: 'Transfer ' + (ro.roNumber || 'RO'), sub: (ro.customerName || '') + ' · now with ' + hold, submit: 'Transfer RO', hintWord: 'to send',
    body: [pxField('Send to', seg), techF, pxField('Reason', reason), pxField('Note', note), el('label', { class: 'px-check-row' }, [acc, accL])],
    run: function () {
      if (m.to === 'tech' && !m.who) { toast('Pick a technician first'); return false; }
      pushUndo('send RO'); rtSend(ro, m.to, m.who, note.value, null, { reason: m.reason, accept: m.acc });
      scheduleSave(true);
      pushToast(roLabel(ro) + ' sent to ' + (m.to === 'tech' ? m.who : RT_LBL[m.to]) + (ro.route.state === 'pending' ? ' — waiting for them to accept.' : '.'), true);
      tecRender();
    } });
  paint();
}
function pxAddOp() {
  var t = 'OP', pay = 'customer';
  var c = el('input', { class: 'px-input px-input--full', placeholder: 'e.g. Air leak at the front axle', 'data-autofocus': '1' });
  var tags = el('div', { class: 'px-tagpick' }, ['DIAG', 'OP', 'PM', 'WARR', 'COMEBACK', 'SUBLET'].map(function (k) {
    var b = el('button', { class: 'px-tag' + (k === t ? ' is-on' : ''), type: 'button', 'data-t': k, text: k, onClick: function () { t = k; Array.prototype.forEach.call(tags.children, function (x) { x.classList.toggle('is-on', x === b); }); } });
    return b;
  }));
  var q = el('input', { class: 'px-input', style: 'width:96px', value: '1.00', inputmode: 'decimal' });
  pxModal({ title: 'Add operation', sub: (RO.roNumber || 'RO') + ' · becomes operation ' + (S.jobs.length + 1), submit: 'Add operation', hintWord: 'to add',
    body: [pxField('Complaint', c), pxField('Type', tags),
      el('div', { style: 'display:flex;gap:16px' }, [pxField('Quoted', el('div', { class: 'px-affix' }, [q, el('span', { text: 'h' })])),
        el('div', { class: 'px-field', style: 'flex:1' }, [el('label', { text: 'Pay' }), pxSeg([['customer', 'Customer'], ['warranty', 'Warranty'], ['internal', 'Internal']], 'customer', function (v) { pay = v; }, true)])]),
      el('button', { class: 'px-link', type: 'button', style: 'align-self:flex-start', text: 'Start from a standard operation…', onClick: function () { pxCloseModal(); jcRunOpt('stdop'); } })],
    run: function () {
      pushUndo('add operation');
      var nj = blankJob(); nj.jobType = t; nj.complaint = c.value.trim(); nj.quoted = num(q.value) || 0; if (pay !== 'customer') nj.pay = pay;
      S.jobs.push(nj); S.ui.card = nj.id; save(true); render(); tecRender();
      toast('Operation ' + S.jobs.length + ' added', { label: 'UNDO', run: function () { restoreSnapshot(); } });
    } });
}
function pxDelete() {
  if (!permOk('ro.del')) return;   /* Parsec 13 */
  var ro = RO, nP = 0, nT = STATE.punches.filter(function (p) { return p.roId === ro.id; }).length, nF = allFiles().length;
  S.jobs.forEach(function (j) { nP += (j.parts || []).length; });
  var days = ro.dateOpened ? Math.max(0, Math.floor((Date.now() - new Date(ro.dateOpened)) / 864e5)) : 0;
  pxModal({ title: 'Delete ' + (ro.roNumber || 'this RO') + '?', sub: (ro.customerName || '') + ' · ' + days + ' day' + (days === 1 ? '' : 's') + ' open', size: 'sm', submit: 'Delete RO', danger: true, hint: false,
    body: [el('p', { class: 'px-modal__p', text: 'This removes ' + S.jobs.length + ' operation' + (S.jobs.length === 1 ? '' : 's') + ', ' + nT + ' time entr' + (nT === 1 ? 'y' : 'ies') + ', ' + nP + ' part' + (nP === 1 ? '' : 's') + ' and ' + nF + ' file' + (nF === 1 ? '' : 's') + ' from Parsec. You can undo it right after with Ctrl+Z.' })],
    run: function () {
      pushUndo('delete RO ' + (ro.roNumber || ''));
      if (UNDO.length) UNDO[UNDO.length - 1].reselect = ro.id;
      audit('ro-del', 'Deleted ' + roLabel(ro) + (ro.customerName ? ' (' + ro.customerName + ')' : ''), ro);
      STATE.punches = STATE.punches.filter(function (p) { return p.roId !== ro.id; });
      STATE.ros = STATE.ros.filter(function (x) { return x.id !== ro.id; });
      if (UI.selectedRo === ro.id) UI.selectedRo = null;
      delete UI.roOp[ro.id];
      scheduleSave(true); pushToast('Deleted ' + (ro.roNumber || 'RO') + ' — Ctrl+Z brings it back.'); tecRender();
    } });
}
function pxGoto(jobId, tab) { pxCloseModal(); UI.ivTab = UI.ivTab || {}; if (tab) UI.ivTab[jobId] = tab; S.ui.card = jobId; save(); render();
  requestAnimationFrame(function () { var r = R.querySelector('.px-row[data-op="' + jobId + '"]'); if (r) r.scrollIntoView({ block: 'start', behavior: 'smooth' }); }); }
function pxMini(b, q) { var o = q > 0 && b > q; return '<span class="px-mini"><i class="' + (o ? 'over' : '') + '" style="width:' + (q > 0 ? Math.min(100, b / q * 100) : 0).toFixed(1) + '%"></i></span>'; }
function pxTotalsModal(k) {
  var ro = RO, T = totals(), list = el('div', {});
  if (k === 'time') {
    var left = T.q - T.b, ef = T.b > .05 ? Math.round(T.qs / T.b * 100) : null;
    var rows = el('div', { class: 'px-mlist' }, [el('div', { class: 'px-mgrp', html: '<b>By operation</b>' })].concat(S.jobs.map(function (j, i) {
      var c = jobCalc(j), st = opStatus(j);
      return el('button', { class: 'px-mrow px-mrow--time', type: 'button', html: pxSi(typeof st === 'string' ? st : st.status) + '<span class="px-mrow__t"><span class="px-mrow__n">' + (i + 1) + '</span>' + esc(j.complaint || 'Operation') + '</span>' + pxMini(c.b, c.q) + '<span class="px-mrow__v">' + pxNum(c.b) + ' <em>/ ' + pxNum(c.q) + ' h</em></span>', onClick: function () { pxGoto(j.id, 'time'); } });
    })));
    pxModal({ title: 'Time on ' + (ro.roNumber || 'RO'), sub: (ro.customerName || '') + ' · ' + S.jobs.length + ' operation' + (S.jobs.length === 1 ? '' : 's'), size: 'md',
      body: [el('div', { class: 'px-tsum', html: '<div><span>Quoted</span><b>' + pxNum(T.q) + '<small>h</small></b></div><div><span>Burnt</span><b>' + pxNum(T.b) + '<small>h</small></b></div><div><span>' + (left < 0 ? 'Over' : 'Left') + '</span><b class="' + (left < 0 ? 'px-bad' : '') + '">' + pxNum(Math.abs(left)) + '<small>h</small></b></div><div><span>Efficiency</span><b class="' + (ef == null ? '' : ef >= 100 ? 'px-good' : 'px-warn') + '">' + (ef == null ? '—' : ef + '<small>%</small>') + '</b></div>' }), rows] });
  } else if (k === 'parts') {
    var cnt = {}; PX_PS.forEach(function (s) { cnt[s[0]] = 0; });
    var groups = [];
    S.jobs.forEach(function (j, i) {
      var ps = (j.parts || []).filter(function (p) { return p && (p.description || p.partNumber); }); if (!ps.length) return;
      ps.forEach(function (p) { cnt[p.status || 'Not Ordered'] = (cnt[p.status || 'Not Ordered'] || 0) + 1; });
      groups.push(el('div', { class: 'px-mlist' }, [el('button', { class: 'px-mgrp', type: 'button', html: '<b>Operation ' + (i + 1) + '</b><span> · ' + esc(j.complaint || 'Operation') + '</span>' + pxI('chevR', 14), onClick: function () { pxGoto(j.id, 'parts'); } })].concat(ps.map(function (p) {
        return el('button', { class: 'px-mrow px-mrow--part', type: 'button', html: '<span class="px-mrow__t">' + esc(ptName(p)) + '</span><span class="px-id px-faint">' + esc(p.partNumber || '') + '</span><span class="r">' + esc(p.qty || '1') + '</span>' + pgSt('part', p.status || 'Not Ordered', { of: p, ofKind: 'part', cls: 'sm px-pstat-ro' }), onClick: function () { pxGoto(j.id, 'parts'); } });
      }))));
    });
    pxModal({ title: 'Parts on ' + (ro.roNumber || 'RO'), sub: (ro.customerName || '') + ' · ' + T.recv + ' of ' + T.lines + ' in hand', size: 'md',
      body: [el('div', { class: 'px-tsum px-tsum--5', html: PX_PS.map(function (s) { return '<div><span>' + pxPsi(s[0]) + esc(pxCase(s[0])) + '</span><b>' + cnt[s[0]] + '</b></div>'; }).join('') })].concat(groups.length ? groups : [el('p', { class: 'px-modal__p', text: 'No parts on this RO yet.' })]) });
  } else {
    var fl = allFiles(), whole = fl.filter(function (x) { return !x.f.op; }), byOp = {};
    fl.forEach(function (x) { if (x.f.op) (byOp[x.f.op] = byOp[x.f.op] || []).push(x); });
    function frow(x) { return el('button', { class: 'px-mrow px-mrow--file', type: 'button', html: pxI('clip') + '<span class="px-mrow__t">' + esc(x.f.name || 'File') + '</span><small>' + esc((taskDef(x.e.task) || {}).name || '') + '</small><small>' + esc(cdTs(x.f.ts).slice(0, 5)) + '</small>', onClick: function () { pxCloseModal(); openAttachments(x.f.id); } }); }
    var body = [];
    if (whole.length) body.push(el('div', { class: 'px-mlist' }, [el('div', { class: 'px-mgrp', html: '<b>Whole RO</b><span> · ' + whole.length + '</span>' })].concat(whole.map(frow))));
    S.jobs.forEach(function (j, i) { var l = byOp[j.id]; if (l) body.push(el('div', { class: 'px-mlist' }, [el('button', { class: 'px-mgrp', type: 'button', html: '<b>Operation ' + (i + 1) + '</b><span> · ' + esc(j.complaint || 'Operation') + '</span>' + pxI('chevR', 14), onClick: function () { pxGoto(j.id, 'files'); } })].concat(l.map(frow)))); });
    if (!fl.length) body.push(el('p', { class: 'px-modal__p', text: 'No files on this RO yet.' }));
    var inp = el('input', { type: 'file', multiple: 'multiple', style: 'display:none', onChange: function () { addFilesToRO(inp.files); pxCloseModal(); render(); } });
    body.push(el('div', { style: 'display:flex;gap:8px' }, [inp, el('button', { class: 'px-btn px-btn--sm', type: 'button', html: pxI('plus') + 'Attach files', onClick: function () { inp.click(); } }),
      fl.length ? el('button', { class: 'px-btn px-btn--sm px-btn--ghost', type: 'button', text: 'Large view', onClick: function () { pxCloseModal(); openAttachments(null); } }) : null]));
    pxModal({ title: 'Files on ' + (ro.roNumber || 'RO'), sub: (ro.customerName || '') + ' · ' + fl.length + ' file' + (fl.length === 1 ? '' : 's'), size: 'md', body: body });
  }
}
function pxEvent(h) {
  var t0 = h.t || '', lc = /^[A-Z][a-z]/.test(t0) ? t0.charAt(0).toLowerCase() + t0.slice(1) : t0;
  var txt = '<b>' + esc(h.by || 'You') + '</b> ' + esc(lc);
  if (h.o && h.n) txt += ' <span class="px-faint">' + esc(h.o) + ' →</span> <b>' + esc(h.n) + '</b>';
  else if (h.n || h.o) txt += ' · ' + esc(h.n || h.o);
  var ic = h.k === 'punch' ? 'clock' : h.k === 'part' ? 'parts' : h.k === 'status' ? null : h.k === 'job' ? 'addJob' : 'ros';
  return el('div', { class: 'px-ev' }, [el('span', { class: 'px-ev__dot', html: ic ? pxI(ic, 14) : pxSi(h.n || 'Hold Tech') }), el('span', { html: txt }), el('time', { text: pxWhen(h.at) })]);
}
