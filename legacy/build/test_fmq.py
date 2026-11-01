import asyncio, sys, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + B + "/fmq_test.html"); await pg.wait_for_timeout(800)
        wrap = await pg.query_selector(".wt-wrap")
        async def shot(n):
            await pg.mouse.move(2, 2); await pg.wait_for_timeout(300); await pg.evaluate("window.scrollTo(0,0)"); bb = await wrap.bounding_box(); await pg.screenshot(path=f"{B}/fmq_{n}.png", clip=bb)
        ev = pg.evaluate
        R = "(no)=>{const r=__fm.S().R.find(r=>r.no===no);return JSON.stringify({tech:r.tech,spot:r.spot,st:r.st,sub:r.sub,q:r.qpos,qc:r.qcOk,hold:r.hold&&r.hold.who})}"
        for d in ["overview", "qc", "back", "badge", "tmr", "note"]:
            await pg.click(f"[data-demo='{d}']"); await shot("1_" + d)
        await pg.click("[data-demo='qc']"); await pg.click(".tg-pop [data-a='qck'][data-i='0']"); await pg.click(".tg-pop [data-a='qck'][data-i='1']"); await shot("2_qc_ticked"); await pg.keyboard.press("Enter")
        print("pass ->", await ev(R, "37388")); await shot("2_qc_passed")
        await pg.click("[data-demo='back']"); await pg.keyboard.press("Enter"); print("back ->", await ev(R, "37700")); await shot("2_sent_back")
        await pg.click("[data-demo='badge']"); await pg.click(".fm-nbf [data-a='nbt'][data-g='free']"); await shot("2_badge_free")
        print("badge", await ev("document.querySelector('.fm-nb').textContent"))
        await pg.click(".fm-nbi"); await shot("2_badge_go")
        # tomorrow: drag the unplanned clutch onto Mike, click-move another
        await pg.click("[data-demo='tmr']")
        print("plan", await ev("JSON.stringify(__fm.S().tm)"))
        await pg.locator(".fm-tmk[data-tdrag='37725']").drag_to(pg.locator(".fm-tmc[data-tk='MR']")); await shot("2_tmr_drag")
        await pg.click(".fm-tmk[data-tdrag='37720']"); await shot("2_tmr_click"); await pg.click(".fm-tmk[data-tdrag='37720'] [data-a='tmv'][data-k='LM']"); await shot("2_tmr_moved")
        print("plan2", await ev("JSON.stringify(__fm.S().tm)"))
        await pg.click("[data-a='tmauto']"); await pg.click("[data-a='tmsend']"); await shot("2_tmr_sent")
        await pg.click("[data-theme-set='dark']"); await pg.click("[data-demo='tmr']"); await shot("3_dark_tmr")
        await pg.click("[data-demo='qc']"); await shot("3_dark_qc")
        await pg.click("[data-demo='badge']"); await shot("3_dark_badge")
        print("errors:", errs); await b.close()
asyncio.run(main())
