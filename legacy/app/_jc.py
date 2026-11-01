import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page()
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='ros'; __tg.render(); })()"); await pg.wait_for_timeout(600)
        t = await pg.evaluate("""(()=>{ const out=[]; const host=document.querySelector('.jc-host'); const R=host.shadowRoot; out.push('host attrs: '+[...host.attributes].map(a=>a.name+'='+a.value).join(' ')); 
          const walk=(el,d)=>{ if(d>5) return; [...el.children].forEach(c=>{ if(/^(STYLE|SCRIPT|svg|LINK)$/i.test(c.tagName)) return; const r=c.getBoundingClientRect(); if(r.width<60 && d>1) return; out.push('  '.repeat(d)+c.tagName.toLowerCase()+(typeof c.className==='string'&&c.className?'.'+c.className.trim().split(/\\s+/).slice(0,3).join('.'):'')+' '+Math.round(r.x)+','+Math.round(r.y)+' '+Math.round(r.width)+'x'+Math.round(r.height)+' '+getComputedStyle(c).display); if(out.length<80) walk(c,d+1); }); }; walk(R,0); 
          const ra=document.querySelector('.ra-host'); if(ra){ const r=ra.getBoundingClientRect(); out.push('ra-host '+Math.round(r.x)+','+Math.round(r.y)+' '+Math.round(r.width)+'x'+Math.round(r.height)+' parent '+ra.parentElement.className); }
          return out.join('\\n'); })()""")
        print(t)
        await b.close()
asyncio.run(main())
