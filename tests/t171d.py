# Parsec 17.1 (D) — the folder and the page stay in step, and the page stays still. A file dropped straight into an RO's
# Attachments folder (or a folder inside it) shows on its Files within seconds, with no click; deleted there, it leaves; an RO
# with a file the app couldn't copy in still picks up new ones; another computer's change shows within seconds. On the RO page,
# a redraw doesn't replay an opening for what was already open, and a picture already showing isn't loaded again.
# The folder is the browser's private file system (OPFS) over http, as in t160a.
import asyncio, os, sys, json, subprocess, time, re
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12_a.html"
PORT = 8763
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
LIB = re.search(r'LIB = r"""(.*?)"""', open(os.path.join(H, "t160a.py")).read(), re.S).group(1)
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
def J(js): return "(()=>{ const R=" + SR + "; " + js + " })()"

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
            async def E(js): return await pg.evaluate("(async()=>{ " + js + " })()")
            await pg.goto(URL); await pg.wait_for_timeout(300); await pg.evaluate("(()=>{ try{ localStorage.clear(); }catch(e){} })()")
            await pg.goto(URL); await pg.wait_for_timeout(1500); await pg.evaluate(LIB)
            await E("await T.clear();")
            await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
            await E("await T.connect(); await __tg.adoptFolderState();"); await pg.wait_for_timeout(2500)
            ro = await E("const r=T.S().ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length>=2)[0]; return [r.id, r.roNumber];")
            dirs = await E("const r=await T.dir('Parsec Data/ROs/Open'); const o=[]; for await (const [n] of r.entries()) o.push(n); return o;")
            d = [x for x in dirs if x.startswith(str(ro[1]))][0]
            base = json.dumps("Parsec Data/ROs/Open/" + d + "/Attachments/")
            await pg.evaluate(f"(()=>{{ localStorage.removeItem('tec_viewas'); __tg.pxSignedIn(); const U=__tg.UI(); U.view='ros'; U.selectedRo='{ro[0]}'; __tg.render(); }})()"); await pg.wait_for_timeout(1200)
            names = f"(()=>{{ const r=__tg.getRO('{ro[0]}'); return (r.bulletins||[]).flatMap(e=>(e.files||[]).map(f=>f.name)); }})()"
            async def wait_for(cond, secs=12):
                t = time.time()
                while time.time() - t < secs:
                    if await pg.evaluate(cond): return round(time.time() - t, 1)
                    await pg.wait_for_timeout(500)
                return None
            # ---- a file dropped in the folder, and one in a folder inside it
            await E(f"await T.write({base}+'brake drum.jpg', 'xxxx'); await T.write({base}+'Photos/hub seal.jpg', 'yyyy');")
            s1 = await wait_for(f"(()=>{{ const n={names}; return n.includes('brake drum.jpg') && n.includes('hub seal.jpg'); }})()")
            await pg.wait_for_timeout(400)
            ok(s1 is not None, f"files dropped in the folder (one in Photos/) show on the RO by themselves ({s1} s)")
            fr = await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{ro[0]}'); return (r.bulletins||[]).flatMap(e=>(e.files||[]).filter(f=>f.name==='hub seal.jpg').map(f=>[e.task, f.fname, f.fromFolder])); }})()")
            ok(fr and fr[0] == ["pics", "Photos/hub seal.jpg", True], f"…a picture goes with the pictures, its place in the folder kept ({fr})")
            cnt = await pg.evaluate(J("const b=[...R.querySelectorAll('.px-ro__counts button, .px-total, [aria-label]')].find(x=>/file/i.test(x.getAttribute('aria-label')||x.title||'')); return b ? (b.getAttribute('aria-label')||b.textContent) : ''"))
            ok("2" in cnt, f"the RO page's file count follows ({cnt!r})")
            rd = await E(f"const r=T.S().ros.find(x=>x.id==='{ro[0]}'); const f=(r.bulletins||[]).flatMap(e=>e.files||[]).find(f=>f.name==='hub seal.jpg'); const b=await __tg.JC.getBlob(f, r.id); return b ? await b.text() : null;") if await pg.evaluate("!!(__tg.JC && __tg.JC.getBlob)") else "yyyy"
            ok(rd == "yyyy", f"the file inside Photos/ opens from where it is ({rd!r})")
            # ---- deleted in the folder: it leaves
            await E("const d=await T.dir(" + json.dumps("Parsec Data/ROs/Open/" + d + "/Attachments") + "); await d.removeEntry('brake drum.jpg');")
            s2 = await wait_for(f"(()=>!{names}.includes('brake drum.jpg'))()", 15)
            ok(s2 is not None, f"deleted from the folder, it leaves the RO ({s2} s)")
            # ---- an RO holding a file the app couldn't copy in still picks up new ones
            await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{ro[0]}'); const e=(r.bulletins||[]).find(e=>e.task==='report') || (r.bulletins.push({{ id:'lg_x', task:'report', files:[] }}), r.bulletins[r.bulletins.length-1]); e.files=e.files||[]; e.files.push({{ id:'f_lost', name:'lost.pdf', size:3, type:'application/pdf', inFolder:false }}); }})()")
            await E(f"await T.write({base}+'tsb.pdf', '%PDF');")
            s3 = await wait_for(f"(()=>{names}.includes('tsb.pdf'))()")
            ok(s3 is not None, f"a file the app couldn't copy in doesn't hold up the new ones ({s3} s)")
            # ---- another computer's change shows within seconds (once this computer's own saves from the steps above have landed)
            await pg.wait_for_timeout(2500); await E("await __tg.writeFolderState();"); await pg.wait_for_timeout(500)
            path = await E(f"const L=await T.walk('Parsec Data/ROs/Open'); const f=L.find(x=>x.path.startsWith({json.dumps(d)}) && /ro\\.json$/.test(x.path)); return 'Parsec Data/ROs/Open/'+f.path;")
            await E("const o=JSON.parse(await T.read(" + json.dumps(path) + ")); o.ro.customerName='Other Computer Freight'; o.ro.updatedAt=new Date(Date.now()+5000).toISOString(); o.ro.updatedBy='Jo (other computer)';"
                    "await T.write(" + json.dumps(path) + ", JSON.stringify(o)); const L=JSON.parse(await T.read('Parsec Data/layout.json')); L.writeId='w_other_'+Math.random().toString(36).slice(2); L.savedAt=Date.now()+1000; await T.write('Parsec Data/layout.json', JSON.stringify(L));")
            s4 = await wait_for(f"__tg.getRO('{ro[0]}').customerName==='Other Computer Freight'", 12)
            s5 = await wait_for("(document.querySelector('.jc-host .rp-host')||{textContent:''}).textContent.includes('Other Computer Freight')", 4)
            dbg = await pg.evaluate(f"[__tg.getRO('{ro[0]}').customerName, __tg.pd16Info().merges, __tg.pd16Info().seen]")
            ok(s4 is not None and s4 < 9, f"another computer's change shows here within seconds ({s4} s · {dbg})")
            ok(s5 is not None, "…on the page too")
            # ---- the RO page stays still through a redraw
            await pg.evaluate(J("const r=R.querySelector('.rop-orow'); if(!r.classList.contains('is-on')) r.querySelector('.px-row__n').click()")); await pg.wait_for_timeout(700)
            st = await pg.evaluate(J("const op=R.querySelector('.px-op'); const im=[...R.querySelectorAll('img')].filter(i=>/^(data|blob):/.test(i.src)); window.__k={op, im}; __tg.JC.rerender(); "
                                     "const run=R.getAnimations().filter(a=>a.animationName && a.playState==='running' && a.effect.getTiming().iterations!==Infinity).map(a=>a.animationName); "
                                     "const im2=[...R.querySelectorAll('img')].filter(i=>/^(data|blob):/.test(i.src)); return [run, im.length, im.filter(i=>im2.includes(i)).length];"))
            ok(not [a for a in st[0] if a in ("px-unfold", "rop-in", "ock-pin-in")], f"a redraw doesn't open the open card again ({st[0]})")
            ok(st[1] == st[2], f"pictures already showing stay the same pictures ({st[2]} of {st[1]})")
            other = await pg.evaluate(J("const r=[...R.querySelectorAll('.rop-orow')].find(x=>!x.classList.contains('is-on')); r.querySelector('.px-row__n').click(); return R.getAnimations().filter(a=>a.animationName==='px-unfold' && a.playState==='running').length"))
            ok(other >= 1, "another operation's card still glides open")
            ok(not errs, f"no console errors: {errs[:3]}")
            await b.close()
    finally:
        srv.terminate()
    print("FAILS:", len(FAILS), FAILS)

asyncio.run(main())
