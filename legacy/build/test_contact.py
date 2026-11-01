import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1480,"height":1000}); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e))); pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None)
        await pg.goto("file:///mnt/user-data/outputs/Parsec%20Triage%20customer%20contact.html"); await pg.wait_for_timeout(400)
        top=await pg.evaluate("document.querySelector('.wt-wrap').getBoundingClientRect().top")
        clip={"x":20,"y":top,"width":1440,"height":900}
        async def shot(n): await pg.evaluate("scrollTo(0,0)"); await pg.wait_for_timeout(280); await pg.screenshot(path=f"cc_{n}.png", clip=clip)
        await shot("0_start")
        for th in ("light","dark"):
            await pg.click(f"[data-theme-set={th}]")
            for d in ("out","tpl","who","rec"):
                await pg.click(f"[data-demo={d}]"); await shot(f"{d}_{th}")
        await pg.click("[data-theme-set=light]")
        # flow 1: approved via keyboard, untick op2, decline rest, log
        await pg.click("[data-demo=out]"); await pg.click(".nx-pop label.cx-op:nth-of-type(2)"); await shot("1b_untick")
        await pg.click(".nx-pop [data-lf-go]"); await shot("1c_logged")
        # flow 2: template copy & log
        await pg.click("[data-demo=tpl]"); await pg.click(".nx-pop [data-lf-editmsg]"); await pg.keyboard.type(" Thanks!"); await shot("2b_edit")
        await pg.keyboard.press("Enter"); await shot("2c_logged")
        await pg.click("[data-demo=tpl]"); await pg.click(".nx-pop [data-tpled]"); await shot("2d_editor")
        await pg.click("[data-tm-tok=ready]"); await shot("2e_tok")
        await pg.keyboard.press("Escape")
        # flow 4: save approval for op2
        await pg.click("[data-demo=rec]"); await pg.click(".ap-pop [data-ap-how=Text]"); await pg.click(".ap-pop [data-ap-po]"); await pg.keyboard.type("BRH-21004"); await pg.keyboard.press("Enter"); await shot("4b_saved")
        await pg.click("[data-aprrec='2']"); await shot("4c_addrec")
        await pg.keyboard.press("Escape")
        await pg.click("[data-copyrec]"); await shot("4d_copied")
        # composer with Approved
        await pg.click("[data-reset]"); await pg.click(".i3-comp [data-lf-out=Approved]"); await shot("5_composer")
        await pg.click(".i3-comp [data-lf-kind=Text]"); await shot("6_composer_text")
        print("errors:",errs); await b.close()
asyncio.run(main())
