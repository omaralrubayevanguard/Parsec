import asyncio
from playwright.async_api import async_playwright
APP = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/t12.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1440, "height": 1000})
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + APP); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        for v in ["warranty", "parts", "foreman"]:
            await pg.evaluate(f"__tg.PG && __tg.PG.go ? __tg.PG.go('{v}') : (__tg.UI().view='{v}', __tg.render())"); await pg.wait_for_timeout(1200)
            await pg.screenshot(path=f"shots/look_{v}.png")
        await b.close()
asyncio.run(main())
