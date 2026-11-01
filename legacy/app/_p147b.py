import asyncio, os, sys, json
sys.argv = ['x', sys.argv[1] if len(sys.argv) > 1 else 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OPEN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); localStorage.removeItem('rop_fold'); __tg.pxSignedIn(); const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>=2); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); return r.id; })()"
RECT = "(el)=>{ if(!el) return null; const r=el.getBoundingClientRect(); return [Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]; }"
async def main():
    async with async_playwright() as p:
        for w in (1200, 1280, 1366, 1440):
            b, pg, errs = await setup(p, w=w)
            await pg.evaluate(OPEN); await pg.wait_for_timeout(1200)
            await pg.evaluate(J("const a=R.querySelector('.px-trk__act'); a.scrollIntoView({block:'center'}); a.click();")); await pg.wait_for_timeout(300)
            m = await pg.evaluate(J(f"const f={RECT}; const mn=R.querySelector('.px-trk__menu'); let c=mn.parentElement, clip=null; while(c){{ const cs=getComputedStyle(c); if(/(auto|scroll|hidden|clip)/.test(cs.overflowX+cs.overflowY)){{ clip=[c.className.slice(0,40), f(c)]; break; }} c=c.parentElement; }} return [f(mn), f(R.querySelector('.px-trk__act')), clip]"))
            print(w, "truck menu", m)
            if w==1280: await pg.screenshot(path=f"/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/p147_trk_{w}.png")
            await pg.mouse.click(5, 5); await pg.wait_for_timeout(200)
            await pg.evaluate(J("const a=R.querySelector('.px-status--button'); a.scrollIntoView({block:'center'}); a.click();")); await pg.wait_for_timeout(300)
            await pg.evaluate(J("const b=[...R.querySelectorAll('.px-smain .px-menu__item')].find(x=>/Customer/.test(x.textContent)); b.dispatchEvent(new MouseEvent('mouseenter'));")); await pg.wait_for_timeout(200)
            sm = await pg.evaluate(J(f"const f={RECT}; return [f(R.querySelector('.px-smenu')), f(R.querySelector('.px-smain')), f(R.querySelector('.px-smenu .px-sub')), f(R.querySelector('.px-status--button')), getComputedStyle(R.querySelector('.px-smenu')).position, R.host ? f(R.host) : null]"))
            print(w, "status", sm)
            if w==1280: await pg.screenshot(path=f"/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/p147_st_{w}.png")
            sel = await pg.evaluate(J("const L=[...R.querySelectorAll('button')].filter(b=>b.offsetParent && /status|Hold tech/i.test(b.getAttribute('aria-label')||b.title||'')); return L.map(b=>b.className+'|'+(b.getAttribute('aria-label')||b.title)).slice(0,6)"))
            print("status-ish buttons", sel)
            await b.close()
asyncio.run(main())
