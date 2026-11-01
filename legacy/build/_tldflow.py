import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/tld_mock.html"); await pg.wait_for_timeout(500)
        ev = lambda js: pg.evaluate(js)
        await pg.click('[data-demo="try"]'); await pg.wait_for_timeout(200)
        blk = await pg.query_selector('.tk-tl .tk-b.job'); bb = await blk.bounding_box()
        await pg.mouse.move(bb["x"] + bb["width"] / 2, bb["y"] + bb["height"] / 2); await pg.wait_for_timeout(100)
        h = await pg.query_selector('.tk-tl .tk-b.job .h.r'); hb = await h.bounding_box()
        await pg.mouse.move(hb["x"] + hb["width"] / 2, hb["y"] + hb["height"] / 2); await pg.mouse.down()
        for dx in range(0, -60, -6): await pg.mouse.move(hb["x"] + hb["width"] / 2 + dx, hb["y"] + 20); await pg.wait_for_timeout(15)
        await pg.screenshot(path=B + "/tldshots/live_drag.png", clip={"x": 0, "y": 60, "width": 1480, "height": 560})
        print("mid:", await ev("(document.querySelector('.tk-bub')||{}).textContent"), "| air", await ev("__tk.calc('MR','2026-10-22').airM"))
        await pg.mouse.up(); await pg.wait_for_timeout(150)
        print("dropped:", await ev("(document.querySelector('.toast-fm')||{}).textContent"), await ev("(document.querySelector('.tk-r.sel .tk-ed')||{}).textContent"))
        await pg.click('.toast-fm button'); await pg.wait_for_timeout(150); print("undo ->", await ev("(()=>{const p=__tk.S().D.MR['2026-10-22'].p[0]; return p.s+'-'+p.e+' ed:'+(p.ed||'')})()"))
        # drag into next job, then Esc
        h = await pg.query_selector('.tk-tl .tk-b.job .h.r'); hb = await h.bounding_box(); await pg.mouse.move(hb["x"] + 6, hb["y"] + 20); await pg.mouse.down()
        for dx in range(0, 400, 20): await pg.mouse.move(hb["x"] + 6 + dx, hb["y"] + 20); await pg.wait_for_timeout(10)
        print("into next:", await ev("(document.querySelector('.tk-bub')||{}).textContent"))
        await pg.keyboard.press("Escape"); await pg.mouse.up(); await pg.wait_for_timeout(150); print("after Esc:", await ev("(()=>{const p=__tk.S().D.MR['2026-10-22'].p[0]; return p.s+'-'+p.e})()"), await ev("!!__tk.U().drag"))
        # keyboard nudge
        await pg.click('.tk-r[data-p] >> nth=0'); await pg.keyboard.press("Alt+ArrowRight"); await pg.keyboard.press("Alt+ArrowRight"); await pg.keyboard.press("Alt+Shift+ArrowLeft"); await pg.wait_for_timeout(150)
        print("nudge:", await ev("(()=>{const p=__tk.S().D.MR['2026-10-22'].p[0]; return p.s+'-'+p.e+' ed:'+(p.ed||'')})()"), await ev("(document.querySelector('.toast-fm')||{}).textContent"))
        # snap 5
        await pg.click('[data-a="snap"][data-v="5"]'); await pg.click('[data-demo="d2"]'); await pg.wait_for_timeout(100)
        print(errs or "no errors"); await b.close()
asyncio.run(main())
