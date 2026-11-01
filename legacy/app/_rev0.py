import asyncio, os, sys, json
sys.argv = ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        k = await pg.evaluate("Object.keys(__tg).sort()")
        print(len(k)); print(' '.join(k))
        await b.close()
asyncio.run(main())
