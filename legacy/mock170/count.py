import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(H), "app")
SIGN = """((role)=>{ const T=__tg.staffList().filter(s=>s.role===role); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{ __tg.CX.U().skipMorning = __tg.todayStr(); }catch(e){} __tg.render(); return T[0].name; })"""
CNT = """(()=>{ const q=(r)=>{ let pics=0, nums=0, links=0; const walk=(root)=>{ pics+=root.querySelectorAll('.trk-th, .tg-hpic, .fm-ti, .tg-tv').length; root.querySelectorAll('*').forEach(el=>{ if(el.shadowRoot) walk(el.shadowRoot); if(el.children.length===0 && /^(RO-?\\s?)?\\d{4,5}$/.test((el.textContent||'').trim())){ nums++; const c=el.closest('a,button,[data-a],[role=button],[onclick]'); if(c) links++; } }); }; walk(document.getElementById('app')||document.body); return [pics, nums, links]; }; return q(); })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1440, "height": 900})
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + A + "/t12.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        await pg.evaluate(SIGN + "('Manager')")
        for v in ["rolist", "tech", "foreman", "inbox", "timelog", "parts", "warranty", "triage", "manager", "fixes"]:
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
            print(v, await pg.evaluate(CNT))
        await b.close()
asyncio.run(main())
