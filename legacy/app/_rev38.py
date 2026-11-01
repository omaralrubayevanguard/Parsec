import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await admin(pg)
        await go(pg, 'manager'); h0 = await txt(pg, "[data-pg=manager] .tg-head, .tg-head"); print("MG before:", h0[:160])
        await go(pg, 'triage'); print("TRI before:", (await txt(pg, ".tg-head"))[:100])
        rid = await mkro(pg)
        await go(pg, 'manager'); print("MG after new RO:", (await txt(pg, ".tg-head"))[:160])
        await go(pg, 'triage'); print("TRI after:", (await txt(pg, ".tg-head"))[:100])
        await go(pg, 'rolist'); print("RL tabs:", await pg.evaluate("[...document.querySelectorAll('[data-pg=rolist] .rq-seg button')].map(b=>b.textContent.trim())"))
        # open ROs tile
        await go(pg, 'manager')
        tiles = await lst(pg, "[data-pg=manager] .mg-tile", 12); print("tiles:", [t[:60] for t in tiles])
        print("ERR", errs)
        await b.close()
asyncio.run(main())
