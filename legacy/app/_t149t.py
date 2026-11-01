# Parsec 14.9 (A) — the one tooltip: 400 ms then at once between neighbours, Ink with an arrow, flips at the edge, Graphite, a disabled
# button, cut-off text, Tab focus, touch press-and-hold + the ⓘ, All · Fewer · Off, the title put back on leave, the RO page's shadow root.
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots149t"); os.makedirs(OUT, exist_ok=True)
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12_t.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
TIP = "(()=>{ const d=document.getElementById('ptip'); if(!d) return null; const r=d.getBoundingClientRect(); return { on: d.classList.contains('on'), up: d.classList.contains('up'), text: d.innerText, l: r.left, r: r.right, t: r.top, b: r.bottom, ax: parseFloat(d.style.getPropertyValue('--ax')), bg: getComputedStyle(d).backgroundColor, kbd: d.querySelectorAll('kbd').length }; })()"
# a test strip of controls, right in the page: icon buttons side by side, a labelled one, a disabled one, a cut-off line, one at the right edge
STRIP = """(()=>{ const old=document.getElementById('t149'); if(old) old.remove(); const d=document.createElement('div'); d.id='t149';
  d.style.cssText='position:fixed;left:300px;top:300px;z-index:99990;display:flex;gap:6px;align-items:center;background:#fff;padding:6px;border-radius:8px';
  d.innerHTML='<button id="ib1" title="Copy RO number" style="width:30px;height:30px">⧉</button>'.replace('⧉','')+
   '<button id="ib2" title="Search ROs" data-tip-k="/" style="width:30px;height:30px"></button>'+
   '<button id="lb1" title="Opens the parts desk for this RO" style="height:30px">Parts desk</button>'+
   '<button id="dis" disabled title="Not yet — 2 things to fix|Thu no clock out · Wed no lunch" style="height:30px">Sign</button>'+
   '<span id="cut" style="display:inline-block;width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Check engine light - NOx sensor fault SPN 3226 FMI 2</span>'+
   '<button id="clk" title="Count a click" style="height:30px">Click me</button>';
  document.body.appendChild(d); window.__clk=0; d.querySelector('#clk').addEventListener('click',()=>{ window.__clk++; });
  const e=document.createElement('button'); e.id='edge'; e.title='At the right edge — the tip stays on screen'; e.style.cssText='position:fixed;right:2px;top:420px;width:26px;height:26px;z-index:99990'; document.body.appendChild(e);
  return true; })()"""
async def ctr(pg, sel):
    return await pg.evaluate(f"(()=>{{ const e=document.querySelector({json.dumps(sel)}); const r=e.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2, r.left, r.right, r.top, r.bottom]; }})()")
async def hover(pg, sel):
    c = await ctr(pg, sel); await pg.mouse.move(c[0], c[1], steps=2); return c
async def setup(p, w=1440, h=900, phone=False):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": w, "height": h}, is_mobile=phone, has_touch=phone)
    pg = await ctx.new_page(); pg.set_default_timeout(6000); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
    await pg.route("**/fonts.g*/**", lambda r: r.abort())
    if phone and w < 700: await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
    await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
    await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
    return b, ctx, pg, errs
async def desk(p):
    print("— desktop")
    b, ctx, pg, errs = await setup(p)
    await pg.evaluate(STRIP); await pg.mouse.move(5, 890)
    # 400 ms, then shown; the title is stashed and still reads the same
    await hover(pg, "#ib1"); await pg.wait_for_timeout(200)
    t = await pg.evaluate(TIP); ok(not t or not t["on"], "not yet at 200 ms")
    await pg.wait_for_timeout(330); t = await pg.evaluate(TIP)
    ok(t and t["on"] and "Copy RO number" in t["text"], f"shows after 400 ms ({t and t['text']})")
    st = await pg.evaluate("(()=>{ const e=document.getElementById('ib1'); return [e.getAttribute('title'), e.title, e.hasAttribute('title'), e.outerHTML.indexOf('data-ptt')>-1]; })()")
    ok(st[0] == "Copy RO number" and st[1] == "Copy RO number" and st[2] and st[3], f"the browser's box gets nothing, but title still reads the same ({st})")
    c = await ctr(pg, "#ib1")
    ok(t["t"] >= c[5] + 4 and abs(t["l"] + t["ax"] - c[0]) < 2, f"below the button, the arrow on its centre (tip top {t['t']:.0f} vs {c[5]:.0f}, arrow {t['l'] + t['ax']:.0f} vs {c[0]:.0f})")
    await pg.screenshot(path=os.path.join(OUT, "1_ink.png"), clip={"x": 220, "y": 270, "width": 560, "height": 110})
    # the neighbour: at once
    await hover(pg, "#ib2"); await pg.wait_for_timeout(90); t = await pg.evaluate(TIP)
    ok(t and t["on"] and "Search ROs" in t["text"] and t["kbd"] == 1, f"the neighbour shows at once, with its key chip ({t and t['text']!r}, kbd {t and t['kbd']})")
    # a labelled button: no key chips; a tip that repeats the label is dropped
    await hover(pg, "#lb1"); await pg.wait_for_timeout(90); t = await pg.evaluate(TIP)
    ok(t and t["on"] and "parts desk" in t["text"].lower() and t["kbd"] == 0, "a labelled button shows its tip, no key chips")
    # away: hidden, and the title is back as an attribute
    await pg.mouse.move(700, 700, steps=2); await pg.wait_for_timeout(250); t = await pg.evaluate(TIP)
    back = await pg.evaluate("(()=>{ const e=document.getElementById('lb1'); return e.outerHTML.indexOf('title=')>-1 && e.outerHTML.indexOf('data-ptt')<0; })()")
    ok(t and not t["on"] and back, "moving away hides it and puts the title back")
    # after a pause, the delay is back
    await pg.wait_for_timeout(400); await hover(pg, "#ib1"); await pg.wait_for_timeout(150); t = await pg.evaluate(TIP)
    ok(not t["on"], "after a pause the 400 ms delay comes back")
    await pg.wait_for_timeout(400)
    # a disabled button says why (two lines)
    await hover(pg, "#dis"); await pg.wait_for_timeout(120); t = await pg.evaluate(TIP)
    ok(t and t["on"] and "Not yet" in t["text"] and "no lunch" in t["text"], f"a disabled button shows its reason, title + detail ({t and t['text']!r})")
    # cut-off text in full
    await hover(pg, "#cut"); await pg.wait_for_timeout(120); t = await pg.evaluate(TIP)
    ok(t and t["on"] and "SPN 3226 FMI 2" in t["text"], "cut-off text shows in full")
    # a click hides it and it doesn't come back while the pointer rests
    await hover(pg, "#clk"); await pg.wait_for_timeout(500); await pg.mouse.down(); await pg.mouse.up(); await pg.wait_for_timeout(600); t = await pg.evaluate(TIP)
    ok(not t["on"] and await pg.evaluate("window.__clk") == 1, "a click goes through, hides the tip, and it stays hidden")
    # the right edge: flipped/clamped, the arrow still on the button
    await pg.mouse.move(700, 700); await pg.wait_for_timeout(400)
    c = await hover(pg, "#edge"); await pg.wait_for_timeout(520); t = await pg.evaluate(TIP)
    ok(t and t["on"] and t["r"] <= 1440 - 7 and abs(t["l"] + t["ax"] - c[0]) < 13, f"at the right edge it stays on screen (right {t and t['r']:.0f}), arrow toward the button")
    await pg.screenshot(path=os.path.join(OUT, "2_edge.png"), clip={"x": 1100, "y": 380, "width": 340, "height": 120})
    # Graphite: light on dark
    await pg.evaluate("__tg.applyTheme('ivd')"); await pg.mouse.move(700, 700); await pg.wait_for_timeout(400)
    await hover(pg, "#dis"); await pg.wait_for_timeout(520); t = await pg.evaluate(TIP)
    ok(t and t["on"] and t["bg"].replace(" ", "") in ("rgb(237,235,230)",), f"Graphite: a light tip on the dark page ({t and t['bg']})")
    await pg.screenshot(path=os.path.join(OUT, "3_graphite.png"), clip={"x": 220, "y": 270, "width": 560, "height": 130})
    await pg.evaluate("__tg.applyTheme('ivl')")
    # Tab focus
    await pg.mouse.move(700, 700); await pg.wait_for_timeout(400)
    await pg.keyboard.press("Shift"); await pg.evaluate("document.getElementById('ib2').focus()"); await pg.wait_for_timeout(520); t = await pg.evaluate(TIP)
    ok(t and t["on"] and "Search ROs" in t["text"], "Tab focus shows the tip")
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200); t = await pg.evaluate(TIP)
    ok(not t["on"], "Esc hides it")
    await pg.evaluate("document.activeElement && document.activeElement.blur()")
    # the person menu: Tooltips · All · Fewer · Off
    await pg.evaluate("(()=>{ __tg.UI().pxPop='me'; __tg.render(); })()"); await pg.wait_for_timeout(400)
    row = await pg.evaluate("(document.querySelector('.ptip-set')||{}).innerText||''")
    ok("Tooltips" in row and "Fewer" in row, f"the person menu has Tooltips · All · Fewer · Off ({row!r})")
    await pg.screenshot(path=os.path.join(OUT, "4_menu.png"))
    if row:
        await pg.click(".ptip-set [data-ptm=fewer]"); await pg.wait_for_timeout(250)
    md = await pg.evaluate("__tg.ptipMode()")
    still = await pg.evaluate("!!document.querySelector('.ptip-set')")
    ok(md == "fewer" and still, f"Fewer is picked and the menu stays open ({md})")
    await pg.evaluate("(()=>{ __tg.UI().pxPop=null; __tg.render(); })()"); await pg.evaluate(STRIP); await pg.mouse.move(700, 700); await pg.wait_for_timeout(400)
    await hover(pg, "#lb1"); await pg.wait_for_timeout(520); a = await pg.evaluate(TIP)
    await hover(pg, "#ib2"); await pg.wait_for_timeout(520); b2 = await pg.evaluate(TIP)
    await hover(pg, "#ib1"); await pg.wait_for_timeout(520); c2 = await pg.evaluate(TIP)
    await hover(pg, "#dis"); await pg.wait_for_timeout(520); d2 = await pg.evaluate(TIP)
    ok((not a or not a["on"]) and b2 and b2["on"] and not c2["on"] and d2["on"], f"Fewer: only key chips on icon buttons, disabled reasons (no plain tips) {[bool(a and a['on']), bool(b2 and b2['on']), c2['on'], d2['on']]}")
    await pg.evaluate("__tg.ptipSetMode('off')"); await pg.mouse.move(700, 700); await pg.wait_for_timeout(400)
    await hover(pg, "#dis"); await pg.wait_for_timeout(560); t = await pg.evaluate(TIP)
    nat = await pg.evaluate("document.getElementById('dis').outerHTML.indexOf('data-ptt')>-1")
    ok((not t or not t["on"]) and nat, "Off: nothing shows (and the browser's box stays quiet too)")
    await pg.evaluate("__tg.ptipSetMode('all')")
    # inside the RO page (shadow root)
    await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>=2); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); })()"); await pg.wait_for_timeout(1200)
    sel = await pg.evaluate("""(()=>{ const h=document.querySelector('.jc-host:not(.jc-band-host)'); if(!h||!h.shadowRoot) return null; const L=[...h.shadowRoot.querySelectorAll('[title]')].filter(e=>{ const r=e.getBoundingClientRect(); return r.width>8 && r.height>8 && r.top>60 && r.bottom<860 && r.left>0 && r.right<1430; });
      const e=L[0]; if(!e) return null; e.setAttribute('data-t149','1'); const r=e.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2, e.getAttribute('title')]; })()""")
    if sel:
        await pg.mouse.move(700, 880); await pg.wait_for_timeout(400); await pg.mouse.move(sel[0], sel[1], steps=2); await pg.wait_for_timeout(560); t = await pg.evaluate(TIP)
        rd = await pg.evaluate("(()=>{ const e=document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot.querySelector('[data-t149]'); return e ? e.getAttribute('title') : null; })()")
        ok(t and t["on"] and rd == sel[2], f"inside the RO page: the tip shows ({t and t['text'][:50]!r}), title reads the same")
        await pg.screenshot(path=os.path.join(OUT, "5_ropage.png"))
    else: ok(False, "found a titled control inside the RO page")
    ok(not errs, "desktop: no page errors " + " | ".join(errs[:3]))
    await b.close()
async def phone(p):
    print("— touch")
    b, ctx, pg, errs = await setup(p, 1024, 768, phone=True)   # a tablet: touch, the computer layout
    await pg.evaluate("localStorage.removeItem('tec_device')")
    await pg.evaluate(STRIP.replace("left:300px;top:300px", "left:8px;top:300px").replace("right:2px;top:420px", "right:2px;top:520px"))
    cdp = await ctx.new_cdp_session(pg)
    c = await ctr(pg, "#clk")
    await cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": c[0], "y": c[1]}]}); await pg.wait_for_timeout(750)
    t = await pg.evaluate(TIP)
    await cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []}); await pg.wait_for_timeout(300)
    ok(t and t["on"] and "Count a click" in t["text"], f"press and hold shows the tip ({t and t['text']!r})")
    ok(await pg.evaluate("window.__clk") == 0, "and the hold isn't a tap (no click)")
    await pg.touchscreen.tap(c[0], c[1]); await pg.wait_for_timeout(300)
    ok(await pg.evaluate("window.__clk") == 1, "a plain tap still clicks")
    # the ⓘ: the Time Log's day numbers
    await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='timelog'; __tg.render(); })()"); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const r=document.querySelector('[data-pg=timelog] .tk-sr[data-t]'); if(r) r.click(); })()"); await pg.wait_for_timeout(900)
    n = await pg.evaluate("document.querySelectorAll('.tk-stat .ptip-i').length")
    ok(n >= 4, f"the Time Log's numbers have an ⓘ on a touch screen ({n})")
    if n:
        await pg.evaluate("(()=>{ const i=document.querySelector('.tk-stat .ptip-i'); i.scrollIntoView({block:'center'}); })()"); await pg.wait_for_timeout(300)
        ic = await pg.evaluate("(()=>{ const r=document.querySelector('.tk-stat .ptip-i').getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; })()")
        await pg.touchscreen.tap(ic[0], ic[1]); await pg.wait_for_timeout(250); t = await pg.evaluate(TIP)
        ok(t and t["on"] and ("Clocked" in t["text"] or "On jobs" in t["text"]), f"tapping the ⓘ shows what the number means ({t and t['text']!r})")
        await pg.screenshot(path=os.path.join(OUT, "6_phone_info.png"))
        await pg.touchscreen.tap(ic[0], ic[1]); await pg.wait_for_timeout(250); t = await pg.evaluate(TIP)
        ok(not t["on"], "tapping it again hides it")
    ok(not errs, "touch: no page errors " + " | ".join(errs[:3]))
    await b.close()
async def main():
    async with async_playwright() as p:
        await desk(p); await phone(p)
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
