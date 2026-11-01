import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots12"); os.makedirs(OUT, exist_ok=True)
FX = lambda n: open(os.path.join(H, "imptest", n), encoding="utf-8").read()
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
PASTE = """(t => { const dt = new DataTransfer(); dt.setData('text/plain', t); const z = document.querySelector('#imp-dlg .ix-drop') || document.body; z.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); })"""
fails = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: fails.append(m)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w, h, tag in [(1440, 900, "d"), (390, 844, "ph")]:
            ctx = await b.new_context(viewport={"width": w, "height": h}, is_mobile=w < 600, has_touch=w < 600); pg = await ctx.new_page(); pg.set_default_timeout(8000); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
            pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
            await pg.route("**/fonts.g*/**", lambda r: r.abort())
            if w < 600: await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
            await pg.goto("file://" + H + "/t12_bb.html"); await pg.wait_for_timeout(1200)
            await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
            await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(400)
            await pg.evaluate(PASTE + "(" + json.dumps(FX("case1.txt")) + ")"); await pg.wait_for_timeout(500)
            await pg.click('#imp-dlg [data-ix="apply"]'); await pg.wait_for_timeout(1200)
            rid = await pg.evaluate("(__tg.STATE().ros.find(x => x.roNumber === 'RA0001238877') || {}).id")
            ok(bool(rid), tag + " created from the import")
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(1500)
            txt = await pg.evaluate(f"(()=>{{ const R={SR}; return R.querySelector('.pxr') ? R.querySelector('.pxr').innerText : ''; }})()")
            for k in ["758560", "23116577", "Service", "PO-55120", "20417", "Jenna Cho", "Ryan Burke", "$150.00", "Skill B", "RA0001238877"]:
                ok(k in txt, f"{tag} RO page shows {k}")
            ok("ASIST Approved" in txt or "Approved" in txt, tag + " approval chip")
            ok("Follow-up" in txt and "Promised" in txt, tag + " schedule rows")
            await pg.screenshot(path=os.path.join(OUT, tag + "_i_ro.png"))
            # the Activity pop-up has the ASIST notes
            await pg.evaluate(f"(()=>{{ const R={SR}; const b=[...R.querySelectorAll('.px-totals .px-total')].find(x=>/Activity/.test(x.getAttribute('aria-label')||'')); b.click(); }})()"); await pg.wait_for_timeout(500)
            at = await pg.evaluate(f"(()=>{{ const R={SR}; const d=R.querySelector('.px-modal'); return d ? d.innerText : ''; }})()")
            ok("lounge" in at.lower() or "ASIST" in at, tag + " Activity shows ASIST notes")
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            # import again on the RO page
            await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{rid}'); r.location='B4'; __tg.render(); }})()"); await pg.wait_for_timeout(600)
            await pg.evaluate(f"__tg.IMPX.open({{ ro: '{rid}' }})"); await pg.wait_for_timeout(400)
            await pg.evaluate(PASTE + "(" + json.dumps(FX("case2.txt")) + ")"); await pg.wait_for_timeout(500)
            c2 = await pg.evaluate("__tg.IMPX.counts()"); print(tag, "counts:", json.dumps(c2))
            ok(c2.get("kept", 0) >= 1 and c2.get("upd", 0) >= 3, tag + " merge counts")
            await pg.click('#imp-dlg [data-ix="apply"]'); await pg.wait_for_timeout(1200)
            r = await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{rid}'); return [r.location, r.authNumber, r.operations.length, r.status.status]; }})()")
            ok(r[0] == "B4" and r[1] == "A-77310" and r[2] == 3, tag + " applied " + json.dumps(r))
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(1200)
            txt = await pg.evaluate(f"(()=>{{ const R={SR}; return R.querySelector('.pxr') ? R.querySelector('.pxr').innerText : ''; }})()")
            ok("A-77310" in txt and "PM service" in txt, tag + " RO page shows the update")
            await pg.screenshot(path=os.path.join(OUT, tag + "_i_ro2.png"))
            # one Undo takes back a change and the automation after it
            n0 = await pg.evaluate("__tg.UI && 1")
            print(tag, "ERRORS", errs[:6]); ok(not errs, tag + " no console errors")
            await ctx.close()
        print("FAILS", len(fails), fails); await b.close()
asyncio.run(main())
