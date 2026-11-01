import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots123"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
fails = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: fails.append(m)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1440, "height": 900}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        # the theme strip
        n = await pg.evaluate("document.querySelectorAll('.px-rail .pxr-thm button').length"); ok(n == 4, f"theme strip has {n} swatches")
        await pg.click('.px-rail .pxr-thm button[data-theme="vvl"]'); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("document.documentElement.getAttribute('data-pal') === 'vv' && document.documentElement.getAttribute('data-theme') === 'ivl'"), "White from the strip")
        ok(await pg.evaluate("document.querySelector('.px-rail .pxr-thm button[data-theme=\"vvl\"]').getAttribute('aria-pressed') === 'true'"), "White shows pressed")
        await pg.screenshot(path=os.path.join(OUT, "a1_strip.png"), clip={"x": 0, "y": 500, "width": 260, "height": 400})
        await pg.click('.px-rail .pxr-thm button[data-theme="ivl"]'); await pg.wait_for_timeout(200)
        await pg.click('[data-action="px-side"] >> nth=0'); await pg.wait_for_timeout(400)
        n1 = await pg.evaluate("document.querySelectorAll('.px-rail .pxr-thm button').length"); ok(n1 == 1, f"folded: {n1} swatch")
        await pg.click('.px-rail .pxr-thm button'); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("document.documentElement.getAttribute('data-theme') === 'ivd'"), "folded swatch moves to Graphite")
        await pg.screenshot(path=os.path.join(OUT, "a2_folded.png"), clip={"x": 0, "y": 500, "width": 120, "height": 400})
        await pg.click('[data-action="px-side"] >> nth=0'); await pg.wait_for_timeout(300)
        await pg.click('.px-rail .pxr-thm button[data-theme="ivl"]'); await pg.wait_for_timeout(200)
        # the me menu has no Theme row now
        await pg.evaluate("(()=>{ const b=document.querySelector('[data-px-anchor=\"me\"], .pxr-me'); b && b.click(); })()"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("!/Theme/.test((document.querySelector('.pxr-pop')||{}).innerText||'')"), "your menu has no Theme row")
        await pg.keyboard.press("Escape")
        # sample trucks
        S = await pg.evaluate("__tg.STATE().ros.filter(r=>r.sample).map(r=>({y:r.year,mk:r.make,m:r.model,a:r.axles,c:r.cab,s:r.sleeper,e:r.engineType,line:__tg.truckLine(r),pk:__tg.trkPick(r).kind}))")
        print("samples:", len(S)); [print("   ", x["line"], "|", x["e"], "|", x["pk"]) for x in S[:8]]
        ok(all(x["y"] and x["mk"] == "Volvo" and x["m"] and x["a"] and x["c"] for x in S), "every sample has year, make, model, axles, cab")
        ok(all((x["c"] == "Day cab") == (not x["s"]) for x in S), "sleepers have a length, day cabs don't")
        ok(all(x["pk"] == "model" for x in S), "every sample has its truck picture")
        # the RO page and the Technician page
        rid = await pg.evaluate("(()=>{ const L=__tg.STATE().ros.filter(r=>r.sample && !r.dateClosed); L.sort((a,b)=>b.operations.length-a.operations.length); return L[0].id; })()")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(1400)
        await pg.screenshot(path=os.path.join(OUT, "b1_ro.png"))
        band = await pg.evaluate(f"(()=>{{ const R={SR}; return R ? (R.textContent || '') : ''; }})()")
        line = await pg.evaluate(f"__tg.truckLine(__tg.getRO('{rid}'))"); ok(line.split(' · ')[0] in band, "RO page shows the truck line " + line)
        await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(700)
        await pg.screenshot(path=os.path.join(OUT, "b2_tech.png"))
        print("ERRORS", errs[:6]); ok(not errs, "no console errors")
        print("FAILS", len(fails), fails); await b.close()
asyncio.run(main())
