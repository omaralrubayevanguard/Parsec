# r9_do.py role view out.png [steps...]  — steps: "js:<expr>" evaluate & print, "click:<selector>", "key:<key>", "wait:<ms>", "shot:<name>", "theme:<ivl|ivd>"
import asyncio, sys, os, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(H, "shots9")
role, view = sys.argv[1], sys.argv[2]; steps = sys.argv[3:]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": int(os.environ.get("W", 1440)), "height": int(os.environ.get("HH", 900))}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e) + " " + (e.stack or "")[:600]))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        pg.on("dialog", lambda d: asyncio.ensure_future(d.dismiss()))
        await pg.goto("file://" + H + "/" + os.environ.get("F", "t9.html")); await pg.wait_for_timeout(1000)
        if os.environ.get("NOSAMPLE") != "1":
            await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(200)
        if role == "admin": await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); __tg.pxSignedIn(); __tg.render(); })()")
        else: print("lands", await pg.evaluate(f"(()=>{{ const s=__tg.staffList().find(x=>x.role==={role!r}); if(!s) return false; localStorage.setItem('tec_viewas', s.id); __tg.pxSignedIn(); __tg.render(); return __tg.UI().view; }})()"))
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{view}'; U.modal=null; __tg.render(); }})()"); await pg.wait_for_timeout(400)
        n = 0
        for st in steps:
            k, _, v = st.partition(":")
            try:
                if k == "js": print("js>", json.dumps(await pg.evaluate(v), ensure_ascii=False)[:3000])
                elif k == "click": await pg.click(v, timeout=3000); await pg.wait_for_timeout(250)
                elif k == "hover": await pg.hover(v, timeout=3000); await pg.wait_for_timeout(300)
                elif k == "key": await pg.keyboard.press(v); await pg.wait_for_timeout(200)
                elif k == "type": await pg.keyboard.type(v); await pg.wait_for_timeout(200)
                elif k == "wait": await pg.wait_for_timeout(int(v))
                elif k == "theme": await pg.evaluate(f"__tg.applyTheme('{v}')"); await pg.wait_for_timeout(200)
                elif k == "shot": await pg.screenshot(path=f"{SH}/{v}.png"); print("shot", v)
                elif k == "full": await pg.screenshot(path=f"{SH}/{v}.png", full_page=True); print("full", v)
            except Exception as ex: print("STEP FAIL", st[:80], str(ex).split("\n")[0][:300])
            if errs: print("  ERR after", st[:60], errs[:3]); errs.clear()
        await b.close()
asyncio.run(main())
