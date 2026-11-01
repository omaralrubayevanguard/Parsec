# Parsec 12 (fork B): the built-in screenshot reader inside the app, with every http(s) request blocked
import asyncio, os, sys, json, time, base64
from playwright.async_api import async_playwright
H = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app"; OCRT = os.path.join(os.path.dirname(H), "build", "ocr", "test"); OUT = os.path.join(H, "shots12ib"); os.makedirs(OUT, exist_ok=True)
def lev(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1): cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]
norm = lambda s: " ".join(s.replace("\t", " ").split())
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # the pictures: the ASIST-like page, two sizes, shot in Chromium
        gen = await (await b.new_context(viewport={"width": 960, "height": 1300}, device_scale_factor=1)).new_page()
        await gen.goto("file://" + OCRT + "/asist.html")
        shots = []
        for fam, size in [("Arial", "13px"), ("Arial", "11px")]:
            await gen.evaluate(f"document.body.style.setProperty('--f', '{fam}'); document.body.style.setProperty('--fs', '{size}')"); await gen.wait_for_timeout(150)
            for cid in ["c1", "c2", "c3", "c4"]:
                f = os.path.join(OUT, f"in_{fam}{size}_{cid}.png"); await (await gen.query_selector("#" + cid)).screenshot(path=f)
                shots.append((fam + size, cid, f, await gen.evaluate(f"document.getElementById('{cid}').innerText")))
            if size == "13px":   # one whole page as one screenshot too
                f = os.path.join(OUT, f"in_{fam}{size}_page.png"); await gen.screenshot(path=f, full_page=True); shots.append((fam + size, "page", f, await gen.evaluate("document.body.innerText")))
        ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); pg.set_default_timeout(15000)
        blocked, errs = [], []
        async def route(r):
            u = r.request.url
            if u.startswith(("file:", "blob:", "data:")): await r.continue_()
            else: blocked.append(u); await r.abort()
        await ctx.route("**/*", route)
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.goto("file://" + H + "/t12_bb.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()")
        tot_e = tot_n = 0
        for tag, cid, f, truth in shots:
            du = "data:image/png;base64," + base64.b64encode(open(f, "rb").read()).decode()
            t0 = time.time()
            txt = await pg.evaluate("(src) => fetch(src).then(r => r.blob()).then(b => __tg.ocrImages([new File([b], 'shot.png', { type: 'image/png' })])).then(t => __tg.cleanOcrText(t), e => 'ERR ' + (e && e.message))", du)
            dt = time.time() - t0
            a, c = norm(truth), norm(txt); e = lev(a, c); tot_e += e; tot_n += len(a)
            print(f"{tag} {cid}: CER {e / max(1, len(a)):.3f} · {dt:.1f}s · {len(a)} chars")
            if cid in ("c1", "page") or e / max(1, len(a)) > 0.06: print("   " + txt.replace("\n", "\n   ")[:1600])
        print("ALL CER %.4f" % (tot_e / max(1, tot_n)))
        # the New RO dialog's Screenshot button: read, then the fields fill in
        await pg.evaluate("(()=>{ const U = __tg.UI(); U.modal = { type: 'add-ro' }; __tg.render(); })()"); await pg.wait_for_timeout(400)
        inp = await pg.query_selector("#imp-img")
        print("New RO dialog:", bool(inp))
        if inp:
            t0 = time.time()
            await inp.set_input_files([shots[0][2], shots[1][2]])
            for _ in range(80):
                st = await pg.evaluate("(document.getElementById('imp-status')||{}).textContent || ''")
                if any(k in st for k in ("filled", "Nothing", "Couldn")) : break
                await pg.wait_for_timeout(250)
            print("status:", st, f"({time.time() - t0:.1f}s)")
            print("fields:", await pg.evaluate("['f-ro','f-case','f-vin','f-cust','f-miles','f-unit','f-tag','f-model','f-year'].map(id => id + '=' + ((document.getElementById(id)||{}).value||'')).join(' · ')"))
            await pg.screenshot(path=os.path.join(OUT, "newro.png"))
        print("blocked requests:", len(blocked), blocked[:5])
        print("ERRORS", errs[:8])
        await b.close()
asyncio.run(main())
