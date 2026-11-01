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

/* ---------- where each RO's folder goes ---------- */
function pd16Closed(ro){ try{ return !!roIsDone(ro); }catch(e){ return !!(ro && ro.dateClosed); } }
function pd16Year(ro){ var t = 0; try{ t = roDoneAt(ro); }catch(e){} var y = t ? new Date(t).getFullYear() : NaN; return isFinite(y) && y > 1990 ? String(y) : String(new Date().getFullYear()); }
function pd16Parent(ro){ return pd16Closed(ro) ? PD_CLOSED + "/" + pd16Year(ro) : PD_OPEN; }
/* folder names never change — "RO-38097 - Blue Ridge Haulers"; two ROs that would share one: the later gets " (<id>)" */
function pd16Names(S){
  S = S || STATE;
  var NAMES = {}, used = {}, nowMs = Date.now();
  S.ros.forEach(function(ro){
    var base = roFolderFor(ro), had = ROFOLDER[ro.id] ? pdLeaf(ROFOLDER[ro.id]) : null;
    var lc = PD_LASTCUST[ro.id];
    if(!lc || lc.v !== (ro.customerName || "")) PD_LASTCUST[ro.id] = lc = { v: ro.customerName || "", at: nowMs };
    if(had && had !== base && had !== base + " (" + ro.id + ")" && had.split(" - ")[0].replace(/ \(.*\)$/, "") === roNumPart(ro) && nowMs - lc.at < 30000) base = had;
    if(had && (had === base || had === base + " (" + ro.id + ")") && !used[had.toLowerCase()]){ NAMES[ro.id] = had; used[had.toLowerCase()] = 1; }
  });
  S.ros.forEach(function(ro){
    if(NAMES[ro.id]) return;
    var base = roFolderFor(ro), name = used[base.toLowerCase()] ? base + " (" + ro.id + ")" : base;
    NAMES[ro.id] = name; used[name.toLowerCase()] = 1;
  });
  var out = {}; S.ros.forEach(function(ro){ out[ro.id] = pd16Parent(ro) + "/" + NAMES[ro.id]; });
  return out;
}
/* the page beside ro.json: the same readable record, with no data inside */
function pd16Page(ro, punches, savedAt, closed){
  var h;
  try{ h = roPageHtml(ro, punches || [], { savedAt: savedAt || Date.now() }); }
  catch(e){ h = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>' + esc(roNumPart(ro)) + ' Repair Order</title></head><body><h1>' + esc(ro.roNumber || "RO") + '</h1><p>' + esc(ro.customerName || "") + '</p></body></html>'; }
  return h.replace(PD_DATA_RE, "").replace("This page is the record Parsec keeps for this RO.", "A page to read. Parsec keeps this RO’s data in " + (closed ? "ro.json.gz" : "ro.json") + " beside it.");
}

/* ---------- ids, marks and deletion marks ---------- */
function pd16Ids(S){
  var fix = function(kind, arr){
    if(!Array.isArray(arr)) return;
    var seen = {};
    arr.forEach(function(r){ if(pdPlain(r) && r.id != null && r.id !== "") seen[r.id] = 1; });
    arr.forEach(function(r){
      if(!pdPlain(r)) return;
      if(r.id == null || r.id === ""){
        var h = kind.slice(0, 2) + "_" + pdHash(kind + JSON.stringify(r, pdNoMarks)), id = h, n = 2;
        while(seen[id]) id = h + "-" + n++;
        r.id = id; seen[id] = 1;
      }
      (PD_SUBS[kind] || []).forEach(function(sk){ fix(sk, r[sk]); });
    });
  };
  Object.keys(S).forEach(function(k){ if(k !== "tombs" && !PD_IDF[k] && pdIsRecs(S[k])) fix(k, S[k]); });
}
/* every record, children first: fn(kind, rec, parentKind, parentId) */
function pd16Walk(kind, rec, fn, pk, pid){
  (PD_SUBS[kind] || []).forEach(function(sk){ (Array.isArray(rec[sk]) ? rec[sk] : []).forEach(function(c){ if(pdPlain(c) && c.id != null) pd16Walk(sk, c, fn, kind, rec.id); }); });
  fn(kind, rec, pk, pid);
}
function pd16TopKinds(S){ return Object.keys(S).filter(function(k){ return k !== "tombs" && pdIsRecs(S[k]); }); }
function pd16Scan(S){
  var M = { raw: {}, sig: {}, par: {}, top: {}, key: {}, kids: {} };
  var kinds = pd16TopKinds(S), isK = {};
  kinds.forEach(function(k){ isK[k] = 1;
    S[k].forEach(function(rec){
      if(pdIdOf(k, rec) == null) return;
      var tk = k + ":" + pdIdOf(k, rec), kids = [];
      pd16Walk(k, rec, function(kind, r, pk, pid){
        var key = kind + ":" + pdIdOf(kind, r), j = JSON.stringify(r);
        M.raw[key] = j; M.sig[key] = pdSig(r); M.par[key] = pid == null ? null : pid;
        if(key !== tk) kids.push(key); else M.top[key] = j;
      });
      M.kids[tk] = kids;
    });
  });
  Object.keys(S).forEach(function(k){ if(!isK[k] && k !== "savedAt" && k !== "pdKeyAt" && k !== "tombs") M.key[k] = JSON.stringify(S[k] === undefined ? null : S[k]); });
  return M;
}
/* after a load, an adopt or a merge: what is in memory now is the baseline (no record counts as edited) */
function pdMarkReset(){ if(!STATE) return; try{ pd16Ids(STATE); PD16.M = pd16Scan(STATE); }catch(e){ console.warn("pd16 marks", e); PD16.M = null; } }
/* at save: anything that differs from the baseline gets updatedAt / updatedBy; anything gone gets a deletion mark */
function pdMark(){
  if(!STATE) return 0;
  if(!PD16.M){ pdMarkReset(); return 0; }
  pd16Ids(STATE);
  var O = PD16.M, M = { raw: {}, sig: {}, par: {}, top: {}, key: {}, kids: {} }, now = nowIso(), who = pdWho(), n = 0, kAt = {};
  var kinds = pd16TopKinds(STATE), isK = {};
  kinds.forEach(function(k){ isK[k] = 1;
    STATE[k].forEach(function(rec){
      if(pdIdOf(k, rec) == null) return;
      var tk = k + ":" + pdIdOf(k, rec), j0 = JSON.stringify(rec);
      if(O.top[tk] === j0 && O.kids[tk]){            /* untouched: carry it over */
        M.top[tk] = M.raw[tk] = j0; M.sig[tk] = O.sig[tk]; M.par[tk] = null; M.kids[tk] = O.kids[tk];
        O.kids[tk].forEach(function(c){ M.raw[c] = O.raw[c]; M.sig[c] = O.sig[c]; M.par[c] = O.par[c]; });
        return;
      }
      var kids = [];
      pd16Walk(k, rec, function(kind, r, pk, pid){
        var key = kind + ":" + pdIdOf(kind, r), s = pdSig(r);
        if(O.sig[key] !== s){ if(!PD_NO_MARK[kind]){ r.updatedAt = now; r.updatedBy = who; } n++; kAt[k] = 1; }
        M.raw[key] = JSON.stringify(r); M.sig[key] = s; M.par[key] = pid == null ? null : pid;
        if(key !== tk) kids.push(key); else M.top[key] = M.raw[key];
      });
      M.kids[tk] = kids;
    });
  });
  /* gone since the baseline → a deletion mark (a child only when its parent is still here) */
  var T = Array.isArray(STATE.tombs) ? STATE.tombs : null, have = {};
  (T || []).forEach(function(t){ have[t.kind + ":" + t.id] = 1; });
  Object.keys(O.raw).forEach(function(key){
    if(key in M.raw) return;
    var i = key.indexOf(":"), kind = key.slice(0, i), id = key.slice(i + 1), pid = O.par[key];
    if(pid == null) kAt[kind] = 1;
    if(PD_NO_TOMB[kind] || have[key]) return;
    if(pid != null){ var pkind = null; Object.keys(PD_SUBS).forEach(function(pk){ if(PD_SUBS[pk].indexOf(kind) > -1) pkind = pk; }); if(pkind && !((pkind + ":" + pid) in M.raw)) return; }
    if(!T) T = STATE.tombs = [];
    T.push({ kind: kind, id: id, parentId: pid == null ? null : pid, deletedAt: now, by: who }); have[key] = 1; n++;
  });
  /* a record that is back (undo, or kept by a merge) loses its mark */
  if(T){ var keep = T.filter(function(t){ return !((t.kind + ":" + t.id) in M.raw); }); if(keep.length !== T.length){ T.length = 0; Array.prototype.push.apply(T, keep); n++; }
    if(T.length > PD_TOMB_MAX) T.splice(0, T.length - PD_TOMB_MAX); }
  Object.keys(STATE).forEach(function(k){
    if(isK[k] || k === "savedAt" || k === "pdKeyAt" || k === "tombs") return;
    var j = JSON.stringify(STATE[k] === undefined ? null : STATE[k]);
    M.key[k] = j; if(O.key[k] !== j) kAt[k] = 1;
  });
  Object.keys(O.key).forEach(function(k){ if(!(k in M.key) && !isK[k]) kAt[k] = 1; });
  if(T && T.length !== (O.tombN || 0)) kAt.tombs = 1;
  M.tombN = T ? T.length : 0;
  var ks = Object.keys(kAt);
  if(ks.length){ if(!pdPlain(STATE.pdKeyAt)) STATE.pdKeyAt = {}; ks.forEach(function(k){ STATE.pdKeyAt[k] = now; }); }
  PD16.M = M;
  return n;
}
/* the folder as it was last read or written — the common ancestor of a merge */
function pdSnap(){ var M = PD16.M; if(!M) return null; return { recs: Object.assign({}, M.top), keys: Object.assign({}, M.key), savedAt: STATE.savedAt || 0, shop: STATE.pdShop && STATE.pdShop.id || null }; }
var PD16_BASE_T = null;
function pd16BaseKeep(){ clearTimeout(PD16_BASE_T); PD16_BASE_T = setTimeout(function(){ if(PD16.base) idbSet("pd16base", PD16.base).catch(function(){}); }, 4000); }
function pd16BaseLoad(shopId){ return idbGet("pd16base").then(function(b){ return b && b.recs && shopId && b.shop === shopId ? b : null; }, function(){ return null; }); }
/* clear deletion marks — all of them, or just these ids (once the server has taken them in) */
function pdTombsClear(ids){
  var T = Array.isArray(STATE.tombs) ? STATE.tombs : [], before = T.length;
  if(ids == null) T.length = 0;
  else { var want = {}; [].concat(ids).forEach(function(x){ want[pdPlain(x) ? x.kind + ":" + x.id : String(x)] = 1; });
    var keep = T.filter(function(t){ return !want[t.id] && !want[t.kind + ":" + t.id]; }); T.length = 0; Array.prototype.push.apply(T, keep); }
  STATE.tombs = T;
  var n = before - T.length;
  if(n){ if(PD16.M) PD16.M.tombN = T.length; scheduleSave(true); }
  return n;
}

/* ---------- the canonical form: the same data always gives the same text (order of keys and of records doesn't count) ---------- */
function pdCanon(S){
  var sortObj = function(v){
    if(Array.isArray(v)) return v.map(sortObj);
    if(!pdPlain(v)) return v;
    var o = {}; Object.keys(v).sort().forEach(function(k){ if(v[k] !== undefined) o[k] = sortObj(v[k]); }); return o;
  };
  var o = {};
  Object.keys(S || {}).sort().forEach(function(k){
    var v = S[k]; if(v === undefined || PD_LOCAL_ONLY[k]) return;
    if(Array.isArray(v) && v.every(function(x){ return pdPlain(x) && x.id != null; }))
      v = v.slice().sort(function(a, b){ var x = String(a.id), y = String(b.id); return x < y ? -1 : x > y ? 1 : 0; });
    o[k] = sortObj(v);
  });
  return JSON.stringify(o);
}

/* ---------- reading layout 16 ---------- */
function pd16Probe(){
  if(!FS.dir) return Promise.resolve("none");
  var has = function(d, n, dir){ return (dir ? d.getDirectoryHandle(n) : d.getFileHandle(n)).then(function(){ return true; }, function(){ return false; }); };
  return pdRoot(false).then(function(pd){
    return readJsonFile(pd, PD_LAYOUT_FILE).then(function(m){
      if(m && +m.layout >= 16) return "16";
      return Promise.all([has(pd, PD_LAYOUT_FILE + ".pending"), pd.getDirectoryHandle(PD_ROS).then(function(r){ return Promise.all([has(r, PD_OPEN, 1), has(r, PD_CLOSED, 1)]); }, function(){ return null; }), has(pd, PD_SHOP, 1)])
        .then(function(x){
          PD16.partial = x[0];
          if(!x[0] && x[1] && (x[1][0] || x[1][1])) return "16";         /* layout 16 whose layout.json went missing */
          return x[1] || x[2] ? "15" : "none";
        });
    });
  }, function(){ return "none"; }).then(function(k){
    if(k !== "none") return k;
    return Promise.all([has(FS.dir, RO_DATA_ROOT, 1), has(FS.dir, SHOP_FILE), has(FS.dir, DATA_FILE)]).then(function(x){ return x[0] || x[1] || x[2] ? "old" : "none"; });
  });
}
function pd16Read(opts){
  opts = opts || {};
  var st = {}, W = {}, dirs = {}, bad = {}, meta = null, ros = [], punches = [], orphans = [];
  var parse = function(path, text){ try{ var o = JSON.parse(text); W[path] = text; return o; }catch(e){ bad[path] = 1; return null; } };
  return pdRoot(false).then(function(pd){
    return (opts.meta ? Promise.resolve(opts.meta) : readJsonFile(pd, opts.pending ? PD_LAYOUT_FILE + ".pending" : PD_LAYOUT_FILE)).then(function(m){ meta = m || {}; })
      .then(function(){ return pd.getDirectoryHandle(PD_SHOP).then(function(shop){
        return dirEntries(shop, "file").then(function(fs){
          return Promise.all(fs.filter(function(f){ return /\.json$/.test(f.name); }).sort(function(a, b){ return a.name < b.name ? -1 : 1; }).map(function(f){
            return pd16ReadText(shop, f.name).then(function(t){ return [f.name, t]; }, function(){ bad["Shop/" + f.name] = 1; return null; }); }));
        }).then(function(L){
          L.forEach(function(x){ if(!x) return; var o = parse("Shop/" + x[0], x[1]); if(!pdPlain(o)) return;
            Object.keys(o).forEach(function(k){ if(k === "orphanPunches" && x[0] === "time.json"){ if(Array.isArray(o[k])) orphans = o[k]; } else st[k] = o[k]; }); });
          /* the busy ones, by period */
          var dirsOf = { clock: 1, activity: 1, timesheets: 1 };
          (meta.has || []).forEach(function(k){ if(PD_SPLIT[k]) st[k] = PD_SPLIT[k] === "timesheets" ? {} : []; });
          return Object.keys(dirsOf).reduce(function(p, dn){ return p.then(function(){
            return shop.getDirectoryHandle(dn).then(function(d){ return dirEntries(d, "file"); }, function(){ return []; }).then(function(fs){
              fs = fs.filter(function(f){ return /\.json$/.test(f.name); }).sort(function(a, b){ return a.name < b.name ? -1 : 1; });
              return shop.getDirectoryHandle(dn).then(function(d){
                return Promise.all(fs.map(function(f){ return pd16ReadText(d, f.name).then(function(t){ return [f.name, t]; }, function(){ bad["Shop/" + dn + "/" + f.name] = 1; return null; }); }));
              }, function(){ return []; }).then(function(L2){
                L2.forEach(function(x){ if(!x) return; var o = parse("Shop/" + dn + "/" + x[0], x[1]); if(!pdPlain(o)) return;
                  Object.keys(o).forEach(function(k){
                    if(Array.isArray(o[k])) st[k] = (Array.isArray(st[k]) ? st[k] : []).concat(o[k]);
                    else if(pdPlain(o[k])) st[k] = Object.assign(pdPlain(st[k]) ? st[k] : {}, o[k]);
                  }); });
              });
            });
          }); }, Promise.resolve());
        });
      }, function(){}); })
      .then(function(){ return pd.getDirectoryHandle(PD_ROS).then(function(root){
        var one = function(parentPath, d){
          var path = parentPath + "/" + d.name, closed = parentPath !== PD_OPEN, names = closed ? ["ro.json.gz", "ro.json"] : ["ro.json", "ro.json.gz"];
          var tryN = function(i){ if(i >= names.length) return Promise.resolve(null);
            return pd16ReadText(d, names[i]).then(function(t){ return [names[i], t]; }, function(e){ return e && e.name === "NotFoundError" ? tryN(i + 1) : (bad["ROs/" + path + "/" + names[i]] = 1, tryN(i + 1)); }); };
          return tryN(0).then(function(x){ if(!x) return null; var o = parse("ROs/" + path + "/" + x[0], x[1]); return o && o.ro && o.ro.id ? { path: path, o: o } : null; });
        };
        var inDir = function(parentPath, h){ return dirEntries(h, "directory").then(function(ds){ return Promise.all(ds.map(function(d){ return one(parentPath, d); })); }); };
        return root.getDirectoryHandle(PD_OPEN).then(function(h){ return inDir(PD_OPEN, h); }, function(){ return []; }).then(function(a){
          return root.getDirectoryHandle(PD_CLOSED).then(function(c){ return dirEntries(c, "directory").then(function(ys){
            return Promise.all(ys.map(function(y){ return inDir(PD_CLOSED + "/" + y.name, y); })).then(function(L){ return a.concat.apply(a, L); }); }); }, function(){ return a; });
        }).then(function(all){
          all.filter(Boolean).sort(function(x, y){ return x.path < y.path ? -1 : 1; }).forEach(function(x){
            if(dirs[x.o.ro.id]) return;                                   /* a stray copy of a folder */
            dirs[x.o.ro.id] = x.path; ros.push(x.o.ro);
            if(Array.isArray(x.o.punches)) punches = punches.concat(x.o.punches);
          });
        });
      }, function(){}); });
  }).then(function(){
    var ord = {}; (meta.roOrder || []).forEach(function(id, i){ ord[id] = i; });
    ros.sort(function(a, b){ var x = a.id in ord ? ord[a.id] : 1e9, y = b.id in ord ? ord[b.id] : 1e9; return x - y; });
    punches = orphans.concat(punches).sort(function(a, b){ var x = String(a && a.start || ""), y = String(b && b.start || ""); return x < y ? -1 : x > y ? 1 : 0; });
    if(meta.v !== undefined) st.v = meta.v; st.savedAt = meta.savedAt || 0;
    if(pdPlain(meta.keyAt)) st.pdKeyAt = meta.keyAt;
    if(meta.shop) st.pdShop = meta.shop;
    st.ros = ros; st.punches = punches;
    return { state: st, meta: meta, W: W, dirs: dirs, bad: bad };
  });
}
/* the folder as read is now what this computer knows is on disk */
function pd16Commit(F){
  PD16.W = F.W; PD16.bad = F.bad || {};
  Object.keys(ROFOLDER).forEach(function(k){ delete ROFOLDER[k]; }); Object.assign(ROFOLDER, F.dirs);
  if(F.meta && F.meta.writeId) PD16.seen = F.meta.writeId;
  if(F.meta && F.meta.moved) PD16.moved = F.meta.moved;
  var nb = Object.keys(PD16.bad);
  if(nb.length){ PD16.warn = nb; console.warn("Parsec couldn't read", nb); }
}

/* ---------- writing layout 16: only what changed ---------- */
function pd16Meta(S, has){
  return { layout: 16, about: "Parsec's data. ROs/Open and ROs/Closed/<year>: one folder per repair order. Shop: everything else, by topic. Parsec writes these files — don't edit them by hand.",
    app: typeof BUILD !== "undefined" ? String(BUILD).split(" · ")[0] : "Parsec 16", v: S.v, savedAt: S.savedAt || 0, savedAtText: new Date(S.savedAt || Date.now()).toISOString(),
    writeId: uid("w"), by: pdWho(), computer: pdPc(), shop: S.pdShop || null, keyAt: pdPlain(S.pdKeyAt) ? S.pdKeyAt : undefined, has: has || [],
    roOrder: (S.ros || []).map(function(r){ return r.id; }), moved: PD16.moved || undefined };
}
/* an RO's folder moves (Open ↔ Closed/<year>, or a new name) with its attachments */
function pdMovePath(root, from, to, ro){
  var data = function(nm){ return nm === "ro.json" || nm === "ro.json.gz" || PD_PAGE_RE.test(nm); };
  return pdDirPath(root, from, false).then(function(src){
    return pdDirPath(root, to, true).then(function(dst){ return copyTree(src, dst, true, data); })
      .then(function(){ return dirEntries(src, "file"); })
      .then(function(fs){ return fs.filter(function(f){ return data(f.name); }).reduce(function(p, f){ return p.then(function(){ return pd16Rm(src, f.name); }); }, Promise.resolve()); })
      .then(function(){ return pd16RmEmpty(root, from); });
  }, function(){})
    .then(function(){
      (ro.bulletins || []).forEach(function(e){ (e.files || []).forEach(function(f){ if(f.folder === from) f.folder = to; }); });
      Object.keys(PD16.W).forEach(function(p){ if(p.indexOf("ROs/" + from + "/") === 0) delete PD16.W[p]; });
    });
}
/* a folder with nothing left in it goes (and an empty Closed/<year> above it) */
function pd16RmEmpty(root, path){
  var parts = path.split("/"), leaf = parts.pop();
  return pdDirPath(root, parts.join("/"), false).then(function(par){
    return par.getDirectoryHandle(leaf).then(function(d){ return dirEntries(d); }).then(function(es){ if(!es.length) return pd16Rm(par, leaf); }, function(){})
      .then(function(){ if(parts.length === 2 && parts[0] === PD_CLOSED) return pd16RmEmpty(root, parts.join("/")); });
  }, function(){});
}
function pd16Group(S){
  var byRo = {}, orphans = [];
  S.ros.forEach(function(ro){ byRo[ro.id] = []; });
  (S.punches || []).forEach(function(p){ if(p && byRo[p.roId]) byRo[p.roId].push(p); else orphans.push(p); });
  return { byRo: byRo, orphans: orphans };
}
function pd16WriteRos(S, names, byRo){
  var live = {};
  return roDataRoot(true).then(function(root){
    return S.ros.reduce(function(pr, ro){
      return pr.then(function(){
        var want = names[ro.id], had = ROFOLDER[ro.id];
        live[want] = 1;
        return (had && had !== want ? pdMovePath(root, had, want, ro) : Promise.resolve()).then(function(){
          var closed = want.indexOf(PD_CLOSED + "/") === 0, fname = closed ? "ro.json.gz" : "ro.json", other = closed ? "ro.json" : "ro.json.gz";
          var text = JSON.stringify({ v: 16, ro: ro, punches: byRo[ro.id] }), key = "ROs/" + want + "/" + fname;
          ROFOLDER[ro.id] = want;
          if(PD16.W[key] === text) return;
          return pdDirPath(root, want, true).then(function(d){
            var page = roPageName(ro);
            return pd16PutData(d, fname, text)
              .then(function(){ return pd16Put(d, page, pd16Page(ro, byRo[ro.id], S.savedAt, closed)); })
              .then(function(){ return dirEntries(d, "file"); })
              .then(function(fs){ return fs.filter(function(f){ return f.name === other || (PD_PAGE_RE.test(f.name) && f.name !== page); })
                .reduce(function(p2, f){ return p2.then(function(){ return pd16Rm(d, f.name); }); }, Promise.resolve()); })
              .then(function(){ PD16.W[key] = text; delete PD16.W["ROs/" + want + "/" + other]; });
          });
        });
      });
    }, Promise.resolve()).then(function(){
      /* an RO that is gone loses its record and its page; its attachments stay where they are */
      var gone = {};
      Object.keys(PD16.W).forEach(function(p){ var m = /^ROs\/(.+)\/ro\.json(\.gz)?$/.exec(p); if(m && !live[m[1]] && !PD16.bad[p]) gone[m[1]] = 1; });
      return Object.keys(gone).reduce(function(pr, path){ return pr.then(function(){
        return pdDirPath(root, path, false).then(function(d){
          return dirEntries(d, "file").then(function(fs){ return fs.filter(function(f){ return f.name === "ro.json" || f.name === "ro.json.gz" || PD_PAGE_RE.test(f.name); })
            .reduce(function(p2, f){ return p2.then(function(){ return pd16Rm(d, f.name); }); }, Promise.resolve()); })
            .then(function(){ return d.getDirectoryHandle(PD_ATT).then(function(a){ return dirEntries(a); }).then(function(x){ if(!x.length) return pd16Rm(d, PD_ATT); }, function(){}); });
        }, function(){}).then(function(){ delete PD16.W["ROs/" + path + "/ro.json"]; delete PD16.W["ROs/" + path + "/ro.json.gz"]; return pd16RmEmpty(root, path); });
      }); }, Promise.resolve());
    });
  });
}
function pd16WriteShop(files){
  return pdSub(PD_SHOP, true).then(function(shop){
    var paths = Object.keys(files);
    return paths.reduce(function(pr, p){ return pr.then(function(){
      if(PD16.W[p] === files[p]) return;
      var rel = p.slice(5), parts = rel.split("/"), leaf = parts.pop();
      return pdDirPath(shop, parts.join("/"), true).then(function(d){
        /* a file Parsec couldn't read is kept beside the new one, never just overwritten */
        var keep = PD16.bad[p] ? d.getFileHandle(leaf).then(function(fh){ return fh.getFile(); }).then(function(f){ return pd16Put(d, leaf + ".unreadable-" + Date.now() + ".txt", f); }).then(function(){ delete PD16.bad[p]; }, function(){}) : Promise.resolve();
        return keep.then(function(){ return pd16PutData(d, leaf, files[p]); }).then(function(){ PD16.W[p] = files[p]; });
      });
    }); }, Promise.resolve()).then(function(){
      /* a month or year with nothing left in it */
      return Object.keys(PD16.W).filter(function(p){ return p.indexOf("Shop/") === 0 && !(p in files); }).reduce(function(pr, p){ return pr.then(function(){
        var rel = p.slice(5), parts = rel.split("/"), leaf = parts.pop();
        return pdDirPath(shop, parts.join("/"), false).then(function(d){ return pd16Rm(d, leaf); }, function(){}).then(function(){ delete PD16.W[p]; });
      }); }, Promise.resolve());
    });
  });
}
/* the whole state → the folder (layout.json last: until it is written, the save hasn't happened) */
/* the whole state → the folder. layout.json goes first (saving: true — a save is under way, here is its write id), then the
   ROs and Shop, then layout.json again with a new write id (saving: false — done). Another computer that looks in the middle
   waits for the second one. Moving to 16 writes layout.json.pending once, at the end. */
function pd16Write(S, opts){
  S = S || STATE; opts = opts || {};
  var names = pd16Names(S), g = pd16Group(S), sf = pd16ShopFiles(S, g.orphans), seen = PD16.seen, raced = false, pd;
  var meta = pd16Meta(S, sf.has), first = Object.assign({}, meta, { saving: true });
  var put = function(m){ return pd16Put(pd, opts.pending ? PD_LAYOUT_FILE + ".pending" : PD_LAYOUT_FILE, JSON.stringify(m, null, 1)); };
  return pdRoot(true).then(function(d){ pd = d;
    if(opts.pending) return;
    return (opts.race ? readJsonFile(pd, PD_LAYOUT_FILE).then(function(m){ if(m && m.writeId && seen && m.writeId !== seen) raced = true; }) : Promise.resolve())
      .then(function(){ return put(first); }).then(function(){ PD16.seen = first.writeId; });
  })
    .then(function(){ return pd16WriteRos(S, names, g.byRo); })
    .then(function(){ return pd16WriteShop(sf.files); })
    .then(function(){ return opts.pending ? null : readJsonFile(pd, PD_LAYOUT_FILE).then(function(m){ if(m && m.writeId && m.writeId !== first.writeId) raced = true; }); })
    .then(function(){ return put(meta); })
    .then(function(){ if(!opts.pending) PD16.seen = meta.writeId; if(raced) Object.defineProperty(meta, "raced", { value: true }); return meta; });
}
/* read, but not in the middle of another computer's save */
function pd16ReadSettled(n){
  return pd16Read().then(function(F){
    if(F.meta && F.meta.saving && (n || 0) < 5) return new Promise(function(r){ setTimeout(r, 600); }).then(function(){ return pd16ReadSettled((n || 0) + 1); });
    return F;
  });
}
/* has another computer saved since this one last read or wrote? */
function pd16Changed(){
  if(!FS.dir) return Promise.resolve(false);
  return pdRoot(false).then(function(d){ return readJsonFile(d, PD_LAYOUT_FILE); }).then(function(m){ return !!(m && m.writeId && m.writeId !== PD16.seen); }, function(){ return false; });
}

/* ---------- the merge ---------- */
function pdSameShop(a, b){
  var x = a && a.pdShop && a.pdShop.id, y = b && b.pdShop && b.pdShop.id;
  if(x && y) return x === y;
  var ra = (a && a.ros) || [], rb = (b && b.ros) || [];
  if(!ra.length || !rb.length) return true;
  var ids = {}; ra.forEach(function(r){ ids[r.id] = 1; });
  return rb.some(function(r){ return ids[r.id]; });
}
function pdAt(x){ var t = x && x.updatedAt ? Date.parse(x.updatedAt) : 0; return isFinite(t) ? t : 0; }
/* base: pdSnap() of the last agreed folder (or null); choices: {clashId: "mine"|"theirs"} from the dialog */
function pdMerge(base, mine, theirs, choices){
  var clashes = [], stats = { theirs: 0, mine: 0, both: 0, gone: 0, kept: 0, keys: 0, kinds: {} }, out = {};
  var mSaved = mine.savedAt || 0, tSaved = theirs.savedAt || 0, mKA = mine.pdKeyAt || {}, tKA = theirs.pdKeyAt || {};
  var side = function(a, b){ return a > b ? "mine" : b > a ? "theirs" : (tSaved > mSaved ? "theirs" : "mine"); };
  var tombs = {};
  [].concat(Array.isArray(mine.tombs) ? mine.tombs : [], Array.isArray(theirs.tombs) ? theirs.tombs : []).forEach(function(t){
    if(!pdPlain(t)) return; var k = t.kind + ":" + t.id; if(!tombs[k] || Date.parse(t.deletedAt) < Date.parse(tombs[k].deletedAt)) tombs[k] = t; });
  var bump = function(kind, how){ stats[how]++; if(how !== "mine") stats.kinds[kind] = (stats.kinds[kind] || 0) + 1; };
  var label = function(kind, rec){ if(kind === "ros"){ var no = String(rec.roNumber || rec.id); return (/^RO/i.test(no) ? no : "RO " + no) + (rec.customerName ? " · " + rec.customerName : ""); }
    if(kind === "punches") return "Time punch" + (rec.by ? " · " + rec.by : "") + (rec.start ? " · " + pdWhenTxt(rec.start) : "");
    if(kind === "shifts") return "Day clock" + (rec.by ? " · " + rec.by : "") + (rec.in ? " · " + pdWhenTxt(rec.in) : "");
    if(kind === "staff") return "Person · " + (rec.name || rec.id);
    if(kind === "inventory") return "Part · " + (rec.desc || rec.pn || rec.id);
    return kind + " · " + (rec.name || rec.title || rec.text || rec.id); };
  function m3(b, m, t, cx){
    var sm = pdSig(m), st = pdSig(t);
    if(sm === st) return pdAt(t) > pdAt(m) ? t : m;
    if(b !== undefined){ var sb = pdSig(b); if(sb === sm) return t; if(sb === st) return m; }
    if(pdPlain(m) && pdPlain(t)){
      var c2 = Object.assign({}, cx); if(m.updatedAt || t.updatedAt){ c2.mAt = pdAt(m) || cx.mAt; c2.tAt = pdAt(t) || cx.tAt; c2.mBy = m.updatedBy || cx.mBy; c2.tBy = t.updatedBy || cx.tBy; }
      var o = {}, ks = Object.keys(m).concat(Object.keys(t).filter(function(k){ return !(k in m); }));
      ks.forEach(function(k){ if(k === "updatedAt" || k === "updatedBy") return;
        var v = m3(pdPlain(b) ? b[k] : undefined, m[k], t[k], Object.assign({}, c2, { path: cx.path ? cx.path + "." + k : k }));
        if(v !== undefined) o[k] = v; });
      return o;
    }
    var idl = function(a){ return Array.isArray(a) && (a.length === 0 || pdIdList(a)); };
    if(idl(m) && idl(t) && (m.length || t.length)) return byId(Array.isArray(b) ? b : [], m, t, cx);
    if(Array.isArray(m) && Array.isArray(t) && m.concat(t).every(function(x){ return x === null || typeof x !== "object"; })){
      var bs = {}, ms = {}, ts = {}; (Array.isArray(b) ? b : []).forEach(function(x){ bs[JSON.stringify(x)] = 1; });
      m.forEach(function(x){ ms[JSON.stringify(x)] = 1; }); t.forEach(function(x){ ts[JSON.stringify(x)] = 1; });
      return m.filter(function(x){ var k = JSON.stringify(x); return ts[k] || !bs[k]; }).concat(t.filter(function(x){ var k = JSON.stringify(x); return !ms[k] && !bs[k]; }));
    }
    /* both changed the same thing: a real clash */
    var id = cx.rk + "|" + (cx.path || ""), def = side(cx.mAt || 0, cx.tAt || 0), pick = choices && choices[id] || def;
    clashes.push({ id: id, rk: cx.rk, kind: cx.kind, label: cx.label, rec: cx.rec, path: cx.path || "", mine: m, theirs: t, pick: pick, def: def,
      mAt: cx.mAt || 0, tAt: cx.tAt || 0, mBy: cx.mBy || "", tBy: cx.tBy || "" });
    return pick === "theirs" ? t : m;
  }
  function byId(b, m, t, cx){
    var bi = pdIdx(b), mi = pdIdx(m), ti = pdIdx(t), res = [];
    m.forEach(function(x){
      var tt = ti[x.id], bb = bi[x.id];
      if(tt) res.push(m3(bb, x, tt, Object.assign({}, cx, { path: (cx.path || "") + "[" + x.id + "]" })));
      else if(!(bb && pdSig(bb) === pdSig(x))) res.push(x);           /* new here, or changed here after they removed it */
    });
    addTheirs(res, t, function(x){ return !mi[x.id] && !(bi[x.id] && pdSig(bi[x.id]) === pdSig(x)); });
    return res;
  }
  function addTheirs(res, t, want, kind){   /* theirs-only, each after the record it followed there */
    var idOf = function(x){ return kind ? pdIdOf(kind, x) : x && x.id; };
    var pos = {}; res.forEach(function(x, i){ pos[idOf(x)] = i; });
    var prev = null;
    t.forEach(function(x){
      if(want(x)){ var at = prev != null && prev in pos ? pos[prev] + 1 : res.length; res.splice(at, 0, x); pos = {}; res.forEach(function(y, i){ pos[idOf(y)] = i; }); }
      prev = idOf(x);
    });
  }
  var skip = { savedAt: 1, pdKeyAt: 1, tombs: 1, v: 1, pdShop: 1 };
  var keys = Object.keys(mine).concat(Object.keys(theirs).filter(function(k){ return !(k in mine); }));
  keys.forEach(function(k){
    if(skip[k]) return;
    var m = mine[k], t = theirs[k];
    if(m === undefined){ out[k] = t; return; }                      /* a whole kind is never dropped by a merge */
    if(t === undefined){ out[k] = m; return; }
    if(pdIsRecs(m) || pdIsRecs(t)){
      var ma = Array.isArray(m) ? m : [], ta = Array.isArray(t) ? t : [], mi = pdIdxK(k, ma), ti = pdIdxK(k, ta), res = [], I = function(x){ return pdPlain(x) ? pdIdOf(k, x) : null; };
      var one = function(id, mm, tt){
        var key = k + ":" + id, bj = base && base.recs ? base.recs[key] : undefined, bb, v;
        if(bj !== undefined){ try{ bb = JSON.parse(bj); }catch(e){} }
        if(mm && tt){
          var sm = pdSig(mm), st = pdSig(tt);
          if(sm === st) v = pdAt(tt) > pdAt(mm) ? tt : mm;
          else if(bb && pdSig(bb) === sm){ v = tt; bump(k, "theirs"); }
          else if(bb && pdSig(bb) === st){ v = mm; bump(k, "mine"); }
          else if(bb){
            v = m3(bb, mm, tt, { rk: key, kind: k, label: label(k, mm), rec: mm, mAt: pdAt(mm), tAt: pdAt(tt), mBy: mm.updatedBy, tBy: tt.updatedBy, path: "" });
            if(pdPlain(v) && !PD_NO_MARK[k]){ v.updatedAt = nowIso(); v.updatedBy = pdWho(); }
            bump(k, "both"); }
          else { v = side(pdAt(mm), pdAt(tt)) === "theirs" ? tt : mm; bump(k, v === tt ? "theirs" : "mine"); }
        } else if(tt){ v = tt; bump(k, "theirs"); }
        else v = mm;
        var tomb = tombs[key];
        if(tomb && v){ if(pdAt(v) > (Date.parse(tomb.deletedAt) || 0)) delete tombs[key];   /* edited after it was deleted: it stays */
          else { v = null; if(mm) bump(k, "gone"); } }                /* a deletion beats an older edit */
        return v;
      };
      ma.forEach(function(x){ if(I(x) == null){ res.push(x); return; } var v = one(I(x), x, ti[I(x)]); if(v) res.push(v); });
      var add = {}; ta.forEach(function(x){ if(I(x) != null && !mi[I(x)]){ var v = one(I(x), null, x); if(v) add[I(x)] = v; } });
      addTheirs(res, ta.map(function(x){ return (I(x) != null && add[I(x)]) || x; }), function(x){ return I(x) != null && !!add[I(x)] && add[I(x)] === x; }, k);
      /* a record with no key at all is kept from both sides (once) */
      var sigs = {}; res.forEach(function(x){ if(I(x) == null) sigs[pdSig(x)] = 1; });
      ta.forEach(function(x){ if(I(x) == null && !sigs[pdSig(x)]){ res.push(x); sigs[pdSig(x)] = 1; } });
      if(k === "audit") res.sort(function(a, c){ var x = String(a.at || ""), y = String(c.at || ""); return x < y ? -1 : x > y ? 1 : 0; });
      out[k] = res; return;
    }
    var bjk = base && base.keys ? base.keys[k] : undefined, bk;
    if(bjk !== undefined){ try{ bk = JSON.parse(bjk); }catch(e){} }
    var v = bk === undefined ? (pdSig(m) === pdSig(t) ? m : side(pdT(mKA[k]), pdT(tKA[k])) === "theirs" ? t : m)    /* no common ancestor: the newer change */
      : m3(bk, m, t, { rk: "key:" + k, kind: k, label: pdKeyLabel(k), mAt: pdT(mKA[k]), tAt: pdT(tKA[k]), path: "" });
    if(pdSig(v) !== pdSig(m)) stats.keys++;
    out[k] = v;
  });
  /* the marks that still stand: none for a record that is still here */
  var live = {};
  Object.keys(out).forEach(function(k){ if(Array.isArray(out[k])) out[k].forEach(function(r){ if(pdPlain(r) && pdIdOf(k, r) != null){ live[k + ":" + pdIdOf(k, r)] = 1;
    (PD_SUBS[k] || []).forEach(function(sk){ (r[sk] || []).forEach(function(c){ if(c && c.id != null){ live[sk + ":" + c.id] = 1; (PD_SUBS[sk] || []).forEach(function(s2){ (c[s2] || []).forEach(function(g){ if(g && g.id != null) live[s2 + ":" + g.id] = 1; }); }); } }); }); } }); });
  out.tombs = Object.keys(tombs).filter(function(k){ return !live[k]; }).map(function(k){ return tombs[k]; }).sort(function(a, b){ return String(a.deletedAt) < String(b.deletedAt) ? -1 : 1; });
  var mt = {}; (Array.isArray(mine.tombs) ? mine.tombs : []).forEach(function(t){ if(t) mt[t.kind + ":" + t.id] = 1; });
  stats.tombsNew = out.tombs.filter(function(t){ return !mt[t.kind + ":" + t.id]; }).length;
  var ka = {}; Object.keys(mKA).concat(Object.keys(tKA)).forEach(function(k){ var a = pdT(mKA[k]), b = pdT(tKA[k]); ka[k] = new Date(Math.max(a, b)).toISOString(); });
  out.pdKeyAt = ka; out.v = mine.v || theirs.v || 1; out.savedAt = Math.max(mSaved, tSaved); out.pdShop = theirs.pdShop || mine.pdShop;
  return { state: out, clashes: clashes, stats: stats };
}
function pdKeyLabel(k){ var t = {}; Object.keys(PD_TOPICS).forEach(function(n){ PD_TOPICS[n].forEach(function(x){ t[x] = n; }); });
  var nice = String(k).replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase(); return (t[k] ? t[k].charAt(0).toUpperCase() + t[k].slice(1) : "Shop") + " · " + nice; }
function pdWhenTxt(iso){ try{ return fmtDate(iso) + " " + fmtTime(iso); }catch(e){ return String(iso || ""); } }

/* ---------- the clash dialog: Keep this / Keep that, per row; the newer is picked for you ---------- */
function pdClashText(v){
  if(v === undefined || v === null || v === "") return "(empty)";
  if(typeof v === "boolean") return v ? "Yes" : "No";
  if(typeof v === "string") return v.length > 90 ? v.slice(0, 88) + "…" : v;
  if(typeof v === "number") return String(v);
  var s = JSON.stringify(v); return s.length > 90 ? s.slice(0, 88) + "…" : s;
}
function pdClashWhere(c){
  /* "operations[op_1].parts[pt_2].qty" → "Operation 1 (Brakes…) · Part 2 · qty" */
  var p = String(c.path || ""), rx = /(operations|parts|log|offNotes)\[([^\]]+)\]/g, m, names = { operations: "Operation", parts: "Part", log: "Note", offNotes: "Note" }, lead = [], cur = c.rec;
  while((m = rx.exec(p))){
    var n = "", arr = cur && cur[m[1]], hit = null;
    if(Array.isArray(arr)) arr.forEach(function(o, i){ if(o && String(o.id) === m[2]){ hit = o; n = " " + (i + 1) + (m[1] === "operations" && o.complaint ? " (" + pdClashText(o.complaint).slice(0, 40) + ")" : ""); } });
    cur = hit; lead.push(names[m[1]] + n);
  }
  var rest = p.replace(rx, "").split(".").filter(Boolean).map(function(f){ return String(f).replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase(); });
  return lead.concat(rest.length ? [rest.join(" › ")] : []).join(" · ");
}
function pdClashAsk(clashes){
  return new Promise(function(res){
    var host = document.createElement("div"), pick = {};
    host.className = "pd16-clash"; host.setAttribute("role", "dialog"); host.setAttribute("aria-modal", "true"); host.setAttribute("aria-labelledby", "pd16-clash-h");
    clashes.forEach(function(c){ pick[c.id] = c.pick || c.def; });
    var when = function(ms, by){ return (ms ? pdWhenTxt(new Date(ms).toISOString()) : "earlier") + (by ? " · " + by : ""); };
    var draw = function(){
      host.innerHTML = '<div class="pd16-clash__card"><h2 id="pd16-clash-h">Two computers changed the same thing</h2>'
        + '<p class="pd16-clash__sub">Everything else from both computers is kept. For ' + (clashes.length === 1 ? "this one" : "these " + clashes.length) + ', pick which to keep — the newer one is picked for you. Undo puts it all back.</p>'
        + '<div class="pd16-clash__rows">' + clashes.map(function(c){
          var w = pdClashWhere(c);
          return '<div class="pd16-clash__row" data-cid="' + esc(c.id) + '"><div class="pd16-clash__what"><b>' + esc(c.label || c.kind) + '</b>' + (w ? ' · ' + esc(w) : '') + '</div>'
            + '<div class="pd16-clash__opts">'
            + '<button type="button" class="pd16-clash__opt' + (pick[c.id] === "mine" ? ' is-on' : '') + '" data-pick="mine" aria-pressed="' + (pick[c.id] === "mine") + '"><span class="pd16-clash__k">Keep this' + (c.def === "mine" ? ' · newer' : '') + '</span><span class="pd16-clash__v">' + esc(pdClashText(c.mine)) + '</span><span class="pd16-clash__w">This computer · ' + esc(when(c.mAt, c.mBy)) + '</span></button>'
            + '<button type="button" class="pd16-clash__opt' + (pick[c.id] === "theirs" ? ' is-on' : '') + '" data-pick="theirs" aria-pressed="' + (pick[c.id] === "theirs") + '"><span class="pd16-clash__k">Keep that' + (c.def === "theirs" ? ' · newer' : '') + '</span><span class="pd16-clash__v">' + esc(pdClashText(c.theirs)) + '</span><span class="pd16-clash__w">Other computer · ' + esc(when(c.tAt, c.tBy)) + '</span></button>'
            + '</div></div>'; }).join("") + '</div>'
        + '<div class="pd16-clash__foot"><span class="pd16-clash__note">Saving waits until you choose.</span><button type="button" class="pd16-clash__go" data-pd="use">Use these</button></div></div>';
    };
    draw();
    host.addEventListener("click", function(e){
      var b = e.target.closest && e.target.closest("[data-pick],[data-pd]"); if(!b) return;
      if(b.dataset.pd === "use"){ host.remove(); document.removeEventListener("keydown", key, true); res(pick); return; }
      var row = b.closest("[data-cid]"); if(!row) return; pick[row.dataset.cid] = b.dataset.pick; draw();
      var again = host.querySelector('[data-cid="' + (window.CSS && CSS.escape ? CSS.escape(row.dataset.cid) : row.dataset.cid) + '"] [data-pick="' + b.dataset.pick + '"]'); if(again) again.focus();
    });
    var key = function(e){ if(e.key === "Escape"){ e.stopPropagation(); e.preventDefault(); } };
    document.addEventListener("keydown", key, true);
    document.body.appendChild(host);
    setTimeout(function(){ var f = host.querySelector(".pd16-clash__opt.is-on"); if(f) f.focus(); }, 30);
  });
}
/* the merged state replaces this computer's — Undo brings this computer's back */
function pdApplyMerge(r, why){
  pushUndo(why === "15" ? "merge a Parsec 15 computer's changes" : "merge another computer's changes");
  STATE = normalizeState(r.state);
  pdMarkReset();
  var s = r.stats, parts = [], k = s.kinds, nm = { ros: "RO", punches: "punch", shifts: "day-clock entry", staff: "person", inventory: "part", audit: "activity line" };
  Object.keys(k).forEach(function(x){ parts.push(k[x] + " " + (nm[x] || x) + (k[x] === 1 ? "" : (nm[x] ? (/[sh]$/.test(nm[x]) ? "es" : "s") : ""))); });
  var line = (why === "15" ? "Merged changes saved by a computer still on Parsec 15" : "Merged another computer’s changes") + (why === "open" ? " on opening" : "") + (parts.length ? " — " + parts.join(", ") : "") + (s.keys ? (parts.length ? ", " : " — ") + s.keys + " setting" + (s.keys === 1 ? "" : "s") : "")
    + (s.gone ? " · " + s.gone + " deleted there" : "") + (r.clashes.length ? " · " + r.clashes.length + " picked by hand" : "");
  try{ audit("merge", line); }catch(e){}
  PD16.last = { at: nowIso(), line: line, stats: s, clashes: r.clashes.length }; PD16.merges++;
  undoBaseline();
  try{ render(); }catch(e){}
  pushToast(line + ".", true);
}
/* another computer saved: read the folder, merge, and (when nobody needs to be asked) carry on */
function pd16Pull(why){
  if(PD16.busy) return Promise.resolve("busy");
  PD16.busy = true;
  try{ pdMark(); }catch(e){}
  return pd16ReadSettled().then(function(F){
    var base = PD16.base, res = pdMerge(base, STATE, F.state, null), nb = pdSnapOf(F.state);
    pd16Commit(F);
    if(!res.clashes.length && pd16Nothing(res)){ PD16.busy = false; return "same"; }   /* nothing new over there — this computer's copy goes up */
    if(!res.clashes.length){ pdApplyMerge(res, why); PD16.base = nb; PD16.busy = false; return "merged"; }
    PD16.clash = res; PD16.busy = false;
    pdClashAsk(res.clashes).then(function(choices){
      try{ pdMark(); }catch(e){}
      var r2 = pdMerge(base, STATE, F.state, choices);
      PD16.clash = null;
      pdApplyMerge(r2, why); PD16.base = nb;
      scheduleSave(true);
    });
    return "asked";
  }, function(e){ PD16.busy = false; throw e; });
}
/* the merge took nothing from the other computer */
function pd16Nothing(r){ var s = r.stats; return !s.theirs && !s.both && !s.gone && !s.keys && !s.tombsNew; }
function pdSnapOf(S){ var keep = PD16.M; try{ var c = JSON.parse(JSON.stringify(S)); pd16Ids(c); var M = pd16Scan(c); return { recs: M.top, keys: M.key, savedAt: S.savedAt || 0, shop: S.pdShop && S.pdShop.id || null }; }catch(e){ return null; } finally { PD16.M = keep; } }

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
