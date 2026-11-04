# Parsec 17.3 (H) — thirteen more themes (src/app/themes/more-themes.js): listed under "More themes" on the Settings page, each one
# recolours Ivory or Graphite through the --vv-* tokens, four draw a grid behind the page, switching back takes every colour off
# again, and a saved theme that no longer exists opens in Ivory or Graphite. No pinks, oranges, yellows, ambers, greens or reds as
# the background or the accent. Invented data only.
import asyncio, os, sys, colorsys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
def hue_ok(hx):
    r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5)); h, l, s = colorsys.rgb_to_hls(r, g, b)
    return s < .12 or 180 <= h * 360 <= 290   # a grey, or cyan · blue · indigo · violet
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.pxSignedIn && __tg.pxSignedIn()"); await pg.wait_for_timeout(300)
        await pg.evaluate("() => { const U = __tg.UI(); U.view = 'profile'; U.pxSec = 'me'; __tg.render(); }"); await pg.wait_for_timeout(600)
        tiles = await pg.evaluate("() => [...document.querySelectorAll('.sg-themes .px-tp')].map(b => b.dataset.v)")
        xs = [t for t in tiles if t.startswith("x-")]
        ok(len(tiles) == 17 and len(xs) == 13 and await pg.evaluate("!!document.querySelector('.sg-themes .sg-thh')"), "Settings lists the four themes and 13 more under More themes (%d, %d)" % (len(tiles), len(xs)))
        info = await pg.evaluate("ids => ids.map(id => { const t = __tg.THEMES[id]; return [id, t.dark, t.vars.canvas, t.vars.panel, t.vars.acc, !!t.grid]; })", xs) if await pg.evaluate("!!__tg.THEMES") else None
        if info is None:
            info = []
            for t in xs:
                await pg.click('.sg-themes [data-v="%s"]' % t); await pg.wait_for_timeout(150)
                info.append(await pg.evaluate("id => { const s = document.documentElement.style; return [id, document.documentElement.getAttribute('data-theme') === 'ivd', s.getPropertyValue('--vv-canvas'), s.getPropertyValue('--vv-panel'), s.getPropertyValue('--vv-acc'), document.documentElement.hasAttribute('data-th-grid')]; }", t))
        bad = [i[0] for i in info if not (hue_ok(i[2]) and hue_ok(i[3]) and hue_ok(i[4]))]
        ok(not bad, "no pink, orange, yellow, amber, green or red background or accent (%s)" % bad)
        ok(sum(1 for i in info if i[5]) == 4, "four themes draw a grid (%s)" % [i[0] for i in info if i[5]])
        # pick one through its tile: Graphite underneath, the colours on <html>, the RO page follows
        await pg.click('.sg-themes [data-v="x-blueprint"]'); await pg.wait_for_timeout(400)
        st = await pg.evaluate("() => { const de = document.documentElement; return [de.getAttribute('data-theme'), de.getAttribute('data-pal'), de.style.getPropertyValue('--vv-canvas'), de.hasAttribute('data-th-grid'), getComputedStyle(document.body).backgroundImage.slice(0, 15), localStorage.getItem('tec_theme'), localStorage.getItem('tec_theme_dark')]; }")
        ok(st[0] == "ivd" and st[1] == "vv" and st[2] == "#0a1d33" and st[3] and st[4].startswith("linear-gradient") and st[5] == "x-blueprint" and st[6] == "1", "Blueprint: Graphite with its own colours and the grid, saved (%s)" % st)
        await pg.evaluate("""() => { const S = __tg.S(), r = S.ros.find(r => !r.shop && !r.dateClosed && r.operations.length); const U = __tg.UI(); U.view = 'ros'; U.selectedRo = r.id; __tg.render(); }"""); await pg.wait_for_timeout(900)
        hb = await pg.evaluate("() => { const h = document.querySelector('.jc-host:not(.jc-band-host)'); return h ? [h.classList.contains('pal-vv'), h.classList.contains('dark-ui')] : null; }")
        ok(hb == [True, True], "the RO page takes the theme too (%s)" % hb)
        # back to Ivory: every colour comes off again
        await pg.evaluate("() => { __tg.applyTheme('ivl'); __tg.render(); }"); await pg.wait_for_timeout(300)
        cl = await pg.evaluate("() => { const de = document.documentElement; return [de.getAttribute('data-theme'), de.getAttribute('data-pal'), de.style.getPropertyValue('--vv-canvas'), de.style.getPropertyValue('--th-grid'), de.hasAttribute('data-th-grid')]; }")
        ok(cl == ["ivl", None, "", "", False], "back to Ivory, nothing of the theme is left on the page (%s)" % cl)
        # a saved theme that was deleted: opens in Graphite when it was dark
        await pg.evaluate("() => { localStorage.setItem('tec_theme_dark', '1'); __tg.applyTheme('x-gone'); }")
        gone = await pg.evaluate("() => [localStorage.getItem('tec_theme'), document.documentElement.getAttribute('data-theme')]")
        ok(gone == ["ivd", "ivd"], "a theme that is gone opens in Graphite (it was dark) (%s)" % gone)
        ok(not errs, "no page errors (%s)" % errs[:2])
        await b.close()
    print("\n%d failed" % len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
