# Mock-up: a picture of the truck wherever the RO number and customer show (RO page, RO list, Foreman, phone).
import os, sys, json, re, base64
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app"); M = os.path.join(B, "trk")
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]
shell = open(f"{B}/_shell.css").read().split("/* ---------- shell: icon rail + panel ---------- */")[0]
IC = dict(P.ICONS); IC.update(json.load(open(f"{A}/b9/icons_extra.json")))
IC.setdefault("chevL", '<path d="M14.5 6.5L9 12l5.5 5.5"/>')
JS = open(f"{M}/trk.js").read()
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | set(re.findall(r"\['([a-z]+)', '[A-Z][a-z]+'\]", JS))
miss = [k for k in used if k not in IC]; assert not miss, miss
img = {}
for k in ["side_white", "side_gray", "side_blue", "side_red", "top_white", "top_gray", "top_blue", "top_red"]:
    img[k] = "data:image/png;base64," + base64.b64encode(open(f"{M}/web_{k}.png", "rb").read()).decode()
JS = JS.replace("__IMG__", json.dumps(img)).replace("__ICO__", json.dumps({k: IC[k] for k in sorted(used)})).replace("__LOGO__", json.dumps(P.LOGO))
CSS = open(f"{M}/trk.css").read()
lay = "".join(f'<button data-lay="{k}">{n}</button>' for k, n in [("A", "A · Beside the name"), ("B", "B · Banner"), ("C", "C · In the side panel")])
pic = "".join(f'<button data-pic="{k}">{n}</button>' for k, n in [("model", "Model picture"), ("photo", "Check-in photo")])
about = [
 ("How it picks", "From the VIN: year and model (VNL 760, VNR 300, Mack Pinnacle …), sleeper or day cab, and the unit’s color when it’s set at check-in. It’s there the moment the RO is made."),
 ("Model picture", "One picture per model and color, kept with Parsec. The shop supplies them — from Volvo’s dealer media or your own photos — so the pictures are ones you’re allowed to use."),
 ("Check-in photo", "Triage takes a side photo of the actual truck at check-in (next to the dash picture). It replaces the model picture on that RO — dents, decals and all."),
 ("No picture yet", "A plain outline of a truck until a picture for that model is added."),
 ("Where", "RO page header, RO list, Triage and Foreman rows, the Foreman floor (from above, in its bay), Console, and the phone view."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec truck pictures mock-up</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{shell}
{CSS}</style></head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · The truck in the RO</h1><div class="wt-ideas">{lay}</div><div class="wt-ideas">{pic}</div>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="rt-board">
<section class="rt-sec"><h2><i>1</i>The RO page<small>pick A, B or C at the top</small></h2><div id="s1"></div></section>
<section class="rt-sec"><h2><i>2</i>A model with no picture yet<small>the outline until one is added</small></h2><div id="s1b"></div></section>
<section class="rt-sec"><h2><i>3</i>RO list<small>a small picture in every row</small></h2><div id="s2"></div></section>
<section class="rt-sec"><h2><i>4</i>Foreman<small>rows with the truck · the floor with each truck in its bay, from above</small></h2><div id="s3"></div></section>
<section class="rt-sec"><h2><i>5</i>Phone view<small>the RO and the RO list</small></h2><div id="s4"></div></section>
</div>
<div class="wt-about"><h2>Truck pictures<small>Sample ROs, made-up numbers. The pictures are the ones you sent.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
