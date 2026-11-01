import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(H, "shots")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        pg = await b.new_page(viewport={"width": 1500, "height": 900})
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/clk2.html"); await pg.wait_for_timeout(800)
        await pg.click('.mk [data-th="graphite"]'); await pg.click('[data-speed="600"]'); await pg.wait_for_timeout(4800)
        await pg.screenshot(path=os.path.join(S, "e01_graphite_lunch.png"), clip={"x": 0, "y": 0, "width": 1500, "height": 620})
        print("ERRORS", errs); await b.close()
asyncio.run(main())
