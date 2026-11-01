import asyncio, datetime, os, json, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
SEED=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'t5_fm.py')).read().split('SEED = r"""')[1].split('"""')[0]
from playwright.async_api import async_playwright
H=os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await (await b.new_context(viewport={"width":1440,"height":900})).new_page()
        await pg.clock.install(time=datetime.datetime(2026,10,22,10,15))
        await pg.goto("file://"+H+"/t5.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()")
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='foreman'; U.modal=null; __tg.render();})()"); await pg.wait_for_timeout(500)
        await pg.evaluate(SEED); await pg.evaluate("(()=>{__tg.render();})()"); await pg.wait_for_timeout(400)
        r=await pg.evaluate("""(()=>{const t=document.querySelector('.fm-bay:not(.free)'); if(!t) return 'none'; const out={html:t.outerHTML.slice(0,900)}; const r3=t.querySelector('.r3'); if(r3){const cs=getComputedStyle(r3); out.r3={bg:cs.backgroundColor, h:r3.getBoundingClientRect().height, disp:cs.display, color:cs.color, ff:cs.fontSize}; const a=r3.querySelector('.tg-av'); if(a){const c=getComputedStyle(a); out.av={bg:c.backgroundColor,w:a.getBoundingClientRect().width,h:a.getBoundingClientRect().height,disp:c.display}} const n=r3.querySelector('.nm'); if(n){const c=getComputedStyle(n); out.nm={color:c.color, w:n.getBoundingClientRect().width, vis:c.visibility, op:c.opacity}} }
          const els=[...t.querySelectorAll('*')].map(e=>{const c=getComputedStyle(e); const r=e.getBoundingClientRect(); return [e.className, c.backgroundColor, Math.round(r.width), Math.round(r.height)]}); out.els=els; return out;})()""")
        await pg.locator('.fm-grid').screenshot(path=H+'/shots5/z_grid.png')
        r2=await pg.evaluate("""(()=>{const t=document.querySelector('.fm-bay:not(.free)'); const a=getComputedStyle(t,'::after'), b=getComputedStyle(t,'::before'); return [a.content,a.backgroundColor,a.height,b.content,b.backgroundColor,b.height]})()""")
        print(r2); print(r['els'][9:])
        print(await pg.evaluate("""(()=>{const t=document.querySelector('.fm-bay:not(.free) .ln'); const c=getComputedStyle(t); return [c.position,c.left,c.right,c.bottom,c.height,c.background, c.zIndex]})()"""))
        await b.close()
asyncio.run(main())
