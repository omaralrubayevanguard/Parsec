import asyncio, os, sys, base64
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_trk")
PHOTO = base64.b64encode(open(os.path.join(OUT, "checkin_test.jpg"), "rb").read()).decode()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, has_touch=True, is_mobile=True, device_scale_factor=2)
        pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        # one RO gets a check-in photo
        rid = await pg.evaluate("__tg.STATE().ros.find(x=>!x.shop && __tg.trkPick(x).kind==='none' && /VNR 640/.test(x.model)).id")
        await pg.evaluate("""(b64)=>new Promise(res=>{ const bin=atob(b64), a=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) a[i]=bin.charCodeAt(i); const f=new File([a],'IMG_2041.jpg',{type:'image/jpeg'}); __tg.JC.addFilesTo(__tg.getRO('%s'),'pics',[f],k=>res(k)); })""" % rid, PHOTO)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='rolist'; U.selectedRo=null; __tg.render(); })()"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=os.path.join(OUT, "p_list.png"))
        print("list overflow:", await pg.evaluate("document.documentElement.scrollWidth"), "thumbs", await pg.evaluate("document.querySelectorAll('.rq-row .trk-th').length"))
        for k, e, nm in [("model", "st-white", "p_model"), ("photo", "", "p_photo"), ("none", "", "p_none")]:
            q = f"__tg.STATE().ros.find(x=>!x.shop && __tg.trkPick(x).kind==='{k}' && (!'{e}' || __tg.trkPick(x).entry.id==='{e}'))"
            await pg.evaluate(f"(()=>{{ const r={q}; const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); }})()"); await pg.wait_for_timeout(1000)
            await pg.screenshot(path=os.path.join(OUT, nm + ".png"))
            print(nm, await pg.evaluate("document.documentElement.scrollWidth"), await pg.evaluate("""(()=>{ const R=document.querySelector('.jc-host').shadowRoot; const t=R.querySelector('.px-trk'), p=t&&t.querySelector('.px-trk__pic'); if(!p) return 'no band'; const a=t.getBoundingClientRect(), c=p.getBoundingClientRect(); return p.className+' band '+Math.round(a.width)+'x'+Math.round(a.height)+' pic '+Math.round(c.x)+','+Math.round(c.y)+' '+Math.round(c.width)+'x'+Math.round(c.height); })()"""))
        await pg.locator(".px-trk__act").click(); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "p_menu.png"))
        await pg.locator(".px-trk__menu button", has_text="All truck pictures").click(); await pg.wait_for_timeout(1000)
        await pg.screenshot(path=os.path.join(OUT, "p_settings.png"))
        print("settings view:", await pg.evaluate("__tg.UI().view+'/'+__tg.UI().pxSec"))
        print("errs", errs[:5])
        await b.close()
asyncio.run(main())
