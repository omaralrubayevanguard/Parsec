# Inbox mock-up — notifications for the one person signed in, on the same panel as the other pages.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app"); M = os.path.join(B, "ib")
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
IC["lock"] = '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'
CSS = shell + "\n" + frame + "\n" + open(f"{M}/ib.css").read()
JS = open(f"{M}/data.js").read() + "\n" + open(f"{M}/views.js").read()
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "check", "clock", "send", "chevR", "history", "x", "info", "sun", "moon", "exit", "phone", "lock", "play", "bell"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("thread", "1 · One thread per RO"), ("snz", "2 · Snooze until"), ("clear", "3 · Clears itself"), ("late", "4 · Reminder, then backup"), ("away", "5 · Away"), ("sent", "6 · Seen"), ("sum", "7 · Morning summary"), ("phone", "8 · Phone"), ("bulk", "9 · Pick several"), ("eos", "10 · End of shift"), ("try", "Try it")])
roles = "".join(f'<button data-role="{k}"{" class=\"is-on\"" if k=="FD" else ""}>{n}</button>' for k, n in [("MR","Technician"),("FD","Foreman"),("AM","Service writer"),("BO","Parts"),("GP","Warranty"),("RH","Manager")])
about = [
 ("1 · One thread per RO", "Everything about the same truck is one row with its count; the detail shows each one with its own actions."),
 ("2 · Snooze until", "A time, or until the parts arrive, the customer replies or the RO moves — then it comes back on top."),
 ("3 · Clears itself", "Do it on its own page and the inbox item closes on its own — Done shows “cleared itself”."),
 ("4 · Reminder, then backup", "An ask past its hold goal reminds you, then goes to your backup too (Frank → Mike, lead tech)."),
 ("5 · Away", "Pick who covers your asks and until when; they show up in the cover’s inbox under “Covering for”."),
 ("6 · Seen", "Sent shows what you handed off — sent, seen, done — with Nudge when it isn’t seen."),
 ("7 · Morning summary", "At clock-in, here and on the phone: what needs you, what’s due, clocks still running, what was passed on."),
 ("8 · Phone", "Asks buzz the phone; FYIs wait. Asks can’t be turned off. Quiet after 6 pm."),
 ("9 · Pick several", "Pick rows (X) and clear them at once — done, snooze or read."),
 ("10 · End of shift", "Pass what’s still open to the next person, with a note that lands in their morning summary."),
 ("Kept personal", "Only what’s sent to you; shop-wide activity stays on the Activity log. Every item opens its RO — or its page."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Inbox mock-up v2</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Inbox — mock-up v2</h1><div class="wt-ideas wt-demo">{demos}</div>
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
