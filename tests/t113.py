import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots113"); os.makedirs(OUT, exist_ok=True)
NAV = "[...document.querySelectorAll('.pxr-nav .pxr-row')].map(r=>r.textContent.trim().replace(/\\d+$/,'')).join(', ')"
SR = "document.querySelector('.jc-host') && document.querySelector('.jc-host').shadowRoot"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":1440,"height":900}); pg = await ctx.new_page(); pg.set_default_timeout(6000); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t11.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        T = lambda: pg.evaluate("(document.querySelector('.toast')||{}).textContent||''")
        # ---------- a: the admin gets the Technician page ----------
        print("admin nav:", await pg.evaluate(NAV))
        await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(600)
        print("view:", await pg.evaluate("__tg.UI().view"), "| head:", await pg.evaluate("(document.querySelector('[data-pg=tech] .tg-head')||{}).textContent"))
        print("items:", await pg.evaluate("document.querySelectorAll('[data-pg=tech] .tch-it').length"), "view class:", await pg.evaluate("!!document.querySelector('.tch-view')"))
        print("clock buttons:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] [data-a=startid],[data-pg=tech] [data-a=stop],[data-pg=tech] [data-a=done],[data-pg=tech] [data-a=cin],[data-pg=tech] [data-a=morning]')].length"))
        await pg.screenshot(path=os.path.join(OUT, "a_admin.png"))
        await pg.click('[data-pg="tech"] .tch-as'); await pg.wait_for_timeout(300)
        print("picker:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-asp .tg-mi')].map(b=>b.textContent.trim()).join(' | ')"))
        await pg.screenshot(path=os.path.join(OUT, "a_picker.png"))
        nm = await pg.evaluate("(()=>{ const L=[...document.querySelectorAll('[data-pg=tech] .tch-asp .tg-mi')]; const b=L.find(x=>!x.classList.contains('on')); return b ? b.dataset.n : null; })()")
        await pg.click(f'[data-pg="tech"] .tch-asp .tg-mi[data-n="{nm}"]'); await pg.wait_for_timeout(500)
        print("picked:", nm, "->", await pg.evaluate("__tg.CX.S().me"), "items:", await pg.evaluate("document.querySelectorAll('[data-pg=tech] .tch-it').length"), "ls:", await pg.evaluate("localStorage.getItem('tec_tech_as')"))
        # keys don't start the clock
        n0 = await pg.evaluate("__tg.STATE().punches.length")
        await pg.mouse.click(900, 70); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300); await pg.keyboard.press("s"); await pg.wait_for_timeout(300)
        print("punches before/after keys:", n0, await pg.evaluate("__tg.STATE().punches.length"), "| running by:", await pg.evaluate("(()=>{ const r=__tg.runningPunch(); return r ? r.by : null; })()"))
        await pg.evaluate("(()=>{ const b=document.querySelector('[data-pg=tech] [data-a=tsel]:not(.on)'); if(b) b.click(); })()"); await pg.wait_for_timeout(300)
        # a note still works for the admin
        ni = await pg.query_selector('[data-pg="tech"] [data-in="tnote"]')
        print("note box:", bool(ni))
        await pg.screenshot(path=os.path.join(OUT, "a_admin2.png"))
        # ---------- b: RO numbers ----------
        print("tech list nos:", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-it .tg-no')].slice(0,5).map(x=>x.textContent).join(' ')"), "| band:", await pg.evaluate("(document.querySelector('[data-pg=tech] .tch-eb .tg-no')||{}).textContent"))
        await pg.evaluate("__tg.PG.go('rolist')"); await pg.wait_for_timeout(500)
        print("ro list nos:", await pg.evaluate("[...document.querySelectorAll('.rq-no')].slice(0,6).map(x=>x.textContent.trim()).join(' ')"))
        await pg.screenshot(path=os.path.join(OUT, "b_rolist.png"))
        await pg.evaluate("__tg.PG.go('foreman')"); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{ const b=document.querySelector('.tg-it[data-action=fm-sel], .tg-it[data-ro]'); if(b) b.click(); })()"); await pg.wait_for_timeout(400)
        print("foreman rows:", await pg.evaluate("[...document.querySelectorAll('[data-pg] .tg-no, .fm .tg-no')].slice(0,6).map(x=>x.textContent.trim()).join(' ')"), "| top:", await pg.evaluate("(document.querySelector('.tg-top .tg-no')||{}).textContent"))
        await pg.screenshot(path=os.path.join(OUT, "b_foreman.png"))
        await pg.evaluate("__tg.PG.go('triage')"); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{ const b=document.querySelector('.tg-it[data-action=tg-sel], .tg-it[data-ro]'); if(b) b.click(); })()"); await pg.wait_for_timeout(400)
        print("triage dock:", await pg.evaluate("(document.querySelector('.tg-dkh .tg-no')||{}).textContent"), "| rows:", await pg.evaluate("[...document.querySelectorAll('.tg-it .tg-no')].slice(0,5).map(x=>x.textContent.trim()).join(' ')"))
        await pg.screenshot(path=os.path.join(OUT, "b_triage.png"))
        for v in ["parts", "warranty", "career", "manager", "inbox", "timelog", "fixes"]:
            await pg.evaluate(f"__tg.PG.go('{v}')"); await pg.wait_for_timeout(450)
            print(v, ":", await pg.evaluate("[...document.querySelectorAll('.tg-no')].slice(0,4).map(x=>x.textContent.trim()).join(' ')"), "| top:", await pg.evaluate("(document.querySelector('.tg-top .tg-no')||{}).textContent"))
        await pg.evaluate("__tg.PG.go('parts')"); await pg.wait_for_timeout(400); await pg.screenshot(path=os.path.join(OUT, "b_parts.png"))
        # search finds by last 4 and by the full number
        r0 = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(x=>!x.shop && x.id!=='shop'); return [r.id, r.roNumber]; })()")
        print("ro:", r0)
        # ---------- c: the RO page ----------
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{r0[0]}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        print("ro page id:", await pg.evaluate(f"(()=>{{ const R={SR}; return R ? [...R.querySelectorAll('.px-id')].map(x=>x.textContent).join(' | ') : 'no host'; }})()"))
        print("header totals:", await pg.evaluate(f"(()=>{{ const R={SR}; return [...R.querySelectorAll('.px-totals .px-total')].map(b=>b.getAttribute('aria-label')).join(' || '); }})()"))
        print("activity section in column:", await pg.evaluate(f"(()=>{{ const R={SR}; return [...R.querySelectorAll('.px-ro__col h3')].map(h=>h.textContent).join(','); }})()"))
        await pg.screenshot(path=os.path.join(OUT, "c_ropage.png"))
        await pg.evaluate(f"(()=>{{ const R={SR}; R.querySelectorAll('.px-totals .px-total')[2].click(); }})()"); await pg.wait_for_timeout(500)
        print("modal:", await pg.evaluate(f"(()=>{{ const R={SR}; const d=R.querySelector('.px-modal'); return d ? d.querySelector('h2').textContent + ' · ' + d.querySelectorAll('.px-ev').length + ' events · focus ' + (R.activeElement && R.activeElement.className) : 'none'; }})()"))
        await pg.screenshot(path=os.path.join(OUT, "c_activity.png"))
        await pg.keyboard.type("Checked the DEF line, no leaks."); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
        print("after note:", await pg.evaluate(f"(()=>{{ const R={SR}; const d=R.querySelector('.px-modal'); return d ? d.querySelectorAll('.px-ev').length + ' events · ' + d.querySelector('.px-actm__n').textContent + ' · last: ' + [...d.querySelectorAll('.px-note')].slice(-1).map(n=>n.textContent).join('') : 'closed'; }})()"), "| toast:", (await T())[:60])
        await pg.screenshot(path=os.path.join(OUT, "c_activity2.png"))
        await pg.evaluate(f"(()=>{{ const R={SR}; [...R.querySelectorAll('.px-modal .px-seg button')][2].click(); }})()"); await pg.wait_for_timeout(300)
        print("changes only:", await pg.evaluate(f"(()=>{{ const R={SR}; return R.querySelectorAll('.px-modal .px-note').length; }})()"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        print("closed:", await pg.evaluate(f"(()=>{{ const R={SR}; return !R.querySelector('.px-modal'); }})()"), "| count now:", await pg.evaluate(f"(()=>{{ const R={SR}; return R.querySelectorAll('.px-totals .px-total')[2].getAttribute('aria-label'); }})()"))
        for th in ["ivd", "vvl", "vvd", "ivl"]:
            await pg.evaluate(f"__tg.applyTheme('{th}')"); await pg.wait_for_timeout(300)
            await pg.evaluate(f"(()=>{{ const R={SR}; R.querySelectorAll('.px-totals .px-total')[2].click(); }})()"); await pg.wait_for_timeout(350)
            await pg.screenshot(path=os.path.join(OUT, f"c_th_{th}.png")); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        # ---------- e: the truck by year and model ----------
        res = await pg.evaluate("""(()=>{ const out=[]; for(const [m,y] of [['VNL',2022],['VNL64T',2016],['VNL 760',2015],['VHD',2022],['VNR',2023],['VNL 860',2026]]){ const ro=Object.assign({}, __tg.STATE().ros[0], {model:m, year:y, trkBody:undefined, trkOwn:null, trkUse:undefined}); const M=__tg.trkMatch(ro); out.push(m+' '+y+' → '+(M.entry ? M.entry.id : '-')+' ('+M.st+')'); } return out.join(' | '); })()""")
        print("truck:", res)
        print("ERRORS", errs[:8]); await b.close()
asyncio.run(main())
