import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots11")
SIGN = """(()=>{ const T=__tg.staffList().filter(s=>s.role==='Technician'); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); return T[0].name; })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        ctx = await b.new_context(viewport={"width":1440,"height":900}); pg = await ctx.new_page(); pg.set_default_timeout(6000)
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t11.html"); await pg.wait_for_timeout(1000)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()")
        me = await pg.evaluate(SIGN); await pg.wait_for_timeout(400)
        mb0 = await pg.query_selector('[data-pg="tech"] [data-a="morning"]')
        if mb0: await mb0.click(); await pg.wait_for_timeout(400)
        if not await pg.evaluate("!!__tg.runningPunch()"):
            await pg.click('[data-pg="tech"] .tch-acts [data-a="startid"]'); await pg.wait_for_timeout(400)
        T = lambda: pg.evaluate("(document.querySelector('.toast')||{}).textContent||''")
        # stop the running job, then start an assigned one from its row's clock button
        await pg.click('[data-pg="tech"] .tch-acts [data-a="stop"]'); await pg.wait_for_timeout(400); print("stop:", (await T())[:100])
        rows = await pg.query_selector_all('[data-pg="tech"] .tch-it.next'); print("assigned rows:", len(rows))
        await rows[2].click(); await pg.wait_for_timeout(300)
        ro = await pg.evaluate("__tg.CX.TU().ro")
        # stage a part on it, so Picked up shows
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{ro}'); const op=r.operations[0]; op.parts=op.parts||[]; op.parts.push({{id:'pt_t1', partNumber:'21312121', description:'Brake chamber 30/30', qty:1, status:'Staged'}}); __tg.render(); }})()"); await pg.wait_for_timeout(300)
        print("pick buttons:", await pg.evaluate("document.querySelectorAll('[data-pg=tech] [data-a=tpick]').length"))
        pb = await pg.query_selector('[data-pg="tech"] [data-a="tpick"]')
        if pb: await pb.click(); await pg.wait_for_timeout(300); print("pick:", (await T())[:100])
        # the operation's clock button starts it
        await pg.click('[data-pg="tech"] .tch-o .tch-ib'); await pg.wait_for_timeout(500); print("op clock:", (await T())[:100], "| running on", await pg.evaluate("(__tg.runningPunch()||{}).roId"), "want", ro)
        await pg.wait_for_timeout(1200)
        print("ticking:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] [data-tk=run]')].map(e=>e.textContent)"))
        await pg.screenshot(path=os.path.join(OUT, "b_started.png"))
        # ask parts popover from the op
        await pg.click('[data-pg="tech"] .tch-o.open [data-p="part"]'); await pg.wait_for_timeout(300)
        print("part pop:", await pg.evaluate("!!document.querySelector('[data-pg=tech] .tg-pop')"))
        await pg.fill('[data-pg="tech"] [data-in="part"]', "Need a second chamber, the other side is cracked."); await pg.click('[data-pg="tech"] [data-a="partsend"]'); await pg.wait_for_timeout(300); print("part send:", (await T())[:100])
        # done
        await pg.click('[data-pg="tech"] .tch-acts [data-a="done"]'); await pg.wait_for_timeout(500); print("done:", (await T())[:140])
        await pg.screenshot(path=os.path.join(OUT, "b_done.png"))
        print("groups:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-grp')].map(g=>g.textContent.trim()).join(' | ')"))
        # truck & photos and the notes on the truck
        await pg.click('[data-pg="tech"] .tch-cam'); await pg.wait_for_timeout(500); print("truck dialog:", await pg.evaluate("!!document.getElementById('trk-dlg')"))
        await pg.screenshot(path=os.path.join(OUT, "b_truck.png")); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        print("dialog closed:", await pg.evaluate("!document.getElementById('trk-dlg')"))
        # scan + clock out popovers
        await pg.click('[data-pg="tech"] [data-p="out"]'); await pg.wait_for_timeout(300); print("out pop:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tg-pop .tg-mi b')].map(x=>x.textContent).join(', ')"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        # Open RO goes to the RO page
        await pg.click('[data-pg="tech"] .tch-acts [data-a="openro"]'); await pg.wait_for_timeout(500); print("open ro ->", await pg.evaluate("[__tg.UI().view, __tg.UI().selectedRo]"))
        await pg.evaluate("(()=>{ __tg.UI().view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(300)
        # inbox note from Console still opens here
        print("ERRORS desk", errs[:6])
        # ---------- phone ----------
        ctx2 = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=1, has_touch=True, is_mobile=True); m = await ctx2.new_page(); m.set_default_timeout(6000)
        m.on("pageerror", lambda e: errs.append("PHONE " + str(e)[:300]))
        await m.route("**/fonts.g*/**", lambda r: r.abort())
        await m.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await m.goto("file://" + H + "/t11.html"); await m.wait_for_timeout(1000)
        await m.evaluate("__tg.loadSample25()"); await m.evaluate("__tg.ensureDemoTeam()"); await m.evaluate(SIGN); await m.wait_for_timeout(500)
        print("phone tabs:", await m.evaluate("[...document.querySelectorAll('.pm-tab')].map(t=>t.textContent.trim().replace(/\\d+$/,''))"), "view", await m.evaluate("__tg.UI().view"))
        await m.screenshot(path=os.path.join(OUT, "p_morning.png"))
        mb = await m.query_selector('[data-pg="tech"] [data-a="morning"]')
        if mb: await mb.click(); await m.wait_for_timeout(500)
        await m.screenshot(path=os.path.join(OUT, "p_list.png"))
        it = await m.query_selector_all('[data-pg="tech"] .tch-it'); print("phone items", len(it))
        await it[0].click(); await m.wait_for_timeout(600)
        await m.screenshot(path=os.path.join(OUT, "p_ro.png"), full_page=True)
        print("phone clipped:", await m.evaluate("[...document.querySelectorAll('[data-pg=tech] *')].filter(e=>{const r=e.getBoundingClientRect(); return r.width && (r.right>392 || r.left < -2);}).slice(0,6).map(e=>(e.className||e.tagName).toString().split(' ')[0]+':'+Math.round(e.getBoundingClientRect().right))"))
        print("ERRORS", errs[:8]); await b.close()
asyncio.run(main())
