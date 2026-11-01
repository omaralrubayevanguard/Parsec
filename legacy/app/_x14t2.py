import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_tt.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t14t.py")).read()
_src = _src[:_src.index("async def main():\n")]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate(ADMIN); await pg.wait_for_timeout(500)
        await view(pg, "warranty")
        print(await pg.evaluate("""(()=>{ const x=document.querySelector('.pgst.wa-cs'); const out=[]; for(const sh of document.styleSheets){ let rs; try{ rs=sh.cssRules; }catch(e){ continue; } for(const r of rs){ if(!r.selectorText) continue; try{ if(x.matches(r.selectorText) && (r.style.flexDirection||r.style.display)) out.push(r.selectorText.slice(0,120)+' => '+r.style.cssText.slice(0,120)); }catch(e){} } } return out; })()"""))
        await b.close()
asyncio.run(main())
