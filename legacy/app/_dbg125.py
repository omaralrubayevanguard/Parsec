import asyncio, json, sys, os
from playwright.async_api import async_playwright
exec(open('_t125.py').read().split('async def hold')[0])
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        me = await pg.evaluate(SIGN); rid, op, op2 = await pg.evaluate(PREP + "(" + json.dumps(me) + ")")
        await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(900)
        await pg.click("[data-pg=tech] .tch-it.run"); await pg.wait_for_timeout(800)
        st = "(()=>{ return { ro: (document.querySelector('[data-pg=tech] .tch-it.on')||{}).dataset, ops: [...document.querySelectorAll('[data-pg=tech] .tch-o')].map(o=>o.className+':'+!!o.querySelector('.ock')), cards: [...document.querySelectorAll('.ock[data-op]')].map(c=>c.dataset.op) }; })()"
        print(await pg.evaluate(st), op, op2)
        await pg.evaluate(f"__tg.doStopPunch('Lunch')"); await pg.wait_for_timeout(600)
        print(await pg.evaluate(st))
        print(errs)
        await b.close()
asyncio.run(main())
