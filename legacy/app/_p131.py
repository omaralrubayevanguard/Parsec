import asyncio, os, sys, json
sys.argv = ['x', 't12.html']
_src = open("_t127p.py").read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='rolist'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path="shots131/a_list.png")
        Q = "[data-pg=rolist]"
        nums = lambda: pg.evaluate("[...document.querySelectorAll('[data-pg=rolist] .rq-rows .rq-row .rq-no')].slice(0,8).map(x=>x.textContent)")
        tabs = await pg.evaluate("[...document.querySelectorAll('[data-pg=rolist] .rq-seg button')].map(b=>[b.textContent, b.dataset.action, b.dataset.g, b.className])")
        print('tabs', tabs)
        print('rows0', await nums())
        for t in tabs:
            await pg.click(f"[data-pg=rolist] .rq-seg button[data-g='{t[2]}']"); await pg.wait_for_timeout(500)
            print(t[2], await pg.evaluate("__tg.UI().rlGroup"), (await nums())[:5], await pg.evaluate("document.querySelectorAll('[data-pg=rolist] .rq-row').length"))
        await pg.click("[data-pg=rolist] .rq-seg button[data-g='all']"); await pg.wait_for_timeout(400)
        await pg.click("[data-pg=rolist] [data-a=pop][data-p=disp]"); await pg.wait_for_timeout(400)
        await pg.screenshot(path="shots131/b_disp.png")
        for so in ['no', 'ready', 'days']:
            await pg.click(f"[data-pg=rolist] [data-a=dso][data-v={so}]"); await pg.wait_for_timeout(400)
            print('sort', so, (await nums())[:6])
        print(errs)
        await b.close()
asyncio.run(main())
