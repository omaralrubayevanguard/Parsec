# Console page mock-up — your day on the shared panel.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app"); M = os.path.join(B, "cx_v1")
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
CSS = shell + "\n" + frame + "\n" + open(f"{B}/mg/mg.css").read() + "\n" + open(f"{B}/mgi/ideas.css").read() + "\n" + open(f"{B}/ib/ib.css").read() + "\n" + open(f"{B}/cr/cr.css").read() + "\n" + open(f"{M}/cx.css").read()
JS = open(f"{M}/data.js").read() + "\n" + open(f"{M}/views.js").read()
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "gear2", "check", "clock", "chevR", "chevD", "x", "info", "grid", "flag", "undo", "play", "stop", "swap", "spark", "pencil", "plus", "chat", "link"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("today", "1 · Your day"), ("next", "2 · Next in Frank’s order"), ("wait", "3 · Waiting on parts"), ("fix", "4 · A past fix"), ("staged", "5 · Parts staged"), ("day", "6 · Time Log bar"), ("chk", "7 · To fix in the Time Log"), ("air", "8 · Not on a job"), ("out", "9 · Clock out"), ("shop", "10 · Shop"), ("fm", "11 · Foreman")])
roles = "".join(f'<button data-role="{k}"{" class=\"is-on\"" if k=="MR" else ""}>{n}</button>' for k, n in [("MR","Mike"),("FD","Frank"),("RH","Ray")])
about = [
 ("Same panel as the other pages", "Header facts, view tabs (Today · Shop), your work on the left and the job on the right, keys, toasts with Undo."),
 ("Your work", "One list: the job you’re on, Frank’s order for today, what’s waiting and why, what you finished — replaces the Punch On deck, the order card and the second timer card."),
 ("The job card", "Quoted against burnt with the notch at the quote and the overrun in the severity color, Remaining in h:mm — the RO page rules. Hold, Switch, Stop and Done right there."),
 ("Waiting says why and who", "Parts, approval, tech support or a second opinion — with the person who has it and how long. Ask them in one click, the way Triage and Foreman hand things off."),
 ("Parts statuses", "Ordered, Staged at the counter, Picked up — from the Parts page. Picked up tells Ben."),
 ("Use fix", "A matching past fix shows on the job, and only goes in when you press Use fix — the Fixes rule."),
 ("Your day", "The Time Log bar — on a job, air, shop time, lunch, the shift end and now — with today’s hours sold against your goal (Career) and anything to fix in the Time Log."),
 ("Shop", "The team right now and every open RO by stage, Mine or All. Frank and Ray land here; the Foreman and Manager pages stay where the real work is."),
 ("What went away", "The greeting, the bento cards, the calendar, the truck pictures and Recent changes. Reminders like the backup go to the Inbox."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Console mock-up</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Console — first mock-up</h1><div class="wt-ideas wt-demo">{demos}</div>
<span class="wt-role">View as<span class="px-seg">{roles}</span></span>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Console<small>Try the buttons above, or the keys. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
