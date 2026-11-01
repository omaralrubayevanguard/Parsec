import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_released(pg)
        await go(pg, 'foreman')
        bays = await lst(pg, "[data-pg=foreman] .fm-bay, .fm-bay", 30)
        print("BAYS", [x[:60] for x in bays][:6])
        print("hdr", await txt(pg, "[data-pg=foreman] .tg-hd, .tg-head"))
        print("yard spot AW1:", await pg.evaluate("(()=>{ try{ return __tg.yardMap ? Object.keys(__tg.yardMap()).length : null; }catch(e){ return String(e); } })()"))
        print("pickup:", await pg.evaluate(RO(rid, "return JSON.stringify({p:r.pickedUpBy, rel:r.releasedBy, h:(r.history||[]).slice(-3)}).slice(0,600);")))
        # RO page
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(1000)
        await shot(pg, "k4_ro_released")
        # Tech page as Dana
        await signin(pg, "Dana Kowalski"); await go(pg, 'tech')
        L = await lst(pg, ".tg-list .tg-it", 20); print("TECH list:", [x[:100] for x in L])
        print("ERR", errs)
        await b.close()
asyncio.run(main())
