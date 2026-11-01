import asyncio, os, sys
sys.argv = ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='parts'; __tg.render(); })()"); await pg.wait_for_timeout(800)
        print(await pg.evaluate("[...document.querySelectorAll('[data-pg=parts] .tg-top button')].map(b=>b.className+'|'+b.textContent.trim().slice(0,20))"))
        print(await pg.evaluate("[...document.querySelectorAll('[data-pg=parts]')].length"), await pg.evaluate("!!document.querySelector('[data-pg=parts] .pq-cb')"))
        await b.close()
asyncio.run(main())
