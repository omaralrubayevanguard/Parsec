/* Parsec · data · export.js
   Export for the server: every table as JSONL (tables/*.jsonl), attachments copied, schema.json, README.txt and a manifest with SHA-256 per file. Money goes out in cents, links as ids.
   Flow: pdExport builds the tables from STATE with pdBuildTables; pdxRow flattens one record. Server seam: this is the import format for a server.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pdxPlain pdxNum pdxMoneyWalk pdxToCents pdxFromCents pdxToNum pdxCents pdxDollars pdxRoMoney pdxRow pdBuildTables pdxRebuild … (20 functions, 10 constants)
   state      ros
   uses       access/ kit/ ro/ shell/ state/
*/
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
