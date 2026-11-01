import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots132x")
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
PASTE = """(t => { const dt = new DataTransfer(); dt.setData('text/plain', t); const z = document.querySelector('#imp-dlg .ix-drop') || document.body; z.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); })"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.goto("file://" + H + "/t12_ixs.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.evaluate("(()=>{ try{ __tg.pxSignedIn(); }catch(e){} __tg.render(); })()"); await pg.wait_for_timeout(300)
        await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(300)
        await pg.evaluate(PASTE + "(" + json.dumps(open(os.path.join(H, "x132", "s1_case.txt")).read()) + ")"); await pg.wait_for_timeout(600)
        await pg.click('#imp-dlg [data-ix="apply"]'); await pg.wait_for_timeout(1500)
        t = await pg.evaluate(f"(()=>{{ const R={SR}; const all=[...R.querySelectorAll('*')].filter(x=>/ASIST total/.test(x.textContent||'')); const g=all.sort((a,b)=>a.textContent.length-b.textContent.length).find(x=>/Labor/.test(x.textContent)); if(g) g.scrollIntoView(); return g ? g.innerText : ''; }})()")
        print(t); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "x9_money.png"))
        pt = await pg.evaluate(f"(()=>{{ const R={SR}; return [...R.querySelectorAll('.rop-prow .px-li__t')].map(x=>x.textContent); }})()")
        print(pt); print("ERRORS", errs[:4])
        await b.close()
asyncio.run(main())
