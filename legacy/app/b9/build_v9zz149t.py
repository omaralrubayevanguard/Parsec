# Parsec 14.9 (A) — one tooltip for the whole app: b9/v149t.js (global), b9/v149t.css (global), b9/v149t_jc.css (inside the RO page).
# · Ink with an arrow, after 400 ms then at once between neighbours, flips at the window's edges; replaces the browser's title box
#   (the title is stashed while shown and put back on leave), the old #pg-tip and the Warranty chart's tip; cut-off text in full;
#   Tab focus; touch press-and-hold and a few ⓘ; Tooltips · All · Fewer · Off on the person menu.
# Runs inside build12.py: uses js, rep, b9, json, EXTRA_CSS, LOG, HOOK_NAMES.
EXTRA_CSS.append(b9("v149t.css"))
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("v149t_jc.css"))[1:-1] + js[_jc1:]
# the engine, before the person pop-over (it uses pxSeg / viewAsStaff / ZF / pushToast at run time)
js = rep(js, "function pxMePop(){", b9("v149t.js") + "\nfunction pxMePop(){")
# the person menu: Tooltips · All · Fewer · Off, under Size
js = rep(js, "'<div class=\"pxp-set\"><span>Size</span>' + pxSeg([[\"normal\", \"Normal\"], [\"large\", \"Large\"], [\"floor\", \"Shop floor\"]], sizeMode(), \"set-size\", \"data-size\") + '</div>'",
             "'<div class=\"pxp-set\"><span>Size</span>' + pxSeg([[\"normal\", \"Normal\"], [\"large\", \"Large\"], [\"floor\", \"Shop floor\"]], sizeMode(), \"set-size\", \"data-size\") + '</div>' + ptipMenuRow()")
# the pages' old mouse-following tip: this one does it now
js = rep(js, '  /* hover tips: data-tip="Title|line under it" */\n  document.addEventListener("mousemove", function(ev){\n',
             '  /* hover tips: data-tip="Title|line under it" — Parsec 14.9: the one tooltip (PTIP) shows them */\n  document.addEventListener("mousemove", function(ev){\n    if(typeof PTIP !== "undefined") return;\n')
HOOK_NAMES += ["PTIP", "ptipMode", "ptipSetMode", "ptipMenuRow"]
LOG.append("Parsec 14.9 (A): one tooltip — Ink with an arrow, 400 ms then at once, cut-off text, Tab focus, touch, All · Fewer · Off")
