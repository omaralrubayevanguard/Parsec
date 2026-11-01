import asyncio, os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":390,"height":844}, device_scale_factor=2); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + os.path.join(D, "cat_out.html")); await pg.wait_for_timeout(800)
        print("scrollW", await pg.evaluate("document.documentElement.scrollWidth"), errs); print(await pg.evaluate("[...document.querySelectorAll(\"body *\")].filter(e=>e.getBoundingClientRect().right>392).slice(0,8).map(e=>e.tagName+\".\"+e.className+\" \"+Math.round(e.getBoundingClientRect().right)).join(\" | \")"))
        await pg.screenshot(path=os.path.join(D, "cat", "s_m.png"))
        await b.close()
asyncio.run(main())
