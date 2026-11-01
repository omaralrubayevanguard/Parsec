import asyncio, os, sys, json
sys.argv = ['x', 't12_cc.html']
_src = open('_t127p.py').read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots14c")
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.PG.go('manager'); })()"); await pg.wait_for_timeout(900)
        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('[data-pg=manager] button')].find(x=>/Fleets/.test(x.textContent)); b && b.click(); })()"); await pg.wait_for_timeout(700)
        await pg.evaluate("(()=>{ const f=[...document.querySelectorAll('[data-pg=manager] [data-a=fleet]')]; const x=f.find(e=>/in the shop/.test(e.textContent)); x && x.click(); })()"); await pg.wait_for_timeout(700)
        print("fleet in shop pgst:", await pg.evaluate("document.querySelectorAll('[data-pg=manager] .mq-hr small .pgst').length"))
        await pg.screenshot(path=os.path.join(OUT, "c12_fleet.png"))
        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('[data-pg=manager] button')].find(x=>/^\\s*Flow/.test(x.textContent)); b && b.click(); })()"); await pg.wait_for_timeout(700)
        print("flow pgst:", await pg.evaluate("document.querySelectorAll('[data-pg=manager] .mq-hr small .pgst').length"))
        await pg.screenshot(path=os.path.join(OUT, "c13_flow.png"))
        await pg.evaluate("__tg.PG.go('career')"); await pg.wait_for_timeout(900)
        print("career pgst:", await pg.evaluate("document.querySelectorAll('[data-pg=career] .pgst').length"))
        await pg.screenshot(path=os.path.join(OUT, "c14_career.png"))
        await pg.evaluate("__tg.PG.go('report')"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "c15_report.png"))
        print("ERR", errs[:3]); await b.close()
asyncio.run(main())
