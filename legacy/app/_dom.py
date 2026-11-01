import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page()
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()")
        for v in (sys.argv[1:] or ["console","inbox","ros","rolist","triage","foreman","warranty","parts","fixes","timelog","career","manager","report","profile"]):
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; U.modal=null; __tg.render(); }})()"); await pg.wait_for_timeout(400)
            t = await pg.evaluate("""(()=>{ const out=[]; const walk=(el,d)=>{ if(d>3) return; [...el.children].forEach(c=>{ if(/^(SCRIPT|STYLE|svg)$/i.test(c.tagName)) return; const r=c.getBoundingClientRect(); if(r.width<120 && d>1) return; out.push('  '.repeat(d)+c.tagName.toLowerCase()+(c.id?'#'+c.id:'')+(c.className&&typeof c.className==='string'?'.'+c.className.trim().split(/\\s+/).slice(0,4).join('.'):'')+(c.dataset.pg?'[pg='+c.dataset.pg+']':'')+' '+Math.round(r.x)+','+Math.round(r.y)+' '+Math.round(r.width)+'x'+Math.round(r.height)); if(out.length<70) walk(c,d+1); }); }; const M=document.querySelector(".main")||document.body; walk(M,0); return out.slice(0,40).join('\\n'); })()""")
            print("=====", v); print(t)
        await b.close()
asyncio.run(main())
