import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PROBE = r"""(()=>{ const out=[], seen=new Set(); document.querySelectorAll('.main *').forEach(e=>{ const cs=getComputedStyle(e); if(cs.display==='none') return; const r=e.getBoundingClientRect(); if(r.width<200) return;
  if(cs.display.includes('grid')){ const cols=cs.gridTemplateColumns.split(' ').filter(x=>/px/.test(x)).map(parseFloat); if(cols.length>=2 && Math.min(...cols)<165){ const k=(e.className&&typeof e.className==='string'?e.className.split(' ').slice(0,2).join('.'):e.tagName)+' ['+cols.length+'×'+Math.round(Math.min(...cols))+'] in '+(e.parentElement.className||'').toString().split(' ')[0]; if(!seen.has(k)){ seen.add(k); out.push(k); } } }
  else if(cs.display.includes('flex') && cs.flexWrap==='nowrap' && cs.flexDirection.startsWith('row') && e.children.length>=3){ const sm=[...e.children].filter(c=>{const w=c.getBoundingClientRect().width; return w>0 && w<70 && (c.textContent||'').trim().length>8;}).length; if(sm){ const k='FLEX '+(e.className||e.tagName).toString().split(' ').slice(0,2).join('.')+' ('+e.children.length+') in '+(e.parentElement.className||'').toString().split(' ')[0]; if(!seen.has(k)){ seen.add(k); out.push(k); } } } });
  return out.slice(0,30); })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page()
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        for spec in sys.argv[1:]:
            v, _, tab = spec.partition(":"); tab, _, op = tab.partition("+")
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; U.modal=null; __tg.render(); }})()"); await pg.wait_for_timeout(350)
            if tab: await pg.evaluate(f"(()=>{{ const b=document.querySelectorAll('.main .tg-views > *')[{int(tab)}]; if(b) b.click(); }})()"); await pg.wait_for_timeout(350)
            if op: await pg.evaluate("(()=>{ const it=document.querySelector('.main .tg-list .tg-it'); if(it) it.click(); })()"); await pg.wait_for_timeout(350)
            print("=====", spec); print("\n".join(await pg.evaluate(PROBE)))
        await b.close()
asyncio.run(main())
