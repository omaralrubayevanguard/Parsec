import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_assign(pg); await flow_tech_start(pg, rid)
        # note on the punch
        inp = await pg.query_selector("[data-pg=tech] input[placeholder^='What you found'], [data-pg=tech] textarea[placeholder^='What you found']")
        print("note input", bool(inp))
        if inp:
            await inp.click(); await inp.type("Clutch slipping under load, free play gone."); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
        print("punch notes", await pg.evaluate(f"__tg.STATE().punches.filter(p=>p.roId==='{rid}').map(p=>[p.by, p.note||p.notes||'', p.stop||null])"))
        # Done
        await pg.click("[data-pg=tech] button:has-text('Done')"); await pg.wait_for_timeout(700)
        await shot(pg, "h5_done")
        print("after done pop:", await anypop(pg)); print("toast", await toast(pg))
        print("runs", await pg.evaluate(RUNS))
        print(await pg.evaluate(RO(rid, "return [r.status.status, r.status.sub, r.operations.map(o=>[o.jobStatus&&o.jobStatus.status, o.cause||'', o.correction||o.fix||''])];")))
        print("ERR", errs)
        await b.close()
asyncio.run(main())
