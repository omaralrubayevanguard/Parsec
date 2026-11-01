import asyncio, os, sys, json
sys.argv = ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>=2); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); })()"); await pg.wait_for_timeout(1200)
        out = await pg.evaluate(J("""const f=e=>[e.tagName, e.className.slice(0,60), (e.firstElementChild||{}).className ? String(e.firstElementChild.className).slice(0,50) : '', (e.textContent||'').trim().replace(/\\s+/g,' ').slice(0,40)];
          return { band: [...R.querySelector('.rop-band').children].map(f), stage: [...R.querySelector('.rop-stg .px-stage').children].map(f), who: [...R.querySelector('.rop-rblk:not(.rop-stg)').children].map(f), pg: [...R.querySelector('.px-pg').children].map(f), pgClosed: [...R.querySelectorAll('.px-pg:not(.is-open)')].map(x=>[...x.children].map(c=>c.className+':'+getComputedStyle(c).display)), ops: [...R.querySelector('.rop-col > :first-child').children].map(f) };"""))
        print(json.dumps(out, indent=1))
        await b.close()
asyncio.run(main())
