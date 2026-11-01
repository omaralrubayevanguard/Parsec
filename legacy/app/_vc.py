import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page()
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        for v in ["inbox","triage","foreman","warranty","parts","fixes","timelog","career","manager","profile"]:
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; __tg.render(); }})()"); await pg.wait_for_timeout(300)
            n = await pg.evaluate("document.querySelectorAll('.main .tg-views > *').length")
            for i in range(max(n,1)):
                if n: await pg.evaluate(f"document.querySelectorAll('.main .tg-views > *')[{i}].click()"); await pg.wait_for_timeout(300)
                r = await pg.evaluate("""(()=>{ const b=document.querySelector('.main .tg-body, .main .px-body'); const l=document.querySelector('.main .tg-list, .main .px-list'); const m=document.querySelector('.main .tg-main, .main .px-main'); const t=document.querySelectorAll('.main .tg-views > *'); const on=[...t].find(x=>x.classList.contains('on')||x.getAttribute('aria-pressed')==='true'||x.getAttribute('aria-current')); return [on?on.textContent.trim():'', b?b.className:'', !!l, l?Math.round(l.getBoundingClientRect().width):0, m? (m.firstElementChild? m.firstElementChild.className.split(' ')[0]:'') :'' ]; })()""")
                print(v, i, r)
        await b.close()
asyncio.run(main())
