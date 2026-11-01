import asyncio, json, sys, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
SH = os.path.join(H, "shots8"); os.makedirs(SH, exist_ok=True)

# an in-memory folder that behaves like the File System Access handles Parsec uses
FAKEFS = r"""(()=>{
class FH { constructor(name){ this.kind='file'; this.name=name; this.data=''; this.mod=Date.now(); }
  async getFile(){ const d=this.data, m=this.mod, n=this.name; return { name:n, size:new Blob([d]).size, lastModified:m, text: async()=>d, arrayBuffer: async()=>new TextEncoder().encode(d).buffer, type:'' }; }
  async createWritable(){ const self=this; let buf=''; return { write: async(x)=>{ buf += (typeof x==='string'? x : (x && x.data!==undefined ? x.data : (x instanceof Blob ? await x.text() : String(x)))); }, close: async()=>{ self.data=buf; self.mod=Date.now(); }, truncate: async()=>{} }; }
  async queryPermission(){ return 'granted'; } async requestPermission(){ return 'granted'; } }
class DH { constructor(name){ this.kind='directory'; this.name=name; this.kids=new Map(); }
  async getDirectoryHandle(n,o){ let k=this.kids.get(n); if(!k){ if(!(o&&o.create)) { const e=new Error('NotFound'); e.name='NotFoundError'; throw e; } k=new DH(n); this.kids.set(n,k); } if(k.kind!=='directory') throw new Error('TypeMismatch'); return k; }
  async getFileHandle(n,o){ let k=this.kids.get(n); if(!k){ if(!(o&&o.create)) { const e=new Error('NotFound'); e.name='NotFoundError'; throw e; } k=new FH(n); this.kids.set(n,k); } return k; }
  async removeEntry(n){ if(!this.kids.has(n)) throw new Error('NotFound'); this.kids.delete(n); }
  values(){ const it=[...this.kids.values()][Symbol.iterator](); return { next: async()=>it.next(), [Symbol.asyncIterator](){ return this; } }; }
  entries(){ const it=[...this.kids.entries()][Symbol.iterator](); return { next: async()=>it.next(), [Symbol.asyncIterator](){ return this; } }; }
  async queryPermission(){ return 'granted'; } async requestPermission(){ return 'granted'; } }
window.__root = new DH('My Folder');
return true;
})()"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.goto("file://" + H + "/t8.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(400)
        async def shot(n, wait=350):
            await pg.wait_for_timeout(wait); await pg.screenshot(path=f"{SH}/{n}.png")
        async def ui(js, wait=300):
            await pg.evaluate("(()=>{const U=__tg.UI();" + js + ";__tg.render();})()"); await pg.wait_for_timeout(wait)
        # ---------- Triage: which bars show on each RO's desk
        res = await pg.evaluate("""(()=>{ const out=[]; const U=__tg.UI(); U.view='triage'; U.tgView='desk';
          const ros=__tg.STATE().ros.filter(r=>!r.shop && r.id!=='ro_shop' && r.id!==undefined);
          for(const ro of ros){ U.tgSel=ro.id; __tg.render();
            const dk=document.querySelector('.tg-dk'); if(!dk) continue;
            const no=dk.querySelector('.tg-dkh .tg-no'); if(!no || no.textContent.indexOf(String(ro.roNumber).replace(/^RO[\s-]*/i,''))<0) continue;
            const hasNext=!!dk.querySelector('.tg-next'), hasClose=[...dk.querySelectorAll('.tg-card .h')].some(h=>/Ready to close/.test(h.textContent)), hasStage=!!dk.querySelector('.tg-strip');
            let nx=null; try{ nx=__tg.raNext(ro); }catch(e){}
            const expNext=!!__tg.tgItemOf(ro.id) || __tg.tgLate(ro) || !!(nx && nx.tone==='bad');
            const cl=__tg.tyCloseChecks(ro); const expClose=cl[0].ok || !!ro.roadTest || __tg.tyCat(ro)==='rdy';
            out.push({ro:ro.roNumber, cat:__tg.tyCat(ro), next:hasNext, expNext, close:hasClose, expClose, stage:hasStage, one:!!dk.querySelector('.tg-two.one')});
          } return out; })()""")
        bad = [r for r in res if r["next"] != r["expNext"] or r["close"] != r["expClose"]]
        print("desks checked:", len(res), "mismatches:", bad[:4])
        print("next shown:", sum(r["next"] for r in res), "close shown:", sum(r["close"] for r in res), "stage shown:", sum(r["stage"] for r in res), "who-has-it alone:", sum(r["one"] for r in res))
        # one with no bars, one with both
        quiet = next((r for r in res if not r["next"] and not r["close"]), None); both = next((r for r in res if r["next"] and r["close"]), None)
        for tag, r in (("e1_desk_quiet", quiet), ("e2_desk_both", both)):
            if r:
                await ui(f"U.view='triage'; U.tgView='desk'; U.tgSel=__tg.STATE().ros.find(x=>x.roNumber==='{r['ro']}').id")
                await shot(tag)
        # ---------- end of day, browser only: a button to save the backup; signed in as a tech -> signed out
        tech = await pg.evaluate("__tg.staffList().filter(s=>s.role==='Technician')[0].id")
        await ui(f"U.view='console'")
        await pg.evaluate(f"(()=>{{ localStorage.setItem('tec_viewas','{tech}'); __tg.pxSignedIn(); __tg.render(); }})()"); await pg.wait_for_timeout(300)
        if not await pg.evaluate("!!__tg.openShift()"): await pg.evaluate("__tg.shiftClockIn()")
        await pg.click('[data-px-anchor="clk"]'); await pg.wait_for_timeout(300)
        await pg.click('.pxr-pop [data-action="shift-out"]'); await pg.wait_for_timeout(400)
        await shot("f1_clockout_modal")
        await pg.click('.modal [data-action="clock-off"][data-reason="End of day"]'); await pg.wait_for_timeout(500)
        await shot("f2_eod_toast")
        print("eod toast:", await pg.evaluate("(()=>{const t=document.querySelector('.toast'); return t? t.innerText.replace(/\\n/g,' | '):null})()"))
        await pg.wait_for_timeout(1800)
        print("after eod: out=", await pg.evaluate("__tg.pxOut()"), "screen=", await pg.evaluate("!!document.querySelector('.pxs')"))
        await shot("f3_eod_signedout")
        await pg.click('.pxs [data-action="viewas-reset"]'); await pg.wait_for_timeout(300)
        # ---------- a folder: backups written, listed, kept to 14 when asked
        await pg.evaluate(FAKEFS)
        await pg.evaluate("""(async()=>{ const F=__tg.FS(); F.dir=window.__root; F.dirName='My Folder'; F.status='connected';
            const pd=await window.__root.getDirectoryHandle('Parsec Data',{create:true}); const bk=await pd.getDirectoryHandle('Backups',{create:true});
            for(let i=1;i<=20;i++){ const d=new Date(Date.now()-i*864e5); const n='data-'+d.toISOString().slice(0,10)+'.json'; const f=await bk.getFileHandle(n,{create:true}); const w=await f.createWritable(); await w.write('{"ros":[]}'); await w.close(); }
            localStorage.removeItem('tec_last_backup'); localStorage.removeItem('tec_bk_at'); return true; })()""")
        await ui("U.view='profile'; U.pxSec='data'; U.pxBk=null", 800)
        await shot("g1_data_folder")
        print("warn before:", await pg.evaluate("__tg.pxBkWarn()"))
        await pg.click('[data-action="px-bk-now"]'); await pg.wait_for_timeout(800)
        n_bk = await pg.evaluate("(async()=>{ const pd=await window.__root.getDirectoryHandle('Parsec Data'); const bk=await pd.getDirectoryHandle('Backups'); return [...bk.kids.keys()].length; })()")
        print("backups after back up now:", n_bk, "warn:", await pg.evaluate("__tg.pxBkWarn()"))
        await shot("g2_data_after")
        # keep 14 on, then back up again
        await pg.evaluate("localStorage.setItem('tec_bk_keep','1')")
        await pg.click('[data-action="px-bk-now"]'); await pg.wait_for_timeout(800)
        n_bk2 = await pg.evaluate("(async()=>{ const pd=await window.__root.getDirectoryHandle('Parsec Data'); const bk=await pd.getDirectoryHandle('Backups'); return [...bk.kids.keys()].sort(); })()")
        print("after keep-14:", len(n_bk2), n_bk2[:2], n_bk2[-2:])
        # end of day with a folder: today's copy written again
        await ui("U.view='console'")
        if not await pg.evaluate("!!__tg.openShift()"): await pg.evaluate("__tg.shiftClockIn()")
        before = await pg.evaluate("localStorage.getItem('tec_bk_at')")
        await pg.wait_for_timeout(1100)
        await pg.evaluate("__tg.shiftClockOut('End of day')"); await pg.wait_for_timeout(900)
        after = await pg.evaluate("localStorage.getItem('tec_bk_at')")
        print("eod folder backup:", before != after, await pg.evaluate("(()=>{const t=document.querySelector('.toast'); return t? t.innerText.replace(/\\n/g,' | '):null})()"))
        # ---------- part statuses come from the one list
        print("part lists:", await pg.evaluate("[__tg.RA_PST(), __tg.AUTO_PART_STATES(), __tg.ASST_PART_STATUSES()]"))
        print("in hand:", await pg.evaluate("['Received','Staged','Picked up','Installed','Ordered','Returned'].map(s=>s+':'+__tg.pxPartIn({status:s}))"))
        # ---------- sizes
        for sz in ["large", "floor"]:
            await ui(f"U.size='{sz}'; U.view='profile'; U.pxSec='look'", 500)
            await shot("h_size_" + sz)
            al = await pg.evaluate("""(()=>{ const r=[...document.querySelectorAll('.px-rail .pxr-ic')].map(e=>{const b=e.getBoundingClientRect(); return Math.round(b.left+b.width/2);}); return [...new Set(r)]; })()""")
            print("size", sz, "icon centers:", al)
        await ui("U.size='normal'")
        # ---------- narrow window: icons, the rail floats open
        await pg.set_viewport_size({"width": 1024, "height": 768}); await pg.wait_for_timeout(400)
        await ui("U.view='console'", 400)
        print("narrow:", await pg.evaluate("[document.documentElement.classList.contains('px-narrow'), Math.round(document.querySelector('.px-rail').getBoundingClientRect().width), getComputedStyle(document.body).paddingLeft]"))
        await shot("i1_narrow")
        await pg.click('.pxr-brand'); await pg.wait_for_timeout(400)
        print("peek:", await pg.evaluate("[document.documentElement.classList.contains('px-peek'), Math.round(document.querySelector('.px-rail').getBoundingClientRect().width), getComputedStyle(document.body).paddingLeft]"))
        await shot("i2_peek")
        await pg.click('.px-rail [data-view="timelog"]'); await pg.wait_for_timeout(400)
        print("after nav:", await pg.evaluate("[__tg.UI().view, document.documentElement.classList.contains('px-peek')]"))
        # ---------- Graphite
        await pg.set_viewport_size({"width": 1440, "height": 900}); await pg.evaluate("__tg.applyTheme('ivd')")
        await ui("U.view='profile'; U.pxSec='data'", 500); await shot("j1_dark_profile")
        await ui("U.view='console'; U.pxPop='me'", 400); await shot("j2_dark_menu")
        print("errors:", errs[:8])
        await b.close()

asyncio.run(main())
