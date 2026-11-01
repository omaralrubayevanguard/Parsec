# Mock-up: the Technician page — a technician's repair orders (working, assigned, waiting, done), with the
# actions carried over from Console, the RO page, Triage/Foreman, Parts, Fixes and Parsec 10. Three layouts.
import os, sys, json, base64
T = os.path.dirname(os.path.abspath(__file__)); B = os.path.dirname(T)
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
def uri(p): return "data:image/webp;base64," + base64.b64encode(open(p, "rb").read()).decode()
PICS = ["vnl-18-760", "vnr-18-300", "vnl-25-860", "vnl-03-670", "vhd-21-300", "vnl-18-740", "vnr-18-640", "vnl-18-300", "vnr-26-640", "vnm-430", "vah-21-300", "vnl-03-780"]
IMG = {k: {"s": uri(os.path.join(B, "vt", k + "_s.webp")), "t": uri(os.path.join(B, "vt", k + "_t.webp"))} for k in PICS}
IVI = json.load(open(os.path.join(B, "gptv", "IVI.json")))
IC = dict(IVI)
IC.update({
  "camera": '<path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4z"/><circle cx="12" cy="13.2" r="3.3"/>',
  "arrow": '<path d="M5 12h13M13 7l5 5-5 5"/>',
  "wrench": '<path d="M14.7 6.3a4 4 0 0 0-5.2 5.2l-5 5a1.8 1.8 0 0 0 2.5 2.5l5-5a4 4 0 0 0 5.2-5.2l-2.4 2.4-2.3-.3-.3-2.3z"/>',
  "undo": '<path d="M9 7L4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>',
  "tech": '<circle cx="9" cy="7.5" r="3.2"/><path d="M3.5 19.5c.6-3.4 2.8-5.3 5.5-5.3 1.2 0 2.3.3 3.2 1"/><path d="M17.9 12.2a2.7 2.7 0 0 0-3.4 3.4l-2.7 2.7a1.2 1.2 0 0 0 1.7 1.7l2.7-2.7a2.7 2.7 0 0 0 3.4-3.4l-1.4 1.4-1.4-.2-.2-1.4z"/>'})
CSS = open(os.path.join(T, "tech.css")).read()
JS = "var IMG=" + json.dumps(IMG) + ";var IC=" + json.dumps(IC) + ";\n" + open(os.path.join(T, "tech.js")).read()
def ic(k): return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + IC[k] + '</svg>'
rail = (f'<div class="rl-b">{P.LOGO}Parsec</div>'
  f'<div class="ri">{ic("search")}Search<em>Ctrl K</em></div>'
  '<div class="rclk"><i></i><div><b>On the clock · 6:47</b><small>RO-37590 · Op 1</small></div></div>'
  f'<div class="ri">{ic("inbox")}Inbox<em>4</em></div>'
  f'<div class="ri on new">{ic("tech")}Technician</div>'
  f'<div class="ri">{ic("console")}Console</div>'
  f'<div class="ri">{ic("ros")}RO List</div>'
  '<div class="rh">You</div>'
  f'<div class="ri">{ic("timelog")}Time Log</div><div class="ri">{ic("fixes")}Fixes</div><div class="ri">{ic("career")}Career</div>'
  '<div class="rsep"></div><div class="rh">Foreman and manager also see</div>'
  f'<div class="ri">{ic("triage")}Triage</div><div class="ri">{ic("foreman")}Foreman</div><div class="ri">{ic("manager")}Manager</div>')
html = f'''<!doctype html>
<html lang="en" data-th="ivory">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Technician page</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{CSS}</style></head>
<body>
<div class="mk"><h1>{P.LOGO}<span>Parsec · Technician</span><small>mock-up</small></h1>
<span class="lb">Layout</span><div class="seg" role="group" aria-label="Layout"><button data-lay="lanes">Lanes</button><button data-lay="list">List + RO</button><button data-lay="today">Today first</button></div>
<span class="lb">View as</span><div class="seg" role="group" aria-label="View as"><button data-view="tech">Mike · tech</button><button data-view="fore">Frank · foreman</button></div>
<div class="seg" role="group" aria-label="Theme"><button data-th="ivory">Ivory</button><button data-th="graphite">Graphite</button><button data-th="white">White</button><button data-th="black">Near black</button></div>
<button class="tg" id="srct" aria-pressed="false"><i></i>Where it comes from</button>
<button class="btn sm pri" id="pk-open">Your picks</button></div>
<div class="app"><nav class="rail" aria-label="Pages">{rail}</nav><main class="pg" id="pg"></main></div>
<div id="picks" hidden></div>
<script>{JS}</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
