import asyncio, sys, os, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
JS = sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + H + "/t8.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(400)
        r = await pg.evaluate(JS)
        print(json.dumps(r, indent=1)[:4000]); print(errs[:5])
        if len(sys.argv) > 2: await pg.screenshot(path=os.path.join(H, "shots8", sys.argv[2] + ".png"))
        await b.close()
asyncio.run(main())
