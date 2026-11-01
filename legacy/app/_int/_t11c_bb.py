import asyncio, os, sys
from playwright.async_api import async_playwright
H = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app"; OUT = os.path.join(H, "shots11")
IMG = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/pump.png"
SIGN = """(()=>{ const T=__tg.staffList().filter(s=>s.role==='Technician'); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.CX.U().skipMorning = __tg.todayStr(); __tg.render(); return T[0].name; })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        ctx = await b.new_context(viewport={"width":1440,"height":900}); pg = await ctx.new_page(); pg.set_default_timeout(6000)
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t12_bb.html"); await pg.wait_for_timeout(1000)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.evaluate(SIGN); await pg.wait_for_timeout(500)
        T = lambda: pg.evaluate("(document.querySelector('.toast')||{}).textContent||''")
        print("blocks:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] [class*=tch-k-]')].map(e=>[...e.classList].find(c=>c.startsWith('tch-k-')).slice(6)).join(' ')"))
        print("mid/right:", await pg.evaluate("[document.querySelectorAll('[data-pg=tech] .tch-cm > [class*=tch-k-]').length, document.querySelectorAll('[data-pg=tech] .tch-cr > [class*=tch-k-]').length]"))
        print("time tab:", await pg.evaluate("[document.querySelectorAll('[data-pg=tech] .tch-tp').length, document.querySelectorAll('[data-pg=tech] .tch-tp .tch-tn:not(.none)').length, document.querySelectorAll('[data-pg=tech] .tch-tn.solo').length]"))
        # a fault code
        await pg.fill('[data-pg="tech"] [data-in="tdtc"]', "3226/2"); await pg.press('[data-pg="tech"] [data-in="tdtc"]', "Enter"); await pg.wait_for_timeout(300)
        print("code:", (await T())[:80], "| rows", await pg.evaluate("document.querySelectorAll('[data-pg=tech] .tch-dc').length"), "chips", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-chip')].map(c=>c.textContent).join(', ')"))
        await pg.fill('[data-pg="tech"] [data-in="tdtc"]', "hello"); await pg.press('[data-pg="tech"] [data-in="tdtc"]', "Enter"); await pg.wait_for_timeout(200); print("bad code:", (await T())[:80])
        # a note on the RO
        await pg.fill('[data-pg="tech"] [data-in="tact"]', "customer says it slips worse when loaded"); await pg.press('[data-pg="tech"] [data-in="tact"]', "Enter"); await pg.wait_for_timeout(300)
        print("note:", (await T())[:60], "| quoted:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-ev q')].map(q=>q.textContent).slice(-1)"), "focus:", await pg.evaluate("document.activeElement.dataset.in"))
        # a message
        print("to:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-to button')].map(b=>b.textContent).join(', ')"))
        tos = await pg.query_selector_all('[data-pg="tech"] .tch-to button')
        if len(tos) > 1: await tos[1].click(); await pg.wait_for_timeout(200)
        await pg.fill('[data-pg="tech"] [data-in="tmsg"]', "Is the clutch kit here yet?"); await pg.press('[data-pg="tech"] [data-in="tmsg"]', "Enter"); await pg.wait_for_timeout(300)
        print("msg:", (await T())[:80], "| rows", await pg.evaluate("document.querySelectorAll('[data-pg=tech] .tch-ms').length"))
        await pg.screenshot(path=os.path.join(OUT, "c_blocks1.png"))
        # fold Vehicle
        await pg.click('[data-pg="tech"] [data-a="tgrp"][data-k="vehicle"]'); await pg.wait_for_timeout(200); print("vehicle shut:", await pg.evaluate("document.querySelector('[data-pg=tech] .tch-k-vehicle').classList.contains('shut')"))
        # parts and files tabs
        await pg.click('[data-pg="tech"] .tch-o.open [data-a="ttab"][data-v="parts"]'); await pg.wait_for_timeout(200); print("parts tab rows:", await pg.evaluate("document.querySelectorAll('[data-pg=tech] .tch-o.open .tch-tp0 .cq-pr').length"))
        await pg.click('[data-pg="tech"] .tch-o.open [data-a="ttab"][data-v="files"]'); await pg.wait_for_timeout(200)
        async with pg.expect_file_chooser() as fc:
            await pg.click('[data-pg="tech"] .tch-o.open [data-a="tfile"]')
        ch = await fc.value; await ch.set_files(IMG); await pg.wait_for_timeout(1200)
        print("file:", (await T())[:80], "| files", await pg.evaluate("document.querySelectorAll('[data-pg=tech] .tch-fl').length"))
        f = await pg.query_selector('[data-pg="tech"] .tch-fl')
        if f: await f.click(); await pg.wait_for_timeout(600); print("preview:", await pg.evaluate("!!document.querySelector('.tch-lb img')")); await pg.screenshot(path=os.path.join(OUT, "c_preview.png")); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200); print("closed:", await pg.evaluate("!document.querySelector('.tch-lb')"))
        await pg.click('[data-pg="tech"] .tch-o.open [data-a="ttab"][data-v="time"]'); await pg.wait_for_timeout(200)
        # past fix popover
        fx = await pg.query_selector('[data-pg="tech"] .tch-chip.pf')
        if fx: await fx.click(); await pg.wait_for_timeout(300); print("fix pop:", await pg.evaluate("!!document.querySelector('[data-pg=tech] .tch-fixp')")); await pg.screenshot(path=os.path.join(OUT, "c_fix.png")); await pg.keyboard.press("Escape")
        # scroll the pane to see the lower blocks
        await pg.evaluate("document.querySelector('[data-pg=tech] .mq-pane').scrollTop = 900"); await pg.wait_for_timeout(200); await pg.screenshot(path=os.path.join(OUT, "c_blocks2.png"))
        await pg.evaluate("document.querySelector('[data-pg=tech] .mq-pane').scrollTop = 2000"); await pg.wait_for_timeout(200); await pg.screenshot(path=os.path.join(OUT, "c_blocks3.png"))
        # an RO with two or more operations
        n = await pg.evaluate("(()=>{ const L=__tg.CX.tcRos().filter(r=>(r.ro.operations||[]).length>1); return L.length ? L[0].id : null; })()")
        print("multi-op ro:", n)
        if n:
            await pg.click(f'[data-pg="tech"] .tch-it[data-id="{n}"]'); await pg.wait_for_timeout(300); await pg.click('[data-pg="tech"] [data-a="tall"]'); await pg.wait_for_timeout(300)
            await pg.screenshot(path=os.path.join(OUT, "c_multi.png"))
        for th in ["vvd", "vvl"]:
            await pg.evaluate(f"__tg.applyTheme('{th}')"); await pg.wait_for_timeout(250); await pg.evaluate("document.querySelector('[data-pg=tech] .mq-pane').scrollTop = 0"); await pg.screenshot(path=os.path.join(OUT, f"c_th_{th}.png"))
        await pg.evaluate("__tg.applyTheme('ivl')")
        # narrower window
        await pg.set_viewport_size({"width":1180,"height":820}); await pg.wait_for_timeout(400); await pg.screenshot(path=os.path.join(OUT, "c_1180.png"))
        print("ERRORS desk", errs[:6])
        ctx2 = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=1, has_touch=True, is_mobile=True); m = await ctx2.new_page(); m.set_default_timeout(6000)
        m.on("pageerror", lambda e: errs.append("PHONE " + str(e)[:300]))
        await m.route("**/fonts.g*/**", lambda r: r.abort()); await m.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await m.goto("file://" + H + "/t12_bb.html"); await m.wait_for_timeout(1000)
        await m.evaluate("__tg.loadSample25()"); await m.evaluate("__tg.ensureDemoTeam()"); await m.evaluate(SIGN); await m.wait_for_timeout(500)
        it = await m.query_selector_all('[data-pg="tech"] .tch-it'); await it[0].click(); await m.wait_for_timeout(600)
        await m.screenshot(path=os.path.join(OUT, "c_phone.png"), full_page=True)
        print("phone clipped:", await m.evaluate("[...document.querySelectorAll('[data-pg=tech] *')].filter(e=>{const r=e.getBoundingClientRect(); return r.width && (r.right>392 || r.left < -2);}).slice(0,6).map(e=>(e.className||e.tagName).toString().split(' ')[0]+':'+Math.round(e.getBoundingClientRect().right))"))
        print("phone order:", await m.evaluate("[...document.querySelectorAll('[data-pg=tech] [class*=tch-k-]')].map(e=>({k:[...e.classList].find(c=>c.startsWith('tch-k-')).slice(6), y:Math.round(e.getBoundingClientRect().top)})).sort((a,b)=>a.y-b.y).map(x=>x.k).join(' ')"))
        print("ERRORS", errs[:8]); await b.close()
asyncio.run(main())
