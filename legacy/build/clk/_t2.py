import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(H, "shots")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1500, "height": 1000}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/clk.html"); await pg.wait_for_timeout(1200)
        bt = pg.locator('[data-card="hold"] [data-pb]'); await bt.hover(); box = await bt.bounding_box()
        await pg.mouse.down(); await pg.wait_for_timeout(380)
        el = await pg.query_selector('[data-id="hold"]'); await el.screenshot(path=os.path.join(S, "h1.png"))
        await pg.wait_for_timeout(500); await pg.mouse.up(); await pg.wait_for_timeout(600)
        await el.screenshot(path=os.path.join(S, "h2.png"))
        el3 = await pg.query_selector('[data-id="bar"]'); await el3.screenshot(path=os.path.join(S, "h3.png"))
        await pg.click('.mk [data-th="black"]'); await pg.wait_for_timeout(300)
        el4 = await pg.query_selector('.lead'); await el4.screenshot(path=os.path.join(S, "h4.png"))
        print("ERR", errs); await b.close()
asyncio.run(main())
