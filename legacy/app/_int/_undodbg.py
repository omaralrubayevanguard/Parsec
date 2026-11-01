import asyncio
from playwright.async_api import async_playwright
H = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1000)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(1500)
        print(await pg.evaluate("(()=>{ const L=__tg.STATE().ros; const r=L.find(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length>1); return [L.length, r && r.id, r && !!__tg.getRO(r.id), typeof __tg.getRO]; })()"))
        print(errs[:3]); await b.close()
asyncio.run(main())
