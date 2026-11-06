/* Parsec · ro-page · time-tab.js
   An open operation's Time tab: every punch from its start to its stop, typed times, stops, the day bar; Parsec 15's notes that are not on a punch.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ropStops ropRc ropHM ropYMD ropAt ropShortDay ropIb ropDayBar ropTm ropSetTime ropNowTm ropStopAsk … (26 functions, 2 constants)
   uses       access/ automations/ clock/ data/ kit/ pages/ pages/timelog/ pages/warranty/ ro/ shell/ state/
*/
/* ---------- an open operation: the Time tab (Parsec 12.3) ----------
   Each punch from start to stop with its notes in between. The line and the start dot wear the start reason's color, the stop dot the
   stop reason's (one color per reason, everywhere — b9/v123.css). A slim day bar sits on top. Everything is edited right here: click a time
   or a reason to change it, trash on hover deletes (Undo in the toast), a + between punches or the tab's clock icon adds a time entry. */
var ROPT = { ed: null, add: null, note: null, padd: null, why: null, pnedit: null };
var ROPCC = { sug: null, live: null, t: 0 };   /* 17.3: Cause and Correction — a ✦ suggestion, the note being typed (ro-page/cause-correction.js) */
function ropStops() { var L = []; try { L = STOP_REASONS_BREAK.concat(STOP_REASONS_EXPLICIT); } catch (e) {} return L.concat(['Switched job', 'Pulled to another truck', 'Declined']); }
function ropRc(r) { try { return r ? reasonVar(r) : 'var(--ink-4)'; } catch (e) { return 'var(--ink-4)'; } }
function ropHM(ms) { var d = new Date(ms); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
function ropYMD(ms) { var d = new Date(ms); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function ropAt(baseMs, hhmm) { var m = /^(\d{1,2}):(\d{2})/.exec(hhmm || ''); if (!m) return null; var d = new Date(baseMs); d.setHours(+m[1], +m[2], 0, 0); return d.getTime(); }
function ropShortDay(ms) { var d = new Date(ms); return d.toDateString() === new Date().toDateString() ? 'Today' : d.toLocaleDateString([], { month: 'short', day: 'numeric' }); }
/* an icon button: the name shows when you point at it */
function ropIb(icon, label, fn, cls) {
  var b = el('button', { class: 'rop-ib' + (cls ? ' ' + cls : ''), type: 'button', 'aria-label': label, title: label, html: ri(icon, 15) });
  b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); fn(e, b); });
  return b;
}
function ropDayBar(ps) {
  if (!ps.length) return null;
  var bar = el('div', { class: 'rop-dbt', role: 'img' }), last = null, days = 0, tot = 0, lp = ps[ps.length - 1];
  ps.forEach(function (p) {
    var a = +new Date(p.start), live = !p.stop, b = live ? Date.now() : +new Date(p.stop), k = new Date(a).toDateString();
    if (last && last !== k) bar.appendChild(el('span', { class: 'rop-dgap' }));
    if (last !== k) days++;
    last = k; tot += Math.max(0, b - a);
    var seg = el('span', { class: 'rop-dsg' + (live ? ' is-live' : ''), style: 'flex:' + Math.max(1, Math.round((b - a) / 60000)) + ' 1 0;--c:' + ropRc(p.startReason),
      title: (p.startReason || '—') + ' → ' + (live ? 'on the clock' : (p.stopReason || '—')) + ' · ' + hmText(b - a), text: hmText(b - a) });
    if (live) TIMERS.push(function () { var d = Date.now() - a; seg.textContent = hmText(d); seg.style.flexGrow = Math.max(1, Math.round(d / 60000)); });
    bar.appendChild(seg);
  });
  var f0 = +new Date(ps[0].start), endT = lp.stop ? ropClk(lp.stop) : 'now';
  bar.setAttribute('aria-label', ps.length + ' punch' + (ps.length === 1 ? '' : 'es') + ', ' + hmText(tot) + ' in all');
  var lbl = el('div', { class: 'rop-dbl' }, [el('span', { text: (days > 1 || ropShortDay(f0) !== 'Today' ? ropShortDay(f0) + ' · ' : '') + ropClk(f0) }),
    el('span', { text: (days > 1 ? days + ' days · ' : '') + hmText(tot) + ' in all' }), el('span', { text: endT })]);
  return el('div', { class: 'rop-dbar' }, [bar, lbl]);
}
function ropTm(job, p, f, ms) {
  var key = p.id + ':' + f;
  if (ROPT.ed === key) {
    var done = false, inp = el('input', { class: 'rop-tin', type: 'time', value: ropHM(ms), 'aria-label': f === 's' ? 'Start time' : 'Stop time' });
    var go = function () { if (done) return; done = true; ropSetTime(job, p, f, inp.value); };
    inp.addEventListener('click', function (e) { e.stopPropagation(); });
    inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); go(); } else if (e.key === 'Escape') { e.preventDefault(); done = true; ROPT.ed = null; render(); } });
    inp.addEventListener('blur', function () { setTimeout(go, 0); });
    requestAnimationFrame(function () { try { inp.focus(); } catch (e) {} });
    return inp;
  }
  var b = el('button', { class: 'rop-tm', type: 'button', title: 'Change the ' + (f === 's' ? 'start' : 'stop') + ' time', text: ropClk(ms) });
  b.addEventListener('click', function (e) { e.stopPropagation(); ROPT.ed = key; ROPT.note = null; render(); });
  return b;
}
function ropSetTime(job, p, f, v) {
  ROPT.ed = null;
  var st = +new Date(p.start), en = p.stop ? +new Date(p.stop) : null, cur = f === 's' ? st : en;
  var ts = ropAt(f === 's' ? st : (en || st), v);
  if (ts == null || Math.floor(ts / 60000) === Math.floor(cur / 60000)) { render(); return; }
  if (f === 'e' && ts <= st && ts + 864e5 > st) ts += 864e5;   /* past midnight */
  if (f === 'e' && ts > Date.now()) { toast('A stop time can’t be in the future'); render(); return; }
  var r = editPunchCommit(p, { start: f === 's' ? new Date(ts).toISOString() : p.start, stop: f === 'e' ? new Date(ts).toISOString() : (p.stop || null), startReason: p.startReason, stopReason: p.stopReason, opId: p.opId, notes: p.notes });
  if (!r.ok) { toast(r.msg); render(); return; }
  save(true); render(); tecRender();
  ropUndo((f === 's' ? 'Start' : 'Stop') + ' time ' + ropClk(ts) + ' — ' + hmText((p.stop ? +new Date(p.stop) : Date.now()) - +new Date(p.start)) + ' on that punch.');
}
/* Parsec 12.7: a running punch's "now" — click it when it really stopped earlier; then it asks why */
function ropNowTm(job, p) {
  var key = p.id + ':e';
  if (ROPT.ed === key) {
    var done = false, v0 = ropHM(Date.now()), inp = el('input', { class: 'rop-tin', type: 'time', value: v0, 'aria-label': 'It stopped at' });
    var go = function () { if (done) return; done = true; ropStopAsk(job, p, inp.value, v0); };
    inp.addEventListener('click', function (e) { e.stopPropagation(); });
    inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); go(); } else if (e.key === 'Escape') { e.preventDefault(); done = true; ROPT.ed = null; render(); } });
    inp.addEventListener('blur', function () { setTimeout(go, 0); });
    requestAnimationFrame(function () { try { inp.focus(); } catch (e) {} });
    return inp;
  }
  var b = el('button', { class: 'rop-tm rop-now', type: 'button', title: 'Stopped earlier? Set the time it stopped', text: 'now' });
  b.addEventListener('click', function (e) { e.stopPropagation(); ROPT.ed = key; ROPT.note = null; ROPT.why = null; render(); });
  return b;
}
function ropStopAsk(job, p, v, v0) {
  ROPT.ed = null;
  if (!v || v === v0) { render(); return; }
  var st = +new Date(p.start), ts = ropAt(st, v);
  if (ts == null) { render(); return; }
  if (ts <= st && ts + 864e5 > st && ts + 864e5 <= Date.now()) ts += 864e5;   /* past midnight */
  if (ts <= st) { toast('The stop has to come after the start, ' + ropClk(st)); render(); return; }
  if (ts > Date.now()) { toast('A stop time can’t be in the future'); render(); return; }
  ROPT.why = { pid: p.id, ts: ts }; render();
  requestAnimationFrame(function () { var b = R.querySelector('.rop-why .rop-rs'); if (b) try { b.focus(); } catch (e) {} });
}
function ropWhyRow(job, p) {
  var ts = ROPT.why.ts, st = +new Date(p.start);
  var row = el('div', { class: 'rop-why', role: 'group', 'aria-label': 'Why did it stop?' }, [el('div', { class: 'rop-whyh' }, [el('span', { html: 'Stopped at <b>' + esc(ropClk(ts)) + '</b> · ' + esc(hmText(ts - st)) + ' — why?' }), ropIb('x', 'Keep it running', function () { ROPT.why = null; render(); }, 'rop-whyx')])]
    .concat(ropStops().map(function (x) { return el('button', { class: 'rop-rs', type: 'button', 'data-rsn': x, style: '--c:' + ropRc(x), html: '<i></i><span>' + esc(x) + '</span>', onClick: function (e) { e.stopPropagation(); ropStopAt(job, p, ts, x); } }); })));
  row.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); ROPT.why = null; render(); } });
  return row;
}
function ropStopAt(job, p, ts, x) {
  ROPT.why = null;
  var st = +new Date(p.start), r = rcStopAt(p, ts, x);
  if (!r.ok) { toast(r.msg); render(); return; }
  save(true); render(); tecRender();
  ropUndo('Stopped at ' + ropClk(ts) + ' · ' + (r.gaps ? r.reason + ' — not complete yet: ' + r.gapText : r.reason) + ' — ' + hmText(ts - st) + ' on that punch.');
}
/* move the running clock to another operation: this RO's, the person's other ROs', or shop time — the start stays */
function ropMove(job, p, b) {
  var G = rcTargets(p);
  if (!G.length) { toast('There’s no other operation to move it to'); return; }
  var kids = [el('div', { class: 'rop-poph', html: '<b>Move the running clock to</b><small>It keeps its start, ' + esc(ropClk(p.start)) + '</small>' })];
  G.forEach(function (g) {
    kids.push(el('div', { class: 'rop-mvh', text: g.t }));
    g.L.forEach(function (t) {
      var top = g.k === 'shop' ? t.cm : g.k === 'ro' ? 'Op ' + t.n + ' · ' + t.cm : t.no + ' · Op ' + t.n, sub = g.k === 'shop' ? 'Shop time — not on an RO' : g.k === 'ro' ? '' : t.cm + (t.cust ? ' · ' + t.cust : '');
      kids.push(el('button', { class: 'px-menu__item rop-mi', type: 'button', role: 'menuitem', 'data-op': t.opId, html: '<span><b>' + esc(top) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>',
        onClick: function (ev) { ev.stopPropagation(); pxClosePop(); var r = rcMove(p, t.roId, t.opId); if (!r.ok) { toast(r.msg); return; }
          save(true); render(); tecRender(); ropUndo('The running clock moved to ' + r.label + ' — it still started ' + ropClk(p.start) + '.'); } }));
    });
  });
  pxPop(b, el('div', { class: 'px-pop rop-pop rop-mvpop', role: 'menu' }, kids));
}
function ropRsn(job, p, f) {
  var r = f === 's' ? p.startReason : p.stopReason;
  var b = el('button', { class: 'rop-rs', type: 'button', title: 'Change the ' + (f === 's' ? 'start' : 'stop') + ' reason', 'aria-haspopup': 'menu', style: '--c:' + ropRc(r), html: '<i></i><span>' + esc(r || '—') + '</span>' + pxI('chevD', 10) });
  b.addEventListener('click', function (e) {
    e.stopPropagation();
    var L = f === 's' ? START_REASONS.slice() : ropStops(); if (r && L.indexOf(r) < 0) L.unshift(r);
    var pop = el('div', { class: 'px-pop rop-pop rop-rspop', role: 'menu' }, [el('div', { class: 'rop-poph', html: '<b>' + (f === 's' ? 'Started for' : 'Stopped for') + '</b>' })].concat(L.map(function (x) {
      var on = x === r;
      return el('button', { class: 'px-menu__item rop-mi' + (on ? ' is-on' : ''), type: 'button', role: 'menuitemradio', 'aria-checked': on ? 'true' : 'false', html: '<i class="rop-dot" style="background:' + ropRc(x) + '"></i><span><b>' + esc(x) + '</b></span>' + (on ? pxI('check', 13) : ''),
        onClick: function (ev) { ev.stopPropagation(); pxClosePop(); if (on) return;
          if (updatePunchReasons(p.id, f === 's' ? x : p.startReason, f === 'e' ? x : p.stopReason)) { save(true); render(); tecRender(); ropUndo((f === 's' ? 'Start' : 'Stop') + ' reason: ' + x + '.'); } } });
    })));
    pxPop(b, pop);
  });
  return b;
}
function ropDelPunch(p) {
  var d = hmText((p.stop ? +new Date(p.stop) : Date.now()) - +new Date(p.start));
  try { if (p.stop && typeof TL !== 'undefined' && TL.mustAskFor && TL.mustAskFor(punchWho(p))) { TL.askDel(p.id); render(); return; } } catch (e) {}   /* Parsec 15 */
  if (deletePunch(p.id) === false) return; save(true); render(); tecRender(); ropUndo('Punch deleted — ' + d + (p.stop ? ', it counts as air now' : '') + '.');
}
function ropNoteLines(p) { return String(p.notes || '').split(/\n/).filter(function (l) { return l.trim(); }); }
function ropPunch(job, p, box) {
  var st = +new Date(p.start), live = !p.stop, en = live ? Date.now() : +new Date(p.stop), who = punchWho(p);
  var blk = el('div', { class: 'rop-tp' + (live ? ' is-live' : '') + (p.stopReason && /^Complete/.test(p.stopReason) ? ' is-done' : ''), 'data-pid': p.id, style: '--lc:' + ropRc(p.startReason) + ';--ec:' + (live ? 'var(--status-working)' : ropRc(p.stopReason)) });
  var srow = el('div', { class: 'rop-te is-s' }, [el('i'), ropTm(job, p, 's', st), el('span', { class: 'rop-tw' }, [el('span', { class: 'rop-twl', text: 'Started ·' }), ropRsn(job, p, 's')].concat(who ? [el('span', { class: 'rop-twl', text: '· ' + ropFirst(who) })] : [])),
    el('span', { class: 'rop-ttools' }, [ropIb('notePlus', 'Add a note here', function () { ROPT.note = p.id; ROPT.ed = null; render(); })].concat(live ? [ropIb('swap', 'Move to another operation', function (e, b) { ropMove(job, p, b); }, 'rop-mvb')] : []).concat([ropIb('trash', 'Delete punch', function () { ropDelPunch(p); }, 'is-dng')]))]);
  blk.appendChild(srow);
  var ns = noteEntries(p.notes);
  ns.forEach(function (n, i) {
    var at = noteTimeOf(p, n);   /* the time it was saved */
    /* 17.3: a saved note changes in place — click it (or ✎); Enter keeps it, Esc leaves it as it was; its saved time stays */
    var nk = p.id + '|' + i, NP = v150NoteOk(job, { by: (typeof punchWho === 'function' ? punchWho(p) : p.by) || p.by || '' }, RO);
    if (ROPT.pnedit === nk) {
      var inp = el('input', { class: 'rop-nin rop-nined', value: String(n.text || ''), 'aria-label': 'Change the note' }), done = false;
      var fin = function (keep) {
        if (done) return; done = true; ROPT.pnedit = null; var v = autoPunct(String(inp.value || '').trim()), old = String(n.text || '').trim(), lines = ropNoteLines(p);
        if (keep && v && v !== old && lines[i] != null) {
          pushUndo('change a punch note'); lines[i] = v; p.notes = lines.join('\n');
          if (p.noteAt && p.noteAt[old]) { p.noteAt[v] = p.noteAt[old]; delete p.noteAt[old]; }
          try { audit('op-note-edit', roLabel(RO) + ': changed a punch note on Op ' + ropN(job) + ' — ' + v.slice(0, 80), RO); } catch (e) {}
          save(true); render(); try { tecRender(); } catch (e) {} ropUndo('Note changed.');
        } else render();
      };
      inp.addEventListener('click', function (e) { e.stopPropagation(); });
      inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); fin(false); } else if (e.key === 'Enter') { e.preventDefault(); fin(true); } });
      inp.addEventListener('blur', function () { setTimeout(function () { fin(true); }, 0); });
      blk.appendChild(el('div', { class: 'rop-tn is-ed' }, [el('small', { text: ropClk(at) }), el('span', { class: 'rop-tnb' }, [inp])]));
      requestAnimationFrame(function () { try { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) {} });
      return;
    }
    var txs = el('span', { class: 'rop-tnt', title: NP.ok ? 'Click to change the note' : NP.why }, ropCcMark(job, n.text));
    txs.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('button, .rop-ccm')) return; e.stopPropagation(); if (!NP.ok) { toast(NP.why); return; } ROPT.pnedit = nk; ROPT.note = null; render(); });
    blk.appendChild(el('div', { class: 'rop-tn' }, [el('small', { text: ropClk(at) }), txs, ropIb('pencil', 'Change the note', function () { if (!NP.ok) { toast(NP.why); return; } ROPT.pnedit = nk; ROPT.note = null; render(); }, 'rop-tnx rop-tnp'), ropIb('x', 'Delete this note', function () {
      var lines = ropNoteLines(p); if (!lines[i]) return; pushUndo('delete punch note'); lines.splice(i, 1); p.notes = lines.join('\n'); if (p.noteAt) delete p.noteAt[String(n.text || '').trim()]; save(true); render(); ropUndo('Note deleted.'); }, 'rop-tnx is-dng')]));
  });
  if (ROPT.note === p.id) {
    var ni = el('input', { class: 'rop-nin', placeholder: live ? 'What are you doing right now? Enter saves' : 'A note on this punch — Enter saves', 'aria-label': 'A note on this punch' });
    ni.addEventListener('click', function (e) { e.stopPropagation(); });
    ni.addEventListener('keydown', function (e) { e.stopPropagation();
      if (e.key === 'Escape') { ROPT.note = null; render(); return; }
      if (e.key !== 'Enter') return; e.preventDefault();
      var txt = autoPunct(String(ni.value || '').trim()); if (!txt) { ROPT.note = null; render(); return; }
      pushUndo('punch note'); var line = txt; p.notes = String(p.notes || '').trim() ? String(p.notes).replace(/\s+$/, '') + '\n' + line : line; ockNoteTime(p, line);
      ROPT.note = null; save(true); render(); ropUndo('Note added to the punch.'); });
    ni.addEventListener('blur', function () { setTimeout(function () { if (ROPT.note === p.id && !String(ni.value || '').trim()) { ROPT.note = null; render(); } }, 150); });
    blk.appendChild(el('div', { class: 'rop-tn is-add' }, [el('small', { text: live ? 'now' : ropClk(en) }), ni]));
    requestAnimationFrame(function () { try { ni.focus(); } catch (e) {} });
  } else if (!ns.length) blk.appendChild(el('div', { class: 'rop-tn is-none', html: '<span>No notes on this punch</span>' }));
  var dur = el('em', { text: hmText(en - st) });
  if (live) TIMERS.push(function () { dur.textContent = hmText(Date.now() - st); });
  var erow = live ? el('div', { class: 'rop-te is-e' }, [el('i'), ropNowTm(job, p), el('span', { class: 'rop-tw', text: 'On the clock' }), dur])
    : el('div', { class: 'rop-te is-e' }, [el('i'), ropTm(job, p, 'e', en), el('span', { class: 'rop-tw' }, [el('span', { class: 'rop-twl', text: 'Stopped ·' }), ropRsn(job, p, 'e')]), dur]);
  blk.appendChild(erow);
  if (live && ROPT.why && ROPT.why.pid === p.id) blk.appendChild(ropWhyRow(job, p));
  box.appendChild(blk);
}
/* a new time entry, opened right where it goes, prefilled between its neighbours */
function ropAddForm(job, A) {
  var base = A.s || A.e || Date.now();
  var dIn = el('input', { type: 'date', value: ropYMD(base), 'aria-label': 'Day' }), sIn = el('input', { type: 'time', value: ropHM(A.s || Date.now() - 36e5), 'aria-label': 'Started' }), eIn = el('input', { type: 'time', value: ropHM(A.e || Date.now()), 'aria-label': 'Stopped' });
  var sr = el('select', { 'aria-label': 'Started for' }), er = el('select', { 'aria-label': 'Stopped because' });
  START_REASONS.forEach(function (x) { sr.appendChild(el('option', { value: x, text: x })); }); sr.value = START_REASONS.indexOf('Repairing') > -1 ? 'Repairing' : START_REASONS[0];
  ropStops().forEach(function (x) { er.appendChild(el('option', { value: x, text: x })); }); er.value = 'Switched job';
  var lab = function (t, c) { return el('label', {}, [el('span', { text: t }), c]); };
  function saveIt() {
    var d0 = new Date(dIn.value + 'T00:00:00').getTime(); if (isNaN(d0)) { toast('Pick the day'); return; }
    var s = ropAt(d0, sIn.value), e = ropAt(d0, eIn.value); if (s == null || e == null) { toast('Both a start and a stop are needed'); return; }
    if (e <= s) e += 864e5;
    if (e > Date.now()) { toast('A stop time can’t be in the future'); return; }
    var r = addManualPunch({ roId: RO.id, opId: job.id, start: new Date(s).toISOString(), stop: new Date(e).toISOString(), startReason: sr.value, stopReason: er.value, notes: '' });
    if (!r.ok) { toast(r.msg); return; }
    ROPT.add = null; save(true); render(); tecRender(); ropUndo('Time entry added — ' + hmText(e - s) + '.');
  }
  var f = el('div', { class: 'rop-tf', role: 'group', 'aria-label': 'A new time entry' }, [lab('Day', dIn), el('span'), lab('Started', sIn), lab('For', sr), lab('Stopped', eIn), lab('Because', er),
    el('div', { class: 'rop-tff' }, [el('small', { text: 'A new time entry on Op ' + ropN(job) }), el('button', { class: 'px-btn px-btn--ghost px-btn--sm', type: 'button', text: 'Cancel', onClick: function (e) { e.stopPropagation(); ROPT.add = null; render(); } }),
      el('button', { class: 'px-btn px-btn--primary px-btn--sm', type: 'button', html: pxI('check', 13) + 'Save', onClick: function (e) { e.stopPropagation(); saveIt(); } })])]);
  f.addEventListener('click', function (e) { e.stopPropagation(); });
  f.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter' && e.target.tagName !== 'SELECT') { e.preventDefault(); saveIt(); } if (e.key === 'Escape') { ROPT.add = null; render(); } });
  requestAnimationFrame(function () { try { sIn.focus(); } catch (e) {} });
  return f;
}
function ropAddEnd(job) {
  var ps = punchesOf(job).slice().sort(function (a, b) { return new Date(a.start) - new Date(b.start); }), l = ps[ps.length - 1], now = Date.now();
  var s = l && l.stop ? Math.max(+new Date(l.stop), now - 36e5) : now - 36e5;
  ROPT.add = { op: job.id, k: 'end', s: s, e: now }; ROPT.ed = null; ROPT.note = null; render();
}
/* ---------- Parsec 15 (C): the Time tab — notes that aren't on a punch change in place or go; a deleted entry shows where it was ---------- */
function ropSoloNote(job, it) {
  var ref = it.ref, P = v150NoteOk(job, ref, RO), row = el('div', { class: 'rop-tn is-solo' + (ref ? ' is-ed' : '') });
  row.appendChild(el('small', { text: ropClk(it.at) }));
  if (ref && ROPT.nedit === ref) {
    var inp = el('input', { class: 'rop-nin rop-nined', value: String(ref.text || ''), 'aria-label': 'Change the note' }), done = false;
    var fin = function (keep) {
      if (done) return; done = true; ROPT.nedit = null; var v = String(inp.value || '').trim();
      if (keep && v && v !== String(ref.text || '').trim()) {
        pushUndo('change a note'); ref.text = v; ref.editedAt = nowIso(); ref.editedBy = ropMe() || '';
        try { audit('op-note-edit', roLabel(RO) + ': changed a note on Op ' + ropN(job) + ' — ' + v.slice(0, 80), RO); } catch (e) {}
        save(true); render(); try { tecRender(); } catch (e) {} ropUndo('Note changed.');
      } else render();
    };
    inp.addEventListener('click', function (e) { e.stopPropagation(); });
    inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); fin(false); } else if (e.key === 'Enter') { e.preventDefault(); fin(true); } });
    inp.addEventListener('blur', function () { setTimeout(function () { fin(true); }, 0); });
    row.appendChild(el('span', { class: 'rop-tnb' }, [el('em', { text: it.n.lb }), inp]));
    requestAnimationFrame(function () { try { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) {} });
    return row;
  }
  var ed = ref && ref.editedAt ? ' <i class="rop-tned" data-tip="' + esc('Changed' + (ref.editedBy ? ' by ' + ropFirst(ref.editedBy) : '') + ' · ' + ropClk(+new Date(ref.editedAt))) + '">edited</i>' : '';
  var nsp = el('span', { html: '<em>' + esc(it.n.lb) + '</em>' }); ropCcMark(job, it.n.text).forEach(function (x) { nsp.appendChild(x); }); if (ed) nsp.insertAdjacentHTML('beforeend', ed);   /* 17.3 */
  row.appendChild(nsp);
  if (ref) {
    var tools = el('span', { class: 'rop-ntools' });
    var pen = ropIb('pencil', 'Change the note', function () { if (!P.ok) { toast(P.why); return; } ROPT.nedit = ref; ROPT.nmenu = null; render(); });
    var del = ropIb('trash', 'Delete the note', function () { if (!P.ok) { toast(P.why); return; } ropNoteDel(job, it); }, 'is-dng');
    var more = ropIb('more', 'Change or delete the note', function () { ROPT.nmenu = ROPT.nmenu === ref ? null : ref; render(); }, 'rop-nmore');
    if (!P.ok) [pen, del].forEach(function (b) { b.classList.add('is-off'); b.setAttribute('aria-disabled', 'true'); b.setAttribute('data-tip', P.why); b.removeAttribute('title'); });
    if (ROPT.nmenu === ref) row.classList.add('is-tools');
    tools.appendChild(more); tools.appendChild(pen); tools.appendChild(del); row.appendChild(tools);
  }
  return row;
}
function ropNoteDel(job, it) {
  var arr = it.src === 'log' ? job.log : job.offNotes; if (!Array.isArray(arr)) return; var i = arr.indexOf(it.ref); if (i < 0) return;
  pushUndo('delete a note'); arr.splice(i, 1); ROPT.nmenu = null;
  try { audit('op-note-del', roLabel(RO) + ': deleted a note on Op ' + ropN(job) + ' — ' + String(it.ref.text || '').slice(0, 80), RO); } catch (e) {}
  save(true); render(); try { tecRender(); } catch (e) {} ropUndo('Note deleted.');
}
/* where a deleted entry was: its minutes are air now */
function ropHoleRow(job, h) {
  var s = +new Date(h.start), e = +new Date(h.stop);
  return el('div', { class: 'rop-tn is-solo is-hole', html: '<small>' + esc(ropClk(s)) + '</small><span><em>Deleted</em>' + esc(ropClk(s) + '–' + ropClk(e) + ' · ' + hmText(e - s) + ' · it counts as air now' + (h.delBy ? ' · by ' + ropFirst(h.delBy) : '')) + '</span>' });
}

/* 17.3: the notes on the left, Cause and Correction beside them */
function ropTimeline(job, pane) {
  var g = el('div', { class: 'rop-ccg' }), left = el('div', { class: 'rop-ccleft' });
  ropTimelineNotes(job, left); g.appendChild(left); g.appendChild(ropCcPanel(job)); pane.appendChild(g);
}
function ropTimelineNotes(job, pane) {
  if (ROPT.add && ROPT.add.op !== job.id) ROPT.add = null;
  var ps = punchesOf(job).slice().sort(function (a, b) { return new Date(a.start) - new Date(b.start); }), items = [];
  ps.forEach(function (p) { items.push({ at: +new Date(p.start), p: p }); });
  (job.log || []).forEach(function (l) { if (l && l.text && !l.cc && (l.kind === 'cause' || l.kind === 'fix')) items.push({ at: +new Date(l.at), n: { lb: l.kind === 'fix' ? 'Correction' : 'Cause', text: l.text }, ref: l, src: 'log' }); });
  (Array.isArray(job.offNotes) ? job.offNotes : []).forEach(function (n) { items.push({ at: +new Date(n.at), n: { lb: n.by ? ropFirst(n.by) : 'Note', text: n.text }, ref: n, src: 'off' }); });
  v150HolesOf(job).forEach(function (h) { items.push({ at: +new Date(h.start), h: h }); });   /* Parsec 15: where a deleted entry was */
  items.sort(function (a, b) { return a.at - b.at; });
  var bar = ropDayBar(ps); if (bar) pane.appendChild(bar);
  var box = el('div', { class: 'rop-tl' }), last = '', prevP = null, k = 0;
  var dayRow = function (t) { var d = new Date(t), lb = d.toDateString() === new Date().toDateString() ? 'Today' : pxDay(d); if (lb === last) return; last = lb; box.appendChild(el('div', { class: 'rop-tday', text: lb })); };
  items.forEach(function (it) {
    if (it.p && prevP) {
      var key = 'b' + (k++), A = { op: job.id, k: key, s: prevP.stop ? +new Date(prevP.stop) : null, e: +new Date(it.p.start) };
      if (ROPT.add && ROPT.add.k === key) box.appendChild(ropAddForm(job, ROPT.add));
      else if (!ROPT.add) box.appendChild(el('button', { class: 'rop-addb', type: 'button', 'aria-label': 'Add a time entry here', html: '<span>' + pxI('plus', 10) + 'time entry</span>', onClick: function (e) { e.stopPropagation(); A.s = A.s || A.e - 18e5; ROPT.add = A; ROPT.ed = null; ROPT.note = null; render(); } }));
    }
    dayRow(it.at);
    if (it.h) { box.appendChild(ropHoleRow(job, it.h)); return; }
    if (it.n) { box.appendChild(ropSoloNote(job, it)); return; }   /* Parsec 15: change it or delete it */
    ropPunch(job, it.p, box); prevP = it.p;
  });
  if (ROPT.add && ROPT.add.k === 'end') box.appendChild(ropAddForm(job, ROPT.add));
  if (!items.length && !(ROPT.add && ROPT.add.k === 'end')) box.appendChild(ropNone('No time on this operation yet. Start the clock above, or add a time entry.'));
  pane.appendChild(box);
  if (opDoneNow(job)) return;
  var rp = ropRun(job);
  var ta = el('textarea', { class: 'px-input px-input--full rop-ta', rows: '2', placeholder: rp ? 'What you found, what you did — it goes in this punch (Enter saves)' : 'What you found, what you did — no clock needed (Enter saves)' });
  if (OFF_DRAFTS[job.id]) ta.value = OFF_DRAFTS[job.id];
  ta.addEventListener('input', function () { if (ta.value.trim()) OFF_DRAFTS[job.id] = ta.value; else delete OFF_DRAFTS[job.id]; ropCcType(job, ta.value); });   /* 17.3: the lines fill as you type */
  function saveNote() {
    var txt = autoPunct(String(ta.value || '').replace(/\s*\n\s*/g, ' ').trim()); if (!txt) return;
    pushUndo('note'); delete OFF_DRAFTS[job.id]; ROPCC.live = null; clearTimeout(ROPCC.t);
    var p2 = ropRun(job);
    if (p2) { var line = txt; p2.notes = String(p2.notes || '').trim() ? String(p2.notes).replace(/\s+$/, '') + '\n' + line : line; ockNoteTime(p2, line); }
    else job.offNotes = (Array.isArray(job.offNotes) ? job.offNotes : []).concat([{ id: 'on' + Date.now().toString(36), at: new Date().toISOString(), text: txt, by: punchByName() || ropMe() }]);
    save(true); render(); ropUndo(p2 ? 'Note saved in the running punch' : 'Note saved on Op ' + ropN(job));
    requestAnimationFrame(function () { var t2 = R.querySelector('.rop-ta'); if (t2) t2.focus(); });
  }
  ta.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveNote(); } });
  pane.appendChild(el('div', { class: 'px-notecomp' }, [ta, el('button', { class: 'px-btn px-btn--sm', type: 'button', text: 'Save', onClick: saveNote })]));
}
