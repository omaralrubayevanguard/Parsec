import asyncio, json, os, datetime, sys, base64
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); SH = os.path.join(H, "shots8w"); os.makedirs(SH, exist_ok=True)
PNG = os.path.join(H, "_t.png")
open(PNG, "wb").write(base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEklEQVR4nGP4z8CAFWEXHbQSACj/P8Fu7N9hAAAAAElFTkSuQmCC"))

SNAP = r"""(name=>{ const S=__tg.S(), r=S.ros.find(x=>x.customerName===name); if(!r) return null;
 return JSON.stringify({route:r.route&&[r.route.to,r.route.who,r.route.state,r.route.reason], snz:!!r.waSnz, away:r.waAway&&r.waAway.to, vol:r.waVol||null, ws:r.warrantyStart, vin:r.vin,
  ops:__tg.wcOps(r).map(o=>{ const c=o.claim||{}; return [__tg.wcStatus(r,o), c.claimNo||'', c.paid||'', c.short?[c.short.amt,c.short.why,c.short.dec||'']:null, c.ask?[c.ask.who,c.ask.what.join(',')]:null, c.causal||'', c.srtHrs||'', c.laborHrs||'', c.srtWhy||'', c.appeal||'', c.dec||'', c.cov||'', c.pa||'', (o.parts||[]).map(p=>p.fp?[p.fp.tag,p.fp.shelf,p.fp.done||'',p.fp.keep]:null)]; }),
  files:(r.bulletins||[]).map(b=>b.task+':'+(b.files||[]).length).join(' ')}); })"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}, accept_downloads=True); pg = await ctx.new_page(); errs = []
        await ctx.grant_permissions(["clipboard-read", "clipboard-write"])
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "ERR_TUNNEL" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.goto("file://" + H + "/t8.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(400)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='warranty'; U.modal=null; U.toast=null; U.waView='claims'; __tg.render();})()"); await pg.wait_for_timeout(500)
        rid = lambda name: pg.evaluate(f"(__tg.S().ros.find(x=>x.customerName==={json.dumps(name)})||{{}}).id")
        async def ui(js, wait=200):
            await pg.evaluate("(()=>{const U=__tg.UI();" + js + ";__tg.waNcClear();__tg.render();})()"); await pg.wait_for_timeout(wait)
        async def key(k, wait=260):
            await pg.keyboard.press(k); await pg.wait_for_timeout(wait)
        async def click(sel, wait=260):
            await pg.click(sel); await pg.wait_for_timeout(wait)
        snap = lambda n: pg.evaluate(SNAP + "(" + json.dumps(n) + ")")
        pop = lambda: pg.evaluate("(__tg.UI().waPop||{}).type||null")
        toast = lambda: pg.evaluate("__tg.UI().toast||''")
        res = []
        async def check_undo(name, cust, b0, extra=""):
            a = await snap(cust); t = await toast()
            await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(250); u = await snap(cust)
            ok = a != b0 and u == b0
            res.append((name, a != b0, u == b0, t[:120], extra))
            if not ok: print("   B", b0, "\n   A", a, "\n   U", u)
            await ui("U.waPop=null;U.toast=null")
        async def sel(cust):
            r = await rid(cust); await ui(f"U.waSel='{r}'; U.waPop=null; U.toast=null; U.waOp=null"); return r

        # 1. accept something sent to Warranty (route it here first)
        r = await rid("Prairie Line Trucking")
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{r}'); __tg.rtSend(r,'warranty',null,'Tech support case — NOx sensor','',{{reason:'Tech support case'}}); __tg.render(); }})()"); await pg.wait_for_timeout(300)
        g = await pg.evaluate(f"(__tg.waNeedsAll().find(x=>x.ro.id==='{r}')||{{}}).g")
        await sel("Prairie Line Trucking"); await pg.screenshot(path=f"{SH}/f01_sent.png")
        b0 = await snap("Prairie Line Trucking"); await key("Enter"); await check_undo("accept sent (" + str(g) + ")", "Prairie Line Trucking", b0)

        # 2. file a claim: fix the packet (causal part, tag, upload a part photo), copy, file with a claim #
        cust = "Midway Auto Transport"; r = await sel(cust); b0 = await snap(cust)
        await key("Enter"); print("file pop:", await pop()); await pg.screenshot(path=f"{SH}/f02_file.png")
        await click('.wa .tg-pop [data-action="wa-fix"][data-fix="causal"]'); print("causal pop:", await pop()); await pg.screenshot(path=f"{SH}/f03_causal.png")
        await key("2"); await key("Enter"); print("back to:", await pop(), await toast())
        await click('.wa .tg-pop [data-action="wa-fix"][data-fix="tag"]'); print("tag pop:", await pop()); await pg.screenshot(path=f"{SH}/f04_tag.png")
        await key("Enter"); print("back to:", await pop(), await toast())
        async with pg.expect_file_chooser() as fc:
            await pg.click('.wa .tg-pop [data-action="wa-fix"][data-fix="upload:pics"]')
        ch = await fc.value; await ch.set_files(PNG); await pg.wait_for_timeout(800)
        print("after upload:", await pop(), await toast())
        await pg.screenshot(path=f"{SH}/f05_file_ready.png")
        await key("c"); print("copy pop:", await pop()); await key("Enter"); await key("Enter")
        cp = await pg.evaluate("JSON.stringify([(__tg.UI().waPop||{}).copied,(__tg.UI().waPop||{}).k])"); clip = await pg.evaluate("navigator.clipboard.readText().catch(e=>'ERR '+e)")
        print("copied:", cp, "clipboard:", clip); await pg.screenshot(path=f"{SH}/f06_copy.png")
        await click('.wa .tg-pop [data-action="wa-back"]'); print("back:", await pop())
        print("  gaps:", await pg.evaluate(f"JSON.stringify(__tg.waGaps(__tg.getRO('{r}'), __tg.wcOps(__tg.getRO('{r}'))[0]).map(x=>x.t))"))
        await pg.fill('.wa .tg-pop [data-wa-in="p:cn"]', "W2690001"); await key("Enter")
        a = await snap(cust); print("filed:", a); res.append(("file claim", '"submitted","W2690001"' in a, None, await toast(), ""))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(250); u = await snap(cust); print("undo file ->", json.loads(u)["ops"][0][0])

        # 3. returned: decide → appeal with a note
        cust = "Highplains Grain"; await sel(cust); b0 = await snap(cust)
        await key("Enter"); print("decide pop:", await pop()); await pg.screenshot(path=f"{SH}/f07_decide.png")
        await key("2"); print("  after 2:", await pg.evaluate("JSON.stringify(__tg.UI().waPop)"), await pg.evaluate("document.activeElement.tagName"))
        await pg.keyboard.type("Photo attached; the extra 0.3 h was seized bolts"); await pg.keyboard.press("Tab"); await pg.wait_for_timeout(100)
        print("  before go:", await pg.evaluate("JSON.stringify(__tg.UI().waPop)"))
        await click('.wa .tg-pop [data-action="wa-go"]'); print("  after go:", await pg.evaluate("JSON.stringify(__tg.UI().waPop)"), await toast()); await check_undo("decide appeal", cust, b0)
        # 3b. write off over the limit → the manager signs off
        await sel(cust); b0 = await snap(cust); await key("Enter"); await key("5"); await pg.wait_for_timeout(100); await click('.wa .tg-pop [data-action="wa-go"]')
        await check_undo("decide write-off → manager", cust, b0)
        # 3c. SRT: claim the SRT hours
        await sel(cust); b0 = await snap(cust); await click('.wa .wa-op [data-action="wa-fix"][data-fix="srt"]'); print("srt pop:", await pop()); await pg.screenshot(path=f"{SH}/f08_srt.png")
        await key("1"); await key("Enter"); await check_undo("SRT claim the SRT", cust, b0)
        await sel(cust); b0 = await snap(cust); await click('.wa .wa-op [data-action="wa-fix"][data-fix="srt"]'); await key("2"); await click('.wa .tg-pop [data-action="wa-set"][data-f="why"]'); await key("Enter")
        await check_undo("SRT claim with a reason", cust, b0)
        await sel(cust); b0 = await snap(cust); await click('.wa .wa-op [data-action="wa-fix"][data-fix="srt"]'); await key("3"); await key("Enter")
        await check_undo("SRT ask Volvo", cust, b0)
        # 3d. coverage pick
        await sel(cust); b0 = await snap(cust); await click('.wa .wa-op [data-action="wa-fix"][data-fix="cov"]'); print("cov pop:", await pop()); await pg.screenshot(path=f"{SH}/f09_cov.png")
        await key("2"); await check_undo("coverage → engine", cust, b0)

        # 4. Waiting on Volvo: follow up → called
        cust = "Silverline LTL"; await sel(cust); b0 = await snap(cust); x = await pg.evaluate(f"(__tg.waItemOf('{await rid(cust)}')||{{}}).g")
        await key("Enter"); print("follow pop:", await pop(), x); await pg.screenshot(path=f"{SH}/f10_follow.png"); await key("1"); await key("Enter")
        await check_undo("follow up · called", cust, b0)
        # 4b. approved → mark paid short
        await sel(cust); b0 = await snap(cust)
        await click('.wa .wa-op [data-action="wa-pop"][data-p="paid"]'); print("paid pop:", await pop())
        await pg.fill("#wa-pd", "300"); await pg.wait_for_timeout(100); await key("Enter"); print("need why:", await pg.evaluate("!!(__tg.UI().waPop||{}).need"))
        await click('.wa .tg-pop [data-action="wa-set"][data-f="why"]'); await pg.screenshot(path=f"{SH}/f11_paid.png"); await key("Enter")
        a = await snap(cust); print("paid short:", json.loads(a)["ops"])
        # then decide the short pay: accept
        x = await pg.evaluate(f"(__tg.waItemOf('{await rid(cust)}')||{{}}).g"); print("item now:", x)
        b1 = a; await click('.wa .wa-op [data-action="wa-pop"][data-p="short"]'); await key("1"); await key("Enter")
        await check_undo("short pay accept", cust, b1)
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(250); u = await snap(cust); res.append(("mark paid short (undo)", True, u == b0, "", ""))

        # 5. failed part: ship with tracking
        cust = "Northline Transport"; await sel(cust); b0 = await snap(cust); await key("Enter"); print("part pop:", await pop()); await key("1")
        await pg.keyboard.type("1Z999AA10123456784"); await key("Enter"); await check_undo("ship failed part", cust, b0)

        # 6. ask the tech (clear the correction on an approved op? use the repair op made done)
        cust = "Red Mesa Hauling"; r = await rid(cust)
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{r}'); const op=__tg.wcOps(r)[0]; op.jobStatus={{status:'Complete', setAt:new Date().toISOString(), hand:true}}; __tg.render(); }})()"); await pg.wait_for_timeout(200)
        x = await pg.evaluate(f"JSON.stringify(__tg.waItemOf('{r}')&&[__tg.waItemOf('{r}').g,__tg.waItemOf('{r}').why])"); print("red mesa item:", x)
        await sel(cust); b0 = await snap(cust); await key("Enter"); print("ask pop:", await pop()); await pg.screenshot(path=f"{SH}/f12_ask.png"); await key("Enter")
        a = await snap(cust); print("asked:", a); x = await pg.evaluate(f"JSON.stringify(__tg.waItemOf('{r}')&&[__tg.waItemOf('{r}').g,__tg.waItemOf('{r}').why,__tg.waItemOf('{r}').btn])"); print("item:", x)
        await key("Enter"); print("nudge toast:", await toast())
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(200); await check_undo("ask the tech", cust, b0)

        # 7. send to (T) and wake
        cust = "Midway Auto Transport"; r = await sel(cust); b0 = await snap(cust); await key("t"); print("xfer:", await pop()); await key("3"); await key("1"); await pg.screenshot(path=f"{SH}/f13_xfer.png"); await key("Enter")
        hid = await pg.evaluate(f"!__tg.waFlat().includes('{r}')"); print("hidden after send:", hid, await toast())
        await ui("U.waOpen={snz:true}"); await pg.screenshot(path=f"{SH}/f14_away.png")
        await check_undo("send to parts", cust, b0, "hidden" if hid else "VISIBLE")
        # 8. snooze
        r = await sel(cust); b0 = await snap(cust); await key("s"); await key("2"); hid = await pg.evaluate(f"!__tg.waFlat().includes('{r}')")
        await check_undo("snooze", cust, b0, "hidden" if hid else "VISIBLE")
        # 9. add a field (warranty start) from the packet
        cust = "Copperline Transport"; r = await sel(cust); b0 = await snap(cust)
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{r}'); r.warrantyStart=''; __tg.render(); }})()"); b0 = await snap(cust)
        await ui(""); fx = await pg.query_selector('.wa .wa-op [data-action="wa-fix"][data-fix="field:ws"]'); print("ws fix button:", bool(fx))
        if fx:
            await fx.click(); await pg.wait_for_timeout(250); print("field pop:", await pop(), await pg.evaluate("document.activeElement && document.activeElement.dataset.waIn"))
            await pg.keyboard.type("03-15-2025"); await key("Enter"); await check_undo("add warranty start", cust, b0)

        # 10. payment statement: paste, match, mark paid
        await ui("U.waStmt=null"); await click('.wa [data-action="wa-stmt"]'); rows = await pg.evaluate("JSON.stringify(__tg.waStmtRows().map(x=>[x.op.claim.claimNo, x.op.claim.amount]))"); print("stmt rows:", rows)
        R = json.loads(rows); cn = R[0][0] if R else "W0"
        await pg.fill("#wa-stp", f"VOLVO CREDIT MEMO CM-88444\n{cn}  RO 1234  {float(R[0][1] or 100)-25:.2f}\nW9999999  RO 77  120.00\nTOTAL  {float(R[0][1] or 100)-25:.2f}")
        await click('.wa [data-action="wa-stmatch"]'); st = await pg.evaluate("JSON.stringify((({no,total,hit,miss,on,amt})=>({no,total,hit,miss,on,amt}))(__tg.UI().waStmt))"); print("matched:", st)
        await pg.screenshot(path=f"{SH}/f15_stmt.png")
        cust = await pg.evaluate(f"__tg.S().ros.find(r=>__tg.wcOps(r).some(o=>(o.claim||{{}}).claimNo==='{cn}')).customerName"); b0 = await snap(cust)
        await click('.wa [data-action="wa-stgo"]'); await check_undo("statement → paid", cust, b0)

        # 11. print packet (stub the print dialog)
        cust = "Highplains Grain"; await sel(cust); await key("p"); await pg.wait_for_timeout(400); await pg.screenshot(path=f"{SH}/f16_print.png")
        await pg.evaluate("window.print=()=>{}"); await click('.wa [data-action="wa-pvprint"]', 800)
        lp = await pg.evaluate("JSON.stringify(__tg.lastPrint())"); fr = await pg.evaluate("(()=>{const f=document.getElementById('wa-pfr'); return f? f.contentDocument.body.innerText.slice(0,160):null})()"); print("print:", lp, "|", fr)
        await key("Escape")
        # 12. CSV export
        await ui("U.waView='money'")
        async with pg.expect_download() as dl:
            await pg.click('.wa [data-action="wa-csv"]')
        d = await dl.value; pth = await d.path(); txt = open(pth, encoding="utf-8-sig").read(); print("csv:", d.suggested_filename, txt.splitlines()[0][:80], len(txt.splitlines()))
        # tooltip
        await pg.hover('.wa .wa-svg rect.hit >> nth=5'); await pg.wait_for_timeout(150); tip = await pg.evaluate("(()=>{const t=document.querySelector('.wa .wa-tip'); return t && !t.hidden ? t.textContent : null})()"); print("tip:", tip)
        await pg.screenshot(path=f"{SH}/f17_money_tip.png")
        # 13. search
        await ui("U.waView='claims'"); await key("/"); await pg.keyboard.type("W26"); await pg.wait_for_timeout(200); n = await pg.evaluate("document.querySelectorAll('.wa .tg-srpop .tg-sr').length"); await pg.screenshot(path=f"{SH}/f18_search.png"); await key("Enter")
        print("search rows:", n, "sel:", await pg.evaluate("__tg.getRO(__tg.UI().waSel).customerName"))
        # 14. settings persist + parts tag print + shortcuts sheet
        await click('.wa [data-action="wa-pop"][data-p="cfg"]'); await pg.screenshot(path=f"{SH}/f19_cfg.png"); await pg.fill('.wa [data-wa-cfg="file"]', "45"); await key("Tab"); print("cfg file:", await pg.evaluate("__tg.waCfg().file"))
        await key("Escape"); await key("?"); print("modal:", await pg.evaluate("(__tg.UI().modal||{}).type"), await pg.evaluate("(document.querySelector('.modal h2, .modal .modal-title')||{}).textContent")); await key("Escape")
        await ui("U.modal=null; U.waView='parts'"); await pg.click('.wa [data-action="wa-ptags"]'); await pg.wait_for_timeout(500); print("tags print:", await pg.evaluate("JSON.stringify(__tg.lastPrint())"))
        await pg.screenshot(path=f"{SH}/f20_parts.png")
        # 15. the badge on another page, and the RO page's link back
        await ui("U.view='triage'"); bd = await pg.evaluate("(()=>{const b=[...document.querySelectorAll('[data-view=warranty], [data-nav=warranty]')].map(e=>e.textContent.trim()); return JSON.stringify(b)})()"); print("badge on triage:", bd, await pg.evaluate("__tg.wcNeedCount()"))
        r = await rid("Silverline LTL"); await ui(f"U.view='warranty'; U.wcRo='{r}'; U.waView='money'"); print("wcRo link:", await pg.evaluate("__tg.getRO(__tg.UI().waSel).customerName"), await pg.evaluate("__tg.UI().waView"))
        print("\nRESULTS"); [print(("OK  " if (x[1] and x[2] is not False) else "BAD ") + x[0], "| changed", x[1], "| undo", x[2], "|", x[3], x[4]) for x in res]
        print("\n".join(errs[:20]))
        await b.close()
asyncio.run(main())
