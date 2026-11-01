/* Parsec · state · folder-fs.js
   The File System Access handle to the shop folder (FS.dir) and the IndexedDB slot that remembers it between visits.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   idbOpen idbGet idbSet DATA_FILE FS IDB_NAME IDB_STORE IDB_KEY (3 functions, 5 constants)
*/
/* ===================== FOLDER STORAGE (File System Access API) =====================
   The app's real home is a folder on the tech's own computer. Everything lives in
   one JSON file there; localStorage is only a crash-net mirror. No server, no cloud. */
var DATA_FILE = "execution-console-data.json";
var FS = {
  supported: (typeof window.showDirectoryPicker === "function"),
  dir: null, dirName: null, lastWrite: null,
  status: "none"   // none | connected | needs-permission | unsupported
};
var IDB_NAME="tec-store", IDB_STORE="kv", IDB_KEY="dirHandle";

function idbOpen(){
  return new Promise(function(res,rej){
    var r = indexedDB.open(IDB_NAME,1);
    r.onupgradeneeded = function(e){ try{ e.target.result.createObjectStore(IDB_STORE); }catch(err){} };
    r.onsuccess = function(){ res(r.result); };
    r.onerror = function(){ rej(r.error); };
  });
}
function idbGet(k){
  return idbOpen().then(function(db){ return new Promise(function(res,rej){
    var tx=db.transaction(IDB_STORE,"readonly"), rq=tx.objectStore(IDB_STORE).get(k);
    rq.onsuccess=function(){res(rq.result);}; rq.onerror=function(){rej(rq.error);};
  });});
}
function idbSet(k,v){
  return idbOpen().then(function(db){ return new Promise(function(res,rej){
    var tx=db.transaction(IDB_STORE,"readwrite"); tx.objectStore(IDB_STORE).put(v,k);
    tx.oncomplete=function(){res();}; tx.onerror=function(){rej(tx.error);};
  });});
}
