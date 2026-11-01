import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_ops_done(pg); await flow_rt(pg, rid)
        await tri(pg, rid)
        await pg.evaluate("(()=>{ const it=[...document.querySelectorAll('.tg-list .tg-it')].find(x=>/8877/.test(x.innerText)); const b=it&&[...it.querySelectorAll('button')].find(b=>b.textContent.trim()==='Check'); b&&b.click(); })()"); await pg.wait_for_timeout(600)
        await shot(pg, "j4_checks")
        print("POP", (await txt(pg, ".tg-pop") or "")[:1400])
        print("POPB", await pg.evaluate("[...document.querySelectorAll('.tg-pop button, .tg-pop input')].map(b=>(b.textContent.trim()||b.placeholder||'').replace(/\\s+/g,' ').slice(0,34)+'|'+(b.dataset.a||b.dataset.in||b.dataset.action||'')+'|'+(b.disabled?'dis':''))"))
        print("ERR", errs)
        await b.close()
asyncio.run(main())
