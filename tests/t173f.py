# Parsec 17.3 (F) — the operation's one running tech notes count as its story: no "write the story", no "punch without a note",
# no cause or correction missing in the checks. With the RO's road test off: the status reads Complete, there's a Release
# button, and Released from the status menu opens Release — no road test, no truck checks, no notes open on it (17.5).
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.pxSignedIn && __tg.pxSignedIn()"); await pg.wait_for_timeout(300)
        rid = await pg.evaluate("""(() => { const S = __tg.S(), r = S.ros.find(r => !r.shop && !r.dateClosed && r.operations.length === 1 && !S.punches.some(p => p.roId === r.id && !p.stop));
          const o = r.operations[0]; o.declined = false; o.cause = ''; o.correction = ''; o.log = []; (o.parts || []).forEach(p => p.status = 'Installed');
          o.work = 'Alternator output 12.1 V at idle. Replaced the alternator, charging 14.2 V now.<br>';
          S.punches = S.punches.filter(p => p.opId !== o.id); S.punches.push({ id: 'pz1', roId: r.id, opId: o.id, tech: 'Mike Rodriguez', start: new Date(Date.now() - 3600e3).toISOString(), stop: new Date(Date.now() - 600e3).toISOString(), startReason: 'Repairing', stopReason: 'Complete', notes: '' });
          o.jobStatus = { status: 'Complete', setAt: new Date().toISOString(), hand: true }; r.noRoadTest = true; r.status = { status: 'Complete – Road test', setAt: new Date().toISOString() };
          const U = __tg.UI(); U.view = 'ros'; U.selectedRo = r.id; __tg.render(); return r.id; })()""")
        await pg.wait_for_timeout(1500)
        g = await pg.evaluate("x => { const o = __tg.getRO(x).operations[0]; return [__tg.v141Gaps(o).length, __tg.opNoteGaps(o).length]; }", rid)
        ok(g == [0, 0], "the tech notes are the story: Complete asks nothing, no punch needs its own note (%s)" % g)
        ok(await pg.evaluate("document.querySelector('.rp-host .pgst').textContent.trim()") == "Complete", "no road test: the status reads Complete")
        bt = await pg.evaluate("(() => { const out = [...document.querySelectorAll('.rop-foot button')]; document.querySelectorAll('.jc-host').forEach(h => { if (h.shadowRoot) out.push(...h.shadowRoot.querySelectorAll('.rop-foot button')); }); return out.map(b => b.textContent.trim()); })()")
        ok("Release" in bt and "Road test" not in bt and "Truck checks" not in bt, "a Release button, no Road test or Truck checks (%s)" % bt)
        await pg.evaluate("document.querySelector('.rp-host .pgst').click()"); await pg.wait_for_timeout(400)
        await pg.get_by_text("Complete – Released", exact=True).last.click(); await pg.wait_for_timeout(600)
        d = await pg.evaluate("(() => { const t = document.querySelector('.tg-pop.rl'); return t ? [[...t.querySelectorAll('.tg-ck.no span, .tg-rwarn b')].map(x => x.textContent).join(' · '), t.innerText] : ['', '']; })()")
        ok(d[1] and "Release" in d[1] and not any(w in d[0] for w in ("oad test", "Truck checks", "otes", "Story")), "17.5: Released opens Release — nothing open about the road test, truck checks or notes (%r)" % d[0][:160])
        ok(await pg.evaluate("x => __tg.getRO(x).status.status", rid) != "Complete – Released", "…and nothing is released until it's answered")
        ok(not errs, "no page errors: %s" % errs[:2])
        await b.close()
    print("FAILS:", len(FAILS), FAILS)
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
