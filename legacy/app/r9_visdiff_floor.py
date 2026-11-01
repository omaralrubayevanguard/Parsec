# Same seed, same clock, same data: two builds page by page — did anything on screen change?
#   python3 r9_visdiff.py t9_base.html t9.html
import asyncio, os, sys, datetime, json
from playwright.async_api import async_playwright
from PIL import Image, ImageChops
import numpy as np
H = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(H, "shots9f"); os.makedirs(SH, exist_ok=True)
A, B = sys.argv[1], sys.argv[2]
SEED = """(()=>{ let s=123456789; Math.random=function(){ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return (s%1000000)/1000000; }; })();"""
# (role, view, clicks inside the page after it draws)
SHOTS = []
for role in ["admin", "Technician", "Manager"]:
    for v in ["inbox", "console", "rolist", "timelog", "parts", "fixes", "career", "manager", "ros", "triage", "foreman", "warranty", "report"]:
        SHOTS.append((role, v, []))
SHOTS_X = [("admin", "manager", ["[data-a=view][data-v=kpi]"]), ("admin", "manager", ["[data-a=view][data-v=team]"]), ("admin", "manager", ["[data-a=view][data-v=flow]"]), ("admin", "manager", ["[data-a=view][data-v=fleet]"]),
          ("admin", "manager", ["[data-a=pop][data-p=set]"]), ("Technician", "career", ["[data-a=view][data-v=work]"]), ("Technician", "career", ["[data-a=view][data-v=grow]"]),
          ("admin", "timelog", ["[data-a=view][data-v=week]"]), ("admin", "timelog", ["[data-a=view][data-v=sheet]"]), ("admin", "rolist", [".rq-row[data-id]"]),
          ("admin", "parts", ["[data-a=view][data-v=cat]"]), ("admin", "parts", ["[data-a=pop][data-p=chk]"]), ("admin", "fixes", ["[data-a=view][data-v=open]"]),
          ("admin", "triage", ["[data-action=tg-view][data-v=desk]"]), ("admin", "triage", ["[data-action=tg-view][data-v=yard]"]), ("admin", "foreman", ["[data-action=fm-view][data-v=techs]"])]
STATE = {}
async def snap(p, file, theme, prep=False):
    b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page()
    await pg.add_init_script(SEED)
    if STATE.get("s"): await pg.add_init_script("try{ if(!sessionStorage.getItem('seeded')){ localStorage.setItem('tec_state_v1', " + json.dumps(STATE["s"]) + "); sessionStorage.setItem('seeded','1'); } }catch(e){}")
    await pg.clock.set_fixed_time(datetime.datetime(2026, 10, 22, 10, 15))
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto("file://" + H + "/" + file); await pg.wait_for_timeout(1500)
    await pg.add_style_tag(content="*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}")
    await pg.evaluate(f"__tg.applyTheme('{theme}')")
    await pg.evaluate("(()=>{ const U=__tg.UI(); U.size='floor'; document.documentElement.setAttribute('data-size','floor'); })()")
    if not STATE.get("s"):
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(600)
        STATE["s"] = await pg.evaluate("JSON.stringify(__tg.STATE())")
    if prep:
        await b.close(); return {}, []
    out = {}
    for i, (role, v, clicks) in enumerate(SHOTS):
        if role == "admin": await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); __tg.pxSignedIn(); })()")
        else: await pg.evaluate(f"(()=>{{ const s=__tg.staffList().find(x=>x.role==={role!r}); localStorage.setItem('tec_viewas', s.id); __tg.pxSignedIn(); }})()")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; U.modal=null; U.toast=null; U.notifOpen=false; U.pxPop=null; U.reportDate='2026-10-21'; __tg.render(); window.scrollTo(0,0); }})()"); await pg.wait_for_timeout(350)
        for c in clicks:
            try: await pg.click(c, timeout=1500); await pg.wait_for_timeout(300)
            except Exception: pass
        await pg.mouse.move(1430, 890); await pg.wait_for_timeout(100)
        path = f"{SH}/{file.split('.')[0]}_{theme}_{i:02d}_{role}_{v}.png"
        await pg.screenshot(path=path); out[i] = path
        await pg.keyboard.press("Escape")
    await b.close()
    return out, errs
async def main():
    async with async_playwright() as p:
        for theme in (sys.argv[3].split(",") if len(sys.argv) > 3 else ["ivl", "ivd"]):
            if not STATE.get("s"): await snap(p, A, theme, prep=True)
            a, ea = await snap(p, A, theme); b, eb = await snap(p, B, theme)
            print(theme, "errors", ea[:3], eb[:3])
            bad = 0
            for i in a:
                x = np.asarray(Image.open(a[i]).convert("RGB"), dtype=np.int16); y = np.asarray(Image.open(b[i]).convert("RGB"), dtype=np.int16)
                if x.shape != y.shape: print("  size differs", i, SHOTS[i]); bad += 1; continue
                d = np.abs(x - y).sum(axis=2) > 24; n = int(d.sum())
                if n > 40:
                    bad += 1; ys, xs = np.where(d); print(f"  DIFF {i:02d} {SHOTS[i][0]:10} {SHOTS[i][1]:9} {SHOTS[i][2]} {n} px in x{xs.min()}-{xs.max()} y{ys.min()}-{ys.max()}")
                    m = Image.fromarray((d * 255).astype(np.uint8)); m.save(b[i].replace(".png", "_diff.png"))
            print(theme, len(a), "shots,", bad, "differ")
asyncio.run(main())
