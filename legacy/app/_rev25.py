import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_ops_done(pg)
        await admin(pg)
        await tri(pg, rid)
        na = await lst(pg, ".tg-list .tg-it", 40); print("TRIAGE 8877:", [x[:110] for x in na if '8877' in x])
        print("hdr", await txt(pg, ".tg-main .tg-top"))
        # Road test button
        await pg.click(".tg-main button:has-text('Road test')"); await pg.wait_for_timeout(600)
        await shot(pg, "j1_roadtest_pop")
        print("POP", (await txt(pg, ".tg-pop") or "")[:900])
        print("POPB", await pg.evaluate("[...document.querySelectorAll('.tg-pop button, .tg-pop input')].map(b=>(b.textContent.trim()||b.placeholder||'').replace(/\\s+/g,' ').slice(0,30)+'|'+(b.dataset.a||b.dataset.in||b.dataset.action||''))"))
        print("ERR", errs)
        await b.close()
asyncio.run(main())
