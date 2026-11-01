# Parsec 17.1 (B) — the side bar: press and hold a page, drag it, a switch hides it (the name menu keeps it), the shop's order
# and each person's own; Time Log and Career as tabs on each department page (everyone their own; Career for the people who
# clock on ROs; “See other people’s time” for the foreman and the manager); Manager › Team opens a person's time; Fleets.
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_a.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)

RAIL = "[...document.querySelectorAll('.px-rail .pxr-nav > [data-view]')].map(b=>b.dataset.view)"
TABS = "[...document.querySelectorAll('.main .dp-tabs > h1, .main .dp-tabs > button')].map(b=>(b.tagName==='H1'?'*':'')+b.textContent.trim())"
LIT = "((document.querySelector('.px-rail [aria-current=page]')||{}).dataset||{}).view"
def GO(v): return f"(()=>{{ const U=__tg.UI(); U.view='{v}'; __tg.render(); }})()"
def ROLE(r): return f"__tg.staffList().filter(s=>s.role==='{r}')[0].id"

async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); })()")
        await pg.evaluate(GO('rolist')); await pg.wait_for_timeout(500)
        r0 = await pg.evaluate(RAIL)
        ok("timelog" not in r0 and "career" not in r0, f"Time Log and Career are off the side bar ({r0})")
        ok("fleets" in r0 and r0.index("fleets") > r0.index("inventory"), "Fleets is a page of its own, after Inventory")
        # ---- press and hold Library, drag it to the top
        bb = await (await pg.query_selector(".px-rail .pxr-nav > [data-view=library]")).bounding_box()
        top = await (await pg.query_selector(".px-rail .pxr-nav > [data-view]")).bounding_box()
        await pg.mouse.move(bb["x"] + 40, bb["y"] + 18); await pg.mouse.down(); await pg.wait_for_timeout(200)
        ok(not await pg.evaluate("!!document.querySelector('.px-rail.px-arr')"), "a short press doesn't start arranging")
        await pg.wait_for_timeout(450)
        ok(await pg.evaluate("!!document.querySelector('.px-rail.px-arr .pxa-row.drag')"), "holding starts arranging, the page in hand")
        for i in range(10):
            await pg.mouse.move(bb["x"] + 40, bb["y"] + 18 - (bb["y"] - top["y"] + 10) * (i + 1) / 10); await pg.wait_for_timeout(30)
        await pg.mouse.up(); await pg.wait_for_timeout(300)
        r1 = await pg.evaluate(RAIL)
        ok(r1[0] == "library" and len(r1) == len(r0), f"Library dropped at the top, nothing lost ({r1[:3]})")
        ok(await pg.evaluate("__tg.UI().view") == "rolist", "the drop didn't open the page")
        ok(await pg.evaluate("__tg.STATE().mgSet.navMe.order[0]") == "library", "the order is saved at the drop")
        # ---- hide a page; the name menu keeps it
        await pg.click(".pxa-sw[data-view=fixes]"); await pg.wait_for_timeout(200)
        ok(await pg.evaluate("document.querySelector('.pxa-sw[data-view=fixes]').getAttribute('aria-checked')") == "false", "the switch turns Fixes off")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        r2 = await pg.evaluate(RAIL)
        ok("fixes" not in r2 and not await pg.evaluate("!!document.querySelector('.px-rail.px-arr')"), "Esc ends arranging; Fixes is off the side bar")
        await pg.click(".pxr-me"); await pg.wait_for_timeout(250)
        ok(await pg.evaluate("!!document.querySelector('.pxr-pop.me [data-action=nav][data-view=fixes]')"), "the name menu lists Fixes")
        await pg.click(".pxr-pop.me [data-action=nav][data-view=fixes]"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("__tg.UI().view") == "fixes", "one click opens it")
        # ---- the shop's order; a technician follows it, then arranges their own
        await pg.click(".pxr-me"); await pg.wait_for_timeout(200); await pg.click("[data-action=px-arr-start]"); await pg.wait_for_timeout(250)
        await pg.click("[data-action=px-arr-shop]"); await pg.wait_for_timeout(250); await pg.click("[data-action=px-arr-done]"); await pg.wait_for_timeout(200)
        ok(await pg.evaluate("__tg.STATE().mgSet.nav.order[0]") == "library", "Make this the shop’s order")
        tech = await pg.evaluate(ROLE('Technician'))
        await pg.evaluate(SIGN(tech)); await pg.evaluate(GO('tech')); await pg.wait_for_timeout(400)
        rt = await pg.evaluate(RAIL)
        ok(rt[0] == "library" and "fixes" in rt, f"a technician gets the shop's order, and their own pages ({rt})")
        await pg.click(".pxr-me"); await pg.wait_for_timeout(200); await pg.click("[data-action=px-arr-start]"); await pg.wait_for_timeout(250)
        ok(not await pg.evaluate("!!document.querySelector('[data-action=px-arr-shop]')"), "only the manager sets the shop's order")
        await pg.focus(".pxa-row[data-view=library]"); await pg.keyboard.press("ArrowDown"); await pg.wait_for_timeout(250)
        rt2 = await pg.evaluate(RAIL)
        ok(rt2[1] == "library", f"↓ moves the page in focus ({rt2[:3]})")
        own = await pg.evaluate(f"__tg.staffList().find(s=>s.id==='{tech}').nav.order.indexOf('library')")
        ok(own > 0, "their own order is on their record")
        await pg.click("[data-action=px-arr-reset]"); await pg.wait_for_timeout(250); await pg.click("[data-action=px-arr-done]"); await pg.wait_for_timeout(200)
        ok((await pg.evaluate(RAIL))[0] == "library", "Back to the shop’s order")
        # ---- Time Log and Career on the department page
        await pg.evaluate(GO('tech')); await pg.wait_for_timeout(400)
        t = await pg.evaluate(TABS)
        ok(t == ["*Technician", "Time Log", "Career"], f"the title is the tabs: {t}")
        await pg.click(".main .dp-tabs [data-view=timelog]"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("__tg.UI().view") == "timelog" and await pg.evaluate(LIT) == "tech", "Time Log opens; Technician stays lit")
        ok(await pg.evaluate("!!document.querySelector('[data-pg=timelog] .tk-who.st')") and not await pg.evaluate("!!document.querySelector('[data-pg=timelog] .tg-views [data-v=shop]')"), "a technician sees only their own time")
        await pg.click(".main .dp-tabs [data-view=career]"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("__tg.UI().view") == "career" and not await pg.evaluate("!!document.querySelector('[data-pg=career] select[data-who]')"), "Career: their own, no picker")
        parts = await pg.evaluate(ROLE('Parts'))
        await pg.evaluate(SIGN(parts)); await pg.evaluate("(()=>{ __tg.UI().dHome=null; })()"); await pg.evaluate(GO('parts')); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(TABS) == ["*Parts", "Time Log"], "Parts gets Time Log, no Career")
        ok(not await pg.evaluate("__tg.navAllowed('career')"), "Career isn't open to Parts")
        sw = await pg.evaluate(ROLE('Service writer'))
        await pg.evaluate(SIGN(sw)); await pg.evaluate("(()=>{ __tg.UI().dHome=null; })()"); await pg.evaluate(GO('timelog')); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(LIT) == "triage" and await pg.evaluate(TABS) == ["Triage", "*Time Log"], "a service writer's Time Log sits on Triage")
        # ---- the foreman and the manager see other people's time
        fm = await pg.evaluate(ROLE('Foreman'))
        await pg.evaluate(SIGN(fm)); await pg.evaluate(GO('timelog')); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("!!document.querySelector('[data-pg=timelog] .tg-views [data-v=shop]')"), "the foreman can see the whole shop")
        mg = await pg.evaluate(ROLE('Manager'))
        await pg.evaluate(SIGN(mg)); await pg.evaluate(GO('manager')); await pg.wait_for_timeout(400)
        await pg.click("[data-pg=manager] .tg-views [data-v=team]"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const r=[...document.querySelectorAll('[data-pg=manager] [data-a=person]')].find(x=>/Technician/.test(x.textContent)); r && r.click(); })()"); await pg.wait_for_timeout(300)
        who = await pg.evaluate("(document.querySelector('[data-pg=manager] .mq-pane h2')||{}).textContent")
        await pg.click("[data-pg=manager] .mq-time [data-a=ptime][data-v=sheet]"); await pg.wait_for_timeout(500)
        shown = await pg.evaluate("(document.querySelector('[data-pg=timelog] .tg-head .tk-who')||{}).textContent||''")
        ok(await pg.evaluate("__tg.UI().view") == "timelog" and who and who in shown and await pg.evaluate(LIT) == "manager", f"Team › {who} › Timesheet opens their Time Log ({shown})")
        ok(await pg.evaluate("((document.querySelector('[data-pg=timelog] .tg-views [aria-selected=true], [data-pg=timelog] .tg-views .on')||{}).textContent||'').trim()") == "Timesheet", "on the Timesheet, to sign")
        await pg.evaluate(GO('manager')); await pg.wait_for_timeout(300)
        await pg.click("[data-pg=manager] .mq-time [data-a=pcar]"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("__tg.UI().view") == "career" and await pg.evaluate("!!document.querySelector('[data-pg=career] select[data-who]')"), "and their Career")
        ok(await pg.evaluate("__tg.PERM_ACTS.some(g=>g[1].some(a=>a[0]==='t.others'))") and not await pg.evaluate("__tg.PERM_PAGES.some(p=>p[0]==='timelog'||p[0]==='career')"), "page access: the two switches gone, “See other people’s time” added")
        ok(not errs, f"no page errors ({errs[:3]})")
        await b.close()
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
