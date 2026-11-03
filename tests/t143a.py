# Parsec 14.3 (EA) — the ROs tab: the RO list inside Triage, Foreman, Parts, Manager (and Technician when EB's part is in)
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots143a")
E = ".rq-emb"
TABS = "(()=>{ const B=[...document.querySelectorAll('.tg-views button')]; return B.map(b=>[(b.dataset.v||''), b.textContent.trim()]); })()"
async def go(pg, v):
    await pg.evaluate(f"(()=>{{ __tg.UI().view='{v}'; __tg.render(); }})()"); await pg.wait_for_timeout(700)
async def tab(pg):
    await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('.tg-views button')].find(b=>b.dataset.v==='ros'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='rolist'; __tg.render(); })()"); await pg.wait_for_timeout(800)
        nOpen = await pg.evaluate("__tg.rlEmbedCount()")
        # the person's own layout: add Unit # on the RO list page
        await pg.evaluate("(()=>{ const S=__tg.STATE(), me=(__tg.PG?__tg.PG.me():null); })()")
        await pg.click("[data-pg=rolist] [data-a=pop][data-p=disp]"); await pg.wait_for_timeout(300)
        await pg.click("[data-pg=rolist] [data-a=coladd][data-k=unit]"); await pg.wait_for_timeout(300)
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        for v, last in [("triage", "yard"), ("foreman", "tmr"), ("parts", "cat"), ("manager", "act")]:
            await go(pg, v); t = await pg.evaluate(TABS)
            vs = [x[0] for x in t]
            ok(vs and vs[-1] == "ros" and vs[-2] == last and str(nOpen) in t[-1][1], f"{v}: ROs is the last view, with the open count ({t[-2:]}, {nOpen})")
        await go(pg, "foreman"); await tab(pg)
        r = await pg.evaluate(f"(()=>{{ const R=document.querySelector('{E}'); return R ? [R.dataset.host, R.querySelectorAll('.rq-rows .rq-row').length, [...R.querySelectorAll('.rq-head .rq-hc')].map(x=>x.dataset.col), !!document.querySelector('.tg-list')] : null; }})()")
        ok(r and r[0] == "foreman" and "unit" in r[2] and "next" in r[2], f"Foreman ROs tab: the RO list with my columns (Unit # added on the RO list shows here) ({r and r[2]})")
        ok(r and r[1] == nOpen and not r[3], f"…every open RO, no Needs action list beside it ({r and r[1]} rows of {nOpen})")
        await pg.screenshot(path=os.path.join(OUT, "e1_foreman_ros.png"))
        # header sort inside it
        await pg.click(f"{E} .rq-hc[data-col=cust]"); await pg.wait_for_timeout(300)
        names = await pg.evaluate(f"[...document.querySelectorAll('{E} .rq-rows .rq-row .rq-cu b')].map(x=>x.textContent)")
        ok(len(names) > 2 and names == sorted(names, key=str.lower) and await pg.evaluate(f"!!document.querySelector('{E} .rq-sortbar')"), f"a header click sorts the whole list ({names[:3]})")
        await pg.click(f"{E} [data-a=hsclr]"); await pg.wait_for_timeout(300)
        # the RO list's tabs inside it
        await pg.click(f"{E} .rq-seg button[data-g='waiting']"); await pg.wait_for_timeout(300)
        w = await pg.evaluate(f"[__tg.UI().rlGroup, document.querySelectorAll('{E} .rq-rows .rq-row').length, +document.querySelector('{E} .rq-seg button.on span').textContent, __tg.UI().view, __tg.UI().fmView]")
        ok(w[0] == "waiting" and w[1] == w[2] and w[3] == "foreman" and w[4] == "ros", f"the RO list's tabs work inside it and stay on Foreman ({w})")
        await pg.click(f"{E} .rq-seg button[data-g='all']"); await pg.wait_for_timeout(300)
        # Display pop opens inside the tab
        await pg.click(f"{E} [data-a=pop][data-p=disp]"); await pg.wait_for_timeout(300)
        dp = await pg.evaluate(f"(()=>{{ const p=document.querySelector('{E} .tg-pop'); if(!p) return null; const r=p.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), innerWidth]; }})()")
        ok(dp and dp[2] <= dp[3] and dp[1] > 60, f"Display opens under its button, on screen ({dp})")
        await pg.mouse.click(560, 30); await pg.wait_for_timeout(300)
        ok(await pg.evaluate(f"!document.querySelector('{E} .tg-pop')"), "a click outside closes it")
        # host shortcuts rest; the RO list's keys work
        fv = await pg.evaluate("__tg.UI().fmView")
        await pg.keyboard.press("2"); await pg.wait_for_timeout(300)
        await pg.keyboard.press("j"); await pg.wait_for_timeout(300)
        kk = await pg.evaluate(f"[__tg.UI().fmView, !!document.querySelector('{E} .rq-row.is-cur'), __tg.UI().view]")
        ok(kk[0] == "ros" and kk[1] and kk[2] == "foreman", f"Foreman’s own keys (2 = Techs) don't fire; J moves in the list ({kk})")
        # Enter / click opens the RO page with Foreman's crumb
        cur = await pg.evaluate(f"document.querySelector('{E} .rq-row.is-cur').dataset.id")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(1000)
        cr = await pg.evaluate(J("const a=R.querySelector('.px-crumb a'); const pgr=R.querySelector('.px-head__pager span'); return [a ? a.textContent : null, pgr ? pgr.textContent : null]"))
        ok(await pg.evaluate("__tg.UI().view") == "ros" and await pg.evaluate("__tg.UI().selectedRo") == cur and cr[0] == "Foreman", f"Enter opens the RO page; its crumb reads Foreman ({cr})")
        ok(cr[1] is None, f"17.3: no stepper arrows beside the RO number ({cr[1]})")
        await pg.evaluate(J("R.querySelector('.px-crumb a').click()")); await pg.wait_for_timeout(800)
        bk = await pg.evaluate(f"[__tg.UI().view, __tg.UI().fmView, !!document.querySelector('{E}')]")
        ok(bk == ["foreman", "ros", True], f"the crumb goes back to Foreman, ROs tab still on ({bk})")
        # a row click from Parts
        await go(pg, "parts"); await tab(pg)
        rid = await pg.evaluate(f"document.querySelector('{E} .rq-rows .rq-row').dataset.id")
        await pg.click(f"{E} .rq-rows .rq-row .rq-k-cust"); await pg.wait_for_timeout(1000)
        cr2 = await pg.evaluate(J("const a=R.querySelector('.px-crumb a'); return a ? a.textContent : null"))
        ok(await pg.evaluate("__tg.UI().selectedRo") == rid and cr2 == "Parts", f"Parts: a row click opens the RO page, crumb Parts ({cr2})")
        # Triage + Manager render it; the sidebar resets the crumb
        await go(pg, "triage"); await tab(pg); t1 = await pg.evaluate(f"document.querySelectorAll('{E} .rq-rows .rq-row').length")
        await pg.screenshot(path=os.path.join(OUT, "e2_triage_ros.png"))
        await go(pg, "manager"); await tab(pg); t2 = await pg.evaluate(f"document.querySelectorAll('{E} .rq-rows .rq-row').length")
        ok(t1 == nOpen and t2 == nOpen, f"Triage and Manager show every open RO too ({t1}, {t2})")
        await pg.evaluate("(()=>{ const b=document.querySelector('nav [data-view=rolist], .sidebar [data-view=rolist]'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)
        await pg.click("[data-pg=rolist] .rq-rows .rq-row"); await pg.wait_for_timeout(400)
        await pg.evaluate("(()=>{ const b=document.querySelector('[data-pg=rolist] .rq-peek [data-a=open], [data-pg=rolist] [data-a=open]'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
        cr3 = await pg.evaluate(J("const a=R.querySelector('.px-crumb a'); return a ? a.textContent : null"))
        ok(cr3 == "RO list", f"opened from the RO list page, the crumb still reads RO list ({cr3})")
        # permission: no RO list page → no tab
        hid = await pg.evaluate("(()=>{ const T=__tg.staffList().find(s=>s.role==='Parts'); if(!T) return 'no parts person'; const was=__tg.navAllowed; localStorage.setItem('tec_viewas', T.id); __tg.pxSignedIn(); __tg.UI().view='parts'; __tg.render(); const ok1=__tg.rlEmbOk ? null : null; return [__tg.navAllowed ? __tg.navAllowed('rolist') : '?', [...document.querySelectorAll('.tg-views button')].some(b=>b.dataset.v==='ros')]; })()")
        ok(isinstance(hid, list) and hid[0] == hid[1], f"the tab follows the RO list page permission ({hid})")
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); __tg.pxSignedIn(); __tg.render(); })()"); await pg.wait_for_timeout(300)
        # phone + dark
        await pg.set_viewport_size({"width": 390, "height": 844}); await pg.evaluate("document.documentElement.setAttribute('data-theme','ivd'); __tg.UI().view='foreman'; __tg.UI().fmView='ros'; __tg.render()"); await pg.wait_for_timeout(900)
        ph = await pg.evaluate(f"[document.documentElement.getAttribute('data-device'), document.querySelectorAll('{E} .rq-rows .rq-row').length, document.documentElement.scrollWidth <= innerWidth + 2]")
        await pg.screenshot(path=os.path.join(OUT, "e3_phone_dark.png"))
        ok(ph[1] > 0 and ph[2], f"phone: the cards show, no sideways scroll ({ph})")
        ok(not errs, f"no console errors: {errs[:3]}")
        print("FAILS:", len(FAILS), FAILS)
        await b.close()
asyncio.run(main())
