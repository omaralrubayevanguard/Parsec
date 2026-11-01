import asyncio, os, json
from playwright.async_api import async_playwright
H = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app"; OUT = os.path.join(H, "shots12ic")
FX = lambda n: open(os.path.join(H, "imptest", n), encoding="utf-8").read()
PASTE = """(t => { const dt = new DataTransfer(); dt.setData('text/plain', t); document.querySelector('#imp-dlg .ix-drop').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); })"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(200)
        await pg.evaluate("__tg.IMPX.open({})"); await pg.evaluate(PASTE + "(" + json.dumps(FX("case1.txt")) + ")"); await pg.wait_for_timeout(200); await pg.evaluate("__tg.IMPX.apply()"); await pg.wait_for_timeout(400)
        rid = await pg.evaluate("__tg.STATE().ros.find(x => x.roNumber === 'RA0001238877').id")
        await pg.evaluate(f"__tg.IMPX.open({{ ro: '{rid}' }})"); await pg.evaluate(PASTE + "(" + json.dumps(FX("case2.txt")) + ")"); await pg.wait_for_timeout(200); await pg.evaluate("__tg.IMPX.apply()"); await pg.wait_for_timeout(400)
        mike = await pg.evaluate("(__tg.staffList().find(s => s.name === 'Mike Rodriguez')||{}).id")
        print("tech on the RO:", await pg.evaluate(f"__tg.getRO('{rid}').assignedTech"))
        await pg.evaluate(f"(() => {{ localStorage.setItem('tec_viewas', '{mike}'); __tg.pxSignedIn(); __tg.CX.U().skipMorning = __tg.todayStr(); __tg.PG.go('tech'); }})()"); await pg.wait_for_timeout(500)
        await pg.evaluate(f"(() => {{ __tg.CX.TU().ro = '{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(400)
        txt = await pg.evaluate("(document.querySelector('[data-pg=tech] .tch-pane')||{}).textContent||''")
        print("tech pane has ASIST notes:", "wrote in ASIST" in txt, "| Imported:", "mported from ASIST" in txt)
        await pg.evaluate("(() => { const b = document.querySelector('[data-pg=tech] [data-a=tactall]'); if(b) b.click(); })()"); await pg.wait_for_timeout(300)
        el = await pg.query_selector("[data-pg=tech] .tch-k-activity")
        if el: await el.screenshot(path=os.path.join(OUT, "d_tech_activity.png"))
        print("sign-in list hides ASIST people:", await pg.evaluate("(() => { localStorage.removeItem('tec_viewas'); __tg.pxSignedIn(); return __tg.staffList().filter(s => s.noSignIn).map(s => s.name); })()"))
        print("ERR", errs); await b.close()
asyncio.run(main())
