/* Parsec · ro · actions.js
   The actions that change an RO or a clock: doStartPunch / doStopPunch, status flips, pushToast (with Undo while it is still the last change), migrateRO for old records, Parsec 14.8's Declined start.
   Flow: an action changes STATE, pushUndo first, scheduleSave after, render(); the automations watcher sees the change at save.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pushToast creditBurnt stampFromIso migrateRO v148DecStart doStartPunch doStartPunch0 doStopPunch markStatusFlip addRO addOperation addPart … (24 functions, 1 constant)
   state      lastBackupAt punches ros
   uses       access/ automations/ clock/ data/ import/ kit/ pages/inventory/ pages/warranty/ ro-page/ shell/ state/
*/
/* ============================== ACTIONS ============================== */
function pushToast(msg, undoable){
  UI.toast = msg; UI.toastUndo = !!undoable; UI.toastUndoRef = undoable ? UNDO[UNDO.length - 1] : null;   /* Undo only while it's still the last thing done */
  render();
  setTimeout(function(){ if(UI.toast===msg){ UI.toast=null; UI.toastUndo=false; var w=document.querySelector(".toast-wrap"); if(w) w.remove(); } }, undoable ? 7000 : 2600);
}

/* When a clock stops, its time is added to that job's typed Burnt — once. */
function creditBurnt(p){
  if(!p || !p.stop) return;
  p.burntCredited = true;
  syncAllBurnt();
}

/* Bring an RO up to what the RO Job Console expects. Safe to run any number of times. */
var BULLETIN_FROM_CHECKLIST = { updateForeman:["workflow","Foreman updated"], connectUnit:["connect"], initialDashPic:["dashpic"],
  updateLocation:["location"], uploadDtc:["dtc"], techStories:["techstory"], uploadPics:["pics"], eodNote:["eod"] };
function stampFromIso(iso){
  var d = new Date(iso); if(isNaN(d)) return "";
  var p2 = function(n){ return String(n).padStart(2,"0"); };
  return "  \u2014 "+p2(d.getMonth()+1)+"-"+p2(d.getDate())+"-"+d.getFullYear()+" "+p2(d.getHours())+":"+p2(d.getMinutes())+":"+p2(d.getSeconds());
}
function migrateRO(ro){ x132Unglue(ro);   /* Parsec 14 */
  if(!Array.isArray(ro.bulletins)){
    ro.bulletins = [];
    var base = ro.dateOpened ? new Date(ro.dateOpened).getTime() : Date.now();
    if(isNaN(base)) base = Date.now();
    CHECKLIST_ITEMS.forEach(function(ci, i){
      if(!(ro.checklist && ro.checklist[ci[0]])) return;
      var m = BULLETIN_FROM_CHECKLIST[ci[0]]; if(!m) return;
      var e = { oid: uid("bl"), task: m[0], done: true, fields: {}, place: "", files: [], at: new Date(base + i*60000).toISOString(), tickedAt: new Date(base + i*60000).toISOString() };
      if(m[1]) e.fields.Notes = m[1];
      ro.bulletins.push(e);
    });
  }
  (ro.operations||[]).forEach(function(op){
    if(!op.jobType) op.jobType = opJobType(op);
    if(typeof op.work !== "string"){
      var lg = (op.log||[]).slice().sort(function(a,b){ return new Date(a.at) - new Date(b.at); });
      op.work = lg.map(function(e){ return (e.kind==="fix"?"Fix: ":"Cause: ") + esc(e.text) + stampFromIso(e.at); }).join("<br>") + (lg.length ? "<br>" : "");
    }
    if(typeof op.burnt !== "number"){
      var ms = 0;
      STATE.punches.forEach(function(p){ if(p.opId===op.id && p.stop){ ms += new Date(p.stop) - new Date(p.start); p.burntCredited = true; } });
      op.burnt = Math.round(ms / 3600000 * 1000) / 1000;
    }
    if(!Array.isArray(op.parts)) op.parts = [];
  });
}

function v148DecStart(roId, opId){ var ro = getRO(roId), op = ro && (ro.operations || []).filter(function(o){ return o && o.id === opId; })[0]; if(op && op.declined){ pushToast('Op ' + (ro.operations.indexOf(op) + 1) + ' is declined — pick another status to work on it.'); return true; } return false; }   /* Parsec 14.8 */
function doStartPunch(roId, opId, reason){ if(v148DecStart(roId, opId)) return; if(v141StartGate(roId, opId, reason)) return; return doStartPunch0(roId, opId, reason); }   /* Parsec 14.1 */
function doStartPunch0(roId, opId, reason){
  var op = getOp(roId, opId);
  if(!op || op.declined){ pushToast("That operation can't be punched."); return; }
  var lk = opPartLock(op, reason);
  if(lk){
    pushToast("Can\u2019t start repairing \u2014 " + (lk.description || lk.partNumber || "a part") + " isn\u2019t in hand. Opening the parts.");
    if(roId !== SHOP_RO_ID){ UI.selectedRo = roId; UI.view = "ros"; if(!UI.roOpen || typeof UI.roOpen !== "object") UI.roOpen = {}; UI.roOpen[roId] = [opId]; UI.jcFocusParts = opId; persistUI(); UI.modal = null; render(); }
    return;
  }
  pushUndo("start punch");
  var reo = opReopenMark(op, roId, "start");   /* Parsec 12.8: it was complete — it opens back up */
  commitNoteDrafts();
  ensureOnClock();
  if(roId === SHOP_RO_ID) reason = op.complaint;
  var rp = runningPunch();
  if(rp){ rp.stop = nowIso(); rp.stopReason = isShopPunch(rp) ? "Done" : (rp.roId === roId ? "Switched job" : "Pulled to another truck"); creditBurnt(rp); }
  STATE.punches.push({ id: uid("pn"), roId: roId, opId: opId, start: nowIso(), stop:null, startReason: reason, stopReason:null, notes:"", by: punchByName() });
  markStatusFlip(getRO(roId));
  UI.modal = null;
  scheduleSave(true);
  render();
  if(reo) setTimeout(function(){ pushToast(reo + " reopened \u2014 your clock is running.", true); }, 0);
}
function doStopPunch(reason, notes){
  var rp = runningPunch();
  if(!rp){ pushToast("No punch running."); return; }
  if(/^Complete/.test(reason || "")){                     /* completing needs the parts installed — notes are a final check (Parsec 12.5) */
    var cop = getOp(rp.roId, rp.opId), tmp = rp.notes; if(notes && String(notes).trim()) rp.notes = (rp.notes || "") + " " + notes;
    var gg = cop ? v141GapsAsk(cop).filter(function(x){ return !(x.k === "notes" && notes && String(notes).trim()); }) : [];
    rp.notes = tmp;
    if(gg.length){ reason = "Hold Tech"; }   /* Parsec 14.1: the question asks — no toast */
  }
  pushUndo("stop punch");
  commitNoteDrafts();
  rp.stop = nowIso(); rp.stopReason = reason;
  if(notes && String(notes).trim()){ var nl = autoPunct(String(notes).trim()); rp.notes = (String(rp.notes || "").trim() ? String(rp.notes).replace(/\s+$/, "") + "\n" : "") + nl; ockNoteTime(rp, nl); }
  creditBurnt(rp);
  UI.modal = null;
  scheduleSave(true);
  render();
}
function markStatusFlip(ro){
  if(!ro) return;
  var st = roStatus(ro);
  ro._lastKnownStatus = st.status;
}

function addRO(fields){
  pushUndo("add RO");
  var ro = {
    id: uid("ro"), roNumber: fields.roNumber, customerName: fields.customerName, caseNumber: fields.caseNumber||"",
    dateOpened: fields.dateOpened || nowIso(), dateClosed:null,
    vin:"", mileage:"", engineHours:"", engineType:"", unitNumber:"", keyTag:"",
    location:"", buildDate:"", warrantyStart:"", techSupportCase:"",
    checklist:{updateForeman:false,initialDashPic:false,updateLocation:false,uploadPics:false},
    checklistPopupPending:false, _lastKnownStatus:"Hold Tech",
    status:{ status:"Hold Tech", sub:null, setAt: nowIso() },
    operations: [], bulletins: []
  };
  STATE.ros.push(ro);
  scheduleSave(true);
  return ro;
}
function addOperation(roId, fields, isStandard){
  var ro = getRO(roId); if(!ro) return;
  pushUndo("add operation");
  var op = {
    id: uid("op"),
    complaint: isStandard ? fields.standardName : fields.complaint,
    cause: isStandard ? "" : (fields.cause||""),
    correction: isStandard ? "" : (fields.correction||""),
    quoted: parseFloat(fields.quoted)||0,
    isStandard: !!isStandard, standardName: isStandard?fields.standardName:null,
    declined:false, parts: [], burnt: 0, work: ""
  };
  op.jobType = opJobType(op);
  ro.operations.push(op);
  scheduleSave(true);
  return op;
}
function addPart(roId, opId, fields){
  var op = getOp(roId,opId); if(!op) return;
  pushUndo("add part");
  var np0 = { id: uid("pt"), description:fields.description, partNumber:fields.partNumber, qty:fields.qty||1, status:"Not Ordered", eta:"", statusChangedAt: nowIso() };
  op.parts.push(np0); invAddFromPart(np0, getRO(roId) && getRO(roId).roNumber);
  scheduleSave(true);
}
function updatePartStatus(roId, opId, partId, status){
  var op = getOp(roId,opId); if(!op) return;
  var part = op.parts.find(function(p){return p.id===partId;});
  if(!part) return;
  if(part.status!==status){ part.status = status; part.statusChangedAt = nowIso(); if(part.dismM4 && status!=="Ordered" && status!=="Backordered") part.dismM4=false; }
  scheduleSave(true);
  render();
}
function updatePunchReasons(punchId, startReason, stopReason){
  var p = STATE.punches.find(function(x){ return x.id===punchId; });
  if(!p) return false;
  var sameStart = p.startReason === startReason;
  var sameStop = !p.stop || (p.stopReason||"") === (stopReason||"");
  if(sameStart && sameStop) return false;
  pushUndo("change punch reasons");
  if(!p.reasonEdited){ p.reasonEdited = true; p.origStartReason = p.startReason; p.origStopReason = p.stopReason; }
  p.startReason = startReason;
  if(p.stop && stopReason) p.stopReason = stopReason;
  p.editedAt = nowIso();
  scheduleSave(true);
  return true;
}
function updateROField(roId, field, val, typing){
  var ro=getRO(roId); if(!ro) return;
  ro[field]=val;
  if(field==="vin"||field==="unitNumber"||field==="mileage") ro.dismM7=false;
  scheduleSave(!typing);
}

function editPunchCommit(punch, fields){
  var start = fields.start, stop = fields.stop || null;
  if(!start || isNaN(new Date(start))) return {ok:false, msg:"A start time is required."};
  if(!stop && punch.stop) return {ok:false, msg:"A stop time is required."};
  if(stop && new Date(stop) <= new Date(start)) return {ok:false, msg:"Stop must be after start."};
  if(!stop && new Date(start) > new Date()) return {ok:false, msg:"A running punch can't start in the future."};
  var who = punchOwner(punch);   /* Parsec 12.7: only the same person's punches clash */
  var overlap = STATE.punches.some(function(p){
    if(p.id===punch.id || !sameOwner(punchOwner(p), who)) return false;
    return new Date(start) < new Date(p.stop||Date.now()) && new Date(stop||Date.now()) > new Date(p.start);
  });
  if(overlap) return {ok:false, msg:"Overlaps another punch — you can only be on one operation at a time."};
  pushUndo("edit punch");
  if(!punch.edited){ punch.edited=true; punch.originalStart=punch.start; punch.originalStop=punch.stop; punch.editedAt=nowIso(); }
  var wasRunning = !punch.stop;
  punch.start = start; punch.stop = stop; punch.startReason = fields.startReason; punch.stopReason = stop ? (fields.stopReason || punch.stopReason || null) : null; punch.opId = fields.opId; punch.notes = fields.notes;
  if(wasRunning && stop) creditBurnt(punch);
  scheduleSave(true);
  return {ok:true};
}
function addManualPunch(fields){
  if(!fields.start || !fields.stop) return {ok:false,msg:"Both a start and a stop are required."};
  if(new Date(fields.stop)<=new Date(fields.start)) return {ok:false,msg:"Stop must be after start."};
  var who = fields.by || pcMe();   /* Parsec 12.7: yours, or the person handed in */
  var overlap = STATE.punches.some(function(p){ return sameOwner(punchOwner(p), who) && new Date(fields.start) < new Date(p.stop||Date.now()) && new Date(fields.stop) > new Date(p.start); });
  if(overlap) return {ok:false,msg:"Overlaps an existing punch."};
  pushUndo("add manual punch");
  STATE.punches.push({ id:uid("pn"), roId:fields.roId, opId:fields.opId, start:fields.start, stop:fields.stop, startReason:fields.startReason, stopReason:fields.stopReason, notes:fields.notes||"", manual:true, by: fields.by || punchByName() });
  scheduleSave(true);
  return {ok:true};
}
/* CSV */
function csvEscape(v){ v = String(v==null?"":v); if(/[",\n]/.test(v)) return '"'+v.replace(/"/g,'""')+'"'; return v; }
function exportCSV(){
  var rows = [["date","roNumber","operation","start","stop","startReason","stopReason","durationHrs","notes","manual","edited"]];
  allDates().forEach(function(d){
    punchesForDate(d).forEach(function(p){
      var ro = getRO(p.roId), op = ro ? getOp(ro.id, p.opId) : null;
      var hrs = p.stop ? decHours(new Date(p.stop)-new Date(p.start)) : "";
      rows.push([d, ro?ro.roNumber:"", op?op.complaint:"", p.start, p.stop||"",
                 p.startReason||"", p.stopReason||"", hrs, p.notes||"", p.manual?"yes":"", (p.edited||p.reasonEdited)?"yes":""]);
    });
  });
  var csv = rows.map(function(r){ return r.map(csvEscape).join(","); }).join("\n");
  deliverFile("time-log-"+todayStr()+".csv", csv, "text/csv");
}
function exportJSON(){
  STATE.lastBackupAt = nowIso(); scheduleSave();   /* for the weekly backup reminder */
  deliverFile("execution-console-backup-"+todayStr()+".json", JSON.stringify(STATE,null,2), "application/json");
}

/* Prefer writing straight into the tech's own folder; fall back to a browser download. */
function deliverFile(filename, text, mime){
  if(FS.status==="connected"){
    writeFileToFolder("exports", filename, text)
      .then(function(){ pushToast("Saved to "+FS.dirName+" / exports / "+filename); })
      .catch(function(){ browserDownload(filename, text, mime); });
    return;
  }
  if(downloadsCap){
    downloadsCap.save({filename:filename, data:text})
      .then(function(){ pushToast("Exported."); })
      .catch(function(e){ if(!e || e.code!=="declined") browserDownload(filename, text, mime); });
    return;
  }
  browserDownload(filename, text, mime);
}
function browserDownload(filename, text, mime){
  try{
    var blob = new Blob([text], {type: mime||"text/plain"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 1500);
    pushToast("Downloaded "+filename);
  }catch(e){ pushToast("Couldn't export: "+(e&&e.name||"error")); }
}
function parseCSV(text){
  /* Character by character, so a quoted field may hold commas and line breaks —
     exportCSV writes multi-line notes exactly that way. */
  text = String(text||"").replace(/^\uFEFF/, "");
  var rows=[], row=[], cur="", inQ=false;
  for(var i=0;i<text.length;i++){
    var c=text[i];
    if(inQ){
      if(c==='"'){ if(text[i+1]==='"'){ cur+='"'; i++; } else inQ=false; }
      else cur+=c;
    } else if(c==='"') inQ=true;
    else if(c===','){ row.push(cur); cur=""; }
    else if(c==='\r' || c==='\n'){
      if(c==='\r' && text[i+1]==='\n') i++;
      row.push(cur); cur="";
      if(row.length>1 || row[0]!=="") rows.push(row);
      row=[];
    } else cur+=c;
  }
  row.push(cur);
  if(row.length>1 || row[0]!=="") rows.push(row);
  return rows;
}
function importCSV(text){
  pushUndo("import CSV");
  var rows = parseCSV(text);
  if(!rows.length) return {imported:0, rejected:[]};
  var header = rows[0], idx = {};
  header.forEach(function(h,i){ idx[h.trim()] = i; });
  var imported = 0, rejected = [];
  for(var r=1; r<rows.length; r++){
    var row = rows[r];
    if(row.length < 2) continue;
    try{
      var roNum = row[idx.roNumber], opName = row[idx.operation];
      var ro = STATE.ros.find(function(x){ return x.roNumber===roNum; });
      if(!ro) throw "Unknown RO "+roNum;
      var op = ro.operations.find(function(o){ return o.complaint===opName; });
      if(!op) throw "Unknown Operation "+opName;
      var start = row[idx.start], stop = row[idx.stop] || null;
      if(!start) throw "Missing start";
      if(!okTime(start)) throw "Start time \u201c" + start + "\u201d can\u2019t be read";
      if(stop && !okTime(stop)) throw "Stop time \u201c" + stop + "\u201d can\u2019t be read";
      start = isoOf(start); if(stop) stop = isoOf(stop);
      if(stop && new Date(stop) <= new Date(start)) throw "Stop is not after start";
      var dupe = STATE.punches.some(function(p){ return p.start===start && p.opId===op.id; });
      if(dupe) throw "Already imported";
      var clash = STATE.punches.some(function(p){
        return new Date(start) < new Date(p.stop||Date.now()) && new Date(stop||Date.now()) > new Date(p.start);
      });
      if(clash) throw "Overlaps an existing punch";
      STATE.punches.push({ id:uid("pn"), roId:ro.id, opId:op.id, start:start, stop:stop,
        startReason: row[idx.startReason]||"Repairing", stopReason: row[idx.stopReason]||null,
        notes: row[idx.notes]||"", manual:true });
      imported++;
    }catch(e){ rejected.push("Row "+(r+1)+": "+e); }
  }
  scheduleSave(true);
  return {imported:imported, rejected:rejected};
}
