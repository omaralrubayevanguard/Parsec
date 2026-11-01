import asyncio, sys, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(H, "shots")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.goto("file://" + H + "/t4.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='foreman'; U.modal=null; U.toast=null; __tg.render();})()"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=SH + "/fm_now1.png")
        await pg.screenshot(path=SH + "/fm_now_full.png", full_page=True)
        print(await pg.evaluate("document.documentElement.scrollHeight"))
        await b.close()
asyncio.run(main())
