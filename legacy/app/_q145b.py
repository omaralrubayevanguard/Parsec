import asyncio, os, sys
sys.argv = ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p, 1440, 1000)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); localStorage.setItem('rop_fold', JSON.stringify({'c-history':1,'c-customer':1})); __tg.pxSignedIn(); const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>=2); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); })()"); await pg.wait_for_timeout(1300)
        await pg.evaluate(J("R.querySelector('[data-fold=c-parts]').scrollIntoView({block:'start'})")); await pg.wait_for_timeout(300)
        await pg.screenshot(path="shots144/q_after.png", clip={"x": 250, "y": 0, "width": 880, "height": 1000})
        await b.close()
asyncio.run(main())
