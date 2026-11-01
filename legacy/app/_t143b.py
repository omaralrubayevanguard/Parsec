# Parsec 14.3 (B) — one RO view: the Technician page's middle and right are the RO page itself
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots143b"); os.makedirs(OUT, exist_ok=True)
TP = "[data-pg=tech]"
def JT(js): return "(()=>{ const h=document.querySelector('[data-pg=tech] .jc-host'); const R=h&&h.shadowRoot; if(!R) return null; " + js + " })()"
BAR = JT("return [(R.querySelector('.px-crumb')||{}).textContent||'', (R.querySelector('.px-head__pager span')||{}).textContent||'']")
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        # a technician signed in, nothing running
        P = await pg.evaluate(PREP)
        await pg.evaluate(SIGN(P["A"])); await pg.wait_for_timeout(300)
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='tech'; __tg.render(); }})()"); await pg.wait_for_timeout(1200)
        x = await pg.evaluate("(()=>{ const T=__tg.tcxGet(); return T ? { ro: T.ro, n: T.list.length, list: T.list, crumb: T.crumb } : null; })()")
        ok(x and x["n"] >= 2, f"the Technician page has its context for the RO page ({x and x['crumb']}, {x and x['n']} ROs)")
        cls = await pg.evaluate(JT("return [R.querySelectorAll('.rop-orow').length, !!R.querySelector('.px-ro__title'), !!R.querySelector('.rop-r .px-ro__main'), !!R.querySelector('.rop-band')]"))
        nops = await pg.evaluate(f"__tg.getRO('{x['ro']}').operations.filter(o=>o && (o.complaint || o.quoted)).length")
        ok(cls and cls[0] >= 1 and cls[1] and cls[2] and cls[3], f"the middle and right are the RO page: its operation rows, title, main and truck card ({cls}, ops {nops})")
        tl = await pg.evaluate(f"document.querySelector('{TP} .tch-list') && !!document.querySelector('{TP} .tch-list .tg-it.on')")
        ok(tl, "the Technician page's own list stays on the left")
        bar = await pg.evaluate(BAR)
        ok(bar[0].startswith("My ROs") and bar[1] == f"1 of {x['n']}" or (bar[1].endswith(f"of {x['n']}")), f"the bar reads the tech's list ({bar})")
        await pg.screenshot(path=os.path.join(OUT, "b1_tech.png"))
        # ⌃ ⌄ walk the tech's list; the left list follows
        at0 = x["list"].index(x["ro"])
        await pg.evaluate(JT("const b=R.querySelectorAll('.px-head__pager button')[1]; if(b && !b.disabled) b.click(); return 1")); await pg.wait_for_timeout(900)
        y = await pg.evaluate(f"[__tg.tcxGet().ro, document.querySelector('{TP} .tch-jc').dataset.jc]")
        bar2 = await pg.evaluate(BAR)
        ok(at0 + 1 < x["n"] and y[0] == x["list"][at0 + 1] and y[1] == y[0] and bar2[1].startswith(str(at0 + 2) + " of"), f"⌄ moves to the next of the tech's ROs, the mount follows ({y}, {bar2})")
        ok(await pg.evaluate(JT("return (R.querySelector('.px-ro__title')||{}).textContent")) == await pg.evaluate(f"__tg.getRO('{y[0]}').customerName"), "…and the RO page shows that RO")
        # start and stop the clock from the mounted clock card, as the tech
        Q = await pg.evaluate("""(()=>{ const T=__tg.tcxGet(); let r=null;
          for(const id of T.list){ const ro=__tg.getRO(id); if(ro.operations.filter(o=>o && T.own[o.id]).length>=2){ r=ro; break; } }
          if(!r) for(const id of T.list){ const ro=__tg.getRO(id); if(ro.operations.some(o=>o && T.own[o.id])){ r=ro; break; } }
          const L=r.operations.filter(o=>o && T.own[o.id]);
          L.forEach(o=>{ o.declined=false; if(!o.appr) o.appr={s:'ok',by:'test',at:new Date().toISOString()}; o.jobStatus={status:'Hold Tech',setAt:new Date().toISOString(),hand:true}; (o.parts||[]).forEach(x=>{ x.status='Received'; }); });
          T.go(r.id); return { ro: r.id, a: L[0].id, b: (L[1]||L[0]).id }; })()""")
        P.update(Q)
        await pg.evaluate("__tg.render()"); await pg.wait_for_timeout(900)
        await pg.evaluate(JT(f"const r=R.querySelector('.rop-orow[data-op=\"{P['a']}\"]'); if(r && !r.classList.contains('is-on')) r.click(); return 1")); await pg.wait_for_timeout(700)
        await pg.evaluate(JT(f"const g=R.querySelector('.ock[data-op=\"{P['a']}\"] [data-ock=go]'); if(g) g.click(); return !!g")); await pg.wait_for_timeout(900)
        for _ in range(2):
            pop = await pg.evaluate(JT("const b=R.querySelector('.ock-rsn button, .rsnPick button, [data-ock-r]'); if(b){ b.click(); return b.textContent; } return null"))
            if pop: await pg.wait_for_timeout(600)
        runs = await pg.evaluate(RUNS)
        ok([P["An"], P["a"]] in runs or any(r[1] == P["a"] for r in runs), f"Start on the mounted clock card runs the tech's clock ({runs})")
        await pg.evaluate(JT(f"const g=R.querySelector('.ock[data-op=\"{P['a']}\"] [data-ock=go]'); if(g) g.click(); return !!g")); await pg.wait_for_timeout(700)
        for _ in range(3):
            rs = await pg.evaluate(JT("const b=R.querySelector('[data-ock-r]'); if(b){ b.click(); return b.textContent; } return null"))
            if not rs: break
            await pg.wait_for_timeout(600)
        await pg.evaluate("(()=>{ const b=document.querySelector('.pgask .btn-primary, .pgask button'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)
        runs2 = await pg.evaluate(RUNS)
        ok(not any(r[1] == P["a"] for r in runs2), f"…and Stop stops it ({runs2})")
        await pg.evaluate("__tg.render()"); await pg.wait_for_timeout(500)
        nu = await pg.evaluate(f"(document.querySelector('{TP} .tch-jcp .tch-top .cq-nextup')||{{}}).textContent||''")
        if "Next" not in nu: print("    dbg", await pg.evaluate("(()=>{ const S=__tg.CX.S(); const me=S.me; const L=__tg.STATE().punches.filter(p=>p.stop && p.by===me).map(p=>[p.opId, Date.now()-new Date(p.stop)]).slice(-2); return [!!S.rp, me, L, S.ops.filter(x=>x.st==='next').length, (document.querySelector('[data-pg=tech] .tch-top')||{}).innerHTML||'none']; })()"))
        ok("Next" in nu, f"Next up shows above the RO after a stop ({nu[:60]})")
        # someone else's operation: the tech can't start it
        await pg.evaluate(f"(()=>{{ const T=__tg.tcxGet(); delete T.own['{P['b']}']; }})()")
        await pg.evaluate(JT(f"const r=R.querySelector('.rop-orow[data-op=\"{P['b']}\"]'); if(r && !r.classList.contains('is-on')) r.click(); return 1")); await pg.wait_for_timeout(700)
        await pg.evaluate(JT(f"const g=R.querySelector('.ock[data-op=\"{P['b']}\"] [data-ock=go]'); if(g) g.click(); return !!g")); await pg.wait_for_timeout(700)
        t = await pg.evaluate(JT("return (R.getElementById('toast')||{}).textContent||''")) + (await pg.evaluate("(document.querySelector('.toast-wrap')||{}).textContent||''"))
        runs3 = await pg.evaluate(RUNS)
        ok("isn’t yours" in t and not any(r[1] == P["b"] for r in runs3), f"a tech can't start someone else's operation ({t[:70]})")
        await pg.evaluate("__tg.render()"); await pg.wait_for_timeout(400)
        # add a part from the Parts tab, the RO page's own
        await pg.evaluate(JT(f"const r=R.querySelector('.rop-orow[data-op=\"{P['a']}\"]'); if(r && !r.classList.contains('is-on')) r.click(); return 1")); await pg.wait_for_timeout(600)
        await pg.evaluate(JT("const t=[...R.querySelectorAll('.px-tabs [role=tab]')].find(b=>/Parts/.test(b.textContent)); if(t) t.click(); return !!t")); await pg.wait_for_timeout(500)
        n0 = await pg.evaluate(f"__tg.getRO('{P['ro']}').operations.find(o=>o.id==='{P['a']}').parts.length")
        await pg.evaluate(JT("const b=[...R.querySelectorAll('.rop-tacts button')].find(b=>/Add part/.test(b.title||b.getAttribute('aria-label')||'')); if(b) b.click(); return !!b")); await pg.wait_for_timeout(500)
        got = await pg.evaluate(JT("const i=R.querySelector('.rop-padd'); if(!i) return false; i.focus(); return true"))
        if got: await pg.keyboard.type("4988201 x2 brake chamber $45.99"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
        n1 = await pg.evaluate(f"__tg.getRO('{P['ro']}').operations.find(o=>o.id==='{P['a']}').parts.length")
        ok(got and n1 == n0 + 1, f"the Parts tab's Add part (the RO page's) adds a part here ({n0}→{n1})")
        # change a status from the operation's pill
        await pg.evaluate(JT(f"const b=R.querySelector('.rop-orow[data-op=\"{P['b']}\"] .pgst.m'); if(b) b.click(); return !!b")); await pg.wait_for_timeout(400)
        pk = await pg.evaluate(JT("const m=[...R.querySelectorAll('.px-pop [role=menuitemradio], .px-pop .px-menu__item')].find(b=>/Waiting – Foreman/.test(b.textContent)); if(m){ m.click(); return true; } return false"))
        await pg.wait_for_timeout(600)
        st = await pg.evaluate(f"(()=>{{ const o=__tg.getRO('{P['ro']}').operations.find(o=>o.id==='{P['b']}'); return (o.jobStatus||{{}}).status || ''; }})()")
        ok(pk and "Foreman" in st, f"an operation's status changes from its pill ({st})")
        # Ask <foreman> on the truck card opens Messages to them
        await pg.evaluate(JT("const b=R.querySelector('.rop-askf'); if(b) b.click(); return !!b")); await pg.wait_for_timeout(700)
        ak = await pg.evaluate(JT("const a=R.activeElement; return [!!R.querySelector('.rop-askf'), a ? a.className : '', [...R.querySelectorAll('.rop-to .is-on')].map(x=>x.textContent).join(',')]"))
        ok(ak[0] and "rop-in__i" in ak[1] and "Foreman" in ak[2], f"Ask <foreman> is on the truck card and opens a message to them ({ak})")
        await pg.keyboard.press("Escape")
        # Sent to you: shows on the left, Done ticks it off
        ns = await pg.evaluate(f"document.querySelectorAll('{TP} .tch-sent').length")
        if ns:
            await pg.click(f"{TP} .tch-sent [data-a=tsentx]"); await pg.wait_for_timeout(500)
            ns2 = await pg.evaluate(f"document.querySelectorAll('{TP} .tch-sent').length")
            ok(ns2 == ns - 1, f"Sent to you: Done ticks one off ({ns}→{ns2})")
        else:
            print("    (no Sent to you items for this tech in the sample)")
        # the admin looking at a tech's page: the clock stays theirs
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); __tg.pxSignedIn(); __tg.UI().view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        bar3 = await pg.evaluate(BAR)
        ok("’s ROs" in bar3[0], f"the admin's view reads <Tech>'s ROs ({bar3})")
        await pg.evaluate(JT("const g=R.querySelector('.rop-band .px-btn--primary'); if(g && /Start/.test(g.textContent)) g.click(); return 1")); await pg.wait_for_timeout(500)
        t2 = await pg.evaluate(JT("return (R.getElementById('toast')||{}).textContent||''")) + (await pg.evaluate("(document.querySelector('.toast-wrap')||{}).textContent||''"))
        runs4 = await pg.evaluate("(()=>__tg.STATE().punches.filter(p=>!p.stop && /admin/i.test(p.by||'')).length)()")
        ok("starts and stops on their sign-in" in t2 and runs4 == 0, f"…and doesn't start their clock ({t2[:70]}, admin punches {runs4})")
        # the RO page itself, as before
        rid = await pg.evaluate("__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length).id")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(1000)
        rp = await pg.evaluate("(()=>{ const h=document.querySelector('.ro-detail-pane[data-jc] .jc-host'); const R=h&&h.shadowRoot; return R ? [(R.querySelector('.px-crumb')||{}).textContent, (R.querySelector('.px-head__pager span')||{}).textContent, R.querySelectorAll('.rop-orow').length, !!R.querySelector('.rop-askf')] : null; })()")
        ok(rp and not rp[0].endswith("’s ROs" + rp[0][-9:]) and "’s ROs" not in rp[0] and rp[2] >= 1 and not rp[3], f"the RO page is the same RO page (no Ask on its truck card) ({rp})")
        # the ROs tab, when the RO list can be shown in a page
        has = await pg.evaluate("typeof __tg.rlEmbed === 'function'")
        if has:
            await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(700)
            await pg.evaluate(f"(()=>{{ const b=document.querySelector('{TP} .tch-views [data-v=ros]'); if(b) b.click(); }})()"); await pg.wait_for_timeout(800)
            emb = await pg.evaluate(f"[!!document.querySelector('{TP} .tch-views [data-v=ros].on'), document.querySelectorAll('{TP} [data-pg=rolist] .rq-row, {TP} [data-pg=rolist] .rl-row').length]")
            ok(emb[0] and emb[1] > 3, f"the ROs tab, last, shows the RO list ({emb})")
            await pg.evaluate(f"(()=>{{ const b=document.querySelector('{TP} .tch-views [data-v=list]'); if(b) b.click(); }})()"); await pg.wait_for_timeout(500)
        else:
            print("    (rlEmbed not in this build — the ROs tab stays hidden)")
        # dark
        await pg.evaluate("(()=>{ document.documentElement.setAttribute('data-theme','ivd'); const U=__tg.UI(); U.view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "b2_dark.png"))
        ok(await pg.evaluate(JT("return R.querySelectorAll('.rop-orow').length")) >= 1, "dark: the mounted RO page draws")
        # phone: the list first, an RO opens the RO view stacked, its crumb goes back
        await pg.evaluate("document.documentElement.setAttribute('data-theme','ivl')")
        await pg.set_viewport_size({"width": 390, "height": 844})
        await pg.evaluate("(()=>{ localStorage.setItem('tec_device','phone'); __tg.render(); })()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ try{ __tg.setDevice && __tg.setDevice('phone'); }catch(e){} document.documentElement.setAttribute('data-device','phone'); __tg.render(); })()"); await pg.wait_for_timeout(900)
        vis = lambda sel: f"(()=>{{ const e=document.querySelector('{sel}'); if(!e) return false; const r=e.getBoundingClientRect(); return r.width>0 && r.height>0 && getComputedStyle(e).display!=='none'; }})()"
        l0 = await pg.evaluate(vis(f"{TP} .tch-list")); m0 = await pg.evaluate(vis(f"{TP} .tch-jc"))
        await pg.evaluate(f"(()=>{{ const it=[...document.querySelectorAll('{TP} .tch-list .tg-it')].find(x=>!x.classList.contains('tch-sent')); if(it) it.click(); }})()"); await pg.wait_for_timeout(1000)
        l1 = await pg.evaluate(vis(f"{TP} .tch-list")); m1 = await pg.evaluate(vis(f"{TP} .tch-jc .jc-host"))
        await pg.screenshot(path=os.path.join(OUT, "b3_phone.png"))
        await pg.evaluate(JT("const a=R.querySelector('.px-crumb a'); if(a) a.click(); return 1")); await pg.wait_for_timeout(800)
        l2 = await pg.evaluate(vis(f"{TP} .tch-list"))
        ok(l0 and not m0 and m1 and not l1 and l2, f"phone: the list first, an RO opens the RO view, its crumb goes back ({l0},{m0} → {l1},{m1} → {l2})")
        ok(not errs, f"no console errors: {errs[:3]}")
        print("FAILS:", len(FAILS), FAILS)
        await b.close()
asyncio.run(main())
