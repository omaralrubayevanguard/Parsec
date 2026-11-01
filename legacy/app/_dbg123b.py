import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1200)
        print(await pg.evaluate("""(()=>{ const b=document.querySelector('.pxr-thm button[aria-pressed=true]'); const c=getComputedStyle(b); return [c.boxShadow, c.outline, c.border, c.background, b.className, document.activeElement===b]; })()"""))
        await b.close()
asyncio.run(main())
