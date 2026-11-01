import asyncio, os, sys, json
sys.argv = ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
D = r"""(()=>{ const M=document.querySelector('.main')||document.body, out=[];
 const walk=(e,d)=>{ if(d>5) return; [...e.children].forEach(c=>{ const r=c.getBoundingClientRect(); if(r.width<120||r.height<18||r.bottom<0||r.top>900) return; const cl=String(c.className||'').split(' ').filter(Boolean).slice(0,3).join('.');
   if(cl) out.push('  '.repeat(d)+c.tagName.toLowerCase()+'.'+cl+' ['+Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height)+'] '+(c.textContent||'').trim().replace(/\s+/g,' ').slice(0,40)); walk(c,d+1); }); };
 walk(M,0); return out.slice(0,90).join('\n'); })()"""
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()"); await pg.wait_for_timeout(500)
        for v in sys.argv[2:] if len(sys.argv) > 2 else ['triage','parts','manager','career','timelog','fixes','assets','inventory','admin','warranty']:
            await pg.evaluate(f"(()=>{{ __tg.UI().view='{v}'; __tg.render(); }})()"); await pg.wait_for_timeout(800)
            print("=====", v); print(await pg.evaluate(D))
        await b.close()
asyncio.run(main())
