/* Parsec · ro-page · bulletins.js
   Files on the RO: saving to the folder (or IndexedDB until there is one), shrinking images, thumbnails, the bulletin log entries that carry files.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   saveFileViaAnchor saveFile downloadAttachment shrinkImage folderOn safeName roFolderName roDirByName legacyName fileHome readFromFolder uniqueName … (24 functions, 12 constants)
   state      ros
   uses       data/ kit/ ro/ shell/ state/
   at load    2× a timer · on window focus · on document visibilitychange
*/
/* ============================ render: bulletins ============================ */

/* ---------- one hover card per logged entry ---------- */




function saveFileViaAnchor(filename, blob) {
  var url = URL.createObjectURL(blob);
  var a = el('a', { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  toast('Saved ' + filename);
}
/* A plain <a download> click never fires inside a published claude.ai artifact —
   use the downloads capability there, and fall back to the anchor when this
   page is just an ordinary local HTML file (or the capability isn't offered). */
function saveFile(filename, blob) {
  if (!(window.claude && window.claude.use)) { saveFileViaAnchor(filename, blob); return; }
  window.claude.use('downloads').then(function (downloads) {
    if (!downloads) { saveFileViaAnchor(filename, blob); return; }
    downloads.save({ filename: filename, data: blob }).then(function () {
      toast('Saved ' + filename);
    }).catch(function (err) {
      if (err && (err.code === 'declined' || err.code === 'rate_limited')) { toast('Save cancelled'); return; }
      saveFileViaAnchor(filename, blob);
    });
  }).catch(function () { saveFileViaAnchor(filename, blob); });
}

function downloadAttachment(f) {
  getBlob(f).then(function (b) {
    if (!b) { toast(folderOn() ? 'That file is not in this browser or your data folder' : 'That file is not stored in this browser \u2014 connect your data folder'); return; }
    saveFile(f.name, b);
  }).catch(function () { toast('Could not open that file'); });
}

function shrinkImage(file) { return v160Shrink(file); }   /* Parsec 16: wider than 1600 px or over 2 MB → 1600 px JPEG (b9/v160b.js) */


/* ---- attachments: kept in the data folder under  Repair Orders/<RO number>/  ---- */
var RO_ROOT = RO_DATA_ROOT;   /* kept for the old layout; files now sit in Parsec Data/ROs/<RO>/Attachments */
function folderOn() { return FS.status === 'connected' && !!FS.dir; }
function safeName(s) { return String(s || '').replace(/[\\\/:*?"<>|\u0000-\u001f]+/g, '-').replace(/\s+/g, ' ').replace(/^[ .]+|[ .]+$/g, '').slice(0, 90); }
function roFolderName(ro) { return roFolderNow(ro); }   /* the folder the RO has now (a rename waits for the save layer) */
function roDirByName(name, create) {
  return roDataRoot(create)
    .then(function (d) { return pdDirPath(d, name, create); })   /* Parsec 16: Open/<RO> or Closed/<year>/<RO> */
    .then(function (d) { return d.getDirectoryHandle(PD_ATT, { create: !!create }); });
}
function legacyName(f) { return f.id + '__' + String(f.name || 'file').replace(/[\\\/:*?"<>|]+/g, '_'); }
/* where this file sits now: {dir: Promise<handle>, name} */
function fileHome(roId, f) {
  if (f.folder && f.fname) return { dir: roDirByName(f.folder, false), name: f.fname };
  return { dir: attachDir(roId, false), name: legacyName(f) };          /* written before the move */
}
function readFromFolder(roId, f) {
  if (!folderOn()) return Promise.resolve(null);
  var h = fileHome(roId, f);
  return h.dir.then(function (d) { return d.getFileHandle(h.name); })
    .then(function (fh) { return fh.getFile(); })
    .catch(function () { return null; });
}
function uniqueName(dir, want) {
  var dot = want.lastIndexOf('.'), base = dot > 0 ? want.slice(0, dot) : want, ext = dot > 0 ? want.slice(dot) : '';
  var n = 1;
  function tryName() {
    var nm = n === 1 ? want : base + ' (' + n + ')' + ext;
    return dir.getFileHandle(nm).then(function () { n++; return tryName(); }, function () { return nm; });
  }
  return tryName();
}
function writeToFolder(ro, f, blob) {
  var folder = roFolderName(ro), dirP = roDirByName(folder, true), dirH, key = null;
  return dirP.then(function (d) { dirH = d; return uniqueName(d, safeName(f.name) || 'file'); })
    .then(function (nm) {
      key = folder + '/' + nm; WRITING[key] = 1;
      return dirH.getFileHandle(nm, { create: true })
        .then(function (fh) { return fh.createWritable(); })
        .then(function (w) { return w.write(blob).then(function () { return w.close(); }); })
        .then(function () { return nm; });
    })
    .then(function (nm) { f.inFolder = true; f.folder = folder; f.fname = nm; })
    .then(function () { if (key) delete WRITING[key]; }, function (err) { if (key) delete WRITING[key]; throw err; });
}
function removeAt(roId, f) {
  var h = fileHome(roId, f);
  return h.dir.then(function (d) { return d.removeEntry(h.name); }).catch(function () {});
}
function removeFromFolder(roId, f) { if (folderOn() && f.inFolder) removeAt(roId, f); }
/* The browser copy first (fast); the folder copy when the browser has lost it. */
function getBlob(f, roId) {
  var rid = roId || (RO && RO.id);
  return idbGet(f.id).catch(function () { return null; }).then(function (b) {
    if (b) return b;
    return readFromFolder(rid, f).then(function (fb) {
      if (fb) idbPut(f.id, fb).catch(function () {});
      return fb;
    });
  });
}
/* Put every attachment where it belongs: copies browser-only files in, moves files written under
   the old attachments/<id>/ layout, and follows an RO that was renumbered. */
var syncing = false, syncAgain = false;
function syncFiles() {
  if (!folderOn() || PD_MIGRATING || PD_LAYOUT !== 'new') return Promise.resolve(0);
  if (syncing) { syncAgain = true; return Promise.resolve(0); }
  syncing = true;
  var todo = [];
  STATE.ros.forEach(function (ro) {
    var want = roFolderName(ro);
    (ro.bulletins || []).forEach(function (e) { (e.files || []).forEach(function (f) {
      if (!f.inFolder || f.folder !== want) todo.push([ro, f]);
    }); });
  });
  var n = 0, chain = Promise.resolve(), emptied = [];
  todo.forEach(function (t) {
    var ro = t[0], f = t[1];
    chain = chain.then(function () {
      var wasIn = f.inFolder, old = { folder: f.folder, fname: f.fname, inFolder: f.inFolder };
      return idbGet(f.id).catch(function () { return null; })
        .then(function (b) { return b || (wasIn ? readFromFolder(ro.id, f) : null); })
        .then(function (b) {
          if (!b) return;
          return writeToFolder(ro, f, b).then(function () {
            n++;
            if (wasIn) {
              emptied.push(old.folder && old.fname ? [RO_ROOT, old.folder] : ['attachments', ro.id]);
              return removeAt(ro.id, { id: f.id, name: f.name, folder: old.folder, fname: old.fname });
            }
          }).catch(function () {});
        });
    });
  });
  return chain.then(function () {
    /* folders a move left empty (removeEntry refuses anything that still has files in it) */
    var seen = {};
    return emptied.reduce(function (pr, e) {
      var k = e.join('/'); if (seen[k]) return pr; seen[k] = 1;
      return pr.then(function () {
        return FS.dir.getDirectoryHandle(e[0]).then(function (d) { return d.removeEntry(e[1]); })
          .then(function () { if (e[0] === 'attachments') return FS.dir.removeEntry('attachments'); })
          .catch(function () {});
      });
    }, Promise.resolve());
  }).then(function () {
    syncing = false;
    if (n) { scheduleSave(true); if (HOST && HOST.isConnected && roTab === 'files') render(); }
    if (syncAgain) { syncAgain = false; return syncFiles(); }
    return n;
  });
}
var renameSyncT = null;
function syncSoon() { clearTimeout(renameSyncT); renameSyncT = setTimeout(syncFiles, 2500); }

/* ---- folder -> app: two-way attachments ----
   Anything you drop into an RO's folder ( ROs Data/<RO>/ ) shows up on that RO's Files
   tab: pictures and video under "Take pictures", everything else under "Upload Report",
   the same split the + button uses. Delete a file from the folder and it leaves the tab.
   The file is not copied anywhere — the record points at it and it is read from the
   folder when opened. Browsers can't watch a folder, so it is checked every few seconds
   while the page is open, and straight away when you come back to the window. */
var WRITING = {};               /* "folder/name" the app itself is writing right now */
var MISSING = {};               /* file id -> scans in a row it was not found */
var scanning = false;
var SKIP_FILE = /^(\.|~\$)|\.(tmp|temp|crdownload|part|partial|download|lnk)$|^(desktop\.ini|thumbs\.db|icon\r?)$/i;
var MIME_BY_EXT = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', webp:'image/webp', heic:'image/heic', heif:'image/heif', bmp:'image/bmp', tif:'image/tiff', tiff:'image/tiff',
  mp4:'video/mp4', mov:'video/quicktime', m4v:'video/mp4', webm:'video/webm', avi:'video/x-msvideo',
  pdf:'application/pdf', txt:'text/plain', csv:'text/csv', json:'application/json', xml:'application/xml', html:'text/html', htm:'text/html',
  doc:'application/msword', docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls:'application/vnd.ms-excel', xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', zip:'application/zip' };
function mimeFor(name, given) {
  if (given) return given;
  var m = /\.([a-z0-9]+)$/i.exec(name || ''); return m ? (MIME_BY_EXT[m[1].toLowerCase()] || '') : '';
}
function bulletinFor(ro, task) {
  if (!Array.isArray(ro.bulletins)) ro.bulletins = [];
  var es = ro.bulletins.filter(function (e) { return e.task === task; });
  if (es.length) return es[es.length - 1];
  var e = logEntry(task); ro.bulletins.push(e); return e;
}
function stampOf(ms) {
  var d = new Date(ms || Date.now());
  return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}
function scanFolder() {
  if (!folderOn() || scanning || syncing || writeBusy || TAB_LOCKED || PD_MIGRATING || PD_LAYOUT !== 'new') return Promise.resolve(0);
  scanning = true;
  var added = [], removed = 0, touched = {};
  return roDataRoot(false).then(function (root) {
    return STATE.ros.reduce(function (pr, ro) {
      return pr.then(function () {
        var folder = roFolderName(ro);
        if (ROFOLDER[ro.id] && ROFOLDER[ro.id] !== folder) return;           /* folder is being renamed */
        var recs = [];
        (ro.bulletins || []).forEach(function (e) { (e.files || []).forEach(function (f) { recs.push([e, f]); }); });
        /* the app is still copying some of this RO's files in — leave it for the next pass */
        if (recs.some(function (r) { return !r[1].inFolder || r[1].folder !== folder; })) return;
        return pdDirPath(root, folder, false)
          .then(function (d) { return d.getDirectoryHandle(PD_ATT).then(function (a) { return dirEntries(a, 'file'); }, function () { return []; }); }, function () { return null; })
          .then(function (ents) {
            if (!ents) return;
            var onDisk = {}; ents.forEach(function (h) { onDisk[h.name] = h; });
            var known = {};
            recs.forEach(function (r) { if (r[1].fname) known[r[1].fname] = r; });
            /* gone from the folder (two checks in a row, so a file mid-save or mid-sync isn't dropped) */
            Object.keys(known).forEach(function (nm) {
              var e = known[nm][0], f = known[nm][1];
              if (onDisk[nm]) { delete MISSING[f.id]; return; }
              MISSING[f.id] = (MISSING[f.id] || 0) + 1;
              if (MISSING[f.id] < 2) return;
              delete MISSING[f.id];
              var i = e.files.indexOf(f); if (i > -1) e.files.splice(i, 1);
              idbDel(f.id); removed++; touched[ro.id] = 1;
            });
            /* new in the folder */
            var fresh = Object.keys(onDisk).filter(function (nm) {
              return nm !== RO_FILE && !SKIP_FILE.test(nm) && !known[nm] && !WRITING[folder + '/' + nm];
            });
            return fresh.reduce(function (p2, nm) {
              return p2.then(function () {
                return onDisk[nm].getFile().then(function (file) {
                  var type = mimeFor(nm, file.type);
                  var entry = bulletinFor(ro, /^(image|video)\//.test(type) ? 'pics' : 'report');
                  entry.files.push({ id: uid(), name: nm, size: file.size, type: type, ts: stampOf(file.lastModified),
                    inFolder: true, folder: folder, fname: nm, fromFolder: true });
                  added.push(ro.roNumber || 'RO'); touched[ro.id] = 1;
                }).catch(function () {});
              });
            }, Promise.resolve());
          });
      });
    }, Promise.resolve());
  }).catch(function () {}).then(function () {
    scanning = false;
    if (added.length || removed) {
      scheduleSave(true);
      var busy = R && R.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(R.activeElement.tagName);
      if (HOST && HOST.isConnected && RO && touched[RO.id] && !busy) render();
      var ros = added.filter(function (x, i) { return added.indexOf(x) === i; });
      var say = (R && HOST && HOST.isConnected) ? toast : function (m) { pushToast(m); };   /* the RO page's toast only exists while it is open */
      if (added.length) say(added.length + (added.length === 1 ? ' file' : ' files') + ' added from the folder' + (ros.length === 1 ? ' \u00b7 RO ' + ros[0] : ' \u00b7 ' + ros.length + ' ROs'));
      else say(removed + (removed === 1 ? ' file' : ' files') + ' removed \u2014 deleted from the folder');
    }
    return added.length;
  });
}
var SCAN_EVERY = 6000;
setInterval(function () { if (document.visibilityState === 'visible') scanFolder(); }, SCAN_EVERY);
window.addEventListener('focus', function () { setTimeout(scanFolder, 300); });
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') setTimeout(scanFolder, 300); });
/* Chrome's folder observer, where the browser has it: changes land in about a second. */
var fsObs = null, fsObsFor = null;
function watchFolder() {
  if (typeof window.FileSystemObserver !== 'function' || !folderOn() || fsObsFor === FS.dir) return;
  try {
    if (fsObs) fsObs.disconnect();
    var t = null;
    fsObs = new window.FileSystemObserver(function () { clearTimeout(t); t = setTimeout(scanFolder, 800); });
    roDataRoot(true).then(function (root) { return fsObs.observe(root, { recursive: true }); })
      .then(function () { fsObsFor = FS.dir; }).catch(function () {});
  } catch (e) {}
}
setInterval(watchFolder, 5000);

function addFiles(oid, list, opId) {
  var entry = S.log.filter(function (e) { return e.oid === oid; })[0];
  if (!entry) return;
  var arr = Array.prototype.slice.call(list || []);
  if (!arr.length) return;
  var d = new Date(), ts = pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  var saved = 0;
  Promise.all(arr.map(function (file) {
    return shrinkImage(file).then(function (out) {
      var id = uid();
      saved += out.saved;
      return idbPut(id, out.blob).then(function () {
        var fo = { id: id, name: out.name, size: out.blob.size, type: out.blob.type || file.type, ts: nowIso() };
        if (opId) fo.op = opId;
        entry.files.push(fo);
      });
    });
  })).then(function () {
    save(true); render();
    syncFiles();
    toast(arr.length + (arr.length === 1 ? ' file attached' : ' files attached') +
      (saved > 300000 ? '  \u00b7  ' + bytes(saved) + ' saved by resizing' : ''));
  }).catch(function () { toast('Could not store the file in this browser'); });
}
