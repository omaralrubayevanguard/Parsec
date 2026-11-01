import asyncio, sys, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + B + "/fmd_test.html"); await pg.wait_for_timeout(800)
        wrap = await pg.query_selector(".wt-wrap")
        async def shot(n):
            await pg.mouse.move(2, 2); await pg.wait_for_timeout(300); await pg.evaluate("window.scrollTo(0,0)"); bb = await wrap.bounding_box(); await pg.screenshot(path=f"{B}/fmd_{n}.png", clip=bb)
        ev = pg.evaluate
        R = "(no)=>{const r=__fm.S().R.find(r=>r.no===no);return JSON.stringify({tech:r.tech,spot:r.spot,st:r.st,sub:r.sub,q:r.qpos,ops:(r.ops2||[]).map(o=>o.t+':'+o.st),bring:r.bring,plan:r.plan,parts:r.parts})}"
        for d in ["overview", "find", "bays", "batch", "hold", "free"]:
            await pg.click(f"[data-demo='{d}']"); await shot("1_" + d)
        # 1: quote it
        await pg.click("[data-demo='find']"); await pg.keyboard.press("Enter"); await shot("2_quoted")
        print("quote ->", await ev(R, "37480"))
        # 1 -> 4: go ahead chains into hold
        await pg.click("[data-demo='find']"); await pg.keyboard.press("2"); await shot("2_goahead_sel"); await pg.keyboard.press("Enter"); await shot("2_hold_chain")
        await pg.keyboard.press("Enter"); await shot("2_held")
        print("held ->", await ev(R, "37480")); print("37655 ->", await ev(R, "37655"))
        await pg.click("[data-a='partsin']"); await shot("2_partsin")
        print("parts in ->", await ev(R, "37480"))
        # comeback decide
        await pg.click("[data-demo='overview']"); await pg.click(".tg-it[data-ro='37011'] [data-a='do']"); await shot("2_comeback")
        await pg.keyboard.press("1"); await pg.keyboard.press("Enter"); print("comeback ->", await ev(R, "37011"))
        # 2: bring 37500 to best bay
        await pg.click("[data-demo='bays']"); await pg.click(".tg-pop [data-a='abay'][data-b='AW2']"); await shot("2_bay_warn")
        await pg.keyboard.press("Enter"); print("bring AW2 ->", await ev(R, "37500"))
        # 3: plan together — expand a row, change, free B11, assign
        await pg.click("[data-demo='batch']")
        await pg.click(".fm-pr4 [data-a='pex'][data-no='37705']"); await shot("2_plan_ex")
        await pg.click("[data-a='pfree']"); await shot("2_plan_free"); await pg.keyboard.press("Enter"); await shot("2_plan_after_free")
        print("37320 ->", await ev(R, "37320"))
        await pg.keyboard.press("Enter"); await shot("2_plan_done")
        for no in ["37500", "37455", "37705", "37660"]: print(no, await ev(R, no))
        # select in list
        await pg.click("[data-demo='overview']"); await pg.hover(".tg-it[data-ro='37705']"); await shot("2_hover_box")
        await pg.click(".tg-it[data-ro='37705'] [data-a='bsel']"); await pg.click(".tg-it[data-ro='37660'] [data-a='bsel']"); await shot("2_selected")
        await pg.keyboard.press("p"); await shot("2_plan_sel")
        await pg.keyboard.press("Escape")
        # 4: free bay from watch
        await pg.click("[data-demo='free']"); await pg.keyboard.press("Enter"); await shot("2_freed")
        print("free ->", await ev(R, "37320"))
        await pg.click("[data-theme-set='dark']"); await pg.click("[data-demo='batch']"); await shot("3_dark_batch")
        await pg.click("[data-demo='find']"); await shot("3_dark_find")
        await pg.click("[data-demo='overview']"); await shot("3_dark_overview")
        print("errors:", errs); await b.close()
asyncio.run(main())
