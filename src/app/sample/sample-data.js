/* Parsec · sample · sample-data.js
   The 25 sample ROs (one button in Settings → Your data): each a scenario that exercises something; loadSample25 builds them with a seeded random; clearAll.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   mulberry32 s25Vin loadSample25 clearAll S25_JOBS S25_PLAN S25_PRICE S25_CUST CLEAR_ARMED (4 functions, 5 constants)
   state      fixes inventory punches ros shifts
   uses       access/ clock/ data/ import/ pages/assets/ pages/fixes/ pages/inventory/ pages/warranty/ ro/ shell/ state/
*/
/* ============================== SAMPLE DATA ============================== */
/* ---------- sample data: 16 repair orders with a few weeks of punches ---------- */
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }


   /* 15 of the 20: every stage, status family and spot type */


/* ============================== 25 SAMPLE ROs ==============================
   One button in Settings. Each RO is a scenario chosen to exercise something: a live clock,
   partial diag / repair time, parts on order and backorder, holds, approval, gates that keep a
   job from completing, finished jobs that become kits, and the same jobs coming back so the
   parts suggestions have something to suggest. Running it again swaps the old set out. */
var S25_JOBS = {
  brake:    { c:"Replace rear brake chamber", t:"OP", q:1.5, parts:[["Brake chamber 30/30","4988201",2],["Hose clamp","22188",4]], cause:"Rear brake chamber diaphragm ruptured, audible leak at the chamber.", fix:"Replaced both rear brake chambers, set slack adjusters, leak tested OK." },
  waterpump:{ c:"Coolant leak at water pump", t:"OP", q:3.0, parts:[["Water pump","21468475",1],["Water pump gasket","20734235",1],["Coolant VCS (gal)","VCS-1G",3]], cause:"Weep hole wet, bearing play at the pulley.", fix:"Replaced water pump and gasket, refilled and bled, pressure test held 15 psi." },
  airdryer: { c:"Air slow to build - replace air dryer cartridge", t:"OP", q:1.0, parts:[["Air dryer cartridge","21620181",1]], cause:"Cartridge saturated, oil in the wet tank.", fix:"Replaced cartridge, drained tanks, build-up time back in spec." },
  noxdiag:  { c:"Check engine light - NOx sensor fault SPN 3226", t:"DIAG", q:1.5, parts:[], cause:"SPN 3226 FMI 2 active, outlet reading erratic against the inlet sensor." },
  noxfix:   { c:"Replace outlet NOx sensor", t:"WARR", q:1.2, parts:[["NOx sensor - outlet","22827993",1]], cause:"Outlet NOx sensor failed its self test.", fix:"Replaced outlet NOx sensor, cleared codes, aftertreatment test passed." },
  dpfdiag:  { c:"DPF regen fault - soot load high SPN 3719", t:"DIAG", q:2.0, parts:[], cause:"Soot load 140 %, DPF delta-P sensor reads high at idle." },
  dpffix:   { c:"Clean DPF and replace DPF pressure sensor", t:"OP", q:3.0, parts:[["DPF pressure sensor","22770789",1],["DPF gasket","21949455",2]], cause:"DPF plugged, pressure sensor drifted.", fix:"Cleaned DPF, replaced sensor and gaskets, forced regen completed." },
  alt:      { c:"Alternator not charging", t:"OP", q:1.8, parts:[["Alternator 160A","22893794",1],["Serpentine belt","21969424",1]], cause:"Output 12.1 V at 1200 rpm, failed the load test.", fix:"Replaced alternator and belt, charging 14.2 V." },
  pm:       { c:"PM service - level A", t:"PM", q:2.0, parts:[["Oil filter","21707132",2],["Fuel filter","23658092",1],["Engine oil 15W-40 (gal)","VDS-4.5",10]], cause:"74-point started, brakes at 40 %.", fix:"PM A complete, fluids topped, 74-point done." },
  clutch:   { c:"Clutch slipping - replace clutch", t:"OP", q:8.0, parts:[["Clutch kit 15.5in","21521736",1],["Release bearing","20569143",1]], cause:"Clutch slips under load, no free play left.", fix:"Replaced clutch and release bearing, adjusted, road tested." },
  turbo:    { c:"Turbo actuator fault - low boost", t:"WARR", q:2.5, parts:[["Turbo actuator","85013120",1]], cause:"Actuator fault active, VGT not following command." },
  egr:      { c:"Recall 24V-118 - EGR cooler inspection", t:"RECALL", q:1.0, parts:[["EGR cooler gasket kit","23199543",1]], cause:"Recall inspection: seepage at the cooler outlet." },
  comeback: { c:"Comeback - rear brake chamber still leaking", t:"COMEBACK", q:1.0, parts:[["Brake chamber 30/30","4988201",1]], cause:"New chamber leaking at the clamp band.", fix:"Replaced chamber under comeback, leak test OK." },
  mirror:   { c:"Driver side mirror broken", t:"OP", q:0.8, parts:[["Mirror assembly - LH","82488776",1]], cause:"Mirror housing cracked, glass loose.", fix:"Replaced LH mirror assembly." },
  wheelseal:{ c:"Wheel seal leaking - drive axle", t:"OP", q:2.2, parts:[["Wheel seal","47697",2],["Axle flange gasket","20550",2]], cause:"Oil on the brake shoes, seal lip worn.", fix:"Replaced wheel seals and gaskets, refilled hubs." },
  nostart:  { c:"No start - starter clicks", t:"DIAG", q:1.0, parts:[], cause:"Voltage drop at the solenoid is fine, starter draws 900 A locked.", fix:"Diag done: starter failed the draw test." },
  starter:  { c:"Replace starter", t:"OP", q:1.5, parts:[["Starter motor","22516286",1]], cause:"Starter failed the draw test.", fix:"Replaced starter, cranks and starts." }
};
/* st: none | done | run | partial | wait | hold | ready ; p: parts status ("none" = no parts) */
var S25_PLAN = [
  { ops:[{ j:"brake", st:"done" }], eng:"D13 TC 455HP", yr:2019, rt:1, att:1, why:"Complete, makes the brake chamber kit" },
  { ops:[{ j:"waterpump", st:"done", t:"WARR", wc:"paid" }], eng:"D-13 500HP", yr:2021, rt:1, att:1, rel:1, why:"Released and closed; the warranty claim is paid" },
  { ops:[{ j:"alt", st:"done" }], eng:"D11 405HP", yr:2018, att:1, why:"Operation complete, RO waits on the road test" },
  { ops:[{ j:"brake", st:"none", p:"none" }], eng:"D13 TC 455HP", yr:2020, why:"Same operation again: kit suggested, fits the engine" },
  { ops:[{ j:"waterpump", st:"wait", p:"Ordered", k:0.2 }], eng:"D-13 500HP", yr:2022, why:"Waiting on parts: tracker parks at Repair" },
  { ops:[{ j:"clutch", st:"run", p:"Received", k:0.4 }], eng:"D13 TC 500HP", yr:2020, live:1, why:"Clock running now: watch the timer and tracker move" },
  { ops:[{ j:"noxdiag", st:"hold", k:1.0, stop:"Waiting – Approval" }, { j:"noxfix", st:"none", p:"Not Ordered" }], eng:"D13 TC 455HP", yr:2022, why:"Diag done, waiting on customer approval" },
  { ops:[{ j:"dpfdiag", st:"partial", k:0.6 }, { j:"dpffix", st:"none", p:"Not Ordered" }], eng:"X15 Efficiency 450", yr:2021, why:"Diag part way: tracker inside Diag; repair locked on parts" },
  { ops:[{ j:"pm", st:"partial", p:"Received", k:0.5, stop:"Lunch" }], eng:"D11 405HP", yr:2017, why:"PM half done" },
  { ops:[{ j:"airdryer", st:"wait", p:"Backordered", k:0.2 }], eng:"DD15 Gen5 475HP", yr:2019, why:"Backordered part" },
  { ops:[{ j:"turbo", st:"hold", p:"Received", k:0.5, stop:"Waiting – Tech Support" }], eng:"D13 TC 455HP", yr:2023, warr:1, why:"Held on tech support" },
  { ops:[{ j:"egr", st:"hold", p:"Received", k:0.3, stop:"Waiting – Foreman" }], eng:"D13 TC 455HP", yr:2022, why:"Held on the foreman" },
  { ops:[{ j:"comeback", st:"done", nonote:1 }], eng:"D13 TC 455HP", yr:2019, why:"Marked complete but a punch has no note: stays Hold Tech" },
  { ops:[{ j:"mirror", st:"ready", p:"Received", k:0.1 }], eng:"MP8 445HP", yr:2016, why:"Was waiting on parts, part is in: Ready" },
  { ops:[{ j:"wheelseal", st:"none", p:"Not Ordered" }], eng:"X12 430HP", yr:2018, noTech:1, why:"Not started, nobody assigned" },
  { ops:[{ j:"nostart", st:"done" }, { j:"starter", st:"partial", p:"Received", k:0.35 }], eng:"D13 TC 455HP", yr:2020, why:"Diag done, repair a third of the way" },
  { ops:[{ j:"brake", st:"none", p:"none" }], eng:"X15 Efficiency 450", yr:2023, why:"Same operation, different engine: kit suggested without the fit tag" },
  { ops:[{ j:"airdryer", st:"done" }], eng:"DD15 Gen5 475HP", yr:2020, rt:1, att:1, why:"Complete, makes the air dryer kit" },
  { ops:[{ j:"alt", st:"none", p:"none" }], eng:"D11 405HP", yr:2019, why:"Alternator again: kit suggested" },
  { ops:[{ j:"pm", st:"done" }], eng:"D13 TC 455HP", yr:2021, rt:1, att:1, why:"PM complete" },
  { ops:[{ j:"pm", st:"none", p:"none" }], eng:"D13 TC 455HP", yr:2024, why:"PM again: parts from the last PM suggested" },
  { ops:[{ j:"waterpump", st:"done", t:"WARR", wc:"returned" }, { j:"mirror", st:"wait", p:"Ordered", k:0.1 }, { j:"wheelseal", st:"partial", p:"Received", k:0.5 }], eng:"D16 550HP", yr:2018, why:"Three operations in three states; only the warranty water pump goes to warranty, and its claim came back" },
  { ops:[{ j:"clutch", st:"none", p:"Not Ordered", dec:1 }, { j:"alt", st:"none", p:"none" }], eng:"MX-13 455HP", yr:2017, why:"Clutch declined, alternator to do" },
  { ops:[{ j:"wheelseal", st:"done", k:1.35, t:"WARR" }], eng:"MP8 445HP", yr:2019, rt:1, why:"Over the quote; RO waits on an attachment; warranty claim ready to file" },
  { ops:[{ j:"dpfdiag", st:"done", wc:"approved" }, { j:"dpffix", st:"done", wc:"submitted" }], eng:"D13 TC 455HP", yr:2021, rt:1, att:1, warr:1, why:"Diag and repair complete under warranty: one claim approved, one submitted" }
];
var S25_PRICE = { "4988201":189.5, "22188":3.25, "21468475":412, "20734235":18.9, "VCS-1G":24.5, "21620181":96.75, "22827993":548, "22770789":142.3, "21949455":21.6,
  "22893794":486, "21969424":64.2, "21707132":28.4, "23658092":46.9, "VDS-4.5":18.75, "21521736":1384, "20569143":212.5, "85013120":1265, "23199543":58.4, "82488776":318, "47697":79.9, "20550":12.4, "22516286":539 };
var S25_CUST = ["Rick's Freight LLC","Northline Transport","Blue Ridge Haulers","Cascade Carriers","Iron Horse Logistics","Summit Freightways","Prairie Line Trucking","Delta Cold Chain",
  "Granite State Express","Harbor Point Drayage","Copperline Transport","Red Mesa Hauling","Great Lakes Bulk","Pinecrest Logistics","Riverbend Freight","Atlas Flatbed Co.",
  "Lone Star Tankers","Evergreen Moving","Keystone Carriers","Tri-County Waste","Bayside Distribution","Highplains Grain","Coastal Reefer Inc.","Midway Auto Transport","Silverline LTL"];
function s25Vin(year, rnd){
  var yc = "ABCDEFGHJKLMNPRSTVWXY".charAt(year - 2010) || "K";
  var serial = String(100000 + Math.floor(rnd() * 899999));
  var v = "4V4NC9EH" + "0" + yc + "N" + serial;
  var map = {A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9};
  var w = [8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2], sum = 0;
  for(var i = 0; i < 17; i++){ var c = v[i]; sum += (/\d/.test(c) ? +c : map[c]) * w[i]; }
  var chk = sum % 11;
  return v.slice(0, 8) + (chk === 10 ? "X" : String(chk)) + v.slice(9);
}
function loadSample25(){
  pushUndo("generate 25 sample ROs");
  /* swap out any earlier sample set: ROs, their punches, sample shifts, sample inventory */
  var oldIds = {};
  STATE.ros.forEach(function(r){ if(r.sample || /^4V4NC9EJ/.test(r.vin || "")) oldIds[r.id] = 1; });
  STATE.ros = STATE.ros.filter(function(r){ return !oldIds[r.id]; });
  STATE.punches = STATE.punches.filter(function(pu){ return !oldIds[pu.roId] && !(pu.sample && isShopPunch(pu)); });
  STATE.shifts = shiftList().filter(function(x){ return !x.sample; });
  STATE.inventory = invList().filter(function(x){ return !x.sample; });
  if(runningPunch()){ var rp0 = runningPunch(); rp0.stop = nowIso(); rp0.stopReason = "Switched job"; try{ creditBurnt(rp0); }catch(e){} }
  ensureDemoTeam();
  var rnd = mulberry32((Date.now() % 1000003) + 25);
  var pick = function(a){ return a[Math.floor(rnd() * a.length)]; };
  var techs = staffList().filter(function(x){ return x.role === "Technician"; }).map(function(x){ return x.name; });
  if(!techs.length) techs = ["Mike Rodriguez","Dana Kowalski","Luis Martinez","Priya Shah"];
  var me = punchByName() || techs[0];
  var used = {}; STATE.ros.forEach(function(r){ used[String(r.roNumber)] = 1; });
  var ros = [], sessions = [], now = Date.now();
  S25_PLAN.forEach(function(pl, ix){
    var n; do { n = "RO-" + (31000 + Math.floor(rnd() * 8999)); } while(used[n]); used[n] = 1;
    var tech = pl.noTech ? "" : (pl.live ? me : techs[ix % techs.length]);
    var tk = s25Truck(rnd, pl.yr);   /* Parsec 12.3: a real body built that year */
    var ro = { id: uid("ro"), roNumber: n, customerName: S25_CUST[ix % S25_CUST.length], caseNumber: rnd() < 0.7 ? ("C-" + (4000 + Math.floor(rnd() * 5999))) : "",
      dateOpened: null, dateClosed: null, vin: s25Vin(tk.year, rnd), mileage: String((120 + Math.floor(rnd() * 660)) * 1000), engineHours: String(4000 + Math.floor(rnd() * 22000)),
      engineType: pl.eng, model: tk.model, year: tk.year, make: "Volvo", axles: tk.axles, cab: tk.cab, sleeper: tk.sleeper, unitNumber: "T-" + (100 + Math.floor(rnd() * 899)), keyTag: String(10 + Math.floor(rnd() * 89)), location: "", buildDate: "", warrantyStart: "",
      techSupportCase: "", warranty: !!pl.warr, assignedTech: tech, checklist: {}, attachments: [], operations: [], bulletins: [], history: [],
      status: { status: "Hold Tech", sub: null, setAt: nowIso() }, _lastKnownStatus: "Hold Tech", checklistPopupPending: false, sample: true, sampleWhy: pl.why };
    pl.ops.forEach(function(os, oi){
      var J = S25_JOBS[os.j];
      var op = { id: uid("op"), complaint: J.c, cause: "", correction: "", log: [], quoted: J.q, isStandard: false, standardName: null, declined: !!os.dec, parts: [], jobType: os.t || J.t };
      var pst = os.p || (os.st === "done" ? "Installed" : os.st === "none" ? "none" : "Received");
      if(pst !== "none") J.parts.forEach(function(pd){
        var ch = new Date(now - (0.5 + rnd() * 5) * 86400000);
        op.parts.push({ id: uid("pt"), description: pd[0], partNumber: pd[1], qty: String(pd[2]), price: S25_PRICE[pd[1]] ? String(S25_PRICE[pd[1]]) : "", status: pst,
          eta: (pst === "Ordered" || pst === "Backordered") ? new Date(now + (1 + rnd() * 6) * 86400000).toISOString().slice(0, 10) : "", statusChangedAt: ch.toISOString() });
      });
      if(os.st !== "none" && !os.dec){
        var frac = os.k || (os.st === "done" ? 0.85 + rnd() * 0.3 : 0.3);
        var mins = Math.max(12, Math.round(J.q * 60 * frac));
        var reason = J.t === "DIAG" ? "Diagnosing" : J.t === "PM" ? "Inspecting – 74-point" : (os.st === "wait" || os.st === "ready") ? "Diagnosing" : "Repairing";
        var lastStop = os.st === "done" ? "Complete" : os.st === "partial" ? (os.stop || "Switched job") : os.st === "wait" || os.st === "ready" ? "Waiting – Parts" : os.st === "hold" ? os.stop : "Switched job";
        var chunks = mins > 150 ? 2 : 1;
        for(var c = 0; c < chunks; c++){
          var last = c === chunks - 1;
          sessions.push({ ro: ro, op: op, tech: tech || techs[0], mins: mins / chunks, reason: reason, stop: last ? lastStop : "Switched job",
            notes: os.nonote ? "" : (last && os.st === "done" && J.fix ? J.fix : J.cause || "Worked it."), order: ix * 10 + oi });
        }
        if(os.st === "run") sessions.push({ ro: ro, op: op, tech: me, live: true, reason: "Repairing", notes: "" });
        if(J.cause) op.log.push({ id: uid("lg"), kind: "cause", text: J.cause, at: new Date(now - 86400000).toISOString() });
        if(os.st === "done" && J.fix) op.log.push({ id: uid("lg"), kind: "fix", text: J.fix, at: new Date(now - 3600000).toISOString() });
      }
      ro.operations.push(op);
    });
    if(pl.rt) ro.roadTest = { miles: String(8 + Math.floor(rnd() * 12)), start: "14:" + String(10 + Math.floor(rnd() * 40)), result: "Pass", checked: "No leaks, no codes, brakes and boost normal", at: nowIso() };
    if(pl.att) ro.attachments = [{ name: "dash-" + n + ".jpg", size: 180000 + Math.floor(rnd() * 90000), type: "image/jpeg", addedAt: nowIso() }];
    ros.push(ro);
  });
  /* lay the finished sessions on each technician's workdays, oldest scenario first */
  var punches = [], cursors = {};
  function workdayStart(daysBack){ var d = new Date(); d.setHours(0, 0, 0, 0); var k = 0; while(k < daysBack){ d.setDate(d.getDate() - 1); if(d.getDay() !== 0 && d.getDay() !== 6) k++; } d.setHours(7, 5 + Math.floor(rnd() * 20), 0, 0); return d; }
  sessions.filter(function(x){ return !x.live; }).sort(function(a, b){ return a.order - b.order; }).forEach(function(sn){
    var cur = cursors[sn.tech] || workdayStart(9);
    cur = new Date(cur.getTime() + (8 + Math.floor(rnd() * 20)) * 60000);
    if(cur.getHours() * 60 + cur.getMinutes() + sn.mins > 16 * 60 + 30){
      var nd = new Date(cur); do { nd.setDate(nd.getDate() + 1); } while(nd.getDay() === 0 || nd.getDay() === 6);
      nd.setHours(7, 5 + Math.floor(rnd() * 20), 0, 0); cur = nd;
    }
    var stop = new Date(cur.getTime() + sn.mins * 60000);
    punches.push({ id: uid("pn"), roId: sn.ro.id, opId: sn.op.id, start: cur.toISOString(), stop: stop.toISOString(), startReason: sn.reason, stopReason: sn.stop, notes: sn.notes, by: sn.tech, sample: true });
    cursors[sn.tech] = stop;
  });
  /* nothing finished may end after "now": pull a technician's whole run back a day if it would */
  Object.keys(cursors).forEach(function(t){
    var mine = punches.filter(function(p2){ return p2.by === t; }), end = cursors[t];
    while(end.getTime() > now - 40 * 60000){
      mine.forEach(function(p2){ p2.start = new Date(new Date(p2.start).getTime() - 86400000).toISOString(); p2.stop = new Date(new Date(p2.stop).getTime() - 86400000).toISOString(); });
      end = new Date(end.getTime() - 86400000);
    }
  });
  sessions.filter(function(x){ return x.live; }).forEach(function(sn){
    punches.push({ id: uid("pn"), roId: sn.ro.id, opId: sn.op.id, start: new Date(now - 47 * 60000).toISOString(), stop: null, startReason: "Repairing", stopReason: null, notes: "", by: sn.tech, sample: true });
  });
  /* when each RO came in: a little before its first punch, else in the last few days */
  ros.forEach(function(ro){
    var ps = punches.filter(function(p2){ return p2.roId === ro.id; }).sort(function(a, b){ return new Date(a.start) - new Date(b.start); });
    var d = ps.length ? new Date(new Date(ps[0].start).getTime() - (2 + Math.floor(rnd() * 20)) * 3600000) : new Date(now - (1 + Math.floor(rnd() * 5)) * 86400000);
    ro.dateOpened = d.toISOString();
  });
  /* the day clock: in before the first punch of each day, out after the last; today stays open if a clock runs */
  var byDay = {}, shifts = [];
  punches.filter(function(p2){ return p2.by === me; }).forEach(function(p2){ var k = localDay(p2.start); (byDay[k] = byDay[k] || []).push(p2); });
  Object.keys(byDay).forEach(function(k){
    var ps = byDay[k].sort(function(a, b){ return new Date(a.start) - new Date(b.start); }), lastP = ps[ps.length - 1];
    var sh = { id: uid("sh"), in: new Date(new Date(ps[0].start).getTime() - 8 * 60000).toISOString(), out: null, sample: true };
    if(lastP.stop){ sh.out = new Date(new Date(lastP.stop).getTime() + 6 * 60000).toISOString(); sh.outReason = "End of day"; }
    shifts.push(sh);
  });
  try{ asSampleFleet(ros); }catch(e){ console.error(e); }   /* Parsec 14 */
  STATE.ros = STATE.ros.concat(ros);
  STATE.punches = STATE.punches.concat(punches);
  STATE.shifts = shiftList().concat(shifts);
  ros.forEach(migrateRO);
  /* statuses: what the operations add up to (Released is the one set by hand) */
  ros.forEach(function(ro, ix){
    var pl = S25_PLAN[ix];
    if(pl.rel){ ro.status = { status: "Complete – Released", sub: null, setAt: nowIso() }; ro.dateClosed = nowIso(); ro._lastKnownStatus = "Complete – Released"; return; }
    var t = null; try{ t = roAutoTarget(ro); }catch(e){}
    var o = t && roStatusOption(t.status);
    if(o){ ro.status = { status: t.status, sub: o.subs.indexOf(t.sub) >= 0 ? t.sub : null, setAt: nowIso() }; ro._lastKnownStatus = t.status; }
  });
  /* warranty claims at different stages, and a few older fixes from before TEC */
  ros.forEach(function(ro, ix){
    S25_PLAN[ix].ops.forEach(function(os, oi){
      var op = ro.operations[oi]; if(!os.wc || !op) return;
      var amt = (Math.round(((+op.quoted || 1) * 168 + opRealParts(op).length * 220 + rnd() * 140) * 100) / 100).toFixed(2);
      var c = { status: os.wc, claimNo: "W" + (2600000 + Math.floor(rnd() * 99999)), failCode: "", laborHrs: (Math.round((+op.burnt || +op.quoted || 1) * 10) / 10).toFixed(1),
        amount: +amt, paid: "", notes: "", returnReason: "", history: [] };
      var cp = opRealParts(op)[0]; if(cp) c.causal = cp.id;
      var steps = os.wc === "paid" ? ["submitted","approved","paid"] : os.wc === "approved" ? ["submitted","approved"] : os.wc === "returned" ? ["submitted","returned"] : ["submitted"];
      steps.forEach(function(st, si){ var at = new Date(now - (steps.length - si) * 1.5 * 86400000).toISOString(); c.history.push({ at: at, to: st, from: si ? steps[si - 1] : "ready", by: "Carla Reyes" }); c[st + "At"] = at; });
      if(os.wc === "paid") c.paid = +amt;
      if(os.wc === "returned") c.returnReason = "Causal part photo missing, and labor is over the SRT \u2014 add the tech support case.";
      op.claim = c;
    });
  });
  try{ waSample(STATE.ros); }catch(e){ console.error(e); }
  try{ pgSampleHistory(techs, rnd); }catch(e){ console.error(e); }
  STATE.fixes = fixManual().filter(function(x){ return !x.sample; });
  [["Coolant leak at water pump","Water pump seal weeping, coolant crust on the block.","Replaced water pump and gasket, pressure tested 15 psi.",2019,"VNL 760","D13 TC 455HP",48],
   ["Coolant leak at water pump","Bearing play at the pulley, weep hole wet.","Replaced water pump and belt, bled the system.",2020,"VNR 640","D11 405HP",130],
   ["Replace rear brake chamber","Spring brake chamber leaking at the clamp band.","Replaced chamber, adjusted slack, leak test OK.",2018,"VNL 670","D13 TC 455HP",95],
   ["Check engine light - NOx sensor fault SPN 3226","Outlet NOx sensor reading erratic against the inlet.","Replaced outlet NOx sensor, aftertreatment test passed.",2021,"VNL 860","D13 TC 500HP",62],
   ["Check engine light - NOx sensor fault SPN 3226","NOx sensor harness chafed at the frame rail.","Repaired and re-loomed the harness, codes cleared.",2020,"VNL 760","D13 TC 455HP",170],
   ["Alternator not charging","Output 12.3 V, failed the load test.","Replaced alternator, charging 14.1 V.",2017,"VNL 670","D13 TC 455HP",210],
   ["Turbo actuator fault - low boost","VGT actuator not following command, fault active.","Replaced turbo actuator, calibrated with Tech Tool.",2022,"VNL 760","D13 TC 455HP",40],
   ["Air slow to build - replace air dryer cartridge","Purge valve stuck open, cartridge saturated.","Replaced cartridge and purge valve, build-up in spec.",2019,"VNL 760","D13 TC 455HP",120]
  ].forEach(function(p){ fixManual().push({ id: uid("fx"), complaint: p[0], cause: p[1], correction: p[2], year: String(p[3]), model: p[4], engine: p[5], vin: s25Vin(p[3], rnd),
    date: new Date(now - p[6] * 86400000).toISOString(), by: pick(techs), at: nowIso(), sample: true }); });
  /* every part onto the Parts page, finished jobs into kits; mark what this set added */
  var before = {}; invList().forEach(function(x){ before[x.id] = 1; });
  try{ invSyncAll(); }catch(e){}
  invList().forEach(function(x){ if(!before[x.id]) x.sample = true; });
  var liveRo = ros.filter(function(r, i){ return S25_PLAN[i].live; })[0];
  UI.appMenu = false;
  if(liveRo){ UI.selectedRo = liveRo.id; UI.view = "ros"; persistUI(); }
  scheduleSave(true);
  render();
  pushToast("25 sample ROs generated — a live clock, parts on order, holds, warranty claims, kits and past fixes to test with.", true);
}



var CLEAR_ARMED = 0;
function clearAll(){
  var s = summarizeState(STATE);
  /* The browser's confirm() popup is blocked in some hosts and silently answers "no",
     which made this button look dead. Two taps instead: arm, then clear. */
  if(!CLEAR_ARMED || Date.now() - CLEAR_ARMED > 6000){
    CLEAR_ARMED = Date.now();
    pushToast("This removes "+s+". Tap clear again within 6 seconds to confirm \u2014 Ctrl+Z undoes it.", true);
    return;
  }
  CLEAR_ARMED = 0;
  pushUndo("clear all data");
  STATE = defaultState();
  UI.selectedRo = null; UI.roPane = {}; UI.roOp = {}; UI.roDrop = {};
  scheduleSave(true);
  render();
  pushToast("Cleared.");
}
