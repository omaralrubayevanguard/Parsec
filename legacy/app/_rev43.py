import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_ops_done(pg); await flow_rt(pg, rid)
        await signin(pg, "Dana Kowalski"); await tsel(pg)
        await pg.click("[data-pg=tech] button:has-text('Truck checks')"); await pg.wait_for_timeout(600)
        cls = await pg.evaluate("(()=>{ const e=document.elementFromPoint(700,150); let x=e, out=[]; while(x && out.length<8){ out.push(x.className && String(x.className).slice(0,40)); x=x.parentElement; } return out; })()")
        print(cls)
        await shot(pg, "n4_tech_checks")
        await b.close()
asyncio.run(main())
