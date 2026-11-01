# Parsec 16 (A) — the data store core: every key reaches the folder (and survives a reload), the layout 16 tree, Open→Closed and
# back with an attachment, only changed files rewritten, the move from layout 15 (read-back verify; a forced mismatch keeps the old
# files and keeps saving the old way), updatedAt + deletion marks, a two-computer merge (both kept; a real clash asks; Undo), and
# the build's data check failing on a fake STATE.zzz. The folder is the browser's private file system (OPFS) over http.
import asyncio, os, sys, json, subprocess, time, re
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12_a.html"
PORT = 8761
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
LIB = r"""
window.T = {
  root: () => navigator.storage.getDirectory(),
  dir: async (path, create) => { let d = await navigator.storage.getDirectory(); for (const p of path.split('/').filter(Boolean)) d = await d.getDirectoryHandle(p, { create: !!create }); return d; },
  walk: async (path) => { const out = []; const go = async (d, pre) => { for await (const [n, h] of d.entries()) { const p = pre ? pre + '/' + n : n; if (h.kind === 'directory') await go(h, p); else { const f = await h.getFile(); out.push({ path: p, size: f.size, t: f.lastModified }); } } };
    try { await go(await T.dir(path || ''), ''); } catch (e) {} return out.sort((a, b) => a.path < b.path ? -1 : 1); },
  has: async (path) => { const parts = path.split('/'), leaf = parts.pop(); try { const d = await T.dir(parts.join('/')); try { await d.getFileHandle(leaf); return 'file'; } catch (e) { await d.getDirectoryHandle(leaf); return 'dir'; } } catch (e) { return false; } },
  read: async (path) => { const parts = path.split('/'), leaf = parts.pop(); const d = await T.dir(parts.join('/')); const f = await (await d.getFileHandle(leaf)).getFile();
    if (/\.gz$/.test(leaf)) return await new Response(f.stream().pipeThrough(new DecompressionStream('gzip'))).text(); return await f.text(); },
  bytes0: async (path) => { const parts = path.split('/'), leaf = parts.pop(); const d = await T.dir(parts.join('/')); const f = await (await d.getFileHandle(leaf)).getFile(); return Array.from(new Uint8Array(await f.slice(0, 2).arrayBuffer())); },
  write: async (path, text) => { const parts = path.split('/'), leaf = parts.pop(); const d = await T.dir(parts.join('/'), true); const w = await (await d.getFileHandle(leaf, { create: true })).createWritable();
    if (/\.gz$/.test(leaf)) { const b = await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))).blob(); await w.write(b); } else await w.write(text); await w.close(); },
  clear: async () => { const r = await navigator.storage.getDirectory(); for await (const [n] of r.entries()) await r.removeEntry(n, { recursive: true }); },
  connect: async () => { const F = __tg.FS(); F.dir = await navigator.storage.getDirectory(); F.dirName = 'opfs'; F.status = 'connected'; },
  S: () => __tg.STATE()
};
"""
NINE = {"rlLayout": {"cols": ["ro", "cust"], "t": 1}, "rlViews": [{"id": "v1", "name": "Mine"}], "rlCustom": {"a": 1}, "tcDone": [{"id": "tc1", "ro": "x", "hrs": 1.5}],
        "tlAirWhy": {"Sam|2026-10-01|600": "waiting on parts"}, "perm": {"v": 1, "roles": {}, "rules": {"eod": True, "idle": 0}}, "tlReq": [{"id": "rq1", "what": "fix"}],
        "handover": {"at": "2026-10-30T10:00:00.000Z", "by": "Sam", "text": "bay 3"}, "pages128": True}
async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--directory", H], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.0)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); pg.set_default_timeout(15000); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
            pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
            await pg.route("**/fonts.g*/**", lambda r: r.abort())
            URL = "http://localhost:%d/%s" % (PORT, PAGE)
            async def boot(clear_local):
                if clear_local: await pg.evaluate("(()=>{ try{ localStorage.clear(); }catch(e){} })()")
                await pg.goto(URL); await pg.wait_for_timeout(1500); await pg.evaluate(LIB)
            async def E(js): return await pg.evaluate("(async()=>{ " + js + " })()")
            await pg.goto(URL); await pg.wait_for_timeout(300); await pg.evaluate("(()=>{ try{ localStorage.clear(); }catch(e){} })()")
            await boot(False)
            await E("await T.clear();")
            await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
            await E("const S=T.S(); const N=" + json.dumps(NINE) + "; Object.keys(N).forEach(k=>S[k]=N[k]); S.zzOddKey={why:'nobody placed me'}; __tg.scheduleSave(true);")
            await pg.wait_for_timeout(600)
            # ---------- 1. a new folder starts in layout 16
            await E("await T.connect(); await __tg.adoptFolderState();")
            info = await E("return __tg.pd16Info();")
            ok(info["on"] and info["layout"] == 16, "a new folder starts in layout 16 (%s)" % info["layout"])
            files = [f["path"] for f in await E("return await T.walk('Parsec Data');")]
            lay = json.loads(await E("return await T.read('Parsec Data/layout.json');"))
            ok(lay.get("layout") == 16 and lay.get("writeId") and lay.get("shop", {}).get("id"), "layout.json: layout 16, a write id, the shop's id")
            for t in ["people", "settings", "inventory", "inbox", "library", "time", "completed", "lists", "other", "deleted"]:
                ok("Shop/%s.json" % t in files, "Shop/%s.json is there" % t)
            ok(any(re.match(r"Shop/clock/\d{4}-\d\d\.json$", f) for f in files), "the day clock by month: Shop/clock/<YYYY-MM>.json")
            ok(any(re.match(r"Shop/activity/\d{4}-\d\d\.json$", f) for f in files), "the activity by month: Shop/activity/<YYYY-MM>.json")
            ok("Shop/Shop.html" not in files, "no Shop.html in layout 16")
            opens = [f for f in files if re.match(r"ROs/Open/[^/]+/ro\.json$", f)]
            closed = [f for f in files if re.match(r"ROs/Closed/\d{4}/[^/]+/ro\.json\.gz$", f)]
            nro = await E("return T.S().ros.length;")
            nclosed = await E("return T.S().ros.filter(r=>__tg.roStatus(r) && /^Complete – Released$|^Declined$/.test((__tg.roStatus(r).status||__tg.roStatus(r)))).length;")
            ok(len(opens) + len(closed) == nro, "one folder per RO: %d open + %d closed = %d ROs" % (len(opens), len(closed), nro))
            ok(len(closed) == nclosed, "closed ROs are under Closed/<year> as ro.json.gz (%d)" % len(closed))
            pages = [f for f in files if re.match(r"ROs/(Open|Closed/\d{4})/[^/]+/[^/]+ Repair Order\.html$", f)]
            ok(len(pages) == nro, "a readable page beside each ro.json (%d)" % len(pages))
            pg0 = await E("return await T.read(" + json.dumps("Parsec Data/" + pages[0]) + ");")
            ok("parsec-data" not in pg0 and "<h1>" in pg0, "the page has no data inside it")
            if closed:
                b0 = await E("return await T.bytes0(" + json.dumps("Parsec Data/" + closed[0]) + ");")
                ok(b0 == [0x1f, 0x8b], "a closed RO's ro.json.gz is compressed")
            other = json.loads(await E("return await T.read('Parsec Data/Shop/other.json');"))
            ok(other.get("zzOddKey", {}).get("why") == "nobody placed me", "a kind nobody placed lands in Shop/other.json")
            tmap = await E("return __tg.pdTopicMap();")
            ok(all(k in tmap for k in NINE) and tmap["tcDone"] == "Shop/completed.json" and tmap["zzOddKey"] == "Shop/other.json", "pdTopicMap places the 9 kinds; others → other.json")
            # ---------- 2. the 9 kinds survive a reload (from the folder alone)
            await boot(True)
            await E("await T.connect(); await __tg.adoptFolderState();")
            got = await E("const S=T.S(); return " + json.dumps(list(NINE)) + ".reduce((o,k)=>{ o[k]=S[k]; return o; }, {});")
            def sub(want, have):   # what the test put in is all there (records also carry updatedAt/updatedBy; the app fills in perm's roles)
                if isinstance(want, dict): return isinstance(have, dict) and all(k in have and sub(v, have[k]) for k, v in want.items())
                if isinstance(want, list): return isinstance(have, list) and all(any(sub(a, c) for c in have) for a in want)
                return want == have
            for k, v in NINE.items():
                ok(sub(v, got.get(k)), "STATE.%s came back from the folder" % k)
            ok((await E("return T.S().zzOddKey && T.S().zzOddKey.why;")) == "nobody placed me", "the unplaced kind came back from Shop/other.json")
            ok((await E("return T.S().ros.length;")) == nro, "all %d ROs came back" % nro)
            # ---------- 3. only changed files are rewritten
            await E("await __tg.writeFolderState();"); await pg.wait_for_timeout(300)
            before = {f["path"]: f["t"] for f in await E("return await T.walk('Parsec Data');")}
            await pg.wait_for_timeout(60)
            rid = await E("const r=T.S().ros.find(r=>!/Closed/.test(__tg.pd16Info().dirs[r.id]||'')); r.unitNumber='U-ONLY-ME'; return r.id;")
            await E("await __tg.writeFolderState();")
            after = {f["path"]: f["t"] for f in await E("return await T.walk('Parsec Data');")}
            changed = sorted(p for p in after if before.get(p) != after[p])
            rdir = (await E("return __tg.pd16Info().dirs;"))[rid]
            want = {"layout.json", "ROs/%s/ro.json" % rdir}
            ok(want <= set(changed) and all(p in want or p.startswith("ROs/%s/" % rdir) for p in changed), "one RO edited → only its ro.json, its page and layout.json were written (%s)" % ", ".join(changed))
            ro1 = json.loads(await E("return await T.read(" + json.dumps("Parsec Data/ROs/%s/ro.json" % rdir) + ");"))
            ok(ro1["ro"]["unitNumber"] == "U-ONLY-ME" and ro1["ro"].get("updatedAt") and ro1["ro"].get("updatedBy"), "the edit got updatedAt and updatedBy (%s)" % ro1["ro"].get("updatedBy"))
            # ---------- 4. Open → Closed with its attachment, and back
            await E("const S=T.S(), r=S.ros.find(x=>x.id===" + json.dumps(rid) + "), d=__tg.pd16Info().dirs[r.id]; await T.write('Parsec Data/ROs/'+d+'/Attachments/brake.jpg','JPEGDATA');"
                    "r.bulletins=r.bulletins||[]; r.bulletins.push({id:'b16', task:'pics', files:[{id:'f16', name:'brake.jpg', size:8, type:'image/jpeg', inFolder:true, folder:d, fname:'brake.jpg'}]});"
                    "r.status={status:'Complete – Released', sub:null, setAt:new Date().toISOString()}; await __tg.writeFolderState();")
            d2 = (await E("return __tg.pd16Info().dirs;"))[rid]
            yr = await E("return String(new Date().getFullYear());")
            ok(d2.startswith("Closed/" + yr + "/"), "released → the RO's folder moved to Closed/%s (%s)" % (yr, d2))
            ok((await E("return await T.has(" + json.dumps("Parsec Data/ROs/%s/Attachments/brake.jpg" % d2) + ");")) == "file", "its attachment moved with it")
            ok((await E("return await T.has(" + json.dumps("Parsec Data/ROs/%s/ro.json.gz" % d2) + ");")) == "file" and not await E("return await T.has(" + json.dumps("Parsec Data/ROs/%s/ro.json" % d2) + ");"), "closed: ro.json.gz, no ro.json")
            ok(not await E("return await T.has(" + json.dumps("Parsec Data/ROs/" + rdir) + ");"), "the Open folder is gone")
            ok((await E("const r=T.S().ros.find(x=>x.id===" + json.dumps(rid) + "); return r.bulletins.find(b=>b.id==='b16').files[0].folder;")) == d2, "the attachment record points at the new folder")
            await E("const r=T.S().ros.find(x=>x.id===" + json.dumps(rid) + "); r.status={status:'Working', sub:null, setAt:new Date().toISOString()}; await __tg.writeFolderState();")
            d3 = (await E("return __tg.pd16Info().dirs;"))[rid]
            ok(d3 == rdir and (await E("return await T.has(" + json.dumps("Parsec Data/ROs/%s/Attachments/brake.jpg" % d3) + ");")) == "file", "reopened → back in Open with the attachment (%s)" % d3)
            ok((await E("return await T.has(" + json.dumps("Parsec Data/ROs/%s/ro.json" % d3) + ");")) == "file" and not await E("return await T.has(" + json.dumps("Parsec Data/ROs/%s/ro.json.gz" % d3) + ");"), "open again: ro.json, no .gz")
            ok(not await E("return await T.has(" + json.dumps("Parsec Data/ROs/" + d2) + ");"), "nothing left behind under Closed")
            # ---------- 5. deletion marks
            pid = await E("const S=T.S(); const p=S.punches.find(p=>p.stop); S.punches=S.punches.filter(x=>x!==p); await __tg.writeFolderState(); return p.id;")
            tomb = await E("return (T.S().tombs||[]).find(t=>t.id===" + json.dumps(pid) + ");")
            ok(tomb and tomb["kind"] == "punches" and tomb.get("deletedAt") and tomb.get("by"), "a deleted punch leaves a mark {kind, id, deletedAt, by}")
            dj = json.loads(await E("return await T.read('Parsec Data/Shop/deleted.json');"))
            ok(any(t["id"] == pid for t in dj.get("tombs", [])), "the mark is in Shop/deleted.json")
            opid = await E("const r=T.S().ros.find(x=>x.id===" + json.dumps(rid) + "); const o=r.operations.pop(); await __tg.writeFolderState(); return o && o.id;")
            ot = await E("return (T.S().tombs||[]).find(t=>t.id===" + json.dumps(opid) + ");")
            ok(ot and ot["kind"] == "operations" and ot["parentId"] == rid, "a deleted operation's mark names its RO (parentId)")
            n = await E("return __tg.pdTombsClear([" + json.dumps(pid) + "]);")
            ok(n == 1 and not await E("return (T.S().tombs||[]).some(t=>t.id===" + json.dumps(pid) + ");"), "pdTombsClear(ids) clears just those")
            await pg.wait_for_timeout(1200); await E("await __tg.writeFolderState();"); await pg.wait_for_timeout(800)   # let this computer's own saves settle
            # ---------- 6. two computers: both changes kept
            D = await E("return __tg.pd16Info().dirs;")
            ids = await E("return T.S().ros.filter(r=>!/^Closed/.test(__tg.pd16Info().dirs[r.id]||'')).slice(0,3).map(r=>r.id);")
            A, B, C = ids[0], ids[1], ids[2]
            async def theirs(rid_, field, val, later_s=60):
                path = "Parsec Data/ROs/%s/ro.json" % D[rid_]
                await E("const o=JSON.parse(await T.read(" + json.dumps(path) + ")); o.ro[" + json.dumps(field) + "]=" + json.dumps(val) + "; o.ro.updatedAt=new Date(Date.now()+" + str(later_s * 1000) + ").toISOString(); o.ro.updatedBy='Jo (other computer)';"
                        "await T.write(" + json.dumps(path) + ", JSON.stringify(o)); const L=JSON.parse(await T.read('Parsec Data/layout.json')); L.writeId='w_other_'+Math.random().toString(36).slice(2); L.savedAt=Date.now()+1000; await T.write('Parsec Data/layout.json', JSON.stringify(L));")
            await theirs(A, "unitNumber", "THEIRS-A")
            await E("const r=T.S().ros.find(x=>x.id===" + json.dumps(B) + "); r.unitNumber='MINE-B';")
            await E("await __tg.writeFolderState();"); await pg.wait_for_timeout(300)
            st = await E("const S=T.S(); return { a: S.ros.find(x=>x.id===" + json.dumps(A) + ").unitNumber, b: S.ros.find(x=>x.id===" + json.dumps(B) + ").unitNumber, clash: !!document.querySelector('.pd16-clash') };")
            ok(st["a"] == "THEIRS-A" and st["b"] == "MINE-B" and not st["clash"], "another computer changed RO A, this one RO B → both kept, nobody asked (%s)" % st)
            await pg.wait_for_timeout(700)
            onDisk = await E("const D=__tg.pd16Info().dirs; const a=JSON.parse(await T.read('Parsec Data/ROs/'+D[" + json.dumps(A) + "]+'/ro.json')), b=JSON.parse(await T.read('Parsec Data/ROs/'+D[" + json.dumps(B) + "]+'/ro.json')); return [a.ro.unitNumber, b.ro.unitNumber];")
            ok(onDisk == ["THEIRS-A", "MINE-B"], "the folder holds both changes after the save (%s)" % onDisk)
            act = await E("return (T.S().audit||[]).filter(a=>a.type==='merge').map(a=>a.text).pop()||'';")
            ok(act.startswith("Merged another computer"), "the merge left an Activity line: %s" % act[:90])
            await E("__tg.undoLast();"); await pg.wait_for_timeout(200)
            ua = await E("return T.S().ros.find(x=>x.id===" + json.dumps(A) + ").unitNumber;")
            ok(ua != "THEIRS-A", "Undo takes the merge back (RO A: %s)" % ua)
            await pg.wait_for_timeout(1200); await E("await __tg.writeFolderState();"); await pg.wait_for_timeout(800)
            # ---------- 7. a real clash asks: Keep this / Keep that, the newer picked
            D = await E("return __tg.pd16Info().dirs;")
            await theirs(C, "keyTag", "TAG-THEIRS", 120)
            await E("const r=T.S().ros.find(x=>x.id===" + json.dumps(C) + "); r.keyTag='TAG-MINE';")
            await E("__tg.writeFolderState();"); await pg.wait_for_timeout(900)
            dlg = await E("const d=document.querySelector('.pd16-clash'); if(!d) return null; const rows=[...d.querySelectorAll('[data-cid]')]; return { n: rows.length, txt: d.textContent.slice(0,600), on: rows.map(r=>r.querySelector('.is-on').dataset.pick) };")
            ok(dlg and dlg["n"] == 1, "both changed RO C's key tag → one row to decide (%s)" % (dlg and dlg["n"]))
            if dlg:
                ok("TAG-MINE" in dlg["txt"] and "TAG-THEIRS" in dlg["txt"] and "Keep this" in dlg["txt"] and "Keep that" in dlg["txt"], "the row shows both values, Keep this / Keep that")
                ok(dlg["on"] == ["theirs"], "the newer one is picked for you (the other computer's)")
                await pg.screenshot(path=os.path.join(H, "shot160a_clash.png"))
                ok((await E("return await __tg.writeFolderState();")) is False, "saving waits while the question is open")
                await E("document.querySelector('.pd16-clash [data-pick=mine]').click(); document.querySelector('.pd16-clash [data-pd=use]').click();"); await pg.wait_for_timeout(300)
                await E("await __tg.writeFolderState();"); await pg.wait_for_timeout(600)
                kc = await E("return T.S().ros.find(x=>x.id===" + json.dumps(C) + ").keyTag;")
                fc = await E("const D=__tg.pd16Info().dirs; return JSON.parse(await T.read('Parsec Data/ROs/'+D[" + json.dumps(C) + "]+'/ro.json')).ro.keyTag;")
                ok(kc == "TAG-MINE" and fc == "TAG-MINE" and not await E("return !!document.querySelector('.pd16-clash');"), "Keep this → this computer's value, in memory and in the folder (%s / %s)" % (kc, fc))
            # a deletion there beats an older edit here
            D = await E("return __tg.pd16Info().dirs;")
            await E("const D=" + json.dumps(D) + "; const id=" + json.dumps(B) + "; const dj=JSON.parse(await T.read('Parsec Data/Shop/deleted.json')); dj.tombs=(dj.tombs||[]).concat([{kind:'ros', id, parentId:null, deletedAt:new Date(Date.now()+90000).toISOString(), by:'Jo'}]);"
                    "await T.write('Parsec Data/Shop/deleted.json', JSON.stringify(dj)); const L=JSON.parse(await T.read('Parsec Data/layout.json')); L.writeId='w_del'; await T.write('Parsec Data/layout.json', JSON.stringify(L));")
            await E("await __tg.writeFolderState();"); await pg.wait_for_timeout(500)
            ok(not await E("return T.S().ros.some(x=>x.id===" + json.dumps(B) + ");"), "RO B deleted on the other computer (after this one's last edit) → gone here too")
            # ---------- 8. the move from layout 15: verified, then tidied
            await boot(True); await E("await T.clear();")
            await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(200)
            await E("const S=T.S(); const N=" + json.dumps(NINE) + "; Object.keys(N).forEach(k=>S[k]=N[k]); __tg.scheduleSave(true);"); await pg.wait_for_timeout(600)
            await E("await T.connect(); await __tg.writeFolderState15(true);")
            f15 = [f["path"] for f in await E("return await T.walk('Parsec Data');")]
            ok("Shop/Shop.html" in f15 and not any(f.startswith("ROs/Open/") for f in f15), "a layout 15 folder to start from (Shop/Shop.html, ROs/<RO>/…)")
            leaf = await E("const d=__tg.pd16Info().dirs, r=T.S().ros.find(r=>d[r.id] && !/\\//.test(d[r.id])); await T.write('Parsec Data/ROs/'+d[r.id]+'/Attachments/old.jpg','OLDJPEG');"
                           "r.bulletins=r.bulletins||[]; r.bulletins.push({id:'b15', task:'pics', files:[{id:'f15', name:'old.jpg', size:7, type:'image/jpeg', inFolder:true, folder:d[r.id], fname:'old.jpg'}]}); await __tg.writeFolderState15(true); return [r.id, d[r.id]];")
            await boot(False)                      # same browser copy, the folder still in layout 15
            canon0 = await E("return __tg.pdCanon(T.S());")
            await E("await T.connect(); await __tg.adoptFolderState();"); await pg.wait_for_timeout(500)
            info = await E("return __tg.pd16Info();")
            f16 = [f["path"] for f in await E("return await T.walk('Parsec Data');")]
            ok(info["on"] and not info["failed"], "moved to layout 16 (%s)" % (info["failed"] or "no problems"))
            ok("layout.json" in f16 and "layout.json.pending" not in f16, "layout.json written only after the read-back matched")
            ok(any("before Parsec 16" in f for f in f16 if f.startswith("Backups/")), "a backup was made first: %s" % [f for f in f16 if f.startswith("Backups/")][:2])
            ok("Shop/Shop.html" not in f16 and not any(re.match(r"ROs/[^/]+/[^/]+ Repair Order\.html$", f) for f in f16) and ("ROs/" + leaf[1] + "/Attachments/old.jpg") not in f16, "then the old Shop.html, the old RO pages and the copied attachments went")
            nd = info["dirs"][leaf[0]]
            ok(("ROs/%s/Attachments/old.jpg" % nd) in f16, "the attachment is in the new folder (%s)" % nd)
            ok((await E("return T.S().ros.find(r=>r.id===" + json.dumps(leaf[0]) + ").bulletins.find(b=>b.id==='b15').files[0].folder;")) == nd, "its record points there")
            canon1 = await E("const c=JSON.parse(__tg.pdCanon(T.S())); return c;")
            c0 = json.loads(canon0); c1 = canon1
            diff = [k for k in set(c0) | set(c1) if json.dumps(c0.get(k), sort_keys=True) != json.dumps(c1.get(k), sort_keys=True) and k not in ("ros", "pdShop", "savedAt", "pdKeyAt", "audit", "dataV", "dataClean")]
            ok(not diff and len(c1["ros"]) == len(c0["ros"]), "nothing lost in the move (keys that differ: %s)" % diff)
            # ---------- 8b. layout.json goes first (saving) and again last
            await pg.wait_for_timeout(1500); await E("await __tg.writeFolderState();"); await pg.wait_for_timeout(500)
            seen_saving = await E("T.S().ros.forEach(r=>{ r.mileage=String((+r.mileage||0)+1); }); const p=__tg.writeFolderState(); let saw=false; for(let i=0;i<200 && !saw;i++){ try{ saw=!!JSON.parse(await T.read('Parsec Data/layout.json')).saving; }catch(e){} await new Promise(r=>setTimeout(r,5)); } await p; return saw;")
            fin = json.loads(await E("return await T.read('Parsec Data/layout.json');"))
            ok(seen_saving and not fin.get("saving"), "a save writes layout.json first (saving: true), then again when done (saving: false)")
            ok(fin.get("moved", {}).get("backup", "").startswith("Backups/"), "layout.json remembers the backup made before the move: %s" % fin.get("moved", {}).get("backup"))
            # ---------- 8c. a computer still on Parsec 15 saves here afterwards → merged, removed, a banner
            await pg.wait_for_timeout(1200)
            P15 = await E("""const S=T.S(), D=__tg.pd16Info().dirs; const r=S.ros.find(x=>/^Open\//.test(D[x.id]||'') && x.id!==""" + json.dumps(leaf[0]) + """);
              const leaf=D[r.id].split('/').pop(), now=Date.now(), strip=o=>JSON.parse(JSON.stringify(o,(k,v)=>k==='updatedAt'||k==='updatedBy'?undefined:v));
              const pg=(data,title)=>'<!doctype html><html><head><title>'+title+'</title></head><body><main>old page</main><script type="application/json" id="parsec-data">'+JSON.stringify(data).replace(/</g,'\\u003c')+'<\/script></body></html>';
              const c=strip(r); c.unitNumber='FROM-15';
              await T.write('Parsec Data/ROs/'+leaf+'/'+(r.roNumber||r.id)+' Repair Order.html', pg({v:1, savedAt:now, ro:c, punches:[]}, 'x'));
              const n={id:'ro_from15', roNumber:'RO-99915', customerName:'Fifteen Freight', dateOpened:new Date(now-3600e3).toISOString(), status:{status:'Working', sub:null, setAt:new Date(now).toISOString()}, operations:[], bulletins:[], checklist:{}};
              await T.write('Parsec Data/ROs/RO-99915 - Fifteen Freight/RO-99915 Repair Order.html', pg({v:1, savedAt:now, ro:n, punches:[]}, 'y'));
              await T.write('Parsec Data/Shop/Shop.html', pg({v:1, savedAt:now, pageNote:'saved by Parsec 15', orphanPunches:[]}, 'Parsec Shop'));
              return { id: r.id, leaf };""")
            await E("await __tg.writeFolderState();"); await pg.wait_for_timeout(800)
            got15 = await E("const S=T.S(); const r=S.ros.find(x=>x.id===" + json.dumps(P15["id"]) + "); return { unit: r.unitNumber, added: S.ros.some(x=>x.id==='ro_from15'), note: S.pageNote };")
            ok(got15 == {"unit": "FROM-15", "added": True, "note": "saved by Parsec 15"}, "its changes were merged: the edited RO, the new RO, the shop note (%s)" % got15)
            fx15 = [f["path"] for f in await E("return await T.walk('Parsec Data');")]
            ok("Shop/Shop.html" not in fx15 and not any(re.match(r"ROs/[^/]+/[^/]+ Repair Order\.html$", f) for f in fx15), "then its Shop.html and RO pages were removed")
            d15 = await E("return __tg.pd16Info().dirs;")
            ok(d15.get("ro_from15", "").startswith("Open/") and ("ROs/%s/ro.json" % d15.get("ro_from15")) in fx15, "the new RO is saved in layout 16 (%s)" % d15.get("ro_from15"))
            u16 = json.loads(await E("return await T.read('Parsec Data/ROs/'+__tg.pd16Info().dirs[" + json.dumps(P15["id"]) + "]+'/ro.json');"))["ro"]["unitNumber"]
            ok(u16 == "FROM-15", "and the edited RO's ro.json has the change")
            await E("__tg.render();"); await pg.wait_for_timeout(200)
            b15 = await E("const b=document.querySelector('[data-key=alert-pd15]'); return b ? b.textContent : '';")
            ok("A computer still on Parsec 15 saved here — its changes were merged." in b15 and "Update every computer to Parsec 16." in b15, "the banner: %s" % b15[:110])
            a15 = await E("return (T.S().audit||[]).filter(a=>a.type==='merge').map(a=>a.text).pop()||'';")
            ok("Parsec 15" in a15, "an Activity line: %s" % a15[:100])
            await E("document.querySelector('[data-action=pd15-ok]').click();"); await pg.wait_for_timeout(200)
            ok(not await E("return !!document.querySelector('[data-key=alert-pd15]');"), "OK closes the banner (shown once)")
            # ---------- 9. a forced mismatch keeps the old files and keeps saving the old way
            await boot(True); await E("await T.clear();")
            await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(200); await E("__tg.scheduleSave(true);"); await pg.wait_for_timeout(500)
            await E("await T.connect(); await __tg.writeFolderState15(true);")
            f15 = [f["path"] for f in await E("return await T.walk('Parsec Data');")]
            await boot(False)
            await E("__tg.PD16.forceMismatch = true; await T.connect(); await __tg.adoptFolderState();"); await pg.wait_for_timeout(500)
            info = await E("return __tg.pd16Info();")
            fx = [f["path"] for f in await E("return await T.walk('Parsec Data');")]
            ok(not info["on"] and info["failed"], "a mismatch: not moved — %s" % info["failed"][:100])
            ok("layout.json" not in fx and "layout.json.pending" not in fx and not any(f.startswith("ROs/Open/") or f.startswith("ROs/Closed/") for f in fx), "nothing of layout 16 is left behind")
            ok(set(p for p in f15 if not p.startswith("Backups/")) <= set(fx), "every old file is still there")
            await E("__tg.render();"); await pg.wait_for_timeout(200)
            ban = await E("const b=document.querySelector('[data-key=alert-pd16]'); return b ? b.textContent : '';")
            ok("wasn’t moved" in ban and "Nothing was lost" in ban, "a clear message: %s" % ban[:120])
            s0 = await E("const d=await T.dir('Parsec Data/Shop'); return (await (await d.getFileHandle('Shop.html')).getFile()).lastModified;")
            await pg.wait_for_timeout(50)
            await E("T.S().pageNote='still the old way'; __tg.scheduleSave(true);"); await pg.wait_for_timeout(1200)
            s1 = await E("const d=await T.dir('Parsec Data/Shop'); return (await (await d.getFileHandle('Shop.html')).getFile()).lastModified;")
            sh = await E("return await T.read('Parsec Data/Shop/Shop.html');")
            ok(s1 > s0 and "still the old way" in sh, "and it keeps saving in the old layout (Shop.html rewritten)")
            ok(not errs, "no page errors (%s)" % errs[:3])
            await b.close()
    finally:
        srv.kill()
    # ---------- 10. the build's data check
    src = open(os.path.join(H, "b9", "build_v9zzzz_160check.py"), encoding="utf-8").read()
    def run_check(js):
        ns = {"js": js, "LOG": [], "b9": lambda n: open(os.path.join(H, "b9", n), encoding="utf-8").read()}
        try: exec(compile(src, "check", "exec"), ns); return ns["LOG"][-1]
        except SystemExit as e: return "FAILED: " + str(e)
    app = open(os.path.join(H, PAGE), encoding="utf-8").read()
    r1 = run_check(app); ok(r1.startswith("data check:") and "0 left out" in r1, "the data check passes on the app: " + r1)
    r2 = run_check(app + "\nSTATE.zzz = 1;"); ok(r2.startswith("FAILED") and "zzz" in r2, "a fake STATE.zzz stops the build: " + r2.splitlines()[0][:110])
    print("\n%d failed" % len(FAILS) if FAILS else "\nall passed")
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
