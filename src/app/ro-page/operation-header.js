/* Parsec · ro-page · operation-header.js
   The operation row (17.1: the number, the complaint and the status, a blocker beside it, the job type its coloured edge), the status and job type menus, the ⋯ menu (rename, delete), and the open card's body with its facts.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ropJtLbl ropJtMenu ropJtEdge ropStatus ropOpMenu ropDelOp ropRename ropOpRow ropOpBody ropFact ropFacts ROP_JT (11 functions, 1 constant)
   state      punches
   uses       access/ clock/ data/ kit/ library/ pages/ pages/warranty/ ro/ shell/ state/
*/
/* ---------- the operation's header row (Parsec 12.3; 17.1): the number, the complaint and the status, the job type its coloured edge ---------- */
var ROP_JT = [['DIAG', 'DIAG'], ['OP', 'REPAIR'], ['PM', 'PM'], ['WARR', 'WARR'], ['COMEBACK', 'COMEBACK'], ['SUBLET', 'SUBLET'], ['RECALL', 'RECALL']];
function ropJtLbl(k) { return k === 'OP' ? 'REPAIR' : k; }
/* the job type's menu: from the row's coloured edge and from Job type inside the card (Parsec 17.1) */
function ropJtMenu(j, b) {
  var t = 'OP'; try { t = opJobType(j); } catch (e) {}
  var pop = el('div', { class: 'px-pop rop-pop rop-jtpop', role: 'menu' }, [el('div', { class: 'rop-poph', html: '<b>Job type</b><small>Op ' + ropN(j) + '</small>' })].concat(ROP_JT.map(function (x) {
    var on = x[0] === t;
    return el('button', { class: 'px-menu__item rop-mi' + (on ? ' is-on' : ''), type: 'button', role: 'menuitemradio', 'aria-checked': on ? 'true' : 'false', html: '<i class="rop-dot sq" style="background:' + jtVar(x[0]) + '"></i><span><b>' + x[1] + '</b></span>' + (on ? pxI('check', 13) : ''),
      onClick: function (ev) { ev.stopPropagation(); pxClosePop(); if (on) return; pushUndo('job type'); j.jobType = x[0]; save(true); render(); ropUndo('Op ' + ropN(j) + ' is ' + x[1] + ' now.'); } });
  })));
  pxPop(b, pop);
}
/* the row's coloured edge says the job type at a glance; a click on it changes it (Parsec 17.1) */
function ropJtEdge(j) {
  var t = 'OP'; try { t = opJobType(j); } catch (e) {}
  var b = el('button', { class: 'rop-jte', type: 'button', 'data-t': t, style: '--jc:' + jtVar(t), title: ropJtLbl(t) + ' — click to change the job type', 'aria-label': 'Job type ' + ropJtLbl(t) + ' — change it', 'aria-haspopup': 'menu' });
  b.addEventListener('click', function (e) { e.stopPropagation(); ropJtMenu(j, b); });
  b.addEventListener('mousedown', function (e) { e.stopPropagation(); });
  return b;
}
/* the operation's status: the pill and its menu, in the row (it used to sit in the open operation's body) */
function ropStatus(j) {
  var st = opStatus(j), nm = typeof st === 'string' ? st : st.status, sub = typeof st !== 'string' && st.sub ? st.sub : '';
  var b = pgStEl('ro', jobStatusLabel(nm), { of: j, ofKind: 'op', menu: 1, cls: 'sm rop-st', title: 'Operation status: ' + jobStatusLabel(nm) + (sub ? ' · ' + sub : '') + ' — click to change' });   /* Parsec 14: one status look */
  b.addEventListener('click', function (e) {
    e.stopPropagation();
    var pop = el('div', { class: 'px-pop rop-pop rop-stpop', role: 'menu' }, [el('div', { class: 'rop-poph', html: '<b>Operation status</b><small>Op ' + ropN(j) + '</small>' })]);
    JOB_STATUS_NAMES.forEach(function (n, ki) {
      var on = !j.declined && jobStatusLabel(n) === jobStatusLabel(nm);
      pop.appendChild(pxMenuItem(pxSi(n), pgStLabel('ro', jobStatusLabel(n)), { on: on, tick: on, kbd: String(ki + 1), run: function () {
        if (on) return;
        if (!/^Complete/.test(n) && typeof permReopenOk === 'function' && !permReopenOk(RO)) return;   /* Parsec 13: a completed RO opens again only for those who may */
        if (/^Complete/.test(n) && opCompleteGate(j)) return;
        pushUndo('operation status');
        var reo = !/^Complete/.test(n) && typeof opReopenMark === 'function' ? opReopenMark(j, RO.id, jobStatusLabel(n)) : null;   /* Parsec 12.8: a completed operation opens back up */
        var rp = typeof myRunOf === 'function' ? myRunOf(j) : runningPunchOf(j); if (rp) { stopClock(); rp.stopReason = n; }   /* Parsec 12.7: your own clock */
        var und = ropUndecline(j);   /* Parsec 14.8: back from Declined */
        j.jobStatus = { status: n, setAt: nowIso(), hand: true };   /* Parsec 12.9: a status picked by hand stands */
        save(true); render(); tecRender();
        ropUndo('Op ' + ropN(j) + (reo ? ' reopened — ' : und ? ' is back — ' : ' set to ') + pgStLabel('ro', jobStatusLabel(n)) + (rp ? ' — clock stopped' : '') + '.');
      } }));
    });
    pop.appendChild(pxSep());   /* Parsec 14.8: Declined, after the line */
    pop.appendChild(pxMenuItem(pxSi('Declined'), pgStLabel('ro', 'Declined'), { on: !!j.declined, tick: !!j.declined, kbd: String(JOB_STATUS_NAMES.length + 1), run: function () { if (!j.declined) ropDecline(j); } }));
    if (pxPop(b, pop, { alignRight: true })) ropMenuKeys(pop);
  });
  return b;
}
/* the operation's ⋯: the same on every row */
function ropOpMenu(j) {
  return ropIb('more', 'More for Op ' + ropN(j), function (e, b) {
    var pop = el('div', { class: 'px-pop rop-pop rop-opmenu', role: 'menu' }, [
      pxMenuItem('print', 'Print Op', { run: function () { printOp(j); } }),
      pxMenuItem('swap', 'Move to another RO…', { run: function () { moveOpDialog(j); } }),
      pxSep(),
      pxMenuItem('trash', 'Delete operation', { danger: true, run: function () { ropDelOp(j); } })]);
    pxPop(b, pop, { alignRight: true });
  }, 'rop-more1');
}
function ropDelOp(job) {
  var np = punchesOf(job).length, nP = (job.parts || []).length;
  modal({ title: 'Delete this operation?',
    body: [(job.complaint || 'This operation') + ' and its ' + nP + (nP === 1 ? ' part line' : ' part lines') + (np ? ', plus ' + np + ' time punch' + (np === 1 ? '' : 'es') + ' in the Time Log,' : '') + ' will be removed.' + (runningPunchOf(job) ? ' Its clock is running now — it will be stopped and removed with it.' : '')],
    actions: [{ label: 'Cancel' }, { label: 'Delete operation', kind: 'danger', run: function () {
      var wasLive = !!runningPunchOf(job);
      snapshot('delete operation');
      STATE.punches = STATE.punches.filter(function (p) { return p.opId !== job.id; });
      S.jobs = S.jobs.filter(function (x) { return x.id !== job.id; });
      if (S.ui.card === job.id) S.ui.card = null;
      var oa = openList(RO), ok = oa.indexOf(job.id); if (ok > -1) oa.splice(ok, 1);
      if (soloJob === job.id) soloJob = null;
      save(true); render();
      toast('Operation deleted' + (wasLive ? ' — its clock was stopped' : ''), { label: 'UNDO', run: function () { restoreSnapshot(); } });
    } }] });
}
function ropRename(j, span) {
  if (!span || !span.isConnected) return; var ex0 = span.parentNode && span.parentNode.querySelector('.rop-ren'); if (ex0) { ex0.focus(); return; }
  var inp = el('input', { class: 'rop-ren', value: j.complaint || '', 'aria-label': 'The operation' }), done = false;
  var fin = function (keep) { if (done) return; done = true; var v = String(inp.value || '').trim();
    if (keep && v && v !== j.complaint) { var was = j.complaint || ''; pushUndo('rename operation'); j.complaint = v; try { audit('op-edit', roLabel(RO) + ': Op ' + ropN(j) + ' complaint “' + was + '” → “' + v + '”', RO); } catch (e) {} save(true); render(); ropUndo('Op ' + ropN(j) + ' complaint changed.'); } else render(); };
  inp.addEventListener('click', function (e) { e.stopPropagation(); });
  inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); fin(true); } else if (e.key === 'Escape') { e.preventDefault(); fin(false); } });
  inp.addEventListener('blur', function () { fin(true); });
  span.replaceWith(inp); inp.focus(); inp.select();
}
function ropOpRow(j, i, on, stash) {
  var st = opStatus(j), nm = typeof st === 'string' ? st : st.status, live = !!runningPunchOf(j);
  var rp = (j.parts || []).filter(function (p) { return p && (p.description || p.partNumber); });
  var notOrd = rp.filter(function (p) { return (p.status || 'Not Ordered') === 'Not Ordered'; }).length, out = rp.filter(function (p) { return !partInHand(p); }).length;
  var meta = notOrd ? notOrd + ' part' + (notOrd === 1 ? '' : 's') + ' not ordered' : out ? out + ' part' + (out === 1 ? '' : 's') + ' on the way' : ropDecMeta(j);
  /* Parsec 17.1: the row is the number, the complaint (the whole of it on hover) and the status; the job type is its coloured edge.
     The rest is inside the card: the facts (job type, group, skill, ASIST, steps), the hours on the clock card, who worked it on its time bar. */
  var row = el('div', { class: 'px-row rop-orow' + (on ? ' is-on' : ''), role: 'button', tabindex: '0', 'aria-expanded': on ? 'true' : 'false', 'data-op': j.id, title: pxCase(nm) + (typeof st !== 'string' && st.sub ? ' · ' + st.sub : ''),
    html: pxSi(nm, live ? 'px-breathe' : '') + '<span class="px-row__n">' + (i + 1) + '</span><span class="px-row__t" title="' + esc(j.complaint || 'New operation') + (on ? ' — click to change it' : ' — double-click to change it') + '">' + esc(j.complaint || 'New operation') + '</span>' });
  row.insertBefore(ropJtEdge(j), row.firstChild);
  var ctl = el('span', { class: 'rop-octl' });
  if (meta) ctl.appendChild(el('span', { class: 'px-row__m rop-stm', text: meta, title: meta }));   /* a blocker sits beside the status it explains */
  if (!RO.shop) ctl.appendChild(ropStatus(j));
  ctl.appendChild(ropOpMenu(j));
  ctl.addEventListener('click', function (e) { e.stopPropagation(); });
  ctl.addEventListener('mousedown', function (e) { e.stopPropagation(); });
  row.appendChild(ctl);
  function tog(e) { if (ropPickClick(e, 'o', j.id)) return; S.ui.card = on ? null : j.id; if (on) UI.roOp[RO.id] = null; render(); }
  /* Ctrl / Shift click anywhere on the row picks it — on the job type, the status or ⋯ too */
  row.addEventListener('click', function (e) { if ((e.ctrlKey || e.metaKey || e.shiftKey) && !(e.target.closest && e.target.closest('.rop-cb, .rop-ren'))) { e.stopPropagation(); ropPickClick(e, 'o', j.id); } }, true);
  row.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.rop-octl, .rop-jt, .rop-jte, .rop-cb, .rop-ren')) return; e.stopPropagation();
    var tt = on && !(e.ctrlKey || e.metaKey || e.shiftKey) && e.target.closest && e.target.closest('.px-row__t'); if (tt) { ropRename(j, tt); return; }   /* Parsec 14.8: the open operation's complaint — a click changes it */
    tog(e); });
  row.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target === row) { e.preventDefault(); e.stopPropagation(); tog(e); }
    else if (e.key === 'F2' && e.target === row) { e.preventDefault(); e.stopPropagation(); var t2 = row.querySelector('.px-row__t'); if (t2) ropRename(j, t2); } });
  var tl = row.querySelector('.px-row__t');
  if (tl) tl.addEventListener('dblclick', function (e) { e.preventDefault(); e.stopPropagation(); if (tl.isConnected) ropRename(j, tl); });
  return row;
}
function ropOpBody(j, stash) {
  var body = el('div', { class: 'px-op rop-op172', 'data-key': 'pxop-' + j.id });   /* its own key: another operation's card opens with its unroll, the same one stays still (steady-redraw.js) */
  /* Parsec 17.2: one card — the facts and codes line above the clock, the Time / Parts / Files tabs under the bar, all inside the clock card */
  var top = el('div', { class: 'rop-ockf' }, [ropFacts(j)]);
  if (!RO.shop) top.appendChild(faultBar(j, { noFg: 1 }));
  else { var head = stash && stash.querySelector('.card[data-job="' + j.id + '"] > .cardHead'), links = head ? Array.prototype.slice.call(head.querySelectorAll('.fltLink')) : [];
    if (links.length) { var lr = el('div', { class: 'px-ophead rop-olinks' }); links.forEach(function (a) { lr.appendChild(a); }); top.appendChild(lr); } }
  var ock = pxTime(j), tabs = pxTabs(j, stash);
  if (ock && ock.classList && ock.classList.contains('ock')) { ock.insertBefore(top, ock.firstChild); ock.appendChild(tabs); body.appendChild(ock); }
  else { body.appendChild(top); if (ock) body.appendChild(ock); body.appendChild(tabs); }
  return body;
}
/* the operation's facts, at the top of its card (Parsec 17.1): the job type (a click changes it), the function group,
   the skill, ASIST's approval and the steps done — what used to crowd the row */
function ropFact(lbl, v, cls) { return el('div', { class: 'rop-fact' + (cls ? ' ' + cls : '') }, [el('small', { text: lbl }), v]); }
function ropFacts(j) {
  var t = 'OP'; try { t = opJobType(j); } catch (e) {}
  var g = el('div', { class: 'rop-facts' });
  var jb = el('button', { class: 'rop-fv rop-jtv', type: 'button', 'data-t': t, style: '--jc:' + jtVar(t), title: 'Change the job type', 'aria-haspopup': 'menu', html: '<i class="rop-dot sq"></i><span>' + esc(ropJtLbl(t)) + '</span>' + pxI('chevD', 10) });
  jb.addEventListener('click', function (e) { e.stopPropagation(); ropJtMenu(j, jb); });
  g.appendChild(ropFact('Job type', jb));
  var fg = ''; try { fg = libOpFgrp(j); } catch (e) {}
  if (fg) g.appendChild(ropFact('Group', el('span', { class: 'rop-fv libFg mono', text: fg, title: 'Function group ' + (libFgName(fg) || fg) })));
  if (j.skill) g.appendChild(ropFact('Skill', el('span', { class: 'rop-fv', text: j.skill })));
  if (j.asistApproval) g.appendChild(ropFact('ASIST', el('span', { class: 'rop-fv rop-chip is-' + (/^appr/i.test(j.asistApproval) ? 'a' : /^decl/i.test(j.asistApproval) ? 'd' : 'p'), text: j.asistApproval, title: 'ASIST’s approval — shown only' })));
  try { libOpDocs(j).filter(function (d) { return d.kind === 'proc' && d.proc; }).slice(0, 1).forEach(function (d) { var n = libProcDone(j, d).length, N = d.proc.steps.length;   /* steps done, for the foreman */
    g.appendChild(ropFact('Steps', el('span', { class: 'rop-fv libSteps mono' + (n >= N ? ' done' : ''), text: n + ' of ' + N, title: n + ' of ' + N + ' steps done · ' + (d.title || d.num) }))); }); } catch (e) {}
  g.addEventListener('click', function (e) { e.stopPropagation(); });
  return g;
}
