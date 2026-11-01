import asyncio
from playwright.async_api import async_playwright
F="file:///mnt/user-data/outputs/Parsec%20Technician%20page%20mock-up.html"
S="build/tech/shots/"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    errs=[]
    c=await b.new_context(viewport={"width":1440,"height":900}); x=await c.new_page()
    x.on("pageerror",lambda e:errs.append("PE "+str(e)))
    x.on("console",lambda m: errs.append(m.text) if m.type=="error" and "ERR_FAILED" not in m.text else None)
    await x.route("**/fonts.g*/**",lambda r:r.abort())
    await x.goto(F); await x.wait_for_timeout(300)
    await x.screenshot(path=S+"a_list.png")
    async def st(lbl):
      t=await x.evaluate("(document.querySelector('.toast')||{}).textContent||''")
      print(lbl,"| toast:",t[:110])
    # select assigned 37750 and start it
    await x.click('[data-sel="37750"]'); await x.wait_for_timeout(150)
    await x.click('.pn [data-do="start"]'); await x.wait_for_timeout(200); await st("start 37750")
    await x.screenshot(path=S+"a_started.png")
    # undo via toast
    u=await x.query_selector('.toast button'); 
    if u: await u.click(); await x.wait_for_timeout(200); await st("undo")
    # status menu on 37590
    await x.click('[data-sel="37590"]'); await x.wait_for_timeout(150)
    await x.click('.pn [data-do="status"]'); await x.wait_for_timeout(200)
    await x.screenshot(path=S+"a_status.png")
    await x.keyboard.press("Escape"); await x.wait_for_timeout(100)
    await x.click('.pn [data-do="hand"]'); await x.wait_for_timeout(200)
    await x.screenshot(path=S+"a_hand.png")
    await x.click('#mn [data-hand="Parts"]'); await x.wait_for_timeout(200); await st("hand to parts")
    await x.screenshot(path=S+"a_handed.png")
    await x.keyboard.press("Control+z"); await x.wait_for_timeout(200); await st("ctrl z")
    # part pill
    await x.click('[data-sel="37590"]'); await x.wait_for_timeout(150)
    pp=await x.query_selector_all('.pn [data-do="part"]'); print("parts",len(pp))
    await pp[-1].click(); await x.wait_for_timeout(150); await st("part")
    # done
    await x.click('.pn [data-do="done"]'); await x.wait_for_timeout(200); await st("done")
    await x.screenshot(path=S+"a_done.png")
    await x.keyboard.press("Control+z"); await x.wait_for_timeout(200)
    # search
    await x.fill('#q','2016'); await x.wait_for_timeout(200)
    n=await x.evaluate("document.querySelectorAll('[data-sel]').length"); print("search 2016 ->",n)
    await x.fill('#q',''); await x.wait_for_timeout(150)
    # range week/pay
    for r in ["week","pay"]:
      await x.click(f'[data-rg="{r}"]'); await x.wait_for_timeout(150)
      n=await x.evaluate("document.querySelectorAll('[data-sel]').length"); print("range",r,n)
    await x.screenshot(path=S+"a_pay.png")
    await x.click('[data-rg="today"]')
    # keys
    await x.click('.pg h1'); await x.keyboard.press("j"); await x.keyboard.press("j"); await x.wait_for_timeout(150)
    print("after jj sel", await x.evaluate("document.querySelector('.rw.on,[data-sel].on')?.getAttribute('data-sel')"))
    # lanes drag 37755 -> work
    await x.click('[data-lay="lanes"]'); await x.wait_for_timeout(200)
    await x.drag_and_drop('.cd[data-sel="37755"]','.ln[data-lane="work"]'); await x.wait_for_timeout(250); await st("drag to work")
    await x.screenshot(path=S+"a_drag.png")
    await x.keyboard.press("Control+z"); await x.wait_for_timeout(200)
    await x.drag_and_drop('.cd[data-sel="37750"]','.ln[data-lane="wait"]'); await x.wait_for_timeout(250)
    await x.screenshot(path=S+"a_dragwait.png")
    await x.keyboard.press("Escape")
    # today drawer
    await x.click('[data-lay="today"]'); await x.wait_for_timeout(200)
    await x.click('[data-tab="wait"]') if await x.query_selector('[data-tab="wait"]') else None
    await x.wait_for_timeout(150); await x.screenshot(path=S+"a_today_wait.png")
    r=await x.query_selector('.tr[data-sel]')
    if r: await r.click(); await x.wait_for_timeout(250)
    await x.screenshot(path=S+"a_drawer.png")
    await x.keyboard.press("Escape")
    # foreman chips
    await x.click('[data-lay="list"]'); await x.click('[data-view="fore"]'); await x.wait_for_timeout(150)
    await x.click('[data-tech="Dana Kim"]') if await x.query_selector('[data-tech="Dana Kim"]') else print("no dana", await x.evaluate("[...document.querySelectorAll('[data-tech]')].map(e=>e.dataset.tech)"))
    await x.wait_for_timeout(150); await st("tech chip")
    await x.click('[data-view="tech"]')
    await x.click('#srct'); await x.wait_for_timeout(150); await x.screenshot(path=S+"a_src.png")
    await x.click('#srct')
    await x.click('#pk-open'); await x.wait_for_timeout(150)
    await x.click('[data-pk="layout"][data-v="lanes"]'); await x.wait_for_timeout(150)
    await x.screenshot(path=S+"a_picks.png")
    print("picks text:", await x.evaluate("pkText ? 1 : 0") if False else "")
    print("ERRS",errs)
    await b.close()
asyncio.run(main())
