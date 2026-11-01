import asyncio, os
from playwright.async_api import async_playwright
T = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(T, "shots"), exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for w, h, tag in [(1440, 900, "d"), (390, 844, "m")]:
            pg = await (await b.new_context(viewport={"width": w, "height": h})).new_page()
            pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
            await pg.route("**/fonts.g*/**", lambda r: r.abort())
            await pg.goto("file://" + T + "/imp.html"); await pg.wait_for_timeout(400)
            await pg.screenshot(path=os.path.join(T, "shots", tag + "_1.png"))
            await pg.screenshot(path=os.path.join(T, "shots", tag + "_1full.png"), full_page=True)
            await pg.click('[data-run="2"]'); await pg.wait_for_timeout(200)
            await pg.screenshot(path=os.path.join(T, "shots", tag + "_2.png"), full_page=True)
            await pg.click('[data-ch="clash"][data-v="ask"]'); await pg.wait_for_timeout(200)
            print(tag, "ask rows:", await pg.evaluate("document.querySelectorAll('[data-ask]').length"), "apply disabled:", await pg.evaluate("!!document.querySelector('[data-x=apply][disabled]')"))
            await pg.click('[data-ask][data-v="asist"]'); await pg.wait_for_timeout(200)
            print(tag, "after pick:", await pg.evaluate("document.querySelector('[data-x=apply]').textContent"))
            await pg.click('[data-x="apply"]'); await pg.wait_for_timeout(200)
            print(tag, "banner:", await pg.evaluate("(document.querySelector('.banner')||{}).textContent"))
            await pg.click('#pk-open'); await pg.wait_for_timeout(200)
            print(tag, "picks:", await pg.evaluate("document.querySelector('#picks pre').textContent"))
            await pg.screenshot(path=os.path.join(T, "shots", tag + "_picks.png"))
            for th in ["graphite", "black"]:
                await pg.keyboard.press('Escape'); await pg.click(f'button[data-th="{th}"]'); await pg.wait_for_timeout(150); await pg.screenshot(path=os.path.join(T, "shots", f"{tag}_{th}.png"))
            print(tag, "hscroll:", await pg.evaluate("document.documentElement.scrollWidth > innerWidth"))
        print("ERR", errs); await b.close()
asyncio.run(main())
