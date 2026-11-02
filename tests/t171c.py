# Parsec 17.1 (C) — the operation row is the number, the complaint and the status; the job type is the row's coloured edge
# (a click changes it); the details are inside the card (a facts grid, Add ▾ for a code, a document or the Library, a blocker
# beside the status); the time bar shows who worked each piece and the notes pinned where they happened — point at one to read
# it, click the bar to add one at that moment (its time is kept beside the note, p.noteAt). The Time tab stays as it was.
import asyncio, os, sys, json, re
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_a.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)

# one RO, its first operation with two finished punches by two people (a timed note on the first, an old untimed one on the
# second), a part still on the way; its second operation untouched
PREP = """(()=>{ const S=__tg.STATE(), now=Date.now(), H=3600000;
  S.punches.forEach(p=>{ if(!p.stop){ p.stop=new Date(Math.max(+new Date(p.start)+1000, now-120000)).toISOString(); p.stopReason='Switched job'; p.burntCredited=true; } });
  const T=__tg.staffList().filter(s=>s.role==='Technician');
  const r=S.ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length>=2)[0], o=r.operations[0];
  o.declined=false; o.jobType='OP'; o.quoted='4'; o.jobStatus={status:'Waiting – Parts', setAt:new Date().toISOString(), hand:true};
  o.complaint='Wheel seal leaking - drive axle, oil on the brake shoes and the backing plate, noise when braking';
  (o.parts||[]).forEach(x=>{ x.status='Received'; }); o.parts=(o.parts||[]).concat([{ id:'pt_x171c', description:'Wheel seal', partNumber:'21345678', qty:1, status:'Ordered' }]);
  S.punches=S.punches.filter(p=>p.opId!==o.id);
  const d0=new Date(now-26*H); d0.setMinutes(0,0,0); const a0=+d0;
  S.punches.push({ id:'pn_171c_a', roId:r.id, opId:o.id, start:new Date(a0).toISOString(), stop:new Date(a0+H).toISOString(), startReason:'Diagnosing', stopReason:'Switched job', by:T[0].name, notes:'Weep hole wet, bearing play at the hub.', noteAt:{ 'Weep hole wet, bearing play at the hub.': new Date(a0+15*60000).toISOString() }, burntCredited:true });
  S.punches.push({ id:'pn_171c_b', roId:r.id, opId:o.id, start:new Date(a0+2*H).toISOString(), stop:new Date(a0+3*H).toISOString(), startReason:'Repairing', stopReason:'Waiting – Parts', by:T[1].name, notes:'Hub off, seal torn.', burntCredited:true });
  __tg.render(); return { ro:r.id, a:o.id, b:r.operations[1].id, A:T[0].name, B:T[1].name, a0:a0 }; })()"""
ROW = lambda op: f"R.querySelector('.px-row[data-op=\"{op}\"]')"

async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        X = await pg.evaluate(PREP)
        await pg.evaluate(f"(()=>{{ localStorage.removeItem('tec_viewas'); __tg.pxSignedIn(); const U=__tg.UI(); U.view='ros'; U.selectedRo='{X['ro']}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        # ---- the row
        row = await pg.evaluate(J(f"const r={ROW(X['a'])}; return {{ edge: !!r.querySelector(':scope > .rop-jte'), t: r.querySelector('.px-row__t').textContent, tip: r.querySelector('.px-row__t').title, st: !!r.querySelector('.rop-st'), old: ['.rop-jt','.px-row__time','.px-mini','.px-av','.rop-chip','.libFg','.libSteps'].filter(s=>r.querySelector(s)), stm: (r.querySelector('.rop-octl > .rop-stm')||{{}}).textContent||'', next: ((r.querySelector('.rop-octl > .rop-stm')||{{}}).nextElementSibling||{{classList:[]}}).classList.contains('rop-st') }}"))
        ok(row["edge"] and row["st"] and not row["old"], f"the row is the number, the complaint and the status, the job type its edge (left over: {row['old']})")
        ok("noise when braking" in row["tip"], "the whole complaint shows on hover")
        ok("on the way" in row["stm"] and row["next"], f"the blocker sits beside the status ({row['stm']!r})")
        w = await pg.evaluate(J(f"const r={ROW(X['a'])}, t=r.querySelector('.px-row__t'); return [t.scrollWidth > t.clientWidth, t.getBoundingClientRect().width, r.getBoundingClientRect().width]"))
        ok(w[1] > w[2] * 0.5, f"the complaint gets most of the row ({round(w[1])} of {round(w[2])} px)")
        # ---- the coloured edge changes the job type
        on0 = await pg.evaluate(J(f"return {ROW(X['a'])}.classList.contains('is-on')"))
        await pg.evaluate(J(f"{ROW(X['a'])}.querySelector('.rop-jte').click()")); await pg.wait_for_timeout(300)
        mn = await pg.evaluate(J("const p=R.querySelector('.rop-jtpop'); return p ? [...p.querySelectorAll('.px-menu__item')].map(b=>b.textContent.trim()) : null"))
        ok(mn and "WARR" in mn and "REPAIR" in mn, f"a click on the edge opens the job types ({mn})")
        await pg.evaluate(J("[...R.querySelectorAll('.rop-jtpop .px-menu__item')].find(b=>b.textContent.trim()==='WARR').click()")); await pg.wait_for_timeout(400)
        jt = await pg.evaluate(f"__tg.getRO('{X['ro']}').operations[0].jobType")
        e2 = await pg.evaluate(J(f"return {ROW(X['a'])}.querySelector('.rop-jte').dataset.t"))
        ok(jt == "WARR" and e2 == "WARR", f"…and picking one changes it; the edge follows ({jt}, {e2})")
        st = await pg.evaluate(J(f"return {ROW(X['a'])}.classList.contains('is-on')"))
        ok(st == on0, "the edge doesn't open or close the card")
        # ---- inside the card: the facts and Add
        await pg.evaluate(J(f"const r={ROW(X['a'])}; if(!r.classList.contains('is-on')) r.querySelector('.px-row__n').click()")); await pg.wait_for_timeout(700)
        f = await pg.evaluate(J("const g=R.querySelector('.px-op .rop-facts'); return g ? [...g.querySelectorAll('.rop-fact')].map(x=>x.querySelector('small').textContent + ':' + x.querySelector('.rop-fv').textContent.trim()) : null"))
        ok(f and f[0] == "Job type:WARR", f"the card opens on its facts ({f})")
        await pg.evaluate(J("R.querySelector('.rop-jtv').click()")); await pg.wait_for_timeout(300)
        ok(await pg.evaluate(J("return !!R.querySelector('.rop-jtpop')")), "Job type in the facts opens the same menu")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        ad = await pg.evaluate(J("const r=R.querySelector('.px-op .fltRow'); return [!!r.querySelector('.fcAdd'), r.querySelectorAll('.libAdd, .libFind').length, [...r.querySelectorAll('.fltAdd')].map(b=>b.textContent.trim())]"))
        ok(ad[0] and ad[1] == 0 and ad[2] == ["Add"], f"one Add on the codes line instead of + code, + document and Library ({ad})")
        await pg.evaluate(J("R.querySelector('.fcAdd').click()")); await pg.wait_for_timeout(300)
        am = await pg.evaluate(J("const p=R.querySelector('.fcAddPop'); return p ? [...p.querySelectorAll('.px-menu__item')].map(b=>b.textContent.trim()) : null"))
        ok(am and am[:2] == ["Fault code", "Document…"] and "Find in the Library" in am, f"Add: a fault code, a document, the Library ({am})")
        await pg.evaluate(J("R.querySelector('.fcAddPop .px-menu__item').click()")); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(J("return !!R.querySelector('.fltIn')")), "Fault code opens the code box")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        # ---- the time bar: who worked each piece, the notes where they happened
        C = f"R.querySelector('.ock[data-op=\"{X['a']}\"]')"
        tb = await pg.evaluate(J(f"const c={C}; return {{ w: [...c.querySelectorAll('.ock-segs i')].map(i=>i.dataset.w||''), pins: [...c.querySelectorAll('.ock-pin')].map(p=>parseFloat(p.style.left)), lbl: [...c.querySelectorAll('.ock-pin')].map(p=>p.getAttribute('aria-label')) }}"))
        ini = lambda n: "".join(x[0] for x in n.split())[:2].upper()
        ok(tb["w"] == [ini(X["A"]), ini(X["B"])], f"initials over each piece of the bar ({tb['w']})")
        ok(len(tb["pins"]) == 2 and tb["pins"][0] < tb["pins"][1], f"a pin for each note ({tb['pins']})")
        sw = await pg.evaluate(J(f"const c={C}, s=[...c.querySelectorAll('.ock-segs i')], b=c.querySelector('.ock-bar').getBoundingClientRect(), r0=s[0].getBoundingClientRect(), r1=s[1].getBoundingClientRect(); return [(r0.left-b.left)/b.width*100, (r0.right-b.left)/b.width*100, (r1.right-b.left)/b.width*100]"))
        q = sw[0] + (sw[1] - sw[0]) * 0.25
        ok(abs(tb["pins"][0] - q) < 2, f"the timed note sits at its time — a quarter into the first piece ({tb['pins'][0]:.1f} vs {q:.1f})")
        ok(abs(tb["pins"][1] - sw[2]) < 2, f"an old note with no time sits at the end of its punch ({tb['pins'][1]:.1f} vs {sw[2]:.1f})")
        ok(X["A"].split()[0] in tb["lbl"][0] and "Weep hole" in tb["lbl"][0] and "during" in tb["lbl"][1], f"each pin says who, when and what ({tb['lbl']})")
        # point at a pin: the note
        pp = await pg.evaluate(J(f"const r={C}.querySelector('.ock-pin').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]"))
        await pg.mouse.move(pp[0], pp[1]); await pg.wait_for_timeout(350)
        pn = await pg.evaluate(J(f"const n={C}.querySelector('.ock-pin .ock-pn'); return [getComputedStyle(n).opacity, n.textContent]"))
        ok(float(pn[0]) > 0.9 and "Weep hole wet" in pn[1], f"pointing at a pin shows the note ({pn})")
        # the pointer over the bar shows where a note would go
        bar = await pg.evaluate(J(f"const r={C}.querySelector('.ock-bar').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]"))
        x = bar[0] + bar[2] * (sw[0] + (sw[1] - sw[0]) * 0.6) / 100
        await pg.mouse.move(x, bar[1] + bar[3] / 2); await pg.wait_for_timeout(250)
        gs = await pg.evaluate(J(f"const g={C}.querySelector('.ock-gst'); return [g.classList.contains('on'), g.dataset.t||'']"))
        ok(gs[0] and re.search(r"\d:\d\d:\d\d [ap]m", gs[1] or ""), f"over the bar, a mark says the time the note would get, to the second ({gs[1]!r})")   # 17.2
        # click: a note at that moment, on that punch
        await pg.mouse.click(x, bar[1] + bar[3] / 2); await pg.wait_for_timeout(400)
        na = await pg.evaluate(J(f"const n={C}.querySelector('.ock-nadd'); return n ? [n.querySelector('b').textContent, document.activeElement && document.activeElement.shadowRoot ? (document.activeElement.shadowRoot.activeElement||{{}}).tagName : ''] : null"))
        ok(na and na[0].startswith("Note at") and na[1] == "INPUT", f"a click on the bar opens a note at that moment, ready to type ({na})")
        await pg.keyboard.type("Seal was cut on the old race"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
        pa = await pg.evaluate("(()=>{ const p=__tg.STATE().punches.find(p=>p.id==='pn_171c_a'); return [p.notes, p.noteAt]; })()")
        at = (pa[1] or {}).get("Seal was cut on the old race.")
        el = await pg.evaluate(f"(()=>{{ const t=+new Date('{at}'); return (t-{X['a0']})/60000; }})()") if at else None
        ok("Seal was cut on the old race." in pa[0] and el is not None and 30 < el < 42, f"saved on that punch, at that moment ({round(el or -1)} min into it)")
        n3 = await pg.evaluate(J(f"return {C}.querySelectorAll('.ock-pin').length"))
        ok(n3 == 3, f"…and its pin shows on the bar ({n3})")
        # Escape closes a note left empty
        await pg.mouse.click(x, bar[1] + bar[3] / 2); await pg.wait_for_timeout(300)
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        ok(not await pg.evaluate(J(f"return !!{C}.querySelector('.ock-nadd')")), "Escape closes it")
        # notes saved elsewhere get their time too (the Time tab's own Add a note is unchanged)
        await pg.evaluate("(()=>{ const p=__tg.STATE().punches.find(p=>p.id==='pn_171c_b'); __tg.ockNoteTime(p, 'Hub off, seal torn.', +new Date(p.start)+30*60000); __tg.render(); })()"); await pg.wait_for_timeout(1500)   # the card's ticker redraws the flags each second
        tb2 = await pg.evaluate(J(f"return [...{C}.querySelectorAll('.ock-pin')].map(p=>p.getAttribute('aria-label'))"))
        ok(not any("during" in x for x in tb2), f"a note given its time moves to it ({tb2})")
        tt = await pg.evaluate(J("return [...R.querySelectorAll('[role=tab][data-tab]')].map(b=>b.dataset.tab)"))   # 17.2: icon tabs inside the clock card
        ok("time" in tt, f"the Time tab stays ({tt})")
        await pg.screenshot(path=os.path.join(OUT, "t171c_card.png"))
        ok(not errs, f"no console errors: {errs[:3]}")
        print("FAILS:", len(FAILS), FAILS)
        await b.close()

asyncio.run(main())
