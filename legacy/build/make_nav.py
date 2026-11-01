# Nav bar + Profile mock-up — the rail lined up, and a profile that holds sign in/out, theme and settings.
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
IC["chevUD"] = '<path d="m8 9.5 4-4 4 4M8 14.5l4 4 4-4"/>'
IC["lock"] = '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'
CSS = shell + "\n" + frame + "\n" + open(f"{B}/mg/mg.css").read() + "\n" + open(f"{B}/mgi/ideas.css").read() + "\n" + open(f"{B}/ib/ib.css").read() + "\n" + open(f"{B}/cr/cr.css").read() + "\n" + open(f"{M}/cx.css").read() + "\n" + open(f"{B}/nv/nav.css").read()
import base64
BI = base64.b64encode(open(f"{B}/nv/before_icons.png","rb").read()).decode(); BO = base64.b64encode(open(f"{B}/nv/before_open.png","rb").read()).decode()
JS = open(f"{M}/data.js").read() + "\n" + open(f"{M}/views.js").read() + "\n" + f'const BEFORE_ICONS="data:image/png;base64,{BI}", BEFORE_OPEN="data:image/png;base64,{BO}";\n' + open(f"{B}/nv/nav.js").read()
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "gear2", "check", "clock", "chevR", "chevD", "x", "info", "grid", "flag", "undo", "play", "stop", "swap", "spark", "pencil", "plus", "chat", "link", "qr", "mic", "camera", "tv", "pause", "pin", "file", "send", "chevUD", "sun", "moon", "save", "keyTag", "exit", "bolt", "lock", "user"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-ndemo="{k}">{n}</button>' for k, n in [("rail", "1 · Lined up"), ("open", "2 · Sidebar open"), ("clk", "3 · The clock"), ("me", "4 · Profile menu"), ("page", "5 · Profile page"), ("theme", "6 · Theme"), ("sign", "7 · Sign in & out"), ("out", "8 · Logged out"), ("below", "Option · below the clock"), ("before", "Before"), ("ray", "Admin (Ray)")])
roles = "".join(f'<button data-role="{k}"{" class=\"is-on\"" if k=="MR" else ""}>{n}</button>' for k, n in [("MR","Mike"),("RH","Ray")])
seg = lambda lab, key, opts: f'<span class="wt-role">{lab}<span class="px-seg">' + "".join(f'<button data-nv="{key}:{v}">{n}</button>' for v, n in opts) + '</span></span>'
tog = seg("Sidebar", "open", [("false","Icons"),("true","Open")]) + seg("Profile", "pos", [("bottom","At the bottom"),("clock","Below the clock")]) + seg("Guides", "guides", [("false","Off"),("true","On")]) + seg("Nav bar", "before", [("true","Today"),("false","New")])
about = [
 ("One axis", "Every icon sits in the same 36 × 36 box, centered on one line down the rail — logo, search, clock, pages and you. Nothing is boxed differently, nothing is offset."),
 ("Nothing moves when it opens", "Group labels and the short dividers take the same 24 px, the clock and you take 44 px either way — open the sidebar and the icons stay exactly where they were."),
 ("The clock", "One light: green on a job, teal on air, purple on shop time, grey when out. Open, it reads On the clock · 6:47 and the job underneath. Click it for Stop, Lunch, End of day."),
 ("You, at the bottom", "Recommended: the avatar where the gear was — your tools at the top, you at the bottom, where Claude and Linear keep it. The gear goes away. Below the clock is the other option, in the toolbar."),
 ("Profile menu", "Theme and size right there, then Settings, Your data, Keyboard shortcuts, Switch user and Log out. The backup warning rides on the avatar."),
 ("Profile page", "You, Sign in & out, Appearance, Your data, Work tools, Shortcuts — and Admin for Ray. Everything the settings menu held, with room to read."),
 ("Log out ≠ clock out", "Logging out leaves your clock running and says so. Optional: log out when you clock out for the day, lock after 15 minutes, a PIN."),
 ("Moved out of settings", "New repair order goes to the RO List header, Triage check-in and Ctrl K."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Nav bar and Profile mock-up</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Nav bar &amp; Profile — mock-up</h1><div class="wt-ideas wt-demo">{demos}</div>
{tog}<span class="wt-role">View as<span class="px-seg">{roles}</span></span>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Nav bar &amp; Profile<small>Try the buttons above, or the keys. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
