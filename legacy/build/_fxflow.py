import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__)); SH = B + "/ptshots"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/fx_mock.html"); await pg.wait_for_timeout(500)
        ev = lambda js: pg.evaluate(js)
        T = lambda: ev("(document.querySelector('.toast-fm')||{}).textContent||''")
        O = lambda no: ev(f"JSON.stringify((o=>({{q:o.q,parts:o.parts,from:o.from}}))(__fx.S().O.find(x=>x.no==='{no}')))")
        shot = lambda n: pg.locator(".wt-wrap").screenshot(path=f"{SH}/fxf_{n}.png")
        await pg.click('[data-demo="lib"]'); await pg.keyboard.press("u"); await pg.wait_for_timeout(80); await pg.keyboard.press("2"); await pg.wait_for_timeout(50)
        print("use hint:", await ev("document.querySelector('.tg-pop .hint').textContent"))
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(80); print("use:", await T(), "|", await O("37760"), "| next:", await ev("document.querySelector('.tg-next p').textContent"))
        await pg.click('.toast-fm button'); await pg.wait_for_timeout(50); print("undo:", await O("37760"))
        # type a quote
        await pg.click('[data-demo="open"]'); await pg.click('.fx-or [data-p="use"] >> nth=1'); await pg.wait_for_timeout(50); await pg.keyboard.press("3"); await pg.wait_for_timeout(50); await pg.keyboard.type("1.4"); await pg.wait_for_timeout(50)
        print("typed btn enabled:", await ev("!document.querySelector('[data-a=\"ugo\"]').disabled"), await ev("document.querySelector('.tg-pop .hint').textContent"))
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(80); print("open use:", await T(), "|", await O("37388"))
        await shot("open_after")
        # review: write up with notes, merge, ok
        await pg.click('[data-demo="rev"]'); await pg.click('[data-a="usenote"]'); await pg.wait_for_timeout(50); print("note cause:", await ev("document.querySelector('#fx-c').value"))
        await pg.click('[data-a="wgo"]'); await pg.wait_for_timeout(80); print("write:", await T())
        await pg.click('[data-p="write"][data-id="r1"]'); await pg.click('[data-a="usenote"]'); await pg.wait_for_timeout(50); print("note fix:", await ev("document.querySelector('#fx-x').value")); await pg.keyboard.press("Escape")
        await pg.click('[data-p="merge"]'); await pg.wait_for_timeout(50); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(80); print("merge:", await T())
        await pg.click('[data-a="rvok"] >> nth=0'); await pg.wait_for_timeout(50); print("ok:", await T(), "| left:", await ev("document.querySelectorAll('.fx-tbl')[0].querySelectorAll('.fx-rv').length"))
        await shot("rev_after")
        # add by hand via the match chip
        await pg.click('[data-demo="add"]'); await pg.click('[data-a="apick"]'); await pg.fill('#fx-ac','Actuator linkage seized'); await pg.dispatch_event('#fx-ac','input'); await pg.fill('#fx-ax','Freed and lubed the linkage, actuator test passed'); await pg.dispatch_event('#fx-ax','input')
        await pg.click('[data-a="ago"]'); await pg.wait_for_timeout(80); print("add:", await T(), "| top row:", await ev("document.querySelector('.fx-er:not(.h) .fx-man')?'by hand':'-'"))
        # search
        await pg.click('[data-demo="srch"]'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(80); print("search ->", await ev("__fx.U().sel"))
        await pg.keyboard.press("/"); await pg.keyboard.type("21789944"); await pg.wait_for_timeout(50); print("search pn:", await ev("[...document.querySelectorAll('.fx-srr small')].map(x=>x.textContent).join(' | ')"))
        await pg.keyboard.press("Escape")
        # sort & filter & keys
        await pg.click('[data-a="sort"][data-v="recent"]'); print("recent first:", await ev("document.querySelector('.tg-it .cmp').textContent"))
        await pg.click('[data-a="sort"][data-v="count"]'); await pg.click('[data-a="flt"]'); print("open filter items:", await ev("document.querySelectorAll('.tg-it').length"))
        await pg.keyboard.press("j"); await pg.keyboard.press("j"); print("j j:", await ev("__fx.U().sel"))
        for k in "231": await pg.keyboard.press(k)
        print("view:", await ev("__fx.U().view"))
        await pg.keyboard.press("a"); print("a opens add:", await ev("__fx.U().pop&&__fx.U().pop.type"))
        print(errs or "no errors"); await b.close()
asyncio.run(main())
