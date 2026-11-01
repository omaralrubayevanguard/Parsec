# Parsec 16.3 (A) — RO numbers open their RO on every page (not the RO page), ↗ on hover, the RO's picture in RO rows,
# the ⋯ shop menu on the Technician / Foreman / Parts cards (respects v163ShopOk), the contact on the customer's name.
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots163a"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12_163a.html"
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
SIGN = """((role)=>{ const T=__tg.staffList().filter(s=>s.role===role); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name && !r.dateClosed).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{ __tg.CX.U().skipMorning = __tg.todayStr(); }catch(e){} __tg.UI().view = 'rolist'; __tg.render(); return T[0].name; })"""
GO = "((v)=>{ const U=__tg.UI(); U.view=v; U.modal=null; U.tgPop=null; __tg.render(); })"
CHECK = r"""(()=>{ const S=__tg.STATE(); const L=[...document.querySelectorAll('#app .ro-lnk[data-rolnk]')]; let bad=[]; L.forEach(l=>{ const r=S.ros.find(x=>x.id===l.dataset.rolnk); const d=(l.textContent.match(/\d+/)||[''])[0]; const all=String(r&&r.roNumber||'').replace(/\D/g,''); if(!r || !(all===d || all.slice(-d.length)===d)) bad.push(l.textContent); }); return {n:L.length, bad:bad.slice(0,5)}; })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        await pg.evaluate(SIGN + "('Manager')"); await pg.wait_for_timeout(300)
        # 1 · links on the pages, each pointing at the RO with that number
        for v, need in [("rolist", 10), ("foreman", 3), ("parts", 3), ("warranty", 10), ("triage", 3), ("fixes", 3), ("assets", 1)]:
            await pg.evaluate(GO + f"('{v}')"); await pg.wait_for_timeout(700)
            R = await pg.evaluate(CHECK)
            ok(R["n"] >= need and not R["bad"], f"{v}: {R['n']} RO numbers are links, all to the right RO {R['bad']}")
        await pg.evaluate(GO + "('manager')"); await pg.wait_for_timeout(700)
        R = await pg.evaluate(CHECK); nb = await pg.evaluate("[...document.querySelectorAll('.mq-nd p > b')].filter(x=>/^\\d{3,}/.test(x.textContent.trim())).length")
        ok((R["n"] >= 1 or nb == 0) and not R["bad"], f"manager: {R['n']} links in the Needs you cards ({nb} cards name an RO) {R['bad']}")
        ok(await pg.evaluate("[...document.querySelectorAll('#app button .ro-lnk, #app a .ro-lnk, #app input .ro-lnk')].length") == 0, "no link inside a button, a link or a field")
        # 2 · the RO page itself has none of these links (its own copy-on-click is Fork B's)
        rid = await pg.evaluate("__tg.STATE().ros.filter(r=>!r.shop && r.id!=='ro_shop' && !r.dateClosed)[0].id")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        ok(await pg.evaluate(f"{SR}.querySelectorAll('.ro-lnk').length") == 0, "the RO page (its shadow root) has no RO links")
        # 3 · Foreman: clicking the number opens the RO, the row's own click doesn't fire, Back goes to Foreman
        await pg.evaluate(GO + "('foreman')"); await pg.wait_for_timeout(700)
        await pg.evaluate("__tg.UI().fmSel = 'zzz'")
        tgt = await pg.evaluate("(()=>{ const l=document.querySelector('.tg.fm .tg-it .ro-lnk'); return l ? l.dataset.rolnk : null; })()")
        await pg.click(".tg.fm .tg-it .ro-lnk"); await pg.wait_for_timeout(700)
        U = await pg.evaluate("(()=>{ const U=__tg.UI(); return {v:U.view, s:U.selectedRo, f:U.roFrom, fm:U.fmSel}; })()")
        ok(U["v"] == "ros" and U["s"] == tgt, f"Foreman: the number opens its RO ({U['s']} == {tgt})")
        ok(U["fm"] == "zzz", "Foreman: the row's own click didn't fire")
        ok(U["f"] == "foreman", "the RO page's Back goes to Foreman")
        # warranty → RO, keyboard Enter
        await pg.evaluate(GO + "('warranty')"); await pg.wait_for_timeout(700)
        tgt = await pg.evaluate("(()=>{ const l=document.querySelector('#app .tg-it .ro-lnk'); l.focus(); return l.dataset.rolnk; })()")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(600)
        ok(await pg.evaluate("__tg.UI().view") == "ros" and await pg.evaluate("__tg.UI().selectedRo") == tgt, "Warranty: Enter on a focused number opens its RO")
        # RO list: clicking the number opens the RO page directly
        await pg.evaluate(GO + "('rolist')"); await pg.wait_for_timeout(700)
        tgt = await pg.evaluate("document.querySelector('.rq-row .ro-lnk').dataset.rolnk")
        await pg.click(".rq-row .ro-lnk"); await pg.wait_for_timeout(600)
        ok(await pg.evaluate("__tg.UI().view") == "ros" and await pg.evaluate("__tg.UI().selectedRo") == tgt, "RO list: the number opens the RO page")
        # 4 · ↗ when you point at it
        await pg.evaluate(GO + "('parts')"); await pg.wait_for_timeout(700)
        o0 = await pg.evaluate("getComputedStyle(document.querySelector('#app .tg-it .ro-lnk'), '::after').opacity")
        await pg.hover("#app .tg-it .ro-lnk"); await pg.wait_for_timeout(300)
        A = await pg.evaluate("(()=>{ const l=document.querySelector('#app .tg-it .ro-lnk'); const s=getComputedStyle(l,'::after'); return [s.opacity, s.content, getComputedStyle(l).color]; })()")
        ok(o0 == "0" and A[0] == "1" and "↗" in A[1], f"↗ shows only when pointed at ({o0} → {A[0]} {A[1]})")
        await pg.screenshot(path=OUT + "/a1_parts.png")
        # 5 · pictures in RO rows that had none: Parts, Warranty, Manager cards
        for v in ["parts", "warranty"]:
            await pg.evaluate(GO + f"('{v}')"); await pg.wait_for_timeout(700)
            n = await pg.evaluate("document.querySelectorAll('#app .tg-it > .tg-gi.rl-gi .trk-th').length")
            bd = await pg.evaluate("document.querySelectorAll('#app .tg-it > .tg-gi.rl-gi > .rl-gib').length")
            ok(n >= 3 and bd >= 1, f"{v}: {n} rows show the RO's picture, the old icon kept as a badge ({bd})")
            await pg.screenshot(path=OUT + f"/a2_{v}.png")
        await pg.evaluate(GO + "('manager')"); await pg.wait_for_timeout(700)
        n = await pg.evaluate("document.querySelectorAll('.mq-nd .rl-mqp .trk-th').length"); nl = await pg.evaluate("document.querySelectorAll('.mq-nd .ro-lnk').length")
        ok(n == nl, f"Manager Needs-you cards that name an RO show its picture ({n} of {nl})")
        await pg.screenshot(path=OUT + "/a3_manager.png")
        # pictures stay put through a full redraw (no flicker): the same elements survive render()
        await pg.evaluate(GO + "('parts')"); await pg.wait_for_timeout(700)
        same = await pg.evaluate("(()=>{ const a=document.querySelector('#app .tg-it .ro-lnk'); a.__mark=1; __tg.render(); const b=document.querySelector('#app .tg-it .ro-lnk'); return b && b.__mark===1; })()")
        ok(same, "a redraw keeps the same link element (no flicker)")
        # 6 · the ⋯ menu — Foreman
        await pg.evaluate(GO + "('foreman')"); await pg.wait_for_timeout(700)
        await pg.evaluate("__tg.UI().fmSel = 'zzz'")
        nm = await pg.evaluate("document.querySelectorAll('.tg.fm .tg-it > .rl-more').length")
        ok(nm >= 3, f"Foreman cards have a ⋯ ({nm})")
        rid = await pg.evaluate("(()=>{ const S=__tg.STATE(); const b=[...document.querySelectorAll('.tg.fm .tg-it > .rl-more')].find(x=>{ const r=S.ros.find(y=>y.id===x.dataset.rlmore); return r && __tg.rl163Items(r).some(i=>i.k==='roadtest'); }) || document.querySelector('.tg.fm .tg-it > .rl-more'); b.id='rl-t'; return b.dataset.rlmore; })()")
        await pg.click("#rl-t"); await pg.wait_for_timeout(300)
        M = await pg.evaluate("[...document.querySelectorAll('.rl-menu .rl-mi')].map(x=>x.dataset.rlact)")
        ok(len(M) >= 1 and "transfer" in M, f"⋯ opens the shop menu {M}")
        ok(await pg.evaluate("__tg.UI().fmSel") == "zzz", "⋯ doesn't select the card")
        await pg.screenshot(path=OUT + "/a4_menu.png")
        if "roadtest" in M:
            await pg.click(".rl-menu .rl-mi[data-rlact=roadtest]"); await pg.wait_for_timeout(500)
            P = await pg.evaluate("(()=>{ const P=__tg.UI().tgPop; return P ? [P.type, P.ro, !!document.querySelector('.trx-layer .tg-pop')] : null; })()")
            ok(P and P[0] == "road" and P[1] == rid and P[2], f"Road test from the ⋯ opens the road test pop-over {P}")
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await pg.evaluate(GO + "('foreman')"); await pg.wait_for_timeout(500)
        await pg.click(f".tg.fm .rl-more[data-rlmore=\"{rid}\"]"); await pg.wait_for_timeout(300)
        await pg.click(".rl-menu .rl-mi[data-rlact=transfer]"); await pg.wait_for_timeout(500)
        P = await pg.evaluate("(()=>{ const P=__tg.UI().tgPop; return P ? [P.type, P.ro, !!document.querySelector('.trx-layer .tg-pop'), (document.querySelector('.trx-layer .tg-pop')||{}).textContent||''] : null; })()")
        ok(P and P[0] == "xfer" and P[1] == rid and P[2], f"Transfer… from the ⋯ opens the Send-to pop-over on the Foreman page {P and P[3][:60]}")
        await pg.screenshot(path=OUT + "/a5_xfer.png")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("!__tg.UI().tgPop"), "Esc closes it")
        # v163ShopOk (Fork C) turns functions off
        await pg.evaluate("window.v163ShopOk = (ro, a) => a !== 'transfer' && a !== 'roadtest'")
        await pg.evaluate(f"(()=>{{ const S=__tg.STATE(), r=__tg.getRO('{rid}'); const k=String(r.department||'').trim().replace(/\\s+/g,' ').toLowerCase()||'_none'; window.__sb0=S.shopBtns; S.shopBtns={{[k]:{{transfer:false, roadtest:false}}}}; __tg.render(); }})()")   # 16.3 combined: Fork C's real setting
        await pg.evaluate(GO + "('foreman')"); await pg.wait_for_timeout(500)
        await pg.click(f".tg.fm .rl-more[data-rlmore=\"{rid}\"]"); await pg.wait_for_timeout(300)
        M2 = await pg.evaluate("[...document.querySelectorAll('.rl-menu .rl-mi')].map(x=>x.dataset.rlact)")
        ok("transfer" not in M2 and "roadtest" not in M2, f"v163ShopOk false hides those functions {M2}")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        ok(await pg.evaluate("!document.querySelector('.rl-menu')"), "Esc closes the ⋯ menu")
        await pg.evaluate("delete window.v163ShopOk; (()=>{ const S=__tg.STATE(); if(window.__sb0===undefined) delete S.shopBtns; else S.shopBtns=window.__sb0; __tg.render(); })()")
        # Parts cards have it too
        await pg.evaluate(GO + "('parts')"); await pg.wait_for_timeout(600)
        ok(await pg.evaluate("document.querySelectorAll('[data-pg=\"parts\"] .tg-it > .rl-more').length") >= 2, "Parts cards have a ⋯")
        # 7 · the contact on the customer's name
        await pg.evaluate("(()=>{ const S=__tg.STATE(); S.ros.forEach(r=>{ if(!r.shop){ r.contactName='Dave Miller'; r.contactPhone='(336) 555-0142'; } }); })()")
        await pg.evaluate(GO + "('foreman')"); await pg.wait_for_timeout(700)
        T = await pg.evaluate("(()=>{ const e=document.querySelector('.tg.fm .tg-it .rl-hascu'); return e ? [e.textContent, e.getAttribute('data-tip')] : null; })()")
        ok(T and T[1] == "Dave Miller · (336) 555-0142", f"Foreman card: the customer carries the contact {T}")
        await pg.hover(".tg.fm .tg-it .rl-hascu"); await pg.wait_for_timeout(900)
        tip = await pg.evaluate("(()=>{ const t=document.getElementById('ptip'); return t && getComputedStyle(t).opacity!=='0' && getComputedStyle(t).display!=='none' && getComputedStyle(t).visibility!=='hidden' ? t.textContent : ''; })()")
        ok("555-0142" in tip, f"pointing at the customer shows the contact: {tip[:60]}")
        await pg.screenshot(path=OUT + "/a6_contact.png")
        await pg.evaluate(GO + "('rolist')"); await pg.wait_for_timeout(600)
        ok(await pg.evaluate("!!document.querySelector('.rq-row .rl-hascu[data-tip=\"Dave Miller · (336) 555-0142\"]')"), "RO list: the customer carries the contact")
        await pg.evaluate("(()=>{ const S=__tg.STATE(); S.ros.forEach(r=>{ delete r.contactName; delete r.contactPhone; }); })()")
        await pg.evaluate(GO + "('parts')"); await pg.wait_for_timeout(600)
        ok(await pg.evaluate("document.querySelectorAll('#app .rl-hascu').length") == 0, "no contact → no tooltip on the customer")
        # 8 · Technician: the ⋯ starts the next op
        await pg.evaluate(SIGN + "('Technician')"); await pg.wait_for_timeout(300)
        await pg.evaluate(GO + "('tech')"); await pg.wait_for_timeout(900)
        nm = await pg.evaluate("document.querySelectorAll('[data-pg=\"tech\"] .tch-it > .rl-more').length")
        ok(nm >= 1, f"Technician cards have a ⋯ ({nm})")
        R = await pg.evaluate(CHECK); ok(R["n"] >= 3 and not R["bad"], f"tech: {R['n']} RO numbers are links {R['bad']}")
        sel0 = await pg.evaluate("__tg.CX && __tg.CX.U ? null : null")
        b2 = await pg.evaluate("(()=>{ const S=__tg.STATE(); const rp=S.punches.find(p=>!p.stop); const bs=[...document.querySelectorAll('[data-pg=\"tech\"] .tch-it > .rl-more')]; const b=bs.find(x=>{ const r=S.ros.find(y=>y.id===x.dataset.rlmore); return r && __tg.rl163Items(r).some(i=>i.k==='start'); }); if(!b) return null; b.id='rl-s'; return b.dataset.rlmore; })()")
        if b2:
            await pg.click("#rl-s"); await pg.wait_for_timeout(300)
            op = await pg.evaluate("document.querySelector('.rl-menu .rl-mi[data-rlact=start]').dataset.op")
            await pg.click(".rl-menu .rl-mi[data-rlact=start]"); await pg.wait_for_timeout(700)
            rp = await pg.evaluate("(()=>{ const p=__tg.STATE().punches.find(p=>!p.stop); return p ? [p.roId, p.opId] : null; })()")
            ok(rp and rp[0] == b2 and rp[1] == op, f"Start op N from the ⋯ starts the clock on that op {rp}")
        else: ok(False, "a Technician card offers Start op")
        await pg.screenshot(path=OUT + "/a7_tech.png")
        # 9 · Time Log numbers
        await pg.evaluate(GO + "('timelog')"); await pg.wait_for_timeout(900)
        R = await pg.evaluate(CHECK); ok(not R["bad"], f"timelog: {R['n']} links, all right {R['bad']}")
        ok(await pg.evaluate("document.querySelectorAll('.tk-b .ro-lnk').length") == 0, "the Shop view's thin bars keep their own click")
        # phone width: no sideways scroll on Foreman with the ⋯
        await pg.set_viewport_size({"width": 390, "height": 840}); await pg.evaluate(SIGN + "('Manager')"); await pg.evaluate(GO + "('foreman')"); await pg.wait_for_timeout(700)
        sw = await pg.evaluate("document.documentElement.scrollWidth"); ok(sw <= 392, f"phone: no sideways scroll ({sw})")
        await pg.screenshot(path=OUT + "/a8_phone.png")
        ok(not errs, f"no page errors {errs[:3]}")
        print(("PASS" if not FAILS else "FAILED %d" % len(FAILS)), len(FAILS))
        await b.close()
asyncio.run(main())
