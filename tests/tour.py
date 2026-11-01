import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots14")
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()"); await pg.wait_for_timeout(600)
        nav = await pg.evaluate("[...document.querySelectorAll('nav [data-view], .sidebar [data-view], [data-action=nav]')].map(x=>[x.dataset.view||x.dataset.v||'', x.textContent.trim().slice(0,20)])")
        print(nav)
        views = [v for v,_ in nav if v]
        for v in views:
            await pg.evaluate(f"(()=>{{ __tg.UI().view='{v}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
            await pg.screenshot(path=os.path.join(OUT, f"v_{v}.png"))
        # an RO
        rid = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>=3 && r.operations.some(o=>(o.parts||[]).length)); return r.id; })()")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=os.path.join(OUT, "v_ro.png"))
        print("ERRORS", errs[:5])
        await b.close()
asyncio.run(main())
