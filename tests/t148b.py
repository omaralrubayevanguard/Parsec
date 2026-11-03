# Parsec 14.8 (B), rewritten for 17.3 — Extract operations on the RO page opens the one extraction window, which reads each
# operation's complaint, quoted time, approval and status (Waiting – Parts, Hold, Complete…), matches Op 1 by its complaint,
# and sets the status as a status picked on the job card. A status changed here since the last read stays.
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_b.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots148b"); os.makedirs(OUT, exist_ok=True)
T1 = """Case 41870233    Repair Order RO-31017
Operations    Approval    Labor Hours    Status
1  Alternator not charging    Approved    1.80    Waiting - Parts
2  Replace air dryer cartridge    Pending    0.90    Hold
3  DPF cleaning    Approved    1.50    Sublet
"""
T2 = """Operation 1: Check engine light - NOx sensor fault
Approval Status: Approved
Labor Hours: 1.5
Status: Complete

Operation 2: Replace outlet NOx sensor
Approval Status: Declined
Labor Hours: 2.2
Status: Declined

Operation 3: Wheel alignment
Approval Status: Not needed
Labor Hours: 1.0
Status: Waiting on customer
"""
OPEN = """(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); localStorage.removeItem('rop_fold'); __tg.pxSignedIn();
  const S=__tg.STATE(), r=S.ros.find(r=>!r.shop && !r.dateClosed && r.operations.filter(o=>!o.declined).length>=2);
  r.operations=r.operations.filter(o=>!o.declined).slice(0,2); const a=r.operations[0], b=r.operations[1];
  S.punches=S.punches.filter(p=>p.roId!==r.id); delete r.imp;
  a.complaint='Alternator not charging'; a.quoted=1; delete a.appr; delete a.jobStatus; b.complaint='Front brake shoes worn'; b.quoted=2; delete b.jobStatus;
  const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; U.roOpen={}; U.roOpen[r.id]=[a.id]; __tg.render(); return [r.id, a.id, b.id]; })()"""
OPS = "(rid=>__tg.getRO(rid).operations.map(o=>[o.complaint, o.quoted, (o.jobStatus||{}).status||'', o.appr ? o.appr.s : '', !!o.declined]))"
PLAN = "(()=>__tg.IMPX.plan().ops.map(P=>[P.o.name, P.o.hours, P.st.want, P.st.act, P.o.approval, P.isNew ? 'new' : 'Op ' + (__tg.IMPX.state().ro.operations.indexOf(P.op)+1)]))()"
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid, oa, ob = await pg.evaluate(OPEN); await pg.wait_for_timeout(1200)
        ok(await pg.evaluate(J("return !!R.querySelector('.rop-xops')")), "the Operations header has Extract operations")
        await pg.evaluate(J("R.querySelector('.rop-xops').click()")); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(f"__tg.IMPX.isOpen() && __tg.IMPX.state().ro && __tg.IMPX.state().ro.id === '{rid}'"), "it opens the one extraction window on this RO")
        # ---- the table: three operations, one is Op 1
        await pg.evaluate("t => __tg.IMPX.addText(t)", T1); await pg.wait_for_timeout(400)
        P1 = await pg.evaluate(PLAN); print("    plan 1:", P1)
        ok(len(P1) == 3, f"3 operations found ({len(P1)})")
        ok([x[5] for x in P1] == ["Op 1", "new", "new"], f"Op 1 matches by its complaint, the others are new ({[x[5] for x in P1]})")
        ok([x[2] for x in P1] == ["Waiting – Parts", "Hold Tech", "Waiting – Sublet"], f"statuses read ({[x[2] for x in P1]})")
        ok([x[1] for x in P1] == [1.8, 0.9, 1.5], f"quoted hours read ({[x[1] for x in P1]})")
        ok([x[4] for x in P1] == ["Approved", "Pending", "Approved"], f"approvals read ({[x[4] for x in P1]})")
        sh = await pg.evaluate("[...document.querySelectorAll('#imp-dlg .ix-pa.st')].map(x=>x.textContent)")
        ok(sh and "Waiting – Parts" in sh[0], f"the card shows the status it will set ({sh[:3]})")
        await pg.screenshot(path=os.path.join(OUT, "b1_preview.png"))
        n0 = len(await pg.evaluate(OPS + f"('{rid}')"))
        await pg.evaluate("__tg.IMPX.apply()"); await pg.wait_for_timeout(500)
        O = await pg.evaluate(OPS + f"('{rid}')")
        ok(len(O) == n0 + 2, f"2 operations added ({len(O)})")
        ok(O[0][1] == 1.8 and O[0][2] == "Waiting – Parts" and O[0][3] == "ok", f"Op 1 updated: the paperwork's 1.8 h wins, Waiting – Parts, approved ({O[0]})")
        ok(O[-2][0] == "Replace air dryer cartridge" and O[-2][1] == 0.9 and O[-2][2] == "Hold Tech" and not O[-2][3], f"new op: the air dryer, 0.9 h, Hold tech, not approved yet ({O[-2]})")
        ok(O[-1][0] == "DPF cleaning" and O[-1][2] == "Waiting – Sublet" and O[-1][3] == "ok", f"new op: DPF cleaning, Waiting – Sublet, approved ({O[-1]})")
        # ---- a status changed here stays; one not touched follows the paperwork
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{rid}'); r.operations[0].jobStatus={{status:'Waiting – Foreman', setAt:new Date().toISOString(), hand:true}}; }})()")
        await pg.evaluate(f"__tg.IMPX.open({{ ro: '{rid}' }})"); await pg.wait_for_timeout(200)
        await pg.evaluate("t => __tg.IMPX.addText(t)", T1.replace("Hold", "Complete")); await pg.wait_for_timeout(400)
        P2 = await pg.evaluate(PLAN); print("    plan 2:", P2)
        ok(P2[0][3] == "kept" and P2[1][3] == "upd" and P2[2][3] == "same", f"changed here → kept, untouched → updated, same → same ({[x[3] for x in P2]})")
        await pg.evaluate("__tg.IMPX.apply()"); await pg.wait_for_timeout(500)
        O2 = await pg.evaluate(OPS + f"('{rid}')")
        ok(O2[0][2] == "Waiting – Foreman" and O2[-2][2] == "Complete", f"Op 1 keeps Waiting – Foreman, the air dryer is Complete ({O2[0][2]}, {O2[-2][2]})")
        # ---- the labelled layout: Complete / Declined / Waiting – Customer
        await pg.evaluate(f"__tg.IMPX.open({{ ro: '{rid}' }})"); await pg.wait_for_timeout(200)
        await pg.evaluate("t => __tg.IMPX.addText(t)", T2); await pg.wait_for_timeout(400)
        P3 = await pg.evaluate(PLAN); print("    plan 3:", P3)
        ok([x[2] for x in P3] == ["Complete", "Declined", "Waiting – Customer"], f"labelled statuses ({[x[2] for x in P3]})")
        ok([x[1] for x in P3] == [1.5, 2.2, 1.0], f"labelled hours ({[x[1] for x in P3]})")
        await pg.evaluate("__tg.IMPX.apply()"); await pg.wait_for_timeout(500)
        O3 = await pg.evaluate(OPS + f"('{rid}')")
        W = {x[0]: x for x in O3}
        ok(W.get("Wheel alignment", [0, 0, ""])[2] == "Waiting – Customer", f"Wheel alignment: Waiting – Customer ({W.get('Wheel alignment')})")
        ok(W.get("Replace outlet NOx sensor", [0, 0, "", "", False])[4], f"the declined one comes in declined ({W.get('Replace outlet NOx sensor')})")
        await pg.screenshot(path=os.path.join(OUT, "b2_applied.png"))
        ok(not errs, f"no page errors ({errs[:2]})")
        await b.close()
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
