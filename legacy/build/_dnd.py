import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1480,"height":1000})
        await pg.goto("file:///mnt/user-data/outputs/Parsec%20Triage%20yard.html"); await pg.wait_for_timeout(400)
        await pg.click("[data-demo=drag]"); await pg.wait_for_timeout(200)
        await pg.drag_and_drop(".i3-it[data-sel='37516']", ".yd [data-drop='E3']"); await pg.wait_for_timeout(300)
        print("list->E3:",await pg.evaluate("ROS.find(r=>r.no==='37516').spot"))
        await pg.drag_and_drop(".yd [data-drag='37628']", ".yd [data-drop='E5']"); await pg.wait_for_timeout(300)
        print("tile->E5:",await pg.evaluate("ROS.find(r=>r.no==='37628').spot"))
        await b.close()
asyncio.run(main())
