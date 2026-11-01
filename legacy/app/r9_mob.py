# End-to-end: Parsec 9.4 (desktop, t9.html) <-> Parsec Mobile 3 (phone) over the real QR frame format (TQ1, deflate-raw, 360-char chunks).
import asyncio, json, sys, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); B = os.path.join(os.path.dirname(H), "build")
PHONE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(B, "pm3_out.html")
FAIL = []
def ok(c, msg):
    print(("  ok   " if c else "  FAIL ") + msg)
    if not c: FAIL.append(msg)

DECODE = """(a) => { const [frames, drop] = a; let res = null, loops = 0, shown = 0; const take = TQP.decoder(null, (m, x) => { res = [m, x]; });
  while (!res && loops < 60) { loops++; for (const f of frames) { shown++; if (Math.random() >= drop) take(f); if (res) break; } }
  return { mode: res[0], s: res[1], loops, shown }; }"""
DROP = 0.12   # the camera misses about 1 code in 8

async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch()
        d = await (await br.new_context(viewport={"width": 1440, "height": 900})).new_page()
        ph = await (await br.new_context(viewport={"width": 390, "height": 844})).new_page()
        errs = []
        for pg, tag in ((d, "desk"), (ph, "phone")):
            pg.on("pageerror", lambda e, t=tag: errs.append(t + ": " + str(e)))
            pg.on("console", lambda m, t=tag: errs.append(t + " console: " + m.text) if m.type == "error" and "net::" not in m.text and "Failed to load" not in m.text else None)
        await d.goto("file://" + H + "/t9.html"); await d.wait_for_timeout(1200)
        await d.evaluate("__tg.loadSample25()"); await d.evaluate("__tg.ensureDemoTeam()"); await d.wait_for_timeout(300)
        await ph.goto("file://" + PHONE); await ph.wait_for_timeout(600)

        # the tech stopped the computer's clock 5 minutes after starting it (so the phone's time doesn't overlap)
        me = await d.evaluate("""(()=>{ const b = __tg.mobBundle()(); const S = __tg.STATE();
          S.punches.filter(p => !p.stop).forEach(p => { p.stop = new Date(new Date(p.start).getTime() + 5*60000).toISOString(); p.stopReason = 'Waiting – New Job'; });
          return b.me; })()""")
        print("tech:", me)

        async def desk_to_phone(label):
            pk = await d.evaluate("__tg.TQ.pack(__tg.mobBundle()()).then(pk => ({ frames: pk.frames, bytes: pk.bytes, data: pk.data }))")
            dec = await ph.evaluate(DECODE, [pk["frames"], DROP])
            b = await ph.evaluate("a => __pm.TQ.unpack(a[0], a[1])", [dec["mode"], dec["s"]])
            r = await ph.evaluate("b => { const r = __pm.applyPc(b); __pm.render(); return { ok: r.ok, msg: r.msg || '', ros: r.ros, cleared: r.ok2 }; }", b)
            print(f"  [{label}] computer → phone: {pk.get('data')} codes + {len(pk['frames']) - (pk.get('data') or 0)} spare ({pk['bytes']} bytes zipped), read with 12% missed in {dec['shown']} shows → {r}")
            return r, len(pk["frames"])

        async def phone_to_desk(label):
            pk = await ph.evaluate("__pm.phBundle().then(b => __pm.TQ.pack(b).then(pk => ({ frames: pk.frames, bytes: pk.bytes, data: pk.data, n: b.ch.length, kinds: b.ch.map(c => c.k) })))")
            dec = await ph.evaluate(DECODE, [pk["frames"], DROP])
            pk["shown"] = dec["shown"]
            b = await d.evaluate("a => __tg.TQ.unpack(a[0], a[1])", [dec["mode"], dec["s"]])
            r = await d.evaluate("b => { const r = __tg.mobApply()(b); return JSON.parse(JSON.stringify(r)); }", b)
            print(f"  [{label}] phone → computer: {pk['n']} changes {sorted(set(pk['kinds']))}, {pk['data']} codes + {len(pk['frames']) - pk['data']} spare ({pk['bytes']} bytes zipped), read in {dec['shown']} shows ≈ {dec['shown']*0.26:.0f} s → ok={r.get('ok')} chg={r.get('chg')} files={r.get('files')} shifts={r.get('shifts')} clash={r.get('clash')}")
            return r, pk

        print("1 · first sync to the phone")
        r, nf = await desk_to_phone("first")
        ok(r["ok"] and r["ros"] >= 1, f"phone took {r['ros']} ROs for {me}")
        st = await ph.evaluate("(()=>{ const S = __pm.S(), L = __pm.lists(); return { me: S.me, next: L.next.length, wait: L.wait.length, ib: (S.pc.ib||[]).length, fx: S.pc.fx.G.length }; })()")
        ok(st["me"] == me and st["next"] + st["wait"] > 0, f"phone shows {st}")

        print("2 · a morning on the phone")
        await ph.click('[data-a="clockin"]'); await ph.wait_for_timeout(150)
        # pick a job with parts from the computer
        op = await ph.evaluate("(()=>{ const V = __pm.V(), L = __pm.lists(); const o = L.next.concat(L.wait).find(o => o.pt.some(p => p.src === 'pc')) || L.next[0]; return { id: o.id, ro: o.ro, no: V.ro[o.ro].no, b0: o.b, parts: o.pt.map(p => p.d + ':' + p.st) }; })()")
        print("  job:", op)
        await ph.evaluate(f"__pm.A.job({{dataset:{{v:'{op['id']}'}}, closest:()=>null}})")
        await ph.click('.ph-acts .main.start'); await ph.wait_for_timeout(150)
        # it has been running 35 minutes; clocked in 40 minutes ago
        await ph.evaluate("(()=>{ const S = __pm.S(); S.L.run.s = new Date(Date.now() - 35*60000).toISOString(); S.L.shifts[0].in = new Date(Date.now() - 40*60000).toISOString(); __pm.render(); })()")
        await ph.fill('#noteIn', 'found the leak at the fitting, soapy water confirms'); await ph.press('#noteIn', 'Enter')
        await ph.click('[data-a="tab"][data-v="parts"]')
        if await ph.query_selector('[data-a="part"]'):
            await ph.click('[data-a="part"]'); await ph.click('[data-a="pset"][data-v="Picked up"]')
        await ph.click('[data-a="sheet"][data-v="needpart"]'); await ph.fill('#npD', 'Push-to-connect fitting 3/8'); await ph.fill('#npP', 'PTC-38'); await ph.fill('#npQ', '2'); await ph.click('[data-a="addpart"]')
        await ph.click('[data-a="tab"][data-v="info"]'); await ph.click('[data-a="sheet"][data-v="cause"]'); await ph.fill('#ccIn', 'cracked fitting at the dryer outlet'); await ph.click('[data-a="savecc"]')
        # two photos: a busy 4032×3024 one and a plain one
        for f in ("busy-photo.jpg", "mobile/test-photo.jpg"):
            await ph.click('[data-a="tab"][data-v="files"]'); await ph.click('.ph-fg .add[data-v="dash"]' if f.startswith("busy") else '.ph-fg .add[data-v="pics"]')
            await ph.evaluate("(()=>{ const i = document.getElementById('filein'); i.click = () => {}; })()")
            await ph.click('[data-a="pickfile"][data-v="photos"]')
            await ph.set_input_files('#filein', os.path.join(B, f)); await ph.wait_for_timeout(900)
        photos = await ph.evaluate("__pm.S().photos.map(p => ({ g: p.g, full: p.full || p.size, small: p.small, name: p.name }))")
        print("  photos:", photos)
        ok(len(photos) == 2 and all(x["small"] > 0 for x in photos), "two photos kept, each with a small copy")
        # Inbox: mark one done
        await ph.click('[data-a="back"]'); await ph.click('[data-a="go"][data-v="inbox"]')
        ibk = await ph.evaluate("(()=>{ const b = document.querySelector('[data-a=\"ibdone\"]'); return b ? b.dataset.v : null; })()")
        if ibk: await ph.click(f'[data-a="ibdone"][data-v="{ibk}"]')
        out1 = await ph.evaluate("(()=>{ const L = __pm.S().L; return { entries: L.entries.length, notes: L.notes.length, parts: L.parts.length, pstat: L.pstat.length, edits: L.edits.length, shifts: L.shifts.length, ib: L.ib.length, run: !!L.run }; })()")
        print("  on the phone, to send:", out1)
        burnt_before = await ph.evaluate(f"(()=>{{ __pm.build(); const o = __pm.V().op['{op['id']}']; return Math.round(((+o.b||0) + 0) * 1000) / 1000; }})()")

        print("3 · send to the computer while the clock is still running")
        r, pk = await phone_to_desk("send 1")
        ok(r.get("ok"), "computer took the codes")
        await d.wait_for_timeout(1500)   # photos are stored a moment later
        D = await d.evaluate(f"""(()=>{{ const S = __tg.STATE(), ro = __tg.getRO('{op['ro']}'), o = ro.operations.find(x => x.id === '{op['id']}');
          const pn = S.punches.filter(p => p.fromPhone && p.opId === o.id), sh = __tg.shiftList().filter(s => s.fromPhone);
          const files = (ro.bulletins||[]).reduce((a, b) => a.concat((b.files||[]).map(f => b.task + ':' + (f.name||f.fname))), []);
          const ib = __tg.IB.store().st, ibd = Object.keys(ib).filter(k => ib[k] && ib[k].phone);
          return {{ punches: pn.map(p => ({{ id: p.id, mins: Math.round((new Date(p.stop) - new Date(p.start))/60000), sr: p.stopReason, by: p.by }})), shifts: sh.map(s => ({{ mins: Math.round((new Date(s.out) - new Date(s.in))/60000), why: s.outReason, open: s.phoneOpen, by: s.by }})),
            notes: JSON.stringify(o.notes || o.techNotes || '').includes('soapy water confirms') || JSON.stringify(ro).includes('soapy water confirms'), cause: o.cause, parts: __tg.opRealParts(o).map(p => p.description + ':' + p.status + (p.pickedBy ? '/' + p.pickedBy : '')), files, ibd, burnt: o.burnt }}; }})()""")
        print("  on the computer:", json.dumps(D, indent=1)[:1500])
        ok(len(D["punches"]) == 1 and 33 <= D["punches"][0]["mins"] <= 37 and D["punches"][0]["sr"] is None, "running clock arrived as a punch up to now, still open-ended (no stop reason)")
        ok(len(D["shifts"]) == 1 and D["shifts"][0]["open"] and 38 <= D["shifts"][0]["mins"] <= 42, "day clock arrived (in 40 min ago, still on)")
        ok(D["notes"], "work note arrived")
        ok("cracked fitting" in (D["cause"] or "").lower(), "cause arrived")
        ok(any("Push-to-connect" in x for x in D["parts"]), "part request arrived")
        ok(any("Picked up" in x for x in D["parts"]) or not op["parts"], "Picked up arrived" + (" (with who)" if any("/" in x for x in D["parts"]) else ""))
        ok(len(D["files"]) == 2 and any(x.startswith("dashpic:") for x in D["files"]) and any(x.startswith("pics:") for x in D["files"]), f"both photos filed on the RO ({D['files']})")
        ok((not ibk) or len(D["ibd"]) == 1, "Inbox item marked done on the computer")

        print("4 · the phone gets the computer's copy back")
        r, nf = await desk_to_phone("back 1")
        st = await ph.evaluate(f"""(()=>{{ const S = __pm.S(), L = S.L; __pm.build(); const o = __pm.V().op['{op['id']}'];
          return {{ out: {{ entries: L.entries.length, notes: L.notes.length, parts: L.parts.length, pstat: L.pstat.length, edits: L.edits.length, shifts: L.shifts.length, ib: L.ib.length, unsent: S.photos.filter(p => !p.sent).length }}, run: !!L.run, b: o.b, ca: o.ca, pt: o.pt.map(p => p.d + ':' + p.st + ':' + p.src) }}; }})()""")
        print("  phone now:", st)
        ok(st["run"], "the clock is still running on the phone")
        ok(st["out"]["notes"] == 0 and st["out"]["parts"] == 0 and st["out"]["edits"] == 0 and st["out"]["pstat"] == 0 and st["out"]["ib"] == 0 and st["out"]["unsent"] == 0, "everything the computer took is cleared on the phone")
        ok(st["out"]["shifts"] == 1, "the open day clock stays on the phone (it is still running)")
        # Burnt must not count the 35 minutes twice
        bb = await ph.evaluate(f"(()=>{{ const o = __pm.V().op['{op['id']}']; return Math.round((o.b) * 1000) / 1000; }})()")
        run_new = await ph.evaluate("(()=>{ const S = __pm.S(); return 0; })()")
        burnt_all = await ph.evaluate(f"(()=>{{ const V = __pm.V(), o = V.op['{op['id']}']; const S = __pm.S(); const run = S.L.run; const k = (S.pc.ack||[]).filter(a => a.startsWith(run.id + '@')); return {{ b: o.b, ack: k, shown: document.querySelector('[data-tk]') ? 1 : 0 }}; }})()")
        print("  burnt on the phone (computer's copy):", burnt_all, "before sync (phone's own):", burnt_before)
        exp = op["b0"]  # computer's burnt before + 35 min arrives in o.b; the phone adds only time after the sync
        tot = await ph.evaluate(f"(()=>{{ const o = __pm.V().op['{op['id']}']; const S = __pm.S(); const run = S.L.run; const kn = (S.pc.ack||[]).filter(a => a.startsWith(run.id + '@')).map(a => a.split('@')[1]).sort().pop(); const extra = kn ? Math.max(0, (Date.now() - new Date(kn)) / 3600000) : (Date.now() - new Date(run.s)) / 3600000; return o.b + extra; }})()")
        ok(abs(tot - (op["b0"] + 35 / 60)) < 0.03, f"Burnt shows {tot:.3f} h = {op['b0']:.3f} + 0.583 (35 min counted once)")

        print("5 · finish the job on the phone and clock out")
        await ph.evaluate(f"__pm.A.job({{dataset:{{v:'{op['id']}'}}, closest:()=>null}})")
        await ph.evaluate("(()=>{ const S = __pm.S(); S.L.run.s = S.L.run.s; })()")
        await ph.wait_for_timeout(1200)  # a little more time on the clock
        await ph.click('.ph-acts .main'); await ph.click('[data-a="pick"][data-v="Complete"]')
        if await ph.query_selector('#corrIn'): await ph.fill('#corrIn', 'replaced the fitting, leak tested, no drop in 10 min')
        await ph.click('[data-a="setst"]'); await ph.wait_for_timeout(150)
        await ph.click('[data-a="back"]'); await ph.wait_for_timeout(100)
        await ph.click('[data-a="go"][data-v="work"]'); await ph.wait_for_timeout(100)
        await ph.click('[data-a="sheet"][data-v="clock"]'); await ph.click('[data-a="cpick"][data-v="End of day"]'); await ph.click('[data-a="clockout"]'); await ph.wait_for_timeout(150)
        st2 = await ph.evaluate("(()=>{ const L = __pm.S().L; return { entries: L.entries.map(x => x.sr), shifts: L.shifts.map(x => x.why), run: !!L.run }; })()")
        print("  phone:", st2)
        r, pk = await phone_to_desk("send 2")
        D2 = await d.evaluate(f"""(()=>{{ const S = __tg.STATE(), ro = __tg.getRO('{op['ro']}'), o = ro.operations.find(x => x.id === '{op['id']}');
          const pn = S.punches.filter(p => p.fromPhone && p.opId === o.id), sh = __tg.shiftList().filter(s => s.fromPhone);
          return {{ punches: pn.map(p => ({{ secs: Math.round((new Date(p.stop) - new Date(p.start))/1000), sr: p.stopReason }})), shifts: sh.map(s => ({{ why: s.outReason, open: s.phoneOpen }})), fx: o.correction, st: JSON.stringify(__tg.roStatus(ro)) }}; }})()""")
        print("  computer:", D2)
        ok(len(D2["punches"]) == 1 and D2["punches"][0]["sr"] == "Complete" and D2["punches"][0]["secs"] > 35 * 60, "the same punch grew and closed as Complete (no duplicate)")
        ok(len(D2["shifts"]) == 1 and D2["shifts"][0]["why"] == "End of day" and not D2["shifts"][0]["open"], "the same day clock closed with End of day")
        ok("replaced the fitting" in (D2["fx"] or "").lower(), "correction arrived")
        r, nf = await desk_to_phone("back 2")
        left = await ph.evaluate("(()=>{ const S = __pm.S(), L = S.L; return { n: L.entries.length + L.notes.length + L.parts.length + L.pstat.length + L.edits.length + L.shifts.length + L.ib.length + S.photos.filter(p => !p.sent).length, cnt: document.querySelector('.ph-syncchip') ? document.querySelector('.ph-syncchip').textContent : '' }; })()")
        ok(left["n"] == 0, f"phone is clear after the round trip ({left})")
        # the same codes again change nothing on the computer
        r, pk = await phone_to_desk("repeat (nothing left)")
        ok(pk["n"] == 0, "nothing re-sent")

        print("6 · photo timing — one photo alone, at 260 ms a code")
        for f in ("busy-photo.jpg", "mobile/test-photo.jpg"):
            import base64
            u = "data:image/jpeg;base64," + base64.b64encode(open(os.path.join(B, f), "rb").read()).decode()
            fr = await ph.evaluate("""async (u) => { const r = await fetch(u); const bl = await r.blob(); const img = await createImageBitmap(bl);
              const sc = Math.min(1, 512 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
              const sm = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.5)); const b64 = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.readAsDataURL(sm); });
              const pk = await __pm.TQ.pack({ t: 'ph', v: 3, ch: [{ id: 'x', k: 'file', d: b64 }] });
              const sim = []; for (const drop of [0.05, 0.12, 0.25]) { let tot = 0; for (let r = 0; r < 40; r++) { let done = false, shown = 0; const take = TQP.decoder(null, () => { done = true; }); while (!done) for (const f of pk.frames) { shown++; if (Math.random() >= drop) take(f); if (done) break; } tot += shown; } sim.push(Math.round(tot / 40 * 0.26)); }
              return { kb: Math.round(sm.size / 1024), codes: pk.data, all: pk.frames.length, w: c.width, h: c.height, sim }; }""", u)
            print(f"  {f}: small copy {fr['w']}×{fr['h']} {fr['kb']} KB → {fr['codes']} codes + {fr['all']-fr['codes']} spare → one loop {fr['all']*0.26:.0f} s; average with 5% / 12% / 25% missed: {fr['sim'][0]} / {fr['sim'][1]} / {fr['sim'][2]} s")

        print("6b · clocked in on the computer, lunch from the phone")
        await d.evaluate(f"(()=>{{ __tg.shiftList().push({{ id: 'sh_desk1', in: new Date(Date.now() + 2000).toISOString(), out: null, by: '{me}' }}); }})()")
        await ph.wait_for_timeout(2500)
        r, nf = await desk_to_phone("desk shift")
        await ph.click('[data-a="go"][data-v="work"]') if await ph.query_selector('[data-a="go"][data-v="work"]') else None
        await ph.evaluate("__pm.render()")
        cl = await ph.evaluate("(()=>{ const D = __pm.today(); return { open: !!D.open, pc: !!(D.open && D.open.pc), btn: !!document.querySelector('[data-a=\"sheet\"][data-v=\"clock\"]') }; })()")
        ok(cl["open"] and cl["pc"] and cl["btn"], f"phone shows the computer's day clock with Clock out ({cl})")
        await ph.wait_for_timeout(1200)
        await ph.click('[data-a="sheet"][data-v="clock"]'); await ph.click('[data-a="cpick"][data-v="Lunch"]'); await ph.click('[data-a="clockout"]')
        r, pk = await phone_to_desk("lunch")
        ds = await d.evaluate("(()=>{ const s = __tg.shiftList().find(z => z.id === 'sh_desk1'); return { out: !!s.out, why: s.outReason, from: s.outFrom }; })()")
        ok(ds["out"] and ds["why"] == "Lunch", f"the computer's day clock closed for Lunch from the phone ({ds})")
        r, nf = await desk_to_phone("after lunch")
        left = await ph.evaluate("__pm.S().L.shifts.length")
        ok(left == 0, "phone cleared it")

        print("7 · desktop Send to phone shows Whose phone")
        await d.evaluate("__tg.openPhoneSync()"); await d.wait_for_timeout(400)
        who = await d.evaluate("(()=>{ const s = document.querySelector('.psy-who select'); return s ? [s.value, s.options.length] : null; })()")
        if not who:
            await d.evaluate("(()=>{ const b = [...document.querySelectorAll('button')].find(b => /send to phone/i.test(b.textContent)); if (b) b.click(); })()"); await d.wait_for_timeout(400)
            who = await d.evaluate("(()=>{ const s = document.querySelector('.psy-who select'); return s ? [s.value, s.options.length] : null; })()")
        ok(bool(who), f"Whose phone picker: {who}")
        await d.screenshot(path=os.path.join(B, "pm3shots", "desk_send_to_phone.png"))
        print("errors:", errs[:8])
        ok(not errs, "no page errors")
        await br.close()
    print("\nRESULT:", "ALL PASS" if not FAIL else f"{len(FAIL)} FAILED: {FAIL}")
asyncio.run(main())
