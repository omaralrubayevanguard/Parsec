import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__)); SH = B + "/ptshots"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/pt_mock.html"); await pg.wait_for_timeout(500)
        ev = lambda js: pg.evaluate(js)
        T = lambda: ev("(document.querySelector('.toast-fm')||{}).textContent||''")
        ST = lambda no: ev(f"__pt.stateOf(__pt.get('{no}'))")
        shot = lambda n: pg.locator(".wt-wrap").screenshot(path=f"{SH}/f_{n}.png")
        # accept, then order with rush
        await pg.click('[data-demo="desk"]'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(100)
        print("accept:", await T(), "| state:", await ST("37750"))
        await pg.click('.tg-it[data-ro="37750"] .tg-go'); await pg.wait_for_timeout(100); await pg.keyboard.press("2"); await pg.wait_for_timeout(50)
        print("order btn:", await ev("document.querySelector('[data-a=\"ogo\"]').textContent"))
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(100)
        print("ordered:", await T(), "| state:", await ST("37750"), "| log0:", await ev("__pt.get('37750').log.slice(0,3).map(x=>x[1]).join(' / ')"))
        await shot("ordered")
        await pg.click('.toast-fm button'); await pg.wait_for_timeout(100); print("undo ->", await ST("37750"))
        # pull it
        await pg.click('.tg-it[data-ro="37466"] .tg-go'); await pg.wait_for_timeout(100); print("pull:", await T(), "| state:", await ST("37466"), "| oh:", await ev("__pt.S().C.find(c=>c.pn==='22479124').oh"))
        # chase 37628 new date
        await pg.click('.tg-it[data-ro="37628"] .tg-go'); await pg.wait_for_timeout(100); await pg.keyboard.press("1"); await pg.click('[data-a="dset"] >> nth=0'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(100)
        print("chase:", await T(), "| state:", await ST("37628"))
        await pg.click('.toast-fm button'); await pg.wait_for_timeout(100)
        # check in via scan
        await pg.keyboard.press("c"); await pg.wait_for_timeout(100); await pg.keyboard.type("22972342"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(100)
        print("scan ticked:", await ev("Object.keys(__pt.U().pop.sel).filter(k=>__pt.U().pop.sel[k]).length"), "| hit row:", await ev("!!document.querySelector('.pt-ln.hit')"))
        await pg.keyboard.type("99999999"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(100); print("bad scan:", await T())
        await pg.click('.pt-ln:has-text("Brake shoe kit")'); await pg.wait_for_timeout(50)
        await shot("chk2")
        await pg.click('[data-a="kgo"]'); await pg.wait_for_timeout(100)
        print("checkin:", await T(), "| 37628:", await ST("37628"), "| 37720:", await ST("37720"), "| sel:", await ev("__pt.U().sel"))
        # send to Frank
        await pg.click('.tg-it[data-ro="37742"] .tg-go'); await pg.wait_for_timeout(100); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(100)
        print("hand:", await T(), "| state:", await ST("37742"))
        # ship return
        await pg.click('.tg-it[data-ro="37771"] .tg-go'); await pg.wait_for_timeout(100); await pg.click('[data-a="cset"] >> nth=0'); await pg.fill('#pt-tr', '1Z999AA10123456784'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(100)
        print("ship:", await T(), "| state:", await ST("37771"))
        await shot("after_flow")
        # return to writer
        await pg.click('[data-demo="desk"]'); await pg.click('.tg-it[data-ro="37750"]'); await pg.click('.tg-next [data-a="pop"][data-p="ret"]'); await pg.click('[data-a="rset"] >> nth=0'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(100)
        print("return:", await T(), "| state:", await ST("37750"))
        # status menu
        await pg.click('.tg-it[data-ro="37388"]'); await pg.click('.pt-pr .pt-st[data-a="pop"] >> nth=0'); await pg.wait_for_timeout(50); await shot("stmenu"); await pg.click('[data-a="setst"][data-v="Ordered"]'); await pg.wait_for_timeout(50)
        print("setst:", await T())
        # search
        await pg.keyboard.press("/"); await pg.keyboard.type("radiator"); await pg.wait_for_timeout(100); print("search:", await ev("[...document.querySelectorAll('.pt-srr b')].map(x=>x.textContent).join(' | ')"))
        await shot("search")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(100); print("search open ->", await ev("__pt.U().sel"), await ev("__pt.U().view"))
        # keys
        await pg.keyboard.press("j"); await pg.keyboard.press("j"); print("j j ->", await ev("__pt.U().sel"))
        for k in "2341": await pg.keyboard.press(k)
        print("views ok:", await ev("__pt.U().view"))
        # catalog
        await pg.keyboard.press("4"); await pg.click('#pt-cq'); await pg.keyboard.type("brake"); await pg.wait_for_timeout(100); print("cat brake rows:", await ev("document.querySelectorAll('.pt-cr:not(.h)').length"))
        await pg.fill('#pt-cq', ''); await pg.dispatch_event('#pt-cq','input'); await pg.click('[data-a="cflt"][data-v="low"]'); print("low rows:", await ev("document.querySelectorAll('.pt-cr:not(.h)').length"))
        await pg.click('[data-a="reorder"] >> nth=0'); print("reorder:", await T())
        await pg.click('[data-a="cflt"][data-v="all"]'); await pg.click('[data-a="kit"] >> nth=0'); print("kit collapsed rows:", await ev("document.querySelectorAll('.pt-cr.kid').length"))
        # returns-only RO pane and empty demo
        await pg.click('[data-demo="desk"]'); await pg.click('.tg-it[data-ro="37480"]'); await shot("core_pane")
        await pg.click('[data-demo="oo"]'); await shot("oo2")
        print(errs or "no errors"); await b.close()
asyncio.run(main())
