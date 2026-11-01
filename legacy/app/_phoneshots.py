import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(400)
        for v in ["inbox","console","ros","rolist","triage","foreman","warranty","parts","fixes","timelog","career","manager","report"]:
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; U.modal=null; __tg.render(); window.scrollTo(0,0); }})()"); await pg.wait_for_timeout(400)
            await pg.screenshot(path=f"{H}/shots_phone/{v}.png")
            sw = await pg.evaluate("document.documentElement.scrollWidth")
            print(v, "scrollWidth", sw)
        print("errors", errs[:4]); await b.close()
asyncio.run(main())
