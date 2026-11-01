/* Parsec · ro · forecast.js
   When will this RO be ready: roForecast asks the RO engine (window.RoMath, src/engine/ro-engine.js) with the shop calendar, each tech's pace and parts' ETAs.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   wallStr wallDate fcPay fcHasCause fcHasFix fcPartIn fcOpComplete techPace roForecast fcWhen RM SHOP_CAL … (10 functions, 4 constants)
   state      punches ros
   uses       clock/ kit/ state/
*/
/* ============================== RO FORECAST ==============================
   The RO engine (ro-engine.js → window.RoMath) does the math. This turns what TEC
   already records — operations, quotes, punches, notes, parts and statuses — into the
   engine's RO, so there is nothing new to type. Shop hours: 07:00-16:00, lunch 11:30. */
var RM = (typeof window !== "undefined" && window.RoMath) || null;
var SHOP_CAL = RM ? RM.SHOP_CALENDAR : null;
function wallStr(d){
  var p = function(n){ return String(n).padStart(2, "0"); };
  return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"T"+p(d.getHours())+":"+p(d.getMinutes());
}
/* engine minutes are wall-clock minutes written as UTC; read them back as local time */
function wallDate(min){ var d = new Date(min * 60000); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()); }
function fcPay(ro, op){
  /* WARR and RECALL are always the OEM's. A warranty RO makes its diag and repair jobs warranty
     only while none is typed WARR/RECALL — once one is, the rest of a mixed RO is customer pay. */
  var t = opJobType(op);
  if(t === "RECALL") return "recall";
  if(t === "WARR") return "warranty";
  if(t === "COMEBACK") return "internal";
  if(ro.warranty && (t === "DIAG" || t === "OP") && !(ro.operations || []).some(function(o){ var k = opJobType(o); return k === "WARR" || k === "RECALL"; })) return "warranty";
  return "customer";
}
function fcHasCause(op){ return !!String(op.cause || "").trim() || (op.log || []).some(function(l){ return l.kind === "cause" && String(l.text || "").trim(); }); }
function fcHasFix(op){ return !!String(op.correction || "").trim() || (op.log || []).some(function(l){ return l.kind === "fix" && String(l.text || "").trim(); }); }
function fcPartIn(p){ return pxPartIn(p); }
function fcOpComplete(op){
  var st = opStatus(op); st = typeof st === "string" ? st : st.status;
  return /^Complete/.test(st || "");
}
/* The tech's pace on quoted work, from his finished jobs (needs 10 quoted hours before it moves off 1.0). */
function techPace(name){
  if(!RM || !name) return 1;
  var rows = [];
  STATE.ros.forEach(function(r){
    if(r.assignedTech !== name || r.id === SHOP_RO_ID) return;
    (r.operations || []).forEach(function(op){
      if(op.declined || !(op.quoted > 0) || !(fcOpComplete(op) || fcHasFix(op))) return;
      var b = opCalc(op).burntHrs;
      if(b > 0) rows.push({ stdMin: op.quoted * 60, workedMin: b * 60 });
    });
  });
  return RM.pace(rows);
}
/* what each stage popover lists: [engine step number, words]. The app ticks what it can see; the rest are the tech's. */
var STAGE_STEPS = {
  checkin:  [[0, "Unit connected / DTC read"], [1, "Dash photo"], [2, "Location set"]],
  approval: [[0, "Estimate reviewed"], [1, "Estimate sent"], [2, "Customer approved"]],
  parts:    [[0, "Parts looked up"], [1, "Parts in hand"], [2, "Parts delivered / installed"]],
  closeout: [[0, "Cause and fix on all operations"], [1, "Pictures uploaded"], [2, "DTC uploaded"], [3, "RO released"], [4, "Parts installed"]]
};
var FC_CACHE = { key: null, val: null };
/* Build the engine RO from a TEC RO and forecast it. null for the shop RO or without the engine. */
function roForecast(ro, nowDate){
  if(!RM || !ro || ro.id === SHOP_RO_ID || ro.shop || roStatus(ro).status === "Declined") return null;
  var now = nowDate || new Date();
  var minuteKey = Math.floor(now.getTime() / 60000);
  var key = ro.id + "|" + minuteKey + "|" + (STATE.punches.length) + "|" + JSON.stringify([ro.status, ro.operations, ro.assignedTech, ro.checklist, ro.location, ro.dateClosed, ro.promisedAt, ro.warranty, ro.stageTicks]);
  if(FC_CACHE.key === key) return FC_CACHE.val;
  var ops = (ro.operations || []).filter(function(op){ return op && op.id; });
  if(!ops.length){ FC_CACHE = { key: key, val: null }; return null; }
  var rs = roStatus(ro), rsName = rs.status, setAt = ro.status && ro.status.setAt ? wallStr(new Date(ro.status.setAt)) : null;
  var released = rsName === "Complete – Released" || !!ro.dateClosed;
  var roPunches = STATE.punches.filter(function(p){ return p.roId === ro.id; });
  var anyPunch = roPunches.length > 0;
  var totalQ = ops.reduce(function(s, op){ return s + (op.declined ? 0 : (+op.quoted || 0)); }, 0);
  var spec = { id: ro.roNumber || ro.id, walkIn: true, roadTest: totalQ >= 8 ? "heavy" : totalQ >= 4 ? "medium" : "light", jobs: [] };
  ops.forEach(function(op){
    var t = opJobType(op), q = +op.quoted || 0, isDiag = t === "DIAG" || t === "COMEBACK";   /* comeback starts on Diag */
    spec.jobs.push({ id: op.id, name: op.complaint || "Operation", payType: fcPay(ro, op),
      diagHrs: isDiag ? q : 0, repairHrs: isDiag ? 0 : q, needsParts: (op.parts || []).length > 0 });
  });
  var e = RM.openRO(spec);
  var A = function(ev){ try { RM.apply(e, ev); } catch(err){} };
  var item = function(kind, job){ return e.items.filter(function(i){ return i.kind === kind && (job === undefined || i.job === job) && !i.voided; })[0]; };
  var autoN = {}, manualPhase = false;   /* how many items had each step ticked by the app itself */
  var mark = function(it, k){ if(!manualPhase){ var kk = it.kind + ":" + k; autoN[kk] = (autoN[kk] || 0) + 1; } };
  var fill = function(it){ if(it){ A({ type: "step", item: it.id, n: it.weights.length }); for(var q = 0; q < it.weights.length; q++) mark(it, q); } };
  var check = function(it, k){ if(it){ A({ type: "check", item: it.id, step: k }); mark(it, k); } };

  /* check-in and dispatch */
  var ci = item("checkin"), ck = ro.checklist || {};
  if(anyPunch) fill(ci);
  else {
    if(ck.connectUnit || ck.uploadDtc) check(ci, 0);
    if(ck.initialDashPic || (ro.attachments || []).length) check(ci, 1);
    if(ro.location || ck.updateLocation) check(ci, 2);
    check(ci, 3);
  }
  if(ro.assignedTech || anyPunch) fill(item("dispatch"));

  /* each operation: diag, parts, repair, and the clocked time on each */
  var customerDiag = false, approvedSignal = false, roadLabor = 0, now0 = Date.now();
  ops.forEach(function(op){
    var dg = item("diag", op.id), rp = item("repair", op.id), pt = item("parts", op.id);
    var ps = opPunches(op.id), done = fcOpComplete(op) || released;
    var mins = function(p){ return Math.max(0, ((p.stop ? new Date(p.stop) : now0) - new Date(p.start)) / 60000); };
    var dMin = 0, rMin = 0, repairPunch = false;
    if(typeof op.burnt === "number"){
      var tot = opCalc(op).burntMs / 60000;
      if(dg && !rp.min) dMin = tot; else rMin = tot;
      repairPunch = !dg && tot > 0;
    } else ps.forEach(function(p){
      var r = p.startReason || "";
      if(r === "Diagnosing") dMin += mins(p);
      else if(r === "Testing") roadLabor += mins(p);
      else { rMin += mins(p); repairPunch = true; }
    });
    if(dg && !(rp && rp.min > 0)){ dMin += rMin; rMin = 0; }      /* a diag job: all its time is diag */
    if(fcPay(ro, op) === "customer" && dg) customerDiag = true;
    if((repairPunch || (op.appr && op.appr.s === "ok")) && fcPay(ro, op) === "customer") approvedSignal = true;   /* Parsec 14 */
    if(dg){
      if(dMin) A({ type: "labor", item: dg.id, min: dMin });
      if(ps.length) check(dg, 0);
      if(ps.some(function(p){ return String(p.notes || "").trim(); })) check(dg, 4);
      if(fcHasCause(op) || done || repairPunch || (op.parts || []).some(function(p){ return p.status && p.status !== "Not Ordered"; })) fill(dg);
    }
    if(rp){
      if(rMin) A({ type: "labor", item: rp.id, min: rMin });
      var partsIn = (op.parts || []).every(fcPartIn);
      if(partsIn && repairPunch) check(rp, 0);
      if(done || fcHasFix(op)) fill(rp);
    }
    if(pt){
      var parts = op.parts || [];
      check(pt, 0);
      if(parts.every(fcPartIn)) check(pt, 1);
      if(parts.every(function(p){ return p.status === "Installed"; }) || (parts.every(fcPartIn) && repairPunch)) check(pt, 2);
      parts.forEach(function(p, i){
        if(fcPartIn(p)) return;
        var h = { type: "hold", id: "pt-" + op.id + "-" + i, kind: "parts", job: op.id };
        if(p.status === "Not Ordered" || !p.status) h.ordered = false;
        else if(p.eta) h.eta = p.eta + "T08:00";
        else if(p.statusChangedAt) h.since = wallStr(new Date(p.statusChangedAt));
        A(h);
      });
    }
    /* a job held on the foreman, tech support or a sublet shop */
    var os = opStatus(op), osn = typeof os === "string" ? os : os.status;
    var lastP = ps.length ? ps[ps.length - 1] : null, since = lastP && lastP.stop ? wallStr(new Date(lastP.stop)) : setAt;
    if(osn === "Waiting – Foreman") A({ type: "hold", id: "fm-" + op.id, kind: "foreman", job: op.id, since: since });
    if(osn === "Waiting – Tech Support") A({ type: "hold", id: "ts-" + op.id, kind: "techsupport", job: op.id, since: since });
    if(osn === "Waiting – Approval") A({ type: "hold", id: "ap-" + op.id, kind: "customer", since: since });
    if(opJobType(op) === "SUBLET" && !done) A({ type: "hold", id: "sb-" + op.id, kind: "sublet", job: op.id, since: ps.length ? wallStr(new Date(ps[0].start)) : setAt });
    if(op.declined) A({ type: "decline", job: op.id });
  });

  /* customer approval: pre-quoted work is approved at write-up; diag findings need a yes */
  var ap = item("approval");
  if(ap){
    var waitingCust = rsName === "Waiting – Customer" || ops.some(function(op){ var s = opStatus(op); return (typeof s === "string" ? s : s.status) === "Waiting – Approval"; });
    if(!customerDiag || approvedSignal || released || /^Complete/.test(rsName)) fill(ap);
    else if(waitingCust){ check(ap, 0); check(ap, 1); }
  }
  if(rsName === "Waiting – Customer") A({ type: "hold", id: "ro-cust", kind: "customer", since: setAt });
  if(rsName === "Waiting – Foreman") A({ type: "hold", id: "ro-fm", kind: "foreman", since: setAt });
  if(rsName === "Waiting – Tech Support") A({ type: "hold", id: "ro-ts", kind: "techsupport", since: setAt });

  /* road test, close-out, pickup */
  var rt = item("roadtest");
  if(rt){
    if(roadLabor) A({ type: "labor", item: rt.id, min: roadLabor });
    if(rsName === "Complete – Road test") check(rt, 0);
    if(released) fill(rt);
  }
  var co = item("closeout"), live = ops.filter(function(op){ return !op.declined; });
  if(co){
    if(live.length && live.every(function(op){ return fcHasCause(op) && fcHasFix(op); })) check(co, 0);
    if(ck.uploadPics) check(co, 1);
    if(ck.uploadDtc) check(co, 2);
    if(released) check(co, 3);
    if(live.every(function(op){ return (op.parts || []).every(function(p){ return p.status === "Installed"; }); })) check(co, 4);
    if(released) fill(co);
  }
  if(ro.dateClosed) fill(item("pickup"));
  /* steps the tech ticked by hand in a stage popover */
  manualPhase = true;
  var tickMap = ro.stageTicks || {};
  Object.keys(tickMap).forEach(function(key){
    if(!tickMap[key]) return;
    var pr = key.split(":");
    e.items.filter(function(i){ return i.kind === pr[0] && !i.voided; }).forEach(function(i){ check(i, +pr[1]); });
  });
  var stageSteps = {};
  Object.keys(STAGE_STEPS).forEach(function(g){
    var its = e.items.filter(function(i){ return i.kind === g && !i.voided && i.min > 0; });
    stageSteps[g] = !its.length ? [] : STAGE_STEPS[g].map(function(sp){
      var on = its.every(function(i){ return sp[0] < i.done || (i.checks || []).indexOf(sp[0]) > -1; });
      return { key: g + ":" + sp[0], label: sp[1], on: on, auto: on && (autoN[g + ":" + sp[0]] || 0) >= its.length };
    });
  });

  /* when the tech can get to it: free now, or after the job he is clocked on elsewhere */
  var nowS = wallStr(now), techFreeAt = null, run = ro.assignedTech ? runningPunchOfPerson(ro.assignedTech) : null;
  if(run && run.roId !== ro.id && ro.assignedTech){
    var rOp = null; STATE.ros.some(function(r){ if(r.id !== run.roId) return false; rOp = (r.operations || []).filter(function(o){ return o.id === run.opId; })[0]; return true; });
    var left = rOp ? Math.max(0.5, (+rOp.quoted || 0) - opCalc(rOp).burntHrs) : 0.5;
    techFreeAt = wallStr(wallDate(RM.addShopMinutes(nowS, Math.round(left * 60), SHOP_CAL)));
  }
  var opts = { cal: SHOP_CAL, pace: techPace(ro.assignedTech), techFreeAt: techFreeAt };
  if(ro.promisedAt) opts.promisedAt = wallStr(new Date(ro.promisedAt));
  var f;
  try { f = RM.forecast(e, nowS, opts); } catch(err){ FC_CACHE = { key: key, val: null }; return null; }
  var byJob = {}; ops.forEach(function(op){ byJob[op.id] = op; });
  var out = {
    pct: f.percent, likely: wallDate(f.likely), latest: wallDate(f.latest), workLeftMin: f.workLeftMin,
    lateByMin: f.lateByMin, pace: opts.pace, ready: f.percent >= 99.95,
    waits: f.waits.map(function(w){ return { kind: w.kind, op: w.job ? byJob[w.job] : null, until: wallDate(w.to) }; }),
    /* the budget by stage, for the weighted bar */
    stages: (function(){
      var order = ["checkin","dispatch","diag","approval","parts","repair","roadtest","closeout"], g = {};
      e.items.forEach(function(it){ if(it.voided || !(it.min > 0)) return; var s = it.stage; if(!g[s]) g[s] = { stage: s, min: 0, earned: 0 }; g[s].min += it.min; g[s].earned += it.min * RM.frac(it); });
      return order.filter(function(s){ return g[s]; }).map(function(s){ return g[s]; });
    })(),
    steps: stageSteps, engine: e, raw: f
  };
  FC_CACHE = { key: key, val: out };
  return out;
}
if(typeof window !== "undefined") window.TEC_FORECAST = function(roId){ return roForecast(getRO(roId)); };   /* for checking a forecast from the browser console */
/* "Today 2:05 PM", "Tomorrow 8:00 AM", "Tue 1:05 PM", "Oct 28 9:00 AM" */
function fcWhen(d){
  if(!d) return "—";
  var t = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  var a = new Date(); a.setHours(0,0,0,0);
  var b = new Date(d); b.setHours(0,0,0,0);
  var days = Math.round((b - a) / 86400000);
  if(days === 0) return "Today " + t;
  if(days === 1) return "Tomorrow " + t;
  if(days > 1 && days < 7) return d.toLocaleDateString([], { weekday: "short" }) + " " + t;
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + t;
}
