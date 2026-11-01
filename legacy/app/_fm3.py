import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_trk")
exec(open(os.path.join(H, "_fm2.py")).read().split("async def main")[0].split("PLACE = ")[1].join(["PLACE = ", ""]) if False else "")
PLACE = open(os.path.join(H, "_fm2.py")).read().split('PLACE = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width":390,"height":844}, has_touch=True, is_mobile=True, device_scale_factor=2, color_scheme="dark"); pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        await pg.evaluate("__tg.applyTheme('ivd')")
        print("placed", await pg.evaluate('"""' and PLACE))
        for view, sub, nm in [("foreman","floor","pf_list"),("triage","desk","pt_list")]:
            k = "fmView" if view=="foreman" else "tgView"
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{view}'; U.{k}='{sub}'; __tg.render(); }})()"); await pg.wait_for_timeout(2000)
            await pg.screenshot(path=os.path.join(OUT, nm + ".png"))
        # open the floor board on the phone (main first)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='foreman'; U.fmView='floor'; __tg.render(); })()"); await pg.wait_for_timeout(800)
        n = await pg.evaluate("(()=>{ const t=document.querySelector('.fm-bays'); if(t) t.scrollIntoView(); return document.querySelectorAll('.fm-bay.has-top').length; })()")
        await pg.wait_for_timeout(500); await pg.screenshot(path=os.path.join(OUT, "pf_floor.png"))
        print("has-top tiles", n, "width", await pg.evaluate("document.documentElement.scrollWidth"))
        print("errs", errs[:4]); await b.close()
asyncio.run(main())
