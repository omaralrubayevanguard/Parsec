# Parsec 13 (C) — the actions hold: refused with why for a technician, done for the Admin
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
ADMIN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); return 'admin'; })()"
TOAST = "(__tg.UI().toast || '')"
CLR = "(()=>{ __tg.UI().toast = null; })()"
def CLICK(sel_parent, attrs):
    a = json.dumps(attrs)
    return f"""(()=>{{ const host = {sel_parent}; if(!host) return 'nohost'; const b=document.createElement('button'); const A={a}; Object.keys(A).forEach(k=>b.setAttribute(k, A[k])); host.appendChild(b); b.click(); b.remove(); return 'ok'; }})()"""
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ __tg.STATE().punches.forEach(p=>{ if(!p.stop){ p.stop=new Date().toISOString(); p.stopReason='Switched job'; p.burntCredited=true; } }); __tg.render(); })()"); await pg.wait_for_timeout(400)
        X = await pg.evaluate(PREP); A, An, B, Bn, ro, a, bo = X["A"], X["An"], X["B"], X["Bn"], X["ro"], X["a"], X["b"]
        RS = f"__tg.roStatus(__tg.STATE().ros.find(r=>r.id==='{ro}')).status"
        rel = await pg.evaluate("(__tg.STATE().ros.find(r=>!r.shop && __tg.roStatus(r).status==='Complete – Released')||{}).id")
        relop = await pg.evaluate(f"__tg.STATE().ros.find(r=>r.id==='{rel}').operations[0].id")
        await pg.evaluate(SIGN(A))
        ok(await pg.evaluate("document.documentElement.classList.contains('pm-no-ro-del') && document.documentElement.classList.contains('pm-no-p-cost') && !document.documentElement.classList.contains('pm-no-t-own')"), "a technician: <html> carries what's missing (no deleting, no costs), not what's there")
        # ro.status
        await pg.evaluate(CLR)
        cur0 = await pg.evaluate(RS); tgt0 = 'Waiting – Foreman' if cur0 == 'Waiting – Customer' else 'Waiting – Customer'   # Parsec 14: the sample RO can already be at Waiting – Customer
        r = await pg.evaluate(f"[__tg.setRoStatus('{ro}', '{tgt0}', null), {RS}, {TOAST}]")
        ok(r[0] is False and r[1] == cur0 and "change an RO’s status" in r[2] and "Admin page" in r[2], f"RO status: refused, unchanged, says why ({r})")
        # ro.release
        r = await pg.evaluate(f"[__tg.setRoStatus('{ro}', 'Complete – Released', null, true), {RS}, {TOAST}]")
        ok(r[0] is False and r[1] == cur0 and "release a truck" in r[2], f"releasing: refused ({r})")
        # ro.reopen — the RO status, and an operation's clock on a released RO
        r = await pg.evaluate(f"[__tg.setRoStatus('{rel}', 'Hold Tech', null), __tg.roStatus(__tg.STATE().ros.find(r=>r.id==='{rel}')).status, {TOAST}]")
        ok(r[0] is False and r[1] == "Complete – Released" and "reopen a completed RO" in r[2], f"reopening a released RO: refused ({r})")
        await pg.evaluate(CLR)
        r = await pg.evaluate(f"(()=>{{ __tg.doStartPunch('{rel}', '{relop}', 'Repairing'); return [__tg.STATE().punches.filter(p=>!p.stop && p.opId==='{relop}').length, __tg.UI().toast||'', __tg.roStatus(__tg.STATE().ros.find(r=>r.id==='{rel}')).status]; }})()")
        ok(r[0] == 0 and "reopen a completed RO" in r[1] and r[2] == "Complete – Released", f"starting a clock on a released RO: refused, nothing reopened ({r})")
        # ro.new
        await pg.evaluate(CLR); await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='ros'; U.selectedRo=null; __tg.render(); })()"); await pg.wait_for_timeout(300)
        await pg.keyboard.press("n"); await pg.wait_for_timeout(400)
        r = await pg.evaluate(f"[{TOAST}, !!document.querySelector('.imp-modal, .impx, [data-impx]')]")
        ok("open new ROs" in r[0], f"N for a new RO: refused ({r})")
        # ro.del — the RO List's Delete… is hidden, and the click refused
        await pg.evaluate("__tg.PG.go('rolist')"); await pg.wait_for_timeout(700)
        await pg.evaluate("(()=>{ const c=document.querySelector('[data-pg=rolist] [data-a=cb]'); if(c) c.click(); })()"); await pg.wait_for_timeout(300)
        r = await pg.evaluate("(()=>{ const d=document.querySelector('[data-pg=rolist] [data-a=pop][data-p=bdel]'); return [!!d, d ? getComputedStyle(d).display : null]; })()")
        ok(r[0] and r[1] == "none", f"RO List: Delete… is there for the Admin, hidden for a technician ({r})")
        await pg.evaluate(CLR); n0 = await pg.evaluate("__tg.STATE().ros.length")
        await pg.evaluate(CLICK("document.querySelector('[data-pg=rolist]')", {"data-a": "bdelgo"}))
        r = await pg.evaluate(f"[{TOAST}, __tg.STATE().ros.length]")
        ok("delete ROs" in r[0] and r[1] == n0, f"…and a delete click is refused ({r[0][:40]})")
        await pg.evaluate("(()=>{ const c=document.querySelector('[data-pg=rolist] [data-a=bclr]'); if(c) c.click(); })()")
        # the RO page's Options menu has no Delete RO
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(700)
        await pg.evaluate(J("const b=[...R.querySelectorAll('button')].find(x=>/^More|Options|More for this RO/i.test(x.getAttribute('aria-label')||x.title||'')); if(b) b.click()")); await pg.wait_for_timeout(300)
        r = await pg.evaluate(J("return [...R.querySelectorAll('[role=menuitem], .px-menu__item, .menuItem')].map(x=>x.textContent.trim()).filter(t=>/Delete RO/.test(t)).length"))
        ok(r == 0, f"RO page: no Delete RO in its menu for a technician ({r})")
        await pg.keyboard.press("Escape")
        # t.editown / t.editall
        r = await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(); const day=new Date(Date.now()-400*86400e3); const T=h=>{{ const d=new Date(day); const [H,M]=h.split(':'); d.setHours(+H,+M,0,0); return d.toISOString(); }};
          S.punches.push({{id:'pn_m', roId:'{ro}', opId:'{a}', start:T('09:00'), stop:T('10:00'), startReason:'Repairing', stopReason:'Switched job', notes:'', by:{json.dumps(An)}, burntCredited:true}});
          S.punches.push({{id:'pn_d', roId:'{ro}', opId:'{a}', start:T('11:00'), stop:T('12:00'), startReason:'Repairing', stopReason:'Switched job', notes:'', by:{json.dumps(Bn)}, burntCredited:true}});
          const mine=S.punches.find(p=>p.id==='pn_m'), hers=S.punches.find(p=>p.id==='pn_d');
          const e1=__tg.editPunchCommit(mine, {{start:T('09:05'), stop:T('10:00'), startReason:'Repairing', stopReason:'Switched job', opId:'{a}', notes:''}});
          const e2=__tg.editPunchCommit(hers, {{start:T('11:05'), stop:T('12:00'), startReason:'Repairing', stopReason:'Switched job', opId:'{a}', notes:''}});
          const d2=__tg.deletePunch('pn_d');
          return [e1.ok, e2.ok, e2.msg||'', d2, !!S.punches.find(p=>p.id==='pn_d'), hers.start===T('11:00')]; }})()""")
        ok(r[0] is True and r[1] is False and "someone else’s punches" in r[2] and r[3] is False and r[4] and r[5], f"punches: your own fixes, someone else's refused, theirs untouched ({r[:2]}, {r[3:]})")
        # take away “Fix their own punches” — your own is refused too
        r = await pg.evaluate(f"""(()=>{{ const sf=__tg.staffList().find(s=>s.id==='{A}'); __tg.permSet(sf,'acts','t.editown',false); const S=__tg.STATE(), mine=S.punches.find(p=>p.id==='pn_m');
          const e=__tg.editPunchCommit(mine, {{start:mine.start, stop:new Date(+new Date(mine.stop)-60000).toISOString(), startReason:'Repairing', stopReason:'Switched job', opId:'{a}', notes:''}}); __tg.permBack(sf); return [e.ok, e.msg||'']; }})()""")
        ok(r[0] is False and "fix your punches" in r[1], f"without “Fix their own punches”, your own is refused ({r})")
        # t.own
        r = await pg.evaluate(f"""(()=>{{ const sf=__tg.staffList().find(s=>s.id==='{A}'); __tg.permSet(sf,'acts','t.own',false); __tg.UI().toast=null; __tg.doStartPunch('{ro}', '{a}', 'Repairing');
          const n=__tg.STATE().punches.filter(p=>!p.stop).length, t=__tg.UI().toast||''; __tg.permBack(sf); return [n, t]; }})()""")
        ok(r[0] == 0 and "start the clock" in r[1], f"without “Start and stop their own clock”: no clock ({r})")
        # t.move, t.approve, p.order, p.stock, w.claim, a.settings, a.data — the clicks
        cases = [("t.move", "document.body", {"data-action": "tx-open"}, "move time"),
                 ("p.order", "document.querySelector('#app') || document.body", None, "order parts"),
                 ("w.claim", "document.body", {"data-action": "wa-st", "data-to": "approved"}, "file warranty claims"),
                 ("a.settings", "document.body", {"data-action": "open-automations"}, "change settings"),
                 ("a.data", "document.body", {"data-action": "export-json"}, "export or reset")]
        for act, host, attrs, word in cases:
            await pg.evaluate(CLR)
            if act == "p.order":
                await pg.evaluate("__tg.PG.go('parts')"); await pg.wait_for_timeout(600)
                await pg.evaluate(CLICK("document.querySelector('[data-pg=parts]')", {"data-a": "ogo"}))
            else:
                await pg.evaluate(CLICK(host, attrs))
            await pg.wait_for_timeout(150)
            t = await pg.evaluate(TOAST)
            ok(word in t, f"{act}: refused with why ({t[:60]})")
        await pg.evaluate("__tg.PG.go('inventory')"); await pg.wait_for_timeout(600)
        has_inv = await pg.evaluate("!!document.querySelector('[data-pg=inventory]')")
        if has_inv:
            await pg.evaluate(CLR); await pg.evaluate(CLICK("document.querySelector('[data-pg=inventory]')", {"data-a": "adjgo"}))
            ok("adjust stock" in await pg.evaluate(TOAST), "p.stock: refused with why")
        else:
            ok(True, "p.stock: a technician doesn't have the Inventory page (the page itself is the guard)")
        # p.stock, with the Inventory page given to the technician
        await pg.evaluate(f"(()=>{{ __tg.permSet(__tg.staffList().find(s=>s.id==='{A}'),'pages','inventory',true); }})()")
        await pg.evaluate("__tg.PG.go('inventory')"); await pg.wait_for_timeout(600)
        r = await pg.evaluate("(()=>{ const b=document.querySelector('[data-pg=inventory] [data-a=pop][data-p=adj]'); return [!!document.querySelector('[data-pg=inventory]'), b ? getComputedStyle(b).display : 'none'] })()")
        await pg.evaluate(CLR); await pg.evaluate(CLICK("document.querySelector('[data-pg=inventory]')", {"data-a": "adjgo"}))
        t = await pg.evaluate(TOAST)
        ok(r[0] and r[1] == "none" and "adjust stock" in t, f"p.stock: Inventory open, Adjust hidden, the save refused ({r}, {t[:40]})")
        await pg.evaluate(f"(()=>{{ __tg.permBack(__tg.staffList().find(s=>s.id==='{A}')); }})()")
        # the RO page's money: none for the technician
        await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); r.operations.forEach(o=>(o.parts||[]).forEach(x=>{{ x.price = x.price || '125.50'; }})); const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(800)
        nT = await pg.evaluate(J("return (R.textContent.match(/\\$\\d/g) || []).length"))
        # p.cost
        r = await pg.evaluate("__tg.money(12)")
        ok(r == "—", f"costs: a technician sees — ({r})")
        P0 = await pg.evaluate("__tg.staffList().find(s=>s.role==='Parts').id")
        await pg.evaluate(SIGN(P0))
        r = await pg.evaluate("[__tg.money(12), document.documentElement.classList.contains('pm-no-p-cost')]")
        ok(r == ["$12.00", False], f"…Parts sees prices ({r})")
        await pg.evaluate(SIGN(A))
        # one action given to the technician works
        r = await pg.evaluate(f"""(()=>{{ const sf=__tg.staffList().find(s=>s.id==='{A}'); __tg.permSet(sf,'acts','ro.status',true); const a=__tg.setRoStatus('{ro}', 'Waiting – Customer', null); const st={RS}; __tg.setRoStatus('{ro}', 'Hold Tech', null); __tg.permBack(sf); return [a, st]; }})()""")
        ok(r == [True, "Waiting – Customer"], f"give the technician “Change an RO’s status” and it works ({r})")
        # automations still set the RO status for someone without the permission
        await pg.evaluate(f"__tg.doStartPunch('{ro}', '{a}', 'Repairing')"); await pg.wait_for_timeout(900)
        r = await pg.evaluate(f"[{RS}, __tg.STATE().punches.filter(p=>!p.stop).length]")
        ok(r == ["Working", 1], f"the RO still follows its operations — an automation isn't stopped ({r})")
        await pg.evaluate("__tg.doStopPunch('Switched job')"); await pg.wait_for_timeout(600)
        # the Admin: everything
        await pg.evaluate(ADMIN)
        r = await pg.evaluate(f"[__tg.setRoStatus('{ro}', 'Waiting – Customer', null), {RS}, document.documentElement.className.indexOf('pm-no-') < 0, __tg.money(12)]")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(800)
        nA = await pg.evaluate(J("return (R.textContent.match(/\\$\\d/g) || []).length"))
        ok(nT == 0 and nA > 0, f"the RO page: no $ amounts for the technician, {nA} for the Admin")
        ok(r[0] is True and r[1] == "Waiting – Customer" and r[2] and r[3] == "$12.00", f"the Admin: status changes, nothing hidden, prices shown ({r})")
        await pg.evaluate(CLR); await pg.evaluate(CLICK("document.body", {"data-action": "tx-open"})); await pg.wait_for_timeout(200)
        r = await pg.evaluate(f"[{TOAST}, (__tg.UI().modal||{{}}).type]")
        ok("can’t" not in r[0] and r[1] == "tx-move", f"the Admin: Move time opens ({r})")
        await pg.evaluate("(()=>{ __tg.UI().modal=null; __tg.render(); })()")
        r = await pg.evaluate(f"(()=>{{ __tg.UI().toast=null; __tg.doStartPunch('{rel}', '{relop}', 'Repairing'); const n=__tg.STATE().punches.filter(p=>!p.stop && p.opId==='{relop}').length; __tg.doStopPunch('Switched job'); return n; }})()")
        ok(r == 1, f"the Admin: a clock on a released RO starts (it reopens) ({r})")
        ok(not errs, "no console errors: " + "; ".join(errs[:3]))
        await b.close()
    print("\nFAILS:", len(FAILS), FAILS)
asyncio.run(main())
