# Parsec 17.1 (A) — the Library: codes typed any way (P105E, P1050 FTB 17, 3226/2, MID 128 PID 110 FMI 0), documents read by
# their number (CBR, TSB, FSB, Recall), a DTC bulletin's code table with FTBs, filing asked first, the Library page and its tabs,
# and on the RO: the code's meaning, the document the Library offers for it, the documents strip, Attachments, and Warranty.
# The text below is made up in Volvo's layouts — no Volvo document is in the repository.
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_a.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots171a"); os.makedirs(OUT, exist_ok=True)

BULLETIN = "\n".join([
  "Volvo Trucks North America", "Service Bulletin", "Date Group No. Release Page", "9.2012 430 13 01 1(50)",
  "Transmission Control Module (TCM)", "Diagnostic Trouble Codes (DTCs)", "VN, VHD, VAH",
  "“P1050, Transmission Range, Position”, page 5", "“P105E, Transmission Shifter # 1 Position Sensor”, page 18",
  "Volvo Trucks North America Date Group No. Release Page", "Service Bulletin 9.2012 430 13 01 5(50)",
  "P1050, Transmission Range, Position", "FTB 17 • Voltage above normal, or shorted to high source • Status from ASIC • Slow gear changes",
  "FTB 18 • Current below normal or open circuit • Status from ASIC • Yellow lamp is illuminated",
  "P105E, Transmission Shifter # 1 Position Sensor", "FTB 17 • Voltage above normal, or shorted to high source • Sensor signal • Slow gear changes"])
DEALER = "TRUCKS DEALER BULLETIN\nTo: Service Managers\nDate: August 23, 2023\nSubject: EGR Cooler\nBulletin: SNM23-002\nNew EGR cooler kit."

async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        # ---- codes, any way they're written
        cases = {"P105E": "P105E", "p1050 ftb17": "P1050 · FTB 17", "P1050-17": "P1050 · FTB 17", "SPN 3226 FMI 2": "SPN 3226 · FMI 2", "3226/2": "SPN 3226 · FMI 2",
                 "MID 128 PID 110 FMI 0": "MID 128 · PID 110 · FMI 0", "PX050": None, "3226/40": None}
        for k, want in cases.items():
            got = await pg.evaluate(f"(()=>{{ const f=__tg.libCodeParse({json.dumps(k)}); return f ? __tg.libCodeLabel(f) : null; }})()")
            ok(got == want, f"“{k}” reads as {want} ({got})")
        # ---- the kind from the number (the shop's rules)
        kinds = {"CBR-12": "cbr", "1234": "cbr", "RVXX2601": "recall", "S1234": "recall", "C1234": "recall", "SNV23-002": "fsb", "V-412-002": "tsb", "430-13": "tsb", "EC0033": ""}
        for n, k in kinds.items():
            got = await pg.evaluate(f"__tg.libKindOf({json.dumps(n)})")
            ok(got == k, f"{n} is a {k or 'kind Parsec asks about'} ({got})")
        # ---- reading documents
        d = await pg.evaluate(f"(()=>{{ const r=__tg.libDocRead({json.dumps(DEALER)}, 'x.pdf'); return [r.kind, r.num, r.date, r.title]; }})()")
        ok(d == ["fsb", "SNM23-002", "2023-08-23", "EGR Cooler"], f"a dealer bulletin: FSB SNM23-002, its date and subject ({d})")
        t = await pg.evaluate(f"(()=>{{ const r=__tg.libDocRead({json.dumps(BULLETIN)}, 'tcm.pdf'); return {{ k:r.kind, n:r.num, rel:r.rel, fg:r.fgrp, mod:r.mod, title:r.title, rows:r.table.map(x=>[x.key, x.title, Object.keys(x.ftb).join(','), (x.ftb['17']||{{}}).d]) }}; }})()")
        ok(t["k"] == "tsb" and t["n"] == "430-13" and t["rel"] == "01" and t["fg"] == "430" and t["mod"] == "TCM", f"a Service Bulletin: TSB 430-13 rel 01, group 430, TCM ({t['k']} {t['n']} {t['rel']} {t['fg']} {t['mod']})")
        ok(len(t["rows"]) == 2 and t["rows"][0][:3] == ["P1050", "Transmission Range, Position", "17,18"], f"its code table, FTBs included ({t['rows']})")
        ok(t["rows"][0][3] == "Voltage above normal, or shorted to high source", f"FTB 17's wording ({t['rows'][0][3]})")
        f2 = await pg.evaluate("__tg.libDocRead('', 'RVXX2601 rel 02 Potential vehicle roll.pdf')")
        ok(f2["kind"] == "recall" and f2["num"] == "RVXX2601" and f2["rel"] == "02", f"a file name alone: Recall RVXX2601 rel 02 ({f2['kind']} {f2['num']} {f2['rel']})")

        # ---- filing: asked first, from the Library page
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); const U=__tg.UI(); U.view='library'; __tg.render(); })()"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("!!document.querySelector('[data-pg=library] .lib-tab.k-recall') && !!document.querySelector('.lib-tab.soon')"), "the Library: its tabs, Procedures marked soon")
        await pg.evaluate(f"__tg.libIntake([new File([{json.dumps(DEALER)}], 'SNM23-002 EGR Cooler.txt', {{type:'text/plain'}})], null, ()=>{{}})"); await pg.wait_for_timeout(500)
        card = await pg.evaluate("(()=>{ const w=document.querySelector('.lib-ask'); return w ? [w.querySelector('#lib-f-num').value, (w.querySelector('.lib-kd.on')||{dataset:{}}).dataset.kind] : null; })()")
        ok(card == ["SNM23-002", "fsb"], f"the card shows what was found before anything is filed ({card})")
        ok(await pg.evaluate("__tg.libDocs().length") == 0, "nothing is filed until File it")
        await pg.click(".lib-ask [data-lib=go]"); await pg.wait_for_timeout(600)
        ok(await pg.evaluate("__tg.libDocs().map(d=>d.kind+' '+d.num).join()") == "fsb SNM23-002", "File it: FSB SNM23-002 is in the Library")
        # a number Parsec doesn't know: the person picks the tab once, and it's remembered
        await pg.evaluate("__tg.libIntake([new File(['x'], 'EC0033 MY2017-18 13L TC.txt', {type:'text/plain'})], null, ()=>{})"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("document.querySelector('.lib-ask [data-lib=go]').disabled"), "EC0033: File it waits for a kind")
        await pg.click(".lib-ask .lib-kd.k-recall"); await pg.wait_for_timeout(150)
        ok(await pg.evaluate("!document.querySelector('#lib-f-learnw').hidden"), "…and offers to remember EC for Recalls")
        await pg.click(".lib-ask [data-lib=go]"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("__tg.libKindOf('EC0040')") == "recall", "EC numbers are Recalls from now on")
        # a DTC bulletin: its codes go into Fault codes
        await pg.evaluate(f"(()=>{{ const r=__tg.libDocRead({json.dumps(BULLETIN)}, 'tcm.pdf'); return __tg.libAdd(Object.assign(r, {{}}), new Blob(['%PDF'], {{type:'application/pdf'}}), 'tcm.pdf'); }})()"); await pg.wait_for_timeout(400)
        mean = await pg.evaluate("__tg.libCodeMeaning(__tg.libCodeParse('P1050 FTB 17'))")
        ok(mean == "TCM · Transmission Range, Position — voltage above normal, or shorted to high source", f"P1050 FTB 17 now means something ({mean})")
        await pg.evaluate("(()=>{ __tg.LIBPG.U().tab='codes'; __tg.render(); })()"); await pg.wait_for_timeout(300)
        await pg.click(".lib-row.lib-code[data-k=P1050]"); await pg.wait_for_timeout(250)
        ok(await pg.evaluate("[...document.querySelectorAll('.lib-ftb-r b')].map(b=>b.textContent).join()") == "FTB 17,FTB 18", "Fault codes: P1050 opens to its FTBs")
        await pg.fill("#lib-q", "shifter"); await pg.wait_for_timeout(200)
        ok(await pg.evaluate("[...document.querySelectorAll('.lib-row.lib-code')].map(r=>r.dataset.k).join()") == "P105E", "the search finds a code by its words")
        await pg.screenshot(path=OUT + "/library.png")

        # ---- on the RO: the code's meaning, the document offered, attached, the strip, Attachments
        rid = await pg.evaluate("(()=>{ const S=__tg.STATE(); const r=S.ros.find(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length>=2); r.operations[1].faults=[{id:'fc_t', code:'P1050', ftb:17}]; r.operations[1].docs=[]; const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); return r.id; })()")
        await pg.wait_for_timeout(900)
        op = await pg.evaluate(f"__tg.getRO('{rid}').operations[1].id")
        await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t'); if(r) r.click();")); await pg.wait_for_timeout(700)
        ml = await pg.evaluate(J("const m=R.querySelector('.libMean'); return m ? m.innerText : null"))
        ok(ml and "Transmission Range, Position" in ml and "Slow gear changes" in ml, f"the operation says what P1050 · 17 means, symptoms too ({ml})")
        off = await pg.evaluate(J("const m=R.querySelector('.libOffer'); return m ? m.innerText.replace(/\\n/g,' ') : null"))
        ok(off and "430-13" in off and "page 5" in off, f"…and offers TSB 430-13, at its page ({off})")
        await pg.evaluate(J("R.querySelector('.libOffer .libOfferB.pri').click()")); await pg.wait_for_timeout(1200)
        ok(await pg.evaluate(f"__tg.getRO('{rid}').operations[1].docs.length") == 1, "Attach: the document is on the operation")
        att = await pg.evaluate(f"(__tg.getRO('{rid}').bulletins||[]).flatMap(e=>(e.files||[]).filter(f=>f.doc).map(f=>e.task+':'+f.op))")
        ok(att == ["dtc:" + op], f"…with a copy in Attachments, under Upload DTCs, on that operation ({att})")
        st = await pg.evaluate(J("const s=R.querySelector('.libStrip'); return s ? s.innerText.replace(/\\n/g,' ') : null"))
        ok(st and "OP 2" in st and "430-13" in st, f"the documents strip, by operation ({st})")
        ok(await pg.evaluate(f"__tg.libOpFgrp(__tg.getRO('{rid}').operations[1])") == "430", "the operation's function group comes from its document")
        await pg.evaluate(J("R.querySelector('.libStrip .libGo').click()")); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("!!document.querySelector('.lib-view')"), "a chip opens the document beside the RO")
        await pg.screenshot(path=OUT + "/ro.png")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        ok(await pg.evaluate("!document.querySelector('.lib-view')"), "Esc closes it")
        # ---- Warranty
        if await pg.evaluate(f"__tg.wcOps(__tg.getRO('{rid}')).some(o=>o.id==='{op}')"):
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='warranty'; U.wcRo='{rid}'; U.wcFilter='all'; __tg.render(); }})()"); await pg.wait_for_timeout(800)
            w = await pg.evaluate("(()=>{ const w=document.querySelector('.wa-lib'); return w ? w.innerText.replace(/\\n/g,' ') : null; })()")
            ok(w and "430-13" in w and "Save the claim folder" in w, f"Warranty: the claim's documents and the claim folder ({w})")
        ok(not errs, f"no page errors ({errs[:3]})")
        await b.close()
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
