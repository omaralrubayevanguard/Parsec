import asyncio
from playwright.async_api import async_playwright
F="file:///mnt/user-data/outputs/Parsec%20Technician%20page%20mock-up.html"
S="build/tech/shots/"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    errs=[]
    c=await b.new_context(viewport={"width":1440,"height":900}); x=await c.new_page(); x.set_default_timeout(5000)
    x.on("pageerror",lambda e:errs.append("PE "+str(e)))
    x.on("console",lambda m: errs.append(m.text) if m.type=="error" and "ERR_FAILED" not in m.text else None)
    await x.route("**/fonts.g*/**",lambda r:r.abort())
    await x.goto(F); await x.wait_for_timeout(300)
    await x.screenshot(path=S+"a_list.png")
    async def st(lbl):
      t=await x.evaluate("(document.querySelector('.toast')||{}).textContent||''")
      print(lbl,"| toast:",t[:110])
    async def dnd(a,lane):
      await x.evaluate("""([a,l])=>{const s=document.querySelector('.cd[data-sel="'+a+'"]'),t=document.querySelector('.ln[data-lane="'+l+'"]');const dt=new DataTransfer();s.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:dt}));t.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:dt}));t.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt}));s.dispatchEvent(new DragEvent('dragend',{bubbles:true,dataTransfer:dt}));}""",[a,lane])
    # lanes drag 37755 -> work
    await x.click('[data-lay="lanes"]'); await x.wait_for_timeout(200)
    await dnd('37755','work'); await x.wait_for_timeout(250); await st("drag to work")
    await x.screenshot(path=S+"a_drag.png")
    await x.keyboard.press("Control+z"); await x.wait_for_timeout(200)
    await dnd('37750','wait'); await x.wait_for_timeout(250)
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
