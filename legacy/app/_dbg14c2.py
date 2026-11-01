import asyncio, os, sys, json
sys.argv = ['x', sys.argv[1] if len(sys.argv) > 1 else 't12_cc.html']
src = open('_t125c.py').read().split("async def desktop(p, th):")[0]
exec(src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        print("view0", await pg.evaluate("__tg.UI().view"), await pg.evaluate("__tg.STATE().ros.filter(r=>r.location).length"))
        me = await pg.evaluate(SIGN)
        a, b2, lot, n = await pg.evaluate(PREP + "(" + json.dumps(me) + ")")
        print(me, a, b2, lot, n)
        await pg.click("[data-pg=tech] .tch-views button[data-v=yard]"); await pg.wait_for_timeout(1200)
        print(await pg.evaluate(f"(()=>{{ const y={Q}.querySelector('.tch-yd'); const t=y.querySelector('.tg-s[data-ro=\"{b2}\"]'); return [t ? t.className : null, y.querySelectorAll('.tyd-bring').length, [...y.querySelectorAll('.tyd-mc')].map(c=>c.textContent.trim().slice(0,50))]; }})()"))
        r = await pg.evaluate(f"(()=>{{ const r=__tg.STATE().ros.find(x=>x.id==='{b2}'); return [r.location, r.cxBring, r.status.status, r.operations.map(o=>[o.jobStatus&&o.jobStatus.status, !!o.appr, o.quoted])]; }})()")
        print(r)
        await b.close()
asyncio.run(main())
