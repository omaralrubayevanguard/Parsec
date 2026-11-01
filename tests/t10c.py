import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots10")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.goto("file://" + H + "/t10.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        go = lambda js: pg.evaluate("(()=>{ const U=__tg.UI(); " + js + "; __tg.render(); })()")
        await go("U.view='profile'; U.pxSec='look'"); await pg.wait_for_timeout(700)
        await pg.screenshot(path=os.path.join(OUT, "c_look.png"))
        await pg.click("[data-action=set-theme][data-theme=vvl]"); await pg.wait_for_timeout(500)
        print("after click:", await pg.evaluate("[document.documentElement.dataset.theme, document.documentElement.dataset.pal, localStorage.getItem('tec_theme')]"))
        await pg.screenshot(path=os.path.join(OUT, "c_look_vvl.png"))
        await pg.reload(); await pg.wait_for_timeout(1200)
        print("after reload:", await pg.evaluate("[document.documentElement.dataset.theme, document.documentElement.dataset.pal]"))
        await go("U.view='foreman'"); await pg.wait_for_timeout(500)
        # profile popover
        await pg.evaluate("(()=>{ const b=document.querySelector('[data-action=px-pop][data-p=me], .pxr-me, [data-action=toggle-profile]'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, "c_pop.png"))
        await pg.keyboard.press("Escape")
        # new RO form
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.modal={type:'add-ro'}; __tg.render(); })()"); await pg.wait_for_timeout(600)
        print("year field:", await pg.evaluate("!!document.getElementById('f-year')"))
        if await pg.evaluate("!!document.getElementById('f-year')"):
            await pg.locator('#f-year').scroll_into_view_if_needed(); await pg.screenshot(path=os.path.join(OUT, "c_newro.png"))
        await pg.evaluate("__tg.applyTheme('ivl')")
        print("errs", errs[:6]); await b.close()
asyncio.run(main())
