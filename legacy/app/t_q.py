import asyncio, sys, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.goto("file://" + H + "/t4.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(400)
        print(await pg.evaluate("__tg.S().ros.filter(r=>!r.shop).map(r=>[r.roNumber,__tg.tyCat(r),r.location,__tg.spotOf(r.location),r.assignedTech])"))
        await b.close()
asyncio.run(main())
