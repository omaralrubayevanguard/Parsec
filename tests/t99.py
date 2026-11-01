import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_trk")
THEME = sys.argv[1] if len(sys.argv) > 1 else "ivl"; T = "d" if THEME == "ivd" else "l"
PLACE = open(os.path.join(H, "_fm2.py")).read().split('PLACE = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        if THEME == "ivd": await pg.evaluate("__tg.applyTheme('ivd')")
        print("placed", await pg.evaluate(PLACE))
        # RO page + notes
        rid = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(x=>!x.shop && __tg.trkPick(x).kind==='model' && /VNL 740/.test(x.model)); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); return r.id; })()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, f"n{T}_ro.png"), clip={"x":260,"y":60,"width":860,"height":280})
        await pg.locator(".px-trk__pic img").click(); await pg.wait_for_timeout(400)
        print("window open:", await pg.evaluate("!!document.getElementById('trk-insp')"))
        await pg.click("[data-ti=add]"); await pg.wait_for_timeout(200)
        box = await pg.locator(".ti-pic").bounding_box()
        await pg.mouse.click(box["x"] + box["width"] * 0.22, box["y"] + box["height"] * 0.62); await pg.wait_for_timeout(300)
        await pg.select_option('[data-ti-f=kind]', 'Damage'); await pg.fill('[data-ti-f=text]', 'Front bumper cracked on the passenger side'); await pg.click('[data-ti=save]'); await pg.wait_for_timeout(300)
        await pg.click("[data-ti=add]"); await pg.wait_for_timeout(200); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200)
        await pg.fill('[data-ti-f=text]', 'Check the charge-air cooler hose'); await pg.keyboard.press("Control+Enter"); await pg.wait_for_timeout(300)
        notes = await pg.evaluate(f"JSON.stringify((__tg.getRO('{rid}').trkNotes||[]).map(n=>[n.kind,n.text.slice(0,20),n.x,n.y,n.pic]))"); print("notes:", notes)
        await pg.screenshot(path=os.path.join(OUT, f"n{T}_win.png"))
        # space must not start the clock while the window is open
        before = await pg.evaluate("__tg.STATE().punches.filter(p=>!p.stop).length")
        await pg.click(".ti-h h2"); await pg.keyboard.press(" "); await pg.wait_for_timeout(300)
        print("space ignored:", before == await pg.evaluate("__tg.STATE().punches.filter(p=>!p.stop).length"))
        await pg.click("[data-ti=sel][data-id]"); await pg.wait_for_timeout(200); await pg.click("[data-ti=del]"); await pg.wait_for_timeout(300)
        print("after remove:", await pg.evaluate(f"(__tg.getRO('{rid}').trkNotes||[]).length"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(500)
        print("after undo:", await pg.evaluate(f"(__tg.getRO('{rid}').trkNotes||[]).length"), "list rows:", await pg.evaluate("document.querySelectorAll('.ti-li').length"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        print("closed:", await pg.evaluate("!document.getElementById('trk-insp')"), "still on RO:", await pg.evaluate(f"__tg.UI().selectedRo==='{rid}'"))
        await pg.wait_for_timeout(400)
        print("banner marks:", await pg.evaluate("document.querySelector('.jc-host').shadowRoot.querySelectorAll('.px-trk__mk').length"), await pg.evaluate("(document.querySelector('.jc-host').shadowRoot.querySelector('.px-trk__nb')||{}).textContent"))
        await pg.screenshot(path=os.path.join(OUT, f"n{T}_ro2.png"), clip={"x":260,"y":60,"width":860,"height":280})
        # Search
        await pg.keyboard.press("Control+k"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, f"n{T}_pal.png"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        # Foreman + Triage
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='foreman'; U.fmView='floor'; __tg.render(); })()"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=os.path.join(OUT, f"n{T}_fm.png"))
        print("bay icons:", await pg.evaluate("[document.querySelectorAll('.fm-ti.top').length, document.querySelectorAll('.fm-ti:not(.top)').length]"), "tile h:", await pg.evaluate("[...new Set([...document.querySelectorAll('.fm-bay')].map(x=>Math.round(x.getBoundingClientRect().height)))]"))
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='triage'; U.tgView='desk'; __tg.render(); })()"); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=os.path.join(OUT, f"n{T}_tg.png"))
        # settings
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='profile'; U.pxSec='data'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        await pg.locator("[data-trk-q]").scroll_into_view_if_needed(); await pg.fill("[data-trk-q]", "vhd"); await pg.wait_for_timeout(300)
        print("filter vhd:", await pg.evaluate("[...document.querySelectorAll('.px-trkr')].filter(r=>!r.hidden).length"))
        await pg.locator(".px-card:has([data-trk-card])").screenshot(path=os.path.join(OUT, f"n{T}_set.png"))
        await pg.fill("[data-trk-q]", "2019"); await pg.wait_for_timeout(300)
        print("filter 2019:", await pg.evaluate("[...document.querySelectorAll('.px-trkr')].filter(r=>!r.hidden).length"), "total", await pg.evaluate("document.querySelectorAll('.px-trkr').length"))
        print("errs", errs[:5]); await b.close()
asyncio.run(main())
