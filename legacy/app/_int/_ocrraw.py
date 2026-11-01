import asyncio, os, sys, base64
from playwright.async_api import async_playwright
H = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app"; T = H + "/../build/ocr/test"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context()).new_page()
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1000)
        for c in sys.argv[2:]:
            d = base64.b64encode(open(f"{T}/shot_{sys.argv[1]}_{c}.png", "rb").read()).decode()
            t = await pg.evaluate("""(b => { const s = atob(b), a = new Uint8Array(s.length); for(let k = 0; k < s.length; k++) a[k] = s.charCodeAt(k); return __tg.ocrImages([new File([a], 'x.png', { type: 'image/png' })], 6).then(t => __tg.cleanOcrText(t)); })""", d)
            print("----", c); print(t)
        await b.close()
asyncio.run(main())
