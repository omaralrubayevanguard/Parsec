# Parsec 16 (C) — compression, end-of-day compressed backups (30 days), restore from .json.gz, Export for the server
# (tables + attachments + schema + manifest), the round-trip check (identical; refuses a tampered line or a missing file).
# The folder is the browser's private folder (OPFS) — that needs http, so the app is served on localhost.
import asyncio, os, sys, json, subprocess, hashlib, base64, time, re
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots160c"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12_c.html"
PORT = int(os.environ.get("PORT160", "8763"))
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
CONNECT = """(async()=>{ const r=await navigator.storage.getDirectory(); for await (const [n] of r.entries()){ await r.removeEntry(n,{recursive:true}); }
  const F=__tg.FS(); F.dir=r; F.dirName='Test folder'; F.status='connected'; return true; })()"""
# read a file under the private folder: path like 'Parsec Data/Backups/2026-10/x.json.gz' → base64
READ = """(async(path)=>{ let d=await navigator.storage.getDirectory(); const ps=path.split('/'); const leaf=ps.pop(); for(const p of ps) d=await d.getDirectoryHandle(p); const f=await (await d.getFileHandle(leaf)).getFile();
  const b=new Uint8Array(await f.arrayBuffer()); let s=''; for(let i=0;i<b.length;i+=8192) s+=String.fromCharCode.apply(null,b.subarray(i,i+8192)); return btoa(s); })"""
WRITE = """(async([path, text])=>{ let d=await navigator.storage.getDirectory(); const ps=path.split('/'); const leaf=ps.pop(); for(const p of ps) d=await d.getDirectoryHandle(p,{create:true}); const w=await (await d.getFileHandle(leaf,{create:true})).createWritable(); await w.write(text); await w.close(); return true; })"""
EXISTS = """(async(path)=>{ try{ let d=await navigator.storage.getDirectory(); const ps=path.split('/'); const leaf=ps.pop(); for(const p of ps) d=await d.getDirectoryHandle(p); await d.getFileHandle(leaf); return true; }catch(e){ return false; } })"""
LS = """(async(path)=>{ try{ let d=await navigator.storage.getDirectory(); for(const p of path.split('/').filter(Boolean)) d=await d.getDirectoryHandle(p); const o=[]; for await (const [n,h] of d.entries()) o.push(n+(h.kind==='directory'?'/':'')); return o.sort(); }catch(e){ return null; } })"""
DEL = """(async(path)=>{ let d=await navigator.storage.getDirectory(); const ps=path.split('/'); const leaf=ps.pop(); for(const p of ps) d=await d.getDirectoryHandle(p); await d.removeEntry(leaf); return true; })"""
async def main():
    srv = subprocess.Popen(["python3", "-m", "http.server", str(PORT), "--directory", H], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.0)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); pg.set_default_timeout(15000); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
            pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
            await pg.route("**/fonts.g*/**", lambda r: r.abort())
            await pg.goto(f"http://localhost:{PORT}/{PAGE}"); await pg.wait_for_timeout(3600)   # FS_READY after 3 s
            await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(400)
            await pg.evaluate(CONNECT)
            await pg.evaluate("__tg.scheduleSave(true)"); await pg.wait_for_timeout(2500)   # the RO folders
            today, yday, month = await pg.evaluate("(()=>{ const t=__tg.todayStr(), d=new Date(); d.setDate(d.getDate()-1); return [t, __tg.todayStr(d), t.slice(0,7)]; })()")
            # ---- 1. compression
            g = await pg.evaluate("(async()=>{ const t='hello parsec '.repeat(500); const b=await __tg.pdGzip(t); const back=await __tg.pdGunzip(b); const plain=await __tg.pdGunzip(new Blob(['{\"a\":1}'])); return [b.size, t.length, back===t, plain]; })()")
            ok(g[0] < g[1] / 10 and g[2] and g[3] == '{"a":1}', f"gzip round trip ({g[1]} → {g[0]} bytes), plain files still read")
            # ---- 2. the end of the day: not before the shop's end time, then once it has passed
            await pg.evaluate("(()=>{ const S=__tg.STATE(); S.fmCfg=S.fmCfg||{}; S.fmCfg.end=23.99; S.savedAt=Date.now(); localStorage.removeItem('pd_bk_eod'); __tg.PDBK.caught=true; })()")
            r0 = await pg.evaluate("__tg.pdBkTick()")
            ok(r0 is None, "before the shop's end time: no backup")
            await pg.evaluate("(()=>{ const S=__tg.STATE(); S.fmCfg.end=Math.max(0.5, new Date().getHours()-1); S.savedAt=Date.now(); })()")
            r1 = await pg.evaluate("__tg.pdBkTick()")
            path1 = f"Parsec Data/Backups/{month}/data-{today}.json.gz"
            ok(r1 and r1.get("why") == "end of day" and await pg.evaluate(EXISTS + f"({json.dumps(path1)})"), f"end of day → {path1}")
            data = json.loads(await pg.evaluate("(async(p)=>{ let d=await navigator.storage.getDirectory(); const ps=p.split('/'); const leaf=ps.pop(); for(const x of ps) d=await d.getDirectoryHandle(x); return __tg.pdGunzip(await (await d.getFileHandle(leaf)).getFile()); })" + f"({json.dumps(path1)})"))
            nros = await pg.evaluate("__tg.STATE().ros.length")
            ok(len(data.get("ros", [])) == nros, f"the backup is compressed and holds every RO ({len(data.get('ros', []))})")
            r1b = await pg.evaluate("__tg.pdBkTick()")
            ok(r1b is None, "only once a day by the clock")
            # ---- 3. opening Parsec the next day: yesterday's end state is written then
            await pg.evaluate("(()=>{ const d=new Date(); d.setDate(d.getDate()-1); d.setHours(17,0,0,0); __tg.STATE().savedAt=d.getTime(); __tg.PDBK.caught=false; })()")
            r2 = await pg.evaluate("__tg.pdBkTick()")
            path2 = f"Parsec Data/Backups/{yday[:7]}/data-{yday}.json.gz"
            ok(r2 and r2.get("why") == "catch-up" and await pg.evaluate(EXISTS + f"({json.dumps(path2)})"), f"at open: the last working day's backup → {path2}")
            await pg.evaluate("__tg.PDBK.caught=false")
            r2b = await pg.evaluate("__tg.pdBkTick()")
            ok(not (r2b and r2b.get("why") == "catch-up"), "…and not again once it's there")
            await pg.evaluate("__tg.STATE().savedAt=Date.now()")
            # ---- 4. keep 30 days — only old .json.gz backups go
            old = await pg.evaluate("(()=>{ const d=new Date(); d.setDate(d.getDate()-40); return __tg.todayStr(d); })()")
            gz = await pg.evaluate("(async()=>{ const b=await __tg.pdGzip('{\"ros\":[]}'); const a=new Uint8Array(await b.arrayBuffer()); let s=''; for(const x of a) s+=String.fromCharCode(x); return btoa(s); })()")
            await pg.evaluate("(async([p,b64])=>{ let d=await navigator.storage.getDirectory(); const ps=p.split('/'); const leaf=ps.pop(); for(const x of ps) d=await d.getDirectoryHandle(x,{create:true}); const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)); const w=await (await d.getFileHandle(leaf,{create:true})).createWritable(); await w.write(bin); await w.close(); })", ([f"Parsec Data/Backups/{old[:7]}/data-{old}.json.gz", gz]))
            await pg.evaluate(WRITE, ([f"Parsec Data/Backups/{old[:7]}/notes.txt", "keep me"]))
            await pg.evaluate(WRITE, ([f"Parsec Data/Backups/data-{old}.json", '{"ros":[{"id":"x"}]}']))
            n = await pg.evaluate("__tg.pdBkPrune()")
            gone = not await pg.evaluate(EXISTS, f"Parsec Data/Backups/{old[:7]}/data-{old}.json.gz")
            kept = await pg.evaluate(EXISTS, f"Parsec Data/Backups/{old[:7]}/notes.txt") and await pg.evaluate(EXISTS, f"Parsec Data/Backups/data-{old}.json")
            ok(n == 1 and gone and kept, f"keep 30 days: the 40-day-old .json.gz went ({n}); other files stayed")
            # ---- 5. restore reads .json.gz and the old .json
            L = await pg.evaluate("__tg.listBackups()")
            ok(f"{month}/data-{today}.json.gz" in L and f"data-{old}.json" in L, f"the backups list: {L[:4]}")
            rb = await pg.evaluate(f"(async()=>{{ const a=await __tg.readBackup({json.dumps(month + '/data-' + today + '.json.gz')}); const b=await __tg.readBackup({json.dumps('data-' + old + '.json')}); return [a.ros.length, b.ros.length]; }})()")
            ok(rb == [nros, 1], f"restore reads both ({rb})")
            # Back up now · clocking out with someone still on / nobody on
            await pg.evaluate("__tg.pxBkWrite ? 0 : 0")
            hand = await pg.evaluate("(async()=>{ await __tg.pdBackupNow('test'); return __tg.PDBK.last; })()")
            ok(hand.startswith(f"{month}/data-{today} test ") and hand.endswith(".json.gz"), f"a one-off copy: {hand}")
            # ---- 6. export for the server: 2 attachments in an RO folder
            ros_dir = await pg.evaluate(LS, ("Parsec Data/ROs"))
            ro0 = await pg.evaluate("(()=>{ const r=__tg.STATE().ros[0]; return [r.id, r.roNumber]; })()")
            fold = [d for d in (ros_dir or []) if d.rstrip("/").startswith(str(ro0[1]))]
            f16 = await pg.evaluate("(()=>{ const r=__tg.STATE().ros[0]; return __tg.pd16Info ? (__tg.pd16Info().dirs[r.id] || null) : null; })()")   # Parsec 16 (A): Open/<RO> or Closed/<year>/<RO>
            if f16: fold = [f16]
            ok(bool(fold) and await pg.evaluate(LS, ("Parsec Data/ROs/" + fold[0].rstrip("/"))) is not None, f"the RO's folder is there ({fold[:1]})")
            fold = fold[0].rstrip("/") if fold else ""
            await pg.evaluate(WRITE, ([f"Parsec Data/ROs/{fold}/Attachments/photo.jpg", "JPEGDATA" * 300]))
            await pg.evaluate(WRITE, ([f"Parsec Data/ROs/{fold}/Attachments/scan.pdf", "%PDF-1.4 test"]))
            for _ in range(6):   # let the sample's background touches settle first
                h1 = await pg.evaluate("JSON.stringify(__tg.pdxCanon(__tg.STATE())).length"); await pg.wait_for_timeout(1500)
                if h1 == await pg.evaluate("JSON.stringify(__tg.pdxCanon(__tg.STATE())).length"): break
            ex = await pg.evaluate("(async()=>{ const r=await __tg.pdExportForServer(); return r && { name: r.name, m: r.manifest }; })()")
            ok(bool(ex), "Export for the server ran")
            m = ex["m"] if ex else {}
            exp = await pg.evaluate("(()=>{ const S=__tg.STATE(); const ops=S.ros.flatMap(r=>r.operations||[]); return { ros:S.ros.length, operations:ops.length, parts:ops.flatMap(o=>o.parts||[]).length, punches:(S.punches||[]).length, shifts:(S.shifts||[]).length, keys:Object.keys(S).sort() }; })()")
            c = m.get("counts", {})
            ok(c.get("ros") == exp["ros"] and c.get("operations") == exp["operations"] and c.get("parts") == exp["parts"] and c.get("punches") == exp["punches"] and c.get("shifts") == exp["shifts"] and c.get("attachments") == 2,
               f"manifest counts: ros {c.get('ros')}, ops {c.get('operations')}, parts {c.get('parts')}, punches {c.get('punches')}, shifts {c.get('shifts')}, attachments {c.get('attachments')}")
            ok(sorted(m.get("stateKeys", {}).keys()) == exp["keys"], f"every kind of data has a table ({len(m.get('stateKeys', {}))} of {len(exp['keys'])})")
            fl = {f["path"]: f for f in m.get("files", [])}
            ok(all(("tables/" + t + ".jsonl") in fl for t in ["ros", "operations", "parts", "notes", "punches", "shifts", "people", "inventory", "activity", "inbox", "time_fixes", "air_reasons", "completed", "tombstones", "attachments", "settings"]) and "schema.json" in fl and "README.txt" in fl,
               f"16 tables + schema.json + README.txt listed ({len(fl)} files)")
            ap = [k for k in fl if k.startswith("attachments/") and k.endswith("photo.jpg")]
            if ap:
                raw = base64.b64decode(await pg.evaluate(READ, (f"Parsec Data/Exports/{ex['name']}/{ap[0]}")))
                ok(hashlib.sha256(raw).hexdigest() == fl[ap[0]]["sha256"] and len(raw) == fl[ap[0]]["bytes"], "an attachment's sha-256 checks out independently")
            else: ok(False, "the photo is in the export")
            parts_txt = base64.b64decode(await pg.evaluate(READ, (f"Parsec Data/Exports/{ex['name']}/tables/parts.jsonl"))).decode()
            ok('"price_cents":' in parts_txt and not re.search(r'"(price|list|core|ext|cost)":(\d|"\$?\d)', parts_txt), "parts: price, list, core, ext, cost in whole cents")
            ops_txt = base64.b64decode(await pg.evaluate(READ, (f"Parsec Data/Exports/{ex['name']}/tables/operations.jsonl"))).decode()
            ok('"amount_cents":' in ops_txt and not re.search(r'"(otherCost|amount|paid)":(\d|"\$?\d)', ops_txt), "operations: otherCost and the claim's amount / paid in whole cents")
            sch = json.loads(base64.b64decode(await pg.evaluate(READ, (f"Parsec Data/Exports/{ex['name']}/schema.json"))).decode())
            ok(sch["tables"]["parts"]["links"].get("_op_id") == "operations.id" and "price_cents" in sch["tables"]["parts"]["columns"], "schema.json: columns and links")
            mon = {t: sch["tables"][t].get("money") for t in ["ros", "operations", "parts", "inventory", "settings"]}
            ok(mon["ros"] == ["shopSupplies_cents"] and {"otherCost_cents", "claim.amount_cents", "claim.paid_cents"} <= set(mon["operations"]) and set(mon["parts"]) == {"price_cents", "list_cents", "core_cents", "ext_cents", "cost_cents"}
               and "children[].cost_cents" in mon["inventory"] and "shopRo" in (mon["settings"] or {}), f"schema.json marks every money field (_cents): ops {mon['operations']}")
            ok(m.get("state", {}).get("canon") == ("pdCanon" if await pg.evaluate("typeof __tg.pdCanon === 'function'") else "pdx") and (m.get("folder") or {}).get("ros"), f"compared with Fork A's pdCanon; the folder map comes from pdTopicMap ({m.get('state', {}).get('canon')})")
            # ---- 7. the round-trip check
            rt = await pg.evaluate("__tg.pdRoundTrip()")
            ok(rt and rt.get("ok") and not rt.get("refused") and len(rt.get("diffs", [])) == 0 and not any(d["path"].startswith("state.audit") for d in rt.get("since", [])), f"round trip: identical; the export's own log line isn't a later edit (later: {[d['path'] for d in (rt or {}).get('since', [])][:3]})")
            ok(len(m.get("state", {}).get("sha256", "")) == 64, "manifest keeps the data's fingerprint at export time")
            ok(await pg.evaluate("__tg.UI().toastUndo") is False, "the export/check toasts offer no Undo")
            await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='profile'; U.pxSec='data'; __tg.render(); })()"); await pg.wait_for_timeout(500)
            card = await pg.evaluate("(()=>{ const c=[...document.querySelectorAll('.px-card')].find(x=>/For the server/.test(x.textContent)); return c ? c.innerText : ''; })()")
            ok("Export for the server" in card and "Identical — 0 differences" in card and "Compressed folder" in card, "the card on Your data shows the export and the result")
            el = await pg.query_selector(".px-card:has(.pdx-row)")
            if el: await el.screenshot(path=os.path.join(OUT, "1_card_ok.png"))
            # ---- 8. a changed line is refused, by line
            pp = f"Parsec Data/Exports/{ex['name']}/tables/punches.jsonl"
            txt = base64.b64decode(await pg.evaluate(READ, (pp))).decode()
            lines = txt.split("\n"); orig = txt
            lines[4] = lines[4].replace('"start":"2', '"start":"1', 1) if '"start":"2' in lines[4] else lines[4][:-2] + ' }'
            await pg.evaluate(WRITE, ([pp, "\n".join(lines)]))
            rt2 = await pg.evaluate(f"__tg.pdRoundTrip({json.dumps(ex['name'])})")
            probs = " | ".join(rt2.get("problems", [])) if rt2 else ""
            ok(rt2 and rt2.get("refused") and "tables/punches.jsonl: line 5" in probs, f"a changed line is refused and named: {probs[:120]}")
            await pg.evaluate(WRITE, ([pp, orig]))
            # ---- 9. a missing attachment is refused
            await pg.evaluate(DEL, (f"Parsec Data/Exports/{ex['name']}/{ap[0]}"))
            rt3 = await pg.evaluate(f"__tg.pdRoundTrip({json.dumps(ex['name'])})")
            probs3 = " | ".join(rt3.get("problems", [])) if rt3 else ""
            ok(rt3 and rt3.get("refused") and (ap[0] + ": missing") in probs3, f"a missing file is refused and named: {probs3[:120]}")
            await pg.evaluate("__tg.render()"); await pg.wait_for_timeout(300)
            el = await pg.query_selector(".px-card:has(.pdx-row)")
            if el: await el.screenshot(path=os.path.join(OUT, "2_card_refused.png"))
            # ---- 10. something changed after the export shows as a difference (a fresh export first)
            ex2 = await pg.evaluate("(async()=>{ const r=await __tg.pdExportForServer(); return r && r.name; })()")
            await pg.evaluate("(()=>{ __tg.STATE().ros[0].customerName='Changed After Export'; })()")
            rt4 = await pg.evaluate(f"__tg.pdRoundTrip({json.dumps(ex2)})")
            ok(rt4 and rt4.get("ok") and any("customerName" in d.get("path", "") for d in rt4.get("since", [])), f"the export still checks identical; a change made after it is listed as later work ({[d['path'] for d in (rt4 or {}).get('since', [])][:3]})")
            await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='profile'; U.pxSec='data'; __tg.render(); })()"); await pg.wait_for_timeout(300)
            card2 = await pg.evaluate("(()=>{ const c=[...document.querySelectorAll('.px-card')].find(x=>/For the server/.test(x.textContent)); return c ? c.innerText : ''; })()")
            ok("Parsec has changed since this export" in card2, "the card says later edits aren't in the export")
            mp = f"Parsec Data/Exports/{ex2}/manifest.json"
            mt = json.loads(base64.b64decode(await pg.evaluate(READ, (mp))).decode()); mt["state"]["sha256"] = "0" * 64
            await pg.evaluate(WRITE, ([mp, json.dumps(mt)]))
            rt5 = await pg.evaluate(f"__tg.pdRoundTrip({json.dumps(ex2)})")
            ok(rt5 and not rt5.get("ok") and len(rt5.get("diffs", [])) > 0, f"tables that don't rebuild to the fingerprint fail ({len((rt5 or {}).get('diffs', []))} differences listed)")
            await pg.screenshot(path=os.path.join(OUT, "3_data_page.png"))
            # ---- 11. after the move from layout 15 to 16: an attachment in a Closed RO is in the export
            if await pg.evaluate("typeof __tg.writeFolderState15 === 'function' && typeof __tg.pd16Info === 'function'"):
                await pg.evaluate(CONNECT)
                rid = await pg.evaluate("""(async()=>{ const S=__tg.STATE(); const r=S.ros[3]; r.status={status:'Complete – Released', sub:null, setAt:new Date().toISOString()};
                  await __tg.writeFolderState15(true); return r.id; })()""")
                d15 = (await pg.evaluate("__tg.pd16Info().dirs"))[rid]
                await pg.evaluate(WRITE, ([f"Parsec Data/ROs/{d15}/Attachments/closed.jpg", "CLOSEDJPEG" * 50]))
                await pg.evaluate("""(async(rid)=>{ const r=__tg.STATE().ros.find(x=>x.id===rid), d=__tg.pd16Info().dirs[rid]; r.bulletins=r.bulletins||[];
                  r.bulletins.push({id:'b16c', task:'pics', files:[{id:'f16c', name:'closed.jpg', size:500, type:'image/jpeg', inFolder:true, folder:d, fname:'closed.jpg'}]}); await __tg.writeFolderState15(true); })""", rid)
                ok("/" not in d15 and await pg.evaluate(EXISTS, "Parsec Data/Shop/Shop.html"), f"a layout 15 folder to start from (ROs/{d15})")
                await pg.goto(f"http://localhost:{PORT}/{PAGE}"); await pg.wait_for_timeout(1500)
                await pg.evaluate("(async()=>{ const F=__tg.FS(); F.dir=await navigator.storage.getDirectory(); F.dirName='Test folder'; F.status='connected'; await __tg.adoptFolderState(); })()")
                await pg.wait_for_timeout(1500)
                info = await pg.evaluate("__tg.pd16Info()")
                dn = info["dirs"].get(rid, "")
                ok(info["on"] and not info["failed"] and dn.startswith("Closed/"), f"moved to layout 16; the released RO is in {dn} ({info['failed'] or 'no problems'})")
                ok(await pg.evaluate(EXISTS, f"Parsec Data/ROs/{dn}/Attachments/closed.jpg"), "its attachment moved with it")
                for _ in range(6):
                    h1 = await pg.evaluate("JSON.stringify(__tg.pdxCanon(__tg.STATE())).length"); await pg.wait_for_timeout(1500)
                    if h1 == await pg.evaluate("JSON.stringify(__tg.pdxCanon(__tg.STATE())).length"): break
                ex3 = await pg.evaluate("(async()=>{ const r=await __tg.pdExportForServer(); return r && { name: r.name, m: r.manifest }; })()")
                fl3 = {f["path"]: f for f in (ex3 or {}).get("m", {}).get("files", [])}
                cp = [k for k in fl3 if k.startswith("attachments/") and k.endswith("/closed.jpg")]
                raw3 = base64.b64decode(await pg.evaluate(READ, (f"Parsec Data/Exports/{ex3['name']}/{cp[0]}"))) if cp else b""
                ok(bool(cp) and hashlib.sha256(raw3).hexdigest() == fl3[cp[0]]["sha256"], f"export after the move: the Closed RO's attachment is in it, checksum right ({cp[:1]})")
                att3 = base64.b64decode(await pg.evaluate(READ, (f"Parsec Data/Exports/{ex3['name']}/tables/attachments.jsonl"))).decode() if ex3 else ""
                ok(any(json.loads(l).get("_ro_id") == rid and json.loads(l).get("name", "").endswith("closed.jpg") for l in att3.splitlines() if l), "tables/attachments.jsonl links it to its RO")
                rt6 = await pg.evaluate(f"__tg.pdRoundTrip({json.dumps(ex3['name'])})") if ex3 else None
                ok(rt6 and rt6.get("ok") and not rt6.get("diffs"), f"…and the round trip is identical ({(rt6 or {}).get('problems') or (rt6 or {}).get('diffs')})")
            else: ok(False, "layout 16 (Fork A) isn't in this build")
            ok(not errs, "no page errors: " + " | ".join(errs[:3]))
            await b.close()
    finally:
        srv.terminate()
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
