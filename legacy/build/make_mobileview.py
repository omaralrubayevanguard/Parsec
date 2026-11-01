# Mock-up: the whole Parsec site in a phone view — one file, one set of data, switched in Appearance › Screen.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app")
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]
shell = open(f"{B}/_shell.css").read().split("/* ---------- shell: icon rail + panel ---------- */")[0]
IC = dict(P.ICONS); IC.update(json.load(open(f"{A}/b9/icons_extra.json")))
IC.update({"today": '<rect x="4" y="5" width="16" height="15" rx="2.75"/><path d="M4 9.75h16M8.5 3v4M15.5 3v4"/><circle cx="12" cy="14.75" r="1.25"/>',
 "camera": '<path d="M4.75 8.5A1.75 1.75 0 0 1 6.5 6.75h1.75l1.5-2h4.5l1.5 2h1.75a1.75 1.75 0 0 1 1.75 1.75v9a1.75 1.75 0 0 1-1.75 1.75h-11a1.75 1.75 0 0 1-1.75-1.75z"/><circle cx="12" cy="12.75" r="3.4"/>',
 "chevL": '<path d="M14.5 6.5L9 12l5.5 5.5"/>'})
CSS = open(f"{B}/ph9/app.css").read() + "\n" + open(f"{B}/mv/mv.css").read()
JS = open(f"{B}/mv/mv.js").read()
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | set(re.findall(r"\['[a-z]+', '([a-zA-Z]+)', '[A-Z][a-z]+'", JS)) | {"console", "triage", "list", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "inbox"}
miss = [k for k in used if k not in IC]; assert not miss, miss
JS = JS.replace("__ICO__", json.dumps({k: IC[k] for k in sorted(used)})).replace("__LOGO__", json.dumps(P.LOGO))
about = [("One file, one set of data", "The phone view is a layout of the same Parsec, not a second app. Same pages, same buttons, same rules — only the arrangement changes."),
 ("Switch", "Your initials › Appearance › Screen: Automatic, Computer or Phone. Saved per device, so the shop PC stays the computer view."),
 ("Every page", "Lists stay lists; tap a row to open it full screen. Side panels become sheets from the bottom. Tables become rows. Charts go full width. Tabs inside a page scroll sideways."),
 ("A or B", "A: your four pages in a bar at the bottom, the rest under More. B: a menu button (☰) top left that slides out the same side menu as the computer — more room for the page."),
 ("The data", "One file on one web address gives one place to open it. The data is shared only once your database is in. Until then a phone keeps its own copy (phones can’t open the shop folder) and QR sync carries a technician’s work.")]
nav = '<div class="wt-ideas"><button class="is-on" data-nav="A">A · Tabs at the bottom</button><button data-nav="B">B · Menu button</button></div>'
html = f'''<!doctype html>
<html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec phone view mock-up</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{shell}
{CSS}</style></head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Phone view of the whole site</h1>{nav}
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="ph-board mv-board"></div>
<div class="wt-about"><h2>Phone view<small>A look, not working — pick A or B.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
