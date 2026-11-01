import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app"; OUT = os.path.join(H, "shots123b"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12b.html"
SIGN = """(()=>{ const T=__tg.staffList().filter(s=>s.role==='Technician'); const n=s=>__tg.STATE().ros.filter(r=>r.assignedTech===s.name).length; T.sort((a,b)=>n(b)-n(a)); localStorage.setItem('tec_viewas', T[0].id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.CX.U().skipMorning = __tg.todayStr(); __tg.render(); return T[0].name; })()"""
fails = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: fails.append(m)
Q = "[data-pg=tech] "
OP = Q + ".tch-o.open "
async def setup(p, w, h):
    b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": w, "height": h}, is_mobile=w < 600, has_touch=w < 600); pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
    await pg.route("**/fonts.g*/**", lambda r: r.abort())
    if w < 600: await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
    await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
    await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); me = await pg.evaluate(SIGN); await pg.wait_for_timeout(300)
    await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(700)
    return b, pg, errs, me
async def T(pg): return await pg.evaluate("(document.querySelector('.toast')||{}).textContent||''")
async def n(pg, sel): return await pg.evaluate(f"document.querySelectorAll({json.dumps(sel)}).length")
async def pick_ro(pg):
    # an RO of mine with an operation I can work on
    rid = await pg.evaluate("""(()=>{ const L=__tg.CX.tcRos(); const r=L.find(r=>r.ops && r.ops.some(o=>!o.other)) || L[0]; return r ? r.id : null; })()""")
    if rid: await pg.click(f'{Q}.tch-it[data-id="{rid}"]'); await pg.wait_for_timeout(400)
    return rid
async def main():
    async with async_playwright() as p:
        b, pg, errs, me = await setup(p, 1440, 900)
        print("signed in as", me)
        rid = await pick_ro(pg); print("ro:", rid)
        ok(await n(pg, OP) == 1, "an operation is open")
        # ---------- the operation header ----------
        hd = await pg.evaluate(f"""(()=>{{ const h=document.querySelector({json.dumps(OP + '.tch-oh')}); if(!h) return null; return {{ jt: !!h.querySelector('.tch-jt'), st: !!h.querySelector('.tch-stb'), more: !!h.querySelector('.tch-more'), hb: !!h.querySelector('.tch-hb'), oc: (h.querySelector('.tch-oc b')||{{}}).textContent }}; }})()""")
        print("header:", hd)
        ok(hd and hd["jt"] and hd["st"] and hd["more"], "header has job type, status and ⋯")
        ok(await n(pg, OP + ".tch-ob .cr-add") == 0 and await n(pg, OP + ".tch-ob .tch-chips .tch-stb") == 0, "no '+ code' or status line in the body")
        ok(await pg.evaluate(f"!document.querySelector({json.dumps(OP + '.tch-ob')}).textContent.includes('+ code')"), "no + code in the operation body")
        # the job type dropdown
        await pg.click(OP + ".tch-oh .tch-jt"); await pg.wait_for_timeout(300)
        jts = await pg.evaluate(f"[...document.querySelectorAll({json.dumps(Q + '.tch-mn .tch-mi')})].map(b=>b.textContent.trim())")
        print("job types:", jts)
        ok(jts == ["DIAG", "REPAIR", "PM", "WARR", "COMEBACK", "SUBLET", "RECALL"], "job type menu lists the seven types")
        await pg.screenshot(path=os.path.join(OUT, "a1_jobtype.png"))
        await pg.click(f'{Q}.tch-mn .tch-mi[data-v="PM"]'); await pg.wait_for_timeout(300)
        jt = await pg.evaluate(f"(document.querySelector({json.dumps(OP + '.tch-oh .tch-jt')})||{{}}).textContent")
        ok("PM" in (jt or "") and "PM now" in await T(pg), f"job type set to PM ({jt.strip() if jt else jt} | {(await T(pg))[:50]})")
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
        jt2 = await pg.evaluate(f"(document.querySelector({json.dumps(OP + '.tch-oh .tch-jt')})||{{}}).textContent"); ok("PM" not in (jt2 or ""), f"undo puts the job type back ({(jt2 or '').strip()})")
        # the status pill and ⋯
        st = await pg.query_selector(OP + ".tch-oh button.tch-stb")
        if st:
            await st.click(); await pg.wait_for_timeout(300)
            ok(await pg.evaluate("!!(__tg.CX.U().pop)"), "status pill opens its menu: " + str(await pg.evaluate("(__tg.CX.U().pop||{}).type")))
            await pg.screenshot(path=os.path.join(OUT, "a2_status.png")); await pg.keyboard.press("Escape"); await pg.mouse.click(5, 890); await pg.wait_for_timeout(200)
        await pg.click(OP + ".tch-oh .tch-more"); await pg.wait_for_timeout(300)
        mi = await pg.evaluate(f"[...document.querySelectorAll({json.dumps(Q + '.tch-mn .tg-mi')})].map(b=>b.textContent.trim())"); print("⋯ menu:", mi)
        ok(any("Delete operation" in x for x in mi) and any("Print" in x for x in mi), "⋯ menu has print and delete")
        await pg.screenshot(path=os.path.join(OUT, "a3_more.png"))
        await pg.click(f'{Q}.tch-mn [data-a="tomx"][data-v="del"]'); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("(__tg.CX.U().pop||{}).type") == "tsd", "Delete operation asks first")
        await pg.mouse.click(5, 890); await pg.wait_for_timeout(200)
        # ---------- the Time tab ----------
        acts = await pg.evaluate(f"[...document.querySelectorAll({json.dumps(OP + '.tch-tacts [data-tip]')})].map(b=>b.dataset.tip)"); print("time acts:", acts)
        ok(acts == ["Add time entry"], "Time tab: Add time entry at the right of the tabs")
        np0 = await pg.evaluate("__tg.STATE().punches.length")
        await pg.click(OP + '.tch-tacts [data-a="tnewp"]'); await pg.wait_for_timeout(300)
        ok(await n(pg, OP + ".tch-pf") == 1, "the header icon opens a new time entry in place")
        await pg.fill(OP + '.tch-pf [data-k="s"]', "07:00"); await pg.fill(OP + '.tch-pf [data-k="e"]', "08:10")
        await pg.select_option(OP + '.tch-pf [data-k="sr"]', "Diagnosing"); await pg.select_option(OP + '.tch-pf [data-k="er"]', "Lunch")
        await pg.screenshot(path=os.path.join(OUT, "b1_newentry.png"))
        await pg.click(OP + '.tch-pf [data-a="tnpok"]'); await pg.wait_for_timeout(400)
        np1 = await pg.evaluate("__tg.STATE().punches.length"); ok(np1 == np0 + 1, f"time entry added ({np0}→{np1}) | {(await T(pg))[:60]}")
        # a second one, later, so a + shows between them
        await pg.click(OP + '.tch-tacts [data-a="tnewp"]'); await pg.wait_for_timeout(300)
        await pg.fill(OP + '.tch-pf [data-k="s"]', "09:00"); await pg.fill(OP + '.tch-pf [data-k="e"]', "10:30"); await pg.select_option(OP + '.tch-pf [data-k="sr"]', "Repairing"); await pg.select_option(OP + '.tch-pf [data-k="er"]', "Switched job")
        await pg.press(OP + '.tch-pf [data-k="e"]', "Enter"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("__tg.STATE().punches.length") == np1 + 1, "Enter saves a time entry too")
        tl = await pg.evaluate(f"""[...document.querySelectorAll({json.dumps(OP + '.tch-tp')})].map(p=>({{ lc: p.style.getPropertyValue('--lc'), ec: p.style.getPropertyValue('--ec'), dot: getComputedStyle(p.querySelector('.tch-te.s > i')).backgroundColor, ring: getComputedStyle(p.querySelector('.tch-te.e > i')).boxShadow.slice(0,40), rail: getComputedStyle(p, '::before').backgroundColor, rs: [...p.querySelectorAll('.tch-rs')].map(x=>x.textContent.trim()) }}))""")
        for x in tl: print("  punch:", x)
        ok(len(tl) >= 2 and all(x["lc"] for x in tl), "each punch carries its reason colors")
        ok(any(x["rs"][:1] == ["Diagnosing"] for x in tl), "the reason chip says the reason")
        ok(all(x["dot"] not in ("rgba(0, 0, 0, 0)", "") for x in tl) and len(set(x["rail"] for x in tl)) >= 2, "start dots filled, rails in different colors")
        db = await pg.evaluate(f"[...document.querySelectorAll({json.dumps(OP + '.tch-dbs')})].map(s=>getComputedStyle(s).backgroundColor)"); print("day bar:", db)
        ok(len(db) >= 2 and len(set(db)) >= 2, "the day bar is in the same colors")
        ok(await n(pg, OP + ".tch-legend,.legend") == 0, "no legend")
        ok(await n(pg, OP + ".tch-tadd") >= 1, "a + between punches")
        await pg.hover(OP + ".tch-tl"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "b2_time.png"))
        # change a time in place
        pid = await pg.evaluate(f"(()=>{{ const b=[...document.querySelectorAll({json.dumps(OP + '.tch-tmb[data-f=s]')})].find(b=>b.textContent.includes('7:00')||b.textContent.includes('07:00')); return b ? b.dataset.p : null; }})()")
        print("punch at 7:00:", pid)
        if pid:
            await pg.click(f'{OP}.tch-tmb[data-p="{pid}"][data-f="s"]'); await pg.wait_for_timeout(250)
            ok(await pg.evaluate("document.activeElement && document.activeElement.dataset.in") == "ttime", "clicking a time opens it for typing")
            await pg.screenshot(path=os.path.join(OUT, "b3_edittime.png"))
            await pg.fill(f'{OP}[data-in="ttime"]', "07:15"); await pg.press(f'{OP}[data-in="ttime"]', "Enter"); await pg.wait_for_timeout(400)
            v = await pg.evaluate(f"(()=>{{ const p=__tg.STATE().punches.find(x=>x.id==='{pid}'); const d=new Date(p.start); return d.getHours()+':'+d.getMinutes(); }})()")
            ok(v == "7:15", f"start time changed to {v} | {(await T(pg))[:70]}")
            ok(await n(pg, ".toast button,.toast [data-a]") >= 1 or "Undo" in await T(pg), "the toast has Undo")
            await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
            v = await pg.evaluate(f"(()=>{{ const p=__tg.STATE().punches.find(x=>x.id==='{pid}'); const d=new Date(p.start); return d.getHours()+':'+d.getMinutes(); }})()"); ok(v == "7:0", f"undo puts the time back ({v})")
            # blur saves too
            await pg.click(f'{OP}.tch-tmb[data-p="{pid}"][data-f="e"]'); await pg.wait_for_timeout(250)
            await pg.fill(f'{OP}[data-in="ttime"]', "08:20"); await pg.click(OP + ".ock-lbl"); await pg.wait_for_timeout(400)
            v = await pg.evaluate(f"(()=>{{ const p=__tg.STATE().punches.find(x=>x.id==='{pid}'); const d=new Date(p.stop); return d.getHours()+':'+d.getMinutes(); }})()"); ok(v == "8:20", f"leaving the box saves the stop time ({v})")
            # change a reason
            await pg.click(f'{OP}.tch-rs[data-p="{pid}"][data-f="s"]'); await pg.wait_for_timeout(300)
            L = await pg.evaluate(f"[...document.querySelectorAll({json.dumps(Q + '.tch-mn .tch-mi')})].map(b=>b.textContent.trim())"); print("start reasons:", L)
            ok(len(L) >= 3 and "Diagnosing" in L, "the reason chip opens the start reasons")
            await pg.screenshot(path=os.path.join(OUT, "b4_reason.png"))
            await pg.click(f'{Q}.tch-mn .tch-mi[data-v="Testing"]'); await pg.wait_for_timeout(300)
            r = await pg.evaluate(f"__tg.STATE().punches.find(x=>x.id==='{pid}').startReason"); ok(r == "Testing", f"start reason now {r}")
            lc = await pg.evaluate(f"document.querySelector({json.dumps(OP)} + ' .tch-tmb[data-p=\"{pid}\"]').closest('.tch-tp').style.getPropertyValue('--lc')"); ok("test" in lc, f"the line follows the new reason ({lc})")
            await pg.click(f'{OP}.tch-rs[data-p="{pid}"][data-f="e"]'); await pg.wait_for_timeout(300)
            L = await pg.evaluate(f"[...document.querySelectorAll({json.dumps(Q + '.tch-mn .tch-mi')})].map(b=>b.textContent.trim())"); print("stop reasons:", L)
            ok("Lunch" in L and "End of day" in L and "Switched job" in L, "the stop chip opens the stop reasons")
            await pg.mouse.click(5, 890); await pg.wait_for_timeout(200)
            # a note on the punch
            await pg.hover(f'{OP}.tch-tmb[data-p="{pid}"]'); await pg.click(f'{OP}[data-a="tpn"][data-p="{pid}"]'); await pg.wait_for_timeout(250)
            await pg.fill(f'{OP}[data-in="tpnote"]', "checked the harness at the sensor"); await pg.press(f'{OP}[data-in="tpnote"]', "Enter"); await pg.wait_for_timeout(300)
            nt = await pg.evaluate(f"__tg.STATE().punches.find(x=>x.id==='{pid}').notes||''"); ok("harness" in nt, f"note on the punch: {nt[-50:]!r}")
            # delete a punch: gone at once, Undo in the toast
            await pg.hover(f'{OP}.tch-tmb[data-p="{pid}"]'); await pg.wait_for_timeout(150)
            vis = await pg.evaluate(f"getComputedStyle(document.querySelector({json.dumps(OP)} + ' [data-a=tdel][data-p=\"{pid}\"]').parentNode).opacity"); ok(vis == "1", f"the trash shows on hover ({vis})")
            c0 = await pg.evaluate("__tg.STATE().punches.length")
            await pg.click(f'{OP}[data-a="tdel"][data-p="{pid}"]'); await pg.wait_for_timeout(400)
            c1 = await pg.evaluate("__tg.STATE().punches.length"); ok(c1 == c0 - 1 and "deleted" in await T(pg), f"punch deleted at once ({c0}→{c1}) | {(await T(pg))[:50]}")
            await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
            ok(await pg.evaluate("__tg.STATE().punches.length") == c0, "undo brings it back")
        # + between punches
        if await n(pg, OP + ".tch-tadd"):
            await pg.hover(OP + ".tch-tl"); await pg.click(OP + ".tch-tadd >> nth=0"); await pg.wait_for_timeout(300)
            pf = await pg.evaluate(f"(()=>{{ const f=document.querySelector({json.dumps(OP + '.tch-pf')}); if(!f) return null; return [f.querySelector('[data-k=s]').value, f.querySelector('[data-k=e]').value, !!(f.previousElementSibling && f.previousElementSibling.classList.contains('tch-tp'))]; }})()")
            ok(pf is not None and pf[2], f"+ opens the entry between the punches, prefilled {pf}")
            await pg.screenshot(path=os.path.join(OUT, "b5_between.png"))
            await pg.click(OP + '.tch-pf [data-a="tnpx"]'); await pg.wait_for_timeout(200); ok(await n(pg, OP + ".tch-pf") == 0, "Cancel closes it")
        # ---------- the other tabs ----------
        await pg.click(OP + '[data-a="ttab"][data-v="parts"]'); await pg.wait_for_timeout(250)
        acts = await pg.evaluate(f"[...document.querySelectorAll({json.dumps(OP + '.tch-tacts [data-tip]')})].map(b=>b.dataset.tip)"); print("parts acts:", acts)
        ok(acts in (["Ask Parts for a part"], []), "Parts tab: Ask Parts at the right")
        await pg.click(OP + '[data-a="ttab"][data-v="files"]'); await pg.wait_for_timeout(250)
        acts = await pg.evaluate(f"[...document.querySelectorAll({json.dumps(OP + '.tch-tacts [data-tip]')})].map(b=>b.dataset.tip)"); print("files acts:", acts)
        ok(acts == ["Upload", "Take a photo", "Paste a screenshot"], "Files tab: Upload, Take a photo, Paste a screenshot")
        await pg.screenshot(path=os.path.join(OUT, "c1_files.png"))
        async with pg.expect_file_chooser() as fc:
            await pg.click(OP + '.tch-tacts [data-cam="1"]')
        ch = await fc.value; ok((await ch.element.get_attribute("accept")) == "image/*", "Take a photo opens the picker for pictures (accept=" + str(await ch.element.get_attribute("accept")) + ")")
        await pg.click(OP + '.tch-tacts [data-a="tpaste"]'); await pg.wait_for_timeout(300); print("paste:", (await T(pg))[:80])
        # a screenshot pasted with Ctrl V
        k0 = await n(pg, OP + ".tch-fl")
        await pg.evaluate("""(()=>{ const c=document.createElement('canvas'); c.width=40; c.height=30; const x=c.getContext('2d'); x.fillStyle='#c33'; x.fillRect(0,0,40,30); return new Promise(res=>c.toBlob(bl=>{ const dt=new DataTransfer(); dt.items.add(new File([bl],'shot.png',{type:'image/png'})); const ev=new ClipboardEvent('paste',{clipboardData:dt,bubbles:true}); document.body.dispatchEvent(ev); res(1); },'image/png')); })()""")
        await pg.wait_for_timeout(1200); k1 = await n(pg, OP + ".tch-fl"); ok(k1 == k0 + 1, f"Ctrl V adds the screenshot ({k0}→{k1}) | {(await T(pg))[:60]}")
        await pg.click(OP + '[data-a="ttab"][data-v="time"]'); await pg.wait_for_timeout(250)
        # ---------- icons ----------
        words = await pg.evaluate(f"[...document.querySelectorAll({json.dumps(Q + '.tg-link,' + Q + '.tch-lk')})].map(b=>b.textContent.trim()).filter(Boolean)"); print("word links left:", words)
        icb = await pg.evaluate(f"[...document.querySelectorAll({json.dumps(Q + '.tch-icb')})].map(b=>b.dataset.tip)"); print("icon buttons:", icb)
        ok(await pg.evaluate(f"[...document.querySelectorAll({json.dumps(Q + '.tch-icb')})].every(b=>b.dataset.tip && b.getAttribute('aria-label'))"), "every icon button has its name for pointing and readers")
        await pg.hover(Q + ".tch-sech .tch-icb"); await pg.mouse.move(*(await pg.evaluate(f"(()=>{{ const r=document.querySelector({json.dumps(Q + '.tch-sech .tch-icb')}).getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]; }})()"))); await pg.wait_for_timeout(200)
        ok(await pg.evaluate("(()=>{ const t=document.getElementById('pg-tip'); return !!t && !t.hidden && t.textContent.length>0; })()"), "pointing at an icon shows its name")
        # ---------- the truck ----------
        band = await pg.evaluate(f"(()=>{{ const b=document.querySelector({json.dumps(Q + '.tch-k-band')}); return b ? b.innerText.slice(0,200) : ''; }})()"); print("band:", band.replace("\n", " | "))
        tline = await pg.evaluate("(()=>{ const r=__tg.CX.tcRos().find(x=>x.id==='" + str(rid) + "'); return r && typeof truckLine==='function' ? truckLine(r.ro) : (window.__tg.truckLine ? __tg.truckLine(__tg.getRO('" + str(rid) + "')) : null); })()")
        print("truckLine:", tline)
        if tline: ok(tline in band, "the truck line under the name")
        veh = await pg.evaluate(f"(()=>{{ const b=document.querySelector({json.dumps(Q + '.tch-k-vehicle')}); return b ? b.innerText : ''; }})()"); print("vehicle:", veh.replace("\n", " | ")[:300])
        ro = await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{rid}'); return {{ sleeper: r.sleeper||'', engine: r.engineType||'' }}; }})()"); print("ro fields:", ro)
        # a truck from the catalog: configuration, sleeper, engine
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{rid}'); r.year=2020; r.make='Volvo'; r.model='VNL 760'; r.axles='6x4'; r.cab='High-roof sleeper'; r.sleeper='70-inch'; r.engineType='D13 TC · 455 HP'; __tg.render(); }})()"); await pg.wait_for_timeout(300)
        veh = await pg.evaluate(f"(()=>{{ const b=document.querySelector({json.dumps(Q + '.tch-k-vehicle')}); return b ? b.innerText : ''; }})()"); print("vehicle (catalog truck):", veh.replace("\n", " | ")[:300])
        ok("Configuration" in veh and "6x4" in veh and "70-inch" in veh and "455 HP" in veh, "Vehicle: Configuration, Sleeper, Engine")
        band = await pg.evaluate(f"(()=>{{ const b=document.querySelector({json.dumps(Q + '.tch-k-band')}); return b ? b.innerText : ''; }})()"); tl2 = await pg.evaluate(f"__tg.truckLine(__tg.getRO('{rid}'))"); print("truck line:", tl2)
        ok(tl2 and tl2 in band, "the band shows the catalog truck line")
        await pg.screenshot(path=os.path.join(OUT, "d0_vehicle.png"))
        if ro["sleeper"]: ok("Sleeper" in veh, "Vehicle shows the sleeper")
        if ro["engine"]: ok("Engine" in veh, "Vehicle shows the engine")
        await pg.screenshot(path=os.path.join(OUT, "d1_desk.png"))
        await pg.screenshot(path=os.path.join(OUT, "d1_desk_full.png"), full_page=True)
        # ---------- an RO with several operations, all open ----------
        m = await pg.evaluate("(()=>{ const L=__tg.CX.tcRos().filter(r=>(r.ro.operations||[]).length>2); return L.length ? L[0].id : null; })()")
        if m:
            await pg.click(f'{Q}.tch-it[data-id="{m}"]'); await pg.wait_for_timeout(300)
            await pg.screenshot(path=os.path.join(OUT, "d2_multi.png"))
        # ---------- the four themes ----------
        await pg.click(f'{Q}.tch-it[data-id="{rid}"]'); await pg.wait_for_timeout(300)
        for th in ["ivl", "ivd", "vvl", "vvd"]:
            await pg.evaluate(f"__tg.applyTheme('{th}')"); await pg.wait_for_timeout(500)
            await pg.screenshot(path=os.path.join(OUT, f"e_{th}.png"))
        await pg.evaluate("__tg.applyTheme('ivl')")
        # a narrower window
        await pg.set_viewport_size({"width": 1180, "height": 860}); await pg.wait_for_timeout(400); await pg.screenshot(path=os.path.join(OUT, "f1_1180.png"))
        ok(not errs, "desktop: no console errors " + json.dumps(errs[:5]))
        await b.close()
        # ---------- the phone ----------
        b, pg, errs, me = await setup(p, 390, 844)
        rid = await pick_ro(pg); await pg.wait_for_timeout(300)
        ok(await n(pg, OP) == 1, "phone: an operation is open")
        ov = await pg.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"); ok(ov, "phone: no sideways scroll")
        await pg.evaluate(f"(()=>{{ const e=document.querySelector({json.dumps(OP + '.tch-oh')}); if(e) e.scrollIntoView({{block:'start'}}); }})()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "g1_phone.png"))
        hdr = await pg.evaluate(f"(()=>{{ const h=document.querySelector({json.dumps(OP + '.tch-oh')}); const r=h.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), [...h.children].filter(c=>getComputedStyle(c).display!=='none').map(c=>c.className.split(' ')[0]+':'+Math.round(c.getBoundingClientRect().right))]; }})()"); print("phone header:", hdr)
        ok(all(int(x.split(":")[1]) <= 392 for x in hdr[2]), "phone: the header fits")
        await pg.click(OP + '.tch-tacts [data-a="tnewp"]'); await pg.wait_for_timeout(300)
        await pg.evaluate(f"document.querySelector({json.dumps(OP + '.tch-pf')}).scrollIntoView({{block:'center'}})"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "g2_phone_new.png"))
        await pg.fill(OP + '.tch-pf [data-k="s"]', "07:00"); await pg.fill(OP + '.tch-pf [data-k="e"]', "07:40"); await pg.click(OP + '.tch-pf [data-a="tnpok"]'); await pg.wait_for_timeout(400)
        await pg.evaluate(f"(()=>{{ const e=document.querySelector({json.dumps(OP + '.tch-tabs')}); if(e) e.scrollIntoView({{block:'start'}}); }})()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "g3_phone_time.png"))
        tools = await pg.evaluate(f"[...document.querySelectorAll({json.dumps(OP + '.tch-ttl')})].map(t=>getComputedStyle(t).opacity)"); ok(all(x == "1" for x in tools), f"phone: punch tools in sight {tools}")
        for th in ["ivd", "vvl"]:
            await pg.evaluate(f"__tg.applyTheme('{th}')"); await pg.wait_for_timeout(400); await pg.screenshot(path=os.path.join(OUT, f"g4_phone_{th}.png"))
        ok(not errs, "phone: no console errors " + json.dumps(errs[:5]))
        await b.close()
    print("\nFAILS:", len(fails)); [print("  -", f) for f in fails]
asyncio.run(main())
