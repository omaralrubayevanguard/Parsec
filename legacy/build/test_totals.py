import asyncio
from playwright.async_api import async_playwright
F="file:///mnt/user-data/outputs/Parsec%20RO%20redesign.html"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1480,"height":1000})
        errs=[]; pg.on("pageerror",lambda e:errs.append(str(e))); pg.on("console",lambda m: errs.append(m.text) if m.type=="error" and 'ERR_' not in m.text else None)
        await pg.goto(F); await pg.wait_for_timeout(600)
        chips=lambda: pg.evaluate("[...document.querySelectorAll('[data-total]')].map(c=>c.dataset.total+': '+c.textContent.replace(/\\s+/g,' ').trim()+(c.classList.contains('is-live')?' (live)':''))")
        print("chips", await chips())
        await pg.screenshot(path="t1.png")
        for k in ("time","parts","files"):
            await pg.click(f"[data-total={k}]"); await pg.wait_for_timeout(450)
            await pg.screenshot(path=f"t_{k}.png")
            print(k,"modal title:", await pg.inner_text(".px-modal__h h2"), "|", await pg.inner_text(".px-modal__h p"))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(250)
        # row click jumps to operation + tab
        await pg.click("[data-total=parts]"); await pg.wait_for_timeout(350)
        await pg.click(".px-modal [data-goto-op='3'][data-goto-tab=parts] >> nth=0"); await pg.wait_for_timeout(500)
        print("selected op:", await pg.evaluate("document.querySelector('.px-row.is-on').dataset.op"), "tab:", await pg.evaluate("document.querySelector('[data-body]:not([hidden]) .px-tab.is-on').dataset.tab"))
        await pg.screenshot(path="t_goto.png")
        # change a part status -> chips update
        await pg.click("[data-part='3-2'] [data-pstat]"); await pg.wait_for_timeout(200); await pg.keyboard.press("5"); await pg.wait_for_timeout(500)
        print("after part 3-2 installed", await chips())
        # clock
        await pg.click(".px-row[data-op='1']"); await pg.click("[data-body='1'] [data-go]"); await pg.wait_for_timeout(2300)
        print("clock running", await chips())
        await pg.click("[data-total=time]"); await pg.wait_for_timeout(400)
        await pg.screenshot(path="t_live.png")
        await pg.keyboard.press("Control+Enter"); await pg.wait_for_timeout(300)
        print("modal open after ctrl+enter:", await pg.evaluate("!!document.querySelector('.px-modal')"))
        await pg.click("[data-body='1'] [data-go]"); await pg.wait_for_timeout(300)
        # add operation -> totals
        await pg.keyboard.press("o"); await pg.wait_for_timeout(300); await pg.fill(".px-modal input[data-autofocus]","Air leak"); await pg.keyboard.press("Control+Enter"); await pg.wait_for_timeout(600)
        print("after add op", await chips(), "| labor:", await pg.inner_text("[data-labor]") if await pg.is_visible("[data-labor]") else "(money closed)")
        # dark
        await pg.click("[data-theme-set=dark]"); await pg.wait_for_timeout(300)
        await pg.screenshot(path="t_dark1.png")
        for k in ("time","parts","files"):
            await pg.click(f"[data-total={k}]"); await pg.wait_for_timeout(450)
            await pg.screenshot(path=f"t_dark_{k}.png"); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(250)
        print("errors:", errs); await b.close()
asyncio.run(main())
