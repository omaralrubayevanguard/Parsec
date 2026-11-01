import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_released(pg)
        S = "return [r.status.status, r.dateClosed, r.location, JSON.stringify(r.release||null).slice(0,80)];"
        print("released:", await pg.evaluate(RO(rid, S)))
        print("undo labels:", await pg.evaluate("(()=>{ try{ return __tg.undoLabels().slice(-6); }catch(e){ return String(e); } })()"))
        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('[class*=toast] button')].find(b=>/Undo/.test(b.textContent)); b&&b.click(); })()"); await pg.wait_for_timeout(700)
        print("after toast undo:", await pg.evaluate(RO(rid, S)), await toast(pg))
        # Ctrl Z again
        await pg.keyboard.press("Control+z"); await pg.wait_for_timeout(600)
        print("after ctrl z:", await pg.evaluate(RO(rid, S)), await toast(pg))
        await tri(pg, rid)
        na = await lst(pg, ".tg-list .tg-it", 40); print("TRIAGE 8877:", [x[:110] for x in na if '8877' in x])
        print("ERR", errs)
        await b.close()
asyncio.run(main())
