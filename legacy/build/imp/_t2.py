import asyncio, os
from playwright.async_api import async_playwright
T = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 1000})).new_page()
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + T + "/imp.html"); await pg.wait_for_timeout(300)
        await pg.click('[data-run="2"]'); await pg.wait_for_timeout(200)
        await pg.evaluate("window.scrollTo(0, 340)"); await pg.wait_for_timeout(100)
        await pg.screenshot(path=os.path.join(T, "shots", "d_2a.png"))
        await pg.evaluate("document.querySelector('.fs').scrollTop = 700"); await pg.wait_for_timeout(100)
        await pg.screenshot(path=os.path.join(T, "shots", "d_2b.png"))
        await pg.evaluate("document.querySelector('.fs').scrollTop = 1500"); await pg.wait_for_timeout(100)
        await pg.screenshot(path=os.path.join(T, "shots", "d_2c.png"))
        await pg.evaluate("window.scrollTo(0, 1400)"); await pg.wait_for_timeout(100)
        await pg.screenshot(path=os.path.join(T, "shots", "d_map.png"))
        await b.close()
asyncio.run(main())
