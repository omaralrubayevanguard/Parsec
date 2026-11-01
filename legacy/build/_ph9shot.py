import asyncio, sys, os
from playwright.async_api import async_playwright
F = sys.argv[1]; OUTD = sys.argv[2]; steps = sys.argv[3:]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1400,"height":1000})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type=="error" and "net::" not in m.text and "Failed to load" not in m.text else None)
        await pg.goto("file://"+F); await pg.wait_for_timeout(700)
        for st in steps:
            k,_,v = st.partition(":")
            if k=="click": await pg.click(v); await pg.wait_for_timeout(300)
            elif k=="js": print(await pg.evaluate(v))
            elif k=="wait": await pg.wait_for_timeout(int(v))
            elif k=="phones":
                for i,f in enumerate(await pg.query_selector_all(".ph-fig")):
                    await f.screenshot(path=f"{OUTD}/{v}_{i+1}.png")
            elif k=="one":
                n, name = v.split(",")
                await (await pg.query_selector_all(".ph-fig"))[int(n)-1].screenshot(path=f"{OUTD}/{name}.png")
            elif k=="full": await pg.screenshot(path=f"{OUTD}/{v}.png", full_page=True)
        print("errors:", errs)
        await b.close()
asyncio.run(main())
