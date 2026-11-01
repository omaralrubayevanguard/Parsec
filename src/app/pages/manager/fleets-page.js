/* Parsec · pages/manager · fleets-page.js
   The Fleets page (its own page since 17.1, on the Manager’s engine): every fleet in a list, a pane with Overview, Trucks and ROs, the period, printing for an account review.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   fleetsView fleetPane fInput fKey FU FPER FH (4 functions, 3 constants)
   uses       access/ kit/ pages/ pages/assets/ ro/
*/
/* ============================== the Fleets page (Parsec 17.1) ==============================
   Every customer's fleet, on its own page (it was a view on the Manager page). It shares the Manager's engine — the
   same numbers, cached once — but is a page of its own: PG.reg('fleets'), viewFleets(), a side bar entry everyone has.
   List and pane, like Assets; the pane has tabs: Overview (scorecard, sales by month) · Trucks (every unit, days down)
   · ROs (in the shop now, then the year's closed ROs). A truck opens in Assets; an RO opens on the RO page. */
const FU = { tab: 'ov', p: 'mo', q: '' };
const FPER = [['mo', 'This month'], ['qt', 'This quarter'], ['yr', 'This year'], ['lmo', 'Last month']];
function fleetsView(){
  sync(); const keep = U.p; U.p = FU.p;
  try{
    const L = fleetRows(), q = FU.q.trim().toLowerCase(), shown = q ? L.filter(x => x.c.toLowerCase().indexOf(q) >= 0) : L;
    const trucks = new Set(ROS.map(r => r.cust + '|' + r.unit)).size, inShop = L.reduce((a, x) => a + x.open, 0);
    const head = `<header class="tg-head"><h1 class="tg-h1">Fleets</h1><span class="tg-facts"><span class="tg-hf" style="cursor:default"><b>${L.length}</b>${L.length === 1 ? 'fleet' : 'fleets'}</span><i>·</i><span class="tg-hf" style="cursor:default"><b>${trucks}</b>trucks</span><i>·</i><span class="tg-hf" style="cursor:default"><b>${inShop}</b>in the shop</span></span>
      <span class="sp" style="flex:1"></span><span class="fl-per" role="group" aria-label="Period">${FPER.map(x => `<button class="${FU.p === x[0] ? 'on' : ''}" data-a="fper" data-v="${x[0]}">${x[1]}</button>`).join('')}</span></header>`;
    const list = `<section class="tg-list"><div class="tg-lh">Fleets<span class="n">${shown.length}${shown.length !== L.length ? ' of ' + L.length : ''}</span></div>
      <div class="fl-q"><input id="fl-q" data-in="q" value="${esc(FU.q)}" placeholder="Find a fleet" aria-label="Find a fleet" autocomplete="off"></div>
      <div class="tg-scroll">${shown.map(x => `<div class="tg-it mq-fi${x.c === U.fleet ? ' on' : ''}" data-a="fleet" data-k="${esc(x.c)}" role="button" tabindex="0"><span class="tg-gi">${ic('unit', 15)}</span><span class="tg-t"><b>${esc(x.c)}</b></span><span class="tg-w">${x.n} closed · ${x.open ? x.open + ' in the shop' : 'none in the shop'}</span><span class="fl-s">${fmt('usd', x.s)}</span></div>`).join('') || '<div class="mq-none">No fleet matches.</div>'}</div></section>`;
    return `<div class="tg mq fl" data-pg="fleets">${head}<div class="tg-body v-fleet">${list}<div class="tg-main">${U.fleet ? fleetPane() : '<div class="mq-none" style="padding:24px">Pick a fleet.</div>'}</div></div></div>`;
  } finally { U.p = keep; }
}
function fleetPane(){
  const c = U.fleet, FF = { k: 'cust', v: c }, all = ROS.filter(r => r.cust === c);
  if(!all.length) return '<div class="mq-none" style="padding:24px">No ROs for this fleet yet.</div>';
  const units = [...new Set(all.map(r => r.unit))], O = openAt(TODAY, FF);
  const tabs = [['ov', 'Overview'], ['trucks', 'Trucks', units.length], ['ros', 'ROs', O.length]];
  const top = `<div class="tg-top"><div class="r1"><span class="mq-cat">${ic('unit', 13)}Fleet</span><span>${units.length} truck${units.length === 1 ? '' : 's'} · a customer since ${mName(all[0].open)} ${all[0].open.slice(0, 4)}</span><span class="sp"></span><button class="btn btn-sm" data-a="print">${ic('print', 14)}Print for the account review</button></div><h2>${esc(c)}</h2>
    <div class="tg-views fl-tabs" role="tablist">${tabs.map(t => `<button role="tab" aria-selected="${FU.tab === t[0]}" class="${FU.tab === t[0] ? 'on' : ''}" data-a="ftab" data-v="${t[0]}">${t[1]}${t[2] != null ? `<small>${t[2]}</small>` : ''}</button>`).join('')}</div></div>`;
  let body = '';
  if(FU.tab === 'trucks'){
    const UT = units.map(u => { const L = all.filter(r => r.unit === u && r.close <= TODAY && r.open >= addD(TODAY, -365)); return { u, truck: all.find(r => r.unit === u).truck, n: L.length, down: sum(L, r => dd(r.open, r.close)), last: L.length ? L[L.length - 1].close : null, op: all.find(r => r.unit === u && r.close > TODAY), any: all.filter(r => r.unit === u).slice(-1)[0] }; }).sort((p, q) => q.down - p.down);
    body = `<div class="mq-card"><div class="mq-ch"><b>Their trucks</b><small>the last 12 months · most days down first · a truck opens in Assets</small></div><div class="mq-cb"><div class="mq-tbl fl"><div class="h"><span>Unit</span><span>Truck</span><span class="m">ROs</span><span class="m">Days down</span><span>Last in</span><span class="m">Now</span></div>${UT.map(x => `<div class="mq-tr" data-a="truck" data-no="${esc(x.any.id)}" role="button" tabindex="0"><span class="u">${esc(x.u)}</span><span class="c"><b>${esc(x.truck)}</b></span><span class="m">${x.n}</span><span class="m${x.down > 14 ? ' warn' : ''}">${x.down} d</span><span class="dt">${x.last ? md(x.last) : '—'}</span><span class="m">${x.op ? '<span class="mq-pv w">in the shop</span>' : ''}</span></div>`).join('')}</div></div></div>`;
  } else if(FU.tab === 'ros'){
    const done = all.filter(r => r.close <= TODAY && r.close >= TODAY.slice(0, 4) + '-01-01').slice().reverse();
    const row = r => `<div class="mq-hr" data-a="ro" data-no="${r.id}"><span class="c"><b><span class="tg-no">${r.no}</span> Unit ${esc(r.unit)}</b><small>${stH(r, { size: 12 })} · ${esc(r.truck)}</small></span><span></span><span class="m">${r.close > TODAY ? (dd(r.open, TODAY) ? dd(r.open, TODAY) + ' d' : 'today') : fmt('usd', r.sales)}</span></div>`;
    body = `<div class="mq-card"><div class="mq-ch"><b>In the shop now</b><small>${O.length}</small></div><div class="mq-cb">${O.length ? O.map(row).join('') : '<div class="mq-none">Nothing in the shop right now.</div>'}</div></div>
      <div class="mq-card"><div class="mq-ch"><b>Closed this year</b><small>${done.length} · newest first</small></div><div class="mq-cb">${done.length ? done.slice(0, 40).map(row).join('') : '<div class="mq-none">None closed this year.</div>'}</div></div>`;
  } else {
    const KS = ['sales', 'cls', 'aro', 'days', 'cb', 'apr'].map(id => KM[id]), yb = buckets('yr'), V = yb.map(x => vb(KM.sales, x, FF));
    body = `<div class="mq-sec" style="margin:0 2px">Scorecard<span>${per(U.p).n} · ${per(U.p).cmp}</span></div><div class="mq-tiles c3">${KS.map(kk => { const o = kv(kk, FF); return `<div class="mq-tile fl-tile"><span class="l"><span>${kk.id === 'days' ? 'Days down per RO' : kk.n}</span></span><span class="v">${fmt(kk.u, o.v)}</span>${sparkSvg(kk, 76, 28, FF)}<span class="r"><span class="mq-d ${o.dl.cl}">${o.dl.s}</span><span class="sp"></span><span>shop ${fmt(kk.u, kv(kk).v)}</span></span></div>`; }).join('')}</div>
      <div class="mq-card"><div class="mq-ch"><b>Sales by month</b><small>${TODAY.slice(0, 4)}</small></div><div class="mq-cb">${monthBars(V, yb, 470)}</div></div>`;
  }
  return `<div class="mq-pane">${top}<div class="mq-pad">${body}</div></div>`;
}
const FH = {
  fleet: t => { U.fleet = t.dataset.k; rd(); },
  ftab: t => { FU.tab = t.dataset.v; rd(); },
  fper: t => { FU.p = t.dataset.v; rd(); },
  ro: t => { const r = ROS.find(x => x.id === t.dataset.no); if(r) PG.openRo(r.id); },
  truck: t => { const ro = getRO(t.dataset.no); if(ro && typeof asOpenFor === 'function' && navAllowed('assets')) asOpenFor(ro); else if(ro) PG.openRo(ro.id); },
  print: () => { const el = document.querySelector('[data-pg="fleets"] .mq-pane'); if(!el) return; el.classList.add('pg-printme'); document.documentElement.classList.add('pg-printing'); const done = () => { el.classList.remove('pg-printme'); document.documentElement.classList.remove('pg-printing'); window.removeEventListener('afterprint', done); }; window.addEventListener('afterprint', done); window.print(); }
};
function fInput(t){ if(t.dataset.in === 'q'){ FU.q = t.value; const pos = t.selectionStart; rd(); const n = document.getElementById('fl-q'); if(n){ n.focus(); try{ n.setSelectionRange(pos, pos); }catch(e){} } } }
function fKey(ev){ const k = ev.key; if(ev.ctrlKey || ev.metaKey || ev.altKey || PG.typing(ev)) return;
  if(k === 'j' || k === 'k' || k === 'ArrowDown' || k === 'ArrowUp'){ const L = fleetRows().map(x => x.c), i = L.indexOf(U.fleet); U.fleet = L[Math.max(0, Math.min(L.length - 1, i + (k === 'j' || k === 'ArrowDown' ? 1 : -1)))]; rd(); ev.preventDefault(); }
  else if(k === '/'){ const q = document.getElementById('fl-q'); if(q){ ev.preventDefault(); q.focus(); } }
  else if(k >= '1' && k <= '3'){ FU.tab = ['ov', 'trucks', 'ros'][+k - 1]; rd(); ev.preventDefault(); } }
PG.reg('fleets', { H: FH, U: () => FU, input: fInput, keydown: fKey });
