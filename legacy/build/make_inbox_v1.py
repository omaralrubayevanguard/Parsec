# Inbox mock-up — notifications for the one person signed in, on the same panel as the other pages.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app"); M = os.path.join(B, "ib_v1")
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
CSS = shell + "\n" + frame + "\n" + open(f"{M}/ib.css").read()
JS = open(f"{M}/data.js").read() + "\n" + open(f"{M}/views.js").read()
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "check", "clock", "send", "chevR", "history", "x", "info"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("inbox", "1 · Inbox"), ("pick", "2 · Send to a tech"), ("ask", "3 · Reply"), ("snz", "4 · Snooze"), ("done", "5 · Done"), ("set", "6 · What reaches you"), ("tech", "7 · A tech’s inbox"), ("writer", "8 · A writer’s"), ("mgr", "9 · The manager’s")])
roles = "".join(f'<button data-role="{k}"{" class=\"is-on\"" if k=="FD" else ""}>{n}</button>' for k, n in [("MR","Technician"),("FD","Foreman"),("AM","Service writer"),("BO","Parts"),("GP","Warranty"),("RH","Manager")])
about = [
 ("Only what’s yours", "Hand-offs to you, asks, @ mentions and reminders — for the person signed in. View as shows six people’s inboxes."),
 ("Same panel as the other pages", "Header facts, view tabs (Inbox · Snoozed · Done), the list on the left, the detail on the right, popovers, Undo, keys."),
 ("Needs you first", "Asks and mentions sit on top; the rest is grouped by day. Unread is bold with a dot."),
 ("Do it from here", "Send to a tech, approve, order, sign off, reply — without opening the page it came from. The RO is one click away."),
 ("Snooze, done, undo", "Snooze to a time, mark done (E), and Undo either. Done keeps a week."),
 ("What reaches you", "Per page: phone and inbox, inbox only, or off. Hand-offs and asks always reach you. Quiet after 6 pm."),
 ("Replaces the bell", "The warnings and reminders in the bell today come here as Reminders — clocks left running, parts past ETA, no punch in days."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Inbox mock-up</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Inbox — first mock-up</h1><div class="wt-ideas wt-demo">{demos}</div>
<span class="wt-role">View as<span class="px-seg">{roles}</span></span>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Inbox<small>Try the buttons above, or the keys. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
