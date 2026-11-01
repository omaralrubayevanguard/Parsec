# Parsec 14.9 (D) — air never counts toward efficiency (the same figure with 2 h or 8 h of air: the Time Log, the day report,
# the RO page clock card, the Technician page), the end of the shift stops nothing (the clock card's automation), and the key tag
# beside the spot (the RO page truck card — changed in place, Undo — the RO list pane and Spot column, the Technician list).
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_d.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots149d"); os.makedirs(OUT, exist_ok=True)
SIGN = """((role)=>{ const T=__tg.staffList().filter(s=>s.role===role); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name && !r.dateClosed && r.operations.length>=2).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{ __tg.CX.U().skipMorning = __tg.todayStr(); }catch(e){} __tg.render(); return T[0].name; })"""
# a past day for the tech: one finished op (2.0 h quoted, 2 h punched) and the day clock 07:00–11:00 (2 h of air)
PREP = """((who)=>{ const S=__tg.STATE(), p2=n=>String(n).padStart(2,'0'), kOf=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
  const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()-2); const K=kOf(d);
  const at=(k,hm)=>{ const [y,m,dd]=k.split('-').map(Number), [h,mi]=hm.split(':').map(Number); return new Date(y,m-1,dd,h,mi).toISOString(); };
  S.punches=S.punches.filter(p=>!(p.by===who && __tg.localDay(p.start)===K)); S.shifts=(S.shifts||[]).filter(s=>!(s.by===who && __tg.localDay(s.in)===K));
  const r=S.ros.filter(x=>!x.shop && x.id!=='ro_shop' && !x.dateClosed && x.operations.length>=2)[0]; r.assignedTech=who; const o=r.operations[0];
  o.declined=false; o.quoted=2; delete o.burnt; delete o.burntAdj; S.punches=S.punches.filter(p=>p.opId!==o.id);
  S.punches.push({id:'e1', roId:r.id, opId:o.id, start:at(K,'08:00'), stop:at(K,'10:00'), startReason:'Repairing', stopReason:'Complete', notes:'done', by:who});
  o.jobStatus={status:'Complete', setAt:at(K,'10:00'), hand:true};
  S.shifts.push({id:'sx', in:at(K,'07:00'), out:at(K,'11:00'), outReason:'End of day', by:who});
  __tg.render(); return { K, ro:r.id, op:o.id, k10:at(K,'17:00') }; })"""
async def figs(pg, who, K, rid, op):
    return await pg.evaluate(f"""(()=>{{ __tg.TL.flush(); const c=__tg.TL.calc({json.dumps(who)}, {json.dumps(K)}); let d=null; try{{ d=__tg.DR.data({json.dumps(K)}); }}catch(e){{}}
      const opx=__tg.getRO({json.dumps(rid)}).operations.find(o=>o.id==={json.dumps(op)}); let oc=null; try{{ oc=__tg.opCalc ? __tg.opCalc(opx).efficiency : null; }}catch(e){{}}
      return {{ tl: c && c.eff != null ? Math.round(c.eff*100) : null, air: c ? Math.round(c.airM) : null, dr: d && d.eff != null ? Math.round(d.eff*100) : null, drAir: d ? Math.round(d.air) : null }}; }})()""")
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        me = await pg.evaluate(SIGN + "('Technician')"); await pg.wait_for_timeout(300)
        X = await pg.evaluate(PREP + f"({json.dumps(me)})")
        # ---- 1) the same efficiency with 2 h or 8 h of air
        f1 = await figs(pg, me, X["K"], X["ro"], X["op"])
        await pg.evaluate(f"(()=>{{ const s=__tg.STATE().shifts.find(x=>x.id==='sx'); s.out={json.dumps(X['k10'])}; __tg.render(); }})()")
        f2 = await figs(pg, me, X["K"], X["ro"], X["op"])
        print("   ", f1, f2)
        ok(f1["tl"] == f2["tl"] == 100 and f2["air"] > f1["air"] + 300, f"Time Log: {f1['tl']}% with {f1['air']} min of air, {f2['tl']}% with {f2['air']} min")
        ok(f1["dr"] == f2["dr"] and f2["drAir"] > f1["drAir"], f"day report: {f1['dr']}% → {f2['dr']}% (air {f1['drAir']} → {f2['drAir']} min)")
        # the Technician page and the RO page clock card: air today (the day clock started 5 h ago, no job since) doesn't move them
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(600)
        th = lambda: pg.evaluate("(()=>{ const t=(document.querySelector('[data-pg] .tg-facts')||{}).innerText||''; const m=/(\\d+|—)%?\\s*efficiency today/.exec(t); return m ? m[1] : t.slice(0,120); })()")
        e1 = await th()
        await pg.evaluate(f"(()=>{{ const S=__tg.STATE(); S.shifts.push({{id:'st', in:new Date(Date.now()-5*3600e3).toISOString(), out:null, by:{json.dumps(me)}}}); __tg.render(); }})()"); await pg.wait_for_timeout(600)
        e2 = await th()
        ok(e1 == e2, f"Technician page: efficiency today {e1} → {e2} with 5 h of air today")
        nud = await pg.evaluate("(document.querySelector('[data-pg]')||{}).innerText||''")
        ok("counts against" not in nud, "no 'air counts against your efficiency' wording")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo={json.dumps(X['ro'])}; U.roOpen={{}}; U.roOpen[{json.dumps(X['ro'])}]=[{json.dumps(X['op'])}]; __tg.render(); }})()"); await pg.wait_for_timeout(1200)
        ke = await pg.evaluate(J("const k=R.querySelector('[data-ock=\"ke\"]'); return k ? k.textContent : null"))
        ok(ke and ke.replace("%", "").strip() == "100", f"RO page clock card: Efficiency {ke}")
        # ---- 2) the end of the shift stops nothing: the shop day ends in 3 s, a running clock keeps running
        await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(), d=new Date(), h=(Date.now()-new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime())/3600e3; const c=S.fmCfg||(S.fmCfg={{}}); c.start=c.start>=0?c.start:7; c.end=h+3/3600; if(!Array.isArray(c.lunch)) c.lunch=[11.5,12.5];
          S.punches.filter(p=>!p.stop && p.by==={json.dumps(me)}).forEach(p=>{{ p.stop=new Date().toISOString(); p.stopReason='Switched job'; }});
          S.punches.push({{id:'run1', roId:{json.dumps(X['ro'])}, opId:__tg.getRO({json.dumps(X['ro'])}).operations[1].id, start:new Date(Date.now()-20*60e3).toISOString(), stop:null, startReason:'Repairing', stopReason:null, notes:'', by:{json.dumps(me)}}}); __tg.render(); return c.end; }})()""")
        wd = await pg.evaluate("new Date().getDay()")
        await pg.wait_for_timeout(6000)
        rp = await pg.evaluate("(()=>{ const p=__tg.STATE().punches.find(x=>x.id==='run1'); return [p.stop, p.stopReason, (document.querySelector('.toast')||{}).textContent||'']; })()")
        sh = await pg.evaluate("(()=>{ const s=__tg.STATE().shifts.find(x=>x.id==='st'); return s ? s.out : 'gone'; })()")
        if wd in (0, 6): print("    (weekend — the shop day has no end to cross; the check is still that nothing stopped)")
        ok(rp[0] is None and sh is None, f"past the shift end the clock and the day clock keep running ({rp[0]}, {sh})")
        ok(wd in (0, 6) or "keeps running" in rp[2], f"it only says so: {rp[2][:90]}")
        # ---- 3) the key tag beside the spot
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO({json.dumps(X['ro'])}); r.location=r.location||'Bay 11'; r.keyTag=''; __tg.render(); try{{ __tg.JC.rerender(); }}catch(e){{}} }})()"); await pg.wait_for_timeout(700)
        sub = await pg.evaluate(J("const s=R.querySelector('.px-ro__sub'); return s ? s.innerText : null"))
        ok(sub and "Add key" in sub, f"truck card: an empty key tag offers Add key ({sub})")
        await pg.evaluate(J("R.querySelector('.px-ro__sub .rif[data-rif-k=keyTag]').click()")); await pg.wait_for_timeout(250)
        await pg.evaluate(J("const i=R.querySelector('.px-ro__sub .rif-in'); i.value='77'; i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));")); await pg.wait_for_timeout(600)
        kt = await pg.evaluate(f"__tg.getRO({json.dumps(X['ro'])}).keyTag")
        sub = await pg.evaluate(J("const s=R.querySelector('.px-ro__sub'); return s ? s.innerText : null"))
        ok(kt == "77" and sub and "Key 77" in sub, f"typed in place: keyTag {kt}, the line reads “{sub}”")
        loc = await pg.evaluate(f"__tg.getRO({json.dumps(X['ro'])}).location")
        ok(sub and sub.index("Key 77") > sub.index(loc), "it sits after the spot")
        act = await pg.evaluate(f"(__tg.auditLog()||[]).slice(-6).map(a=>a.text).join(' | ')")
        ok("Key tag" in act or "key tag" in act.lower(), f"the Activity line: {act[-120:]}")
        await pg.screenshot(path=os.path.join(OUT, "1_truck_card.png"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(500)
        ok(not await pg.evaluate(f"__tg.getRO({json.dumps(X['ro'])}).keyTag"), "Undo takes it back")
        await pg.evaluate(f"(()=>{{ __tg.getRO({json.dumps(X['ro'])}).keyTag='77'; __tg.render(); }})()")
        # the RO list: its Spot column and the pane
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='rolist'; __tg.render(); }})()"); await pg.wait_for_timeout(800)
        row = await pg.evaluate(f"(()=>{{ const r=__tg.getRO({json.dumps(X['ro'])}); const L=[...document.querySelectorAll('[data-pg=rolist] *')].filter(e=>e.children.length===0 && /Key 77/.test(e.textContent)); return L.map(e=>e.textContent).slice(0,3); }})()")
        ok(len(row) >= 1, f"RO list: the spot reads with the key ({row})")
        await pg.screenshot(path=os.path.join(OUT, "2_rolist.png"))
        # the Technician page's list
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(800)
        tr = await pg.evaluate("[...document.querySelectorAll('[data-pg] .tg-list *')].filter(e=>e.children.length===0 && /Key 77/.test(e.textContent)).map(e=>e.textContent).slice(0,2)")
        ok(len(tr) >= 1, f"Technician list: {tr}")
        await pg.screenshot(path=os.path.join(OUT, "3_tech.png"))
        # the New RO import reads Key # / Key tag / Tag #
        for txt, want in [("RO# RO123456\nCustomer: Acme\nKey #42\n", "42"), ("RO# RO123457\nKey tag: B17\n", "B17"), ("RO# RO123458\nTag # 9\n", "9"), ("RO# RO123459\nKey no. 33\n", "33")]:
            got = await pg.evaluate(f"(()=>{{ try{{ return __tg.IMPX.parse({json.dumps(txt)}).f.tag || ''; }}catch(e){{ return 'ERR '+e.message; }} }})()")
            ok(got == want, f"import reads “{txt.strip().splitlines()[-1]}” → {got}")
        ok(not errs, "no page errors: " + " | ".join(errs[:3]))
        await b.close()
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
