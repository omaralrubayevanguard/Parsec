import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "fonts" not in m.text and "Failed to load" not in m.text else None)
        await pg.goto("file://" + B + "/cx_mock.html"); await pg.wait_for_timeout(500)
        bad = lambda: pg.evaluate("()=>{ const t=document.querySelector('.mock').innerText; const m=t.match(/.{0,30}(NaN|undefined|Infinity|\\[object).{0,30}/); return m?m[0]:null; }")
        st = lambda: pg.evaluate("()=>{ const S=__cx.S(); return {run:S.run, shop:S.shop, out:!!S.out, sel:__cx.U().sel} }")
        async def click(sel): await pg.click(sel); await pg.wait_for_timeout(120)
        # walk every item
        for i in range(10):
            await pg.keyboard.press('j'); await pg.wait_for_timeout(40)
            x = await bad(); 
            if x: print("bad text at j", i, x)
        await click('[data-demo="next"]'); await click('[data-a="start"]'); print("after switch:", await st(), "|", await pg.inner_text('.toast-fm'))
        await click('[data-a="undo"]'); print("after undo:", await st())
        await pg.keyboard.press('s'); await pg.wait_for_timeout(120); print("after stop (S):", await st())
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(120); print("enter starts selected:", await st())
        await click('[data-a="done"]'); print("after done:", await st(), "| nextup:", await pg.query_selector('.cx-nextup') is not None)
        await click('[data-a="startid"]'); print("start next:", await st())
        await click('[data-a="pop"][data-p="hold"]'); await click('[data-a="hold"][data-v="Parts"]'); print("hold:", await st(), (await pg.inner_text('.toast-fm'))[:60])
        await click('[data-demo="fix"]'); await click('[data-a="usefix"]'); print("fix used:", await pg.query_selector('.cx-fix.used') is not None, "notes:", await pg.evaluate("document.querySelectorAll('.cx-nl').length"))
        await click('[data-demo="staged"]'); await click('[data-a="pickup"]'); print("staged left:", await pg.evaluate("document.querySelectorAll('[data-a=pickup]').length"))
        await click('[data-demo="today"]'); await pg.fill('[data-in="note"]', 'checked the hoses'); await pg.press('[data-in="note"]', 'Enter'); await pg.wait_for_timeout(100)
        print("note:", (await pg.evaluate("[...document.querySelectorAll('.cx-nl span')].map(x=>x.innerText).pop()")))
        await click('.cx-shop button[data-w="Training"]'); print("shop:", await st())
        await click('.cx-shop button[data-w="Training"]'); print("shop stop:", await st())
        await click('[data-a="pop"][data-p="out"]'); await click('[data-a="out"][data-v="Lunch"]'); print("out:", await st(), "| head:", (await pg.inner_text('.tg-facts'))[:120].replace("\n"," "))
        await click('[data-a="cin"]'); print("in:", await st())
        await click('[data-demo="chk"]'); await click('[data-a="fixchk"]'); print("chk left:", await pg.evaluate("__cx.S().chk"))
        await pg.keyboard.press('Escape'); await pg.keyboard.press('2'); await pg.wait_for_timeout(100); print("view:", await pg.evaluate("__cx.U().view"))
        await click('[data-a="mine"][data-v="0"]'); print("board rows all:", await pg.evaluate("document.querySelectorAll('.cx-br').length"))
        for w in ['FD','RH','MR']:
            await click(f'[data-role="{w}"]'); x = await bad(); print(w, "view", await pg.evaluate("__cx.U().view"), "bad:", x)
        await pg.wait_for_timeout(1500)
        print("tick:", await pg.inner_text('[data-tk="run"]'))
        print("\n".join(errs) or "no errors")
        await b.close()
asyncio.run(main())
