import asyncio, os, json
from playwright.async_api import async_playwright
APP = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/t12.html"
OUT = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/mock148/cap"
os.makedirs(OUT, exist_ok=True)
NATIVE = """((sel, txt)=>{ const el=[...document.querySelectorAll(sel)].find(x=>x.offsetParent); if(!el) return null; const r=el.getBoundingClientRect(); const d=document.createElement('div'); d.textContent=txt||el.getAttribute('title');
  d.style.cssText='position:fixed;z-index:99999;left:'+(r.left+r.width/2-4)+'px;top:'+(r.bottom+18)+'px;font:12px Segoe UI,system-ui,sans-serif;color:#000;background:#fff;border:1px solid #767676;padding:2px 6px;box-shadow:2px 2px 2px rgba(0,0,0,.18);white-space:nowrap;'; document.body.appendChild(d); return [r.left, r.top, r.width, r.height]; })"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1440, "height": 900}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + APP); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        # 1 the Time Log shop view: the custom tip on a block
        await pg.evaluate("(()=>{ __tg.UI().view='timelog'; __tg.render(); })()"); await pg.wait_for_timeout(600)
        bx = await pg.evaluate("(()=>{ const L=[...document.querySelectorAll('[data-pg=timelog] .tk-b.job[data-tip]')].filter(x=>x.offsetWidth>30); const e=L[1]||L[0]; if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; })()")
        print("tl", bx)
        if bx:
            await pg.mouse.move(bx[0], bx[1]); await pg.wait_for_timeout(250)
            await pg.screenshot(path=OUT + "/c1_tl.png", clip={"x": max(0, bx[0] - 160), "y": max(0, bx[1] - 60), "width": 420, "height": 150})
        await pg.mouse.move(5, 5)
        # 2 Manager: any data-tip with rows
        await pg.evaluate("(()=>{ __tg.UI().view='manager'; __tg.render(); })()"); await pg.wait_for_timeout(800)
        bx = await pg.evaluate("(()=>{ const L=[...document.querySelectorAll('[data-pg] [data-tip*=\"::\"], [data-pg] [data-tip]')].filter(x=>x.offsetWidth>8 && x.getBoundingClientRect().top>60); const e=L[0]; if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2, e.getAttribute('data-tip')]; })()")
        print("mg", bx)
        if bx:
            await pg.mouse.move(bx[0], bx[1]); await pg.wait_for_timeout(250)
            await pg.screenshot(path=OUT + "/c2_mg.png", clip={"x": max(0, bx[0] - 60), "y": max(0, bx[1] - 30), "width": 440, "height": 190})
        await pg.mouse.move(5, 5)
        # 3 the RO list: the browser's own box on an icon button
        await pg.evaluate("(()=>{ __tg.UI().view='rolist'; __tg.render(); })()"); await pg.wait_for_timeout(800)
        t = await pg.evaluate("(()=>{ const L=[...document.querySelectorAll('[data-pg=rolist] button[title], [data-pg=rolist] [title]')].filter(x=>x.offsetParent && x.getBoundingClientRect().top<120 && x.getBoundingClientRect().left>500); return L.slice(0,8).map(x=>[x.getAttribute('title'), x.className]); })()")
        print("rl", t)
        r = await pg.evaluate(NATIVE + "('[data-pg=rolist] [title]:not(.tg-hf)', null)")
        print("rl r", r)
        if r: await pg.screenshot(path=OUT + "/c3_native.png", clip={"x": max(0, r[0] - 120), "y": max(0, r[1] - 16), "width": 380, "height": 90})
        # 4 the RO page (shadow root): an icon with the browser's box, and a 'Click to …' one
        await pg.evaluate("(()=>{ const r=[...document.querySelectorAll('[data-pg=rolist] [data-id]')].find(x=>x.offsetParent); if(r) r.click(); })()"); await pg.wait_for_timeout(1200)
        r = await pg.evaluate("""(()=>{ const h=document.querySelector('.jc-host:not(.jc-band-host)'); const R=h&&h.shadowRoot; if(!R) return null; const L=[...R.querySelectorAll('[title]')].filter(x=>x.getClientRects().length && x.getBoundingClientRect().top<70 && x.getBoundingClientRect().top>0 && x.getBoundingClientRect().left>200); return L.map(x=>{ const b=x.getBoundingClientRect(); return [x.getAttribute('title'), b.left, b.top, b.width, b.height]; }); })()""")
        print("rop", r and r[:12], await pg.evaluate("[__tg.UI().view, !![...document.querySelectorAll('[data-pg=rolist] [data-id]')].find(x=>x.offsetParent), document.querySelectorAll('.jc-host').length]"))
        if r:
            t = [x for x in r if x[0] and 'Copy' in x[0]] or r
            x = t[0]
            await pg.evaluate("""((x,y,w,h,txt)=>{ const d=document.createElement('div'); d.textContent=txt; d.style.cssText='position:fixed;z-index:99999;left:'+(x+w/2-4)+'px;top:'+(y+h+18)+'px;font:12px Segoe UI,system-ui,sans-serif;color:#000;background:#fff;border:1px solid #767676;padding:2px 6px;box-shadow:2px 2px 2px rgba(0,0,0,.18);white-space:nowrap;'; document.body.appendChild(d); })""", [x[1], x[2], x[3], x[4], x[0]])
            await pg.screenshot(path=OUT + "/c4_rop.png", clip={"x": max(0, x[1] - 200), "y": max(0, x[2] - 14), "width": 420, "height": 90})
        print("ERR", errs)
        await b.close()
asyncio.run(main())
