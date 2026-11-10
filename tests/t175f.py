# Parsec 17.5 (F) — the Library's Accessory kits tab: the list on the left and the kit on the right; search and group chips;
# + New kit and Paste a list (leads and admins — a technician reads only); Copy; Add to an RO… puts it on an operation as a
# part line; delete asks first. Invented kit numbers only.
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
L = "[data-pg=library] "
LIST = "85150012\tRoad speed limit 65 to 70 mph\tSpeed\tVNL · D13\t0.3\n85150027\tIdle shutdown · 5 min\tIdle\tVNL, VNR\t0.3\n85150033  PTO enable single speed\n85150012 a double"
SIGN = "role => { const me = __tg.staffList().find(s => s.role === role); localStorage.setItem('tec_viewas', me.id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); const U = __tg.UI(); U.view = 'library'; __tg.render(); }"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam && __tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        await pg.evaluate(SIGN, "Foreman"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate(f"!!document.querySelector('{L}.lib-tab.k-kits')") and not await pg.evaluate("!!document.querySelector('[data-view=kits], [data-nav=kits]')"), "Accessory kits is a tab on the Library, not a page in the left bar")
        await pg.click(f"{L}.lib-tab.k-kits"); await pg.wait_for_timeout(300)
        ok("No accessory kits yet" in await pg.evaluate(f"document.querySelector('{L}.lak-its').innerText"), "an empty list says how to start")
        # paste a list
        await pg.click(f"{L}[data-a=kpaste]"); await pg.wait_for_timeout(200)
        await pg.fill(f"{L}.lak-ta", LIST); await pg.wait_for_timeout(200)
        rd = await pg.evaluate(f"[document.querySelector('#lak-read').textContent, document.querySelector('#lak-pgo').textContent]")
        ok(rd == ["3 kits read · 1 already here", "Add 3 kits"], "Paste a list reads the rows and leaves a double out (%s)" % rd)
        await pg.click("#lak-pgo"); await pg.wait_for_timeout(400)
        ks = await pg.evaluate("__tg.STATE().accKits.map(k => [k.no, k.name, k.group, k.fits, k.labor])")
        ok(len(ks) == 3 and ks[0] == ["85150012", "Road speed limit 65 to 70 mph", "Speed", "VNL · D13", "0.3"] and ks[2][:2] == ["85150033", "PTO enable single speed"], "the kits are on the list with group, trucks and labor (%s)" % ks[:1])
        # + New kit
        await pg.click(f"{L}[data-a=knew]"); await pg.wait_for_timeout(200)
        for f, v in [("no", "85150064"), ("name", "Daytime running lights off"), ("group", "Lighting"), ("fits", "All"), ("changes", "DRL: on → off"), ("how", "Tech Tool → Program → Accessory kit"), ("labor", "0.2"), ("notes", "Customer signs the form")]:
            await pg.fill(f"{L}[data-in=kit-{f}]", v)
        await pg.click(f"{L}[data-a=ksave]"); await pg.wait_for_timeout(400)
        d = await pg.evaluate(f"document.querySelector('{L}.lak-card').innerText")
        ok(all(x in d for x in ["85150064", "Daytime running lights off", "Lighting · fits All", "DRL: on → off", "Tech Tool", "0.2 h", "Customer signs"]), "New kit: the kit shows on the right with what it changes, how, labor and notes")
        # group chips and search
        await pg.click(f"{L}.lib-fgs .tg-chip[data-v=Idle]"); await pg.wait_for_timeout(300)
        r1 = await pg.evaluate(f"[...document.querySelectorAll('{L}.lak-rowi b')].map(x => x.textContent)")
        await pg.click(f"{L}.lib-fgs .tg-chip[data-v='']"); await pg.fill("#lib-q", "pto"); await pg.wait_for_timeout(300)
        r2 = await pg.evaluate(f"[...document.querySelectorAll('{L}.lak-rowi b')].map(x => x.textContent)")
        ok(r1 == ["85150027"] and r2 == ["85150033"], "a group chip and the search each narrow the list (%s, %s)" % (r1, r2))
        await pg.fill("#lib-q", ""); await pg.wait_for_timeout(200)
        # Add to an RO…
        await pg.click(f"{L}.lak-rowi[data-id] >> nth=0"); await pg.wait_for_timeout(200)
        no = await pg.evaluate(f"document.querySelector('{L}.lak-no b').textContent")
        await pg.click(f"{L}[data-a=kro]"); await pg.wait_for_timeout(300)
        tgt = await pg.evaluate(f"(() => {{ const b = document.querySelector('{L}[data-a=krogo]'); return [b.dataset.ro, b.dataset.op]; }})()")
        await pg.click(f"{L}[data-a=krogo]"); await pg.wait_for_timeout(400)
        pt = await pg.evaluate("([ro, op]) => __tg.getRO(ro).operations.find(o => o.id === op).parts.slice(-1).map(p => [p.partNumber, p.qty, p.status])[0]", tgt)
        ok(pt == [no, "1", "Not Ordered"], "Add to an RO… puts the kit on the operation as a part line (%s)" % pt)
        # delete asks first
        await pg.click(f"{L}[data-a=kdel]"); await pg.wait_for_timeout(300)
        ok("off the list" in await pg.evaluate("(document.querySelector('.pgask') || {}).innerText || ''"), "taking a kit off asks first")
        await pg.click(".pgask [data-ask=yes]"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("__tg.STATE().accKits.length") == 3, "…and then it's gone")
        # a technician reads only
        await pg.evaluate(SIGN, "Technician"); await pg.wait_for_timeout(500)
        t = await pg.evaluate(f"[!!document.querySelector('{L}[data-a=knew]'), !!document.querySelector('{L}[data-a=kedit]'), !!document.querySelector('{L}[data-a=kcopy]'), document.querySelectorAll('{L}.lak-rowi').length]")
        ok(t == [False, False, True, 3], "a technician sees the kits and Copy, but no New kit, Paste or Change (%s)" % t)
        ok(not errs, "no page errors (%s)" % errs[:2])
        await pg.screenshot(path=os.path.join(H, "kits.png"))
        await b.close()
    print("\n%d failed" % len(FAILS) if FAILS else "\nall passed")
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
