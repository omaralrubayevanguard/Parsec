import asyncio, os, sys
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(B, "ptshots")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1200})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/nv_mock.html"); await pg.wait_for_timeout(600)
        demos = sys.argv[1].split(",") if len(sys.argv) > 1 else ["rail","open","clk","me","page","theme","sign","out","below","before","ray"]
        for th in (sys.argv[2].split(",") if len(sys.argv) > 2 else ["light"]):
            await pg.click(f'[data-theme-set="{th}"]')
            for d in demos:
                await pg.click(f'[data-ndemo="{d}"]'); await pg.wait_for_timeout(250)
                el = await pg.query_selector(".wt-wrap"); await el.screenshot(path=f"{SH}/nv_{th}_{d}.png")
        print("\n".join(errs) or "no errors"); await b.close()
asyncio.run(main())
