import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await admin(pg); await go(pg, 'rolist')
        v = await pg.evaluate("[...document.querySelectorAll('[data-action=assist-toggle]')].map(b=>[b.tagName, !!b.offsetParent, getComputedStyle(b).display, b.closest('[hidden]')?'hidden':'', b.outerHTML.slice(0,160)])")
        print(v)
        await b.close()
asyncio.run(main())
