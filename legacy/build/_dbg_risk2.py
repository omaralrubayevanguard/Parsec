import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page()
        await pg.goto("file://" + B + "/fmf_test.html"); await pg.wait_for_timeout(600)
        await pg.click("[data-demo='risk']"); await pg.wait_for_timeout(200)
        print(await pg.evaluate("[...document.querySelectorAll('.tg-pop [data-a]')].map(b=>b.dataset.a+':'+(b.dataset.i||'')).join(' ')"))
        print(await pg.evaluate("document.querySelectorAll('.tg-pop').length"))
        await b.close()
asyncio.run(main())
