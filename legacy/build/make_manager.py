# Manager page mock-up — the same panel as Triage, Foreman, Warranty, Time Log, Parts and Fixes (Parsec design system, Ivory + Graphite).
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app"); M = os.path.join(B, sys.argv[2] if len(sys.argv) > 2 else "mg")
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]
shell = open(f"{B}/_shell.css").read()
tg = open(f"{A}/tg.css").read()
tg = tg.replace(':root:is([data-theme="ivd"],[data-theme="mist"],[data-theme="atd"]) .tg{', ':root[data-theme="dark"] .tg{')
wcss = open(f"{B}/make_warranty.py").read()
wcss = re.search(r'CSS = shell \+ r"""(.*?)"""', wcss, re.S).group(1)
frame = "\n".join(l for l in wcss.split("\n") if l.strip().startswith((".tg-panel", ".tg-rail", ".rl-badge", ".tg .btn", ".tg :focus-visible", ".toast-fm")))
src = open(f"{B}/make_fixes.py").read().split('\nCSS = shell + r"""\n')[0]
g = {"__file__": f"{B}/make_fixes.py"}; argv = sys.argv; sys.argv = ["x", "/dev/null"]; exec(src, g); sys.argv = argv
IC = g["IC"]
IC.update({
 "grid": '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
 "users": '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M15.5 5.8a3 3 0 0 1 0 5.4M17.5 14.3c1.8.6 3 2.3 3 4.7"/>',
 "download": '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14"/>',
 "lock": '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
})
CSS = shell + "\n" + frame + "\n" + open(f"{M}/mg.css").read()
JS = "\n".join(open(f"{M}/{f}").read() for f in ("data.js", "views.js", "views2.js"))
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"flag", "keyTag", "send", "trash", "eye", "pin", "pencil", "inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "grid", "chart", "swap", "users", "history", "dollar", "check", "user", "undo", "clock", "rolist"}
used.discard("rolist")
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("ov", "1 · Overview"), ("per", "2 · Calendar periods"), ("yr", "3 · This year"), ("kpi", "4 · A KPI"), ("day", "5 · Pick a day"), ("edit", "6 · 12 tiles"), ("lock", "7 · Manager only"), ("flow", "8 · Flow"), ("act", "9 · Activity")])
about = [
 ("Calendar periods", "Today, this week or last week, this month or last month, this quarter or last quarter, and this year. The week starts Monday; “this” runs to today and compares with the same days before. It opens on This month."),
 ("The charts follow the calendar", "A week shows Monday to Saturday, a month its days, a quarter its weeks, a year its months — the days still to come sit empty."),
 ("Manager only", "Nobody else can open the page — Team shows it locked for every other role, and the lock by the title says so."),
 ("12 tiles", "The Overview keeps 12 spots. Take one off and its spot waits for another; “The usual 12” puts them back."),
]
TITLE = os.environ.get("MG_TITLE", "Parsec · Manager — first mock-up"); DOC = os.environ.get("MG_DOC", "Parsec Manager mock-up")
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{DOC}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}{TITLE}</h1><div class="wt-ideas wt-demo">{demos}</div>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Manager<small>Try the buttons above, or the keys. Nothing here is saved; the numbers are made up but add up.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
