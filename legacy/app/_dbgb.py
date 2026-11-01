import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        pg.on("pageerror", lambda e: print("ERR", str(e)[:500]))
        pg.on("console", lambda m: print("CON", m.type, m.text[:300]) if m.type in ("error","warning") else None)
        await pg.goto("file://" + os.getcwd() + "/t12_b.html"); await pg.wait_for_timeout(1500)
        print(await pg.evaluate("typeof __tg"))
        await b.close()
asyncio.run(main())
