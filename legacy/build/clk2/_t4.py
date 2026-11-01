import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(H, "shots")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        pg = await b.new_page(viewport={"width": 1500, "height": 900})
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/clk2.html"); await pg.wait_for_timeout(800)
        await pg.click('[data-ch="motion"][data-v="calm"]'); await pg.wait_for_timeout(200)
        print("calm class", await pg.evaluate("document.documentElement.className"))
        await pg.click('[data-act="complete"][data-k="badge"]'); await pg.wait_for_timeout(200)
        print("calm burst", await pg.locator('[data-card="badge"] .burst').count(), "breathe", await pg.locator('[data-card="you"] .cc').evaluate("e => getComputedStyle(e).animationName"))
        await pg.locator('[data-card="you"] [data-focus]').click(); await pg.wait_for_timeout(100)
        print("calm focus", await pg.locator('.fx').count()); await pg.keyboard.press("Escape")
        await pg.click('[data-ch="motion"][data-v="full"]'); await pg.wait_for_timeout(200)
        print("full class", await pg.evaluate("document.documentElement.className"), await pg.locator('[data-card="you"] .cc').evaluate("e => getComputedStyle(e).animationName"))
        await pg.click('[data-ch="use"][data-v="badge"]'); await pg.wait_for_timeout(200)
        print("badge via choices -> tile on:", await pg.locator('[data-id="badge"]').evaluate("e => e.classList.contains('on')"))
        await pg.set_viewport_size({"width": 390, "height": 844}); await pg.wait_for_timeout(600)
        print("after resize you nar:", await pg.locator('[data-card="you"] .cc').evaluate("e => e.classList.contains('nar')"), "mk pos", await pg.locator('.mk').evaluate("e => getComputedStyle(e).position"))
        print("ERRORS", errs); await b.close()
asyncio.run(main())
