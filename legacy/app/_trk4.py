import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_trk")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":1440,"height":900})
        pg = await ctx.new_page()
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='ros'; U.selectedRo=null; __tg.render(); })()"); await pg.wait_for_timeout(1000)
        for pt in [(1060,143),(1096,143),(1135,143)]:
            print(pt, await pg.evaluate("""([x,y])=>{ let e=document.elementFromPoint(x,y); let path=[]; while(e && e.shadowRoot){ const i=e.shadowRoot.elementFromPoint(x,y); if(!i||i===e) break; e=i; } let n=e; for(let k=0;k<6&&n;k++){ path.push(n.tagName.toLowerCase()+'.'+String(n.className&&n.className.baseVal!==undefined?n.className.baseVal:n.className).slice(0,50)); n=n.parentElement; } return path.join(' < '); }""", list(pt)))
        await pg.screenshot(path=os.path.join(OUT, "i_probe.png"), clip={"x":260,"y":60,"width":1000,"height":260})
        await b.close()
asyncio.run(main())
