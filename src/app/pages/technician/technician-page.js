/* Parsec · pages/technician · technician-page.js
   The Technician page (Parsec 11): the repair orders pane on the left (lanes, Completed since 14.7), the RO on the right (the RO page itself since 14.3).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   tcRos tcMatch tcGroups tcHit tcHeld tcAge tcItem tcSent tcList tcDoneRows tcDoneDay tcDoneItem … (22 functions, 23 constants)
   state      fmNote punches tcDone
   uses       access/ clock/ data/ kit/ pages/ pages/triage/ pages/warranty/ ro/ ro-page/ shell/ state/ trucks/
*/
  /* ============================== Technician page (Parsec 11) ==============================
     A technician's repair orders: Working, Assigned in the foreman's order, Waiting, and Done today — the list on
     the left, the RO on the right. Every operation opens to its notes, its time (each punch) and its parts.
     It replaces Console for technicians and runs on Console's own pieces: the same shop read out of STATE (build),
     the same punches, holds, asks, popovers, past fixes, photos and your day. */
  const TU = { ro: null, open: {}, q: '', dr: {}, kb: false, tab: {}, shut: {}, actAll: false, msgAll: false, msgTo: '', selO: {}, selP: {}, selPOp: null, lastSel: null, ydSel: null, view: (() => { try{ const v = localStorage.getItem('parsec.tcView'); return v === 'yard' || v === 'ros' ? v : 'list'; }catch(e){ return 'list'; } })() };
  TK.runh = () => { const o = S && S.rp && opBy(S.rp.opId); return o ? h1(burnt(o)) + ' / ' + h1(o.q) + ' h' : null; };
  
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
    const ord = r.lane === 'next' ? (o.paused ? `<span class="cq-n pz" title="Paused">${ic('pause', 10)}</span>` : o.ord ? `<span class="cq-n">${o.ord}</span>` : '<span></span>') : '';
    const sub = r.lane === 'wait' ? tcAge(r) + esc(o.hold.k + (o.hold.txt ? ' · ' + tcEta(o.hold.txt) : ''))
      : r.lane === 'done' ? 'Done at ' + esc(o.at) + (r.ops.length > 1 ? ' · ' + r.ops.length + ' operations' : '')
      : (o.back ? '<span class="ib-k auto">back</span>' : '') + esc(o.cmp) + (more > 0 ? ` <em>+${more}</em>` : '');
    const m = r.lane === 'run' ? `<b class="run" data-tk="runm"${v149eAttr(v149eTcTip(o))}>${dur(burnt(o) * 60)}</b>`
      : r.lane === 'done' ? `<b>${r.eff == null ? '—' : r.eff + '%'}</b>`
      : r.lane === 'wait' ? `<b class="wt"${v149eAttr(v149eTcTip(o))}>${esc(o.hold.k)}</b>`
      : o.paused ? `<b>${dur(o.b0 * 60)}</b>` : `<b>${h1(r.q)} h</b>`;
    const sm = r.lane === 'next' && o.paused ? 'paused ' + o.paused : r.lane === 'wait' ? (o.hold.left || '') : r.lane === 'done' ? h1(sum(r.ops.filter(x => x.st === 'done'), x => x.q)) + ' h sold' : (o.ro.cxBring && !bayLike(o.spot) ? 'coming in' : (o.spot || 'no spot') + (o.ro && v149KeyTxt(o.ro) ? ' · ' + v149KeyTxt(o.ro) : ''));
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
    const empty = n ? (shown ? '' : `<div class="cq-empty">${ic('search', 18)}<b>Nothing matches “${esc(TU.q)}”</b><small>Search finds the RO, customer, truck, year, unit or complaint.</small></div>`)
      : `<div class="cq-empty">${ic('tech', 18)}<b>No repair orders yet</b><small>${esc(PG.person('Foreman') ? PG.first(PG.person('Foreman')) : 'The foreman')} assigns work on the Foreman page — it shows here.</small></div>`;
    return `<section class="tg-list tch-list"><div class="tg-lh">${S.view ? esc(PG.first(S.me)) + '’s repair orders' : 'My repair orders'}<span class="n">${n}</span></div><div class="tg-scroll">${fn ? `<div class="cq-why cq-fmn" style="margin:8px 12px 4px">${ic('chat', 13)}<span><b>From ${esc(PG.first(fn.by || PG.person('Foreman') || 'the foreman'))}:</b> ${esc(fn.text)}</span><button class="btn btn-sm ib tg-gh" data-a="notex" title="Hide for today" style="margin-left:auto;flex:none">${ic('x', 13)}</button></div>` : ''}${tcSent()}${G.map(([g, L, k]) => `<div class="tg-grp tch-grp ${k}">${pgSt('ro', tcLaneSt[k] || 'Hold Tech', { iconOnly: 1, size: 12, cls: 'tch-gi' })}${esc(g)}<span>${L.length || ''}</span></div>` + (k === 'run' && !L.length ? runEmpty() : L.map(tcItem).join(''))).join('')}${tcDoneSec()}${empty}</div>
     ${S.view ? '' : `<div class="cq-shop"><span>${ic('gear2', 13)}Shop</span>${SH.map(op => { const on = S.rp && S.rp.opId === op.id; const nm = op.complaint.replace(/^Shop /, ''); return `<button class="${on ? 'on' : ''}" data-a="shopt" data-id="${op.id}"${S.out ? ' disabled' : ''} title="${esc(op.complaint)}">${on ? `<i></i>${esc(nm)} <b data-tk="shop">${TK.shop()}</b>` : esc(nm)}</button>`; }).join('')}</div>`}
     <div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span>${S.view ? '' : `<span>${kbd('↵')}start</span><span>${kbd('S')}stop</span><span>${kbd('Ctrl')}${kbd('↵')}done</span>`}<span>${kbd('/')}search</span><span>${kbd('Y')}yard</span></div></section>`;
  }
  /* ---------- Parsec 14.7: Completed — the ROs you finished work on. A record kept per person (v147c.js), so an RO stays
     here after it's transferred to someone else or deleted. The last 30 days; Show all for the rest. ---------- */
  const TCD = { all: false };
  function tcDoneRows(){ try{ v147Scan(); }catch(e){}
    const L = (Array.isArray(STATE.tcDone) ? STATE.tcDone : []).filter(e => e && techSame(e.tech, S.me)), by = {};
    L.forEach(e => { const ro = getRO(e.roId), op = ro ? (ro.operations || []).find(o => o.id === e.opId) : null; if(op && !opDoneNow(op)) return;   /* reopened: it's back in the lists above */
      e = v160DoneView(e, ro, op);   /* Parsec 16: number, customer, truck, unit, complaint from the live RO */
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
    return `<div class="mq-pane tch-pane tch-cdel"><section class="tch-cdc"><div class="tch-cdh"><span class="tch-gonepic lg">${ic('trash', 18)}</span><span><b><span class="tg-no">${esc(s.no)}</span>${esc(s.cust || '—')}</b><small>This RO was deleted — kept here as your record of the work</small></span></div>
      <dl class="tch-cdl">${row('Truck', s.truck)}${row('Unit', s.unit && s.unit !== '—' ? s.unit : '')}${row('Completed', PG.day(s.at) + ' · ' + clk(s.at))}${row('Your time', h1(s.hrs) + ' h')}</dl>
      <div class="tch-cdo">${s.ops.map(o => `<div><span class="n">Op ${o.opn}</span><span class="c">${esc(o.cmp)}</span><span class="v">${h1(o.hrs)} / ${h1(o.q)} h</span></div>`).join('')}</div>
      <p class="tch-cdn">Read-only. The RO’s own page, its notes and its photos went with it.</p></section></div>`; }
  /* ---------- the RO on the right — the layout picked on the RO page mock-up (Parsec 11.1) ----------
     In the middle: Operations, Parts on this RO, Activity & notes, Fault codes, Photos & codes, Messages about this RO,
     Truck history, Warranty claim, Customer, Estimate & approval, Ready to close. At the right: Truck & status, Stage bar,
     Who has it, People, Schedule, Vehicle, Money. An open operation keeps its tabs; its notes sit in the Time tab, each one
     inside the punch it was written in, between the start and the stop. */
  
  
  const tcFc = f => f.code || 'SPN ' + f.spn + ' · FMI ' + f.fmi;
  
  function tcParseFc(s){ const d = /^\s*([PCUB])\s*-?\s*(\d{4,6})\s*$/i.exec(String(s || '')); if(d) return { code: d[1].toUpperCase() + d[2] };
    const m = /^\s*(?:SPN\s*)?(\d{1,6})\s*(?:\/|-|:|,|\s|FMI)\s*(?:FMI\s*)?(\d{1,2})\s*$/i.exec(String(s || '')); if(!m) return null; const spn = +m[1], fmi = +m[2]; return fmi > 31 ? null : { spn, fmi }; }
  
  
  function tcLive(r){ return (r.ro.operations || []).map((op, i) => r.ops.find(x => x.id === op.id) || (op && op.id ? tcOther(r.ro, op, i) : null)).filter(Boolean); }
  /* Truck & status: the truck, who it is, where it stands, and what you can do now */
  /* Parsec 12.9: the RO's own status, and its menu — a completed RO can be set back to open from here */
  
  
  /* an operation's status as the Technician page has it: [status, the words after it] */
  const tcLaneSt = { run: 'Working', next: 'Hold Tech', wait: 'Waiting – Parts', done: 'Complete' };
  /* Who has it: the person it waits on, how long, and when to follow up (Parsec 10's blocker aging) */
  /* ---------- the operations: a row each; open one for its clock and its tabs ---------- */
  function tcOther(ro, op, i){
    const st0 = opStatus(op), stn = typeof st0 === 'string' ? st0 : st0.status;
    return { id: op.id, roId: ro.id, ro, op, opn: i + 1, no: tgNum(ro), cust: ro.customerName || '—', t: opJobType(op), cmp: op.complaint || 'Operation', q: +op.quoted || 0, b0: opCalc(op).burntHrs, st: 'other', stn: op.declined ? 'Declined' : stn, parts: opRealParts(op), notes: notesOf(op), other: true };
  }
  
  /* ---------- Parsec 12.3: the RO page picks, on the Technician page's RO ----------
     the Time tab in the clock reasons' colors with edits in place, icons with their names on hover, the status and ⋯ in the operation header,
     the job type as a dropdown, each tab's actions at the right of the tabs */
  
  
  
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
