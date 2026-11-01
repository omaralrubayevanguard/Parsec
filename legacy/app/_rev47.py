import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_ops_done(pg)
        await admin(pg); await tri(pg, rid)
        await pg.click(".tg-main button:has-text('Road test')"); await pg.wait_for_timeout(400)
        await pg.click(".tg-pop button[data-a=tg-rt-go], .tg-pop button[data-action=tg-rt-go]"); await pg.wait_for_timeout(600)
        await signin(pg, "Dana Kowalski")
        it = await pg.evaluate("__tg.IB.itemsFor('Dana Kowalski').filter(n=>n.st==='new'||n.k==='ask').slice(0,12).map(n=>[n.k, n.src, n.from, String(n.t||'').slice(0,60)])")
        for x in it: print(x)
        # inbox reachable?
        await go(pg, 'inbox'); await shot(pg, "p3_inbox_direct")
        print("inbox view renders:", (await txt(pg, "[data-pg=inbox]") or '')[:200])
        print("ERR", errs)
        await b.close()
asyncio.run(main())
