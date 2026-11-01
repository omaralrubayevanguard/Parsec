import asyncio
from playwright.async_api import async_playwright
DESK = "/root/.claude/uploads/febe01e4-e12e-554d-9dc2-ccfd769708e9/f9ddcf70-Parsec.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); d = await (await b.new_context(viewport={"width":1440,"height":900})).new_page()
        errs=[]; d.on("pageerror", lambda e: errs.append(str(e)[:300])); d.on("console", lambda m: errs.append(m.type+": "+m.text[:200]) if m.type=="error" else None)
        await d.goto("file://"+DESK); await d.wait_for_timeout(3000)
        print(await d.evaluate("[typeof STATE, typeof render, typeof TQ, typeof mobBundle, typeof qrcode, typeof jsQR, document.scripts.length, [...document.scripts].map(s=>s.id+':'+(s.type||'js')+':'+s.text.length).join(' | ')]"))
        print(errs[:10]); await d.screenshot(path="desk.png"); await b.close()
asyncio.run(main())
