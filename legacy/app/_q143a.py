import asyncio, os, sys
sys.argv = ['x', 't12_ea.html']
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0])
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ __tg.pxSignedIn(); __tg.UI().view='foreman'; __tg.UI().fmView='ros'; __tg.render(); })()"); await pg.wait_for_timeout(700)
        await pg.click(".rq-emb .rq-rows .rq-row .rq-k-cust"); await pg.wait_for_timeout(900)
        print(await pg.evaluate(J("return [__tg.UI().roFrom, R.querySelector('.px-crumb a').textContent]")))
        await pg.evaluate(J("R.querySelector('.px-crumb a').click()")); await pg.wait_for_timeout(700)
        print(await pg.evaluate("[__tg.UI().view, __tg.UI().roFrom]"))
        await pg.evaluate("(()=>{ __tg.UI().view='parts'; __tg.render(); })()"); await pg.wait_for_timeout(600)
        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('.tg-views button')].find(b=>b.dataset.v==='ros'); b.click(); })()"); await pg.wait_for_timeout(600)
        print(await pg.evaluate("[__tg.UI().view, __tg.UI().roFrom, __tg.UI()._roFromNext]"))
        await pg.click(".rq-emb .rq-rows .rq-row .rq-k-cust"); await pg.wait_for_timeout(900)
        print(await pg.evaluate(J("return [__tg.UI().view, __tg.UI().roFrom, R.querySelectorAll('.px-crumb a').length, R.querySelector('.px-crumb a').textContent, R.querySelectorAll('.px-head').length]")))
        await b.close()
asyncio.run(main())
