import asyncio, json, re
from playwright.async_api import async_playwright
import os
DESKN = os.path.abspath("desk_nopatch.html"); DESKP = os.path.abspath("desk_patch.html")
PHONE = "file:///mnt/user-data/outputs/Parsec%20Mobile.html"
PATCH = open("desktop-patch.html").read()
PATCH_JS = re.sub(r'^<script[^>]*>|</script>\s*$', '', PATCH.strip())
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        d = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        derr = []; d.on("pageerror", lambda e: derr.append(str(e)))
        await d.goto("file://" + DESKN); await d.wait_for_timeout(2500)
        print("hook:", await d.evaluate("typeof window.__pmTest"))
        await d.evaluate("__pmTest.sample()"); await d.wait_for_timeout(800)
        # 1. desktop -> phone: pack with the DESKTOP's TQ, unpack with the PHONE's TQ
        frames = await d.evaluate("__pmTest.TQ.pack(__pmTest.bundle()).then(pk => pk.frames)")
        pc = await d.evaluate("__pmTest.bundle()")
        print("desktop frames:", len(frames), "open ROs:", len(pc["ros"]))
        ph = await (await b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)).new_page()
        perr = []; ph.on("pageerror", lambda e: perr.append(str(e)))
        await ph.goto(PHONE); await ph.wait_for_timeout(500)
        res = await ph.evaluate("""(frames) => { const parts = {}; let mode='r', n=0; frames.forEach(f => { const m=/^TQ1:([a-z0-9]+):([rz]):(\\d+)\\/(\\d+):(.*)$/.exec(f); parts[m[3]]=m[5]; mode=m[2]; n=+m[4]; });
            let s=''; for (let i=1;i<=n;i++) s+=parts[i]; return PM.TQ.unpack(mode, s).then(b => PM.applyPc(b)); }""", frames)
        print("phone applyPc:", res)
        v = await ph.evaluate("(() => { const v = PM.V(); const r = v.ros.find(r => r.ops.length && r.ops.some(o => o.pt.length)) || v.ros[0]; const o = r.ops.find(o => o.pt.length) || r.ops[0]; return { roId: r.id, no: r.no, opId: o.id, n: o.n, b: o.b, pt: o.pt.map(p => [p.d, p.pn, p.st]), cl: r.cl }; })()")
        print("phone picked RO", v["no"], "op", v["n"], "burnt", v["b"], "parts", v["pt"][:2])
        # 2. make changes on the phone (same functions the buttons call)
        await ph.evaluate("""(v) => { const S = PM.S(); const now = Date.now(); const iso = t => new Date(t).toISOString();
          S.L.entries.push({ id: 'pn_phtest1', roId: v.roId, opId: v.opId, s: iso(now - 3*86400000 - 3600000*2), e: iso(now - 3*86400000 - 3600000*0.5), r: 'Repairing', sr: 'Waiting – Parts', at: iso(now) });
          S.L.notes.push({ id: 'nt_phtest1', roId: v.roId, opId: v.opId, at: iso(now), x: 'Checked the clutch hydraulics from the phone. (Oct 21 · 9:41)' });
          S.L.parts.push({ id: 'pt_phtest1', roId: v.roId, opId: v.opId, at: iso(now), d: 'Clutch fork bushing', pn: '20512345', q: '2', pr: 0 });
          if (v.pt.length) S.L.pstat.push({ id: 'ps_phtest1', roId: v.roId, opId: v.opId, at: iso(now + 1), i: 0, pn: v.pt[0][1], d: v.pt[0][0], pid: null, st: 'Installed' });
          S.L.pstat.push({ id: 'ps_phtest2', roId: v.roId, opId: v.opId, at: iso(now + 2), i: -1, pn: '20512345', d: 'Clutch fork bushing', pid: 'pt_phtest1', st: 'Received' });
          S.L.ops.push({ id: 'op_phtest1', roId: v.roId, c: 'Air dryer purging constantly', t: 'DIAG', at: iso(now) });
          S.L.edits.push({ id: 'ed_phtest1', roId: v.roId, opId: v.opId, at: iso(now + 3), f: { ca: 'Clutch disc worn to the rivets.', fx: 'Replaced clutch kit and fork bushing.' } });
          S.L.ticks.push({ id: 'tk_phtest1', roId: v.roId, key: 'approval:1', v: true, at: iso(now) });
          PM.render(); }""", v)
        ob = await ph.evaluate("PM.outbox()")
        print("phone outbox:", ob["count"], sorted(x["k"] for x in ob["ch"]))
        # 3. phone -> desktop: pack with PHONE TQ, unpack with DESKTOP TQ
        pframes = await ph.evaluate("PM.TQ.pack(PM.phBundle()).then(pk => pk.frames)")
        print("phone frames:", len(pframes))
        before = await d.evaluate("(v) => { const ro = __pmTest.getRO(v.roId), op = ro.operations.find(o => o.id === v.opId); return { burnt: op.burnt, punches: __pmTest.S().punches.filter(p => p.opId === op.id).length, parts: op.parts.map(p => [p.description, p.status]) }; }", v)
        # without the patch first: time + pstat must be ignored, not broken
        r0 = await d.evaluate("""(frames) => { const parts={}; let mode='r', n=0; frames.forEach(f => { const m=/^TQ1:([a-z0-9]+):([rz]):(\\d+)\\/(\\d+):(.*)$/.exec(f); parts[m[3]]=m[5]; mode=m[2]; n=+m[4]; });
            let s=''; for (let i=1;i<=n;i++) s+=parts[i]; return __pmTest.TQ.unpack(mode, s).then(b => __pmTest.apply(b)); }""", pframes)
        print("desktop WITHOUT patch:", r0)
        mid = await d.evaluate("(v) => { const ro = __pmTest.getRO(v.roId), op = ro.operations.find(o => o.id === v.opId); return { burnt: op.burnt, punches: __pmTest.S().punches.filter(p => p.opId === op.id).length }; }", v)
        state = await d.evaluate("JSON.stringify(__pmTest.S())")
        d2 = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); d2.on("pageerror", lambda e: derr.append(str(e)))
        await d2.goto("file://" + DESKP); await d2.wait_for_timeout(2500)
        await d2.evaluate("(st) => { const S = __pmTest.S(), o = JSON.parse(st); Object.keys(S).forEach(k => delete S[k]); Object.assign(S, o); }", state)
        d = d2
        r1 = await d.evaluate("""(frames) => { const parts={}; let mode='r', n=0; frames.forEach(f => { const m=/^TQ1:([a-z0-9]+):([rz]):(\\d+)\\/(\\d+):(.*)$/.exec(f); parts[m[3]]=m[5]; mode=m[2]; n=+m[4]; });
            let s=''; for (let i=1;i<=n;i++) s+=parts[i]; return __pmTest.TQ.unpack(mode, s).then(b => __pmTest.apply(b)); }""", pframes)
        print("desktop WITH patch:", r1)
        after = await d.evaluate("(v) => { const ro = __pmTest.getRO(v.roId), op = ro.operations.find(o => o.id === v.opId); return { burnt: op.burnt, punches: __pmTest.S().punches.filter(p => p.opId === op.id).length, phonePunch: __pmTest.S().punches.filter(p => p.id === 'pn_phtest1').map(p => [p.startReason, p.stopReason, p.fromPhone]), parts: op.parts.map(p => [p.description, p.status]), cause: op.cause, fix: op.correction, notes: (op.offNotes||[]).map(n => n.text), newOp: ro.operations.filter(o => o.id === 'op_phtest1').map(o => [o.complaint, o.jobType]), tick: (ro.stageTicks||{})['approval:1'] }; }", v)
        print("before:", before); print("mid (no patch):", mid); print("after:", json.dumps(after, ensure_ascii=False))
        # re-apply the same codes: nothing should double
        r2 = await d.evaluate("""(frames) => { const parts={}; let mode='r', n=0; frames.forEach(f => { const m=/^TQ1:([a-z0-9]+):([rz]):(\\d+)\\/(\\d+):(.*)$/.exec(f); parts[m[3]]=m[5]; mode=m[2]; n=+m[4]; });
            let s=''; for (let i=1;i<=n;i++) s+=parts[i]; return __pmTest.TQ.unpack(mode, s).then(b => __pmTest.apply(b)); }""", pframes)
        again = await d.evaluate("(v) => __pmTest.S().punches.filter(p => p.opId === v.opId).length", v)
        print("re-apply:", r2, "punches still", again)
        # 4. desktop -> phone again: acks clear the phone's outbox, burnt includes phone time
        frames2 = await d.evaluate("__pmTest.TQ.pack(__pmTest.bundle()).then(pk => pk.frames)")
        res2 = await ph.evaluate("""(frames) => { const parts = {}; let mode='r', n=0; frames.forEach(f => { const m=/^TQ1:([a-z0-9]+):([rz]):(\\d+)\\/(\\d+):(.*)$/.exec(f); parts[m[3]]=m[5]; mode=m[2]; n=+m[4]; });
            let s=''; for (let i=1;i<=n;i++) s+=parts[i]; return PM.TQ.unpack(mode, s).then(b => PM.applyPc(b)); }""", frames2)
        v2 = await ph.evaluate("(v) => { const V = PM.V(); const o = V.op[v.opId]; return { b: o.b, ops: V.ro[v.roId].ops.length, outbox: PM.outbox().count, pt: o.pt.map(p => [p.d, p.st]), notes: o.nt.length, ca: o.ca }; }", v)
        print("phone after 2nd get:", res2, v2)
        print("desktop errors:", derr[:5]); print("phone errors:", perr[:5])
        await b.close()
asyncio.run(main())
