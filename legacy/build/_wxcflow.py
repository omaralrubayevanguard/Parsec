import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + os.path.abspath("wx/c1.html")); await pg.wait_for_timeout(800)
        ev = pg.evaluate
        sel = lambda no: ev(f"(()=>{{__wx.U().sel='{no}'; __wx.U().pop=null; __wx.render();}})()")
        pk = lambda: ev("(document.querySelector('.tg-pop .wx-pk-h span')||{}).textContent")
        gaps = lambda no: ev(f"[...document.querySelectorAll('.wx-op .wx-pk-r:not(.opt) .t')].map(e=>e.firstChild.textContent)")
        # 37612: over SRT 0.4 → claim the SRT from the file popover
        await sel('37612'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150); print("37612 packet", await pk(), await ev("[...document.querySelectorAll('.tg-pop .wx-pk-r .t')].map(e=>e.firstChild.textContent)"))
        await pg.click(".tg-pop [data-fix=srt]"); await pg.wait_for_timeout(150); await pg.keyboard.press("1"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        print("after claim SRT:", await ev("__wx.U().pop&&__wx.U().pop.type"), await pk(), "claim hrs", await ev("__wx.S().R.find(r=>r.no==='37612').ops[0].claim.hrs"))
        await pg.keyboard.press("Escape")
        # 37455: give a reason
        await sel('37455'); await pg.click(".wx-op [data-fix=srt]"); await pg.wait_for_timeout(150); await pg.keyboard.press("2"); await pg.click(".tg-pop [data-a=swhy]"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        print("37455 srtWhy:", await ev("__wx.S().R.find(r=>r.no==='37455').ops[0].srtWhy"), "| gaps", await gaps('37455'))
        # 37701: coverage outside → goodwill
        await ev("__wx.S().R.find(r=>r.no==='37701').sent=null"); await sel('37701'); await pg.click(".wx-op .wx-c2 [data-fix=cov]"); await pg.wait_for_timeout(150)
        print("cov options", await ev("[...document.querySelectorAll('.tg-pop .wx-cv')].map(e=>e.innerText.replace(/\\n/g,' '))"))
        await pg.click(".tg-pop [data-a=gw][data-to=manager]"); await pg.wait_for_timeout(150); print("37701 snz", await ev("__wx.S().R.find(r=>r.no==='37701').snz"), await ev("document.querySelector('.toast-fm')?.textContent"))
        # terms: raise base to 72 months → 37733 still inside, 37701 inside
        await pg.click("[data-a=undo]"); await pg.wait_for_timeout(150)
        await pg.click("[data-a=cfg]"); await pg.wait_for_timeout(150); await pg.click(".tg-pop [data-a=terms]"); await pg.wait_for_timeout(150)
        await pg.fill("[data-tm='0'][data-f='2']", "72"); await pg.click(".tg-pop [data-a=back]"); await pg.wait_for_timeout(150)
        await sel('37701'); print("37701 coverage row:", await ev("document.querySelector('.wx-op .wx-c2').innerText.replace(/\\n/g,' ')"))
        # returns popover from header
        await pg.click("[data-a=rets]"); await pg.wait_for_timeout(150); print("rets rows", await ev("[...document.querySelectorAll('.wx-rt .t')].map(e=>e.textContent+' '+e.parentNode.querySelector('b').textContent)"))
        print("errors", errs)
        await b.close()
asyncio.run(main())
