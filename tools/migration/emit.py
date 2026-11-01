# Parsec 17 migration · step 2: write the organized source tree from the pieces extract.js took apart.
#   python3 emit.py <workdir> <repo root>
# What it decides is in MAP (the main closure, by statement index or "name:fn"), INNER (inside each page
# closure), CSS_PIECES (the v190pg style block, by the piece each patch appended) and JC_CSS banners.
# The load order of every statement is kept exactly: files are cut at statement boundaries and the manifest
# lists them in the order they had. Nothing is reworded here; comments travel with the statement they precede.
import os, sys, json, re, base64, subprocess
W, R = sys.argv[1], sys.argv[2]
st = json.load(open(os.path.join(W, "stmts.json")))
js = open(os.path.join(W, "app.js"), encoding="utf-8").read()
head = open(os.path.join(W, "head.txt"), encoding="utf-8").read()
tail = open(os.path.join(W, "tail.txt"), encoding="utf-8").read()

def put(rel, text):
    p = os.path.join(R, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(text)

# ======================================================================= the main closure → files
# (start, path): a file starts at this statement and runs to the next start. "name:X" = the statement declaring X.
# A path ending in "/" is a page closure split by INNER[name]; the statement must be that closure.
MAP = [
    (1, "kit/tooltip-words.js"), (4, "kit/px-kit.js"),
    (17, "import/new-ro/"), (18, "import/extract-operations.js"),
    (27, "kit/status-look.js"), (38, "kit/tooltip-texts.js"),
    (63, "ro-page/clock-card-model.js"), (107, "ro-page/clock-card-draw.js"), (171, "ro-page/clock-card-actions.js"),
    (192, "pages/parts/stages.js"), (227, "clock/change-running-clock.js"),
    (243, "shell/lists-fold.js"), (262, "shell/page-search.js"),
    (279, "ro/toasts-and-spots.js"), (287, "ro/road-test-and-release.js"), (301, "ro/flow-gates.js"), (326, "ro/details-table.js"), (343, "ro/truck-card-words.js"),
    (362, "ro-page/one-ro-view.js"),
    (368, "clock/day-clock-watch.js"), (402, "pages/technician/completed-list.js"), (407, "clock/lunch-reminder.js"), (414, "clock/reminders-only.js"),
    (429, "data/clean.js"), (448, "data/photo-shrink.js"), (450, "pages/frame.js"), (452, "data/folder-gate.js"),
    (461, "pages/shop-data.js"),
    (463, "pages/technician/"), (464, "pages/inbox/"), (465, "pages/timelog/"), (466, "pages/timelog/view.js"),
    (467, "pages/parts/"), (468, "pages/fixes/"), (469, "pages/fixes/view.js"), (470, "pages/career/"), (471, "pages/career/view.js"),
    (472, "pages/manager/"), (473, "pages/manager/view.js"), (474, "pages/rolist/"), (475, "pages/rolist/view.js"), (476, "pages/rolist/embed.js"),
    (486, "pages/report/"), (487, "pages/report/view.js"),
    (488, "sample/history.js"), (489, "phone/sync-v2.js"), (495, "phone/phone-view.js"),
    (519, "trucks/picture-data.js"), (525, "trucks/matching.js"), (563, "trucks/peek.js"), (573, "trucks/ask-once.js"), (584, "trucks/banner-and-menu.js"),
    (599, "trucks/truck-and-photos.js"), (610, "trucks/catalog-window.js"), (615, "trucks/notes-on-truck.js"),
    (628, "shell/motion.js"), (636, "pages/foreman/floor-extras.js"), (657, "pages/foreman/quick-peek.js"), (668, "pages/foreman/shift-handover.js"),
    (677, "pages/inventory/"), (678, "pages/inventory/view.js"), (679, "pages/assets/sample-fleet.js"), (681, "pages/assets/"), (682, "pages/assets/view.js"), (685, "access/admin-helpers.js"), (691, "access/admin-page/"), (692, "access/admin-page/view.js"),
    (693, "shell/nav-rail.js"), (707, "shell/rail-popovers.js"), (714, "kit/tooltip-engine.js"),
    (718, "data/store-helpers.js"), (727, "data/backups.js"), (743, "data/export.js"), (773, "data/import-export.js"),
    (794, "access/sign-in.js"), (810, "access/login-page.js"), (813, "access/pin-pad.js"), (823, "access/lock-screen.js"), (833, "access/idle-and-end-of-day.js"),
    (841, "shell/key-sheet.js"),
    (844, "settings/settings-page.js"), (863, "settings/registry.js"), (867, "import/contact-reading.js"), (881, "settings/shop-buttons.js"),
    (901, "settings/values-and-changes.js"), (932, "settings/draw-and-actions.js"),
    (952, "kit/icons.js"), (960, "kit/constants.js"), (975, "state/state.js"),
    (979, "state/folder-fs.js"), (985, "state/folder-layout.js"), (1023, "state/ro-page-file.js"), (1028, "state/migrate-to-parsec-data.js"),
    (1029, "data/store-topics.js"), (1063, "data/store-records.js"), (1080, "data/store-read-write.js"), (1092, "data/store-merge.js"), (1104, "data/store-save-open.js"), (1124, "data/store-api.js"),
    (1165, "kit/formatters.js"), (1174, "ro/lookups.js"), (1192, "clock/punch-owners.js"), (1210, "ro/derived-calcs.js"), (1231, "ro/forecast.js"),
    (1246, "import/case-import.js"), (1278, "import/screenshot-reader.js"), (1308, "ro/reopen-question.js"), (1322, "access/guards.js"),
    (1346, "ro/task-bulletins.js"), (1362, "ro/warnings.js"), (1372, "ro/actions.js"),
    (1397, "automations/watcher.js"), (1417, "automations/rules.js"), (1435, "automations/built-ins.js"), (1500, "automations/sentence-builder.js"),
    (1562, "state/drafts.js"), (1579, "state/undo.js"), (1581, "state/data-safety.js"), (1608, "ro/ordering.js"),
    (1616, "shell/design-system.js"), (1641, "access/portraits.js"), (1653, "clock/quick-time-adjust.js"), (1670, "clock/air-and-lunch-blocks.js"),
    (1685, "access/people-and-demo-team.js"), (1735, "kit/legacy-helpers.js"), (1743, "clock/move-time.js"), ("name:modalHtml", "shell/modals.js"),
    (1771, "sample/sample-data.js"), (1780, "shell/render-root.js"), (1784, "shell/ro-rail.js"),
    (1830, "ro/stages.js"), (1837, "ro/assist.js"), (1847, "ro/route.js"), (1870, "ro/transfers.js"),
    (1906, "shell/device-mode.js"), (1912, "kit/icons-3d.js"),
    (1940, "pages/warranty/claims-model.js"), (1967, "pages/warranty/model.js"), (2061, "pages/warranty/page.js"), (2081, "pages/warranty/popovers.js"), (2095, "pages/warranty/actions.js"),
    (2146, "pages/fixes/common-fixes.js"), (2155, "phone/phone-sync.js"), (2171, "shell/day-ribbon.js"),
    (2173, "pages/shared-yard.js"), (2198, "pages/foreman/model.js"), (2294, "pages/foreman/page.js"), (2328, "pages/foreman/popovers.js"), (2346, "pages/foreman/actions.js"),
    (2377, "pages/triage/yard-map.js"), (2395, "pages/triage/model.js"), (2465, "pages/triage/page.js"), (2482, "pages/triage/transfer-roadtest-checks.js"),
    (2535, "kit/colors.js"), (2541, "sample/sample-trucks.js"), ("name:tgPopHtml", "pages/triage/popovers.js"), (2551, "pages/triage/actions.js"),
    (2586, "pages/rolist/page-base.js"), (2604, "access/permissions.js"), (2619, "access/pins.js"),
    (2658, "pages/inventory/model.js"), (2696, "clock/day-clock.js"), (2710, "shell/event-wiring.js"), (2726, "shell/live-time.js"),
    (2732, "ro-page/_css.js"), (2733, "ro-page/job-road.js"), (2754, "ro-page/icons.js"), (2756, "ro-page/"), (2757, "shell/header-shrink.js"), (2761, "boot/dev-tools.js"),
    (2766, "boot/init.js"),
]
INNER = {
    "IMPX": [(0, "read-text.js"), (65, "matching.js"), (75, "fields.js"), (103, "create.js"), (106, "dialog.js"), (129, "open.js")],
    "CX": [(0, "console-model.js"), (33, "console-draw.js"), (53, "technician-page.js"), (100, "picking-and-yard.js"), (131, "actions.js")],
    "IB": [(0, "model.js"), (46, "draw.js"), (65, "actions.js")],
    "TL": [(0, "model.js"), (64, "draw.js"), (89, "popovers.js"), (105, "fixes.js"), (119, "actions.js")],
    "PT": [(0, "model.js"), (73, "draw.js"), (103, "popovers.js"), (108, "actions.js")],
    "FX": [(0, "model.js"), (46, "draw.js"), (65, "actions.js")],
    "CR": [(0, "engine.js"), (62, "model.js"), (111, "draw.js"), (140, "actions.js")],
    "MG": [(0, "engine.js"), (67, "model.js"), (99, "draw.js"), (123, "actions.js"), (131, "ideas.js")],
    "RL": [(0, "model.js"), (27, "columns.js")],
    "DR": [(0, "day-report.js")],
    "INVPG": [(0, "page-model.js"), (27, "draw.js"), (50, "actions.js")],
    "ASPG": [(0, "assets-page.js")],
    "ADMPG": [(0, "admin-page.js")],
    "JC": [(0, "constants.js"), (9, "helpers.js"), (37, "state.js"), (71, "builders.js"), (95, "render-header.js"), (103, "bulletins.js"), (141, "task-bar.js"),
           (151, "job-cards.js"), (180, "extract-operations.js"), (197, "open-operation.js"), (222, "summary-and-selection.js"), (258, "page-helpers.js"),
           (295, "fault-codes.js"), (314, "totals.js"), (319, "toolbar.js"), (336, "attachments-view.js"), (358, "modal-export-print.js"), (375, "render.js"),
           (394, "ivory.js"), (398, "px-components.js"), (433, "header-page.js"), (457, "layout.js"), (482, "release-bypass.js"), (490, "declined.js"),
           (503, "time-tab.js"), (529, "tab-actions.js"), (536, "operation-header.js"), (546, "picking.js"), (570, "build-and-fold.js"), (576, "collapse-expand.js")],
}
by_name = {}
for s in st:
    for n in s["name"].split(","):
        by_name.setdefault(n, s["i"])
def key_i(k):
    if isinstance(k, int): return k
    return by_name[k.split(":", 1)[1]]
starts = sorted(((key_i(k), p) for k, p in MAP), key=lambda x: x[0])
assert starts[0][0] == 1 and all(a < b for (a, _), (b, _) in zip(starts, starts[1:])), "MAP must be strictly increasing"
seen_paths = set()
for _, p in starts:
    assert p not in seen_paths, ("path twice", p); seen_paths.add(p)

def gap_before(i, lo):   # the text (comments, blank lines) between statement i-1's end and statement i's start
    a = st[i - 1]["end"] if i > 0 else lo
    return js[a:st[i]["start"]]
def chunk(i0, i1, lo=None):   # statements i0..i1-1 with their leading comments
    out = []
    for i in range(i0, i1):
        g = gap_before(i, lo if lo is not None else st[0]["start"])
        out.append(g.lstrip("\n") if i == i0 else g); out.append(js[st[i]["start"]:st[i]["end"]])
    return "".join(out).strip("\n") + "\n"

manifest, files = [], {}
def add(rel, text):
    assert rel not in files, rel
    files[rel] = text; manifest.append(rel)

# the head: the top comment, "(function(){" and "use strict"
add("_head.js", (head + js[st[0]["start"]:st[0]["end"]]).strip("\n") + "\n")
for n, (a, path) in enumerate(starts):
    b = starts[n + 1][0] if n + 1 < len(starts) else len(st)
    if path.endswith("/"):
        assert b == a + 1 and st[a].get("closure"), ("a closure entry must be one closure statement", a, path, st[a]["name"])
        c = st[a]["closure"]; name = c["name"]; inner = c["inner"]; im = INNER[name]
        assert im[0][0] == 0 and all(x < y for (x, _), (y, _) in zip(im, im[1:]))
        lead = gap_before(a, st[0]["start"])
        body_open = js.index("{", c["head"][0]) + 1          # the body's "{" — the first one in "var X = (function(){"
        add(path + "_open.js", (lead.lstrip("\n") + js[c["head"][0]:body_open]).strip("\n") + "\n")
        for k, (ia, fname) in enumerate(im):
            ib = im[k + 1][0] if k + 1 < len(im) else len(inner)
            parts = []
            for j in range(ia, ib):
                g = js[(inner[j - 1]["end"] if j > 0 else body_open):inner[j]["start"]]
                parts.append(g.lstrip("\n") if j == ia else g); parts.append(js[inner[j]["start"]:inner[j]["end"]])
            add(path + fname, "".join(parts).strip("\n") + "\n")
        add(path + "_close.js", js[c["tail"][0]:c["tail"][1]].strip("\n") + "\n")
    else:
        add(path, chunk(a, b))
add("_tail.js", tail.strip("\n") + "\n")

# ---------- the truck pictures leave the code: assets/trucks/<key>.webp, the statement keeps a marker ----------
trk = "trucks/picture-data.js"; t = files[trk]
m = re.search(r'var TRK_START = (\{.*?\});', t, re.S); assert m
pics = json.loads(m.group(1)); order = []
for k, v in pics.items():
    assert v.startswith("data:image/webp;base64,"), k
    put("assets/trucks/%s.webp" % k, "")  # placeholder so the dir exists
    open(os.path.join(R, "assets/trucks/%s.webp" % k), "wb").write(base64.b64decode(v.split(",", 1)[1])); order.append(k)
put("assets/trucks/index.txt", "# Parsec's starter truck pictures, in the order TRK_START lists them (the build reads this file).\n# side_*/top_*: the four plain bodies · vt_<catalog id>_s / _t: the 52-truck catalog, side and top.\n" + "\n".join(order) + "\n")
files[trk] = t[:m.start()] + 'var TRK_START = /*@@ASSET-MAP:trucks@@*/{};   /* every picture in assets/trucks, keyed as assets/trucks/index.txt lists them — the build puts the data URLs in */' + t[m.end():]

# ---------- the RO page's shadow stylesheet leaves the code: styles/ro-page/*.css, built back into JC_CSS ----------
css_js = files["ro-page/_css.js"]
_q0 = css_js.index('var JC_CSS = "') + len('var JC_CSS = '); _q1 = css_js.rindex('";') + 1   # the statement is the whole literal: `var JC_CSS = "...";` (the file holds just that statement)
class _M:  # the same shape re.search gives
    def __init__(s, a, b): s._a, s._b = a, b
    def start(s): return s._a - len('var JC_CSS = ')
    def end(s): return s._b + 1
    def group(s, n): return css_js[s._a:s._b]
m = _M(_q0, _q1); assert css_js[m.start():m.start() + 13] == 'var JC_CSS = ' and css_js[m.end() - 2:m.end()] == '";' and css_js[m.end():].strip() == "", css_js[m.end():m.end() + 40]
jc_css = subprocess.run(["node", "-e", "process.stdout.write(eval(require('fs').readFileSync(0,'utf8')))"], input=m.group(1), capture_output=True, text=True, check=True).stdout   # a JS string literal, not JSON (\' and friends)
bans = [x.start() for x in re.finditer(r'(?m)^/\* ={5,}', jc_css)]
cuts = [0] + [b for b in bans if b > 0]
# keep files between ~20 and ~60 KB: merge small banner runs
merged = [cuts[0]]
for c in cuts[1:]:
    if c - merged[-1] >= 20000: merged.append(c)
names_jc = []
for k, a in enumerate(merged):
    b = merged[k + 1] if k + 1 < len(merged) else len(jc_css)
    seg = jc_css[a:b]
    first = re.search(r'/\*\s*=*\s*([^*=]{3,60})', seg)
    slug = re.sub(r'[^a-z0-9]+', '-', (first.group(1) if first else "part").lower()).strip("-")[:40] or "part"
    fn = "styles/ro-page/%02d-%s.css" % (k + 1, slug)
    put(fn, seg.strip("\n") + "\n"); names_jc.append(fn)
files["ro-page/_css.js"] = css_js[:m.start()] + 'var JC_CSS = /*@@CSS-STRING:ro-page@@*/"";   /* the RO page\'s own stylesheet (it renders in a shadow root): styles/ro-page/*.css, joined by the build */' + css_js[m.end():]

# ---------- write the app files and the manifest ----------
for rel, text in files.items(): put("src/app/" + rel, text)
mf = ["# Parsec · the load order of src/app (the build joins these files, in this order, inside one closure).",
      "# Function declarations are hoisted, so where a *function* lives never matters; what this order fixes is the",
      "# sequence of everything that runs at load: constants, the page closures, event listeners, the wrappers around",
      "# shared functions, and init. build/order-baseline.json records that sequence; the build refuses a change to it",
      "# unless you run `python3 build.py --accept-order`. New files go at the end of their area's run, or just before",
      "# boot/init.js when they only add functions.", ""]
area = None
for rel in manifest:
    if rel in ("_head.js", "_tail.js"): continue
    a = rel.split("/")[0] if "/" in rel else ""
    if a != area: mf.append(""); area = a
    mf.append(rel)
put("build/manifest.txt", "\n".join(mf) + "\n")

# ======================================================================= styles
blocks = json.load(open(os.path.join(W, "blocks.json")))
style_ids = [b["id"] for b in blocks if b["kind"] == "style"]
BASE_NAMES = {"app-style": "app", "v140-fixes": "fixes-140", "v158css": "v158", "v159css": "v159", "v160css": "v160", "v161css": "v161", "v162stone": "stone", "v163white": "white",
              "v164dock": "dock", "v165tyc": "tyc", "v166tri": "tri", "v167themes": "themes", "v167more": "more", "v168lw": "lw", "v172edge": "edge", "v174at3k": "at3k",
              "v175iv": "ivory", "v178tg": "triage-foreman", "v179fm": "foreman", "v180": "v180", "v181wa": "warranty", "v182px": "px-sidebar"}
styles_cfg = []
for n, sid in enumerate(style_ids):
    text = open(os.path.join(W, "styles", sid + ".css"), encoding="utf-8").read()
    if sid == "v190pg": continue
    fn = "styles/base/%02d-%s.css" % (n + 1, BASE_NAMES.get(sid, sid))
    put(fn, text.strip("\n") + "\n"); styles_cfg.append((sid, [fn]))

# v190pg: the page styles, piece by piece (the order the old build appended them)
pg = open(os.path.join(W, "styles", "v190pg.css"), encoding="utf-8").read()
B9 = os.environ.get("PARSEC16_B9", "../app/b9")   # the old workspace's b9 folder, only for the anchors that split the page styles
def b9(f): return open(os.path.join(B9, f), encoding="utf-8").read()
CSS_PIECES = [  # (anchor text found at the piece's start, file name)
    ("/* mg.css */", "pages-shared-mg.css"), ("/* ideas.css */", "pages-shared-ideas.css"), ("/* ib.css */", "inbox.css"), ("/* cr.css */", "career.css"), ("/* cx.css */", "technician-console.css"),
    ("/* dr.css */", "day-report.css"), ("/* fx.css */", "fixes.css"), ("/* pt.css */", "parts.css"), ("/* rl.css */", "rolist.css"), ("/* tc.css */", "technician.css"), ("/* tl.css */", "timelog.css"),
    (None, "frame.css"), (None, "phone.css"), (None, "trucks.css"), (None, "micro-interactions.css"),
    ("imp.css", "new-ro-import.css"), ("body:has(.jc-host.rop-picking)", "ro-page-picking.css"), ("st14.css", "status-look.css"), ("tri.css", "triage-transfer.css"),
    ("/* Parsec 12.3 — one color per clock reason", "clock-colors.css"), ("v123_side.css", "sidebar-theme-strip.css"), ("/* Parsec 12.4 — the operation clock card */", "clock-card.css"),
    ("tx.css", "move-time.css"), ("inv.css", "inventory.css"), ("v126.css", "parts-stages.css"), ("v127f.css", "lists-fold.css"), ("v127p.css", "sign-in-clocks.css"), ("v129.css", "reopen-question.css"),
    ("v130a.css", "login-pin-lock.css"), ("adm.css", "admin.css"), ("v130c.css", "guards.css"), ("v131s.css", "page-search.css"), ("as.css", "assets-page.css"), ("v132x.css", "extract-operations.css"),
    ("v14b.css", "assign-capacity.css"), ("v14c.css", "status-window.css"), ("v14t.css", "road-test-toggle.css"), ("v141.css", "ro-details.css"), ("v142.css", "truck-card-words.css"),
    ("v143a.css", "ros-tab.css"), ("v143b.css", "one-ro-view.css"), ("v146g.css", "clock-watch.css"), ("v147c.css", "lunch-reminder.css"), ("v149t.css", "tooltips.css"), ("v150b.css", "reminders.css"),
    ("v160a.css", "data-store.css"), ("v160c.css", "backups-export.css"), ("v162a.css", "automations.css"), ("v162b.css", "rule-builder.css"), ("v162c.css", "settings-page.css"),
    ("v163a.css", "ro-links.css"), ("v163b.css", "peek-and-ask.css"), ("v163c", "shop-buttons-contact.css"),
]
def anchors_for(spec, fname):
    if spec is None: spec = {"frame.css": "frame.css", "phone.css": "phone.css", "trucks.css": "trucks.css", "micro-interactions.css": "v10.css"}[fname]
    if spec.startswith("/*") or spec.startswith("body:"): return [spec]
    if spec == "v163c":
        src = open(os.path.join(B9, "build_v9zz163c.py"), encoding="utf-8").read()
        mm = re.search(r'_main163 = (.*)', src); text = b9("v163c.css"); text = text.split("/*JC*/")[0]
    else:
        text = b9(spec)
    # candidate anchors: the first comment, then each rule's selector
    out = []
    mc = re.match(r'\s*(/\*.*?\*/)', text, re.S)
    if mc: out.append(mc.group(1).strip()[:80])
    for sel in re.findall(r'(?:^|\})\s*([^{}/@][^{}]{3,120}?)\s*\{', text, re.S):
        out.append(sel.strip()[:80])
        if len(out) > 40: break
    return out
pos, pieces = 0, []
for spec, fname in CSS_PIECES:
    cands = anchors_for(spec, fname); hit = None
    for c in cands:
        k = pg.find(c, pos)
        if k >= 0 and (hit is None or k < hit[0]): hit = (k, c)
        if hit and k == hit[0] and c == cands[0]: break
    assert hit, ("no anchor for", fname, cands[:3])
    k = hit[0]
    # back up to the start of the line / a comment that introduces it
    ls = pg.rfind("\n", 0, k) + 1
    pieces.append([ls, fname]); pos = k + 1
assert pieces[0][0] <= 1, pieces[0]; pieces[0][0] = 0
for n, (a, fname) in enumerate(pieces):
    b = pieces[n + 1][0] if n + 1 < len(pieces) else len(pg)
    assert b > a, (fname, a, b)
    put("styles/app/%02d-%s" % (n + 1, fname), pg[a:b].strip("\n") + "\n")
styles_cfg.append(("v190pg", ["styles/app/"]))
put("build/styles.txt", "# Each <style id> block in src/page.html, and the file(s) that fill it, in order. A folder means every .css in it, sorted.\n" + "\n".join("%s: %s" % (sid, " ".join(fs)) for sid, fs in styles_cfg) + "\n")

# ======================================================================= the page skeleton, the other scripts, the assets, the test hook
sk = open(os.path.join(W, "skeleton.html"), encoding="utf-8").read()
m = re.search(r'<link rel="apple-touch-icon" href="data:image/png;base64,([A-Za-z0-9+/=]+)">', sk); assert m
open(os.path.join(R, "assets", "icons", "apple-touch-icon.png") if os.makedirs(os.path.join(R, "assets", "icons"), exist_ok=True) is None else "", "wb").write(base64.b64decode(m.group(1)))
sk = sk[:m.start(1) - len("data:image/png;base64,")] + "@@ASSET:apple-touch-icon@@" + sk[m.end(1):]
sk = sk.replace("@@SCRIPT:script0@@", open(os.path.join(W, "scripts", "script0.js"), encoding="utf-8").read())   # the theme is set before the first paint: a few lines, inline
sk = sk.replace("@@SCRIPT:ro-engine@@", "@@FILE:src/engine/ro-engine.js@@").replace("@@SCRIPT:lib-qrcode@@", "@@FILE:vendor/qrcode.js@@").replace("@@SCRIPT:lib-jsqr@@", "@@FILE:vendor/jsqr.js@@")
for sid, fs in styles_cfg:
    sk = sk.replace("@@STYLE:%s@@" % sid, "@@STYLES:%s@@" % sid)
assert "@@STYLE:" not in sk and "@@SCRIPT:" not in sk, re.findall(r'@@[A-Z]+:[^@]+@@', sk)
put("src/page.html", sk)
put("src/engine/ro-engine.js", open(os.path.join(W, "scripts", "ro-engine.js"), encoding="utf-8").read())
put("vendor/qrcode.js", open(os.path.join(W, "scripts", "lib-qrcode.js"), encoding="utf-8").read())
put("vendor/jsqr.js", open(os.path.join(W, "scripts", "lib-jsqr.js"), encoding="utf-8").read())
put("assets/index.txt", "# name: file  mime  — @@ASSET:name@@ in src/page.html becomes a data URL\napple-touch-icon: icons/apple-touch-icon.png image/png\n")
put("src/test/hooks.js", "/* The test build only (dist/Parsec.test.html): no folder gate, and window.__tg — a hook into the closure for tests/*.py.\n   Not in Parsec.html. */\n" + open(os.path.join(W, "hooks.js"), encoding="utf-8").read().strip("\n") + "\n")
print("app files:", len(files), "· css base:", len(style_ids) - 1, "· css app pieces:", len(pieces), "· ro-page css files:", len(names_jc), "· truck pictures:", len(order))
sizes = sorted(((len(v) // 1024, k) for k, v in files.items()), reverse=True)
print("largest app files (KB):", sizes[:12])
print("smallest:", sizes[-8:])
