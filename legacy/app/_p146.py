import asyncio, os, sys, json
sys.argv = ['x', 't12.html']
src = open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_t125b.py').read().split("async def complete_part(p):")[0]
exec(src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid, op = await pg.evaluate(PREP1)
        await pg.evaluate("__tg.doStopPunch('Complete')"); await pg.wait_for_timeout(400)
        print(await pg.evaluate("(()=>{ const p=__tg.STATE().punches.find(p=>p.id==='pb2'); return [p.stop, p.stopReason, (document.querySelector('.toast')||{}).textContent, [...document.querySelectorAll('.pgask, .modal, [role=dialog], .v146ck')].map(x=>x.className+': '+x.textContent.slice(0,200))]; })()"))
        print(errs)
        await b.close()
asyncio.run(main())
