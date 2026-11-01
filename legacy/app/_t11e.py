import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots11")
exec(open(os.path.join(H, "_t11d.py")).read().split("async def main")[0].split("OUT = ")[1].split("\n",1)[1])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx2 = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=1, has_touch=True, is_mobile=True); m = await ctx2.new_page(); m.set_default_timeout(6000)
        await m.route("**/fonts.g*/**", lambda r: r.abort()); await m.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await m.goto("file://" + H + "/t11.html"); await m.wait_for_timeout(1000)
        await m.evaluate("__tg.loadSample25()"); await m.evaluate("__tg.ensureDemoTeam()"); await m.evaluate(SIGN); await m.wait_for_timeout(400)
        it = await m.query_selector_all('[data-pg="tech"] .tch-it'); await it[0].click(); await m.wait_for_timeout(500); await m.evaluate(ADD); await m.wait_for_timeout(300)
        await m.evaluate("(()=>{ const t=document.querySelector('.toast-wrap'); if(t) t.remove(); })()")
        cks = await m.query_selector_all('[data-pg="tech"] .tch-oh > .tch-cb'); await cks[1].tap(); await m.wait_for_timeout(200); await cks[2].tap(); await m.wait_for_timeout(300)
        print('scrollers:', await m.evaluate("(()=>{ const o=[]; document.querySelectorAll('*').forEach(e=>{ if(e.scrollHeight>e.clientHeight+20 && /auto|scroll/.test(getComputedStyle(e).overflowY)) o.push((e.className||e.tagName).toString().slice(0,30)+':'+e.scrollHeight+'/'+e.clientHeight); }); return [o, document.scrollingElement.tagName, document.scrollingElement.scrollHeight]; })()")); await m.evaluate("window.scrollTo(0, 600)"); await m.wait_for_timeout(300)
        print('scrollY', await m.evaluate("[window.scrollY, document.scrollingElement.scrollTop, document.body.scrollTop]")); print(await m.evaluate("(()=>{ const s=document.querySelector('[data-pg=tech] .tch-sb'); const r=s&&s.getBoundingClientRect(); const t=document.querySelector('.pm-tabs'); return [!!s, r && [Math.round(r.top), Math.round(r.bottom), Math.round(r.left), Math.round(r.right)], t && Math.round(t.getBoundingClientRect().top), innerHeight]; })()"))
        print(await m.evaluate("(()=>{ let e=document.querySelector('[data-pg=tech] .tch-sb').parentElement, out=[]; while(e){ const c=getComputedStyle(e); if(c.overflow!=='visible'||c.overflowY!=='visible') out.push((e.className||e.tagName).toString().slice(0,40)+':'+c.overflowY+':'+c.display); e=e.parentElement; } return out; })()"))
        await m.screenshot(path=os.path.join(OUT, "e_phone_bar.png"))
        await b.close()
asyncio.run(main())
