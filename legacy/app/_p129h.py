import asyncio, os, sys, json
sys.argv = ['x', 't12z.html']
_src = open("_t127p.py").read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rl = await pg.evaluate("(__tg.STATE().ros.find(r=>!r.shop && __tg.roStatus(r).status==='Complete – Released')||{}).id")
        await pg.evaluate(f"(()=>{{ __tg.setRoStatus('{rl}', 'Hold Tech', null); __tg.render(); }})()"); await pg.wait_for_timeout(1000)
        r = await pg.evaluate("""(()=>{ const c=document.querySelector('.roreo-c'), w=document.querySelector('.roreo'); const g=getComputedStyle(c), h=getComputedStyle(w); return [g.backgroundColor, g.opacity, h.opacity, h.backgroundColor, g.getPropertyValue('--r-bg'), h.zIndex, getComputedStyle(document.querySelector('.roreo-h b')).color, w.parentElement.tagName]; })()""")
        print(r)
        css = await pg.evaluate("[...document.styleSheets].map(s=>{ try{ return [...s.cssRules].filter(r=>r.cssText && r.cssText.indexOf('roreo')>=0).map(r=>r.cssText.slice(0,160)); }catch(e){ return []; } }).flat()")
        print(len(css)); print("\n".join(css[:30]))
        await b.close()
asyncio.run(main())
