# Builds Parsec Mobile 3: one self-contained HTML file, plus a folder to drop on Netlify (index.html, manifest, sw.js, icons).
import os, sys, json, re, shutil
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app")
sys.path.insert(0, B); sys.path.insert(0, os.path.join(B, "mobile"))
import parts as P
from PIL import Image, ImageDraw
import io
OUT_HTML, OUT_DIR = sys.argv[1], sys.argv[2]
IC = dict(P.ICONS)
IC.update(json.load(open(f"{A}/b9/icons_extra.json")))
IC.update({
 "today": '<rect x="4" y="5" width="16" height="15" rx="2.75"/><path d="M4 9.75h16M8.5 3v4M15.5 3v4"/><circle cx="12" cy="14.75" r="1.25"/>',
 "camera": '<path d="M4.75 8.5A1.75 1.75 0 0 1 6.5 6.75h1.75l1.5-2h4.5l1.5 2h1.75a1.75 1.75 0 0 1 1.75 1.75v9a1.75 1.75 0 0 1-1.75 1.75h-11a1.75 1.75 0 0 1-1.75-1.75z"/><circle cx="12" cy="12.75" r="3.4"/>',
 "mic": '<rect x="9" y="3.75" width="6" height="10.5" rx="3"/><path d="M5.75 11a6.25 6.25 0 0 0 12.5 0M12 17.25v3"/>',
 "chevL": '<path d="M14.5 6.5L9 12l5.5 5.5"/>',
 "sync": '<path d="M4 7.5h3.5M4 4v3.5M4.75 7.5A8 8 0 0 1 19.6 9.5M20 16.5h-3.5M20 20v-3.5M19.25 16.5A8 8 0 0 1 4.4 14.5"/>',
 "scan": '<path d="M4 8.5V6a2 2 0 0 1 2-2h2.5M15.5 4H18a2 2 0 0 1 2 2v2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5M8.5 20H6a2 2 0 0 1-2-2v-2.5M7.5 12h9"/>',
})
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]
css = open(f"{B}/pm3/base.css").read() + "\n" + open(f"{B}/pm3/app.css").read()
JS = open(f"{B}/pm3/app.js").read()
TQPJS = open(f"{A}/b9/tqp.js").read()
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | set(re.findall(r"\['(?:work|inbox|fixes)', '([A-Za-z0-9]+)'", JS))
miss = [k for k in used if k not in IC]
assert not miss, miss
JS = JS.replace("__ICO__", json.dumps({k: IC[k] for k in sorted(used)})).replace("__LOGO__", json.dumps(P.LOGO))
JS = JS.replace("'use strict';", "'use strict';\n" + TQPJS, 1)
qr = open(f"{B}/mobile/lib/qrcode.js").read(); jq = open(f"{B}/mobile/lib/jsqr.js").read()
for lib in (qr, jq, JS): assert "</script" not in lib.lower()

def icon_png(size, bg=(21, 21, 20), dot=(244, 241, 234), outer=(150, 145, 136), core=(34, 197, 94), pad=0.2):
    S = size * 4; im = Image.new("RGB", (S, S), bg); d = ImageDraw.Draw(im)
    scale = S * (1 - 2 * pad) / 220; cx = cy = S / 2
    def c(x, y, r, col): d.ellipse([cx + (x - r) * scale, cy + (y - r) * scale, cx + (x + r) * scale, cy + (y + r) * scale], fill=col)
    for x, y in [(44, 0), (-44, 0), (22, 38), (-22, 38), (22, -38), (-22, -38)]: c(x, y, 9.5, dot)
    for x, y in [(0, -84), (0, 84), (73, 42), (-73, 42), (73, -42), (-73, -42)]: c(x, y, 7, outer)
    c(0, 0, 14, core)
    im = im.resize((size, size), Image.LANCZOS); b = io.BytesIO(); im.save(b, "PNG", optimize=True); return b.getvalue()
import base64
touch = base64.b64encode(icon_png(180, pad=0.18)).decode()
fav = ('data:image/svg+xml,' + "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-110 -110 220 220'%3E%3Crect x='-110' y='-110' width='220' height='220' rx='48' fill='%23151514'/%3E"
       "%3Cg fill='%23F4F1EA'%3E%3Ccircle cx='44' r='11'/%3E%3Ccircle cx='-44' r='11'/%3E%3Ccircle cx='22' cy='38' r='11'/%3E%3Ccircle cx='-22' cy='38' r='11'/%3E%3Ccircle cx='22' cy='-38' r='11'/%3E%3Ccircle cx='-22' cy='-38' r='11'/%3E%3C/g%3E%3Ccircle r='16' fill='%2322c55e'/%3E%3C/svg%3E")
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#FBFAF7">
<meta name="color-scheme" content="light dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Parsec">
<meta name="format-detection" content="telephone=no">
<title>Parsec Mobile</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="{fav}">
<link rel="apple-touch-icon" href="data:image/png;base64,{touch}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>
{tok}
{bun}
{css}
</style>
</head>
<body>
<div id="app" class="ph"></div>
<div id="toast" class="pm-tw" aria-live="polite"></div>
<input type="file" id="filein" accept="image/*" class="sr" aria-hidden="true" tabindex="-1">
<script>{qr}</script>
<script>{jq}</script>
<script>{JS}</script>
</body>
</html>'''
open(OUT_HTML, "w", encoding="utf-8").write(html)
if os.path.isdir(OUT_DIR): shutil.rmtree(OUT_DIR)
os.makedirs(OUT_DIR)
open(os.path.join(OUT_DIR, "index.html"), "w", encoding="utf-8").write(html)
for n, px in (("icon-192.png", 192), ("icon-512.png", 512), ("apple-touch-icon.png", 180)):
    open(os.path.join(OUT_DIR, n), "wb").write(icon_png(px, pad=0.18))
open(os.path.join(OUT_DIR, "icon-maskable-512.png"), "wb").write(icon_png(512, pad=0.28))
manifest = {"name": "Parsec Mobile", "short_name": "Parsec", "description": "Your jobs, the clock, notes, parts and photos — syncs with Parsec on the computer by QR codes.",
            "start_url": "./index.html", "scope": "./", "display": "standalone", "orientation": "portrait", "background_color": "#FBFAF7", "theme_color": "#FBFAF7",
            "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
                      {"src": "icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}
open(os.path.join(OUT_DIR, "manifest.webmanifest"), "w").write(json.dumps(manifest, indent=1))
open(os.path.join(OUT_DIR, "sw.js"), "w").write('''/* Parsec Mobile — keeps the app on the phone so it opens with no signal. Bump the version to ship an update. */
const CACHE = 'parsec-mobile-3.0';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== location.origin && !fonts) return;
  /* the page itself: the network first so an update shows up, the saved copy when there is no signal */
  if (req.mode === 'navigate') { e.respondWith(fetch(req).then(res => { const c2 = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', c2)); return res; }).catch(() => caches.match('./index.html'))); return; }
  e.respondWith(caches.open(CACHE).then(c => c.match(req, { ignoreSearch: true }).then(hit => {
    const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })));
});
''')
open(os.path.join(OUT_DIR, "README.txt"), "w").write('''Parsec Mobile 3 — the phone app for technicians

Putting it on Netlify (about two minutes, no installs):
1. Go to app.netlify.com/drop and drag THIS WHOLE FOLDER onto the page.
2. Netlify gives you an address like https://something.netlify.app — open it on the phone.
   (You can rename it under Site settings, e.g. parsec-yourshop.netlify.app.)
3. iPhone: Share > Add to Home Screen.  Android: the menu > Install app.
4. Open it from the home screen. It works with no signal after the first open.

What stays where: nothing in this folder talks to a server. Jobs, time and photos live on the phone
and move to the computer only by QR codes (Settings > Parsec Mobile on the computer).
The camera only starts on an https address, which is why it needs Netlify (or another https host).

To update later: drag the new folder onto the same site (Deploys > drag and drop).
The phone picks it up the next time it opens with signal.
''')
print("wrote", OUT_HTML, os.path.getsize(OUT_HTML) // 1024, "KB and", OUT_DIR)
