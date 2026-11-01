import asyncio, sys, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.goto("file://" + H + "/t4.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        # triple the yard: copy ROs with new ids
        await pg.evaluate("""(()=>{const S=__tg.S(); const base=S.ros.filter(r=>!r.shop&&r.id!=='ro_shop'); for(let k=0;k<3;k++) base.forEach(r=>{const c=JSON.parse(JSON.stringify(r)); c.id=__tg.uid('ro'); c.roNumber='RO-'+(40000+Math.floor(Math.random()*9999)); c.location=''; S.ros.push(c);});})()""")
        for v in ["rolist", "triage"]:
            t = await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.view='{v}'; __tg.render(); const t0=performance.now(); for(let i=0;i<10;i++) __tg.render(); return (performance.now()-t0)/10;}})()")
            print(v, "ms/render:", round(t, 1), "ros:", await pg.evaluate("__tg.S().ros.length"))
        for tv in ["desk", "yard"]:
            t = await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.tgView='{tv}'; __tg.render(); const t0=performance.now(); for(let i=0;i<10;i++) __tg.render(); return (performance.now()-t0)/10;}})()")
            print(tv, "ms/render:", round(t, 1))
        await b.close()
asyncio.run(main())
