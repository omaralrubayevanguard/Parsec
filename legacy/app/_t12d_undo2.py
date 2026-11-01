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
        rid = await pg.evaluate("__tg.STATE().ros.find(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations[0] && (r.operations[0].parts||[]).length).id")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(2500)
        st = f"__tg.getRO('{rid}').operations[0].parts.length + ':' + __tg.getRO('{rid}').operations[0].parts.map(p=>p.status).join(',')"
        print("before:", await pg.evaluate(st))
        # an existing RO page action: a part's status from its menu
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.ivTab=U.ivTab||{{}}; U.ivTab[__tg.getRO('{rid}').operations[0].id]='parts'; __tg.render(); }})()"); await pg.wait_for_timeout(500)
        await pg.evaluate(J("R.querySelector('.px-li--part .px-pstat').click()")); await pg.wait_for_timeout(300)
        await pg.evaluate(J("const it=[...R.querySelectorAll('.px-pop .px-menu__item')].find(x=>/Returned|Ordered/.test(x.textContent)); it && it.click();")); await pg.wait_for_timeout(1500)
        print("after:", await pg.evaluate(st))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
        print("undo1:", await pg.evaluate(st))
        await b.close()
asyncio.run(main())
