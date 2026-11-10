/* Parsec · ro-page · bulletins.js
   Files on the RO: saving to the folder (or IndexedDB until there is one), shrinking images, thumbnails, the bulletin log entries that carry files.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   saveFileViaAnchor saveFile downloadAttachment shrinkImage folderOn safeName roFolderName roDirByName legacyName fileHome readFromFolder uniqueName … (27 functions, 13 constants)
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
  if (f.folder && f.fname && f.fname.indexOf('/') > -1) {   /* 17.1: a file someone put in a folder inside Attachments */
    var parts = f.fname.split('/'), leaf = parts.pop();
    return { dir: roDirByName(f.folder, false).then(function (d) { return parts.reduce(function (p, nm) { return p.then(function (x) { return x.getDirectoryHandle(nm); }); }, Promise.resolve(d)); }), name: leaf };
  }
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
/* every file in an RO's Attachments, folders inside it too (a few levels): [{ path: "Photos/hub.jpg", h }] */
function attWalk(dir, pre, depth) {
  var out = [];
  return dirEntries(dir).then(function (es) {
    return es.reduce(function (p, e) { return p.then(function () {
      if (/^\./.test(e.name)) return;
      var path = (pre ? pre + '/' : '') + e.name;
      if (e.kind === 'directory') { if ((depth || 0) < 3) return attWalk(e, path, (depth || 0) + 1).then(function (L) { out = out.concat(L); }); return; }
      out.push({ path: path, h: e });
    }); }, Promise.resolve());
  }).then(function () { return out; }, function () { return out; });
}
/* what the scan found shows: the RO page when its RO changed, and the app's lists, panels and counts */
/* 17.5: a file put straight into an RO's folder (beside its page, not in Attachments) moves into Attachments, so it shows
   on the RO like any other. Parsec's own files stay; a file that can't be moved is left where it is and not tried again. */
var ROOT_SKIP = {};
function attFromRoot(d, folder) {
  return dirEntries(d).then(function (es) {
    var L = es.filter(function (e) { return e.kind === 'file' && e.name !== RO_FILE && !PD_PAGE_RE.test(e.name) && !/\.json(\.gz)?$/i.test(e.name) && !SKIP_FILE.test(e.name) && !ROOT_SKIP[folder + '/' + e.name]; });
    if (!L.length) return 0;
    return d.getDirectoryHandle(PD_ATT, { create: true }).then(function (a) {
      return L.reduce(function (p, e) {
        return p.then(function () {
          return e.getFile().then(function (file) {
            if (Date.now() - file.lastModified < 4000) return;   /* still being copied in: the next pass takes it */
            return uniqueName(a, e.name).then(function (nm) {
              var key = folder + '/' + nm; WRITING[key] = 1;
              return a.getFileHandle(nm, { create: true }).then(function (fh) { return fh.createWritable(); })
                .then(function (w) { return w.write(file).then(function () { return w.close(); }); })
                .then(function () { delete WRITING[key]; return d.removeEntry(e.name).catch(function () { ROOT_SKIP[folder + '/' + e.name] = 1; }); },
                  function () { delete WRITING[key]; ROOT_SKIP[folder + '/' + e.name] = 1; return a.removeEntry(nm).catch(function () {}); });
            });
          }).catch(function () {});
        });
      }, Promise.resolve());
    });
  }).catch(function () { return 0; });
}
function jcScanShow(touched) {
  var busy = R && R.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(R.activeElement.tagName);
  if (HOST && HOST.isConnected && RO && (!touched || touched[RO.id]) && !busy) render();
  try { if (typeof tecRender === 'function') tecRender(); } catch (e) {}
}
function scanFolder() {
  if (!folderOn() || scanning || syncing || writeBusy || TAB_LOCKED || PD_MIGRATING || PD_LAYOUT !== 'new') return Promise.resolve(0);
  scanning = true;
  var added = [], removed = 0, touched = {};
  /* 17.1: the RO on screen first (and drawn as soon as it changes), then the open ones; closed ROs every half minute */
  var cur = (HOST && HOST.isConnected && RO && RO.id) || (UI && UI.selectedRo) || null, now = Date.now(), withClosed = now - (scanFolder.closedAt || 0) > 30000;
  if (withClosed) scanFolder.closedAt = now;
  var list = STATE.ros.filter(function (r) { return r.id === cur; }).concat(STATE.ros.filter(function (r) { return r.id !== cur && (withClosed || !r.dateClosed); }));
  var shown = false;
  return roDataRoot(false).then(function (root) {
    return list.reduce(function (pr, ro) {
      return pr.then(function () {
        if (!shown && touched[cur] && ro.id !== cur) { shown = true; jcScanShow(); }
        var folder = roFolderName(ro);
        if (ROFOLDER[ro.id] && ROFOLDER[ro.id] !== folder) return;           /* folder is being renamed */
        var recs = [];
        (ro.bulletins || []).forEach(function (e) { (e.files || []).forEach(function (f) { recs.push([e, f]); }); });
        /* 17.1: a file the app is still copying in (or one it couldn't) no longer holds up the rest of the RO's files */
        var settled = recs.filter(function (r) { return r[1].inFolder && r[1].folder === folder; });
        return pdDirPath(root, folder, false)
          .then(function (d) { return attFromRoot(d, folder).then(function () { return d.getDirectoryHandle(PD_ATT).then(function (a) { return attWalk(a, ''); }, function () { return []; }); }); }, function () { return null; })   /* 17.5: the RO folder's loose files first */
          .then(function (ents) {
            if (!ents) return;
            var onDisk = {}; ents.forEach(function (x) { onDisk[x.path] = x.h; });
            var known = {}, mine = {};
            recs.forEach(function (r) { if (r[1].fname) known[r[1].fname] = r; });
            settled.forEach(function (r) { if (r[1].fname) mine[r[1].fname] = r; });
            /* gone from the folder (two checks in a row, so a file mid-save or mid-sync isn't dropped) */
            Object.keys(mine).forEach(function (nm) {
              var e = mine[nm][0], f = mine[nm][1];
              if (onDisk[nm]) { delete MISSING[f.id]; return; }
              MISSING[f.id] = (MISSING[f.id] || 0) + 1;
              if (MISSING[f.id] < 2) return;
              delete MISSING[f.id];
              var i = e.files.indexOf(f); if (i > -1) e.files.splice(i, 1);
              idbDel(f.id); removed++; touched[ro.id] = 1;
            });
            /* new in the folder */
            var fresh = Object.keys(onDisk).filter(function (nm) {
              var leaf = nm.split('/').pop();
              return nm !== RO_FILE && !SKIP_FILE.test(leaf) && !known[nm] && !WRITING[folder + '/' + nm];
            });
            return fresh.reduce(function (p2, nm) {
              return p2.then(function () {
                return onDisk[nm].getFile().then(function (file) {
                  var leaf = nm.split('/').pop(), type = mimeFor(leaf, file.type);
                  if (!file.size && Date.now() - file.lastModified < 15000) return;   /* still being copied in: the next pass takes it */
                  var entry = bulletinFor(ro, /^(image|video)\//.test(type) ? 'pics' : 'report');
                  entry.files.push({ id: uid(), name: leaf, size: file.size, type: type, ts: stampOf(file.lastModified),
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
      jcScanShow(shown ? {} : touched);   /* the RO page again only if it was not drawn already */
      var ros = added.filter(function (x, i) { return added.indexOf(x) === i; });
      var say = (R && HOST && HOST.isConnected) ? toast : function (m) { pushToast(m); };   /* the RO page's toast only exists while it is open */
      if (added.length) say(added.length + (added.length === 1 ? ' file' : ' files') + ' added from the folder' + (ros.length === 1 ? ' \u00b7 RO ' + ros[0] : ' \u00b7 ' + ros.length + ' ROs'));
      else say(removed + (removed === 1 ? ' file' : ' files') + ' removed \u2014 deleted from the folder');
    }
    return added.length;
  });
}
var SCAN_EVERY = 4000;   /* 17.1: sooner (the folder observer, where the browser has one, is sooner still) */
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
    var t2 = null;
    fsObs = new window.FileSystemObserver(function (recs) {
      clearTimeout(t); t = setTimeout(scanFolder, 800);
      /* 17.1: an RO's data changed there (another computer saved) — look now instead of at the next check */
      var data = (recs || []).some(function (r) { var c = r.relativePathComponents || []; return c.indexOf(PD_ATT) < 0; });
      if (data && typeof pd16Poll === 'function') { clearTimeout(t2); t2 = setTimeout(function () { if (!writeBusy) pd16Poll(); }, 1500); }
    });
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
