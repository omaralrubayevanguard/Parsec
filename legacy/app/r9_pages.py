# Parsec 9: every page module, as each role, both themes — errors and screenshots.
import asyncio, sys, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
SH = os.path.join(H, "shots9"); os.makedirs(SH, exist_ok=True)
PAGES = (sys.argv[1] if len(sys.argv) > 1 else "console,inbox").split(",")
ROLES = (sys.argv[2] if len(sys.argv) > 2 else "Technician,Foreman,Service writer,Parts,Manager,admin").split(",")
THEMES = (sys.argv[3] if len(sys.argv) > 3 else "ivl").split(",")

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        if errs: print("boot:", errs[:4]); errs.clear()
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        for th in THEMES:
            await pg.evaluate(f"__tg.applyTheme('{th}')")
            for role in ROLES:
                if role == "admin":
                    await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); __tg.pxSignedIn(); __tg.render(); })()")
                else:
                    ok = await pg.evaluate(f"(()=>{{ const s=__tg.staffList().find(x=>x.role==={role!r}); if(!s) return false; localStorage.setItem('tec_viewas', s.id); __tg.pxSignedIn(); __tg.render(); return __tg.UI().view; }})()")
                    print(role, "lands on", ok)
                    if not ok: continue
                for v in PAGES:
                    try:
                        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; U.modal=null; __tg.render(); }})()"); await pg.wait_for_timeout(450)
                    except Exception as ex:
                        print("   RENDER FAIL", v, str(ex).split("\n")[0:4]); continue
                    info = await pg.evaluate("(()=>{ const r=document.querySelector('[data-pg]'); const m=document.querySelector('.main'); return r ? [r.dataset.pg, Math.round(r.getBoundingClientRect().height), r.innerText.replace(/\\s+/g,' ').slice(0,160)] : ['none', m ? m.className : '', (m ? m.innerText : '').slice(0,120)]; })()")
                    print(f"  {th} {role:14} {v:9}", info)
                    await pg.screenshot(path=f"{SH}/{v}_{role.replace(' ','')}_{th}.png")
                    if errs: print("   ERR", errs[:4]); errs.clear()
        await b.close()

asyncio.run(main())
