import asyncio, sys, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append("C:"+m.text[:200]) if m.type=="error" and "net::" not in m.text and "Failed to load" not in m.text else None)
        await pg.goto("file://" + H + "/" + (sys.argv[1] if len(sys.argv)>1 else "t9.html")); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()")
        print(await pg.evaluate("__tg.staffList().map(s=>s.name+':'+s.role).join(', ')"))
        for js in sys.argv[2:]:
            try: print(await pg.evaluate(js))
            except Exception as e: print("ERR", str(e)[:300])
            await pg.wait_for_timeout(500)
        print("errors", errs[:6]); await b.close()
asyncio.run(main())
