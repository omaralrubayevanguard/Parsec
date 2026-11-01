# Parsec 14.4 — the site map: every page and view, screenshotted, with its sections and components found and boxed (→ map144/data.json)
import asyncio, os, sys, json, io, base64, re
from PIL import Image
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
MAP = os.path.join(os.path.dirname(H), "map144"); os.makedirs(MAP, exist_ok=True)
W, HH = 1440, 1000

# the frame every tg- page shares: (label, kind, selector, how to find it — css / text)
TG = [("Page header", "frame", "header.tg-head"), ("Facts", "comp", ".tg-head .tg-facts"), ("View tabs", "comp", ".tg-head .tg-views"),
      ("Search", "comp", ".tg-head .psm-b, .tg-head .tg-srch-b"), ("Needs action list", "frame", "section.tg-list"), ("List heading", "comp", "section.tg-list .tg-lh"),
      ("A group", "comp", "section.tg-list .tg-grp"), ("The picked item", "comp", "section.tg-list .tg-it.on"), ("Folded groups", "comp", "section.tg-list .tg-sec"),
      ("Keys bar", "comp", ".tg-keys"), ("Pane", "frame", ".tg-main"), ("Pane header", "comp", ".tg-main .tg-top"), ("Next card", "comp", ".tg-main .tg-next, .tg-main .rl-next")]
SIDE = [("Sidebar", "frame", "#pg-side, nav.side, .px-side, aside.side, .sidebar, nav")]
RO = [("Top bar", "frame", ".rop-r > :first-child"), ("Operations", "sec", "[data-fold=ops]"), ("An operation row", "comp", ".rop-orow.is-on, .rop-orow"),
      ("Clock card", "comp", ".ock"), ("Time · Parts · Files", "comp", ".px-optabs"), ("Messages about this RO", "sec", "[data-fold=c-inbox]"),
      ("Fault codes", "sec", "[data-fold=c-dtc]"), ("Photos & codes", "sec", "[data-fold=c-photos]"), ("Parts on this RO", "sec", "[data-fold=c-parts]"),
      ("Truck history", "sec", "[data-fold=c-history]"), ("Warranty claim", "sec", "[data-fold=c-warranty]"), ("Customer", "sec", "[data-fold=c-customer]"),
      ("Estimate & approval", "sec", "[data-fold=c-estimate]"), ("Ready to close", "sec", "[data-fold=c-ready]"),
      ("Truck card", "sec", ".rop-band"), ("Status", "comp", ".rop-band .px-status--button, .rop-band .pgst.m"), ("Road test switch", "comp", ".rop-band .rt-sw, .rop-band [class*=rtsw], .rop-band [class*=rt-tg]"),
      ("Stage", "sec", ".rop-stg"), ("Who has it", "sec", ".rop-top > section.rop-rblk:not(.rop-stg)"), ("Schedule", "sec", "[data-fold=g-schedule]"),
      ("People", "sec", "[data-fold=g-people]"), ("Vehicle", "sec", "[data-fold=g-vehicle]"), ("Money", "sec", "[data-fold=g-money]"), ("Fold button", "comp", ".rop-fb")]
LOGIN = [("Brand and time", "frame", ".lg-brand"), ("The shop", "comp", ".lg-shop"), ("Time and date", "comp", ".lg-time"), ("Clocks that are running", "comp", ".lg-clks"),
         ("Who’s signing in", "frame", ".lg-main"), ("A department", "comp", ".lg-gl"), ("A name tile", "comp", ".lg-t")]
ADMIN = [("People list", "frame", ".adm-list"), ("Person or role pane", "frame", ".adm-pane"), ("Add a person", "comp", ".tg-head .btn-primary")]
RL = [("The RO list, here", "frame", ".rq-emb"), ("RO list tabs", "comp", ".rq-emb .rq-seg"), ("Display", "comp", ".rq-emb [data-p=disp]"), ("Column headers", "comp", ".rq-emb .rq-head"),
      ("A row", "comp", ".rq-emb .rq-rows .rq-row"), ("Next step", "comp", ".rq-emb .rq-nx")]
PHONE = [("Bottom tabs", "frame", "nav.pm-tabs"), ("RO list tabs", "comp", ".rq-seg"), ("An RO card", "comp", ".rq-rows .rq-row, .rq-rows > *"), ("Page header", "frame", "header.tg-head"),
         ("Needs action list", "frame", "section.tg-list"), ("The picked item", "comp", ".tg-it")]
AUTO = r"""((root, scope, max)=>{ const R=root||document, top=R.querySelector(scope)||R, out=[];
  const vis=e=>{ const r=e.getBoundingClientRect(); return r.width>40 && r.height>10 && r.bottom>60 && r.top<__H-10 && getComputedStyle(e).visibility!=='hidden'; };
  const heads=[...top.querySelectorAll('h2,h3,h4,[class*="-sec"]:not(section):not([class*="-secs"]),[class*="-ch"]>b,[class*="-lh"],[class*="sech"],[class*="-trh"]>b,[class*="__h"],[class*="-hd"]')].filter(vis);
  heads.forEach(h=>{ let t=(h.innerText||'').split('\n')[0].trim().replace(/\s+/g,' '); if(!t||t.length<3||t.length>48||/^\d/.test(t)||/^RO[- ]?\d|\d{4,}/.test(t)||t==='Parsec') return;
    let box=h.getBoundingClientRect(), p=h.parentElement; const pr=p&&p.getBoundingClientRect();
    if(p && pr && pr.height<560 && pr.height>box.height+8 && p.children.length<=6 && pr.width<1300) box=pr;
    else { const n=h.nextElementSibling; if(n){ const nr=n.getBoundingClientRect(); if(nr.height<560 && nr.height>8){ const l=Math.min(box.left,nr.left), tp=Math.min(box.top,nr.top); box={left:l, top:tp, width:Math.max(box.right,nr.right)-l, height:Math.max(box.bottom,nr.bottom)-tp}; } } }
    out.push({ label:t, x:box.left, y:box.top, w:box.width, h:box.height }); });
  return out.slice(0, max); })"""
FIND = r"""((root, sel)=>{ const R=root||document; let e=null; try{ e=[...R.querySelectorAll(sel)].find(x=>{ const r=x.getBoundingClientRect(); return r.width>8 && r.height>8 && r.bottom>0 && r.top<__H; }); }catch(err){} if(!e) return null; const r=e.getBoundingClientRect(); return { x:r.left, y:r.top, w:r.width, h:r.height }; })"""

async def boxes(pg, spec, jc=False):
    out = []
    for lab, kind, sel in spec:
        js = (f"(()=>{{ const __H={HH}; const R=document.querySelector('.jc-host:not(.jc-band-host)'); return ({FIND})(R && R.shadowRoot, {json.dumps(sel)}); }})()" if jc
              else f"(()=>{{ const __H={HH}; return ({FIND})(document, {json.dumps(sel)}); }})()")
        r = await pg.evaluate(js)
        if r: out.append(dict(label=lab, kind=kind, **r))
    return out
async def auto(pg, scope, jc=False, mx=14):
    js = (f"(()=>{{ const __H={HH}; const R=document.querySelector('.jc-host:not(.jc-band-host)'); return ({AUTO})(R && R.shadowRoot, {json.dumps(scope)}, {mx}); }})()" if jc
          else f"(()=>{{ const __H={HH}; return ({AUTO})(document, {json.dumps(scope)}, {mx}); }})()")
    return [dict(c, kind="sec") for c in (await pg.evaluate(js) or [])]
def dedupe(L):
    keep = []
    def ov(a, b):
        ix = max(0, min(a["x"] + a["w"], b["x"] + b["w"]) - max(a["x"], b["x"])); iy = max(0, min(a["y"] + a["h"], b["y"] + b["h"]) - max(a["y"], b["y"]))
        return ix * iy / max(1, max(a["w"] * a["h"], b["w"] * b["h"]))   # the same box twice — a box inside another stays
    for c in L:
        if c["w"] < 12 or c["h"] < 10: continue
        if any(ov(c, k) > .85 and (c["kind"] == k["kind"] or c["label"].lower() == k["label"].lower()) for k in keep): continue
        if any(c["label"].lower() == k["label"].lower() and abs(c["y"] - k["y"]) < 30 for k in keep): continue
        keep.append(c)
    return keep
async def shot(pg, phone=False):
    b = await pg.screenshot(type="png")
    im = Image.open(io.BytesIO(b)).convert("RGB"); w0 = im.width
    tw = 360 if phone else 1200; im = im.resize((tw, round(im.height * tw / w0)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "WEBP", quality=72, method=5)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode(), w0, tw / w0
async def go(pg, view):
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='{view}'; U.modal=null; __tg.render(); }})()"); await pg.wait_for_timeout(900)
async def tab(pg, label):
    await pg.evaluate(f"""(()=>{{ const b=[...document.querySelectorAll('.tg-head .tg-views button, .tg-views button')].find(x=>x.innerText.trim().replace(/\\s*\\d+$/,'').trim().toLowerCase().startsWith({json.dumps(label.lower())})); if(b) b.click(); }})()"""); await pg.wait_for_timeout(900)

SCREENS = []
async def cap(pg, page, view, spec=(), jc=False, scope=".main", phone=False, extra=None):
    img, w0, k = await shot(pg, phone)
    C = await boxes(pg, SIDE) if not phone and page != "Sign in" else []
    C += await boxes(pg, spec, jc)
    if any(c["label"] == "Needs action list" for c in C):   # the list is named by its own heading
        lh = await pg.evaluate("(()=>{ const h=document.querySelector('section.tg-list .tg-lh'); return h ? (h.innerText||'').split('\\n')[0].trim() : ''; })()")
        lh = re.sub(r"[\d\s]+$", "", lh or "").strip()
        for c in C:
            if c["label"] == "Needs action list" and lh and not lh.lower().startswith("needs action"): c["label"] = lh + " (the list)"
    if any(c["label"] in ("Needs action list",) for c in C) and page in ("Assets", "Career", "Technician"): pass
    C += await auto(pg, scope, jc)
    if extra: C += await boxes(pg, extra)
    C = dedupe(C)
    for c in C:
        for f in ("x", "y", "w", "h"): c[f] = round(c[f] * k, 1)
    SCREENS.append(dict(page=page, view=view, img=img, w=round(w0 * k), h=round((HH if not phone else 844) * k), phone=phone, callouts=C))
    print(f"  {page} · {view}: {len(C)} callouts")

async def main():
    global HH
    async with async_playwright() as p:
        b, pg, errs = await setup(p, W, HH)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); localStorage.removeItem('rop_fold'); __tg.pxSignedIn(); __tg.render(); })()"); await pg.wait_for_timeout(600)
        # sign in
        try:
            await pg.evaluate("__tg.pxLogout()"); await pg.wait_for_timeout(900)
            await cap(pg, "Sign in", "Who’s signing in?", LOGIN, scope="body")
            await pg.evaluate("(()=>{ localStorage.removeItem('tec_out'); localStorage.removeItem('tec_locked'); __tg.pxSignedIn(); __tg.render(); })()"); await pg.wait_for_timeout(700)
        except Exception as e: print("login skipped", e)
        # Career, Time Log
        await go(pg, "career")
        for v in ["Overview", "Work", "Growth"]: await tab(pg, v); await cap(pg, "Career", v, TG)
        await go(pg, "timelog")
        for v in ["Day", "Week", "Timesheet", "Shop"]: await tab(pg, v); await cap(pg, "Time Log", v, TG)
        # RO list
        await go(pg, "rolist"); await cap(pg, "RO List", "The list", [("Tabs", "comp", "[data-pg=rolist] .rq-seg"), ("Search", "comp", "[data-pg=rolist] .psm-b"), ("Display", "comp", "[data-pg=rolist] [data-p=disp]"),
              ("Column headers", "comp", "[data-pg=rolist] .rq-head"), ("Shop time row", "comp", "[data-pg=rolist] .rq-shop"), ("A row", "comp", "[data-pg=rolist] .rq-rows .rq-row"), ("Next step", "comp", "[data-pg=rolist] .rq-nx"), ("New RO", "comp", "[data-pg=rolist] .btn-primary")])
        await pg.evaluate("(()=>{ const r=document.querySelector('[data-pg=rolist] .rq-rows .rq-row'); r && r.click(); })()"); await pg.wait_for_timeout(800)
        await cap(pg, "RO List", "The side pane", [("Side pane", "frame", "[data-pg=rolist] .rq-peek"), ("Truck words", "comp", "[data-pg=rolist] .rq-peek h2"), ("Status", "comp", "[data-pg=rolist] .rq-peek .pgst"),
              ("Next card", "comp", "[data-pg=rolist] .rq-next"), ("Totals", "comp", "[data-pg=rolist] .rq-tots"), ("Operations", "comp", "[data-pg=rolist] .rq-pops"), ("RO details", "comp", "[data-pg=rolist] .rod")])
        await pg.evaluate("(()=>{ const b=document.querySelector('[data-pg=rolist] [data-p=disp]'); b && b.click(); })()"); await pg.wait_for_timeout(500)
        await cap(pg, "RO List", "Display", [("Display menu", "frame", "[data-pg=rolist] .rq-disp, .rq-disp"), ("Columns", "comp", ".rq-colist"), ("Add a column", "comp", ".rq-addc"), ("Your own columns", "comp", ".rq-cflist, .rq-cfnew")])
        await pg.keyboard.press("Escape")
        # the RO page
        rid = await pg.evaluate("(()=>{ const r=__tg.STATE().ros.find(r=>!r.shop && !r.dateClosed && r.operations.length>=2 && r.operations.some(o=>(o.parts||[]).length)); const U=__tg.UI(); U.view='ros'; U.selectedRo=r.id; __tg.render(); return r.id; })()"); await pg.wait_for_timeout(1300)
        await cap(pg, "RO page", "Top of the page", RO, jc=True, scope=".pxr")
        await pg.evaluate("(()=>{ const R=document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot; const m=R.querySelector('.px-ro__main'); if(m) m.scrollTop=1100; const p=R.querySelector('.px-ro'); if(p) p.scrollTop=1100; })()"); await pg.wait_for_timeout(500)
        await cap(pg, "RO page", "Further down", RO, jc=True, scope=".pxr")
        # Technician
        await go(pg, "tech"); await pg.wait_for_timeout(600)
        await cap(pg, "Technician", "My ROs", TG + [("The RO page, here", "frame", ".tch-ro-mount, [data-pg=tech] .jc-host"), ("Sent to you", "comp", "[data-pg=tech] .tg-grp")])
        for v in ["Yard", "ROs"]: await tab(pg, v); await cap(pg, "Technician", v, TG + (RL if v == "ROs" else []))
        # Triage, Foreman, Parts, Warranty, Manager
        for page, view, tabs in [("Triage", "triage", ["Inbox", "Desk", "Yard", "ROs"]), ("Foreman", "foreman", ["Floor", "Techs", "Yard", "Tomorrow", "ROs"]),
                                 ("Parts", "parts", ["Desk", "On order", "Shelf", "Returns", "Catalog", "ROs"]), ("Warranty", "warranty", ["Claims", "Board", "Money", "Parts"]),
                                 ("Manager", "manager", ["Overview", "KPIs", "Fleets", "Flow", "Team", "Activity", "ROs"])]:
            await go(pg, view)
            for v in tabs: await tab(pg, v); await cap(pg, page, v, TG + (RL if v == "ROs" else []))
        for page, view in [("Fixes", "fixes"), ("Assets", "assets"), ("Inventory", "inventory"), ("Admin", "admin")]:
            await go(pg, view); await cap(pg, page, "The page", TG + (ADMIN if view == "admin" else []) + [("Truck header", "comp", "[data-pg=assets] .ast-hd, [data-pg=assets] .tg-top")], scope=".adm-pane" if view == "admin" else ".main")
        # the search windows
        await go(pg, "triage"); await pg.evaluate("(()=>{ const b=document.querySelector('.tg-head .psm-b'); b && b.click(); })()"); await pg.wait_for_timeout(500)
        try: await cap(pg, "Search", "A page’s search window", [("Search window", "frame", ".psm-c"), ("What you type", "comp", ".psm-in, .psm-h"), ("Matches", "comp", ".psm-res, .psm-r")], scope="body")
        except Exception as e: print("psm", e)
        await pg.keyboard.press("Escape"); await pg.keyboard.press("Control+k"); await pg.wait_for_timeout(600)
        await cap(pg, "Search", "Ctrl K — everything", [("Ctrl K — search everything", "frame", "[role=dialog], .cmdk, .pal, #pg-search, .px-search, .srch")], scope="body"); await pg.keyboard.press("Escape")
        # phone
        await pg.set_viewport_size({"width": 390, "height": 844}); await pg.evaluate("(()=>{ __tg.render(); })()"); await pg.wait_for_timeout(600)
        HH = 844
        for page, view, js in [("Phone", "RO list", "U.view='rolist'"), ("Phone", "Technician", "U.view='tech'"), ("Phone", "RO page", f"U.view='ros'; U.selectedRo='{rid}'"), ("Phone", "Triage", "U.view='triage'")]:
            await pg.evaluate(f"(()=>{{ const U=__tg.UI(); {js}; __tg.render(); }})()"); await pg.wait_for_timeout(900)
            spec = RO if view == "RO page" else [PHONE[0], PHONE[1], PHONE[2]] if view == "RO list" else [PHONE[0], PHONE[3], PHONE[4], PHONE[5]]
            await cap(pg, page, view, spec, jc=(view == "RO page"), scope=".pxr" if view == "RO page" else "body", phone=True)
        print("ERRORS", errs[:4])
        await b.close()
    json.dump(SCREENS, open(os.path.join(MAP, "data.json"), "w"))
    print("screens", len(SCREENS), "MB", round(sum(len(s["img"]) for s in SCREENS) / 1e6, 2))
asyncio.run(main())
