import asyncio, os, datetime, json, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH=os.path.join(H,'shots6')
PAGE = sys.argv[1] if len(sys.argv)>1 else 't6.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(300)
        await pg.evaluate("__tg.applyTheme('ivl')")
        async def size(sz):
            await pg.evaluate("(()=>{const U=__tg.UI(); U.appMenu=true; __tg.render();})()"); await pg.wait_for_timeout(200)
            await pg.evaluate(f"document.querySelector('[data-action=set-size][data-size={sz}]').click()"); await pg.wait_for_timeout(300)
        for sz in ["large", "floor"]:
            await size(sz)
            for v in ["console", "foreman", "triage", "warranty", "ros"]:
                await pg.evaluate(f"(()=>{{const U=__tg.UI(); U.view='{v}'; U.modal=null; U.toast=null; U.appMenu=false; __tg.render();}})()"); await pg.wait_for_timeout(400)
                r = await pg.evaluate("""(()=>{ const s=document.querySelector('.iv-side'); const m=document.querySelector('.main'); const last=[...document.querySelectorAll('.iv-side button, .iv-side a')].pop(); return [document.documentElement.scrollHeight, innerHeight, m && Math.round(m.getBoundingClientRect().height), s && Math.round(s.scrollHeight), s && Math.round(s.clientHeight), last && last.textContent.trim().slice(0,20), last && Math.round(last.getBoundingClientRect().bottom)]; })()""")
                print(sz, v, r)
                print('   scrollY after scrollTo', await pg.evaluate("(()=>{window.scrollTo(0,600); const y=window.scrollY; window.scrollTo(0,0); return y})()"))
                if v=='ros': print(await pg.evaluate("(()=>{ const h=document.querySelector('.jc-host'); const sr=h&&h.shadowRoot; return [h&&h.getAttribute('style'), document.querySelector('.ro-page').getAttribute('style'), document.querySelector('.ro-detail-pane').getAttribute('style'), getComputedStyle(document.documentElement).getPropertyValue('--ro-top'), sr && [...sr.querySelectorAll('style')].map(s=>(s.textContent.match(/[^{}]*\\{[^}]*100d?vh[^}]*\\}/g)||[]).slice(0,6).join(' || ')).join(' ## ').slice(0,1500)] })()"))
                if v=='ros': print(await pg.evaluate("""(()=>{ const out=[]; [document.documentElement, document.body, ...document.querySelectorAll('body *')].forEach(e=>{ const b=e.getBoundingClientRect(); if(b.height>=700) out.push(e.tagName+'#'+e.id+'.'+String(e.className).slice(0,30)+' h='+Math.round(b.height)+' mh='+getComputedStyle(e).minHeight+' hh='+getComputedStyle(e).height); }); return out.slice(0,12); })()"""))
                if v=='foreman': print(await pg.evaluate("""(()=>{ const out=[]; document.querySelectorAll('body *').forEach(e=>{ const b=e.getBoundingClientRect(); if(b.bottom>905 && b.height>0 && getComputedStyle(e).position!=='fixed') out.push(e.tagName+'.'+String(e.className).slice(0,40)+' b='+Math.round(b.bottom)+' h='+Math.round(b.height)+' mh='+getComputedStyle(e).minHeight); }); return out.slice(0,8); })()"""))
                await pg.screenshot(path=f"{SH}/z_{sz}_{v}.png")
            await pg.evaluate("(()=>{const U=__tg.UI(); U.view='console'; U.appMenu=true; __tg.render();})()"); await pg.wait_for_timeout(300)
            print(sz, "menu", await pg.evaluate("(()=>{const m=document.querySelector('.pnav-set-pop'); const b=m.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom), innerHeight]})()"))
            await pg.screenshot(path=f"{SH}/z_{sz}_menu.png")
        await size("normal")
        print("errors", errs)
        await b.close()
asyncio.run(main())
