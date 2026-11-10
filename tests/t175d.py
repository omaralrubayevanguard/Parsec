# Parsec 17.5 (D) — parts pasted on their own into an RO: a Parts list of its own (Part #, Part, Qty, Cost, Ext, Goes on);
# a part already on its operation starts unticked; a cell can be changed; each row picks its operation; Add keeps the window
# open and marks each row Added; a ticked duplicate is added again as its own line. Invented data only.
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
ASIST = "22769526\t\n1.00\n (1.000/0.000)\tGet parts availability\tCHARGE AIR COOLER Catalog\t\t\n1,008.23\n0.00\n$1,008.23\t\n\n \n1675066\t\n2.00\n (2.000/0.000)\tGet parts availability\tSEALING RING Catalog\t\t\n5.64\n0.00\n$11.28\t\n\n \n20592783\t\n2.00\n (2.000/0.000)\tGet parts availability\tV-CLAMP Catalog\t\t\n39.65\n0.00\n$79.30\t\n"
W = "#imp-dlg "
PARTS = "([id, op]) => __tg.getRO(id).operations.find(o => o.id === op).parts.map(p => [p.partNumber, String(p.qty), String(p.price)])"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1300, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        rid, o1, o2 = await pg.evaluate("""(() => { const r = __tg.S().ros.find(r => !r.shop && !r.dateClosed && r.operations.filter(o => !o.declined).length >= 2); const O = r.operations.filter(o => !o.declined);
          O[1].parts = (O[1].parts || []).concat([{ id: 'pt_dup', partNumber: '1675066', description: 'SEALING RING', qty: '1', status: 'Not Ordered' }]); return [r.id, O[0].id, O[1].id]; })()""")
        n1, n2 = await pg.evaluate("([id, a, b]) => [__tg.getRO(id).operations.find(o => o.id === a).parts.length, __tg.getRO(id).operations.find(o => o.id === b).parts.length]", [rid, o1, o2])
        await pg.evaluate("([id, op, t]) => __tg.IMPX.open({ ro: id, opId: op, text: t })", [rid, o2, ASIST]); await pg.wait_for_timeout(900)
        rows = await pg.evaluate(f"[...document.querySelectorAll('{W}.ix-pl tbody tr')].map(r => [r.querySelector('[data-ixpl=pn]').value, r.querySelector('[data-ixpl=on]').checked, r.querySelector('[data-ixpl=to]').value, (r.querySelector('.ix-pldup') || {{}}).textContent || ''])")
        ok(len(rows) == 3 and [r[0] for r in rows] == ["22769526", "1675066", "20592783"] and all(r[2] == o2 for r in rows), "a Parts list of its own; every row goes on the operation it was pasted from (%s)" % rows)
        ok(rows[0][1] and not rows[1][1] and rows[2][1] and "already" in rows[1][3], "the part already on that operation starts unticked, and says so (%s)" % rows[1])
        btn = await pg.evaluate(f"document.querySelector('{W}[data-ix=pladd]').textContent")
        ok(btn == "Add 2 parts", "the button counts the ticked ones (%s)" % btn)
        await pg.fill(f"{W}.ix-pl tbody tr:nth-child(1) [data-ixpl=cost]", "950.00"); await pg.press(f"{W}.ix-pl tbody tr:nth-child(1) [data-ixpl=cost]", "Tab"); await pg.wait_for_timeout(200)
        await pg.select_option(f"{W}.ix-pl tbody tr:nth-child(3) [data-ixpl=to]", o1); await pg.wait_for_timeout(250)
        tot = await pg.evaluate(f"document.querySelector('{W}[data-pltot]').textContent")
        ok(tot == "$1,029.30", "a changed cost changes the total of the ticked parts (%s)" % tot)
        await pg.click(f"{W}[data-ix=pladd]"); await pg.wait_for_timeout(500)
        a1, a2 = await pg.evaluate(PARTS, [rid, o1]), await pg.evaluate(PARTS, [rid, o2])
        ok(len(a2) == n2 + 1 and ["22769526", "1", "950"] in [list(x) for x in a2] and len(a1) == n1 + 1 and ["20592783", "2", "39.65"] in [list(x) for x in a1], "Add: each part on the operation picked on its row, with the cost typed (%s | %s)" % (a2[-1:], a1[-1:]))
        st = await pg.evaluate(f"[!!document.querySelector('#imp-dlg'), [...document.querySelectorAll('{W}.ix-pl tbody tr')].map(r => (r.querySelector('.ix-pla') || {{}}).textContent || ''), document.querySelector('{W}[data-ix=pladd]').textContent]")
        ok(st[0] and st[1] == ["Added", "", "Added"] and st[2] == "All added", "the window stays; the added rows say Added (%s)" % st)
        await pg.click(f"{W}.ix-pl tbody tr:nth-child(2) [data-ixpl=on]"); await pg.wait_for_timeout(200)
        await pg.click(f"{W}[data-ix=pladd]"); await pg.wait_for_timeout(400)
        d = await pg.evaluate("([id, op]) => __tg.getRO(id).operations.find(o => o.id === op).parts.filter(p => p.partNumber === '1675066').length", [rid, o2])
        ok(d == 2, "ticked, the duplicate is added again as its own line (%s)" % d)
        await pg.click(f"{W}[data-ix=close]"); await pg.wait_for_timeout(300)
        ok(not await pg.evaluate("!!document.querySelector('#imp-dlg')"), "Done closes it without asking")
        ok(not errs, "no page errors (%s)" % errs[:2])
        await b.close()
    print("\n%d failed" % len(FAILS) if FAILS else "\nall passed")
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
