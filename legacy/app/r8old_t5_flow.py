import asyncio, json, os, datetime
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
SEED = open(os.path.join(H, "t5_fm.py")).read().split('SEED = r"""')[1].split('"""')[0]
SH = os.path.join(H, "shots8r"); os.makedirs(SH, exist_ok=True)

SNAP = r"""(id=>{ const S=__tg.S(), r=S.ros.find(x=>x.id===id); if(!r) return null;
 return JSON.stringify({st:__tg.roStatus(r).status, loc:r.location, tech:r.assignedTech, route:r.route&&{to:r.route.to,who:r.route.who,state:r.route.state},
  rt:r.roadTest&&r.roadTest.result, qc:r.fmQc&&r.fmQc.s, hold:!!r.fmHold, cb:r.fmCb||null, ops:r.operations.length, appr:r.operations.map(o=>o.appr&&o.appr.s||'').join(','), dec:r.operations.map(o=>o.fmDec||'').join(','),
  q:r.fmQ||null, plan:r.fmPlan||null, punches:S.punches.filter(p=>p.roId===id).map(p=>[p.start&&p.start.slice(11,16),p.stop&&p.stop.slice(11,16)]).join(' ')}); })"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "ERR_TUNNEL" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.goto("file://" + H + "/t8.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(400)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='foreman'; U.modal=null; __tg.render();})()"); await pg.wait_for_timeout(300)
        ids = await pg.evaluate(SEED)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='foreman'; U.modal=null; U.toast=null; U.fmSel=null; U.fmView='floor'; __tg.render();})()"); await pg.wait_for_timeout(400)
        async def ui(js):
            await pg.evaluate("(()=>{const U=__tg.UI();" + js + ";__tg.fmNcClear();__tg.render();})()"); await pg.wait_for_timeout(200)
        async def key(k, wait=250):
            await pg.keyboard.press(k); await pg.wait_for_timeout(wait)
        snap = lambda i: pg.evaluate(SNAP + "('" + i + "')")
        res = []
        async def flow(name, rid, open_js=None, keys=("Enter", "Enter"), check=None, shot=None):
            await ui(f"U.fmSel='{rid}'; U.fmPop=null; U.toast=null")
            b0 = await snap(rid) if not rid.startswith("T:") else None
            if open_js: await ui(open_js)
            for k in keys: await key(k, 350)
            if shot: await pg.screenshot(path=f"{SH}/{shot}.png")
            pop = await pg.evaluate("(__tg.UI().fmPop||{}).type||null")
            toast = await pg.evaluate("(__tg.UI().toast||{}).msg||(document.querySelector('.toast,.tg-toast')||{}).textContent||''")
            a = await snap(rid) if not rid.startswith("T:") else None
            extra = await pg.evaluate(check) if check else None
            if b0 == a and not extra:
                res.append((name, False, True, pop, toast[:110], b0, a, extra, None)); await key("Escape"); await ui("U.fmPop=null"); return
            await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(200)
            u = await snap(rid) if not rid.startswith("T:") else None
            if u != b0 and b0 is not None:
                await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(200); u2 = await snap(rid)
                if u2 == b0: u = b0; toast = toast + "  [needed 2 undos]"
                else: await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(200)
            res.append((name, b0 != a or extra, (u == b0), pop, toast[:110], b0, a, extra, u))
            await key("Escape")
        await flow("stop clock", ids["stuck"])
        await flow("fix lunch", ids["lunch"])
        await flow("accept sent", ids["sent"], keys=("Enter",))
        await flow("decide quote", ids["wf"], keys=("Enter", "1", "Enter"))
        await flow("decide go-ahead", ids["wf"], keys=("Enter", "2", "Enter", "Enter"), check=f"(()=>{{const r=__tg.getRO('{ids['wf']}'); return JSON.stringify(r.operations.map(o=>[o.appr,o.fmDec,(o.parts||[]).map(p=>p.status+':'+p.eta)]))}})()")
        await flow("back again", ids["back"])
        await flow("rt fail redo", ids["rtfail"])
        await flow("qc pass", ids["qc"], keys=("Enter", "Enter"))
        await flow("assign check-in", ids["ck"])
        await flow("plan arrival", ids["arr"])
        await flow("bring in", ids["bring"])
        await flow("risk", ids["risk"])
        await flow("hold for parts", ids["wf"], open_js=f"__tg.fmOpenPop('hold','{ids['wf']}')", keys=("Enter",))
        await flow("give work", "T:" + ids["free"], check=f"(()=>JSON.stringify(__tg.S().ros.filter(r=>r.assignedTech==='{ids['free']}').map(r=>[r.roNumber,r.location,r.fmQ||0])))()")
        await flow("plan together", ids["ck"], keys=("p", "Enter"), check="(()=>JSON.stringify(__tg.S().ros.filter(r=>r.fmPlan).map(r=>[r.roNumber,r.assignedTech,r.fmPlan.bay])))()")
        for r in res:
            print(("OK  " if r[1] and r[2] else "FAIL") + f" {r[0]:<16} changed={bool(r[1])} undone={r[2]} pop={r[3]} toast={r[4]!r}")
            if not (r[1] and r[2]) or os.environ.get("V"): print("     before", r[5]); print("     after ", r[6]); print("     extra ", r[7]); print("     undo  ", r[8])
        # fill a free bay by click
        fb = await pg.query_selector(".fm-bay.free.fill")
        bay = await fb.get_attribute("data-bay"); await fb.click(); await pg.wait_for_timeout(300)
        pick = await pg.evaluate("JSON.stringify(__tg.UI().fmPop)"); await key("Enter", 400)
        print("fill", bay, pick[:160], "->", await pg.evaluate(f"(()=>{{const r=__tg.S().ros.find(x=>x.location==='{bay}'); return r? r.roNumber+' '+r.assignedTech : 'nothing'}})()"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(200)
        print("  after undo:", await pg.evaluate(f"(()=>{{const r=__tg.S().ros.find(x=>x.location==='{bay}'); return r? r.roNumber : 'empty'}})()"))
        # tomorrow: plan the rest, then send the note
        await ui("U.fmView='tmr'");
        await pg.evaluate("document.querySelector(\"[data-action=fm-tmauto]\")?.click()"); await pg.wait_for_timeout(300)
        print("tmr plan", await pg.evaluate("JSON.stringify(__tg.fmTmr().P)"))
        await pg.click("[data-action='fm-tmsend']"); await pg.wait_for_timeout(300)
        print("note", (await pg.evaluate("JSON.stringify(__tg.S().fmNote)"))[:300])
        # pretend it's tomorrow's Console for a tech
        await pg.evaluate("(()=>{const S=__tg.S(); S.fmNote.d=__tg.todayStr(); })()")
        me = await pg.evaluate("(()=>{const m=__tg.cxMe(); return m&&[m.name,m.role]})()")
        card = await pg.evaluate("__tg.fmConsoleCard()")
        print("cxMe", me, "card len", len(card), card[:200])
        await pg.evaluate("(()=>{const S=__tg.S(); S.techName='Luis Martinez'; const U=__tg.UI(); U.view='console'; __tg.render();})()"); await pg.wait_for_timeout(500)
        print("cxMe as Luis", await pg.evaluate("(()=>{const m=__tg.cxMe(); return m&&[m.name,m.role]})()"))
        await pg.screenshot(path=f"{SH}/e3_console_tech.png")
        await pg.evaluate("(()=>{const S=__tg.S(); S.techName=''; const U=__tg.UI(); U.view='foreman'; __tg.render();})()"); await pg.wait_for_timeout(300)
        # persistence: what the shop file carries and what UI keys persist
        print("UI_KEYS fm", [k for k in (await pg.evaluate("__tg.UI_KEYS")) if k.startswith("fm")])
        await pg.evaluate("__tg.render()")
        ls = await pg.evaluate("(()=>{ try{ const s=JSON.parse(localStorage.getItem('tec_state_v1')||'{}'); return [!!s.fmCfg, !!s.fmTmr, !!s.fmNote, Array.isArray(s.fmCleared)]; }catch(e){ return String(e) } })()")
        print("localStorage has fmCfg/fmTmr/fmNote/fmCleared:", ls)
        print("cleared today:", await pg.evaluate("__tg.fmClearedList().length"))
        # reload keeps the Foreman's settings, skills, the note, the view
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='foreman'; U.fmView='techs'; U.fmDay=true; __tg.render();})()")
        await pg.click("[data-action='fm-view'][data-v='techs']"); await pg.wait_for_timeout(1500)
        pre = await pg.evaluate("JSON.stringify([__tg.UI().fmView, Object.keys(__tg.S().fmCfg.bays||{}).length, (__tg.staffList().find(s=>s.name==='Luis Martinez')||{}).fmSkills, !!__tg.S().fmNote, __tg.S().fmTmr&&__tg.S().fmTmr.d])")
        await pg.reload(); await pg.wait_for_timeout(1800)
        post = await pg.evaluate("JSON.stringify([__tg.UI().fmView, Object.keys(__tg.S().fmCfg.bays||{}).length, (__tg.staffList().find(s=>s.name==='Luis Martinez')||{}).fmSkills, !!__tg.S().fmNote, __tg.S().fmTmr&&__tg.S().fmTmr.d])")
        print("reload before", pre); print("reload after ", post, "view", await pg.evaluate("__tg.UI().view"))
        await pg.screenshot(path=f"{SH}/e4_reload.png")
        print("errors:", errs[:20])
        await b.close()
asyncio.run(main())
