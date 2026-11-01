import asyncio, os, sys, json
sys.argv = ['x', sys.argv[1] if len(sys.argv) > 1 else 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OPEN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); localStorage.removeItem('rop_fold'); __tg.pxSignedIn(); const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>=2 && r.operations.some(o=>o.jobType==='WARR'||/WARR/.test(o.jobType||''))) || __tg.STATE().ros.find(r=>!r.shop && !r.dateClosed); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); return r.id; })()"
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p, 1440, 1000)
        await pg.evaluate(OPEN); await pg.wait_for_timeout(1200)
        for k in ["c-parts", "c-history", "c-warranty", "c-customer", "c-estimate"]:
            r = await pg.evaluate(J(f"const s=R.querySelector('[data-fold={k}]'); if(!s) return null; s.scrollIntoView({{block:'center'}}); const b=s.querySelector('.rop-fb'); const h=s.querySelector('.rop-fh'); const br=b.getBoundingClientRect(), hr=h.getBoundingClientRect(); return [br.left+br.width/2, br.top+br.height/2, Math.round(br.left-hr.left), Math.round(hr.width), getComputedStyle(b).opacity]"))
            if not r: print(k, "missing"); continue
            await pg.wait_for_timeout(200)
            r = await pg.evaluate(J(f"const s=R.querySelector('[data-fold={k}]'); const b=s.querySelector('.rop-fb'); const h=s.querySelector('.rop-fh'); const br=b.getBoundingClientRect(), hr=h.getBoundingClientRect(); return [br.left+br.width/2, br.top+br.height/2, Math.round(br.left-hr.left), Math.round(hr.width), getComputedStyle(b).opacity]"))
            await pg.mouse.click(r[0], r[1]); await pg.wait_for_timeout(300)
            st = await pg.evaluate(J(f"return R.querySelector('[data-fold={k}]').classList.contains('is-shut')"))
            print(k, "chevron at x-offset", r[2], "of", r[3], "opacity", r[4], "→ shut after real click:", st)
        await pg.screenshot(path="shots144/q_fold.png")
        print("ERR", errs[:3])
        await b.close()
asyncio.run(main())
