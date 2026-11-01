/* Parsec · pages/inbox · model.js
   The Inbox's model: send(), the items for one person (stored notes plus what the shop derives: hand-offs, asks, reminders), threads, counts, the morning summary.
   Flow: IB.send(to, item) is how every area tells a person something; IB.flush() runs after each render.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   store meName meRole deskOf send goalMin backupOf derived flush itemsFor itemsFor0 woke … (25 functions, 24 constants)
   state      ib punches ros
   uses       access/ automations/ clock/ data/ kit/ pages/ pages/triage/ ro/ shell/ state/
*/
  const ic = PG.ic, kbd = PG.kbd, esc = PG.e, clk = PG.clk;
  const SRC = { parts: ['Parts', 'parts'], triage: ['Triage', 'triage'], foreman: ['Foreman', 'foreman'], warranty: ['Warranty', 'warranty'], fixes: ['Fixes', 'fixes'], manager: ['Manager', 'manager'], timelog: ['Time Log', 'timelog'], console: ['Console', 'console'], tech: ['Technician', 'tech'], career: ['Career', 'career'], ros: ['Repair Orders', 'ros'], inbox: ['Inbox', 'inbox'] };
  const KIND = { ask: 'Needs you', men: '@ you', rem: 'Reminder', fyi: 'For you to know' };
  const DESK_SRC = { writer: 'triage', parts: 'parts', foreman: 'foreman', manager: 'manager', warranty: 'warranty', tech: 'console' };
  const U = { view: 'in', lf: 'all', sel: null, pop: null, kb: false, pick: {}, reply: '', bulk: false, bs: {}, sumx: '' };
  const DERIVE = [];   /* other pages add their own: (me) => [items] */
  function store(){ const s = STATE.ib && typeof STATE.ib === 'object' && !Array.isArray(STATE.ib) ? STATE.ib : (STATE.ib = {}); if(!Array.isArray(s.items)) s.items = []; if(!s.st || typeof s.st !== 'object') s.st = {}; if(!s.away) s.away = {}; if(!s.prefs) s.prefs = {}; if(!s.pass) s.pass = {}; if(!s.backup) s.backup = {}; return s; }
  function meName(){ return PG.me().name; }
  function meRole(){ return PG.me().role; }
  function deskOf(role){ return typeof rtKeyOfRole === 'function' ? rtKeyOfRole(role) : ''; }
  /* ---------- sending ---------- */
  function send(o){
    if(!o || !o.to) return null;
    const s = store(), n = { id: uid('ib'), to: o.to, from: o.from || meName(), k: o.k || 'fyi', src: o.src || 'inbox', at: nowIso(), ro: o.ro || null, op: o.op || null, t: o.t || '', b: o.b || '', q: o.q || '', kind: o.kind || '', acts: o.acts || null, parts: o.parts || null, pick: !!o.pick, x: o.x || null, sent: [] };
    s.items.push(n);
    if(s.items.length > 800) s.items = s.items.filter((x, i) => i > s.items.length - 700 || !(s.st[x.id] && s.st[x.id].done));
    scheduleSave(true);
    return n;
  }
  /* ---------- the items for one person: stored notes, plus what the shop says right now ---------- */
  function goalMin(role){ const k = deskOf(role); return k && rtCfg().goals[k] ? rtCfg().goals[k] : 240; }
  function backupOf(name){ const s = store(); if(s.backup[name]) return s.backup[name]; const sf = staffForTech(name), role = sf ? sf.role : '';
    if(role === 'Foreman') return PG.person('Manager') || ''; if(role === 'Manager') return PG.person('Foreman') || ''; return PG.person('Foreman') || PG.person('Manager') || ''; }
  function derived(me){
    const L = [], sf = staffForTech(me), role = sf ? sf.role : (me === 'Admin' ? 'Admin' : 'Technician'), desk = deskOf(role), now = Date.now(), lead = role === 'Foreman' || role === 'Manager' || role === 'Admin';
    const mineTech = n => n && techSame(n, me);
    STATE.ros.forEach(ro => {
      if(ro.id === SHOP_RO_ID || ro.shop) return;
      const r = ro.route, no = tgNum(ro);
      /* hand-offs waiting for me to accept */
      if(r && r.state === 'pending' && (r.to === 'tech' ? mineTech(r.who) : desk === r.to)){
        L.push({ key: 'rt:' + ro.id + ':' + r.at, to: me, from: r.by || 'Parsec', k: 'ask', src: DESK_SRC[r.to] || 'ros', at: r.at, ro: ro.id, t: `${PG.first(r.by || 'Someone')} sent you ${no}` + (r.reason ? ' — ' + r.reason.toLowerCase() : ''), b: r.note || '', acts: [['Accept', 'accept', `${no} accepted — it’s with you now.`], ['Send back', 'return'], ['Open RO', 'open']], derived: true });
      }
      /* sent back to me */
      if(r && r.state === 'returned' && (r.to === 'tech' ? mineTech(r.who) : desk === r.to) && now - new Date(r.at) < 3 * 86400000)
        L.push({ key: 'rr:' + ro.id + ':' + r.at, to: me, from: r.by || 'Parsec', k: 'ask', src: DESK_SRC[r.retFrom] || 'ros', at: r.at, ro: ro.id, t: `${no} came back from ${RT_LBL[r.retFrom] || 'them'}`, b: r.note || '', acts: [['Got it', 'got', 'Okay — it’s yours again.'], ['Open RO', 'open']], derived: true });
      /* the stage rule says it should come to me */
      let sg = null; try{ sg = rtSuggest(ro); }catch(e){}
      if(sg && desk && sg.to === desk && !roIsDone(ro)){
        const pick = sg.to === 'foreman';
        L.push({ key: 'sg:' + ro.id + ':' + sg.rule.k, to: me, from: 'Parsec', k: 'ask', src: DESK_SRC[sg.to] || 'ros', at: sg.stage && sg.stage.doneAt || ro.dateOpened, ro: ro.id, t: `${sg.rule.when} on ${no}` + (pick ? ' — needs a tech' : ''), b: sg.why || '', pick: pick, acts: pick ? [['Send to a tech', 'pick'], ['Not now', 'snooze']] : [['Take it', 'take', `${no} is with you now.`], ['Open RO', 'open']], derived: true });
      }
      /* my trucks: parts in, approvals */
      if(mineTech(ro.assignedTech) && !roIsDone(ro)){
        raLive(ro).forEach(op => {
          opRealParts(op).forEach(p => { if((p.status === 'Staged' || p.status === 'Received') && p.statusChangedAt && now - new Date(p.statusChangedAt) < 86400000)
            L.push({ key: 'ps:' + p.id + ':' + p.status, to: me, from: PG.person('Parts') || 'Parts', k: 'fyi', src: 'parts', at: p.statusChangedAt, ro: ro.id, t: `Parts ${p.status === 'Staged' ? 'staged' : 'in'} for ${no}` + (p.bin ? ' — ' + p.bin : ''), b: (p.description || p.partNumber) + ' · Op ' + (raLive(ro).indexOf(op) + 1) + ' — ' + (op.complaint || ''), derived: true }); });
          if(op.appr && op.appr.s !== 'no' && op.appr.at && now - new Date(op.appr.at) < 86400000)
            L.push({ key: 'ap:' + op.id + ':' + op.appr.at, to: me, from: op.appr.by || PG.person('Service writer') || 'Service writer', k: 'fyi', src: 'triage', at: op.appr.at, ro: ro.id, t: `Approved — ${no}, go ahead`, b: 'Op ' + (raLive(ro).indexOf(op) + 1) + ' — ' + (op.complaint || '') + (+op.quoted ? ' · ' + PG.h1(op.quoted) + ' h' : ''), derived: true });
        });
      }
      /* the writer: ready to release, customers not updated */
      if(desk === 'writer' && !roIsDone(ro)){
        if(tyCat(ro) === 'rdy') L.push({ key: 'rd:' + ro.id, to: me, from: 'Parsec', k: 'fyi', src: 'triage', at: ro.status && ro.status.setAt, ro: ro.id, t: `${no} is ready to release`, b: (ro.customerName || '') + ' — call them to pick it up.', acts: [['Open in Triage', 'page']], derived: true });
        if(roStatus(ro).status === 'Waiting – Customer'){ const last = (ro.contacts || []).map(c => c.at).sort().pop() || (ro.status && ro.status.setAt); if(last && now - new Date(last) > 2 * 86400000)
          L.push({ key: 'nu:' + ro.id + ':' + localDay(last), to: me, from: 'Parsec', k: 'rem', src: 'triage', at: new Date(new Date(last).getTime() + 2 * 86400000).toISOString(), ro: ro.id, t: `No update to ${ro.customerName || 'the customer'} in ${Math.floor((now - new Date(last)) / 86400000)} days`, b: 'Waiting on their answer — log a call or a text.', acts: [['Open in Triage', 'page']], derived: true }); }
      }
      /* parts: ETAs gone by */
      if(desk === 'parts' && !roIsDone(ro)) raLive(ro).forEach(op => opRealParts(op).forEach(p => { if((p.status === 'Ordered' || p.status === 'Backordered') && p.eta && new Date(p.eta + 'T17:00:00') < now)
        L.push({ key: 'eta:' + p.id + ':' + p.eta, to: me, from: 'Parsec', k: 'rem', src: 'parts', at: p.eta + 'T17:00:00', ro: ro.id, t: `ETA passed — ${p.description || p.partNumber} for ${no}`, b: `Due ${PG.day(p.eta + 'T12:00:00')} — chase it and tell the writer.`, acts: [['Open in Parts', 'page']], derived: true }); }));
    });
    /* clocks left running */
    STATE.punches.forEach(p => { if(p.stop) return; const h = (now - new Date(p.start)) / 3600000, who = punchWho(p); if(h < 8) return;
      if(mineTech(who) || (lead && h >= 10)) L.push({ key: 'ck:' + p.id, to: me, from: 'Parsec', k: 'rem', src: 'timelog', at: new Date(new Date(p.start).getTime() + 8 * 3600000).toISOString(), ro: isShopPunch(p) ? null : p.roId, t: mineTech(who) ? `Your clock on ${roTag(getRO(p.roId))} has run ${Math.floor(h)} h` : `${PG.first(who)}’s clock has run ${Math.floor(h)} h`, b: `Started ${PG.whenL(p.start)} — still running.`, acts: [['Fix in the Time Log', 'tl']], derived: true }); });
    shiftList().forEach(s => { if(!s.out && localDay(s.in) !== todayStr() && (!s.by || mineTech(s.by) || lead) && now - new Date(s.in) < 14 * 86400000)
      L.push({ key: 'so:' + s.id, to: me, from: 'Parsec', k: 'rem', src: 'timelog', at: s.in, t: `No clock out on ${PG.day(s.in)}`, b: 'On the clock since ' + PG.clk(s.in) + ' — set when ' + (s.by && !mineTech(s.by) ? PG.first(s.by) : 'you') + ' left.', acts: [['Fix in the Time Log', 'tl']], derived: true }); });
    /* the shop's warnings, as reminders: a technician gets the ones on their trucks, leads get them all */
    try{ computeWarnings().forEach(w => { const ro = w.ro; if(ro && roIsDone(ro)) return; if(ro && !lead && !mineTech(ro.assignedTech)) return; if(!ro && !lead) return;
      L.push({ key: 'w:' + (typeof noteKey === 'function' ? noteKey(w) : w.code + (ro ? ro.id : '')), to: me, from: 'Parsec', k: 'rem', src: 'ros', at: (ro && (ro.status && ro.status.setAt)) || nowIso(), ro: ro ? ro.id : null, t: w.text, b: w.code ? 'Warning ' + w.code : '', acts: ro ? [['Open RO', 'open']] : null, derived: true, warn: w }); }); }catch(e){}
    DERIVE.forEach(f => { try{ (f(me, role) || []).forEach(x => { x.derived = true; x.to = x.to || me; L.push(x); }); }catch(e){ console.error(e); } });
    /* each person keeps their own state on the same shop fact */
    L.forEach(x => { x.key = me + '|' + x.key; if(!x.at) x.at = nowIso(); });
    return L;
  }
  /* everything addressed to one person (or covered for them), with its state */
  let CACHE = {};
  function flush(){ CACHE = {}; }
  function itemsFor(me){ if(!CACHE[me]) CACHE[me] = itemsFor0(me); return CACHE[me]; }
  function itemsFor0(me){
    const s = store(), now = Date.now(), out = [];
    const away = s.away, coverFor = Object.keys(away).filter(x => away[x] && away[x].cover && techSame(away[x].cover, me) && (!away[x].until || new Date(away[x].until) > now));
    const pref = s.prefs[me] || {};
    const add = (n, cov) => {
      const st = s.st[n.key || n.id] || {};
      if(n.derived && st.auto && st.done){ delete st.done; delete st.auto; delete st.how; }   /* it came back */
      const x = Object.assign({}, n, { key: n.key || n.id, cov: cov || null, st: st.done ? 'done' : st.snz && !woke(st.snz, n) ? 'snz' : st.read ? 'read' : 'new', how: st.how || '', snzT: st.snz ? st.snz.t : '', auto: st.auto, sent: (n.sent || []).concat(st.sent || []) });
      if(pref[x.src] === 'off' && (x.k === 'fyi' || x.k === 'rem') && x.st !== 'done') return;
      out.push(x);
    };
    s.items.forEach(n => { if(techSame(n.to, me)) add(n); else if((n.k === 'ask' || n.k === 'men') && coverFor.some(c => techSame(c, n.to))) add(n, n.to); });
    const D = derived(me), seen = {};
    D.forEach(n => { seen[n.key] = 1; add(n); });
    coverFor.forEach(c => derived(c).forEach(n => { if(n.k === 'ask' && !seen[n.key]){ seen[n.key] = 1; add(n, c); } }));
    /* asks past one and a half times the goal reach the backup too */
    Object.keys(s.st).forEach(k => { const st = s.st[k]; if(st.snap && !seen[k] && st.snap.to && techSame(st.snap.to, me) && !st.done && st.snap.derived){ st.done = nowIso(); st.auto = 1; st.how = 'cleared itself'; } });
    s.items.forEach(n => { if(techSame(n.to, me) || !(n.k === 'ask' || n.k === 'men')) return; const st = s.st[n.id] || {}; if(st.done || st.snz) return; if(!techSame(backupOf(n.to), me)) return;
      const age = (now - new Date(n.at)) / 60000, g = goalMin((staffForTech(n.to) || {}).role); if(age >= g * 1.5) add(Object.assign({}, n, { escFor: n.to }), n.to); });
    /* derived items that were here before and have gone: they cleared themselves */
    Object.keys(s.st).forEach(k => { const st = s.st[k]; if(st.snap && st.auto && techSame(st.snap.to, me) && !out.some(x => x.key === k) && st.done && now - new Date(st.done) < 7 * 86400000) out.push(Object.assign({}, st.snap, { key: k, st: 'done', how: st.how, auto: 1 })); });
    return out;
  }
  function woke(z, n){
    if(z.until) return new Date(z.until) <= Date.now();
    const ro = n.ro && getRO(n.ro); if(!ro) return true;
    if(z.ev === 'parts') return raLive(ro).every(op => opRealParts(op).every(p => pxPartIn(p)));
    if(z.ev === 'cust') return (ro.contacts || []).some(c => new Date(c.at) > new Date(z.at));
    if(z.ev === 'moves'){ let M = null; try{ M = roStages(ro); }catch(e){} return (M && M.cur ? M.cur.k : 'done') !== z.stage || roIsDone(ro); }
    return false;
  }
  /* remember the derived ones we've shown, so they can say they cleared themselves */
  function remember(L){ const s = store(); let ch = 0; L.forEach(n => { if(!n.derived) return; const st = s.st[n.key]; if(!st){ s.st[n.key] = { snap: { t: n.t, b: n.b, src: n.src, from: n.from, ro: n.ro, at: n.at, k: n.k, to: n.to, derived: true } }; ch++; } });
    if(ch){ const keys = Object.keys(s.st); if(keys.length > 1500) keys.slice(0, keys.length - 1200).forEach(k => delete s.st[k]); persistLocal(); } }
  const live = n => n.st === 'new' || n.st === 'read';
  const actionable = n => n.k === 'ask' || n.k === 'men';
  const tkey = n => n.ro ? 'ro:' + n.ro : n.key;
  const order = (a, b) => (actionable(b) && live(b) ? 1 : 0) - (actionable(a) && live(a) ? 1 : 0) || new Date(b.at || 0) - new Date(a.at || 0);
  function count(me){ me = me || meName(); return itemsFor(me).filter(n => live(n) && (n.st === 'new' || actionable(n))).length; }
  function badge(){ try{ return count(meName()); }catch(e){ return 0; } }

  /* ---------- threads, views, counts ---------- */
  const rd = () => PG.keepScroll(render);
  const stOf = k => { const s = store(); return s.st[k] || (s.st[k] = {}); };
  const quiet = () => { try{ AUTO_SILENT = true; scheduleSave(true); } finally { AUTO_SILENT = false; } };
  const fromN = f => !f || f === 'Parsec' ? 'Parsec' : f;
  const avOf = f => !f || f === 'Parsec' ? '<span class="tg-av ib-sys" data-tip="Parsec · automations">P</span>' : PG.av(f);
  const isPerson = f => !!f && f !== 'Parsec' && !!staffForTech(f);
  const ROn = id => { const ro = id && getRO(id); return ro ? tgNum(ro) : ''; };
  const custOf = id => { const ro = id && getRO(id); return ro ? (ro.customerName || '') : ''; };
  function dd(at){ if(!at) return 0; const a = new Date(at); a.setHours(0, 0, 0, 0); const b = new Date(); b.setHours(0, 0, 0, 0); return Math.round((b - a) / 86400000); }
  function threads(L){ const M = new Map(); L.forEach(n => { const k = tkey(n); if(!M.has(k)) M.set(k, []); M.get(k).push(n); });
    return [...M.entries()].map(([key, I]) => { I.sort(order); const prim = I.find(n => live(n) && actionable(n)) || I[0]; return { key, I, prim, top: I[0], ask: I.some(n => live(n) && actionable(n)), un: I.some(n => n.st === 'new'), cov: prim.cov || null }; }); }
  function mine(){ return itemsFor(meName()); }
  function inView(){ return mine().filter(n => U.view === 'in' ? live(n) : U.view === 'snz' ? n.st === 'snz' : n.st === 'done'); }
  function sentBy(me){
    const s = store(), now = Date.now(), L = [];
    s.items.forEach(n => { if(!techSame(n.from, me) || techSame(n.to, me) || now - new Date(n.at) > 7 * 86400000) return; const st = s.st[n.id] || {};
      L.push({ id: n.id, to: n.to, ro: n.ro, t: n.t, at: n.nudged || n.at, sentAt: n.at, seen: st.read && st.read !== true ? st.read : st.read ? n.at : null, did: st.done ? (st.how ? st.how[0].toUpperCase() + st.how.slice(1) : 'Done') : null, didAt: st.done || null, note: true }); });
    STATE.ros.forEach(ro => { const r = ro.route; if(!r || !r.by || !techSame(r.by, me) || r.state === 'returned' || now - new Date(r.at) > 3 * 86400000) return;
      L.push({ id: 'rt:' + ro.id + ':' + r.at, to: rtWhoText(ro), ro: ro.id, t: `Sent ${tgNum(ro)} to ${RT_LBL[r.to] || r.to}`, at: r.at, sentAt: r.at, seen: r.state === 'accepted' ? (r.acceptedAt || r.at) : r.seen ? r.at : null, did: r.state === 'accepted' && r.acceptedBy ? 'Accepted' : null, didAt: r.acceptedAt || null, route: true }); });
    return L.sort((a, b) => new Date(b.at) - new Date(a.at));
  }
  function groups(){
    if(U.view === 'sent') return [['Sent by you', sentBy(meName()).map(x => ({ key: 's:' + x.id, sent: x }))]];
    let T = threads(inView()).sort((a, b) => order(a.top, b.top));
    if(U.view !== 'in') return [[U.view === 'snz' ? 'Snoozed' : 'Done', T]];
    if(U.lf === 'un') T = T.filter(t => t.un); else if(U.lf === 'ask') T = T.filter(t => t.ask);
    const C = T.filter(t => t.cov), A = T.filter(t => !t.cov && t.ask), R = T.filter(t => !t.cov && !t.ask);
    return [[`Covering for ${C.length ? PG.first(C[0].cov) : ''}`, C], ['Needs you', A], ['Today', R.filter(t => dd(t.top.at) <= 0)], ['Yesterday', R.filter(t => dd(t.top.at) === 1)], ['Earlier', R.filter(t => dd(t.top.at) > 1)]].filter(g => g[1].length);
  }
  const flat = () => groups().flatMap(g => g[1]);
  const curT = () => U.sel === 'SUM' ? null : flat().find(t => t.key === U.sel && t.I) || null;
  function counts(){ const me = meName(), M = mine(), own = M.filter(n => !n.cov);
    return { ask: threads(own.filter(live)).filter(t => t.ask).length, un: own.filter(n => n.st === 'new').length, snz: own.filter(n => n.st === 'snz').length, done: own.filter(n => n.st === 'done').length, inb: threads(M.filter(live)).length, sent: sentBy(me).length }; }
  /* asks past their goal: a reminder at the goal; a note sent to you reaches your backup at one and a half times it */
  function esc8(n){ if(!actionable(n) || !live(n)) return null; const g = goalMin((staffForTech(n.to) || {}).role), t = new Date(n.at).getTime(), age = (Date.now() - t) / 60000; if(!(age >= g)) return null;
    const b = backupOf(n.to), sf = staffForTech(b); return { rem: clk(t + g * 60000), bk: clk(t + g * 90000), gone: !n.derived && age >= g * 1.5, who: b, role: sf ? sf.role : '', goal: g, derived: !!n.derived }; }
  /* ---------- summary for the morning ---------- */
  function sumOf(me){
    const s = store(), M = mine().filter(n => live(n) && !n.cov), sf = staffForTech(me), tech = !sf || sf.role === 'Technician';
    const outs = shiftList().filter(x => x.out && (!x.by || techSame(x.by, me)) && localDay(x.out) !== todayStr()).map(x => x.out).sort(), since = outs.pop() || new Date(Date.now() - 86400000).toISOString();
    const due = STATE.ros.filter(ro => !ro.shop && ro.id !== SHOP_RO_ID && !roIsDone(ro) && ro.promisedAt && localDay(ro.promisedAt) === todayStr() && (!tech || techSame(ro.assignedTech, me))).sort((a, b) => new Date(a.promisedAt) - new Date(b.promisedAt));
    const run = STATE.punches.filter(p => !p.stop && localDay(p.start) !== todayStr() && techSame(punchWho(p), me));
    const sh = shiftList().filter(x => !x.out && (!x.by || techSame(x.by, me)) && localDay(x.in) === todayStr())[0];
    const pass = s.pass[me] && Date.now() - new Date(s.pass[me].at) < 24 * 3600000 ? s.pass[me] : null;
    return { since, at: sh ? sh.in : null, A: M.filter(actionable), M, R: M.filter(n => n.k === 'rem'), due, run, pass };
  }
  function sumShows(me){ const s = store(), p = s.prefs[me] || {}; if(p.sum === false || U.view !== 'in') return false; if((s.sumx || {})[me] === todayStr()) return false; const S0 = sumOf(me); return !!(S0.M.length || S0.due.length || S0.run.length || S0.pass); }
