import asyncio, os, json
from playwright.async_api import async_playwright
from _t12d import openro, J, OUT
async def main():
    async with async_playwright() as p:
        import sys
        W, Hh, dev = (int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]) if len(sys.argv) > 3 else (860, 900, 'desktop')
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": W, "height": Hh}, has_touch=dev != 'desktop')
        await ctx.add_init_script("try{ localStorage.setItem('tec_device','" + dev + "'); }catch(e){}")
        pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.dirname(os.path.abspath(__file__)) + "/" + os.environ.get("TF", "t12d.html")); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        tag = dev + str(W)
        rid = await pg.evaluate("(()=>{ const L=__tg.STATE().ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length>1); return L[0].id; })()")
        await openro(pg, rid)
        info = await pg.evaluate(J("const h=document.querySelector('.jc-host:not(.jc-band-host)'); const pro=R.querySelector('.rop-ro'); const rail=R.querySelector('.rop-rail'); const q=s=>{ const e=R.querySelector(s); return e ? [Math.round(e.getBoundingClientRect().top), getComputedStyle(e).order] : null; }; return { host: h.clientWidth, dir: pro && getComputedStyle(pro).flexDirection, disp: pro && getComputedStyle(pro).display, rail: rail && getComputedStyle(rail).display, top: q('.rop-top'), main: q('.rop-col'), props: q('.rop-rail .px-props'), hs: document.documentElement.scrollWidth > innerWidth };"))
        print(tag, "layout:", json.dumps(info))
        await pg.screenshot(path=os.path.join(OUT, "d12_" + tag + "_top.png"))
        await pg.evaluate(J("const s=R.querySelector('.px-ro'); if(s) s.scrollTop=900; const m=R.querySelector('.px-ro__main'); if(m) m.scrollTop=900;")); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "d12_" + tag + "_mid.png"))
        # pick two ops: the bar shows
        await pg.evaluate(J("const bs=[...R.querySelectorAll('.px-row[data-op] .rop-cb')]; bs.slice(0,2).forEach(x=>x.click());")); await pg.wait_for_timeout(400)
        print("bar:", await pg.evaluate(J("const b=R.querySelector('.rop-sb'); return b ? b.textContent.slice(0,80) : null")))
        await pg.screenshot(path=os.path.join(OUT, "d12_" + tag + "_pick.png"))
        print("errors:", errs)
        await b.close()
asyncio.run(main())
