import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_assign(pg); await flow_tech_start(pg, rid)
        inp = await pg.query_selector("[data-pg=tech] input[placeholder^='What you found'], [data-pg=tech] textarea[placeholder^='What you found']")
        await inp.click(); await inp.type("Clutch slipping under load."); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
        print("running:", await pg.evaluate(f"__tg.STATE().punches.filter(p=>p.roId==='{rid}').map(p=>JSON.stringify({{notes:p.notes, note:p.note, work:p.work}}))"))
        await done_cur(pg)
        print("stopped:", await pg.evaluate(f"__tg.STATE().punches.filter(p=>p.roId==='{rid}').map(p=>JSON.stringify({{notes:p.notes, note:p.note, stop:!!p.stop}}))"))
        print("gaps op1:", await pg.evaluate(RO(rid, "return __tg.opNoteGaps(r.operations[0]);")))
        print("ERR", errs)
        await b.close()
asyncio.run(main())
