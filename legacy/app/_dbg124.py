import asyncio, json
from playwright.async_api import async_playwright
exec(open('_t124.py').read().split('async def ro_page')[0])
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid, op = await pg.evaluate(PREP + "('')")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); return r ? r.classList.contains('is-on') : null"))
        if not on: await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t').click()")); await pg.wait_for_timeout(600)
        C = "R.querySelector('.ock[data-op]')"
        GO = J(f"const r={C}.querySelector('[data-ock=go]').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]")
        r = await pg.evaluate(GO); print(r)
        print(await pg.evaluate(f"document.elementFromPoint({r[0]},{r[1]}).tagName"))
        await pg.evaluate("window.__ev=[]; ['pointerdown','pointerup','pointermove','pointercancel','lostpointercapture','click'].forEach(k=>document.addEventListener(k,e=>window.__ev.push(k+':'+Date.now()%100000),true))")
        await pg.mouse.move(r[0], r[1]); await pg.mouse.down(); await pg.wait_for_timeout(250); await pg.mouse.up(); await pg.wait_for_timeout(350)
        print(await pg.evaluate("window.__ev"), await pg.evaluate("JSON.stringify(__tg.OCK_ST)"))
        await pg.evaluate("window.__ev=[]")
        await pg.mouse.move(r[0], r[1]); await pg.mouse.down(); await pg.wait_for_timeout(900); await pg.mouse.up(); await pg.wait_for_timeout(400)
        print(await pg.evaluate("window.__ev"))
        print(await pg.evaluate("(()=>{ const p=__tg.STATE().punches.find(p=>p.id==='pn_live'); return [!!p.stop, p.stopReason, JSON.stringify(__tg.OCK_ST)]; })()"))
        print(errs)
        await b.close()
asyncio.run(main())
