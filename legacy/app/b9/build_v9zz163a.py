# Parsec 16.3 (A) — the RO everywhere, on the pages (b9/v163a.js + v163a.css): every RO number opens its RO (plain, a small ↗
# when you point at it), the RO's picture in every row that shows an RO, a ⋯ with the shop functions on the Technician,
# Foreman and Parts RO cards, and the contact when you point at the customer. The RO page itself is 16.3 B.
# Runs inside build12.py: uses js, rep, b9, EXTRA_CSS, KEEP_EXTRA, HOOK_NAMES, LOG.
js = rep(js, "function patchApp(html){", b9("v163a.js") + "\nfunction patchApp(html){")
js = rep(js, "  tmp.innerHTML = html;\n  morphChildren(app, tmp);",
             "  tmp.innerHTML = html;\n  try{ rl163Deco(tmp); }catch(e){ console.error(e); }   /* Parsec 16.3 (A): RO links, pictures, the ⋯, the contact — before the morph */\n  morphChildren(app, tmp);")
# Transfer… from any page: the same Send-to pop-over Triage uses, on the layer Road test / Truck checks / Release already use
js = rep(js, "var TRX_LT = { road: 1, checks: 1, release: 1 };", "var TRX_LT = { road: 1, checks: 1, release: 1, xfer: 1 };   /* Parsec 16.3 (A): Transfer… from the RO cards' ⋯ */")
js = rep(js, "  function findCut(el){\n", "  function findCut(el){\n    if(el && el.closest && el.closest(\".ro-lnk\")) return null;   /* Parsec 16.3: an RO link shows its peek, not a cut-off tip */\n")
EXTRA_CSS.append(b9("v163a.css"))
KEEP_EXTRA += ["roLnk", "rl163Deco", "rl163Open"]
HOOK_NAMES += ["roLnk", "rl163Deco", "rl163Ix", "rl163Items", "rl163Open", "rl163MenuClose"]
LOG.append("Parsec 16.3 (A): RO links everywhere, pictures in RO rows, the ⋯ shop menu, the contact on the customer")
