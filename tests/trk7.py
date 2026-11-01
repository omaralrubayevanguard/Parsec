import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_trk")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in [1280, 1024]:
            ctx = await b.new_context(viewport={"width":w,"height":800}); pg = await ctx.new_page()
            await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
            await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
            await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(x=>!x.shop && __tg.trkPick(x).kind==='model' && __tg.trkPick(x).entry.id==='st-gray'); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); })()"); await pg.wait_for_timeout(1000)
            await pg.screenshot(path=os.path.join(OUT, f"w{w}.png"), clip={"x":0,"y":0,"width":w,"height":360})
            print(w, await pg.evaluate("""(()=>{ const R=document.querySelector('.jc-host').shadowRoot; const t=R.querySelector('.px-trk'), p=t.querySelector('.px-trk__pic'), tb=t.querySelector('.px-titleblock'); const a=t.getBoundingClientRect(), c=p.getBoundingClientRect(), d=tb.getBoundingClientRect(); return 'band '+Math.round(a.width)+'x'+Math.round(a.height)+' pic '+Math.round(c.width)+' title '+Math.round(d.width); })()"""))
            await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='rolist'; U.selectedRo=null; __tg.render(); })()"); await pg.wait_for_timeout(1200)
            await pg.screenshot(path=os.path.join(OUT, f"wl{w}.png"), clip={"x":0,"y":150,"width":w,"height":300})
            print(w, "list", await pg.evaluate("(()=>{ const r=document.querySelector('.rq-rows'); const c=document.querySelector('.rq-row .rq-cu'); return (r? r.scrollWidth+'/'+r.clientWidth : '')+' cu '+(c? Math.round(c.getBoundingClientRect().width):''); })()"))
            await ctx.close()
        await b.close()
asyncio.run(main())
