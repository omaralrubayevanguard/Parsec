import asyncio, os, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1500,"height":1000})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://"+os.path.abspath("mv_out.html")); await pg.wait_for_timeout(600)
        await pg.screenshot(path="mvshots/a_full.png", full_page=True)
        await pg.click('[data-nav="B"]'); await pg.wait_for_timeout(300); await pg.screenshot(path="mvshots/b_full.png", full_page=True)
        await pg.click('[data-theme-set="dark"]'); await pg.wait_for_timeout(300); await pg.screenshot(path="mvshots/b_dark.png", full_page=True)
        print("errors", errs); await b.close()
asyncio.run(main())
