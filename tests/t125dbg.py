# Parsec 12.5 — the clock card round 2: lap marks, focus mode, similar jobs, usual pace, fix the start, note nudge,
# parts on this job, next up, done badge, lunch and end of day (the clock pauses / starts / stops itself)
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots125"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
def J(js): return "(()=>{ const R=" + SR + "; " + js + " })()"
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
# op 1: quoted 2.5 h, three closed punches (0.9 h), a live one 50 min old (no note); op 2 has a punch that ended 2 min before
# the live one started; parts: one in hand, one ordered for tomorrow; three finished jobs with the same complaint (similar jobs
# and the tech's usual pace: 6 h quoted in 5.4 h → 111%)
PREP = """((who)=>{ const S=__tg.STATE(); const L=S.ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length>=2 && (!who || r.assignedTech===who));
  L.sort((a,b)=>b.operations.length-a.operations.length); const r=L[0], by=who||'Marcus Lee';
  S.punches.filter(p=>!p.stop).forEach(p=>{ p.stop=new Date().toISOString(); p.stopReason='Switched job'; p.burntCredited=true; });
  const op=r.operations[0], op2=r.operations[1]; op.jobStatus={status:'Hold Tech', setAt:new Date(Date.now()-86400e3).toISOString(), hand:true}; op.declined=false; op.quoted='2.5';
  op2.declined=false; op2.quoted='1'; op2.jobStatus={status:'Hold Tech', setAt:new Date(Date.now()-86400e3).toISOString(), hand:true}; (op2.parts||[]).forEach(x=>{ x.status='Installed'; });
  const tm=new Date(Date.now()+86400e3), eta=tm.getFullYear()+'-'+String(tm.getMonth()+1).padStart(2,'0')+'-'+String(tm.getDate()).padStart(2,'0');
  op.parts=[{id:'pt_a', description:'NOx sensor', partNumber:'22827993', qty:1, status:'Received', eta:''}, {id:'pt_b', description:'Sensor gasket', partNumber:'21479638', qty:1, status:'Ordered', eta:eta}];
  S.punches=S.punches.filter(p=>p.opId!==op.id && p.opId!==op2.id);
  const now=Date.now(), t=ms=>new Date(now-ms).toISOString();
  S.punches.push({id:'pn_a', roId:r.id, opId:op.id, start:t(5*3600e3), stop:t(5*3600e3-1080e3), startReason:'Diagnosing', stopReason:'Waiting – Parts', notes:'', by, burntCredited:true});
  S.punches.push({id:'pn_b', roId:r.id, opId:op.id, start:t(4*3600e3), stop:t(4*3600e3-1800e3), startReason:'Repairing', stopReason:'Lunch', notes:'', by, burntCredited:true});
  S.punches.push({id:'pn_c', roId:r.id, opId:op.id, start:t(3*3600e3), stop:t(3*3600e3-360e3), startReason:'Testing', stopReason:'Switched job', notes:'', by, burntCredited:true});
  S.punches.push({id:'pn_p', roId:r.id, opId:op2.id, start:t(3000e3+1200e3), stop:t(3000e3+120e3), startReason:'Repairing', stopReason:'Switched job', notes:'', by, burntCredited:true});
  S.punches.push({id:'pn_live', roId:r.id, opId:op.id, start:t(3000e3), stop:null, startReason:'Repairing', stopReason:null, notes:'', by});
  op.burnt=0.9; delete op.burntAdj; op2.burnt=0.3; delete op2.burntAdj;
  const others=S.ros.filter(x=>x.id!==r.id && !x.shop && x.id!=='shop').slice(0,3);
  others.forEach((x,i)=>{ const id='op_sim'+i, b0=[1.6,1.8,2.0][i]; x.operations.push({id, complaint:op.complaint, quoted:'2', burnt:b0, jobStatus:{status:'Complete', setAt:t(86400e3), hand:true}, parts:[], log:[{id:'lg'+i, at:t(86400e3), kind:'fix', text:'Replaced the sensor.'}]});
    S.punches.push({id:'pn_s'+i, roId:x.id, opId:id, start:t(2*86400e3+i*7200e3), stop:t(2*86400e3+i*7200e3-b0*3600e3), startReason:'Repairing', stopReason:'Complete', notes:'[0:10] Done.', by, burntCredited:true}); });
  __tg.render(); return [r.id, op.id, op2.id]; })"""
SIGN = """(()=>{ const T=__tg.staffList().filter(s=>s.role==='Technician'); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name && !r.dateClosed && r.operations.length>=2).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.CX.U().skipMorning = __tg.todayStr(); __tg.render(); return T[0].name; })()"""
async def hold(pg, sel_js, ms):
    r = await pg.evaluate(sel_js)
    await pg.mouse.move(r[0], r[1]); await pg.mouse.down(); await pg.wait_for_timeout(ms); await pg.mouse.up(); await pg.wait_for_timeout(400)
async def shot(pg, js_rect, name, pad=10, extra=0):
    el = await pg.evaluate(js_rect)
    if el and el[2] > 0: await pg.screenshot(path=os.path.join(OUT, name), clip={"x": max(0, el[0] - pad), "y": max(0, el[1] - pad), "width": el[2] + 2 * pad, "height": el[3] + 2 * pad + extra})
async def ro_page(p):
    print("— the RO page")
    b, pg, errs = await setup(p)
    rid, op, op2 = await pg.evaluate(PREP + "('')")
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
    on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); return r ? r.classList.contains('is-on') : null"))
    if not on: await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t').click()")); await pg.wait_for_timeout(700)
    C = f"R.querySelector('.ock[data-op=\"{op}\"]:not(.ock-fxp)')"
    RECT = J(f"const r={C}.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]")
    await pg.wait_for_timeout(1200)
    info = await pg.evaluate(J(f"""const c={C}; if(!c) return null; const f=k=>(c.querySelector('[data-f='+k+']')||{{}}).textContent||'';
      return {{ band: c.querySelector('.ock-band').style.display !== 'none', bu: c.querySelector('.ock-bu').style.display !== 'none', up: c.querySelector('.ock-up').style.display !== 'none',
        fband: f('band'), fup: f('up'), fpace: f('pace'), flunch: f('lunch'), parts: c.querySelector('.ock-pts').textContent, nudge: (c.querySelector('.ock-nudge')||{{}}).textContent||'',
        tools: [...c.querySelectorAll('.ock-tl')].map(x=>x.dataset.ock), pen: !!c.querySelector('.ock-lbl [data-ock=pen]'), note: c.querySelector('.ock-note').textContent }}"""))
    print("   ", info)
    ok(info and info["band"] and info["bu"] and "Similar jobs" in info["fband"], "similar jobs: the band and its line — " + (info or {}).get("fband", ""))
    ok(info and info["up"] and "usual" in info["fup"] and "111%" in info["fup"], "usual pace: the tick and its line — " + (info or {}).get("fup", ""))
    ok(info and "Quoted runs out about" in info["fpace"], "when quoted runs out still there")
    ok(info and "in hand" in info["parts"] and "ETA tomorrow" in info["parts"], "parts on this job: in hand and an ETA — " + (info or {}).get("parts", ""))
    ok(info and "No note for 50 min" in info["nudge"], "note nudge after 45 min with no note — " + (info or {}).get("nudge", ""))
    ok(info and info["tools"] == ["focus", "lap"] and info["pen"], "focus and split tools, the pencil by 'since'")
    print("    lunch fact:", info and info["flunch"])
    await shot(pg, RECT, "a1_ro_card.png")
    # note nudge → a note on this punch
    await pg.evaluate(J(f"{C}.querySelector('.ock-nudge').click()")); await pg.wait_for_timeout(300)
    ok(await pg.evaluate(J("const a=R.activeElement; return !!a && a.matches('[data-ock-in]')")), "the note box opens with the cursor in it")
    await pg.keyboard.type("checked the sensor harness"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
    nt = await pg.evaluate("__tg.STATE().punches.find(p=>p.id==='pn_live').notes")
    nn = await pg.evaluate(J(f"const c={C}; return [!!c.querySelector('.ock-nudge'), c.querySelector('.ock-note').textContent]"))
    ok("Checked the sensor harness" in nt and not nn[0] and "Last note" in nn[1], f"the note lands on the punch, the nudge goes ({nt!r} | {nn[1]})")
    # a split
    await pg.evaluate(J(f"{C}.querySelector('[data-ock=lap]').click()")); await pg.wait_for_timeout(500)
    sp = await pg.evaluate("(()=>{ const p=__tg.STATE().punches.find(p=>p.id==='pn_live'); return [ (p.splits||[]).length, p.notes ]; })()")
    laps = await pg.evaluate(J(f"return {C}.querySelector('.ock-laps').textContent"))
    ok(sp[0] == 1 and "Split 1 · 0:5" in sp[1], f"a split is saved as a time-stamped note ({sp[1].splitlines()[-1] if sp[1] else ''})")
    ok("Split 1" in laps and "Split 2 ·" in laps, f"the splits row: {laps}")
    # fix the start: back 8 min trims op 2's punch
    await pg.evaluate(J(f"{C}.querySelector('[data-ock=pen]').click()")); await pg.wait_for_timeout(300)
    mx = await pg.evaluate(J(f"const r={C}.querySelector('[data-ock-fr]'); return r ? +r.max : null"))
    ok(mx == 19, f"fix the start: up to 19 min (the punch before started 20 min earlier) — {mx}")
    t0 = await pg.evaluate(J(f"return {C}.querySelector('.ock-big').dataset.t"))
    await pg.evaluate(J(f"const r={C}.querySelector('[data-ock-fr]'); r.value='8'; r.dispatchEvent(new Event('input',{{bubbles:true,composed:true}}))")); await pg.wait_for_timeout(300)
    fx = await pg.evaluate(J(f"const c={C}; return [c.querySelector('.ock-big').dataset.t, c.querySelector('.ock-fix small').textContent, c.querySelector('.ock-lbl').textContent]"))
    print("    fix preview:", t0, fx)
    ok(fx[0] > t0 and "Trims the" in fx[1], "the preview: the time grows, the punch before gets trimmed")
    await shot(pg, RECT, "a2_ro_fix.png")
    await pg.evaluate(J(f"{C}.querySelector('[data-ock=fs]').click()")); await pg.wait_for_timeout(500)
    fs = await pg.evaluate("(()=>{ const S=__tg.STATE(), L=S.punches.find(p=>p.id==='pn_live'), P=S.punches.find(p=>p.id==='pn_p'); return [ (Date.now()-new Date(L.start))/60000, new Date(L.start).getTime()===new Date(P.stop).getTime(), L.notes.includes('Start moved back 8 min') ]; })()")
    ok(57 < fs[0] < 60 and fs[1] and fs[2], f"saved: started 8 min earlier, the punch before ends there, a note says so ({fs})")
    # focus mode
    await pg.evaluate(J(f"{C}.querySelector('[data-ock=focus]').click()")); await pg.wait_for_timeout(800)
    fo = await pg.evaluate(J("const w=R.querySelector('.ock-fx'); if(!w) return null; const p=w.querySelector('.ock-fxp'); const r=p.getBoundingClientRect(); return { go: w.classList.contains('go'), big: p.querySelector('.ock-big').dataset.t, w: Math.round(r.width), fs: getComputedStyle(p.querySelector('.ock-big')).fontSize, title: p.querySelector('.ock-fxt').textContent, lbl: p.querySelector('.ock-lbl').textContent }"))
    print("    focus:", fo)
    ok(fo and fo["go"] and fo["w"] > 800 and float(fo["fs"][:-2]) > 100, "focus mode: the big view opens")
    await pg.screenshot(path=os.path.join(OUT, "a3_focus.png"))
    t1 = await pg.evaluate(J("return R.querySelector('.ock-fxp .ock-big').dataset.t")); await pg.wait_for_timeout(1500)
    t2 = await pg.evaluate(J("return R.querySelector('.ock-fxp .ock-big').dataset.t"))
    ok(t2 != t1, f"the big view ticks ({t1} → {t2})")
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(700)
    ok(await pg.evaluate(J("return !R.querySelector('.ock-fx')")), "Esc shrinks it back")
    await pg.evaluate(J(f"{C}.querySelector('[data-ock=focus]').click()")); await pg.wait_for_timeout(800)
    GOF = J("const r=R.querySelector('.ock-fxp [data-ock=go]').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]")
    await pg.evaluate("window.__ev=[]; ['pointerdown','pointerup','pointermove','pointercancel','lostpointercapture','gotpointercapture','click'].forEach(k=>document.addEventListener(k,e=>window.__ev.push(k+':'+Date.now()%100000+':'+e.clientX+','+e.clientY),true))")
    print('    GOF', await pg.evaluate(GOF), await pg.evaluate(J("const g=R.querySelector('.ock-fxp [data-ock=go]'); const r=g.getBoundingClientRect(); return [r.x,r.y,r.width,r.height, g.className]")))
    await pg.evaluate("(()=>{ const cb=__tg.OCK_CB.jc, s0=cb.stop; cb.stop=function(){ window.__ev.push('STOP:'+Date.now()%100000); try{ return s0.apply(this, arguments); }catch(e){ window.__ev.push('ERR:'+e.message); throw e; } }; const st0=window.setTimeout; window.setTimeout=function(f,ms){ if(ms===700){ window.__ev.push('T700:'+Date.now()%100000); const g=f; f=function(){ window.__ev.push('FIRE:'+Date.now()%100000+':'+JSON.stringify(Object.values(__tg.OCK_ST).map(x=>x.holding))); return g.apply(this, arguments); }; } return st0.call(window, f, ms); }; })()")
    await hold(pg, GOF, 900); await pg.wait_for_timeout(300)
    print('    events', await pg.evaluate('window.__ev'))
    fr = await pg.evaluate(J("const p=R.querySelector('.ock-fxp'); return p ? [p.dataset.mode, p.querySelectorAll('.ock-r').length] : null"))
    ok(await pg.evaluate("!__tg.STATE().punches.some(p=>!p.stop)") and fr and fr[0] != "run" and fr[1] > 5, f"hold to stop in the big view, its reasons there too ({fr})")
    await pg.screenshot(path=os.path.join(OUT, "a4_focus_reasons.png"))
    await pg.evaluate(J("[...R.querySelectorAll('.ock-fxp .ock-r')].find(b=>b.textContent==='Waiting – Parts').click()")); await pg.wait_for_timeout(400)
    await pg.evaluate(J("const s=R.querySelector('.ock-fxs'); s && s.click()")); await pg.wait_for_timeout(700)
    ok(await pg.evaluate(J("return !R.querySelector('.ock-fx')")), "a tap outside shrinks it back")
    # the last part lands: All parts in, Start shimmers
    await pg.evaluate(f"(()=>{{ const op=__tg.getRO('{rid}').operations.find(o=>o.id==='{op}'); op.parts[1].status='Received'; __tg.JC.rerender(); }})()"); await pg.wait_for_timeout(500)
    pa = await pg.evaluate(J(f"const c={C}; return [c.querySelector('.ock-pts').textContent, !!c.querySelector('.ock-pb.shim')]"))
    ok("All parts in" in pa[0] and pa[1], f"all parts in: the chip, and Start shimmers ({pa})")
    await shot(pg, RECT, "a5_ro_allin_next.png")
    # next up → start op 2
    nx = await pg.evaluate(J(f"const n={C}.querySelector('.ock-next'); return n ? n.textContent : ''"))
    ok("Next:" in nx and "Op 2" in nx, f"next up slides in after the stop: {nx}")
    await pg.evaluate(J(f"{C}.querySelector('[data-ock=nxs]').click()")); await pg.wait_for_timeout(700)
    await pg.keyboard.press("Escape")
    run2 = await pg.evaluate(f"__tg.STATE().punches.some(p=>!p.stop && p.opId==='{op2}')")
    ok(run2, "its Start starts op 2")
    # complete op 2 under quoted: the done badge
    C2 = f"R.querySelector('.ock[data-op=\"{op2}\"]:not(.ock-fxp)')"
    await pg.wait_for_timeout(300)
    await pg.evaluate(J(f"{C2}.querySelector('[data-ock=go]').focus()")); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
    await pg.evaluate(J(f"[...{C2}.querySelectorAll('.ock-rsn .ock-r')].find(b=>b.textContent==='Complete').click()")); await pg.wait_for_timeout(500)
    dn = await pg.evaluate(J(f"const c={C2}; const d=c && c.querySelector('.ock-done'); return d ? [d.textContent, d.className, d.querySelectorAll('.ock-burst i').length, c.className] : null"))
    ok(dn and "Done in" in dn[0] and "%" in dn[0] and "pop" in dn[1] and dn[2] == 16 and "st-done" in dn[3], f"done badge pops ({dn})")
    await pg.wait_for_timeout(250)
    R2 = J(f"const r={C2}.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]")
    await shot(pg, R2, "a6_ro_done_badge.png")
    await pg.wait_for_timeout(1700); await pg.evaluate("__tg.JC.rerender()"); await pg.wait_for_timeout(300)
    dn2 = await pg.evaluate(J(f"const d={C2}.querySelector('.ock-done'); return d ? d.className : ''"))
    ok(dn2 and "pop" not in dn2, "…and stays without popping again")
    print("ERRORS", errs[:6]); ok(not errs, "RO page: no console errors")
    await b.close()
async def tech_page(p, w=1440, h=900, phone=False):
    print("— the Technician page" + (" (phone)" if phone else ""))
    b, pg, errs = await setup(p, w, h, phone)
    me = await pg.evaluate(SIGN)
    rid, op, op2 = await pg.evaluate(PREP + "(" + json.dumps(me) + ")")
    await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(900)
    await pg.click("[data-pg=tech] .tch-it.run"); await pg.wait_for_timeout(800)   # the RO you picked stays picked when its lane changes
    Q = f"document.querySelector('[data-pg=tech] .ock[data-op=\"{op}\"]:not(.ock-fxp)')"
    await pg.evaluate(f"{Q}.scrollIntoView({{block:'center'}})"); await pg.wait_for_timeout(1300)
    info = await pg.evaluate(f"(()=>{{ const c={Q}; if(!c) return null; const f=k=>(c.querySelector('[data-f='+k+']')||{{}}).textContent||''; return {{ fup: f('up'), fband: f('band'), flunch: f('lunch'), nudge: !!c.querySelector('.ock-nudge'), tools: [...c.querySelectorAll('.ock-tl')].length }}; }})()")
    print("   ", info)
    ok(info and "your usual" in info["fup"] and "similar jobs" in info["fband"].lower() and info["nudge"] and info["tools"] == 2, "round 2 on the Technician page ('your usual' for you)")
    RECT = f"(()=>{{ const r={Q}.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }})()"
    await shot(pg, RECT, "b1_tech_card" + ("_phone" if phone else "") + ".png")
    # lunch: the shop's lunch starts in 3 s and ends 8 s later → the clock pauses itself, dims, starts itself again
    await pg.evaluate(f"(()=>{{ __tg.getRO('{rid}').operations.find(o=>o.id==='{op}').parts.forEach(x=>{{ x.status='Received'; }}); __tg.render(); }})()"); await pg.wait_for_timeout(300)
    await pg.evaluate("""(()=>{ const c=__tg.STATE().fmCfg || (__tg.STATE().fmCfg={}); const d=new Date(); const h=x=>{ const t=new Date(Date.now()+x*1000); return t.getHours()+t.getMinutes()/60+t.getSeconds()/3600; };
      c.start=0; c.end=23.99; c.lunch=[h(3), h(11)]; })()""")
    await pg.wait_for_timeout(4500)
    lp = await pg.evaluate(f"(()=>{{ const p=__tg.STATE().punches.find(x=>x.id==='pn_live'); const c={Q}; return [!!p.stop, p.stopReason, p.autoPause, !!(c && c.querySelector('.ock-dim')), c ? (c.querySelector('[data-f=lunch]')||{{}}).textContent : '']; }})()")
    ok(lp[0] and lp[1] == "Lunch" and lp[2] == "lunch", f"at lunch the clock pauses itself ({lp})")
    ok(lp[3], "the card dims for lunch — " + str(lp[4]))
    await shot(pg, RECT, "b2_tech_lunch" + ("_phone" if phone else "") + ".png")
    await pg.wait_for_timeout(8000)
    bk = await pg.evaluate(f"(()=>{{ const r=__tg.STATE().punches.find(x=>!x.stop); const c=document.querySelector('[data-pg=tech] .ock[data-op=\"{op}\"]:not(.ock-fxp)'); return [r ? r.opId : null, r ? !!r.autoResume : false, c ? (c.querySelector('.ock-bk')||{{}}).textContent : '']; }})()")
    ok(bk[0] == op and bk[1], f"after lunch it starts itself again on the same operation ({bk})")
    # the end of the day in 3 s → stops itself
    await pg.evaluate("""(()=>{ const c=__tg.STATE().fmCfg; const t=new Date(Date.now()+3000); c.end=t.getHours()+t.getMinutes()/60+t.getSeconds()/3600; c.lunch=[0.1,0.2]; })()""")
    await pg.wait_for_timeout(4500)
    eod = await pg.evaluate("(()=>{ const L=__tg.STATE().punches.filter(x=>x.autoPause==='eod'); return [L.length, L.length ? L[0].stopReason : '', __tg.STATE().punches.some(x=>!x.stop)]; })()")
    ok(eod[0] == 1 and eod[1] == "End of day" and not eod[2], f"at the end of the day it stops itself ({eod})")
    print("ERRORS", errs[:6]); ok(not errs, "Technician page: no console errors")
    await b.close()
async def main():
    async with async_playwright() as p:
        only = os.environ.get("ONLY", "")
        if only in ("", "ro"): await ro_page(p)
        if only in ("", "tech"): await tech_page(p)
        if only in ("", "tech", "phone"): await tech_page(p, 390, 844, True)
    print("FAILS", len(FAILS), FAILS)
asyncio.run(main())
