import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots10")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.goto("file://" + H + "/t10.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.modal=null; U.view='foreman'; U.pxPop='me'; __tg.render(); })()"); await pg.wait_for_timeout(600)
        el = await pg.query_selector(".pxr-pop")
        print("pop:", bool(el))
        if el: await el.screenshot(path=os.path.join(OUT, "c_pop2.png"))
        print("errs", errs[:6]); await b.close()
asyncio.run(main())
