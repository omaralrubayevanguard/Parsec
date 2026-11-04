/* Parsec · library · store.js
   The Library’s records and files: STATE.libDocs / libCodes / libRules, the files in Parsec Data/Library/<kind>/, adding without doubles, and documents on an RO’s operations (op.docs) with a copy in Attachments.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libDocs libCodesAll libDocById libWho libDocLabel libDocChipText libDocsForCode libIdb libIdbDo libFolderOn libFileName libKindDir … (26 functions, 3 constants)
   state      libCodes libDocs libRules techName
   uses       data/ pages/ ro-page/ state/
*/
/* ============================== the Library's records and files (Parsec 17.1) ==============================
   STATE.libDocs   one record per document: kind, number, release, date, title, function group, model, the codes it
                   mentions, and where its file is. Every release is kept (RVXX2601 rel 01 and rel 02 are two records).
   STATE.libCodes  one record per code read from a DTC bulletin: its title, module, page and FTBs (P1050 · FTB 17 …).
   STATE.libRules  the number prefixes the shop has told Parsec about (EC → Recalls), on top of LIB_NUM_RULES.
   The files live in Parsec Data/Library/<kind>/ (CBR, TSB, FSB, Recalls, Procedures) — one copy, read from there.
   With no shop folder yet (a quick look, the tests) the file is kept in this browser until there is one.
   On an RO: op.docs = [{ id, at, by }] links an operation to a document, and a copy goes into the RO's Attachments. */

var LIB_DIR = "Library";
var LIB_IDB = "parsec-library", LIB_IDB_STORE = "files";

function libDocs(){ if(!Array.isArray(STATE.libDocs)) STATE.libDocs = []; return STATE.libDocs; }
function libCodesAll(){ if(!Array.isArray(STATE.libCodes)) STATE.libCodes = []; return STATE.libCodes; }
function libDocById(id){ var L = libDocs(); for(var i = 0; i < L.length; i++) if(L[i] && L[i].id === id) return L[i]; return null; }
function libWho(){ try{ return (typeof PG !== "undefined" && PG.me && PG.me().name) || STATE.techName || ""; }catch(e){ return ""; } }
/* RVXX2601 rel 02 · TSB 430-13 rel 01 */
function libDocLabel(d){ if(!d) return ""; return (d.num || "No number") + (d.rel ? " rel " + d.rel : ""); }
function libDocChipText(d){ var k = libKind(d && d.kind); return (k ? k.one + " " : "") + libDocLabel(d); }
/* the documents that cover a code: the bulletin it was read from first, then every document that mentions it */
function libDocsForCode(f){
  var key = typeof f === "string" ? f : libCodeKey(f), row = libCodeRow(key), out = [], seen = {};
  var add = function(d){ if(d && !seen[d.id]){ seen[d.id] = 1; out.push(d); } };
  if(row && row.doc) add(libDocById(row.doc));
  libDocs().forEach(function(d){ if(d && (d.codes || []).indexOf(key) > -1) add(d); });
  var seen2 = {}; return out.map(libLatest).filter(function(d){ if(seen2[d.id]) return false; seen2[d.id] = 1; return true; });   /* 17.3: the newest release of each */
}

/* ---------- the files ---------- */
function libIdb(){
  return new Promise(function(res, rej){
    if(!window.indexedDB) return rej(new Error("no indexeddb"));
    var r = indexedDB.open(LIB_IDB, 1);
    r.onupgradeneeded = function(){ r.result.createObjectStore(LIB_IDB_STORE); };
    r.onsuccess = function(){ res(r.result); }; r.onerror = function(){ rej(r.error); };
  });
}
function libIdbDo(mode, fn){ return libIdb().then(function(db){ return new Promise(function(res, rej){ var t = db.transaction(LIB_IDB_STORE, mode), q = fn(t.objectStore(LIB_IDB_STORE)); t.oncomplete = function(){ res(q && q.result); }; t.onerror = function(){ rej(t.error); }; }); }); }
function libFolderOn(){ return FS.status === "connected" && !!FS.dir; }
/* RVXX2601 - Potential Vehicle Roll (rel 02).pdf */
function libFileName(d, orig){
  var ext = (/\.[a-z0-9]{2,5}$/i.exec(orig || "") || [".pdf"])[0].toLowerCase();
  return pdSafe((d.num || "Document") + (d.title ? " - " + d.title : "") + (d.rel ? " (rel " + d.rel + ")" : ""), 110) + ext;
}
function libKindDir(kind, create){ var k = libKind(kind); return pdSub(LIB_DIR, create).then(function(lib){ return lib.getDirectoryHandle((k && k.dir) || "Other", { create: !!create }); }); }
/* write the file where it belongs; d.file says where it went */
function libWriteFile(d, blob, orig){
  d.file = { name: libFileName(d, orig), size: blob.size, type: blob.type || "application/pdf" };
  if(!libFolderOn()) return libIdbDo("readwrite", function(s){ return s.put(blob, d.id); }).then(function(){ d.file.inBrowser = true; return d; });
  var dir;
  return libKindDir(d.kind, true).then(function(h){ dir = h; return libUniqueName(h, d.file.name); })
    .then(function(nm){ d.file.name = nm; return dir.getFileHandle(nm, { create: true }); })
    .then(function(fh){ return fh.createWritable(); })
    .then(function(w){ return w.write(blob).then(function(){ return w.close(); }); })
    .then(function(){ var k = libKind(d.kind); d.file.path = LIB_DIR + "/" + ((k && k.dir) || "Other") + "/" + d.file.name; return d; });
}
function libUniqueName(dir, want){
  var dot = want.lastIndexOf("."), base = dot > 0 ? want.slice(0, dot) : want, ext = dot > 0 ? want.slice(dot) : "", n = 1;
  var next = function(){ var nm = n === 1 ? want : base + " (" + n + ")" + ext; return dir.getFileHandle(nm).then(function(){ n++; return next(); }, function(){ return nm; }); };
  return next();
}
/* the document's file, from the folder or this browser */
function libBlob(d){
  if(!d || !d.file) return Promise.resolve(null);
  var fromIdb = function(){ return libIdbDo("readonly", function(s){ return s.get(d.id); }).catch(function(){ return null; }); };
  if(!libFolderOn() || !d.file.path) return fromIdb();
  var parts = d.file.path.split("/");
  return pdSub(parts[0], false).then(function(lib){ return lib.getDirectoryHandle(parts[1]); })
    .then(function(k){ return k.getFileHandle(parts.slice(2).join("/")); }).then(function(fh){ return fh.getFile(); })
    .catch(fromIdb);
}
/* files kept in this browser move into the folder once there is one */
function libMoveToFolder(){
  if(!libFolderOn()) return Promise.resolve(0);
  var L = libDocs().filter(function(d){ return d && d.file && d.file.inBrowser; }), n = 0;
  return L.reduce(function(p, d){ return p.then(function(){
    return libIdbDo("readonly", function(s){ return s.get(d.id); }).then(function(b){ if(!b) return;
      var keep = d.file; return libWriteFile(d, b, keep.name).then(function(){ delete d.file.inBrowser; n++; return libIdbDo("readwrite", function(s){ return s.delete(d.id); }).catch(function(){}); }, function(){ d.file = keep; });
    });
  }); }, Promise.resolve()).then(function(){ if(n) scheduleSave(true); return n; });
}

/* ---------- adding to the Library ---------- */
/* the same number and release already there → that record (nothing is added twice) */
function libFind(kind, num, rel){
  var n = String(num || "").toUpperCase(), r = String(rel || "");
  return libDocs().filter(function(d){ return d && String(d.num || "").toUpperCase() === n && String(d.rel || "") === r && (!kind || d.kind === kind); })[0] || null;
}
/* f = the fields the person confirmed (+ table, the code table read from a DTC bulletin); blob = the file */
function libAdd(f, blob, origName){
  var have = libFind(f.kind, f.num, f.rel);
  if(have) return Promise.resolve(have);
  var d = { id: uid("ld"), kind: f.kind, num: String(f.num || "").trim(), rel: String(f.rel || "").trim(), date: f.date || "", title: String(f.title || "").trim(),
    fgrp: String(f.fgrp || "").trim(), model: f.model || "", mod: f.mod || "", opNo: f.opNo || "", codes: (f.codes || []).slice(0, 400), dtc: !!(f.table && f.table.length),
    years: String(f.years || "").trim(), info: f.info || "", proc: f.proc || undefined,   /* dtc: it brought a code table · proc: an Impact procedure's steps, warnings, tools, torques */
    addedAt: nowIso(), addedBy: libWho() };
  /* 17.3: what else it says — parts, labor, chassis ranges, symptoms, the repair in one line (library/read-more.js) */
  ["parts", "labor", "chassis", "symp", "steps"].forEach(function(k){ if(f[k] && f[k].length) d[k] = f[k].slice(0, 40); });
  if(f.fix) d.fix = String(f.fix);
  libLearn(f);
  return (blob ? libWriteFile(d, blob, origName) : Promise.resolve(d)).then(function(){
    libDocs().push(d);
    if(f.table && f.table.length) libMergeCodes(d, f.table);
    scheduleSave(true);
    return d;
  });
}
/* what the person said yes to: numbers starting with these letters are this kind (a learned kind is changed, not doubled),
   and a phrase to leave out of titles (17.3) */
function libLearn(f){
  var R = STATE.libRules = STATE.libRules || [];
  if(f.learn && f.num && f.kind){ var pre = libPrefixOf(f.num), had = R.filter(function(x){ return x && x.pre === pre; })[0];
    if(pre){ if(had) had.kind = f.kind; else R.push({ id: uid("lr"), pre: pre, kind: f.kind }); } }
  if(f.drop && !R.some(function(x){ return x && x.drop === f.drop; })) R.push({ id: uid("lr"), drop: f.drop });
}
/* a DTC bulletin's codes go into the code list; a code already there keeps its FTBs and gains the new ones */
function libMergeCodes(d, table){
  var L = libCodesAll(), fg = String(d.fgrp || "").slice(0, 2);
  table.forEach(function(t){
    var row = L.filter(function(x){ return x && x.key === t.key; })[0];
    if(!row){ row = { id: uid("lc"), key: t.key, title: t.title, alt: t.alt || [], mod: d.mod || "", fgrp: fg, page: t.page || null, doc: d.id, ftb: {} }; L.push(row); }
    Object.keys(t.ftb || {}).forEach(function(n){ if(!row.ftb[n] || !row.ftb[n].d) row.ftb[n] = t.ftb[n]; });
    if(!row.mod && d.mod) row.mod = d.mod;
  });
}
function libRemove(d){
  if(!d) return;
  STATE.libDocs = libDocs().filter(function(x){ return x !== d; });
  STATE.libCodes = libCodesAll().filter(function(x){ return x.doc !== d.id; });
  scheduleSave(true);
}

/* ---------- documents on an RO ---------- */
function libOpDocs(op){ return (op && Array.isArray(op.docs) ? op.docs : []).map(function(x){ return libDocById(x.id); }).filter(Boolean); }
/* every document used on the RO, by operation: [{ op, n, docs }] */
function libRoDocs(ro){
  var out = [];
  ((ro && ro.operations) || []).forEach(function(op, i){ var D = libOpDocs(op); if(D.length) out.push({ op: op, n: i + 1, docs: D }); });
  return out;
}
/* link a document to an operation, and put a copy in the RO's Attachments (filed under task: "dtc" or "report") */
function libAttach(ro, op, d, task, cb, tick){
  if(!ro || !op || !d){ if(cb) cb(false); return; }
  op.docs = Array.isArray(op.docs) ? op.docs : [];
  if(op.docs.some(function(x){ return x.id === d.id; })){ if(cb) cb(false); return; }
  op.docs.push({ id: d.id, at: nowIso(), by: libWho() });
  if(!op.fgrp && d.fgrp) op.fgrp = String(d.fgrp).slice(0, 3);
  scheduleSave(true);
  libBlob(d).then(function(b){
    if(!b || typeof JC === "undefined" || !JC.addFilesTo){ if(cb) cb(true); return; }
    var file; try{ file = new File([b], d.file && d.file.name || libFileName(d), { type: b.type || "application/pdf" }); }catch(e){ file = b; file.name = libFileName(d); }
    JC.addFilesTo(ro, task || (d.dtc ? "dtc" : "report"), [file], function(){ if(cb) cb(true); }, op.id, { doc: d.id }, !!tick);
  }, function(){ if(cb) cb(true); });
}
function libDetach(op, docId){ if(!op || !Array.isArray(op.docs)) return; op.docs = op.docs.filter(function(x){ return x.id !== docId; }); scheduleSave(true); }
/* an operation's function group: set by hand or by its documents, else from its codes */
function libOpFgrp(op){
  if(!op) return "";
  if(op.fgrp) return String(op.fgrp);
  var D = libOpDocs(op); for(var i = 0; i < D.length; i++) if(D[i].fgrp) return String(D[i].fgrp).slice(0, 3);
  var F = op.faults || []; for(var j = 0; j < F.length; j++){ var r = libCodeRow(F[j]); if(r && r.fgrp) return r.fgrp; }
  return "";
}
