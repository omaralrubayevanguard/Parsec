import asyncio, os, datetime, json, re
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/t6.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.sample()"); await pg.evaluate("__tg.applyTheme('ivl')")
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='ros'; __tg.render();})()"); await pg.wait_for_timeout(500)
        css = await pg.evaluate("[...document.querySelector('.jc-host').shadowRoot.querySelectorAll('style')].map(s=>s.textContent).join('\\n')")
        c = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
        for m in re.finditer(r'([^{}]+)\{([^{}]*)\}', c):
            if re.search(r'\d+d?vh', m.group(2)):
                print(' '.join(m.group(1).split())[-130:], '=>', re.findall(r'[\w-]+\s*:[^;]*\d+d?vh[^;]*', m.group(2)))
        await b.close()
asyncio.run(main())
