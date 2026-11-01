import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        await pg.goto("file://" + B + "/cx2_mock.html"); await pg.wait_for_timeout(500)
        bad = lambda: pg.evaluate("()=>{ const t=document.querySelector('.mock').innerText; const m=t.match(/.{0,30}(NaN|undefined|Infinity|\\[object).{0,30}/); return m?m[0]:null; }")
        st = lambda: pg.evaluate("()=>{ const S=__cx.S(), U=__cx.U(); return [S.run, S.shop, S.out&&S.out.why, U.sel] }")
        async def click(sel): await pg.click(sel); await pg.wait_for_timeout(120)
        async def toast(): 
            t = await pg.query_selector('.toast-fm'); return (await t.inner_text())[:90] if t else None
        for d in ["morning","arrive","nudge","eod","scan","ask","photos","dict","tv","bring","paused","today","fm"]:
            await click(f'[data-demo="{d}"]'); x = await bad()
            if x: print("bad", d, x)
        await click('[data-demo="morning"]'); await click('.cx-mact [data-a="morning"]'); print("morning ->", await st(), await toast())
        await click('[data-demo="arrive"]'); await click('[data-a="pickup"]'); print("arrive pickup:", await toast())
        await click('[data-demo="nudge"]'); await click('.cx-nudge [data-a="startid"]'); print("nudge resume:", await st())
        await click('[data-demo="eod"]'); await click('[data-a="eodc"][data-k="core"]'); await pg.fill('[data-in="left"]','regen still to run'); await click('[data-a="eodgo"]'); print("eod:", await st(), await toast())
        print("note left:", await pg.evaluate("__cx.S().ops.find(o=>o.id==='o1').notes.slice(-1)[0]"))
        await click('[data-demo="scan"]'); await click('[data-a="scanit"][data-no="37755"]'); print("scan:", await st(), await toast())
        await click('[data-demo="scan"]'); await click('[data-a="scanit"][data-no="37203"]'); print("scan other:", await toast())
        await click('[data-demo="ask"]'); await click('[data-a="asks"][data-v="Quote looks short"]'); await click('[data-a="asksend"]'); print("ask keep:", await st(), await toast())
        await click('[data-demo="ask"]'); await pg.uncheck('[data-in="askrun"]'); await click('[data-a="asksend"]'); print("ask hold:", await st(), await toast())
        await click('[data-demo="photos"]'); await click('[data-a="ph"][data-k="dtc"]'); print("photo:", await toast(), await pg.evaluate("__cx.S().ph.o1"))
        await click('[data-demo="dict"]'); await pg.wait_for_timeout(1800); v = await pg.input_value('[data-in="note"]'); print("dict:", v[:40]); await pg.press('[data-in="note"]','Enter'); await pg.wait_for_timeout(100)
        print("saved:", await pg.evaluate("__cx.S().ops.find(o=>o.id==='o1').notes.slice(-1)[0]"))
        await click('[data-demo="tv"]'); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100); print("tv closed:", not await pg.evaluate("__cx.U().tv"))
        await click('[data-demo="bring"]'); await click('[data-a="bring"]'); print("bring:", await pg.evaluate("__cx.S().bring"), await toast())
        await click('[data-demo="paused"]'); print("paused order:", await pg.evaluate("__cx.flat().map(o=>o.no+(o.paused?'*':'')).join(' ')"))
        print("ck tip:", await pg.get_attribute('.cx-ck','data-tip'))
        print("\n".join(errs) or "no errors"); await b.close()
asyncio.run(main())
