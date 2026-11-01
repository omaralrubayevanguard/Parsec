import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1000)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()")
        for view, sel, name in [("report", ".dy-paper", "dayreport"), ("timelog", ".tk-paper", "timesheet")]:
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{view}'; U.reportDate='2026-10-23'; U.toast=null; __tg.render(); }})()"); await pg.wait_for_timeout(500)
            if view == 'timelog': await pg.click('[data-a=view][data-v=sheet]'); await pg.wait_for_timeout(400)
            html = await pg.evaluate(f"__tg.PG.paperDoc(document.querySelector('[data-pg] {sel}'), 'x')")
            p2 = await b.new_page(); await p2.set_content(html); await p2.wait_for_timeout(500)
            await p2.pdf(path=os.path.join(H, "shots9", name + ".pdf"), format="Letter", print_background=True, prefer_css_page_size=True)
            print(name, len(html) // 1024, "KB doc"); await p2.close()
        await b.close()
asyncio.run(main())
