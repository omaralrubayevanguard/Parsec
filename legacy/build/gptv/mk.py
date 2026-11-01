# Build the review mock-up of ChatGPT's Parsec changes into one self-contained HTML file.
import os, sys, json, base64
G = os.path.dirname(os.path.abspath(__file__)); B = os.path.dirname(G); S = os.path.dirname(B)
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
def uri(p): return "data:image/webp;base64," + base64.b64encode(open(p, "rb").read()).decode()
prof = json.load(open(f"{G}/profiles.json"))
img = {p["id"]: {"s": uri(f"{G}/web/{p['id']}_s.webp"), "t": uri(f"{G}/web/{p['id']}_t.webp")} for p in prof}
old = uri(f"{B}/gpt/out/vnl4_860.webp")
big = uri(f"{S}/gptv/cells/vnl-25-860_side.webp")
keep = ["id", "family", "cab", "label", "from", "to", "review", "reviewYears", "body"]
prof = [{k: p[k] for k in keep} for p in prof]
VV = json.load(open(f"{G}/VV.json")); IVI = json.load(open(f"{G}/IVI.json"))
CSS = open(f"{G}/m.css").read() + "\n" + open(f"{G}/m2.css").read()
DATA = "var IMG=" + json.dumps(img) + ";var OLD=" + json.dumps(old) + ";var BIG=" + json.dumps(big) + ";var PROF=" + json.dumps(prof) + ";var VV=" + json.dumps(VV) + ";var IVI=" + json.dumps(IVI) + ";"
JS = "(function(){\n" + DATA + "\n" + "\n".join(open(f"{G}/{f}").read() for f in ["m1.js", "m2.js", "m3.js", "m4.js"]) + "\n})();"
html = f'''<!doctype html>
<html lang="en" data-th="white">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>ChatGPT's Parsec changes</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{CSS}</style></head>
<body>
<div class="bar"><h1>{P.LOGO}<span>Parsec</span><small>ChatGPT's changes · review</small></h1>
<div class="seg" id="th" role="group" aria-label="Theme"><button type="button" data-v="white" aria-pressed="true">White</button><button type="button" data-v="black" aria-pressed="false">Near black</button><span class="k">now</span><button type="button" data-v="ivory" aria-pressed="false">Ivory</button><button type="button" data-v="graphite" aria-pressed="false">Graphite</button></div>
<button type="button" class="tg" id="mo" aria-pressed="true"><i></i>Motion</button><button type="button" class="tg" id="sl" aria-pressed="false"><i></i>Slow ×2.5</button></div>
<div class="wrap"><nav class="nav" id="nav" aria-label="Changes"></nav><main class="main" id="main"></main><aside class="side" id="side" aria-label="Your pick"></aside></div>
<script>{JS}</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
