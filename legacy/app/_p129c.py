import asyncio, os, sys, json
sys.argv = ['x', sys.argv[1] if len(sys.argv) > 1 else 't12.html']
_src = open("_t127p.py").read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots129"); os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ __tg.STATE().punches.forEach(p=>{ if(!p.stop){ p.stop=new Date().toISOString(); p.stopReason='Switched job'; p.burntCredited=true; } }); __tg.render(); })()")
        L = await pg.evaluate("__tg.STATE().ros.filter(r=>!r.shop && /^Complete/.test(__tg.roStatus(r).status)).map(r=>[r.id, r.roNumber, __tg.roStatus(r).status, !!r.dateClosed, r.dateClosedAuto, r.assignedTech])")
        print(len(L), L[:3])
        for pick in ["Working", "Waiting – Customer", "Hold tech", "Waiting – Parts"]:
            for x in [l for l in L if l[2] == "Complete – Road test"][:1] + [l for l in L if l[2] == "Complete – Released"][:1]:
                ro = x[0]
                await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); r.status={{status:'{x[2]}', sub:null, setAt:new Date().toISOString()}}; r.dateClosed=new Date().toISOString(); }})()")
                RS = f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); return [__tg.roStatus(r).status, !!r.dateClosed]; }})()"
                await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(700)
                await pg.evaluate(J("R.querySelector('.px-status--button').click()")); await pg.wait_for_timeout(300)
                await pg.evaluate(J(f"const b=[...R.querySelectorAll('.px-menu__item')].find(x=>x.textContent.trim().toLowerCase().startsWith({json.dumps(pick.lower())})); if(b) b.click()")); await pg.wait_for_timeout(300)
                r1 = await pg.evaluate(RS)
                await pg.wait_for_timeout(2500)
                r2 = await pg.evaluate(RS); t = await pg.evaluate("__tg.UI().toast")
                print(f"{x[2]:22} → pick {pick:20}: right after {r1} · 2.5 s later {r2} · toast {t}")
        await b.close()
asyncio.run(main())
