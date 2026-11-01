# Parsec 12.6 — parts stages on the Parts page (RO section, Needs action pills) and the Foreman page
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots126"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
async def setup(p, w=1440, h=900, phone=False):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": w, "height": h}, is_mobile=phone, has_touch=phone)
    pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
    await pg.route("**/fonts.g*/**", lambda r: r.abort())
    if phone: await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
    await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
    await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
    return b, pg, errs
# three ROs: mixed (held by an ordered part due tomorrow, 3 days at Ordered), a backorder (6 days, no date), and no parts
PREP = """(()=>{ const S=__tg.STATE(), now=Date.now(), iso=ms=>new Date(now-ms).toISOString();
  const tm=new Date(now+86400e3), eta=tm.getFullYear()+'-'+String(tm.getMonth()+1).padStart(2,'0')+'-'+String(tm.getDate()).padStart(2,'0');
  const L=S.ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length>=2); const r1=L[0], r2=L[1], r3=L[2];
  const mk=(id,d,pn,st,e,age)=>({id, description:d, partNumber:pn, qty:1, status:st, eta:e||'', statusChangedAt:iso(age*86400e3), price:'40'});
  [r1,r2,r3].forEach((r,i)=>{ r.location=['A3','A4','A5'][i]; r.operations.forEach(o=>{ o.declined=false; o.appr={at:iso(86400e3), by:'Customer'}; o.parts=[]; }); });
  r1.operations[0].parts=[mk('pa1','NOx sensor','22827993','Received','',1), mk('pa2','Sensor gasket','21479638','Ordered',eta,3)];
  r1.operations[1].parts=[mk('pa3','Mirror glass','82384021','Installed','',4)];
  r2.operations[0].parts=[mk('pb1','EGR cooler','23411210','Backordered','',6), mk('pb2','V-band clamp','21330990','Received','',1)];
  __tg.render(); return [r1.id, r2.id, r3.id, r1.operations[0].id]; })()"""
P = "document.querySelector('[data-pg=parts]')"
async def parts(p, w=1440, h=900, phone=False):
    print("— the Parts page" + (" (phone)" if phone else ""))
    b, pg, errs = await setup(p, w, h, phone)
    r1, r2, r3, op1 = await pg.evaluate(PREP)
    async def openro(rid):
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='parts'; U.ptRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(600)
    await openro(r1)
    tr = await pg.evaluate(f"""(()=>{{ const t={P}.querySelector('.tg-top .pst'); if(!t) return null; const L=[...t.querySelectorAll('.pst-t li')];
      return {{ head: t.querySelector('.pst-h').textContent, steps: L.map(li=>li.className.split(' ')[0]+':'+li.querySelector('.lb').textContent+':'+((li.querySelector('small')||{{}}).textContent||'')),
        a1: !!t.querySelector('.pst-t li.c small .a1'), held: (t.querySelector('.pst-held')||{{}}).textContent||'', act: (t.querySelector('.pst-act')||{{}}).textContent||'',
        dc: getComputedStyle(L[2].querySelector('.dot')).backgroundColor, cc: getComputedStyle(L[1].querySelector('.dot')).backgroundColor }}; }})()""")
    print("   ", tr)
    ok(tr is not None, "the parts stage sits in the RO section on the Parts page")
    ok(tr and "Ordered" in tr["head"] and "2 of 3 in hand" in tr["head"] and "All in by tomorrow" in tr["head"], "the head: stage, in hand, all in by — " + (tr or {}).get("head", ""))
    ok(tr and tr["steps"][0].startswith("d:Not ordered") and tr["steps"][1].startswith("c:Ordered") and "ETA tomorrow" in tr["steps"][1] and "3 d" in tr["steps"][1], "the least part sets the stage; under it: count, ETA, days")
    ok(tr and tr["a1"], "3 days at a stage is amber")
    ok(tr and "Held by Sensor gasket" in tr["held"], "named under the track: " + (tr or {}).get("held", ""))
    ok(tr and "It’s in" in tr["act"], "the current step carries its action: " + (tr or {}).get("act", ""))
    ok(tr and tr["dc"] != tr["cc"], f"each step in its status color ({tr and tr['cc']} vs {tr and tr['dc']})")
    rows = await pg.evaluate(f"(()=>{{ const R=[...{P}.querySelectorAll('.pq-pr:not(.h)')]; return R.map(r=>[r.className, (r.querySelector('.d b')||{{}}).textContent, !!r.querySelector('.pst-hold')]); }})()")
    hl = [x for x in rows if "pst-hl" in x[0]]
    ok(len(hl) == 1 and hl[0][1] == "Sensor gasket" and hl[0][2], f"the part holding the stage is highlighted in the list ({hl})")
    om = await pg.evaluate(f"[...{P}.querySelectorAll('.pq-oph .pst-om')].map(x=>x.textContent)")
    ok(om == ["Ordered", "Installed"], f"each operation's own mini stage: {om}")
    pills = await pg.evaluate(f"[...{P}.querySelectorAll('.tg-list .pst-rp')].map(x=>x.textContent)")
    ok(len(pills) > 0, f"the Needs action rows carry a stage pill ({len(pills)}: {pills[:6]})")
    if not phone:
        await pg.screenshot(path=os.path.join(OUT, "a1_parts_track.png"))
        # point at a step for its parts
        await pg.hover(f"[data-pg=parts] .pst-t li:nth-child(3) .pst-stp"); await pg.wait_for_timeout(250)
        pop = await pg.evaluate(f"(()=>{{ const x={P}.querySelector('.pst-t li:nth-child(3) .pst-pop'); return x ? [getComputedStyle(x).display, x.textContent] : null; }})()")
        ok(pop and pop[0] == "block" and "NOx sensor" in pop[1], f"pointing at a step lists its parts ({pop})")
        el = await pg.evaluate(f"(()=>{{ const r={P}.querySelector('.tg-top').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }})()")
        await pg.screenshot(path=os.path.join(OUT, "a2_parts_hover.png"), clip={"x": el[0], "y": el[1], "width": el[2], "height": el[3] + 80})
    # click a step: only its parts
    await pg.evaluate(f"{P}.querySelector('.pst-t li:nth-child(2) .pst-stp').click()"); await pg.wait_for_timeout(400)
    fb = await pg.evaluate(f"(()=>{{ const f={P}.querySelector('.pst-fbar'); const vis=[...{P}.querySelectorAll('.pq-pr:not(.h)')].filter(r=>getComputedStyle(r).display!=='none').map(r=>(r.querySelector('.d b')||{{}}).textContent); return [f ? f.textContent : '', vis]; }})()")
    ok("Showing Ordered" in fb[0] and fb[1] == ["Sensor gasket"], f"click a step to show only its parts ({fb})")
    if not phone: await pg.screenshot(path=os.path.join(OUT, "a3_parts_filter.png"))
    await pg.evaluate(f"{P}.querySelector('.pst-fbar [data-pst-clr]').click()"); await pg.wait_for_timeout(300)
    vis = await pg.evaluate(f"[...{P}.querySelectorAll('.pq-pr:not(.h)')].filter(r=>getComputedStyle(r).display!=='none').length")
    ok(vis == 3 and not await pg.evaluate(f"!!{P}.querySelector('.pst-fbar')"), "Show all brings them back")
    # the step's action moves it on: It's in → Received
    await pg.evaluate(f"{P}.querySelector('.pst-act [data-a=rcv1]').click()"); await pg.wait_for_timeout(500)
    st2 = await pg.evaluate(f"__tg.getRO('{r1}').operations[0].parts.find(x=>x.id==='pa2').status")
    hd2 = await pg.evaluate(f"(()=>{{ const t={P}.querySelector('.tg-top .pst'); return [t.querySelector('.pst-h').textContent, (t.querySelector('.pst-act')||{{}}).textContent||'']; }})()")
    print("    after It's in:", st2, hd2)
    ok(st2 in ("Received", "Staged") and ("Received" in hd2[0] or "Staged" in hd2[0]) and "All in hand" in hd2[0], "It’s in moves the stage on — all in hand")
    # staged → Tell the tech
    await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{r1}'); ro.operations[0].parts.forEach(x=>{{ x.status='Staged'; x.bin='A12'; }}); __tg.render(); }})()"); await pg.wait_for_timeout(400)
    ac = await pg.evaluate(f"({P}.querySelector('.pst-act')||{{}}).textContent||''")
    ok("Tell the tech" in ac, f"staged: the step says Tell the tech ({ac})")
    await pg.evaluate(f"{P}.querySelector('.pst-act [data-pst-act=tell]').click()"); await pg.wait_for_timeout(400)
    told = await pg.evaluate(f"[(__tg.getRO('{r1}').pstTold||{{}}).to||'', ({P}.querySelector('.pst-act')||{{}}).textContent||'']")
    ok(told[0] and told[1].startswith("Told"), f"Tell the tech sends the note and says so ({told})")
    # the backorder: the Ordered step turns red, 6 days red, no date
    await openro(r2)
    bo = await pg.evaluate(f"""(()=>{{ const t={P}.querySelector('.tg-top .pst'); const c=t.querySelector('.pst-t li.c'); return [t.querySelector('.pst-h').textContent, c.className, c.querySelector('.lb').textContent, !!c.querySelector('small .a2'), (t.querySelector('.pst-act')||{{}}).textContent||'', getComputedStyle(c.querySelector('.dot')).backgroundColor]; }})()""")
    print("    backorder:", bo)
    ok("backordered" in bo[0] and "prob" in bo[1] and bo[2] == "Ordered" and bo[3] and "No date yet" in bo[0] and "Chase" in bo[4], "a backorder: part of Ordered, the step red, 6 days red, no date, Chase…")
    if not phone:
        el = await pg.evaluate(f"(()=>{{ const r={P}.querySelector('.tg-top').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }})()")
        await pg.screenshot(path=os.path.join(OUT, "a4_parts_backorder.png"), clip={"x": el[0], "y": el[1], "width": el[2], "height": el[3] + 10})
    # no parts: one quiet line
    await openro(r3)
    q = await pg.evaluate(f"({P}.querySelector('.tg-top .pst-q')||{{}}).textContent||''")
    ok("No parts on this RO" in q, f"no parts: one quiet line ({q})")
    if phone:
        await openro(r1); await pg.wait_for_timeout(300)
        await pg.evaluate(f"(()=>{{ const it=document.querySelector('[data-pg=parts] .tg-it[data-ro=\"{r1}\"]'); it && it.click(); }})()"); await pg.wait_for_timeout(600)
        await pg.evaluate("(()=>{ const t=document.querySelector('[data-pg=parts] .pst'); t && t.scrollIntoView({block:'start'}); })()"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "p1_parts_phone.png"), full_page=False)
        over = await pg.evaluate("(()=>{ const t=document.querySelector('[data-pg=parts] .pst'); return t ? [Math.round(t.getBoundingClientRect().right), innerWidth, t.scrollWidth > t.clientWidth + 2] : null; })()")
        ok(over and over[0] <= over[1] + 1 and not over[2], f"the track fits a phone ({over})")
    print("ERRORS", errs[:6]); ok(not errs, "Parts page: no console errors")
    await b.close()
async def foreman(p):
    print("— the Foreman page")
    b, pg, errs = await setup(p)
    r1, r2, r3, op1 = await pg.evaluate(PREP)
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='foreman'; U.fmSel='{r1}'; U.fmView='floor'; __tg.render(); }})()"); await pg.wait_for_timeout(700)
    F = "document.querySelector('.tg-top')"
    fm = await pg.evaluate(f"""(()=>{{ const t=document.querySelector('.tg-top .pst'); if(!t) return null; return {{ ro: t.dataset.pstRo, head: t.querySelector('.pst-h').textContent, act: (t.querySelector('.pst-act')||{{}}).textContent||'', held: (t.querySelector('.pst-held')||{{}}).textContent||'', mini: [...document.querySelectorAll('.tg-top .fm-opp .pst-om')].map(x=>x.textContent) }}; }})()""")
    print("   ", fm)
    ok(fm and fm["ro"] == r1 and "Ordered" in fm["head"], "the Foreman page shows the same parts stage")
    ok(fm and "Ask Parts" in fm["act"] and "Held by Sensor gasket" in fm["held"], "with its action and the part that holds it")
    ok(fm and fm["mini"] == ["Ordered", "Installed"], f"each operation's mini stage in the ops strip ({fm and fm['mini']})")
    await pg.screenshot(path=os.path.join(OUT, "b1_foreman.png"))
    await pg.evaluate("document.querySelector('.tg-top .pst-t li:nth-child(3) .pst-stp').click()"); await pg.wait_for_timeout(400)
    ls = await pg.evaluate("(()=>{ const l=document.querySelector('.tg-top .pst-list'); return l ? l.textContent : ''; })()")
    ok("Parts at Received" in ls and "NOx sensor" in ls, f"click a step: its parts listed ({ls[:80]})")
    el = await pg.evaluate(f"(()=>{{ const r={F}.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }})()")
    await pg.screenshot(path=os.path.join(OUT, "b2_foreman_list.png"), clip={"x": el[0], "y": el[1], "width": el[2], "height": el[3]})
    await pg.evaluate("document.querySelector('.tg-top .pst-list [data-pst-clr]').click()"); await pg.wait_for_timeout(300)
    ok(await pg.evaluate("!document.querySelector('.tg-top .pst-list')"), "Close puts the list away")
    for th in ["ivd", "vvl", "vvd"]:
        await pg.evaluate(f"(()=>{{ const b=document.querySelector('.px-rail .pxr-thm button[data-theme=\"{th}\"]'); b && b.click(); }})()"); await pg.wait_for_timeout(400)
        el = await pg.evaluate(f"(()=>{{ const r={F}.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }})()")
        await pg.screenshot(path=os.path.join(OUT, f"b3_foreman_{th}.png"), clip={"x": el[0], "y": el[1], "width": el[2], "height": el[3]})
    print("ERRORS", errs[:6]); ok(not errs, "Foreman page: no console errors")
    await b.close()
async def main():
    async with async_playwright() as p:
        await parts(p)
        await parts(p, 390, 844, True)
        await foreman(p)
    print("FAILS", len(FAILS), FAILS)
asyncio.run(main())
