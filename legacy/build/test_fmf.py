import asyncio, sys, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + B + "/fmf_test.html"); await pg.wait_for_timeout(800)
        wrap = await pg.query_selector(".wt-wrap")
        async def shot(n):
            await pg.mouse.move(2, 2); await pg.wait_for_timeout(300); bb = await wrap.bounding_box(); await pg.screenshot(path=f"{B}/fmf_{n}.png", clip=bb)
        ev = pg.evaluate
        for d in ["floor", "day", "fill", "risk", "today"]:
            await pg.click(f"[data-demo='{d}']"); await shot("1_" + d)
        # fill: bring the best fit in
        await pg.click("[data-demo='fill']"); await pg.keyboard.press("Enter"); await shot("2_fill_done")
        print("fill ->", await ev("__fm.S().R.filter(r=>r.spot==='B11').map(r=>r.no+':'+r.tech)"))
        # day view: click a later gap to plan
        await pg.click("[data-demo='day']"); g = pg.locator(".fm-drow .gap[data-at]").first
        await g.click(); await shot("2_day_gap")
        await pg.keyboard.press("Enter"); await shot("2_day_planned")
        # risk: add a helper
        await pg.click("[data-demo='risk']"); await pg.keyboard.press("2"); await pg.keyboard.press("Enter"); await shot("2_risk_done")
        print("risk ->", await ev("(()=>{const r=__fm.S().R.find(r=>r.no==='37150');return [r.helper,r.riskOk]})()"))
        await pg.click(".tg-hf[data-k='risk']"); await shot("2_filter_risk")
        await pg.click("[data-theme-set='dark']"); await pg.click("[data-demo='day']"); await shot("3_dark_day")
        await pg.click("[data-demo='floor']"); await shot("3_dark_floor")
        print("errors:", errs); await b.close()
asyncio.run(main())
