# Parsec 15 (C) — a trash on every time entry (Undo; the minutes stay as air and say what was there; must-ask → an ask),
# a reason for air as a note (day, Shop view, day report), and the RO page Time tab's notes that aren't on a punch (edit / delete,
# the writer, the foreman; greyed for another tech).
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots150c"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12_c.html"
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
def J(js): return "(()=>{ const R=" + SR + "; " + js + " })()"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
SIGN = """((role, nm)=>{ const T=__tg.staffList().filter(s=>s.role===role && (!nm || s.name===nm)); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name && !r.dateClosed && r.operations.length>=2).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{ __tg.CX.U().skipMorning = __tg.todayStr(); }catch(e){} __tg.render(); return T[0].name; })"""
PREP = """((who, other)=>{ const S=__tg.STATE(), p2=n=>String(n).padStart(2,'0'), kOf=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
  const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()-3); const K=kOf(d);
  const at=(hm)=>{ const [y,m,dd]=K.split('-').map(Number), [h,mi]=hm.split(':').map(Number); return new Date(y,m-1,dd,h,mi).toISOString(); };
  S.punches=S.punches.filter(p=>p.by!==who); S.shifts=(S.shifts||[]).filter(s=>s.by!==who); S.holes=[]; S.tlReq=[]; S.tlAirWhy={}; S.tlSign={};
  const ok=r=>r && !r.shop && r.id!=='ro_shop' && !r.dateClosed; const r=S.ros.filter(x=>ok(x) && x.operations.length>=2)[0]; r.assignedTech=who;
  r.operations.forEach(o=>{ o.declined=false; delete o.assignedTech; });
  const o0=r.operations[0], o1=r.operations[1], P=(id,a,b,op,n)=>S.punches.push({id, roId:r.id, opId:op.id, start:at(a), stop:at(b), startReason:'Repairing', stopReason:'Switched job', notes:n||'', by:who});
  S.shifts.push({id:'s1', in:at('07:00'), out:at('15:30'), outReason:'End of day', by:who});
  P('a1','07:10','09:30',o0,'Pulled the hub'); P('a2','09:30','11:58',o1,'Torqued'); P('a3','12:30','14:52',o0,'Road tested');
  o1.log=[{id:'lgx', at:at('10:05'), kind:'cause', text:'SPN 3226 FMI 2 active, outlet reading erratic.'}];
  o1.offNotes=[{id:'onx', at:at('10:20'), text:'Customer says it smokes when cold.', by: other}];
  __tg.render(); return { K, ro:r.id, o0:o0.id, o1:o1.id, num: String(r.roNumber||'') }; })"""
GO = """((k)=>{ const b=document.querySelector('nav [data-view=timelog], .sidebar [data-view=timelog], .dp-tabs [data-view=timelog]'); if(b) b.click(); else { const V=__tg.UI(); V.tlMe=1; V.view='timelog'; __tg.render(); }   /* 17.1: Time Log is a tab of the department page */ const U=__tg.TL.U(); U.view='day'; U.day=k; U.sel=null; U.pop=null; __tg.render(); })"""
async def toast(pg): return await pg.evaluate("((document.querySelector('.toast')||{}).textContent||'')")
async def jtoast(pg): return await pg.evaluate(J("const t=R.getElementById('toast'); return t ? t.textContent : ''"))
async def click(pg, sel):
    await pg.evaluate(f"(()=>{{ const b=document.querySelector({json.dumps(sel)}); if(!b) throw new Error('no '+{json.dumps(sel)}); b.click(); }})()"); await pg.wait_for_timeout(250)
async def jclick(pg, sel):
    r = await pg.evaluate(J(f"const b=R.querySelector({json.dumps(sel)}); if(!b) return false; b.click(); return true;")); await pg.wait_for_timeout(300); return r
async def ro_tab(pg, rid, op):
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
    on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); return r ? r.classList.contains('is-on') : null"))
    if not on: await pg.evaluate(J(f"const t=R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t'); t && t.click()")); await pg.wait_for_timeout(600)
    await pg.evaluate(J(f"const o=R.querySelector('.px-row[data-op=\"{op}\"]'); const box=o && (o.closest('.px-op') || o.parentNode); const t=[...(box||R).querySelectorAll('.px-tab')].find(x=>x.dataset.tab==='time'); t && t.click();")); await pg.wait_for_timeout(500)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        me = await pg.evaluate(SIGN + "('Technician')"); await pg.wait_for_timeout(300)
        other = await pg.evaluate(f"__tg.staffList().filter(s=>s.role==='Technician' && s.name!=={json.dumps(me)})[0].name")
        D = await pg.evaluate(PREP + f"({json.dumps(me)}, {json.dumps(other)})"); K = D["K"]
        await pg.evaluate(GO + f"({json.dumps(K)})"); await pg.wait_for_timeout(400)
        # ---- the Time Log: a trash on every entry; one click; the minutes become air and say what was there; Undo
        ok(await pg.evaluate("document.querySelectorAll('[data-pg=timelog] .tk-r .tk-del').length") == 3, "a trash on every stopped entry")
        await click(pg, "[data-pg=timelog] .tk-r[data-p=a2] .tk-del")
        ok(await pg.evaluate("!__tg.STATE().punches.some(p=>p.id==='a2')"), "one click deletes it — no question")
        ok("air" in (await toast(pg)).lower(), "the toast says it counts as air · " + (await toast(pg))[:70])
        hl = await pg.evaluate("(__tg.STATE().holes||[]).slice(-1)[0]||{}")
        ok(hl.get("by") == me and hl.get("roId") == D["ro"] and hl.get("opId") == D["o1"] and hl.get("label") and hl.get("delBy"), f"the record: whose, what, who deleted it ({hl.get('label')}, by {hl.get('delBy')})")
        row = await pg.evaluate("(document.querySelector('[data-pg=timelog] .tk-r.air.del')||{}).innerText||''")
        ok("deleted" in row and "09:30–11:58" in row and hl.get("label", "x") in row, "the air row names it · " + row.replace("\n", " ")[:90])
        tip = await pg.evaluate("(document.querySelector('[data-pg=timelog] .tk-tl .tk-b.air.dl')||{dataset:{}}).dataset.tip||''")
        ok("Deleted" in tip and "09:30–11:58" in tip, "the timeline block's tooltip names it · " + tip[:80])
        await pg.screenshot(path=os.path.join(OUT, "1_deleted_air.png"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("__tg.STATE().punches.some(p=>p.id==='a2')") and await pg.evaluate("!document.querySelector('[data-pg=timelog] .tk-r.air.del')"), "Undo brings it back")
        # ---- a reason for air (the 11:58–12:30 gap): quick reasons, then own words
        await click(pg, "[data-pg=timelog] .tk-r.air [data-p=airwhy][data-from='718']")
        ok(await pg.evaluate("document.querySelectorAll('[data-pg=timelog] .tg-pop .tk-why .tg-chip').length") == 6, "+ Reason: 5 quick reasons and Other…")
        await click(pg, "[data-pg=timelog] .tg-pop .tk-why .tg-chip[data-v='Waiting on parts']")
        await click(pg, "[data-pg=timelog] .tg-pop [data-a=awgo]")
        aw = await pg.evaluate(f"(__tg.STATE().tlAirWhy||{{}})[{json.dumps(me)} + '|' + {json.dumps(K)}]||[]")
        ok(len(aw) == 1 and aw[0]["why"] == "Waiting on parts" and aw[0]["from"] == 718 and aw[0]["to"] == 750, f"saved per person / day / span ({aw[:1]})")
        row = await pg.evaluate("(document.querySelector('[data-pg=timelog] .tk-r.air.why')||{}).innerText||''")
        ok("Waiting on parts" in row and "note" in row, "the air row shows it with a note tag · " + row.replace("\n", " ")[:70])
        ok(await pg.evaluate("![...document.querySelectorAll('[data-pg=timelog] .tk-fix.warn')].some(x=>/of air/.test(x.textContent) && /11:58/.test(x.textContent))"), "explained air isn't flagged any more")
        await click(pg, "[data-pg=timelog] .tk-r.air.why [data-p=airwhy]")
        await click(pg, "[data-pg=timelog] .tg-pop .tk-why [data-a=whyo]")
        await pg.fill("[data-pg=timelog] .tg-pop [data-in=why]", "Truck not back from the wash bay"); await pg.wait_for_timeout(80)
        await click(pg, "[data-pg=timelog] .tg-pop [data-a=awgo]")
        aw = await pg.evaluate(f"(__tg.STATE().tlAirWhy||{{}})[{json.dumps(me)} + '|' + {json.dumps(K)}]||[]")
        ok(len(aw) == 1 and aw[0]["why"] == "Truck not back from the wash bay", "changed to own words (still one note)")
        tip = await pg.evaluate("[...document.querySelectorAll('[data-pg=timelog] .tk-tl .tk-b.air')].map(x=>x.dataset.tip).join(' | ')")
        ok("Why: Truck not back" in tip, "the timeline tooltip carries the reason")
        # ---- the day report
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='report'; U.reportDate={json.dumps(K)}; __tg.render(); }})()"); await pg.wait_for_timeout(500)
        dr = await pg.evaluate("(document.querySelector('[data-pg=report]')||{}).innerText||''")
        ok("Truck not back from the wash bay" in dr, "the day report lists the reason")
        # ---- must-ask: the trash sends an ask
        await pg.evaluate("(()=>{ const sf=__tg.viewAsStaff(); sf.ov=sf.ov||{}; sf.ov.acts=sf.ov.acts||{}; sf.ov.acts['t.editown']=false; })()")
        await pg.evaluate(GO + f"({json.dumps(K)})"); await pg.wait_for_timeout(300)
        t1 = await pg.evaluate("(document.querySelector('[data-pg=timelog] .tk-r[data-p=a1] .tk-del')||{dataset:{}}).dataset.tip||''")
        await click(pg, "[data-pg=timelog] .tk-r[data-p=a1] .tk-del")
        rq = await pg.evaluate("(__tg.STATE().tlReq||[]).filter(r=>r.st==='open').map(r=>[r.x, r.label])")
        ok(t1.startswith("Ask") and rq and rq[0][0] == "del" and await pg.evaluate("__tg.STATE().punches.some(p=>p.id==='a1')"), f"must ask: the trash sends an ask, nothing deleted ({rq})")
        await pg.evaluate("(()=>{ const sf=__tg.viewAsStaff(); delete sf.ov.acts['t.editown']; })()")
        # ---- the RO page Time tab: notes that aren't on a punch (the writer: the op's tech = me)
        await ro_tab(pg, D["ro"], D["o1"])
        n = await pg.evaluate(J("return R.querySelectorAll('.rop-tn.is-solo .rop-ntools').length"))
        ok(n == 2, f"pencil and trash on the two notes that aren't on a punch ({n})")
        await pg.evaluate(J("const r=[...R.querySelectorAll('.rop-tn.is-solo')].find(x=>/SPN 3226/.test(x.textContent)); r.querySelector('.rop-ntools .rop-ib:nth-child(2)').click();")); await pg.wait_for_timeout(300)
        ok(await pg.evaluate(J("return !!R.querySelector('.rop-nined')")), "the pencil opens it in place")
        await pg.evaluate(J("const i=R.querySelector('.rop-nined'); i.value='SPN 3226 FMI 2 active — erratic against the inlet sensor'; i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));")); await pg.wait_for_timeout(400)
        lg = await pg.evaluate(f"__tg.getRO({json.dumps(D['ro'])}).operations.find(o=>o.id==={json.dumps(D['o1'])}).log[0]")
        ok(lg["text"].startswith("SPN 3226 FMI 2 active — erratic") and lg.get("editedAt") and await pg.evaluate(J("return [...R.querySelectorAll('.rop-tned')].length")) == 1, "Enter saves it, marked edited")
        await pg.evaluate(J("const r=[...R.querySelectorAll('.rop-tn.is-solo')].find(x=>/SPN 3226/.test(x.textContent)); r.querySelector('.rop-ntools .is-dng').click();")); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(f"__tg.getRO({json.dumps(D['ro'])}).operations.find(o=>o.id==={json.dumps(D['o1'])}).log.filter(l=>!l.cc).length") == 0 and "deleted" in (await jtoast(pg)).lower(), "the trash deletes it, with Undo in the toast")
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate(f"__tg.getRO({json.dumps(D['ro'])}).operations.find(o=>o.id==={json.dumps(D['o1'])}).log.filter(l=>!l.cc).length") == 1, "Undo brings the note back")
        await ro_tab(pg, D["ro"], D["o1"])
        off = await pg.evaluate(J("const r=[...R.querySelectorAll('.rop-tn.is-solo')].find(x=>/smokes/.test(x.textContent)); if(!r) return null; const b=r.querySelector('.rop-ntools .rop-ib:nth-child(2)'); return [b.classList.contains('is-off'), b.dataset.tip||'']"))
        ok(off and off[0] and "foreman" in off[1], f"another tech's note is greyed for me, with why ({off})")
        await pg.evaluate(J("const r=[...R.querySelectorAll('.rop-tn.is-solo')].find(x=>/smokes/.test(x.textContent)); r.querySelector('.rop-ntools .rop-ib:nth-child(2)').click();")); await pg.wait_for_timeout(300)
        ok(not await pg.evaluate(J("return !!R.querySelector('.rop-nined')")), "…and its pencil doesn't open it")
        # ---- the RO page's trash on a punch: the place it was shows as air
        await pg.evaluate(J("const b=R.querySelector('.rop-tp[data-pid=a2] .rop-ttools .is-dng'); b && b.click();")); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("!__tg.STATE().punches.some(p=>p.id==='a2')") and "air" in (await jtoast(pg)).lower(), "the RO page's trash deletes it — the toast says it's air now")
        hr = await pg.evaluate(J("return (R.querySelector('.rop-tn.is-hole')||{}).textContent||''"))
        ok("Deleted" in hr and "air" in hr, "the Time tab shows where it was · " + hr[:70])
        await pg.screenshot(path=os.path.join(OUT, "2_ro_time_tab.png"))
        # ---- the foreman: can change the other tech's note; the Shop view shows the air note
        fm = await pg.evaluate(SIGN + "('Foreman')"); await pg.wait_for_timeout(300)
        await ro_tab(pg, D["ro"], D["o1"])
        offf = await pg.evaluate(J("const r=[...R.querySelectorAll('.rop-tn.is-solo')].find(x=>/smokes/.test(x.textContent)); if(!r) return null; return r.querySelector('.rop-ntools .rop-ib:nth-child(2)').classList.contains('is-off')"))
        ok(offf is False, "the foreman may change it")
        await pg.evaluate(J("const r=[...R.querySelectorAll('.rop-tn.is-solo')].find(x=>/smokes/.test(x.textContent)); r.querySelector('.rop-ntools .rop-ib:nth-child(2)').click();")); await pg.wait_for_timeout(300)
        await pg.evaluate(J("const i=R.querySelector('.rop-nined'); i.value='Customer: smokes on a cold start, clears in 2 min'; i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));")); await pg.wait_for_timeout(400)
        on = await pg.evaluate(f"__tg.getRO({json.dumps(D['ro'])}).operations.find(o=>o.id==={json.dumps(D['o1'])}).offNotes[0]")
        ok(on["text"].startswith("Customer: smokes") and on.get("editedBy") == fm, f"…and does (edited by {on.get('editedBy')})")
        await pg.evaluate(J("const r=[...R.querySelectorAll('.rop-tn.is-solo')].find(x=>/smokes/.test(x.textContent)); r.querySelector('.rop-ntools .is-dng').click();")); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(f"(__tg.getRO({json.dumps(D['ro'])}).operations.find(o=>o.id==={json.dumps(D['o1'])}).offNotes||[]).length") == 0, "the foreman deletes it")
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(400)
        await pg.evaluate(GO + f"({json.dumps(K)})"); await pg.evaluate(f"(()=>{{ const U=__tg.TL.U(); U.who='ALL'; U.view='shop'; U.day={json.dumps(K)}; __tg.render(); }})()"); await pg.wait_for_timeout(400)
        st = await pg.evaluate(f"(()=>{{ const r=document.querySelector('[data-pg=timelog] .tk-sr[data-t=\"{me}\"]'); return r ? [...r.querySelectorAll('.tk-b.air.nt')].map(x=>x.dataset.tip).join(' | ') : null; }})()")
        ok(st and "Truck not back" in st, "the Shop view marks that tech's air with the note")
        await pg.screenshot(path=os.path.join(OUT, "3_shop.png"))
        # ---- a new note written off a punch gets its writer
        stamped = await pg.evaluate(f"(()=>{{ const op=__tg.getRO({json.dumps(D['ro'])}).operations.find(o=>o.id==={json.dumps(D['o0'])}); op.log=op.log||[]; op.log.push({{id:'lgn', at:new Date().toISOString(), kind:'fix', text:'Replaced the sensor.'}}); __tg.scheduleSave(true); return op.log.slice(-1)[0].by; }})()")
        ok(stamped == fm, f"a new note off a punch keeps who wrote it ({stamped})")
        ok(not errs, "no page errors: " + " | ".join(errs[:3]))
        await b.close()
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
