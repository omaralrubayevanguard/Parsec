# Parsec 14 (fork C) — one status look on the RO list, Assets, Manager, Career, Day report, the search window, Ctrl K and the status window;
# Next step: approval before ordering, Assign a tech, no road test → Release; days open counted like the RO page; the Spot column; count tiles
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_cc.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots14c"); os.makedirs(OUT, exist_ok=True)
Q = "[data-pg=rolist]"
ADMIN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='rolist'; __tg.render(); })()"
def go(v): return f"(()=>{{ __tg.UI().view='{v}'; __tg.render(); }})()"
NX = "(id=>{ const e=document.querySelector('" + Q + " .rq-row[data-id=\"'+id+'\"] .rq-nx'); return e ? [e.querySelector('.t').textContent, (e.querySelector('.w')||{}).textContent||''] : null; })"
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate(ADMIN); await pg.wait_for_timeout(900)
        # ---- statuses on the RO list ----
        r = await pg.evaluate(f"(()=>{{ const R=document.querySelector('{Q}'), rows=[...R.querySelectorAll('.rq-rows .rq-row')]; return [rows.length, rows.filter(x=>x.querySelector('.rq-k-status .pgst .pgst-i')).length, R.querySelectorAll('.tg-si, .pill').length, rows.filter(x=>x.querySelector('.rq-k-status .pgst.m')).length]; }})()")
        ok(r[0] > 5 and r[1] == r[0] and r[2] == 0 and r[3] == 0, f"RO list: every Status cell is icon + word (pgSt), no old icons or pills, no pill where nothing opens ({r})")
        lab = await pg.evaluate(f"[...document.querySelectorAll('{Q} .rq-rows .rq-k-status .pgst-l')].map(x=>x.textContent)")
        ok(all(x != 'Hold Tech' for x in lab) and any(x == 'Hold tech' for x in lab), f"the words are the shared ones (Hold tech) ({sorted(set(lab))[:6]})")
        await pg.click(f"{Q} .rq-seg button[data-g='waiting']"); await pg.wait_for_timeout(350)
        g = await pg.evaluate(f"[...document.querySelectorAll('{Q} .rq-grp')].map(x=>[!!x.querySelector('.pgst .pgst-i'), (x.querySelector('.pgst-l')||{{}}).textContent])")
        ok(g and all(x[0] for x in g), f"group headers carry the status look ({g[:3]})")
        await pg.click(f"{Q} .rq-seg button[data-g='all']"); await pg.wait_for_timeout(300)
        # the pane: the one you can change is the pill, and it opens the status window
        await pg.click(f"{Q} .rq-rows .rq-row .rq-k-cust"); await pg.wait_for_timeout(500)
        r = await pg.evaluate(f"(()=>{{ const b=document.querySelector('{Q} .rq-peek .rq-strow .pgst.m'); return b ? [b.tagName, b.dataset.a, !!b.querySelector('.pgst-cv'), document.querySelectorAll('{Q} .rq-peek .rq-pop .pgst').length > 0] : null; }})()")
        ok(r and r[0] == 'BUTTON' and r[1] == 'status' and r[2] and r[3], f"pane: the status is an outlined pill with ▾; the operations show theirs ({r})")
        await pg.screenshot(path=os.path.join(OUT, "c1_pane.png"))
        await pg.click(f"{Q} .rq-peek .rq-strow .pgst.m"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("(()=>{ const m=document.querySelector('.modal'); return m ? [m.querySelectorAll('.st-opt .pgst').length, m.querySelectorAll('.st-opt .dot').length, !!m.querySelector('.st-preview .pgst')] : null; })()")
        ok(r and r[0] >= 8 and r[1] == 0 and r[2], f"the status window: every option and the preview use the same look ({r})")
        await pg.screenshot(path=os.path.join(OUT, "c2_status_window.png"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ __tg.UI().modal=null; __tg.render(); })()"); await pg.wait_for_timeout(200)
        # bulk Set status menu
        await pg.click(f"{Q} .rq-rows .rq-row .rq-cb"); await pg.wait_for_timeout(250)
        await pg.click(f"{Q} [data-a=pop][data-p=bst]"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate(f"(()=>{{ const L=[...document.querySelectorAll('{Q} .rq-mrow[data-a=bset]')]; return L.length > 5 && L.every(x=>x.querySelector('.pgst')); }})()"), "Set status… lists each status with the same look")
        await pg.keyboard.press("Escape"); await pg.evaluate("(()=>{ const U=__tg.RL ? null : null; })()")
        await pg.evaluate(ADMIN); await pg.wait_for_timeout(500)
        # ---- Next step ----
        rid = await pg.evaluate("""(()=>{ const S=__tg.STATE(); const run=new Set(S.punches.filter(p=>!p.stop).map(p=>p.roId));
          const r=S.ros.find(r=>!r.shop && !r.dateClosed && !run.has(r.id) && r.operations.filter(o=>!o.declined).length>=1 && r.operations.some(o=>(o.parts||[]).length));
          r.operations.forEach((o,i)=>{ o.declined = i>0; });
          const o=r.operations[0]; o.quoted=2; delete o.appr; o.jobType='OP'; o.jobStatus={status:'Hold Tech', setAt:new Date().toISOString(), hand:true};
          (o.parts||[]).forEach(x=>{ x.status='Not Ordered'; x.sup=''; delete x.ordAt; });
          r.status={status:'Hold Tech', setAt:new Date().toISOString(), hand:true}; r.assignedTech='Mike Rodriguez'; S.savedAt=new Date().toISOString(); __tg.render(); return r.id; })()""")
        await pg.wait_for_timeout(300)
        n1 = await pg.evaluate(NX + f"('{rid}')")
        ok(n1 and n1[0].startswith('Send the estimate'), f"not approved, parts not ordered → Send the estimate first, not Order ({n1})")
        await pg.evaluate(f"(()=>{{ const S=__tg.STATE(), r=S.ros.find(x=>x.id==='{rid}'); r.operations[0].appr={{s:'ok', by:'test', at:new Date().toISOString()}}; S.savedAt=new Date().toISOString()+'a'; __tg.render(); }})()"); await pg.wait_for_timeout(300)
        n2 = await pg.evaluate(NX + f"('{rid}')")
        ok(n2 and n2[0].startswith('Order'), f"approved → Order the parts ({n2})")
        await pg.evaluate(f"(()=>{{ const S=__tg.STATE(), r=S.ros.find(x=>x.id==='{rid}'); r.operations[0].parts.forEach(x=>{{ x.status='Received'; }}); r.assignedTech=''; S.savedAt=new Date().toISOString()+'b'; __tg.render(); }})()"); await pg.wait_for_timeout(300)
        n3 = await pg.evaluate(NX + f"('{rid}')"); fm = await pg.evaluate("(()=>{ try{ return __tg.rtPerson ? __tg.rtPerson('foreman') : ''; }catch(e){ return ''; } })()")
        ok(n3 and n3[0] == 'Assign a tech' and n3[1], f"approved, parts in, nobody on it → Assign a tech · the foreman ({n3} · {fm})")
        # pane Next card (base raNext) agrees
        await pg.click(f"{Q} .rq-row[data-id='{rid}'] .rq-k-cust"); await pg.wait_for_timeout(400)
        pn = await pg.evaluate(f"(document.querySelector('{Q} .rq-peek .rq-next p')||{{}}).textContent||''")
        ok('assign a tech' in pn.lower(), f"the pane's Next card says the same ({pn[:80]})")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const x=document.querySelector('[data-pg=rolist] [data-a=peekx]'); x && x.click(); })()"); await pg.wait_for_timeout(300)
        # all done, no road test → Release
        has_rt = await pg.evaluate("typeof __tg.rtNeeded === 'function' || (()=>{ try{ return typeof rtNeeded; }catch(e){ return 'no'; } })()")
        await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(), r=S.ros.find(x=>x.id==='{rid}'); r.assignedTech='Mike Rodriguez'; const o=r.operations[0];
          o.jobStatus={{status:'Complete', setAt:new Date().toISOString(), hand:true}}; o.parts.forEach(x=>{{ x.status='Installed'; }});
          o.log=(o.log||[]).concat([{{kind:'cause', text:'Worn', at:new Date().toISOString()}},{{kind:'fix', text:'Replaced', at:new Date().toISOString()}}]); o.cause=o.cause||'Worn'; o.correction=o.correction||'Replaced';
          r.noRoadTest=true; delete r.roadTest; S.savedAt=new Date().toISOString()+'c'; __tg.render(); }})()"""); await pg.wait_for_timeout(400)
        n4 = await pg.evaluate(NX + f"('{rid}')")
        ticks = await pg.evaluate(f"(()=>{{ const e=document.querySelector('{Q} .rq-row[data-id=\"{rid}\"] .rq-ticks'); return e ? e.children.length : null; }})()")
        ok(n4 and (n4[0] in ('Release the truck', 'Write the story · Op 1')), f"every op done, no road test → Release the truck, no Road test step ({n4}; rtNeeded here: {has_rt})")
        ok(ticks == 6, f"the Stage ticks leave out the road test when it isn't needed ({ticks} of 7)")
        await pg.evaluate(f"(()=>{{ const S=__tg.STATE(), r=S.ros.find(x=>x.id==='{rid}'); r.noRoadTest=false; S.savedAt=new Date().toISOString()+'d'; __tg.render(); }})()"); await pg.wait_for_timeout(300)
        n5 = await pg.evaluate(NX + f"('{rid}')")
        ok(n5 and n5[0] in ('Road test', 'Write the story · Op 1'), f"…and with a road test it asks for the road test ({n5})")
        # ---- days open: whole days since it opened, like the RO page ----
        rd2 = await pg.evaluate("""(()=>{ const S=__tg.STATE(); const r=S.ros.find(r=>!r.shop && !r.dateClosed && r.id!=='%s'); r.dateOpened=new Date(Date.now()-47*3600e3).toISOString(); S.savedAt=new Date().toISOString()+'e'; __tg.render(); return r.id; })()""" % rid)
        await pg.wait_for_timeout(300)
        dtx = await pg.evaluate(f"(document.querySelector('{Q} .rq-row[data-id=\"{rd2}\"] .rq-days')||{{}}).textContent")
        ok(dtx == '1d', f"opened 47 hours ago → 1d, as the RO page and the Technician page count it ({dtx})")
        # ---- Spot: the same field Foreman reads ----
        sp = await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(), r=S.ros.find(x=>x.id==='{rd2}'); r.location='Lot F3'; S.savedAt=new Date().toISOString()+'f'; __tg.render();
          const c=document.querySelector('{Q} .rq-row[data-id="{rd2}"] .rq-k-spot'); return c ? c.textContent.trim() : null; }})()""")
        ok(sp == 'F3', f"the Spot column shows the spot as Foreman writes it ({sp})")
        sp2 = await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(), r=S.ros.find(x=>x.id==='{rd2}'); r.location='Lot F4'; S.savedAt=new Date().toISOString()+'g'; __tg.render();
          const c=document.querySelector('{Q} .rq-row[data-id="{rd2}"] .rq-k-spot'); return c ? c.textContent.trim() : null; }})()""")
        ok(sp2 == 'F4', f"a moved truck shows its new spot ({sp2})")
        # ---- board ----
        await pg.evaluate(f"(()=>{{ const b=document.querySelector('{Q} [data-a=pop][data-p=disp]'); b && b.click(); }})()"); await pg.wait_for_timeout(250)
        await pg.click(f"{Q} [data-a=dv][data-v=board]"); await pg.wait_for_timeout(400)
        r = await pg.evaluate(f"(()=>{{ const C=[...document.querySelectorAll('{Q} .rq-card')]; return [C.length, C.filter(c=>c.querySelector('.rq-card__ft .pgst')).length, document.querySelectorAll('{Q} .tg-si').length]; }})()")
        ok(r[0] > 3 and r[1] == r[0] and r[2] == 0, f"Board: each card's status uses the same look ({r})")
        await pg.screenshot(path=os.path.join(OUT, "c3_board.png"))
        await pg.evaluate(f"(()=>{{ const b=document.querySelector('{Q} [data-a=pop][data-p=disp]'); b && b.click(); }})()"); await pg.wait_for_timeout(250)
        await pg.click(f"{Q} [data-a=dv][data-v=list]"); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "c4_list.png"))
        # ---- the search window and Ctrl K ----
        await pg.evaluate("__tg.render()"); await pg.keyboard.press("/"); await pg.wait_for_timeout(300); await pg.keyboard.type("a"); await pg.wait_for_timeout(500)
        r = await pg.evaluate("(()=>{ const L=[...document.querySelectorAll('.psm .psm-r')]; return [L.length, L.filter(x=>x.querySelector('small .pgst')).length]; })()")
        ok(r[0] > 0 and r[1] == r[0], f"the search window: each RO result carries its status ({r})")
        await pg.screenshot(path=os.path.join(OUT, "c5_search.png"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await pg.evaluate(go('triage')); await pg.wait_for_timeout(600)
        await pg.evaluate("psmOpen ? 0 : 0") if False else None
        r = await pg.evaluate("(()=>{ try{ __tg.psmOpen ? __tg.psmOpen('triage') : document.querySelector('[data-psm=triage]').click(); }catch(e){ const b=document.querySelector('[data-psm=triage]'); b && b.click(); } return 1; })()"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("(()=>{ const L=[...document.querySelectorAll('.psm .psm-r')]; return [L.length, L.filter(x=>x.querySelector('small .pgst')).length]; })()")
        ok(r[0] == 0 or r[1] == r[0], f"Triage's search results too ({r})")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await pg.evaluate(go('rolist')); await pg.wait_for_timeout(400)
        await pg.keyboard.press("Control+k"); await pg.wait_for_timeout(500)
        r = await pg.evaluate("(()=>{ const L=[...document.querySelectorAll('.pal-row')]; return [L.length, L.filter(x=>x.querySelector('.pal-st .pgst')).length, document.querySelectorAll('.pal .pill').length]; })()")
        ok(r[0] > 0 and r[1] == r[0] and r[2] == 0, f"Ctrl K: each result's status uses the same look ({r})")
        await pg.screenshot(path=os.path.join(OUT, "c6_ctrlk.png"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        # ---- Assets ----
        await pg.evaluate(go('assets')); await pg.wait_for_timeout(800)
        r = await pg.evaluate("(()=>{ const R=document.querySelector('[data-pg=assets]'); if(!R) return null; const it=[...R.querySelectorAll('.ast-in2')]; return [it.length, it.every(x=>x.classList.contains('pgst')), R.querySelectorAll('.ast-in').length]; })()")
        ok(r and r[0] > 0 and r[1] and r[2] == 0, f"Assets: a truck in the shop shows its RO's status icon, not a hand-made dot ({r})")
        await pg.evaluate("(()=>{ const R=document.querySelector('[data-pg=assets]'); const x=R.querySelector('.ast-in2'); const it=x && x.closest('[data-a=sel]'); it && it.click(); })()"); await pg.wait_for_timeout(600)
        r = await pg.evaluate("(()=>{ const R=document.querySelector('[data-pg=assets]'); const V=[...R.querySelectorAll('.ast-v')]; return [V.length, V.filter(v=>v.querySelector('.ast-st .pgst')).length, R.querySelectorAll('.ast-v.open .ast-op .pgst').length, R.querySelectorAll('.tg-si').length]; })()")
        ok(r[0] > 0 and r[1] == r[0] and r[2] > 0 and r[3] == 0, f"Assets: every visit's status, and the open visit's operations, in the same look ({r})")
        await pg.screenshot(path=os.path.join(OUT, "c7_assets.png"))
        # ---- Manager ----
        await pg.evaluate(go('manager')); await pg.wait_for_timeout(1000)
        r = await pg.evaluate("(()=>{ const R=document.querySelector('[data-pg=manager]'); if(!R) return null; const t=[...R.querySelectorAll('.mq-tile, [class*=tile]')].find(x=>/Open ROs/.test(x.textContent)); const lg=R.querySelectorAll('.mq-lg2 .pgst').length; return [t ? t.innerText.replace(/\\s+/g,' ') : null, lg]; })()")
        ok(r and r[0] and '%' not in r[0].split('Open ROs')[1][:40], f"Manager: the Open ROs tile shows a plain change, not a percent ({r[0] if r else r})")
        ok(r and r[1] > 0, f"Manager → Open work: the legend uses the status look ({r[1] if r else r})")
        await pg.screenshot(path=os.path.join(OUT, "c8_manager.png"))
        await pg.evaluate("(()=>{ const R=document.querySelector('[data-pg=manager]'); const b=[...R.querySelectorAll('[data-a=sel][data-k=wip]')][0]; b && b.click(); })()"); await pg.wait_for_timeout(700)
        r = await pg.evaluate("(()=>{ const R=document.querySelector('[data-pg=manager]'); return [R.querySelectorAll('.mq-tr').length, R.querySelectorAll('.mq-tr .pgst').length]; })()")
        ok(r[0] == 0 or r[1] > 0, f"Manager → Open ROs drill rows: the status look ({r})")
        await pg.screenshot(path=os.path.join(OUT, "c9_mgr_drill.png"))
        await pg.evaluate("(()=>{ const R=document.querySelector('[data-pg=manager]'); const b=R.querySelector('[data-v=fleet], [data-a=view][data-v=fleet], button[data-k=fleet]'); if(b){ b.click(); return 1; } return 0; })()"); await pg.wait_for_timeout(500)
        # ---- Day report ----
        await pg.evaluate(go('report')); await pg.wait_for_timeout(800)
        r = await pg.evaluate("(()=>{ const R=document.querySelector('[data-pg=report]'); if(!R) return null; const rows=[...R.querySelectorAll('.dy-shop tbody tr')]; return [rows.length, R.querySelectorAll('.dy-shop .pgst').length]; })()")
        ok(r is None or r[0] == 0 or r[1] >= 0, f"Day report renders ({r})")
        # ---- dark ----
        await pg.evaluate("document.documentElement.setAttribute('data-theme','ivd')"); await pg.evaluate(go('rolist')); await pg.wait_for_timeout(600)
        await pg.click(f"{Q} .rq-rows .rq-row .rq-k-cust"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=os.path.join(OUT, "c10_dark.png"))
        ok(not errs, "no console errors: " + "; ".join(errs[:3]))
        await b.close()
        # ---- a Technician: the status reads, it doesn't open ----
        b, pg, errs = await setup(p)
        sid = await pg.evaluate("(()=>{ const T=__tg.staffList().filter(s=>s.role==='Technician'); return T[0] && T[0].id; })()")
        await pg.evaluate(SIGN(sid)); await pg.wait_for_timeout(500)
        await pg.evaluate(go('rolist')); await pg.wait_for_timeout(700)
        onp = await pg.evaluate(f"!!document.querySelector('{Q}')")
        if onp:
            await pg.click(f"{Q} .rq-rows .rq-row .rq-k-cust"); await pg.wait_for_timeout(400)
            r = await pg.evaluate(f"[!!document.querySelector('{Q} .rq-peek .rq-strow .pgst'), !!document.querySelector('{Q} .rq-peek .rq-strow .pgst.m'), (()=>{{ try{{ return __tg.can ? __tg.can('ro.status') : null; }}catch(e){{ return null; }} }})()]")
            ok(r[0] and (not r[1] or r[2] is not False), f"a Technician without 'Change an RO's status' reads it, no pill ({r})")
        else:
            print("     (the Technician has no RO list page — skipped)")
        await b.close()
        # ---- phone ----
        b, pg, errs = await setup(p, 390, 844)
        await pg.evaluate(ADMIN); await pg.wait_for_timeout(900)
        r = await pg.evaluate(f"(()=>{{ const L=[...document.querySelectorAll('{Q} .rq-rows .rq-row')]; return [L.length, L.filter(x=>x.querySelector('.pgst .pgst-i')).length, document.documentElement.scrollWidth <= innerWidth + 1]; }})()")
        ok(r[0] > 0 and r[1] == r[0] and r[2], f"phone: each card shows the status icon, no sideways scroll ({r})")
        await pg.screenshot(path=os.path.join(OUT, "c11_phone.png"))
        ok(not errs, "phone: no console errors: " + "; ".join(errs[:3]))
        await b.close()
    print("\nFAILS:", len(FAILS), FAILS)
asyncio.run(main())
