/* Parsec · pages · shop-data.js
   pgShopData(): the shop's numbers for Manager and Career — one pass over ROs, punches and day clocks, cached until the state changes.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pgShopData PG_SD (1 function, 1 constant)
   state      punches returns ros savedAt staff techName
   uses       access/ clock/ data/ kit/ pages/fixes/ pages/inventory/ pages/triage/ pages/warranty/ ro/ state/ trucks/
*/
/* ============================== The shop’s numbers, for Manager and Career ==============================
   One pass over the ROs, punches and day clocks into the shape the Manager engine reads: each RO with its
   operations (quoted, clocked, who), parts, approvals, claims and credits; hours on ROs and on the clock per
   technician per day. Built once per change and shared. Technicians are keyed by their initials. */
var PG_SD = null;
function pgShopData(){
  var sig = [STATE.savedAt || 0, STATE.ros.length, STATE.punches.length, shiftList().length, todayStr(), (STATE.staff || []).length].join('|');
  if(PG_SD && PG_SD.sig === sig) return PG_SD;
  var p2 = function(n){ return String(n).padStart(2, '0'); };
  var dOf = function(k){ var a = String(k).slice(0, 10).split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
  var kOf = function(d){ return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); };
  var addD = function(k, n){ var d = dOf(k); d.setDate(d.getDate() + n); return kOf(d); };
  var dd = function(a, b){ return Math.round((dOf(b) - dOf(a)) / 86400000); };
  var wf = function(k){ var g = dOf(k).getDay(); return g === 0 ? 0 : g === 6 ? .5 : 1; };
  var wdIn = function(a, b){ var n = 0; for(var k = a; k <= b; k = addD(k, 1)) n += wf(k); return n; };
  var TODAY = todayStr(), FUT = '9999-12-31', RATE = laborRate();
  /* people: initials as keys */
  var TN = rtTechs().filter(function(n){ return n && String(n).trim(); }), TECHS = [], PPL = {}, NK = {};
  TN.forEach(function(n){ var k = PG.ini(n), i = 2; while(PPL[k] && !techSame(PPL[k], n)){ k = PG.ini(n).slice(0, 1) + (String(n).split(/\s+/).pop()[1] || i).toString().toUpperCase(); if(PPL[k]) k = PG.ini(n) + (i++); } PPL[k] = n; NK[n.toLowerCase()] = k; TECHS.push(k); });
  staffList().forEach(function(sf){ if(!sf || !sf.name || !String(sf.name).trim()) return; if(NK[sf.name.toLowerCase()]) return; var k = PG.ini(sf.name), i = 2; while(PPL[k]) k = PG.ini(sf.name) + (i++); PPL[k] = sf.name; NK[sf.name.toLowerCase()] = k; });
  var keyOf = function(n){ n = String(n || '').trim(); if(!n) return TECHS[0] || '—'; var k = NK[n.toLowerCase()]; if(k) return k; for(var x in PPL) if(techSame(PPL[x], n)) return x; k = PG.ini(n); var i = 2; while(PPL[k] && !techSame(PPL[k], n)) k = PG.ini(n) + (i++); PPL[k] = n; NK[n.toLowerCase()] = k; return k; };
  /* hours per tech per day */
  var TB = {}, ATT = {}, SH = {}, BAYU = {};
  TECHS.forEach(function(t){ TB[t] = {}; ATT[t] = {}; SH[t] = {}; });
  var put = function(M, t, k, h){ (M[t] = M[t] || {})[k] = (M[t][k] || 0) + h; };
  STATE.punches.forEach(function(p){ var t = keyOf(punchWho(p)), k = localDay(p.start), h = Math.max(0, ((p.stop ? new Date(p.stop) : Date.now()) - new Date(p.start)) / 3600000); if(h > 16) h = 16;
    if(isShopPunch(p)) put(SH, t, k, h); else put(TB, t, k, h); });
  /* the day clock: whose it is — the punches inside it tell, for clocks from before Parsec kept who */
  shiftList().forEach(function(s){ var h = Math.max(0, ((s.out ? new Date(s.out) : (localDay(s.in) === TODAY ? Date.now() : new Date(s.in).getTime())) - new Date(s.in)) / 3600000); if(h > 16) h = 16; var k = localDay(s.in), who = [];
    if(s.by) who = [keyOf(s.by)]; else { var a = new Date(s.in).getTime() - 60000, b = s.out ? new Date(s.out).getTime() : Date.now(); STATE.punches.forEach(function(p){ var x = new Date(p.start).getTime(); if(x >= a && x <= b){ var w = keyOf(punchWho(p)); if(who.indexOf(w) < 0) who.push(w); } }); if(!who.length && STATE.techName) who = [keyOf(STATE.techName)]; }
    who.forEach(function(t){ put(ATT, t, k, h); }); });
  /* a day with punches and no day clock counts its punches as on the clock */
  Object.keys(TB).concat(Object.keys(SH)).forEach(function(t){ var days = {}; Object.keys(TB[t] || {}).forEach(function(k){ days[k] = 1; }); Object.keys(SH[t] || {}).forEach(function(k){ days[k] = 1; });
    Object.keys(days).forEach(function(k){ var on = (TB[t] && TB[t][k] || 0) + (SH[t] && SH[t][k] || 0); ATT[t] = ATT[t] || {}; if(!(ATT[t][k] >= on)) ATT[t][k] = Math.max(ATT[t][k] || 0, on); }); });
  /* the ROs */
  var fixSeen = {}; try{ fixAll().forEach(function(e){ var k = fixKeyOf(e.complaint); if(k) fixSeen[k] = (fixSeen[k] || 0) + 1; }); }catch(e){}
  var ROS = [], first = TODAY;
  /* what a part cost us: typed on the line at check-in, else the catalog item's cost */
  var catCost = {}; try{ invList().forEach(function(it){ if(!it.kit && +it.cost > 0) catCost[invPnKey(it.pn)] = +it.cost; }); }catch(e){}
  var costOf = function(pt){ if(+pt.cost > 0) return +pt.cost; var c = catCost[invPnKey(pt.partNumber)]; return c > 0 ? c : null; };
  var stMap = function(ro){ var s = roStatus(ro), n = typeof s === 'string' ? s : s.status || '', sub = (s && s.sub) || '';
    if(/Parts/.test(n)) return 'Waiting on parts'; if(/Approval|Customer/.test(n)) return 'Waiting approval'; if(/Tech Support|Warranty/.test(n)) return 'Warranty auth'; if(/Road test/.test(n)) return 'Road test';
    if(/Diagnos/.test(n + ' ' + sub)) return 'Diagnosing'; if(!STATE.punches.some(function(p){ return p.roId === ro.id; })) return 'Checked in'; return 'In progress'; };
  STATE.ros.forEach(function(ro){
    if(ro.id === SHOP_RO_ID || ro.shop || !ro.dateOpened) return;
    var open = localDay(ro.dateOpened), done = roIsDone(ro), close = done ? localDay(ro.dateClosed || (ro.status && ro.status.setAt) || ro.dateOpened) : FUT;
    if(close < open) close = open; if(open < first) first = open;
    var tech = keyOf(ro.assignedTech), anyW = !!ro.warranty, ops = [], lines = 0, prt = 0, pcost = 0, pknown = 0, miss = 0, dec = 0, est = false, decl = false, apprAt = null, pwA = null, pwB = null, lateNow = false, cb = 0, wo = 0, cl = null;
    (ro.operations || []).forEach(function(op){
      var jt = opJobType(op), money = opMoney(op);
      if(op.declined || (op.appr && op.appr.s === 'no')){ dec += money.total; decl = true; return; }
      if(!op.appr && +op.quoted > 0 && ['WARR', 'RECALL'].indexOf(jt) < 0 && !anyW) est = true;
      if(op.appr && op.appr.at){ est = true; if(!apprAt || op.appr.at > apprAt) apprAt = op.appr.at; }
      if(jt === 'WARR' || jt === 'RECALL') anyW = true;
      var ps = opPunches(op.id), byT = {}; ps.forEach(function(p){ var w = keyOf(punchWho(p)); byT[w] = (byT[w] || 0) + ((p.stop ? new Date(p.stop) : Date.now()) - new Date(p.start)); });
      var ot = Object.keys(byT).sort(function(a, b){ return byT[b] - byT[a]; })[0] || tech;
      var q = +op.quoted || 0, b = Math.round((opCalc(op).burntHrs || 0) * 100) / 100;
      opRealParts(op).forEach(function(pt){ lines++; var qn = parseFloat(pt.qty) || 1, pr = priceOf(pt.price) || 0; prt += qn * pr; var cu = costOf(pt); if(cu != null){ pcost += qn * cu; pknown += qn * pr; }
        var ord = (pt.sup && pt.sup !== 'stock') || pt.ordAt || pt.status === 'Ordered' || pt.status === 'Backordered'; if(ord) miss++;
        var a = pt.ordAt ? localDay(pt.ordAt) : (pt.status === 'Ordered' || pt.status === 'Backordered') && pt.statusChangedAt ? localDay(pt.statusChangedAt) : null;
        if(a){ var z = pt.rcvAt ? localDay(pt.rcvAt) : pxPartIn(pt) ? localDay(pt.statusChangedAt || nowIso()) : FUT; if(!pwA || a < pwA) pwA = a; if(!pwB || z > pwB) pwB = z; }
        if(!pxPartIn(pt) && ((pt.status === 'Backordered') || (pt.status === 'Ordered' && pt.eta && pt.eta < TODAY))) lateNow = true; });
      if(op.claim){ var c = op.claim, filed = c.submittedAt ? localDay(c.submittedAt) : null;
        if(filed){ var dec0 = c.paidAt ? localDay(c.paidAt) : c.deniedAt ? localDay(c.deniedAt) : FUT, rej = c.status === 'denied'; cl = cl || { filed: filed, amt: 0, rej: rej, payD: dec0 !== FUT ? dd(filed, dec0) : 0, dec: dec0 }; cl.amt += +c.amount || money.total; if(rej) wo += +c.amount || 0; } }
      if(jt === 'COMEBACK') cb = cb || 1;
      if(q > 0 || b > 0) ops.push({ id: op.id, t: jt === 'DIAG' ? 'diag' : jt === 'PM' ? 'pm' : (jt === 'WARR' || jt === 'RECALL') ? 'war' : 'rep', q: q, b: b, tech: ot, fixA: jt !== 'DIAG' && jt !== 'PM' && (fixSeen[fixKeyOf(op.complaint)] || 0) > (opDoneNow(op) ? 1 : 0), fixU: !!(op.fxUse || op.cxFix || op.fxQ), cmp: op.complaint || '', op: op });
    });
    if(cb && ro.vin){ var prev = STATE.ros.filter(function(x){ return x !== ro && x.vin === ro.vin && x.dateClosed && x.dateClosed < ro.dateOpened; }).sort(function(a, b){ return a.dateClosed < b.dateClosed ? 1 : -1; })[0]; cb = prev ? Math.max(1, dd(localDay(prev.dateClosed), open)) : 0; }
    var ps0 = STATE.punches.filter(function(p){ return p.roId === ro.id; }).map(function(p){ return new Date(p.start).getTime(); }).sort(function(a, b){ return a - b; })[0];
    var fc = ps0 ? Math.max(0, (ps0 - new Date(ro.dateOpened)) / 3600000) : (done ? null : Math.max(0, (Date.now() - new Date(ro.dateOpened)) / 3600000));
    var Q = ops.reduce(function(s, o){ return s + o.q; }, 0), B = ops.reduce(function(s, o){ return s + o.b; }, 0);
    var wd = Math.max(1, wdIn(open, close === FUT ? TODAY : close)), prom = ro.promisedAt ? Math.max(1, wdIn(open, localDay(ro.promisedAt))) : wd;
    var rets = (Array.isArray(STATE.returns) ? STATE.returns : []).filter(function(t){ return t.ro === ro.id && t.kind !== 'warranty' && +t.credit > 0; });
    var cr = rets.reduce(function(s, t){ return s + (+t.credit || 0); }, 0), crAt = rets.length ? (rets.every(function(t){ return t.st === 'credited'; }) ? localDay(rets.map(function(t){ return t.creditedAt || nowIso(); }).sort().pop()) : FUT) : null;
    var lab = Math.round(Q * RATE); prt = Math.round(prt); var payc = 0, payk = 0; ops.forEach(function(o){ var pr = PG.payOf(PPL[o.tech] || o.tech); if(pr > 0){ payc += o.b * pr; payk += o.b; } });
    var tm = typeof truckYM === 'function' ? truckYM(ro) : null;
    var r = { id: ro.id, no: tgNum(ro), open: open, close: close, pay: anyW ? 'w' : (ro.internal ? 'int' : 'cp'), cust: ro.customerName || '—', truck: (tm && tm.line) || [ro.year, ro.model].filter(Boolean).join(' ') || '—', unit: ro.unitNumber || '—', tech: tech, ops: ops,
      lines: lines, miss: miss, pw: pwA ? Math.max(0, wdIn(pwA, pwB === FUT ? TODAY : pwB) - 1) : 0, pwWin: pwA ? [pwA, pwB] : null, late: lateNow, est: est, appr: est && !decl, aw: apprAt ? Math.max(0, Math.round((new Date(apprAt) - new Date(ro.estSentAt || ro.dateOpened)) / 360000) / 10) : 0, dec: Math.round(dec),
      fc: fc == null ? 0 : Math.round(fc * 10) / 10, prom: prom, wd: wd, pk: 0, cb: cb, wo: Math.round(wo), cl: cl, cr: Math.round(cr), crAt: crAt, lab: lab, prt: prt, pcost: Math.round(pcost), pknown: Math.round(pknown), payc: Math.round(payc), payk: Math.round(payk * 100) / 100, sales: lab + prt, q: Math.round(Q * 10) / 10, b: Math.round(B * 10) / 10, status: done ? 'Closed' : stMap(ro), ro: ro };
    ops.forEach(function(o){ o.r = r; });
    ROS.push(r);
  });
  ROS.sort(function(a, b){ return a.open < b.open ? -1 : a.open > b.open ? 1 : 0; });
  /* repeat customers */
  var byC = {}; ROS.forEach(function(r){ (byC[r.cust] = byC[r.cust] || []).push(r.open); }); ROS.forEach(function(r){ r.rep = byC[r.cust].some(function(d){ return d < r.open && d >= addD(r.open, -90); }); });
  var START = first < addD(TODAY, -730) ? addD(TODAY, -730) : first;
  if(START > addD(TODAY, -60)) START = addD(TODAY, -60);
  var BAYS = 8; try{ var bs = (typeof tgSpots === 'function' ? tgSpots() : []).filter(function(s){ return /^Bay/.test(s.id || s); }); if(bs.length) BAYS = bs.length; }catch(e){}
  for(var k = START; k <= TODAY; k = addD(k, 1)){ var f = wf(k); if(!f) continue; var tot = 0; Object.keys(TB).forEach(function(t){ tot += TB[t][k] || 0; }); BAYU[k] = Math.min(100, tot * 1.3 / (BAYS * (f === 1 ? 9.5 : 5)) * 100); }
  var BYC = {}, BYO = {}; ROS.forEach(function(r){ (BYC[r.close] = BYC[r.close] || []).push(r); (BYO[r.open] = BYO[r.open] || []).push(r); });
  var CS = {}; ROS.forEach(function(r){ CS[r.cust] = (CS[r.cust] || 0) + r.sales; }); var CUST = Object.keys(CS).filter(function(c){ return c !== '—'; }).sort(function(a, b){ return CS[b] - CS[a]; });
  TECHS.forEach(function(t){ TB[t] = TB[t] || {}; ATT[t] = ATT[t] || {}; });
  PG_SD = { sig: sig, ROS: ROS, TB: TB, ATT: ATT, SH: SH, BAYU: BAYU, BYC: BYC, BYO: BYO, TECHS: TECHS, PPL: PPL, NK: NK, keyOf: keyOf, CUST: CUST, START: START, TODAY: TODAY, RATE: RATE, BAYS: BAYS, FUT: FUT };
  return PG_SD;
}
