import asyncio, os, sys, json
sys.argv = ['x', 't12.html']
_src = open("_t127p.py").read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("__tg.pxLogout(false); __tg.render()"); await pg.wait_for_timeout(600)
        await pg.screenshot(path="shots130/a_signin.png")
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()"); await pg.wait_for_timeout(500)
        await pg.evaluate("__tg.PG.go('manager')"); await pg.wait_for_timeout(900)
        await pg.screenshot(path="shots130/b_manager.png")
        txt = await pg.evaluate("[...document.querySelectorAll('button, [role=tab]')].map(b=>b.textContent.trim()).filter(t=>/staff|team|people|users/i.test(t)).slice(0,10)")
        print(txt)
        await b.close()
asyncio.run(main())
