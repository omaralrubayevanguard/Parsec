import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); F = "file://" + H + "/out.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for th in ["light", "dark"]:
            pg = await b.new_page(viewport={"width": 390, "height": 840})
            pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
            await pg.goto(F); await pg.wait_for_timeout(400)
            await pg.click(f".ip-seg button[data-th={th}]"); await pg.wait_for_timeout(200)
            print(th, "scrollW", await pg.evaluate("document.documentElement.scrollWidth"))
            for k, s in [("cust", "w2"), ("noparts", "ask")]:
                await pg.evaluate(f"window.play=function(){{}}; (()=>{{const v=document.querySelector('.ip-idea[data-k={k}] .ip-vis'); clearTimeout(v._t); v.dataset.step='{s}';}})()")
                await pg.wait_for_timeout(450); el = await pg.query_selector(f".ip-idea[data-k={k}] .ip-vis"); await el.scroll_into_view_if_needed()
                await el.screenshot(path=H + f"/q_{k}_{th}.png")
            await pg.evaluate("document.querySelector('#ip-picks, .ip-bar') && 0")
            await pg.close()
        print("errors", errs); await b.close()
asyncio.run(main())
