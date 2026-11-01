# Parsec 15 (B) — the clock only reminds: no lunch pause / restart, a Lunch or End of day stop keeps the day clock on,
# "Lunch time" after 4 hours on the clock, "Clock out for the day?" when a job stops as End of day, Not now = 15 min
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_b.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots150b"); os.makedirs(OUT, exist_ok=True)
def DAY(make): return """(()=>{ const S=__tg.STATE(), X=window.__X, now=Date.now(), ago=m=>new Date(Math.max(now-m*60000, new Date(new Date().setHours(0,1,0,0)).getTime())).toISOString(), td=__tg.todayStr();
  S.punches=S.punches.filter(p=>!(p.by===X.An && __tg.localDay(p.start)===td)); S.punches.forEach(p=>{ if(!p.stop){ p.stop=new Date(now-60000).toISOString(); p.stopReason='Switched job'; } });
  S.shifts=S.shifts.filter(s=>!(s.by===X.An && __tg.localDay(s.in)===td)); S.shifts.forEach(s=>{ if(!s.out){ s.out=new Date(now-60000).toISOString(); s.outReason='Home'; } });
  __tg.V146.snz=0; __tg.V146.noIn={}; __tg.V150.snz={}; """ + make + """ __tg.render(); __tg.v146Tick(); return true; })()"""
CARD = lambda cls: "(()=>{ const c=document.querySelector('#v146 ." + cls + "'); return c ? [c.querySelector('b').textContent, c.querySelector('small').textContent, [...c.querySelectorAll('button')].map(b=>b.textContent)] : null; })()"
NUD = CARD("v146-nud")
OPEN = "(()=>{ const s=__tg.openShift(); return s ? s.id : null; })()"
async def tick(pg): await pg.evaluate("__tg.v146Tick()"); await pg.wait_for_timeout(150)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        X = await pg.evaluate(PREP)
        await pg.evaluate("(()=>{ localStorage.setItem('tec_logout_eod','0'); localStorage.setItem('tec_bk_eod','0'); })()")
        await pg.evaluate(f"window.__X={json.dumps(X)}")
        me = await pg.evaluate(SIGN(X["A"])); fn = first(X["An"])
        await pg.evaluate("(()=>{ __tg.UI().view='tech'; __tg.render(); const sf=__tg.staffList().find(s=>s.id===window.__X.A); sf.shiftEnd='23:59'; })()"); await pg.wait_for_timeout(600)
        wkend = await pg.evaluate("[0,6].includes(new Date().getDay())")
        # ---- 1 · the shop's lunch time comes and goes: nothing stops, nothing starts again
        await pg.evaluate(DAY("S.shifts.push({id:'b1', in:ago(120), out:null, by:X.An}); S.punches.push({id:'bp1', roId:X.ro, opId:X.a, start:ago(30), stop:null, startReason:'Repairing', stopReason:null, notes:'', by:X.An});"))
        await pg.evaluate("""(()=>{ const c=__tg.STATE().fmCfg || (__tg.STATE().fmCfg={}); const h=x=>{ const t=new Date(Date.now()+x*1000); return t.getHours()+t.getMinutes()/60+t.getSeconds()/3600; }; c.start=0; c.end=23.99; c.lunch=[h(2), h(6)]; __tg.render(); })()""")
        await pg.wait_for_timeout(4000)
        r = await pg.evaluate("(()=>{ const p=__tg.STATE().punches.find(x=>x.id==='bp1'); return [p.stop, p.stopReason, p.autoPause||null, !!__tg.openShift()]; })()")
        ok(wkend or (r[0] is None and r[2] is None and r[3]), f"lunch time: the job keeps running, the day clock stays on ({r})")
        await pg.wait_for_timeout(4500)
        r = await pg.evaluate("(()=>{ const L=__tg.STATE().punches.filter(x=>x.by===window.__X.An && !x.stop); return [L.length, L.map(x=>x.id), L.some(x=>x.autoResume)]; })()")
        ok(r[0] == 1 and r[1] == ["bp1"] and not r[2], f"after lunch: still the one job, nothing started itself ({r})")
        # ---- 2 · stopping as Lunch: the day clock stays on, Clock out for lunch? asks
        await pg.evaluate("__tg.doStopPunch('Lunch', 'Pulled the hub')"); await pg.wait_for_timeout(300); await tick(pg)
        r = await pg.evaluate(OPEN); c = await pg.evaluate(CARD("v150-stop"))
        ok(r == "b1", f"stopped as Lunch: still clocked in ({r})")
        ok(c and c[0] == "Clock out for lunch?" and "stopped as Lunch at" in c[1] and c[2] == ["Lunch · 30 min", "1 hour", "Not now"], f"Clock out for lunch? ({c})")
        # ---- 3 · stopping as End of day: the day clock stays on, Clock out for the day? asks
        await pg.evaluate(DAY("S.shifts.push({id:'b2', in:ago(150), out:null, by:X.An}); S.punches.push({id:'bp2', roId:X.ro, opId:X.a, start:ago(40), stop:null, startReason:'Repairing', stopReason:null, notes:'', by:X.An});"))
        await pg.evaluate("__tg.doStopPunch('End of day', 'Torqued and road tested')"); await pg.wait_for_timeout(300); await tick(pg)
        r = await pg.evaluate(OPEN); c = await pg.evaluate(CARD("v150-eod"))
        ok(r == "b2", f"stopped as End of day: still clocked in ({r})")
        ok(c and c[0] == "Clock out for the day?" and "stopped as End of day at" in c[1] and c[2] == ["Clock out now", "Not yet"], f"Clock out for the day? right when it stops ({c})")
        await pg.screenshot(path=os.path.join(OUT, "1_eod.png"))
        await pg.click("#v146 [data-v150=snz]"); await pg.wait_for_timeout(200)
        r = await pg.evaluate("(()=>{ const k=Object.keys(__tg.V150.snz)[0], v=__tg.V150.snz[k]; return [k, Math.round((v-Date.now())/60000), !!document.querySelector('#v146 .v150-eod')]; })()")
        ok(r[0] == "stop|bp2" and r[1] in (14, 15) and not r[2], f"Not yet hides it for 15 min ({r})")
        await pg.evaluate("(()=>{ const V=__tg.V150; Object.keys(V.snz).forEach(k=>{ V.snz[k]=Date.now()-1; }); })()"); await tick(pg)
        ok(await pg.evaluate(CARD("v150-eod")) is not None, "15 minutes later it asks again")
        await pg.click("#v146 [data-v150=out]"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("(()=>{ const s=__tg.STATE().shifts.find(x=>x.id==='b2'); return [!!s.out, s.outReason, !!__tg.openShift(), !!document.querySelector('.v146ck'), !!document.querySelector('#v146 .v150-eod')]; })()")
        ok(r[0] and r[1] == "End of day" and not r[2] and not r[3] and not r[4], f"Clock out now: clocked out, card gone ({r})")
        # a while later: Clock out at the stop
        await pg.evaluate(DAY("S.shifts.push({id:'b3', in:ago(150), out:null, by:X.An}); S.punches.push({id:'bp3', roId:X.ro, opId:X.a, start:ago(60), stop:ago(12), startReason:'Repairing', stopReason:'End of day', notes:'Done', by:X.An});"))
        c = await pg.evaluate(CARD("v150-eod"))
        ok(c and c[2][0].startswith("Clock out at ") and c[2][1] == "Clock out now", f"12 min later it offers the stop time ({c})")
        await pg.click("#v146 [data-v150=outat]"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("(()=>{ const s=__tg.STATE().shifts.find(x=>x.id==='b3'), p=__tg.STATE().punches.find(x=>x.id==='bp3'); return [s.out===p.stop, s.outReason, !!__tg.openShift()]; })()")
        ok(r[0] and r[1] == "End of day" and not r[2], f"Clock out at the stop time ({r})")
        # ---- 4 · Lunch time after 4 hours on the clock
        await pg.evaluate(DAY("S.shifts.push({id:'b4', in:ago(245), out:null, by:X.An}); S.punches.push({id:'bp4', roId:X.ro, opId:X.a, start:ago(70), stop:null, startReason:'Repairing', stopReason:null, notes:'', by:X.An});"))
        c = await pg.evaluate(CARD("v150-lun"))
        early = await pg.evaluate("(()=>{ const d=new Date(); return d.getHours()*60+d.getMinutes() < 246; })()")
        ok(early or (c and c[0] == f"Lunch time, {fn}" and c[1].startswith("4:0") and "on the clock" in c[1] and "your clock is still running" in c[1] and c[2] == ["Stop · lunch 30 min", "1 hour", "Not now"]), f"4 hours on the clock: Lunch time ({c})")
        await pg.screenshot(path=os.path.join(OUT, "2_lunch.png"))
        await pg.evaluate("(()=>{ document.documentElement.setAttribute('data-theme','ivd'); })()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "3_lunch_dark.png")); await pg.evaluate("document.documentElement.setAttribute('data-theme','ivl')")
        if not early:
            await pg.click("#v146 .v150-lun [data-v150=snz]"); await pg.wait_for_timeout(200)
            r = await pg.evaluate("(()=>{ const v=Object.values(__tg.V150.snz)[0]; return [Math.round((v-Date.now())/60000), !!document.querySelector('#v146 .v150-lun')]; })()")
            ok(r[0] in (14, 15) and not r[1], f"Not now: gone for 15 min ({r})")
            await pg.evaluate("(()=>{ const V=__tg.V150; Object.keys(V.snz).forEach(k=>{ V.snz[k]=Date.now()-1; }); })()"); await tick(pg)
            ok(await pg.evaluate(CARD("v150-lun")) is not None, "…then it asks again")
            await pg.click("#v146 .v150-lun [data-v150=l60]"); await pg.wait_for_timeout(400)
            r = await pg.evaluate("(()=>{ const s=__tg.STATE().shifts.find(x=>x.id==='b4'), p=__tg.STATE().punches.find(x=>x.id==='bp4'); return [s.outReason, Math.round((new Date(s.backBy)-new Date(s.out))/60000), !!__tg.openShift(), p.stopReason, !!document.querySelector('#v146 .v150-lun, #v146 .v150-stop')]; })()")
            ok(r[0] == "Lunch" and r[1] == 60 and not r[2] and r[3] == "Lunch" and not r[4], f"1 hour: the job stops as Lunch, clocked out for an hour, cards gone ({r})")
            await pg.evaluate("(()=>{ const s=__tg.STATE().shifts.find(x=>x.id==='b4'); s.backBy=new Date(Date.now()-60000).toISOString(); __tg.v147Tick(); })()"); await pg.wait_for_timeout(200)
            ok(await pg.evaluate("(()=>{ const w=document.getElementById('v147'); return !!(w && !w.hidden && /Lunch is over/.test(w.innerText)); })()") and not await pg.evaluate(OPEN), "the hour's up: 14.7's Lunch is over asks — nothing clocks in by itself")
            # back from lunch: a second clock segment — no Lunch time card again
            await pg.evaluate("(()=>{ const S=__tg.STATE(); S.shifts.push({id:'b4b', in:new Date(Date.now()-30000).toISOString(), out:null, by:window.__X.An}); __tg.v146Tick(); })()"); await pg.wait_for_timeout(150)
            ok(await pg.evaluate(CARD("v150-lun")) is None, "after a lunch clock-out the Lunch time card doesn't come back")
            # Stop · lunch 30 min, from a fresh 4-hour day
            await pg.evaluate(DAY("S.shifts.push({id:'b5', in:ago(250), out:null, by:X.An}); S.punches.push({id:'bp5', roId:X.ro, opId:X.a, start:ago(20), stop:null, startReason:'Repairing', stopReason:null, notes:'', by:X.An});"))
            await pg.click("#v146 .v150-lun [data-v150=l30]"); await pg.wait_for_timeout(400)
            r = await pg.evaluate("(()=>{ const s=__tg.STATE().shifts.find(x=>x.id==='b5'), p=__tg.STATE().punches.find(x=>x.id==='bp5'); return [s.outReason, Math.round((new Date(s.backBy)-new Date(s.out))/60000), p.stopReason]; })()")
            ok(r == ["Lunch", 30, "Lunch"], f"Stop · lunch 30 min ({r})")
        # under 4 hours: no card
        await pg.evaluate(DAY("S.shifts.push({id:'b6', in:ago(200), out:null, by:X.An});"))
        ok(await pg.evaluate(CARD("v150-lun")) is None, "3:20 on the clock: no Lunch time card yet")
        # ---- 5 · the shift-end card stays — and covers the End of day card once it shows
        await pg.evaluate("(()=>{ const sf=__tg.staffList().find(s=>s.id===window.__X.A), d=new Date(Date.now()-40*60000); sf.shiftEnd=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); })()")
        await pg.evaluate(DAY("S.shifts.push({id:'b7', in:ago(180), out:null, by:X.An}); S.punches.push({id:'bp7', roId:X.ro, opId:X.a, start:ago(150), stop:ago(30), startReason:'Repairing', stopReason:'End of day', notes:'Checked it', by:X.An});"))
        n = await pg.evaluate(NUD); e2 = await pg.evaluate(CARD("v150-eod"))
        ok(n and n[0] == f"Still on the clock, {fn}?" and e2 is None, f"20+ min past the shift: Still on the clock? shows, alone ({n}, {e2})")
        await pg.evaluate("(()=>{ __tg.UI().view='ros'; __tg.render(); })()"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=os.path.join(OUT, "4_shift_end.png"))
        ok(not errs, "no console errors: " + " | ".join(errs[:3]))
        await b.close()
    print("FAILS", len(FAILS), FAILS)
asyncio.run(main())
