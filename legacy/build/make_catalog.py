# Mock-up: the Volvo truck catalog — every model, generation and configuration, a drawing per configuration,
# the shop's own photos where it has them. Built on the Parsec design tokens like the other mock-ups.
import os, sys, json, base64
B = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(B, "trk"); C = os.path.join(B, "cat")
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]
shell = open(f"{B}/_shell.css").read().split("/* ---------- shell: icon rail + panel ---------- */")[0]
img = {k: "data:image/webp;base64," + base64.b64encode(open(f"{M}/web_{k}.webp", "rb").read()).decode() for k in ["side_white", "side_gray", "side_blue", "side_red"]}
GP = os.path.join(B, "gpt", "out")
for f in sorted(os.listdir(GP)):
    if f.endswith(".webp") and not f.startswith("top_"): img[f[:-5]] = "data:image/webp;base64," + base64.b64encode(open(os.path.join(GP, f), "rb").read()).decode()
JS = open(f"{C}/draw.js").read().replace("if(typeof module !== 'undefined') module.exports = { truckSVG: truckSVG };", "") + "\n" + open(f"{C}/cat.js").read().replace("__IMG__", json.dumps(img))
CSS = open(f"{C}/cat.css").read()
fams = ["VNL", "VNR", "VNX", "VHD", "VAH", "VNM", "VT"]
famb = '<button class="is-on" data-fam-set="all">All</button>' + "".join(f'<button data-fam-set="{k}">{k}</button>' for k in fams)
about = [
 ("The pictures", "Cut out from the screenshots you sent, background removed so they sit on the page in both themes. They're small in the screenshots, so they look soft when shown big. The original files from ChatGPT would be sharper."),
 ("Still drawn", "Nine have no picture yet: VN 420 and VN 770, VNL 440 Electric, the first VNX 300 and 430, the first VHD 300, and the three all-new VNX models. They show a plain drawing of the configuration until a picture is added."),
 ("Your photos", "Your own photos stay on VNL 760, VNL 860 and VNR 300 (Other picture shows the new one). Your red photo is the picture for any VHD that has no closer match."),
 ("In Parsec", "Parsec 9.9 carries every picture here: the RO header, RO list, Search, Foreman and Triage, the bays and notes on the truck. Each one is in Your data › Truck pictures, where you can replace or remove it."),
 ("Matching", "Parsec matches the RO's model (VNL 760) and gets the year from the VIN. The full model code (VNL64T760) also tells the axles and the front axle. Try one at the top."),
 ("Trims and axles", "Trims on the new VNL (Core, Edge, Edge Black, Ultimate) change the finish, not the shape. Axle, front-axle and truck/tractor choices show on the drawing. One picture per model is enough."),
 ("What's in it", "Volvo Trucks North America from 1996 to today: VNL, VNR, VNX, VHD, VAH, VNM and VT. Sources are Volvo and the trade press, October 2026. A ? means it isn't confirmed."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Volvo truck catalog</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{shell}
{CSS}</style></head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Volvo truck catalog</h1><div class="cx-fam">{famb}</div><button class="cx-tg" id="need" aria-pressed="false">Needs a picture</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="cx-top"><div class="cx-sum" id="sum"></div><div class="cx-dec"><label for="dec">Model code</label><input id="dec" placeholder="VNL64T760" autocomplete="off" spellcheck="false"><div class="cx-decr" id="decr"></div></div></div>
<main id="cat"></main>
<div class="wt-about"><h2>Truck catalog<small>Every Volvo model, generation and configuration that comes through the shop, and the picture each one needs.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
