import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_phone")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page()
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        for v in ["ros","rolist","foreman"]:
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; U.toast=null; __tg.render(); }})()"); await pg.wait_for_timeout(600)
            await pg.screenshot(path=f"{OUT}/desk_{v}.png")
        await b.close()
asyncio.run(main())
