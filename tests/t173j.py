# Parsec 17.3 (J) — the Library reads more and files a stack at once: part numbers, labor hours, chassis ranges, symptoms and
# the repair in one line; a field read from somewhere weak is marked "check"; the document's words sit beside the card and light
# up for the field you point at; changing the kind or cutting the title asks once; the two likeliest kinds when the number doesn't
# say; a newer release is said; from an RO the parts, hours and repair go onto the operation and the card says whether it fits
# the truck; the RO offers a document by its symptoms; many files read under a progress window into one list, File N ready.
# The documents below are made up in the layouts the shop sees — no Volvo document is in the repository.
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_a.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)

DOC1 = "\n".join(["TRUCKS DEALER BULLETIN", "To: Service Managers", "Date: August 23, 2023", "Subject: EGR Cooler", "Bulletin: SNM23-002",
  "Applies to: VNL 2019–2022, chassis ID 123456–129999", "Symptoms: slow gear changes; hard to shift in cold weather", "Parts:",
  "23418972 EGR cooler kit ×1", "21501234 Gasket ×2", "Labor operation 2511-03-02-01 Replace EGR cooler 1.8 h",
  "Correction: replaced the EGR cooler with kit 23418972 and leak tested the system."])
DOC2 = "\n".join(["Service Bulletin", "Field Service Campaign", "Field service for dealers", "Subject: Service Campaign – Fuel filter housing", "Number QX1234"])
DOC3 = "\n".join(["05.2026 RVXX2601 02 1(31)", "Potential vehicle roll", "Park brake valve may stick."])
DOC4 = "\n".join(["05.2026 RVXX2602 01 1(3)", "Subject: Brake hose", "Replace the hose."])
DOC5 = "\n".join(["Bulletin: SNM23-003", "Subject: Turbo actuator", "Date: May 2, 2024"])
DOC6 = "\n".join(["9.2012 430 13 02 1(50)", "Subject: Gear selector"])
DOC7 = "\n".join(["CBR-23004", "Subject: Shifting complaints", "Symptoms: slow gear changes, hard to shift"])
F = lambda txt, name: "new File([" + json.dumps(txt) + "], " + json.dumps(name) + ", {type:'text/plain'})"

async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        # ---- reading more
        r = await pg.evaluate("(()=>{ const r=__tg.libDocRead(" + json.dumps(DOC1) + ", 'SNM23-002.txt'); return { parts:r.parts, labor:r.labor, ch:r.chassis, symp:r.symp, fix:r.fix, doubt:r.doubt, toss:r.toss, kind:r.kind, years:r.years, model:r.model }; })()")
        ok([x["pn"] for x in r["parts"]] == ["23418972", "21501234"] and r["parts"][1]["qty"] == 2 and "Gasket" in r["parts"][1]["desc"], "parts: 2 part numbers with their words and quantities (%s)" % r["parts"])
        ok(r["labor"] and r["labor"][0]["op"] == "2511-03-02-01" and r["labor"][0]["hrs"] == 1.8, "labor: 2511-03-02-01 · 1.8 h (%s)" % r["labor"])
        ok(r["ch"] == [[123456, 129999]] and r["model"] == "VNL" and r["years"] == "2019–2022", "which trucks: VNL 2019–2022, chassis 123456–129999 (%s %s %s)" % (r["ch"], r["model"], r["years"]))
        ok(r["symp"] == ["slow gear changes", "hard to shift in cold weather"], "symptoms read (%s)" % r["symp"])
        ok(r["fix"].startswith("Replaced the EGR cooler with kit 23418972"), "the repair in one line (%s)" % r["fix"])
        ok(r["doubt"] == {} and r["toss"] == [] and r["kind"] == "fsb", "a clean bulletin: nothing to check, FSB (%s %s)" % (r["doubt"], r["kind"]))
        r2 = await pg.evaluate("(()=>{ const r=__tg.libDocRead(" + json.dumps(DOC2) + ", 'campaign.txt'); return [r.kind, r.toss]; })()")
        ok(r2[0] == "" and sorted(r2[1]) == ["fsb", "tsb"], "no rule for the number: the two likeliest kinds, nothing picked (%s)" % r2)
        r3 = await pg.evaluate("(()=>{ const r=__tg.libDocRead(" + json.dumps(DOC3) + ", 'x.txt'); return [r.title, Object.keys(r.doubt)]; })()")
        ok(r3[0] == "Potential vehicle roll" and r3[1] == ["title"], "a title from the first line is marked to check (%s)" % r3)
        # ---- the card: marks, the page beside it, the two likeliest kinds
        await pg.evaluate("__tg.libIntake([" + F(DOC3, "x.txt") + "], null, ()=>{})"); await pg.wait_for_selector(".lib-ask:not(.mx-out) .lib-f"); await pg.wait_for_timeout(150)
        c = await pg.evaluate("(()=>{ const w=document.querySelector('.lib-ask:not(.mx-out)'); return w ? [!!w.querySelector('.lib-f-c.doubt[data-f=title] .lib-chk'), !!w.querySelector('.lib-pg'), w.querySelectorAll('.lib-pg-b span').length] : null; })()")
        ok(c and c[0] and c[1] and c[2] == 3, "the card: Title marked “check”, the document's 3 lines beside it (%s)" % c)
        await pg.hover(".lib-ask:not(.mx-out) .lib-f-c[data-f=title]"); await pg.wait_for_timeout(200)
        hl = await pg.evaluate("(document.querySelector('.lib-pg-b span.hl')||{}).textContent")
        ok(hl == "Potential vehicle roll", "pointing at Title lights its line on the page (%s)" % hl)
        await pg.fill("#lib-f-title", "Potential vehicle roll!"); await pg.wait_for_timeout(150)
        ok(await pg.evaluate("!document.querySelector('.lib-f-c.doubt[data-f=title]')"), "typing in a marked field clears its mark")
        await pg.click(".lib-ask:not(.mx-out) [data-lib=skip]"); await pg.wait_for_timeout(300)
        await pg.evaluate("__tg.libIntake([" + F(DOC2, "campaign.txt") + "], null, ()=>{})"); await pg.wait_for_selector(".lib-ask:not(.mx-out) .lib-f"); await pg.wait_for_timeout(150)
        tz = await pg.evaluate("(()=>[[...document.querySelectorAll('.lib-ask:not(.mx-out) .lib-kd.maybe')].map(b=>b.dataset.kind).sort(), !!document.querySelector('.lib-ask:not(.mx-out) .lib-kd.on'), document.querySelector('.lib-ask:not(.mx-out) [data-lib=go]').disabled, document.querySelector('#lib-f-found').textContent])()")
        ok(tz[0] == ["fsb", "tsb"] and not tz[1] and tz[2] and "Pick one" in tz[3], "the two likeliest kinds outlined, none picked, File it waits (%s)" % tz)
        # ---- ask once: a title cut
        await pg.click(".lib-ask:not(.mx-out) .lib-kd.k-fsb"); await pg.fill("#lib-f-num", "QX1234"); await pg.wait_for_timeout(100)
        await pg.fill("#lib-f-title", "Fuel filter housing"); await pg.wait_for_timeout(150)
        dt = await pg.evaluate("(()=>{ const d=document.querySelector('#lib-f-dropw'); return d.hidden ? '' : d.textContent; })()")
        ok("Service Campaign" in dt, "cutting the title asks once: leave “Service Campaign” out of titles? (%s)" % dt)
        await pg.click("#lib-f-dropw [data-v='1']"); await pg.click(".lib-ask:not(.mx-out) [data-lib=go]"); await pg.wait_for_timeout(500)
        t2 = await pg.evaluate("__tg.libDocRead(" + json.dumps(DOC2) + ", 'c.txt').title")
        ok(t2 == "Fuel filter housing", "…and the next one reads without it (%s)" % t2)
        # ---- ask once: a changed kind
        await pg.evaluate("__tg.libIntake([" + F(DOC5, "SNM23-003.txt") + "], null, ()=>{})"); await pg.wait_for_timeout(500)
        await pg.click(".lib-ask:not(.mx-out) .lib-kd.k-tsb"); await pg.wait_for_timeout(150)
        lt = await pg.evaluate("(()=>{ const d=document.querySelector('#lib-f-learnw'); return [d.hidden, d.textContent, !!d.querySelector('.lib-yn-b.on')]; })()")
        ok(not lt[0] and "Next time, file SNM" in lt[1] and not lt[2], "changing FSB to TSB asks once, nothing chosen for you (%s)" % lt)
        await pg.click("#lib-f-learnw [data-v='1']"); await pg.click(".lib-ask:not(.mx-out) [data-lib=go]"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("__tg.libKindOf('SNM99-001')") == "tsb", "after Yes, SNM… files as a TSB")
        # ---- a newer release
        await pg.evaluate("(()=>{ __tg.libAdd({ kind:'tsb', num:'430-13', rel:'01', title:'Gear selector' }, null); })()"); await pg.wait_for_timeout(200)
        await pg.evaluate("__tg.libIntake([" + F(DOC6, "430-13.txt") + "], null, ()=>{})"); await pg.wait_for_timeout(500)
        nw = await pg.evaluate("(()=>{ const d=document.querySelector('#lib-f-dup'); return d.hidden ? '' : d.textContent; })()")
        ok(nw.startswith("Newer than 430-13 rel 01"), "a newer release is said, and the old one stays (%s)" % nw)
        await pg.click(".lib-ask:not(.mx-out) [data-lib=go]"); await pg.wait_for_timeout(500)
        lat = await pg.evaluate("(()=>{ const L=__tg.libDocs().filter(d=>d.num==='430-13'); return [L.length, __tg.libLatest(L[0]).rel]; })()")
        ok(lat == [2, "02"], "both releases kept; rel 02 is the one offered (%s)" % lat)
        # ---- from an RO: fits the truck, parts, hours, the repair
        rid = await pg.evaluate("""(()=>{ const S=__tg.STATE(), r=S.ros.find(r=>!r.shop&&!r.dateClosed&&r.operations.length);
          r.model='VNL 760'; r.year=2021; r.chassis='127845'; const o=r.operations[0]; o.complaint='Slow gear changes, hard to shift'; o.parts=[]; o.quoted=0; o.docs=[]; o.faults=[];
          const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; U.roOpen={}; U.roOpen[r.id]=[o.id]; __tg.render(); return r.id; })()""")
        await pg.evaluate("x=>{ const r=__tg.getRO(x); __tg.libIntake([" + F(DOC1, "SNM23-002.txt") + "], { ro:r, op:r.operations[0] }, ()=>{}); }", rid); await pg.wait_for_timeout(600)
        ro = await pg.evaluate("(()=>{ const w=document.querySelector('.lib-ask:not(.mx-out)'); return [(w.querySelector('.lib-fit')||{}).textContent, !!w.querySelector('#lib-f-parts'), !!w.querySelector('#lib-f-hrs'), !!w.querySelector('#lib-f-fix'), w.querySelector('.lib-more').textContent]; })()")
        ok(ro[0] and ro[0].startswith("Fits this truck") and ro[1] and ro[2] and ro[3], "from an RO: “Fits this truck”, and offers for the parts, the hours and the repair (%s)" % ro[0])
        await pg.check("#lib-f-parts"); await pg.check("#lib-f-hrs"); await pg.check("#lib-f-fix"); await pg.click(".lib-ask:not(.mx-out) [data-lib=go]"); await pg.wait_for_timeout(700)
        op = await pg.evaluate("x=>{ const o=__tg.getRO(x).operations[0]; return [o.parts.map(p=>p.partNumber+'×'+p.qty), o.quoted, __tg.ccLine(o,'x'), (o.docs||[]).length]; }", rid)
        ok(op[0] == ["23418972×1", "21501234×2"] and op[1] == 1.8 and op[2].startswith("Replaced the EGR cooler") and op[3] == 1, "filed: 2 parts on the operation, 1.8 h quoted, the repair in the Correction (%s)" % op)
        nf = await pg.evaluate("x=>{ const r=__tg.getRO(x); const d=__tg.libDocs().find(d=>d.num==='SNM23-002'); r.chassis='140001'; const f=__tg.libFits(d, r); r.chassis='127845'; return f; }", rid)
        ok(nf and nf["ok"] is False and "outside 123456–129999" in nf["why"], "another truck: “Doesn’t fit — chassis 140001 is outside …” (%s)" % nf)
        # ---- the RO page: a document by its symptoms, and the one-click uses for a document on the operation
        await pg.evaluate("(()=>{ __tg.libAdd({ kind:'cbr', num:'CBR-23004', title:'Shifting complaints', symp:['slow gear changes','hard to shift'] }, null); })()"); await pg.wait_for_timeout(200)
        await pg.evaluate("x=>{ const o=__tg.getRO(x).operations[0]; o.parts=[]; o.quoted=0; __tg.render(); }", rid); await pg.wait_for_timeout(900)
        rp = await pg.evaluate(J("return [[...R.querySelectorAll('.libOffer')].map(x=>x.textContent).join(' | '), [...R.querySelectorAll('.libUse')].map(x=>x.textContent).join(' | ')];"))
        ok("CBR-23004" in rp[0] and "matches “slow gear changes”" in rp[0], "the RO offers CBR-23004 by its symptoms (%s)" % rp[0][:120])
        ok("Fits this truck" in rp[1] and "Add 2 parts" in rp[1] and "Use 1.8 h" in rp[1], "a document on the operation: fits, Add 2 parts, Use 1.8 h (%s)" % rp[1][:160])
        await pg.evaluate(J("[...R.querySelectorAll('.libUse .libOfferB')].find(b=>/Add 2 parts/.test(b.textContent)).click();")); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("x=>__tg.getRO(x).operations[0].parts.length", rid) == 2, "Add 2 parts puts them on the operation")
        # ---- many files: the progress window, one list, File N ready
        await pg.evaluate("(()=>{ __tg.libAdd({ kind:'recall', num:'RVXX2609', rel:'01', title:'x' }, null); })()")
        await pg.evaluate("__tg.libIntake([" + ",".join([F(DOC3, "RVXX2601.txt"), F(DOC4, "RVXX2602.txt"), F("05.2026 RVXX2609 01 1(3)\nSubject: y", "RVXX2609.txt"), F(DOC7.replace('CBR-23004', 'CBR-23005'), "CBR-23005.txt")]) + "], null, ()=>{ window.__libDone=1; })"); await pg.wait_for_timeout(900)
        L = await pg.evaluate("(()=>[...document.querySelectorAll('.lib-ask:not(.mx-out) .lib-li')].map(x=>[x.querySelector('.lib-li-f').textContent, x.querySelector('.lib-li-s').textContent]))()")
        st = dict(L)
        ok(len(L) == 4 and st.get("RVXX2601.txt", "").startswith("check") and st.get("RVXX2602.txt") == "✓ ready" and st.get("RVXX2609.txt") == "in the Library" and st.get("CBR-23005.txt") == "✓ ready", "one list: 2 ready, 1 to check, 1 in the Library (%s)" % L)
        ok(await pg.evaluate("document.querySelector('.lib-ask:not(.mx-out) [data-ll=ready]').textContent") == "File 2 ready", "File 2 ready")
        await pg.click(".lib-ask:not(.mx-out) .lib-li.st-check"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("!!document.querySelector('.lib-ask:not(.mx-out) .lib-back') && !!document.querySelector('#lib-f-num')"), "a row opens the card, with ‹ Back to the list")
        await pg.click(".lib-ask:not(.mx-out) .lib-back"); await pg.wait_for_timeout(800)
        await pg.click(".lib-ask:not(.mx-out) [data-ll=ready]"); await pg.wait_for_timeout(900)
        L2 = dict(await pg.evaluate("(()=>[...document.querySelectorAll('.lib-ask:not(.mx-out) .lib-li')].map(x=>[x.querySelector('.lib-li-f').textContent, x.querySelector('.lib-li-s').textContent]))()"))
        ok(L2.get("RVXX2602.txt") == "✓ filed" and L2.get("CBR-23005.txt") == "✓ filed" and L2.get("RVXX2601.txt", "").startswith("check"), "the ready ones filed, the doubtful one waits (%s)" % L2)
        await pg.click(".lib-ask:not(.mx-out) [data-ll=done]"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("window.__libDone === 1 && !document.querySelector('.lib-ask:not(.mx-out)')"), "Done closes the list")
        pw = await pg.evaluate("(()=>{ __tg.libIntake([" + F(DOC3, "a.txt") + "," + F(DOC4, "b.txt") + "], null, ()=>{}); const p=document.querySelector('.lib-ask:not(.mx-out) .lib-prog'); return p ? document.querySelector('.lib-ask:not(.mx-out) .lib-ask-n').textContent : ''; })()")
        ok(pw == "1 of 2", "a stack reads under a progress window: “Reading 1 of 2” (%s)" % pw)
        await pg.wait_for_timeout(600); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "t173j-last.png"))
        ok(not errs, "no page errors (%s)" % errs[:3])
        await b.close()
    print("\n%d failed" % len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
