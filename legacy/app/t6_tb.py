import asyncio, os, datetime, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH=os.path.join(H,'shots6')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/t5.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        for th in ["ivl","mist"]:
            await pg.evaluate(f"__tg.applyTheme('{th}')")
            for v in ["warranty","fixes","ros","parts","manager","timelog","career","console","rolist","triage","foreman"]:
                await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.view='{v}'; U.modal=null; U.toast=null; __tg.render();}})()"); await pg.wait_for_timeout(350)
                r = await pg.evaluate("""(()=>{ const q=s=>{const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); return [s, Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height), getComputedStyle(e).position]}; return [getComputedStyle(document.documentElement).getPropertyValue('--tb-h'), q('.topbar'), q('.pz-hdr'), q('.iv-side'), q('.ro-list'), document.documentElement.scrollHeight] })()""")
                print(th, v, json.dumps(r))
                if th=='ivl': await pg.screenshot(path=f"{SH}/v_{v}.png")
        await b.close()
asyncio.run(main())
