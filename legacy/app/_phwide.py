import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_phone")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='profile'; U.pxSec='look'; __tg.render(); })()"); await pg.wait_for_timeout(400)
        await pg.click('[data-action="set-device"][data-mode="phone"]'); await pg.wait_for_timeout(600)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='triage'; __tg.render(); })()"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=f"{OUT}/wide_phone.png")
        print("device:", await pg.evaluate("document.documentElement.getAttribute('data-device')"), "app width:", await pg.evaluate("Math.round(document.getElementById('app').getBoundingClientRect().width)"), "tabs:", await pg.evaluate("(()=>{const r=document.querySelector('.pm-tabs').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)];})()"))
        await pg.click('.pm-tab[data-pm="more"]'); await pg.wait_for_timeout(300); await pg.click('.pm-sheet [data-s="look"]'); await pg.wait_for_timeout(500)
        await pg.click('[data-action="set-device"][data-mode="desktop"]'); await pg.wait_for_timeout(600)
        print("back to computer:", await pg.evaluate("document.documentElement.getAttribute('data-device')"), "rail:", await pg.evaluate("!!document.querySelector('.px-rail')"))
        print("errors", errs[:5]); await b.close()
asyncio.run(main())
