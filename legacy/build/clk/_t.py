import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(H, "shots")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1500, "height": 1000}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/clk.html"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=os.path.join(S, "1.png"), full_page=True)
        await pg.click('[data-speed="60"]'); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(S, "2_fast.png"), full_page=True)
        # hold to stop on the hold card
        bt = pg.locator('[data-card="hold"] [data-pb]'); box = await bt.bounding_box()
        await pg.mouse.move(box["x"] + 20, box["y"] + 20); await pg.mouse.down(); await pg.wait_for_timeout(350)
        await pg.screenshot(path=os.path.join(S, "3_holding.png"), clip={"x": 0, "y": 0, "width": 1500, "height": 1000})
        await pg.wait_for_timeout(500); await pg.mouse.up(); await pg.wait_for_timeout(400)
        el = await pg.query_selector('[data-card="hold"]'); await el.scroll_into_view_if_needed(); await el.screenshot(path=os.path.join(S, "4_reasons.png"))
        await pg.click('[data-card="state"] ~ .ctl [data-st="done"]'); await pg.wait_for_timeout(700)
        el = await pg.query_selector('[data-id="state"]'); await el.screenshot(path=os.path.join(S, "5_done.png"))
        await pg.click('[data-card="left"] [data-big]'); await pg.wait_for_timeout(500)
        el = await pg.query_selector('[data-id="left"]'); await el.screenshot(path=os.path.join(S, "6_left.png"))
        el = await pg.query_selector('[data-id="over"]'); await el.screenshot(path=os.path.join(S, "7_over.png"))
        el = await pg.query_selector('[data-id="miles"]'); await el.screenshot(path=os.path.join(S, "8_miles.png"))
        await pg.click('.mk [data-th="graphite"]'); await pg.wait_for_timeout(400)
        await pg.screenshot(path=os.path.join(S, "9_dark.png"))
        print("ERRORS", errs); await b.close()
asyncio.run(main())
