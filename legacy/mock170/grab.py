import asyncio, os, json, base64, io, re
from playwright.async_api import async_playwright
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(H), "app")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1440, "height": 900})
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + A + "/t12.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        has = await pg.evaluate("Object.keys(__tg).filter(k=>/trk/i.test(k)).join(',')")
        print("tg trk:", has)
        R = await pg.evaluate("""(()=>{ const S=__tg.STATE(); const out=[]; S.ros.filter(r=>!r.shop && r.id!=='ro_shop').slice(0,24).forEach(r=>{ let P=null, T=null; try{ P=__tg.trkPick(r); }catch(e){ P={err:String(e)}; } try{ T=__tg.trkTopOf(r); }catch(e){} out.push([r.roNumber, r.customerName, P && P.kind, P && P.entry && P.entry.id, (P && P.src || '').slice(0,30), (P && P.src||'').length, T && T.src ? T.src.length : 0]); }); return out; })()""")
        for r in R: print(r)
        imgs = await pg.evaluate("""(()=>{ const S=__tg.STATE(); const want={'Midway Auto Transport':1,'Red Mesa Hauling':1,'Northline Transport':1}; const isW=n=>want[n]||/^Rick/.test(n); const o={}; S.ros.forEach(r=>{ if(!isW(r.customerName)) return; const P=__tg.trkPick(r); const T=__tg.trkTopOf(r); o[r.customerName]=[P&&P.src||'', T&&T.src||'']; }); return o; })()""")
        out = await pg.evaluate("""(async (o)=>{ const R={}; for(const k in o){ R[k]=[]; for(const src of o[k]){ if(!src){ R[k].push(''); continue; } const im=new Image(); im.src=src; await im.decode(); const w=Math.min(200, im.naturalWidth), h=Math.round(im.naturalHeight*w/im.naturalWidth); const c=document.createElement('canvas'); c.width=w; c.height=h; c.getContext('2d').drawImage(im,0,0,w,h); R[k].push(c.toDataURL('image/webp',0.82)); } } return R; })""", imgs)
        json.dump(out, open(H + '/imgs.json', 'w'))
        for k,v in out.items(): print(k, [len(x) for x in v])
        await b.close()
asyncio.run(main())
