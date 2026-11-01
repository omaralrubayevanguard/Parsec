/* Parsec · data · import-export.js
   Reading an export back: verify every checksum (refuse on a mismatch), import it, and the round-trip check that compares an export with the live state (pdxDiff).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pdxExportDirs pdxReadText pdxVerify pdImportExport pdxCanonHow pdxCanonText pdxCanon pdxDiff pdRoundTrip pdxTombs pdxTombN pdxCard … (21 functions)
   state      lastBackupAt punches ros
   uses       access/ kit/ ro/ settings/ shell/ state/
*/
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

function pxBkOn(k, def){ var v = pxLS(k); return v === null ? def : v === "1"; }
function pxBkInfo(){
  if(FS.status === "connected") return { where: "folder", at: pxLS("tec_bk_at"), day: pxLS("tec_last_backup") };
  return { where: "browser", at: STATE.lastBackupAt || null, day: STATE.lastBackupAt ? todayStr(new Date(STATE.lastBackupAt)) : null };
}
function pxBkDays(){ var b = pxBkInfo(); if(!b.day) return null; return Math.round((new Date(todayStr() + "T12:00:00") - new Date(b.day + "T12:00:00")) / 86400000); }
/* the reason to look at Your data, or "" */
function pxBkWarn(){
  if(FS.status === "needs-permission") return "The folder needs reconnecting";
  if(FS.status === "connected" && typeof syncStatus !== "undefined" && syncStatus === "error") return "Saving to the folder failed";
  if(!STATE || !(STATE.punches || []).length && !(STATE.ros || []).length) return "";
  var d = pxBkDays(), b = pxBkInfo();
  if(d === null) return "No backup yet";
  if(b.where === "folder" ? d > 1 : d >= 7) return "Last backup " + d + " days ago";
  return "";
}
function pxBkShort(){ var w = pxBkWarn(); if(w) return w.replace(/^Last backup /, "backup "); var b = pxBkInfo();
  return b.at ? "backed up " + pxAgo(b.at) : b.day ? "backed up " + (b.day === todayStr() ? "today" : b.day) : ""; }
function pxBkNow(){
  if(FS.status !== "connected"){ exportJSON(); return; }
  pxBkWrite("by hand").then(function(){ pushToast("Backup saved — Parsec Data / Backups / " + (PDBK.last || todayStr())); pxBkLoad(); }, function(){ pushToast("Couldn’t write the backup — check the folder."); });
}
function pxSize(n){ return n >= 1048576 ? (n / 1048576).toFixed(2) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }
/* clocking out for the day: the dated copy, and the next person starts clean */
function pxEndOfDay(reason){
  if(reason !== "End of day" && reason !== "Home") return;
  var msg = UI.toast;
  var then = function(){ if(pxBkOn("tec_logout_eod", true) && staffList().length && viewAsStaff()) setTimeout(function(){ pxLogout(true); }, 1600); };
  if(!pxBkOn("tec_bk_eod", true)){ then(); return; }
  if(FS.status === "connected"){
    pxBkWrite("automatic").then(function(){ if(UI.toast === msg) pxToastSet(msg + " · backup saved", 6000); then(); }, then);
  } else {
    var und = UI.toastUndo; exportJSON(); UI.toastUndo = und;
    pxToastSet((msg ? msg + " · " : "") + "backup file downloaded", 6000); then();
  }
}
function pxToastSet(msg, ms){ UI.toast = msg; render(); setTimeout(function(){ if(UI.toast === msg){ UI.toast = null; UI.toastUndo = false; render(); } }, ms || 4000); }
