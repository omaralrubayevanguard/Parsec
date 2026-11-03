/* Parsec · pages/technician · console-model.js
   The Console's model: your work read out of STATE for the person signed in — holds, notes, fixes, photos, the day's stats, the team.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   techOf holdOf notesOf fixOf photosOf mkOp dayOf checksOf teamOf boardOf build dayStats … (13 functions, 28 constants)
   state      cxChk goals punches ros
   uses       access/ automations/ clock/ data/ kit/ pages/ pages/fixes/ pages/triage/ pages/warranty/ ro/ state/
*/
  const ic = PG.ic, kbd = PG.kbd, esc = PG.e, h1 = PG.h1, dur = PG.dur, clk = PG.clk, clkM = PG.clkM, hms = PG.hms, hmH = PG.hmH;
  const sum = (L, f) => L.reduce((s, x) => s + f(x), 0);
  const TYPE = { DIAG: ['DIAG', 'dg'], OP: ['OP', 'op'], PM: ['PM', 'pm'], WARR: ['WARR', 'wa'], RECALL: ['RECALL', 'wa'], COMEBACK: ['COMEBACK', 'op'], SUBLET: ['SUBLET', 'op'] };
  const ty = o => TYPE[o.t] || TYPE.OP;
  const sev = l => l <= 0 ? 'ok' : l <= .5 ? 'low' : l <= 1.5 ? 'mid' : 'high';
  const GOAL0 = 7.5;
  const U = { view: null, sel: null, pop: null, kb: false, mine: true, hl: null, eod: false, tv: false, askk: 'Second opinion', partk: 'Need a part', draft: '', dict: false, eodc: {}, left: '', skipMorning: '' };
  let S = null;
  const opBy = id => S.ops.find(o => o.id === id);
  const isRun = o => !!(S.rp && S.rp.opId === o.id);
  const burnt = o => o.b0 + (isRun(o) ? (Date.now() - new Date(S.rp.start)) / 3600000 : 0);
  const stOf = o => isRun(o) ? 'run' : o.st;
  const srt = (a, b) => ((b.pm || 0) - (a.pm || 0)) || ((a.ord || 99) - (b.ord || 99)) || (a.ix - b.ix);
  const nextOps = () => S.ops.filter(x => x.st === 'next' && !isRun(x)).sort((a, b) => ((a.paused ? 0 : 1) - (b.paused ? 0 : 1)) || srt(a, b));
  
  const nChk = () => S.chk.length;
  
  const nowM = () => PG.mod(Date.now());
  const bayLike = sp => /^(Bay|UpTime|Awning)/i.test(sp || '');
  const goal = () => { const g = STATE.goals && S.me && STATE.goals[S.me] && +STATE.goals[S.me].dayHours; return g > 0 ? g : GOAL0; };

  /* ---------- the shop, read out of STATE for the person signed in ---------- */
  function techOf(ro){ return ro.assignedTech || ''; }
  function holdOf(ro, op, stn, sub){
    const fm = PG.person('Foreman'), pt = PG.person('Parts'), wr = PG.person('Service writer') || PG.person('Triage');
    const last = opPunches(op.id).filter(p => p.stop).slice(-1)[0], at = op.jobStatus && op.jobStatus.setAt || (last && last.stop) || (ro.status && ro.status.setAt);
    if(stn === 'Waiting – Parts'){
      const out = opRealParts(op).filter(p => !pxPartIn(p)), eta = out.map(p => p.eta).filter(Boolean).sort()[0];
      const bo = out.filter(p => p.status === 'Backordered').length;
      return { k: 'Parts', who: pt, at, txt: out.length ? out.map(p => (p.description || p.partNumber) + ' — ' + (p.status || 'not ordered').toLowerCase() + (p.eta ? ', ETA ' + p.eta : '')).join(' · ') : (sub || 'Waiting on parts.'), left: bo ? bo + ' backordered' : eta ? 'due ' + PG.day(eta + 'T12:00:00') : 'not ordered' };
    }
    if(stn === 'Waiting – Tech Support') return { k: 'Tech support', who: '', at, txt: ro.techSupportCase ? 'Case ' + ro.techSupportCase + (sub ? ' · ' + sub : '') : (sub || 'Waiting on tech support.'), left: at ? PG.ageW(Date.now() - new Date(at)) : '' };
    if(stn === 'Waiting – Foreman') return { k: 'Second opinion', who: fm, at, txt: (fm ? PG.first(fm) + ' has it' : 'The foreman has it') + (sub ? ' — ' + sub : '.'), left: at ? PG.ageW(Date.now() - new Date(at)) : '' };
    if(stn === 'Waiting – Customer' || stn === 'Waiting – Approval') return { k: 'Approval', who: wr, at, txt: (sub || 'Estimate sent — no answer yet.'), left: at ? PG.ageW(Date.now() - new Date(at)) : '' };
    return { k: stn.replace(/^Waiting – /, ''), who: '', at, txt: sub || '', left: at ? PG.ageW(Date.now() - new Date(at)) : '' };
  }
  function notesOf(op){
    const L = [];
    opPunches(op.id).forEach(p => {
      const st = new Date(p.start).getTime();
      noteEntries(p.notes).forEach(n => { let at = st; const m = /^(\d+):(\d{2})$/.exec(n.ran || ''); if(m) at = st + (+m[1] * 60 + +m[2]) * 60000; L.push([at, PG.isToday(at) ? clk(at) : PG.day(at) + ' ' + clk(at), n.text]); });
    });
    (op.log || []).forEach(l => L.push([new Date(l.at).getTime(), (l.kind === 'fix' ? 'Correction · ' : 'Cause · ') + (PG.isToday(l.at) ? clk(l.at) : PG.day(l.at)), l.text]));
    return L.sort((a, b) => a[0] - b[0]).map(x => [x[1], x[2]]);
  }
  function fixOf(op){
    if(!navAllowed('fixes') || !op.complaint) return null;
    const k = fixKeyOf(op.complaint); if(!k) return null;
    const m = fixMatchFor(op); if(!m.items.length || m.tier === 'other') return null; const items = m.items;   /* 18: the closest fixes — same codes and documents first */
    const top = fixTop(items, 'correction'), cause = fixTop(items, 'cause');
    const src = items.filter(x => String(x.correction || '').trim().toLowerCase() === String(top.v || '').trim().toLowerCase())[0] || items[0];
    const hrs = items.map(x => +x.hours || 0).filter(x => x > 0), avg = hrs.length ? sum(hrs, x => x) / hrs.length : 0;
    const steps = [cause.v ? 'Usual cause: ' + cause.v : '', top.v ? 'Usual fix: ' + top.v : ''].filter(Boolean);
    if(!steps.length) return null;
    return { t: items[0].complaint, by: src.tech || '—', at: src.date ? PG.day(src.date) : '', n: items.length, used: top.n, avg, steps, key: k };
  }
  function photosOf(ro){ const n = t => (ro.bulletins || []).filter(e => e.task === t).reduce((s, e) => s + (e.files || []).length, 0); return [n('dashpic'), n('pics'), n('dtc')]; }
  function mkOp(ro, op, ix, rp){
    const run = !!(rp && rp.opId === op.id), st0 = opStatus(op), stn = typeof st0 === 'string' ? st0 : st0.status, sub = typeof st0 === 'string' ? null : st0.sub;
    const ps = opPunches(op.id), last = ps.filter(p => p.stop).slice(-1)[0];
    let b0 = opCalc(op).burntHrs; if(run) b0 = Math.max(0, b0 - (Date.now() - new Date(rp.start)) / 3600000);
    const o = { id: op.id, roId: ro.id, ix: ix + (ro.fmQ || 50) * 100, opn: ix + 1, no: tgNum(ro), ro: ro, op: op, cust: ro.customerName || '—',
      truck: [ro.year, ro.model].filter(Boolean).join(' ') || ro.model || 'Truck', unit: ro.unitNumber || '—', spot: ro.location || '', t: opJobType(op), cmp: op.complaint || 'Operation',
      q: +op.quoted || 0, b0: b0, st: 'next', ord: ro.fmQ || 0, sr: run ? (rp.startReason || 'Working') : '', stn, sub };
    if(/^Complete/.test(stn) && !run){
      const doneP = ps.filter(p => p.stop && /^Complete/.test(p.stopReason || '')).slice(-1)[0], at = doneP ? doneP.stop : (op.jobStatus && op.jobStatus.setAt) || (last && last.stop);
      if(!at || !PG.isToday(at)) return null;
      o.st = 'done'; o.at = clk(at);
    } else if(!run && /^Waiting/.test(stn)){ o.st = 'wait'; o.hold = holdOf(ro, op, stn, sub); }
    else if(!run && roStatus(ro).status === 'Waiting – Customer' && !op.appr && +op.quoted > 0 && ['WARR', 'RECALL'].indexOf(o.t) < 0){ o.st = 'wait'; o.hold = holdOf(ro, op, 'Waiting – Customer', roStatus(ro).sub); }
    else if(!run && /^(Declined)/.test(stn)) return null;
    if(o.st === 'next' && last && b0 > 0.01 && !/^Complete/.test(last.stopReason || '')){ o.paused = clk(last.stop); o.pm = new Date(last.stop).getTime(); }
    if(o.st === 'next' && sub === 'Ready – parts in') o.back = true;
    const tags = [];
    if(op.appr && op.appr.at && PG.isToday(op.appr.at)) tags.push(['ok', 'Approved ' + clk(op.appr.at)]);
    const staged = opRealParts(op).filter(p => p.status === 'Staged');
    if(staged.length) tags.push(['pt', 'Parts staged']);
    if(ro.cxBring && !bayLike(ro.location)) tags.push(['in', 'Coming to a bay']);
    o.tags = tags;
    if(ro.route && ro.route.to === 'tech' && ro.route.note && techSame(ro.route.who, S.me)) o.why = (ro.route.by ? PG.first(ro.route.by) + ': ' : '') + ro.route.note;
    else if(op.appr && op.appr.at) o.why = 'Approved ' + (PG.isToday(op.appr.at) ? 'at ' + clk(op.appr.at) : PG.day(op.appr.at)) + (op.appr.by ? ' — ' + op.appr.by : '') + '.';
    else if(ro.dateOpened && PG.isToday(ro.dateOpened)) o.why = 'Checked in at ' + clk(ro.dateOpened) + (ro.location ? ' · ' + ro.location : '') + '.';
    o.parts = opRealParts(op);
    o.notes = notesOf(op);
    o.fix = o.st !== 'done' ? fixOf(op) : null;
    o.fixUsed = op.cxFix && op.cxFix.key;
    o.ph = photosOf(ro);
    return o;
  }
  function dayOf(me){
    const t = todayStr(), now = Date.now(), who = me || pcMe(), sh = shiftsForDate(t).filter(s => sameOwner(shiftOwner(s), who));   /* Parsec 12.7: your own day clock */
    const mine = p => !me || techSame(punchWho(p), me) || (!p.by && isShopPunch(p));
    const ps = punchesForDate(t).filter(mine);
    let cl = 0, job = 0, shop = 0, lunch = 0;
    sh.forEach((s, i) => { cl += (s.out ? new Date(s.out) : now) - new Date(s.in); if(i && sh[i - 1].out) lunch += new Date(s.in) - new Date(sh[i - 1].out); });
    ps.forEach(p => { const d = (p.stop ? new Date(p.stop) : now) - new Date(p.start); if(isShopPunch(p)) shop += d; else job += d; });
    return { sh, ps, cl: cl / 60000, job: job / 60000, shop: shop / 60000, lunch: lunch / 60000 };
  }
  function checksOf(me){
    const L = [], now = Date.now(), t = todayStr(), from = now - 14 * 86400000;
    const who = me || pcMe();
    shiftList().forEach(s => { if(!s.out && localDay(s.in) !== t && new Date(s.in) > from && sameOwner(shiftOwner(s), who)) L.push({ id: 'sh' + s.id, icn: 'clock', day: localDay(s.in), t: PG.day(s.in) + ' · no clock out', b: 'On the clock since ' + clk(s.in) + ' — set when you left.', btn: 'Fix in the Time Log' }); });
    const ps = STATE.punches.filter(p => p.stop && new Date(p.start) > from && (!me || techSame(punchWho(p), me))).sort((a, b) => new Date(a.start) - new Date(b.start));
    for(let i = 1; i < ps.length; i++){ const a = ps[i - 1], b = ps[i]; if(new Date(b.start) < new Date(a.stop) - 60000){ const ov = Math.round((new Date(a.stop) - new Date(b.start)) / 60000);
      L.push({ id: 'ov' + b.id, icn: 'timelog', day: localDay(b.start), t: PG.day(b.start) + ' · punches overlap ' + ov + ' min', b: roTag(getRO(a.roId)) + ' ran to ' + clk(a.stop) + ' while ' + roTag(getRO(b.roId)) + ' started at ' + clk(b.start) + '.', btn: 'Fix the overlap' }); } }
    const rp = runningPunch(); if(rp && (!me || techSame(punchWho(rp), me)) && now - new Date(rp.start) > 10 * 3600000) L.push({ id: 'rn' + rp.id, icn: 'clock', day: localDay(rp.start), t: 'Clock running ' + Math.floor((now - new Date(rp.start)) / 3600000) + ' h', b: roTag(getRO(rp.roId)) + ' has run since ' + PG.whenL(rp.start) + '.', btn: 'Fix in the Time Log' });
    return L.filter(c => !(STATE.cxChk || {})[c.id]);
  }
  function teamOf(){
    const now = Date.now(), t = todayStr();
    return rtTechs().map(n => {
      const run = STATE.punches.filter(p => !p.stop && techSame(punchWho(p), n))[0], tp = punchesForDate(t).filter(p => techSame(punchWho(p), n));
      const dayMs = sum(tp, p => (p.stop ? new Date(p.stop) : now) - new Date(p.start));
      const wk = STATE.punches.filter(p => p.stop && techSame(punchWho(p), n) && now - new Date(p.start) < 7 * 86400000 && !isShopPunch(p));
      const opIds = {}; wk.forEach(p => opIds[p.opId] = p.roId);
      let q = 0, b = 0; Object.keys(opIds).forEach(id => { const op = getOp(opIds[id], id); if(op && opDoneNow(op)){ q += +op.quoted || 0; b += opCalc(op).burntHrs; } });
      const lastStop = tp.filter(p => p.stop).map(p => new Date(p.stop).getTime()).sort().pop();
      const o = { n, st: run ? (isShopPunch(run) ? 'shop' : 'job') : (lastStop && now - lastStop < 4 * 3600000 ? 'air' : 'out'), day: PG.durMs(dayMs), eff: b > 0.1 ? Math.round(q / b * 100) : null };
      if(run){ const ro = getRO(run.roId), op = getOp(run.roId, run.opId); o.no = ro && !ro.shop ? tgNum(ro) : 'Shop'; o.cmp = op ? op.complaint : ''; o.since = new Date(run.start).getTime(); o.q = op ? +op.quoted || 0 : 0; o.b = op ? opCalc(op).burntHrs : 0; }
      else if(o.st === 'air'){ o.since = lastStop; o.txt = 'Not on a job'; } else o.txt = tp.length ? 'Off since ' + clk(lastStop) : 'No time today';
      return o;
    });
  }
  const STG = ['Check-in', 'Diag', 'Approval', 'Parts', 'Repair', 'Road test', 'Close-out'];
  function boardOf(){
    return tgYard().filter(ro => !roIsDone(ro)).map(ro => {
      let M = null; try{ M = roStages(ro); }catch(e){}
      const ci = M && M.list ? (M.cur ? M.list.indexOf(M.cur) : M.list.length - 1) : 0, cells = M && M.list ? M.list.map(x => x.state) : [];
      const st = roStatus(ro).status, run = STATE.punches.some(p => !p.stop && p.roId === ro.id);
      const state = run ? 'work' : /^Waiting/.test(st) ? 'wait' : /^Complete/.test(st) ? 'next' : 'next';
      const label = run ? (roStatus(ro).sub || 'Working') : st === 'Hold Tech' ? (ro.assignedTech ? 'Up next · ' + (ro.location || 'yard') : 'Not assigned') : tgStTxt(ro);
      const days = ro.dateOpened ? Math.max(0, Math.floor((Date.now() - new Date(ro.dateOpened)) / 86400000)) : 0;
      return { id: ro.id, no: tgNum(ro), cust: ro.customerName || '—', tech: ro.assignedTech || '', stage: Math.max(0, Math.min(6, ci)), cells, state, label, days, ro };
    }).sort((a, b) => a.stage - b.stage || b.days - a.days);
  }
  /* asTech (Parsec 11.3): the admin looking at one technician's page — their ROs and their running clock; the clock stays theirs */
  function build(asTech){
    const M0 = PG.me(), M = asTech ? Object.assign({}, M0, { name: asTech, tech: asTech, lead: false, viewing: true }) : M0;
    /* Parsec 12.7: each person keeps their own clock — yours, or the technician's you're looking at */
    let rp = asTech ? (STATE.punches.find(p => !p.stop && techSame(punchWho(p), asTech)) || null) : runningPunch(); const sh = asTech || rp ? true : openShift();   /* a running job clock is on the clock */
    S = { me: M.tech, M, lead: M.lead || !M.tech, rp: rp || null, shop: null, out: null, ops: [], view: !!asTech };
    if(rp && isShopPunch(rp)){ const op = getOp(rp.roId, rp.opId); S.shop = op ? op.complaint : 'Shop time'; }
    if(!sh){ const l = lastShiftOut(); S.out = { why: l ? l.outReason || 'Clocked out' : 'Not clocked in yet', at: l ? l.out : null, back: l && l.backBy }; }
    if(S.me){
      STATE.ros.forEach(ro => {
        if(ro.id === SHOP_RO_ID || ro.shop) return;
        const mineRo = techSame(techOf(ro), S.me);
        raLive(ro).forEach((op, i) => {
          if(!mineRo && !(rp && rp.opId === op.id) && !opPunches(op.id).some(p => techSame(punchWho(p), S.me) && PG.isToday(p.start))) return;
          if(roIsDone(ro) && !(rp && rp.opId === op.id) && !(opDoneNow(op))) return;
          const o = mkOp(ro, op, i, rp); if(o) S.ops.push(o);
        });
      });
    }
    S.day = dayOf(S.me); S.chk = checksOf(S.me);
    S.morning = !!(S.me && !S.lead && !asTech && !sh && !rp && !S.day.sh.length && U.skipMorning !== todayStr());
    if(!U.view) U.view = S.lead ? 'shop' : 'today';
    if(S.lead) U.view = 'shop';
    return S;
  }
  function dayStats(){
    const D = S.day, done = S.ops.filter(o => o.st === 'done'), q = sum(done, o => o.q), b = sum(done, o => o.b0);
    return { cl: D.cl, job: D.job, shop: D.shop, air: Math.max(0, D.cl - D.job - D.shop), lunch: D.lunch, eff: b > 0.05 ? q / b * 100 : null, sold: q };
  }
  function airNow(){
    if(S.out || S.rp) return 0;
    const ends = S.day.ps.map(p => p.stop ? new Date(p.stop).getTime() : 0).concat(S.day.sh.map(s => new Date(s.in).getTime()));
    const last = Math.max.apply(null, ends.filter(x => x <= Date.now()).concat([0]));
    return last ? (Date.now() - last) / 60000 : 0;
  }
  const TK = {
    run: () => { const o = S && S.rp && opBy(S.rp.opId); return o ? hms(burnt(o) * 3600000) : (S && S.rp ? hms(Date.now() - new Date(S.rp.start)) : '0:00:00'); },
    runm: () => { const o = S && S.rp && opBy(S.rp.opId); return o ? dur(burnt(o) * 60) : ''; },
    shop: () => S && S.rp && S.shop ? dur((Date.now() - new Date(S.rp.start)) / 60000) : '',
    cl: () => { if(!S) return ''; const t = todayStr(), who = S.me || pcMe(); let m = 0; shiftsForDate(t).filter(s => sameOwner(shiftOwner(s), who)).forEach(s => m += ((s.out ? new Date(s.out) : Date.now()) - new Date(s.in)) / 60000); return dur(m); },
    air: () => S ? dur(airNow()) : '',
    tm: el => dur((Date.now() - (+el.dataset.since)) / 60000),
    clock: () => clk(Date.now())
  };
