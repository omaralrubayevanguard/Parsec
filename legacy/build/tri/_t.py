import asyncio, os
from playwright.async_api import async_playwright
T = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(T, "shots"); os.makedirs(S, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for w, h, tag in [(1440, 900, "d"), (390, 844, "m")]:
            pg = await (await b.new_context(viewport={"width": w, "height": h})).new_page()
            pg.on("pageerror", lambda e: errs.append(tag + ": " + str(e)[:200]))
            await pg.route("**/fonts.g*/**", lambda r: r.abort())
            await pg.goto("file://" + T + "/tri.html"); await pg.wait_for_timeout(300)
            shot = lambda n: pg.screenshot(path=os.path.join(S, tag + "_" + n + ".png"))
            await shot("x0")
            await pg.click('[data-xd="tech"]'); await pg.wait_for_timeout(100); await shot("x1")
            await pg.click('[data-xw="Dana Kowalski"]'); await pg.wait_for_timeout(100)
            await pg.click('[data-xy="Repair — approved"]'); await pg.wait_for_timeout(100); await shot("x3")
            await pg.click('[data-x="xgo"]'); await pg.wait_for_timeout(150); await shot("x4")
            print(tag, "sent:", await pg.evaluate("(document.querySelector('.card.new .who')||{}).textContent"), "| list:", await pg.evaluate("[...document.querySelectorAll('.ngh')].map(g=>g.textContent).join(' / ')"))
            for pres in ["sheet", "row"]:
                await pg.click(f'[data-ch="xPres"][data-v="{pres}"]'); await pg.wait_for_timeout(100)
                await pg.keyboard.press("Escape"); await pg.click('[data-x="xopen"]'); await pg.wait_for_timeout(100)
                if pres == "row":
                    await pg.click('[data-xm="0"]'); await pg.wait_for_timeout(100); await shot("row_menu")
                    await pg.click('[data-xd="parts"]'); await pg.click('[data-xm="1"]'); await pg.wait_for_timeout(100); await shot("row_menu2")
                    await pg.click('[data-xw="*"]'); await pg.click('[data-xm="2"]'); await pg.click('[data-xy="Price check"]'); await pg.wait_for_timeout(100)
                    print(tag, "row ready:", await pg.evaluate("!document.querySelector('[data-x=xgo]').disabled"))
                await shot(pres)
            await pg.click('[data-flow="road"]'); await pg.wait_for_timeout(100); await shot("r0")
            await pg.click('[data-rm="log"]'); await pg.wait_for_timeout(100)
            await pg.fill('[data-ri="mi"]', "12"); await pg.click('[data-rc="Brakes"]'); await pg.click('[data-rr="Fail"]'); await pg.wait_for_timeout(100)
            print(tag, "fail disabled:", await pg.evaluate("document.querySelector('[data-x=rlog]').disabled"))
            await pg.click('[data-rf="Noise"]'); await pg.wait_for_timeout(100); await shot("r1")
            await pg.click('[data-x="rlog"]'); await pg.wait_for_timeout(100); await shot("r2")
            await pg.click('[data-flow="qc"]'); await pg.wait_for_timeout(100); await shot("q0")
            print(tag, "release disabled:", await pg.evaluate("document.querySelector('[data-x=qrel]').disabled"))
            for w0 in await pg.evaluate("[...document.querySelectorAll('[data-qt]')].map(b=>b.dataset.qt)"):
                await pg.click(f'[data-qt="{w0}"]')
            print(tag, "release after ticks disabled:", await pg.evaluate("document.querySelector('[data-x=qrel]').disabled"))
            await pg.click('[data-x="qedit"]'); await pg.fill('[data-qa]', "Mud flaps on"); await pg.click('[data-x="qadd"]'); await pg.wait_for_timeout(100); await shot("q1")
            await pg.click('[data-x="qedit"]'); await pg.click('[data-qt="Mud flaps on"]'); await pg.click('[data-x="qrel"]'); await pg.wait_for_timeout(100); await shot("q2")
            await pg.click('#pk-open'); await pg.wait_for_timeout(100); await shot("picks")
            print(tag, "picks:\n" + await pg.evaluate("document.querySelector('#picks pre').textContent"))
            await pg.keyboard.press("Escape")
            for th in ["graphite", "white", "black"]:
                await pg.click(f'button[data-th="{th}"]'); await pg.click('[data-flow="xfer"]'); await pg.wait_for_timeout(100); await shot("th_" + th)
            print(tag, "hscroll:", await pg.evaluate("document.documentElement.scrollWidth > innerWidth"))
        print("ERR", errs); await b.close()
asyncio.run(main())
