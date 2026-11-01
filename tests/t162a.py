# Parsec 16.2 (A) — six more built-in automations, the "What ran" log and Undo.
# Each automation sends once to the right people (fake times for 4 h / 100 % / warranty days), doesn't send again, and
# sends again after its condition clears; switched off, it sends nothing. Start on an operation whose part isn't in asks
# first (doStartPunch and the RO page's clock card), respects the part lock and never asks twice. Every automated action
# is logged; Undo puts back a status, withdraws a message, restores a field, and is greyed with a reason after a later change.
import asyncio, os, sys, json, re
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_a.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots162a"); os.makedirs(OUT, exist_ok=True)
MSGS = "((rule, ro)=>__tg.IB.store().items.filter(x=>x.x && x.x.auto==='v162' && (!rule || x.x.rule===rule) && (!ro || x.ro===ro)).map(x=>({ id: x.id, to: x.to, t: x.t, acts: x.acts, op: x.op })))"
CHECK = "__tg.v162Check(true)"
LOG = "(()=>__tg.STATE().autoLog || [])()"
# nine open ROs to play with, one operation each, nothing running, no contacts
PICK = """(X)=>{ const S=__tg.STATE();
  const L=S.ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.id!==X && (r.operations||[]).length && !/^(Complete – Released|Declined)$/.test(__tg.roStatus(r).status)).slice(0, 9);
  return L.map(r=>{ r.contacts=[]; r.suggest=[]; const o=r.operations[0]; o.declined=false; return { ro: r.id, op: o.id, no: __tg.tgNum(r) }; }); }"""
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        X = await pg.evaluate(PREP); await pg.wait_for_timeout(600)
        R9 = await pg.evaluate(PICK, X["ro"])
        ok(len(R9) == 9, f"nine open ROs to work with ({len(R9)})")
        P = await pg.evaluate("(()=>({ fm: __tg.PG.person('Foreman'), sw: __tg.PG.person('Service writer'), wa: __tg.PG.person('Warranty admin') }))()")
        ok(P["fm"] and P["sw"], f"the team has a foreman and an advisor ({P})")
        # a clean first look: what is already true is marked, nothing is sent
        await pg.evaluate("(()=>{ const S=__tg.STATE(); delete S.autoFired; S.autoLog=[]; const s=__tg.IB.store(); s.items=s.items.filter(x=>!(x.x && x.x.auto==='v162')); })()")
        n0 = await pg.evaluate(CHECK)
        f0 = await pg.evaluate("Object.keys(__tg.STATE().autoFired || {}).length")
        ok(n0 == 0 and len(await pg.evaluate(MSGS + "()")) == 0 and await pg.evaluate("__tg.STATE().autoLog.length") == 0 and f0 > 0, f"the first look sends nothing ({n0} sent, {f0} already-true marked)")
        cfg = await pg.evaluate("(()=>{ const c=__tg.v162Cfg(); return { b: c.builtin, thr: c.thr }; })()")
        ok(all(cfg["b"].get(k) is True for k in ["status", "parts", "partsIn", "waitCust", "ready", "askStart", "overQuote", "warranty"]), f"all eight built-ins are on by default ({cfg['b']})")
        ok(cfg["thr"] == {"waitH": 4, "overPct": 100}, f"thresholds default to 4 h and 100 % ({cfg['thr']})")
        # ---------- 1. parts in → the tech on that op and the foreman ----------
        A = R9[0]
        await pg.evaluate(f"""(()=>{{ const r=__tg.getRO('{A['ro']}'), o=r.operations[0]; o.tech='{X['An']}';
          o.parts=[{{ id: __tg.uid('pt'), description: 'NOx sensor', partNumber: '22827993', qty: 1, status: 'Ordered', bin: 'B4' }}]; }})()""")
        await pg.evaluate(CHECK)
        await pg.evaluate(f"(()=>{{ __tg.getRO('{A['ro']}').operations[0].parts[0].status='Received'; }})()")
        n1 = await pg.evaluate(CHECK); m1 = await pg.evaluate(MSGS + f"('partsIn', '{A['ro']}')")
        ok(n1 == 1 and sorted(x["to"] for x in m1) == sorted([X["An"], P["fm"]]), f"part in → the tech on the op and the foreman ({[x['to'] for x in m1]})")
        ok(all(x["acts"] == [["Open the RO", "open"]] and x["op"] == A["op"] for x in m1) and "NOx sensor" in (m1[0]["t"] if m1 else ""), f"each carries Open the RO ({m1[:1]})")
        await pg.evaluate(CHECK); await pg.evaluate(CHECK)
        ok(len(await pg.evaluate(MSGS + f"('partsIn', '{A['ro']}')")) == 2, "it isn't sent twice")
        await pg.evaluate(f"(()=>{{ __tg.getRO('{A['ro']}').operations[0].parts[0].status='Ordered'; }})()"); await pg.evaluate(CHECK)
        await pg.evaluate(f"(()=>{{ __tg.getRO('{A['ro']}').operations[0].parts[0].status='Staged'; }})()"); await pg.evaluate(CHECK)
        ok(len(await pg.evaluate(MSGS + f"('partsIn', '{A['ro']}')")) == 4, "out and in again → sent again (re-armed)")
        # ---------- 2. waiting on the customer 4 h → the advisor ----------
        B = R9[1]; hrs = lambda h: f"new Date(Date.now() - {h} * 3600000).toISOString()"
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{B['ro']}'); r.advisor='{P['sw']}'; r.status={{ status: 'Waiting – Customer', setAt: {hrs(3)} }}; }})()")
        await pg.evaluate(CHECK)
        ok(len(await pg.evaluate(MSGS + f"('waitCust', '{B['ro']}')")) == 0, "3 h waiting: nothing yet")
        await pg.evaluate(f"(()=>{{ __tg.getRO('{B['ro']}').status.setAt = {hrs(5)}; }})()"); await pg.evaluate(CHECK)
        m2 = await pg.evaluate(MSGS + f"('waitCust', '{B['ro']}')")
        ok([x["to"] for x in m2] == [P["sw"]] and "5 h" in m2[0]["t"], f"5 h waiting → the advisor ({m2})")
        await pg.evaluate(f"(()=>{{ __tg.getRO('{B['ro']}').contacts=[{{ at: {hrs(1)}, how: 'Call' }}]; }})()"); await pg.evaluate(CHECK)
        await pg.evaluate(f"(()=>{{ __tg.getRO('{B['ro']}').contacts=[]; }})()"); await pg.evaluate(CHECK)
        ok(len(await pg.evaluate(MSGS + f"('waitCust', '{B['ro']}')")) == 2, "a call clears it; 4 h on with no update → sent again")
        await pg.evaluate(CHECK)
        ok(len(await pg.evaluate(MSGS + f"('waitCust', '{B['ro']}')")) == 2, "and not a third time")
        # ---------- 3. ready to release → the advisor and the foreman ----------
        C = R9[2]
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{C['ro']}'); r.advisor='{P['sw']}'; r.status={{ status: 'Complete – Road test', setAt: new Date().toISOString() }}; }})()")
        await pg.evaluate(CHECK); await pg.evaluate(CHECK)
        m3 = await pg.evaluate(MSGS + f"('ready', '{C['ro']}')")
        ok(sorted(x["to"] for x in m3) == sorted([P["sw"], P["fm"]]) and all("ready to release" in x["t"] for x in m3), f"ready to release → the advisor and the foreman, once ({[x['to'] for x in m3]})")
        # ---------- 5. past the quote while the clock runs → the foreman ----------
        D = R9[3]
        mk = lambda mins: f"""(()=>{{ const S=__tg.STATE(); S.punches=S.punches.filter(p=>p.opId!=='{D['op']}'); S.punches.forEach(p=>{{ if(!p.stop){{ p.stop=new Date().toISOString(); p.stopReason='Switched job'; }} }});
          const o=__tg.getRO('{D['ro']}').operations[0]; o.quoted=1; o.burnt=0; o.parts=[];
          S.punches.push({{ id: __tg.uid('pn'), roId: '{D['ro']}', opId: '{D['op']}', start: new Date(Date.now() - {mins} * 60000).toISOString(), stop: null, startReason: 'Repairing', stopReason: null, notes: '', by: '{X['Bn']}' }}); }})()"""
        await pg.evaluate(mk(50)); await pg.evaluate(CHECK)
        ok(len(await pg.evaluate(MSGS + f"('overQuote', '{D['ro']}')")) == 0, "50 min of a 1 h quote: nothing")
        await pg.evaluate(mk(70)); await pg.evaluate(CHECK); await pg.evaluate(CHECK)
        m5 = await pg.evaluate(MSGS + f"('overQuote', '{D['ro']}')")
        ok([x["to"] for x in m5] == [P["fm"]] and "past its quote" in m5[0]["t"], f"70 min of a 1 h quote, clock running → the foreman, once ({m5})")
        await pg.evaluate("(()=>{ __tg.v162Cfg().thr.overPct = 150; })()"); await pg.evaluate(CHECK)
        await pg.evaluate(mk(80)); await pg.evaluate(CHECK)
        ok(len(await pg.evaluate(MSGS + f"('overQuote', '{D['ro']}')")) == 1, "at 150 %: 80 min of a 1 h quote is not enough")
        await pg.evaluate(mk(100)); await pg.evaluate(CHECK)
        ok(len(await pg.evaluate(MSGS + f"('overQuote', '{D['ro']}')")) == 2, "at 150 %: 100 min → sent (the threshold re-armed it)")
        await pg.evaluate(f"(()=>{{ const S=__tg.STATE(); S.punches.forEach(p=>{{ if(!p.stop){{ p.stop=new Date().toISOString(); p.stopReason='Switched job'; }} }}); __tg.v162Cfg().thr.overPct = 100; }})()")
        # ---------- 6. warranty claims → the warranty admin and the advisor ----------
        E = R9[4]; days = lambda d: f"new Date(Date.now() - {d} * 86400000).toISOString()"
        await pg.evaluate(f"""(()=>{{ const r=__tg.getRO('{E['ro']}'), o=r.operations[0]; r.advisor='{P['sw']}'; o.jobType='WARR';
          o.claim={{ status: 'submitted', claimNo: 'W-7731', history: [{{ to: 'submitted', at: {days(10)} }}] }}; }})()""")
        await pg.evaluate(CHECK)
        ok(len(await pg.evaluate(MSGS + f"('warranty', '{E['ro']}')")) == 0, "a claim 10 days without an answer (the Warranty page says 14): nothing yet")
        await pg.evaluate(f"(()=>{{ __tg.getRO('{E['ro']}').operations[0].claim.history[0].at = {days(15)}; }})()"); await pg.evaluate(CHECK); await pg.evaluate(CHECK)
        m6 = await pg.evaluate(MSGS + f"('warranty', '{E['ro']}')")
        want6 = sorted([x for x in [P["wa"], P["sw"]] if x])
        ok(sorted(x["to"] for x in m6) == want6 and "no answer for 15 days" in m6[0]["t"], f"15 days → the warranty admin and the advisor, once ({[x['to'] for x in m6]} · {m6[0]['t'] if m6 else ''})")
        await pg.evaluate(f"(()=>{{ const c=__tg.getRO('{E['ro']}').operations[0].claim; c.status='approved'; c.history.push({{ to: 'approved', at: {days(3)} }}); }})()"); await pg.evaluate(CHECK)
        ok(len(await pg.evaluate(MSGS + f"('warranty', '{E['ro']}')")) == len(want6), "approved 3 days ago (paid within 10): nothing new")
        await pg.evaluate(f"(()=>{{ __tg.getRO('{E['ro']}').operations[0].claim.history[1].at = {days(11)}; }})()"); await pg.evaluate(CHECK)
        m6b = await pg.evaluate(MSGS + f"('warranty', '{E['ro']}')")
        ok(len(m6b) == 2 * len(want6) and any("not paid" in x["t"] for x in m6b), f"approved 11 days and not paid → chased again ({len(m6b)})")
        # ---------- switched off: nothing ----------
        await pg.evaluate("(()=>{ const b=__tg.v162Cfg().builtin; b.partsIn=false; b.waitCust=false; })()")
        await pg.evaluate(f"(()=>{{ __tg.getRO('{A['ro']}').operations[0].parts[0].status='Ordered'; }})()"); await pg.evaluate(CHECK)
        await pg.evaluate(f"(()=>{{ __tg.getRO('{A['ro']}').operations[0].parts[0].status='Received'; const r=__tg.getRO('{B['ro']}'); r.status={{ status: 'Hold Tech', setAt: new Date().toISOString() }}; }})()"); await pg.evaluate(CHECK)
        await pg.evaluate(f"(()=>{{ __tg.getRO('{B['ro']}').status={{ status: 'Waiting – Customer', setAt: {hrs(6)} }}; }})()"); await pg.evaluate(CHECK)
        ok(len(await pg.evaluate(MSGS + f"('partsIn', '{A['ro']}')")) == 4 and len(await pg.evaluate(MSGS + f"('waitCust', '{B['ro']}')")) == 2, "switched off: a part coming in and 6 h waiting send nothing")
        await pg.evaluate("(()=>{ const b=__tg.v162Cfg().builtin; b.partsIn=true; b.waitCust=true; })()"); await pg.evaluate(CHECK)
        ok(len(await pg.evaluate(MSGS + f"('partsIn', '{A['ro']}')")) == 4 and len(await pg.evaluate(MSGS + f"('waitCust', '{B['ro']}')")) == 2, "switched back on: what passed while it was off isn't sent late")
        # ---------- 4. Start on an operation whose part isn't in: ask first ----------
        await pg.evaluate(SIGN(X["A"])); await pg.wait_for_timeout(300)
        F = R9[5]; G = R9[6]
        for Q in (F, G):
            await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(); S.punches.forEach(p=>{{ if(!p.stop){{ p.stop=new Date().toISOString(); p.stopReason='Switched job'; }} }});
              const r=__tg.getRO('{Q['ro']}'), o=r.operations[0]; o.jobType='DIAG'; o.jobStatus={{ status: 'Hold Tech', setAt: new Date().toISOString(), hand: true }}; r.assignedTech='{X['An']}';
              o.parts=[{{ id: __tg.uid('pt'), description: 'NOx sensor', partNumber: '22827993', qty: 1, status: 'Not Ordered' }}]; __tg.render(); }})()""")
        HOLD = lambda q: f"(()=>{{ const o=__tg.getRO('{q['ro']}').operations[0]; o.jobStatus={{ status: 'Hold Tech', setAt: new Date().toISOString(), hand: true }}; __tg.render(); }})()"   # the op left Waiting – Parts (the lock's own rule)
        RUN = lambda q: f"__tg.STATE().punches.some(p=>!p.stop && p.opId==='{q['op']}')"
        ASK = "(()=>{ const a=document.querySelector('.pgask'); return a ? { head: a.querySelector('.roreo-h b').textContent, btn: [...a.querySelectorAll('[data-ask]')].map(x=>x.textContent) } : null; })()"
        await pg.evaluate(f"__tg.doStartPunch('{F['ro']}', '{F['op']}', 'Diagnosing')"); await pg.wait_for_timeout(300)
        q1 = await pg.evaluate(ASK)
        ok(q1 and re.fullmatch(r"Op \d+’s NOx sensor isn’t in yet \(Not ordered yet\)\. Start anyway\?", q1["head"]) and q1["btn"] == ["Start anyway", "Cancel"], f"doStartPunch asks: {q1}")
        await pg.screenshot(path=os.path.join(OUT, "a1_ask.png"))
        ok(not await pg.evaluate(RUN(F)), "nothing starts while it asks")
        await pg.evaluate("document.querySelector('.pgask [data-ask=\"no\"]').click()"); await pg.wait_for_timeout(200)
        ok(not await pg.evaluate(RUN(F)) and not await pg.evaluate(ASK), "Cancel: the clock stays off")
        await pg.evaluate(f"__tg.doStartPunch('{F['ro']}', '{F['op']}', 'Diagnosing')"); await pg.wait_for_timeout(200)
        await pg.evaluate("document.querySelector('.pgask [data-ask=\"go\"]').click()"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(RUN(F)), "Start anyway: the clock runs")
        await pg.evaluate("__tg.doStopPunch('Switched job')"); await pg.wait_for_timeout(200); await pg.evaluate(HOLD(F))
        await pg.evaluate(f"__tg.doStartPunch('{F['ro']}', '{F['op']}', 'Diagnosing')"); await pg.wait_for_timeout(300)
        ok(not await pg.evaluate(ASK) and await pg.evaluate(RUN(F)), "the next start on that operation doesn't ask again")
        await pg.evaluate("__tg.doStopPunch('Switched job')"); await pg.wait_for_timeout(200)
        # the 14.x lock still speaks: repairing with a part on order is refused, not asked
        await pg.evaluate(f"(()=>{{ const o=__tg.getRO('{F['ro']}').operations[0]; o.parts[0].status='Ordered'; o.parts[0].eta=new Date(Date.now()+3*86400000).toISOString().slice(0,10); }})()")
        await pg.evaluate(f"__tg.doStartPunch('{F['ro']}', '{F['op']}', 'Repairing')"); await pg.wait_for_timeout(300)
        ok(not await pg.evaluate(ASK) and not await pg.evaluate(RUN(F)), "the part lock still refuses a repair, without a question")
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.modal=null; U.view='console'; __tg.render(); })()"); await pg.wait_for_timeout(300)
        # the RO page's clock card
        card = await ro_card(pg, G["ro"], G["op"])
        ok(card is not None, f"the RO page shows the operation's clock card ({card and card['cls']})")
        await pg.evaluate(J(f"const b=R.querySelector('.ock[data-op=\"{G['op']}\"] [data-ock=go]'); b && b.click()")); await pg.wait_for_timeout(400)
        q2 = await pg.evaluate(ASK)
        ok(q2 and "NOx sensor isn’t in yet (Not ordered yet). Start anyway?" in q2["head"] and not await pg.evaluate(RUN(G)), f"the RO page's Start asks too: {q2}")
        await pg.screenshot(path=os.path.join(OUT, "a2_ask_ro_page.png"))
        await pg.evaluate("document.querySelector('.pgask [data-ask=\"go\"]').click()"); await pg.wait_for_timeout(600)
        ok(await pg.evaluate(RUN(G)), "Start anyway on the RO page: the clock runs")
        await pg.evaluate("__tg.doStopPunch('Switched job')"); await pg.wait_for_timeout(300); await pg.evaluate(HOLD(G)); await pg.wait_for_timeout(500)
        await pg.evaluate(J(f"const b=R.querySelector('.ock[data-op=\"{G['op']}\"] [data-ock=go]'); b && b.click()")); await pg.wait_for_timeout(400)
        ok(not await pg.evaluate(ASK) and await pg.evaluate(RUN(G)), "and doesn't ask again there")
        await pg.evaluate("__tg.doStopPunch('Switched job')"); await pg.wait_for_timeout(300)
        # switched off: no question
        await pg.evaluate(f"(()=>{{ __tg.v162Cfg().builtin.askStart=false; const o=__tg.getRO('{F['ro']}').operations[0]; o.parts.push({{ id: __tg.uid('pt'), description: 'Gasket', qty: 1, status: 'Not Ordered' }}); o.parts[0].status='Received'; }})()"); await pg.evaluate(HOLD(F))
        await pg.evaluate(f"__tg.doStartPunch('{F['ro']}', '{F['op']}', 'Diagnosing')"); await pg.wait_for_timeout(300)
        ok(not await pg.evaluate(ASK) and await pg.evaluate(RUN(F)), "switched off: Start doesn't ask")
        await pg.evaluate("__tg.doStopPunch('Switched job')"); await pg.evaluate("(()=>{ __tg.v162Cfg().builtin.askStart=true; })()"); await pg.wait_for_timeout(300)
        # ---------- the log: Status sync, Parts → status, a custom rule ----------
        H1 = R9[7]; I1 = R9[8]
        await pg.evaluate(f"""(()=>{{ const r=__tg.getRO('{H1['ro']}'), o=r.operations[0]; o.parts=[]; o.jobType='OP'; o.jobStatus={{ status: 'Hold Tech', setAt: new Date().toISOString(), hand: true }}; r.status={{ status: 'Hold Tech', setAt: new Date().toISOString() }}; r.assignedTech='{X['An']}';
          const c=__tg.autoCfg(); c.rules=[{{ id: 'rlT', name: 'Note on stop', when: 'punch.stop', conds: [], acts: [{{ a: 'note', v: 'The rule ran.' }}], mode: 'auto', on: true }}]; __tg.scheduleSave(true); }})()""")
        await pg.wait_for_timeout(600)
        await pg.evaluate(f"__tg.doStartPunch('{H1['ro']}', '{H1['op']}', 'Repairing')"); await pg.wait_for_timeout(700)
        await pg.evaluate("__tg.autoFlush()"); await pg.wait_for_timeout(300)
        st1 = await pg.evaluate(f"__tg.roStatus(__tg.getRO('{H1['ro']}')).status")
        e_st = await pg.evaluate(f"(()=>{{ const L=(__tg.STATE().autoLog||[]).filter(e=>e.rk==='status' && e.roId==='{H1['ro']}'); return L[L.length-1] || null; }})()")
        ok(st1 == "Working" and e_st and e_st["undo"]["k"] == "status" and "Working" in e_st["what"], f"Status sync's change is logged ({st1}, {e_st and e_st['what']})")
        await pg.evaluate("__tg.doStopPunch('Switched job')"); await pg.wait_for_timeout(700); await pg.evaluate("__tg.autoFlush()"); await pg.wait_for_timeout(300)
        e_rl = await pg.evaluate(f"(()=>{{ const L=(__tg.STATE().autoLog||[]).filter(e=>e.rk==='r.rlT'); return {{ e: L[L.length-1] || null, note: __tg.getRO('{H1['ro']}').techNote || '' }}; }})()")
        ok(e_rl["e"] and e_rl["e"]["rule"] == "Note on stop" and e_rl["e"]["undo"]["k"] == "field" and "The rule ran." in e_rl["note"], f"a custom rule's change is logged ({e_rl['e'] and e_rl['e']['what']})")
        await pg.evaluate("(()=>{ const c=__tg.autoCfg(); c.rules=[]; c.mode='auto'; })()")
        await pg.evaluate(f"""(()=>{{ const o=__tg.getRO('{I1['ro']}').operations[0]; o.jobType='OP'; o.jobStatus={{ status: 'Hold Tech', setAt: new Date().toISOString(), hand: true }}; o.parts=[{{ id: __tg.uid('pt'), description: 'Hose', qty: 1, status: 'Not Ordered' }}]; __tg.scheduleSave(true); }})()""")
        await pg.wait_for_timeout(500)
        await pg.evaluate(f"(()=>{{ __tg.getRO('{I1['ro']}').operations[0].parts[0].status='Ordered'; __tg.scheduleSave(true); }})()"); await pg.wait_for_timeout(700); await pg.evaluate("__tg.autoFlush()")
        e_pt = await pg.evaluate(f"(()=>{{ const L=(__tg.STATE().autoLog||[]).filter(e=>e.rk==='parts' && e.roId==='{I1['ro']}'); return {{ e: L[L.length-1] || null, js: __tg.getRO('{I1['ro']}').operations[0].jobStatus.status }}; }})()")
        ok(e_pt["e"] and e_pt["e"]["undo"]["f"] == "jobStatus" and e_pt["js"] == "Waiting – Parts", f"Parts → status (Auto) is logged ({e_pt})")
        await pg.evaluate("(()=>{ __tg.autoCfg().mode='suggest'; })()")
        kinds = await pg.evaluate("[...new Set((__tg.STATE().autoLog||[]).map(e=>e.rk))].sort()")
        ok(all(k in kinds for k in ["askStart", "overQuote", "partsIn", "parts", "r.rlT", "ready", "status", "waitCust", "warranty"]), f"every kind of automated action is in the log ({kinds})")
        shape = await pg.evaluate("(()=>{ const e=(__tg.STATE().autoLog||[])[0]; return e ? Object.keys(e).sort() : []; })()")
        ok(all(k in shape for k in ["id", "at", "rule", "what", "roId", "opId", "undo"]), f"each line has id, at, rule, what, roId, opId, undo ({shape})")
        # ---------- What ran, on the Automations panel (the Admin: settings and automations) ----------
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); __tg.render(); })()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const S=__tg.STATE(); S.autoLog.unshift({ id: 'al_old', at: new Date(Date.now()-2*86400000).toISOString(), rule: 'Status sync', rk: 'status', what: 'RO 1 → Working (was Hold Tech)', roId: '', opId: '', undo: null }); const U=__tg.UI(); U.view='console'; U.modal={ type: 'automations', edit: null }; __tg.render(); })()")
        await pg.wait_for_timeout(500)
        pn = await pg.evaluate("""(()=>{ const a=document.querySelector('.am'); if(!a) return null; const sw=[...a.querySelectorAll('[data-action="am-builtin"]')];
          return { sw: sw.map(x=>x.dataset.k), on: sw.every(x=>x.getAttribute('aria-checked')==='true'), thr: Object.fromEntries([...a.querySelectorAll('[data-v162-thr]')].map(x=>[x.dataset.v162Thr, x.value])),
            log: !!a.querySelector('.v162-log'), groups: [...a.querySelectorAll('.v162-lg')].map(x=>x.firstChild.textContent), rows: a.querySelectorAll('.v162-le').length,
            times: [...a.querySelectorAll('.v162-le time')].map(x=>x.getAttribute('datetime')), chips: [...a.querySelectorAll('.v162-lf button')].map(x=>x.firstChild.textContent) }; })()""")
        ok(pn and pn["sw"] == ["status", "parts", "partsIn", "waitCust", "ready", "askStart", "overQuote", "warranty"] and pn["on"], f"the panel lists the eight built-ins, all on ({pn and pn['sw']})")
        ok(pn and pn["thr"] == {"waitH": "4", "overPct": "100", "wa.claim": "14", "wa.paid": "10"}, f"with their thresholds — warranty days from the Warranty page ({pn and pn['thr']})")
        ok(pn and pn["log"] and pn["groups"] == ["Today", "Earlier"] and pn["times"] == sorted(pn["times"], reverse=True), f"What ran: today, then earlier, newest first ({pn and pn['groups']}, {pn and pn['rows']} rows)")
        await pg.screenshot(path=os.path.join(OUT, "a3_panel.png"), full_page=True)
        await pg.evaluate("(()=>{ const l=document.getElementById('v162-log'); l && l.scrollIntoView({ block: 'start' }); })()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "a3b_what_ran.png"))
        await pg.evaluate("(()=>{ const l=document.querySelector('[data-v162-thr=\"wa.claim\"]'); l && l.scrollIntoView({ block: 'center' }); })()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "a3c_thresholds.png"))
        lab = "Parts in → tell the tech"
        ok(pn and lab in pn["chips"] and "All" in pn["chips"], f"a filter by rule ({pn and pn['chips']})")
        await pg.evaluate(f"(()=>{{ const b=[...document.querySelectorAll('.v162-lf button')].find(x=>x.dataset.f==='{lab}'); b && b.click(); }})()"); await pg.wait_for_timeout(300)
        fl = await pg.evaluate("[...document.querySelectorAll('.v162-le')].map(x=>x.dataset.rk)")
        ok(fl and set(fl) == {"partsIn"}, f"filtered to one rule ({set(fl)})")
        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('.v162-lf button')].find(x=>x.dataset.f==='all'); b && b.click(); })()"); await pg.wait_for_timeout(300)
        # Undo a message: withdrawn from the Inbox
        e_msg = await pg.evaluate(f"(()=>{{ const L=__tg.STATE().autoLog.filter(e=>e.rk==='ready' && e.roId==='{C['ro']}'); return L[L.length-1]; }})()")
        await pg.evaluate(f"document.querySelector('.v162-le[data-id=\"{e_msg['id']}\"] [data-action=\"am-log-undo\"]').click()"); await pg.wait_for_timeout(400)
        left = await pg.evaluate(f"(()=>{{ const ids={json.dumps(e_msg['undo']['ids'])}; return __tg.IB.store().items.filter(x=>ids.includes(x.id)).length; }})()")
        row = await pg.evaluate(f"(()=>{{ const r=document.querySelector('.v162-le[data-id=\"{e_msg['id']}\"]'); return r ? {{ cls: r.className, dis: !!r.querySelector('button[disabled]'), why: (r.querySelector('.v162-ug small')||{{}}).textContent || '' }} : null; }})()")
        ok(left == 0 and row and "is-undone" in row["cls"] and row["dis"] and row["why"].startswith("Undone"), f"Undo on a message withdraws it from the Inbox ({left} left, {row})")
        # Undo a status: back to the previous one
        prev = json.loads(e_st["undo"]["prev"])["status"]
        e_st2 = await pg.evaluate(f"(()=>{{ const L=__tg.STATE().autoLog.filter(e=>e.rk==='status' && e.roId==='{H1['ro']}'); return L.map(e=>[e.id, e.what, __tg.v162UndoOk(e)]); }})()")
        okable = [x for x in e_st2 if x[2]["ok"]]
        ok(len(okable) >= 1, f"the latest status change can be undone ({[(x[1], x[2]) for x in e_st2]})")
        if okable:
            await pg.evaluate(f"__tg.v162Undo('{okable[-1][0]}')"); await pg.wait_for_timeout(300)
            want = json.loads((await pg.evaluate(f"__tg.STATE().autoLog.find(e=>e.id==='{okable[-1][0]}')"))["undo"]["prev"])["status"]
            now_st = await pg.evaluate(f"__tg.roStatus(__tg.getRO('{H1['ro']}')).status")
            ok(now_st == want, f"Undo on a status puts the previous status back ({now_st} == {want})")
        # Undo a field: the operation's status before Parts → status
        await pg.evaluate(f"__tg.v162Undo('{e_pt['e']['id']}')"); await pg.wait_for_timeout(300)
        js2 = await pg.evaluate(f"__tg.getRO('{I1['ro']}').operations[0].jobStatus.status")
        ok(js2 == "Hold Tech", f"Undo on a field gives it its old value ({js2})")
        # the custom rule's note: changed again since → greyed with the reason
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{H1['ro']}'); r.techNote = (r.techNote||'') + '\\nTyped by hand.'; }})()")
        u3 = await pg.evaluate(f"__tg.v162UndoOk(__tg.STATE().autoLog.find(e=>e.id==='{e_rl['e']['id']}'))")
        ok(not u3["ok"] and "Changed again since" in u3["why"], f"a later change greys Undo, with the reason ({u3})")
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.modal={ type: 'automations', edit: null }; __tg.render(); })()"); await pg.wait_for_timeout(300)
        gr = await pg.evaluate(f"(()=>{{ const r=document.querySelector('.v162-le[data-id=\"{e_rl['e']['id']}\"]'); return r ? {{ dis: !!r.querySelector('button[disabled]'), why: (r.querySelector('.v162-ug small')||{{}}).textContent || '', title: (r.querySelector('button[disabled]')||{{}}).title || '' }} : null; }})()")
        ok(gr and gr["dis"] and "Changed again since" in gr["why"] and gr["title"] == gr["why"], f"…and the panel shows it greyed with the reason ({gr})")
        # a status changed by hand since → greyed
        e_ss = await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{D['ro']}'); const L=__tg.STATE().autoLog.filter(e=>e.rk==='status' && e.roId==='{D['ro']}'); r.status={{ status: 'Waiting – Foreman', setAt: new Date().toISOString() }}; return L.length ? __tg.v162UndoOk(L[L.length-1]) : null; }})()")
        ok(e_ss and not e_ss["ok"] and "Waiting – Foreman now" in e_ss["why"], f"a status changed since: Undo greyed ({e_ss})")
        await pg.screenshot(path=os.path.join(OUT, "a4_panel_after_undo.png"), full_page=True)
        await pg.keyboard.press("Escape"); await pg.evaluate("(()=>{ __tg.UI().modal=null; __tg.render(); })()")
        # kept to about 500 lines and 30 days
        await pg.evaluate("(()=>{ const S=__tg.STATE(); for(let i=0;i<40;i++) S.autoLog.unshift({ id: 'old'+i, at: new Date(Date.now()-(31+i)*86400000).toISOString(), rule: 'x', rk: 'x', what: 'old', undo: null }); for(let i=0;i<520;i++) S.autoLog.push({ id: 'n'+i, at: new Date().toISOString(), rule: 'x', rk: 'x', what: 'new', undo: null }); __tg.v162Log({ rk: 'status', what: 'last' }); })()")
        kp = await pg.evaluate("(()=>{ const L=__tg.STATE().autoLog; return { n: L.length, old: L.filter(e=>+new Date(e.at) < Date.now()-30*86400000).length, last: L[L.length-1].what }; })()")
        ok(kp["n"] == 500 and kp["old"] == 0 and kp["last"] == "last", f"the log keeps 500 lines and 30 days ({kp})")
        # ---------- the page for Settings › Automations ----------
        mp = await pg.evaluate("""(()=>{ const d=document.createElement('div'); d.id='v162host'; document.body.appendChild(d); __tg.autoPageMount(d);
          const b=d.querySelector('[data-action="am-builtin"][data-k="ready"]'); const was=__tg.v162Cfg().builtin.ready; b.click();
          const now=__tg.v162Cfg().builtin.ready; const f=d.querySelector('.v162-lf button[data-f="all"]');
          return { rows: d.querySelectorAll('.am-rule').length, log: !!d.querySelector('.v162-log'), toggled: was !== now, modal: __tg.UI().modal }; })()""")
        ok(mp["rows"] >= 9 and mp["log"] and mp["toggled"] and mp["modal"] is None, f"autoPageMount(el) shows the page and its switches work without the panel ({mp})")
        await pg.evaluate("(()=>{ __tg.v162Cfg().builtin.ready=true; document.getElementById('v162host').remove(); })()")
        ok(await pg.evaluate("typeof __tg.autoPageHtml() === 'string' && __tg.autoPageHtml().includes('What ran')"), "autoPageHtml() returns the page")
        # saved with the shop: the two new kinds have a home
        ok(await pg.evaluate("Array.isArray(__tg.STATE().autoLog) && typeof __tg.STATE().autoFired === 'object'"), "STATE.autoLog and STATE.autoFired are kept")
        bad = [e for e in errs if "favicon" not in e]
        ok(not bad, f"no page errors ({bad[:3]})")
        await b.close()
    print("\n%d failed" % len(FAILS) if FAILS else "\nall passed")
asyncio.run(main())
