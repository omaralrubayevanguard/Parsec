import asyncio, os, sys, json
sys.argv = ['x', sys.argv[1] if len(sys.argv) > 1 else 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OPEN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); localStorage.removeItem('rop_fold'); __tg.pxSignedIn(); const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>=2); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); return r.id; })()"
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await pg.evaluate(OPEN); await pg.wait_for_timeout(1200)
        bx = await pg.evaluate(J("const t=R.querySelector('.rop-orow .px-row__t'); t.scrollIntoView({block:'center'}); const r=t.getBoundingClientRect(); return [r.left+20, r.top+r.height/2, t.textContent]"))
        print('title', bx)
        await pg.mouse.dblclick(bx[0], bx[1]); await pg.wait_for_timeout(400)
        print('input?', await pg.evaluate(J("const i=R.querySelector('.rop-ren'); return i ? [i.value, R.activeElement===i] : null")))
        # look for other complaint fields in the open card
        print('fields', await pg.evaluate(J("return [...R.querySelectorAll('.complaintField, [data-f=complaint], textarea, input')].slice(0,12).map(x=>x.className+':'+(x.value||'').slice(0,30))")))
        print(errs)
        await b.close()
asyncio.run(main())
