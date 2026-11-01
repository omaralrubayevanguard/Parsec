import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app"; OUT = os.path.join(H, "shots123b", "t12d_base"); os.makedirs(OUT, exist_ok=True)
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
def J(js): return "(()=>{ const R=" + SR + "; " + js + " })()"
async def setup(p, w, h, phone=False):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": w, "height": h}, is_mobile=phone, has_touch=phone)
    pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
    await pg.route("**/fonts.g*/**", lambda r: r.abort())
    if phone: await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
    await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1200)
    await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
    await pg.evaluate("(()=>{ window.__papers=[]; __tg.PG.printPaper=(el,t)=>{ window.__papers.push([t, el.innerHTML.length, el.querySelectorAll('.tp-op').length, el.querySelectorAll('tr').length, !!el.querySelector('.tp-qr svg')]); }; window.__clip=[]; try{ navigator.clipboard.writeText = (t)=>{ window.__clip.push(t); return Promise.resolve(); }; }catch(e){} })()")
    return b, pg, errs
async def openro(pg, rid):
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
T = lambda pg: pg.evaluate("(()=>{ const R=" + SR + "; const t=(R && R.querySelector('.toast, #toast, .jcToast')) || document.querySelector('.toast'); return t ? t.textContent : ''; })()")
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p, 1440, 900)
        # the RO with the most operations and parts
        rid = await pg.evaluate("(()=>{ const L=__tg.STATE().ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && !/^(Closed|Complete)/.test((r.status||{}).status||'')); L.sort((a,b)=>(b.operations.length*10+b.operations.reduce((s,o)=>s+(o.parts||[]).length,0))-(a.operations.length*10+a.operations.reduce((s,o)=>s+(o.parts||[]).length,0))); const r=L[0]; while(r.operations.length < 3){ const c=JSON.parse(JSON.stringify(r.operations[0])); c.id='op_t'+r.operations.length; c.complaint='Test operation '+(r.operations.length+1); (c.parts||[]).forEach((p,i)=>p.id='pt_t'+r.operations.length+'_'+i); r.operations.push(c); } r.operations.forEach(o=>{ o.jobStatus={status:'Hold Tech', setAt:new Date().toISOString(), hand:true}; o.declined=false; }); __tg.STATE().punches.filter(p=>!p.stop).forEach(p=>{ p.stop=new Date().toISOString(); }); r.operations[0].skill='B'; r.operations[0].asistApproval='Approved'; if(r.operations[1]) r.operations[1].asistApproval='Pending'; const pt=r.operations[0].parts&&r.operations[0].parts[0]; if(pt){ pt.core='150'; pt.salesman='Ryan Burke'; } r.poNumber='PO-55120'; r.department='Service'; r.chassis='758560'; r.followUpAt=new Date(Date.now()+86400000).toISOString(); r.createdBy='Jenna Cho'; return r.id; })()")
        await openro(pg, rid)
        info = await pg.evaluate(J("return { blocks: [...R.querySelectorAll('.rop-blk')].map(s=>s.className.replace('rop-blk rop-k-','')), rail: [...R.querySelectorAll('.rop-rail .rop-top > *')].map(x=>x.className), groups: [...R.querySelectorAll('.rop-rail .px-pg')].map(g=>g.dataset.pg), next: !!R.querySelector('.rop-rail slot'), acts: [...R.querySelectorAll('.px-totals .px-total')].map(x=>(x.getAttribute('aria-label')||'').split(':')[0]), eyebrow: (R.querySelector('.rop-band .px-ro__eyebrow')||{}).textContent, ops: R.querySelectorAll('.px-row[data-op]').length, chips: [...R.querySelectorAll('.rop-chip')].map(c=>c.textContent) };"))
        print("layout:", json.dumps(info))
        print("vehicle props:", await pg.evaluate(J("return [...R.querySelectorAll('.px-pg[data-pg=vehicle] .px-prop > span')].map(s=>s.textContent).join(', ')")))
        print("schedule props:", await pg.evaluate(J("return [...R.querySelectorAll('.px-pg[data-pg=schedule] .px-prop')].map(s=>s.textContent).join(' | ')")))
        print("people props:", await pg.evaluate(J("return [...R.querySelectorAll('.px-pg[data-pg=people] .px-prop')].map(s=>s.textContent).join(' | ')")))
        print("customer props:", await pg.evaluate(J("return [...R.querySelectorAll('.rop-k-customer .px-prop')].map(s=>s.textContent).join(' | ')")))
        await pg.screenshot(path=os.path.join(OUT, "d1_top.png"))
        # overflow check: anything wider than its column
        print("overflow:", await pg.evaluate(J("const out=[]; R.querySelectorAll('.rop-blk, .rop-rail > *, .rop-rail .rop-top > *').forEach(x=>{ if(x.scrollWidth > x.clientWidth+2) out.push(x.className+':'+x.scrollWidth+'>'+x.clientWidth); }); return out;")))
        # the Time tab with its notes
        await pg.evaluate(J("const t=[...R.querySelectorAll('.px-tab')].find(x=>x.dataset.tab==='time'); if(t) t.click();")); await pg.wait_for_timeout(400)
        print("tabs:", await pg.evaluate(J("return [...R.querySelectorAll('.px-tab')].map(t=>t.dataset.tab).join(',')")), "| punches:", await pg.evaluate(J("return R.querySelectorAll('.rop-tp').length")), "notes in punches:", await pg.evaluate(J("return R.querySelectorAll('.rop-tp .rop-tn:not(.is-none)').length")))
        ta = await pg.query_selector('.rop-ta')
        if ta:
            await ta.click(); await ta.type("Checked the clutch linkage, adjusted."); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
            print("note saved:", (await T(pg))[:80], "| solo notes:", await pg.evaluate(J("return [...R.querySelectorAll('.rop-tn')].map(n=>n.textContent).filter(t=>/clutch linkage/.test(t)).length")))
        await pg.screenshot(path=os.path.join(OUT, "d2_time.png"))
        # a fault code
        n0 = await pg.evaluate(f"__tg.getRO('{rid}').operations.reduce((s,o)=>s+(o.faults||[]).length,0)")
        await pg.click('.rop-k-dtc .rop-in__i'); await pg.keyboard.type("3226/2"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        print("code:", n0, "->", await pg.evaluate(f"__tg.getRO('{rid}').operations.reduce((s,o)=>s+(o.faults||[]).length,0)"), "|", (await T(pg))[:60])
        await pg.click('.rop-k-dtc .rop-in__i'); await pg.keyboard.type("nonsense"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        print("bad code toast:", (await T(pg))[:70])
        # a message
        m0 = await pg.evaluate(f"__tg.IB.store().items.filter(n=>n.ro==='{rid}').length")
        await pg.click('.rop-k-inbox .rop-in__i'); await pg.keyboard.type("Is the clutch kit here yet?"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
        print("message:", m0, "->", await pg.evaluate(f"__tg.IB.store().items.filter(n=>n.ro==='{rid}').length"), "|", (await T(pg))[:70], "| rows:", await pg.evaluate(J("return R.querySelectorAll('.rop-k-inbox .rop-ms').length")))
        # scroll the middle to see the lower blocks
        await pg.evaluate(J("const m=R.querySelector('.px-ro__main'); m.scrollTop=m.scrollHeight;")); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "d3_bottom.png"))
        await pg.evaluate(J("const m=R.querySelector('.px-ro__main'); const s=R.querySelector('.rop-k-photos'); m.scrollTop=s.offsetTop-80;")); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "d3_mid.png"))
        await pg.evaluate(J("const m=R.querySelector('.px-ro__main'); m.scrollTop=0;")); await pg.wait_for_timeout(200)
        # ---------- picking operations ----------
        rows = await pg.evaluate(J("return [...R.querySelectorAll('.px-row[data-op]')].map(r=>r.dataset.op)"))
        await pg.click(f'.px-row[data-op="{rows[0]}"]', modifiers=["Control"]); await pg.wait_for_timeout(300)
        await pg.click(f'.px-row[data-op="{rows[-1]}"]', modifiers=["Control"]); await pg.wait_for_timeout(300)
        print("bar:", await pg.evaluate(J("const b=R.querySelector('.rop-sb'); return b ? b.querySelector('.rop-sbi').textContent + ' | ' + [...b.querySelectorAll('.px-btn')].map(x=>x.textContent+(x.disabled?'(off)':'')).join(', ') : 'none'")))
        await pg.screenshot(path=os.path.join(OUT, "d4_pick.png"))
        # shift click a run
        await pg.click(f'.px-row[data-op="{rows[0]}"]', modifiers=["Control"]); await pg.wait_for_timeout(200)
        await pg.click(f'.px-row[data-op="{rows[0]}"]', modifiers=["Control"]); await pg.wait_for_timeout(200)
        await pg.click(f'.px-row[data-op="{rows[-1]}"]', modifiers=["Shift"]); await pg.wait_for_timeout(300)
        print("shift run:", await pg.evaluate(J("return R.querySelectorAll('.px-row.is-sel').length")), "of", len(rows))
        # note on all
        await pg.evaluate(J("[...R.querySelectorAll('.rop-sb .px-btn')].find(x=>x.dataset.v==='note').click()")); await pg.wait_for_timeout(300)
        await pg.keyboard.type("Waiting on the release bearing."); await pg.evaluate(J("R.querySelector('.px-modal .px-btn--primary').click()")); await pg.wait_for_timeout(400)
        print("note on all:", (await T(pg))[:70], "| offNotes:", await pg.evaluate(f"__tg.getRO('{rid}').operations.filter(o=>(o.offNotes||[]).some(n=>/release bearing/.test(n.text))).length"))
        # hold
        await pg.click(f'.px-row[data-op="{rows[-1]}"]', modifiers=["Control"]); await pg.wait_for_timeout(300)
        await pg.evaluate(J("[...R.querySelectorAll('.rop-sb .px-btn')].find(x=>x.dataset.v==='hold').click()")); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "d5_hold.png"))
        await pg.evaluate(J("[...R.querySelectorAll('.rop-pop .rop-mi')].find(x=>/Foreman/.test(x.textContent)).click()")); await pg.wait_for_timeout(400)
        print("hold:", (await T(pg))[:90], "| st:", await pg.evaluate(f"(()=>{{ const o=__tg.getRO('{rid}').operations.find(o=>o.id==='{rows[-1]}'); return o.jobStatus && o.jobStatus.status; }})()"))
        await pg.evaluate(J("const b=R.querySelector('#toast .toastBtn'); if(b) b.click();")); await pg.wait_for_timeout(400)
        print("after toast undo:", await pg.evaluate(f"(()=>{{ const o=__tg.getRO('{rid}').operations.find(o=>o.id==='{rows[-1]}'); return o.jobStatus && o.jobStatus.status; }})()"))
        # add a code via the bar, mark done gating, print, story
        await pg.evaluate(J("R.querySelector('.rop-sech0 > .rop-cb').click()")); await pg.wait_for_timeout(300)
        print("pick all:", await pg.evaluate(J("return R.querySelectorAll('.px-row.is-sel').length")))
        await pg.evaluate(J("[...R.querySelectorAll('.rop-sb .px-btn')].find(x=>x.dataset.v==='code').click()")); await pg.wait_for_timeout(300)
        await pg.keyboard.type("P0401"); await pg.evaluate(J("R.querySelector('.px-modal .px-btn--primary').click()")); await pg.wait_for_timeout(400)
        print("bar code:", (await T(pg))[:70])
        await pg.evaluate(J("R.querySelector('.rop-sech0 > .rop-cb').click()")); await pg.wait_for_timeout(300)
        await pg.evaluate(J("[...R.querySelectorAll('.rop-sb .px-btn')].find(x=>x.dataset.v==='print').click()")); await pg.wait_for_timeout(300)
        await pg.evaluate(J("[...R.querySelectorAll('.rop-sb .px-btn')].find(x=>x.dataset.v==='story').click()")); await pg.wait_for_timeout(400)
        print("papers:", await pg.evaluate("window.__papers"), "| story clip:", await pg.evaluate("(window.__clip.slice(-1)[0]||'').slice(0,80)"), "|", (await T(pg))[:50])
        await pg.evaluate(J("[...R.querySelectorAll('.rop-sb .px-btn')].find(x=>x.dataset.v==='done').click()")); await pg.wait_for_timeout(400)
        print("mark done:", (await T(pg))[:160])
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
        # ---------- picking parts ----------
        op0 = await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{rid}'); const o=r.operations.find(o=>(o.parts||[]).filter(p=>p.description||p.partNumber).length>=2) || r.operations.find(o=>(o.parts||[]).length); (o.parts||[]).forEach((p,i)=>{{ p.status = i===0 ? 'Staged' : 'Received'; }}); return o.id; }})()")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.ivTab=U.ivTab||{{}}; U.ivTab['{op0}']='parts'; U.roOp['{rid}']='{op0}'; __tg.render(); }})()"); await pg.wait_for_timeout(600)
        prs = await pg.evaluate(J("return [...R.querySelectorAll('.rop-prow')].map(r=>r.dataset.part)"))
        print("part rows:", len(prs), "| head:", await pg.evaluate(J("return (R.querySelector('.rop-pth')||{}).textContent")))
        await pg.screenshot(path=os.path.join(OUT, "d6_parts.png"))
        if prs:
            await pg.evaluate(J("R.querySelector('.rop-pth > .rop-cb').click()")); await pg.wait_for_timeout(300)
            print("parts bar:", await pg.evaluate(J("const b=R.querySelector('.rop-sb'); return b ? b.querySelector('.rop-sbi').textContent + ' | ' + [...b.querySelectorAll('.px-btn')].map(x=>x.textContent+(x.disabled?'(off)':'')).join(', ') : 'none'")))
            await pg.screenshot(path=os.path.join(OUT, "d7_partsbar.png"))
            await pg.evaluate(J("[...R.querySelectorAll('.rop-sb .px-btn')].find(x=>x.dataset.v==='ppns').click()")); await pg.wait_for_timeout(300)
            print("pns:", await pg.evaluate("(window.__clip.slice(-1)[0]||'').split('\\n').slice(0,2).join(' / ')"))
            await pg.evaluate(J("[...R.querySelectorAll('.rop-sb .px-btn')].find(x=>x.dataset.v==='plist').click()")); await pg.wait_for_timeout(300)
            await pg.evaluate(J("[...R.querySelectorAll('.rop-sb .px-btn')].find(x=>x.dataset.v==='ppick').click()")); await pg.wait_for_timeout(400)
            print("picked:", (await T(pg))[:90])
            await pg.evaluate(J("R.querySelector('.rop-pth > .rop-cb').click()")); await pg.wait_for_timeout(300)
            await pg.evaluate(J("[...R.querySelectorAll('.rop-sb .px-btn')].find(x=>x.dataset.v==='pinst').click()")); await pg.wait_for_timeout(400)
            print("installed:", (await T(pg))[:90])
            await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
            await pg.click(f'.rop-prow[data-part="{prs[0]}"]', modifiers=["Control"]); await pg.wait_for_timeout(300)
            print("ctrl part:", await pg.evaluate(J("return R.querySelectorAll('.rop-prow.is-sel').length")))
            if len(rows) > 1:
                await pg.evaluate(J("[...R.querySelectorAll('.rop-sb .px-btn')].find(x=>x.dataset.v==='pmove').click()")); await pg.wait_for_timeout(300)
                await pg.evaluate(J("R.querySelector('.rop-pop .rop-mi').click()")); await pg.wait_for_timeout(400)
                print("move:", (await T(pg))[:70])
                await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
            print("papers now:", await pg.evaluate("window.__papers.length"))
        # opening another RO clears the picks
        await pg.click(f'.px-row[data-op="{rows[0]}"]', modifiers=["Control"]); await pg.wait_for_timeout(300)
        other = await pg.evaluate(f"__tg.STATE().ros.find(r=>!r.shop && r.id!=='shop' && r.id!=='{rid}').id")
        await openro(pg, other); await openro(pg, rid)
        print("cleared on another RO:", await pg.evaluate(J("return !R.querySelector('.rop-sb')")))
        # the old features still there
        await pg.evaluate(J("R.querySelector('.px-status--button').click()")); await pg.wait_for_timeout(300)
        print("status menu:", await pg.evaluate(J("return !!R.querySelector('.px-smain')")))
        await pg.keyboard.press("Escape"); await pg.mouse.click(700, 500); await pg.wait_for_timeout(200)
        await pg.keyboard.press("o"); await pg.wait_for_timeout(400)
        print("O add op modal:", await pg.evaluate(J("return (R.querySelector('.px-modal h2')||{}).textContent")))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await pg.evaluate(J("const b=[...R.querySelectorAll('.px-totals .px-total')].find(x=>/Files/.test(x.getAttribute('aria-label')||'')); b.click();")); await pg.wait_for_timeout(300)
        print("files modal:", await pg.evaluate(J("return (R.querySelector('.px-modal h2')||{}).textContent")))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await pg.evaluate(J("const b=[...R.querySelectorAll('.px-totals .px-total')].find(x=>/Activity/.test(x.getAttribute('aria-label')||'')); b.click();")); await pg.wait_for_timeout(300)
        print("activity modal:", await pg.evaluate(J("return (R.querySelector('.px-modal h2')||{}).textContent")))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await pg.evaluate(J("const b=R.querySelector('.rop-acts .px-btn'); b && b.click();")); await pg.wait_for_timeout(500)
        print("band start:", (await T(pg))[:60], "| running:", await pg.evaluate("!!__tg.runningPunch()"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
        # the transfer pop-up from the band
        # themes
        for th in ["ivd", "vvl", "vvd", "ivl"]:
            await pg.evaluate(f"__tg.applyTheme('{th}')"); await pg.wait_for_timeout(1500)
            await pg.screenshot(path=os.path.join(OUT, f"d8_{th}.png"))
        print("ERRORS desk", errs[:8]); await b.close()
        # ---------- narrower windows ----------
        for w, tag in [(1180, "n1180"), (980, "n980")]:
            b, pg, errs = await setup(p, w, 860)
            await openro(pg, rid if False else await pg.evaluate("(()=>{ const L=__tg.STATE().ros.filter(r=>!r.shop && r.id!=='shop'); L.sort((a,b)=>b.operations.length-a.operations.length); return L[0].id; })()"))
            await pg.screenshot(path=os.path.join(OUT, f"d9_{tag}.png"))
            print(tag, "one column:", await pg.evaluate(J("return getComputedStyle(R.querySelector('.rop-rail')).display")), "| overflow:", await pg.evaluate(J("const out=[]; R.querySelectorAll('.rop-blk, .rop-top > *, .px-props').forEach(x=>{ if(x.scrollWidth > x.clientWidth+2) out.push(x.className.slice(0,30)+':'+x.scrollWidth+'>'+x.clientWidth); }); return out;")), "| page hscroll:", await pg.evaluate("document.documentElement.scrollWidth > innerWidth"))
            print(tag, "ERRORS", errs[:5]); await b.close()
        # ---------- phone ----------
        b, pg, errs = await setup(p, 390, 844, phone=True)
        prid = await pg.evaluate("(()=>{ const L=__tg.STATE().ros.filter(r=>!r.shop && r.id!=='shop'); L.sort((a,b)=>b.operations.length-a.operations.length); return L[0].id; })()")
        await openro(pg, prid)
        await pg.screenshot(path=os.path.join(OUT, "d10_phone.png"))
        await pg.screenshot(path=os.path.join(OUT, "d10_phone_full.png"), full_page=True)
        print("phone order:", await pg.evaluate(J("const pr=R.querySelector('.px-ro'); return [...pr.querySelectorAll(':scope > .px-ro__main, :scope > .rop-rail > *')].map(x=>x.className.split(' ')[0]+':'+getComputedStyle(x).order).join(' ')")), "| hscroll:", await pg.evaluate("document.documentElement.scrollWidth > innerWidth"))
        rws = await pg.evaluate(J("return [...R.querySelectorAll('.px-row[data-op]')].map(r=>r.dataset.op)"))
        if rws:
            await pg.evaluate(J("R.querySelector('.px-row[data-op] > .rop-cb').click()")); await pg.wait_for_timeout(400)
            await pg.screenshot(path=os.path.join(OUT, "d11_phone_pick.png"))
            print("phone bar:", await pg.evaluate(J("const b=R.querySelector('.rop-sb'); if(!b) return 'none'; const r=b.getBoundingClientRect(); return [getComputedStyle(b).position, Math.round(r.top), Math.round(r.bottom), innerHeight];")))
        print("phone ERRORS", errs[:6]); await b.close()
if __name__ == "__main__": asyncio.run(main())
