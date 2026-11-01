import asyncio, sys, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1000)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()")
        for js in sys.argv[1:]:
            try: print(await pg.evaluate(js))
            except Exception as e: print("ERR", str(e)[:300])
        print("errors", errs[:5]); await b.close()
asyncio.run(main())
