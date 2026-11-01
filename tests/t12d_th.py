import asyncio, os, sys
from playwright.async_api import async_playwright
from _t12d import openro, OUT
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/" + sys.argv[1]); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        rid = await pg.evaluate("__tg.STATE().ros.filter(r=>!r.dateClosed && r.operations.length>1)[0].id")
        await openro(pg, rid)
        for th in sys.argv[2].split(','):
            await pg.evaluate(f"__tg.applyTheme('{th}')"); await pg.wait_for_timeout(1500)
            ink = await pg.evaluate("(()=>{ const h=document.querySelector('.jc-host:not(.jc-band-host)'); const cs=getComputedStyle(h); return [cs.getPropertyValue('--ink'), cs.getPropertyValue('--bg'), document.documentElement.getAttribute('data-theme'), h.getAttribute('data-theme')]; })()")
            print(sys.argv[1], th, ink)
            await pg.screenshot(path=os.path.join(OUT, "th_" + sys.argv[1].split('.')[0] + "_" + th + ".png"))
        await b.close()
asyncio.run(main())
