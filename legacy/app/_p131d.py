import asyncio, os, sys, json
sys.argv = ['x', 't12.html']
_src = open("_t127p.py").read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()")
        for v in ['rolist','ros','tech','triage','foreman','parts','inventory','warranty','manager','fixes','timelog','career','admin']:
            await pg.evaluate(f"(()=>{{ __tg.UI().view='{v}'; __tg.render(); }})()"); await pg.wait_for_timeout(700)
            r0 = await pg.evaluate("[...document.querySelectorAll('#app button,#app [role=button]')].filter(b=>{ const r=b.getBoundingClientRect(); return r.width>0 && /search|find/i.test((b.title||'')+' '+(b.getAttribute('aria-label')||'')+' '+b.textContent.slice(0,30)); }).map(b=>(b.title||b.getAttribute('aria-label')||b.textContent.trim()).slice(0,40))")
            r = await pg.evaluate("""[...document.querySelectorAll('#app input[type=search], #app input[placeholder]')].filter(i=>{ const r=i.getBoundingClientRect(); return r.width>0 && (!i.type || i.type==='text' || i.type==='search'); }).map(i=>[i.placeholder, i.getAttribute('aria-label'), i.dataset.bind||i.dataset.in||i.dataset.a||'', i.closest('label,div') && i.closest('label,div').className, Math.round(i.getBoundingClientRect().width)])""")
            print(v, r, '| buttons:', r0[:4])
        await b.close()
asyncio.run(main())
