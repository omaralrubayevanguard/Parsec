import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(H, "shots")
W = int(sys.argv[1]) if len(sys.argv) > 1 else 1500
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": W, "height": 1000}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/clk2.html"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=os.path.join(S, f"a{W}_load.png"), full_page=True)
        print("ERRORS", errs); await b.close()
asyncio.run(main())
