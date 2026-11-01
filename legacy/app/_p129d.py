import asyncio, os, sys, json
sys.argv = ['x', sys.argv[1] if len(sys.argv) > 1 else 't12.html']
_src = open("_t127p.py").read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots129"); os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ __tg.STATE().punches.forEach(p=>{ if(!p.stop){ p.stop=new Date().toISOString(); p.stopReason='Switched job'; p.burntCredited=true; } }); localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()")
        print('me', await pg.evaluate("__tg.pcMe()"))
        L = await pg.evaluate("__tg.STATE().ros.filter(r=>!r.shop && __tg.roStatus(r).status==='Complete – Released').map(r=>r.id)")
        ro = L[0]
        RS = f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); return [__tg.roStatus(r).status, !!r.dateClosed, r.operations.map(o=>__tg.opDoneNow(o)), __tg.STATE().punches.filter(p=>!p.stop).map(p=>[p.by,p.roId===r.id])]; }})()"
        print('start', await pg.evaluate(RS))
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "h_admin_rel.png"))
        await pg.evaluate(J("R.querySelector('.px-status--button').click()")); await pg.wait_for_timeout(400)
        await pg.screenshot(path=os.path.join(OUT, "i_admin_menu.png"))
        await pg.evaluate(J("const b=[...R.querySelectorAll('.px-menu__item')].find(x=>/^Working/i.test(x.textContent.trim())); if(b) b.click()")); await pg.wait_for_timeout(2500)
        print('after Working', await pg.evaluate(RS), await pg.evaluate("__tg.UI().toast"))
        op = await pg.evaluate(f"__tg.STATE().ros.find(r=>r.id==='{ro}').operations[0].id")
        on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); return r ? r.classList.contains('is-on') : null"))
        if not on: await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t'); if(r) r.click()")); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, "j_admin_after.png"))
        c = await pg.evaluate(J(f"const c=R.querySelector('.ock[data-op=\"{op}\"]'); return c ? [c.dataset.mode, c.dataset.can, !!c.querySelector('[data-ock=go]')] : null"))
        print('card', c)
        await pg.evaluate(J(f"const g=R.querySelector('.ock[data-op=\"{op}\"] [data-ock=go]'); if(g) g.click()")); await pg.wait_for_timeout(1500)
        print('after go', await pg.evaluate(RS), await pg.evaluate(J("return (R.getElementById('toast')||{}).textContent||''")))
        await pg.screenshot(path=os.path.join(OUT, "k_admin_go.png"))
        print(errs)
        await b.close()
asyncio.run(main())
