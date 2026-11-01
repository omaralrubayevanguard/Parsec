import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__)); SH = B + "/tlishots"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/tli_mock.html"); await pg.wait_for_timeout(500)
        ev = lambda js: pg.evaluate(js)
        T = lambda: ev("(document.querySelector('.toast-fm')||{}).textContent||''")
        demo = lambda d: pg.click(f'[data-demo="{d}"]')
        # 2 · reminder: stop and clock out
        await demo("d2"); await pg.click('.tk-remind [data-a="clkout"]'); await pg.wait_for_timeout(100)
        print("2 clkout:", await T(), "| card:", await ev("!!document.querySelector('.tk-remind')"), "| sh:", await ev("JSON.stringify(__tk.S().D.MR['2026-10-22'].sh)"), "| miss note row:", await ev("document.querySelectorAll('.nt.miss').length"))
        await demo("d2"); await pg.click('.tk-remind [data-a="remsnz"]'); await pg.wait_for_timeout(100); print("2 snooze:", await T(), await ev("!!document.querySelector('.tk-remind')"))
        # 4 · past shift
        await demo("d4"); print("4 header:", await ev("document.querySelector('.tg-facts').textContent"))
        await pg.click('.tk-remind [data-a="clkat"]'); await pg.wait_for_timeout(100)
        print("4 clkat:", await T(), "| run punch:", await ev("JSON.stringify(__tk.S().D.MR['2026-10-22'].p.slice(-1)[0])"))
        await pg.click('.toast-fm button'); await pg.wait_for_timeout(100); print("4 undo:", await ev("JSON.stringify(__tk.S().D.MR['2026-10-22'].sh)"), "card back:", await ev("!!document.querySelector('.tk-remind')"))
        await pg.click('.tk-remind [data-a="ot"]'); await pg.wait_for_timeout(100); print("4 ot:", await T(), await ev("!!document.querySelector('.tk-remind')"))
        await demo("d4"); await pg.click('[data-role="foreman"]'); await pg.click('[data-a="view"][data-v="shop"]'); await pg.wait_for_timeout(150)
        print("4 shop:", await ev("[...document.querySelectorAll('.tk-sr small.bad,.tk-sum .bad')].map(x=>x.textContent).join(' | ')"))
        await (await pg.query_selector(".wt-wrap")).screenshot(path=SH + "/f_shop_over.png")
        # 3 · auto lunch
        await demo("d3"); await pg.click('[data-a="lunchok"]'); await pg.wait_for_timeout(100); print("3 keep:", await T(), "| banner:", await ev("!!document.querySelector('.tk-fix.auto')"), "| list why:", await ev("document.querySelector('.tk-di.on .why').textContent"))
        await demo("d3"); await pg.click('[data-a="lunchwork"]'); await pg.wait_for_timeout(100); print("3 worked:", await T(), "| sh:", await ev("JSON.stringify(__tk.S().D.MR['2026-10-20'].sh)"), "| air banner:", await ev("(document.querySelector('.tk-fix.warn p')||{}).textContent"))
        # 8 → 5 · notes, sign, approve, lock
        await demo("d8"); await pg.wait_for_timeout(100)
        for t in ["Pulled codes, wiring good.", "Cleaned EGR valve, tested.", "Doser replaced, flow test good."]:
            await pg.keyboard.type(t); await pg.keyboard.press("Enter")
        await pg.wait_for_timeout(150); print("8 after notes:", await T(), "| pop:", await ev("!!document.querySelector('.tg-pop')"), "| sign enabled:", await ev("!document.querySelector('[data-a=\"tsign\"]').disabled"))
        await pg.click('[data-a="tsign"]'); await pg.wait_for_timeout(100); print("5 signed:", await T(), "|", await ev("document.querySelector('.tk-sgr').textContent"))
        await pg.click('[data-role="foreman"]'); await pg.wait_for_timeout(100); await pg.click('[data-a="tapprove"]'); await pg.wait_for_timeout(100)
        print("5 approved:", await T(), "| stamp:", await ev("!!document.querySelector('.tk-stamp')"), "|", await ev("document.querySelector('.tk-sgr').textContent"))
        await (await pg.query_selector(".wt-wrap")).screenshot(path=SH + "/f_locked_sheet.png")
        await pg.click('[data-a="view"][data-v="day"]'); await pg.click('.tk-di[data-k="2026-10-13"]'); await pg.wait_for_timeout(100)
        print("lock day:", await ev("document.querySelector('.tk-pill.lock').textContent"), "| handles visible:", await ev("[...document.querySelectorAll('.tk-tl .h')].filter(h=>getComputedStyle(h).display!=='none').length"), "| list lock icons:", await ev("document.querySelectorAll('.tk-lk').length"))
        await pg.keyboard.press("e"); await pg.wait_for_timeout(100); print("e on locked:", await T(), "| pop:", await ev("!!document.querySelector('.tg-pop')"))
        await (await pg.query_selector(".wt-wrap")).screenshot(path=SH + "/f_locked_day.png")
        await pg.click('[data-a="view"][data-v="sheet"]'); await pg.click('[data-a="treopen"]'); await pg.wait_for_timeout(100); print("reopen:", await T())
        # cur period, tech
        await demo("try"); await pg.click('[data-a="view"][data-v="sheet"]'); await pg.wait_for_timeout(100)
        print("cur bar:", await ev("document.querySelector('.tk-sgn').textContent"))
        await (await pg.query_selector(".wt-wrap")).screenshot(path=SH + "/f_cur_sheet.png")
        await pg.click('.tk-sgn-due [data-a="per"]'); await pg.wait_for_timeout(100); print("open prev ->", await ev("document.querySelector('.tk-tsbar b').textContent"))
        # 6 · reason
        await demo("d6"); await pg.click('.tg-pop [data-a="pset"] >> nth=0'); await pg.wait_for_timeout(50)
        print("6 save enabled:", await ev("!document.querySelector('[data-a=\"wgo\"]').disabled")); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(100)
        print("6 saved:", await T(), "| badge:", await ev("(document.querySelector('.tk-ed.by')||{}).textContent"))
        await pg.click('[data-role="tech"]'); await pg.wait_for_timeout(100); print("tech sees:", await ev("(document.querySelector('.tk-ed.by')||{}).textContent"))
        await (await pg.query_selector(".wt-wrap")).screenshot(path=SH + "/f_tech_sees.png")
        await demo("d6"); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(100); print("6 esc:", await T(), "| p0:", await ev("(()=>{const p=__tk.S().D.MR['2026-10-22'].p[0]; return p.s+'-'+p.e+' ed:'+(p.ed||'')})()"))
        # foreman edit pop needs a reason
        await demo("try"); await pg.click('[data-role="foreman"]'); await pg.click('.tk-r[data-p] >> nth=0'); await pg.keyboard.press("e"); await pg.wait_for_timeout(100)
        print("edit save disabled:", await ev("document.querySelector('[data-a=\"psave\"]').disabled"), "| label:", await ev("document.querySelector('.tg-pop .tk-why').previousElementSibling.textContent"))
        await (await pg.query_selector(".wt-wrap")).screenshot(path=SH + "/f_fm_edit.png")
        await pg.click('.tg-pop .tk-why [data-a="pset"] >> nth=2'); await pg.click('[data-a="psave"]'); await pg.wait_for_timeout(100); print("edit saved:", await T(), await ev("JSON.stringify((({by,why})=>({by,why}))(__tk.S().D.MR['2026-10-22'].p[0]))"))
        # foreman fix needs reason
        await pg.click('.tk-di[data-k="2026-10-21"]'); await pg.click('.tk-fix [data-a="pop"]'); await pg.wait_for_timeout(100); await pg.keyboard.press("1")
        print("fix disabled w/o reason:", await ev("document.querySelector('[data-a=\"fgo\"]').disabled"))
        # 7 · trend
        await demo("d7"); r = await pg.query_selector('.tk-trend .hit >> nth=5'); bb = await r.bounding_box(); await pg.mouse.move(bb["x"] + bb["width"]/2, bb["y"] + 40); await pg.wait_for_timeout(100)
        print("7 tip:", await ev("document.querySelector('.tk-tip').hidden?'hidden':document.querySelector('.tk-tip').textContent"), "| head:", await ev("document.querySelector('.tk-trs').textContent"))
        await pg.click('[data-a="trtbl"][data-v="1"]'); await pg.wait_for_timeout(100); print("7 table rows:", await ev("document.querySelectorAll('.tk-trt tbody tr').length"))
        await (await pg.query_selector(".wt-wrap")).screenshot(path=SH + "/f_trend_table.png")
        print(errs or "no errors"); await b.close()
asyncio.run(main())
