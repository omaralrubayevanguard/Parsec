# Parsec 17.5 (A) — ASIST's Operations and Parts tables, copied from the browser. The copy puts each box on an ASIST row (a
# quantity, a price, the salesman's menu) on a line of its own; the reader rebuilds each row under the header's columns.
# Checks: every part's number, name, qty, unit, core, ext and salesman; a core charge kept as its own line and a core return
# as a minus count; the shipped/back-order note, Catalog, Update/Delete and the empty add-row left out; operations read with
# labor = total − parts (no false "check the hours"); the Update RO list's Core, Ext and Salesman and what it saves; the
# operation card's table (Part · Qty · Unit · Core · Ext · Salesman · Status). Fixtures in tests/fixtures/asist (invented names).
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FX = os.path.join(H, "asist") if os.path.isdir(os.path.join(H, "asist")) else os.path.join(H, "fixtures", "asist")
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
rd = lambda n: open(os.path.join(FX, n), encoding="utf-8").read()
READ = """(t)=>{ const X=__tg.IMPX, P=X.parse(t); return { d: X.describe(P), found: P.found,
  ops: P.ops.map(o=>[o.no, o.name, o.hours, o.price, o.partsAmt, o.total]), parts: P.parts.map(x=>[x.pn, x.desc, x.qty, x.price, x.core, x.ext, x.salesman]) }; }"""
SR = "[...document.querySelectorAll('*')].find(h=>h.shadowRoot && h.shadowRoot.querySelector('.rop-pth')).shadowRoot"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1440, "height": 1000}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1500)
        # ---------------------------------------------------------------- reading
        R = await pg.evaluate(READ, rd("parts_copied.txt"))
        ok(R["d"] == "3 parts" and not R["found"], f"the parts table copied from ASIST: 3 parts and nothing else ({R['d']}, {R['found']})")
        ok(R["parts"][0] == ["23350657", "SENSOR", "1", 848.85, 0, 848.85, "Dana Brooks"], f"row 1 in its columns {R['parts'][0]}")
        ok(R["parts"][2] == ["948211", "CABLE TIE", "10", 0.7, 0, 7, "Dana Brooks"], f"row 3: qty 10 × 0.70 = 7.00 {R['parts'][2]}")
        ok(all("Catalog" not in x[1] and "(" not in x[2] for x in R["parts"]), "Catalog and the shipped/back-order note are left out")
        R = await pg.evaluate(READ, rd("parts_cores.txt"))
        ok(len(R["parts"]) == 3, f"three ASIST lines for one battery stay three ({len(R['parts'])})")
        ok(R["parts"][0][4:] == [0, 299.96, "Dana Brooks"] and R["parts"][1][4:] == [31.25, 424.96, ""], f"the core charge on its own line: core 31.25, ext 424.96 {R['parts'][:2]}")
        ok(R["parts"][2][0] == "MWB31S950RR-CORE" and R["parts"][2][2] == "-4" and R["parts"][2][5] == -125, f"the core return: 4 back, −$125.00 {R['parts'][2]}")
        ok(all("UPDATE" not in x[1].upper() and "(NONE)" not in x[1] for x in R["parts"]), "Update / Delete and the empty add-row are left out")
        ok(round(sum(x[5] for x in R["parts"]), 2) == 599.92, "the three lines add up to ASIST's parts total for the operation ($599.92)")
        R = await pg.evaluate(READ, rd("operations.txt"))
        ok(R["d"] == "2 operations", f"the operations table is recognised ({R['d']})")
        ok(R["ops"][0] == [1, "Replace batteries (2), clean cables and verify cut-off switch is functional", 1, 210, 599.92, 809.92], f"op 1: 1.0 h, labor $210 (total − parts) {R['ops'][0]}")
        ok(R["ops"][1][2:] == [1, 210, 732.72, 942.72], f"op 2 {R['ops'][1]}")
        R = await pg.evaluate(READ, rd("operations_copied.txt"))   # the real copy: the header one cell per line, an inspection with lines of its own
        ok(R["d"] == "3 operations", f"the operations table as ASIST copies it ({R['d']})")
        ok(R["ops"][0] == [1, "Check and advise for injector faults", 2, 420, 0, 420] and R["ops"][2][:3] == [3, "74 Complimentary Point Inspection", 0.5], f"each operation's name, hours and labor {R['ops']}")
        ap = await pg.evaluate("t=>__tg.IMPX.parse(t).ops.map(o=>o.approval)", rd("operations_copied.txt"))
        ok(ap == ["Approved"] * 3, f"the approval is read; View Details and the inspection's own lines are passed over {ap}")
        R = await pg.evaluate(READ, rd("operations.txt") + "\n" + rd("parts_cores.txt"))
        ok(R["d"] == "2 operations · 3 parts", f"both tables in one paste ({R['d']})")
        # ---------------------------------------------------------------- New RO: no false warning on the hours
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); })()"); await pg.wait_for_timeout(300)
        await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(300); await pg.evaluate("t=>__tg.IMPX.addText(t)", rd("operations.txt")); await pg.wait_for_timeout(500)
        tx = await pg.evaluate("document.querySelector('#imp-dlg').innerText")
        ok("2 operations" in tx and "an hour" not in tx, "New RO reads the operations; no hours-vs-price warning")
        await pg.evaluate("__tg.IMPX.close()"); await pg.wait_for_timeout(200)
        # ---------------------------------------------------------------- Update RO: the parts list
        rid, oid = await pg.evaluate("(()=>{ const r=__tg.S().ros.find(r=>!r.dateClosed && (r.operations||[]).length); return [r.id, r.operations[0].id]; })()")
        await pg.evaluate("id=>__tg.IMPX.open({ro:id})", rid); await pg.wait_for_timeout(300)
        await pg.evaluate("t=>__tg.IMPX.addText(t)", rd("parts_copied.txt") + "\n" + rd("parts_cores.txt")); await pg.wait_for_timeout(500)
        hd = await pg.evaluate("[...document.querySelectorAll('#imp-dlg .ix-pl th')].map(t=>t.textContent.trim()).filter(Boolean)")
        ok(hd == ["Part #", "Part", "Qty", "Cost", "Core", "Ext", "Salesman", "Goes on"], f"the parts list's columns {hd}")
        tot = await pg.evaluate("document.querySelector('#imp-dlg [data-pltot]').textContent")
        ok(tot == "$1,488.38", f"its total counts the cores and the return ({tot})")
        await pg.evaluate("document.querySelector('#imp-dlg [data-ix=pladd]').click()"); await pg.wait_for_timeout(500)
        sv = await pg.evaluate("a=>__tg.getRO(a[0]).operations.find(o=>o.id===a[1]).parts.slice(-6).map(x=>[x.partNumber, x.qty, String(x.price), String(x.core||''), x.salesman||''])", [rid, oid])
        ok(sv[0] == ["23350657", "1", "848.85", "", "Dana Brooks"] and sv[4][3] == "31.25" and sv[5][1] == "-4", f"Add saves the salesman, the core and the return's count {sv[0]} {sv[4]} {sv[5]}")
        inv = await pg.evaluate("(__tg.S().inventory||[]).some(i=>/-CORE$/i.test(i.pn||''))")
        ok(not inv, "a core return doesn't go on the Parts page as stock")
        await pg.evaluate("__tg.IMPX.close()"); await pg.wait_for_timeout(200)
        # ---------------------------------------------------------------- the operation card
        await pg.evaluate("([r,o])=>{ const U=__tg.UI(); U.view='ros'; U.selectedRo=r; U.roOp=U.roOp||{}; U.roOpen=U.roOpen||{}; U.roOp[r]=o; U.roOpen[r]=[o]; __tg.render(); }", [rid, oid]); await pg.wait_for_timeout(900)
        hd = await pg.evaluate("[..." + SR + ".querySelector('.rop-pth').children].map(c=>c.textContent.trim()).filter(Boolean)")
        ok(hd == ["Part", "Qty", "Unit", "Core", "Ext", "Salesman", "Status"], f"the operation card's parts columns {hd}")
        rw = await pg.evaluate("[..." + SR + ".querySelectorAll('.rop-prow')].slice(-2).map(r=>[...r.children].slice(1, 7).map(c=>c.querySelector('select') ? c.querySelector('select').value : c.textContent.trim()))")
        ok(rw[0][2:] == ["$74.99", "$31.25", "$424.96", ""] and rw[1][1:5] == ["-4", "", "$31.25", "-$125.00"], f"core charge and core return on the card {rw}")
        ok(rw[0][0].startswith("BATT_ GP31S COMMERCIAL FL") and rw[0][0].endswith("MWB31S950RR"), f"the part number sits under the name ({rw[0][0]})")
        await pg.screenshot(path=os.path.join(H, "_t176a_card.png"))
        # ---------------------------------------------------------------- the Salesman menu: the Parts department's people
        await pg.evaluate("__tg.ensureDemoTeam()"); await pg.evaluate("__tg.render()"); await pg.wait_for_timeout(600)
        opts = await pg.evaluate("[...[..." + SR + ".querySelectorAll('.rop-prow')].slice(-6)[0].querySelector('select.rop-sm').options].map(o=>o.text)")
        ok("Ben Okafor" in opts and "Dana Brooks" in opts and opts[0] == "—", f"the Salesman menu lists the Parts people and keeps the name read from ASIST {opts}")
        await pg.evaluate("(()=>{ const s=[..." + SR + ".querySelectorAll('.rop-prow')].slice(-6)[0].querySelector('select.rop-sm'); s.value='Ben Okafor'; s.dispatchEvent(new Event('change', {bubbles:true})); })()"); await pg.wait_for_timeout(400)
        sm = await pg.evaluate("a=>__tg.getRO(a[0]).operations.find(o=>o.id===a[1]).parts.slice(-6)[0].salesman", [rid, oid])
        ok(sm == "Ben Okafor", f"picking a name saves it on the part ({sm})")
        # signed in as someone in Parts, a part they add is theirs
        await pg.evaluate("(()=>{ const b=__tg.S().staff.find(s=>s.name==='Ben Okafor'); localStorage.setItem('tec_viewas', b.id); })()")
        await pg.evaluate("id=>__tg.IMPX.open({ro:id})", rid); await pg.wait_for_timeout(300)
        await pg.evaluate("t=>__tg.IMPX.addText(t)", "Part No\tQTY (SHIPPED/BO)\tParts\tPart Name\tInfo\tUnit Price\tCore Price\tExt. Price\tSalesman\tActions\n20999999\t\n2.00\n (2.000/0.000)\tGet parts availability\tO-RING Catalog\t\t\n3.10\n0.00\n$6.20\t\n\n \n"); await pg.wait_for_timeout(500)
        await pg.evaluate("document.querySelector('#imp-dlg [data-ix=pladd]').click()"); await pg.wait_for_timeout(500)
        sm = await pg.evaluate("a=>{ const P=__tg.getRO(a[0]).operations.find(o=>o.id===a[1]).parts; return P[P.length-1].salesman; }", [rid, oid])
        ok(sm == "Ben Okafor", f"a part with no salesman, added by someone in Parts, is theirs ({sm})")
        await pg.evaluate("localStorage.removeItem('tec_viewas')")
        ok(not errs, f"no page errors {errs[:3]}")
        print(("PASS" if not FAILS else "FAILED %d" % len(FAILS)), len(FAILS))
        await b.close()
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
