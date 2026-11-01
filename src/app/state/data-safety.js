/* Parsec · state · data-safety.js
   Guards around the data (round 25): burnt hours re-derived from punches (syncAllBurnt), clashing punches, Undo snapshots as JSON, the local-day cache, and restoring a backup file (restoreBackup / summarizeState).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   localDay punchHoursByOp punchHours syncAllBurnt setTypedBurnt punchClash undoJson undoBaseline deepActiveField autoUndoPoint tabClaim takeOverTab … (19 functions, 14 constants)
   state      punches ros savedAt
   uses       automations/ clock/ data/ ro/ shell/
   at load    2× wraps TAB_CH
*/
/* ============================== DATA SAFETY (round 25) ============================== */
/* Days are the technician's local days — a punch at 9 pm belongs to today, not tomorrow (UTC). */
var LOCAL_DAY_CACHE = {};
function localDay(iso){
  if(!iso) return "";
  var c = LOCAL_DAY_CACHE[iso]; if(c) return c;
  var d = new Date(iso); if(isNaN(d)) return String(iso).slice(0,10);
  c = todayStr(d);
  if(Object.keys(LOCAL_DAY_CACHE).length > 5000) LOCAL_DAY_CACHE = {};
  return (LOCAL_DAY_CACHE[iso] = c);
}

/* Burnt = what you typed as an adjustment + every stopped punch on the job. Punches added,
   edited, moved or deleted anywhere change Burnt with them. */
function punchHoursByOp(onlyCredited){
  var m = {};
  STATE.punches.forEach(function(p){
    if(!p.stop || (onlyCredited && !p.burntCredited)) return;
    var h = (new Date(p.stop) - new Date(p.start)) / 3600000;
    if(h > 0) m[p.opId] = (m[p.opId] || 0) + h;
  });
  return m;
}
function punchHours(opId){ return punchHoursByOp(false)[opId] || 0; }
function syncAllBurnt(){
  if(!STATE || !STATE.ros) return;
  var all = null, cred = null;
  STATE.ros.forEach(function(ro){ (ro.operations || []).forEach(function(op){
    if(typeof op.burnt !== "number") return;
    if(typeof op.burntAdj !== "number"){
      cred = cred || punchHoursByOp(true);
      op.burntAdj = Math.round((op.burnt - (cred[op.id] || 0)) * 1000) / 1000;
    }
    all = all || punchHoursByOp(false);
    op.burnt = Math.max(0, Math.round((op.burntAdj + (all[op.id] || 0)) * 1000) / 1000);
  }); });
}
function setTypedBurnt(op, hours){
  op.burntAdj = Math.round((hours - punchHours(op.id)) * 1000) / 1000;
  op.burnt = Math.max(0, Math.round(hours * 1000) / 1000);
}

/* One place that decides whether a punch clashes with another (you can only be on one job at a time). */
function punchClash(ignoreId, startMs, stopMs, who){
  var now = Date.now();
  if(who == null){ var own = ignoreId ? STATE.punches.filter(function(x){ return x.id === ignoreId; })[0] : null; who = own ? punchOwner(own) : pcMe(); }   /* Parsec 12.7: that person's punches */
  return STATE.punches.filter(function(p){
    if(p.id === ignoreId || !sameOwner(punchOwner(p), who)) return false;
    var a = new Date(p.start).getTime(), b = p.stop ? new Date(p.stop).getTime() : now;
    return startMs < b && (stopMs == null ? now : stopMs) > a;
  })[0] || null;
}

/* Undo covers everything: a change that didn't make its own undo point gets one, and a burst of
   typing in one place becomes a single step. */
var UNDO_BASE = null, UNDO_EXPLICIT = false, UNDOING = false, UNDO_HOLD = false, UNDO_HSAVE = false, UNDO_HT = 0;
/* The save stamp changes on every save, so it is left out of the comparison — otherwise two
   saves in a row made an empty "edit" undo step that undid nothing you could see. */
function undoJson(){ var sa = STATE.savedAt; STATE.savedAt = 0; try{ return JSON.stringify(STATE); } finally { STATE.savedAt = sa; } }
function undoBaseline(){ try{ UNDO_BASE = undoJson(); }catch(e){ UNDO_BASE = null; } UNDO_EXPLICIT = false; }
function deepActiveField(){
  var a = document.activeElement;
  while(a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
  return a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable) ? a : null;
}
function autoUndoPoint(){
  if(UNDOING) return;
  if(AUTO_SILENT){ try{ UNDO_BASE = undoJson(); }catch(e){} return; }   /* history lines alone are not an undo step */
  var now; try{ now = undoJson(); }catch(e){ return; }
  if(UNDO_BASE !== null && now !== UNDO_BASE && !UNDO_EXPLICIT){
    var top = UNDO[UNDO.length - 1], field = deepActiveField();
    if(top && top.auto && field && top.field === field && Date.now() - top.at < 4000){ top.at = Date.now(); }   /* still typing in the same box */
    else {
      UNDO.push({ snapshot: UNDO_BASE, label: "edit", at: Date.now(), auto: true, field: field });
      if(UNDO.length > UNDO_MAX) UNDO.shift();
    }
  }
  UNDO_BASE = now; if(UNDO_HOLD) UNDO_HSAVE = true; else UNDO_EXPLICIT = false;   /* saves inside the same action stay part of its undo step */
}

/* Only one tab writes. Opening the app in another tab (or window) pauses this one. */
var TAB_ID = Math.random().toString(36).slice(2), TAB_LOCKED = false, TAB_CH = null;
try{ TAB_CH = new BroadcastChannel("tec-pro-tabs"); }catch(e){ TAB_CH = null; }
function tabClaim(){ if(TAB_CH) try{ TAB_CH.postMessage({ type:"claim", id: TAB_ID }); }catch(e){} }
if(TAB_CH) TAB_CH.onmessage = function(ev){
  var m = ev.data || {};
  if(m.type === "claim" && m.id !== TAB_ID && !TAB_LOCKED){
    if(saveTimer){ clearTimeout(saveTimer); doSave(); }            /* hand over with everything written */
    TAB_LOCKED = true; UI.modal = null; render();
  }
};
function takeOverTab(){ tabClaim(); location.reload(); }

/* Another device (or a stale window) saved to the folder after we last read it: don't overwrite. */
var FOLDER_SEEN = 0;
var STORAGE_FULL = false;
function alertBannerHtml(){
  var h = "";
  if(TAB_LOCKED) h += '<div class="lock-screen" data-key="tab-lock"><div class="lock-card">'
    + '<b>Parsec is open in another tab</b><p>To keep your hours safe, only one tab saves at a time. This tab is paused.</p>'
    + '<button class="btn btn-primary" data-action="tab-takeover">Use Parsec here</button></div></div>';
  if(UI.folderConflict) h += '<div class="alert-bar warn" data-key="alert-conflict"><span><b>Newer data in the folder.</b> Another device or window saved after this one last read it, so saving here is paused.</span>'
    + '<button class="btn btn-sm" data-action="conflict-load">Load the folder’s copy</button>'
    + '<button class="btn btn-sm" data-action="conflict-keep">Keep mine and overwrite</button></div>';
  h += pd16BannerHtml();
  if(STORAGE_FULL) h += '<div class="alert-bar bad" data-key="alert-storage"><span><b>Browser storage is full.</b> Your work is being kept in backup storage'
    + (FS.status === "connected" ? ' and your folder.' : ' — connect a folder so it is also saved to your computer.') + '</span>'
    + (FS.status === "connected" ? '' : '<button class="btn btn-sm" data-action="storage">Connect a folder</button>') + '</div>';
  return h;
}
function idbSaveState(json){ return idbSet("stateBackup", json).catch(function(){}); }

/* A clock that has run more than 10 hours, or since an earlier day, is almost always a forgotten one. */
var LONG_CLOCK_H = 10, longClockAsked = {};
function checkLongClock(){
  if(TAB_LOCKED || UI.modal) return;
  var p = runningPunch(); if(!p || longClockAsked[p.id]) return;
  var hrs = (Date.now() - new Date(p.start)) / 3600000;
  if(hrs < LONG_CLOCK_H && localDay(p.start) === todayStr()) return;
  longClockAsked[p.id] = true;
  UI.modal = { type:"long-clock", punchId: p.id }; render();
}

function pushUndo(label){
  try{
    UNDO.push({ snapshot: JSON.stringify(STATE), label: label, at: Date.now() });
    if(UNDO.length > UNDO_MAX) UNDO.shift();
    UNDO_EXPLICIT = true;
    UNDO_HOLD = true;
    if(!UNDO_HT){ UNDO_HSAVE = false; UNDO_HT = setTimeout(function(){ UNDO_HT = 0; UNDO_HOLD = false; if(UNDO_HSAVE) UNDO_EXPLICIT = false; UNDO_HSAVE = false; }, 0); }
  }catch(e){}
}
function undoLast(){
  if(!UNDO.length){ pushToast("Nothing to undo."); return; }
  var u = UNDO.pop();
  while(u && u.label !== "automation" && UNDO.length && u.at && UNDO[UNDO.length - 1].at && u.at - UNDO[UNDO.length - 1].at < 80) u = UNDO.pop();   /* Parsec 14 */
  /* Parsec 12: an automation's step that came right after a change goes back with it — one Undo, not two */
  while(u && u.label === "automation" && UNDO.length && u.at - (UNDO[UNDO.length - 1].at || 0) < 4000) u = UNDO.pop();   /* Parsec 12.7: every one of them */
  try{ STATE = normalizeState(JSON.parse(u.snapshot)); }
  catch(e){ pushToast("Couldn't undo that."); return; }
  if(u.reselect && getRO(u.reselect)){ UI.selectedRo = u.reselect; UI.view = "ros"; }
  UNDOING = true; scheduleSave(true); UNDOING = false; undoBaseline();
  render();
  pushToast("Undone: " + (u.auto ? "last edit" : u.label));
}

/* ============================== BACKUP RESTORE ============================== */
function restoreBackup(name){
  readBackup(name).then(function(data){
    if(!data || !data.ros) throw new Error("bad file");
    var counts = summarizeState(data);
    var ok = confirm("Restore “"+name+"”?\n\nThat snapshot holds "+counts+".\n\nYour current data is replaced — but this is undoable with the Undo button.");
    if(!ok) return;
    pushUndo("restore from "+name);
    STATE = normalizeState(data);
    UI.modal = null;
    scheduleSave(true);
    render();
    pushToast("Restored from "+name);
  }).catch(function(){ pushToast("Couldn't read that backup file."); });
}
function summarizeState(s){
  var ops = 0;
  (s.ros||[]).forEach(function(r){ ops += (r.operations||[]).length; });
  return (s.ros||[]).length+" RO(s), "+ops+" operation(s), "+(s.punches||[]).length+" punch(es)";
}
