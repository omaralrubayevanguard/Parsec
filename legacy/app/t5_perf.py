import asyncio, os, datetime
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
SEED = open(os.path.join(H, "t5_fm.py")).read().split('SEED = r"""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/t5.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='foreman'; U.modal=null; __tg.render();})()")
        await pg.evaluate(SEED)
        for v, extra in [("floor", ""), ("floor", "U.fmDay=true"), ("techs", "U.fmDay=false"), ("yard", ""), ("tmr", ""), ("triage", "U.view='triage'"), ("rolist", "U.view='rolist'"), ("console", "U.view='console'")]:
            ms = await pg.evaluate("(()=>{const U=__tg.UI(); U.view='foreman'; U.fmView='%s'; %s; __tg.fmNcClear(); __tg.render(); const t=[]; for(let i=0;i<12;i++){ __tg.fmNcClear(); const a=performance.now(); __tg.render(); t.push(performance.now()-a);} t.sort((a,b)=>a-b); return [t[0].toFixed(1), t[6].toFixed(1), t[11].toFixed(1)]; })()" % (v, extra))
            print(f"{v:8} {extra:18} min/med/max ms", ms)
        print("errors", errs)
        await b.close()
asyncio.run(main())
