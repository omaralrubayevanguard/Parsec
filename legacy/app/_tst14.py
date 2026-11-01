import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_st.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots14"); os.makedirs(OUT, exist_ok=True)
G = """(()=>{ const ro=Object.keys(__tg.STATE ? {} : {}); const R=["Hold Tech","Working","Waiting – Parts","Waiting – Foreman","Waiting – Tech Support","Waiting – Customer","Waiting – Approval","Waiting – New Job","Complete","Complete – Road test","Complete – Released","Declined"];
 const P=["Not Ordered","Ordered","Backordered","Received","Staged","Picked up","Installed","Returned"], C=["Repair","Ready to file","Filed","Returned","Denied","Approved","Paid"];
 const h=k=>'<div style="display:flex;flex-wrap:wrap;gap:14px 22px;margin:10px 0 18px">'+k+'</div>';
 const d=document.createElement('div'); d.id='stgal'; d.style.cssText='position:fixed;inset:60px 40px auto 280px;z-index:99999;background:var(--tg-panel);padding:24px;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.2);font-size:13px;color:var(--tg-ink)';
 d.innerHTML='<b>RO / operation — read</b>'+h(R.map(s=>__tg.pgSt('ro',s)).join(''))+'<b>RO / operation — change</b>'+h(R.slice(0,6).map(s=>__tg.pgSt('ro',s,{menu:1, sub: s==='Waiting – Parts'?'· Ordered':''})).join(''))
  +'<b>Parts — read</b>'+h(P.map(s=>__tg.pgSt('part',s)).join(''))+'<b>Parts — change</b>'+h(P.slice(0,4).map(s=>__tg.pgSt('part',s,{menu:1})).join(''))+'<b>Claims</b>'+h(C.map(s=>__tg.pgSt('claim',s)).join(''));
 (document.querySelector('.tg')||document.body).appendChild(d); return document.querySelectorAll('#stgal .pgst').length; })()"""
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='triage'; __tg.render(); })()"); await pg.wait_for_timeout(800)
        n = await pg.evaluate(G); print("chips", n)
        await pg.screenshot(path=os.path.join(OUT, "st_gal_light.png"))
        await pg.evaluate("document.documentElement.setAttribute('data-theme','ivd'); __tg.render()"); await pg.wait_for_timeout(500)
        await pg.evaluate(G); await pg.screenshot(path=os.path.join(OUT, "st_gal_dark.png"))
        print("ERRORS", errs[:5])
        await b.close()
asyncio.run(main())
