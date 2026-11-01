# the phone view's moving parts: More, Appearance, a popover, dialogs, search, the bar hiding
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_phone", "i"); os.makedirs(OUT, exist_ok=True)
THEME = sys.argv[1] if len(sys.argv) > 1 else "ivl"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.evaluate(f"__tg.applyTheme('{THEME}')"); await pg.wait_for_timeout(300)
        async def shot(n): await pg.wait_for_timeout(400); await pg.screenshot(path=f"{OUT}/{THEME}_{n}.png")
        async def go(v): await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; U.modal=null; U.toast=null; __tg.render(); window.scrollTo(0,0); }})()"); await pg.wait_for_timeout(400)
        await go("console")
        await pg.click('.pm-tab[data-pm="more"]'); await shot("01_more")
        print("more open:", await pg.evaluate("!!document.querySelector('.pm-sheet')"))
        await pg.click('.pm-sheet [data-s="look"]'); await shot("02_appearance")
        print("view:", await pg.evaluate("__tg.UI().view"), "sheet gone:", await pg.evaluate("!document.querySelector('.pm-sheet')"))
        if await pg.query_selector('.px-list .px-it'):
            pass
        # a popover as a sheet
        await go("manager"); await pg.evaluate("(()=>{ const b=document.querySelector('.mq-perb, [data-a=pop]'); if(b) b.click(); })()"); await shot("03_pop")
        print("pop:", await pg.evaluate("(()=>{ const p=document.querySelector('.tg-pop'); if(!p) return null; const r=p.getBoundingClientRect(); return [Math.round(r.left),Math.round(r.right),Math.round(r.bottom)]; })()"))
        await pg.keyboard.press("Escape")
        # dialogs
        await go("triage"); await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('.main button')].find(x=>/New RO/.test(x.textContent)); if(b) b.click(); })()"); await shot("04_newro")
        print("modal:", await pg.evaluate("(()=>{ const m=document.querySelector('.modal, .modal-card, .px-modal, [role=dialog]'); if(!m) return null; const r=m.getBoundingClientRect(); return [m.className.split(' ')[0], Math.round(r.left), Math.round(r.right), Math.round(r.width)]; })()"))
        await pg.keyboard.press("Escape"); await pg.evaluate("(()=>{ const U=__tg.UI(); U.modal=null; __tg.render(); })()")
        await go("console"); await pg.evaluate("(()=>{ const U=__tg.UI(); __tg.render(); })()")
        await pg.click('.pm-tab[data-pm="more"]'); await pg.wait_for_timeout(300)
        await pg.click('.pm-sheet [data-action="open-palette"]'); await shot("05_search")
        print("palette:", await pg.evaluate("(()=>{ const m=document.querySelector('.palette, .pal, [class*=palette]'); if(!m) return null; const r=m.getBoundingClientRect(); return [m.className.split(' ')[0], Math.round(r.left), Math.round(r.right)]; })()"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        # clock out
        await go("console"); await pg.click('.pm-tab[data-pm="more"]'); await pg.wait_for_timeout(300)
        btn = await pg.query_selector('.pm-sheet [data-action="shift-out"], .pm-sheet [data-action="shift-in"]')
        if btn: await btn.click(); await shot("06_clock")
        print("clock dialog:", await pg.evaluate("(()=>{ const m=document.querySelector('.modal, .modal-card, [role=dialog]'); if(!m) return null; const r=m.getBoundingClientRect(); return [m.className.split(' ')[0], Math.round(r.left), Math.round(r.right)]; })()"))
        await pg.keyboard.press("Escape"); await pg.evaluate("(()=>{ const U=__tg.UI(); U.modal=null; __tg.render(); })()")
        # the bar hides on the way down and comes back on the way up
        await go("rolist"); await pg.wait_for_timeout(300)
        for y in (80, 200, 400, 700): await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(120)
        hid = await pg.evaluate("document.querySelector('.pm-tabs').classList.contains('hide')")
        await pg.wait_for_timeout(1300)   # a once-a-second redraw must keep it hidden
        hid2 = await pg.evaluate("document.querySelector('.pm-tabs').classList.contains('hide')")
        await shot("07_scrolled_down")
        for y in (650, 560, 450): await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(120)
        shown = not await pg.evaluate("document.querySelector('.pm-tabs').classList.contains('hide')")
        await shot("08_scrolled_up")
        print("bar hidden going down:", hid, "still hidden after redraw:", hid2, "back going up:", shown)
        # the RO list opens the RO; Back goes back
        await pg.evaluate("window.scrollTo(0,0)"); await pg.click('.rq-rows .rq-row'); await pg.wait_for_timeout(500)
        print("RO list tap opens:", await pg.evaluate("__tg.UI().view"), await pg.evaluate("__tg.UI().selectedRo"))
        await shot("09_ro")
        # the phone's back button: an opened row closes, then More closes
        await go("inbox"); await pg.evaluate("document.querySelector('.main .tg-list .tg-it:not(.ib-sum)').click()"); await pg.wait_for_timeout(500)
        d1 = await pg.evaluate("document.documentElement.classList.contains('pm-det')")
        await pg.evaluate("history.back()"); await pg.wait_for_timeout(600)
        d2 = await pg.evaluate("document.documentElement.classList.contains('pm-det')")
        await pg.click('.pm-tab[data-pm="more"]'); await pg.wait_for_timeout(300)
        m1 = await pg.evaluate("!!document.querySelector('.pm-sheet')")
        await pg.evaluate("history.back()"); await pg.wait_for_timeout(600)
        m2 = await pg.evaluate("!!document.querySelector('.pm-sheet')")
        print("back button: row open", d1, "-> closed", not d2, "| More open", m1, "-> closed", not m2, "| still in Parsec:", await pg.evaluate("!!document.querySelector('.pm-tabs')"))
        print("errors", errs[:6]); await b.close()
asyncio.run(main())
