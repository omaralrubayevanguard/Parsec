import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__)); SH = B + "/ptshots"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1200})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/mgi_mock.html"); await pg.wait_for_timeout(500)
        ev = lambda js: pg.evaluate(js)
        T = lambda: ev("(document.querySelector('.toast-fm')||{}).textContent||''")
        U = lambda k: ev(f"JSON.stringify(__mg.U().{k})")
        await pg.click('.mg-pc[data-k="sold"]'); print("1 pace→", await U("p"), await U("sel"), "|", await ev("(document.querySelector('.mg-pace-l')||{}).textContent"))
        await pg.click('[data-demo="d2"]'); await pg.click('.mg-wr >> nth=0'); print("2 why→bf:", await U("bf"), "| why hidden when filtered:", not await ev("!!document.querySelector('.mg-why')"))
        await pg.click('[data-demo="d3"]'); await pg.click('[data-a="aln"][data-i="1"]'); print("3 mute:", await T(), "| alerts left:", await ev("document.querySelectorAll('.mg-nd.al').length"))
        await pg.click('.toast-fm button'); print("3 undo:", await ev("document.querySelectorAll('.mg-nd.al').length"))
        await pg.click('[data-a="aln"][data-i="0"]'); print("3 see it:", await U("sel"))
        await pg.click('[data-a="alt"]'); print("3 alert toggle:", await T())
        await ev("(()=>{__mg.U().sel='wip';__mg.render();})()"); await pg.keyboard.press("t"); await pg.click('.tg-pop [data-a="alt"]'); print("3 pop checkbox:", await T(), await U("al.wip"))
        await pg.keyboard.press("Escape"); await pg.keyboard.press("1"); await pg.click('.mg-lr[data-k="dec"]'); print("4 leak→", await U("sel"))
        await pg.keyboard.press("1"); await pg.click('.mg-leak [data-k="leak"].btn'); print("4 leak KPI:", await ev("document.querySelector('.mg-hero .big').textContent")); await pg.keyboard.press("1"); print("4 card total:", await ev("document.querySelector('.mg-leak .tot').textContent"))
        await pg.keyboard.press("3"); print("5 view:", await U("view"), await U("fleet")); await pg.keyboard.press("j"); print("5 j:", await U("fleet"))
        await pg.click('.mg-tiles.c3 .mg-tile >> nth=3'); print("5 fleet tile→", await U("sel"), await U("bf"))
        await pg.keyboard.press("1"); await pg.hover('.mg-capg .c >> nth=2'); await pg.wait_for_timeout(50); print("6 cap tip:", await ev("document.querySelector('.tk-tip').innerText.replace(/\\n/g,' / ')"))
        await pg.keyboard.press("5"); await pg.click('.mg-pi[data-k="AW"]'); await pg.fill('[data-pg="AW"][data-k="eff"]','95'); await pg.dispatch_event('[data-pg="AW"][data-k="eff"]','change'); print("7 goal:", await T(), await U("pg.AW.eff"))
        await pg.keyboard.press("2"); await ev("(()=>{__mg.U().sel='eff';__mg.U().brk.eff='tech';__mg.render();})()"); print("7 goal tick on AW row:", await ev("!!document.querySelector('.mg-br[data-v=\"AW\"] em')"))
        await pg.click('[data-a="pop"][data-p="chk"] >> nth=0'); await pg.click('[data-a="chkfix"][data-id="c1"]'); print("8 fix:", await T(), "| header:", await ev("document.querySelector('.tg-hf[data-p=\"chk\"]').textContent"), "| chip gone:", not await ev("!!document.querySelector('.mg-dchip')"))
        await pg.keyboard.press("Escape"); await pg.keyboard.press("1"); await pg.click('[data-a="rep"]'); print("9 report:", await ev("document.querySelector('.mg-sheet h3').textContent"))
        await pg.click('[data-a="repm"][data-v="2026-08-01"]'); print("9 Aug:", await ev("document.querySelector('.mg-sheet h3').textContent"))
        await pg.fill('#mg-rn','Comebacks down — keep the connector check.'); await pg.click('[data-a="repx"]'); print("9 closed:", await U("rep"), await U("repn"))
        await ev("(()=>{__mg.goKpi('gp');})()"); await pg.click('[data-a="unl"]'); print("10 unlocked:", await ev("document.querySelector('.mg-hero .big').textContent"), "| list gp:", await ev("document.querySelector('.mg-it[data-k=\"abs\"] .v').textContent"))
        await pg.click('[data-a="unl0"]'); print("10 hidden:", await ev("!!document.querySelector('.mg-lockc')"))
        for d in ["day","wk","lwk","mo","lmo","qt","lqt","yr"]:
            await ev(f"(()=>{{__mg.U().p='{d}';__mg.U().unl=true;__mg.U().view='kpi';__mg.render();}})()")
            for k in ["leak","gp","pgm","lgm","gpr","abs","sales","eff","wip"]:
                await ev(f"(()=>{{__mg.U().sel='{k}';__mg.render();}})()")
            await ev("(()=>{__mg.U().view='ov';__mg.render();__mg.U().view='fleet';__mg.render();__mg.U().view='team';__mg.render();})()")
        print("cycled periods × new KPIs and views")
        print(errs or "no errors"); await b.close()
asyncio.run(main())
