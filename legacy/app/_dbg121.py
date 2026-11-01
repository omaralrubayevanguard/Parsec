import asyncio, os, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
DONE_ALL = """(id => { const r=__tg.getRO(id); r.operations.forEach(o=>{ if(!o.declined){ o.jobStatus={status:'Complete', setAt:new Date().toISOString(), hand:true}; (o.parts||[]).forEach(p=>{ p.status='Installed'; }); } }); __tg.render(); })"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        pg.on("pageerror", lambda e: print("ERR", e))
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.evaluate("__tg.PG.go('triage')"); await pg.wait_for_timeout(400)
        W = await pg.evaluate("__tg.STATE().ros.filter(r=>!r.shop && r.id!=='ro_shop' && !r.dateClosed && (r.operations||[]).some(o=>!o.declined)).map(r=>r.id)")
        r4 = W[3]
        await pg.evaluate(DONE_ALL + f"('{r4}')")
        print(await pg.evaluate(f"__tg.getRO('{r4}').operations.map(o=>[o.declined, JSON.stringify(o.jobStatus)])"))
        await pg.evaluate(f"__tg.tgOpenPop('road','{r4}')"); await pg.wait_for_timeout(200)
        await pg.click('.trx-r [data-f="m"][data-v="log"]'); await pg.click('.trx-r [data-f="res"][data-v="Fail"]'); await pg.click('.trx-r [data-f="fw"][data-v="Noise"]')
        await pg.click('.trx-r [data-action="tg-rt-go"]'); await pg.wait_for_timeout(50)
        print(await pg.evaluate(f"__tg.getRO('{r4}').operations.map(o=>[o.declined, JSON.stringify(o.jobStatus)])"))
        await pg.wait_for_timeout(600)
        print(await pg.evaluate(f"__tg.getRO('{r4}').operations.map(o=>[o.declined, JSON.stringify(o.jobStatus)])"))
        await b.close()
asyncio.run(main())
