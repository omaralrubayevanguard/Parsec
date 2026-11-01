import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(H, "shots")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1500, "height": 1000})
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/rp2.html"); await pg.wait_for_timeout(400)
        await pg.evaluate("document.querySelector('.chs').scrollTop = document.querySelector('.imap').closest('.ch').offsetTop - 80"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(S, "12_imap.png"), clip={"x": 1170, "y": 60, "width": 330, "height": 700})
        await pg.click('[data-x="mini"]'); await pg.wait_for_timeout(200)
        await pg.evaluate("window.scrollTo(0, 400)"); await pg.wait_for_timeout(100)
        await pg.screenshot(path=os.path.join(S, "13_mini.png"), clip={"x": 0, "y": 300, "width": 400, "height": 700})
        print(await pg.evaluate("document.querySelectorAll('.sb.mini .thm button').length"))
        await b.close()
asyncio.run(main())
