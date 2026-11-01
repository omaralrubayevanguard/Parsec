import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await mkro(pg)
        await go(pg, 'parts'); 
        na = await lst(pg, ".tg-list .tg-it", 40)
        print("PARTS needs:", [x[:90] for x in na])
        # click the 8877 item
        await pg.evaluate("(()=>{ const it=[...document.querySelectorAll('.tg-list .tg-it')].find(x=>/8877/.test(x.innerText)); it && it.click(); })()"); await pg.wait_for_timeout(600)
        await shot(pg, "d1_parts_sel")
        pane = await txt(pg, ".tg-pane, .pt-pane, main .tg-main"); print("PANE:", (pane or '')[:900])
        btns = await pg.evaluate("[...document.querySelectorAll('button')].filter(b=>b.offsetParent && /Order/.test(b.textContent)).map(b=>[b.textContent.trim().slice(0,30), b.dataset.a||b.dataset.action||''])")
        print("ORDER BTNS", btns)
        print("ERR", errs)
        await b.close()
asyncio.run(main())
