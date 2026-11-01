import asyncio, os, datetime, json, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH=os.path.join(H,'shots6')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/t6.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("__tg.applyTheme('ivl')")
        await pg.evaluate("(()=>{const U=__tg.UI(); U.appMenu=true; __tg.render();})()"); await pg.wait_for_timeout(200)
        await pg.evaluate("document.querySelector('[data-action=set-size][data-size=floor]').click()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.appMenu=false; U.view='console'; __tg.render();})()"); await pg.wait_for_timeout(300)
        r = await pg.evaluate("""(()=>{ const s=document.querySelector('.iv-side'); const walk=(e,d)=>{ const b=e.getBoundingClientRect(); const c=getComputedStyle(e); let o=[('  '.repeat(d))+e.tagName.toLowerCase()+'.'+String(e.className).split(' ').slice(0,3).join('.')+' y='+Math.round(b.y)+' h='+Math.round(b.height)+' sh='+e.scrollHeight+' ov='+c.overflowY+' pos='+c.position+' flex='+c.flex+' disp='+c.display]; if(d<2) for(const ch of e.children) o=o.concat(walk(ch,d+1)); return o; }; return walk(s,0).join('\\n'); })()""")
        print(r)
        await b.close()
asyncio.run(main())
