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
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='foreman'; U.modal=null; __tg.render();})()")
        ids = await pg.evaluate(SEED)
        await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.fmSel='{ids['sent']}'; U.fmPop=null; __tg.render();}})()"); await pg.wait_for_timeout(200)
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.fmSel='{ids['qc']}'; U.fmPop=null; __tg.render();}})()"); await pg.wait_for_timeout(200)
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        print("cleared", await pg.evaluate("__tg.fmClearedList().map(c=>c.what)"))
        print("link", await pg.evaluate("(document.querySelector('.fm .tg-cl, .fm [data-action=fm-open][data-k=cl]')||{}).textContent"))
        await pg.keyboard.press("?"); await pg.wait_for_timeout(300); await pg.screenshot(path=f"{SH}/f1_keys.png"); await pg.keyboard.press("Escape")
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='parts'; __tg.render();})()"); await pg.wait_for_timeout(300)
        print("badge", await pg.evaluate("(document.querySelector('.fm-nb')||{}).textContent"), "title", await pg.evaluate("document.title"))
        print("errors", errs)
        await b.close()
asyncio.run(main())
