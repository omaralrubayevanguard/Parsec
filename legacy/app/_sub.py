import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page()
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        v, tab, sel = sys.argv[1], int(sys.argv[2]), sys.argv[3]
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; __tg.render(); }})()"); await pg.wait_for_timeout(350)
        if tab >= 0: await pg.evaluate(f"document.querySelectorAll('.main .tg-views > *')[{tab}].click()"); await pg.wait_for_timeout(350)
        print(await pg.evaluate("""(sel)=>{ const out=[]; const el=document.querySelector(sel); if(!el) return 'none'; const walk=(e,d)=>{ if(d>4) return; [...e.children].forEach(c=>{ const r=c.getBoundingClientRect(); const cs=getComputedStyle(c); out.push('  '.repeat(d)+c.tagName.toLowerCase()+'.'+(typeof c.className==='string'?c.className:'svg')+' '+Math.round(r.x)+','+Math.round(r.y)+' '+Math.round(r.width)+'x'+Math.round(r.height)+' '+cs.display+(cs.display.includes('grid')?' cols='+cs.gridTemplateColumns:'')+(cs.position!=='static'?' pos='+cs.position:'')); if(out.length<50) walk(c,d+1); }); }; walk(el,0); return out.join('\\n'); }""", sel))
        await b.close()
asyncio.run(main())
