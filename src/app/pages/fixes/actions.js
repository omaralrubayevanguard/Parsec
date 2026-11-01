/* Parsec · pages/fixes · actions.js
   Doing things on the Fixes page: Use fix, mark reviewed, copy; typing and keys.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   openPop revMark copyTxt input change fieldKey move keydown after rd save fin … (9 functions, 4 constants)
   uses       access/ data/ pages/ pages/inbox/ pages/inventory/ pages/triage/ pages/warranty/ ro/ shell/ state/
*/
  /* ---------- doing things ---------- */
  const rd = () => { flush(); PG.keepScroll(render); };
  const save = l => pushUndo(l || 'fixes');
  const fin = msg => { scheduleSave(true); flush(); if(msg) pushToast(msg, true); rd(); };
  function openPop(type, ex, el){ U.pop = Object.assign({ type }, ex || {}); if(el) PG.anchor(U, el); rd(); }
  function revMark(id, o){ REV()[id] = Object.assign(REV()[id] || {}, o, { by: ME().name, byRole: ROLEL[role()], at: nowIso() }); }
  function copyTxt(t){ try{ navigator.clipboard.writeText(t); pushToast('Copied.'); }catch(e){ pushToast('Couldn’t copy here.'); } }
  const H = {
    sel: t => { U.sel = t.dataset.k; U.kb = false; U.pop = null; if(t.dataset.go){ U.view = 'lib'; if(U.flt && !opensOf(U.sel).length) U.flt = false; } rd(); },
    view: t => { U.view = t.dataset.v; U.pop = null; rd(); },
    sort: t => { U.sort = t.dataset.v; rd(); },
    grp: t => { U.grp = t.dataset.v; rd(); },
    flt: () => { U.flt = !U.flt; if(U.flt && !opensOf(U.sel).length){ const g = groupsList()[0]; if(g) U.sel = g.k; } rd(); },
    pop: t => { const p = U.pop; if(p && p.type === t.dataset.p && !t.dataset.op && !t.dataset.id){ U.pop = null; return rd(); } const ex = {}; ['op', 'id', 'k', 'i'].forEach(k => { if(t.dataset[k] != null) ex[k] = t.dataset[k]; }); if(t.dataset.p === 'use') ex.tell = true; openPop(t.dataset.p, ex, t);
      if(t.dataset.p === 'srch') setTimeout(() => { const i = document.querySelector('[data-pg="fixes"] [data-in="sq"]'); if(i) i.focus(); }, 20); },
    popx: () => { U.pop = null; rd(); },
    oset: t => { U.pop.o = +t.dataset.o; rd(); if(U.pop.o === 2) setTimeout(() => { const i = document.querySelector('[data-pg="fixes"] [data-in="qt"]'); if(i) i.focus(); }, 20); },
    pck: (t, ev) => { ev.preventDefault(); const p = U.pop; p.parts[t.dataset.pn] = !p.parts[t.dataset.pn]; rd(); },
    ugo: () => { const p = U.pop, o = openBy(p.op); if(!o || p.o == null) return; const s = stats(o.k), same = s.E.filter(e => e.eng === o.eng && e.h > 0);
      const qv = p.o === 2 ? parseFloat(p.qt) : p.o === 0 ? Math.round(s.q * 10) / 10 : Math.round((same.length ? same.reduce((a, e) => a + e.h, 0) / same.length : s.hrs) * 10) / 10; if(!(qv > 0)) return;
      save('use fix'); const op = o.op; op.quoted = qv; op.parts = op.parts || [];
      const have = new Set(opRealParts(op).map(x => invPnKey(x.partNumber) || invDescKey(x.description))), add = s.parts.filter(x => p.parts[x.p[0] || x.p[1]] && !have.has(invPnKey(x.p[0]) || invDescKey(x.p[1])));
      add.forEach(x => op.parts.push({ id: uid('pt'), description: x.p[1], partNumber: x.p[0], qty: String(x.p[2]), price: x.p[3] ? String(x.p[3]) : '', status: 'Not Ordered', statusChangedAt: nowIso() }));
      const src = s.E.find(e => e.fix === ((STD()[o.k] || {}).fix || (s.fixes[0] || [''])[0])) || s.E[0];
      op.fxUse = { ro: src ? src.ro : '', by: ME().name, at: nowIso(), key: o.k }; op.fxQ = op.fxQ || { ro: src ? src.ro : '', at: nowIso() }; op.fxP = op.fxP || { ro: src ? src.ro : '', at: nowIso() };
      if(p.tell !== false) op.fxShow = true;
      let partsMsg = '';
      if(add.length && p.toParts !== false){ if(techSame(ME().name, o.wr) || !o.wr){ try{ rtSend(o.ro, 'parts', '', 'Parts from a past fix', null, {}); }catch(e){} partsMsg = ' (sent to Parts)'; }
        else if(typeof IB !== 'undefined'){ IB.send({ to: o.wr, k: 'ask', src: 'fixes', ro: o.roId, op: o.opId, t: `Send the parts on ${o.no} to Parts?`, b: `${F(ME().name)} used a past fix — ${add.length} part${add.length > 1 ? 's' : ''} added: ${add.map(x => x.p[1]).join(', ')}.`, acts: [['Open in Triage', 'page'], ['Open RO', 'open']] }); partsMsg = ` (${F(o.wr)} is asked)`; } }
      U.pop = null; fin(`Used on ${o.no} — ${h1(qv)} h quoted${add.length ? `, ${add.length} part${add.length > 1 ? 's' : ''} on the RO${partsMsg}` : ''}${p.tell !== false && o.tech ? `. ${F(o.tech)} sees the usual fix on the Console.` : '.'}`); },
    usenote: () => { const r = revItems().find(x => x.id === U.pop.id); if(!r || !r.note) return; if(!r.fix || r.gap === 'short') U.pop.x = r.note; else if(!r.cause) U.pop.c = r.note; rd(); },
    wgo: () => { const p = U.pop, r = revItems().find(x => x.id === p.id); if(!r || !r.e || !r.e.op) return; const op = r.e.op, c = String(p.c != null ? p.c : r.cause).trim(), x = String(p.x != null ? p.x : r.fix).trim(), cd = String(p.cd || '').trim();
      save('write up a fix'); op.log = op.log || [];
      if(c && c !== r.cause){ op.cause = c; op.log = op.log.filter(l => l.kind !== 'cause'); }
      if(x && x !== r.fix){ op.correction = x; op.log = op.log.filter(l => l.kind !== 'fix'); }
      if(cd){ op.faults = op.faults || []; if(!opFaultCodes(op).includes(cd)) op.faults.push({ id: 'fc_' + uid(), code: cd }); }
      revMark(r.id, { done: true }); U.pop = null; fin(`Written up — saved on ${r.ro}.`); },
    mset: t => { U.pop.k = t.dataset.k; rd(); },
    mgo: () => { const p = U.pop, r = revItems().find(x => x.id === p.id); if(!r) return; const k = p.k || r.dup; if(!k) return; save('merge fixes'); ALIAS()[fixKeyOf(r.cmp)] = k; revMark(r.id, { done: true, merged: k }); U.pop = null; fin(`Merged into “${grp(k).t}”.`); },
    rvok: t => { const r = revItems().find(x => x.id === t.dataset.id); if(!r) return; save('review'); revMark(r.id, { ok: true, kept: true }); fin(`${r.ro} kept as written — by ${F(ME().name)}.`); },
    rvhand: t => { const m = fixManual().find(x => x.id === t.dataset.id); if(!m) return; save('review'); m.reviewed = true; m.review = false; m.revBy = ME().name; fin(`Added — “${m.complaint}” now counts.`); },
    rvdrop: t => { const l = fixManual(), i = l.findIndex(x => x.id === t.dataset.id); if(i < 0) return; save('review'); l.splice(i, 1); fin('Dropped.'); },
    apick: t => { U.pop.d.cmp = grp(t.dataset.k).t; U.pop.k = t.dataset.k; rd(); },
    ago: () => { const d = U.pop.d; d.cmp = String(d.cmp || '').trim(); if(!d.cmp || !(String(d.c).trim() || String(d.x).trim())){ pushToast(!d.cmp ? 'Add the complaint.' : 'Add the cause, the correction, or both.'); return; }
      save('add a fix'); const tm = String(d.pn || '').trim(), ym = /^(\d{4})\s+(.*)$/.exec(tm);
      fixManual().push({ id: uid('fx'), complaint: d.cmp, cause: String(d.c).trim(), correction: String(d.x).trim(), year: ym ? ym[1] : '', model: ym ? ym[2] : tm, engine: String(d.eng || '').trim(), code: String(d.cd || '').trim(), vin: '', date: nowIso(), by: ME().name, at: nowIso(), review: role() === 'tech' });
      U.pop = null; flush(); if(role() !== 'tech'){ U.view = 'lib'; U.sel = keyOf(d.cmp); }
      fin(role() === 'tech' ? 'Sent to Review — a foreman, lead tech, Triage or the manager checks it before it counts.' : `Fix added to “${d.cmp}”.`); },
    askuse: t => { const ro = getRO(t.dataset.ro), op = ro && ro.operations.find(o => o.id === t.dataset.op), wr = PG.person('Service writer'); if(!ro || !wr || typeof IB === 'undefined') return;
      IB.send({ to: wr, k: 'ask', src: 'fixes', ro: ro.id, op: op ? op.id : null, t: `${F(ME().name)} asks: use the past fix on ${tgNum(ro)}?`, b: op ? op.complaint : '', acts: [['Open RO', 'open']] }); scheduleSave(true); pushToast(`Asked ${F(wr)} to use this fix on ${tgNum(ro)}.`); },
    suggest: () => { const g = grp(U.sel); if(!g) return; const s = stats(g.k); save('suggest an edit'); fixManual().push({ id: uid('fx'), complaint: g.t, cause: (s.causes[0] || [''])[0], correction: (STD()[g.k] || {}).fix || (s.fixes[0] || [''])[0], by: ME().name, at: nowIso(), date: nowIso(), review: true, sug: true }); fin('Sent to Review — the foreman, a lead tech or the manager looks at it.'); },
    gocb: () => { const o = build().O.find(x => x.cb); if(!o) return; U.view = 'lib'; U.sel = o.k; U.pop = null; rd(); },
    tofix: t => { U.hl = t.dataset.ro; rd(); setTimeout(() => { const el = document.querySelector(`[data-pg="fixes"] .fq-er[data-ro="${U.hl}"]`); if(el) el.scrollIntoView({ block: 'center' }); }, 30); },
    cbsend: t => { const ro = getRO(t.dataset.ro); if(!ro) return; save('comeback'); try{ rtSend(ro, 'foreman', '', 'Comeback — same complaint, same truck', null, { reason: 'Comeback' }); }catch(e){} fin(`Sent to ${F(PG.person('Foreman') || 'Foreman')} — flagged as a comeback.`); },
    stp: (t, ev) => { ev.preventDefault(); const d = U.steps[t.dataset.k] = U.steps[t.dataset.k] || {}; d[t.dataset.i] = !d[t.dataset.i]; rd(); },
    qset: t => { const k = t.dataset.k, s = stats(k); save('usual quote'); QO()[k] = Math.round(s.hrs * 10) / 10; fin(`The usual quote is now ${h1(QO()[k])} h — Use fix starts from it.`); },
    qkeep: t => { save('keep quote'); QK()[t.dataset.k] = nowIso(); fin('Kept — it asks again if the gap grows.'); },
    ctab: t => { U.pop.tab = t.dataset.v; rd(); },
    cans: () => { U.pop = null; pushToast('That’s what the tech answers when the clock stops.'); rd(); },
    sfix: t => { U.pop.f = +t.dataset.i; rd(); },
    stdgo: () => { const p = U.pop, s = stats(p.k), cur = STD()[p.k], i = p.f != null ? p.f : (cur ? Math.max(0, s.fixes.findIndex(y => y[0] === cur.fix)) : 0); if(!s.fixes[i]) return; save('shop standard'); STD()[p.k] = { fix: s.fixes[i][0], note: String(p.n != null ? p.n : (cur && cur.note) || '').trim(), by: ME().name, at: nowIso() }; U.pop = null; fin(`Shop standard set by ${F(ME().name)} — it shows first, here and on the Console.`); },
    sclr: () => { save('remove standard'); delete STD()[U.pop.k]; U.pop = null; fin('Standard removed.'); },
    kpk: (t, ev) => { ev.preventDefault(); const p = U.pop; p.sel[t.dataset.pn] = !p.sel[t.dataset.pn]; rd(); },
    kgo: () => { const p = U.pop, s = stats(p.k), sel = s.parts.filter(x => p.sel[x.p[0] || x.p[1]]); if(!sel.length){ pushToast('Pick at least one part.'); return; } save('make a kit');
      const kit = invBlank(true); kit.desc = String(p.n != null ? p.n : grp(p.k).t.split(' — ')[0] + ' job').trim(); kit.engine = (s.engs || [])[0] || ''; kit.children = sel.map(x => { const c = invChild(); c.desc = x.p[1]; c.pn = x.p[0]; c.qty = String(x.p[2]); c.price = x.p[3] ? cdMoney(x.p[3]) : ''; return c; }); kit.autoFrom = { fix: p.k, at: nowIso() };
      invList().unshift(kit); KITS()[p.k] = kit.id; U.pop = null; fin(`“${kit.desc}” is in Parts → Catalog.`); },
    fset2: t => { const f = t.dataset.f; U[f] = U[f] === t.dataset.v ? null : t.dataset.v; rd(); },
    fclr: t => { const f = t.dataset.f; if(f === 'all'){ U.fe = U.fmdl = U.fmi = null; } else U[f] = null; rd(); },
    openro: t => PG.openRo(t.dataset.ro, t.dataset.op),
    copy: t => { const s = stats(t.dataset.k); copyTxt(`Cause: ${(s.causes[0] || [''])[0]}\nCorrection: ${(STD()[t.dataset.k] || {}).fix || (s.fixes[0] || [''])[0]}${s.parts.length ? '\nParts: ' + s.parts.slice(0, 6).map(x => x.p[1] + (x.p[0] ? ' ' + x.p[0] : '')).join(', ') : ''}`); },
    copyw: t => { const k = t.dataset.k, g = grp(k), s = stats(k); copyTxt(`Complaint: ${g.t}\nCause: ${(s.causes[0] || [''])[0]}\nCorrection: ${(STD()[k] || {}).fix || (s.fixes[0] || [''])[0]}${s.parts.length ? '\nCausal part: ' + s.parts[0].p[1] + (s.parts[0].p[0] ? ' ' + s.parts[0].p[0] : '') : ''}`); },
    print: () => { const el = document.querySelector('[data-pg="fixes"] .fq-printme'); if(!el) return; el.classList.add('pg-printme'); document.documentElement.classList.add('pg-print2'); setTimeout(() => { try{ window.print(); } finally { el.classList.remove('pg-printme'); document.documentElement.classList.remove('pg-print2'); } }, 30); }
  };
  /* ---------- typing and keys ---------- */
  function input(t){ const d = t.dataset.in, p = U.pop; if(!p) return;
    if(d === 'qt'){ p.qt = t.value; const b = document.querySelector('[data-pg="fixes"] .tg-pop [data-a="ugo"]'); if(b) b.disabled = !(parseFloat(p.qt) > 0); return; }
    if(d === 'sn' || d === 'kn') p.n = t.value; if(d === 'c') p.c = t.value; if(d === 'x') p.x = t.value; if(d === 'cd') p.cd = t.value;
    if(d === 'sq' || d === 'acmp'){ if(d === 'sq') p.q = t.value; else p.d.cmp = t.value; const pos = t.selectionStart; rd(); const f = document.querySelector(`[data-pg="fixes"] [data-in="${d}"]`); if(f){ f.focus(); try{ f.setSelectionRange(pos, pos); }catch(e){} } return; }
    if(d === 'ac') p.d.c = t.value; if(d === 'ax') p.d.x = t.value; if(d === 'aeng') p.d.eng = t.value; if(d === 'acd') p.d.cd = t.value; if(d === 'apn') p.d.pn = t.value; }
  function change(t){ const d = t.dataset.in, p = U.pop; if(!p) return; if(d === 'tel') p.tell = t.checked; if(d === 'tpa') p.toParts = t.checked; }
  function fieldKey(t, ev){ const d = t.dataset.in, k = ev.key;
    if(k === 'Escape'){ t.blur(); if(U.pop){ U.pop = null; rd(); } ev.preventDefault(); return true; }
    if(k === 'Enter' && d === 'sq'){ ev.preventDefault(); const b = document.querySelector('[data-pg="fixes"] .tg-pop .fq-srr'); if(b) b.click(); return true; }
    if(k === 'Enter' && t.tagName !== 'TEXTAREA'){ ev.preventDefault(); const b = document.querySelector('[data-pg="fixes"] .tg-pop .btn-primary:not([disabled])'); if(b) b.click(); return true; }
    return false; }
  function move(d){ const L = flat(); if(!L.length) return; U.kb = true; U.view = 'lib'; const i = L.indexOf(U.sel); U.sel = i < 0 ? L[0] : L[Math.max(0, Math.min(L.length - 1, i + d))]; U.pop = null; rd(); PG.kbScroll(); }
  function keydown(ev){
    const k = ev.key; if(ev.ctrlKey || ev.metaKey || ev.altKey || PG.typing(ev)) return;
    const stop = () => { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); };
    const p = U.pop;
    if(p){ if(k === 'Escape'){ U.pop = null; rd(); return stop(); }
      if(k === 'Enter'){ const b = document.querySelector('[data-pg="fixes"] .tg-pop .btn-primary:not([disabled])'); if(b){ b.click(); return stop(); } }
      const n = +k; if(n >= 1 && n <= 5){ const b = document.querySelector(`[data-pg="fixes"] .tg-pop [data-a="oset"][data-o="${n - 1}"]`) || [...document.querySelectorAll('[data-pg="fixes"] .tg-pop [data-a="mset"], [data-pg="fixes"] .tg-pop [data-a="sfix"]')][n - 1]; if(b){ b.click(); return stop(); } } return; }
    if(k === 'j'){ move(1); return stop(); } if(k === 'k'){ move(-1); return stop(); }
    if(k === 'u'){ const b = document.querySelector('[data-pg="fixes"] .tg-next [data-p="use"]'); if(b){ H.pop(b); return stop(); } }
    if(k === 'a'){ const b = document.querySelector('[data-pg="fixes"] [data-a="pop"][data-p="add"]'); if(b){ H.pop(b); return stop(); } }
    if(k === '/'){ psmOpen('fixes'); return stop(); }   /* Parsec 13.1 — the search window */
    if(k >= '1' && k <= '4'){ const v = ['lib', 'open', 'rev', 'trend'][+k - 1]; if((v === 'rev' && !isRev()) || (v === 'trend' && !['mg', 'fm'].includes(role()))) return stop(); U.view = v; U.pop = null; rd(); return stop(); }
  }
  function after(){ PG.placePop(U); if(U.kb) PG.kbScroll(); }
  /* the Inbox: a comeback is in the shop */
  if(typeof IB !== 'undefined') IB.DERIVE.push((me, r) => { if(!['Foreman', 'Manager', 'Admin'].includes(r)) return []; flush(); return build().O.filter(o => o.cb).map(o => ({ key: 'cb:' + o.opId, from: 'Parsec', k: 'ask', src: 'fixes', at: o.ro.dateOpened || nowIso(), ro: o.roId, op: o.opId, t: `Comeback — ${o.no} is back with the same complaint`, b: `${o.cust} · ${o.cb.days} days after RO ${o.cb.ro}. ${o.op.complaint || ''}`, acts: [['Open RO', 'open'], ['See the fix', 'page']] })); });
  /* Parsec 13.1 — the search is an icon: the window finds the complaint to open */
  psmReg('fixes', () => ({ title: 'Search complaint, cause, code, part # or VIN', page: 'Fixes', placeholder: 'Complaint, cause, SPN code, part # or VIN', filters: false,
    empty: 'Try an SPN code, a part number, a word like “connector”, or a VIN.',
    get: () => U.psq || '', set: q => { U.psq = q; },
    items: q => fxFind(q).slice(0, 8).map(x => ({ id: x.g.k, icon: ic(SYS[x.g.sys][1], 14), title: x.g.t, sub: x.h[0] + ': ' + x.h[1] + ' · ' + (build().E[x.g.k] || []).length + '×' })),
    pick: it => { U.psq = ''; H.sel({ dataset: { k: it.id, go: '1' } }); } }));
  PG.reg('fixes', { H, U: () => U, input, change, fieldKey, keydown, after });
  return { view, U: () => U, flush, build, stats, keyOf };
