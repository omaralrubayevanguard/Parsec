# Parsec 14.8 (A) — the RO page's operation cards: Declined in the status menu (keys 1–9, Undo, its clock stops),
# and the complaint changes in place — while the clock runs (through the 5-second redraws) and while it's stopped; the Technician mount.
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_a.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots148a"); os.makedirs(OUT, exist_ok=True)
def JT(js): return "(()=>{ const h=document.querySelector('[data-pg=tech] .jc-host'); const R=h&&h.shadowRoot; if(!R) return null; " + js + " })()"
OPEN = "((rid)=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); localStorage.removeItem('rop_fold'); __tg.pxSignedIn(); const U=__tg.UI(); U.view='ros'; U.selectedRo=rid; __tg.render(); })"
OPN = "(o)=>__tg.STATE().ros.flatMap(r=>r.operations).find(x=>x.id===o)"
async def op(pg, oid, f): return await pg.evaluate(f"(()=>{{ const o=({OPN})({json.dumps(oid)}); return o ? o[{json.dumps(f)}] : undefined; }})()")
async def rowbox(pg, jj, oid, sel=".px-row__t"):
    return await pg.evaluate(jj(f"const t=R.querySelector('.rop-orow[data-op=\"{oid}\"] {sel}'); if(!t) return null; t.scrollIntoView({{block:'center'}}); const r=t.getBoundingClientRect(); return [r.left+24, r.top+r.height/2]"))
async def edit_check(pg, jj, oid, tag, typed, wait_ms):
    bx = await rowbox(pg, jj, oid)
    await pg.mouse.click(bx[0], bx[1]); await pg.wait_for_timeout(300)
    inp = await pg.evaluate(jj("const i=R.querySelector('.rop-ren'); return i ? [i.value, R.activeElement===i] : null"))
    ok(inp and inp[1], f"{tag}: a click on the open operation's title edits it ({inp})")
    await pg.keyboard.press("Control+a"); await pg.keyboard.type(typed[:6]); await pg.wait_for_timeout(wait_ms); await pg.keyboard.type(typed[6:])
    cur = await pg.evaluate(jj("const i=R.querySelector('.rop-ren'); return i ? [i.value, R.activeElement===i, i.selectionStart] : null"))
    ok(cur and cur[0] == typed and cur[1] and cur[2] == len(typed), f"{tag}: {wait_ms/1000:.0f} s of ticks mid-edit didn't reset the text or the caret ({cur})")
    await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
    ok(await op(pg, oid, "complaint") == typed, f"{tag}: Enter saves the complaint")
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        P = await pg.evaluate(PREP)
        rid, oa, ob = P["ro"], P["a"], P["b"]
        await pg.evaluate(OPEN + f"({json.dumps(rid)})"); await pg.wait_for_timeout(1200)
        orig = await op(pg, oa, "complaint")
        # ---- closed row: a double-click opens it and edits the complaint
        bx = await rowbox(pg, J, oa)
        await pg.mouse.dblclick(bx[0], bx[1]); await pg.wait_for_timeout(400)
        d = await pg.evaluate(J("const i=R.querySelector('.rop-ren'); return i ? [i.value, R.activeElement===i] : null"))
        ok(d and d[0] == orig and d[1], f"a double-click on a closed operation's title edits it ({d})")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        ok(await op(pg, oa, "complaint") == orig and not await pg.evaluate(J("return !!R.querySelector('.rop-ren')")), "Esc leaves it as it was")
        # ---- stopped clock: click, type through a few seconds, Enter, Undo
        await edit_check(pg, J, oa, "stopped", "Alternator not charging - check belt", 2500)
        au = await pg.evaluate("__tg.auditLog().slice(-3).map(a=>a.text)")
        ok(any("complaint" in a for a in au), f"an Activity line ({au[-1] if au else ''})")
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(500)
        ok(await op(pg, oa, "complaint") == orig, "Undo puts the complaint back")
        # ---- the clock running on it: the 5-second redraw must not wipe the edit
        await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(), r=__tg.getRO({json.dumps(rid)}); S.punches.push({{id:'p148', roId:r.id, opId:{json.dumps(oa)}, start:new Date(Date.now()-20*60e3).toISOString(), stop:null, startReason:'Repairing', stopReason:null, notes:'', by:__tg.pcMe()}}); __tg.render(); }})()""")
        await pg.wait_for_timeout(600)
        if not await pg.evaluate(J(f"return !!R.querySelector('.rop-orow.is-on[data-op=\"{oa}\"]')")):
            bx = await rowbox(pg, J, oa, ".px-row__n"); await pg.mouse.click(bx[0], bx[1]); await pg.wait_for_timeout(400)
        await edit_check(pg, J, oa, "running", "Check engine light - NOx sensor, running", 6500)
        ok(await pg.evaluate("!__tg.STATE().punches.find(p=>p.id==='p148').stop"), "the clock kept running")
        await pg.screenshot(path=os.path.join(OUT, "1_running_edit.png"))
        # ---- Declined: the last item, after a line, key 9; the clock stops as Hold Tech; Undo
        await pg.evaluate(J(f"R.querySelector('.rop-orow[data-op=\"{oa}\"] .rop-st').click()")); await pg.wait_for_timeout(300)
        m = await pg.evaluate(J("const p=R.querySelector('.rop-stpop'); if(!p) return null; const it=[...p.querySelectorAll('.px-menu__item')]; return [it.map(x=>x.textContent.trim()), !!p.querySelector('.px-menu__sep'), !!it[it.length-1].querySelector('.px-si, svg')]"))
        ok(m and m[0][-1].startswith("Declined") and m[0][-1].endswith("9") and m[1] and m[2], f"Declined is the last item, after a line, with its icon and key 9 ({m and m[0]})")
        await pg.screenshot(path=os.path.join(OUT, "2_menu.png"))
        await pg.keyboard.press("9"); await pg.wait_for_timeout(500)
        st = await pg.evaluate(f"(()=>{{ const p=__tg.STATE().punches.find(p=>p.id==='p148'); return [({OPN})({json.dumps(oa)}).declined, !!p.stop, p.stopReason]; }})()")
        ok(st == [True, True, "Hold Tech"], f"9 declines it; its clock stops as Hold Tech ({st})")
        pill = await pg.evaluate(J(f"const r=R.querySelector('.rop-orow[data-op=\"{oa}\"]'); return r ? [r.querySelector('.rop-st').textContent.trim(), (r.querySelector('.px-row__m')||{{}}).textContent||''] : null"))
        ok(pill and pill[0].startswith("Declined"), f"the card shows the Declined pill ({pill})")
        live = await pg.evaluate(f"__tg.raLive(__tg.getRO({json.dumps(rid)})).map(o=>o.id)")
        ok(oa not in live, "it's out of the live operations (totals, roll-up, money)")
        # ---- a declined operation doesn't start: the play buttons greyed out with why; the start paths refuse it
        if not await pg.evaluate(J(f"return !!R.querySelector('.rop-orow.is-on[data-op=\"{oa}\"]')")):
            bx = await rowbox(pg, J, oa, ".px-row__n"); await pg.mouse.click(bx[0], bx[1]); await pg.wait_for_timeout(400)
        pb = await pg.evaluate(J("const b=R.querySelector('.ock-pb[data-ock=go]'); return b ? [b.disabled, b.title] : null"))
        ok(pb and pb[0] and "Op 1 is declined — pick another status to work on it" in pb[1], f"the clock card's play button is off, with why ({pb})")
        n0 = await pg.evaluate("__tg.STATE().punches.filter(p=>!p.stop).length")
        await pg.evaluate("__tg.JC.clock()"); await pg.wait_for_timeout(400)
        jt = await pg.evaluate(J("const t=R.getElementById('toast'); return t ? t.textContent : ''"))
        ok("is declined" in jt and await pg.evaluate("__tg.STATE().punches.filter(p=>!p.stop).length") == n0, f"the RO page's start (the keys' path) says why and starts nothing ({jt[:70]})")
        await pg.evaluate(f"__tg.doStartPunch({json.dumps(rid)}, {json.dumps(oa)}, 'Repairing')"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate(f"!__tg.STATE().punches.some(p=>p.opId==={json.dumps(oa)} && !p.stop)") and "is declined" in (await pg.evaluate("((document.querySelector('.toast')||{}).textContent||'')")), "the start function refuses it too (the keys' path)")
        tb = await pg.evaluate(J("return [...R.querySelectorAll('.rop-acts button')].map(b=>b.title).filter(t=>/^Start the clock on Op/.test(t))"))
        ok(not any(t.endswith("Op 1") for t in tb), f"the truck card doesn't offer Start Op 1 ({tb})")
        await pg.screenshot(path=os.path.join(OUT, "3_declined.png"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(500)
        st = await pg.evaluate(f"(()=>{{ const p=__tg.STATE().punches.find(p=>p.id==='p148'); return [!!({OPN})({json.dumps(oa)}).declined, !!p.stop]; }})()")
        ok(st == [False, False], f"Undo: back, and its clock running again ({st})")
        # decline again by click, then Hold tech (key 1) brings it back
        await pg.evaluate(J(f"R.querySelector('.rop-orow[data-op=\"{oa}\"] .rop-st').click()")); await pg.wait_for_timeout(250)
        await pg.evaluate(J("[...R.querySelectorAll('.rop-stpop .px-menu__item')].pop().click()")); await pg.wait_for_timeout(400)
        ok(await op(pg, oa, "declined") is True, "a click on Declined declines it")
        await pg.evaluate(J(f"R.querySelector('.rop-orow[data-op=\"{oa}\"] .rop-st').click()")); await pg.wait_for_timeout(250)
        await pg.keyboard.press("1"); await pg.wait_for_timeout(400)
        js1 = await pg.evaluate(f"(()=>{{ const o=({OPN})({json.dumps(oa)}); return [!!o.declined, (o.jobStatus||{{}}).status]; }})()")
        ok(js1 == [False, "Hold Tech"], f"Hold tech (1) brings it back ({js1})")
        # ---- the Technician mount: the same edit
        await pg.evaluate(SIGN(P["A"])); await pg.wait_for_timeout(300)
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO({json.dumps(rid)}); r.assignedTech={json.dumps(P['An'])}; const U=__tg.UI(); U.view='tech'; __tg.render(); }})()"); await pg.wait_for_timeout(1200)
        tro = await pg.evaluate("(()=>{ const T=__tg.tcxGet(); return T ? T.ro : null; })()")
        if tro != rid:
            await pg.evaluate(f"(()=>{{ try{{ __tg.UI().selectedRo={json.dumps(rid)}; }}catch(e){{}} __tg.render(); }})()"); await pg.wait_for_timeout(800)
            tro = await pg.evaluate("(()=>{ const T=__tg.tcxGet(); return T ? T.ro : null; })()")
        if tro:
            o2 = await pg.evaluate(f"__tg.getRO({json.dumps(tro)}).operations.filter(o=>!o.declined)[0].id")
            if not await pg.evaluate(JT(f"return !!R.querySelector('.rop-orow.is-on[data-op=\"{o2}\"]')")):
                bx = await rowbox(pg, JT, o2, ".px-row__n"); await pg.mouse.click(bx[0], bx[1]); await pg.wait_for_timeout(500)
            await edit_check(pg, JT, o2, "Technician mount", "Replace outlet NOx sensor - tech", 2000)
        else:
            ok(False, "the Technician page mounted an RO")
        ok(not errs, "no page errors: " + " | ".join(errs[:3]))
        await b.close()
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
