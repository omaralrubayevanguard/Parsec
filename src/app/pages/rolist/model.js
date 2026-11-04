/* Parsec · pages/rolist · model.js
   The RO list's model: one RO as the list draws it (info, spot, next step), rows and counts.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   reset info spotTxt nextStep rows counts esc ic kbd R0 $ U … (6 functions, 24 constants)
   state      punches ros savedAt
   uses       access/ clock/ data/ kit/ pages/ pages/triage/ pages/warranty/ ro/ state/ trucks/
*/
  const esc = PG.e, ic = PG.ic, kbd = PG.kbd;
  const R0 = () => document.querySelector('[data-pg="rolist"]') || document;
  const $ = s => R0().querySelector(s);
  let U = null, DIRTY = false, EMB = null;   /* Parsec 14.3: EMB = the page the list is drawn inside (Triage, Foreman, Parts, Manager, Technician) */
  function reset(){ U = { view: 'list', groupBy: 'status', sort: 'days', sel: {}, cur: null, closed: {}, pop: null, peek: true, print: false, cs: null, cfEdit: null, cfNew: '' }; }
  reset();
  const STG = ['checkin', 'diag', 'approval', 'parts', 'repair', 'roadtest', 'closeout'];
  const STGN = { checkin: 'Check-in', diag: 'Diag', approval: 'Approval', parts: 'Parts', repair: 'Repair', roadtest: 'Road test', closeout: 'Close-out' };
  const STK = { 'Hold Tech': 'hold', 'Working': 'working', 'Waiting – Parts': 'parts', 'Waiting – Sublet': 'sublet', 'Waiting – Foreman': 'foreman', 'Waiting – Tech Support': 'support', 'Waiting – Customer': 'customer', 'Waiting – Approval': 'approval', 'Waiting – New Job': 'newjob', 'Complete': 'complete', 'Complete – Road test': 'roadtest', 'Complete – Released': 'released', 'Declined': 'declined' };
  const GORDER = ['working', 'roadtest', 'complete', 'parts', 'sublet', 'customer', 'approval', 'support', 'foreman', 'newjob', 'hold', 'released', 'declined'];
  /* Parsec 14: one status look on every page — pgSt (b9/st14.js): icon + word to read, an outlined pill with ▾ to change */
  const KST = { working: 'Working', roadtest: 'Complete – Road test', complete: 'Complete', parts: 'Waiting – Parts', sublet: 'Waiting – Sublet', customer: 'Waiting – Customer', approval: 'Waiting – Approval', support: 'Waiting – Tech Support', foreman: 'Waiting – Foreman', newjob: 'Waiting – New Job', hold: 'Hold Tech', released: 'Complete – Released', declined: 'Declined' };
  const st = (s, o) => typeof pgSt === 'function' ? pgSt('ro', s, o) : esc(s);
  
  const subOf = r => !r.sub ? '' : '· ' + (typeof PGST_PART !== 'undefined' && PGST_PART[pgStKey('part', r.sub)] ? pgStLabel('part', r.sub) : r.sub);   /* "Not Ordered" reads "Not ordered", as on the Parts page */
  const canSt = () => { try{ return typeof can !== 'function' || can('ro.status'); }catch(e){ return true; } };
  const rtOn = ro => { try{ return typeof rtNeeded !== 'function' || rtNeeded(ro); }catch(e){ return true; } };
     /* the app's own action — kept out of the class renaming */
  const fstN = n => String(n || '').split(' ')[0];
  const DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hm = d => d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  /* ---------- one RO, as the list draws it ---------- */
  function info(ro){
    const s = roStatus(ro), k = STK[s.status] || (/^Complete/.test(s.status) ? 'complete' : /^Waiting/.test(s.status) ? 'foreman' : 'hold'), done = roIsDone(ro), noRt = !rtOn(ro);
    let f = null; try{ f = roForecast(ro); }catch(e){}
    let M = null; try{ M = roStages(ro, f); }catch(e){}
    const ops = (ro.operations || []).filter(o => o && o.id && !o.declined);
    let b = 0, q = 0; ops.forEach(o => { q += +o.quoted || 0; try{ b += opCalc(o).burntHrs || 0; }catch(e){} });
    const live = STATE.punches.some(p => !p.stop && p.roId === ro.id);
    const T = M ? M.list.filter(x => !(noRt && x.k === 'roadtest')).map(x => x.state === 'd' ? 'done' : x.state === 'x' ? 'skip' : x.state === 'w' ? 'wait' : (x.state === 'n' || x.state === 'c') ? 'now' : '') : STG.map(() => '');
    let stage = M && M.cur ? M.cur.name : (done ? 'Close-out' : 'Check-in'); if(noRt && stage === 'Road test') stage = 'Close-out';
    let ready = '—', readyT = '9';
    if(done){ const at = ro.dateClosed || (ro.status && ro.status.setAt); if(at){ const d = new Date(at); ready = 'Released ' + DAYN[d.getDay()]; readyT = '0' + at; } }
    else if(f && f.likely){ const d = f.likely, t0 = new Date(); t0.setHours(0, 0, 0, 0); const dd0 = Math.round((new Date(d).setHours(0, 0, 0, 0) - t0) / 86400000); ready = (dd0 <= 0 ? 'Today' : dd0 === 1 ? 'Tomorrow' : dd0 < 7 ? DAYN[d.getDay()] : PG.day ? PG.day(localDay(d.toISOString())) : localDay(d.toISOString())) + ' ' + hm(d); readyT = d.toISOString(); }
    const warr = !!ro.warranty || ops.some(o => { const t = opJobType(o); return t === 'WARR' || t === 'RECALL'; });
    let tm = null; try{ tm = truckYM(ro); }catch(e){}
    return { ro, id: ro.id, no: tgNum(ro), cust: ro.customerName || '—', unit: ro.unitNumber || '', veh: (tm && tm.line) || [ro.year, ro.make, ro.model].filter(Boolean).join(' ') || '—',
      st: s.status, sub: s.sub || '', k, grp: roGroupOf(ro), done, tech: ro.assignedTech || '', spot: spotTxt(ro),
      days: daysOpen(ro), b, q, ops, cmp: ops[0] ? String(ops[0].complaint || '').trim() : '', live, T, stage, M, f, ready, readyT, warr, nx: nextStep(ro, s.status, ops, live), si: ['checkin', 'diag', 'approval', 'parts', 'repair', 'roadtest', 'closeout'].indexOf(Object.keys(STGN).find(x => STGN[x] === stage) || '') };
  }
  /* Parsec 14: the spot the way Triage and Foreman write it (F3, B2, UP), from the same field */
  function spotTxt(ro){ let s = null; try{ s = spotOf(ro.location); }catch(e){} if(s){ try{ return tgSpotLbl(s); }catch(e){ return s; } } return ro.location || '—'; }
  /* Parsec 13.1: the next step — what has to happen next, and who has it.
     Parsec 14: approval comes before ordering (an operation the customer hasn't approved isn't Parts' to order yet),
     an approved operation with no tech says so, and an RO that needs no road test goes straight to release. */
  function nextStep(ro, st, live, running){
    const who = k => { try{ return k === 'tech' ? (ro.assignedTech || '') : (rtPerson(k) || ''); }catch(e){ return ''; } };
    const N = (t, w, tone) => ({ t, w: w || '', tone: tone || 'info' });
    const warrOp = o => ['WARR', 'RECALL'].indexOf(opJobType(o)) > -1;
    const needAppr = o => !o.appr && +o.quoted > 0 && !warrOp(o);   /* the same rule the Parts page uses */
    const parts = []; live.forEach(o => { try{ opRealParts(o).forEach(p => parts.push({ o, p })); }catch(e){} });
    const nm = x => String(x.p.description || x.p.partNumber || 'part').replace(/\s+-\s+.*$/, '');
    if(!live.length) return N('Add the first operation', who('writer'), 'hold');
    if(st === 'Complete – Released') return N('Nothing left — released', '', 'good');
    if(st === 'Declined') return N('Declined — nothing to do', '', 'hold');
    if(st === 'Complete – Road test') return N('Release the truck', who('writer'), 'good');
    if(running){ const p = STATE.punches.filter(x => !x.stop && x.roId === ro.id)[0], op = p && live.find(o => o.id === p.opId); return N('Working' + (op ? ' · Op ' + raN(ro, op) + ' — ' + String(op.complaint || '').replace(/\s+-\s+.*$/, '') : ''), (p && (p.by || ro.assignedTech)) || who('tech'), 'run'); }
    if(st === 'Waiting – Sublet'){ let ag = 0; try{ ag = ageSince(ro.status && ro.status.setAt); }catch(e){} return N('Out at the sublet' + (ag ? ' · ' + ageText(ag) : ''), who('writer'), 'warn'); }   /* Parsec 14.6 */
    if(st === 'Waiting – Customer'){ let ag = 0; try{ ag = ageSince(ro.status && ro.status.setAt); }catch(e){} return N('Customer approval' + (ag ? ' · ' + ageText(ag) : ''), who('writer'), ag > 86400000 ? 'bad' : 'teal'); }
    const open = live.filter(o => !opDoneNow(o)), unap = open.filter(needAppr), okOps = open.filter(o => !needAppr(o));
    if(unap.length && st !== 'Working') return N(unap.length === open.length ? 'Send the estimate' : 'Send the estimate · ' + unap.length + ' of ' + open.length + ' ops', who('writer'), 'teal');
    const bo = parts.filter(x => x.p.status === 'Backordered');
    if(bo.length) return N('Chase the backorder · ' + nm(bo[0]) + (bo[0].p.eta ? ' (ETA ' + bo[0].p.eta + ')' : ''), who('parts'), 'bad');
    const no = parts.filter(x => (!x.p.status || x.p.status === 'Not Ordered') && !needAppr(x.o) && !opDoneNow(x.o));
    if(no.length) return N(no.length === 1 ? 'Order the ' + nm(no[0]).toLowerCase() : 'Order ' + no.length + ' parts', who('parts'), 'warn');
    if(okOps.length && !ro.assignedTech) return N('Assign a tech', who('foreman'), 'warn');
    const out = parts.filter(x => x.p.status === 'Ordered');
    if(out.length && live.every(o => opDoneNow(o) || opRealParts(o).some(p => p.status === 'Ordered'))){ const eta = out.map(x => x.p.eta).filter(Boolean).sort()[0]; return N(eta ? 'Parts due ' + eta : 'Waiting on ' + (out.length === 1 ? 'a part' : out.length + ' parts'), who('parts'), 'warn'); }
    const gap = live.filter(o => { const c = raCcc(o); return opDoneNow(o) && (!c.ca || !c.co); })[0];
    if(gap) return N('Write the story · Op ' + raN(ro, gap), who('tech'), 'warn');
    if(live.every(opDoneNow)){ const pass = ro.roadTest && ro.roadTest.result === 'Pass'; return !rtOn(ro) || pass ? N('Release the truck', who('writer'), 'good') : N('Road test', who('foreman'), 'good'); }
    const nx = open[0];
    return N('Op ' + raN(ro, nx) + ' — ' + String(nx.complaint || 'operation').replace(/\s+-\s+.*$/, ''), who('tech'), 'info');
  }
  let CACHE = null;
  function rows(){
    const key = [STATE.savedAt || '', STATE.ros.length, STATE.punches.length, UI.rlGroup || 'all', UI.roFilter || '', U.sort, todayStr()].join('|');
    if(CACHE && CACHE.key === key) return CACHE.L;
    const L = rlList().map(info).sort((a, b) => U.sort === 'no' ? String(a.ro.roNumber || a.no).localeCompare(String(b.ro.roNumber || b.no), undefined, { numeric: true }) : U.sort === 'ready' ? (a.readyT < b.readyT ? -1 : a.readyT > b.readyT ? 1 : 0) : (b.days || 0) - (a.days || 0));
    CACHE = { key, L }; return L;
  }
  function counts(){
    const me = rlMe(), c = { all: 0, mine: 0, working: 0, waiting: 0, hold: 0, done: 0, live: 0 };
    STATE.ros.forEach(ro => { if(ro.id === SHOP_RO_ID || ro.shop || !roMatchesFilter(ro, UI.roFilter)) return; const g = roGroupOf(ro); c[g]++;
      if(g !== 'done'){ c.all++; if(me && techSame(ro.assignedTech, me)) c.mine++; if(STATE.punches.some(p => !p.stop && p.roId === ro.id)) c.live++; } });
    return c;
  }
  /* ---------- drawing ---------- */
  const ticks = r => `<span class="rq-ticks" title="${esc(r.stage)}">${r.T.map(t => `<i class="${t}"></i>`).join('')}</span>`;
  const mini = (b, q) => `<span class="rq-mini"><i${b > q ? ' class="over"' : ''} style="width:${q ? Math.min(100, b / q * 100) : (b ? 100 : 0)}%"></i></span>`;
  const av = n => n ? `<span class="tg-av" title="${esc(n)}"${v149eAvAttr(n)}>${esc(PG.ini(n))}</span>` : '<span class="tg-av" title="Unassigned">—</span>';
