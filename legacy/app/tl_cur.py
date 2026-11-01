import asyncio, os, datetime, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(H, "shots_tl"); os.makedirs(SH, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 14, 15))
        await pg.goto("file://" + H + "/t7.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='timelog'; U.modal=null; U.toast=null; __tg.render();})()"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=f"{SH}/cur_1.png")
        h = await pg.evaluate("document.documentElement.scrollHeight"); print("height", h)
        await pg.screenshot(path=f"{SH}/cur_full.png", full_page=True)
        info = await pg.evaluate("""JSON.stringify((()=>{ const S=__tg.S(); const by={}; S.punches.forEach(p=>{ const k=p.by||'(none)'; by[k]=(by[k]||0)+1; }); return {punches:S.punches.length, shifts:(S.shifts||[]).length, by, staff:__tg.staffList().map(s=>[s.name,s.role]), days:[...new Set(S.punches.map(p=>p.start.slice(0,10)))].sort().slice(-12), reasons:[...new Set(S.punches.map(p=>p.startReason+'|'+p.stopReason))].slice(0,20)}; })())""")
        print(info)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.modal={type:'eod', day:'2026-10-22'}; __tg.render();})()"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=f"{SH}/cur_eod.png")
        await pg.evaluate("(()=>{const U=__tg.UI(); U.modal=null; U.view='report'; U.reportDate='2026-10-21'; __tg.render();})()"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=f"{SH}/cur_report.png", full_page=True)
        await b.close()
asyncio.run(main())
