import asyncio, json, sys, os, datetime
from playwright.async_api import async_playwright
exec(open('_t125.py').read().split('async def hold')[0])
async def main():
    async with async_playwright() as p:
        for hh, mm in ((10, 40), (12, 5), (14, 20), (16, 30)):
            b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page()
            await pg.clock.install(time=datetime.datetime.now().replace(hour=hh, minute=mm)); await pg.clock.resume()
            await pg.route("**/fonts.g*/**", lambda r: r.abort())
            await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1200)
            await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()")
            rid, op, op2 = await pg.evaluate(PREP + "('')")
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
            on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); return r ? r.classList.contains('is-on') : null"))
            if not on: await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t').click()")); await pg.wait_for_timeout(700)
            await pg.wait_for_timeout(1200)
            print(hh, mm, await pg.evaluate(J(f"const c=R.querySelector('.ock[data-op=\"{op}\"]'); return ['pace','up','lunch'].map(k=>(c.querySelector('[data-f='+k+']')||{{}}).textContent)")))
            await b.close()
asyncio.run(main())
