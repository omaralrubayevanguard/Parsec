import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__)); SH = B + "/ptshots"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1200})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/fxi_mock.html"); await pg.wait_for_timeout(500)
        ev = lambda js: pg.evaluate(js)
        T = lambda: ev("(document.querySelector('.toast-fm')||{}).textContent||''")
        # 1 check first tick
        await pg.click('[data-demo="d1"]'); await pg.click('.fx-step >> nth=0'); print("1 tick done:", await ev("document.querySelectorAll('.fx-step.done').length"))
        # 2 console answers
        await pg.click('[data-demo="d2"]'); await pg.click('[data-a="ctab"][data-v="stop"]'); await pg.click('[data-a="cans"] >> nth=0'); await pg.wait_for_timeout(50); print("2 cans:", await T())
        # 3 comeback
        await pg.click('[data-demo="d3"]'); await pg.click('[data-a="tofix"]'); await pg.wait_for_timeout(50); print("3 hl row:", await ev("[...document.querySelectorAll('.fx-er.hl')].map(x=>x.dataset.ro).join(',')"))
        await pg.click('[data-a="cbsend"]'); await pg.wait_for_timeout(50); print("3 send:", await T())
        await pg.click('[data-demo="try"]'); await pg.click('[data-a="gocb"]'); print("3 gocb sel:", await ev("__fx.U().sel"))
        # 4 standard
        await pg.click('[data-demo="d4"]'); await pg.click('[data-a="sgo"]'); await pg.wait_for_timeout(50); print("4 std:", await T(), "| star in list:", await ev("!!document.querySelector('.tg-it.on svg') && document.querySelector('.tg-it.on').innerHTML.includes('star')"), "| badge:", await ev("[...document.querySelectorAll('.fx-std, .fx-stdb')].map(x=>x.textContent.trim()).join(' | ')"))
        await pg.click('[data-a="pop"][data-p="cons"]'); print("4 console shows std:", await ev("!!document.querySelector('.fx-con .chips .std')"), "| note:", await ev("(document.querySelector('.fx-con p.nt')||{}).textContent"))
        # 5/6 photo pop
        await pg.click('[data-demo="d6"]'); await pg.click('.fx-pht >> nth=1'); print("6 photo pop:", await ev("document.querySelector('.tg-pop').textContent.slice(0,60)"))
        # 7 code match use fix
        await pg.click('[data-demo="d7"]'); await pg.click('.fx-or.code [data-p="use"]'); await pg.wait_for_timeout(50); print("7 use pop head:", await ev("document.querySelector('.tg-pop').textContent.slice(0,80)"))
        print("7 options:", await ev("[...document.querySelectorAll('.tg-pop .tg-mi')].map(x=>x.textContent.slice(0,40)).join(' | ')")); await pg.keyboard.press("1"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(50); print("7 used:", await T())
        # 8 kit
        await pg.click('[data-demo="d8"]'); await pg.click('[data-a="kpk"] >> nth=0'); print("8 total after untick:", await ev("document.querySelector('.tg-pop .hint').textContent"))
        await pg.click('[data-a="kgo"]'); await pg.wait_for_timeout(50); print("8 kit:", await T(), "| chip:", await ev("(document.querySelector('.fx-kitc')||{}).textContent"))
        # 9 quote
        await pg.click('[data-demo="d9"]'); await pg.click('[data-a="qset"]'); await pg.wait_for_timeout(50); print("9 qset:", await T(), "| qc gone:", not await ev("!!document.querySelector('.fx-qc')"), "| header:", await ev("document.querySelector('.tg-facts').textContent.slice(0,40)"))
        await pg.click('.toast-fm button'); print("9 undo qc back:", await ev("!!document.querySelector('.fx-qc')"))
        # 10 filter
        await pg.click('[data-demo="d10"]'); await pg.click('[data-a="popx"]'); print("10 chips:", await ev("[...document.querySelectorAll('.fx-fc')].map(x=>x.textContent).join(',')"), "| count:", await ev("document.querySelector('.tg-h1, .fx-lh').textContent.slice(0,30)"))
        await pg.click('.fx-fc.clr'); print("10 cleared:", await ev("document.querySelectorAll('.fx-fc').length"), "| list items:", await ev("document.querySelectorAll('.tg-it').length"))
        # 11 warranty copy
        await pg.click('[data-demo="d11"]'); await pg.click('.fx-war [data-a="toast"]'); await pg.wait_for_timeout(50); print("11 copy:", await T())
        # 12 trends row click
        await pg.click('[data-demo="d12"]'); await pg.click('.fx-trr >> nth=0'); print("12 opened:", await ev("__fx.U().view+' '+__fx.U().sel"))
        # tech role: no std button, no trends
        await pg.click('[data-role="tech"]'); await pg.wait_for_timeout(50); print("tech: std btn", await ev("!!document.querySelector('[data-p=\"std\"]')"), "| tabs:", await ev("[...document.querySelectorAll('.tg-views button')].map(x=>x.textContent).join(',')"))
        # keyboard nav still fine
        await pg.click('[data-demo="try"]'); await pg.keyboard.press("j"); await pg.keyboard.press("j"); print("j j sel:", await ev("__fx.U().sel"))
        print(errs or "no errors"); await b.close()
asyncio.run(main())
