/* Parsec · data · store-api.js
   What the rest of the app asks the store for: pdRoDir / pdAttList for an RO's folder and attachments, pd16Info and the banner on Your data, writeFileToFolder, and the Parsec 15 writers kept for the migration.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pdRoDir pdAttList pd16Info pd16BannerHtml writeFolderState15 migrateToRoFolders writeFileToFolder adoptFolderState15 connectFolder reconnectFolder restoreFolder resolvedTheme … (34 functions, 8 constants)
   state      savedAt tombs
   uses       automations/ clock/ kit/ pages/fixes/ pages/technician/ ro/ ro-page/ shell/ state/
*/
/* ---------- for the other parts of Parsec 16 ---------- */
/* an RO's folder (Open/… or Closed/<year>/…) */
function pdRoDir(ro, create){ return roDataRoot(create).then(function(root){ return pdDirPath(root, roFolderNow(ro), create); }); }
/* an RO's files: [{ path: "Attachments/x.jpg" relative to Attachments, name, size, getFile }] */
function pdAttList(ro){
  var out = [];
  var walk = function(dir, pre){ return dirEntries(dir).then(function(es){ return es.reduce(function(p, e){ return p.then(function(){
    var path = (pre ? pre + "/" : "") + e.name;
    if(e.kind === "directory") return walk(e, path);
    if(/^(\.|~\$)|\.(tmp|temp|crdownload|part|partial|download|lnk)$|^(desktop\.ini|thumbs\.db)$/i.test(e.name)) return;   /* temp and system files */
    return e.getFile().then(function(f){ out.push({ path: path, name: e.name, size: f.size, type: f.type, getFile: function(){ return e.getFile(); } }); });
  }); }, Promise.resolve()); }); };
  return pdRoDir(ro, false).then(function(d){ return d.getDirectoryHandle(PD_ATT); }).then(function(a){ return walk(a, ""); }).then(function(){ return out; }, function(){ return out; });
}
function pd16Info(){ return { on: PD16.on, layout: PD16.on ? 16 : PD_LAYOUT === "new" ? 15 : PD_LAYOUT, seen: PD16.seen, files: Object.keys(PD16.W).length, dirs: Object.assign({}, ROFOLDER),
  failed: PD16.failed, clash: !!PD16.clash, last: PD16.last, warn: PD16.warn, tombs: (STATE.tombs || []).length, merges: PD16.merges }; }
function pd16BannerHtml(){
  var h = PD16.old15 === true ? '<div class="alert-bar warn" data-key="alert-pd15"><span><b>A computer still on Parsec 15 saved here — its changes were merged.</b> Update every computer to Parsec 16.</span>'
    + '<button class="btn btn-sm" data-action="pd15-ok">OK</button></div>' : "";
  if(!PD16.failed) return h;
  return h + '<div class="alert-bar warn" data-key="alert-pd16"><span><b>Your data wasn’t moved to the new layout.</b> ' + esc(PD16.failed) + ' Nothing was lost — Parsec keeps saving the old way and tries again the next time it opens.</span>'
    + '<button class="btn btn-sm" data-action="pd16-ok">OK</button></div>';
}

function writeFolderState15(force){
  if(FS.status!=="connected" || !FS.dir) return Promise.resolve(false);
  if(UI.folderConflict && !force) return Promise.resolve(false);
  var mine = STATE.savedAt || 0;
  var check = (force || !FOLDER_SEEN) ? Promise.resolve(null) : readShopStamp();
  return check.then(function(onDisk){
    if(onDisk !== null && onDisk > FOLDER_SEEN && onDisk !== mine){
      UI.folderConflict = { theirs: onDisk }; render();
      return Promise.reject(new Error("folder-conflict"));
    }
    if(PD_MIGRATING) return;                                   /* the move to Parsec Data writes everything when it is done */
    return PD_LAYOUT === "old" ? migrateToParsecData() : writeSplitState();
  })
    .then(function(){ FOLDER_SEEN = mine; })
    .then(function(){ return writeDailyBackup(); })
    .then(function(){ return true; });
}

/* ---- one-time move from the old layout to this one ----
   Runs when a folder is connected and has not been split yet. The old combined
   file is frozen under a new name rather than deleted. */
function migrateToRoFolders(){
  if(FS.status!=="connected" || !FS.dir) return Promise.resolve(false);
  if(PD_LAYOUT === "new") return Promise.resolve(false);
  return readJsonFile(FS.dir, SHOP_FILE).then(function(already){
    if(already) return false;                                  /* already split */
    return readJsonFile(FS.dir, DATA_FILE).then(function(old){
      if(!old || !old.ros) return false;                       /* nothing to move */
      /* 1. carry "Repair Orders/<RO>/" attachments over to "ROs Data/<RO>/" */
      return FS.dir.getDirectoryHandle("Repair Orders")
        .then(function(oldRoot){
          return oldRoDataRoot(true).then(function(newRoot){
            return dirEntries(oldRoot, "directory").then(function(dirs){
              return dirs.reduce(function(pr, d){
                return pr.then(function(){ return moveFolder(oldRoot, d.name, newRoot, d.name); });
              }, Promise.resolve());
            });
          }).then(function(){ return FS.dir.removeEntry("Repair Orders").catch(function(){}); });
        })
        .catch(function(){})
        /* 2. the v154 move to Parsec Data writes the new layout from what is in memory now */
        .then(function(){ FOLDER_SEEN = STATE.savedAt || 0; PD_LAYOUT = "old"; })
        /* 3. freeze the old combined file instead of deleting it */
        .then(function(){
          return writeJsonFile(FS.dir, FROZEN_FILE, JSON.stringify(old, null, 2))
            .then(function(){ return FS.dir.removeEntry(DATA_FILE).catch(function(){}); })
            .catch(function(){});
        })
        .then(function(){ return true; });
    });
  }).catch(function(){ return false; });
}

function writeFileToFolder(subdir, filename, text){
  if(FS.status!=="connected" || !FS.dir) return Promise.reject(new Error("no folder"));
  var p = subdir ? FS.dir.getDirectoryHandle(subdir,{create:true}) : Promise.resolve(FS.dir);
  return p.then(function(d){ return d.getFileHandle(filename,{create:true}); })
    .then(function(fh){ return fh.createWritable(); })
    .then(function(w){ return w.write(text).then(function(){ return w.close(); }); });
}

/* Adopt whichever copy is newer, then make both sides agree. */
function adoptFolderState15(){
  return readFolderState().then(function(folderState){
    if(folderState && folderState.ros){
      FOLDER_SEEN = folderState.savedAt || 0;
      if((folderState.savedAt||0) >= (STATE.savedAt||0)){
        /* Older folders never stored these — keep this browser's copy rather than blanking them. */
        Object.keys(STATE || {}).forEach(function(k){   /* Parsec 16: every kind, not a list */
          if(folderState[k] === undefined && STATE && STATE[k] !== undefined) folderState[k] = STATE[k];
        });
        STATE = normalizeState(folderState);
        undoBaseline();
      } else {
        return writeFolderState();   // local is newer — push it up
      }
    } else {
      return writeFolderState();     // first run in this folder — seed it
    }
  })
  /* Adopt first, then split: whatever we just settled on is what gets written
     out as one folder per RO. A folder already split is left alone. */
  .then(function(){ return migrateToRoFolders(); })
  .then(function(){ return migrateToParsecData(); })
  .then(function(moved){ if(moved) pushToast("Your repair orders now live in “Parsec Data › ROs”, one folder each. The old “ROs Data” folder and shop-data.json are no longer used — delete them once you’ve checked."); });
}

function connectFolder(){
  if(!FS.supported){ FS_ERR = fsWhy({ name: "TypeError" }); fsSay(); return; }
  if(fsFramed()){ FS_ERR = fsWhy({ name: "SecurityError" }); fsSay(); return; }
  FS_ERR = null;
  var pick; try{ pick = window.showDirectoryPicker({ mode: "readwrite", id: "parsec-shop", startIn: "desktop" }); }catch(e){ pick = Promise.reject(e); }
  pick.then(function(dir){
      return fsCanWrite(dir).then(function(){ return dir; }, function(e){ FS_ERR = fsWhyWrite(e, dir.name); throw "said"; });
    })
    .then(function(dir){
      FS.dir = dir; FS.dirName = dir.name; FS.status = "connected";
      return idbSet(IDB_KEY, dir).catch(function(){}).then(adoptFolderState)
        .catch(function(e){ FS.status = "none"; FS.dir = null; FS_ERR = fsWhy(e, dir.name); throw "said"; });
    })
    .then(function(){ syncStatus = "saved"; FS_ERR = null; pushToast("Connected to “" + FS.dirName + "” — the shop’s data, logs and attachments live there now."); render();
      try{ JC.syncFiles().then(function(){ return JC.scanFolder(); }).catch(function(){}); }catch(e){} })
    .catch(function(e){ if(e !== "said") FS_ERR = fsWhy(e); fsSay(); });
}
function reconnectFolder(){
  if(!FS.dir) return connectFolder();
  if(fsFramed()){ FS_ERR = fsWhy({ name: "SecurityError" }); fsSay(); return; }
  FS_ERR = null;
  var ask; try{ ask = FS.dir.requestPermission({ mode: "readwrite" }); }catch(e){ ask = Promise.reject(e); }
  ask.then(function(p){
    if(p === "granted"){
      return fsCanWrite(FS.dir).catch(function(e){ FS_ERR = fsWhyWrite(e, FS.dirName); throw "said"; }).then(function(){ FS.status = "connected"; return adoptFolderState(); }).then(function(){ syncStatus = "saved"; pushToast("Folder reconnected."); render(); try{ JC.syncFiles(); }catch(e){} });
    }
    FS_ERR = { k: "denied", t: "Parsec didn’t get the go-ahead.", d: "Click Open again and choose “Edit files” or Allow — or pick a different folder.", det: "Permission: " + p };
    fsSay();
  }).catch(function(e){
    if(e !== "said") FS_ERR = fsWhy(e, FS.dirName);
    if(FS_ERR.k === "gone"){ FS.dir = null; FS.status = "none"; } else if(FS.status === "connected") FS.status = "needs-permission";
    fsSay();
  });
}
function restoreFolder(){
  if(!FS.supported){ FS.status="unsupported"; return Promise.resolve(); }
  return idbGet(IDB_KEY).then(function(h){
    if(!h){ FS.status="none"; return; }
    FS.dir=h; FS.dirName=h.name;
    return h.queryPermission({mode:"readwrite"}).then(function(p){
      if(p==="granted"){ FS.status="connected"; return adoptFolderState().then(function(){ syncStatus="saved"; setTimeout(function(){ JC.syncFiles(); }, 1500); }); }
      FS.status="needs-permission";
    });
  }).catch(function(){ FS.status="none"; });
}
var THEME = "ivl";
/* four themes from the soft grey-blue reference — frosted cards, black active pills, periwinkle and coral accents */
var THEME_IDS = ["mist","glacier","atl","atd","ivl","ivd","vvl","vvd"];   /* + Ivory and Graphite (the RO redesign) */
var THEMES = {
  mist:    { name:"Night",   dark:true,  bg:"#0f0f10", card:"#19191b", hero:"#19191b", acc:"#5b9dff" },
  glacier: { name:"Light",   dark:false, bg:"#f5f5f6", card:"#ffffff", hero:"#ffffff", acc:"#2563eb" },
  atl:     { name:"Terminator Light", dark:false, bg:"#F4F6F9", card:"#FFFFFF", hero:"#E3F0F4", acc:"#1F6F8B" },
  atd:     { name:"Terminator Dark",  dark:true,  bg:"#0E1115", card:"#161A20", hero:"#1A3D3A", acc:"#4FD1C5" },
  ivl:     { name:"Ivory",    dark:false, bg:"#F2F0EA", card:"#FBFAF7", hero:"#F4EDE1", acc:"#86643A" },
  ivd:     { name:"Graphite", dark:true,  bg:"#0E0E0D", card:"#151514", hero:"#2A241B", acc:"#D1B184" },
  vvl:     { name:"White",    dark:false, bg:"#f5f6f8", card:"#ffffff", hero:"#edf3ff", acc:"#245cdb" },
  vvd:     { name:"Near black", dark:true, bg:"#0b0d10", card:"#111418", hero:"#1c2a44", acc:"#8aafff" }
};
/* Ivory and Graphite are the only looks now — an old saved one opens in the matching one */
var THEME_OLD = { mist: "ivd", atd: "ivd", glacier: "ivl", atl: "ivl" };
function resolvedTheme(){
  return THEME === "ivd" || THEME === "vvd" ? "ivd" : "ivl";   /* White and Near black are Ivory and Graphite with their own colors */
}
function applyTheme(mode){
  mode = THEME_OLD[mode] || mode; THEME = mode === "ivd" || mode === "vvl" || mode === "vvd" ? mode : "ivl";
  var de = document.documentElement;
  de.setAttribute("data-theme", resolvedTheme());
  if(/^vv/.test(THEME)) de.setAttribute("data-pal", "vv"); else de.removeAttribute("data-pal");
  try{ var jh = document.querySelector(".jc-host"); if(jh) jh.classList.toggle("pal-vv", /^vv/.test(THEME)); }catch(e){}
  de.removeAttribute("data-feel"); de.removeAttribute("data-layout");
  if(typeof applyDevice === "function" && typeof DEVICE_SETTING !== "undefined") applyDevice();
  try{ localStorage.setItem("tec_theme", THEME); }catch(e){}
}
function initTheme(){
  var saved = null;
  try{ saved = localStorage.getItem("tec_theme"); }catch(e){}
  applyTheme(saved || "ivl");
}

function uid(prefix){ return prefix+"_"+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4); }
function nowIso(){ return new Date().toISOString(); }
function todayStr(d){ d=d||new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }

function defaultState(){
  return {
    v:1, savedAt: 0,
    ros: [],
    punches: [],
    holes: [],
    inventory: [],
    shifts: [],
    dismissed: {},
    theme: "ivl",
    pageNote: "",
    pageNoteAt: null,
    techName: ""
  };
}

/* A punch, clock segment or gap whose time can't be read stopped the whole page from loading
   ("Invalid time value"). Repair what can be repaired at load; anything with no readable time
   at all is set aside in repairBin rather than deleted. */
var DATE_REPAIRS = 0;
function okTime(v){ if(v === null || v === undefined || v === "") return false; var d = new Date(v); return !isNaN(d.getTime()); }
function isoOf(v){ return new Date(v).toISOString(); }
function repairDates(st){
  var n = 0, bin = Array.isArray(st.repairBin) ? st.repairBin : [];
  st.punches = (st.punches || []).filter(function(p){
    if(!p || typeof p !== "object"){ n++; return false; }
    var sOk = okTime(p.start), eOk = okTime(p.stop), hasStop = !(p.stop === null || p.stop === undefined || p.stop === "");
    if(!sOk && !eOk){ bin.push({ kind:"punch", item:p, at: new Date().toISOString() }); n++; return false; }
    if(!sOk){ p.start = isoOf(p.stop); p.repaired = "start"; p.edited = true; n++; }
    else if(typeof p.start !== "string" || !/T/.test(p.start)){ p.start = isoOf(p.start); }
    if(hasStop && !eOk){ p.stop = p.start; p.repaired = "stop"; p.edited = true; n++; }
    else if(!hasStop){ p.stop = null; }
    else if(typeof p.stop !== "string" || !/T/.test(p.stop)){ p.stop = isoOf(p.stop); }
    return true;
  });
  st.shifts = (st.shifts || []).filter(function(x){
    if(!x || typeof x !== "object"){ n++; return false; }
    var iOk = okTime(x.in), oOk = okTime(x.out), hasOut = !(x.out === null || x.out === undefined || x.out === "");
    if(!iOk && !oOk){ bin.push({ kind:"shift", item:x, at: new Date().toISOString() }); n++; return false; }
    if(!iOk){ x.in = isoOf(x.out); x.repaired = "in"; x.edited = true; n++; }
    if(hasOut && !oOk){ x.out = x.in; x.repaired = "out"; x.edited = true; n++; }
    else if(!hasOut){ x.out = null; }
    return true;
  });
  st.holes = (st.holes || []).filter(function(h){
    var ok = h && okTime(h.start) && okTime(h.stop); if(!ok) n++; return ok;
  });
  if(bin.length) st.repairBin = bin;
  DATE_REPAIRS += n;
  return n;
}
function normalizeState(pick){
  if(!pick || !pick.ros) pick = defaultState();
  pick.ros = pick.ros || []; pick.punches = pick.punches || []; pick.holes = pick.holes || []; pick.inventory = pick.inventory || []; pick.shifts = pick.shifts || [];
  try { repairDates(pick); } catch(e){ console.warn("date repair failed", e); }
  ensureShopRo(pick);
  if(!pick.dismissed || typeof pick.dismissed !== "object") pick.dismissed = {};
  if(typeof pick.pageNote !== "string") pick.pageNote = "";
  if(typeof pick.pageNoteAt === "undefined") pick.pageNoteAt = null;
  if(typeof pick.techName !== "string") pick.techName = "";
  autoDefaults(pick);
  // Clock segments were retired — punches now stand on their own.
  if(pick.segments){ delete pick.segments; }
  pick.punches.forEach(function(p){ if(p.segId) delete p.segId; if(p.stopReason === "Complete \u2013 Road test" || p.stopReason === "Complete \u2013 Released") p.stopReason = "Complete"; if(p.origStopReason === "Complete \u2013 Road test" || p.origStopReason === "Complete \u2013 Released") p.origStopReason = "Complete"; });
  /* one Complete for an operation (the RO keeps Road test and Released) */
  pick.ros.forEach(function(ro0){ (ro0.operations || []).forEach(function(op0){ if(op0.jobStatus && (op0.jobStatus.status === "Complete \u2013 Road test" || op0.jobStatus.status === "Complete \u2013 Released")) op0.jobStatus.status = "Complete"; }); });
  try{ var ac0 = pick.automation || pick.auto; if(ac0 && Array.isArray(ac0.rules)) ac0.rules.forEach(function(r0){ (r0.conds || []).forEach(function(c0){ if(c0.f === "stopReason" && (c0.v === "Complete \u2013 Road test" || c0.v === "Complete \u2013 Released")) c0.v = "Complete"; }); }); }catch(e){}
  pick.ros.forEach(function(ro){
    ro.checklist = ro.checklist || {updateForeman:false,initialDashPic:false,updateLocation:false,uploadPics:false};
    ro.operations = ro.operations || [];
    ro.operations.forEach(function(op){
      op.parts = op.parts || [];
      if(typeof op.quoted !== "number") op.quoted = parseFloat(op.quoted) || 0;
      // (per-operation migrations below)
      // Cause/correction became a stamped work log; fold any old free text into it once.
      if(!Array.isArray(op.log)){
        op.log = [];
        ["cause","fix"].forEach(function(kind){
          var raw = String(op[kind==="cause" ? "cause" : "correction"] || "").trim();
          if(!raw) return;
          parseLegacyNote(raw).forEach(function(e){
            op.log.push({ id:uid("lg"), at:e.at || ro.dateOpened || nowIso(), kind:kind, text:e.text });
          });
        });
        op.log.sort(function(a,b){ return new Date(a.at) - new Date(b.at); });
      }
      /* a cause or correction set as text (Use fix, the phone) goes into the work log before the field is dropped */
      [["cause", "cause"], ["fix", "correction"]].forEach(function(kc){ var t = String(op[kc[1]] || "").trim(); if(!t) return; if(!op.log.some(function(l){ return l.kind === kc[0] && String(l.text || "").trim() === t; })){ op.log = op.log.filter(function(l){ return l.kind !== kc[0]; }); op.log.push({ id: uid("lg"), at: nowIso(), kind: kc[0], text: t }); } });
      delete op.cause; delete op.correction;
      // Rollover was retired: fold any legacy value into the quote itself.
      if(op.rollover){ op.quoted = Math.round((op.quoted + (parseFloat(op.rollover)||0)) * 100) / 100; }
      delete op.rollover;
      if(typeof op.quoted !== "number") op.quoted = op.quoted || 0;
    });
  });
  // RO Job Console fields (bulletins, work performed, typed Burnt) — needs the punches, so it runs last.
  var keepState = STATE; STATE = pick;
  try{ pick.ros.forEach(migrateRO); } finally { STATE = keepState; }
  try{ v160CleanOnce(pick, typeof STATE !== "undefined" ? STATE : null); }catch(e160){ console.warn("Parsec 16 clean-up", e160); }   /* Parsec 16: one form per kind of value, once */
  return pick;
}

function adoptIdbBackup(){
  return idbGet("stateBackup").then(function(json){
    if(!json) return;
    var st = JSON.parse(json);
    if(st && st.ros && (st.savedAt || 0) > (STATE.savedAt || 0)){ STATE = normalizeState(st); STORAGE_FULL = true; undoBaseline(); render(); }
  }).catch(function(){});
}
function loadState(){
  var embedded = null, local = null;
  try{
    var raw = document.getElementById("state-data").textContent;
    if(raw && raw.trim().length>2) embedded = JSON.parse(raw);
  }catch(e){ console.warn("embedded state parse failed", e); }
  try{
    var lraw = localStorage.getItem("tec_state_v1");
    if(lraw) local = JSON.parse(lraw);
  }catch(e){ console.warn("local state parse failed", e); }
  var pick = embedded;
  if(local && (!pick || (local.savedAt||0) > (pick.savedAt||0))) pick = local;
  var norm = normalizeState(pick);
  pruneHoles(norm);
  return norm;
}

/* Where you were, so a refresh puts you back rather than on the Console. */
var UI_KEYS = ["pxSec","pxPrev","waView","waPer","fmView","fmDay","tgView","rlGroup","trView","trCards","trFilt","raTab","wcRo","wcFilter","fixKey","fixSort","pgShut","pgShut119","pgLanesShut120","hdShut","pgLanesShut","bigTouch","size","recentRos","view","selectedRo","roRailShut","roRailMode","roRailPinNarrow","roGroup","roDoneOpen","careerRange","careerFrom","careerTo","timeLogMonth","roPane","roOp","roOpen","roDrop","sort","roFilter","roShowAll","lotShut","bayShut","trInShut","roPaneShut","roRailAuto","roPaneAuto","yardZoom","yardZ","yardX","yardY"];
function persistUI(){
  try{
    var slice = {};
    UI_KEYS.forEach(function(k){ slice[k] = UI[k]; });
    localStorage.setItem("tec_ui_v1", JSON.stringify(slice));
  }catch(e){}
}
function restoreUI(){
  try{
    var raw = localStorage.getItem("tec_ui_v1");
    if(!raw) return;
    var slice = JSON.parse(raw);
    UI_KEYS.forEach(function(k){
      if(slice[k] === undefined || slice[k] === null) return;
      UI[k] = slice[k];
    });
    if(!slice.pgLanesShut120){ UI.pgLanesShut = true; UI.pgLanesShut120 = true; }   /* By job starts folded once */
    if(!slice.pgShut119){ UI.pgShut = true; UI.pgShut119 = true; }   /* the RO forecast starts folded once, then remembers your choice */
    if(["tech","inbox","console","ros","warranty","fixes","career","timelog","parts","report","foreman","triage","manager","rolist"].indexOf(UI.view) === -1) UI.view = "console";
    if(UI.roRailShut && !UI.roRailMode){ UI.roRailMode = "mini"; }   /* the old hide-the-list setting becomes the mini rail */
    UI.roRailShut = false;
  }catch(e){}
}

function persistLocal(){
  var json = JSON.stringify(STATE);
  try{ localStorage.setItem("tec_state_v1", json); if(STORAGE_FULL){ STORAGE_FULL = false; idbSet("stateBackup", null).catch(function(){}); } }
  catch(e){
    if(!STORAGE_FULL){ STORAGE_FULL = true; setTimeout(render, 0); }
    idbSaveState(json);
  }
}

function scheduleSave(immediate){
  if(TAB_LOCKED) return;
  try{ v160CleanSave(); }catch(e160){}   /* Parsec 16: anything written the old way → the new form (before the undo point) */
  syncAllBurnt();
  autoUndoPoint();
  pruneHoles(STATE);
  try{ lunchOffClock(); }catch(e){ console.warn('lunch clock', e); }
  try{ v147Scan(true); }catch(e){}   /* Parsec 14.7: Completed, kept per person */
  try{ v149eStamp(); }catch(e){}   /* Parsec 14.9: who set each status */
  try{ fixAutoFill(); }catch(e){ console.warn('fix fill', e); }
  STATE.savedAt = Date.now();
  persistLocal();
  syncStatus = "pending";
  updateSyncIndicator();
  if(saveTimer) clearTimeout(saveTimer);
  /* Every change reaches the file. The short debounce only coalesces
     keystrokes inside one field — it never lets a change sit unwritten. */
  saveTimer = setTimeout(doSave, immediate ? 40 : 400);
  autoQueue();
}

/* One writer at a time. A change made mid-write is not lost: it raises the
   flag and the writer loops again when the current write lands. */
var writeBusy = false, writeAgain = false;

function doSave(){
  if(saveTimer){ clearTimeout(saveTimer); saveTimer = null; }
  try{ if(PD16.M && pdMark()) persistLocal(); }catch(e){ console.warn("pd16 marks", e); }   /* Parsec 16: updatedAt, deletion marks */
  if(FS.status === "connected"){
    if(writeBusy){ writeAgain = true; return; }
    writeBusy = true;
    var stamp = STATE.savedAt;
    writeFolderState().then(function(){
      writeBusy = false;
      if(writeAgain){ writeAgain = false; doSave(); return; }
      if(STATE.savedAt > stamp){ doSave(); return; }
      syncStatus = "saved"; FS.lastWrite = Date.now(); updateSyncIndicator();
    }).catch(function(err){
      writeBusy = false; writeAgain = false;
      syncStatus = "error"; updateSyncIndicator();
      console.warn("folder write failed", err);
    });
    return;
  }
  // Hosted-artifact fallback: only when there's no folder to write to.
  if(artifactCap){
    artifactCap.publish(buildFullHTML(STATE)).then(function(){
      syncStatus = "saved"; updateSyncIndicator();
    }).catch(function(err){
      if(err && err.code === "conflict") return;
      syncStatus = "error"; updateSyncIndicator();
    });
    return;
  }
  syncStatus = "local"; updateSyncIndicator();
}

function saveNow(){ if(saveTimer) clearTimeout(saveTimer); doSave(); }

function storageLabel(){
  if(FS.status==="connected"){
    var line = syncStatus==="pending" ? "Saving\u2026"
             : syncStatus==="error"   ? "Save failed"
             : "Saved";
    var when = FS.lastWrite ? fmtTime(new Date(FS.lastWrite).toISOString()) : null;
    return {
      dot: syncStatus==="pending" ? "pending" : syncStatus==="error" ? "err" : "ok",
      head: line + (when && syncStatus==="saved" ? " \u00b7 " + when : ""),
      body: syncStatus==="error"
        ? (STORAGE_FULL ? "Couldn't write to the folder, and browser storage is full \u2014 click to reconnect the folder now." : "Couldn't write to the folder. Your work is safe in this browser \u2014 click to reconnect.")
        : "Every change writes straight to your folder \u201c" + (FS.dirName||"folder") + "\u201d (Parsec Data \u203a ROs, one folder per RO)."
    };
  }
  if(FS.status==="needs-permission") return {
    dot:"pending", head:"Not saved to your folder",
    body:"Chrome needs permission again for \u201c"+(FS.dirName||"folder")+"\u201d. Click to reconnect \u2014 nothing is lost."
  };
  if(FS.status==="unsupported") return {
    dot:"err", head:"No folder \u2014 this browser only",
    body:"Folder saving needs Chrome or Edge on a desktop. Export a backup regularly."
  };
  return {
    dot:"err", head:"No folder connected",
    body:"Your data lives only in this browser. Click to pick a folder on your computer."
  };
}

/* The save indicator lives in Console -> Your Data. It is simply absent on other
   pages, so every lookup here has to tolerate not finding it. */
function updateSyncIndicator(){
  var d = document.getElementById("sync-dot"), wrap = document.getElementById("storage-chip");
  var L = storageLabel();
  var hb = document.getElementById("hdr-sync");
  if(hb){
    hb.className = "hdr-data " + L.dot; hb.title = L.head + " \u2014 " + L.body;
    var hd0 = hb.querySelector(".sync-dot"); if(hd0) hd0.className = "sync-dot " + L.dot;
  }
  var gd = document.getElementById("gear-sync");
  if(gd){ gd.className = "sync-dot gear-dot " + L.dot; gd.title = L.head; }
  if(!d) return;
  d.className = "sync-dot " + L.dot;
  var hd = document.getElementById("sync-pop-head"), bd = document.getElementById("sync-pop-body");
  if(hd) hd.textContent = L.head;
  if(bd) bd.textContent = L.body;
  if(wrap){ wrap.className = "save-state " + L.dot; wrap.setAttribute("aria-label", L.head); }
}

/* split build: the stylesheet is a <link> now, so its text is read from the loaded rules */
function TEC_CSS_TEXT(){
  var el = document.getElementById("app-style");
  if(el && el.tagName === "STYLE") return el.textContent;
  try{ return Array.prototype.map.call(el.sheet.cssRules, function(r){ return r.cssText; }).join("\n"); }catch(x){ return ""; }
}
function buildFullHTML(state){
  var css = TEC_CSS_TEXT();
  var js = document.getElementById("app-script").textContent;
  var stateJson = JSON.stringify(state).replace(/<\/script/gi, "<\\/script");
  return "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"+"<link rel=\"icon\" type=\"image/svg+xml\" href=\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2032%22%3E%3Cpath%20d%3D%22M16%203l11%206.5v13L16%2029%205%2022.5v-13z%22%20fill%3D%22none%22%20stroke%3D%22%235b6ee1%22%20stroke-width%3D%222.6%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M9%2013.5c4-4%2010%204%2014%200%22%20fill%3D%22none%22%20stroke%3D%22%2314a3a0%22%20stroke-width%3D%222.4%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M9%2019c4-4%2010%204%2014%200%22%20fill%3D%22none%22%20stroke%3D%22%23e8b65a%22%20stroke-width%3D%222.4%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E\">"
    + "<title>Parsec</title>"
    + "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>"
    + "<link rel=\"stylesheet\" media=\"print\" onload=\"this.media='all';this.onload=null\" href=\"" + FONT_HREF + "\">"
    + "<style>html{color-scheme:light}body{margin:0;font:15px system-ui;background:#f2f2f2}img{max-width:100%}[hidden]{display:none!important}</style>"
    + "<style id=\"app-style\">" + css + "</style></head>"
    + "<body><div id=\"app\"></div>"
    + "<script id=\"state-data\" type=\"application/json\">" + stateJson + "<\/script>"
    + "<script id=\"app-script\">" + js + "<\/script>"
    + "</body></html>";
}
