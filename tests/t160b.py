# Parsec 16 (B) — data that travels cleanly + save less of the same thing.
#   1. an old-format state (MM-DD-YYYY days, epoch-ms moments, "MM-DD HH:MM:SS" file times, money as text, a fat Completed record,
#      a deleted RO) made by the build before (t12.html) converts once in the new build: run normalize twice → the same result
#   2. every converted value shows the same in the UI: the RO page (header boxes, prices, bulletins, history, files), the warranty
#      page, the Technician page's Completed section and a deleted RO's record — read in the old build and in the new one
#   3. an unreadable value stays as it was and is listed (dataClean.left, the console, an "other" Activity line)
#   4. new edits write the new form; the save pass catches the rest (dates wait while a box has the cursor)
#   5. photos: 4000 px → 1600 px JPEG; a small PNG, a PNG under 2 MB, a PDF and a 1200 px JPEG untouched
# usage: python3 _t160b.py [new build, default t12_b.html] [old build, default t12.html]
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots160b"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12_b.html"
OLDP = sys.argv[2] if len(sys.argv) > 2 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
SR = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"

# ---- step 1 (old build): the sample, a tech's Completed with a deleted RO, a few values nobody can read
MAKE = """(() => { const S = __tg.STATE(), now = Date.now(), iso = ms => new Date(ms).toISOString(), day = 864e5;
  const X = S.ros.find(r => !r.shop && r.warrantyStart && (r.bulletins || []).some(b => b.tickedAt) && (r.history || []).length && r.operations.some(o => o.claim && o.claim.amount) && r.operations.some(o => (o.parts || []).some(p => p.price)));
  const T = __tg.staffList().filter(s => s.role === 'Technician'); const who = T[0].name, whoId = T[0].id;
  const okR = r => r && r !== X && !r.shop && r.id !== 'ro_shop' && !r.dateClosed && r.operations.filter(o => !o.declined).length >= 1;
  const L = S.ros.filter(okR).slice(0, 4);
  const done = (r, when, i) => { const op = r.operations.filter(o => !o.declined)[0]; r.assignedTech = who; S.punches = S.punches.filter(p => p.opId !== op.id);
    S.punches.push({ id: 'pc' + i, roId: r.id, opId: op.id, start: iso(when - 90 * 60e3), stop: iso(when), startReason: 'Repairing', stopReason: 'Complete', notes: 'Done it', by: who });
    op.jobStatus = { status: 'Complete', setAt: iso(when), hand: true }; r.operations.forEach(o => { if(o !== op) o.declined = true; }); };
  done(L[0], now - day, 0); done(L[1], now - 20 * 60e3, 1); done(L[2], now - 2 * day, 2); done(L[3], now - 3 * day, 3);
  __tg.scheduleSave(true);
  const C = L[2]; __tg.audit('ro-del', 'Deleted ' + C.roNumber, C); S.punches = S.punches.filter(p => p.roId !== C.id); S.ros = S.ros.filter(r => r.id !== C.id);
  /* an attached file from before (its time had no year), on X */
  const opP = X.operations.find(o => (o.parts || []).some(p => p.price));
  const pb = (X.bulletins || []).find(b => b.task === 'pics') || X.bulletins[0]; pb.files = pb.files || [];
  pb.files.push({ id: 'f_old1', name: 'leak.jpg', size: 245760, type: 'image/jpeg', ts: '10-29 14:31:22', op: opP.id });
  /* values nobody can read */
  const Y = L[3]; Y.buildDate = '07-01-25';
  const Z = L[0]; Z.history = Z.history || []; Z.history.push({ at: 'yesterday', k: 'field', t: 'Note', o: '', n: 'x', op: '', by: 'You' });
  const oq = X.operations.find(o => o !== opP) || opP; oq.otherCost = 'see invoice';
  /* money with a $ and a comma, on the Parts list */
  const it = (S.inventory || []).find(i => i.price); if(it) it.price = '$1,250.00';
  __tg.scheduleSave(true);
  return { X: X.id, op: opP.id, oq: oq.id, who, whoId, C: C.id, Y: Y.id, Z: Z.id, A: L[0].id, B: L[1].id, it: it ? it.id : null, nums: L.map(r => __tg.tgNum(r)), T: Date.now() }; })()"""

# ---- what the UI shows (same procedure in both builds)
JCVIEW = """(() => { const R = %s; if(!R) return null; const q = s => [...R.querySelectorAll(s)];
  return { inputs: q('input').map(i => (i.placeholder || '') + '=' + i.value).filter(s => !/=$/.test(s)),
    text: [...R.children].filter(c => c.tagName !== 'STYLE').map(c => c.innerText).join(' || ').split('\\n'),
    files: q('.px-li--file').map(e => e.innerText.replace(/\\s+/g, ' ')) }; })()""" % SR
WAVIEW = """(() => { const q = s => [...document.querySelectorAll(s)];
  return { facts: q('.wa-facts').map(e => e.innerText.replace(/\\s+/g, ' ')), ctx: q('.wa-ctx').map(e => e.innerText.replace(/\\s+/g, ' ')),
    f: q('[data-wa-f]').map(i => i.dataset.waF + '=' + i.value), shu: q('.wa-shu').map(e => e.innerText.replace(/\\s+/g, ' ')) }; })()"""
LIST = "(document.querySelector('[data-pg=tech] .tch-list')||{}).innerText||''"

def boot(state, viewas):
    js = "if(!sessionStorage.getItem('t160')){ sessionStorage.setItem('t160','1'); localStorage.setItem('tec_state_v1', %s); %s }" % (
        json.dumps(state), ("localStorage.setItem('tec_viewas', %s); localStorage.removeItem('tec_out');" % json.dumps(viewas)) if viewas else "")
    return js

async def page(b, path, state=None, viewas=None, logs=None, at=None):
    ctx = await b.new_context(viewport={"width": 1440, "height": 900})
    if at: await ctx.clock.set_fixed_time(at / 1000)   # both builds read the same moment, so "26 min beyond" reads the same
    if state is not None: await ctx.add_init_script(boot(state, viewas))
    pg = await ctx.new_page(); pg.set_default_timeout(8000); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    pg.on("console", lambda m: (logs.append(m.text[:400]) if logs is not None and m.type == "warning" else None) or (errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None))
    await pg.route("**/fonts.g*/**", lambda r: r.abort())
    await pg.goto("file://" + H + "/" + path); await pg.wait_for_timeout(1400)
    return ctx, pg, errs

async def views(pg, M):
    out = {}
    await pg.evaluate("(()=>{ try{ __tg.pxSignedIn(); }catch(e){} try{ __tg.CX.U().skipMorning = __tg.todayStr(); }catch(e){} const U=__tg.UI(); U.view='tech'; __tg.render(); })()"); await pg.wait_for_timeout(800)
    out["tech"] = await pg.evaluate(LIST)
    await pg.evaluate("(id)=>{ const b=document.querySelector('[data-pg=tech] .tch-cit[data-id=\"del:'+id+'\"]'); if(b) b.click(); }", M["C"]); await pg.wait_for_timeout(500)
    out["deleted"] = await pg.evaluate("(document.querySelector('[data-pg=tech] .tch-cdel')||{}).innerText||''")
    await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); try{ __tg.pxSignedIn(); }catch(e){} __tg.render(); })()"); await pg.wait_for_timeout(300)
    await pg.evaluate("(M)=>{ const U=__tg.UI(); U.view='ros'; U.selectedRo=M.X; U.roOpen={}; U.roOpen[M.X]=[M.op]; __tg.render(); }", M); await pg.wait_for_timeout(1500)
    out["jc"] = await pg.evaluate(JCVIEW)
    await pg.evaluate("(()=>{ const R=%s; const t=R.querySelector('.px-tab[data-tab=files]'); if(t) t.click(); })()" % SR); await pg.wait_for_timeout(900)
    out["jcf"] = await pg.evaluate(JCVIEW)
    await pg.evaluate("(()=>{ const R=%s; const t=R.querySelector('.px-tab[data-tab=parts]'); if(t) t.click(); })()" % SR); await pg.wait_for_timeout(400)
    await pg.evaluate("(M)=>{ const U=__tg.UI(); U.view='warranty'; U.waSel=M.X; U.waView='claims'; U.waOp=null; __tg.render(); }", M); await pg.wait_for_timeout(900)
    out["wa"] = await pg.evaluate(WAVIEW)
    return out

WALK = """(() => { const S = __tg.STATE(), bad = [];
  const MON = /^(price|list|core|ext|cost|otherCost|shopSupplies|amount|paid)$/, MOM = /^(at|tickedAt)$/;
  (function w(o, p, k){ if(o == null) return; if(Array.isArray(o)) { o.forEach((v, i) => w(v, p + '[' + i + ']', k)); return; }
    if(typeof o === 'object'){ for(const kk in o) w(o[kk], p + '.' + kk, kk); return; }
    if(typeof o === 'number' && o > 1e12 && o < 3e12 && !/(^|\\.)savedAt$|\\.sgSeen\\./.test(p)) bad.push(p + '=' + o);
    if(typeof o === 'string' && /^(buildDate|warrantyStart)$/.test(k) && o && !/^\\d{4}-\\d{2}-\\d{2}$/.test(o)) bad.push(p + '=' + o);
    if(typeof o === 'string' && MON.test(k) && o !== '' && !/(claim\\.short|tlReq|audit)/.test(p)) bad.push(p + '=' + o);
    if(typeof o === 'string' && k === 'ts' && /\\.files\\[/.test(p) && !/^\\d{4}-\\d{2}-\\d{2}T/.test(o)) bad.push(p + '=' + o);
  })(S, 'S', ''); return bad; })()"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # ---------------------------------------------------------------- 1 · the old build writes the old forms
        ctx, pg, errs0 = await page(b, OLDP)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(400)
        M = await pg.evaluate(MAKE); await pg.wait_for_timeout(300)
        OLD = await pg.evaluate("JSON.stringify(Object.assign(__tg.STATE(), { savedAt: Date.now() + 1e9 }))")
        await ctx.close()
        st = json.loads(OLD); td0 = st.get("tcDone", [])
        fat0 = len(json.dumps(td0, separators=(",", ":")))
        ok(st.get("dataV") is None and any("cust" in e for e in td0), f"the old build's state: no data version, a fat Completed record ({len(td0)} lines, {fat0:,} bytes)")
        ok(any(isinstance(h.get("at"), (int, float)) for r in st["ros"] for h in r.get("history") or []), "…epoch-ms history in it")
        ok(any(isinstance(r.get("warrantyStart"), str) and r["warrantyStart"][2:3] == "-" for r in st["ros"]), "…MM-DD-YYYY warranty starts in it")
        ok(any(isinstance(pt.get("price"), str) for r in st["ros"] for o in r["operations"] for pt in o.get("parts") or []), "…prices as text in it")
        # ---------------------------------------------------------------- 2 · the old build shows it
        ctx, pg, errsA = await page(b, OLDP, OLD, M["whoId"], None, M["T"] + 60000)
        VA = await views(pg, M); await pg.screenshot(path=os.path.join(OUT, "1_old_wa.png")); await ctx.close()
        # ---------------------------------------------------------------- 3 · the new build: converted once, shows the same
        logs = []
        ctx, pg, errs = await page(b, PAGE, OLD, M["whoId"], logs, M["T"] + 60000)
        S1 = json.loads(await pg.evaluate("JSON.stringify(__tg.STATE())"))
        ok(S1.get("dataV") == 16, f"converted once on load: dataV {S1.get('dataV')}, {S1.get('dataClean', {}).get('changed')} values into the new form")
        bad = await pg.evaluate(WALK)
        left = [x["path"] + "=" + json.dumps(x["value"]) for x in S1.get("dataClean", {}).get("left", [])]
        ok(sorted(bad) == sorted([x for x in bad if "see invoice" in x or "07-01-25" in x]) and len(bad) == 2,
           f"nothing left in an old form but the ones nobody can read: {bad}")
        X = next(r for r in S1["ros"] if r["id"] == M["X"]); Y = next(r for r in S1["ros"] if r["id"] == M["Y"]); Z = next(r for r in S1["ros"] if r["id"] == M["Z"])
        OQ = next(o for o in X["operations"] if o["id"] == M["oq"])
        ok(len(left) == 3 and Y["buildDate"] == "07-01-25" and any(h.get("at") == "yesterday" for h in Z["history"]) and OQ.get("otherCost") == "see invoice",
           "the unreadable ones stay exactly as they were and are listed: " + "; ".join(left))
        au = [a for a in S1.get("audit", []) if a.get("type") == "other"]
        ok(len(au) == 1 and "kept as typed" in au[0]["text"], "…an \"other\" line in the Activity log: " + (au[0]["text"][:110] if au else "none"))
        ok(any("Parsec 16" in l and "kept as they were" in l for l in logs), "…and on the console")
        ok(isinstance(S1["savedAt"], (int, float)) and all(isinstance(v, (int, float)) for r in S1["ros"] + [S1.get("shopRo") or {}] for v in (r.get("sgSeen") or {}).values()),
           "savedAt and sgSeen stay numbers (sync stamps, compared as numbers)")
        ok(X["warrantyStart"][4:5] == "-" and isinstance(X["history"][0]["at"], str) and isinstance(next(b2 for b2 in X["bulletins"] if b2.get("tickedAt"))["tickedAt"], str),
           f"X: warrantyStart {X['warrantyStart']}, history at {X['history'][0]['at']}")
        fo = next(f for b2 in X["bulletins"] for f in b2.get("files") or [] if f["id"] == "f_old1")
        ok(fo["ts"].endswith("Z") and fo["ts"][5:10] == "10-29", f"the old file time without a year → {fo['ts']}")
        it = next((i for i in S1.get("inventory", []) if i.get("id") == M["it"]), None)
        ok(it is None or it.get("price") == 1250, f"'$1,250.00' on the Parts list → {it and it.get('price')}")
        td1 = S1.get("tcDone", []); slim1 = len(json.dumps(td1, separators=(",", ":")))
        gone = [e for e in td1 if e["roId"] == M["C"]]; live = [e for e in td1 if e["roId"] != M["C"]]
        ok(len(td1) == len(td0) and all("cust" in e and "no" in e for e in gone) and all("cust" not in e for e in live if any(r["id"] == e["roId"] for r in S1["ros"])),
           f"Completed: {len(td0)} lines {fat0:,} → {slim1:,} bytes; the deleted RO keeps its snapshot ({len(gone)} line)")
        ok(all(set(e) <= {"k", "tech", "roId", "opId", "opn", "hrs", "q", "at", "no", "cust", "truck", "unit", "cmp"} for e in td1), "no new fields on a Completed line")
        # normalize twice → the same
        same = await pg.evaluate("(O)=>{ const a = __tg.normalizeState(JSON.parse(O)); const ja = JSON.stringify(a); const b = __tg.normalizeState(JSON.parse(ja)); const n = __tg.v160CleanAll(JSON.parse(ja), []); return [ja === JSON.stringify(b), n, a.dataV]; }", OLD)
        ok(same[0] and same[1] == 0, f"normalize twice → the same result; a second pass changes nothing ({same})")
        VB = await views(pg, M); await pg.screenshot(path=os.path.join(OUT, "2_new_wa.png"))
        for k in ["tech", "deleted"]:
            ok(VA[k] == VB[k] and len(VA[k]) > 40, f"the same {k} text in both builds ({len(VA[k])} chars)" + ("" if VA[k] == VB[k] else f"\n   old: {VA[k][:400]!r}\n   new: {VB[k][:400]!r}"))
        for t in ["jc", "jcf"]:
            for k in ["inputs", "text", "files"]:
                a, c = (VA[t] or {}).get(k), (VB[t] or {}).get(k)
                if a != c and isinstance(a, list) and isinstance(c, list):
                    import difflib; dd = [l for l in difflib.unified_diff(a, c, lineterm="", n=0) if not l.startswith(("---", "+++", "@@"))][:12]
                else: dd = [a, c]
                ok(a == c and (k != "files" or t != "jcf" or a), f"RO page ({'parts' if t == 'jc' else 'files'} tab) {k}: the same ({len(a or [])} lines)" + ("" if a == c else "\n   " + "\n   ".join(map(str, dd))))
        ok(any("$" in l for l in VB["jc"]["text"]) and any("412" in l or "18.9" in l or "$" in l for l in VB["jc"]["text"]), "…prices on it: " + str([l for l in VB["jc"]["text"] if "$" in l][:4]))
        ok(any("07-01-2025" in s or "-20" in s for s in VB["jc"]["inputs"] if s.startswith("MM-DD-YYYY")), "RO page: WARRANTY STARTS still MM-DD-YYYY: " + str([s for s in VB["jc"]["inputs"] if s.startswith("MM-DD-YYYY")]))
        ok(any("leak.jpg" in s and "10-29" in s for s in VB["jcf"]["files"]), "the old file shows its time as before: " + str(VB["jcf"]["files"][:3]))
        for k in ["facts", "ctx", "f", "shu"]:
            a, c = VA["wa"].get(k), VB["wa"].get(k)
            ok(a == c, f"warranty page {k}: the same ({len(a or [])})" + ("" if a == c else f"\n   old: {a}\n   new: {c}"))
        # ---------------------------------------------------------------- 4 · new edits write the new form
        await pg.evaluate("(M)=>{ const r=__tg.getRO(M.X), op=r.operations.find(o=>(o.parts||[]).some(p=>p.price)); const U=__tg.UI(); U.view='ros'; U.selectedRo=M.X; U.roOpen={}; U.roOpen[M.X]=[op.id]; __tg.render(); }", M); await pg.wait_for_timeout(1500)
        r = await pg.evaluate("""(M)=>{ const R=%s, I=[...R.querySelectorAll('input')].filter(i=>i.placeholder==='MM-DD-YYYY'); const b=I[1]; b.focus(); b.value='03-15-2024'; b.dispatchEvent(new Event('input',{bubbles:true}));
          b.blur(); return [__tg.getRO(M.X).buildDate]; }""" % SR, M)
        await pg.evaluate("(()=>{ const R=%s; const b=R.querySelector('.px-pstat'); b.click(); })()" % SR); await pg.wait_for_timeout(400)
        await pg.evaluate("(()=>{ const R=%s; const it=[...R.querySelectorAll('button, [role=menuitem], div'), ...document.querySelectorAll('button, [role=menuitem]')].find(e=>/^\\s*Edit part/.test(e.innerText||'') && e.children.length < 6); if(it) it.click(); })()" % SR); await pg.wait_for_timeout(500)
        r += await pg.evaluate("""(M)=>{ const R=%s; const m=R.querySelector('.px-modal') || document.querySelector('.px-modal'); if(!m) return ['no modal'];
          const pr=m.querySelector('.px-affix input'); pr.value='42.5'; pr.dispatchEvent(new Event('input',{bubbles:true}));
          const sb=[...m.querySelectorAll('button')].find(x=>/Save part/.test(x.innerText)); sb.click();
          const ro=__tg.getRO(M.X), pts=ro.operations.flatMap(o=>o.parts||[]); return [pts.map(p=>p.price).filter(v=>v===42.5||v==='42.5')]; }""" % SR, M)
        ok(r[0] == "2024-03-15" and r[1] == [42.5], f"typed DATE BUILT 03-15-2024 → {r[0]}; a price typed 42.5 in Edit part → {r[1]}")
        await pg.evaluate("__tg.render()"); await pg.wait_for_timeout(900)
        v = await pg.evaluate("(()=>{ const R=%s; return [...R.querySelectorAll('input')].filter(i=>i.placeholder==='MM-DD-YYYY').map(i=>i.value); })()" % SR)
        ok(v[1:2] == ["03-15-2024"], f"…and the box still shows 03-15-2024 ({v})")
        await pg.wait_for_timeout(600)
        h = await pg.evaluate("(id)=>{ const r=__tg.getRO(id); return (r.history||[]).slice(-3).map(x=>x.at); }", M["X"])
        ok(h and all(isinstance(x, str) and x.endswith("Z") for x in h), f"new history lines are ISO: {h[-1:]}")
        await pg.evaluate("(M)=>{ const U=__tg.UI(); U.view='warranty'; U.waSel=M.X; U.waView='claims'; __tg.render(); }", M); await pg.wait_for_timeout(800)
        a = await pg.evaluate("""(M)=>{ const i=document.querySelector('[data-wa-f=amount]'); if(!i) return null; i.value='1,300.5'; i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true}));
          const r=__tg.getRO(i.dataset.ro), op=r.operations.find(o=>o.id===i.dataset.op); return op.claim.amount; }""", M); await pg.wait_for_timeout(600)
        sh = await pg.evaluate("(document.querySelector('[data-wa-f=amount]')||{}).value")
        ok(a == 1300.5 and sh == "1300.50", f"a claim amount typed 1,300.5 → {a!r}, shown {sh!r}")
        n = await pg.evaluate("""(M)=>{ const r=__tg.getRO(M.X); r.warrantyStart='08-09-2024'; const pt=r.operations.flatMap(o=>o.parts||[]).find(p=>typeof p.price==='number'); pt.price='12.40'; r.bulletins[0].at=Date.now();
          r.autoReminders=[{ id:'rm1', text:'x', at: Date.now() }]; document.activeElement && document.activeElement.blur && document.activeElement.blur(); __tg.scheduleSave();
          return [r.warrantyStart, pt.price, typeof r.bulletins[0].at, typeof r.autoReminders[0].at]; }""", M)
        ok(n == ["2024-08-09", 12.4, "string", "string"], f"anything still written the old way goes into the new form on the save: {n}")
        n = await pg.evaluate("""(M)=>{ const r=__tg.getRO(M.X); const i=document.createElement('input'); document.body.appendChild(i); i.focus(); r.buildDate='08-09-2024'; r.shopSupplies='35.5'; __tg.scheduleSave();
          const a=[r.buildDate, r.shopSupplies]; i.blur(); i.remove(); __tg.scheduleSave(); return a.concat([r.buildDate]); }""", M)
        ok(n == ["08-09-2024", 35.5, "2024-08-09"], f"a date waits while a box has the cursor (half-typed dates aren't read), money doesn't: {n}")
        ms = await pg.evaluate("(()=>{ const t0=performance.now(); for(let i=0;i<50;i++) __tg.v160CleanSave(); return (performance.now()-t0)/50; })()")
        ok(ms < 8, f"the save pass costs {ms:.2f} ms")
        # ---------------------------------------------------------------- 5 · photos
        P = await pg.evaluate("""async (M) => {
          const mk = (w, h, type, noise, q) => new Promise(res => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
            if(noise){ const d = g.createImageData(w, h); for(let i = 0; i < d.data.length; i += 4){ d.data[i] = Math.random() * 255; d.data[i + 1] = Math.random() * 255; d.data[i + 2] = Math.random() * 255; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }
            else { g.fillStyle = '#3a6'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(10, 10, w / 3, h / 3); }
            c.toBlob(b => res(b), type, q); });
          const F = async (name, w, h, type, noise, q) => { const b = await mk(w, h, type, noise, q); return new File([b], name, { type }); };
          const dims = async b => { try{ const i = await createImageBitmap(b); return [i.width, i.height]; }catch(e){ return null; } };
          const L = [await F('dash.jpg', 4000, 3000, 'image/jpeg', true, 0.92), await F('wide.jpg', 2400, 300, 'image/jpeg', false, 0.9), await F('shot.png', 400, 300, 'image/png', false),
                     await F('wide.png', 3000, 400, 'image/png', false), await F('big.png', 1500, 1500, 'image/png', true), await F('mid.jpg', 1200, 900, 'image/jpeg', true, 0.9),
                     new File([new Uint8Array(3e6)], 'report.pdf', { type: 'application/pdf' })];
          const out = []; for(const f of L){ const r = await __tg.v160Shrink(f); out.push({ in: [f.name, f.type, f.size, await dims(f)], out: [r.name, r.blob.type, r.blob.size, await dims(r.blob)], same: r.blob === f }); }
          /* through the RO page's own intake */
          const ro = __tg.getRO(M.X), big = L[0]; const done = await new Promise(res => { try{ __tg.JC.addFilesTo(ro, 'pics', [big], k => res(k)); }catch(e){ res('err ' + e.message); } setTimeout(() => res('timeout'), 8000); });
          const e = (ro.bulletins || []).filter(b => b.task === 'pics').pop(), f = e && (e.files || []).slice(-1)[0];
          return { out, done, f, at: e && e.at }; }""", M)
        for o in P["out"]: print("      ", o["in"], "→", o["out"], "same" if o["same"] else "")
        D = {o["in"][0]: o for o in P["out"]}
        ok(D["dash.jpg"]["out"][0] == "dash.jpg" and D["dash.jpg"]["out"][1] == "image/jpeg" and D["dash.jpg"]["out"][3] == [1600, 1200], f"a 4000 px photo → a 1600 px JPEG ({D['dash.jpg']['in'][2]:,} → {D['dash.jpg']['out'][2]:,} bytes)")
        ok(D["wide.jpg"]["out"][3] == [1600, 200], "a 2400 px JPEG, small in bytes, → 1600 px wide too")
        ok(D["shot.png"]["same"], "a small PNG is untouched")
        ok(D["wide.png"]["same"] and D["wide.png"]["in"][2] < 2 * 1024 * 1024, "a 3000 px PNG under 2 MB stays the PNG it was")
        ok(D["big.png"]["out"][1] == "image/jpeg" and D["big.png"]["out"][0] == "big.jpg" and D["big.png"]["out"][3] == [1500, 1500], f"a PNG over 2 MB ({D['big.png']['in'][2]:,} bytes) → JPEG, not made bigger ({D['big.png']['out'][3]})")
        ok(D["mid.jpg"]["same"], f"a 1200 px JPEG of {D['mid.jpg']['in'][2]:,} bytes is untouched (the old rule re-saved anything over 400 KB)")
        ok(D["report.pdf"]["same"], "a PDF is untouched")
        f = P["f"] or {}
        ok(P["done"] == 1 and f.get("name") == "dash.jpg" and f.get("type") == "image/jpeg" and f.get("size", 1e9) < D["dash.jpg"]["in"][2] and str(f.get("ts", "")).endswith("Z") and str(P["at"]).endswith("Z"),
           f"through the RO page: saved {f.get('name')} {f.get('size')} bytes, ts {f.get('ts')}, bulletin at {P['at']}")
        # ---------------------------------------------------------------- 6 · a fresh sample in the new build
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.evaluate("__tg.scheduleSave(true)"); await pg.wait_for_timeout(500)
        bad2 = await pg.evaluate(WALK); td2 = await pg.evaluate("(()=>{ const S=__tg.STATE(), R=new Set(S.ros.map(r=>r.id)); return JSON.stringify((S.tcDone||[]).filter(e=>R.has(e.roId))); })()")
        ok(not bad2, f"the sample made in the new build is all in the new form ({len(bad2)} left: {bad2[:3]})")
        ok("\"cust\"" not in td2, f"…its Completed lines for ROs it has are slim ({len(json.loads(td2))} lines, {len(td2):,} bytes; the previous data's lines keep their snapshots, as before)")
        ok(not errs and not errsA, "no page errors: " + " | ".join((errs + errsA)[:3]))
        await ctx.close(); await b.close()
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
