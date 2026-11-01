import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots128")
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
def J(js): return "(()=>{ const R=" + SR + "; " + js + " })()"
ROLE_ = os.environ.get('ROLE','Technician')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page()
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        X = await pg.evaluate("""(()=>{ const S=__tg.STATE(); const out=[];
          S.ros.filter(r=>!r.shop && !r.dateClosed).forEach(r=>r.operations.forEach(o=>{ const ps=S.punches.filter(p=>p.opId===o.id && p.stop).sort((a,b)=>new Date(a.stop)-new Date(b.stop)); const l=ps[ps.length-1]; const n=(o.jobStatus&&o.jobStatus.status)||(l&&l.stopReason)||''; if(/^Complete/.test(n)) out.push([r.id, r.roNumber, o.id, n, !!(o.jobStatus&&o.jobStatus.hand)]); }));
          return out; })()""")
        print(X[:6], len(X))
        ro, op = X[0][0], X[0][2]
        T = await pg.evaluate("(()=>{ const ROLE='" + ROLE_ + "'; const t=__tg.staffList().filter(s=>s.role===(ROLE))[0]; localStorage.setItem('tec_viewas', t.id); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{ __tg.CX.U().skipMorning = __tg.todayStr(); }catch(e){} __tg.render(); return __tg.pcMe(); })()")
        print('signed in', T)
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        await pg.evaluate(J(f"const r=R.querySelector('.px-row[data-op=\"{op}\"] .px-row__t'); if(r && !R.querySelector('.px-row[data-op=\"{op}\"]').classList.contains('is-on')) r.click()")); await pg.wait_for_timeout(700)
        info = await pg.evaluate(J(f"const row=R.querySelector('.px-row[data-op=\"{op}\"]'); const c=R.querySelector('.ock[data-op=\"{op}\"]'); return {{row: row ? row.outerHTML.slice(0,1500) : null, mode: c && c.dataset.mode, side: c && c.querySelector('.ock-side').outerHTML.slice(0,600)}}"))
        print(json.dumps(info, indent=1)[:4000])
        await pg.screenshot(path=os.path.join(OUT, "a_ro_done.png"))

        await pg.evaluate(J(f"R.querySelector('.px-row[data-op=\"{op}\"] .rop-st').click()")); await pg.wait_for_timeout(400)
        items = await pg.evaluate(J("return [...R.querySelectorAll('.rop-stpop [role=menuitem], .rop-stpop button')].map(x=>x.textContent.trim())"))
        print('menu', items)
        await pg.screenshot(path=os.path.join(OUT, "b_menu.png"))
        await pg.evaluate(J("const b=[...R.querySelectorAll('.rop-stpop [role=menuitem], .rop-stpop button')].find(x=>/Hold tech/i.test(x.textContent)); if(b) b.click()")); await pg.wait_for_timeout(700)
        info = await pg.evaluate(J(f"const c=R.querySelector('.ock[data-op=\"{op}\"]'); const st=R.querySelector('.px-row[data-op=\"{op}\"] .rop-st'); return {{mode: c && c.dataset.mode, st: st && st.textContent, toast: __tg.UI().toast, go: c && !!c.querySelector('[data-ock=go]')}}"))
        print('after Hold tech', info)
        await pg.screenshot(path=os.path.join(OUT, "c_after.png"))
        await pg.wait_for_timeout(5500)
        info = await pg.evaluate(J(f"const c=R.querySelector('.ock[data-op=\"{op}\"]'); const st=R.querySelector('.px-row[data-op=\"{op}\"] .rop-st'); return {{mode: c && c.dataset.mode, st: st && st.textContent, go: c && !!c.querySelector('[data-ock=go]')}}"))
        print('after 5s', info)
        await b.close()
asyncio.run(main())
