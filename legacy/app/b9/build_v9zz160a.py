# Parsec 16 (A) — the data store, core: every kind of data reaches the folder through one topic map; layout 16 (ROs/Open,
# ROs/Closed/<year>, Shop by topic, the busy ones by month, layout.json); a safe one-time move from layout 15 (backup → write →
# read back and compare → only then tidy the old files); ids, updatedAt/updatedBy and deletion marks on every record; and a
# record-by-record merge when another computer saved in between (only a real clash asks). Code: b9/v160a.js + v160a.css.
# Runs inside build12.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
# the base storage functions step aside under new names; layout 16 wraps them (the old layout still reads, once, and is still
# written when the move to 16 can't be made)
js = rep(js, "function writeFolderState(force){", "function writeFolderState15(force){")
js = rep(js, "function readFolderState(){", "function readFolderState15(){")
js = rep(js, "function adoptFolderState(){", "function adoptFolderState15(){")
js = rep(js, "function writeFolderState15(force){", b9("v160a.js") + "\nfunction writeFolderState15(force){")
# an RO's folder is a path now ("Open/RO-1 - X", "Closed/2026/RO-1 - X")
js = rep(js, "function roFolderNow(ro){ return (ro && ROFOLDER[ro.id]) || roFolderFor(ro); }",
             "function roFolderNow(ro){ return (ro && ROFOLDER[ro.id]) || (PD16.on ? pd16Parent(ro) + \"/\" + roFolderFor(ro) : roFolderFor(ro)); }")
js = rep(js, ".then(function (d) { return d.getDirectoryHandle(name, { create: !!create }); })\n    .then(function (d) { return d.getDirectoryHandle(PD_ATT, { create: !!create }); });",
             ".then(function (d) { return pdDirPath(d, name, create); })   /* Parsec 16: Open/<RO> or Closed/<year>/<RO> */\n    .then(function (d) { return d.getDirectoryHandle(PD_ATT, { create: !!create }); });")
js = rep(js, "        return root.getDirectoryHandle(folder)\n          .then(function (d) { return d.getDirectoryHandle(PD_ATT)",
             "        return pdDirPath(root, folder, false)\n          .then(function (d) { return d.getDirectoryHandle(PD_ATT)")
# the old writer saves every key too (it is the fallback when the move can't be made), and adopting keeps every local key the folder lacks
js = rep(js, "  PG_SHOP_KEYS.forEach(function(k){ if(STATE[k] !== undefined) shopObj[k] = STATE[k]; });\n",
             "  PG_SHOP_KEYS.forEach(function(k){ if(STATE[k] !== undefined) shopObj[k] = STATE[k]; });\n"
             "  Object.keys(STATE).forEach(function(k){ if(k !== \"ros\" && k !== \"punches\" && !(k in shopObj) && STATE[k] !== undefined) shopObj[k] = STATE[k]; });   /* Parsec 16: nothing left out */\n")
js = rep(js, '["pageNote","pageNoteAt","techName","automations","staff","yard","audit","shopRo"].concat(PG_SHOP_KEYS).forEach(function(k){',
             'Object.keys(STATE || {}).forEach(function(k){   /* Parsec 16: every kind, not a list */')
# the marks: a baseline at load, and at every save (the browser copy keeps them too)
js = rep(js, "  STATE = loadState();\n  restoreUI();", "  STATE = loadState();\n  try{ pdMarkReset(); }catch(e){}   /* Parsec 16: what was loaded is the baseline for updatedAt */\n  restoreUI();")
js = rep(js, "function doSave(){\n  if(saveTimer){ clearTimeout(saveTimer); saveTimer = null; }",
             "function doSave(){\n  if(saveTimer){ clearTimeout(saveTimer); saveTimer = null; }\n  try{ if(PD16.M && pdMark()) persistLocal(); }catch(e){ console.warn(\"pd16 marks\", e); }   /* Parsec 16: updatedAt, deletion marks */")
# the move that couldn't be made says so
js = rep(js, "  if(STORAGE_FULL) h += '<div class=\"alert-bar bad\" data-key=\"alert-storage\">",
             "  h += pd16BannerHtml();\n  if(STORAGE_FULL) h += '<div class=\"alert-bar bad\" data-key=\"alert-storage\">")
js = rep(js, '    case "conflict-keep":', '    case "pd16-ok": PD16.failed = ""; render(); break;\n    case "pd15-ok": PD16.old15 = "seen"; render(); break;\n    case "conflict-keep":')
EXTRA_CSS.append(b9("v160a.css"))
HOOK_NAMES += ["PD16", "pdMark", "pdMarkReset", "pdMerge", "pdSnap", "pdSnapOf", "pd16Read", "pd16Write", "pd16Migrate", "pd16Changed", "pd16Pull", "pd16Probe", "pd16Poll",
               "pd15Scan", "pd15Take", "pd15Base", "pdCanon", "pdTopicMap", "pd16ShopFiles", "pdTombsClear", "pdRoDir", "pdAttList", "pdDirPath", "pdClashAsk", "pd16Info", "pd16Names",
               "writeFolderState15", "readFolderState15", "adoptFolderState15", "readFolderState", "roFolderNow", "normalizeState", "persistLocal"]
LOG.append("Parsec 16 (A): layout 16 (ROs/Open · ROs/Closed/<year> · Shop by topic · layout.json), every key saved, marks + deletion marks, record-by-record merge")
