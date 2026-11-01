import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1500, "height": 950}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        await pg.goto("file://" + H + "/out.html"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=H + "/s1.png", full_page=True)
        await pg.click(".opt[data-k=a_scope][data-v=page]"); await pg.click("#pk-open"); await pg.wait_for_timeout(200)
        await pg.click(".mk button[data-th=graphite]"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=H + "/s2.png")
        print("ERRORS", errs)
        await b.close()
asyncio.run(main())
