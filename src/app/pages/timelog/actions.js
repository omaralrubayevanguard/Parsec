/* Parsec · pages/timelog · actions.js
   Typing, dragging and keys on the Time Log; the delete question.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   input change fieldKey move keydown after askDel TK mustAskFor (7 functions, 2 constants)
   uses       access/ data/ pages/ pages/inbox/ ro/ shell/ state/
   at load    on document pointerdown · on document pointermove · on document pointerup · on document dblclick
*/
  /* ---------- typing, dragging, keys ---------- */
  function input(t){ const p = U.pop, d = t.dataset.in; if(!p) return;
    if(d === 's') p.s = t.value; if(d === 'e') p.e = t.value; if(d === 'n') p.n = t.value; if(d === 'fo') p.t = t.value;
    if(d === 'e'){ const r0 = document.querySelector('[data-pg="timelog"] .tg-pop .tk-stopas'); if(r0) r0.hidden = !String(t.value || '').trim(); }   /* Parsec 12.7 */
    if(d === 'why'){ p.why = t.value; const b = document.querySelector('[data-pg="timelog"] .tg-pop .tg-acts .btn-primary'); if(b && (b.dataset.a !== 'psave' || otherT())){ const ok2 = b.dataset.a === 'fgo' ? p.o != null : b.dataset.a === 'crewgo' ? (p.mode !== 'shop' || !!p.op) : true; b.disabled = !(String(t.value).trim() && ok2); if(b.disabled) b.setAttribute('data-tip', String(t.value).trim() ? 'Pick one first' : 'Pick why first'); else b.removeAttribute('data-tip'); } return; }
    if(d === 'spl'){ p.v = t.value; const f = findP(p.pid), el = document.querySelector('[data-pg="timelog"] .tg-pop .tk-spd'); if(f && el){ const m = pm(t.value, +t.dataset.cur); el.textContent = m != null && m > f.p.s && m < f.p.e ? dur(m - f.p.s) + ' · ' + dur(f.p.e - m) : '—'; } return; }
    if(d === 'cra'){ p.a = t.value; return; } if(d === 'crb'){ p.b = t.value; return; }
    if(d === 'sn'){ p.n = t.value; const b = document.querySelector('[data-pg="timelog"] .tg-pop [data-a="tsignn"]'); if(b){ b.disabled = !t.value.trim(); if(b.disabled) b.setAttribute('data-tip', 'Write the note first'); else b.removeAttribute('data-tip'); } return; }
    if(d === 'shed'){ p.v = t.value; return; }   /* 17.5: the pop-over redraws on Enter or when the field is left */
    if(d === 'shin'){ p.v = t.value; const m = pm(t.value, +t.dataset.cur), r1 = document.querySelector('[data-pg="timelog"] .tg-pop .tk-shd'); if(r1) r1.textContent = m != null && m <= NOW ? dur(NOW - m) : '—'; }
    if(d === 's' || d === 'e'){ const f = findP(p.pid); if(!f) return; const e0 = p.e != null ? p.e : f.p.e != null ? hm(f.p.e) : '', s0 = pm(p.s != null ? p.s : hm(f.p.s), f.p.s); const m = f.p.e == null && !String(e0).trim() ? (s0 != null ? NOW - s0 : 0) : (pm(e0, f.p.e) || 0) - (s0 || 0), r = document.querySelector('[data-pg="timelog"] .tk-tg .ro'); if(r) r.textContent = m > 0 ? dur(m) : '—'; }
    if(d === 'note'){ const f = findP(t.dataset.nid); if(!f) return; if(!p._sn){ pushUndo('work notes'); p._sn = 1; } f.raw.notes = t.value; const n = [...document.querySelectorAll('[data-pg="timelog"] .tg-pop [data-nid]')].filter(x => !x.value.trim()).length, h = document.querySelector('[data-pg="timelog"] .tg-pop .tk-nleft'); if(h) h.textContent = n ? n + ' left' : 'All done'; } }
  function change(t){ if(t.dataset.in === 'note') scheduleSave(true);
    if(t.dataset.in === 'shed'){ const c0 = +t.dataset.cur, v = pm(t.value, c0); if(v != null && U.pop){ U.pop.v = hm(v); rd(); } return; }
    if(t.classList && t.classList.contains('tk-tin')){ const c0 = t.dataset.cur !== '' && t.dataset.cur != null ? +t.dataset.cur : null, v = pm(t.value, c0); if(v != null && t.value.trim() !== hm(v)){ t.value = hm(v); input(t); } } }   /* Parsec 14.6: 715 becomes 07:15 */
  function fieldKey(t, ev){ const k = ev.key, d = t.dataset.in;
    if(k === 'Escape'){ t.blur(); if(U.pop){ if(U.drag && U.drag.pending) U.drag = null; U.pop = null; rd(); } ev.preventDefault(); return true; }
    if((k === 'ArrowUp' || k === 'ArrowDown') && t.classList && t.classList.contains('tk-tin')){ ev.preventDefault(); const c0 = t.dataset.cur !== '' && t.dataset.cur != null ? +t.dataset.cur : null; let v = pm(t.value, c0);
      if(v == null) v = c0 != null ? c0 : NOW; v = Math.max(0, Math.min(1439, v + (k === 'ArrowUp' ? 1 : -1) * (ev.shiftKey ? 5 : 1))); t.value = hm(v); input(t); return true; }   /* Parsec 14.6: arrows nudge a typed time */
    if(k === 'Enter' && t.classList && t.classList.contains('tk-tin')) change(t);
    if(d === 'note' && k === 'Enter'){ ev.preventDefault(); const L = [...document.querySelectorAll('[data-pg="timelog"] .tg-pop [data-nid]')], i = L.indexOf(t); if(i < L.length - 1) L[i + 1].focus(); else H.notesgo(); return true; }
    if(k === 'Enter' && t.tagName !== 'TEXTAREA'){ ev.preventDefault(); const b = document.querySelector('[data-pg="timelog"] .tg-pop .btn-primary:not([disabled])'); if(b) b.click(); return true; }
    return false; }
  document.addEventListener('pointerdown', ev => { if(UI.view !== 'timelog') return; const h = ev.target.closest && ev.target.closest('[data-pg="timelog"] .h[data-h]'); if(!h) return;
    ev.preventDefault(); ev.stopPropagation(); if(mustAsk(U.who)){ pushToast('Press E and send the change to ' + PG.first(lead()) + '.'); return; } if(locked()) return; const f = findP(h.dataset.p); if(!f) return;
    U.drag = { pid: f.p.id, edge: h.dataset.h, orig: { s: f.p.s, e: f.p.e }, v: null }; U.sel = f.p.id; U.kh = false; U.pop = null; rd(); }, true);
  document.addEventListener('pointermove', ev => { if(UI.view !== 'timelog' || !U.drag || U.drag.pending) return; const tr = document.querySelector('[data-pg="timelog"] .tk-tl .tk-trk'); if(!tr || !U.ab) return; const r = tr.getBoundingClientRect();
    dragTo(U.ab[0] + (ev.clientX - r.left) / r.width * (U.ab[1] - U.ab[0])); PG.keepScroll(render); });
  document.addEventListener('pointerup', () => { if(UI.view === 'timelog' && U.drag && !U.drag.pending) finishDrag(); });
  document.addEventListener('dblclick', ev => { if(UI.view !== 'timelog') return; const t = ev.target.closest && ev.target.closest('[data-pg="timelog"] [data-a="psel"]'); if(!t) return; const f = findP(t.dataset.p); if(f && !locked()){ U.pop = { type: 'edit', pid: t.dataset.p }; PG.anchor(U, t); rd(); } });
  function move(d){ const L = flat(); if(!L.length) return; U.kb = true; const i = L.indexOf(U.day); U.day = i < 0 ? L[0] : L[Math.max(0, Math.min(L.length - 1, i + d))]; U.sel = null; U.pop = null; rd(); PG.kbScroll(); }
  function keydown(ev){
    const k = ev.key, stop = () => { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); };
    if(U.drag && !U.drag.pending && k === 'Escape'){ U.drag = null; rd(); return stop(); }
    if(U.drag && !U.drag.pending && U.drag.v != null && k === 'Enter' && !PG.typing(ev)){ finishDrag(); return stop(); }
    if(ev.altKey && (k === 'ArrowLeft' || k === 'ArrowRight') && U.sel && U.view === 'day' && !PG.typing(ev)){ nudge(ev.shiftKey ? 's' : 'e', k === 'ArrowLeft' ? -U.snap : U.snap); return stop(); }
    if(ev.ctrlKey || ev.metaKey || ev.altKey || PG.typing(ev)) return;
    const p = U.pop;
    if(p){ if(k === 'Escape'){ if(U.drag && U.drag.pending) U.drag = null; U.pop = null; rd(); return stop(); } if(k === 'Enter'){ const b = document.querySelector('[data-pg="timelog"] .tg-pop .btn-primary:not([disabled])'); if(b){ b.click(); return stop(); } }
      const n = +k; if(n >= 1 && n <= 7){ const b = document.querySelector(`[data-pg="timelog"] .tg-pop [data-a="fset"][data-o="${n - 1}"]`); if(b){ b.click(); return stop(); } } return; }
    if(k === 'j'){ move(1); return stop(); } if(k === 'k'){ move(-1); return stop(); }
    if(k === 'ArrowLeft' || k === 'ArrowRight'){ const b = document.querySelector(`[data-pg="timelog"] [data-a="dnav"][data-d="${k === 'ArrowLeft' ? -1 : 1}"]:not([disabled])`); if(b){ H.dnav(b); return stop(); } }
    if(k === 'e' && U.view === 'day'){ const c = calc(U.who, U.day), x = c && (c.ps.find(q => q.id === U.sel) || c.ps.filter(q => q.e != null).slice(-1)[0]); if(x && !locked()){ U.sel = x.id; U.pop = { type: 'edit', pid: x.id }; rd(); const el = document.querySelector(`[data-pg="timelog"] .tk-r[data-p="${x.id}"]`); if(el){ PG.anchor(U, el); rd(); } } return stop(); }
    if(k === 'a'){ const b = document.querySelector('[data-pg="timelog"] [data-a="pop"][data-p="add"]'); if(b){ H.pop(b); return stop(); } }
    if(k >= '1' && k <= '4'){ if(k === '4' && role() === 'tech') return stop(); U.view = ['day', 'week', 'sheet', 'shop'][+k - 1]; if(U.view !== 'shop' && U.who === 'ALL') U.who = techs()[0] || null; rd(); return stop(); }
  }
  function after(){ PG.placePop(U); if(U.kb) PG.kbScroll(); const f = document.querySelector('[data-pg="timelog"] .tg-pop [data-in="s"], [data-pg="timelog"] .tg-pop [data-in="shin"], [data-pg="timelog"] .tg-pop [data-in="shed"]');
    document.querySelectorAll('[data-pg="timelog"] .tk-whc .tk-whi.on').forEach(b => { const c = b.parentNode; c.scrollTop = b.offsetTop - c.clientHeight / 2 + b.offsetHeight / 2; }); if(f && U.pop && !U.pop._f){ U.pop._f = 1; f.focus(); f.select(); }
    if(U.pop && U.pop.type === 'notes' && !U.pop._nf){ U.pop._nf = 1; const el = document.querySelector('[data-pg="timelog"] .tg-pop [data-nid]'); if(el) el.focus(); } }
  const TK = { clk: () => { const c = U.who && U.who !== 'ALL' ? (flush(), calc(U.who, TODAY)) : null; return c ? dur(c.clocked) : null; } };
  /* the Inbox: timesheets to sign or approve */
  if(typeof IB !== 'undefined') IB.DERIVE.push((me, r) => { const L = [], pv = PER('prev'), lead0 = r === 'Foreman' || r === 'Manager' || r === 'Admin';
    if(lead0) rtTechs().forEach(t => { const s = sign()[t + '|' + pv[0]]; if(s && s.tech && !s.fm) L.push({ key: 'tsa:' + t + ':' + pv[0], from: t, k: 'ask', src: 'timelog', at: s.techAt || nowIso(), t: `Approve ${PG.first(t)}’s timesheet — ${pv[1]}`, b: 'Signed ' + s.tech + '. Approving locks the period.', acts: [['Open the timesheet', 'tl']], x: { who: t, view: 'sheet', per: 'prev' } }); });
    else if(staffForTech(me) && staffForTech(me).role === 'Technician'){ const s = sign()[me + '|' + pv[0]]; if(!s && allDays(me).some(k => k >= pv[0] && k <= pv[2])) L.push({ key: 'tss:' + pv[0], from: 'Parsec', k: 'rem', src: 'timelog', at: isoAt(addD(pv[2], 1), 7 * 60), t: `Sign your timesheet — ${pv[1]}`, b: `Due ${short(addD(pv[2], 5))}.`, acts: [['Open the timesheet', 'tl']], x: { who: me, view: 'sheet', per: 'prev' } }); }
    return L; });
  PG.reg('timelog', { H, TK, U: () => U, input, change, fieldKey, keydown, after });
  /* Parsec 15: the RO page asks through here when someone must ask to delete their own entry */
  function askDel(pid){ const f = findP(pid); if(!f || f.p.e == null) return false; if(isLocked(f.t, f.k)){ pushToast('Locked — that period was approved.'); return true; } return ask(f.t, f.k, 'del', { pid, fk: 'del|' + pid }, '', `Delete ${cap(nmP(f.p))} ${hm(f.p.s)}–${hm(f.p.e)}`); }
  const mustAskFor = t => mustAsk(t);
  return { view, U: () => U, calc, flush, dayOf, PER, groups, isLocked, askDel, mustAskFor };
