import asyncio, os, datetime, json, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
SEL = sys.argv[1] if len(sys.argv) > 1 else '.wx-list'
PROPS = sys.argv[2].split(',') if len(sys.argv) > 2 else ['height','max-height','min-height','top','position','flex','align-self','grid-row','overflow','display','bottom']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/" + os.environ.get("PG","t5.html")); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("window.__V='"+os.environ.get('V','warranty')+"'"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view=(window.__V||'warranty'); U.modal=null; U.toast=null; __tg.render();})()"); await pg.wait_for_timeout(600)
        r = await pg.evaluate("""([sel, props])=>{ const el=document.querySelector(sel); const out=[]; for(const ss of document.styleSheets){ let rules; try{ rules=ss.cssRules }catch(e){ continue } const walk=(rs, media)=>{ for(const r of rs){ if(r.cssRules && !r.selectorText){ walk(r.cssRules, (r.conditionText||r.media&&r.media.mediaText||'')); continue; } if(!r.selectorText) continue; let m=false; try{ m=el.matches(r.selectorText) }catch(e){} if(!m) continue; const got=props.filter(p=>r.style.getPropertyValue(p)).map(p=>p+':'+r.style.getPropertyValue(p)+(r.style.getPropertyPriority(p)?' !':'')); if(got.length) out.push([r.selectorText.slice(-160), media||'', got.join('; ')]); } }; walk(rules,''); } const cs=getComputedStyle(el); return {rules:out, computed:props.map(p=>p+'='+cs.getPropertyValue(p))}; }""", [SEL, PROPS])
        for x in r['rules']: print(x)
        print(r['computed'])
        await b.close()
asyncio.run(main())
