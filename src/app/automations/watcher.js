/* Parsec · automations · watcher.js
   Automations + change history: one watcher for every change wherever it was made — autoSnap keeps the last saved snapshot, autoRun compares at save, records history (autoHist) and raises events the rules listen to.
   Flow: scheduleSave → autoRun(before, after) → rules → actions (status moves, Inbox notes).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   autoDefaults autoCfg autoLabel autoStatusName autoClock autoSnap autoHist autoQueue autoFlush autoRun taskName AUTO_SILENT … (11 functions, 15 constants)
   state      punches ros
   uses       data/ kit/ ro/ state/
*/
/* ============================== AUTOMATIONS + CHANGE HISTORY ==============================
   One watcher for every change, wherever it was made (RO page, Console, Time Log, an
   import): after each save it compares the data with how it looked last
   time and turns the differences into events — punch started, job status changed, part
   backordered, all jobs complete. Every event is written to that RO's history (kept
   forever, inside its ro.json). Then the rules look at the events: the built-in ones
   (status sync, parts → status) and your own custom rules. A rule never
   changes anything by itself in Suggest mode — it leaves a suggestion on the card it
   would change, and nothing happens until you press Accept. */
var AUTO_SILENT = false, AUTO_SHADOW = null, AUTO_FOR = null, AUTO_T = null, AUTO_BY = null, AUTO_CHAIN = 0, AUTO_RENDER_DUE = false;
var AUTO_COMPLETE = ["Complete","Complete – Road test","Complete – Released"];
var AUTO_WAITS = ["Waiting – Parts","Waiting – Sublet","Waiting – Foreman","Waiting – Tech Support","Waiting – Approval","Waiting – New Job"];
var AUTO_RO_FIELDS = [["customerName","Customer"],["roNumber","RO number"],["caseNumber","Case #"],["vin","VIN"],["mileage","Mileage"],["engineHours","Engine hours"],
  ["unitNumber","Unit #"],["keyTag","Key tag"],["location","Location"],["techNote","RO note"]];
var AUTO_TRIGGERS = [["punch.start","Punch started"],["punch.stop","Punch stopped"],["punch.edit","Punch edited"],["job.status","Operation status changed"],
  ["part.status","Part status changed"],["parts.allReceived","All parts received"],["jobs.allComplete","All operations complete"],
  ["ro.status","RO status changed"],["task.tick","Task ticked"],["file.add","File added"]];
var AUTO_FIELDS = [["startReason","Start reason"],["stopReason","Stop reason"],["jobType","Operation type"],["jobStatus","Operation status"],["roStatus","RO status"],
  ["partStatus","Part status"],["customer","Customer"],["overQuoted","Burnt over quoted"],["hour","Time of day"]];
var AUTO_ACTIONS = [["jobStatus","Set operation status"],["roStatus","Set RO status"],["stamp","Stamp work log"],
  ["note","Add RO note line"],["remind","Add reminder"]];
var AUTO_PART_STATES = pxPartKeys();
var AUTO_STAMP_DEFAULT = "{start}–{stop} · {reason} → {stopReason}";

function autoDefaults(st){
  var a = st.automations;
  if(!a || typeof a !== "object") a = st.automations = {};
  if(!a.builtin || typeof a.builtin !== "object") a.builtin = { status:true, parts:true };
  if(Object.prototype.hasOwnProperty.call(a.builtin, "stamps")) delete a.builtin.stamps;   /* Parsec 16.1: the work-log stamps rule is gone */
  if(a.mode !== "auto") a.mode = "suggest";
  if(!Array.isArray(a.rules)) a.rules = [];
  return a;
}
function autoCfg(){ return autoDefaults(STATE); }
function autoLabel(list, k){ for(var i=0;i<list.length;i++) if(list[i][0] === k) return list[i][1]; return k || ""; }
function autoStatusName(x){ return typeof x === "string" ? x : (x && x.status) || ""; }
function autoClock(iso){ return iso ? fmtTime(iso) : "—"; }

/* ---------- the snapshot the next save is compared with ---------- */
function autoSnap(){
  var s = { ros:{}, punches:{} };
  STATE.ros.forEach(function(ro){
    var st = roStatus(ro);
    var r = { num: ro.roNumber || "", st: st.status + (st.sub ? " · " + st.sub : ""), stName: st.status, f:{}, ops:{}, tasks:{}, entries:{}, files:0, opOrder:[], rt: JSON.stringify(ro.roadTest || null) };
    AUTO_RO_FIELDS.forEach(function(f){ r.f[f[0]] = ro[f[0]] == null ? "" : String(ro[f[0]]); });
    (ro.operations || []).forEach(function(op){
      var o = { name: op.complaint || "Operation", st: autoStatusName(opStatus(op)), q: Number(op.quoted) || 0, type: op.jobType || "",
        dec: !!op.declined, work: String(op.work || ""), parts:{}, allIn: false };
      var ps = op.parts || [];
      ps.forEach(function(pt){ o.parts[pt.id] = { d: pt.description || pt.desc || pt.partNumber || "part", s: pt.status || "", eta: pt.eta || "" }; });
      o.allIn = ps.length > 0 && ps.every(pxPartIn);
      r.ops[op.id] = o; r.opOrder.push(op.id);
    });
    var live = (ro.operations || []).filter(function(op){ return !op.declined; });
    r.allDone = live.length > 0 && live.every(function(op){ return AUTO_COMPLETE.indexOf(r.ops[op.id].st) >= 0; });
    (ro.bulletins || []).forEach(function(e){
      if(e.done) r.tasks[e.task] = 1;
      r.files += (e.files || []).length;
      r.entries[e.oid] = { task: e.task, v: JSON.stringify([e.fields || {}, e.place || ""]) };
    });
    s.ros[ro.id] = r;
  });
  STATE.punches.forEach(function(p){
    s.punches[p.id] = { ro: p.roId, op: p.opId, a: p.start || "", b: p.stop || "", sr: p.startReason || "", xr: p.stopReason || "", n: p.notes || "" };
  });
  return s;
}

/* ---------- history ---------- */
function autoHist(ro, e, coalesce){
  if(!ro) return;
  if(e && typeof e.at !== "string") e.at = cdIso(e.at);   /* Parsec 16 */
  if(!Array.isArray(ro.history)) ro.history = [];
  var last = ro.history[ro.history.length - 1];
  /* typing in one box becomes one line, not one line per keystroke */
  if(coalesce && last && last.k === e.k && last.t === e.t && (last.op || "") === (e.op || "") && last.by === e.by && cdMs(e.at) - cdMs(last.at) < 180000){
    last.n = e.n; last.at = e.at; return;
  }
  ro.history.push(e);
}

/* ---------- compare, record, raise events ---------- */
function autoQueue(){
  if(AUTO_T) clearTimeout(AUTO_T);
  AUTO_T = setTimeout(autoRun, 150);
}
function autoFlush(){ if(AUTO_T){ clearTimeout(AUTO_T); AUTO_T = null; } autoRun(); }
function autoRun(){
  AUTO_T = null;
  if(!STATE || !STATE.ros || TAB_LOCKED) return;
  var closedMoved = false;
  if(AUTO_SHADOW) STATE.ros.forEach(function(ro){ if(syncDateClosedRo(ro)) closedMoved = true; });
  var cur = autoSnap();
  if(!AUTO_SHADOW){ AUTO_SHADOW = cur; AUTO_FOR = STATE; AUTO_BY = null; return; }   /* first look after loading */
  /* A whole new STATE (an undo, a folder copy adopted) is still compared, so history shows
     what it changed — but it is labelled as such and never raises suggestions. */
  var swapped = AUTO_FOR !== STATE; AUTO_FOR = STATE;
  var old = AUTO_SHADOW; AUTO_SHADOW = cur;
  var by = swapped ? "Undo / reload" : (AUTO_BY || "You"); var byAuto = !!AUTO_BY && !swapped; AUTO_BY = null;
  AUTO_CHAIN = byAuto ? AUTO_CHAIN + 1 : 0;
  var now = Date.now(), events = [], touched = false;
  function H(ro, k, t, o, n, op, co){ autoHist(ro, { at: now, k: k, t: t, o: o == null ? "" : String(o), n: n == null ? "" : String(n), op: op || "", by: by }, co); touched = true; }
  var fresh = {};

  Object.keys(cur.ros).forEach(function(id){
    var ro = getRO(id), c = cur.ros[id], p = old.ros[id];
    if(!p){ fresh[id] = 1; H(ro, "ro", "RO created", "", "RO " + c.num + (c.f.customerName ? " · " + c.f.customerName : "")); return; }
    if(c.st !== p.st){ H(ro, "status", "RO status", p.st, c.st); events.push({ type:"ro.status", ro: ro, value: c.stName }); }
    if(p.rt !== undefined && c.rt !== p.rt){ H(ro, "ro", "Road test", "", c.rt === "null" ? "cleared" : "logged"); events.push({ type:"ro.road", ro: ro }); }
    AUTO_RO_FIELDS.forEach(function(f){
      if(c.f[f[0]] !== p.f[f[0]]) H(ro, f[0] === "techNote" ? "note" : "ro", f[1], f[0] === "techNote" ? "" : p.f[f[0]], f[0] === "techNote" ? "" : c.f[f[0]], "", true);
    });
    c.opOrder.forEach(function(oid){
      var o = c.ops[oid], q = p.ops[oid], op = getOp(id, oid);
      if(!q){ H(ro, "job", "Operation added", "", o.name, oid); return; }
      if(o.name !== q.name) H(ro, "job", "Operation name", q.name, o.name, oid, true);
      if(o.q !== q.q) H(ro, "job", "Quoted · " + o.name, q.q.toFixed(2), o.q.toFixed(2), oid, true);
      if(o.type !== q.type) H(ro, "job", "Operation type · " + o.name, q.type, o.type, oid);
      if(o.dec !== q.dec) H(ro, "job", o.dec ? "Operation declined" : "Operation reinstated", "", o.name, oid);
      if(o.work !== q.work) H(ro, "note", "Work performed · " + o.name, "", "", oid, true);
      if(o.st !== q.st){ H(ro, "status", "Operation status · " + o.name, q.st, o.st, oid); events.push({ type:"job.status", ro: ro, op: op, value: o.st, prev: q.st }); }
      Object.keys(o.parts).forEach(function(pid){
        var a = o.parts[pid], b = q.parts[pid], part = op ? (op.parts || []).filter(function(x){ return x.id === pid; })[0] : null;
        if(!b){ H(ro, "part", "Part added · " + o.name, "", a.d, oid); if(a.s && a.s !== "Not Ordered") events.push({ type:"part.status", ro: ro, op: op, part: part, value: a.s }); return; }
        if(a.d !== b.d) H(ro, "part", "Part name", b.d, a.d, oid, true);
        if(a.s !== b.s){ H(ro, "part", "Part · " + a.d, b.s, a.s, oid); events.push({ type:"part.status", ro: ro, op: op, part: part, value: a.s }); }
        if(a.eta !== b.eta) H(ro, "part", "Part ETA · " + a.d, b.eta, a.eta, oid, true);
      });
      Object.keys(q.parts).forEach(function(pid){ if(!o.parts[pid]) H(ro, "part", "Part removed · " + o.name, q.parts[pid].d, "", oid); });
      if(o.allIn && !q.allIn) events.push({ type:"parts.allReceived", ro: ro, op: op });
    });
    Object.keys(p.ops).forEach(function(oid){ if(!c.ops[oid]) H(ro, "job", "Operation removed", p.ops[oid].name, "", oid); });
    if(c.allDone && !p.allDone) events.push({ type:"jobs.allComplete", ro: ro });
    Object.keys(c.tasks).forEach(function(t){ if(!p.tasks[t]){ H(ro, "task", "Task ticked", "", taskName(t)); events.push({ type:"task.tick", ro: ro, task: t }); } });
    Object.keys(p.tasks).forEach(function(t){ if(!c.tasks[t]) H(ro, "task", "Task unticked", "", taskName(t)); });
    Object.keys(c.entries).forEach(function(k){
      var a = c.entries[k], b = p.entries[k];
      if(b && a.v !== b.v) H(ro, "note", "Task entry · " + taskName(a.task), "", "", "", true);
    });
    if(c.files > p.files){ H(ro, "file", (c.files - p.files) === 1 ? "File added" : (c.files - p.files) + " files added", "", ""); events.push({ type:"file.add", ro: ro }); }
    else if(c.files < p.files) H(ro, "file", (p.files - c.files) === 1 ? "File removed" : (p.files - c.files) + " files removed", "", "");
  });

  function jobName(ro, opId){ var op = ro ? getOp(ro.id, opId) : null; return op ? (op.complaint || "Operation") : "Operation"; }
  Object.keys(cur.punches).forEach(function(id){
    var c = cur.punches[id], p = old.punches[id], ro = getRO(c.ro);
    if(!ro || fresh[c.ro]) return;
    var punch = STATE.punches.filter(function(x){ return x.id === id; })[0], op = getOp(c.ro, c.op), nm = jobName(ro, c.op);
    var base = { ro: ro, op: op, punch: punch };
    if(!p){
      if(!c.b){ H(ro, "punch", "Punch started · " + nm, "", autoClock(c.a) + " · " + c.sr, c.op); events.push(Object.assign({ type:"punch.start" }, base)); }
      else { H(ro, "punch", "Punch added · " + nm, "", autoClock(c.a) + "–" + autoClock(c.b) + " · " + c.sr + " → " + c.xr, c.op); events.push(Object.assign({ type:"punch.stop", manual: true }, base)); }
      return;
    }
    if(!p.b && c.b){ H(ro, "punch", "Punch stopped · " + nm, "", autoClock(c.a) + "–" + autoClock(c.b) + " · " + c.sr + " → " + c.xr, c.op); events.push(Object.assign({ type:"punch.stop" }, base)); }
    else if(c.a !== p.a || c.b !== p.b || c.sr !== p.sr || c.xr !== p.xr || c.op !== p.op){
      H(ro, "punch", "Punch edited · " + nm,
        autoClock(p.a) + "–" + (p.b ? autoClock(p.b) : "running") + " · " + p.sr + (p.xr ? " → " + p.xr : ""),
        autoClock(c.a) + "–" + (c.b ? autoClock(c.b) : "running") + " · " + c.sr + (c.xr ? " → " + c.xr : ""), c.op);
      events.push(Object.assign({ type:"punch.edit" }, base));
    }
    if(c.n !== p.n) H(ro, "punch", "Punch note · " + nm, "", c.n, c.op, true);
  });
  Object.keys(old.punches).forEach(function(id){
    if(cur.punches[id]) return;
    var p = old.punches[id], ro = getRO(p.ro);
    if(ro) H(ro, "punch", "Punch deleted · " + jobName(ro, p.op), autoClock(p.a) + "–" + (p.b ? autoClock(p.b) : "running"), "", p.op);
  });

  var raised = (!swapped && AUTO_CHAIN < 3) ? autoEvaluate(events) : 0;
  var pruned = autoPrune();
  if(touched || raised || pruned || closedMoved){
    AUTO_SILENT = true; scheduleSave(true); AUTO_SILENT = false;   /* history lines are not an undo step of their own */
    autoRepaint(raised || pruned);
  }
}
function taskName(t){ var d = WF_TASKS.filter(function(x){ return x.id === t; })[0]; return d ? d.name : t; }
