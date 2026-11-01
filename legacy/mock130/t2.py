import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":960})).new_page()
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        await pg.goto("file://" + H + "/mock.html"); await pg.wait_for_timeout(400)
        await pg.click("[data-th=graphite]"); await pg.click("[data-scr=switch]"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=H + "/u1_switch_dark.png")
        await pg.click("[data-dev=phone]"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=H + "/u2_switch_phone.png")
        await pg.click("[data-scr=admin]"); await pg.wait_for_timeout(300)
        await pg.click("[data-ch=depth][data-v=levels]"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=H + "/u3_admin_phone_levels.png")
        await pg.click("[data-dev=desk]"); await pg.click("[data-th=ivory]"); await pg.click("[data-adt=rules]"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=H + "/u4_rules.png")
        await pg.click("[data-scr=login]"); await pg.click("[data-ch=check][data-v=mixed]"); await pg.click("[data-who=admin]"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=H + "/u5_pw.png")
        await pg.fill("#pwin", "parsec"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        print('toast', await pg.evaluate("(document.querySelector('.toast')||{}).textContent"))
        await pg.click("[data-ch=lay][data-v=badge]"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=H + "/u6_badge.png")
        # 5 wrong tries
        await pg.click("[data-ch=check][data-v=pin4]"); await pg.click("[data-ch=lay][data-v=tiles]"); await pg.click("[data-who=luis]"); await pg.wait_for_timeout(200)
        for i in range(5):
            for k in "0000": await pg.keyboard.press(k)
            await pg.wait_for_timeout(80)
        print('msg', await pg.evaluate("document.querySelector('.pin .msg').textContent"))
        print('errors', errs)
        await b.close()
asyncio.run(main())
