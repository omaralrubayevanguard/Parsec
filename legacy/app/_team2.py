import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots10")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append("C: "+m.text[:300]) if m.type=="error" and "Failed to load" not in m.text else None)
        await pg.goto("file://" + H + "/t10.html"); await pg.wait_for_timeout(1200)
        print("staff:", await pg.evaluate("JSON.stringify(__tg.staffList().map(s=>[s.name,s.role]))"), "ros:", await pg.evaluate("__tg.STATE().ros.length"))
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.modal=null; U.view='manager'; __tg.render(); })()"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, "team_f0.png"))
        await pg.click("[data-pg=manager] .tg-views [data-v=team]"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, "team_f1.png"))
        add = await pg.query_selector("[data-a=pop][data-p=addp]"); await add.click(); await pg.wait_for_timeout(400)
        await pg.screenshot(path=os.path.join(OUT, "team_f2.png"))
        inp = await pg.query_selector(".tg-pop input"); await inp.fill("Mike Rodriguez"); await pg.click("[data-a=addgo]"); await pg.wait_for_timeout(600)
        print("after add:", await pg.evaluate("JSON.stringify(__tg.staffList().map(s=>[s.name,s.role]))"), await pg.evaluate("(document.querySelector('.mq-pane h2, .mg-pane h2')||{}).textContent"))
        await pg.screenshot(path=os.path.join(OUT, "team_f3.png"))
        print("errs", errs[:5]); await b.close()
asyncio.run(main())
