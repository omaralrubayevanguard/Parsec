import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__)); SH = B + "/ptshots"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/pt2_mock.html"); await pg.wait_for_timeout(500)
        ev = lambda js: pg.evaluate(js)
        T = lambda: ev("(document.querySelector('.toast-fm')||{}).textContent||''")
        ST = lambda no: ev(f"__pt.stateOf(__pt.get('{no}'))")
        PS = lambda no: ev(f"__pt.get('{no}').ops.flatMap(o=>o.parts).map(p=>p.desc+':'+p.st+(p.bin?'@'+p.bin:'')).join(', ')")
        shot = lambda n: pg.locator(".wt-wrap").screenshot(path=f"{SH}/v2f_{n}.png")
        # stage it → ask card → send
        await pg.click('[data-demo="desk"]'); await pg.click('.tg-it[data-ro="37455"] .tg-go'); await pg.wait_for_timeout(100)
        print("stage:", await T(), "|", await PS("37455"), "| ask card:", await ev("(document.querySelector('.pt-ask')||{}).textContent||'none'"))
        await pg.click('.pt-ask [data-a="asksend"]'); await pg.wait_for_timeout(100); print("asksend:", await T(), "| state:", await ST("37455"))
        # pick up one part from the row, and a whole bin on the shelf
        await pg.click('[data-demo="desk"]'); await pg.click('.tg-it[data-ro="37742"]'); await pg.click('.pt-pr [data-a="pk1"] >> nth=0'); await pg.wait_for_timeout(50)
        print("pk1:", await T(), "|", await PS("37742"))
        await pg.keyboard.press("3"); await pg.click('.pt-bin [data-a="pickup"] >> nth=0'); await pg.wait_for_timeout(50); print("bin pickup:", await T())
        await shot("shelf_after")
        # status menu → Picked up
        await pg.click('[data-demo="desk"]'); await ev("(()=>{__pt.U().sel='37720';__pt.render();})()"); await pg.click('.pt-pr .pt-st[data-a="pop"] >> nth=1'); await pg.click('[data-a="setst"][data-v="Picked up"]'); await pg.wait_for_timeout(50); print("setst:", await T(), "|", await PS("37720"))
        # check in without staging
        await pg.click('[data-demo="chk"]'); await pg.click('.tg-pop [data-a="stg"]'); await pg.wait_for_timeout(50)
        print("chk unstaged label:", await ev("[...document.querySelectorAll('.pt-ln .r b')].map(x=>x.textContent).join(' | ')"))
        await pg.click('[data-a="kgo"]'); await pg.wait_for_timeout(100); print("kgo:", await T(), "|", await PS("37628"), "| state:", await ST("37628"), "| ask:", await ev("__pt.U().ask.join(',')"))
        # asks first: send both
        await pg.click('[data-demo="ask"]'); await pg.wait_for_timeout(100); await pg.click('.pt-ask [data-a="askall"]'); await pg.wait_for_timeout(100)
        print("askall:", await T(), "|", await ST("37628"), await ST("37720"), "| bins still staged:", await ev("[...document.querySelectorAll('.pt-bin:not(.empty) .k')].length"))
        await pg.click('[data-demo="ask"]'); await pg.click('.pt-ask [data-a="askno"]'); await pg.wait_for_timeout(50); print("askno:", await T())
        # returns
        await pg.click('[data-demo="ret"]'); await pg.click('.pt-rr[data-tid="FP-1001"] [data-a="rdo"]'); await pg.click('[data-a="cset"] >> nth=0'); await pg.fill('#pt-tr','1Z999AA10123456784'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(50)
        print("ship FP-1001:", await T())
        await pg.click('.pt-rr[data-tid="R-3001"] [data-a="rdo"]'); await pg.wait_for_timeout(50); await pg.keyboard.type("PDC-41220"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(50); print("RA:", await T(), await ev("__pt.S().T.find(t=>t.id==='R-3001').st"))
        await pg.click('.pt-rr[data-tid="C-2002"] [data-a="rdo"]'); await pg.wait_for_timeout(50); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(50); print("credit:", await T())
        await pg.click('.pt-rr[data-tid="FP-1003"] [data-a="rdo"]'); await pg.keyboard.press("1"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(50); print("hold:", await T())
        await shot("returns_after")
        # start a return: damaged water pump
        await pg.click('[data-demo="newret"]'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(100)
        print("newret:", await T(), "| 37455:", await ST("37455"), await PS("37455"))
        # desk: returns-only RO pane
        await pg.click('[data-demo="desk"]'); await pg.click('.tg-it[data-ro="37555"]'); await shot("ret_pane"); print("ret pane next:", await ev("document.querySelector('.tg-next p').textContent"))
        await pg.click('.tg-next [data-a="do"]'); await pg.wait_for_timeout(50); print("pane RA pop:", await ev("(document.querySelector('.tg-pop .tg-ph b')||{}).textContent"))
        await pg.keyboard.press("Escape")
        # setup
        await pg.click('[data-demo="setup"]'); await pg.click('[data-set="sup_pdc"]'); await pg.keyboard.type("Order by 14:00 · next day 07:30"); print("setup chip:", await ev("document.querySelector('[data-set=\"sup_pdc\"]').parentNode.querySelector('.pt-ph').textContent"))
        await pg.click('[data-a="rulem"][data-k="parts"][data-v="auto"]'); print("rule:", await T())
        # search a return
        await pg.keyboard.press("Escape"); await pg.click('[data-demo="desk"]'); await pg.keyboard.press("/"); await pg.keyboard.type("FP-1002"); await pg.wait_for_timeout(50); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(100)
        print("search ret ->", await ev("__pt.U().view"), await ev("__pt.U().rsel"))
        for k in "12345": await pg.keyboard.press(k)
        print("view 5:", await ev("__pt.U().view"))
        print(errs or "no errors"); await b.close()
asyncio.run(main())
