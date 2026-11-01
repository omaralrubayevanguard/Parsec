# Parsec on the phone — technicians only, on the Parsec 9 design: Work, a job (view, change, attach, status), the clock, Inbox, Fixes.
import os, sys, json
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app")
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]
shell = open(f"{B}/_shell.css").read().split("/* ---------- shell: icon rail + panel ---------- */")[0]
IC = dict(P.ICONS)
IC.update(json.load(open(f"{A}/b9/icons_extra.json")))
IC.update({
 "today": '<rect x="4" y="5" width="16" height="15" rx="2.75"/><path d="M4 9.75h16M8.5 3v4M15.5 3v4"/><circle cx="12" cy="14.75" r="1.25"/>',
 "camera": '<path d="M4.75 8.5A1.75 1.75 0 0 1 6.5 6.75h1.75l1.5-2h4.5l1.5 2h1.75a1.75 1.75 0 0 1 1.75 1.75v9a1.75 1.75 0 0 1-1.75 1.75h-11a1.75 1.75 0 0 1-1.75-1.75z"/><circle cx="12" cy="12.75" r="3.4"/>',
 "mic": '<rect x="9" y="3.75" width="6" height="10.5" rx="3"/><path d="M5.75 11a6.25 6.25 0 0 0 12.5 0M12 17.25v3"/>',
 "chevL": '<path d="M14.5 6.5L9 12l5.5 5.5"/>',
})
CSS = open(f"{B}/ph9/app.css").read()
JS = open(f"{B}/ph9/app.js").read()
import re
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"today", "inbox", "fixes"}
miss = [k for k in used if k not in IC]
assert not miss, miss
JS = JS.replace("__ICO__", json.dumps({k: IC[k] for k in sorted(used)})).replace("__LOGO__", json.dumps(P.LOGO))
about = [
 ("Technicians only", "Signing in as a technician opens the phone view. Three places: Work, Inbox, Fixes. Triage, Foreman, Manager, Parts, the RO list and Settings stay on the computer."),
 ("View and change", "Tap a job: notes (type or talk, Enter adds the time), parts, files, cause and correction. The status chip changes the status."),
 ("Clock", "Clock in on Start of day; Clock out has Lunch, a break, and End of day — which checks what’s still open first."),
 ("Status", "Stop opens the same choices as the computer: Switched job, Waiting – Parts / Approval / Foreman / Tech Support, Complete (needs the correction)."),
 ("Attach", "Camera, photos, scan or a file — filed under Dash pic, Pictures, DTCs or Other, saved with the RO."),
 ("A or B", "A: tabs at the bottom. B: one Work screen, Inbox and Fixes as buttons at the top — more room for jobs."),
 ("Later", "Getting the phone’s changes into the shop folder (sync) comes after you pick the look."),
]
nav = '<div class="wt-ideas"><button class="is-on" data-nav="A">A · Tabs at the bottom</button><button data-nav="B">B · Inbox and Fixes up top</button></div>'
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec phone mock-up</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{shell}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Phone — technicians</h1>{nav}
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="ph-board"></div>
<div class="wt-about"><h2>Phone<small>Every phone works — tap around. Mike’s Friday; nothing is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
