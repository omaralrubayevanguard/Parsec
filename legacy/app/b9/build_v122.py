# Parsec 12.2 — no Inbox page and no Console page; the sidebar in one list (Career → Time Log → RO List → Technician → Triage →
# Foreman → Parts → Warranty → Manager → Fixes) with no lines between; the road test and the truck checks on every page's RO.
# (The pop-over layer, the truck picture and Delete live in b9/tri1.js, b9/trucks.js, b9/rop1.js, b9/tc1.js, b9/rl1.js.)
# Runs inside build12.py after build_tri.py: uses js, rep, LOG.

# ---- the pages
js = rep(js, 'var NAV_PAGES = [["inbox","Inbox"],["tech","Technician"],["console","Console"],', 'var NAV_PAGES = [["tech","Technician"],')
js = rep(js, 'if(page === "profile" || page === "inbox") return true;',
         'if(page === "profile") return true;\n  if(page === "inbox" || page === "console") return false;   /* Parsec 12.2: these pages are gone — every page has its own list */')
js = rep(js, 'else if(UI.view==="console") viewHtml = viewConsole();', '')
js = rep(js, 'else if(UI.view==="inbox") viewHtml = viewInbox();', '')
js = rep(js, '(UI.view === "console" && navAllowed("tech") ? "tech" : navPages()[0][0])', '(navAllowed("rolist") ? "rolist" : navPages()[0][0])')
js = rep(js, 'var v = HOME[role] || "console";', 'var v = HOME[role] || "rolist";')
js = rep(js, 'UI.selectedRo = roId; UI.view = "console";', 'UI.selectedRo = roId; UI.view = "ros";')
js = rep(js, '"Foreman": ["console","ros",', '"Foreman": ["ros",')
js = rep(js, '"Manager": ["console","ros",', '"Manager": ["ros",')

# ---- the sidebar: one list, in this order, no lines or headings between
js = rep(js, 'var PX_GROUPS = [["", ["tech", "console", "triage", "rolist", "ros"]], ["Shop", ["foreman", "warranty", "manager", "parts"]], ["You", ["timelog", "fixes", "career"]]];',
         'var PX_GROUPS = [["", ["career", "timelog", "rolist", "ros", "tech", "triage", "foreman", "parts", "warranty", "manager", "fixes"]]];')
js = rep(js, "return '<div class=\"pxr-gh\"><span>' + esc(g[0]) + '</span></div>' + (gi === 0 ? inbox : '') + g[1].map(row).join('');",
         "return g[1].map(row).join('');   /* Parsec 12.2: no Inbox row, no lines or headings */")

# ---- the road test and the truck checks on every page's RO (Foreman, Warranty here; the RO page, Technician, Parts and the RO list in their modules)
js = rep(js, "'<h2>' + esc(ro.customerName || \"\") + '</h2><div class=\"r2\">'", "'<h2>' + esc(ro.customerName || \"\") + '</h2>' + (trxBtnsOk(ro) ? '<div class=\"trx-b\">' + trxBtns(ro) + '</div>' : '') + '<div class=\"r2\">'")
js = rep(js, "+ '<button class=\"btn btn-sm\" data-action=\"wa-pop\" data-p=\"xfer\" data-ro=\"' + ro.id + '\">'", "+ trxBtns(ro) + '<button class=\"btn btn-sm\" data-action=\"wa-pop\" data-p=\"xfer\" data-ro=\"' + ro.id + '\">'")
# away from Triage the pop-over opens in a layer over the page
js = rep(js, "  html += modalHtml();\n  html += paletteHtml();", "  html += modalHtml();\n  html += trxLayerHtml();\n  html += paletteHtml();")

# ---- words that pointed at the Inbox
_W = [(" — it’s in their Inbox, on ", " — it’s under Messages on "), (" — it’s in their Inbox.", "."), (" has it in the Inbox.", " has a note about it."),
      (" sees it in the Inbox, then brings it in", " sees it, then brings it in"), (" is in their Inbox.", " is with them."), ("Done — it’s in Done in your Inbox.", "Done."),
      ("Tell me in my Inbox", "Tell me"), ("<b>In your Inbox</b>", "<b>Heads up</b>"), ('<button class="btn btn-sm" data-a="inbox">Open</button>', ""),
      ("on Career and in their Inbox", "on their Career page"), ("it goes to their Inbox", "it goes to them"), ("On — it comes to your Inbox.", "On."),
      (" — it shows in their Inbox.", "."), (" sees it on Career and in the Inbox.", " sees it on Career."), (" gets it in the Inbox", " gets it"), ("’s Inbox", "")]
for _a, _b in _W:
    _n = js.count(_a)
    if _n: js = js.replace(_a, _b)
    LOG.append("  Inbox words: %d × %s" % (_n, _a.strip()[:40]))
LOG.append("Parsec 12.2: no Inbox or Console page, the sidebar in one list, Road test and Truck checks on every page's RO")
HOOK_NAMES += ["trkPick", "trkAutoPick", "trxLayerOn", "navPages"]
