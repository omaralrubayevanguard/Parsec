import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1200})).new_page()
        await pg.goto("file://" + B + "/mgi_mock.html"); await pg.wait_for_timeout(400)
        await pg.click('[data-demo="d10"]'); await pg.click('[data-a="unl"]'); await pg.wait_for_timeout(100)
        el = await pg.query_selector(".wt-wrap"); await el.screenshot(path=B+"/ptshots/mgi_unl.png")
        await b.close()
asyncio.run(main())
