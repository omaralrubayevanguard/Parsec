# Parsec 12.7 (fork P) — each person keeps their own job clock and day clock
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots127p"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t127p.html"
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
def J(js): return "(()=>{ const R=" + SR + "; " + js + " })()"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
async def setup(p, w=1440, h=900):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": w, "height": h})
    pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
    await pg.route("**/fonts.g*/**", lambda r: r.abort())
    await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
    await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
    return b, pg, errs
# nothing running; one RO with two operations ready to work; two technicians
PREP = """(()=>{ const S=__tg.STATE(), now=Date.now(), back=t=>new Date(Math.max(+new Date(t)+1000, now-120000)).toISOString();
  S.punches.forEach(p=>{ if(!p.stop){ p.stop=back(p.start); p.stopReason='Switched job'; p.burntCredited=true; } });
  (S.shifts||[]).forEach(s=>{ if(!s.out){ s.out=back(s.in); s.outReason='Home'; } });
  const T=__tg.staffList().filter(s=>s.role==='Technician');
  const L=S.ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length>=2); const r=L[0];
  r.operations.forEach(o=>{ o.declined=false; o.jobStatus={status:'Hold Tech', setAt:new Date().toISOString(), hand:true}; (o.parts||[]).forEach(x=>{ x.status='Received'; }); });
  __tg.render(); return { A: T[0].id, An: T[0].name, B: T[1].id, Bn: T[1].name, ro: r.id, a: r.operations[0].id, b: r.operations[1].id }; })()"""
def SIGN(sid): return f"(()=>{{ localStorage.setItem('tec_viewas', '{sid}'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{{ __tg.CX.U().skipMorning = __tg.todayStr(); }}catch(e){{}} __tg.render(); return __tg.pcMe(); }})()"
RUNS = "(()=>__tg.STATE().punches.filter(p=>!p.stop).map(p=>[p.by, p.opId]))()"
SHIFTS = "(()=>__tg.STATE().shifts.filter(s=>!s.out).map(s=>s.by))()"
def first(n): return n.split()[0]
async def ro_card(pg, ro, op):
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(800)
    on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); return r ? r.classList.contains('is-on') : null"))
    if not on: await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t'); if(r) r.click()")); await pg.wait_for_timeout(600)
    return await pg.evaluate(J(f"const c=R.querySelector('.ock[data-op=\"{op}\"]'); if(!c) return null; return {{ cls: c.className, go: !!c.querySelector('[data-ock=go].on'), who: [...c.querySelectorAll('.ock-who b')].map(x=>x.textContent), hint: c.querySelector('.ock-hint').textContent, title: (c.querySelector('[data-ock=go]')||{{}}).title || '' }}"))
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        X = await pg.evaluate(PREP); A, An, B, Bn, ro, a, bo = X["A"], X["An"], X["B"], X["Bn"], X["ro"], X["a"], X["b"]
        print("   ", X)
        # 1. Mike starts op A: his clock, his day clock
        me = await pg.evaluate(SIGN(A))
        await pg.evaluate(f"__tg.doStartPunch('{ro}', '{a}', 'Repairing')"); await pg.wait_for_timeout(200)
        r = await pg.evaluate("(()=>{ const p=__tg.runningPunch(), s=__tg.openShift(); return [p && p.by, p && p.opId, s && s.by]; })()")
        ok(me == An and r[0] == An and r[1] == a and r[2] == An, f"{first(An)} starts op A — his punch, his day clock ({r})")
        # 2. switching: his clock keeps running, the sign-in screen says so
        await pg.evaluate("(()=>{ const x=document.createElement('button'); x.dataset.action='px-switch'; document.body.appendChild(x); x.click(); x.remove(); })()"); await pg.wait_for_timeout(400)
        t = await pg.evaluate("__tg.UI().toast || ''")
        ok("Your clock keeps running" in t, "switching says your clock keeps running: " + t)
        ok(await pg.evaluate(RUNS) == [[An, a]], "switching never stops it")
        # 3. Dana signs in: nothing of hers runs; Mike's still does
        me = await pg.evaluate(SIGN(B))
        r = await pg.evaluate("(()=>{ const p=__tg.runningPunch(), s=__tg.openShift(); return [__tg.pcMe(), p && p.by, s && s.by, __tg.lastShiftOut() && 1, __tg.todayShiftMs(), __tg.pxClockState()]; })()")
        ok(r[0] == Bn and r[1] is None and r[2] is None and r[5] == "out", f"{first(Bn)}: no clock of hers runs, no day clock ({r})")
        # 4. Dana starts op B, then op A (Mike is on it): only her own clock moves
        await pg.evaluate(f"__tg.doStartPunch('{ro}', '{bo}', 'Repairing')"); await pg.wait_for_timeout(150)
        ok(sorted(await pg.evaluate(RUNS)) == sorted([[An, a], [Bn, bo]]), "Dana on op B, Mike still on op A")
        ok(sorted(await pg.evaluate(SHIFTS)) == sorted([An, Bn]), "each has their own day clock")
        await pg.evaluate(f"__tg.doStartPunch('{ro}', '{a}', 'Repairing')"); await pg.wait_for_timeout(150)
        r = await pg.evaluate(f"(()=>{{ const S=__tg.STATE(); const q=S.punches.filter(p=>p.opId==='{bo}' && p.by==={json.dumps(Bn)}).pop(); return [q.stop ? q.stopReason : null]; }})()")
        ok(sorted(await pg.evaluate(RUNS)) == sorted([[An, a], [Bn, a]]) and r[0] == "Switched job", f"starting op A stops only her own op B ({r}) — both on op A")
        # 5. the sign-in screen lists every running clock
        await pg.evaluate("__tg.pxLogout(false); __tg.render()"); await pg.wait_for_timeout(400)
        si = await pg.evaluate("(()=>{ const c=document.querySelector('.pxs-clks'); const P=[...document.querySelectorAll('.pxs-p')].map(x=>[x.querySelector('b').textContent, x.querySelector('small').textContent]); return [c ? [...c.querySelectorAll('.pxs-clk')].map(x=>x.textContent) : null, c ? c.querySelector('small').textContent : '', P, __tg.UI().toast||'']; })()")
        print("   ", si[0], si[1])
        ok(si[0] and len(si[0]) == 2 and any(An in x for x in si[0]) and any(Bn in x for x in si[0]), "the sign-in screen lists both running clocks")
        ok("2 clocks are running" in si[1], "…and says signing in or out never stops one: " + si[1])
        subs = dict((x[0], x[1]) for x in si[2])
        ok(subs.get(An, "").startswith("on the clock") and subs.get(Bn, "").startswith("on the clock"), f"each person's button says on the clock ({subs.get(An)} / {subs.get(Bn)})")
        ok("Your clock keeps running" in si[3], "signing out says your clock keeps running: " + si[3])
        await pg.screenshot(path=os.path.join(OUT, "p1_signin.png"))
        # 6. the RO page as Dana: who's on the clock shows both; Stop is hers
        await pg.evaluate(SIGN(B))
        c = await ro_card(pg, ro, a); print("   ", c)
        ok(c and "run" in c["cls"] and c["go"] and "You" in c["who"] and first(An) in c["who"], f"RO page: both on the clock, Stop is hers ({c and c['who']})")
        await pg.evaluate(J(f"R.querySelector('.ock[data-op=\"{a}\"] [data-ock=go]').focus()")); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(600)
        ok(await pg.evaluate(RUNS) == [[An, a]], "Enter on Stop stops only her clock — Mike's keeps running")
        c = await ro_card(pg, ro, a); print("   ", c)
        ok(c and "run" in c["cls"] and not c["go"] and c["hint"] == "" and "too" in c["title"], f"the card still breathes for Mike; her button is Start ({c and c['title']})")
        await pg.screenshot(path=os.path.join(OUT, "p2_ro_dana_start.png"))
        await pg.evaluate(J(f"R.querySelector('.ock[data-op=\"{a}\"] [data-ock=go]').click()")); await pg.wait_for_timeout(600)
        ok(sorted(await pg.evaluate(RUNS)) == sorted([[An, a], [Bn, a]]), "Start puts her on it too — Mike's untouched")
        # 7. Mike again: his own clock, hold to stop stops his
        await pg.evaluate(SIGN(A))
        c = await ro_card(pg, ro, a); print("   ", c)
        ok(c and c["go"] and c["hint"] == "Hold to stop", "Mike's card: Stop is his, hold to stop")
        GO = J(f"const r=R.querySelector('.ock[data-op=\"{a}\"] [data-ock=go]').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]")
        r0 = await pg.evaluate(GO); await pg.mouse.move(r0[0], r0[1]); await pg.mouse.down(); await pg.wait_for_timeout(900); await pg.mouse.up(); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(RUNS) == [[Bn, a]], "holding Stop stops Mike's — Dana's keeps running")
        r = await pg.evaluate("(()=>{ const s=__tg.openShift(); return [__tg.pxClockState(), s && s.by]; })()")
        ok(r == ["air", An], f"Mike is still on his own day clock, off a job ({r})")
        # the keyboard's clock key starts Mike's on the card's operation, and only his
        await pg.evaluate(f"__tg.doStartPunch('{ro}', '{bo}', 'Repairing')"); await pg.wait_for_timeout(150)
        ok(sorted(await pg.evaluate(RUNS)) == sorted([[An, bo], [Bn, a]]), "Mike on op B, Dana on op A")
        # 8. the Technician page as Mike: his clock; the admin viewing a technician sees that tech's clock
        await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(900)
        r = await pg.evaluate(f"(()=>{{ const S=__tg.CX.S(); const h=document.querySelector('[data-pg=tech] .jc-host'), c=h && h.shadowRoot && h.shadowRoot.querySelector('.ock[data-op]');   /* 14.3: the RO page, mounted */ return [S.rp && S.rp.by, S.rp && S.rp.opId, c && c.dataset.op, c && !!c.querySelector('[data-ock=go].on')]; }})()")
        ok(r == [An, bo, bo, True], f"Technician page: Mike's running punch, Stop on his card ({r})")
        await pg.screenshot(path=os.path.join(OUT, "p3_tech_mike.png"))
        # 9. Time Log: each person's own
        await pg.evaluate("__tg.PG.go('timelog')"); await pg.wait_for_timeout(600)
        r = await pg.evaluate(f"(()=>{{ const S=__tg.STATE(); const ids=[...document.querySelectorAll('[data-pg=timelog] .tk-r[data-p]')].map(x=>x.dataset.p); const mine=S.punches.filter(p=>p.by==={json.dumps(An)} && __tg.localDay(p.start)===__tg.todayStr()).map(p=>p.id), hers=S.punches.filter(p=>p.by==={json.dumps(Bn)} && __tg.localDay(p.start)===__tg.todayStr()).map(p=>p.id); return [mine.every(i=>ids.includes(i)), hers.some(i=>ids.includes(i)), ids.length, document.querySelectorAll('[data-pg=timelog] .tk-r.run').length]; }})()")
        ok(r[0] and not r[1] and r[3] == 1, f"Mike's Time Log has his punches, none of Dana's, one running ({r})")
        await pg.screenshot(path=os.path.join(OUT, "p4_timelog_mike.png"))
        # 10. lunch: Dana stops for lunch — her day clock ends, Mike's runs on
        await pg.evaluate(SIGN(B)); await pg.evaluate("__tg.doStopPunch('Lunch'); __tg.scheduleSave(true)"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"(()=>{{ const S=__tg.STATE(); const d=S.shifts.filter(s=>s.by==={json.dumps(Bn)}).pop(), m=S.shifts.filter(s=>s.by==={json.dumps(An)}).pop(); return [d.out ? d.outReason : 'open', m.out ? m.outReason : 'open']; }})()")
        ok(r == ["Lunch", "open"], f"lunch ends only her day clock ({r})")
        ok(await pg.evaluate(RUNS) == [[An, bo]], "Mike's job clock runs on")
        # 11. overlaps: only the same person's punches clash
        day = await pg.evaluate("(()=>{ const d=new Date(Date.now()-400*86400e3); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })()")
        await pg.evaluate(SIGN(A)); await pg.evaluate("(()=>{ const sf=__tg.staffList().find(s=>s.id===" + json.dumps(A) + "); if(sf && __tg.permSet) __tg.permSet(sf,'acts','t.editall',true); })()")   # Parsec 13: adding time for Dana is fixing someone else's punches
        r = await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(), T=h=>new Date('{day}T'+h).toISOString(), ms=h=>new Date('{day}T'+h).getTime();
          S.punches.push({{id:'pn_d1', roId:'{ro}', opId:'{a}', start:T('10:00'), stop:T('11:00'), startReason:'Repairing', stopReason:'Switched job', notes:'', by:{json.dumps(Bn)}, burntCredited:true}});
          S.punches.push({{id:'pn_m1', roId:'{ro}', opId:'{a}', start:T('13:00'), stop:T('14:00'), startReason:'Repairing', stopReason:'Switched job', notes:'', by:{json.dumps(An)}, burntCredited:true}});
          S.shifts.push({{id:'sh_d1', in:T('07:00'), out:T('12:00'), outReason:'Lunch', by:{json.dumps(Bn)}}});
          const o={{}};
          o.pc1 = __tg.punchClash(null, ms('10:15'), ms('10:45'));
          o.pc2 = (__tg.punchClash(null, ms('10:15'), ms('10:45'), {json.dumps(Bn)})||{{}}).id;
          const m1=S.punches.find(p=>p.id==='pn_m1');
          o.e1 = __tg.editPunchCommit(m1, {{ start:T('09:30'), stop:T('10:30'), startReason:'Repairing', stopReason:'Switched job', opId:'{a}', notes:'' }}).ok;
          o.m1 = __tg.addManualPunch({{ roId:'{ro}', opId:'{a}', start:T('10:00'), stop:T('10:20'), startReason:'Repairing', stopReason:'Switched job' }}).ok;
          o.m2 = __tg.addManualPunch({{ roId:'{ro}', opId:'{a}', start:T('12:00'), stop:T('12:30'), startReason:'Repairing', stopReason:'Switched job' }}).ok;
          o.m3 = __tg.addManualPunch({{ roId:'{ro}', opId:'{a}', start:T('10:40'), stop:T('10:50'), startReason:'Repairing', stopReason:'Switched job', by:{json.dumps(Bn)} }}).ok;
          o.m2by = (S.punches.filter(p=>p.start===T('12:00')).pop()||{{}}).by;
          o.s1 = __tg.shiftAddManual('{day}', '07:30', '11:30').ok;
          o.s1by = (S.shifts.filter(s=>s.in===T('07:30')).pop()||{{}}).by;
          o.s2 = __tg.shiftAddManual('{day}', '08:00', '09:00').ok;
          o.s3 = __tg.shiftAddManual('{day}', '13:00', '14:00', {json.dumps(Bn)}).ok;
          o.dc = __tg.dailyCalc('{day}').punches.length; o.dcB = __tg.dailyCalc('{day}', {json.dumps(Bn)}).punches.length;
          return o; }})()""")
        print("   ", r)
        ok(r["pc1"] is None and r["pc2"] == "pn_d1", "punchClash: Dana's punch is no clash for Mike, it is for Dana")
        ok(r["e1"] is True, "editing Mike's punch over Dana's time is fine")
        ok(r["m1"] is False and r["m2"] is True and r["m2by"] == An, "adding time: Mike's own punch still clashes; a free slot is his")
        ok(r["m3"] is False, "adding time for Dana clashes with Dana's own")
        ok(r["s1"] is True and r["s1by"] == An and r["s2"] is False and r["s3"] is True, "day clock by hand: Dana's doesn't block Mike's; his own does; one for Dana goes in")
        ok(r["dc"] == 2 and r["dcB"] == 1, f"your day's numbers count only your punches ({r['dc']} Mike / {r['dcB']} Dana)")
        # 12. an old day clock that never said whose belongs to the one person on it
        r = await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(); const T=h=>new Date('{day}T'+h).toISOString();
          const s={{id:'sh_old', in:T('12:00'), out:T('12:40')}}; S.shifts.push(s); return [__tg.shiftOwner(s), __tg.sameOwner('Admin',''), __tg.sameOwner({json.dumps(An)}, {json.dumps(Bn)})]; }})()""")
        ok(r == [An, True, False], f"an old day clock belongs to the person whose punches are in it ({r})")
        # 13. the admin looking at a technician's page sees that tech's clock
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()")
        await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(900)
        r = await pg.evaluate("(()=>{ const S=__tg.CX.S(); return [S.me, S.rp && S.rp.by, __tg.pcMe(), __tg.runningPunch() && 1]; })()")
        ok(r[0] and ((r[0] == An and r[1] == An) or (r[0] != An and r[1] is None)), f"the admin viewing {r[0]}: that tech's clock only ({r})")
        ok(r[3] is None, "the admin's own clock isn't anyone else's")
        ok(not errs, "no console errors: " + "; ".join(errs[:4]))
        await b.close()
    print("\n" + ("ALL OK" if not FAILS else str(len(FAILS)) + " FAILED:\n  " + "\n  ".join(FAILS)))
asyncio.run(main())
