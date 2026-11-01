import os, re, sys, asyncio, glob
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
tok = open(f"{B}/ds/tokens.local.css").read(); bun = open(f"{B}/ds/project/components/bundle.css").read()
only = sys.argv[1:] 
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for f in sorted(glob.glob(f"{B}/ds/project/components/*/preview.html")):
            name = f.split("/")[-2]
            if only and name not in only: continue
            src = open(f).read()
            m = re.search(r'height=(\d+)', src); h = int(m.group(1)) if m else 120
            w = int(re.search(r'width=(\d+)', src.split("\n")[0]).group(1)) if 'width=' in src.split("\n")[0] else 960
            for th in ("light","dark"):
                html = src.replace("<html lang=\"en\">", f"<html lang=\"en\" data-theme=\"{th}\">").replace("<head>", f"<head><style>{tok}\n{bun}</style>")
                pg = await b.new_page(viewport={"width": w, "height": h})
                errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.set_content(html, wait_until="load"); await pg.wait_for_timeout(250)
                sh = await pg.evaluate("document.documentElement.scrollHeight")
                await pg.screenshot(path=f"{B}/shots/{name}-{th}.png", full_page=True)
                print(name, th, "h", h, "content", sh, "errs", errs)
                await pg.close()
        await b.close()
os.makedirs(f"{B}/shots", exist_ok=True)
asyncio.run(main())
