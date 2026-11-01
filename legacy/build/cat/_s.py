import asyncio, os, sys
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900}); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + os.path.join(D, "cat_out.html")); await pg.wait_for_timeout(800)
        await pg.screenshot(path=os.path.join(D, "cat", "s_top.png"))
        await pg.screenshot(path=os.path.join(D, "cat", "s_full.png"), full_page=True)
        await pg.fill("#dec", "VHD64F300"); await pg.wait_for_timeout(300)
        print("decode:", await pg.inner_text("#decr"))
        await pg.fill("#dec", "VNL64T760"); await pg.wait_for_timeout(300)
        print("decode:", await pg.inner_text("#decr"))
        await pg.click("[data-fam-set=VHD]"); await pg.wait_for_timeout(300)
        await pg.click(".cc .cc-ch[data-k=body] button[data-v=truck]"); await pg.wait_for_timeout(200)
        await pg.evaluate("document.documentElement.setAttribute('data-theme','dark')"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(D, "cat", "s_vhd_dark.png"))
        print("cards", await pg.evaluate("document.querySelectorAll('.cc').length"), "errs", errs[:3])
        await b.close()
asyncio.run(main())
