import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots10")
async def run(pg, label, setup):
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:400])); pg.on("console", lambda m: errs.append("C: " + m.text[:600]) if m.type == "error" and "Failed to load" not in m.text else None)
    await pg.goto("file://" + H + "/t10.html"); await pg.wait_for_timeout(1200)
    if setup: await pg.evaluate(setup); await pg.wait_for_timeout(300)
    await pg.evaluate("(()=>{ const U=__tg.UI(); U.modal=null; U.view='manager'; __tg.render(); })()"); await pg.wait_for_timeout(800)
    tab = await pg.query_selector("[data-pg=manager] [data-v=team], [data-pg=manager] button:has-text('Team')")
    print(label, "tab found:", bool(tab))
    if tab: await tab.click(); await pg.wait_for_timeout(800)
    print(label, "team view:", await pg.evaluate("!!document.querySelector('.mq.v-team, [data-pg=manager] .tg-body.v-team') || !!document.querySelector('.tg-body.v-team')"), "errs:", errs[:3])
    await pg.screenshot(path=os.path.join(OUT, "team_" + label + ".png"))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for label, setup in [("fresh", None), ("sample", "__tg.loadSample25()"), ("blankstaff", "(()=>{ __tg.loadSample25(); const S=__tg.STATE(); S.staff.push({id:'x1', name:'', role:'Technician'}); S.staff.push({id:'x2', role:'Technician'}); })()"), ("nostaff", "(()=>{ __tg.loadSample25(); __tg.STATE().staff=[]; })()")]:
            ctx = await b.new_context(viewport={"width":1440,"height":900}); pg = await ctx.new_page()
            await run(pg, label, setup); await ctx.close()
        await b.close()
asyncio.run(main())
