# Parsec 14 — one status look on every page: b9/st14.js (pgSt / pgStEl / pgStLabel) and b9/st14.css.
# The helper goes in at the top of the app script (before the PG frame, like v131s.js) so every page and the RO page can call it;
# its styles go in the page CSS and in the RO page's own (shadow) CSS. Runs inside build12.py: uses js, rep, b9, json, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("st14.js") + "\nvar PG = (function(){\n")
EXTRA_CSS.append(b9("st14.css"))
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("st14.css"))[1:-1] + js[_jc1:]
HOOK_NAMES += ["pgSt", "pgStLabel", "pgStOf", "pgStKey"]
LOG.append("Parsec 14: st14 — one status look")
