import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_trk")
F = sys.argv[1] if len(sys.argv) > 1 else "t9.html"; TAG = sys.argv[2] if len(sys.argv) > 2 else "cur"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":1440,"height":900}); pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + H + "/" + F); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        for view, sub in [("foreman","floor"),("foreman","yard"),("foreman","techs"),("triage","desk"),("triage","yard")]:
            k = "fmView" if view=="foreman" else "tgView"
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{view}'; U.{k}='{sub}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
            await pg.screenshot(path=os.path.join(OUT, f"{TAG}_{view}_{sub}.png"))
        print("errs", errs[:4]); await b.close()
asyncio.run(main())
