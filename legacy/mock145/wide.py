import asyncio
from playwright.async_api import async_playwright
F = "/mnt/user-data/outputs/Parsec Time Log fixes ideas mock-up.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 390, "height": 800})
        await pg.goto("file://" + F); await pg.wait_for_timeout(400)
        r = await pg.evaluate("""() => { const W = innerWidth, out = [];
          document.querySelectorAll('body *').forEach(el => { const b = el.getBoundingClientRect(); if (b.right > W + 1 && b.width) out.push(el.tagName + '.' + el.className + ' ' + Math.round(b.right)); });
          return out.slice(0, 15); }""")
        print("\n".join(r)); await b.close()
asyncio.run(main())
