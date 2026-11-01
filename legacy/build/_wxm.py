import asyncio, os, sys, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page()
        await pg.goto("file://" + os.path.abspath("wx/w1.html")); await pg.wait_for_timeout(800)
        r = await pg.evaluate("""(()=>{ const q=s=>[...document.querySelectorAll(s)].slice(0,4).map(e=>{const b=e.getBoundingClientRect(); return [s, Math.round(b.x), Math.round(b.width), e.scrollWidth, getComputedStyle(e).paddingLeft]}); return [q('.wx-op'), q('.wx-opb'), q('.wx-opb > div'), q('.wx-acts'), q('.wx-acts .btn'), q('.wx-grid')]; })()""")
        for x in r: print(x)
        await b.close()
asyncio.run(main())
