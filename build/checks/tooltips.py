# Parsec · tooltip guard (run by build.py): every static tooltip keeps the writing rules.
#   python3 tooltips.py <assembled app.js>
# Collects every title="…" / data-tip="…" / title: '…' string in the app, runs each through tipNorm — the same function
# the tooltip component uses at run time (src/app/kit/tooltip-words.js) — and flags one that still breaks a rule:
# a title over 60 characters, "Click to …", a full stop, a key in brackets on the title, Title Case, one bare word.
# A tooltip that only repeats its button's label is listed but allowed (the component hides it). Report: build/_tmp/tooltips.txt.
import re, sys, json, os, subprocess, tempfile
H = os.path.dirname(os.path.abspath(__file__))
js = open(sys.argv[1], encoding="utf-8").read()
# tipNorm lives first in the closure; the lint loads that file alone
words = open(os.path.join(H, "..", "..", "src", "app", "kit", "tooltip-words.js"), encoding="utf-8").read()
TP = [re.compile(r'''title="((?:[^"\\$<>]|\\.){1,300})"'''), re.compile(r"""title='((?:[^'\\$<>]|\\.){1,300})'"""),
      re.compile(r'''\btitle\s*:\s*(['"])((?:(?!\1)[^\\\n]|\\.){1,300})\1'''),
      re.compile(r'''setAttribute\(\s*['"]title['"]\s*,\s*(['"])((?:(?!\1)[^\\\n]|\\.){1,300})\1'''),
      re.compile(r'''\.title\s*=\s*(['"])((?:(?!\1)[^\\\n]|\\.){1,300})\1'''), re.compile(r'''data-tip="((?:[^"\\<>$]|\\.){1,300})"''')]
BAD = re.compile(r"""(' ?\+|\+ ?'|" ?\+|\+ ?"|\$\{|^\(\[|^\s*$|^[\W_]+$|\s$|^\s|“$|: $)""")
def unesc(s):
    s = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), s)
    return s.replace("\\'", "'").replace('\\"', '"').replace('\\\\', '\\')
tips = {}
for rx in TP:
    for m in rx.finditer(js):
        s = m.group(m.lastindex)
        if BAD.search(s): continue
        tips[unesc(s)] = 1
lab = {}
for m in re.finditer(r'''title="([^"$<>\\]{1,80})"[^>]*>(?:\s*<(?:svg|span|i)\b[^>]*>(?:[^<]|<(?!/?button)[^>]*>)*?</(?:svg|span|i)>)*\s*([A-Za-z][^<]{0,60}?)\s*</button>''', js):
    lab[unesc(m.group(1))] = m.group(2).strip()
td = tempfile.mkdtemp(); tj = os.path.join(td, "tips.json"); wj = os.path.join(td, "words.js")
json.dump([{"raw": t, "label": lab.get(t, "")} for t in tips], open(tj, "w", encoding="utf-8"), ensure_ascii=False)
open(wj, "w", encoding="utf-8").write(words)
r = subprocess.run(["node", os.path.join(H, "tiplint.js"), wj, tj], capture_output=True, text=True)
if r.returncode: print("tooltip lint could not run:\n" + r.stderr[:2000]); sys.exit(1)
res = json.loads(r.stdout)
hard = [f for f in res["flagged"] if f["why"] != ["repeats the label"]]
rep = [f for f in res["flagged"] if f["why"] == ["repeats the label"]]
os.makedirs(os.path.join(H, "..", "_tmp"), exist_ok=True)
with open(os.path.join(H, "..", "_tmp", "tooltips.txt"), "w", encoding="utf-8") as f:
    f.write("Parsec tooltip lint — %d static tooltips checked, %d break a writing rule, %d only repeat their button's label (hidden at runtime)\n\n" % (res["n"], len(hard), len(rep)))
    for x in hard + rep: f.write("%s\n    → %s\n    ✗ %s\n" % (x["raw"], x["out"], "; ".join(x["why"])))
print("tooltips: %d static tooltips, %d break a writing rule, %d repeat their label (hidden) — build/_tmp/tooltips.txt" % (res["n"], len(hard), len(rep)))
sys.exit(1 if hard else 0)
