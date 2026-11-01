import asyncio, json, sys
from playwright.async_api import async_playwright
exec(open('_t124.py').read().split('async def ro_page')[0])
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid, op = await pg.evaluate(PREP + "('')")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); return r ? r.classList.contains('is-on') : null"))
        if not on: await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t').click()")); await pg.wait_for_timeout(600)
        C = "R.querySelector('.ock[data-op]')"
        print(await pg.evaluate(J(f"const c={C}; const d=c.querySelector('.ock-big .d'), s=d.querySelector('.dc > span'), cc=c.querySelector('.ock-big .c'); const g=e=>{{const cs=getComputedStyle(e), r=e.getBoundingClientRect(); return [Math.round(r.width*10)/10, cs.paddingLeft, cs.paddingRight, cs.marginLeft, cs.marginRight, cs.fontFamily.slice(0,30), cs.fontVariantNumeric, cs.letterSpacing, cs.minWidth]}}; return [g(d), g(s), g(cc), g(c.querySelector('.ock-big'))]")))
        await b.close()
asyncio.run(main())
