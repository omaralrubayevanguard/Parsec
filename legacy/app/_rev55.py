import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_assign(pg)
        await admin(pg); await tri(pg, rid)
        h = await pg.evaluate("(()=>{ const t=document.querySelector('.tg-main .tg-top'); const els=[...t.querySelectorAll('*')].filter(e=>e.children.length===0 && /^TE$/.test(e.textContent.trim())); return els.map(e=>[e.className, (e.closest('[title]')||{}).title||'', e.parentElement.outerHTML.slice(0,300)]); })()")
        print(h)
        print("holder:", await pg.evaluate(RO(rid, "return [__tg.rtHolder ? JSON.stringify(__tg.rtHolder(r)) : null, __tg.rtHolderName ? __tg.rtHolderName(r) : null];")))
        print("ERR", errs)
        await b.close()
asyncio.run(main())
