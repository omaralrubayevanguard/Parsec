import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":390,"height":844})
        pg.on("pageerror", lambda e: print("PAGEERR", e)); pg.on("console", lambda m: print("CON", m.type, m.text))
        await pg.goto("file://"+sys.argv[1]); await pg.wait_for_timeout(800)
        print(await pg.evaluate("document.getElementById('app').innerHTML.length"))
        await b.close()
asyncio.run(main())
