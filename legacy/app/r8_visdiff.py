# Same seed, same clock, same sample: Parsec_7 vs Parsec_8, page by page — what changed in the panel?
import asyncio, os, sys, datetime
from playwright.async_api import async_playwright
from PIL import Image, ImageChops
import numpy as np
H = os.path.dirname(os.path.abspath(__file__))
SH = os.path.join(H, "shots8d"); os.makedirs(SH, exist_ok=True)
SEED = """(()=>{ let s=123456789; Math.random=function(){ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return (s%1000000)/1000000; }; })();"""
VIEWS = [("console", ""), ("rolist", ""), ("ros", "pick"), ("triage", "inbox"), ("triage", "desk"), ("triage", "yard"), ("foreman", ""), ("warranty", ""), ("manager", ""), ("parts", ""), ("timelog", ""), ("fixes", ""), ("career", "")]

STATEJSON = {}
async def snap(p, file, theme, size="normal"):
    b = await p.chromium.launch(); W = 1920 if size == "floor" else 1440
    ctx = await b.new_context(viewport={"width": W, "height": 900}); pg = await ctx.new_page()
    await pg.add_init_script(SEED)
    if STATEJSON.get("s"):
        import json as _j
        await pg.add_init_script("try{ if(!sessionStorage.getItem('seeded')){ localStorage.setItem('tec_state_v1', " + _j.dumps(STATEJSON["s"]) + "); sessionStorage.setItem('seeded','1'); } }catch(e){}")
    await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto("file://" + H + "/" + file); await pg.wait_for_timeout(1200)
    await pg.evaluate(f"__tg.applyTheme('{theme}')")
    if not STATEJSON.get("s"):
        await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(800)
        STATEJSON["s"] = await pg.evaluate("JSON.stringify(__tg.S())")
    await pg.wait_for_timeout(300)
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.size='{size}'; U.toast=null; __tg.render(); }})()")
    out = {}
    for v, sub in VIEWS:
        js = f"(()=>{{ const U=__tg.UI(); U.view='{v}'; U.modal=null; U.toast=null; U.notifOpen=false;"
        if v == "triage": js += f" U.tgView='{sub}'; U.tgSel=null;"
        if sub == "pick": js += " const r=__tg.S().ros.find(x=>!x.shop && x.id!=='ro_shop' && x.operations && x.operations.length>1); U.selectedRo=r && r.id;"
        js += " __tg.render(); window.scrollTo(0,0); })()"
        await pg.evaluate(js); await pg.wait_for_timeout(500)
        await pg.mouse.move(1430, 890)
        name = f"{v}{('_' + sub) if sub else ''}"
        path = f"{SH}/{file[:2]}_{theme}_{size}_{name}.png"
        await pg.screenshot(path=path, clip={"x": round(236 * {'large':1.15,'floor':1.35}.get(size,1)) + 2, "y": 0, "width": W - round(236 * {'large':1.15,'floor':1.35}.get(size,1)) + 2, "height": 900})
        out[name] = path
    await b.close()
    return out, errs

async def main():
    async with async_playwright() as p:
        SZ = sys.argv[1] if len(sys.argv) > 1 else "normal"
        await snap(p, "t7.html", "ivl", SZ)
        for theme in ("ivl", "ivd"):
            a, ea = await snap(p, "t7.html", theme, SZ); b, eb = await snap(p, "t8.html", theme, SZ)
            print("theme", theme, "errors 7:", ea[:2], "8:", eb[:2])
            for k in a:
                A = Image.open(a[k]).convert("RGB"); B = Image.open(b[k]).convert("RGB")
                if A.size != B.size: print(k, "size", A.size, B.size); continue
                d = np.asarray(ImageChops.difference(A, B)).sum(axis=2) > 24
                pct = d.mean() * 100
                if pct > 0.05:
                    ys, xs = np.where(d)
                    box = (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))
                    diff = Image.fromarray((d * 255).astype("uint8")); diff.save(f"{SH}/diff_{theme}_{SZ}_{k}.png")
                else: box = None
                print(f"  {k:16s} {pct:6.2f}%  {box}")

asyncio.run(main())
