# Parsec 14 (fork A) — the Assets page: every truck, one per VIN, with its history — every visit, repeat repairs,
# lifetime totals, miles and engine hours; search behind the icon, sort, customer filter, keys, permission, phone, dark
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_a.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots132a"); os.makedirs(OUT, exist_ok=True)
Q = "[data-pg=assets]"
ADMIN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()"
ROWS = f"[...document.querySelectorAll('{Q} .ast-it')].map(e=>e.dataset.k)"
# a truck of our own: three visits — 200 days ago, 40 days ago, and one open now that's back for the same brake chamber
MAKE = """(()=>{ const S=__tg.STATE(), day=864e5, now=Date.now(), src=S.ros.find(r=>!r.shop && r.dateClosed && r.operations.some(o=>(o.parts||[]).length));
  let n=0; const id=p=>p+'_t132a_'+(n++);
  const mk=(no, back, len, cmp, jt, mi, hr, open)=>{ const r=JSON.parse(JSON.stringify(src)); r.id=id('ro'); r.roNumber=no; r.vin='1XKTESTVIN0000132'; r.unitNumber='TV-132'; r.customerName='Test Fleet Co.';
    r.year=2021; r.make='Volvo'; r.model='VNL 760'; r.engineType='D13 TC 500HP'; r.engineSerial='ESN-77310452'; r.mileage=String(mi); r.engineHours=String(hr); r.sample=false; r.hist=false;
    r.dateOpened=new Date(now-back*day).toISOString(); r.dateClosed=open?null:new Date(now-(back-len)*day).toISOString();
    r.status=open?{status:'Hold Tech', sub:null, setAt:r.dateOpened}:{status:'Complete – Released', sub:null, setAt:r.dateClosed}; r._lastKnownStatus=r.status.status;
    r.operations=[{ id:id('op'), complaint:cmp, cause:'', correction:'', log:[{id:id('lg'), kind:'fix', text:'Replaced the chamber, leak test OK.', at:r.dateOpened}], quoted:1.5, isStandard:false, standardName:null, declined:false, jobType:jt,
      parts:[{ id:id('pt'), description:'Brake chamber 30/30', partNumber:'4988201', qty:'2', price:'189.5', status:'Installed', eta:'', statusChangedAt:r.dateOpened }], burnt:1.4, burntAdj:0 }];
    S.ros.push(r); return r; };
  const a=mk('RO-90001', 200, 1, 'Replace rear brake chamber', 'OP', 300000, 10000, false);
  const b=mk('RO-90002', 40, 2, 'Replace rear brake chamber', 'OP', 340000, 11000, false);
  const c=mk('RO-90003', 10, 0, 'Comeback - rear brake chamber still leaking', 'COMEBACK', 345000, 11200, true);
  __tg.render(); return { a:a.id, b:b.id, c:c.id }; })()"""
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate(ADMIN); await pg.wait_for_timeout(500)
        ids = await pg.evaluate(MAKE)
        # the sidebar: Assets, after the RO List
        nav = await pg.evaluate("[...document.querySelectorAll('[data-view]')].filter(e=>e.offsetParent).map(e=>e.dataset.view)")
        ok("assets" in nav and nav.index("assets") == nav.index("fixes") + 1, f"the sidebar has Assets, after Fixes ({nav})")
        await pg.click("[data-view=assets]"); await pg.wait_for_timeout(700)
        ok(await pg.evaluate(f"[__tg.UI().view, !!document.querySelector('{Q} .ast-list'), !!document.querySelector('{Q} .ast-pane')]") == ["assets", True, True], "the page opens from the sidebar — the trucks and one truck")
        await pg.screenshot(path=os.path.join(OUT, "a1_page.png"))
        # one row per VIN
        r = await pg.evaluate(f"""(()=>{{ const R=__tg.STATE().ros.filter(r=>r && !r.shop && r.id!=='shop'), V=new Set(R.map(r=>String(r.vin||'').toUpperCase().replace(/[^A-Z0-9]/g,'')).filter(v=>v.length>=11)), noV=R.filter(r=>String(r.vin||'').replace(/[^A-Z0-9]/gi,'').length<11).length;
          const K={ROWS}; return [K.length, new Set(K).size, V.size, noV]; }})()""")
        ok(r[0] == r[1] == r[2] and r[3] == 0, f"one row per truck — every VIN once ({r})")
        st = await pg.evaluate("(()=>{ const T=__tg.asTrucks(); return [T.length, T.filter(t=>t.n>=2).length, T.filter(t=>t.n>=3).length, T.filter(t=>t.reps.length).length]; })()")
        ok(st[1] >= 10 and st[2] >= 3, f"the sample has trucks that came back — {st[1]} with two visits or more, {st[2]} with three ({st})")
        # our truck: every visit, newest first
        await pg.evaluate(f"__tg.ASPG.U().sel = 'v:1XKTESTVIN0000132'"); await pg.evaluate("__tg.render()"); await pg.wait_for_timeout(400)
        v = await pg.evaluate(f"[...document.querySelectorAll('{Q} .ast-v')].map(e=>e.dataset.id)")
        ok(v == [ids["c"], ids["b"], ids["a"]], f"every visit, newest first ({v})")
        hd = await pg.evaluate(f"(()=>{{ const P=document.querySelector('{Q} .ast-pane'); return [P.querySelector('h2').textContent, [...P.querySelectorAll('.ast-facts > div')].map(d=>d.querySelector('small').textContent+'='+d.querySelector('span').textContent), !!P.querySelector('.tg-hpic, .trk-th'), P.querySelector('.ast-openb') ? P.querySelector('.ast-openb').dataset.id : null]; }})()")
        f = dict(x.split("=", 1) for x in hd[1])
        ok(hd[0] == "2021 Volvo VNL 760" and f.get("VIN") == "1XKTESTVIN0000132" and f.get("Unit") == "TV-132" and f.get("Engine serial") == "ESN-77310452" and f.get("Miles") == "345,000" and f.get("Engine hours") == "11,200" and "In the shop" in f.get("Last seen", "") and hd[2] and hd[3] == ids["c"],
           f"the truck: picture, year/make/model, VIN, unit, engine serial, miles, hours, in the shop with its RO ({hd})")
        # repeat repairs: back 28 days after the last one closed, for the brake chamber — the 200-day-old one is too far back
        rp = await pg.evaluate(f"[[...document.querySelectorAll('{Q} .ast-rp b')].map(e=>e.textContent.trim()), [...document.querySelectorAll('{Q} .ast-v')].map(v=>!!v.querySelector('.ast-rpc'))]")
        ok(rp[0] == ["Air and brakes — back in 28 days"] and rp[1] == [True, False, False], f"the repeat repair is flagged — the same system back within 90 days, not the one 200 days back ({rp})")
        # lifetime totals add up
        tt = await pg.evaluate(f"""(()=>{{ const rate=+__tg.STATE().laborRate > 0 ? +__tg.STATE().laborRate : 210;
          const tiles=[...document.querySelectorAll('{Q} .ast-tile .v')].map(e=>e.textContent.trim()); const lab=3*1.5*rate, pts=3*2*189.5;
          const usd=n=>'$'+Math.round(n).toLocaleString('en-US'); return [tiles, ['3', '13', usd(lab), usd(pts)]]; }})()""")
        ok(tt[0] == tt[1], f"lifetime totals add up — visits, days down, labor, parts ({tt})")
        mh = await pg.evaluate(f"[document.querySelectorAll('{Q} .ast-svg').length, document.querySelectorAll('{Q} .ast-svg circle').length]")
        ok(mh == [2, 6], f"miles and engine hours: a line each, a dot per visit ({mh})")
        await pg.screenshot(path=os.path.join(OUT, "a2_truck.png"))
        await pg.evaluate(f"document.querySelector('{Q} .ast-pane').scrollTop=520"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "a3_visits.png"))
        # a visit opens its RO
        await pg.click(f"{Q} .ast-v:nth-child(2)"); await pg.wait_for_timeout(700)
        ok(await pg.evaluate("[__tg.UI().view, __tg.UI().selectedRo]") == ["ros", ids["b"]], "clicking a visit opens that RO")
        # the RO page: the truck card's ⋯ → Truck history in Assets… (Parsec 15 — the Truck history section left the RO page)
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ids['c']}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        await pg.evaluate(J("const b=[...R.querySelectorAll('.px-trk button')].find(x=>/⋯|more|menu/i.test(x.getAttribute('aria-label')||x.title||x.textContent)); b && b.click()")); await pg.wait_for_timeout(300)
        btn = await pg.evaluate("(()=>{ const R=document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot; const b=[...R.querySelectorAll('.px-trk__menu button'), ...document.querySelectorAll('.px-trk__menu button')].find(x=>/^Truck history in Assets/.test(x.textContent.trim())); if(!b) return false; b.click(); return true; })()")
        await pg.wait_for_timeout(700)
        ok(btn and await pg.evaluate("[__tg.UI().view, __tg.ASPG.U().sel]") == ["assets", "v:1XKTESTVIN0000132"], f"the truck menu's Truck history in Assets… opens the truck on Assets ({btn})")
        # search behind the icon
        await pg.click(f".psm-b[data-psm=assets]"); await pg.wait_for_timeout(250)
        await pg.keyboard.type("TESTVIN"); await pg.wait_for_timeout(450)
        r = await pg.evaluate(f"[!!document.querySelector('.psm'), {ROWS}, document.querySelectorAll('.psm .psm-r').length]")
        ok(r[0] and r[1] == ["v:1XKTESTVIN0000132"] and r[2] >= 1, f"the search icon opens the window; typing filters the trucks ({r})")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        n0 = await pg.evaluate(f"{ROWS}.length")
        ok(n0 == st[0] + 0, f"Esc clears the search ({n0})")
        await pg.keyboard.press("/"); await pg.wait_for_timeout(250); await pg.keyboard.type("Test Fleet"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(f"{ROWS}") == ["v:1XKTESTVIN0000132"], "/ opens it too, and a customer finds the truck")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        # sort
        await pg.select_option(f"{Q} select[data-ch=sort]", "visits"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"(()=>{{ const T=__tg.asTrucks(), K={ROWS}, n=K.map(k=>T.find(t=>t.k===k).n); return [n.slice(0,6), n.every((x,i)=>!i || n[i-1]>=x)]; }})()")
        ok(r[1], f"Most visits first ({r[0]})")
        await pg.select_option(f"{Q} select[data-ch=sort]", "az"); await pg.wait_for_timeout(300)
        c = await pg.evaluate(f"(()=>{{ const T=__tg.asTrucks(), c={ROWS}.map(k=>T.find(t=>t.k===k).cust); return [c.slice(0,3), c.every((x,i)=>!i || c[i-1].localeCompare(x) <= 0)]; }})()")
        ok(c[1], f"Customer A–Z ({c[0]})")
        await pg.select_option(f"{Q} select[data-ch=sort]", "down"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"(()=>{{ const T=__tg.asTrucks(), d={ROWS}.map(k=>T.find(t=>t.k===k).days); return d.every((x,i)=>!i || d[i-1]>=x-1e-9); }})()")
        ok(r, "Most days down first")
        await pg.select_option(f"{Q} select[data-ch=sort]", "last"); await pg.wait_for_timeout(300)
        # customer filter
        await pg.select_option(f"{Q} select[data-ch=cust]", "Test Fleet Co."); await pg.wait_for_timeout(300)
        ok(await pg.evaluate(f"{ROWS}") == ["v:1XKTESTVIN0000132"], "the customer filter shows just their trucks")
        await pg.select_option(f"{Q} select[data-ch=cust]", ""); await pg.wait_for_timeout(300)
        # chips: in the shop, repeat repairs
        await pg.click(f"{Q} .tg-chip[data-v=rep]"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"(()=>{{ const T=__tg.asTrucks(), K={ROWS}; return [K.length, K.every(k=>T.find(t=>t.k===k).reps.length>0), K.includes('v:1XKTESTVIN0000132')]; }})()")
        ok(r[0] > 0 and r[1] and r[2], f"Repeat repairs shows only the trucks with one ({r})")
        await pg.click(f"{Q} .tg-chip[data-v=shop]"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"(()=>{{ const T=__tg.asTrucks(), K={ROWS}; return [K.length, K.every(k=>T.find(t=>t.k===k).open.length>0)]; }})()")
        ok(r[0] > 0 and r[1], f"In the shop shows only trucks with an open RO ({r})")
        await pg.click(f"{Q} .tg-chip[data-v=all]"); await pg.wait_for_timeout(300)
        # keys: J moves, Enter opens the RO
        await pg.evaluate(f"(()=>{{ __tg.ASPG.U().sel=null; __tg.render(); }})()"); await pg.wait_for_timeout(300)
        k0 = await pg.evaluate("__tg.ASPG.U().sel")
        await pg.keyboard.press("j"); await pg.wait_for_timeout(250)
        k1 = await pg.evaluate("__tg.ASPG.U().sel"); K = await pg.evaluate(ROWS)
        ok(k0 == K[0] and k1 == K[1], f"J moves to the next truck ({k0} → {k1})")
        await pg.keyboard.press("k"); await pg.wait_for_timeout(250)
        ok(await pg.evaluate("__tg.ASPG.U().sel") == K[0], "K moves back")
        exp = await pg.evaluate(f"(()=>{{ const t=__tg.asTrucks().find(x=>x.k===__tg.ASPG.U().sel); return (t.open[0]||t.last).r.id; }})()")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(600)
        ok(await pg.evaluate("[__tg.UI().view, __tg.UI().selectedRo]") == ["ros", exp], "Enter opens the truck's RO")
        # permission: on for a technician by default, off when the role's page is turned off
        tech = await pg.evaluate("(()=>{ const sf=__tg.staffList().find(s=>s.role==='Technician'); localStorage.setItem('tec_viewas', sf.id); __tg.pxSignedIn(); __tg.render(); return sf.id; })()"); await pg.wait_for_timeout(500)
        nav = await pg.evaluate("[...document.querySelectorAll('[data-view]')].filter(e=>e.offsetParent).map(e=>e.dataset.view)")
        ok("assets" in nav, f"a technician has Assets by default ({nav})")
        await pg.evaluate(ADMIN); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const P=__tg.STATE().perm; P.roles.Technician.pages.assets=false; __tg.render(); })()")
        await pg.evaluate(f"(()=>{{ localStorage.setItem('tec_viewas', '{tech}'); __tg.pxSignedIn(); __tg.UI().view='assets'; __tg.render(); }})()"); await pg.wait_for_timeout(500)
        r = await pg.evaluate(f"[[...document.querySelectorAll('[data-view]')].filter(e=>e.offsetParent).map(e=>e.dataset.view).includes('assets'), !!document.querySelector('{Q} .ast-list')]")
        ok(r == [False, False], f"turned off for the role: no Assets in the sidebar, and the page doesn't open ({r})")
        await pg.evaluate(ADMIN); await pg.evaluate("(()=>{ __tg.STATE().perm.roles.Technician.pages.assets=true; __tg.UI().view='admin'; __tg.render(); })()"); await pg.wait_for_timeout(500)
        r = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('[data-view=admin], .adm-views button, [data-pg=admin] .tg-views button')].find(x=>/Roles/.test(x.textContent)); if(b) b.click(); return true; })()"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("[...document.querySelectorAll('[data-pg=admin] .adm-mx td:first-child')].map(e=>e.textContent).includes('Assets')")
        ok(r, "the Admin page's role table lists Assets")
        ok(not errs, "no console errors: " + "; ".join(errs[:3]))
        await b.close()
        # ---- phone
        b, pg, errs = await setup(p, 390, 844)
        await pg.evaluate(ADMIN); await pg.evaluate("(()=>{ __tg.UI().view='assets'; __tg.render(); })()"); await pg.wait_for_timeout(800)
        r = await pg.evaluate(f"[document.documentElement.getAttribute('data-device'), !!document.querySelector('{Q} .ast-list'), !document.querySelector('{Q} .ast-pane'), document.documentElement.scrollWidth <= innerWidth + 1, document.querySelectorAll('{Q} .ast-it').length > 5]")
        ok(r == ["phone", True, True, True, True], f"phone: the trucks, full width, no sideways scroll ({r})")
        await pg.screenshot(path=os.path.join(OUT, "a4_phone_list.png"))
        await pg.click(f"{Q} .ast-it:nth-child(2)"); await pg.wait_for_timeout(500)
        r = await pg.evaluate(f"[!!document.querySelector('{Q} .ast-pane'), !document.querySelector('{Q} .ast-list') || getComputedStyle(document.querySelector('{Q} .ast-list')).display==='none', !!document.querySelector('{Q} .ast-back'), document.documentElement.scrollWidth <= innerWidth + 1]")
        ok(r == [True, True, True, True], f"phone: a truck opens full width, with a way back ({r})")
        await pg.screenshot(path=os.path.join(OUT, "a5_phone_truck.png"))
        await pg.click(f"{Q} .ast-back"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(f"[!!document.querySelector('{Q} .ast-list'), __tg.ASPG.U().sel]") == [True, None], "phone: back to the trucks")
        ok(not errs, "phone: no console errors: " + "; ".join(errs[:3]))
        await b.close()
        # ---- dark
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ try{ localStorage.setItem('tec_theme','ivd'); }catch(e){} document.documentElement.setAttribute('data-theme','ivd'); })()")
        await pg.evaluate(ADMIN); await pg.evaluate("(()=>{ __tg.UI().view='assets'; __tg.render(); })()"); await pg.wait_for_timeout(800)
        k = await pg.evaluate("(()=>{ const T=__tg.asTrucks().sort((a,b)=>b.reps.length-a.reps.length || b.n-a.n); __tg.ASPG.U().sel=T[0].k; __tg.render(); return T[0].k; })()"); await pg.wait_for_timeout(400)
        bg = await pg.evaluate(f"getComputedStyle(document.querySelector('{Q} .ast-card')).backgroundColor")
        rgb = [int(x) for x in bg.replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",")[:3]]
        ok(sum(rgb) < 150, f"dark: the cards are dark ({bg})")
        await pg.screenshot(path=os.path.join(OUT, "a6_dark.png"))
        ok(not errs, "dark: no console errors: " + "; ".join(errs[:3]))
        await b.close()
        print("FAILS:", len(FAILS), FAILS)
asyncio.run(main())
