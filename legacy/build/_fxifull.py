import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page()
        await pg.goto("file://" + B + "/fxi_mock.html"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=B+"/ptshots/fxi_full.png")
        print(await pg.evaluate("JSON.stringify([document.querySelector('.wt-bar').getBoundingClientRect(), document.querySelector('.wt-wrap').getBoundingClientRect(), getComputedStyle(document.querySelector('.wt-bar')).position])"))
        await b.close()
asyncio.run(main())
