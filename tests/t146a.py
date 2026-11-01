# Parsec 14.6 (A) — Waiting – Sublet below Waiting – Parts everywhere; Copy notes on the RO page's Time tab
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots146a"); os.makedirs(OUT, exist_ok=True)
SUB, PAR = "Waiting – Sublet", "Waiting – Parts"
OPEN = """(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); const S=__tg.STATE(), now=Date.now();
  S.punches.forEach(p=>{ if(!p.stop){ p.stop=new Date(Math.max(+new Date(p.start)+60000, now-120000)).toISOString(); p.stopReason='Switched job'; } });
  const r=S.ros.find(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length>=2);
  r.operations.forEach(o=>{ o.declined=false; o.jobStatus={status:'Hold Tech', setAt:new Date(now-1000).toISOString(), hand:true}; (o.parts||[]).forEach(x=>{ x.status='Received'; }); });
  const a=r.operations[0], b=r.operations[1]; S.punches=S.punches.filter(p=>p.opId!==a.id && p.opId!==b.id);
  const T=(m)=>new Date(now-m*60000).toISOString(), by=r.assignedTech||'Mike';
  [[300,280,'Checked codes, found a bad NOx sensor'],[270,250,'  '],[240,200,'Replaced the sensor.\\nCleared codes'],[190,170,'Checked codes, found a bad NOx sensor'],[160,150,'Road tested, no codes!']].forEach((x,i)=>S.punches.push({ id:'t146p'+i, roId:r.id, opId:a.id, start:T(x[0]), stop:T(x[1]), startReason:'Repairing', stopReason:'Switched job', notes:x[2], by }));
  const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; U.ivTab=U.ivTab||{}; U.ivTab[a.id]='time'; U.ivTab[b.id]='time'; __tg.render(); return { ro:r.id, a:a.id, b:b.id }; })()"""
async def open_op(pg, op):
    on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); return r ? r.classList.contains('is-on') : null"))
    if not on: await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t'); if(r) r.click()")); await pg.wait_for_timeout(600)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        X = await pg.evaluate(OPEN); await pg.wait_for_timeout(1200)
        # the status look and the lists
        L = await pg.evaluate(f"""(()=>{{ const o=__tg.pgStOf('ro','{SUB}'), P=__tg.PX_STATUS(); const ix=(a,k)=>a.indexOf(k);
          const jk=P.job.map(x=>x.k), rk=P.ro.map(x=>x.k);
          return {{ tone:o.tone, ic:o.ic, label:o.label, job: ix(jk,'{SUB}')-ix(jk,'{PAR}'), ro: ix(rk,'{SUB}')-ix(rk,'{PAR}') }}; }})()""")
        ok(L["tone"] == "wait" and L["ic"] == "out" and L["label"] == SUB, f"Waiting – Sublet has its own look: amber, the sent-out icon ({L})")
        src = open(os.path.join(H, PAGE), encoding="utf-8").read()
        SL = ['var STOP_REASONS_EXPLICIT = ["Waiting – Parts","Waiting – Sublet"', 'var AUTO_WAITS = ["Waiting – Parts","Waiting – Sublet"', '{ status:"Waiting – Parts",       subs:["Not Ordered","Ordered","Backordered","Received"] },\n  { status:"Waiting – Sublet"',
              "'Waiting \\u2013 Parts', 'Waiting \\u2013 Sublet'", "\"Waiting – Sublet\":       stLook(", "'Waiting – Parts': 'parts', 'Waiting – Sublet': 'sublet'", "['Waiting – Sublet', (wr ? ropFirst(wr)", "['Waiting – Sublet', (wr ? PG.first(wr)", "['Waiting – Sublet', 'Sublet'"]
        miss = [x[:40] for x in SL if x not in src]
        ok(L["job"] == 1 and L["ro"] == 1 and not miss, f"…and sits right below Waiting – Parts in the status lists, stop reasons, RO status options, automations, job names, the RO list and every hold menu (missing: {miss})")
        # the RO page: the operation status menu
        await open_op(pg, X["a"])
        await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{X['a']}\"] .rop-st').click()")); await pg.wait_for_timeout(300)
        items = await pg.evaluate(J("return [...R.querySelectorAll('.rop-stpop .px-menu__item')].map(x=>x.textContent.trim())"))
        ip = [i for i, t in enumerate(items) if "Waiting – Parts" in t]; isb = [i for i, t in enumerate(items) if "Waiting – Sublet" in t]
        ok(ip and isb and isb[0] == ip[0] + 1, f"the RO page's operation status menu lists Waiting – Sublet right below Waiting – Parts ({items})")
        await pg.screenshot(path=os.path.join(OUT, "a1_menu.png"))
        await pg.evaluate(J("const b=[...R.querySelectorAll('.rop-stpop .px-menu__item')].find(x=>/Sublet/.test(x.textContent)); b.click()")); await pg.wait_for_timeout(600)
        st = await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{X['ro']}'), o=r.operations.find(o=>o.id==='{X['a']}'); return [__tg.autoStatusName(__tg.opStatusX(o)), __tg.roAutoTarget(r)]; }})()")
        pill = await pg.evaluate(J(f"return R.querySelector('.px-row[data-op=\"{X['a']}\"] .rop-st').textContent.trim()"))
        ok(st[0] == SUB and "Sublet" in pill, f"picking it puts the operation on Waiting – Sublet ({st[0]}, pill '{pill}')")
        ok(st[1] and st[1]["status"] == "Hold Tech" and "sublet" in (st[1].get("sub") or ""), f"with another operation still workable, the RO stays Hold Tech · '1 op out at the sublet' ({st[1]})")
        st2 = await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{X['ro']}'); r.operations.forEach(o=>{{ o.jobStatus={{status:'{SUB}', setAt:new Date().toISOString(), hand:true}}; }}); return [__tg.roAutoTarget(r), __tg.opStatusX(r.operations[1])]; }})()")
        ok(st2[0] and st2[0]["status"] == SUB, f"with every operation out at the sublet, the RO adds up to Waiting – Sublet ({st2[0]})")
        wk = await pg.evaluate(f"(()=>__tg.v141Workable(__tg.getRO('{X['ro']}').operations).length)()")
        ok(wk == 0, "an operation out at the sublet isn't work the tech can do (like a parts hold)")
        # the RO list: its own group and look
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{X['ro']}'); r.status={{status:'{SUB}', sub:null, setAt:new Date().toISOString()}}; const U=__tg.UI(); U.view='rolist'; __tg.render(); }})()"); await pg.wait_for_timeout(800)
        rl = await pg.evaluate(f"(()=>{{ const t=document.body.innerText; return [t.includes('{SUB}'), !!document.querySelector('.pgst[data-t], .pgst')]; }})()")
        ok(rl[0], f"the RO list shows it ({rl})")
        await pg.screenshot(path=os.path.join(OUT, "a2_rolist.png"))
        # Copy notes on the Time tab
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{X['ro']}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        await open_op(pg, X["a"])
        await pg.evaluate("(()=>{ window.__cp=null; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t => { window.__cp = t; return Promise.resolve(); } } }); })()")
        cb = await pg.evaluate(J(f"const b=R.querySelector('.rop-cpn'); return b ? [b.disabled, b.title, b.getAttribute('aria-label')] : null"))
        ok(cb and not cb[0] and "3 work notes" in cb[1], f"the Time tab has Copy notes beside Add time entry ({cb})")
        await pg.screenshot(path=os.path.join(OUT, "a3_time_tab.png"))
        await pg.evaluate(J("R.querySelector('.rop-cpn').click()")); await pg.wait_for_timeout(400)
        cp = await pg.evaluate("window.__cp")
        want = "Checked codes, found a bad NOx sensor. Replaced the sensor. Cleared codes. Road tested, no codes!"
        ok(cp == want, f"it copies the notes oldest first as one paragraph — trimmed, no blanks, no repeats, each ending in a period ({cp!r})")
        tst = await pg.evaluate(J("return (document.body.innerText + ' ' + R.textContent)"))
        ok("Copied 3 notes" in tst, "a toast says what was copied")
        # no notes → disabled
        await pg.evaluate(f"(()=>{{ const S=__tg.STATE(); S.punches.forEach(p=>{{ if(p.opId==='{X['a']}') p.notes=''; }}); S.savedAt=new Date().toISOString(); __tg.render(); }})()"); await pg.wait_for_timeout(700)
        await open_op(pg, X["a"])
        cb2 = await pg.evaluate(J("const b=R.querySelector('.rop-cpn'); return b ? [b.disabled, b.title] : null"))
        ok(cb2 and cb2[0] and "No work notes" in cb2[1], f"with no work notes it's greyed out and says why ({cb2})")
        ok(not errs, f"no page errors ({errs[:3]})")
        await b.close()
    print("FAILS", len(FAILS))
asyncio.run(main())
