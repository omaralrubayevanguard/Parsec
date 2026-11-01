import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots10")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.goto("file://" + H + "/t10.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.modal=null; U.view='ros'; U.selectedRo=__tg.STATE().ros.find(x=>!x.shop && x.operations && x.operations.length && /Hold|Working/.test((x.status||{}).status||'')).id; __tg.render(); })()"); await pg.wait_for_timeout(900)
        # a stage segment opens its checklist; use the app's own stage toggle through a segment's checklist if present
        r = await pg.evaluate("""(()=>{ const sr=document.querySelector('.jc-host').shadowRoot; const s=[...sr.querySelectorAll('[data-pm-stage]')]; return s.map(x=>x.getAttribute('data-pm-stage')+':'+x.className.replace('px-stage__seg','').trim()).join(' '); })()""")
        print("stages:", r)
        seg = await pg.evaluate("""(()=>{ const sr=document.querySelector('.jc-host').shadowRoot; const s=[...sr.querySelectorAll('[data-pm-stage]')].find(x=>!x.classList.contains('is-done')); if(!s) return null; s.click(); return s.getAttribute('data-pm-stage'); })()"""); await pg.wait_for_timeout(500)
        print("clicked:", seg)
        btn = await pg.evaluate("""(()=>{ const sr=document.querySelector('.jc-host').shadowRoot; const b=[...sr.querySelectorAll('button'),...document.querySelectorAll('button')].find(x=>/Check this stage off/.test(x.textContent)); if(b){ b.click(); return b.textContent; } return null; })()"""); await pg.wait_for_timeout(600)
        print("button:", btn, "toast:", await pg.evaluate("(document.querySelector('.toast')||{}).textContent"))
        await pg.screenshot(path=os.path.join(OUT, "f_stage.png"))
        print("errs", errs[:6]); await b.close()
asyncio.run(main())
