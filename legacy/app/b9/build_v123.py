# Parsec 12.3 — shared colors and the truck line (b9/v123.js, v123.css, v123_jc.css); the sidebar theme strip; sample trucks from the catalog.
# Runs inside build12.py after build_v122.py: uses js, rep, b9, json, EXTRA_CSS, LOG.
js = rep(js, "function tgPopHtml(){\n", b9("v123.js") + "\nfunction tgPopHtml(){\n")
# The colors in the main document: scripts only read them through strings (reasonVar → "var(--rc-diag)"), so the build's "custom properties
# nothing reads" pass would drop them — one throwaway declaration that reads every one keeps them; and older theme blocks
# (:root[data-theme="ivl"][data-theme], the ivd one) set every reason to one ink, so v123.css's blocks go in one step stronger. (fork B found both)
_v123 = b9("v123.css")
_rcjt = sorted(set(re.findall(r'(--(?:rc|jt)-[\w-]+)\s*:', _v123)))
_vcss = []
for _sel, _body in re.findall(r'(:root[^{,]*)\{([^}]*)\}', _v123):
    _sel = _sel.strip()
    _vcss.append((":root[data-theme][data-theme][data-theme]" if _sel == ":root" else _sel + "[data-theme][data-theme]") + "{" + _body + "}")
if _rcjt: _vcss.append(":root{--v123-keep:" + " ".join("var(%s)" % _n for _n in _rcjt) + ";}")
EXTRA_CSS.append("/* Parsec 12.3 — one color per clock reason, everywhere; job type colors */\n" + "\n".join(_vcss))
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("v123_jc.css"))[1:-1] + js[_jc1:]
HOOK_NAMES += ["truckLine", "truckCfg", "jtVar"]
LOG.append("Parsec 12.3: shared reason and job type colors, the truck line")
# the sidebar: the theme strip above you (and out of your menu)
EXTRA_CSS.append(b9("v123_side.css"))
js = rep(js, "+ '<nav class=\"pxr-nav\" aria-label=\"Pages\">' + nav + '</nav>'\n    + pxMeRow()", "+ '<nav class=\"pxr-nav\" aria-label=\"Pages\">' + nav + '</nav>'\n    + pxThemeStrip(mini) + pxMeRow()")
js = rep(js, """+ '<div class="pxp-set"><span>Theme</span>' + pxSeg([["ivl", "Ivory", "sun"], ["ivd", "Graphite", "moon"], ["vvl", "White", "sun"], ["vvd", "Near black", "moon"]], THEME, "set-theme", "data-theme") + '</div>'""", "")
# sample trucks: from the catalog
js = rep(js, 'var tech = pl.noTech ? "" : (pl.live ? me : techs[ix % techs.length]);', 'var tech = pl.noTech ? "" : (pl.live ? me : techs[ix % techs.length]);\n    var tk = s25Truck(rnd, pl.yr);   /* Parsec 12.3: a real body built that year */')
js = rep(js, 'vin: s25Vin(pl.yr, rnd)', 'vin: s25Vin(tk.year, rnd)')
js = rep(js, 'engineType: pl.eng, model: S25_MODELS[ix % S25_MODELS.length],', 'engineType: pl.eng, model: tk.model, year: tk.year, make: "Volvo", axles: tk.axles, cab: tk.cab, sleeper: tk.sleeper,')
HOOK_NAMES += ["s25Truck"]
LOG.append("Parsec 12.3: the theme strip in the sidebar, sample trucks from the catalog")
# the past weeks' ROs too (the sample history)
js = rep(js, 'var comeback = rnd() < 0.05, yr = 2016 + Math.floor(rnd() * 8);', 'var comeback = rnd() < 0.05, yr = 2016 + Math.floor(rnd() * 8), tk = s25Truck(rnd, yr);')
js = rep(js, 'engineType: "D13", model: pick(S25_MODELS),', 'engineType: pick(["D13 · 405 HP", "D13 · 455 HP", "D13 TC · 455 HP", "D13 · 500 HP", "D11 · 405 HP"]), model: tk.model, year: tk.year, make: "Volvo", axles: tk.axles, cab: tk.cab, sleeper: tk.sleeper,')
