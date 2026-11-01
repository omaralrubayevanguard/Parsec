import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots11")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":1440,"height":900}); pg = await ctx.new_page(); pg.set_default_timeout(6000); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t11.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        print("admin nav:", await pg.evaluate("[...document.querySelectorAll('.pxr-nav .pxr-row')].map(r=>r.textContent.trim().replace(/\\d+$/,'')).join(', ')"))
        # the technician with the most ROs
        tid = await pg.evaluate("""(()=>{ const T=__tg.staffList().filter(s=>s.role==='Technician'); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name).length; T.sort((a,b)=>n(b)-n(a)); return T[0] ? [T[0].id, T[0].name, n(T[0]), T.map(t=>t.name+':'+n(t)).join(' ')] : null; })()""")
        print("tech:", tid)
        await pg.evaluate(f"(()=>{{ localStorage.setItem('tec_viewas', '{tid[0]}'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); }})()"); await pg.wait_for_timeout(700)
        print("view:", await pg.evaluate("__tg.UI().view"), "| nav:", await pg.evaluate("[...document.querySelectorAll('.pxr-nav .pxr-row')].map(r=>r.textContent.trim().replace(/\\d+$/,'')).join(', ')"))
        await pg.screenshot(path=os.path.join(OUT, "a_morning.png"))
        m = await pg.query_selector('[data-pg="tech"] [data-a="morning"]')
        if m: await m.click(); await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, "a_list.png"))
        print("groups:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-grp')].map(g=>g.textContent.trim()).join(' | ')"))
        print("items:", await pg.evaluate("document.querySelectorAll('[data-pg=tech] .tch-it').length"), "ops:", await pg.evaluate("document.querySelectorAll('[data-pg=tech] .tch-o').length"), "open:", await pg.evaluate("document.querySelectorAll('[data-pg=tech] .tch-o.open').length"))
        T = lambda: pg.evaluate("(document.querySelector('.toast')||{}).textContent||''")
        # start the selected RO
        st = await pg.query_selector('[data-pg="tech"] .tch-acts [data-a="startid"]')
        if st: await st.click(); await pg.wait_for_timeout(500); print("start:", (await T())[:120])
        print("run:", await pg.evaluate("!!__tg.runningPunch()"), "groups:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-grp')].map(g=>g.textContent.trim()).join(' | ')"))
        await pg.wait_for_timeout(1100)
        await pg.screenshot(path=os.path.join(OUT, "a_running.png"))
        # write a note on the open op
        ni = await pg.query_selector('[data-pg="tech"] [data-in="tnote"]')
        if ni:
            await ni.click(); await ni.type("Found the clamp loose at the turbo flange."); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
            print("note lines:", await pg.evaluate("document.querySelectorAll('[data-pg=tech] .tch-o.open .tch-nl').length"), "focus kept:", await pg.evaluate("document.activeElement && document.activeElement.dataset.in"))
        # open every op
        await pg.click('[data-pg="tech"] [data-a="tall"]'); await pg.wait_for_timeout(300)
        print("open all:", await pg.evaluate("[document.querySelectorAll('[data-pg=tech] .tch-o').length, document.querySelectorAll('[data-pg=tech] .tch-o.open').length]"))
        await pg.screenshot(path=os.path.join(OUT, "a_openall.png"), full_page=False)
        # hold menu from the acts row
        hb = await pg.query_selector('[data-pg="tech"] .tch-acts [data-p="hold"]')
        if hb:
            await hb.click(); await pg.wait_for_timeout(300); await pg.screenshot(path=os.path.join(OUT, "a_hold.png"))
            await pg.click('[data-pg="tech"] .tg-pop [data-a="hold"][data-v="Waiting – Parts"]'); await pg.wait_for_timeout(400); print("hold:", (await T())[:140])
            print("groups after hold:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-grp')].map(g=>g.textContent.trim()).join(' | ')"))
            await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(400)
        # J/K and search
        await pg.mouse.click(700, 60); await pg.keyboard.press("j"); await pg.wait_for_timeout(250); await pg.keyboard.press("j"); await pg.wait_for_timeout(250)
        print("after jj:", await pg.evaluate("__tg.CX.TU().ro"))
        await pg.keyboard.press("/"); await pg.keyboard.type("2019"); await pg.wait_for_timeout(300)
        print("search 2019:", await pg.evaluate("document.querySelectorAll('[data-pg=tech] .tch-it').length"), "focus:", await pg.evaluate("document.activeElement && document.activeElement.dataset.in"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        # a waiting RO
        w = await pg.query_selector('[data-pg="tech"] .tch-it.wait')
        if w: await w.click(); await pg.wait_for_timeout(300); await pg.screenshot(path=os.path.join(OUT, "a_wait.png"))
        d = await pg.query_selector('[data-pg="tech"] .tch-it.done')
        if d: await d.click(); await pg.wait_for_timeout(300); await pg.screenshot(path=os.path.join(OUT, "a_done.png"))
        # parts: pick up a staged part if there is one
        print("staged buttons:", await pg.evaluate("document.querySelectorAll('[data-pg=tech] [data-a=tpick]').length"))
        # themes
        for th in ["ivd", "vvl", "vvd", "ivl"]:
            await pg.evaluate(f"__tg.applyTheme('{th}')"); await pg.wait_for_timeout(250)
            r1 = await pg.query_selector('[data-pg="tech"] .tch-it.run') or await pg.query_selector('[data-pg="tech"] .tch-it')
            if r1: await r1.click(); await pg.wait_for_timeout(250)
            await pg.screenshot(path=os.path.join(OUT, f"a_th_{th}.png"))
        # Console is gone for the tech; going to it lands on the Technician page
        await pg.evaluate("(()=>{ __tg.PG.go('console'); })()"); await pg.wait_for_timeout(300); print("go console ->", await pg.evaluate("__tg.UI().view"))
        # a foreman doesn't get it
        fid = await pg.evaluate("(__tg.staffList().find(s=>s.role==='Foreman')||{}).id")
        await pg.evaluate(f"(()=>{{ localStorage.setItem('tec_viewas', '{fid}'); __tg.pxSignedIn(); __tg.render(); }})()"); await pg.wait_for_timeout(500)
        print("foreman view:", await pg.evaluate("__tg.UI().view"), "| nav:", await pg.evaluate("[...document.querySelectorAll('.pxr-nav .pxr-row')].map(r=>r.textContent.trim().replace(/\\d+$/,'')).join(', ')"))
        # manager Team shows the lock
        mid = await pg.evaluate("(__tg.staffList().find(s=>s.role==='Manager')||{}).id")
        await pg.evaluate(f"(()=>{{ localStorage.removeItem('tec_viewas'); __tg.pxSignedIn(); const U=__tg.UI(); U.view='manager'; __tg.render(); }})()"); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{ const b=document.querySelector('[data-pg=manager] [data-a=view][data-v=team]'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)
        print("team tech lock:", await pg.evaluate("[...document.querySelectorAll('[data-pg=manager] .mq-pg')].map(b=>b.textContent.trim()+(b.classList.contains('on')?'*':'')).join(', ')"))
        await pg.screenshot(path=os.path.join(OUT, "a_team.png"))
        print("ERRORS", errs[:8]); await b.close()
asyncio.run(main())
