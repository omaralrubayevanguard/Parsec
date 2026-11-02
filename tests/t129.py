# Parsec 12.9 — an RO status you pick holds; a completed RO set back to open asks about its operations
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
def GIVE(sid, acts=("ro.status", "ro.release", "ro.reopen")): return "(()=>{ const sf=__tg.staffList().find(s=>s.id===" + json.dumps(sid) + "); if(sf && __tg.permSet) " + json.dumps(list(acts)) + ".forEach(k=>__tg.permSet(sf,'acts',k,true)); })()"   # Parsec 13: the person doing it may
OUT = os.path.join(H, "shots129"); os.makedirs(OUT, exist_ok=True)
def RS(ro): return f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); return [__tg.roStatus(r).status, !!r.dateClosed, r.operations.filter(o=>!o.declined).map(o=>__tg.opDoneNow(o))]; }})()"
DLG = "(()=>{ const d=document.querySelector('.roreo'); return d ? [d.querySelector('.roreo-h b').textContent, d.querySelectorAll('.roreo-l li').length, d.querySelector('.roreo-b.pri').textContent] : null; })()"
def EVENTS(ro): return f"""(()=>{{ const S=__tg.STATE(), r=S.ros.find(r=>r.id==='{ro}');
  if(r.roadTest) r.roadTest = Object.assign({{}}, r.roadTest, {{ miles: String(Math.floor(Math.random()*90)+5) }});
  const p = S.punches.filter(p=>p.roId===r.id && p.stop).pop(); if(p) p.notes = (p.notes||'') + ' .';
  __tg.scheduleSave(true); }})()"""
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ __tg.STATE().punches.forEach(p=>{ if(!p.stop){ p.stop=new Date().toISOString(); p.stopReason='Switched job'; p.burntCredited=true; } }); __tg.render(); })()"); await pg.wait_for_timeout(600)
        L = await pg.evaluate("__tg.STATE().ros.filter(r=>!r.shop && r.operations.filter(o=>!o.declined).length>=2 && r.operations.every(o=>o.declined || __tg.opDoneNow(o))).map(r=>[r.id, __tg.roStatus(r).status, r.assignedTech])")
        RT = [x for x in L if x[1] == "Complete – Road test"]; RL = [x for x in L if x[1] == "Complete – Released"]
        print("   ", len(RT), "road test ·", len(RL), "released")
        ro = RT[0][0]
        T = RT[0][2]; sid = await pg.evaluate(f"(__tg.staffList().find(s=>s.name==={json.dumps(T)})||{{}}).id")
        await pg.evaluate(SIGN(sid)); await pg.evaluate(GIVE(sid))
        async def ro_page(r):
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{r}'; __tg.render(); }})()"); await pg.wait_for_timeout(700)
        async def pick_ro(r, name):
            await ro_page(r)
            await pg.evaluate(J("R.querySelector('.px-status--button').click()")); await pg.wait_for_timeout(300)
            await pg.evaluate(J(f"const b=[...R.querySelectorAll('.px-menu__item')].find(x=>x.textContent.trim().toLowerCase().startsWith({json.dumps(name.lower())})); b.click()")); await pg.wait_for_timeout(500)
        # 1. the RO page: Complete – Road test → Hold tech asks; Just the RO; it holds through what happens next
        await pick_ro(ro, "Hold tech")
        d = await pg.evaluate(DLG)
        ok(d and "is open again" in d[0] and d[1] >= 2 and "Reopen" in d[2], f"RO page: picking Hold tech on a completed RO asks ({d})")
        await pg.screenshot(path=os.path.join(OUT, "u1_ask.png"))
        await pg.click(".roreo [data-roreo=ro]"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("!document.querySelector('.roreo')"), "Just the RO closes it")
        for i in range(3): await pg.evaluate(EVENTS(ro)); await pg.wait_for_timeout(700)
        r = await pg.evaluate(RS(ro))
        ok(r[0] == "Hold Tech" and all(r[2]), f"…the RO stays Hold tech through what happens next — no snapping back ({r})")
        for name, want in [("Working", "Working"), ("Waiting – Customer", "Waiting – Customer")]:
            await pick_ro(ro, name); await pg.wait_for_timeout(200)
            ask = await pg.evaluate(DLG)
            if ask: await pg.click(".roreo [data-roreo=ro]"); await pg.wait_for_timeout(200)
            for i in range(2): await pg.evaluate(EVENTS(ro)); await pg.wait_for_timeout(700)
            r = await pg.evaluate(RS(ro))
            ok(r[0] == want, f"…{name} holds too ({r[0]}; asked again: {bool(ask)})")
        # 2. the operations change → the RO follows them again (the sync still works)
        op1 = await pg.evaluate(f"__tg.STATE().ros.find(r=>r.id==='{ro}').operations.filter(o=>!o.declined)[0].id")
        await pg.evaluate(f"__tg.doStartPunch('{ro}', '{op1}', 'Repairing')"); await pg.wait_for_timeout(900)
        r = await pg.evaluate(RS(ro))
        ok(r[0] == "Working", f"starting a clock moves it to Working ({r[0]})")
        await pg.evaluate("__tg.doStopPunch('Complete')"); await pg.wait_for_timeout(900)
        r = await pg.evaluate(RS(ro))
        ok(r[0] in ("Complete – Road test", "Hold Tech") and all(r[2]), f"completing it again: the RO follows its operations ({r[0]})")
        # 3. a released, closed RO: Hold tech → Reopen both: the operations reopen, the RO stays open, the clock can start
        rel = RL[0][0]
        await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{rel}'); r.dateClosed = r.dateClosed || new Date().toISOString(); delete r.dateClosedAuto; }})()")
        await pick_ro(rel, "Hold tech")
        d = await pg.evaluate(DLG)
        ok(d and "is open again" in d[0], f"a released RO asks too ({d})")
        n = await pg.evaluate(f"__tg.STATE().ros.find(r=>r.id==='{rel}').operations.filter(o=>!o.declined).length")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(600)
        r = await pg.evaluate(RS(rel)); t = await pg.evaluate("__tg.UI().toast || ''")
        ok(r[0] == "Hold Tech" and r[1] is False and not any(r[2]), f"Enter reopens its operations; the RO is open, off the closed list ({r})")
        ok("reopened" in t, "…and says so: " + t)
        for i in range(3): await pg.evaluate(EVENTS(rel)); await pg.wait_for_timeout(700)
        r = await pg.evaluate(RS(rel))
        ok(r[0] == "Hold Tech" and not any(r[2]), f"…it all holds ({r})")
        await ro_page(rel)
        opr = await pg.evaluate(f"__tg.STATE().ros.find(r=>r.id==='{rel}').operations.filter(o=>!o.declined)[0].id")
        on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{opr}\"]'); return r ? r.classList.contains('is-on') : null"))
        if not on: await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{opr}\"] .px-row__t'); if(r) r.click()")); await pg.wait_for_timeout(500)
        c = await pg.evaluate(J(f"const c=R.querySelector('.ock[data-op=\"{opr}\"]'); return c ? [c.dataset.mode, !!c.querySelector('.ock-pb[data-ock=go]')] : null"))
        ok(c and c[0] == "idle" and c[1], f"its clock card has Start again ({c})")
        await pg.screenshot(path=os.path.join(OUT, "u2_reopened.png"))
        await pg.evaluate(J(f"R.querySelector('.ock[data-op=\"{opr}\"] .ock-pb[data-ock=go]').click()")); await pg.wait_for_timeout(800)
        r = await pg.evaluate(RS(rel)); run = await pg.evaluate(f"__tg.STATE().punches.filter(p=>!p.stop && p.opId==='{opr}').length")
        ok(run == 1 and r[0] == "Working", f"…and the clock starts — RO Working ({r[0]}, {run})")
        await pg.evaluate("__tg.doStopPunch('Switched job')"); await pg.wait_for_timeout(600)
        # undo takes the reopening back
        rel2 = RL[1][0]
        await pick_ro(rel2, "Hold tech"); await pg.click(".roreo [data-roreo=all]"); await pg.wait_for_timeout(500)
        r1 = await pg.evaluate(RS(rel2))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(500)
        r2 = await pg.evaluate(RS(rel2))
        ok(not any(r1[2]) and all(r2[2]) and r2[0] == "Hold Tech", f"Undo puts the operations back to Complete, the RO stays Hold tech ({r1} → {r2})")
        # Escape = just the RO
        await pick_ro(rel2, "Waiting – Customer"); d = await pg.evaluate(DLG)
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(RS(rel2))
        ok(d and await pg.evaluate("!document.querySelector('.roreo')") and r[0] == "Waiting – Customer" and all(r[2]), f"Escape: just the RO ({r})")
        # 4. two at once (the RO List's Set status): one question
        a3, a4 = RL[2][0], RL[3][0]
        await pg.evaluate(f"(()=>{{ __tg.setRoStatus('{a3}', 'Hold Tech', null); __tg.setRoStatus('{a4}', 'Hold Tech', null); __tg.render(); }})()"); await pg.wait_for_timeout(400)
        d = await pg.evaluate(DLG)
        ok(d and d[0].startswith("2 ROs"), f"two ROs set back at once: one question ({d})")
        await pg.click(".roreo [data-roreo=all]"); await pg.wait_for_timeout(500)
        r3, r4 = await pg.evaluate(RS(a3)), await pg.evaluate(RS(a4))
        ok(not any(r3[2]) and not any(r4[2]), f"…both RO's operations reopen ({r3}, {r4})")
        # 5. Triage's status select
        a5 = RL[4][0]
        await pg.evaluate(f"(()=>{{ const s=document.createElement('select'); s.dataset.tyst='ro'; s.dataset.ro='{a5}'; const o=document.createElement('option'); o.value='Hold Tech|'; s.appendChild(o); s.value='Hold Tech|'; document.body.appendChild(s); s.dispatchEvent(new Event('change', {{bubbles:true}})); s.remove(); }})()"); await pg.wait_for_timeout(400)
        d = await pg.evaluate(DLG)
        ok(d and "is open again" in d[0], f"Triage's status select asks too ({d})")
        await pg.click(".roreo [data-roreo=ro]"); await pg.wait_for_timeout(200)
        for i in range(2): await pg.evaluate(EVENTS(a5)); await pg.wait_for_timeout(700)
        r = await pg.evaluate(RS(a5))
        ok(r[0] == "Hold Tech", f"…and it holds ({r[0]})")
        # 6. an automation setting the status never asks
        await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{a5}'); }})()")
        # 7. the Technician page: the RO's status has a menu
        a6 = RL[5][0]; T6 = RL[5][2]; sid6 = await pg.evaluate(f"(__tg.staffList().find(s=>s.name==={json.dumps(T6)})||{{}}).id")
        await pg.evaluate(SIGN(sid6)); await pg.evaluate(GIVE(sid6))
        await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{a6}'); r.operations.forEach(o=>{{ if(o.declined) return; __tg.doStartPunch('{a6}', o.id, 'Repairing'); __tg.doStopPunch('Complete'); }}); __tg.setRoStatus('{a6}', 'Complete – Released', null, true); __tg.render(); }})()"); await pg.wait_for_timeout(800)
        print('    a6', await pg.evaluate(RS(a6)), T6, sid6)
        await pg.evaluate(f"(()=>{{ const TU=__tg.CX.TU(); TU.ro='{a6}'; __tg.PG.go('tech'); }})()"); await pg.wait_for_timeout(1000)
        JTX = "(()=>{ const h=document.querySelector('[data-pg=tech] .jc-host'); const R=h&&h.shadowRoot; if(!R) return null; %s })()"
        rb = await pg.evaluate(JTX % "const b=R.querySelector('.px-status--button'); return b ? b.textContent : null;")
        ok(rb and "Complete" in rb, f"Technician page (the RO page mounted): the RO's status shows, with a menu ({rb})")
        await pg.evaluate(JTX % "const b=R.querySelector('.px-status--button'); if(b) b.click(); return 1;"); await pg.wait_for_timeout(400)
        items = await pg.evaluate(JTX % "return [...R.querySelectorAll('.px-pop [role=menuitemradio], .px-pop .px-menu__item')].map(x=>x.textContent.trim());")
        ok(items and len(items) >= 9 and any("Hold tech" in x or "Hold Tech" in x for x in items), f"…the menu has the RO statuses ({len(items or [])})")
        await pg.screenshot(path=os.path.join(OUT, "u3_tech_menu.png"))
        await pg.evaluate(JTX % "const m=[...R.querySelectorAll('.px-pop [role=menuitemradio], .px-pop .px-menu__item')].find(x=>/Hold tech|Hold Tech/.test(x.textContent)); if(m) m.click(); return 1;"); await pg.wait_for_timeout(500)
        d = await pg.evaluate(DLG)
        ok(d and "is open again" in d[0], f"…picking Hold tech asks ({d})")
        await pg.click(".roreo [data-roreo=all]"); await pg.wait_for_timeout(700)
        r = await pg.evaluate(RS(a6))
        ok(r[0] == "Hold Tech" and not any(r[2]), f"…its operations reopen ({r})")
        await pg.evaluate(f"(()=>{{ const TU=__tg.CX.TU(); TU.ro='{a6}'; __tg.PG.go('tech'); }})()"); await pg.wait_for_timeout(900)
        st = await pg.evaluate(JTX % "const b=[...R.querySelectorAll('.rop-foot button, .rop-band button')].find(x=>/^Start/.test(x.textContent.trim())); return [!!b, (R.querySelector('.px-status--button')||{}).textContent||''];")
        ok(st and st[0] and "Hold" in st[1], f"…and Start is there ({st})")
        await pg.screenshot(path=os.path.join(OUT, "u4_tech_after.png"))
        # 8. the operation's own status picked on the RO page holds through what happens next
        a7 = RL[6][0]; op7 = await pg.evaluate(f"__tg.STATE().ros.find(r=>r.id==='{a7}').operations.filter(o=>!o.declined)[0].id")
        await ro_page(a7)
        await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op7}\"] .rop-st').click()")); await pg.wait_for_timeout(300)
        await pg.evaluate(J("const b=[...R.querySelectorAll('.rop-stpop [role=menuitem], .rop-stpop button')].find(x=>/Waiting . Parts/i.test(x.textContent)); b.click()")); await pg.wait_for_timeout(600)
        for i in range(3): await pg.evaluate(EVENTS(a7)); await pg.wait_for_timeout(700)
        r = await pg.evaluate(f"(()=>{{ const o=__tg.STATE().ros.find(r=>r.id==='{a7}').operations.find(o=>o.id==='{op7}'); return [o.jobStatus.status, __tg.opDoneNow(o), __tg.roStatus(__tg.STATE().ros.find(r=>r.id==='{a7}')).status]; }})()")
        ok(r[0] == "Waiting – Parts" and r[1] is False and r[2] == "Waiting – Parts", f"an operation's picked status holds, and the RO follows it ({r})")
        ok(not errs, "no console errors: " + "; ".join(errs[:3]))
        await b.close()
        # 9. phone: the question fits
        b, pg, errs = await setup(p, 390, 844)
        rl = await pg.evaluate("(__tg.STATE().ros.find(r=>!r.shop && __tg.roStatus(r).status==='Complete – Released')||{}).id")
        await pg.evaluate(f"(()=>{{ __tg.setRoStatus('{rl}', 'Hold Tech', null); __tg.render(); }})()"); await pg.wait_for_timeout(400)
        await pg.wait_for_timeout(400)
        w = await pg.evaluate("(()=>{ const c=document.querySelector('.roreo-c'); if(!c) return null; const r=c.getBoundingClientRect(); const top=[...c.querySelectorAll('.roreo-b')].every(b=>{ const q=b.getBoundingClientRect(); const e=document.elementFromPoint(q.left+q.width/2, q.top+q.height/2); return e && b.contains(e); }); return [Math.round(r.left), Math.round(r.right), Math.round(r.bottom), innerWidth, innerHeight, top]; })()")
        ok(w and w[0] >= 0 and w[1] <= w[3] and w[2] <= w[4] and w[5], f"phone: the question fits, its buttons on top ({w})")
        await pg.screenshot(path=os.path.join(OUT, "u5_phone.png"))
        ok(not errs, "phone: no console errors: " + "; ".join(errs[:3]))
        await b.close()
    print("\nFAILS:", len(FAILS), FAILS)
asyncio.run(main())
