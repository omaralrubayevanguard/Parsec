# Parsec 12.3 fork C — the RO page (from the RO list): Time tab in place, icons, the operation's header row, tab actions, the truck line
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app"; OUT = os.path.join(H, "shots123c"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12c.html"
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
def J(js): return "(()=>{ const R=" + SR + "; " + js + " })()"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
async def setup(p, w, h, phone=False):
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
PREP = """(()=>{ const S=__tg.STATE(); const L=S.ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length>=2);
  L.sort((a,b)=>b.operations.length-a.operations.length); const r=L[0];
  r.year=2020; r.make='Volvo'; r.model='VNL 760'; r.axles='6x4'; r.cab='High-roof sleeper'; r.sleeper='70-inch'; r.engineType='Volvo D13 · 455 hp';
  S.punches.filter(p=>!p.stop).forEach(p=>{ p.stop=new Date().toISOString(); p.stopReason='Switched job'; });
  const op=r.operations[0]; op.jobStatus={status:'Hold Tech', setAt:new Date().toISOString(), hand:true}; op.declined=false; delete op.jobType;
  S.punches=S.punches.filter(p=>p.opId!==op.id);
  const d0=new Date(); d0.setHours(7,0,0,0); const t=(h,m)=>new Date(d0.getTime()+(h*60+m)*60000).toISOString();
  if (Date.now() < d0.getTime()+5*3600000) { d0.setDate(d0.getDate()-1); }
  S.punches.push({id:'pn_c1', roId:r.id, opId:op.id, start:t(0,0), stop:t(1,10), startReason:'Diagnosing', stopReason:'Waiting – Parts', notes:'', by:'Marcus Lee'});
  S.punches.push({id:'pn_c2', roId:r.id, opId:op.id, start:t(2,0), stop:t(3,30), startReason:'Repairing', stopReason:'Lunch', notes:'0:20 Found a cracked hose.', by:'Marcus Lee'});
  S.punches.push({id:'pn_c3', roId:r.id, opId:op.id, start:t(4,15), stop:t(4,45), startReason:'Testing', stopReason:'Switched job', notes:'', by:'Marcus Lee'});
  __tg.save(); return [r.id, op.id]; })()"""
async def openro(pg, rid, op):
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
    on = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); return r ? r.classList.contains('is-on') : null"))
    if not on: await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t').click()")); await pg.wait_for_timeout(500)
async def tab(pg, k):
    await pg.evaluate(J(f"const t=[...R.querySelectorAll('.px-tab')].find(x=>x.dataset.tab==='{k}'); t && t.click();")); await pg.wait_for_timeout(350)
TOAST = J("const t=R.getElementById('toast'); return t ? t.textContent : ''")
async def undo(pg):
    await pg.evaluate(J("const t=R.getElementById('toast'); const b=t && t.querySelector('button'); b && b.click();")); await pg.wait_for_timeout(400)
P = lambda pid: f"__tg.STATE().punches.find(p=>p.id==='{pid}')"

async def desktop(p):
    b, pg, errs = await setup(p, 1440, 900)
    rid, op = await pg.evaluate(PREP)
    await openro(pg, rid, op)
    # ---------- the band and Vehicle ----------
    sub = await pg.evaluate(J("return (R.querySelector('.rop-band .px-ro__sub')||{}).textContent || ''"))
    ok(sub.startswith("2020 Volvo VNL 760 · 6x4 · High-roof sleeper · 70-inch"), "truck line under the name: " + sub)
    veh = await pg.evaluate(J("return [...R.querySelectorAll('.px-pg[data-pg=vehicle] .px-prop')].map(s=>s.textContent)"))
    ok(any(v.startswith("Configuration") and "6x4 · High-roof sleeper" in v for v in veh), "Vehicle shows Configuration")
    ok(any(v.startswith("Sleeper") and "70-inch" in v for v in veh), "Vehicle shows Sleeper")
    ok(any(v.startswith("Engine") and "455 hp" in v for v in veh), "Vehicle shows Engine")
    ok(any(v.startswith("Make") and "Volvo" in v for v in veh), "Vehicle shows Make")
    # ---------- the operation's header row ----------
    row = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); return {{ tag: r.tagName, jt: !!r.querySelector('.rop-jt'), st: !!r.querySelector('.rop-octl .rop-st'), menu: !!r.querySelector('.rop-octl .rop-more1'), all: [...R.querySelectorAll('.px-row[data-op]')].every(x=>x.querySelector('.rop-st') && x.querySelector('.rop-more1')), body: !!R.querySelector('.px-op'), cf: !!R.querySelector('.px-op .complaintField'), code: !!R.querySelector('.px-op .fltAdd, .px-op .fltBar'), oldHead: !!R.querySelector('.px-op .cardHead'), jtc: getComputedStyle(r.querySelector('.rop-jt'),'::before').backgroundColor }}"))
    print("row:", row)
    ok(row["tag"] == "DIV" and row["jt"] and row["st"] and row["menu"] and row["all"], "status, ⋯ and job type in every operation's row")
    ok(row["body"] and not row["cf"] and not row["code"] and not row["oldHead"], "no complaint line, no + code in the open operation's body")
    # job type dropdown
    await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op}\"] .rop-jt').click()")); await pg.wait_for_timeout(300)
    items = await pg.evaluate(J("return [...R.querySelectorAll('.rop-jtpop .rop-mi')].map(x=>x.textContent)"))
    ok(items == ["DIAG", "REPAIR", "PM", "WARR", "COMEBACK", "SUBLET", "RECALL"] or [i.strip() for i in items] == ["DIAG", "REPAIR", "PM", "WARR", "COMEBACK", "SUBLET", "RECALL"], "job type menu: " + str(items))
    await pg.screenshot(path=os.path.join(OUT, "d_jobtype.png"))
    await pg.evaluate(J("[...R.querySelectorAll('.rop-jtpop .rop-mi')].find(x=>/^PM/.test(x.textContent.trim())).click()")); await pg.wait_for_timeout(400)
    jt = await pg.evaluate(f"__tg.getRO('{rid}').operations[0].jobType"); t1 = await pg.evaluate(TOAST)
    ok(jt == "PM" and "PM" in t1, "job type set to PM, toast: " + t1[:60])
    lbl = await pg.evaluate(J(f"return R.querySelector('.px-row[data-op=\"{op}\"] .rop-jt').textContent"))
    ok(lbl.strip() == "PM", "chip shows PM")
    await undo(pg); jt2 = await pg.evaluate(f"__tg.getRO('{rid}').operations[0].jobType || ''")
    ok(jt2 != "PM", "Undo puts the job type back (" + jt2 + ")")
    # status dropdown in the row
    await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op}\"] .rop-st').click()")); await pg.wait_for_timeout(300)
    vis = await pg.evaluate(J("const m=R.querySelector('.rop-stpop'); if(!m) return null; const r=m.getBoundingClientRect(); return [true, Math.round(r.width), Math.round(r.height), getComputedStyle(m).visibility]"))
    ok(vis and vis[0] and vis[1] > 100 and vis[2] > 100, "status menu opens from the row " + str(vis))
    await pg.screenshot(path=os.path.join(OUT, "d_status.png"))
    still = await pg.evaluate(J(f"return R.querySelector('.px-row[data-op=\"{op}\"]').classList.contains('is-on')"))
    ok(still, "clicking the status doesn't fold the operation")
    sts = await pg.evaluate(J("return [...R.querySelectorAll('.rop-stpop .px-menu__item')].map(x=>x.textContent.trim().slice(0,30))"))
    print("status items:", sts)
    await pg.evaluate(J("const it=[...R.querySelectorAll('.rop-stpop .px-menu__item')].find(x=>/^Waiting/i.test(x.textContent.trim())); it && it.click();")); await pg.wait_for_timeout(400)
    stn = await pg.evaluate(f"__tg.getRO('{rid}').operations[0].jobStatus.status"); t3 = await pg.evaluate(TOAST)
    ok(stn != "Hold Tech" and "set to" in t3, "status set from the row: " + stn + " | " + t3[:50])
    if stn != "Hold Tech": await undo(pg)
    ok(await pg.evaluate(f"__tg.getRO('{rid}').operations[0].jobStatus.status") == "Hold Tech", "Undo puts the status back")
    # ⋯ menu
    rows = await pg.evaluate(J("return [...R.querySelectorAll('.px-row[data-op]')].map(r=>r.dataset.op)"))
    await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{rows[-1]}\"] .rop-more1').click()")); await pg.wait_for_timeout(300)
    mm = await pg.evaluate(J("const m=R.querySelector('.rop-opmenu'); return m ? [true, [...m.querySelectorAll('.px-menu__item')].map(x=>x.textContent.trim())] : null"))
    await pg.screenshot(path=os.path.join(OUT, "d_opmenu.png"))
    ok(mm and mm[1] == ["Add part", "Print Op", "Move to another RO…", "Delete operation"], "⋯ menu opens from a closed row " + str(mm))
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
    await pg.mouse.click(700, 860); await pg.wait_for_timeout(200)
    # ---------- the Time tab ----------
    await tab(pg, "time")
    tl = await pg.evaluate(J("return { bar: R.querySelectorAll('.rop-dbar .rop-dsg').length, segc: [...R.querySelectorAll('.rop-dsg')].map(s=>s.style.getPropertyValue('--c')), tps: R.querySelectorAll('.rop-tp').length, lc: [...R.querySelectorAll('.rop-tp')].map(t=>t.style.getPropertyValue('--lc')+'|'+t.style.getPropertyValue('--ec')), adds: R.querySelectorAll('.rop-addb').length, legacy: !!R.querySelector('.px-op .px-legacy, .px-op .jbx-punch'), words: [...R.querySelectorAll('.px-optabs .px-add')].map(x=>x.textContent), legend: !!R.querySelector('.rop-leg, .px-legend'), acts: [...R.querySelectorAll('.rop-tabrow .rop-tacts .rop-ib')].map(x=>x.getAttribute('aria-label')) }"))
    print("time:", json.dumps(tl))
    ok(tl["bar"] == 3 and tl["tps"] == 3, "day bar with 3 segments, 3 punches")
    ok(tl["segc"][0] == "var(--rc-diag)" and tl["lc"][0] == "var(--rc-diag)|var(--rc-wparts)", "colors follow the reasons (start line/dot, stop dot)")
    ok(tl["adds"] == 2, "a + between punches (2)")
    ok(not tl["legacy"] and not tl["words"] and not tl["legend"], "no punches section, no Edit entries / word links, no legend")
    ok(tl["acts"] == ["Add time entry"], "Time tab action at the right of the tabs")
    dotc = await pg.evaluate(J("const i=R.querySelector('.rop-tp .rop-te.is-s > i'), e=R.querySelector('.rop-tp .rop-te.is-e > i'); return [getComputedStyle(i).backgroundColor, getComputedStyle(e).backgroundColor, getComputedStyle(R.querySelector('.rop-tp'),'::before').backgroundColor]"))
    print("dots:", dotc); ok(dotc[0] != dotc[1], "start and stop dots differ in color")
    await pg.screenshot(path=os.path.join(OUT, "d_time.png"))
    # edit a start time in place
    await pg.evaluate(J("R.querySelector('.rop-tp[data-pid=pn_c1] .rop-te.is-s .rop-tm').click()")); await pg.wait_for_timeout(300)
    hasin = await pg.evaluate(J("return !!R.querySelector('.rop-tp[data-pid=pn_c1] .rop-tin')"))
    ok(hasin, "click a time: a time input in place")
    s0 = await pg.evaluate(P("pn_c1") + ".start")
    await pg.evaluate(J("const i=R.querySelector('.rop-tin'); i.value='06:45'; i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));")); await pg.wait_for_timeout(400)
    s1 = await pg.evaluate(P("pn_c1") + ".start"); t2 = await pg.evaluate(TOAST)
    hasu = await pg.evaluate(J("const t=R.getElementById('toast'); return !!(t && t.querySelector('button'))"))
    ok(s1 != s0 and "Start time" in t2 and hasu, "start time saved, Undo in the toast: " + t2[:70])
    await undo(pg); ok(await pg.evaluate(P("pn_c1") + ".start") == s0, "Undo puts the time back")
    # a stop time that overlaps the next punch: refused
    await pg.evaluate(J("R.querySelector('.rop-tp[data-pid=pn_c1] .rop-te.is-e .rop-tm').click()")); await pg.wait_for_timeout(300)
    await pg.evaluate(J("const i=R.querySelector('.rop-tin'); i.value='09:30'; i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));")); await pg.wait_for_timeout(400)
    ok("Overlap" in await pg.evaluate(TOAST), "an overlapping stop is refused: " + (await pg.evaluate(TOAST))[:60])
    # change a reason
    await pg.evaluate(J("R.querySelector('.rop-tp[data-pid=pn_c2] .rop-te.is-s .rop-rs').click()")); await pg.wait_for_timeout(300)
    rs = await pg.evaluate(J("return [...R.querySelectorAll('.rop-rspop .rop-mi')].map(x=>[x.textContent.trim(), x.querySelector('.rop-dot').style.background])"))
    ok(len(rs) >= 5 and all(c.startswith("var(--rc-") or c.startswith("var(--") for _, c in rs), "start reasons with color dots: " + ", ".join(r[0] for r in rs))
    await pg.screenshot(path=os.path.join(OUT, "d_reason.png"))
    await pg.evaluate(J("[...R.querySelectorAll('.rop-rspop .rop-mi')].find(x=>/^Diagnos/.test(x.textContent.trim())).click()")); await pg.wait_for_timeout(400)
    ok(await pg.evaluate(P("pn_c2") + ".startReason") == "Diagnosing", "start reason changed to Diagnosing")
    lc2 = await pg.evaluate(J("return R.querySelector('.rop-tp[data-pid=pn_c2]').style.getPropertyValue('--lc')"))
    ok(lc2 == "var(--rc-diag)", "the line takes the new color")
    await undo(pg); ok(await pg.evaluate(P("pn_c2") + ".startReason") == "Repairing", "Undo puts the reason back")
    # a stop reason
    await pg.evaluate(J("R.querySelector('.rop-tp[data-pid=pn_c2] .rop-te.is-e .rop-rs').click()")); await pg.wait_for_timeout(300)
    await pg.evaluate(J("[...R.querySelectorAll('.rop-rspop .rop-mi')].find(x=>/Waiting – Approval/.test(x.textContent)).click()")); await pg.wait_for_timeout(400)
    ok(await pg.evaluate(P("pn_c2") + ".stopReason") == "Waiting – Approval", "stop reason changed")
    # a note on a punch
    await pg.evaluate(J("R.querySelector('.rop-tp[data-pid=pn_c3] .rop-ttools .rop-ib').click()")); await pg.wait_for_timeout(300)
    nin = await pg.query_selector(".rop-nin")
    ok(nin is not None, "note icon opens a note line on the punch")
    if nin:
        await nin.type("Road tested, all good"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        ok("Road tested, all good" in (await pg.evaluate(P("pn_c3") + ".notes") or ""), "note saved in the punch")
    # delete a punch at once, Undo
    n0 = await pg.evaluate("__tg.STATE().punches.length")
    await pg.hover(".rop-tp[data-pid=pn_c3] .rop-te.is-s"); await pg.wait_for_timeout(200)
    trash_op = await pg.evaluate(J("return getComputedStyle(R.querySelector('.rop-tp[data-pid=pn_c3] .rop-ttools')).opacity"))
    ok(trash_op == "1", "trash shows on hover")
    await pg.screenshot(path=os.path.join(OUT, "d_hover.png"))
    await pg.evaluate(J("R.querySelector('.rop-tp[data-pid=pn_c3] .rop-ttools .is-dng').click()")); await pg.wait_for_timeout(400)
    ok(await pg.evaluate("__tg.STATE().punches.length") == n0 - 1 and "deleted" in (await pg.evaluate(TOAST)), "punch deleted at once: " + (await pg.evaluate(TOAST))[:50])
    await undo(pg); ok(await pg.evaluate("__tg.STATE().punches.length") == n0, "Undo brings the punch back")
    # + between punches: a time entry, prefilled between its neighbours
    await pg.evaluate(J("R.querySelector('.rop-addb').click()")); await pg.wait_for_timeout(300)
    f = await pg.evaluate(J("const f=R.querySelector('.rop-tl .rop-tf'); return f ? [...f.querySelectorAll('input,select')].map(i=>i.value) : null"))
    print("form:", f); ok(f is not None and f[1] == "08:10" and f[3] == "09:00", "a + opens the form in place, prefilled between its neighbours")
    await pg.screenshot(path=os.path.join(OUT, "d_addform.png"))
    await pg.evaluate(J("const f=R.querySelector('.rop-tf'); const i=f.querySelectorAll('input'); i[1].value='08:20'; i[2].value='08:50'; [...f.querySelectorAll('.px-btn')].pop().click();")); await pg.wait_for_timeout(400)
    ok(await pg.evaluate("__tg.STATE().punches.length") == n0 + 1 and "added" in (await pg.evaluate(TOAST)), "time entry added: " + (await pg.evaluate(TOAST))[:50])
    ok(await pg.evaluate(J("return R.querySelectorAll('.rop-tp').length")) == 4, "4 punches now")
    # the tab's clock icon: a time entry at the end
    await pg.evaluate(J("R.querySelector('.rop-tabrow .rop-tacts .rop-ib').click()")); await pg.wait_for_timeout(300)
    ok(await pg.evaluate(J("const f=R.querySelector('.rop-tl > .rop-tf'); return !!f && f === R.querySelector('.rop-tl').lastElementChild")), "the header icon opens a time entry at the end")
    await pg.evaluate(J("const f=R.querySelector('.rop-tf'); f.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));")); await pg.wait_for_timeout(300)
    ok(not await pg.evaluate(J("return !!R.querySelector('.rop-tf')")), "Escape closes it")
    # ---------- Parts ----------
    await tab(pg, "parts")
    pa = await pg.evaluate(J("return [...R.querySelectorAll('.rop-tabrow .rop-tacts .rop-ib')].map(x=>x.getAttribute('aria-label')+'/'+x.title)"))
    ok(pa == ["Add part/Add part", "From inventory…/From inventory…", "Extract from a quote…/Extract from a quote…"], "Parts tab actions: " + str(pa))
    ok(not await pg.evaluate(J("return [...R.querySelectorAll('.px-optabs .px-add')].length")), "no word links left in the Parts pane")
    np0 = await pg.evaluate(f"__tg.getRO('{rid}').operations[0].parts.length")
    await pg.evaluate(J("R.querySelector('.rop-tabrow .rop-tacts .rop-ib').click()")); await pg.wait_for_timeout(300)
    pin = await pg.query_selector(".rop-padd")
    ok(pin is not None, "Add part opens the quick add line")
    if pin:
        await pin.type("4988201 x2 brake chamber $45.99"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(f"__tg.getRO('{rid}').operations[0].parts.length") == np0 + 1, "part added: " + (await pg.evaluate(TOAST))[:40])
        ok(await pg.evaluate(J("return !!R.querySelector('.rop-padd')")), "the line stays open for the next part")
    await pg.screenshot(path=os.path.join(OUT, "d_parts.png"))
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
    # ---------- Files ----------
    await tab(pg, "files")
    fa = await pg.evaluate(J("return [...R.querySelectorAll('.rop-tabrow .rop-tacts .rop-ib')].map(x=>x.getAttribute('aria-label'))"))
    ok(fa == ["Upload", "Take a photo", "Paste a screenshot"], "Files tab actions: " + str(fa))
    nf0 = await pg.evaluate(J("return R.querySelectorAll('.px-li--file').length"))
    png = os.path.join(OUT, "_dot.png")
    if not os.path.exists(png):
        import base64; open(png, "wb").write(base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="))
    inp = await pg.query_selector(".rop-tacts input[type=file][multiple]")
    await inp.set_input_files(png); await pg.wait_for_timeout(1200)
    nf1 = await pg.evaluate(J("return R.querySelectorAll('.px-li--file').length"))
    ok(nf1 == nf0 + 1, "Upload attaches to the operation (%d -> %d) %s" % (nf0, nf1, (await pg.evaluate(TOAST))[:40]))
    cap = await pg.evaluate(J("const i=R.querySelector('.rop-tacts input[capture]'); return i ? i.accept + '/' + i.getAttribute('capture') : null"))
    ok(cap == "image/*/environment", "Take a photo uses the camera input")
    await pg.screenshot(path=os.path.join(OUT, "d_files.png"))
    # ---------- the word links elsewhere ----------
    w = await pg.evaluate(J("return [...R.querySelectorAll('.px-add, .px-link')].filter(x=>x.offsetParent).map(x=>x.textContent.trim())"))
    ok(not w, "no word links left on the RO page: " + str(w))
    ib = await pg.evaluate(J("return [...R.querySelectorAll('.rop-ib')].filter(x=>!x.title || !x.getAttribute('aria-label')).length"))
    ok(ib == 0, "every icon button has a title and an aria-label")
    await tab(pg, "time")
    keep = await pg.evaluate(J("return [...R.querySelectorAll('.rop-acts .px-btn, .px-notecomp .px-btn')].map(x=>x.textContent.trim())"))
    ok(any(k.startswith("Start") or k.startswith("Stop") for k in keep) and "Save" in keep, "Start / Stop and Save keep their words: " + str(keep))
    # double-click the title renames
    await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t').dispatchEvent(new MouseEvent('dblclick',{{bubbles:true}}))")); await pg.wait_for_timeout(300)
    ren = await pg.query_selector(".rop-ren")
    ok(ren is not None, "double-click the title: rename in place")
    if ren:
        await ren.fill("Air leak at the rear axle"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(f"__tg.getRO('{rid}').operations[0].complaint") == "Air leak at the rear axle", "renamed")
    # ---------- the four themes ----------
    await tab(pg, "time")
    for th in ["ivl", "ivd", "vvl", "vvd"]:
        await pg.evaluate(f"__tg.applyTheme('{th}'); __tg.render()"); await pg.wait_for_timeout(500)
        await pg.evaluate(J("const m=R.querySelector('.px-ro__main'); const r=R.querySelector('.px-row.is-on'); if(m&&r) m.scrollTop=r.offsetTop-40;")); await pg.wait_for_timeout(200)
        c = await pg.evaluate(J("const s=R.querySelector('.rop-dsg'), t=R.querySelector('.rop-rs'), j=R.querySelector('.rop-jt'); return [getComputedStyle(s).backgroundColor, getComputedStyle(t).color, getComputedStyle(j).color, getComputedStyle(R.querySelector('.rop-te > i')).backgroundColor]"))
        print(th, c)
        await pg.screenshot(path=os.path.join(OUT, "d_theme_" + th + ".png"))
    await pg.evaluate("__tg.applyTheme('ivl'); __tg.render()")
    hs = await pg.evaluate("document.documentElement.scrollWidth > innerWidth")
    ok(not hs, "no horizontal page scroll at 1440")
    ok(not errs, "no console errors (desktop): " + str(errs[:4]))
    await b.close()

async def phone(p):
    b, pg, errs = await setup(p, 390, 844, True)
    rid, op = await pg.evaluate(PREP)
    await openro(pg, rid, op)
    await tab(pg, "time")
    await pg.evaluate(J("const r=R.querySelector('.px-row.is-on'); r && r.scrollIntoView({block:'start'});")); await pg.wait_for_timeout(300)
    await pg.screenshot(path=os.path.join(OUT, "p_time.png"))
    over = await pg.evaluate(J("const out=[]; R.querySelectorAll('.px-row, .rop-tp, .rop-tabrow, .rop-dbar, .px-op').forEach(x=>{ const r=x.getBoundingClientRect(); if(r.right > innerWidth+1 || x.scrollWidth > x.clientWidth+2) out.push(x.className.slice(0,40)+':'+Math.round(r.right)+'/'+x.scrollWidth+'>'+x.clientWidth); }); return out;"))
    ok(not over, "phone: nothing wider than the screen " + str(over[:6]))
    ok(not await pg.evaluate("document.documentElement.scrollWidth > innerWidth"), "phone: no horizontal page scroll")
    row = await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"]'); const b=r.getBoundingClientRect(); return [Math.round(b.height), getComputedStyle(r.querySelector('.rop-ttools')||r).opacity, [...r.children].map(c=>String(c.getAttribute('class')||'').split(' ')[0]+':'+Math.round(c.getBoundingClientRect().top-b.top))]"))
    print("phone row:", row)
    tool = await pg.evaluate(J("return getComputedStyle(R.querySelector('.rop-ttools')).opacity"))
    ok(float(tool) > 0.5, "phone: punch tools visible without hover")
    # tap a time, edit
    await pg.evaluate(J("R.querySelector('.rop-tp .rop-te.is-s .rop-tm').click()")); await pg.wait_for_timeout(300)
    ok(await pg.evaluate(J("return !!R.querySelector('.rop-tin')")), "phone: a tap on a time edits it")
    await pg.evaluate(J("const i=R.querySelector('.rop-tin'); i.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));")); await pg.wait_for_timeout(300)
    await pg.evaluate(J("R.querySelector('.rop-addb').click()")); await pg.wait_for_timeout(300)
    await pg.evaluate(J("const f=R.querySelector('.rop-tf'); f && f.scrollIntoView({block:'center'});")); await pg.wait_for_timeout(200)
    await pg.screenshot(path=os.path.join(OUT, "p_addform.png"))
    fw = await pg.evaluate(J("const f=R.querySelector('.rop-tf'); return f ? Math.round(f.getBoundingClientRect().right) : null"))
    ok(fw is not None and fw <= 390, "phone: the time entry form fits (%s)" % fw)
    await pg.evaluate(J("const f=R.querySelector('.rop-tf'); f.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));")); await pg.wait_for_timeout(300)
    for k in ["parts", "files"]:
        await tab(pg, k); await pg.evaluate(J("const r=R.querySelector('.px-row.is-on'); r && r.scrollIntoView({block:'start'});")); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "p_" + k + ".png"))
    await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op}\"] .rop-jt').click()")); await pg.wait_for_timeout(300)
    await pg.screenshot(path=os.path.join(OUT, "p_jobtype.png"))
    await pg.evaluate("window.scrollTo(0,0)"); await pg.evaluate(J("const m=R.querySelector('.px-ro'); m && m.scrollIntoView({block:'start'});")); await pg.wait_for_timeout(200)
    await pg.screenshot(path=os.path.join(OUT, "p_band.png"))
    for th in ["ivd", "vvd"]:
        await pg.evaluate(f"__tg.applyTheme('{th}'); __tg.render()"); await pg.wait_for_timeout(400)
        await tab(pg, "time"); await pg.evaluate(J("const r=R.querySelector('.px-row.is-on'); r && r.scrollIntoView({block:'start'});")); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "p_theme_" + th + ".png"))
    ok(not errs, "no console errors (phone): " + str(errs[:4]))
    await b.close()

async def main():
    async with async_playwright() as p:
        await desktop(p)
        await phone(p)
    print("\n%d failed" % len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
