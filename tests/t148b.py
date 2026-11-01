# Parsec 14.8 (B) — the RO page's Operations header: Extract operations from text or a screenshot — the complaint, status,
# quoted time and approval of each, as Update Op N or Add as new; one Undo, an Activity line.
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
  S.punches=S.punches.filter(p=>p.roId!==r.id);
  a.complaint='Alternator not charging'; a.quoted=1; delete a.appr; delete a.jobStatus; b.complaint='Front brake shoes worn'; b.quoted=2;
  const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; U.roOpen={}; U.roOpen[r.id]=[a.id]; __tg.render(); return [r.id, a.id, b.id]; })()"""
OPS = "(rid=>__tg.getRO(rid).operations.map(o=>[o.complaint, o.quoted, (o.jobStatus||{}).status||'', o.appr ? o.appr.s + '/' + (o.appr.how||'') : '', !!o.declined]))"
ROWS = J("return [...R.querySelectorAll('.ox-row:not(.ox-h)')].map(r=>{ const s=r.querySelectorAll('select'), i=r.querySelectorAll('input:not([type=checkbox])'); return [s[0].options[s[0].selectedIndex].text, i[0].value, s[1].value, i[1].value, s[2].value]; })")
async def jtoast(pg): return await pg.evaluate(J("const t=R.getElementById('toast'); return t ? t.textContent : ''"))
async def jundo(pg):
    await pg.evaluate(J("const t=R.getElementById('toast'); const b=t && t.querySelector('button'); b && b.click();")); await pg.wait_for_timeout(450)
async def settext(pg, t):
    await pg.evaluate(J("const a=R.querySelector('.ox-ta'); a.value=" + json.dumps(t) + "; a.dispatchEvent(new Event('input',{bubbles:true}));")); await pg.wait_for_timeout(250)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid, oa, ob = await pg.evaluate(OPEN); await pg.wait_for_timeout(1200)
        hd = await pg.evaluate(J("const s=[...R.querySelectorAll('.px-sec')].find(x=>/Operations/.test(x.textContent)); if(!s) return null; const b=s.querySelector('.rop-xops'), a=s.querySelector('.rop-addop'); return b && a ? [b.title, !!(a.compareDocumentPosition(b) & 4), b.getBoundingClientRect().left > a.getBoundingClientRect().left] : null"))
        ok(hd and hd[0] == "Extract operations from text or a screenshot" and hd[1] and hd[2], f"the Operations header: an extract button right of + ({hd})")
        await pg.screenshot(path=os.path.join(OUT, "b0_header.png"))
        await pg.evaluate(J("R.querySelector('.rop-xops').click()")); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(J("return !!R.querySelector('.px-modal--ox')")), "it opens Extract operations")
        ok(await pg.evaluate(J("const b=R.querySelector('.px-modal--ox .px-modal__f .px-btn--primary'); return b && b.disabled")), "Apply waits for operations")
        # ---- pasted text: three operations, one is Op 1
        await settext(pg, T1)
        R1 = await pg.evaluate(ROWS)
        ok(len(R1) == 3, f"3 operations found ({len(R1)})")
        ok(R1 and R1[0][0] == "Update Op 1" and R1[1][0] == "Add as new" and R1[2][0] == "Add as new", f"Op 1 matches by its complaint, the others are new ({[r[0] for r in R1]})")
        ok([r[2] for r in R1] == ["Waiting – Parts", "Hold Tech", "Waiting – Sublet"], f"statuses read ({[r[2] for r in R1]})")
        ok([r[3] for r in R1] == ["1.80", "0.90", "1.50"], f"quoted hours read ({[r[3] for r in R1]})")
        ok([r[4] for r in R1] == ["Approved", "Pending", "Approved"], f"approvals read ({[r[4] for r in R1]})")
        now = await pg.evaluate(J("return [...R.querySelectorAll('.ox-now')].map(x=>x.textContent)"))
        ok(now and now[0].startswith("Op 1 now:") and "matched by complaint" in now[0], f"the row says what Op 1 is now ({now[:1]})")
        sb = await pg.evaluate(J("return R.querySelector('.px-modal--ox .px-modal__f .px-btn--primary').textContent"))
        ok(sb == "Update 1 · add 2", f"the button says what it does ({sb})")
        await pg.screenshot(path=os.path.join(OUT, "b1_preview.png"))
        n0 = len(await pg.evaluate(OPS + f"('{rid}')"))
        await pg.evaluate(J("R.querySelector('.px-modal--ox .px-modal__f .px-btn--primary').click()")); await pg.wait_for_timeout(500)
        O = await pg.evaluate(OPS + f"('{rid}')")
        ok(len(O) == n0 + 2, f"2 operations added ({len(O)})")
        ok(O[0][1] == 1.8 and O[0][2] == "Waiting – Parts" and O[0][3].startswith("ok"), f"Op 1 updated: 1.8 h, Waiting – Parts, approved ({O[0]})")
        ok(O[-2][0] == "Replace air dryer cartridge" and O[-2][1] == 0.9 and not O[-2][3], f"new op: the air dryer, 0.9 h, not approved yet ({O[-2]})")
        ok(O[-1][0] == "DPF cleaning" and O[-1][2] == "Waiting – Sublet" and O[-1][3].startswith("ok"), f"new op: DPF cleaning, Waiting – Sublet, approved ({O[-1]})")
        t = await jtoast(pg); ok("1 operation updated, 2 added." in t, f"toast: {t[:80]}")
        au = await pg.evaluate("(__tg.auditLog()||[]).slice(-3).map(a=>a.text)")
        ok(any("extracted operations" in x for x in au), f"the Activity log keeps a line ({au[-1:]})")
        await pg.screenshot(path=os.path.join(OUT, "b2_applied.png"))
        await jundo(pg)
        O2 = await pg.evaluate(OPS + f"('{rid}')")
        ok(len(O2) == n0 and O2[0][1] == 1 and not O2[0][2], f"one Undo puts it all back ({len(O2)} ops, Op 1 {O2[0][1]} h)")
        # ---- the labelled layout: Complete / Declined / Waiting – Customer, approvals incl. Not needed
        await pg.evaluate(J("R.querySelector('.rop-xops').click()")); await pg.wait_for_timeout(400)
        await settext(pg, T2)
        R2 = await pg.evaluate(ROWS)
        ok([r[2] for r in R2] == ["Complete", "Declined", "Waiting – Customer"], f"labelled statuses ({[r[2] for r in R2]})")
        ok([r[4] for r in R2] == ["Approved", "Declined", "Not needed"], f"labelled approvals ({[r[4] for r in R2]})")
        ok([r[3] for r in R2] == ["1.50", "2.20", "1.00"], f"labelled hours ({[r[3] for r in R2]})")
        # change a row by hand: send row 3 to Op 2, untick row 1, then apply
        await pg.evaluate(J("const r=[...R.querySelectorAll('.ox-row:not(.ox-h)')]; const s=r[2].querySelector('select'); s.value=" + json.dumps(ob) + "; s.dispatchEvent(new Event('change',{bubbles:true}));")); await pg.wait_for_timeout(200)
        await pg.evaluate(J("const r=[...R.querySelectorAll('.ox-row:not(.ox-h)')]; const c=r[0].querySelector('input[type=checkbox]'); c.click();")); await pg.wait_for_timeout(200)
        sb = await pg.evaluate(J("return R.querySelector('.px-modal--ox .px-modal__f .px-btn--primary').textContent"))
        ok(sb == "Update 1 · add 1", f"picked by hand: {sb}")
        await pg.evaluate(J("R.querySelector('.px-modal--ox .px-modal__f .px-btn--primary').click()")); await pg.wait_for_timeout(500)
        O3 = await pg.evaluate(OPS + f"('{rid}')")
        ok(O3[1][0] == "Wheel alignment" and O3[1][2] == "Waiting – Customer" and O3[1][3] == "ok/Not needed", f"Op 2 updated by hand: Wheel alignment, Waiting – Customer, no approval needed ({O3[1]})")
        ok(O3[-1][0] == "Replace outlet NOx sensor" and O3[-1][4] and O3[-1][3].startswith("no"), f"the declined one comes in declined ({O3[-1]})")
        await jundo(pg)
        # ---- a screenshot of the same paperwork, read on this computer
        shot = os.path.join(OUT, "paperwork.png")
        p2 = await b.new_page(viewport={"width": 900, "height": 220})
        await p2.set_content("<pre style='font:18px/1.5 Arial, sans-serif;margin:16px;color:#111;background:#fff'>" + T1.replace("&", "&amp;").replace("<", "&lt;") + "</pre>")
        await p2.screenshot(path=shot); await p2.close()
        await pg.evaluate(J("R.querySelector('.rop-xops').click()")); await pg.wait_for_timeout(400)
        fin = await pg.evaluate_handle(J("return R.querySelector('.px-modal--ox input[type=file]')"))
        await fin.as_element().set_input_files(shot)
        R3 = []
        for i in range(60):
            await pg.wait_for_timeout(1000)
            R3 = await pg.evaluate(ROWS)
            stt = await pg.evaluate(J("return (R.querySelector('.ox-status')||{}).textContent||''"))
            if R3 or "Couldn" in stt or "No text" in stt: break
        print("    OCR status:", stt)
        ok(len(R3) >= 3 and R3[0][0] == "Update Op 1", f"the screenshot reads the same operations ({[(r[0], r[1][:24], r[2], r[3], r[4]) for r in R3]})")
        ok(len(R3) >= 3 and R3[2][2] == "Waiting – Sublet" and R3[0][2] == "Waiting – Parts", "…with their statuses")
        await pg.screenshot(path=os.path.join(OUT, "b3_screenshot.png"))
        await pg.evaluate(J("const x=R.querySelector('.px-modal--ox .px-modal__h button'); x && x.click();")); await pg.wait_for_timeout(200)
        # ---- graphite + a narrow pane
        await pg.evaluate("(()=>{ try{ __tg.applyTheme('graphite'); }catch(e){} })()"); await pg.set_viewport_size({"width": 1100, "height": 860}); await pg.wait_for_timeout(300)
        await pg.evaluate(J("R.querySelector('.rop-xops').click()")); await pg.wait_for_timeout(300); await settext(pg, T1)
        bx = await pg.evaluate(J("const m=R.querySelector('.px-modal--ox'); const q=m.getBoundingClientRect(); return [q.left >= 0, q.right <= innerWidth]"))
        ok(bx == [True, True], f"the dialog fits at 1100 px ({bx})")
        await pg.screenshot(path=os.path.join(OUT, "b4_dark_1100.png"))
        print("ERRORS", errs[:6]); ok(not errs, "no console errors")
        await b.close()
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
