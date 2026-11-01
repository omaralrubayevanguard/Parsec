import asyncio, os, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.evaluate("__tg.PG.go('triage')"); await pg.wait_for_timeout(400)
        print(await pg.evaluate("""(()=>{ const r=__tg.STATE().ros.find(x=>x.customerName==='Blue Ridge Haulers'); return [r.status, r.operations.map(o=>({d:o.declined, js:o.jobStatus, appr:o.appr, st:o.status, burnt:o.burnt})), __tg.STATE().punches.filter(p=>p.roId===r.id).map(p=>[p.opId,p.start,p.stop,p.stopReason])]; })()"""))
        await b.close()
asyncio.run(main())
