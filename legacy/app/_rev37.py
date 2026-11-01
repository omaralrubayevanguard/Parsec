import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await admin(pg)
        await go(pg, 'warranty')
        side = await pg.evaluate("[...document.querySelectorAll('[data-view]')].filter(x=>x.offsetParent).map(x=>x.innerText.replace(/\\s+/g,' ').trim())")
        print(side)
        grp = await lst(pg, ".tg-list .tg-gh, .tg-list .tg-grp > button, .tg-list [class*=grp] .tg-gt", 20); print(grp)
        print(await pg.evaluate("(()=>{ try{ return [__tg.waBadgeN(), __tg.waNeedsAll().length, __tg.waStats ? JSON.stringify(__tg.waStats()).slice(0,300) : null]; }catch(e){ return String(e); } })()"))
        print("ERR", errs)
        await b.close()
asyncio.run(main())
