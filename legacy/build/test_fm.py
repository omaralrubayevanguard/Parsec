import asyncio, sys, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + B + "/fm_test.html"); await pg.wait_for_timeout(800)
        wrap = await pg.query_selector(".wt-wrap"); 
        async def shot(n):
            await pg.wait_for_timeout(300); bb = await wrap.bounding_box(); await pg.screenshot(path=f"{B}/fm_{n}.png", clip=bb)
        await shot("0_floor")
        for d in ["decide", "assign", "bring", "techs", "review", "yard"]:
            await pg.click(f"[data-demo='{d}']"); await pg.mouse.move(2, 2); await shot("1_" + d)
        await pg.click("[data-reset]"); await pg.keyboard.press("j"); await pg.keyboard.press("j"); await pg.keyboard.press("Enter"); await shot("2_kb")
        await pg.click("[data-theme-set='dark']"); await pg.click("[data-demo='decide']"); await shot("3_dark_decide")
        await pg.click("[data-demo='techs']"); await shot("3_dark_techs")
        await pg.click("[data-reset]"); await shot("3_dark_floor")
        print("errors:", errs); await b.close()
asyncio.run(main())
