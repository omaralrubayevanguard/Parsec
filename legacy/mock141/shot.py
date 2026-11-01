import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1440, "height": 900}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:200])); pg.on("console", lambda m: errs.append(m.text[:200]) if m.type == "error" else None)
        await pg.goto("file://" + H + "/out.html"); await pg.wait_for_timeout(500)
        n = await pg.evaluate("document.querySelectorAll('.idea').length"); print("ideas", n)
        await pg.click("#i-today .opt:nth-child(1)"); await pg.click("#i-views .opt:nth-child(1)"); await pg.click("#i-release .opt:nth-child(1)")
        await pg.click("#pk-open"); await pg.wait_for_timeout(200)
        print(await pg.evaluate("document.querySelector('#picks pre').textContent"))
        await pg.screenshot(path=os.path.join(H, "m1_light.png"), full_page=False)
        await pg.click("#picks .x"); await pg.click(".mk button[data-th=graphite]"); await pg.wait_for_timeout(200)
        await pg.evaluate("document.querySelector('#s-3').scrollIntoView()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(H, "m2_dark.png"))
        h = await pg.evaluate("document.documentElement.scrollHeight"); print("height", h)
        ov = await pg.evaluate("[...document.querySelectorAll('.vis')].filter(v=>v.scrollWidth>v.clientWidth+2).map(v=>v.closest('.idea').id)"); print("overflow", ov)
        print("ERRORS", errs)
        await b.close()
asyncio.run(main())
