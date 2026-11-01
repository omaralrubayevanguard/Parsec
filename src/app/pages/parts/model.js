/* Parsec · pages/parts · model.js
   The Parts page's model: the shop's parts settings, the catalog, the ROs as the parts desk sees them, what each needs (ordered / received / staged), returns.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   binList flush catAll cat kits lineOf rOf rows retWhy retNext late counterAsk … (20 functions, 58 constants)
   state      ptDone ptSet returns ros
   uses       access/ data/ kit/ pages/ pages/inbox/ pages/inventory/ pages/triage/ ro/ state/
*/
  const ic = PG.ic, kbd = PG.kbd, esc = PG.e;
  const p2 = n => String(n).padStart(2, '0');
  const hm = m => p2(Math.floor(m / 60)) + ':' + p2(Math.floor(m % 60));
  const usd = n => typeof permCost === 'function' && !permCost() ? '—' : '$' + (+n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });   /* Parsec 13 */
  const usd0 = n => typeof permCost === 'function' && !permCost() ? '—' : '$' + Math.round(+n || 0).toLocaleString('en-US');
  const DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dOf = k => { const [y, m, d] = String(k).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
  const kOf = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  const addD = (k, n) => { const d = dOf(k); d.setDate(d.getDate() + n); return kOf(d); };
  const bizD = (k, n) => { let d = dOf(k); while(n > 0){ d.setDate(d.getDate() + 1); if(d.getDay() && d.getDay() < 6) n--; } return kOf(d); };
  const short = k => { if(!k) return '—'; const d = dOf(k); return DN[d.getDay()] + ' ' + (d.getMonth() + 1) + '/' + d.getDate(); };
  const md = k => { const d = dOf(k); return (d.getMonth() + 1) + '/' + d.getDate(); };
  const dd = (a, b) => Math.round((dOf(b) - dOf(a)) / 86400000);
  const tm = iso => { if(!iso) return '—'; const d = new Date(iso); return localDay(iso) === TODAY() ? hm(d.getHours() * 60 + d.getMinutes()) : md(localDay(iso)) + ' ' + hm(d.getHours() * 60 + d.getMinutes()); };
  const TODAY = () => todayStr();
  const lc = s => /^[A-Z][a-z]/.test(s || '') ? s[0].toLowerCase() + s.slice(1) : (s || '');
  const F = n => PG.first(n || '') || '—';
  /* Parsec 14: who runs the parts desk (order, chase, check in, stage, returns) — everyone else sees it, read only */
  const mayP = () => typeof can !== 'function' || can('p.order');
  const U = { view: 'desk', sel: null, pop: null, kb: false, open: {}, cq: '', cflt: 'all', kopen: {}, rflt: 'all', rsel: null, sg: {}, cc: {}, ask: [] };
  /* ---------- the shop's parts settings ---------- */
  const set = () => STATE.ptSet && typeof STATE.ptSet === 'object' ? STATE.ptSet : (STATE.ptSet = {});
  const SUPK = ['pdc', 'vor', 'fp'];
  const SUP0 = { pdc: 'Volvo PDC', vor: 'PDC rush', fp: 'FleetPride', stock: 'Stock' };
  const supName = k => { const v = set()['sup_' + k]; return v ? String(v).split('·')[0].trim() : SUP0[k] || k || '—'; };
  function binList(key, pre, n){ const v = String(set()[key] || ''), m = /([A-Z]+)\s*(\d+)\s*[–-]\s*[A-Z]*\s*(\d+)/i.exec(v); const L = []; const a = m ? +m[2] : 1, b = m ? +m[3] : n, p = m ? m[1].toUpperCase() : pre; for(let i = a; i <= b && L.length < 40; i++) L.push(p + i); return L; }
  const BINS = () => binList('bin_a', 'A', 8);
  const retStore = () => Array.isArray(STATE.returns) ? STATE.returns : (STATE.returns = []);
  const doneStore = () => STATE.ptDone && typeof STATE.ptDone === 'object' ? STATE.ptDone : (STATE.ptDone = {});
  /* ---------- the catalog: the Parts list, with on hand, min and bin ---------- */
  let CACHE = null;
  function flush(){ CACHE = null; }
  function catAll(){ if(CACHE && CACHE.C) return CACHE.C; CACHE = CACHE || {}; const C = [];
    invList().forEach(it => { if(it.kit) return; C.push({ id: it.id, pn: String(it.pn || '').trim(), desc: it.desc || '', oh: +it.oh || 0, bin: it.bin || '', price: priceOf(it.price) || 0, cost: +it.cost || 0, fit: it.fit || [it.engine, it.model, it.year].filter(Boolean).join(' · ') || '', min: +it.min || 0, raw: it }); });
    return (CACHE.C = C); }
  function cat(pn){ const k = invPnKey(pn); if(!k) return null; return catAll().find(c => invPnKey(c.pn) === k) || null; }
  function kits(){ return invList().filter(it => it.kit).map(k => ({ id: k.id, pn: k.pn || 'KIT', desc: k.desc || 'Kit', fit: [k.engine, k.model, k.year].filter(Boolean).join(' · '), kids: (k.children || []).map(c => [c.pn, +c.qty || 1, c]) })); }
  /* ---------- the ROs, as the parts desk sees them ---------- */
  function lineOf(p){ return { id: p.id, pn: String(p.partNumber || '').trim(), desc: p.description || p.partNumber || 'Part', qty: parseFloat(p.qty) || 1, price: priceOf(p.price) || 0, st: p.status || 'Not Ordered', sup: p.sup || '', po: p.po || '', ord: p.ordAt ? localDay(p.ordAt) : '', eta: p.eta || '', bin: p.bin || '', rcv: p.rcvAt || (p.status === 'Received' || p.status === 'Staged' ? p.statusChangedAt : ''), pk: p.pkAt || (p.status === 'Picked up' ? p.statusChangedAt : ''), raw: p }; }
  const needAppr = (ro, op) => !op.appr && +op.quoted > 0 && ['WARR', 'RECALL'].indexOf(opJobType(op)) < 0;
  function rOf(ro){
    const s = spotOf(ro.location), ops = raLive(ro).filter(op => !op.declined).map(op => ({ id: op.id, cmp: op.complaint || 'Operation', jt: ['WARR', 'RECALL', 'COMEBACK'].indexOf(opJobType(op)) > -1 ? opJobType(op) : '', appr: !needAppr(ro, op), op, parts: opRealParts(op).map(lineOf) }));
    const jt = ops.map(o => o.jt).filter(Boolean)[0] || '';
    return { id: ro.id, no: tgNum(ro), cust: ro.customerName || '—', unit: ro.unitNumber || '—', veh: [ro.year, ro.make || 'Volvo', ro.model].filter(Boolean).join(' '), eng: ro.engineType || '', vin: ro.vin ? '…' + String(ro.vin).slice(-8) : '—', spot: s ? tgSpotLbl(s) : (ro.location || '—'), bay: /^(Bay|UpTime|Awning)/.test(s || ''), tech: ro.assignedTech || '', wr: PG.person('Service writer'), jt, ops, ro, route: ro.route || null };
  }
  function rows(){ if(CACHE && CACHE.R) return CACHE.R; CACHE = CACHE || {};
    const T = retStore(), R = [];
    STATE.ros.forEach(ro => { if(ro.id === SHOP_RO_ID || ro.shop) return; const open = !roIsDone(ro), rt = T.some(t => t.ro === ro.id && !['credited', 'scrapped', 'back'].includes(t.st)), dn = doneStore()[ro.id] && localDay(doneStore()[ro.id].at) === TODAY();
      if(open || rt || dn) R.push(rOf(ro)); });
    return (CACHE.R = R); }
  const get = id => rows().find(r => r.id === id) || null;
  const lines = r => r.ops.flatMap(o => o.parts);
  /* what a part costs us: the catalog item by part number, for the check-in box */
  const costHint = q => { const c = cat(q.pn); return c && c.cost > 0 ? c.cost : ''; };
  const allLines = () => rows().flatMap(r => lines(r).map(q => ({ r, q })));
  const findLine = pid => allLines().find(x => x.q.id === pid) || null;
  /* returns */
  const getT = id => retStore().find(t => t.id === id), retsOf = r => retStore().filter(t => t.ro === r.id);
  const KIND = { warranty: 'Warranty', core: 'Core', supplier: 'Supplier' };
  const RST = { hold: 'Holding', ra: 'Needs an RA', ship: 'Ready to ship', shipped: 'Shipped', credited: 'Credited', scrapped: 'Scrapped', back: 'Given back' };
  const retAct = t => t.st === 'ra' ? ['ra', 'Ask for RA…'] : t.st === 'ship' ? ['ship', 'Ship…'] : (t.st === 'hold' && t.by && t.by <= TODAY()) ? ['hold', 'Done holding…'] : (t.st === 'shipped' && t.kind !== 'warranty') ? ['credit', 'Credit in…'] : null;
  const needs = t => !!retAct(t) && t.st !== 'shipped';
  const retLate = t => (t.st === 'hold' && t.by && t.by <= TODAY()) || (t.st === 'ship' && t.by && dd(TODAY(), t.by) <= 5);
  const rstTxt = t => t.st === 'shipped' ? (t.kind === 'warranty' ? 'Shipped' : 'Shipped · credit due') : t.st === 'hold' && t.by && t.by <= TODAY() ? 'Hold is over' : RST[t.st];
  /* Parsec 14: a return's status in the shop's one look (st14) */
  const RST_LOOK = { hold: ['hold', 'ring'], over: ['wait', 'wait'], ra: ['wait', 'wait'], ship: ['tech', 'q'], shipped: ['run', 'done'], due: ['cust', 'q'], credited: ['run', 'rel'], scrapped: ['hold', 'no'], back: ['hold', 'rel'] };
  const rstSt = (t, o) => { const k = t.st === 'hold' && t.by && t.by <= TODAY() ? 'over' : t.st === 'shipped' && t.kind !== 'warranty' ? 'due' : t.st, L = RST_LOOK[k] || ['hold', 'ring']; return pgSt('any', rstTxt(t), Object.assign({ tone: L[0], ic: L[1], cls: 'sm', size: 12 }, o || {})); };
  
  function retWhy(t){
    if(t.st === 'ship') return t.kind === 'warranty' ? `Volvo wants the ${lc(t.desc)} back · ship by ${short(t.by)}` : t.kind === 'core' ? `${t.desc} · ${usd0(t.credit)} credit · back by ${short(t.by)}` : `${t.desc} × ${t.qty} · RA ${t.ra} · ready to ship`;
    if(t.st === 'ra') return `${t.desc} · ${lc(t.why)} · needs an RA`;
    if(t.st === 'hold') return `${t.id} ${lc(t.desc)} · hold ended ${short(t.by)} · scrap or keep`;
    return `${t.desc} · ${rstTxt(t)}`; }
  function retNext(t){
    if(t.st === 'ship') return t.kind === 'warranty' ? `Volvo wants the ${lc(t.desc)} back — tag ${t.id}, shelf ${t.shelf}${t.ra ? ', RA ' + t.ra : ''}. Ship by ${short(t.by)}.` : t.kind === 'core' ? `Send the ${lc(t.desc)} back by ${short(t.by)} — ${usd0(t.credit)} core credit when it lands.` : `${t.desc} × ${t.qty} has RA ${t.ra} — ship it to ${t.to} for ${usd(t.credit)} credit.`;
    if(t.st === 'ra') return `${t.desc}: ${lc(t.why)}. Ask ${t.to} for a return authorization (RA).`;
    if(t.st === 'hold') return `The hold on ${t.id} ended ${short(t.by)} — scrap it, keep it longer, or give it back to the customer.`;
    return `${t.id} · ${rstTxt(t)}.`; }
  /* ---------- what each RO needs from Parts ---------- */
  const IN_ST = ['Received', 'Staged', 'Picked up', 'Installed'], inHand = p => IN_ST.includes(p.st), withTech = p => p.st === 'Picked up' || p.st === 'Installed';
  const STS = ['Not Ordered', 'Ordered', 'Backordered', 'Received', 'Staged', 'Picked up', 'Installed'];
  const STH = { 'Not Ordered': 'still to get', 'Ordered': 'on the way', 'Backordered': 'supplier is short', 'Received': 'checked in · no bin yet', 'Staged': 'on a bin for the tech', 'Picked up': 'the tech has it', 'Installed': 'on the truck' };
  
  function late(p){ const T = TODAY(); if(p.st === 'Backordered') return { k: 'bo', t: p.eta ? 'backordered · now ' + short(p.eta) : 'backordered · no date' };
    if(p.st !== 'Ordered') return null;
    if(p.eta && p.eta < T){ const n = dd(p.eta, T); return { k: 'late', t: `due ${short(p.eta)} · ${n} d late`, n }; }
    if(!p.eta && p.ord && dd(p.ord, T) >= 5) return { k: 'noeta', t: `ordered ${dd(p.ord, T)} d ago · no ETA` }; return null; }
  /* asks waiting at the counter: a technician asked Parts for a part (Console or phone) */
  function counterAsk(r){ if(typeof IB === 'undefined') return null; const pp = PG.person('Parts'); if(!pp) return null;
    return IB.itemsFor(pp).filter(n => n.ro === r.id && n.src === 'console' && (n.k === 'men' || n.k === 'ask') && (n.st === 'new' || n.st === 'read') && /part/i.test(n.t)).sort((a, b) => new Date(a.at) - new Date(b.at))[0] || null; }
  function lastMove(r){ return Math.max(0, ...lines(r).map(p => new Date(p.raw.statusChangedAt || 0).getTime())); }
  function stateOf(r){
    const d = doneStore()[r.id]; if(d && new Date(d.at).getTime() >= lastMove(r) && localDay(d.at) === TODAY()) return 'done';
    if(roIsDone(r.ro)) return retsOf(r).some(needs) ? 'ret' : 'quiet';
    if(counterAsk(r)) return 'counter';
    if(r.route && r.route.to === 'parts' && r.route.state === 'pending') return 'sent';
    const L = lines(r), Lok = r.ops.filter(o => o.appr).flatMap(o => o.parts);
    if(Lok.some(p => p.st === 'Not Ordered')) return 'order';
    if(L.some(late)) return 'late';
    if(L.length && L.every(inHand) && !L.every(withTech)) return 'in';
    if(retsOf(r).some(needs)) return 'ret';
    if(L.length && L.every(withTech)) return 'tech';
    if(!L.length || L.every(p => p.st === 'Not Ordered')) return 'quiet';
    return 'way';
  }
  const GROUPS = [['counter', 'At the counter', 'user'], ['sent', 'Sent to you', 'inbox'], ['order', 'To order', 'cart'], ['late', 'Late', 'clock'], ['in', 'Arrived', 'check'], ['ret', 'Returns', 'undo']];
  function grouped(){ if(CACHE && CACHE.G) return CACHE.G; const G = { counter: [], sent: [], order: [], late: [], in: [], ret: [], way: [], tech: [], quiet: [], done: [] }; rows().forEach(r => G[stateOf(r)].push(r)); CACHE.G = G; return G; }
  const flat = () => { const G = grouped(); return GROUPS.flatMap(g => G[g[0]]).concat(U.open.way ? G.way : [], U.open.tech ? G.tech : []).map(r => r.id); };
  const binOf = r => { const b = lines(r).filter(p => p.st === 'Staged').map(p => p.bin).filter(Boolean); return b[0] || null; };
  const rcvd = r => lines(r).filter(p => p.st === 'Received');
  const ago = iso => iso ? Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000)) : 0;
  function why(r){ const st = stateOf(r), L = lines(r);
    if(st === 'counter'){ const a = counterAsk(r); return { t: `Waiting ${PG.ageW(Date.now() - new Date(a.at))} · ${F(a.from)} · ${lc(a.q || a.t)}`, late: true }; }
    if(st === 'sent') return { t: `From ${F(r.route.by)} ${tm(r.route.at)}${r.route.reason ? ' · ' + r.route.reason : ''}`, late: false };
    if(st === 'order'){ const no = r.ops.filter(o => o.appr).flatMap(o => o.parts).filter(p => p.st === 'Not Ordered'), stk = no.filter(p => (cat(p.pn) || {}).oh >= p.qty).length; const ap = r.ops.map(o => o.op.appr && o.op.appr.at).filter(Boolean).sort().pop(); return { t: `${ap ? 'Approved ' + tm(ap) + ' · ' : ''}${no.length} part${no.length > 1 ? 's' : ''}${stk ? ` · ${stk} on the shelf` : ''}` }; }
    if(st === 'late'){ const p = L.find(late), l = late(p); return { t: r.bay ? `${r.spot} tied up · ${lc(p.desc)} ${l.t}` : `${p.desc} · ${l.t}`, late: true }; }
    if(st === 'in'){ const rc = rcvd(r); return rc.length ? { t: `${rc[0].desc} checked in ${tm(rc[0].rcv)} · needs a bin`, late: true } : { t: `All ${L.length} in · bin ${binOf(r) || '—'}` }; }
    if(st === 'ret'){ const t = retsOf(r).find(needs); return t ? { t: retWhy(t), late: retLate(t) } : { t: 'Returns' }; }
    if(st === 'way'){ const p = L.filter(x => !inHand(x) && x.st !== 'Not Ordered').sort((a, b) => (a.eta || '9') < (b.eta || '9') ? -1 : 1)[0]; return { t: p ? `${p.desc} · due ${p.eta === TODAY() ? 'today' : p.eta ? short(p.eta) : 'no date'}` : '—' }; }
    if(st === 'tech') return { t: `${F(r.tech)} has every part` };
    if(st === 'quiet'){ const w = r.ops.some(o => !o.appr && o.parts.length); return { t: w ? 'Waiting on approval' : 'Nothing for Parts' }; }
    return { t: 'Cleared' }; }
  const BTN = { counter: () => 'Handle it', sent: () => 'Accept', order: () => 'Order…', late: () => 'Chase…', in: r => rcvd(r).length ? 'Stage it' : 'Send to ' + F(PG.person('Foreman') || 'Foreman'), ret: r => { const t = retsOf(r).find(needs); return t ? retAct(t)[1] : 'Open'; }, way: () => 'Open', tech: () => 'Open', quiet: () => 'Open', done: () => 'Open' };
  /* the day's log on each RO: hand-offs, orders, check-ins */
  function logIt(r, t){ const ro = r.ro || getRO(r.id); if(!ro) return; ro.ptLog = ro.ptLog || []; ro.ptLog.unshift({ at: nowIso(), t, by: PG.me().name }); if(ro.ptLog.length > 60) ro.ptLog.length = 60; }
  function logOf(r){ const ro = r.ro, L = (ro.ptLog || []).map(x => [x.at, x.t]);
    (ro.handoffs || []).slice(-6).forEach(h => { if(h.to === 'parts' || h.from === 'parts') L.push([h.at, `<b>${esc(F(h.by))}</b> ${h.kind === 'accept' ? 'accepted' : h.kind === 'return' ? 'sent back' : '→ ' + esc(RT_LBL[h.to] || h.to)}${h.note ? ' · ' + esc(h.note) : ''}`]); });
    return L.sort((a, b) => new Date(b[0]) - new Date(a[0])).slice(0, 12); }
  /* changing a line: the status, and what goes with it */
  function setSt(q, v, extra){ const p = q.raw; p.status = v; p.statusChangedAt = nowIso(); Object.assign(p, extra || {});
    if(v === 'Received'){ p.bin = ''; p.rcvAt = p.rcvAt || nowIso(); } if(v === 'Staged'){ p.rcvAt = p.rcvAt || nowIso(); } if(v === 'Picked up' || v === 'Installed'){ p.pkAt = p.pkAt || nowIso(); p.bin = ''; } if(v === 'Not Ordered'){ p.bin = ''; p.po = ''; p.eta = ''; } }
  const usedBins = () => new Set(allLines().filter(x => x.q.st === 'Staged').map(x => x.q.bin));
  const nextBin = () => { const used = usedBins(); return BINS().find(b => !used.has(b)) || BINS()[BINS().length - 1] || 'A1'; };
  function nextPO(){ const s = set(); const n = (+s.poNext || 55831); s.poNext = n + 1; return String(n); }
