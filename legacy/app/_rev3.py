import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await mkro(pg)
        # RO list row
        await go(pg, 'rolist')
        row = await pg.evaluate("[...document.querySelectorAll('[data-pg=rolist] .rq-row')].map(x=>x.innerText.replace(/\\s+/g,' ')).find(t=>/8877/.test(t))")
        print("RL row:", row)
        # Triage
        await go(pg, 'triage'); await shot(pg, "c1_triage")
        na = await lst(pg, "[data-pg=triage] .tg-list .tg-it, .tg-list .tg-it", 40)
        print("TRIAGE needs:", [x for x in na][:40])
        has = [x for x in na if '8877' in x]; print("8877 in triage:", has)
        print("ERR", errs)
        await b.close()
asyncio.run(main())
