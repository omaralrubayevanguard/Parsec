import asyncio, os, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        pg.on("pageerror", lambda e: print("ERR", e))
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.evaluate("__tg.PG.go('rolist')"); await pg.wait_for_timeout(600)
        print(await pg.evaluate("(()=>{ const m=document.querySelector('.main'); return [m.firstElementChild && m.firstElementChild.className, m.firstElementChild && m.firstElementChild.dataset.pg, [...m.querySelectorAll('[data-a=sel]')].slice(0,2).map(x=>x.className+' '+x.dataset.id)]; })()"))
        await b.close()
asyncio.run(main())
