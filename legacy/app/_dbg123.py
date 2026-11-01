import asyncio, os, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        print(await pg.evaluate("(()=>{ const L=__tg.STATE().ros.filter(r=>r.sample); const a=L.filter(r=>r.axles), n=L.filter(r=>!r.axles); return [a.length, n.length, n.slice(0,4).map(r=>[r.roNumber, r.model, r.year, r.dateClosed, r.sampleWhy, Object.keys(r).length])]; })()"))
        print(await pg.evaluate("__tg.STATE().ros.filter(r=>r.sample && r.axles).filter(r=>__tg.trkPick(r).kind!=='model').map(r=>[r.model,r.year])"))
        await b.close()
asyncio.run(main())
