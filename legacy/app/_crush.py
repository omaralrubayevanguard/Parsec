import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PROBE = r"""(()=>{ const out=[], seen=new Set(); const M=document.querySelector('.main'); if(!M) return [];
 const nm=e=>e.tagName.toLowerCase()+(typeof e.className==='string'&&e.className.trim()?'.'+e.className.trim().split(/\s+/).filter(c=>!/^(on|kb|sel|act)$/.test(c)).slice(0,2).join('.'):'');
 M.querySelectorAll('*').forEach(e=>{ const cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden') return; const r=e.getBoundingClientRect(); if(!r.width) return;
  let why='';
  if(cs.display.includes('grid')){ const cols=cs.gridTemplateColumns.split(' ').filter(x=>/px/.test(x)).map(parseFloat); if(cols.length>=3 && Math.min(...cols)<92) why='grid '+cols.length+'×'+Math.round(Math.min(...cols)); }
  if(!why && cs.display.includes('flex') && cs.flexDirection.startsWith('row') && cs.flexWrap==='nowrap' && e.children.length>=3){ const ws=[...e.children].map(c=>c.getBoundingClientRect().width).filter(w=>w>0); const txt=[...e.children].some(c=>c.getBoundingClientRect().width<56 && (c.textContent||'').trim().length>6); if(txt) why='flex nowrap '+e.children.length; }
  if(!why && r.right>394 && r.width>40 && cs.position!=='fixed' && !e.closest('.tg-views,.mv-chips') ) { const p=e.parentElement; if(p && p.getBoundingClientRect().right<=394) why='over '+Math.round(r.right); }
  if(why){ const k=nm(e.parentElement||e)+' > '+nm(e); if(!seen.has(k)){ seen.add(k); out.push(k+'  ['+why+']'); } } });
 return out.slice(0,40); })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page()
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        for v in sys.argv[1:]:
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; U.modal=null; __tg.render(); window.scrollTo(0,0); }})()"); await pg.wait_for_timeout(400)
            print("=====", v); print("\n".join(await pg.evaluate(PROBE)))
            if await pg.evaluate("!!document.querySelector('.main .tg-list .tg-it')"):
                await pg.evaluate("document.querySelector('.main .tg-list .tg-it:not(.ib-sum)').click()"); await pg.wait_for_timeout(400)
                print("----- opened"); print("\n".join(await pg.evaluate(PROBE)))
                await pg.evaluate("(()=>{ const b=document.querySelector('.pm-back'); if(b) b.click(); })()"); await pg.wait_for_timeout(200)
        await b.close()
asyncio.run(main())
