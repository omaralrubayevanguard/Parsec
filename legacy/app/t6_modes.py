import asyncio, os, datetime, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH=os.path.join(H,'shots6')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/t6.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        async def go(view, js=""):
            await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.view='{view}'; U.modal=null; U.toast=null; U.appMenu=false; {js}; __tg.render();}})()"); await pg.wait_for_timeout(400)
        async def click(sel):
            await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.appMenu=true; __tg.render();}})()"); await pg.wait_for_timeout(200)
            await pg.click(sel); await pg.wait_for_timeout(300)
        for th in ["ivl", "ivd"]:
            await pg.evaluate(f"__tg.applyTheme('{th}')")
            for mode in ["tablet", "phone", "desktop"]:
                await go("console"); await click(f"[data-action=set-device][data-mode={mode}]")
                for v in ["console", "triage", "warranty"]:
                    await go(v); await pg.screenshot(path=f"{SH}/d_{th}_{mode}_{v}.png")
                    print(th, mode, v, await pg.evaluate("[document.documentElement.dataset.theme, document.documentElement.dataset.device, !!document.querySelector('.iv-side'), document.querySelector('.iv-side') && getComputedStyle(document.querySelector('.iv-side')).position]"))
            await click("[data-action=set-device][data-mode=auto]")
            for sz in ["large", "floor", "normal"]:
                await go("console", f"U.size='{sz}'"); await pg.evaluate("__tg.render()")
                for v in ["console", "foreman"]:
                    await go(v); await pg.screenshot(path=f"{SH}/s_{th}_{sz}_{v}.png")
        print("errors", errs)
        await b.close()
asyncio.run(main())
