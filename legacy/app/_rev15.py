import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_assign(pg)
        print("me", await signin(pg, "Dana Kowalski"))
        await go(pg, 'tech')
        await shot(pg, "h1_tech")
        L = await lst(pg, ".tg-list .tg-it, .tch-list .tg-it", 20); print("TECH list:", [x[:100] for x in L])
        nav = await pg.evaluate("[...document.querySelectorAll('[data-view]')].filter(x=>x.offsetParent).map(x=>x.dataset.view)")
        print("NAV for Dana:", nav)
        print("ERR", errs)
        await b.close()
asyncio.run(main())
