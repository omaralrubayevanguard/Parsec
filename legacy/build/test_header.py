import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1480,"height":1000}); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto("file:///mnt/user-data/outputs/Parsec%20Triage%20header.html"); await pg.wait_for_timeout(400)
        top=await pg.evaluate("document.querySelector('.wt-wrap').getBoundingClientRect().top")
        clip={"x":20,"y":top,"width":1440,"height":900}
        async def shot(n): await pg.evaluate("scrollTo(0,0)"); await pg.wait_for_timeout(300); await pg.screenshot(path=f"hd_{n}.png", clip=clip)
        for th in ("light","dark"):
            await pg.click(f"[data-theme-set={th}]")
            for d in ("flate","fapr","badge","search"):
                await pg.click(f"[data-demo={d}]"); await shot(f"{d}_{th}")
        await pg.click("[data-theme-set=light]")
        # filter by clicking header facts
        await pg.click("[data-reset]"); await pg.click("[data-filt=rdy]"); await shot("1a_rdy")
        await pg.click("[data-filt=rdy]"); await shot("1b_clear")
        # badge flow: go to ROs page, +30 x2
        await pg.click(".tg-rail a[data-page=ros]"); await pg.click("[data-tt='0.5']"); await pg.click("[data-tt='0.5']"); await pg.wait_for_timeout(100); await shot("2a_fly")
        await pg.click(".rl-fly [data-page=triage]"); await shot("2b_back")
        # search: spot B2, then unit, shift+enter to yard
        await pg.click("[data-reset]"); await pg.keyboard.press("/"); await pg.keyboard.type("b2"); await shot("3a_b2")
        await pg.keyboard.press("ArrowDown"); await pg.keyboard.press("Shift+Enter"); await shot("3b_yard")
        await pg.keyboard.press("/"); await pg.keyboard.type("elkin"); await shot("3c_released")
        await pg.keyboard.press("Escape")
        await pg.keyboard.press("/"); await pg.keyboard.type("891"); await shot("3d_vin")
        print("errors:",errs); await b.close()
asyncio.run(main())
