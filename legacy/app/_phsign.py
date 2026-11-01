import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_phone")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ localStorage.setItem('tec_out','1'); localStorage.removeItem('tec_viewas'); __tg.render(); })()"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=f"{OUT}/signin.png")
        bad = await pg.evaluate("[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(); return r.width && (r.right>394 || r.left < -2);}).slice(0,5).map(e=>(e.className||e.tagName).toString().split(' ')[0]+':'+Math.round(e.getBoundingClientRect().left)+'-'+Math.round(e.getBoundingClientRect().right))")
        print("sign-in clipped:", bad, "tabs:", await pg.evaluate("!!document.querySelector('.pm-tabs')"))
        # sign in as a technician: their four tabs
        await pg.evaluate("(()=>{ const s=__tg.staffList().find(x=>x.role==='Technician'); localStorage.setItem('tec_viewas', s.id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()"); await pg.wait_for_timeout(600)
        print("tech tabs:", await pg.evaluate("[...document.querySelectorAll('.pm-tab')].map(t=>t.textContent.trim())"))
        await pg.screenshot(path=f"{OUT}/tech_home.png")
        for role in ["Foreman","Parts","Warranty admin","Service writer","Manager","Triage"]:
            await pg.evaluate(f"(()=>{{ const s=__tg.staffList().find(x=>x.role==={role!r}); if(!s) return; localStorage.setItem('tec_viewas', s.id); __tg.pxSignedIn(); __tg.render(); }})()"); await pg.wait_for_timeout(400)
            print(role, "tabs:", await pg.evaluate("[...document.querySelectorAll('.pm-tab')].map(t=>t.textContent.trim().replace(/\\d+$/,''))"), "home:", await pg.evaluate("__tg.UI().view"))
        print("errors", errs[:5]); await b.close()
asyncio.run(main())
