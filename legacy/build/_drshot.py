import asyncio, sys
from playwright.async_api import async_playwright
F = sys.argv[1]; steps = sys.argv[2:]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1480,"height":1000})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
        await pg.goto("file://"+F); await pg.wait_for_timeout(600)
        for st in steps:
            k,_,v = st.partition(":")
            if k=="click": await pg.click(v); await pg.wait_for_timeout(250)
            elif k=="key": await pg.keyboard.press(v); await pg.wait_for_timeout(200)
            elif k=="scroll": await pg.evaluate(f"document.querySelector('.dr-cv').scrollTop={v}"); await pg.wait_for_timeout(150)
            elif k=="js": print(await pg.evaluate(v))
            elif k=="shot": await (await pg.query_selector(".wt-wrap")).screenshot(path=v+".png"); print("shot",v)
        print("errors:", errs)
        await b.close()
asyncio.run(main())
