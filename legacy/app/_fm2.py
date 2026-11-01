import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_trk")
F = sys.argv[1] if len(sys.argv) > 1 else "t9.html"; TAG = sys.argv[2] if len(sys.argv) > 2 else "occ"; W = int(sys.argv[3]) if len(sys.argv) > 3 else 1440
THEME = sys.argv[4] if len(sys.argv) > 4 else "ivl"
PLACE = """(()=>{ const S=__tg.STATE(); const open=S.ros.filter(r=>!r.shop && r.id!=='ro_shop' && __tg.roStatus(r).status!=='Complete – Released');
  const bays=['Bay 1','Bay 2','Bay 3','Bay 5','Bay 6','UpTime','Awning 1','Bay 8','Bay 10','Bay 12'];
  const pk = r => { try{ return __tg.trkPick ? __tg.trkPick(r).kind : 'x'; }catch(e){ return 'x'; } };
  const m = open.filter(r=>pk(r)==='model'), n = open.filter(r=>pk(r)!=='model');
  const L = [m[0],m[1],n[0],m[2],m[3],n[1],m[4],m[5],n[2],m[6]].filter(Boolean);
  L.forEach((r,i)=>{ r.location = bays[i]; }); __tg.scheduleSave(true); return L.length; })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":W,"height":900}, color_scheme="dark" if THEME=="ivd" else "light"); pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + H + "/" + F); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        if THEME == "ivd": await pg.evaluate("__tg.applyTheme('ivd')")
        print("placed", await pg.evaluate(PLACE))
        for view, sub in [("foreman","floor"),("foreman","yard"),("foreman","techs"),("triage","desk"),("triage","yard"),("triage","inbox")]:
            k = "fmView" if view=="foreman" else "tgView"
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{view}'; U.{k}='{sub}'; __tg.render(); }})()"); await pg.wait_for_timeout(2200)
            await pg.screenshot(path=os.path.join(OUT, f"{TAG}_{view}_{sub}.png"))
        print("tile", await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='foreman'; U.fmView='floor'; __tg.render(); const t=document.querySelector('.fm-bay:not(.free)'); const f=document.querySelector('.fm-bay.free'); return t? JSON.stringify([t.getBoundingClientRect().width,t.getBoundingClientRect().height, f&&f.getBoundingClientRect().height]) : 'none'; })()"))
        print("errs", errs[:4]); await b.close()
asyncio.run(main())
