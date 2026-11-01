import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
SNAP = "return [r.status.status, r.status.sub, r.operations.map(o=>[o.complaint.slice(0,14), o.jobStatus&&o.jobStatus.status, (o.parts||[]).map(x=>x.status+(x.bin?'#'+x.bin:'')).join(',')])];"
async def clickall(pg, label):
    n = 0
    for i in range(6):
        ok_ = await pg.evaluate(f"(()=>{{ const b=[...document.querySelectorAll('[data-pg=parts] .tg-main button, [data-pg=parts] button')].find(b=>b.offsetParent && b.textContent.trim().replace(/\\s+/g,' ').startsWith({json.dumps(label)})); if(b){{ b.click(); return true; }} return false; }})()")
        await pg.wait_for_timeout(450)
        if not ok_: break
        n += 1
        pop = await pg.evaluate("!!document.querySelector('.tg-pop')")
        if pop:
            t = await txt(pg, ".tg-pop"); print("  pop:", (t or '')[:300])
            await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('.tg-pop button.btn-primary')].pop(); b&&b.click(); })()"); await pg.wait_for_timeout(450)
    return n
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        rid = await mkro(pg); await flow_approve(pg, rid); await flow_order(pg, rid)
        await psel(pg)
        print("its in:", await clickall(pg, "It’s in"))
        print("toast", await toast(pg))
        print(await pg.evaluate(RO(rid, SNAP)))
        await psel(pg)
        await shot(pg, "f5_received")
        nxt = await txt(pg, "[data-pg=parts] .tg-next, [data-pg=parts] [class*=next]"); print("NEXT", nxt)
        btns = await pg.evaluate("[...document.querySelectorAll('[data-pg=parts] .tg-main button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim().replace(/\\s+/g,' ').slice(0,24))")
        print("BTNS", btns)
        print("ERR", errs)
        await b.close()
asyncio.run(main())
