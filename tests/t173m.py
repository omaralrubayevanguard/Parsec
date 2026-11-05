# Parsec 17.3 (M) — the RO page: the Customer tab is gone from the box above the operations (Messages only; the customer's
# fields are the right column's Customer group), and Warranty RO is a switch under "Road test before release". Invented data only.
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
R = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.pxSignedIn && __tg.pxSignedIn()"); await pg.wait_for_timeout(300)
        rid = await pg.evaluate("() => { const r = __tg.S().ros.find(r => !r.shop && !r.dateClosed && r.operations.length && !r.warranty); const U = __tg.UI(); U.view = 'ros'; U.selectedRo = r.id; __tg.render(); return r.id; }"); await pg.wait_for_timeout(1200)
        m = await pg.evaluate(f"(() => {{ const r = {R}, mc = r.querySelector('.rop-mc'); return {{ box: !!mc, tabs: mc ? mc.querySelectorAll('[role=tab]').length : -1, head: mc ? (mc.querySelector('.rop-mc__h h3') || {{}}).textContent : '', cus: !!r.querySelector('.rop-k-customer'), chat: !!(mc && mc.querySelector('.rop-chat')), grp: !!(r.querySelector('.rod-gh[data-rod-g=customer]') || document.querySelector('.rod-gh[data-rod-g=customer]')) }}; }})()")
        ok(m == {"box": True, "tabs": 0, "head": "Messages", "cus": False, "chat": True, "grp": True}, "the box above the operations is Messages only; the Customer group stays in the right column (%s)" % m)
        f = await pg.evaluate(f"(() => {{ const r = {R}, L = [...r.querySelectorAll('.rop-foot .rtt-l')].map(e => e.textContent); return L; }})()")
        ok(len(f) == 2 and f[0].startswith("Road test") and f[1] == "Warranty RO", "Warranty RO sits under Road test before release (%s)" % f)
        await pg.evaluate(f"(() => {{ const r = {R}; r.querySelector('.rop-wrt .rtt-sw').click(); }})()"); await pg.wait_for_timeout(500)
        w = await pg.evaluate(f"id => [__tg.S().ros.find(r => r.id === id).warranty, ({R}.querySelector('.rop-wrt .rtt-sw') || {{}}).getAttribute('aria-checked')]", rid)
        ok(w == [True, "true"], "the switch makes it a warranty RO (%s)" % w)
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(400)
        w2 = await pg.evaluate("id => !!__tg.S().ros.find(r => r.id === id).warranty", rid)
        ok(w2 is False, "Undo takes it back")
        ok(not errs, "no page errors (%s)" % errs[:2])
        await b.close()
    print("\n%d failed" % len(FAILS) if FAILS else "\nall passed")
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
