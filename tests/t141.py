# Parsec 14.1 — Done asks (story / 0:00 / parts), Start warns on ASIST-Pending, comeback on a returning truck, Hold tech while
# an op is workable, one release list, Send straight from the Next bar, RO details editable on the RO list and Technician panes
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots141"); os.makedirs(OUT, exist_ok=True)
ADMIN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()"
async def view(pg, v, extra=""):
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; {extra} __tg.render(); }})()"); await pg.wait_for_timeout(700)
PICK = """(()=>{ const S=__tg.STATE(); const L=S.ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.filter(o=>!o.declined).length>=2 && __tg.roStatus(r).status!=='Declined' && !/^Complete/.test(__tg.roStatus(r).status));
  const a=L[0], b=L[1], c=L[2]; return { a: a.id, b: b.id, c: c.id }; })()"""
ASK = "(()=>{ const w=document.querySelector('.pgask'); return w ? { head: w.querySelector('.roreo-h b').textContent, sub: w.querySelector('.roreo-h p').textContent, btns: [...w.querySelectorAll('[data-ask]')].map(b=>[b.dataset.ask, b.textContent]) } : null; })()"
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate(ADMIN); await pg.wait_for_timeout(500)
        X = await pg.evaluate(PICK); A, B, C = X["a"], X["b"], X["c"]
        # ---------- 1 · Done with no story and 0:00 clocked asks ----------
        r = await pg.evaluate(f"""(()=>{{ const ro=__tg.getRO('{A}'); const op=ro.operations.find(o=>!o.declined); op.cause=''; op.correction=''; op.work=''; (op.log||[]).length=0; (op.parts||[]).forEach(p=>p.status='Installed');
          __tg.STATE().punches=__tg.STATE().punches.filter(p=>p.opId!==op.id); op.burnt=0; op.jobStatus={{status:'Hold Tech',sub:null,setAt:new Date().toISOString(),hand:true}};
          const g=__tg.v141GapsAsk(op); return {{ g: g.map(x=>x.k), op: op.id }}; }})()"""); await pg.wait_for_timeout(300)
        ask = await pg.evaluate(ASK)
        ok(ask and "finish it anyway" in ask["head"] and "No story" in ask["sub"] and "0:00 clocked" in ask["sub"] and [x[0] for x in ask["btns"]] == ["story", "go"], f"Done with no story · 0:00: the question — Write the story / Finish anyway ({ask})")
        await pg.screenshot(path=os.path.join(OUT, "a1_ask_story.png"))
        await pg.click(".pgask [data-ask=go]"); await pg.wait_for_timeout(600)
        st = await pg.evaluate(f"(()=>{{ const op=__tg.getRO('{A}').operations.find(o=>o.id==='{r['op']}'); return [__tg.autoStatusName(__tg.opStatusX(op)), !document.querySelector('.pgask')]; }})()")
        ok(str(st[0]).startswith("Complete") and st[1], f"Finish anyway: the operation is Complete ({st})")
        # ---------- 2 · parts not installed: mark them installed and finish ----------
        r2 = await pg.evaluate(f"""(()=>{{ const ro=__tg.getRO('{B}'); const op=ro.operations.find(o=>!o.declined && (o.parts||[]).length) || ro.operations.find(o=>!o.declined);
          if(!(op.parts||[]).length) op.parts=[{{ id:'p141', partNumber:'141-1', description:'Test part', qty:'1', status:'Received' }}]; op.parts.forEach(p=>{{ if(p.status==='Installed') p.status='Received'; }}); op.cause='Found it'; op.correction='Fixed it';
          const n=op.parts.filter(p=>p.status!=='Installed').length; __tg.v141GapsAsk(op); return {{ n, op: op.id }}; }})()"""); await pg.wait_for_timeout(300)
        ask = await pg.evaluate(ASK)
        ok(ask and "not installed" in ask["sub"] and ask["btns"][-1][0] == "parts" and "installed and finish" in ask["btns"][-1][1], f"parts not installed: Mark them installed and finish ({ask and ask['btns']})")
        await pg.click(".pgask [data-ask=parts]"); await pg.wait_for_timeout(600)
        st = await pg.evaluate(f"(()=>{{ const op=__tg.getRO('{B}').operations.find(o=>o.id==='{r2['op']}'); return [op.parts.every(p=>p.status==='Installed'), String(__tg.autoStatusName(__tg.opStatusX(op)))]; }})()")
        ok(st[0] and st[1].startswith("Complete"), f"every part Installed, the operation Complete ({st})")
        for _ in range(2):   # the status automation that follows is its own step (as every automation is)
            await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
            if await pg.evaluate(f"(()=>{{ const op=__tg.getRO('{B}').operations.find(o=>o.id==='{r2['op']}'); return op.parts.some(p=>p.status!=='Installed'); }})()"): break
        st = await pg.evaluate(f"(()=>{{ const op=__tg.getRO('{B}').operations.find(o=>o.id==='{r2['op']}'); return [op.parts.some(p=>p.status!=='Installed'), String(__tg.autoStatusName(__tg.opStatusX(op)))]; }})()")
        ok(st[0] and not st[1].startswith("Complete"), f"Undo takes the parts and the status back together ({st})")
        # ---------- 3 · Start on an ASIST-Pending operation warns once ----------
        r3 = await pg.evaluate(f"""(()=>{{ const ro=__tg.getRO('{C}'); const op=ro.operations.find(o=>!o.declined); delete op.appr; op.asistApproval='Pending'; op.jobStatus={{status:'Hold Tech',sub:null,setAt:new Date().toISOString(),hand:true}};
          const S=__tg.STATE(); S.punches.forEach(p=>{{ if(!p.stop){{ p.stop=new Date().toISOString(); p.stopReason='Switched job'; }} }}); __tg.doStartPunch(ro.id, op.id, 'Repairing'); return op.id; }})()"""); await pg.wait_for_timeout(300)
        ask = await pg.evaluate(ASK)
        run0 = await pg.evaluate(f"__tg.STATE().punches.some(p=>!p.stop && p.opId==='{r3}')")
        ok(ask and "isn’t approved yet" in ask["head"] and [x[0] for x in ask["btns"]] == ["wait", "go"] and not run0, f"Start on a Pending op: the question, nothing running yet ({ask and ask['head']})")
        await pg.click(".pgask [data-ask=go]"); await pg.wait_for_timeout(500)
        run1 = await pg.evaluate(f"__tg.STATE().punches.some(p=>!p.stop && p.opId==='{r3}')")
        act = await pg.evaluate("(()=>{ const S=__tg.STATE(); const L=(S.auditLog||S.audit||(S.shop&&S.shop.audit)||[]); return (Array.isArray(L)?L:[]).slice(-3).map(x=>x.text||'').join(' | '); })()")
        ok(run1 and "before its approval" in act, f"Start anyway: the clock runs, Activity has the line ({act[-80:]})")
        await pg.evaluate(f"(()=>{{ const S=__tg.STATE(); S.punches.forEach(p=>{{ if(!p.stop){{ p.stop=new Date().toISOString(); p.stopReason='Switched job'; }} }}); __tg.doStartPunch('{C}', '{r3}', 'Repairing'); }})()"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("!document.querySelector('.pgask')") and await pg.evaluate(f"__tg.STATE().punches.some(p=>!p.stop && p.opId==='{r3}')"), "the second start on that op doesn't ask again")
        await pg.evaluate("(()=>{ const S=__tg.STATE(); S.punches.forEach(p=>{ if(!p.stop){ p.stop=new Date().toISOString(); p.stopReason='Switched job'; } }); __tg.render(); })()")
        # ---------- 5 · the RO reads Hold tech while an op is workable ----------
        st5 = await pg.evaluate(f"""(()=>{{ const ro=__tg.getRO('{C}'); const ops=ro.operations.filter(o=>!o.declined); const a=ops[0], b2=ops[1];
          a.appr={{ s:'ok', by:'Jenna', who:'Customer', how:'Call', at:new Date().toISOString() }}; delete a.asistApproval; a.jobStatus={{status:'Hold Tech',sub:null,setAt:new Date().toISOString(),hand:true}}; (a.parts||[]).forEach(p=>p.status='Received');
          b2.appr=a.appr; if(!(b2.parts||[]).length) b2.parts=[{{ id:'p141b', partNumber:'141-2', description:'Waiting part', qty:'1', status:'Ordered' }}]; b2.parts.forEach(p=>p.status='Ordered'); b2.jobStatus={{status:'Waiting – Parts',sub:null,setAt:new Date().toISOString(),hand:false}};
          const t=__tg.roAutoTarget(ro); return t; }})()""")
        ok(st5 and st5["status"] == "Hold Tech" and "waiting on parts" in (st5["sub"] or ""), f"one op waits on parts, one is workable: Hold tech · 1 op waiting on parts ({st5})")
        html5 = await pg.evaluate("__tg.pgSt('ro','Hold Tech',{sub:'· 1 op waiting on parts'})")
        ok("1 op waiting on parts" in html5 and "Hold tech" in html5, "pgSt shows the sub")
        # ---------- 6 + 7 · one release list ----------
        rel = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{A}'); const L=__tg.tgRelChecks(ro); return L.map(c=>c.k); }})()")
        ok("story" in rel and "hours" in rel and "qc" in rel, f"Release checks have Story on every operation and Hours ({rel})")
        await view(pg, "triage", f"U.tgSel='{A}'; U.tgView='desk';")
        await pg.evaluate(f"__tg.tgOpenPop('release', '{A}')"); await pg.wait_for_timeout(500)
        pop = await pg.evaluate("(()=>{ const P=document.querySelector('.tg-pop'); if(!P) return null; const walk=[...P.querySelectorAll('.v141-walk .tg-chip')]; const hand=[...P.querySelectorAll('.tg-r:not(.v141-walk) .tg-chip.tick')].map(x=>x.textContent); return { walk: walk.length, hand, txt: P.textContent }; })()")
        ok(pop and pop["walk"] >= 6 and not any("Keys back" in h or "Truck clean" in h for h in pop["hand"]) and "Hours" in pop["txt"], f"Release shows the walk-around inline; Keys back / Truck clean aren't asked twice ({pop and (pop['walk'], pop['hand'])})")
        await pg.screenshot(path=os.path.join(OUT, "a2_release.png"))
        await pg.click(".tg-pop .v141-walk .tg-chip:first-child"); await pg.wait_for_timeout(400)
        tk = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{A}'); return [__tg.trxQc(ro).n, document.querySelectorAll('.tg-pop .v141-walk .tg-chip.on').length]; }})()")
        ok(tk[0] == 1 and tk[1] == 1, f"a tick in Release is the same walk-around tick ({tk})")
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.tgPop=null; __tg.render(); })()")
        hrs = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{A}'); __tg.STATE().punches=__tg.STATE().punches.filter(p=>p.roId!==ro.id); ro.operations.forEach(o=>{{ o.burnt=0; }}); const h=__tg.v141Hours(ro); return h; }})()")
        ok(hrs["bad"] and hrs["sold"] > 0, f"0 h clocked of {hrs['sold']} h sold is flagged ({hrs})")
        # Send straight from the Next bar (RO page)
        await view(pg, "ros", f"U.selectedRo='{B}';"); await pg.wait_for_timeout(600)
        sug = await pg.evaluate(J("const b=R.querySelector('.rt2-sug [data-action=rt-open]'); return b ? { to: b.dataset.to, t: b.textContent } : null"))
        if sug:
            await pg.evaluate(J("R.querySelector('.rt2-sug [data-action=rt-open]').click()")); await pg.wait_for_timeout(600)
            sent = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{B}'); return [ro.route && ro.route.state, ro.route && ro.route.to, !!document.querySelector('.modal'), (document.querySelector('.toast')||{{}}).textContent||'']; }})()")
            ok(sent[0] == "pending" and sent[1] == sug["to"] and not sent[2] and "sent to" in sent[3], f"Send to … from the Next bar sends straight away ({sent})")
        else:
            print("skip the Next-bar send: no suggestion on this RO")
        # ---------- 8 · RO details editable on the RO list pane ----------
        await view(pg, "rolist", f"__tg.RL && 0;")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='rolist'; __tg.render(); }})()"); await pg.wait_for_timeout(500)
        await pg.click("[data-pg=rolist] .rq-rows .rq-row .rq-k-cust"); await pg.wait_for_timeout(700)
        det = await pg.evaluate("(()=>{ const s=document.querySelector('.rq-peek .rod'); return s ? { groups: [...s.querySelectorAll('.rod-gh b')].map(x=>x.textContent), ed: s.classList.contains('ed'), rows: s.querySelectorAll('.rod-r').length, id: s.getAttribute('data-rod-ro') } : null; })()")
        B0 = B; B = det["id"] if det else B
        ok(det and det["ed"] and det["groups"] == ["Vehicle", "Customer", "People", "Schedule", "Case"] and det["rows"] > 10, f"RO list pane: Vehicle · Customer · People · Schedule · Case, editable ({det})")
        await pg.click(".rq-peek .rod .rod-r[data-rod-k=mileage]"); await pg.wait_for_timeout(200)
        await pg.keyboard.type("512345"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(600)
        mv = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{B}'); const S=__tg.STATE(); const L=(S.auditLog||S.audit||(S.shop&&S.shop.audit)||[]); return [ro.mileage, (Array.isArray(L)?L:[]).slice(-1)[0]?.text||'', document.querySelector('.rq-peek .rod .rod-r[data-rod-k=mileage] b').textContent]; }})()")
        ok(mv[0] == "512345" and "Mileage" in mv[1] and "512,345 mi" in mv[2], f"Mileage typed in the pane: saved, shown, in Activity ({mv})")
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(f"__tg.getRO('{B}').mileage !== '512345'"), "Undo takes it back")
        await pg.click(".rq-peek .rod .rod-r[data-rod-k=vin]"); await pg.wait_for_timeout(200)
        await pg.keyboard.press("Control+A"); await pg.keyboard.type("4v4nc9eh7ln758560"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate(f"__tg.getRO('{B}').vin") == "4V4NC9EH7LN758560", "the VIN is upper-cased on the way in")
        await pg.screenshot(path=os.path.join(OUT, "a3_rolist_details.png"))
        # the same on the Technician page; read-only for someone who can't open the RO page
        B = B0; tid = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{B}'); const t=__tg.staffList().find(s=>s.role==='Technician'); ro.assignedTech=t.name; return t.id; }})()")
        await view(pg, "tech", f"try{{ __tg.TU().ro='{B}'; }}catch(e){{}}")
        td = await pg.evaluate("(()=>{ const h=document.querySelector('[data-pg=tech] .jc-host'), R=h && h.shadowRoot; return R ? { ed: R.querySelectorAll('.px-prop.is-edit').length, g: R.querySelectorAll('.px-pg').length } : null; })()")   # Parsec 14.3: the RO page's own details, mounted
        ok(td and td["g"] >= 3 and td["ed"] > 0, f"Technician page: the same details ({td})")
        await pg.evaluate(f"(()=>{{ __tg.permSet(__tg.staffList().find(s=>s.id==='{tid}'), 'pages', 'ros', false); localStorage.setItem('tec_viewas', '{tid}'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='tech'; __tg.render(); }})()"); await pg.wait_for_timeout(700)
        td2 = await pg.evaluate("(()=>{ const h=document.querySelector('[data-pg=tech] .jc-host'), R=h && h.shadowRoot; return R ? R.querySelectorAll('.px-prop.is-edit').length > 0 : null; })()")
        ok(td2 is False, f"without the Repair Orders page, the details read only ({td2})")
        await pg.evaluate(ADMIN); await pg.wait_for_timeout(300)
        # ---------- 4 · a returning truck: reopen as a comeback ----------
        cb = await pg.evaluate("""(()=>{ const S=__tg.STATE(); const old=S.ros.find(r=>!r.shop && r.id!=='shop' && r.dateClosed && __tg.roStatus(r).status==='Complete – Released' && r.vin);
          old.dateClosed=new Date(Date.now()-12*864e5).toISOString(); const n=__tg.addRO({ roNumber:'RO-141141', customerName: old.customerName, caseNumber:'' }); n.vin=old.vin; n.unitNumber=old.unitNumber;
          n.operations.push({ id:'op141', complaint:'Same leak again', cause:'', correction:'', quoted:1.5, declined:false, parts:[], burnt:0, work:'', jobType:'OP' });
          const prior=__tg.v141PriorRo(n); __tg.v141Comeback(n); return { prior: prior && prior.id, old: old.id, n: n.id, oldNo: old.roNumber }; })()"""); await pg.wait_for_timeout(300)
        ask = await pg.evaluate(ASK)
        ok(cb["prior"] == cb["old"] and ask and "was here" in ask["head"] and [x[0] for x in ask["btns"]] == ["new", "reopen"], f"a VIN released 12 days ago: Reopen as a comeback / Open a new RO anyway ({ask and ask['head']})")
        await pg.click(".pgask [data-ask=reopen]"); await pg.wait_for_timeout(700)
        re_ = await pg.evaluate(f"(()=>{{ const S=__tg.STATE(); const old=__tg.getRO('{cb['old']}'); return [!S.ros.some(r=>r.id==='{cb['n']}'), old.dateClosed, __tg.roStatus(old).status, old.operations.filter(o=>o.jobType==='COMEBACK').length, !!old.comeback, __tg.UI().selectedRo===old.id || __tg.UI().view]; }})()")
        ok(re_[0] and not re_[1] and re_[2] == "Hold Tech" and re_[3] >= 1 and re_[4], f"the old RO is open again with a COMEBACK operation, the new one is gone ({re_})")
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(f"(()=>{{ const S=__tg.STATE(); return S.ros.some(r=>r.id==='{cb['n']}') && !!__tg.getRO('{cb['old']}').dateClosed; }})()"), "Undo puts it back")
        ok(not errs, f"no console errors: {errs[:3]}")
        # ---------- phone ----------
        await pg.set_viewport_size({"width": 390, "height": 844}); await pg.wait_for_timeout(500)
        await view(pg, "rolist"); await pg.evaluate(f"document.querySelector('[data-pg=rolist] .rq-row[data-id=\"{B}\"], [data-pg=rolist] .rq-card[data-id=\"{B}\"]')?.click()"); await pg.wait_for_timeout(700)
        ph = await pg.evaluate("!!document.querySelector('.rod')")
        print("phone pane has details:", ph)
        ok(not errs, f"phone: no console errors: {errs[:3]}")
        await b.close()
    print("FAILS:", len(FAILS), FAILS)
asyncio.run(main())
