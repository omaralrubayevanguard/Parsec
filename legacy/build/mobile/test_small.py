import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); out = []
        for w, h in ((360, 740), (430, 932)):
            ctx = await b.new_context(viewport={"width": w, "height": h}, is_mobile=True, has_touch=True); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto("file:///mnt/user-data/outputs/Parsec%20Mobile.html"); await pg.wait_for_timeout(300)
            await pg.click("text=Try it with sample ROs"); await pg.wait_for_timeout(300)
            for route in ["#/today", "#/ros", "#/ro/sx_ro1", "#/op/sx_ro1/sx_op1", "#/sync", "#/me"]:
                await pg.evaluate(f"location.hash = '{route}'"); await pg.wait_for_timeout(350)
                ov = await pg.evaluate("(() => { const v = document.querySelector('.view'); return [v.scrollWidth, v.clientWidth, document.documentElement.scrollWidth, innerWidth]; })()")
                out.append((w, route, ov))
            await pg.evaluate("location.hash='#/op/sx_ro1/sx_op1'"); await pg.wait_for_timeout(300); await pg.screenshot(path=f"small_{w}.png")
            out.append(("errors", errs)); await ctx.close()
        for o in out: print(o)
        await b.close()
asyncio.run(main())
