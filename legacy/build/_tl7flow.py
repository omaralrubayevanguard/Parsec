import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/tl7_mock.html"); await pg.wait_for_timeout(500)
        ev = lambda js: pg.evaluate(js)
        print("tech tabs:", await ev("[...document.querySelectorAll('.tg-views button')].map(b=>b.textContent).join(',')"), "chip btn:", await ev("!!document.querySelector('button.tk-who')"))
        await pg.keyboard.press("4"); await pg.wait_for_timeout(100); print("key 4 as tech ->", await ev("__tk.U().view"))
        await pg.click('[data-role="foreman"]'); await pg.wait_for_timeout(150)
        print("foreman tabs:", await ev("[...document.querySelectorAll('.tg-views button')].map(b=>b.textContent).join(',')"), "chip btn:", await ev("!!document.querySelector('button.tk-who')"))
        await pg.click('[data-demo="r3"]'); await pg.wait_for_timeout(200)
        await pg.click('.tk-r.prob [data-p="fix"] >> nth=1'); await pg.wait_for_timeout(200); print("trim pop:", await ev("JSON.stringify((({type,f,o})=>({type,f,o}))(__tk.U().pop))"))
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200); print("after trim:", await ev("(document.querySelector('.toast-fm')||{}).textContent"), await ev("__tk.calc('MR','2026-10-21').fixes.length"))
        await pg.click('[data-demo="r6"]'); await pg.wait_for_timeout(200); await pg.click('[data-a="tsprint"]'); await pg.wait_for_timeout(150); print("print:", await ev("(document.querySelector('.toast-fm')||{}).textContent"))
        await pg.click('[data-a="gofix"] >> nth=0'); await pg.wait_for_timeout(250); print("gofix:", await ev("__tk.U().view+' '+__tk.U().day+' '+((__tk.U().pop||{}).type||'')"))
        await pg.keyboard.press("1"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200); print("fixed:", await ev("(document.querySelector('.toast-fm')||{}).textContent"))
        await pg.click('[data-demo="r1"]'); await pg.wait_for_timeout(150); await pg.click('.tk-note [data-a="notex"]'); await pg.wait_for_timeout(150); print("note closed:", await ev("document.querySelector('.tk-note').hidden"))
        print(errs or "no errors"); await b.close()
asyncio.run(main())
