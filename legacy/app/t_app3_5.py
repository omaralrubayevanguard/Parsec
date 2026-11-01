import asyncio, sys, os, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(H, "shots5t")
exec(open(os.path.join(H, "t_app.py")).read().split("async def main")[0].split("SEED = ")[1].join(["SEED = ", ""]) if False else "")
SEED = open(os.path.join(H, "t_app.py")).read().split('SEED = r"""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + H + "/t5.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='triage'; U.modal=null; __tg.render();})()"); await pg.wait_for_timeout(300)
        ids = await pg.evaluate(SEED)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.toast=null; U.tgSel=null; U.tgView='inbox'; __tg.render();})()"); await pg.wait_for_timeout(300)
        async def key(k, w=250): await pg.keyboard.press(k); await pg.wait_for_timeout(w)
        async def ui(js): await pg.evaluate("(()=>{const U=__tg.UI();" + js + ";__tg.render();})()"); await pg.wait_for_timeout(250)
        ev = lambda js: pg.evaluate(js)
        # 1. snooze + undo
        await ui(f"U.tgSel='{ids['apr']}'"); await key("s"); await key("1", 300)
        print("snoozed:", await ev(f"!!__tg.getRO('{ids['apr']}').tgSnz"))
        await pg.click(".toast-undo"); await pg.wait_for_timeout(300)
        print("after undo snoozed:", await ev(f"!!(__tg.getRO('{ids['apr']}')||{{}}).tgSnz"), "in list:", await ev(f"__tg.tgFlat().indexOf('{ids['apr']}')>-1"))
        # 2. approve op 1 from the log popover (Dana, call)
        await ui(f"U.tgSel='{ids['apr']}'"); await key("c"); await key("1", 300)
        await pg.screenshot(path=SH + "/h1_approve_pop.png")
        await key("Enter", 400)
        print("apr ops:", await ev(f"__tg.raOps(__tg.getRO('{ids['apr']}')).map(o=>o.appr?[o.appr.s,o.appr.who,o.appr.how]:null)"), "status:", await ev(f"__tg.roStatus(__tg.getRO('{ids['apr']}')).status"))
        print("toast:", await ev("__tg.UI().toast"))
        # 3. release with every check ticked
        rid = await ev("(()=>{const x=__tg.tgNeedsAll().find(x=>x.btn==='Release'); return x&&x.ro.id;})()")
        await ui(f"U.tgSel='{rid}'"); await key("Enter", 300)
        for k in ["keys", "clean", "invoice", "notify"]:
            el = await pg.query_selector(f".tg-pop [data-action='tg-rl'][data-f='tick'][data-v='{k}']")
            if el: await el.click(); await pg.wait_for_timeout(150)
        await pg.screenshot(path=SH + "/h2_release_ready.png")
        await pg.click(".tg-pop [data-action='tg-rl'][data-f='to'][data-v='o']"); await pg.fill(".tg-pop [data-tg-in='rl-other']", "Sam Driver")
        await key("Enter", 500)
        print("released:", await ev(f"__tg.roStatus(__tg.getRO('{rid}')).status"), await ev(f"JSON.stringify(__tg.getRO('{rid}').releaseRec)"))
        await ui("U.tgView='yard'"); await pg.screenshot(path=SH + "/h3_released_yard.png")
        # 4. template edit persists
        await ui("U.tgView='inbox'; U.modal={type:'tg-tpl', sel:'rdy'}")
        await pg.fill("[data-tg-in='shop-name']", "Vanguard Truck Center"); await pg.fill("[data-tg-in='shop-phone']", "336-555-0100")
        await pg.click("[data-tg-in='tm-body']"); await pg.keyboard.press("End"); await pg.keyboard.type(" Thanks!")
        await pg.screenshot(path=SH + "/h4_tpl_edit.png")
        print("tpl:", await ev("__tg.S().tgTemplates.find(t=>t.id==='rdy').b"), await ev("JSON.stringify(__tg.S().tgShop)"))
        await ui("U.modal=null")
        # 5. reload keeps it all
        await pg.wait_for_timeout(1500); await pg.reload(); await pg.wait_for_timeout(1800)
        print("after reload view:", await ev("__tg.UI().view"), await ev("__tg.UI().tgView"), "tpl kept:", await ev("(__tg.S().tgTemplates||[]).length"), "people kept:", await ev("Object.keys(__tg.S().customers||{}).length"), "cleared:", await ev("(__tg.S().tgCleared||[]).length"))
        await pg.screenshot(path=SH + "/h5_reload.png")
        print("errors:", errs[:10]); await b.close()
asyncio.run(main())
