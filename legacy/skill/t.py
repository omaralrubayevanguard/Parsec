import asyncio
from playwright.async_api import async_playwright
F = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/skill/template.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1200, "height": 700}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + F); await pg.wait_for_timeout(300)
        steps = []
        for i in range(8): steps.append(await pg.evaluate("document.querySelector('.ip-vis').dataset.step")); await pg.wait_for_timeout(450)
        print("steps", steps)
        await pg.click(".ip-opt[data-v=ink]"); await pg.click("#ip-open"); await pg.wait_for_timeout(200)
        print(await pg.evaluate("document.querySelector('#ip-picks pre').textContent"))
        await pg.click(".ip-seg button[data-th=dark]"); await pg.wait_for_timeout(1600)
        await pg.screenshot(path="s_dark.png")
        await pg.set_viewport_size({"width": 390, "height": 800}); await pg.wait_for_timeout(200)
        print("scrollW", await pg.evaluate("document.documentElement.scrollWidth"), "errs", errs)
        await b.close()
asyncio.run(main())
