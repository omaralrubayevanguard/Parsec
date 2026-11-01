/* Parsec · sample · history.js
   Six weeks of finished work behind the 25 sample ROs, so the Time Log, Career and Manager have history.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pgSampleHistory (1 function)
   state      goals punches ros shifts
   uses       clock/ data/ pages/assets/ ro/ state/
*/
/* ============================== Sample history — six weeks of finished work behind the 25 sample ROs ==============================
   So the Time Log weeks, Career and Manager have something to show: each technician's workdays with a day
   clock (lunch off the clock), closed ROs with finished operations, punches with notes, a few comebacks. */
function pgSampleHistory(techs, rnd){
  if(!techs || !techs.length) return;
  var pick = function(a){ return a[Math.floor(rnd() * a.length)]; };
  var JOBS = Object.keys(S25_JOBS).filter(function(k){ var J = S25_JOBS[k]; return J.q && J.t !== "PM"; });
  var skill = {}; techs.forEach(function(t, i){ skill[t] = [0.88, 1.0, 1.12, 0.95, 1.05][i % 5]; });
  var used = {}; STATE.ros.forEach(function(r){ used[String(r.roNumber)] = 1; });
  var busy = {}; STATE.punches.forEach(function(p){ var t = p.by; if(!t) return; (busy[t] = busy[t] || {})[localDay(p.start)] = 1; });
  (Array.isArray(STATE.shifts) ? STATE.shifts : []).forEach(function(sh){ if(sh.in) (busy._any = busy._any || {})[localDay(sh.in)] = 1; });
  var ros = [], punches = [], shifts = [], today = new Date(); today.setHours(0, 0, 0, 0);
  var at = function(d, m){ var x = new Date(d); x.setHours(0, 0, 0, 0); x.setMinutes(m); return x; };
  techs.forEach(function(t, ti){
    var mine = busy[t] || {};
    for(var back = 46; back >= 1; back--){
      var d = new Date(today); d.setDate(d.getDate() - back); if(d.getDay() === 0 || d.getDay() === 6) continue;
      var k = localDay(d.toISOString()); if(mine[k] || (busy._any || {})[k]) continue;   /* the days the sample already has stay as they are */
      if(rnd() < 0.06) continue;                                     /* a day off now and then */
      var inM = 420 + Math.floor(rnd() * 16) - 5, lunchM = 690 + Math.floor(rnd() * 30), outM = 930 + Math.floor(rnd() * 25) - 8;
      shifts.push({ id: uid("sh"), in: at(d, inM).toISOString(), out: at(d, lunchM).toISOString(), outReason: "Lunch", by: t, sample: true });
      shifts.push({ id: uid("sh"), in: at(d, lunchM + 30).toISOString(), out: at(d, outM).toISOString(), outReason: "End of day", by: t, sample: true });
      /* one RO for the day, two or three operations; a little shop time and some air between */
      var n; do { n = "RO-" + (20000 + Math.floor(rnd() * 9999)); } while(used[n]); used[n] = 1;
      var comeback = rnd() < 0.05, yr = 2016 + Math.floor(rnd() * 8), tk = s25Truck(rnd, yr);
      var ro = { id: uid("ro"), roNumber: n, customerName: pick(S25_CUST), caseNumber: "", dateOpened: at(d, inM - 90 - Math.floor(rnd() * 600)).toISOString(), dateClosed: at(d, outM + 20).toISOString(),
        vin: s25Vin(yr, rnd), mileage: String((120 + Math.floor(rnd() * 660)) * 1000), engineHours: String(4000 + Math.floor(rnd() * 22000)), engineType: pick(["D13 · 405 HP", "D13 · 455 HP", "D13 TC · 455 HP", "D13 · 500 HP", "D11 · 405 HP"]), model: tk.model, year: tk.year, make: "Volvo", axles: tk.axles, cab: tk.cab, sleeper: tk.sleeper, unitNumber: "T-" + (100 + Math.floor(rnd() * 899)),
        keyTag: "", location: "", buildDate: "", warrantyStart: "", techSupportCase: "", warranty: false, assignedTech: t, checklist: {}, attachments: [], operations: [], bulletins: [], history: [],
        status: { status: "Complete – Released", sub: null, setAt: at(d, outM + 20).toISOString() }, _lastKnownStatus: "Complete – Released", checklistPopupPending: false, sample: true, hist: true };
      var cur = inM + 8 + Math.floor(rnd() * 10), nOps = 2 + (rnd() < 0.4 ? 1 : 0);
      for(var oi = 0; oi < nOps; oi++){
        var J = S25_JOBS[pick(JOBS)];
        var op = { id: uid("op"), complaint: J.c, cause: J.cause || "", correction: J.fix || "", log: [], quoted: J.q, isStandard: false, standardName: null, declined: false, parts: [], jobType: comeback && oi === 0 ? "COMEBACK" : J.t };
        (J.parts || []).forEach(function(pd){ op.parts.push({ id: uid("pt"), description: pd[0], partNumber: pd[1], qty: String(pd[2]), price: S25_PRICE[pd[1]] ? String(S25_PRICE[pd[1]]) : "", status: "Installed", eta: "", statusChangedAt: at(d, cur).toISOString() }); });
        var mins = Math.max(15, Math.round(J.q * 60 * skill[t] * (0.8 + rnd() * 0.4)));
        if(cur + mins > (cur < lunchM ? lunchM : outM) && cur < lunchM) cur = lunchM + 30 + Math.floor(rnd() * 6);
        if(cur + mins > outM - 5) mins = Math.max(15, outM - 5 - cur);
        if(mins < 15) break;
        var s0 = cur;
        if(s0 < lunchM && s0 + mins > lunchM){            /* split around lunch */
          punches.push({ id: uid("pn"), roId: ro.id, opId: op.id, start: at(d, s0).toISOString(), stop: at(d, lunchM).toISOString(), startReason: J.t === "DIAG" ? "Diagnosing" : "Repairing", stopReason: "Lunch", notes: J.cause || "Worked it.", by: t, sample: true });
          var rest = mins - (lunchM - s0); s0 = lunchM + 30; mins = rest; }
        punches.push({ id: uid("pn"), roId: ro.id, opId: op.id, start: at(d, s0).toISOString(), stop: at(d, s0 + mins).toISOString(), startReason: J.t === "DIAG" ? "Diagnosing" : "Repairing", stopReason: "Complete", notes: J.fix || J.cause || "Done.", by: t, sample: true });
        ro.operations.push(op);
        cur = s0 + mins + 6 + Math.floor(rnd() * 25);
      }
      if(!ro.operations.length) continue;
      /* shop time to round out the afternoon */
      if(cur < outM - 40 && rnd() < 0.6){ var so = pick(SHOP_OPS); punches.push({ id: uid("pn"), roId: SHOP_RO_ID, opId: so[0], start: at(d, cur).toISOString(), stop: at(d, Math.min(outM - 6, cur + 20 + Math.floor(rnd() * 25))).toISOString(), startReason: "Shop time", stopReason: "Switched job", notes: "", by: t, sample: true }); }
      ros.push(ro);
    }
  });
  try{ asSampleFleet(ros); }catch(e){ console.error(e); }   /* Parsec 14 */
  STATE.ros = STATE.ros.concat(ros);
  STATE.punches = STATE.punches.concat(punches);
  STATE.shifts = shiftList().concat(shifts);
  ros.forEach(function(r){ try{ migrateRO(r); }catch(e){} });
  /* the shop's goals, so the Manager page has lines to measure against */
  STATE.goals = STATE.goals || {};
  if(!STATE.goals._shop) STATE.goals._shop = { closedDay: 4, eff: 95, comebacks: 3 };
  return ros.length;
}
