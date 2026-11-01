import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1480,"height":1000}); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto("file:///mnt/user-data/outputs/Parsec%20Triage%20inbox.html"); await pg.wait_for_timeout(500)
        top=await pg.evaluate("document.querySelector('.wt-wrap').getBoundingClientRect().top")
        clip={"x":20,"y":top,"width":1440,"height":900}
        for th in ("light","dark"):
            await pg.click(f"[data-theme-set={th}]")
            for v in ("inbox","desk","yard"):
                await pg.click(f".mock [data-view='{v}']"); await pg.wait_for_timeout(250)
                await pg.screenshot(path=f"tib_{v}_{th}.png", clip=clip)
        # yard: hover a list item, then move mode
        await pg.hover(".i3-it[data-sel='37489']"); await pg.wait_for_timeout(200)
        await pg.screenshot(path="tib_yard_hover.png", clip=clip)
        await pg.click(".mock [data-move='1']"); await pg.wait_for_timeout(200)
        await pg.screenshot(path="tib_yard_move.png", clip=clip)
        await pg.click(".mock [data-free='C6']"); await pg.wait_for_timeout(200)
        await pg.screenshot(path="tib_yard_moved.png", clip=clip)
        # search
        await pg.click("[data-theme-set=light]")
        await pg.click(".mock [data-view='inbox']"); await pg.keyboard.press("/"); await pg.wait_for_timeout(300)
        await pg.keyboard.type("sa"); await pg.wait_for_timeout(200)
        await pg.screenshot(path="tib_search.png", clip=clip)
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200)
        sel=await pg.evaluate("document.querySelector('.i3-top h2')?.textContent")
        # select a non-inbox RO from yard then go to desk
        await pg.click(".mock [data-view='yard']"); await pg.click(".yd [data-sel='37602']"); await pg.click(".mock [data-view='desk']"); await pg.wait_for_timeout(200)
        await pg.screenshot(path="tib_desk_other.png", clip=clip)
        print("after enter:",sel,"errors:",errs); await b.close()
asyncio.run(main())
