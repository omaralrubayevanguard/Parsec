import asyncio, sys, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.goto("file://" + H + "/t4.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(400)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='triage'; U.modal=null; __tg.render();})()"); await pg.wait_for_timeout(500)
        print(await pg.evaluate("""(()=>{const q=s=>{const e=document.querySelector(s); if(!e) return s+': none'; const c=getComputedStyle(e); return s+': h='+e.getBoundingClientRect().height+' disp='+c.display+' pad='+c.padding+' minh='+c.minHeight+' ov='+c.overflow+' parent='+e.parentElement.className;}; return [q('.main'),q('.tg'),q('.tg-body'),q('.tg-list'),q('.tg-scroll'),q('.tg-main'),q('.tg-ib'),q('.tg-thread'),q('.tg-comp')].join('\\n');})()"""))
        print(await pg.evaluate("document.documentElement.scrollHeight"), await pg.evaluate("[document.querySelector('.main').getAttribute('style'), getComputedStyle(document.querySelector('.main')).height, document.documentElement.getAttribute('data-device'), document.documentElement.className]"))
        await b.close()
asyncio.run(main())
