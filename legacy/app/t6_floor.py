import asyncio, os, datetime, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH=os.path.join(H,'shots6')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs=[]
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/t6.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("__tg.applyTheme('ivl')")
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='console'; U.size='floor'; U.modal=null; U.toast=null; U.appMenu=true; __tg.render();})()"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=f"{SH}/f_menu_floor.png")
        print(await pg.evaluate("""(()=>{ const m=document.querySelector('.app-menu, .pnav-set .app-menu-pop, [role=menu]'); if(!m) return 'no menu'; const b=m.getBoundingClientRect(); const c=getComputedStyle(m); const n=document.querySelector('[data-size=normal]').getBoundingClientRect(); return [m.className, Math.round(b.y), Math.round(b.height), c.overflowY, c.position, c.maxHeight, Math.round(n.y), Math.round(n.height), document.documentElement.className]; })()"""))
        await b.close()
asyncio.run(main())
