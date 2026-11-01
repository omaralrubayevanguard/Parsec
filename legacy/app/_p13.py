import asyncio, os, sys, json
sys.argv = ['x', 't12.html']
_src = open("_t127p.py").read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        D = await pg.evaluate("__tg.staffList().find(s=>s.name==='Dana Kowalski').id")
        await pg.evaluate("__tg.pxLogout(false); __tg.render()"); await pg.wait_for_timeout(500)
        await pg.click(f".pxs-p[data-id='{D}'], [data-action=viewas-set][data-id='{D}']"); await pg.wait_for_timeout(500)
        await pg.screenshot(path="shots13/a_firstpin.png")
        for k in "2580": await pg.keyboard.press(k)
        await pg.wait_for_timeout(400)
        for k in "2580": await pg.keyboard.press(k)
        await pg.wait_for_timeout(900)
        print('me', await pg.evaluate("__tg.pcMe()"), await pg.evaluate("__tg.UI().toast"))
        await pg.evaluate("__tg.pxLogout(false); __tg.render()"); await pg.wait_for_timeout(500)
        await pg.screenshot(path="shots13/b_login_recent.png")
        print(errs)
        await b.close()
asyncio.run(main())
