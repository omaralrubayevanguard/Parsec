import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1400})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + B + "/fmt_test.html"); await pg.wait_for_timeout(800)
        await pg.click("[data-demo='order']")
        q = "(k)=>__fm.S().R.filter(r=>r.tech===k&&r.qpos!=null).sort((a,b)=>a.qpos-b.qpos).map(r=>r.no+'#'+r.qpos)"
        await pg.locator(".fm-lane[data-tech=MR] .fm-card[data-drag='37612']").drag_to(pg.locator(".fm-lane[data-tech=KT] .fm-card[data-drag='37700']"))
        await pg.wait_for_timeout(300)
        print("KT", await pg.evaluate(q, "KT"), "MR", await pg.evaluate(q, "MR"))
        print(await pg.evaluate("document.querySelector('.tg-toast,.fm-toast')?.innerText"))
        # drop on a lane header (base reassign) 
        await pg.locator(".fm-lane[data-tech=MR] .fm-card[data-drag='37210']").drag_to(pg.locator(".fm-lane[data-tech=LM] .fm-lh"))
        await pg.wait_for_timeout(300)
        print("LM", await pg.evaluate(q, "LM"))
        print("errors", errs); await b.close()
asyncio.run(main())
