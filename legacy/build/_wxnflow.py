import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + os.path.abspath("wx/n1.html")); await pg.wait_for_timeout(800)
        ev = pg.evaluate
        items = lambda: ev("[...document.querySelectorAll('.tg-it')].map(e=>e.dataset.ro+':'+e.querySelector('.tg-go').textContent.replace(/↵/,''))")
        print("list", await items())
        print("groups", await ev("[...document.querySelectorAll('.tg-grp')].map(e=>e.textContent)"))
        sel = lambda no: ev(f"(()=>{{__wx.U().sel='{no}'; __wx.U().pop=null; __wx.render();}})()")
        # ask Luis
        await sel('37733'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150); await pg.keyboard.press("3"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        print("ask 37733:", await ev("JSON.stringify(__wx.S().R.find(r=>r.no==='37733').ops[0].ask)"), "| item:", [x for x in await items() if x.startswith('37733')])
        # nudge Kevin
        await sel('37688'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        print("nudge 37688:", await ev("JSON.stringify(__wx.S().R.find(r=>r.no==='37688').ops[0].ask)"), await ev("document.querySelector('.toast-fm')?.textContent"))
        # volvo ts answer
        await sel('37544'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150); await pg.keyboard.press("1"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        print("ts 37544:", await ev("JSON.stringify(__wx.S().R.find(r=>r.no==='37544').vol)"), await ev("document.querySelector('.toast-fm')?.textContent"))
        # pre-approval denied
        await sel('37628'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150); await pg.keyboard.press("2"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        print("pre 37628:", await ev("__wx.S().R.find(r=>r.no==='37628').snz"))
        # claim follow-up
        await sel('37388'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150); await pg.keyboard.press("1"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        print("claim 37388:", await ev("__wx.S().R.find(r=>r.no==='37388').snz+' / '+__wx.S().R.find(r=>r.no==='37388').snzWhy"))
        # failed part: ship
        await sel('37620'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150); await pg.keyboard.press("1"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        print("part 37620:", await ev("JSON.stringify(__wx.S().R.find(r=>r.no==='37620').ops[0].parts[0][5])"))
        # keep longer
        await sel('37590'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150); await pg.keyboard.press("2"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        print("part 37590:", await ev("JSON.stringify(__wx.S().R.find(r=>r.no==='37590').ops[1].parts[0][5])"))
        # settings: shorten the filing window -> 37502 becomes due sooner
        await pg.click("[data-a=cfg]"); await pg.wait_for_timeout(150)
        await pg.fill("[data-cfg=file]", "5"); await pg.wait_for_timeout(150)
        print("after file=5:", [x for x in await ev("[...document.querySelectorAll('.tg-it')].map(e=>e.dataset.ro+':'+(e.querySelector('.wx-due')||{}).textContent)")][:8])
        await pg.keyboard.press("Escape")
        # due filter
        await pg.click("[data-a=filt][data-k=due]"); print("due filter:", await items())
        print("undo stack ok:", await ev("1"), "errors", errs)
        await b.close()
asyncio.run(main())
