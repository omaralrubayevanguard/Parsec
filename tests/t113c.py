import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True); pg = await ctx.new_page()
        await pg.route("**/fonts.g*/**", lambda r: r.abort()); await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t11.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(700)
        print(await pg.evaluate("""(()=>{ const e=document.querySelector('.tch-as'); if(!e) return 'none'; const out=[]; let x=e; while(x && x!==document.body){ const c=getComputedStyle(x); out.push(x.tagName+'.'+String(x.className).slice(0,40)+' d='+c.display+' w='+x.offsetWidth); x=x.parentElement; if(out.length>4) break;} return out.join(' | '); })()"""))
        await b.close()
asyncio.run(main())
