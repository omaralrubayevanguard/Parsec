import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1480,"height":1000}); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto("file:///mnt/user-data/outputs/Parsec%20Triage%20transfers%20and%20release.html"); await pg.wait_for_timeout(400)
        top=await pg.evaluate("document.querySelector('.wt-wrap').getBoundingClientRect().top")
        clip={"x":20,"y":top,"width":1440,"height":900}
        async def shot(n): await pg.evaluate("scrollTo(0,0)"); await pg.wait_for_timeout(280); await pg.screenshot(path=f"xr_{n}.png", clip=clip)
        await shot("0_start")
        for th in ("light","dark"):
            await pg.click(f"[data-theme-set={th}]")
            for d in ("rlb","rlok","xf","held"):
                await pg.click(f"[data-demo={d}]"); await shot(f"{d}_{th}")
        await pg.click("[data-theme-set=light]")
        # blocked release: fix notes then release
        await pg.click("[data-demo=rlb]"); await pg.click(".nx-pop [data-rl-fix=notes]"); await pg.keyboard.type("Replaced turbo actuator, cleared codes, verified boost."); await shot("1a_fix")
        await pg.keyboard.press("Enter"); await shot("1b_fixed")
        await pg.keyboard.press("Enter"); await shot("1c_released")
        # release anyway path
        await pg.click("[data-demo=rlb]"); await pg.click(".nx-pop [data-rl-any]"); await pg.click(".nx-pop [data-rl-reason='Customer is at the counter']"); await shot("1d_anyway")
        await pg.keyboard.press("Enter"); await shot("1e_anyway_done")
        await pg.click("[data-open=clr]"); await shot("1f_cleared")
        # transfer flow via keyboard
        await pg.click("[data-demo=xf]"); await pg.keyboard.press("Enter"); await shot("2a_xfered")
        await pg.click(".i3-it[data-sel='37538']") if await pg.query_selector(".i3-it[data-sel='37538']") else None
        await pg.click("[data-tt='1']"); await pg.click("[data-tt='1']"); await shot("2b_after2h")
        # keyboard transfer from scratch
        await pg.click("[data-reset]"); await pg.keyboard.press("t"); await shot("2c_pick")
        await pg.keyboard.press("4"); await pg.keyboard.press("2"); await shot("2d_desk")
        print("errors:",errs); await b.close()
asyncio.run(main())
