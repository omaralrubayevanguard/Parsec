import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1200})).new_page()
        await pg.goto("file://" + B + "/mg_mock.html"); await pg.wait_for_timeout(400)
        await pg.keyboard.press("d"); await pg.wait_for_timeout(100)
        el = await pg.query_selector(".wt-wrap"); await el.screenshot(path=B+"/ptshots/mg_today_ov.png")
        await pg.click('.mg-tile[data-k="sales"]'); await pg.wait_for_timeout(100)
        await el.screenshot(path=B+"/ptshots/mg_today_kpi.png")
        await b.close()
asyncio.run(main())
