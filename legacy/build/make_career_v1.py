# Career page mock-up — one technician’s own numbers, on the Manager engine and the shared panel.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app"); M = os.path.join(B, "cr_v1")
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
IC["grid"] = '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'
IC["lock"] = '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'
CSS = shell + "\n" + frame + "\n" + open(f"{B}/mg/mg.css").read() + "\n" + open(f"{B}/mgi/ideas.css").read() + "\n" + open(f"{B}/ib/ib.css").read() + "\n" + open(f"{M}/cr.css").read()
D0 = open(f"{B}/mg/data.js").read()
def rp(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
D0 = rp(D0, "/* who clocked what, day by day", "/* Andre started in August 2026 — his work before that was Luis’s */\nconst TSTART={AW:'2026-08-03'}; ROS.forEach(r=>{ r.ops.forEach(o=>{ if(TSTART[o.tech]&&r.close<TSTART[o.tech]) o.tech='LM'; }); if(TSTART[r.tech]&&r.close<TSTART[r.tech]) r.tech='LM'; });\n/* who clocked what, day by day")
D0 = rp(D0, "4.5):0); });", "4.5):0); if(TSTART[t]&&k<TSTART[t]) ATT[t][k]=0; });")
JS = D0 + "\n" + open(f"{M}/views.js").read()
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "check", "clock", "send", "chevR", "history", "x", "info", "grid", "flag", "print", "chevD", "spark", "undo", "play", "timelog", "fixes"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("ov", "1 · Overview"), ("per", "2 · Calendar periods"), ("yr", "3 · This year"), ("all", "4 · All time"), ("work", "5 · Work"), ("over", "6 · A job that ran over"), ("chk", "7 · To fix in the Time Log"), ("new", "8 · A new tech")])
roles = "".join(f'<button data-role="{k}"{" class=\"is-on\"" if k=="MR" else ""}>{n}</button>' for k, n in [("MR","Mike"),("DK","Dana"),("AW","Andre"),("KT","Kevin")])
about = [
 ("Same panel as the other pages", "Header facts, view tabs (Overview · Work), the calendar period picker, the list on the left and the RO on the right, keys."),
 ("Career totals", "ROs worked, hours sold, hours clocked, over quote, efficiency and days worked — all time, since Parsec started."),
 ("This period against your goals", "Efficiency, productivity, hours sold, unapplied, over quote, comebacks, past fixes used — with the goals Ray set and the shop average."),
 ("Calendar periods", "Today, this or last week, month and quarter, this year — and All time. The same as the Manager page."),
 ("Work", "Every RO with your time on it; each operation as a job card — the efficiency bar with the notch at the quote, the overrun in the severity color, days worked."),
 ("To fix in the Time Log", "Clocks left running and punches with no job — your numbers leave them out until they’re fixed."),
 ("Only yours", "Each tech sees their own Career. View as switches between four techs."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Career mock-up</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Career — first mock-up</h1><div class="wt-ideas wt-demo">{demos}</div>
<span class="wt-role">View as<span class="px-seg">{roles}</span></span>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Career<small>Try the buttons above, or the keys. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
