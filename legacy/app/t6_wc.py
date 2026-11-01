import asyncio, os, datetime
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(H, "shots6")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/" + (os.environ.get("PG") or "t5.html")); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='warranty'; U.modal=null; U.toast=null; __tg.render();})()"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=f"{SH}/w1.png")
        info = await pg.evaluate("""(()=>{ const S=__tg.S(); const out=[]; S.ros.forEach(r=>{ (r.operations||[]).forEach(o=>{ if(o.claim||o.jobType==='WARR'||o.jobType==='RECALL'||r.warranty) out.push([r.roNumber, r.warranty?'W':'', o.jobType, (o.claim||{}).status||'', o.complaint.slice(0,40)]); }); }); return out; })()""")
        for x in info: print(x)
        # scroll the detail pane
        await pg.evaluate("(()=>{const e=document.querySelector('.wx-pane'); if(e) e.scrollTop=600;})()"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=f"{SH}/w2.png")
        btns = await pg.query_selector_all(".wx-item")
        if len(btns) > 2: await btns[2].click(timeout=5000); await pg.wait_for_timeout(400); await pg.screenshot(path=f"{SH}/w3.png")
        await pg.evaluate("__tg.applyTheme('ivd')"); await pg.wait_for_timeout(400); await pg.screenshot(path=f"{SH}/w4_dark.png")
        print("errors", errs)
        await b.close()
asyncio.run(main())
