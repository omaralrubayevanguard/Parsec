import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
SNAP = "return [r.status.status, r.status.sub, r.operations.map(o=>[o.complaint.slice(0,14), o.jobStatus&&o.jobStatus.status, (o.parts||[]).map(x=>x.status+(x.eta?'@'+x.eta:'')).join(',')])];"
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await mkro(pg); await flow_approve(pg, rid)
        await flow_order(pg, rid)
        print("toast", await toast(pg))
        print(await pg.evaluate(RO(rid, SNAP)))
        await shot(pg, "f2_ordered")
        na = await lst(pg, ".tg-list .tg-it", 40); print("PARTS needs:", [x[:100] for x in na if '8877' in x])
        await go(pg, 'rolist')
        row = await pg.evaluate("[...document.querySelectorAll('[data-pg=rolist] .rq-row')].map(x=>x.innerText.replace(/\\s+/g,' ')).find(t=>/8877/.test(t))")
        print("RL row:", row)
        # Check in: header button
        await go(pg, 'parts')
        await pg.click("button:has-text('Check in')"); await pg.wait_for_timeout(600)
        await shot(pg, "f3_checkin")
        pop = await txt(pg, ".tg-pop, .modal"); print("CHECKIN", (pop or '')[:900])
        pb = await pg.evaluate("[...document.querySelectorAll('.tg-pop button, .tg-pop input')].map(b=>(b.textContent.trim()||b.placeholder||'').slice(0,40)+'|'+(b.dataset.a||b.dataset.action||b.dataset.in||''))")
        print("POPBTNS", pb[:40])
        print("ERR", errs)
        await b.close()
asyncio.run(main())
