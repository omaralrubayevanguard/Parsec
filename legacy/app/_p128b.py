import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots128")
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
def J(js): return "(()=>{ const R=" + SR + "; " + js + " })()"
src = open(os.path.join(H, "_t127p.py")).read(); PREP = src.split('PREP = """')[1].split('"""')[0]
def SIGN(sid): return f"(()=>{{ localStorage.setItem('tec_viewas', '{sid}'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{{ __tg.CX.U().skipMorning = __tg.todayStr(); }}catch(e){{}} __tg.render(); return __tg.pcMe(); }})()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page()
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        X = await pg.evaluate(PREP); ro, a = X["ro"], X["a"]
        roles = await pg.evaluate("__tg.staffList().map(s=>[s.id,s.name,s.role])"); print(roles)
        await pg.evaluate(SIGN(X["A"]))
        await pg.evaluate(f"__tg.doStartPunch('{ro}', '{a}', 'Repairing')"); await pg.wait_for_timeout(300)
        await pg.evaluate("__tg.doStopPunch('Complete')"); await pg.wait_for_timeout(300)
        async def card():
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(700)
            on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{a}\"]'); return r ? r.classList.contains('is-on') : null"))
            if not on: await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{a}\"] .px-row__t'); if(r) r.click()")); await pg.wait_for_timeout(500)
            return await pg.evaluate(J(f"const c=R.querySelector('.ock[data-op=\"{a}\"]'); const st=R.querySelector('.px-row[data-op=\"{a}\"] .rop-st'); return {{mode: c && c.dataset.mode, can: c && c.dataset.can, st: st && st.textContent, go: c && !!c.querySelector('[data-ock=go]')}}"))
        print('tech, after Complete:', await card())
        await pg.screenshot(path=os.path.join(OUT, "d_done.png"))
        for sid, nm, role in roles:
            if role in ('Technician',): continue
            await pg.evaluate(SIGN(sid)); c = await card(); print(role, nm, c)
        # tech page as tech
        await pg.evaluate(SIGN(X["A"])); await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "e_tech.png"))
        await pg.click("[data-pg=tech] >> text=Done at"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "f_tech_done.png"))
        await pg.click("[data-pg=tech] button:has-text('Reopen')"); await pg.wait_for_timeout(900)
        print('toast', await pg.evaluate("__tg.UI().toast"))
        await pg.screenshot(path=os.path.join(OUT, "g_tech_reopen.png"), full_page=False)
        print(errs)
        await b.close()
asyncio.run(main())
