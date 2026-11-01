# Parsec 13.1 (S) — every page's search is an icon that opens a search window over the page (b9/v131s.js + b9/v131s.css).
# Typing filters that page's list (Technician, Inventory, Admin, Manager, the Parts catalog) or lists what to open
# (Triage, Foreman, Warranty, Parts, Fixes, Inbox). Ctrl K stays the search for everything. The RO List keeps its own.
# The page modules (tc1, inv1, adm1, pt2/4/5, fx2/3, ib2/3, mg1) carry their psmBtn / psmReg in their files;
# Triage, Foreman and Warranty live in the base and are patched here. Runs inside build12.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v131s.js") + "\nvar PG = (function(){\n")
EXTRA_CSS.append(b9("v131s.css"))


def _search(js, k, key, title):
    a = "  var search = UI.%sSrch ? '<span class=\"tg-srch open\">" % k
    assert js.count(a) == 1, (k, js.count(a))
    i = js.index(a)
    e = "aria-label=\"Search\">' + tgI(\"search\", 16) + '</button>';\n"
    j = js.index(e, i)
    assert j - i < 900, (k, j - i)
    return js[:i] + "  var search = psmBtn(\"%s\", \"%s\");   /* Parsec 13.1 — the icon opens the search window */\n" % (key, title) + js[j + len(e):]


for _k, _key, _t in [("tg", "triage", "Search — RO, unit, customer, VIN or spot"), ("fm", "foreman", "Search — RO, unit, customer, VIN or spot"), ("wa", "warranty", "Search — RO, claim #, VIN, customer or code")]:
    js = _search(js, _k, _key, _t)

js = rep(js, '    case "tg-srch": UI.tgSrch = !UI.tgSrch; UI.tgQ = ""; UI.tgSri = 0; UI.tgPop = null; render(); if(UI.tgSrch) setTimeout(function(){ var q = document.getElementById("tg-q"); if(q) q.focus(); }, 0); return true;',
             '    case "tg-srch": UI.tgPop = null; psmOpen("triage"); return true;')
js = rep(js, '    case "fm-srch": UI.fmSrch = !UI.fmSrch; UI.fmQ = ""; UI.fmSri = 0; UI.fmPop = null; render(); if(UI.fmSrch) setTimeout(function(){ var q = document.getElementById("fm-q"); if(q) q.focus(); }, 0); return true;',
             '    case "fm-srch": UI.fmPop = null; psmOpen("foreman"); return true;')
js = rep(js, '    case "wa-srch": UI.waSrch = !UI.waSrch; UI.waQ = ""; UI.waSri = 0; UI.waPop = null; render(); return true;',
             '    case "wa-srch": UI.waPop = null; psmOpen("warranty"); return true;')
js = rep(js, '  if(k === "/"){ UI.tgSrch = true; UI.tgQ = ""; UI.tgSri = 0; render(); setTimeout(function(){ var q = document.getElementById("tg-q"); if(q) q.focus(); }, 0); return stop(); }',
             '  if(k === "/"){ psmOpen("triage"); return stop(); }')
js = rep(js, '  if(k === "/"){ UI.fmSrch = true; UI.fmQ = ""; UI.fmSri = 0; render(); setTimeout(function(){ var q = document.getElementById("fm-q"); if(q) q.focus(); }, 0); return stop(); }',
             '  if(k === "/"){ psmOpen("foreman"); return stop(); }')
js = rep(js, '  if(k === "/"){ UI.waSrch = true; UI.waQ = ""; UI.waSri = 0; UI.waPop = null; render(); return stop(); }',
             '  if(k === "/"){ UI.waPop = null; psmOpen("warranty"); return stop(); }')

HOOK_NAMES += ["psmOpen", "psmClose", "psmBtn", "psmReg", "psmCfg"]
LOG.append("Parsec 13.1 (S): every page's search is an icon that opens the search window")
