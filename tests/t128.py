# Parsec 12.8 — a completed operation opens back up: its status and its clock
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
def GIVE(sid, acts=("ro.status", "ro.release", "ro.reopen")): return "(()=>{ const sf=__tg.staffList().find(s=>s.id===" + json.dumps(sid) + "); if(sf && __tg.permSet) " + json.dumps(list(acts)) + ".forEach(k=>__tg.permSet(sf,'acts',k,true)); })()"   # Parsec 13: the person doing it may
OUT = os.path.join(H, "shots128"); os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        X = await pg.evaluate(PREP); A, An, B, Bn, ro, a, bo = X["A"], X["An"], X["B"], X["Bn"], X["ro"], X["a"], X["b"]
        await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); r.operations.forEach(o=>(o.parts||[]).forEach(x=>{{ x.status='Installed'; }})); r.assignedTech={json.dumps(An)}; }})()")
        await pg.evaluate(SIGN(A)); await pg.evaluate(GIVE(A))
        OP = f"__tg.STATE().ros.find(r=>r.id==='{ro}').operations.find(o=>o.id==='{a}')"
        DONE = f"__tg.opDoneNow({OP})"
        async def complete():
            await pg.evaluate(f"__tg.doStartPunch('{ro}', '{a}', 'Repairing')"); await pg.wait_for_timeout(150)
            await pg.evaluate("__tg.doStopPunch('Complete')"); await pg.wait_for_timeout(200)
            return await pg.evaluate(DONE)
        ok(await complete(), "op A is complete")
        # 1. the RO page: the check is a button, Reopen is beside the Done badge
        c = await ro_card(pg, ro, a)
        r = await pg.evaluate(J(f"const c=R.querySelector('.ock[data-op=\"{a}\"]'); const g=c.querySelector('button.ock-ck.reo[data-ock=go]'); return [c.dataset.mode, !!g, g && g.title, !!c.querySelector('.ock-reb[data-ock=reo]')]"))
        ok(r[0] == "done" and r[1] and "reopen" in (r[2] or "") and r[3], f"RO page: done card — the check is a button, Reopen beside it ({r})")
        await pg.evaluate(J(f"R.querySelector('.ock[data-op=\"{a}\"] button.ock-ck.reo').scrollIntoView({{block:'center'}})")); await pg.wait_for_timeout(200)
        g = await pg.evaluate(J(f"const r=R.querySelector('.ock[data-op=\"{a}\"] button.ock-ck.reo').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]"))
        await pg.mouse.move(g[0], g[1]); await pg.wait_for_timeout(300)
        hv = await pg.evaluate(J(f"const c=R.querySelector('.ock[data-op=\"{a}\"]'); return [getComputedStyle(c.querySelector('button.ock-ck.reo .pl')).opacity, getComputedStyle(c.querySelector('.ock-hint'), '::before').content]"))
        ok(hv[0] == "1" and "Start again" in hv[1], f"pointing at the check turns it into Start ({hv})")
        await pg.screenshot(path=os.path.join(OUT, "t1_ro_done_hover.png"))
        await pg.mouse.move(5, 5)
        # 2. Reopen: back to Hold tech, the clock stays off, on the record
        await pg.evaluate(J(f"R.querySelector('.ock[data-op=\"{a}\"] .ock-reb').click()")); await pg.wait_for_timeout(500)
        r = await pg.evaluate(f"(()=>{{ const o={OP}; const S=__tg.STATE(); const L=(S.auditLog||S.audit||[]); return [__tg.opDoneNow(o), (o.reopened||[]).length, o.jobStatus && o.jobStatus.status, S.punches.filter(p=>!p.stop).length, (L[L.length-1]||{{}}).type, __tg.UI().toast||'']; }})()")
        ok(r[0] is False and r[1] == 1 and r[2] == "Hold Tech" and r[3] == 0 and r[4] in ("reopen", "status"), f"Reopen: Hold tech, no clock, on the record ({r[:5]})")
        ok("reopened" in r[5], "…and says so: " + r[5])
        c = await ro_card(pg, ro, a)
        r = await pg.evaluate(J(f"const c=R.querySelector('.ock[data-op=\"{a}\"]'); return [c.dataset.mode, !!c.querySelector('.ock-pb[data-ock=go]:not(.on)'), (c.querySelector('.ock-reod')||{{}}).textContent || '', R.querySelector('.px-row[data-op=\"{a}\"] .rop-st').textContent]"))
        ok(r[0] == "idle" and r[1] and "Reopened" in r[2] and "Hold" in r[3], f"the card can start again and says Reopened ({r})")
        await pg.screenshot(path=os.path.join(OUT, "t2_ro_reopened.png"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(400)
        r = await pg.evaluate(f"(()=>{{ const o={OP}; return [__tg.opDoneNow(o), (o.reopened||[]).length]; }})()")
        ok(r == [True, 0], f"Undo puts it back to Complete ({r})")
        # 3. the check: reopens and starts my clock
        c = await ro_card(pg, ro, a)
        await pg.evaluate(J(f"R.querySelector('.ock[data-op=\"{a}\"] button.ock-ck.reo').click()")); await pg.wait_for_timeout(600)
        r = await pg.evaluate(f"(()=>{{ const o={OP}; return [__tg.opDoneNow(o), (o.reopened||[]).length, __tg.STATE().punches.filter(p=>!p.stop).map(p=>[p.by,p.opId])]; }})()")
        t = await pg.evaluate(J("return (R.getElementById('toast')||{}).textContent || ''"))
        ok(r[0] is False and r[1] == 1 and r[2] == [[An, a]], f"the check reopens it and starts Mike's clock ({r})")
        ok("reopened" in t, "…the RO page says so: " + t)
        await pg.screenshot(path=os.path.join(OUT, "t3_ro_started.png"))
        await pg.evaluate("__tg.doStopPunch('Switched job')"); await pg.wait_for_timeout(200)
        r = await pg.evaluate(f"(()=>{{ const o={OP}; return [__tg.opDoneNow(o)]; }})()")
        ok(r == [False], "stopped as Switched job, it stays open")
        # 4. the RO page's status pill: Complete → Waiting – Customer reopens it
        ok(await complete(), "complete again")
        c = await ro_card(pg, ro, a)
        await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{a}\"] .rop-st').click()")); await pg.wait_for_timeout(300)
        await pg.evaluate(J("const b=[...R.querySelectorAll('.rop-stpop [role=menuitem], .rop-stpop button')].find(x=>/Waiting . Customer/i.test(x.textContent)); b.click()")); await pg.wait_for_timeout(500)
        r = await pg.evaluate(f"(()=>{{ const o={OP}; return [__tg.opDoneNow(o), (o.reopened||[]).length, o.jobStatus.status]; }})()")
        t = await pg.evaluate(J("return (R.getElementById('toast')||{}).textContent || ''"))
        ok(r[0] is False and r[1] == 2 and r[2] == "Waiting – Customer", f"the status pill reopens it to Waiting – Customer ({r})")
        ok("reopened" in t, "…and says reopened: " + t)
        JTX = "(()=>{ const h=document.querySelector('[data-pg=tech] .jc-host'); const R=h&&h.shadowRoot; if(!R) return null; %s })()"
        # 5. the Technician page (Parsec 14.3: its middle is the RO page itself): the operation's pill reopens a completed operation there too
        await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); const o=r.operations.find(o=>o.id==='{bo}'); o.jobStatus={{status:'Complete', setAt:new Date().toISOString(), hand:true}}; }})()")
        ok(await complete(), "complete again")
        await pg.evaluate(f"(()=>{{ const TU=__tg.CX.TU(); TU.ro='{ro}'; __tg.PG.go('tech'); }})()"); await pg.wait_for_timeout(1000)
        n0 = await pg.evaluate(f"(()=>{{ const o={OP}; return (o.reopened||[]).length; }})()")
        pill = await pg.evaluate(JTX % ("const b=R.querySelector('.rop-orow[data-op=" + json.dumps(a) + "] .pgst.m'); if(!b) return null; const t=b.textContent; b.click(); return t;"))
        await pg.wait_for_timeout(400)
        pk = await pg.evaluate(JTX % "const m=[...R.querySelectorAll('.px-pop [role=menuitemradio], .px-pop .px-menu__item')].find(b=>/Waiting – Parts/.test(b.textContent)); if(m){ m.click(); return true; } return false;")
        await pg.wait_for_timeout(500)
        r = await pg.evaluate(f"(()=>{{ const o={OP}; return [__tg.opDoneNow(o), (o.reopened||[]).length, o.jobStatus.status]; }})()")
        ok(pill and "Complete" in pill and pk and r[0] is False and r[1] == n0 + 1 and r[2] == "Waiting – Parts", f"Technician page (the RO page mounted): the pill reopens it onto a hold ({pill}, {r})")
        await pg.screenshot(path=os.path.join(OUT, "t4_tech_done.png"))
        # 6. a released, closed RO opens again with it
        await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); r.operations.forEach(o=>{{ o.jobStatus={{status:'Complete', setAt:new Date().toISOString(), hand:true}}; }}); __tg.setRoStatus('{ro}', 'Complete – Released', null, true); r.dateClosed=new Date().toISOString(); r.dateClosedAuto=false; }})()"); await pg.wait_for_timeout(200)
        await pg.evaluate(f"__tg.doStartPunch('{ro}', '{a}', 'Repairing')"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); return [__tg.roStatus(r).status, r.dateClosed]; }})()")
        ok(r[0] in ("Hold Tech", "Working") and r[1] is None, f"a released, closed RO opens again ({r})")
        await pg.evaluate("__tg.doStopPunch('Complete')"); await pg.wait_for_timeout(200)
        # 7. keyboard: Enter on the check starts it again
        ok(await pg.evaluate(DONE), "complete again")
        c = await ro_card(pg, ro, a)
        await pg.evaluate(J(f"R.querySelector('.ock[data-op=\"{a}\"] button.ock-ck.reo').focus()")); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
        r = await pg.evaluate("__tg.STATE().punches.filter(p=>!p.stop).map(p=>[p.by,p.opId])")
        ok(r == [[An, a]], f"Enter on the check starts it ({r})")
        await pg.evaluate("__tg.doStopPunch('Complete')"); await pg.wait_for_timeout(200)
        # 8. Triage's done toggle opens it back up on the record
        n0 = await pg.evaluate(f"({OP}.reopened||[]).length")
        await pg.evaluate(f"(()=>{{ const x=document.createElement('button'); x.dataset.action='ty-opdone'; x.dataset.ro='{ro}'; x.dataset.op='{a}'; document.body.appendChild(x); x.click(); x.remove(); }})()"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"(()=>{{ const o={OP}; return [__tg.opDoneNow(o), (o.reopened||[]).length - {n0}, o.jobStatus.status]; }})()")
        ok(r == [False, 1, "Hold Tech"], f"Triage's done toggle reopens it on the record ({r})")
        # 9. the admin looking at a technician's page: no start for them
        ok(not errs, "no console errors: " + "; ".join(errs[:3]))
        await b.close()
        # 10. phone: the done card's check and Reopen are there
        b, pg, errs = await setup(p, 390, 844)
        X = await pg.evaluate(PREP); A, An, ro, a = X["A"], X["An"], X["ro"], X["a"]
        await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); r.operations.forEach(o=>(o.parts||[]).forEach(x=>{{ x.status='Installed'; }})); }})()")
        await pg.evaluate(SIGN(A)); await pg.evaluate(GIVE(A)); await pg.evaluate(f"__tg.doStartPunch('{ro}', '{a}', 'Repairing')"); await pg.evaluate("__tg.doStopPunch('Complete')"); await pg.wait_for_timeout(300)
        c = await ro_card(pg, ro, a)
        r = await pg.evaluate(J(f"const c=R.querySelector('.ock[data-op=\"{a}\"]'); if(!c) return null; const g=c.querySelector('button.ock-ck.reo'), q=c.querySelector('.ock-reb'); const w=x=>x?x.getBoundingClientRect().width:0; return [w(g), w(q)]"))
        ok(r and r[0] > 30 and r[1] > 40, f"phone: the check and Reopen show ({r})")
        if r: await pg.evaluate(J(f"R.querySelector('.ock[data-op=\"{a}\"]').scrollIntoView({{block:'center'}})")); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "t7_phone.png"))
        ok(not errs, "phone: no console errors: " + "; ".join(errs[:3]))
        await b.close()
    print("\nFAILS:", len(FAILS), FAILS)
asyncio.run(main())
