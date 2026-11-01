import asyncio, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from t_app import SEED, H, SH
async def run(vw, vh, mini, tag):
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": vw, "height": vh}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "Failed to load" not in m.text else None)
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1500)
        if mini: await pg.evaluate("localStorage.setItem('tec_iv_mini','1'); document.documentElement.classList.add('iv-mini')")
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='triage'; U.modal=null; __tg.render();})()"); await pg.wait_for_timeout(300)
        ids = await pg.evaluate(SEED)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.toast=null; U.tgSel=null; U.tgView='inbox'; __tg.render();})()"); await pg.wait_for_timeout(400)
        async def shot(n, w=350): await pg.wait_for_timeout(w); await pg.screenshot(path=f"{SH}/{tag}_{n}.png")
        async def key(k, w=250): await pg.keyboard.press(k); await pg.wait_for_timeout(w)
        async def ui(js): await pg.evaluate("(()=>{const U=__tg.UI();" + js + ";__tg.render();})()"); await pg.wait_for_timeout(250)
        await pg.mouse.move(5, vh - 5)
        await shot("1_inbox")
        if tag == "std":
            # accept from the keyboard (first item is the one sent to me)
            await ui(f"U.tgSel='{ids['sent']}'"); await key("Enter", 400); await shot("2_accepted")
            # assign popover
            await ui(f"U.tgSel='{ids['ck']}'"); await key("Enter"); await shot("3_assign")
            await key("1", 400); await shot("4_assigned")
            # check in popover for the arrival
            await ui(f"U.tgSel='{ids['arr']}'"); await key("Enter"); await shot("5_checkin")
            await key("Escape")
            # clash: fix spot -> keep one -> pick a free spot
            await ui(f"U.tgSel='{ids['c2']}'"); await key("Enter", 400); await shot("6_clash")
            await pg.click(".tg-ybar.cl .btns .btn >> nth=0"); await shot("7_pick")
            await pg.click(".tg-s.free >> nth=0"); await shot("8_fixed", 500)
            print("clashes after:", await pg.evaluate("__tg.tgClashes().length"))
            # nudge
            await key("1"); await ui(f"U.tgSel='{ids['fm']}'"); await key("Enter", 400); await shot("9_nudged")
            # away: something turns late while on another page
            await ui("U.view='rolist'")
            await pg.evaluate("(()=>{const S=__tg.S(); const r=S.ros.find(r=>__tg.tyCat(r)==='rdy' && !r.tgSnz); r.status.setAt=new Date(Date.now()-30*3600e3).toISOString();})()")
            await ui(""); await shot("10_badge")
            await ui("U.view='triage'"); await shot("11_away")
            # desk + yard at this size
            await key("2"); await shot("12_desk"); await key("3"); await shot("13_yard")
        else:
            await key("2"); await shot("2_desk"); await key("3"); await shot("3_yard")
            await key("1"); await ui(f"U.tgSel='{ids['apr']}'"); await key("c"); await shot("4_log")
        print(tag, "errors:", errs[:10]); await b.close()
async def main():
    await run(1440, 900, False, "std")
    await run(1280, 760, False, "sm")
    await run(1920, 1080, False, "lg")
    await run(1366, 768, True, "mini")
asyncio.run(main())
