/* Parsec · pages/timelog · clock-rows.js
   The Time Log’s clock rows (17.5): click a clock in / out time to change it — typed, suggested times and a time wheel, a reason, trims the punches outside; drag the IN / OUT flags; the row’s ⋯ menu.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ceRange ceSugs shedPop shmPop ceSh ceAt ceMin ceGo pop0 (4 functions, 5 constants)
   state      punches
   uses       clock/ kit/ pages/ ro/ shell/ state/
   at load    on document pointerdown · on document pointermove · on document pointerup
*/
  /* ---------- Parsec 17.5: change a day clock's clock in or clock out — click its time, or drag its IN / OUT flag ----------
     The pop-over has the time (typed, ↑ ↓ to nudge), times Parsec suggests and a time wheel, a reason (always), and
     what happens to a punch the new time leaves outside the clock (trimmed in the same step). The row's ⋯ changes the
     time, adds a clock segment or deletes this one. Who may change it follows the punch permissions (runFix). */
  const ceSh = sid => shiftList().find(q => q.id === sid) || null;
  const ceAt = (k, m) => new Date(isoAt(k, m)).getTime();
  const ceMin = (ms, k) => mOf(new Date(ms).toISOString(), k);
  function ceRange(sh, edge, k){ const L = ceLimits(sh, edge); return [Math.max(0, ceMin(L.lo, k)), Math.min(1439, ceMin(L.hi, k))]; }
  function ceSugs(sh, edge, k){ const L = [], a = +new Date(sh.in), b = sh.out ? +new Date(sh.out) : Date.now(), R = ceRange(sh, edge, k), key = edge === 'in' ? 'originalIn' : 'originalOut';
    const ps = STATE.punches.filter(p => p && p.start && sameOwner(punchOwner(p), shiftOwner(sh)) && localDay(p.start) === k && +new Date(p.start) >= a - 60000 && +new Date(p.start) <= b + 60000);
    if(edge === 'in' && ps.length) L.push([Math.min(...ps.map(p => mOf(p.start, k))), 'First punch']);
    if(edge === 'out'){ const st = ps.filter(p => p.stop); if(st.length) L.push([Math.max(...st.map(p => mOf(p.stop, k))), 'Last punch stopped']); L.push([shiftEndOf(U.who), 'Shift end']); }
    if(sh[key]) L.push([mOf(sh[key], k), 'Before the change']);
    const seen = {}; return L.filter(x => x[0] != null && x[0] >= R[0] && x[0] <= R[1] && !seen[x[0]] && (seen[x[0]] = 1)); }
  function shedPop(p){ const sh = ceSh(p.sid); if(!sh || (p.edge === 'out' && !sh.out)) return ''; const edge = p.edge, k = localDay(sh.in), cur = mOf(sh[edge], k), v = p.v != null ? p.v : hm(cur), m = pm(v, cur);
    const C = m == null ? { ok: false, msg: 'Type a time like 07:00.' } : ceCheck(sh, edge, ceAt(k, m)), same = m === cur, R = ceRange(sh, edge, k), key = edge === 'in' ? 'originalIn' : 'originalOut';
    const hd = `<div class="tg-ph"><b>${edge === 'in' ? 'Clocked in' : 'Clocked out'}</b><span class="cu">${short(k)}</span><button class="btn btn-sm ib" data-a="popx">${ic('x', 14)}</button></div>`;
    const sg = ceSugs(sh, edge, k), H0 = Math.floor(R[0] / 60), H1 = Math.floor(R[1] / 60), hh = m != null ? Math.floor(m / 60) : null, mm = m != null ? m % 60 : null;
    const hrs = []; for(let h = H0; h <= H1; h++) hrs.push(h); const mins = []; for(let x = 0; x < 60; x += 5) mins.push(x); if(mm != null && mins.indexOf(mm) < 0){ mins.push(mm); mins.sort((a, b) => a - b); }
    const wheel = `<div class="tk-wh" aria-label="Time wheel"><div class="tk-whc">${hrs.map(h => `<button class="tk-whi${h === hh ? ' on' : ''}" data-a="shset" data-m="${h * 60 + (mm || 0)}">${p2(h)}</button>`).join('')}</div><i>:</i><div class="tk-whc">${mins.map(x => `<button class="tk-whi${x === mm ? ' on' : ''}" data-a="shset" data-m="${(hh != null ? hh : H0) * 60 + x}">${p2(x)}</button>`).join('')}</div></div>`;
    const trim = C.ok && !same && C.out.trim.length ? `<div class="tk-cetrim">${ic('flag', 12)}<span>${C.out.trim.map(x => esc(ceLbl(x.p)) + (x.f === 'start' ? ' starts ' + hm(mOf(x.p.start, k)) : ' runs to ' + hm(mOf(x.p.stop, k)))).join(' · ')} — Save trims ${C.out.trim.length > 1 ? 'them' : 'it'} to ${hm(m)}.</span></div>` : '';
    const err = !C.ok && !same ? `<div class="tk-ceerr">${esc(C.msg)}</div>` : '';
    const was = sh[key] ? `<div class="tk-was">${ic('history', 11)} Edited — was ${hm(mOf(sh[key], k))}${sh.editBy ? ' · ' + esc(PG.first(sh.editBy)) : ''}${sh.editWhy ? ' · ' + esc(sh.editWhy) : ''}</div>` : '';
    const dis = !C.ok || same || needWhy(p), tip = same ? 'Pick another time first' : !C.ok ? 'Pick a time that fits first' : 'Pick why first';
    const ask = mustAsk(U.who), lbl = ask ? 'Send to ' + esc(PG.first(lead())) : C.ok && !same && C.out.trim.length ? 'Trim and save' : 'Save';
    return `<div class="tg-pop xf tk-pop-w tk-ce">${hd}<div class="tk-cer"><div class="tk-cel"><label class="tk-f"><span>${edge === 'in' ? 'Clock in' : 'Clock out'}</span><input class="tk-tin" data-in="shed" value="${esc(v)}" data-cur="${cur}"></label>
      ${sg.length ? `<span class="tg-lbl top">Suggested</span><div class="tg-r tk-sug">${sg.map(x => `<button class="tg-chip${x[0] === m ? ' on' : ''}" data-a="shset" data-m="${x[0]}">${esc(x[1])} · ${hm(x[0])}</button>`).join('')}</div>` : ''}</div>${wheel}</div>
      ${tinHint()}${was}${trim}${err}${whyRow(p, U.who)}<div class="tg-acts"><span class="hint">${ask ? esc(PG.first(lead())) + ' approves time changes' : otherT() ? esc(TF(U.who)) + ' sees the reason on the day' : 'The time before and the reason show on the day'}</span><button class="btn btn-sm btn-primary" data-a="shedgo"${dis ? ` disabled data-tip="${tip}"` : ''}>${lbl}${kbd('↵')}</button></div></div>`; }
  function shmPop(p){ const sh = ceSh(p.sid); if(!sh) return ''; const k = localDay(sh.in), ask = mustAsk(U.who);
    return `<div class="tg-pop menu tk-pop-m"><button class="tg-mi" data-a="pop" data-p="shed" data-sid="${sh.id}" data-edge="${p.edge === 'out' && sh.out ? 'out' : 'in'}">${ic('clock', 14)}Change the time</button>${otherT() ? '' : `<button class="tg-mi" data-action="open-add-shift" data-day="${k}">${ic('plus', 14)}Add a clock segment…</button>`}${sh.out ? `<button class="tg-mi tk-mdel" data-a="shdel" data-sid="${sh.id}">${ic('trash', 14)}${ask ? 'Ask to delete this clock segment' : 'Delete this clock segment'}</button>` : ''}</div>`; }
  ACT.shed = (t, k, a, why) => { const sh = ceSh(a.sid); if(!sh) return { err: 'That day clock is gone.' }; const r = ceSet(sh, a.edge, ceAt(k, a.m), { by: ME().name, why, trim: true, noUndo: true });
    return r.ok ? `${a.edge === 'in' ? 'Clocked in' : 'Clocked out'} at ${hm(a.m)}${r.trimmed ? ' · ' + r.trimmed + ' punch' + (r.trimmed > 1 ? 'es' : '') + ' trimmed' : ''}` : { err: r.msg }; };
  ACT.shdel = (t, k, a) => { const sh = ceSh(a.sid); if(!sh) return { err: 'That clock segment is gone already.' }; const w = hm(mOf(sh.in, k)) + '–' + hm(mOf(sh.out, k)), r = ceDelete(sh, { by: ME().name, noUndo: true }); return r.ok ? 'Deleted the clock segment ' + w : { err: r.msg }; };
  const ceGo = (p, sh) => { const k = localDay(sh.in), cur = mOf(sh[p.edge], k), m = pm(p.v != null ? p.v : hm(cur), cur);
    if(m == null){ pushToast('Type a time like 07:00.'); return; } if(m === cur){ U.pop = null; rd(); return; }
    const C = ceCheck(sh, p.edge, ceAt(k, m)); if(!C.ok){ pushToast(C.msg); return; }
    runFix(U.who, k, 'shed', { sid: sh.id, edge: p.edge, m, fk: 'shed|' + sh.id + '|' + p.edge }, String(p.why).trim(), (p.edge === 'in' ? 'Clock in ' : 'Clock out ') + hm(m) + ' instead of ' + hm(cur)); };
  const pop0 = H.pop;
  Object.assign(H, {
    pop: t => { const ty = t.dataset.p; if((ty === 'shed' || ty === 'shm') && locked(true)) return;
      if(U.pop && U.pop.type === ty && (U.pop.sid !== t.dataset.sid || (t.dataset.edge && U.pop.edge !== t.dataset.edge))) U.pop = null;
      pop0(t); if(U.pop && U.pop.type === ty && t.dataset.edge){ U.pop.edge = t.dataset.edge; rd(); } },
    shset: t => { const p = U.pop; if(!p || p.type !== 'shed') return; p.v = hm(+t.dataset.m); rd(); },
    shedgo: () => { const p = U.pop, sh = p && ceSh(p.sid); if(!sh || needWhy(p)) return; ceGo(p, sh); },
    shdel: t => { const sh = ceSh(t.dataset.sid); if(!sh || !sh.out) return; const k = localDay(sh.in), w = hm(mOf(sh.in, k)) + '–' + hm(mOf(sh.out, k)); U.pop = null; rd();
      pgAsk({ head: 'Delete the clock segment ' + w + '?', sub: (otherT() ? TF(U.who) + '’s' : 'The') + ' punches in it stay, and show as off the clock until they’re moved. You can undo it.', buttons: [{ k: 'no', l: 'Cancel' }, { k: 'go', l: 'Delete it', pri: true }] },
        a => { if(a !== 'go') return; runFix(U.who, k, 'shdel', { sid: sh.id, fk: 'shdel|' + sh.id }, '', 'Delete the clock segment ' + w); }); }
  });
  /* drag an IN / OUT flag on the day bar: it snaps to 5 min, stays inside its limits, then the pop-over asks why */
  document.addEventListener('pointerdown', ev => { if(UI.view !== 'timelog') return; const f = ev.target.closest && ev.target.closest('[data-pg="timelog"] .tk-flag[data-cd]'); if(!f) return;
    ev.preventDefault(); ev.stopPropagation(); if(locked(true)) return; const sh = ceSh(f.dataset.sid); if(!sh) return; const k = localDay(sh.in), e = f.dataset.cd;
    U.cdrag = { sid: sh.id, edge: e, k, m: mOf(sh[e], k), m0: mOf(sh[e], k), R: ceRange(sh, e, k) }; U.pop = null; rd(); }, true);
  document.addEventListener('pointermove', ev => { const d = U.cdrag; if(UI.view !== 'timelog' || !d) return; const tr = document.querySelector('[data-pg="timelog"] .tk-tl .tk-trk'); if(!tr || !U.ab) return; const r = tr.getBoundingClientRect();
    let v = Math.round((U.ab[0] + (ev.clientX - r.left) / r.width * (U.ab[1] - U.ab[0])) / 5) * 5; v = Math.max(d.R[0], Math.min(d.R[1], v)); if(v === d.m) return; d.m = v; PG.keepScroll(render); });
  document.addEventListener('pointerup', () => { const d = U.cdrag; if(UI.view !== 'timelog' || !d) return; U.cdrag = null; if(d.m === d.m0){ rd(); return; }
    U.pop = { type: 'shed', sid: d.sid, edge: d.edge, v: hm(d.m) }; rd(); const el = document.querySelector(`[data-pg="timelog"] .tk-flag[data-sid="${d.sid}"][data-cd="${d.edge}"]`); if(el){ PG.anchor(U, el); rd(); } });
