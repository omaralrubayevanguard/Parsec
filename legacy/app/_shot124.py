import asyncio, json, sys
from playwright.async_api import async_playwright
exec(open('_t124.py').read().split('async def ro_page')[0])
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p, 390, 844, True)
        me = await pg.evaluate(SIGN); rid, op = await pg.evaluate(PREP + "(" + json.dumps(me) + ")")
        await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(800)
        await pg.click("[data-pg=tech] .tch-it.run"); await pg.wait_for_timeout(900)
        await pg.evaluate("(()=>{ const c=document.querySelector('[data-pg=tech] .tch-o.open .ock'); c && c.scrollIntoView({block:'center'}); })()"); await pg.wait_for_timeout(5600)
        await pg.screenshot(path=OUT + "/c1_tech_phone_ro.png")
        await pg.evaluate("(()=>{ const b=document.querySelector('[data-action=\"set-theme\"][data-theme=\"ivd\"]'); if(b) b.click(); else { __tg.STATE(); } })()"); await pg.wait_for_timeout(300)
        await b.close()
        b, pg, errs = await setup(p, 1440, 900)
        me = await pg.evaluate(SIGN); rid, op = await pg.evaluate(PREP + "(" + json.dumps(me) + ")")
        await pg.click('.px-rail .pxr-thm button[data-theme="vvd"]'); await pg.wait_for_timeout(300)
        await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(6000)
        el = await pg.evaluate("(()=>{ const c=document.querySelector('[data-pg=tech] .tch-o.open .ock'); const r=c.getBoundingClientRect(); return [r.x,r.y,r.width,r.height]; })()")
        await pg.screenshot(path=OUT + "/c2_tech_nearblack.png", clip={"x": el[0]-10, "y": el[1]-10, "width": el[2]+20, "height": el[3]+20})
        print(errs); await b.close()
asyncio.run(main())
