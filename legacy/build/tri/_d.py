import asyncio, os
from playwright.async_api import async_playwright
T = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        pg.on("pageerror", lambda e: print("ERR", e.stack)); pg.on("console", lambda m: print("CON", m.text))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + T + "/tri.html"); await pg.wait_for_timeout(300)
        await pg.click('[data-xd="tech"]'); await pg.click('[data-xw="Dana Kowalski"]'); await pg.click('[data-xy="Repair — approved"]')
        print(await pg.evaluate("document.querySelectorAll('[data-x=xgo]').length"), await pg.evaluate("document.querySelector('[data-x=xgo]').outerHTML.slice(0,120)"))
        await pg.click('[data-x="xgo"]'); await pg.wait_for_timeout(200)
        print(await pg.evaluate("(document.querySelector('.card.new')||{}).textContent"))
        await b.close()
asyncio.run(main())
