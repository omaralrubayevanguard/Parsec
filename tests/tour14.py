import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots14")
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()"); await pg.wait_for_timeout(600)
        for v in ['rolist','assets','tech','triage','foreman','parts','inventory','warranty','manager','fixes','timelog','career','admin']:
            await pg.evaluate(f"(()=>{{ __tg.UI().view='{v}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
            await pg.screenshot(path=os.path.join(OUT, f"f_{v}.png"))
        rid = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>=3 && r.operations.some(o=>(o.parts||[]).length)); return r.id; })()")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=os.path.join(OUT, "f_ro.png"))
        await pg.evaluate("document.documentElement.setAttribute('data-theme','ivd'); __tg.render()"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, "f_ro_dark.png"))
        await pg.evaluate("(()=>{ __tg.UI().view='assets'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "f_assets_dark.png"))
        print("ERRORS", errs[:5])
        await b.close()
asyncio.run(main())
