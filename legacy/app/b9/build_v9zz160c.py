# Parsec 16 (C) — the data store, shipping side: compression (b9/v160z.js), end-of-day compressed backups kept 30 days,
# Export for the server (tables + attachments + schema + manifest) and the round-trip check (b9/v160c.js + v160c.css).
# Runs inside build12.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
def soft(js, a, b):
    return js.replace(a, b) if js.count(a) == 1 else js
# the old backup writers step aside (renamed — the build's clean-out drops them)
js = rep(js, "function writeDailyBackup(json){", "function writeDailyBackup0(json){")
js = rep(js, "function pxBkWrite(how){", "function pxBkWrite0(how){")
js = rep(js, "function listBackups(){", "function listBackups0(){")
js = rep(js, "function readBackup(name){", "function readBackup0(name){")
js = rep(js, "function pxBkLoad(){", "function pxBkLoad0(){")
js = rep(js, "function pxBkOn(k, def){", b9("v160z.js") + "\n" + b9("v160c.js") + "\nfunction pxBkOn(k, def){")
# no more pretty-printing the whole state on every save just to throw it away
js = soft(js, ".then(function(){ return writeDailyBackup(JSON.stringify(STATE, null, 2)); })", ".then(function(){ return writeDailyBackup(); })")
# Back up now's message names the file
js = rep(js, 'pushToast("Backup saved — Parsec Data / Backups / data-" + todayStr() + ".json");', 'pushToast("Backup saved — Parsec Data / Backups / " + (PDBK.last || todayStr()));')
# Your data: the words, the toggles, the card for the server
js = rep(js, "a dated copy in Parsec Data/Backups — the first save each day, and again when you clock out for the day", "a compressed copy at the end of each working day, in Parsec Data/Backups — kept 30 days")
js = rep(js, '"Back up when I clock out for the day", "Home or End of day — today’s copy is saved again"', '"Back up when the last person clocks out for the day", "and at the shop’s end time — whichever comes first; later work the same day is saved again"')
js = rep(js, '\n      + pxSwRow("px-tog", pxBkOn("tec_bk_keep", false), "Keep only the last 14", "older dated copies are deleted from the Backups folder", \' data-k="tec_bk_keep" data-def="0"\');', ";")
js = rep(js, '  h += pxCard(pxCh("Backups", "a copy you can go back to") + bk, warn ? "warn" : "");', '  h += pxCard(pxCh("Backups", "a copy you can go back to") + bk, warn ? "warn" : "");\n  h += pdxCard();   /* Parsec 16 */')
js = rep(js, '    case "px-bk-now": pxBkNow(); return true;', '    case "pdx-export": pdExportForServer(); return true;\n    case "pdx-rt": pdRoundTrip(t.dataset.name || null); return true;\n    case "pdx-tombs": pdxTombs(); return true;\n    case "px-bk-now": pxBkNow(); return true;')
# restoring from a file takes the compressed backups too
js = rep(js, 'inp.accept = "application/json,.json";\n      inp.onchange = function(){ var f = inp.files && inp.files[0]; if(!f) return; f.text().then(function(txt){',
             'inp.accept = "application/json,.json,.gz,application/gzip";\n      inp.onchange = function(){ var f = inp.files && inp.files[0]; if(!f) return; pdGunzip(f).then(function(txt){')
# the export and the check need the data permission, like backups
js = rep(js, "[data-action=\"sample-25\"]']", "[data-action=\"sample-25\"], [data-action=\"pdx-export\"], [data-action=\"pdx-rt\"], [data-action=\"pdx-tombs\"]']")
EXTRA_CSS.append(b9("v160c.css"))
HOOK_NAMES += ["pdGzip", "pdGunzip", "pdSha256", "pdBackupNow", "pdBkTick", "pdBkWriteDay", "pdBkPrune", "pdBkList", "listBackups", "readBackup", "PDBK", "PDX",
               "pdExportForServer", "pdRoundTrip", "pdImportExport", "pdBuildTables", "pdxRebuild", "pdxVerify", "pdxCanon", "pdxCanonText", "pdxDiff", "pdxCard", "pdShopEndH"]
LOG.append("Parsec 16 (C): end-of-day compressed backups (30 days), Export for the server + the round-trip check")
