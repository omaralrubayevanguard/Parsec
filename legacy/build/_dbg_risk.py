import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + B + "/fmf_test.html"); await pg.wait_for_timeout(600)
        await pg.click("[data-demo='risk']"); await pg.wait_for_timeout(200)
        print(await pg.evaluate("JSON.stringify(__fm.U().pop)"))
        await pg.keyboard.press("2"); await pg.wait_for_timeout(200)
        print(await pg.evaluate("JSON.stringify(__fm.U().pop)"), await pg.evaluate("document.activeElement.outerHTML.slice(0,80)"))
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200)
        print(await pg.evaluate("JSON.stringify(__fm.U().pop)"), await pg.evaluate("(()=>{const r=__fm.S().R.find(r=>r.no==='37150');return [r.helper,r.riskOk]})()"), errs)
        await b.close()
asyncio.run(main())
