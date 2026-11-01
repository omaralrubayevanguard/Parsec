import asyncio, os, sys, json, base64
from playwright.async_api import async_playwright
T = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); h = await (await b.new_context()).new_page()
        await h.goto("file://" + T + "/harness.html")
        du = "data:image/png;base64," + base64.b64encode(open(os.path.join(T, sys.argv[1]), "rb").read()).decode()
        r = await h.evaluate("(src) => { window.__psrDbg = []; return fetch(src).then(r => r.blob()).then(b => PSR.read(b)).then(() => window.__psrDbg); }", du)
        for x in r: print(json.dumps(x))
        await b.close()
asyncio.run(main())
