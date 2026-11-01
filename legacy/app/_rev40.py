import os; exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revlib.py').read())
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await admin(pg)
        roles = await pg.evaluate("(()=>{ const S=__tg.STATE(); return JSON.stringify(S.perm && S.perm.roles ? Object.fromEntries(Object.entries(S.perm.roles).map(([k,v])=>[k, {pages:v.pages, acts:Object.keys(v.acts||{}).filter(a=>v.acts[a])}])) : null).slice(0,3000); })()")
        print(roles)
        print("staff:", await pg.evaluate("__tg.staffList().map(s=>s.name+':'+(s.role||''))"))
        await b.close()
asyncio.run(main())
