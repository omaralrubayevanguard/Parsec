# Parsec 15 (A) — the RO page: below Operations only Messages about this RO and Customer (the other seven sections aren't drawn —
# what they did lives on its own page: Parts, Warranty, Assets, each operation's Parts tab, the truck card's Release / Truck checks);
# no more opening on hover; one switch (Collapse all ⇄ Expand all) above the sections below Operations and one at the top of the
# right pane's groups. The truck card's ⋯ menu gains "Truck history in Assets…" (Truck history was the way there).
# The JS is in b9/rop1.js (ropBuild, ropFoldOne, ropFall*); this file adds the CSS and the menu item. Runs inside build12.py: uses js, b9, json, LOG.
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("v150a.css"))[1:-1] + js[_jc1:]
_a = '  item("The 52-truck catalog…", "Every Volvo body from 1997 to today", function(){ trkCatOpen(null); });'
_n = js.count(_a)
assert _n >= 1, "truck menu: the catalog item"
js = js.replace(_a, '  if(typeof asOpenFor === "function" && (typeof navAllowed !== "function" || navAllowed("assets"))) item("Truck history in Assets…", "Every visit, repeat repairs, miles and hours", function(){ asOpenFor(ro); });   /* Parsec 15: Truck history left the RO page */\n' + _a)
LOG.append("Parsec 15 (A): the RO page — Messages and Customer below Operations; one Collapse all / Expand all switch; no hover; Truck history in Assets… on the truck menu (%d)" % _n)
