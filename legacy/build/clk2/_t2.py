import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(H, "shots")
LOG = []
def log(*a): LOG.append(" ".join(str(x) for x in a)); print(*a, flush=True)
async def tile(pg, k, name):
    el = pg.locator(f'[data-id="{k}"]'); await el.scroll_into_view_if_needed(); await el.screenshot(path=os.path.join(S, name))
async def txt(pg, sel): return (await pg.locator(sel).first.inner_text()).replace("\n", " | ")
async def drag(pg, hsel, frac, steps=12):
    h = pg.locator(hsel).first; await h.scroll_into_view_if_needed(); hb = await h.bounding_box()
    tr = await pg.locator(hsel).first.evaluate("e => { const r = e.parentNode.getBoundingClientRect(); return [r.x, r.width]; }")
    x0 = hb["x"] + hb["width"] / 2; y0 = hb["y"] + hb["height"] / 2; x1 = tr[0] + 4 + hb["width"] / 2 + (tr[1] - hb["width"] - 8) * frac
    await pg.mouse.move(x0, y0); await pg.mouse.down()
    for i in range(1, steps + 1): await pg.mouse.move(x0 + (x1 - x0) * i / steps, y0); await pg.wait_for_timeout(16)
    return
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1500, "height": 1000}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/clk2.html"); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=os.path.join(S, "b01_load.png"))
        # parts: replay so the arrival happens at a known moment
        await pg.click('[data-replay="parts"]'); await pg.wait_for_timeout(300)
        log("parts before", await txt(pg, '[data-card="parts"] [data-extra]'))
        # nudge: replay so the pill comes at +10 s
        await pg.click('[data-replay="nudge"]')
        # fix the start
        await pg.locator('[data-card="fixst"] [data-pen]').click(); await pg.wait_for_timeout(300)
        await pg.locator('[data-card="fixst"] [data-fr]').evaluate("e => { e.value = 15; e.dispatchEvent(new Event('input', {bubbles: true})); }")
        await pg.wait_for_timeout(500); await tile(pg, "fixst", "b02_fix_scrub.png")
        log("fix", await txt(pg, '[data-card="fixst"] [data-lbl]'), "/", await txt(pg, '[data-card="fixst"] [data-big]'), "/", await txt(pg, '[data-card="fixst"] [data-fix]'))
        # drag the real slider with the mouse too
        r = pg.locator('[data-card="fixst"] [data-fr]'); rb = await r.bounding_box()
        await pg.mouse.move(rb["x"] + rb["width"] * .75, rb["y"] + rb["height"] / 2); await pg.mouse.down(); await pg.mouse.move(rb["x"] + rb["width"] * .5, rb["y"] + rb["height"] / 2, steps=6); await pg.mouse.up()
        log("fix drag", await r.evaluate("e => e.value"), await txt(pg, '[data-card="fixst"] [data-fv]'))
        await pg.locator('[data-card="fixst"] [data-fs]').click(); await pg.wait_for_timeout(200)
        log("toast", await txt(pg, '.toast'), "| label", await txt(pg, '[data-card="fixst"] [data-lbl]'))
        # lap marks
        await pg.locator('[data-card="lap"] [data-lap]').click(); await pg.wait_for_timeout(450)
        await tile(pg, "lap", "b03_lap.png"); log("lap", await txt(pg, '[data-card="lap"] .laps'), "| toast", await txt(pg, '.toast'))
        # parts arrive (6 s after replay)
        await pg.wait_for_timeout(3500)
        await tile(pg, "parts", "b04_parts_in.png"); log("parts after", await txt(pg, '[data-card="parts"] [data-extra]'), "shim", await pg.locator('[data-card="parts"] [data-pb]').evaluate("e => e.className"))
        # hold to stop on Your card -> reasons -> Switched job -> next up
        pb = pg.locator('[data-card="you"] [data-pb]'); await pb.scroll_into_view_if_needed(); bb = await pb.bounding_box()
        await pg.mouse.move(bb["x"] + 20, bb["y"] + 20); await pg.mouse.down(); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(S, "b05_holding.png"), clip={"x": 0, "y": 0, "width": 1500, "height": 560})
        await pg.wait_for_timeout(600); await pg.mouse.up(); await pg.wait_for_timeout(500)
        log("you rsn", await txt(pg, '[data-card="you"] [data-rsn]'))
        await pg.locator('[data-card="you"] [data-r="Switched job"]').click(); await pg.wait_for_timeout(600)
        await pg.locator('[data-card="you"]').screenshot(path=os.path.join(S, "b06_you_next.png"))
        log("you next visible", await pg.locator('[data-card="you"] [data-next]').is_visible())
        await pg.locator('[data-card="you"] [data-pb]').click(); await pg.wait_for_timeout(300)
        log("you running again", await pg.locator('[data-card="you"] .cc').evaluate("e => e.className"))
        # slide: let go early -> snaps back
        await drag(pg, '[data-card="slide"] [data-slh]', .5); await pg.wait_for_timeout(100)
        await tile(pg, "slide", "b07_slide_half.png"); await pg.mouse.up(); await pg.wait_for_timeout(600)
        log("slide after early release: run=", await pg.locator('[data-card="slide"] .cc').evaluate("e => e.classList.contains('run')"), "x=", await pg.locator('[data-card="slide"] [data-sl]').evaluate("e => e.style.getPropertyValue('--x')"))
        await drag(pg, '[data-card="slide"] [data-slh]', 1.0); await pg.mouse.up(); await pg.wait_for_timeout(700)
        await tile(pg, "slide", "b08_slide_done.png"); log("slide reasons", await txt(pg, '[data-card="slide"] [data-rsn]'))
        # nudge pill (10 s after replay)
        await pg.wait_for_timeout(1500)
        await tile(pg, "nudge", "b09_nudge.png"); log("nudge", await txt(pg, '[data-card="nudge"] [data-extra]'))
        await pg.locator('[data-card="nudge"] [data-nopen]').first.click(); await pg.wait_for_timeout(300)
        await pg.locator('[data-card="nudge"] [data-ni]').fill("Torqued V-band clamps to spec"); await pg.wait_for_timeout(200)
        await tile(pg, "nudge", "b10_nudge_field.png")
        await pg.locator('[data-card="nudge"] [data-ni]').press("Enter"); await pg.wait_for_timeout(300)
        log("note saved", await txt(pg, '[data-card="nudge"] [data-note]'), "| pill", await txt(pg, '[data-card="nudge"] [data-extra]'), "| toast", await txt(pg, '.toast'))
        # next up via Complete
        await pg.click('[data-act="complete"][data-k="next"]'); await pg.wait_for_timeout(500)
        await tile(pg, "next", "b11_next.png"); log("next", await txt(pg, '[data-card="next"] [data-next]'))
        await pg.locator('[data-card="next"] [data-nxs]').click(); await pg.wait_for_timeout(200); log("next start toast", await txt(pg, '.toast'))
        # done badge
        await pg.click('[data-act="complete"][data-k="badge"]'); await pg.wait_for_timeout(380)
        await tile(pg, "badge", "b12_badge_pop.png"); await pg.wait_for_timeout(900)
        await tile(pg, "badge", "b13_badge.png"); log("badge", await txt(pg, '[data-card="badge"] [data-extra]'))
        # focus mode
        await pg.locator('[data-card="focus"] [data-focus]').click(); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(S, "b14_focus_mid.png")); await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(S, "b15_focus.png"))
        log("focus open", await pg.locator('.fx').count(), await txt(pg, '.fx [data-fl]'))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(250)
        await pg.screenshot(path=os.path.join(S, "b16_focus_closing.png")); await pg.wait_for_timeout(400)
        log("focus closed", await pg.locator('.fx').count())
        # focus on Your card, hold to stop inside it, pick a reason
        await pg.locator('[data-card="you"] [data-focus]').click(); await pg.wait_for_timeout(800)
        fb = await pg.locator('.fx [data-fpb]').bounding_box(); await pg.mouse.move(fb["x"] + 50, fb["y"] + 50); await pg.mouse.down(); await pg.wait_for_timeout(350)
        await pg.screenshot(path=os.path.join(S, "b17_focus_hold.png")); await pg.wait_for_timeout(500); await pg.mouse.up(); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(S, "b18_focus_reasons.png"))
        await pg.locator('.fx [data-r="Waiting – Parts"]').click(); await pg.wait_for_timeout(700)
        log("after focus reason: fx", await pg.locator('.fx').count(), "you", await pg.locator('[data-card="you"] .cc').evaluate("e => e.className"))
        await pg.locator('[data-card="you"]').screenshot(path=os.path.join(S, "b19_you_wait.png"))
        await pg.locator('[data-card="you"] [data-pb]').click(); await pg.wait_for_timeout(200)
        # tap the time (round 1) still flips cleanly
        await pg.locator('[data-card="you"] [data-big]').click(); await pg.wait_for_timeout(500)
        await pg.locator('[data-card="you"]').screenshot(path=os.path.join(S, "b20_you_left.png")); await pg.locator('[data-card="you"] [data-big]').click()
        # lunch (20 s after load for the demo; replay to be sure)
        await pg.click('[data-replay="lunch"]'); await pg.click('[data-replay="band"]'); await pg.click('[data-replay="upace"]')
        await pg.wait_for_timeout(10000); await tile(pg, "lunch", "b21_lunch_before.png"); log("lunch before", await txt(pg, '[data-card="lunch"] .facts'))
        await pg.wait_for_timeout(11000); await tile(pg, "lunch", "b22_lunch_dim.png"); log("lunch dim", await txt(pg, '[data-card="lunch"] [data-dim]'), "| band", await txt(pg, '[data-card="band"] .facts'))
        await pg.wait_for_timeout(21000); await tile(pg, "lunch", "b23_lunch_back.png"); log("lunch back", await txt(pg, '[data-card="lunch"] .facts'), "|", await txt(pg, '[data-card="lunch"] [data-extra]'), "run", await pg.locator('[data-card="lunch"] .cc').evaluate("e => e.classList.contains('run')"))
        await tile(pg, "band", "b24_band_out.png"); await tile(pg, "upace", "b25_upace_past.png"); log("upace", await txt(pg, '[data-card="upace"] .facts'))
        # ×600: the day fills
        await pg.click('[data-speed="600"]'); await pg.wait_for_timeout(5000)
        await tile(pg, "day", "b26_day_fast.png"); await pg.locator('[data-card="you"]').screenshot(path=os.path.join(S, "b27_you_fast.png")); log("you fast", await txt(pg, '[data-card="you"] .facts'))
        await pg.click('[data-speed="1"]')
        # picks text
        await pg.click('#pk-open'); await pg.wait_for_timeout(200); log("PICKS\n" + await pg.locator('#picks pre').inner_text())
        await pg.click('[data-pk="x"]')
        # dark theme
        await pg.click('.mk [data-th="graphite"]'); await pg.wait_for_timeout(400); await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(S, "b28_graphite.png"))
        log("ERRORS", errs); await b.close()
        open(os.path.join(H, "_t2.log"), "w").write("\n".join(LOG))
asyncio.run(main())
