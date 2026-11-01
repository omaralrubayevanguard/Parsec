import asyncio, os, sys, json
sys.argv = ['x', 't12.html']
_src = open("_t127p.py").read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        r = await pg.evaluate("""(()=>{ const ro=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>1); const o={}; Object.keys(ro).forEach(k=>{ const v=ro[k]; o[k]= (v && typeof v==='object') ? (Array.isArray(v)?'[arr '+v.length+']':'{'+Object.keys(v).slice(0,6).join(',')+'}') : v; }); return o; })()""")
        print(json.dumps(r, indent=0)[:3000])
        await b.close()
asyncio.run(main())
