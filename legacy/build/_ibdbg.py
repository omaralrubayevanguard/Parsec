import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1200})).new_page()
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)+" | "+(e.stack or "")[:600]))
        await pg.goto("file://" + B + "/ib2_mock.html"); await pg.wait_for_timeout(500)
        print("load:", errs); errs.clear()
        for d in ["thread","snz","clear","late","away","sent","sum","phone","bulk","eos","try"]:
            await pg.click(f'[data-demo="{d}"]'); await pg.wait_for_timeout(700)
            if errs: print(d, errs); errs.clear()
        await b.close()
asyncio.run(main())
