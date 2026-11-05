# Parsec 17.3 (L) — one person's page on Admin › People (src/app/access/admin-page/person-page.js): the top says what's
# changed from the role with Back to the role, the Sign-in card is at the top, three tabs (Pages tiles · What they can do ·
# Activity); Role · On · Off on each action, a changed row has a dot, the role's value and ↺; a role change asks first and
# lists what it adds and takes away; Settings › People & access links to each person's page. Invented data only.
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
A = "[data-pg=admin] "
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.pxSignedIn && __tg.pxSignedIn()"); await pg.wait_for_timeout(300)
        await pg.evaluate("() => { const U = __tg.UI(); U.view = 'admin'; __tg.render(); }"); await pg.wait_for_timeout(700)
        D = await pg.evaluate("__tg.staffList().filter(s => s.role === 'Technician')[0].id")
        await pg.click(A + ".adm-pr[data-id='%s']" % D); await pg.wait_for_timeout(300)
        st = await pg.evaluate("""() => { const p = document.querySelector('[data-pg=admin] .adm-pane'), kids = [...p.children].map(e => e.className);
          return { sign: kids.indexOf('adm-card adm-sign'), tabs: kids.indexOf('adm-card adm-pcard'), nt: p.querySelectorAll('.adm-tab').length, tiles: p.querySelectorAll('.adm-tile').length,
            icons: p.querySelectorAll('.adm-tile .adm-tic svg').length, chg: !!p.querySelector('.adm-pchg') }; }""")
        ok(st["sign"] >= 0 and st["sign"] < st["tabs"] and st["nt"] == 3 and st["tiles"] == 12 and st["icons"] >= 10 and not st["chg"],
           "the page: Sign-in card above three tabs; Pages shows a tile per page with its icon; no changes yet (%s)" % st)
        # a page for one person: tile on, a dot and what the role says
        await pg.click(A + ".adm-tile[data-k=foreman]"); await pg.wait_for_timeout(300)
        t = await pg.evaluate("""id => { const sf = __tg.staffList().find(s => s.id === id), e = document.querySelector('[data-pg=admin] .adm-tile[data-k=foreman]');
          return [__tg.permHas(sf, 'pages', 'foreman'), sf.ov.pages.foreman, e.classList.contains('on'), e.classList.contains('ov'), (e.querySelector('small') || {}).textContent, (document.querySelector('[data-pg=admin] .adm-pchg') || {}).textContent]; }""", D)
        ok(t[0] and t[1] is True and t[2] and t[3] and t[4] == "Technician: off" and "1 changed from the Technician role" in (t[5] or ""), "a tile turns a page on for one person, with a dot and the role's value; the top says 1 changed (%s)" % t)
        # Role · On · Off
        await pg.click(A + "[data-a=ptab][data-v=acts]"); await pg.wait_for_timeout(300)
        n3 = await pg.evaluate("document.querySelectorAll('[data-pg=admin] .adm-seg3').length")
        ok(n3 == 18, "What they can do: Role · On · Off on every action (%d)" % n3)
        await pg.click(A + ".adm-s3[data-k='p.order'][data-v=on]"); await pg.wait_for_timeout(300)
        r = await pg.evaluate("""id => { const sf = __tg.staffList().find(s => s.id === id), row = document.querySelector('[data-pg=admin] .adm-s3[data-k="p.order"][data-v=on]').closest('.adm-ar');
          return [__tg.permHas(sf, 'acts', 'p.order'), row.classList.contains('ov'), !!row.querySelector('.adm-dot'), (row.querySelector('.adm-rs') || {}).textContent, !!row.querySelector('.adm-rb'),
            row.querySelector('.adm-s3[data-v=on]').getAttribute('aria-pressed'), row.querySelector('.adm-s3[data-v=role]').getAttribute('aria-pressed')]; }""", D)
        ok(r == [True, True, True, "Technician: off", True, "true", "false"], "On: Order parts for this person alone — dot, “Technician: off”, ↺, On lit (%s)" % r)
        same = await pg.evaluate("id => { const sf = __tg.staffList().find(s => s.id === id); return Object.keys(sf.ov.acts).length; }", D)
        await pg.click(A + ".adm-s3[data-k='t.own'][data-v=on]"); await pg.wait_for_timeout(300)
        same2 = await pg.evaluate("id => { const sf = __tg.staffList().find(s => s.id === id); return Object.keys(sf.ov.acts).length; }", D)
        ok(same == same2 == 1, "On where the role already says on changes nothing — they follow the role (%s, %s)" % (same, same2))
        await pg.click(A + ".adm-rb[data-k='p.order']"); await pg.wait_for_timeout(300)
        r2 = await pg.evaluate("id => { const sf = __tg.staffList().find(s => s.id === id); return [__tg.permHas(sf, 'acts', 'p.order'), __tg.permChanged(sf, 'acts', 'p.order'), __tg.permChangedN(sf)]; }", D)
        ok(r2 == [False, False, 1], "↺ puts back just that one; the page change stays (%s)" % r2)
        # a role change asks first
        await pg.select_option(A + "select[data-ch=role]", "Foreman"); await pg.wait_for_timeout(400)
        ask = await pg.evaluate("() => { const w = document.querySelector('.pgask:not(.mx-out)'); return w ? w.innerText : ''; }")
        role0 = await pg.evaluate("id => __tg.staffList().find(s => s.id === id).role", D)
        ok("Make " in ask and "Foreman?" in ask and "+ Can" in ask and "approve timesheets" in ask and role0 == "Technician", "a new role asks first and lists what it adds — nothing changes yet (%s…)" % ask[:90].replace("\n", " | "))
        await pg.click(".pgask:not(.mx-out) [data-ask=no]"); await pg.wait_for_timeout(300)
        r3 = await pg.evaluate("id => [__tg.staffList().find(s => s.id === id).role, document.querySelector('[data-pg=admin] select[data-ch=role]').value]", D)
        ok(r3 == ["Technician", "Technician"], "Cancel leaves the role as it was (%s)" % r3)
        await pg.select_option(A + "select[data-ch=role]", "Foreman"); await pg.wait_for_timeout(400)
        await pg.click(".pgask:not(.mx-out) [data-ask=go]"); await pg.wait_for_timeout(400)
        r4 = await pg.evaluate("id => { const sf = __tg.staffList().find(s => s.id === id); return [sf.role, __tg.permChangedN(sf), __tg.permHas(sf, 'acts', 't.approve')]; }", D)
        ok(r4 == ["Foreman", 0, True], "Make Foreman: the role's actions, and the Foreman page they'd been given isn't a change any more (%s)" % r4)
        # Activity
        await pg.click(A + "[data-a=ptab][data-v=log]"); await pg.wait_for_timeout(300)
        lg = await pg.evaluate("[...document.querySelectorAll('[data-pg=admin] .adm-plr span')].map(e => e.textContent)")
        ok(len(lg) >= 3 and any("Foreman" in x and "was Technician" in x for x in lg) and any("Order parts" in x for x in lg), "Activity lists the changes made to them (%s)" % lg[:4])
        # Back to the role
        await pg.click(A + "[data-a=ptab][data-v=pages]"); await pg.click(A + ".adm-tile[data-k=manager]"); await pg.wait_for_timeout(300)
        await pg.click(A + ".adm-pchg [data-a=back]"); await pg.wait_for_timeout(300)
        r5 = await pg.evaluate("id => __tg.permChangedN(__tg.staffList().find(s => s.id === id))", D)
        ok(r5 == 0, "Back to the role clears their own changes (%s)" % r5)
        # Settings › People & access links to the page
        await pg.evaluate("() => { const U = __tg.UI(); U.view = 'profile'; U.pxSec = 'people'; __tg.render(); }"); await pg.wait_for_timeout(600)
        L = await pg.evaluate("document.querySelectorAll('.sg-plr[data-action=px-sg-person]').length")
        F = await pg.evaluate("__tg.staffList().filter(s => s.role === 'Foreman' && s.id !== '%s')[0].id" % D)
        await pg.click(".sg-plr[data-person='%s']" % F); await pg.wait_for_timeout(500)
        r6 = await pg.evaluate("() => [__tg.UI().view, (document.querySelector('[data-pg=admin] .adm-pr.on') || {}).dataset?.id, !!document.querySelector('[data-pg=admin] .adm-pcard')]")
        ok(L >= 11 and r6 == ["admin", F, True], "Settings › People & access lists everyone; a click opens their page in Admin › People (%d, %s)" % (L, r6))
        # a technician can't open it
        await pg.evaluate("id => { localStorage.setItem('tec_viewas', id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); const U = __tg.UI(); U.view = 'profile'; U.pxSec = 'people'; __tg.render(); }",
                          await pg.evaluate("__tg.staffList().filter(s => s.role === 'Technician')[1].id")); await pg.wait_for_timeout(500)
        dis = await pg.evaluate("[...document.querySelectorAll('.sg-plr')].every(b => b.disabled)")
        ok(dis, "a technician sees the list but can't open anyone's page")
        ok(not errs, "no page errors (%s)" % errs[:2])
        await b.close()
    print("\n%d failed" % len(FAILS) if FAILS else "\nall passed")
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
