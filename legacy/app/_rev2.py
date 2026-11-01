import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
CASE = """Case # 4988201
Customer\tSummit Freightways - Cust# 20417\tRO Number:\tRA0001238877
Status\tWaiting on Parts\tETR\t10/30/2026 11:00 AM
Follow-up\t10/28/2026 09:00 AM\tCreated By\tJenna Cho
Asset Checked In\t10/26/2026 07:42 AM\tPO #\tPO-55120
Asset
VIN\t4V4NC9EH7LN758560\tUnit #\tT-807
Make\tVolvo\tModel\tVNL64T760
Year\t2020\tEngine\tVolvo D13 455 HP
Odometer\t413,104 mi\tEngine Hours\t15,219
Engine Serial #\t100254871
Tag #\t68\tLocation\tUpTime 2
Operations
Op\tDescription\tLabor Hours\tLabor Price\tApproval Status
1\tClutch slipping - replace clutch\t8.0\t$1,680.00\tApproved
2\tCheck engine light - NOx sensor fault SPN 3226\t1.5\t$315.00\tPending
3\tPM service - level A\t2.0\t$420.00\tPending
Parts
Part #\tDescription\tQty\tUnit\tCore\tExt\tSalesman
VOL-85013702\tClutch kit 15.5"\t1\t1,240.00\t150.00\t1,390.00\tRyan Burke
VOL-20518417\tPilot bearing\t1\t38.50\t0.00\t38.50\tRyan Burke
VOL-21899123\tRelease bearing\t2\t96.00\t0.00\t192.00\tRyan Burke
Totals: Labor $2,415.00 Parts $1,620.50 Total $4,035.50"""
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await admin(pg)
        await go(pg, 'rolist')
        n0 = await pg.evaluate("__tg.STATE().ros.length")
        await pg.click("text=New RO"); await pg.wait_for_timeout(500)
        await pg.evaluate("t=>__tg.IMPX.addText(t)", CASE); await pg.wait_for_timeout(800)
        await shot(pg, "b1_import")
        rows = await pg.evaluate("[...document.querySelectorAll('#imp-dlg .ix-fr')].map(r=>r.innerText.replace(/\\s+/g,' ').trim()).filter(t=>!/—$/.test(t)).slice(0,60)")
        print("ROWS", rows)
        ops = await pg.evaluate("[...document.querySelectorAll('#imp-dlg .ix-op')].map(o=>o.innerText.replace(/\\s+/g,' ').slice(0,300))")
        print("OPS", ops)
        tot = await txt(pg, "#imp-dlg .ix-tot"); print("TOT", tot)
        await pg.evaluate("document.querySelector('#imp-dlg .ix-body, #imp-dlg .ix-main') && (document.querySelector('#imp-dlg .ix-body, #imp-dlg .ix-main').scrollTop=2000)")
        await shot(pg, "b2_import_low")
        # create
        btn = await pg.evaluate("[...document.querySelectorAll('#imp-dlg button')].map(b=>b.textContent.trim()).filter(Boolean)")
        print("BTNS", btn)
        await pg.click("#imp-dlg button:has-text('Create RO')"); await pg.wait_for_timeout(1000)
        print("toast", await toast(pg))
        n1 = await pg.evaluate("__tg.STATE().ros.length"); print("ros", n0, "->", n1)
        r = await pg.evaluate("""(()=>{ const r=__tg.STATE().ros.find(x=>/1238877/.test(x.roNumber)); if(!r) return null; return { id:r.id, no:r.roNumber, cust:r.customerName, vin:r.vin, unit:r.unitNumber, year:r.year, make:r.make, model:r.model, eng:r.engineType, esn:r.engineSerial, miles:r.mileage, hrs:r.engineHours, tag:r.keyTag, loc:r.location, status:r.status, case:r.caseNumber, po:r.po||r.poNumber, opened:r.dateOpened, prom:r.promised||r.promisedAt,
          ops:r.operations.map(o=>({n:o.opn||o.no, c:o.complaint||o.name, q:o.quoted, cost:o.estCost, appr:o.asistApproval||o.approval, st:o.jobStatus&&o.jobStatus.status, parts:(o.parts||[]).map(x=>[x.partNumber,x.description,x.qty,x.price,x.core,x.status])})) , keys:Object.keys(r).join(',') }; })()""")
        print(json.dumps(r, indent=0)[:3000])
        print("view", await pg.evaluate("[__tg.UI().view, __tg.UI().selectedRo]"))
        await shot(pg, "b3_after_create")
        print("ERR", errs)
        await b.close()
asyncio.run(main())
