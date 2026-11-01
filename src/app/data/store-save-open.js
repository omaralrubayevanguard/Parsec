/* Parsec · data · store-save-open.js
   The save and the open: writeFolderState → pd16Save (debounced, only changed files); readFolderState; adoptFolderState merges what the folder has with what is in memory; the one-time move from layout 15 (backup → write → read back → compare → tidy), the Parsec 15 safety net, and the poll for another computer's saves.
   Flow: scheduleSave() → writeFolderState(); connectFolder() → adoptFolderState().
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   writeFolderState pd16Save readFolderState adoptFolderState pd16Adopt pd16HasMarks pd16Migrate pd16Undo pd16TidyOld pd15Scan pd15State pd15Base … (15 functions, 3 constants)
   state      pdShop ros savedAt
   uses       access/ ro/ shell/ state/
   at load    a timer · on window focus
*/
/* ---------- the save ---------- */
var PD16_Q = Promise.resolve();
function writeFolderState(force){
  if(!PD16.on) return writeFolderState15(force);
  if(FS.status !== "connected" || !FS.dir) return Promise.resolve(false);
  var run = function(){ return pd16Save(force); };
  var p = PD16_Q.then(run, run); PD16_Q = p.catch(function(){}); return p;    /* one save at a time */
}
function pd16Save(force){
  if(!PD16.on || FS.status !== "connected" || !FS.dir || PD_MIGRATING || PD16.clash) return Promise.resolve(false);
  try{ pdMark(); }catch(e){ console.warn("pd16 marks", e); }
  return (force ? Promise.resolve(false) : pd16Changed()).then(function(ch){ return ch ? pd16Pull("save") : "same"; })
    .then(function(r){ return r === "asked" ? "asked" : pd15Take(); })
    .then(function(r){
      if(r === "asked") return false;                                   /* saving waits for the person */
      try{ pdMark(); }catch(e){}
      var snap = pdSnap(), old = r && r.found ? r.found : null;
      return pd16Write(STATE, { race: true }).then(function(meta){ PD16.base = snap; pd16BaseKeep(); FOLDER_SEEN = STATE.savedAt || 0;
        return (old ? pd15Remove(old) : Promise.resolve()).then(function(){
          /* another computer saved while this one was writing: take its changes in now */
          if(meta && meta.raced) return pd16Pull("save").then(function(r2){ if(r2 === "merged") scheduleSave(true); return true; }, function(){ return true; });
          return true; });
      });
    })
    .then(function(ok){ if(ok && typeof pdBkTick !== "function") return writeDailyBackup(JSON.stringify(STATE)).then(function(){ return ok; }); return ok; });
}
/* ---------- the read ---------- */
function readFolderState(){
  if(!FS.dir) return Promise.resolve(null);
  return pd16Probe().then(function(kind){ return kind === "16" ? pd16Read().then(function(F){ return F.state; }) : readFolderState15(); });
}
/* ---------- opening the folder: layout 16 is read and merged; an older layout is read once, then moved ---------- */
function adoptFolderState(){
  return pd16Probe().then(function(kind){
    if(kind === "16") return pd16Adopt();
    PD16.on = false;
    if(kind === "none"){                                                 /* a new folder: start in layout 16 */
      PD16.on = true; PD_LAYOUT = "new";
      if(!STATE.pdShop) STATE.pdShop = { id: uid("shop"), at: nowIso() };
      pdMarkReset(); Object.keys(ROFOLDER).forEach(function(k){ delete ROFOLDER[k]; }); PD16.W = {};
      return writeFolderState(true);
    }
    return adoptFolderState15().then(function(){ return pd16Migrate(); });
  });
}
function pd16Adopt(){
  PD16.on = true; PD_LAYOUT = "new";
  try{ pdMark(); }catch(e){}
  return pd16ReadSettled().then(function(F){
    var mine = STATE, theirs = F.state, shop = theirs.pdShop && theirs.pdShop.id;
    pd16Commit(F);
    return pd16BaseLoad(shop).then(function(base){
      var fresh = !mine || !(mine.savedAt > 0), other = !pdSameShop(mine, theirs);
      var take = fresh || other || pdCanon(mine) === pdCanon(theirs) || (!base && !pd16HasMarks(mine) && !(mine.savedAt > (theirs.savedAt || 0)));
      if(take){
        /* the folder's copy, as before (keeping anything this browser has that the folder has never held — same shop only) */
        if(!fresh && !other) Object.keys(mine).forEach(function(k){ if(theirs[k] === undefined && mine[k] !== undefined) theirs[k] = mine[k]; });
        STATE = normalizeState(theirs); pdMarkReset(); undoBaseline();
        FOLDER_SEEN = theirs.savedAt || 0; PD16.base = pdSnap(); pd16BaseKeep();
        return;
      }
      var nb = pdSnapOf(theirs), res = pdMerge(base, mine, theirs, null);
      var apply = function(r){ pdApplyMerge(r, "open"); PD16.base = nb; FOLDER_SEEN = theirs.savedAt || 0; scheduleSave(true); };
      if(!res.clashes.length && pd16Nothing(res)){ PD16.base = nb; FOLDER_SEEN = theirs.savedAt || 0; scheduleSave(true); return; }   /* only this computer has news: it goes up */
      if(!res.clashes.length){ apply(res); return; }
      PD16.clash = res;
      pdClashAsk(res.clashes).then(function(ch){ PD16.clash = null; try{ pdMark(); }catch(e){} apply(pdMerge(base, STATE, theirs, ch)); });
    });
  }).then(function(){ return pd15Scan().then(function(f){ if(f) scheduleSave(true); }, function(){}); });
}
function pd16HasMarks(S){ return (S.ros || []).some(function(r){ return r && r.updatedAt; }) || (S.punches || []).some(function(r){ return r && r.updatedAt; }); }

/* ---------- the one-time move from layout 15: backup → write → read back and compare → only then tidy the old files ---------- */
function pd16Migrate(){
  if(FS.status !== "connected" || !FS.dir || PD16.on || PD_MIGRATING) return Promise.resolve(false);
  if(PD_LAYOUT !== "new") return Promise.resolve(false);                 /* the move before this one hasn't finished */
  if(Object.keys(ROFOLDER).some(function(id){ return /^(open|closed)$/i.test(ROFOLDER[id]); })){
    PD16.failed = "An RO folder is named “Open” or “Closed”, which the new layout uses. Rename that RO and Parsec will try again."; try{ render(); }catch(e){} return Promise.resolve(false); }
  PD_MIGRATING = true; PD16.failed = "";
  if(!STATE.pdShop) STATE.pdShop = { id: uid("shop"), at: nowIso() };
  pdMarkReset();
  var old = Object.assign({}, ROFOLDER), clone, names, map = {}, keepW = PD16.W, keepDirs = Object.assign({}, ROFOLDER), report = { ros: 0, open: 0, closed: 0, files: 0 };
  var fail = function(why){
    PD16.failed = why; PD16.on = false; PD16.W = keepW;
    Object.keys(ROFOLDER).forEach(function(k){ delete ROFOLDER[k]; }); Object.assign(ROFOLDER, keepDirs);
    return pd16Undo().then(function(){ PD_MIGRATING = false; try{ render(); }catch(e){} console.warn("Parsec 16 move:", why); return false; });
  };
  var backup = typeof pdBackupNow === "function" ? function(){ return pdBackupNow("before Parsec 16").then(function(r){ PD16.moved = { at: nowIso(), backup: r && r.path ? PD_BK + "/" + r.path : null }; }); }
    : function(){ var nm = "data-" + todayStr() + " before Parsec 16.json"; return pdSub(PD_BK, true).then(function(bd){ return writeJsonFile(bd, nm, JSON.stringify(STATE)); }).then(function(){ PD16.moved = { at: nowIso(), backup: PD_BK + "/" + nm }; }); };
  return (PD16.partial ? pd16Undo() : Promise.resolve()).then(backup).then(function(){
    clone = JSON.parse(JSON.stringify(STATE));
    Object.keys(ROFOLDER).forEach(function(k){ delete ROFOLDER[k]; });
    PD16.W = {};
    names = pd16Names(clone);
    clone.ros.forEach(function(ro){ var o = old[ro.id]; if(o) map[o] = names[ro.id]; report.ros++; if(names[ro.id].indexOf(PD_CLOSED) === 0) report.closed++; else report.open++; });
    clone.ros.forEach(function(ro){ (ro.bulletins || []).forEach(function(e){ (e.files || []).forEach(function(f){ if(f.folder && map[f.folder]) f.folder = map[f.folder]; }); }); });
    /* the attachments are copied, not moved — the old ones go only once the new layout has been read back */
    return roDataRoot(true).then(function(root){
      return clone.ros.reduce(function(pr, ro){ return pr.then(function(){
        var o = old[ro.id]; if(!o) return;
        return root.getDirectoryHandle(o).then(function(src){ return pdDirPath(root, names[ro.id], true).then(function(dst){ return copyTree(src, dst, false, function(nm){ return PD_PAGE_RE.test(nm) || nm === RO_FILE; }); }); }, function(){});
      }); }, Promise.resolve());
    });
  }, function(e){ throw { pd16: "Parsec couldn't make a backup first (" + (e && e.message || e) + "), so nothing was moved." }; })
    .then(function(){ return pd16Write(clone, { pending: true }); })
    .then(function(meta){ return pd16Read({ pending: true }).then(function(F){ return [meta, F]; }); })
    .then(function(x){
      var meta = x[0], F = x[1], a = pdCanon(clone), b = pdCanon(F.state);
      if(PD16.forceMismatch || a !== b){ var i = 0; while(i < a.length && a[i] === b[i]) i++;
        throw { pd16: "The new layout didn't read back the same as what was written" + (PD16.forceMismatch ? " (test)" : "") + ", so the old files were kept.", at: a.slice(Math.max(0, i - 60), i + 60) + " ≠ " + b.slice(Math.max(0, i - 60), i + 60) }; }
      /* it reads back the same: this is the folder's layout now */
      return pdRoot(true).then(function(d){ return pd16Put(d, PD_LAYOUT_FILE, JSON.stringify(meta, null, 1)).then(function(){ return pd16Rm(d, PD_LAYOUT_FILE + ".pending"); }); })
        .then(function(){
          PD16.on = true; PD16.seen = meta.writeId; F.meta = meta; pd16Commit(F);
          /* the same folder moves for what is in memory (anything typed meanwhile stays) */
          STATE.ros.forEach(function(ro){ (ro.bulletins || []).forEach(function(e){ (e.files || []).forEach(function(f){ if(f.folder && map[f.folder]) f.folder = map[f.folder]; }); }); });
          PD16.base = pdSnapOf(clone); pd16BaseKeep();
          return pd16TidyOld(old, names).then(function(n){ report.files = n; });
        });
    })
    .then(function(){
      PD_MIGRATING = false; pdMarkReset();
      var line = "Moved the data to the Parsec 16 layout — " + report.ros + " ROs (" + report.open + " open, " + report.closed + " closed), " + report.files + " attachments; a backup was made first";
      try{ audit("data", line); }catch(e){}
      pushToast("Your data now lives in Parsec Data › ROs › Open and Closed, and Shop by topic. A backup was made first.");
      scheduleSave(true);
      return true;
    }, function(e){ return fail(e && e.pd16 ? e.pd16 : "Something went wrong while moving the data (" + (e && e.message || e) + "), so the old files were kept."); });
}
/* undo a half-done move: only what the move wrote (the old RO folders and Shop.html are never touched) */
function pd16Undo(){
  return pdRoot(false).then(function(pd){
    return pd16Rm(pd, PD_LAYOUT_FILE + ".pending")
      .then(function(){ return pd.getDirectoryHandle(PD_ROS).then(function(r){ return pd16Rm(r, PD_OPEN, true).then(function(){ return pd16Rm(r, PD_CLOSED, true); }); }, function(){}); })
      .then(function(){ return pd.getDirectoryHandle(PD_SHOP).then(function(s){
        return dirEntries(s).then(function(es){ return es.reduce(function(p, e){ return p.then(function(){
          if(e.kind === "directory" && PD_SPLIT_DIRS[e.name]) return pd16Rm(s, e.name, true);
          if(e.kind === "file" && /\.json$/.test(e.name) && PD_TOPIC_FILES[e.name]) return pd16Rm(s, e.name);
        }); }, Promise.resolve()); }); }, function(){}); });
  }, function(){});
}
var PD_SPLIT_DIRS = { clock: 1, activity: 1, timesheets: 1 }, PD_TOPIC_FILES = { "other.json": 1 };
Object.keys(PD_TOPICS).forEach(function(t){ PD_TOPIC_FILES[t + ".json"] = 1; });
/* the old pages and Shop.html go; an old attachment goes only when its copy is there at the same size */
function pd16TidyOld(old, names){
  var n = 0;
  return roDataRoot(false).then(function(root){
    return Object.keys(old).reduce(function(pr, id){ return pr.then(function(){
      var o = old[id], to = names[id]; if(!o || !to) return;
      return root.getDirectoryHandle(o).then(function(src){ return pdDirPath(root, to, false).then(function(dst){
        var walk = function(s, d){ return dirEntries(s).then(function(es){ return es.reduce(function(p, e){ return p.then(function(){
          if(e.kind === "directory") return d.getDirectoryHandle(e.name).then(function(d2){ return walk(e, d2); }, function(){}).then(function(){ return dirEntries(e); }).then(function(x){ if(!x.length) return pd16Rm(s, e.name); });
          if(PD_PAGE_RE.test(e.name) || e.name === RO_FILE) return pd16Rm(s, e.name);
          return Promise.all([e.getFile(), d.getFileHandle(e.name).then(function(h){ return h.getFile(); }, function(){ return null; })]).then(function(fs){
            if(fs[1] && fs[1].size === fs[0].size){ n++; return pd16Rm(s, e.name); } });
        }); }, Promise.resolve()); }); };
        return walk(src, dst);
      }); }, function(){}).then(function(){ return root.getDirectoryHandle(o).then(function(d){ return dirEntries(d); }).then(function(x){ if(!x.length) return pd16Rm(root, o); }, function(){}); });
    }); }, Promise.resolve());
  }).then(function(){ return pdSub(PD_SHOP, false).then(function(s){ return pd16Rm(s, PD_SHOP_FILE); }, function(){}); })
    .then(function(){ return n; });
}

/* ---------- a computer still on Parsec 15 saved here ----------
   Parsec 15 sees a layout 16 folder as empty and writes its own layout beside it: Shop/Shop.html and ROs/<RO>/<RO> Repair Order.html
   with the data inside. The move to 16 removed every such file, so any found now came from a Parsec 15 computer afterwards.
   They are read with the old reader, merged record by record (the backup made before the move is the common ancestor), layout 16
   is written, and only then are they removed — each only if it hasn't changed since it was read. Attachments it added are moved
   by the usual file sync. */
function pd15Scan(){
  if(!PD16.on || !FS.dir) return Promise.resolve(null);
  var out = { shop: null, ros: [] };
  var page = function(fh){ return fh.getFile().then(function(f){ return f.text().then(function(t){ var m = PD_DATA_RE.exec(t); if(!m) return null; try{ return { data: JSON.parse(m[1]), t: f.lastModified }; }catch(e){ return null; } }); }); };
  return pdRoot(false).then(function(pd){
    return pd.getDirectoryHandle(PD_SHOP).then(function(s){ return s.getFileHandle(PD_SHOP_FILE).then(page).then(function(x){ if(x && pdPlain(x.data)) out.shop = x; }); }).catch(function(){})
      .then(function(){ return pd.getDirectoryHandle(PD_ROS).then(function(root){ return dirEntries(root, "directory").then(function(ds){
        return Promise.all(ds.filter(function(d){ return d.name !== PD_OPEN && d.name !== PD_CLOSED; }).map(function(d){
          return dirEntries(d, "file").then(function(fs){ return Promise.all(fs.filter(function(f){ return PD_PAGE_RE.test(f.name); }).map(function(h){
            return page(h).then(function(x){ if(x && x.data && x.data.ro && x.data.ro.id) out.ros.push({ dir: d.name, file: h.name, data: x.data, t: x.t }); }); })); });
        }));
      }); }, function(){}); });
  }, function(){}).then(function(){ return out.shop || out.ros.length ? out : null; });
}
/* the Parsec 15 computer's copy, in today's forms — but only the kinds it actually wrote (no filled-in blanks) */
function pd15State(found){
  var st = found.shop ? JSON.parse(JSON.stringify(found.shop.data)) : { v: 1, savedAt: 0 };
  st.punches = Array.isArray(st.orphanPunches) ? st.orphanPunches.slice() : []; delete st.orphanPunches;
  st.ros = [];
  found.ros.forEach(function(x){ if(st.ros.some(function(r){ return r.id === x.data.ro.id; })) return;
    st.ros.push(JSON.parse(JSON.stringify(x.data.ro))); if(Array.isArray(x.data.punches)) st.punches = st.punches.concat(JSON.parse(JSON.stringify(x.data.punches)));
    st.savedAt = Math.max(st.savedAt || 0, x.data.savedAt || 0); });
  var had = {}; Object.keys(st).forEach(function(k){ had[k] = 1; });
  var keep = STATE; try{ st = normalizeState(st); }catch(e){ console.warn("pd15 normalize", e); } finally { STATE = keep; }
  Object.keys(st).forEach(function(k){ if(!had[k]) delete st[k]; });
  pd16Ids(st);
  return st;
}
/* the copy made just before the move to 16 — what the Parsec 15 computer started from */
function pd15Base(){
  if(PD16.preBase !== undefined) return Promise.resolve(PD16.preBase);
  var pick = function(path){ var parts = String(path).split("/"), leaf = parts.pop();
    return pdRoot(false).then(function(pd){ return pdDirPath(pd, parts.join("/"), false); }).then(function(d){ return pd16ReadText(d, leaf); }).then(function(t){ return JSON.parse(t); }); };
  var find = function(){ return pdSub(PD_BK, false).then(function(bk){ var L = [];
    var walk = function(d, pre){ return dirEntries(d).then(function(es){ return Promise.all(es.map(function(e){ return e.kind === "directory" ? walk(e, pre + e.name + "/") : (/before Parsec 16/.test(e.name) ? L.push(PD_BK + "/" + pre + e.name) : 0); })); }); };
    return walk(bk, "").then(function(){ L.sort(); return L.pop() || null; }); }, function(){ return null; }); };
  return (PD16.moved && PD16.moved.backup ? Promise.resolve(PD16.moved.backup) : find()).then(function(path){ return path ? pick(path) : null; })
    .then(function(st){ var shop = STATE.pdShop && STATE.pdShop.id; PD16.preBase = st && (!st.pdShop || !shop || st.pdShop.id === shop) ? pdSnapOf(st) : null; return PD16.preBase; }, function(){ PD16.preBase = null; return null; });
}
/* → "asked" (a clash is waiting on the person), { found } (merged — remove these once 16 is written), or null (none) */
function pd15Take(){
  return pd15Scan().then(function(found){
    if(!found) return null;
    if(PD16.old15 !== "seen") PD16.old15 = true;                       /* the banner, once */
    return pd15Base().then(function(base){
      var theirs = pd15State(found);
      if(base && (theirs.savedAt || 0) <= (base.savedAt || 0)) return { found: found };   /* nothing done there since the move: just tidy */
      try{ pdMark(); }catch(e){}
      var res = pdMerge(base, STATE, theirs, null);
      if(!res.clashes.length){ if(!pd16Nothing(res)) pdApplyMerge(res, "15"); return { found: found }; }
      PD16.clash = res;
      pdClashAsk(res.clashes).then(function(ch){ try{ pdMark(); }catch(e){} var r2 = pdMerge(base, STATE, theirs, ch); PD16.clash = null; pdApplyMerge(r2, "15"); scheduleSave(true); });
      return "asked";
    });
  });
}
function pd15Remove(found){
  var same = function(dir, name, t){ return dir.getFileHandle(name).then(function(h){ return h.getFile(); }).then(function(f){ return f.lastModified === t; }, function(){ return false; }); };
  return pdRoot(false).then(function(pd){
    var p = Promise.resolve();
    if(found.shop) p = p.then(function(){ return pd.getDirectoryHandle(PD_SHOP).then(function(s){ return same(s, PD_SHOP_FILE, found.shop.t).then(function(ok){ if(ok) return pd16Rm(s, PD_SHOP_FILE); }); }, function(){}); });
    return p.then(function(){ return pd.getDirectoryHandle(PD_ROS).then(function(root){
      return found.ros.reduce(function(pr, x){ return pr.then(function(){
        return root.getDirectoryHandle(x.dir).then(function(d){ return same(d, x.file, x.t).then(function(ok){ if(ok) return pd16Rm(d, x.file); })
          .then(function(){ return d.getDirectoryHandle(PD_ATT).then(function(a){ return dirEntries(a); }).then(function(es){ if(!es.length) return pd16Rm(d, PD_ATT); }, function(){}); })
          .then(function(){ return dirEntries(d); }).then(function(es){ if(!es.length) return pd16Rm(root, x.dir); }); }, function(){});
      }); }, Promise.resolve());
    }, function(){}); });
  }, function(){});
}

/* ---------- now and then: has another computer saved? (only when nobody is typing) ---------- */
function pd16Poll(){
  if(!PD16.on || FS.status !== "connected" || !FS.dir || PD16.busy || PD16.clash || PD_MIGRATING || writeBusy || TAB_LOCKED) return Promise.resolve(null);
  if(document.visibilityState !== "visible" || (UI && UI.modal)) return Promise.resolve(null);
  try{ if(deepActiveField()) return Promise.resolve(null); }catch(e){}
  return pd16Changed().then(function(ch){
    if(!ch) return pd15Scan().then(function(f){ if(f){ scheduleSave(true); return "15"; } return null; });   /* a Parsec 15 computer saved here */
    return pd16Pull("poll").then(function(r){ if(r === "merged") scheduleSave(true); return r; }); }).catch(function(){ return null; });
}
setInterval(pd16Poll, 20000);
window.addEventListener("focus", function(){ setTimeout(pd16Poll, 700); });
