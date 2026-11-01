import asyncio, json, sys
from playwright.async_api import async_playwright
exec(open('_t125c.py').read().split('async def desktop')[0])
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        me = await pg.evaluate(SIGN)
        print(await pg.evaluate("(()=>{ const S=__tg.STATE(); const c={}; S.ros.forEach(r=>{ const k=(r.location||'(none)'); c[k]=(c[k]||0)+1; }); return [S.ros.length, JSON.stringify(c)]; })()"))
        a, b2, lot, n = await pg.evaluate(PREP + "(" + json.dumps(me) + ")")
        await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(700)
        await pg.click('.px-rail .pxr-thm button[data-theme="ivd"]'); await pg.wait_for_timeout(400)
        await pg.click("[data-pg=tech] .tch-views button[data-v=yard]"); await pg.wait_for_timeout(500)
        print(await pg.evaluate("[...document.querySelectorAll('.tch-yd [draggable],.tch-yd [data-tg-drop],.tch-yd [data-action]')].map(e=>e.outerHTML.slice(0,200))"))
        await b.close()
asyncio.run(main())
