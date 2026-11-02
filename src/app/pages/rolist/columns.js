/* Parsec · pages/rolist · columns.js
   The RO list's columns (13.1): drag into any order, add fields or your own, saved views, the Display pop-over.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   customs colDef cols colsSet shown gridVars cfCell cfSave cmpBy ordered headHtml row … (32 functions, 19 constants)
   state      punches rlCustom rlLayout rlViews ros
   uses       access/ clock/ data/ kit/ pages/ pages/triage/ pages/warranty/ phone/ ro/ shell/ state/ trucks/
   at load    on document dragstart · on document dragover · on document drop · on document dragend
*/
  /* ---------- Parsec 13.1: the columns — drag them into any order, add fields or your own, sort by any of them ---------- */
  const NUM = x => { const n = parseFloat(String(x == null ? '' : x).replace(/[^0-9.]/g, '')); return isNaN(n) ? null : n; };
  const TONE = { bad: 0, warn: 1, teal: 2, run: 3, info: 4, hold: 5, good: 6 };
  const dShort = iso => { if(!iso) return '—'; const d = new Date(iso); return isNaN(d) ? '—' : DAYN[d.getDay()] + ' ' + (d.getMonth() + 1) + '/' + d.getDate(); };
  const partsOf = r => { const L = []; r.ops.forEach(o => { try{ opRealParts(o).forEach(p => L.push(p)); }catch(e){} }); return L; };
  const inHand = p => p.status === 'Received' || p.status === 'Installed' || p.sup === 'stock';
  const nxHtml = r => `<span class="rq-nx t-${r.nx.tone}" title="${esc(r.nx.t + (r.nx.w ? ' — ' + r.nx.w : ''))}"><i></i><span class="t">${esc(r.nx.t)}</span>${r.nx.w ? `<span class="w">${esc(fstN(r.nx.w))}</span>` : ''}</span>`;
  const FIELD = {
    ro:      { l: 'RO', w: '108px', min: 108, fixed: 1, cell: r => `<span class="rq-no">${r.live ? '<i class="rq-live" title="On the clock"></i>' : ''}${esc(r.no)}</span><span class="rq-trk">${trkThumb(r.ro)}</span>`, sort: r => NUM(r.no) },
    cust:    { l: 'Customer', w: 'minmax(120px,1.2fr)', min: 120, cell: r => `<span class="rq-cu"><b>${esc(r.cust)}</b>${r.why ? `<small class="rq-why">${esc(r.why)}</small>` : r.unit ? `<small>Unit ${esc(r.unit)}</small>` : ''}${r.warr ? `<span class="rq-tag">${ic('warranty', 12)}WARR</span>` : ''}</span>`, sort: r => r.cust.toLowerCase() },
    status:  { l: 'Status', w: 'minmax(150px,1.1fr)', min: 150, cell: r => `<span class="rq-st">${st(r.st, { of: r.ro, ofKind: 'ro',  sub: subOf(r) })}</span>`, sort: r => GORDER.indexOf(r.k) * 100 + (r.sub ? 1 : 0) },
    next:    { l: 'Next step', w: 'minmax(170px,1.8fr)', min: 170, cell: nxHtml, sort: r => TONE[r.nx.tone] * 1000 + (r.nx.w ? 0 : 500), sort2: r => r.nx.t.toLowerCase() },
    stage:   { l: 'Stage', w: '70px', min: 70, peek: 1, cell: r => ticks(r), sort: r => r.si },
    time:    { l: 'Time', w: '112px', min: 112, peek: 1, cell: r => `<span class="rq-time">${mini(r.b, r.q)}<span>${r.b.toFixed(2)} <em>/ ${qtRoHtml(r.ro, r.q)}</em></span></span>`, sort: r => r.b },
    tech:    { l: 'Tech', w: '40px', min: 40, cell: r => av(r.tech), sort: r => r.tech ? r.tech.toLowerCase() : null },
    spot:    { l: 'Spot', w: '96px', min: 52, peek: 1, cell: r => `<span class="rq-sub">${esc(r.spot)}${r.ro && v149KeyTxt(r.ro) ? ' · ' + esc(v149KeyTxt(r.ro)) : ''}</span>`, sort: r => r.spot === '—' ? null : r.spot },
    ready:   { l: 'Ready by', w: '92px', min: 92, peek: 1, cell: r => `<span class="rq-sub">${esc(r.ready)}</span>`, sort: r => r.readyT && r.readyT !== '9' ? r.readyT : null },
    days:    { l: 'Open', w: '48px', min: 48, r: 1, cell: r => `<span class="rq-days${r.days != null && r.days >= 7 && !r.done ? ' late' : ''}">${r.days == null ? '—' : r.days === 0 ? 'today' : r.days + 'd'}</span>`, sort: r => r.days == null ? -1 : r.days },
    /* more fields — off until you add them from Display */
    cmp:     { l: 'Complaint', w: 'minmax(150px,1.3fr)', min: 150, cell: r => `<span class="rq-cmp">${esc(r.cmp || 'No operations yet')}${r.ops.length > 1 ? `<em>+${r.ops.length - 1}</em>` : ''}</span>`, sort: r => r.cmp.toLowerCase() },
    unit:    { l: 'Unit #', w: '72px', min: 72, cell: r => esc(r.unit || '—'), sort: r => r.unit || null },
    truck:   { l: 'Truck', w: 'minmax(130px,1fr)', min: 130, cell: r => esc(r.veh), sort: r => r.veh.toLowerCase() },
    vin:     { l: 'VIN', w: '156px', min: 156, cell: r => `<span class="rq-mono">${esc(r.ro.vin || '—')}</span>`, sort: r => r.ro.vin || null },
    mileage: { l: 'Mileage', w: '84px', min: 84, r: 1, cell: r => { const n = NUM(r.ro.mileage); return n == null ? '—' : n.toLocaleString('en-US'); }, sort: r => NUM(r.ro.mileage) },
    hours:   { l: 'Engine hrs', w: '84px', min: 84, r: 1, cell: r => { const n = NUM(r.ro.engineHours); return n == null ? '—' : n.toLocaleString('en-US'); }, sort: r => NUM(r.ro.engineHours) },
    engine:  { l: 'Engine', w: '124px', min: 124, cell: r => esc(r.ro.engineType || '—'), sort: r => r.ro.engineType || null },
    keytag:  { l: 'Key tag', w: '64px', min: 64, cell: r => esc(r.ro.keyTag || '—'), sort: r => NUM(r.ro.keyTag) },
    opened:  { l: 'Opened', w: '84px', min: 84, cell: r => esc(dShort(r.ro.dateOpened)), sort: r => r.ro.dateOpened || null },
    case:    { l: 'Case #', w: '96px', min: 96, cell: r => esc(r.ro.caseNumber || r.ro.techSupportCase || '—'), sort: r => r.ro.caseNumber || r.ro.techSupportCase || null },
    ops:     { l: 'Operations', w: '84px', min: 84, cell: r => { const d = r.ops.filter(o => { try{ return opDoneNow(o); }catch(e){ return false; } }).length; return r.ops.length ? `${d} of ${r.ops.length} done` : '—'; }, sort: r => r.ops.length },
    parts:   { l: 'Parts', w: '84px', min: 84, cell: r => { const L = partsOf(r); return L.length ? `${L.filter(inHand).length} of ${L.length} in` : '—'; }, sort: r => { const L = partsOf(r); return L.length ? L.filter(inHand).length / L.length : 2; } },
    warranty:{ l: 'Warranty', w: '84px', min: 84, cell: r => { const R0 = r.ops.some(o => opJobType(o) === 'RECALL'); return r.warr ? (R0 ? 'Recall' : 'Warranty') : '—'; }, sort: r => r.warr ? 0 : 1 }
  };
  const DEF_COLS = ['ro', 'cust', 'status', 'next', 'stage', 'time', 'tech', 'spot', 'ready', 'days'];
  const MORE = ['cmp', 'unit', 'truck', 'vin', 'mileage', 'hours', 'engine', 'keytag', 'opened', 'case', 'ops', 'parts', 'warranty'];
  function customs(){ return Array.isArray(STATE.rlCustom) ? STATE.rlCustom : []; }
  function colDef(k){
    if(String(k).indexOf('c:') === 0){ const c = customs().find(x => 'c:' + x.id === k); if(!c) return null;
      return { l: c.name, w: 'minmax(110px,.8fr)', min: 110, custom: c, cell: r => cfCell(r, c), sort: r => { const v = String((r.ro.cf || {})[c.id] || '').trim(); const n = NUM(v); return v === '' ? null : n != null && /^[\s$#\d.,\-]+$/.test(v) ? n : v.toLowerCase(); } }; }
    return FIELD[k] || null;
  }
  const layKey = () => (PG.me() || {}).name || 'Admin';
  function cols(){ const M = STATE.rlLayout && STATE.rlLayout[layKey()]; const L = (M && Array.isArray(M.cols) ? M.cols : DEF_COLS).filter(k => colDef(k)); if(L.indexOf('ro') < 0) L.unshift('ro'); return L; }
  function colsSet(L){ if(!STATE.rlLayout || typeof STATE.rlLayout !== 'object') STATE.rlLayout = {}; STATE.rlLayout[layKey()] = { cols: L.slice(), at: nowIso() }; CACHE = null; scheduleSave(true); }
  function shown(){ const peekOn = (!EMB || RL_PEEK_HOSTS[EMB]) && U.peek && U.view === 'list' && U.cur; return cols().filter(k => !(peekOn && (colDef(k) || {}).peek)); }
  function gridVars(){ const L = shown(); const tr = ['18px'].concat(L.map(k => colDef(k).w), ['24px']); const min = 18 + 24 + L.reduce((a, k) => a + (colDef(k).min || 80), 0) + 12 * (L.length + 1) + 12;
    return `--cols:${tr.join(' ')};--rl-minw:${min}px`; }
  /* your own columns: type straight into the cell */
  function cfCell(r, c){
    const v = String((r.ro.cf || {})[c.id] || '');
    if(U.cfEdit && U.cfEdit.id === r.id && U.cfEdit.c === c.id) return `<input class="rq-cfin" data-in="cf" data-id="${r.id}" data-c="${esc(c.id)}" value="${esc(v)}" placeholder="${esc(c.name)}" autocomplete="off" data-no-draft>`;
    return `<span class="rq-cf" data-a="cfed" data-id="${r.id}" data-c="${esc(c.id)}" title="Click to type — ${esc(c.name)}">${v ? esc(v) : '<i>—</i>'}</span>`;
  }
  function cfSave(id, cid, v){ const ro = getRO(id); if(!ro) return; v = String(v == null ? '' : v).trim().slice(0, 120); const was = String((ro.cf || {})[cid] || ''); U.cfEdit = null; if(v === was){ rd(); return; }
    pushUndo('RO list column'); ro.cf = ro.cf || {}; if(v) ro.cf[cid] = v; else delete ro.cf[cid]; CACHE = null; scheduleSave(true); rd(); }
  /* sorting by a column header — the whole list, the groups fold while it's on */
  function cmpBy(k, dir){ const d = colDef(k); if(!d) return () => 0;
    return (a, b) => { let x = d.sort(a), y = d.sort(b); if(x == null && y == null) x = y = 0; else if(x == null) return 1; else if(y == null) return -1;
      let c = typeof x === 'number' && typeof y === 'number' ? x - y : typeof x === 'number' ? -1 : typeof y === 'number' ? 1 : String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: 'base' });
      if(!c && d.sort2) c = String(d.sort2(a)).localeCompare(String(d.sort2(b)));
      return c * dir; }; }
  function ordered(L){ if(!U.cs || !colDef(U.cs.k)) return L; return L.slice().sort(cmpBy(U.cs.k, U.cs.dir)); }
  function headHtml(){
    const L = shown();
    return `<div class="rq-head"><span></span>${L.map(k => { const d = colDef(k), on = U.cs && U.cs.k === k;
      return `<span class="rq-hc${d.r ? ' r' : ''}${on ? ' on' : ''}" data-a="hsort" data-col="${esc(k)}" draggable="true" title="Sort by ${esc(d.l)} — drag to move the column" aria-sort="${on ? (U.cs.dir > 0 ? 'ascending' : 'descending') : 'none'}"><span class="l">${esc(d.l)}</span><i class="rq-sa">${on ? (U.cs.dir > 0 ? '↑' : '↓') : ''}</i></span>`; }).join('')}<span></span></div>`;
  }
  function row(r){
    if(document.documentElement.getAttribute('data-device') === 'phone') return rowPhone(r);
    r.why = UI.roFilter ? roMatch(r.ro, UI.roFilter) : '';
    return `<div class="rq-row${U.sel[r.id] ? ' is-sel' : ''}${U.peek && U.cur === r.id ? ' is-cur' : ''}" data-a="sel" data-id="${r.id}">
      <span class="rq-cb" data-a="cb" data-id="${r.id}"></span>${shown().map(k => { const d = colDef(k); return `<span class="rq-c rq-k-${k.indexOf('c:') === 0 ? 'cf' : k}${d.r ? ' r' : ''}">${d.cell(r)}</span>`; }).join('')}
      <span class="rq-optw" data-keep-pop>${rlOptHtml(r.ro)}</span></div>`;
  }
  /* the phone keeps its card: truck, status, RO, days · customer, tech · the next step */
  function rowPhone(r){
    const late = r.days != null && r.days >= 7 && !r.done, why = UI.roFilter ? roMatch(r.ro, UI.roFilter) : '';
    return `<div class="rq-row${U.sel[r.id] ? ' is-sel' : ''}${U.peek && U.cur === r.id ? ' is-cur' : ''}" data-a="sel" data-id="${r.id}">
      <span class="rq-cb" data-a="cb" data-id="${r.id}"></span><span class="rq-no">${r.live ? '<i class="rq-live" title="On the clock"></i>' : ''}${esc(r.no)}</span>${st(r.st, { of: r.ro, ofKind: 'ro',  iconOnly: 1, title: pgStLabel('ro', r.st) + (r.sub ? ' · ' + r.sub : '') })}<span class="rq-trk">${trkThumb(r.ro)}</span>
      <span class="rq-cu"><b>${esc(r.cust)}</b>${why ? `<small class="rq-why">${esc(why)}</small>` : r.unit ? `<small>Unit ${esc(r.unit)}</small>` : ''}</span>
      <span class="rq-cmp">${nxHtml(r)}</span>${av(r.tech)}
      <span class="rq-days r${late ? ' late' : ''}">${r.days == null ? '—' : r.days === 0 ? 'today' : r.days + 'd'}</span>
      <span class="rq-optw" data-keep-pop>${rlOptHtml(r.ro)}</span></div>`;
  }
  function gkey(r){ return U.groupBy === 'status' ? r.k : U.groupBy === 'stage' ? r.stage : U.groupBy === 'tech' ? (r.tech || '') : 'all'; }
  function glabel(k){ if(U.groupBy === 'status') return st(KST[k] || k); if(U.groupBy === 'stage') return `<span>${esc(k)}</span>`; if(U.groupBy === 'tech') return av(k) + `<span>${esc(k || 'Unassigned')}</span>`; return '<span>All</span>'; }
  function list(){
    const L = ordered(rows()), g = UI.rlGroup || 'all', flat = g === 'all' || U.groupBy === 'none' || !!U.cs;
    let h = headHtml();
    if(g !== 'done' && !UI.roFilter){ const l0 = STATE.punches.some(p => !p.stop && isShopPunch(p));
      h += `<div class="rq-row rq-shop" data-a="shop"><span></span>${shown().map(k => k === 'ro' ? `<span class="rq-c rq-k-ro"><span class="rq-no">${l0 ? '<i class="rq-live"></i>' : ''}${ic('kit', 14)}</span></span>` : k === 'cust' ? '<span class="rq-c rq-k-cust"><span class="rq-cu"><b>Shop time</b><small>clock non-RO work</small></span></span>' : k === 'next' ? '<span class="rq-c rq-k-next rq-sub">Cleaning, training, shop truck…</span>' : '<span></span>').join('')}<span></span></div>`; }
    if(U.cs && colDef(U.cs.k)) h += `<div class="rq-sortbar">${ic('sort', 13)}<span>Sorted by <b>${esc(colDef(U.cs.k).l)}</b> ${U.cs.dir > 0 ? 'A → Z, low → high' : 'Z → A, high → low'}${g !== 'all' && U.groupBy !== 'none' ? ' — the groups fold while it’s on' : ''}</span><button class="btn btn-sm tg-gh" data-a="hsclr">${ic('x', 12)}${g !== 'all' && U.groupBy !== 'none' ? 'Show the groups' : 'Clear the sort'}</button></div>`;
    if(flat) h += `<div class="rq-rows" style="margin-top:6px">${L.map(row).join('')}</div>`;
    else {
      const keys = U.groupBy === 'status' ? GORDER : U.groupBy === 'stage' ? Object.values(STGN) : [...new Set(L.map(r => r.tech || ''))].sort((a, b) => !a ? 1 : !b ? -1 : a.localeCompare(b));
      keys.forEach(k => { const G = L.filter(r => gkey(r) === k); if(!G.length) return; const ck = U.groupBy + ':' + k;
        h += `<div class="rq-grp${U.closed[ck] ? ' is-closed' : ''}" data-a="grp" data-g="${esc(ck)}"><span class="rq-chev">${ic('chevD', 14)}</span>${glabel(k)}<span class="n">${G.length}</span></div><div class="rq-rows">${G.map(row).join('')}</div>`; });
    }
    if(!L.length) h += `<div class="rq-none">${UI.roFilter ? 'Nothing matches that — check the spelling, or clear the search.' : 'Nothing here right now.'}</div>`;
    return `<div class="rq-scroll" data-scroll="rl" style="${gridVars()}">${h}</div>`;
  }
  function board(){
    const L = rows();
    return `<div class="rq-board">${STG.map(k => { const G = L.filter(r => r.stage === STGN[k]);
      return `<div class="rq-col"><div class="rq-colh"><i class="${k === 'repair' ? 'now' : ''}"></i>${STGN[k]}<span class="n">${G.length}</span></div><div class="rq-cards">${G.map(r => `<div class="rq-card" data-a="open" data-id="${r.id}">
        <div class="rq-card__top">${r.live ? '<i class="rq-live"></i>' : ''}${esc(r.no)}<span class="d${r.days >= 7 && !r.done ? ' late' : ''}">${r.days == null ? '—' : r.days === 0 ? 'today' : r.days + 'd'}</span></div>
        <h4>${esc(r.cust)}</h4><p>${esc(r.cmp || 'No operations yet')}${r.ops.length > 1 ? ` · +${r.ops.length - 1}` : ''}</p>
        <div class="rq-card__ft">${st(r.st, { of: r.ro, ofKind: 'ro',  cls: 'sm', size: 12, sub: subOf(r) })}${mini(r.b, r.q)}${av(r.tech)}</div></div>`).join('') || '<div class="rq-empty">Nothing here</div>'}</div></div>`; }).join('')}</div>`;
  }
  /* 17.1 — the one RO side panel (ro/ro-panel.js): the same sections, in the same order, as the RO page's right column */
  function peek(r){ return rpPanelHtml(r.ro, { page: 'list', close: 1 }); }   /* 17.1: the one RO panel (ro/ro-panel.js), the same on the RO page */
  function pop(){
    const p = U.pop; if(!p) return '';
    if(p.type === 'disp') return `<div class="tg-pop rq-disp" style="width:320px"><h5>View</h5><div class="rq-seg"><button class="${U.view === 'list' ? 'on' : ''}" data-a="dv" data-v="list">${ic('list', 14)}List</button><button class="${U.view === 'board' ? 'on' : ''}" data-a="dv" data-v="board">${ic('board', 14)}Board</button></div>
      <h5>Group by</h5><div class="rq-chips">${[['status', 'Status'], ['stage', 'Stage'], ['tech', 'Tech'], ['none', 'None']].map(([k, l]) => `<button class="${U.groupBy === k ? 'on' : ''}" data-a="dgb" data-v="${k}">${l}</button>`).join('')}</div>
      <h5>Sort</h5><div class="rq-chips">${[['days', 'Days open'], ['no', 'RO number'], ['ready', 'Ready by']].map(([k, l]) => `<button class="${U.sort === k ? 'on' : ''}" data-a="dso" data-v="${k}">${l}</button>`).join('')}</div>
      <h5>Columns<small>drag to reorder</small></h5><div class="rq-colist">${cols().map(k => { const d = colDef(k); return `<div class="rq-coli" draggable="true" data-colk="${esc(k)}"><span class="h" aria-hidden="true">${ic('grip', 13)}</span><span class="n">${esc(d.l)}${d.custom ? '<em>yours</em>' : ''}</span>${d.fixed ? '<span class="fq">always</span>' : `<button class="x" data-a="colx" data-k="${esc(k)}" title="Hide this column" aria-label="Hide ${esc(d.l)}">${ic('x', 12)}</button>`}</div>`; }).join('')}</div>
      <h5>Add a column</h5><div class="rq-chips rq-addc">${DEF_COLS.concat(MORE).filter(k => cols().indexOf(k) < 0).map(k => `<button data-a="coladd" data-k="${k}">${ic('plus', 11)}${esc(FIELD[k].l)}</button>`).join('') || '<span class="rq-none2">Every field is on.</span>'}${customs().filter(c => cols().indexOf('c:' + c.id) < 0).map(c => `<button data-a="coladd" data-k="c:${esc(c.id)}">${ic('plus', 11)}${esc(c.name)}<em>yours</em></button>`).join('')}</div>
      <h5>Your own columns<small>you type into them</small></h5>${customs().length ? `<div class="rq-cflist">${customs().map(c => `<div class="rq-cfi"><span>${esc(c.name)}</span><small>${STATE.ros.filter(ro => ro.cf && ro.cf[c.id]).length} filled</small><button class="x" data-a="cfdel" data-id="${esc(c.id)}" title="Delete this column for everyone" aria-label="Delete ${esc(c.name)}">${ic('trash', 12)}</button></div>`).join('')}</div>` : ''}
      <div class="rq-cfnew"><input data-in="cfnew" placeholder="New column — e.g. PO #" value="${esc(U.cfNew || '')}" maxlength="24" autocomplete="off" data-no-draft><button class="btn btn-sm" data-a="cfnew">${ic('plus', 12)}Add</button></div>
      <div class="rq-colft"><button class="btn btn-sm tg-gh" data-a="colreset">${ic('undo', 12)}Back to the standard columns</button></div>
      <h5>Pane</h5><div class="rq-chips"><button class="${U.peek ? 'on' : ''}" data-a="dpk" data-v="1">Open in a pane</button><button class="${U.peek ? '' : 'on'}" data-a="dpk" data-v="0">Go straight to the RO</button></div>
      <div class="tg-pft">${ic('info', 12)}Open is one list, oldest first. The other groups follow Group by.</div></div>`;
    const ids = p.ids || [];
    if(p.type === 'bst') return `<div class="tg-pop menu" style="width:260px"><div class="tg-ph"><b>Set status</b><span class="cu">${ids.length} RO${ids.length === 1 ? '' : 's'}</span></div>${RO_STATUS_OPTIONS.map(o => `<button class="rq-mrow" data-a="bset" data-v="${esc(o.status)}">${st(o.status)}</button>`).join('')}</div>`;
    if(p.type === 'bdel'){ const R = ids.map(getRO).filter(x => x && !x.shop && x.id !== SHOP_RO_ID), np = STATE.punches.filter(x => ids.indexOf(x.roId) > -1).length, run = STATE.punches.some(x => !x.stop && ids.indexOf(x.roId) > -1);
      return `<div class="tg-pop xf" style="width:330px"><div class="tg-ph"><b>Delete ${R.length} RO${R.length === 1 ? '' : 's'}?</b><span class="cu">the whole repair order${R.length === 1 ? '' : 's'}</span></div><p class="rq-delp">${esc(R.slice(0, 6).map(x => tgNum(x) + (x.customerName ? ' · ' + x.customerName : '')).join('\n') + (R.length > 6 ? '\n+ ' + (R.length - 6) + ' more' : ''))}</p><div class="tg-pft">${ic('info', 12)}Their operations, parts and ${np} time punch${np === 1 ? '' : 'es'}${run ? ' (a clock is running on one)' : ''} go too. Undo brings them back.</div><div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm rq-danger" data-a="bdelgo">${ic('trash', 13)}Delete ${R.length}</button></div></div>`; }
    if(p.type === 'xfer'){ const techs = (typeof rtTechs === 'function' ? rtTechs() : []) || [];
      return `<div class="tg-pop menu" style="width:280px"><div class="tg-ph"><b>Transfer</b><span class="cu">${ids.length} RO${ids.length === 1 ? '' : 's'}</span></div>
        ${techs.map(n => `<button class="rq-mrow" data-a="xto" data-k="tech" data-w="${esc(n)}">${av(n)}${esc(n)}<small>Technician</small></button>`).join('')}
        ${['writer', 'parts', 'foreman', 'manager', 'warranty'].map(k => `<button class="rq-mrow" data-a="xto" data-k="${k}">${ic(k === 'writer' ? 'user' : k === 'parts' ? 'parts' : k === 'warranty' ? 'warranty' : 'users', 14)}${esc(RT_DEPT[k] || k)}<small>${esc((typeof rtPerson === 'function' && rtPerson(k)) || '')}</small></button>`).join('')}</div>`; }
    return '';
  }
  function printSheet(){
    const L = rows().filter(r => U.sel[r.id]);
    return `<div class="rq-print pg-printme"><h3>Repair orders · ${L.length}</h3><table><thead><tr><th>RO</th><th>Customer</th><th>Unit</th><th>Complaint</th><th>Status</th><th>Tech</th><th>Spot</th><th>Open</th></tr></thead><tbody>${L.map(r => `<tr><td>${esc(r.ro.roNumber || r.no)}</td><td>${esc(r.cust)}</td><td>${esc(r.unit)}</td><td>${esc(r.cmp)}${r.ops.length > 1 ? ' +' + (r.ops.length - 1) : ''}</td><td>${st(r.st, { of: r.ro, ofKind: 'ro',  cls: 'sm', size: 12, sub: subOf(r) })}</td><td>${esc(r.tech || '—')}</td><td>${esc(r.spot)}</td><td>${r.days == null ? '—' : r.days + 'd'}</td></tr>`).join('')}</tbody></table></div>`;
  }
  /* Parsec 10: saved views — the filter, the search, the grouping and the sort kept under a name, one click away */
  const VKEYS = () => ({ g: UI.rlGroup || 'all', q: UI.roFilter || '', groupBy: U.groupBy, sort: U.sort, view: U.view });
  function myViews(){ const me = PG.me().name || ''; return (Array.isArray(STATE.rlViews) ? STATE.rlViews : []).filter(v => !v.by || v.by === me); }
  function sameView(v){ const c = VKEYS(); return v.g === c.g && (v.q || '') === c.q && v.groupBy === c.groupBy && v.sort === c.sort && v.view === c.view; }
  function savedViews(){
    const V = myViews(), cur = V.find(sameView), c = VKEYS(), dirty = !cur && (c.q || c.g !== 'all' || c.groupBy !== 'status' || c.sort !== 'days' || c.view !== 'list');
    if(!V.length && !dirty && !U.vname) return '';
    return `<div class="rq-views"><span class="rq-vl">${ic('bookmark', 13)}Saved views</span>${V.map(v => `<span class="rq-vc${cur === v ? ' on' : ''}"><button data-a="vgo" data-id="${v.id}" aria-pressed="${cur === v}" title="${esc([v.q ? '“' + v.q + '”' : '', v.g !== 'all' ? v.g : '', v.groupBy !== 'status' ? 'by ' + v.groupBy : '', v.view === 'board' ? 'board' : ''].filter(Boolean).join(' · ') || 'All open')}">${esc(v.name)}</button><button class="x" data-a="vdel" data-id="${v.id}" title="Remove this view" aria-label="Remove ${esc(v.name)}">${ic('x', 11)}</button></span>`).join('')}${U.vname ? `<span class="rq-vn"><input data-in="vn" data-no-draft placeholder="Name this view" maxlength="30" value="${esc(U.vtxt || '')}" aria-label="Name this view"><button class="btn btn-sm btn-primary" data-a="vsave">Save</button><button class="btn btn-sm tg-gh" data-a="vcancel">Cancel</button></span>` : dirty ? `<button class="btn btn-sm tg-gh rq-vadd" data-a="vname">${ic('plus', 13)}Save this view</button>` : ''}</div>`;
  }
  /* Parsec 14.3 — the RO list inside another page's ROs tab: the same list (tabs, search, Display, your columns, sort), no title, no pane */
  function embView(host){
    if(U._me !== PG.me().name){ reset(); U._me = PG.me().name; }
    EMB = host || UI.view;
    try{
      const c = counts(), g = UI.rlGroup || 'all', me = rlMe(), L = rows();
      Object.keys(U.sel).forEach(id => { if(!L.some(r => r.id === id)) delete U.sel[id]; });
      if(U.cur && !L.some(r => r.id === U.cur)) U.cur = null;
      const nSel = Object.keys(U.sel).length, none = !STATE.ros.filter(ro => ro.id !== SHOP_RO_ID && !ro.shop).length;
      const cur = RL_PEEK_HOSTS[EMB] && U.peek && U.view === 'list' && U.cur && !(typeof pmOn === 'function' && pmOn()) ? L.find(r => r.id === U.cur) : null;   /* 17.1: the Technician's ROs tab opens the side panel */
      return `<div class="rq rq-emb${cur ? ' is-peek' : ''}${nSel ? ' has-sel' : ''}" data-pg="rolist" data-host="${esc(EMB)}"><div class="tg-body"><div class="rq-main">
        <div class="rq-top rq-etop"><div class="rq-tools"><div class="rq-seg" role="group" aria-label="Show">${RL_GROUPS.filter(x => x[0] !== 'mine' || me).map(x => `<button class="${g === x[0] ? 'on' : ''}" data-a="tab" data-g="${x[0]}" aria-pressed="${g === x[0]}">${x[1]}<span>${c[x[0]]}</span></button>`).join('')}</div>
          <span class="rq-efacts"><b>${c.all}</b> open · <b>${c.waiting}</b> waiting · <b>${c.live}</b> on the clock</span>
          <span class="rq-findw">${typeof psmBtn === 'function' ? psmBtn('rolist', 'Search repair orders') : ''}</span>
          <button class="btn" data-a="pop" data-p="disp">${ic('sliders', 15)}Display</button></div>${savedViews()}</div>
        ${none ? '<div class="rq-none">No repair orders yet — New RO adds the first one.</div>' : U.view === 'board' ? board() : list()}
        <div class="rq-ekeys">${kbd('J')}${kbd('K')}<span>move</span>${kbd('↵')}<span>open the RO</span>${kbd('/')}<span>search</span><span>· click a header to sort · drag one to move it</span></div></div>
        ${cur ? peek(cur) : ''}${pop()}
        ${nSel ? `<div class="rq-bulkwrap"><div class="rq-bulk"><b>${nSel} selected</b><button class="btn btn-sm tg-gh" data-a="pop" data-p="xfer">${ic('swap', 14)}Transfer…</button><button class="btn btn-sm tg-gh" data-a="pop" data-p="bst">${typeof pgStIc === 'function' ? pgStIc('ring', 14) : ''}Set status…</button><button class="btn btn-sm tg-gh" data-a="bprint">${ic('print', 14)}Print</button><button class="btn btn-sm tg-gh" data-a="bclr">${ic('x', 14)}Clear</button></div></div>` : ''}
        ${U.print ? printSheet() : ''}</div></div>`;
    } finally { EMB = null; }
  }
  /* a popover opened inside the tab sits under its button, in the tab's own box */
  function embAnchor(t){ const root = t.closest('.rq-emb'), body = root && root.querySelector('.tg-body'); if(!body || !U.pop) return; const z = typeof ZF === 'function' ? ZF() : 1, r = t.getBoundingClientRect(), br = body.getBoundingClientRect();
    U.pop.ax = (r.left - br.left) / z; U.pop.ay = (r.bottom - br.top) / z; U.pop.aw = r.width / z; U.pop.at = (r.top - br.top) / z; }
  function embAfter(){ const root = document.querySelector('.rq-emb'), body = root && root.querySelector('.tg-body'), p = body && body.querySelector(':scope > .tg-pop'); if(!p || !U.pop) return;
    const W = body.offsetWidth, Hh = body.offsetHeight, pw = p.offsetWidth, ph = p.offsetHeight; let x, y;
    if(U.pop.ax != null){ x = U.pop.ax + (U.pop.aw || 0) - pw; y = U.pop.ay + 6; if(y + ph > Hh - 12) y = Math.max(12, (U.pop.at || y) - ph - 6); } else { x = W - pw - 16; y = 12; }
    p.style.left = Math.round(Math.max(12, Math.min(x, W - pw - 12))) + 'px'; p.style.top = Math.round(Math.max(12, Math.min(y, Hh - ph - 12))) + 'px'; }
  const inEmb = t => !!(t && t.closest && t.closest('.rq-emb'));
  /* 17.1: a host whose ROs tab opens the side panel, like the RO list page (the others open the RO page) */
  const embPeek = t => { const e = t && t.closest && t.closest('.rq-emb'); return !!(e && RL_PEEK_HOSTS[e.getAttribute('data-host')]); };
  function view(){
    if(U._me !== PG.me().name){ reset(); U._me = PG.me().name; }
    try{ if(typeof yardAutoPlace === 'function') yardAutoPlace(); }catch(e){}   /* Parsec 14: a new truck gets its spot here too, as Triage and Foreman place it */
    if(!STATE.ros.filter(ro => ro.id !== SHOP_RO_ID && !ro.shop).length) return `<div class="tg rq" data-pg="rolist"><div class="tg-body"><div class="rq-main"><div class="rq-top"><div class="rq-titlerow"><div><h1 class="rq-title">Repair orders</h1><p class="rq-facts">No repair orders yet.</p></div><button class="btn btn-primary" data-action="open-add-ro">${ic('plus', 15)}New RO</button></div></div><div class="rq-none">Add the first RO, or load the samples from Settings to look around.</div></div></div></div>`;
    const c = counts(), g = UI.rlGroup || 'all', me = rlMe(), L = rows();
    Object.keys(U.sel).forEach(id => { if(!L.some(r => r.id === id)) delete U.sel[id]; });
    if(U.cur && !L.some(r => r.id === U.cur)) U.cur = null;
    const cur = U.peek && U.view === 'list' && U.cur ? L.find(r => r.id === U.cur) : null, nSel = Object.keys(U.sel).length;
    const waiting = c.waiting;
    return `<div class="tg rq${cur ? ' is-peek' : ''}${nSel ? ' has-sel' : ''}" data-pg="rolist"><div class="tg-body"><div class="rq-main">
      <div class="rq-top"><div class="rq-titlerow"><div><h1 class="rq-title">Repair orders</h1><p class="rq-facts"><span><b>${c.all}</b> open</span><span>·</span><span><b>${waiting}</b> waiting</span><span>·</span><span><b>${c.live}</b> on the clock</span>${c.late ? `<span>·</span><span class="warn"><b>${c.late}</b> open 7+ days</span>` : ''}</p></div>
        <button class="btn btn-primary" data-action="open-add-ro">${ic('plus', 15)}New RO${kbd('N')}</button></div>
        <div class="rq-tools"><div class="rq-seg" role="group" aria-label="Show">${RL_GROUPS.filter(x => x[0] !== 'mine' || me).map(x => `<button class="${g === x[0] ? 'on' : ''}" data-a="tab" data-g="${x[0]}" aria-pressed="${g === x[0]}">${x[1]}<span>${c[x[0]]}</span></button>`).join('')}</div>
          <span class="rq-findw">${typeof psmBtn === 'function' ? psmBtn('rolist', 'Search repair orders') : ''}</span>
          <button class="btn" data-a="pop" data-p="disp">${ic('sliders', 15)}Display</button></div>${savedViews()}</div>
      ${U.view === 'board' ? board() : list()}</div>
      ${cur ? peek(cur) : ''}${pop()}
      ${nSel ? `<div class="rq-bulkwrap"><div class="rq-bulk"><b>${nSel} selected</b><button class="btn btn-sm tg-gh" data-a="pop" data-p="xfer">${ic('swap', 14)}Transfer…</button><button class="btn btn-sm tg-gh" data-a="pop" data-p="bst">${typeof pgStIc === 'function' ? pgStIc('ring', 14) : ''}Set status…</button><button class="btn btn-sm tg-gh" data-a="bprint">${ic('print', 14)}Print</button><button class="btn btn-sm tg-gh rq-danger" data-a="pop" data-p="bdel">${ic('trash', 14)}Delete…</button><button class="btn btn-sm ib tg-gh" data-a="bclr" title="Clear (Esc)">${ic('x', 14)}</button></div></div>` : ''}
      ${U.print ? printSheet() : ''}</div></div>`;
  }
  const rd = () => PG.keepScroll(render);
  function open(id, emb){ U.pop = null; if(emb){ UI._roFromNext = UI.view; UI.rlOrder = ordered(rows()).map(r => r.id); } PG.openRo(id); }   /* Parsec 14.3: from a page's ROs tab, the RO page goes back there */
  const H = {
    sel: (t, ev) => { const id = t.dataset.id; if(ev && (ev.shiftKey || ev.metaKey || ev.ctrlKey)){ if(U.sel[id]) delete U.sel[id]; else U.sel[id] = 1; rd(); return; }
      if((inEmb(t) && !embPeek(t)) || !U.peek || U.view !== 'list' || U.cur === id || (typeof pmOn === 'function' && pmOn())){ open(id, inEmb(t)); return; } U.cur = id; rd(); },
    cb: (t, ev) => { if(ev) ev.stopPropagation(); const id = t.dataset.id; if(U.sel[id]) delete U.sel[id]; else U.sel[id] = 1; rd(); },
    shop: () => { UI.view = 'ros'; UI.selectedRo = SHOP_RO_ID; UI.modal = null; render(); },
    grp: t => { const k = t.dataset.g; U.closed[k] = !U.closed[k]; rd(); },
    open: t => open(t.dataset.id, inEmb(t)),
    peekx: () => { U.cur = null; rd(); },
    status: t => { UI.modal = { type: 'ro-status', roId: t.dataset.id }; render(); },
    pop: (t) => { const p = t.dataset.p; if(U.pop && U.pop.type === p){ U.pop = null; rd(); return; } const ids = t.dataset.id ? [t.dataset.id] : Object.keys(U.sel); U.pop = { type: p, ids }; if(inEmb(t)) embAnchor(t); else PG.anchor(U, t); rd(); },
    vname: () => { U.vname = 1; U.vtxt = ''; rd(); setTimeout(() => { const i = $('.rq-vn input'); if(i) i.focus(); }, 30); },
    vcancel: () => { U.vname = 0; rd(); },
    vsave: () => { const n = String(U.vtxt || '').trim().slice(0, 30) || 'My view'; pushUndo('saved view'); if(!Array.isArray(STATE.rlViews)) STATE.rlViews = []; STATE.rlViews.push(Object.assign({ id: uid('vw'), name: n, by: PG.me().name || '', at: nowIso() }, VKEYS())); U.vname = 0; scheduleSave(true); rd(); pushToast(`View “${n}” saved — one click brings this list back.`, true);
      setTimeout(() => { const b = $('.rq-vc.on'); if(b && typeof pmAnimate === 'function') pmAnimate(b, [{ transform: 'scale(.9)', opacity: 0 }, { transform: 'none', opacity: 1 }], 180); }, 20); },
    vgo: t => { const v = myViews().find(x => x.id === t.dataset.id); if(!v) return; UI.rlGroup = v.g; UI.roFilter = v.q || ''; U.groupBy = v.groupBy || 'status'; U.sort = v.sort || 'days'; U.view = v.view || 'list'; CACHE = null; U.cur = null; rd(); },
    vdel: t => { const v = myViews().find(x => x.id === t.dataset.id); if(!v) return; pushUndo('saved view'); STATE.rlViews = STATE.rlViews.filter(x => x.id !== v.id); scheduleSave(true); rd(); pushToast(`View “${v.name}” removed.`, true); },
    dv: t => { U.view = t.dataset.v; U.pop = null; rd(); },
    tab: t => { UI.rlGroup = t.dataset.g; CACHE = null; U.cur = null; U.sel = {}; try{ persistUI(); }catch(e){} rd(); },
    hsort: (t, ev) => { const k = t.dataset.col; if(!colDef(k)) return; if(U.cs && U.cs.k === k){ if(U.cs.dir > 0) U.cs.dir = -1; else U.cs = null; } else U.cs = { k, dir: 1 }; rd(); },
    hsclr: () => { U.cs = null; rd(); },
    colx: t => { const k = t.dataset.k, L = cols().filter(x => x !== k); if(k === 'ro') return; colsSet(L); if(U.cs && U.cs.k === k) U.cs = null; rd(); },
    coladd: t => { const k = t.dataset.k; if(!colDef(k)) return; const L = cols(); if(L.indexOf(k) < 0) L.push(k); colsSet(L); rd(); },
    colreset: () => { colsSet(DEF_COLS); U.cs = null; rd(); pushToast('The RO list is back to its standard columns.'); },
    cfnew: () => { const n = String(U.cfNew || '').trim().slice(0, 24); if(!n){ const i = $('.rq-cfnew input'); if(i) i.focus(); return; }
      if(customs().some(c => c.name.toLowerCase() === n.toLowerCase())){ pushToast(`There’s already a column called “${n}”.`); return; }
      pushUndo('RO list column'); if(!Array.isArray(STATE.rlCustom)) STATE.rlCustom = []; const c = { id: uid('cf'), name: n, by: (PG.me() || {}).name || '', at: nowIso() }; STATE.rlCustom.push(c);
      const L = cols(); L.push('c:' + c.id); colsSet(L); U.cfNew = ''; scheduleSave(true); rd(); pushToast(`“${n}” is a column now — click a cell to type in it.`, true); },
    cfdel: t => { const id = t.dataset.id, c = customs().find(x => x.id === id); if(!c) return; pushUndo('RO list column');
      STATE.rlCustom = customs().filter(x => x.id !== id); STATE.ros.forEach(ro => { if(ro.cf) delete ro.cf[id]; });
      if(STATE.rlLayout) Object.keys(STATE.rlLayout).forEach(k => { const M = STATE.rlLayout[k]; if(M && Array.isArray(M.cols)) M.cols = M.cols.filter(x => x !== 'c:' + id); });
      if(U.cs && U.cs.k === 'c:' + id) U.cs = null; CACHE = null; scheduleSave(true); rd(); pushToast(`“${c.name}” deleted, with what was typed in it.`, true); },
    cfed: (t, ev) => { if(ev) ev.stopPropagation(); U.cfEdit = { id: t.dataset.id, c: t.dataset.c }; rd(); setTimeout(() => { const i = $(`.rq-cfin[data-id="${t.dataset.id}"][data-c="${t.dataset.c}"]`); if(i){ i.focus(); i.select(); } }, 20); },
    dgb: t => { U.groupBy = t.dataset.v; rd(); },
    dso: t => { U.sort = t.dataset.v; CACHE = null; rd(); },
    dpk: t => { U.peek = t.dataset.v === '1'; if(!U.peek) U.cur = null; rd(); },
    bclr: () => { U.sel = {}; rd(); },
    popx: () => { U.pop = null; rd(); },
    bdelgo: () => { const ids = (U.pop && U.pop.ids) || [], R = ids.map(getRO).filter(x => x && !x.shop && x.id !== SHOP_RO_ID); U.pop = null; if(!R.length){ rd(); return; }   /* Parsec 12.2 */
      pushUndo('delete ' + R.length + ' RO' + (R.length === 1 ? '' : 's')); const gone = {};
      R.forEach(x => { gone[x.id] = 1; try{ audit('ro-del', 'Deleted ' + roLabel(x) + (x.customerName ? ' (' + x.customerName + ')' : ''), x); }catch(e){} });
      STATE.punches = STATE.punches.filter(q => !gone[q.roId]); STATE.ros = STATE.ros.filter(x => !gone[x.id]);
      if(gone[UI.selectedRo]) UI.selectedRo = null; if(gone[U.cur]) U.cur = null; U.sel = {}; CACHE = null; scheduleSave(true); render();
      pushToast(`Deleted ${R.length} RO${R.length === 1 ? '' : 's'}.`, true); },
    bset: t => { const v = t.dataset.v, ids = (U.pop && U.pop.ids) || []; let ok = 0; ids.forEach(id => { if(setRoStatus(id, v, null) !== false) ok++; }); U.pop = null; if(ok){ pushToast(`${ok} RO${ok === 1 ? '' : 's'} set to ${v}.`, true); U.sel = {}; } CACHE = null; render(); },
    xto: t => { const k = t.dataset.k, w = t.dataset.w || '', ids = (U.pop && U.pop.ids) || []; let n = 0; ids.forEach(id => { const ro = getRO(id); if(!ro) return; try{ rtSend(ro, k, k === 'tech' ? w : '', 'From the RO list', null, {}); n++; }catch(e){ console.error(e); } });
      U.pop = null; if(n){ pushToast(`${n} RO${n === 1 ? '' : 's'} sent to ${k === 'tech' ? fstN(w) : (RT_DEPT[k] || k)}.`, true); U.sel = {}; } CACHE = null; scheduleSave(true); render(); },
    bprint: () => { U.print = true; rd(); setTimeout(() => { const el = $('.rq-print'); document.documentElement.classList.add('pg-print2'); try{ window.print(); } finally { document.documentElement.classList.remove('pg-print2'); U.print = false; rd(); } }, 60); }
  };
  function keydown(e){
    const k = e.key; if(e.ctrlKey || e.metaKey || e.altKey) return;
    const stop = () => { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); };
    if(PG.typing(e)) return;
    if(k === '/'){ if(typeof psmOpen === 'function') psmOpen('rolist'); return stop(); }
    if(k === 'Escape'){ if(U.pop){ U.pop = null; rd(); return stop(); } if(Object.keys(U.sel).length){ U.sel = {}; rd(); return stop(); } if(U.cur){ U.cur = null; rd(); return stop(); } return; }
    if((k === 'j' || k === 'k') && U.view === 'list'){ const L = ordered(rows()), i = L.findIndex(r => r.id === U.cur); const n = L[Math.max(0, Math.min(L.length - 1, i < 0 ? 0 : i + (k === 'j' ? 1 : -1)))]; if(n){ U.cur = n.id; rd(); const el = $(`.rq-row[data-id="${n.id}"]`); if(el) el.scrollIntoView({ block: 'nearest' }); } return stop(); }
    if(k === 'Enter' && U.cur){ open(U.cur, rlEmbOn()); return stop(); }
    if(k === 'x' && U.cur){ if(U.sel[U.cur]) delete U.sel[U.cur]; else U.sel[U.cur] = 1; rd(); return stop(); }
    if((k === 's' || k === 'S') && U.cur){ UI.modal = { type: 'ro-status', roId: U.cur }; render(); return stop(); }
  }
  function after(){ PG.placePop(U); }
  function embCount(){ return counts().all; }
  function fieldKey(t, ev){
    if(t.dataset.in === 'cf'){ if(ev.key === 'Enter'){ ev.preventDefault(); cfSave(t.dataset.id, t.dataset.c, t.value); return true; } if(ev.key === 'Escape'){ ev.preventDefault(); U.cfEdit = null; rd(); return true; }
      if(ev.key === 'Tab'){ ev.preventDefault(); const cs = cols().filter(k => k.indexOf('c:') === 0), L = ordered(rows()), i = L.findIndex(r => r.id === t.dataset.id); cfSave(t.dataset.id, t.dataset.c, t.value); const n = L[i + (ev.shiftKey ? -1 : 1)]; if(n){ U.cfEdit = { id: n.id, c: t.dataset.c }; rd(); setTimeout(() => { const j = $(`.rq-cfin[data-id="${n.id}"]`); if(j){ j.focus(); j.select(); } }, 20); } return true; } return false; }
    if(t.dataset.in === 'cfnew'){ if(ev.key === 'Enter'){ ev.preventDefault(); U.cfNew = t.value; H.cfnew(); return true; } return false; }
    if(t.dataset.in === 'vn'){ if(ev.key === 'Enter'){ ev.preventDefault(); U.vtxt = t.value; H.vsave(); return true; } if(ev.key === 'Escape'){ U.vname = 0; rd(); return true; } return false; }
    if(ev.key === 'Escape'){ t.blur(); return true; } if(ev.key === 'ArrowDown' && t.closest('.rq-find')){ t.blur(); const L = rows(); if(L[0]){ U.cur = L[0].id; rd(); } ev.preventDefault(); return true; } return false; }
  PG.reg('rolist', { H, U: () => U, input: (t) => { if(t.dataset.in === 'vn') U.vtxt = t.value; if(t.dataset.in === 'cfnew') U.cfNew = t.value; },
    change: (t) => { if(t.dataset.in === 'cf' && U.cfEdit) cfSave(t.dataset.id, t.dataset.c, t.value); }, fieldKey, keydown, after });
  /* the search window: it filters this list */
  if(typeof psmReg === 'function') psmReg('rolist', () => ({ title: 'Search repair orders', page: 'RO list', placeholder: 'RO, customer, VIN, unit, part #, DTC…',
    get: () => UI.roFilter || '', set: q => { UI.roFilter = q; CACHE = null; U.cur = null; try{ persistUI(); }catch(e){} rd(); },
    count: () => { const q0 = UI.roFilter; UI.roFilter = ''; let of = 0; try{ of = rlList().length; }catch(e){} UI.roFilter = q0; return { n: rows().length, of }; },
    items: q => ordered(rows()).slice(0, 8).map(r => ({ id: r.id, title: r.no + ' · ' + r.cust, st: r.st, sub: (q ? roMatch(r.ro, q) : '') || (r.nx.t + (r.nx.w ? ' · ' + fstN(r.nx.w) : '')) })),
    pick: it => { U.cur = it.id; if(rlEmbOn()) open(it.id, true); else if(U.peek && U.view === 'list') rd(); else open(it.id); } }));
  /* dragging a column: by its header, or in Display */
  let DRAG = null;
  const dragEl = e => e.target && e.target.closest ? e.target.closest('[data-pg="rolist"] .rq-hc[data-col], [data-pg="rolist"] .rq-coli[data-colk]') : null;
  const dragK = el => el.getAttribute('data-col') || el.getAttribute('data-colk');
  const clearMarks = () => document.querySelectorAll('[data-pg="rolist"] .drop-b, [data-pg="rolist"] .drop-a, [data-pg="rolist"] .dragging').forEach(x => x.classList.remove('drop-b', 'drop-a', 'dragging'));
  document.addEventListener('dragstart', e => { const el = dragEl(e); if(!el) return; DRAG = { k: dragK(el), list: el.classList.contains('rq-coli') }; el.classList.add('dragging'); try{ e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', DRAG.k); }catch(er){} });
  document.addEventListener('dragover', e => { if(!DRAG) return; const el = dragEl(e); if(!el || dragK(el) === DRAG.k) return; e.preventDefault(); try{ e.dataTransfer.dropEffect = 'move'; }catch(er){}
    const r = el.getBoundingClientRect(), after = el.classList.contains('rq-coli') ? e.clientY > r.top + r.height / 2 : e.clientX > r.left + r.width / 2;
    if(!el.classList.contains(after ? 'drop-a' : 'drop-b')){ clearMarks(); el.classList.add(after ? 'drop-a' : 'drop-b'); const d = document.querySelector(`[data-pg="rolist"] [data-col="${DRAG.k}"], [data-pg="rolist"] [data-colk="${DRAG.k}"]`); if(d) d.classList.add('dragging'); } });
  document.addEventListener('drop', e => { if(!DRAG) return; const el = dragEl(e); if(!el){ return; } e.preventDefault(); const to = dragK(el), after = el.classList.contains('drop-a'), k = DRAG.k; DRAG = null; clearMarks(); if(!to || to === k) return;
    const L = cols().filter(x => x !== k); let i = L.indexOf(to); if(i < 0) return; if(after) i++; L.splice(i, 0, k); colsSet(L); rd(); });
  document.addEventListener('dragend', () => { DRAG = null; clearMarks(); });
  return { view, U: () => U, rows, emb: embView, embAfter, n: embCount };
