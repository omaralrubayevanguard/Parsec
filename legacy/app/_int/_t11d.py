import asyncio, os, sys
from playwright.async_api import async_playwright
H = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app"; OUT = os.path.join(H, "shots11")
SIGN = """(()=>{ const T=__tg.staffList().filter(s=>s.role==='Technician'); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.CX.U().skipMorning = __tg.todayStr(); __tg.render(); return T[0].name; })()"""
# give the selected RO two more operations, with parts, so there's something to pick
ADD = """(()=>{ const ro=__tg.getRO(__tg.CX.TU().ro), base=ro.operations[0]; const mk=(c,q,parts)=>{ const o=JSON.parse(JSON.stringify(base)); o.id='op_t'+Math.random().toString(36).slice(2,8); o.complaint=c; o.quoted=q; delete o.jobStatus; delete o.log; delete o.offNotes; delete o.faults; delete o.claim; delete o.appr; o.burnt=0; o.parts=parts.map((p,i)=>({id:'pt_t'+Math.random().toString(36).slice(2,8), description:p[0], partNumber:p[1], qty:p[2], status:p[3]})); return o; };
  ro.operations.push(mk('Check exhaust leak at turbo flange',1.0,[])); ro.operations.push(mk('PM service — A',1.5,[['Oil filter','21707134',1,'Staged'],['Fuel filter','23658092',1,'Staged'],['Engine oil 15W-40','VDS-4.5',10,'Received']])); __tg.render(); return ro.operations.length; })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        ctx = await b.new_context(viewport={"width":1440,"height":900}); await ctx.grant_permissions(["clipboard-read","clipboard-write"])
        pg = await ctx.new_page(); pg.set_default_timeout(6000)
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1000)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.evaluate(SIGN); await pg.wait_for_timeout(500)
        print("ops now:", await pg.evaluate(ADD)); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ window.__papers=[]; __tg.PG.printPaper=(el,t)=>{ window.__papers.push(__tg.PG.paperDoc(el,t)); }; })()")
        T = lambda: pg.evaluate("(document.querySelector('.toast')||{}).textContent||''")
        G = lambda: pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-grp')].map(g=>g.textContent.trim()).join(' | ')")
        print("boxes:", await pg.evaluate("[document.querySelectorAll('[data-pg=tech] .tch-oh > .tch-cb').length, getComputedStyle(document.querySelector('[data-pg=tech] .tch-oh > .tch-cb')).opacity]"))
        await pg.hover('[data-pg="tech"] .tch-o:nth-child(2) .tch-ot'); await pg.wait_for_timeout(200)
        print("hover shows:", await pg.evaluate("getComputedStyle(document.querySelectorAll('[data-pg=tech] .tch-oh > .tch-cb')[1]).opacity"))
        await pg.screenshot(path=os.path.join(OUT, "d_hover.png"))
        # Ctrl click op 2, Shift click op 3
        ots = await pg.query_selector_all('[data-pg="tech"] .tch-ot')
        await ots[1].click(modifiers=["Control"]); await pg.wait_for_timeout(200); await ots[2].click(modifiers=["Shift"]); await pg.wait_for_timeout(250)
        print("picked:", await pg.evaluate("Object.keys(__tg.CX.TU().selO).length"), "| bar:", await pg.evaluate("(document.querySelector('[data-pg=tech] .tch-sb .bi')||{}).textContent"), "| buttons:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-sb .btn')].map(b=>b.textContent.trim()+(b.disabled?'(off)':'')).join(', ')"))
        await pg.screenshot(path=os.path.join(OUT, "d_ops_sel.png"))
        # note on all
        await pg.click('[data-pg="tech"] .tch-sb [data-v="note"]'); await pg.wait_for_timeout(250); await pg.screenshot(path=os.path.join(OUT, "d_note_pop.png"))
        await pg.keyboard.type("Checked both before lunch."); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300); print("note:", (await T())[:80])
        # hold two
        await ots[1].click(modifiers=["Control"]) if False else None
        ots = await pg.query_selector_all('[data-pg="tech"] .tch-ot'); await ots[1].click(modifiers=["Control"]); await ots[2].click(modifiers=["Control"]); await pg.wait_for_timeout(200)
        await pg.click('[data-pg="tech"] .tch-sb [data-v="hold"]'); await pg.wait_for_timeout(250); await pg.screenshot(path=os.path.join(OUT, "d_hold_pop.png"))
        await pg.click('[data-pg="tech"] .tg-pop [data-v="hold"][data-st="Waiting – Approval"]'); await pg.wait_for_timeout(300); print("hold:", (await T())[:110]); print("ops sub:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-oc small')].map(s=>s.textContent).join(' | ')"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
        # add a code to all three
        await pg.click('[data-pg="tech"] [data-a="tckall"][data-k="o"]'); await pg.wait_for_timeout(200); print("all:", await pg.evaluate("Object.keys(__tg.CX.TU().selO).length"))
        await pg.click('[data-pg="tech"] .tch-sb [data-v="code"]'); await pg.wait_for_timeout(200); await pg.keyboard.type("P0401"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300); print("code:", (await T())[:80])
        # mark done, print, copy
        await pg.click('[data-pg="tech"] [data-a="tckall"][data-k="o"]'); await pg.wait_for_timeout(150)
        await pg.click('[data-pg="tech"] .tch-sb [data-v="print"]'); await pg.wait_for_timeout(200); print("jacket:", await pg.evaluate("window.__papers.length"), await pg.evaluate("(window.__papers[0]||'').length"))
        await pg.click('[data-pg="tech"] .tch-sb [data-v="story"]'); await pg.wait_for_timeout(300); print("story:", (await T())[:80], "| clip:", (await pg.evaluate("navigator.clipboard.readText()"))[:120].replace("\n"," / "))
        await pg.click('[data-pg="tech"] .tch-sb [data-v="done"]'); await pg.wait_for_timeout(300); print("done:", (await T())[:160])
        # parts on op 3
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(200)
        ots = await pg.query_selector_all('[data-pg="tech"] .tch-ot'); await ots[0].click(); await pg.wait_for_timeout(150); await ots[2].click(); await pg.wait_for_timeout(250)
        await pg.click('[data-pg="tech"] .tch-o.open [data-a="ttab"][data-v="parts"]'); await pg.wait_for_timeout(200)
        cks = await pg.query_selector_all('[data-pg="tech"] .tch-o.open .tch-prw > .tch-cb'); print("part boxes:", len(cks))
        await cks[0].click(); await cks[2].click(modifiers=["Shift"]); await pg.wait_for_timeout(200)
        print("parts bar:", await pg.evaluate("(document.querySelector('[data-pg=tech] .tch-sb .bi')||{}).textContent"), "|", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-sb .btn')].map(b=>b.textContent.trim()+(b.disabled?'(off)':'')).join(', ')"))
        await pg.screenshot(path=os.path.join(OUT, "d_parts_sel.png"))
        await pg.click('[data-pg="tech"] .tch-sb [data-v="plist"]'); await pg.wait_for_timeout(200); print("pick list papers:", await pg.evaluate("window.__papers.length"))
        await pg.click('[data-pg="tech"] .tch-sb [data-v="ppns"]'); await pg.wait_for_timeout(300); print("pns:", (await pg.evaluate("navigator.clipboard.readText()")).replace("\t"," ").replace("\n"," / ")[:120])
        await pg.click('[data-pg="tech"] .tch-sb [data-v="ppick"]'); await pg.wait_for_timeout(300); print("pick:", (await T())[:100])
        cks = await pg.query_selector_all('[data-pg="tech"] .tch-o.open .tch-prw > .tch-cb'); await cks[0].click(); await pg.wait_for_timeout(150)
        await pg.click('[data-pg="tech"] .tch-sb [data-v="pmove"]'); await pg.wait_for_timeout(200); await pg.screenshot(path=os.path.join(OUT, "d_move_pop.png"))
        await pg.click('[data-pg="tech"] .tg-pop [data-v="move"]'); await pg.wait_for_timeout(300); print("move:", (await T())[:80])
        # ask parts from parts
        cks = await pg.query_selector_all('[data-pg="tech"] .tch-o.open .tch-prw > .tch-cb')
        if cks:
            await cks[0].click(); await pg.wait_for_timeout(150); await pg.click('[data-pg="tech"] .tch-sb [data-v="pask"]'); await pg.wait_for_timeout(200)
            await pg.keyboard.type("Need two of these."); await pg.click('[data-pg="tech"] .tg-pop [data-v="ask"]'); await pg.wait_for_timeout(300); print("ask:", (await T())[:80])
        # the printed jacket, as a page
        html = await pg.evaluate("window.__papers[0]")
        q = await ctx.new_page(); await q.set_content(html); await q.wait_for_timeout(300); await q.screenshot(path=os.path.join(OUT, "d_jacket.png"), full_page=True)
        html2 = await pg.evaluate("window.__papers[1]"); await q.set_content(html2); await q.wait_for_timeout(200); await q.screenshot(path=os.path.join(OUT, "d_picklist.png"), full_page=True)
        print("ERRORS desk", errs[:6])
        ctx2 = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=1, has_touch=True, is_mobile=True); m = await ctx2.new_page(); m.set_default_timeout(6000)
        m.on("pageerror", lambda e: errs.append("PHONE " + str(e)[:300]))
        await m.route("**/fonts.g*/**", lambda r: r.abort()); await m.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await m.goto("file://" + H + "/t12.html"); await m.wait_for_timeout(1000)
        await m.evaluate("__tg.loadSample25()"); await m.evaluate("__tg.ensureDemoTeam()"); await m.evaluate(SIGN); await m.wait_for_timeout(400)
        it = await m.query_selector_all('[data-pg="tech"] .tch-it'); await it[0].click(); await m.wait_for_timeout(500); await m.evaluate(ADD); await m.wait_for_timeout(300)
        await m.click('[data-pg="tech"] .tch-oh > .tch-cb'); await m.wait_for_timeout(300)
        print("phone box opacity:", await m.evaluate("getComputedStyle(document.querySelectorAll('[data-pg=tech] .tch-oh > .tch-cb')[1]).opacity"))
        await m.screenshot(path=os.path.join(OUT, "d_phone.png"))
        print("ERRORS", errs[:8]); await b.close()
asyncio.run(main())
