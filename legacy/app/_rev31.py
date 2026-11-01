import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_ops_done(pg); await flow_rt(pg, rid)
        await open_checks(pg, rid); await tick_walk(pg)
        await pg.click(".tg-pop button[data-a=tg-qc-go], .tg-pop button[data-action=tg-qc-go]"); await pg.wait_for_timeout(500)
        # handover ticks
        for t in ["Keys back","Truck clean","Invoice closed","Customer told"]:
            await pg.evaluate(f"(()=>{{ const b=[...document.querySelectorAll('.tg-pop button')].find(b=>b.textContent.trim()==={json.dumps(t)}); b&&b.click(); }})()"); await pg.wait_for_timeout(200)
        f = await pg.query_selector(".tg-pop input[placeholder='Who picked it up']")
        if f: await f.fill("Driver Joe")
        await pg.wait_for_timeout(200)
        print("POP", (await txt(pg, ".tg-pop") or "")[:700])
        await pg.click(".tg-pop button:has-text('Release anyway')"); await pg.wait_for_timeout(500)
        await shot(pg, "k2_release_anyway")
        print("POP2", (await txt(pg, ".tg-pop") or "")[:700])
        print("POPB2", await pg.evaluate("[...document.querySelectorAll('.tg-pop button, .tg-pop input, .tg-pop textarea')].map(b=>(b.textContent.trim()||b.placeholder||'').replace(/\\s+/g,' ').slice(0,34)+'|'+(b.dataset.a||b.dataset.in||'')+'|'+(b.disabled?'dis':''))"))
        print("ERR", errs)
        await b.close()
asyncio.run(main())
