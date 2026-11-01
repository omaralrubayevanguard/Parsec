import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_tt.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t14t.py")).read()
_src = _src[:_src.index("async def main():\n")]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate(ADMIN); await pg.wait_for_timeout(500)
        X = await pg.evaluate(PICK); A, B = X["a"], X["b"]
        print(await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{B}'); return [__tg.roStatus(ro), ro.status]; }})()"))
        await pg.evaluate(DONE_ALL + f"('{B}')"); await pg.wait_for_timeout(1500)
        print(await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{B}'); return {{ st: ro.status, gaps: __tg.roCompleteGaps(ro), tgt: __tg.roAutoTarget(ro), hold: __tg.roHandHolds(ro), key: __tg.roOpsKey(ro), ops: ro.operations.map(o=>[o.declined, o.jobStatus]) }}; }})()"))
        await b.close()
asyncio.run(main())
