import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(); pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        rid = await pg.evaluate("""(()=>{ const S=__tg.STATE(); const L=__tg.trkLib(); L.push({id:'trk_t1', make:'Volvo', model:'VNL 300', years:'2019-', src:'data:image/png;base64,iVBORw0KGgo=', cut:1, at:'x'}); L[0].years='2016-2024';
           const ro=S.ros.find(r=>!r.shop && /VNL 760/.test(r.model)); ro.trkUse='photo'; S.savedAt=Date.now(); __tg.scheduleSave(true); return ro.id; })()""")
        await pg.wait_for_timeout(2500)
        await pg.reload(); await pg.wait_for_timeout(1500)
        print(await pg.evaluate("JSON.stringify({lib: (__tg.STATE().truckPics||[]).map(e=>e.id+':'+e.model+':'+e.years), use: __tg.getRO('%s') && __tg.getRO('%s').trkUse})" % (rid, rid)))
        print("errors", errs); await b.close()
asyncio.run(main())
