# Parsec 17.3 (O) — pasting part of an RO into an RO's extraction window: one operation on its own (Operation 3, Complaint /
# Cause / Correction, Labor) becomes an operation, not the case's story; parts on their own go on one of the RO's operations
# (picked in the window), not on a new operation called Parts; the RO's own fields stay out of the way when the paste has none.
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
OP = "Operation 3\nComplaint: Customer states check engine light on, low power\nCause: Found EGR valve stuck open, code P0401\nCorrection: Replaced EGR valve, cleared codes, road tested OK\nLabor: 2.5 hrs"
PARTS = "Part Number    Description            Qty   Price\n21479638       EGR VALVE              1     612.40\n20532237       GASKET EGR             2     18.75"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        rid = await pg.evaluate("() => { const r = __tg.S().ros.find(r => !r.shop && !r.dateClosed && r.operations.length >= 2); const U = __tg.UI(); U.view = 'ros'; U.selectedRo = r.id; __tg.render(); return r.id; }"); await pg.wait_for_timeout(900)
        n0 = await pg.evaluate("id => __tg.getRO(id).operations.length", rid)
        story0 = await pg.evaluate("id => [__tg.getRO(id).caseCause || '', __tg.getRO(id).caseCorrection || '']", rid)
        # one operation
        await pg.evaluate("([id, t]) => __tg.IMPX.open({ ro: id, text: t })", [rid, OP]); await pg.wait_for_timeout(900)
        w = await pg.evaluate("() => ({ ro: !!document.querySelector('#imp-dlg #ix-s-ro'), skip: !!document.querySelector('#imp-dlg .ix-roskip'), ops: document.querySelectorAll('#imp-dlg .ix-ops > *').length })")
        ok(w == {"ro": False, "skip": True, "ops": 1}, "one operation pasted: one operation in the window, the RO's fields folded away (%s)" % w)
        await pg.evaluate("__tg.IMPX.apply()"); await pg.wait_for_timeout(700)
        r = await pg.evaluate("id => { const R = __tg.getRO(id), o = R.operations[R.operations.length - 1]; return { n: R.operations.length, c: o.complaint, q: o.quoted, cause: (o.log || []).filter(l => l.kind === 'cause').map(l => l.text), fix: (o.log || []).filter(l => l.kind === 'fix').map(l => l.text), story: [R.caseCause || '', R.caseCorrection || ''] }; }", rid)
        ok(r["n"] == n0 + 1 and "check engine light" in r["c"].lower() and r["q"] == 2.5 and r["cause"] and "EGR valve stuck" in r["cause"][0] and r["fix"] and "Replaced EGR" in r["fix"][0] and r["story"] == story0,
           "it lands as a new operation with its hours, Cause and Correction; the RO's story is untouched (%s)" % r)
        # parts on their own
        await pg.evaluate("([id, t]) => __tg.IMPX.open({ ro: id, text: t })", [rid, PARTS]); await pg.wait_for_timeout(900)
        sel = await pg.evaluate("() => { const s = document.querySelector('#imp-dlg select[data-ixpl=to]'); return s ? [s.options.length, s.selectedIndex] : null; }")
        ok(sel and sel[0] >= 2 and sel[1] == 0, "parts pasted: each row's Goes on menu lists the RO's operations, the first picked (%s)" % sel)   # 17.5: a menu on each row
        for i in range(2):
            await pg.evaluate("i => { const s = document.querySelectorAll('#imp-dlg select[data-ixpl=to]')[i]; s.selectedIndex = 1; s.dispatchEvent(new Event('change', { bubbles: true })); }", i); await pg.wait_for_timeout(300)
        await pg.click("#imp-dlg [data-ix=pladd]"); await pg.wait_for_timeout(700)
        q = await pg.evaluate("id => { const R = __tg.getRO(id); return { n: R.operations.length, on2: (R.operations[1].parts || []).map(p => p.partNumber), named: R.operations.some(o => o.complaint === 'Parts') }; }", rid)
        ok(q["n"] == n0 + 1 and "21479638" in q["on2"] and "20532237" in q["on2"] and not q["named"], "the parts go on Op 2 as picked — no new operation (%s)" % q)
        ok(not errs, "no page errors (%s)" % errs[:2])
        await b.close()
    print("\n%d failed" % len(FAILS) if FAILS else "\nall passed")
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
