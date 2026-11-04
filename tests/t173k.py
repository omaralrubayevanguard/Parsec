# Parsec 17.3 (K) — the Library page: it opens on For the shop (documents that fit the open ROs by code or symptom, recalls
# by the truck, nothing that contradicts the truck); a bar by kind with what needs you; one search across every kind; the truck
# filter (model · year · Fits RO …) and To check; documents as cards with the trucks and years in words and older releases
# folded; the panel opens by pointing at a card, a click keeps it, ⤢ makes it a page of its own; the repair steps tick from an
# operation; Attach to… lists the ROs it fits first and puts it on one. Made-up documents only.
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_a.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
DOCS = [
  {"kind": "cbr", "num": "CBR-2408", "rel": "19", "date": "2026-01-08", "title": "Air Production Modulator (APM) DTC C10129B - High/Excessive Flow", "model": "VN", "years": "2024+", "fgrp": "563",
   "codes": ["P0101"], "symp": ["High/Excessive Flow"], "steps": [{"n": 1, "t": "Idle the truck for 15-20 minutes.", "notes": []}, {"n": 2, "t": "After 15-20 minutes, turn off the engine.", "notes": ["Tech Tool requires engine-off."]}]},
  {"kind": "cbr", "num": "CBR-2290", "rel": "02", "date": "2025-06-02", "title": "I-Shift slow gear changes in cold weather", "model": "VNL", "years": "2019–2023", "fgrp": "431", "symp": ["slow gear changes"]},
  {"kind": "cbr", "num": "CBR-2187", "rel": "07", "date": "", "title": "EGR cooler leak, coolant loss without codes", "model": "VHD", "years": "2018–2022", "fgrp": "254", "codes": ["P0101"]},
  {"kind": "tsb", "num": "430-13", "rel": "01", "date": "2024-02-01", "title": "Gear selector, replacement", "model": "VNL", "fgrp": "430"},
  {"kind": "tsb", "num": "430-13", "rel": "02", "date": "2025-03-11", "title": "Gear selector, replacement", "model": "VNL", "fgrp": "430"},
  {"kind": "recall", "num": "RVXX2601", "rel": "02", "date": "2026-05-01", "title": "Potential vehicle roll", "model": "VNL, VNR", "years": "2021–2025", "fgrp": "5"}]
SETUP = """(D => { const S = __tg.STATE(); S.libDocs = []; S.libCodes = [];
  return Promise.all(D.map(d => __tg.libAdd(d, null))).then(() => {
    const open = S.ros.filter(r => !r.shop && !r.dateClosed && r.operations.length);
    open.forEach(r => { r.model = 'VHD 300'; r.year = 2015; r.chassis = ''; r.vin = ''; r.operations.forEach(o => { o.faults = []; o.docs = []; o.complaint = 'Brake check'; o.cause = ''; }); });
    const a = open[0], b = open[1];
    a.model = 'VNL 760'; a.year = 2024; a.operations[0].faults = [{ code: 'P0101' }]; a.operations[0].complaint = 'Air dryer purging';
    b.model = 'VNL 860'; b.year = 2021; b.operations[0].complaint = 'Slow gear changes when cold';
    const U = __tg.UI(); U.view = 'library'; U.selectedRo = null; const L = __tg.LIBPG.U(); L.tab = 'shop'; L.q = ''; L.tm = ''; L.ty = ''; L.tro = ''; L.chk = false; L.olds = {};
    __tg.render(); return [a.id, b.id, a.roNumber, b.roNumber];
  }); })"""
CARDS = "(() => [...document.querySelectorAll('[data-pg=library] .lib-card')].map(c => c.querySelector('.lib-chip .mono').textContent + (c.classList.contains('old') ? ' (old)' : '')))()"
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("__tg.pxSignedIn && __tg.pxSignedIn()")
        ids = await pg.evaluate(SETUP + "(" + json.dumps(DOCS) + ")"); await pg.wait_for_timeout(800)
        # ---- For the shop
        tab = await pg.evaluate("(document.querySelector('.lib-tab.on')||{}).dataset.k")
        sh = await pg.evaluate(CARDS)
        why = await pg.evaluate("(() => { const c = [...document.querySelectorAll('.lib-card')].find(c => /CBR-2408/.test(c.textContent)); return c ? c.querySelector('.lib-cd-why').textContent : ''; })()")
        ok(tab == "shop", "the Library opens on For the shop (%s)" % tab)
        ok(sorted(sh) == ["CBR-2290", "CBR-2408", "RVXX2601"], "For the shop: by code, by symptom, a recall by the truck; CBR-2187 (VHD only) left out (%s)" % sh)
        ok(ids[2] in why and "RO RO" not in why and "its code" in why, "the card says which RO it fits and why (%s)" % why)
        # ---- the bar by kind, what needs you
        hb = await pg.evaluate("(() => [document.querySelectorAll('.lib-hbar i').length, document.querySelector('.lib-hleg').textContent, (document.querySelector('.lib-hn')||{}).textContent])()")
        ok(hb[0] == 3 and "CBRs 3" in hb[1] and "TSBs 2" in hb[1] and hb[2] == "1 to check", "the bar: 3 kinds, CBRs 3 · TSBs 2 · Recalls 1, and 1 to check (%s)" % hb)
        # ---- cards, years in words, older releases folded
        await pg.click(".lib-tab.k-tsb"); await pg.wait_for_timeout(300)
        ts = await pg.evaluate(CARDS)
        ol = await pg.evaluate("(document.querySelector('.lib-older')||{}).textContent || ''")
        ok(ts == ["430-13"] and ol.startswith("1 older"), "two releases: one card, “1 older ›” (%s %s)" % (ts, ol))
        await pg.click(".lib-older"); await pg.wait_for_timeout(300)
        ts2 = await pg.evaluate(CARDS); old = await pg.evaluate("(document.querySelector('.lib-card.old .lib-cd-tags')||{}).textContent")
        ok(ts2 == ["430-13", "430-13 (old)"] and "replaced by rel 02" in (old or ""), "unfolded: rel 01 under it, “replaced by rel 02” (%s)" % ts2)
        await pg.click(".lib-tab.k-cbr"); await pg.wait_for_timeout(300)
        tags = await pg.evaluate("(() => { const c = [...document.querySelectorAll('.lib-card')].find(c => /CBR-2408/.test(c.textContent)); return c.querySelector('.lib-cd-tags').textContent; })()")
        ok("VN · 2024+" in tags, "the trucks and years in words on the card (%s)" % tags)
        # ---- the truck filter, To check
        await pg.click(".lib-truck .tg-chip[data-v=VNL]"); await pg.wait_for_timeout(300)
        f1 = await pg.evaluate(CARDS)
        ok(sorted(f1) == ["CBR-2290", "CBR-2408"], "VNL: the VNL and VN documents, not the VHD one (%s)" % f1)
        await pg.select_option("select[data-ch=ty]", "2024"); await pg.wait_for_timeout(300)
        f2 = await pg.evaluate(CARDS)
        ok(f2 == ["CBR-2408"], "VNL · 2024: only the one valid for 2024 (%s)" % f2)
        await pg.click(".lib-truck [data-a=tclear]"); await pg.wait_for_timeout(300)
        await pg.select_option("select[data-ch=tro]", ids[1]); await pg.wait_for_timeout(300)
        f3 = await pg.evaluate(CARDS)
        ok(f3 == ["CBR-2290"], "Fits RO %s (VNL 2021): CBR-2290 (%s)" % (ids[3], f3))
        await pg.click(".lib-truck [data-a=tclear]"); await pg.wait_for_timeout(300)
        await pg.click(".lib-chk-c"); await pg.wait_for_timeout(300)
        f4 = await pg.evaluate(CARDS); miss = await pg.evaluate("(document.querySelector('.lib-tag.miss')||{}).textContent")
        ok(f4 == ["CBR-2187"] and miss == "missing date", "To check: CBR-2187, “missing date” (%s %s)" % (f4, miss))
        await pg.click(".lib-truck [data-a=tclear]"); await pg.wait_for_timeout(300)
        # ---- one search, every kind
        await pg.fill("#lib-q", "gear"); await pg.wait_for_timeout(400)
        gh = await pg.evaluate("[...document.querySelectorAll('.lib-list .lib-gh b')].map(x => x.textContent)")
        sr = await pg.evaluate(CARDS)
        ok("CBRs" in gh and "TSBs" in gh and "CBR-2290" in sr and "430-13" in sr, "one search finds a CBR and a TSB together, grouped by kind (%s %s)" % (gh, sr))
        await pg.fill("#lib-q", ""); await pg.wait_for_timeout(300)
        # ---- the panel: pointing opens it, a click keeps it, ⤢ makes it a page
        await pg.hover("[data-pg=library] .lib-card[data-id] .lib-cd-m"); await pg.wait_for_timeout(800)
        pk = await pg.evaluate("!!document.querySelector('.lib-view:not(.mx-out)')")
        ok(pk, "pointing at a card opens its panel")
        await pg.mouse.move(5, 450); await pg.wait_for_timeout(700)
        ok(await pg.evaluate("!document.querySelector('.lib-view:not(.mx-out)')"), "moving away closes it again")
        await pg.click("[data-pg=library] .lib-card[data-id] .lib-cd-m"); await pg.wait_for_timeout(700)
        await pg.mouse.move(5, 450); await pg.wait_for_timeout(700)
        ok(await pg.evaluate("!!document.querySelector('.lib-view:not(.mx-out)')"), "a click keeps it open")
        await pg.click(".lib-view:not(.mx-out) [data-lv=full]"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("document.querySelector('.lib-view:not(.mx-out)').classList.contains('lib-view-full')"), "⤢ makes the panel a page of its own")
        await pg.evaluate("__tg.libClose()"); await pg.mouse.move(5, 450); await pg.wait_for_timeout(600)
        # ---- the steps to tick, from an operation; Attach to…
        st = await pg.evaluate("""(x => { const d = __tg.libDocs().find(d => d.num === 'CBR-2408'); const ro = __tg.getRO(x); __tg.libOpen(d, null, { ro, op: ro.operations[0] });
          const v = document.querySelector('.lib-view'); return [v.querySelectorAll('.lib-vs-st .lib-ps').length, (v.querySelector('.lib-vs-r') || {}).textContent]; })""", ids[0])
        ok(st[0] == 2 and "VN · 2024+" in (st[1] or ""), "the panel: Valid for VN · 2024+, and 2 repair steps (%s)" % st)
        await pg.click(".lib-view:not(.mx-out) .lib-pk[data-step='1']"); await pg.wait_for_timeout(300)
        dn = await pg.evaluate("x => { const d = __tg.libDocs().find(d => d.num === 'CBR-2408'); return ((__tg.getRO(x).operations[0].procDone || {})[d.id] || []); }", ids[0])
        ok(dn == [1], "a step ticked from the operation is kept on it (%s)" % dn)
        await pg.click(".lib-view:not(.mx-out) [data-lv=att]"); await pg.wait_for_timeout(300)
        at = await pg.evaluate("[...document.querySelectorAll('.lib-att-i')].slice(0, 3).map(x => [x.textContent, x.className])")
        ok(at and ids[2] in at[0][0] and "RO RO" not in at[0][0] and "fit" in at[0][1], "Attach to…: the RO it fits by its code comes first (%s)" % at[:2])
        await pg.click(".lib-att-i:not([disabled])"); await pg.wait_for_timeout(500)
        on = await pg.evaluate("x => { const d = __tg.libDocs().find(d => d.num === 'CBR-2408'); return __tg.getRO(x).operations[0].docs.some(y => y.id === d.id); }", ids[0])
        ok(on, "…and choosing it puts the document on that RO's operation")
        ok(not errs, "no page errors (%s)" % errs[:3])
        await b.close()
    print("\n%d failed" % len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
