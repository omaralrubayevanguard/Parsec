import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page()
        await pg.goto("file://" + H + "/t10.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='foreman'; __tg.render(); })()"); await pg.wait_for_timeout(600)
        await pg.click("[data-v10=hand]"); await pg.wait_for_timeout(300)
        print(await pg.evaluate("""(()=>{ const h=document.querySelector('#v10-ho h2'); const cs=getComputedStyle(h); const r=getComputedStyle(document.documentElement); return [cs.fontFamily, cs.fontSize, r.getPropertyValue('--px-serif'), r.getPropertyValue('--tg-serif'), r.getPropertyValue('--font-serif'), getComputedStyle(document.body).getPropertyValue('--px-serif')]; })()"""))
        print(await pg.evaluate("""(()=>{ const e=document.querySelector('.pxr-tl')||document.body; return getComputedStyle(e).getPropertyValue('--px-serif'); })()"""))
        await b.close()
asyncio.run(main())
