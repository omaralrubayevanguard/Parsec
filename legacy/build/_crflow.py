import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1200})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/cr_mock.html"); await pg.wait_for_timeout(400)
        ev = lambda js: pg.evaluate(js)
        T = lambda: ev("(document.querySelector('.toast-fm')||{}).textContent||''")
        U = lambda k: ev(f"JSON.stringify(__cr.U().{k})")
        for k in "dwmqya":
            await pg.keyboard.press(k); print(k, await U("p"), "|", await ev("document.querySelector('.tg-facts').innerText.replace(/\\n/g,' ')"))
        await pg.keyboard.press("m")
        await pg.click('.cr-or >> nth=0'); print("over→work:", await U("view"), await U("sel"))
        await pg.keyboard.press("j"); await pg.keyboard.press("j"); print("j j:", await U("sel"))
        await pg.click('[data-a="pop"][data-p="chk"]'); await pg.click('[data-a="fix"] >> nth=0'); print("fix:", await T(), "|", await ev("document.querySelector('.tg-facts').innerText.replace(/\\n/g,' ')"))
        await pg.click('[data-role="KT"]'); print("Kevin keeps view/period:", await U("view"), await U("p"), await U("who"))
        await pg.keyboard.press("1"); await pg.hover('.mg-svg rect.hit >> nth=3'); await pg.wait_for_timeout(50); print("tip:", await ev("document.querySelector('.tk-tip').innerText.replace(/\\n/g,' / ')"))
        for w in ["MR","DK","AW","KT"]:
            for p_ in ["day","wk","lwk","mo","lmo","qt","lqt","yr","all"]:
                await ev(f"(()=>{{__cr.setWho('{w}');__cr.U().p='{p_}';__cr.U().view='ov';__cr.render();__cr.U().view='work';__cr.render();}})()")
        print("cycled techs × periods × views")
        print(errs or "no errors"); await b.close()
asyncio.run(main())
