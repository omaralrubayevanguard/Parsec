import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots10")
PLACE = open(os.path.join(H, "_fm2.py")).read().split('PLACE = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.goto("file://" + H + "/t10.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300); await pg.evaluate(PLACE)
        rid = await pg.evaluate("""(()=>{ const S=__tg.STATE(); S.fmCfg=S.fmCfg||{}; S.fmCfg.bays={'Bay 4':['Pit'],'Bay 7':['Lift'],'Bay 9':['Align']};
          const U=__tg.UI(); U.view='foreman'; U.fmView='floor'; __tg.render(); const b=document.querySelector('.fm-bay[data-ro]'); const r=__tg.getRO(b.getAttribute('data-ro')); r.fmBayNeed=['Pit']; U.fmSel=r.id; U.modal=null; __tg.render(); return r.id; })()"""); await pg.wait_for_timeout(500)
        print("fit chip:", await pg.evaluate("(document.querySelector('.v10-fit')||{}).textContent"))
        await pg.click("[data-pm-move]"); await pg.wait_for_timeout(300)
        print("move fit:", await pg.evaluate("[document.querySelectorAll('.pmv-b.ok').length, document.querySelectorAll('.pmv-b.no').length, (document.querySelector('.pmv-b')||{}).textContent, (document.querySelector('.pmv p')||{}).textContent]"))
        await pg.screenshot(path=os.path.join(OUT, "e_move.png"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        # notes badge on header picture
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{rid}'); r.trkNotes=[{{id:'n1',x:.3,y:.5,kind:'Damage',text:'dent',at:new Date().toISOString(),pic:'x'}}]; __tg.render(); }})()"); await pg.wait_for_timeout(300)
        print("notes badge:", await pg.evaluate("(document.querySelector('.tg-hn')||{}).textContent"))
        # triage yard: move a truck between spots and watch the flight
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='triage'; U.tgView='yard'; __tg.render(); })()"); await pg.wait_for_timeout(800)
        print("yard spots with trucks:", await pg.evaluate("document.querySelectorAll('.tg-s[data-ro] > .tg-tv').length"))
        await pg.screenshot(path=os.path.join(OUT, "e_yard.png"))
        print("errs", errs[:6]); await b.close()
asyncio.run(main())
