import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_ops_done(pg)
        await go(pg, 'timelog'); await shot(pg, "r1_timelog_dana")
        print("TL:", (await txt(pg, "[data-pg=timelog]") or '')[:700])
        await go(pg, 'career'); await shot(pg, "r2_career_dana")
        print("CR:", (await txt(pg, "[data-pg=career]") or '')[:500])
        print("ERR", errs)
        await b.close()
asyncio.run(main())
