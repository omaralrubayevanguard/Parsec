import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1480,"height":1000}); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto("file:///mnt/user-data/outputs/Parsec%20Triage%20needs%20action.html"); await pg.wait_for_timeout(400)
        top=await pg.evaluate("document.querySelector('.wt-wrap').getBoundingClientRect().top")
        clip={"x":20,"y":top,"width":1440,"height":900}
        async def shot(n): await pg.evaluate("scrollTo(0,0)"); await pg.wait_for_timeout(260); await pg.screenshot(path=f"nd_{n}.png", clip=clip)
        await shot("0_start")
        await pg.keyboard.press("j"); await shot("1_kb")
        await pg.keyboard.press("Enter"); await shot("2_logpop")
        await pg.keyboard.press("6"); await shot("3_willcall")
        await pg.keyboard.press("Enter"); await shot("4_snoozed")
        await pg.keyboard.press("s"); await shot("5_snoozemenu")
        await pg.keyboard.press("2"); await shot("6_after_snooze")
        # release item via keyboard
        await pg.click(".i3-it[data-sel='37489'] .gi"); await pg.keyboard.press("j"); await pg.keyboard.press("k")
        await pg.keyboard.press("Enter"); await shot("7_releasepop")
        await pg.keyboard.press("Enter"); await shot("8_released")
        await pg.click("[data-open='snz']"); await shot("9_snoozed_open")
        await pg.click("[data-tt='2']"); await shot("10_back")
        await pg.click(".nx-done"); await shot("11_cleared")
        await pg.keyboard.press("?"); await shot("12_help")
        await pg.keyboard.press("Escape")
        await pg.click("[data-caught]"); await shot("13_caught_light")
        await pg.click("[data-theme-set=dark]"); await shot("14_caught_dark")
        await pg.click("[data-reset]"); await pg.keyboard.press("j"); await pg.keyboard.press("j"); await pg.keyboard.press("j"); await shot("15_dark_kb")
        await pg.keyboard.press("Enter"); await shot("16_dark_assign")
        await pg.keyboard.press("2"); await shot("17_dark_assigned")
        await pg.keyboard.press("t"); await shot("18_dark_xfer")
        await pg.keyboard.press("Escape")
        await pg.click("[data-theme-set=light]")
        # composer in inbox: pick outcome Left voicemail
        await pg.click("[data-reset]")
        await pg.click(".i3-comp [data-lf-out='Left voicemail']"); await shot("19_composer")
        print("errors:",errs); await b.close()
asyncio.run(main())
