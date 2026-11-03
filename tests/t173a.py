# Parsec 17.3 (A) — the reading scorecard: every sample case, screenshot text, drawn screenshot and parts quote is read the way
# New RO reads it, and each value is checked against what it should say. Prints the score per case and per kind of value, every
# miss, and fails if the overall score drops below the corpus's floor (tests/fixtures/reading/corpus.json). Invented data only.
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FIX = os.path.join(H, "reading") if os.path.isdir(os.path.join(H, "reading")) else os.path.join(H, "fixtures", "reading")
BASE = os.path.dirname(FIX)
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)

# reads one case in the page: the text (or a screenshot drawn on a canvas and read by the built-in reader), then scores it
SCORE = r"""async (C) => {
  const pad = n => String(n).padStart(2, '0');
  const local = iso => { if (!iso) return ''; const d = new Date(iso); return isNaN(d) ? String(iso) : d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  let text = C.text;
  if (C.shot) {
    const L = C.shot.lines, c = document.createElement('canvas'), g = c.getContext('2d');
    const px = parseFloat(C.shot.font) || 13, lh = Math.round(px * 2.1);
    g.font = C.shot.font; let w = 0;
    L.forEach(r => { let x = 16; r.forEach(t => { x += g.measureText(t).width + px * 2.4; }); w = Math.max(w, x); });
    c.width = Math.ceil(w + 24); c.height = 24 + L.length * lh;
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#23272e'; g.font = C.shot.font; g.textBaseline = 'middle';
    L.forEach((r, i) => { let x = 16; r.forEach(t => { g.fillText(t, x, 12 + lh * i + lh / 2); x += g.measureText(t).width + px * 2.4; }); });
    const blob = await new Promise(res => c.toBlob(res, 'image/png'));
    text = __tg.cleanOcrText(await __tg.ocrImages([new File([blob], 'shot.png', { type: 'image/png' })], 6));
  }
  const P = __tg.IMPX.parse(text), out = [];
  const add = (kind, what, want, got, good) => out.push({ kind, what, want: String(want), got: got == null ? '' : String(got), good });
  const num = (a, b) => a != null && a !== '' && Math.abs(Number(a) - Number(b)) < 0.006;
  Object.keys(C.f || {}).forEach(k => {
    const want = C.f[k], raw = P.f[k], got = /^(etr|followUp|checkedIn)$/.test(k) ? local(raw) : raw;
    add('field', k, want, got, String(got || '').trim().toLowerCase() === String(want).trim().toLowerCase());
  });
  (C.ops || []).forEach(o => {
    const g = P.ops.find(x => x.no === o.no);
    ['hours', 'price', 'approval', 'opCode'].forEach(k => { if (o[k] === undefined) return;
      const v = g ? g[k] : null; add('operation', 'Op ' + o.no + ' ' + k, o[k], v, k === 'hours' || k === 'price' ? num(v, o[k]) : String(v || '').toUpperCase() === String(o[k]).toUpperCase()); });
  });
  const all = P.parts.concat(...P.ops.map(o => o.parts)), key = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  (C.parts || []).forEach(p => {
    const g = all.find(x => p.pn ? key(x.pn) === key(p.pn) : String(x.desc || '').toLowerCase().includes(p.desc.toLowerCase()));
    const nm = p.pn || p.desc;
    add('part', nm + ' found', 'yes', g ? 'yes' : 'no', !!g);
    ['qty', 'price', 'core'].forEach(k => { if (p[k] === undefined) return; add('part', nm + ' ' + k, p[k], g ? g[k] : null, !!g && num(g[k], p[k])); });
  });
  Object.keys(C.tot || {}).forEach(k => { const v = P.totals ? P.totals[k] : null; add('total', k, C.tot[k], v, num(v, C.tot[k])); });
  return { checks: out, text: C.shot ? text : '' };
}"""

async def main():
    corpus = json.load(open(os.path.join(FIX, "corpus.json"), encoding="utf-8"))
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1280, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        tot = {"all": [0, 0]}; per = []
        for C in corpus["cases"]:
            C = dict(C)
            if "file" in C: C["text"] = open(os.path.join(BASE, C["file"]), encoding="utf-8").read()
            r = await pg.evaluate(SCORE, C)
            good = sum(1 for x in r["checks"] if x["good"]); n = len(r["checks"])
            per.append({"name": C["name"], "kind": C["kind"], "good": good, "n": n})
            print("     %-46s %-11s %3d / %-3d %5.1f%%" % (C["name"], C["kind"], good, n, 100.0 * good / max(n, 1)))
            for x in r["checks"]:
                for k in ("all", x["kind"], C["kind"]):
                    t = tot.setdefault(k, [0, 0]); t[1] += 1; t[0] += 1 if x["good"] else 0
                if not x["good"]: print("        miss  %-28s wanted %-22s read %s" % (x["what"], x["want"], x["got"] or "(nothing)"))
        print()
        for k, (g, n) in tot.items(): print("     %-12s %4d / %-4d %5.1f%%" % (k, g, n, 100.0 * g / max(n, 1)))
        score = 100.0 * tot["all"][0] / max(tot["all"][1], 1)
        json.dump({"score": round(score, 1), "by": {k: [g, n] for k, (g, n) in tot.items()}, "cases": per}, open(os.path.join(H, "reading-score.json"), "w"), indent=1)
        ok(score >= corpus.get("floor", 0), "reading score %.1f%% (floor %s%%)" % (score, corpus.get("floor", 0)))
        ok(not errs, "no page errors: %s" % errs[:2])
        await b.close()
    print("FAILS:", len(FAILS), FAILS)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
