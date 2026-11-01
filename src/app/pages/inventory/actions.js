/* Parsec · pages/inventory · actions.js
   Doing things on the Inventory page: receive, move, count, reorder; typing and keys.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   openPop putForm copy refocus input change fieldKey move keydown after rd logIt … (10 functions, 8 constants)
   state      inventory ptSet
   uses       access/ data/ pages/ ro/ shell/ state/
   at load    on document keydown
*/
  /* ---------- doing things ---------- */
  const rd = () => { flush(); PG.keepScroll(render); };
  const logIt = (it, e) => { if(!Array.isArray(it.log)) it.log = []; it.log.push(Object.assign({ at: nowIso(), by: PG.me().name }, e)); if(it.log.length > 200) it.log.splice(0, it.log.length - 200); };
  const aud = t => { try{ audit('parts', t); }catch(e){} };
  const done = msg => { scheduleSave(true); flush(); if(msg) pushToast(msg, true); else rd(); };
  function openPop(type, ex, el){ U.pop = Object.assign({ type }, ex || {}); if(el) PG.anchor(U, el); rd(); setTimeout(() => { const f = document.querySelector('[data-pg="inventory"] .tg-pop input:not([disabled])'); if(f && !PG.typing({ target: document.activeElement })) f.focus(); }, 20); }
  const formOf = x => ({ pn: x.it.pn || '', desc: x.it.desc || '', bin: x.it.bin || '', price: priceOf(x.it.price) ? qf(priceOf(x.it.price)) : '', cost: x.it.cost ? qf(num(x.it.cost)) : '', min: x.it.min ? qf(num(x.it.min)) : '', max: x.it.max ? qf(num(x.it.max)) : '', engine: x.it.engine || '', model: x.it.model || '', year: x.it.year || '' });
  function putForm(it, F, nu){ const ch = [];
    ['pn', 'desc', 'engine', 'model', 'year'].forEach(k => { const v = String(F[k] == null ? '' : F[k]).trim(); if(String(it[k] || '') !== v){ it[k] = v; ch.push(k); } });
    if(!it.kit){ const b = String(F.bin || '').trim().toUpperCase(); if(String(it.bin || '') !== b){ it.bin = b; ch.push('bin'); }
      ['price', 'cost'].forEach(k => { const v = String(F[k] == null ? '' : F[k]).trim(), n = num(v); const cur = k === 'price' ? priceOf(it.price) : num(it.cost); if(v === '' ? cur : n !== cur){ it[k] = v === '' ? '' : String(n); ch.push(k); } });
      const mn = Math.max(0, num(F.min)), mx = Math.max(0, num(F.max)), om = num(it.min), ox = num(it.max);
      if(mn !== om || mx !== ox){ it.min = mn; it.max = mx && mx >= mn ? mx : (mn ? mn * 2 : 0); if(!nu) logIt(it, { k: 'set', t: `Min · max ${qf(om)} · ${qf(ox || om * 2)} → ${qf(it.min)} · ${qf(it.max)}` }); ch.push('min'); }
      if(nu){ it.oh = Math.max(0, num(F.oh)); } }
    it.editedAt = nowIso(); return ch; }
  const H = {
    view: t => { U.view = t.dataset.v; U.pop = null; rd(); },
    hf: t => { const k = t.dataset.k; if(k === 'reorder'){ U.view = 'reorder'; } else { U.view = 'stock'; U.flt = k; U.sel = null; } U.pop = null; rd(); },
    flt: t => { U.flt = t.dataset.v; rd(); },
    clr: () => { U.q = ''; U.flt = 'all'; U.shelf = ''; rd(); },
    sort: t => { const k = t.dataset.k; U.sort = U.sort[0] === k ? [k, -U.sort[1]] : [k, /^(oh|avail|ord|price|last)$/.test(k) ? -1 : 1]; rd(); },
    srch: () => { U.pop = null; psmOpen('inventory'); },
    sel: (t, ev) => { if(ev && ev.target.closest && ev.target.closest('.ivn-car') && t.dataset.a !== 'kit') return; const id = t.dataset.id; if(t.dataset.go) U.view = 'stock'; U.sel = U.sel === id && !t.dataset.go && t.classList.contains('ivn-r') ? null : id; U.kb = false; U.pop = null; rd(); },
    unsel: () => { U.sel = null; U.pop = null; rd(); },
    kit: t => { U.kopen[t.dataset.id] = !U.kopen[t.dataset.id]; rd(); },
    ro: t => { U.pop = null; PG.openRo(t.dataset.ro, t.dataset.op); },
    pop: t => { const p = U.pop, ty = t.dataset.p; if(p && p.type === ty && (p.id || '') === (t.dataset.id || '')){ U.pop = null; return rd(); }
      const ex = {}; if(t.dataset.id) ex.id = t.dataset.id; if(t.dataset.kit) ex.kit = true;
      if(ty === 'new') ex.f = { pn: '', desc: U.q.trim() && !/\d{4,}/.test(U.q) ? U.q.trim() : '', bin: '', oh: '', min: '', max: '', price: '', cost: '', engine: '', model: '', year: '' };
      if(ty === 'new' && /^[A-Z0-9][A-Z0-9\-]{3,}$/i.test(U.q.trim())) ex.f.pn = U.q.trim();
      if(ty === 'edit'){ const x = get(t.dataset.id); if(!x) return; ex.f = formOf(x); }
      if(ty === 'adj'){ ex.mode = 'to'; ex.to = ''; ex.d = ''; ex.why = 'Counted'; ex.note = ''; }
      if(ty === 'rcv'){ const x = get(t.dataset.id); ex.q = x && x.so ? qf(x.so) : ''; ex.ref = ''; ex.cost = ''; }
      if(ty === 'kadd'){ ex.q = ''; ex.kq2 = '1'; }
      openPop(ty, ex, t); },
    popx: () => { U.pop = null; rd(); },
    amode: t => { U.pop.mode = t.dataset.v; rd(); setTimeout(() => { const f = document.querySelector('[data-pg="inventory"] .tg-pop [data-in="pf"]'); if(f) f.focus(); }, 10); },
    awhy: t => { U.pop.why = t.dataset.v; rd(); },
    newgo: () => { const p = U.pop, F = p.f || {}; if(!String(F.pn || F.desc || '').trim()){ pushToast('Give it a part # or a description.'); return; }
      if(!p.kit){ const kk = kOf(F.pn, F.desc), had = kk && items().find(y => !y.kit && y.k === kk); if(had){ pushToast('That part is on the list already — opened it.'); U.pop = null; U.sel = had.id; return rd(); } }
      pushUndo(p.kit ? 'new kit' : 'new part'); const it = invBlank(!!p.kit); putForm(it, F, true); logIt(it, { k: 'new' }); if(num(F.oh)) logIt(it, { k: 'adj', why: 'Counted', from: 0, to: num(F.oh) });
      invList().unshift(it); U.pop = null; U.sel = it.id; U.view = 'stock'; aud(`Inventory — added ${it.kit ? 'kit' : 'part'} ${it.pn || it.desc}`); done(`${it.desc || it.pn} is on the list.`); },
    editgo: () => { const p = U.pop, x = get(p.id); if(!x) return; const F = p.f || {}; if(!String(F.pn || F.desc || '').trim()){ pushToast('Give it a part # or a description.'); return; }
      pushUndo('edit part'); const ch = putForm(x.it, F, false); U.pop = null; if(!ch.length){ rd(); return; } aud(`Inventory — edited ${x.it.pn || x.it.desc} (${ch.join(', ')})`); done('Saved.'); },
    rcvgo: () => { const p = U.pop, x = get(p.id); if(!x) return; const q = num(p.q); if(!(q > 0)) return; pushUndo('receive stock');
      const it = x.it, from = num(it.oh); it.oh = from + q; if(num(it.onOrder)){ it.onOrder = Math.max(0, num(it.onOrder) - q); if(!it.onOrder) delete it.onOrderAt; } if(num(p.cost) > 0) it.cost = String(num(p.cost));
      logIt(it, { k: 'rcv', q, ref: String(p.ref || '').trim(), from, to: it.oh }); U.pop = null; aud(`Inventory — received ${qf(q)} × ${it.pn || it.desc}${p.ref ? ' · ' + p.ref : ''}`); done(`Received ${qf(q)} — ${qf(it.oh)} on hand.`); },
    adjgo: () => { const p = U.pop, x = get(p.id); if(!x) return; const to = p.mode === 'by' ? x.oh + num(p.d) : num(p.to); if(!(to >= 0) || to === x.oh) return; pushUndo('adjust stock');
      const it = x.it, from = num(it.oh); it.oh = to; logIt(it, { k: 'adj', why: p.why || 'Counted', from, to, note: String(p.note || '').trim() }); U.pop = null;
      aud(`Inventory — ${it.pn || it.desc} ${qf(from)} → ${qf(to)} · ${p.why || 'Counted'}${p.note ? ' · ' + p.note : ''}`); done(`${it.desc || it.pn}: ${qf(from)} → ${qf(to)} · ${(p.why || 'Counted').toLowerCase()}.`); },
    delgo: () => { const x = get(U.pop.id); if(!x) return; pushUndo('delete part'); STATE.inventory = invList().filter(it => it !== x.it); U.pop = null; U.sel = null; aud(`Inventory — deleted ${x.it.pn || x.it.desc}`); done(`${x.desc || x.pn} deleted.`); },
    usemin: t => { const x = get(t.dataset.id); if(!x) return; const v = num(t.dataset.v); pushUndo('set min'); const om = x.min, ox = x.max; x.it.min = v; x.it.max = v * 2; logIt(x.it, { k: 'set', t: `Min · max ${qf(om)} · ${qf(ox)} → ${qf(v)} · ${qf(v * 2)} (from its use)` }); done(`Min ${v}, max ${v * 2}.`); },
    kpick: t => { const p = U.pop, x = get(p.id); if(!x) return; const y = t.dataset.v ? get(t.dataset.v) : null, q = Math.max(1, num(p.kq2) || 1); pushUndo('kit part');
      const c = invChild(); if(y){ c.pn = y.it.pn || ''; c.desc = y.it.desc || ''; c.price = y.it.price || ''; } else { const g = parseQuickPart(p.q || ''); c.pn = g.pn; c.desc = g.desc || p.q; if(g.price) c.price = g.price; }
      c.qty = String(q); x.it.children = x.it.children || []; x.it.children.push(c); x.it.editedAt = nowIso(); U.pop = null; done(`${c.desc || c.pn} is in the kit.`); },
    kdel: t => { const x = get(t.dataset.id); if(!x) return; const i = +t.dataset.i, c = (x.it.children || [])[i]; if(!c) return; pushUndo('kit part'); x.it.children.splice(i, 1); x.it.editedAt = nowIso(); done(`${c.desc || c.pn} is out of the kit.`); },
    csh: t => { U.csh = t.dataset.v; rd(); },
    cclr: () => { U.cnt = {}; rd(); },
    csave: () => { const L = Object.keys(U.cnt).filter(id => U.cnt[id] !== '' && U.cnt[id] != null).map(id => [get(id), num(U.cnt[id])]).filter(z => z[0] && z[1] >= 0); if(!L.length) return;
      pushUndo('shelf count'); const off = [];
      L.forEach(([x, v]) => { const from = num(x.it.oh); logIt(x.it, { k: 'cnt', from, to: v }); if(v !== from){ x.it.oh = v; off.push(`${x.desc || x.pn} ${qf(from)} → ${qf(v)}`); } });
      try{ const ps = STATE.ptSet || (STATE.ptSet = {}); ps.counted = { day: todayStr(), at: nowIso(), sh: U.csh }; }catch(e){}
      aud(`Inventory — counted shelf ${U.csh}: ${L.length} lines${off.length ? ', ' + off.length + ' off' : ''}`); U.cnt = {}; done(off.length ? `Counted ${L.length} — ${off.length} off: ${off.slice(0, 3).join(', ')}${off.length > 3 ? '…' : ''}. On hand fixed.` : `Counted ${L.length} — every one matched.`); },
    copyro: () => { const t = reorderText(); U.pop = null; if(!t){ pushToast('Nothing on the reorder list.'); return; } copy(t, `Reorder list copied — ${t.split('\n').length} line${t.split('\n').length === 1 ? '' : 's'}, part # · description · qty.`); },
    ordered: () => { const { R } = reorder(); if(!R.length) return; pushUndo('stock order');
      R.forEach(r => { r.x.it.onOrder = num(r.x.it.onOrder) + r.q; r.x.it.onOrderAt = nowIso(); logIt(r.x.it, { k: 'ord', q: r.q }); });
      try{ const ps = STATE.ptSet || (STATE.ptSet = {}); ps.soSent = nowIso(); }catch(e){}
      aud(`Inventory — stock order, ${R.length} lines`); done(`${R.length} line${R.length === 1 ? '' : 's'} on order for stock — Receive takes them off when they come in.`); },
    csv: t => { U.pop = null; const k = t.dataset.v, q = s => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"';
      const rows = k === 'reorder' ? [['Part #', 'Description', 'Bin', 'On hand', 'Coming', 'Min', 'Max', 'Order', 'Cost each']].concat(reorder().R.map(r => [r.x.pn, r.x.desc, r.x.bin, r.x.oh, r.x.so, r.x.min, r.x.max, r.q, r.x.cost || r.x.price]))
        : [['Part #', 'Description', 'Bin', 'On hand', 'Needed on ROs', 'Available', 'On order', 'Min', 'Max', 'Price', 'Cost', 'Fits', 'Last used']].concat(items().filter(x => !x.kit).map(x => [x.pn, x.desc, x.bin, x.oh, x.need, x.avail, x.ord, x.min, x.max, x.price, x.cost, x.fit, x.last ? localDay(x.last) : '']));
      const blob = new Blob([rows.map(r => r.map(q).join(',')).join('\r\n')], { type: 'text/csv' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = (k === 'reorder' ? 'Parsec reorder ' : 'Parsec stock ') + todayStr() + '.csv'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); rd(); }
  };
  function copy(t, msg){ const ok = () => pushToast(msg), fb = () => { const ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); ok(); }catch(e){ pushToast('Couldn’t copy here — use CSV instead.'); } ta.remove(); };
    try{ if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, fb); else fb(); }catch(e){ fb(); } }
  /* ---------- typing and keys ---------- */
  function refocus(sel, pos){ const f = document.querySelector('[data-pg="inventory"] ' + sel); if(f){ f.focus(); try{ f.setSelectionRange(pos, pos); }catch(e){} } }
  function input(t){ const d = t.dataset.in, p = U.pop, pos = t.selectionStart;
    if(d === 'q'){ U.q = t.value; rd(); refocus('[data-in="q"]', pos); return; }
    if(d === 'aq'){ U.aq = t.value; rd(); refocus('[data-in="aq"]', pos); return; }
    if(d === 'cnt'){ U.cnt[t.dataset.id] = t.value; const x = get(t.dataset.id), s = t.parentNode.nextElementSibling; if(s && x){ const v = t.value, df = v === '' ? null : num(v) - x.oh; s.textContent = df == null ? '' : df === 0 ? 'matches' : (df > 0 ? '+' : '') + qf(df); s.className = 'n dv' + (df == null ? '' : df ? ' off' : ' ok'); }
      const n = Object.keys(U.cnt).filter(k => U.cnt[k] !== '').length, b = document.querySelector('[data-pg="inventory"] [data-a="csave"]'); if(!!b !== !!n){ rd(); refocus(`[data-in="cnt"][data-id="${t.dataset.id}"]`, pos); } else if(b) b.textContent = 'Save count · ' + n; return; }
    if(!p) return;
    if(d === 'pf'){ const k = t.dataset.f; if(p.f && (p.type === 'new' || p.type === 'edit')) p.f[k] = t.value; else p[k] = t.value;
      if(p.type === 'adj' || p.type === 'rcv'){ rd(); refocus(`.tg-pop [data-in="pf"][data-f="${k}"]`, pos); } return; }
    if(d === 'kq'){ p.q = t.value; rd(); refocus('.tg-pop [data-in="kq"]', pos); return; } }
  function change(t){ if(t.dataset.ch === 'shelf'){ U.shelf = t.value; rd(); } }
  function fieldKey(t, ev){ const k = ev.key, d = t.dataset.in;
    if(k === 'Escape'){ t.blur(); if(U.pop){ U.pop = null; rd(); } else if(d === 'q' && U.q){ U.q = ''; rd(); } ev.preventDefault(); return true; }
    if(k === 'Enter' && d === 'cnt'){ ev.preventDefault(); const all = Array.prototype.slice.call(document.querySelectorAll('[data-pg="inventory"] [data-in="cnt"]')), i = all.indexOf(t); if(all[i + 1]) all[i + 1].focus(); else t.blur(); return true; }
    if(k === 'Enter' && d === 'kq' && U.pop){ ev.preventDefault(); const b = document.querySelector('[data-pg="inventory"] .tg-pop [data-a="kpick"]'); if(b) b.click(); return true; }
    if(k === 'Enter' && d === 'q'){ ev.preventDefault(); const L = shown(); if(L.length){ U.sel = L[0].id; rd(); } return true; }
    if(k === 'Enter' && U.pop){ ev.preventDefault(); const b = document.querySelector('[data-pg="inventory"] .tg-pop .btn-primary:not([disabled])'); if(b) b.click(); return true; }
    return false; }
  function move(dlt){ const L = shown(); if(!L.length) return; U.kb = true; const i = L.findIndex(x => x.id === U.sel); U.sel = (i < 0 ? L[0] : L[Math.max(0, Math.min(L.length - 1, i + dlt))]).id; U.pop = null; rd();
    const on = document.querySelector('[data-pg="inventory"] .ivn-r.on'); if(on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' }); }
  function keydown(ev){
    const k = ev.key; if(ev.ctrlKey || ev.metaKey || ev.altKey || PG.typing(ev)) return;
    const stop = () => { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); };
    if(U.pop){ if(k === 'Escape'){ U.pop = null; rd(); return stop(); } if(k === 'Enter'){ const b = document.querySelector('[data-pg="inventory"] .tg-pop .btn-primary:not([disabled])'); if(b){ b.click(); return stop(); } } return; }
    if(k === 'Escape' && U.sel){ U.sel = null; rd(); return stop(); }
    if((k === 'j' || k === 'ArrowDown' || k === 'k' || k === 'ArrowUp') && U.view === 'stock'){ move(k === 'j' || k === 'ArrowDown' ? 1 : -1); return stop(); }
    if(k === '/'){ H.srch(); return stop(); }   /* Parsec 13.1 — the search window */
    if(k === 'n' && canEd()){ const b = document.querySelector('[data-pg="inventory"] [data-a="pop"][data-p="new"]:not([data-kit])'); if(b){ H.pop(b); return stop(); } }
    if(k === 'r' && canEd() && U.sel){ const b = document.querySelector('[data-pg="inventory"] [data-a="pop"][data-p="rcv"]'); if(b){ H.pop(b); return stop(); } }
    if(k >= '1' && k <= '4'){ const v = ['stock', 'reorder', 'count', 'act'].filter(x => x !== 'count' || canEd())[+k - 1]; if(v){ U.view = v; U.pop = null; rd(); return stop(); } }
  }
  function after(){ PG.placePop(U); }
  /* a row picked with Enter or Space, for the keyboard */
  document.addEventListener('keydown', ev => { if(UI.view !== 'inventory' || (ev.key !== 'Enter' && ev.key !== ' ')) return; const r = ev.target && ev.target.closest && ev.target.closest('[data-pg="inventory"] .ivn-r[data-a="sel"]'); if(r && ev.target === r){ ev.preventDefault(); H.sel(r, ev); } });
  /* Parsec 13.1 — the search is an icon: the window filters the stock list (on Activity, the movements) as you type */
  const ivQ = (q, f) => { const s = U.q; U.q = q; try{ return f(); } finally { U.q = s; } };
  const ivRow = x => ({ id: x.id, title: x.desc || x.pn || 'Part', sub: [x.kit ? 'Kit' : '', x.pn, x.bin ? 'Bin ' + x.bin : (x.kit ? '' : 'No bin'), x.oh + ' on hand'].filter(Boolean).join(' · ') });
  psmReg('inventory', () => U.view === 'act'
    ? { title: 'Find a part in the activity', page: 'Activity', placeholder: 'Part # or description',
        get: () => U.aq, set: q => { U.aq = q; rd(); },
        count: q => { const A = acts(), w = String(q || '').trim().toLowerCase(); return { n: w ? A.filter(a => hay(a.x).indexOf(w) > -1).length : A.length, of: A.length }; } }
    : { title: 'Find a part', page: 'Inventory', placeholder: 'Part #, description, bin, engine…',
        get: () => U.q, set: q => { U.q = q; if(q && U.view !== 'stock'){ U.view = 'stock'; U.pop = null; } rd(); },
        count: q => ({ n: ivQ(q, () => shown().length), of: ivQ('', () => shown().length) }),
        items: q => q ? ivQ(q, () => shown()).slice(0, 8).map(ivRow) : [],
        pick: it => { U.view = 'stock'; U.sel = it.id; U.kb = false; U.pop = null; } });
  PG.reg('inventory', { H, U: () => U, input, change, fieldKey, keydown, after });
  return { view, U: () => U, items, reorder, flush, counts };
