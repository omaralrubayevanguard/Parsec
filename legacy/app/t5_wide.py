import asyncio, os, datetime
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(H, "shots5")
SEED = open(os.path.join(H, "t5_fm.py")).read().split('SEED = r"""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        for w, h in [(1280, 800), (1920, 1080)]:
            pg = await (await b.new_context(viewport={"width": w, "height": h})).new_page()
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
            await pg.goto("file://" + H + "/t5.html"); await pg.wait_for_timeout(1500)
            await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
            await pg.evaluate("(()=>{const U=__tg.UI(); U.view='foreman'; U.modal=null; __tg.render();})()")
            await pg.evaluate(SEED)
            for v in ["floor", "techs", "tmr"]:
                await pg.evaluate("(()=>{const U=__tg.UI(); U.toast=null; U.fmView='%s'; __tg.fmNcClear(); __tg.render();})()" % v); await pg.wait_for_timeout(400)
                await pg.screenshot(path=f"{SH}/w{w}_{v}.png")
                ov = await pg.evaluate("(()=>{const r=document.documentElement; return [r.scrollWidth, r.clientWidth, [...document.querySelectorAll('.fm *')].filter(e=>{const b=e.getBoundingClientRect(); return b.right>innerWidth+1 && b.width>0 && getComputedStyle(e).position!=='fixed'}).slice(0,5).map(e=>e.className)]})()")
                print(w, v, ov)
        print("errors", errs)
        await b.close()
asyncio.run(main())
