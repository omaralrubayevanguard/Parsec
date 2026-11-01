import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_phone", "p"); os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        await pg.click('.pm-tab[data-pm="more"]'); await pg.wait_for_timeout(300)
        await pg.click('.pm-sheet [data-s="look"]'); await pg.wait_for_timeout(500)
        print("appearance opened directly:", await pg.evaluate("document.documentElement.classList.contains('pm-det')"), await pg.evaluate("__tg.UI().pxSec"))
        await pg.screenshot(path=f"{OUT}/look.png", full_page=True)
        # switch to Computer and back to Phone from Appearance
        segs = await pg.evaluate("[...document.querySelectorAll('[data-action=set-device]')].map(b=>b.textContent.trim()+':'+(b.getAttribute('aria-pressed')||b.className))")
        print("screen seg:", segs)
        await pg.evaluate("document.querySelector('[data-action=set-device][data-mode=desktop]').click()"); await pg.wait_for_timeout(500)
        print("after Computer:", await pg.evaluate("document.documentElement.getAttribute('data-device')"), "viewport:", await pg.evaluate("document.querySelector('meta[name=viewport]').content"), "width:", await pg.evaluate("window.innerWidth"), "rail shown:", await pg.evaluate("!!document.querySelector('.px-rail') && getComputedStyle(document.querySelector('.px-rail')).display!=='none'"), "tabs:", await pg.evaluate("!!document.querySelector('.pm-tabs')"))
        await pg.evaluate("document.querySelector('[data-action=set-device][data-mode=phone]').click()"); await pg.wait_for_timeout(500)
        print("after Phone:", await pg.evaluate("document.documentElement.getAttribute('data-device')"), "tabs:", await pg.evaluate("!!document.querySelector('.pm-tabs')"))
        await pg.evaluate("(()=>{ const b=document.querySelector('.pm-back'); if(b) b.click(); })()"); await pg.wait_for_timeout(300)
        n = await pg.evaluate("document.querySelectorAll('.px-list .px-it').length")
        for i in range(n):
            await pg.evaluate(f"document.querySelectorAll('.px-list .px-it')[{i}].click()"); await pg.wait_for_timeout(450)
            nm = await pg.evaluate("__tg.UI().pxSec")
            await pg.screenshot(path=f"{OUT}/sec_{i}_{nm}.png")
            bad = await pg.evaluate("[...document.querySelectorAll('.main *')].filter(e=>{const r=e.getBoundingClientRect(); return r.width && r.right>396 && getComputedStyle(e).position!=='fixed';}).slice(0,4).map(e=>(e.className&&typeof e.className==='string'?e.className.split(' ')[0]:e.tagName)+':'+Math.round(e.getBoundingClientRect().right))")
            print("section", i, nm, "det:", await pg.evaluate("document.documentElement.classList.contains('pm-det')"), "clipped:", bad)
            await pg.evaluate("(()=>{ const b=document.querySelector('.pm-back'); if(b) b.click(); })()"); await pg.wait_for_timeout(300)
        print("errors", errs[:6]); await b.close()
asyncio.run(main())
