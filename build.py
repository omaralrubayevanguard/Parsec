#!/usr/bin/env python3
"""Parsec · build

    python3 build.py                 → dist/Parsec.html (the app) and dist/Parsec.test.html (the same, plus the test hook)
    python3 build.py --accept-order  → also rewrite build/order-baseline.json after a deliberate change to the load order
    python3 build.py --no-checks     → skip the guards (for a quick look; never for a release)

How a build goes:
  1. src/page.html is the skeleton. Its @@markers@@ are filled in:
       @@STYLES:<block id>@@   the CSS files build/styles.txt lists for that <style id> block, in order
       @@FILE:<path>@@         one file, verbatim (the RO engine, the two QR libraries)
       @@ASSET:<name>@@        a data URL for a file in assets/ (assets/index.txt)
       @@APP@@                 the app script: src/app/_head.js + build/manifest.txt's files + src/app/_tail.js
  2. Inside the app script two more markers are filled: the truck pictures (assets/trucks) and the RO page's
     stylesheet (styles/ro-page), so neither has to live in the code.
  3. The guards run on the result (build/checks/): it parses, every file is in the manifest exactly once, no name is
     declared twice, nothing reads a constant before it exists, the load order matches the baseline, every STATE key
     has a home in the data store, the tooltips keep their writing rules. A failed guard stops the build.
  4. The test copy gets src/test/hooks.js right before the closure's end.
Everything is plain text; no package is installed. Python 3 and Node (for the parser) are all it needs.
"""
import os, sys, re, json, base64, time, subprocess, hashlib
H = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(H, *a)
def read(*a): return open(P(*a), encoding="utf-8").read()
def write(rel, text):
    os.makedirs(os.path.dirname(P(rel)), exist_ok=True)
    open(P(rel), "w", encoding="utf-8").write(text)
ACCEPT = "--accept-order" in sys.argv; NOCHECK = "--no-checks" in sys.argv
t0 = time.time()
def fail(msg):
    print("BUILD FAILED · " + msg); sys.exit(1)

# ---------------------------------------------------------------- 1. the app script, from the manifest
manifest = [l.strip() for l in read("build", "manifest.txt").splitlines() if l.strip() and not l.startswith("#")]
on_disk = sorted(os.path.relpath(os.path.join(dp, f), P("src", "app")).replace(os.sep, "/") for dp, _, fs in os.walk(P("src", "app")) for f in fs if f.endswith(".js"))
listed = set(manifest)
missing = [f for f in manifest if not os.path.exists(P("src", "app", f))]
unlisted = [f for f in on_disk if f not in listed and f not in ("_head.js", "_tail.js")]
dupes = sorted({f for f in manifest if manifest.count(f) > 1})
if missing or unlisted or dupes or "_head.js" in listed or "_tail.js" in listed:
    fail("build/manifest.txt must list every src/app file once (not _head.js/_tail.js).\n  missing on disk: %s\n  on disk but not listed: %s\n  listed twice: %s" % (missing, unlisted, dupes))

def assemble(test):
    parts, offsets, line = [], [], 1
    seq = ["_head.js"] + manifest + (["@@TEST@@"] if test else []) + ["_tail.js"]
    for f in seq:
        text = read("src", "test", "hooks.js") if f == "@@TEST@@" else read("src", "app", f)
        if not text.endswith("\n"): text += "\n"
        parts.append(text); offsets.append([f if f != "@@TEST@@" else "src/test/hooks.js", line]); line += text.count("\n") + 1   # +1: the blank line between files
    return "\n".join(parts), offsets

# the truck pictures and the RO page stylesheet go in by marker
trk_keys = [l.strip() for l in read("assets", "trucks", "index.txt").splitlines() if l.strip() and not l.startswith("#")]
trk = {}
for k in trk_keys:
    trk[k] = "data:image/webp;base64," + base64.b64encode(open(P("assets", "trucks", k + ".webp"), "rb").read()).decode()
TRK_MARK = "/*@@ASSET-MAP:trucks@@*/{}"
ro_css = "\n".join(read("styles", "ro-page", f) for f in sorted(os.listdir(P("styles", "ro-page"))) if f.endswith(".css"))
ro_css += "\n" + read("styles", "app", "59-clock-172.css")   # 17.2: the clock card's picks, shared with the RO page
CSS_MARK = '/*@@CSS-STRING:ro-page@@*/""'
def fill_app(app):
    if app.count(TRK_MARK) != 1 or app.count(CSS_MARK) != 1: fail("the picture marker or the RO page CSS marker is missing or doubled in src/app")
    return app.replace(TRK_MARK, json.dumps(trk), 1).replace(CSS_MARK, json.dumps("\n" + ro_css), 1)

# ---------------------------------------------------------------- 2. the page
page = read("src", "page.html")
styles_cfg = [l.split(":", 1) for l in read("build", "styles.txt").splitlines() if l.strip() and not l.startswith("#")]
for sid, files in styles_cfg:
    out = []
    for f in files.split():
        if f.endswith("/"): out += [read(f, g) for g in sorted(os.listdir(P(f))) if g.endswith(".css")]
        else: out.append(read(f))
    mark = "@@STYLES:%s@@" % sid.strip()
    if page.count(mark) != 1: fail("src/page.html should have %s exactly once" % mark)
    page = page.replace(mark, "\n".join(x.strip("\n") for x in out))
for m in re.findall(r"@@FILE:([^@]+)@@", page): page = page.replace("@@FILE:%s@@" % m, read(m))
for l in read("assets", "index.txt").splitlines():
    if not l.strip() or l.startswith("#"): continue
    name, rest = l.split(":", 1); f, mime = rest.split()
    page = page.replace("@@ASSET:%s@@" % name.strip(), "data:%s;base64,%s" % (mime, base64.b64encode(open(P("assets", f), "rb").read()).decode()))
left = re.findall(r"@@[A-Z-]+:[^@]*@@", page.replace("@@APP@@", ""))
if left: fail("markers nobody filled in src/page.html: %s" % left)

# ---------------------------------------------------------------- 3. the guards
app_raw, offsets = assemble(False)
app = fill_app(app_raw)
if not NOCHECK:
    os.makedirs(P("build", "_tmp"), exist_ok=True)
    open(P("build", "_tmp", "app.js"), "w", encoding="utf-8").write(app_raw)
    json.dump(offsets, open(P("build", "_tmp", "offsets.json"), "w"))
    r = subprocess.run(["node", P("build", "checks", "structure.js"), P("build", "_tmp", "app.js"), P("build", "_tmp", "offsets.json")], capture_output=True, text=True)
    if r.returncode: fail("structure check:\n" + (r.stderr or r.stdout)[:4000])
    S = json.loads(r.stdout)
    for w in S.get("errors", []): print("  ✗ " + w)
    if S.get("errors"): fail("%d structure error(s) above" % len(S["errors"]))
    # the load order, against the baseline
    base_p = P("build", "order-baseline.json")
    seq = S["loadSeq"]
    if os.path.exists(base_p) and not ACCEPT:
        base = json.load(open(base_p))
        if base != seq:
            import difflib
            d = [l for l in difflib.unified_diff(base, seq, "baseline", "this build", lineterm="", n=1) if not l.startswith(("---", "+++"))]
            print("\n".join(d[:60]))
            fail("the load order changed (%d lines of diff). If that is what you meant, run: python3 build.py --accept-order" % len(d))
    elif ACCEPT or not os.path.exists(base_p):
        json.dump(seq, open(base_p, "w"), indent=0); print("  order baseline %s (%d load-time statements)" % ("rewritten" if ACCEPT else "recorded", len(seq)))
    # the data store knows every STATE key; the tooltips keep their rules; every file has its header
    for chk, argv in (("data_keys.py", [P("build", "_tmp", "app.js")]), ("tooltips.py", [P("build", "_tmp", "app.js")]), ("../../tools/headers.py", ["--check"])):
        r = subprocess.run([sys.executable, P("build", "checks", chk)] + argv, capture_output=True, text=True)
        print("  " + (r.stdout.strip().splitlines() or ["?"])[-1])
        if r.returncode: fail(chk + ":\n" + (r.stdout + r.stderr)[-3000:])
    print("  structure: %d files · %d top-level statements · %d functions · %d load-time · %d listeners · %d wrappers" % (len(manifest) + 2, S["n"], S["nf"], len(seq), S["nl"], S["nw"]))
    big = [(os.path.getsize(P("src", "app", f)) // 1024, f) for f in manifest if os.path.getsize(P("src", "app", f)) > 60 * 1024]
    if big: print("  worth splitting (over 60 KB): " + ", ".join("%s (%d KB)" % (f, k) for k, f in sorted(big, reverse=True)))

# ---------------------------------------------------------------- 4. write
os.makedirs(P("dist"), exist_ok=True)
build_line = re.search(r'var BUILD = "([^"]*)"', app).group(1)
open(P("dist", "Parsec.html"), "w", encoding="utf-8").write(page.replace("@@APP@@", app))
test_raw, _ = assemble(True)
open(P("dist", "Parsec.test.html"), "w", encoding="utf-8").write(page.replace("@@APP@@", fill_app(test_raw)))
print("built dist/Parsec.html (%d KB) and dist/Parsec.test.html in %.1f s · %s" % (os.path.getsize(P("dist", "Parsec.html")) // 1024, time.time() - t0, build_line))
