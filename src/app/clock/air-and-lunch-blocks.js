/* Parsec · clock · air-and-lunch-blocks.js
   Air and lunch blocks on the day: a deleted time entry stays as air and says what it was (15 C), who wrote a note, the air reason as a note.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v150Hole v150PunchGone v150StampBy v150NoteWho v150NoteOk v150HolesOf deletePunch pruneHoles fmtClockHM roMatch roMatchesFilter roGroupOf … (14 functions)
   state      holes punches ros
   uses       access/ data/ kit/ pages/ pages/triage/ ro/ ro-page/ shell/ state/ trucks/
   at load    wraps scheduleSave
*/
/* ---------- air & lunch blocks: click to change the reason or the times ---------- */

/* ---------- Parsec 15 (C): a deleted time entry stays as air and says what it was · who wrote a note ---------- */
/* the record a deleted punch leaves: whose time it was, what it was on, who deleted it and when */
function v150Hole(p){
  var ro = null, op = null; try{ ro = getRO(p.roId); op = ro ? (ro.operations || []).filter(function(o){ return o.id === p.opId; })[0] : null; }catch(e){}
  var shop = false; try{ shop = typeof isShopPunch === "function" && isShopPunch(p); }catch(e){}
  var lbl = shop ? "shop time" : ro ? (typeof tgNum === "function" ? String(tgNum(ro)) : String(ro.roNumber || "")) : "a punch";
  var who = ""; try{ who = (typeof PG !== "undefined" && PG.me && PG.me().name) || (typeof punchByName === "function" ? punchByName() : "") || ""; }catch(e){}
  return { id: uid("hl"), start: p.start, stop: p.stop, by: (typeof punchWho === "function" ? punchWho(p) : p.by) || p.by || "", roId: p.roId, opId: p.opId,
    label: lbl, what: shop ? (op && op.complaint || "") : (op && op.complaint || ""), delBy: who || "Admin", delAt: nowIso() };
}
/* deleting without an Undo of its own (an approved ask runs inside the approval's Undo) */
function v150PunchGone(p){
  var i = (STATE.punches || []).indexOf(p); if(i < 0) return false;
  try{ audit("punch-del", "Deleted a punch on " + (getRO(p.roId) ? roLabel(getRO(p.roId)) : "an RO") + " (" + fmtTime(p.start) + (p.stop ? "–" + fmtTime(p.stop) : "") + ")", getRO(p.roId)); }catch(e){}
  if(p.stop){ STATE.holes = STATE.holes || []; STATE.holes.push(v150Hole(p)); }
  STATE.punches.splice(i, 1); try{ syncAllBurnt(); }catch(e){} scheduleSave(true); return true;
}
/* notes that aren't on a punch: who wrote them (new ones are stamped as they're saved) and who may change them */
function v150StampBy(){
  var now = Date.now(), me = ""; try{ me = (typeof PG !== "undefined" && PG.me && PG.me().name) || (typeof punchByName === "function" ? punchByName() : "") || ""; }catch(e){}
  if(!me || !STATE || !Array.isArray(STATE.ros)) return;
  STATE.ros.forEach(function(ro){ (ro.operations || []).forEach(function(op){
    [op.log, op.offNotes].forEach(function(L){ if(!Array.isArray(L)) return; L.forEach(function(n){ if(n && !n.by && n.at && n.text && Math.abs(now - new Date(n.at).getTime()) < 120000) n.by = me; }); });
  }); });
}
function v150NoteWho(job, ref, ro){ return (ref && ref.by) || (job && job.assignedTech) || (ro && ro.assignedTech) || ""; }
function v150NoteOk(job, ref, ro){
  var sf = null; try{ sf = typeof viewAsStaff === "function" ? viewAsStaff() : null; }catch(e){}
  if(!sf) return { ok: true };                                                     /* the admin, or no sign-in */
  if(/^(Foreman|Manager|Admin)$/.test(sf.role || "")) return { ok: true };
  var w = v150NoteWho(job, ref, ro); if(w && (typeof techSame === "function" ? techSame(w, sf.name) : w === sf.name)) return { ok: true };
  var f = String(w || "").trim().split(/\s+/)[0];
  return { ok: false, why: f ? "Only " + f + " or a foreman can change " + f + "’s note" : "Only the writer or a foreman can change this note" };
}
function v150HolesOf(job){ return (Array.isArray(STATE.holes) ? STATE.holes : []).filter(function(h){ return h && job && h.opId === job.id && h.start && h.stop && h.by; }); }
(function(o){ scheduleSave = function(){ try{ v150StampBy(); }catch(e){} return o.apply(this, arguments); }; })(scheduleSave);

function deletePunch(id){
  var i = STATE.punches.findIndex(function(x){ return x.id===id; });
  if(i < 0) return;
  var p = STATE.punches[i];
  pushUndo("delete punch");
  audit("punch-del", "Deleted a punch on " + (getRO(p.roId) ? roLabel(getRO(p.roId)) : "an RO") + " (" + fmtTime(p.start) + (p.stop ? "\u2013" + fmtTime(p.stop) : "") + ")", getRO(p.roId));
  if(p.stop){
    STATE.holes = STATE.holes || [];
    STATE.holes.push(v150Hole(p));   /* Parsec 15: whose, what, who deleted it */
  }
  STATE.punches.splice(i,1);
  UI.segPick = null;
  scheduleSave(true);
}

/* A slot stops existing the moment real time is logged over it. */
function pruneHoles(state){
  if(!state.holes || !state.holes.length) return;
  state.holes = state.holes.filter(function(hh){
    var hs = new Date(hh.start), he = new Date(hh.stop);
    if(!(he > hs)) return false;
    return !state.punches.some(function(p){
      if(!p.stop) return false;
      if(hh.by && typeof sameOwner === "function" && typeof punchOwner === "function" && !sameOwner(punchOwner(p), hh.by)) return false;   /* Parsec 15: only the same person's time fills it */
      return new Date(p.start) < he && new Date(p.stop) > hs;
    });
  });
}

function fmtClockHM(d){ return String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0"); }

/* Where does the filter text appear on this RO? null = nowhere, "" = the obvious fields,
   otherwise a short note like "PN 4988201" shown on the RO card. */
function roMatch(ro, filter){
  if(!filter) return "";
  var f = String(filter).toLowerCase().trim();
  if(!f) return "";
  function has(v){ return v != null && String(v).toLowerCase().indexOf(f) !== -1; }
  if(has(ro.roNumber) || has(ro.customerName) || has(ro.caseNumber) || has(ro.unitNumber)) return "";
  try{ if(typeof trkLabel === "function"){ var tl = trkLabel(ro).toLowerCase(); if(f.split(/\s+/).every(function(w){ return tl.indexOf(w) !== -1 || tl.replace(/\s+/g, "").indexOf(w) !== -1; })) return ""; } }catch(e){}
  var ops = ro.operations || [], i, j;
  for(i = 0; i < ops.length; i++) if(has(ops[i].complaint)) return "";
  var fc = f.replace(/\s+/g, "");
  if(ro.vin && String(ro.vin).toLowerCase().indexOf(fc) !== -1) return "VIN …" + String(ro.vin).slice(-8);
  if(has(ro.keyTag)) return "Tag " + ro.keyTag;
  if(has(ro.location)) return "Location " + ro.location;
  for(i = 0; i < ops.length; i++){
    var parts = ops[i].parts || [];
    for(j = 0; j < parts.length; j++){
      if(has(parts[j].partNumber)) return "PN " + parts[j].partNumber;
      if(has(parts[j].description)) return "Part: " + parts[j].description;
    }
  }
  for(i = 0; i < ops.length; i++){
    var txt = String(ops[i].work || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
    var k = txt.toLowerCase().indexOf(f);
    if(k === -1 && fc !== f) k = txt.toLowerCase().replace(/\s+/g, "").indexOf(fc) === -1 ? -1 : 0;
    if(k !== -1) return "Work: …" + txt.substr(Math.max(0, k - 12), 40).trim() + "…";
    var logs = ops[i].log || [];
    for(j = 0; j < logs.length; j++) if(has(logs[j].text)) return "Log: …" + String(logs[j].text).slice(0, 36) + "…";
  }
  if(has(ro.techNote)) return "Note: \u2026" + String(ro.techNote).replace(/\s+/g, " ").trim().slice(0, 36) + "\u2026";
  var bl = ro.bulletins || [];
  for(i = 0; i < bl.length; i++){
    var fl = bl[i].fields || {};
    for(var key in fl) if(has(fl[key])) return "Note: …" + String(fl[key]).slice(0, 36) + "…";
    if(has(bl[i].place)) return "Location " + bl[i].place;
    var files = bl[i].files || [];
    for(j = 0; j < files.length; j++) if(has(files[j].name)) return "File " + files[j].name;
  }
  return null;
}
function roMatchesFilter(ro, filter){ return roMatch(ro, filter) !== null; }

function roGroupOf(ro){
  if(roIsDone(ro)) return "done";
  var s = roStatus(ro).status;
  if(s === "Working") return "working";
  if(/^Waiting/.test(s)) return "waiting";
  return "hold";
}
function visibleRos(){
  var g = UI.roGroup || "all";
  return sortedROs().filter(function(ro){
    if(!roMatchesFilter(ro, UI.roFilter) || !roInScope(ro)) return false;
    if(!(g === "all" || roGroupOf(ro) === g || roGroupOf(ro) === "done")) return false;
    return true;
  });
}
function viewROs(){
  roFitWidths();
  var ros = visibleRos();
  var openN = STATE.ros.filter(function(ro){ return !roIsDone(ro); }).length, doneN = STATE.ros.length - openN;
  /* no page header here — the RO list and the console start at the top */
  var roHead = '';
  var openN = STATE.ros.filter(function(ro){ return !roIsDone(ro); }).length, doneN = STATE.ros.length - openN;

  if(!STATE.ros.length){
    return roHead + '<div class="inv-empty">'+esHtml('doc', 'No repair orders open', 'Add the first RO, or load the 5 sample trucks to look around.',
      '<button class="btn btn-primary" data-action="open-add-ro">'+IC.plus+'<span>New repair order</span></button>'
      + '<button class="btn" data-action="load-sample">'+IC.sample+'<span>Generate 25 samples</span></button>')+'</div>';
  }

  // keep a valid selection
  var sel = UI.selectedRo;
  if(sel !== SHOP_RO_ID && (!sel || !getRO(sel))) sel = ros.length ? ros[0].id : (STATE.ros[0] ? STATE.ros[0].id : null);
  UI.selectedRo = sel;
  if(!Array.isArray(UI.recentRos)) UI.recentRos = [];
  if(sel && UI.recentRos[0] !== sel) UI.recentRos = [sel].concat(UI.recentRos.filter(function(x){ return x !== sel && getRO(x); })).slice(0, 6);

  var railMini = true;
  railWasMini = railMini;
  UI.roPaneShut = false;
  
  var h = roHead + '<div class="ro-page'+(railMini?" rail-hidden":"")+'">';

  /* the RO list is its own page now (RO List) — this page opens on one RO, with a line to go back */
  /* no back line — the browser's Back button goes back to the RO List */

  /* ---- detail: the selected RO ---- */
  h += sel ? '<div class="ro-detail-pane jc-pane" data-jc="'+sel+'" data-scroll="ro-pane"></div>'
           : '<div class="ro-detail-pane"><div class="empty"><h3>Nothing selected</h3></div></div>';
  /* the day bar is gone from this page — the Time Log and the Console still carry it */
  h += '</div>';
  return h;
}
