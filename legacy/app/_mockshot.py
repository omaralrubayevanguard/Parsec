import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1100})).new_page()
        await pg.goto("file://" + sys.argv[1]); await pg.wait_for_timeout(800)
        for i,cl in enumerate(sys.argv[3:]):
            if cl: 
                try: await pg.click(cl); await pg.wait_for_timeout(300)
                except Exception as e: print("noclick", cl)
            await pg.screenshot(path=sys.argv[2].replace(".png", "_%d.png" % i))
        await b.close()
asyncio.run(main())
