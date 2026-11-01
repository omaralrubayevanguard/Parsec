# Parsec 12.5 (fork D) — the Inventory page: the parts stock on the Parts list, in the sidebar right after Parts.
# The page: b9/inv1.js (module INVPG, page key "inventory", classes ivn-*), its styles b9/inv.css (raw, scoped to [data-pg="inventory"]).
# Runs inside build12.py after build_v122.py (the sidebar order) .. build_v124.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.

# ---- the page module goes in with the other page modules
js = rep(js, "\nfunction viewInventory(){ return PT.view(); }\n", "\nfunction viewInventory(){ return PT.view(); }\n" + b9("inv1.js") + "\n")
js = rep(js, '  else if(UI.view==="parts") viewHtml = viewInventory();', '  else if(UI.view==="parts") viewHtml = viewInventory();\n  else if(UI.view==="inventory") viewHtml = viewStock();   /* Parsec 12.5 */')

# ---- the page list, the roles that get it, and the people who already have those roles (once)
js = rep(js, '["timelog","Time Log"],["parts","Parts"],["career","Career"]];', '["timelog","Time Log"],["parts","Parts"],["inventory","Inventory"],["career","Career"]];')
js = rep(js, '"Foreman": ["ros","fixes","foreman","triage","timelog","parts","career"],', '"Foreman": ["ros","fixes","foreman","triage","timelog","parts","inventory","career"],')
js = rep(js, '"Manager": ["ros","warranty","fixes","foreman","manager","triage","timelog","parts","career"],', '"Manager": ["ros","warranty","fixes","foreman","manager","triage","timelog","parts","inventory","career"],')
js = rep(js, '"Parts": ["ros","parts"]\n};', '"Parts": ["ros","parts","inventory"]\n};')
js = rep(js, '!s.p11){ s.p11 = 1; s.pages = s.pages || {}; s.pages.console = false; s.pages.tech = true; } });',
         '!s.p11){ s.p11 = 1; s.pages = s.pages || {}; s.pages.console = false; s.pages.tech = true; } });\n'
         '  /* Parsec 12.5: Parts, the foreman and the manager get the Inventory page (once — the Manager can take it away again) */\n'
         '  STATE.staff.forEach(function(s){ if(s && !s.p125 && (s.role === "Parts" || s.role === "Foreman" || s.role === "Manager")){ s.p125 = 1; s.pages = s.pages || {}; s.pages.inventory = true; } });')

# ---- the sidebar (desktop) and the phone's More sheet: right after Parts; the Parts role's bottom bar gets it second
js = rep(js, 'var PX_GROUPS = [["", ["career", "timelog", "rolist", "ros", "tech", "triage", "foreman", "parts", "warranty", "manager", "fixes"]]];',
         'var PX_GROUPS = [["", ["career", "timelog", "rolist", "ros", "tech", "triage", "foreman", "parts", "inventory", "warranty", "manager", "fixes"]]];')
js = rep(js, '"foreman", "parts", "warranty", "manager", "fixes", "report"]]];', '"foreman", "parts", "inventory", "warranty", "manager", "fixes", "report"]]];')
js = rep(js, 'parts: "Parts", timelog: "Time Log",', 'parts: "Parts", inventory: "Inventory", timelog: "Time Log",')
js = rep(js, 'Parts: ["parts", "rolist", "fixes", "timelog"]', 'Parts: ["parts", "inventory", "rolist", "timelog"]')
# its icon: shelves with boxes
_iv0 = js.index('var IV_NAV_IC = { tech:"tech"'); _iv1 = js.index("\n", _iv0)
js = js[:_iv1] + '\nIV_NAV_IC.inventory = "inventory"; IVI.inventory = \'<path d="M3.5 20.5h17M4.5 20.5V3.5M19.5 20.5V3.5M4.5 12h15"/><rect x="7" y="6.5" width="4.5" height="5.5" rx=".7"/><rect x="13" y="8.5" width="4" height="3.5" rx=".7"/><rect x="7.5" y="15" width="5.5" height="5.5" rx=".7"/><path d="M15 17.5h2.5v3H15z"/>\';   /* Parsec 12.5: the Inventory page */' + js[_iv1:]

# ---- Parts: the Catalog opens the Inventory page; the stock order goes up to each part's max (its default stays twice the min)
js = rep(js, '<button class="btn btn-sm" data-a="oldparts">${ic(\'sheet\', 14)}Edit the full list</button>',
         '${navAllowed(\'inventory\') ? `<button class="btn btn-sm" data-action="nav" data-view="inventory">${ic(\'box\', 14)}Open Inventory</button>` : \'\'}<button class="btn btn-sm" data-a="oldparts">${ic(\'sheet\', 14)}Edit the full list</button>')
js = rep(js, 'mx = c => c.min * 2,', 'mx = c => Math.max(c.min, +c.raw.max || c.min * 2),')
js = rep(js, 'c.raw.onOrder = c.min * 2 - c.oh;', 'c.raw.onOrder = Math.max(c.min, +c.raw.max || c.min * 2) - c.oh;')

EXTRA_CSS.append(b9("inv.css"))
HOOK_NAMES += ["INVPG"]
LOG.append("Parsec 12.5: the Inventory page")
