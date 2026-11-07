# Parsec 17.3 (P) — folding the RO page's right column (src/app/ro-page/rail-fold.js): the button at the top of the column
# folds it to a strip of icons; a click on an icon brings the column back, scrolled to that part; \ folds and opens it;
# each page remembers its own fold (localStorage parsec.rf); under 1 100 px wide it folds by itself and opens when wider.
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
R = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
SHUT = f"{R}.querySelector('.px-ro').classList.contains('rf-shut')"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        await pg.evaluate("() => { const r = __tg.S().ros.find(r => !r.shop && !r.dateClosed && r.operations.length); const U = __tg.UI(); U.view = 'ros'; U.selectedRo = r.id; __tg.render(); }"); await pg.wait_for_timeout(1200)
        w0 = await pg.evaluate(f"[{SHUT}, Math.round({R}.querySelector('.rop-rail').getBoundingClientRect().width), !!{R}.querySelector('.rop-rfold')]")
        ok(w0[0] is False and w0[1] > 200 and w0[2], "the column starts open with a fold button (%s)" % w0)
        await pg.evaluate(f"{R}.querySelector('.rop-rfold').click()"); await pg.wait_for_timeout(500)
        s = await pg.evaluate(f"[{SHUT}, Math.round({R}.querySelector('.rop-rail').getBoundingClientRect().width), {R}.querySelectorAll('.rop-fstrip .rop-fsb').length, localStorage.getItem('parsec.rf')]")
        ok(s[0] and s[1] <= 60 and s[2] >= 6 and '"ros":1' in (s[3] or ""), "the button folds it to a strip of icons, remembered for this page (%s)" % s)
        await pg.reload(); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        await pg.evaluate("() => { const r = __tg.S().ros.find(r => !r.shop && !r.dateClosed && r.operations.length); const U = __tg.UI(); U.view = 'ros'; U.selectedRo = r.id; __tg.render(); }"); await pg.wait_for_timeout(1200)
        ok(await pg.evaluate(SHUT), "it is still folded after the page opens again")
        await pg.evaluate(f"[...{R}.querySelectorAll('.rop-fstrip .rop-fsb')].find(b => /Vehicle/.test(b.title || b.getAttribute('aria-label') || '')).click()"); await pg.wait_for_timeout(700)
        o = await pg.evaluate(f"[{SHUT}, {R}.querySelector('.rop-rail').scrollTop, localStorage.getItem('parsec.rf')]")
        ok(o[0] is False and o[1] > 0 and '"ros"' not in (o[2] or ""), "a click on the Vehicle icon opens it, scrolled to Vehicle (%s)" % o)
        await pg.evaluate("() => document.activeElement && document.activeElement.blur && document.activeElement.blur()")
        await pg.keyboard.press("Backslash"); await pg.wait_for_timeout(400); k1 = await pg.evaluate(SHUT)
        await pg.keyboard.press("Backslash"); await pg.wait_for_timeout(400); k2 = await pg.evaluate(SHUT)
        ok(k1 is True and k2 is False, "\\ folds and opens it (%s, %s)" % (k1, k2))
        await pg.evaluate("() => { localStorage.setItem('parsec.rf', JSON.stringify({ tech: 1 })); }")
        ok(await pg.evaluate(SHUT) is False, "another page's fold leaves this one alone")
        await pg.set_viewport_size({"width": 1050, "height": 900}); await pg.wait_for_timeout(500); n1 = await pg.evaluate(SHUT)
        await pg.set_viewport_size({"width": 1440, "height": 900}); await pg.wait_for_timeout(500); n2 = await pg.evaluate(SHUT)
        ok(n1 is True and n2 is False, "under 1 100 px it folds by itself and opens again when wider (%s, %s)" % (n1, n2))
        ok(not errs, "no page errors (%s)" % errs[:2])
        await b.close()
    print("\n%d failed" % len(FAILS) if FAILS else "\nall passed")
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
