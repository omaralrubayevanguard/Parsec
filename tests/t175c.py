# Parsec 17.5 (C) — pasting parts or an operation into an RO's extraction window: a table copied one cell per line (with or
# without its header), "Part Number: … / Description: … / Qty … / Price …" blocks, and plain lines of words as new operations.
# The parts land on the operation picked; the operation shows on the window like the parts do. Invented data only.
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
STACK = "Part #\nDescription\nQty\nUnit\nCore\nExt\nSalesman\nVOL-85013702\nClutch kit 15.5\"\n1\n$1,240.00\n$150.00\n$1,390.00\nRyan Burke\nVOL-20518417\nPilot bearing\n1\n$38.50\n$0.00\n$38.50\nRyan Burke"
BARE = "21707132\nFILTER, OIL\n2\n$45.20\n85137594\nSENSOR, NOX\n1\n$412.00"
LBL = "Part Number: 21707132\nDescription: FILTER, OIL\nQuantity: 2\nUnit Price: $45.20\n\nPart Number: 85137594\nDescription: SENSOR, NOX\nQuantity: 1\nUnit Price: $412.00"
ASIST = "22769526\t\n1.00\n (1.000/0.000)\tGet parts availability\tCHARGE AIR COOLER Catalog\t\t\n1,008.23\n0.00\n$1,008.23\t\n\n \n1675066\t\n2.00\n (2.000/0.000)\tGet parts availability\tSEALING RING Catalog\t\t\n5.64\n0.00\n$11.28\t\n"
PLAIN = "Check and advise for ABS and parking lights come on when park brakes are released\nReplace driver side mirror glass"
P = "t => { const P = __tg.IMPX.parse(t); return P.parts.map(x => [x.pn, x.desc, String(x.qty), x.price != null ? x.price : x.unit]); }"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1300, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        a = await pg.evaluate(P, STACK)
        ok(a == [["VOL-85013702", "Clutch kit 15.5\"", "1", 1240], ["VOL-20518417", "Pilot bearing", "1", 38.5]], "a parts table copied one cell per line, with its header (%s)" % a)
        a = await pg.evaluate(P, BARE)
        ok(a == [["21707132", "FILTER, OIL", "2", 45.2], ["85137594", "SENSOR, NOX", "1", 412]], "…and without a header: part number, description, qty, cost (%s)" % a)
        a = await pg.evaluate(P, LBL)
        ok(a == [["21707132", "FILTER, OIL", "2", 45.2], ["85137594", "SENSOR, NOX", "1", 412]], "Part Number / Description / Quantity / Unit Price blocks (%s)" % a)
        a = await pg.evaluate("t => __tg.IMPX.parse(t).parts.map(x => [x.pn, x.desc, String(x.qty), x.price])", ASIST)
        ok(a == [["22769526", "CHARGE AIR COOLER", "1", 1008.23], ["1675066", "SEALING RING", "2", 5.64]], "ASIST’s parts grid: part number, name, qty, cost — without Catalog or Get parts availability (%s)" % a)
        rid, oid, n0 = await pg.evaluate("(() => { const r = __tg.S().ros.find(r => !r.shop && !r.dateClosed && r.operations.length >= 2); return [r.id, r.operations[1].id, r.operations[1].parts.length]; })()")
        # parts tab → these parts go on that operation
        await pg.evaluate("([id, op, t]) => __tg.IMPX.open({ ro: id, opId: op, text: t })", [rid, oid, BARE]); await pg.wait_for_timeout(900)
        sel = await pg.evaluate("(() => { const s = document.querySelector('#imp-dlg [data-ix=pto]'); return s ? s.value : null; })()")
        ok(sel == oid, "the window says which operation the parts go on — the one they were pasted from (%s)" % sel)
        await pg.evaluate("__tg.IMPX.apply()"); await pg.wait_for_timeout(700)
        got = await pg.evaluate("([id, op]) => __tg.getRO(id).operations.find(o => o.id === op).parts.map(p => [p.partNumber, p.description])", [rid, oid])
        ok(len(got) == n0 + 2 and ["85137594", "SENSOR, NOX"] in [list(x) for x in got], "Apply adds both parts to that operation (%s)" % got[-2:])
        # plain lines → new operations, shown on the window like the parts
        nops = await pg.evaluate("id => __tg.getRO(id).operations.length", rid)
        await pg.evaluate("([id, t]) => __tg.IMPX.open({ ro: id, text: t })", [rid, PLAIN]); await pg.wait_for_timeout(900)
        oc = await pg.evaluate("(document.querySelector('#imp-dlg #ix-s-ops') || {}).innerText || ''")
        ok("Check and advise for ABS" in oc and "mirror glass" in oc, "two plain lines show as two new operations (%s)" % oc[:160])
        await pg.evaluate("__tg.IMPX.apply()"); await pg.wait_for_timeout(700)
        ok(await pg.evaluate("id => __tg.getRO(id).operations.length", rid) == nops + 2, "Apply adds them to the RO")
        ok(not errs, "no page errors (%s)" % errs[:2])
        await b.close()
    print("\n%d failed" % len(FAILS) if FAILS else "\nall passed")
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
