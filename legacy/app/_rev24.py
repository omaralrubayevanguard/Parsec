import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_assign(pg); await flow_tech_start(pg, rid); await done_cur(pg)
        await start_next(pg, 2); await done_cur(pg)
        await pick_all(pg)
        print("install", await install_all(pg), await toast(pg))
        print(await pg.evaluate(RO(rid, "return r.operations[2].parts.map(x=>x.status);")))
        await start_next(pg, 3); await watch_toasts(pg); await done_cur(pg); await pg.wait_for_timeout(500)
        print("toasts", await seen(pg))
        print(await pg.evaluate(RO(rid, "return [r.status.status, r.status.sub, r.operations.map(o=>[o.jobStatus&&o.jobStatus.status])];")))
        await tsel(pg); await shot(pg, "i3_all_done")
        # story: what does the tech page offer?
        print("story btns", await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] button, [data-pg=tech] textarea')].filter(b=>b.offsetParent && /story|cause|correction|Story/i.test(b.textContent+(b.placeholder||'')+(b.title||''))).map(b=>(b.textContent.trim()||b.placeholder||b.title).slice(0,40)+'|'+(b.dataset.a||''))"))
        print("ERR", errs)
        await b.close()
asyncio.run(main())
