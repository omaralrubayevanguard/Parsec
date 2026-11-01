# Parsec 14 (B) — Parts, Inventory and the Inbox strip in the shop's one status look; early check-ins; automation toasts that name the
# RO and never wipe the message you just got; the Assign pop's bar; spots by code; initials, no outside requests; the hand-typed New RO toast
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_bb.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots14b"); os.makedirs(OUT, exist_ok=True)
P = "[data-pg=parts]"
OLD = "document.querySelectorAll('.pq-st, .pst-rp:not(.pgst), .pst-om:not(.pgst), .pst-chip:not(.pgst), .ivn-pst:not(.pgst), .ivn-st:not(.pgst), .pq-low:not(.pgst)').length"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900})
        pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []; net = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        async def route(r):
            u = r.request.url
            if u.startswith(("file:", "data:", "blob:")): await r.continue_()
            else:
                if "fonts.g" not in u: net.append(u[:90])
                await r.abort()
        await pg.route("**/*", route)
        await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        t0 = await pg.evaluate("String(__tg.UI().toast||'')")
        ok(not t0.startswith("Automation"), f"nothing from an automation fires while the file opens ({t0[:60]})")
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='parts'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        # ---------- the look ----------
        ok(await pg.evaluate(OLD) == 0, "no old tinted status chips on the Parts page")
        rows = await pg.evaluate(f"[...document.querySelectorAll('{P} .tg-list .tg-it')].map(r=>[(r.querySelector('.tg-grp')||{{}}).textContent||'', (r.querySelector('.pgst')||{{}}).textContent||'', (r.querySelector('.pst-rp0')||{{}}).textContent||'', (r.querySelector('.tg-w')||{{}}).textContent||''])")
        ok(all(x[1] or x[2] for x in rows) and len(rows) > 3, f"each Needs action row says its parts stage: icon + word, or plainly ({rows[:3]})")
        bad = [x for x in rows if x[2] == 'No parts' and 'checked in' in x[3]]
        ok(not bad, f"no row says 'No parts' next to a part that's checked in ({bad[:2]})")
        ok(await pg.evaluate(f"!![...document.querySelectorAll('{P} .tg-list .pgst')].length && ![...document.querySelectorAll('{P} .tg-list .pgst')].some(x=>x.matches('.m') || x.textContent==='To order')"), "the rows' stages are read-only words — never 'To order' as a status")
        st = await pg.evaluate(f"[...document.querySelectorAll('{P} .pst-t .lb, {P} .pst-t li')].map(x=>x.textContent.trim()).filter(Boolean).slice(0,2)")
        ok(st and st[0].startswith("Not ordered"), f"the parts track's first step reads Not ordered ({st})")
        pills = await pg.evaluate(f"[...document.querySelectorAll('{P} .pq-pr:not(.h) > .pgst')].map(x=>[x.tagName, x.classList.contains('m'), x.dataset.st, x.textContent])")
        ok(pills and all(x[0] == 'BUTTON' and x[1] for x in pills), f"the parts table's status is the pill with ▾ — it changes the part ({pills[:3]})")
        await pg.click(f"{P} .pq-pr:not(.h) > .pgst.m"); await pg.wait_for_timeout(300)
        mi = await pg.evaluate(f"[...document.querySelectorAll('{P} .tg-pop [data-a=setst]')].map(b=>(b.querySelector('.pgst')||{{}}).textContent||'')")
        ok(mi[:2] == ["Not ordered", "Ordered"] and len(mi) == 7, f"its menu lists each status with its icon ({mi})")
        await pg.keyboard.press("Escape"); await pg.evaluate("(()=>{ __tg.render(); })()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "b1_parts.png"))
        # every view
        await pg.evaluate("(()=>{ const S=__tg.STATE(); S.returns=S.returns||[]; S.returns.push({ id:'C-2001', kind:'core', st:'ship', desc:'Starter core', pn:'CORE-1', qty:1, credit:85, to:'Volvo PDC', why:'Core', shelf:'K1', by:'2026-11-20', at:new Date().toISOString() }); __tg.render(); })()")
        for v in ["order", "shelf", "ret", "cat"]:
            await pg.click(f"{P} .tg-views [data-v={v}]"); await pg.wait_for_timeout(500)
            n_old = await pg.evaluate(OLD); n_new = await pg.evaluate(f"document.querySelectorAll('{P} .pgst').length")
            n_rows = await pg.evaluate(f"document.querySelectorAll('{P} .pq-or:not(.h), {P} .pq-pkr, {P} .pq-rr:not(.h)').length")
            ok(n_old == 0 and n_new >= n_rows, f"{v}: statuses in the one look ({n_new} for {n_rows} rows, old {n_old})")
            await pg.screenshot(path=os.path.join(OUT, f"b2_{v}.png"))
        await pg.click(f"{P} .tg-views [data-v=desk]"); await pg.wait_for_timeout(400)
        # ---------- #5: a part that came early ----------
        e = await pg.evaluate("""(()=>{ const S=__tg.STATE(), d=new Date(); d.setDate(d.getDate()+4); const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
          const ro=S.ros.find(r=>!r.dateClosed && !r.shop && r.operations.some(o=>(o.parts||[]).length)); const op=ro.operations.find(o=>(o.parts||[]).length); const pt=op.parts[0];
          pt.status='Ordered'; pt.eta=k; pt.partNumber='EARLY-55120'; pt.sup='pdc'; pt.statusChangedAt=new Date().toISOString(); __tg.render(); return { id: pt.id, ro: ro.id }; })()""")
        await pg.evaluate("(()=>{ __tg.UI().view='parts'; __tg.render(); })()"); await pg.wait_for_timeout(400)
        await pg.click(f"{P} .pq-cb"); await pg.wait_for_timeout(400)
        lh = await pg.evaluate(f"[...document.querySelectorAll('{P} .tg-pop .pq-lh')].map(x=>x.textContent)")
        ok(any("Not due yet" in x for x in lh), f"Check in lists the orders not due yet, folded ({lh})")
        await pg.fill(f"{P} [data-in=scan]", "EARLY-55120"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        r5 = await pg.evaluate(f"""(()=>{{ const l=document.querySelector('{P} .tg-pop [data-pid="{e['id']}"]'); return [!!l, l ? l.querySelector('input').checked : null, l ? l.innerText : '', String(__tg.UI().toast||'')]; }})()""")
        ok(r5[0] and r5[1] and "early" in r5[2] and "early" in r5[3], f"a scan finds a part that came early, ticks it and says so ({r5[2][:80]} · {r5[3][:60]})")
        await pg.screenshot(path=os.path.join(OUT, "b3_early.png"))
        await pg.click(f"{P} .tg-pop [data-a=cmode][data-v=slip]"); await pg.wait_for_timeout(200)
        await pg.fill(f"{P} [data-in=slip]", "EARLY-55120  Water pump  QTY 1"); await pg.wait_for_timeout(400)
        sl = await pg.evaluate(f"(document.querySelector('{P} .pq-slr')||{{}}).innerText||''")
        ok("1 of 1" in sl and "early" in sl, f"the packing slip matches it too ({sl[:90]})")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        # ---------- #10: a technician sees the parts desk, read only ----------
        tech = await pg.evaluate("(()=>{ const t=__tg.staffList().find(s=>s.role==='Technician'); localStorage.setItem('tec_viewas', t.id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='parts'; __tg.render(); return t.name; })()"); await pg.wait_for_timeout(700)
        await pg.evaluate("(()=>{ __tg.UI().view='parts'; __tg.render(); })()"); await pg.wait_for_timeout(500)
        tv = await pg.evaluate(f"""(()=>({{ view: __tg.UI().view, pills: document.querySelectorAll('{P} .pgst.m').length, read: document.querySelectorAll('{P} .pq-pr:not(.h) > .pgst').length, chk: !!document.querySelector('{P} .pq-cb'),
          go: [...document.querySelectorAll('{P} .tg-list .tg-go')].map(b=>b.textContent.trim()).filter(t=>/Order|Chase|Stage|Send|Handle|Accept/.test(t)), next: [...document.querySelectorAll('{P} .tg-next button')].length,
          rowbtn: [...document.querySelectorAll('{P} .pq-pr .ac button')].length }}))()""")
        ok(tv["view"] == "parts" and tv["pills"] == 0 and tv["read"] > 0 and not tv["chk"] and not tv["go"] and tv["next"] == 0 and tv["rowbtn"] == 0, f"{tech}: statuses read-only, no Check in, Order…, Chase… or row buttons ({tv})")
        await pg.screenshot(path=os.path.join(OUT, "b4_tech.png"))
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); __tg.pxSignedIn(); __tg.UI().view='parts'; __tg.render(); })()"); await pg.wait_for_timeout(500)
        # ---------- Inventory ----------
        await pg.evaluate("(()=>{ __tg.UI().view='inventory'; __tg.render(); })()"); await pg.wait_for_timeout(700)
        await pg.evaluate("(()=>{ const r=document.querySelector('[data-pg=inventory] [data-a=sel]'); if(r) r.click(); })()"); await pg.wait_for_timeout(500)
        iv = await pg.evaluate(f"[{OLD}, document.querySelectorAll('[data-pg=inventory] .pgst').length]")
        ok(iv[0] == 0 and iv[1] > 0, f"Inventory: stock and part statuses in the one look ({iv})")
        await pg.screenshot(path=os.path.join(OUT, "b5_inventory.png"))
        # ---------- #7: automation toasts ----------
        await pg.evaluate("(()=>{ __tg.UI().view='rolist'; __tg.render(); })()"); await pg.wait_for_timeout(2600)
        PREP7 = """((tag)=>{ const S=__tg.STATE(); const ro=S.ros.find(r=>!r.dateClosed && !r.shop && r.id!=='shop' && r.operations.length && !/^Complete/.test((r.status||{}).status||'') && !r.operations.some(o=>/^Complete/.test(((o.jobStatus||{}).status)||'')));
          ro.status={ status:'Working', setAt:new Date(Date.now()-86400000).toISOString() }; ro.operations.forEach(o=>{ o.declined=false; o.jobStatus={ status:'Working', setAt:new Date(Date.now()-86400000).toISOString() }; }); __tg.autoFlush(); return { id: ro.id, no: __tg.tgNum(ro) }; })()"""
        r7 = await pg.evaluate(PREP7)
        await pg.wait_for_timeout(3300)
        await pg.evaluate("(()=>{ __tg.pushToast('Not complete yet — 3 parts not installed. Stopped as Hold Tech.'); })()")
        await pg.evaluate(f"""(()=>{{ const ro=__tg.STATE().ros.find(r=>r.id==='{r7['id']}'); ro.operations.forEach(o=>{{ o.jobStatus={{ status:'Waiting – Parts', setAt:new Date().toISOString() }}; }}); __tg.autoFlush(); }})()"""); await pg.wait_for_timeout(300)
        t7 = await pg.evaluate("String(__tg.UI().toast||'')")
        ok(t7.startswith("Not complete yet") and ("RO " + r7["no"] + " →") in t7, f"an automation right after a message is added to it, naming the RO ({t7[:120]})")
        await pg.wait_for_timeout(3300)
        await pg.evaluate(f"""(()=>{{ const ro=__tg.STATE().ros.find(r=>r.id==='{r7['id']}'); ro.operations.forEach(o=>{{ o.jobStatus={{ status:'Working', setAt:new Date().toISOString() }}; }}); __tg.autoFlush(); }})()"""); await pg.wait_for_timeout(300)
        t8 = await pg.evaluate("String(__tg.UI().toast||'')")
        ok(t8.startswith("Automation · RO " + r7["no"] + " →"), f"on its own it says which RO ({t8[:90]})")
        ok("→ Hold tech" in await pg.evaluate("__tg.v14ActTxt({ id:'x', roNumber:'RO-8877', operations:[] }, { a:'roStatus', v:'Hold Tech' })"), "the status reads in the shop's words (Hold tech)")
        # ---------- #15: the Assign pop's bar ----------
        cap = await pg.evaluate("(()=>{ const t=__tg.staffList().find(s=>s.role==='Technician'); const ro=__tg.STATE().ros.find(r=>!r.dateClosed && !r.shop && r.operations.length); const d=document.createElement('div'); d.innerHTML=__tg.v10TechCap(t.name, ro); return d.textContent; })()")
        ok("this job" in cap and " / " not in cap, f"Assign: the bar says what this job adds, not a second 'free' number ({cap})")
        # ---------- #14: spots by their code ----------
        sp = await pg.evaluate("['UpTime 2','UP','uptime bay','B4','Bay 4','AW2','W3','T2','D6','Offsite'].map(x=>__tg.spotOf(x))")
        ok(sp[:3] == ["UpTime"] * 3 and sp[3] == "Lot B4" and sp[4] == "Bay 4" and sp[5] == "Awning 2" and sp[6] == "Ready 3" and sp[7] == "Triage 2" and sp[8] == "Lot D6" and sp[9] is None, f"an imported or typed location finds its spot ({sp})")
        # ---------- #16: nothing from outside ----------
        ok(await pg.evaluate("document.querySelectorAll('img[src*=\"randomuser\"]').length") == 0, "no stock portraits")
        av = await pg.evaluate("(()=>{ const s=__tg.staffList().find(x=>x.av) || __tg.staffList()[0]; return __tg.staffAvHtml(Object.assign({}, s, { photo: '' }), 'x'); })()")
        ok("<svg" not in av and "<img" not in av and "ini" in av, f"people show their initials ({av[:80]})")
        am = await pg.evaluate("typeof __tg.asstCallAPI")   # Parsec 16.1: the hidden chat panel is gone altogether
        ok(am == "undefined", f"nothing is left that could send anything ({am})")
        # ---------- #13: a New RO typed by hand ----------
        await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(400)
        await pg.fill('#imp-dlg [data-ixf="roNumber"]', "RO0099123"); await pg.fill('#imp-dlg [data-ixf="customerName"]', "Typed Hauling Co"); await pg.wait_for_timeout(300)
        await pg.click('#imp-dlg [data-ix="apply"]'); await pg.wait_for_timeout(900)
        t13 = await pg.evaluate("String(__tg.UI().toast||'')")
        ok(t13.startswith("Created RO") and "ASIST" not in t13 and "typed" not in t13, f"a hand-typed New RO: 'Created RO …' ({t13})")
        # ---------- dark, phone ----------
        await pg.evaluate("(()=>{ document.documentElement.setAttribute('data-theme','ivd'); __tg.UI().view='parts'; __tg.render(); })()"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, "b6_dark.png"))
        await pg.evaluate("document.documentElement.removeAttribute('data-theme')")
        ok(not net, f"no requests leave the computer, except the fonts ({net[:3]})")
        print("ERRORS", errs[:5]); ok(not errs, "no console errors: " + "; ".join(errs[:3]))
        await b.close()
        # phone
        b2 = await p.chromium.launch(); c2 = await b2.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        p2 = await c2.new_page(); e2 = []; p2.on("pageerror", lambda e: e2.append(str(e)[:200]))
        await p2.route("**/fonts.g*/**", lambda r: r.abort())
        await p2.goto("file://" + H + "/" + PAGE); await p2.wait_for_timeout(1200)
        await p2.evaluate("__tg.loadSample25()"); await p2.evaluate("__tg.ensureDemoTeam()")
        await p2.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='parts'; __tg.render(); })()"); await p2.wait_for_timeout(900)
        await p2.screenshot(path=os.path.join(OUT, "b7_phone.png"))
        ok(await p2.evaluate(OLD) == 0, "phone: the one look too")
        ok(not e2, "phone: no console errors " + "; ".join(e2[:2]))
        await b2.close()
    print("FAILS:", len(FAILS), FAILS)
asyncio.run(main())
