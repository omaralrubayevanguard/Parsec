import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1500, "height": 950}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        await pg.goto("file://" + H + "/out.html"); await pg.wait_for_timeout(800)
        await pg.screenshot(path=H + "/s1_overview.png")
        await pg.evaluate("(()=>{ const c=[...document.querySelectorAll('.card')].find(x=>x.innerText.startsWith('RO page')); c && c.click(); })()"); await pg.wait_for_timeout(500)
        await pg.hover(".co[data-j='4']"); await pg.mouse.move(700, 400); await pg.wait_for_timeout(300)
        await pg.screenshot(path=H + "/s2_ro.png")
        await pg.keyboard.press("/"); await pg.keyboard.type("parts"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=H + "/s3_search.png")
        await pg.keyboard.press("Escape"); await pg.click("[data-th-b=graphite]"); await pg.evaluate("(()=>{ const c=[...document.querySelectorAll('.nav .pg')].find(x=>x.innerText.startsWith('Triage')); c && c.click(); })()"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=H + "/s4_dark.png")
        print("ERRORS", errs)
        await b.close()
asyncio.run(main())
