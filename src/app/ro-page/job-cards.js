/* Parsec · ro-page · job-cards.js
   The operation cards: the efficiency bar, the start / stop reason questions, the complete gate, the drag order, glide between renders.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   barSplit effBar cardOffsets glideCards closeStopPop askReason askStopReason opCompleteGate askStartReason jobLook jobStatusLabel jobStatusChip … (21 functions, 6 constants)
   state      punches ros
   uses       access/ automations/ clock/ data/ kit/ pages/inventory/ pages/warranty/ ro/ shell/ state/
   at load    on document pointerdown · a timer
*/
/* ============================ render: job cards ============================ */

/* The bar is the quote. Burnt time fills it left to right; once it passes the quote,
   the time over fills back in from the right end, on the same bar (full red = 2x the quote). */
function barSplit(q, b) {
  var ratio = b / q;
  return { ratio: ratio, g: Math.min(1, ratio) * 100, ov: Math.max(0, Math.min(1, ratio - 1)) * 100 };
}
function effBar(c, live) {
  var wrap = el('span', { class: 'bar' + (live ? ' live' : '') });
  wrap.appendChild(el('span', { class: 'track' }));
  var fill = el('span', { class: 'fill', style: 'width:0%' });
  var over = el('span', { class: 'over', style: 'width:0%;display:none' });
  wrap.appendChild(fill);
  wrap.appendChild(over);
  wrap.updateBar = function (c2, live2) {
    wrap.classList.toggle('live', !!live2);
    if (c2.q > 0 && c2.b > 0) {
      var sp = barSplit(c2.q, c2.b);
      fill.style.width = sp.g.toFixed(2) + '%';
      over.style.width = sp.ov.toFixed(2) + '%';
      over.style.background = c2.sev;
      over.style.display = sp.ov > 0.05 ? '' : 'none';
      wrap.title = Math.round(sp.ratio * 100) + '% of the quote used' + (sp.ov > 0.05 ? ' \u2014 the coloured end is time over the quote' : '');
    } else {
      fill.style.width = '0%';
      over.style.width = '0%';
      over.style.display = 'none';
      wrap.title = '';
    }
  };
  wrap.updateBar(c, live);
  return wrap;
}

var TIMERS = [];
var tickCount = 0;
var DRAG = { id: null };

/* FLIP reorder: remember where the cards were, then slide them to where they now are */
function cardOffsets() {
  var map = {};
  Array.prototype.forEach.call(R.querySelectorAll('.card[data-job]'), function (n) {
    map[n.dataset.job] = n.getBoundingClientRect().top;
  });
  return map;
}
function glideCards(before) {
  Array.prototype.forEach.call(R.querySelectorAll('.card[data-job]'), function (n) {
    var was = before[n.dataset.job];
    if (was === undefined) return;
    var delta = was - n.getBoundingClientRect().top;
    if (!delta) return;
    n.style.transform = 'translateY(' + delta + 'px)';
    requestAnimationFrame(function () {
      n.classList.add('settling');
      n.style.transform = '';
      setTimeout(function () { n.classList.remove('settling'); }, 300);
    });
  });
}


/* ---- one tap to say why the clock stopped ---- */
var stopPop = null;
function closeStopPop() { if (stopPop && stopPop.parentNode) stopPop.remove(); stopPop = null; }
/* One pop-up for both ends of a punch: the clock starts/stops at once, the reason is one tap. */
function askReason(p, job, o) {
  closeStopPop();
  if (!p) return;
  requestAnimationFrame(function () {
    var i = S.jobs.indexOf(job), card = cardEl(i);
    var anchor = R.querySelector('.ock[data-op="' + job.id + '"] .ock-side') || (card && card.querySelector('.timer'));
    var pop = el('div', { class: 'stopPop', role: 'dialog', 'aria-label': o.title,
      onClick: function (e) { e.stopPropagation(); } });
    pop.appendChild(el('div', { class: 'stopPopHead' }, [
      el('span', { text: o.title }),
      el('button', { class: 'xBtn', type: 'button', title: o.skipTitle || 'Skip', 'aria-label': o.skipTitle || 'Skip', onClick: closeStopPop }, [svg(ICON.x, 10, 1.8)])
    ]));
    if (o.note) pop.appendChild(el('div', { class: 'stopNote', text: o.note }));
    o.groups.forEach(function (g) {
      pop.appendChild(el('div', { class: 'stopLbl', text: g[0] }));
      pop.appendChild(el('div', { class: 'stopChips' }, g[1].map(function (r) {
        var on = r === o.current;
        return el('button', { class: 'stopChip ' + g[2] + (on ? ' sel' : ''), type: 'button', text: r,
          'aria-pressed': on ? 'true' : 'false', onClick: function () {
            o.pick(r); save(true); closeStopPop(); tecRender(); render();
            toast(o.done + r);
          } });
      })));
    });
    R.appendChild(pop);
    stopPop = pop;
    var first = pop.querySelector('.stopChip.sel') || pop.querySelector('.stopChip');
    var rc = anchor ? zr(anchor.getBoundingClientRect()) : { left: window.innerWidth / ZF() / 2, bottom: 120, right: window.innerWidth / ZF() / 2, top: 120 };
    var w = pop.offsetWidth, h = pop.offsetHeight, zvw = window.innerWidth / ZF(), zvh = window.innerHeight / ZF();
    var left = Math.max(10, Math.min(zvw - w - 10, rc.right - w));
    var top = rc.bottom + 8; if (top + h > zvh - 10) top = Math.max(10, rc.top - h - 8);
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
  });
}
function askStopReason(p, job) {
  askReason(p, job, {
    title: 'Why did it stop?', done: 'Stop reason: ', current: p && p.stopReason,
    groups: (p && isShopPunch(p)) ? [['Shop time', ['Done', 'Switched job'], 'job']]
      : [['Where the operation stands', STOP_REASONS_BREAK.concat(STOP_REASONS_EXPLICIT), 'job'], ['Switching work', ['Switched job', 'Pulled to another truck'], 'sw']],
    pick: function (r) {
      if (/^Complete/.test(r) && job && v141GapsAsk(job).length) {   /* the clock stops, the job doesn't close */
        p.stopReason = 'Hold Tech';
        setTimeout(function () { opCompleteGate(job); }, 60);
        return;
      }
      p.stopReason = r;
    }
  });
}
/* true (and says why, and opens the gap) when this operation can't be completed yet */
function opCompleteGate(job) {
  var g = v141GapsAsk(job);
  if (!g.length) return false;
  return true;   /* Parsec 14.1: the question asks (Finish anyway / Mark installed / Write the story) */
}
function askStartReason(p, job) {
  askReason(p, job, {
    title: 'What are you starting?', done: 'Start reason: ', current: p && p.startReason, skipTitle: 'Keep ' + (p && p.startReason),
    note: 'Clock is running as “' + (p && p.startReason) + '” — tap to change.',
    groups: [['Start reason', START_REASONS, 'job']],
    pick: function (r) {
      if (r === 'Repairing' && opPartLock(job, 'Repairing')) {      /* not while a part is out */
        STATE.punches = STATE.punches.filter(function (x) { return x !== p; });
        setTimeout(function () { toast('Can\u2019t repair yet \u2014 ' + lockLine(opPartLock(job, 'Repairing')) + '. Clock not started.'); focusParts(job); }, 60);
        return;
      }
      p.startReason = r;
    }
  });
}
document.addEventListener('pointerdown', function (e) {
  if (!stopPop) return;
  var path = e.composedPath ? e.composedPath() : [];
  if (path.indexOf(stopPop) < 0) closeStopPop();
}, true);

/* A job is either done or it is not \u2014 road test versus released is an RO-level call,
   so the card offers one Complete and the RO status keeps both. 'Complete \u2013 Road test'
   is the value stored, so existing data and the gate logic are unaffected; only the
   label on the job card changes. */
var JOB_STATUS_NAMES = ['Hold Tech', 'Waiting \u2013 Parts', 'Waiting \u2013 Sublet', 'Waiting \u2013 Foreman', 'Waiting \u2013 Tech Support', 'Waiting \u2013 Customer', 'Waiting \u2013 Approval', 'Complete'];
function jobLook(name) {
  var hit = STATUSES.filter(function (x) { return x.name === name; })[0]; if (hit) return hit;
  var s = JC_STATUS_LOOK[name];
  return s ? { key: String(name).toUpperCase(), name: name, hint: s.hint, bg: s.bg, fg: s.fg, dot: s.dot, ink: s.ink, t: s.t } : STATUSES[0];
}
function jobStatusLabel(n) { return /^Complete/.test(n) ? 'Complete' : n; }
function jobStatusChip(job, idx) {
  var st = opStatus(job), name = typeof st === 'string' ? st : st.status;
  var defs = JOB_STATUS_NAMES.map(function (n) {
    var d = STATUSES.filter(function (x) { return x.name === n; })[0] || (JC_STATUS_LOOK[n] ? jobLook(n) : null);
    if (!d) return null;
    var c = {}; for (var k in d) c[k] = d[k];
    c.label = jobStatusLabel(d.name);            /* 'Complete', not 'Complete \u2013 Road test' */
    return c;
  }).filter(Boolean);
  var cur = defs.findIndex(function (d) { return d.name === name; });
  if (cur < 0 && /^Complete/.test(name)) {                /* job saved under the old two-Complete scheme */
    cur = defs.findIndex(function (d) { return /^Complete/.test(d.name); });
  }
  var look = jobLook(name);
  var wrap = el('div', { class: 'chipwrap jobSt' });
  var menu = dropdown(defs, cur, function (i) {
    var nm = defs[i].name;
    if (/^Complete/.test(nm) && opCompleteGate(job)) return;
    pushUndo('operation status');
    var rp = myRunOf(job);
    if (rp) { stopClock(); rp.stopReason = nm; }
    job.jobStatus = { status: nm, setAt: nowIso() };
    save(true); render(); tecRender();
    toast('Operation set to ' + jobStatusLabel(nm) + (rp ? ' \u2014 clock stopped' : ''), { label: 'UNDO', run: function () { restoreSnapshot(); } });
  }, 'jobst' + idx);
  var b = el('button', { class: 'jobStBtn', type: 'button', 'aria-haspopup': 'menu', title: 'Operation status: ' + jobStatusLabel(name) + (typeof st !== 'string' && st.sub ? ' \u00b7 ' + st.sub : '') + ' \u2014 click to change',
    style: '--pd:' + (look.dot || look.fg) + ';--pb:' + (look.ink || look.fg) + ';--pf:' + (look.ink || look.fg),
    onClick: function (e) { e.stopPropagation(); var was = menu.classList.contains('open'); closeMenus(); if (!was) { menu.classList.add('open'); placeMenuSettled(menu, b); openMenu = 'jobst' + idx; } } },
    [stIcon(look, 'jobStDot', name), el('span', { class: 'jobStTxt', text: jobStatusLabel(name) })]);
  wrap.appendChild(b); wrap.appendChild(menu);
  return wrap;
}
/* open the operation's parts section and draw the eye to it */
function flashParts(job) {
  var c = R && R.querySelector('.cardCol > .card[data-job="' + job.id + '"] .partsSec');
  if (!c) return;
  c.scrollIntoView({ block: 'center', behavior: 'smooth' });
  c.classList.remove('ptFocus'); void c.offsetWidth; c.classList.add('ptFocus');
  setTimeout(function () { c.classList.remove('ptFocus'); }, 2200);
}
function focusParts(job) {
  job.partsCollapsed = false; S.ui.card = job.id;
  try { openCard(RO.id, job.id); } catch (e) {}
  save(); render();
  requestAnimationFrame(function () { flashParts(job); });
  setTimeout(function () { flashParts(job); }, 420);       /* again after the automations redraw */
}
function toggleJobClock(job) {
  var undoIt = { label: 'UNDO', run: function () { closeStopPop(); restoreSnapshot(); } };
  if (myRunOf(job)) {
    pushUndo('stop punch');
    var stopped = stopClock();
    save(true); render();
    toast('Clock stopped \u2014 burnt is now ' + fx(job.burnt) + ' h', undoIt);
    askStopReason(stopped, job);
  } else {
    if (job.declined) { toast(ropDecTip(job) + '.'); return; }   /* Parsec 14.8 */
    if (typeof tcxBlocked === 'function') { var tcb = tcxBlocked(RO.id, job.id); if (tcb) { toast(tcb); return; } }   /* Parsec 14.3 */
    if (!permOk('t.own') || !permReopenOk(RO)) return;   /* Parsec 13 */
    var lk = opPartLock(job);
    if (lk) { toast('Can\u2019t start repairing \u2014 ' + lockLine(lk) + '. Get the part in hand first.'); focusParts(job); return; }
    if (typeof v162AskStart === 'function' && v162AskStart(RO.id, job.id, null, function () { toggleJobClock(job); })) return;   /* Parsec 16.2 */
    pushUndo('start punch');
    var was = stopClock();
    if (was && !was.stopReason) was.stopReason = was.roId === RO.id ? 'Switched job' : 'Pulled to another truck';
    var reo = typeof opReopenMark === 'function' ? opReopenMark(job, RO.id, 'start') : null;   /* Parsec 12.8 */
    startClock(job);
    S.ui.card = job.id;
    save(true); render();
    toast(reo ? reo + ' reopened \u2014 clock running' : was ? 'Clock moved to this operation' : 'Clock running', undoIt);
    askStartReason(STATE.punches[STATE.punches.length - 1], job);
  }
}
function timerBtn(job) {
  var on = !!runStartOf(job), lk = on ? null : opPartLock(job);
  var b = el('button', {
    class: 'timer' + (on ? ' on' : '') + (lk ? ' locked' : '') + (!on && job.declined ? ' is-dec' : ''), type: 'button', 'aria-disabled': lk || (!on && job.declined) ? 'true' : null,
    title: on ? 'Stop the clock and add the time to Burnt' : job.declined ? ropDecTip(job) : lk ? 'Clock locked \u2014 ' + lockLine(lk) : 'Start the clock on this operation',
    onClick: function (e) { e.stopPropagation(); toggleJobClock(job); }
  });
  b.innerHTML = on
    ? '<svg width="10" height="10" viewBox="0 0 12 12"><rect x="2.4" y="2.4" width="7.2" height="7.2" rx="1.2" fill="currentColor"/></svg>'
    : lk ? LOCK_SVG : I3H('clock', 15, 15);
  return b;
}

function tickTimers() {
  if (!TIMERS.length || !HOST || !HOST.isConnected) return;
  TIMERS.forEach(function (fn) { try { fn(); } catch (e) {} });
  tickCount++;
}
setInterval(tickTimers, 1000);

var PART_STATUS = [
  { key: 'Not Ordered', bg: '#E6EBF1', fg: '#414C5A' },
  { key: 'Ordered',     bg: '#E7F0FC', fg: '#1757A5' },
  { key: 'Backordered', bg: '#FBE4E1', fg: '#D0271D' },
  { key: 'Received',    bg: '#E4F0E9', fg: '#0E8A5F' },
  { key: 'Installed',   bg: '#CEE0F7', fg: '#113E75' }
];

/* pick parts from the Parts page (the same inventory list) and put them on this operation */
/* has this job been done before? A kit made from the same job (best), else the parts a
   past RO used on the same complaint. Only parts not already on this job are offered. */
function opMatchScore(a, b) {
  var A = visitWords(a), B = visitWords(b), ka = Object.keys(A), kb = Object.keys(B);
  if (!ka.length || !kb.length) return a && invDescKey(a) === invDescKey(b) ? 1 : 0;
  return ka.filter(function (k) { return B[k]; }).length / Math.max(ka.length, kb.length);
}
function partSuggestFor(job) {
  if (!job || job.declined || RO.shop || !(job.complaint || '').trim()) return null;
  var keyOf = function (pn, d) { return invPnKey(pn) || ('d:' + invDescKey(d)); };
  var onJob = {}; (job.parts || []).forEach(function (p) { onJob[keyOf(p.partNumber, p.description)] = 1; });
  var engN = engineNorm(RO.engineType || ''), best = null;
  invList().forEach(function (it) {
    if (!it.kit || !(it.children || []).length) return;
    var sc = opMatchScore(it.desc, job.complaint); if (sc < 0.6) return;
    var en = engineNorm(it.engine || ''); if (engN && en) sc += en === engN ? 0.1 : -0.3;
    var miss = it.children.filter(function (c) { return (c.desc || c.pn) && !onJob[keyOf(c.pn, c.desc)]; });
    if (!miss.length || job.partSgOff === it.id) return;
    if (!best || sc > best.sc) best = { sc: sc, id: it.id, kit: it, name: it.desc, fits: !!(engN && en === engN), miss: miss.map(function (c) { return { desc: c.desc, pn: c.pn, qty: c.qty || '1', price: c.price || '' }; }) };
  });
  if (best) return best;
  (STATE.ros || []).forEach(function (r) {
    if (r.id === RO.id) return;
    (r.operations || []).forEach(function (op) {
      var rp = opRealParts(op); if (op.declined || !rp.length || job.partSgOff === op.id) return;
      var sc = opMatchScore(op.complaint, job.complaint); if (sc < 0.6) return;
      var miss = rp.filter(function (p) { return !onJob[keyOf(p.partNumber, p.description)]; });
      if (!miss.length) return;
      if (engN && engineNorm(r.engineType || '') === engN) sc += 0.1;
      if (!best || sc > best.sc) best = { sc: sc, id: op.id, ro: r, name: op.complaint, fits: !!(engN && engineNorm(r.engineType || '') === engN), miss: miss.map(function (p) { return { desc: p.description, pn: p.partNumber, qty: p.qty || '1', price: p.price || '' }; }) };
    });
  });
  return best;
}
function partSuggestBox(job, sg) {
  var lines = sg.miss.slice(0, 4).map(function (c) { return (c.desc || c.pn) + (String(c.qty) !== '1' ? ' \u00d7' + c.qty : ''); }).join(' \u00b7 ') + (sg.miss.length > 4 ? ' \u00b7 +' + (sg.miss.length - 4) + ' more' : '');
  var add = el('button', { class: 'mbtn primary ptSgAdd', type: 'button', text: sg.kit ? 'Add kit' : 'Add ' + sg.miss.length + ' part' + (sg.miss.length === 1 ? '' : 's'),
    onClick: function (e) {
      e.stopPropagation(); pushUndo('add suggested parts');
      sg.miss.forEach(function (c) { var np = blankPart(); np.description = c.desc || ''; np.partNumber = c.pn || ''; np.qty = String(c.qty || '1'); if (priceOf(c.price)) np.price = priceOf(c.price); job.parts.push(np); invAddFromPart(np, RO.roNumber); });
      save(true); render();
      toast(sg.miss.length + ' part' + (sg.miss.length === 1 ? '' : 's') + ' added from ' + (sg.kit ? 'the kit' : 'RO ' + (sg.ro.roNumber || '')), { label: 'UNDO', run: function () { restoreSnapshot(); } });
    } });
  return el('div', { class: 'ptSg', role: 'note' }, [
    el('span', { class: 'ptSgIc', html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9"/></svg>' }),
    el('div', { class: 'ptSgTx' }, [
      el('b', { text: sg.kit ? 'Recommended kit \u2014 this operation was done before' : 'Done before on RO ' + (sg.ro.roNumber || '') }),
      el('span', { class: 'ptSgName', text: sg.name + (sg.fits ? ' \u00b7 fits ' + RO.engineType : '') }),
      el('small', { text: lines })
    ]),
    add,
    el('button', { class: 'mbtn ptSgPick', type: 'button', text: 'Pick', title: 'Choose parts from the inventory', onClick: function (e) { e.stopPropagation(); openInvPicker(job); } }),
    el('button', { class: 'ptSgX', type: 'button', 'aria-label': 'Hide this suggestion', title: 'Hide this suggestion', html: '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      onClick: function (e) { e.stopPropagation(); job.partSgOff = sg.id; save(); render(); } })
  ]);
}
function openInvPicker(job) {
  invSyncAll();
  var q = '', added = 0;
  var eng = String((RO && RO.engineType) || '').toLowerCase();
  var engCode = eng.replace(/^(volvo|mack|cummins|detroit|paccar)\s+/, '');
  var search = el('input', { type: 'search', class: 'ipkSearch', placeholder: 'Search description, part #, engine, model\u2026', 'aria-label': 'Search the parts inventory' });
  var list = el('div', { class: 'ipkList' });
  var note = el('div', { class: 'ipkNote' });
  var engN = engineNorm(eng);
  function fits(it) { var e = String(it.engine || '').toLowerCase(); if (!eng || !e) return false; var n2 = engineNorm(e); return n2 && engN ? n2 === engN : (e.indexOf(engCode) > -1 || eng.indexOf(e) > -1); }
  function same(it) { return !!(it.kit && (job.complaint || '').trim() && (invDescKey(it.desc) === invDescKey(job.complaint) || similarComplaint(it.desc, job.complaint))); }
  function hay(it) { return [it.desc, it.pn, it.engine, it.year, it.model].concat((it.children || []).map(function (c) { return c.desc + ' ' + c.pn; })).join(' ').toLowerCase(); }
  function onJob(pn) { var k = invPnKey(pn); return !!k && job.parts.some(function (x) { return invPnKey(x.partNumber) === k; }); }
  function addLine(desc, pn, qty, price) { var np = blankPart(); np.description = desc || ''; np.partNumber = pn || ''; np.qty = String(qty || '1'); if (priceOf(price)) np.price = priceOf(price); job.parts.push(np); added++; }
  function paint() {
    list.innerHTML = '';
    var qq = q.toLowerCase().trim();
    var rows = invList().filter(function (it) { return !qq || hay(it).indexOf(qq) > -1; });
    rows = rows.map(function (it, i) { return { it: it, i: i, f: fits(it), m: same(it) }; }).sort(function (a, b) { return ((b.m * 2 + b.f) - (a.m * 2 + a.f)) || (a.i - b.i); });
    if (!rows.length) list.appendChild(el('div', { class: 'ipkEmpty', text: invList().length ? 'Nothing on the Parts page matches \u201c' + q + '\u201d.' : 'The Parts page is empty. Every part you add to an operation lands there automatically.' }));
    rows.slice(0, 150).forEach(function (r) {
      var it = r.it;
      var qty = el('input', { class: 'ipkQty mono', type: 'number', min: '1', step: '1', value: String(parseFloat(it.qty) || 1), 'aria-label': 'Quantity for ' + (it.desc || it.pn || 'part') });
      var already = !it.kit && onJob(it.pn);
      var btn = el('button', { class: 'mbtn ipkAdd' + (already ? '' : ' primary'), type: 'button', text: already ? 'Add again' : it.kit ? 'Add kit' : 'Add' });
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var n = Math.max(1, parseFloat(qty.value) || 1);
        pushUndo('add part from inventory');
        if (it.kit) (it.children || []).forEach(function (c) { addLine(c.desc, c.pn, (parseFloat(c.qty) || 1) * n, c.price); });
        else addLine(it.desc, it.pn, n, it.price);
        save(true);
        btn.textContent = 'Added \u2713'; btn.classList.remove('primary'); btn.classList.add('done');
        note.textContent = added + ' part line' + (added === 1 ? '' : 's') + ' added to ' + (job.complaint || 'this operation') + '.';
      });
      var meta = [it.engine, it.year, it.model].filter(Boolean).join(' \u00b7 ');
      list.appendChild(el('div', { class: 'ipkRow' + (it.kit ? ' kit' : '') }, [
        el('div', { class: 'ipkMain' }, [
          el('div', { class: 'ipkDesc' }, [it.kit ? el('span', { class: 'ipkKit', text: 'KIT \u00b7 ' + (it.children || []).length }) : null, el('span', { text: it.desc || '(no description)' }), r.m ? el('span', { class: 'ipkFit ipkSame', text: 'same operation' }) : null, r.f ? el('span', { class: 'ipkFit', text: 'fits ' + RO.engineType }) : null]),
          el('div', { class: 'ipkSub mono', text: (it.pn || 'no part #') + (meta ? '  \u00b7  ' + meta : '') + (already ? '  \u00b7  on this operation' : '') })
        ]),
        qty, btn
      ]));
    });
    if (rows.length > 150) list.appendChild(el('div', { class: 'ipkEmpty', text: (rows.length - 150) + ' more \u2014 narrow the search.' }));
  }
  search.addEventListener('input', function () { q = search.value; paint(); });
  modal({ title: 'Add from inventory \u2014 ' + (job.complaint || 'this operation'), body: [el('div', { class: 'ipkWrap' }, [search, list, note])],
    actions: [{ label: 'Open Parts page', run: function () { UI.view = 'parts'; persistUI(); tecRender(); } }, { label: 'Done', kind: 'primary' }] });
  var mw = R.getElementById('modalWrap');
  var mbx = mw && mw.querySelector('.modalBox'); if (mbx) mbx.classList.add('xpBox', 'ipkBox');
  /* redraw the card once the picker closes, so the new parts show */
  if (mw && typeof MutationObserver !== 'undefined') {
    var mo = new MutationObserver(function () { if (!mw.isConnected) { mo.disconnect(); if (added) render(); } });
    mo.observe(R, { childList: true });
  }
  paint();
  setTimeout(function () { search.focus(); }, 30);
}
