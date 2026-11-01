# Parsec 14.7 (C) — the Technician page's Completed section (kept after a transfer or a delete) and Lunch · 1 hour with a reminder
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots147c"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12_c.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
SIGN = """((role)=>{ const T=__tg.staffList().filter(s=>s.role===role); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name && !r.dateClosed && r.operations.length>=2).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{ __tg.CX.U().skipMorning = __tg.todayStr(); }catch(e){} __tg.render(); return T[0].name; })"""
# four ROs: A completed by me yesterday, B today (then transferred), C two days ago (then deleted), D 40 days ago
PREP = """((who)=>{ const S=__tg.STATE(), now=Date.now(), iso=ms=>new Date(ms).toISOString(), day=864e5;
  const other=__tg.staffList().filter(s=>s.role==='Technician' && s.name!==who)[0].name;
  const ok=r=>r && !r.shop && r.id!=='ro_shop' && !r.dateClosed && r.operations.filter(o=>!o.declined).length>=1;
  const L=S.ros.filter(ok).slice(0,4); S.tcDone=[];
  const done=(r, when, i)=>{ const op=r.operations.filter(o=>!o.declined)[0]; r.assignedTech=who; S.punches=S.punches.filter(p=>p.opId!==op.id);
    S.punches.push({id:'pc'+i, roId:r.id, opId:op.id, start:iso(when-90*60e3), stop:iso(when), startReason:'Repairing', stopReason:'Complete', notes:'Done it', by:who});
    op.jobStatus={status:'Complete', setAt:iso(when), hand:true}; r.operations.forEach(o=>{ if(o!==op) o.declined=true; }); return op.id; };
  const ids=L.map(r=>r.id); done(L[0], now-day, 0); done(L[1], now-20*60e3, 1); done(L[2], now-2*day, 2); done(L[3], now-40*day, 3);
  S.shifts=(S.shifts||[]).filter(s=>!(s.by===who)); __tg.scheduleSave(true);
  return { ids, other, nums: L.map(r=>__tg.tgNum(r)) }; })"""
TECH = "(()=>{ __tg.UI().view='tech'; __tg.render(); })()"
LIST = "(document.querySelector('[data-pg=tech] .tch-list')||{}).innerText||''"
async def click(pg, sel):
    await pg.evaluate(f"(()=>{{ const b=document.querySelector({json.dumps(sel)}); if(!b) throw new Error('no '+{json.dumps(sel)}); b.click(); }})()"); await pg.wait_for_timeout(350)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        me = await pg.evaluate(SIGN + "('Technician')"); await pg.wait_for_timeout(300)
        D = await pg.evaluate(PREP + f"({json.dumps(me)})"); A, B, C, Dd = D["ids"]
        rec = await pg.evaluate("(__tg.STATE().tcDone||[]).map(e=>e.roId)")
        ok(all(x in rec for x in [A, B, C, Dd]), f"the record has all four completions ({len(rec)} lines)")
        # transfer B, delete C the way the app deletes (audit line first, then the RO and its punches go)
        await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(), b=__tg.getRO({json.dumps(B)}); b.assignedTech={json.dumps(D['other'])};
          const c=__tg.getRO({json.dumps(C)}); __tg.audit('ro-del', 'Deleted '+c.roNumber, c); S.punches=S.punches.filter(p=>p.roId!==c.id); S.ros=S.ros.filter(r=>r.id!==c.id); __tg.scheduleSave(true); }})()""")
        await pg.evaluate(TECH); await pg.wait_for_timeout(700)
        L = await pg.evaluate(LIST)
        ok("Completed" in L and "Today" in L.title() and "Yesterday" in L.title(), "Completed, grouped Today · Yesterday · …")
        ok("Done today" not in L, "Done today is the Today part of Completed now")
        ok(D["nums"][0] in L and D["nums"][1] in L and D["nums"][2] in L, "A, B (transferred) and C (deleted) are all there")
        ok(D["nums"][3] not in L, "the 40-day-old one waits behind Show all")
        bt = await pg.evaluate(f"(document.querySelector('[data-pg=tech] .tch-cit[data-id={json.dumps(B)}]')||{{}}).innerText||''")
        ok("now with" in bt.lower(), "B says who has it now: " + bt.replace("\n", " ")[:80])
        ct = await pg.evaluate(f"(document.querySelector('[data-pg=tech] .tch-cit[data-id=\"del:{C}\"]')||{{}}).innerText||''")
        ok("deleted" in ct.lower(), "C says deleted")
        await pg.screenshot(path=os.path.join(OUT, "1_list.png"))
        # a deleted one opens its record; a completed one opens the RO page
        await click(pg, f"[data-pg=tech] .tch-cit[data-id=\"del:{C}\"]")
        sn = await pg.evaluate("(document.querySelector('[data-pg=tech] .tch-cdel')||{}).innerText||''")
        ok("deleted" in sn.lower() and "Op 1" in sn, "the deleted RO opens a read-only record: " + sn.replace("\n", " ")[:90])
        await pg.screenshot(path=os.path.join(OUT, "2_deleted.png"))
        await click(pg, f"[data-pg=tech] .tch-cit[data-id={json.dumps(A)}]")
        jc = await pg.evaluate("(document.querySelector('[data-pg=tech] .tch-jc')||{}).getAttribute ? document.querySelector('[data-pg=tech] .tch-jc').getAttribute('data-jc') : null")
        ok(jc == A, f"A (yesterday, not in the live list) opens the RO page ({jc})")
        await click(pg, "[data-pg=tech] [data-a=tcdall]")
        ok(D["nums"][3] in await pg.evaluate(LIST), "Show all brings back the older one")
        # completing through the app writes the record on the save
        n0 = await pg.evaluate("(__tg.STATE().tcDone||[]).length")
        ro2 = await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(), r=S.ros.find(x=>!x.shop && x.id!=='ro_shop' && !x.dateClosed && ![{json.dumps(A)},{json.dumps(B)},{json.dumps(Dd)}].includes(x.id) && x.operations.some(o=>!o.declined && !__tg.opDoneNow(o)));
          const op=r.operations.find(o=>!o.declined && !__tg.opDoneNow(o)); (op.parts||[]).forEach(x=>x.status='Installed'); r.assignedTech={json.dumps(me)};
          S.punches.filter(p=>!p.stop).forEach(p=>{{ p.stop=new Date(Date.now()-60e3).toISOString(); p.stopReason='Switched job'; }});
          S.punches.push({{id:'pc9', roId:r.id, opId:op.id, start:new Date(Date.now()-30*60e3).toISOString(), stop:null, startReason:'Repairing', stopReason:null, notes:'Torqued and checked', by:{json.dumps(me)}}});
          S.shifts.push({{id:'shc', in:new Date(Date.now()-3*3600e3).toISOString(), out:null, by:{json.dumps(me)}}}); __tg.render(); return r.id; }})()""")
        await pg.evaluate("__tg.doStopPunch('Complete')"); await pg.wait_for_timeout(400)
        n1 = await pg.evaluate(f"(__tg.STATE().tcDone||[]).filter(e=>e.roId==={json.dumps(ro2)}).length")
        ok(n1 >= 1, f"Stop as Complete writes it to Completed ({n0} → +{n1})")
        # ---- Lunch · 1 hour
        await pg.evaluate("(()=>{ const T=__tg.CX && __tg.CX.U ? null : null; __tg.UI().view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(300)
        has = await pg.evaluate("""(()=>{ const b=document.querySelector('[data-pg=tech] [data-a=pop][data-p=out]'); if(!b) return 'no out button'; b.click(); return 'ok'; })()"""); await pg.wait_for_timeout(300)
        mi = await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tg-pop [data-a=out]')].map(b=>b.dataset.v+':'+b.innerText.split('\\n')[0])")
        ok(any(x.startswith("Lunch60:Lunch · 1 hour") for x in mi), f"the clock-out menu has Lunch · 1 hour ({has}; {mi})")
        await pg.screenshot(path=os.path.join(OUT, "3_outmenu.png"))
        await click(pg, "[data-pg=tech] .tg-pop [data-a=out][data-v=Lunch60]")
        st = await pg.evaluate(f"(()=>{{ const s=__tg.STATE().shifts.find(x=>x.id==='shc'); return [s.outReason, s.backBy ? Math.round((new Date(s.backBy)-new Date(s.out))/60000) : null, !!__tg.openShift()]; }})()")
        ok(st[0] == "Lunch" and st[1] == 60 and not st[2], f"clocked out for lunch, back by an hour later, off the clock ({st})")
        vis = await pg.evaluate("(()=>{ __tg.v147Tick(); const w=document.getElementById('v147'); return !!(w && !w.hidden && w.innerText.trim()); })()")
        ok(not vis, "no reminder before the hour is up")
        await pg.evaluate("(()=>{ const s=__tg.STATE().shifts.find(x=>x.id==='shc'); s.backBy=new Date(Date.now()-60e3).toISOString(); s.out=new Date(Date.now()-61*60e3).toISOString(); __tg.v147Tick(); })()"); await pg.wait_for_timeout(300)
        card = await pg.evaluate("(()=>{ const w=document.getElementById('v147'); return w && !w.hidden ? w.innerText : ''; })()")
        ok("Lunch is over" in card and "back by" in card, "the hour's up: Lunch is over — " + card.replace("\n", " ")[:90])
        ok(not await pg.evaluate("!!__tg.openShift()"), "and it didn't clock in by itself")
        await pg.screenshot(path=os.path.join(OUT, "4_lunch_card.png"))
        await pg.evaluate("(()=>{ __tg.UI().view='timelog'; __tg.render(); __tg.v147Tick(); })()"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("(()=>{ const w=document.getElementById('v147'); return !!(w && !w.hidden && /Lunch is over/.test(w.innerText)); })()"), "the card shows on the Time Log too")
        await click(pg, "#v147 [data-v147=snz]")
        ok(await pg.evaluate("(()=>{ const w=document.getElementById('v147'); return !w || w.hidden; })()"), "5 more minutes hides it")
        await pg.evaluate("(()=>{ const s=__tg.STATE().shifts.find(x=>x.id==='shc'); __tg.V147C.snz[s.id]=Date.now()-1000; __tg.v147Tick(); })()"); await pg.wait_for_timeout(200)
        await click(pg, "#v147 [data-v147=in]")
        ok(await pg.evaluate("!!__tg.openShift()"), "Clock in now clocks in")
        # the sidebar clock pop-over has Lunch · 1 h
        await pg.evaluate("(()=>{ __tg.UI().view='console'; __tg.UI().pxPop='clk'; __tg.render(); })()"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("!!document.querySelector('.pxr-pop.clk [data-action=clock-off][data-min=\"60\"]')"), "the sidebar clock pop-over has Lunch · 1 h")
        await pg.screenshot(path=os.path.join(OUT, "5_pxpop.png"))
        # dark
        await pg.evaluate(TECH); await pg.evaluate("(()=>{ document.documentElement.setAttribute('data-theme','ivd'); __tg.render(); })()"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=os.path.join(OUT, "6_dark.png"))
        ok(not errs, "no page errors: " + " | ".join(errs[:3]))
        await b.close()
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
