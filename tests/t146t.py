# Parsec 14.6 — the Time Log picks: Fix these, the end time from evidence, punches outside the day clock, overlap in three ways,
# split / merge / fill, fast typed times + nudges, a reason on every change, ask → approve, the crew in the Shop view, sign with a note.
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots146t"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
SIGN = """((role, nm)=>{ const T=__tg.staffList().filter(s=>s.role===role && (!nm || s.name===nm)); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name && !r.dateClosed && r.operations.length>=2).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{ __tg.CX.U().skipMorning = __tg.todayStr(); }catch(e){} __tg.render(); return T[0].name; })"""
# three past days for the tech: k1 never clocked out; k2 a job before the clock-in, an overlap, no lunch; k3 the same job twice (merge, split)
PREP = """((who)=>{ const S=__tg.STATE(), p2=n=>String(n).padStart(2,'0'), kOf=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
  const dd=n=>{ const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()-n); return d; }, K=[3,4,5].map(n=>kOf(dd(n)));
  const at=(k,hm)=>{ const [y,m,d]=k.split('-').map(Number), [h,mi]=hm.split(':').map(Number); return new Date(y,m-1,d,h,mi).toISOString(); };
  const mine=x=>x===who; S.punches=S.punches.filter(p=>!mine(p.by)); S.shifts=(S.shifts||[]).filter(s=>!(s.by && mine(s.by)));
  const ok=r=>r && !r.shop && r.id!=='ro_shop' && !r.dateClosed; const r=S.ros.filter(x=>ok(x) && x.operations.length>=2)[0]; r.assignedTech=who;
  const o0=r.operations[0].id, o1=r.operations[1].id, P=(id,k,a,b,op,n)=>S.punches.push({id, roId:r.id, opId:op, start:at(k,a), stop:at(k,b), startReason:'Repairing', stopReason:'Switched job', notes:n||'', by:who});
  S.shifts.push({id:'s1', in:at(K[0],'07:03'), out:null, by:who}); P('a1',K[0],'07:10','09:30',o0,'Pulled the hub'); P('a2',K[0],'09:30','11:58',o1,'Torqued'); P('a3',K[0],'12:30','14:52',o0,'Road tested');
  S.shifts.push({id:'s2', in:at(K[1],'07:06'), out:at(K[1],'15:30'), outReason:'End of day', by:who}); P('b1',K[1],'07:01','09:00',o0,'x'); P('b2',K[1],'09:10','10:40',o0,'y'); P('b3',K[1],'10:15','11:30',o1,'z');
  S.shifts.push({id:'s3a', in:at(K[2],'07:00'), out:at(K[2],'12:00'), outReason:'Lunch', by:who}); S.shifts.push({id:'s3b', in:at(K[2],'12:30'), out:at(K[2],'15:30'), outReason:'End of day', by:who});
  P('c1',K[2],'07:00','10:00',o0,'one'); P('c2',K[2],'10:10','12:00',o0,'two'); P('c3',K[2],'12:30','15:00',o1,'three');
  S.tlReq=[]; S.tlSign={}; __tg.render(); return { K, ro:r.id, o0, o1 }; })"""
GO = """((k)=>{ const b=document.querySelector('nav [data-view=timelog], .sidebar [data-view=timelog], .dp-tabs [data-view=timelog]'); if(b) b.click(); else { const V=__tg.UI(); V.tlMe=1; V.view='timelog'; __tg.render(); }   /* 17.1: Time Log is a tab of the department page */ const U=__tg.TL.U(); U.view='day'; U.day=k; U.sel=null; U.pop=null; __tg.render(); })"""
HMS = "((iso)=>{ const d=new Date(iso); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); })"
async def pf(pg, id, f): return await pg.evaluate(f"(()=>{{ const p=__tg.STATE().punches.find(x=>x.id==={json.dumps(id)}); return p ? p[{json.dumps(f)}] : null; }})()")
async def phm(pg, id, f): return await pg.evaluate(f"(()=>{{ const p=__tg.STATE().punches.find(x=>x.id==={json.dumps(id)}); return p && p[{json.dumps(f)}] ? {HMS}(p[{json.dumps(f)}]) : null; }})()")
async def shm(pg, id, f): return await pg.evaluate(f"(()=>{{ const s=__tg.STATE().shifts.find(x=>x.id==={json.dumps(id)}); return s && s[{json.dumps(f)}] ? {HMS}(s[{json.dumps(f)}]) : null; }})()")
async def toast(pg): return await pg.evaluate("((document.querySelector('.toast')||{}).textContent||'')")
async def click(pg, sel, i=0):
    await pg.evaluate(f"(()=>{{ const L=document.querySelectorAll({json.dumps(sel)}); const b=L[{i}]; if(!b) throw new Error('no '+{json.dumps(sel)}); b.click(); }})()"); await pg.wait_for_timeout(250)
async def btn(pg, scope, text):
    return await pg.evaluate(f"(()=>{{ const b=[...document.querySelectorAll({json.dumps(scope)} + ' button')].find(x=>x.textContent.trim().startsWith({json.dumps(text)})); if(!b) return false; b.click(); return true; }})()")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        me = await pg.evaluate(SIGN + "('Technician')"); await pg.wait_for_timeout(300)
        D = await pg.evaluate(PREP + f"({json.dumps(me)})"); K = D["K"]
        await pg.evaluate(GO + f"({json.dumps(K[0])})"); await pg.wait_for_timeout(500)
        # ---- Fix these, on top of the Day view
        fx = await pg.evaluate("(document.querySelector('[data-pg=timelog] .tk-fx')||{}).innerText||''")
        ok("Fix these" in fx or "FIX THESE" in fx, "Fix these sits on top of the Day view")
        for w in ["clock-in", "overlap" if False else "Punches overlap", "No lunch", "No clock out"]:
            ok(w.lower() in fx.lower(), f"Fix these lists: {w}")
        await pg.screenshot(path=os.path.join(OUT, "1_fixthese.png"))
        # ---- forgot to clock out: the evidence times in the pop-over, and the one-tap fix in the list
        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('[data-pg=timelog] .tk-fx [data-a=gofix]')][0]; b.click(); })()"); await pg.wait_for_timeout(300)
        pop = await pg.evaluate("(document.querySelector('[data-pg=timelog] .tg-pop')||{}).innerText||''")
        ok("Last job stopped" in pop and "Shift end" in pop, "No clock out offers the times Parsec can prove: " + pop.replace("\n", " ")[:160])
        ok(await pg.evaluate("!!document.querySelector('[data-pg=timelog] .tg-pop .tk-why .tg-chip.on')"), "the reason is picked for you — Forgot to clock out")
        await pg.screenshot(path=os.path.join(OUT, "2_noout_pop.png"))
        await click(pg, "[data-pg=timelog] [data-a=popx]")
        okb = await btn(pg, "[data-pg=timelog] .tk-fx", "Clock out 14:52")
        ok(okb, "the likely fix is one button — Clock out 14:52")
        ok(await shm(pg, "s1", "out") == "14:52", "the day clock closes at 14:52")
        ok(await pg.evaluate("((__tg.STATE().shifts.find(s=>s.id==='s1')||{}).fixed||{}).why") == "Forgot to clock out", "and says why")
        # ---- overlap: three buttons; split the minutes
        okb = await btn(pg, "[data-pg=timelog] .tk-fx", "Split the 25 min")
        ok(okb, "the overlap offers Split the 25 min")
        e2, s3 = await phm(pg, "b2", "stop"), await phm(pg, "b3", "start")
        ok(e2 == s3 and e2 in ("10:27", "10:28"), f"split at the middle: b2 stops {e2}, b3 starts {s3}")
        ok(await pf(pg, "b2", "editWhy") == "Forgot to stop the clock" and bool(await pf(pg, "b2", "editBy")), "the change keeps who and why")
        ok(await pf(pg, "b2", "originalStop") is not None, "and the time before")
        # ---- a job before the clock-in: move the clock-in
        okb = await btn(pg, "[data-pg=timelog] .tk-fx", "Move clock-in to 07:01")
        ok(okb and await shm(pg, "s2", "in") == "07:01" and await shm(pg, "s2", "originalIn") == "07:06", "Move clock-in to 07:01 (was 07:06)")
        # ---- no lunch: flagged in Fix these, one tap
        okb = await btn(pg, "[data-pg=timelog] .tk-fx", "Lunch ")
        print("   lunch btn", okb, await pg.evaluate("[...document.querySelectorAll('[data-pg=timelog] .tk-fx button')].map(b=>b.textContent.trim()).join(' | ')"), await toast(pg))
        n2 = await pg.evaluate(f"__tg.STATE().shifts.filter(s=>s.by==={json.dumps(me)} && __tg.localDay(s.in)==={json.dumps(K[0])}).length")
        ok(okb and n2 == 2, f"Lunch splits the day clock ({n2} segments)")
        # ---- merge, then split, on k3
        await pg.evaluate(GO + f"({json.dumps(K[2])})"); await pg.wait_for_timeout(300)
        await click(pg, "[data-pg=timelog] .tk-r[data-p=c1]")
        sb = await pg.evaluate("(document.querySelector('[data-pg=timelog] .tk-selb')||{}).innerText||''")
        ok("Merge with the next" in sb and "Split" in sb, "the selected punch shows Split and Merge: " + sb.replace("\n", " ")[:120])
        await click(pg, "[data-pg=timelog] .tk-selb [data-a=merge]")
        ok(await phm(pg, "c1", "stop") == "12:00" and await pf(pg, "c2", "id") is None, "Merge: one punch 07:00–12:00")
        await click(pg, "[data-pg=timelog] .tk-r[data-p=c1]")
        await click(pg, "[data-pg=timelog] .tk-selb [data-p=split]")
        await pg.fill("[data-pg=timelog] .tg-pop [data-in=spl]", "930"); await pg.press("[data-pg=timelog] .tg-pop [data-in=spl]", "Tab"); await pg.wait_for_timeout(150)
        ok(await pg.evaluate("document.querySelector('[data-pg=timelog] .tg-pop [data-in=spl]').value") == "09:30", "930 becomes 09:30")
        await click(pg, f"[data-pg=timelog] .tg-pop [data-a=aset][data-op={D['o1']}]")
        ok(await pg.evaluate("document.querySelector('[data-pg=timelog] .tg-pop [data-a=splitgo]').disabled"), "Split waits for a reason")
        await click(pg, "[data-pg=timelog] .tg-pop .tk-why .tg-chip[data-v='Wrong job or RO']")
        await click(pg, "[data-pg=timelog] .tg-pop [data-a=splitgo]")
        np = await pg.evaluate(f"(()=>{{ const p=__tg.STATE().punches.find(x=>x.splitFrom==='c1'); return p ? [{HMS}(p.start), {HMS}(p.stop), p.opId, p.editWhy] : null; }})()")
        ok(await phm(pg, "c1", "stop") == "09:30" and np and np[0] == "09:30" and np[1] == "12:00" and np[2] == D["o1"], f"Split at 09:30, the rest to the other job: {np}")
        # ---- typed times + arrows; no reason, no save
        await click(pg, "[data-pg=timelog] .tk-r[data-p=c3] [data-p=edit]")
        sel = "[data-pg=timelog] .tg-pop [data-in=s]"
        await pg.fill(sel, "1245"); await pg.press(sel, "ArrowUp"); await pg.press(sel, "Shift+ArrowUp"); await pg.wait_for_timeout(100)
        ok(await pg.evaluate(f"document.querySelector({json.dumps(sel)}).value") == "12:51", "1245 then ↑ and ⇧↑ → 12:51")
        await pg.fill(sel, "+5"); await pg.wait_for_timeout(50)
        await click(pg, "[data-pg=timelog] .tg-pop [data-a=psave]")
        ok(await phm(pg, "c3", "start") == "12:30" and "why" in (await toast(pg)).lower(), "a time change without a reason doesn't save")
        await click(pg, "[data-pg=timelog] .tg-pop .tk-why [data-a=whyo]")
        await pg.fill("[data-pg=timelog] .tg-pop [data-in=why]", "Badge clock was off"); await pg.wait_for_timeout(50)
        await click(pg, "[data-pg=timelog] .tg-pop [data-a=psave]")
        ok(await phm(pg, "c3", "start") == "12:35" and await pf(pg, "c3", "editWhy") == "Badge clock was off", "+5 from 12:30 → 12:35, with the reason in their own words")
        # ---- Alt → nudges the stop like a drag; Enter asks why
        await click(pg, "[data-pg=timelog] .tk-r[data-p=c3]")
        for i in range(3): await pg.keyboard.press("Alt+ArrowRight")
        await pg.wait_for_timeout(150)
        ok(await phm(pg, "c3", "stop") == "15:00", "nudging doesn't change the time yet")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(250)
        ok(await pg.evaluate("!!document.querySelector('[data-pg=timelog] .tg-pop [data-a=wgo]')"), "Enter asks why")
        await click(pg, "[data-pg=timelog] .tg-pop .tk-why .tg-chip[data-v='Forgot to stop the clock']")
        await click(pg, "[data-pg=timelog] .tg-pop [data-a=wgo]")
        ok(await phm(pg, "c3", "stop") == "15:03", "the stop moves 3 min, saved with the reason")
        await pg.screenshot(path=os.path.join(OUT, "3_day.png"))
        # ---- ask → approve: a tech without the permission to fix their own time
        await pg.evaluate("(()=>{ const sf=__tg.viewAsStaff(); sf.ov=sf.ov||{}; sf.ov.acts=sf.ov.acts||{}; sf.ov.acts['t.editown']=false; })()")
        await pg.evaluate(GO + f"({json.dumps(K[0])})"); await pg.wait_for_timeout(250)
        await click(pg, "[data-pg=timelog] .tk-r[data-p=a2] [data-p=edit]")
        lbl = await pg.evaluate("document.querySelector('[data-pg=timelog] .tg-pop [data-a=psave]').textContent")
        ok(lbl.startswith("Send to"), "Save becomes " + lbl.strip())
        await pg.fill("[data-pg=timelog] .tg-pop [data-in=e]", "11:40")
        await click(pg, "[data-pg=timelog] .tg-pop .tk-why .tg-chip[data-v='Forgot to stop the clock']")
        await click(pg, "[data-pg=timelog] .tg-pop [data-a=psave]")
        rq = await pg.evaluate("(__tg.STATE().tlReq||[]).filter(r=>r.st==='open').map(r=>[r.x, r.label])")
        ok(len(rq) == 1 and await phm(pg, "a2", "stop") == "11:58", f"it's asked, not changed: {rq}")
        ok("waiting" in (await pg.evaluate("(document.querySelector('[data-pg=timelog] .tk-r[data-p=a2]')||{}).innerText||''")), "the row shows it's waiting")
        await pg.evaluate("(()=>{ const sf=__tg.viewAsStaff(); delete sf.ov.acts['t.editown']; })()")
        fm = await pg.evaluate(SIGN + "('Foreman')"); await pg.wait_for_timeout(300)
        await pg.evaluate(GO + f"({json.dumps(K[0])})"); await pg.evaluate(f"(()=>{{ const U=__tg.TL.U(); U.who={json.dumps(me)}; U.day={json.dumps(K[0])}; __tg.render(); }})()"); await pg.wait_for_timeout(300)
        fx2 = await pg.evaluate("(document.querySelector('[data-pg=timelog] .tk-fx')||{}).innerText||''")
        ok("asks" in fx2, "the foreman sees the ask on top: " + fx2.replace("\n", " ")[:100])
        await click(pg, "[data-pg=timelog] .tk-fx [data-a=rqok]")
        ok(await phm(pg, "a2", "stop") == "11:40" and await pg.evaluate("(__tg.STATE().tlReq||[])[0].st") == "ok", "Approve makes the change")
        # ---- the crew: pick people in the Shop view, then lunch for both
        T2 = await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(), T=__tg.staffList().filter(x=>x.role==='Technician' && x.name!=={json.dumps(me)}).map(x=>x.name).slice(0,2), k={json.dumps(K[0])};
          const at=hm=>{{ const [y,m,d]=k.split('-').map(Number), [h,mi]=hm.split(':').map(Number); return new Date(y,m-1,d,h,mi).toISOString(); }};
          T.forEach((t,i)=>{{ S.punches=S.punches.filter(p=>!(p.by===t && __tg.localDay(p.start)===k)); S.shifts.push({{id:'cr'+i, in:at('07:00'), out:at('15:30'), outReason:'End of day', by:t}}); }});
          const U=__tg.TL.U(); U.who='ALL'; U.view='shop'; U.day=k; U.crew={{}}; __tg.render(); return T; }})()""")
        await pg.wait_for_timeout(250)
        for t in T2: await click(pg, f"[data-pg=timelog] .tk-ck[data-t={json.dumps(t)}]")
        cb = await pg.evaluate("(document.querySelector('[data-pg=timelog] .tk-crew')||{}).innerText||''")
        ok("2 picked" in cb, "the crew bar: " + cb.replace("\n", " ")[:90])
        await pg.screenshot(path=os.path.join(OUT, "4_crew.png"))
        await click(pg, "[data-pg=timelog] .tk-crew [data-m=lunch]")
        await click(pg, "[data-pg=timelog] .tg-pop [data-a=crewgo]")
        n = await pg.evaluate(f"__tg.STATE().shifts.filter(s=>/^cr/.test(s.id) && s.outReason==='Lunch').length")
        ok(n == 2, f"Lunch 12:00–12:30 for both ({n})")
        # ---- sign with a note (the tech, the period before, something still open)
        await pg.evaluate(SIGN + f"('Technician', {json.dumps(me)})"); await pg.wait_for_timeout(300)
        await pg.evaluate(GO + f"({json.dumps(K[0])})"); await pg.wait_for_timeout(300)
        pv = await pg.evaluate(f"""(()=>{{ const P=__tg.TL.PER('prev'), k=P[0], S=__tg.STATE(); const at=hm=>{{ const [y,m,d]=k.split('-').map(Number), [h,mi]=hm.split(':').map(Number); return new Date(y,m-1,d,h,mi).toISOString(); }};
          S.shifts.push({{id:'pv', in:at('07:00'), out:null, by:{json.dumps(me)}}}); const U=__tg.TL.U(); U.who={json.dumps(me)}; U.view='sheet'; U.per='prev'; U.pop=null; __tg.render(); return P; }})()""")
        await pg.wait_for_timeout(300)
        sg = await pg.evaluate("(document.querySelector('[data-pg=timelog] .tk-sgn')||{}).innerText||''")
        ok("Sign with a note" in sg and "Fix them" in sg, "blocked: Fix them · Sign with a note… — " + sg.replace("\n", " ")[:200] + " " + json.dumps(pv))
        await click(pg, "[data-pg=timelog] .tk-sgn [data-p=signnote]")
        await pg.fill("[data-pg=timelog] .tg-pop [data-in=sn]", "Monday I left at 15:10.")
        await click(pg, "[data-pg=timelog] .tg-pop [data-a=tsignn]")
        note = await pg.evaluate(f"((__tg.STATE().tlSign||{{}})[{json.dumps(me)} + '|' + {json.dumps(pv[0])}]||{{}}).note")
        ok(note == "Monday I left at 15:10.", "signed with the note")
        ok("15:10" in (await pg.evaluate("(document.querySelector('[data-pg=timelog] .tk-sgn-note')||{}).innerText||''")), "the note shows on the sign bar")
        await pg.screenshot(path=os.path.join(OUT, "5_sign.png"))
        # ---- graphite + phone width
        await pg.evaluate(GO + f"({json.dumps(K[1])})"); await pg.evaluate("(()=>{ try{ __tg.applyTheme('graphite'); }catch(e){} __tg.render(); })()"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=os.path.join(OUT, "7_graphite.png"))
        await pg.evaluate(GO + f"({json.dumps(K[0])})"); await pg.set_viewport_size({"width": 390, "height": 844}); await pg.wait_for_timeout(400)
        await pg.screenshot(path=os.path.join(OUT, "6_phone.png"))
        ok(not errs, "no page errors: " + " | ".join(errs[:3]))
        await b.close()
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
