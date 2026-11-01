import asyncio, os, sys, json, base64, time
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(os.path.dirname(H), "build", "ocr", "test"); OUT = os.path.join(H, "shots12"); os.makedirs(OUT, exist_ok=True)
FONT = sys.argv[1] if len(sys.argv) > 1 else "Arial13px"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []; net = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        async def route(r):
            u = r.request.url
            if u.startswith(("file:", "data:", "blob:")): await r.continue_()
            else: net.append(u[:80]); await r.abort()
        await pg.route("**/*", route)
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        shots = [base64.b64encode(open(os.path.join(T, f"shot_{FONT}_c{i}.png"), "rb").read()).decode() for i in (1, 2, 3, 4)]
        await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(300)
        t0 = time.time()
        await pg.evaluate("""(L => { const fs = L.map((b, i) => { const s = atob(b), a = new Uint8Array(s.length); for(let k = 0; k < s.length; k++) a[k] = s.charCodeAt(k); return new File([a], 'shot' + (i + 1) + '.png', { type: 'image/png' }); }); __tg.IMPX.read(fs); })""", shots)
        for _ in range(120):
            await pg.wait_for_timeout(500)
            busy = await pg.evaluate("(() => { const D = __tg.IMPX.state(); return D ? D.busy : 'closed'; })()")
            if not busy: break
        print("read in %.1fs" % (time.time() - t0))
        st = await pg.evaluate("""(() => { const D = __tg.IMPX.state(); return { pieces: D.pieces.map(p => p.name + ': ' + p.what), msg: D.msg || '', c: __tg.IMPX.counts() }; })()""")
        print(json.dumps(st, indent=1)[:1500])
        rows = await pg.evaluate("""(() => [...document.querySelectorAll('#imp-dlg .ix-fr')].filter(r => !/\\bnone\\b/.test(r.className)).map(r => r.querySelector('.ix-fl').textContent + ' = ' + ((r.querySelector('input,select,textarea')||{}).value || (r.querySelector('.ix-fv')||r).textContent.trim()).slice(0, 60)).join('\\n'))()""")
        print(rows)
        ops = await pg.evaluate("(() => [...document.querySelectorAll('#imp-dlg .ix-op')].map(o => o.innerText.replace(/\\s+/g, ' ').slice(0, 200)).join('\\n'))()")
        print("OPS:\n" + ops)
        await pg.screenshot(path=os.path.join(OUT, "ocr_" + FONT + ".png"))
        print("network tried:", net[:5]); print("ERRORS", errs[:5])
        await b.close()
asyncio.run(main())
