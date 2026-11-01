# Parsec 13 (A) — the login page, the PIN pad, the quick switcher, stepping away, the end of the shop day
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_a.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots130a"); os.makedirs(OUT, exist_ok=True)
ST = "__tg.lgState()"
async def pin(pg, digits, gap=60):
    for d in digits: await pg.keyboard.press(d); await pg.wait_for_timeout(gap)
    await pg.wait_for_timeout(450)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        X = await pg.evaluate("""(()=>{ const L=__tg.staffList(), by=r=>L.filter(s=>s.role===r);
          const T=by('Technician'), F=by('Foreman')[0];
          __tg.pinSet(T[1],'2222'); __tg.pinSet(T[2],'3333'); __tg.pinClear(T[3]); __tg.pinSet(T[0],'1111'); __tg.pinSet(F,'5555',true); __tg.adminPinSet('');
          return { mike: T[0].id, Mn: T[0].name, dana: T[1].id, Dn: T[1].name, luis: T[2].id, Ln: T[2].name, priya: T[3].id, Pn: T[3].name, frank: F.id, Fn: F.name, n: L.filter(s=>!s.off && !s.noSignIn).length }; })()""")
        print("   ", X)
        # 1. the login page
        await pg.evaluate("__tg.pxLogout(false); __tg.render()"); await pg.wait_for_timeout(500)
        r = await pg.evaluate("""(()=>{ const q=s=>document.querySelector(s); return { lgp: !!q('.lgp'), tiles: document.querySelectorAll('.lg-t').length, groups: [...document.querySelectorAll('.lg-gl')].map(x=>x.textContent),
          adm: !!q('.lg-adm'), time: (q('[data-lg-t]')||{}).textContent, clocks: (q('.pxs-clks small')||{}).textContent || '', dots: document.querySelectorAll('.lg-t .lg-dot').length, locks: document.querySelectorAll('.lg-t .pin').length, foot: (q('.lg-foot')||{}).textContent }; })()""")
        ok(r["lgp"] and r["tiles"] == X["n"] and "Service technicians" in r["groups"] and "Recent on this computer" not in r["groups"], f"the login page: every person once, grouped by department ({r['tiles']} tiles, {r['groups']})")
        ok(r["adm"] and "Forgot your PIN" in r["foot"] and r["time"] and r["locks"] == r["tiles"], f"the Admin as a small link, the time, a lock on every tile ({r['time']})")
        ok("running" in r["clocks"] and r["dots"] >= 1, f"the clocks that are running, and a dot on who's on one ({r['clocks']}, {r['dots']} dots)")
        await pg.screenshot(path=os.path.join(OUT, "a1_login.png"))
        # 2. Dana: a wrong PIN, then the right one
        await pg.click(f".lg-t[data-id='{X['dana']}']"); await pg.wait_for_timeout(300)
        s = await pg.evaluate(ST)
        ok(s["open"] and s["mode"] == "pin" and s["who"] == X["dana"], f"her tile opens the PIN pad ({s})")
        await pin(pg, "1234")
        m = await pg.evaluate("document.querySelector('#lgpin .lg-msg').textContent")
        ok("Not right" in m and "4 tries left" in m, "a wrong PIN: " + m)
        await pg.screenshot(path=os.path.join(OUT, "a2_wrong.png"))
        await pin(pg, "2222"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("[localStorage.getItem('tec_viewas'), __tg.UI().toast||'', __tg.recentList()[0], __tg.auditLog().slice(-1)[0].type, __tg.lgState().open]")
        ok(r[0] == X["dana"] and "Signed in as " + X["Dn"] in r[1] and r[2] == X["dana"] and r[3] == "signin" and not r[4], f"the right PIN signs her in, on the record, recent first ({r})")
        # 3. recent on this computer
        await pg.evaluate("__tg.pxLogout(false); __tg.render()"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("[[...document.querySelectorAll('.lg-gl')].map(x=>x.textContent)[0], (document.querySelector('.lg-pp .lg-t')||{}).dataset.id, document.querySelectorAll('.lg-t').length]")
        ok(r[0] == "Recent on this computer" and r[1] == X["dana"] and r[2] == X["n"], f"recent on this computer first, nobody twice ({r})")
        # 4. five wrong tries, then a minute
        await pg.click(f".lg-t[data-id='{X['luis']}']"); await pg.wait_for_timeout(250)
        for i in range(5): await pin(pg, "9090", 40)
        r = await pg.evaluate(f"[document.querySelector('#lgpin .lg-msg').textContent, document.querySelectorAll('#lgpin .lg-pad button[disabled]').length, __tg.pinWaitMs('{X['luis']}') > 50000]")
        ok("Five wrong tries" in r[0] and r[1] == 10 and r[2], f"five wrong tries: a minute's wait, the pad off ({r})")
        await pin(pg, "3333")
        ok(await pg.evaluate("localStorage.getItem('tec_viewas')") is None, "…the right PIN doesn't get in while it waits")
        await pg.screenshot(path=os.path.join(OUT, "a3_wait.png"))
        await pg.evaluate(f"__tg.pinFailClear('{X['luis']}')"); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        ok(not (await pg.evaluate(ST))["open"], "Esc closes the pad")
        # 5. no PIN yet: pick one, twice
        await pg.click(f".lg-t[data-id='{X['priya']}']"); await pg.wait_for_timeout(250)
        s = await pg.evaluate(ST); sub = await pg.evaluate("document.querySelector('#lgpin .lg-sub').textContent")
        ok(s["mode"] == "new1" and "Pick a 4-digit PIN" in sub, f"no PIN yet: she picks one ({sub})")
        await pin(pg, "4444"); s1 = (await pg.evaluate(ST))["mode"]
        await pin(pg, "4445"); s2 = await pg.evaluate(ST); m2 = await pg.evaluate("document.querySelector('#lgpin .lg-msg').textContent")
        ok(s1 == "new2" and s2["mode"] == "new1" and "didn’t match" in m2, f"typed again — a mismatch starts over ({s1}, {m2})")
        await pin(pg, "4444"); await pin(pg, "4444"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"(()=>{{ const sf=__tg.staffList().find(s=>s.id==='{X['priya']}'); return [localStorage.getItem('tec_viewas'), __tg.pinOk(sf,'4444'), JSON.stringify(sf).indexOf('4444') < 0]; }})()")
        ok(r == [X["priya"], True, True], f"…and she's in; her PIN works and isn't stored as typed ({r})")
        # 6. a temporary PIN: they pick their own
        await pg.evaluate("__tg.pxLogout(false); __tg.render()"); await pg.wait_for_timeout(300)
        await pg.click(f".lg-t[data-id='{X['frank']}']"); await pg.wait_for_timeout(250)
        await pin(pg, "5555"); s = await pg.evaluate(ST); sub = await pg.evaluate("document.querySelector('#lgpin .lg-sub').textContent")
        ok(s["mode"] == "new1" and s["why"] == "temp" and "temporary" in sub, f"a temporary PIN: pick your own ({sub})")
        await pin(pg, "6666"); await pin(pg, "6666"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"(()=>{{ const sf=__tg.staffList().find(s=>s.id==='{X['frank']}'); return [localStorage.getItem('tec_viewas'), !!sf.pinTemp, __tg.pinOk(sf,'6666'), __tg.pinOk(sf,'5555'), __tg.auditLog().filter(a=>a.type==='pin').slice(-1)[0].text]; }})()")
        ok(r[0] == X["frank"] and r[1] is False and r[2] and not r[3], f"…he's in with his own; the temporary one is gone ({r})")
        # 7. the Admin: set the PIN the first time, then it's asked for
        await pg.evaluate("__tg.pxLogout(false); __tg.render()"); await pg.wait_for_timeout(300)
        await pg.click(".lg-adm"); await pg.wait_for_timeout(250)
        s = await pg.evaluate(ST)
        ok(s["who"] == "__admin" and s["mode"] == "new1" and s["why"] == "admin", f"no Admin PIN yet: set one ({s})")
        await pin(pg, "7777"); await pin(pg, "7777"); await pg.wait_for_timeout(300)
        r = await pg.evaluate("[localStorage.getItem('tec_out'), localStorage.getItem('tec_viewas'), __tg.adminPinOk('7777')]")
        ok(r[0] is None and r[1] is None and r[2], f"…the Admin is in, and the PIN is set ({r})")
        await pg.evaluate("__tg.pxLogout(false); __tg.render()"); await pg.wait_for_timeout(300)
        await pg.click(".lg-adm"); await pg.wait_for_timeout(250)
        s = await pg.evaluate(ST); await pin(pg, "7777"); await pg.wait_for_timeout(300)
        ok(s["mode"] == "pin" and await pg.evaluate("localStorage.getItem('tec_out')") is None, f"the Admin PIN on the pad ({s['mode']})")
        # 8. the quick switcher, off your name — Dana's clock keeps running
        await pg.evaluate(SIGN(X["dana"]))
        ro_op = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && !/^Complete/.test(__tg.roStatus(r).status) && r.operations.some(o=>!o.declined)); const o=r.operations.find(o=>!o.declined); (o.parts||[]).forEach(x=>x.status='Installed'); return [r.id,o.id]; })()")
        await pg.evaluate(f"__tg.doStartPunch('{ro_op[0]}','{ro_op[1]}','Diagnosing')"); await pg.wait_for_timeout(200)
        await pg.click(".pxr-me"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("[[...document.querySelectorAll('.lgm-pp [data-lg=sw]')].map(x=>x.dataset.id), !!document.querySelector('.lgm-pp [data-action=px-switch]'), !!document.querySelector('[data-lg=lock]'), !!document.querySelector('.px-pop.me [data-action=px-logout]')]")
        ok(r[0] and X["dana"] not in r[0] and r[1] and r[2] and r[3], f"off her name: switch to people, Someone else, Step away, Log out ({r})")
        await pg.screenshot(path=os.path.join(OUT, "a4_switcher.png"))
        if X["frank"] in r[0]:
            await pg.click(f".lgm-pp [data-lg=sw][data-id='{X['frank']}']")
        else:
            await pg.evaluate(f"__tg.lgOpen('{X['frank']}','switch')")
        await pg.wait_for_timeout(300)
        s = await pg.evaluate(ST)
        await pg.screenshot(path=os.path.join(OUT, "a5_switch_pad.png"))
        await pin(pg, "6666"); await pg.wait_for_timeout(300)
        r = await pg.evaluate("[localStorage.getItem('tec_viewas'), __tg.UI().toast||'', __tg.auditLog().filter(a=>a.type==='switch').slice(-1)[0].text, __tg.STATE().punches.filter(p=>!p.stop).map(p=>p.by)]")
        ok(s["ctx"] == "switch" and r[0] == X["frank"] and "keeps running" in r[1] and X["Dn"] + " switched to " + X["Fn"] in r[2] and X["Dn"] in r[3], f"switching asks his PIN; Dana's clock keeps running ({r[1]})")
        # 9. step away: locked; a refresh doesn't get past it; his PIN brings him back
        await pg.click(".pxr-me"); await pg.wait_for_timeout(300)
        await pg.click("[data-lg=lock]"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("[__tg.lockIs(), !!document.querySelector('#lgpin.lock'), (document.querySelector('#lgpin h4')||{}).textContent, (document.querySelector('#lgpin .lg-sub')||{}).textContent, __tg.auditLog().slice(-1)[0].type]")
        ok(r[0] and r[1] and r[2] == X["Fn"] and "Locked at" in r[3] and r[4] == "lock", f"Step away: the lock screen ({r})")
        await pg.screenshot(path=os.path.join(OUT, "a6_lock.png"))
        await pg.reload(); await pg.wait_for_timeout(2500)
        r = await pg.evaluate("[__tg.lockIs(), !!document.querySelector('#lgpin.lock'), localStorage.getItem('tec_viewas')]")
        ok(r[0] and r[1] and r[2] == X["frank"], f"…a refresh doesn't get past it ({r})")
        await pg.keyboard.press("Escape"); await pin(pg, "1212")
        ok(await pg.evaluate("__tg.lockIs() && !!document.querySelector('#lgpin.lock')"), "…Esc and a wrong PIN leave it locked")
        await pin(pg, "6666"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("[__tg.lockIs(), !!document.querySelector('#lgpin'), __tg.UI().toast||'', localStorage.getItem('tec_viewas')]")
        ok(r[0] is False and not r[1] and "Welcome back" in r[2] and r[3] == X["frank"], f"…his PIN brings him back, right where he left it ({r})")
        # 10. Ctrl L, and Not Frank? Switch user
        await pg.mouse.click(700, 400); await pg.keyboard.press("Control+l"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("__tg.lockIs()"), "Ctrl L locks it")
        await pg.click("#lgpin .lg-not"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("[__tg.lockIs(), localStorage.getItem('tec_out'), !!document.querySelector('.lgp'), __tg.UI().toast||'']")
        ok(r[0] is False and r[1] == "1" and r[2], f"Not Frank? Switch user — the login page ({r})")
        # 11. the end of the shop day signs out whoever's signed in; someone signed in after it stays
        await pg.evaluate(SIGN(X["dana"]))
        r = await pg.evaluate("""(()=>{ const c=__tg.fmCfg(), was=c.end, n=new Date(), h=n.getHours()+n.getMinutes()/60; c.end=Math.max(0.25, h-0.25);
          localStorage.setItem('tec_signin_at', new Date(Date.now()-3*3600e3).toISOString());
          const a=__tg.lgEodCheck(), out=localStorage.getItem('tec_out'), t=__tg.UI().toast||'';
          localStorage.removeItem('tec_out'); localStorage.setItem('tec_viewas', __tg.staffList().find(s=>s.name===%s).id); __tg.pxSignedIn();
          const b=__tg.lgEodCheck(); c.end=was; return [a, out, t, b]; })()""" % json.dumps(X["Dn"]))
        ok(r[0] is True and r[1] == "1" and "End of day" in r[2] and r[3] is False, f"the end of the shop day signs her out; signing in after it, she stays ({r})")
        # 12. nobody touching it: locks after the set time (Never by default)
        r0 = await pg.evaluate("__tg.permRules().idle")
        await pg.evaluate("__tg.permRules().idle = 0.05"); await pg.wait_for_timeout(6500)
        r = await pg.evaluate("__tg.lockIs()")
        await pg.evaluate("__tg.permRules().idle = 0")
        ok(not r0 and r, f"idle: never by default; set, it locks ({r0}, {r})")
        await pin(pg, "2222"); await pg.wait_for_timeout(300)
        ok(not await pg.evaluate("__tg.lockIs()"), "…her PIN opens it")
        ok(not errs, "no console errors: " + "; ".join(errs[:3]))
        # 13. dark
        await pg.evaluate("__tg.pxLogout(false); __tg.render()"); await pg.wait_for_timeout(200)
        await pg.evaluate("(()=>{ document.documentElement.setAttribute('data-theme','ivd'); })()"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "a7_dark.png"))
        await b.close()
        # 14. phone
        b, pg, errs = await setup(p, 390, 844)
        await pg.evaluate("(()=>{ const L=__tg.staffList(); L.forEach((s,i)=>__tg.pinSet(s, '1111')); })()")
        await pg.evaluate("__tg.pxLogout(false); __tg.render()"); await pg.wait_for_timeout(500)
        r = await pg.evaluate("(()=>{ const a=document.querySelector('.lg-brand').getBoundingClientRect(), m=document.querySelector('.lg-main').getBoundingClientRect(), t=[...document.querySelectorAll('.lg-pp')][0]; const cols=getComputedStyle(t).gridTemplateColumns.split(' ').length; return [Math.round(a.top), Math.round(m.top), cols, document.documentElement.scrollWidth <= innerWidth + 1]; })()")
        ok(r[1] > r[0] and r[2] == 3 and r[3], f"phone: one column, three tiles a row, no sideways scroll ({r})")
        await pg.screenshot(path=os.path.join(OUT, "a8_phone.png"))
        await pg.click(".lg-t"); await pg.wait_for_timeout(300)
        w = await pg.evaluate("(()=>{ const c=document.querySelector('#lgpin .lg-card').getBoundingClientRect(); return [Math.round(c.left), Math.round(c.right), Math.round(c.bottom), innerWidth, innerHeight]; })()")
        ok(w[0] >= 0 and w[1] <= w[3] and w[2] <= w[4], f"phone: the pad fits ({w})")
        await pg.screenshot(path=os.path.join(OUT, "a9_phone_pad.png"))
        ok(not errs, "phone: no console errors: " + "; ".join(errs[:3]))
        await b.close()
    print("\nFAILS:", len(FAILS), FAILS)
asyncio.run(main())
