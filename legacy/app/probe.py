import asyncio, json, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto("file://"+sys.argv[1]); await pg.wait_for_timeout(2500)
        await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(800)
        r=await pg.evaluate("""(()=>{const S=__tg.S();return S.ros.filter(r=>!r.shop&&r.id!=='ro_shop').map(r=>[r.roNumber,r.customerName,__tg.tyCat(r),__tg.roStatus(r).status,__tg.roStatus(r).sub,r.location,r.assignedTech,(r.contacts||[]).length,(r.operations||[]).map(o=>(o.appr&&o.appr.s)||'-').join(''),r.route?r.route.to+'/'+r.route.state:'',r.keyTag,r.unitNumber])})()""")
        for x in r: print(x)
        print("theme:", await pg.evaluate("document.documentElement.getAttribute('data-theme')"))
        print("errors:", errs[:5]); await b.close()
asyncio.run(main())
