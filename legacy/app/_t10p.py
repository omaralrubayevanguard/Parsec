import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots10")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=True, has_touch=True); pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script("try{localStorage.setItem('tec_device','phone')}catch(e){}")
        await pg.goto("file://" + H + "/t10.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(400)
        go = lambda js: pg.evaluate("(()=>{ const U=__tg.UI(); " + js + "; __tg.render(); })()")
        await go("U.view='ros'; U.selectedRo=__tg.STATE().ros.find(x=>!x.shop && x.model).id"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "p_ro.png"))
        await pg.evaluate("document.querySelector('.jc-host').shadowRoot.querySelector('.px-trk__cam').click()"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, "p_dlg.png"))
        await pg.click('[data-td=cat]'); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, "p_cat.png"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        await go("U.view='profile'; U.pxSec='look'"); await pg.wait_for_timeout(700)
        await pg.screenshot(path=os.path.join(OUT, "p_look.png"))
        await go("U.view='foreman'; U.fmView='floor'"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "p_fm.png"))
        print("errs", errs[:6]); await b.close()
asyncio.run(main())
