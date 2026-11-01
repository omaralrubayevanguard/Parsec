/* Parsec · pages/timelog · fixes.js
   The fixes in one place (14.6): ACT (every fix action), runFix, ask (a request to the foreman), the reasons, drag to change a time.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   runFix ask limits dragTo finishDrag commitDrag nudge note cap nmP ACT FXWHY … (8 functions, 7 constants)
   state      punches
   uses       access/ clock/ data/ pages/ pages/inbox/ ro/ settings/ state/
*/
  /* ---------- Parsec 14.6: the fixes, in one place — Fix these, the pop-overs, the crew bar and approved asks all run these ---------- */
  const cap = x => x.charAt(0).toUpperCase() + x.slice(1), nmP = q => q.ro === 'SHOP' ? 'shop time' : q.ro;
  const ACT = {
    out: (t, k, a, why) => { const c = calc(t, k), sh = shiftsOf(t, k).filter(s => !s.out).pop(); if(!c || !sh) return { err: 'That day clock is already closed.' }; if(a.m == null) return { err: 'Type a time like 15:45.' };
      if(a.m <= mOf(sh.in, k)) return { err: 'That’s before the clock in.' }; if(k === TODAY && a.m > NOW) return { err: 'That’s later than now.' };
      sh.out = isoAt(k, a.m); sh.outReason = 'End of day'; sh.fixed = { by: ME().name, at: nowIso(), why: why || '' }; return `Clocked out at ${hm(a.m)} on ${short(k)} — the day is ${dur(a.m - c.D.sh[0][0] - c.lunchM)}`; },
    over: (t, k, a, why) => { const c = calc(t, k), f = c && c.fixes.find(x => x.k === 'over' && x.a === a.fa); if(!f) return { err: 'Those punches don’t overlap any more.' }; const A = findP(f.a), B = findP(f.b); if(!A || !B) return { err: 'Those punches changed — try again.' };
      if(a.o === 0) setTimes(A.raw, k, null, B.p.s, why); else if(a.o === 1) setTimes(B.raw, k, A.p.e == null ? NOW : A.p.e, null, why); else { const mid = Math.round((f.from + f.to) / 2); setTimes(A.raw, k, null, mid, why); setTimes(B.raw, k, mid, null, why); }
      return a.o === 2 ? `Overlap split at ${hm(Math.round((f.from + f.to) / 2))}` : 'Overlap fixed'; },
    inmv: (t, k, a, why) => { const sh = shiftsOf(t, k)[0]; if(!sh) return { err: 'No clock in that day.' }; if(a.m == null || a.m >= mOf(sh.in, k)) return { err: 'That’s not before the clock in.' };
      if(!sh.edited){ sh.edited = true; sh.originalIn = sh.in; } const was = mOf(sh.in, k); sh.in = isoAt(k, a.m); sh.editedAt = nowIso(); sh.editBy = ME().name; sh.editWhy = why || ''; return `Clocked in at ${hm(a.m)} — was ${hm(was)}`; },
    trimin: (t, k, a, why) => { const P = findP(a.fa), c = calc(t, k); if(!P || !c || !c.segs.length) return { err: 'That punch changed — try again.' }; const s0 = c.segs[0][0];
      if(P.p.e != null && P.p.e - s0 < 5) return { err: 'That leaves under 5 min — move the clock-in instead.' }; setTimes(P.raw, k, s0, null, why); return `${cap(nmP(P.p))} starts at the clock-in, ${hm(s0)}`; },
    outmv: (t, k, a, why) => { const sh = shiftsOf(t, k).filter(s => s.out).pop(); if(!sh || a.m == null) return { err: 'No clock out that day.' }; if(!sh.originalOut) sh.originalOut = sh.out;
      sh.out = isoAt(k, a.m); sh.fixed = { by: ME().name, at: nowIso(), why: why || '' }; return `Clocked out at ${hm(a.m)}`; },
    trimout: (t, k, a, why) => { const P = findP(a.fa), c = calc(t, k); if(!P || !c) return { err: 'That punch changed — try again.' }; const e0 = c.segs[c.segs.length - 1][1];
      if(e0 - P.p.s < 5) return { err: 'That leaves under 5 min — move the clock-out instead.' }; setTimes(P.raw, k, null, e0, why); return `${cap(nmP(P.p))} stops at the clock-out, ${hm(e0)}`; },
    lunch: (t, k, a, why) => { const at = a.m, en = a.b != null ? a.b : at + 30; if(at == null || en <= at) return { err: 'Type times like 12:00.' };
      const sh = shiftsOf(t, k).find(s => { const x = mOf(s.in, k), y = s.out ? mOf(s.out, k) : (k === TODAY ? NOW : 1440); return x <= at && en <= y; }); if(!sh) return { err: `Not on the clock ${hm(at)}–${hm(en)}` };
      shiftList().push({ id: uid('sh'), in: isoAt(k, en), out: sh.out, outReason: sh.outReason || null, by: sh.by || t, fixed: { by: ME().name, at: nowIso(), why: why || '' } }); sh.out = isoAt(k, at); sh.outReason = 'Lunch';
      return `Lunch ${hm(at)}–${hm(en)} — off the clock`; },
    lunchok: (t, k) => { ok()['lunch|' + t + '|' + k] = nowIso(); return 'Okay — no lunch that day'; },
    times: (t, k, a, why) => { const P = findP(a.pid); if(!P) return { err: 'That punch is gone.' }; setTimes(P.raw, k, a.s, a.e, why); if(a.er && P.raw.stop && !P.raw.stopReason) P.raw.stopReason = a.er; return `${cap(nmP(P.p))} · ${hm(a.s)}–${a.e == null ? 'now' : hm(a.e)}`; },
    shin: (t, k, a, why) => { const sh = shiftList().find(q => q.id === a.sid); const r = rcShiftIn(sh, new Date(isoAt(k, a.m)).getTime(), { by: ME().name, why, noUndo: true }); return r.ok ? `Clocked in at ${hm(a.m)}` : { err: r.msg }; },
    fill: (t, k, a, why) => { const shp = a.ro === SHOP_RO_ID; STATE.punches.push({ id: uid('pn'), roId: a.ro, opId: a.op, start: isoAt(k, a.from), stop: isoAt(k, a.to), startReason: shp ? 'Shop time' : 'Repairing', stopReason: 'Switched job', notes: '', manual: true, addedByHand: true, by: t, editBy: ME().name, editWhy: why || '' });
      if(!shp){ const ro = getRO(a.ro), op = ro && ro.operations.find(o => o.id === a.op); if(op && typeof op.burnt === 'number') op.burnt = Math.round((op.burnt + (a.to - a.from) / 60) * 100) / 100; } return `${dur(a.to - a.from)} added to ${shp ? 'shop time' : roTag(getRO(a.ro))}`; },
    del: (t, k, a) => { const P = findP(a.pid); if(!P) return { err: 'That entry is gone already.' }; const lbl = `${cap(nmP(P.p))} ${hm(P.p.s)}–${hm(P.p.e2 != null ? P.p.e2 : P.p.e)}`;
      if(typeof v150PunchGone !== 'function' || !v150PunchGone(P.raw)) return { err: 'Couldn’t delete it.' }; return `Deleted ${lbl} — it counts as air now`; },   /* Parsec 15 */
    split: (t, k, a, why) => { const P = findP(a.pid); if(!P || P.p.e == null) return { err: 'Pick a stopped punch.' }; const m = a.m; if(m == null || m < P.p.s + 5 || m > P.p.e - 5) return { err: `Split between ${hm(P.p.s + 5)} and ${hm(P.p.e - 5)}.` };
      const raw = P.raw, ro = a.ro || raw.roId, op = a.op || raw.opId, same = ro === raw.roId && op === raw.opId, e0 = raw.stop, er0 = raw.stopReason, os = raw.originalStart || raw.start, oe = raw.originalStop || raw.stop;
      setTimes(raw, k, null, m, why); if(!same) raw.stopReason = 'Switched job';
      STATE.punches.push({ id: uid('pn'), roId: ro, opId: op, start: isoAt(k, m), stop: e0, startReason: ro === SHOP_RO_ID ? 'Shop time' : same ? raw.startReason : 'Switched job', stopReason: er0 || 'Switched job', notes: '', by: punchWho(raw), edited: true, originalStart: os, originalStop: oe, editedAt: nowIso(), editBy: ME().name, editWhy: why || '', splitFrom: raw.id, burntCredited: raw.burntCredited });
      try{ syncAllBurnt(); }catch(e){} const to = same ? 'two punches' : ro === SHOP_RO_ID ? 'the rest to shop time' : 'the rest to ' + roTag(getRO(ro)); return `Split at ${hm(m)} — ${to}`; },
    merge: (t, k, a, why) => { const A = findP(a.pid), B = findP(a.nid); if(!A || !B) return { err: 'Those punches changed — try again.' }; const ra = A.raw, rb = B.raw;
      mark(ra, why); ra.stop = rb.stop; ra.stopReason = rb.stopReason || ra.stopReason; const nt = [ra.notes, rb.notes].map(x => String(x || '').trim()).filter(Boolean); ra.notes = nt.filter((x, i) => nt.indexOf(x) === i).join('\n');
      const i = STATE.punches.indexOf(rb); if(i > -1) STATE.punches.splice(i, 1); try{ syncAllBurnt(); }catch(e){} U.sel = ra.id; return `Merged — ${nmP(A.p)} ${hm(A.p.s)}–${hm(B.p.e)} is one punch`; }
  };
  function runFix(t, k, x, a, why, label){ if(!t || t === 'ALL' || !ACT[x]) return false; if(isLocked(t, k)){ pushToast('Locked — that period was approved. ' + (role() === 'foreman' ? 'Reopen it on the timesheet to change it.' : 'Ask ' + PG.first(lead()) + ' to reopen it.')); return false; }
    if(mustAsk(t)) return ask(t, k, x, a, why, label);
    if(!mayFix(t)){ permT(); return false; }
    pushUndo('fix the time'); const r = ACT[x](t, k, a || {}, why || ''); flush(); if(r && r.err){ pushToast(r.err); rd(); return false; }
    U.pop = null; scheduleSave(true); pushToast((r || 'Fixed') + (why ? ' · why: ' + why : '') + '.', true); rd(); return true; }
  function ask(t, k, x, a, why, label){ const dup = reqOpen(t, k).find(r => r.x === x && JSON.stringify(r.a) === JSON.stringify(a)); if(dup){ pushToast('Already asked — waiting for ' + PG.first(lead()) + '.'); return false; }
    pushUndo('ask for a time fix'); reqs().push({ id: uid('tq'), who: t, k, x, a, fk: (a && a.fk) || '', why: why || '', label: label || 'Time fix', by: ME().name, at: nowIso(), st: 'open' }); U.pop = null; scheduleSave(true);
    note(PG.person('Foreman') || PG.person('Manager'), 'ask', `${PG.first(t)} asks for a time fix — ${short(k)}`, (label || 'Time fix') + (why ? ' · ' + why : ''), { who: t, view: 'day', day: k });
    pushToast(`Sent to ${PG.first(lead())} — it changes when it’s approved.`, true); rd(); return true; }
  const FXWHY = { out: 'Forgot to clock out', outmv: 'Forgot to clock out', over: 'Forgot to stop the clock', inmv: 'Forgot to clock in', trimin: 'Forgot to clock in', trimout: 'Forgot to stop the clock', lunch: 'Forgot to clock out for lunch', lunchok: 'Worked through lunch' };
  /* the crew: one change for each person picked */
  const CREW = {
    out: (t, k, a, b, why) => { const c = calc(t, k); if(!c || !c.open) return { err: 'not on the clock' };
      const run = STATE.punches.filter(q => !q.stop && techSame(punchWho(q), t) && localDay(q.start) === k); if(run.some(q => mOf(q.start, k) >= a)) return { err: 'a job started after ' + hm(a) };
      run.forEach(q => { q.stop = isoAt(k, a); q.stopReason = 'End of day'; creditBurnt(q); }); return ACT.out(t, k, { m: a }, why); },
    lunch: (t, k, a, b, why) => { const c = calc(t, k); if(!c) return { err: 'not in' }; if(c.ps.some(q => q.s < b && q.e2 > a)) return { err: 'on a job then' }; return ACT.lunch(t, k, { m: a, b }, why); },
    shop: (t, k, a, b, why, p) => { const c = calc(t, k); if(!c) return { err: 'not in' }; return ACT.fill(t, k, { ro: SHOP_RO_ID, op: p.op, from: a, to: b }, why); }
  };
  function limits(k, pid, edge){
    const c = calc(U.who, k), p = c.ps.find(x => x.id === pid), ps = c.ps, i = ps.findIndex(x => x.id === pid), today = k === TODAY, pe = p.e == null ? NOW : p.e;
    const prev = ps.slice(0, i).filter(x => x.e2 <= p.s + 1).pop() || null, next = ps.slice(i + 1).find(x => x.s >= pe - 1) || null;
    const seg = c.segs.find(x => p.s >= x[0] - 1 && p.s <= (x[1] == null ? 1440 : x[1]) + 1) || c.segs[0] || [0, 1440, '', null];
    if(edge === 's'){ const lo1 = c.D.virt ? 0 : seg[0], lo2 = prev ? prev.e2 : -1e9, lo = Math.max(lo1, lo2); return { lo, hi: pe - 5, loWhy: prev && lo2 >= lo1 ? { k: 'meet', p: prev } : { k: 'in', t: lo1 }, hiWhy: { k: 'min' } }; }
    const segEnd = c.D.virt ? (today ? NOW : 1440) : seg[3] == null ? (today ? NOW : (seg[1] == null ? 1440 : seg[1])) : seg[3], hi2 = next ? next.s : 1e9, hi = Math.min(segEnd, hi2);
    return { lo: p.s + 5, hi, loWhy: { k: 'min' }, hiWhy: next && hi2 <= segEnd ? { k: 'meet', p: next } : { k: seg[3] == null && today ? 'now' : 'out', t: segEnd, why: seg[2] } };
  }
  function dragTo(m){ const d = U.drag; d.v = null; flush(); const L = limits(U.day, d.pid, d.edge);
    let v = Math.round(m / U.snap) * U.snap, hit = null;
    if(Math.abs(m - L.hi) <= 3) v = L.hi; if(Math.abs(m - L.lo) <= 3) v = L.lo;
    if(v >= L.hi){ v = L.hi; hit = L.hiWhy; } else if(v <= L.lo){ v = L.lo; hit = L.loWhy; }
    d.v = v; d.hit = hit; flush(); }
  function finishDrag(){ const d = U.drag; if(!d) return; const f = findP(d.pid); if(!f || d.v == null){ U.drag = null; rd(); return; }
    const o = d.edge === 'e' ? d.orig.e : d.orig.s, n = d.v;
    if(o === n){ U.drag = null; rd(); return; }
    d.pending = true; U.pop = { type: 'why', pid: d.pid, edge: d.edge, o, n }; const el = document.querySelector(`[data-pg="timelog"] .tk-tl .tk-b[data-p="${d.pid}"]`); PG.anchor(U, el); rd(); }   /* Parsec 14.6: a reason on every change */
  function commitDrag(why){ const d = U.drag, f = findP(d.pid); U.drag = null; if(!f) return rd();
    pushUndo('edit punch'); setTimes(f.raw, f.k, d.edge === 's' ? d.v : null, d.edge === 'e' ? d.v : null, why); scheduleSave(true); flush();
    const x = findP(d.pid).p; pushToast(`${x.ro === 'SHOP' ? 'Shop time' : x.ro} · ${d.edge === 'e' ? 'stop' : 'start'} ${hm(d.edge === 'e' ? d.orig.e : d.orig.s)} → ${hm(d.v)} · ${dur((x.e == null ? NOW : x.e) - x.s)} long${why ? (otherT() ? ' · ' + PG.first(f.t) + ' sees why' : ' · why: ' + why) : ''}`, true); rd(); }
  let NT = 0;
  /* Parsec 14.6: Alt ← → moves the edge like a drag; Enter asks why and saves, Esc puts it back */
  function nudge(edge, dv){ if(mustAsk(U.who)){ pushToast('Press E and send the change to ' + PG.first(lead()) + '.'); return; } if(locked()) return;
    const f = U.sel && findP(U.sel); if(!f || (edge === 'e' && f.p.e == null)) return;
    let d = U.drag; if(!d || d.pid !== f.p.id || d.edge !== edge || d.pending){ if(d && d.v != null && !d.pending) return finishDrag(); d = U.drag = { pid: f.p.id, edge, orig: { s: f.p.s, e: f.p.e }, v: null, nud: 1 }; }
    const L = limits(U.day, f.p.id, edge), cur = d.v != null ? d.v : (edge === 'e' ? d.orig.e : d.orig.s), v = Math.max(L.lo, Math.min(L.hi, cur + dv));
    if(v === cur){ pushToast(`The ${edge === 'e' ? 'stop' : 'start'} can’t move further that way.`); return; }
    NT = Date.now(); d.v = v; d.hit = v >= L.hi ? L.hiWhy : v <= L.lo ? L.loWhy : null; U.kh = false; flush(); rd(); }
  function note(to, k, t, b, x){ if(typeof IB === 'undefined' || !to) return; IB.send({ to, k, src: 'timelog', t, b: b || '', acts: [['Open the timesheet', 'tl']], x: x || null }); }
  const H = {
    day: t => { U.day = t.dataset.k; U.sel = null; U.kb = false; U.pop = null; if(U.view !== 'day' && U.view !== 'week') U.view = 'day'; rd(); },
    wday: t => { U.day = t.dataset.k; U.view = 'day'; U.sel = null; rd(); },
    view: t => { U.view = t.dataset.v; U.pop = null; if(U.who === 'ALL' && U.view !== 'shop') U.who = techs()[0] || null; rd(); },
    pop: t => { const p = U.pop, ty = t.dataset.p; if(p && p.type === ty && !t.dataset.pid && (p.mode || '') === (t.dataset.m || '')){ U.pop = null; rd(); return; }
      if(['edit', 'fix', 'air', 'shin', 'split'].includes(ty) && locked(true)) return;
      const ex = { type: ty }; if(t.dataset.pid) ex.pid = t.dataset.pid; if(t.dataset.sid) ex.sid = t.dataset.sid; if(t.dataset.f) ex.f = t.dataset.f; if(t.dataset.fa) ex.fa = t.dataset.fa; if(t.dataset.o != null) ex.o = +t.dataset.o; if(t.dataset.from){ ex.from = +t.dataset.from; ex.to = +t.dataset.to; }
      if(!otherT()){ if(ty === 'shin') ex.why = 'Forgot to clock in'; if(ty === 'fix') ex.why = ex.f === 'noout' ? 'Forgot to clock out' : 'Forgot to stop the clock'; }   /* Parsec 14.6: your own time — the obvious reason picked; someone else's — you pick it */
      if(ty === 'airwhy'){ if(isLocked(U.who, U.day) || !airOk(U.who)) return; const cur = airFor(U.who, U.day, ex.from, ex.to); if(cur){ ex.why = cur.why; ex.whyO = AIRWHY.indexOf(cur.why) < 0 ? 1 : 0; } }   /* Parsec 15 */
      if(ty === 'crew'){ if(!crewList().length) return; ex.mode = t.dataset.m; const se = shiftEndOf(crewList()[0]); ex.a = ex.mode === 'out' ? hm(U.day === TODAY ? Math.min(NOW, se) : se) : ex.mode === 'lunch' ? '12:00' : '07:00'; ex.b = ex.mode === 'lunch' ? '12:30' : '07:30'; ex.why = ex.mode === 'out' ? 'Forgot to clock out' : ex.mode === 'lunch' ? 'Forgot to clock out for lunch' : ''; }
      U.pop = ex; PG.anchor(U, t); rd(); },
    popx: () => { if(U.drag && U.drag.pending) U.drag = null; U.pop = null; rd(); },
    open: t => { U.open[t.dataset.k] = !U.open[t.dataset.k]; rd(); },
    tofix: () => { const G = groups(); if(G.fix.length){ U.day = G.fix[0]; U.view = 'day'; U.sel = null; rd(); } },
    who: t => { const w = t.dataset.t; U.pop = null; if(w === 'ALL'){ U.who = 'ALL'; U.view = 'shop'; } else { U.who = w; if(U.view === 'shop') U.view = 'day'; if(!dayOf(w, U.day)){ const L = allDays(w); U.day = L.indexOf(TODAY) > -1 || !L.length ? TODAY : L[0]; } } U.sel = null; rd(); },
    psel: t => { U.sel = t.dataset.p; rd(); },
    dnav: t => { const dv = +t.dataset.d; if(U.view === 'day'){ const L = days().slice().reverse(); let i = L.indexOf(U.day); if(i < 0){ U.day = addD(U.day, dv); } else { i += dv; if(i >= 0 && i < L.length) U.day = L[i]; else if(dv > 0 && U.day < TODAY) U.day = TODAY; } }
      else { const k = addD(U.day, dv); if(k <= TODAY) U.day = k; } U.sel = null; rd(); },
    wnav: t => { const k = addD(U.day, +t.dataset.d); if(k <= TODAY){ U.day = k > TODAY ? TODAY : k; rd(); } },
    pset: t => { U.pop[t.dataset.f] = t.dataset.v; if(t.dataset.f === 'why') U.pop.whyO = 0; rd(); },
    whyo: () => { const p = U.pop; if(!p) return; p.whyO = 1; if(WHYS().concat(AIRWHY).indexOf(p.why) > -1) p.why = ''; rd(); setTimeout(() => { const i = document.querySelector('[data-pg="timelog"] .tg-pop .tk-whyo'); if(i) i.focus(); }, 20); },
    /* Parsec 14.6: Fix these, the asks, split / merge, the crew, signing with a note */
    fxdo: t => { const d = t.dataset, a = {}; if(d.m != null) a.m = +d.m; if(d.fa) a.fa = d.fa; if(d.o != null) a.o = +d.o; if(d.fk) a.fk = d.fk; runFix(U.who, d.k, d.x, a, FXWHY[d.x] || '', d.l || t.textContent.trim() + ' · ' + short(d.k)); },
    fxfold: () => { U.fxShut = !U.fxShut; rd(); },
    fxall: () => { U.fxAll = !U.fxAll; rd(); },
    rqok: t => { const r = reqs().find(q => q.id === t.dataset.id); if(!r || r.st !== 'open') return; if(!mayFix(r.who) || isMine(r.who)){ permT(); return; } if(isLocked(r.who, r.k)){ pushToast('Locked — reopen the period first.'); return; }
      pushUndo('approve a time fix'); const m = ACT[r.x](r.who, r.k, r.a || {}, r.why); flush(); if(m && m.err){ pushToast(m.err); rd(); return; }
      r.st = 'ok'; r.doneBy = ME().name; r.doneAt = nowIso(); scheduleSave(true); note(r.who, 'fyi', `Your time fix is approved — ${short(r.k)}`, r.label, { who: r.who, view: 'day', day: r.k }); pushToast(`Approved — ${r.label}.`, true); rd(); },
    rqno: t => { const r = reqs().find(q => q.id === t.dataset.id); if(!r || r.st !== 'open') return; pushUndo('decline a time fix'); r.st = 'no'; r.doneBy = ME().name; r.doneAt = nowIso(); scheduleSave(true);
      note(r.who, 'fyi', `Your time fix was declined — ${short(r.k)}`, r.label + ' · talk to ' + PG.first(ME().name), { who: r.who, view: 'day', day: r.k }); pushToast('Declined — ' + PG.first(r.who) + ' is told.', true); rd(); },
    rqback: t => { const r = reqs().find(q => q.id === t.dataset.id); if(!r || r.st !== 'open') return; pushUndo('take back an ask'); r.st = 'back'; scheduleSave(true); pushToast('Taken back.', true); rd(); },
    merge: t => { const f = findP(t.dataset.pid); if(!f) return; const n = nextSame(f); if(!n) return; runFix(f.t, f.k, 'merge', { pid: f.p.id, nid: n.id }, 'Same job — merged', `${cap(nmP(f.p))} ${hm(f.p.s)}–${hm(n.e)} as one punch`); },
    splitgo: () => { const p = U.pop, f = p && findP(p.pid); if(!f || needWhy(p)) return; const mid = Math.round((f.p.s + f.p.e) / 2), m = pm(p.v != null ? p.v : hm(mid), mid);
      runFix(f.t, f.k, 'split', { pid: f.p.id, m, ro: p.ro || f.raw.roId, op: p.op || f.raw.opId }, String(p.why).trim(), `Split ${nmP(f.p)} at ${m == null ? '?' : hm(m)}`); },
    crew: t => { U.crew = U.crew || {}; const n = t.dataset.t; U.crew[n] = !U.crew[n]; if(U.pop && U.pop.type === 'crew' && !crewList().length) U.pop = null; rd(); },
    crewall: () => { U.crew = U.crew || {}; const T = techs(), all = T.every(t => U.crew[t]); T.forEach(t => { U.crew[t] = !all; }); if(all) U.pop = null; rd(); },
    crewgo: () => { const p = U.pop, N = crewList(), k = U.day; if(!p || !N.length || needWhy(p)) return; const a = pm(p.a), b = pm(p.b, a);
      if(a == null || (p.mode !== 'out' && (b == null || b <= a))){ pushToast('Type times like 12:00.'); return; } if(p.mode === 'shop' && !p.op) return; if(N.some(t => !mayFix(t))){ permT(); return; }
      pushUndo('fix the crew'); let n = 0; const skip = [], why = String(p.why).trim();
      N.forEach(t => { if(isLocked(t, k)){ skip.push(PG.first(t) + ' (locked)'); return; } const r = CREW[p.mode](t, k, a, b, why, p); flush(); if(r && r.err) skip.push(PG.first(t) + ' (' + r.err + ')'); else n++; });
      U.pop = null; if(n) U.crew = {}; scheduleSave(true); pushToast(`${n ? 'Done for ' + n : 'Nothing changed'}${skip.length ? ' · skipped ' + skip.join(', ') : ''}.`, true); rd(); },
    tsignn: () => { const p = U.pop, txt = String((p && p.n) || '').trim(); if(!txt) return; const P = PER(U.per); pushUndo('sign timesheet'); sign()[sgK()] = { tech: stamp(), techAt: nowIso(), note: txt }; U.pop = null; scheduleSave(true);
      note(PG.person('Foreman') || PG.person('Manager'), 'ask', `${PG.first(sgT())} signed the timesheet with a note — ${P[1]}`, txt, { who: sgT(), view: 'sheet', per: U.per });
      pushToast(`Signed with your note — ${P[1]} goes to ${PG.first(lead())} to approve.`, true); rd(); },
    psave: () => { const p = U.pop, f = findP(p.pid); if(!f) return;
      const run = f.p.e == null, s = pm(p.s != null ? p.s : hm(f.p.s), f.p.s); let en = run && !(p.e || '').trim() ? null : pm(p.e != null ? p.e : hm(f.p.e), f.p.e);
      if(run && en != null && s != null && en <= s && f.k < TODAY) en += 1440;   /* Parsec 12.7: a clock left running past midnight */
      if(s == null || (f.p.e != null && en == null) || (en != null && en <= s)){ pushToast('Stop has to come after start — type times like 13:45.'); return; }
      if(en == null && s > NOW && f.k === TODAY){ pushToast('A running punch can’t start in the future.'); return; }
      if(run && en != null && new Date(isoAt(f.k, en)).getTime() > Date.now() + 30000){ pushToast('A stop time can’t be in the future.'); return; }
      if(run && en != null && !p.er){ pushToast('Pick why it stopped — under Stopped as.'); const r0 = document.querySelector('[data-pg="timelog"] .tg-pop .tk-stopas'); if(r0){ r0.hidden = false; r0.classList.add('ask'); } return; }
      const mvTo = run && p.mop && (p.mop !== f.raw.opId || p.mro !== f.raw.roId) ? { ro: p.mro, op: p.mop } : null, by = { by: ME().name, why: p.why };
      const tch = s !== f.p.s || (en != null && en !== f.p.e);   /* Parsec 14.6: a reason when a time or the job changes */
      if(run && en != null && s === f.p.s && needWhy(p)) p.why = 'Forgot to stop the clock';   /* stopping it at the time it really stopped says why by itself */
      if(mvTo && !tch && needWhy(p)) p.why = 'Wrong job or RO';   /* and so does moving the running clock to the right job */
      if((tch || mvTo) && needWhy(p)){ pushToast('Pick why — under Why the change?'); const w0 = document.querySelector('[data-pg="timelog"] .tg-pop .tk-why'); if(w0) w0.classList.add('ask'); return; }
      if(mustAsk(f.t)){ const nt = p.n != null && p.n !== (f.raw.notes || ''); if(nt){ pushUndo('work note'); f.raw.notes = p.n; scheduleSave(true); }
        if(mvTo){ pushToast('Moving the clock to another job needs ' + PG.first(lead()) + ' — ask in person, or stop it and start the right one.'); return; }
        if(tch){ ask(f.t, f.k, 'times', { pid: f.p.id, s, e: en, er: run && en != null ? p.er || 'Switched job' : undefined, fk: 'times|' + f.p.id }, String(p.why).trim(), `${cap(nmP(f.p))} ${hm(s)}–${en == null ? 'now' : hm(en)} instead of ${hm(f.p.s)}–${run ? 'now' : hm(f.p.e)}`); return; }
        U.pop = null; if(nt) pushToast('Note saved.', true); rd(); return; }
      if(mvTo){ const ck = rcMove(f.raw, mvTo.ro, mvTo.op, { check: true }); if(!ck.ok){ pushToast(ck.msg); return; } }
      pushUndo('edit punch'); const raw = f.raw; let mv = null, gap = '';
      if(mvTo) mv = rcMove(raw, mvTo.ro, mvTo.op, Object.assign({ noUndo: true }, by));
      if(tch) setTimes(raw, f.k, s, en, String(p.why || '').trim());
      if(p.sr && !(mv && mv.ok && (mvTo.ro === SHOP_RO_ID))) raw.startReason = p.sr;
      if(run && en != null){ let er = p.er; const op = getOp(raw.roId, raw.opId); if(/^Complete/.test(er) && op && typeof opCompleteGaps === 'function'){ const g = opCompleteGaps(op); if(g.length){ er = 'Hold Tech'; gap = ' Not complete yet — ' + g.map(x => x.t).join(' · ') + ', so it stopped as Hold Tech.'; } } raw.stopReason = er; }
      else if(p.er && raw.stop) raw.stopReason = p.er;
      if(p.n != null) raw.notes = p.n;
      if((tch || mvTo) && p.why){ raw.editBy = ME().name; raw.editWhy = String(p.why).trim(); if(!raw.edited){ raw.edited = true; raw.originalStart = raw.start; raw.originalStop = raw.stop; } }
      U.pop = null; scheduleSave(true); const lbl = mv && mv.ok ? mv.label : (f.p.ro === 'SHOP' ? 'Shop time' : f.p.ro);
      pushToast(`${lbl} · ${hm(s)}–${en == null ? 'now' : hm(en)}${run && en != null ? ' · stopped as ' + raw.stopReason : ''}${mv && mv.ok ? ' · moved from ' + (f.p.ro === 'SHOP' ? 'shop time' : f.p.ro) : ''} saved.${gap}`, true); rd(); },
    pmvo: () => { if(!U.pop) return; U.pop.mvOpen = !U.pop.mvOpen; rd(); },
    pmvs: t => { const p = U.pop, f = p && findP(p.pid); if(!f) return; if(t.dataset.op === f.raw.opId && t.dataset.ro === f.raw.roId){ delete p.mro; delete p.mop; } else { p.mro = t.dataset.ro; p.mop = t.dataset.op; } p.mvOpen = false; rd(); },
    shgo: () => { const p = U.pop, sh = p && shiftList().find(q => q.id === p.sid); if(!sh || needWhy(p)) return; const k = localDay(sh.in), m = pm(p.v != null ? p.v : hm(mOf(sh.in, k)), mOf(sh.in, k));
      if(m == null){ pushToast('Type a time like 07:00.'); return; }
      if(mustAsk(U.who)){ if(m !== mOf(sh.in, k)) ask(U.who, k, 'shin', { sid: sh.id, m, fk: 'shin|' + sh.id }, String(p.why).trim(), `Clock-in ${hm(m)} instead of ${hm(mOf(sh.in, k))}`); return; }
      const r = rcShiftIn(sh, new Date(isoAt(k, m)).getTime(), { by: ME().name, why: String(p.why).trim() });
      if(!r.ok){ pushToast(r.msg); return; } U.pop = null;
      if(r.same){ rd(); return; } pushToast(`Clocked in at ${hm(m)}${r.was ? ' — was ' + hm(mOf(r.was, k)) : ''}${otherT() ? ' · ' + PG.first(U.who) + ' sees why' : ''}.`, true); rd(); },
    pdel: () => { const p = U.pop, f = findP(p.pid); if(!f) return; if(deletePunch(f.raw.id) === false) return; U.pop = null; U.sel = null; scheduleSave(true); pushToast(`Deleted ${f.p.ro === 'SHOP' ? 'shop time' : f.p.ro} ${hm(f.p.s)}–${hm(f.p.e)} — it counts as air now.`, true); rd(); },
    /* Parsec 15: the trash on each entry — one click, Undo in the toast; who must ask sends it as an ask */
    pdelq: t => { const f = findP(t.dataset.pid); if(!f || f.p.e == null) return; if(isLocked(f.t, f.k)){ pushToast('Locked — that period was approved. ' + (role() === 'foreman' ? 'Reopen it on the timesheet to change it.' : 'Ask ' + PG.first(lead()) + ' to reopen it.')); return; }
      const lbl = `${cap(nmP(f.p))} ${hm(f.p.s)}–${hm(f.p.e)}`;
      if(mustAsk(f.t)){ ask(f.t, f.k, 'del', { pid: f.p.id, fk: 'del|' + f.p.id }, '', 'Delete ' + lbl); return; }
      if(deletePunch(f.raw.id) === false) return; if(U.sel === f.p.id) U.sel = null; U.pop = null; scheduleSave(true); flush(); pushToast(`Deleted ${lbl} — it counts as air now.`, true); rd(); },
    awgo: () => { const p = U.pop; if(!p || p.type !== 'airwhy' || needWhy(p)) return; const t = U.who, k = U.day; if(isLocked(t, k) || !airOk(t)) return; const why = String(p.why).trim();
      pushUndo('air reason'); const A = airAll(), key = t + '|' + k, L = Array.isArray(A[key]) ? A[key] : (A[key] = []), cur = airFor(t, k, p.from, p.to);
      if(cur) Object.assign(cur, { from: p.from, to: p.to, why, by: ME().name || '', at: nowIso() }); else L.push({ id: uid('aw'), from: p.from, to: p.to, why, by: ME().name || '', at: nowIso() });
      U.pop = null; scheduleSave(true); flush(); pushToast(`Air ${hm(p.from)}–${hm(p.to)} · ${why}.`, true); rd(); },
    awclr: () => { const p = U.pop; if(!p) return; const t = U.who, k = U.day, A = airAll(), L = A[t + '|' + k], cur = airFor(t, k, p.from, p.to); if(!cur || !Array.isArray(L)) return; if(isLocked(t, k) || !airOk(t)) return;
      pushUndo('clear air reason'); L.splice(L.indexOf(cur), 1); U.pop = null; scheduleSave(true); flush(); pushToast('Reason cleared.', true); rd(); },
    fset: t => { U.pop.o = +t.dataset.o; rd(); if(U.pop.o === 2) setTimeout(() => { const i = document.querySelector('[data-pg="timelog"] [data-in="fo"]'); if(i) i.focus(); }, 20); },
    fgo: () => { const p = U.pop, c = calc(U.who, U.day), f = c && c.fixes.find(x => x.k === p.f && (p.f !== 'over' || !p.fa || x.a === p.fa)); if(!f || p.o == null || needWhy(p)) return;
      if(f.k === 'noout'){ const E = evid(U.who, U.day, c), v = p.o < E.length ? E[p.o].m : pm(p.t || ''); if(v == null){ pushToast('Type a time like 15:45.'); return; }
        runFix(U.who, U.day, 'out', { m: v, fk: 'noout|' }, String(p.why).trim(), `Clock out ${hm(v)} · ${short(U.day)}`); return; }
      const A = findP(f.a), Bp = findP(f.b); if(!A || !Bp) return;
      runFix(U.who, U.day, 'over', { fa: f.a, o: p.o, fk: 'over|' + f.a }, String(p.why).trim(), p.o === 0 ? `${cap(nmP(A.p))} ends ${hm(Bp.p.s)}` : p.o === 1 ? `${cap(nmP(Bp.p))} starts ${hm(A.p.e == null ? NOW : A.p.e)}` : `Split the overlap · ${short(U.day)}`); },
    aset: t => { U.pop.ro = t.dataset.ro; U.pop.op = t.dataset.op; rd(); },
    ago: () => { const p = U.pop; if(!p.op) return; runFix(U.who, U.day, 'fill', { ro: p.ro, op: p.op, from: p.from, to: p.to, fk: 'air|' + p.from }, 'Filled the air', `Fill ${hm(p.from)}–${hm(p.to)} with ${p.ro === SHOP_RO_ID ? 'shop time' : roTag(getRO(p.ro))}`); },
    airok: t => { if(locked()) return; pushUndo('keep air'); ok()['air|' + U.who + '|' + U.day + '|' + t.dataset.from] = nowIso(); scheduleSave(true); pushToast('Kept as air.', true); rd(); },
    lunchok: () => { runFix(U.who, U.day, 'lunchok', { fk: 'lunch|' }, 'Worked through lunch', 'Worked through lunch · ' + short(U.day)); },
    lunchadd: t => { const at = +t.dataset.at; runFix(U.who, U.day, 'lunch', { m: at, fk: 'lunch|' }, FXWHY.lunch, `Lunch ${hm(at)}–${hm(at + 30)} · ${short(U.day)}`); },
    snap: t => { U.snap = +t.dataset.v; rd(); },
    per: t => { U.per = t.dataset.v; U.pop = null; if(U.view !== 'sheet') U.view = 'sheet'; rd(); },
    tsign: () => { const P = PER(U.per); pushUndo('sign timesheet'); sign()[sgK()] = { tech: stamp(), techAt: nowIso() }; scheduleSave(true);
      note(PG.person('Foreman') || PG.person('Manager'), 'ask', `${PG.first(sgT())} signed the timesheet — ${P[1]}`, 'Approve it to lock the period.', { who: sgT(), view: 'sheet', per: U.per });
      pushToast(`Signed — ${P[1]} goes to ${PG.first(lead())} to approve.`, true); rd(); },
    tunsign: () => { pushUndo('unsign'); delete sign()[sgK()]; scheduleSave(true); pushToast('Signature taken back — you can change your time again.', true); rd(); },
    tapprove: () => { const s = sign()[sgK()]; if(!s || !permOk('t.approve')) return; pushUndo('approve timesheet'); s.fm = stamp(); s.fmAt = nowIso(); s.fmBy = ME().name; scheduleSave(true);
      note(sgT(), 'fyi', `Your timesheet is approved — ${PER(U.per)[1]}`, `${PG.first(ME().name)} approved it; the period is locked.`, { who: sgT(), view: 'sheet', per: U.per });
      pushToast(`Approved — ${PER(U.per)[1]} is locked for ${PG.first(sgT())}.`, true); rd(); },
    treopen: () => { if(!permOk('t.approve')) return; pushUndo('reopen timesheet'); delete sign()[sgK()]; scheduleSave(true); note(sgT(), 'ask', `Your timesheet was reopened — ${PER(U.per)[1]}`, `${PG.first(ME().name)} reopened it. Check it and sign again.`, { who: sgT(), view: 'sheet', per: U.per });
      pushToast(`Reopened — ${PG.first(sgT())} can change it, then signs again.`, true); rd(); },
    notesgo: () => { const n = missNotes(sgT(), perDays(U.per)).length; U.pop = null; scheduleSave(true); pushToast(n ? `${n} punch${n > 1 ? 'es' : ''} still without a note.` : 'Notes added — the timesheet is ready to sign.'); rd(); },
    clkout: () => { shiftClockOut('End of day'); flush(); },
    clkat: () => { const c = calc(ME().tech, TODAY); if(!c) return; const rp = runningPunch(), at = c.shEnd; shiftClockOut('End of day');
      const sh = shiftsOf(ME().tech, TODAY).filter(s => s.out).pop(); if(sh && mOf(sh.in, TODAY) < at){ sh.out = isoAt(TODAY, at); }
      if(rp && rp.stop && mOf(rp.start, TODAY) + 5 <= at){ if(!rp.edited){ rp.edited = true; rp.originalStart = rp.start; rp.originalStop = rp.stop; } rp.stop = isoAt(TODAY, at); rp.editedAt = nowIso(); }
      scheduleSave(true); flush(); pushToast(`Clocked out at ${hm(at)} — the minutes after don’t count. Marked edited.`, true); rd(); },
    remsnz: () => { U.snz = NOW + 30; pushToast(`OK — it asks again at ${hm(NOW + 30)}.`); rd(); },
    ot: () => { U.otAsk = true; note(PG.person('Foreman') || PG.person('Manager'), 'ask', `${PG.first(ME().name)} is staying on — overtime`, `Past the ${hm(shiftEndOf(ME().tech))} shift end. OK it, or tell them to clock out.`, { who: ME().tech, view: 'day' }); pushToast(`Marked overtime — ${PG.first(lead())} is asked to OK it.`); rd(); },
    trtbl: t => { U.trTbl = t.dataset.v === '1'; rd(); },
    wgo: () => { const p = U.pop; if(needWhy(p) || !U.drag) return; U.pop = null; commitDrag(String(p.why).trim()); },
    wcancel: () => { U.drag = null; U.pop = null; pushToast('Put back — nothing changed.'); rd(); },
    gofix: t => { U.view = 'day'; U.day = t.dataset.k; U.pop = null; flush(); const c = calc(U.who, U.day), f0 = c && (t.dataset.f ? c.fixes.find(x => x.k === t.dataset.f) : c.fixes[0]);
      if(f0 && (f0.k === 'noout' || f0.k === 'over')) U.pop = { type: 'fix', f: f0.k, fa: f0.a, why: otherT() ? '' : f0.k === 'noout' ? 'Forgot to clock out' : 'Forgot to stop the clock' }; rd(); },
    tsprint: () => { const n = perDays(U.per).filter(k => { const c = calc(sgT(), k); return c && c.fixes.length; }).length; if(n) pushToast(`${n} day${n > 1 ? 's' : ''} still need fixing — they print marked.`);
      PG.printPaper(document.querySelector('[data-pg="timelog"] .tk-paper'), 'Timesheet ' + PG.first(sgT()) + ' ' + PER(U.per)[0]); }
  };
