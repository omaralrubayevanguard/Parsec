import asyncio, os, sys, json, base64
from playwright.async_api import async_playwright
T = os.path.dirname(os.path.abspath(__file__))
async def main():
    shot, pat = sys.argv[1], sys.argv[2]
    async with async_playwright() as p:
        b = await p.chromium.launch(); h = await (await b.new_context()).new_page()
        await h.goto("file://" + T + "/harness.html")
        du = "data:image/png;base64," + base64.b64encode(open(os.path.join(T, shot), "rb").read()).decode()
        r = await h.evaluate("(src) => fetch(src).then(r => r.blob()).then(b => PSR.read(b, {debug: true}))", du)
        for R in r["dbg"]:
            if pat in R["t"] or pat == "*": print(json.dumps({"t": R["t"], "m": R["m"], "font": R["font"]})); print(R["g"])
        await b.close()
asyncio.run(main())
