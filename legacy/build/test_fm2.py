import asyncio, sys, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + B + "/fm_test.html"); await pg.wait_for_timeout(800)
        wrap = await pg.query_selector(".wt-wrap")
        async def shot(n):
            await pg.wait_for_timeout(300); bb = await wrap.bounding_box(); await pg.screenshot(path=f"{B}/fm_{n}.png", clip=bb)
        ev = pg.evaluate
        # decide: go ahead
        await pg.click("[data-demo='decide']"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        print("decide ->", await ev("(()=>{const r=__fm.S().R.find(r=>r.no==='37011');return [r.st,r.sub,!!r.run]})()"))
        await shot("4_after_decide")
        # assign: 37628 to Kevin + AW2
        await pg.click("[data-demo='assign']"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        print("assign ->", await ev("(()=>{const r=__fm.S().R.find(r=>r.no==='37628');return [r.tech,r.spot]})()"))
        # bring in
        await pg.click("[data-demo='bring']"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        print("bring ->", await ev("(()=>{const r=__fm.S().R.find(r=>r.no==='37455');return [r.tech,r.spot,r.bring]})()"))
        await shot("4_after_bring")
        # review: ask Dana
        await pg.click("[data-demo='review']"); await pg.keyboard.press("1"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        print("review ->", await ev("(()=>{const r=__fm.S().R.find(r=>r.no==='37612');return [r.st,r.sub]})()"))
        # yard clash: keep 37455
        await pg.click("[data-demo='yard']"); await pg.click("[data-a='keep'][data-ro='37455']"); await pg.wait_for_timeout(300)
        print("clash ->", await ev("__fm.S().R.filter(r=>r.no==='37502'||r.no==='37455').map(r=>r.no+':'+r.spot)"))
        await shot("4_after_clash")
        # techs: drag 37628 card onto Kevin's lane
        await pg.click("[data-demo='techs']")
        await pg.locator(".fm-card[data-ro='37628']").drag_to(pg.locator(".fm-lane[data-tech='KT']"))
        await pg.wait_for_timeout(300)
        print("drag tech ->", await ev("__fm.S().R.find(r=>r.no==='37628').tech"))
        await shot("4_after_drag_tech")
        # floor: drag 37500 chip onto B11
        await pg.click("[data-reset]"); await pg.locator(".fm-chip[data-ro='37500']").drag_to(pg.locator(".fm-bay.free[data-drop='B11']")); await pg.wait_for_timeout(300)
        print("drag bay ->", await ev("__fm.S().R.find(r=>r.no==='37500').spot"))
        await shot("4_after_drag_bay")
        # undo
        await pg.click(".toast-fm [data-a='undo']"); await pg.wait_for_timeout(200)
        print("undo ->", await ev("__fm.S().R.find(r=>r.no==='37500').spot"))
        # search + filter
        await pg.keyboard.press("/"); await pg.keyboard.type("b5"); await shot("4_search")
        await pg.keyboard.press("Escape"); await pg.click(".tg-hf[data-k='late']"); await shot("4_filter_late")
        print("errors:", errs); await b.close()
asyncio.run(main())
