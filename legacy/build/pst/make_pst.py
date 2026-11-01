# Mock-up: parts stages on the Parts page and the Foreman page (the RO's stage is its furthest-behind part)
import os, sys, json
T = os.path.dirname(os.path.abspath(__file__)); B = os.path.dirname(T)
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
IC = dict(json.load(open(os.path.join(B, "gptv", "IVI.json"))))
SEL = open(os.path.join(B, "sel", "sel.css")).read()
PICKS = "\n".join(l for l in SEL.split("\n") if l.startswith(("#picks", ".x{", ".pk-r", ".toast", "@keyframes tin")))
CSS = open(os.path.join(B, "sel", "base.css")).read() + "\n" + PICKS + "\n" + open(os.path.join(T, "pst.css")).read()
JS = "var IC=" + json.dumps(IC) + ";\n" + open(os.path.join(T, "pst.js")).read()
html = f'''<!doctype html>
<html lang="en" data-th="ivory">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec parts stages</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{CSS}</style></head>
<body>
<div class="mk"><h1>{P.LOGO}<span>Parsec · Parts stages</span><small>mock-up</small></h1>
<div class="seg" role="group" aria-label="Page"><button data-page="parts">Parts page</button><button data-page="fm">Foreman page</button></div>
<div class="seg" role="group" aria-label="Width"><button data-dev="desk">Desktop</button><button data-dev="phone">Phone</button></div>
<div class="seg" role="group" aria-label="Theme"><button data-th="ivory">Ivory</button><button data-th="graphite">Graphite</button><button data-th="white">White</button><button data-th="black">Near black</button></div>
<button class="btn sm pri" id="pk-open">Your picks</button></div>
<main id="pg"></main>
<div id="picks" hidden></div>
<script>{JS}</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
