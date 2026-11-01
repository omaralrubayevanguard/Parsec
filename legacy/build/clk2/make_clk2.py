# Mock-up: the operation clock card, round 2 — 12 more ideas, each live; "Your card" keeps the 10 from round 1
import os, sys, json
T = os.path.dirname(os.path.abspath(__file__)); B = os.path.dirname(T)
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
IC = dict(json.load(open(os.path.join(B, "gptv", "IVI.json"))))
IC.update({"flag": '<path d="M5.5 21V4.5"/><path d="M5.5 4.5h11l-2 4 2 4h-11"/>', "undo": '<path d="M9 7L4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>',
  "expand": '<path d="M14 4.5h5.5V10"/><path d="M19.5 4.5L13.5 10.5"/><path d="M10 19.5H4.5V14"/><path d="M4.5 19.5l6-6"/>',
  "shrink": '<path d="M19.5 10H14V4.5"/><path d="M14 10l6-6"/><path d="M4.5 14H10v5.5"/><path d="M10 14l-6 6"/>',
  "gauge": '<path d="M4.6 17.5a8.5 8.5 0 1 1 14.8 0"/><path d="M12 13.5l3.6-4.1"/><circle cx="12" cy="13.5" r="1.2"/>',
  "similar": '<path d="M4.5 7h9"/><path d="M4.5 12h15"/><path d="M4.5 17h6.5"/>',
  "next": '<path d="M5 12h13"/><path d="M13.5 7l5 5-5 5"/>'})
SEL = open(os.path.join(B, "sel", "sel.css")).read()
PICKS = "\n".join(l for l in SEL.split("\n") if l.startswith(("#picks", ".x{", ".pk-r", ".chips", ".toast", "@keyframes tin")))
CSS = open(os.path.join(B, "sel", "base.css")).read() + "\n" + PICKS + "\n" + open(os.path.join(T, "clk2.css")).read()
JS = "var IC=" + json.dumps(IC) + ";\n" + open(os.path.join(T, "clk2.js")).read()
html = f'''<!doctype html>
<html lang="en" data-th="ivory">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec clock card round 2</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{CSS}</style></head>
<body>
<div class="mk"><h1>{P.LOGO}<span>Parsec · Operation clock</span><small>mock-up · round 2 · 12 ideas</small></h1>
<span class="lb">Clock speed</span><div class="seg" role="group" aria-label="Clock speed"><button data-speed="1">Real time</button><button data-speed="60">×60</button><button data-speed="600">×600</button></div>
<div class="seg" role="group" aria-label="Theme"><button data-th="ivory">Ivory</button><button data-th="graphite">Graphite</button><button data-th="white">White</button><button data-th="black">Near black</button></div>
<button class="btn sm pri" id="pk-open">Your picks</button></div>
<main id="pg"></main>
<div id="picks" hidden></div>
<script>{JS}</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
