import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(); pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        print(await pg.evaluate("""(()=>{ const S=__tg.STATE(); S.truckPics=[{id:'st-white',make:'Volvo',model:'VNL 760',years:'2018-2024',src:'starter:side_white',cut:1,top:'starter:top_white'},{id:'st-blue',make:'Volvo',model:'VNR 300',years:'2018-',src:'starter:side_blue',cut:1,top:'starter:top_blue'},{id:'trk_mine',make:'Volvo',model:'VNL 670',years:'',src:'data:image/png;base64,AA',cut:1}]; delete S.truckPicsV;
          const L=__tg.trkLib(); const r=[L.length, L.find(e=>e.id==='st-blue').years, S.truckPicsV, L.filter(e=>e.id==='trk_mine').length];
          S.truckPics = L.filter(e=>e.id!=='g-vnl2_670'); S.savedAt=Date.now(); __tg.scheduleSave(true); return JSON.stringify(r); })()"""))
        await pg.wait_for_timeout(2500); await pg.reload(); await pg.wait_for_timeout(1500)
        print(await pg.evaluate("JSON.stringify([__tg.trkLib().length, __tg.trkLib().some(e=>e.id==='g-vnl2_670'), __tg.STATE().truckPicsV])"))
        print("model codes:", await pg.evaluate("""JSON.stringify(['VNL64T760','VHD64F300','VN 610','VNR Electric'].map(m=>{ const ro={vin:'4V4NC9EH9KN278115', model:m}; const e=__tg.trkModelFor(ro); return m+'→'+(e?e.id:'-'); }))"""))
        print("errors", errs); await b.close()
asyncio.run(main())
