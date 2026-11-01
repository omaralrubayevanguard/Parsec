import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1280, "height": 760})
        await pg.goto("file://" + H + "/Parsec_9.html"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=H + "/shots9/gate_top.png")
        await pg.click('[data-action="fs-pick"]'); await pg.wait_for_timeout(800)   # headless: the picker answers "closed"
        await pg.screenshot(path=H + "/shots9/gate_abort.png")
        await pg.evaluate("document.documentElement.setAttribute('data-theme','ivd')"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=H + "/shots9/gate_abort_d.png")
        open(os.path.join(H, "_frame.html"), "w").write('<!doctype html><body style="margin:0"><iframe id="f" sandbox="allow-scripts allow-same-origin" src="Parsec_9.html" style="width:1280px;height:760px;border:0"></iframe></body>')
        pg2 = await b.new_page(viewport={"width": 1280, "height": 760})
        await pg2.goto("file://" + H + "/_frame.html"); await pg2.wait_for_timeout(2500)
        await pg2.screenshot(path=H + "/shots9/gate_frame.png")
        await pg2.frame_locator("#f").locator('[data-action="fs-local"]').first.click(); await pg2.wait_for_timeout(1200)
        print("after look-around:", (await pg2.frame_locator("#f").locator("body").inner_text())[:120].replace("\n", " | "))
        await b.close()
asyncio.run(main())
