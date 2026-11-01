# Parsec 14.9 (W) — the words of every tooltip: tipNorm + TIPMAP + TIPPAT (b9/v149w.js, first thing in the app's scope; window.tipNorm),
# and the build flags any tooltip that still breaks a writing rule (b9/tiplint.js → app/_tiplint.txt, one line in the log).
# Runs inside build12.py: uses js, src, k0, k1, b9, H, LOG, KEEP_EXTRA.
import re as _re, json as _json, os as _os, subprocess as _sp, tempfile as _tf
_t0 = js.index('(function(){\n"use strict";\n') + len('(function(){\n"use strict";\n')   # inside the app's own scope, first (the clean-out reads that scope)
js = js[:_t0] + b9("v149w.js") + "\n" + js[_t0:]
KEEP_EXTRA += ["TIPMAP", "TIPPAT"]

# ---- the lint: every static tooltip in the page, through the same rules the page uses
_TP = [_re.compile(r'''title="((?:[^"\\$<>]|\\.){1,300})"'''), _re.compile(r"""title='((?:[^'\\$<>]|\\.){1,300})'"""),
       _re.compile(r'''\btitle\s*:\s*(['"])((?:(?!\1)[^\\\n]|\\.){1,300})\1'''),
       _re.compile(r'''setAttribute\(\s*['"]title['"]\s*,\s*(['"])((?:(?!\1)[^\\\n]|\\.){1,300})\1'''),
       _re.compile(r'''\.title\s*=\s*(['"])((?:(?!\1)[^\\\n]|\\.){1,300})\1'''), _re.compile(r'''data-tip="((?:[^"\\<>$]|\\.){1,300})"''')]
_TBAD = _re.compile(r"""(' ?\+|\+ ?'|" ?\+|\+ ?"|\$\{|^\(\[|^\s*$|^[\W_]+$|\s$|^\s|“$|: $)""")
def _tunesc(s):
    s = _re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), s)
    return s.replace("\\'", "'").replace('\\"', '"').replace('\\\\', '\\')
_tips = {}
for _rx in _TP:
    for _m in _rx.finditer(js + "\n" + src[:k0] + src[k1:]):
        _s = _m.group(_m.lastindex)
        if _TBAD.search(_s): continue
        _tips[_tunesc(_s)] = 1
# a title on a button that also shows the same words: the tip only repeats the label (hidden at runtime)
_lab = {}
for _m in _re.finditer(r'''title="([^"$<>\\]{1,80})"[^>]*>(?:\s*<(?:svg|span|i)\b[^>]*>(?:[^<]|<(?!/?button)[^>]*>)*?</(?:svg|span|i)>)*\s*([A-Za-z][^<]{0,60}?)\s*</button>''', js):
    _lab[_tunesc(_m.group(1))] = _m.group(2).strip()
_td = _tf.mkdtemp(); _tj = _os.path.join(_td, "tips.json")
_json.dump([{"raw": t, "label": _lab.get(t, "")} for t in _tips], open(_tj, "w", encoding="utf-8"), ensure_ascii=False)
_r = _sp.run(["node", _os.path.join(H, "b9", "tiplint.js"), _os.path.join(H, "b9", "v149w.js"), _tj], capture_output=True, text=True)
if _r.returncode: raise SystemExit("tooltip lint failed:\n" + _r.stderr[:2000])
_res = _json.loads(_r.stdout)
_hard = [f for f in _res["flagged"] if f["why"] != ["repeats the label"]]
_rep = [f for f in _res["flagged"] if f["why"] == ["repeats the label"]]
with open(_os.path.join(H, "_tiplint.txt"), "w", encoding="utf-8") as _f:
    _f.write("Parsec tooltip lint — %d static tooltips checked, %d break a writing rule, %d only repeat their button's label (hidden at runtime)\n\n" % (_res["n"], len(_hard), len(_rep)))
    for f in _hard + _rep: _f.write("%s\n    → %s\n    ✗ %s\n" % (f["raw"], f["out"], "; ".join(f["why"])))
LOG.append("tooltip lint: %d static tooltips, %d break a writing rule, %d repeat their label (hidden) — app/_tiplint.txt" % (_res["n"], len(_hard), len(_rep)))
print(LOG[-1])
