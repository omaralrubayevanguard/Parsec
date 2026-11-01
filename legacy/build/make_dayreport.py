# Day report mock-up — three ways to lay out the report, on the Time Log paper and the shared panel.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app"); M = os.path.join(B, "dr")
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]
tg = open(f"{A}/tg.css").read()
tg = tg.replace(':root:is([data-theme="ivd"],[data-theme="mist"],[data-theme="atd"]) .tg{', ':root[data-theme="dark"] .tg{')
tl = open(f"{A}/b9/src/timelog_full.css").read()
src = open(f"{B}/make_fixes.py").read().split('\nCSS = shell + r"""\n')[0]
g = {"__file__": f"{B}/make_fixes.py"}; argv = sys.argv; sys.argv = ["x", "/dev/null"]; exec(src, g); sys.argv = argv
IC = g["IC"]
IC["users"] = '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M15.5 5.8a3 3 0 0 1 0 5.4M17.5 14.3c1.8.6 3 2.3 3 4.7"/>'
IC["lock"] = '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'
CSS = tl + "\n" + open(f"{B}/nv/nav.css").read() + "\n" + open(f"{M}/dr.css").read()
JS = open(f"{M}/views.js").read()
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
opts = "".join(f'<button data-opt="{k}"{" class=\"is-on\"" if k=="A" else ""}>{n}</button>' for k, n in [("A", "A · One sheet"), ("B", "B · Review list + sheet"), ("C", "C · Whole shop")])
about = [
 ("A · One sheet", "The Timesheet’s paper, for one tech’s day: totals, the day on one line, jobs, every punch in order, checks, signatures. The name picker switches tech or Whole shop."),
 ("B · Review list + sheet", "Same sheet, with the day’s techs on the left — status, flags, Approve the day. Built for the foreman’s morning sign-off. J / K to move."),
 ("C · Whole shop", "Every tech on one page: a line per tech, jobs worked across the shop, everything to look at. Replaces the End-of-day sheet pop-up."),
 ("Print view", "Exactly what prints — no sidebar, no buttons. P toggles it, Esc goes back."),
 ("My pick", "A with C behind the picker — one page, one print button. Add B’s list later if the foreman wants to sign days from here instead of the Timesheet."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Day report mock-up</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Day report — mock-up</h1><div class="wt-ideas wt-demo">{opts}<button data-pvb>Print view</button></div>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Day report<small>Pick A, B or C. Mike’s Thursday; the numbers are made up but add up. Nothing is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
