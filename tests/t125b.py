# Parsec 12.5 fork B — Complete without notes or files (they stay as the final check); move a person's time to someone else
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots125b"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t125b.html"
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
# an RO with one live operation: parts installed, two stopped punches with no notes, no files
PREP1 = """(()=>{ const S=__tg.STATE(); const L=S.ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.filter(o=>!o.declined).length>=1);
  const r=L[0]; S.punches.filter(p=>!p.stop).forEach(p=>{ p.stop=new Date(Date.now()-120000).toISOString(); p.stopReason='Switched job'; });
  r.operations.forEach((o,i)=>{ if(i) o.declined=true; }); const op=r.operations[0]; op.declined=false; delete op.jobStatus; op.cause=''; op.log=[]; op.work=''; op.fix='';
  (op.parts||[]).forEach(x=>{ x.status='Installed'; }); r.bulletins=(r.bulletins||[]).map(e=>Object.assign({}, e, {files:[]})); r.attachments=[];
  S.punches=S.punches.filter(p=>p.roId!==r.id);
  const t=ms=>new Date(Date.now()-ms).toISOString();
  S.punches.push({id:'pb1', roId:r.id, opId:op.id, start:t(3*3600e3), stop:t(2*3600e3), startReason:'Repairing', stopReason:'Switched job', notes:'', by:'Marcus Lee', burntCredited:true});
  S.punches.push({id:'pb2', roId:r.id, opId:op.id, start:t(1800e3), stop:null, startReason:'Repairing', stopReason:null, notes:'', by:'Marcus Lee'});
  __tg.render(); return [r.id, op.id]; })()"""
async def complete_part(p):
    print("— Complete without notes or files")
    b, pg, errs = await setup(p)
    rid, op = await pg.evaluate(PREP1)
    g = await pg.evaluate(f"(()=>{{ const op=__tg.getRO('{rid}').operations[0]; return [__tg.opCompleteGaps(op), __tg.opNoteGaps(op)]; }})()")
    ok(g[0] == [] and g[1] and g[1][0]["k"] == "notes", f"no notes is not a gap on Complete any more, it's a note still owed ({g})")
    await pg.evaluate("__tg.doStopPunch('Complete')"); await pg.wait_for_timeout(300)
    st = await pg.evaluate(f"(()=>{{ const p=__tg.STATE().punches.find(p=>p.id==='pb2'); const s=__tg.roStatus ? null : null; return p.stopReason; }})()")
    ok(st == "Complete", f"stopping as Complete with no notes stays Complete ({st})")
    ops = await pg.evaluate(f"(()=>{{ const op=__tg.getRO('{rid}').operations[0]; const s=__tg.opStatus ? __tg.opStatus(op) : null; return s; }})()")
    # opStatus may not be on the hook — read it through the RO list status instead
    rg = await pg.evaluate(f"__tg.roCompleteGaps(__tg.getRO('{rid}'))")
    ok(not any("attachment" in x for x in rg), f"the RO's Complete doesn't wait on files ({rg})")
    cl = await pg.evaluate(f"__tg.tyCloseChecks(__tg.getRO('{rid}')).map(c=>[c.k,c.t,c.ok,c.d])")
    print("    ready to close:", cl)
    ok(any(c[0] == "notes" and not c[2] for c in cl), "Ready to close still checks the notes")
    ok(any(c[0] == "files" and not c[2] for c in cl), "Ready to close checks the files")
    ta = await pg.evaluate(f"__tg.trxAuto(__tg.getRO('{rid}')).map(x=>[x.t,x.ok])")
    ok(["Notes written", False] in ta and ["Files on the RO", False] in ta, f"the truck checks check notes and files ({ta})")
    # parts still gate Complete
    await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{rid}'), op=r.operations[0]; op.parts=op.parts||[]; op.parts.push({{id:'ptx', description:'Test hose', partNumber:'TX-1', qty:'1', status:'Ordered'}}); __tg.STATE().punches.push({{id:'pb3', roId:r.id, opId:op.id, start:new Date(Date.now()-600e3).toISOString(), stop:null, startReason:'Repairing', stopReason:null, notes:'', by:'Marcus Lee'}}); }})()")
    await pg.evaluate("__tg.doStopPunch('Complete')"); await pg.wait_for_timeout(300)
    st3 = await pg.evaluate("__tg.STATE().punches.find(p=>p.id==='pb3').stopReason")
    ok(st3 == "Hold Tech", f"a part not installed still stops Complete ({st3})")
    await pg.evaluate(f"(()=>{{ const op=__tg.getRO('{rid}').operations[0]; op.parts=op.parts.filter(x=>x.id!=='ptx'); __tg.STATE().punches.find(p=>p.id==='pb3').stopReason='Complete'; __tg.render(); }})()")
    # the release: Notes written and Files on the RO, and they need a reason
    await pg.evaluate("__tg.PG.go('triage')"); await pg.wait_for_timeout(500)
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.tgView='inbox'; U.tgSel='{rid}'; U.tgPop={{type:'release', ro:'{rid}'}}; __tg.render(); }})()"); await pg.wait_for_timeout(500)
    rl = await pg.evaluate("document.querySelector('.tg-pop.rl') ? document.querySelector('.tg-pop.rl').innerText : ''")
    print("    release:", rl.replace("\n", " · ")[:400])
    ok("Notes written" in rl and "Files on the RO" in rl, "the release lists Notes written and Files on the RO")
    ok("Release anyway" in rl or "open — why" in rl or "check" in rl.lower(), "releasing without them asks for a reason")
    fb = await pg.evaluate("(()=>{ const r=[...document.querySelectorAll('.tg-pop.rl .tg-ck')].find(x=>/Files on the RO/.test(x.textContent)); return r ? !!r.querySelector('[data-action=goto-ro]') : null; })()")
    ok(fb, "Files on the RO has Open RO")
    await pg.screenshot(path=os.path.join(OUT, "a1_release.png"))
    print("ERRORS", errs[:6]); ok(not errs, "Complete part: no console errors")
    await b.close()
# two technicians: A's yesterday (morning clock + afternoon clock, three punches) and B's afternoon (a clock and one punch that overlaps A's last)
PREP2 = """(()=>{ const S=__tg.STATE(); const T=__tg.staffList().filter(s=>s.role==='Technician'); const A=T[0].name, B=T[1].name;
  const d=new Date(); d.setDate(d.getDate()-1); const y=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const at=(h,m)=>{ const x=new Date(y+'T00:00:00'); x.setHours(h,m,0,0); return x.toISOString(); };
  S.shifts=(S.shifts||[]).filter(s=>__tg.localDay(s.in)!==y); S.punches=S.punches.filter(p=>__tg.localDay(p.start)!==y);
  const ros=S.ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length); const r1=ros[0], r2=ros[1]; r1.assignedTech=A; r2.assignedTech=A;
  S.shifts.push({id:'sa1', in:at(7,0), out:at(11,30), outReason:'Lunch', by:A}, {id:'sa2', in:at(12,0), out:at(15,30), outReason:'End of day', by:A}, {id:'sb1', in:at(12,30), out:at(16,0), outReason:'End of day', by:B});
  S.punches.push({id:'pa1', roId:r1.id, opId:r1.operations[0].id, start:at(7,10), stop:at(9,0), startReason:'Diagnosing', stopReason:'Switched job', notes:'0:20 Found a chafed harness.', by:A, burntCredited:true});
  S.punches.push({id:'pa2', roId:r2.id, opId:r2.operations[0].id, start:at(9,10), stop:at(11,20), startReason:'Repairing', stopReason:'Lunch', notes:'', by:A, burntCredited:true});
  S.punches.push({id:'pa3', roId:r1.id, opId:r1.operations[0].id, start:at(13,0), stop:at(14,0), startReason:'Repairing', stopReason:'Complete', notes:'', by:A, burntCredited:true});
  S.punches.push({id:'pb9', roId:r2.id, opId:r2.operations[0].id, start:at(13,30), stop:at(14,30), startReason:'Testing', stopReason:'Switched job', notes:'', by:B, burntCredited:true});
  __tg.render(); return [A, B, y, r1.id, r2.id]; })()"""
async def move_part(p, w=1440, h=900, phone=False):
    print("— Move time" + (" (phone)" if phone else ""))
    b, pg, errs = await setup(p, w, h, phone)
    A, B, y, r1, r2 = await pg.evaluate(PREP2)
    await pg.evaluate("__tg.PG.go('timelog')"); await pg.wait_for_timeout(500)
    await pg.evaluate(f"(()=>{{ const U=__tg.TL.U(); U.who={json.dumps(A)}; U.day='{y}'; U.view='day'; __tg.render(); }})()"); await pg.wait_for_timeout(500)
    btn = await pg.evaluate("(()=>{ const b=document.querySelector('[data-pg=timelog] .tk-mv'); return b ? [b.dataset.from, b.dataset.day, b.getAttribute('title')] : null; })()")
    ok(btn and btn[0] == A and btn[1] == y, f"the Time Log header has Move time for the person shown ({btn})")
    await pg.click("[data-pg=timelog] .tk-mv"); await pg.wait_for_timeout(400)
    m = await pg.evaluate("(()=>{ const m=__tg.UI().modal; return m ? [m.type, m.from, m.to, m.d0, m.d1] : null; })()")
    ok(m and m[0] == "tx-move" and m[1] == A and m[3] == y, f"the dialog opens on {A}'s day ({m})")
    await pg.select_option(".modal [data-tx-in=to]", B); await pg.wait_for_timeout(400)
    s = await pg.evaluate("document.querySelector('.modal .tx-sum').innerText")
    rows = await pg.evaluate("[...document.querySelectorAll('.modal .tx-r')].map(r=>r.className.replace('tx-r ','')+': '+r.innerText.replace(/\\n/g,' | '))")
    print("    summary:", s); [print("     ", r) for r in rows]
    ok("2 day clocks" in s and "2 punches" in s and "1 stays" in s, "preview: 2 day clocks and 2 punches move, 1 stays")
    ok(any(r.startswith("stay") and "overlaps" in r for r in rows), "the punch that overlaps B's own punch stays, and says why")
    ok(any(r.startswith("join") and "joined" in r for r in rows), "the afternoon clock joins B's")
    await pg.screenshot(path=os.path.join(OUT, "b1_dialog" + ("_phone" if phone else "") + ".png"))
    await pg.click(".modal [data-tx-in=ro]"); await pg.wait_for_timeout(400)
    s2 = await pg.evaluate("document.querySelector('.modal .tx-sum').innerText")
    ok("hands over 2 ROs" in s2, f"hand over their ROs: {s2}")
    await pg.click('.modal [data-action="tx-why"][data-v="Covering for someone"]'); await pg.wait_for_timeout(200)
    await pg.click('.modal [data-action="tx-go"]'); await pg.wait_for_timeout(600)
    res = await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(); const P=id=>S.punches.find(p=>p.id===id); const sh=id=>S.shifts.find(s=>s.id===id);
      return {{ pa1: P('pa1').by, pa1f: P('pa1').movedFrom, pa1n: P('pa1').notes, pa2: P('pa2').by, pa3: P('pa3').by, sa1: (sh('sa1')||{{}}).by, sa2: !!sh('sa2'), sb1: sh('sb1') ? [sh('sb1').in, sh('sb1').out, sh('sb1').by] : null,
        r1: __tg.getRO('{r1}').assignedTech, r2: __tg.getRO('{r2}').assignedTech, modal: !!__tg.UI().modal, au: (S.audit||[]).slice(-3).map(a=>a.text) }}; }})()""")
    print("    after:", res)
    ok(res["pa1"] == B and res["pa2"] == B and res["pa1f"] == A and "chafed" in res["pa1n"], "the punches are B's now, notes and all, and remember they were A's")
    ok(res["pa3"] == A, "the overlapping punch stayed A's")
    ok(res["sa1"] == B and not res["sa2"] and res["sb1"] and res["sb1"][2] == B and res["sb1"][0] < f"{y}T23", "A's morning clock is B's; the afternoon clock joined B's")
    ok(res["r1"] == B and res["r2"] == B, "the ROs are B's")
    ok(not res["modal"] and any("Moved" in a and "Covering for someone" in a for a in res["au"]), "the dialog closes and the Activity log keeps a line")
    sb_in = await pg.evaluate("(()=>{ const s=__tg.STATE().shifts.find(s=>s.id==='sb1'); return new Date(s.in).getHours()+':'+new Date(s.in).getMinutes(); })()")
    ok(sb_in == "12:0", f"the joined clock starts when A's did ({sb_in})")
    await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(400)
    un = await pg.evaluate("(()=>{ const S=__tg.STATE(); return [S.punches.find(p=>p.id==='pa1').by, !!S.shifts.find(s=>s.id==='sa2')]; })()")
    ok(un[0] == A and un[1], f"one Undo puts it all back ({un})")
    # Manager › Team opens it for that person
    if not phone:
        await pg.evaluate("__tg.PG.go('manager')"); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{ const b=document.querySelector('[data-pg=manager] [data-a=view][data-v=team]'); b && b.click(); })()"); await pg.wait_for_timeout(400)
        await pg.evaluate(f"(()=>{{ const it=[...document.querySelectorAll('[data-pg=manager] .mg-pi, [data-pg=manager] .mq-pi')].find(x=>x.textContent.includes({json.dumps(B)})); it && it.click(); }})()"); await pg.wait_for_timeout(400)
        mb = await pg.evaluate("(()=>{ const b=document.querySelector('[data-pg=manager] [data-action=tx-open]'); return b ? b.dataset.from : null; })()")
        ok(mb == B, f"Manager › Team has Move time… for {B} ({mb})")
        if mb:
            await pg.click("[data-pg=manager] [data-action=tx-open]"); await pg.wait_for_timeout(400)
            m2 = await pg.evaluate("(()=>{ const m=__tg.UI().modal; return m ? m.from : null; })()")
            ok(m2 == B, "…and opens the dialog from them")
            await pg.screenshot(path=os.path.join(OUT, "b2_manager.png"))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
    # a technician doesn't get the button
    await pg.evaluate(f"""(()=>{{ const T=__tg.staffList().filter(s=>s.role==='Technician'); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.CX.U().skipMorning = __tg.todayStr(); __tg.PG.go('timelog'); __tg.render(); }})()"""); await pg.wait_for_timeout(500)
    ok(await pg.evaluate("!document.querySelector('[data-pg=timelog] .tk-mv')"), "a technician's own Time Log has no Move time")
    print("ERRORS", errs[:6]); ok(not errs, "Move time: no console errors")
    await b.close()
async def main():
    async with async_playwright() as p:
        await complete_part(p)
        await move_part(p)
        await move_part(p, 390, 844, True)
    print("FAILS", len(FAILS), FAILS)
asyncio.run(main())
