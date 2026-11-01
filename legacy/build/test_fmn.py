import asyncio, sys, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + B + "/fmn_test.html"); await pg.wait_for_timeout(800)
        wrap = await pg.query_selector(".wt-wrap")
        async def shot(n):
            await pg.mouse.move(2, 2); await pg.wait_for_timeout(300); bb = await wrap.bounding_box(); await pg.screenshot(path=f"{B}/fmn_{n}.png", clip=bb)
        ev = pg.evaluate
        await shot("0_list")
        for d in ["clock", "lunch", "free", "back", "road"]:
            await pg.click(f"[data-demo='{d}']"); await shot("1_" + d)
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300); await shot("2_" + d + "_done")
        print("37590:", await ev("(()=>{const r=__fm.S().R.find(r=>r.no==='37590');return [r.run,r.b]})()"))
        await pg.click("[data-theme-set='dark']"); await pg.click("[data-demo='back']"); await shot("3_dark_back")
        await pg.click("[data-demo='free']"); await shot("3_dark_free")
        await pg.click("[data-theme-set='light']"); await pg.click("[data-demo='list']"); await pg.keyboard.press("2"); await shot("4_techs")
        print("errors:", errs); await b.close()
asyncio.run(main())
