import asyncio, os, datetime
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(H, "shots5")
SEED = open(os.path.join(H, "t5_fm.py")).read().split('SEED = r"""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/t5.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='foreman'; U.modal=null; __tg.render();})()")
        await pg.evaluate(SEED)
        for t in ["mist", "atl", "atd", "glacier"]:
            await pg.evaluate(f"__tg.applyTheme('{t}')"); await pg.evaluate("(()=>{const U=__tg.UI(); U.toast=null; U.view='foreman'; U.fmView='floor'; __tg.fmNcClear(); __tg.render();})()"); await pg.wait_for_timeout(500)
            await pg.screenshot(path=f"{SH}/t_{t}.png")
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='rolist'; __tg.render();})()"); await pg.wait_for_timeout(400); await pg.screenshot(path=f"{SH}/t_glacier_badge.png")
        print("errors", errs)
        await b.close()
asyncio.run(main())
