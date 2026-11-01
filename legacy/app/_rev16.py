import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_assign(pg)
        await signin(pg, "Dana Kowalski")
        await go(pg, 'tech')
        await pg.evaluate("(()=>{ const it=[...document.querySelectorAll('.tg-list .tg-it')].find(x=>/8877/.test(x.innerText)); it && it.click(); })()"); await pg.wait_for_timeout(700)
        await shot(pg, "h2_tech_8877")
        btns = await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] button, .tch button')].filter(b=>b.offsetParent).map(b=>(b.textContent.trim()||b.title||b.getAttribute('aria-label')||'').replace(/\\s+/g,' ').slice(0,26)+'|'+(b.dataset.a||b.dataset.action||''))")
        print("BTNS", btns[:60])
        print("ERR", errs)
        await b.close()
asyncio.run(main())
