import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def tri(pg, rid):
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='triage'; U.tgSel='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(700)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await mkro(pg)
        await tri(pg, rid)
        # Approve op 1
        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('button[data-a=tg-apr],button[data-action=tg-apr]')].filter(b=>b.textContent.trim()==='Approve'); b[0].click(); })()"); await pg.wait_for_timeout(600)
        await shot(pg, "e2_after_approve")
        print("toast", await toast(pg))
        pop = await txt(pg, ".tg-pop"); print("POP", (pop or '')[:500])
        st = await pg.evaluate(RO(rid, "return r.operations.map(o=>[o.complaint.slice(0,20), JSON.stringify(o.appr||null), o.jobStatus&&o.jobStatus.status]);"))
        print(st)
        print("ERR", errs)
        await b.close()
asyncio.run(main())
