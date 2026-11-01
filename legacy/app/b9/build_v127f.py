# Parsec 12.7 — the pages' lists fold: the whole list into a strip, and each group on its own (b9/v127f.js, b9/v127f.css).
# Runs inside build12.py with the other patch files: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v127f.js") + "\nvar PG = (function(){\n")
js = rep(js, "function patchApp(html){\n  var app = document.getElementById(\"app\");\n  var tmp = document.createElement(\"div\");\n  tmp.innerHTML = html;\n  morphChildren(app, tmp);\n}",
         "function patchApp(html){\n  var app = document.getElementById(\"app\");\n  var tmp = document.createElement(\"div\");\n  tmp.innerHTML = html;\n  morphChildren(app, tmp);\n  try{ lfDecorate(app); }catch(e){ console.error(e); }   /* Parsec 12.7: the lists fold (b9/v127f.js) */\n}")
EXTRA_CSS.append(b9("v127f.css"))
HOOK_NAMES += ["lfDecorate", "lfToggleList", "LF"]
LOG.append("Parsec 12.7: the pages' lists fold")
