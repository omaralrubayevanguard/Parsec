/* Parsec · data · backups.js
   Backups: one compressed copy of everything at the end of the working day in Backups/<YYYY-MM>/ (keep 30), and Back up now from Your data.
   Flow: pdBkTick runs on a timer; pdBackupNow writes data-<date>.json.gz.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pdShopEndH pdBkName pdBkWriteDay pdBackupNow pdBkTick writeDailyBackup pxBkWrite pdBkPrune pdBkList listBackups readBackup pxBkLoad … (12 functions, 2 constants)
   state      savedAt shiftEnd
   uses       clock/ kit/ pages/foreman/ shell/ state/
   at load    a delayed start · a timer
*/
/* ============================== Parsec 16 (C): backups, Export for the server, the round-trip check ==============================
   Backups: one compressed copy at the end of each working day — Parsec Data/Backups/<YYYY-MM>/data-<YYYY-MM-DD>.json.gz — kept 30 days.
     · the shop's end time passes with Parsec open (and there was work that day), or the last person on the clock clocks out for the
       End of day — whichever comes first; a later trigger the same day writes the day's file again, so it holds the whole day
     · on opening Parsec: if the last day Parsec saved has no backup yet (or the backup is older than that day's last save), it is
       written then — what was loaded IS that day's end state
     · Back up now writes data-<date> <HH-MM>.json.gz
   Export for the server: Parsec Data/Exports/<YYYY-MM-DD HH-MM>/ — tables/*.jsonl, attachments/<roId>/…, schema.json, README.txt,
     manifest.json (counts, a sha-256 per file, a short hash per table line). Written file by file.
   Round-trip check: every file and count checked against the manifest (refuses on any mismatch, naming it), then the state rebuilt from
     the tables alone (pdImportExport — the reference importer) and compared with what Parsec holds now. */

/* ---------- backups ---------- */
var PDBK = { caught: false, busy: false, last: "" };
var PD_BK_KEEP_DAYS = 30;
function pdShopEndH(){ var e = null; try{ e = +fmCfg().end; }catch(x){} if(e > 0) return e;
  var m = /^(\d{1,2}):(\d{2})$/.exec(String(STATE && STATE.shiftEnd || "")); return m ? +m[1] + (+m[2]) / 60 : 15.5; }
function pdBkName(day, label){ return "data-" + day + (label ? " " + label : "") + ".json.gz"; }
/* write one day's compressed copy; staleAt: only when the file is missing or older than that moment */
function pdBkWriteDay(day, label, staleAt){
  if(FS.status !== "connected" || !FS.dir) return Promise.reject(new Error("no folder"));
  var month = day.slice(0, 7), name = pdBkName(day, label), json = JSON.stringify(STATE);
  PDBK.busy = true;
  return pdSub(PD_BK, true).then(function(bd){ return bd.getDirectoryHandle(month, { create: true }); })
    .then(function(md){
      var go = function(){ return pdGzip(json).then(function(blob){ return pdPut(md, name, blob); }).then(function(){ return { dir: month, name: name, path: month + "/" + name, wrote: true }; }); };
      if(staleAt == null) return go();
      return md.getFileHandle(name).then(function(fh){ return fh.getFile(); })
        .then(function(f){ return f.lastModified >= staleAt ? { dir: month, name: name, path: month + "/" + name, wrote: false } : go(); }, go);
    })
    .then(function(r){
      if(r.wrote){ var was = pxLS("tec_last_backup"); if(!was || was <= day) pxLS("tec_last_backup", day); pxLS("tec_bk_at", nowIso()); PDBK.last = r.path; UI.pxBk = null; }
      return pdBkPrune().then(function(){ return r; });
    })
    .then(function(r){ PDBK.busy = false; return r; }, function(e){ PDBK.busy = false; throw e; });
}
/* for a one-off copy before something big (Fork A's move to the new layout): data-<date> <label> <HH-MM>.json.gz */
function pdBackupNow(label){ return pdBkWriteDay(todayStr(), (label ? String(label).replace(/[\\\/:*?"<>|]+/g, "-") + " " : "") + pdStamp().slice(11)); }
/* the clock: called every half minute and once the folder is ready; now can be faked in tests */
function pdBkTick(now){
  now = now || Date.now();
  if(typeof FS === "undefined" || FS.status !== "connected" || !FS.dir || !STATE || PDBK.busy) return Promise.resolve(null);
  if(typeof FS_READY !== "undefined" && !FS_READY) return Promise.resolve(null);
  if(typeof PD_MIGRATING !== "undefined" && PD_MIGRATING) return Promise.resolve(null);
  if(typeof PD16 !== "undefined" && PD16 && PD16.busy) return Promise.resolve(null);   /* not while the folder is being moved or merged */
  var today = todayStr(new Date(now)), saved = STATE.savedAt ? todayStr(new Date(STATE.savedAt)) : null;
  if(!PDBK.caught){ PDBK.caught = true;
    if(saved && saved < today) return pdBkWriteDay(saved, "", STATE.savedAt).then(function(r){ return r && r.wrote ? Object.assign({ why: "catch-up" }, r) : null; }).catch(function(){ return null; }); }
  var h = pdShopEndH(), end = new Date(now); end.setHours(Math.floor(h), Math.round((h % 1) * 60), 0, 0);
  if(now >= end.getTime() && saved === today && pxLS("pd_bk_eod") !== today){ pxLS("pd_bk_eod", today);
    return pdBkWriteDay(today).then(function(r){ return Object.assign({ why: "end of day" }, r); }).catch(function(){ return null; }); }
  return Promise.resolve(null);
}
/* the old writer (first save of the day) is retired — the end of the day writes now */
function writeDailyBackup(json){ return Promise.resolve(); }
/* Back up now ("by hand") and clocking out for the day ("automatic" — only when nobody else is still on the clock) */
function pxBkWrite(how){
  if(FS.status !== "connected" || !FS.dir) return Promise.reject(new Error("no folder"));
  var today = todayStr();
  if(how === "automatic"){
    var open = false; try{ open = shiftList().some(function(s){ return !s.out && localDay(s.in) === today; }); }catch(e){}
    if(open) return Promise.reject(new Error("others are still on the clock"));
    return pdBkWriteDay(today).then(function(){ pxLS("pd_bk_eod", today); return how; });
  }
  return pdBkWriteDay(today, pdStamp().slice(11)).then(function(){ return how; });
}
/* keep 30 days: only data-<date>….json.gz files go; anything else in Backups is left alone */
function pdBkPrune(now){
  var cut = new Date(now || Date.now()); cut.setDate(cut.getDate() - PD_BK_KEEP_DAYS); var cutDay = todayStr(cut), n = 0;
  /* the copy made before the move to layout 16 stays — it's what a computer still on Parsec 15 is merged against */
  var old = function(nm){ var m = /^data-(\d{4}-\d{2}-\d{2}).*\.json\.gz$/i.exec(nm); return !!m && m[1] < cutDay && !/before Parsec 16/i.test(nm); };
  return pdSub(PD_BK, false).then(function(bd){
    return pdEntries(bd).then(function(es){
      return es.reduce(function(p, e){
        return p.then(function(){
          if(e.kind === "file") return old(e.name) ? bd.removeEntry(e.name).then(function(){ n++; }, function(){}) : null;
          if(!/^\d{4}-\d{2}$/.test(e.name)) return null;
          return pdEntries(e).then(function(fs){
            return fs.reduce(function(p2, f){ return p2.then(function(){ return f.kind === "file" && old(f.name) ? e.removeEntry(f.name).then(function(){ n++; }, function(){}) : null; }); }, Promise.resolve());
          }).then(function(){ return pdEntries(e); }).then(function(rest){ if(!rest.length) return bd.removeEntry(e.name).catch(function(){}); });
        });
      }, Promise.resolve());
    });
  }).then(function(){ return n; }, function(){ return 0; });
}
/* every backup file: the month folders and the old loose .json files — [{ name: "2026-10/data-….json.gz", size, mod }] newest first */
function pdBkList(){
  if(FS.status !== "connected" || !FS.dir) return Promise.resolve([]);
  var out = [], isBk = function(n){ return /\.json(\.gz)?$/i.test(n); };
  var add = function(e, pre){ return e.getFile().then(function(f){ out.push({ name: (pre ? pre + "/" : "") + e.name, size: f.size, mod: f.lastModified }); }, function(){}); };
  return pdSub(PD_BK, false).catch(function(){ return FS.dir.getDirectoryHandle("backups"); })
    .then(function(bd){ return pdEntries(bd).then(function(es){
      return Promise.all(es.map(function(e){
        if(e.kind === "file") return isBk(e.name) ? add(e, "") : null;
        return /^\d{4}-\d{2}$/.test(e.name) ? pdEntries(e).then(function(fs){ return Promise.all(fs.filter(function(f){ return f.kind === "file" && isBk(f.name); }).map(function(f){ return add(f, e.name); })); }) : null;
      }));
    }); })
    .then(function(){ var k = function(x){ var m = /data-(\d{4}-\d{2}-\d{2})/.exec(x.name); return (m ? m[1] : "0000") + " " + String(x.mod).padStart(15, "0"); };
      return out.sort(function(a, b){ return k(a) < k(b) ? 1 : k(a) > k(b) ? -1 : 0; }); }, function(){ return []; });
}
function listBackups(){ return pdBkList().then(function(L){ return L.map(function(x){ return x.name; }); }); }
function readBackup(name){
  var parts = String(name || "").split("/").filter(Boolean), file = parts.pop();
  return pdSub(PD_BK, false)
    .then(function(d){ return pdDirAt(d, parts, false).then(function(dd){ return dd.getFileHandle(file); }); })
    .catch(function(){ return FS.dir.getDirectoryHandle("backups").then(function(d){ return d.getFileHandle(file); }); })
    .then(function(fh){ return fh.getFile(); })
    .then(pdGunzip)
    .then(function(t){ return JSON.parse(t); });
}
function pxBkLoad(){
  if(FS.status !== "connected"){ UI.pxBk = { files: [] }; return; }
  UI.pxBk = UI.pxBk || { loading: true, files: [] };
  pdBkList().then(function(files){ UI.pxBk = { files: files.slice(0, 30) }; if(UI.view === "profile") render(); }, function(){ UI.pxBk = { files: [] }; if(UI.view === "profile") render(); });
}
setTimeout(function(){ try{ pdBkTick(); }catch(e){} }, 5000);
setInterval(function(){ try{ pdBkTick(); }catch(e){} }, 30000);
