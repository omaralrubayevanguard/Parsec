import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_trk")
TOP = os.path.join(os.path.dirname(H), "build", "trk", "web_top_blue.png")
PLACE = open(os.path.join(H, "_fm2.py")).read().split('PLACE = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        # 9.7 data: starter pictures saved without a top view
        print("migrate:", await pg.evaluate("(()=>{ const S=__tg.STATE(); S.truckPics=[{id:'st-white',make:'Volvo',model:'VNL 760',years:'2018-2024',src:'starter:side_white',cut:1},{id:'st-red',make:'Volvo',model:'VHD',years:'',src:'starter:side_red',cut:1},{id:'trk_x',make:'Volvo',model:'VNR 640',years:'',src:'data:image/png;base64,AAAA',cut:1}]; return __tg.trkLib().map(e=>e.id+':'+(e.top===undefined?'undef':e.top)).join(', '); })()"))
        await pg.evaluate("__tg.STATE().truckPics=undefined"); 
        print("placed", await pg.evaluate(PLACE))
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='profile'; U.pxSec='data'; __tg.render(); })()"); await pg.wait_for_timeout(800)
        await pg.locator("[data-trk-card]").scroll_into_view_if_needed()
        await pg.locator(".px-card:has([data-trk-card])").screenshot(path=os.path.join(OUT, "s98_settings.png"))
        # take the top view off the red one, then give it one
        await pg.evaluate("(()=>{ const e=__tg.trkLib().find(x=>x.id==='st-red'); e.top=''; __tg.render(); })()"); await pg.wait_for_timeout(300)
        print("red top slot:", await pg.evaluate("document.querySelector('.px-trkr__top[data-id=\"st-red\"]').className"))
        async with pg.expect_file_chooser() as fc:
            await pg.locator('.px-trkr__top[data-id="st-red"]').click()
        f = await fc.value; await f.set_files(TOP); await pg.wait_for_timeout(1000)
        print("red top after add:", await pg.evaluate("String(__tg.trkLib().find(x=>x.id==='st-red').top).slice(0,22)"), await pg.evaluate("document.querySelector('.px-trkr__top[data-id=\"st-red\"]').className"))
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='foreman'; U.fmView='floor'; __tg.render(); })()"); await pg.wait_for_timeout(800)
        print("bays with top:", await pg.evaluate("document.querySelectorAll('.fm-bay.has-top').length"), "free tiles keep size:", await pg.evaluate("[...document.querySelectorAll('.fm-bay')].map(x=>Math.round(x.getBoundingClientRect().height)).filter((v,i,a)=>a.indexOf(v)===i).join(',')"))
        # menu in the RO header
        await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(x=>!x.shop && __tg.trkPick(x).kind==='model'); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); })()"); await pg.wait_for_timeout(900)
        await pg.locator(".px-trk__act").click(); await pg.wait_for_timeout(300)
        print("menu:", await pg.evaluate("[...document.querySelector('.jc-host').shadowRoot.querySelectorAll('.px-trk__menu b')].map(x=>x.textContent).join(' | ')"))
        # selecting a bay with a top view keeps the ring visible
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='foreman'; U.fmView='floor'; __tg.render(); })()"); await pg.wait_for_timeout(600)
        await pg.locator(".fm-bay.has-top").first.click(); await pg.wait_for_timeout(500)
        el = pg.locator(".fm-bay.has-top.sel").first
        print("selected has-top:", await el.count())
        if await el.count(): await el.screenshot(path=os.path.join(OUT, "s98_selbay.png"))
        print("errs", errs[:4]); await b.close()
asyncio.run(main())
