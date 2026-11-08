# Parsec 14.7 (B) — the RO page's menus stay inside the window (the truck picture's ⋯ menu, the status picker and its second
# level), on the RO page and the Technician page's mount, at 1440 / 1280 / 1100 px; Release without checks on the truck card.
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_b.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots147b"); os.makedirs(OUT, exist_ok=True)
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
OPEN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); localStorage.removeItem('rop_fold'); __tg.pxSignedIn(); const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>=2 && !r.noRoadTest); r.noRoadTest=false; const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); return r.id; })()"
RECT = "(el)=>{ if(!el) return null; const r=el.getBoundingClientRect(); return [Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]; }"
def inside(r, vw, vh): return bool(r) and r[0] >= 8 and r[1] >= 8 and r[2] <= vw - 8 and r[3] <= vh - 8
async def menus(pg, tag, vw, vh):
    # the truck picture's ⋯ menu — 17.1: the RO page's column is the one RO panel; its small picture opens Truck & photos instead
    if await pg.evaluate(J("return !!R.querySelector('.px-trk__act')")):
        await pg.evaluate(J("const a=R.querySelector('.px-trk__act'); a.scrollIntoView({block:'center'}); a.click();")); await pg.wait_for_timeout(300)
        m = await pg.evaluate(J(f"""const f={RECT}; const mn=R.querySelector('.px-trk__menu'); if(!mn) return null; const r=mn.getBoundingClientRect();
          const hit=R.elementFromPoint(r.left+14, r.top+18); return [f(mn), !!(hit && mn.contains(hit)), mn.parentNode===R]"""))
        ok(m and inside(m[0], vw, vh) and m[1], f"{tag}: the truck menu sits inside the window and isn't cut off ({m})")
        await pg.screenshot(path=os.path.join(OUT, f"trk_{tag}.png"))
        await pg.keyboard.press("Escape"); await pg.mouse.click(4, vh - 4); await pg.wait_for_timeout(200)
        ok(await pg.evaluate(J("return !R.querySelector('.px-trk__menu')")), f"{tag}: the truck menu closes")
    else: print(f"— {tag}: no big truck card on the RO page (17.1, skipped)")
    # the status picker and its second level
    has_st = await pg.evaluate(J("return !!R.querySelector('.px-status--button')"))   # 17.1: the one RO panel's pill opens the status window instead
    if has_st: await pg.evaluate(J("const a=R.querySelector('.px-status--button'); a.scrollIntoView({block:'center'}); a.click();")); await pg.wait_for_timeout(300)
    n = await pg.evaluate(J("const L=[...R.querySelectorAll('.px-smain .px-menu__item')].filter(x=>x.querySelector('.px-smenu__more')); L.forEach(()=>0); return L.length"))
    worst = None
    for i in range(n):
        s = await pg.evaluate(J(f"""const f={RECT}; const b=[...R.querySelectorAll('.px-smain .px-menu__item')].filter(x=>x.querySelector('.px-smenu__more'))[{i}];
          b.dispatchEvent(new MouseEvent('mouseenter')); const sub=R.querySelector('.px-smenu .px-sub'); return [b.textContent.trim().slice(0,24), f(R.querySelector('.px-smain')), f(sub)]"""))
        await pg.wait_for_timeout(60)
        if not (inside(s[1], vw, vh) and inside(s[2], vw, vh)): worst = s
        if "Customer" in s[0]: await pg.screenshot(path=os.path.join(OUT, f"status_{tag}.png"))
    if n or (has_st and not tag.startswith("tech")): ok(n >= 2 and worst is None, f"{tag}: the status picker and every second level stay inside ({n} with a second level{'; out: ' + str(worst) if worst else ''})")
    else: print(f"— {tag}: no RO status picker for this person (skipped)")
    await pg.keyboard.press("Escape"); await pg.mouse.click(4, vh - 4); await pg.wait_for_timeout(200)
    # an operation's status menu (pxPop)
    await pg.evaluate(J("const a=R.querySelector('.rop-st'); if(a){ a.scrollIntoView({block:'center'}); a.click(); }")); await pg.wait_for_timeout(300)
    o = await pg.evaluate(J(f"const f={RECT}; const p=[...R.querySelectorAll('.px-pop')].filter(x=>x.offsetParent || getComputedStyle(x).position==='fixed').pop(); return f(p)"))
    ok(o is None or inside(o, vw, vh), f"{tag}: the operation's status menu stays inside ({o})")
    await pg.keyboard.press("Escape"); await pg.mouse.click(4, vh - 4); await pg.wait_for_timeout(200)
async def main():
    async with async_playwright() as p:
        for w in (1440, 1280, 1100):
            b, pg, errs = await setup(p, w=w)
            rid = await pg.evaluate(OPEN); await pg.wait_for_timeout(1200)
            await menus(pg, f"ro_{w}", w, 900)
            ok(not errs, f"{w}: no page errors {errs[:2]}")
            await b.close()
        # the Technician page's mount
        b, pg, errs = await setup(p, w=1366)
        me = await pg.evaluate("""(()=>{ const T=__tg.staffList().filter(s=>s.role==='Technician'); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name && !r.dateClosed).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{ __tg.CX.U().skipMorning=__tg.todayStr(); }catch(e){} const U=__tg.UI(); U.view='tech'; __tg.render(); return T[0].name; })()""")
        await pg.wait_for_timeout(1200)
        has = await pg.evaluate(J("return !!R.querySelector('.rop-rail')"))
        if has: await menus(pg, "tech_1366", 1366, 900)
        else: print("— the Technician page shows no RO open here (skipped)")
        rb = await pg.evaluate(J("return !!R.querySelector('.rop-byb')")); cr = await pg.evaluate("__tg.can('ro.release')")
        ok(rb == bool(cr), f"Technician: Release shows only for people who may release (button {rb}, may release {cr})")
        await b.close()
        # Release without checks
        b, pg, errs = await setup(p, w=1440)
        rid = await pg.evaluate(OPEN); await pg.wait_for_timeout(1200)
        bt = await pg.evaluate(J("const b=R.querySelector('.rop-acts .rop-byb'); return b ? [b.textContent.trim(), [...b.parentNode.children].map(x=>x.textContent.trim())] : null"))
        ok(bt and bt[0] == "Release" and bt[1].index("Release") == bt[1].index("Truck checks") + 1, f"17.5: one Release button, after Truck checks ({bt})")
        await pg.evaluate(J("R.querySelector('.rop-byb').click()")); await pg.wait_for_timeout(400)
        md = await pg.evaluate("(()=>{ const d=document.querySelector('.tg-pop.rl'); return d ? [!!d.querySelector('.tg-rwarn'), [...d.querySelectorAll('.tg-any .tg-chip')].map(x=>x.textContent), (d.querySelector('[data-action=tg-rl-go]')||{}).disabled] : null; })()")
        ok(md and md[0] and len(md[1]) >= 2 and md[2] is True, f"Release says the checks are open and asks why first ({md})")
        await pg.screenshot(path=os.path.join(OUT, "bypass_confirm.png"))
        for _ in range(6):   # 17.5: Before it goes is ticked first, even releasing anyway
            if not await pg.evaluate("(()=>{ const c=document.querySelector('.tg-pop.rl [data-action=tg-rl][data-f=tick]:not(.on)'); if(c){ c.click(); return true; } return false; })()"): break
            await pg.wait_for_timeout(150)
        await pg.evaluate("document.querySelector('.tg-pop.rl .tg-any .tg-chip').click()"); await pg.wait_for_timeout(200)
        await pg.evaluate("(()=>{ const i=document.querySelector('.tg-pop.rl [data-tg-in=rl-why]'); if(i){ i.value='Nothing clocked — test data'; i.dispatchEvent(new Event('input', {bubbles:true})); } })()"); await pg.wait_for_timeout(150)
        await pg.evaluate("document.querySelector('.tg-pop.rl [data-action=tg-rl-go]').click()"); await pg.wait_for_timeout(500)
        r = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO({json.dumps(rid)}); return [__tg.roStatus(ro).status, !!(ro.releaseRec && ro.releaseRec.override && ro.releaseRec.override.reason), (__tg.auditLog().slice(-3).map(a=>a.text).join(' | '))]; }})()")
        ok(r[0] == "Complete – Released" and r[1] and "anyway" in r[2], f"released anyway, with the reason and an Activity line ({r})")
        ln = await pg.evaluate(J("return !!R.querySelector('.rop-byb')"))
        ok(not ln, "the Release button is gone once it's released")
        await pg.screenshot(path=os.path.join(OUT, "bypass_done.png"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(500)
        u = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO({json.dumps(rid)}); return [__tg.roStatus(ro).status, !!ro.releaseRec]; }})()")
        ok(u[0] != "Complete – Released", f"one Undo takes it all back ({u})")
        ok(not errs, f"bypass: no page errors {errs[:2]}")
        await b.close()
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
