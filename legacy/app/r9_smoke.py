import asyncio, json, sys, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
SH = os.path.join(H, "shots9"); os.makedirs(SH, exist_ok=True)
FILE = sys.argv[1] if len(sys.argv) > 1 else "t8.html"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "ERR_TUNNEL" not in m.text and "Failed to load resource" not in m.text and "net::" not in m.text else None)
        await pg.goto("file://" + H + "/" + FILE); await pg.wait_for_timeout(1500)
        print("boot errors:", errs[:5]); errs.clear()
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(500)
        async def shot(n, wait=350):
            await pg.wait_for_timeout(wait); await pg.screenshot(path=f"{SH}/{n}.png")
        async def ui(js, wait=300):
            await pg.evaluate("(()=>{const U=__tg.UI();" + js + ";__tg.render();})()"); await pg.wait_for_timeout(wait)
        pages = await pg.evaluate("__tg.navPages().map(p=>p[0])")
        print("pages:", pages)
        for v in pages + ["profile"]:
            await ui(f"U.view='{v}'; U.modal=null", 400)
            if errs: print("ERR on", v, errs[:3]); errs.clear()
        await ui("U.view='console'")
        await shot("a1_console_rail")
        # alignment: every icon box centered on the same x, open and mini
        al = await pg.evaluate("""(()=>{ const r=[...document.querySelectorAll('.px-rail .pxr-ic')].map(e=>{const b=e.getBoundingClientRect(); return Math.round((b.left+b.width/2)*10)/10;}); const w=document.querySelector('.px-rail').getBoundingClientRect().width; return {xs:[...new Set(r)], n:r.length, w}; })()""")
        print("open rail:", al)
        await pg.keyboard.press("["); await pg.wait_for_timeout(400)
        al2 = await pg.evaluate("""(()=>{ const r=[...document.querySelectorAll('.px-rail .pxr-ic')].map(e=>{const b=e.getBoundingClientRect(); return Math.round((b.left+b.width/2)*10)/10;}); const w=document.querySelector('.px-rail').getBoundingClientRect().width; const pl=getComputedStyle(document.body).paddingLeft; return {xs:[...new Set(r)], n:r.length, w, pl}; })()""")
        print("mini rail:", al2)
        await shot("a2_mini")
        await pg.keyboard.press("["); await pg.wait_for_timeout(300)
        # clock popover, profile menu
        await pg.click('[data-px-anchor="clk"]'); await shot("a3_clock_pop")
        print("clock pop:", await pg.evaluate("(()=>{const p=document.querySelector('.pxr-pop'); return p? p.innerText.replace(/\\n+/g,' | ').slice(0,300):null})()"))
        await pg.mouse.click(900, 500); await pg.wait_for_timeout(300)
        print("pop closed:", await pg.evaluate("!document.querySelector('.pxr-pop')"))
        await pg.click('[data-px-anchor="me"]'); await shot("a4_me_pop")
        print("me pop:", await pg.evaluate("(()=>{const p=document.querySelector('.pxr-pop'); return p? p.innerText.replace(/\\n+/g,' | ').slice(0,400):null})()"))
        # theme from the menu, stays open
        await pg.click('.pxr-pop [data-theme="ivd"]'); await pg.wait_for_timeout(300)
        print("theme:", await pg.evaluate("document.documentElement.getAttribute('data-theme')"), "pop open:", await pg.evaluate("!!document.querySelector('.pxr-pop')"))
        await shot("a5_me_pop_dark")
        await pg.click('.pxr-pop [data-theme="ivl"]'); await pg.wait_for_timeout(200)
        await pg.click('.pxr-pop [data-action="px-profile"][data-s="look"]'); await shot("b1_profile_look")
        for s in ["you", "sign", "data", "tools", "keys", "admin"]:
            await ui(f"U.pxSec='{s}'", 350); await shot("b_prof_" + s, 100)
            if errs: print("ERR on profile", s, errs[:3]); errs.clear()
        # Inbox from the rail
        await ui("U.view='console'; U.pxPop=null")
        await pg.click('.px-rail [data-view="inbox"]'); await shot("c1_inbox")
        print("inbox page:", await pg.evaluate("[__tg.UI().view, !!document.querySelector('[data-pg=inbox]')]"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        # keys sheet
        await ui("U.view='triage'; U.notifOpen=false"); await pg.keyboard.press("?"); await shot("c2_keys_triage")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        # sign out / sign in
        made = await pg.evaluate("__tg.ensureDemoTeam()"); await pg.evaluate("__tg.scheduleSave()")
        print("demo team:", made)
        await ui("U.view='console'")
        await pg.click('[data-px-anchor="me"]'); await pg.wait_for_timeout(300)
        await pg.click('.pxr-pop [data-action="px-logout"]'); await shot("d1_signed_out")
        print("out:", await pg.evaluate("__tg.pxOut()"), "screen:", await pg.evaluate("!!document.querySelector('.pxs')"))
        # keys do nothing while signed out
        await pg.keyboard.press("n"); await pg.wait_for_timeout(200)
        print("modal after n while out:", await pg.evaluate("__tg.UI().modal"))
        tech = await pg.evaluate("__tg.staffList().filter(s=>s.role==='Technician')[0].id")
        await pg.click(f'.pxs [data-id="{tech}"]'); await shot("d2_signed_in_tech")
        print("after sign in:", await pg.evaluate("[__tg.pxOut(), __tg.UI().view, __tg.viewAsStaff() && __tg.viewAsStaff().name]"))
        # PIN
        await pg.evaluate(f"(()=>{{ const s=__tg.staffList().find(x=>x.role==='Foreman'); s.pin='1234'; window.__fm=s.id; }})()")
        await pg.click('[data-px-anchor="me"]'); await pg.wait_for_timeout(300)
        await pg.click('.pxr-pop [data-action="px-switch"]'); await pg.wait_for_timeout(300)
        fid = await pg.evaluate("window.__fm")
        await pg.click(f'.pxs [data-id="{fid}"]'); await pg.wait_for_timeout(400)
        await shot("d3_pin")
        print("pin modal:", await pg.evaluate("__tg.UI().modal && __tg.UI().modal.type"))
        await pg.fill("#pin-in", "1234"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
        print("after pin:", await pg.evaluate("[__tg.pxOut(), __tg.UI().view, __tg.viewAsStaff() && __tg.viewAsStaff().name]"))
        await shot("d4_foreman")
        # back to admin
        await pg.click('[data-px-anchor="me"]'); await pg.wait_for_timeout(300)
        await pg.click('.pxr-pop [data-action="px-switch"]'); await pg.wait_for_timeout(300)
        await pg.click('.pxs [data-action="viewas-reset"]'); await pg.wait_for_timeout(300)
        print("admin:", await pg.evaluate("[__tg.pxOut(), __tg.UI().view, !!__tg.viewAsStaff()]"))
        print("errors:", errs[:6])
        await b.close()

asyncio.run(main())
