# Mock-up: the RO page opened from the RO list — move, drop and add its blocks; presets; your picks.
import os, sys, json, base64
T = os.path.dirname(os.path.abspath(__file__)); B = os.path.dirname(T)
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
def uri(p): return "data:image/webp;base64," + base64.b64encode(open(p, "rb").read()).decode()
IMG = {"s": uri(os.path.join(B, "vt", "vnr-18-400_s.webp"))}
IC = dict(json.load(open(os.path.join(B, "gptv", "IVI.json"))))
IC.update({
  "camera": '<path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4z"/><circle cx="12" cy="13.2" r="3.3"/>',
  "grip": '<circle cx="9" cy="6.5" r="1.1"/><circle cx="15" cy="6.5" r="1.1"/><circle cx="9" cy="12" r="1.1"/><circle cx="15" cy="12" r="1.1"/><circle cx="9" cy="17.5" r="1.1"/><circle cx="15" cy="17.5" r="1.1"/>',
  "blocks": '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><path d="M16.5 13.5v6M13.5 16.5h6"/>',
  "undo": '<path d="M9 7L4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>'})
CSS = open(os.path.join(T, "base.css")).read() + "\n" + open(os.path.join(T, "rop.css")).read()
JS = "var IMG=" + json.dumps(IMG) + ";var IC=" + json.dumps(IC) + ";\n" + open(os.path.join(T, "rop.js")).read()
def ic(k): return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + IC[k] + '</svg>'
rail = (f'<div class="rl-b">{P.LOGO}Parsec</div>'
  f'<div class="ri">{ic("search")}Search<em>Ctrl K</em></div>'
  '<div class="rclk"><i></i><div><b>On the clock · 6:47</b><small>Not on a job</small></div></div>'
  f'<div class="ri">{ic("inbox")}Inbox<em>19</em></div><div class="ri">{ic("console")}Console</div><div class="ri">{ic("triage")}Triage</div><div class="ri on">{ic("ros")}RO List<em>20</em></div>'
  '<div class="rh">Shop</div>'
  f'<div class="ri">{ic("foreman")}Foreman<em>5</em></div><div class="ri">{ic("warranty")}Warranty<em>40</em></div><div class="ri">{ic("manager")}Manager</div><div class="ri">{ic("parts")}Parts</div>'
  '<div class="rh">You</div>'
  f'<div class="ri">{ic("timelog")}Time Log</div><div class="ri">{ic("fixes")}Fixes</div><div class="ri">{ic("career")}Career</div>')
html = f'''<!doctype html>
<html lang="en" data-th="ivory">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec RO page</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{CSS}</style></head>
<body>
<div class="mk"><h1>{P.LOGO}<span>Parsec · RO page</span><small>mock-up</small></h1>
<span class="lb">Start from</span><div class="seg" role="group" aria-label="Start from"><button data-pre="today">As today</button><button data-pre="work">Work first</button><button data-pre="three">Three columns</button><button data-pre="desk">Writer’s desk</button></div>
<span class="lb">Open operation</span><div class="seg" role="group" aria-label="An open operation shows"><button data-opv="tabs">Tabs</button><button data-opv="together">All together</button></div>
<span class="lb">Truck</span><div class="seg" role="group" aria-label="Truck picture"><button data-pic="big">Big</button><button data-pic="small">Small</button><button data-pic="off">Off</button></div>
<div class="seg" role="group" aria-label="Theme"><button data-th="ivory">Ivory</button><button data-th="graphite">Graphite</button><button data-th="white">White</button><button data-th="black">Near black</button></div>
<button class="tg" id="edt" aria-pressed="true"><i></i>Arrange</button>
<button class="btn sm" id="und" title="Undo (Ctrl Z)">{ic("undo")}Undo</button>
<button class="btn sm" id="blk-open" aria-pressed="false">{ic("blocks")}Blocks</button>
<button class="btn sm pri" id="pk-open">Your picks</button></div>
<div class="app"><nav class="rail" aria-label="Pages">{rail}</nav><main class="pg" id="pg"></main></div>
<div id="drw"></div><div id="picks" hidden></div>
<script>{JS}</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
