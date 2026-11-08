# Parsec 17.5 (A) — checks, then release: Truck checks ends with Mark checked (no Release in it); the story and the punch notes
# are one check; Release shows the truck checks as one box while they're open (counted as one), asks why straight away, and
# has one Release button; the RO page has one Release button that opens it; the RO list panel always has Release.
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
R = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        rid = await pg.evaluate("() => { const r = __tg.S().ros.find(r => !r.shop && !r.dateClosed && r.operations.length && __tg.qcNeeded(r)); r.truckChecks = { ticks: [] }; const U = __tg.UI(); U.view = 'ros'; U.selectedRo = r.id; __tg.render(); return r.id; }")
        await pg.wait_for_timeout(1000)
        ta = await pg.evaluate("x => __tg.trxAuto(__tg.getRO(x)).map(a => a.t)", rid)
        ok("Story and notes on every operation" in ta and "Notes written" not in ta and "Story on every operation" not in ta, "the story and the punch notes are one check (%s)" % ta)
        await pg.evaluate("x => __tg.tgOpenPop('checks', x)", rid); await pg.wait_for_timeout(400)
        q = await pg.evaluate("() => { const p = document.querySelector('.trx-q'); const m = p && p.querySelector('[data-f=mark]'); return p ? [!!m, m && m.disabled, !!p.querySelector('[data-action=tg-qc-go]')] : null; }")
        ok(q == [True, True, False], "Truck checks ends with Mark checked — off while checks are open, and no Release in it (%s)" % q)
        await pg.evaluate("x => { const r = __tg.getRO(x); r.truckChecks = { ticks: __tg.trxWalk().slice() }; __tg.render(); }", rid)
        ok(await pg.evaluate("x => __tg.trxQcDone(__tg.getRO(x))", rid) is False, "ticking every box doesn't mark it checked by itself")
        await pg.evaluate("() => { const U = __tg.UI(); U.tgPop = null; __tg.render(); }")
        btn = await pg.evaluate(f"(() => {{ const b = {R}.querySelector('.rop-acts .rop-byb'); return b ? b.textContent.trim() : null; }})()")
        ok(btn == "Release", "the RO page has one Release button (%s)" % btn)
        await pg.evaluate(f"{R}.querySelector('.rop-acts .rop-byb').click()"); await pg.wait_for_timeout(400)
        rl = await pg.evaluate("""() => { const d = document.querySelector('.tg-pop.rl'); if (!d) return null; const go = d.querySelector('[data-action=tg-rl-go]');
          return [!!d.querySelector('.tg-rwarn [data-p=checks]'), [...d.querySelectorAll('.tg-ck')].map(x => x.querySelector('span').textContent), d.querySelectorAll('.tg-any .tg-chip').length, go && go.textContent.trim(), go && go.disabled, (d.querySelector('.tg-rsum small') || {}).textContent]; }""")
        ok(rl and rl[0] and not any(t in ("All operations complete", "Parts installed", "Files on the RO", "Truck checks") for t in rl[1]), "Release: the open checks are one box with Finish the checks first, not listed again (%s)" % (rl and rl[1]))
        ok(rl and rl[2] >= 2 and "Release anyway" in rl[3] and rl[4] is True, "Release asks why straight away; Release anyway waits for a reason (%s)" % (rl and rl[2:5]))
        ok(rl and int(rl[5].split(" of ")[1].split(" ")[0]) <= 8, "the truck checks count as one in the total (%s)" % (rl and rl[5]))
        await pg.evaluate("() => { const U = __tg.UI(); U.tgPop = null; __tg.render(); }")
        pb = await pg.evaluate("x => { const h = __tg.rpRelBtn(__tg.getRO(x)); return [h.indexOf('data-p=\"release\"') > -1, h.indexOf('Release') > -1]; }", rid)
        ok(pb == [True, True], "the RO list panel always has Release, and it opens Release (%s)" % pb)
        ok(not errs, "no page errors (%s)" % errs[:2])
        await b.close()
    print("\n%d failed" % len(FAILS) if FAILS else "\nall passed")
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
