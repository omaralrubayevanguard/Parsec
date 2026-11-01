import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        n0 = await pg.evaluate("__tg.staffList().map(s=>s.name)")
        rid = await mkro(pg)
        n1 = await pg.evaluate("__tg.staffList().map(s=>s.name+'|'+s.role+'|'+(s.noSignIn?'nosign':'')+'|'+(s.pinH?'pin':'')+'|'+(s.off?'off':''))")
        print("added:", [x for x in n1 if x.split('|')[0] not in n0])
        await go(pg, 'admin'); await shot(pg, "t1_admin_after_import")
        await pg.evaluate("(()=>{ localStorage.setItem('tec_out','1'); __tg.render(); })()"); await pg.wait_for_timeout(500)
        try:
            await pg.evaluate("__tg.lgOpen && __tg.lgOpen()"); await pg.wait_for_timeout(600)
        except Exception as e: print(e)
        await shot(pg, "t2_login")
        names = await pg.evaluate("[...document.querySelectorAll('.lg-tile, [class*=lg-] button')].map(x=>x.innerText.replace(/\\s+/g,' ').slice(0,30)).slice(0,30)")
        print("login tiles:", names)
        print("ERR", errs)
        await b.close()
asyncio.run(main())
