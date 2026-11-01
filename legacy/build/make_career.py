# Career page mock-up — one technician’s own numbers, on the Manager engine and the shared panel.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app"); M = os.path.join(B, "cr")
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
IC["download"] = '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14"/>'
IC["lock"] = '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'
CSS = shell + "\n" + frame + "\n" + open(f"{B}/mg/mg.css").read() + "\n" + open(f"{B}/mgi/ideas.css").read() + "\n" + open(f"{B}/ib/ib.css").read() + "\n" + open(f"{M}/cr.css").read()
D0 = open(f"{B}/mg/data.js").read()
def rp(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
D0 = rp(D0, "/* who clocked what, day by day", "/* Andre started in August 2026 — his work before that was Luis’s */\nconst TSTART={AW:'2026-08-03'}; ROS.forEach(r=>{ r.ops.forEach(o=>{ if(TSTART[o.tech]&&r.close<TSTART[o.tech]) o.tech='LM'; }); if(TSTART[r.tech]&&r.close<TSTART[r.tech]) r.tech='LM'; });\n/* each tech has a job or two where the quote runs tight for them, and one where it’s easy */\nconst QB={MR:{rep:{11:1.34,5:1.24},pm:.9},DK:{rep:{2:1.26},war:{1:1.26}},AW:{rep:{2:1.3,8:1.22},war:{1:1.3}},KT:{rep:{6:1.22},war:{4:1.22}}};\nROS.forEach(r=>{ r.ops.forEach((o,i)=>{ const B_=QB[o.tech]; if(!B_) return; let f=1; if(o.t==='rep'||o.t==='war'){ const j=(+r.no*7+i*3)%(o.t==='rep'?12:5), M_=B_[o.t]; if(M_&&M_[j]) f=M_[j]; } else if(o.t==='pm'&&B_.pm) f=B_.pm; if(f!==1) o.b=Math.max(.2,Math.round(o.b*f*10)/10); }); r.b=Math.round(r.ops.reduce((s,o)=>s+o.b,0)*10)/10; });\n/* who clocked what, day by day")
D0 = rp(D0, "4.5):0); });", "4.5):0); if(TSTART[t]&&k<TSTART[t]) ATT[t][k]=0; });")
JS = D0 + "\n" + open(f"{M}/views.js").read()
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "check", "clock", "send", "chevR", "history", "x", "info", "grid", "flag", "print", "chevD", "spark", "undo", "play", "timelog", "fixes", "lock", "download", "eye", "bell", "bulb", "book", "plus", "pencil", "file", "user", "chat", "send"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("why", "1 · Why it moved"), ("quote", "2 · Quote feedback"), ("best", "3 · Your bests"), ("ly", "4 · Same days last year"), ("notes", "5 · Coaching notes"), ("skills", "6 · Skills & training"), ("fixw", "7 · Fixes you wrote"), ("pay", "8 · Pay estimate"), ("alerts", "9 · Goal alerts"), ("stmt", "10 · Statement"), ("priv", "Who sees this"), ("prior", "Earlier years"), ("new", "A new tech")])
roles = "".join(f'<button data-role="{k}"{" class=\"is-on\"" if k=="MR" else ""}>{n}</button>' for k, n in [("MR","Mike"),("DK","Dana"),("AW","Andre"),("KT","Kevin")])
about = [
 ("1 · Why it moved", "Next to the efficiency chart: what each kind of job added to the change, in points (or hours sold), and the one job that did the most — it opens in Work."),
 ("2 · Quote feedback", "Growth tab. Your time against the quote, job by job, this year — each dot a job. Where quotes run tight, Tell Frank sends it to him with the numbers."),
 ("3 · Your bests", "Best week, most hours in a week, best month, weeks in a row at goal, days without a comeback — with this week and month underneath."),
 ("4 · Same days last year", "Compare with the period before or the same days last year. Tiles, the chart and Why it moved all follow. C switches it."),
 ("5 · Coaching notes", "From Frank, dated, with his goal and how you’re tracking. Got it lets him know you saw it; Reply goes to his Inbox."),
 ("6 · Skills & training", "Certificates with expiry, what’s in progress, the next class. Frank uses it when he hands out work."),
 ("7 · Fixes you wrote", "Each fix you wrote in Fixes — who used it, how often it held, the hours it saved others."),
 ("8 · Pay estimate", "Flat rate for this pay period: flagged so far, the rest at your pace, and at your goal. Amounts stay hidden until you show them."),
 ("9 · Goal alerts", "Under your goals: an Inbox note when you fall behind pace, a Friday recap, a new best. Only you get them."),
 ("10 · Statement", "One printable page — your numbers, month by month, bests, certificates, fixes. Never pay or coaching notes."),
 ("Who sees this", "The Private chip in the header: you and Ray see everything, Frank sees all but pay, other techs see nothing."),
 ("Earlier years", "Add your years before Parsec from old time sheets. They show as “by hand” next to Parsec’s numbers — switch between the two."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Career mock-up v2</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Career — mock-up v2</h1><div class="wt-ideas wt-demo">{demos}</div>
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
