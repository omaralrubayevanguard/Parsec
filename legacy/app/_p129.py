import asyncio, os, sys, json
sys.argv = ['x', sys.argv[1] if len(sys.argv) > 1 else 't12.html']
_src = open("_t127p.py").read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots129"); os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        X = await pg.evaluate(PREP); A, An, ro, a, bo = X["A"], X["An"], X["ro"], X["a"], X["b"]
        await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); r.operations.forEach(o=>(o.parts||[]).forEach(x=>{{ x.status='Installed'; }})); r.assignedTech={json.dumps(An)}; }})()")
        await pg.evaluate(SIGN(A))
        for op in (a, bo):
            await pg.evaluate(f"__tg.doStartPunch('{ro}', '{op}', 'Repairing')"); await pg.wait_for_timeout(150)
            await pg.evaluate("__tg.doStopPunch('Complete')"); await pg.wait_for_timeout(300)
        RS = f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); return [__tg.roStatus(r).status, r.dateClosed, r.operations.map(o=>__tg.opDoneNow(o))]; }})()"
        print('after complete', await pg.evaluate(RS))
        await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); r.roadTest={{result:'Pass', at:new Date().toISOString(), by:'Frank Delaney', miles:'11'}}; __tg.scheduleSave(true); __tg.render(); }})()"); await pg.wait_for_timeout(1500)
        print('after road test', await pg.evaluate(RS))
        await pg.evaluate(f"(()=>{{ __tg.setRoStatus('{ro}', 'Complete – Released', null, true); const r=__tg.STATE().ros.find(r=>r.id==='{ro}'); __tg.syncDateClosedRo && __tg.syncDateClosedRo(r); __tg.scheduleSave(true); __tg.render(); }})()"); await pg.wait_for_timeout(1500)
        print('after release', await pg.evaluate(RS))
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "a_ro_released.png"))
        # what does the RO page offer for the RO status?
        info = await pg.evaluate(J("return [...R.querySelectorAll('button')].filter(b=>/Released|Road test|Hold tech|Complete/i.test(b.textContent)).map(b=>[b.className, b.textContent.trim().slice(0,40), b.title||''])"))
        print(json.dumps(info, indent=0)[:2500])
        await pg.evaluate(J("R.querySelector('.px-status--button').click()")); await pg.wait_for_timeout(400)
        items = await pg.evaluate(J("return [...R.querySelectorAll('.px-pop [role=menuitem], .px-pop button, .px-menu button')].map(x=>x.className+' | '+x.textContent.trim().slice(0,50))"))
        print('menu', items)
        await pg.screenshot(path=os.path.join(OUT, "b_menu.png"))
        await pg.evaluate(J("const b=[...R.querySelectorAll('.px-pop [role=menuitem], .px-pop button, .px-menu button')].find(x=>/^Hold tech/i.test(x.textContent.trim())); console.log('click', !!b); if(b) b.click()")); await pg.wait_for_timeout(300)
        print('right after pick', await pg.evaluate(RS), await pg.evaluate("__tg.UI().toast"))
        await pg.wait_for_timeout(2500)
        print('2.5 s later', await pg.evaluate(RS), await pg.evaluate("__tg.UI().toast"))
        await pg.evaluate("__tg.scheduleSave(true)"); await pg.wait_for_timeout(1500)
        print('after another save', await pg.evaluate(RS), await pg.evaluate("__tg.UI().toast"))
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "c_after.png"))
        aud = await pg.evaluate("(__tg.STATE().auditLog||[]).slice(-6).map(a=>a.type+': '+a.text)")
        print(json.dumps(aud, indent=0))
        await b.close()
asyncio.run(main())
