import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(); pg = await ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.goto("file://" + H + "/" + sys.argv[1]); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        ids = await pg.evaluate("""(()=>{ const S=__tg.STATE(); const ro=S.ros.find(r=>r.operations&&r.operations.length&&r.id!=='ro_shop'); const op=ro.operations[0];
          op.cause='Cracked fitting at the dryer outlet.'; op.correction='Replaced the fitting, leak tested.'; S.savedAt=Date.now(); __tg.scheduleSave(true); return [ro.id, op.id]; })()""")
        await pg.wait_for_timeout(2500)
        await pg.reload(); await pg.wait_for_timeout(1500)
        r = await pg.evaluate(f"""(()=>{{ const ro=__tg.getRO('{ids[0]}'); if(!ro) return 'no ro'; const op=ro.operations.find(o=>o.id==='{ids[1]}'); return JSON.stringify({{ field: [op.cause, op.correction], log: (op.log||[]).map(l=>l.kind+': '+l.text) }}); }})()""")
        print(r); print("errors", errs); await b.close()
asyncio.run(main())
