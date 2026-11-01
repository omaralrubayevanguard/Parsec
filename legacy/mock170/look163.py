import asyncio, os
from playwright.async_api import async_playwright
A = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app"; O = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/mock170"
SIGN = """((role)=>{ const T=__tg.staffList().filter(s=>s.role===role); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{ __tg.CX.U().skipMorning = __tg.todayStr(); }catch(e){} __tg.render(); return T[0].name; })"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1440, "height": 900}); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + A + "/t12.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        await pg.evaluate(SIGN + "('Manager')")
        rid = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.filter(r=>!r.shop && r.id!=='ro_shop')[0]; r.contactName='Dave Miller'; r.contactPhone='(336) 555-0142'; r.department='Service'; __tg.STATE().savedAt=new Date().toISOString(); return r.id; })()")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=O + "/c_rop.png")
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='foreman'; __tg.render(); })()"); await pg.wait_for_timeout(1000)
        el = await pg.query_selector(".ro-lnk")
        if el:
            await el.hover(); await pg.wait_for_timeout(900)
        await pg.screenshot(path=O + "/c_fm.png")
        print("errors", errs)
        await b.close()
asyncio.run(main())
