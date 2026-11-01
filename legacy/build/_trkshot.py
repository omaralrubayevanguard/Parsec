import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1400,"height":1000})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://"+os.path.abspath("trk_out.html")); await pg.wait_for_timeout(700)
        for lay in "ABC":
            await pg.click(f'[data-lay="{lay}"]'); await pg.wait_for_timeout(200)
            el = await pg.query_selector('#s1'); await el.screenshot(path=f"trk/shot_{lay}.png")
        await pg.click('[data-lay="A"]'); await pg.click('[data-pic="photo"]'); await pg.wait_for_timeout(200)
        el = await pg.query_selector('#s1'); await el.screenshot(path="trk/shot_A_photo.png")
        await pg.click('[data-pic="model"]'); await pg.wait_for_timeout(200)
        await pg.screenshot(path="trk/full.png", full_page=True)
        await pg.click('[data-theme-set="dark"]'); await pg.wait_for_timeout(200)
        await pg.screenshot(path="trk/full_dark.png", full_page=True)
        print("errors", errs); await b.close()
asyncio.run(main())
