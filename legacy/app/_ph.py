# phone view: every page at 390×844, list and opened row
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_phone"); os.makedirs(OUT, exist_ok=True)
VIEWS = sys.argv[2:] or ["console","inbox","rolist","ros","triage","foreman","warranty","parts","fixes","timelog","career","manager","report","profile"]
THEME = sys.argv[1] if len(sys.argv) > 1 else "ivl"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.evaluate(f"__tg.applyTheme('{THEME}')"); await pg.wait_for_timeout(400)
        for v in VIEWS:
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; U.modal=null; U.toast=null; __tg.render(); window.scrollTo(0,0); }})()"); await pg.wait_for_timeout(500)
            sw = await pg.evaluate("[document.documentElement.scrollWidth, document.body.scrollWidth, [...document.querySelectorAll('#app *')].filter(e=>{const r=e.getBoundingClientRect(); return r.right>392 && r.width>0 && getComputedStyle(e).position!=='fixed';}).slice(0,4).map(e=>e.className&&e.className.baseVal===undefined?e.tagName+'.'+String(e.className).split(' ')[0]+':'+Math.round(e.getBoundingClientRect().right):e.tagName)]")
            await pg.screenshot(path=f"{OUT}/{THEME}_{v}_1.png")
            has = await pg.evaluate("!!document.querySelector('.main .tg-list .tg-it, .main .px-list button')")
            if has:
                await pg.evaluate("(()=>{ const it=document.querySelector('.main .tg-list .tg-it:not(.ib-sum), .main .px-list button'); it.click(); })()"); await pg.wait_for_timeout(500)
                det = await pg.evaluate("document.documentElement.classList.contains('pm-det')")
                await pg.screenshot(path=f"{OUT}/{THEME}_{v}_2.png")
                sw2 = await pg.evaluate("document.documentElement.scrollWidth")
                print(v, "overflow", sw, "| opened", det, "w", sw2)
                await pg.evaluate("(()=>{ const b=document.querySelector('.pm-back'); if(b) b.click(); })()"); await pg.wait_for_timeout(300)
            else: print(v, "overflow", sw)
        print("errors", errs[:6]); await b.close()
asyncio.run(main())
