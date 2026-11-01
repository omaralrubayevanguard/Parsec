# Parsec 16.2 (B) — a custom rule reads as a sentence. Settings → Automations → Custom rules:
# build a rule with the chips (mouse and keyboard), the sentence reads as English, + and / + then add a condition / an action and ✕
# takes them off, a rule saved before 16.2 shows as a sentence and still runs, Test run lists what it would have done on seeded
# history without changing anything (canonical STATE before = after), a rule that wouldn't have run says why, Save waits for a
# whole sentence, a new rule starts off.
import asyncio, os, sys, json, re
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_b.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots162b"); os.makedirs(OUT, exist_ok=True)
SENT = "(()=>{ const s=document.querySelector('.v162b-sent'); return s ? s.textContent.replace(/\\s+/g,' ').trim() : null; })()"
SAVE = "(()=>{ const b=document.querySelector('.v162b [data-action=\"am-save\"]'); return b ? b.disabled : null; })()"
EDIT = "(()=>{ const m=__tg.UI().modal; return m && m.edit ? JSON.parse(JSON.stringify(m.edit)) : null; })()"
CANON = "__tg.pdCanon(__tg.STATE())"
async def click(pg, sel, wait=180):
    await pg.evaluate(f"document.querySelector({json.dumps(sel)}).click()"); await pg.wait_for_timeout(wait)
async def pick(pg, slot, label):   # open a chip, pick the option that reads `label`
    await click(pg, f'.v162b-chip[data-slot="{slot}"]')
    got = await pg.evaluate(f"""(()=>{{ const o=[...document.querySelectorAll('.v162b-menu .v162b-opt')].find(x=>x.textContent.trim()==={json.dumps(label)}); if(!o) return [...document.querySelectorAll('.v162b-menu .v162b-opt')].map(x=>x.textContent.trim()); o.click(); return true; }})()""")
    await pg.wait_for_timeout(180); return got
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        X = await pg.evaluate(PREP); await pg.wait_for_timeout(300)
        # seed: a quiet start (no rules), then two days ago on X's RO — the RO went to Waiting – Parts, op A's clock stopped as Complete
        seed = await pg.evaluate(f"""(()=>{{ const S=__tg.STATE(), now=Date.now(), iso=ms=>new Date(ms).toISOString();
          __tg.autoFlush(); S.automations.rules=[];
          const ro=__tg.getRO('{X["ro"]}'), a=ro.operations[0], b2=ro.operations[1], t0=now-2*864e5;
          ro.history=(ro.history||[]).filter(h=>!/^Punch|status$|^RO status|^Operation status/.test(h.t||''));
          S.punches=S.punches.filter(p=>+new Date(p.stop||p.start) < now-8*864e5);   /* only the seeded punches in the last 7 days */
          ro.history.push({{at: iso(t0), k:'status', t:'RO status', o:'Working', n:'Waiting – Parts', op:'', by:'You'}});
          ro.history.push({{at: iso(t0+36e5), k:'status', t:'RO status', o:'Waiting – Parts', n:'Working', op:'', by:'You'}});
          S.punches.push({{id:'pt162a', roId: ro.id, opId: a.id, by:'Test', start: iso(t0-18e5), stop: iso(t0+18e5), startReason:'Repairing', stopReason:'Complete', notes:''}});
          S.punches.push({{id:'pt162b', roId: ro.id, opId: b2.id, by:'Test', start: iso(t0+40e5), stop: iso(t0+50e5), startReason:'Repairing', stopReason:'Complete', notes:''}});
          S.punches.push({{id:'pt162c', roId: ro.id, opId: a.id, by:'Test', start: iso(now-3*864e5), stop: iso(now-3*864e5+9e5), startReason:'Diagnosing', stopReason:'Waiting – Parts', notes:''}});
          __tg.autoFlush(); __tg.scheduleSave(true); return {{ num: ro.roNumber, t0: t0 }}; }})()""")
        await pg.evaluate("document.querySelector('[data-action=\"open-automations\"]') ? 0 : 1")
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.modal={type:'automations', edit:null}; __tg.render(); })()"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("!!document.querySelector('.am [data-action=\"am-new\"]')"), "the Automations panel offers + Rule")
        # 1. a new rule: blank, off, the event menu open, Save disabled
        await click(pg, '.am [data-action="am-new"]', 300)
        e = await pg.evaluate(EDIT)
        ok(e and e["when"] == "" and e["on"] is False and e["conds"] == [] and e["acts"] == [{"a": "", "v": ""}], f"a new rule starts blank and off ({e})")
        ok(await pg.evaluate("!!document.querySelector('.v162b-menu') && document.activeElement && document.activeElement.classList.contains('v162b-opt')"), "the event menu opens with the focus in it")
        ok(await pg.evaluate(SAVE) is True, "Save is disabled while the sentence is blank")
        need = await pg.evaluate("document.querySelector('.v162b-need').textContent")
        ok(need == "To save, pick an event.", f"it says what's missing: {need}")
        ok(await pg.evaluate("(()=>{ const s=document.querySelector('.v162b-sent'); return [...s.querySelectorAll('.v162b-chip')].length===2 && /^When/.test(s.textContent.trim()); })()"), "the blank sentence reads When [pick an event] then [pick an action]")
        # 2. by keyboard: the event menu — End, Home, type a letter, arrows, Enter
        await pg.keyboard.press("Home"); await pg.wait_for_timeout(60)
        first = await pg.evaluate("document.activeElement.textContent")
        ok(first == "an operation’s clock starts", f"Home goes to the first event ({first})")
        await pg.keyboard.press("ArrowDown"); await pg.wait_for_timeout(60)
        ok(await pg.evaluate("document.activeElement.textContent") == "an operation’s clock stops", "ArrowDown moves to the next one")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(250)
        e = await pg.evaluate(EDIT)
        ok(e["when"] == "punch.stop" and not await pg.evaluate("!!document.querySelector('.v162b-menu')"), f"Enter picks it and closes the menu ({e['when']})")
        ok(await pg.evaluate("document.activeElement && document.activeElement.dataset.slot") == "when", "the focus goes back to the chip")
        # the qualifier chip: Tab to it, ArrowDown opens, type C, Enter
        await pg.keyboard.press("Tab"); await pg.wait_for_timeout(60)
        ok(await pg.evaluate("document.activeElement.dataset.slot") == "q", "Tab reaches the next chip (for any reason)")
        await pg.keyboard.press("ArrowDown"); await pg.wait_for_timeout(250)
        ok(await pg.evaluate("document.activeElement.textContent") == "Any reason", "ArrowDown on a chip opens its menu, Any reason first")
        await pg.keyboard.press("c"); await pg.wait_for_timeout(60)
        lab = await pg.evaluate("document.activeElement.textContent")
        while lab != "Complete":
            await pg.keyboard.press("c"); await pg.wait_for_timeout(40)
            nl = await pg.evaluate("document.activeElement.textContent")
            if nl == lab: break
            lab = nl
        ok(lab == "Complete", f"typing a letter jumps through the options starting with it ({lab})")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(250)
        e = await pg.evaluate(EDIT)
        ok(e["conds"] == [{"f": "stopReason", "op": "is", "v": "Complete"}], f"…picked: the rule's first condition is the stop reason ({e['conds']})")
        s = await pg.evaluate(SENT)
        ok(s.startswith("When an operation’s clock stops as Complete then"), f"it reads “stops as Complete”: {s}")
        # Escape closes a menu without closing the panel
        await click(pg, '.v162b-chip[data-slot="q"]', 250)
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(250)
        ok(await pg.evaluate("!!document.querySelector('.v162b') && !document.querySelector('.v162b-menu')"), "Escape closes the menu and leaves the builder open")
        # 3. by mouse: + and → the detail menu opens on its own; pick the RO is → its value menu opens; Waiting – Parts
        await click(pg, '.v162b [data-action="am-add-cond"]', 250)
        ok(await pg.evaluate("!!document.querySelector('.v162b-chip[data-slot=\"cf:1\"].open')"), "+ and adds a condition and opens its menu")
        ok(await pg.evaluate(SAVE) is True, "Save is disabled while the new condition is blank")
        await pg.evaluate("[...document.querySelectorAll('.v162b-menu .v162b-opt')].find(x=>x.textContent==='the RO is').click()"); await pg.wait_for_timeout(250)
        ok(await pg.evaluate("!!document.querySelector('.v162b-chip[data-slot=\"cv:1\"].open')"), "picking “the RO is” opens its value menu")
        await pg.evaluate("[...document.querySelectorAll('.v162b-menu .v162b-opt')].find(x=>x.textContent==='Waiting – Parts').click()"); await pg.wait_for_timeout(250)
        # then [pick an action] → set the RO status → Hold Tech
        r = await pick(pg, "aa:0", "set the RO status")
        ok(r is True, f"the action menu lists the old builder's actions ({r})")
        ok(await pg.evaluate("!!document.querySelector('.v162b-chip[data-slot=\"av:0\"].open')"), "…and its status menu opens")
        await pg.evaluate("[...document.querySelectorAll('.v162b-menu .v162b-opt')].find(x=>x.textContent==='Hold Tech').click()"); await pg.wait_for_timeout(250)
        s = await pg.evaluate(SENT)
        want = "When an operation’s clock stops as Complete and the RO is Waiting – Parts then set the RO status to Hold Tech"
        ok(s == want, f"the sentence reads: {s}")
        ok(await pg.evaluate("__tg.v162bText(__tg.UI().modal.edit)") == want, "…and the rule's own text says the same")
        ok(await pg.evaluate(SAVE) is False and await pg.evaluate("document.querySelector('.v162b-need').hidden"), "the sentence is whole — Save is on")
        e = await pg.evaluate(EDIT)
        ok(e["when"] == "punch.stop" and e["conds"] == [{"f": "stopReason", "op": "is", "v": "Complete"}, {"f": "roStatus", "op": "is", "v": "Waiting – Parts"}] and e["acts"] == [{"a": "roStatus", "v": "Hold Tech"}],
           f"underneath it is the same rule model ({e['conds']}, {e['acts']})")
        await pg.screenshot(path=os.path.join(OUT, "b1_sentence.png"))
        # 4. + then adds an action, ✕ takes it off; + and then ✕ takes a condition off
        await click(pg, '.v162b [data-action="am-add-act"]', 250)
        ok(await pg.evaluate("!!document.querySelector('.v162b-chip[data-slot=\"aa:1\"].open')") and await pg.evaluate(SAVE) is True, "+ then adds an action (its menu open, Save off until it's picked)")
        await pg.evaluate("[...document.querySelectorAll('.v162b-menu .v162b-opt')].find(x=>x.textContent==='add an RO note line').click()"); await pg.wait_for_timeout(250)
        ok(await pg.evaluate("document.activeElement && document.activeElement.dataset.am") == "av:1", "picking a note action puts the focus in its text box")
        ok(await pg.evaluate(SAVE) is True and "type the note" in await pg.evaluate("document.querySelector('.v162b-need').textContent"), "an empty note keeps Save off")
        await pg.keyboard.type("Parts in — back to {job}"); await pg.wait_for_timeout(150)
        ok(await pg.evaluate(SAVE) is False, "typing the note turns Save on (no redraw)")
        s2 = await pg.evaluate("__tg.v162bText(__tg.UI().modal.edit)")
        ok(s2 == want + " and add an RO note line saying “Parts in — back to {job}”", f"two actions read “… and add an RO note line saying …”: {s2}")
        await pg.screenshot(path=os.path.join(OUT, "b2_two_actions.png"))
        await click(pg, '.v162b [data-action="am-del-act"][data-i="1"]', 250)
        ok((await pg.evaluate(EDIT))["acts"] == [{"a": "roStatus", "v": "Hold Tech"}], "✕ takes the action off")
        ok(await pg.evaluate("document.querySelectorAll('.v162b [data-action=\"am-del-act\"]').length") == 0, "the last action has no ✕")
        await click(pg, '.v162b [data-action="am-add-cond"]', 250)
        await pg.evaluate("[...document.querySelectorAll('.v162b-menu .v162b-opt')].find(x=>x.textContent==='it’s after').click()"); await pg.wait_for_timeout(250)
        ok(await pg.evaluate(SENT) == want.replace(" then", " and it’s after then") and await pg.evaluate("document.querySelector('.v162b [data-am=\"cv:2\"]').value") == "12:00", "a time condition reads “and it’s after [12:00]”")
        await click(pg, '.v162b [data-action="am-del-cond"][data-i="2"]', 250)
        ok(await pg.evaluate(SENT) == want and len((await pg.evaluate(EDIT))["conds"]) == 2, "✕ takes the condition off")
        # Any reason takes the qualifier off, picking it again puts it back
        await pick(pg, "q", "Any reason")
        ok(await pg.evaluate(SENT) == "When an operation’s clock stops for any reason and the RO is Waiting – Parts then set the RO status to Hold Tech", "“Any reason” drops the stop-reason condition: " + await pg.evaluate(SENT))
        await pick(pg, "q", "Complete")
        e = await pg.evaluate(EDIT)
        ok(await pg.evaluate(SENT) == want and sorted(c["f"] for c in e["conds"]) == ["roStatus", "stopReason"], "…and picking Complete puts it back")
        # 5. Test run: on the seeded history, read only
        before = await pg.evaluate(CANON)
        await click(pg, '.v162b [data-action="am-test"]', 400)
        after = await pg.evaluate(CANON)
        ok(before == after, "Test run changes nothing (canonical STATE before = after)")
        res = await pg.evaluate("(()=>{ const r=document.querySelector('.v162b-res'); return r ? { cls: r.className, b: r.querySelector('b').textContent, li: [...r.querySelectorAll('li')].map(x=>x.textContent) } : null; })()")
        print("   ", res)
        rn = "RO-" + seed["num"] if not str(seed["num"]).upper().startswith("RO") else seed["num"]
        ok(res and "yes" in res["cls"] and res["b"] == "Would have run once" and len(res["li"]) == 1 and res["li"][0].startswith(rn) and res["li"][0].endswith("→ status Hold Tech"),
           f"Test run: would have run once — {res and res['li']}")
        ok(re.search(r"(Sun|Mon|Tue|Wed|Thu|Fri|Sat) \d\d:\d\d", res["li"][0] if res and res["li"] else ""), "…with the RO, the day and the time")
        ok(await pg.evaluate("!!document.querySelector('.v162b-res [data-action=\"am-test-on\"]')"), "an off rule's result offers Turn it on")
        await pg.screenshot(path=os.path.join(OUT, "b3_test_run.png"))
        # the events it rebuilt from the last 7 days
        ev = await pg.evaluate("(()=>{ const E=__tg.v162bEvents(7); const c={}; E.forEach(e=>c[e.type]=(c[e.type]||0)+1); return c; })()")
        ok(ev.get("punch.stop", 0) >= 3 and ev.get("ro.status", 0) >= 2, f"the last 7 days' events come from punches and RO history ({ev})")
        # 6. a rule that wouldn't have run says why — the closest miss first
        await pick(pg, "cv:1", "Hold Tech")
        ok(await pg.evaluate("!document.querySelector('.v162b-res')"), "changing the sentence clears the old result")
        before = await pg.evaluate(CANON)
        await click(pg, '.v162b [data-action="am-test"]', 400)
        ok(before == await pg.evaluate(CANON), "a test with no match changes nothing either")
        res = await pg.evaluate("(()=>{ const r=document.querySelector('.v162b-res'); return r ? { cls: r.className, text: r.textContent, li: [...r.querySelectorAll('li')].map(x=>x.textContent) } : null; })()")
        print("   ", res)
        ok(res and "no" in res["cls"] and res["text"].startswith("Wouldn’t have run in the last 7 days") and "here’s why" in res["text"], f"no match: Wouldn't have run in the last 7 days — here's why ({res and res['text'][:90]})")
        ok(res and res["li"] and "here’s why, closest first" in res["text"] and any(x.endswith("— the RO was Waiting – Parts, not Hold Tech") for x in res["li"][:2]) and "; " not in res["li"][0],
           f"…closest misses first (one condition off), each naming what failed ({res and res['li'][:2]})")
        ok(res and any("the stop reason was Waiting – Parts, not Complete" in x for x in res["li"]), "…and a punch that stopped for another reason says so")
        await pg.screenshot(path=os.path.join(OUT, "b4_no_match.png"))
        # nothing of that kind at all
        await pick(pg, "when", "a file is added")
        nfa = await pg.evaluate("__tg.v162bEvents(7).filter(e=>e.type==='file.add').length")
        await click(pg, '.v162b [data-action="am-test"]', 400)
        t = await pg.evaluate("document.querySelector('.v162b-res').textContent")
        ok(nfa > 0 or "nothing like “a file is added” happened" in t, f"nothing of that kind in 7 days says so: {t[:100]}")
        await pick(pg, "when", "an operation’s clock stops"); await pick(pg, "cv:1", "Waiting – Parts")
        # 7. Save: a new rule is saved off; Turn it on after a test
        await click(pg, '.v162b [data-action="am-save"]', 400)
        rules = await pg.evaluate("JSON.parse(JSON.stringify(__tg.STATE().automations.rules))")
        ok(len(rules) == 1 and rules[0]["on"] is False and rules[0]["when"] == "punch.stop", f"Save stores the rule, off ({[(x['when'], x['on']) for x in rules]})")
        row = await pg.evaluate("(()=>{ const r=document.querySelector('.am-rule.am-custom'); return r ? r.textContent.replace(/\\s+/g,' ').trim() : null; })()")
        ok(row and want in row, f"the list shows it as the sentence ({row})")
        ok(row and "not tested yet" not in row, "a tested rule doesn't say “not tested yet”")
        rid = rules[0]["id"]
        await click(pg, f'.am [data-action="am-edit"][data-id="{rid}"]', 300)
        ok(await pg.evaluate(SENT) == want, "Edit opens the same sentence")
        await click(pg, '.v162b [data-action="am-test"]', 400)
        await click(pg, '.v162b [data-action="am-test-on"]', 250)
        ok((await pg.evaluate(EDIT))["on"] is True and await pg.evaluate("document.querySelector('.v162b [data-action=\"am-on\"]').getAttribute('aria-checked')") == "true", "Turn it on switches the rule on in the builder")
        await click(pg, '.v162b [data-action="am-save"]', 400)
        r1 = (await pg.evaluate("JSON.parse(JSON.stringify(__tg.STATE().automations.rules))"))[0]
        ok(r1["on"] is True and r1.get("tested"), f"saved on, with when it was tested ({r1.get('on')}, {r1.get('tested')})")
        # 8. an old-style rule (saved before 16.2) shows as a sentence and still runs
        old = {"id": "rlold", "name": "Road test done", "on": True, "mode": "suggest", "when": "job.status",
               "conds": [{"f": "jobStatus", "op": "is", "v": "Complete – Road test"}, {"f": "customer", "op": "contains", "v": "a"}],
               "acts": [{"a": "note", "v": "Road test done on {job}"}, {"a": "roStatus", "v": "Complete – Road test"}]}
        await pg.evaluate(f"(()=>{{ const S=__tg.STATE(); S.automations.rules=[{json.dumps(old)}]; __tg.UI().modal={{type:'automations', edit:null}}; __tg.render(); }})()"); await pg.wait_for_timeout(400)
        row = await pg.evaluate("(()=>{ const r=document.querySelector('.am-rule.am-custom .am-sum'); return r ? r.textContent.replace(/\\s+/g,' ').trim() : null; })()")
        wo = "When an operation’s status changes to Complete – Road test and the customer’s name has “a” then add an RO note line saying “Road test done on {job}” and set the RO status to Complete – Road test"
        ok(row == wo, f"an old rule reads as a sentence: {row}")
        await click(pg, '.am [data-action="am-edit"][data-id="rlold"]', 300)
        ok(await pg.evaluate("__tg.v162bText(__tg.UI().modal.edit)") == wo and await pg.evaluate(SAVE) is False, "…opens as the same sentence, whole, nothing lost")
        await click(pg, '.v162b [data-action="am-save"]', 300)
        sv = (await pg.evaluate("JSON.parse(JSON.stringify(__tg.STATE().automations.rules))"))[0]
        ok({k: sv[k] for k in old} == old, f"saving it unchanged keeps the same rule ({sv})")
        # it still runs: put an operation of a customer with an 'a' in the name to Complete – Road test
        fired = await pg.evaluate("""(()=>{ const S=__tg.STATE(); __tg.autoFlush();
          const ro=S.ros.find(r=>!r.dateClosed && /a/i.test(r.customerName||'') && r.operations.length && r.id!=='shop'); if(!ro) return 'no ro';
          const op=ro.operations[0]; op.declined=false; op.jobStatus={status:'Complete – Road test', setAt:new Date().toISOString(), hand:true}; ro.suggest=[]; ro.sgSeen={};
          __tg.autoFlush(); return (ro.suggest||[]).filter(s=>s.rule==='Road test done').map(s=>s.text); })()""")
        ok(isinstance(fired, list) and len(fired) == 1 and "note: Road test done on" in fired[0], f"the old rule still runs and raises its suggestion ({fired})")
        # 9. the log hook: v162Log hears a custom rule that fired, when it's there
        heard = await pg.evaluate("""(()=>{ const S=__tg.STATE(); window.__v162got=[]; window.v162Log=function(x){ window.__v162got.push({ rule: x.rule, how: x.how, ro: x.ro && x.ro.id, text: x.sg && x.sg.text }); };
          __tg.autoFlush(); const ro=S.ros.find(r=>!r.dateClosed && /a/i.test(r.customerName||'') && r.operations.length>1 && r.id!=='shop'); if(!ro) return 'no ro';
          const op=ro.operations[1]; op.declined=false; op.jobStatus={status:'Complete – Road test', setAt:new Date().toISOString(), hand:true}; ro.suggest=[]; ro.sgSeen={};
          const n0=(S.autoLog||[]).length; __tg.autoFlush(); const g=window.__v162got; delete window.v162Log;
          if(typeof __tg.v162Log === 'function') return (S.autoLog||[]).slice(n0).filter(x=>x.rk==='r.rlold').map(x=>({ rule: x.rk, how: 'suggest', ro: x.roId, text: x.what }));   /* Fork A's log is in this build */
          return g; })()""")
        ok(isinstance(heard, list) and len(heard) == 1 and heard[0]["rule"] == "r.rlold" and heard[0]["how"] == "suggest" and heard[0]["text"], f"a custom rule that fires calls v162Log once, with its suggestion ({heard})")
        # an off rule nobody tested says so in the list
        await pg.evaluate("""(()=>{ const S=__tg.STATE(); S.automations.rules.push({ id:'rloff', name:'', on:false, mode:'suggest', when:'ro.status', conds:[{f:'roStatus', op:'is', v:'Working'}], acts:[{a:'remind', v:'Check in'}] });
          S.automations.rules.push({ id:'rlhalf', name:'', on:false, mode:'suggest', when:'punch.stop', conds:[{f:'roStatus', op:'is', v:''}], acts:[{a:'roStatus', v:'Hold Tech'}] }); __tg.UI().modal={type:'automations', edit:null}; __tg.render(); })()"""); await pg.wait_for_timeout(300)
        tags = await pg.evaluate("[...document.querySelectorAll('.am-rule.am-custom')].map(r=>{ const t=r.querySelector('.v162b-tag'); return t ? t.textContent : ''; })")
        ok(tags == ["", "Off · not tested yet", "Unfinished — edit it to finish the sentence"], f"the list marks an off, untested rule and an unfinished one ({tags})")
        rd = await pg.evaluate("[...document.querySelectorAll('.am-rule.am-custom .am-sum')].map(r=>r.textContent.replace(/\\s+/g,' ').trim())")
        ok(rd[1] == "When the RO status changes to Working then add a reminder to “Check in”", f"…as sentences ({rd[1]})")
        await pg.screenshot(path=os.path.join(OUT, "b5_list.png"))
        ok(not [x for x in errs if "favicon" not in x], f"no page errors ({errs[:3]})")
        await b.close()
    print("FAILS", len(FAILS))
asyncio.run(main())
