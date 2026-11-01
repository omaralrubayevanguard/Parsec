import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(H), "app")
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
def J(js): return "(()=>{ const R=" + SR + "; " + js + " })()"
SIGN = """((role)=>{ const T=__tg.staffList().filter(s=>s.role===role); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{ __tg.CX.U().skipMorning = __tg.todayStr(); }catch(e){} __tg.render(); return T[0].name; })"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1440, "height": 900}); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + A + "/t12.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        print(await pg.evaluate("__tg.staffList().map(s=>s.role+':'+s.name).join(', ')"))
        print(await pg.evaluate(SIGN + "('Manager')"))
        info = await pg.evaluate("""(()=>{ const S=__tg.STATE(); return S.ros.filter(r=>!r.shop && r.id!=='ro_shop').slice(0,12).map(r=>[r.id, r.roNumber, r.customerName, r.contactName||'', r.contactPhone||'', r.department||'', r.year, r.model, r.unitNumber, r.assignedTech, (r.operations||[]).map(o=>o.status).join('|'), r.location||'', r.keyTag||'']); })()""")
        for r in info: print(r)
        rid = info[0][0]
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=H + "/now_rop.png")
        print("hdr buttons:", await pg.evaluate(J("return [...R.querySelectorAll('button')].slice(0,80).map(b=>(b.textContent||b.title||'').trim().slice(0,30)).filter(Boolean).join(' | ')")))
        for v in ["rolist", "tech", "foreman", "inbox", "timelog", "parts", "warranty", "triage"]:
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
            await pg.screenshot(path=H + f"/now_{v}.png")
        print("errors", errs[:5])
        await b.close()
asyncio.run(main())
