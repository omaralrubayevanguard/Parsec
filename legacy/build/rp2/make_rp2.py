# Mock-up: the RO page — Time tab colors and edits in place, icons, the operation header, tab actions, theme switch, sample trucks
import os, sys, json, base64, io
from PIL import Image
T = os.path.dirname(os.path.abspath(__file__)); B = os.path.dirname(T)
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
def uri(p, w=None):
    if not w: return "data:image/webp;base64," + base64.b64encode(open(p, "rb").read()).decode()
    im = Image.open(p); h = round(im.size[1] * w / im.size[0]); im = im.resize((w, h), Image.LANCZOS); b = io.BytesIO(); im.save(b, "WEBP", quality=82)
    return "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode()
V = lambda n: os.path.join(B, "vt", n + "_s.webp")
IMG = {"band": uri(V("vnl-18-760"))}
for k, f in {"vnl760": "vnl-18-760", "vnr640": "vnr-18-640", "vhd300": "vhd-21-300", "vnl670": "vnl-03-670", "vnl300": "vnl-18-300", "vnl860": "vnl-18-860",
             "vnl640n": "vnl-25-640", "vnr300": "vnr-18-300", "vnl780": "vnl-03-780", "vah400": "vah-21-400"}.items():
    IMG[k] = uri(V(f), 184)
IC = dict(json.load(open(os.path.join(B, "gptv", "IVI.json"))))
IC.update({
  "road": '<path d="M8 3.5 5 20.5M16 3.5l3 17"/><path d="M12 4v2.5M12 10.5v3M12 17.5V20"/>',
  "box": '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
  "scan": '<path d="M7 3.5H5.5a2 2 0 0 0-2 2V7M17 3.5h1.5a2 2 0 0 1 2 2V7M7 20.5H5.5a2 2 0 0 1-2-2V17M17 20.5h1.5a2 2 0 0 0 2-2V17"/><path d="M8 9h8M8 12h8M8 15h5"/>',
  "upload": '<path d="M12 15.5V4.5M7.5 9 12 4.5 16.5 9"/><path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/>',
  "camera": '<path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4z"/><circle cx="12" cy="13.2" r="3.3"/>',
  "paste": '<rect x="6" y="5" width="12" height="15.5" rx="2"/><path d="M9.5 5V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1"/><path d="M9 11h6M9 14.5h4"/>',
  "clockPlus": '<path d="M20 12a8 8 0 1 1-6.2-7.8"/><path d="M12 8v4l2.5 1.5"/><path d="M18.5 3v5M16 5.5h5"/>',
  "notePlus": '<path d="M13.5 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h12a1.5 1.5 0 0 0 1.5-1.5v-7.5"/><path d="M8 10h5M8 13.5h7"/><path d="M18 3v5M15.5 5.5h5"/>',
  "sunO": '<circle cx="12" cy="12" r="3.6"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6"/>',
  "moonF": '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" fill="currentColor"/>',
  "undo": '<path d="M9 7L4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>'})
SEL = open(os.path.join(B, "sel", "sel.css")).read()
PICKS = "\n".join(l for l in SEL.split("\n") if l.startswith(("#picks", ".x{", ".pk-r", ".chips", ".toast", "@keyframes tin")))
CSS = open(os.path.join(B, "sel", "base.css")).read() + "\n" + PICKS + "\n" + open(os.path.join(T, "rp2.css")).read()
JS = "var IMG=" + json.dumps(IMG) + ";var IC=" + json.dumps(IC) + ";var LOGO=" + json.dumps(P.LOGO) + ";\n" + open(os.path.join(T, "rp2.js")).read()
html = f'''<!doctype html>
<html lang="en" data-th="ivory">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec RO page changes</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{CSS}</style></head>
<body>
<div class="mk"><h1>{P.LOGO}<span>Parsec · RO page</span><small>mock-up</small></h1>
<span class="lb">Show</span><div class="seg" role="group" aria-label="Show"><button data-view="ro">RO page</button><button data-view="smp">Sample trucks</button></div>
<div class="seg" role="group" aria-label="Theme"><button data-th="ivory">Ivory</button><button data-th="graphite">Graphite</button><button data-th="white">White</button><button data-th="black">Near black</button></div>
<button class="btn sm pri" id="pk-open">Your picks</button></div>
<main id="pg"></main>
<div id="picks" hidden></div>
<script>{JS}</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
