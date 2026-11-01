import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await upto_ops_done(pg)
        await admin(pg); await tri(pg, rid)
        await pg.click(".tg-main button:has-text('Road test')"); await pg.wait_for_timeout(400)
        await pg.click(".tg-pop button[data-a=tg-rt-go], .tg-pop button[data-action=tg-rt-go]"); await pg.wait_for_timeout(600)
        print("toast", await toast(pg))
        print("rt:", await pg.evaluate(RO(rid, "return JSON.stringify(r.roadTest||r.rtSend||null).slice(0,200);")))
        await signin(pg, "Dana Kowalski"); await go(pg, 'tech')
        print("IB badge for Dana:", await pg.evaluate("(()=>{ try{ return __tg.IB.badge(); }catch(e){ return String(e); } })()"))
        print("any inbox ui:", await pg.evaluate("[...document.querySelectorAll('[data-view=inbox], [title*=Inbox]')].map(x=>[x.tagName, !!x.offsetParent, x.title])"))
        await shot(pg, "p1_dana_after_rt_send")
        # profile menu
        await pg.evaluate("(()=>{ const b=document.querySelector('.pxr-me, [data-action=px-me], .px-me'); b&&b.click(); })()"); await pg.wait_for_timeout(400)
        print("me menu:", (await txt(pg, ".tg-pop, .px-menu, .lg-menu, [role=menu]") or '')[:300])
        await shot(pg, "p2_dana_menu")
        # does the tech list/card mention the road test?
        L = await lst(pg, ".tg-list .tg-it", 20); print("TECH list:", [x[:100] for x in L])
        print("ERR", errs)
        await b.close()
asyncio.run(main())
