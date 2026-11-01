import asyncio, os, sys
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__)); F = sys.argv[1]; OUT = sys.argv[2]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type=="error" and "fonts" not in m.text and "Failed to load" not in m.text else None)
        await pg.goto("file://" + os.path.abspath(F)); await pg.wait_for_timeout(800)
        await pg.screenshot(path=f"{OUT}_0.png")
        for d in ["file","back","sent","board","paid","xfer"]:
            await pg.click(f"[data-demo={d}]"); await pg.wait_for_timeout(300); await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(100)
            await pg.screenshot(path=f"{OUT}_{d}.png")
        await pg.click("[data-theme-set=dark]"); await pg.click("[data-demo=back]"); await pg.wait_for_timeout(300); await pg.evaluate("window.scrollTo(0,0)"); await pg.screenshot(path=f"{OUT}_dark_back.png")
        await pg.click("[data-demo=board]"); await pg.wait_for_timeout(300); await pg.evaluate("window.scrollTo(0,0)"); await pg.screenshot(path=f"{OUT}_dark_board.png")
        print("errors", errs)
        await b.close()
asyncio.run(main())
