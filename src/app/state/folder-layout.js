/* Parsec · state · folder-layout.js
   Names and paths inside Parsec Data/: the root, each RO's folder and page name, safe file names, the shop files; roFolderFor / roPageName are the single place that spells them.
   Flow: data/store-*.js call these when reading and writing; nothing else builds a path by hand.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pdRoot pdSub roDataRoot oldRoDataRoot pdSafe roNumPart roFolderFor roFolderNow roPageName oldFolderFor pdEmbed readPageData … (24 functions, 19 constants)
   state      audit automations customers dismissed fmCfg fmCleared fmNote fmTmr holes inventory laborRate lastBackupAt mobTickIds pageNote pageNoteAt punches …
   uses       data/ pages/
*/
/* ---------- the folder layout: one folder per repair order ----------
   Everything about an RO — the order itself, its jobs, parts, work performed,
   its punches and its attachments — lives in that RO's own folder under
   "ROs Data". Only shop-wide things (parts inventory, the day clock, the gaps
   deleted punches leave behind) sit in shop-data.json beside it.

       <your folder>/
         ROs Data/
           RO-24211/
             ro.json          the order, its jobs, its punches
             <attachments>
         shop-data.json       inventory, shifts, holes, theme
         backups/             one dated snapshot of everything, per day
*/
var RO_DATA_ROOT = "ROs Data";          /* v153 and older: ROs Data/<RO>/ro.json + files */
var RO_FILE  = "ro.json";
var SHOP_FILE = "shop-data.json";
var FROZEN_FILE = "execution-console-data.before-split.json";
/* Parsec Data/ROs/<RO-number - Customer>/{<RO-number> Repair Order.html, Attachments/}
         Parsec Data/Shop/Shop.html   (users, Parts page list, day clock, settings)
         Parsec Data/Backups/data-<date>.json
   The Repair Order page is both the record you can open and read anywhere and the data Parsec
   reads back: the RO is kept inside it as JSON. */
var PD_ROOT = "Parsec Data", PD_ROS = "ROs", PD_SHOP = "Shop", PD_ATT = "Attachments", PD_BK = "Backups";
var PD_SHOP_FILE = "Shop.html", PD_PAGE_RE = /Repair Order\.html$/i;
var PD_LAYOUT = null;            /* "new" or "old": what the folder had when it was read */
var PD_MIGRATING = false;
var ROFOLDER_OLD = {};           /* ro.id -> its folder under the old "ROs Data" */

/* What we last wrote, so a save only touches the ROs that actually changed. */
var ROFOLDER = {};      /* ro.id -> folder name on disk */
var ROWRITTEN = {};     /* ro.id -> the json we last wrote there */
var SHOPWRITTEN = null;

function pdRoot(create){
  if(!FS.dir) return Promise.reject(new Error("no folder"));
  return FS.dir.getDirectoryHandle(PD_ROOT, {create:!!create});
}
function pdSub(name, create){ return pdRoot(create).then(function(d){ return d.getDirectoryHandle(name, {create:!!create}); }); }
function roDataRoot(create){ return pdSub(PD_ROS, create); }
function oldRoDataRoot(create){
  if(!FS.dir) return Promise.reject(new Error("no folder"));
  return FS.dir.getDirectoryHandle(RO_DATA_ROOT, {create:!!create});
}
function pdSafe(x, n){ return String(x || "").replace(/[\\\/:*?"<>|\u0000-\u001f]+/g,"-").replace(/\s+/g," ").replace(/^[ .]+|[ .]+$/g,"").slice(0, n || 90); }
/* "RO-38097 - Blue Ridge Haulers". Falls back to the id if the RO has no number. */
function roNumPart(ro){ return pdSafe(ro && ro.roNumber, 60) || (ro && ro.id) || "RO"; }
function roFolderFor(ro){
  var c = pdSafe(ro && ro.customerName, 60);
  return roNumPart(ro) + (c ? " - " + c : "");
}
function roFolderNow(ro){ return (ro && ROFOLDER[ro.id]) || (PD16.on ? pd16Parent(ro) + "/" + roFolderFor(ro) : roFolderFor(ro)); }
function roPageName(ro){ return roNumPart(ro) + " Repair Order.html"; }
/* the old layout's folder name: just the RO number */
function oldFolderFor(ro){ return pdSafe(ro && ro.roNumber, 90) || (ro && ro.id) || "RO"; }
/* JSON tucked inside a page, safe from a closing script tag */
var PD_DATA_RE = /<script type="application\/json" id="parsec-data">([\s\S]*?)<\/script>/;
function pdEmbed(obj){ return JSON.stringify(obj).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029"); }
function readPageData(dir, name){
  return dir.getFileHandle(name).then(function(fh){ return fh.getFile(); })
    .then(function(f){ return f.text(); })
    .then(function(t){ var m = PD_DATA_RE.exec(t); if(!m) return null; try{ return JSON.parse(m[1]); }catch(e){ return null; } })
    .catch(function(){ return null; });
}
function dirEntries(dir, kind){
  var out = [], it = dir.values();
  function step(){
    return it.next().then(function(r){
      if(r.done) return out;
      if(r.value && (!kind || r.value.kind === kind)) out.push(r.value);
      return step();
    });
  }
  return step().catch(function(){ return out; });
}
function readJsonFile(dir, name){
  return dir.getFileHandle(name).then(function(fh){ return fh.getFile(); })
    .then(function(f){ return f.text(); })
    .then(function(t){ try{ return JSON.parse(t); }catch(e){ return null; } })
    .catch(function(){ return null; });          /* not there yet is normal */
}
function writeJsonFile(dir, name, text){
  return dir.getFileHandle(name, {create:true})
    .then(function(fh){ return fh.createWritable(); })
    .then(function(w){ return w.write(text).then(function(){ return w.close(); }); });
}

/* ---- reading ----
   Parsec Data/Shop/Shop.html plus one Repair Order page per RO folder. A folder that
   has not moved to that yet is read the old way (shop-data.json + ROs Data/<RO>/ro.json). */
function readFolderState15(){
  if(!FS.dir) return Promise.resolve(null);
  return roDataRoot(false).then(function(root){ return readNewState(root); }, function(){ return readOldState(); });
}
function readNewState(root){
  PD_LAYOUT = "new";
  return pdSub(PD_SHOP, false).then(function(d){ return readPageData(d, PD_SHOP_FILE); }).catch(function(){ return null; }).then(function(shop){
    var st = shop || { v:1, savedAt:0 };
    st.holes = st.holes || []; st.inventory = st.inventory || []; st.shifts = st.shifts || [];
    st.ros = [];
    st.punches = Array.isArray(st.orphanPunches) ? st.orphanPunches.slice() : [];
    delete st.orphanPunches;
    return dirEntries(root, "directory").then(function(dirs){
      return dirs.reduce(function(pr, d){
        return pr.then(function(){
          return dirEntries(d, "file").then(function(files){
            var pg = files.filter(function(f){ return PD_PAGE_RE.test(f.name); })[0];
            if(!pg) return;
            return readPageData(d, pg.name).then(function(one){
              if(!one || !one.ro || !one.ro.id) return;
              if(st.ros.some(function(x){ return x.id === one.ro.id; })) return;   /* a stray copy of a folder */
              st.ros.push(one.ro);
              if(Array.isArray(one.punches)) st.punches = st.punches.concat(one.punches);
              ROFOLDER[one.ro.id] = d.name;
            });
          });
        });
      }, Promise.resolve());
    }).then(function(){ return st; });
  });
}
function readOldState(){
  PD_LAYOUT = "old";
  return readJsonFile(FS.dir, SHOP_FILE).then(function(shop){
    return oldRoDataRoot(false).then(function(root){ return dirEntries(root, "directory"); })
      .catch(function(){ return null; })
      .then(function(dirs){
        /* Nothing split out yet — fall back to the old single combined file. */
        if(!shop && (!dirs || !dirs.length)) return readJsonFile(FS.dir, DATA_FILE);
        var st = shop || { v:1, savedAt:0 };
        st.holes = st.holes || []; st.inventory = st.inventory || []; st.shifts = st.shifts || [];
        st.ros = [];
        st.punches = Array.isArray(st.orphanPunches) ? st.orphanPunches.slice() : [];
        delete st.orphanPunches;
        return (dirs||[]).reduce(function(pr, d){
          return pr.then(function(){
            return readJsonFile(d, RO_FILE).then(function(one){
              if(!one || !one.ro || !one.ro.id) return;
              st.ros.push(one.ro);
              if(Array.isArray(one.punches)) st.punches = st.punches.concat(one.punches);
              ROFOLDER_OLD[one.ro.id] = d.name;
            });
          });
        }, Promise.resolve()).then(function(){ return st; });
      });
  });
}
/* Just the timestamp, for the "has another tab written since I last looked?" check. */
function readShopStamp(){
  if(!FS.dir) return Promise.resolve(null);
  if(PD_LAYOUT === "new") return pdSub(PD_SHOP, false).then(function(d){ return readPageData(d, PD_SHOP_FILE); }).catch(function(){ return null; }).then(function(s){ return s ? (s.savedAt || 0) : null; });
  return readJsonFile(FS.dir, SHOP_FILE).then(function(s){
    if(s) return s.savedAt || 0;
    return readJsonFile(FS.dir, DATA_FILE).then(function(o){ return o ? (o.savedAt || 0) : null; });
  });
}

/* ---- carry a folder's files across, then drop the empty shell ----
   Used both when an RO number changes and by the one-time migration. */
/* copies sub-folders too (an RO folder now has Attachments inside it); skip(name) leaves a file behind */
function copyTree(src, dst, move, skip){
  return dirEntries(src).then(function(ents){
    return ents.reduce(function(pr, ent){
      return pr.then(function(){
        if(ent.kind === "directory"){
          return dst.getDirectoryHandle(ent.name, {create:true})
            .then(function(d2){ return copyTree(ent, d2, move, null); })
            .then(function(){ if(move) return src.removeEntry(ent.name).catch(function(){}); });
        }
        if(skip && skip(ent.name)) return;
        return ent.getFile()
          .then(function(file){
            return dst.getFileHandle(ent.name, {create:true})
              .then(function(h){ return h.createWritable(); })
              .then(function(w){ return w.write(file).then(function(){ return w.close(); }); });
          })
          .then(function(){ if(move) return src.removeEntry(ent.name); })
          .catch(function(){});
      });
    }, Promise.resolve());
  });
}
function moveFolder(srcRoot, from, dstRoot, to){
  var src;
  return srcRoot.getDirectoryHandle(from)
    .then(function(d){ src = d; return dstRoot.getDirectoryHandle(to, {create:true}); })
    .then(function(dst){ return copyTree(src, dst, true, null); })
    .then(function(){ return srcRoot.removeEntry(from).catch(function(){}); })
    .catch(function(){});
}
/* An RO number changed: move its folder and re-point its attachment records. */
function renameRoFolder(root, from, to, ro){
  return moveFolder(root, from, root, to).then(function(){
    (ro.bulletins||[]).forEach(function(e){
      (e.files||[]).forEach(function(f){ if(f.folder === from) f.folder = to; });
    });
  });
}

/* An RO that is gone loses its record. Its attachments are left where they are —
   deleting a record should never quietly shred the pictures that went with it. */
function pruneRoFolders(root, live){
  return dirEntries(root, "directory").then(function(dirs){
    return dirs.reduce(function(pr, d){
      if(live[d.name]) return pr;
      return pr.then(function(){
        return dirEntries(d, "file").then(function(fs){
          return fs.filter(function(f){ return PD_PAGE_RE.test(f.name); }).reduce(function(p2, f){ return p2.then(function(){ return d.removeEntry(f.name).catch(function(){}); }); }, Promise.resolve());
        })
          .then(function(){ return d.getDirectoryHandle(PD_ATT).then(function(a){ return dirEntries(a); }).then(function(x){ if(!x.length) return d.removeEntry(PD_ATT).catch(function(){}); }, function(){}); })
          .then(function(){ return dirEntries(d); })
          .then(function(rest){ if(!rest.length) return root.removeEntry(d.name).catch(function(){}); });
      });
    }, Promise.resolve());
  });
}

function writeSplitState(){
  var byRo = {}, orphans = [], live = {};
  STATE.ros.forEach(function(ro){ byRo[ro.id] = []; });
  (STATE.punches||[]).forEach(function(p){
    if(byRo[p.roId]) byRo[p.roId].push(p); else orphans.push(p);
  });
  var shopObj = {
    v: STATE.v || 1, savedAt: STATE.savedAt || 0, theme: STATE.theme || "ivl",
    inventory: STATE.inventory || [], shifts: STATE.shifts || [], holes: STATE.holes || [],
    dismissed: STATE.dismissed || {},
    pageNote: STATE.pageNote || "", pageNoteAt: STATE.pageNoteAt || null, techName: STATE.techName || "",
    automations: STATE.automations || null,
    yard: STATE.yard || null, staff: STATE.staff || [], audit: STATE.audit || [], shopRo: STATE.shopRo || null,
    laborRate: STATE.laborRate || null, mobTickIds: STATE.mobTickIds || [], lastBackupAt: STATE.lastBackupAt || null,
    customers: STATE.customers || {}, tgTemplates: STATE.tgTemplates || null, tgShop: STATE.tgShop || null, tgCleared: STATE.tgCleared || [], rtCfg: STATE.rtCfg || null,
    fmCfg: STATE.fmCfg || null, fmCleared: STATE.fmCleared || [], fmTmr: STATE.fmTmr || null, fmNote: STATE.fmNote || null,
    waCfg: STATE.waCfg || null, waCleared: STATE.waCleared || [],
    orphanPunches: orphans
  };
  PG_SHOP_KEYS.forEach(function(k){ if(STATE[k] !== undefined) shopObj[k] = STATE[k]; });
  Object.keys(STATE).forEach(function(k){ if(k !== "ros" && k !== "punches" && !(k in shopObj) && STATE[k] !== undefined) shopObj[k] = STATE[k]; });   /* Parsec 16: nothing left out */
  var shopJson = JSON.stringify(shopObj);

  /* Two ROs with the same number (or numbers that differ only by case or by
     characters a file name can't hold) must never share a folder — the second
     ro.json would overwrite the first. Keep a folder an RO already owns; any
     later clash gets the RO's id appended. */
  var NAMES = {}, used = {}, nowMs = Date.now();
  STATE.ros.forEach(function(ro){
    var base = roFolderFor(ro), had = ROFOLDER[ro.id];
    /* a customer name typed in moves the folder only once it has sat still for half a minute,
       so the folder isn't renamed (and its attachments copied) on every keystroke */
    var lc = PD_LASTCUST[ro.id];
    if(!lc || lc.v !== (ro.customerName || "")) PD_LASTCUST[ro.id] = lc = { v: ro.customerName || "", at: nowMs };
    if(had && had !== base && had !== base + " (" + ro.id + ")" && had.split(" - ")[0].replace(/ \(.*\)$/, "") === roNumPart(ro) && nowMs - lc.at < 30000) base = had;
    if(had && (had === base || had === base + " (" + ro.id + ")") && !used[had.toLowerCase()]){
      NAMES[ro.id] = had; used[had.toLowerCase()] = 1;
    }
  });
  STATE.ros.forEach(function(ro){
    if(NAMES[ro.id]) return;
    var base = roFolderFor(ro), name = used[base.toLowerCase()] ? base + " (" + ro.id + ")" : base;
    NAMES[ro.id] = name; used[name.toLowerCase()] = 1;
  });

  return roDataRoot(true).then(function(root){
    return STATE.ros.reduce(function(pr, ro){
      return pr.then(function(){
        var want = NAMES[ro.id], had = ROFOLDER[ro.id];
        live[want] = 1;
        var move = (had && had !== want) ? renameRoFolder(root, had, want, ro) : Promise.resolve();
        return move.then(function(){
          /* Compare the RO's own content, not the shop-wide clock — otherwise every
             save looks like a change and all the files get rewritten on each keystroke. */
          var body = JSON.stringify({ ro: ro, punches: byRo[ro.id] });
          if(ROWRITTEN[ro.id] === body && had === want) return;      /* nothing changed here */
          var page = roPageHtml(ro, byRo[ro.id], { v:1, savedAt: STATE.savedAt || 0, ro: ro, punches: byRo[ro.id] }), pname = roPageName(ro);
          return root.getDirectoryHandle(want, {create:true})
            .then(function(d){
              return writeJsonFile(d, pname, page)
                /* an RO renumbered leaves its old page behind - drop it */
                .then(function(){ return dirEntries(d, "file"); })
                .then(function(fs){ return fs.filter(function(f){ return PD_PAGE_RE.test(f.name) && f.name !== pname; }).reduce(function(p2, f){ return p2.then(function(){ return d.removeEntry(f.name).catch(function(){}); }); }, Promise.resolve()); });
            })
            .then(function(){ ROWRITTEN[ro.id] = body; ROFOLDER[ro.id] = want; });
        });
      });
    }, Promise.resolve())
      .then(function(){ return pruneRoFolders(root, live); });
  }).then(function(){
    if(SHOPWRITTEN === shopJson) return;
    return pdSub(PD_SHOP, true).then(function(d){ return writeJsonFile(d, PD_SHOP_FILE, shopPageHtml(shopObj)); })
      .then(function(){ SHOPWRITTEN = shopJson; if(PD_LAYOUT !== "old") PD_LAYOUT = "new"; });
  });
}
var PD_LASTCUST = {};
