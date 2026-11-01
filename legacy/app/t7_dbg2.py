import asyncio, json, os, datetime
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" else None)
        await pg.goto("file://" + H + "/t7.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        r = await pg.evaluate("__tg.S().ros.find(x=>x.customerName==='Silverline LTL').id")
        await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.view='warranty'; U.modal=null; U.toast=null; U.waSel='{r}'; __tg.render();}})()"); await pg.wait_for_timeout(400)
        await pg.click('.wa .wa-op [data-action="wa-pop"][data-p="paid"]'); await pg.wait_for_timeout(250)
        print(await pg.evaluate("JSON.stringify(__tg.UI().waPop)"))
        await pg.fill("#wa-pd", "300"); await pg.wait_for_timeout(100)
        print(await pg.evaluate("JSON.stringify(__tg.UI().waPop)"), await pg.evaluate("document.activeElement.id"))
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(250)
        print(await pg.evaluate("JSON.stringify(__tg.UI().waPop)"), await pg.evaluate("document.activeElement.id"))
        await pg.click('.wa .tg-pop [data-action="wa-set"][data-f="why"]'); await pg.wait_for_timeout(250)
        print(await pg.evaluate("JSON.stringify(__tg.UI().waPop)"), await pg.evaluate("document.activeElement.outerHTML.slice(0,90) + ' fv=' + document.activeElement.matches(':focus-visible')"))
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(250)
        print(await pg.evaluate("JSON.stringify(__tg.UI().waPop)"), await pg.evaluate("__tg.UI().toast"))
        print("\n".join(errs))
        await b.close()
asyncio.run(main())
