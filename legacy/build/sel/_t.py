import asyncio
from playwright.async_api import async_playwright
F="file:///mnt/user-data/outputs/Parsec%20selecting%20operations%20and%20parts%20mock-up.html"; S="sel/shots/"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); errs=[]
    x=await b.new_page(viewport={"width":1440,"height":900}); x.set_default_timeout(6000)
    x.on("pageerror",lambda e:errs.append(str(e))); x.on("console",lambda m: errs.append(m.text) if m.type=="error" and "ERR_" not in m.text else None)
    await x.route("**/fonts.g*/**",lambda r:r.abort()); await x.goto(F); await x.wait_for_timeout(300)
    T=lambda: x.evaluate("(document.querySelector('.toast')||{}).textContent||''")
    await x.screenshot(path=S+"a.png")
    # pick two parts, picked up
    await x.click('[data-ck="p"][data-id="p2"]'); await x.click('[data-ck="p"][data-id="p3"]', modifiers=["Shift"]); await x.wait_for_timeout(150)
    print("parts picked:", await x.evaluate("document.querySelectorAll('.pr.sel').length"))
    await x.screenshot(path=S+"parts_sel.png")
    await x.click('.sb [data-act="p:pick"]'); await x.wait_for_timeout(200); print("pick:", (await T())[:90])
    # ops: select 2 and 3, hold menu
    await x.click('[data-ck="o"][data-id="o2"]'); await x.click('[data-ck="o"][data-id="o3"]'); await x.wait_for_timeout(150)
    await x.screenshot(path=S+"ops_sel.png")
    await x.click('.sb [data-act="o:hold"]'); await x.wait_for_timeout(150); await x.screenshot(path=S+"hold.png")
    await x.click('[data-hold="Waiting – Parts"]'); await x.wait_for_timeout(200); print("hold:", (await T())[:100])
    await x.click('.toast [data-undo]'); await x.wait_for_timeout(150)
    for bar in ["head","menu"]:
      await x.click(f'[data-bar="{bar}"]'); await x.click('[data-ckall="o"]'); await x.wait_for_timeout(150); await x.screenshot(path=S+"bar_"+bar+".png")
      if bar=="menu":
        await x.click('[data-menu="o"]'); await x.wait_for_timeout(150); await x.screenshot(path=S+"menu_open.png"); await x.keyboard.press("Escape")
      await x.keyboard.press("Escape"); await x.wait_for_timeout(100)
    await x.click('[data-bar="bottom"]')
    await x.click('[data-how="mode"]'); await x.wait_for_timeout(150); await x.screenshot(path=S+"mode_off.png")
    await x.click('[data-mode="1"]'); await x.wait_for_timeout(150); await x.click('[data-open="o2"]'); await x.wait_for_timeout(150); await x.screenshot(path=S+"mode_on.png")
    print("mode sel:", await x.evaluate("document.querySelectorAll('.o.sel').length"))
    await x.click('[data-how="hover"]'); await x.wait_for_timeout(100); await x.hover('.o:nth-child(3) .oh'); await x.wait_for_timeout(150); await x.screenshot(path=S+"hover.png")
    await x.click('[data-how="box"]'); await x.click('[data-reach="ro"]'); await x.wait_for_timeout(100)
    await x.click('[data-ck="p"][data-id="p5"]'); await x.click('[data-ck="p"][data-id="p4"]'); await x.wait_for_timeout(150)
    await x.evaluate("document.querySelector('#pg').scrollTop=400"); await x.wait_for_timeout(100); await x.screenshot(path=S+"ro_parts.png")
    await x.click('.sb [data-act="p:move"]'); await x.wait_for_timeout(150); await x.click('[data-moveto="o2"]'); await x.wait_for_timeout(150); print("move:", (await T())[:80])
    await x.click('#pk-open'); await x.wait_for_timeout(150); await x.click('[data-pk="o:code"]'); await x.wait_for_timeout(100)
    print(await x.evaluate("document.querySelector('#picks pre').textContent"))
    await x.screenshot(path=S+"picks.png")
    await x.click('[data-pk="x"]')
    await x.click('button[data-th="black"]'); await x.click('[data-ck="o"][data-id="o1"]'); await x.wait_for_timeout(150); await x.screenshot(path=S+"black.png")
    m=await b.new_page(viewport={"width":390,"height":844}); await m.route("**/fonts.g*/**",lambda r:r.abort()); await m.goto(F); await m.wait_for_timeout(300)
    await m.click('[data-ck="o"][data-id="o2"]'); await m.wait_for_timeout(150); await m.screenshot(path=S+"phone.png"); print("phone sw", await m.evaluate("document.documentElement.scrollWidth"))
    print("ERRS", errs); await b.close()
asyncio.run(main())
