import asyncio, os, sys, json
sys.argv = ['x', 't12_cc.html']
_src = open('_t127p.py').read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.PG.go('foreman'); })()"); await pg.wait_for_timeout(800)
        await pg.evaluate("(()=>{ const n=[...document.querySelectorAll('.main .tg-it')].find(x=>x.offsetParent); if(n) n.click(); })()"); await pg.wait_for_timeout(500)
        print(await pg.evaluate("(()=>{ const id=__tg.UI().fmSel; const r=__tg.getRO(id); return [id, r && r.roNumber, r && r.noRoadTest, r && __tg.STATE && (typeof __tg.rtNeeded==='function' ? __tg.rtNeeded(r) : 'nohook'), !!document.querySelector('.tg-top .trx-rtb'), (document.querySelector('.tg-top')||{}).innerText.slice(0,200)]; })()"))
        await b.close()
asyncio.run(main())
