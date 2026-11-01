import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await admin(pg)
        for who in ["Ben Okafor", "Jenna Cho", "Sofia Alvarez", "Carla Reyes"]:
            await signin(pg, who)
            nav = await pg.evaluate("[...document.querySelectorAll('[data-view]')].filter(x=>x.offsetParent).map(x=>x.dataset.view)")
            v = await pg.evaluate("__tg.UI().view")
            print(who, "| lands on:", v, "| nav:", nav)
        # Ben: RO page and RO list
        await signin(pg, "Ben Okafor"); await go(pg, 'rolist'); await shot(pg, "o1_ben_rolist")
        await go(pg, 'parts'); await shot(pg, "o2_ben_parts")
        print("ERR", errs)
        await b.close()
asyncio.run(main())
