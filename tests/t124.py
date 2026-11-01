# Parsec 12.4 — the operation clock card on the RO page (shadow root) and the Technician page
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots124"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
def J(js): return "(()=>{ const R=" + SR + "; " + js + " })()"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
async def setup(p, w=1440, h=900, phone=False, rm=False):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": w, "height": h}, is_mobile=phone, has_touch=phone, reduced_motion="reduce" if rm else "no-preference")
    pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
    await pg.route("**/fonts.g*/**", lambda r: r.abort())
    if phone: await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
    await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
    await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
    return b, pg, errs
# an RO with an operation: quoted 2 h, three closed punches (0.9 h) in three reasons, a live one 5 s short of halfway
PREP = """((who)=>{ const S=__tg.STATE(); const L=S.ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length>=2 && (!who || r.assignedTech===who));
  L.sort((a,b)=>b.operations.length-a.operations.length); const r=L[0];
  S.punches.filter(p=>!p.stop).forEach(p=>{ p.stop=new Date().toISOString(); p.stopReason='Switched job'; p.burntCredited=true; });
  const op=r.operations[0]; op.jobStatus={status:'Hold Tech', setAt:new Date().toISOString(), hand:true}; op.declined=false; op.quoted='2';
  (op.parts||[]).forEach(x=>{ x.status='Received'; });
  S.punches=S.punches.filter(p=>p.opId!==op.id);
  const now=Date.now(), t=ms=>new Date(now-ms).toISOString(), by=who||'Marcus Lee';
  S.punches.push({id:'pn_a', roId:r.id, opId:op.id, start:t(5*3600e3), stop:t(5*3600e3-1080e3), startReason:'Diagnosing', stopReason:'Waiting – Parts', notes:'', by, burntCredited:true});
  S.punches.push({id:'pn_b', roId:r.id, opId:op.id, start:t(4*3600e3), stop:t(4*3600e3-1800e3), startReason:'Repairing', stopReason:'Lunch', notes:'', by, burntCredited:true});
  S.punches.push({id:'pn_c', roId:r.id, opId:op.id, start:t(3*3600e3), stop:t(3*3600e3-360e3), startReason:'Testing', stopReason:'Switched job', notes:'', by, burntCredited:true});
  S.punches.push({id:'pn_live', roId:r.id, opId:op.id, start:t(360e3-5e3), stop:null, startReason:'Repairing', stopReason:null, notes:'', by});
  op.burnt=0.9; delete op.burntAdj;
  __tg.render(); return [r.id, op.id]; })"""
SIGN = """(()=>{ const T=__tg.staffList().filter(s=>s.role==='Technician'); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name && !r.dateClosed && r.operations.length>=2).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.CX.U().skipMorning = __tg.todayStr(); __tg.render(); return T[0].name; })()"""
async def hold(pg, sel_js, ms):
    r = await pg.evaluate(sel_js)
    await pg.mouse.move(r[0], r[1]); await pg.mouse.down(); await pg.wait_for_timeout(ms); await pg.mouse.up(); await pg.wait_for_timeout(350)
def card(root, extra=""): return root + ".querySelector('.ock[data-op]" + extra + "')"
async def ro_page(p):
    print("— the RO page")
    b, pg, errs = await setup(p)
    rid, op = await pg.evaluate(PREP + "('')")
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
    on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); return r ? r.classList.contains('is-on') : null"))
    if not on: await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t').click()")); await pg.wait_for_timeout(600)
    C = "R.querySelector('.ock[data-op]')"
    info = await pg.evaluate(J(f"const c={C}; if(!c) return null; return {{ cls: c.className, pg: c.dataset.ockp, ring: !!c.querySelector('.ock-rg .ock-ring .p'), cols: c.querySelectorAll('.ock-big .dc').length, segs: [...c.querySelectorAll('.ock-segs i')].map(i=>[i.className, i.style.getPropertyValue('--c')]), who: c.querySelector('.ock-whos').textContent, pace: c.querySelector('[data-f=pace]').textContent, hint: c.querySelector('.ock-hint').textContent, old: !!R.querySelector('.px-time') }}"))
    print("   ", info)
    ok(info and info["pg"] == "jc", "the RO page has the shared clock card")
    ok(info and not info["old"], "the old time card is gone")
    ok(info and "run" in info["cls"] and "st-run" in info["cls"], "running: the card breathes (st-run)")
    ok(info and info["ring"], "the ring around the button")
    ok(info and info["cols"] == 5, "rolling digits: 5 digit columns for H:MM:SS")
    ok(info and len(info["segs"]) == 4 and info["segs"][0][1].strip() == "var(--rc-diag)" and info["segs"][1][1].strip() == "var(--rc-rep)" and info["segs"][2][1].strip() == "var(--rc-test)" and "live" in info["segs"][3][0], "the bar: one piece per punch in its reason's color, the live one last")
    ok(info and "Marcus" in info["who"], "who's on the clock: " + (info or {}).get("who", ""))
    ok(info and "Quoted runs out about" in info["pace"], "when quoted runs out: " + (info or {}).get("pace", ""))
    ok(info and info["hint"] == "Hold to stop", "the hint says hold to stop")
    anim = await pg.evaluate(J(f"const c={C}; return c.getAnimations({{subtree:true}}).map(a=>[a.animationName, a.startTime])"))
    print("    animations:", anim)
    ok(any(a[0] == "ock-breathe" and a[1] == 0 for a in anim), "the breathing keeps one beat (startTime 0)")
    t0 = await pg.evaluate(J(f"return {C}.querySelector('.ock-big').dataset.t"))
    off0 = await pg.evaluate(J(f"return parseFloat({C}.querySelector('.ock-ring .p').style.strokeDashoffset)"))
    await pg.wait_for_timeout(2200)
    t1 = await pg.evaluate(J(f"return {C}.querySelector('.ock-big').dataset.t"))
    tr = await pg.evaluate(J(f"return [...{C}.querySelectorAll('.ock-big .dc')].map(d=>d.dataset.v+':'+d.style.transform).join(' ')"))
    off1 = await pg.evaluate(J(f"return parseFloat({C}.querySelector('.ock-ring .p').style.strokeDashoffset)"))
    ok(t1 != t0, f"the time ticks in place: {t0} → {t1}  ({tr})")
    ok(off1 < off0, f"the ring fills ({off0} → {off1})")
    await pg.screenshot(path=os.path.join(OUT, "a1_ro_running.png"))
    await pg.wait_for_timeout(3600)
    ms = await pg.evaluate(J(f"const c={C}; return {{ hit: c.querySelector('.ock-ms[data-p=\"0.5\"]').classList.contains('hit'), lab: (c.querySelector('.ock-mlb')||{{}}).textContent || '' }}"))
    ok(ms["hit"] and "Halfway" in ms["lab"], f"milestone: halfway reached — {ms}")
    el = await pg.evaluate(J(f"const r={C}.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]"))
    await pg.screenshot(path=os.path.join(OUT, "a2_ro_halfway.png"), clip={"x": el[0] - 10, "y": el[1] - 10, "width": el[2] + 20, "height": el[3] + 20})
    # time left
    await pg.evaluate(J(f"{C}.querySelector('.ock-big').click()")); await pg.wait_for_timeout(1300)
    lf = await pg.evaluate(J(f"const c={C}; return [c.querySelector('.ock-big').dataset.t, c.querySelector('.ock-lbl').textContent]"))
    ok(lf[1].startswith("Time left") and lf[0].startswith("0:59"), f"tap the time: time left {lf}")
    await pg.evaluate(J(f"{C}.querySelector('.ock-big').click()")); await pg.wait_for_timeout(300)
    # hold to stop: a short press does nothing
    GO = J(f"const r={C}.querySelector('[data-ock=go]').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]")
    await hold(pg, GO, 250)
    st = await pg.evaluate(f"!!__tg.STATE().punches.find(p=>p.id==='pn_live' && !p.stop)")
    hn = await pg.evaluate(J(f"return {C}.querySelector('.ock-hint').textContent"))
    ok(st and "Hold it" in hn, f"a short press doesn't stop it (hint: {hn})")
    await pg.evaluate("window.__ev=[]; ['pointerdown','pointerup','pointermove','pointercancel','lostpointercapture','click'].forEach(k=>document.addEventListener(k,e=>window.__ev.push(k+':'+Date.now()%100000),true))")
    await hold(pg, GO, 900)
    print("    events:", await pg.evaluate("window.__ev"), await pg.evaluate("JSON.stringify(Object.values(__tg.OCK_ST).slice(-1))"))
    st = await pg.evaluate("(()=>{ const p=__tg.STATE().punches.find(p=>p.id==='pn_live'); return [!!p.stop, p.stopReason]; })()")
    chips = await pg.evaluate(J(f"return [...{C}.querySelectorAll('.ock-rsn .ock-r')].map(b=>b.textContent)"))
    ok(st[0], f"holding stops the clock ({st})")
    ok(len(chips) >= 7 and "Complete" in chips and "Lunch" in chips, f"the stop reasons slide in: {chips}")
    ok(await pg.evaluate("!__tg.STATE().punches.some(p=>!p.stop)"), "the click after the hold didn't start it again")
    await pg.screenshot(path=os.path.join(OUT, "a3_ro_reasons.png"), clip={"x": el[0] - 10, "y": el[1] - 10, "width": el[2] + 20, "height": el[3] + 80})
    await pg.evaluate(J(f"[...{C}.querySelectorAll('.ock-rsn .ock-r')].find(b=>b.textContent==='Waiting – Approval').click()")); await pg.wait_for_timeout(500)
    r2 = await pg.evaluate("__tg.STATE().punches.find(p=>p.id==='pn_live').stopReason")
    w = await pg.evaluate(J(f"const c={C}; return [c.className, !!c.querySelector('.ock-wt'), c.querySelectorAll('.ock-rsn .ock-r').length]"))
    ok(r2 == "Waiting – Approval", "picking a chip sets the stop reason")
    ok("st-wait" in w[0] and w[1] and w[2] == 0, f"waiting: amber and still, WAIT in the circle ({w})")
    await pg.screenshot(path=os.path.join(OUT, "a4_ro_wait.png"), clip={"x": el[0] - 10, "y": el[1] - 10, "width": el[2] + 20, "height": el[3] + 20})
    # WAIT starts it again; then keyboard Enter on Stop stops at once
    await pg.evaluate(J(f"{C}.querySelector('.ock-wt').click()")); await pg.wait_for_timeout(500)
    await pg.keyboard.press("Escape")
    ok(await pg.evaluate("__tg.STATE().punches.some(p=>!p.stop)"), "WAIT starts the clock anyway")
    await pg.evaluate(J(f"{C}.querySelector('[data-ock=go]').focus()")); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
    ok(await pg.evaluate("!__tg.STATE().punches.some(p=>!p.stop)"), "Enter on Stop stops it at once")
    ok(await pg.evaluate(J(f"return {C}.querySelectorAll('.ock-rsn .ock-r').length")) > 0, "…and asks why")
    await pg.evaluate(J(f"{C}.querySelector('[data-ock=rx]').click()")); await pg.wait_for_timeout(200)
    ok(await pg.evaluate(J(f"return {C}.querySelectorAll('.ock-rsn .ock-r').length")) == 0, "✕ puts the reasons away")
    # over quoted: quoted 1 h, the clock running
    await pg.evaluate(f"(()=>{{ const S=__tg.STATE(); const op=__tg.getRO('{rid}').operations.find(o=>o.id==='{op}'); op.quoted='1'; S.punches.push({{id:'pn_o', roId:'{rid}', opId:'{op}', start:new Date(Date.now()-600e3).toISOString(), stop:null, startReason:'Repairing', stopReason:null, notes:'', by:'Marcus Lee'}}); __tg.JC.rerender(); }})()"); await pg.wait_for_timeout(1300)
    ov = await pg.evaluate(J(f"const c={C}; return {{ cls: c.className, chip: (c.querySelector('.ock-ovl')||{{}}).textContent||'', w: c.querySelector('.ock-ov').style.width, left: c.querySelector('[data-ock=kk]').textContent, ring: c.querySelector('.ock-ring .p').style.getPropertyValue('--rc') }}"))
    ok("over" in ov["cls"] and "over" in ov["chip"] and ov["w"] not in ("0%", "") and ov["left"] == "Over" and "bad" in ov["ring"], f"over quoted: {ov}")
    await pg.screenshot(path=os.path.join(OUT, "a5_ro_over.png"), clip={"x": el[0] - 10, "y": el[1] - 10, "width": el[2] + 20, "height": el[3] + 20})
    # the quoted hours: click to change
    await pg.evaluate(J(f"{C}.querySelector('[data-ock=q]').click()")); await pg.wait_for_timeout(200)
    await pg.keyboard.press("Control+A"); await pg.keyboard.type("4.5"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
    q = await pg.evaluate(f"__tg.getRO('{rid}').operations.find(o=>o.id==='{op}').quoted")
    ok(str(q) == "4.5", f"quoted changes in place ({q})")
    # complete: the check
    await pg.evaluate(f"(()=>{{ const S=__tg.STATE(); S.punches.filter(p=>!p.stop).forEach(p=>{{ p.stop=new Date().toISOString(); p.stopReason='Complete'; }}); const op=__tg.getRO('{rid}').operations.find(o=>o.id==='{op}'); op.jobStatus={{status:'Complete', setAt:new Date().toISOString(), hand:true}}; __tg.JC.rerender(); }})()"); await pg.wait_for_timeout(700)
    dn = await pg.evaluate(J(f"const c={C}; return [c.className, !!c.querySelector('.ock-ck'), (c.querySelector('.ock-ck')||{{className:''}}).className]"))
    ok("st-done" in dn[0] and dn[1], f"complete: the check ({dn})")
    ok("draw" in dn[2], "…draws itself when it just happened")
    await pg.evaluate("__tg.JC.rerender()"); await pg.wait_for_timeout(1200); await pg.evaluate("__tg.JC.rerender()"); await pg.wait_for_timeout(200)
    dn2 = await pg.evaluate(J(f"return ({C}.querySelector('.ock-ck')||{{className:''}}).className"))
    ok("draw" not in dn2, "…and doesn't draw again on the next redraw")
    await pg.screenshot(path=os.path.join(OUT, "a6_ro_done.png"), clip={"x": el[0] - 10, "y": el[1] - 10, "width": el[2] + 20, "height": el[3] + 20})
    # dark
    await pg.evaluate("(()=>{ const b=document.querySelector('.px-rail .pxr-thm button[data-theme=\"ivd\"]'); b && b.click(); })()"); await pg.wait_for_timeout(500)
    await pg.evaluate(f"(()=>{{ const S=__tg.STATE(); const op=__tg.getRO('{rid}').operations.find(o=>o.id==='{op}'); op.jobStatus={{status:'Hold Tech', setAt:new Date().toISOString(), hand:true}}; op.quoted='2'; S.punches.push({{id:'pn_d', roId:'{rid}', opId:'{op}', start:new Date(Date.now()-300e3).toISOString(), stop:null, startReason:'Diagnosing', stopReason:null, notes:'', by:'Marcus Lee'}}); __tg.JC.rerender(); }})()"); await pg.wait_for_timeout(1500)
    await pg.screenshot(path=os.path.join(OUT, "a7_ro_dark.png"), clip={"x": el[0] - 10, "y": el[1] - 10, "width": el[2] + 20, "height": el[3] + 20})
    print("ERRORS", errs[:6]); ok(not errs, "RO page: no console errors")
    await b.close()
async def tech_page(p, w=1440, h=900, phone=False):
    print("— the Technician page" + (" (phone)" if phone else ""))
    b, pg, errs = await setup(p, w, h, phone)
    me = await pg.evaluate(SIGN)
    rid, op = await pg.evaluate(PREP + "(" + json.dumps(me) + ")")
    await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(900)
    Q = "document.querySelector('[data-pg=tech] .tch-o.open .ock[data-op]')"
    info = await pg.evaluate(f"(()=>{{ const c={Q}; if(!c) return null; return {{ op: c.dataset.op, pg: c.dataset.ockp, cls: c.className, go: !!c.querySelector('[data-ock=go].on'), segs: c.querySelectorAll('.ock-segs i').length, who: c.querySelector('.ock-whos').textContent, old: !!document.querySelector('[data-pg=tech] .tch-tm') }}; }})()")
    print("   ", info, me)
    ok(info and info["pg"] == "tc" and info["op"] == op, "the Technician page has the shared clock card on the running operation")
    ok(info and not info["old"], "the old clock card is gone")
    ok(info and info["go"] and "st-run" in info["cls"] and info["segs"] == 4, "running, with Stop in the ring and the punches on the bar")
    ok(info and "You" in info["who"], "who's on the clock says You: " + (info or {}).get("who", ""))
    # a redraw keeps the card (and its animations) — the page morphs
    await pg.evaluate(f"{Q}._mark = 1"); await pg.evaluate("__tg.render()"); await pg.wait_for_timeout(200)
    ok(await pg.evaluate(f"{Q}._mark === 1"), "a redraw keeps the same card element")
    t0 = await pg.evaluate(f"{Q}.querySelector('.ock-big').dataset.t"); await pg.wait_for_timeout(5600)
    t1 = await pg.evaluate(f"{Q}.querySelector('.ock-big').dataset.t")
    ok(t1 != t0 and await pg.evaluate(f"{Q}._mark === 1"), f"ticks through the 5-second redraw ({t0} → {t1})")
    ms = await pg.evaluate(f"(()=>{{ const c={Q}; return [c.querySelector('.ock-ms[data-p=\"0.5\"]').classList.contains('hit'), (c.querySelector('.ock-mlb')||{{}}).textContent||'']; }})()")
    ok(ms[0] and "Halfway" in ms[1], f"milestone on this page too ({ms})")
    await pg.evaluate(f"{Q}.scrollIntoView({{block:'center'}})"); await pg.wait_for_timeout(300)
    el = await pg.evaluate(f"(()=>{{ const r={Q}.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }})()")
    await pg.screenshot(path=os.path.join(OUT, "b1_tech" + ("_phone" if phone else "") + ".png"))
    # Space on the focused Stop: stops once, doesn't start again
    if not phone:
        await pg.evaluate(f"{Q}.querySelector('[data-ock=go]').focus()"); await pg.keyboard.press(" "); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("!__tg.STATE().punches.some(p=>!p.stop)"), "Space on Stop stops it (and only that)")
        await pg.evaluate(f"{Q}.querySelector('[data-ock=go]').click()"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("__tg.STATE().punches.some(p=>!p.stop && p.opId==='" + op + "')"), "a tap on Play starts it")
    # hold to stop
    GO = f"(()=>{{ const r={Q}.querySelector('[data-ock=go]').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]; }})()"
    if phone:
        r = await pg.evaluate(GO)
        await pg.evaluate(f"""(()=>{{ const g={Q}.querySelector('[data-ock=go]'); const o={{bubbles:true,composed:true,pointerId:7,pointerType:'touch',isPrimary:true,button:0,clientX:{r[0]},clientY:{r[1]}}}; g.dispatchEvent(new PointerEvent('pointerdown',o)); setTimeout(()=>{{ g.dispatchEvent(new PointerEvent('pointerup',o)); g.dispatchEvent(new MouseEvent('click',{{bubbles:true,composed:true,detail:1}})); }}, 850); }})()""")
        await pg.wait_for_timeout(1300)
    else: await hold(pg, GO, 900)
    ok(await pg.evaluate("!__tg.STATE().punches.some(p=>!p.stop)"), "holding Stop stops the clock")
    chips = await pg.evaluate(f"[...{Q}.querySelectorAll('.ock-rsn .ock-r')].map(b=>b.textContent)")
    ok(len(chips) >= 7, f"the reasons: {chips}")
    await pg.screenshot(path=os.path.join(OUT, "b2_tech_reasons" + ("_phone" if phone else "") + ".png"), clip={"x": max(0, el[0] - 10), "y": max(0, el[1] - 10), "width": min(w, el[2] + 20), "height": el[3] + 90} if not phone else None)
    await pg.evaluate(f"[...{Q}.querySelectorAll('.ock-rsn .ock-r')].find(b=>b.textContent==='Lunch').click()"); await pg.wait_for_timeout(500)
    rs = await pg.evaluate("(()=>{ const L=__tg.STATE().punches.filter(p=>p.opId==='" + op + "').sort((a,b)=>new Date(a.start)-new Date(b.start)); return L[L.length-1].stopReason; })()")
    ok(rs == "Lunch", f"the chip sets the reason ({rs})")
    print("ERRORS", errs[:6]); ok(not errs, "Technician page: no console errors")
    await b.close()
async def calm(p):
    print("— reduce motion")
    b, pg, errs = await setup(p, rm=True)
    rid, op = await pg.evaluate(PREP + "('')")
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
    on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); return r ? r.classList.contains('is-on') : null"))
    if not on: await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t').click()")); await pg.wait_for_timeout(600)
    C = "R.querySelector('.ock[data-op]')"
    a = await pg.evaluate(J(f"const c={C}; return [getComputedStyle(c).animationName, getComputedStyle(c.querySelector('.ock-big .dc')).transitionDuration, c.getAnimations({{subtree:true}}).length]"))
    ok(a[0] == "none" and a[1] == "0s" and a[2] == 0, f"reduce motion: nothing moves ({a})")
    GO = J(f"const r={C}.querySelector('[data-ock=go]').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]")
    await hold(pg, GO, 900)
    ok(await pg.evaluate("!__tg.STATE().punches.some(p=>!p.stop)"), "reduce motion: hold to stop still works")
    print("ERRORS", errs[:6]); ok(not errs, "reduce motion: no console errors")
    await b.close()
async def main():
    async with async_playwright() as p:
        await ro_page(p)
        await tech_page(p)
        await tech_page(p, 390, 844, True)
        await calm(p)
    print("FAILS", len(FAILS), FAILS)
asyncio.run(main())
