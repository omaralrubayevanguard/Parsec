import asyncio, os, sys, json, time
from playwright.async_api import async_playwright
T = os.path.dirname(os.path.abspath(__file__))
def lev(a, b):
    import difflib
    if not a and not b: return 0
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]
def norm(s): return " ".join(s.replace("\t", " ").split())
async def main():
    fonts = sys.argv[1:] or ["Arial"]
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for font in fonts:
            fam, _, size = font.partition("@"); size = size or "13px"
            pg = await (await b.new_context(viewport={"width": 960, "height": 1200}, device_scale_factor=1)).new_page()
            await pg.goto("file://" + T + "/asist.html"); await pg.evaluate(f"document.body.style.setProperty('--f', '{fam}'); document.body.style.setProperty('--fs', '{size}')"); await pg.wait_for_timeout(200)
            tot_e = tot_n = 0
            for cid in ["c1", "c2", "c3", "c4"]:
                el = await pg.query_selector("#" + cid); shot = os.path.join(T, f"shot_{fam.replace(' ','')}{size}_{cid}.png"); await el.screenshot(path=shot)
                truth = await pg.evaluate(f"document.getElementById('{cid}').innerText")
                h = await (await b.new_context()).new_page(); errs = []
                h.on("pageerror", lambda e: errs.append(str(e)))
                await h.goto("file://" + T + "/harness.html")
                t0 = time.time()
                import base64
                du = "data:image/png;base64," + base64.b64encode(open(shot, "rb").read()).decode()
                res = await h.evaluate("""(src) => fetch(src).then(r => r.blob()).then(b => PSR.read(b)).then(r => r, e => ({text: 'ERR ' + e.stack}))""", du)
                dt = time.time() - t0
                a, bb = norm(truth), norm(res["text"]); e = lev(a, bb); tot_e += e; tot_n += len(a)
                if "-v" in os.environ.get("V", "") or e / max(1, len(a)) > 0.02:
                    print("----", fam, size, cid, "CER %.3f" % (e / max(1, len(a))), "%.1fs" % dt, errs[:2]); print(res["text"])
                await h.close()
            print("==", fam, size, "CER %.4f" % (tot_e / max(1, tot_n)))
        await b.close()
asyncio.run(main())
