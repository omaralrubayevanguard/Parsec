import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.type+": "+m.text) if m.type in ("error","warning") else None)
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='foreman'; U.fmView='floor'; __tg.render(); })()"); await pg.wait_for_timeout(3000)
        print(await pg.evaluate("""(()=>{ const L=[...document.querySelectorAll('.tg-gi.trk .trk-th')]; return L.map(x=>x.className+':'+(x.querySelector('img')?(x.querySelector('img').getAttribute('src')||'nosrc').slice(0,12)+':'+x.querySelector('img').getAttribute('data-trk-f'):'svg')).join(' | '); })()"""))
        print(await pg.evaluate("""(()=>{ const im=document.querySelector('img[data-trk-f]'); if(!im) return 'none'; const ro=__tg.getRO(im.getAttribute('data-trk-ro')); return JSON.stringify({photo: __tg.trkPhotoOf(ro), att: ro.attachments, inApp: !!im.closest('#app')}); })()"""))
        print(errs[:6]); await b.close()
asyncio.run(main())
