import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); F = "file://" + H + "/pst.html"
fails = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: fails.append(m)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1500, "height": 1000}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto(F); await pg.wait_for_timeout(400)
        # default: Parts page, Summit (mixed) — least is the Ordered release bearing
        t = await pg.evaluate("(()=>{ const s=document.querySelector('.ro .pst'); return { lbl: s.querySelector('.pst-h .lbl').textContent, cur: s.querySelector('li.c .lb').textContent, done: s.querySelectorAll('li.d').length, held: (s.querySelector('.pst-held')||{}).textContent||'', pr: (s.querySelector('.pst-pr')||{}).textContent||'', hl: [...document.querySelectorAll('.tb tr.hl td:nth-child(2)')].map(x=>x.textContent) }; })()")
        print("  ", t)
        ok(t["cur"] == "Ordered" and "2 of 3 in hand" in await pg.evaluate("document.querySelector('.pst-h').textContent"), "mixed RO: the least part (Ordered) decides; 2 of 3 in hand")
        ok("Release bearing" in t["held"] and t["hl"] == ["Release bearing"], "held-by names it and its row is highlighted")
        ok("Thu 10/29" in t["pr"], "All in by Thu")
        # the track sits below the details
        ok(await pg.evaluate("(()=>{ const d=document.querySelector('.ro .dets'), s=document.querySelector('.ro .pst'); return !!(d.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING); })()"), "below the details")
        await pg.screenshot(path="shots/p1_parts_ivory.png")
        # click a stage → filter
        await pg.click('.ro .pst-t li:nth-child(3) .stp'); await pg.wait_for_timeout(150)
        vis = await pg.evaluate("[...document.querySelectorAll('.tb tbody tr')].filter(r=>getComputedStyle(r).display!=='none').map(r=>r.children[1].textContent)")
        ok(vis == ["Clutch kit 15.5in"], f"click Received → only its parts {vis}")
        await pg.click('[data-clr]'); await pg.wait_for_timeout(100)
        # backorder RO
        await pg.click('.na [data-sel="r2"]'); await pg.wait_for_timeout(150)
        t2 = await pg.evaluate("(()=>{ const s=document.querySelector('.ro .pst'); return [s.querySelector('li.c .lb').textContent, s.querySelector('li.c').className, s.querySelector('.pst-h .lbl').textContent, (s.querySelector('.pst-pr')||{}).textContent]; })()")
        ok(t2[0] == "Ordered" and "prob" in t2[1] and "backordered" in t2[2], f"backorder: Ordered step turns red {t2}")
        # own step
        await pg.click('[data-ch="bo"][data-v="own"]'); await pg.wait_for_timeout(150)
        ok(await pg.evaluate("document.querySelector('.ro .pst li.c .lb').textContent") == "Backordered", "Backordered as its own step")
        await pg.click('[data-ch="bo"][data-v="red"]')
        # no parts, all installed
        await pg.click('.na [data-sel="r7"]'); await pg.wait_for_timeout(100)
        ok("none on this RO" in await pg.evaluate("document.querySelector('.ro').textContent"), "no parts: one quiet line")
        await pg.click('.na [data-sel="r6"]'); await pg.wait_for_timeout(100)
        ok(await pg.evaluate("document.querySelectorAll('.ro .pst li.d').length") == 6 and "All installed" in await pg.evaluate("document.querySelector('.ro .pst').textContent"), "all installed: every step done")
        await pg.click('.na [data-sel="r4"]'); await pg.wait_for_timeout(100)
        ok("Wed–Fri" in await pg.evaluate("document.querySelector('.ro .pst li.c').textContent"), "ETA range under the step")
        await pg.screenshot(path="shots/p2_eta.png")
        # styles
        for st in ["pill", "lanes"]:
            await pg.click(f'[data-ch="style"][data-v="{st}"]'); await pg.wait_for_timeout(150)
            await pg.click('.na [data-sel="r3"]'); await pg.wait_for_timeout(100)
            await pg.screenshot(path=f"shots/p3_{st}.png")
        await pg.click('[data-ch="style"][data-v="steps"]')
        for w in ["top", "next"]:
            await pg.click(f'[data-ch="where"][data-v="{w}"]'); await pg.wait_for_timeout(100); await pg.screenshot(path=f"shots/p4_{w}.png")
        await pg.click('[data-ch="where"][data-v="below"]')
        # foreman
        await pg.click('.mk [data-page="fm"]'); await pg.wait_for_timeout(150)
        ok(await pg.evaluate("document.querySelectorAll('.na .rp').length") >= 6, "Foreman rows carry the stage pill")
        await pg.screenshot(path="shots/f1_fm_ivory.png")
        await pg.click('[data-ch="fm"][data-v="both"]'); await pg.wait_for_timeout(150)
        ok(await pg.evaluate("document.querySelectorAll('.ro .pst').length") == 2, "Foreman: both tracks")
        await pg.screenshot(path="shots/f2_fm_both.png")
        await pg.click('.ro .pst-t li:nth-child(2) .stp'); await pg.wait_for_timeout(150)
        ok(await pg.evaluate("!!document.querySelector('.ro .fbar')"), "Foreman: clicking a parts stage lists its parts")
        await pg.click('[data-ch="fm"][data-v="parts"]')
        # themes
        for th in ["graphite", "white", "black"]:
            await pg.click(f'.mk [data-th="{th}"]'); await pg.wait_for_timeout(120); await pg.screenshot(path=f"shots/f3_{th}.png")
        await pg.click('.mk [data-page="parts"]'); await pg.click('.mk [data-th="graphite"]'); await pg.wait_for_timeout(120); await pg.screenshot(path="shots/p5_graphite.png")
        await pg.click('.mk [data-th="ivory"]')
        # phone preview
        await pg.click('.mk [data-dev="phone"]'); await pg.wait_for_timeout(150); await pg.screenshot(path="shots/p6_phone_preview.png")
        await pg.click('.mk [data-dev="desk"]')
        # picks
        await pg.click('#pk-open'); await pg.wait_for_timeout(100)
        txt = await pg.evaluate("document.querySelector('#picks pre').textContent"); print(txt)
        ok("Track style: Steps, like the Warranty page" in txt and "Where it sits: Below the details" in txt, "picks text")
        await pg.click('[data-ch="xt"][data-v="opmini"]'); await pg.wait_for_timeout(100)
        ok("Each operation gets its own mini stage" in await pg.evaluate("document.querySelector('#picks pre').textContent"), "picks follow the choices")
        await pg.fill('#pk-note', 'test note'); ok("Notes: test note" in await pg.evaluate("document.querySelector('#picks pre').textContent"), "note goes in")
        await pg.screenshot(path="shots/p7_picks.png")
        # a real 390 px screen
        m = await b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True); mp = await m.new_page(); mp.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await mp.route("**/fonts.g*/**", lambda r: r.abort()); await mp.goto(F); await mp.wait_for_timeout(400)
        ov = await mp.evaluate("document.documentElement.scrollWidth"); ok(ov <= 391, f"390 px: no sideways scroll ({ov})")
        await mp.screenshot(path="shots/m1_390.png", full_page=False)
        await mp.evaluate("document.querySelector('.ro').scrollIntoView()"); await mp.wait_for_timeout(100); await mp.screenshot(path="shots/m2_390_ro.png")
        await mp.evaluate("document.querySelector('.ro .pst').scrollIntoView({block:'center'})"); await mp.wait_for_timeout(100); await mp.screenshot(path="shots/m3_390_track.png")
        print("ERRORS", errs); ok(not errs, "no page errors")
        print("FAILS", len(fails), fails); await b.close()
asyncio.run(main())
