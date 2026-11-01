import asyncio, sys, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + B + "/fmt_test.html"); await pg.wait_for_timeout(800)
        wrap = await pg.query_selector(".wt-wrap")
        async def shot(n):
            await pg.mouse.move(2, 2); await pg.wait_for_timeout(300); bb = await wrap.bounding_box(); await pg.screenshot(path=f"{B}/fmt_{n}.png", clip=bb)
        ev = pg.evaluate
        for d in ["techs", "order", "skills", "assign", "cap", "today"]:
            await pg.click(f"[data-demo='{d}']"); await shot("1_" + d)
        q = "(k)=>__fm.S().R.filter(r=>r.tech===k&&r.qpos!=null).sort((a,b)=>a.qpos-b.qpos).map(r=>r.no+'#'+r.qpos)"
        await pg.click("[data-demo='order']")
        print("MR before", await ev(q, "MR"))
        cards = await ev("[...document.querySelectorAll('.fm-lane[data-tech=MR] .fm-card[data-ord]')].map(c=>c.dataset.drag+':'+c.dataset.ord)")
        print("MR cards", cards)
        ups = [c.split(":")[0] for c in cards if not c.endswith(":0")]
        if len(ups) >= 2:
            await pg.locator(f".fm-lane[data-tech=MR] .fm-card[data-drag='{ups[-1]}']").drag_to(pg.locator(f".fm-lane[data-tech=MR] .fm-card[data-drag='{ups[0]}']"))
            await shot("2_reordered"); print("MR after", await ev(q, "MR"))
        # drag to another tech's card (Priya's lane is on screen)
        await pg.locator(".fm-lane[data-tech=MR] .fm-card[data-drag='37612']").drag_to(pg.locator(".fm-lane[data-tech=PS] .fm-card[data-drag='37500']"))
        await shot("2_moved"); print("PS after", await ev(q, "PS"), "MR", await ev(q, "MR"))
        # drag onto a lane header -> end of queue
        await pg.locator(".fm-lane[data-tech=MR] .fm-card[data-drag='37210']").drag_to(pg.locator(".fm-lane[data-tech=LM] .fm-lh .now"))
        print("LM after", await ev(q, "LM"))
        # give work for Kevin
        await pg.click("[data-demo='techs']"); await ev("window.scrollTo(0,0)"); await pg.click(".tg-row[data-ro='T-KT'] .btn, [data-ro='T-KT'] [data-a='do']"); await shot("2_give")
        # skills toggle
        await pg.click("[data-demo='skills']"); await pg.click(".fm-skp [data-s='Aftertreatment']"); await shot("2_skill_on")
        print("KT skills", await ev("document.querySelector('.fm-lane[data-tech=KT] .fm-sks').innerText"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        # assign
        await pg.click("[data-demo='assign']"); await pg.keyboard.press("Enter"); await shot("2_assign_done")
        print("37660 ->", await ev("(()=>{const r=__fm.S().R.find(r=>r.no==='37660');return [r.tech,r.spot,r.qpos]})()"))
        # undo
        await pg.click("[data-a='undo']"); await pg.wait_for_timeout(200)
        print("undo ->", await ev("(()=>{const r=__fm.S().R.find(r=>r.no==='37660');return [r.tech,r.spot]})()"))
        await pg.click("[data-theme-set='dark']"); await pg.click("[data-demo='cap']"); await ev("window.scrollTo(0,0)"); await shot("3_dark_techs")
        await pg.click("[data-demo='assign']"); await shot("3_dark_assign")
        await pg.click("[data-theme-set='light']"); await pg.click("[data-demo='techs']"); await ev("window.scrollTo(0,0)"); await ev("document.querySelector('.fm-tv').scrollTop=9999"); await shot("4_bottom")
        print("errors:", errs); await b.close()
asyncio.run(main())
