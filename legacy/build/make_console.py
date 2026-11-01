# Console page mock-up — your day on the shared panel.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app"); M = os.path.join(B, "cx")
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
IC["qr"] = '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2M16 16h2v2"/>'
IC["mic"] = '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V20.5"/>'
IC["camera"] = '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/>'
IC["tv"] = '<rect x="3.5" y="5" width="17" height="11.5" rx="2"/><path d="M8.5 20h7M12 16.5V20"/>'
IC["pause"] = '<path d="M9 6v12M15 6v12"/>'
IC["lock"] = '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'
CSS = shell + "\n" + frame + "\n" + open(f"{B}/mg/mg.css").read() + "\n" + open(f"{B}/mgi/ideas.css").read() + "\n" + open(f"{B}/ib/ib.css").read() + "\n" + open(f"{B}/cr/cr.css").read() + "\n" + open(f"{M}/cx.css").read()
JS = open(f"{M}/data.js").read() + "\n" + open(f"{M}/views.js").read()
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "gear2", "check", "clock", "chevR", "chevD", "x", "info", "grid", "flag", "undo", "play", "stop", "swap", "spark", "pencil", "plus", "chat", "link", "qr", "mic", "camera", "tv", "pause", "pin", "file", "send"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("morning", "1 · Start my day"), ("arrive", "2 · Parts arrived"), ("nudge", "3 · Air-time nudge"), ("eod", "4 · End of day"), ("scan", "5 · Scan to switch"), ("ask", "6 · Ask Frank"), ("photos", "7 · Photos & codes"), ("dict", "8 · Dictate a note"), ("tv", "9 · Shop display"), ("bring", "10 · Bring it in"), ("paused", "Paused stays on top"), ("today", "Your day"), ("fm", "Foreman")])
roles = "".join(f'<button data-role="{k}"{" class=\"is-on\"" if k=="MR" else ""}>{n}</button>' for k, n in [("MR","Mike"),("FD","Frank"),("RH","Ray")])
about = [
 ("1 · Start my day", "Before clocking in: Frank’s order, parts staged overnight, trucks in your bays, what’s waiting, the Inbox. One button clocks you in and opens #1."),
 ("2 · Parts arrived", "When Ben stages the part, the job comes off Waiting by itself, lands in Next with a “back” tag, and the Inbox pings you."),
 ("3 · Air-time nudge", "Ten minutes not on a job and a quiet bar offers the next one — or shop time."),
 ("4 · End of day", "Clock out → End of day: today’s numbers and jobs, what’s left on the running job for tomorrow, and the bulletins — core returns, keys, truck locations."),
 ("5 · Scan to switch", "Scan the job jacket’s QR and the clock switches to it. Or type the RO."),
 ("6 · Ask Frank", "From the job: second opinion, a hand, a short quote, a parts question. It lands in his Needs action; your clock can keep running."),
 ("7 · Photos & codes", "Dash picture, pictures and DTC files on the job — the RO bulletins without opening the RO."),
 ("8 · Dictate a note", "The mic in Work performed; Enter saves it with the time."),
 ("9 · Shop display", "Shop tab → Display mode: big team row and ROs by stage, for the TV on the floor."),
 ("10 · Bring it in", "Every queued job shows where the truck is. Bring it in asks Triage, and the job shows it’s on the way."),
 ("Paused stays on top", "Stop a job before it’s done and it sits at the top of Next, marked paused, with Resume."),
 ("One clock light", "The rail light is the only other clock: green on a job, teal on air, purple on shop time, grey when out. Hover it for the time."),
 ("Each role has a home", "Frank lands on Foreman, Ray on Manager — the Console’s Shop tab is a click away. Techs keep both tabs."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Console mock-up v2</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Console — mock-up v2</h1><div class="wt-ideas wt-demo">{demos}</div>
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
