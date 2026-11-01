# Parsec 13.1 (fork S) — every page's search is an icon that opens a search window over the page
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_s.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots131s"); os.makedirs(OUT, exist_ok=True)
ADMIN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()"
MODAL = """(()=>{ const w=document.querySelector('.psm'); if(!w) return null; const i=w.querySelector('input'), r=w.querySelector('.psm-c').getBoundingClientRect();
  return { q: i.value, focus: document.activeElement===i, hint: w.querySelector('.psm-h').textContent, rows: w.querySelectorAll('.psm-r').length, k: w.querySelectorAll('.psm-r.k').length,
           box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], z: +getComputedStyle(w).zIndex, bg: getComputedStyle(w.querySelector('.psm-c')).backgroundColor }; })()"""
# a word from the page that the search narrows (filters) or finds something with (find)
FW = """(([key, sel, mode]) => { const c = __tg.psmCfg(key); if(!c) return 'no cfg'; const W = [];
  document.querySelectorAll(sel).forEach((e, i) => { if(i < 40) e.textContent.split(/[\\s·,()“”"\\/:]+/).forEach(w => { if(w.length >= 4 && /^[A-Za-z0-9-]+$/.test(w) && W.indexOf(w) < 0) W.push(w); }); });
  for(const w of W){ if(mode === 'f'){ const n = c.count(w); if(n && n.n > 0 && n.n < n.of) return [w, n.n, n.of]; } else { const L = c.items(w) || []; if(L.length) return [w, L.length, L[0].id, L[0].title]; } }
  return null; })"""
OLD = ("{p} .tg-head input, {p} input[data-in=q], {p} input[data-in=tq], {p} input[data-in=aq], {p} input[data-in=cq], {p} .adm-q, {p} .ivn-bar input, {p} .tch-find, "
       "#mq-lq, #mg-lq, #tg-q, #fm-q, #wa-q, {p} .tg-srch.open")
SIGN_FM = "(()=>{ const sf=__tg.staffList().find(s=>s.role==='Foreman'); localStorage.setItem('tec_viewas', sf.id); __tg.pxSignedIn(); __tg.render(); })()"
GET = "(k=>{ const c=__tg.psmCfg(k); return c ? c.get() : null; })"


async def go(pg, v):
    await pg.evaluate(f"__tg.PG.go('{v}')"); await pg.wait_for_timeout(500)


async def rows(pg, sel): return await pg.evaluate(f"document.querySelectorAll({json.dumps(sel)}).length")


async def common(pg, key, root):
    r = await pg.evaluate(f"[!!document.querySelector('.psm-b[data-psm={key}]'), document.querySelectorAll({json.dumps(OLD.format(p=root))}).length]")
    ok(r[0] and r[1] == 0, f"{key}: the search bar is gone, the icon is there ({r})")


async def filter_page(pg, key, root, rsel, word_sel, sel_check=None, extra=0):
    await common(pg, key, root)
    r0 = await rows(pg, rsel)
    w = await pg.evaluate(FW, [key, word_sel, 'f'])
    ok(isinstance(w, list), f"{key}: a word that narrows the list ({w}) · {r0} rows")
    if not isinstance(w, list): return
    q, n, of = w
    await pg.click(f".psm-b[data-psm={key}]"); await pg.wait_for_timeout(250)
    m = await pg.evaluate(MODAL)
    ok(m and m["focus"] and m["q"] == "" and m["z"] >= 10000, f"{key}: the icon opens the window, input focused ({m and [m['focus'], m['z'], m['hint']]})")
    await pg.keyboard.type(q); await pg.wait_for_timeout(450)
    m = await pg.evaluate(MODAL); r1 = await rows(pg, rsel)
    ok(m and f"{n} of {of}" in m["hint"] and 0 < r1 < r0, f"{key}: typing “{q}” filters the list behind — {r1} of {r0} rows · {m and m['hint']}")
    await pg.screenshot(path=os.path.join(OUT, f"{key}_1_typing.png"))
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
    r = [await pg.evaluate(MODAL), await pg.evaluate(GET, key), await rows(pg, rsel)]
    ok(r[0] is None and r[1] == "" and r[2] == r0, f"{key}: Esc clears and closes ({r[1:]})")
    await pg.keyboard.press("/"); await pg.wait_for_timeout(250)
    m = await pg.evaluate(MODAL); ok(m and m["focus"], f"{key}: / opens the window")
    await pg.keyboard.type(q); await pg.wait_for_timeout(450)
    await pg.mouse.click(8, 890 if extra == 0 else 830); await pg.wait_for_timeout(300)
    r = [await pg.evaluate(MODAL), await pg.evaluate(GET, key), await pg.evaluate(f"(document.querySelector('.psm-w .psm-chip')||{{}}).textContent||''"), await rows(pg, rsel)]
    ok(r[0] is None and r[1] == q and q in r[2] and 0 < r[3] < r0, f"{key}: a click outside keeps the filter and the chip shows it ({r[1:]})")
    await pg.screenshot(path=os.path.join(OUT, f"{key}_2_chip.png"))
    await pg.click(".psm-w .psm-cq"); await pg.wait_for_timeout(250)
    m = await pg.evaluate(MODAL)
    ok(m and m["q"] == q and m["rows"] > 0, f"{key}: the chip reopens it with the query and the matches ({m and m['rows']} rows)")
    if m and m["rows"]:
        it = await pg.evaluate(f"__tg.psmCfg('{key}').items({json.dumps(q)})[0]")
        await pg.keyboard.press("ArrowDown"); await pg.wait_for_timeout(80)
        k1 = (await pg.evaluate(MODAL))["k"]
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        r = [await pg.evaluate(MODAL), await pg.evaluate(GET, key), k1]
        sc = await pg.evaluate(sel_check.replace("ID", it["id"])) if sel_check else True
        ok(r[0] is None and r[1] == q and r[2] == 1 and sc, f"{key}: ↓ Enter opens “{it['title']}” and keeps the filter ({r[1:]}, picked {sc})")
    if await pg.evaluate(MODAL): await pg.mouse.click(8, 890); await pg.wait_for_timeout(300)
    await pg.click(".psm-w .psm-cx"); await pg.wait_for_timeout(300)
    r = [await pg.evaluate(GET, key), await rows(pg, rsel), await pg.evaluate("!!document.querySelector('.psm-chip')")]
    ok(r == ["", r0, False], f"{key}: × clears the filter ({r})")


async def find_page(pg, key, root, word_sel, sel_check=None, recents=False):
    await common(pg, key, root)
    w = await pg.evaluate(FW, [key, word_sel, 'i'])
    ok(isinstance(w, list), f"{key}: a word the search finds ({w})")
    if not isinstance(w, list): return
    q, n, id0, t0 = w
    await pg.click(f".psm-b[data-psm={key}]"); await pg.wait_for_timeout(250)
    m = await pg.evaluate(MODAL)
    ok(m and m["focus"] and (m["rows"] > 0 if recents else True), f"{key}: the icon opens the window ({m and [m['focus'], m['rows'], m['hint']]})")
    await pg.keyboard.type(q); await pg.wait_for_timeout(450)
    m = await pg.evaluate(MODAL)
    ok(m and m["rows"] >= 1 and "match" in m["hint"], f"{key}: typing “{q}” lists what it finds ({m and [m['rows'], m['hint']]})")
    await pg.screenshot(path=os.path.join(OUT, f"{key}_1_find.png"))
    await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
    sc = await pg.evaluate(sel_check.replace("ID", str(id0))) if sel_check else True
    r = [await pg.evaluate(MODAL), await pg.evaluate(GET, key), await pg.evaluate("!!document.querySelector('.psm-chip')")]
    ok(r[0] is None and r[1] == "" and not r[2] and sc, f"{key}: Enter opens “{t0}” ({sc}) and the query goes ({r[1:]})")
    await pg.keyboard.press("/"); await pg.wait_for_timeout(250)
    m = await pg.evaluate(MODAL); ok(m and m["focus"], f"{key}: / opens the window")
    await pg.keyboard.type(q); await pg.wait_for_timeout(450)
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(250)
    ok(await pg.evaluate(MODAL) is None and await pg.evaluate(GET, key) == "", f"{key}: Esc closes and clears")
    await pg.keyboard.press("/"); await pg.wait_for_timeout(250); await pg.keyboard.type(q); await pg.wait_for_timeout(450)
    await pg.click(".psm .psm-r[data-psm-i='0']"); await pg.wait_for_timeout(400)
    sc = await pg.evaluate(sel_check.replace("ID", str(id0))) if sel_check else True
    ok(await pg.evaluate(MODAL) is None and sc, f"{key}: a click on a match opens it ({sc})")
    await pg.keyboard.press("/"); await pg.wait_for_timeout(250); await pg.mouse.click(8, 890); await pg.wait_for_timeout(250)
    ok(await pg.evaluate(MODAL) is None, f"{key}: a click outside closes it")


async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate(ADMIN)
        # ---- the pages whose search filters their list
        await go(pg, "tech")
        await filter_page(pg, "tech", "[data-pg=tech]", "[data-pg=tech] .tch-it", "[data-pg=tech] .tch-it", "__tg.CX.TU().ro === 'ID'")
        await go(pg, "inventory")
        await filter_page(pg, "inventory", "[data-pg=inventory]", "[data-pg=inventory] .ivn-r[data-a=sel]", "[data-pg=inventory] .ivn-r[data-a=sel]", "document.querySelector('[data-pg=inventory]').classList.contains('has-sel')")
        await pg.click("[data-pg=inventory] [data-a=view][data-v=act]"); await pg.wait_for_timeout(300)
        r = await pg.evaluate("[document.querySelectorAll('[data-pg=inventory] input[data-in=aq]').length, __tg.psmCfg('inventory').page]")
        ok(r == [0, "Activity"], f"inventory: on Activity the icon searches the movements ({r})")
        await go(pg, "admin")
        await filter_page(pg, "admin", "[data-pg=admin]", "[data-pg=admin] .adm-pr", "[data-pg=admin] .adm-pr", "!!document.querySelector('[data-pg=admin] .adm-pr.on[data-id=\"ID\"]')")
        await go(pg, "manager")
        await pg.click("[data-pg=manager] [data-a=view][data-v=kpi]"); await pg.wait_for_timeout(300)
        await filter_page(pg, "manager", "[data-pg=manager]", "[data-pg=manager] .tg-list .tg-it", "[data-pg=manager] .tg-list .tg-it", "!!document.querySelector('[data-pg=manager] .tg-it.on[data-k=\"ID\"]')")
        await go(pg, "parts")
        await pg.click("[data-pg=parts] [data-a=view][data-v=cat]"); await pg.wait_for_timeout(300)
        await filter_page(pg, "parts", "[data-pg=parts]", "[data-pg=parts] .pq-tbl .pq-cr:not(.h)", "[data-pg=parts] .pq-tbl .pq-cr:not(.h)")
        ok(not errs, "filter pages: no console errors: " + "; ".join(errs[:3]))
        # ---- the pages whose search finds one thing to open
        await go(pg, "parts"); await pg.click("[data-pg=parts] [data-a=view][data-v=desk]"); await pg.wait_for_timeout(300)
        await find_page(pg, "parts", "[data-pg=parts]", "[data-pg=parts] .tg-main, [data-pg=parts] .tg-list")
        await go(pg, "fixes")
        await find_page(pg, "fixes", "[data-pg=fixes]", "[data-pg=fixes] .tg-list .tg-it", "!!document.querySelector('[data-pg=fixes] .tg-it.on[data-k=\"ID\"]')")
        await pg.evaluate(ADMIN); await go(pg, "triage")
        await find_page(pg, "triage", ".tg", ".tg .tg-main, .tg .tg-list", "__tg.UI().tgSel === 'ID'", True)
        await go(pg, "foreman")
        await find_page(pg, "foreman", ".tg", ".tg .tg-main, .tg .tg-list", "__tg.UI().fmSel === 'ID'", True)
        await go(pg, "warranty")
        await find_page(pg, "warranty", ".tg", ".tg .tg-main, .tg .tg-list", "__tg.UI().waSel === 'ID'", True)
        # the RO List: its search is the icon too (no box); Ctrl K stays the search for everything
        await go(pg, "rolist")
        ok(await pg.evaluate("!document.querySelector('[data-bind=ro-filter]') && !!document.querySelector('.psm-b[data-psm=rolist]')"), "the RO List's search is the icon too")
        await go(pg, "triage"); await pg.keyboard.press("/"); await pg.wait_for_timeout(250)
        await pg.keyboard.press("Control+k"); await pg.wait_for_timeout(350)
        r = await pg.evaluate("[!!document.querySelector('.psm'), !!__tg.UI().palette]")
        ok(r == [False, True], f"Ctrl K in the window opens the search for everything ({r})")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        ok(not errs, "find pages: no console errors: " + "; ".join(errs[:3]))
        await b.close()
        # ---- phone
        b, pg, errs = await setup(p, 390, 844)
        await pg.evaluate(ADMIN)
        for v, key in [("tech", "tech"), ("inventory", "inventory"), ("admin", "admin"), ("manager", "manager"), ("parts", "parts"), ("fixes", "fixes"), ("triage", "triage"), ("foreman", "foreman"), ("warranty", "warranty")]:
            await go(pg, v)
            r = await pg.evaluate(f"(()=>{{ const b=document.querySelector('.psm-b[data-psm={key}]'); if(!b) return null; const r=b.getBoundingClientRect(); return [r.width>0 && r.left>=0 && r.right<=innerWidth, document.documentElement.scrollWidth <= innerWidth + 1]; }})()")
            ok(r == [True, True], f"phone {key}: the icon shows, no sideways scroll ({r})")
        await go(pg, "inventory")
        await pg.click(".psm-b[data-psm=inventory]"); await pg.wait_for_timeout(250)
        await pg.keyboard.type("filter"); await pg.wait_for_timeout(450)
        m = await pg.evaluate(MODAL)
        top = await pg.evaluate("(()=>{ const e=document.elementFromPoint(195, innerHeight-12); return !!(e && e.closest('.psm')); })()")
        ok(m and m["box"][0] >= 15 and m["box"][2] <= 390 - 15 and m["focus"] and top, f"phone: the window fits with 16px sides, over the tab bar ({m and m['box']}, over {top})")
        await pg.screenshot(path=os.path.join(OUT, "phone_window.png"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        await go(pg, "tech"); await pg.screenshot(path=os.path.join(OUT, "phone_tech.png"))
        ok(not errs, "phone: no console errors: " + "; ".join(errs[:3]))
        await b.close()
        # ---- dark
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ try{ localStorage.setItem('tec_theme','ivd'); }catch(e){} document.documentElement.setAttribute('data-theme','ivd'); })()")
        await pg.evaluate(ADMIN); await go(pg, "triage")
        await pg.click(".psm-b[data-psm=triage]"); await pg.wait_for_timeout(250)
        m = await pg.evaluate(MODAL)
        rgb = [int(x) for x in m["bg"].replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",")[:3]] if m else [255, 255, 255]
        ok(sum(rgb) < 150, f"dark: the window is dark ({m and m['bg']})")
        await pg.screenshot(path=os.path.join(OUT, "dark_window.png"))
        await pg.keyboard.press("Escape")
        await go(pg, "inventory"); await pg.keyboard.press("/"); await pg.wait_for_timeout(200); await pg.keyboard.type("filter"); await pg.wait_for_timeout(450)
        await pg.mouse.click(8, 890); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "dark_chip.png"))
        ok(not errs, "dark: no console errors: " + "; ".join(errs[:3]))
        await b.close()
        # ---- light screenshots of the window on a few pages
        b, pg, errs = await setup(p)
        await pg.evaluate(ADMIN); await go(pg, "tech"); await pg.keyboard.press("/"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "light_tech_empty.png"))
        await b.close()
    print("\nFAILS:", len(FAILS), FAILS)
asyncio.run(main())
