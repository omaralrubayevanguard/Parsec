import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_assign(pg); await flow_tech_start(pg, rid); await done_cur(pg)
        await start_next(pg, 2); await done_cur(pg)
        await tsel(pg)
        # open op 3 parts tab
        await pg.evaluate("(()=>{ const t=[...document.querySelectorAll('[data-pg=tech] button[data-a=topen]')].find(b=>/PM service/.test(b.textContent)); t&&t.click(); })()"); await pg.wait_for_timeout(400)
        await pg.evaluate("(()=>{ const t=[...document.querySelectorAll('[data-pg=tech] button[data-a=ttab]')].find(b=>/Parts/.test(b.textContent)); t&&t.click(); })()"); await pg.wait_for_timeout(400)
        await shot(pg, "h8_parts_tab")
        print("BTNS", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tg-main button, [data-pg=tech] button')].filter(b=>b.offsetParent && /pick|install|Picked|Installed/i.test(b.textContent+b.dataset.a)).map(b=>b.textContent.trim().replace(/\\s+/g,' ').slice(0,30)+'|'+(b.dataset.a||''))"))
        for i in range(3):
            await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('[data-pg=tech] button[data-a=tpick]')].filter(b=>b.offsetParent)[0]; b&&b.click(); })()"); await pg.wait_for_timeout(400)
            pp = await anypop(pg)
            if pp: print("pop", pp); await popgo(pg)
        print(await pg.evaluate(RO(rid, "return r.operations[2].parts.map(x=>x.status);")))
        await shot(pg, "h9_picked")
        print("BTNS2", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] button')].filter(b=>b.offsetParent && /pick|install|Picked|Installed/i.test(b.textContent+b.dataset.a)).map(b=>b.textContent.trim().replace(/\\s+/g,' ').slice(0,30)+'|'+(b.dataset.a||''))"))
        print("ERR", errs)
        await b.close()
asyncio.run(main())
