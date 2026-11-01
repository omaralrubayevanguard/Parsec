/* ============================== Time Log (overhaul + recommendations + drag an edge + ideas mock-ups) ==============================
   One person's days: a list with what needs fixing on top, the day as a timeline you can drag, the week with
   efficiency week by week, the pay-period timesheet with sign → approve → lock, and the whole shop for leads.
   Times are minutes of the day here; they go back to the punches and day clocks as ISO times. */
var TL = (function(){
  const ic = PG.ic, kbd = PG.kbd, esc = PG.e;
  const p2 = n => String(n).padStart(2, '0');
  const hm = m => m == null || isNaN(m) ? '—' : p2(Math.floor(m / 60)) + ':' + p2(Math.round(m % 60));
  const dur = m => { m = Math.round(m || 0); return Math.floor(m / 60) + ':' + p2(m % 60); };
  /* Parsec 14.6: times the fast way — 07:15, 715, 7, 3:45p, and +10 / -5 from the time that was there */
  const pm = (s, cur) => { s = String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ''); if(!s) return null; let x;
    if((x = /^([+-])(\d{1,3})$/.exec(s))) return cur == null ? null : Math.max(0, Math.min(1439, cur + (x[1] === '-' ? -1 : 1) * +x[2]));
    if((x = /^(\d{1,2})(?:[:.]?(\d{2}))?([ap])m?$/.exec(s))){ let h = +x[1], m = +(x[2] || 0); if(h < 1 || h > 12 || m > 59) return null; h = h % 12 + (x[3] === 'p' ? 12 : 0); return h * 60 + m; }
    if((x = /^(\d{1,2})[:.h](\d{2})$/.exec(s) || /^(\d{1,2})(\d{2})$/.exec(s))){ const h = +x[1], m = +x[2]; return h < 24 && m < 60 ? h * 60 + m : null; }
    if((x = /^(\d{1,2})$/.exec(s))){ const h = +x[1]; return h < 24 ? h * 60 : null; }
    return null; };
  const DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], DNL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], MNL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dOf = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const kOf = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  const addD = (k, n) => { const d = dOf(k); d.setDate(d.getDate() + n); return kOf(d); };
  const short = k => { const d = dOf(k); return DN[d.getDay()] + ' ' + (d.getMonth() + 1) + '/' + d.getDate(); };
  const SR = () => START_REASONS.slice(0, 4), ER = () => STOP_REASONS_EXPLICIT.concat(['Switched job']).concat(STOP_REASONS_BREAK);
  /* Parsec 14.6: a reason on every change — one tap; the lead's two only when it's someone else's time */
  const WHY_OWN = ['Forgot to clock out', 'Forgot to clock in', 'Forgot to stop the clock', 'Wrong job or RO', 'Worked through lunch', 'Parsec was down'], WHY_LEAD = ['Tech asked me to', 'Matches the RO paperwork'];
  const NOTES = ['Replaced and torqued to spec, verified no leaks.'];
  let TODAY = todayStr(), NOW = PG.mod(Date.now());
  const U = { view: 'day', who: null, day: null, sel: null, pop: null, kb: false, open: {}, note: null, hov: null, drag: null, snap: 1, kh: false, ab: null, per: 'cur', snz: 0, otAsk: false, trTbl: false };
  const ok = () => STATE.tlOk && typeof STATE.tlOk === 'object' ? STATE.tlOk : (STATE.tlOk = {});
  const sign = () => STATE.tlSign && typeof STATE.tlSign === 'object' ? STATE.tlSign : (STATE.tlSign = {});
  let CACHE = {}, OPT = null;
  /* ---------- who ---------- */
  function ME(){ return PG.me(); }
  function role(){ const m = ME(); return m.tech && !m.lead && !m.admin ? 'tech' : 'foreman'; }
  function techs(){ const m = ME(); if(role() === 'tech') return [m.tech]; const T = rtTechs(); return m.staff && m.name && !T.some(t => techSame(t, m.name)) ? [m.name].concat(T) : T; }   /* Parsec 14.2: the signed-in person has a day of their own */
  const TF = t => PG.first(t === 'ALL' ? (techs()[0] || '') : t);
  const isMine = t => !!t && techSame(t, ME().name);
  const lead = () => PG.person('Foreman') || PG.person('Manager') || 'the foreman';
  function shiftEndOf(t){ const sf = staffForTech(t); return pm((sf && sf.shiftEnd) || STATE.shiftEnd || '15:30') || 930; }
  /* a day clock belongs to whoever clocked in; old ones (before clocks said whose) to this computer's tech */
  function shOwn(s, t){ if(s.by) return techSame(s.by, t);
    const k = 'own' + s.id; if(!CACHE[k]){ const a = new Date(s.in).getTime() - 60000, b = s.out ? new Date(s.out).getTime() : Date.now();
      const W = STATE.punches.filter(p => { const x = new Date(p.start).getTime(); return x >= a && x <= b; }).map(punchWho);
      CACHE[k] = W.length ? W : STATE.techName ? [STATE.techName] : []; }
    return CACHE[k].some(n => techSame(n, t)); }
  /* ---------- the day, from the punches and the day clocks ---------- */
  function flush(){ CACHE = {}; OPT = null; TODAY = todayStr(); NOW = PG.mod(Date.now()); }
  function opTot(){ if(OPT) return OPT; OPT = {}; STATE.punches.forEach(p => { OPT[p.opId] = (OPT[p.opId] || 0) + Math.max(0, (p.stop ? new Date(p.stop) : Date.now()) - new Date(p.start)); }); return OPT; }
  const mOf = (iso, k) => { const d = new Date(iso); const m = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; return localDay(iso) === k ? Math.round(m) : localDay(iso) > k ? 1440 : 0; };
  function punchOf(p, k){
    const ro = getRO(p.roId), op = ro ? (ro.operations || []).find(o => o.id === p.opId) : null, shp = isShopPunch(p);
    const ms = Math.max(0, (p.stop ? new Date(p.stop) : Date.now()) - new Date(p.start)), tot = opTot()[p.opId] || ms;
    const mvOnly = !!p.movedFrom && p.originalStart === p.start && (p.originalStop || null) === (p.stop || null);   /* Parsec 12.7: moved, times as they were */
    const ed = p.edited && p.originalStart && !mvOnly ? hm(mOf(p.originalStart, k)) + '–' + (p.originalStop ? hm(mOf(p.originalStop, k)) : 'now') : p.manual || p.addedByHand ? 'added by hand' : null;
    const mv = p.movedFrom && typeof rcOpLabel === 'function' ? rcOpLabel(p.movedFrom.roId, p.movedFrom.opId) : '';
    const x = { id: p.id, s: mOf(p.start, k), e: p.stop ? mOf(p.stop, k) : null, ro: shp ? 'SHOP' : (ro ? tgNum(ro) : '?'), roId: p.roId, opId: p.opId, cust: ro ? ro.customerName || '' : '', cm: op ? op.complaint || '' : '', sr: p.startReason || '', er: p.stopReason || '', note: String(p.notes || '').trim(), qd: !shp && !!op && opDoneNow(op), q: shp || !op || !opDoneNow(op) ? 0 : (+op.quoted || 0) * (tot ? ms / tot : 0), shop: shp && op ? op.complaint : '', ed, mv, by: p.editBy ? (isMine(p.editBy) && isMine(punchWho(p)) ? 'You' : PG.first(p.editBy)) : '', why: p.editWhy || '', raw: p };
    if(U.drag && U.drag.pid === p.id && U.drag.v != null) x[U.drag.edge] = U.drag.v;
    return x;
  }
  function dayOf(t, k){
    if(!t || t === 'ALL') return null;
    const key = t + '|' + k; if(CACHE['d' + key] !== undefined) return CACHE['d' + key];
    const sh = shiftsForDate(k).filter(s => shOwn(s, t)), ps = STATE.punches.filter(p => localDay(p.start) === k && techSame(punchWho(p), t)).map(p => punchOf(p, k));
    let D = null;
    if(sh.length || ps.length){
      D = { sh: sh.map(s => [mOf(s.in, k), s.out ? mOf(s.out, k) : null, s.outReason || '', s.autoLunch ? 'auto' : undefined]), shIds: sh.map(s => s.id), p: ps, autoOk: !!ok()['lunch|' + key], back: sh.length && sh[sh.length - 1].backBy ? hm(mOf(sh[sh.length - 1].backBy, k)) : '' };
      if(!sh.length && ps.length){ const a = Math.min(...ps.map(x => x.s)), b = Math.max(...ps.map(x => x.e == null ? (k === TODAY ? NOW : x.s) : x.e)); D.sh = [[a, k === TODAY && ps.some(x => x.e == null) ? null : b, '', undefined]]; D.virt = true; }
    }
    return (CACHE['d' + key] = D);
  }
  function calc(t, k){
    const key = 'c' + t + '|' + k; if(CACHE[key] !== undefined) return CACHE[key];
    const D = dayOf(t, k); if(!D) return (CACHE[key] = null);
    const today = k === TODAY, open = D.sh.some(x => x[1] == null), eod = x => x == null ? (today ? NOW : null) : x;
    const segs = D.sh.map(x => [x[0], eod(x[1]), x[2], x[1], x[3]]);
    const ps = D.p.slice().sort((a, b) => a.s - b.s).map(p => Object.assign({}, p, { e2: p.e == null ? (today ? NOW : p.s) : p.e }));
    let clocked = 0, job = 0, shop = 0, q = 0, jq = 0; segs.forEach(x => { if(x[1] != null) clocked += x[1] - x[0]; });
    const lastStop = ps.length ? Math.max(...ps.map(p => p.e2)) : null;
    if(!today && open){ segs.forEach(x => { if(x[1] == null){ const e = Math.max(x[0], lastStop || x[0]); clocked += e - x[0]; x[1] = e; } }); }
    ps.forEach(p => { const m = p.e2 - p.s; if(p.ro === 'SHOP') shop += m; else { job += m; q += p.q; if(p.qd) jq += m; } });
    const air = []; segs.forEach(x => { if(x[1] == null) return; let c = x[0]; ps.forEach(p => { if(p.e2 <= c || p.s >= x[1]) return; if(p.s > c) air.push([c, Math.min(p.s, x[1])]); c = Math.max(c, p.e2); }); if(x[1] > c) air.push([c, x[1]]); });
    /* Parsec 15: a deleted punch's minutes stay on the clock as air and say what was there; air can carry a reason (a note) */
    const HL = holesOf(t, k); if(HL.length){ const out = []; air.forEach(x => { let pts = [x[0], x[1]]; HL.forEach(h => { if(h.s > x[0] && h.s < x[1]) pts.push(h.s); if(h.e > x[0] && h.e < x[1]) pts.push(h.e); });
      pts = pts.filter((v, i) => pts.indexOf(v) === i).sort((p, q) => p - q); for(let i = 0; i < pts.length - 1; i++){ const y = [pts[i], pts[i + 1]], h = HL.find(h => h.s <= y[0] + 0.5 && h.e >= y[1] - 0.5); if(h) y.del = h; out.push(y); } }); air.length = 0; out.forEach(y => air.push(y)); }
    const AW = airWhys(t, k); air.forEach(x => { let best = null, bo = 0; AW.forEach(w => { const o = Math.min(x[1], w.to) - Math.max(x[0], w.from); if(o > bo){ bo = o; best = w; } }); if(best) x.why = best; });
    const airM = air.reduce((a, x) => a + x[1] - x[0], 0);
    const lunch = []; for(let i = 1; i < segs.length; i++){ if(segs[i - 1][1] != null && segs[i][0] > segs[i - 1][1]) lunch.push([segs[i - 1][1], segs[i][0], segs[i - 1][2], segs[i - 1][4]]); }
    const fixes = [];
    if(!today && open && !D.virt) fixes.push({ k: 'noout', t: 'No clock out', why: lastStop == null ? `Clocked in ${hm(D.sh[0][0])} and never clocked out — no punches that day` : `Clocked in ${hm(D.sh[0][0])} and never clocked out — the day counts to the last punch, ${hm(lastStop)}, until it’s fixed`, at: lastStop || D.sh[0][0] });
    for(let i = 1; i < ps.length; i++){ if(ps[i].s < ps[i - 1].e2 - 0.5){ fixes.push({ k: 'over', t: 'Punches overlap', why: `${ps[i - 1].ro} and ${ps[i].ro} overlap ${Math.round(ps[i - 1].e2 - ps[i].s)} min, ${hm(ps[i].s)}–${hm(ps[i - 1].e2)}`, a: ps[i - 1].id, b: ps[i].id, from: ps[i].s, to: Math.min(ps[i - 1].e2, ps[i].e2) }); } }
    /* Parsec 14.6: punches outside the day clock — a job started before the clock-in, or ran past the clock-out */
    if(!D.virt && segs.length){ const s0 = segs[0][0], b4 = ps.filter(p => p.s < s0 - 0.5)[0]; if(b4) fixes.push({ k: 'outin', t: 'Job before the clock-in', why: `${b4.ro === 'SHOP' ? 'Shop time' : b4.ro} started ${hm(b4.s)}, ${Math.round(s0 - b4.s)} min before the clock-in at ${hm(s0)}`, a: b4.id, at: b4.s, s0 });
      const ls = segs[segs.length - 1]; if(ls[3] != null){ const e0 = ls[1], af = ps.filter(p => p.e != null && p.e2 > e0 + 0.5).pop(); if(af) fixes.push({ k: 'outout', t: 'Job after the clock-out', why: `${af.ro === 'SHOP' ? 'Shop time' : af.ro} ran to ${hm(af.e2)}, ${Math.round(af.e2 - e0)} min after the clock-out at ${hm(e0)}`, a: af.id, at: af.e2, e0 }); } }
    const soft = []; air.forEach(x => { if(x[1] - x[0] >= 20 && !x.why && !ok()['air|' + t + '|' + k + '|' + x[0]]) soft.push({ k: 'air', from: x[0], to: x[1] }); });
    const miss = ps.filter(p => p.ro !== 'SHOP' && p.e != null && !p.note).length;
    const on = open && today, run = ps.find(p => p.e == null);
    const first = segs.length ? segs[0][0] : (ps.length ? ps[0].s : null), last = segs.length ? segs[segs.length - 1][1] : lastStop;
    const lunchM = lunch.filter(x => x[2] === 'Lunch').reduce((a, x) => a + x[1] - x[0], 0);
    /* six hours on the clock with no lunch clocked: a nudge to add one */
    const noLunch = !D.virt && !lunch.some(x => x[2] === 'Lunch') && clocked >= 360 && !D.autoOk && segs.length ? (() => { const at = segs[0][0] + 240; const g = air.find(x => x[1] - x[0] >= 30 && x[1] > at); return { at: g ? Math.max(g[0], Math.min(at, g[1] - 30)) : null }; })() : null;
    const span = today ? NOW : (open ? lastStop : last);
    return (CACHE[key] = { shEnd: shiftEndOf(t), over: (today && open) ? NOW - shiftEndOf(t) : null, D, segs, ps, clocked, job, shop, air, airM, lunch, lunchM, q, jq, eff: jq > 3 ? q / (jq / 60) : null, fixes, soft, miss, on, run, open, first, last, span, today, noLunch });
  }
  const effTxt = e => e == null ? '—' : Math.round(e * 100) + '%';
  function allDays(t){ const k = 'days|' + t; if(CACHE[k]) return CACHE[k]; const s = {};
    STATE.punches.forEach(p => { if(techSame(punchWho(p), t)) s[localDay(p.start)] = 1; }); shiftList().forEach(x => { if(shOwn(x, t)) s[localDay(x.in)] = 1; });
    return (CACHE[k] = Object.keys(s).sort().reverse()); }
  const days = () => U.who && U.who !== 'ALL' ? allDays(U.who) : [];
  const wkStart = k => { const d = dOf(k), w = (d.getDay() + 6) % 7; return addD(k, -w); };
  function groups(){
    const L = days(), ws = wkStart(TODAY), lws = addD(ws, -7), G = { fix: [], wk: [], last: [], old: [] };
    L.forEach(k => { const c = calc(U.who, k); if(!c) return; if(c.fixes.length) G.fix.push(k); else if(k >= ws) G.wk.push(k); else if(k >= lws) G.last.push(k); else G.old.push(k); });
    return G;
  }
  const flat = () => { const G = groups(); return G.fix.concat(G.wk, G.last, U.open.old ? G.old : []); };
  const nfx = t => allDays(t).filter(k => { const c = calc(t, k); return c && c.fixes.length; }).length;
  /* ---------- the pay period: weekly, every two weeks or monthly — the manager sets it (Manager → Settings) ---------- */
  const perStart = k => PG.perStart(k);
  function PER(per){ const cur = perStart(TODAY), s = per === 'prev' ? PG.perPrev(cur) : cur, e = PG.perEnd(s); return [s, PG.perLabel(s), e]; }
  const perDays = per => { const L = [], P = PER(per); for(let k = P[0]; k <= P[2]; k = addD(k, 1)) L.push(k); return L; };
  const sgT = () => U.who === 'ALL' ? techs()[0] : U.who, sgK = () => sgT() + '|' + PER(U.per)[0];
  const stamp = () => short(TODAY) + ' ' + hm(NOW);
  function isLocked(t, k){ const s = sign()[t + '|' + perStart(k)]; return !!(s && s.fm); }
  function missNotes(t, L){ const R = []; L.forEach(k => { const D = dayOf(t, k); if(D && k !== TODAY) D.p.slice().sort((a, b) => a.s - b.s).forEach(p => { if(p.ro !== 'SHOP' && p.e != null && !(p.note || '').trim()) R.push({ k, p }); }); }); return R; }
  const otherT = () => role() === 'foreman' && U.who && U.who !== 'ALL' && !isMine(U.who);
  const WHYS = () => otherT() ? WHY_OWN.concat(WHY_LEAD) : WHY_OWN;
  const needWhy = p => !String(p.why || '').trim();
  function whyRow(p, t){ const L = WHYS(), oth = p.whyO || (p.why && L.indexOf(p.why) < 0);
    return `<span class="tg-lbl top">${otherT() ? `Why change ${esc(TF(t))}’s time?` : 'Why the change?'}</span><div class="tg-r tk-why">${L.map(w => `<button class="tg-chip${p.why === w ? ' on' : ''}" data-a="pset" data-f="why" data-v="${esc(w)}">${esc(w)}</button>`).join('')}<button class="tg-chip${oth ? ' on' : ''}" data-a="whyo">Other…</button></div>${oth ? `<input class="tk-whyo" data-in="why" value="${esc(oth && L.indexOf(p.why) < 0 ? p.why || '' : '')}" placeholder="Say why">` : ''}`; }
  function edBadge(p){ const mv = p.mv ? `<span class="tk-ed mv" title="The running clock was moved here from ${esc(p.mv)}">${ic('swap', 10)}from ${esc(p.mv)}</span>` : '';
    if(!p.ed) return mv && p.by ? `<span class="tk-ed by" title="Changed by ${esc(p.by)}: ${esc(p.why)}">${ic('pencil', 10)}${esc(p.by)}${p.why ? ' · ' + esc(p.why) : ''}</span>` + mv : mv;
    if(p.ed === 'added by hand') return '<span class="tk-ed">added by hand</span>' + mv;
    return (p.by ? `<span class="tk-ed by" title="Changed by ${esc(p.by)}: ${esc(p.why)} · before: ${esc(p.ed)}">${ic('pencil', 10)}${esc(p.by)}${p.why ? ' · ' + esc(p.why) : ''} · was ${esc(p.ed)}</span>` : `<span class="tk-ed" title="Before the edit: ${esc(p.ed)}">edited · was ${esc(p.ed)}</span>`) + mv; }
  /* Parsec 12.7: a day clock whose clock-in was changed */
  function shBadge(sh, k){ if(!sh || !sh.originalIn) return ''; const was = hm(mOf(sh.originalIn, k));
    return sh.editBy ? `<span class="tk-ed by" title="Changed by ${esc(sh.editBy)}: ${esc(sh.editWhy || '')} · before: ${was}">${ic('pencil', 10)}${esc(isMine(sh.editBy) && isMine(U.who) ? 'You' : PG.first(sh.editBy))}${sh.editWhy ? ' · ' + esc(sh.editWhy) : ''} · was ${was}</span>` : `<span class="tk-ed" title="Before the edit: ${was}">edited · was ${was}</span>`; }
  /* ---------- Parsec 14.6: the end time from evidence — what Parsec can prove about when the day ended ---------- */
  function evid(t, k, c){ const E = [], s0 = c.D.sh[0][0], push = (m, l, d) => { if(m != null && m > s0 && m < 1440) E.push({ m: Math.round(m), l, d: d || '' }); };
    const st = c.ps.filter(p => p.e != null); if(st.length){ const p = st.reduce((a, b) => b.e > a.e ? b : a); push(p.e, 'Last job stopped', p.ro === 'SHOP' ? 'shop time' : p.ro); }
    let ln = null; c.ps.forEach(p => { const op = getOp(p.roId, p.opId); (op && Array.isArray(op.log) ? op.log : []).forEach(l => { if(l && l.at && localDay(l.at) === k){ const m = mOf(l.at, k); if(!ln || m > ln.m) ln = { m, x: String(l.text || '').trim() }; } }); });
    if(ln) push(ln.m, 'Last note', ln.x ? '“' + (ln.x.length > 34 ? ln.x.slice(0, 33) + '…' : ln.x) + '”' : '');
    let la = null; (Array.isArray(STATE.audit) ? STATE.audit : []).forEach(a => { if(a && a.at && localDay(a.at) === k && a.by && techSame(a.by, t)){ const m = mOf(a.at, k); if(!la || m > la.m) la = { m, x: String(a.text || '') }; } });
    if(la) push(la.m, 'Last on an RO', la.x.length > 34 ? la.x.slice(0, 33) + '…' : la.x);
    push(c.shEnd, 'Shift end');
    const seen = {}; return E.sort((a, b) => a.m - b.m).filter(x => !seen[x.m] && (seen[x.m] = 1)); }
  const bestEv = E => { const w = E.filter(x => x.l !== 'Shift end'); return (w.length ? w[w.length - 1] : E[E.length - 1]) || null; };
  /* ---------- Parsec 14.6: ask for a fix → the foreman approves (for anyone without the permission to fix their own time) ---------- */
  const reqs = () => Array.isArray(STATE.tlReq) ? STATE.tlReq : (STATE.tlReq = []);
  const reqOpen = (t, k) => reqs().filter(r => r.st === 'open' && (!t || techSame(r.who, t)) && (!k || r.k === k));
  const mayFix = t => typeof can !== 'function' || !viewAsStaff() || can(t && t !== 'ALL' && !isMine(t) ? 't.editall' : 't.editown');
  const mustAsk = t => !mayFix(t) && isMine(t);
  /* ---------- Parsec 14.6: Fix these — every clock problem for the person, the open day and the pay period, with the likely fix ---------- */
  function fxItems(t){ if(!t || t === 'ALL') return []; const per = PER('cur'), pv = PER('prev'), pvOpen = !(sign()[t + '|' + pv[0]] || {}).fm, I = [];
    const K = {}; allDays(t).forEach(k => { const c = calc(t, k); if(c && c.fixes.length) K[k] = 1; if((k >= per[0] || (pvOpen && k >= pv[0])) && k <= TODAY) K[k] = 1; });
    Object.keys(K).sort().reverse().forEach(k => { if(isLocked(t, k)) return; const c = calc(t, k); if(!c) return;
      c.fixes.forEach(f => I.push({ k, f, c }));
      if(c.noLunch && !c.today) I.push({ k, f: { k: 'lunch', t: 'No lunch taken', why: `${dur(c.clocked)} clocked, no lunch clock-out`, at: c.noLunch.at }, c });
      const mn = c.today ? 0 : c.miss; if(mn) I.push({ k, f: { k: 'notes', t: mn + ' punch' + (mn > 1 ? 'es' : '') + ' without a work note', why: 'The timesheet asks for a note on every job punch' }, c }); });
    return I; }
  /* ---------- Parsec 15: deleted punches (STATE.holes with who / what) and the reasons for air ---------- */
  function holesOf(t, k){ return (Array.isArray(STATE.holes) ? STATE.holes : []).filter(h => h && h.by && h.start && h.stop && techSame(h.by, t) && localDay(h.start) === k).map(h => ({ s: mOf(h.start, k), e: mOf(h.stop, k), lbl: h.label || 'a punch', what: h.what || '', by: h.delBy || '', at: h.delAt || '', id: h.id })); }
  const airAll = () => STATE.tlAirWhy && typeof STATE.tlAirWhy === 'object' && !Array.isArray(STATE.tlAirWhy) ? STATE.tlAirWhy : (STATE.tlAirWhy = {});
  const airWhys = (t, k) => Array.isArray(airAll()[t + '|' + k]) ? airAll()[t + '|' + k] : [];
  const AIRWHY = ['Waiting on parts', 'No work assigned', 'Waiting on the foreman', 'Cleaning up', 'Meeting'];
  /* who may write a reason for air: your own time (must-ask too — it's a note, not a time change) or a lead who may change it */
  const airOk = t => !!t && t !== 'ALL' && (isMine(t) || mayFix(t));
  const delTxt = d => `deleted ${d.lbl} · ${hm(d.s)}–${hm(d.e)}`;
