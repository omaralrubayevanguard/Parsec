import asyncio
from playwright.async_api import async_playwright
H = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1000)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(1500)
        rid = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length>1); r.operations.forEach(o=>{ o.jobStatus={status:'Hold Tech', setAt:new Date().toISOString(), hand:true}; }); return r.id; })()")
        print("rid", rid, await pg.evaluate(f"!!__tg.getRO('{rid}')"), await pg.evaluate("__tg.STATE().ros.length"))
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()")
        for t in [100, 500, 1000, 2500]:
            await pg.wait_for_timeout(t)
            print(t, await pg.evaluate(f"!!__tg.getRO('{rid}')"), await pg.evaluate("__tg.STATE().ros.length"), await pg.evaluate("(document.querySelector('.toast')||{}).textContent||''"))
        print(errs[:3]); await b.close()
asyncio.run(main())
