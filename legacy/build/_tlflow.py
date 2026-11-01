import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/tl_mock.html"); await pg.wait_for_timeout(500)
        ev = lambda js: pg.evaluate(js)
        fixes = lambda: ev("(()=>{const U=__tk.U(); return ['2026-10-19','2026-10-21'].map(k=>__tk.calc('MR',k).fixes.length).join(',')})()")
        print("fixes start", await fixes())
        await pg.click('[data-demo="fix"]'); await pg.wait_for_timeout(200); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200)
        print("after noout fix", await fixes(), await ev("(document.querySelector('.toast-fm')||{}).textContent"))
        await pg.click('.toast-fm button'); await pg.wait_for_timeout(200); print("after undo", await fixes())
        await pg.click('.tk-di[data-k="2026-10-21"]'); await pg.wait_for_timeout(200); await pg.click('[data-a="pop"][data-p="fix"]'); await pg.wait_for_timeout(200); await pg.keyboard.press("1"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200)
        print("after overlap fix", await fixes(), await ev("(document.querySelector('.toast-fm')||{}).textContent"))
        await pg.click('[data-demo="air"]'); await pg.wait_for_timeout(200); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200)
        print("air:", await ev("(document.querySelector('.toast-fm')||{}).textContent"), await ev("__tk.calc('MR','2026-10-22').airM"))
        await pg.click('[data-demo="edit"]'); await pg.wait_for_timeout(200); await pg.fill('#tk-s', '07:10'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200)
        print("edit:", await ev("(document.querySelector('.toast-fm')||{}).textContent"), await ev("document.querySelectorAll('.tk-ed').length"))
        await pg.click('[data-demo="day"]'); await pg.keyboard.press("j"); await pg.keyboard.press("j"); await pg.wait_for_timeout(150); print("J J ->", await ev("__tk.U().day"))
        await pg.keyboard.press("ArrowLeft"); await pg.wait_for_timeout(150); print("<- ->", await ev("__tk.U().day"))
        await pg.keyboard.press("2"); await pg.wait_for_timeout(150); print("view", await ev("__tk.U().view"))
        await pg.click('.tk-wr[data-k="2026-10-14"]'); await pg.wait_for_timeout(150); print("week click ->", await ev("__tk.U().view+' '+__tk.U().day"))
        await pg.click('[data-a="pop"][data-p="who"]'); await pg.wait_for_timeout(150); await pg.click('[data-a="who"][data-t="PS"]'); await pg.wait_for_timeout(150); print("who", await ev("__tk.U().who+' '+__tk.U().view"))
        await pg.keyboard.press("4"); await pg.wait_for_timeout(150); await pg.click('.tk-sr[data-t="DK"]'); await pg.wait_for_timeout(150); print("shop row ->", await ev("__tk.U().who+' '+__tk.U().view"))
        await pg.hover('.tk-b.job >> nth=0'); await pg.wait_for_timeout(100); print("tip:", await ev("(()=>{const t=document.querySelector('.tk-tip'); return t.hidden?null:t.textContent})()"))
        print(errs or "no errors"); await b.close()
asyncio.run(main())
