import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_trk")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in [1280, 1024]:
            ctx = await b.new_context(viewport={"width":w,"height":800}); pg = await ctx.new_page()
            await pg.goto("file://" + H + "/t9_96.html"); await pg.wait_for_timeout(1200)
            await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
            await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(x=>!x.shop && true); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); })()"); await pg.wait_for_timeout(1000)
            await pg.screenshot(path=os.path.join(OUT, f"o{w}.png"), clip={"x":0,"y":0,"width":w,"height":360})
            print(w, await pg.evaluate("""(()=>{ return 1; })()"""))
            await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='rolist'; U.selectedRo=null; __tg.render(); })()"); await pg.wait_for_timeout(1200)
            await pg.screenshot(path=os.path.join(OUT, f"ol{w}.png"), clip={"x":0,"y":150,"width":w,"height":300})
            print(w, "list", await pg.evaluate("(()=>{ const r=document.querySelector('.rq-rows'); const c=document.querySelector('.rq-row .rq-cu'); return (r? r.scrollWidth+'/'+r.clientWidth : '')+' cu '+(c? Math.round(c.getBoundingClientRect().width):''); })()"))
            await ctx.close()
        await b.close()
asyncio.run(main())
