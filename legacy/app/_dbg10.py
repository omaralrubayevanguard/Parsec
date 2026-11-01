import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PLACE = open(os.path.join(H, "_fm2.py")).read().split('PLACE = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.goto("file://" + H + "/t10.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        print("placed", await pg.evaluate(PLACE))
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='profile'; U.pxSec='data'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        print(await pg.evaluate("JSON.stringify([...document.querySelectorAll('.px-trkr__top')].slice(0,6).map(b=>[b.className, getComputedStyle(b.querySelector('img')||b).objectFit]))"))
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='foreman'; U.fmView='floor'; __tg.render(); })()"); await pg.wait_for_timeout(1200)
        print("bays:", await pg.evaluate("[document.querySelectorAll('.fm-ti.top.up').length, document.querySelectorAll('.fm-ti.top').length, document.querySelectorAll('.fm-ti').length, document.querySelectorAll('.fm-bay[data-ro]').length]"))
        await pg.screenshot(path=os.path.join(H, "shots10", "b_fm.png"))
        print(errs); await b.close()
asyncio.run(main())
