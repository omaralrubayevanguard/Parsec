import asyncio, json, os, datetime, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
JS = sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": int(os.environ.get("W", 1440)), "height": 900}); pg = await ctx.new_page()
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/t7.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='warranty'; U.modal=null; U.toast=null; __tg.render();})()"); await pg.wait_for_timeout(400)
        print(await pg.evaluate(JS))
        await b.close()
asyncio.run(main())
