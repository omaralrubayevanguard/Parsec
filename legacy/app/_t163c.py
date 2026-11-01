# Parsec 16.3 (C) — New RO reads the contact (name, phone, email) and the driver; the last-contact suggestion (Use, never by itself);
# Email / Driver / Driver's phone on the RO's details; Shop buttons by department (Settings, the manager; truck card under the
# department; Foreman and Parts headers; v163ShopOk); the data check and the export.
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots163c"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12_163c.html"
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
def J(js): return "(()=>{ const R=" + SR + "; " + js + " })()"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
SIGN = """((role)=>{ const T=__tg.staffList().filter(s=>s.role===role); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{ __tg.CX.U().skipMorning = __tg.todayStr(); }catch(e){} __tg.render(); return T[0].name; })"""
T1 = """RO #: RA0031677   Case #: 88412
Customer: RICK'S FREIGHT LLC
Contact: DAVE MILLER  Phone: 336-555-0142
Email: dispatch@ricksfreight.com
Driver: TONY RUIZ
Cell: 336.555.0199
Unit: T-198  Tag: 32"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        await pg.evaluate(SIGN + "('Manager')"); await pg.wait_for_timeout(300)

        # ---------- 1. reading the contact
        f = await pg.evaluate("t => __tg.IMPX.parse(t).f", T1)
        ok(f.get("cname") == "Dave Miller", "contact name read and cased: %r" % f.get("cname"))
        ok(f.get("cphone") == "(336) 555-0142", "contact phone normalised: %r" % f.get("cphone"))
        ok(f.get("cemail") == "dispatch@ricksfreight.com", "email read: %r" % f.get("cemail"))
        ok(f.get("dname") == "Tony Ruiz", "driver read: %r" % f.get("dname"))
        ok(f.get("dphone") == "(336) 555-0199", "a bare Cell right after the driver is the driver's: %r" % f.get("dphone"))
        ok(f.get("customer") == "RICK'S FREIGHT LLC" and f.get("unit") == "T-198", "the rest still reads: %r %r" % (f.get("customer"), f.get("unit")))
        f2 = await pg.evaluate("t => __tg.IMPX.parse(t).f", "Customer: Summit Freightways Contact: Jane Doe Phone: (919) 555-0100 x12\nDriver cell: 919 555 0177")
        ok(f2.get("customer") == "Summit Freightways", "labels on one line don't leak into the customer: %r" % f2.get("customer"))
        ok(f2.get("cname") == "Jane Doe" and f2.get("cphone") == "(919) 555-0100 x12", "one-line contact + extension: %r %r" % (f2.get("cname"), f2.get("cphone")))
        ok(f2.get("dphone") == "(919) 555-0177" and not f2.get("dname"), "Driver cell: label: %r" % f2.get("dphone"))
        f3 = await pg.evaluate("t => __tg.IMPX.parse(t).f", "RO #: 55501\nCustomer Contact\nMILLER, DAVE\nContact Phone\n336 555 Ol42\nE-mail: Dave.Miller@RicksFreight.com")
        ok(f3.get("cname") == "Dave Miller", "label on one line, value on the next; LAST, FIRST: %r" % f3.get("cname"))
        ok(f3.get("cphone") == "(336) 555-0142", "the reader's O / l in a phone: %r" % f3.get("cphone"))
        ok(f3.get("cemail") == "dave.miller@ricksfreight.com", "email lower-cased: %r" % f3.get("cemail"))
        f4 = await pg.evaluate("t => __tg.IMPX.parse(t).f", "RO #: 55502\nComplaint: Driver side mirror broken, customer will phone back\nTelematics: yes\nCell phone holder loose")
        ok(not any(f4.get(k) for k in ("cname", "cphone", "cemail", "dname", "dphone")), "complaint words aren't labels: %r" % {k: f4.get(k) for k in ("cname", "cphone", "dname", "dphone")})

        # ---------- 2. the New RO dialog: the rows, Create RO
        await pg.evaluate("t => __tg.IMPX.open({ text: t })", T1); await pg.wait_for_timeout(500)
        rows = await pg.evaluate("Object.fromEntries(__tg.IMPX.plan().rows.filter(r=>/^(contact|driver)/.test(r.k)).map(r=>[r.k,[r.bd,r.fin]]))")
        ok(rows.get("contactName") == ["new", "Dave Miller"] and rows.get("contactPhone") == ["new", "(336) 555-0142"], "Case & customer rows: contact + phone (new): %r" % rows)
        ok(rows.get("contactEmail") == ["new", "dispatch@ricksfreight.com"] and rows.get("driverName") == ["new", "Tony Ruiz"] and rows.get("driverPhone") == ["new", "(336) 555-0199"], "email + driver rows: %r" % rows)
        lab = await pg.evaluate("[...document.querySelectorAll('#imp-dlg .ix-grp')].filter(g=>/Case & customer/.test(g.querySelector('h4').textContent)).map(g=>[...g.querySelectorAll('.ix-fl')].map(x=>x.textContent))[0]")
        ok(all(x in lab for x in ["Contact", "Phone", "Email", "Driver", "Driver’s phone"]), "the dialog shows them in Case & customer: %r" % lab[-6:])
        await pg.screenshot(path=OUT + "/c1_dialog.png")
        await pg.evaluate("__tg.IMPX.apply()"); await pg.wait_for_timeout(500)
        nr = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.filter(r=>/31677/.test(r.roNumber||''))[0]; return r ? [r.id, r.contactName, r.contactPhone, r.contactEmail, r.driverName, r.driverPhone] : null; })()")
        ok(nr and nr[1:] == ["Dave Miller", "(336) 555-0142", "dispatch@ricksfreight.com", "Tony Ruiz", "(336) 555-0199"], "Create RO writes all five: %r" % nr)
        NEWRO = nr[0] if nr else None

        # ---------- 3. the screenshot reader's text goes the same way
        await pg.evaluate("""(t)=>{ __tg.IMPX.open({}); __tg.IMPX.reader(function(){ return Promise.resolve(t); }); __tg.IMPX.read([new File([new Uint8Array([137,80,78,71])], 'shot.png', { type: 'image/png' })]); }""", "RO #: 66601\nCustomer: Delta Cold Chain\nContact: Sam Ortiz\nMobile: 252-555-0188")
        await pg.wait_for_timeout(1500)
        sf = await pg.evaluate("(()=>{ const D=__tg.IMPX.state(); return D ? [D.acc.f.cname, D.acc.f.cphone] : null; })()")
        ok(sf == ["Sam Ortiz", "(252) 555-0188"], "a screenshot's text reads the contact too: %r" % sf)
        await pg.evaluate("document.querySelector('#imp-dlg [data-ix=close]') && document.querySelector('#imp-dlg [data-ix=close]').click()"); await pg.wait_for_timeout(300)

        # ---------- 4. no contact read → the last one used (same unit first) — Use fills it, nothing by itself
        C = await pg.evaluate("""(()=>{ const S=__tg.STATE(), L=S.ros.filter(r=>!r.shop && r.id!=='ro_shop'), src=L[3], cust=src.customerName;
          const mk=(id, no, unit, name, ph, em, days)=>{ const o=JSON.parse(JSON.stringify(src)); o.id=id; o.roNumber=no; o.unitNumber=unit; o.contactName=name; o.contactPhone=ph; if(em) o.contactEmail=em; else delete o.contactEmail;
            o.dateOpened=new Date(Date.now()-days*864e5).toISOString(); o.dateClosed=new Date(Date.now()-(days-1)*864e5).toISOString(); o.status={ status:'Complete – Released', sub:null, setAt:o.dateClosed }; S.ros.push(o); return o; };
          const a=mk('ro_t163a', 'RO-29880', 'UU-77', 'Pat Lee', '(704) 555-0123', 'pat@summit.com', 40);
          mk('ro_t163old', 'RO-29001', 'ZZ-1', 'Old Guy', '(704) 555-0999', '', 5);
          return { cust: cust, unit: 'UU-77', no: a.roNumber }; })()""")
        await pg.evaluate("t => __tg.IMPX.open({ text: t })", "RO #: 77001\nCustomer: " + C["cust"] + "\nUnit: " + C["unit"]); await pg.wait_for_timeout(500)
        sg = await pg.evaluate("(()=>{ const s=document.querySelector('#imp-dlg .v163-sug'); return s ? s.textContent : null; })()")
        ok(sg and "Pat Lee" in sg and "(704) 555-0123" in sg and C["no"] in sg, "suggestion: the same unit's contact, its RO and day: %r" % sg)
        pre = await pg.evaluate("__tg.IMPX.plan().rows.filter(r=>r.k==='contactName')[0].fin")
        ok(pre == "", "nothing filled until Use: %r" % pre)
        await pg.screenshot(path=OUT + "/c2_suggest.png")
        await pg.click("#imp-dlg [data-ix=v163use]"); await pg.wait_for_timeout(300)
        vals = await pg.evaluate("['contactName','contactPhone','contactEmail'].map(k=>document.querySelector('#imp-dlg [data-ixf='+k+']').value)")
        ok(vals == ["Pat Lee", "(704) 555-0123", "pat@summit.com"], "Use fills name, phone and email: %r" % vals)
        ok(await pg.evaluate("!document.querySelector('#imp-dlg .v163-sug')"), "the suggestion goes once the contact is in")
        await pg.evaluate("document.querySelector('#imp-dlg [data-ix=close]').click()"); await pg.wait_for_timeout(300)
        await pg.evaluate("t => __tg.IMPX.open({ text: t })", "RO #: 77002\nCustomer: " + C["cust"] + "\nUnit: QQ-404"); await pg.wait_for_timeout(400)
        sg2 = await pg.evaluate("(()=>{ const s=document.querySelector('#imp-dlg .v163-sug'); return s ? s.textContent : null; })()")
        ok(sg2 and "Old Guy" in sg2 and "RO-29001" in sg2, "another unit → the newest contact for the customer (a closed RO counts): %r" % sg2)
        await pg.evaluate("document.querySelector('#imp-dlg [data-ix=close]').click()"); await pg.wait_for_timeout(200)
        await pg.evaluate("t => __tg.IMPX.open({ text: t })", "RO #: 77003\nCustomer: Nobody Hauling Co\nUnit: N-1"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("!document.querySelector('#imp-dlg .v163-sug')"), "no history → no suggestion")
        await pg.evaluate("document.querySelector('#imp-dlg [data-ix=close]').click()"); await pg.wait_for_timeout(200)

        # ---------- 5. the RO's details: Email, Driver, Driver's phone — edit + undo; the RO page Customer section
        r5 = await pg.evaluate("""(id)=>{ const ro=__tg.STATE().ros.filter(r=>r.id===id)[0]; __tg.roFldSet(ro, 'driverPhone', '919.555.0142'); __tg.roFldSet(ro, 'contactEmail', ' Ops@Rick.COM '); return [ro.driverPhone, ro.contactEmail]; }""", NEWRO)
        await pg.wait_for_timeout(1500)
        act = await pg.evaluate("(id)=>(__tg.STATE().audit||[]).filter(a=>/Driver’s phone/.test(a.text||a.msg||'')).length", NEWRO)
        ok(act >= 1, "the Activity line says it: %r" % act)
        r5b = await pg.evaluate("""(id)=>{ const ro=__tg.STATE().ros.filter(r=>r.id===id)[0]; __tg.roFldSet(ro, 'contactPhone', '3365550100'); return ro.contactPhone; }""", NEWRO)
        ok(r5 == ["(919) 555-0142", "ops@rick.com"] and r5b == "(336) 555-0100", "edits through ROFLD — phones written (336) 555-0142, email lower-case: %r %r" % (r5, r5b))
        await pg.wait_for_timeout(300)
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(200)
        u5 = await pg.evaluate("(id)=>{ const r=__tg.STATE().ros.filter(r=>r.id===id)[0]; return [r.contactPhone, r.driverPhone, r.contactEmail]; }", NEWRO)
        ok(u5[0] == "(336) 555-0142", "Undo puts the phone back: %r" % u5)
        if u5[1] != "(919) 555-0142":   # the undo stack may fold quick edits together — put the two back for the checks below
            await pg.evaluate("""(id)=>{ const ro=__tg.STATE().ros.filter(r=>r.id===id)[0]; ro.driverPhone='(919) 555-0142'; ro.contactEmail='ops@rick.com'; }""", NEWRO)
        dh = await pg.evaluate("(id)=>{ __tg.UI().rodFold = { customer: false }; return __tg.roDetailsHtml(__tg.STATE().ros.filter(r=>r.id===id)[0]); }", NEWRO)
        ok("Driver’s phone" in dh and "Email" in dh and "Tony Ruiz" in dh, "the RO list / Technician details pane shows the new rows")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{NEWRO}'; __tg.render(); }})()"); await pg.wait_for_timeout(1000)
        cs = await pg.evaluate(J("const s=R.querySelector('.rop-k-customer'); return s ? s.textContent : ''"))
        ok("Dave Miller" in cs and "Driver’s phone" in cs and "(919) 555-0142" in cs and "ops@rick.com" in cs, "the RO page Customer section: contact, phone, email, driver: %r" % cs[:160])

        # ---------- 6. Settings: Shop buttons by department (the manager)
        D = await pg.evaluate("""(()=>{ const L=__tg.STATE().ros.filter(r=>!r.shop && r.id!=='ro_shop' && !r.dateClosed); L[0].department='Service'; L[1].department='Body shop'; L[2].department='body  shop'; return [L[0].id, L[1].id, L[2].id]; })()""")
        await pg.evaluate("__tg.sgGo('shop.shopBtns')"); await pg.wait_for_timeout(500)
        tb = await pg.evaluate("[...document.querySelectorAll('#sg-r-shop-shopBtns .v163-sbr .n')].map(x=>x.textContent)")
        ok(tb == ["Body shop", "Service", "No department"], "rows: each department once (case and spaces folded) + No department: %r" % tb)
        on = await pg.evaluate("document.querySelectorAll('#sg-r-shop-shopBtns .v163-sbt.on').length")
        ok(on == 15, "everything on by default: %r" % on)
        await pg.screenshot(path=OUT + "/c3_settings.png")
        await pg.click("#sg-r-shop-shopBtns .v163-sbr[data-dept='body shop'] [data-op$='|roadtest']"); await pg.wait_for_timeout(300)
        st = await pg.evaluate("JSON.stringify(__tg.STATE().shopBtns)")
        ok(st == '{"body shop":{"roadtest":false}}', "a click turns Body shop's Road test off: %r" % st)
        ok(await pg.evaluate("!!document.querySelector('#sg-r-shop-shopBtns.chg') && !!document.querySelector('#sg-r-shop-shopBtns .v163-sbr.chg .sg-dot') && !!document.querySelector('#sg-r-shop-shopBtns .v163-sbr.chg [data-op^=\"r|\"]')"), "dot on the setting and on the row, Reset on the row")
        ok1 = await pg.evaluate("(ids)=>[__tg.v163ShopOk(ids[1],'roadtest'), __tg.v163ShopOk(ids[2],'roadtest'), __tg.v163ShopOk(ids[1],'checks'), __tg.v163ShopOk(ids[0],'roadtest'), __tg.v163ShopOk(null,'roadtest')]", D)
        ok(ok1 == [False, False, True, True, True], "v163ShopOk: off only for that department and button: %r" % ok1)
        lg = await pg.evaluate("(()=>{ const x=__tg.sgLog().slice(-1)[0]; return [x.k, x.fromT, x.toT, x.by]; })()")
        ok(lg[0] == "shop.shopBtns" and lg[1] == "Body shop: Road test on" and lg[2] == "off", "Recently changed says it: %r" % lg)
        hits = await pg.evaluate("[__tg.sgFind('shop buttons').map(e=>e.id).indexOf('shop.shopBtns')>-1, __tg.sgFind('body shop').map(e=>e.id).indexOf('shop.shopBtns')>-1, __tg.sgFind('truck checks department').map(e=>e.id).indexOf('shop.shopBtns')>-1]")
        ok(hits == [True, True, True], "search finds it by name, department and button: %r" % hits)
        await pg.evaluate("(()=>{ const x=__tg.sgLog().slice(-1)[0]; __tg.sgUndo(x.id); })()"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("!__tg.STATE().shopBtns"), "Undo puts it back (nothing stored when all on)")
        await pg.click("#sg-r-shop-shopBtns .v163-sbr[data-dept='body shop'] [data-op$='|transfer']"); await pg.wait_for_timeout(200)
        await pg.click("#sg-r-shop-shopBtns .v163-sbr[data-dept='body shop'] [data-op$='|checks']"); await pg.wait_for_timeout(200)
        await pg.click("#sg-r-shop-shopBtns .v163-sbr[data-dept='body shop'] [data-op^='r|']"); await pg.wait_for_timeout(300)
        lr = await pg.evaluate("(()=>{ const x=__tg.sgLog().slice(-1)[0]; return [JSON.stringify(__tg.STATE().shopBtns||null), x.fromT, x.toT]; })()")
        ok(lr[0] == "null" and lr[1] == "Body shop: Truck checks, Transfer off" and lr[2] == "all on", "Reset on the row: %r" % lr)
        await pg.click("#sg-r-shop-shopBtns .v163-sbr[data-dept='_none'] [data-op$='|release']"); await pg.wait_for_timeout(200)
        n = await pg.evaluate("__tg.sgResetGroup('shop')")
        ok(await pg.evaluate("!__tg.STATE().shopBtns") and n >= 1, "Reset this group clears it: %r" % n)
        ok(await pg.evaluate("__tg.pdTopicMap(__tg.STATE()).shopBtns") == "Shop/settings.json", "saved with the shop settings (Shop/settings.json)")
        # a tech sees it read-only
        await pg.evaluate(SIGN + "('Technician')"); await pg.wait_for_timeout(200)
        await pg.evaluate("__tg.sgGo('shop.shopBtns')"); await pg.wait_for_timeout(400)
        ro6 = await pg.evaluate("[document.querySelectorAll('#sg-r-shop-shopBtns .v163-sbt[disabled]').length, (document.querySelector('#sg-r-shop-shopBtns .sg-ro')||{}).textContent||'']")
        ok(ro6[0] == 15 and "Only the manager can change this" in ro6[1], "a tech: read-only, 'Only the manager can change this': %r" % ro6)
        okt = await pg.evaluate("__tg.sgOp('shop.shopBtns', 't|body%20shop|start')")
        ok(okt is False and await pg.evaluate("!__tg.STATE().shopBtns"), "a tech can't change it")
        await pg.evaluate(SIGN + "('Manager')"); await pg.wait_for_timeout(200)

        # ---------- 7. the truck card: under the department, the turned-off ones gone
        async def band(rid):
            await pg.evaluate("(()=>{ __tg.STATE().savedAt = Date.now(); const U=__tg.UI(); U.view='rolist'; __tg.render(); })()"); await pg.wait_for_timeout(250)   # a save, as a real change makes
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
            return await pg.evaluate(J("const d=R.querySelector('.rop-v163d'); return d ? [ (d.querySelector('.rop-v163dl')||{}).textContent, [...d.querySelectorAll('.rop-acts button')].map(b=>b.textContent.trim()), (d.querySelector('.rop-v163dn')||{}).textContent||'' ] : null"))
        cand = await pg.evaluate("__tg.STATE().ros.filter(r=>!r.shop && r.id!=='ro_shop' && !r.dateClosed && __tg.trxBtnsOk(r)).map(r=>r.id)")
        rid = None; b0 = None
        for c in cand[:12]:
            b0 = await band(c)
            if b0 and any(x.startswith("Start") for x in b0[1]) and "Road test" in b0[1]: rid = c; break
        if not rid and cand: rid = cand[0]; b0 = await band(rid)
        await pg.evaluate("(id)=>{ __tg.STATE().ros.filter(r=>r.id===id)[0].department='Body shop'; }", rid)
        b1 = await band(rid)
        ok(b1 and b1[0] == "Body shop · shop" and "Transfer…" in b1[1] and "Road test" in b1[1] and "Truck checks" in b1[1], "truck card: the buttons under 'Body shop · shop': %r" % b1)
        await pg.screenshot(path=OUT + "/c4_card_on.png")
        await pg.evaluate("__tg.STATE().shopBtns = {'body shop': {start:false, roadtest:false, checks:false, transfer:false, release:false}}")
        b2 = await band(rid)
        ok(b2 and not any(x in b2[1] for x in ["Transfer…", "Road test", "Truck checks", "Release without checks"]) and not any(x.startswith("Start") for x in b2[1]), "all five off → gone from the truck card: %r" % (b2,))
        ok(b2 and (b2[2].startswith("No shop buttons") or any(x.startswith("Stop") for x in b2[1]) or b2[1] == [] or all(x.startswith("Ask") for x in b2[1])), "and it says so: %r" % (b2,))
        await pg.screenshot(path=OUT + "/c5_card_off.png")
        await pg.evaluate("__tg.STATE().shopBtns = {'body shop': {checks:false}}")
        b3 = await band(rid)
        ok(b3 and "Road test" in b3[1] and "Truck checks" not in b3[1] and "Transfer…" in b3[1], "one off → only that one goes: %r" % b3)
        await pg.evaluate("(id)=>{ __tg.STATE().ros.filter(r=>r.id===id)[0].department=''; }", rid)
        b4 = await band(rid)
        ok(b4 and b4[0] == "Shop" and "Truck checks" in b4[1], "no department → 'Shop', its own row (all on): %r" % b4)

        # ---------- 8. Foreman and Parts headers
        await pg.evaluate("__tg.STATE().ros.forEach(r=>{ if(!r.shop && r.id!=='ro_shop' && !r.dateClosed) r.department='Body shop'; }); __tg.STATE().shopBtns = {'body shop': {roadtest:false, checks:false, transfer:false}}")
        for v in ["foreman", "parts"]:
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; U.fmSel='{rid}'; U.fmView='floor'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
            hv = await pg.evaluate("""(()=>{ const q=s=>[...document.querySelectorAll(s)]; const all=q('[data-p="xfer"][data-ro],[data-p="send"][data-ro],.trx-rtb[data-ro],.trx-qcb[data-ro]'); return [all.length, all.filter(b=>b.offsetParent!==null).length]; })()""")
            ok(hv[0] > 0 and hv[1] == 0, f"{v}: header Transfer / Send to / Road test / Truck checks hidden for the department: %r" % hv)
            await pg.screenshot(path=OUT + f"/c6_{v}.png")
        await pg.evaluate("delete __tg.STATE().shopBtns; __tg.render()"); await pg.wait_for_timeout(600)
        hv2 = await pg.evaluate("""(()=>{ const all=[...document.querySelectorAll('[data-p="send"][data-ro],.trx-rtb[data-ro]')]; return [all.length, all.filter(b=>b.offsetParent!==null).length, document.querySelectorAll('.v163-off').length]; })()""")
        ok(hv2[0] > 0 and hv2[1] == hv2[0] and hv2[2] == 0, "back on → they show again: %r" % hv2)

        # ---------- 9. the data: export and the round trip keep the new fields; the data check is in the build log
        ex = await pg.evaluate("""(id)=>{ const B=__tg.pdBuildTables(__tg.STATE()), row=B.tables.ros.filter(r=>r.id===id)[0]; const S=__tg.pdxRebuild(B.tables, B.where), back=(S.ros||[]).filter(r=>r.id===id)[0];
          return [row && [row.contactEmail, row.driverName, row.driverPhone], back && [back.contactEmail, back.driverName, back.driverPhone]]; }""", NEWRO)
        ok(ex[0] == ["ops@rick.com", "Tony Ruiz", "(919) 555-0142"] and ex[1] == ex[0], "Export tables + the round trip keep email / driver / driver's phone: %r" % ex)
        lgj = open(os.path.join(H, "b9", "_build12_163c_log.json"), encoding="utf-8").read() if os.path.exists(os.path.join(H, "b9", "_build12_163c_log.json")) else ""
        ok("left as it is" not in lgj, "both soft patches applied (no 'left as it is' in the build log)")

        ok(not errs, "no page errors: %r" % errs[:3])
        await b.close()
    print("\n%d failed" % len(FAILS) if FAILS else "\nall ok")
asyncio.run(main())
