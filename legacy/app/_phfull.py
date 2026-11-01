import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_phone")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        for v in sys.argv[1:]:
            js = v.split(":", 1)
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{js[0]}'; U.modal=null; U.toast=null; __tg.render(); window.scrollTo(0,0); }})()"); await pg.wait_for_timeout(500)
            if len(js) > 1: await pg.evaluate(js[1]); await pg.wait_for_timeout(500)
            h = await pg.evaluate("document.documentElement.scrollHeight")
            await pg.screenshot(path=f"{OUT}/full_{js[0]}.png", full_page=True)
            print(js[0], "height", h)
        print("errors", errs[:5]); await b.close()
asyncio.run(main())
