import asyncio, os, sys
sys.argv = ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()"); await pg.wait_for_timeout(400)
        rid = await pg.evaluate("(()=>{ const S=__tg.STATE(); const r=S.ros.find(r=>!r.shop && r.id!=='shop' && !r.dateClosed && !(r.route&&r.route.state==='pending') && (()=>{ try{ const s=__tg.rtSuggest(r); return s && (s.to!=='tech' || r.assignedTech); }catch(e){ return false; } })()); return r ? r.id : null; })()")
        print("ro", rid)
        if rid:
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
            sug = await pg.evaluate(J("const b=R.querySelector('.rt2-sug [data-action=rt-open]'); return b ? { to: b.dataset.to, t: b.textContent } : null"))
            print("sug", sug)
            if sug:
                await pg.evaluate(J("R.querySelector('.rt2-sug [data-action=rt-open]').click()")); await pg.wait_for_timeout(700)
                print(await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{rid}'); return [ro.route && ro.route.state, ro.route && ro.route.to, !!document.querySelector('.modal'), !!__tg.UI().rtDraft, (document.querySelector('.toast')||{{}}).textContent||'']; }})()"))
        print("ERRORS", errs[:3]); await b.close()
asyncio.run(main())
