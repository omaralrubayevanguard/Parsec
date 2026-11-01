/* Parsec · data · store-topics.js
   The data store's map (Parsec 16 A): PD_TOPICS says which Shop/<topic>.json holds which STATE keys, PD_SPLIT which are split by month or year, PD_HOME what lives with the ROs or in layout.json, PD_LOCAL_ONLY what stays on this computer. Also the small helpers (ids, hashes, canonical text).
   Flow: build/checks/data_keys.py fails the build when a STATE key has no home here. Server seam: this map is the table list a server would mirror.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pdIdOf pdIdxK pdT pdPlain pdNoMarks pdSig pdLeaf pdWho pdPc pdMonth pdHash pdIsRecs … (23 functions, 13 constants)
   state      techName tombs
   uses       shell/ state/
*/
/* ============================== Parsec 16 (A): the data store — the layout, the marks, the merge ==============================
   Parsec Data/
     layout.json                          which layout this is, when it was saved and by whom, and a write id (how a save
                                          made by another computer is spotted)
     ROs/Open/<RO - Customer>/            ro.json · <RO> Repair Order.html (a page to read — no data inside) · Attachments/
     ROs/Closed/<YYYY>/<RO - Customer>/   ro.json.gz · the page · Attachments/            (an RO moves with its files)
     Shop/<topic>.json                    people, settings, inventory, inbox, library, time, completed, lists, other, deleted
     Shop/clock/<YYYY-MM>.json · Shop/activity/<YYYY-MM>.json · Shop/timesheets/<YYYY>.json
   Every kind of data has one home (PD_TOPICS); a kind nobody has placed yet lands in Shop/other.json, and the build stops
   until it is placed. Only files whose content changed are written.
   Every record has an id; updatedAt / updatedBy are found by comparing with the last save; a deletion leaves a mark
   ({kind, id, parentId, deletedAt, by}) in STATE.tombs → Shop/deleted.json. When another computer saved in between, the
   two are merged record by record: one side changed it → that side; both changed different parts → both kept; both
   changed the same thing → the person picks (the newer is picked for them). A deletion beats an older edit. */

/*PD-MAP*/
var PD_TOPICS = {
  people:    ["staff", "perm", "customers", "cxChk", "goals", "cr", "crNotes", "techName"],
  settings:  ["theme", "shop", "shopName", "laborRate", "shiftEnd", "payAnchor", "settings", "mgSet", "automations", "yard", "shopRo",
              "rtCfg", "fmCfg", "fmTmr", "waCfg", "tgTemplates", "tgShop", "rlLayout", "rlViews", "rlCustom", "lastBackupAt", "pages128", "truckPicsV",
              "dataV", "dataClean", "setLog", "shopBtns"],   /* Parsec 16.3: shop buttons by department */
  inventory: ["inventory", "ptSet", "returns", "ptDone", "ptBayLog"],
  inbox:     ["ib", "handover", "pageNote", "pageNoteAt", "fmNote"],
  library:   ["fixes", "fxStd", "fxQ", "fxQk", "fxAlias", "fxRev", "fxKit", "truckPics", "truckCheckList"],
  time:      ["holes", "tlReq", "tlAirWhy"],             /* + the punches whose RO is gone (shop time) */
  completed: ["tcDone"],
  lists:     ["dismissed", "mobTickIds", "tgCleared", "fmCleared", "waCleared", "autoFired", "autoLog"],   /* Parsec 16.2: reminders already sent · What ran */
  deleted:   ["tombs"]
};
/* the busy ones, split by period: Shop/<dir>/<YYYY-MM or YYYY>.json */
var PD_SPLIT = { shifts: "clock", audit: "activity", tlSign: "timesheets", tlOk: "timesheets" };
/* with the ROs, and in layout.json */
var PD_HOME = { ros: "ROs", punches: "ROs", v: "layout", savedAt: "layout", pdKeyAt: "layout", pdShop: "layout" };
/* kinds that stay in this browser on purpose — each with its reason. The build check accepts a key listed here. */
var PD_LOCAL_ONLY = {
  /* "key": "why it stays on this computer" — none: every kind of data reaches the folder */
};
/*PD-MAP-END*/
var PD_LAYOUT_FILE = "layout.json", PD_OPEN = "Open", PD_CLOSED = "Closed";
var PD_SUBS = { ros: ["operations"], operations: ["parts", "log", "offNotes"] };   /* records inside records */
var PD_NO_TOMB = { audit: 1 };       
var PD_IDF = { tcDone: "k" };        /* the Completed line is keyed by k (RO|op|tech) — no id is added to it */
var PD_NO_MARK = { tcDone: 1 };      /* …and no updatedAt / updatedBy: a Completed line is written once */
function pdIdOf(kind, r){ return r ? r[PD_IDF[kind] || "id"] : undefined; }
function pdIdxK(kind, arr){ var o = {}; (arr || []).forEach(function(x){ var id = pdPlain(x) ? pdIdOf(kind, x) : null; if(id != null && !(id in o)) o[id] = x; }); return o; }
function pdT(v){ if(typeof v === "number") return v; var t = Date.parse(v); return isFinite(t) ? t : 0; }       /* the activity log trims itself — that isn't a deletion */
var PD_TOMB_MAX = 20000;
var PD16 = { on: false, W: {}, seen: null, base: null, M: null, bad: {}, warn: [], failed: "", clash: null, busy: false, partial: false,
             forceMismatch: false, last: null, merges: 0, old15: false };

/* ---------- small helpers ---------- */
function pdPlain(x){ return !!x && typeof x === "object" && !Array.isArray(x); }
function pdNoMarks(k, v){ return k === "updatedAt" || k === "updatedBy" ? undefined : v; }
function pdSig(x){ return x === undefined ? "\u0000u" : JSON.stringify(x, pdNoMarks); }
function pdLeaf(p){ return String(p || "").split("/").pop(); }
function pdWho(){ try{ return pxMeName() || "Admin"; }catch(e){ return String(STATE && STATE.techName || "") || "Admin"; } }
function pdPc(){ var id = null; try{ id = localStorage.getItem("pd16_pc"); if(!id){ id = uid("pc"); localStorage.setItem("pd16_pc", id); } }catch(e){ id = id || "pc"; } return id; }
function pdMonth(iso){ var d = new Date(iso); return isNaN(d.getTime()) ? "undated" : d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); }
function pdHash(s){   /* two FNV-1a passes → a short, stable id for a record that never had one */
  var a = 0x811c9dc5, b = 0x01000193 ^ 0x5bd1e995, i, c;
  for(i = 0; i < s.length; i++){ c = s.charCodeAt(i); a ^= c; a = Math.imul(a, 0x01000193) >>> 0; b ^= c; b = Math.imul(b, 0x5bd1e995) >>> 0; b ^= b >>> 13; }
  return (a >>> 0).toString(36) + (b >>> 0).toString(36);
}
function pdIsRecs(v){ return Array.isArray(v) && v.length > 0 && v.every(pdPlain); }
function pdIdList(v){ return Array.isArray(v) && v.length > 0 && v.every(function(x){ return pdPlain(x) && x.id != null && x.id !== ""; }); }
function pdIdx(arr){ var o = {}; (arr || []).forEach(function(x){ if(pdPlain(x) && x.id != null && !(x.id in o)) o[x.id] = x; }); return o; }
function pdDirPath(root, path, create){
  return String(path || "").split("/").filter(Boolean).reduce(function(p, name){ return p.then(function(d){ return d.getDirectoryHandle(name, { create: !!create }); }); }, Promise.resolve(root));
}
function pd16Gz(text){
  if(typeof pdGzip === "function") return pdGzip(text);
  if(typeof CompressionStream !== "function") return Promise.resolve(new Blob([text], { type: "application/json" }));
  return new Response(new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"))).blob();
}
function pd16Gunz(file){
  if(typeof pdGunzip === "function") return pdGunzip(file);
  return file.slice(0, 2).arrayBuffer().then(function(h){ var u = new Uint8Array(h);
    return u.length === 2 && u[0] === 0x1f && u[1] === 0x8b ? new Response(file.stream().pipeThrough(new DecompressionStream("gzip"))).text() : file.text(); });
}
function pd16Put(dir, name, data){
  return dir.getFileHandle(name, { create: true }).then(function(fh){ return fh.createWritable(); })
    .then(function(w){ return w.write(data).then(function(){ return w.close(); }); });
}
function pd16PutData(dir, name, text){ return /\.gz$/.test(name) ? pd16Gz(text).then(function(b){ return pd16Put(dir, name, b); }) : pd16Put(dir, name, text); }
function pd16ReadText(dir, name){
  return dir.getFileHandle(name).then(function(fh){ return fh.getFile(); }).then(function(f){ return /\.gz$/.test(name) ? pd16Gunz(f) : f.text(); });
}
function pd16Rm(dir, name, rec){ return dir.removeEntry(name, rec ? { recursive: true } : undefined).then(function(){ return true; }, function(){ return false; }); }

/* ---------- the one topic map: where each kind of data lives ---------- */
function pdTopicMap(S){
  S = S || STATE || {};
  var map = {};
  Object.keys(PD_TOPICS).forEach(function(t){ PD_TOPICS[t].forEach(function(k){ map[k] = "Shop/" + t + ".json"; }); });
  map.shifts = "Shop/clock/<YYYY-MM>.json"; map.audit = "Shop/activity/<YYYY-MM>.json";
  map.tlSign = map.tlOk = "Shop/timesheets/<YYYY>.json";
  map.ros = "ROs/Open/<RO - Customer>/ro.json · ROs/Closed/<YYYY>/<RO - Customer>/ro.json.gz";
  map.punches = "with their RO in ro.json (shop time: Shop/time.json)";
  ["v", "savedAt", "pdKeyAt", "pdShop"].forEach(function(k){ map[k] = PD_LAYOUT_FILE; });
  Object.keys(PD_LOCAL_ONLY).forEach(function(k){ map[k] = "this computer only — " + PD_LOCAL_ONLY[k]; });
  Object.keys(S).forEach(function(k){ if(!(k in map)) map[k] = "Shop/other.json"; });
  return map;
}
/* what goes in Shop/: {"Shop/people.json": text, "Shop/clock/2026-10.json": text, …} */
function pd16ShopFiles(S, orphans){
  var out = {}, done = {}, other = {}, groups = {}, has = [];
  Object.keys(PD_HOME).forEach(function(k){ done[k] = 1; });
  Object.keys(PD_LOCAL_ONLY).forEach(function(k){ done[k] = 1; });
  Object.keys(PD_TOPICS).forEach(function(t){
    var o = {};
    PD_TOPICS[t].forEach(function(k){ done[k] = 1; if(S[k] !== undefined) o[k] = S[k]; });
    if(t === "time" && orphans && orphans.length) o.orphanPunches = orphans;
    out["Shop/" + t + ".json"] = JSON.stringify(o);
  });
  var grp = function(p, key, v, obj){ var g = groups[p] = groups[p] || {}; if(obj){ (g[key] = g[key] || {})[obj] = v; } else (g[key] = g[key] || []).push(v); };
  Object.keys(PD_SPLIT).forEach(function(k){
    done[k] = 1; var v = S[k], dir = PD_SPLIT[k];
    if(v === undefined) return;
    if(dir === "timesheets"){
      if(!pdPlain(v)){ other[k] = v; return; }
      has.push(k); Object.keys(v).forEach(function(kk){ var y = (/(\d{4})-\d\d-\d\d/.exec(kk) || [])[1] || "undated"; grp("timesheets/" + y, k, v[kk], kk); });
      return;
    }
    if(!Array.isArray(v)){ other[k] = v; return; }
    has.push(k); v.forEach(function(x){ grp(dir + "/" + pdMonth(x && (k === "shifts" ? x.in : x.at)), k, x); });
  });
  Object.keys(S).sort().forEach(function(k){ if(!done[k] && S[k] !== undefined) other[k] = S[k]; });
  out["Shop/other.json"] = JSON.stringify(other);
  Object.keys(groups).sort().forEach(function(p){ out["Shop/" + p + ".json"] = JSON.stringify(groups[p]); });
  return { files: out, has: has };
}
