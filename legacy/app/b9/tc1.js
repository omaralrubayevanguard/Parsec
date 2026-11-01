  /* ============================== Technician page (Parsec 11) ==============================
     A technician's repair orders: Working, Assigned in the foreman's order, Waiting, and Done today — the list on
     the left, the RO on the right. Every operation opens to its notes, its time (each punch) and its parts.
     It replaces Console for technicians and runs on Console's own pieces: the same shop read out of STATE (build),
     the same punches, holds, asks, popovers, past fixes, photos and your day. */
  const TU = { ro: null, open: {}, q: '', dr: {}, kb: false, tab: {}, shut: {}, actAll: false, msgAll: false, msgTo: '', selO: {}, selP: {}, selPOp: null, lastSel: null, ydSel: null, view: (() => { try{ const v = localStorage.getItem('parsec.tcView'); return v === 'yard' || v === 'ros' ? v : 'list'; }catch(e){ return 'list'; } })() };
  TK.runh = () => { const o = S && S.rp && opBy(S.rp.opId); return o ? h1(burnt(o)) + ' / ' + h1(o.q) + ' h' : null; };
  const TSTG = ['Check-in', 'Diag', 'Approval', 'Parts', 'Repair', 'Road test', 'Close-out'];
  const nxIx = o => { const L = nextOps(); const i = L.indexOf(o); return i < 0 ? 999 : i; };
  /* the ROs: Console's operations grouped by RO; the RO sits where its most urgent operation is */
  function tcRos(){
    const by = {}, order = [];
    S.ops.forEach(o => { if(!by[o.roId]){ by[o.roId] = []; order.push(o.roId); } by[o.roId].push(o); });
    return order.map(id => {
      const ops = by[id].slice().sort((a, b) => a.opn - b.opn), ro = ops[0].ro;
      const run = ops.find(isRun), nx = ops.filter(o => !isRun(o) && o.st === 'next').sort((a, b) => nxIx(a) - nxIx(b)), wt = ops.filter(o => !isRun(o) && o.st === 'wait'), dn = ops.filter(o => o.st === 'done');
      const lane = run ? 'run' : nx.length ? 'next' : wt.length ? 'wait' : 'done';
      const focus = run || nx[0] || wt[0] || dn[dn.length - 1];
      const left = ops.filter(o => o.st !== 'done'), q = sum(left, o => o.q), b = sum(left, o => burnt(o));
      const dq = sum(dn, o => o.q), db = sum(dn, o => o.b0);
      return { id, ro, ops, lane, focus, no: ops[0].no, cust: ops[0].cust, truck: ops[0].truck, unit: ops[0].unit, spot: ops[0].spot, q, b, eff: db >= .05 ? Math.round(dq / db * 100) : null, ix: nxIx(focus) };
    });
  }
  function tcMatch(r){
    const q = TU.q.trim().toLowerCase(); if(!q) return true;
    let tl = ''; try{ tl = trkLabel(r.ro); }catch(e){}
    const t = [r.no, r.ro.roNumber || '', r.cust, r.truck, tl, r.unit, r.spot, r.ro.vin || '', r.ro.year || ''].concat(r.ops.map(o => o.cmp)).join(' ').toLowerCase();
    return q.split(/\s+/).every(w => t.indexOf(w) > -1);
  }
  function tcGroups(all){
    const R = all.filter(tcMatch), fm = PG.person('Foreman'), fmw = fm ? PG.first(fm) + '’s order' : 'the foreman’s order';
    return [[S.shop ? 'On shop time' : 'Working', R.filter(r => r.lane === 'run'), 'run'],
      ['Assigned · ' + fmw, R.filter(r => r.lane === 'next').sort((a, b) => a.ix - b.ix), 'next'],
      ['Waiting', R.filter(r => r.lane === 'wait'), 'wait']].filter(g => g[1].length || g[2] === 'run');   /* Parsec 14.7: Done today is the Today part of Completed */
  }
  const tcFlat = () => tcGroups(tcRos()).flatMap(g => g[1]);
  /* Parsec 13.1 — the search is an icon: the window filters this list as you type */
  const TC_LANE = { run: 'Working', next: 'Assigned', wait: 'Waiting', done: 'Done today' };
  function tcHit(r, q){ const s = TU.q; TU.q = q || ''; try{ return tcMatch(r); } finally { TU.q = s; } }
  psmReg('tech', () => ({ title: 'Search my repair orders', page: 'Technician', placeholder: 'RO, customer, truck, year, unit, complaint…',
    get: () => TU.q, set: q => { TU.q = q; PG.keepScroll(render); },
    count: q => { const all = tcRos(); return { n: all.filter(r => tcHit(r, q)).length, of: all.length }; },
    items: q => q ? tcFlat().filter(r => tcHit(r, q)).slice(0, 8).map(r => ({ id: r.id, title: r.no + (r.cust ? ' · ' + r.cust : ''), sub: [r.truck, r.unit ? 'Unit ' + r.unit : '', TC_LANE[r.lane] || ''].filter(Boolean).join(' · ') })) : [],
    pick: it => { if(TU.ro !== it.id) tcSelClear(); TU.ro = it.id; TU.kb = false; U.pop = null; U.selRo = null; } }));
  /* how long it has waited on someone else — Parsec 10's blocker aging, on every waiting RO */
  const TC_HK = { 'Parts': 'parts', 'Second opinion': 'foreman', 'Approval': 'writer' };
  function tcHeld(r){
    const o = r.focus;
    if(stOf(o) === 'wait' && o.hold){ const k = TC_HK[o.hold.k], at = o.hold.at ? new Date(o.hold.at).getTime() : 0; let goal = 24 * 3600000; try{ if(k) goal = rtGoalMs(k); }catch(e){}
      return { who: o.hold.who || '', dept: o.hold.k, held: at ? Date.now() - at : 0, goal }; }
    let h = null; try{ h = tgHold(r.ro); }catch(e){} if(!h) return null;
    return { who: h.who, dept: { tech: 'Technician', foreman: 'Foreman', parts: 'Parts', writer: 'Service writer', triage: 'Triage', warranty: 'Warranty' }[h.to] || '', held: h.held, goal: h.goal, to: h.to };
  }
  function tcAge(r){ const h = tcHeld(r); if(!h || !h.held || h.held < 60000) return '';
    const x = h.goal ? h.held / h.goal : 0; return `<span class="tch-age${x >= 1 ? ' b' : x >= .75 ? ' w' : ''}" title="${esc(h.who ? 'With ' + h.who + ' · ' : '')}follow up after ${esc(tgShortDur(h.goal))}${x >= 1 ? ' — overdue' : ''}">${esc(tgShortDur(h.held))}</span>`; }
  const tcEta = t => String(t || '').replace(/ETA (\d{4}-\d{2}-\d{2})/g, (m, d) => 'due ' + PG.day(d + 'T12:00:00'));
  function tcItem(r){
    const o = r.focus, on = r.id === TU.ro, more = r.ops.filter(x => x.st !== 'done').length - 1;
    const ord = r.lane === 'next' ? (o.paused ? `<span class="cx-n pz" title="Paused">${ic('pause', 10)}</span>` : o.ord ? `<span class="cx-n">${o.ord}</span>` : '<span></span>') : '';
    const sub = r.lane === 'wait' ? tcAge(r) + esc(o.hold.k + (o.hold.txt ? ' · ' + tcEta(o.hold.txt) : ''))
      : r.lane === 'done' ? 'Done at ' + esc(o.at) + (r.ops.length > 1 ? ' · ' + r.ops.length + ' operations' : '')
      : (o.back ? '<span class="ib-k auto">back</span>' : '') + esc(o.cmp) + (more > 0 ? ` <em>+${more}</em>` : '');
    const m = r.lane === 'run' ? `<b class="run" data-tk="runm">${dur(burnt(o) * 60)}</b>`
      : r.lane === 'done' ? `<b>${r.eff == null ? '—' : r.eff + '%'}</b>`
      : r.lane === 'wait' ? `<b class="wt">${esc(o.hold.k)}</b>`
      : o.paused ? `<b>${dur(o.b0 * 60)}</b>` : `<b>${h1(r.q)} h</b>`;
    const sm = r.lane === 'next' && o.paused ? 'paused ' + o.paused : r.lane === 'wait' ? (o.hold.left || '') : r.lane === 'done' ? h1(sum(r.ops.filter(x => x.st === 'done'), x => x.q)) + ' h sold' : (o.ro.cxBring && !bayLike(o.spot) ? 'coming in' : o.spot || 'no spot');
    return `<div class="tg-it tch-it ${r.lane}${on ? ' on' : ''}${on && TU.kb ? ' kb' : ''}${ord ? ' has-o' : ''}" data-a="tsel" data-id="${r.id}">${ord}<span class="tch-pic">${trkThumb(r.ro)}</span><span class="tch-t"><b><span class="tg-no">${esc(r.no)}</span>${esc(r.cust)}</b><small>${sub}</small></span><span class="tch-m">${m}<small>${esc(sm)}</small></span></div>`;
  }
  /* Parsec 14: what was sent to you — road test asks, notes, go-aheads, parts in (the Inbox page went in 12.2) */
  function tcSent(){ if(TU.q) return ''; let L = []; try{ L = sentToMe(S.me); }catch(e){} if(!L.length) return '';
    return `<div class="tg-grp tch-grp sent">${ic('inbox', 12)}Sent to you<span>${L.length}</span></div>` + L.slice(0, 8).map(n => { const ro = n.ro && getRO(n.ro);
      return `<div class="tg-it tch-it tch-sent${n.st === 'new' ? ' new' : ''}" data-a="tsent" data-k="${esc(n.key)}" data-ro="${esc(n.ro || '')}"><span class="tch-sk">${ic(n.k === 'ask' || n.k === 'men' ? 'chat' : 'info', 14)}</span><span class="tch-t"><b>${ro ? `<span class="tg-no">${esc(tgNum(ro))}</span>` : ''}${esc(n.t || n.b || 'A note')}</b><small>From ${esc(PG.first(n.from || 'Parsec'))} · ${esc(PG.ago(n.at))}${n.q ? ' · “' + esc(n.q) + '”' : n.b && n.t ? ' · ' + esc(n.b) : ''}</small></span><button class="tch-sx" data-a="tsentx" data-k="${esc(n.key)}" title="Done — take it off the list" aria-label="Done">${ic('check', 14)}</button></div>`; }).join(''); }
  function tcList(G, all){
    const n = all.length, shown = G.reduce((s, g) => s + g[1].length, 0);
    const SH = shopRo().operations;
    const fn = STATE.fmNote && STATE.fmNote.d === todayStr() && STATE.fmNote.text && U.noteX !== (STATE.fmNote.at || todayStr()) ? STATE.fmNote : null;
    const empty = n ? (shown ? '' : `<div class="cx-empty">${ic('search', 18)}<b>Nothing matches “${esc(TU.q)}”</b><small>Search finds the RO, customer, truck, year, unit or complaint.</small></div>`)
      : `<div class="cx-empty">${ic('tech', 18)}<b>No repair orders yet</b><small>${esc(PG.person('Foreman') ? PG.first(PG.person('Foreman')) : 'The foreman')} assigns work on the Foreman page — it shows here.</small></div>`;
    return `<section class="tg-list tch-list"><div class="tg-lh">${S.view ? esc(PG.first(S.me)) + '’s repair orders' : 'My repair orders'}<span class="n">${n}</span></div><div class="tg-scroll">${fn ? `<div class="cx-why cx-fmn" style="margin:8px 12px 4px">${ic('chat', 13)}<span><b>From ${esc(PG.first(fn.by || PG.person('Foreman') || 'the foreman'))}:</b> ${esc(fn.text)}</span><button class="btn btn-sm ib tg-gh" data-a="notex" title="Hide for today" style="margin-left:auto;flex:none">${ic('x', 13)}</button></div>` : ''}${tcSent()}${G.map(([g, L, k]) => `<div class="tg-grp tch-grp ${k}">${pgSt('ro', tcLaneSt[k] || 'Hold Tech', { iconOnly: 1, size: 12, cls: 'tch-gi' })}${esc(g)}<span>${L.length || ''}</span></div>` + (k === 'run' && !L.length ? runEmpty() : L.map(tcItem).join(''))).join('')}${tcDoneSec()}${empty}</div>
     ${S.view ? '' : `<div class="cx-shop"><span>${ic('gear2', 13)}Shop</span>${SH.map(op => { const on = S.rp && S.rp.opId === op.id; const nm = op.complaint.replace(/^Shop /, ''); return `<button class="${on ? 'on' : ''}" data-a="shopt" data-id="${op.id}"${S.out ? ' disabled' : ''} title="${esc(op.complaint)}">${on ? `<i></i>${esc(nm)} <b data-tk="shop">${TK.shop()}</b>` : esc(nm)}</button>`; }).join('')}</div>`}
     <div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span>${S.view ? '' : `<span>${kbd('↵')}start</span><span>${kbd('S')}stop</span><span>${kbd('Ctrl')}${kbd('↵')}done</span>`}<span>${kbd('/')}search</span><span>${kbd('Y')}yard</span></div></section>`;
  }
  /* ---------- Parsec 14.7: Completed — the ROs you finished work on. A record kept per person (v147c.js), so an RO stays
     here after it's transferred to someone else or deleted. The last 30 days; Show all for the rest. ---------- */
  const TCD = { all: false };
  function tcDoneRows(){ try{ v147Scan(); }catch(e){}
    const L = (Array.isArray(STATE.tcDone) ? STATE.tcDone : []).filter(e => e && techSame(e.tech, S.me)), by = {};
    L.forEach(e => { const ro = getRO(e.roId), op = ro ? (ro.operations || []).find(o => o.id === e.opId) : null; if(op && !opDoneNow(op)) return;   /* reopened: it's back in the lists above */
      const day = localDay(e.at), key = day + '|' + e.roId, r = by[key] || (by[key] = { key, day, roId: e.roId, gone: !ro, ro, no: e.no, cust: e.cust, truck: e.truck, unit: e.unit, ops: [], at: e.at, hrs: 0, q: 0 });
      r.ops.push(e); r.hrs += +e.hrs || 0; r.q += +e.q || 0; if(e.at > r.at) r.at = e.at; });
    Object.values(by).forEach(r => r.ops.sort((a, b) => a.opn - b.opn));
    return Object.values(by).sort((a, b) => a.at < b.at ? 1 : a.at > b.at ? -1 : 0); }
  const tcDoneHit = r => { const q = TU.q.trim().toLowerCase(); if(!q) return true; const t = [r.no, r.cust, r.truck, r.unit].concat(r.ops.map(o => o.cmp)).join(' ').toLowerCase(); return q.split(/\s+/).every(w => t.indexOf(w) > -1); };
  function tcDoneDay(d){ const t = todayStr(), y = (() => { const x = new Date(); x.setDate(x.getDate() - 1); return localDay(x.toISOString()); })(); return d === t ? 'Today' : d === y ? 'Yesterday' : PG.day(d + 'T12:00:00'); }
  function tcDoneItem(r){ const id = r.gone ? 'del:' + r.roId : r.roId, on = TU.ro === id, a = r.ro ? r.ro.assignedTech : '', moved = !!(r.ro && a && !techSame(a, S.me));
    const tag = r.gone ? '<span class="tch-ctag x">deleted</span>' : moved ? `<span class="tch-ctag">now with ${esc(PG.first(a))}</span>` : '';
    const ops = r.ops.map(o => 'Op ' + o.opn + ' ' + o.cmp).join(' · ');
    return `<div class="tg-it tch-it done tch-cit${on ? ' on' : ''}${on && TU.kb ? ' kb' : ''}${r.gone ? ' gone' : ''}" data-a="tcdsel" data-id="${esc(id)}" title="${esc(ops)}"><span class="tch-pic">${r.ro ? trkThumb(r.ro) : `<span class="tch-gonepic">${ic('trash', 14)}</span>`}</span><span class="tch-t"><b><span class="tg-no">${esc(r.no)}</span>${esc(r.cust || '—')}</b><small>${tag}${esc((r.unit && r.unit !== '—' ? 'Unit ' + r.unit + ' · ' : '') + ops)}</small></span><span class="tch-m"><b>${h1(r.hrs)} h</b><small>${esc(clk(r.at))}</small></span></div>`; }
  function tcDoneSec(){ const R1 = tcDoneRows().filter(tcDoneHit); if(!R1.length) return '';
    const cut = Date.now() - 30 * 864e5, recent = R1.filter(r => +new Date(r.at) >= cut), R = TCD.all ? R1 : recent;
    let h = `<div class="tg-grp tch-grp done tch-cgrp">${pgSt('ro', 'Complete', { iconOnly: 1, size: 12, cls: 'tch-gi' })}Completed<span>${recent.length}</span></div>`, d0 = '';
    R.forEach(r => { if(r.day !== d0){ d0 = r.day; h += `<div class="tch-cday">${esc(tcDoneDay(r.day))}</div>`; } h += tcDoneItem(r); });
    if(R1.length > recent.length) h += `<button class="tch-cmore" data-a="tcdall">${TCD.all ? 'The last 30 days only' : (recent.length ? 'Show all ' + R1.length : 'Show the ' + R1.length + ' before that')}</button>`;
    return h; }
  /* a completed RO that's no longer in your live list opens as usual; a deleted one opens its record */
  function tcDoneR(id){ if(!id) return null; const L = tcDoneRows();
    if(/^del:/.test(id)){ const rid = id.slice(4), M = L.filter(r => r.gone && r.roId === rid); if(!M.length) return null;
      return { id, del: true, ops: [], focus: { id: null, st: 'done', why: null }, snap: Object.assign({}, M[0], { ops: M.flatMap(r => r.ops).sort((a, b) => a.opn - b.opn), hrs: M.reduce((s, r) => s + r.hrs, 0) }) }; }
    const ro = getRO(id); if(!ro || !L.some(r => r.roId === id && !r.gone)) return null;
    return { id, ro, ops: [], focus: { id: null, st: 'done', why: null }, lane: 'done', no: tgNum(ro), cust: ro.customerName || '—' }; }
  function tcDonePane(r){ const s = r.snap, row = (k, v) => v ? `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>` : '';
    return `<div class="mg-pane tch-pane tch-cdel"><section class="tch-cdc"><div class="tch-cdh"><span class="tch-gonepic lg">${ic('trash', 18)}</span><span><b><span class="tg-no">${esc(s.no)}</span>${esc(s.cust || '—')}</b><small>This RO was deleted — kept here as your record of the work</small></span></div>
      <dl class="tch-cdl">${row('Truck', s.truck)}${row('Unit', s.unit && s.unit !== '—' ? s.unit : '')}${row('Completed', PG.day(s.at) + ' · ' + clk(s.at))}${row('Your time', h1(s.hrs) + ' h')}</dl>
      <div class="tch-cdo">${s.ops.map(o => `<div><span class="n">Op ${o.opn}</span><span class="c">${esc(o.cmp)}</span><span class="v">${h1(o.hrs)} / ${h1(o.q)} h</span></div>`).join('')}</div>
      <p class="tch-cdn">Read-only. The RO’s own page, its notes and its photos went with it.</p></section></div>`; }
  /* ---------- the RO on the right — the layout picked on the RO page mock-up (Parsec 11.1) ----------
     In the middle: Operations, Parts on this RO, Activity & notes, Fault codes, Photos & codes, Messages about this RO,
     Truck history, Warranty claim, Customer, Estimate & approval, Ready to close. At the right: Truck & status, Stage bar,
     Who has it, People, Schedule, Vehicle, Money. An open operation keeps its tabs; its notes sit in the Time tab, each one
     inside the punch it was written in, between the start and the stop. */
  const TC_DEPT = { tech: 'Technician', foreman: 'Foreman', parts: 'Parts', writer: 'Service writer', triage: 'Triage', warranty: 'Warranty' };
  const TC_FMI = ['above normal (most severe)', 'below normal (most severe)', 'erratic or intermittent', 'voltage high or shorted high', 'voltage low or shorted low', 'current low or open circuit', 'current high or grounded', 'mechanical fault', 'abnormal frequency', 'abnormal update rate', 'abnormal rate of change', 'root cause not known', 'bad device', 'out of calibration', 'special instructions', 'above normal (least severe)', 'above normal (moderate)', 'below normal (least severe)', 'below normal (moderate)', 'network data in error'];
  const tcFc = f => f.code || 'SPN ' + f.spn + ' · FMI ' + f.fmi;
  const tcFcMean = f => f.code ? ({ P: 'Powertrain', C: 'Chassis', B: 'Body', U: 'Network' }[f.code.charAt(0)] || '') + ' fault code' : 'FMI ' + f.fmi + (f.fmi === 31 ? ' — condition exists' : TC_FMI[f.fmi] ? ' — ' + TC_FMI[f.fmi] : '');
  function tcParseFc(s){ const d = /^\s*([PCUB])\s*-?\s*(\d{4,6})\s*$/i.exec(String(s || '')); if(d) return { code: d[1].toUpperCase() + d[2] };
    const m = /^\s*(?:SPN\s*)?(\d{1,6})\s*(?:\/|-|:|,|\s|FMI)\s*(?:FMI\s*)?(\d{1,2})\s*$/i.exec(String(s || '')); if(!m) return null; const spn = +m[1], fmi = +m[2]; return fmi > 31 ? null : { spn, fmi }; }
  const tcCard = (k, t, sub, body, act) => `<section class="mg-card tch-blk tch-k-${k}"><div class="mg-ch"><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}<span class="sp"></span>${act || ''}</div><div class="mg-cb">${body}</div></section>`;
  const tcAv = n => n ? PG.av(n) + esc(n) : '<span class="mu">Not set</span>';
  function tcLive(r){ return (r.ro.operations || []).map((op, i) => r.ops.find(x => x.id === op.id) || (op && op.id ? tcOther(r.ro, op, i) : null)).filter(Boolean); }
  /* Truck & status: the truck, who it is, where it stands, and what you can do now */
  /* Parsec 12.9: the RO's own status, and its menu — a completed RO can be set back to open from here */
  const tcRsc = n => n === 'Working' ? 'var(--tg-st-working)' : /^Waiting – Customer/.test(n) ? 'var(--tg-st-customer)' : /^Waiting – Tech/.test(n) ? 'var(--tg-st-support)' : /^Waiting/.test(n) ? 'var(--tg-st-waiting)' : /^Complete/.test(n) ? 'var(--tg-good)' : n === 'Declined' ? 'var(--tg-st-problem)' : 'var(--tg-st-hold)';
  const tcRsk = n => n === 'Working' ? 'wk' : /^Waiting/.test(n) ? 'wt' : /^Complete/.test(n) ? 'dn' : n === 'Declined' ? 'x' : 'nx';
  /* an operation's status as the Technician page has it: [status, the words after it] */
  const tcLaneSt = { run: 'Working', next: 'Hold Tech', wait: 'Waiting – Parts', done: 'Complete' };
  /* Who has it: the person it waits on, how long, and when to follow up (Parsec 10's blocker aging) */
  /* ---------- the operations: a row each; open one for its clock and its tabs ---------- */
  function tcOther(ro, op, i){
    const st0 = opStatus(op), stn = typeof st0 === 'string' ? st0 : st0.status;
    return { id: op.id, roId: ro.id, ro, op, opn: i + 1, no: tgNum(ro), cust: ro.customerName || '—', t: opJobType(op), cmp: op.complaint || 'Operation', q: +op.quoted || 0, b0: opCalc(op).burntHrs, st: 'other', stn: op.declined ? 'Declined' : stn, parts: opRealParts(op), notes: notesOf(op), other: true };
  }
  const PSs = p => { const k = p.status || 'Not Ordered'; return { 'Not Ordered': ['wt', 'Not ordered'], 'Ordered': ['wt', 'Ordered' + (p.eta ? ' · due ' + PG.day(p.eta + 'T12:00:00') : '')], 'Backordered': ['bo', 'Backordered' + (p.eta ? ' · ' + PG.day(p.eta + 'T12:00:00') : '')], 'Received': ['in', 'Received'], 'Staged': ['st', 'Staged at the counter'], 'Picked up': ['ok', 'Picked up'], 'Installed': ['ok', 'Installed'], 'Returned': ['in', 'Returned'] }[k] || ['in', k]; };
  /* ---------- Parsec 12.3: the RO page picks, on the Technician page's RO ----------
     the Time tab in the clock reasons' colors with edits in place, icons with their names on hover, the status and ⋯ in the operation header,
     the job type as a dropdown, each tab's actions at the right of the tabs */
  const TC_IC = { box: '<path d="M12 3.2l7.8 4.4v8.8L12 20.8l-7.8-4.4V7.6z"/><path d="M4.2 7.6L12 12l7.8-4.4M12 12v8.8"/>', scan: '<path d="M4 8.5V6a2 2 0 0 1 2-2h2.5M15.5 4H18a2 2 0 0 1 2 2v2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5M8.5 20H6a2 2 0 0 1-2-2v-2.5M7.5 12h9"/>', clockPlus: '<path d="M20 12a8 8 0 1 1-6.2-7.8"/><path d="M12 8v4l2.5 1.5"/><path d="M18.5 3v5M16 5.5h5"/>',
    notePlus: '<path d="M13.5 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h12a1.5 1.5 0 0 0 1.5-1.5v-7.5"/><path d="M8 10h5M8 13.5h7"/><path d="M18 3v5M15.5 5.5h5"/>',
    upload: '<path d="M12 15.5V4.5M7.5 9 12 4.5 16.5 9"/><path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/>',
    paste: '<rect x="6" y="5" width="12" height="15.5" rx="2"/><path d="M9.5 5V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1"/><path d="M9 11h6M9 14.5h4"/>',
    foldA: '<path d="M7 9.5l5-5 5 5M7 14.5l5 5 5-5"/>', foldB: '<path d="M7 4.5l5 5 5-5M7 19.5l5-5 5 5"/>' };
  const tic = (k, z) => TC_IC[k] ? '<svg class="tg-ic" viewBox="0 0 24 24" width="' + (z || 16) + '" height="' + (z || 16) + '" aria-hidden="true">' + TC_IC[k] + '</svg>' : ic(k, z);
  const tib = (k, label, attrs, cls) => `<button class="tch-icb${cls ? ' ' + cls : ''}" ${attrs || ''} data-tip="${esc(label)}" aria-label="${esc(label)}">${tic(k, 15)}</button>`;
  const rcv = r => { try{ return r ? reasonVar(r) : 'var(--tg-ink3)'; }catch(e){ return 'var(--tg-ink3)'; } };
  const tcJv = k => { try{ return jtVar(k); }catch(e){ return 'var(--tg-ink3)'; } };
  const tcJl = k => k === 'OP' ? 'REPAIR' : k;
  const TC_JT = ['DIAG', 'OP', 'PM', 'WARR', 'COMEBACK', 'SUBLET', 'RECALL'];
  const tcSR = () => typeof START_REASONS !== 'undefined' ? START_REASONS.slice() : ['Diagnosing', 'Repairing', 'Inspecting', 'Testing'];
  const tcER = () => ['Switched job', 'Lunch', 'End of day'].concat(typeof STOP_REASONS_EXPLICIT !== 'undefined' ? STOP_REASONS_EXPLICIT : ['Waiting – Parts', 'Complete']);
  const tc2 = n => String(n).padStart(2, '0');
  const tcHM = v => { const d = new Date(v); return isNaN(d) ? '' : tc2(d.getHours()) + ':' + tc2(d.getMinutes()); };
  const tcYMD = v => { const d = new Date(v); return d.getFullYear() + '-' + tc2(d.getMonth() + 1) + '-' + tc2(d.getDate()); };
  const tcAtHM = (v, hm) => { const d = new Date(v), m = /^(\d{1,2}):(\d{2})/.exec(hm || ''); if(!m || isNaN(d)) return null; d.setHours(+m[1], +m[2], 0, 0); return d.toISOString(); };
  const tcP = id => STATE.punches.find(x => x.id === id) || null;
  const tcCanEd = o => !!o && (!!S.view || !o.other);
  const tcCanEdP = p => !!p && (!!S.view || !!opBy(p.opId)) && (typeof can !== 'function' || can(permPunchAct(p)));   /* Parsec 13 */
  const tcRawOp = id => { const r = tcCur(); return r ? (r.ro.operations || []).find(op => op && op.id === id) || null : null; };
  function tcSaveTime(pid, f, v){
    const p = tcP(pid), v0 = TU.edT && TU.edT.v0; TU.edT = null; if(!p || !tcCanEdP(p)){ PG.keepScroll(render); return; }
    if(f === 'e' && !p.stop){ tcStopAsk(p, v, v0); return; }
    const old = f === 's' ? p.start : p.stop; if(!old || (f === 'e' && !p.stop)){ PG.keepScroll(render); return; }
    const iso = tcAtHM(old, v); if(!iso || tcHM(iso) === tcHM(old)){ PG.keepScroll(render); return; }
    const res = editPunchCommit(p, { start: f === 's' ? iso : p.start, stop: f === 'e' ? iso : p.stop, startReason: p.startReason, stopReason: p.stopReason, opId: p.opId, notes: p.notes });
    if(!res || !res.ok){ pushToast((res && res.msg) || 'Couldn’t change that time.'); PG.keepScroll(render); return; }
    pushToast(`${f === 's' ? 'Start' : 'Stop'} time changed to ${clk(iso)} — ${dur(((p.stop ? new Date(p.stop) : Date.now()) - new Date(p.start)) / 60000)} on that punch.`, true);
  }
  /* Parsec 12.7: the running punch really stopped earlier — it asks why before it stops */
  function tcStopAsk(p, v, v0){
    const st = new Date(p.start).getTime(); let ts = tcAtHM(p.start, v); ts = ts ? new Date(ts).getTime() : null;
    if(ts == null || !v || v === v0){ PG.keepScroll(render); return; }
    if(ts <= st && ts + 864e5 > st && ts + 864e5 <= Date.now()) ts += 864e5;   /* past midnight */
    if(ts <= st){ pushToast(`The stop has to come after the start, ${clk(st)}.`); return; }
    if(ts > Date.now()){ pushToast('A stop time can’t be in the future.'); return; }
    TU.why = { p: p.id, ts }; PG.keepScroll(render);
    setTimeout(() => { const b = document.querySelector('[data-pg="tech"] .tch-why .tch-rs'); if(b) b.focus(); }, 0);
  }
  function tcAddShots(o, files){
    const ro = o && getRO(o.roId); if(!ro) return;
    if(!files.length){ pushToast('No picture on the clipboard — copy a screenshot first.'); return; }
    if(typeof JC === 'undefined' || !JC.addFilesTo){ pushToast('Files can’t be added here.'); return; }
    pushUndo('attach files'); JC.addFilesTo(ro, 'pics', files, k => { pushToast(k ? `${k} screenshot${k === 1 ? '' : 's'} added to Op ${o.opn} on ${tgNum(ro)}.` : 'Couldn’t add that picture.'); render(); }, o.id);
  }
  /* each tab's actions, at the right of the tabs — only for the open tab */
  /* the slim day bar at the top of the Time tab: each punch in its start reason's color */
  /* a new time entry, opened right where it goes */
  /* the pop-overs off the operation: job type, a punch's reason, ⋯ */
  function tcOpPop(){
    const p = U.pop, r = tcCur(); if(!p || !r) return '';
    const head = (t, sub) => `<div class="tg-ph"><b>${t}</b>${sub ? `<span class="cu">${esc(sub)}</span>` : ''}</div>`;
    if(p.type === 'trst'){ const ro = getRO(p.ro); if(!ro) return ''; const cur = roStatus(ro).status;
      return `<div class="tg-pop menu tch-mn">${head('RO status', tgNum(ro))}${RO_STATUS_OPTIONS.map(x => `<button class="tg-mi tch-mi${x.status === cur ? ' on' : ''}" data-a="trsts" data-ro="${ro.id}" data-v="${esc(x.status)}">${pgSt('ro', x.status, { iconOnly: 1, cls: 'tch-mic' })}${esc(x.status === 'Complete – Road test' && !rtNeeded(ro) ? 'Complete' : pgStLabel('ro', x.status))}${x.status === cur ? `<span class="meta">${ic('check', 13)}</span>` : ''}</button>`).join('')}</div>`; }
    if(p.type === 'tjt'){ const op = tcRawOp(p.id); if(!op) return ''; const cur = opJobType(op);
      return `<div class="tg-pop menu tch-mn">${head('Job type', 'Op ' + tcOpN(r, op))}${TC_JT.map(k => `<button class="tg-mi tch-mi${k === cur ? ' on' : ''}" data-a="tjts" data-id="${op.id}" data-v="${k}"><i class="tch-dot" style="background:${tcJv(k)}"></i>${esc(tcJl(k))}${k === cur ? `<span class="meta">${ic('check', 13)}</span>` : ''}</button>`).join('')}</div>`; }
    if(p.type === 'trs'){ const pu = tcP(p.p); if(!pu) return ''; const f = p.f, cur = f === 's' ? pu.startReason : pu.stopReason, L = f === 's' ? tcSR() : tcER();
      return `<div class="tg-pop menu tch-mn">${head(f === 's' ? 'Started for' : 'Stopped because')}${L.map(x => `<button class="tg-mi tch-mi${x === cur ? ' on' : ''}" data-a="trss" data-p="${pu.id}" data-f="${f}" data-v="${esc(x)}"><i class="tch-dot" style="background:${rcv(x)}"></i>${esc(x)}${x === cur ? `<span class="meta">${ic('check', 13)}</span>` : ''}</button>`).join('')}</div>`; }
    if(p.type === 'tmv'){ const pu = tcP(p.p); if(!pu || pu.stop) return ''; const G = rcTargets(pu);
      return `<div class="tg-pop menu tch-mn tch-mv">${head('Move the running clock to')}<div class="tch-mvs">It keeps its start, ${clk(pu.start)}</div>${G.length ? G.map(g => `<div class="tch-mvh">${esc(g.t)}</div>` + g.L.map(t => `<button class="tg-mi tch-mi" data-a="tmvs" data-p="${pu.id}" data-ro="${esc(t.roId)}" data-op="${esc(t.opId)}"><span class="tch-mvt"><b>${esc(g.k === 'shop' ? t.cm : g.k === 'ro' ? 'Op ' + t.n + ' · ' + t.cm : t.no + ' · Op ' + t.n)}</b>${g.k === 'other' ? `<small>${esc(t.cm + (t.cust ? ' · ' + t.cust : ''))}</small>` : ''}</span></button>`).join('')).join('') : '<div class="tch-mvh">No other operation to move it to</div>'}</div>`; }
    if(p.type === 'tom'){ const op = tcRawOp(p.id); if(!op) return ''; const o = opBy(op.id);
      return `<div class="tg-pop menu tch-mn">${head('Op ' + tcOpN(r, op), op.complaint || '')}<button class="tg-mi" data-a="tomx" data-v="print" data-id="${op.id}">${ic('print', 14)}Print job jacket</button><button class="tg-mi" data-a="tomx" data-v="story" data-id="${op.id}">${ic('copy', 14)}Copy the story</button>`
        + (o && stOf(o) !== 'done' ? `<button class="tg-mi" data-a="tomx" data-v="ask" data-id="${op.id}">${ic('parts', 14)}Ask Parts for a part</button>` : '')
        + `<div class="tch-msep"></div><button class="tg-mi tch-dng" data-a="tomx" data-v="del" data-id="${op.id}">${ic('trash', 14)}Delete operation</button></div>`; }
    return '';
  }
  /* the Time tab: every punch from its start to its stop, with the notes written during it in between; notes written off the clock fall where their time is */
  /* ---------- the new blocks ---------- */
  /* ---------- picking several operations, or several parts on one, and acting on them together (Parsec 11.2) ----------
     A box shows when you point at a row (always on a phone); Ctrl click picks a row, Shift click picks a run of rows.
     The actions sit in a bar along the bottom. Parts are picked on one operation at a time. */
  const tcCur = () => { try{ return tcRos().find(x => x.id === TU.ro) || null; }catch(e){ return null; } };
  const tcSelOps = r => (r.ro.operations || []).filter(op => op && op.id && TU.selO[op.id]);
  const tcSelParts = r => { const op = TU.selPOp && getOp(r.id, TU.selPOp); return op ? opRealParts(op).filter(p => TU.selP[p.id]) : []; };
  const tcOpN = (r, op) => (r.ro.operations || []).indexOf(op) + 1;
  function tcSelClear(){ TU.selO = {}; TU.selP = {}; TU.selPOp = null; TU.lastSel = null; }
  function tcToggle(k, id, ev, opId){
    const r = tcCur(); if(!r) return;
    let ids, M;
    if(k === 'o'){ TU.selP = {}; TU.selPOp = null; M = TU.selO; ids = (r.ro.operations || []).filter(op => op && op.id).map(op => op.id); }
    else { if(TU.selPOp !== opId){ TU.selP = {}; TU.selPOp = opId; } TU.selO = {}; M = TU.selP; const op = getOp(r.id, opId); ids = op ? opRealParts(op).map(p => p.id) : []; }
    if(ev && ev.shiftKey && TU.lastSel && TU.lastSel.k === k && ids.indexOf(TU.lastSel.id) > -1){ const a = ids.indexOf(TU.lastSel.id), b = ids.indexOf(id); ids.slice(Math.min(a, b), Math.max(a, b) + 1).forEach(i => M[i] = 1); }
    else if(M[id]) delete M[id]; else M[id] = 1;
    if(k === 'p' && !Object.keys(TU.selP).length) TU.selPOp = null;
    TU.lastSel = { k, id }; U.pop = null; PG.keepScroll(render);
  }
  const tcCk = (on, mid, attrs, label) => `<button class="tch-cb${on ? ' on' : mid ? ' mid' : ''}" role="checkbox" aria-checked="${on ? 'true' : mid ? 'mixed' : 'false'}" aria-label="${esc(label)}" ${attrs}>${on ? ic('check', 11) : mid ? '<i></i>' : ''}</button>`;
  function tcCopy(text, msg){
    const fall = () => { const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); let ok = false; try{ ok = document.execCommand('copy'); }catch(e){} ta.remove(); pushToast(ok ? msg : 'Couldn’t copy — the browser blocked it.'); };
    try{ navigator.clipboard.writeText(text).then(() => pushToast(msg), fall); }catch(e){ fall(); }
  }
  /* print one sheet: built in the page for a moment, so the page's own styles go with it */
  function tcPrint(title, inner){ const host = document.querySelector('[data-pg="tech"]'); if(!host) return; const el = document.createElement('div'); el.className = 'tch-paper'; el.innerHTML = inner; host.appendChild(el); try{ PG.printPaper(el, title); }catch(e){ console.error(e); } el.remove(); }
  function tcPaperHead(r, what){ let tl = r.truck; try{ const t = trkLabel(r.ro); if(t && t !== 'this truck') tl = t; }catch(e){}
    let qr = ''; try{ const q = qrcode(0, 'L'); q.addData(keyTagCode(r.ro)); q.make(); qr = q.createSvgTag(3, 2); }catch(e){}
    return `<div class="tp-h"><div><small>${esc(what)}</small><h1>${esc(r.ro.roNumber || r.no)} · ${esc(r.cust)}</h1><p>${esc(tl)}${r.ro.unitNumber ? ' · Unit ' + esc(r.ro.unitNumber) : ''}${r.ro.vin ? ' · VIN ' + esc(r.ro.vin) : ''}</p><p>${esc(S.me || PG.me().name)} · printed ${esc(PG.whenL(Date.now()))}${r.ro.location ? ' · ' + esc(r.ro.location) : ''}</p></div>${qr ? `<div class="tp-qr">${qr}<small>Scan to switch</small></div>` : ''}</div>`; }
  function tcJacket(r, L){
    return tcPaperHead(r, 'Job jacket') + L.map(op => { const n = tcOpN(r, op), P = opRealParts(op), F = op.faults || [];
      return `<section class="tp-op"><h2>Op ${n} · ${esc(opJobType(op))} · ${esc(op.complaint || '')}<span>${h1(+op.quoted || 0)} h quoted</span></h2>${F.length ? `<p class="tp-c">Codes: ${esc(F.map(tcFc).join(', '))}</p>` : ''}${P.length ? `<table><tr><th></th><th>Part</th><th>Number</th><th>Qty</th><th>Status</th></tr>${P.map(p => `<tr><td>☐</td><td>${esc(p.description || '')}</td><td>${esc(p.partNumber || '')}</td><td>${esc(p.qty || 1)}</td><td>${esc(p.status || 'Not Ordered')}</td></tr>`).join('')}</table>` : ''}<div class="tp-l"><b>Cause</b><i></i><i></i><b>Correction</b><i></i><i></i></div></section>`; }).join(''); }
  function tcPickList(r, op, P){
    return tcPaperHead(r, 'Pick list · Op ' + tcOpN(r, op) + ' — ' + (op.complaint || '')) + `<table class="tp-pl"><tr><th></th><th>Part number</th><th>Description</th><th>Qty</th><th>Status</th></tr>${P.map(p => `<tr><td>☐</td><td>${esc(p.partNumber || '—')}</td><td>${esc(p.description || '')}</td><td>${esc(p.qty || 1)}</td><td>${esc(p.status || 'Not Ordered')}</td></tr>`).join('')}</table>`; }
  /* the bar along the bottom */
  function tcSelBar(r){
    const L = tcSelOps(r), P = tcSelParts(r); if(!L.length && !P.length) return '';
    const fmF = PG.person('Foreman') ? PG.first(PG.person('Foreman')) : 'the foreman', b = (v, ic0, t, dis, tip, pri) => `<button class="btn btn-sm${pri ? ' pri' : ''}" data-a="tsact" data-v="${v}" data-keep-pop${dis ? ' disabled' : ''}${tip ? ` title="${esc(tip)}"` : ''}>${ic(ic0, 13)}${t}${v === 'hold' || v === 'pmove' ? ic('chevD', 11) : ''}</button>`;
    let info, acts;
    if(L.length){ const M = L.map(op => opBy(op.id)).filter(Boolean), live = M.filter(o => stOf(o) !== 'done'), left = sum(live, o => Math.max(0, o.q - burnt(o)));
      const one = L.length === 1 && M[0] && stOf(M[0]) !== 'done' && !isRun(M[0]);
      info = `<b>${L.length} operation${L.length === 1 ? '' : 's'}</b><small>${live.length ? h1(left) + ' h left' : 'nothing left to do'}${L.length > M.length ? ' · ' + (L.length - M.length) + ' not yours' : ''}</small>`;
      acts = b('start', 'play', 'Start', !one || S.out || S.view, S.view ? 'The clock is ' + PG.first(S.me) + '’s to start' : one ? '' : 'Start works on one operation that isn’t running') + b('hold', 'clock', 'Hold', !live.length) + b('askp', 'parts', 'Ask Parts') + b('askf', 'chat', 'Ask ' + esc(fmF)) + b('note', 'pencil', 'Note on all', !live.length) + b('code', 'plus', 'Add a code', !live.length) + b('done', 'check', 'Mark done', !live.length, '', true) + b('print', 'print', 'Print job jacket') + b('story', 'copy', 'Copy the story') + b('del', 'trash', 'Delete').replace('class="btn btn-sm"', 'class="btn btn-sm tch-danger"');
    } else { const op = getOp(r.id, TU.selPOp), st = P.filter(p => p.status === 'Staged').length, hand = P.filter(p => ['Picked up', 'Received', 'Staged'].indexOf(p.status) > -1).length, ret = P.filter(p => ['Installed', 'Returned'].indexOf(p.status) < 0).length, mine = !!opBy(TU.selPOp);
      info = `<b>${P.length} part${P.length === 1 ? '' : 's'} · Op ${tcOpN(r, op)}</b><small>${st ? st + ' staged' : 'none staged'}</small>`;
      acts = b('ppick', 'check', 'Picked up' + (st && st < P.length ? ' · ' + st : ''), !st || !mine, st ? '' : 'Only staged parts can be picked up', true) + b('pinst', 'wrench', 'Installed' + (hand && hand < P.length ? ' · ' + hand : ''), !hand || !mine, hand ? '' : 'Only parts in hand can be installed') + b('pask', 'parts', 'Ask Parts') + b('pret', 'undo', 'Return', !ret || !mine) + b('pmove', 'swap', 'Move to…', !mine) + b('ppns', 'copy', 'Copy part numbers') + b('plist', 'print', 'Print pick list'); }
    return `<div class="tch-sb" role="toolbar" aria-label="${L.length ? 'Selected operations' : 'Selected parts'}"><span class="bi">${info}</span>${acts}<span class="sp"></span>${tib('x', 'Clear', 'data-a="tsclear"', 'tch-icb-d')}</div>`;
  }
  /* the bar's pop-overs */
  function tcSelPop(){
    const p = U.pop, r = tcCur(); if(!p || !r || !/^ts/.test(p.type)) return '';
    const L = p.only ? (r.ro.operations || []).filter(op => op && op.id === p.only) : tcSelOps(r), P = tcSelParts(r), x = `<button class="btn btn-sm ib" data-a="popx">${ic('x', 14)}</button>`;
    const opsTxt = L.map(op => 'Op ' + tcOpN(r, op)).join(', ');
    if(p.type === 'tsh'){ const pt = PG.person('Parts'), wr = (function(){ try{ return rtPerson('writer'); }catch(e){ return ''; } })(), fm = PG.person('Foreman');
      return `<div class="tg-pop menu mg-pop-m"><div class="tg-ph"><b>Put ${esc(opsTxt)} on hold</b><span class="cu">they go to Waiting</span></div>${[['Waiting – Parts', (pt ? PG.first(pt) : 'Parts') + ' gets one note for all of them'], ['Waiting – Sublet', (wr ? PG.first(wr) : 'The writer') + ' gets them to send out'], ['Waiting – Approval', (wr ? PG.first(wr) : 'The writer') + ' gets them to send the estimate'], ['Waiting – Tech Support', 'Waiting on a Volvo case'], ['Waiting – Foreman', (fm ? PG.first(fm) : 'The foreman') + ' gets them']].map(z => `<button class="tg-mi cx-mi" data-a="tsdo" data-v="hold" data-st="${z[0]}"><b>${z[0]}</b><span class="meta">${esc(z[1])}</span></button>`).join('')}</div>`; }
    if(p.type === 'tsm'){ const T = (r.ro.operations || []).filter(op => op && op.id && op.id !== TU.selPOp && !op.declined);
      return `<div class="tg-pop menu mg-pop-w"><div class="tg-ph"><b>Move ${P.length} part${P.length === 1 ? '' : 's'} to</b></div>${T.map(op => `<button class="tg-mi cx-mi" data-a="tsdo" data-v="move" data-to="${op.id}"><span class="tg-no">Op ${tcOpN(r, op)}</span><b>${esc(op.complaint || '')}</b></button>`).join('') || '<div class="mg-none" style="padding:8px 10px">No other operation on this RO.</div>'}</div>`; }
    if(p.type === 'tsa'){ const to = p.who === 'parts' ? PG.person('Parts') : PG.person('Foreman'), toF = to ? PG.first(to) : p.who === 'parts' ? 'Parts' : 'the foreman';
      const what = P.length ? P.map(z => (z.description || z.partNumber) + (z.partNumber ? ' (' + z.partNumber + ')' : '')).join(', ') : opsTxt;
      return `<div class="tg-pop xf mg-pop-w"><div class="tg-ph"><b>Ask ${esc(toF)}</b><span class="cu">about ${esc(what)}</span>${x}</div><textarea class="cx-ta" data-in="tsq" placeholder="${P.length ? 'Need more, wrong part, is it here yet…' : 'What do you need?'} One note, about all of them.">${esc(TU.dr.tsq || '')}</textarea><div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="tsdo" data-v="ask">${ic('send', 13)}Send to ${esc(toF)}</button></div></div>`; }
    if(p.type === 'tsd'){ let nPt = 0, nPu = 0, run = false; L.forEach(op => { nPt += (op.parts || []).length; STATE.punches.forEach(q => { if(q.opId === op.id){ nPu++; if(!q.stop) run = true; } }); });
      return `<div class="tg-pop xf mg-pop-w"><div class="tg-ph"><b>Delete ${esc(opsTxt)}?</b><span class="cu">${esc(r.no)}</span>${x}</div><p class="rl-delp" style="margin:6px 12px 8px">${esc(L.map(op => 'Op ' + tcOpN(r, op) + ' — ' + (op.complaint || 'Operation')).join('\n'))}</p><div class="tg-pft" style="margin:0 12px">${ic('info', 12)}${nPt || nPu ? (L.length === 1 ? 'Its ' : 'Their ') + nPt + ' part line' + (nPt === 1 ? '' : 's') + (nPu ? ' and ' + nPu + ' time punch' + (nPu === 1 ? '' : 'es') : '') + (nPt + nPu === 1 ? ' goes' : ' go') + ' too' : 'Nothing else goes with ' + (L.length === 1 ? 'it' : 'them')}${run ? ' — the clock running on one stops' : ''}. Undo brings them back.</div><div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm tch-danger" data-a="tsdo" data-v="del">${ic('trash', 13)}Delete ${L.length}</button></div></div>`; }
    if(p.type === 'tsn') return `<div class="tg-pop xf mg-pop-w"><div class="tg-ph"><b>A note on ${esc(opsTxt)}</b><span class="cu">each one gets it, with the time</span>${x}</div><label class="tch-box tch-in" style="margin:6px 12px 0">${ic('pencil', 13)}<input data-in="tsn" value="${esc(TU.dr.tsn || '')}" placeholder="What you found, what you did… Enter saves it"></label><div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="tsdo" data-v="note">Save on ${L.length}</button></div></div>`;
    if(p.type === 'tsc') return `<div class="tg-pop xf mg-pop-m"><div class="tg-ph"><b>Add a code to ${esc(opsTxt)}</b>${x}</div><label class="tch-box tch-in" style="margin:6px 12px 0">${ic('plus', 13)}<input data-in="tsc" value="${esc(TU.dr.tsc || '')}" placeholder="3226/2 or P0401 — Enter adds it"></label><div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="tsdo" data-v="code">Add to ${L.length}</button></div></div>`;
    return '';
  }
  const tcFocusIn = sel => setTimeout(() => { const i = document.querySelector('[data-pg="tech"] ' + sel); if(i){ i.focus(); try{ i.setSelectionRange(i.value.length, i.value.length); }catch(e){} } }, 30);
  function tcSelAct(t){
    const r = tcCur(), v = t.dataset.v; if(!r) return;
    const L = tcSelOps(r), M = L.map(op => opBy(op.id)).filter(Boolean), live = M.filter(o => stOf(o) !== 'done'), P = tcSelParts(r), pop = (type, extra) => { U.pop = Object.assign({ type }, extra || {}); PG.anchor(U, t); PG.keepScroll(render); };
    if(v === 'start'){ if(M.length === 1){ tcSelClear(); startOp(M[0]); } return; }
    if(v === 'hold') return pop('tsh');
    if(v === 'askp' || v === 'pask'){ pop('tsa', { who: 'parts' }); return tcFocusIn('[data-in="tsq"]'); }
    if(v === 'askf'){ pop('tsa', { who: 'foreman' }); return tcFocusIn('[data-in="tsq"]'); }
    if(v === 'note'){ pop('tsn'); return tcFocusIn('[data-in="tsn"]'); }
    if(v === 'code'){ pop('tsc'); return tcFocusIn('[data-in="tsc"]'); }
    if(v === 'pmove') return pop('tsm');
    if(v === 'del') return pop('tsd');
    if(v === 'done'){ const ok = [], no = [];
      live.forEach(o => { const g = opCompleteGaps(o.op); if(g.length) no.push('Op ' + o.opn + ': ' + g.map(z => z.t).join(', ')); else ok.push(o); });
      if(ok.length){ pushUndo('mark done'); commitNoteDrafts(); ok.forEach(o => { if(isRun(o)){ const rp = runningPunch(); if(rp){ rp.stop = nowIso(); rp.stopReason = 'Complete'; creditBurnt(rp); } } else o.op.jobStatus = { status: 'Complete', sub: null, setAt: nowIso(), hand: true }; }); scheduleSave(true); }
      tcSelClear(); render(); pushToast((ok.length ? ok.length + ' done' : 'None done') + (no.length ? ' · not yet — ' + no.join(' · ') : '') + '.', ok.length > 0); return; }
    if(v === 'print'){ tcPrint(r.no + ' job jacket', tcJacket(r, L)); return; }
    if(v === 'story'){ const live0 = raLive(r.ro), B = raStory(r.ro).split('\n\n'), txt = L.map(op => B[live0.indexOf(op)]).filter(Boolean).join('\n\n'); tcCopy((r.ro.roNumber || r.no) + ' · ' + r.cust + '\n\n' + txt, `Copied the story for ${L.length} operation${L.length === 1 ? '' : 's'} — paste it in ASIST or anywhere.`); return; }
    const op = getOp(r.id, TU.selPOp), o = opBy(TU.selPOp); if(!op) return;
    const setSt = (from, to, verb, why) => { const D = P.filter(p => from.indexOf(p.status || 'Not Ordered') > -1); if(!D.length) return;
      pushUndo('parts ' + verb); D.forEach(p => { p.status = to; p.statusChangedAt = nowIso(); if(to === 'Picked up') p.pickedBy = S.me; }); scheduleSave(true);
      if(o && (to === 'Picked up' || to === 'Returned')) note(PG.person('Parts'), 'fyi', o, `${PG.first(S.me)} ${to === 'Returned' ? 'is returning' : 'picked up'} ${D.length} part${D.length === 1 ? '' : 's'} for ${o.no}`, D.map(p => (p.description || p.partNumber) + (p.partNumber ? ' · ' + p.partNumber : '')).join('\n'));
      tcSelClear(); render(); pushToast(`${D.length} part${D.length === 1 ? '' : 's'} ${verb}${P.length > D.length ? ' · ' + (P.length - D.length) + ' skipped (' + why + ')' : ''}.`, true); };
    if(v === 'ppick') return setSt(['Staged'], 'Picked up', 'picked up', 'not staged');
    if(v === 'pinst') return setSt(['Picked up', 'Received', 'Staged'], 'Installed', 'installed', 'not in hand');
    if(v === 'pret') return setSt(['Not Ordered', 'Ordered', 'Backordered', 'Received', 'Staged', 'Picked up'], 'Returned', 'going back to Parts', 'installed or already returned');
    if(v === 'ppns'){ tcCopy(P.map(p => (p.partNumber || '—') + '\t' + (p.description || '') + '\t' + (p.qty || 1)).join('\n'), `Copied ${P.length} part number${P.length === 1 ? '' : 's'}.`); return; }
    if(v === 'plist'){ tcPrint(r.no + ' pick list', tcPickList(r, op, P)); return; }
  }
  function tcSelDo(t){
    const r = tcCur(), v = t.dataset.v; if(!r) return;
    const L = U.pop && U.pop.only ? (r.ro.operations || []).filter(op => op && op.id === U.pop.only) : tcSelOps(r), M = L.map(op => opBy(op.id)).filter(Boolean), live = M.filter(o => stOf(o) !== 'done'), P = tcSelParts(r), first = M[0] || opBy(TU.selPOp) || r.focus;
    const opsTxt = L.map(op => 'Op ' + tcOpN(r, op)).join(', ');
    if(v === 'del'){   /* Parsec 12.2: delete the picked operations, with their parts and time — Undo brings them back */
      const ids = L.map(op => op.id); if(!ids.length){ U.pop = null; render(); return; }
      pushUndo('delete ' + ids.length + ' operation' + (ids.length === 1 ? '' : 's')); try{ commitNoteDrafts(); }catch(e){}
      try{ audit('op-del', 'Deleted ' + opsTxt + ' on ' + roLabel(r.ro), r.ro); }catch(e){}
      STATE.punches = STATE.punches.filter(q => !(q.roId === r.id && ids.indexOf(q.opId) > -1));
      const arr = r.ro.operations || []; for(let i = arr.length - 1; i >= 0; i--) if(arr[i] && ids.indexOf(arr[i].id) > -1) arr.splice(i, 1);
      scheduleSave(true); U.pop = null; tcSelClear(); render(); pushToast(`${ids.length} operation${ids.length === 1 ? '' : 's'} deleted from ${r.no}.`, true); return; }
    if(v === 'hold'){ const st = t.dataset.st; if(!live.length) return;
      pushUndo('hold'); commitNoteDrafts(); live.forEach(o => { if(isRun(o)){ const rp = runningPunch(); if(rp){ rp.stop = nowIso(); rp.stopReason = st; creditBurnt(rp); } } else o.op.jobStatus = { status: st, sub: null, setAt: nowIso(), hand: true }; }); scheduleSave(true);
      const who = { 'Waiting – Parts': PG.person('Parts'), 'Waiting – Sublet': (function(){ try{ return rtPerson('writer'); }catch(e){ return ''; } })() || PG.person('Triage'), 'Waiting – Approval': (function(){ try{ return rtPerson('writer'); }catch(e){ return ''; } })() || PG.person('Triage'), 'Waiting – Foreman': PG.person('Foreman') }[st];
      if(who) note(who, st === 'Waiting – Foreman' ? 'ask' : 'fyi', live[0], `${live[0].no} — ${live.length} operation${live.length === 1 ? '' : 's'} waiting on you`, live.map(o => 'Op ' + o.opn + ' — ' + o.cmp).join('\n'));
      U.pop = null; tcSelClear(); render(); pushToast(`${live.length} on hold — ${st.toLowerCase()}.${who ? ' ' + PG.first(who) + ' has one note about them.' : ''}`, true); return; }
    if(v === 'ask'){ const to = U.pop && U.pop.who === 'parts' ? PG.person('Parts') : PG.person('Foreman'), txt = PG.inp('[data-in="tsq"]').trim(); if(!to){ pushToast('There’s no one in that role on the team yet.'); return; }
      const what = P.length ? P.map(z => (z.description || z.partNumber) + (z.partNumber ? ' · ' + z.partNumber : '') + ' · qty ' + (z.qty || 1)).join('\n') : L.map(op => 'Op ' + tcOpN(r, op) + ' — ' + (op.complaint || '')).join('\n');
      note(to, 'men', first, `${PG.first(S.me)} asked about ${P.length ? P.length + ' part' + (P.length === 1 ? '' : 's') : opsTxt} — ${r.no}`, what, txt);
      TU.dr.tsq = ''; U.pop = null; tcSelClear(); PG.keepScroll(render); pushToast(`Sent to ${PG.first(to)} — one note, under Messages on the RO.`); return; }
    if(v === 'note'){ const txt = String(TU.dr.tsn || PG.inp('[data-in="tsn"]') || '').trim(); if(!txt || !live.length) return;
      pushUndo('note on ' + live.length); live.forEach(o => addNote(o, txt)); scheduleSave(true); TU.dr.tsn = ''; U.pop = null; tcSelClear(); render(); pushToast(`Note saved on ${live.length} operation${live.length === 1 ? '' : 's'}.`, true); return; }
    if(v === 'code'){ const f = tcParseFc(TU.dr.tsc || PG.inp('[data-in="tsc"]')); if(!f){ pushToast('Type it as SPN/FMI — 3226/2 — or a P-code like P0401.'); return; } if(!live.length) return;
      const add = live.filter(o => !(o.op.faults || []).some(x => tcFc(x) === tcFc(f))); if(!add.length){ pushToast(`${tcFc(f)} is already on all of them.`); return; }
      pushUndo('fault code'); add.forEach(o => { o.op.faults = (o.op.faults || []).concat([Object.assign({ id: 'fc_' + uid() }, f)]); }); scheduleSave(true); TU.dr.tsc = ''; U.pop = null; tcSelClear(); render(); pushToast(`${tcFc(f)} added to ${add.length} operation${add.length === 1 ? '' : 's'}.`, true); return; }
    if(v === 'move'){ const from = getOp(r.id, TU.selPOp), to = getOp(r.id, t.dataset.to); if(!from || !to || !P.length) return;
      pushUndo('move parts'); const ids = P.map(p => p.id); to.parts = (to.parts || []).concat((from.parts || []).filter(p => ids.indexOf(p.id) > -1)); from.parts = (from.parts || []).filter(p => ids.indexOf(p.id) < 0); scheduleSave(true);
      U.pop = null; tcSelClear(); TU.open[to.id] = true; TU.tab[to.id] = 'parts'; render(); pushToast(`${P.length} part${P.length === 1 ? '' : 's'} moved to Op ${tcOpN(r, to)}.`, true); return; }
  }
  /* ---------- Parsec 12.5: the Yard — the shop floor and the parking lot, with your trucks lit up ----------
     The Triage yard map (the same one the Foreman's Yard view shows: bays with the trucks' top views, the check-in lanes,
     the lot rows), read-only here: your ROs in their list colors — working, assigned, waiting, done today — everyone
     else's dimmed. Point at a truck for its RO, customer, truck and status; click one of yours to open it. */
  const TYD_LANE = { run: 'Working', next: 'Assigned', wait: 'Waiting', done: 'Done today' };
  const TYD_CLS = { run: 'tyd-run', next: 'tyd-next', wait: 'tyd-wait', done: 'tyd-done' };
  function tcViewSet(v){ TU.view = v === 'yard' ? 'yard' : v === 'ros' && typeof rlEmbed === 'function' ? 'ros' : 'list'; try{ localStorage.setItem('parsec.tcView', TU.view); }catch(e){} }
  function tcYdTitle(ro, r){
    let tl = ''; try{ tl = truckLine(ro) || trkLabel(ro); }catch(e){ try{ tl = trkLabel(ro); }catch(er){} }
    const sp = tgSpotOf(ro), st = (() => { try{ return tgStTxt(ro); }catch(e){ return ''; } })();
    return ['RO ' + tgNum(ro), ro.customerName || '', tl && tl !== 'this truck' ? tl : '', st, (sp ? tgZone(sp) + ' ' + tgSpotLbl(sp) : ro.location || ''),
      r ? (S.view ? PG.first(S.me) + '’s · ' : 'Yours · ') + TYD_LANE[r.lane] : (ro.assignedTech ? PG.first(ro.assignedTech) + '’s' : 'No tech yet')].filter(Boolean).join(' · ');
  }
  function tcYard(all){
    const mine = {}; all.forEach(r => { mine[r.id] = r; });
    const runO = S.rp && !S.shop ? opBy(S.rp.opId) : null, here = runO ? runO.roId : null;
    const keep = { f: UI.tgFilter, c: UI.tgClash, p: UI.yardPick };
    let h = '';
    UI.tgFilter = null; UI.tgClash = null; UI.yardPick = null;
    try{ h = tgVYard(null); }catch(e){ console.error(e); h = ''; } finally { UI.tgFilter = keep.f; UI.tgClash = keep.c; UI.yardPick = keep.p; }
    if(!h) return '<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">' + ic('pin', 22) + '</span><h3>No yard set up</h3><p>The yard map comes from the Triage page’s yard.</p></div></div>';
    /* only the shop floor, check-in and the lot: the warranty / released row goes, and the legend is this page's */
    const w0 = h.indexOf('<div class="tg-row2"><section class="tg-z" style="flex:1"><div class="tg-zh">Warranty');
    const lg = h.lastIndexOf('<div class="tg-leg">');
    if(w0 > -1){ let w1 = h.indexOf('<section class="tg-z"><div class="tg-zh">Elsewhere', w0); if(w1 < 0) w1 = lg; if(w1 > w0) h = h.slice(0, w0) + h.slice(w1); }
    /* the tiles: no dragging, no Triage actions; yours in your colors, the rest dimmed */
    h = h.replace(/ draggable="true" data-tg-drag="[^"]*"/g, '').replace(/ data-tg-drop="[^"]*"/g, '');
    h = h.replace(/<(div|button) class="tg-s ([^"]*)"([^>]*)>/g, (m, tag, cls, at) => {
      const id = (/ data-ro="([^"]+)"/.exec(at) || [])[1];
      cls = cls.replace(/\b(dim|tg-on)\b/g, '').replace(/\s+/g, ' ').trim();
      if(!id){ if(/\bclash\b/.test(cls)){ const t = (/ title="([^"]*)"/.exec(at) || [])[1] || ''; return '<' + tag + ' class="tg-s ' + cls + ' tyd-ot"' + (tag === 'button' ? ' type="button" tabindex="-1"' : '') + ' title="' + t + '">'; } return m; }
      const ro = getRO(id); if(!ro) return m;
      const r = mine[id], c2 = r ? 'tyd-me ' + TYD_CLS[r.lane] : 'tyd-ot';
      return '<' + tag + ' class="tg-s ' + cls + ' ' + c2 + (id === here ? ' tyd-here' : '') + (TU.ydSel === id ? ' tyd-sel' : '') + '" role="button" tabindex="0" data-a="tyd" data-ro="' + esc(id) + '" title="' + esc(tcYdTitle(ro, r)) + '"' + (r ? ' aria-label="Open ' + esc('RO ' + tgNum(ro)) + '"' : '') + '>' + (id === here ? '<span class="tyd-you">' + (S.view ? esc(PG.first(S.me)) : 'You') + '</span>' : '');
    });
    h = h.replace(/<span class="tg-elsi" data-action="tg-sel" data-ro="([^"]+)"/g, (m, id) => '<span class="tg-elsi' + (mine[id] ? ' tyd-me ' + TYD_CLS[mine[id].lane] : ' tyd-ot') + '" role="button" tabindex="0" data-a="tyd" data-ro="' + id + '"');
    h = h.replace(/ data-action="tg-sel"/g, '').replace(/ data-action="tg-clash"/g, '');
    h = h.replace('class="tg-yd', 'class="tg-yd tch-yd').replace('data-scroll="tg-yard"', 'data-scroll="tch-yard"');
    const leg = '<div class="tg-leg"><span><i class="tyd-lg tyd-run"></i>Working</span><span><i class="tyd-lg tyd-next"></i>Assigned</span><span><i class="tyd-lg tyd-wait"></i>Waiting</span><span><i class="tyd-lg tyd-done"></i>Done today</span><span><i class="tyd-lg tyd-ot"></i>Someone else’s</span><span><i class="tg-live"></i>On the clock</span><span class="hint">Click one of ' + (S.view ? 'theirs' : 'yours') + ' to open it · ' + kbd('Y') + ' back to the list</span></div>';
    const l2 = h.lastIndexOf('<div class="tg-leg">'); if(l2 > -1) h = h.slice(0, l2) + leg + '</div>';
    /* above the map: your trucks, where they are; Bring it in for one of yours on the lot */
    const L = all.filter(r => r.lane !== 'done');
    const chip = r => { const sp = tgSpotOf(r.ro), where = sp ? tgSpotLbl(sp) : (r.ro.location || 'No spot'), bring = r.lane === 'next' && !S.view && !!sp && !bayLike(sp) && !r.ro.cxBring;   /* on the yard (lot, check-in) and not in a bay */
      return '<span class="tyd-mc ' + TYD_CLS[r.lane] + '"><button type="button" data-a="tyd" data-ro="' + esc(r.id) + '" title="' + esc(tcYdTitle(r.ro, r)) + '"><i></i><b class="tg-no">' + esc(r.no) + '</b><span class="cu">' + esc(String(r.cust || '').split(' ')[0]) + '</span><small>' + ic('pin', 11) + esc(where) + '</small></button>'
        + (bring ? '<button type="button" class="btn btn-sm tyd-bring" data-a="tdo" data-v="bring" data-id="' + esc(r.focus.id) + '" title="Ask Triage to bring it to a bay">' + ic('triage', 13) + 'Bring it in</button>' : r.ro.cxBring && sp && !bayLike(sp) ? '<span class="tyd-asked">' + ic('check', 11) + 'asked to bring in</span>' : '') + '</span>'; };
    const now = runO ? '<span class="tyd-now"><i class="tg-live"></i>' + (S.view ? esc(PG.first(S.me)) + ' is' : 'You’re') + ' in <b>' + esc(tgSpotOf(runO.ro) ? tgSpotLbl(tgSpotOf(runO.ro)) : (runO.spot || 'no spot')) + '</b> on <span class="tg-no">' + esc(runO.no) + '</span></span>' : '';
    const mine0 = '<div class="tyd-mine"><span class="k">' + (S.view ? esc(PG.first(S.me)) + '’s trucks' : 'Your trucks') + '</span>' + now + (L.length ? L.map(chip).join('') : '<span class="tg-none">Nothing assigned to ' + (S.view ? esc(PG.first(S.me)) : 'you') + ' on the yard.</span>') + '</div>';
    /* tap someone else's truck: what it is, here (a phone has no hover) */
    const so = TU.ydSel && !mine[TU.ydSel] ? getRO(TU.ydSel) : null;
    const bar = so ? '<div class="tg-ybar tyd-bar">' + tgSq(tyCat(so)) + '<b class="tg-no">' + esc(roLabel(so)) + '</b><h3>' + esc(so.customerName || '') + '</h3><span class="at">' + ic('pin', 14) + esc(tgZone(tgSpotOf(so))) + ' <b class="tg-no">' + esc(tgSpotLbl(tgSpotOf(so)) || so.location || '—') + '</b></span><span class="stt">' + esc(tgStTxt(so)) + '</span><span class="tyd-bt">' + esc((() => { try{ const t = truckLine(so) || trkLabel(so); return t === 'this truck' ? '' : t; }catch(e){ return ''; } })()) + '</span><span class="sp"></span><span class="tyd-who">' + (so.assignedTech ? PG.av(so.assignedTech) + esc(PG.first(so.assignedTech)) + '’s' : 'No tech yet') + '</span><button class="btn btn-sm ib" data-a="tydx" aria-label="Close">' + ic('x', 14) + '</button></div>' : '';
    const i0 = h.indexOf('>', h.indexOf('class="tg-yd')) + 1;
    return h.slice(0, i0) + mine0 + bar + h.slice(i0);
  }
  function tcPane(r){
    if(r && r.del) return tcDonePane(r);   /* Parsec 14.7: a deleted RO you completed — its record */
    if(!r) return `<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('tech', 22)}</span><h3>No repair orders yet</h3><p>${esc(PG.person('Foreman') ? PG.first(PG.person('Foreman')) + '’s' : 'The foreman’s')} order for today shows here.</p></div></div>`;
    const o = r.focus, s = stOf(o), fm = PG.person('Foreman'), fmF = fm ? PG.first(fm) : 'the foreman';
    const lastStop = !S.rp && !S.view ? STATE.punches.filter(p => p.stop && techSame(p.by, S.me) && r.ops.some(x => x.id === p.opId)).reduce((m, p) => Math.max(m, +new Date(p.stop)), 0) : 0;   /* Parsec 14.3: after a stop on the mounted RO page too */
    const nextUp = (U.justDone && r.ops.some(x => x.id === U.justDone)) || (lastStop && Date.now() - lastStop < 15 * 60000) ? (() => { const n = nextOps()[0]; return n ? `<div class="cx-nextup">${ic('spark', 14)}<span>Next${n.paused ? ' — paused' : ' in ' + (fm ? fmF + '’s' : 'the foreman’s') + ' order'}: <span class="tg-no">${esc(n.no)}</span> <b>${esc(n.cmp)}</b> · ${h1(n.q)} h</span><button class="btn btn-sm btn-primary" data-a="startid" data-id="${n.id}">${ic('play', 13)}Start it</button></div>` : ''; })() : '';
    const why = o.why && s === 'next' ? `<div class="cx-why">${ic('info', 13)}<span>${esc(o.why)}</span></div>` : '';
    const top = `${S.view ? '' : nudge()}${nextUp}${why}`;   /* Parsec 14.3: the Technician-only cards, above the RO page */
    return `<div class="mg-pane tch-pane tch-jcp" data-ro="${r.id}">${top ? `<div class="tch-top">${top}</div>` : ''}<div class="ro-detail-pane jc-pane tch-jc" data-jc="${r.id}"></div></div>`;
  }
  /* Parsec 11.3: the admin opens the Technician page too — for any technician: everyone on the Team as a technician, and anyone an open RO is assigned to */
  const TAS_KEY = 'tec_tech_as';
  const tcOpenRo = ro => !ro.shop && ro.id !== SHOP_RO_ID && !roIsDone(ro);
  function tcTechs(){
    const seen = {}, L = [], add = n => { n = String(n || '').trim(); const k = n.toLowerCase(); if(!n || seen[k]) return; seen[k] = 1; L.push(n); };
    staffList().filter(x => x.role === 'Technician').forEach(x => add(x.name));
    STATE.ros.forEach(ro => { if(tcOpenRo(ro)) add(ro.assignedTech); });
    return L.map(n => ({ n, ros: STATE.ros.filter(ro => tcOpenRo(ro) && techSame(ro.assignedTech, n)).length, run: STATE.punches.some(p => !p.stop && techSame(punchWho(p), n)) }));
  }
  function tcAs(){
    const T = tcTechs(); if(!T.length) return null;
    let n = TU.as; if(!n){ try{ n = localStorage.getItem(TAS_KEY) || ''; }catch(e){} }
    const hit = T.find(t => techSame(t.n, n)) || T.find(t => t.run) || T.slice().sort((a, b) => b.ros - a.ros)[0];
    TU.as = hit.n; return hit.n;
  }
  function tcAsPop(){
    const T = tcTechs();
    return `<div class="tg-pop menu mg-pop-w tch-asp"><div class="tg-ph"><b>Whose page</b><span class="cu">${T.length} technician${T.length === 1 ? '' : 's'}</span></div>${T.map(t => `<button class="tg-mi cx-mi${techSame(t.n, S.me) ? ' on' : ''}" data-a="tas" data-n="${esc(t.n)}">${PG.av(t.n)}<span class="tch-asn"><b>${esc(t.n)}</b><small>${t.run ? '<i class="cx-dot"></i>on the clock · ' : ''}${t.ros} open RO${t.ros === 1 ? '' : 's'}</small></span></button>`).join('')}</div>`;
  }
  function tcPop(){
    const p = U.pop; if(p && p.type === 'tas' && S.view) return tcAsPop();
    if(!p || p.type !== 'tfix') return ''; const o = opBy(U.sel); if(!o || !o.fix) return '';
    return `<div class="tg-pop xf mg-pop-w tch-fixp"><div class="tg-ph"><b>A past fix matches</b><span class="cu">${esc(o.fix.t)}</span><button class="btn btn-sm ib" data-a="popx">${ic('x', 14)}</button></div><ul>${o.fix.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ul><small>Fixed ${o.fix.n}× before${o.fix.by && o.fix.by !== '—' ? ' · last by ' + esc(o.fix.by) : ''}${o.fix.at ? ' · ' + esc(o.fix.at) : ''}${o.fix.avg ? ' · about ' + h1(o.fix.avg) + ' h' : ''}</small><div class="tg-acts"><button class="btn btn-sm" data-a="tdo" data-v="viewfix" data-id="${o.id}">View on Fixes</button><button class="btn btn-sm btn-primary" data-a="tdo" data-v="usefix" data-id="${o.id}">${ic('check', 13)}Use fix — put it in my notes</button></div></div>`;
  }
  function tcLb(){ const L = TU.lb; if(!L) return '';
    return `<div class="tch-lb" role="dialog" aria-label="${esc(L.name)}"><div class="tch-lbh"><b>${esc(L.name)}</b><span class="sp"></span><a class="btn btn-sm" href="${L.url}" download="${esc(L.name)}">${ic('download', 13)}Save a copy</a><button class="btn btn-sm ib" data-a="tlbx" aria-label="Close">${ic('x', 15)}</button></div><div class="tch-lbb">${/^image\//.test(L.type) ? `<img src="${L.url}" alt="">` : /pdf/.test(L.type) ? `<iframe src="${L.url}" title="${esc(L.name)}"></iframe>` : `<p>${esc(L.name)} — save a copy to open it.</p>`}</div></div>`; }
  function tcViews(){ return `<div class="tg-views tch-views" role="tablist">${[['list', 'list', S.view ? 'Their ROs' : 'My ROs'], ['yard', 'pin', 'Yard']].concat(typeof rlEmbed === 'function' ? [['ros', 'ros', 'ROs']] : []).map(x => `<button role="tab" aria-selected="${TU.view === x[0]}" class="${TU.view === x[0] ? 'on' : ''}" data-a="tvw" data-v="${x[0]}" title="${x[2]} (Y switches)">${ic(x[1], 14)}${x[2]}</button>`).join('')}</div>`; }
  function tcHead(){
    const D = dayStats(), n = nChk(), M = S.M, w = M.name;
    const f = `<span class="tg-hf" style="cursor:default">${PG.av(w)}${esc(w)}</span><i>·</i>${S.morning ? `<span class="tg-hf" style="cursor:default"><span class="cx-dot off"></span>Not clocked in yet</span>` : S.out ? `<span class="tg-hf" style="cursor:default"><span class="cx-dot off"></span>Clocked out${S.out.at ? ' · ' + esc(String(S.out.why).toLowerCase()) + ' since ' + clk(S.out.at) : ''}</span>` : `<span class="tg-hf" style="cursor:default"><span class="cx-dot"></span><b data-tk="cl">${dur(D.cl)}</b>on the clock</span>`}${S.morning ? '' : `<i>·</i><span class="tg-hf" style="cursor:default"><b>${D.eff == null ? '—' : Math.round(D.eff) + '%'}</b>efficiency today</span>`}${n ? `<i>·</i><button class="tg-hf w${U.pop && U.pop.type === 'chk' ? ' on' : ''}" data-a="pop" data-p="chk"><b>${n}</b>to fix in the Time Log</button>` : ''}`;
    const find = S.morning || TU.view === 'yard' ? '' : psmBtn('tech', 'Search my repair orders');   /* Parsec 13.1 — the icon opens the search window */
    const scan = S.morning || S.out ? '' : `<button class="btn btn-sm${U.pop && U.pop.type === 'scan' ? ' on' : ''}" data-a="pop" data-p="scan" style="height:30px" title="Scan a job jacket to switch">${ic('qr', 14)}Scan</button>`;
    const ck = S.morning ? `<button class="btn btn-sm btn-primary" data-a="morning" style="height:30px">${ic('play', 14)}Start my day</button>` : S.out ? `<button class="btn btn-sm btn-primary" data-a="cin" style="height:30px">${ic('play', 14)}Clock in</button>` : `<button class="btn btn-sm${U.pop && U.pop.type === 'out' ? ' on' : ''}" data-a="pop" data-p="out" style="height:30px">${ic('clock', 14)}Clock out${ic('chevD', 13)}</button>`;
    if(S.view){
      const fv = `<button class="tg-hf tch-as${U.pop && U.pop.type === 'tas' ? ' on' : ''}" data-a="pop" data-p="tas" title="Pick whose page to see" aria-haspopup="menu">${PG.av(w)}<b>${esc(w)}</b>${ic('chevD', 12)}</button><i>·</i><span class="tg-hf" style="cursor:default"><span class="cx-dot${S.rp ? '' : ' off'}"></span>${S.rp ? (S.shop ? 'On shop time' : 'On the clock') : 'Not on a job'}</span><i>·</i><span class="tg-hf" style="cursor:default"><b>${D.eff == null ? '—' : Math.round(D.eff) + '%'}</b>efficiency today</span>`;
      return `<header class="tg-head"><h1 class="tg-h1">Technician</h1><span class="tg-facts">${fv}</span>${tcViews()}${find}<span class="tch-vw" title="You’re signed in as the admin. Notes, messages, holds and parts work here; starting and stopping the clock stays with ${esc(w)}.">${ic('eye', 13)}Admin view</span></header>`;
    }
    return `<header class="tg-head"><h1 class="tg-h1">Technician</h1><span class="tg-facts">${f}</span>${S.morning ? '' : tcViews()}${find}${scan}${ck}</header>`;
  }
  function viewTech(){
    const M0 = PG.me(), adm = M0.admin && !M0.tech, as = adm ? tcAs() : null;
    const me0 = adm ? 'as:' + (as || '') : M0.name; if(U._me !== me0){ U._me = me0; U.view = 'today'; U.sel = null; U.pop = null; U.eod = false; U.tv = false; TU.ro = null; TU.open = {}; TU.q = ''; }
    build(as);
    if(S.lead) return `<div class="tg mg cr cx tch" data-pg="tech"><header class="tg-head"><h1 class="tg-h1">Technician</h1></header><div class="tg-body"><div class="tg-main"><div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('tech', 22)}</span>${adm ? '<h3>No technicians yet</h3><p>Add technicians on the Team page, or assign one on an RO — their page shows here.</p>' : '<h3>For technicians</h3><p>This page shows a technician’s own repair orders. Sign in as a technician to see theirs.</p>'}</div></div></div></div></div>`;
    const all = tcRos(), G = tcGroups(all), L = G.flatMap(g => g[1]);
    if(!TU.ro || (!all.some(r => r.id === TU.ro) && !tcDoneR(TU.ro))){ const run = all.find(r => r.lane === 'run'); TU.ro = (run || L[0] || all[0] || {}).id || null; }
    const r = all.find(x => x.id === TU.ro) || tcDoneR(TU.ro) || null;   /* Parsec 14.7 */
    if(r && r.focus && r.focus.id){ const fk = r.id + '|' + (S.rp ? S.rp.opId : ''); if(TU._fk !== fk){ TU._fk = fk; try{ (UI.roOp || (UI.roOp = {}))[r.id] = r.focus.id; }catch(e){} } }   /* the RO page opens on the operation that's up */
    TCX = r && !r.del ? { ro: r.id, crumb: S.view ? PG.first(S.me) + '’s ROs' : 'My ROs', list: L.map(x => x.id).filter((id, i, a) => a.indexOf(id) === i), own: S.ops.reduce((m, o) => { m[o.id] = 1; return m; }, {}), view: !!S.view, me: S.me, first: PG.first(S.me), fm: PG.person('Foreman'),
      go: id => { TU.ro = id; U.justDone = null; PG.keepScroll(render); }, back: () => { try{ if(typeof pmClose === 'function' && typeof pmOn === 'function' && pmOn()) pmClose(); else { const it = document.querySelector('[data-pg="tech"] .tch-list .tg-it.on'); if(it) it.scrollIntoView({ block: 'nearest' }); } }catch(e){} } } : null;   /* Parsec 14.3: the RO page reads it */
    /* Console's handlers work on U.sel — it follows the RO's operation that's up now, unless you picked another one in it */
    if(r && (U.selRo !== r.id || !U.pop || !r.ops.some(o => o.id === U.sel))){ U.selRo = r.id; U.sel = r.focus.id; }
    const body = S.morning ? `<div class="tg-main">${morningCard()}</div>` : TU.view === 'yard' ? `<div class="tg-main tch-ydm">${tcYard(all)}</div>` : TU.view === 'ros' && typeof rlEmbed === 'function' ? `<div class="tg-main tch-rosm">${rlEmbed('tech')}</div>` : tcList(G, all) + `<div class="tg-main">${tcPane(r)}</div>`;
    return `<div class="tg mg cr cx tch${S.view ? ' tch-view' : ''}" data-pg="tech">${tcHead()}<div class="tg-body">${body}${pop()}${tcPop()}${tcSelPop()}${tcOpPop()}${U.eod ? eodSheet() : ''}</div>${filePick()}${tcLb()}</div>`;
  }
  /* ---------- doing things on the Technician page: Console's handlers, aimed at the operation you clicked ---------- */
  const tcSelOp = id => { if(id && opBy(id)){ U.sel = id; const o = opBy(id); U.selRo = o.roId; } };
  const HT = {
    tcdsel: t => { const id = t.dataset.id; if(TU.ro !== id) tcSelClear(); TU.ro = id; TU.kb = false; U.pop = null; U.selRo = null; PG.keepScroll(render); const p = document.querySelector('[data-pg="tech"] .mq-pane'); if(p) p.scrollTop = 0; },   /* Parsec 14.7 */
    tcdall: () => { TCD.all = !TCD.all; PG.keepScroll(render); },
    tas: t => { const n = t.dataset.n; if(!n) return; TU.as = n; try{ localStorage.setItem(TAS_KEY, n); }catch(e){} U.pop = null; tcSelClear(); render(); },
    tsel: t => { if(TU.ro !== t.dataset.id) tcSelClear(); TU.ro = t.dataset.id; TU.kb = false; U.pop = null; U.selRo = null; PG.keepScroll(render); const p = document.querySelector('[data-pg="tech"] .mq-pane'); if(p) p.scrollTop = 0; },
    topen: (t, ev) => { if(ev && (ev.ctrlKey || ev.metaKey || ev.shiftKey)){ tcToggle('o', t.dataset.id, ev); return; } const id = t.dataset.id, r = tcRos().find(x => x.id === TU.ro), cur = TU.open[id] !== undefined ? TU.open[id] : !!(r && r.focus.id === id); TU.open[id] = !cur; PG.keepScroll(render); },
    tall: t => { const r = tcRos().find(x => x.id === TU.ro); if(!r) return; const v = t.dataset.v === '1'; (r.ro.operations || []).forEach(op => { if(op && op.id) TU.open[op.id] = v; }); PG.keepScroll(render); },
    tdo: (t, ev) => { tcSelOp(t.dataset.id); const f = H[t.dataset.v]; if(f) f(t, ev); },
    /* Parsec 12.5: List / Yard; a truck of yours on the yard opens its RO, someone else's says what it is */
    tvw: t => { tcViewSet(t.dataset.v); TU.ydSel = null; U.pop = null; render(); },
    tyd: t => { const id = t.dataset.ro; if(!id) return; const r = tcRos().find(x => x.id === id);
      if(!r){ TU.ydSel = TU.ydSel === id ? null : id; PG.keepScroll(render); return; }
      tcViewSet('list'); TU.ydSel = null; if(TU.ro !== id) tcSelClear(); TU.ro = id; TU.kb = false; U.pop = null; U.selRo = null;
      try{ if(typeof pmOn === 'function' && pmOn() && typeof PM !== 'undefined'){ PM.y = 0; PM.pend = true; } }catch(e){}
      render(); const p = document.querySelector('[data-pg="tech"] .mq-pane'); if(p) p.scrollTop = 0; },
    tydx: () => { TU.ydSel = null; PG.keepScroll(render); },
    tpick: t => { const o = opBy(t.dataset.id), p = o && o.parts.find(x => x.id === t.dataset.pt); if(!p) return; PG.act('picked up', `Picked up — ${p.description || p.partNumber}.`, () => { p.status = 'Picked up'; p.statusChangedAt = nowIso(); p.pickedBy = S.me; }); note(PG.person('Parts'), 'fyi', o, `${PG.first(S.me)} picked up the parts for ${o.no}`, `${p.description || p.partNumber}${p.partNumber ? ' · ' + p.partNumber : ''}`); },
    ttruck: t => { const ro = getRO(t.dataset.id); if(ro && typeof trkDlgOpen === 'function') trkDlgOpen(ro, t); },
    tck: (t, ev) => tcToggle(t.dataset.k, t.dataset.id, ev, t.dataset.op),
    tprow: (t, ev) => { if(ev && (ev.ctrlKey || ev.metaKey || ev.shiftKey)) tcToggle('p', t.dataset.pt, ev, t.dataset.id); },
    tckall: t => { const r = tcCur(); if(!r) return;
      if(t.dataset.k === 'o'){ const ids = tcLive(r).map(o => o.id), all = ids.every(i => TU.selO[i]); tcSelClear(); if(!all) ids.forEach(i => TU.selO[i] = 1); }
      else { const op = getOp(r.id, t.dataset.id), ids = op ? opRealParts(op).map(p => p.id) : [], all = TU.selPOp === t.dataset.id && ids.every(i => TU.selP[i]); tcSelClear(); if(!all && ids.length){ TU.selPOp = t.dataset.id; ids.forEach(i => TU.selP[i] = 1); } }
      U.pop = null; PG.keepScroll(render); },
    tsclear: () => { tcSelClear(); U.pop = null; PG.keepScroll(render); },
    tsact: t => tcSelAct(t),
    tsdo: t => tcSelDo(t),
    tgrp: t => { const k = t.dataset.k; TU.shut[k] = !TU.shut[k]; PG.keepScroll(render); },
    ttab: t => { TU.tab[t.dataset.id] = t.dataset.v; TU.open[t.dataset.id] = true; PG.keepScroll(render); },
    tactall: () => { TU.actAll = !TU.actAll; PG.keepScroll(render); },
    tmsgall: () => { TU.msgAll = !TU.msgAll; PG.keepScroll(render); },
    tmsgto: t => { TU.msgTo = t.dataset.n; PG.keepScroll(render); const i = document.querySelector('[data-pg="tech"] [data-in="tmsg"]'); if(i) i.focus(); },
    tnudge: t => { const o = opBy(t.dataset.id), n = t.dataset.n; if(!o || !n) return; note(n, 'men', o, `${PG.first(S.me)} asked about ${o.no}`, `${o.cust} · Op ${o.opn} — ${o.cmp}`, 'Any news on this one?'); pushToast(`Nudged ${PG.first(n)} — it’s under Messages on ${o.no}.`); PG.keepScroll(render); },
    tappr: t => { const o = opBy(t.dataset.id), n = t.dataset.n; if(!o || !n) return; note(n, 'men', o, `${PG.first(S.me)} asked about the approval on ${o.no}`, `${o.cust} — the estimate isn’t approved yet`, 'Any word from the customer?'); pushToast(`Asked ${PG.first(n)} about the approval.`); PG.keepScroll(render); },
    tfcx: t => { const o = opBy(t.dataset.id); if(!o) return; const f = (o.op.faults || []).find(x => x.id === t.dataset.f); if(!f) return; PG.act('fault code', `${tcFc(f)} removed from Op ${o.opn}.`, () => { o.op.faults = o.op.faults.filter(x => x.id !== f.id); }); },
    tfile: t => { const o = opBy(t.dataset.id), f = document.querySelector('[data-pg="tech"] .cx-file'); if(!o || !f) return; f.dataset.task = 'opfile'; f.dataset.ro = o.roId; f.dataset.op = o.id; f.value = '';
      if(t.dataset.cam){ f.accept = 'image/*'; f.setAttribute('capture', 'environment'); } else { f.accept = 'image/*,video/*,.pdf,application/pdf'; f.removeAttribute('capture'); }
      f.click(); setTimeout(() => f.removeAttribute('capture'), 0); },
    tfopen: t => { const ro = getRO(t.dataset.ro), id = t.dataset.f; let f = null; (ro && ro.bulletins || []).forEach(e => (e.files || []).forEach(x => { if(x.id === id) f = x; }));
      if(!f || typeof JC === 'undefined' || !JC.blobOf){ pushToast('That file isn’t on this computer.'); return; }
      Promise.resolve(JC.blobOf(f, ro.id)).then(b => { if(!b){ pushToast('That file isn’t on this computer or in the shop folder.'); return; } if(TU.lb) URL.revokeObjectURL(TU.lb.url); TU.lb = { url: URL.createObjectURL(b), name: f.name || 'File', type: b.type || f.type || '' }; PG.keepScroll(render); }, () => pushToast('Couldn’t open that file.')); },
    tlbx: () => { if(TU.lb) URL.revokeObjectURL(TU.lb.url); TU.lb = null; PG.keepScroll(render); },
    tnotes: t => { const ro = getRO(t.dataset.id); if(ro && typeof trkInspOpen === 'function') trkInspOpen(ro); },
    /* Parsec 12.3 */
    trstp: t => { const id = t.dataset.ro; if(U.pop && U.pop.type === 'trst' && U.pop.ro === id){ U.pop = null; PG.keepScroll(render); return; } U.pop = { type: 'trst', ro: id }; PG.anchor(U, t); PG.keepScroll(render); },
    trsts: t => { const ro = getRO(t.dataset.ro), v = t.dataset.v; U.pop = null; if(!ro || roStatus(ro).status === v){ PG.keepScroll(render); return; }
      if(setRoStatus(ro.id, v, null) !== false){ scheduleSave(true); pushToast(`${tgNum(ro)} set to ${roStShown(ro)}.`, true); } PG.keepScroll(render); },
    /* Parsec 14: the road test toggle; what was sent to you */
    trtt: t => { const ro = getRO(t.dataset.ro); if(!ro) return; const on = !rtNeeded(ro); if(rtToggle(ro, on)) pushToast(on ? `${tgNum(ro)} needs a road test again — Road test and Truck checks are back.` : `No road test for ${tgNum(ro)} — no truck checks either. When the work is done it’s ready to release.`, true); PG.keepScroll(render); },
    tsent: t => { const k = t.dataset.k, id = t.dataset.ro; sentSeen(k); if(id && tcRos().some(x => x.id === id)){ if(TU.ro !== id) tcSelClear(); TU.ro = id; TU.kb = false; U.pop = null; tcViewSet('list'); PG.keepScroll(render); const p = document.querySelector('[data-pg="tech"] .mq-pane'); if(p) p.scrollTop = 0; } else if(id && getRO(id)) PG.openRo(id); else PG.keepScroll(render); },
    tasset: t => { const ro = getRO(t.dataset.ro); if(ro && typeof asOpenFor === 'function') asOpenFor(ro); },
    tsentx: t => { if(sentDone(t.dataset.k)) pushToast('Done — off your Sent to you list.', true); PG.keepScroll(render); },
    tjtp: t => { const id = t.dataset.id; if(U.pop && U.pop.type === 'tjt' && U.pop.id === id){ U.pop = null; PG.keepScroll(render); return; } U.pop = { type: 'tjt', id }; PG.anchor(U, t); PG.keepScroll(render); },
    tjts: t => { const r = tcCur(), op = tcRawOp(t.dataset.id), v = t.dataset.v; U.pop = null; if(!op || opJobType(op) === v){ PG.keepScroll(render); return; }
      PG.act('job type', `Op ${tcOpN(r, op)} is ${tcJl(v)} now.`, () => { op.jobType = v; }); },
    tomp: t => { const id = t.dataset.id; if(U.pop && U.pop.type === 'tom' && U.pop.id === id){ U.pop = null; PG.keepScroll(render); return; } U.pop = { type: 'tom', id }; PG.anchor(U, t); PG.keepScroll(render); },
    tomx: t => { const r = tcCur(), op = tcRawOp(t.dataset.id), v = t.dataset.v, prev = U.pop || {}; if(!r || !op) return;
      const at = { ax: prev.ax, ay: prev.ay, aw: prev.aw, at: prev.at }; U.pop = null;
      if(v === 'print'){ PG.keepScroll(render); tcPrint(r.no + ' job jacket', tcJacket(r, [op])); return; }
      if(v === 'story'){ let txt = ''; try{ const live0 = raLive(r.ro), B = raStory(r.ro).split('\n\n'); txt = B[live0.indexOf(op)] || ''; }catch(e){} PG.keepScroll(render); tcCopy((r.ro.roNumber || r.no) + ' · ' + r.cust + '\n\n' + txt, `Copied the story for Op ${tcOpN(r, op)} — paste it in ASIST or anywhere.`); return; }
      if(v === 'ask'){ tcSelOp(op.id); U.pop = Object.assign({ type: 'part' }, at); PG.keepScroll(render); return; }
      if(v === 'del'){ U.pop = Object.assign({ type: 'tsd', only: op.id }, at); PG.keepScroll(render); return; } },
    ttm: t => { const p = tcP(t.dataset.p); if(!p || !tcCanEdP(p)) return; TU.edT = { p: p.id, f: t.dataset.f, v0: t.dataset.f === 'e' && !p.stop ? tcHM(Date.now()) : '' }; TU.why = null; U.pop = null; PG.keepScroll(render);
      setTimeout(() => { const i = document.querySelector('[data-pg="tech"] [data-in="ttime"]'); if(i) i.focus(); }, 0); },
    trsp: t => { const p = tcP(t.dataset.p); if(!p || !tcCanEdP(p)) return; if(U.pop && U.pop.type === 'trs' && U.pop.p === p.id && U.pop.f === t.dataset.f){ U.pop = null; PG.keepScroll(render); return; }
      U.pop = { type: 'trs', p: p.id, f: t.dataset.f }; PG.anchor(U, t); PG.keepScroll(render); },
    trss: t => { const p = tcP(t.dataset.p), f = t.dataset.f, v = t.dataset.v; U.pop = null; if(!p){ PG.keepScroll(render); return; }
      const ok = updatePunchReasons(p.id, f === 's' ? v : p.startReason, f === 'e' ? v : p.stopReason);
      if(ok) pushToast(`${f === 's' ? 'Started for' : 'Stopped because'} — ${v}.`, true); else PG.keepScroll(render); },
    /* Parsec 12.7: move the running clock; stop it at the time it really stopped, once you say why */
    tmvp: t => { const p = tcP(t.dataset.p); if(!p || p.stop || !tcCanEdP(p)) return; if(U.pop && U.pop.type === 'tmv' && U.pop.p === p.id){ U.pop = null; PG.keepScroll(render); return; }
      U.pop = { type: 'tmv', p: p.id }; PG.anchor(U, t); PG.keepScroll(render); },
    tmvs: t => { const p = tcP(t.dataset.p); U.pop = null; if(!p){ PG.keepScroll(render); return; } const r = rcMove(p, t.dataset.ro, t.dataset.op);
      if(!r.ok){ pushToast(r.msg); return; } pushToast(`The running clock moved to ${r.label} — it still started ${clk(p.start)}.`, true); },
    tstopw: t => { const p = tcP(t.dataset.p), w = TU.why; TU.why = null; if(!p || !w || w.p !== p.id){ PG.keepScroll(render); return; } const r = rcStopAt(p, w.ts, t.dataset.v);
      if(!r.ok){ pushToast(r.msg); return; } pushToast(`Stopped at ${clk(w.ts)} · ${r.gaps ? r.reason + ' — not complete yet: ' + r.gapText : r.reason} — ${dur((w.ts - new Date(p.start).getTime()) / 60000)} on that punch.`, true); },
    tstopx: () => { TU.why = null; PG.keepScroll(render); },
    tdel: t => { const p = tcP(t.dataset.p); if(!p || !p.stop || !tcCanEdP(p)) return; const d = dur((new Date(p.stop) - new Date(p.start)) / 60000); U.pop = null; TU.edT = null;
      if(deletePunch(p.id) === false) return; pushToast(`Punch deleted — ${d} of time.`, true); },
    tpn: t => { const p = tcP(t.dataset.p); if(!p || !tcCanEdP(p)) return; TU.pnote = p.id; PG.keepScroll(render); setTimeout(() => { const i = document.querySelector('[data-pg="tech"] [data-in="tpnote"]'); if(i) i.focus(); }, 0); },
    tnewp: t => { const o = tcRawOp(t.dataset.id), r = tcCur(); if(!o || !r) return; const a = t.dataset.a1 ? new Date(t.dataset.a1) : null, b = t.dataset.b1 ? new Date(t.dataset.b1) : null;
      let s0, e0;
      if(a && b && b > a && tcYMD(a) === tcYMD(b)){ s0 = a; e0 = b; } else if(a){ s0 = a; e0 = new Date(Math.min(a.getTime() + 3600000, new Date(a).setHours(23, 59, 0, 0))); }
      else { e0 = new Date(Math.round(Date.now() / 300000) * 300000); s0 = new Date(e0.getTime() - 3600000); }
      TU.newP = { op: o.id, ro: r.id, at: t.dataset.i, d: tcYMD(s0), s: tcHM(s0), e: tcHM(e0), sr: 'Repairing', er: 'Switched job' }; TU.open[o.id] = true; TU.tab[o.id] = 'time'; U.pop = null; PG.keepScroll(render);
      setTimeout(() => { const i = document.querySelector('[data-pg="tech"] [data-in="tnp"][data-k="s"]'); if(i) i.focus(); }, 0); },
    tnpx: () => { TU.newP = null; PG.keepScroll(render); },
    tnpok: () => { const N = TU.newP, r = tcCur(); if(!N || !r) return; const base = N.d + 'T12:00:00', s0 = tcAtHM(base, N.s), e0 = tcAtHM(base, N.e);
      if(!s0 || !e0){ pushToast('Pick a start and a stop time.'); return; }
      if(new Date(e0) <= new Date(s0)){ pushToast('Stop must be after start.'); return; }
      const res = addManualPunch({ roId: N.ro, opId: N.op, start: s0, stop: e0, startReason: N.sr, stopReason: N.er });
      if(!res || !res.ok){ pushToast((res && res.msg) || 'Couldn’t add that time.'); return; }
      const np = STATE.punches[STATE.punches.length - 1]; if(np && np.opId === N.op && S.me) np.by = S.me;
      const op = tcRawOp(N.op); TU.newP = null; scheduleSave(true);
      pushToast(`Time entry added — ${dur((new Date(e0) - new Date(s0)) / 60000)}${op ? ' on Op ' + tcOpN(r, op) : ''}.`, true); },
    tpaste: t => { const o = opBy(t.dataset.id); if(!o) return;
      const wait = () => { TU.pasteOp = o.id; pushToast(`Press Ctrl V to paste the screenshot onto Op ${o.opn}.`); };
      if(!navigator.clipboard || !navigator.clipboard.read){ wait(); return; }
      navigator.clipboard.read().then(items => Promise.all(items.map(it => { const tp = (it.types || []).find(x => /^image\//.test(x)); return tp ? it.getType(tp).then(bl => new File([bl], 'screenshot-' + Date.now() + '.' + (tp.split('/')[1] || 'png'), { type: tp })) : null; })))
        .then(L => { L = L.filter(Boolean); if(L.length) tcAddShots(o, L); else wait(); }, wait); }
  };
  /* a time being changed saves when you leave it; a note left empty closes */
  document.addEventListener('focusout', ev => { const t = ev.target; if(!t || !t.dataset) return;
    if(t.dataset.in === 'ttime' && TU.edT && TU.edT.p === t.dataset.p && TU.edT.f === t.dataset.f){ const v = t.value, pid = t.dataset.p, f = t.dataset.f; setTimeout(() => { if(TU.edT && TU.edT.p === pid && TU.edT.f === f) tcSaveTime(pid, f, v); }, 0); }
    if(t.dataset.in === 'tpnote' && TU.pnote === t.dataset.p && !String(t.value || '').trim()){ setTimeout(() => { if(TU.pnote){ TU.pnote = null; PG.keepScroll(render); } }, 150); }
  });
  /* Ctrl V pastes a screenshot onto the operation that asked for one (Paste a screenshot), or the one whose Files tab is open */
  document.addEventListener('paste', ev => { if(UI.view !== 'tech' || !S) return; const tg = ev.target; if(tg && /^(input|textarea)$/i.test(tg.tagName || '')) return;
    const fs = Array.prototype.slice.call((ev.clipboardData && ev.clipboardData.files) || []).filter(f => /^image\//.test(f.type || '')); if(!fs.length) return;
    let o = TU.pasteOp ? opBy(TU.pasteOp) : null;
    if(!o){ const r = tcCur(); if(r) o = r.ops.find(x => TU.tab[x.id] === 'files' && (TU.open[x.id] !== undefined ? TU.open[x.id] : x.id === r.focus.id)) || null; }
    if(!o) return; ev.preventDefault(); TU.pasteOp = null; tcAddShots(o, fs); });
  function tcInput(t){ if(t.dataset.in === 'tq'){ TU.q = t.value; PG.keepScroll(render); return true; } if(t.dataset.in === 'tnote'){ TU.dr[t.dataset.id] = t.value; return true; }
    if(t.dataset.in === 'tact' || t.dataset.in === 'tmsg' || t.dataset.in === 'tdtc'){ TU.dr[t.dataset.in.slice(1)] = t.value; return true; }
    if(t.dataset.in === 'tsq' || t.dataset.in === 'tsn' || t.dataset.in === 'tsc'){ TU.dr[t.dataset.in] = t.value; return true; }
    if(t.dataset.in === 'tnp'){ if(TU.newP) TU.newP[t.dataset.k] = t.value; return true; }
    if(t.dataset.in === 'ttime' || t.dataset.in === 'tpnote') return true;
    return false; }
  const tcRefocus = sel => { const i = document.querySelector('[data-pg="tech"] ' + sel); if(i){ i.value = ''; i.focus(); } };
  function tcField(t, ev){
    if(t.dataset.in === 'ttime'){ if(ev.key === 'Enter'){ ev.preventDefault(); tcSaveTime(t.dataset.p, t.dataset.f, t.value); return true; } if(ev.key === 'Escape'){ ev.preventDefault(); TU.edT = null; PG.keepScroll(render); return true; } return false; }
    if(t.dataset.in === 'tpnote'){ if(ev.key === 'Escape'){ ev.preventDefault(); TU.pnote = null; PG.keepScroll(render); return true; }
      if(ev.key === 'Enter' && t.value.trim()){ ev.preventDefault(); const p = tcP(t.dataset.p); TU.pnote = null; if(!p){ PG.keepScroll(render); return true; } const txt = autoPunct(t.value.trim());
        PG.act('punch note', 'Note added to the punch.', () => { p.notes = (String(p.notes || '').replace(/\s+$/, '') ? String(p.notes).replace(/\s+$/, '') + '\n' : '') + noteStampFor(p) + ' ' + txt; }); return true; } return false; }
    if(t.dataset.in === 'tnp'){ if(ev.key === 'Enter'){ ev.preventDefault(); if(TU.newP) TU.newP[t.dataset.k] = t.value; HT.tnpok(); return true; } if(ev.key === 'Escape'){ ev.preventDefault(); TU.newP = null; PG.keepScroll(render); return true; } return false; }
    if(t.dataset.in === 'tnote' && ev.key === 'Enter' && t.value.trim()){ ev.preventDefault(); const id = t.dataset.id, o = opBy(id); if(!o) return true; pushUndo('note'); addNote(o, t.value); TU.dr[id] = ''; scheduleSave(true); PG.keepScroll(render); const i = document.querySelector('[data-pg="tech"] [data-in="tnote"][data-id="' + id + '"]'); if(i){ i.value = ''; i.focus(); } return true; }
    if(t.dataset.in === 'tact' && ev.key === 'Enter' && t.value.trim()){ ev.preventDefault(); const o = opBy(U.sel); if(!o) return true; const txt = autoPunct(t.value.trim());
      PG.act('note', `Note saved on operation ${o.opn}.`, () => { o.op.offNotes = (Array.isArray(o.op.offNotes) ? o.op.offNotes : []).concat([{ id: 'on' + Date.now().toString(36), at: nowIso(), text: txt, by: punchByName() || S.me }]); }); TU.dr.act = ''; PG.keepScroll(render); tcRefocus('[data-in="tact"]'); return true; }
    if(t.dataset.in === 'tmsg' && ev.key === 'Enter' && t.value.trim()){ ev.preventDefault(); const o = opBy(U.sel), to = TU.msgTo; if(!o || !to) return true;
      note(to, 'men', o, `${PG.first(S.me)} wrote about ${o.no}`, `${o.cust} · Op ${o.opn} — ${o.cmp}`, t.value.trim()); TU.dr.msg = ''; pushToast(`Sent to ${PG.first(to)} — it’s under Messages on ${o.no}.`); PG.keepScroll(render); tcRefocus('[data-in="tmsg"]'); return true; }
    if(t.dataset.in === 'tdtc' && ev.key === 'Enter' && t.value.trim()){ ev.preventDefault(); const o = opBy(U.sel), f = tcParseFc(t.value); if(!o) return true;
      if(!f){ pushToast('Type it as SPN/FMI — 3226/2 — or a P-code like P0401.'); return true; }
      if((o.op.faults || []).some(x => tcFc(x) === tcFc(f))){ pushToast(`${tcFc(f)} is already on Op ${o.opn}.`); return true; }
      PG.act('fault code', `${tcFc(f)} added to Op ${o.opn}.`, () => { o.op.faults = (o.op.faults || []).concat([Object.assign({ id: 'fc_' + uid() }, f)]); }); TU.dr.dtc = ''; PG.keepScroll(render); tcRefocus('[data-in="tdtc"]'); return true; }
    if((t.dataset.in === 'tsn' || t.dataset.in === 'tsc') && ev.key === 'Enter' && t.value.trim()){ ev.preventDefault(); TU.dr[t.dataset.in] = t.value; tcSelDo({ dataset: { v: t.dataset.in === 'tsn' ? 'note' : 'code' } }); return true; }
    if(t.dataset.in === 'tsq' && ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); tcSelDo({ dataset: { v: 'ask' } }); return true; }
    if(t.dataset.in === 'tq' && (ev.key === 'Escape' || ev.key === 'Enter')){ ev.preventDefault(); if(ev.key === 'Escape'){ TU.q = ''; t.value = ''; PG.keepScroll(render); } t.blur(); return true; }
    return false;
  }
  function tcKeydown(ev){
    const k = ev.key; if(!S) return;
    const stop = () => { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); };
    if((ev.ctrlKey || ev.metaKey) && k === 'Enter' && !PG.typing(ev) && S.rp && !S.shop && !S.view){ H.done(); return stop(); }
    if(ev.ctrlKey || ev.metaKey || ev.altKey || PG.typing(ev)) return;
    if(TU.lb && k === 'Escape'){ HT.tlbx(); return stop(); }
    if(U.pop){ if(k === 'Escape'){ U.pop = null; camStop(); PG.keepScroll(render); return stop(); } return; }
    if(k === 'Escape' && TU.why){ TU.why = null; PG.keepScroll(render); return stop(); }
    if(k === 'Escape' && U.eod){ U.eod = false; PG.keepScroll(render); return stop(); }
    if(U.eod || S.morning || S.lead) return;
    if(k === 'y' || k === 'Y'){ tcViewSet(TU.view === 'yard' ? 'list' : 'yard'); TU.ydSel = null; render(); return stop(); }
    if(k === 'Escape' && TU.ydSel){ TU.ydSel = null; PG.keepScroll(render); return stop(); }
    if(k === '/'){ if(TU.view !== 'yard') psmOpen('tech'); return stop(); }
    if(TU.view === 'yard' && (k === 'j' || k === 'k' || k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter')) return;
    if(k === 'j' || k === 'k' || k === 'ArrowDown' || k === 'ArrowUp'){ const L = tcFlat(), i = L.findIndex(x => x.id === TU.ro); const n = L[Math.max(0, Math.min(L.length - 1, i + (k === 'j' || k === 'ArrowDown' ? 1 : -1)))]; if(n){ if(TU.ro !== n.id) tcSelClear(); TU.ro = n.id; TU.kb = true; U.selRo = null; PG.keepScroll(render); PG.kbScroll(); } return stop(); }
    const o = opBy(U.sel);
    if(S.view && (k === 'Enter' || k === 's' || k === 'h' || k === ' ')) return;
    if(k === 'Enter'){ if(o && !isRun(o) && o.st !== 'done' && !S.out){ startOp(o); return stop(); } }
    if(k === 's' && S.rp){ H.stop(); return stop(); }
    if(k === 'h' && S.rp && !S.shop){ U.sel = S.rp.opId; U.pop = { type: 'hold' }; PG.keepScroll(render); return stop(); }
    if(k === ' '){ if(S.rp){ H.stop(); return stop(); } if(o && o.st !== 'done' && !S.out){ startOp(o); return stop(); } }
  }
