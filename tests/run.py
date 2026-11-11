#!/usr/bin/env python3
"""Parsec · the test runner

    python3 tests/run.py                      every test, against dist/Parsec.test.html (build first: python3 build.py)
    python3 tests/run.py t163a t162c          just these
    python3 tests/run.py --page some.html     another build (e.g. an older one, to compare); --real its shipped copy (default: beside it)
    python3 tests/run.py --jobs 2             how many browsers at once (default 3)
    python3 tests/run.py --list               the tests and what each covers

Each tests/t<version><letter>.py is a Playwright script that opens the test build, loads the 25 sample ROs, and
drives one area (the file's first comment says which). A test prints "ok   …" / "FAIL …" lines and exits 0 when all
passed. They were written one Parsec version at a time, so a test's number says which version it came with.

The runner stages a run folder (tests/_run/<time>/) with the page under every name the tests expect, copies the
tests in, and runs them there, so screenshots and logs land in that folder and nowhere else. It picks a time zone
where it is daytime now (several tests assume a working day), prints one line per test, and writes results.json.
The test build is the app plus src/test/hooks.js (window.__tg), nothing else.
"""
import os, sys, re, json, time, shutil, gzip, subprocess, datetime
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(H)
args = sys.argv[1:]
if "--help" in args or "-h" in args: print(__doc__); sys.exit(0)   # a help flag must never start the 40-minute suite
def opt(name, default=None):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
page = os.path.abspath(opt("--page", os.path.join(ROOT, "dist", "Parsec.test.html")))
real = os.path.abspath(opt("--real", os.path.join(os.path.dirname(page), "Parsec.html" if page.endswith("Parsec.test.html") else "Parsec_12.html")))   # the production copy two tests inspect
jobs = int(opt("--jobs", "3")); listing = "--list" in args; args = [a for a in args if not a.startswith("--")]
tests = sorted(f[:-3] for f in os.listdir(H) if re.fullmatch(r"t\w+\.py", f))
if args: tests = [t for t in tests if t in args or t in ["t" + a for a in args]]
if listing:
    for t in tests:
        first = open(os.path.join(H, t + ".py"), encoding="utf-8").readline().strip("# \n")
        try: print("%-10s %s" % (t, first[:110]))
        except BrokenPipeError: break
    sys.exit(0)
if not os.path.exists(page): sys.exit("no test build at %s — run python3 build.py first" % page)

# a time zone where it is a working day's daytime right now (10:00–15:00)
utc_h = datetime.datetime.now(datetime.timezone.utc).hour
tz = {h: z for h, z in [(0, "Pacific/Auckland"), (1, "Australia/Brisbane"), (2, "Asia/Tokyo"), (3, "Asia/Shanghai"), (4, "Asia/Bangkok"), (5, "Asia/Kolkata"), (6, "Asia/Dubai"), (7, "Europe/Moscow"), (8, "Europe/Athens"), (9, "Europe/Berlin"), (10, "Europe/London"), (11, "Atlantic/Azores"), (12, "America/Sao_Paulo"), (13, "America/Halifax"), (14, "America/New_York"), (15, "America/Chicago"), (16, "America/Denver"), (17, "America/Los_Angeles"), (18, "America/Anchorage"), (19, "Pacific/Honolulu"), (20, "Pacific/Pago_Pago"), (21, "Pacific/Auckland"), (22, "Pacific/Auckland"), (23, "Pacific/Auckland")]}[utc_h]
run = os.path.join(H, "_run", time.strftime("%Y%m%d-%H%M%S")); os.makedirs(run)
# the page under every name any test opens (older tests name the build of their day: t10.html, t12c.html, …)
names = {"t12.html"}
for t in tests:
    names |= set(re.findall(r'(?:["\']|/)(t[0-9]+[a-z0-9_]*\.html)["\']', open(os.path.join(H, t + ".py"), encoding="utf-8").read()))
names.discard("t12_old.html")
for n in sorted(names): shutil.copy(page, os.path.join(run, n))
if os.path.exists(real): shutil.copy(real, os.path.join(run, "Parsec_12.html"))   # t161a / t162c read the shipped page beside the test page
for hf in os.listdir(os.path.join(H, "fixtures", "helpers")): shutil.copy(os.path.join(H, "fixtures", "helpers", hf), run)   # two Parsec 5–9 tests read a seed out of these
with gzip.open(os.path.join(H, "fixtures", "parsec15-test-build.html.gz"), "rb") as f: open(os.path.join(run, "t12_old.html"), "wb").write(f.read())   # the Parsec 15 build t160b compares against
for f in os.listdir(H):   # every test, not just the chosen ones: a few read a helper out of a sibling test (t127p.py, t11d.py)
    if re.fullmatch(r"t\w+\.py", f): shutil.copy(os.path.join(H, f), run)
for fx in ("imptest", "x132", "reading"):   # text fixtures a few import tests read beside themselves
    if os.path.isdir(os.path.join(H, "fixtures", fx)): shutil.copytree(os.path.join(H, "fixtures", fx), os.path.join(run, fx))
env = dict(os.environ, TZ=tz, PYTHONDONTWRITEBYTECODE="1", PARSEC_ROOT=ROOT)
print("page: %s\nrun folder: %s\ntime zone: %s · %d tests · %d at once" % (page, run, tz, len(tests), jobs))

results, queue, live = {}, list(tests), {}
def start(t):
    argv = [sys.executable, "-I", t + ".py", "t12.html"] + (["t12_old.html"] if t == "t160b" else [])   # tests open H + "/" + argv[1]
    log = open(os.path.join(run, t + ".log"), "w", encoding="utf-8")
    return subprocess.Popen(argv, cwd=run, env=env, stdout=log, stderr=subprocess.STDOUT), log, time.time()
t_all = time.time()
while queue or live:
    while queue and len(live) < jobs:
        t = queue.pop(0); live[t] = start(t)
    time.sleep(1)
    for t in list(live):
        p, log, t0 = live[t]
        if p.poll() is None:
            if time.time() - t0 > 600: p.kill(); results[t] = {"status": "timeout", "ok": 0, "fail": 0, "s": 600}
            else: continue
        else:
            log.close(); text = open(os.path.join(run, t + ".log"), encoding="utf-8", errors="replace").read()
            ok = len(re.findall(r"(?m)^ok\b", text)); fail = len(re.findall(r"(?m)^FAIL\b", text)) + len(re.findall(r"(?m)^\s*FAIL ", text))
            results[t] = {"status": "pass" if p.returncode == 0 and not fail else ("fail" if ok or fail else "error"), "ok": ok, "fail": fail, "s": round(time.time() - t0), "exit": p.returncode}
        del live[t]
        r = results[t]; print("%-10s %-7s %3d ok %3d fail  %4ds" % (t, r["status"], r["ok"], r["fail"], r["s"]), flush=True)
json.dump({"page": page, "tz": tz, "results": results}, open(os.path.join(run, "results.json"), "w"), indent=1)
n = len(results); passed = sum(1 for r in results.values() if r["status"] == "pass")
print("\n%d of %d tests passed · %d checks ok, %d failed · %.0f s · results in %s" % (passed, n, sum(r["ok"] for r in results.values()), sum(r["fail"] for r in results.values()), time.time() - t_all, os.path.relpath(run, ROOT)))
sys.exit(0 if passed == n else 1)
