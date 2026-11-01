/* Parsec · ro · stages.js
   The six RO stages (Check-in → Close-out), each with one “done when” rule; roStages(ro) says where an RO stands, stageToggle checks one off by hand.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   rsShort rsDur rsMax roStages stageToggle RS_KEYS RS_NAME (5 functions, 2 constants)
   state      punches
   uses       access/ data/ kit/ pages/ pages/warranty/ shell/ state/
*/
/* ============================== RO STAGES — equal steps, one "done when" each ==============================
   1 Check-in   unit connected / DTCs read, dash photo, location set — or the first punch
   2 Diag       cause written on every DIAG operation                  (not needed: no DIAG op)
   3 Approval   every customer-pay op approved or declined             (not needed: warranty / internal only)
   4 Parts      every part received                                    (not needed: no parts)
   5 Repair     every operation Complete
   6 Road test  road test logged as Pass
   7 Close-out  cause + correction on every op, pictures, RO released
   Ticks made by hand in a stage's checklist count too. */
var RS_KEYS = ["checkin","diag","approval","parts","repair","roadtest","closeout"];
var RS_NAME = { checkin: "Check-in", diag: "Diag", approval: "Approval", parts: "Parts", repair: "Repair", roadtest: "Road test", closeout: "Close-out" };
function rsShort(iso){ if(!iso) return ""; var d = new Date(iso); if(isNaN(d)) return ""; var t = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), a = new Date(); a.setHours(0,0,0,0); var b = new Date(d); b.setHours(0,0,0,0); var n = Math.round((a - b) / 86400000); return (n === 0 ? "Today" : n === 1 ? "Yest." : n > 0 && n < 7 ? d.toLocaleDateString([], { weekday: "short" }) : (d.getMonth() + 1) + "/" + d.getDate()) + " " + t; }
function rsDur(ms){ if(ms == null || ms < 0) return ""; var m = Math.round(ms / 60000); if(m < 60) return m + "m"; var h = Math.floor(m / 60); if(h < 24) return h + "h" + (m % 60 ? " " + (m % 60) + "m" : ""); var d = Math.floor(h / 24); return d + "d" + (h % 24 ? " " + (h % 24) + "h" : ""); }
function rsMax(arr){ var x = null; arr.forEach(function(v){ if(v && (!x || new Date(v) > new Date(x))) x = v; }); return x; }
function roStages(ro, f){
  if(!ro || ro.id === SHOP_RO_ID || ro.shop) return null;
  if(f === undefined){ f = null; try{ f = roForecast(ro); }catch(e){} }
  var live = (ro.operations || []).filter(function(o){ return o && o.id && !o.declined; });
  var all = (ro.operations || []).filter(function(o){ return o && o.id; });
  var ps = STATE.punches.filter(function(p){ return p.roId === ro.id; }).sort(function(a, b){ return new Date(a.start) - new Date(b.start); });
  var run = ps.filter(function(p){ return !p.stop; })[0] || null;
  var stp = (f && f.steps) || {}, allOn = function(g){ var l = stp[g]; return !!(l && l.length && l.every(function(x){ return x.on; })); };
  var ck = ro.checklist || {}, rs = roStatus(ro), rsn = rs.status, now = new Date().toISOString();
  var opN = function(op){ return (ro.operations || []).indexOf(op) + 1; };
  var stName = function(op){ var x = opStatus(op); return typeof x === "string" ? x : (x && x.status) || ""; };
  var usual = {}; ((f && f.stages) || []).forEach(function(g){ var k = g.stage === "dispatch" ? "checkin" : g.stage; usual[k] = (usual[k] || 0) + g.min; });
  var S = {};
  /* 1 · check-in */
  (function(){
    var c = [
      { label: "Unit connected / DTCs read", on: !!(ck.connectUnit || ck.uploadDtc) },
      { label: "Dash photo", on: !!(ck.initialDashPic || (ro.attachments || []).length || (ro.bulletins || []).some(function(b){ return (b.files || []).length; })) },
      { label: "Location set", on: !!(ro.location || ck.updateLocation) },
      { label: "First punch", on: ps.length > 0 }];
    (stp.checkin || []).forEach(function(x, i){ if(c[i] && x.on && !c[i].on){ c[i].on = true; c[i].key = x.key; c[i].hand = true; } else if(c[i] && !x.auto) c[i].key = x.key; });
    var done = ps.length > 0 || (c[0].on && c[1].on && c[2].on) || allOn("checkin");
    S.checkin = { ok: true, done: done, checks: c, doneAt: done ? (ps[0] ? ps[0].start : ro.dateOpened) : null, sub: "" };
  })();
  /* 2 · diag */
  (function(){
    var d = live.filter(function(o){ var t = opJobType(o); return t === "DIAG" || t === "COMEBACK"; });
    var c = d.map(function(o){ return { label: "Op " + opN(o) + " cause written", on: fcHasCause(o) || opDoneNow(o) }; });
    var done = d.length > 0 && c.every(function(x){ return x.on; });
    var dps = ps.filter(function(p){ return d.some(function(o){ return o.id === p.opId; }); });
    S.diag = { ok: d.length > 0, done: done, checks: c, q: d.reduce(function(a, o){ return a + (+o.quoted || 0); }, 0), labor: dps.reduce(function(a, p){ return a + Math.max(0, (p.stop ? new Date(p.stop) : new Date()) - new Date(p.start)); }, 0), doneAt: done ? rsMax(dps.map(function(p){ return p.stop; }).concat(d.map(function(o){ return o.jobStatus && /^Complete/.test(o.jobStatus.status) ? o.jobStatus.setAt : null; }))) : null };
  })();
  /* 3 · approval: a customer-pay op is approved when marked so, or once repair work has started on it */
  (function(){
    var cust = all.filter(function(o){ return fcPay(ro, o) === "customer"; });
    var started = function(o){ return ps.some(function(p){ return p.opId === o.id && (p.startReason || "") !== "Diagnosing" && opJobType(o) !== "DIAG"; }); };
    var c = cust.map(function(o){ var y = !!o.appr || o.declined || started(o) || opDoneNow(o); return { label: "Op " + opN(o) + (o.declined ? " declined" : o.appr ? (o.appr.s === "no" ? " declined" : " approved") : y ? " approved (work started)" : " approved"), on: y }; });
    var hand = stp.approval && stp.approval[2];
    if(hand) c.push({ label: "Customer approved (ticked by hand)", on: !!hand.on, key: hand.key, hand: !hand.auto });
    var done = cust.length > 0 && (cust.every(function(o, i){ return c[i].on; }) || (hand && hand.on && !hand.auto) || /^Complete/.test(rsn));
    S.approval = { ok: cust.length > 0, done: done, checks: c, doneAt: done ? rsMax(cust.map(function(o){ return o.appr && o.appr.at; }).concat([ (ps.filter(function(p){ return cust.some(function(o){ return o.id === p.opId; }) && (p.startReason || "") !== "Diagnosing"; })[0] || {}).start ])) : null };
    if(!done && (rsn === "Waiting – Customer" || live.some(function(o){ return /Approval|Customer/.test(stName(o)); }))) S.approval.wait = "Waiting on the customer" + (ro.status && ro.status.setAt ? " · " + rsDur(Date.now() - new Date(ro.status.setAt)) : "");
  })();
  /* 4 · parts */
  (function(){
    var pts = []; live.forEach(function(o){ opRealParts(o).forEach(function(p){ pts.push({ op: o, p: p }); }); });
    var c = pts.map(function(x){ return { label: (x.p.description || x.p.partNumber) + " · " + (x.p.status || "Not Ordered"), on: fcPartIn(x.p) }; });
    var inN = c.filter(function(x){ return x.on; }).length;
    var done = pts.length > 0 && (inN === pts.length || allOn("parts"));
    var out = pts.filter(function(x){ return !fcPartIn(x.p); });
    var eta = out.map(function(x){ return x.p.eta; }).filter(Boolean).sort()[0];
    S.parts = { ok: pts.length > 0, done: done, checks: c, doneAt: done ? rsMax(pts.map(function(x){ return x.p.statusChangedAt; })) : null };
    if(!done && pts.length){
      var bo = out.some(function(x){ return x.p.status === "Backordered"; }), no = out.filter(function(x){ return !x.p.status || x.p.status === "Not Ordered"; }).length;
      S.parts.wait = (bo ? "Backordered · " : no === out.length ? no + " to order · " : "") + inN + " of " + pts.length + " in" + (eta ? " · ETA " + rsShort(eta + "T12:00").replace(/ .*$/, "") : "");
    }
  })();
  /* 5 · repair */
  (function(){
    var rep = live.filter(function(o){ var t = opJobType(o); return t !== "DIAG" && t !== "COMEBACK"; });
    var tgt = rep.length ? rep : live;
    var c = tgt.map(function(o){ return { label: "Op " + opN(o) + " " + (o.complaint || "operation").slice(0, 40) + " · " + (stName(o) || "Hold Tech"), on: opDoneNow(o) }; });
    var done = tgt.length > 0 && c.every(function(x){ return x.on; });
    S.repair = { ok: live.length > 0, done: done, checks: c, q: tgt.reduce(function(a, o){ return a + (+o.quoted || 0); }, 0),
      labor: ps.filter(function(p){ return tgt.some(function(o){ return o.id === p.opId; }); }).reduce(function(a, p){ return a + Math.max(0, (p.stop ? new Date(p.stop) : new Date()) - new Date(p.start)); }, 0),
      doneAt: done ? rsMax(tgt.map(function(o){ return o.jobStatus && o.jobStatus.setAt; }).concat(ps.filter(function(p){ return tgt.some(function(o){ return o.id === p.opId; }); }).map(function(p){ return p.stop; }))) : null };
    if(!done){
      var hw = tgt.map(stName).filter(function(n){ return /Foreman|Tech Support/.test(n); })[0];
      if(hw) S.repair.wait = hw.replace(/^Waiting – /, "Waiting on ").replace("Tech Support", "tech support").replace("Foreman", "the foreman");
    }
  })();
  /* 6 · road test */
  (function(){
    var rt = ro.roadTest, pass = !!(rt && rt.result !== "Fail");
    S.roadtest = { ok: rtNeeded(ro), done: pass, checks: [{ label: "Road test logged", on: !!rt }, { label: "Passed", on: pass }], doneAt: pass ? (rt.at || null) : null };
    if(rt && rt.result === "Fail") S.roadtest.wait = "Road test failed";
  })();
  /* 7 · close-out */
  (function(){
    var story = live.length > 0 && live.every(function(o){ return fcHasCause(o) && fcHasFix(o); });
    var files = (ro.attachments || []).length + (ro.bulletins || []).reduce(function(n, b){ return n + (b.files || []).length; }, 0);
    var rel = rsn === "Complete – Released" || !!ro.dateClosed;
    var c = [{ label: "Cause and correction on every operation", on: story }, { label: "Pictures or files attached", on: files > 0 }, { label: "RO released", on: rel }];
    (stp.closeout || []).forEach(function(x){ if(!x.auto) c.push({ label: x.label + " (by hand)", on: !!x.on, key: x.key, hand: true }); });
    var done = (story && files > 0 && rel) || allOn("closeout");
    S.closeout = { ok: true, done: done, checks: c, doneAt: done ? (ro.dateClosed || (ro.status && ro.status.setAt) || null) : null };
  })();
  /* put it together: the first stage not done is where the RO is */
  var list = RS_KEYS.map(function(k){ var x = S[k]; x.k = k; x.name = RS_NAME[k]; x.usual = (k === "repair" || k === "diag") ? Math.round((x.q || 0) * 60) : (usual[k] || 0); return x; });
  var cur = null, prevAt = ro.dateOpened || (ps[0] && ps[0].start) || null;
  var marks = ro.stageMarks || {};                                    /* a stage checked (or unchecked) by hand */
  list.forEach(function(x){ var mk = marks[x.k]; if(!mk) return; x.hand = true; x.autoDone = x.done;
    if(mk.done){ x.ok = true; x.done = true; x.doneAt = mk.at || x.doneAt; } else { x.done = false; x.doneAt = null; } });
  list.forEach(function(x){
    if(!x.ok){ x.state = "x"; return; }
    x.startAt = prevAt;
    if(x.done){ x.state = "d"; x.dur = x.doneAt && x.startAt ? Math.max(0, new Date(x.doneAt) - new Date(x.startAt)) : null; if(x.doneAt) prevAt = x.doneAt; return; }
    if(!cur){ cur = x; x.state = x.wait ? "w" : run ? "c" : "n"; x.dur = x.startAt ? Date.now() - new Date(x.startAt) : null; return; }
    x.state = "t";
  });
  /* diag and repair are measured in clocked time against the quote, not days on the calendar */
  list.forEach(function(x){ if((x.k === "diag" || x.k === "repair") && x.ok && x.state !== "t") x.dur = x.labor || 0; });
  var appl = list.filter(function(x){ return x.ok; }), nDone = appl.filter(function(x){ return x.done; }).length;
  list.forEach(function(x){
    x.sub = x.state === "x" ? "not needed"
      : x.state === "d" ? (x.doneAt ? rsShort(x.doneAt) : "done") + (x.dur ? " · " + rsDur(x.dur) : "")
      : x.state === "w" ? x.wait
      : x.state === "c" ? "On it now" + (run ? " · " + rsDur(Date.now() - new Date(run.start)) : "")
      : x.state === "n" ? "Up next" + (x.dur ? " · " + rsDur(x.dur) : "")
      : (x.k === "repair" || x.k === "diag") ? (x.q ? fmtDec(x.q) + " h quoted" : "—") : x.usual ? "~" + rsDur(x.usual * 60000) : "";
    if(x.hand) x.sub = (x.sub ? x.sub + " · " : "") + "by hand";
  });
  return { list: list, cur: cur, done: nDone, total: appl.length, run: run, opened: ro.dateOpened, ready: f && f.ready, likely: f && f.likely, all: nDone === appl.length };
}
/* check a stage off by hand, or take the hand mark away again */
function stageToggle(ro, k){
  if(!ro) return;
  var M = roStages(ro); if(!M) return;
  var x = M.list.filter(function(y){ return y.k === k; })[0]; if(!x) return;
  pushUndo("stage");
  if(!ro.stageMarks) ro.stageMarks = {};
  var now = x.state === "d";
  if(ro.stageMarks[k]){ delete ro.stageMarks[k]; var M2 = roStages(ro), y2 = M2.list.filter(function(y){ return y.k === k; })[0]; if(y2 && (y2.state === "d") !== now) { scheduleSave(true); pmStageNotice(ro, k); return; } }
  ro.stageMarks[k] = { done: !now, at: nowIso(), by: (typeof rtMe === "function" ? rtMe().name : "") };
  try{ audit("stage", roLabel(ro) + ": " + RS_NAME[k] + (now ? " unchecked" : " checked off") + " by hand", ro); }catch(e){}
  scheduleSave(true); pmStageNotice(ro, k);
}
