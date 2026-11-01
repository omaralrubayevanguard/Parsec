import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_assign(pg); await flow_tech_start(pg, rid); await done_cur(pg)
        await start_next(pg, 2); print("pop2", await anypop(pg)); await done_cur(pg); print("pop2d", await anypop(pg), await toast(pg))
        await start_next(pg, 3); print("pop3", await anypop(pg)); await done_cur(pg)
        await shot(pg, "h6_op3_done")
        print("pop3d", await anypop(pg)); print("toast", await toast(pg))
        print(await pg.evaluate(RO(rid, "return [r.status.status, r.status.sub, r.operations.map(o=>[o.jobStatus&&o.jobStatus.status, (o.parts||[]).map(x=>x.status).join(',')])];")))
        print("ERR", errs)
        await b.close()
asyncio.run(main())
