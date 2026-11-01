# The shop folder, start to finish, on the test copy: pick (straight from the click), everything saved there — shop, ROs,
# attachments, backups — then the failures: a folder that's gone, a "no" from the browser, a read-only folder, a closed picker.
import asyncio, os, re, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
FAKEFS = re.search(r'FAKEFS = r"""(.*?)"""', open(os.path.join(H, "r8_flow.py")).read(), re.S).group(1)
INIT = FAKEFS.replace("window.__root = new DH('My Folder');", """window.__root = new DH('Parsec Shop'); window.__DH = DH;
window.__pick = 'ok';
window.showDirectoryPicker = function(o){ window.__pickOpts = o; window.__act = navigator.userActivation ? navigator.userActivation.isActive : null; window.__picks = (window.__picks||0) + 1;
  if(window.__pick === 'abort') return Promise.reject(new DOMException('The user aborted a request.', 'AbortError'));
  if(window.__pick === 'ro'){ const d = new DH('Locked'); d.getDirectoryHandle = async()=>{ throw new DOMException('Not allowed to modify', 'NoModificationAllowedError'); }; d.getFileHandle = d.getDirectoryHandle; return Promise.resolve(d); }
  return Promise.resolve(window.__root); };""")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await ctx.add_init_script(INIT)
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        # an attachment on an RO bulletin, its bytes where the app keeps them before a folder is picked
        att = await pg.evaluate("""(async()=>{ const ro=__tg.STATE().ros[0]; ro.bulletins=ro.bulletins||[]; let e=ro.bulletins[0]; if(!e){ e={id:'b_t',files:[]}; ro.bulletins.push(e); } e.files=e.files||[];
          const f={id:'att_test_1', name:'dash-pic.jpg', type:'image/jpeg', size:12}; e.files.push(f);
          await new Promise((res,rej)=>{ const r=indexedDB.open('ro-job-console',1); r.onupgradeneeded=ev=>{ try{ ev.target.result.createObjectStore('files'); }catch(x){} }; r.onsuccess=()=>{ const tx=r.result.transaction('files','readwrite'); tx.objectStore('files').put(new Blob(['JPEGBYTES123'],{type:'image/jpeg'}),'att_test_1'); tx.oncomplete=res; tx.onerror=rej; }; r.onerror=rej; });
          return ro.roNumber + ' - ' + ro.customerName; })()""")
        # 1. pick: the picker is called during the click, starts on the Desktop
        await pg.evaluate("__tg.connectFolder()"); await pg.wait_for_timeout(6000)
        print("1 picked:", await pg.evaluate("({status:__tg.FS().status, name:__tg.FS().dirName, act:window.__act, opts:window.__pickOpts, err:__tg.FS_ERR()})"))
        tree = await pg.evaluate("""(async()=>{ const L=[]; async function walk(d,p,dep){ for await (const [n,h] of d.entries()){ L.push(p+n+(h.kind==='directory'?'/':'')); if(h.kind==='directory' && dep<4) await walk(h,p+n+'/',dep+1); } } await walk(window.__root,'',0); return L; })()""")
        print("  folder has:", len(tree), "entries"); [print("   ", x) for x in tree if x.count('/') <= 2 or 'Attachments' in x or 'dash-pic' in x][:30]
        print("  attachment in its RO folder:", [x for x in tree if 'dash-pic' in x], [x for x in tree if 'Attach' in x][:3], [x for x in tree if x.count('/')==3][:4])
        print("  where punches are:", await pg.evaluate("""(async()=>{ const hits=[]; async function walk(d,p){ for await (const [n,h] of d.entries()){ if(h.kind==='directory') await walk(h,p+n+'/'); else { const t=await (await h.getFile()).text(); if(/"punches"|"start"[ ]*:/.test(t)) hits.push(p+n); } } } await walk(window.__root,''); return hits.slice(0,5).concat(['…'+hits.length]); })()"""))
        print("  bulletin file now:", await pg.evaluate("JSON.stringify(__tg.STATE().ros[0].bulletins[0].files.slice(-1))"))
        print("  shop file holds punches + audit:", await pg.evaluate("""(async()=>{ const pd=await window.__root.getDirectoryHandle('Parsec Data'); const sd=await pd.getDirectoryHandle('Shop'); const L=[]; for await (const [n] of sd.entries()) L.push(n); const f=await sd.getFileHandle(L.find(n=>/Shop/.test(n))); const t=await (await f.getFile()).text(); return {files:L, punches:/"punches"/.test(t), audit:/"audit"/.test(t), shifts:/"shifts"/.test(t), size:t.length}; })()"""))
        # 2. a folder that's gone: requestPermission throws — Parsec says so and waits for a click (no picker on its own)
        r = await pg.evaluate("""(async()=>{ const F=__tg.FS(); const d=new window.__DH('Old Folder'); d.requestPermission=async()=>{ throw new DOMException('A requested file or directory could not be found', 'NotFoundError'); };
          F.dir=d; F.dirName='Old Folder'; F.status='needs-permission'; const before=window.__picks; __tg.reconnectFolder(); await new Promise(r=>setTimeout(r,400));
          return {picks: window.__picks-before, status:F.status, err:__tg.FS_ERR(), gate: __tg.fsGateHtml().replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').slice(0,260)}; })()""")
        print("2 gone:", json.dumps(r, ensure_ascii=False))
        # 3. the browser says no
        r = await pg.evaluate("""(async()=>{ const F=__tg.FS(); const d=new window.__DH('Shop Share'); d.requestPermission=async()=>'denied'; F.dir=d; F.dirName='Shop Share'; F.status='needs-permission'; __tg.reconnectFolder(); await new Promise(r=>setTimeout(r,400));
          return {status:F.status, err:__tg.FS_ERR(), gate: __tg.fsGateHtml().replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').slice(0,300)}; })()""")
        print("3 denied:", json.dumps(r, ensure_ascii=False))
        # 4. closed the picker, 5. a read-only folder
        for mode in ["abort", "ro"]:
            r = await pg.evaluate("""(async(m)=>{ const F=__tg.FS(); F.dir=null; F.status='none'; window.__pick=m; __tg.connectFolder(); await new Promise(r=>setTimeout(r,800)); return {status:F.status, err:__tg.FS_ERR(), toast: (__tg.UI().toast||'').slice(0,200)}; })""", mode)
            print("4/5", mode + ":", json.dumps(r, ensure_ascii=False))
        print("errors:", errs[:4])
        await b.close()
asyncio.run(main())
