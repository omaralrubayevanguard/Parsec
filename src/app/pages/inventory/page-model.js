/* Parsec · pages/inventory · page-model.js
   The Inventory page's model: sample stock seeded once, what the ROs still need, shelves, reorder and counts.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   hash seed idx items shelves reorder counts ic esc kbd num qf … (7 functions, 22 constants)
   state      ros
   uses       access/ data/ pages/ ro/ state/
*/
  const ic = PG.ic, esc = PG.e, kbd = PG.kbd;
  const num = v => { const n = parseFloat(String(v == null ? '' : v).replace(/[$,\s]/g, '')); return isFinite(n) ? n : 0; };
  const qf = n => String(Math.round((+n || 0) * 100) / 100);
  const usd = n => typeof permCost === 'function' && !permCost() ? '—' : (n < 0 ? '−$' : '$') + Math.abs(+n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });   /* Parsec 13 */
  const usd0 = n => typeof permCost === 'function' && !permCost() ? '—' : '$' + Math.round(+n || 0).toLocaleString('en-US');
  const DAY = 864e5;
  const md = t => { if(!t) return '—'; const d = new Date(t); if(isNaN(d)) return '—'; return (d.getMonth() + 1) + '/' + d.getDate(); };
  const when = t => { try{ return t ? PG.whenL(t) : '—'; }catch(e){ return md(t); } };
  const kOf = (pn, desc) => invPnKey(pn) || (invDescKey(desc) ? 'd:' + invDescKey(desc) : '');
  const U = { view: 'stock', q: '', flt: 'all', shelf: '', sel: null, pop: null, kb: false, sort: ['st', 1], kopen: {}, cnt: {}, csh: null, aq: '', _me: null };
  const canEd = () => { const s = viewAsStaff(); return !s || ['Parts', 'Manager', 'Foreman'].indexOf(s.role) > -1; };
  const WHY = ['Counted', 'Damaged', 'Lost or missing', 'Found', 'Returned to supplier', 'Used without an RO', 'Correction'];
  const STT = { out: ['Out', 'out'], short: ['Short', 'short'], low: ['Low', 'low'], ok: ['In stock', 'ok'], none: ['Not stocked', 'none'], kit: ['Kit', 'kit'] };
  const STO = { short: 0, out: 1, low: 2, ok: 3, none: 4, kit: 5 };
  /* ---------- sample stock: the sample parts get counts, mins and bins once, so the page has something to show ---------- */
  function hash(s){ let h = 2166136261; for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function seed(){ let n = 0; invList().forEach(it => { if(!it || !it.sample || it.kit || it.oh != null) return; const h = hash(String(it.id || it.pn || it.desc));
      it.min = 1 + h % 4; it.max = it.min * 2 + (h >>> 4) % 3; it.oh = (h >>> 7) % 8 === 0 ? 0 : Math.max(1, (h >>> 9) % (it.max + 2)); it.bin = 'ABCDEF'.charAt((h >>> 12) % 6) + (1 + (h >>> 15) % 8);
      if(num(it.price)) it.cost = (num(it.price) * .62).toFixed(2); n++; });
    if(n) try{ persistLocal(); }catch(e){} }
  /* ---------- what the ROs say: still needed (not ordered), on order for an RO, used ---------- */
  let C = null; const flush = () => { C = null; };
  function idx(){
    if(C) return C; C = { need: {}, ord: {}, use: {} };
    const add = (m, k, x) => { (m[k] || (m[k] = [])).push(x); };
    (STATE.ros || []).forEach(ro => { if(ro.id === SHOP_RO_ID || ro.shop) return; let open = true; try{ open = !roIsDone(ro); }catch(e){}
      (ro.operations || []).forEach((op, oi) => (op.parts || []).forEach(p => { if(!p) return; const k = kOf(p.partNumber, p.description); if(!k) return;
        const q = num(p.qty) || 1, st = p.status || 'Not Ordered', x = { ro, op, oi, p, q, st };
        if(op.declined) return;
        if(open && st === 'Not Ordered') add(C.need, k, x);
        else if(open && (st === 'Ordered' || st === 'Backordered')) add(C.ord, k, x);
        else if(st !== 'Not Ordered' && st !== 'Ordered' && st !== 'Backordered'){ x.at = p.pkAt || p.rcvAt || p.statusChangedAt || ro.dateClosed || ro.dateOpened || ''; add(C.use, k, x); } })); });
    Object.keys(C.use).forEach(k => C.use[k].sort((a, b) => String(b.at || '').localeCompare(String(a.at || ''))));
    return C; }
  const sumQ = L => (L || []).reduce((s, x) => s + x.q, 0);
  function items(){
    if(C && C.I) return C.I; idx(); const since = Date.now() - 90 * DAY;
    const I = invList().filter(Boolean).map(it => { const k = kOf(it.pn, it.desc), need = sumQ(C.need[k]), ordRo = sumQ(C.ord[k]), so = num(it.onOrder), oh = num(it.oh), min = num(it.min), uses = C.use[k] || [];
      const max = num(it.max) || min * 2, u90 = uses.filter(x => x.at && new Date(x.at).getTime() >= since).reduce((s, x) => s + x.q, 0);
      const log = Array.isArray(it.log) ? it.log : [], cnt = log.filter(l => l.k === 'cnt' || (l.k === 'adj' && l.why === 'Counted')).slice(-1)[0];
      return { id: it.id, it, k, kit: !!it.kit, pn: String(it.pn || '').trim(), desc: String(it.desc || '').trim(), bin: String(it.bin || '').trim().toUpperCase(), oh, need, ordRo, so, ord: so + ordRo, avail: oh - need, min, max,
        price: priceOf(it.price), cost: num(it.cost), fit: [it.engine, it.model, it.year].filter(Boolean).join(' · '), uses, u90, last: uses[0] ? uses[0].at : '', log, counted: cnt ? cnt.at : '', stocked: min > 0 || oh > 0 || !!it.stock }; });
    const byK = {}; I.forEach(x => { if(!x.kit && x.k && !byK[x.k]) byK[x.k] = x; });
    I.forEach(x => {
      if(!x.kit){ x.st = !x.stocked ? (x.need ? 'none' : 'none') : x.oh <= 0 ? 'out' : x.need > x.oh ? 'short' : x.min && x.oh < x.min ? 'low' : 'ok'; return; }
      x.kids = (x.it.children || []).map(c => { const q = num(c.qty) || 1, m = byK[kOf(c.pn, c.desc)] || null; return { c, q, m, oh: m ? m.oh : 0, bin: m ? m.bin : '', price: m && m.price ? m.price : priceOf(c.price), can: m ? Math.floor(m.oh / q) : 0 }; });
      x.oh = x.kids.length ? Math.min.apply(null, x.kids.map(z => z.can)) : 0; x.avail = x.oh; x.price = x.kids.reduce((s, z) => s + z.price * z.q, 0); x.st = 'kit'; });
    return (C.I = I); }
  const get = id => items().find(x => x.id === id) || null;
  const shelfOf = b => b ? (/^[A-Z]+/.exec(b) || [b.charAt(0)])[0] : '';
  function shelves(){ const S = {}; items().forEach(x => { if(!x.kit) S[shelfOf(x.bin) || '—'] = (S[shelfOf(x.bin) || '—'] || 0) + 1; }); return Object.keys(S).sort((a, b) => a === '—' ? 1 : b === '—' ? -1 : a.localeCompare(b)).map(k => [k, S[k]]); }
  const val = x => x.oh * (x.cost || x.price);
  function reorder(){ const R = [], S = [];
    items().forEach(x => { if(x.kit) return;
      if(x.min > 0 && x.oh + x.so < x.min) R.push({ x, q: Math.max(1, Math.ceil(x.max - x.oh - x.so)) });
      else if(x.stocked && x.need > x.oh + x.so + x.ordRo) S.push({ x, q: Math.ceil(x.need - x.oh - x.so - x.ordRo) }); });
    R.sort((a, b) => (a.x.bin || 'ZZ').localeCompare(b.x.bin || 'ZZ') || a.x.desc.localeCompare(b.x.desc)); return { R, S }; }
  function counts(){ const I = items().filter(x => !x.kit), o = { all: I.length, stocked: 0, low: 0, out: 0, short: 0, none: 0, nobin: 0, kits: items().length - I.length };
    I.forEach(x => { if(x.stocked) o.stocked++; if(x.st === 'low') o.low++; if(x.st === 'out') o.out++; if(x.st === 'short') o.short++; if(x.st === 'none') o.none++; if(!x.bin && x.stocked) o.nobin++; }); return o; }
