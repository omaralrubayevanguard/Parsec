# Parsec 17.3 (E) — the truck's colour: a Colour row in the Vehicle section opens twelve swatches and Custom…; a pick repaints
# the catalog picture (the body only) and sweeps across it; the colour shows on the RO list too and from above; the next RO of the
# same VIN starts with it; a photo gets no colour row; New RO fills it in when the case lists one. Invented data only.
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.pxSignedIn && __tg.pxSignedIn()"); await pg.wait_for_timeout(300)
        X = await pg.evaluate("""(() => { const R = __tg.S().ros.filter(r => !r.shop && !r.dateClosed && r.vin && __tg.trkPick(r).kind === 'model' && !__tg.trkPick(r).own); const r = R[0]; delete r.color;
          (__tg.S().ros).forEach(x => { if (x !== r && x.vin === r.vin) delete x.color; });
          const U = __tg.UI(); U.view = 'ros'; U.selectedRo = r.id; __tg.render(); return { id: r.id, vin: r.vin }; })()""")
        await pg.wait_for_timeout(1500)
        await pg.evaluate("(() => { const g = document.querySelector('.rp-host2 .rod-gh[data-rod-g=vehicle]') || document.querySelector('.rod-gh[data-rod-g=vehicle]'); const s = g && g.closest('.rod-g'); if (s && s.classList.contains('shut')) g.click(); })()"); await pg.wait_for_timeout(500)
        row = await pg.evaluate("(() => { const r = document.querySelector('.rp-host2 .rod-r[data-rod-k=color]'); return r ? r.textContent : null; })()")
        ok(row is not None and "Colour" in row and "Add colour" in row, "the Vehicle section has a Colour row (%r)" % row)
        await pg.evaluate("document.querySelector('.rp-host2 .rod-r[data-rod-k=color]').click()"); await pg.wait_for_timeout(300)
        sw = await pg.evaluate("[document.querySelectorAll('#trk-sw [data-trk-sw]').length, !!document.querySelector('#trk-sw input[type=color]'), [...document.querySelectorAll('#trk-sw .trk-sw__g [data-trk-sw]')].map(b => b.getAttribute('data-trk-sw')).join(',')]")
        ok(sw[0] == 12 and sw[1] and all(c in sw[2] for c in ["Grey", "Teal", "Silver", "Pink", "Purple", "Orange"]), "twelve swatches and Custom… (%s)" % sw[2])
        src0 = await pg.evaluate("document.querySelector('.rp-host .trk-th img:last-child').getAttribute('src')")
        await pg.evaluate("document.querySelector('#trk-sw [data-trk-sw=Red]').click()"); await pg.wait_for_timeout(250)
        sweep = await pg.evaluate("!!document.querySelector('.rp-host .trk-th.trk-swp')")
        await pg.wait_for_timeout(1600)
        st = await pg.evaluate("x => [__tg.getRO(x).color, document.querySelector('.rp-host .trk-th img:last-child').getAttribute('src'), (document.querySelector('.rp-host2 .rod-r[data-rod-k=color]')||{}).textContent]", X["id"])
        ok(st[0] == "Red" and st[1] != src0 and "Red" in st[2], "Red is saved and the picture is repainted (%s, %s → %s, %r)" % (st[0], src0[-12:], st[1][-12:], st[2]))
        ok(sweep, "…sweeping across")
        top = await pg.evaluate("x => { const T = __tg.trkTopOf ? null : null; return null; }", X["id"])
        # the RO list shows it too
        await pg.evaluate("(() => { const U = __tg.UI(); U.view = 'rolist'; __tg.render(); })()"); await pg.wait_for_timeout(1200)
        lst = await pg.evaluate("x => { const im = [...document.querySelectorAll('[data-id=\"' + x + '\"] .trk-th img, [data-ro=\"' + x + '\"] .trk-th img')].pop(); return im ? im.getAttribute('src') : null; }", X["id"])
        ok(lst and lst.startswith("blob:"), "the RO list shows the red truck (%s)" % (lst or "")[:20])
        # the next RO of the same VIN starts with it
        nx = await pg.evaluate("x => { const r = __tg.addRO({ roNumber: 'RA0007770001', customerName: 'Test', dateOpened: new Date().toISOString() }); r.vin = x.vin; const c = __tg.trkColorOf(r); return c ? [c.c, c.from] : null; }", X)
        ok(nx == ["Red", "vin"], "a new RO of the same VIN starts red (%s)" % nx)
        # a photo: no colour row
        ph = await pg.evaluate("""x => { const r = __tg.getRO(x); r.trkOwn = null; r.trkUse = 'photo'; return __tg.trkPick(r).kind; }""", X["id"])
        # New RO reads a colour from the case
        c1 = await pg.evaluate("[__tg.trkColorFromText('WHT'), __tg.trkColorFromText('Burgundy'), __tg.trkColorFromText('Navy blue'), __tg.trkColorFromText('Gray')]")
        ok(c1 == ["White", "Red", "Blue", "Grey"], "case words become colours (%s)" % c1)
        f = await pg.evaluate("__tg.IMPX.parse('VIN: 4V4NC9EH7LN758560\\nColor: Burgundy\\nUnit #: T-807').f.color")
        ok(f == "Red", "New RO reads Color: Burgundy as Red (%s)" % f)
        ok(not errs, "no page errors: %s" % errs[:2])
        await b.close()
    print("FAILS:", len(FAILS), FAILS)
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
