import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(H, "shots")
def log(*a): print(*a, flush=True)
async def txt(pg, sel): return (await pg.locator(sel).first.inner_text()).replace("\n", " | ")
async def drag(pg, hsel, frac, steps=12):
    h = pg.locator(hsel).first; await h.scroll_into_view_if_needed(); hb = await h.bounding_box()
    tr = await h.evaluate("e => { const r = e.parentNode.getBoundingClientRect(); return [r.x, r.width]; }")
    x0 = hb["x"] + hb["width"] / 2; y0 = hb["y"] + hb["height"] / 2; x1 = tr[0] + 4 + hb["width"] / 2 + (tr[1] - hb["width"] - 8) * frac
    await pg.mouse.move(x0, y0); await pg.mouse.down()
    for i in range(1, steps + 1): await pg.mouse.move(x0 + (x1 - x0) * i / steps, y0); await pg.wait_for_timeout(16)
async def page(b, w, errs, **kw):
    pg = await b.new_page(viewport={"width": w, "height": 900 if w > 500 else 844}, **kw)
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "ERR_" not in m.text else None)
    await pg.route("**/fonts.g*/**", lambda r: r.abort())
    await pg.goto("file://" + H + "/clk2.html"); await pg.wait_for_timeout(1000); return pg
async def all_on(pg):
    for k in ["day", "lap", "slide", "band", "upace", "badge"]:
        await pg.locator(f'.idh [data-use="{k}"]').click(); await pg.wait_for_timeout(60)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        # ---- 1500, ivory
        pg = await page(b, 1500, errs)
        await pg.click('[data-replay="parts"]'); await pg.wait_for_timeout(7600)
        log("allin", await pg.locator('[data-card="parts"] .allin').evaluate("e => [getComputedStyle(e).opacity, e.getBoundingClientRect().width > 0]"))
        el = pg.locator('[data-id="parts"]'); await el.scroll_into_view_if_needed(); await el.screenshot(path=os.path.join(S, "c01_parts_in.png"))
        await pg.click('[data-speed="60"]'); await pg.click('[data-replay="lunch"]'); await pg.wait_for_timeout(1500)
        el = pg.locator('[data-id="lunch"]'); await el.scroll_into_view_if_needed(); await el.screenshot(path=os.path.join(S, "c02_lunch_dim.png"))
        await pg.click('[data-speed="1"]')
        await all_on(pg); await pg.wait_for_timeout(800)
        await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(S, "c03_all22_1500.png"), full_page=False)
        await pg.locator('[data-card="you"]').screenshot(path=os.path.join(S, "c04_you_all22.png"))
        log("you flags", await pg.locator('[data-card="you"] .cc').evaluate("e => e.className"), "| picks:")
        await pg.click('#pk-open'); log(await pg.locator('#picks pre').inner_text()); await pg.click('[data-pk="x"]')
        # take one round-1 idea off and check the card and picks
        await pg.locator('[data-r1="miles"]').click(); await pg.wait_for_timeout(200)
        log("ms ticks after miles off:", await pg.locator('[data-card="you"] [data-ms]').count())
        await pg.click('#pk-open'); log((await pg.locator('#picks pre').inner_text()).split("\n")[1]); await pg.click('[data-pk="x"]')
        await pg.locator('[data-r1="miles"]').click()
        await pg.click('.mk [data-th="black"]'); await pg.wait_for_timeout(300)
        await pg.locator('[data-card="you"]').screenshot(path=os.path.join(S, "c05_you_all22_black.png"))
        await pg.close()
        # ---- reduced motion
        pg = await page(b, 1500, errs, reduced_motion="reduce")
        await pg.click('[data-act="complete"][data-k="badge"]'); await pg.wait_for_timeout(200)
        log("reduced: burst", await pg.locator('[data-card="badge"] .burst').count(), "badge", await txt(pg, '[data-card="badge"] .done'), "anim", await pg.locator('[data-card="badge"] .done').evaluate("e => getComputedStyle(e).animationName"))
        await pg.locator('[data-card="focus"] [data-focus]').click(); await pg.wait_for_timeout(150)
        log("reduced: focus open", await pg.locator('.fx').count(), await pg.locator('.fxp').evaluate("e => getComputedStyle(e).transform"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(100); log("reduced: focus closed", await pg.locator('.fx').count())
        await pg.close()
        # ---- 390, graphite
        pg = await page(b, 390, errs)
        await pg.click('.mk [data-th="graphite"]'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(S, "d01_390_top.png"), full_page=False)
        log("390 overflow", await pg.evaluate("document.documentElement.scrollWidth"))
        await pg.locator('.idh [data-use="slide"]').click(); await pg.wait_for_timeout(300)
        log("you nar/slide", await pg.locator('[data-card="you"] .cc').evaluate("e => e.className"), await pg.locator('[data-card="you"] [data-sl]').count())
        await pg.locator('[data-card="you"]').screenshot(path=os.path.join(S, "d02_390_you_slide.png"))
        await drag(pg, '[data-card="you"] [data-slh]', .45); await pg.wait_for_timeout(80)
        await pg.locator('[data-card="you"]').screenshot(path=os.path.join(S, "d03_390_slide_half.png")); await pg.mouse.up(); await pg.wait_for_timeout(500)
        await drag(pg, '[data-card="you"] [data-slh]', 1.0); await pg.mouse.up(); await pg.wait_for_timeout(700)
        log("390 slide reasons", await txt(pg, '[data-card="you"] [data-rsn]'))
        await pg.locator('[data-card="you"]').screenshot(path=os.path.join(S, "d04_390_slide_rsn.png"))
        await pg.locator('[data-card="you"] [data-r="Lunch"]').click(); await pg.wait_for_timeout(500)
        await pg.locator('[data-card="you"] [data-pb]').click(); await pg.wait_for_timeout(300)
        await pg.locator('[data-card="you"] [data-focus]').click(); await pg.wait_for_timeout(800)
        await pg.screenshot(path=os.path.join(S, "d05_390_focus.png")); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(600)
        await all_on(pg); await pg.wait_for_timeout(600)
        await pg.locator('.idh [data-use="slide"]').click(); await pg.wait_for_timeout(300)  # slide was already on: all_on toggled it off, put it back
        log("390 you all22", await pg.locator('[data-card="you"] .cc').evaluate("e => e.className"))
        await pg.locator('[data-card="you"]').screenshot(path=os.path.join(S, "d06_390_you_all22.png"))
        await pg.locator('[data-card="phone"]').screenshot(path=os.path.join(S, "d07_390_phone_all22.png"))
        log("390 overflow after", await pg.evaluate("document.documentElement.scrollWidth"))
        await pg.click('.mk [data-th="ivory"]'); await pg.wait_for_timeout(300)
        el = pg.locator('[data-id="fixst"]'); await el.scroll_into_view_if_needed()
        await pg.locator('[data-card="fixst"] [data-pen]').click(); await pg.wait_for_timeout(300)
        await pg.locator('[data-card="fixst"] [data-fr]').evaluate("e => { e.value = 20; e.dispatchEvent(new Event('input', {bubbles: true})); }"); await pg.wait_for_timeout(400)
        await el.screenshot(path=os.path.join(S, "d08_390_fix.png"))
        await pg.click('#pk-open'); await pg.wait_for_timeout(200); await pg.screenshot(path=os.path.join(S, "d09_390_picks.png"))
        log("ERRORS", errs); await b.close()
asyncio.run(main())
