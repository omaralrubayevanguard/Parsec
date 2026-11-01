# every view tab of every page, phone view
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_phone", "v"); os.makedirs(OUT, exist_ok=True)
THEME = sys.argv[1]; PAGES = sys.argv[2:]
PROBE = r"""(()=>{ const bad=[]; document.querySelectorAll('.main *').forEach(e=>{ const r=e.getBoundingClientRect(); if(!r.width) return; const cs=getComputedStyle(e); if(cs.position==='fixed') return; if(r.right>396 && r.left<390){ let p=e.parentElement, sc=false; while(p && p!==document.body){ const c=getComputedStyle(p); if(/(auto|scroll)/.test(c.overflowX)){ sc=true; break; } p=p.parentElement; } if(!sc) bad.push((e.className&&typeof e.className==='string'?e.className.split(' ')[0]:e.tagName)+':'+Math.round(r.right)); } }); return [...new Set(bad)].slice(0,6); })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.evaluate(f"__tg.applyTheme('{THEME}')"); await pg.wait_for_timeout(300)
        for v in PAGES:
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; U.modal=null; U.toast=null; __tg.render(); window.scrollTo(0,0); }})()"); await pg.wait_for_timeout(450)
            n = await pg.evaluate("document.querySelectorAll('.main .tg-views > *').length")
            for i in range(max(1, n)):
                if n:
                    await pg.evaluate(f"(()=>{{ const b=document.querySelectorAll('.main .tg-views > *')[{i}]; if(b) b.click(); window.scrollTo(0,0); }})()"); await pg.wait_for_timeout(450)
                lab = await pg.evaluate(f"(()=>{{ const b=document.querySelectorAll('.main .tg-views > *')[{i}]; return b? b.textContent.trim().slice(0,12).replace(/\\W+/g,'_') : 'main'; }})()")
                bad = await pg.evaluate(PROBE)
                await pg.screenshot(path=f"{OUT}/{THEME}_{v}_{i}_{lab}.png")
                print(v, i, lab, "clipped:", bad)
                if await pg.evaluate("!!document.querySelector('.main .tg-list .tg-it')"):
                    await pg.evaluate("document.querySelector('.main .tg-list .tg-it:not(.ib-sum)').click()"); await pg.wait_for_timeout(450)
                    bad = await pg.evaluate(PROBE)
                    await pg.screenshot(path=f"{OUT}/{THEME}_{v}_{i}_{lab}_open.png")
                    print("   opened clipped:", bad)
                    await pg.evaluate("(()=>{ const b=document.querySelector('.pm-back'); if(b) b.click(); })()"); await pg.wait_for_timeout(250)
        print("errors", errs[:6]); await b.close()
asyncio.run(main())
