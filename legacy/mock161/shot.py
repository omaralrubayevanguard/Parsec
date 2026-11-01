import asyncio, os, json
from playwright.async_api import async_playwright
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); F = "file://" + H + "/out.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1500, "height": 950}, device_scale_factor=1); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        await pg.goto(F); await pg.wait_for_timeout(600)
        await pg.screenshot(path=H + "/full_light.png", full_page=True)
        ks = await pg.evaluate("IDEAS.flatMap(g=>g.items.map(it=>[it.k, it.steps.map(s=>s[0])]))")
        await pg.evaluate("document.querySelectorAll('.ip-vis').forEach(v=>{ clearTimeout(v._t); }); window.play=function(){};")
        for suf in ["", "_d", "_p"]:
            if suf == "_d":
                await pg.click(".ip-seg button[data-th=dark]"); await pg.wait_for_timeout(300)
            if suf == "_p":
                await pg.screenshot(path=H + "/full_dark.png", full_page=True)
                await pg.click(".ip-seg button[data-th=light]"); await pg.set_viewport_size({"width": 390, "height": 840}); await pg.wait_for_timeout(400)
            for k, steps in ks:
                ims = []
                for s in steps:
                    await pg.evaluate(f"(()=>{{ const v=document.querySelector('.ip-idea[data-k={k}] .ip-vis'); clearTimeout(v._t); v.dataset.step={json.dumps(s)}; }})()")
                    await pg.wait_for_timeout(420)
                    el = await pg.query_selector(f".ip-idea[data-k={k}] .ip-vis"); await el.scroll_into_view_if_needed()
                    fn = H + f"/st_{k}_{s}{suf}.png"; await el.screenshot(path=fn); ims.append(Image.open(fn))
                w = sum(i.width for i in ims) + 6 * len(ims); h = max(i.height for i in ims)
                c = Image.new("RGB", (w, h), "white"); x = 0
                for i in ims: c.paste(i, (x, 0)); x += i.width + 6
                c.save(H + f"/strip_{k}{suf}.png")
        await pg.set_viewport_size({"width": 390, "height": 840}); await pg.wait_for_timeout(300)
        print("phone scrollW", await pg.evaluate("document.documentElement.scrollWidth"))
        await pg.screenshot(path=H + "/phone.png", full_page=False)
        print("errors", errs)
        await b.close()
asyncio.run(main())
