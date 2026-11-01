import asyncio, sys, json
sys.argv=['x','t12.html']
import importlib.util
spec=importlib.util.spec_from_file_location('t','_t127p.py'); t=importlib.util.module_from_spec(spec); spec.loader.exec_module(t)
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b, pg, errs = await t.setup(p)
        X = await pg.evaluate(t.PREP); A,An,B,Bn,ro,a,bo = X["A"],X["An"],X["B"],X["Bn"],X["ro"],X["a"],X["b"]
        await pg.evaluate(t.SIGN(A)); await pg.evaluate(f"__tg.doStartPunch('{ro}', '{bo}', 'Repairing')")
        await pg.evaluate(t.SIGN(B)); await pg.evaluate(f"__tg.doStartPunch('{ro}', '{a}', 'Repairing')"); await pg.wait_for_timeout(2500)
        await pg.evaluate(t.SIGN(B)); await pg.evaluate("__tg.doStopPunch('Lunch'); __tg.scheduleSave(true)"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(), now=Date.now(); const ps=S.punches.filter(p=>p.by==={json.dumps(Bn)} && __tg.localDay(p.start)===__tg.todayStr()).map(p=>[p.id,p.start,p.stop,p.stopReason]); const sh=S.shifts.filter(s=>s.by==={json.dumps(Bn)}).map(s=>[s.in,s.out,s.outReason]); return {{now:new Date(now).toISOString(), ps, sh}}; }})()""")
        print(json.dumps(r, indent=1))
        await pg.wait_for_timeout(1500); await pg.evaluate("__tg.scheduleSave(true)"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"(()=>__tg.STATE().shifts.filter(s=>s.by==={json.dumps(Bn)}).map(s=>[s.in,s.out,s.outReason]))()")
        print('after 1.5s', r)
        await b.close()
asyncio.run(main())
