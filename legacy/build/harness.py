import sys, os, asyncio
sys.path.insert(0, os.path.dirname(__file__))
import parts
B = os.path.dirname(os.path.abspath(__file__))
def page(body, theme="light", extra_css=""):
    tok = open(f"{B}/ds/tokens.local.css").read()
    bun = open(f"{B}/ds/project/components/bundle.css").read()
    return f'<!doctype html><html data-theme="{theme}"><head><meta charset="utf-8"><style>{tok}\n{bun}\nhtml,body{{height:100%}}{extra_css}</style></head><body>{body}</body></html>'
async def shoot(html, out, w=1440, h=900, full=False):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
        await pg.set_content(html, wait_until="load")
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=out, full_page=full)
        await b.close()
if __name__ == "__main__":
    for th in ("light","dark"):
        html = page(parts.ro_page(wt=False), th)
        asyncio.run(shoot(html, f"{B}/shot-ro-{th}.png"))
    print("done")
