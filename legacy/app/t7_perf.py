import asyncio, os, datetime
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def run(f):
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/" + f); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        out = []
        for v in ["triage", "foreman", "warranty", "ros"]:
            ms = await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.view='{v}'; U.modal=null; __tg.render(); const t=performance.now(); for(let i=0;i<10;i++){{ if(__tg.waNcClear) __tg.waNcClear(); __tg.render(); }} return Math.round((performance.now()-t)/10);}})()")
            out.append((v, ms))
        if f == "t7.html":
            out.append(("shortcuts", await pg.evaluate("(()=>{const U=__tg.UI(); U.view='warranty'; U.modal={type:'shortcuts'}; __tg.render(); return (document.querySelector('.modal') || {}).innerText.slice(0,160);})()")))
        print(f, out); await b.close()
async def main():
    await run("t6.html"); await run("t7.html")
asyncio.run(main())
