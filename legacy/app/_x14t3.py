import asyncio, os, sys, json
PAGE = sys.argv[1]
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
sys.argv = ['x', PAGE]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ __tg.STATE().punches.forEach(p=>{ if(!p.stop){ p.stop=new Date().toISOString(); p.stopReason='Switched job'; p.burntCredited=true; } }); __tg.render(); })()"); await pg.wait_for_timeout(400)
        X = await pg.evaluate(PREP); ro = X["ro"]
        print(await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{ro}'); return [__tg.tgNum(r), r.status, r.dateClosed, r.operations.map(o=>o.jobStatus && o.jobStatus.status), __tg.roAutoTarget(r)]; }})()"))
        await pg.wait_for_timeout(1500)
        print(await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{ro}'); return [r.status, __tg.roAutoTarget(r), __tg.roHandHolds(r)]; }})()"))
        await b.close()
asyncio.run(main())
