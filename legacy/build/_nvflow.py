import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/nv_mock.html"); await pg.wait_for_timeout(500)
        N = lambda: pg.evaluate("(()=>{const n=__nv.N(); return {open:n.open,pos:n.pos,pop:n.pop,page:n.page,sec:n.sec,out:n.out,who:n.who,size:n.size}})()")
        async def click(sel): await pg.click(sel); await pg.wait_for_timeout(120)
        # axis check: every icon box centered on the same x, closed and open
        for mode in ['false','true']:
            await click(f'[data-nv="open:{mode}"]')
            xs = await pg.evaluate("[...document.querySelectorAll('.nv .nv-ic')].map(e=>{const r=e.getBoundingClientRect(); return Math.round((r.left+r.width/2)*100)/100})")
            print("open" if mode=='true' else "icons", "icon centers:", sorted(set(xs)))
        ys_closed = None
        for mode in ['false','true']:
            await click(f'[data-nv="open:{mode}"]')
            ys = await pg.evaluate("[...document.querySelectorAll('.nv .nv-ic')].map(e=>Math.round(e.getBoundingClientRect().top))")
            if ys_closed is None: ys_closed = ys
            else: print("icons stay put on open:", ys == ys_closed)
        await click('[data-nv="open:false"]')
        await click('[data-a="nvpop"][data-p="me"]'); print("menu:", await N())
        await click('[data-a="nvtheme"][data-v="dark"]'); print("theme:", await pg.evaluate("document.documentElement.dataset.theme"))
        await click('[data-a="nvtheme"][data-v="light"]')
        await click('[data-a="nvsize"][data-v="large"]'); xs = await pg.evaluate("[...document.querySelectorAll('.nv .nv-ic')].map(e=>{const r=e.getBoundingClientRect(); return Math.round(r.left+r.width/2)})"); print("large centers:", sorted(set(xs)))
        await click('[data-a="nvsize"][data-v="normal"]')
        await click('.nv-pop [data-a="nvprofile"][data-s="look"]'); print("page:", await N())
        for s in ['you','sign','look','data','tools','keys']:
            await click(f'[data-a="nvsec"][data-v="{s}"]')
        await click('[data-a="nvsec"][data-v="sign"]'); await click('[data-a="nvtog"][data-k="lock"]'); print("lock:", await pg.evaluate("__nv.N().lock"))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100); print("esc back:", (await N())['page'])
        await pg.keyboard.press('['); await pg.wait_for_timeout(100); print("[ opens:", (await N())['open'])
        await click('[data-a="nvpop"][data-p="clk"]'); await click('[data-a="nvstop"]'); print("clock stop:", await pg.evaluate("__cx.S().run"), (await pg.inner_text('.toast-fm'))[:60])
        await click('[data-a="nvpop"][data-p="me"]'); await click('[data-a="nvlogout"]'); print("logged out:", (await N())['out'], (await pg.inner_text('.toast-fm'))[:70])
        await click('[data-a="nvin"][data-k="DK"]'); print("dana:", (await pg.inner_text('.toast-fm'))[:60])
        await click('[data-a="nvin"][data-k="RH"]'); print("ray in:", await N())
        await click('[data-ndemo="ray"]'); print("ray admin sec:", await pg.evaluate("[...document.querySelectorAll('.nv-si b')].map(b=>b.innerText).join(',')"))
        await click('[data-nv="pos:clock"]'); print("below the clock:", await pg.evaluate("(()=>{const a=document.querySelector('.nv-clk'), m=document.querySelector('.nv-me'); return m.getBoundingClientRect().top-a.getBoundingClientRect().bottom})()"))
        await click('[data-nv="before:true"]'); print("before img:", await pg.query_selector('.nv-before img') is not None)
        await click('[data-reset]'); print("reset:", await N())
        print("\n".join(errs) or "no errors"); await b.close()
asyncio.run(main())
