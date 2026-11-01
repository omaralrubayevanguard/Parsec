import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_eb.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots143b")
SRT = "document.querySelector('[data-pg=tech] .jc-host').shadowRoot"
def JT(js): return "(()=>{ const h=document.querySelector('[data-pg=tech] .jc-host'); const R=h&&h.shadowRoot; if(!R) return null; " + js + " })()"
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(1500)
        print(await pg.evaluate(JT("return [R.querySelectorAll('.rop-orow').length, !!R.querySelector('.px-ro__title'), (R.querySelector('.px-crumb')||{}).textContent, (R.querySelector('.px-head__pager')||{}).textContent, [...R.querySelectorAll('.rop-acts button')].map(b=>b.textContent)]")))
        print(await pg.evaluate("(()=>{ const h=document.querySelector('[data-pg=tech] .jc-host'); return h ? [h.getBoundingClientRect().width, h.getBoundingClientRect().height, h.parentElement.className] : 'no host'; })()"))
        await pg.screenshot(path=os.path.join(OUT, "q1.png"))
        print("ERRORS", errs[:5])
        await b.close()
asyncio.run(main())
