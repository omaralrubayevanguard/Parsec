import asyncio, os, sys, json
sys.argv = ['x', sys.argv[1] if len(sys.argv) > 1 else 't12.html']
_src = open("_t127p.py").read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots129"); os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        L = await pg.evaluate("__tg.STATE().ros.filter(r=>!r.shop).map(r=>[r.id, r.roNumber, __tg.roStatus(r).status, !!r.dateClosed, r.dateClosedAuto, r.assignedTech, r.operations.map(o=>__tg.opDoneNow(o))])")
        ro = L[0][0]; T = L[0][5]
        sid = await pg.evaluate(f"__tg.staffList().find(s=>s.name==={json.dumps(T)}).id")
        await pg.evaluate(SIGN(sid))
        RS = f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); return [__tg.roStatus(r).status, r.dateClosed, r.operations.map(o=>__tg.opDoneNow(o)), __tg.STATE().punches.filter(p=>!p.stop).map(p=>[p.by,p.roId===r.id])]; }})()"
        print('start', await pg.evaluate(RS))
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "d_rel.png"))
        await pg.evaluate(J("R.querySelector('.px-status--button').click()")); await pg.wait_for_timeout(400)
        await pg.evaluate(J("const b=[...R.querySelectorAll('.px-menu__item')].find(x=>/^Hold tech/i.test(x.textContent.trim())); if(b) b.click()")); await pg.wait_for_timeout(2500)
        print('after Hold tech', await pg.evaluate(RS), await pg.evaluate("__tg.UI().toast"))
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "e_rel_hold.png"))
        op = await pg.evaluate(f"__tg.STATE().ros.find(r=>r.id==='{ro}').operations[0].id")
        on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); return r ? r.classList.contains('is-on') : null"))
        if not on: await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t'); if(r) r.click()")); await pg.wait_for_timeout(500)
        c = await pg.evaluate(J(f"const c=R.querySelector('.ock[data-op=\"{op}\"]'); return c ? [c.dataset.mode, c.dataset.can, !!c.querySelector('[data-ock=go]'), c.dataset.off, c.dataset.lock] : null"))
        print('card', c)
        await pg.evaluate(J(f"const g=R.querySelector('.ock[data-op=\"{op}\"] [data-ock=go]'); if(g) g.click()")); await pg.wait_for_timeout(1500)
        print('after go', await pg.evaluate(RS), await pg.evaluate(J("return (R.getElementById('toast')||{}).textContent||''")), await pg.evaluate("__tg.UI().toast"))
        await pg.screenshot(path=os.path.join(OUT, "f_rel_go.png"))
        # the RO list: is it there?
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='ros'; U.selectedRo=null; __tg.render(); })()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "g_list.png"))
        await b.close()
asyncio.run(main())
