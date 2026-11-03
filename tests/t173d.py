# Parsec 17.3 (D) — which past fix is the one: an operation with only a complaint matches past fixes by the complaint; once it
# has fault codes or documents, the fix with the same codes and documents comes first (exact), then one sharing a code or a
# document (close), then a fix worded differently but with the same code and bulletin (codes); a same-complaint fix with other
# codes is only "same complaint, other codes". The chip on the operation says which, and the Technician card uses the best tier.
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
SETUP = """(() => {
  const S = __tg.S(), now = new Date().toISOString(), id = p => p + Math.random().toString(36).slice(2, 9);
  S.libDocs = (S.libDocs || []).concat([{ id: 'd_tsb1', kind: 'TSB', num: 'TSB 2026-043', title: 'NOx sensor outlet' }, { id: 'd_tsb2', kind: 'TSB', num: 'TSB 2025-118', title: 'Wiring' }]);
  const done = (cx, faults, docs, fix) => { const ro = { id: id('ro_'), roNumber: 'RA00099' + Math.floor(Math.random() * 1e5), customerName: 'Test Haul', dateOpened: now, dateClosed: now, status: { status: 'Complete – Released' },
    operations: [{ id: id('op_'), complaint: cx, faults: faults, docs: docs.map(d => ({ id: d, at: now })), parts: [], log: [{ kind: 'fix', at: now, text: fix }], correction: fix, quoted: 1.5, burnt: 1.4 }] }; S.ros.push(ro); return ro.operations[0].id; };
  const A = done('Check engine light - NOx sensor fault', [{ spn: 3226, fmi: 2 }], ['d_tsb1'], 'Replaced the outlet NOx sensor per TSB 2026-043');
  const B = done('Check engine light - NOx sensor fault', [{ spn: 3226, fmi: 2 }], [], 'Repaired the NOx sensor harness');
  const C = done('Check engine light - NOx sensor fault', [{ spn: 4364, fmi: 18 }], ['d_tsb2'], 'Replaced the DEF doser');
  const D = done('CEL on, NOx outlet reads high', [{ spn: 3226, fmi: 2 }], ['d_tsb1'], 'Outlet NOx sensor per the bulletin');
  const open = { id: id('ro_'), roNumber: 'RA0009900001', customerName: 'Test Haul', dateOpened: now, status: { status: 'Hold Tech' }, operations: [{ id: 'op_live', complaint: 'Check engine light - NOx sensor fault', faults: [], docs: [], parts: [] }] };
  S.ros.push(open); return { A, B, C, D, ro: open.id };
})()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.pxSignedIn && __tg.pxSignedIn()"); await pg.wait_for_timeout(300)
        X = await pg.evaluate(SETUP)
        M = "(() => { const op = __tg.getRO(%s).operations[0]; %s; const m = __tg.fixMatchFor(op); return [m.tier, m.items.map(i => i.opId), m.n]; })()"
        r = lambda js: pg.evaluate(M % (json.dumps(X["ro"]), js))
        w = await r("op.faults = []; op.docs = []")
        ok(w[0] == "words" and set(w[1]) >= {X["A"], X["B"], X["C"]} and X["D"] not in w[1], "complaint only: every fix with the same complaint (%s, %d)" % (w[0], len(w[1])))
        e = await r("op.faults = [{ spn: 3226, fmi: 2 }]; op.docs = [{ id: 'd_tsb1' }]")
        ok(e[0] == "exact" and e[1] == [X["A"]], "complaint + code + document: only the exact fix (%s)" % e[0])
        c = await r("op.faults = [{ spn: 3226, fmi: 0 }]; op.docs = [{ id: 'd_tsb9' }]")
        ok(c[0] == "exact" and set(c[1]) == {X["A"], X["B"]}, "a code with another FMI and an unknown document: the fixes with that code (%s)" % c[0])
        c2 = await r("op.faults = [{ spn: 3226, fmi: 2 }, { spn: 4364, fmi: 18 }]; op.docs = [{ id: 'd_tsb1' }]")
        ok(c2[0] == "close" and c2[1][0] == X["A"] and X["C"] in c2[1], "no fix has all of them: the ones sharing a code or a document, most shared first (%s)" % c2[0])
        d = await r("op.complaint = 'Engine light on'; op.faults = [{ spn: 3226, fmi: 2 }]; op.docs = [{ id: 'd_tsb1' }]")
        ok(d[0] == "codes" and set(d[1]) == {X["A"], X["D"]}, "worded differently, same code and bulletin: found anyway (%s)" % d[0])
        o = await r("op.complaint = 'Check engine light - NOx sensor fault'; op.faults = [{ spn: 1569, fmi: 31 }]; op.docs = []")
        ok(o[0] == "other", "same complaint, other codes: never shown as the fix (%s)" % o[0])
        # the chip on the RO page
        await pg.evaluate("x => { const op = __tg.getRO(x).operations[0]; op.faults = [{ spn: 3226, fmi: 2 }]; op.docs = [{ id: 'd_tsb1' }]; const U = __tg.UI(); U.view = 'ros'; U.selectedRo = x; __tg.render(); }", X["ro"]); await pg.wait_for_timeout(1500)
        chip = await pg.evaluate("(() => { const R = document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot; const b = R.querySelector('.fxl'); return b ? [b.textContent, b.className] : null; })()")
        ok(chip and chip[0] == "Fixed 1× before" and "fxl-exact" in chip[1], "the operation's chip counts the exact fix (%s)" % chip)
        await pg.evaluate("(() => { const R = document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot; R.querySelector('.fxl').click(); })()"); await pg.wait_for_timeout(900)
        ok(await pg.evaluate("__tg.UI().view") == "fixes", "…and opens the Fixes page with it first")
        ok(not errs, "no page errors: %s" % errs[:2])
        await b.close()
    print("FAILS:", len(FAILS), FAILS)
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
