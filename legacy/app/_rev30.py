import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_ops_done(pg); await flow_rt(pg, rid)
        await open_checks(pg, rid)
        for i in range(6):
            await pg.evaluate(f"(()=>{{ const b=[...document.querySelectorAll('.tg-pop button[data-a=tg-qc],.tg-pop button[data-action=tg-qc]')].filter(b=>!/Edit the list/.test(b.textContent))[{i}]; b&&b.click(); }})()"); await pg.wait_for_timeout(250)
        print("POP", (await txt(pg, ".tg-pop") or "")[-300:])
        await watch_toasts(pg)
        await pg.click(".tg-pop button[data-a=tg-qc-go], .tg-pop button[data-action=tg-qc-go]"); await pg.wait_for_timeout(600)
        await shot(pg, "k1_release")
        print("after:", await anypop(pg))
        print("POPB", await pg.evaluate("[...document.querySelectorAll('.tg-pop button, .tg-pop input, .modal button, .modal textarea')].map(b=>(b.textContent.trim()||b.placeholder||'').replace(/\\s+/g,' ').slice(0,34)+'|'+(b.dataset.a||b.dataset.in||b.dataset.action||'')+'|'+(b.disabled?'dis':''))"))
        print("toasts", await seen(pg))
        print("ERR", errs)
        await b.close()
asyncio.run(main())
