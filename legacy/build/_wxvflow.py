import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1480, "height": 1000}, accept_downloads=True); pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + os.path.abspath("wx/v1.html")); await pg.wait_for_timeout(800)
        ev = pg.evaluate
        await pg.keyboard.press("3"); await pg.wait_for_timeout(150); print("view", await ev("__wx.U().view"))
        box = await pg.locator(".wx-svg path.c2").nth(3).bounding_box(); await pg.mouse.move(box["x"]+4, box["y"]+10); await pg.wait_for_timeout(100)
        print("tip:", await ev("(t=>t&&!t.hidden?t.textContent:null)(document.querySelector('.wx-tip'))"), "hv", await ev("document.querySelectorAll('.wx-svg .hv').length"))
        await pg.screenshot(path="wx/v_hover.png")
        for k in ["last","90","year"]:
            await pg.click(f"[data-a=per][data-k='{k}']"); await pg.wait_for_timeout(80); print(k, await ev("[...document.querySelectorAll('.wx-tile b')].map(e=>e.textContent).join(' | ')"))
        async with pg.expect_download() as dl:
            await pg.click("[data-a=csv]")
        d = await dl.value; path = await d.path(); print("csv", d.suggested_filename, open(path).read().splitlines()[:3])
        await pg.click(".wx-ot .row"); await pg.wait_for_timeout(120); print("msel →", await ev("__wx.U().view+' '+__wx.U().sel"))
        await pg.keyboard.press("4"); await pg.wait_for_timeout(120)
        await pg.click("[data-a=ppop][data-ro='37388']"); await pg.wait_for_timeout(120); print("pop", await ev("__wx.U().pop&&__wx.U().pop.type"))
        await pg.keyboard.press("1"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(120)
        print("37388 part:", await ev("JSON.stringify(__wx.S().R.find(r=>r.no==='37388').ops[0].parts[0][5])"))
        await pg.click("[data-a=pfilt][data-k=done]"); print("done rows", await ev("document.querySelectorAll('.wx-pt2:not(.h)').length"))
        print("errors", errs)
        await b.close()
asyncio.run(main())
