import asyncio, os, sys, json
sys.argv = ['x', sys.argv[1] if len(sys.argv) > 1 else 't12.html']
_src = open("_t127p.py").read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ __tg.STATE().punches.forEach(p=>{ if(!p.stop){ p.stop=new Date().toISOString(); p.stopReason='Switched job'; p.burntCredited=true; } }); __tg.render(); })()"); await pg.wait_for_timeout(500)
        ro = await pg.evaluate("(__tg.STATE().ros.find(r=>!r.shop && __tg.roStatus(r).status==='Complete – Released' && r.operations.length>=2)||{}).id")
        OPS = f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); return [__tg.roStatus(r).status, r.operations.map(o=>{{ const s=__tg.opDoneNow(o); return s ? 'done' : (o.jobStatus||{{}}).status || 'open'; }})]; }})()"
        print('start', await pg.evaluate(OPS))
        op = await pg.evaluate(f"__tg.STATE().ros.find(r=>r.id==='{ro}').operations[0].id")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(700)
        await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op}\"] .rop-st').click()")); await pg.wait_for_timeout(300)
        await pg.evaluate(J("const b=[...R.querySelectorAll('.rop-stpop [role=menuitem], .rop-stpop button')].find(x=>/Hold tech/i.test(x.textContent)); b.click()")); await pg.wait_for_timeout(1200)
        print('op 1 → Hold tech', await pg.evaluate(OPS), await pg.evaluate("__tg.UI().toast"))
        for i in range(3):
            await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); const o=r.operations[1]; o.work=(o.work||'')+' x'; __tg.scheduleSave(true); }})()"); await pg.wait_for_timeout(800)
            await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); r.roadTest={{result:'Pass', at:new Date().toISOString(), by:'Frank', miles:'{i}'}}; __tg.scheduleSave(true); }})()"); await pg.wait_for_timeout(800)
            print('after events', i, await pg.evaluate(OPS), await pg.evaluate("__tg.UI().toast"))
        await b.close()
asyncio.run(main())
