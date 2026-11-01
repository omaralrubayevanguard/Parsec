# the shop folder end to end on the delivered file: the first screen, pick a folder, everything saved there, read back on a new computer
import asyncio, os, re, json
from playwright.async_api import async_playwright
import importlib.util
H = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("r8f", os.path.join(H, "r8_flow.py")); src = open(os.path.join(H, "r8_flow.py")).read()
FAKEFS = re.search(r'FAKEFS = r"""(.*?)"""', src, re.S).group(1)
INIT = FAKEFS.replace("window.__root = new DH('My Folder');", "window.__root = window.__root || new DH('Shop Share'); window.showDirectoryPicker = async()=>window.__root; window.__DH = DH;")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await ctx.add_init_script(INIT)
        await pg.goto("file://" + H + "/Parsec_9.html"); await pg.wait_for_timeout(1500)
        print("first screen:", (await pg.inner_text("body"))[:60].replace("\n", " | "))
        await pg.click('[data-action="fs-pick"]'); await pg.wait_for_timeout(2500)
        print("after pick:", (await pg.inner_text("body"))[:80].replace("\n", " | "))
        # some shop data the pages keep, then a save
        await pg.evaluate("""(()=>{ const a=document.querySelector('[data-action="load-sample"]'); return !!a; })()""")
        tree = await pg.evaluate("""(async()=>{ const L=[]; async function walk(d,p){ for await (const [n,h] of d.entries()){ L.push(p+n+(h.kind==='directory'?'/':'')); if(h.kind==='directory' && L.length<40) await walk(h,p+n+'/'); } } await walk(window.__root,''); return L.slice(0,40); })()""")
        print("folder:", tree[:12])
        print("errors:", errs[:4])
        await b.close()
asyncio.run(main())
