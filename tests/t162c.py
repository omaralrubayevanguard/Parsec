# Parsec 16.2 (C) — one Settings page for everything. The registry holds every setting from the nine old places exactly once;
# a change made on the new page does what the old place did (labor rate, pay period, size, tooltips, theme, a permission);
# dots, Reset and Reset group; search over labels, help and values that jumps and lights the row for 2 s; Recently changed with
# Undo (only what that change changed); read-only rows for a technician; the person pop-over's three settings + All settings…;
# the old places now link in; the phone layout; light and dark screenshots.
import asyncio, os, sys, json, re
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_c.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots162c"); os.makedirs(OUT, exist_ok=True)
REAL = os.path.join(H, PAGE.replace("t12", "Parsec_12", 1))
OLD = {   # where each setting used to be → its registry id
  "Profile & settings": ["me.photo", "me.name", "me.account", "me.logoutEod", "me.theme", "me.size", "me.screen", "me.ribbon", "data.folder", "data.backups", "data.bkEod", "data.copies",
                         "data.server", "data.trucks", "data.phone", "auto.page", "keys.ref", "people.viewAs", "shop.rate", "data.dev", "data.sample"],
  "the person pop-over": ["me.size", "me.tips", "me.theme", "data.backups", "keys.ref"],
  "the app menu": ["me.size", "data.folder", "data.copies", "me.ribbon", "people.viewAs", "auto.page", "keys.ref", "me.screen", "data.dev", "me.theme"],
  "Automations": ["auto.page", "auto.mode", "auto.status", "auto.parts", "auto.rules"],
  "Manager › Shop settings": ["shop.rate", "shop.pay", "shop.ovh", "people.adminPin", "data.folder"],
  "Manager › Stage rules": ["shop.rules", "shop.goals", "shop.accept"],
  "Foreman settings": ["shop.dayStart", "shop.dayEnd", "shop.lunch", "shop.qc", "shop.badge", "shop.bays"],
  "Warranty settings": ["shop.wa.file", "shop.wa.resub", "shop.wa.keep", "shop.wa.pa", "shop.wa.wo", "shop.waCov", "shop.wa.shelves", "shop.wa.dealer", "shop.wa.ask", "shop.wa.ts", "shop.wa.pre", "shop.wa.claim", "shop.wa.paid"],
  "Parts setup": ["shop.pt.sup_pdc", "shop.pt.sup_vor", "shop.pt.sup_fp", "shop.pt.del_pdc", "shop.pt.del_rcv", "shop.pt.bin_a", "shop.pt.bin_w", "shop.pt.bin_k", "shop.pt.bin_r",
                  "shop.pt.ret_hold", "shop.pt.ret_core", "shop.pt.ret_fee", "shop.pt.ret_cr", "shop.rules"],
  "Admin": ["people.adminPin", "people.idle", "people.eod", "people.roles", "people.each"],
  "Edit templates": ["shop.tpl", "shop.tgName", "shop.tgPhone"],
}
GO = lambda g: f"(()=>{{ const U=__tg.UI(); if(U.view!=='profile'){{ U.pxPrev=U.view; U.view='profile'; }} U.pxSec='{g}'; U.sgQ=''; __tg.render(); }})()"
ROW = lambda i: "#sg-r-" + i.replace(".", "-")
def SIGNIN(sid): return f"(()=>{{ localStorage.setItem('tec_viewas', '{sid}'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); }})()"
ADMIN = "(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.render(); })()"
async def click(pg, sel):
    n = await pg.evaluate(f"(()=>{{ const b=document.querySelector({json.dumps(sel)}); if(!b) return false; b.click(); return true; }})()"); await pg.wait_for_timeout(250); return n
async def typein(pg, sel, v):
    return await pg.evaluate(f"(()=>{{ const i=document.querySelector({json.dumps(sel)}); if(!i) return false; i.value={json.dumps(v)}; i.dispatchEvent(new Event('change', {{bubbles:true}})); return true; }})()")
async def main():
    src = open(REAL, encoding="utf-8").read()
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        # ---------------------------------------------------------------- the registry
        reg = await pg.evaluate("__tg.SG_REG.map(e=>({id:e.id, g:e.g, kind:e.kind, label:e.label, who:e.who, where:e.where, get: typeof e.get==='function', def: e.def!==undefined}))")
        ids = [e["id"] for e in reg]
        ok(len(ids) == len(set(ids)), f"every registry id is there once ({len(ids)} rows, {len(set(ids))} ids)")
        per = {}
        for e in reg: per[e["g"]] = per.get(e["g"], 0) + 1
        print("     registry per group:", per)
        for place, L in OLD.items():
            miss = [i for i in L if i not in ids]
            ok(not miss, f"{place}: {len(L)} settings, each in the registry once — {', '.join(L)}{' — missing ' + str(miss) if miss else ''}")
        allold = sorted(set(sum(OLD.values(), [])))
        ok(all(ids.count(i) == 1 for i in allold), f"all {len(allold)} old settings are in the registry exactly once")
        ok(all(e["who"] and e["where"] for e in reg), "every row says who can change it and where it shows")
        ok(all(e["get"] and e["def"] for e in reg if e["kind"] in ("seg", "sw", "num", "text", "sel")), "every plain setting has get / set and a default")
        # ---------------------------------------------------------------- same effect as before
        await pg.evaluate(GO("shop")); await pg.wait_for_timeout(400)
        pre = await pg.evaluate("__tg.SG_REG.filter(e=>__tg.sgChanged(e)).map(e=>e.id)")
        print("     changed from the default before the test:", pre)
        await pg.evaluate("(()=>{ __tg.SG_REG.filter(e=>__tg.sgChanged(e) && !e.noReset).forEach(e=>{ try{ e.set(__tg.sgDef(e)); }catch(x){} }); __tg.STATE().setLog=[]; __tg.render(); })()"); await pg.wait_for_timeout(300)
        await typein(pg, ROW("shop.rate") + " input", "225"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("({ rate: __tg.laborRate(), st: __tg.STATE().laborRate })")
        ok(r == {"rate": 225, "st": 225}, f"Labor rate typed on the page: laborRate() and STATE.laborRate are 225 ({r})")
        await pg.evaluate("(()=>{ const P=__tg.PG.shop().payPer; P.kind='biweekly'; P.anchor='2026-01-05'; })()")
        await pg.evaluate(f"(()=>{{ const s=document.querySelector('{ROW('shop.pay')} select'); s.value='monthly'; s.dispatchEvent(new Event('change', {{bubbles:true}})); }})()"); await pg.wait_for_timeout(400)
        pp = await pg.evaluate("JSON.stringify(__tg.PG.shop().payPer)")
        td = await pg.evaluate("__tg.todayStr()")
        ok(json.loads(pp) == {"kind": "monthly", "anchor": td[:8] + "01"}, f"Pay period → Monthly, starting the 1st, as Manager → Settings did ({pp})")
        await pg.evaluate(GO("me")); await pg.wait_for_timeout(300)
        await click(pg, ROW("me.size") + ' [data-v="large"]'); await pg.wait_for_timeout(300)
        sz = await pg.evaluate("({ m: __tg.sizeMode(), ui: __tg.UI().size, saved: (localStorage.getItem('tec_ui')||localStorage.getItem('tec_ui_v1')||'').indexOf('large')>-1 || Object.keys(localStorage).some(k=>/ui/i.test(k) && (localStorage.getItem(k)||'').indexOf('\"size\":\"large\"')>-1) })")
        ok(sz["m"] == "large" and sz["ui"] == "large", f"Size → Large: sizeMode() is large ({sz})")
        await click(pg, ROW("me.tips") + ' [data-v="fewer"]')
        tp = await pg.evaluate("({ m: __tg.ptipMode(), ls: localStorage.getItem('ptip_mode:admin') })")
        ok(tp == {"m": "fewer", "ls": "fewer"}, f"Tooltips → Fewer, saved for the person as before ({tp})")
        await click(pg, ROW("me.theme") + ' [data-v="ivd"]'); await pg.wait_for_timeout(300)
        th = await pg.evaluate("({ t: document.documentElement.getAttribute('data-theme'), ls: localStorage.getItem('tec_theme') })")
        ok(th == {"t": "ivd", "ls": "ivd"}, f"Theme → Graphite: the page turns dark and it's saved on this computer ({th})")
        await pg.screenshot(path=os.path.join(OUT, "c1_me_dark.png"))
        await click(pg, ROW("me.theme") + ' [data-v="ivl"]'); await click(pg, ROW("me.size") + ' [data-v="normal"]'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "c2_me_light.png"))
        await pg.evaluate(GO("people")); await pg.wait_for_timeout(400)
        await click(pg, '[data-action="px-sg-op"][data-id="people.roles"][data-op="Technician|acts|t.editall"]')
        pr = await pg.evaluate("(()=>{ const t=__tg.staffList().filter(s=>s.role==='Technician')[0]; return { role: !!__tg.permRole('Technician').acts['t.editall'], tech: __tg.permHas(t,'acts','t.editall') }; })()")
        ok(pr == {"role": True, "tech": True}, f"a permission: Technicians can fix anyone’s punches now, through the role (permRole + permHas) ({pr})")
        tA = await pg.evaluate("__tg.staffList().filter(s=>s.role==='Technician')[0].id")
        await click(pg, f'.sg-plr[data-action="px-sg-person"][data-person="{tA}"]'); await pg.wait_for_timeout(300)   # 17.3: their page in Admin › People
        await click(pg, '[data-pg=admin] [data-a=ptab][data-v=acts]'); await click(pg, "[data-pg=admin] .adm-s3[data-k='p.order'][data-v=on]")
        pe = await pg.evaluate(f"(()=>{{ const t=__tg.staffList().filter(s=>s.id==='{tA}')[0]; return {{ has: __tg.permHas(t,'acts','p.order'), ov: t.ov.acts['p.order'] }}; }})()")
        ok(pe == {"has": True, "ov": True}, f"person by person: one technician can order parts, as a change for them alone ({pe})")
        await pg.screenshot(path=os.path.join(OUT, "c3_people.png"))
        # ---------------------------------------------------------------- dots, Reset, Reset group
        await pg.evaluate(GO("shop")); await pg.wait_for_timeout(400)
        d = await pg.evaluate(f"(()=>{{ const r=document.querySelector('{ROW('shop.rate')}'); return {{ chg: r.classList.contains('chg'), dot: !!r.querySelector('.sg-dot'), reset: !!r.querySelector('[data-action=px-sg-reset]'), menu: (document.querySelector('.px-it[data-s=shop] .sg-n')||{{}}).textContent || '' }}; }})()")
        ok(d["chg"] and d["dot"] and d["reset"] and d["menu"].strip() == "2", f"the labor rate has a dot and Reset; the menu counts 2 changed in The shop ({d})")
        clean = await pg.evaluate(f"!document.querySelector('{ROW('shop.ovh')}').classList.contains('chg') && !document.querySelector('{ROW('shop.ovh')} .sg-dot')")
        ok(clean, "a setting still at its default has no dot")
        await click(pg, ROW("shop.rate") + " [data-action=px-sg-reset]"); await pg.wait_for_timeout(300)
        r2 = await pg.evaluate(f"({{ rate: __tg.laborRate(), dot: !!document.querySelector('{ROW('shop.rate')} .sg-dot') }})")
        ok(r2 == {"rate": 210, "dot": False}, f"Reset puts the labor rate back to $210 and the dot goes ({r2})")
        await click(pg, ROW("shop.qc") + ' [data-v="none"]'); await typein(pg, ROW("shop.wa.dealer") + " input", "Acme Trucks"); await pg.wait_for_timeout(300)
        n3 = await pg.evaluate("__tg.SG_REG.filter(e=>e.g==='shop' && __tg.sgChanged(e)).length")
        await click(pg, "[data-action=px-sg-rgroup]")
        armed = await pg.evaluate("(document.querySelector('[data-action=px-sg-rgroup]')||{}).textContent||''")
        await pg.screenshot(path=os.path.join(OUT, "c4_shop_dots.png"))
        await click(pg, "[data-action=px-sg-rgroup]"); await pg.wait_for_timeout(300)
        g = await pg.evaluate("({ n: __tg.SG_REG.filter(e=>e.g==='shop' && __tg.sgChanged(e)).length, qc: __tg.fmCfg().qc, dealer: __tg.waCfg().dealer, pay: __tg.PG.shop().payPer.kind, resets: __tg.STATE().setLog.filter(x=>x.how==='reset').length })")
        ok(n3 == 3 and "Click again" in armed and g["n"] == 0 and g["qc"] == "all" and g["pay"] == "biweekly" and g["dealer"].startswith("Vanguard") and g["resets"] == 4,
           f"Reset this group asks for a second click, then puts all {n3} back (QC, the dealer name, the pay period) ({armed!r}, {g})")
        # ---------------------------------------------------------------- search + the 2 s highlight
        await pg.evaluate(GO("me")); await pg.wait_for_timeout(300)
        await pg.click("[data-sg-q]"); await pg.keyboard.type("gloves"); await pg.wait_for_timeout(300)
        hits = await pg.evaluate("[...document.querySelectorAll('.sg-hit')].map(x=>x.dataset.id)")
        ok(hits[:1] == ["me.size"], f"search by help text: “gloves” finds Size ({hits})")
        await pg.evaluate("__tg.sgQSet('')")
        await pg.evaluate("(()=>{ __tg.waCfg().dealer='Acme Trucks'; __tg.render(); })()")
        await pg.click("[data-sg-q]"); await pg.keyboard.type("acme"); await pg.wait_for_timeout(300)
        hits = await pg.evaluate("[...document.querySelectorAll('.sg-hit')].map(x=>x.dataset.id)")
        ok("shop.wa.dealer" in hits, f"search by value: “acme” finds Name on printouts ({hits})")
        await pg.evaluate("(()=>{ __tg.waCfg().dealer='Vanguard Truck Center · Greensboro'; __tg.sgQSet(''); })()")
        await pg.click("[data-sg-q]"); await pg.keyboard.type("overhead"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "c5_search.png"))
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        h1 = await pg.evaluate(f"({{ sec: __tg.UI().pxSec, hl: !!document.querySelector('{ROW('shop.ovh')}.sg-hl'), q: __tg.UI().sgQ, vis: (()=>{{ const r=document.querySelector('{ROW('shop.ovh')}').getBoundingClientRect(); return r.top>=0 && r.bottom<=innerHeight; }})() }})")
        await pg.screenshot(path=os.path.join(OUT, "c6_jump.png"))
        await pg.wait_for_timeout(2300)
        h2 = await pg.evaluate(f"!!document.querySelector('{ROW('shop.ovh')}.sg-hl')")
        ok(h1["sec"] == "shop" and h1["hl"] and h1["vis"] and h1["q"] == "" and not h2, f"Enter jumps to Monthly overhead in The shop, lit for 2 s, then plain ({h1}, after {h2})")
        # ---------------------------------------------------------------- Recently changed + Undo (only what that change changed)
        await pg.evaluate("__tg.STATE().setLog=[]")
        await pg.evaluate("__tg.sgSet('shop.rate', 240)"); await pg.wait_for_timeout(200)
        await pg.evaluate("__tg.sgOp('people.roles', 'Foreman|acts|p.stock')"); await pg.evaluate("__tg.sgOp('people.roles', 'Foreman|acts|a.data')"); await pg.wait_for_timeout(200)
        await pg.evaluate(GO("recent")); await pg.wait_for_timeout(400)
        rc = await pg.evaluate("[...document.querySelectorAll('.sg-lr')].map(r=>({t:r.querySelector('.x').textContent, w:r.querySelector('.who').textContent, u:!!r.querySelector('[data-action=px-sg-undo]')}))")
        ok(len(rc) == 3 and "Labor rate" in rc[-1]["t"] and "$210 an hour → $240 an hour" in rc[-1]["t"] and rc[-1]["w"].startswith("Admin") and all(x["u"] for x in rc),
           f"Recently changed lists who changed what, newest first, each with Undo ({rc})")
        ok(any("Foreman · Adjust stock counts: off" in x["t"] and "→ on" in x["t"] for x in rc), f"a role change says plainly what changed — Foreman · Adjust stock counts: off → on ({[x['t'] for x in rc[:2]]})")
        await pg.screenshot(path=os.path.join(OUT, "c7_recent.png"))
        lid = await pg.evaluate("__tg.STATE().setLog.filter(x=>x.k==='people.roles')[0].id")
        await click(pg, f'[data-action=px-sg-undo][data-log="{lid}"]'); await pg.wait_for_timeout(300)
        u = await pg.evaluate("({ stock: __tg.permRole('Foreman').acts['p.stock'], data: __tg.permRole('Foreman').acts['a.data'], rate: __tg.laborRate() })")
        ok(u == {"stock": False, "data": True, "rate": 240}, f"Undo on the first role change puts back only that one — the later one and the rate stay ({u})")
        lid2 = await pg.evaluate("__tg.STATE().setLog.filter(x=>x.k==='shop.rate' && x.how==='set')[0].id")
        await click(pg, f'[data-action=px-sg-undo][data-log="{lid2}"]'); await pg.wait_for_timeout(300)
        u2 = await pg.evaluate(f"({{ rate: __tg.laborRate(), done: !!document.querySelector('[data-sg-log=\"{lid2}\"].done'), txt: (document.querySelector('[data-sg-log=\"{lid2}\"]')||{{}}).textContent||'' }})")
        ok(u2["rate"] == 210 and u2["done"] and "Put back by Admin" in u2["txt"], f"Undo puts the labor rate back and the line says who put it back ({u2})")
        await pg.evaluate("__tg.sgOp('people.roles', 'Foreman|acts|a.data')")
        # ---------------------------------------------------------------- read-only for a technician
        await pg.evaluate(SIGNIN(tA)); await pg.wait_for_timeout(500)
        await pg.evaluate(GO("shop")); await pg.wait_for_timeout(400)
        # 17.3: a technician's Settings menus are Me and Shortcuts; The shop opens Me instead
        tm = await pg.evaluate("[[...document.querySelectorAll('.sg-menu .px-it b')].map(e=>e.textContent), document.querySelector('.sg-page').dataset.sgSec]")
        ok(tm == [["Me", "Shortcuts", "Recently changed"], "me"], f"a technician sees Me and Shortcuts only ({tm})")
        # given the menus (Settings menus on their page), the rows they can't change are read-only, as before
        await pg.evaluate(f"(()=>{{ const sf=__tg.staffList().find(s=>s.id==='{tA}'); ['s.shop','s.people','s.data'].forEach(k=>__tg.permSet(sf,'acts',k,true)); __tg.render(); }})()")
        await pg.evaluate(GO("shop")); await pg.wait_for_timeout(400)
        ro = await pg.evaluate(f"(()=>{{ const r=document.querySelector('{ROW('shop.rate')}'); return {{ ro: r.classList.contains('ro'), dis: r.querySelector('input').disabled, txt: (r.querySelector('.sg-ro')||{{}}).textContent||'' }}; }})()")
        ok(ro["ro"] and ro["dis"] and ro["txt"] == "Only the manager can change this", f"a technician sees the labor rate read-only: “Only the manager can change this” ({ro})")
        tried = await pg.evaluate("__tg.sgSet('shop.rate', 300)")
        ok(tried is False and await pg.evaluate("__tg.laborRate()") == 210, "and a change from them does nothing")
        await pg.screenshot(path=os.path.join(OUT, "c8_tech_readonly.png"))
        await pg.evaluate(GO("people")); await pg.wait_for_timeout(300)
        pro = await pg.evaluate("[...document.querySelectorAll('.sg-row')].map(r=>[r.dataset.sgId, r.classList.contains('ro'), (r.querySelector('.sg-ro')||{}).textContent||''])")
        ok(all(x[1] for x in pro if x[0] in ("people.roles", "people.idle", "people.eod")) and any(x[2] == "Only the Admin can change this" for x in pro if x[0] == "people.adminPin"), f"People & access is read-only for them ({pro[:4]})")
        await pg.evaluate(GO("me")); await pg.wait_for_timeout(300)
        mro = await pg.evaluate("[...document.querySelectorAll('.sg-row.ro')].map(r=>r.dataset.sgId)")
        ok(mro == [], f"their own settings are theirs to change ({mro})")
        await pg.evaluate(GO("data")); await pg.wait_for_timeout(300)
        dro = await pg.evaluate("(document.querySelector('#sg-r-data-copies .sg-ro')||{}).textContent||''")
        ok(dro == "Only the Admin can use this", f"Data's export is read-only too ({dro!r})")
        # ---------------------------------------------------------------- the person pop-over
        await pg.evaluate("(()=>{ __tg.STATE().setLog=[]; __tg.UI().pxPop='me'; __tg.render(); })()"); await pg.wait_for_timeout(400)
        po = await pg.evaluate("""(()=>{ const P=document.querySelector('.pxr-pop.me'); if(!P) return null; return { size: P.querySelectorAll('[data-action=px-sg-quick][data-id="me.size"]').length, tips: P.querySelectorAll('.ptip-set [data-ptm]').length,
          theme: P.querySelectorAll('[data-action=px-sg-quick][data-id="me.theme"]').length, all: [...P.querySelectorAll('.px-mi')].map(b=>b.textContent), data: !!P.querySelector('[data-s="data"]'), keys: !!P.querySelector('[data-action="open-shortcuts"]') }; })()""")
        ok(po and po["size"] == 3 and po["tips"] == 3 and po["theme"] == 4 and any(t.startswith("All settings…") for t in po["all"]) and not po["data"] and not po["keys"],
           f"the pop-over keeps Size, Tooltips, Theme and All settings… — Your data and Keyboard shortcuts are inside Settings ({po})")
        await pg.screenshot(path=os.path.join(OUT, "c9_popover.png"))
        await click(pg, '.pxr-pop.me [data-action=px-sg-quick][data-id="me.theme"][data-v="ivd"]'); await pg.wait_for_timeout(300)
        await pg.click(".ptip-set [data-ptm=off]"); await pg.wait_for_timeout(300)
        q = await pg.evaluate("({ t: document.documentElement.getAttribute('data-theme'), open: !!document.querySelector('.pxr-pop.me'), tips: __tg.ptipMode(), log: __tg.STATE().setLog.map(x=>x.k+':'+x.toT+':'+x.by) })")
        ok(q["t"] == "ivd" and q["open"] and q["tips"] == "off" and len(q["log"]) == 2 and all(":" in x for x in q["log"]), f"the theme and the tooltips change from the pop-over, it stays open, and both go in Recently changed ({q})")
        await pg.screenshot(path=os.path.join(OUT, "c10_popover_dark.png"))
        await click(pg, '.pxr-pop.me [data-action=px-sg-quick][data-id="me.theme"][data-v="ivl"]'); await pg.evaluate("__tg.ptipSetMode('all')")
        await click(pg, '.pxr-pop.me .px-mi[data-action="px-profile"]'); await pg.wait_for_timeout(300)
        a = await pg.evaluate("({ v: __tg.UI().view, s: __tg.UI().pxSec, pop: __tg.UI().pxPop })")
        ok(a["v"] == "profile" and a["s"] == "me" and not a["pop"], f"All settings… opens Settings at Me ({a})")
        await pg.evaluate(ADMIN); await pg.wait_for_timeout(400)
        # ---------------------------------------------------------------- the old places link in
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='manager'; __tg.render(); })()"); await pg.wait_for_timeout(700)
        await click(pg, '[data-pg="manager"] [data-a="pop"][data-p="set"]'); await pg.wait_for_timeout(400)
        mg = await pg.evaluate("[...document.querySelectorAll('.sg-link')].map(x=>x.textContent)")
        ok(any("Settings › The shop" in x for x in mg) and not await pg.evaluate("!!document.querySelector('[data-set=\"rate\"]')"), f"Manager → Shop settings: a short link, no fields ({mg[:1]})")
        await pg.screenshot(path=os.path.join(OUT, "c11_manager_link.png"))
        await click(pg, '.sg-link [data-action="px-sg-go"][data-id="shop.rate"]'); await pg.wait_for_timeout(400)
        lk = await pg.evaluate(f"({{ v: __tg.UI().view, s: __tg.UI().pxSec, hl: !!document.querySelector('{ROW('shop.rate')}.sg-hl') }})")
        ok(lk == {"v": "profile", "s": "shop", "hl": True}, f"its Open goes to Settings › The shop and lights the labor rate ({lk})")
        places = []
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='foreman'; U.fmPop=null; __tg.render(); })()"); await pg.wait_for_timeout(700)
        await click(pg, '[data-action="fm-pop"][data-p="cfg"]'); await pg.wait_for_timeout(400)
        places.append(("Foreman settings", await pg.evaluate("[...document.querySelectorAll('.sg-link')].map(x=>x.textContent).join(' | ')"), await pg.evaluate("document.querySelectorAll('[data-fm-in^=\"c-\"], [data-action=\"fm-cfg\"]').length")))
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.fmPop=null; U.view='warranty'; U.waPop=null; __tg.render(); })()"); await pg.wait_for_timeout(700)
        await click(pg, '[data-action="wa-pop"][data-p="cfg"]'); await pg.wait_for_timeout(400)
        places.append(("Warranty settings", await pg.evaluate("[...document.querySelectorAll('.sg-link')].map(x=>x.textContent).join(' | ')"), await pg.evaluate("document.querySelectorAll('[data-wa-cfg]').length")))
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.waPop=null; U.view='parts'; __tg.render(); })()"); await pg.wait_for_timeout(700)
        await click(pg, '[data-pg="parts"] [data-a="view"][data-v="setup"]'); await pg.wait_for_timeout(400)
        places.append(("Parts setup", await pg.evaluate("[...document.querySelectorAll('.sg-link')].map(x=>x.textContent).join(' | ')"), await pg.evaluate("document.querySelectorAll('[data-pg=\"parts\"] [data-in=\"set\"], [data-a=\"rulem\"]').length")))
        await click(pg, '[data-pg="parts"] [data-a="view"][data-v="desk"]')
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='admin'; __tg.render(); })()"); await pg.wait_for_timeout(700)
        pane = await pg.evaluate("({ link: [...document.querySelectorAll('[data-pg=admin] .adm-pane .sg-link')].map(x=>x.textContent).join(' | '), role: document.querySelectorAll('[data-pg=admin] [data-ch=role]').length, pages: document.querySelectorAll('[data-pg=admin] .adm-pc').length, acts: document.querySelectorAll('[data-pg=admin] [data-a=act]').length, reset: document.querySelectorAll('[data-pg=admin] [data-a=reset]').length })")
        ok(pane["role"] == 1 and await pg.evaluate("document.querySelectorAll('[data-pg=admin] .adm-pcard .adm-tab').length === 3"), f"17.3: Admin › a person is their page — role, pages and actions are there, not in Settings ({pane})")
        ok(pane["reset"] > 0, "the Admin page keeps people jobs — the PIN reset is still there")
        await pg.screenshot(path=os.path.join(OUT, "c12_admin_person.png"))
        await click(pg, '[data-pg="admin"] [data-a="view"][data-v="roles"]'); await pg.wait_for_timeout(300)
        places.append(("Admin › Roles", await pg.evaluate("[...document.querySelectorAll('[data-pg=admin] .sg-link')].map(x=>x.textContent).join(' | ')"), await pg.evaluate("document.querySelectorAll('[data-pg=admin] [data-a=rx]').length")))
        await click(pg, '[data-pg="admin"] [data-a="view"][data-v="rules"]'); await pg.wait_for_timeout(300)
        places.append(("Admin › Sign-in rules", await pg.evaluate("[...document.querySelectorAll('[data-pg=admin] .sg-link')].map(x=>x.textContent).join(' | ')"), await pg.evaluate("document.querySelectorAll('[data-pg=admin] [data-ch=idle], [data-pg=admin] [data-a=eod]').length")))
        await click(pg, '[data-pg="admin"] [data-a="view"][data-v="people"]'); await click(pg, '[data-pg="admin"] [data-a="sel"][data-id="__admin"]'); await pg.wait_for_timeout(300)
        places.append(("Admin › the Admin PIN", await pg.evaluate("[...document.querySelectorAll('[data-pg=admin] .sg-link')].map(x=>x.textContent).join(' | ')"), await pg.evaluate("document.querySelectorAll('[data-pg=admin] [data-in=ap1]').length")))
        for nm, txt, left in places:
            ok("are in Settings ›" in txt and left == 0, f"{nm}: a short link into Settings, no controls left ({txt[:90]!r}, {left} left)")
        await pg.evaluate("(()=>{ const b=document.createElement('button'); b.dataset.action='open-automations'; document.body.appendChild(b); b.click(); b.remove(); })()"); await pg.wait_for_timeout(400)
        au = await pg.evaluate("({ v: __tg.UI().view, s: __tg.UI().pxSec, modal: !!__tg.UI().modal, page: !!document.querySelector('.sg-page .ap-page, .sg-page [data-sg-id=\"auto.mode\"]') })")
        ok(au == {"v": "profile", "s": "auto", "modal": False, "page": True}, f"Automations opens Settings › Automations, with the Automations page in it ({au})")
        await pg.screenshot(path=os.path.join(OUT, "c13_automations.png"))
        ok('data-id="shop.tpl">Edit in Settings…' in src and 'data-action="tg-tpled"' not in src, "Triage’s Edit templates link goes to Settings › The shop")
        app = await pg.evaluate("(()=>{ const d=document.createElement('div'); d.innerHTML=__tg.UI && document.querySelector('.hdr-gear') ? document.querySelector('.hdr-gear').innerHTML : ''; return d.innerHTML; })()")
        ok("sz-b" not in src[src.find("function settingsHtml(){"):src.find("function settingsHtml(){") + 2500] and "All settings…" in src[src.find("function settingsHtml(){"):src.find("function settingsHtml(){") + 2500], "the app menu has All settings… and no settings of its own")
        # ---------------------------------------------------------------- the phone
        ctx2 = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        p2 = await ctx2.new_page(); await p2.route("**/fonts.g*/**", lambda r: r.abort())
        await p2.goto("file://" + H + "/" + PAGE); await p2.wait_for_timeout(1200)
        await p2.evaluate("__tg.loadSample25()"); await p2.evaluate("__tg.ensureDemoTeam()")
        await p2.evaluate("(()=>{ localStorage.setItem('tec_device','phone'); })()"); await p2.reload(); await p2.wait_for_timeout(1200)
        await p2.evaluate(GO("shop")); await p2.wait_for_timeout(600)
        ph = await p2.evaluate("""(()=>{ const it=[...document.querySelectorAll('.sg-nav .px-it')]; const r=it.map(x=>x.getBoundingClientRect()); const doc=document.querySelector('.sg-doc').getBoundingClientRect();
          return { dev: document.documentElement.getAttribute('data-device'), row: r.length>2 && Math.abs(r[0].top-r[1].top)<2 && r[1].left>r[0].left, above: r.length && r[0].bottom <= doc.top + 2, wide: document.documentElement.scrollWidth <= innerWidth + 1 }; })()""")
        ok(ph["dev"] == "phone" and ph["row"] and ph["above"] and ph["wide"], f"on a phone the menu is a list across the top, above the settings, no sideways scroll ({ph})")
        await p2.screenshot(path=os.path.join(OUT, "c14_phone_light.png"))
        await p2.evaluate("__tg.applyTheme('ivd')"); await p2.evaluate(GO("people")); await p2.wait_for_timeout(500)
        await p2.screenshot(path=os.path.join(OUT, "c15_phone_dark.png"))
        await p2.evaluate("__tg.applyTheme('ivl')"); await ctx2.close()
        # ---------------------------------------------------------------- a couple more light / dark views
        for th, g in (("ivl", "data"), ("ivd", "shop"), ("ivd", "recent")):
            await pg.evaluate(f"__tg.applyTheme('{th}')"); await pg.evaluate(GO(g)); await pg.wait_for_timeout(500)
            await pg.screenshot(path=os.path.join(OUT, f"c16_{g}_{th}.png"))
        await pg.evaluate("__tg.applyTheme('ivl')")
        ok(not errs, f"no console errors ({errs[:3]})")
        await b.close()
    print("FAILS", len(FAILS))
asyncio.run(main())
