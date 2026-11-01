import asyncio, json, os, datetime, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(H, "shots7")
THEME = sys.argv[1] if len(sys.argv) > 1 else "ivl"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "ERR_TUNNEL" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.goto("file://" + H + "/t7.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate(f"__tg.applyTheme('{THEME}')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(400)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='warranty'; U.modal=null; U.toast=null; __tg.render();})()"); await pg.wait_for_timeout(500)
        N = await pg.evaluate("__tg.waNeedsAll().map(x=>[x.g, x.ro.roNumber, x.why, x.btn, !!x.late])")
        for x in N: print(x)
        print("badge", await pg.evaluate("__tg.waBadgeN()"), "ros", await pg.evaluate("__tg.waRos().length"))
        await pg.screenshot(path=f"{SH}/a_claims_{THEME}.png")
        for v in ["board", "money", "parts"]:
            await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.waView='{v}'; __tg.render();}})()"); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f"{SH}/a_{v}_{THEME}.png")
        print("\n".join(errs[:20]))
        await b.close()
asyncio.run(main())
