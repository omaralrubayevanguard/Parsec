import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1480, "height": 1000}); await ctx.grant_permissions(["clipboard-read","clipboard-write"]); pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + os.path.abspath("wx/p1.html")); await pg.wait_for_timeout(800)
        ev = pg.evaluate
        sel = lambda no: ev(f"(()=>{{__wx.U().sel='{no}'; __wx.U().pop=null; __wx.render();}})()")
        pk = lambda: ev("(document.querySelector('.tg-pop .wx-pk-h span')||{}).textContent")
        # 37701: tag it from the file popover, come back, file
        await sel('37701'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150); await sel('37701'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150); print("file pop packet", await pk())
        await pg.click(".tg-pop [data-fix=tag]"); await pg.wait_for_timeout(150); print("pop", await ev("__wx.U().pop.type"))
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150); print("back to", await ev("__wx.U().pop.type"), "packet", await pk(), "submit enabled", await ev("!document.querySelector('[data-a=filego]').disabled"))
        await pg.fill("#wx-cn", "W2628201"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        print("37701:", await ev("JSON.stringify(__wx.S().R.find(r=>r.no==='37701').ops[0].claim)"), await ev("document.querySelector('.toast-fm')?.textContent"))
        # 37612 comeback: add earlier claim #, upload photo
        await sel('37612'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150); print("37612 packet", await pk())
        await pg.click(".tg-pop [data-fix='field:prev']"); await pg.wait_for_timeout(150); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        await pg.click(".tg-pop [data-fix='upload:photos']"); await pg.wait_for_timeout(150); print("37612 packet now", await pk(), "submit enabled", await ev("!document.querySelector('[data-a=filego]').disabled"))
        # copy popover via C from file popover, walk and copy
        await pg.keyboard.press("c"); await pg.wait_for_timeout(150); print("pop", await ev("__wx.U().pop.type"))
        await pg.keyboard.press("ArrowDown"); await pg.keyboard.press("ArrowDown"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        print("copied idx", await ev("__wx.U().copied"), "clipboard", await ev("navigator.clipboard.readText().catch(e=>'ERR '+e)"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(100); print("after esc pop", await ev("(__wx.U().pop||{}).type"))
        # print with P
        await pg.keyboard.press("Escape"); await sel('37502'); await pg.keyboard.press("p"); await pg.wait_for_timeout(150); print("print open", await ev("!!document.querySelector('.wx-sheet')"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(100); print("print closed", await ev("!document.querySelector('.wx-sheet')"))
        # 37455: add warranty start from the card
        await sel('37455'); await pg.click(".wx-op [data-fix='field:ws']"); await pg.wait_for_timeout(150); await pg.fill("#wx-fv", "06-02-2017"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(150)
        print("37455 ws", await ev("__wx.S().R.find(r=>r.no==='37455').ws"), "card packet", await ev("document.querySelector('.wx-op .wx-pk-h span').textContent"))
        print("errors", errs)
        await b.close()
asyncio.run(main())
