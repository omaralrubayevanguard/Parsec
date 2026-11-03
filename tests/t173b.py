# Parsec 17.3 (B) — New RO checks what it read: letters read for digits are put back (miles, hours, amounts, part numbers, a VIN
# by its check digit); values that have to agree are checked (the VIN's year, dates in order, hours against the labor price, a
# part's line total) and counted in "to check"; and what Parsec already knows is offered (a customer one letter off, the truck
# by its VIN with its unit, a part number one character off, what a fault code means). Invented data only.
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.pxSignedIn && __tg.pxSignedIn()"); await pg.wait_for_timeout(300)
        # a closed RO with a VIN and a part — the truck and the part the shop knows
        k = await pg.evaluate("""(() => { const R = __tg.S().ros.filter(r => !r.shop && r.vin && r.customerName && r.unitNumber && (r.operations||[]).some(o => (o.parts||[]).some(p => p.partNumber && p.partNumber.replace(/[^0-9]/g,'').length >= 5)));
          const r = R[0]; r.dateClosed = r.dateClosed || new Date(Date.now() - 864e5).toISOString(); __tg.setRoStatus(r.id, 'Complete – Released', '', true);
          const pn = r.operations.flatMap(o => o.parts || []).find(p => p.partNumber && p.partNumber.replace(/[^0-9]/g,'').length >= 5).partNumber;
          return { vin: r.vin, cust: r.customerName, unit: r.unitNumber, pn }; })()""")
        cust = k["cust"]; i = len(cust) // 2
        while not cust[i].isalpha(): i += 1
        typo = cust[:i] + ("x" if cust[i].lower() != "x" else "y") + cust[i + 1:]
        pn = k["pn"]; j = max(i for i, ch in enumerate(pn) if ch.isdigit()); off = pn[:j] + str((int(pn[j]) + 1) % 10) + pn[j + 1:]
        text2 = ("Case # 5550002\nRO Number: RA0009990002    Status: Checked In\nVIN: %s    Unit #: ZZ-1\n" % k["vin"])
        text = ("Case # 5550001\n%s - Cust# 11111\nRO Number: RA0009990001    Status: Checked In\n"
                "ETR: 10/20/2026 3:00 PM    Follow-up: 10/27/2026 9:00 AM\nAsset Checked In: 10/26/2026 7:42 AM\n"
                "Make: Volvo    Model: VNL64T760    Year: 2O18\nVIN: 4V4NC9EH7LN7S8S6O    Unit #: ZZ-1\nOdometer: 412,88O mi\n"
                "OPERATIONS\nOp #  Operation  Labor Hours  Labor  Approval Status\n"
                "1  Check engine light - NOx sensor fault SPN 3226  15.0  $315.00  Pending\n"
                "Part #  Description  Qty  Unit  Core  Ext\n%s  Filter  1  $10.00  $0.00  $10.00\nVOL-777777  Hose clamp  2  $5.00  $0.00  $13.50\n") % (typo, off)
        await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(300)
        await pg.evaluate("t => __tg.IMPX.addText(t)", text); await pg.wait_for_timeout(500)
        f = await pg.evaluate("JSON.stringify(__tg.IMPX.state().acc.f)"); f = json.loads(f)
        # 2 — letters read for digits
        ok(f.get("vin") == "4V4NC9EH7LN758560", "the VIN is repaired by its check digit (%s)" % f.get("vin"))
        ok(f.get("miles") == "412880" and f.get("year") == "2018", "miles and year read as digits (%s, %s)" % (f.get("miles"), f.get("year")))
        dlg = lambda js: pg.evaluate("(() => { const w = document.getElementById('imp-dlg'); " + js + " })()")
        row = lambda key: dlg("const r = [...w.querySelectorAll('.ix-fr')].find(x => (x.querySelector('.ix-fl')||{}).textContent === %s); return r ? r.textContent : ''" % json.dumps(key))
        # 5 — values that have to agree
        vr = await row("VIN"); yr = await row("Year")
        ok("2020 truck" in vr and "Year reads 2018" in vr, "the VIN's year letter is checked against the Year: %r" % vr[:140])
        ok("the VIN says 2020" in yr, "…and the Year row says so too")
        pr = await row("ETR → Promised")
        ok("before the truck was checked in" in pr, "a promised time before check-in is flagged: %r" % pr[:120])
        op = await dlg("return (w.querySelector('.ix-op .ix-chk')||{}).textContent || ''")
        ok("15.0 h for $315.00 is $21.00 an hour" in op and "1.5 h" in op and "decimal" in op, "hours against the labor price: %r" % op[:160])
        ok("qty × price is $10.00, the line says $13.50" in op, "a part whose line total doesn't add up is flagged")
        # 6 — what Parsec knows
        cr = await row("Customer")
        ok(("on file as " + cust) in cr, "a customer one letter off is matched to %r: %r" % (cust, cr[:120]))
        ok(("the shop has used " + pn) in op, "a part number one character off a known one: %r" % op[:220])
        cd = await dlg("return (w.querySelector('.ix-codes')||{}).textContent || ''")
        ok("SPN 3226" in cd and "NOx" in cd.replace("NOX", "NOx"), "a fault code shows what it means: %r" % cd[:120])
        n = await dlg("const c = w.querySelector('.ix-sum .chk b'); return c ? +c.textContent : 0")
        ok(n >= 6, "the count of things to check is at the top (%s)" % n)
        # the buttons use what Parsec knows
        await dlg("w.querySelector('[data-ix=usev][data-k=customerName]').click()"); await pg.wait_for_timeout(200)
        cr2 = await row("Customer")
        ok("on file as" not in cr2 and cust in await dlg("return [...w.querySelectorAll('.ix-fr input')].map(i => i.value).join('|')"), "Use it puts the customer on file in")
        n2 = await dlg("const c = w.querySelector('.ix-sum .chk b'); return c ? +c.textContent : 0")
        ok(n2 == n - 1, "…and the count goes down (%s → %s)" % (n, n2))
        # the truck on file, by its VIN
        await pg.evaluate("__tg.IMPX.close && __tg.IMPX.close()"); await pg.wait_for_timeout(200)
        await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(200)
        await pg.evaluate("t => __tg.IMPX.addText(t)", text2); await pg.wait_for_timeout(400)
        vr2 = await row("VIN")
        ok("a truck the shop knows" in vr2 and ("Use unit " + k["unit"]) in vr2, "the VIN brings the truck on file and its unit: %r" % vr2[:140])
        await dlg("w.querySelector('[data-ix=usev][data-k=unitNumber]').click()"); await pg.wait_for_timeout(200)
        ur = await pg.evaluate("__tg.IMPX.state().edits.unitNumber")
        ok(ur == k["unit"], "Use unit puts the truck's unit in (%s)" % ur)
        # clean text has nothing to check
        await pg.evaluate("__tg.IMPX.close && __tg.IMPX.close()"); await pg.wait_for_timeout(200)
        await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(200)
        await pg.evaluate("t => __tg.IMPX.addText(t)", open(os.path.join(H, "imptest", "case1.txt") if os.path.isdir(os.path.join(H, "imptest")) else os.path.join(H, "fixtures", "imptest", "case1.txt")).read()); await pg.wait_for_timeout(400)
        n3 = await dlg("const c = w.querySelector('.ix-sum .chk b'); return c ? +c.textContent : 0")
        what = await dlg("return [...w.querySelectorAll('.ix-fr.chk, .ix-chk')].map(x => x.textContent.slice(0, 120)).join(' | ')")
        ok(n3 == 0, "a clean case has nothing to check (%s %s)" % (n3, what))
        ok(not errs, "no page errors: %s" % errs[:2])
        await b.close()
    print("FAILS:", len(FAILS), FAILS)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
