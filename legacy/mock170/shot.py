import asyncio, os, json, sys
from playwright.async_api import async_playwright
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); F = "file://" + H + "/out.html"
ONLY = sys.argv[1].split(',') if len(sys.argv) > 1 else None
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1500, "height": 950}, device_scale_factor=1); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        await pg.goto(F); await pg.wait_for_timeout(500)
        # behaviour: nothing plays until a pick
        st0 = await pg.evaluate("[...document.querySelectorAll('.ip-vis')].map(v=>v.dataset.step).join(',')")
        await pg.wait_for_timeout(1500)
        st1 = await pg.evaluate("[...document.querySelectorAll('.ip-vis')].map(v=>v.dataset.step).join(',')")
        print("still before a pick:", st0 == st1, "| replay hidden:", await pg.evaluate("getComputedStyle(document.querySelector('.ip-replay')).display"))
        await pg.click(".ip-idea[data-k=look] .ip-opt[data-v=arrow]"); await pg.wait_for_timeout(300)
        print("after pick step:", await pg.evaluate("document.querySelector('.ip-idea[data-k=look] .ip-vis').dataset.step"), "opt:", await pg.evaluate("document.querySelector('.ip-idea[data-k=look] .ip-vis').dataset.opt"))
        await pg.wait_for_timeout(3600)
        print("ends and holds:", await pg.evaluate("document.querySelector('.ip-idea[data-k=look] .ip-vis').dataset.step"), "| replay:", await pg.evaluate("getComputedStyle(document.querySelector('.ip-idea[data-k=look] .ip-replay')).display"))
        await pg.click(".ip-idea[data-k=look] .ip-opt[data-v=arrow]"); await pg.wait_for_timeout(200)
        print("unpick → idle:", await pg.evaluate("document.querySelector('.ip-idea[data-k=look] .ip-vis').dataset.step"))
        await pg.evaluate("localStorage.clear()")
        await pg.screenshot(path=H + "/full_light.png", full_page=True)
        ks = await pg.evaluate("IDEAS.flatMap(g=>g.items.map(it=>[it.k, it.steps.map(s=>s[0]), it.opts.map(o=>o[0])]))")
        for suf in ["", "_d", "_p"]:
            if suf == "_d":
                await pg.click(".ip-seg button[data-th=dark]"); await pg.wait_for_timeout(300)
            if suf == "_p":
                await pg.screenshot(path=H + "/full_dark.png", full_page=True)
                await pg.click(".ip-seg button[data-th=light]"); await pg.set_viewport_size({"width": 390, "height": 840}); await pg.wait_for_timeout(400)
            for k, steps, opts in ks:
                if ONLY and k not in ONLY: continue
                ims = []
                # every step of the first option, then the end state of the others
                plan = [(opts[0], i) for i in range(len(steps))] + [(o, len(steps) - 1) for o in opts[1:]]
                for o, i in plan:
                    await pg.evaluate(f"(()=>{{ const v=document.querySelector('.ip-idea[data-k={k}] .ip-vis'), it=find('{k}'); setOpt(v,'{o}'); clearTimeout(v._t); mark(v,it,{i}); }})()")
                    await pg.wait_for_timeout(650)
                    el = await pg.query_selector(f".ip-idea[data-k={k}] .ip-vis"); await el.scroll_into_view_if_needed()
                    fn = H + f"/st_{k}_{o}_{steps[i]}{suf}.png"; await el.screenshot(path=fn); ims.append(Image.open(fn))
                w = sum(i.width for i in ims) + 6 * len(ims); h = max(i.height for i in ims)
                c = Image.new("RGB", (w, h), "white"); x = 0
                for i in ims: c.paste(i, (x, 0)); x += i.width + 6
                c.save(H + f"/strip_{k}{suf}.png")
        print("phone scrollW", await pg.evaluate("document.documentElement.scrollWidth"))
        print("errors", errs)
        await b.close()
asyncio.run(main())
