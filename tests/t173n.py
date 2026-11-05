# Parsec 17.3 (N) — Road test and Truck checks are two switches on the RO page. An older RO with no road test keeps its checks
# off (ro.noChecks not set); turning the road test off now leaves the checks as they were; each button follows its own switch;
# with both off, Release is the one button. Invented data only.
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
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.pxSignedIn && __tg.pxSignedIn()"); await pg.wait_for_timeout(300)
        rid = await pg.evaluate("() => { const r = __tg.S().ros.find(r => !r.shop && !r.dateClosed && r.operations.length && !r.noRoadTest); const U = __tg.UI(); U.view = 'ros'; U.selectedRo = r.id; __tg.render(); return r.id; }"); await pg.wait_for_timeout(1200)
        foot = f"(() => {{ const r = {R}; return {{ sw: [...r.querySelectorAll('.rop-foot .rtt')].map(e => e.querySelector('.rtt-l').textContent + ':' + (e.querySelector('.rtt-sw') || {{}}).getAttribute?.('aria-checked')), b: [...r.querySelectorAll('.rop-foot .rop-acts .px-btn')].map(e => e.textContent.trim()) }}; }})()"
        f = await pg.evaluate(foot)
        ok(f["sw"][:3] == ["Road test before release:true", "Truck checks before release:true", "Warranty RO:false"] and "Road test" in f["b"] and "Truck checks" in f["b"], "two switches, then Warranty RO; both buttons (%s)" % f)
        # road test off: the checks stay
        await pg.evaluate(f"(() => {{ {R}.querySelector('.rop-foot .rtt-sw').click(); }})()"); await pg.wait_for_timeout(500)
        f = await pg.evaluate(foot); st = await pg.evaluate("id => { const r = __tg.S().ros.find(x => x.id === id); return [!!r.noRoadTest, r.noChecks, __tg.qcNeeded(r)]; }", rid)
        ok(st == [True, False, True] and "Road test" not in f["b"] and "Truck checks" in f["b"] and f["sw"][1].endswith(":true"), "road test off: the Truck checks button and switch stay (%s %s)" % (st, f))
        # checks off too: Release is the one button
        await pg.evaluate(f"(() => {{ {R}.querySelector('.rop-qct .rtt-sw').click(); }})()"); await pg.wait_for_timeout(500)
        f = await pg.evaluate(foot)
        ok("Truck checks" not in f["b"] and "Release" in f["b"], "both off: Release, no Road test or Truck checks buttons (%s)" % f["b"])
        # an older RO with no road test and no noChecks: checks off
        old = await pg.evaluate("() => { const r = __tg.S().ros.filter(r => !r.shop && !r.dateClosed)[3]; r.noRoadTest = true; delete r.noChecks; return __tg.qcNeeded(r); }")
        ok(old is False, "an older RO with no road test keeps its checks off")
        # the RO list's side panel: the same Shop block — buttons, then the three switches
        await pg.evaluate("() => { const U = __tg.UI(); U.view = 'rolist'; __tg.render(); }"); await pg.wait_for_timeout(800)
        await pg.click("[data-pg=rolist] .rq-row[data-a=sel] >> nth=3"); await pg.wait_for_timeout(800)
        P = await pg.evaluate("() => { const p = document.querySelector('[data-pg=rolist] .rp-list .rp-shop'); return p ? { sw: [...p.querySelectorAll('.rtt-l')].map(e => e.textContent), b: [...p.querySelectorAll('.rp-acts .btn')].map(e => e.textContent.trim()), foot: !!document.querySelector('[data-pg=rolist] .rp-foot') } : null; }")
        ok(P and P["sw"] == ["Road test before release", "Truck checks before release", "Warranty RO"] and P["b"][0].startswith("Open RO") and not P["foot"], "the RO list's panel has the RO page's Shop block (%s)" % P)
        pid = await pg.evaluate("document.querySelector('[data-pg=rolist] .rp-list').getAttribute('data-rp-ro')")
        await pg.click("[data-pg=rolist] .rp-shop [data-rp-sw=qc]"); await pg.wait_for_timeout(400)
        await pg.click("[data-pg=rolist] .rp-shop [data-rp-sw=w]"); await pg.wait_for_timeout(400)
        q = await pg.evaluate("id => { const r = __tg.getRO(id); return [__tg.qcNeeded(r), !!r.warranty, [...document.querySelectorAll('[data-pg=rolist] .rp-shop .rp-acts .btn')].map(e => e.textContent.trim())]; }", pid)
        ok(q[0] is False and q[1] is True and "Truck checks" not in q[2], "its switches work there: checks off (the button goes), warranty on (%s)" % q)
        ok(not errs, "no page errors (%s)" % errs[:2])
        await b.close()
    print("\n%d failed" % len(FAILS) if FAILS else "\nall passed")
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
