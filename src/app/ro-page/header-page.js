/* Parsec · ro-page · header-page.js
   The RO page header (pxHeader): breadcrumb with the RO number (click copies it), the pager, the customer and contact with its menu (16.3 B), the counters (hours, parts, files), the options menu.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v163bIc v163bPh v163bCopyId v163bIdOn v163bId v163bTitle v163bCanEd v163bContact v163bMenu v163bEdit ropContactCard pxHeader … (23 functions, 2 constants)
   uses       access/ automations/ clock/ data/ import/new-ro/ kit/ pages/rolist/ pages/triage/ ro/ shell/ state/ trucks/
*/
/* ---------- the page ---------- */
/* ===== Parsec 16.3 (B) — inside the RO page (JC): its RO number copies on click (the header and the truck card), and the
   contact in the header — name and phone; a click gives Copy the number · Edit the contact · Copy a text (the Triage templates) ===== */
function v163bIc(k, sz) {
  var P = { mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>', phone: '<path d="M5.5 3.5h3l1.5 4-2 1.3a10.5 10.5 0 005.2 5.2l1.3-2 4 1.5v3a2 2 0 01-2.1 2A16 16 0 013.5 5.6a2 2 0 012-2.1z"/>' };
  return P[k] ? '<svg class="px-ico" width="' + (sz || 14) + '" height="' + (sz || 14) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[k] + '</svg>' : pxI(k, sz || 14);
}
function v163bPh(p) { var s = String(p || '').trim(), d = s.replace(/\D/g, ''); if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1); return d.length === 10 ? '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6) : s; }
/* the RO number: a click (or Enter) copies it, with a tick — it isn't a link here, you're on that RO */
function v163bCopyId(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  var n = RO && RO.roNumber; if (!n) return;
  pxCopy(n, 'Copied ' + n);
  var t = e && e.currentTarget; if (t && t.classList) { t.classList.add('is-copied'); setTimeout(function () { t.classList.remove('is-copied'); }, 1400); }
}
function v163bIdOn(n) {
  if (!n || !RO || !RO.roNumber || n.v163b) return n; n.v163b = 1;
  n.classList.add('v163b-id'); n.setAttribute('role', 'button'); n.setAttribute('tabindex', '0'); n.setAttribute('title', 'Copy the RO number');
  n.addEventListener('click', v163bCopyId);
  n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') v163bCopyId(e); });
  return n;
}
function v163bId() { return v163bIdOn(el('b', { class: 'px-id', text: RO.roNumber || 'RO' })); }
function v163bTitle(tb) { try { v163bIdOn(tb && tb.querySelector && tb.querySelector('.px-ro__eyebrow .px-id')); } catch (e) {} return tb; }
/* the contact */
function v163bCanEd() { try { if (typeof tcxOn === 'function' && tcxOn() && typeof canPage === 'function' && !canPage('ros')) return false; return typeof roFldCanEdit === 'function' ? roFldCanEdit(RO) : true; } catch (e) { return true; } }
function v163bContact() {
  if (!RO || RO.shop || RO.id === SHOP_RO_ID) return null;
  var nm = String(RO.contactName || '').trim(), ph = String(RO.contactPhone || '').trim(), ed = v163bCanEd();
  var w = el('div', { class: 'v163b-who' });
  if (RO.customerName) w.appendChild(el('span', { class: 'v163b-cu', text: RO.customerName }));
  if (!nm && !ph) {
    if (!ed) return RO.customerName ? w : null;
    var a = el('button', { class: 'v163b-ct is-add', type: 'button', title: 'Add who to call and their number', html: pxI('user', 14) + '<span>Add contact</span>' });
    a.addEventListener('click', function (e) { e.stopPropagation(); v163bEdit(a); });
    w.appendChild(a); return w;
  }
  var b = el('button', { class: 'v163b-ct', type: 'button', 'aria-haspopup': 'menu', title: 'Copy the number, edit the contact or copy a text',
    html: (nm ? pxI('user', 14) + '<span class="v163b-nm">' + esc(nm) + '</span>' : '') + (ph ? '<span class="v163b-ph">' + v163bIc('phone', 13) + '<span>' + esc(v163bPh(ph)) + '</span></span>' : '<span class="v163b-ph is-none">No number</span>') });
  b.addEventListener('click', function (e) { e.stopPropagation(); v163bMenu(b); });
  w.appendChild(b); return w;
}
function v163bMenu(b) {
  var nm = String(RO.contactName || '').trim(), ph = String(RO.contactPhone || '').trim(), ed = v163bCanEd(), L = [];
  if (ph) L.push(pxMenuItem('copy', 'Copy the number', { run: function () { pxCopy(v163bPh(ph), 'Copied ' + v163bPh(ph)); } }));
  if (ed) L.push(pxMenuItem('pencil', ph ? 'Edit the contact' : 'Add a number', { run: function () { setTimeout(function () { v163bEdit(b); }, 0); } }));
  var T = []; try { T = tgTpls(); } catch (e) {}
  if (T.length) {
    var sug = ''; try { sug = tgSugTpl(RO); } catch (e) {}
    L.push(pxSep(), el('div', { class: 'v163b-mlab', text: 'Copy a text' + (nm ? ' to ' + tgFirst(nm) : '') }));
    T.forEach(function (t) {
      var it = pxMenuItem('chat', t.n, { run: function () { var tx = ''; try { tx = tgFill(t.b, RO, { n: nm }); } catch (e) { tx = t.b; } pxCopy(tx, 'Copied the “' + t.n + '” text — paste it in your message'); } });
      it.setAttribute('data-v163b-tpl', t.id || ''); it.title = (function () { try { return tgFill(t.b, RO, { n: nm }); } catch (e) { return ''; } })();
      if (t.id === sug) it.insertAdjacentHTML('beforeend', '<span class="v163b-sug">suggested</span>');
      L.push(it);
    });
  }
  pxPop(b, el('div', { class: 'px-pop v163b-pop', role: 'menu' }, L), { alignRight: false });
}
/* Edit: the two fields in a small pop-over, through the RO details table (ROFLD) — Undo, the Activity line, saved */
function v163bEdit(anchor) {
  if (!v163bCanEd()) return;
  var f1 = roFldEdit(RO, 'contactName'), f2 = roFldEdit(RO, 'contactPhone'), f3 = roFldEdit(RO, 'contactEmail');
  var i1 = el('input', { class: 'px-input', type: 'text', value: RO.contactName || '', placeholder: 'Who to call', 'aria-label': 'Contact', autocomplete: 'off', 'data-no-draft': '' });
  var i2 = el('input', { class: 'px-input', type: 'tel', value: RO.contactPhone || '', placeholder: '(336) 555-0142', 'aria-label': 'Phone', autocomplete: 'off', 'data-no-draft': '' });
  var i3 = el('input', { class: 'px-input', type: 'email', value: RO.contactEmail || '', placeholder: 'name@company.com', 'aria-label': 'Email', autocomplete: 'off', 'data-no-draft': '' });
  function done(keep) {
    var a = i1.value.trim(), p = i2.value.trim(), m = i3.value.trim();
    if (keep && (a !== String(RO.contactName || '') || p !== String(RO.contactPhone || '') || m !== String(RO.contactEmail || ''))) {
      pushUndo('contact');
      if (a !== String(RO.contactName || '')) { if (f1) f1.set(a); else if (a) RO.contactName = a; else delete RO.contactName; }
      if (p !== String(RO.contactPhone || '')) { if (f2) f2.set(p); else if (p) RO.contactPhone = p; else delete RO.contactPhone; }
      if (m !== String(RO.contactEmail || '')) { if (f3) f3.set(m); else if (m) RO.contactEmail = m; else delete RO.contactEmail; }
      save(true); toast('Contact saved');
    }
    pxClosePop(); render(); tecRender();
  }
  [i1, i2, i3].forEach(function (i) { i.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); done(true); } else if (e.key === 'Escape') { e.preventDefault(); done(false); } }); });
  var pop = el('div', { class: 'px-pop v163b-ed', role: 'dialog', 'aria-label': 'Contact' }, [
    el('h4', { text: 'Contact' }),
    el('label', {}, [el('span', { text: 'Contact' }), i1]),
    el('label', {}, [el('span', { text: 'Phone' }), i2]),
    el('label', {}, [el('span', { text: 'Email' }), i3]),
    el('div', { class: 'v163b-eda' }, [el('button', { class: 'px-btn px-btn--sm', type: 'button', text: 'Cancel', onClick: function (e) { e.stopPropagation(); done(false); } }),
      el('button', { class: 'px-btn px-btn--sm px-btn--primary', type: 'button', text: 'Save', onClick: function (e) { e.stopPropagation(); done(true); } })])]);
  if (pxPop(anchor, pop, { force: true })) setTimeout(function () { try { (RO.contactName ? i2 : i1).focus(); } catch (e) {} }, 0);
}

/* 18 — the contact in the right column, above the buttons: who to call, their number, their email */
function ropContactCard() {
  if (!RO || RO.shop || RO.id === SHOP_RO_ID) return null;
  var nm = String(RO.contactName || '').trim(), ph = String(RO.contactPhone || '').trim(), em = String(RO.contactEmail || '').trim(), ed = v163bCanEd();
  if (!nm && !ph && !em && !ed) return null;
  var box = el('section', { class: 'rop-ct', 'aria-label': 'Contact' });
  var head = el('div', { class: 'rop-ct__h' }, [el('span', { text: 'Contact' })]);
  if (ed) { var eb = el('button', { class: 'rop-ct__ed', type: 'button', title: 'Edit the contact', text: nm || ph || em ? 'Edit' : 'Add' }); eb.addEventListener('click', function (e) { e.stopPropagation(); v163bEdit(eb); }); head.appendChild(eb); }
  box.appendChild(head);
  if (!nm && !ph && !em) { box.appendChild(el('div', { class: 'rop-ct__none', text: 'No one to call yet' })); return box; }
  if (nm) box.appendChild(el('div', { class: 'rop-ct__r rop-ct__nm', html: pxI('user', 14) + '<span>' + esc(nm) + '</span>' }));
  if (ph) { var pb = el('button', { class: 'rop-ct__r', type: 'button', 'aria-haspopup': 'menu', title: 'Copy the number, or copy a text', html: v163bIc('phone', 14) + '<span>' + esc(v163bPh(ph)) + '</span>' }); pb.addEventListener('click', function (e) { e.stopPropagation(); v163bMenu(pb); }); box.appendChild(pb); }
  if (em) { var mb = el('button', { class: 'rop-ct__r', type: 'button', title: 'Copy the email', html: v163bIc('mail', 14) + '<span>' + esc(em) + '</span>' }); mb.addEventListener('click', function (e) { e.stopPropagation(); pxCopy(em, 'Copied ' + em); }); box.appendChild(mb); }
  return box;
}

function pxHeader() {
  var head = el('header', { class: 'px-head' });
  var TX = typeof tcxOn === 'function' && tcxOn(RO.id) ? TCX : null;   /* Parsec 14.3: mounted on the Technician page */
  head.appendChild(el('div', { class: 'px-crumb' }, [el('a', { text: TX ? TX.crumb : 'RO list', href: '#', onClick: function (e) { e.preventDefault(); if (TX) { TX.back(); return; } UI.view = 'rolist'; UI.modal = null; tecRender(); } }), el('span', { class: 'sl', text: '/' }), v163bId()]));
  var l = [], at = -1; try { l = TX ? TX.list.map(function (id) { return { id: id }; }) : rlList(); l.forEach(function (r, n) { if (r.id === RO.id) at = n; }); } catch (e) {}
  function go(t) { return function () { if (!t) return; if (TX) { TX.go(t.id); return; } UI.view = 'ros'; UI.selectedRo = t.id; UI.modal = null; tecRender(); }; }
  /* 18 — no stepper arrows here: J / K still go to the next / previous RO */
  try { if (RO.customerName && !RO.shop) head.appendChild(el('div', { class: 'v163b-who' }, [el('span', { class: 'v163b-cu', text: RO.customerName })])); } catch (e) { console.error(e); }   /* the contact moved to the right column (ropContactCard) */
  var T = totals(), nf = allFiles().length, run = S.jobs.some(function (j) { return runningPunchOf(j); });
  var tb = el('b', { text: pxNum(T.b) });
  var tTime = el('button', { class: 'px-total' + (run ? ' is-live' : ''), type: 'button', title: 'Time on this RO · click for the breakdown', 'aria-label': 'Time: ' + pxNum(T.b) + ' of ' + pxNum(T.q) + ' hours quoted. Open breakdown', onClick: function () { pxTotalsModal('time'); } });
  tTime.innerHTML = pxI('clock'); var sp = el('span', {}, [tb, el('em', { text: '/ ' + pxNum(T.q) + ' h' })]); tTime.appendChild(sp);
  if (run) TIMERS.push(function () { tb.textContent = pxNum(totals().b); });
  var acts = el('div', { class: 'px-head__acts' }, [
    el('div', { class: 'px-totals', role: 'group', 'aria-label': 'Totals for this RO' }, [tTime,
      el('button', { class: 'px-total', type: 'button', title: 'Parts on this RO · click for the list', 'aria-label': 'Parts: ' + T.recv + ' of ' + T.lines + ' in hand. Open list', html: pxI('parts') + '<span><b>' + T.recv + '</b><em>/ ' + T.lines + '</em></span>', onClick: function () { pxTotalsModal('parts'); } }),
      pxActBtn(),
      el('button', { class: 'px-total', type: 'button', title: 'Files on this RO · click for the list', 'aria-label': 'Files: ' + nf + '. Open list', html: pxI('clip') + '<span><b>' + nf + '</b></span>', onClick: function () { pxTotalsModal('files'); } })]),
    el('span', { class: 'px-head__sep', 'aria-hidden': 'true' }),
    el('button', { class: 'px-btn px-btn--ghost px-btn--icon px-btn--sm', type: 'button', title: 'Import from ASIST — paste or drop the case, it shows what changes', 'aria-label': 'Import from ASIST', html: pxI('note'), onClick: function () { IMPX.open({ ro: RO }); } }),
    (function () {
      var b = el('button', { class: 'px-btn px-btn--ghost px-btn--icon px-btn--sm', type: 'button', title: 'Options', 'aria-haspopup': 'menu', html: pxI('more') });
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        pxPop(b, el('div', { class: 'px-pop', style: 'width:240px', role: 'menu' }, [
          pxMenuItem('save', 'Save a copy', { run: function () { doExport(); } }),
          pxMenuItem('print', 'Print', { kbd: 'P', run: function () { doPdf(); } }),
          pxSep(),
          pxMenuItem('addJob', 'Add operation', { kbd: 'O', run: pxAddOp }),
          pxMenuItem('note', 'Extract operations…', { run: function () { jcRunOpt('extract'); } }),
          pxMenuItem('newRo', 'Add standard operation…', { run: function () { jcRunOpt('stdop'); } }),
          pxMenuItem('warranty', RO.warranty ? 'Not a warranty RO' : 'Mark as warranty RO', { run: function () { pushUndo('warranty RO'); RO.warranty = !RO.warranty; save(true); render(); tecRender(); } }),
          ].concat(can('ro.del') ? [pxSep(), pxMenuItem('trash', 'Delete RO', { danger: true, run: pxDelete })] : [])), { alignRight: true });
      });
      return b;
    })()]);
  head.appendChild(acts);
  return head;
}
function pxTitle() { var tb = v163bTitle(pxTitle0()); try{ return typeof trkBanner === "function" ? trkBanner(tb, RO) : tb; }catch(e){ console.error(e); return tb; } }
function pxTitle0() {
  var vi = {}; try { vi = vinInfo(RO.vin) || {}; } catch (e) {}
  var opened = RO.dateOpened ? new Date(RO.dateOpened) : null, days = opened ? Math.max(0, Math.floor((Date.now() - opened) / 864e5)) : null;
  var veh = [(function () { try { var tl = (typeof truckLine === 'function' && truckLine(RO)) || trkLabel(RO); return tl === 'this truck' ? '' : tl; } catch (e) { return [vi.year, vi.make, RO.model].filter(Boolean).join(' '); } })(), RO.unitNumber ? 'Unit ' + RO.unitNumber : '', RO.location || ''].filter(Boolean).join(' · ') || RO.engineType || '';
  var st = roStatus(RO) || { status: 'Hold Tech' };
  var live = S.jobs.some(function (j) { return runningPunchOf(j); });
  var mayS = typeof can !== 'function' || can('ro.status');   /* Parsec 14: a pill only where you may change it */
  var sb = pgStEl('ro', roStFor(RO), { of: RO, ofKind: 'ro', menu: mayS, cls: 'px-status--button' + (live ? ' px-live' : ''), title: mayS ? 'Set status (S)' : 'RO status', label: roStShown(RO), sub: st.sub ? '· ' + st.sub.charAt(0) + st.sub.slice(1).toLowerCase() : '' });
  if (mayS) sb.addEventListener('click', function (e) { e.stopPropagation(); pxStatusMenu(sb); });
  var h0 = rtHolder(RO), s0 = rtHeldSince(RO), hn = rtHolderName(h0, RO);
  return el('div', { class: 'px-titleblock' }, [
    el('div', { class: 'px-ro__eyebrow', html: '<span class="px-id">' + esc(RO.roNumber || 'No RO #') + '</span>' + (opened ? '<span>·</span><span>Opened ' + esc(opened.toLocaleDateString([], { month: 'short', day: 'numeric' })) + '</span><span>·</span><span>' + days + ' day' + (days === 1 ? '' : 's') + ' open</span>' : '') }),
    el('h1', { class: 'px-ro__title', html: rifHtml(RO, 'customerName', RO.customerName || '', 'Customer') }),   /* Parsec 14.2 */
    el('div', { class: 'px-ro__sub', html: (function () { try { var tl = (typeof truckLine === 'function' && truckLine(RO)) || trkLabel(RO); return rifVeh(RO, tl === 'this truck' ? '' : tl) + (RO.location ? ' · ' + rifHtml(RO, 'location', RO.location) : '') + v149KeySeg(RO); } catch (e) { return esc(veh); } })() }),
    el('div', { class: 'px-ro__status' }, [sb, el('span', { class: 'px-with', html: (rtNoTech(RO) ? 'No tech yet' : 'with <span class="px-av"' + v149eAvAttr(hn) + '>' + esc(ivInit(hn)) + '</span> ' + esc(hn)) + (s0 ? ' · ' + esc(rtDur(ageSince(s0))) : '') })])]);
}
function pxStage() {
  var f = null; try { f = roForecast(RO); } catch (e) {}
  var M = null; try { M = roStages(RO, f); } catch (e) {}
  if (!M) return null;
  var list = M.list, live = list.filter(function (x) { return x.state !== 'x'; }), ci = -1;
  live.forEach(function (x, n) { if (ci < 0 && (x.state === 'c' || x.state === 'n' || x.state === 'w')) ci = n; });
  var cur = live[ci], wrap = el('div', { class: 'px-stage' });
  wrap.appendChild(el('div', { class: 'px-stage__top', html: (cur ? '<b>' + esc(cur.name) + '</b><span>· stage ' + (ci + 1) + ' of ' + live.length + '</span>' + (cur.sub ? '<span>· ' + esc(String(cur.sub).charAt(0).toLowerCase() + String(cur.sub).slice(1)) + '</span>' : '') : '<b>All stages done</b>')
    + '<span class="px-stage__eta">' + esc(f ? (f.ready ? 'Ready now' : 'Ready about ' + fcWhen(f.likely)) : '') + '</span>' }));
  var track = el('div', { class: 'px-stage__track', style: 'grid-template-columns:repeat(' + list.length + ',1fr)' });
  list.forEach(function (x) {
    var cls = x.state === 'd' ? 'is-done' : x.state === 'x' ? 'is-skip' : x.state === 'w' ? 'is-wait' : (x.state === 'c' || x.state === 'n') ? 'is-now' : '';
    var b = el('button', { class: 'px-stage__seg ' + cls, 'data-pm-stage': x.k, type: 'button', title: x.name + ' — ' + (x.state === 'd' ? 'done' : x.state === 'x' ? 'not needed' : (x.sub || 'to do')) + '. Click for its checklist', html: '<i></i><span>' + esc(x.name) + '</span>' });
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var on = x.checks.filter(function (c) { return c.on; }).length;
      var pop = el('div', { class: 'px-pop px-stagepop' }, [el('h4', { text: x.name }), el('p', { text: (RS_RULE[x.k] || '') + (x.checks.length ? ' · ' + on + ' of ' + x.checks.length : '') })]
        .concat(x.checks.map(function (c) {
          var can = !!c.key && !(c.on && !c.hand);
          return el('label', { class: 'px-check' + (c.on ? ' is-on' : ''), style: can ? '' : 'cursor:default;opacity:.8', title: c.on && !c.hand ? 'Ticked by Parsec from the RO' : '', onClick: function (ev) {
            ev.preventDefault(); ev.stopPropagation(); if (!can) return;
            pushUndo('stage step'); RO.stageTicks = RO.stageTicks || {}; if (RO.stageTicks[c.key]) delete RO.stageTicks[c.key]; else RO.stageTicks[c.key] = 1;
            save(true); pxClosePop(); render(); } }, [el('i'), el('span', { text: c.label })]);
        }))
        .concat([el('div', { style: 'display:flex;gap:8px;margin-top:10px' }, [el('button', { class: 'px-btn px-btn--sm' + (x.state === 'd' ? '' : ' px-btn--primary'), type: 'button', text: x.state === 'd' ? 'Uncheck this stage' : 'Check this stage off', onClick: function (ev) { ev.stopPropagation(); pxClosePop(); stageToggle(RO, x.k); save(true); render(); } })])]));
      pxPop(b, pop);
    });
    track.appendChild(b);
  });
  wrap.appendChild(track);
  return wrap;
}
/* Parsec 12.4 — the RO page's operation clock card is the shared one (b9/v124.js); the page hands it its own start,
   stop, stop reason and quoted-hours edit, with its undo and its toasts */
function ockJob(roId, opId) { if (!RO || RO.id !== roId || !S) return null; return S.jobs.filter(function (j) { return j.id === opId; })[0] || null; }
function ockJc(job) {
  var run = runningPunchOf(job), lock = run ? null : opPartLock(job);
  ockRoot(R);
  var w = el('div');
  w.innerHTML = ockHtml(RO.id, job.id, { pg: 'jc', hr: 'jc', can: true, lock: lock ? lockLine(lock) : '', off: job.declined && !run ? ropDecTip(job) : '', editQ: true });   /* Parsec 14.8: declined — the play button is off, and says why */
  return w.firstElementChild || w;
}
OCK_CB.jc = {
  pre: function () { try { closeStopPop(); } catch (e) {} try { pxClosePop(); } catch (e) {} },
  start: function (roId, opId) { var job = ockJob(roId, opId); if (job && !myRunOf(job)) toggleJobClock(job); },   /* Parsec 12.7: your own clock */
  stop: function (roId, opId) {
    var job = ockJob(roId, opId); if (!job || !myRunOf(job)) return;
    var undoIt = { label: 'UNDO', run: function () { closeStopPop(); restoreSnapshot(); } };
    pushUndo('stop punch');
    stopClock();
    save(true); render();
    toast('Clock stopped — burnt is now ' + fx(job.burnt) + ' h', undoIt);
  },
  reason: function (roId, opId, pid, r) {
    var job = ockJob(roId, opId); pushUndo('stop reason');
    var res = ockSetReason(pid, r);
    save(true); tecRender(); render();
    if (res && res !== true && job) setTimeout(function () { opCompleteGate(job); }, 60);
    else if (res) toast('Stop reason: ' + r);
  },
  editQ: function (cell, roId, opId) {
    var job = ockJob(roId, opId), b = cell && cell.querySelector('b'); if (!job || !b || b.querySelector('input')) return;
    var q = num(job.quoted), inp = el('input', { class: 'px-input ock-qin', value: q > 0 ? q.toFixed(2) : '', inputmode: 'decimal', 'aria-label': 'Quoted hours' });
    b.innerHTML = ''; b.appendChild(inp); inp.focus(); inp.select();
    var done = false;
    function commit(keep) { if (done) return; done = true; var v = num(inp.value); if (keep && v !== q) { pushUndo('quoted hours'); job.quoted = v ? String(v) : ''; save(true); } render(); }
    inp.addEventListener('keydown', function (ev) { ev.stopPropagation(); if (ev.key === 'Enter') { ev.preventDefault(); commit(true); } else if (ev.key === 'Escape') { ev.preventDefault(); commit(false); } });
    inp.addEventListener('blur', function () { commit(true); });
  }
};

function pxTime(job) { return ockJc(job); }   /* Parsec 12.4 */
var PXT = { last: null, cnt: {}, pst: {} };
function pxTabs(job, stash) {
  UI.ivTab = UI.ivTab || {};
  var cur = UI.ivTab[job.id] || 'parts'; if (cur === 'notes') cur = 'time';   /* Parsec 12: the notes live in the Time tab */
  var punches = punchesOf(job), parts = (job.parts || []).filter(function (p) { return p && (p.description || p.partNumber || PT_EDIT[p.id]); });
  var inHand = parts.filter(partInHand).length, files = allFiles().filter(function (x) { return x.f.op === job.id; });
  var notes = (Array.isArray(job.offNotes) ? job.offNotes : []).length + punches.filter(function (p) { return noteEntries(p.notes).length; }).length;
  var defs = [['time', 'Time', (punches.length + notes) || '', 'clock'], ['parts', 'Parts', parts.length ? inHand + '/' + parts.length : '', 'box'], ['files', 'Files', files.length || '', 'clip']];
  /* 17.2: icons and counts, a tinted pill that slides to the open tab, the pane slides in from that side, a count that changes pops once */
  var last = PXT.last && PXT.last.job === job.id ? PXT.last : null, ix = function (k) { for (var i = 0; i < defs.length; i++) if (defs[i][0] === k) return i; return 0; };
  var tabs = el('div', { class: 'px-tabs has-ink rop-otabs', role: 'tablist', 'aria-label': 'Time, parts and files' }), ink = el('span', { class: 'px-tabs__ink' });
  var paneBox = el('div', { class: 'px-panes' });
  tabs.appendChild(ink);
  defs.forEach(function (d) {
    var ck = job.id + ':' + d[0], was = PXT.cnt[ck], pop = was !== undefined && String(was) !== String(d[2]) && d[2] !== ''; PXT.cnt[ck] = d[2];
    tabs.appendChild(el('button', { class: 'px-tab' + (d[0] === cur ? ' is-on' : ''), type: 'button', role: 'tab', 'aria-selected': d[0] === cur ? 'true' : 'false', 'data-tab': d[0], title: d[1], 'aria-label': d[1] + (d[2] !== '' ? ' ' + d[2] : ''),
      html: ri(d[3], 15) + (d[2] !== '' ? '<span class="px-tab__n' + (pop ? ' is-pop' : '') + '"' + (pop ? ' data-key="tc-' + esc(ck) + '-' + esc(String(d[2])) + '"' : '') + '>' + esc(String(d[2])) + '</span>' : ''),
      onClick: function (e) { e.stopPropagation(); UI.ivTab[job.id] = d[0]; render(); } }));
  });
  requestAnimationFrame(function () {
    var on = tabs.querySelector('.px-tab.is-on'); if (!on) return;
    var L = on.offsetLeft, Wd = on.offsetWidth;
    if (last && last.tab !== cur && last.w && !ropCalm()) {
      ink.style.left = last.l + 'px'; ink.style.width = last.w + 'px'; void ink.offsetWidth;
      ink.style.transition = 'left .2s cubic-bezier(.23,1,.32,1), width .2s cubic-bezier(.23,1,.32,1)';
    }
    ink.style.left = L + 'px'; ink.style.width = Wd + 'px';
    PXT.last = { job: job.id, tab: cur, l: L, w: Wd };
  });
  if (last && last.tab !== cur && !ropCalm()) { var dir = ix(cur) > ix(last.tab) ? 1 : -1; paneBox.classList.add(dir > 0 ? 'rop-in-r' : 'rop-in-l'); paneBox.setAttribute('data-key', 'pn-' + job.id + '-' + cur); }
  var pane = el('div', { class: 'px-list' });
  if (cur === 'time') {
    ropTimeline(job, pane);   /* Parsec 12: each punch from start to stop, its notes in between */
  } else if (cur === 'parts') {
    ropPartsHead(job, parts, pane);
    var adding = ROPT.padd === job.id || UI.ivPartAdd === job.id;   /* 17.2: the new part's row is at the top, at once */
    if (adding) ropPartAdd(job, pane, parts.length);
    parts.forEach(function (p) {
      var st = p.status || 'Not Ordered';
      var b = pgStEl('part', st, { of: p, ofKind: 'part', menu: 1, cls: 'sm px-pstat', title: 'Part status and options' });   /* Parsec 14 */
      b.addEventListener('click', function (e) { e.stopPropagation(); pxPartMenu(b, job, p); });
      var eta = ptEtaText(p);
      var row = ropPartRow(job, p, b, eta, parts), pk = p.id || p.partNumber || p.description, was = PXT.pst[pk];
      if (was !== undefined && was !== st && row) { row.classList.add('rop-flash'); row.setAttribute('data-key', 'pf-' + pk + '-' + st); }   /* a status that just changed flashes its row */
      PXT.pst[pk] = st;
      pane.appendChild(row);
    });
    if (!adding) ropPartAdd(job, pane, parts.length);
  } else if (cur === 'notes') {
    var items = [];
    punches.forEach(function (p) { noteEntries(p.notes).forEach(function (n) { items.push({ at: +new Date(p.start), by: p.by, text: n.text, k: p.startReason }); }); });
    (Array.isArray(job.offNotes) ? job.offNotes : []).forEach(function (n) { items.push({ at: +new Date(n.at), by: n.by || '', text: n.text }); });
    items.sort(function (a, b) { return a.at - b.at; });
    var feed = el('div', { class: 'px-feed' }, items.map(function (n) {
      return el('div', { class: 'px-ev' }, [el('span', { class: 'px-av', 'data-tip': v149eAvTip(n.by || RO.assignedTech) || null, text: ivInit(n.by || RO.assignedTech) }), el('span', { html: '<b>' + esc(n.by || RO.assignedTech || 'You') + '</b>' + (n.k ? ' · ' + esc(String(n.k).toLowerCase()) : ' left a note') }), el('time', { text: pxWhen(n.at) }), el('div', { class: 'px-note', text: n.text })]);
    }));
    if (!items.length) feed.appendChild(el('div', { class: 'px-li', html: '<small>No notes yet. What did you find, what did you do?</small>' }));
    pane.appendChild(feed);
    var ta = el('textarea', { class: 'px-input px-input--full', rows: '2', placeholder: 'Add a note — no clock needed (Enter to save)' });
    if (OFF_DRAFTS[job.id]) ta.value = OFF_DRAFTS[job.id];
    ta.addEventListener('input', function () { if (ta.value.trim()) OFF_DRAFTS[job.id] = ta.value; else delete OFF_DRAFTS[job.id]; });
    function saveNote() {
      var txt = autoPunct(String(ta.value || '').replace(/\s*\n\s*/g, ' ').trim()); if (!txt) return;
      pushUndo('note'); delete OFF_DRAFTS[job.id];
      job.offNotes = (Array.isArray(job.offNotes) ? job.offNotes : []).concat([{ id: 'on' + Date.now().toString(36), at: new Date().toISOString(), text: txt, by: punchByName() }]);
      save(true); render(); toast('Note saved', { label: 'UNDO', run: function () { restoreSnapshot(); } });
    }
    ta.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveNote(); } });
    pane.appendChild(el('div', { class: 'px-notecomp' }, [ta, el('button', { class: 'px-btn px-btn--sm', type: 'button', text: 'Save note', onClick: saveNote })]));
  } else {
    files.forEach(function (x) {
      pane.appendChild(el('div', { class: 'px-li px-li--file', style: 'cursor:pointer', onClick: function () { openAttachments(x.f.id); } }, [el('span', { class: 'px-li__t', html: pxI('clip') + '<span>' + esc(x.f.name || 'File') + '</span>' }), el('span', { class: 'px-muted', text: fileKind(x.f) === 'img' ? 'Picture' : fileKind(x.f) === 'pdf' ? 'PDF' : 'File' }), el('span'), el('small', { text: cdTs(x.f.ts).slice(0, 5) })]));
    });
    if (!files.length) pane.appendChild(el('div', { class: 'px-li', html: '<small>No files on this operation yet.</small>' }));
  }
  paneBox.appendChild(pane);
  return el('div', { class: 'px-optabs rop-ocktabs' }, [el('div', { class: 'rop-tabrow' }, [tabs, ropTabActs(job, cur)]), paneBox]);
}
function pxOps(stash) {
  var box = el('div', {});
  var add = ropIb('plus', 'Add operation (O)', function () { pxAddOp(); }, 'rop-addop');
  var oxb = ropIb('scan', 'Extract operations from text or a screenshot', function () { openExtractOps(); }, 'rop-xops');   /* Parsec 14.8 */
  box.appendChild(el('div', { class: 'px-sec' }, [el('h3', { text: 'Operations' }), el('span', { class: 'n', text: String(S.jobs.length) }), add, oxb]));
  var docStrip = libDocStrip(); if (docStrip) box.appendChild(docStrip);   /* Parsec 17.1: every document on this RO, by operation */
  var ops = el('div', { class: 'px-ops' }), cur = S.ui.card;
  S.jobs.forEach(function (j, i) {
    var st = opStatus(j), nm = typeof st === 'string' ? st : st.status, c = jobCalc(j), live = !!runningPunchOf(j), t = 'OP';
    try { t = opJobType(j); } catch (e) {}
    var rp = (j.parts || []).filter(function (p) { return p && (p.description || p.partNumber); });
    var notOrd = rp.filter(function (p) { return (p.status || 'Not Ordered') === 'Not Ordered'; }).length, out = rp.filter(function (p) { return !partInHand(p); }).length;
    
    var on = j.id === cur;
    var who = (punchesOf(j).slice(-1)[0] || {}).by || RO.assignedTech || '';
    ops.appendChild(ropOpRow(j, i, on, stash));   /* Parsec 12.3 (b9/rop1.js) */
    if (on) ops.appendChild(ropOpBody(j, stash));
  });
  if (!S.jobs.length) ops.appendChild(el('div', { class: 'px-li', html: '<small>No operations yet. Add the first one.</small>' }));
  box.appendChild(ops);
  return box;
}
/* Parsec 11.3: Activity — the RO's notes and changes, in a pop-up from the header */
var PXA = { f: 'all' };
function pxActEvents() {
  var ev = [];
  (RO.history || []).forEach(function (h) { ev.push({ at: +h.at || +new Date(h.at), h: h }); });
  S.jobs.forEach(function (j, i) { (Array.isArray(j.offNotes) ? j.offNotes : []).forEach(function (n) { ev.push({ at: +new Date(n.at), note: n, op: i + 1 }); }); });
  (Array.isArray(RO.extNotes) ? RO.extNotes : []).forEach(function (n) { ev.push({ at: +new Date(n.at), note: n, ext: 1 }); });   /* Parsec 12: ASIST's notes */
  ev.sort(function (a, b) { return a.at - b.at; });
  return ev;
}
function pxActBtn() {
  var ev = pxActEvents(), nn = ev.filter(function (x) { return x.note; }).length;
  return el('button', { class: 'px-total', type: 'button', title: 'Activity on this RO · notes and changes', 'aria-label': 'Activity: ' + nn + ' note' + (nn === 1 ? '' : 's') + ', ' + ev.length + ' entries. Open', html: pxI('history') + '<span><b>' + ev.length + '</b></span>', onClick: function () { pxActivityModal(); } });
}
function pxActivityModal() {
  var feed = el('div', { class: 'px-feed px-actm__feed', role: 'log', 'aria-live': 'polite' });
  var seg = pxSeg([['all', 'All'], ['notes', 'Notes'], ['changes', 'Changes']], PXA.f, function (v) { PXA.f = v; fill(true); });
  var sel = el('select', { class: 'px-actm__op', 'aria-label': 'The operation the note goes on' });
  S.jobs.forEach(function (j, i) { sel.appendChild(el('option', { value: j.id, text: 'Op ' + (i + 1) + ' · ' + (j.complaint || 'Operation') })); });
  var cur = S.jobs.filter(function (x) { return x.id === S.ui.card; })[0] || S.jobs[0]; if (cur) sel.value = cur.id;
  var inp = el('input', { class: 'px-composer__in', placeholder: S.jobs.length ? 'Leave a note… Enter saves it' : 'Add an operation first', 'aria-label': 'Leave a note' });
  var cnt = el('span', { class: 'px-actm__n' });
  function noteEv(x) { return el('div', { class: 'px-ev' }, [el('span', { class: 'px-av', 'data-tip': x.ext && !x.note.by ? 'ASIST · from the case' : v149eAvTip(x.note.by || RO.assignedTech) || null, text: x.ext && !x.note.by ? 'AS' : ivInit(x.note.by || RO.assignedTech) }), el('span', { html: '<b>' + esc(x.note.by || (x.ext ? 'ASIST' : RO.assignedTech) || 'You') + '</b> ' + (x.ext ? (x.note.by ? 'wrote in ASIST' : 'system note') : 'left a note on operation ' + x.op) }), el('time', { text: pxWhen(x.at) }), el('div', { class: 'px-note', text: x.note.text })]); }
  function fill(top) {
    var all = pxActEvents(), ev = all.filter(function (x) { return PXA.f === 'all' || (PXA.f === 'notes' ? !!x.note : !x.note); });
    feed.innerHTML = '';
    ev.slice(-300).forEach(function (x) { feed.appendChild(x.note ? noteEv(x) : pxEvent(x.h)); });
    if (!ev.length) feed.appendChild(el('div', { class: 'px-ev', html: '<span class="px-ev__dot">' + pxI('history', 14) + '</span><span>' + (PXA.f === 'notes' ? 'No notes on this RO yet.' : PXA.f === 'changes' ? 'No changes on this RO yet.' : 'Nothing has happened on this RO yet.') + '</span><time></time>' }));
    var nn = all.filter(function (x) { return x.note; }).length;
    cnt.textContent = nn + ' note' + (nn === 1 ? '' : 's') + ' · ' + (all.length - nn) + ' change' + (all.length - nn === 1 ? '' : 's');
    requestAnimationFrame(function () { feed.scrollTop = feed.scrollHeight; });
  }
  function send() {
    var txt = autoPunct(String(inp.value || '').trim()); if (!txt) return;
    var j = S.jobs.filter(function (x) { return x.id === sel.value; })[0] || S.jobs[0];
    if (!j) { toast('Add an operation first'); return; }
    pushUndo('note'); j.offNotes = (Array.isArray(j.offNotes) ? j.offNotes : []).concat([{ id: 'on' + Date.now().toString(36), at: new Date().toISOString(), text: txt, by: punchByName() || (typeof pxMeName === 'function' ? pxMeName() : '') }]);
    save(true); render(); inp.value = ''; if (PXA.f === 'changes') { PXA.f = 'all'; Array.prototype.forEach.call(seg.children, function (c, k) { c.classList.toggle('is-on', k === 0); }); } fill();
    toast('Note saved on operation ' + (S.jobs.indexOf(j) + 1), { label: 'UNDO', run: function () { restoreSnapshot(); } });
    try { inp.focus(); } catch (e) {}
  }
  inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); send(); } });
  var comp = el('div', { class: 'px-composer px-actm__comp' }, [el('span', { html: pxI('chat') }), inp, S.jobs.length > 1 ? sel : null, el('button', { class: 'px-btn px-btn--sm px-btn--primary', type: 'button', text: 'Save note', onClick: send })]);
  pxModal({ title: 'Activity · ' + (RO.roNumber || 'RO'), sub: (RO.customerName || '') + ' · notes and changes, oldest first', size: 'md', hint: '<span class="px-kbd">↵</span>saves the note · <span class="px-kbd">esc</span>closes',
    body: [el('div', { class: 'px-actm__bar' }, [seg, cnt]), feed, comp] });
  fill();
  setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
}
