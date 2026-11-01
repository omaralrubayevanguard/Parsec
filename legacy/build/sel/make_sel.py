# Mock-up: picking several operations, or several parts on one, and acting on them together (the Technician page's RO).
import os, sys, json, base64
T = os.path.dirname(os.path.abspath(__file__)); B = os.path.dirname(T)
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
def uri(p): return "data:image/webp;base64," + base64.b64encode(open(p, "rb").read()).decode()
IMG = {"s": uri(os.path.join(B, "vt", "vnl-18-760_s.webp"))}
IC = dict(json.load(open(os.path.join(B, "gptv", "IVI.json"))))
IC.update({
  "wrench": '<path d="M14.7 6.3a4 4 0 0 0-5.2 5.2l-5 5a1.8 1.8 0 0 0 2.5 2.5l5-5a4 4 0 0 0 5.2-5.2l-2.4 2.4-2.3-.3-.3-2.3z"/>',
  "undo": '<path d="M9 7L4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>',
  "tech": '<circle cx="9" cy="7.5" r="3.2"/><path d="M3.5 19.5c.6-3.4 2.8-5.3 5.5-5.3 1.2 0 2.3.3 3.2 1"/><path d="M17.9 12.2a2.7 2.7 0 0 0-3.4 3.4l-2.7 2.7a1.2 1.2 0 0 0 1.7 1.7l2.7-2.7a2.7 2.7 0 0 0 3.4-3.4l-1.4 1.4-1.4-.2-.2-1.4z"/>'})
CSS = open(os.path.join(T, "base.css")).read() + "\n" + open(os.path.join(T, "sel.css")).read()
JS = "var IMG=" + json.dumps(IMG) + ";var IC=" + json.dumps(IC) + ";\n" + open(os.path.join(T, "sel.js")).read()
def ic(k): return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + IC[k] + '</svg>'
rail = (f'<div class="rl-b">{P.LOGO}Parsec</div><div class="ri">{ic("search")}Search<em>Ctrl K</em></div>'
  '<div class="rclk"><i></i><div><b>On the clock · 6:47</b><small>RO-37590 · Op 1</small></div></div>'
  f'<div class="ri">{ic("inbox")}Inbox<em>4</em></div><div class="ri on">{ic("tech")}Technician</div><div class="ri">{ic("ros")}RO List</div>'
  '<div class="rh">You</div>'
  f'<div class="ri">{ic("timelog")}Time Log</div><div class="ri">{ic("fixes")}Fixes</div><div class="ri">{ic("career")}Career</div>')
html = f'''<!doctype html>
<html lang="en" data-th="ivory">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec selecting</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{CSS}</style></head>
<body>
<div class="mk"><h1>{P.LOGO}<span>Parsec · Selecting</span><small>mock-up</small></h1>
<span class="lb">How you pick</span><div class="seg" role="group" aria-label="How you pick"><button data-how="box">Boxes</button><button data-how="mode">Select button</button><button data-how="hover">On hover</button></div>
<span class="lb">Actions</span><div class="seg" role="group" aria-label="Where the actions go"><button data-bar="bottom">Bottom bar</button><button data-bar="head">In the header</button><button data-bar="menu">One menu</button></div>
<span class="lb">Parts</span><div class="seg" role="group" aria-label="Parts reach"><button data-reach="op">One operation</button><button data-reach="ro">Across the RO</button></div>
<span class="lb">Keys</span><div class="seg" role="group" aria-label="Keys"><button data-keys="true">On</button><button data-keys="false">Off</button></div>
<div class="seg" role="group" aria-label="Theme"><button data-th="ivory">Ivory</button><button data-th="graphite">Graphite</button><button data-th="white">White</button><button data-th="black">Near black</button></div>
<button class="btn sm pri" id="pk-open">Your picks</button></div>
<div class="app"><nav class="rail" aria-label="Pages">{rail}</nav><main class="pg" id="pg"></main></div>
<div id="picks" hidden></div>
<script>{JS}</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
