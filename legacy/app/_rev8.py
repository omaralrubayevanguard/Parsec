import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def psel(pg):
    await go(pg, 'parts')
    await pg.evaluate("(()=>{ const it=[...document.querySelectorAll('.tg-list .tg-it')].find(x=>/8877/.test(x.innerText)); it && it.click(); })()"); await pg.wait_for_timeout(500)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await mkro(pg); await flow_approve(pg, rid)
        await psel(pg)
        await pg.evaluate("(()=>{ const it=[...document.querySelectorAll('.tg-list .tg-it')].find(x=>/8877/.test(x.innerText)); const b=it&&it.querySelector('button'); b&&b.click(); })()"); await pg.wait_for_timeout(600)
        await shot(pg, "f1_order_pop")
        pop = await txt(pg, ".tg-pop"); print("POP", (pop or '')[:800])
        pb = await pg.evaluate("[...document.querySelectorAll('.tg-pop button, .tg-pop input')].map(b=>(b.textContent.trim()||b.placeholder||b.value||'').slice(0,30)+'|'+(b.dataset.a||b.dataset.action||b.dataset.in||''))")
        print("POPBTNS", pb)
        print("ERR", errs)
        await b.close()
asyncio.run(main())
