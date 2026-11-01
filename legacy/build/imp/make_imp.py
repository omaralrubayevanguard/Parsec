# Mock-up: the New RO import from ASIST — the plan (text and screenshots in, every field merged each time)
import os, sys, json
T = os.path.dirname(os.path.abspath(__file__)); B = os.path.dirname(T)
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
IC = dict(json.load(open(os.path.join(B, "gptv", "IVI.json"))))
IC.update({
  "image": '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="M4 17l4.5-4 3.5 3 3-2.5 5 4"/>',
  "doc": '<path d="M7 3.5h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"/><path d="M14 3.5v4h4M9 12h6M9 15.5h6"/>',
  "lock": '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  "tech": '<circle cx="9" cy="7.5" r="3.2"/><path d="M3.5 19.5c.6-3.4 2.8-5.3 5.5-5.3 1.2 0 2.3.3 3.2 1"/><path d="M17.9 12.2a2.7 2.7 0 0 0-3.4 3.4l-2.7 2.7a1.2 1.2 0 0 0 1.7 1.7l2.7-2.7a2.7 2.7 0 0 0 3.4-3.4l-1.4 1.4-1.4-.2-.2-1.4z"/>'})
SEL = open(os.path.join(B, "sel", "sel.css")).read()
PICKS = "\n".join(l for l in SEL.split("\n") if l.startswith(("#picks", ".x{", ".pk-r", ".chips", ".toast", "@keyframes tin")) or l.startswith("#picks[hidden]"))
CSS = open(os.path.join(B, "sel", "base.css")).read() + "\n" + PICKS + "\n" + open(os.path.join(T, "imp.css")).read()
JS = "var IC=" + json.dumps(IC) + ";\n" + open(os.path.join(T, "imp.js")).read()
html = f'''<!doctype html>
<html lang="en" data-th="ivory">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec New RO import</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{CSS}</style></head>
<body>
<div class="mk"><h1>{P.LOGO}<span>Parsec · New RO import</span><small>plan · mock-up</small></h1>
<span class="lb">Show</span><div class="seg" role="group" aria-label="Which import"><button data-run="1">First import · new RO</button><button data-run="2">Next import · ASIST changed</button></div>
<div class="seg" role="group" aria-label="Theme"><button data-th="ivory">Ivory</button><button data-th="graphite">Graphite</button><button data-th="white">White</button><button data-th="black">Near black</button></div>
<button class="btn sm pri" id="pk-open">Your picks</button></div>
<main id="pg"></main>
<div id="picks" hidden></div>
<script>{JS}</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
