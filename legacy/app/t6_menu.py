import asyncio, os, datetime, json, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH=os.path.join(H,'shots6')
PAGE = sys.argv[1] if len(sys.argv)>1 else 't5.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("__tg.applyTheme('ivl')")
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='console'; U.modal=null; U.toast=null; __tg.render();})()"); await pg.wait_for_timeout(300)
        # open settings from the sidebar
        btn = await pg.query_selector(".iv-side [data-action='toggle-app-menu'], .iv-side .iv-set, [data-action='toggle-app-menu']")
        print("btn", btn is not None)
        if btn: await btn.click(); await pg.wait_for_timeout(400)
        await pg.screenshot(path=f"{SH}/m1_menu.png")
        tiles = await pg.evaluate("[...document.querySelectorAll('[data-action=set-theme]')].map(e=>e.dataset.theme+':'+e.textContent.trim())")
        print("tiles", tiles)
        if tiles:
            t = await pg.query_selector("[data-action=set-theme]:not(.on)")
            await t.click(); await pg.wait_for_timeout(500)
            print("theme now", await pg.evaluate("document.documentElement.getAttribute('data-theme')"), "side", await pg.evaluate("!!document.querySelector('.iv-side') && getComputedStyle(document.querySelector('.iv-side')).position"))
            await pg.screenshot(path=f"{SH}/m2_after.png")
        await b.close()
asyncio.run(main())
