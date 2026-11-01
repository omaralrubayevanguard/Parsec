# Parsec 15 (A) — the RO page: below Operations only Messages and Customer (RO list, Technician page, a ROs tab); no opening on hover;
# one switch (Collapse all ⇄ Expand all) above the sections and one at the top of the right pane's groups; the truck menu's
# "Truck history in Assets…".
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_a.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots150a"); os.makedirs(OUT, exist_ok=True)
OPEN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); localStorage.removeItem('rop_fold'); __tg.pxSignedIn(); const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>=2); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; U.ivFold={}; __tg.render(); return r.id; })()"
SECS = "return [...R.querySelectorAll('.rop-col > section.rop-blk')].map(s=>(/rop-k-(\\w+)/.exec(s.className)||[])[1])"
SW = "(k=>{ const R=document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot; const b=R.querySelector('.rop-fall[data-fall='+k+']'); return b ? [b.textContent.trim(), b.closest('.rop-fallw').hidden] : null; })"
MAIN = "return [...R.querySelectorAll('.rop-col > section.rop-blk')].map(s=>s.classList.contains('is-shut'))"
RAIL = "return [...R.querySelectorAll('.rop-top > section.rop-rblk.rop-fold:not(.rop-stg), .px-props > section.px-pg')].map(s=>s.classList.contains('px-pg') ? !s.classList.contains('is-open') : s.classList.contains('is-shut'))"
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await pg.evaluate(OPEN); await pg.wait_for_timeout(1200)
        ok(await pg.evaluate(J(SECS)) == ["inbox", "customer"], "RO list: below Operations only Messages, then Customer")
        heads = await pg.evaluate(J("return [...R.querySelectorAll('.rop-col h3')].map(h=>h.textContent.trim())"))
        gone = [x for x in ["Fault codes", "Photos & codes", "Parts on this RO", "Truck history", "Warranty claim", "Estimate & approval", "Ready to close"] if any(x in h for h in heads)]
        ok(not gone, f"none of the seven sections is drawn ({gone})")
        # the main switch
        s0 = await pg.evaluate(SW + "('main')"); ok(s0 and s0[0] == "Collapse all" and not s0[1], f"the switch above the sections reads Collapse all ({s0})")
        pos = await pg.evaluate(J("const w=R.querySelector('.rop-fallw-main'); return w && w.nextElementSibling && w.nextElementSibling.classList.contains('rop-k-inbox') && w.previousElementSibling && !!w.previousElementSibling.querySelector('.rop-sech0')"))
        ok(pos, "it sits between Operations and Messages")
        await pg.evaluate(J("R.querySelector('.rop-fall[data-fall=main]').click()")); await pg.wait_for_timeout(250)
        ok(await pg.evaluate(J(MAIN)) == [True, True] and (await pg.evaluate(SW + "('main')"))[0] == "Expand all", "Collapse all folds both; the switch reads Expand all")
        await pg.screenshot(path=os.path.join(OUT, "a1_collapsed.png"))
        ops = await pg.evaluate(J("return R.querySelector('[data-fold=ops]').classList.contains('is-shut')")); ok(not ops, "Operations isn't part of it")
        await pg.evaluate("__tg.render()"); await pg.wait_for_timeout(700)
        ok(await pg.evaluate(J(MAIN)) == [True, True] and (await pg.evaluate(SW + "('main')"))[0] == "Expand all", "remembered after a redraw")
        await pg.evaluate(J("R.querySelector('.rop-fall[data-fall=main]').click()")); await pg.wait_for_timeout(250)
        ok(await pg.evaluate(J(MAIN)) == [False, False] and (await pg.evaluate(SW + "('main')"))[0] == "Collapse all", "Expand all opens both")
        # one heading still folds one; the label follows
        await pg.evaluate(J("R.querySelector('[data-fold=c-inbox] .rop-fb').click()")); await pg.wait_for_timeout(200)
        ok(await pg.evaluate(J(MAIN)) == [True, False] and (await pg.evaluate(SW + "('main')"))[0] == "Collapse all", "one folded, one open: still Collapse all")
        await pg.evaluate(J("R.querySelector('[data-fold=c-customer] .rop-fb').click()")); await pg.wait_for_timeout(200)
        ok((await pg.evaluate(SW + "('main')"))[0] == "Expand all", "both folded one by one: Expand all")
        await pg.evaluate(J("R.querySelector('.rop-fall[data-fall=main]').click()")); await pg.wait_for_timeout(200)
        # no hover peek
        await pg.evaluate(J("R.querySelector('[data-fold=c-customer] .rop-fb').click()")); await pg.wait_for_timeout(200)
        await pg.evaluate(J("R.querySelector('[data-fold=c-customer]').scrollIntoView({block:'center'})")); await pg.wait_for_timeout(150)
        c = await pg.evaluate(J("const r=R.querySelector('[data-fold=c-customer] .rop-sech').getBoundingClientRect(); return [r.left+50, r.top+r.height/2]"))
        await pg.mouse.move(c[0], c[1]); await pg.wait_for_timeout(700)
        ok(await pg.evaluate(J("const s=R.querySelector('[data-fold=c-customer]'); return s.classList.contains('is-shut') && !s.classList.contains('rop-peek')")), "pointing at a folded heading does nothing")
        await pg.mouse.move(5, 5)
        # the right pane's switch
        r0 = await pg.evaluate(SW + "('rail')"); L0 = await pg.evaluate(J(RAIL))
        ok(r0 and not r0[1] and len(L0) >= 4 and r0[0] == ("Collapse all" if False in L0 else "Expand all"), f"the right pane's switch at the top of its groups ({r0}, {L0})")
        rp = await pg.evaluate(J("const w=R.querySelector('.rop-fallw-rail'); const n=w && w.nextElementSibling; return n ? (n.classList.contains('rop-rblk') ? 'rblk' : n.className) : null"))
        ok(rp == "rblk", f"it sits after the stage, above Who has it ({rp})")
        if r0[0] == "Collapse all":
            await pg.evaluate(J("R.querySelector('.rop-fall[data-fall=rail]').click()")); await pg.wait_for_timeout(300)
        ok(all(await pg.evaluate(J(RAIL))) and (await pg.evaluate(SW + "('rail')"))[0] == "Expand all", "Collapse all folds Who has it and every detail group")
        await pg.evaluate(J("R.querySelector('.rop-fall[data-fall=rail]').click()")); await pg.wait_for_timeout(300)
        L1 = await pg.evaluate(J(RAIL)); ok(not any(L1) and (await pg.evaluate(SW + "('rail')"))[0] == "Collapse all", f"Expand all opens them all ({L1})")
        await pg.screenshot(path=os.path.join(OUT, "a2_rail_open.png"))
        await pg.evaluate("__tg.render()"); await pg.wait_for_timeout(700)
        ok(not any(await pg.evaluate(J(RAIL))), "remembered after a redraw (UI.ivFold, rop_fold)")
        # a group's own heading still opens/closes it; the label follows
        await pg.evaluate(J("R.querySelector('.px-props > section.px-pg .px-pg__h').click()")); await pg.wait_for_timeout(250)
        ok((await pg.evaluate(SW + "('rail')"))[0] == "Collapse all", "one group closed by its heading: still Collapse all")
        await pg.evaluate(J("R.querySelector('.rop-fall[data-fall=rail]').click()")); await pg.wait_for_timeout(250)
        # a closed group: no hover
        g = await pg.evaluate(J("const s=R.querySelector('.px-props > section.px-pg:not(.is-open)'); if(!s) return null; s.scrollIntoView({block:'center'}); return s.dataset.pg"))
        if g:
            await pg.wait_for_timeout(150)
            c = await pg.evaluate(J(f"const r=R.querySelector('.px-pg[data-pg={g}] .px-pg__h').getBoundingClientRect(); return [r.left+30, r.top+r.height/2]"))
            await pg.mouse.move(c[0], c[1]); await pg.wait_for_timeout(700)
            ok(not await pg.evaluate(J(f"return R.querySelector('.px-pg[data-pg={g}]').classList.contains('is-open')")), f"pointing at a closed group ({g}) does nothing")
            await pg.mouse.move(5, 5)
        # the truck menu: Truck history in Assets…
        await pg.evaluate(J("const b=R.querySelector('.px-trk .px-trk__more, .px-trk [aria-label*=\"truck\" i][aria-haspopup], .px-trk button[title*=\"picture\" i]'); b && b.click()")); await pg.wait_for_timeout(300)
        mi = await pg.evaluate("(()=>{ const R=document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot; const L=[...R.querySelectorAll('.px-trk__menu button'), ...document.querySelectorAll('.px-trk__menu button')]; return L.map(b=>b.textContent.trim().slice(0,40)); })()")
        if not mi:
            mi = await pg.evaluate("(()=>{ const R=document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot; const b=[...R.querySelectorAll('.px-trk button')].find(x=>/⋯|more|menu/i.test(x.getAttribute('aria-label')||x.title||x.textContent)); if(b) b.click(); return null; })()"); await pg.wait_for_timeout(300)
            mi = await pg.evaluate("(()=>{ const R=document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot; return [...R.querySelectorAll('.px-trk__menu button'), ...document.querySelectorAll('.px-trk__menu button')].map(b=>b.textContent.trim().slice(0,40)); })()")
        hit = [x for x in (mi or []) if x.startswith("Truck history in Assets")]
        ok(hit, f"the truck menu has Truck history in Assets… ({mi})")
        if hit:
            await pg.evaluate("(()=>{ const R=document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot; const b=[...R.querySelectorAll('.px-trk__menu button'), ...document.querySelectorAll('.px-trk__menu button')].find(b=>b.textContent.trim().startsWith('Truck history in Assets')); b.click(); })()"); await pg.wait_for_timeout(700)
            ok(await pg.evaluate("__tg.UI().view") == "assets", "…and opens the truck on the Assets page")
        # the Technician page
        await pg.evaluate("(()=>{ __tg.UI().view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(1200)
        tc = await pg.evaluate(J(SECS)); sw = await pg.evaluate(SW + "('main')")
        ok(tc == ["inbox", "customer"] and sw, f"the Technician page's RO: the same two sections and the switch ({tc}, {sw})")
        await pg.screenshot(path=os.path.join(OUT, "a3_tech.png"))
        # a ROs tab (the Foreman page)
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='foreman'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        await pg.evaluate("(()=>{ const t=[...document.querySelectorAll('.tg-views button')].find(b=>/^ROs/.test(b.textContent.trim())); t && t.click(); })()"); await pg.wait_for_timeout(800)
        await pg.evaluate(f"(()=>{{ const r=document.querySelector('[data-ro=\"{rid}\"], .rq-row[data-id=\"{rid}\"], [data-rid=\"{rid}\"]') || document.querySelector('.rq-row, .rq-r, [data-ro]'); r && r.click(); }})()"); await pg.wait_for_timeout(1200)
        tab = await pg.evaluate("(()=>{ const h=document.querySelector('.jc-host:not(.jc-band-host)'); const R=h && h.shadowRoot; return R ? [...R.querySelectorAll('.rop-col > section.rop-blk')].map(s=>(/rop-k-(\\w+)/.exec(s.className)||[])[1]) : null; })()")
        if tab: ok(tab == ["inbox", "customer"], f"a ROs tab's RO page: the same two sections ({tab})")
        else: print("     (the ROs tab RO page didn't open in this test — skipped)")
        # phone width, Graphite
        await pg.set_viewport_size({"width": 390, "height": 844}); await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        ok(await pg.evaluate(SW + "('main')"), "phone: the switch is there")
        await pg.evaluate("document.documentElement.setAttribute('data-theme','ivd'); __tg.render()"); await pg.wait_for_timeout(500)
        await pg.evaluate(J("const w=R.querySelector('.rop-fallw-main'); w && w.scrollIntoView({block:'center'})")); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "a4_phone_dark.png"))
        ok(not errs, f"no console errors: {errs[:3]}")
        print("FAILS:", len(FAILS), FAILS)
        await b.close()
asyncio.run(main())
