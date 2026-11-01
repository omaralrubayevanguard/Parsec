import asyncio, os, sys, json
sys.argv = ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
D = r"""((sel)=>{ const M=document.querySelector(sel)||document.body, out=[];
 const walk=(e,d)=>{ if(d>4) return; [...e.children].forEach(c=>{ const r=c.getBoundingClientRect(); if(r.width<80||r.height<16||r.bottom<0||r.top>1000) return; const cl=String(c.className&&c.className.baseVal!==undefined?c.className.baseVal:c.className||'').split(' ').filter(Boolean).slice(0,3).join('.');
   if(cl||c.id) out.push('  '.repeat(d)+c.tagName.toLowerCase()+(c.id?'#'+c.id:'')+'.'+cl+' ['+Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height)+'] '+(c.textContent||'').trim().replace(/\s+/g,' ').slice(0,36)); walk(c,d+1); }); };
 walk(M,0); return out.slice(0,60).join('\n'); })"""
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p, 1440, 1000)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()"); await pg.wait_for_timeout(500)
        await pg.evaluate("__tg.pxLogout()"); await pg.wait_for_timeout(900)
        print("===== login"); print(await pg.evaluate(f"({D})('body')"))
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_out'); localStorage.removeItem('tec_locked'); __tg.pxSignedIn(); __tg.UI().view='admin'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        print("===== admin"); print(await pg.evaluate(f"({D})('.main')"))
        await pg.keyboard.press("Control+k"); await pg.wait_for_timeout(600)
        print("===== ctrlk"); print(await pg.evaluate("[...document.querySelectorAll('body > *')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>200 && getComputedStyle(e).position==='fixed'}).map(e=>e.tagName+'#'+e.id+'.'+e.className).join(' | ')"))
        await pg.keyboard.press("Escape")
        await pg.set_viewport_size({"width": 390, "height": 844}); await pg.evaluate("(()=>{ __tg.UI().view='rolist'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        print("===== phone rolist"); print(await pg.evaluate(f"({D})('body')"))
        await b.close()
asyncio.run(main())
