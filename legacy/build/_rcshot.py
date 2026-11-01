import asyncio, os, sys
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(B, "ptshots")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1200})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/rc_mock.html"); await pg.wait_for_timeout(600)
        for th in (sys.argv[1].split(",") if len(sys.argv) > 1 else ["light"]):
            await pg.click(f'[data-theme-set="{th}"]')
            for d in range(1,9):
                await pg.click(f'[data-demo="{d}"]'); await pg.wait_for_timeout(200)
                t = await pg.evaluate("(()=>{const m=document.querySelector('.mock').innerText.match(/.{0,30}(NaN|undefined|\\[object).{0,30}/); return m?m[0]:null})()")
                if t: print("bad", d, t)
                el = await pg.query_selector(".wt-wrap"); await el.screenshot(path=f"{SH}/rc_{th}_{d}.png")
        print("\n".join(errs) or "no errors"); await b.close()
asyncio.run(main())
