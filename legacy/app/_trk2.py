import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_trk"); os.makedirs(OUT, exist_ok=True)
F = sys.argv[1] if len(sys.argv) > 1 else "t9.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for theme in ["ivl", "ivd"]:
            ctx = await b.new_context(viewport={"width":1440,"height":900})
            pg = await ctx.new_page(); errs=[]
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto("file://" + H + "/" + F); await pg.wait_for_timeout(1200)
            await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
            await pg.evaluate(f"__tg.applyTheme && (__tg.STATE().settings = Object.assign(__tg.STATE().settings||{{}}, {{theme:'{theme}'}}), __tg.applyTheme('{theme}'))"); await pg.wait_for_timeout(200)
            for no in ["model:st-white", "model:st-red", "model:st-gray", "photo:", "none:"]:
                k, e = no.split(":")
                await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(x=>{{ if(x.shop) return false; const P=__tg.trkPick(x); return P.kind==='{k}' && (!'{e}' || P.entry.id==='{e}'); }}); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); }})()"); await pg.wait_for_timeout(900)
                no = no.replace(":", "_")
                await pg.screenshot(path=os.path.join(OUT, f"ro_{theme}_{no}.png"), clip={"x":0,"y":0,"width":1440,"height":520})
                info = await pg.evaluate("""(()=>{ const h=document.querySelector('.jc-host'); if(!h) return 'no host'; const R=h.shadowRoot; const t=R.querySelector('.px-trk'); if(!t) return 'no band'; const p=t.querySelector('.px-trk__pic'); const r=t.getBoundingClientRect(), q=p.getBoundingClientRect(); const im=p.querySelector('img'); return 'band '+Math.round(r.x)+','+Math.round(r.y)+' '+Math.round(r.width)+'x'+Math.round(r.height)+' pic '+p.className+' '+Math.round(q.width)+'x'+Math.round(q.height)+(im?' img '+im.naturalWidth+'x'+im.naturalHeight+' '+String(im.src).slice(0,30):''); })()""")
                print(theme, no, info)
            print("errs", errs[:5])
            await ctx.close()
        await b.close()
asyncio.run(main())
