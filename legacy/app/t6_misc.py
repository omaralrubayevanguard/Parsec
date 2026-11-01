import asyncio, os, datetime, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH=os.path.join(H,'shots6')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/t6.html"); await pg.wait_for_timeout(1500)
        print("first open theme:", await pg.evaluate("document.documentElement.dataset.theme"))
        for old, want in [("mist","ivd"),("glacier","ivl"),("atl","ivl"),("atd","ivd"),("ivd","ivd"),("bogus","ivl")]:
            await pg.evaluate(f"localStorage.setItem('tec_theme','{old}')"); await pg.reload(); await pg.wait_for_timeout(1200)
            got = await pg.evaluate("[document.documentElement.dataset.theme, localStorage.getItem('tec_theme'), !!document.querySelector('.iv-side')]")
            print(old, "->", got, "OK" if got[0]==want else "FAIL")
        await pg.evaluate("__tg.sample()"); await pg.evaluate("__tg.applyTheme('ivl')")
        # theme button cycles Ivory <-> Graphite
        for v in ["timelog", "fixes"]:
            await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.view='{v}'; U.modal=null; U.toast=null; __tg.render();}})()"); await pg.wait_for_timeout(400)
            await pg.evaluate("window.scrollTo(0, 700)"); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f"{SH}/x_{v}_scrolled.png")
            print(v, await pg.evaluate("(()=>{const th=document.querySelector('.tl-table thead th'); const l=document.querySelector('.ro-list'); return [th&&Math.round(th.getBoundingClientRect().top), l&&Math.round(l.getBoundingClientRect().height)]})()"))
        print("errors", errs)
        await b.close()
asyncio.run(main())
