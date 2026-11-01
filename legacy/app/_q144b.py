import asyncio, os, sys, json
sys.argv = ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OPEN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); localStorage.removeItem('rop_fold'); __tg.pxSignedIn(); const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>=2); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); return r.id; })()"
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate(OPEN); await pg.wait_for_timeout(1200)
        await pg.evaluate(J("R.querySelector('[data-fold=c-parts] .rop-fb').click()")); await pg.wait_for_timeout(250)
        await pg.evaluate(J("const s=R.querySelector('[data-fold=c-parts]'); s.__tag=1; window.__ev=[]; ['pointerenter','pointerover','mouseover'].forEach(t=>s.addEventListener(t,e=>window.__ev.push(t+':'+e.pointerType),true));"))
        hb = await pg.evaluate(J("const r=R.querySelector('[data-fold=c-parts] .rop-sech').getBoundingClientRect(); return [r.left+60, r.top+r.height/2, r.width, r.height]"))
        print("head rect", hb)
        print("at point:", await pg.evaluate(f"(()=>{{ const e=document.elementFromPoint({hb[0]},{hb[1]}); const h=e&&e.shadowRoot? e.shadowRoot.elementFromPoint({hb[0]},{hb[1]}):null; return [e&&e.className, h&&h.className, h&&h.parentElement&&h.parentElement.className]; }})()"))
        await pg.mouse.move(hb[0], hb[1], steps=4); await pg.wait_for_timeout(700)
        print(await pg.evaluate(J("const s=R.querySelector('[data-fold=c-parts]'); return [s.__tag, s.className, window.__ev]")))
        await b.close()
asyncio.run(main())
