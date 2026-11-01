import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__)); SH = B + "/ptshots"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1200})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/ib_mock.html"); await pg.wait_for_timeout(400)
        ev = lambda js: pg.evaluate(js)
        T = lambda: ev("(document.querySelector('.toast-fm')||{}).textContent||''")
        U = lambda k: ev(f"JSON.stringify(__ib.U().{k})")
        H = lambda: ev("document.querySelector('.tg-facts').innerText.replace(/\\n/g,' ')")
        print("start:", await H(), "| sel:", await U("sel"), "| badge:", await ev("(document.querySelector('.rl-badge')||{}).textContent"))
        await pg.click('.ib-tc[data-t="DK"]'); await pg.click('[data-a="act"][data-i="0"]'); print("send to Dana:", await T(), "| next sel:", await U("sel"), "|", await H())
        await pg.click('.toast-fm button'); print("undo:", await U("sel"), await ev("__ib.S().N.find(n=>n.id==='f1').st"))
        await pg.keyboard.press("j"); print("j:", await U("sel")); await pg.keyboard.press("e"); print("e done:", await T(), "| sel:", await U("sel"))
        await pg.keyboard.press("s"); await pg.keyboard.press("2"); print("s 2 snooze:", await T(), "|", await H())
        await pg.keyboard.press("2"); print("snoozed view:", await ev("[...document.querySelectorAll('.ib-it .tg-t b')].map(x=>x.textContent).join(' | ')"))
        await pg.click('.ib-it >> nth=0'); await pg.click('[data-a="back"]'); print("unsnooze:", await T(), await U("view"))
        await pg.keyboard.press("1"); await ev("__ib.select('f5');__ib.render()"); await pg.fill('#ib-r','Road test after 3 — Bay 6.'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(50); print("reply:", await T(), "| feed top:", await ev("document.querySelector('.tg-fe p').textContent"))
        await pg.keyboard.press("Escape"); await pg.keyboard.press("u"); print("u unread:", await ev("__ib.S().N.find(n=>n.id==='f5').st"))
        await pg.keyboard.press("/"); await pg.keyboard.type("sublet"); await pg.keyboard.press("Enter"); print("search→", await U("sel"), await U("view"))
        await pg.click('[data-a="pop"][data-p="set"]'); await pg.click('[data-a="setv"][data-k="fixes"][data-v="off"]'); print("setting:", await U("set.fixes")); await pg.keyboard.press("Escape")
        await pg.click('[data-role="MR"]'); print("view as Mike:", await H(), "| first:", await U("sel"))
        await pg.keyboard.press("Enter"); print("accept:", await T())
        await pg.click('[data-role="RH"]')
        for i in range(10):
            if not await ev("!!document.querySelector('[data-a=\"done\"]')"): break
            await pg.keyboard.press("e")
        print("manager all done:", await ev("(document.querySelector('.tg-empty h3')||{}).textContent"), "|", await H())
        await pg.keyboard.press("3"); print("done view count:", await ev("document.querySelectorAll('.ib-it').length"))
        for w in ["MR","FD","AM","BO","GP","RH"]:
            await ev(f"__ib.setWho('{w}');__ib.render()")
            ids = await ev("__ib.S().N.filter(n=>n.to===__ib.U().who).map(n=>n.id)")
            for i in ids:
                await ev(f"(()=>{{const n=__ib.S().N.find(x=>x.id==='{i}');__ib.U().view=n.st==='snz'?'snz':n.st==='done'?'done':'in';__ib.select('{i}');__ib.render();}})()")
        print("opened every item for every person")
        print(errs or "no errors"); await b.close()
asyncio.run(main())
