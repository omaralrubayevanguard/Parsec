import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def badges(pg):
    return await pg.evaluate("Object.fromEntries([...document.querySelectorAll('[data-view]')].filter(x=>x.offsetParent).map(x=>[x.dataset.view, (x.querySelector('.badge, .n, .cnt, [class*=badge], [class*=count]')||{}).textContent||'']))")
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await admin(pg)
        for v in ['warranty','foreman','triage','parts','rolist']:
            await go(pg, v)
            bd = await badges(pg)
            hdr = await txt(pg, f"[data-pg={v}] .tg-hd, [data-pg={v}] .tg-head, .tg-head") 
            na = await pg.evaluate("(()=>{ const h=document.querySelector('.tg-list .tg-lh'); return h ? h.innerText.replace(/\\s+/g,' ') : null; })()")
            n_it = await pg.evaluate("document.querySelectorAll('.tg-list .tg-it').length")
            print(v, "| badge:", bd.get(v), "| head:", (hdr or '')[:120], "| list head:", na, "| items:", n_it)
        print("ERR", errs)
        await b.close()
asyncio.run(main())
