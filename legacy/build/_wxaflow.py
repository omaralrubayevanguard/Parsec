import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + os.path.abspath("wx/a1.html")); await pg.wait_for_timeout(800)
        ev = pg.evaluate
        sel = lambda no: ev(f"(()=>{{__wx.U().sel='{no}'; __wx.U().pop=null; __wx.render();}})()")
        op = lambda no,i=0: ev(f"JSON.stringify((o=>({{st:o.st,dec:o.claim.dec,short:o.claim.short,paid:o.claim.paid,appeal:o.claim.appeal}}))(__wx.S().R.find(r=>r.no==='{no}').ops[{i}]))")
        toast = lambda: ev("document.querySelector('.toast-fm')?.textContent")
        # returned → appeal
        await sel('37455'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(120); await pg.keyboard.press("2"); await pg.wait_for_timeout(120)
        await pg.fill("#wx-ap", "Photo attached; 0.3 h was seized pulley bolts."); await pg.click("[data-a=dgo]"); await pg.wait_for_timeout(120)
        print("37455:", await op('37455'), await toast())
        # denied → write off over $500 → manager
        await sel('37203'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(120); await pg.keyboard.press("4"); await pg.click("[data-a=dgo]"); await pg.wait_for_timeout(120)
        print("37203:", await op('37203'), await ev("__wx.S().R.find(r=>r.no==='37203').snz"), await toast())
        # short → bill the customer
        await sel('37355'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(120); await pg.keyboard.press("3"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(120)
        print("37355:", await op('37355'), await toast())
        # mark paid short without a reason → blocked, then with reason
        await sel('37466'); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(120); await pg.fill("#wx-pd", "1980"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(120)
        print("blocked:", await ev("__wx.U().pop&&__wx.U().pop.type"), await ev("document.querySelector('#wx-shb').className"))
        await pg.click(".tg-pop [data-a=pwhy]"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(120)
        print("37466:", await op('37466'), await toast())
        print("paid short group:", await ev("[...document.querySelectorAll('.tg-grp')].map(e=>e.textContent)"))
        await pg.click("[data-a=undo]"); await pg.wait_for_timeout(120)
        # statement: paste and apply
        await pg.click("[data-a=stmt]"); await pg.wait_for_timeout(120)
        await pg.fill("#wx-stp", await ev("STMT_DEMO") if False else "W2621417  INJECTOR CYL 4  2,140.00\nW2624410  DPF  1,020.31")
        await pg.click("[data-a=stmatch]"); await pg.wait_for_timeout(120)
        print("ticked:", await ev("Object.keys(__wx.U().stmt.on)"), "total", await ev("__wx.U().stmt.total"))
        await pg.click("[data-a=stgo]"); await pg.wait_for_timeout(150)
        print("after stmt:", await op('37466'), await op('37590',1), await toast())
        print("errors", errs)
        await b.close()
asyncio.run(main())
