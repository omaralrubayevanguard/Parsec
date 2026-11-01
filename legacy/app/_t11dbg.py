import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
JS = sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":1440,"height":900}); pg = await ctx.new_page(); pg.set_default_timeout(6000)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t11.html"); await pg.wait_for_timeout(1000)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()")
        await pg.evaluate("""(()=>{ const T=__tg.staffList().filter(s=>s.role==='Technician'); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.CX.U().skipMorning = __tg.todayStr(); __tg.render(); })()"""); await pg.wait_for_timeout(500)
        print(json.dumps(await pg.evaluate(JS), indent=0)[:3000])
        await b.close()
asyncio.run(main())
