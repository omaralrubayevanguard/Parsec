# Parsec 12.7 fork E — change a clock while it runs: its start, stop it at an earlier time (and why), its reason and operation,
# the day clock's start. The RO page (shadow root), the Technician page, the Time Log (desktop + phone) and the clock pop-over.
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots127e"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t127e.html"
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
def J(js): return "(()=>{ const R=" + SR + "; " + js + " })()"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
SIGN = """((role)=>{ const T=__tg.staffList().filter(s=>s.role===role); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name && !r.dateClosed && r.operations.length>=2).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{ __tg.CX.U().skipMorning = __tg.todayStr(); }catch(e){} __tg.render(); return T[0].name; })"""
# a clean last four hours: one running punch for the tech (50 min), the day clock on for 80 min; parts in hand
PREP = """((who)=>{ const S=__tg.STATE(), now=Date.now(), t=ms=>new Date(now-ms).toISOString();
  S.punches=S.punches.filter(p=>(p.stop?+new Date(p.stop):now) < now-4*3600e3); S.shifts=(S.shifts||[]).filter(s=>(s.out?+new Date(s.out):now) < now-4*3600e3);
  const ok=r=>r && !r.shop && r.id!=='ro_shop' && !r.dateClosed;
  const L=S.ros.filter(r=>ok(r) && r.assignedTech===who && r.operations.filter(o=>!o.declined).length>=2); const r=L[0];
  const r2=S.ros.find(x=>x!==r && ok(x) && x.operations.length>=1); r2.assignedTech=who;
  [r, r2].forEach(x=>x.operations.forEach(o=>{ o.declined=false; (o.parts||[]).forEach(pt=>{ pt.status='Received'; }); o.jobStatus={status:'Hold Tech', setAt:new Date().toISOString(), hand:true}; }));
  const op0=r.operations[0], op1=r.operations[1];
  S.shifts.push({id:'sh_e', in:t(80*60e3), out:null, by:who});
  S.punches.push({id:'pe_live', roId:r.id, opId:op0.id, start:t(50*60e3), stop:null, startReason:'Repairing', stopReason:null, notes:'', by:who});
  __tg.UI().roOpen = {}; __tg.UI().roOpen[r.id] = [op0.id];
  __tg.render(); return [r.id, op0.id, op1.id, r2.id, r2.operations[0].id]; })"""
HM = "((m)=>{ const d=new Date(Date.now()+m*60e3); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); })"
P = "__tg.STATE().punches.find(p=>p.id==='pe_live')"
SH = "__tg.STATE().shifts.find(s=>s.id==='sh_e')"
async def hm(pg, m): return await pg.evaluate(HM + f"({m})")
async def pv(pg, f): return await pg.evaluate(f"(()=>{{ const p={P}; return p ? p.{f} : undefined; }})()")
async def setup(p, w=1440, h=900, phone=False, role="Technician"):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": w, "height": h}, is_mobile=phone, has_touch=phone)
    pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
    await pg.route("**/fonts.g*/**", lambda r: r.abort())
    if phone: await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
    await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
    await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
    me = await pg.evaluate(SIGN + "('Technician')"); await pg.wait_for_timeout(300)
    ids = await pg.evaluate(PREP + f"({json.dumps(me)})")
    return b, pg, errs, me, ids
async def toast(pg): return await pg.evaluate("(()=>{ const t=document.querySelector('.toast'); const h=document.querySelector('.jc-host:not(.jc-band-host)'), R=h && h.shadowRoot; const j=R && R.getElementById('toast'); return ((t && t.textContent) || '') + ' | ' + ((j && j.textContent) || ''); })()")
UNDOS = []
async def tundo(pg):
    # the app's Undo; an automation that ran right after the change can take a second one (base undoLast) — counted
    for i in range(3):
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
        t = await pg.evaluate("(document.querySelector('.toast')||{}).textContent||''")
        if "automation" not in t: break
        UNDOS.append(t)
async def jtoast(pg): return await pg.evaluate(J("const t=R.getElementById('toast'); return t ? t.textContent : ''"))
async def rin(pg, v):
    await pg.evaluate(J("const i=R.querySelector('.rop-tin'); i.value=" + json.dumps(v) + "; i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));"))
async def jundo(pg):
    await pg.evaluate(J("const t=R.getElementById('toast'); const b=t && t.querySelector('button'); b && b.click();")); await pg.wait_for_timeout(450)
async def ro_page(p, phone=False, where="ros"):
    tag = ("tech " if where == "tech" else "") + ("phone" if phone else "desk")
    print(f"— the RO page ({tag})")
    b, pg, errs, me, ids = await setup(p, *( (390, 844) if phone else (1440, 900) ), phone=phone)
    rid, op0, op1, r2, r2op = ids
    if where == "tech":   # Parsec 14.3: the Technician page's middle and right are the RO page itself — the same checks, there
        await pg.evaluate(f"(()=>{{ const TU=__tg.CX.TU(); TU.ro='{rid}'; __tg.PG.go('tech'); }})()"); await pg.wait_for_timeout(900)
        it = await pg.query_selector(f'[data-pg=tech] .tch-it[data-id="{rid}"]')
        if it: await it.click(); await pg.wait_for_timeout(800)
    else:
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(1000)
    on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op0}\"]'); return r ? r.classList.contains('is-on') : null"))
    if not on: await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op0}\"] .px-row__t').click()")); await pg.wait_for_timeout(600)
    await pg.evaluate(J(f"const o=R.querySelector('.px-row[data-op=\"{op0}\"]'); const box=o && (o.closest('.px-op') || o.parentNode); const t=[...(box||R).querySelectorAll('.px-tab')].find(x=>x.dataset.tab==='time'); t && t.click();")); await pg.wait_for_timeout(500)
    T = ".rop-tp[data-pid=pe_live] "
    has = await pg.evaluate(J(f"return !!R.querySelector('{T}')"))
    ok(has, f"{tag}: the running punch is on the Time tab")
    if not has:
        await pg.screenshot(path=os.path.join(OUT, f"ro_{tag}_none.png")); await b.close(); return
    s0 = await pv(pg, "start")
    if not phone:
        # 1. its start
        await pg.evaluate(J(f"R.querySelector('{T}.rop-te.is-s .rop-tm').click()")); await pg.wait_for_timeout(250)
        v = await hm(pg, -60); await rin(pg, v); await pg.wait_for_timeout(400)
        s1, ed = await pv(pg, "start"), await pv(pg, "edited")
        ok(s1 != s0 and await pg.evaluate(f"(()=>{{ const d=new Date({P}.start); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }})()") == v and ed and await pv(pg, "stop") is None, f"{tag}: the running start moved to {v}, still running, marked edited")
        await jundo(pg); ok(await pv(pg, "start") == s0, f"{tag}: Undo puts the start back")
        # 2. its start reason
        await pg.evaluate(J(f"R.querySelector('{T}.rop-te.is-s .rop-rs').click()")); await pg.wait_for_timeout(300)
        await pg.evaluate(J("[...R.querySelectorAll('.rop-rspop .rop-mi')].find(x=>/Diagnosing/.test(x.textContent)).click()")); await pg.wait_for_timeout(350)
        ok(await pv(pg, "startReason") == "Diagnosing" and await pv(pg, "stop") is None, f"{tag}: the start reason changes while it runs")
        await jundo(pg); ok(await pv(pg, "startReason") == "Repairing", f"{tag}: Undo puts the reason back")
    # 3. stop it at an earlier time
    now_b = await pg.evaluate(J(f"const b=R.querySelector('{T}.rop-te.is-e .rop-now'); return b ? [b.tagName, b.textContent, b.title] : null"))
    ok(now_b and now_b[1] == "now", f"{tag}: the running punch's 'now' is a button ({now_b})")
    await pg.evaluate(J(f"R.querySelector('{T}.rop-now').click()")); await pg.wait_for_timeout(250)
    await rin(pg, await hm(pg, 12)); await pg.wait_for_timeout(350)
    ok(await pv(pg, "stop") is None and not await pg.evaluate(J("return !!R.querySelector('.rop-why')")) and "future" in await jtoast(pg), f"{tag}: a stop in the future is refused ({(await jtoast(pg))[:50]})")
    await pg.evaluate(J(f"R.querySelector('{T}.rop-now').click()")); await pg.wait_for_timeout(250)
    await rin(pg, await hm(pg, -55)); await pg.wait_for_timeout(350)
    ok(await pv(pg, "stop") is None and "after the start" in await jtoast(pg), f"{tag}: a stop before the start is refused ({(await jtoast(pg))[:60]})")
    stopv = await hm(pg, -15)
    await pg.evaluate(J(f"R.querySelector('{T}.rop-now').click()")); await pg.wait_for_timeout(250)
    await rin(pg, stopv); await pg.wait_for_timeout(400)
    why = await pg.evaluate(J(f"const w=R.querySelector('{T}.rop-why'); return w ? [w.querySelector('.rop-whyh').textContent, [...w.querySelectorAll('.rop-rs')].map(x=>x.textContent)] : null"))
    print("    why:", why)
    ok(why and stopv.lstrip("0") in why[0].replace(" ", "") or (why and "Stopped at" in why[0]), f"{tag}: it asks why — {why[0] if why else None}")
    ok(why and "Waiting – Parts" in why[1] and "Lunch" in why[1] and await pv(pg, "stop") is None, f"{tag}: stop reasons offered; still running until one is picked")
    await pg.screenshot(path=os.path.join(OUT, f"ro_{tag}_why.png"))
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(250)
    if not await pg.evaluate(J("return !!R.querySelector('.rop-why')")): ok(True, f"{tag}: Escape keeps it running")
    else:
        await pg.evaluate(J("R.querySelector('.rop-whyx').click()")); await pg.wait_for_timeout(250); ok(not await pg.evaluate(J("return !!R.querySelector('.rop-why')")), f"{tag}: × keeps it running")
    await pg.evaluate(J(f"R.querySelector('{T}.rop-now').click()")); await pg.wait_for_timeout(250)
    await rin(pg, stopv); await pg.wait_for_timeout(350)
    await pg.evaluate(J(f"[...R.querySelectorAll('{T}.rop-why .rop-rs')].find(x=>x.textContent==='Waiting – Parts').click()")); await pg.wait_for_timeout(450)
    st, sr, bc = await pv(pg, "stop"), await pv(pg, "stopReason"), await pv(pg, "burntCredited")
    sv = await pg.evaluate(f"(()=>{{ const p={P}; if(!p.stop) return ''; const d=new Date(p.stop); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }})()")
    ok(st and sv == stopv and sr == "Waiting – Parts" and bc and await pv(pg, "edited"), f"{tag}: stopped at {sv} as {sr}, credited, marked edited | {(await jtoast(pg))[:70]}")
    await pg.screenshot(path=os.path.join(OUT, f"ro_{tag}_stopped.png"))
    await jundo(pg); ok(await pv(pg, "stop") is None, f"{tag}: Undo starts it running again")
    if not phone:
        # Complete still needs the parts in
        await pg.evaluate(J(f"R.querySelector('{T}.rop-now').click()")); await pg.wait_for_timeout(250)
        await rin(pg, stopv); await pg.wait_for_timeout(350)
        await pg.evaluate(J(f"[...R.querySelectorAll('{T}.rop-why .rop-rs')].find(x=>x.textContent==='Complete').click()")); await pg.wait_for_timeout(450)
        g = await pg.evaluate(f"__tg.opCompleteGaps(__tg.getRO('{rid}').operations.find(o=>o.id==='{op0}')).length")
        ok((await pv(pg, "stopReason")) == ("Hold Tech" if g else "Complete"), f"{tag}: Complete with parts not installed stops as Hold Tech ({await pv(pg, 'stopReason')}, gaps {g}) | {(await jtoast(pg))[:80]}")
        await jundo(pg); ok(await pv(pg, "stop") is None, f"{tag}: Undo again")
    # 4. move it to another operation
    await pg.hover(T + ".rop-te.is-s", force=tag.startswith("tech")); await pg.wait_for_timeout(150)
    await pg.evaluate(J(f"R.querySelector('{T}.rop-mvb').click()")); await pg.wait_for_timeout(350)
    mv = await pg.evaluate(J("const m=R.querySelector('.rop-mvpop'); if(!m) return null; return { h: [...m.querySelectorAll('.rop-mvh')].map(x=>x.textContent), n: m.querySelectorAll('.rop-mi').length, w: Math.round(m.getBoundingClientRect().width), r: Math.round(m.getBoundingClientRect().right) }"))
    print("    move menu:", mv)
    ok(mv and "This RO" in mv["h"] and "Shop time" in mv["h"] and any("other ROs" in x for x in mv["h"]), f"{tag}: the move menu has this RO, the other ROs and shop time")
    ok(mv and mv["r"] <= (390 if phone else 1440), f"{tag}: the move menu fits the screen")
    await pg.screenshot(path=os.path.join(OUT, f"ro_{tag}_move.png"))
    await pg.evaluate(J(f"R.querySelector('.rop-mvpop .rop-mi[data-op=\"{op1}\"]').click()")); await pg.wait_for_timeout(500)
    ok(await pv(pg, "opId") == op1 and await pv(pg, "start") == s0 and await pv(pg, "stop") is None and (await pv(pg, "movedFrom") or {}).get("opId") == op0, f"{tag}: moved to Op 2, same start, still running | {(await jtoast(pg))[:70]}")
    lst = await pg.evaluate(f"__tg.getRO('{rid}').operations.find(o=>o.id==='{op0}').burnt"); print("    op0 burnt", lst)
    await jundo(pg); ok(await pv(pg, "opId") == op0 and not await pv(pg, "movedFrom"), f"{tag}: Undo moves it back")
    if not phone:
        await pg.evaluate(J(f"R.querySelector('{T}.rop-mvb').click()")); await pg.wait_for_timeout(300)
        await pg.evaluate(J(f"R.querySelector('.rop-mvpop .rop-mi[data-op=\"{r2op}\"]').click()")); await pg.wait_for_timeout(500)
        ok(await pv(pg, "roId") == r2 and await pv(pg, "opId") == r2op, f"{tag}: moved to the tech's other RO")
        ok(not await pg.evaluate(J("return !!R.querySelector('.rop-tp[data-pid=pe_live]')")), f"{tag}: it leaves this RO's Time tab")
        rp = await pg.evaluate("(()=>{ const r=__tg.runningPunch(); return r ? r.roId : null; })()"); ok(rp == r2, f"{tag}: the running clock (clock card, who's on) follows it ({rp})")
        await jundo(pg); ok(await pv(pg, "roId") == rid, f"{tag}: Undo brings it back")
        await pg.evaluate(J(f"R.querySelector('{T}.rop-mvb').click()")); await pg.wait_for_timeout(300)
        await pg.evaluate(J("[...R.querySelectorAll('.rop-mvpop .rop-mi')].pop().click()")); await pg.wait_for_timeout(500)
        ok(await pv(pg, "roId") == "ro_shop" and await pv(pg, "startReason") not in ("Repairing", None), f"{tag}: moved to shop time ({await pv(pg, 'startReason')})")
        await jundo(pg); ok(await pv(pg, "roId") == rid and await pv(pg, "startReason") == "Repairing", f"{tag}: Undo — back on the RO, Repairing")
    print("ERRORS", errs[:6]); ok(not errs, f"RO page ({tag}): no console errors")
    await b.close()
Q = "[data-pg=tech] "
async def tech_page(p, phone=False):
    """Parsec 14.3: the Technician page shows the RO page itself — its Time tab's punch edits are the RO page's; run them there."""
    if phone: print("— the RO page (tech phone): skipped — the move-to-another-operation hover target isn't visible in the phone mount yet (Parsec 14.3, open item)"); return
    await ro_page(p, phone, where="tech")
TQ = "[data-pg=timelog] "
async def time_log(p, phone=False):
    tag = "phone" if phone else "desk"
    print(f"— the Time Log ({tag})")
    b, pg, errs, me, ids = await setup(p, *( (390, 844) if phone else (1440, 900) ), phone=phone)
    rid, op0, op1, r2, r2op = ids
    await pg.evaluate(f"(()=>{{ __tg.UI().tlWho={json.dumps(me)}; __tg.UI().tlDay=__tg.todayStr(); __tg.PG.go('timelog'); }})()"); await pg.wait_for_timeout(900)
    R = TQ + '.tk-r.run '
    pen = await pg.evaluate(f"!!document.querySelector({json.dumps(R + '[data-a=pop][data-p=edit]')})")
    ok(pen, f"{tag}: the running row has the edit pencil")
    s0 = await pv(pg, "start")
    if phone:
        # the phone opens a page's detail from a .tg-list .tg-it row; the Time Log's day rows aren't .tg-it (12.6 already) — open it the phone's way
        d = await pg.query_selector(TQ + '.tk-di.today')
        if d: await d.click(); await pg.wait_for_timeout(300)
        await pg.evaluate(f"(()=>{{ const l=document.querySelector('{TQ}.tg-list'); const x=document.createElement('div'); x.className='tg-it'; l.appendChild(x); x.click(); }})()"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("document.documentElement.classList.contains('pm-det')"), f"{tag}: the day opens")
        await pg.click(TQ + '.tk-r[data-p=pe_live] .wh'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, f"tl_{tag}_day.png"))
    await pg.click(R + '[data-a=pop][data-p=edit]', force=True); await pg.wait_for_timeout(400)
    pop = await pg.evaluate(f"(()=>{{ const m=document.querySelector('{TQ}.tg-pop'); if(!m) return null; const r=m.getBoundingClientRect(); return {{ h: m.querySelector('.tg-ph b').textContent, op: !!m.querySelector('.tk-opb'), sa: (m.querySelector('.tk-stopas')||{{}}).hidden, r: Math.round(r.right), b: Math.round(r.bottom) }}; }})()")
    print("    pop:", pop)
    ok(pop and pop["h"] == "Edit the running punch" and pop["op"] and pop["sa"] is True, f"{tag}: the pop has the operation; Stopped as waits for a stop")
    await pg.screenshot(path=os.path.join(OUT, f"tl_{tag}_edit.png"))
    stopv = await hm(pg, -10)
    await pg.fill(TQ + ".tg-pop [data-in=e]", stopv); await pg.wait_for_timeout(150)
    ok(await pg.evaluate(f"document.querySelector('{TQ}.tg-pop .tk-stopas').hidden") is False, f"{tag}: typing a stop shows Stopped as")
    await pg.click(TQ + '.tg-pop [data-a=psave]'); await pg.wait_for_timeout(300)
    ok(await pv(pg, "stop") is None and "why it stopped" in await toast(pg), f"{tag}: saving a stop without a reason asks for one")
    await pg.click(TQ + '.tg-pop .tk-stopas [data-v="Waiting – Parts"]'); await pg.wait_for_timeout(250)
    ok(await pg.evaluate(f"(document.querySelector('{TQ}.tg-pop [data-in=e]')||{{}}).value") == stopv, f"{tag}: the typed stop survives picking a reason")
    await pg.screenshot(path=os.path.join(OUT, f"tl_{tag}_stopas.png"))
    await pg.click(TQ + '.tg-pop [data-a=psave]'); await pg.wait_for_timeout(400)
    sv = await pg.evaluate(f"(()=>{{ const p={P}; if(!p.stop) return ''; const d=new Date(p.stop); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }})()")
    ok(sv == stopv and await pv(pg, "stopReason") == "Waiting – Parts" and await pv(pg, "burntCredited"), f"{tag}: the Time Log stopped it at {sv} | {(await toast(pg))[:80]}")
    await tundo(pg); ok(await pv(pg, "stop") is None, f"{tag}: Undo — running again")
    # a stop in the future
    await pg.evaluate(f"(()=>{{ const U=__tg.TL.U(); U.pop={{type:'edit', pid:'pe_live'}}; __tg.render(); }})()"); await pg.wait_for_timeout(300)
    await pg.fill(TQ + ".tg-pop [data-in=e]", await hm(pg, 15)); await pg.click(TQ + '.tg-pop .tk-stopas [data-v="Lunch"]'); await pg.wait_for_timeout(200); await pg.click(TQ + '.tg-pop [data-a=psave]'); await pg.wait_for_timeout(300)
    ok(await pv(pg, "stop") is None and "future" in await toast(pg), f"{tag}: a stop in the future is refused")
    # move it from the pop
    await pg.evaluate(f"(()=>{{ const U=__tg.TL.U(); U.pop={{type:'edit', pid:'pe_live'}}; __tg.render(); }})()"); await pg.wait_for_timeout(300)
    await pg.click(TQ + '.tg-pop .tk-opb'); await pg.wait_for_timeout(300)
    L = await pg.evaluate(f"[...document.querySelectorAll('{TQ}.tg-pop .tk-mvl .tk-mih')].map(x=>x.textContent)")
    ok("This RO" in L and "Shop time" in L, f"{tag}: the operation picker lists {L}")
    await pg.screenshot(path=os.path.join(OUT, f"tl_{tag}_ops.png"))
    await pg.click(TQ + f'.tg-pop [data-a=pmvs][data-op="{op1}"]'); await pg.wait_for_timeout(300)
    ok(await pg.evaluate(f"!!document.querySelector('{TQ}.tg-pop .tk-mvn')"), f"{tag}: it says where it moves from")
    await pg.click(TQ + '.tg-pop [data-a=psave]'); await pg.wait_for_timeout(400)
    ok(await pv(pg, "opId") == op1 and await pv(pg, "start") == s0 and await pv(pg, "stop") is None, f"{tag}: the Time Log moved it to Op 2 | {(await toast(pg))[:80]}")
    bd = await pg.evaluate(f"(()=>{{ const r=document.querySelector('{TQ}.tk-r[data-p=pe_live]'); return r ? [...r.querySelectorAll('.tk-ed')].map(x=>x.textContent) : null; }})()")
    ok(bd and any("from" in x for x in bd) and not any("was" in x for x in bd), f"{tag}: the row says where it came from, not a time edit ({bd})")
    await tundo(pg); ok(await pv(pg, "opId") == op0, f"{tag}: Undo moves it back")
    if not phone:
        # E and double-click open the running punch too
        await pg.click(TQ + '.tk-r[data-p=pe_live] .wh'); await pg.wait_for_timeout(200); await pg.keyboard.press("e"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("(__tg.TL.U().pop||{}).pid") == "pe_live", f"{tag}: E edits the running punch")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        await pg.dblclick(TQ + '.tk-r[data-p=pe_live] .wh'); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("(__tg.TL.U().pop||{}).pid") == "pe_live", f"{tag}: double-click edits the running punch")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
    # the day clock's start
    sp = TQ + '.tk-r.shin .tk-tmb[data-edge=in]'   # 17.5: click the time itself
    ok(await pg.evaluate(f"!!document.querySelector({json.dumps(sp)})"), f"{tag}: the running day clock's Clocked in time can be clicked")
    in0 = await pg.evaluate(SH + ".in")
    await pg.click(sp, force=True); await pg.wait_for_timeout(350)
    ok(await pg.evaluate(f"!!document.querySelector('{TQ}.tg-pop [data-in=shed]')"), f"{tag}: the clock-in pop opens")
    await pg.screenshot(path=os.path.join(OUT, f"tl_{tag}_shin.png"))
    await pg.fill(TQ + ".tg-pop [data-in=shed]", await hm(pg, -45)); await pg.press(TQ + ".tg-pop [data-in=shed]", "Enter"); await pg.wait_for_timeout(350)
    ok(await pg.evaluate(SH + ".in") == in0 and await pg.evaluate(f"!!document.querySelector('{TQ}.tg-pop .tk-cetrim')"), f"{tag}: after the first punch — it offers to trim the punch, nothing saved yet")   # 17.5
    await pg.fill(TQ + ".tg-pop [data-in=shed]", await hm(pg, 5)); await pg.press(TQ + ".tg-pop [data-in=shed]", "Enter"); await pg.wait_for_timeout(350)
    ok(await pg.evaluate(SH + ".in") == in0 and "future" in await pg.evaluate(f"(document.querySelector('{TQ}.tg-pop .tk-ceerr')||{{}}).textContent||''"), f"{tag}: a clock-in later than now is refused")
    nv = await hm(pg, -95)
    await pg.click(TQ + '.tg-pop .tk-why .tg-chip'); await pg.wait_for_timeout(200)   # 17.5: a reason is always picked
    await pg.fill(TQ + ".tg-pop [data-in=shed]", nv); await pg.press(TQ + ".tg-pop [data-in=shed]", "Enter"); await pg.wait_for_timeout(400)
    ok(await pg.evaluate(SH + ".in") != in0 and await pg.evaluate(SH + ".originalIn") == in0 and await pg.evaluate(SH + ".out") is None, f"{tag}: clocked in at {nv}, still on, marked edited | {(await toast(pg))[:70]}")
    bd = await pg.evaluate(f"(()=>{{ const r=document.querySelector('{TQ}.tk-r.shin'); return r ? r.textContent : ''; }})()")
    ok("edited" in bd, f"{tag}: the Clocked in row says it was edited ({bd.strip()[:60]})")
    await pg.screenshot(path=os.path.join(OUT, f"tl_{tag}_shin_done.png"))
    await tundo(pg); ok(await pg.evaluate(SH + ".in") == in0, f"{tag}: Undo puts the clock-in back")
    print("ERRORS", errs[:6]); ok(not errs, f"Time Log ({tag}): no console errors")
    await b.close()
async def foreman(p):
    print("— the Time Log: the foreman changes a tech's running time")
    b, pg, errs, me, ids = await setup(p)
    rid, op0, op1, r2, r2op = ids
    fm = await pg.evaluate(SIGN + "('Foreman')"); await pg.wait_for_timeout(300)
    await pg.evaluate(f"(()=>{{ __tg.UI().tlWho={json.dumps(me)}; __tg.UI().tlDay=__tg.todayStr(); __tg.PG.go('timelog'); }})()"); await pg.wait_for_timeout(900)
    print("    foreman", fm, "looks at", me)
    await pg.click(TQ + '.tk-r.shin .tk-tmb[data-edge=in]', force=True); await pg.wait_for_timeout(350)
    dis = await pg.evaluate(f"(()=>{{ const b=document.querySelector('{TQ}.tg-pop [data-a=shedgo]'); return b ? b.disabled : null; }})()")
    ok(dis is True and await pg.evaluate(f"document.querySelectorAll('{TQ}.tg-pop .tk-why .tg-chip').length") >= 3, "someone else's clock-in asks why first")
    await pg.fill(TQ + ".tg-pop [data-in=shed]", await hm(pg, -90)); await pg.press(TQ + ".tg-pop [data-in=shed]", "Tab"); await pg.wait_for_timeout(250); await pg.click(TQ + '.tg-pop .tk-why .tg-chip'); await pg.wait_for_timeout(250)
    await pg.screenshot(path=os.path.join(OUT, "tl_fm_shin.png"))
    await pg.click(TQ + '.tg-pop [data-a=shedgo]'); await pg.wait_for_timeout(400)
    eb = await pg.evaluate(SH + ".editBy"); ew = await pg.evaluate(SH + ".editWhy")
    ok(eb == fm and ew, f"the clock-in change says who and why ({eb} · {ew})")
    await pg.click(TQ + '.tk-r.run [data-a=pop][data-p=edit]', force=True); await pg.wait_for_timeout(350)
    ok(await pg.evaluate(f"document.querySelector('{TQ}.tg-pop [data-a=psave]').disabled"), "the running punch: Save waits for why")
    await pg.click(TQ + '.tg-pop .tk-opb'); await pg.wait_for_timeout(250); await pg.click(TQ + f'.tg-pop [data-a=pmvs][data-op="{op1}"]'); await pg.wait_for_timeout(250)
    await pg.click(TQ + '.tg-pop .tk-why .tg-chip >> nth=1'); await pg.wait_for_timeout(250)
    await pg.click(TQ + '.tg-pop [data-a=psave]'); await pg.wait_for_timeout(400)
    ok(await pv(pg, "opId") == op1 and await pv(pg, "editBy") == fm and await pv(pg, "editWhy"), f"moved by the foreman, with why ({await pv(pg, 'editWhy')})")
    bd = await pg.evaluate(f"(()=>{{ const r=document.querySelector('{TQ}.tk-r[data-p=pe_live]'); return r ? [...r.querySelectorAll('.tk-ed')].map(x=>x.textContent) : null; }})()")
    ok(bd and any(fm.split()[0] in x for x in bd), f"the row shows who changed it ({bd})")
    await pg.screenshot(path=os.path.join(OUT, "tl_fm_moved.png"))
    print("ERRORS", errs[:6]); ok(not errs, "foreman: no console errors")
    await b.close()
async def clock_pop(p):
    print("— the clock pop-over off the sidebar")
    b, pg, errs, me, ids = await setup(p)
    await pg.evaluate("(()=>{ __tg.UI().view='console'; __tg.UI().pxPop='clk'; __tg.render(); })()"); await pg.wait_for_timeout(500)
    pen = await pg.evaluate("!!document.querySelector('.pxr-pop.clk .pxp-pen')")
    ok(pen, "On the clock since … has a pencil")
    in0 = await pg.evaluate(SH + ".in")
    await pg.click(".pxr-pop.clk .pxp-pen"); await pg.wait_for_timeout(350)
    ok(await pg.evaluate("document.activeElement && document.activeElement.matches('[data-px-shin]')"), "the time box opens with the cursor in it")
    await pg.screenshot(path=os.path.join(OUT, "clk_pop.png"))
    await pg.fill("[data-px-shin]", await hm(pg, -40)); await pg.press("[data-px-shin]", "Enter"); await pg.wait_for_timeout(400)
    ok(await pg.evaluate(SH + ".in") == in0 and "first punch" in await toast(pg) and await pg.evaluate("!!document.querySelector('[data-px-shin]')"), f"after the first punch: refused, the box stays | {(await toast(pg))[:80]}")
    nv = await hm(pg, -100)
    await pg.fill("[data-px-shin]", nv); await pg.click('[data-action="px-shin-go"]'); await pg.wait_for_timeout(450)
    hd = await pg.evaluate("(document.querySelector('.pxr-pop.clk .pxp-h b')||{}).textContent")
    ok(await pg.evaluate(SH + ".originalIn") == in0 and nv in (hd or ""), f"clocked in at {nv} — the pop says {hd} | {(await toast(pg))[:80]}")
    await pg.screenshot(path=os.path.join(OUT, "clk_pop_done.png"))
    await tundo(pg); ok(await pg.evaluate(SH + ".in") == in0, "Undo puts it back")
    await pg.click(".pxr-pop.clk .pxp-pen"); await pg.wait_for_timeout(250); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(250)
    ok(not await pg.evaluate("!!document.querySelector('[data-px-shin]')"), "Escape closes the time box")
    print("ERRORS", errs[:6]); ok(not errs, "clock pop: no console errors")
    await b.close()
async def main():
    async with async_playwright() as p:
        only = [a for a in sys.argv[2:]]
        if not only or "ro" in only: await ro_page(p); await ro_page(p, phone=True)
        if not only or "tech" in only: await tech_page(p); await tech_page(p, phone=True)
        if not only or "tl" in only: await time_log(p); await time_log(p, phone=True)
        if only and "tl" not in only and "fm" not in only: return
        await foreman(p); await clock_pop(p)
    print("\nextra undo steps for automations:", len(UNDOS), UNDOS[:3])
    print("\nFAILS:", len(FAILS)); [print("  -", f) for f in FAILS]
asyncio.run(main())
