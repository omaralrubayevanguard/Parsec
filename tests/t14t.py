# Parsec 14 (T) — the road test toggle, closed at release, one Undo for a release, Sent to you on the Technician page,
# one stage label, "No tech yet", and the RO page / Technician / Triage / Foreman / Warranty statuses in the shared look
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_tt.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots14t"); os.makedirs(OUT, exist_ok=True)
ADMIN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()"
def AS(sid): return f"(()=>{{ localStorage.setItem('tec_viewas', '{sid}'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); try{{ __tg.CX.U().skipMorning = __tg.todayStr(); }}catch(e){{}} __tg.render(); }})()"
async def view(pg, v, extra=""):
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; {extra} __tg.render(); }})()"); await pg.wait_for_timeout(700)
async def ro_page(pg, rid):
    await view(pg, "ros", f"U.selectedRo='{rid}';"); await pg.wait_for_timeout(500)
# two open ROs with work left, a tech on each; one more with no tech
PICK = """(()=>{ const S=__tg.STATE(); const L=S.ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.filter(o=>!o.declined).length>=2 && __tg.roStatus(r).status!=='Declined');
  const a=L[0], b=L[1]; return { a: a.id, b: b.id, an: __tg.tgNum(a), bn: __tg.tgNum(b) }; })()"""
DONE_ALL = """(id=>{ const ro=__tg.getRO(id); (ro.operations||[]).forEach(o=>{ if(o.declined) return; if(!o.appr) o.appr={ s:'ok', by:'Jenna Cho', who:'Customer', how:'Call', at:new Date().toISOString() }; (o.parts||[]).forEach(p=>{ p.status='Installed'; }); __tg.tyOpSet(ro, o, 'Complete'); }); __tg.render(); })"""
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate(ADMIN); await pg.wait_for_timeout(500)
        X = await pg.evaluate(PICK); A, B = X["a"], X["b"]
        # ---------- A · the toggle on the RO page ----------
        await ro_page(pg, A)
        t = await pg.evaluate(J("const s=R.querySelector('.rop-rtt .rtt-sw'); return { sw: !!s, on: s && s.getAttribute('aria-checked'), rt: !!R.querySelector('.rop-rtb'), qc: !!R.querySelector('.rop-qcb') }"))
        ok(t["sw"] and t["on"] == "true" and t["rt"] and t["qc"], f"RO page: the road test toggle is on, Road test and Truck checks show ({t})")
        await pg.screenshot(path=os.path.join(OUT, "t1_ro_on.png"))
        await pg.evaluate(J("R.querySelector('.rop-rtt .rtt-sw').click()")); await pg.wait_for_timeout(500)
        await pg.evaluate(J("R.querySelector('.rop-qct .rtt-sw').click()")); await pg.wait_for_timeout(500)   # 17.3: the truck checks have their own switch now
        t = await pg.evaluate(J(f"const s=R.querySelector('.rop-rtt .rtt-sw'); return {{ on: s && s.getAttribute('aria-checked'), rt: !!R.querySelector('.rop-rtb'), qc: !!R.querySelector('.rop-qcb'), no: __tg.getRO('{A}').noRoadTest === true, txt: (R.querySelector('.rop-rtt')||{{}}).textContent }}"))
        ok(t["on"] == "false" and not t["rt"] and not t["qc"] and t["no"], f"both switches off: no Road test or Truck checks on the RO page, stored on the RO ({t})")
        await pg.screenshot(path=os.path.join(OUT, "t2_ro_off.png"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(400); await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(400)   # 17.3: one Undo per switch
        ok(await pg.evaluate(f"__tg.getRO('{A}').noRoadTest !== true && __tg.qcNeeded(__tg.getRO('{A}'))"), "Undo turns them back on")
        await pg.evaluate(f"__tg.rtToggle(__tg.getRO('{A}'), false); __tg.qcToggle(__tg.getRO('{A}'), false)"); await pg.wait_for_timeout(300)
        act = await pg.evaluate("(()=>{ const S=__tg.STATE(); const L=(S.auditLog||S.audit||(S.shop&&S.shop.audit)||[]); return (Array.isArray(L)?L:[]).slice(-3).map(x=>x.text||'').join(' | '); })()")
        ok("no road test" in act.lower(), f"the change is in Activity ({act[-90:]})")
        # ---------- every page: no road test buttons for that RO ----------
        res = {}
        for v, extra in [("triage", f"U.tgSel='{A}'; U.tgView='desk';"), ("foreman", f"U.fmSel='{A}';"), ("warranty", f"U.waSel='{A}';"), ("rolist", "")]:
            await view(pg, v, extra)
            res[v] = await pg.evaluate(f"[...document.querySelectorAll('[data-action=tg-pop][data-p=road][data-ro=\"{A}\"],[data-action=tg-pop][data-p=checks][data-ro=\"{A}\"]')].length")
        res["btns"] = await pg.evaluate(f"__tg.trxBtns(__tg.getRO('{A}')) === '' && !!__tg.trxBtns(__tg.getRO('{B}'))")
        ok(all(v == 0 for k, v in res.items() if k != "btns") and res["btns"], f"no Road test / Truck checks buttons for it on Triage, Foreman, Warranty, the RO list — and the shared buttons are empty for it only ({res})")
        # ---------- all the work done with no road test → ready to release ----------
        await pg.evaluate(DONE_ALL + f"('{A}')"); await pg.wait_for_timeout(1500)
        st = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{A}'); return {{ s: __tg.roStatus(ro).status, shown: __tg.roStShown(ro), closed: ro.dateClosed||null, done: __tg.roIsDone(ro), work: __tg.roWorkDone(ro) }}; }})()")
        ok(st["s"] == "Complete – Road test" and st["shown"] == "Complete" and not st["closed"] and not st["done"] and st["work"], f"every operation done, no road test: the RO reads Complete, the work is done, it isn't closed yet ({st})")
        need = await pg.evaluate(f"(()=>{{ const it=__tg.tgNeedsAll().find(x=>x.ro && x.ro.id==='{A}'); return it ? [it.g, it.btn, it.why] : null; }})()")
        ok(need and need[0] == "go" and need[1] == "Release", f"Triage Needs action: straight to Ready to go — Release, no Road test or Truck checks group ({need})")
        cl = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{A}'); return [__tg.tyCloseChecks(ro).map(c=>c.k), __tg.tgRelChecks(ro).map(c=>c.k), __tg.trxAuto(ro).map(c=>c.t), (__tg.roStages(ro).list.find(x=>x.k==='roadtest')||{{}}).state]; }})()")
        ok("road" not in cl[0] and "qc" not in cl[1] and "Road test passed" not in cl[2] and cl[3] == "x", f"no road-test line in Ready to close or Release, no truck-checks line, the stage track skips Road test ({cl})")
        await view(pg, "triage", f"U.tgSel='{A}'; U.tgView='desk';")
        await pg.screenshot(path=os.path.join(OUT, "t3_triage_off.png"))
        # release it (anyway — notes and files are open on sample data), then one Undo
        await pg.evaluate(f"(()=>{{ __tg.tgOpenPop('release', '{A}'); const U=__tg.UI(); U.tgRL=Object.assign(U.tgRL||{{}}, {{ reason: 'Customer is at the counter', to: 'o', other: 'Driver' }}); __tg.tgRelease(true); }})()"); await pg.wait_for_timeout(800)
        rel = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{A}'); return [__tg.roStatus(ro).status, !!ro.dateClosed, __tg.roIsDone(ro), (document.querySelector('.toast')||{{}}).textContent||'']; }})()")
        ok(rel[0] == "Complete – Released" and rel[1] and rel[2], f"Release: Released and closed now ({rel[:3]})")
        ok("still open:" in rel[3] and " the ro " not in rel[3].lower().replace("on the ro", "ON THE RO"), f"the release toast says what's open by name ({rel[3][:110]})")
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(1200)
        un = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{A}'); return [__tg.roStatus(ro).status, ro.dateClosed||null, !!ro.releaseRec]; }})()")
        ok(un[0] == "Complete – Road test" and not un[1] and not un[2], f"one Undo takes the whole release back — status, record and closed date ({un})")
        # ---------- B · road test on: the work done reads Complete – Road test (not Hold tech); closed only at release ----------
        open0 = await pg.evaluate("__tg.STATE().ros.filter(r=>!r.shop && r.id!=='shop' && !__tg.roIsDone(r)).length")
        await pg.evaluate(DONE_ALL + f"('{B}')"); await pg.wait_for_timeout(1500)
        st = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{B}'); return [__tg.roStatus(ro).status, ro.dateClosed||null, __tg.roIsDone(ro)]; }})()")
        ok(st[0] == "Complete – Road test" and not st[1] and not st[2], f"bug 6: with the road test still to do, the finished RO reads Complete – Road test, not Hold tech ({st})")
        need = await pg.evaluate(f"(()=>{{ const it=__tg.tgNeedsAll().find(x=>x.ro && x.ro.id==='{B}'); return it ? it.g : null; }})()")
        ok(need == "road", f"road test on: it goes to the Road test group ({need})")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); __tg.tgOpenPop('road', '{B}'); U.trxR.m='log'; U.trxR.res='Pass'; U.trxR.mi='12'; __tg.trxRtGo('log'); }})()"); await pg.wait_for_timeout(1200)
        st = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{B}'); const it=__tg.tgNeedsAll().find(x=>x.ro && x.ro.id==='{B}'); return [__tg.roStatus(ro).status, ro.dateClosed||null, __tg.roIsDone(ro), it ? it.g : null]; }})()")
        open1 = await pg.evaluate("__tg.STATE().ros.filter(r=>!r.shop && r.id!=='shop' && !__tg.roIsDone(r)).length")
        ok(not st[1] and not st[2] and st[3] == "checks" and open1 == open0, f"bug 1: the road test passed — still open (not closed, still counted open), on to Truck checks ({st}, open {open0}→{open1})")
        await view(pg, "rolist")
        rl = await pg.evaluate(f"!![...document.querySelectorAll('[data-pg=rolist] .rq-row')].find(x=>x.textContent.includes('{X['bn']}'))")
        ok(rl, "the RO list's Open tab still lists it")
        # ---------- turning it back on brings it all back ----------
        await pg.evaluate(f"__tg.rtToggle(__tg.getRO('{A}'), true); __tg.qcToggle(__tg.getRO('{A}'), true)"); await pg.wait_for_timeout(500)
        back = await pg.evaluate(f"(()=>{{ const ro=__tg.getRO('{A}'); const it=__tg.tgNeedsAll().find(x=>x.ro && x.ro.id==='{A}'); return [it ? it.g : null, __tg.tyCloseChecks(ro).some(c=>c.k==='road'), !!__tg.trxBtns(ro)]; }})()")
        ok(back[0] == "road" and back[1] and back[2], f"turned back on: Road test group, the release line and the buttons are back ({back})")
        # ---------- C · one stage label ----------
        await pg.evaluate(f"__tg.rtToggle(__tg.getRO('{A}'), true); __tg.qcToggle(__tg.getRO('{A}'), true)")
        X2 = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.assignedTech && r.operations.some(o=>!__tg.opDoneNow(o)) && __tg.tyCat(r)!=='arr'); return { id: r.id, txt: __tg.roStageTxt(r), I: __tg.roStageInfo(r) && [__tg.roStageInfo(r).i, __tg.roStageInfo(r).of] }; })()")
        await view(pg, "triage", f"U.tgSel='{X2['id']}'; U.tgView='inbox';")
        tg = await pg.evaluate("(document.querySelector('[data-pg=triage] .tg-stg, .tg-ib .tg-stg')||{}).textContent||''")
        sq = await pg.evaluate("document.querySelectorAll('.tg-top .tg-sq').length")
        await ro_page(pg, X2["id"])
        rp = await pg.evaluate(J("return ((document.querySelector('.rp-host .rp-stg') || R.querySelector('.px-stage__top'))||{}).textContent||''"))
        ok(tg == X2["txt"] and f"stage {X2['I'][0]} of {X2['I'][1]}" in rp and sq == 0, f"bug 12: Triage's header says the RO page's stage, no square dot ({tg!r} · RO page {rp[:40]!r})")
        await view(pg, "foreman", f"U.fmSel='{X2['id']}';")
        fm = await pg.evaluate("(document.querySelector('.tg-top .tg-stg')||{}).textContent||''")
        ok(fm == X2["txt"], f"Foreman's header too ({fm!r})")
        # ---------- D · No tech yet ----------
        nt = await pg.evaluate("(()=>{ const S=__tg.STATE(); const r=S.ros.find(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length); r.assignedTech=''; delete r.route; __tg.render(); return r.id; })()")
        await ro_page(pg, nt)
        w = await pg.evaluate(J("return ((document.querySelector('.rp-host .rq-with') || R.querySelector('.px-with'))||{}).textContent||''"))
        await view(pg, "triage", f"U.tgSel='{nt}'; U.tgView='inbox';")
        w2 = await pg.evaluate("[...document.querySelectorAll('[data-pg=triage] .tg-m.sys .hd, .tg-ib .tg-m.sys .hd')].map(x=>x.textContent).join(' | ')")
        ok(w.startswith("No tech yet") and "No tech yet" in w2 and "With Technician" not in w2, f"bug 13: no tech assigned reads No tech yet ({w!r} · {w2[:80]!r})")
        # ---------- E · Sent to you on the Technician page ----------
        T = await pg.evaluate("__tg.staffList().filter(s=>s.role==='Technician').map(s=>[s.id, s.name])")
        dana = T[0]
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); __tg.tgOpenPop('road', '{B}'); U.trxR.m='send'; U.trxR.who='{dana[1]}'; U.trxR.when='now'; __tg.trxRtGo('send'); }})()"); await pg.wait_for_timeout(500)
        toast = await pg.evaluate("(document.querySelector('.toast')||{}).textContent||''")
        ok("Technician page" in toast and "Sent to you" in toast, f"bug 2: the toast says where it lands ({toast[:100]})")
        await pg.evaluate(AS(dana[0])); await view(pg, "tech"); await pg.wait_for_timeout(500)
        sent = await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-sent')].map(x=>x.textContent)")
        ok(any("Road test" in s for s in sent), f"{dana[1]}'s Technician page shows it under Sent to you ({sent[:2]})")
        await pg.screenshot(path=os.path.join(OUT, "t4_tech_sent.png"))
        n0 = len(sent)
        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('[data-pg=tech] .tch-sent')].find(x=>/Road test/.test(x.textContent)).querySelector('.tch-sx'); b.click(); })()"); await pg.wait_for_timeout(500)
        n1 = await pg.evaluate("[...document.querySelectorAll('[data-pg=tech] .tch-sent')].filter(x=>/Road test/.test(x.textContent)).length")
        ok(n1 == 0, f"Done takes it off the list ({n0} → road test rows {n1})")
        # ---------- F · statuses: one look on the Technician page; a tech without "Change an RO's status" gets the words ----------
        tc = await pg.evaluate("[document.querySelectorAll('[data-pg=tech] .cx-st').length, document.querySelectorAll('[data-pg=tech] .pgst').length, document.querySelectorAll('[data-pg=tech] .tch-rst').length, [...document.querySelectorAll('[data-pg=tech] .pgst.m')].every(x=>x.dataset.a || x.closest('[data-a]'))]")
        ok(tc[0] == 0 and tc[1] > 0 and tc[3], f"Technician page: no old tinted pills, the shared look, every pill opens something ({tc})")
        await pg.evaluate(f"__tg.permSet({json.dumps(dana[0])}, 'acts', 'ro.status', false)") if False else None
        may = await pg.evaluate(f"(()=>{{ try{{ const r=__tg.permRole('Technician'); return r && r.acts ? !!r.acts['ro.status'] : null; }}catch(e){{ return 'x:' + e.message; }} }})()")
        rst = await pg.evaluate("(()=>{ const h=document.querySelector('[data-pg=tech] .jc-host'), R=h && h.shadowRoot; const b=(h && h.querySelector('.rp-host .rq-strow .pgst')) || (R && R.querySelector('.px-ro__status .pgst')); return b ? [b.tagName, b.classList.contains('m'), b.tagName === 'BUTTON'] : null; })()")   # Parsec 14.3: the RO page's status, mounted
        ok(rst and (rst[0] == "SPAN" and not rst[2]) == (may is False or may is None), f"bug 10: the RO status menu only for those who may change it (tech may: {may}; {rst})")
        # phone
        await pg.set_viewport_size({"width": 390, "height": 844}); await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, "t5_tech_phone.png"))
        await pg.set_viewport_size({"width": 1440, "height": 900}); await pg.wait_for_timeout(400)
        # ---------- G · the shared look on the RO page, Triage, Foreman, Warranty ----------
        await pg.evaluate(ADMIN); await pg.wait_for_timeout(300)
        await ro_page(pg, X2["id"])
        rop = await pg.evaluate(J("return { st: !!(document.querySelector('.rp-host .pgst.m') || R.querySelector('.pgst.m.px-status--button')), op: R.querySelectorAll('.pgst.m.rop-st').length, ops: R.querySelectorAll('.px-row').length, old: R.querySelectorAll('.px-si:not(.pgst-i)').length }"))
        ok(rop["st"] and rop["op"] >= 1 and rop["old"] == 0, f"RO page: the RO status and each operation's status are the shared pill; every icon is the shared one ({rop})")
        await pg.screenshot(path=os.path.join(OUT, "t6_ro_status.png"))
        await view(pg, "warranty")
        wa = await pg.evaluate("[document.querySelectorAll('[data-pg=warranty] .wa-c, .wa-c').length, document.querySelectorAll('.pgst.wa-claimst').length]")
        ok(wa[0] == 0 and wa[1] > 0, f"Warranty: the claim status in the shared look, no tinted pill ({wa})")
        await pg.screenshot(path=os.path.join(OUT, "t7_warranty.png"))
        await view(pg, "foreman"); await pg.screenshot(path=os.path.join(OUT, "t8_foreman.png"))
        await view(pg, "triage"); await pg.screenshot(path=os.path.join(OUT, "t9_triage.png"))
        # dark
        await pg.evaluate("document.documentElement.setAttribute('data-theme','ivd'); __tg.render()"); await pg.wait_for_timeout(500)
        await ro_page(pg, X2["id"]); await pg.screenshot(path=os.path.join(OUT, "t10_ro_dark.png"))
        await view(pg, "tech"); await pg.screenshot(path=os.path.join(OUT, "t11_tech_dark.png"))
        e2 = [e for e in errs if "favicon" not in e]
        ok(not e2, "no console errors: " + "; ".join(e2[:3]))
        print("FAILS:", len(FAILS), FAILS)
        await b.close()
asyncio.run(main())
