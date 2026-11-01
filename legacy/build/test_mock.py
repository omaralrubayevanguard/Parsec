import asyncio
from playwright.async_api import async_playwright
F="file:///mnt/user-data/outputs/Parsec%20RO%20redesign.html"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1300,"height":1000})
        errs=[]; pg.on("pageerror",lambda e:errs.append(str(e))); pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None)
        await pg.goto(F); await pg.wait_for_timeout(400)
        await pg.screenshot(path="m1.png")
        await pg.click("[data-status-btn]"); await pg.wait_for_timeout(200)
        await pg.hover(".px-smenu .px-menu__item[data-k=parts]"); await pg.wait_for_timeout(200)
        await pg.screenshot(path="m2.png", clip={"x":0,"y":0,"width":1300,"height":700})
        await pg.click(".px-sub [data-r=Ordered]"); await pg.wait_for_timeout(200)
        await pg.click("[data-body='1'] [data-go]"); await pg.wait_for_timeout(2200)
        await pg.click("[data-theme-set=dark]"); await pg.wait_for_timeout(200)
        await pg.screenshot(path="m3.png")
        await pg.keyboard.press("Control+k"); await pg.wait_for_timeout(200)
        await pg.screenshot(path="m4.png", clip={"x":0,"y":0,"width":1300,"height":700})
        await pg.keyboard.press("Escape")
        await pg.click(".px-row[data-op='2']"); await pg.click("[data-body='2'] [data-tab=parts]"); await pg.wait_for_timeout(200)
        await pg.click("[data-stage=approval]"); await pg.wait_for_timeout(200)
        await pg.screenshot(path="m5.png")
        await pg.click("[data-view=before]"); await pg.wait_for_timeout(200); await pg.screenshot(path="m6.png")
        print("errors:",errs); await b.close()
asyncio.run(main())
