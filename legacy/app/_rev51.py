import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_ops_done(pg)
        S = "return [r.status.status, r.dateClosed, r.dateClosedAuto];"
        print("ops done:", await pg.evaluate(RO(rid, S)))
        await flow_rt(pg, rid); await pg.wait_for_timeout(1500)
        print("rt passed:", await pg.evaluate(RO(rid, S)))
        await go(pg, 'rolist')
        tabs = await pg.evaluate("[...document.querySelectorAll('[data-pg=rolist] .rq-seg button')].map(b=>b.textContent.trim())"); print("tabs", tabs)
        rows = await pg.evaluate("[...document.querySelectorAll('[data-pg=rolist] .rq-row')].map(x=>x.innerText.replace(/\\s+/g,' ')).filter(t=>/8877/.test(t))")
        print("Open tab row:", rows)
        await go(pg, 'manager'); print("MG:", (await txt(pg, ".tg-head"))[:120])
        print("closed sample with Complete – Road test:", await pg.evaluate("__tg.STATE().ros.filter(r=>r.status&&r.status.status==='Complete – Road test').map(r=>[__tg.tgNum(r), !!r.dateClosed])"))
        print("ERR", errs)
        await b.close()
asyncio.run(main())
