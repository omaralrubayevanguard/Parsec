import asyncio, os, sys, json
sys.argv = ['x', sys.argv[1] if len(sys.argv) > 1 else 't12.html']
_src = open("_t127p.py").read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ __tg.STATE().punches.forEach(p=>{ if(!p.stop){ p.stop=new Date().toISOString(); p.stopReason='Switched job'; p.burntCredited=true; } }); __tg.render(); })()"); await pg.wait_for_timeout(500)
        for want in ["Complete – Road test", "Complete – Released"]:
            ro = await pg.evaluate(f"(__tg.STATE().ros.find(r=>!r.shop && __tg.roStatus(r).status==={json.dumps(want)} && r.operations.some(o=>(o.parts||[]).length))||{{}}).id")
            RS = f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); return __tg.roStatus(r).status; }})()"
            for pick in ["Hold tech", "Working", "Waiting – Customer"]:
                await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); r.status={{status:{json.dumps(want)}, sub:null, setAt:new Date().toISOString()}}; __tg.scheduleSave(true); }})()"); await pg.wait_for_timeout(500)
                await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(600)
                await pg.evaluate(J("R.querySelector('.px-status--button').click()")); await pg.wait_for_timeout(300)
                await pg.evaluate(J(f"const b=[...R.querySelectorAll('.px-menu__item')].find(x=>x.textContent.trim().toLowerCase().startsWith({json.dumps(pick.lower())})); if(b) b.click()")); await pg.wait_for_timeout(800)
                r1 = await pg.evaluate(RS)
                # the next thing on that RO: a note on a part (part eta changes) — any event
                await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); const o=r.operations.find(o=>(o.parts||[]).length); const x=o.parts[0]; x.status = x.status==='Installed' ? 'Received' : 'Installed'; __tg.scheduleSave(true); }})()"); await pg.wait_for_timeout(1200)
                r2 = await pg.evaluate(RS)
                await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); const o=r.operations.find(o=>(o.parts||[]).length); const x=o.parts[0]; x.status = 'Installed'; __tg.scheduleSave(true); }})()"); await pg.wait_for_timeout(1200)
                r3 = await pg.evaluate(RS); t = await pg.evaluate("__tg.UI().toast")
                print(f"{want:22} → {pick:20}: picked {r1} · after a part changes {r2} · after it's back {r3} · {t}")
        await b.close()
asyncio.run(main())
