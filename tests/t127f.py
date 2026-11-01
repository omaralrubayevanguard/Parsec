# Parsec 12.7 — the pages' lists fold: the whole list into a strip, each group on its own; remembered; no flicker
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots127f"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
VIEWS = ["triage", "foreman", "parts", "warranty", "tech", "fixes", "timelog", "manager", "career"]
async def setup(p, w=1440, h=900, phone=False, keep=None):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": w, "height": h}, is_mobile=phone, has_touch=phone)
    pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
    await pg.route("**/fonts.g*/**", lambda r: r.abort())
    if phone: await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
    await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
    await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
    return b, ctx, pg, errs
async def go(pg, v):
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{v}'; __tg.render(); }})()"); await pg.wait_for_timeout(450)
LIST = "document.querySelector('#app .tg-list')"
INFO = f"""(()=>{{ const l={LIST}; if(!l) return null; const m=l.parentElement && [...l.parentElement.children].find(x=>x!==l && x.offsetWidth>0 && !x.classList.contains('tg-pop'));
  const r=l.querySelector(':scope > .lf-rail');
  return {{ w: Math.round(l.getBoundingClientRect().width), fold: l.classList.contains('lf-fold'), btn: !!l.querySelector(':scope > .tg-lh > .lf-b'), mw: m ? Math.round(m.getBoundingClientRect().width) : 0,
    rail: r ? [getComputedStyle(r).display, (r.querySelector('.lf-rt')||{{}}).textContent||'', (r.querySelector('.lf-rn')||{{}}).textContent||''] : null,
    head: ((l.querySelector(':scope > .tg-lh')||{{}}).firstChild||{{}}).nodeValue || '' }}; }})()"""
async def desktop(p):
    print("— desktop")
    b, ctx, pg, errs = await setup(p)
    tried = 0
    for v in VIEWS:
        await go(pg, v)
        a = await pg.evaluate(INFO)
        if not a and v == "manager":
            await pg.evaluate("(()=>{ const b=document.querySelector('[data-pg=manager] [data-a=view][data-v=team]'); b && b.click(); })()"); await pg.wait_for_timeout(400); a = await pg.evaluate(INFO)
        if not a: print("    (no list on", v, ")"); continue
        tried += 1
        await pg.evaluate(f"{LIST}.querySelector(':scope > .tg-lh > .lf-b').click()"); await pg.wait_for_timeout(250)
        f = await pg.evaluate(INFO)
        ok(f["fold"] and f["w"] == 48 and f["rail"] and f["rail"][0] == "flex" and f["rail"][1] and f["mw"] > a["mw"] + a["w"] - 80,   # Parsec 14.3: the Technician list is 320 px now
           f"{v}: the list folds into a strip ({a['w']}→{f['w']} px, main {a['mw']}→{f['mw']} px, strip '{f['rail'] and f['rail'][1]}' {f['rail'] and f['rail'][2]})")
        st = await pg.evaluate(f"(()=>{{ __tg.render(); return {LIST}.classList.contains('lf-fold'); }})()")
        ok(st, f"{v}: still folded right after a redraw (same step)")
        await pg.evaluate(f"{LIST}.querySelector(':scope > .lf-rail').click()"); await pg.wait_for_timeout(250)
        u = await pg.evaluate(INFO)
        ok(not u["fold"] and u["w"] == a["w"], f"{v}: a click on the strip opens it ({u['w']} px)")
    ok(tried >= 6, f"lists found on {tried} pages")
    # ] folds and opens; remembered after a reload
    await go(pg, "triage")
    await pg.keyboard.press("]"); await pg.wait_for_timeout(200)
    k1 = await pg.evaluate(INFO)
    ok(k1["fold"], "] folds the list")
    await pg.screenshot(path=os.path.join(OUT, "a1_triage_folded.png"))
    await pg.reload(); await pg.wait_for_timeout(1300); await pg.evaluate("__tg.loadSample25()"); await go(pg, "triage")
    ok((await pg.evaluate(INFO))["fold"], "remembered after a reload")
    await go(pg, "foreman")
    ok(not (await pg.evaluate(INFO))["fold"], "per page: the Foreman's list stays open")
    await go(pg, "triage"); await pg.keyboard.press("]"); await pg.wait_for_timeout(200)
    ok(not (await pg.evaluate(INFO))["fold"], "] opens it again")
    # the groups
    for v in ["parts", "triage", "foreman", "tech"]:
        await go(pg, v)
        g = await pg.evaluate(f"""(()=>{{ const L=[...document.querySelectorAll('#app .tg-list .tg-grp.lf-g')]; for(const g of L){{ let n=0; for(let x=g.nextElementSibling; x && !x.classList.contains('tg-grp') && !x.classList.contains('tg-sec') && !x.classList.contains('lf-rail'); x=x.nextElementSibling){{ if(x.classList.contains('tg-it') && !x.classList.contains('on')) n++; }} if(n) {{ g.setAttribute('data-t1','1'); return [g.getAttribute('data-lf-g'), n, (g.querySelector('span')||{{}}).textContent||'']; }} }} return null; }})()""")
        if not g: print("    (no group with rows on", v, ")"); continue
        await pg.evaluate("document.querySelector('#app .tg-grp[data-t1]').click()"); await pg.wait_for_timeout(250)
        hid = await pg.evaluate(f"""(()=>{{ const g=[...document.querySelectorAll('#app .tg-grp.lf-g')].find(x=>x.getAttribute('data-lf-g')==={json.dumps(g[0])}); let n=0, sh=0; for(let x=g.nextElementSibling; x && !x.classList.contains('tg-grp') && !x.classList.contains('tg-sec') && !x.classList.contains('lf-rail'); x=x.nextElementSibling){{ if(x.classList.contains('tg-it')){{ if(getComputedStyle(x).display==='none') n++; else sh++; }} }} return [g.classList.contains('lf-shut'), n, sh, getComputedStyle(g.querySelector('.lf-chev')).transform, (g.querySelector('span')||{{}}).textContent||'']; }})()""")
        ok(hid[0] and hid[1] == g[1] and hid[4] == g[2], f"{v}: the group '{g[0]}' folds — {hid[1]} rows hidden, the count {hid[4]} stays")
        if v == "parts": await pg.screenshot(path=os.path.join(OUT, "a2_parts_group.png"))
        r2 = await pg.evaluate(f"(()=>{{ __tg.render(); const g=[...document.querySelectorAll('#app .tg-grp.lf-g')].find(x=>x.getAttribute('data-lf-g')==={json.dumps(g[0])}); return g && g.classList.contains('lf-shut'); }})()")
        ok(r2, f"{v}: still folded after a redraw")
        await pg.evaluate(f"[...document.querySelectorAll('#app .tg-grp.lf-g')].find(x=>x.getAttribute('data-lf-g')==={json.dumps(g[0])}).click()"); await pg.wait_for_timeout(200)
        op = await pg.evaluate(f"(()=>{{ const g=[...document.querySelectorAll('#app .tg-grp.lf-g')].find(x=>x.getAttribute('data-lf-g')==={json.dumps(g[0])}); return !g.classList.contains('lf-shut') && !document.querySelector('#app .lf-gone'); }})()")
        ok(op, f"{v}: a second click opens it")
    # remembered: fold a Parts group, reload
    await go(pg, "parts")
    key = await pg.evaluate("(()=>{ const g=document.querySelector('#app .tg-grp.lf-g'); g.click(); return g.getAttribute('data-lf-g'); })()"); await pg.wait_for_timeout(200)
    await pg.reload(); await pg.wait_for_timeout(1300); await pg.evaluate("__tg.loadSample25()"); await go(pg, "parts")
    ok(await pg.evaluate(f"(()=>{{ const g=[...document.querySelectorAll('#app .tg-grp.lf-g')].find(x=>x.getAttribute('data-lf-g')==={json.dumps(key)}); return !!g && g.classList.contains('lf-shut'); }})()"), f"a folded group is remembered after a reload ({key})")
    # a group head's own button (Plan together on the Foreman) isn't taken over
    await go(pg, "foreman")
    fp = await pg.evaluate("(()=>{ const b=document.querySelector('#app .tg-grp .fm-plan'); if(!b) return null; const g=b.closest('.tg-grp'), s0=g.classList.contains('lf-shut'); b.click(); return s0 === (document.querySelector('#app .tg-grp .fm-plan') ? document.querySelector('#app .tg-grp .fm-plan').closest('.tg-grp').classList.contains('lf-shut') : s0); })()")
    if fp is not None: ok(fp, "a button inside a group's head does its own thing")
    await pg.keyboard.press("Escape")
    # no flicker through the 5-second redraw while a clock runs: every frame for 11 s has the fold
    await go(pg, "triage"); await pg.keyboard.press("]"); await pg.wait_for_timeout(200)
    await pg.evaluate("(()=>{ const S=__tg.STATE(); const ro=S.ros.find(r=>!r.shop && r.id!=='shop' && !r.dateClosed && r.operations.length); __tg.doStartPunch(ro.id, ro.operations[0].id, 'Repairing'); })()")
    await go(pg, "triage")
    fl = await pg.evaluate(f"""new Promise(res=>{{ let miss=0, n=0, r0=0; const t0=performance.now(); const R0=window.__lfR||0; (function f(){{ const l={LIST}; n++; if(!l || !l.classList.contains('lf-fold')) miss++; if(performance.now()-t0<11000) requestAnimationFrame(f); else res([n, miss]); }})(); }})""")
    ok(fl[1] == 0 and fl[0] > 60, f"no flicker: {fl[0]} frames over 11 s with a clock running, {fl[1]} without the fold")
    await pg.keyboard.press("]")
    # all four themes
    await go(pg, "parts"); await pg.evaluate("(()=>{ const g=document.querySelector('#app .tg-grp.lf-g:not(.lf-shut)'); g && g.click(); })()")
    for th in ["ivl", "ivd", "vvl", "vvd"]:
        await pg.evaluate(f"(()=>{{ const b=document.querySelector('.px-rail .pxr-thm button[data-theme=\"{th}\"]'); b && b.click(); }})()"); await pg.wait_for_timeout(300)
        await go(pg, "foreman"); await pg.keyboard.press("]"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, f"t_{th}_foreman_folded.png"))
        await pg.keyboard.press("]"); await go(pg, "parts"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, f"t_{th}_parts_group.png"), clip={"x": 230, "y": 0, "width": 420, "height": 900})
    print("ERRORS", errs[:6]); ok(not errs, "desktop: no console errors")
    await b.close()
async def phone(p):
    print("— phone")
    b, ctx, pg, errs = await setup(p, 390, 844, True)
    await pg.evaluate("localStorage.setItem('parsec.lf', JSON.stringify({ l: { parts: 1, triage: 1 }, g: {} }))")
    await pg.reload(); await pg.wait_for_timeout(1300); await pg.evaluate("__tg.loadSample25()")
    await go(pg, "parts")
    a = await pg.evaluate(f"(()=>{{ const l={LIST}; if(!l) return null; const b=l.querySelector('.lf-b'); return [l.classList.contains('lf-fold'), b ? getComputedStyle(b).display : 'none', Math.round(l.getBoundingClientRect().width)]; }})()")
    ok(a and not a[0] and a[1] == "none" and a[2] > 300, f"phone: no list fold, even one saved on the computer ({a})")
    await pg.evaluate("(()=>{ const LF=JSON.parse(localStorage.getItem('parsec.lf')); })()")
    g = await pg.evaluate("(()=>{ const L=[...document.querySelectorAll('#app .tg-grp.lf-g')]; const g=L.find(x=>x.nextElementSibling && x.nextElementSibling.classList.contains('tg-it')); if(!g) return null; g.click(); return g.getAttribute('data-lf-g'); })()"); await pg.wait_for_timeout(250)
    sh = await pg.evaluate("(()=>{ const g=document.querySelector('#app .tg-grp.lf-shut'); return [!!g, document.querySelectorAll('#app .lf-gone').length]; })()")
    ok(g and sh[0] and sh[1] > 0, f"phone: the groups fold ({g}: {sh[1]} rows hidden)")
    await pg.screenshot(path=os.path.join(OUT, "p1_parts_group.png"))
    print("ERRORS", errs[:6]); ok(not errs, "phone: no console errors")
    await b.close()
async def main():
    async with async_playwright() as p:
        await desktop(p)
        await phone(p)
    print("FAILS", len(FAILS), FAILS)
asyncio.run(main())
