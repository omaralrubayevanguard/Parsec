import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1480,"height":1000}); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto("file:///mnt/user-data/outputs/Parsec%20RO%20list%20mock-up.html"); await pg.wait_for_timeout(600)
        await pg.screenshot(path="rl1.png")
        # select two rows -> bulk bar
        await pg.click(".rl-row[data-ro] >> nth=1 >> [data-cb]", force=True); await pg.click(".rl-row[data-ro] >> nth=3 >> [data-cb]", force=True); await pg.hover(".rl-row[data-ro] >> nth=4"); await pg.wait_for_timeout(300)
        await pg.screenshot(path="rl2.png")
        await pg.keyboard.press("Escape")
        await pg.click("[data-disp]"); await pg.wait_for_timeout(250); await pg.screenshot(path="rl3.png")
        await pg.click("[data-gb=stage]"); await pg.wait_for_timeout(250); await pg.mouse.click(700,140); await pg.wait_for_timeout(200)
        await pg.screenshot(path="rl4.png")
        await pg.click("[data-optset=board]"); await pg.wait_for_timeout(300); await pg.screenshot(path="rl5.png")
        await pg.click("[data-optset=peek]"); await pg.wait_for_timeout(300); await pg.keyboard.press("j"); await pg.keyboard.press("j"); await pg.wait_for_timeout(200); await pg.screenshot(path="rl6.png")
        await pg.click("[data-theme-set=dark]"); await pg.wait_for_timeout(250); await pg.screenshot(path="rl7.png")
        await pg.click("[data-optset=list]"); await pg.wait_for_timeout(250); await pg.screenshot(path="rl8.png")
        await pg.click("[data-optset=board]"); await pg.wait_for_timeout(250); await pg.screenshot(path="rl9.png")
        await pg.fill("[data-q]","haul"); await pg.wait_for_timeout(200); print("search board cards:", len(await pg.query_selector_all(".rl-card")))
        print("errors:",errs); await b.close()
asyncio.run(main())
