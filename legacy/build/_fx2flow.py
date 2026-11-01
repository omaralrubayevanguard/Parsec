import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__)); SH = B + "/ptshots"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/fx2_mock.html"); await pg.wait_for_timeout(500)
        ev = lambda js: pg.evaluate(js)
        T = lambda: ev("(document.querySelector('.toast-fm')||{}).textContent||''")
        await pg.click('[data-demo="use"]'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(80); print("triage use:", await T())
        await pg.click('[data-demo="lib"]'); await pg.keyboard.press("u"); await pg.wait_for_timeout(50); print("fm parts line:", await ev("[...document.querySelectorAll('.tg-pop .fx-ck')].map(x=>x.textContent).join(' | ')"))
        await pg.keyboard.press("1"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(80); print("fm use:", await T())
        await pg.click('[data-a="view"][data-v="open"]'); print("open row by:", await ev("[...document.querySelectorAll('.fx-or .q small')].slice(0,2).map(x=>x.textContent).join(' | ')"))
        await pg.click('[data-demo="tech"]'); print("tech tabs:", await ev("[...document.querySelectorAll('.tg-views button')].map(x=>x.textContent).join(',')"), "| keys:", await ev("document.querySelector('.tg-keys').textContent"))
        await pg.click('[data-a="askuse"]'); print("askuse:", await T())
        await pg.click('[data-a="suggest"]'); await pg.wait_for_timeout(50); print("suggest:", await T())
        await pg.keyboard.press("a"); await pg.fill('#fx-acmp','Outlet NOx sensor — check engine light'); await pg.dispatch_event('#fx-acmp','input'); await pg.fill('#fx-ac','Sensor wiring chafed on the bracket'); await pg.dispatch_event('#fx-ac','input'); await pg.click('[data-a="ago"]'); await pg.wait_for_timeout(50); print("tech add:", await T())
        await pg.click('[data-role="lt"]'); await pg.wait_for_timeout(50); await pg.keyboard.press("3"); await pg.wait_for_timeout(50)
        print("lead tech sees review rows:", await ev("document.querySelectorAll('.fx-tbl')[0].querySelectorAll('.fx-rv').length"), "| you chip:", await ev("document.querySelector('.fx-revs .me').textContent"))
        await pg.click('[data-a="rvok"] >> nth=0'); await pg.wait_for_timeout(50); print("rvok:", await T(), "| by line:", await ev("[...document.querySelectorAll('.fx-rv small')].map(x=>x.textContent).filter(t=>t.startsWith('by ')).join(' | ')"))
        await pg.click('[data-role="mg"]'); await pg.click('[data-p="write"] >> nth=0'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(50); print("mgr write:", await T(), "| by:", await ev("[...document.querySelectorAll('.fx-rv small')].map(x=>x.textContent).filter(t=>t.startsWith('by ')).join(' | ')"))
        await pg.click('[data-demo="lib"]'); await pg.click('[data-a="grp"][data-v="flat"]'); print("flat groups:", await ev("document.querySelectorAll('.tg-grp').length"), "| items:", await ev("document.querySelectorAll('.tg-it').length"))
        await pg.click('[data-a="sort"][data-v="az"]'); print("az first:", await ev("document.querySelector('.tg-it .cmp').textContent"))
        await pg.click('[data-a="grp"][data-v="sys"]'); print("sys groups + az:", await ev("document.querySelectorAll('.tg-grp').length"), await ev("document.querySelector('.tg-it .cmp').textContent"))
        print(errs or "no errors"); await b.close()
asyncio.run(main())
