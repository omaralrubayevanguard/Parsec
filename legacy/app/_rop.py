import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots11")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); pg.set_default_timeout(6000)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t11.html"); await pg.wait_for_timeout(1000)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='rolist'; __tg.render(); })()"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, "r_list.png"))
        rid = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.filter(r=>!r.shop && (r.operations||[]).length>=2 && r.assignedTech)[0]; return r.id; })()")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "r_page.png"))
        await pg.screenshot(path=os.path.join(OUT, "r_page_full.png"), full_page=True)
        h = await pg.evaluate("document.documentElement.scrollHeight"); print("height", h)
        print(await pg.evaluate("(()=>{ const out=[]; const walk=(root)=>{ root.querySelectorAll('*').forEach(e=>{ if(e.scrollHeight>e.clientHeight+40 && /auto|scroll/.test(getComputedStyle(e).overflowY)) out.push((e.className||e.tagName).toString().slice(0,60)+':'+e.scrollHeight+'/'+e.clientHeight); if(e.shadowRoot) walk(e.shadowRoot); }); }; walk(document); return out; })()"))
        for i in range(2, 5):
            await pg.mouse.move(700, 600); await pg.mouse.wheel(0, 700); await pg.wait_for_timeout(400); await pg.screenshot(path=os.path.join(OUT, "r_page%d.png" % i))
        await b.close()
asyncio.run(main())
