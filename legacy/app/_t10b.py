import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots10")
PLACE = open(os.path.join(H, "_fm2.py")).read().split('PLACE = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_TUNNEL" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.goto("file://" + H + "/t10.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        print("placed", await pg.evaluate(PLACE))
        go = lambda js: pg.evaluate("(()=>{ const U=__tg.UI(); " + js + "; __tg.render(); })()")
        await go("U.view='foreman'; U.fmView='floor'"); await pg.wait_for_timeout(900)
        # Move truck dialog
        sel = await pg.evaluate("(()=>{ const b=document.querySelector('.fm-bay[data-ro]'); b.click(); return b.getAttribute('data-ro'); })()"); await pg.wait_for_timeout(400)
        loc0 = await pg.evaluate(f"__tg.getRO('{sel}').location")
        await pg.click("[data-pm-move]"); await pg.wait_for_timeout(300)
        print("move dialog:", await pg.evaluate("[!!document.querySelector('dialog.pmv[open]'), document.querySelectorAll('.pmv-b').length, document.querySelectorAll('.pmv-b.ok').length]"))
        await pg.screenshot(path=os.path.join(OUT, "b_move.png"))
        await pg.click(".pmv-b"); await pg.wait_for_timeout(500)
        loc1 = await pg.evaluate(f"__tg.getRO('{sel}').location"); print("moved:", loc0, "→", loc1, "toast:", await pg.evaluate("(document.querySelector('.toast')||{}).textContent"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(500); print("undo:", await pg.evaluate(f"__tg.getRO('{sel}').location"))
        # drag a truck to a free bay
        src = await pg.locator(".fm-bay[data-ro].has-top").first.bounding_box(); rid = await pg.locator(".fm-bay[data-ro].has-top").first.get_attribute("data-ro")
        dst = await pg.locator(".fm-bay.free[data-fm-drop]").first.bounding_box(); spot = await pg.locator(".fm-bay.free[data-fm-drop]").first.get_attribute("data-fm-drop")
        await pg.mouse.move(src["x"]+40, src["y"]+40); await pg.mouse.down(); await pg.mouse.move(src["x"]+60, src["y"]+50, steps=3); await pg.mouse.move(dst["x"]+50, dst["y"]+40, steps=10); await pg.wait_for_timeout(120)
        print("dragging:", await pg.evaluate("[document.documentElement.classList.contains('pm-dragging'), document.querySelectorAll('.fm-bay.pm-ok').length, document.querySelectorAll('.fm-bay.over').length, !!document.querySelector('.pm-flight')]"))
        await pg.screenshot(path=os.path.join(OUT, "b_drag.png"))
        await pg.mouse.up(); await pg.wait_for_timeout(120)
        await pg.screenshot(path=os.path.join(OUT, "b_flight.png")); await pg.wait_for_timeout(500)
        print("dropped:", await pg.evaluate(f"__tg.getRO('{rid}').location"), "wanted", spot, "| toast undo:", await pg.evaluate("!!document.querySelector('.toast-undo')"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(600)
        # peek
        await pg.mouse.move(5, 5); await pg.wait_for_timeout(200)
        bb = await pg.locator(".fm-bay[data-ro]").nth(2).bounding_box(); await pg.mouse.move(bb["x"]+30, bb["y"]+30); await pg.wait_for_timeout(700)
        print("peek:", await pg.evaluate("!!document.getElementById('v10-peek')"))
        await pg.screenshot(path=os.path.join(OUT, "b_peek.png"))
        await pg.click("[data-pk=pin]"); await pg.wait_for_timeout(150); await pg.mouse.move(700, 880); await pg.wait_for_timeout(400)
        print("pinned stays:", await pg.evaluate("!!document.getElementById('v10-peek')"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200); print("esc closes:", await pg.evaluate("!document.getElementById('v10-peek')"))
        print("age chips:", await pg.evaluate("[document.querySelectorAll('.v10-age').length, document.querySelectorAll('.v10-age.w').length, document.querySelectorAll('.v10-age.b').length, document.querySelectorAll('.tg-held.soon').length]"))
        # assign popover with the technician's day
        await pg.evaluate("(()=>{ const b=document.querySelector('[data-action=fm-pop][data-p=assign]'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)
        print("tech caps:", await pg.evaluate("document.querySelectorAll('.v10-cap').length"))
        await pg.screenshot(path=os.path.join(OUT, "b_assign.png"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        # handover
        await pg.click("[data-v10=hand]"); await pg.wait_for_timeout(400)
        print("handover:", await pg.evaluate("[!!document.getElementById('v10-ho'), document.querySelectorAll('.ho-r').length, document.querySelectorAll('.ho-r input:checked').length]"))
        await pg.fill("[data-ho-f=note]", "Lot gate code changed — ask Mike."); await pg.click("[data-ho=build]"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "b_ho.png"))
        await pg.click("[data-ho=keep]"); await pg.wait_for_timeout(300)
        print("kept:", await pg.evaluate("(__tg.STATE().handover||{}).text ? __tg.STATE().handover.text.split('\\n').slice(0,3).join(' | ') : null"))
        # search: aria + focus return
        await pg.click("[data-v10=hand]"); await pg.wait_for_timeout(200); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        await pg.keyboard.press("Control+k"); await pg.wait_for_timeout(300)
        print("search aria:", await pg.evaluate("[document.getElementById('pal-q').getAttribute('role'), document.getElementById('pal-q').getAttribute('aria-activedescendant')]"))
        await pg.keyboard.type("2019"); await pg.wait_for_timeout(200); print("search 2019:", await pg.evaluate("document.querySelectorAll('.pal-row').length"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        # Triage release pop with the readiness count
        await go("U.view='triage'; U.tgView='desk'"); await pg.wait_for_timeout(900)
        rr = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(x=>/Complete/.test((x.status||{}).status||'')); if(!r) return null; const U=__tg.UI(); U.tgSel=r.id; __tg.render(); const b=[...document.querySelectorAll('[data-action=tg-do]')].find(x=>x.dataset.ro===r.id) || document.querySelector('[data-action=tg-pop][data-p=release]'); if(b) b.click(); return r.id; })()"); await pg.wait_for_timeout(500)
        print("release pop:", rr, await pg.evaluate("[document.querySelectorAll('.v10-rb').length, (document.querySelector('.tg-rsum')||{}).textContent]"))
        await pg.screenshot(path=os.path.join(OUT, "b_rel.png"))
        await pg.keyboard.press("Escape")
        # RO page: stage toggle toast
        await go("U.view='ros'; U.selectedRo=__tg.STATE().ros.find(x=>!x.shop && x.operations && x.operations.length).id"); await pg.wait_for_timeout(900)
        ok = await pg.evaluate("(()=>{ const r=document.querySelector('.jc-host').shadowRoot; const s=r.querySelectorAll('[data-pm-stage]'); return s.length; })()"); print("stage segs:", ok)
        # saved views
        await go("U.view='rolist'; U.rlGroup='waiting'"); await pg.wait_for_timeout(800)
        print("views row:", await pg.evaluate("!!document.querySelector('.rq-views')"), await pg.evaluate("!!document.querySelector('[data-a=vname]')"))
        await pg.click("[data-a=vname]"); await pg.wait_for_timeout(200); await pg.keyboard.type("Waiting today"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        print("views:", await pg.evaluate("JSON.stringify((__tg.STATE().rlViews||[]).map(v=>[v.name,v.g]))"))
        await go("U.rlGroup='all'"); await pg.wait_for_timeout(400)
        await pg.click("[data-a=vgo]"); await pg.wait_for_timeout(300); print("view applied:", await pg.evaluate("__tg.UI().rlGroup"))
        await pg.screenshot(path=os.path.join(OUT, "b_views.png"), clip={"x":240,"y":0,"width":1200,"height":260})
        # themes
        for th in ["vvl", "vvd", "ivd", "ivl"]:
            await pg.evaluate(f"__tg.applyTheme('{th}')"); await go("U.view='foreman'; U.fmView='floor'"); await pg.wait_for_timeout(500)
            print(th, await pg.evaluate("[document.documentElement.getAttribute('data-theme'), document.documentElement.getAttribute('data-pal'), getComputedStyle(document.body).backgroundColor]"))
            await pg.screenshot(path=os.path.join(OUT, f"th_{th}_fm.png"))
        await pg.evaluate("__tg.applyTheme('vvd')"); await go("U.view='ros'"); await pg.wait_for_timeout(800)
        await pg.screenshot(path=os.path.join(OUT, "th_vvd_ro.png"))
        print("jc pal:", await pg.evaluate("document.querySelector('.jc-host').classList.contains('pal-vv')"))
        await pg.evaluate("__tg.applyTheme('ivl')")
        print("errs", errs[:10]); await b.close()
asyncio.run(main())
