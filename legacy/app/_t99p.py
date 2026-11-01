import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_trk")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, has_touch=True, is_mobile=True, device_scale_factor=2)
        pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        await pg.evaluate("__tg.applyTheme('ivd')")
        rid = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(x=>!x.shop && __tg.trkPick(x).kind==='model' && /VNR/.test(x.model)); r.trkNotes=[{id:'tn1',x:.3,y:.6,kind:'Damage',text:'Dent on the hood, driver side',at:new Date().toISOString(),by:'Mike',pic:'m:'+__tg.trkPick(r).entry.id}]; const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); return r.id; })()"); await pg.wait_for_timeout(1000)
        await pg.screenshot(path=os.path.join(OUT, "pd_ro.png"))
        await pg.evaluate(f"__tg.trkInspOpen(__tg.getRO('{rid}'), 'tn1')"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, "pd_win.png"))
        print("win w", await pg.evaluate("document.querySelector('.ti').getBoundingClientRect().width"), "scrollW", await pg.evaluate("document.documentElement.scrollWidth"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.palette={q:'',sel:0}; __tg.render(); })()"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, "pd_pal.png"))
        print("errs", errs[:4]); await b.close()
asyncio.run(main())
