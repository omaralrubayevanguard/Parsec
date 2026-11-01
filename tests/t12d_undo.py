import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
def J(js): return "(()=>{ const R=" + SR + "; " + js + " })()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/" + sys.argv[1]); await pg.wait_for_timeout(1000)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(1500)
        rid = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length>1); r.operations.forEach(o=>{ o.jobStatus={status:'Hold Tech', setAt:new Date().toISOString(), hand:true}; }); return r.id; })()")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(2500)
        st = f"__tg.getRO('{rid}').operations.map(o=>o.jobStatus&&o.jobStatus.status).join(',')"
        print("before:", await pg.evaluate(st))
        op = await pg.evaluate(f"__tg.getRO('{rid}').operations[1].id")
        await pg.click(f'.px-row[data-op="{op}"]', modifiers=["Control"]); await pg.wait_for_timeout(300)
        await pg.evaluate(J("[...R.querySelectorAll('.rop-sb .px-btn')].find(x=>x.dataset.v==='hold').click()")); await pg.wait_for_timeout(300)
        await pg.evaluate(J("[...R.querySelectorAll('.rop-pop .rop-mi')].find(x=>/Foreman/.test(x.textContent)).click()")); await pg.wait_for_timeout(100)
        print("after hold:", await pg.evaluate(st))
        await pg.wait_for_timeout(1500)
        print("1.5s later:", await pg.evaluate(st))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
        print("undo1:", await pg.evaluate(st))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
        print("undo2:", await pg.evaluate(st))
        await b.close()
asyncio.run(main())
