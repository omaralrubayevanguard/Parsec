import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots12c"); os.makedirs(OUT, exist_ok=True)
FX = lambda n: open(os.path.join(H, "imptest", n), encoding="utf-8").read()
SR = "document.querySelector('.jc-host') && document.querySelector('.jc-host').shadowRoot"
PASTE = """(t => { const dt = new DataTransfer(); dt.setData('text/plain', t); const z = document.querySelector('#imp-dlg .ix-drop') || document.body; z.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); })"""
ROWS = """(() => [...document.querySelectorAll('#imp-dlg .ix-fr')].filter(r => !/\\bnone\\b/.test(r.className)).map(r => r.querySelector('.ix-fl').textContent + '=' + (r.className.split(' ')[1]) ).join(' | '))()"""
fails = []
def ok(c, m):
    if not c: fails.append(m); print("FAIL", m)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w, h, tag in [(1440, 900, "d"), (390, 844, "ph")]:
            ctx = await b.new_context(viewport={"width": w, "height": h}, is_mobile=w < 600, has_touch=w < 600); pg = await ctx.new_page(); pg.set_default_timeout(8000); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
            pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
            await pg.route("**/fonts.g*/**", lambda r: r.abort())
            if w < 600: await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
            await pg.goto("file://" + H + "/t12c.html"); await pg.wait_for_timeout(1200)
            await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
            if w >= 600:
                await pg.evaluate("__tg.PG.go('triage')"); await pg.wait_for_timeout(500)
                await pg.click('[data-action="ty-newro"]'); await pg.wait_for_timeout(400)
            else:
                await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(400)
            ok(await pg.evaluate("!!document.getElementById('imp-dlg')"), tag + " dialog opens")
            await pg.screenshot(path=os.path.join(OUT, tag + "_0empty.png"))
            await pg.evaluate(PASTE + "(" + json.dumps(FX("case1.txt")) + ")"); await pg.wait_for_timeout(400)
            st = await pg.evaluate("(() => { const D = __tg.IMPX.state(); const c = __tg.IMPX.counts(); return { new: D.new, pieces: D.pieces.map(p => p.name + ': ' + p.what), c, ops: document.querySelectorAll('#imp-dlg .ix-op').length, notes: document.querySelectorAll('#imp-dlg .ix-note').length, tot: [...document.querySelectorAll('#imp-dlg .ix-tot small')].map(x => x.textContent).join(' / '), btn: document.querySelector('#imp-dlg [data-ix=apply]').textContent }; })()")
            print(tag, "after case1:", json.dumps(st)); print(tag, "rows:", await pg.evaluate(ROWS))
            ok(st["new"] and st["ops"] == 2 and st["notes"] == 2, tag + " case1 read")
            await pg.screenshot(path=os.path.join(OUT, tag + "_1case1.png"))
            if w >= 600:
                await pg.evaluate("document.querySelector('#imp-dlg .ix-fs').scrollTop = 900"); await pg.wait_for_timeout(100); await pg.screenshot(path=os.path.join(OUT, tag + "_1case1b.png"))
            # create it
            await pg.click('#imp-dlg [data-ix="apply"]'); await pg.wait_for_timeout(600)
            ro = await pg.evaluate("(() => { const r = __tg.STATE().ros.find(x => x.roNumber === 'RA0001238877'); if(!r) return null; return { id: r.id, st: r.status.status, po: r.poNumber, ch: r.chassis, es: r.engineSerial, dept: r.department, fu: r.followUpAt, pr: r.promisedAt, cb: r.createdBy, yr: r.year, mk: r.make, md: r.model, loc: r.location, ops: r.operations.map(o => [o.complaint, o.quoted, o.estCost, o.asistApproval, o.label, o.skill, (o.offNotes||[]).map(n=>n.text).join('|'), o.parts.map(p => [p.partNumber, p.price, p.core, p.salesman].join('/')).join(';')]), xn: (r.extNotes||[]).length, mem: Object.keys((r.imp||{}).f||{}).length, view: __tg.UI().view, sel: __tg.UI().selectedRo === r.id, staff: __tg.staffList().filter(s => s.ext).map(s => s.name + ':' + s.role) }; })()")
            print(tag, "created:", json.dumps(ro))
            ok(ro and ro["po"] == "PO-55120" and ro["ch"] == "758560" and ro["es"] == "23116577" and ro["dept"] == "Service" and len(ro["ops"]) == 2, tag + " fields written")
            ok(ro and ro["ops"][0][3] == "Approved" and ro["ops"][1][3] == "Pending" and ro["ops"][0][5] == "B" and "Op code CL-210" in ro["ops"][0][6] and "VOL-85013702/1240/150/Ryan Burke" in ro["ops"][0][7], tag + " ops written")
            ok(ro and ro["xn"] == 2 and ro["sel"], tag + " notes + RO opened")
            print(tag, "toast:", await pg.evaluate("(document.querySelector('.toast')||{}).textContent||''"))
            inv = await pg.evaluate("(() => { const L = __tg.STATE().inventory || []; const it = L.find(x => (x.pn||'').toUpperCase() === 'VOL-85013702'); return it ? it.price : null; })()")
            ok(str(inv) == "1240", tag + " parts list price " + str(inv))
            if w >= 600: await pg.screenshot(path=os.path.join(OUT, tag + "_2ropage.png"))
            # someone changes the location here by hand
            await pg.evaluate(f"(() => {{ const r = __tg.getRO('{ro['id']}'); r.location = 'B4'; __tg.render(); }})()"); await pg.wait_for_timeout(300)
            # Import on the RO page
            if w >= 600:
                hb = await pg.evaluate(f"(() => {{ const R = {SR}; if(!R) return 'nohost'; const b = [...R.querySelectorAll('.px-head__acts button')].find(x => /Import from ASIST/.test(x.getAttribute('aria-label') || x.title || '')); if(!b) return 'nobtn'; b.click(); return 'ok'; }})()")
                ok(hb == "ok", tag + " RO header Import button: " + hb)
            else:
                await pg.evaluate(f"__tg.IMPX.open({{ ro: '{ro['id']}' }})")
            await pg.wait_for_timeout(400)
            ok(await pg.evaluate("(() => { const D = __tg.IMPX.state(); return !!D && !D.new && D.fixed; })()"), tag + " update mode")
            await pg.evaluate(PASTE + "(" + json.dumps(FX("case2.txt")) + ")"); await pg.wait_for_timeout(400)
            rows = await pg.evaluate(ROWS); print(tag, "rows 2:", rows)
            c2 = await pg.evaluate("__tg.IMPX.counts()"); print(tag, "counts 2:", json.dumps(c2))
            ok("Location=kept" in rows and "Status=upd" in rows and "ETR → Promised=upd" in rows and "Auth #=new" in rows and "Odometer → Miles=upd" in rows and "Case #=same" in rows, tag + " merge badges")
            opb = await pg.evaluate("[...document.querySelectorAll('#imp-dlg .ix-op')].map(o => o.querySelector('.ix-on b').textContent + '=' + ((o.querySelector('.ix-oh > .ix-bd:last-child')||{}).textContent||'')).join(' | ')")
            print(tag, "ops 2:", opb)
            ok("Updated" in opb and "PM service" in opb, tag + " op badges")
            await pg.screenshot(path=os.path.join(OUT, tag + "_3update.png"))
            await pg.click('#imp-dlg [data-ix="only"][data-v="1"]'); await pg.wait_for_timeout(200)
            await pg.screenshot(path=os.path.join(OUT, tag + "_3update_changes.png"))
            if w >= 600:
                await pg.evaluate("document.querySelector('#imp-dlg .ix-fs').scrollTop = 600"); await pg.wait_for_timeout(100); await pg.screenshot(path=os.path.join(OUT, tag + "_3update_b.png"))
            await pg.click('#imp-dlg [data-ix="apply"]'); await pg.wait_for_timeout(100)
            print(tag, "toast after import:", await pg.evaluate("(document.querySelector('.toast')||{}).textContent||''"), "| undo button:", await pg.evaluate("!!document.querySelector('.toast-undo')"))
            await pg.wait_for_timeout(500)
            print(tag, "undo button 600ms later:", await pg.evaluate("!!document.querySelector('.toast-undo')"))
            r2 = await pg.evaluate(f"(() => {{ const r = __tg.getRO('{ro['id']}'); return {{ st: r.status.status, loc: r.location, auth: r.authNumber, ts: r.techSupportCase, mi: r.mileage, ops: r.operations.map(o => [o.complaint, o.asistApproval, o.parts.length, (o.work||'').slice(0,30)]), xn: (r.extNotes||[]).length, hist: (r.history||[]).filter(h => h.k === 'import').map(h => h.t + ': ' + h.n), staff: __tg.staffList().filter(s => s.ext).map(s => s.name + ':' + s.role + (s.noSignIn ? ':nosign' : '')), n: r.imp.n, cause: r.caseCause }}; }})()")
            print(tag, "after apply:", json.dumps(r2))
            ok(r2["st"] == "Waiting – Parts" and r2["loc"] == "B4" and r2["auth"] == "A-77310" and r2["mi"] == "413104", tag + " applied fields (location kept)")
            ok(len(r2["ops"]) == 3 and r2["ops"][1][1] == "Approved" and r2["ops"][0][2] == 3 and r2["ops"][1][2] == 1 and "Removed the transmission" in r2["ops"][0][3], tag + " applied ops")
            ok(r2["xn"] == 5 and len(r2["hist"]) == 2 and any("Dana Price:Other:nosign" == s for s in r2["staff"]), tag + " notes, history, people")
            # the RO page's Activity shows ASIST's notes
            if w >= 600:
                act = await pg.evaluate(f"(() => {{ const R = {SR}; const b = [...R.querySelectorAll('.px-totals .px-total')].find(x => /Activity/.test(x.getAttribute('aria-label')||'')); if(!b) return 'nobtn'; b.click(); return 'ok'; }})()"); await pg.wait_for_timeout(400)
                txt = await pg.evaluate(f"(() => {{ const R = {SR}; const d = R.querySelector('.px-modal'); return d ? d.textContent : ''; }})()")
                print(tag, "activity text:", txt[:600]); ok("wrote in ASIST" in txt and "mported from ASIST" in txt, tag + " Activity has ASIST notes")
                await pg.screenshot(path=os.path.join(OUT, tag + "_4activity.png")); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
            # Undo takes the whole import back
            for _u in range(3):   # the automation that the status change set off has its own undo step on top
                left = await pg.evaluate(f"(() => {{ const r = __tg.getRO('{ro['id']}'); return r.operations.length; }})()")
                if left == 2: break
                await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(400)
            r3 = await pg.evaluate(f"(() => {{ const r = __tg.getRO('{ro['id']}'); return r ? [r.operations.length, (r.extNotes||[]).length, r.status.status, r.location] : null; }})()")
            print(tag, "after undo:", r3); ok(r3 and r3[0] == 2 and r3[1] == 2 and r3[2] == "Hold Tech", tag + " undo")
            # OCR-ish text into a fresh New RO matches the RO by its number
            await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(300)
            await pg.evaluate(PASTE + "(" + json.dumps(FX("case1_ocr.txt")) + ")"); await pg.wait_for_timeout(300)
            m = await pg.evaluate("(() => { const D = __tg.IMPX.state(); return [D.new, D.foundBy, __tg.IMPX.counts().changes]; })()"); print(tag, "ocr text finds the RO:", m)
            ok(m[0] is False and m[1] == "its RO #", tag + " found by RO #")
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
            ok(not await pg.evaluate("!!document.getElementById('imp-dlg')"), tag + " Esc closes")
            # split screenshots-as-text into one new RO
            await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(300)
            for f in ["shot_op1.txt", "shot_parts.txt", "shot_notes.txt"]:
                await pg.evaluate(PASTE + "(" + json.dumps(FX(f)) + ")"); await pg.wait_for_timeout(200)
            await pg.screenshot(path=os.path.join(OUT, tag + "_5pieces.png"))
            nb = await pg.evaluate("(() => { const b = document.querySelector('#imp-dlg [data-ix=apply]'); b.click(); return document.querySelector('#imp-dlg .ix-err') ? document.querySelector('#imp-dlg .ix-err').textContent : 'no error'; })()")
            ok("Still needed" in nb, tag + " Create needs RO # and customer: " + nb)
            await pg.fill('#imp-dlg [data-ixf="roNumber"]', "RA0001239001"); await pg.fill('#imp-dlg [data-ixf="customerName"]', "Blue Ridge Haulers")
            await pg.click('#imp-dlg [data-ix="apply"]'); await pg.wait_for_timeout(500)
            r4 = await pg.evaluate("(() => { const r = __tg.STATE().ros.find(x => x.roNumber === 'RA0001239001'); return r ? [r.customerName, r.operations.length, r.operations[0].parts.length, (r.extNotes||[]).length] : null; })()")
            print(tag, "typed + pieces:", r4); ok(r4 and r4[1] == 1 and r4[2] == 3 and r4[3] == 2, tag + " pieces + typed RO")
            if w >= 600:
                for th in ["ivd", "vvl", "vvd", "ivl"]:
                    await pg.evaluate(f"__tg.applyTheme('{th}')"); await pg.wait_for_timeout(200)
                    await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(200)
                    await pg.evaluate(PASTE + "(" + json.dumps(FX("case2.txt")) + ")"); await pg.wait_for_timeout(300)
                    await pg.screenshot(path=os.path.join(OUT, f"{tag}_th_{th}.png")); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(150)
            print(tag, "ERRORS", errs[:8]); ok(not errs, tag + " no console errors")
            await ctx.close()
        await b.close()
    print("FAILS", len(fails), fails)
asyncio.run(main())
