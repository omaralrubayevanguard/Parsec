import asyncio, json, gzip, re
from playwright.async_api import async_playwright
F = "file:///tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/t12.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto(F); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(500)
        S = await pg.evaluate("JSON.stringify(__tg.STATE())")
        await b.close()
    st = json.loads(S)
    raw = S.encode(); print("STATE bytes", len(raw), "gzip", len(gzip.compress(raw)))
    pretty = json.dumps(st, indent=2).encode(); print("backup (pretty) bytes", len(pretty), "gzip", len(gzip.compress(pretty)))
    print("keys", len(st), sorted(st.keys()))
    ros = st.get("ros", []); print("ROs", len(ros), "punches", len(st.get("punches", [])), "shifts", len(st.get("shifts", [])), "audit", len(st.get("audit", [])), "staff", len(st.get("staff", [])), "inventory", len(st.get("inventory", [])))
    rsz = [len(json.dumps({"ro": r, "punches": [x for x in st["punches"] if x.get("roId") == r["id"]]})) for r in ros]
    print("RO json avg", sum(rsz)//max(1,len(rsz)), "max", max(rsz))
    shop = {k: v for k, v in st.items() if k not in ("ros", "punches")}
    sj = json.dumps(shop).encode(); print("shop bytes", len(sj), "gzip", len(gzip.compress(sj)))
    big = sorted(((k, len(json.dumps(v))) for k, v in shop.items()), key=lambda x: -x[1])[:12]; print("biggest shop keys", big)
    # id coverage
    def cov(L): 
        L = [x for x in L if isinstance(x, dict)]; return (len(L), sum(1 for x in L if x.get("id")))
    ops = [o for r in ros for o in r.get("operations", [])]
    parts = [pt for o in ops for pt in (o.get("parts") or [])]
    logs = [l for o in ops for l in (o.get("log") or [])]
    offn = [n for o in ops for n in (o.get("offNotes") or [])]
    bul = [x for r in ros for x in (r.get("bulletins") or [])]
    files = [f for x in bul for f in (x.get("files") or [])]
    for nm, L in [("ops", ops), ("parts", parts), ("op log", logs), ("offNotes", offn), ("bulletins", bul), ("files", files), ("punches", st["punches"]), ("shifts", st.get("shifts", [])), ("audit", st.get("audit", [])), ("staff", st.get("staff", [])), ("inventory", st.get("inventory", []))]:
        print("id coverage", nm, cov(L))
    # date formats
    fmts = {}
    def walk(o, path=""):
        if isinstance(o, dict):
            for k, v in o.items(): walk(v, k)
        elif isinstance(o, list):
            for v in o: walk(v, path)
        elif isinstance(o, str):
            if re.fullmatch(r"\d{4}-\d{2}-\d{2}T[\d:.]+Z", o): f = "ISO UTC"
            elif re.fullmatch(r"\d{4}-\d{2}-\d{2}", o): f = "YYYY-MM-DD"
            elif re.fullmatch(r"\d{2}-\d{2}-\d{4}", o): f = "MM-DD-YYYY"
            elif re.fullmatch(r"\d{1,2}/\d{1,2}/\d{2,4}", o): f = "M/D/Y"
            elif re.fullmatch(r"\d{1,2}:\d{2}", o): f = "HH:MM"
            else: return
            fmts.setdefault(f, set()).add(path)
        elif isinstance(o, (int, float)) and path.lower().endswith(("at", "ms")) and o > 1e12:
            fmts.setdefault("epoch ms", set()).add(path)
    walk(st)
    for k, v in fmts.items(): print("dates", k, sorted(v)[:14])
    # number-as-string
    q = [o.get("quoted") for o in ops]; print("quoted types", {type(x).__name__ for x in q})
    pr = [pt.get("price", pt.get("unitPrice")) for pt in parts]; print("part price types", {type(x).__name__ for x in pr})
asyncio.run(main())
