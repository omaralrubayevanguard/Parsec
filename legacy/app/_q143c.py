import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_eb.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(1500)
        print(await pg.evaluate("[__tg.UI().view, __tg.tcxOn(), document.querySelector('[data-pg=tech] .tch-jc').dataset.jc]"))
        J2 = "(()=>{ const h=document.querySelector('[data-pg=tech] .jc-host'); const R=h.shadowRoot; return [(R.querySelector('.px-crumb')||{}).textContent, (R.querySelector('.px-head__pager')||{}).textContent]; })()"
        print(await pg.evaluate(J2))
        await pg.evaluate("__tg.JC.rerender()"); await pg.wait_for_timeout(300)
        print(await pg.evaluate(J2))
        await pg.evaluate("__tg.render()"); await pg.wait_for_timeout(500)
        print(await pg.evaluate(J2))
        await b.close()
asyncio.run(main())
