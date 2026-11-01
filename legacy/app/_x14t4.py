import asyncio, os, sys, json
PAGE = sys.argv[1]
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
sys.argv = ['x', PAGE]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ __tg.STATE().punches.forEach(p=>{ if(!p.stop){ p.stop=new Date().toISOString(); p.stopReason='Switched job'; p.burntCredited=true; } }); __tg.render(); })()"); await pg.wait_for_timeout(400)
        X = await pg.evaluate(PREP); A, ro = X["A"], X["ro"]
        print('after prep', await pg.evaluate(f"__tg.roStatus(__tg.getRO('{ro}')).status"))
        rel = await pg.evaluate("(__tg.STATE().ros.find(r=>!r.shop && __tg.roStatus(r).status==='Complete – Released')||{}).id")
        print('rel', rel)
        await pg.evaluate(SIGN(A))
        print('after sign', await pg.evaluate(f"[__tg.roStatus(__tg.getRO('{ro}')), __tg.roAutoTarget(__tg.getRO('{ro}')), __tg.getRO('{ro}').operations.map(o=>[o.jobStatus, o.appr, o.declined])]"))
        print(await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{ro}'); return [__tg.roStatus(r).status, __tg.permRoStatusAct ? __tg.permRoStatusAct(r, 'Waiting – Customer') : '?', __tg.viewAsStaff && __tg.viewAsStaff() && __tg.viewAsStaff().role, typeof __tg.can]; }})()"))
        print(await pg.evaluate(f"[__tg.setRoStatus('{ro}', 'Waiting – Customer', null), __tg.roStatus(__tg.getRO('{ro}')).status, __tg.UI().toast||'']"))
        await pg.wait_for_timeout(1500)
        print('later', await pg.evaluate(f"__tg.roStatus(__tg.getRO('{ro}')).status"), errs[:5])
        await b.close()
asyncio.run(main())
