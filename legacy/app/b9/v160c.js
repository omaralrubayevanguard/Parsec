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

/* ---------- Export for the server ---------- */
var PDX = { busy: false, msg: "", last: null, rt: null, dirs: null };
/* money: every field Parsec 16 (B) turns into a number of dollars (v160b.js v160CleanAll) goes out as integer cents — field_cents.
   A value that isn't a whole number of cents also keeps field_exact, so nothing is rounded away. Text that isn't a number stays as it is. */
var PDX_MONEY_PART = ["price", "list", "core", "ext", "cost"];
var PDX_MONEY_AT = {
  ros: ["shopSupplies"],
  operations: ["otherCost", "claim.amount", "claim.paid", "claim.short.amount", "claim.short.amt"],
  parts: PDX_MONEY_PART,
  inventory: PDX_MONEY_PART.concat(PDX_MONEY_PART.map(function(k){ return "children[]." + k; }))
};
var PDX_LINKS = ["_seq", "_ro_id", "_op_id", "_has", "_kind", "_value", "_src", "_key"];
/* STATE key → table (arrays: one row per item) */
var PDX_ARR = { punches: "punches", shifts: "shifts", staff: "people", inventory: "inventory", audit: "activity", tlReq: "time_fixes", tcDone: "completed", tombs: "tombstones", tombstones: "tombstones", deleted: "tombstones" };
/* STATE key → table (objects: one row per entry) */
var PDX_OBJ = { tlAirWhy: "air_reasons", ib: "inbox" };
var PDX_TABLES = ["ros", "operations", "parts", "notes", "punches", "shifts", "people", "inventory", "activity", "inbox", "time_fixes", "air_reasons", "completed", "tombstones", "attachments", "settings"];
function pdxPlain(x){ return x && typeof x === "object" && !Array.isArray(x); }
function pdxNum(v){ if(typeof v === "number") return isFinite(v) ? v : null; if(typeof v !== "string" || !v.trim()) return null; var s = v.replace(/[$,\s]/g, ""); return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : null; }
/* a money path ("claim.short.amount", "children[].price") → f(object, field) on each place it's found */
function pdxMoneyWalk(o, path, f){
  if(!pdxPlain(o)) return;
  var i = path.indexOf("."), head = i < 0 ? path : path.slice(0, i), rest = i < 0 ? "" : path.slice(i + 1);
  if(!rest) return f(o, head);
  if(/\[\]$/.test(head)){ var a = o[head.slice(0, -2)]; if(Array.isArray(a)) a.forEach(function(x){ pdxMoneyWalk(x, rest, f); }); return; }
  pdxMoneyWalk(o[head], rest, f);
}
function pdxToCents(o, k){ if(!(k in o)) return; var n = pdxNum(o[k]); if(n == null) return; var c = Math.round(n * 100); o[k + "_cents"] = c; if(c / 100 !== n) o[k + "_exact"] = n; delete o[k]; }
function pdxFromCents(o, k){ var c = k + "_cents", x = k + "_exact"; if(!(c in o)) return; o[k] = x in o ? o[x] : o[c] / 100; delete o[c]; delete o[x]; }
function pdxToNum(o, k){ if(!(k in o)) return; var n = pdxNum(o[k]); if(n != null) o[k] = n; }
/* money → integer cents in a row of table t (and back) */
function pdxCents(row, t){ (PDX_MONEY_AT[t] || []).forEach(function(p){ pdxMoneyWalk(row, p, pdxToCents); }); return row; }
function pdxDollars(row, t){ (PDX_MONEY_AT[t] || []).forEach(function(p){ pdxMoneyWalk(row, p, pdxFromCents); }); return row; }
/* a whole RO (the shop's own RO kept in settings): the RO, its operations and their parts */
function pdxRoMoney(ro, f){ if(!pdxPlain(ro)) return ro; var m = f === pdxToCents ? pdxCents : f === pdxFromCents ? pdxDollars : function(r, t){ (PDX_MONEY_AT[t] || []).forEach(function(p){ pdxMoneyWalk(r, p, f); }); return r; };
  m(ro, "ros"); (Array.isArray(ro.operations) ? ro.operations : []).forEach(function(op){ m(op, "operations"); (op && Array.isArray(op.parts) ? op.parts : []).forEach(function(pt){ m(pt, "parts"); }); }); return ro; }
var PDX_RO_KEYS = { shopRo: 1 };   /* settings keys that hold a whole RO */
function pdxRow(x, extra){ var r = pdxPlain(x) ? Object.assign({}, x) : { _value: x }; return Object.assign(r, extra); }
/* the whole state as tables — pure; also says where every STATE key went */
function pdBuildTables(S){
  S = JSON.parse(JSON.stringify(S || STATE)); var T = {}, where = {}, topics = null;
  if(typeof pdTopicMap === "function") try{ topics = pdTopicMap(S); }catch(e){ topics = null; }
  PDX_TABLES.forEach(function(t){ T[t] = []; });
  Object.keys(S).forEach(function(key){
    var v = S[key];
    if(key === "ros" && Array.isArray(v)){ where[key] = "ros";
      v.forEach(function(ro, i){
        if(!pdxPlain(ro)){ T.ros.push(pdxRow(ro, { _seq: i })); return; }
        var r = Object.assign({}, ro), ops = r.operations; delete r.operations; r._seq = i; if(ops !== undefined) r._has = ["operations"]; T.ros.push(pdxCents(r, "ros"));
        (Array.isArray(ops) ? ops : []).forEach(function(op, j){
          if(!pdxPlain(op)){ T.operations.push(pdxRow(op, { _seq: j, _ro_id: ro.id })); return; }
          var o = Object.assign({}, op), has = []; ["parts", "log", "offNotes"].forEach(function(k){ if(k in o) has.push(k); });
          var parts = o.parts, log = o.log, off = o.offNotes; delete o.parts; delete o.log; delete o.offNotes;
          o._seq = j; o._ro_id = ro.id; if(has.length) o._has = has; T.operations.push(pdxCents(o, "operations"));
          (Array.isArray(parts) ? parts : []).forEach(function(p, k){ T.parts.push(pdxCents(pdxRow(p, { _seq: k, _ro_id: ro.id, _op_id: op.id }), "parts")); });
          (Array.isArray(log) ? log : []).forEach(function(n, k){ T.notes.push(pdxRow(n, { _kind: "log", _seq: k, _ro_id: ro.id, _op_id: op.id })); });
          (Array.isArray(off) ? off : []).forEach(function(n, k){ T.notes.push(pdxRow(n, { _kind: "off", _seq: k, _ro_id: ro.id, _op_id: op.id })); });
        });
      });
      return; }
    if(PDX_ARR[key] && Array.isArray(v)){ var t = PDX_ARR[key]; where[key] = t;
      v.forEach(function(x, i){ var r = pdxRow(x, { _seq: i }); if(t === "tombstones") r._src = key; if(t === "inventory") pdxCents(r, "inventory"); T[t].push(r); });
      return; }
    if(PDX_OBJ[key] && pdxPlain(v)){ var t2 = PDX_OBJ[key]; where[key] = t2;
      Object.keys(v).forEach(function(k){
        if(key === "ib" && k === "items" && Array.isArray(v.items)) v.items.forEach(function(it, i){ T.inbox.push(pdxRow(it, { _key: "items", _seq: i })); });
        else T[t2].push({ _key: k, value: v[k] });
      });
      if(key === "ib" && Array.isArray(v.items) && !v.items.length) T.inbox.push({ _key: "items", value: [] });
      return; }
    where[key] = "settings";
    var row = { key: key, value: PDX_RO_KEYS[key] ? pdxRoMoney(v, pdxToCents) : v };
    if(topics && topics[key]) row.topic = topics[key];   /* where Parsec keeps it in the folder (Fork A's topic map) */
    T.settings.push(row);
  });
  return { tables: T, where: where };
}
/* …and back: the reference importer's core — tables (rows already parsed) → state */
function pdxRebuild(T, where){
  T = JSON.parse(JSON.stringify(T || {}));   /* the rows aren't changed */
  var S = {}, bySeq = function(a, b){ return (a._seq || 0) - (b._seq || 0); };
  var clean = function(r){ if("_value" in r && Object.keys(r).every(function(k){ return PDX_LINKS.indexOf(k) > -1; })) return r._value; var o = Object.assign({}, r); PDX_LINKS.forEach(function(k){ delete o[k]; }); return o; };
  (T.settings || []).forEach(function(r){ S[r.key] = PDX_RO_KEYS[r.key] ? pdxRoMoney(r.value, pdxFromCents) : r.value; });
  if(where.ros === "ros"){
    var ops = {}, parts = {}, notes = {};
    (T.operations || []).forEach(function(o){ (ops[o._ro_id] = ops[o._ro_id] || []).push(o); });
    (T.parts || []).forEach(function(p){ var k = p._ro_id + "|" + p._op_id; (parts[k] = parts[k] || []).push(p); });
    (T.notes || []).forEach(function(n){ var k = n._ro_id + "|" + n._op_id + "|" + n._kind; (notes[k] = notes[k] || []).push(n); });
    S.ros = (T.ros || []).slice().sort(bySeq).map(function(r){
      var has = r._has || [], ro = clean(r);
      if(!pdxPlain(ro)) return ro;
      pdxDollars(ro, "ros");
      if(has.indexOf("operations") > -1) ro.operations = (ops[ro.id] || []).slice().sort(bySeq).map(function(o){
        var oh = o._has || [], op = clean(o); if(!pdxPlain(op)) return op;
        pdxDollars(op, "operations");
        if(oh.indexOf("parts") > -1) op.parts = (parts[ro.id + "|" + op.id] || []).slice().sort(bySeq).map(function(p){ return clean(pdxDollars(Object.assign({}, p), "parts")); });
        if(oh.indexOf("log") > -1) op.log = (notes[ro.id + "|" + op.id + "|log"] || []).slice().sort(bySeq).map(clean);
        if(oh.indexOf("offNotes") > -1) op.offNotes = (notes[ro.id + "|" + op.id + "|off"] || []).slice().sort(bySeq).map(clean);
        return op;
      });
      return ro;
    });
  }
  Object.keys(where).forEach(function(key){
    var t = where[key];
    if(PDX_ARR[key] && t === PDX_ARR[key]){
      S[key] = (T[t] || []).filter(function(r){ return t !== "tombstones" || r._src === key; }).slice().sort(bySeq).map(function(r){ return clean(t === "inventory" ? pdxDollars(Object.assign({}, r), "inventory") : r); });
    } else if(PDX_OBJ[key] && t === PDX_OBJ[key]){
      var o = {}, items = []; (T[t] || []).forEach(function(r){ if(key === "ib" && r._key === "items" && "_seq" in r) items.push(r); else o[r._key] = r.value; });
      if(items.length) o.items = items.sort(bySeq).map(clean);
      S[key] = o;
    }
  });
  return S;
}
/* the shapes of each table, for schema.json */
function pdxType(v){ if(v === null) return "null"; if(Array.isArray(v)) return "array"; if(typeof v === "number") return Number.isInteger(v) ? "integer" : "number";
  if(typeof v === "string"){ if(/^\d{4}-\d{2}-\d{2}T[\d:.]+(Z|[+-]\d{2}:?\d{2})$/.test(v)) return "datetime (ISO 8601)"; if(/^\d{4}-\d{2}-\d{2}$/.test(v)) return "date (YYYY-MM-DD)"; return "text"; }
  return typeof v === "boolean" ? "boolean" : typeof v === "object" ? "object (JSON)" : typeof v; }
var PDX_DESC = { ros: "Repair orders — one row per RO; nested RO-level data (history, bulletins, checklist…) stays as JSON in its column",
  operations: "Operations (jobs) on an RO — _ro_id links to ros.id", parts: "Parts on an operation — _op_id links to operations.id; money in integer cents",
  notes: "Operation notes — _kind 'log' (Cause / Correction / stories) or 'off' (notes added off the clock)", punches: "Clock punches on operations — roId / opId link to ros / operations",
  shifts: "Day clocks (clock in / out)", people: "Staff, roles and per-person settings", inventory: "Parts inventory — money in integer cents", activity: "The Activity log",
  inbox: "Inbox messages (_key 'items') and inbox settings", time_fixes: "Asks for a time fix and their answers", air_reasons: "Reasons noted on air time",
  completed: "Completed work per person (kept after a transfer or delete)", tombstones: "Deleted marks — records deleted since the server last cleared them",
  attachments: "Files in each RO folder — path is inside this export; sha256 checks the copy", settings: "Every other kind of data, one row per key, value as JSON" };
function pdxSchema(T){
  var out = { schema: 16, tables: {} };
  Object.keys(T).forEach(function(t){
    var cols = {}; T[t].forEach(function(r){ Object.keys(r).forEach(function(k){ var ty = pdxType(r[k]); cols[k] = cols[k] || {}; cols[k][ty] = 1; }); });
    var C = {}; Object.keys(cols).sort().forEach(function(k){ C[k] = Object.keys(cols[k]).join(" | ") + (/_cents$/.test(k) ? " — money, integer cents" : ""); });
    var links = {}; if(C._ro_id) links._ro_id = "ros.id"; if(C._op_id) links._op_id = "operations.id"; if(C.roId) links.roId = "ros.id"; if(C.opId) links.opId = "operations.id";
    var money = (PDX_MONEY_AT[t] || []).map(function(p){ return p + "_cents"; });
    money.forEach(function(p){ if(C[p] === undefined && p.indexOf(".") < 0) C[p] = "integer — money, integer cents"; });
    out.tables[t] = { file: "tables/" + t + ".jsonl", about: PDX_DESC[t] || "", rows: T[t].length, columns: C, links: links };
    if(money.length) out.tables[t].money = money;
    if(t === "settings") out.tables[t].money = { shopRo: "value is a whole RO — " + PDX_MONEY_AT.ros.concat(PDX_MONEY_AT.operations.map(function(p){ return "operations[]." + p; }), PDX_MONEY_AT.parts.map(function(p){ return "operations[].parts[]." + p; })).map(function(p){ return p + "_cents"; }).join(", ") };
  });
  out.money = "Every field listed under money is integer cents (18950 = $189.50); a path with dots is inside a JSON column (claim.amount_cents is in the claim column), children[] is each item of that list. "
    + "A value that wasn't a whole number of cents also has <field>_exact (dollars). Empty stays empty; text that isn't a number keeps its field name.";
  out.export_fields = { _seq: "position in its list (keeps the order)", _ro_id: "the RO it belongs to", _op_id: "the operation it belongs to", _has: "which nested lists the record had (even when empty)",
    _kind: "notes: 'log' or 'off'", _key: "objects stored as rows: the key", _src: "the Parsec data name a row came from", _value: "a list item that isn't a record" };
  return out;
}
var PDX_README = [
  "Parsec — export for the server",
  "",
  "This folder holds everything Parsec knew when it was exported:",
  "  tables/      one file per kind of data. Each line is one record (JSON Lines).",
  "  attachments/ the files from each RO folder, by RO id.",
  "  schema.json  every table, its columns and how the tables link (ros.id ← operations._ro_id ← parts._op_id).",
  "  manifest.json the list: how many rows each table has and a sha-256 for every file. Check it before importing —",
  "               if a count or a checksum doesn't match, the export is incomplete or was changed.",
  "",
  "Money is in whole cents (price_cents: 18950 = $189.50) — schema.json lists every money field per table. Dates are ISO 8601. Every record keeps its id,",
  "and updatedAt / deletedAt where Parsec has them. Deleted records are listed in tables/tombstones.jsonl.",
  "",
  "Parsec's own round-trip check rebuilds its data from these tables alone and compares it with what it holds —",
  "the same code (pdImportExport) is a working example of reading this export back.",
  "",
  "It's a folder — zip it with Send to → Compressed folder if you need one file."
].join("\r\n");
/* an RO's files: Fork A's helper when it's there, else the folder Parsec saves the RO in */
function pdxAttFiles(ro){
  var walk = function(dir, pre){ return pdEntries(dir).then(function(es){
    return Promise.all(es.map(function(e){ return e.kind === "file" ? [{ name: (pre ? pre + "/" : "") + e.name, get: function(){ return e.getFile(); } }] : walk(e, (pre ? pre + "/" : "") + e.name); }))
      .then(function(L){ return [].concat.apply([], L); }); }); };
  if(typeof pdAttList === "function") return Promise.resolve().then(function(){ return pdAttList(ro); }).then(function(L){
    return (L || []).map(function(x){ return { name: x.path || x.name, get: function(){ return x.getFile ? x.getFile() : x.handle && x.handle.getFile ? x.handle.getFile() : Promise.resolve(x.file || x.blob || x); } }; }); }).catch(function(){ return []; });
  return roDataRoot(false).then(function(root){ return pdDirAt(root, String(roFolderNow(ro)).split("/").filter(Boolean), false); })
    .then(function(d){ return d.getDirectoryHandle(PD_ATT); }).then(function(att){ return walk(att, ""); }).catch(function(){ return []; });
}
function pdxSafe(n){ return String(n || "file").replace(/[\\:*?"<>|\u0000-\u001f]+/g, "-").slice(0, 120); }
function pdxLines(rows){ return rows.map(function(r){ return JSON.stringify(r); }); }
function pdxMayExport(){ if(typeof can === "function" && typeof viewAsStaff === "function" && viewAsStaff() && !can("a.data")){ try{ permOk("a.data"); }catch(e){} return false; } return true; }
function pdxSay(m){ PDX.msg = m; if(UI.view === "profile") try{ render(); }catch(e){} }
function pdExportForServer(){
  if(PDX.busy) return Promise.resolve(null);
  if(!pdxMayExport()) return Promise.resolve(null);
  if(FS.status !== "connected" || !FS.dir){ pushToast("Connect the folder first — the export is written into Parsec Data/Exports."); return Promise.resolve(null); }
  PDX.busy = true; PDX.rt = null; pdxSay("Exporting — the tables…");
  var at = new Date(), stamp = pdStamp(at), built = pdBuildTables(STATE), canonHow = pdxCanonHow(), canon = pdxCanonText(STATE, canonHow), stateSha = "", T = built.tables, files = [], tables = {}, root, exDir, name = stamp;
  var put = function(dir, path, data){ var leaf = path.split("/").pop(); return pdPut(dir, leaf, data).then(function(){ return (typeof data === "string" ? Promise.resolve(new Blob([data])) : Promise.resolve(data)); })
    .then(function(b){ return pdSha256(b).then(function(h){ files.push({ path: path, bytes: b.size, sha256: h }); return h; }); }); };
  return pdSub("Exports", true).then(function(ex){ root = ex;
      var tryName = function(n, i){ return ex.getDirectoryHandle(n).then(function(){ return tryName(stamp + " (" + (i + 1) + ")", i + 1); }, function(){ name = n; return ex.getDirectoryHandle(n, { create: true }); }); };
      return tryName(stamp, 1); })
    .then(function(d){ exDir = d; return d.getDirectoryHandle("tables", { create: true }); })
    .then(function(td){
      return PDX_TABLES.filter(function(t){ return t !== "attachments"; }).reduce(function(p, t){ return p.then(function(){
        var L = pdxLines(T[t]), text = L.length ? L.join("\n") + "\n" : "";
        return Promise.all(L.map(function(l){ return pdSha256(l).then(function(h){ return h.slice(0, 16); }); }))
          .then(function(hs){ tables[t] = { file: "tables/" + t + ".jsonl", rows: L.length, lines: hs }; return put(td, "tables/" + t + ".jsonl", text); });
      }); }, Promise.resolve()).then(function(){ return td; });
    })
    .then(function(td){
      var rows = [], i = 0, ros = (STATE.ros || []).filter(pdxPlain);
      return exDir.getDirectoryHandle("attachments", { create: true }).then(function(ad){
        return ros.reduce(function(p, ro){ return p.then(function(){
          return pdxAttFiles(ro).then(function(L){
            if(!L.length) return;
            var rid = pdxSafe(ro.id || ro.roNumber);
            return ad.getDirectoryHandle(rid, { create: true }).then(function(rd){
              return L.reduce(function(p2, f){ return p2.then(function(){
                i++; if(i % 10 === 0) pdxSay("Exporting — " + i + " files…");
                var parts = String(f.name).split("/").map(pdxSafe), leaf = parts.pop();
                return f.get().then(function(blob){ return pdDirAt(rd, parts, true).then(function(dd){ return put(dd, "attachments/" + rid + "/" + parts.concat([leaf]).join("/"), blob); })
                  .then(function(h){ var fid = null; (ro.bulletins || []).forEach(function(b){ (b.files || []).forEach(function(x){ if(x && (x.name === f.name || x.file === f.name) && x.id) fid = x.id; }); });
                    rows.push({ id: fid || ("att:" + (ro.id || "") + ":" + f.name), _ro_id: ro.id, name: f.name, bytes: blob.size, sha256: h, path: "attachments/" + rid + "/" + parts.concat([leaf]).join("/") }); }); }, function(){});
              }); }, Promise.resolve());
            });
          });
        }); }, Promise.resolve());
      }).then(function(){
        T.attachments = rows; var L = pdxLines(rows), text = L.length ? L.join("\n") + "\n" : "";
        return Promise.all(L.map(function(l){ return pdSha256(l).then(function(h){ return h.slice(0, 16); }); }))
          .then(function(hs){ tables.attachments = { file: "tables/attachments.jsonl", rows: L.length, lines: hs }; return put(td, "tables/attachments.jsonl", text); });
      });
    })
    .then(function(){ return put(exDir, "schema.json", JSON.stringify(pdxSchema(T), null, 2)); })
    .then(function(){ return put(exDir, "README.txt", PDX_README); })
    .then(function(){ return pdSha256(canon).then(function(h){ stateSha = h; canon = null; }); })
    .then(function(){
      var counts = {}; Object.keys(tables).forEach(function(t){ counts[t] = tables[t].rows; });
      var me = null; try{ me = viewAsStaff(); }catch(e){}
      var man = { schema: 16, app: typeof BUILD !== "undefined" ? BUILD : "Parsec", exportedAt: at.toISOString(), by: me ? me.name : "Admin", counts: counts, tables: tables, stateKeys: built.where,
        state: { sha256: stateSha, canon: canonHow, how: "sha-256 of Parsec's data at the moment of the export in canonical form (" + (canonHow === "pdCanon" ? "pdCanon: keys sorted, records in id order" : "keys sorted") + ", money as numbers, savedAt left out) — the tables must rebuild to exactly this" },
        folder: typeof pdTopicMap === "function" ? (function(){ try{ return pdTopicMap(STATE); }catch(e){ return undefined; } })() : undefined,
        files: files.slice().sort(function(a, b){ return a.path < b.path ? -1 : 1; }), totals: { files: files.length, bytes: files.reduce(function(s, f){ return s + f.bytes; }, 0), rows: Object.keys(counts).reduce(function(s, t){ return s + counts[t]; }, 0) } };
      return pdPut(exDir, "manifest.json", JSON.stringify(man, null, 2)).then(function(){ return man; });
    })
    .then(function(man){
      PDX.busy = false; PDX.dirs = null;
      PDX.last = { name: name, at: man.exportedAt, rows: man.totals.rows, files: man.totals.files, bytes: man.totals.bytes, att: man.counts.attachments };
      pdxSay(""); try{ audit("export", "Exported for the server — " + man.totals.rows + " rows, " + man.counts.attachments + " files (Exports/" + name + ")"); }catch(e){}
      pushToast("Exported — Parsec Data / Exports / " + name + " · " + man.totals.rows + " rows, " + man.counts.attachments + " files");
      return { name: name, manifest: man };
    }, function(e){ PDX.busy = false; pdxSay(""); pushToast("The export stopped — " + (e && e.message || e) + ". Nothing was changed."); console.error(e); return null; });
}

/* ---------- reading an export back: verify, import, compare ---------- */
function pdxExportDirs(){
  if(FS.status !== "connected" || !FS.dir) return Promise.resolve([]);
  return pdSub("Exports", false).then(function(ex){ return pdEntries(ex).then(function(es){ return es.filter(function(e){ return e.kind === "directory"; }).map(function(e){ return e.name; }).sort().reverse(); }); }, function(){ return []; });
}
function pdxReadText(dir, path){ var parts = path.split("/"), leaf = parts.pop();
  return pdDirAt(dir, parts, false).then(function(d){ return d.getFileHandle(leaf); }).then(function(fh){ return fh.getFile(); }); }
/* every file and count against the manifest — returns { ok, problems: [text], manifest } */
function pdxVerify(dir){
  var problems = [], man;
  return pdxReadText(dir, "manifest.json").then(function(f){ return f.text(); }).then(function(t){ man = JSON.parse(t); }, function(){ throw new Error("manifest.json is missing — this isn't a complete export"); })
    .then(function(){
      return (man.files || []).reduce(function(p, fe){ return p.then(function(){
        return pdxReadText(dir, fe.path).then(function(f){
          return pdSha256(f).then(function(h){
            if(f.size === fe.bytes && h === fe.sha256) return;
            if(/^tables\/.+\.jsonl$/.test(fe.path)){ var t = fe.path.replace(/^tables\/|\.jsonl$/g, ""), meta = man.tables && man.tables[t];
              return f.text().then(function(txt){
                var L = txt ? txt.replace(/\n$/, "").split("\n") : [];
                return Promise.all(L.map(function(l){ return pdSha256(l).then(function(x){ return x.slice(0, 16); }); })).then(function(hs){
                  var bad = []; var n = Math.max(hs.length, meta ? meta.lines.length : 0);
                  for(var i = 0; i < n; i++){ if(!meta || hs[i] !== meta.lines[i]){ var id = ""; try{ var o = JSON.parse(L[i]); id = o.id || o.key || o._key || ""; }catch(e){} bad.push("line " + (i + 1) + (id ? " (" + id + ")" : "") + (i >= hs.length ? " is missing" : meta && i >= meta.lines.length ? " is extra" : " is different")); } }
                  problems.push(fe.path + ": " + (bad.length ? bad.slice(0, 6).join(", ") + (bad.length > 6 ? " and " + (bad.length - 6) + " more" : "") : "the checksum doesn't match"));
                  if(meta && L.length !== meta.rows) problems.push(t + ": " + L.length + " rows, the list says " + meta.rows);
                });
              });
            }
            problems.push(fe.path + ": " + (f.size !== fe.bytes ? f.size + " bytes, the list says " + fe.bytes : "the checksum doesn't match"));
          });
        }, function(){ problems.push(fe.path + ": missing"); });
      }); }, Promise.resolve());
    })
    .then(function(){
      return Object.keys(man.tables || {}).reduce(function(p, t){ return p.then(function(){
        return pdxReadText(dir, "tables/" + t + ".jsonl").then(function(f){ return f.text(); }).then(function(txt){
          var n = txt ? txt.replace(/\n$/, "").split("\n").length : 0;
          if(n !== man.counts[t] && !problems.some(function(x){ return x.indexOf(t + ": ") === 0; })) problems.push(t + ": " + n + " rows, the list says " + man.counts[t]);
        }, function(){});
      }); }, Promise.resolve());
    })
    .then(function(){ return { ok: !problems.length, problems: problems, manifest: man }; });
}
/* the reference importer: an export folder → Parsec's state, from the tables alone */
function pdImportExport(dir){
  var man;
  return pdxReadText(dir, "manifest.json").then(function(f){ return f.text(); }).then(function(t){ man = JSON.parse(t); })
    .then(function(){ var T = {};
      return Object.keys(man.tables).reduce(function(p, t){ return p.then(function(){
        return pdxReadText(dir, "tables/" + t + ".jsonl").then(function(f){ return f.text(); }).then(function(txt){ T[t] = txt ? txt.replace(/\n$/, "").split("\n").map(function(l){ return JSON.parse(l); }) : []; });
      }); }, Promise.resolve()).then(function(){ return pdxRebuild(T, man.stateKeys || {}); });
    });
}
/* canonical form for comparing: money as numbers ("189.50" = 189.5), the save stamp left out, then Fork A's pdCanon (keys sorted,
   records in id order) — or, without it, keys sorted. how: "pdCanon" / "pdx" — an export says which it used */
function pdxCanonHow(){ return typeof pdCanon === "function" ? "pdCanon" : "pdx"; }
function pdxCanonText(S, how){
  var c = JSON.parse(JSON.stringify(S || {})); delete c.savedAt;
  (Array.isArray(c.ros) ? c.ros : []).forEach(function(ro){ pdxRoMoney(ro, pdxToNum); });
  Object.keys(PDX_RO_KEYS).forEach(function(k){ if(pdxPlain(c[k])) pdxRoMoney(c[k], pdxToNum); });
  (Array.isArray(c.inventory) ? c.inventory : []).forEach(function(it){ PDX_MONEY_AT.inventory.forEach(function(p){ pdxMoneyWalk(it, p, pdxToNum); }); });
  if((how || pdxCanonHow()) === "pdCanon" && typeof pdCanon === "function") return pdCanon(c);
  var sort = function(x){ if(Array.isArray(x)) return x.map(sort); if(pdxPlain(x)){ var o = {}; Object.keys(x).sort().forEach(function(k){ o[k] = sort(x[k]); }); return o; } return x; };
  return JSON.stringify(sort(c));
}
function pdxCanon(S, how){ return JSON.parse(pdxCanonText(S, how)); }
function pdxDiff(a, b, path, out, max){
  if(out.length >= max) return out;
  if(Array.isArray(a) && Array.isArray(b)){ if(a.length !== b.length) out.push({ path: path + ".length", now: a.length, export: b.length }); for(var i = 0; i < Math.min(a.length, b.length); i++) pdxDiff(a[i], b[i], path + "[" + i + "]", out, max); return out; }
  if(pdxPlain(a) && pdxPlain(b)){ var ks = {}; Object.keys(a).forEach(function(k){ ks[k] = 1; }); Object.keys(b).forEach(function(k){ ks[k] = 1; });
    Object.keys(ks).sort().forEach(function(k){ if(!(k in a)) out.push({ path: path + "." + k, now: undefined, export: b[k] }); else if(!(k in b)) out.push({ path: path + "." + k, now: a[k], export: undefined }); else pdxDiff(a[k], b[k], path + "." + k, out, max); });
    return out; }
  if(JSON.stringify(a) !== JSON.stringify(b)) out.push({ path: path, now: a, export: b });
  return out;
}
/* the round-trip check: verify, refuse on a mismatch, rebuild, compare */
function pdRoundTrip(name){
  if(PDX.busy) return Promise.resolve(null);
  if(!pdxMayExport()) return Promise.resolve(null);
  if(FS.status !== "connected" || !FS.dir){ pushToast("Connect the folder first."); return Promise.resolve(null); }
  PDX.busy = true; PDX.rt = null; pdxSay("Checking the export…");
  var exName;
  return pdxExportDirs().then(function(L){ exName = name || L[0]; if(!exName) throw new Error("No export yet — use Export for the server first");
      return pdSub("Exports", false).then(function(ex){ return ex.getDirectoryHandle(exName); }); })
    .then(function(dir){
      return pdxVerify(dir).then(function(v){
        if(!v.ok) return { ok: false, refused: true, name: exName, problems: v.problems };
        return pdImportExport(dir).then(function(S2){
          var how = v.manifest.state && v.manifest.state.canon || "pdx", want = v.manifest.state && v.manifest.state.sha256, t2 = pdxCanonText(S2, how), c2 = JSON.parse(t2);
          return pdSha256(t2).then(function(h){
            var noEx = function(c){ c = JSON.parse(JSON.stringify(c)); if(Array.isArray(c.audit)) c.audit = c.audit.filter(function(x){ return !(x && x.type === "export"); }); return c; };
            var cNow = pdxCanon(STATE, how), diffs = pdxDiff(cNow, c2, "state", [], 60), since = want && h === want ? pdxDiff(noEx(cNow), noEx(c2), "state", [], 60) : [], base = { refused: false, name: exName, rows: v.manifest.totals.rows, files: v.manifest.totals.files };
            /* the tables rebuilt exactly what was exported; anything that differs from Parsec now is later work */
            if(want && h === want) return Object.assign(base, { ok: true, diffs: [], since: since });
            if(!want) return Object.assign(base, { ok: !diffs.length, diffs: diffs, since: [] });
            return Object.assign(base, { ok: false, diffs: diffs.length ? diffs : [{ path: "state", now: "sha-256 " + want.slice(0, 12) + "…", export: "sha-256 " + h.slice(0, 12) + "…" }], since: [] });
          });
        });
      });
    })
    .then(function(r){ PDX.busy = false; PDX.rt = r; pdxSay("");
      pushToast(r.refused ? "Refused — " + r.problems.length + " problem" + (r.problems.length > 1 ? "s" : "") + " in Exports/" + r.name : r.ok ? "Identical — 0 differences (Exports/" + r.name + ")" : r.diffs.length + " differences — see Your data");
      return r; },
      function(e){ PDX.busy = false; PDX.rt = { ok: false, refused: true, name: exName || "", problems: [String(e && e.message || e)] }; pdxSay(""); pushToast(String(e && e.message || e)); return PDX.rt; });
}
function pdxTombs(){
  if(typeof pdTombsClear !== "function" || !pdxMayExport()) return;
  if(!confirm("Clear the deleted marks?\n\nDo this only after the server has imported the latest export — the marks are how it learns what was deleted.")) return;
  Promise.resolve().then(function(){ return pdTombsClear(); }).then(function(n){ pushToast("Deleted marks cleared" + (typeof n === "number" ? " — " + n : "") + "."); render(); }, function(){ pushToast("Couldn't clear the deleted marks."); });
}
function pdxTombN(){ var n = 0; ["tombs", "tombstones", "deleted"].forEach(function(k){ if(Array.isArray(STATE && STATE[k])) n += STATE[k].length; }); return n; }
/* the card on Your data */
function pdxCard(){
  if(typeof can === "function" && typeof viewAsStaff === "function" && viewAsStaff() && !can("a.data")) return "";
  var h = pxCh("For the server", "every record, the photos, and a list that proves nothing is missing");
  if(FS.status !== "connected" || !FS.dir) return pxCard(h + '<p class="px-p">Connect the folder first — the export is written into Parsec Data/Exports.</p>');
  if(PDX.dirs === null){ PDX.dirs = []; pdxExportDirs().then(function(L){ PDX.dirs = L; if(UI.view === "profile") render(); }); }
  var b = PDX.busy ? " disabled" : "", tn = typeof pdTombsClear === "function" ? pdxTombN() : 0;
  h += '<div class="px-row pdx-row"><button class="px-btn sm pri" data-action="pdx-export"' + b + '>' + pxI("download", 13) + 'Export for the server</button><button class="px-btn sm" data-action="pdx-rt"' + b + '>' + pxI("check", 13) + 'Round-trip check</button>'
    + (typeof pdTombsClear === "function" ? '<button class="px-btn sm ghost" data-action="pdx-tombs"' + (tn ? b : " disabled") + '>Clear deleted marks the server has…' + (tn ? ' <em>' + tn + '</em>' : '') + '</button>' : '') + '</div>';
  if(PDX.msg) h += '<p class="px-p pdx-msg">' + esc(PDX.msg) + '</p>';
  if(PDX.last) h += '<div class="pdx-last">' + pxI("check", 13) + '<span><b>Exported ' + esc(PDX.last.name) + '</b><small>' + PDX.last.rows.toLocaleString() + ' rows · ' + PDX.last.att + ' files · ' + pxSize(PDX.last.bytes) + ' · Parsec Data/Exports/' + esc(PDX.last.name) + '</small></span></div>';
  var r = PDX.rt;
  if(r) h += '<div class="pdx-rt ' + (r.ok ? 'ok' : 'bad') + '">' + (r.ok ? '<b>Identical — 0 differences</b><small>Exports/' + esc(r.name) + ' read back from its tables alone · every count and checksum matched</small>'
        + (r.since && r.since.length ? '<small>Parsec has changed since this export — ' + r.since.length + (r.since.length >= 60 ? '+' : '') + ' later edit' + (r.since.length > 1 ? 's' : '') + ' (' + esc(r.since.slice(0, 2).map(function(d){ return d.path.replace(/^state\./, ""); }).join(", ")) + '). Export again to include them.</small>' : '')
      : r.refused ? '<b>Refused — this export doesn’t match its list</b><small>Exports/' + esc(r.name) + '</small><ul>' + r.problems.slice(0, 12).map(function(p){ return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>'
      : '<b>' + r.diffs.length + (r.diffs.length >= 60 ? '+' : '') + ' differences</b><small>Exports/' + esc(r.name) + ' — the tables didn’t rebuild to what was exported</small><ul>' + r.diffs.slice(0, 12).map(function(d){ return '<li><code>' + esc(d.path) + '</code> now ' + esc(JSON.stringify(d.now) || '—').slice(0, 60) + ' · export ' + esc(JSON.stringify(d.export) || '—').slice(0, 60) + '</li>'; }).join('') + '</ul>') + '</div>';
  var D = PDX.dirs || [];
  if(D.length > 1) h += '<div class="pdx-pick"><small>Check another:</small>' + D.slice(1, 5).map(function(n){ return '<button class="px-btn sm ghost" data-action="pdx-rt" data-name="' + esc(n) + '"' + b + '>' + esc(n) + '</button>'; }).join('') + '</div>';
  h += '<p class="px-p pdx-zip">The export is a folder, written file by file. Zip it with Send to → Compressed folder if you need one file.</p>';
  return pxCard(h);
}
