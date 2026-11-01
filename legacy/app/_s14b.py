import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_bb.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots14b")
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='foreman'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, "s1_foreman.png"))
        await pg.click("text=Granite State E"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, "s1b_foreman_ro.png"))
        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Assign/.test(x.textContent.trim())); if(b) b.click(); })()"); await pg.wait_for_timeout(600)
        print(await pg.evaluate("[...document.querySelectorAll('.fm-tk')].slice(0,3).map(x=>x.innerText.replace(/\\s+/g,' '))"))
        await pg.screenshot(path=os.path.join(OUT, "s2_assign.png"))
        print("ERRORS", errs[:5])
        await b.close()
asyncio.run(main())
