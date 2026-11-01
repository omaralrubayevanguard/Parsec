import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        r = await pg.evaluate("""(()=>[...document.querySelectorAll('.jc-host')].map(h=>[h.className, getComputedStyle(h).display, h.getBoundingClientRect().width, !!h.shadowRoot]))()""")
        print(r)
        print(await pg.evaluate("Object.keys(__tg.JC||{}).slice(0,80).join(',')"))
        await b.close()
asyncio.run(main())
