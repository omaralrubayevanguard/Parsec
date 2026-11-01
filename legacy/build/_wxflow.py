import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + os.path.abspath("wx/w1.html")); await pg.wait_for_timeout(800)
        ev = pg.evaluate
        st = lambda no: ev(f"__wx.S().R.find(r=>r.no==='{no}').ops.map(o=>o.st+':'+(o.claim.no||'')+':'+(o.claim.paid||'')).join('|')+' sent='+!!__wx.S().R.find(r=>r.no==='{no}').sent+' snz='+(__wx.S().R.find(r=>r.no==='{no}').snz||'')")
        await pg.mouse.click(700, 600)  # focus page
        print("sel", await ev("__wx.U().sel"))
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200); print("accept 37701:", await st('37701'))
        await pg.keyboard.press("j"); await pg.keyboard.press("j"); await pg.wait_for_timeout(100); print("sel after jj", await ev("__wx.U().sel"))
        # file 37612 via Enter, type claim no
        await ev("(()=>{__wx.U().sel='37612'; __wx.render();})()")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200); print("pop", await ev("(__wx.U().pop||{}).type"))
        await pg.keyboard.type("W2628199"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200); print("filed 37612:", await st('37612'))
        await pg.click("[data-a=undo]"); await pg.wait_for_timeout(200); print("undo 37612:", await st('37612'))
        # paid
        await ev("(()=>{__wx.U().sel='37466'; __wx.render();})()"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200); print("paid 37466:", await st('37466'))
        # follow up
        await ev("(()=>{__wx.U().sel='37388'; __wx.render();})()"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200); await pg.keyboard.press("1"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200); print("follow 37388:", await st('37388'))
        # snooze
        await ev("(()=>{__wx.U().sel='37502'; __wx.render();})()"); await pg.keyboard.press("s"); await pg.wait_for_timeout(150); await pg.keyboard.press("2"); await pg.wait_for_timeout(150); print("snooze 37502:", await st('37502'))
        # transfer
        await ev("(()=>{__wx.U().sel='37455'; __wx.render();})()"); await pg.keyboard.press("t"); await pg.keyboard.press("1"); await pg.keyboard.press("3"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200); print("xfer 37455:", await st('37455'))
        # filters and search
        await pg.click("[data-a=filt][data-k=late]"); print("late filter list", await ev("[...document.querySelectorAll('.tg-it')].map(e=>e.dataset.ro)"))
        await pg.keyboard.press("Escape"); await pg.keyboard.press("/"); await pg.keyboard.type("W2619980"); await pg.wait_for_timeout(150); print("search", await ev("[...document.querySelectorAll('.tg-sr')].map(e=>e.dataset.ro)"))
        await pg.keyboard.press("Escape"); await pg.keyboard.press("2"); await pg.wait_for_timeout(150); print("view", await ev("__wx.U().view"), "cards", await ev("document.querySelectorAll('.wx-cd').length"))
        # status buttons on claim card: approve a submitted op
        await pg.keyboard.press("1"); await ev("(()=>{__wx.U().sel='37519'; __wx.render();})()"); await pg.click(".wx-op [data-a=st][data-to=approved]"); await pg.wait_for_timeout(150); print("approve 37519:", await st('37519'))
        print("cleared", await ev("__wx.S().CL.length"), "errors", errs)
        await b.close()
asyncio.run(main())
