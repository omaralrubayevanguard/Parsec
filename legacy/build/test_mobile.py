import asyncio
from playwright.async_api import async_playwright
F="file:///mnt/user-data/outputs/Parsec%20Mobile%20mock-up.html"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1440,"height":1000})
        errs=[]; pg.on("pageerror",lambda e:errs.append(str(e))); pg.on("console",lambda m: errs.append(m.text) if m.type=="error" and 'ERR_' not in m.text else None)
        await pg.goto(F); await pg.wait_for_timeout(800)
        await pg.screenshot(path="mb_full.png", full_page=True)
        figs=await pg.query_selector_all(".pm-dev")
        for i,f in enumerate(figs): await f.screenshot(path=f"mb_{i+1}.png")
        # interactions
        await pg.click("[data-screen=ro] [data-sheet=parts]"); await pg.wait_for_timeout(400)
        await figs[1].screenshot(path="mb_ro_parts.png")
        await pg.click("[data-screen=ro] [data-done]"); await pg.wait_for_timeout(300)
        await pg.click("[data-screen=op] [data-pp='1-1']"); await pg.wait_for_timeout(400)
        await pg.click("[data-screen=op] .pm-sheet[data-live] [data-set=installed]"); await pg.wait_for_timeout(500)
        print("inhand:", await pg.inner_text("[data-screen=ro] [data-inhand]"), "pcount:", await pg.inner_text("[data-screen=op] [data-pcount]"))
        await figs[2].screenshot(path="mb_op_after.png")
        await pg.click("[data-screen=op] [data-go]"); await pg.wait_for_timeout(400)
        print("cbar hidden:", await pg.evaluate("document.querySelector('[data-screen=today] [data-cbar]').hidden"))
        await pg.click("[data-screen=today] [data-play='37538-3']"); await pg.wait_for_timeout(1300)
        print("cbar job:", await pg.inner_text("[data-screen=today] [data-cbar-job]"), "|", await pg.inner_text("[data-screen=today] [data-clock-mini]"))
        await figs[0].screenshot(path="mb_today_pm.png")
        await pg.click("[data-theme-set=dark]"); await pg.click("#bay"); await pg.wait_for_timeout(400)
        await pg.screenshot(path="mb_full_dark.png", full_page=True)
        for i,f in enumerate(figs): await f.screenshot(path=f"mbd_{i+1}.png")
        await pg.click("[data-screen=sync] [data-sync=get]"); await pg.wait_for_timeout(300); await figs[4].screenshot(path="mbd_sync_get.png")
        # overflow check of screens
        print(await pg.evaluate("[...document.querySelectorAll('.pm-body')].map(b=>b.closest('[data-screen]').dataset.screen+':'+b.scrollHeight+'/'+b.clientHeight+' sw'+b.scrollWidth+'/'+b.clientWidth)"))
        print("errors:", errs); await b.close()
asyncio.run(main())
