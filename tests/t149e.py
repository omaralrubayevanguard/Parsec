# Parsec 14.9 (E) — what the tooltips say: status pills (status · since · why · who) on the RO page, RO list and Technician list,
# who set a status (stamped when it's saved), part statuses, initials (name · role), and the main actions saying why they can't be pressed.
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_e.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots149e"); os.makedirs(OUT, exist_ok=True)
TIP = lambda sel: J(f"const e=R.querySelector({json.dumps(sel)}); return e ? [e.getAttribute('data-tip'), e.hasAttribute('data-tip-keep')] : null")
DTIP = lambda sel: f"(()=>{{ const e=document.querySelector({json.dumps(sel)}); return e ? [e.getAttribute('data-tip'), e.hasAttribute('data-tip-keep'), e.disabled] : null; }})()"
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        P = await pg.evaluate(PREP); rid, oa, ob = P["ro"], P["a"], P["b"]
        st = await pg.evaluate("__tg.staffList().map(s=>[s.id, s.name, s.role])"); fm = [s for s in st if s[2] == "Foreman"][0]
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO({json.dumps(rid)}); r.assignedTech={json.dumps(P['An'])}; const op=r.operations[1]; op.parts=[{{id:'pt9', description:'Turbo actuator', partNumber:'TA-9', qty:'2', status:'Ordered', eta:new Date(Date.now()+2*864e5).toISOString().slice(0,10), sup:'Volvo PDC'}}]; __tg.render(); }})()")
        # ---- the foreman opens the RO page
        await pg.evaluate(SIGN(fm[0])); await pg.wait_for_timeout(300)
        await pg.evaluate(f"(()=>{{ localStorage.removeItem('rop_fold'); const U=__tg.UI(); U.view='ros'; U.selectedRo={json.dumps(rid)}; __tg.render(); }})()"); await pg.wait_for_timeout(1200)
        t = await pg.evaluate(TIP(".px-status--button"))
        ok(t and t[0] and t[1] and t[0].split("|")[0].startswith(("Hold tech", "Working", "Waiting", "Complete")), f"RO page: the RO's status pill explains itself ({t})")
        t = await pg.evaluate(TIP(f".rop-orow[data-op=\"{oa}\"] .rop-st"))
        ok(t and t[1] and "Hold tech" in t[0], f"RO page: the operation's status pill ({t})")
        # change the operation's status from its menu → who = the foreman
        await pg.evaluate(J(f"R.querySelector('.rop-orow[data-op=\"{oa}\"] .rop-st').click()")); await pg.wait_for_timeout(300)
        okc = await pg.evaluate(J("const p=R.querySelector('.rop-stpop'); if(!p) return false; const it=[...p.querySelectorAll('.px-menu__item')].find(x=>/Waiting – Foreman/.test(x.textContent)); if(!it) return false; it.click(); return true;"))
        await pg.wait_for_timeout(500)
        by = await pg.evaluate(f"(()=>{{ const o=__tg.getRO({json.dumps(rid)}).operations.find(x=>x.id==={json.dumps(oa)}); return o.jobStatus && [o.jobStatus.status, o.jobStatus.by]; }})()")
        ok(okc and by and by[0] == "Waiting – Foreman" and by[1] == fm[1], f"a status picked from the menu stores who set it ({by})")
        t = await pg.evaluate(TIP(f".rop-orow[data-op=\"{oa}\"] .rop-st"))
        L = (t[0] if t else "").split("|")
        ok(len(L) == 3 and L[0].startswith("Waiting – Foreman · since ") and L[1] == "Waiting for the foreman" and L[2].startswith("Set by " + first(fm[1]) + " · "), f"…and the pill says status · since · why · who ({L})")
        # a part: on order with an ETA, then received — who set it (Parsec 15: Parts on this RO left the RO page — read it on op 2's Parts tab)
        await pg.evaluate(J("const o=__tg.getRO(" + json.dumps(rid) + ").operations[1]; const L=[...R.querySelectorAll('.rop-orow')]; const row=L.find(x=>x.dataset.op===o.id) || L[1]; row.click();")); await pg.wait_for_timeout(600)
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(), o=__tg.getRO({json.dumps(rid)}).operations[1]; U.ivTab=U.ivTab||{{}}; U.ivTab[o.id]='parts'; __tg.render(); }})()"); await pg.wait_for_timeout(600)
        t = await pg.evaluate(TIP(".px-pstat"))
        ok(t and t[1] and t[0].startswith("Ordered") and "ETA" in t[0] and "Volvo PDC" in t[0] and "× 2" in t[0], f"a part's status: on order · ETA · supplier ({t and t[0]})")
        await pg.evaluate(f"(()=>{{ const p=__tg.getRO({json.dumps(rid)}).operations[1].parts[0]; p.status='Received'; p.bin='B4'; __tg.scheduleSave(true); __tg.render(); }})()"); await pg.wait_for_timeout(500)
        pb = await pg.evaluate(f"(()=>{{ const p=__tg.getRO({json.dumps(rid)}).operations[1].parts[0]; return [p.stBy, !!p.statusChangedAt]; }})()")
        t = await pg.evaluate(TIP(".px-pstat"))
        ok(pb[0] == fm[1] and pb[1] and t and t[0].startswith("Received · since ") and "In hand · bin B4" in t[0] and ("Set by " + first(fm[1])) in t[0], f"…received: who and when are kept ({pb} · {t and t[0]})")
        # the RO status set by an automation reads Set by Parsec; one from before 14.9 doesn't guess
        await pg.evaluate(f"(()=>{{ __tg.setRoStatus({json.dumps(rid)}, 'Waiting – Customer', null); __tg.render(); }})()"); await pg.wait_for_timeout(400)
        rs = await pg.evaluate(f"(()=>{{ const r=__tg.getRO({json.dumps(rid)}); return [r.status.status, r.status.by]; }})()")
        ok(rs[1] == fm[1], f"the RO's status keeps who set it ({rs})")
        # initials: the name and the role
        av = await pg.evaluate(J("const a=R.querySelector('.px-with .px-av'); return a ? a.getAttribute('data-tip') : null"))
        ok(av == P["An"] + " · Technician", f"RO page: “with LM” says the name and the role ({av})")
        await pg.screenshot(path=os.path.join(OUT, "1_ropage.png"))
        # ---- disabled main actions (RO page selection bar): pick both, decline both → Hold and Mark done say why
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO({json.dumps(rid)}); r.operations.forEach(o=>{{ o.declined=true; }}); __tg.render(); }})()"); await pg.wait_for_timeout(500)
        for i in range(2):
            await pg.evaluate(J(f"const c=[...R.querySelectorAll('.rop-orow .rop-cb')]; c[{i}] && c[{i}].click();")); await pg.wait_for_timeout(350)
        sb = await pg.evaluate(J("const bar=R.querySelector('.rop-sb'); const B=bar ? [...bar.querySelectorAll('button[data-v]')] : []; return B.filter(x=>x.disabled).map(x=>[x.dataset.v, x.title]);"))
        dd = dict((x[0], x[1]) for x in (sb or []))
        ok(dd.get("hold", "").startswith("Nothing to hold") and dd.get("done", "").startswith("Nothing to mark"), f"selection bar: Hold and Mark done say why ({sb})")
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO({json.dumps(rid)}); r.operations.forEach(o=>{{ o.declined=false; }}); __tg.render(); }})()"); await pg.wait_for_timeout(300)
        # Transfer… pop: Transfer waits for where it goes
        await pg.evaluate(J("const b=[...R.querySelectorAll('.rop-acts button')].find(x=>/Transfer/.test(x.textContent)); b && b.click();")); await pg.wait_for_timeout(500)
        x = await pg.evaluate(J("const q=s=>R.querySelector(s)||document.querySelector(s); const b=[...R.querySelectorAll('.px-modal button, .px-mod button'), ...document.querySelectorAll('.px-modal button')].find(x=>/Transfer RO/.test(x.textContent)); return b ? [b.getAttribute('data-tip'), b.disabled] : null;"))
        ok(x and x[1] and x[0] == "Pick a technician first", f"Transfer RO is greyed out and says why ({x})")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        # Road test pop: Send waits for who drives
        await pg.evaluate(f"__tg.tgOpenPop('road', {json.dumps(rid)})"); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{ const b=document.querySelector('[data-action=\"tg-rt\"][data-f=\"m\"][data-v=\"send\"]'); b && b.click(); })()"); await pg.wait_for_timeout(300)
        x = await pg.evaluate(DTIP('[data-action="tg-rt-go"][data-v="send"]'))
        ok(x is None or (x[2] and x[0] == "Pick who drives first") or (not x[2] and not x[0]), f"Road test: Send says who's missing when it's greyed out ({x})")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        # Release pop with checks open: Release is greyed out and says how many; Release anyway waits for a reason
        await pg.evaluate(f"__tg.tgOpenPop('rl', {json.dumps(rid)})"); await pg.wait_for_timeout(500)
        x = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('.tg-pop.rl .btn-primary')].find(x=>x.disabled); return b ? b.getAttribute('data-tip') : null; })()")
        ok(x is None or (x.startswith("Not yet — ") and "open|Fix them, or release anyway" in x), f"Release: greyed out with the count ({x})")
        await pg.evaluate("(()=>{ const b=document.querySelector('[data-action=\"tg-rl\"][data-f=\"any\"]'); b && b.click(); })()"); await pg.wait_for_timeout(300)
        x = await pg.evaluate(DTIP('[data-action="tg-rl-go"][data-v="any"]'))
        ok(x is None or (x[2] and x[0] == "Pick a reason first"), f"Release anyway waits for a reason ({x})")
        rel_seen = x is not None
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        # ---- the RO list: status pills and avatars
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='rolist'; U.selectedRo=null; __tg.render(); })()"); await pg.wait_for_timeout(900)
        rl = await pg.evaluate("(()=>{ const L=[...document.querySelectorAll('[data-pg=rolist] .pgst[data-tip]')]; const a=document.querySelector('[data-pg=rolist] .tg-av[data-tip]'); return [L.length, L.filter(x=>x.hasAttribute('data-tip-keep')).length, L.slice(0,2).map(x=>x.getAttribute('data-tip')), a ? a.getAttribute('data-tip') : null]; })()")
        ok(rl[0] >= 5 and rl[1] == rl[0], f"RO list: every status pill has its tip ({rl[0]}): {rl[2]}")
        ok(rl[3] and " · " in rl[3], f"RO list: initials say who ({rl[3]})")
        await pg.screenshot(path=os.path.join(OUT, "2_rolist.png"))
        # ---- the Technician: the waiting lane explains itself; the console's Start says clock in first
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO({json.dumps(rid)}); r.operations.forEach(o=>{{ o.jobStatus={{status:'Waiting – Customer', sub:null, setAt:new Date(Date.now()-50*60e3).toISOString(), hand:true, by:{json.dumps(fm[1])}}}; }}); __tg.render(); }})()")
        await pg.evaluate(SIGN(P["A"])); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        tw = await pg.evaluate("(()=>{ const L=[...document.querySelectorAll('[data-pg=tech] .tch-it.wait b.wt')]; return L.map(x=>[x.getAttribute('data-tip'), x.hasAttribute('data-tip-keep')]).slice(0,3); })()")
        hit = [x for x in tw if x[0] and x[0].startswith("Waiting – Customer · since") and ("Set by " + first(fm[1]) + " · 50 min ago") in x[0]]
        ok(hit and hit[0][1], f"Technician list: the waiting lane's words explain themselves ({tw[:2]})")
        await pg.screenshot(path=os.path.join(OUT, "3_tech.png"))
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='console'; __tg.render(); })()"); await pg.wait_for_timeout(700)
        cs = await pg.evaluate("(()=>{ const b=document.querySelector('[data-a=\"start\"][disabled], [data-a=\"startid\"][disabled]'); return b ? b.getAttribute('data-tip') : 'none'; })()")
        ok(cs in ("none", "Clock in first — you’re off the clock"), f"Console: a greyed-out Start says clock in first ({cs})")
        # ---- the Time Log: the foreman changing someone's time — Save waits for why; Sign with this note waits for the note
        await pg.evaluate(SIGN(fm[0])); await pg.wait_for_timeout(300)
        await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(), d=new Date(); d.setDate(d.getDate()-1); d.setHours(9,0,0,0); const e=new Date(d); e.setHours(10,0,0,0);
          const r=__tg.getRO({json.dumps(rid)}); S.punches.push({{id:'pz', roId:r.id, opId:r.operations[0].id, start:d.toISOString(), stop:e.toISOString(), startReason:'Repairing', stopReason:'Switched job', notes:'x', by:{json.dumps(P['An'])}}});
          const U=__tg.UI(); U.view='timelog'; __tg.render(); const T=__tg.TL.U(); T.who={json.dumps(P['An'])}; T.view='day'; T.day=__tg.localDay(d.toISOString()); T.pop={{type:'edit', pid:'pz'}}; __tg.render(); }})()""")
        await pg.wait_for_timeout(600)
        x = await pg.evaluate(DTIP('[data-pg=timelog] .tg-pop [data-a="psave"]'))
        ok(x and x[2] and x[0] == "Pick why first", f"Time Log: someone else's time — Save says pick why first ({x})")
        await pg.evaluate("(()=>{ const c=document.querySelector('[data-pg=timelog] .tg-pop .tk-why .tg-chip'); c && c.click(); })()"); await pg.wait_for_timeout(300)
        x = await pg.evaluate(DTIP('[data-pg=timelog] .tg-pop [data-a="psave"]'))
        ok(x and not x[2] and not x[0], f"…a reason picked: Save is on, no stale tip ({x})")
        # initials in the Time Log
        tk = await pg.evaluate("(()=>{ const a=document.querySelector('[data-pg=timelog] .tk-av[data-tip]'); return a ? a.getAttribute('data-tip') : null; })()")
        ok(tk and " · " in tk, f"Time Log: initials say who ({tk})")
        ok(not errs, "no page errors: " + " | ".join(errs[:3]))
        await b.close()
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
