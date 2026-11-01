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
        r = await pg.evaluate("__tg.S().ros.find(x=>x.customerName==='Highplains Grain').id")
        await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.view='warranty'; U.modal=null; U.toast=null; U.waSel='{r}'; __tg.render();}})()"); await pg.wait_for_timeout(400)
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(250)
        print(await pg.evaluate("JSON.stringify(__tg.UI().waPop)"), await pg.evaluate("document.activeElement.tagName"))
        await pg.keyboard.press("2"); await pg.wait_for_timeout(250)
        print(await pg.evaluate("JSON.stringify(__tg.UI().waPop)"), await pg.evaluate("document.activeElement.tagName + ' ' + (document.activeElement.dataset.waIn||'')"))
        await pg.keyboard.type("Seized bolts"); await pg.wait_for_timeout(100)
        print(await pg.evaluate("JSON.stringify(__tg.UI().waPop)"))
        btn = await pg.evaluate("(()=>{const b=document.querySelector('.wa .tg-pop [data-action=\"wa-go\"]'); return b? b.outerHTML.slice(0,120)+' dis='+b.disabled : null})()"); print(btn)
        await pg.click('.wa .tg-pop [data-action="wa-go"]'); await pg.wait_for_timeout(300)
        print(await pg.evaluate("JSON.stringify(__tg.UI().waPop)"), await pg.evaluate("__tg.UI().toast"))
        print(await pg.evaluate(f"JSON.stringify(__tg.wcOps(__tg.getRO('{r}')).map(o=>[__tg.wcStatus(__tg.getRO('{r}'),o), o.claim.appeal]))"))
        # file
        r2 = await pg.evaluate("__tg.S().ros.find(x=>x.customerName==='Midway Auto Transport').id")
        print(await pg.evaluate(f"JSON.stringify(__tg.wcOps(__tg.getRO('{r2}')).map(o=>__tg.waChecks(__tg.getRO('{r2}'),o).filter(x=>x.req&&!x.ok).map(x=>x.t)))"))
        print("\n".join(errs))
        await b.close()
asyncio.run(main())
