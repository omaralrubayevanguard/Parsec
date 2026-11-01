import asyncio, os, datetime, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(H, "shots6")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/t5.html"); await pg.wait_for_timeout(1500)
        for th in ["ivl", "mist"]:
            await pg.evaluate(f"__tg.applyTheme('{th}')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
            await pg.evaluate("(()=>{const U=__tg.UI(); U.view='warranty'; U.modal=null; U.toast=null; __tg.render();})()"); await pg.wait_for_timeout(600)
            r = await pg.evaluate("""(()=>{ const q=s=>{const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); const c=getComputedStyle(e); return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height),c.display,c.position,c.gridTemplateColumns||'',c.flexDirection]}; return {main:q('.main'), page:q('.wx-page'), list:q('.wx-list'), item:q('.wx-item'), pane:q('.wx-pane'), rt:q('.rt-in, .rt-inbox')}; })()""")
            print(th, json.dumps(r))
            await pg.screenshot(path=f"{SH}/p_{th}.png")
        await b.close()
asyncio.run(main())
