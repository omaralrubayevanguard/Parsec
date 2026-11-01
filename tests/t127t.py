# Parsec 12.7 — a status set by hand (Triage) stops everyone's clock on that operation
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        X = await pg.evaluate(PREP); A, An, B, Bn, ro, a = X["A"], X["An"], X["B"], X["Bn"], X["ro"], X["a"]
        await pg.evaluate(SIGN(A)); await pg.evaluate(f"__tg.doStartPunch('{ro}', '{a}', 'Repairing')")
        await pg.evaluate(SIGN(B)); await pg.evaluate(f"__tg.doStartPunch('{ro}', '{a}', 'Repairing')"); await pg.wait_for_timeout(200)
        ok(sorted(await pg.evaluate(RUNS)) == sorted([[An, a], [Bn, a]]), "both on the operation")
        await pg.evaluate(f"(()=>{{ const x=document.createElement('button'); x.dataset.action='ty-opdone'; x.dataset.ro='{ro}'; x.dataset.op='{a}'; document.body.appendChild(x); x.click(); x.remove(); }})()"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"(()=>__tg.STATE().punches.filter(p=>p.opId==='{a}' && __tg.localDay(p.start)===__tg.todayStr()).map(p=>[p.by, p.stop ? p.stopReason : 'running']))()")
        ok(await pg.evaluate(RUNS) == [] and all(x[1] == "Complete" for x in r), f"marking it Complete by hand stops both clocks ({r})")
        ok(not errs, "no console errors: " + "; ".join(errs[:3]))
        await b.close()
    print("\nFAILS:", len(FAILS))
asyncio.run(main())
