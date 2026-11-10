# Parsec 17.5 (E) — a file put straight into an RO's folder (beside its page, not in Attachments) moves into Attachments by
# itself and shows in the RO's attachments; one put in Attachments shows too. The folder is the browser's private folder
# (OPFS) — that needs http, so the app is served on localhost. Invented data only.
import asyncio, os, sys, json, subprocess, time
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
PORT = int(os.environ.get("PORT175E", "8775"))
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
CONNECT = """(async()=>{ const r=await navigator.storage.getDirectory(); for await (const [n] of r.entries()){ await r.removeEntry(n,{recursive:true}); }
  const F=__tg.FS(); F.dir=r; F.dirName='Test folder'; F.status='connected'; return true; })()"""
WRITE = """(async([path, text])=>{ let d=await navigator.storage.getDirectory(); const ps=path.split('/'); const leaf=ps.pop(); for(const p of ps) d=await d.getDirectoryHandle(p,{create:true}); const w=await (await d.getFileHandle(leaf,{create:true})).createWritable(); await w.write(text); await w.close(); return true; })"""
EXISTS = """(async(path)=>{ try{ let d=await navigator.storage.getDirectory(); const ps=path.split('/'); const leaf=ps.pop(); for(const p of ps) d=await d.getDirectoryHandle(p); await d.getFileHandle(leaf); return true; }catch(e){ return false; } })"""
FILES = "id => __tg.getRO(id).bulletins.flatMap(b => b.files || []).map(f => f.name)"
async def main():
    srv = subprocess.Popen(["python3", "-m", "http.server", str(PORT), "--directory", H], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.0)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); pg.set_default_timeout(15000); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
            await pg.route("**/fonts.g*/**", lambda r: r.abort())
            await pg.goto(f"http://localhost:{PORT}/{PAGE}"); await pg.wait_for_timeout(3600)
            await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(400)
            await pg.evaluate(CONNECT); await pg.evaluate("__tg.scheduleSave(true)"); await pg.wait_for_timeout(2500)
            rid = await pg.evaluate("__tg.STATE().ros.find(r => !r.dateClosed && !r.shop).id")
            fold = await pg.evaluate("id => __tg.pd16Info().dirs[id]", rid)
            ok(bool(fold), "the RO has its folder (%s)" % fold)
            await pg.evaluate("id => { const U = __tg.UI(); U.view = 'ros'; U.selectedRo = id; __tg.render(); }", rid); await pg.wait_for_timeout(800)
            await pg.evaluate(WRITE, [f"Parsec Data/ROs/{fold}/brake-drum.jpg", "JPEGDATA" * 200])
            await pg.evaluate(WRITE, [f"Parsec Data/ROs/{fold}/Attachments/estimate.pdf", "%PDF-1.4 test"])
            got = []
            for _ in range(14):
                await pg.wait_for_timeout(1500); got = await pg.evaluate(FILES, rid)
                if "brake-drum.jpg" in got and "estimate.pdf" in got: break
            ok("brake-drum.jpg" in got and "estimate.pdf" in got, "both show on the RO — the one beside the page and the one in Attachments (%s)" % got)
            moved = [await pg.evaluate(EXISTS, f"Parsec Data/ROs/{fold}/brake-drum.jpg"), await pg.evaluate(EXISTS, f"Parsec Data/ROs/{fold}/Attachments/brake-drum.jpg")]
            ok(moved == [False, True], "the loose file moved into Attachments (%s)" % moved)
            ok(not errs, "no page errors (%s)" % errs[:2])
            await b.close()
    finally:
        srv.terminate()
    print("\n%d failed" % len(FAILS) if FAILS else "\nall passed")
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
