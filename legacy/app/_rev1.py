exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else '.', '_revlib.py')).read()) if False else None
import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await admin(pg)
        await go(pg, 'rolist')
        n0 = await pg.evaluate("__tg.STATE().ros.length")
        # New RO button
        await pg.click("text=New RO"); await pg.wait_for_timeout(700)
        await shot(pg, "a1_newro")
        m = await pg.evaluate("(()=>{ const m=document.querySelector('.modal, #imp-dlg, [role=dialog]'); return m ? [m.id, m.className, m.innerText.replace(/\\s+/g,' ').slice(0,600)] : null; })()")
        print("modal:", m)
        print("ERR", errs)
        await b.close()
asyncio.run(main())
