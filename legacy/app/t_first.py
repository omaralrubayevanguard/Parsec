import asyncio, json, sys, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
SH = os.path.join(H, "shots"); os.makedirs(SH, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" else None)
        await pg.goto("file://" + H + "/t4.html"); await pg.wait_for_timeout(2000)
        await pg.evaluate("__tg.applyTheme('ivl')")
        await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(600)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='triage'; U.modal=null; __tg.render();})()"); await pg.wait_for_timeout(700)
        await pg.screenshot(path=SH + "/a_inbox_light.png")
        n = await pg.evaluate("__tg.tgNeedsAll().map(x=>[x.ro.roNumber,x.g,x.btn,x.why])")
        for x in n: print(x)
        print("late:", await pg.evaluate("__tg.tgLateIds().length"), "clashes:", await pg.evaluate("__tg.tgClashes().length"))
        print("errors:", errs[:10]); await b.close()
asyncio.run(main())
