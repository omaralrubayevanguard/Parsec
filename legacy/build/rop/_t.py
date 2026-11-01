import asyncio
from playwright.async_api import async_playwright
F="file:///mnt/user-data/outputs/Parsec%20RO%20page%20mock-up.html"; S="rop/shots/"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); errs=[]
    x=await b.new_page(viewport={"width":1440,"height":900}); x.set_default_timeout(6000)
    x.on("pageerror",lambda e:errs.append(str(e))); x.on("console",lambda m: errs.append(m.text) if m.type=="error" and "ERR_" not in m.text else None)
    await x.route("**/fonts.g*/**",lambda r:r.abort()); await x.goto(F); await x.wait_for_timeout(400)
    await x.screenshot(path=S+"today.png")
    for k in ["work","three","desk"]:
      await x.click(f'[data-pre="{k}"]'); await x.wait_for_timeout(250); await x.screenshot(path=S+k+".png")
    await x.click('[data-pre="today"]'); await x.click('[data-opv="together"]'); await x.wait_for_timeout(200); await x.screenshot(path=S+"together.png")
    await x.hover('.blk[data-k="next"]'); await x.wait_for_timeout(200); await x.screenshot(path=S+"hover.png")
    await x.click('.blk[data-k="next"] [data-mv="L"]'); await x.wait_for_timeout(250); await x.screenshot(path=S+"moved.png")
    print("middle:", await x.evaluate("[...document.querySelectorAll('[data-col=M] > .blk')].map(b=>b.dataset.k)"))
    await x.click('#und'); await x.wait_for_timeout(200); print("undo:", await x.evaluate("[...document.querySelectorAll('[data-col=R] > .blk')].map(b=>b.dataset.k)"))
    await x.click('#blk-open'); await x.wait_for_timeout(250)
    await x.click('[data-put="R"][data-k="blocker"]'); await x.click('[data-put="M"][data-k="parts"]'); await x.click('[data-put=""][data-k="money"]'); await x.wait_for_timeout(250)
    await x.screenshot(path=S+"drawer.png")
    await x.click('[data-dr="x"]'); await x.wait_for_timeout(200)
    # drag history into a new left column via synthetic DnD
    await x.click('#blk-open'); await x.click('[data-put="L"][data-k="history"]'); await x.click('[data-dr="x"]'); await x.wait_for_timeout(200)
    await x.evaluate("""(()=>{ const g=document.querySelector('.blk[data-k=vehicle] [data-drag]'), t=document.querySelector('[data-col=L]'); const dt=new DataTransfer(); g.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:dt})); })()""")
    await x.wait_for_timeout(50)
    await x.evaluate("""(()=>{ const t=document.querySelector('[data-col=L]'); const r=t.getBoundingClientRect(); const dt=new DataTransfer(); t.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:dt,clientX:r.left+50,clientY:r.bottom-20})); t.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt,clientX:r.left+50,clientY:r.bottom-20})); })()""")
    await x.wait_for_timeout(300)
    print("left:", await x.evaluate("[...document.querySelectorAll('[data-col=L] > .blk')].map(b=>b.dataset.k)"))
    await x.screenshot(path=S+"dragged.png")
    await x.click('#pk-open'); await x.wait_for_timeout(200); await x.fill('#pk-note','Put the parts list right under Operations.'); await x.wait_for_timeout(100)
    print(await x.evaluate("document.querySelector('#picks pre').textContent"))
    await x.screenshot(path=S+"picks.png")
    await x.click('[data-pk="x"]')
    for th in ["graphite","black"]:
      await x.click(f'button[data-th="{th}"]'); await x.wait_for_timeout(150); await x.screenshot(path=S+"th_"+th+".png")
    m=await b.new_page(viewport={"width":390,"height":844}); await m.route("**/fonts.g*/**",lambda r:r.abort()); await m.goto(F); await m.wait_for_timeout(300)
    await m.screenshot(path=S+"phone.png", full_page=True); print("phone sw", await m.evaluate("document.documentElement.scrollWidth"))
    print("ERRS", errs); await b.close()
asyncio.run(main())
