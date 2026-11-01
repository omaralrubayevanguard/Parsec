import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1480,"height":1000})
        await pg.goto("file:///mnt/user-data/outputs/Parsec%20Triage%20yard.html"); await pg.wait_for_timeout(400)
        await pg.click("[data-demo=drag]"); await pg.wait_for_timeout(200)
        await pg.evaluate("window.__ev=[];['dragstart','dragover','drop','dragend','mousedown','click'].forEach(t=>document.addEventListener(t,e=>{if(window.__ev.length<40)window.__ev.push(t+':'+(e.target.className||e.target.tagName))},true))")
        el=await pg.query_selector(".yd [data-drag='37628']"); print(await el.evaluate("e=>e.outerHTML.slice(0,160)"))
        await pg.drag_and_drop(".yd [data-drag='37628']", ".yd [data-drop='E5']"); await pg.wait_for_timeout(300)
        print(await pg.evaluate("window.__ev"))
        print("tile->E5:",await pg.evaluate("ROS.find(r=>r.no==='37628').spot"))
        await b.close()
asyncio.run(main())
