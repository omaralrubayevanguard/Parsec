import asyncio, os, sys, json
sys.argv = ['x', 't12.html']
_src = open("_t127p.py").read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        r = await pg.evaluate("""(()=>{ const out=[]; __tg.STATE().ros.filter(r=>!r.shop && !r.dateClosed).slice(0,12).forEach(ro=>{ let nx=null, M=null; try{ nx=raNext(ro); }catch(e){ nx=String(e); } try{ M=roStages(ro); }catch(e){}
          out.push([ro.roNumber, nx && nx.txt, nx && nx.tone, nx && nx.who, M && M.cur && M.cur.name, M && M.cur && M.cur.sub, M && M.next && M.next.name]); }); return out; })()""")
        for x in r: print(x)
        await b.close()
asyncio.run(main())
