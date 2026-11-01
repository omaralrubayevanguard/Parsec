import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":1440,"height":900})
        pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append("console: "+m.text) if m.type=="error" else None)
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        t = await pg.evaluate("""(()=>{ const S=__tg.STATE(); return S.ros.slice(0,40).map(r=>{ const P=__tg.trkPick(r); return [r.roNumber, r.vin, r.model, P.kind, P.entry?P.entry.id:'', (r.bulletins||[]).map(b=>b.task+':'+(b.files||[]).length).join(','), (r.attachments||[]).length].join(' | '); }).join('\\n'); })()""")
        print(t); print("errs", errs[:5])
        await b.close()
asyncio.run(main())
