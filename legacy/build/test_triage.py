import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1480,"height":1000}); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto("file:///mnt/user-data/outputs/Parsec%20Triage%20ideas.html"); await pg.wait_for_timeout(500)
        for th in ("light","dark"):
            await pg.click(f"[data-theme-set={th}]")
            for i in range(1,9):
                await pg.click(f"[data-idea='{i}']"); await pg.wait_for_timeout(200)
                await pg.screenshot(path=f"tri_{i}_{th}.png", clip={"x":20,"y":76,"width":1440,"height":900})
        print("errors:",errs); await b.close()
asyncio.run(main())
