import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
F = "/mnt/user-data/outputs/Parsec tooltips ideas mock-up.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1500, "height": 950}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        await pg.goto("file://" + F); await pg.wait_for_timeout(500)
        await pg.screenshot(path=H + "/s1.png", full_page=True)
        o = await pg.query_selector(".opt[data-k]"); await o.click()
        await pg.click("#pk-open"); await pg.wait_for_timeout(200)
        await pg.click(".mk button[data-th=graphite]"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=H + "/s2.png", full_page=True)
        await pg.set_viewport_size({"width": 390, "height": 800}); await pg.wait_for_timeout(200)
        print("PHONE scrollWidth", await pg.evaluate("document.documentElement.scrollWidth"))
        await pg.screenshot(path=H + "/s3.png", full_page=True)
        print("ERRORS", errs)
        await b.close()
asyncio.run(main())
