# Parsec 14.4 → 15 — the RO page: below Operations only Messages and Customer (Parsec 15); every section folds from its button or
# its heading; pointing at a folded heading no longer opens it (Parsec 15 — one Collapse all / Expand all switch instead, see _t150a)
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots144")
OPEN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); localStorage.removeItem('rop_fold'); __tg.pxSignedIn(); const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>=2); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); return r.id; })()"
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await pg.evaluate(OPEN); await pg.wait_for_timeout(1200)
        order = await pg.evaluate(J("return [...R.querySelectorAll('.rop-col > section.rop-blk')].map(s=>(/rop-k-(\\w+)/.exec(s.className)||[])[1])"))
        ok(order == ["inbox", "customer"], f"below Operations: Messages, then Customer — nothing else ({order})")
        keys = await pg.evaluate(J("return [...R.querySelectorAll('[data-fold]')].map(x=>x.dataset.fold)"))
        nb = await pg.evaluate(J("return R.querySelectorAll('.rop-fb').length"))
        ok("ops" in keys and "c-inbox" in keys and "c-customer" in keys and "r-truck" in keys and "r-stage" in keys and any(k.startswith("g-") for k in keys) and nb >= 5, f"every section folds — {len(keys)} sections, {nb} buttons ({keys})")
        # fold Customer with its button
        await pg.evaluate(J("R.querySelector('[data-fold=c-customer] .rop-fb').click()")); await pg.wait_for_timeout(250)
        st = await pg.evaluate(J("const s=R.querySelector('[data-fold=c-customer]'); return [s.classList.contains('is-shut'), [...s.children].filter(c=>getComputedStyle(c).display!=='none').length, JSON.parse(localStorage.getItem('rop_fold')||'{}')['c-customer']]"))
        ok(st[0] and st[1] == 1 and st[2] == 1, f"the button folds it to its heading, remembered ({st})")
        # pointing at its heading does nothing now
        await pg.evaluate(J("R.querySelector('[data-fold=c-customer] .rop-sech').scrollIntoView({block:'center'})")); await pg.wait_for_timeout(200)
        hb = await pg.evaluate(J("const r=R.querySelector('[data-fold=c-customer] .rop-sech').getBoundingClientRect(); return [r.left+60, r.top+r.height/2]"))
        await pg.mouse.move(hb[0], hb[1]); await pg.wait_for_timeout(700)
        pk = await pg.evaluate(J("const s=R.querySelector('[data-fold=c-customer]'); return [s.classList.contains('rop-peek'), s.classList.contains('is-shut'), [...s.children].filter(c=>getComputedStyle(c).display!=='none').length]"))
        await pg.screenshot(path=os.path.join(OUT, "a1_nopeek.png"))
        ok(pk == [False, True, 1], f"pointing at a folded heading leaves it folded ({pk})")
        await pg.mouse.move(5, 5); await pg.wait_for_timeout(300)
        # the button opens it again
        await pg.evaluate(J("R.querySelector('[data-fold=c-customer] .rop-fb').click()")); await pg.wait_for_timeout(250)
        ok(await pg.evaluate(J("return !R.querySelector('[data-fold=c-customer]').classList.contains('is-shut')")), "the button opens it again")
        # fold the truck card and Operations, redraw: they stay folded
        await pg.evaluate(J("R.querySelector('[data-fold=r-truck] .rop-fb').click(); R.querySelector('[data-fold=ops] .rop-fb').click();")); await pg.wait_for_timeout(250)
        await pg.screenshot(path=os.path.join(OUT, "a2_folded.png"))
        await pg.evaluate("__tg.render()"); await pg.wait_for_timeout(800)
        kept = await pg.evaluate(J("return [R.querySelector('[data-fold=r-truck]').classList.contains('is-shut'), R.querySelector('[data-fold=ops]').classList.contains('is-shut')]"))
        ok(kept == [True, True], f"what's folded stays folded when the page redraws ({kept})")
        # a closed detail group stays closed while pointed at
        g = await pg.evaluate(J("const s=[...R.querySelectorAll('.px-props > .px-pg')].find(x=>!x.classList.contains('is-open')); if(!s) return null; s.scrollIntoView({block:'center'}); return s.dataset.fold"))
        if g:
            await pg.wait_for_timeout(150)
            c = await pg.evaluate(J(f"const r=R.querySelector('[data-fold={g}] .px-pg__h').getBoundingClientRect(); return [r.left+40, r.top+r.height/2]"))
            await pg.mouse.move(c[0], c[1]); await pg.wait_for_timeout(700)
            o1 = await pg.evaluate(J(f"return R.querySelector('[data-fold={g}]').classList.contains('is-open')"))
            ok(not o1, f"a closed detail group ({g}) stays closed while pointed at")
            await pg.mouse.move(5, 5); await pg.wait_for_timeout(300)
        # Parsec 14.5 — the chevron on the right, a click on the heading folds and opens
        res = []
        for k in ["c-inbox", "c-customer"]:
            r = await pg.evaluate(J(f"const s=R.querySelector('[data-fold={k}]'); if(!s) return null; s.scrollIntoView({{block:'center'}}); return 1"))
            if not r: res.append([k, "missing"]); continue
            await pg.wait_for_timeout(150)
            g = await pg.evaluate(J(f"const s=R.querySelector('[data-fold={k}]'), h=s.querySelector('.rop-fh'), t=h.querySelector('h3'), b=h.querySelector('.rop-fb'); const hr=h.getBoundingClientRect(), tr=t.getBoundingClientRect(), br=b.getBoundingClientRect(); return [tr.left+8, tr.top+tr.height/2, (br.right-hr.left)/hr.width]"))
            await pg.mouse.click(g[0], g[1]); await pg.wait_for_timeout(250)
            a1 = await pg.evaluate(J(f"return R.querySelector('[data-fold={k}]').classList.contains('is-shut')"))
            g2 = await pg.evaluate(J(f"const t=R.querySelector('[data-fold={k}] .rop-fh h3').getBoundingClientRect(); return [t.left+8, t.top+t.height/2]"))
            await pg.mouse.click(g2[0], g2[1]); await pg.wait_for_timeout(250)
            a2 = await pg.evaluate(J(f"return R.querySelector('[data-fold={k}]').classList.contains('is-shut')"))
            res.append([k, round(g[2], 2), a1, a2])
        ok(all(len(x) == 4 and x[1] > .9 and x[2] is True and x[3] is False for x in res), f"Messages, Customer: chevron on the right, a click on the heading folds and opens ({res})")
        await pg.mouse.move(5, 5); await pg.wait_for_timeout(400)
        # the Technician page shows the same thing
        await pg.evaluate("(()=>{ __tg.UI().view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(1200)
        t = await pg.evaluate(J("return [R.querySelectorAll('.rop-fb').length, R.querySelector('[data-fold=r-truck]') ? R.querySelector('[data-fold=r-truck]').classList.contains('is-shut') : null, [...R.querySelectorAll('.rop-col > section.rop-blk')].map(s=>(/rop-k-(\\w+)/.exec(s.className)||[])[1])]"))
        ok(t[0] >= 5 and t[1] is True and t[2] == ["inbox", "customer"], f"the Technician page's RO folds the same way, same memory, same two sections ({t})")
        await pg.screenshot(path=os.path.join(OUT, "a3_tech.png"))
        # phone: the buttons
        await pg.set_viewport_size({"width": 390, "height": 844}); await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        ok(await pg.evaluate(J("return R.querySelectorAll('.rop-fb').length")) >= 5, "phone: the buttons are there")
        await pg.evaluate("document.documentElement.setAttribute('data-theme','ivd'); __tg.render()"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, "a4_phone_dark.png"))
        ok(not errs, f"no console errors: {errs[:3]}")
        print("FAILS:", len(FAILS), FAILS)
        await b.close()
asyncio.run(main())
