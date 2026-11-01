import asyncio, json, os, datetime
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" else None)
        await pg.goto("file://" + H + "/t7.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        r = await pg.evaluate("__tg.S().ros.find(x=>x.customerName==='Red Mesa Hauling').id")
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{r}'); const op=__tg.wcOps(r)[0]; op.jobStatus={{status:'Complete', setAt:new Date().toISOString(), hand:true}}; const U=__tg.UI(); U.view='warranty'; U.modal=null; U.toast=null; U.waSel='{r}'; __tg.render(); }})()"); await pg.wait_for_timeout(400)
        SN = f"JSON.stringify((r=>[r.route, r.assignedTech, __tg.wcOps(r).map(o=>o.claim||null), (r.handoffs||[]).length])(__tg.getRO('{r}')))"
        await pg.evaluate("__tg.save()"); await pg.wait_for_timeout(1500); print("stack0", await pg.evaluate("JSON.stringify(__tg.undoLabels().slice(-4))"))
        b0 = await pg.evaluate(SN)
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(250); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        a = await pg.evaluate(SN); print("stack1", await pg.evaluate("JSON.stringify(__tg.undoLabels().slice(-4))"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
        u = await pg.evaluate(SN)
        print(b0); print(a); print(u); print(u == b0)
        print("\n".join(errs))
        await b.close()
asyncio.run(main())
