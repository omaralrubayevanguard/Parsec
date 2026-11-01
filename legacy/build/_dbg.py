import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1480,"height":1000})
        await pg.goto("file:///mnt/user-data/outputs/Parsec%20Triage%20customer%20contact.html"); await pg.wait_for_timeout(400)
        await pg.click("[data-demo=rec]"); await pg.wait_for_timeout(300)
        print(await pg.evaluate("""(()=>{const t=document.querySelector('.i3-thread'),m=document.querySelector('.i3-main'),c=document.querySelector('.i3-comp');const cs=getComputedStyle(t);return {sh:t.scrollHeight,ch:t.clientHeight,st:t.scrollTop,ov:cs.overflowY,h:t.offsetHeight,mh:m.offsetHeight,comp:c.offsetHeight,flex:cs.flex,minh:cs.minHeight}})()"""))
        await b.close()
asyncio.run(main())
