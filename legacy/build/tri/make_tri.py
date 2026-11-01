# Mock-up: Triage — transfer (department → employee → why → back by), the road test and the truck checks
import os, sys, json, base64
T = os.path.dirname(os.path.abspath(__file__)); B = os.path.dirname(T)
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
def uri(p): return "data:image/webp;base64," + base64.b64encode(open(p, "rb").read()).decode()
IMG = {"a": uri(os.path.join(B, "vt", "vnl-18-760_s.webp")), "b": uri(os.path.join(B, "vt", "vnr-18-640_s.webp")), "c": uri(os.path.join(B, "vt", "vhd-21-300_s.webp"))}
IC = dict(json.load(open(os.path.join(B, "gptv", "IVI.json"))))
IC.update({
  "road": '<path d="M8 3.5 5 20.5M16 3.5l3 17"/><path d="M12 4v2.5M12 10.5v3M12 17.5V20"/>',
  "flag": '<path d="M5.5 21V4.5"/><path d="M5.5 4.5h11l-2 4 2 4h-11"/>',
  "grid": '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  "pin": '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  "users": '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.5-3.3 2.6-5.2 5.5-5.2s5 1.9 5.5 5.2"/><path d="M15.5 5.2a3 3 0 0 1 0 5.6M17.5 14.2c1.7.7 2.8 2.4 3 4.8"/>',
  "info": '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  "undo": '<path d="M9 7L4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>'})
SEL = open(os.path.join(B, "sel", "sel.css")).read()
PICKS = "\n".join(l for l in SEL.split("\n") if l.startswith(("#picks", ".x{", ".pk-r", ".chips", ".toast", "@keyframes tin")))
CSS = open(os.path.join(B, "sel", "base.css")).read() + "\n" + PICKS + "\n" + open(os.path.join(T, "tri.css")).read()
JS = "var IMG=" + json.dumps(IMG) + ";var IC=" + json.dumps(IC) + ";\n" + open(os.path.join(T, "tri.js")).read()
html = f'''<!doctype html>
<html lang="en" data-th="ivory">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Triage transfer</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{CSS}</style></head>
<body>
<div class="mk"><h1>{P.LOGO}<span>Parsec · Triage</span><small>mock-up</small></h1>
<span class="lb">Show</span><div class="seg" role="group" aria-label="Which flow"><button data-flow="xfer">Transfer</button><button data-flow="road">Road test</button><button data-flow="qc">Truck checks</button></div>
<div class="seg" role="group" aria-label="Theme"><button data-th="ivory">Ivory</button><button data-th="graphite">Graphite</button><button data-th="white">White</button><button data-th="black">Near black</button></div>
<button class="btn sm pri" id="pk-open">Your picks</button></div>
<main id="pg"></main>
<div id="picks" hidden></div>
<script>{JS}</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
