import asyncio, json, os, datetime
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(H, "shots7")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        async def page(w, h=900, theme="ivl", size=None, sample=True):
            ctx = await b.new_context(viewport={"width": w, "height": h}); pg = await ctx.new_page()
            await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
            pg.on("pageerror", lambda e: errs.append(f"{w}/{theme} PAGEERR " + str(e)))
            pg.on("console", lambda m: errs.append(f"{w}/{theme} CONSOLE " + m.text) if m.type == "error" and "ERR_TUNNEL" not in m.text and "Failed to load resource" not in m.text else None)
            await pg.goto("file://" + H + "/t7.html"); await pg.wait_for_timeout(1200)
            await pg.evaluate(f"__tg.applyTheme('{theme}')")
            if sample: await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
            if size: await pg.evaluate(f"document.documentElement.setAttribute('data-size','{size}')")
            await pg.evaluate("(()=>{const U=__tg.UI(); U.view='warranty'; U.modal=null; U.toast=null; __tg.render();})()"); await pg.wait_for_timeout(400)
            return ctx, pg
        # dark, all views + a popover
        ctx, pg = await page(1440, theme="ivd")
        for v in ["claims", "board", "money", "parts"]:
            await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.waView='{v}'; __tg.render();}})()"); await pg.wait_for_timeout(250); await pg.screenshot(path=f"{SH}/d_{v}.png")
        await pg.evaluate("(()=>{const U=__tg.UI(); U.waView='claims'; __tg.render();})()"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300); await pg.screenshot(path=f"{SH}/d_pop.png")
        await pg.keyboard.press("Escape"); await pg.keyboard.press("p"); await pg.wait_for_timeout(300); await pg.screenshot(path=f"{SH}/d_print.png"); await pg.keyboard.press("Escape")
        await ctx.close()
        # widths and sizes
        for w, h, size in [(1280, 800, None), (1920, 1080, None), (1440, 900, "large"), (1440, 900, "floor")]:
            ctx, pg = await page(w, h, size=size)
            m = await pg.evaluate("(()=>{const m=document.querySelector('.main.v-warranty'), t=document.querySelector('.wa'), l=document.querySelector('.wa .tg-scroll'); const r=m.getBoundingClientRect(); return JSON.stringify({main:[Math.round(r.top),Math.round(r.bottom)], win:innerHeight, tg:Math.round(t.getBoundingClientRect().height), docH:document.documentElement.scrollHeight, over:[...document.querySelectorAll('.wa .tg-head > *')].some(e=>e.getBoundingClientRect().right>t.getBoundingClientRect().right+1)})})()")
            print(w, h, size, m)
            await pg.screenshot(path=f"{SH}/w_{w}_{size or 'std'}.png")
            await pg.evaluate("(()=>{const U=__tg.UI(); U.waView='board'; __tg.render();})()"); await pg.wait_for_timeout(200); await pg.screenshot(path=f"{SH}/w_{w}_{size or 'std'}_board.png")
            await ctx.close()
        # empty: no sample
        ctx, pg = await page(1440, sample=False); await pg.screenshot(path=f"{SH}/e_empty.png")
        for v in ["board", "money", "parts"]:
            await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.waView='{v}'; __tg.render();}})()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=f"{SH}/e_parts.png"); await ctx.close()
        # persistence across reload
        ctx, pg = await page(1440)
        r = await pg.evaluate("__tg.S().ros.find(x=>x.customerName==='Midway Auto Transport').id")
        await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.waSel='{r}'; U.waView='claims'; __tg.render();}})()"); await pg.wait_for_timeout(200)
        await pg.keyboard.press("s"); await pg.keyboard.press("3"); await pg.wait_for_timeout(300)
        await pg.click('.wa [data-action="wa-pop"][data-p="cfg"]'); await pg.fill('.wa [data-wa-cfg="resub"]', "12"); await pg.fill('.wa [data-wa-cfg="dealer"]', "Vanguard Greensboro"); await pg.keyboard.press("Escape")
        await pg.evaluate("(()=>{const U=__tg.UI(); U.waView='money'; U.waPer='90'; __tg.render();})()"); await pg.evaluate("(()=>{ document.querySelector('[data-action=wa-per][data-k=\"90\"]').click(); })()"); await pg.wait_for_timeout(1500)
        before = await pg.evaluate(f"JSON.stringify([__tg.waCfg().resub, __tg.waCfg().dealer, !!__tg.getRO('{r}').waSnz, __tg.waClearedList().length, __tg.UI().waView, __tg.UI().waPer])")
        await pg.reload(); await pg.wait_for_timeout(1500)
        after = await pg.evaluate(f"JSON.stringify([__tg.waCfg().resub, __tg.waCfg().dealer, !!(__tg.getRO('{r}')||{{}}).waSnz, __tg.waClearedList().length, __tg.UI().waView, __tg.UI().waPer])")
        print("reload before", before); print("reload after ", after)
        # the RO page link into the Warranty page, and the badge elsewhere
        await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.view='ros'; U.selectedRo='{r}'; __tg.render();}})()"); await pg.wait_for_timeout(600)
        nb = await pg.evaluate("(()=>{const b=[...document.querySelectorAll('.iv-side button, .pz-hdr button')].find(e=>/Warranty/.test(e.textContent)); return b? b.textContent.trim() : null})()"); print("nav badge:", nb)
        await pg.screenshot(path=f"{SH}/r_ro.png")
        await ctx.close()
        print("errors:", errs[:10])
        await b.close()
asyncio.run(main())
