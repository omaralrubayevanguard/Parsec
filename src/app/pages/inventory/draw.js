/* Parsec · pages/inventory · draw.js
   The Inventory page's drawing: the list, the pane for one part, reorder, count shelf by shelf, activity.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   hay shown stPill view head bar th row vStock gauge sugg roLine … (22 functions, 1 constant)
   uses       kit/ pages/ pages/triage/ shell/
*/
  /* ---------- the list ---------- */
  function hay(x){ return [x.pn, x.desc, x.bin, x.fit].concat(x.kit ? (x.it.children || []).map(c => c.pn + ' ' + c.desc) : []).join(' ').toLowerCase(); }
  function shown(){
    const q = U.q.trim().toLowerCase(), f = U.flt;
    let L = items().filter(x => f === 'kits' ? x.kit : !x.kit);
    if(f === 'stocked') L = L.filter(x => x.stocked); else if(f === 'low') L = L.filter(x => x.st === 'low'); else if(f === 'out') L = L.filter(x => x.st === 'out');
    else if(f === 'short') L = L.filter(x => x.st === 'short'); else if(f === 'nobin') L = L.filter(x => x.stocked && !x.bin); else if(f === 'none') L = L.filter(x => x.st === 'none');
    if(U.shelf) L = L.filter(x => (shelfOf(x.bin) || '—') === U.shelf);
    if(q) L = L.filter(x => q.split(/\s+/).every(w => hay(x).indexOf(w) > -1));
    const [k, d] = U.sort, s = (a, b) => typeof a === 'number' ? a - b : String(a || '').localeCompare(String(b || ''), undefined, { numeric: true });
    const key = { st: x => STO[x.st] * 1000 + (x.stocked ? 0 : 500), desc: x => x.desc.toLowerCase(), pn: x => x.pn, bin: x => x.bin || '~', oh: x => x.oh, avail: x => x.avail, ord: x => x.ord, min: x => x.min, price: x => x.price, last: x => x.last || '' }[k] || (x => x.desc);
    return L.slice().sort((a, b) => (s(key(a), key(b)) * d) || a.desc.localeCompare(b.desc)); }
  /* Parsec 14: stock levels in the shop's one status look — icon + word (st14) */
  const STT_LOOK = { out: ['bad', 'bad'], short: ['bad', 'bad'], low: ['wait', 'wait'], ok: ['run', 'done'], none: ['hold', 'ring'], kit: ['acc', 'half'] };
  function stPill(x){ const t = STT[x.st] || STT.none, L = STT_LOOK[x.st] || STT_LOOK.none; return pgSt('any', t[0], { tone: L[0], ic: L[1], cls: 'sm ivn-st', size: 12 }); }
  function view(){
    flush(); seed(); const me0 = PG.me().name; if(U._me !== me0){ U._me = me0; U.view = 'stock'; U.sel = null; U.pop = null; }
    if(!canEd() && U.view === 'count') U.view = 'stock';
    if(U.sel && !get(U.sel)) U.sel = null;
    const v = U.view, body = v === 'reorder' ? vReorder() : v === 'count' ? vCount() : v === 'act' ? vAct() : vStock();
    return `<div class="tg ivn${U.sel && v === 'stock' ? ' has-sel' : ''}" data-pg="inventory">${head()}<div class="tg-body ivn-b v-${v}"><div class="tg-main">${body}</div>${pop()}</div></div>`;
  }
  function head(){
    const o = counts(), R = reorder(), I = items().filter(x => !x.kit), tv = I.reduce((s, x) => s + val(x), 0);
    const f = (k, n, t, w) => n ? `<button class="tg-hf${w ? ' w' : ''}" data-a="hf" data-k="${k}"><b>${n}</b>${t}</button><i>·</i>` : '';
    const vs = [['stock', 'box', 'Stock'], ['reorder', 'cart', 'Reorder' + (R.R.length ? ' · ' + R.R.length : '')], ['count', 'list', 'Count'], ['act', 'history', 'Activity']].filter(x => x[0] !== 'count' || canEd());
    return `<header class="tg-head"><h1 class="tg-h1">Inventory</h1><span class="tg-facts"><span class="tg-hf" style="cursor:default" data-tip="Stock value|${o.stocked} parts stocked · on hand × cost (price when there’s no cost)"><b>${usd0(tv)}</b>on the shelves</span><i>·</i>${f('short', o.short, 'short', true)}${f('out', o.out, 'out', true)}${f('low', o.low, 'low')}</span>
    <div class="tg-views">${vs.map((x, i) => `<button class="${U.view === x[0] ? 'on' : ''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i + 1})">${ic(x[1], 14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>
    ${psmBtn('inventory', U.view === 'act' ? 'Find a part in the activity' : 'Find a part')}${canEd() ? `<button class="btn ib tg-srch-b" data-a="pop" data-p="more" title="Import, download">${ic('more', 16)}</button><button class="btn btn-sm ivn-kitb" data-a="pop" data-p="new" data-kit="1" title="New kit">${ic('kit', 15)}Kit</button><button class="btn btn-sm btn-primary" data-a="pop" data-p="new" title="New part (N)">${ic('plus', 15)}Part</button>` : `<span class="ivn-ro">${ic('eye', 13)}View only</span>`}</header>`;
  }
  function bar(){
    const o = counts(), F = [['all', 'All', o.all], ['stocked', 'Stocked', o.stocked], ['short', 'Short', o.short], ['out', 'Out', o.out], ['low', 'Low', o.low], ['none', 'Not stocked', o.none], ['nobin', 'No bin', o.nobin], ['kits', 'Kits', o.kits]];
    const sh = shelves();
    return `<div class="ivn-bar">
      <div class="ivn-chips">${F.filter(x => x[0] === 'all' || x[2]).map(x => `<button class="tg-chip${U.flt === x[0] ? ' on' : ''}" data-a="flt" data-v="${x[0]}">${x[1]}<small>${x[2]}</small></button>`).join('')}</div>
      ${sh.length > 1 ? `<select class="ivn-shs" data-ch="shelf" aria-label="Shelf"><option value="">Every shelf</option>${sh.map(s => `<option value="${esc(s[0])}"${U.shelf === s[0] ? ' selected' : ''}>${s[0] === '—' ? 'No bin' : 'Shelf ' + esc(s[0])} · ${s[1]}</option>`).join('')}</select>` : ''}</div>`;
  }
  function th(k, t, cls){ const on = U.sort[0] === k; return `<button class="ivn-th${cls ? ' ' + cls : ''}${on ? ' on' : ''}" data-a="sort" data-k="${k}">${t}${on ? `<span class="ar">${U.sort[1] > 0 ? '↑' : '↓'}</span>` : ''}</button>`; }
  function row(x){
    const on = U.sel === x.id, kid = x.kit && U.kopen[x.id];
    const av = x.need ? `<span class="${x.avail < 0 ? 'neg' : ''}">${qf(x.avail)}</span><small>${qf(x.need)} for RO${x.need === 1 ? '' : 's'}</small>` : `<span>${x.kit ? '' : qf(x.avail)}</span>`;
    const oo = x.ord ? `<span>${qf(x.ord)}</span><small>${x.so && x.ordRo ? qf(x.so) + ' stock · ' + qf(x.ordRo) + ' RO' : x.so ? 'stock order' : 'for RO' + (x.ordRo === 1 ? '' : 's')}</small>` : '<span class="mu">—</span>';
    let h = `<div class="ivn-r${on ? ' on' : ''}${on && U.kb ? ' kb' : ''} st-${x.st}" data-a="sel" data-id="${x.id}" role="button" tabindex="0" aria-pressed="${on}">
      <span class="c0">${x.kit ? `<button class="ivn-car${kid ? ' open' : ''}" data-a="kit" data-id="${x.id}" title="Show the parts in this kit" aria-expanded="${!!kid}">${ic('chevR', 12)}</button>` : '<i class="ivn-dot"></i>'}</span>
      <span class="d">${x.kit ? `<span class="ivn-kb">KIT · ${(x.it.children || []).length}</span>` : ''}<b>${esc(x.desc || x.pn || 'Part')}</b><small>${esc(x.pn || 'no part #')}${x.bin ? `<span class="pbn"> · ${esc(x.bin)}</span>` : ''}${x.fit ? ' · ' + esc(x.fit) : ''}</small></span>
      <span class="bn">${x.bin ? `<span class="ivn-bin">${esc(x.bin)}</span>` : '<span class="mu">—</span>'}</span>
      <span class="n oh">${x.kit ? `<span>${qf(x.oh)}</span><small>can build</small>` : `<span class="${x.st === 'out' ? 'neg' : x.st === 'low' ? 'wrn' : ''}">${qf(x.oh)}</span>`}</span>
      <span class="n av">${av}</span><span class="n oo">${oo}</span>
      <span class="n mm">${x.kit ? '' : x.min ? `<span>${qf(x.min)} · ${qf(x.max)}</span>` : '<span class="mu">—</span>'}</span>
      <span class="n pr">${x.price ? usd(x.price) : '<span class="mu">—</span>'}</span>
      <span class="n ls">${x.last ? `<span>${md(x.last)}</span><small>${x.u90 ? qf(x.u90) + ' in 90 d' : ''}</small>` : '<span class="mu">—</span>'}</span>
      <span class="sx">${stPill(x)}</span></div>`;
    if(kid) h += (x.kids || []).map(z => `<div class="ivn-r kid"><span class="c0"></span><span class="d"><b>${esc(z.c.desc || z.c.pn || 'Part')}</b><small>${esc(z.c.pn || 'no part #')} · × ${qf(z.q)}</small></span><span class="bn">${z.bin ? `<span class="ivn-bin">${esc(z.bin)}</span>` : '<span class="mu">—</span>'}</span><span class="n oh"><span>${z.m ? qf(z.oh) : '—'}</span></span><span class="n av"></span><span class="n oo"></span><span class="n mm"></span><span class="n pr">${z.price ? usd(z.price) : ''}</span><span class="n ls"></span><span class="sx">${z.m ? `<button class="btn btn-sm tg-gh" data-a="sel" data-id="${z.m.id}">Open</button>` : '<span class="mu">not on the list</span>'}</span></div>`).join('');
    return h; }
  function vStock(){
    const L = shown(), max = 400;
    const list = `<section class="ivn-list pg-scroll" data-scroll="ivn-list">${bar()}<div class="ivn-tbl"><div class="ivn-r h"><span class="c0"></span>${th('desc', 'Part', 'd')}${th('bin', 'Bin', 'bn')}${th('oh', 'On hand', 'n oh')}${th('avail', 'Available', 'n av')}${th('ord', 'On order', 'n oo')}${th('min', 'Min · max', 'n mm')}${th('price', 'Price', 'n pr')}${th('last', 'Last used', 'n ls')}${th('st', 'Status', 'sx')}</div>
      ${L.slice(0, max).map(row).join('') || `<div class="ivn-none">${U.q || U.flt !== 'all' || U.shelf ? 'Nothing matches — <button class="link-btn" data-a="clr">clear the search</button>.' : canEd() ? 'No parts yet. Add one, or import a parts list, a quote or a screenshot.' : 'No parts yet.'}</div>`}
      ${L.length > max ? `<div class="ivn-none">${L.length - max} more — search to narrow it down.</div>` : ''}</div></section>`;
    return `<div class="ivn-wrap">${list}<aside class="ivn-pane pg-scroll" data-scroll="ivn-pane">${U.sel ? pane(get(U.sel)) : glance()}</aside></div>`; }
  /* ---------- the pane: one part ---------- */
  function gauge(x){ if(x.kit || !(x.min || x.oh)) return '';
    const top = Math.max(x.max, x.oh, x.min, 1) * 1.2, p = v => Math.max(0, Math.min(100, v / top * 100)).toFixed(1) + '%';
    return `<div class="ivn-g" role="img" aria-label="${qf(x.oh)} on hand, min ${qf(x.min)}, max ${qf(x.max)}"><span class="tr"><i class="f ${x.st}" style="width:${p(x.oh)}"></i>${x.so ? `<i class="so" style="left:${p(x.oh)};width:${p(x.so)}"></i>` : ''}${x.min ? `<em class="mn" style="left:${p(x.min)}" title="Min — reorder below this"></em>` : ''}${x.max ? `<em class="mx" style="left:${p(x.max)}" title="Max — order up to this"></em>` : ''}</span>
      <span class="lg"><span><i class="f ${x.st}"></i>On hand ${qf(x.oh)}</span>${x.so ? `<span><i class="so"></i>Coming ${qf(x.so)}</span>` : ''}${x.min ? `<span><em class="mn"></em>Min ${qf(x.min)}</span><span><em class="mx"></em>Max ${qf(x.max)}</span>` : '<span>No min set — not reordered</span>'}</span></div>`; }
  function sugg(x){ if(x.kit || !x.u90) return ''; const mo = x.u90 / 3, sm = Math.max(1, Math.ceil(x.u90 / 90 * 14));
    return `<div class="ivn-sug">${ic('chart', 14)}<span>Used <b>${qf(x.u90)}</b> in the last 90 days — about ${qf(Math.round(mo * 10) / 10)} a month. A min of <b>${sm}</b> covers two weeks.</span>${canEd() && sm !== x.min ? `<button class="btn btn-sm" data-a="usemin" data-id="${x.id}" data-v="${sm}">Min ${sm} · max ${sm * 2}</button>` : ''}</div>`; }
  function roLine(z, kind){ const opN = z.oi + 1, chip = kind === 'need' ? pgSt('part', 'Not Ordered', { cls: 'sm ivn-pst', size: 12 }) : pgSt('part', z.st, { of: z.p, ofKind: 'part', cls: 'sm ivn-pst', size: 12, sub: z.p.eta ? '· ETA ' + md(z.p.eta) : '' });
    return `<button class="ivn-rl" data-a="ro" data-ro="${z.ro.id}" data-op="${z.op.id}" title="Open the RO"><span class="no">${esc(tgNum(z.ro))}</span><span class="t"><b>${esc(z.ro.customerName || '—')}</b><small>Op ${opN} · ${esc(z.op.complaint || 'Operation')}</small></span><span class="q">× ${qf(z.q)}</span>${chip}</button>`; }
  function logLine(l){ const t = l.k === 'rcv' ? `Received <b>+${qf(l.q)}</b>${l.ref ? ' · ' + esc(l.ref) : ''}` : l.k === 'cnt' ? (l.from === l.to ? `Counted <b>${qf(l.to)}</b> — matched` : `Counted <b>${qf(l.from)} → ${qf(l.to)}</b>`)
      : l.k === 'adj' ? `${esc(l.why || 'Adjusted')} <b>${qf(l.from)} → ${qf(l.to)}</b> <span class="${l.to - l.from < 0 ? 'neg' : 'pos'}">(${l.to - l.from > 0 ? '+' : ''}${qf(l.to - l.from)})</span>` : l.k === 'ord' ? `On the stock order <b>+${qf(l.q)}</b>` : l.k === 'set' ? esc(l.t || 'Changed') : l.k === 'new' ? 'Added to the list' : esc(l.t || l.k);
    return `<div class="ivn-ll"><span class="w">${esc(md(l.at))}</span><span class="t">${t}${l.note ? `<small>${esc(l.note)}</small>` : ''}</span><span class="by">${esc(PG.first(l.by || '') || '')}</span></div>`; }
  function pane(x){ if(!x) return glance();
    const ed = canEd(), dC = idx(), need = dC.need[x.k] || [], ord = dC.ord[x.k] || [];
    let h = `<div class="ivn-ph"><button class="btn btn-sm ib tg-gh ivn-back" data-a="unsel" title="Back to the list (Esc)">${ic('chevL', 15)}</button><div class="tt"><div class="ey">${stPill(x)}${x.bin ? `<span class="ivn-bin">${esc(x.bin)}</span>` : ''}${x.counted ? `<span class="mu">counted ${esc(md(x.counted))}</span>` : ''}</div><h2>${esc(x.desc || x.pn || 'Part')}</h2><div class="pn">${esc(x.pn || 'no part #')}${x.fit ? ' · ' + esc(x.fit) : ''}</div></div><button class="btn btn-sm ib tg-gh ivn-x" data-a="unsel" title="Close (Esc)">${ic('x', 15)}</button></div>`;
    if(x.kit){
      h += `<div class="ivn-nums k"><div><small>Can build</small><b>${qf(x.oh)}</b></div><div><small>Parts in it</small><b>${(x.kids || []).length}</b></div><div><small>Kit price</small><b class="sm">${usd(x.price)}</b></div></div>`;
      if(ed) h += `<div class="ivn-acts"><button class="btn btn-sm" data-a="pop" data-p="kadd" data-id="${x.id}">${ic('plus', 14)}Add a part</button><button class="btn btn-sm" data-a="pop" data-p="edit" data-id="${x.id}">${ic('pencil', 14)}Edit</button><button class="btn btn-sm ib tg-gh" data-a="pop" data-p="del" data-id="${x.id}" title="Delete this kit">${ic('trash', 14)}</button></div>`;
      h += `<div class="ivn-sec"><h3>In this kit</h3>${(x.kids || []).map((z, i) => `<div class="ivn-kr"><span class="t"><b>${esc(z.c.desc || z.c.pn || 'Part')}</b><small>${esc(z.c.pn || 'no part #')} · × ${qf(z.q)}${z.bin ? ' · ' + esc(z.bin) : ''}</small></span><span class="oh${z.m && z.oh < z.q ? ' neg' : ''}">${z.m ? qf(z.oh) + ' on hand' : 'not on the list'}</span>${z.m ? `<button class="btn btn-sm tg-gh" data-a="sel" data-id="${z.m.id}">Open</button>` : '<span></span>'}${ed ? `<button class="btn btn-sm ib tg-gh" data-a="kdel" data-id="${x.id}" data-i="${i}" title="Take it out of the kit">${ic('x', 13)}</button>` : ''}</div>`).join('') || '<div class="ivn-none sm">No parts in this kit yet.</div>'}</div>`;
      if(x.it.autoFrom) h += `<div class="ivn-sec"><h3>Where it came from</h3><div class="ivn-note">${ic('history', 13)}<span>Built by Parsec from a finished job — ${esc(x.it.autoFrom.ro || '')}${x.it.autoFrom.type ? ' · ' + esc(x.it.autoFrom.type) : ''}.</span></div></div>`;
      return h; }
    h += `<div class="ivn-nums"><div><small>On hand</small><b class="${x.st === 'out' ? 'neg' : x.st === 'low' ? 'wrn' : ''}">${qf(x.oh)}</b></div><div><small>Needed on ROs</small><b>${qf(x.need)}</b></div><div><small>Available</small><b class="${x.avail < 0 ? 'neg' : ''}">${qf(x.avail)}</b></div><div><small>On order</small><b>${qf(x.ord)}</b></div></div>`;
    if(ed) h += `<div class="ivn-acts"><button class="btn btn-sm btn-primary" data-a="pop" data-p="rcv" data-id="${x.id}">${ic('truck', 14)}Receive</button><button class="btn btn-sm" data-a="pop" data-p="adj" data-id="${x.id}">${ic('sliders', 14)}Adjust</button><button class="btn btn-sm" data-a="pop" data-p="edit" data-id="${x.id}">${ic('pencil', 14)}Edit</button><button class="btn btn-sm ib tg-gh" data-a="pop" data-p="del" data-id="${x.id}" title="Delete this part">${ic('trash', 14)}</button></div>`;
    h += `<div class="ivn-sec"><h3>Stock level</h3>${gauge(x) || '<div class="ivn-note">' + ic('info', 13) + '<span>Not stocked — it comes in when an RO needs it. Set a min to keep some on the shelf.</span></div>'}${sugg(x)}</div>`;
    if(need.length || ord.length) h += `<div class="ivn-sec"><h3>On open ROs</h3>${need.map(z => roLine(z, 'need')).join('')}${ord.map(z => roLine(z, 'ord')).join('')}</div>`;
    h += `<div class="ivn-sec"><h3>Money</h3><div class="ivn-kv"><span>Price</span><b>${x.price ? usd(x.price) : '—'}</b><span>Cost</span><b>${x.cost ? usd(x.cost) : '—'}</b><span>Margin</span><b>${x.price && x.cost ? Math.round((x.price - x.cost) / x.price * 100) + '%' : '—'}</b><span>On the shelf</span><b>${usd(val(x))}</b></div></div>`;
    if(x.uses.length) h += `<div class="ivn-sec"><h3>Used on <small>${x.uses.length} RO line${x.uses.length === 1 ? '' : 's'}</small></h3>${x.uses.slice(0, 8).map(z => `<button class="ivn-rl" data-a="ro" data-ro="${z.ro.id}" data-op="${z.op.id}" title="Open the RO"><span class="no">${esc(tgNum(z.ro))}</span><span class="t"><b>${esc(z.ro.customerName || '—')}</b><small>${esc(md(z.at))} · ${z.p.sup === 'stock' ? 'from stock' : 'ordered for it'}</small></span><span class="q">× ${qf(z.q)}</span>${pgSt('part', z.st, { of: z.p, ofKind: 'part', cls: 'sm ivn-pst', size: 12 })}</button>`).join('')}</div>`;
    h += `<div class="ivn-sec"><h3>History</h3>${x.log.slice().reverse().slice(0, 12).map(logLine).join('') || '<div class="ivn-none sm">Nothing yet — receiving, counts and adjustments show here.</div>'}</div>`;
    return h; }
  /* the pane when nothing is picked: the shelves at a glance */
  function glance(){
    const o = counts(), R = reorder(), I = items().filter(x => !x.kit), tv = I.reduce((s, x) => s + val(x), 0), A = acts().slice(0, 6);
    const t = (k, n, l, c) => `<button class="ivn-tile ${c || ''}" data-a="hf" data-k="${k}"><b>${n}</b><small>${l}</small></button>`;
    return `<div class="ivn-ph g"><div class="tt"><h2>At a glance</h2><div class="pn">${o.stocked} stocked · ${o.none} not stocked · ${o.kits} kits</div></div></div>
      <div class="ivn-tiles">${t('short', o.short, 'short for open ROs', o.short ? 'bad' : '')}${t('out', o.out, 'out of stock', o.out ? 'bad' : '')}${t('low', o.low, 'below their min', o.low ? 'wrn' : '')}${t('reorder', R.R.length, 'on the reorder list')}</div>
      <div class="ivn-sec"><h3>On the shelves</h3><div class="ivn-kv"><span>Value at cost</span><b>${usd(tv)}</b><span>Parts with a bin</span><b>${I.filter(x => x.bin).length} of ${o.stocked}</b><span>On order for stock</span><b>${I.filter(x => x.so).length} lines</b></div></div>
      <div class="ivn-sec"><h3>Lately <button class="link-btn" data-a="view" data-v="act">All activity</button></h3>${A.map(a => actLine(a, true)).join('') || '<div class="ivn-none sm">No movements yet.</div>'}</div>
      <div class="ivn-note">${ic('info', 13)}<span>Pick a part for its numbers, the ROs that need it and its history.</span></div>`; }
  /* ---------- reorder ---------- */
  function vReorder(){
    const { R, S } = reorder(), tot = R.reduce((s, r) => s + r.q * (r.x.cost || r.x.price), 0), ed = canEd();
    const line = (r, i, sh) => `<div class="ivn-rr${sh ? ' sh' : ''}"><span class="d"><b>${esc(r.x.desc || r.x.pn)}</b><small>${esc(r.x.pn || 'no part #')}${r.x.bin ? ' · ' + esc(r.x.bin) : ''}</small></span><span class="n">${qf(r.x.oh)}${r.x.so ? ` <small>+${qf(r.x.so)} coming</small>` : ''}</span><span class="n">${sh ? qf(r.x.need) + ' needed' : qf(r.x.min) + ' · ' + qf(r.x.max)}</span><span class="n q"><b>${qf(r.q)}</b></span><span class="n">${usd(r.q * (r.x.cost || r.x.price))}</span><span class="a">${sh ? `<button class="btn btn-sm tg-gh" data-a="sel" data-id="${r.x.id}" data-go="1">Open</button>` : ''}</span></div>`;
    return `<div class="ivn-full pg-scroll" data-scroll="ivn-full"><div class="ivn-fh"><h2>Reorder</h2><span class="tg-hf" style="cursor:default">everything below its min, back up to its max · what’s already coming counts</span><span class="sp"></span>
      ${R.length ? `<button class="btn btn-sm" data-a="copyro">${ic('copy', 14)}Copy the list</button><button class="btn btn-sm" data-a="csv" data-v="reorder">${ic('download', 14)}CSV</button>${ed ? `<button class="btn btn-sm btn-primary" data-a="ordered">${ic('send', 14)}Mark ordered · ${usd0(tot)}</button>` : ''}` : ''}</div>
      <div class="ivn-tblf"><div class="ivn-rr h"><span>Part</span><span class="n">On hand</span><span class="n">Min · max</span><span class="n">Order</span><span class="n">Cost</span><span></span></div>${R.map((r, i) => line(r, i)).join('') || '<div class="ivn-none">Nothing below its min. Give parts a min to keep them on the shelf.</div>'}</div>
      ${S.length ? `<h3 class="ivn-h3">Short for open ROs <small>these usually go on the RO’s own order from the Parts desk</small></h3><div class="ivn-tblf">${S.map((r, i) => line(r, i, true)).join('')}</div>` : ''}
      <div class="ivn-note">${ic('info', 13)}<span>Mark ordered puts each line on order for stock — Receive takes it off again when it comes in. The Parts page’s Catalog uses the same min and max.</span></div></div>`; }
  function reorderText(){ return reorder().R.map(r => [r.x.pn || '', r.x.desc || '', qf(r.q)].join('\t')).join('\n'); }
  /* ---------- count, shelf by shelf ---------- */
  function vCount(){
    const sh = shelves(); if(!U.csh || !sh.some(s => s[0] === U.csh)) U.csh = sh.length ? sh[0][0] : null;
    const L = items().filter(x => !x.kit && (shelfOf(x.bin) || '—') === U.csh && (x.stocked || x.bin)).sort((a, b) => a.bin.localeCompare(b.bin, undefined, { numeric: true }) || a.desc.localeCompare(b.desc));
    const n = L.filter(x => U.cnt[x.id] !== undefined && U.cnt[x.id] !== '').length;
    return `<div class="ivn-full pg-scroll" data-scroll="ivn-full"><div class="ivn-fh"><h2>Count</h2><span class="tg-hf" style="cursor:default">one shelf at a time · a count that’s off fixes on hand and goes in the part’s history</span><span class="sp"></span>${n ? `<button class="btn btn-sm tg-gh" data-a="cclr">Clear</button><button class="btn btn-sm btn-primary" data-a="csave">Save count · ${n}</button>` : ''}</div>
      <div class="ivn-shf">${sh.map(s => `<button class="tg-chip${U.csh === s[0] ? ' on' : ''}" data-a="csh" data-v="${esc(s[0])}">${s[0] === '—' ? 'No bin' : 'Shelf ' + esc(s[0])}<small>${s[1]}</small></button>`).join('') || '<span class="mu">No parts yet.</span>'}</div>
      <div class="ivn-tblf"><div class="ivn-cr h"><span>Bin</span><span>Part</span><span class="n">Parsec says</span><span class="n">Counted</span><span class="n">Off by</span><span class="n">Last counted</span></div>${L.map(x => { const v = U.cnt[x.id], d = v === undefined || v === '' ? null : num(v) - x.oh;
        return `<div class="ivn-cr"><span>${x.bin ? `<span class="ivn-bin">${esc(x.bin)}</span>` : '<span class="mu">—</span>'}</span><span class="d"><b>${esc(x.desc || x.pn)}</b><small>${esc(x.pn || 'no part #')}</small></span><span class="n">${qf(x.oh)}</span><span class="n"><input class="ivn-ci" data-in="cnt" data-id="${x.id}" inputmode="decimal" value="${esc(v === undefined ? '' : v)}" placeholder="—" aria-label="Counted ${esc(x.desc || x.pn)}"></span><span class="n dv${d == null ? '' : d ? ' off' : ' ok'}">${d == null ? '' : d === 0 ? 'matches' : (d > 0 ? '+' : '') + qf(d)}</span><span class="n mu">${x.counted ? esc(md(x.counted)) : 'never'}</span></div>`; }).join('') || '<div class="ivn-none">Nothing on this shelf.</div>'}</div>
      <div class="ivn-note">${ic('info', 13)}<span>Tab moves down the list. Leave a line empty to skip it; a count that matches still marks the part as counted.</span></div></div>`; }
  /* ---------- activity: every movement, newest first ---------- */
  function acts(){ const A = [];
    items().forEach(x => { if(x.kit) return; x.log.forEach(l => A.push({ at: l.at, x, l }));
      x.uses.forEach(z => { if(z.p.sup === 'stock' && z.at) A.push({ at: z.at, x, z }); }); });
    return A.sort((a, b) => String(b.at || '').localeCompare(String(a.at || ''))); }
  function actLine(a, small){ const x = a.x;
    const what = a.z ? `Pulled for <button class="link-btn" data-a="ro" data-ro="${a.z.ro.id}" data-op="${a.z.op.id}">${esc(tgNum(a.z.ro))}</button> <b>−${qf(a.z.q)}</b>` : logLine(a.l).replace(/^<div class="ivn-ll"><span class="w">[^<]*<\/span><span class="t">/, '').replace(/<\/span><span class="by">[\s\S]*$/, '');
    return `<div class="ivn-al${small ? ' sm' : ''}"><span class="w">${esc(small ? md(a.at) : when(a.at))}</span><button class="p" data-a="sel" data-id="${x.id}" data-go="1"><b>${esc(x.desc || x.pn)}</b><small>${esc(x.pn || '')}</small></button><span class="t">${what}</span>${small ? '' : `<span class="by">${esc(a.l ? PG.first(a.l.by || '') : 'Parts')}</span>`}</div>`; }
  function vAct(){ const q = U.aq.trim().toLowerCase(), A = acts().filter(a => !q || hay(a.x).indexOf(q) > -1);
    return `<div class="ivn-full pg-scroll" data-scroll="ivn-full"><div class="ivn-fh"><h2>Activity</h2><span class="tg-hf" style="cursor:default">received, counted, adjusted, pulled for ROs</span><span class="sp"></span></div>
      <div class="ivn-tblf">${A.slice(0, 300).map(a => actLine(a)).join('') || '<div class="ivn-none">No movements yet. Receiving, counts and adjustments show here, and parts pulled from stock for an RO.</div>'}</div></div>`; }
  /* ---------- pop-overs ---------- */
  function pop(){
    const p = U.pop; if(!p) return '';
    const hd = (t, sub) => `<div class="tg-ph"><b>${t}</b>${sub ? `<span class="cu">${sub}</span>` : ''}<button class="btn btn-sm ib" data-a="popx" aria-label="Close">${ic('x', 14)}</button></div>`;
    const fl = (k, l, v, ph, w) => `<label class="ivn-f${w ? ' ' + w : ''}"><span>${l}</span><input data-in="pf" data-f="${k}" value="${esc(v == null ? '' : v)}" placeholder="${esc(ph || '')}"${/^(oh|min|max|price|cost|q)$/.test(k) ? ' inputmode="decimal"' : ''}></label>`;
    const x = p.id ? get(p.id) : null, F = p.f || {};
    if(p.type === 'more') return `<div class="tg-pop menu ivn-pop">${hd('Inventory')}<button class="tg-mi" data-action="inv-extract">${ic('scan', 15)}Import a parts list…<span class="meta">paste, a screenshot or a PDF</span></button><button class="tg-mi" data-a="csv" data-v="stock">${ic('download', 15)}Download the stock list<span class="meta">CSV</span></button><button class="tg-mi" data-a="copyro">${ic('copy', 15)}Copy the reorder list</button></div>`;
    if(p.type === 'new' || (p.type === 'edit' && x)){ const kit = p.type === 'new' ? !!p.kit : x.kit, nu = p.type === 'new';
      return `<div class="tg-pop xf ivn-pop w">${hd(nu ? (kit ? 'New kit' : 'New part') : 'Edit ' + (kit ? 'kit' : 'part'), nu ? 'on the Parts list' : esc(x.pn || ''))}
        <div class="ivn-two">${fl('pn', kit ? 'Kit #' : 'Part #', F.pn, kit ? 'optional' : '')}${fl('desc', kit ? 'Kit name' : 'Description', F.desc, kit ? 'e.g. Water pump kit' : '', 'w2')}</div>
        ${kit ? '' : `<div class="ivn-three">${fl('bin', 'Bin', F.bin, 'A3')}${fl('price', 'Price each', F.price, '0.00')}${fl('cost', 'Cost each', F.cost, 'what we pay')}</div>
        <div class="ivn-three">${nu ? fl('oh', 'On hand', F.oh, '0') : `<label class="ivn-f"><span>On hand</span><span class="ivn-ohro">${qf(x.oh)} <button class="link-btn" data-a="pop" data-p="adj" data-id="${x.id}">Adjust…</button></span></label>`}${fl('min', 'Min', F.min, 'reorder below')}${fl('max', 'Max', F.max, 'order up to')}</div>`}
        <div class="ivn-three">${fl('engine', 'Engine', F.engine, 'e.g. D13')}${fl('model', 'Model', F.model, 'e.g. VNL')}${fl('year', 'Year', F.year, '2021')}</div>
        <div class="tg-acts"><span class="hint">${kit ? 'Add its parts after — from the kit’s pane' : 'Min 0 means it isn’t kept in stock'}</span><button class="btn btn-sm btn-primary" data-a="${nu ? 'newgo' : 'editgo'}">${nu ? 'Add ' + (kit ? 'kit' : 'part') : 'Save'}${kbd('↵')}</button></div></div>`; }
    if(p.type === 'rcv' && x) return `<div class="tg-pop xf ivn-pop">${hd('Receive', esc(x.desc || x.pn))}<div class="ivn-three">${fl('q', 'How many', p.q, x.so ? qf(x.so) : '1')}${fl('ref', 'PO or packing slip', p.ref, 'optional', 'w2')}</div><div class="ivn-two">${fl('cost', 'Cost each', p.cost, x.cost ? qf(x.cost) : 'optional')}<label class="ivn-f"><span>After</span><span class="ivn-ohro">${qf(x.oh)} → <b>${qf(x.oh + (num(p.q) || 0))}</b></span></label></div>${x.so ? `<div class="ivn-note">${ic('truck', 13)}<span>${qf(x.so)} on the stock order — receiving takes them off it.</span></div>` : ''}<div class="tg-acts"><span class="sp"></span><button class="btn btn-sm btn-primary" data-a="rcvgo"${num(p.q) > 0 ? '' : ' disabled'}>Receive${kbd('↵')}</button></div></div>`;
    if(p.type === 'adj' && x){ const to = p.mode === 'by' ? x.oh + num(p.d) : (p.to === '' || p.to == null ? null : num(p.to)), ok = to != null && to >= 0 && to !== x.oh;
      return `<div class="tg-pop xf ivn-pop">${hd('Adjust on hand', esc(x.desc || x.pn))}<div class="ivn-mode"><span class="tg-seg3"><button class="${p.mode !== 'by' ? 'on' : ''}" data-a="amode" data-v="to">Set the count</button><button class="${p.mode === 'by' ? 'on' : ''}" data-a="amode" data-v="by">Add or take away</button></span></div>
        <div class="ivn-two">${p.mode === 'by' ? fl('d', 'Change by', p.d, 'e.g. -2 or 3') : fl('to', 'New on hand', p.to, qf(x.oh))}<label class="ivn-f"><span>On hand</span><span class="ivn-ohro">${qf(x.oh)}${to != null ? ` → <b class="${to < x.oh ? 'neg' : 'pos'}">${qf(to)}</b>` : ''}</span></label></div>
        <div class="ivn-why"><span>Why</span><div>${WHY.map(w => `<button class="tg-chip${(p.why || 'Counted') === w ? ' on' : ''}" data-a="awhy" data-v="${esc(w)}">${esc(w)}</button>`).join('')}</div></div>${fl('note', 'Note', p.note, 'optional', 'w3')}
        <div class="tg-acts"><span class="hint">It goes in the part’s history and the shop’s audit log</span><button class="btn btn-sm btn-primary" data-a="adjgo"${ok ? '' : ' disabled'}>Save${kbd('↵')}</button></div></div>`; }
    if(p.type === 'del' && x){ const used = x.uses.length + (idx().need[x.k] || []).length + (idx().ord[x.k] || []).length;
      return `<div class="tg-pop xf ivn-pop">${hd('Delete ' + (x.kit ? 'this kit' : 'this part') + '?', esc(x.desc || x.pn))}<p class="ivn-p">${x.kit ? 'The kit goes from the list; its parts stay.' : `It goes from the Parts list${x.oh ? ` with its ${qf(x.oh)} on hand` : ''}.`}${used ? ` The ${used} RO line${used === 1 ? '' : 's'} that use${used === 1 ? 's' : ''} it keep${used === 1 ? 's' : ''} it — and a part put on an RO comes back on the list by itself.` : ''} Undo brings it back.</p><div class="tg-acts"><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="popx">Keep it</button><button class="btn btn-sm ivn-danger" data-a="delgo">Delete</button></div></div>`; }
    if(p.type === 'kadd' && x){ const q = String(p.q || '').trim().toLowerCase(), have = new Set((x.it.children || []).map(c => kOf(c.pn, c.desc)));
      const L = q ? items().filter(y => !y.kit && !have.has(y.k) && hay(y).indexOf(q) > -1).slice(0, 7) : [];
      return `<div class="tg-pop xf ivn-pop">${hd('Add a part to the kit', esc(x.desc))}<label class="ivn-q">${ic('search', 14)}<input data-in="kq" value="${esc(p.q || '')}" placeholder="Part # or description" autocomplete="off" aria-label="Find a part"></label>
        <div class="ivn-kl">${L.map(y => `<button class="tg-mi" data-a="kpick" data-v="${y.id}"><b>${esc(y.desc || y.pn)}</b><span class="meta">${esc(y.pn || '')}${y.bin ? ' · ' + esc(y.bin) : ''} · ${qf(y.oh)} on hand</span></button>`).join('')}${q && !L.length ? `<div class="ivn-none sm">Not on the list — add it as typed:</div>` : ''}${q ? `<button class="tg-mi" data-a="kpick" data-v="">${ic('plus', 14)}Add “${esc(p.q)}”<span class="meta">a line of its own</span></button>` : '<div class="ivn-none sm">Type to find a part on the list.</div>'}</div>
        <div class="ivn-two">${fl('kq2', 'How many in the kit', p.kq2, '1')}</div></div>`; }
    return ''; }
