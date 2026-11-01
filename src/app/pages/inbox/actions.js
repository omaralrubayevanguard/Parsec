/* Parsec · pages/inbox · actions.js
   Doing things in the Inbox: select, settle, finish, send back, go to the page an item points at; typing and keys.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   select nextAfter settle finish save done byKey goPage doAct sendBack input change … (16 functions, 3 constants)
   uses       access/ data/ pages/ pages/triage/ ro/ state/
*/
  /* ---------- doing things ---------- */
  function select(key){ U.sel = key; U.reply = ''; U._hold = false; }
  function nextAfter(key){ const L = flat(), i = L.findIndex(x => x.key === key); const nx = L[i + 1] || L[i - 1]; return nx ? nx.key : null; }
  function settle(key){ flush(); const L = flat(); if(!L.some(x => x.key === key)){ const nx = U._nx; U.sel = nx && L.some(x => x.key === nx) ? nx : L[0] ? L[0].key : null; } }
  function finish(n, how){ U._nx = nextAfter(U.sel); const st = stOf(n.key); st.done = nowIso(); st.how = how || ''; delete st.snz; U.pop = null; }
  function save(label){ pushUndo(label || 'inbox'); }
  function done(msgT){ scheduleSave(true); const k = U.sel; settle(k); if(msgT) pushToast(msgT, true); rd(); }
  function byKey(k){ return mine().find(x => x.key === k); }
  function goPage(v, roId){ if(v === 'console' && !navAllowed('console') && navAllowed('tech')) v = 'tech'; if(!navAllowed(v)){ pushToast('You don’t have that page.'); return; } if(roId){ UI.selectedRo = roId; if(v === 'triage') UI.tgSel = roId; if(v === 'parts') UI.ptRo = roId; if(v === 'foreman') UI.fmSel = roId; if(v === 'warranty') UI.wxRo = roId; } PG.go(v); }
  function doAct(n, x, el){
    const ro = n.ro && getRO(n.ro), no = ro ? tgNum(ro) : '', v = x[1], me = meName();
    if(v === 'snooze'){ U.pop = { type: 'snz' }; PG.anchor(U, el); rd(); return; }
    if(v === 'reply'){ const f = document.querySelector('[data-pg="inbox"] [data-in="reply"]'); if(f) f.focus(); return; }
    if(v === 'open'){ if(ro) PG.openRo(ro.id, n.op); else goPage((SRC[n.src] || SRC.inbox)[1]); return; }
    if(v === 'page'){ goPage((SRC[n.src] || SRC.inbox)[1], ro ? ro.id : null); return; }
    if(v === 'tl'){ if(n.x){ UI.tlWho = n.x.who || null; UI.tlView = n.x.view || null; UI.tlPer = n.x.per || null; if(n.x.day) UI.tlDay = n.x.day; } else if(n.at) UI.tlDay = localDay(n.at); PG.go('timelog'); return; }
    if(v === 'return'){ U.pop = { type: 'ret', key: n.key }; PG.anchor(U, el); rd(); return; }
    save(x[0]);
    if(v === 'accept'){ if(ro) rtAccept(ro); finish(n, 'accepted'); return done(x[2] || `${no} accepted — it’s with you now.`); }
    if(v === 'got'){ if(ro) rtAccept(ro); finish(n, 'got it back'); return done(x[2] || 'Okay — it’s yours again.'); }
    if(v === 'take'){ const k = deskOf(meRole()); if(ro && k && k !== 'admin') rtSend(ro, k, k === 'tech' ? me : '', 'Taken from the Inbox', null, { accept: false }); finish(n, 'taken'); return done(x[2] || `${no} is with you now.`); }
    if(v === 'pick'){ const who = U.pick[n.key]; if(!who || !ro) return; rtSend(ro, 'tech', who, 'From the Inbox', null, {}); finish(n, 'sent to ' + who); return done(`${no} sent to ${PG.first(who)} — Sent shows when ${PG.first(who)} accepts.`); }
    finish(n, x[0] === 'Done' ? '' : x[0]); done(x[2] || 'Done.');
  }
  function sendBack(n, why){ const ro = n.ro && getRO(n.ro); if(!ro || !why) return; save('send back'); rtReturn(ro, why); finish(n, 'sent back — ' + why); done(`${tgNum(ro)} sent back — ${why.toLowerCase()}.`); }
  const H = {
    view: t => { U.view = t.dataset.v; U.lf = 'all'; U.pop = null; U.bulk = false; U.bs = {}; U.sel = null; rd(); },
    lf: t => { U.view = 'in'; U.lf = U.lf === t.dataset.v && t.dataset.top ? 'all' : t.dataset.v; U.sel = null; rd(); },
    sel: t => { const id = t.dataset.id;
      if(U.bulk && !t.dataset.go && id !== 'SUM' && !id.startsWith('s:')){ U.bs[id] = !U.bs[id]; rd(); return; }
      if(t.dataset.go && t.dataset.n){ const m = byKey(t.dataset.n); if(m){ U.view = live(m) ? 'in' : m.st === 'snz' ? 'snz' : 'done'; U.lf = 'all'; } }
      select(id); U.kb = false; U.pop = null; rd(); },
    pop: t => { const p = t.dataset.p; if(U.pop && U.pop.type === p){ U.pop = null; rd(); return; } U.pop = { type: p }; if(p === 'away'){ const aw = store().away[meName()]; if(aw) U.pop.cover = aw.cover; }
      PG.anchor(U, t); rd(); if(p === 'srch') setTimeout(() => { const i = document.querySelector('[data-pg="inbox"] [data-in="q"]'); if(i) i.focus(); }, 20); },
    popx: () => { U.pop = null; rd(); },
    pick: t => { const k = t.dataset.id; U.pick[k] = U.pick[k] === t.dataset.t ? null : t.dataset.t; rd(); },
    act: t => { const n = byKey(t.dataset.id); if(!n) return; const x = actsOf(n)[+t.dataset.i]; if(x) doAct(n, x, t); },
    done1: t => { const n = byKey(t.dataset.id); if(!n) return; save('done'); const keep = U.sel; finish(n, ''); U.sel = keep; done('Done.'); },
    done: () => { const T = curT(); if(!T) return; save('done'); const L = T.I.filter(live); U._nx = nextAfter(T.key); L.forEach(n => { const st = stOf(n.key); st.done = nowIso(); st.how = ''; delete st.snz; }); U.pop = null;
      done(L.length > 1 ? `Done — all ${L.length}${T.prim.ro ? ' on ' + ROn(T.prim.ro) : ''}.` : 'Done — it’s in Done for a week.'); },
    snz: t => { const T = curT(); if(!T) return; const O = snzOpts(T); let z;
      if(t.dataset.e != null){ const x = O.E[+t.dataset.e]; const ro = getRO(T.prim.ro); let M = null; try{ M = roStages(ro); }catch(e){}
        z = { ev: x[1], at: nowIso(), t: x[2], stage: M && M.cur ? M.cur.k : 'done' }; }
      else { const x = O.L[+t.dataset.i]; z = { until: x[2], t: x[3] }; }
      save('snooze'); U._nx = nextAfter(T.key); T.I.filter(live).forEach(n => { stOf(n.key).snz = z; }); U.pop = null; done(`Snoozed ${z.t}.`); },
    back: t => { const n = byKey(t.dataset.id); if(!n) return; save('back'); const T = threads(mine()).find(x => x.key === tkey(n)); (T ? T.I : [n]).forEach(x => { if(x.st === n.st){ const st = stOf(x.key); delete st.done; delete st.snz; delete st.how; delete st.auto; st.read = st.read || nowIso(); } });
      U.view = 'in'; U.lf = 'all'; U.sel = tkey(n); scheduleSave(true); flush(); pushToast('Back in your inbox.', true); rd(); },
    send: () => { const v = U.reply.trim(), T = curT(); if(!v || !T) return; const n = T.prim, me = meName(); save('reply');
      send({ to: n.from, k: 'men', src: 'inbox', ro: n.ro, op: n.op, t: `${PG.first(me)} answered — ${n.t}`, q: v });
      const st = stOf(n.key); st.sent = (st.sent || []).concat([{ t: v, at: nowIso(), by: me }]);
      const brought = []; (v.match(/@([A-Za-z]+)/g) || []).forEach(m => { const nm = m.slice(1).toLowerCase(), sf = staffList().filter(x => PG.first(x.name).toLowerCase() === nm)[0]; if(sf && !techSame(sf.name, me) && !techSame(sf.name, n.from)){ brought.push(sf.name); send({ to: sf.name, k: 'men', src: 'inbox', ro: n.ro, op: n.op, t: `${PG.first(me)} brought you in — ${n.t}`, q: v }); } });
      U.reply = ''; scheduleSave(true); flush(); pushToast(brought.length ? `Sent to ${PG.first(n.from)} — and ${brought.map(PG.first).join(', ')} brought in.` : `Sent to ${PG.first(n.from)} — it lands in their inbox.`, true); rd(); },
    open: t => { const id = t.dataset.ro; if(id && getRO(id)) PG.openRo(id); },
    gopage: t => goPage(t.dataset.v),
    tlday: t => { UI.tlDay = t.dataset.d; PG.go('timelog'); },
    setv: t => { const me = meName(), s = store(); s.prefs[me] = Object.assign({}, s.prefs[me], { [t.dataset.k]: t.dataset.v }); scheduleSave(true); flush(); rd(); },
    sumx: () => { const s = store(); s.sumx = s.sumx || {}; s.sumx[meName()] = todayStr(); quiet(); U.sel = null; pushToast('Summary put away — it’s back tomorrow.'); rd(); },
    bulk: () => { U.bulk = !U.bulk; U.bs = {}; rd(); },
    bk: t => { const keys = Object.keys(U.bs).filter(k => U.bs[k]); if(!keys.length){ pushToast('Pick some first — click the rows.'); return; } save('inbox'); let n = 0, v = t.dataset.v;
      const L = flat(); keys.forEach(k => { const th = L.find(x => x.key === k); if(!th) return; th.I.filter(live).forEach(x => { n++; const st = stOf(x.key);
        if(v === 'done'){ st.done = nowIso(); st.how = ''; } else if(v === 'snz') st.snz = { until: at(7, 0, 1), t: 'until tomorrow, 7:00 am' }; else st.read = st.read || nowIso(); }); });
      U.bulk = false; U.bs = {}; done(v === 'done' ? `${n} done.` : v === 'snz' ? `${n} snoozed to tomorrow.` : `${n} marked read.`); },
    awu: t => { U.pop.until = t.dataset.v; rd(); },
    awc: t => { U.pop.cover = t.dataset.t; rd(); },
    awayon: () => { const me = meName(), s = store(), p = U.pop || {}, cover = p.cover || (s.away[me] || {}).cover || backupOf(me); if(!cover) return;
      const un = p.until || 'tmr', until = un === 'eod' ? at(17, 0) : un === 'mon' ? at(7, 0, 0, 1) : at(7, 0, 1);
      save('away'); s.away[me] = { until, cover, at: nowIso() }; U.pop = null; scheduleSave(true); flush(); pushToast(`Away until ${PG.whenL(until)} — ${PG.first(cover)} covers your asks.`, true); rd(); },
    awayoff: () => { const s = store(); save('back'); delete s.away[meName()]; U.pop = null; scheduleSave(true); flush(); pushToast('Welcome back — your asks are only yours again.', true); rd(); },
    eosk: t => { U.pop.sel[t.dataset.id] = !U.pop.sel[t.dataset.id]; rd(); },
    eost: t => { U.pop.to = t.dataset.v; rd(); },
    eosgo: () => { const p = U.pop, me = meName(), s = store(), to = p.to, keys = Object.keys(p.sel || {}).filter(k => p.sel[k]), note = String(p.note || '').trim(); save('end of shift');
      const A = mine();
      if(to !== 'ME') keys.forEach(k => { const n = A.find(x => x.key === k); if(!n) return;
        send({ to, from: me, k: n.k, src: n.src, ro: n.ro, op: n.op, t: n.t, b: (n.b ? n.b + ' ' : '') + `Passed on by ${PG.first(me)} at the end of the shift.`, q: n.q, acts: n.acts, pick: n.pick });
        const st = stOf(k); st.done = nowIso(); st.how = `passed to ${to} at the end of the shift`; });
      s.pass[to === 'ME' ? me : to] = { from: me, n: to === 'ME' ? 0 : keys.length, note, at: nowIso() };
      if(to !== 'ME' && s.sumx) delete s.sumx[to];
      U.pop = null; U.sel = null; done(to === 'ME' ? 'Kept for tomorrow — the note is in your morning summary.' : `${keys.length} passed to ${PG.first(to)} — with your note in the morning summary.`); },
    retw: t => { U.pop.why = U.pop.why === t.dataset.v ? '' : t.dataset.v; rd(); },
    retgo: () => { const p = U.pop, n = p && byKey(p.key); if(!n) return; const why = [p.why, String(p.note || '').trim()].filter(Boolean).join(' — '); sendBack(n, why); },
    nudge: t => { const s = store(), n = s.items.find(x => x.id === t.dataset.id); if(!n) return; save('nudge'); n.nudged = nowIso(); n.at = nowIso(); const st = s.st[n.id]; if(st){ delete st.read; delete st.snz; }
      scheduleSave(true); flush(); pushToast(`Nudged ${PG.first(n.to)} — it’s back on top of their inbox.`, true); rd(); }
  };
  /* send() is also a sent item: the Inbox remembers what you handed off */
  /* ---------- typing and keys ---------- */
  function input(t){ const d = t.dataset.in, p = U.pop;
    if(d === 'reply'){ U.reply = t.value; const b = document.querySelector('[data-pg="inbox"] [data-a="send"]'); if(b) b.disabled = !U.reply.trim(); }
    if(d === 'eon' && p) p.note = t.value;
    if(d === 'retn' && p){ p.note = t.value; const b = document.querySelector('[data-pg="inbox"] [data-a="retgo"]'); if(b) b.disabled = !(p.why || p.note.trim()); }
    if(d === 'q' && p){ p.q = t.value; const pos = t.selectionStart; rd(); const f = document.querySelector('[data-pg="inbox"] [data-in="q"]'); if(f){ f.focus(); try{ f.setSelectionRange(pos, pos); }catch(e){} } } }
  function change(t){ if(t.dataset.in === 'sum'){ const me = meName(), s = store(); s.prefs[me] = Object.assign({}, s.prefs[me], { sum: t.checked }); scheduleSave(true); flush(); rd(); } }
  function fieldKey(t, ev){ const d = t.dataset.in, k = ev.key;
    if(k === 'Escape'){ t.blur(); if(U.pop){ U.pop = null; rd(); } ev.preventDefault(); return true; }
    if(d === 'reply' && k === 'Enter'){ ev.preventDefault(); H.send(); return true; }
    if(d === 'q' && k === 'Enter'){ ev.preventDefault(); const b = document.querySelector('[data-pg="inbox"] .tg-pop .ib-srr'); if(b) b.click(); return true; }
    if((d === 'eon' || d === 'retn') && k === 'Enter' && (ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); (d === 'eon' ? H.eosgo : H.retgo)(); return true; }
    return false; }
  function move(d){ const L = flat(); if(!L.length) return; U.kb = true; const i = L.findIndex(x => x.key === U.sel); select(i < 0 ? L[0].key : L[Math.max(0, Math.min(L.length - 1, i + d))].key); U.pop = null; rd(); PG.kbScroll(); }
  const q = s => document.querySelector('[data-pg="inbox"] ' + s), qa = s => [...document.querySelectorAll('[data-pg="inbox"] ' + s)];
  function keydown(ev){
    const k = ev.key; if(ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const stop = () => { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); };
    const p = U.pop;
    if(p){ if(k === 'Escape'){ U.pop = null; rd(); return stop(); }
      if(PG.typing(ev)) return;
      if(k === 'Enter'){ const b = q('.tg-pop .btn-primary:not([disabled])'); if(b){ b.click(); return stop(); } }
      if(p.type === 'snz'){ const i = +k; if(i >= 1 && i <= 6){ const b = qa('.tg-pop [data-a="snz"]')[i - 1]; if(b){ b.click(); return stop(); } } } return; }
    if(PG.typing(ev)) return;
    if(k === 'j' || k === 'ArrowDown'){ move(1); return stop(); } if(k === 'k' || k === 'ArrowUp'){ move(-1); return stop(); }
    const T = curT(), lv = T && T.I.some(live);
    if(k === 'Enter' && lv){ const b = q('.ib-msg:not(.sm) .ib-acts .btn-primary:not([disabled])'); if(b){ b.click(); return stop(); } }
    if(k === 'e' && lv){ H.done(); return stop(); }
    if(k === 's' && lv){ const b = q('[data-a="pop"][data-p="snz"]'); if(b){ H.pop(b); return stop(); } }
    if(k === 'x' && U.view === 'in' && T){ U.bulk = true; U.bs[T.key] = !U.bs[T.key]; rd(); return stop(); }
    if(k === 'r'){ const f = q('[data-in="reply"]'); if(f){ f.focus(); return stop(); } }
    if(k === 'u' && T){ const un = T.I.some(n => n.st === 'new'); T.I.forEach(n => { if(live(n)){ const st = stOf(n.key); if(un) st.read = nowIso(); else delete st.read; } }); quiet(); flush(); U._hold = !un; rd(); return stop(); }
    if(k === '/'){ const b = q('[data-a="pop"][data-p="srch"]'); if(b){ H.pop(b); return stop(); } }
    if(k >= '1' && k <= '4'){ const b = qa('.tg-views button')[+k - 1]; if(b){ H.view(b); return stop(); } }
  }
  function after(){ PG.placePop(U); if(U.kb) PG.kbScroll(); }
  PG.reg('inbox', { H, U: () => U, input, change, fieldKey, keydown, after });
  return { send, count, badge, DERIVE, itemsFor, flush, view, after, U: () => U, store };
