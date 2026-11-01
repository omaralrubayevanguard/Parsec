import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": int(sys.argv[1]), "height": 860})).new_page()
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t12d.html"); await pg.wait_for_timeout(1000)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()")
        rid = await pg.evaluate("__tg.STATE().ros.find(r=>!r.shop && r.id!=='shop').id")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        print(await pg.evaluate("(()=>{ const R=" + SR + "; const h=R.host; const out=[]; let x=R.querySelector('.rop-rail'); while(x){ const c=getComputedStyle(x); out.push((x.className||x.tagName)+' w='+x.getBoundingClientRect().width.toFixed(0)+' ct='+c.containerType); x=x.parentElement || (x.getRootNode().host); if(out.length>8) break; } return out.join(' | ') + ' || host w=' + h.getBoundingClientRect().width + ' ct=' + getComputedStyle(h).containerType; })()"))
        print(await pg.evaluate("(()=>{ const out=[]; document.querySelectorAll('body *').forEach(e=>{ const r=e.getBoundingClientRect(); if(r.right > innerWidth+1 && r.width>0) out.push((e.className||e.tagName).toString().slice(0,40)+':'+Math.round(r.right)); }); return out.slice(0,10); })()"))
        print(await pg.evaluate("(()=>{ const R=" + SR + "; const out=[]; R.querySelectorAll('*').forEach(e=>{ const r=e.getBoundingClientRect(); if(r.right > innerWidth+1 && r.width>0) out.push((e.className||e.tagName).toString().slice(0,40)+':'+Math.round(r.right)); }); return out.slice(0,10); })()"))
        await b.close()
asyncio.run(main())
