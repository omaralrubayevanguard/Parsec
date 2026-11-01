# What the folder screen does in each place Parsec can be opened: top level (real picker), inside a sandboxed preview, a stored folder that's gone
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); F = sys.argv[1] if len(sys.argv) > 1 else "Parsec_9.html"
async def body(fr): return (await fr.inner_text("body"))[:400].replace("\n", " | ")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # 1. top level, the real picker (headless can't show it: the browser answers AbortError)
        pg = await b.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + H + "/" + F); await pg.wait_for_timeout(1500)
        print("1 top:", await body(pg))
        await pg.click('[data-action="fs-pick"]'); await pg.wait_for_timeout(1200)
        print("1 after pick:", await body(pg)); print("  errors", errs[:3]); await pg.close()
        # 2. inside a sandboxed preview frame
        for sb in ["allow-scripts", "allow-scripts allow-same-origin", "allow-scripts allow-same-origin allow-popups allow-forms allow-modals"]:
            open(os.path.join(H, "_frame.html"), "w").write(f'<!doctype html><body style="margin:0"><iframe id="f" sandbox="{sb}" src="{F}" style="width:1400px;height:880px;border:0"></iframe></body>')
            pg = await b.new_page(viewport={"width": 1440, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto("file://" + H + "/_frame.html"); await pg.wait_for_timeout(2500)
            fr = pg.frame_locator("#f")
            print(f"2 frame [{sb}]:", (await fr.locator("body").inner_text())[:300].replace("\n", " | "))
            try:
                await fr.locator('[data-action="fs-pick"]').first.click(timeout=3000); await pg.wait_for_timeout(1200)
                print("  after pick:", (await fr.locator("body").inner_text())[:400].replace("\n", " | "))
            except Exception as ex: print("  no pick button:", str(ex).split("\n")[0][:120])
            print("  errors", errs[:3]); await pg.close()
        # 3. a folder picked before that's gone now: requestPermission fails, then the picker
        ctx = await b.new_context(); pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + H + "/" + F); await pg.wait_for_timeout(1500)
        await pg.evaluate("""(()=>{ const F=__tg && __tg.FS ? __tg.FS() : null; return !!F; })()""") if False else None
        print("3 (needs the test hook — see t9)")
        await b.close()
asyncio.run(main())
