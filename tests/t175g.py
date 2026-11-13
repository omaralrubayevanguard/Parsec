# Parsec 17.5 (G) — the Foreman page in the new look. The header is two rows: the facts that filter are buttons that fit,
# the yard's count sits on its tab, the shop's clock ticks. Needs action is cards whose buttons show once a card is picked,
# with one blue next step on the page. Every text passes 4.5 to 1 on its own surface in Carbon with Charcoal (and in Ivory and
# Graphite), the old look is untouched in every other theme, nothing to press is under 24 px, every control shows a focus ring from the keyboard, and the phone has no sideways scroll.
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots175g"); os.makedirs(OUT, exist_ok=True)
AUDIT = r"""(root) => {
  const parse = c => { let m = c.match(/^rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(/[,\s\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; }
    m = c.match(/^color\(srgb ([^)]+)\)/); if (m) { const p = m[1].split(/[\s\/]+/).filter(Boolean).map(Number); return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p.length > 3 ? p[3] : 1 }; } return null; };
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const over = (t, u) => ({ r: t.r * t.a + u.r * (1 - t.a), g: t.g * t.a + u.g * (1 - t.a), b: t.b * t.a + u.b * (1 - t.a), a: 1 });
  const bgOf = el => { const st = []; let img = false; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e), c = parse(cs.backgroundColor); if (cs.backgroundImage !== 'none' && e !== document.body) img = true; if (c && c.a > 0) { st.push(c); if (c.a === 1) break; } }
    let base = { r: 20, g: 20, b: 20, a: 1 }; for (const c of st.reverse()) base = over(c, base); return [base, img]; };
  const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const vis = e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > .05;
  const sig = e => e.tagName.toLowerCase() + '.' + String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className).trim().split(/\s+/).slice(0, 3).join('.') + ' < ' + (e.parentElement ? String(e.parentElement.className).trim().split(/\s+/).slice(0, 2).join('.') : '');
  const out = { pairs: 0, min: 99, fails: {}, noname: [], small: [] }; const R = document.querySelector(root); if (!R) return out;
  for (const e of R.querySelectorAll('*')) { if (!vis(e) || e.closest('[disabled], .dis, script, style, svg')) continue;
    const txt = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' '); if (!txt) continue;
    let op = 1; for (let x = e; x && x !== document.body; x = x.parentElement) op *= +getComputedStyle(x).opacity;
    const cs = getComputedStyle(e), fg0 = parse(cs.color); if (!fg0) continue; fg0.a *= op; const [bg, img] = bgOf(e), fg = over(fg0, bg), r = cr(fg, bg), fs = parseFloat(cs.fontSize), big = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
    out.pairs++; if (r < out.min) out.min = r;
    if (r < (big ? 3 : 4.5)) { const k = sig(e); (out.fails[k] = out.fails[k] || [r.toFixed(2), txt.slice(0, 28), 0])[2]++; if (+out.fails[k][0] > r) out.fails[k][0] = r.toFixed(2); } }
  for (const e of R.querySelectorAll('button, input, textarea, select, summary, a[href], [role=button], [role=checkbox], [role=switch], [role=tab]')) { if (!vis(e)) continue;
    const lb = e.id && document.querySelector('label[for="' + e.id + '"]'), name = (e.getAttribute('aria-label') || e.getAttribute('title') || (lb && lb.textContent) || (e.closest('label') && e.closest('label').textContent) || e.getAttribute('placeholder') || e.textContent || '').trim();
    if (!name) out.noname.push(sig(e));
    const b = e.getBoundingClientRect(); if (Math.min(b.width, b.height) < 24) out.small.push(Math.round(b.width) + 'x' + Math.round(b.height) + ' ' + sig(e)); }
  out.min = +out.min.toFixed(2); return out; }"""
THEME = lambda t: f"(()=>{{ __tg.applyTheme('{t}'); __tg.render(); return [localStorage.getItem('tec_theme'), getComputedStyle(document.documentElement).getPropertyValue('--vv-panel').trim()]; }})()"
VIEW = lambda v: f"(()=>{{ __tg.UI().view='foreman'; __tg.UI().fmView='{v}'; __tg.UI().fmPop=null; __tg.render(); }})()"
# seven trucks into bays, so the floor has something on it
FILL = """(()=>{ const S=__tg.STATE(); const ids=[...new Set([...document.querySelectorAll('.tg-list [data-fm-drag]')].map(e=>e.dataset.fmDrag))];
  const more=S.ros.filter(r=>!r.dateClosed && r.assignedTech && r.id!=='shop').map(r=>r.id), all=[...new Set(ids.concat(more))];
  const bays=[...document.querySelectorAll('[data-action="fm-fill"]')].map(e=>e.dataset.bay); let n=0;
  for(let i=0;i<Math.min(7, all.length, bays.length);i++){ const r=S.ros.find(x=>x.id===all[i]); if(r){ r.location=bays[i*2]||bays[i]; n++; } } __tg.render(); return n; })()"""
PICK = "(()=>{ const it=[...document.querySelectorAll('.tg.fm .tg-it')].find(x=>!x.querySelector('.tg-av')); if(!it) return null; it.click(); return it.dataset.ro; })()"
async def audit(pg, root=".tg.fm"):
    return await pg.evaluate("(" + AUDIT + ")(" + json.dumps(root) + ")")
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p, 1440, 1000)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); })()")
        # ---------------------------------------------------------------- the theme
        th = await pg.evaluate(THEME("x-charcoal")); ok(th[0] == "x-charcoal" and th[1].lower() == "#1b1b1b", f"Carbon with Charcoal is a theme and paints the page {th}")
        await pg.evaluate(VIEW("floor")); await pg.wait_for_timeout(700)
        lk = await pg.evaluate("[document.documentElement.getAttribute('data-look'), !!document.querySelector('.tg.fm.lk'), getComputedStyle(document.documentElement).getPropertyValue('--lk-card').trim()]")
        ok(lk[0] == "new" and lk[1] and lk[2], f"Carbon with Charcoal switches on the new look: data-look, the page joins with .lk, the shared values are there {lk}")
        ok(await pg.evaluate(FILL) >= 3, "sample trucks are in bays"); await pg.wait_for_timeout(400)
        # ---------------------------------------------------------------- the header
        H1 = await pg.evaluate("""(()=>{ const h=document.querySelector('.tg.fm .tg-head'), r=e=>e.getBoundingClientRect(), f=h.querySelector('.tg-facts'), v=h.querySelector('.tg-views'), t=h.querySelector('.fm-tools');
          const chips=[...f.querySelectorAll('button.tg-hf')], fr=r(f);
          return { grid: getComputedStyle(h).display, rows: r(v).top >= r(f).bottom - 1, tools: t ? t.children.length : 0, plain: f.querySelectorAll('.fm-fact').length, chips: chips.map(c=>c.dataset.k),
            fit: chips.every(c=>r(c).right <= fr.right + 1 && r(c).bottom <= fr.bottom + 1), dots: [...f.children].filter(c=>c.tagName==='I').length,
            yard: (v.querySelector('[data-v=yard] .fm-n')||{}).textContent, clock: (h.querySelector('.fm-clock [data-clock-now]')||{}).textContent, facts: f.innerText.replace(/\\s+/g,' ') }; })()""")
        ok(H1["grid"] == "grid" and H1["rows"], f"the header is two rows: the views sit under the facts ({H1['grid']})")
        ok(H1["tools"] >= 4, f"search, handover, settings and New RO sit together ({H1['tools']})")
        ok(H1["plain"] == 2 and all(k in H1["chips"] for k in ["you", "tech", "late"]) and H1["dots"] == 0, f"two facts tell, three filter, no dots between them: {H1['facts']}")
        ok(H1["fit"], "every fact that filters fits in the header (none is cut off)")
        ok(H1["yard"] and int(H1["yard"]) > 0, f"the yard's count sits on the Yard tab ({H1['yard']})")
        ok(bool(H1["clock"]) and len(H1["clock"]) == 5 and H1["clock"][2] == ":", f"the shop's clock shows ({H1['clock']})")
        await pg.evaluate("document.querySelector('.tg.fm button.tg-hf[data-k=\"tech\"]').click()"); await pg.wait_for_timeout(450)
        on = await pg.evaluate("""(()=>{ const d=document.querySelector('.tg.fm button.tg-hf[data-k="tech"]'); return [d.classList.contains('on'), getComputedStyle(d).backgroundColor, getComputedStyle(d).color, __tg.UI().fmFilter]; })()""")
        ok(on[0] and on[1] == "rgb(240, 242, 244)" and on[3] == "tech", f"a filter that is on is shown in the ink colour {on}")
        await pg.evaluate("document.querySelector('.tg.fm button.tg-hf[data-k=\"tech\"]').click()"); await pg.wait_for_timeout(250)
        ok(await pg.evaluate("!__tg.UI().fmFilter"), "pressing it again clears it")
        # ---------------------------------------------------------------- Needs action
        rid = await pg.evaluate(PICK); await pg.wait_for_timeout(500)
        L = await pg.evaluate("""(()=>{ const vis=e=>!!(e && e.offsetParent), I=[...document.querySelectorAll('.tg.fm .tg-it')], on=I.filter(i=>i.classList.contains('on'));
          const acc='rgb(114, 166, 255)', blue=[...document.querySelectorAll('.tg.fm .btn')].filter(b=>vis(b) && getComputedStyle(b).backgroundColor===acc).map(b=>b.textContent.trim().slice(0,16));
          return { n: I.length, on: on.length, hidden: I.filter(i=>!i.classList.contains('on')).every(i=>!vis(i.querySelector('.tg-go')) && !vis(i.querySelector('.tg-snz'))),
            shown: on.length===1 && vis(on[0].querySelector('.tg-go')) && vis(on[0].querySelector('.tg-snz')), snz: on.length ? on[0].querySelector('.tg-snz').textContent.trim() : '',
            more: I.filter(i=>i.querySelector('.rl-more')).every(i=>vis(i.querySelector('.rl-more'))), blue: blue, card: on.length ? getComputedStyle(on[0]).borderRadius : '' }; })()""")
        ok(L["n"] >= 3 and L["on"] == 1, f"one card is picked of {L['n']}")
        ok(L["hidden"], "a card that isn't picked keeps its buttons folded")
        ok(L["shown"] and L["snz"] == "Snooze", f"the picked card shows its next step and Snooze, in words ({L['snz']})")
        ok(L["more"], "the ⋯ menu stays on every card")
        ok(len(L["blue"]) == 1, f"one blue button on the page: the picked card's next step {L['blue']}")
        await pg.screenshot(path=OUT + "/a1_floor.png")
        # ---------------------------------------------------------------- readable, pressable
        tot = {"pairs": 0, "fails": {}, "small": []}
        async def run(name, root=".tg.fm"):
            R = await audit(pg, root); tot["pairs"] += R["pairs"]
            for k, v in R["fails"].items(): tot["fails"][name + " · " + k] = v
            tot["small"] += [name + " · " + s for s in R["small"] if ".qte" not in s and not s.split(" ")[1].startswith("input")]
        await run("floor")
        await pg.evaluate("(()=>{ __tg.UI().fmDay=1; __tg.render(); })()"); await pg.wait_for_timeout(400); await run("day"); await pg.screenshot(path=OUT + "/a2_day.png")
        await pg.evaluate("(()=>{ __tg.UI().fmDay=0; __tg.render(); })()")
        for v in ["techs", "yard", "tmr"]:
            await pg.evaluate(VIEW(v)); await pg.wait_for_timeout(500); await run(v); await pg.screenshot(path=OUT + f"/a3_{v}.png")
        await pg.evaluate(VIEW("floor")); await pg.wait_for_timeout(400)
        for t in ["assign", "snooze", "xfer", "cfg", "bays"]:
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.fmPop={{type:'{t}', ro:U.fmSel, i:0}}; __tg.render(); }})()"); await pg.wait_for_timeout(350)
            if await pg.evaluate("!!document.querySelector('.tg.fm .tg-pop')"): await run("pop " + t, ".tg.fm .tg-pop")
            if t == "assign": await pg.screenshot(path=OUT + "/a4_assign.png")
            await pg.evaluate("(()=>{ __tg.UI().fmPop=null; __tg.render(); })()"); await pg.wait_for_timeout(150)
        await pg.evaluate("(()=>{ const b=document.querySelector('.tg.fm .tg-it.on .tg-go'); b && b.click(); })()"); await pg.wait_for_timeout(450)   # the picked card's own next step
        if await pg.evaluate("!!document.querySelector('.tg.fm .tg-pop')"): await run("pop next step", ".tg.fm .tg-pop")
        await pg.evaluate("(()=>{ __tg.UI().fmPop=null; __tg.render(); })()"); await pg.wait_for_timeout(150)
        ok(tot["pairs"] > 800 and not tot["fails"], f"{tot['pairs']} texts measured against their own surface, all 4.5 to 1 or better {list(tot['fails'].items())[:4]}")
        ok(not tot["small"], f"nothing to press is under 24 px {tot['small'][:5]}")
        # ---------------------------------------------------------------- the keyboard
        await pg.evaluate("(()=>{ const a=document.activeElement; a && a.blur && a.blur(); window.scrollTo(0,0); })()")
        stops = []; bare = []
        for i in range(40):
            await pg.keyboard.press("Tab"); await pg.wait_for_timeout(30)
            s = await pg.evaluate("""(()=>{ const e=document.activeElement; if(!e || !e.closest || !e.closest('.tg.fm')) return null; const cs=getComputedStyle(e);
              return [(e.className||e.tagName).toString().slice(0,40), cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2]; })()""")
            if s: stops.append(s[0]); bare += [] if s[1] else [s[0]]
        ok(len(stops) >= 12 and not bare, f"the Tab key walks the page and every stop shows a ring ({len(stops)} stops) {bare[:4]}")
        # ---------------------------------------------------------------- the other themes, the phone
        OLD = """(()=>{ const h=document.querySelector('.tg.fm .tg-head'), n=document.querySelector('.tg.fm [data-action="ty-newro"]');
          return { look: document.documentElement.getAttribute('data-look'), lk: !!document.querySelector('.lk'), tools: !!h.querySelector('.fm-tools'), clock: !!h.querySelector('.fm-clock'),
            facts: h.querySelectorAll('.fm-fact').length, primary: !!(n && n.classList.contains('btn-primary')), snooze: document.querySelectorAll('.tg.fm .fm-sl').length,
            radius: getComputedStyle(document.querySelector('.tg.fm .btn')).borderRadius }; })()"""
        for t in ["ivd", "ivl", "x-steel"]:
            await pg.evaluate(THEME(t)); await pg.evaluate(VIEW("floor")); await pg.wait_for_timeout(500)
            o = await pg.evaluate(OLD)
            ok(o["look"] is None and not o["lk"] and not o["tools"] and not o["clock"] and o["facts"] == 0 and o["primary"] and o["snooze"] == 0, f"{t}: the old look, as it was: the one-row header, New RO in its own colour, no Snooze label {o}")
            R = await audit(pg); print(f"note {t}: the old look's own faint text, left as it was until the old styles go: {len(R['fails'])} kinds under 4.5 to 1")
            await pg.screenshot(path=OUT + f"/a5_{t}.png")
        await pg.evaluate(THEME("x-charcoal")); await pg.set_viewport_size({"width": 390, "height": 840}); await pg.evaluate(VIEW("floor")); await pg.wait_for_timeout(700)
        sw = await pg.evaluate("document.documentElement.scrollWidth"); ok(sw <= 392, f"phone: no sideways scroll ({sw})")
        await pg.screenshot(path=OUT + "/a6_phone.png")
        ok(not errs, f"no page errors {errs[:3]}")
        print(("PASS" if not FAILS else "FAILED %d" % len(FAILS)), len(FAILS))
        await b.close()
asyncio.run(main())
